import { Request, Response } from 'express';
import { getDatabase, saveDatabase } from '../../config/db';
import { Problem, StatusLog } from '../../models/types';
import { classifyProblem, generateEmbedding } from '../classification/classificationService';
import { deduplicateAndCluster, matchUniversityDepartment } from '../routing/routingService';
import { dispatchNotification } from '../notification/notificationService';
import { jobQueue } from '../../config/queue';
import { AuthenticatedRequest } from '../../middleware/auth';

export async function submitProblem(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      title,
      description,
      district,
      ward,
      state,
      latitude,
      longitude,
      language,
      photo_url
    } = req.body;

    if (!title || !description || !district) {
      return res.status(400).json({ error: 'Title, description, and district are mandatory.' });
    }

    const citizen = req.user;
    const citizenId = citizen ? citizen.id : 'anonymous_citizen';
    const citizenName = citizen ? citizen.name : 'Anonymous Citizen';

    // 1. Instantly create preliminary record to unblock citizen
    const problemId = 'prob_' + Math.random().toString(36).substring(2, 9);
    const newProblem: Problem = {
      id: problemId,
      citizen_id: citizenId,
      citizen_name: citizenName,
      title,
      description,
      category: 'Water & Sanitation', // initial placeholder before async job runs
      ai_confidence: 0.85,
      district,
      ward: ward || 'Ward 1',
      state: state || 'Jharkhand',
      latitude: latitude ? parseFloat(latitude) : 23.3441,
      longitude: longitude ? parseFloat(longitude) : 85.3096,
      photo_url: photo_url || undefined,
      status: 'Submitted',
      severity_score: 50,
      affected_citizens_count: Math.floor(Math.random() * 30) + 10,
      recommended_department: 'Interdisciplinary Innovation Cell',
      routing_rationale: 'Processing through AI auto-routing pipeline...',
      language: language || 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const db = getDatabase();
    db.problems.unshift(newProblem);

    // Add status audit log
    const statusLog: StatusLog = {
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      problem_id: problemId,
      old_status: 'None',
      new_status: 'Submitted',
      changed_by_user_id: citizenId,
      changed_by_name: citizenName,
      role: citizen ? citizen.role : 'citizen',
      notes: 'Initial citizen intake via multimodal submission form.',
      created_at: new Date().toISOString()
    };
    db.status_logs.push(statusLog);
    saveDatabase();

    // 2. Offload AI classification, pgvector semantic deduplication, and routing to Async Worker Queue
    await jobQueue.add('PROCESS_PROBLEM_SUBMISSION', { problemId });

    // 3. Instant response to citizen (non-blocking)
    return res.status(201).json({
      success: true,
      message: 'Problem submitted successfully! AI classification and routing are executing asynchronously.',
      problem: newProblem,
      jobQueueStatus: 'enqueued'
    });
  } catch (error) {
    console.error('Error submitting problem:', error);
    return res.status(500).json({ error: 'Failed to submit problem.' });
  }
}

// Background Worker Processor for problem classification & routing
export async function processProblemSubmissionWorker(data: { problemId: string }) {
  const db = getDatabase();
  const problem = db.problems.find(p => p.id === data.problemId);
  if (!problem) return;

  // A. Classification
  const classification = classifyProblem(problem.title, problem.description);
  problem.category = classification.category;
  problem.ai_confidence = classification.confidence;
  problem.severity_score = classification.severityScore;

  // B. Vector Embedding Generation (pgvector simulation)
  const embedding = generateEmbedding(`${problem.title} ${problem.description} ${problem.category} ${problem.district}`);
  problem.embedding_vector = embedding;

  // C. University Department Matching
  problem.recommended_department = matchUniversityDepartment(problem.category);

  // D. Semantic Deduplication & Cluster Matching
  const clusterResult = deduplicateAndCluster(problem);
  problem.cluster_id = clusterResult.clusterId;
  problem.routing_rationale = clusterResult.routingRationale;
  problem.status = 'Classified';
  problem.updated_at = new Date().toISOString();

  // E. Record Status Log
  db.status_logs.push({
    id: 'log_' + Math.random().toString(36).substring(2, 9),
    problem_id: problem.id,
    old_status: 'Submitted',
    new_status: 'Classified',
    changed_by_user_id: 'system_ai_agent',
    changed_by_name: 'SamadhanSetu AI Routing Engine',
    role: 'system',
    notes: `Classified as "${problem.category}" (${(problem.ai_confidence * 100).toFixed(0)}% confidence). Routed to ${problem.recommended_department}.`,
    created_at: new Date().toISOString()
  });

  // F. Multi-channel Notification Fan-out to Citizen
  dispatchNotification({
    userId: problem.citizen_id,
    title: 'Report Verified & AI Routed',
    message: `Your report "${problem.title}" has been AI classified into "${problem.category}" and auto-routed to ${problem.recommended_department} for university research review.`,
    channels: ['in-app', 'sms', 'whatsapp'],
    payload: { problemId: problem.id, category: problem.category }
  });

  saveDatabase();
  console.log(`[Worker Pipeline Success] Problem ${problem.id} classified, clustered, and routed successfully.`);
}

export function getProblems(req: Request, res: Response) {
  const db = getDatabase();
  const { category, district, status, citizenId } = req.query;

  let list = [...db.problems];

  if (category && category !== 'all') {
    list = list.filter(p => p.category === category);
  }
  if (district && district !== 'all') {
    list = list.filter(p => p.district.toLowerCase() === String(district).toLowerCase());
  }
  if (status && status !== 'all') {
    list = list.filter(p => p.status === status);
  }
  if (citizenId) {
    list = list.filter(p => p.citizen_id === citizenId);
  }

  return res.json({ success: true, count: list.length, problems: list });
}

export function getProblemById(req: Request, res: Response) {
  const db = getDatabase();
  const problem = db.problems.find(p => p.id === req.params.id);
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found.' });
  }

  const adoption = db.adoptions.find(a => a.problem_id === problem.id);
  const support = db.industry_supports.filter(s => s.problem_id === problem.id);
  const mou = db.mou_agreements.find(m => m.problem_id === problem.id);
  const logs = db.status_logs.filter(l => l.problem_id === problem.id);

  return res.json({
    success: true,
    problem,
    adoption,
    industrySupports: support,
    mouAgreement: mou,
    statusLogs: logs
  });
}

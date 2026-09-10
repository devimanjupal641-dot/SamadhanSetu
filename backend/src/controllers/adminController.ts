import { Request, Response } from 'express';
import { getDatabase, saveDatabase } from '../config/db';
import { ProblemCategory, StatusLog, Problem, Notification } from '../models/types';
import { AuthenticatedRequest } from '../middleware/auth';
import { matchUniversityDepartment } from '../services/routing/routingService';

export function getAdminAnalytics(req: Request, res: Response) {
  const db = getDatabase();

  // District-wise problem breakdown
  const districtCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};

  let totalAffectedCitizens = 0;

  for (const prob of db.problems) {
    districtCounts[prob.district] = (districtCounts[prob.district] || 0) + 1;
    categoryCounts[prob.category] = (categoryCounts[prob.category] || 0) + 1;
    statusCounts[prob.status] = (statusCounts[prob.status] || 0) + 1;
    totalAffectedCitizens += prob.affected_citizens_count || 0;
  }

  // Institutional Participation
  const universityParticipation: Record<string, number> = {};
  for (const adopt of db.adoptions) {
    universityParticipation[adopt.university_name] = (universityParticipation[adopt.university_name] || 0) + 1;
  }

  // Industry CSR Commitment Aggregation
  let totalCommittedFunding = 0;
  const industryParticipation: Record<string, { count: number; totalInr: number }> = {};
  for (const ind of db.industry_supports) {
    if (!industryParticipation[ind.industry_name]) {
      industryParticipation[ind.industry_name] = { count: 0, totalInr: 0 };
    }
    industryParticipation[ind.industry_name].count += 1;
    industryParticipation[ind.industry_name].totalInr += ind.amount_inr || 0;
    totalCommittedFunding += ind.amount_inr || 0;
  }

  // Notification metrics
  const notifStats = {
    total: db.notifications.length,
    inAppDelivered: db.notifications.filter((n: Notification) => n.channel === 'in-app').length,
    smsDispatched: db.notifications.filter((n: Notification) => n.channel === 'sms').length,
    whatsappSimulated: db.notifications.filter((n: Notification) => n.channel === 'whatsapp').length
  };

  return res.json({
    success: true,
    analytics: {
      totalProblems: db.problems.length,
      totalCitizensAffected: totalAffectedCitizens,
      totalClusters: db.clusters.length,
      totalAdoptions: db.adoptions.length,
      totalCommittedFundingINR: totalCommittedFunding,
      districtBreakdown: districtCounts,
      categoryBreakdown: categoryCounts,
      statusBreakdown: statusCounts,
      universityParticipation,
      industryParticipation,
      notificationMetrics: notifStats
    }
  });
}

export function overrideClassification(req: AuthenticatedRequest, res: Response) {
  try {
    const { problemId, newCategory, overrideReason } = req.body;
    const admin = req.user!;

    const db = getDatabase();
    const problem = db.problems.find((p: Problem) => p.id === problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }

    const oldCategory = problem.category;
    problem.category = newCategory as ProblemCategory;
    problem.recommended_department = matchUniversityDepartment(problem.category);
    problem.updated_at = new Date().toISOString();

    const log: StatusLog = {
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      problem_id: problemId,
      old_status: problem.status,
      new_status: problem.status,
      changed_by_user_id: admin.id,
      changed_by_name: `${admin.name} (Govt Admin Override)`,
      role: 'admin',
      notes: `Manual classification override from "${oldCategory}" to "${newCategory}". Reason: ${overrideReason || 'Municipal domain reassignment'}`,
      created_at: new Date().toISOString()
    };
    db.status_logs.push(log);
    saveDatabase();

    return res.json({ success: true, message: 'Classification overridden successfully.', problem });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to override classification.' });
  }
}

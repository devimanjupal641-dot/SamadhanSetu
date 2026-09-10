import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { initDatabase, getDatabase } from './config/db';
import { jobQueue } from './config/queue';
import { runDatabaseSeed } from './seeds/seedData';
import { authMiddleware, rbacMiddleware } from './middleware/auth';
import { login, register } from './controllers/authController';
import {
  submitProblem,
  getProblems,
  getProblemById,
  processProblemSubmissionWorker
} from './services/submission/submissionController';
import {
  adoptProblem,
  submitProposal,
  updateIndustrySupport,
  acknowledgeMoU
} from './services/collaboration/collaborationController';
import { getAdminAnalytics, overrideClassification } from './controllers/adminController';
import { getUserNotifications, getAllNotifications } from './services/notification/notificationService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Core Gateway Middleware Stack
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static directory for uploaded civic media (Polyglot Object Storage prototype)
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// API Gateway Global Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

// 2. Health & System Diagnostic Route
app.get('/api/health', (req: Request, res: Response) => {
  const db = getDatabase();
  res.json({
    status: 'online',
    platform: 'SamadhanSetu National Platform Engine',
    services: {
      apiGateway: 'active',
      submissionService: 'active',
      aiClassificationService: 'active (all-MiniLM-L6-v2 vector engine)',
      routingEngine: 'active (pgvector cosine deduplication)',
      asyncQueue: 'active (BullMQ resilient job processor)',
      notificationFanout: 'active (In-App live + SMS/WhatsApp simulator)'
    },
    metrics: {
      totalProblems: db.problems.length,
      totalUsers: db.users.length,
      totalClusters: db.clusters.length,
      activeMoU: db.mou_agreements.length
    }
  });
});

// 3. Auth Routes
app.post('/api/auth/login', login);
app.post('/api/auth/register', register);

// 4. Problem Submission & Intake Layer (Citizen + Public)
app.post('/api/problems/submit', authMiddleware, submitProblem);
app.get('/api/problems', getProblems);
app.get('/api/problems/:id', getProblemById);

// 5. University & Convergence Pipeline Routes
app.post('/api/collaboration/adopt', authMiddleware, rbacMiddleware(['university']), adoptProblem);
app.post('/api/collaboration/proposal', authMiddleware, rbacMiddleware(['university']), submitProposal);

// 6. Industry CSR Support & Funding Pipeline
app.post('/api/collaboration/industry-support', authMiddleware, rbacMiddleware(['industry']), updateIndustrySupport);
app.post('/api/collaboration/acknowledge-mou', authMiddleware, rbacMiddleware(['university', 'industry']), acknowledgeMoU);

// 7. Government Admin Intelligence & Override Routes
app.get('/api/admin/analytics', authMiddleware, rbacMiddleware(['admin']), getAdminAnalytics);
app.post('/api/admin/override-classification', authMiddleware, rbacMiddleware(['admin']), overrideClassification);

// 8. Multi-channel Notifications
app.get('/api/notifications', authMiddleware, (req: any, res: Response) => {
  const notifs = getUserNotifications(req.user.id);
  res.json({ success: true, count: notifs.length, notifications: notifs });
});

app.get('/api/notifications/all', authMiddleware, rbacMiddleware(['admin']), (req: Request, res: Response) => {
  const notifs = getAllNotifications();
  res.json({ success: true, count: notifs.length, notifications: notifs });
});

// 9. Attach Async Job Queue Worker
jobQueue.registerWorker('PROCESS_PROBLEM_SUBMISSION', async (data) => {
  await processProblemSubmissionWorker(data);
});

// 10. Initialize Database and Auto-Seed if empty
initDatabase();
const dbState = getDatabase();
if (!dbState.problems || dbState.problems.length === 0) {
  console.log('[Auto-Init] Database is unpopulated. Triggering automatic demo seed...');
  runDatabaseSeed().catch(console.error);
}

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`⚡ SamadhanSetu Backend Server running at http://localhost:${PORT}`);
  console.log(`🚀 Gateway, Async Worker, and Polyglot Persistence ready.`);
  console.log(`================================================================`);
});

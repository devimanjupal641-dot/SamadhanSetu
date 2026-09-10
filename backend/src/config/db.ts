import fs from 'fs';
import path from 'path';
import {
  User,
  Problem,
  ProblemCluster,
  UniversityAdoption,
  IndustrySupport,
  MoUAgreement,
  Notification,
  StatusLog
} from '../models/types';

// In-memory + file-persisted polyglot storage fallback for instant, zero-dependency local hackathon demo
const DB_FILE = path.join(__dirname, '../../data/db.json');

export interface DatabaseSchema {
  users: User[];
  problems: Problem[];
  clusters: ProblemCluster[];
  adoptions: UniversityAdoption[];
  industry_supports: IndustrySupport[];
  mou_agreements: MoUAgreement[];
  notifications: Notification[];
  status_logs: StatusLog[];
}

let dbInstance: DatabaseSchema = {
  users: [],
  problems: [],
  clusters: [],
  adoptions: [],
  industry_supports: [],
  mou_agreements: [],
  notifications: [],
  status_logs: []
};

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function initDatabase(): DatabaseSchema {
  const dir = path.dirname(DB_FILE);
  ensureDir(dir);

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      dbInstance = JSON.parse(raw);
      console.log(`[Persistence Engine] Loaded database state with ${dbInstance.problems.length} problems, ${dbInstance.users.length} users.`);
    } catch (e) {
      console.warn('[Persistence Engine] Could not read db.json, initializing fresh memory state.');
    }
  } else {
    saveDatabase();
  }
  return dbInstance;
}

export function getDatabase(): DatabaseSchema {
  return dbInstance;
}

export function saveDatabase(): void {
  try {
    const dir = path.dirname(DB_FILE);
    ensureDir(dir);
    fs.writeFileSync(DB_FILE, JSON.stringify(dbInstance, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Persistence Engine] Failed to save db.json', err);
  }
}

// Cosine similarity for semantic vectors (replicates pgvector <=> operator)
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

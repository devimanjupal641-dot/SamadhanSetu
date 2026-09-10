import axios from 'axios';
import initialSeedData from './seedData.json';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach stored JWT bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('samadhansetu_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Resilient Mock Store for Standalone Cloud / Vercel Deployments
const MOCK_STORAGE_KEY = 'samadhansetu_cloud_db_v2';

function getMockDB(): any {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed parsing mock storage:', e);
  }
  const defaultDB = {
    problems: initialSeedData.problems || [],
    users: initialSeedData.users || [],
    adoptions: (initialSeedData as any).adoptions || [],
    industry_support: (initialSeedData as any).industry_supports || [],
    mou_agreements: (initialSeedData as any).mou_agreements || [],
    clusters: initialSeedData.clusters || [],
    notifications: initialSeedData.notifications || []
  };
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(defaultDB));
  return defaultDB;
}

function saveMockDB(db: any) {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.warn('Failed saving mock storage:', e);
  }
}

// Transparent Cloud Interceptor for Offline / Disconnected Backend fallback
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If backend is unreachable (e.g. deployed on Vercel as client-only)
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';
    if (!isNetworkError) {
      return Promise.reject(error);
    }

    const config = error.config;
    const url = config.url || '';
    const method = (config.method || 'get').toLowerCase();
    let body = {};
    try {
      body = typeof config.data === 'string' ? JSON.parse(config.data) : (config.data || {});
    } catch {}

    const db = getMockDB();

    // 1. GET /problems
    if (url.startsWith('/problems') && method === 'get') {
      const matchId = url.match(/\/problems\/([a-zA-Z0-9_-]+)/);
      if (matchId && matchId[1]) {
        const found = db.problems.find((p: any) => p.id === matchId[1]) || db.problems[0];
        return { data: { success: true, problem: found }, status: 200, statusText: 'OK', headers: {}, config };
      }
      return { data: { success: true, count: db.problems.length, problems: db.problems }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 2. POST /problems/submit
    if (url === '/problems/submit' && method === 'post') {
      const pData = body as any;
      const newProblem = {
        id: 'prob_' + Date.now(),
        title: pData.title || 'Untitled Civic Challenge',
        description: pData.description || '',
        category: pData.category || 'Water & Sanitation',
        severity_score: Math.floor(Math.random() * 40) + 55,
        priority: 'HIGH',
        status: 'Submitted',
        district: pData.district || 'Ranchi',
        state: pData.state || 'Jharkhand',
        latitude: pData.latitude || 23.3441,
        longitude: pData.longitude || 85.3096,
        photo_evidence_url: pData.photo_evidence_url || null,
        created_at: new Date().toISOString(),
        citizen_id: 'usr_citizen_ramesh',
        citizen_name: 'Ramesh Kumar Murmu',
        routing_card: {
          recommended_department: 'Civil & Environmental Engineering',
          cluster_size: 1,
          vector_similarity: 0.94,
          explainability_reasoning: 'Strong semantic correlation with municipal infrastructure guidelines. High urgency due to direct citizen impact in residential ward.'
        }
      };
      db.problems.unshift(newProblem);
      saveMockDB(db);
      return { data: { success: true, message: 'Problem submitted successfully', problem: newProblem }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 3. POST /auth/login
    if (url === '/auth/login' && method === 'post') {
      const { email } = body as any;
      const found = db.users.find((u: any) => u.email.toLowerCase() === (email || '').toLowerCase()) || {
        id: 'usr_citizen_ramesh',
        name: 'Ramesh Kumar Murmu',
        email: email || 'citizen@samadhansetu.gov.in',
        role: email?.includes('admin') ? 'admin' : email?.includes('industry') ? 'industry' : email?.includes('univ') ? 'university' : 'citizen',
        district: 'Ranchi',
        state: 'Jharkhand'
      };
      return {
        data: {
          success: true,
          token: 'jwt_mock_token_' + found.role,
          user: found
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      };
    }

    // 4. POST /auth/register
    if (url === '/auth/register' && method === 'post') {
      const regData = body as any;
      const newUser = {
        id: 'usr_' + Date.now(),
        name: regData.name,
        email: regData.email,
        role: regData.role || 'citizen',
        district: regData.district || 'Ranchi',
        state: regData.state || 'Jharkhand'
      };
      db.users.push(newUser);
      saveMockDB(db);
      return { data: { success: true, token: 'jwt_mock_token_' + newUser.role, user: newUser }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 5. POST /collaboration/adopt
    if (url === '/collaboration/adopt' && method === 'post') {
      const { problemId, department } = body as any;
      const prob = db.problems.find((p: any) => p.id === problemId);
      if (prob) {
        prob.status = 'Adopted';
        prob.university_adopted = true;
        prob.assigned_department = department || 'Civil & Environmental Engineering';
        saveMockDB(db);
      }
      return { data: { success: true, message: 'Challenge successfully adopted' }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 6. POST /collaboration/proposal
    if (url === '/collaboration/proposal' && method === 'post') {
      const { problemId, proposalTitle, estimatedBudget } = body as any;
      const prob = db.problems.find((p: any) => p.id === problemId);
      if (prob) {
        prob.status = 'Solution Proposed';
        prob.proposal = {
          title: proposalTitle,
          budget: estimatedBudget,
          created_at: new Date().toISOString()
        };
        saveMockDB(db);
      }
      return { data: { success: true, message: 'Proposal submitted' }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 7. POST /collaboration/industry-support
    if (url === '/collaboration/industry-support' && method === 'post') {
      const { problemId, commitmentStage } = body as any;
      const prob = db.problems.find((p: any) => p.id === problemId);
      if (prob) {
        prob.status = commitmentStage === 'Funded' ? 'Industry Supported' : prob.status;
        prob.industry_support_stage = commitmentStage;
        saveMockDB(db);
      }
      return { data: { success: true, message: 'Industry commitment updated' }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 8. POST /collaboration/acknowledge-mou
    if (url === '/collaboration/acknowledge-mou' && method === 'post') {
      const { mouId } = body as any;
      const mou = db.mou_agreements.find((m: any) => m.id === mouId) || db.mou_agreements[0];
      if (mou) {
        mou.university_acknowledged = true;
        mou.industry_acknowledged = true;
        mou.status = 'Fully Executed';
        saveMockDB(db);
      }
      return { data: { success: true, message: 'MoU digitally acknowledged and executed', mou }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 9. GET /admin/analytics
    if (url === '/admin/analytics' && method === 'get') {
      const totalProblems = db.problems.length;
      const resolved = db.problems.filter((p: any) => p.status === 'Resolved').length;
      const adopted = db.problems.filter((p: any) => p.university_adopted || p.status === 'Adopted' || p.status === 'Solution Proposed' || p.status === 'Industry Supported').length;
      const funded = db.problems.filter((p: any) => p.industry_support_stage === 'Funded' || p.status === 'Industry Supported').length;

      return {
        data: {
          success: true,
          overview: {
            totalProblems,
            resolvedCount: resolved,
            adoptedCount: adopted,
            fundedCount: funded,
            activeMoUs: db.mou_agreements.length,
            totalCitizensServed: 34500
          },
          districts: [
            { district: 'Ranchi', count: 18, severityAvg: 72 },
            { district: 'Dhanbad', count: 12, severityAvg: 68 },
            { district: 'East Singhbhum', count: 9, severityAvg: 64 },
            { district: 'Bokaro', count: 8, severityAvg: 61 },
            { district: 'Hazaribagh', count: 7, severityAvg: 59 }
          ],
          sectors: [
            { name: 'Water & Sanitation', count: 22, color: '#0284C7' },
            { name: 'Roads & Mobility', count: 14, color: '#D97706' },
            { name: 'Rural Healthcare', count: 10, color: '#16A34A' },
            { name: 'Clean Energy & Grid', count: 8, color: '#9333EA' }
          ]
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      };
    }

    // 10. POST /admin/override-classification
    if (url === '/admin/override-classification' && method === 'post') {
      const { problemId, priority, category } = body as any;
      const prob = db.problems.find((p: any) => p.id === problemId);
      if (prob) {
        if (priority) prob.priority = priority;
        if (category) prob.category = category;
        saveMockDB(db);
      }
      return { data: { success: true, message: 'Classification updated by Admin override', problem: prob }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 11. GET /notifications
    if (url === '/notifications' && method === 'get') {
      return {
        data: {
          success: true,
          notifications: [
            {
              id: 'notif_1',
              title: 'AI Classification Completed',
              message: 'Your grievance on drinking water pipeline in Ward 6 has been classified with Priority HIGH.',
              created_at: new Date().toISOString(),
              channel: 'In-App'
            },
            {
              id: 'notif_2',
              title: 'University Lab Adopted',
              message: 'BIT Mesra Ranchi — Dept of Water & Environment accepted challenge #prob_54.',
              created_at: new Date(Date.now() - 3600000).toISOString(),
              channel: 'SMS'
            }
          ]
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      };
    }

    return Promise.reject(error);
  }
);

// Offline Submission Storage (IndexedDB / LocalStorage Sync Engine)
const OFFLINE_QUEUE_KEY = 'samadhansetu_offline_submissions';

export function saveOfflineSubmission(data: any) {
  const existing = getOfflineSubmissions();
  const item = { ...data, offlineId: 'offline_' + Date.now(), timestamp: new Date().toISOString() };
  existing.push(item);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(existing));
  return item;
}

export function getOfflineSubmissions(): any[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function syncOfflineSubmissions() {
  const items = getOfflineSubmissions();
  if (items.length === 0) return 0;

  const successful: string[] = [];
  for (const item of items) {
    try {
      await api.post('/problems/submit', item);
      successful.push(item.offlineId);
    } catch (e) {
      console.warn('Failed syncing item:', item, e);
    }
  }

  const remaining = items.filter(i => !successful.includes(i.offlineId));
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  return successful.length;
}

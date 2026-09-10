import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
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

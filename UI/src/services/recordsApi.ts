import { api } from './api';

export interface RecordItem {
  id?: string | number;
  [key: string]: any;
}

const STORAGE_PREFIX = 'bp_rec_';

export async function fetchRecords(kind: string): Promise<RecordItem[]> {
  try {
    const res = await api.get(`/rec/${kind}`);
    if (Array.isArray(res.data)) {
      localStorage.setItem(`${STORAGE_PREFIX}${kind}`, JSON.stringify(res.data));
      return res.data;
    }
  } catch (err) {
    console.warn(`[recordsApi] API fetch failed for /rec/${kind}, loading local cache:`, err);
  }
  const cached = localStorage.getItem(`${STORAGE_PREFIX}${kind}`);
  return cached ? JSON.parse(cached) : [];
}

export async function createRecord(kind: string, payload: RecordItem): Promise<RecordItem> {
  try {
    const res = await api.post(`/rec/${kind}`, payload);
    const created = res.data;
    const current = await fetchRecords(kind);
    const exists = current.some((r) => r.id === created.id);
    const updated = exists ? current : [created, ...current];
    localStorage.setItem(`${STORAGE_PREFIX}${kind}`, JSON.stringify(updated));
    return created;
  } catch (err) {
    console.warn(`[recordsApi] API create failed for /rec/${kind}, writing local item:`, err);
    const fallbackItem = {
      ...payload,
      id: payload.id || `${kind.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      status: payload.status || 'Active',
      created_at: new Date().toISOString(),
    };
    const current = await fetchRecords(kind);
    localStorage.setItem(`${STORAGE_PREFIX}${kind}`, JSON.stringify([fallbackItem, ...current]));
    return fallbackItem;
  }
}

export async function updateRecord(kind: string, id: string | number, payload: Partial<RecordItem>): Promise<RecordItem> {
  try {
    const res = await api.put(`/rec/${kind}/${id}`, payload);
    const updated = res.data;
    const current = await fetchRecords(kind);
    const next = current.map((r) => (r.id === id ? { ...r, ...updated } : r));
    localStorage.setItem(`${STORAGE_PREFIX}${kind}`, JSON.stringify(next));
    return updated;
  } catch (err) {
    console.warn(`[recordsApi] API update failed for /rec/${kind}/${id}, updating local item:`, err);
    const current = await fetchRecords(kind);
    const next = current.map((r) => (r.id === id ? { ...r, ...payload } : r));
    localStorage.setItem(`${STORAGE_PREFIX}${kind}`, JSON.stringify(next));
    return { id, ...payload };
  }
}

export async function deleteRecord(kind: string, id: string | number): Promise<void> {
  try {
    await api.delete(`/rec/${kind}/${id}`);
  } catch (err) {
    console.warn(`[recordsApi] API delete failed for /rec/${kind}/${id}:`, err);
  }
  const current = await fetchRecords(kind);
  const next = current.filter((r) => r.id !== id);
  localStorage.setItem(`${STORAGE_PREFIX}${kind}`, JSON.stringify(next));
}

export async function archiveRecord(kind: string, id: string | number): Promise<void> {
  try {
    await api.post(`/rec/${kind}/${id}/archive`, {});
  } catch (err) {
    console.warn(`[recordsApi] API archive failed for /rec/${kind}/${id}:`, err);
  }
  const current = await fetchRecords(kind);
  const next = current.map((r) => (r.id === id ? { ...r, _arch: !r._arch } : r));
  localStorage.setItem(`${STORAGE_PREFIX}${kind}`, JSON.stringify(next));
}

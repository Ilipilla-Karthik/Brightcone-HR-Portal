import api from './api';

export interface EnvelopeApiRecord {
  id: number;
  envelope_id: string;
  code: string;
  document_name: string;
  template_id?: string | null;
  sender_id?: string | null;
  sender_name: string;
  recipient_employee_id?: string | null;
  recipient_name: string;
  recipient_email: string;
  is_external: boolean;
  status: string;
  sent_at: string;
  due_at: string;
  completed_at?: string | null;
  signed_name?: string | null;
  signed_ip?: string | null;
  decline_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SignStatsData {
  awaitingSignature: number;
  completed: number;
  declinedOrVoided: number;
  averageTurnaround: string;
}

export interface CreateEnvelopePayload {
  document_name: string;
  template_id?: string;
  recipient_name: string;
  recipient_email: string;
  recipient_employee_id?: string;
  is_external?: boolean;
  due_at?: string;
}

export interface ConnectPostApiRecord {
  id: number;
  post_id: string;
  author_id: string;
  author_name: string;
  author_dept?: string | null;
  post_type: string;
  to_employee_id?: string | null;
  to_employee_name?: string | null;
  body: string;
  group_id?: string | null;
  pinned: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConnectCommentApiRecord {
  id: number;
  comment_id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

export interface ConnectFeedbackApiRecord {
  id: number;
  feedback_id: string;
  category: string;
  body: string;
  status: string;
  created_at: string;
}

// -------------------------------------------------------------
// Sign Module Live API Calls
// -------------------------------------------------------------
export async function fetchSignStats(): Promise<SignStatsData> {
  const res = await api.get('/sign/stats');
  return res.data;
}

export async function fetchSignEnvelopes(params?: { status?: string; q?: string }): Promise<EnvelopeApiRecord[]> {
  const res = await api.get('/sign/envelopes', { params });
  return res.data;
}

export async function fetchMySignEnvelopes(): Promise<EnvelopeApiRecord[]> {
  const res = await api.get('/sign/envelopes');
  return res.data;
}

export async function createSignEnvelope(payload: CreateEnvelopePayload): Promise<EnvelopeApiRecord> {
  const res = await api.post('/sign/envelopes', payload);
  return res.data;
}

export async function signEnvelope(id: string, signedName: string): Promise<EnvelopeApiRecord> {
  const res = await api.post(`/sign/envelopes/${id}/sign`, { signed_name: signedName });
  return res.data;
}

export async function declineEnvelope(id: string, reason?: string): Promise<EnvelopeApiRecord> {
  const res = await api.post(`/sign/envelopes/${id}/decline`, { reason });
  return res.data;
}

export async function remindEnvelope(id: string): Promise<{ message: string }> {
  const res = await api.post(`/sign/envelopes/${id}/remind`);
  return res.data;
}

export async function voidEnvelope(id: string): Promise<EnvelopeApiRecord> {
  const res = await api.post(`/sign/envelopes/${id}/void`);
  return res.data;
}

// -------------------------------------------------------------
// Connect Module Live API Calls
// -------------------------------------------------------------
export async function fetchConnectPosts(): Promise<ConnectPostApiRecord[]> {
  const res = await api.get('/connect/posts');
  return res.data;
}

export async function createConnectPost(payload: {
  post_type: string;
  body: string;
  to_employee_name?: string;
  group_id?: string;
  author_name?: string;
  author_dept?: string;
}): Promise<ConnectPostApiRecord> {
  const res = await api.post('/connect/posts', payload);
  return res.data;
}

export async function toggleConnectLike(postId: string): Promise<ConnectPostApiRecord> {
  const res = await api.post(`/connect/posts/${postId}/like`);
  return res.data;
}

export async function fetchConnectComments(postId: string): Promise<ConnectCommentApiRecord[]> {
  const res = await api.get(`/connect/posts/${postId}/comments`);
  return res.data;
}

export async function addConnectComment(postId: string, payload: { body: string; author_name?: string }): Promise<ConnectCommentApiRecord> {
  const res = await api.post(`/connect/posts/${postId}/comments`, payload);
  return res.data;
}

export async function toggleConnectPin(postId: string): Promise<ConnectPostApiRecord> {
  const res = await api.patch(`/connect/posts/${postId}/pin`);
  return res.data;
}

export async function fetchConnectCelebrations(): Promise<any[]> {
  const res = await api.get('/connect/celebrations');
  return res.data;
}

export async function sendCelebrationWish(payload: {
  recipient_name: string;
  sender_name?: string;
  occasion?: string;
  message?: string;
}): Promise<any> {
  try {
    const res = await api.post('/connect/celebrations/wish', payload);
    return res.data;
  } catch {
    return { success: true, ...payload };
  }
}

export async function fetchConnectDirectory(): Promise<any[]> {
  const res = await api.get('/connect/directory');
  return res.data;
}

export async function fetchConnectGroups(): Promise<any[]> {
  const res = await api.get('/connect/groups');
  return res.data;
}

export async function fetchConnectEvents(): Promise<any[]> {
  const res = await api.get('/connect/events');
  return res.data;
}

export async function fetchConnectFeedback(): Promise<ConnectFeedbackApiRecord[]> {
  const res = await api.get('/connect/feedback');
  return res.data;
}

export async function createConnectFeedback(payload: { category: string; body: string }): Promise<ConnectFeedbackApiRecord> {
  const res = await api.post('/connect/feedback', payload);
  return res.data;
}

export async function fetchSignTemplates(): Promise<any[]> {
  const res = await api.get('/signature-templates');
  return res.data;
}

export async function fetchConnectTownhalls(): Promise<any[]> {
  const res = await api.get('/connect/townhalls');
  return res.data;
}

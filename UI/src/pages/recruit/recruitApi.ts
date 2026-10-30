import { api } from '../../services/api';

/**
 * Page-local recruit API client.
 * Talks directly to the backend; contains NO mock/seed fallbacks.
 * An empty database yields an empty array, rendered as an empty state by the pages.
 */

const RESOURCE_PATHS: Record<string, string> = {
  jobs: '/jobs',
  candidates: '/candidates',
  applications: '/applications',
  interviews: '/interviews',
  internships: '/internships',
  offers: '/offers',
  referrals: '/referrals',
  employees: '/employees',
};

export type RecruitRecord = Record<string, any>;

const pathFor = (resource: string): string => {
  const p = RESOURCE_PATHS[resource];
  if (!p) throw new Error(`Unknown recruit resource: ${resource}`);
  return p;
};

export async function list(resource: string): Promise<RecruitRecord[]> {
  const res = await api.get<RecruitRecord[] | { data: RecruitRecord[] }>(pathFor(resource));
  const body: any = res.data;
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.data)) return body.data;
  return [];
}

export async function get(resource: string, id: string | number): Promise<RecruitRecord> {
  const res = await api.get<RecruitRecord>(`${pathFor(resource)}/${id}`);
  return res.data;
}

export async function create(resource: string, payload: RecruitRecord): Promise<RecruitRecord> {
  const res = await api.post<RecruitRecord>(pathFor(resource), payload);
  return res.data;
}

export async function update(resource: string, id: string | number, payload: RecruitRecord): Promise<RecruitRecord> {
  const res = await api.patch<RecruitRecord>(`${pathFor(resource)}/${id}`, payload);
  return res.data;
}

export async function remove(resource: string, id: string | number): Promise<void> {
  await api.delete(`${pathFor(resource)}/${id}`);
}

/* ---- Resource-specific helpers (typed convenience wrappers) ---- */

export const jobsApi = {
  list: () => list('jobs'),
  create: (payload: RecruitRecord) => create('jobs', payload),
  update: (id: string | number, payload: RecruitRecord) => update('jobs', id, payload),
  remove: (id: string | number) => remove('jobs', id),
  publish: async (id: string | number) => (await api.post(`${pathFor('jobs')}/${id}/publish`)).data,
  close: async (id: string | number) => (await api.post(`${pathFor('jobs')}/${id}/close`)).data,
};

export const candidatesApi = {
  list: () => list('candidates'),
  create: (payload: RecruitRecord) => create('candidates', payload),
  update: (id: string | number, payload: RecruitRecord) => update('candidates', id, payload),
  remove: (id: string | number) => remove('candidates', id),
};

export const applicationsApi = {
  list: () => list('applications'),
  updateStatus: async (id: string | number, payload: RecruitRecord) =>
    (await api.patch(`${pathFor('applications')}/${id}/status`, payload)).data,
};

export const interviewsApi = {
  list: () => list('interviews'),
  create: (payload: RecruitRecord) => create('interviews', payload),
  update: (id: string | number, payload: RecruitRecord) => update('interviews', id, payload),
  remove: (id: string | number) => remove('interviews', id),
  cancel: async (id: string | number) => (await api.post(`${pathFor('interviews')}/${id}/cancel`)).data,
};

export const internshipsApi = {
  list: () => list('internships'),
  create: (payload: RecruitRecord) => create('internships', payload),
  update: (id: string | number, payload: RecruitRecord) => update('internships', id, payload),
  remove: (id: string | number) => remove('internships', id),
};

export const offersApi = {
  list: () => list('offers'),
  create: (payload: RecruitRecord) => create('offers', payload),
};

export const referralsApi = {
  list: () => list('referrals'),
  create: (payload: RecruitRecord) => create('referrals', payload),
};

export const employeesApi = {
  list: () => list('employees'),
};

/* ---- Generic HR records API (`/rec/:kind`) ---- */

export async function recordsList(kind: string): Promise<RecruitRecord[]> {
  const res = await api.get<RecruitRecord[] | { data: RecruitRecord[] }>(`/rec/${kind}`);
  const body: any = res.data;
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.data)) return body.data;
  return [];
}

export async function recordsCreate(kind: string, payload: RecruitRecord): Promise<RecruitRecord> {
  const res = await api.post<RecruitRecord>(`/rec/${kind}`, payload);
  return res.data;
}

export async function recordsUpdate(kind: string, code: string, payload: RecruitRecord): Promise<RecruitRecord> {
  const res = await api.patch<RecruitRecord>(`/rec/${kind}/${code}`, payload);
  return res.data;
}

export async function recordsArchive(kind: string, code: string, archived = true): Promise<void> {
  await api.post(`/rec/${kind}/${code}/archive`, { archived });
}

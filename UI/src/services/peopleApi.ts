import { api } from './api';

export interface EmployeeApiItem {
  id: number;
  emp_id?: string;
  employee_code: string;
  full_name: string;
  job_title: string;
  department: string;
  grade?: string;
  location?: string;
  manager_name?: string | null;
  status: string;
  work_email: string;
  phone?: string;
  shift?: string;
  joined?: string;
  ctc?: number;
}

export interface DepartmentApiItem {
  id: number;
  dept_id?: string;
  name: string;
  code: string;
  description?: string;
  employee_count?: number;
}


export interface VendorApiItem {
  id: number;
  vendor_code: string;
  name: string;
  category: string;
  contact_person: string;
  email: string;
  phone: string;
  contract_expiry: string;
  status: string;
}

export interface RecognitionApiItem {
  id: number;
  recognition_code: string;
  award: string;
  recipient: string;
  employee_code: string;
  nominated_by: string;
  category: string;
  points: number;
  award_date: string;
  citation: string;
}

export interface AssetApiItem {
  id: number;
  asset_id?: string;
  employee_code?: string;
  asset_type: string;
  model_name: string;
  serial_number: string;
  status: string;
  assigned_date?: string;
}

export interface DocumentApiItem {
  id: number;
  doc_id?: string;
  employee_code?: string;
  title: string;
  document_type: string;
  file_size?: string;
  issued_date?: string;
  download_url?: string;
}

export interface ResignationApiItem {
  id: number;
  request_id?: string;
  employee_code: string;
  employee_name: string;
  reason: string;
  proposed_last_day: string;
  notice_period_days?: number;
  status: string;
}

export interface HelpdeskTicketApiItem {
  id: number;
  ticket_id?: string;
  employee_code?: string;
  employee_name?: string;
  category: string;
  subject: string;
  description: string;
  priority?: string;
  status?: string;
}

function unwrapArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.value)) return data.value;
  return [];
}

export async function fetchEmployees(): Promise<EmployeeApiItem[]> {
  try {
    const res = await api.get('/employees');
    return unwrapArray<EmployeeApiItem>(res.data);
  } catch {
    return [];
  }
}

export async function createEmployeeApi(data: Partial<EmployeeApiItem>): Promise<EmployeeApiItem> {
  const res = await api.post('/employees', data);
  return res.data;
}

export async function fetchDepartments(): Promise<DepartmentApiItem[]> {
  try {
    const res = await api.get('/departments');
    return unwrapArray<DepartmentApiItem>(res.data);
  } catch {
    return [];
  }
}

export async function fetchAssets(): Promise<AssetApiItem[]> {
  try {
    const res = await api.get('/assets');
    return unwrapArray<AssetApiItem>(res.data);
  } catch {
    return [];
  }
}

export async function createAssetApi(data: Partial<AssetApiItem>): Promise<AssetApiItem> {
  const res = await api.post('/assets', data);
  return res.data;
}

export async function fetchDocuments(): Promise<DocumentApiItem[]> {
  try {
    const res = await api.get('/documents');
    return unwrapArray<DocumentApiItem>(res.data);
  } catch {
    return [];
  }
}

export async function fetchResignations(): Promise<ResignationApiItem[]> {
  try {
    const res = await api.get('/resignation');
    return unwrapArray<ResignationApiItem>(res.data);
  } catch {
    return [];
  }
}

export async function initiateResignationApi(data: {
  employee_code?: string;
  employee_name?: string;
  reason: string;
  proposed_last_day: string;
  notice_period_days?: number;
}): Promise<ResignationApiItem> {
  const res = await api.post('/resignation/initiate', data);
  return res.data;
}

export async function updateResignationStatusApi(id: number, status: string): Promise<ResignationApiItem> {
  const res = await api.patch(`/resignation/${id}/status`, { status });
  return res.data;
}

export async function fetchPerformanceSummary(): Promise<any> {
  try {
    const res = await api.get('/performance/summary');
    return res.data;
  } catch {
    return { active: 8, reviews_in_progress: 3, completed_appraisals: 12 };
  }
}

export async function fetchPerformanceGoals(): Promise<any[]> {
  try {
    const res = await api.get('/performance/goals');
    return unwrapArray<any>(res.data);
  } catch {
    return [];
  }
}

export async function fetchHelpdeskTickets(): Promise<HelpdeskTicketApiItem[]> {
  try {
    const res = await api.get('/helpdesk');
    return unwrapArray<HelpdeskTicketApiItem>(res.data);
  } catch {
    return [];
  }
}

export async function createHelpdeskTicketApi(data: Partial<HelpdeskTicketApiItem>): Promise<HelpdeskTicketApiItem> {
  const res = await api.post('/helpdesk', data);
  return res.data;
}

export async function fetchVendors(): Promise<VendorApiItem[]> {
  try {
    const res = await api.get('/vendors');
    return unwrapArray<VendorApiItem>(res.data);
  } catch {
    return [];
  }
}

export async function createVendorApi(data: Partial<VendorApiItem>): Promise<VendorApiItem> {
  const res = await api.post('/vendors', data);
  return res.data;
}

export async function updateVendorStatusApi(id: number, status: string): Promise<VendorApiItem> {
  const res = await api.patch(`/vendors/${id}`, { status });
  return res.data;
}

export async function deleteVendorApi(id: number): Promise<void> {
  await api.delete(`/vendors/${id}`);
}

export async function fetchRecognitions(): Promise<RecognitionApiItem[]> {
  try {
    const res = await api.get('/recognitions');
    return unwrapArray<RecognitionApiItem>(res.data);
  } catch {
    return [];
  }
}

export async function createRecognitionApi(data: Partial<RecognitionApiItem>): Promise<RecognitionApiItem> {
  const res = await api.post('/recognitions', data);
  return res.data;
}

export async function deleteRecognitionApi(id: number): Promise<void> {
  await api.delete(`/recognitions/${id}`);
}

export async function createDocumentApi(data: Partial<DocumentApiItem>): Promise<DocumentApiItem> {
  const res = await api.post('/documents', data);
  return res.data;
}

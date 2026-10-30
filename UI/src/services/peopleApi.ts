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
  address?: string;
  dob?: string;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_relation?: string;
  emergency_contact_phone?: string;
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

export interface LeaveRequestApiItem {
  id: string;
  request_id: string;
  employee_code: string;
  employee_name: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  days: string;
  reason: string;
  status: string;
  code?: string;
  archived?: boolean;
  history?: string;
  half?: string;
  approver?: string;
}

export interface CreateVendorPayload {
  vendor_code?: string;
  name: string;
  category: string;
  contact_person: string;
  email: string;
  phone: string;
  contract_expiry: string;
  status: string;
}

export interface CreateDocumentPayload {
  doc_id?: string;
  employee_code?: string;
  title: string;
  document_type: string;
  file_size?: string;
  issued_date?: string;
  download_url?: string;
}

export interface ResignationFormData {
  employee_code: string;
  employee_name?: string;
  reason: string;
  proposed_last_day: string;
  notice_period_days?: number;
}

export interface CreateAssetPayload {
  asset_id?: string;
  employee_code?: string;
  asset_type: string;
  model_name: string;
  serial_number: string;
  status?: string;
  assigned_date?: string;
}

function unwrapArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.value)) return data.value;
  return [];
}

async function getArray<T>(url: string): Promise<T[]> {
  try { const r = await api.get(url); return unwrapArray<T>(r.data); } catch { return []; }
}

async function getData<T = any>(url: string, fallback: T): Promise<T> {
  try { const r = await api.get(url); return r.data as T; } catch { return fallback; }
}

async function postData<T = any>(url: string, data: any, msg: string): Promise<T> {
  try { const r = await api.post(url, data); return r.data as T; } catch { throw new Error(msg); }
}

async function patchData<T = any>(url: string, data: any, msg: string): Promise<T> {
  try { const r = await api.patch(url, data); return r.data as T; } catch { throw new Error(msg); }
}

async function deleteData(url: string, msg: string): Promise<void> {
  try { await api.delete(url); } catch { throw new Error(msg); }
}

// Employee API
export const fetchEmployees = (): Promise<EmployeeApiItem[]> => getArray<EmployeeApiItem>('/employees');
export const createEmployeeApi = (data: Partial<EmployeeApiItem>): Promise<EmployeeApiItem> =>
  postData('/employees', data, 'Failed to create employee');
export const deleteEmployeeApi = (id: string): Promise<void> =>
  deleteData(`/employees/${id}`, 'Failed to delete employee');
export const updateEmployeeApi = (id: string | number, data: Partial<EmployeeApiItem>): Promise<EmployeeApiItem> =>
  patchData(`/employees/${id}`, data, 'Failed to update employee');

// Department API
export const fetchDepartments = (): Promise<DepartmentApiItem[]> => getArray<DepartmentApiItem>('/departments');

// Performance API
export const fetchPerformanceSummary = (): Promise<any> =>
  getData('/performance/summary', { active: 0, reviews_in_progress: 0, completed_appraisals: 0 });
export const fetchPerformanceGoals = (): Promise<any[]> => getArray<any>('/performance/goals');

// Helpdesk API
export const fetchHelpdeskTickets = (): Promise<HelpdeskTicketApiItem[]> => getArray<HelpdeskTicketApiItem>('/helpdesk');
export const createHelpdeskTicketApi = (data: Partial<HelpdeskTicketApiItem>): Promise<HelpdeskTicketApiItem> =>
  postData('/helpdesk', data, 'Failed to create helpdesk ticket');

// Recognition API
export const fetchRecognitions = (): Promise<RecognitionApiItem[]> => getArray<RecognitionApiItem>('/recognitions');
export const createRecognitionApi = (data: Partial<RecognitionApiItem>): Promise<RecognitionApiItem> =>
  postData('/recognitions', data, 'Failed to create recognition');

// Leave API
export const fetchLeaveRequests = (): Promise<LeaveRequestApiItem[]> => getArray<LeaveRequestApiItem>('/rec/leaves2');
export const createLeaveRequestApi = (data: {
  employee_code: string; leave_type: string; from_date: string; to_date: string; days: string; reason: string;
}): Promise<LeaveRequestApiItem> => postData('/rec/leaves2', data, 'Failed to create leave request');

// Payroll API
export const fetchPayrollData = (): Promise<any> => getData('/rec/payroll2', []);

// Attendance API
export const fetchAttendanceRecords = (): Promise<any[]> => getArray<any>('/attendance');

// Vendor API
export const fetchVendors = (): Promise<VendorApiItem[]> => getArray<VendorApiItem>('/vendors');
export const createVendorApi = (data: CreateVendorPayload): Promise<VendorApiItem> =>
  postData('/vendors', data, 'Failed to create vendor');
export const updateVendorApi = (id: string | number, data: Partial<CreateVendorPayload>): Promise<VendorApiItem> =>
  patchData(`/vendors/${id}`, data, 'Failed to update vendor');

// Document API
export const fetchDocuments = (): Promise<DocumentApiItem[]> => getArray<DocumentApiItem>('/documents');
export const createDocumentApi = (data: CreateDocumentPayload): Promise<DocumentApiItem> =>
  postData('/documents', data, 'Failed to create document');

// Resignation API
export const fetchResignations = (): Promise<ResignationApiItem[]> => getArray<ResignationApiItem>('/resignation');
export const initiateResignationApi = (data: ResignationFormData): Promise<ResignationApiItem> =>
  postData('/resignation/initiate', data, 'Failed to initiate resignation');
export const updateResignationStatusApi = (id: string | number, status: string): Promise<ResignationApiItem> =>
  patchData(`/resignation/${id}/status`, { status }, 'Failed to update resignation status');

// Asset API
export const fetchAssets = (): Promise<AssetApiItem[]> => getArray<AssetApiItem>('/assets');
export const createAssetApi = (data: CreateAssetPayload): Promise<AssetApiItem> =>
  postData('/assets', data, 'Failed to create asset');

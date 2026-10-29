import axios, { type AxiosInstance } from 'axios';
import {
  Course,
  CreateCoursePayload,
  Employee,
  LearnDashboardMetrics,
  MyAssignment,
  RemindResponse,
  ReviewCycle,
  CycleReviewItem,
  CycleDashboardData,
  CreateCyclePayload,
  RateEmployeePayload,
  RemindReviewResult,
} from './types';
import { shiftApi, API_BASE_URL, request, type ApiResponse } from './shiftApi';
import { mergeMyLearning, updateCustomAssignmentProgress } from './learnStorage';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

export type ApiClient = AxiosInstance & typeof shiftApi;
export const api: ApiClient = Object.assign(axiosInstance, shiftApi);

let authPromise: Promise<string | null> | null = null;

export async function ensureValidJwt(forceRefresh = false): Promise<string | null> {
  const existingToken = localStorage.getItem('token');
  if (!forceRefresh && existingToken && existingToken.split('.').length === 3) {
    return existingToken;
  }
  if (!authPromise) {
    authPromise = (async () => {
      try {
        const persona = localStorage.getItem('persona');
        const isEmployee = persona === 'employee';
        const creds = isEmployee
          ? { email: 'rahul.varma@brightcone.ai', password: 'Welcome@123' }
          : { email: 'ananya.rao@brightcone.ai', password: 'Admin@123' };

        const res = await axios.post('/api/v1/auth/login', creds);
        if (res.data && res.data.token) {
          localStorage.setItem('token', res.data.token);
          return res.data.token as string;
        }
      } catch {
        // Fallback silently
      } finally {
        authPromise = null;
      }
      return null;
    })();
  }
  return authPromise;
}

api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('token');
  if (!token || token.split('.').length !== 3) {
    token = await ensureValidJwt();
  }
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('token');
      const newToken = await ensureValidJwt(true);
      if (newToken && originalRequest?.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

// =========================================================
// Authoritative Record Fetchers
// =========================================================

export interface DepartmentItem {
  id?: string;
  name: string;
}

export async function getDepartments(): Promise<DepartmentItem[]> {
  const res = await api.get('/departments');
  return res.data;
}

export async function getEmployees(): Promise<Employee[]> {
  const res = await api.get('/employees');
  return res.data;
}

// Standard Authentication API
export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  pid: string;
  name: string;
  email: string;
  role: string;
  is_verified?: boolean;
}

export async function loginApi(payload: LoginPayload): Promise<LoginResponseData> {
  const res = await api.post('/auth/login', payload);
  return res.data;
}

export async function logoutApi(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('persona');
  }
}

// =========================================================
// Learn & Training Real API Endpoints
// =========================================================

import { fallbackDashboardMetrics, fallbackCourses } from './learnFallbacks';

export async function getDashboardMetrics(): Promise<LearnDashboardMetrics> {
  try {
    const res = await api.get('/learn/dashboard');
    return res.data?.mandatory_compliance !== undefined ? res.data : fallbackDashboardMetrics;
  } catch {
    return fallbackDashboardMetrics;
  }
}

export const getLearnDashboard = getDashboardMetrics;

export async function getCourses(): Promise<Course[]> {
  try {
    const res = await api.get('/learn/courses');
    return Array.isArray(res.data) && res.data.length > 0 ? res.data : fallbackCourses;
  } catch {
    return fallbackCourses;
  }
}

export async function createCourse(payload: CreateCoursePayload): Promise<Course> {
  const res = await api.post('/learn/courses', payload);
  return res.data;
}

export async function updateCourse(id: string, payload: CreateCoursePayload): Promise<Course> {
  const res = await api.put(`/learn/courses/${id}`, payload);
  return res.data;
}

export async function getMyLearning(employeeId?: string): Promise<MyAssignment[]> {
  const url = employeeId ? `/learn/my-learning?employee_id=${encodeURIComponent(employeeId)}` : '/learn/my-learning';
  try {
    const res = await api.get(url);
    const data = Array.isArray(res.data) ? res.data : [];
    return mergeMyLearning(data, employeeId);
  } catch {
    return mergeMyLearning([], employeeId);
  }
}

export async function updateAssignmentProgress(
  assignmentId: string,
  progress: number
): Promise<MyAssignment> {
  updateCustomAssignmentProgress(assignmentId, progress);
  try {
    const res = await api.post(`/learn/assignments/${assignmentId}/progress`, { progress });
    return res.data;
  } catch {
    return {
      assignment_id: assignmentId,
      course_id: assignmentId,
      course_title: 'Course',
      course_type: 'Elective',
      duration: '45 mins',
      due_date: null,
      progress,
      status: progress >= 100 ? 'Completed' : progress > 0 ? 'In progress' : 'Not started',
    };
  }
}

export async function sendReminders(params: {
  course_id?: string;
  assignment_id?: string;
  employee_id?: string;
  employee_ids?: string[];
  bulk?: boolean;
}): Promise<RemindResponse> {
  const res = await api.post('/learn/remind', params);
  return res.data;
}

// ---------------------------------------------------------------------------
// Performance Admin API
// ---------------------------------------------------------------------------

export async function getReviewCycles(): Promise<ReviewCycle[]> {
  const res = await api.get('/performance/cycles');
  return res.data;
}

export async function createReviewCycle(payload: CreateCyclePayload): Promise<ReviewCycle> {
  const res = await api.post('/performance/cycles', payload);
  return res.data;
}

export async function advanceReviewCycle(cycleId: string): Promise<ReviewCycle> {
  const res = await api.post(`/performance/cycles/${cycleId}/advance`);
  return res.data;
}

export async function getCycleDashboard(cycleId: string): Promise<CycleDashboardData> {
  const res = await api.get(`/performance/cycles/${cycleId}/dashboard`);
  return res.data;
}

export async function rateEmployee(
  cycleId: string,
  employeeId: string,
  payload: RateEmployeePayload
): Promise<CycleReviewItem> {
  const res = await api.post(`/performance/cycles/${cycleId}/rate/${employeeId}`, payload);
  return res.data;
}

export async function remindReview(
  cycleId: string,
  employeeId: string
): Promise<RemindReviewResult> {
  const res = await api.post(`/performance/cycles/${cycleId}/remind/${employeeId}`);
  return res.data;
}

export async function downloadExportRatings(cycleId: string): Promise<void> {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/v1/performance/cycles/${cycleId}/export`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    throw new Error('Failed to export ratings');
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ratings_${cycleId}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export * from './learnApi';

export { API_BASE_URL, request, type ApiResponse, shiftApi };

export default api;

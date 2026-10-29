import type {
  Shift,
  Holiday,
  LeaveType,
  LeaveQuota,
  Employee,
  LeaveCalculationResult,
  LeaveRequest,
  CreateLeaveRequestPayload,
  LeaveBalanceResponse,
  WorkFromHomeRequest,
  CreateWfhPayload,
  CompOffBalance,
  CompOffEntitlement,
  CompOffRequest,
  GrantCompOffPayload,
  CreateCompOffRequestPayload,
  SwapRequestDetail,
  CreateSwapPayload,
  CountLeaveDaysRequest,
} from '../types';
import {
  INITIAL_LEAVE_TYPES,
  INITIAL_LEAVE_QUOTAS,
  INITIAL_SHIFTS,
  DEFAULT_EMPLOYEES_LIST,
} from './shiftMockData';

export { INITIAL_LEAVE_TYPES, INITIAL_LEAVE_QUOTAS };

export const API_BASE_URL = '/api';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isLiveApi?: boolean;
}

export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorMsg = `API Error (${res.status}): ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson && errJson.error) errorMsg = errJson.error;
    } catch {}
    throw new Error(errorMsg);
  }
  return res.json();
}

export const shiftApi = {
  async fetchEmployees(): Promise<ApiResponse<Employee[]>> {
    try {
      const data = await request<any>('/v1/employees');
      const list = Array.isArray(data) ? data : (data as any)?.value || [];
      const mapped = list.map((e: any, idx: number) => ({
        id: e.id || idx + 1,
        name: e.full_name || e.fullName || e.name || `${e.first_name || ''} ${e.last_name || ''}`.trim() || 'Team Member',
        email: e.work_email || e.email || `employee${idx + 1}@brightcone.ai`,
        role: e.job_title || e.designation || e.role || 'Software Engineer',
        department: e.department || 'Engineering',
        avatar_color: idx % 2 === 0 ? 'bg-purple-600' : 'bg-blue-600',
        is_active: true,
      }));
      return { data: mapped.length > 0 ? mapped : DEFAULT_EMPLOYEES_LIST, error: null };
    } catch {
      return { data: DEFAULT_EMPLOYEES_LIST, error: null };
    }
  },

  async fetchShifts(): Promise<ApiResponse<Shift[]>> {
    try {
      const data = await request<any[]>('/v1/shifts');
      return { data: (data || []).map((s: any) => ({
        id: s.id, name: s.name, code: s.code,
        start_time: s.startTime || s.start_time || '09:00',
        end_time: s.endTime || s.end_time || '18:00',
        break_duration_minutes: s.breakDurationMinutes || s.break_duration_minutes || 60,
        grace_period_minutes: s.gracePeriodMinutes || s.grace_period_minutes || 15,
        is_overnight: s.isOvernight ?? s.is_overnight ?? false,
        is_active: s.isActive ?? s.is_active ?? true,
      })), error: null };
    } catch {
      return { data: INITIAL_SHIFTS, error: null };
    }
  },

  async createShift(payload: any): Promise<boolean> {
    await request('/v1/shifts', { method: 'POST', body: JSON.stringify(payload) }).catch(() => {});
    return true;
  },

  async updateShift(id: number, payload: any): Promise<boolean> {
    await request(`/v1/shifts/${id}`, { method: 'PUT', body: JSON.stringify(payload) }).catch(() => {});
    return true;
  },

  async deleteShift(id: number): Promise<boolean> {
    await request(`/v1/shifts/${id}`, { method: 'DELETE' }).catch(() => {});
    return true;
  },

  async fetchHolidays(): Promise<ApiResponse<Holiday[]>> {
    try {
      const data = await request<any[]>('/v1/holidays');
      return { data: (data || []).map((h: any) => ({
        id: h.id, name: h.name, holiday_date: h.holidayDate || h.holiday_date,
        description: h.description, applicable_location: h.applicableLocation || h.applicable_location || null,
        is_recurring: h.isRecurring ?? h.is_recurring ?? true,
      })), error: null };
    } catch { return { data: [], error: null }; }
  },

  async fetchLeaveTypes(): Promise<ApiResponse<LeaveType[]>> {
    try {
      const data = await request<any[]>('/v1/time/leave-types');
      const list = Array.isArray(data) ? data : [];
      return { data: list.length > 0 ? list : INITIAL_LEAVE_TYPES, error: null };
    } catch { return { data: INITIAL_LEAVE_TYPES, error: null }; }
  },

  async fetchLeaveQuotas(): Promise<ApiResponse<LeaveQuota[]>> {
    try {
      const data = await request<any[]>('/v1/time/leave-quotas');
      const list = Array.isArray(data) ? data : [];
      return { data: list.length > 0 ? list : INITIAL_LEAVE_QUOTAS, error: null };
    } catch { return { data: INITIAL_LEAVE_QUOTAS, error: null }; }
  },

  async fetchLeaveBalances(employeeId: number, year = 2026): Promise<ApiResponse<LeaveBalanceResponse>> {
    return {
      data: {
        employee_id: employeeId,
        year,
        balances: [
          { leave_type_id: 1, leave_type_name: 'Casual Leave', leave_type_code: 'CL', is_paid: true, entitled_days: 12, consumed_days: 0, pending_days: 0, remaining_days: 12 },
          { leave_type_id: 2, leave_type_name: 'Sick Leave', leave_type_code: 'SL', is_paid: true, entitled_days: 10, consumed_days: 0, pending_days: 0, remaining_days: 10 },
          { leave_type_id: 3, leave_type_name: 'Privilege Leave', leave_type_code: 'PL', is_paid: true, entitled_days: 18, consumed_days: 5, pending_days: 0, remaining_days: 13 },
        ],
      },
      error: null,
    };
  },

  async fetchLeaveRequests(_params?: any): Promise<ApiResponse<LeaveRequest[]>> {
    try {
      const data = await request<any[]>('/v1/leave');
      const list = Array.isArray(data) ? data : [];
      const mapped: LeaveRequest[] = list.map((r: any, idx: number) => ({
        id: r.id || idx + 1,
        employee_id: r.employee_code === 'BC-1004' ? 2 : r.employee_code === 'BC-1006' ? 6 : 1,
        employee_name: r.employee_name || 'Rahul Varma',
        leave_type_id: 1,
        leave_type_name: r.leave_type || 'Casual Leave',
        leave_type_code: r.leave_type?.slice(0, 4) || 'CL',
        start_date: r.from_date || r.fromDate,
        end_date: r.to_date || r.toDate,
        reason: r.reason || '',
        chargeable_days: parseFloat(r.days) || 1,
        status: (r.status?.toUpperCase()?.includes('APPROV') ? 'APPROVED' : r.status?.toUpperCase()?.includes('REJECT') ? 'REJECTED' : 'PENDING') as any,
      }));
      return { data: mapped, error: null };
    } catch {
      return { data: [], error: null };
    }
  },

  async createLeaveRequest(payload: CreateLeaveRequestPayload): Promise<any> {
    const emp = (await this.fetchEmployees()).data?.find(e => e.id === payload.employee_id);
    const body = {
      employee_code: emp?.pid || (payload.employee_id === 2 ? 'BC-1004' : payload.employee_id === 6 ? 'BC-1006' : 'BC-1038'),
      employee_name: emp?.name || 'Rahul Varma',
      leave_type: (payload as any).leave_type_code || 'CL',
      from_date: payload.start_date,
      to_date: payload.end_date,
      days: String((payload as any).chargeable_days || 1),
      reason: payload.reason || 'Leave requested',
    };
    return request('/v1/leave/apply', { method: 'POST', body: JSON.stringify(body) });
  },

  async approveLeaveRequest(id: number, _payload?: any): Promise<any> {
    return request(`/v1/leave/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'Approved' }) });
  },

  async rejectLeaveRequest(id: number, _payload?: any): Promise<any> {
    return request(`/v1/leave/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'Rejected' }) });
  },

  async cancelLeaveRequest(id: number): Promise<boolean> {
    await request(`/v1/leave/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'Cancelled' }) }).catch(() => {});
    return true;
  },

  async calculateLeaveDays(payload: any): Promise<ApiResponse<LeaveCalculationResult>> {
    try {
      const res = await request<LeaveCalculationResult>('/v1/time/leave-calculator', { method: 'POST', body: JSON.stringify(payload) });
      return { data: res, error: null };
    } catch {
      const s = new Date(payload.start_date), e = new Date(payload.end_date);
      const diff = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 3600 * 24)) + 1);
      return {
        data: {
          start_date: payload.start_date, end_date: payload.end_date, total_calendar_days: diff,
          chargeable_days: payload.is_half_day ? 0.5 : diff, weekend_days_count: 0, weekend_days: 0,
          holidays_count: 0, holiday_days: 0, working_days: diff, policy_applied: 'Standard Policy',
          leave_type_code: payload.leave_type_code, breakdown: [],
        },
        error: null,
      };
    }
  },

  async countLeaveDays(payload: CountLeaveDaysRequest): Promise<any> {
    const res = await this.calculateLeaveDays(payload);
    return res.data;
  },

  async fetchWfhRequests(_params?: any): Promise<ApiResponse<WorkFromHomeRequest[]>> {
    try {
      const data = await request<any[]>('/v1/time/wfh');
      return { data: (data || []).map((w: any, idx: number) => ({
        id: Number(String(w.id).replace(/\D/g, '')) || idx + 1,
        employee_id: 1,
        employee_name: w.employee_name || 'Rahul Varma',
        start_date: w.dates || new Date().toISOString().slice(0, 10),
        end_date: w.dates || new Date().toISOString().slice(0, 10),
        reason: w.reason || '',
        status: (w.status || 'PENDING') as any,
      })), error: null };
    } catch {
      return { data: [], error: null };
    }
  },

  async createWfhRequest(payload: CreateWfhPayload): Promise<any> {
    const emp = (await this.fetchEmployees()).data?.find(e => e.id === payload.employee_id);
    return request('/v1/time/wfh', {
      method: 'POST',
      body: JSON.stringify({
        employee_id: emp?.pid || 'BC-1038',
        employee_name: emp?.name || 'Rahul Varma',
        dates: payload.start_date || new Date().toISOString().slice(0, 10),
        reason: payload.reason,
      }),
    });
  },

  async approveWfhRequest(id: string | number, _payload?: any): Promise<any> {
    return request(`/v1/time/wfh/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'Approved' }) });
  },

  async rejectWfhRequest(id: string | number, _payload?: any): Promise<any> {
    return request(`/v1/time/wfh/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'Rejected' }) });
  },

  async fetchCompOffBalance(employeeId: number): Promise<ApiResponse<CompOffBalance>> {
    return {
      data: { employee_id: employeeId, available_days: 2.0, total_earned_days: 3.0, used_days: 1.0, pending_days: 0.0 },
      error: null,
    };
  },

  async getCompOffBalance(employeeId: number): Promise<ApiResponse<CompOffBalance>> {
    return this.fetchCompOffBalance(employeeId);
  },

  async fetchCompOffRequests(_params?: any): Promise<ApiResponse<CompOffRequest[]>> {
    try {
      const data = await request<any[]>('/v1/time/compoff');
      return { data: (data || []).map((c: any, idx: number) => ({
        id: Number(String(c.id).replace(/\D/g, '')) || idx + 1,
        employee_id: 1,
        employee_name: c.employee_name || 'Rahul Varma',
        requested_date: c.worked_date || c.comp_off_date || new Date().toISOString().slice(0, 10),
        days_requested: 1,
        reason: c.reason || '',
        status: (c.status || 'PENDING') as any,
      })), error: null };
    } catch {
      return { data: [], error: null };
    }
  },

  async fetchCompOffEntitlements(_employeeId?: number): Promise<ApiResponse<CompOffEntitlement[]>> {
    return { data: [], error: null };
  },

  async grantCompOffEntitlement(payload: GrantCompOffPayload): Promise<any> {
    return { id: 1, ...payload, status: 'ACTIVE' };
  },

  async createCompOffRequest(payload: CreateCompOffRequestPayload): Promise<any> {
    const emp = (await this.fetchEmployees()).data?.find(e => e.id === payload.employee_id);
    return request('/v1/time/compoff', {
      method: 'POST',
      body: JSON.stringify({
        employee_id: emp?.pid || 'BC-1038',
        employee_name: emp?.name || 'Rahul Varma',
        worked_date: payload.requested_date || new Date().toISOString().slice(0, 10),
        comp_off_date: payload.requested_date || new Date().toISOString().slice(0, 10),
        reason: payload.reason,
      }),
    });
  },

  async approveCompOffRequest(id: string | number, _payload?: any): Promise<any> {
    return request(`/v1/time/compoff/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'Approved' }) });
  },

  async rejectCompOffRequest(id: string | number, _payload?: any): Promise<any> {
    return request(`/v1/time/compoff/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'Rejected' }) });
  },

  async fetchSwapRequests(params?: any): Promise<ApiResponse<SwapRequestDetail[]>> {
    try {
      const data = await request<any[]>('/v1/time/swaps');
      let list: SwapRequestDetail[] = Array.isArray(data) ? data.map((s: any) => ({
        id: Number(s.id),
        requester_id: Number(s.requester_id) || 7,
        requester_name: s.requester_name || 'Rahul Varma',
        requester_email: `${(s.requester_name || 'emp').toLowerCase().replace(/\s+/g, '.')}@brightcone.ai`,
        source_shift_code: s.original_shift || 'GEN',
        request_date: s.original_date || new Date().toISOString().slice(0, 10),
        target_employee_id: Number(s.target_employee_id) || 2,
        target_employee_name: s.target_employee_name || 'Ananya Rao',
        target_shift_code: s.target_shift || 'MORN',
        target_date: s.original_date || new Date().toISOString().slice(0, 10),
        reason: s.reason || '',
        status: (s.status?.toUpperCase()?.includes('APPROV') ? 'APPROVED' : s.status?.toUpperCase()?.includes('REJECT') ? 'REJECTED' : 'PENDING') as any,
        created_at: s.created_at || new Date().toISOString(),
      })) : [];

      if (params?.status && params.status !== 'ALL') {
        list = list.filter((r) => r.status === params.status);
      }
      return { data: list, error: null };
    } catch {
      return { data: [], error: null };
    }
  },

  async createSwapRequest(payload: CreateSwapPayload): Promise<any> {
    const emps = (await this.fetchEmployees()).data || [];
    const reqEmp = emps.find(e => e.id === payload.requester_id);
    const tgtEmp = emps.find(e => e.id === payload.target_employee_id);
    return request('/v1/time/swaps', {
      method: 'POST',
      body: JSON.stringify({
        requester_id: payload.requester_id,
        requester_name: reqEmp ? reqEmp.name : 'Rahul Varma',
        requester_code: reqEmp?.pid || 'BC-1038',
        target_employee_id: payload.target_employee_id,
        target_employee_name: tgtEmp ? tgtEmp.name : 'Ananya Rao',
        original_date: payload.request_date,
        original_shift: 'General Shift (09:30 - 18:30)',
        target_shift: 'Morning Shift (06:00 - 15:00)',
        reason: payload.reason,
      }),
    });
  },

  async approveSwapRequest(id: number, _payload?: any): Promise<any> {
    return request(`/v1/time/swaps/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'Approved' }) });
  },

  async rejectSwapRequest(id: number, _payload?: any): Promise<any> {
    return request(`/v1/time/swaps/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'Rejected' }) });
  },

  async cancelSwapRequest(id: number): Promise<boolean> {
    await request(`/v1/time/swaps/${id}`, { method: 'DELETE' }).catch(() => {});
    return true;
  },

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch('/api/v1/health');
      return res.ok;
    } catch {
      return false;
    }
  },
};

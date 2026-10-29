export interface DateDayDetail {
  date: string;
  day_name: string;
  is_weekend: boolean;
  is_scheduled_off: boolean;
  is_holiday: boolean;
  holiday_name: string | null;
  is_chargeable: boolean;
  chargeable_value: number;
}

export interface LeaveCalculationResult {
  start_date: string;
  end_date: string;
  total_calendar_days: number;
  chargeable_days: number;
  weekend_days_count: number;
  weekend_days?: number;
  holidays_count: number;
  holiday_days?: number;
  working_days: number;
  policy_applied: string;
  leave_type_code: string | null;
  breakdown: DateDayDetail[];
}

export interface CountLeaveDaysRequest {
  start_date: string;
  end_date: string;
  employee_id?: number;
  leave_type_id?: number;
  leave_type_code?: string;
  is_half_day?: boolean;
}

export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveRequest {
  id: number;
  pid?: string;
  employee_id: number;
  employee_name: string;
  avatar_color?: string;
  employee_email?: string | null;
  employee_department?: string | null;
  leave_type_id: number;
  leave_type_name: string;
  leave_type_code: string;
  is_paid?: boolean;
  start_date: string;
  end_date: string;
  is_half_day?: boolean;
  reason: string;
  chargeable_days: number;
  total_days?: number;
  status: LeaveRequestStatus | string;
  reviewer_name?: string | null;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  created_at?: string;
}

export interface CreateLeaveRequestPayload {
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  is_half_day?: boolean;
  reason: string;
}

export interface ApproveLeaveRequestPayload {
  reviewer_name?: string;
}

export interface RejectLeaveRequestPayload {
  reviewer_name?: string;
  rejection_reason: string;
}

export interface LeaveRequestQuery {
  employee_id?: number;
  status?: string;
  year?: number;
}

export interface LeaveBalanceItem {
  leave_type_id: number;
  leave_type_name: string;
  leave_type_code: string;
  is_paid: boolean;
  entitled_days: number;
  consumed_days: number;
  pending_days: number;
  remaining_days: number;
}

export interface LeaveBalanceResponse {
  employee_id: number;
  year: number;
  balances: LeaveBalanceItem[];
}

export type WfhStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface WorkFromHomeRequest {
  id: number;
  pid?: string;
  employee_id: number;
  employee_name: string;
  employee_email?: string;
  employee_department?: string;
  avatar_color?: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: WfhStatus | string;
  reviewer_name?: string | null;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  created_at?: string;
}

export interface CreateWfhPayload {
  employee_id: number;
  start_date: string;
  end_date: string;
  reason: string;
}

export interface ApproveWfhPayload {
  reviewer_name?: string;
}

export interface RejectWfhPayload {
  reviewer_name?: string;
  rejection_reason: string;
}

export interface WfhQuery {
  employee_id?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
}

export interface CompOffBalance {
  employee_id: number;
  employee_name?: string | null;
  total_earned_days: number;
  used_days: number;
  pending_days: number;
  available_days: number;
}

export interface CompOffEntitlement {
  id: number;
  pid?: string;
  employee_id: number;
  employee_name: string;
  employee_email?: string;
  employee_department?: string;
  avatar_color?: string;
  earned_date: string;
  days_earned: number;
  reason: string;
  expiry_date?: string | null;
  status: string;
  created_at?: string;
}

export interface CompOffRequest {
  id: number;
  pid?: string;
  employee_id: number;
  employee_name: string;
  employee_email?: string;
  employee_department?: string;
  avatar_color?: string;
  requested_date: string;
  days_requested: number;
  reason: string;
  status: string;
  reviewer_name?: string | null;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  created_at?: string;
}

export interface GrantCompOffPayload {
  employee_id: number;
  earned_date: string;
  days_earned: number;
  reason: string;
  expiry_date?: string | null;
}

export interface CreateCompOffRequestPayload {
  employee_id: number;
  requested_date: string;
  days_requested?: number;
  reason: string;
}

export interface ApproveCompOffPayload {
  reviewer_name?: string;
}

export interface RejectCompOffPayload {
  reviewer_name?: string;
  rejection_reason: string;
}

export interface CompOffQuery {
  employee_id?: number;
  status?: string;
}

export type SwapStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface SwapRequestDetail {
  id: number;
  pid?: string;
  requester_id: number;
  requester_name: string;
  requester_email?: string;
  requester_department?: string;
  requester_avatar_color?: string;
  target_employee_id?: number | null;
  target_employee_name?: string | null;
  target_employee_avatar_color?: string;
  request_date: string;
  target_date?: string | null;
  source_shift_code?: string | null;
  target_shift_code?: string | null;
  status: SwapStatus | string;
  reason?: string | null;
  reviewer_name?: string | null;
  created_at?: string;
}

export interface CreateSwapPayload {
  requester_id: number;
  target_employee_id?: number | null;
  request_date: string;
  target_date?: string | null;
  source_shift_id?: number | null;
  target_shift_id?: number | null;
  reason?: string | null;
}

export interface ApproveSwapPayload {
  reviewer_name?: string;
}

export interface RejectSwapPayload {
  reviewer_name?: string;
  rejection_reason: string;
}

export interface SwapQuery {
  employee_id?: number;
  status?: string;
  date?: string;
}

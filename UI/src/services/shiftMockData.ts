import type { Shift, LeaveType, LeaveQuota, SwapRequestDetail, Employee } from '../types';

export const INITIAL_LEAVE_TYPES: LeaveType[] = [
  { id: 1, name: 'Casual Leave', code: 'CL', description: 'For personal errands and short absences.', is_paid: true, is_active: true },
  { id: 2, name: 'Sick Leave', code: 'SL', description: 'For personal illnesses and healthcare needs.', is_paid: true, is_active: true },
  { id: 3, name: 'Earned Leave / Annual Vacation', code: 'EL', description: 'Planned vacation days.', is_paid: true, is_active: true },
  { id: 4, name: 'Maternity Leave', code: 'ML', description: 'Statutory paid leave for expectant mothers.', is_paid: true, is_active: true },
  { id: 5, name: 'Loss of Pay', code: 'LOP', description: 'Unpaid leaves taken after exhaust of eligible quotas.', is_paid: false, is_active: true },
];

export const INITIAL_LEAVE_QUOTAS: LeaveQuota[] = [
  { id: 1, leave_type_id: 1, leave_type_name: 'Casual Leave', leave_type_code: 'CL', year: 2026, entitled_days: 12.0, applicable_group: 'ALL' },
  { id: 2, leave_type_id: 2, leave_type_name: 'Sick Leave', leave_type_code: 'SL', year: 2026, entitled_days: 10.5, applicable_group: 'ALL' },
  { id: 3, leave_type_id: 3, leave_type_name: 'Earned Leave / Annual Vacation', leave_type_code: 'EL', year: 2026, entitled_days: 18.0, applicable_group: 'ALL' },
  { id: 4, leave_type_id: 4, leave_type_name: 'Maternity Leave', leave_type_code: 'ML', year: 2026, entitled_days: 182.0, applicable_group: 'FEMALE' },
  { id: 5, leave_type_id: 5, leave_type_name: 'Loss of Pay', leave_type_code: 'LOP', year: 2026, entitled_days: 0.0, applicable_group: 'ALL' },
];

export const INITIAL_SHIFTS: Shift[] = [
  { id: 1, name: 'Morning Shift', code: 'MORN', start_time: '06:00', end_time: '14:30', break_duration_minutes: 45, grace_period_minutes: 15, is_overnight: false, is_active: true },
  { id: 2, name: 'General Shift', code: 'GEN', start_time: '09:00', end_time: '18:00', break_duration_minutes: 60, grace_period_minutes: 15, is_overnight: false, is_active: true },
  { id: 3, name: 'Evening Shift', code: 'EVE', start_time: '14:00', end_time: '22:30', break_duration_minutes: 45, grace_period_minutes: 15, is_overnight: false, is_active: true },
  { id: 4, name: 'Night Shift', code: 'NIGHT', start_time: '22:00', end_time: '06:30', break_duration_minutes: 45, grace_period_minutes: 15, is_overnight: true, is_active: true },
];

export const INITIAL_SWAP_REQUESTS: SwapRequestDetail[] = [
  {
    id: 1,
    requester_id: 6,
    requester_name: 'Rahul Varma',
    requester_email: 'rahul.varma@brightcone.ai',
    source_shift_code: 'GEN',
    request_date: '2026-10-30',
    target_employee_id: 3,
    target_employee_name: 'Karthik Reddy',
    target_shift_code: 'MORN',
    target_date: '2026-10-30',
    reason: 'Family appointment in the afternoon',
    status: 'PENDING',
    created_at: '2026-10-27T08:00:00Z',
  },
  {
    id: 2,
    requester_id: 2,
    requester_name: 'Ananya Rao',
    requester_email: 'ananya.rao@brightcone.ai',
    source_shift_code: 'GEN',
    request_date: '2026-10-29',
    target_employee_id: 4,
    target_employee_name: 'Priya Menon',
    target_shift_code: 'MORN',
    target_date: '2026-10-29',
    reason: 'Doctor checkup',
    status: 'APPROVED',
    created_at: '2026-10-26T10:00:00Z',
  },
];

export const DEFAULT_EMPLOYEES_LIST: Employee[] = [
  { id: 1, name: 'Naresh Vemparala', email: 'naresh.vemparala@brightcone.ai', role: 'Founder & CEO', department: 'Leadership', avatar_color: 'bg-purple-600', is_active: true },
  { id: 2, name: 'Ananya Rao', email: 'ananya.rao@brightcone.ai', role: 'People Ops Lead', department: 'People Ops', avatar_color: 'bg-pink-600', is_active: true },
  { id: 3, name: 'Karthik Reddy', email: 'karthik.reddy@brightcone.ai', role: 'Principal AI Engineer', department: 'AI Research', avatar_color: 'bg-emerald-600', is_active: true },
  { id: 4, name: 'Priya Menon', email: 'priya.menon@brightcone.ai', role: 'Head of Product', department: 'Product', avatar_color: 'bg-blue-600', is_active: true },
  { id: 5, name: 'Meera Joshi', email: 'meera.joshi@brightcone.ai', role: 'Finance Lead', department: 'Finance', avatar_color: 'bg-amber-600', is_active: true },
  { id: 6, name: 'Rahul Varma', email: 'rahul.varma@brightcone.ai', role: 'Backend Engineer', department: 'Engineering', avatar_color: 'bg-teal-600', is_active: true },
  { id: 7, name: 'Sneha Iyer', email: 'sneha.iyer@brightcone.ai', role: 'Product Designer', department: 'Design', avatar_color: 'bg-indigo-600', is_active: true },
  { id: 8, name: 'Arjun Nair', email: 'arjun.nair@brightcone.ai', role: 'Account Executive', department: 'Sales', avatar_color: 'bg-cyan-600', is_active: true },
  { id: 9, name: 'Daniel Brooks', email: 'daniel.brooks@brightcone.ai', role: 'DevOps Engineer', department: 'Engineering', avatar_color: 'bg-rose-600', is_active: true },
  { id: 10, name: 'Emily Carter', email: 'emily.carter@brightcone.ai', role: 'Marketing Lead', department: 'Marketing', avatar_color: 'bg-orange-600', is_active: true },
  { id: 11, name: 'Vikram Singh', email: 'vikram.singh@brightcone.ai', role: 'Security Architect', department: 'Engineering', avatar_color: 'bg-slate-600', is_active: true },
  { id: 12, name: 'Lakshmi Prasad', email: 'lakshmi.prasad@brightcone.ai', role: 'Support Specialist', department: 'Support', avatar_color: 'bg-emerald-700', is_active: true },
  { id: 13, name: 'Farhan Ali', email: 'farhan.ali@brightcone.ai', role: 'Operations Associate', department: 'Operations', avatar_color: 'bg-blue-700', is_active: true },
  { id: 14, name: 'Divya Kulkarni', email: 'divya.kulkarni@brightcone.ai', role: 'Growth Specialist', department: 'Marketing', avatar_color: 'bg-purple-700', is_active: true },
];

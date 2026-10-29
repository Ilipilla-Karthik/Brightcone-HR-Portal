import { shiftApi, request } from './shiftApi';
import type { WeeklyRosterResponse, AssignShiftPayload, PublishRosterPayload, Holiday, Shift } from '../types';

export const attendanceWeeklyApi = {
  async fetchWeeklyRoster(weekStart: string): Promise<WeeklyRosterResponse> {
    const empRes = await shiftApi.fetchEmployees();
    const employees = empRes.data || [];

    let dbRoster: any[] = [];
    try {
      const data = await request<any[]>('/v1/roster');
      if (Array.isArray(data)) dbRoster = data;
    } catch {}

    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, idx) => {
      const d = new Date(start);
      d.setDate(d.getDate() + idx);
      return {
        date: d.toISOString().split('T')[0],
        day_name: dayName,
        day_number: d.getDate(),
      };
    });

    const isPublished = dbRoster.length > 0 ? dbRoster.some(r => r.status === 'Published') : true;

    const rosterRows: any[] = employees.map((emp: any) => {
      const isWeekendDay = (name: string) => name === 'Sat' || name === 'Sun';
      const assignments = days.map((day) => {
        const custom = dbRoster.find(r =>
          (r.employeeCode === emp.pid || r.employee_code === emp.pid || r.employeeName === emp.name || r.employee_name === emp.name) &&
          (r.startDate <= day.date && r.endDate >= day.date)
        );
        const shiftCode = custom ? (custom.shiftCode || custom.shift_code || 'GEN') : (isWeekendDay(day.day_name) ? null : 'GEN');
        const shiftName = shiftCode === 'MORN' ? 'Morning Shift' : shiftCode === 'EVE' ? 'Evening Shift' : shiftCode === 'NIGHT' ? 'Night Shift' : shiftCode ? 'General Shift' : null;
        const isOff = isWeekendDay(day.day_name) && !custom;

        return {
          date: day.date,
          day_name: day.day_name,
          day_number: day.day_number,
          shift_id: isOff ? null : 2,
          shift_name: shiftName,
          shift_code: shiftCode,
          is_off: isOff,
          status: (isOff ? 'OFF' : (custom?.status || 'CONFIRMED')) as any,
          notes: null,
        };
      });

      return {
        id: emp.id,
        pid: emp.pid || `EMP-${emp.id}`,
        name: emp.name || emp.full_name || 'Staff Member',
        employee_id: emp.id,
        employee_name: emp.name || emp.full_name || 'Staff Member',
        email: emp.email || emp.work_email || '',
        role: emp.role || emp.job_title || 'Software Engineer',
        employee_role: emp.role || emp.job_title || 'Software Engineer',
        department: emp.department || 'Engineering',
        employee_department: emp.department || 'Engineering',
        avatar_color: emp.avatar_color || 'emerald',
        default_shift_name: 'General Shift',
        days: assignments,
        assignments,
      };
    });

    return {
      week_start: weekStart,
      week_end: end.toISOString().split('T')[0],
      is_published: isPublished,
      summary: {
        scheduled_today: employees.length,
        total_employees: employees.length,
        shifts_defined: 4,
        shift_codes: ['GEN', 'MORN', 'EVE', 'NIGHT'],
        swap_requests_count: 0,
        on_leave_this_week_count: 0,
      },
      employees: rosterRows,
    };
  },

  async assignShift(payload: AssignShiftPayload): Promise<any> {
    const empRes = await shiftApi.fetchEmployees();
    const emp = empRes.data?.find(e => e.id === payload.employee_id);
    const body = {
      employeeCode: emp?.pid || `EMP-${payload.employee_id}`,
      employeeName: emp?.name || 'Staff Member',
      shiftCode: (payload as any).shift_code || 'GEN',
      startDate: payload.date || new Date().toISOString().slice(0, 10),
      endDate: payload.date || new Date().toISOString().slice(0, 10),
      status: 'Assigned',
    };
    return request('/v1/roster', { method: 'POST', body: JSON.stringify(body) });
  },

  async publishRoster(_payload?: PublishRosterPayload): Promise<any> {
    return request('/v1/roster/publish', { method: 'POST' });
  },

  async bulkAssignShift(payload: any): Promise<any> {
    return this.assignShift(payload);
  },

  async fetchShifts(): Promise<Shift[]> {
    const res = await shiftApi.fetchShifts();
    return res.data || [];
  },

  async createShift(payload: any): Promise<boolean> {
    return shiftApi.createShift(payload);
  },

  async updateShift(id: number, payload: any): Promise<boolean> {
    return shiftApi.updateShift(id, payload);
  },

  async deleteShift(id: number): Promise<boolean> {
    return shiftApi.deleteShift(id);
  },

  async fetchHolidays(): Promise<Holiday[]> {
    const res = await shiftApi.fetchHolidays();
    return res.data || [];
  },

  async createHoliday(payload: any): Promise<any> {
    return request('/v1/holidays', {
      method: 'POST',
      body: JSON.stringify({
        name: payload.name,
        holidayDate: payload.holiday_date || payload.date,
        description: payload.description || 'Public holiday',
        applicableLocation: payload.applicable_location || 'All Locations',
        isRecurring: payload.is_recurring ?? true,
      }),
    });
  },

  async updateHoliday(id: number, payload: any): Promise<any> {
    return request(`/v1/holidays/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: payload.name,
        holidayDate: payload.holiday_date || payload.date,
        description: payload.description,
        applicableLocation: payload.applicable_location,
        isRecurring: payload.is_recurring,
      }),
    });
  },

  async deleteHoliday(id: number): Promise<boolean> {
    await request(`/v1/holidays/${id}`, { method: 'DELETE' }).catch(() => {});
    return true;
  },

  async fetchLeaveQuotas(): Promise<any[]> {
    const res = await shiftApi.fetchLeaveQuotas();
    return res.data || [];
  },
};

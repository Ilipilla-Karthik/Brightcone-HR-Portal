import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Calendar,
  AlertCircle,
  User,
  Timer,
  ChevronDown,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import type { Employee, DailyAttendanceRecord, TodayAttendanceStatus } from '../../types';
import { attendanceApi } from '../../services/attendanceApi';
import { ClockPunchControls } from './ClockPunchControls';

interface AttendanceClockCardProps {
  employees: Employee[];
  onAttendanceChange?: () => void;
  showSuccessToast?: (msg: string) => void;
  onRequestCorrection?: (employeeId?: number) => void;
}

export const AttendanceClockCard: React.FC<AttendanceClockCardProps> = ({
  employees,
  onAttendanceChange,
  showSuccessToast,
  onRequestCorrection,
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<number | null>(null);
  const [todayStatus, setTodayStatus] = useState<TodayAttendanceStatus | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [clockNote, setClockNote] = useState<string>('');
  const [showNoteInput, setShowNoteInput] = useState<boolean>(false);

  const isEmployeePersona = typeof window !== 'undefined' && (
    localStorage.getItem('persona') === 'employee' ||
    localStorage.getItem('user')?.toLowerCase().includes('rahul')
  );

  useEffect(() => {
    if (employees.length > 0) {
      if (isEmployeePersona) {
        const rahul = employees.find(
          (e) => e.name.toLowerCase().includes('rahul') || e.email.toLowerCase().includes('rahul')
        );
        setSelectedEmpId(rahul ? rahul.id : employees[0].id);
      } else if (selectedEmpId === null) {
        setSelectedEmpId(employees[0].id);
      }
    }
  }, [employees, isEmployeePersona, selectedEmpId]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedEmpId) return;
    let isCurrent = true;
    setIsLoadingStatus(true);
    setCardError(null);

    attendanceApi
      .getTodayStatus(selectedEmpId)
      .then((res: any) => {
        if (!isCurrent) return;
        setIsLoadingStatus(false);
        if (res.data) setTodayStatus(res.data);
        else if (res.error) setCardError(res.error);
      })
      .catch((err: unknown) => {
        if (!isCurrent) return;
        setIsLoadingStatus(false);
        setCardError(err instanceof Error ? err.message : 'Failed to query attendance status');
      });

    return () => { isCurrent = false; };
  }, [selectedEmpId]);

  const currentEmployee = useMemo(() => {
    return employees.find((e) => e.id === selectedEmpId) || employees[0] || null;
  }, [employees, selectedEmpId]);

  const formattedToday = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(currentTime);
  }, [currentTime]);

  const formattedClock = useMemo(() => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }, [currentTime]);

  const formatTimeDisplay = (timeStr?: string | null): string => {
    if (!timeStr) return '--:--';
    const parts = timeStr.trim().split(':');
    if (parts.length >= 2) {
      const hour = parseInt(parts[0], 10);
      const min = parts[1];
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 === 0 ? 12 : hour % 12;
      return `${hour12 < 10 ? '0' + hour12 : hour12}:${min} ${ampm}`;
    }
    return timeStr;
  };

  const liveElapsedTime = useMemo(() => {
    if (!todayStatus?.record?.in_time || todayStatus?.record?.out_time) return null;
    const [h, m, s] = todayStatus.record.in_time.split(':').map((v) => parseInt(v, 10));
    const clockInDate = new Date(currentTime);
    clockInDate.setHours(h || 0, m || 0, s || 0, 0);
    const diffMs = currentTime.getTime() - clockInDate.getTime();
    if (diffMs <= 0) return '0h 0m';
    const diffMins = Math.floor(diffMs / 60000);
    return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
  }, [todayStatus, currentTime]);

  const handleClockIn = async () => {
    if (!selectedEmpId) return;
    setIsSubmitting(true);
    setCardError(null);
    try {
      const record: DailyAttendanceRecord = await attendanceApi.clockIn({
        employee_id: selectedEmpId,
        notes: clockNote.trim() || undefined,
      });
      setTodayStatus({
        date: record.attendance_date,
        employee_id: selectedEmpId,
        record,
        can_clock_in: false,
        can_clock_out: true,
        status: 'CLOCKED_IN',
      });
      setClockNote('');
      setShowNoteInput(false);
      showSuccessToast?.(`Clock-in recorded for ${record.employee_name || currentEmployee?.name} at ${formatTimeDisplay(record.in_time)}.`);
      onAttendanceChange?.();
    } catch (err: unknown) {
      setCardError(err instanceof Error ? err.message : 'Clock-in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClockOut = async () => {
    if (!selectedEmpId) return;
    setIsSubmitting(true);
    setCardError(null);
    try {
      const record: DailyAttendanceRecord = await attendanceApi.clockOut({
        employee_id: selectedEmpId,
        notes: clockNote.trim() || undefined,
      });
      setTodayStatus({
        date: record.attendance_date,
        employee_id: selectedEmpId,
        record,
        can_clock_in: false,
        can_clock_out: false,
        status: 'CLOCKED_OUT',
      });
      setClockNote('');
      setShowNoteInput(false);
      showSuccessToast?.(`Clock-out recorded! Total worked: ${record.hours_worked} hrs.`);
      onAttendanceChange?.();
    } catch (err: unknown) {
      setCardError(err instanceof Error ? err.message : 'Clock-out failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const status = todayStatus?.status || 'NOT_CLOCKED_IN';
  const record = todayStatus?.record;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-br dark:from-[#0A1326] dark:via-[#0E1B38] dark:to-[#0A1326] border border-[#E3E8F2] dark:border-[#1C3262] shadow-sm p-5 sm:p-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3E8F2] dark:border-[#16274E]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0B6FDB] to-[#38BDF8] flex items-center justify-center text-white shadow-md shadow-[#0B6FDB]/20">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-[#0E1730] dark:text-white tracking-tight">Attendance Terminal</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#D97706] dark:text-[#F59E0B] bg-[#FFFBEB] dark:bg-[#78350F]/30 border border-[#FDE68A] dark:border-[#B45309]/40 px-2 py-0.5 rounded-md">
                <ShieldAlert className="w-2.5 h-2.5" /> Demo: Live PostgreSQL
              </span>
            </div>
            <p className="text-xs text-[#5B6787] dark:text-[#889DC7]">Real-time PostgreSQL clock-in and clock-out tracking (Client-simulated identity)</p>
          </div>
        </div>

        {employees.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            {isLoadingStatus && (
              <span className="flex items-center gap-1 text-[10px] text-[#0B6FDB] animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" /> <span>Syncing...</span>
              </span>
            )}
            {isEmployeePersona ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0FDF4] dark:bg-[#064E3B]/30 border border-[#BBF7D0] dark:border-[#059669]/30 text-xs font-semibold text-[#166534] dark:text-[#34D399]">
                <User className="w-3.5 h-3.5" />
                <span>{currentEmployee?.name || 'Rahul Varma'} ({currentEmployee?.department || 'Engineering'})</span>
              </div>
            ) : (
              <div className="relative">
                <select
                  id="employee-select"
                  value={selectedEmpId || ''}
                  onChange={(e) => setSelectedEmpId(Number(e.target.value))}
                  disabled={isLoadingStatus || isSubmitting}
                  className="appearance-none bg-[#F8FAFD] dark:bg-[#0D1833] border border-[#E3E8F2] dark:border-[#1E3466] text-[#0E1730] dark:text-white text-xs font-medium rounded-xl pl-8 pr-8 py-2 cursor-pointer shadow-xs"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id} className="bg-white dark:bg-[#0A1326] text-[#0E1730] dark:text-white">
                      {emp.name} ({emp.department} · {emp.role})
                    </option>
                  ))}
                </select>
                <User className="w-3.5 h-3.5 text-[#5B6787] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3.5 h-3.5 text-[#5B6787] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          </div>
        )}
      </div>

      {cardError && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-red-500/10 border border-rose-200 dark:border-red-500/30 text-xs text-rose-700 dark:text-red-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{cardError}</span>
          </div>
          <button onClick={() => setCardError(null)} className="underline cursor-pointer">Dismiss</button>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        <div className="md:col-span-5 flex flex-col justify-center space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-[#5B6787] dark:text-[#889DC7]">
            <Calendar className="w-3.5 h-3.5 text-[#0B6FDB]" />
            <span>{formattedToday}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#0B6FDB]" />
            <span className="font-['Sora'] text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0E1730] dark:text-white">
              {formattedClock}
            </span>
          </div>
          <div className="text-[11px] text-[#64748B] dark:text-[#6A789A]">
            Active Employee: <span className="font-semibold text-[#0E1730] dark:text-[#C4D0EC]">{currentEmployee?.name || 'Naresh Vemparala'}</span>
          </div>
        </div>

        <ClockPunchControls
          status={status}
          record={record}
          isLoadingStatus={isLoadingStatus}
          isSubmitting={isSubmitting}
          liveElapsedTime={liveElapsedTime}
          formatTimeDisplay={formatTimeDisplay}
          onClockIn={handleClockIn}
          onClockOut={handleClockOut}
        />
      </div>

      <div className="mt-4 pt-3 border-t border-[#E3E8F2] dark:border-[#16274E]/80 flex flex-wrap items-center justify-between text-xs gap-3">
        {status !== 'CLOCKED_OUT' && (
          <button
            type="button"
            onClick={() => setShowNoteInput(!showNoteInput)}
            className="text-[11px] text-[#0B6FDB] hover:underline cursor-pointer"
          >
            {showNoteInput ? 'Cancel note' : '+ Add optional shift note'}
          </button>
        )}
        <button
          type="button"
          onClick={() => onRequestCorrection?.(selectedEmpId || undefined)}
          className="text-[11px] text-[#5B6787] dark:text-[#889DC7] hover:underline cursor-pointer flex items-center gap-1 ml-auto"
        >
          <Clock className="w-3 h-3 text-[#0B6FDB]" /> Missed a punch? Request correction
        </button>
      </div>

      {showNoteInput && status !== 'CLOCKED_OUT' && (
        <div className="mt-3">
          <input
            type="text"
            value={clockNote}
            onChange={(e) => setClockNote(e.target.value)}
            placeholder="e.g., Working from remote client site today..."
            className="w-full text-xs px-3 py-2 rounded-xl bg-[#F8FAFD] dark:bg-[#070D1A] border border-[#E3E8F2] dark:border-[#1E3466] text-[#0E1730] dark:text-white"
          />
        </div>
      )}
    </div>
  );
};

export default AttendanceClockCard;

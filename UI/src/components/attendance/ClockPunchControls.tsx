import React from 'react';
import { LogIn, LogOut, CheckCircle2, Loader2 } from 'lucide-react';
import type { DailyAttendanceRecord } from '../../types/attendance';

interface ClockPunchControlsProps {
  status: string;
  record?: DailyAttendanceRecord | null;
  isLoadingStatus: boolean;
  isSubmitting: boolean;
  liveElapsedTime: string | null;
  formatTimeDisplay: (t?: string | null) => string;
  onClockIn: () => void;
  onClockOut: () => void;
}

export const ClockPunchControls: React.FC<ClockPunchControlsProps> = ({
  status,
  record,
  isLoadingStatus,
  isSubmitting,
  liveElapsedTime,
  formatTimeDisplay,
  onClockIn,
  onClockOut,
}) => {
  return (
    <>
      <div className="md:col-span-4 grid grid-cols-3 gap-2">
        <div className="bg-[#F8FAFD] dark:bg-[#070D1A]/80 border border-[#E3E8F2] dark:border-[#16274E] rounded-xl p-3 text-center flex flex-col justify-center min-h-[72px]">
          <span className="text-[10px] font-bold text-[#5B6787] dark:text-[#889DC7] uppercase tracking-wider">Clock In</span>
          {isLoadingStatus ? (
            <div className="flex items-center justify-center py-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0B6FDB]" />
            </div>
          ) : (
            <span className="text-sm font-bold font-mono text-[#0E1730] dark:text-white mt-0.5 truncate">
              {formatTimeDisplay(record?.in_time)}
            </span>
          )}
          <span className="text-[10px] text-[#64748B] dark:text-[#5B6787] mt-0.5">
            {record?.in_time ? 'Recorded' : 'Pending'}
          </span>
        </div>

        <div className="bg-[#F8FAFD] dark:bg-[#070D1A]/80 border border-[#E3E8F2] dark:border-[#16274E] rounded-xl p-3 text-center flex flex-col justify-center min-h-[72px]">
          <span className="text-[10px] font-bold text-[#5B6787] dark:text-[#889DC7] uppercase tracking-wider">Clock Out</span>
          {isLoadingStatus ? (
            <div className="flex items-center justify-center py-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0B6FDB]" />
            </div>
          ) : (
            <span className="text-sm font-bold font-mono text-[#0E1730] dark:text-white mt-0.5 truncate">
              {formatTimeDisplay(record?.out_time)}
            </span>
          )}
          <span className="text-[10px] text-[#64748B] dark:text-[#5B6787] mt-0.5">
            {record?.out_time ? 'Recorded' : 'Pending'}
          </span>
        </div>

        <div className="bg-[#F8FAFD] dark:bg-[#070D1A]/80 border border-[#E3E8F2] dark:border-[#16274E] rounded-xl p-3 text-center flex flex-col justify-center min-h-[72px]">
          <span className="text-[10px] font-bold text-[#5B6787] dark:text-[#889DC7] uppercase tracking-wider">Hours Worked</span>
          {isLoadingStatus ? (
            <div className="flex items-center justify-center py-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0B6FDB]" />
            </div>
          ) : (
            <span className="text-sm font-bold font-mono text-[#0B6FDB] dark:text-[#38BDF8] mt-0.5">
              {record?.hours_worked ? `${record.hours_worked}h` : liveElapsedTime || '0.00h'}
            </span>
          )}
          <span className="text-[10px] text-[#64748B] dark:text-[#5B6787] mt-0.5">
            {status === 'CLOCKED_IN' ? 'Running' : status === 'CLOCKED_OUT' ? 'Total' : 'Zero'}
          </span>
        </div>
      </div>

      <div className="md:col-span-3 flex flex-col items-center sm:items-end justify-center space-y-2.5">
        <div>
          {isLoadingStatus ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F1F5F9] dark:bg-[#16274E] text-[#5B6787]">
              <Loader2 className="w-3 h-3 animate-spin text-[#0B6FDB]" /> Checking status...
            </span>
          ) : status === 'NOT_CLOCKED_IN' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F1F5F9] dark:bg-[#1C2844] text-[#5B6787] dark:text-[#889DC7] border border-[#E2E8F0] dark:border-[#2B3F6C]">
              <span className="w-2 h-2 rounded-full bg-[#94A3B8]" /> Not Clocked In
            </span>
          ) : status === 'CLOCKED_IN' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] dark:bg-[#064E3B]/70 text-[#059669] border border-[#A7F3D0]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
              </span>
              Active Shift
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Shift Completed
            </span>
          )}
        </div>

        {status === 'NOT_CLOCKED_IN' && (
          <button
            type="button"
            onClick={onClockIn}
            disabled={isSubmitting || isLoadingStatus}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0B6FDB] to-[#0284C7] shadow-md shadow-[#0B6FDB]/25 transition-all cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            <span>Clock In Now</span>
          </button>
        )}

        {status === 'CLOCKED_IN' && (
          <button
            type="button"
            onClick={onClockOut}
            disabled={isSubmitting || isLoadingStatus}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#DC2626] to-[#EA580C] shadow-md shadow-[#DC2626]/25 transition-all cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            <span>Clock Out Now</span>
          </button>
        )}

        {status === 'CLOCKED_OUT' && (
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#0E1730] dark:text-[#889DC7] bg-[#F8FAFD] dark:bg-[#0D1833] border border-[#E3E8F2] dark:border-[#1E3466]">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>Attendance Recorded</span>
          </div>
        )}
      </div>
    </>
  );
};

export default ClockPunchControls;

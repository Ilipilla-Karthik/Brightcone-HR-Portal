import React from 'react';
import { Clock, Calendar, History } from 'lucide-react';
import type { AttendanceCorrectionRequest } from '../../types';

interface CorrectionAuditSnapshotProps {
  request: AttendanceCorrectionRequest;
  formatTimeDisplay: (t?: string | null) => string;
}

export const CorrectionAuditSnapshot: React.FC<CorrectionAuditSnapshotProps> = ({
  request,
  formatTimeDisplay,
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-[#F8FAFD] dark:bg-[#070D1A]/80 border border-[#E3E8F2] dark:border-[#16274E] flex flex-col justify-center">
          <span className="text-[10px] text-[#5B6787] uppercase font-bold tracking-wider">Employee</span>
          <span className="font-bold text-[#0E1730] dark:text-white mt-0.5">{request.employee_name}</span>
          <span className="text-[10px] text-[#5B6787]">{request.employee_department}</span>
        </div>
        <div className="p-3 rounded-xl bg-[#F8FAFD] dark:bg-[#070D1A]/80 border border-[#E3E8F2] dark:border-[#16274E] flex flex-col justify-center">
          <span className="text-[10px] text-[#5B6787] uppercase font-bold tracking-wider">Attendance Date</span>
          <span className="font-semibold text-[#0E1730] dark:text-white flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-[#0B6FDB]" /> {request.attendance_date}
          </span>
          <span className="text-[10px] text-[#5B6787]">Requested on {new Date(request.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-[#EFF6FF] dark:bg-[#0D1833] border border-[#BFDBFE] dark:border-[#1E3466] space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#0B6FDB] uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Requested Correction
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-[#0A1326] text-[#0E1730] dark:text-white border border-[#E3E8F2] dark:border-[#16274E]">
            {request.correction_type === 'MISSED_CLOCK_IN' ? 'Clock In Time' : 'Clock Out Time'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#5B6787]">Requested Time:</span>
          <span className="text-base font-black font-mono text-[#0B6FDB] dark:text-[#38BDF8]">
            {formatTimeDisplay(request.requested_time)}
          </span>
        </div>
        <div className="pt-2 border-t border-[#BFDBFE] dark:border-[#16274E]">
          <span className="text-[10px] text-[#5B6787] uppercase font-bold tracking-wider block mb-1">Reason Provided by Employee</span>
          <p className="text-[#0E1730] dark:text-white italic bg-white dark:bg-[#070D1A] p-2.5 rounded-lg border border-[#E3E8F2] dark:border-[#16274E]">
            &ldquo;{request.reason}&rdquo;
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-[#F8FAFD] dark:bg-[#070D1A]/60 border border-[#E3E8F2] dark:border-[#16274E] space-y-2 text-xs">
        <span className="text-[10px] text-[#5B6787] uppercase font-bold tracking-wider flex items-center gap-1.5">
          <History className="w-3 h-3 text-[#5B6787]" /> Original Attendance Snapshot (Audit Trail)
        </span>
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-white dark:bg-[#0A1326] p-2 rounded-lg border border-[#E3E8F2] dark:border-[#16274E]">
            <span className="text-[9px] text-[#5B6787] block">Prior Clock-In</span>
            <span className="font-mono font-semibold text-[#0E1730] dark:text-white">
              {request.previous_in_time ? formatTimeDisplay(request.previous_in_time) : 'None'}
            </span>
          </div>
          <div className="bg-white dark:bg-[#0A1326] p-2 rounded-lg border border-[#E3E8F2] dark:border-[#16274E]">
            <span className="text-[9px] text-[#5B6787] block">Prior Clock-Out</span>
            <span className="font-mono font-semibold text-[#0E1730] dark:text-white">
              {request.previous_out_time ? formatTimeDisplay(request.previous_out_time) : 'None'}
            </span>
          </div>
          <div className="bg-white dark:bg-[#0A1326] p-2 rounded-lg border border-[#E3E8F2] dark:border-[#16274E]">
            <span className="text-[9px] text-[#5B6787] block">Status</span>
            <span className="font-semibold text-[#0E1730] dark:text-white">{request.status}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default CorrectionAuditSnapshot;

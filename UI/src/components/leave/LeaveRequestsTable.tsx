import React from 'react';
import { Clock, CheckCircle2, XCircle, Eye, Trash2 } from 'lucide-react';
import type { LeaveRequest } from '../../types';

interface LeaveRequestsTableProps {
  requests: LeaveRequest[];
  isLoading: boolean;
  activeView: 'EMPLOYEE' | 'REVIEWER';
  onReview: (req: LeaveRequest) => void;
  onCancel: (id: number) => void;
}

export const LeaveRequestsTable: React.FC<LeaveRequestsTableProps> = ({
  requests,
  isLoading,
  activeView,
  onReview,
  onCancel,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
            Cancelled
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-[#5B6787]">
        <div className="w-5 h-5 border-2 border-[#0B6FDB] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading leave applications...
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-[#5B6787]">
        No leave applications found matching current criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-[#E3E8F2] dark:border-[#172649] bg-[#F8FAFD] dark:bg-[#060D1A] text-[#5B6787]">
            {activeView === 'REVIEWER' && <th className="py-3 px-4 font-semibold">Employee</th>}
            <th className="py-3 px-4 font-semibold">Leave Type</th>
            <th className="py-3 px-4 font-semibold">Dates</th>
            <th className="py-3 px-4 font-semibold">Duration</th>
            <th className="py-3 px-4 font-semibold">Reason</th>
            <th className="py-3 px-4 font-semibold">Status</th>
            <th className="py-3 px-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E3E8F2] dark:divide-[#172649]">
          {requests.map((req) => (
            <tr key={req.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
              {activeView === 'REVIEWER' && (
                <td className="py-3 px-4">
                  <span className="font-semibold text-[#0E1730] dark:text-white block">{req.employee_name}</span>
                  <span className="text-[10px] text-[#5B6787]">{req.employee_department}</span>
                </td>
              )}
              <td className="py-3 px-4">
                <span className="font-semibold text-[#0E1730] dark:text-white block">{req.leave_type_name}</span>
                <span className="text-[10px] text-[#5B6787]">{req.leave_type_code}</span>
              </td>
              <td className="py-3 px-4 font-mono">
                {req.start_date} to {req.end_date}
              </td>
              <td className="py-3 px-4 font-semibold text-[#0B6FDB]">{req.chargeable_days}d</td>
              <td className="py-3 px-4 text-[#5B6787] max-w-xs truncate">{req.reason}</td>
              <td className="py-3 px-4">{getStatusBadge(req.status)}</td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => onReview(req)}
                    className="p-1 rounded-lg text-[#5B6787] hover:text-[#0B6FDB] hover:bg-black/5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {req.status === 'PENDING' && (
                    <button
                      onClick={() => onCancel(req.id)}
                      className="p-1 rounded-lg text-[#5B6787] hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveRequestsTable;

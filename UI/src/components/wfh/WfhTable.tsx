import React from 'react';
import { Home, Plus, Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { WorkFromHomeRequest } from '../../types';

interface WfhTableProps {
  requests: WorkFromHomeRequest[];
  isLoading: boolean;
  activeView: 'EMPLOYEE' | 'REVIEWER';
  onReview: (req: WorkFromHomeRequest) => void;
  onRequestClick: () => void;
}

export const WfhTable: React.FC<WfhTableProps> = ({
  requests,
  isLoading,
  activeView,
  onReview,
  onRequestClick,
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
        Loading remote work records...
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="py-16 text-center text-xs text-[#5B6787] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#0B6FDB]/10 text-[#0B6FDB] flex items-center justify-center">
          <Home className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#0E1730] dark:text-white">No Work From Home Requests</h4>
          <p className="text-[11px] text-[#5B6787] mt-0.5">No remote working requests have been submitted yet.</p>
        </div>
        <button
          onClick={onRequestClick}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0B6FDB] hover:bg-[#0957B0] transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> <span>Create First Request</span>
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-[#E3E8F2] dark:border-[#172649] bg-[#F8FAFD] dark:bg-[#060D1A] text-[#5B6787]">
            {activeView === 'REVIEWER' && <th className="py-3 px-4 font-semibold">Employee</th>}
            <th className="py-3 px-4 font-semibold">Dates</th>
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
              <td className="py-3 px-4 font-mono">{req.start_date} to {req.end_date}</td>
              <td className="py-3 px-4 text-[#5B6787] max-w-xs truncate">{req.reason}</td>
              <td className="py-3 px-4">{getStatusBadge(req.status)}</td>
              <td className="py-3 px-4 text-right">
                <button
                  onClick={() => onReview(req)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#0B6FDB] bg-blue-50 hover:bg-blue-100 cursor-pointer"
                >
                  Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WfhTable;

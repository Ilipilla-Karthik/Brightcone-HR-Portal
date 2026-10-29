import React from 'react';
import { ArrowLeftRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { SwapRequestDetail } from '../../types';

interface SwapRequestsTableProps {
  requests: SwapRequestDetail[];
  isLoading: boolean;
  onReview: (req: SwapRequestDetail) => void;
  onCancel: (id: number) => void;
  onProposeClick: () => void;
}

export const SwapRequestsTable: React.FC<SwapRequestsTableProps> = ({
  requests,
  isLoading,
  onReview,
  onCancel,
  onProposeClick,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-3 h-3" /> APPROVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700">
            <XCircle className="w-3 h-3" /> REJECTED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
            CANCELLED
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
            <Clock className="w-3 h-3" /> PENDING
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-[#5B6787]">
        <div className="w-5 h-5 border-2 border-[#0B6FDB] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading shift swap proposals...
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="py-16 text-center text-xs text-[#5B6787] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#0B6FDB]/10 text-[#0B6FDB] flex items-center justify-center">
          <ArrowLeftRight className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#0E1730] dark:text-white">No Shift Swap Requests Found</h4>
          <p className="text-[11px] text-[#5B6787] mt-0.5">No shift swap proposals match the active view and filters.</p>
        </div>
        <button
          onClick={onProposeClick}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0B6FDB] text-white hover:bg-[#0957B0] transition-all cursor-pointer"
        >
          + Propose Shift Swap
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-[#F8FAFC] dark:bg-[#040A15]/60 border-b border-[#E3E8F2] dark:border-[#152347] text-[11px] font-bold text-[#54658B] dark:text-[#8D9BB8] uppercase tracking-wider">
            <th className="py-3 px-4">Requester</th>
            <th className="py-3 px-4">Target Colleague</th>
            <th className="py-3 px-4">Shift Exchange</th>
            <th className="py-3 px-4">Reason</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Review Details</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E3E8F2] dark:divide-[#152347]">
          {requests.map((r) => (
            <tr key={r.id} className="hover:bg-black/5 dark:hover:bg-white/[0.02] transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center font-bold text-[10px] text-white">
                    {r.requester_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-[#0E1730] dark:text-white block">{r.requester_name}</span>
                    <span className="text-[10px] text-[#5B6787]">Date: {r.request_date}</span>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                {r.target_employee_name ? (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center font-bold text-[10px] text-white">
                      {r.target_employee_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-[#0E1730] dark:text-white block">{r.target_employee_name}</span>
                      <span className="text-[10px] text-[#5B6787]">Date: {r.target_date || r.request_date}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#5B6787] italic">Open Pool</span>
                )}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">{r.source_shift_code || 'GEN'}</span>
                  <ArrowLeftRight className="w-3 h-3 text-[#5B6787]" />
                  <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 font-bold">{r.target_shift_code || 'MOR'}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-[#5B6787] max-w-xs truncate">{r.reason || '—'}</td>
              <td className="py-3 px-4">{getStatusBadge(r.status)}</td>
              <td className="py-3 px-4 text-[#5B6787]">
                {r.reviewer_name ? `Reviewed by ${r.reviewer_name}` : '—'}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button onClick={() => onReview(r)} className="px-2 py-1 text-xs font-semibold text-[#0B6FDB] hover:underline cursor-pointer">
                    Review
                  </button>
                  {r.status === 'PENDING' && (
                    <button onClick={() => onCancel(r.id)} className="px-2 py-1 text-xs font-semibold text-rose-600 hover:underline cursor-pointer">
                      Cancel
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

export default SwapRequestsTable;

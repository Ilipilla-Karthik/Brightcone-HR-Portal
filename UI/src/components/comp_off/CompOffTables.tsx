import React from 'react';
import { ArrowLeftRight, Plus, Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { CompOffRequest, CompOffEntitlement } from '../../types';

interface CompOffTablesProps {
  activeSubTab: 'REQUESTS' | 'ENTITLEMENTS';
  requests: CompOffRequest[];
  entitlements: CompOffEntitlement[];
  isLoading: boolean;
  onReview: (req: CompOffRequest) => void;
  onApplyClick: () => void;
}

export const CompOffTables: React.FC<CompOffTablesProps> = ({
  activeSubTab,
  requests,
  entitlements,
  isLoading,
  onReview,
  onApplyClick,
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
        Loading comp-off records...
      </div>
    );
  }

  if (activeSubTab === 'REQUESTS') {
    if (requests.length === 0) {
      return (
        <div className="py-16 text-center text-xs text-[#5B6787] flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0B6FDB]/10 text-[#0B6FDB] flex items-center justify-center">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0E1730] dark:text-white">No Comp-Off Usage Requests</h4>
            <p className="text-[11px] text-[#5B6787] mt-0.5">No requests found matching the current view and filters.</p>
          </div>
          <button
            onClick={onApplyClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0B6FDB] hover:bg-[#0957B0] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> <span>Apply for Comp-Off</span>
          </button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E3E8F2] dark:border-[#172649] bg-[#F8FAFD] dark:bg-[#060D1A] text-[#5B6787]">
              <th className="py-3 px-4 font-semibold">Employee</th>
              <th className="py-3 px-4 font-semibold">Requested Date</th>
              <th className="py-3 px-4 font-semibold">Days</th>
              <th className="py-3 px-4 font-semibold">Reason</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E3E8F2] dark:divide-[#172649]">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-4 font-semibold text-[#0E1730] dark:text-white">{req.employee_name}</td>
                <td className="py-3 px-4 font-mono">{req.requested_date}</td>
                <td className="py-3 px-4 font-bold text-[#0B6FDB]">{req.days_requested}d</td>
                <td className="py-3 px-4 text-[#5B6787] max-w-xs truncate">{req.reason}</td>
                <td className="py-3 px-4">{getStatusBadge(req.status)}</td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => onReview(req)} className="px-2.5 py-1 text-xs font-semibold text-[#0B6FDB] bg-blue-50 rounded-lg cursor-pointer">
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ENTITLEMENTS VIEW
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-[#E3E8F2] dark:border-[#172649] bg-[#F8FAFD] dark:bg-[#060D1A] text-[#5B6787]">
            <th className="py-3 px-4 font-semibold">Employee</th>
            <th className="py-3 px-4 font-semibold">Earned Date</th>
            <th className="py-3 px-4 font-semibold">Days Earned</th>
            <th className="py-3 px-4 font-semibold">Overtime Reason</th>
            <th className="py-3 px-4 font-semibold">Expiry Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E3E8F2] dark:divide-[#172649]">
          {entitlements.map((ent) => (
            <tr key={ent.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
              <td className="py-3 px-4 font-semibold text-[#0E1730] dark:text-white">{ent.employee_name}</td>
              <td className="py-3 px-4 font-mono">{ent.earned_date}</td>
              <td className="py-3 px-4 font-bold text-emerald-600">+{ent.days_earned}d</td>
              <td className="py-3 px-4 text-[#5B6787]">{ent.reason}</td>
              <td className="py-3 px-4 text-[#5B6787]">{ent.expiry_date || 'No Expiry'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompOffTables;

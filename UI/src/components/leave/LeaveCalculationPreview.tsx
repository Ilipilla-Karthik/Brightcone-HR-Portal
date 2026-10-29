import React from 'react';
import { Sparkles, AlertTriangle } from 'lucide-react';
import type { LeaveCalculationResult, LeaveBalanceItem } from '../../types';

interface LeaveCalculationPreviewProps {
  calculationPreview: LeaveCalculationResult | null;
  currentBalance?: LeaveBalanceItem | null;
  isCalculating: boolean;
}

export const LeaveCalculationPreview: React.FC<LeaveCalculationPreviewProps> = ({
  calculationPreview,
  currentBalance,
  isCalculating,
}) => {
  if (isCalculating) {
    return (
      <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 text-xs text-[#0B6FDB] flex items-center gap-2">
        <Sparkles className="w-4 h-4 animate-spin" />
        <span>Calculating policy chargeable days...</span>
      </div>
    );
  }

  if (!calculationPreview) return null;

  const isOverBalance =
    currentBalance && calculationPreview.chargeable_days > currentBalance.remaining_days;

  return (
    <div className="p-3.5 rounded-xl bg-[#F8FAFD] dark:bg-[#060D1A] border border-[#E3E8F2] dark:border-[#1B2A4A] space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-bold text-[#0E1730] dark:text-white flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#0B6FDB]" /> Policy Calculation Breakdown
        </span>
        <span className="font-black text-[#0B6FDB] text-sm">
          {calculationPreview.chargeable_days} chargeable day(s)
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px] text-center pt-1">
        <div className="bg-white dark:bg-[#0B152E] p-1.5 rounded-lg border border-[#E3E8F2] dark:border-[#16274E]">
          <span className="text-[#5B6787] block">Calendar</span>
          <span className="font-semibold text-[#0E1730] dark:text-white">{calculationPreview.total_calendar_days}</span>
        </div>
        <div className="bg-white dark:bg-[#0B152E] p-1.5 rounded-lg border border-[#E3E8F2] dark:border-[#16274E]">
          <span className="text-[#5B6787] block">Holidays/Weekend</span>
          <span className="font-semibold text-[#0E1730] dark:text-white">{calculationPreview.holidays_count + calculationPreview.weekend_days_count}</span>
        </div>
        <div className="bg-white dark:bg-[#0B152E] p-1.5 rounded-lg border border-[#E3E8F2] dark:border-[#16274E]">
          <span className="text-[#5B6787] block">Deduction</span>
          <span className="font-semibold text-emerald-600">{calculationPreview.chargeable_days}d</span>
        </div>
      </div>

      {isOverBalance && (
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-[11px]">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Warning: Requested days exceed remaining quota balance.</span>
        </div>
      )}
    </div>
  );
};

export default LeaveCalculationPreview;

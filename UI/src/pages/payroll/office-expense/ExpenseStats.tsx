import React from "react";
import { Receipt, Building2, PieChart, Clock } from "lucide-react";
import { type OfficeExpense, categories } from "./types";

interface Props {
  expenses: OfficeExpense[];
}

export const ExpenseStats: React.FC<Props> = ({ expenses }) => {
  const totalSpend = expenses.reduce((sum, e) => sum + e.total_amount, 0);
  const totalBaseSpend = expenses.reduce((sum, e) => sum + e.base_amount, 0);
  const totalGstCredit = expenses.reduce((sum, e) => sum + e.gst_amount, 0);
  const pendingAmount = expenses
    .filter((e) => e.status === "Pending")
    .reduce((sum, e) => sum + e.total_amount, 0);

  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.total_amount;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-line rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <Receipt className="w-4 h-4 text-brand" />
            <span>Total Operational Spend</span>
          </div>
          <div className="font-sora font-bold text-xl text-txt mt-2">
            ₹{totalSpend.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-txt-faint mt-1">
            Across {expenses.length} vendor invoices
          </p>
        </div>

        <div className="bg-surface border border-line rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <Building2 className="w-4 h-4 text-indigo-500" />
            <span>Net Taxable Base</span>
          </div>
          <div className="font-sora font-bold text-xl text-txt mt-2">
            ₹{totalBaseSpend.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-txt-faint mt-1">Excludes input GST liability</p>
        </div>

        <div className="bg-surface border border-line rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <PieChart className="w-4 h-4 text-emerald-500" />
            <span>Input GST Credit</span>
          </div>
          <div className="font-sora font-bold text-xl text-emerald-600 dark:text-emerald-400 mt-2">
            ₹{totalGstCredit.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
            Claimable against output GST
          </p>
        </div>

        <div className="bg-surface border border-line rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Pending Payouts</span>
          </div>
          <div className="font-sora font-bold text-xl text-amber-600 dark:text-amber-400 mt-2">
            ₹{pendingAmount.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">
            Due for finance remittance
          </p>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-2xl p-4 shadow-card">
        <h4 className="font-sora font-semibold text-xs text-txt mb-3">
          Operational Spend by Cost Center
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => {
            const amount = categoryTotals[cat] || 0;
            const pct = Math.round((amount / (totalSpend || 1)) * 100);
            return (
              <div key={cat} className="p-3 rounded-xl bg-surface-secondary border border-line/60">
                <div className="text-txt-faint text-[11px] truncate">{cat}</div>
                <div className="font-sora font-bold text-txt mt-1">
                  ₹{amount.toLocaleString("en-IN")}
                </div>
                <div className="w-full bg-line rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className="bg-brand h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-[10px] text-txt-faint mt-1 text-right">{pct}% of total</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


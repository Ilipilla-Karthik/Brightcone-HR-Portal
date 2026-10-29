import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, FileCheck, Building2, ArrowUpRight } from 'lucide-react'
import { ExpenseStatCards } from './ExpenseStatCards'
import { ExpensePendingClaimsCard } from './ExpensePendingClaimsCard'
import { ExpenseCategorySpendCard } from './ExpenseCategorySpendCard'

export const ExpenseAdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [statsKey, setStatsKey] = useState(0)

  const handleExport = () => {
    alert('Exporting Q3/Q4 corporate expense audit ledger (CSV/Excel)...')
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top accent line matching Image 2 */}
      <div className="h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 w-full rounded-full opacity-80" />

      {/* Hero Banner matching Image 2 */}
      <div className="relative rounded-2xl border border-amber-700/30 bg-gradient-to-r from-[#2c1303] via-[#4d2206] to-[#250f02] p-6 lg:p-8 shadow-xl overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #f59e0b 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
                EXPENSE
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Expense dashboard
            </h1>
            <p className="text-slate-300 text-sm lg:text-base mt-1.5 max-w-xl">
              Claims waiting on you, spend by category and reimbursements due.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleExport}
              className="px-4 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 border border-slate-700/60 text-white text-sm font-semibold flex items-center gap-2 transition-all hover:border-slate-500 shadow-sm"
            >
              <Download size={16} className="text-slate-300" />
              <span>Export</span>
            </button>
            <button
              onClick={() => navigate('/expenses/claims')}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileCheck size={17} className="text-amber-700" />
              <span>Review claims</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <ExpenseStatCards key={statsKey} />

      {/* 2-Column Main Section: Pending Claims + Spend By Category */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ExpensePendingClaimsCard onClaimUpdated={() => setStatsKey((k) => k + 1)} />
        </div>
        <div className="lg:col-span-5">
          <ExpenseCategorySpendCard />
        </div>
      </div>

      {/* Bottom Quick Links Banner: Office Expenses & GST */}
      <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Building2 size={20} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Office Expenses & GST Claims (EXP-06)</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track vendor invoices, input tax credit eligibility and department operational budgets.
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/expenses/office')}
          className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 text-xs font-semibold flex items-center gap-2 border border-amber-200 dark:border-amber-800/50 transition-colors"
        >
          <span>Open Office Ledger</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  )
}

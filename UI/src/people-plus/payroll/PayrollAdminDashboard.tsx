import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ListFilter, Banknote, ShieldAlert, FileSpreadsheet, ArrowUpRight } from 'lucide-react'
import { PayrollStatCards } from './PayrollStatCards'
import { PayrollTrendsChart } from './PayrollTrendsChart'
import { PayrollRunStepper } from './PayrollRunStepper'

export const PayrollAdminDashboard: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Banner matching Image 1 */}
      <div className="relative rounded-2xl border border-emerald-700/30 bg-gradient-to-r from-[#042d22] via-[#064736] to-[#02261d] p-6 lg:p-8 shadow-xl overflow-hidden">
        {/* Subtle grid background texture */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
                PAYROLL
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Payroll dashboard
            </h1>
            <p className="text-slate-300 text-sm lg:text-base mt-1.5 max-w-xl">
              October 2026 run, cost trends and statutory deadlines at a glance.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/payroll/salary-structure')}
              className="px-4 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 border border-slate-700/60 text-white text-sm font-semibold flex items-center gap-2 transition-all hover:border-slate-500 shadow-sm"
            >
              <ListFilter size={16} className="text-slate-300" />
              <span>Salary register</span>
            </button>
            <button
              onClick={() => navigate('/payroll/runs')}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <Banknote size={17} className="text-emerald-700" />
              <span>Continue payroll run</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <PayrollStatCards />

      {/* 2-Column Main Section: Line Chart + Stepper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <PayrollTrendsChart />
        </div>
        <div className="lg:col-span-5">
          <PayrollRunStepper />
        </div>
      </div>

      {/* Statutory Deadlines & Quick Compliance Strip */}
      <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Upcoming Statutory Filings</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              PF ECR submission due Nov 15 • TDS return filing due Oct 31
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/payroll/salary-structure')}
            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-300 dark:border-slate-700/60 transition-colors"
          >
            <FileSpreadsheet size={14} />
            <span>Salary Structures</span>
            <ArrowUpRight size={13} />
          </button>
          <button
            onClick={() => navigate('/expenses/office')}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800/50 transition-colors"
          >
            <span>Office Expenses & GST</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

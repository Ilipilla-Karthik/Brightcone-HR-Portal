import React, { useState } from 'react'
import {
  Banknote,
  CheckCircle2,
  FileText,
  Calendar,
  Download,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'

export const PayrollEmployeeDashboard: React.FC = () => {
  const { user } = useAuth()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const payslips = [
    { id: 'PS-801', month: 'September 2026', paidOn: 'Sep 30, 2026', gross: '₹85,000', net: '₹79,143', status: 'Paid' },
    { id: 'PS-701', month: 'August 2026', paidOn: 'Aug 31, 2026', gross: '₹85,000', net: '₹79,143', status: 'Paid' },
    { id: 'PS-601', month: 'July 2026', paidOn: 'Jul 31, 2026', gross: '₹85,000', net: '₹79,143', status: 'Paid' },
    { id: 'PS-501', month: 'June 2026', paidOn: 'Jun 30, 2026', gross: '₹72,000', net: '₹67,000', status: 'Paid' },
  ]

  const handleDownload = (id: string, month: string) => {
    setDownloadingId(id)
    setTimeout(() => {
      setDownloadingId(null)
      alert(`Downloaded official payslip PDF for ${month} (${id}).`)
    }, 800)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 w-full rounded-full opacity-80" />

      {/* Hero Banner */}
      <div className="relative rounded-2xl border border-emerald-700/30 bg-gradient-to-r from-[#042d22] via-[#064736] to-[#02261d] p-6 lg:p-8 shadow-xl overflow-hidden">
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
                MY PAYROLL
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name ?? 'Employee'}
            </h1>
            <p className="text-slate-300 text-sm lg:text-base mt-1.5 max-w-xl">
              View your salary breakdown, download official tax-compliant payslips and track upcoming salary payouts.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleDownload('PS-801', 'September 2026')}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download size={17} className="text-emerald-700 font-bold" />
              <span>Latest Payslip (Sep)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 hover:border-emerald-500/40 transition-all shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Banknote size={20} />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Monthly Gross CTC</span>
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">₹85,000</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">+18.1% vs previous FY</div>
        </div>

        <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 hover:border-emerald-500/40 transition-all shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Net Take-Home</span>
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">₹79,143</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Credited to primary HDFC A/C</div>
        </div>

        <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 hover:border-emerald-500/40 transition-all shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileText size={20} />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Deductions</span>
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">₹5,857</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">PF ₹1,800 • PT ₹200 • TDS ₹3,857</div>
        </div>

        <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-5 hover:border-emerald-500/40 transition-all shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Calendar size={20} />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Next Payday</span>
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">Oct 31</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">15 days remaining</div>
        </div>
      </div>

      {/* 2 Columns: Salary Component Breakdown + Payslips Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Component breakdown */}
        <div className="lg:col-span-5 bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Monthly Component Breakdown</h3>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-md font-medium">
              New Tax Regime
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-200">Basic Salary</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">50% of monthly gross</div>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">₹42,500</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-200">House Rent Allowance (HRA)</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">25% of monthly gross</div>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">₹21,250</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-200">Special Allowance</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">25% remainder</div>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">₹21,250</div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Employee PF (Statutory 12% capped)</span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold">-₹1,800</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Professional Tax (Telangana/KA)</span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold">-₹200</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Estimated Monthly TDS</span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold">-₹3,857</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700/50 flex justify-between items-center mt-3">
              <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Net Take-Home Pay</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">₹79,143 / mo</span>
            </div>
          </div>
        </div>

        {/* Payslips Download Table */}
        <div className="lg:col-span-7 bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Recent Payslips</h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">FY 2026-27</span>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {payslips.map((ps) => (
                <div key={ps.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/30 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-200">{ps.month}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Paid on {ps.paidOn} • {ps.id}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{ps.net}</div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Transferred</div>
                    </div>

                    <button
                      onClick={() => handleDownload(ps.id, ps.month)}
                      disabled={downloadingId === ps.id}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:hover:text-white border border-slate-300 dark:border-slate-700/80 transition-all flex items-center gap-1.5 text-xs font-medium"
                      title="Download PDF"
                    >
                      <Download size={14} className={downloadingId === ps.id ? 'animate-bounce' : ''} />
                      <span className="hidden sm:inline">PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>Digitally signed and Form 16 compliant</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

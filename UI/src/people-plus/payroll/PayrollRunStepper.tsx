import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'

export const PayrollRunStepper: React.FC = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)

  const steps = [
    {
      num: 1,
      title: 'Sync attendance & leave',
      desc: '127 employee biometric and leave balance logs mapped',
    },
    {
      num: 2,
      title: 'Add bonuses & deductions',
      desc: 'Incentives, reimbursements & LOP adjustments',
    },
    {
      num: 3,
      title: 'Review variances',
      desc: 'Compare with September 2026 payroll audit baseline',
    },
    {
      num: 4,
      title: 'Approve & lock register',
      desc: 'Finance controller authorization & digital stamp',
    },
    {
      num: 5,
      title: 'Bank disbursement & slips',
      desc: 'NEFT/RTGS batch transfer and automated payslip dispatch',
    },
  ]

  return (
    <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">October 2026 run</h3>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 font-medium">
            Active cycle
          </span>
        </div>

        <div className="space-y-4 my-2">
          {steps.slice(0, 3).map((s) => {
            const isCompleted = s.num < currentStep
            const isInProgress = s.num === currentStep

            return (
              <div
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isInProgress
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500/40 shadow-sm'
                    : isCompleted
                    ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80'
                    : 'bg-transparent border-slate-200 dark:border-slate-800/40 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted
                        ? 'bg-emerald-500 text-white dark:text-slate-950'
                        : isInProgress
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/40'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check size={14} /> : s.num}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-200">{s.title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{s.desc}</div>
                  </div>
                </div>

                {isInProgress && (
                  <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800/50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400 animate-pulse" />
                    In progress
                  </span>
                )}
                {isCompleted && (
                  <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full shrink-0">
                    Done
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400">Step {currentStep} of 5 in progress</span>
        <button
          onClick={() => navigate('/payroll/runs')}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-1 group"
        >
          <span>Open 5-step runner</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  )
}

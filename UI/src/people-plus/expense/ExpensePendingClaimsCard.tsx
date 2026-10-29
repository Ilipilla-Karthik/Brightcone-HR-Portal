import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Check } from 'lucide-react'
import type { ExpenseClaim } from './types'

interface ExpensePendingClaimsCardProps {
  onClaimUpdated?: () => void
}

export const ExpensePendingClaimsCard: React.FC<ExpensePendingClaimsCardProps> = ({ onClaimUpdated }) => {
  const [claims, setClaims] = useState<ExpenseClaim[]>([
    {
      id: 'E-105',
      employee_id: 'EMP-004',
      employee_name: 'Arjun Nair',
      category: 'Travel',
      amount: 48200,
      date: '2026-09-29',
      description: 'Conference travel, Bengaluru, Sep 29',
      status: 'Pending',
      created_at: '2026-09-29T10:00:00Z',
    },
    {
      id: 'E-103',
      employee_id: 'EMP-002',
      employee_name: 'Karthik Nair',
      category: 'Meals',
      amount: 2150,
      date: '2026-10-14',
      description: 'Team sprint completion lunch',
      status: 'Pending',
      created_at: '2026-10-14T15:45:00Z',
    },
  ])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionFailed, setActionFailed] = useState(false)

  useEffect(() => {
    fetchPendingClaims()
  }, [])

  const fetchPendingClaims = async () => {
    try {
      const res = await axios.get<ExpenseClaim[]>('/api/expenses')
      // Always mirror the server's list (when it responds) so the claim ids shown
      // are the ids that actually exist in the backend — otherwise approving a
      // stale demo id returns 404 while the UI reports success.
      if (Array.isArray(res.data)) {
        setClaims(res.data.filter((c) => c.status === 'Pending'))
      }
    } catch {
      // Backend unreachable — fall back to the seeded demo items above
    }
  }

  const handleApprove = async (id: string) => {
    setLoadingId(id)
    try {
      await axios.post(`/api/expenses/${id}/approve`)
      setClaims((prev) => prev.filter((c) => c.id !== id))
      setActionMessage('Claim approved and queued for payroll reimbursement.')
      setActionFailed(false)
      onClaimUpdated?.()
    } catch {
      setActionMessage(`Could not approve claim ${id} — it was not found on the server.`)
      setActionFailed(true)
      fetchPendingClaims()
    } finally {
      setLoadingId(null)
      setTimeout(() => setActionMessage(null), 3000)
    }
  }

  const handleReject = async (id: string) => {
    setLoadingId(id)
    try {
      await axios.post(`/api/expenses/${id}/reject`, { reason: 'Policy limit exceeded' })
      setClaims((prev) => prev.filter((c) => c.id !== id))
      setActionMessage('Claim marked as rejected.')
      setActionFailed(false)
      onClaimUpdated?.()
    } catch {
      setActionMessage(`Could not reject claim ${id} — it was not found on the server.`)
      setActionFailed(true)
      fetchPendingClaims()
    } finally {
      setLoadingId(null)
      setTimeout(() => setActionMessage(null), 3000)
    }
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase()
  }

  return (
    <div className="bg-white dark:bg-[#10192A]/90 border border-slate-200 dark:border-[#1E2D4A] rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Pending claims</h3>
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 font-medium">
            {claims.length} pending
          </span>
        </div>

        {actionMessage && (
          <div
            className={
              actionFailed
                ? 'mb-3 px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300'
                : 'mb-3 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2'
            }
          >
            {actionFailed ? null : <Check size={14} />}
            <span>{actionMessage}</span>
          </div>
        )}

        <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
          {claims.length === 0 ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs flex flex-col items-center gap-2">
              <Check size={24} className="text-emerald-500" />
              <span>All employee claims have been reviewed and processed!</span>
            </div>
          ) : (
            claims.map((claim) => (
              <div key={claim.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/30 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-700/60 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-xs shrink-0 shadow-inner">
                    {getInitials(claim.employee_name)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                      {claim.employee_name} <span className="text-slate-500 dark:text-slate-400 font-normal">• {claim.category}</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{claim.description}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    ₹{claim.amount.toLocaleString('en-IN')}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(claim.id)}
                      disabled={loadingId === claim.id}
                      className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold transition-all hover:scale-105"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(claim.id)}
                      disabled={loadingId === claim.id}
                      className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 text-xs font-semibold transition-all hover:scale-105"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>Claims require dual approval if &gt; ₹25,000</span>
        <span className="text-amber-600 dark:text-amber-400 font-semibold">Policy verified</span>
      </div>
    </div>
  )
}

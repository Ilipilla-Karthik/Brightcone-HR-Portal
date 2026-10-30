import React, { useState, useEffect } from 'react'
import { X as CloseIcon } from 'lucide-react'
import { formatINR, loadLivePayrollEmployees, type EmployeeRef } from './payroll-data'
import type { SalaryStructureRecord } from './salary-structure-types'

export const AddSalaryStructureModal: React.FC<{
  isOpen: boolean
  editingRecord: SalaryStructureRecord | null
  onClose: () => void
  onSave: (record: Omit<SalaryStructureRecord, 'id'>) => void
}> = ({ isOpen, editingRecord, onClose, onSave }) => {
  const [empList, setEmpList] = useState<EmployeeRef[]>([])
  const [empId, setEmpId] = useState('')
  const [empError, setEmpError] = useState<string | null>(null)
  const [effectiveFrom, setEffectiveFrom] = useState('2026-10-01')
  const [annualCtc, setAnnualCtc] = useState(1800000)
  const [status, setStatus] = useState<SalaryStructureRecord['status']>('Active')

  useEffect(() => {
    loadLivePayrollEmployees()
      .then(setEmpList)
      .catch(() => setEmpError('Could not load employees from the server.'))
  }, [])

  useEffect(() => {
    if (editingRecord) {
      setEmpId(editingRecord.employeeId)
      setEffectiveFrom(editingRecord.effectiveFrom)
      setAnnualCtc(editingRecord.annualCtc)
      setStatus(editingRecord.status)
    } else {
      setEmpId(empList[0]?.id || '')
      setEffectiveFrom('2026-10-01')
      setAnnualCtc(1800000)
      setStatus('Active')
    }
  }, [editingRecord, isOpen, empList])

  if (!isOpen) return null

  const monthlyGross = Math.round(annualCtc / 12)
  const basicMonthly = Math.round(monthlyGross * 0.5)
  const hraMonthly = Math.round(basicMonthly * 0.4)
  const specialAllowance = Math.max(0, monthlyGross - (basicMonthly + hraMonthly))
  const pfDeduction = 1800
  const ptDeduction = 200

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const emp = empList.find((x) => x.id === empId) || empList[0]
    if (!emp) return
    onSave({
      employeeId: emp.id,
      employeeName: emp.name,
      dept: emp.dept,
      effectiveFrom,
      annualCtc,
      basic: basicMonthly,
      basicMonthly,
      hra: hraMonthly,
      hraMonthly,
      specialAllowance,
      otherAllowance: 0,
      employerPf: 1800,
      monthlyGross,
      pfDeduction,
      ptDeduction,
      status,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {editingRecord ? 'Edit Salary Structure' : 'Add Salary Structure'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
            <CloseIcon size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="py-4 space-y-3.5">
          {empError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-700 dark:text-rose-300">
              {empError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Employee</label>
              <select
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {empList.length === 0 && <option value="">No employees on record</option>}
                {empList.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Effective Date</label>
              <input
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Annual CTC (₹)</label>
            <input
              type="number"
              value={annualCtc}
              onChange={(e) => setAnnualCtc(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Basic Pay (50% of gross):</span>
              <span className="font-mono text-slate-900 dark:text-white">{formatINR(basicMonthly)} / mo</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>HRA (40% of basic):</span>
              <span className="font-mono text-slate-900 dark:text-white">{formatINR(hraMonthly)} / mo</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Special Allowance:</span>
              <span className="font-mono text-slate-900 dark:text-white">{formatINR(specialAllowance)} / mo</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-slate-200 dark:border-slate-800 font-bold">
              <span className="text-slate-900 dark:text-white">Monthly Gross:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatINR(monthlyGross)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Active">Active (Supersedes current active structure)</option>
              <option value="Draft">Draft</option>
              <option value="Superseded">Superseded</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md cursor-pointer"
            >
              {editingRecord ? 'Save Structure' : 'Activate Structure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export const ViewStructureDetailModal: React.FC<{
  record: SalaryStructureRecord | null
  onClose: () => void
}> = ({ record, onClose }) => {
  if (!record) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{record.employeeName}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {record.employeeId} • Effective from {record.effectiveFrom}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
            <CloseIcon size={18} />
          </button>
        </div>
        <div className="py-4 space-y-2.5 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60 font-semibold">
            <span className="text-slate-700 dark:text-slate-300">Annual CTC</span>
            <span className="font-mono text-slate-900 dark:text-white">{formatINR(record.annualCtc)}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Basic Salary (50%)</span>
            <span className="font-mono text-slate-900 dark:text-white">{formatINR(record.basicMonthly)}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>House Rent Allowance (HRA)</span>
            <span className="font-mono text-slate-900 dark:text-white">{formatINR(record.hraMonthly)}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Special Allowance</span>
            <span className="font-mono text-slate-900 dark:text-white">{formatINR(record.specialAllowance)}</span>
          </div>
          <div className="flex justify-between py-1.5 border-t border-slate-200 dark:border-slate-800 font-bold text-emerald-600 dark:text-emerald-400">
            <span>Monthly Gross Earnings</span>
            <span className="font-mono">{formatINR(record.monthlyGross)}</span>
          </div>
          <div className="flex justify-between text-rose-600 dark:text-rose-400 pt-1">
            <span>Employer PF (₹/month)</span>
            <span className="font-mono">{formatINR(record.employerPf)}</span>
          </div>
          <div className="flex justify-between text-rose-600 dark:text-rose-400">
            <span>Other Allowances (₹/month)</span>
            <span className="font-mono">{formatINR(record.otherAllowance)}</span>
          </div>
        </div>
        <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}


import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Plus, Search, Users, Eye, Edit2, Trash2, CheckCircle2, AlertCircle } from 'lucide-react'
import {
  formatINR,
  exportRecCsv,
  fetchRecKindRows,
  createRecRow,
  patchRecRow,
  setRecArchived,
  loadEmployeeDirectory,
  empName,
  empDept,
  errorMessage,
  type EmpDirectory,
  type RecRow,
} from './payroll-data'
import type { MonthlyPayrollRecord } from './monthly-payroll-types'
import { AddPayrollEntryModal, ViewPayrollDetailModal } from './MonthlyPayrollModals'

const KIND = 'payroll2'

const toRecord = (row: RecRow, dir: EmpDirectory): MonthlyPayrollRecord => {
  const employeeId = String(row.emp ?? '')
  const ded = Number(row.ded ?? 0)
  return {
    id: row.code,
    month: String(row.month ?? ''),
    employeeId,
    employeeName: empName(dir, employeeId),
    dept: empDept(dir, employeeId),
    workingDays: Number(row.wdays ?? 0),
    lopDays: Number(row.lop ?? 0),
    paidDays: Number(row.pdays ?? 0),
    grossPay: Number(row.gross ?? 0),
    totalDeductions: ded,
    deductions: ded,
    netPay: Number(row.net ?? 0),
    status: (String(row.status ?? 'Draft') as MonthlyPayrollRecord['status']),
    isArchived: row.archived === true,
  }
}

const toFields = (data: Omit<MonthlyPayrollRecord, 'id'>): Record<string, unknown> => ({
  month: data.month,
  emp: data.employeeId,
  wdays: data.workingDays,
  lop: data.lopDays,
  pdays: data.paidDays,
  gross: data.grossPay,
  ded: data.totalDeductions,
  net: data.netPay,
  status: data.status,
})

export const MonthlyPayrollPage: React.FC = () => {
  const navigate = useNavigate()
  const [records, setRecords] = useState<MonthlyPayrollRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showArchived, setShowArchived] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<MonthlyPayrollRecord | null>(null)
  const [viewRecord, setViewRecord] = useState<MonthlyPayrollRecord | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastError, setToastError] = useState(false)

  const loadRecords = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [rows, dir] = await Promise.all([fetchRecKindRows(KIND), loadEmployeeDirectory()])
      setRecords(rows.map((r) => toRecord(r, dir)))
    } catch (err) {
      setLoadError(errorMessage(err, 'Could not load monthly payroll records.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  const activeRecords = records.filter((r) => (showArchived ? r.isArchived : !r.isArchived))
  const filtered = activeRecords.filter((r) => {
    const matchesSearch =
      r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      r.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      r.month.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalCount = records.filter((r) => !r.isArchived).length
  const draftCount = records.filter((r) => !r.isArchived && r.status === 'Draft').length
  const processedCount = records.filter((r) => !r.isArchived && r.status === 'Processed').length
  const approvedCount = records.filter((r) => !r.isArchived && r.status === 'Approved').length
  const archivedCount = records.filter((r) => r.isArchived).length

  const showToast = (msg: string, isError = false) => {
    setToastMessage(msg)
    setToastError(isError)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSave = async (data: Omit<MonthlyPayrollRecord, 'id'>) => {
    try {
      if (editingRecord) {
        await patchRecRow(KIND, editingRecord.id, toFields(data))
        showToast('Payroll record updated successfully')
      } else {
        await createRecRow(KIND, toFields(data))
        showToast(`Payroll entry created for ${data.employeeName}`)
      }
      setModalOpen(false)
      await loadRecords()
    } catch (err) {
      showToast(errorMessage(err, 'Could not save the payroll record.'), true)
    }
  }

  const handleArchive = async (rec: MonthlyPayrollRecord) => {
    try {
      await setRecArchived(KIND, rec.id, !rec.isArchived)
      showToast(rec.isArchived ? 'Payroll record restored' : 'Payroll record archived')
      await loadRecords()
    } catch (err) {
      showToast(errorMessage(err, 'Could not update the payroll record.'), true)
    }
  }

  const handleExport = () => {
    exportRecCsv(KIND, 'Monthly_Payroll_Register').catch((err) =>
      showToast(errorMessage(err, 'Could not export the salary register.'), true)
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 ${toastError ? 'bg-rose-950 border border-rose-700 text-rose-200' : 'bg-emerald-950 border border-emerald-700 text-emerald-200'}`}>
          {toastError ? <AlertCircle size={16} className="text-rose-400" /> : <CheckCircle2 size={16} className="text-emerald-400" />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">PAYROLL</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Monthly payroll</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            One line per employee per month. Net pay is gross minus deductions.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-300 dark:border-slate-700/60 text-slate-700 dark:text-white text-sm font-semibold flex items-center gap-2 transition-all hover:border-slate-400 dark:hover:border-slate-500 shadow-sm cursor-pointer"
          >
            <Download size={16} className="text-slate-500 dark:text-slate-300" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingRecord(null)
              setModalOpen(true)
            }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] cursor-pointer"
          >
            <Plus size={18} />
            <span>Add payroll entry</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 px-4 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Users size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-xs text-amber-900 dark:text-amber-200">
            <span className="font-semibold text-amber-900 dark:text-amber-300">Quick Navigation:</span> Records link to an Employee ID. Add or manage team members in master data.
          </p>
        </div>
        <button
          onClick={() => navigate('/directory')}
          className="px-3.5 py-1.5 rounded-lg bg-amber-200/80 dark:bg-amber-500/20 hover:bg-amber-300/80 dark:hover:bg-amber-500/30 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
        >
          Open Employee master data
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">101</span>
            <span>Total records</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">{totalCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Live records</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] font-bold">101</span>
            <span>Draft</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">{draftCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Records</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">101</span>
            <span>Processed</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">{processedCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Records</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">101</span>
            <span>Approved</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">{approvedCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Records</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search monthly payroll"
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All statuses</option>
            <option value="Draft">Draft</option>
            <option value="Processed">Processed</option>
            <option value="Approved">Approved</option>
          </select>

          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-blue-600 focus:ring-0"
            />
            <span>Archived ({archivedCount})</span>
          </label>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a]/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">MONTH</th>
                <th className="py-3 px-4">EMPLOYEE</th>
                <th className="py-3 px-4">PAID DAYS</th>
                <th className="py-3 px-4">GROSS PAY (₹)</th>
                <th className="py-3 px-4">TOTAL DEDUCTIONS (₹)</th>
                <th className="py-3 px-4">NET PAY (₹)</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    Loading monthly payroll records…
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-rose-600 dark:text-rose-400">
                    {loadError}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No monthly payroll records match the selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{rec.month}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{rec.employeeName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{rec.employeeId} • {rec.dept}</div>
                    </td>
                    <td className="py-3 px-4">{rec.paidDays} / 31</td>
                    <td className="py-3 px-4 font-mono">{formatINR(rec.grossPay)}</td>
                    <td className="py-3 px-4 font-mono text-rose-600 dark:text-rose-400">{formatINR(rec.deductions ?? rec.totalDeductions ?? 0)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatINR(rec.netPay)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          rec.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : rec.status === 'Processed'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setViewRecord(rec)}
                          title="View Details"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingRecord(rec)
                            setModalOpen(true)
                          }}
                          title="Edit"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleArchive(rec)}
                          title={rec.isArchived ? 'Restore' : 'Archive'}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddPayrollEntryModal
        isOpen={modalOpen}
        editingRecord={editingRecord}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <ViewPayrollDetailModal
        record={viewRecord}
        onClose={() => setViewRecord(null)}
      />
    </div>
  )
}

export default MonthlyPayrollPage


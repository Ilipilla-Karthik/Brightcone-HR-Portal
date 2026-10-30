// Shared types, employee lookups, records-API helpers and utilities for Payroll views.
// All data comes from the live backend — there is no seed or fallback data here.
import { api } from '../../services/api'

export interface EmployeeRef {
  id: string
  name: string
  email: string
  dept: string
  role: string
}

interface EmployeeRow {
  employee_code?: string
  id?: string | number
  full_name?: string
  fullName?: string
  name?: string
  first_name?: string
  last_name?: string
  work_email?: string
  email?: string
  department?: string
  dept?: string
  job_title?: string
  designation?: string
  role?: string
}

const toEmployeeRef = (e: EmployeeRow, idx: number): EmployeeRef => ({
  id: String(e.employee_code ?? e.id ?? ''),
  name:
    e.full_name ||
    e.fullName ||
    e.name ||
    `${e.first_name || ''} ${e.last_name || ''}`.trim() ||
    `Employee ${idx + 1}`,
  email: e.work_email || e.email || '',
  dept: e.department || e.dept || '',
  role: e.job_title || e.designation || e.role || '',
})

/** Live employee master list from `GET /api/v1/employees`. Throws on failure. */
export async function loadLivePayrollEmployees(): Promise<EmployeeRef[]> {
  const res = await api.get<EmployeeRow[]>('/employees')
  const list = Array.isArray(res.data) ? res.data : []
  return list.map(toEmployeeRef)
}

/** Employee code → employee lookup, used to show names/departments on record rows. */
export type EmpDirectory = Record<string, EmployeeRef>

export async function loadEmployeeDirectory(): Promise<EmpDirectory> {
  const list = await loadLivePayrollEmployees()
  const dir: EmpDirectory = {}
  list.forEach((e) => {
    if (e.id) dir[e.id] = e
  })
  return dir
}

export function empName(dir: EmpDirectory, code: string | undefined): string {
  return (code && dir[code]?.name) || code || '—'
}

export function empDept(dir: EmpDirectory, code: string | undefined): string {
  return (code && dir[code]?.dept) || ''
}

// ---------------------------------------------------------------------------
// Generic records API (`/api/v1/rec/{kind}`) — CRUD, archive and CSV export
// ---------------------------------------------------------------------------

export interface RecRow {
  code: string
  archived?: boolean
  [key: string]: unknown
}

export async function fetchRecRows(kind: string, archived = false): Promise<RecRow[]> {
  const res = await api.get<RecRow[]>(`/rec/${kind}`, { params: { archived } })
  return Array.isArray(res.data) ? res.data : []
}

export async function fetchRecKindRows(kind: string): Promise<RecRow[]> {
  const [rows, archivedRows] = await Promise.all([
    fetchRecRows(kind, false),
    fetchRecRows(kind, true),
  ])
  return [...rows, ...archivedRows]
}

export async function createRecRow(kind: string, fields: Record<string, unknown>): Promise<RecRow> {
  const res = await api.post<RecRow>(`/rec/${kind}`, fields)
  return res.data
}

export async function patchRecRow(
  kind: string,
  code: string,
  fields: Record<string, unknown>
): Promise<RecRow> {
  const res = await api.patch<RecRow>(`/rec/${kind}/${code}`, fields)
  return res.data
}

export async function setRecArchived(kind: string, code: string, archived: boolean): Promise<RecRow> {
  const res = await api.post<RecRow>(`/rec/${kind}/${code}/archive`, { archived })
  return res.data
}

/** Downloads `GET /api/v1/rec/{kind}/export` (CSV) using the stored auth token. */
export async function exportRecCsv(kind: string, filename: string): Promise<void> {
  const token = localStorage.getItem('token')
  const response = await fetch(`/api/v1/rec/${kind}/export`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) throw new Error(`Export failed (${response.status})`)
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export function formatINR(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '₹0'
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(num)) return '₹0'
  return '₹' + Math.round(num).toLocaleString('en-IN')
}

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((e) => e.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function errorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { error?: string; message?: string } } }).response
    const msg = response?.data?.error || response?.data?.message
    if (msg) return msg
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}

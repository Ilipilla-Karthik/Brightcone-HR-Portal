// Shared types, employee list, mock data and utility helpers for Payroll & Compliance views
import axios from 'axios'

export interface EmployeeRef {
  id: string
  name: string
  email: string
  dept: string
  role: string
}

export const DEMO_EMPLOYEES: EmployeeRef[] = [
  { id: 'BC-1001', name: 'Ananya Rao', email: 'ananya.rao@brightcone.ai', dept: 'People Ops', role: 'People Ops Lead' },
  { id: 'BC-1002', name: 'Naresh Vemparala', email: 'naresh.vemparala@brightcone.ai', dept: 'Operations', role: 'VP Operations' },
  { id: 'BC-1003', name: 'Karthik Reddy', email: 'karthik.reddy@brightcone.ai', dept: 'Engineering', role: 'Principal Architect' },
  { id: 'BC-1004', name: 'Priya Menon', email: 'priya.menon@brightcone.ai', dept: 'Product', role: 'Head of Product' },
  { id: 'BC-1005', name: 'Meera Joshi', email: 'meera.joshi@brightcone.ai', dept: 'Finance', role: 'Finance Lead' },
  { id: 'BC-1006', name: 'Rahul Varma', email: 'rahul.varma@brightcone.ai', dept: 'Engineering', role: 'Backend Engineer' },
  { id: 'BC-1007', name: 'Sneha Iyer', email: 'sneha.iyer@brightcone.ai', dept: 'Design', role: 'Product Designer' },
  { id: 'BC-1008', name: 'Arjun Nair', email: 'arjun.nair@brightcone.ai', dept: 'Sales', role: 'Account Executive' },
  { id: 'BC-1009', name: 'Daniel Brooks', email: 'daniel.brooks@brightcone.ai', dept: 'Engineering', role: 'DevOps Engineer' },
  { id: 'BC-1010', name: 'Emily Carter', email: 'emily.carter@brightcone.ai', dept: 'Marketing', role: 'Marketing Lead' },
  { id: 'BC-1011', name: 'Vikram Singh', email: 'vikram.singh@brightcone.ai', dept: 'Engineering', role: 'Security Architect' },
  { id: 'BC-1012', name: 'Lakshmi Prasad', email: 'lakshmi.prasad@brightcone.ai', dept: 'Support', role: 'Support Specialist' },
  { id: 'BC-1013', name: 'Farhan Ali', email: 'farhan.ali@brightcone.ai', dept: 'Operations', role: 'Operations Associate' },
  { id: 'BC-1014', name: 'Divya Kulkarni', email: 'divya.kulkarni@brightcone.ai', dept: 'Marketing', role: 'Growth Specialist' },
]

export async function loadLivePayrollEmployees(): Promise<EmployeeRef[]> {
  try {
    const res = await axios.get('/api/v1/employees')
    const list = Array.isArray(res.data) ? res.data : (res.data as any)?.value || []
    if (list.length > 0) {
      return list.map((e: any, idx: number) => ({
        id: e.employee_code || e.id || `BC-${1001 + idx}`,
        name: e.full_name || e.fullName || e.name || `${e.first_name || ''} ${e.last_name || ''}`.trim() || 'Team Member',
        email: e.work_email || e.email || `employee${idx + 1}@brightcone.ai`,
        dept: e.department || 'Engineering',
        role: e.job_title || e.designation || e.role || 'Software Engineer',
      }))
    }
  } catch {}
  return DEMO_EMPLOYEES
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

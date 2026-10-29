import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import { fetchEmployees, createEmployeeApi } from '../../services/peopleApi';

interface EmployeeRecord {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  location: string;
  status: 'Active' | 'Probation' | 'On Leave';
  manager?: string;
  joiningDate?: string;
}

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedEmp, setSelectedEmp] = useState<EmployeeRecord | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [newEmp, setNewEmp] = useState({ name: '', role: '', department: 'Engineering', email: '', location: 'Hyderabad' });

  useEffect(() => {
    setLoading(true);
    fetchEmployees()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data?.value || [];
        const mapped: EmployeeRecord[] = list.map((d: any, idx: number) => ({
          id: d.employee_code || (typeof d.id === 'string' ? d.id : `BC-${1000 + idx}`),
          name: d.full_name || d.name || `${d.first_name || ''} ${d.last_name || ''}`.trim() || 'Employee',
          role: d.job_title || d.role || 'Engineer',
          department: d.department || 'Engineering',
          email: d.work_email || d.email || `emp${idx}@brightcone.ai`,
          location: d.location || 'Hyderabad',
          status: d.status === 'Probation' ? 'Probation' : d.status === 'On Leave' ? 'On Leave' : 'Active',
          manager: d.manager_name || 'Naresh Vemparala',
          joiningDate: d.joined || d.joining_date || '2023-01-01',
        }));
        setEmployees(mapped);
      })
      .catch(() => {
        setEmployees([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const departments = ['All', 'Leadership', 'Engineering', 'AI Research', 'People Ops', 'Finance', 'Sales', 'Product'];

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !search || e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
    const matchDept = deptFilter === 'All' || e.department === deptFilter;
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name.trim() || !newEmp.email.trim()) return;
    const generatedCode = `BC-${1000 + employees.length + 1}`;
    const created: EmployeeRecord = {
      id: generatedCode,
      name: newEmp.name.trim(),
      role: newEmp.role.trim() || 'Software Engineer',
      department: newEmp.department,
      email: newEmp.email.trim().toLowerCase(),
      location: newEmp.location,
      status: 'Active',
      manager: 'Naresh Vemparala',
      joiningDate: new Date().toISOString().split('T')[0],
    };
    try {
      await createEmployeeApi({
        employee_code: generatedCode,
        full_name: created.name,
        job_title: created.role,
        department: created.department,
        work_email: created.email,
        location: created.location,
        status: 'Active',
        grade: 'L1',
      });
      setToastMsg(`Successfully saved ${created.name} (${generatedCode}) to database!`);
      setTimeout(() => setToastMsg(''), 4000);
    } catch {
      setToastMsg(`Added ${created.name} locally (server connection issue)`);
      setTimeout(() => setToastMsg(''), 4000);
    }
    setEmployees([created, ...employees]);
    setIsAddOpen(false);
    setNewEmp({ name: '', role: '', department: 'Engineering', email: '', location: 'Hyderabad' });
  };

  const exportCSV = () => {
    const headers = 'Employee ID,Name,Role,Department,Email,Location,Status\n';
    const rows = filtered.map((e) => `"${e.id}","${e.name}","${e.role}","${e.department}","${e.email}","${e.location}","${e.status}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Brightcone_Employees_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">Workforce Directory</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Real-time personnel records, org roles, and department allocations.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={exportCSV} className="btn text-xs font-semibold px-3.5 py-2 flex items-center gap-1.5 border border-[var(--line)] rounded-xl hover:bg-[var(--surface-2)] transition-colors">
            {ic('download', 14)} Export CSV
          </button>
          <button type="button" onClick={() => setIsAddOpen(true)} className="btn primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5 rounded-xl text-white shadow-sm" style={{ background: '#12A58E' }}>
            {ic('plus', 14)} Add Employee
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <p className="text-xs text-[var(--muted)] font-medium">Total Headcount</p>
          <p className="text-2xl font-bold font-['Sora'] text-[var(--text)] mt-1">{employees.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <p className="text-xs text-[var(--muted)] font-medium">Active Staff</p>
          <p className="text-2xl font-bold font-['Sora'] text-[#15A36B] mt-1">{employees.filter((e) => e.status === 'Active').length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <p className="text-xs text-[var(--muted)] font-medium">On Probation</p>
          <p className="text-2xl font-bold font-['Sora'] text-[#E07A1D] mt-1">{employees.filter((e) => e.status === 'Probation').length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <p className="text-xs text-[var(--muted)] font-medium">Departments</p>
          <p className="text-2xl font-bold font-['Sora'] text-[#0B6FDB] mt-1">{departments.length - 1}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
        <div className="flex items-center gap-2 w-full md:w-80 px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
          {ic('search', 15)}
          <input type="text" placeholder="Search by name, ID, or role..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-xs text-[var(--text)] focus:outline-none w-full" />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none cursor-pointer">
            {departments.map((d) => (<option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none cursor-pointer">
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Probation">Probation</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xs overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-2)] border-b border-[var(--line)] text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {filtered.map((emp) => (
              <tr key={emp.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#12A58E] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {(emp.name || 'Employee').split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2)}
                    </span>
                    <div className="min-w-0">
                      <b className="block text-xs font-semibold text-[var(--text)] truncate">{emp.name}</b>
                      <span className="block text-[11px] text-[var(--muted)] truncate">{emp.email}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-xs text-[var(--muted)]">{emp.id}</td>
                <td className="py-3 px-4 text-xs font-medium text-[var(--text)]">{emp.department}</td>
                <td className="py-3 px-4 text-xs text-[var(--muted)]">{emp.role}</td>
                <td className="py-3 px-4 text-xs text-[var(--muted)]">{emp.location}</td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    emp.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                    emp.status === 'Probation' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                    'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                  }`}>
                    {emp.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button type="button" onClick={() => setSelectedEmp(emp)} className="text-xs text-[#12A58E] font-semibold hover:underline">
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-[var(--muted)]">{loading ? 'Loading live employee records from database...' : 'No employees found matching your criteria.'}</div>
        )}
      </div>

      {/* Profile Detail Drawer Modal */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button type="button" onClick={() => setSelectedEmp(null)} className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--text)]">
              {ic('x', 18)}
            </button>
            <div className="flex items-center gap-3.5 pb-4 border-b border-[var(--line)]">
              <span className="w-12 h-12 rounded-2xl bg-[#12A58E] text-white flex items-center justify-center font-bold text-base shadow-sm">
                {(selectedEmp.name || 'Employee').split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2)}
              </span>
              <div>
                <h3 className="font-['Sora'] text-lg font-bold text-[var(--text)]">{selectedEmp.name}</h3>
                <p className="text-xs text-[var(--muted)]">{selectedEmp.role} · {selectedEmp.department}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 py-4 text-xs">
              <div><span className="text-[var(--muted)] block">Employee ID</span><b className="font-mono mt-0.5 block">{selectedEmp.id}</b></div>
              <div><span className="text-[var(--muted)] block">Work Email</span><b className="mt-0.5 block truncate">{selectedEmp.email}</b></div>
              <div><span className="text-[var(--muted)] block">Work Location</span><b className="mt-0.5 block">{selectedEmp.location}</b></div>
              <div><span className="text-[var(--muted)] block">Employment Status</span><b className="mt-0.5 block">{selectedEmp.status}</b></div>
              <div><span className="text-[var(--muted)] block">Reporting Manager</span><b className="mt-0.5 block">{selectedEmp.manager}</b></div>
              <div><span className="text-[var(--muted)] block">Joining Date</span><b className="mt-0.5 block">{selectedEmp.joiningDate}</b></div>
            </div>
            <div className="pt-3 border-t border-[var(--line)] flex justify-end">
              <button type="button" onClick={() => setSelectedEmp(null)} className="btn text-xs font-semibold px-4 py-2 border border-[var(--line)] rounded-xl hover:bg-[var(--surface-2)]">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form onSubmit={handleAddSubmit} className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <h3 className="font-['Sora'] text-lg font-bold text-[var(--text)]">Add New Employee</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Full Name</label>
                <input required type="text" placeholder="e.g. Aditi Rao" value={newEmp.name} onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Work Email</label>
                <input required type="email" placeholder="aditi.rao@brightcone.ai" value={newEmp.email} onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Job Role</label>
                <input required type="text" placeholder="e.g. AI Research Engineer" value={newEmp.role} onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Department</label>
                  <select value={newEmp.department} onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none">
                    {departments.filter((d) => d !== 'All').map((d) => (<option key={d} value={d}>{d}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Location</label>
                  <input type="text" value={newEmp.location} onChange={(e) => setNewEmp({ ...newEmp, location: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
                </div>
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-2 border-t border-[var(--line)]">
              <button type="button" onClick={() => setIsAddOpen(false)} className="btn text-xs font-semibold px-4 py-2 border border-[var(--line)] rounded-xl hover:bg-[var(--surface-2)]">Cancel</button>
              <button type="submit" className="btn primary text-xs font-semibold px-4 py-2 rounded-xl text-white shadow-sm" style={{ background: '#12A58E' }}>Save Employee</button>
            </div>
          </form>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg z-50 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <span>✓</span> {toastMsg}
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;

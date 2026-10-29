import React, { useState, useEffect } from 'react';
import { fetchEmployees, EmployeeApiItem } from '../../services/peopleApi';
import { api } from '../../services/api';
import { ic } from '../../components/icons';

interface ProbationItem {
  id: string;
  dbId?: number;
  code: string;
  name: string;
  department: string;
  role: string;
  startDate: string;
  endDate: string;
  manager: string;
  status: 'Under Review' | 'Eligible for Confirmation' | 'Confirmed' | 'Extended';
}

export const ProbationTracking: React.FC = () => {
  const [probations, setProbations] = useState<ProbationItem[]>([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allEmployees, setAllEmployees] = useState<EmployeeApiItem[]>([]);
  const [newProbation, setNewProbation] = useState({
    empCode: '',
    name: '',
    department: 'Engineering',
    role: 'Software Engineer',
    startDate: '2026-09-01',
    endDate: '2026-12-01',
    manager: 'Naresh Vemparala',
  });

  const STORAGE_KEY = 'brightcone_probation_tracking';

  useEffect(() => {
    loadProbations();
  }, []);

  const loadProbations = () => {
    fetchEmployees()
      .then((data: any) => {
        const list: EmployeeApiItem[] = Array.isArray(data) ? data : data?.value || [];
        setAllEmployees(list);

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setProbations(parsed);
              return;
            }
          } catch {}
        }

        // Default seed from DB probation employees
        const probEmps = list.filter((e: any) => e.status?.toLowerCase() === 'probation' || !e.status);
        const sourceList = probEmps.length > 0 ? probEmps : list.slice(4, 9);

        const mapped: ProbationItem[] = sourceList.map((e: any, idx: number) => ({
          id: `pb-${e.id || idx + 1}`,
          dbId: e.id,
          code: e.employee_code || `BC-10${38 + idx}`,
          name: e.full_name || 'Staff Member',
          department: e.department || 'Engineering',
          role: e.job_title || 'Engineer',
          startDate: e.joined || '2026-08-01',
          endDate: '2026-11-01',
          manager: e.manager_name || 'Priya Menon',
          status: idx === 0 ? 'Eligible for Confirmation' : 'Under Review',
        }));

        setProbations(mapped);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      })
      .catch(() => setProbations([]));
  };

  const saveProbations = (newList: ProbationItem[]) => {
    setProbations(newList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  };

  const handleStatusChange = async (id: string, nextStatus: ProbationItem['status']) => {
    const item = probations.find((p) => p.id === id);
    const updated = probations.map((p) => (p.id === id ? { ...p, status: nextStatus } : p));
    saveProbations(updated);

    if (item?.dbId && nextStatus === 'Confirmed') {
      try {
        await api.patch(`/employees/${item.dbId}`, { status: 'Active' });
      } catch {}
    }
  };

  const handleAddProbation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProbation.name) return;

    const selectedEmp = allEmployees.find((emp) => emp.employee_code === newProbation.empCode);
    const item: ProbationItem = {
      id: `pb-${Date.now()}`,
      dbId: selectedEmp?.id,
      code: newProbation.empCode || `BC-${Date.now().toString().slice(-4)}`,
      name: newProbation.name,
      department: newProbation.department,
      role: newProbation.role,
      startDate: newProbation.startDate,
      endDate: newProbation.endDate,
      manager: newProbation.manager,
      status: 'Under Review',
    };

    saveProbations([item, ...probations]);
    setIsModalOpen(false);
  };

  const onSelectEmployee = (code: string) => {
    const emp = allEmployees.find((e) => e.employee_code === code);
    if (emp) {
      setNewProbation({
        ...newProbation,
        empCode: emp.employee_code,
        name: emp.full_name,
        department: emp.department,
        role: emp.job_title,
        manager: emp.manager_name || 'Naresh Vemparala',
      });
    }
  };

  const filtered = probations.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !search || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.department.toLowerCase().includes(q);
    const matchFilter = filter === 'All' || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">Probation Confirmation Tracker</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Monitor new employee probationary periods, review manager evaluations, and issue formal confirmation letters.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5 rounded-xl text-white shadow-sm cursor-pointer"
          style={{ background: '#12A58E' }}
        >
          {ic('plus', 14)} Add to Probation
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Active on Probation</span>
          <p className="text-2xl font-bold text-[var(--text)]">{probations.filter((p) => p.status !== 'Confirmed').length}</p>
          <span className="text-xs text-blue-500 font-medium">Persisted across refreshes</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Eligible for Confirmation</span>
          <p className="text-2xl font-bold text-[var(--text)]">{probations.filter((p) => p.status === 'Eligible for Confirmation').length}</p>
          <span className="text-xs text-amber-500 font-medium">Ready for review</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Confirmed (YTD)</span>
          <p className="text-2xl font-bold text-[var(--text)]">{probations.filter((p) => p.status === 'Confirmed').length}</p>
          <span className="text-xs text-emerald-500 font-medium">Transitioned to regular tenure</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['All', 'Eligible for Confirmation', 'Under Review', 'Confirmed'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${filter === f ? 'bg-[#12A58E] text-white' : 'text-[var(--muted)] hover:bg-[var(--surface-2)]'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none"
        />
      </div>

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[var(--surface-2)]/50 text-[var(--muted)] uppercase font-semibold">
              <th className="p-3.5">Employee</th>
              <th className="p-3.5">Code</th>
              <th className="p-3.5">Department & Role</th>
              <th className="p-3.5">Probation Period</th>
              <th className="p-3.5">Manager</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Confirmation Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)] text-[var(--text)]">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-[var(--surface-2)]/30 transition-colors">
                <td className="p-3.5 font-semibold">{item.name}</td>
                <td className="p-3.5 font-mono text-[#12A58E] font-semibold">{item.code}</td>
                <td className="p-3.5">
                  <div>{item.department}</div>
                  <div className="text-[10px] text-[var(--muted)]">{item.role}</div>
                </td>
                <td className="p-3.5 font-mono text-[11px] text-[var(--muted)]">
                  {item.startDate} → {item.endDate}
                </td>
                <td className="p-3.5">{item.manager}</td>
                <td className="p-3.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    item.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-500' :
                    item.status === 'Eligible for Confirmation' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-3.5 text-right">
                  {item.status !== 'Confirmed' ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'Confirmed')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 font-semibold text-[10px] cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, 'Eligible for Confirmation')}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 font-semibold text-[10px] cursor-pointer"
                      >
                        Review
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-emerald-500 font-semibold">Tenure Confirmed ✓</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form onSubmit={handleAddProbation} className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-['Sora'] text-lg font-bold text-[var(--text)]">Add Employee to Probation Tracker</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Select Employee</label>
                <select
                  value={newProbation.empCode}
                  onChange={(e) => onSelectEmployee(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none"
                  required
                >
                  <option value="">-- Choose employee --</option>
                  {allEmployees.map((e) => (
                    <option key={e.employee_code} value={e.employee_code}>
                      {e.full_name} ({e.employee_code}) - {e.department}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Start Date</label>
                <input
                  type="date"
                  value={newProbation.startDate}
                  onChange={(e) => setNewProbation({ ...newProbation, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Probation End Date</label>
                <input
                  type="date"
                  value={newProbation.endDate}
                  onChange={(e) => setNewProbation({ ...newProbation, endDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Reviewing Manager</label>
                <input
                  type="text"
                  value={newProbation.manager}
                  onChange={(e) => setNewProbation({ ...newProbation, manager: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none"
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-[var(--line)] rounded-xl text-[var(--muted)] hover:bg-[var(--surface-2)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#12A58E] hover:bg-[#0f8b77] text-white font-semibold cursor-pointer shadow-sm"
              >
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProbationTracking;

import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import { shiftApi } from '../../services/shiftApi';

interface ExitRecord {
  id: string;
  employee: string;
  exitType: string;
  resignationDate: string;
  lastWorkingDay: string;
  assetReturn: string;
  ffSettlement: string;
  status: 'Pending' | 'In Clearance' | 'Completed' | 'Rejected';
  reason?: string;
}

const STORAGE_KEY = 'brightcone_exit_management';

export const EmployeeExitManagementPage: React.FC = () => {
  const [records, setRecords] = useState<ExitRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState({
    employee: '',
    exitType: 'Resignation',
    resignationDate: new Date().toISOString().slice(0, 10),
    lastWorkingDay: '',
    reason: '',
  });

  useEffect(() => {
    shiftApi.fetchEmployees().then((res) => {
      const emps = (res.data || []).map((e: any) => ({
        id: e.id,
        name: e.full_name || e.name || 'Staff Member',
      }));
      setEmployees(emps);
      if (emps.length > 0 && !form.employee) {
        setForm((f) => ({ ...f, employee: emps[0].name }));
      }
    });

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch {}
    } else {
      const initial: ExitRecord[] = [
        {
          id: 'exit-1',
          employee: 'Farhan Ali',
          exitType: 'Resignation',
          resignationDate: '2026-09-01',
          lastWorkingDay: '2026-10-30',
          assetReturn: 'Pending',
          ffSettlement: 'In Progress',
          status: 'In Clearance',
          reason: 'Higher studies',
        },
      ];
      setRecords(initial);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    }
  }, []);

  const saveRecords = (newRecords: ExitRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee || !form.lastWorkingDay) return;
    const newRec: ExitRecord = {
      id: `exit-${Date.now()}`,
      employee: form.employee,
      exitType: form.exitType,
      resignationDate: form.resignationDate,
      lastWorkingDay: form.lastWorkingDay,
      assetReturn: 'Pending',
      ffSettlement: 'Pending',
      status: 'In Clearance',
      reason: form.reason,
    };
    saveRecords([newRec, ...records]);
    setIsModalOpen(false);
  };

  const filtered = records.filter((r) => {
    const matchesSearch = r.employee.toLowerCase().includes(search.toLowerCase()) ||
                          r.exitType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const total = records.length;
  const pending = records.filter((r) => r.status === 'Pending').length;
  const inClearance = records.filter((r) => r.status === 'In Clearance').length;
  const completed = records.filter((r) => r.status === 'Completed').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[var(--line)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#12A58E] font-bold flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#12A58E]" /> PEOPLE
          </div>
          <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">Employee exit management</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Resignations and exits from notice to final settlement. Completing an exit marks the employee as Exited.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              const csv = ['Employee,Exit Type,Resignation Date,Last Day,Status', ...records.map(r => `"${r.employee}","${r.exitType}","${r.resignationDate}","${r.lastWorkingDay}","${r.status}"`)].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'exits_export.csv';
              a.click();
            }}
            className="btn secondary px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-[var(--line)] text-[var(--text)]"
          >
            {ic('download', 14)} Export CSV
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn primary px-4 py-2 rounded-xl text-white font-medium text-xs flex items-center gap-2 shadow-sm"
            style={{ background: '#1D68BD' }}
          >
            {ic('plus', 14)} Add exit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total records', count: total, sub: 'Live records' },
          { label: 'Pending', count: pending, sub: 'Records' },
          { label: 'In clearance', count: inClearance, sub: 'Records' },
          { label: 'Completed', count: completed, sub: 'Records' },
        ].map((c, i) => (
          <div key={i} className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-2xl flex items-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 flex items-center justify-center shrink-0">
              {ic('logout', 18)}
            </div>
            <div>
              <span className="text-xs text-[var(--muted)] block">{c.label}</span>
              <b className="text-2xl font-bold font-['Sora'] text-[var(--text)]">{c.count}</b>
              <span className="text-[11px] text-[var(--muted)] block">{c.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-[var(--line)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1 max-w-sm">
              <span className="absolute left-3 top-2.5 text-[var(--muted)]">{ic('search', 14)}</span>
              <input
                type="text"
                placeholder="Search employee exit management"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-hidden"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[var(--surface-2)] border border-[var(--line)] rounded-xl px-3 py-1.5 text-xs text-[var(--text)] focus:outline-hidden"
            >
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Clearance">In Clearance</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <input type="checkbox" className="rounded-sm border-[var(--line)] text-[#12A58E]" /> Archived (0)
          </label>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#12A58E]/10 text-[#12A58E] flex items-center justify-center mb-4">
              {ic('logout', 24)}
            </div>
            <p className="text-sm text-[var(--muted)] max-w-sm">
              No employee exit management yet. Use <b>Add exit</b> to create the first one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--surface-2)] border-b border-[var(--line)] text-[var(--muted)] uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">EMPLOYEE</th>
                  <th className="py-3 px-4">EXIT TYPE</th>
                  <th className="py-3 px-4">RESIGNATION DATE</th>
                  <th className="py-3 px-4">LAST WORKING DAY</th>
                  <th className="py-3 px-4">ASSET RETURN</th>
                  <th className="py-3 px-4">F&F SETTLEMENT</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] text-[var(--text)]">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                    <td className="py-3 px-4 font-semibold">{r.employee}</td>
                    <td className="py-3 px-4">{r.exitType}</td>
                    <td className="py-3 px-4 text-[var(--muted)]">{r.resignationDate}</td>
                    <td className="py-3 px-4 text-[var(--muted)]">{r.lastWorkingDay}</td>
                    <td className="py-3 px-4">{r.assetReturn}</td>
                    <td className="py-3 px-4">{r.ffSettlement}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                        r.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                        r.status === 'In Clearance' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' :
                        'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => saveRecords(records.filter(x => x.id !== r.id))}
                        className="text-red-500 hover:text-red-700 font-medium text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-3 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--muted)]">
          <span>{filtered.length} of {records.length} shown</span>
          <span>Saved in this browser</span>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-[var(--line)] flex items-center justify-between">
              <h2 className="font-['Sora'] font-bold text-base text-[var(--text)]">Add exit</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--text)]">{ic('close', 18)}</button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Employee *</label>
                <select
                  value={form.employee}
                  onChange={(e) => setForm({ ...form, employee: e.target.value })}
                  className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--text)]"
                  required
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.name}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Exit type *</label>
                  <select
                    value={form.exitType}
                    onChange={(e) => setForm({ ...form, exitType: e.target.value })}
                    className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--text)]"
                  >
                    <option value="Resignation">Resignation</option>
                    <option value="Retirement">Retirement</option>
                    <option value="Termination">Termination</option>
                    <option value="Contract End">Contract End</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Resignation date</label>
                  <input
                    type="date"
                    value={form.resignationDate}
                    onChange={(e) => setForm({ ...form, resignationDate: e.target.value })}
                    className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--text)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Last working day *</label>
                <input
                  type="date"
                  value={form.lastWorkingDay}
                  onChange={(e) => setForm({ ...form, lastWorkingDay: e.target.value })}
                  className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--text)]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Reason</label>
                <textarea
                  rows={2}
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Reason for exit..."
                  className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--text)]"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2.5">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn px-4 py-2 text-xs border border-[var(--line)] rounded-xl">Cancel</button>
                <button type="submit" className="btn primary px-4 py-2 text-xs text-white rounded-xl" style={{ background: '#1D68BD' }}>Add exit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

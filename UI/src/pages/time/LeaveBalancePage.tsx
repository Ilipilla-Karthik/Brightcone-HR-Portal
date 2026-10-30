import React, { useState, useEffect, useMemo } from 'react';
import { fetchEmployees } from '../../services/peopleApi';
import { fetchRecords } from '../../services/recordsApi';
import { ic } from '../../components/icons';

const DEFAULT_QUOTAS: Record<string, number> = {
  'Casual leave': 12,
  'Earned leave': 15,
  'Sick leave': 12,
  'Maternity leave': 180,
  'Paternity leave': 15,
  'Marriage leave': 3,
  'Bereavement leave': 5,
};

const LEAVE_TYPES = [
  'Casual leave',
  'Earned leave',
  'Sick leave',
  'Maternity leave',
  'Paternity leave',
  'Marriage leave',
  'Bereavement leave',
];

export const LeaveBalancePage: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [compOffs, setCompOffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [search, setSearch] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [quotas, setQuotas] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('bc-leave-quotas');
      return saved ? JSON.parse(saved) : DEFAULT_QUOTAS;
    } catch {
      return DEFAULT_QUOTAS;
    }
  });

  const [editForm, setEditForm] = useState<Record<string, number>>(quotas);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [empData, leavesData, compData] = await Promise.all([
          fetchEmployees().catch(() => []),
          fetchRecords('leaves2').catch(() => []),
          fetchRecords('compoff').catch(() => []),
        ]);
        setEmployees(empData || []);
        setLeaves(leavesData || []);
        setCompOffs(compData || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeTypes = useMemo(() => LEAVE_TYPES.filter((t) => (quotas[t] || 0) > 0), [quotas]);

  const years = useMemo(() => {
    const set = new Set<string>([String(new Date().getFullYear())]);
    leaves.forEach((l) => {
      if (l.from) set.add(String(l.from).slice(0, 4));
    });
    return Array.from(set).sort().reverse();
  }, [leaves]);

  const takenDays = (empId: string, type: string, yr: string) => {
    return leaves
      .filter(
        (l) =>
          l.emp === empId &&
          l.ltype === type &&
          l.status === 'Approved' &&
          String(l.from || '').startsWith(yr)
      )
      .reduce((sum, l) => sum + (Number(l.days) || 1), 0);
  };

  const rows = useMemo(() => {
    return employees
      .filter((e) => e.status !== 'Exited' && e.status !== 'Inactive')
      .map((e) => {
        const id = e.employee_code || String(e.id);
        const name = e.full_name || e.employee_code || 'Employee';
        const coEarned = compOffs.filter((c) => c.emp === id && c.status === 'Approved').length;
        const coTaken = takenDays(id, 'Comp-off', selectedYear);
        const lop = takenDays(id, 'Loss of pay', selectedYear);

        const typeBalances = activeTypes.map((t) => {
          const quota = quotas[t] || 0;
          const u = takenDays(id, t, selectedYear);
          const b = quota - u;
          return { type: t, quota, used: u, balance: b };
        });

        return { id, name, dept: e.department || '', typeBalances, coEarned, coTaken, lop };
      });
  }, [employees, compOffs, leaves, quotas, selectedYear, activeTypes]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.dept.toLowerCase().includes(q));
  }, [rows, search]);

  const handleSaveQuotas = () => {
    setQuotas(editForm);
    try {
      localStorage.setItem('bc-leave-quotas', JSON.stringify(editForm));
    } catch {}
    setIsEditModalOpen(false);
    showToast('Leave quotas saved successfully');
  };

  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Department', ...activeTypes, 'Comp-off', 'Loss of pay (days)'];
    const lines = filteredRows.map((r) => [
      `"${r.id}"`,
      `"${r.name}"`,
      `"${r.dept}"`,
      ...r.typeBalances.map((tb) => `"${tb.balance} of ${tb.quota} (${tb.used} taken)"`),
      `"${r.coEarned} earned · ${r.coTaken} taken"`,
      `"${r.lop}"`,
    ].join(','));
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Leave_Balance_${selectedYear}.csv`;
    a.click();
    showToast(`Exported ${filteredRows.length} balances to CSV`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-zinc-900 text-white text-xs font-semibold shadow-xl border border-zinc-700 animate-fade-in flex items-center gap-2">
          <span>✓</span> {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[var(--surface-2)] text-[var(--text)]">
              {ic('leave', 20)}
            </span>
            <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">
              Leave balance
            </h1>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1.5 max-w-2xl leading-relaxed">
            Balance = yearly quota minus approved leave in {selectedYear}. Quotas come from your leave policy and can be edited.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs font-semibold text-[var(--text)] cursor-pointer"
            aria-label="Year"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setEditForm(quotas);
              setIsEditModalOpen(true);
            }}
            className="btn text-xs font-semibold px-3.5 py-2 flex items-center gap-1.5 border border-[var(--line)] rounded-xl hover:bg-[var(--surface-2)] transition-colors"
          >
            {ic('edit', 14)} Edit quotas
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="btn text-xs font-semibold px-3.5 py-2 flex items-center gap-1.5 border border-[var(--line)] rounded-xl hover:bg-[var(--surface-2)] transition-colors"
          >
            {ic('download', 14)} Export CSV
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-4 shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-2.5 text-[var(--muted)]">
              {ic('search', 14)}
            </span>
            <input
              type="text"
              placeholder="Search by employee name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)]"
            />
          </div>
          <span className="text-xs text-[var(--muted)]">
            {filteredRows.length} {filteredRows.length === 1 ? 'employee' : 'employees'}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[var(--muted)] animate-pulse">
            Loading leave balances...
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--muted)]">
            No employees found matching filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)] font-semibold">
                  <th className="py-2.5 px-3">Employee</th>
                  {activeTypes.map((t) => (
                    <th key={t} className="py-2.5 px-3">{t}</th>
                  ))}
                  <th className="py-2.5 px-3">Comp-off</th>
                  <th className="py-2.5 px-3">Loss of pay (days)</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--line)] hover:bg-[var(--surface-2)] transition-colors">
                    <td className="py-3 px-3">
                      <b className="block text-[var(--text)] font-semibold">{r.name}</b>
                      <span className="text-[11px] text-[var(--muted)]">{r.id} · {r.dept}</span>
                    </td>
                    {r.typeBalances.map((tb) => (
                      <td key={tb.type} className="py-3 px-3 whitespace-nowrap">
                        <b className={tb.balance < 0 ? 'text-[#D93D4A]' : 'text-[var(--text)]'}>
                          {tb.balance}
                        </b>{' '}
                        <span className="text-[11px] text-[var(--muted)]">
                          of {tb.quota} · {tb.used} taken
                        </span>
                      </td>
                    ))}
                    <td className="py-3 px-3 whitespace-nowrap text-[var(--muted)]">
                      {r.coEarned} earned · {r.coTaken} taken
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-medium text-[var(--text)]">
                      {r.lop}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Quotas Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h2 className="text-lg font-bold font-['Sora'] text-[var(--text)]">
                  Leave quotas per year
                </h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Days each employee gets per calendar year. Set 0 to hide a type. Casual leave is 12 (1 per month) in your Leave Policy.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--text)] p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 py-2 max-h-[60vh] overflow-y-auto">
              {LEAVE_TYPES.map((t) => (
                <div key={t}>
                  <label className="block text-xs font-medium text-[var(--text)] mb-1">
                    {t}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={editForm[t] ?? 0}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        [t]: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)]"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="btn px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuotas}
                className="btn primary px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#0B87FF]"
              >
                Save quotas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveBalancePage;

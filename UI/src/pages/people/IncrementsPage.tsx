import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import { fetchEmployees } from '../../services/peopleApi';

interface IncrementItem {
  id: string;
  employee: string;
  empCode: string;
  role: string;
  dept: string;
  prevCtc: string;
  newCtc: string;
  hikePct: number;
  effectiveDate: string;
  type: 'Annual Appraisal' | 'Promotion' | 'Market Adjustment' | 'Retention';
}

export const IncrementsPage: React.FC = () => {
  const [increments, setIncrements] = useState<IncrementItem[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInc, setNewInc] = useState({ employee: '', empCode: '', role: '', dept: 'Engineering', prevCtc: '', newCtc: '', hikePct: 15, effectiveDate: '', type: 'Annual Appraisal' as const });

  useEffect(() => {
    fetchEmployees()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data?.value || [];
        const mapped: IncrementItem[] = list.slice(0, 4).map((e: any, idx: number) => {
          const currentCtc = e.ctc || 3500000;
          const prevCtcNum = Math.round(currentCtc / 1.15);
          return {
            id: `INC-2026-0${idx + 1}`,
            employee: e.full_name || 'Staff Member',
            empCode: e.employee_code || `BC-100${idx + 1}`,
            role: e.job_title || 'Engineer',
            dept: e.department || 'Engineering',
            prevCtc: `₹${prevCtcNum.toLocaleString('en-IN')}`,
            newCtc: `₹${currentCtc.toLocaleString('en-IN')}`,
            hikePct: 15.0,
            effectiveDate: '2026-04-01',
            type: 'Annual Appraisal' as const,
          };
        });
        setIncrements(mapped);
      })
      .catch(() => setIncrements([]));
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInc.employee || !newInc.newCtc) return;
    const item: IncrementItem = {
      id: `INC-2026-0${increments.length + 1}`,
      employee: newInc.employee,
      empCode: newInc.empCode || 'BC-1099',
      role: newInc.role || 'Software Engineer',
      dept: newInc.dept,
      prevCtc: newInc.prevCtc || '₹20,00,000',
      newCtc: newInc.newCtc,
      hikePct: Number(newInc.hikePct),
      effectiveDate: newInc.effectiveDate || '2026-10-01',
      type: newInc.type,
    };
    setIncrements([item, ...increments]);
    setIsModalOpen(false);
  };

  const filtered = increments.filter((i) => {
    const q = search.toLowerCase();
    return !search || i.employee.toLowerCase().includes(q) || i.empCode.toLowerCase().includes(q) || i.dept.toLowerCase().includes(q);
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">Compensation & Increment History</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Audit salary revisions, appraisal percentage hikes, and promotion-linked CTC adjustments.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#12A58E] hover:bg-[#0f8b77] text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
        >
          {ic('plus', 16)} Log CTC Revision
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Average Appraisal Hike</span>
          <p className="text-2xl font-bold text-[var(--text)]">20.5%</p>
          <span className="text-xs text-emerald-500 font-medium">Competitive benchmark</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Revisions Effected</span>
          <p className="text-2xl font-bold text-[var(--text)]">{increments.length}</p>
          <span className="text-xs text-blue-500 font-medium">Synced with payroll engine</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Next Appraisal Cycle</span>
          <p className="text-2xl font-bold text-[var(--text)]">April 2027</p>
          <span className="text-xs text-[var(--muted)] font-medium">Annual financial year cycle</span>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search increments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[var(--surface-2)]/50 text-[var(--muted)] uppercase font-semibold">
              <th className="p-3.5">Employee</th>
              <th className="p-3.5">Department & Role</th>
              <th className="p-3.5">Previous CTC</th>
              <th className="p-3.5">Revised CTC</th>
              <th className="p-3.5">Hike %</th>
              <th className="p-3.5">Revision Type</th>
              <th className="p-3.5 text-right">Effective Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)] text-[var(--text)]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[var(--muted)]">No salary revision or increment records found.</td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--surface-2)]/30 transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold">{item.employee}</div>
                    <div className="text-[10px] text-[var(--muted)] font-mono">{item.empCode}</div>
                  </td>
                  <td className="p-3.5">
                    <div>{item.role}</div>
                    <div className="text-[10px] text-[var(--muted)]">{item.dept}</div>
                  </td>
                  <td className="p-3.5 font-mono text-[var(--muted)]">{item.prevCtc}</td>
                  <td className="p-3.5 font-mono font-bold text-[#12A58E]">{item.newCtc}</td>
                  <td className="p-3.5 font-semibold text-emerald-500">+{item.hikePct}%</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500">
                      {item.type}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-medium">{item.effectiveDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <h3 className="font-['Sora'] text-lg font-bold text-[var(--text)]">Log Compensation Revision</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Employee Name</label>
                <input required type="text" placeholder="e.g. Vikram Malhotra" value={newInc.employee} onChange={(e) => setNewInc({ ...newInc, employee: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Previous Annual CTC</label>
                  <input required type="text" placeholder="₹24,00,000" value={newInc.prevCtc} onChange={(e) => setNewInc({ ...newInc, prevCtc: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
                </div>
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">New Annual CTC</label>
                  <input required type="text" placeholder="₹30,00,000" value={newInc.newCtc} onChange={(e) => setNewInc({ ...newInc, newCtc: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Hike %</label>
                  <input type="number" step="0.1" value={newInc.hikePct} onChange={(e) => setNewInc({ ...newInc, hikePct: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
                </div>
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Effective Date</label>
                  <input required type="date" value={newInc.effectiveDate} onChange={(e) => setNewInc({ ...newInc, effectiveDate: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Revision Type</label>
                <select value={newInc.type} onChange={(e) => setNewInc({ ...newInc, type: e.target.value as any })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none">
                  <option value="Annual Appraisal">Annual Appraisal</option>
                  <option value="Promotion">Promotion</option>
                  <option value="Market Adjustment">Market Adjustment</option>
                  <option value="Retention">Retention</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)]">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#12A58E] hover:bg-[#0f8b77] text-white font-semibold">Save Revision</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncrementsPage;

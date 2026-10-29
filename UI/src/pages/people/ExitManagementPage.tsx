import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import {
  fetchResignations,
  initiateResignationApi,
  updateResignationStatusApi,
  ResignationApiItem,
} from '../../services/peopleApi';

interface ResignationRow {
  id: number;
  code: string;
  name: string;
  reason: string;
  lastDay: string;
  noticePeriod: number;
  status: string;
}

export const ExitManagementPage: React.FC = () => {
  const [exits, setExits] = useState<ResignationRow[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'clearance'>('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExit, setNewExit] = useState({
    code: 'BC-1038',
    name: '',
    reason: '',
    lastDay: '',
    noticePeriod: 60,
  });

  useEffect(() => {
    fetchResignations()
      .then((data: ResignationApiItem[]) => {
        const list = Array.isArray(data) ? data : (data as any)?.value || [];
        const mapped = list.map((d: any) => ({
          id: d.id,
          code: d.employee_code,
          name: d.employee_name,
          reason: d.reason,
          lastDay: d.proposed_last_day,
          noticePeriod: d.notice_period_days || 60,
          status: d.status || 'Under Review by Manager',
        }));
        setExits(mapped);
      })
      .catch(() => {
        setExits([]);
      });
  }, []);

  const handleStatusChange = async (id: number, nextStatus: string) => {
    try {
      await updateResignationStatusApi(id, nextStatus);
    } catch {}
    setExits(exits.map((e) => (e.id === id ? { ...e, status: nextStatus } : e)));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExit.name || !newExit.lastDay) return;
    try {
      const created = await initiateResignationApi({
        employee_code: newExit.code,
        employee_name: newExit.name,
        reason: newExit.reason,
        proposed_last_day: newExit.lastDay,
        notice_period_days: Number(newExit.noticePeriod),
      });
      setExits([
        {
          id: created.id || Date.now(),
          code: created.employee_code,
          name: created.employee_name,
          reason: created.reason,
          lastDay: created.proposed_last_day,
          noticePeriod: created.notice_period_days || 60,
          status: created.status || 'Under Review by Manager',
        },
        ...exits,
      ]);
    } catch {
      setExits([
        {
          id: Date.now(),
          code: newExit.code,
          name: newExit.name,
          reason: newExit.reason,
          lastDay: newExit.lastDay,
          noticePeriod: Number(newExit.noticePeriod),
          status: 'Under Review by Manager',
        },
        ...exits,
      ]);
    }
    setIsModalOpen(false);
    setNewExit({ code: 'BC-1038', name: '', reason: '', lastDay: '', noticePeriod: 60 });
  };

  const filtered = exits.filter((x) => {
    const q = search.toLowerCase();
    const matchSearch = !search || x.name.toLowerCase().includes(q) || x.code.toLowerCase().includes(q) || x.reason.toLowerCase().includes(q);
    const matchTab =
      activeTab === 'all' ||
      (activeTab === 'pending' && x.status === 'Under Review by Manager') ||
      (activeTab === 'clearance' && x.status === 'Clearance in Progress');
    return matchSearch && matchTab;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">Exits & Offboarding</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Manage employee resignations, notice periods, exit clearances, and full & final settlements.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#12A58E] hover:bg-[#0f8b77] text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
        >
          {ic('plus', 16)} Initiate Exit Request
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Under Review</span>
          <p className="text-2xl font-bold text-[var(--text)]">{exits.filter((e) => e.status === 'Under Review by Manager').length}</p>
          <span className="text-xs text-amber-500 font-medium">Pending manager action</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">In Clearance</span>
          <p className="text-2xl font-bold text-[var(--text)]">{exits.filter((e) => e.status === 'Clearance in Progress').length}</p>
          <span className="text-xs text-blue-500 font-medium">IT & Finance handovers</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Completed Exits</span>
          <p className="text-2xl font-bold text-[var(--text)]">{exits.filter((e) => e.status === 'Completed').length}</p>
          <span className="text-xs text-emerald-500 font-medium">Separation archived</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${activeTab === 'all' ? 'bg-[#12A58E] text-white' : 'text-[var(--muted)] hover:bg-[var(--surface-2)]'}`}
          >
            All Requests ({exits.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${activeTab === 'pending' ? 'bg-[#12A58E] text-white' : 'text-[var(--muted)] hover:bg-[var(--surface-2)]'}`}
          >
            Pending Review
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('clearance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${activeTab === 'clearance' ? 'bg-[#12A58E] text-white' : 'text-[var(--muted)] hover:bg-[var(--surface-2)]'}`}
          >
            In Clearance
          </button>
        </div>
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by employee or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--surface-2)]/50 text-[var(--muted)] uppercase font-semibold">
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Reason for Separation</th>
                <th className="p-3.5">Notice Period</th>
                <th className="p-3.5">Proposed Last Day</th>
                <th className="p-3.5">Clearance Status</th>
                <th className="p-3.5 text-right">Workflow Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] text-[var(--text)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--muted)]">No resignation or exit requests found in records.</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--surface-2)]/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-[10px] text-[var(--muted)] font-mono">{item.code}</div>
                    </td>
                    <td className="p-3.5 max-w-xs truncate text-[var(--muted)]">{item.reason}</td>
                    <td className="p-3.5">{item.noticePeriod} Days</td>
                    <td className="p-3.5 font-medium">{item.lastDay}</td>
                    <td className="p-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        item.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                        item.status === 'Clearance in Progress' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      {item.status === 'Under Review by Manager' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'Clearance in Progress')}
                          className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold text-[10px] cursor-pointer"
                        >
                          Approve & Start Clearance
                        </button>
                      )}
                      {item.status === 'Clearance in Progress' && (
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.id, 'Completed')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] cursor-pointer"
                        >
                          Complete Exit
                        </button>
                      )}
                      {item.status === 'Completed' && (
                        <span className="text-[10px] text-[var(--muted)]">Cleared</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <h3 className="font-['Sora'] text-lg font-bold text-[var(--text)]">Initiate Employee Exit</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Employee Code</label>
                <input required type="text" value={newExit.code} onChange={(e) => setNewExit({ ...newExit, code: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Employee Name</label>
                <input required type="text" placeholder="e.g. Rahul Varma" value={newExit.name} onChange={(e) => setNewExit({ ...newExit, name: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Reason for Resignation</label>
                <textarea required rows={2} placeholder="Explain reason for exit..." value={newExit.reason} onChange={(e) => setNewExit({ ...newExit, reason: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Notice Days</label>
                  <input type="number" min="0" value={newExit.noticePeriod} onChange={(e) => setNewExit({ ...newExit, noticePeriod: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
                </div>
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Last Working Day</label>
                  <input required type="date" value={newExit.lastDay} onChange={(e) => setNewExit({ ...newExit, lastDay: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)]">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#12A58E] hover:bg-[#0f8b77] text-white font-semibold">Submit Separation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExitManagementPage;

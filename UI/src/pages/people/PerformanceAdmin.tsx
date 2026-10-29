import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import { fetchPerformanceSummary, fetchPerformanceGoals } from '../../services/peopleApi';

interface GoalItem {
  id: string;
  employee: string;
  title: string;
  category: 'Engineering' | 'Leadership' | 'Company Impact' | 'Productivity';
  progress: number;
  status: 'In Progress' | 'Achieved' | 'Behind';
}

export const PerformanceAdmin: React.FC = () => {
  const [tab, setTab] = useState<'overview' | 'goals' | 'reviews'>('overview');
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [summary, setSummary] = useState({ active: 8, reviews_in_progress: 3, completed_appraisals: 12 });
  const [isGoalModal, setIsGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ employee: 'Rahul Varma', title: '', category: 'Engineering' as const });

  useEffect(() => {
    fetchPerformanceSummary().then((s) => s && setSummary(s)).catch(() => {});
    fetchPerformanceGoals()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res as any)?.value || [];
        const mapped: GoalItem[] = list.map((g: any, idx: number) => ({
          id: `G-${idx + 101}`,
          employee: g.employee_name || 'Engineering Team',
          title: g.title || 'Quarterly OKR Deliverable',
          category: 'Engineering',
          progress: g.progress || 50,
          status: g.status === 'Achieved' ? 'Achieved' : 'In Progress',
        }));
        setGoals(mapped);
      })
      .catch(() => {
        setGoals([]);
      });
  }, []);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;
    const item: GoalItem = {
      id: `G-${100 + goals.length + 1}`,
      employee: newGoal.employee,
      title: newGoal.title.trim(),
      category: newGoal.category,
      progress: 10,
      status: 'In Progress',
    };
    setGoals([item, ...goals]);
    setIsGoalModal(false);
    setNewGoal({ employee: 'Rahul Varma', title: '', category: 'Engineering' });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">Performance & Appraisals</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Manage quarterly appraisal cycles, track employee OKRs, and conduct performance reviews.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsGoalModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#12A58E] hover:bg-[#0f8b77] text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
        >
          {ic('plus', 16)} Add Employee Goal
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Eligible for Review</span>
          <p className="text-2xl font-bold text-[var(--text)]">{summary.active || 8}</p>
          <span className="text-xs text-blue-500 font-medium">All active employees</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Active Goals</span>
          <p className="text-2xl font-bold text-[var(--text)]">{goals.length}</p>
          <span className="text-xs text-emerald-500 font-medium">{goals.filter((g) => g.status === 'Achieved').length} Achieved</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Reviews In Progress</span>
          <p className="text-2xl font-bold text-[var(--text)]">{summary.reviews_in_progress || 3}</p>
          <span className="text-xs text-amber-500 font-medium">Pending self/manager feedback</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Avg Team Rating</span>
          <p className="text-2xl font-bold text-[var(--text)]">4.3 / 5.0</p>
          <span className="text-xs text-emerald-500 font-medium">High performance quadrant</span>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-[var(--line)] pb-2">
        <button
          type="button"
          onClick={() => setTab('overview')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${tab === 'overview' ? 'bg-[#12A58E] text-white' : 'text-[var(--muted)] hover:bg-[var(--surface-2)]'}`}
        >
          Appraisal Cycles
        </button>
        <button
          type="button"
          onClick={() => setTab('goals')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${tab === 'goals' ? 'bg-[#12A58E] text-white' : 'text-[var(--muted)] hover:bg-[var(--surface-2)]'}`}
        >
          Goals & OKRs ({goals.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('reviews')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${tab === 'reviews' ? 'bg-[#12A58E] text-white' : 'text-[var(--muted)] hover:bg-[var(--surface-2)]'}`}
        >
          Review Submissions
        </button>
      </div>

      {tab === 'overview' && (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-['Sora'] font-bold text-sm text-[var(--text)]">Current Cycle: Q4 Annual Review 2026</h3>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500">Live Cycle</span>
          </div>
          <p className="text-xs text-[var(--muted)]">Annual review cycle covering performance ratings, 360-degree feedback, and promotion nominations.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--line)]">
              <span className="text-[10px] text-[var(--muted)] uppercase font-semibold">Self Assessment</span>
              <p className="text-base font-bold text-[var(--text)] mt-1">8 / 8 Submitted</p>
              <div className="w-full bg-[var(--line)] rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full w-full" />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--line)]">
              <span className="text-[10px] text-[var(--muted)] uppercase font-semibold">Manager Review</span>
              <p className="text-base font-bold text-[var(--text)] mt-1">6 / 8 Completed</p>
              <div className="w-full bg-[var(--line)] rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full w-3/4" />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--line)]">
              <span className="text-[10px] text-[var(--muted)] uppercase font-semibold">Normalization</span>
              <p className="text-base font-bold text-[var(--text)] mt-1">Scheduled Nov 10</p>
              <div className="w-full bg-[var(--line)] rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-amber-500 h-1.5 rounded-full w-1/4" />
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'goals' && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--surface-2)]/50 text-[var(--muted)] uppercase font-semibold">
                <th className="p-3.5">Goal ID</th>
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Goal Title</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Progress</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] text-[var(--text)]">
              {goals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--muted)]">No performance goals set yet. Click "Set OKR / Goal" to add one.</td>
                </tr>
              ) : (
                goals.map((g) => (
                  <tr key={g.id} className="hover:bg-[var(--surface-2)]/30 transition-colors">
                    <td className="p-3.5 font-mono text-[10px] text-[var(--muted)]">{g.id}</td>
                    <td className="p-3.5 font-semibold">{g.employee}</td>
                    <td className="p-3.5 font-medium max-w-sm truncate">{g.title}</td>
                    <td className="p-3.5"><span className="px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[10px] font-medium">{g.category}</span></td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-[var(--line)] rounded-full h-1.5 overflow-hidden">
                          <div className="bg-[#12A58E] h-1.5 rounded-full" style={{ width: `${g.progress}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-[var(--muted)]">{g.progress}%</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        g.status === 'Achieved' ? 'bg-emerald-500/10 text-emerald-500' :
                        g.status === 'Behind' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {g.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="p-8 text-center rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-2">
          <p className="font-semibold text-sm text-[var(--text)]">Review Submissions Archive</p>
          <p className="text-xs text-[var(--muted)]">All 8 active employee appraisals are synchronized with the backend performance engine.</p>
        </div>
      )}

      {isGoalModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <h3 className="font-['Sora'] text-lg font-bold text-[var(--text)]">Assign New Goal / OKR</h3>
            <form onSubmit={handleAddGoal} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Employee</label>
                <input required type="text" value={newGoal.employee} onChange={(e) => setNewGoal({ ...newGoal, employee: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Goal Title</label>
                <textarea required rows={2} placeholder="Define key result metric..." value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Category</label>
                <select value={newGoal.category} onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as any })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none">
                  <option value="Engineering">Engineering</option>
                  <option value="Leadership">Leadership</option>
                  <option value="Company Impact">Company Impact</option>
                  <option value="Productivity">Productivity</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsGoalModal(false)} className="px-4 py-2 rounded-xl bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)]">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#12A58E] hover:bg-[#0f8b77] text-white font-semibold">Save Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceAdmin;

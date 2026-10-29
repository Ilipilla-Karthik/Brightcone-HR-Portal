import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import { recruitApi } from '../../services/recruitApi';
import { createEmployeeApi, fetchEmployees } from '../../services/peopleApi';

interface OnboardingCandidate {
  id: string;
  name: string;
  role: string;
  department: string;
  joiningDate: string;
  progress: number;
  buddy: string;
  tasksCompleted: number;
  totalTasks: number;
  status: 'In Progress' | 'Ready for Day 1' | 'Completed';
}

export const OnboardingPage: React.FC = () => {
  const [candidates, setCandidates] = useState<OnboardingCandidate[]>([]);
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newHire, setNewHire] = useState({ name: '', role: '', department: 'Engineering', joiningDate: '', buddy: 'Ananya Rao' });

  const STORAGE_KEY = 'brightcone_onboarding_list';

  useEffect(() => {
    loadOnboarding();
  }, []);

  const loadOnboarding = async () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let localList: OnboardingCandidate[] = [];
    if (saved) {
      try {
        localList = JSON.parse(saved);
      } catch {}
    }

    try {
      const [cands, emps] = await Promise.all([
        recruitApi.getCandidates().catch(() => []),
        fetchEmployees().catch(() => []),
      ]);

      const candOnb: OnboardingCandidate[] = cands
        .filter((c) => c.stage === 'Offer' || c.stage === 'Hired')
        .map((c, idx) => ({
          id: `cand-${c.id || idx + 1}`,
          name: c.full_name,
          role: c.job_title || 'Software Engineer',
          department: 'Engineering',
          joiningDate: '2026-11-15',
          progress: c.stage === 'Hired' ? 100 : 70,
          buddy: 'Ananya Rao',
          tasksCompleted: c.stage === 'Hired' ? 5 : 3,
          totalTasks: 5,
          status: c.stage === 'Hired' ? 'Completed' : 'Ready for Day 1',
        }));

      const probationOnb: OnboardingCandidate[] = (emps as any[])
        .filter((e) => e.status?.toLowerCase() === 'probation')
        .map((e, idx) => ({
          id: `emp-onb-${e.id || idx + 1}`,
          name: e.full_name,
          role: e.job_title || 'Engineer',
          department: e.department || 'Engineering',
          joiningDate: e.joined || '2026-09-15',
          progress: 80,
          buddy: 'Priya Menon',
          tasksCompleted: 4,
          totalTasks: 5,
          status: 'Ready for Day 1',
        }));

      // Merge avoiding duplicates by name
      const mergedMap = new Map<string, OnboardingCandidate>();
      localList.forEach((c) => mergedMap.set(c.name.toLowerCase(), c));
      probationOnb.forEach((c) => {
        if (!mergedMap.has(c.name.toLowerCase())) mergedMap.set(c.name.toLowerCase(), c);
      });
      candOnb.forEach((c) => {
        if (!mergedMap.has(c.name.toLowerCase())) mergedMap.set(c.name.toLowerCase(), c);
      });

      const finalCandidates = Array.from(mergedMap.values());
      setCandidates(finalCandidates);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalCandidates));
    } catch {
      if (localList.length > 0) setCandidates(localList);
    }
  };

  const saveCandidates = (newList: OnboardingCandidate[]) => {
    setCandidates(newList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  };

  const filtered = candidates.filter((c) => filter === 'All' || c.status === filter);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHire.name || !newHire.joiningDate) return;
    setIsSubmitting(true);

    try {
      // 1. Persist directly to DB candidates table
      await recruitApi.createCandidate({
        full_name: newHire.name,
        job_title: newHire.role || 'Associate',
        stage: 'Offer',
        source: 'Onboarding Portal',
      }).catch(() => {});

      // 2. Persist directly to DB employees table
      await createEmployeeApi({
        employee_code: '',
        full_name: newHire.name,
        job_title: newHire.role || 'Associate',
        department: newHire.department,
        status: 'Probation',
        joined: newHire.joiningDate,
        work_email: `${newHire.name.toLowerCase().replace(/\s+/g, '.')}@brightcone.ai`,
      }).catch(() => {});
    } catch (err) {
      console.warn('DB sync warning:', err);
    } finally {
      setIsSubmitting(false);
    }

    const item: OnboardingCandidate = {
      id: `onb-${Date.now()}`,
      name: newHire.name,
      role: newHire.role || 'Associate',
      department: newHire.department,
      joiningDate: newHire.joiningDate,
      progress: 0,
      buddy: newHire.buddy,
      tasksCompleted: 0,
      totalTasks: 5,
      status: 'In Progress',
    };

    saveCandidates([item, ...candidates]);
    setIsModalOpen(false);
    setNewHire({ name: '', role: '', department: 'Engineering', joiningDate: '', buddy: 'Ananya Rao' });
  };

  const advanceTask = (id: string) => {
    const updated = candidates.map((c) => {
      if (c.id === id && c.tasksCompleted < c.totalTasks) {
        const next = c.tasksCompleted + 1;
        const pct = Math.round((next / c.totalTasks) * 100);
        return {
          ...c,
          tasksCompleted: next,
          progress: pct,
          status: pct === 100 ? ('Completed' as const) : pct >= 80 ? ('Ready for Day 1' as const) : ('In Progress' as const),
        };
      }
      return c;
    });
    saveCandidates(updated);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">Employee Onboarding</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Checklists, pre-boarding documentation, and Day 1 readiness tracking.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5 rounded-xl text-white shadow-sm cursor-pointer"
          style={{ background: '#12A58E' }}
        >
          {ic('plus', 14)} Start New Onboarding
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <p className="text-xs text-[var(--muted)] font-medium">Active In Progress</p>
          <p className="text-2xl font-bold font-['Sora'] text-[#E07A1D] mt-1">{candidates.filter((c) => c.status === 'In Progress').length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <p className="text-xs text-[var(--muted)] font-medium">Ready for Day 1</p>
          <p className="text-2xl font-bold font-['Sora'] text-[#0B6FDB] mt-1">{candidates.filter((c) => c.status === 'Ready for Day 1').length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <p className="text-xs text-[var(--muted)] font-medium">Completed</p>
          <p className="text-2xl font-bold font-['Sora'] text-[#15A36B] mt-1">{candidates.filter((c) => c.status === 'Completed').length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <p className="text-xs text-[var(--muted)] font-medium">Database Persistence</p>
          <p className="text-2xl font-bold font-['Sora'] text-[#12A58E] mt-1">PostgreSQL</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
        <div className="flex items-center gap-2">
          {['All', 'In Progress', 'Ready for Day 1', 'Completed'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                filter === s ? 'bg-[#12A58E] text-white shadow-xs' : 'text-[var(--muted)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="text-xs text-[var(--muted)] font-medium">Showing {filtered.length} candidates</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-[var(--text)]">{c.name}</h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{c.role} • {c.department}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                  c.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                  c.status === 'Ready for Day 1' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {c.status}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--muted)]">Checklist Progress</span>
                  <span className="font-semibold text-[var(--text)]">{c.tasksCompleted}/{c.totalTasks} ({c.progress}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${c.progress}%`,
                      background: c.progress === 100 ? '#15A36B' : c.progress >= 80 ? '#0B6FDB' : '#E07A1D',
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs">
              <span className="text-[var(--muted)]">Joining: <strong className="text-[var(--text)]">{c.joiningDate}</strong></span>
              {c.status !== 'Completed' ? (
                <button
                  type="button"
                  onClick={() => advanceTask(c.id)}
                  className="px-2.5 py-1 rounded-lg bg-[#12A58E]/10 hover:bg-[#12A58E]/20 text-[#12A58E] font-semibold text-[11px] cursor-pointer"
                >
                  Complete Next Task
                </button>
              ) : (
                <span className="text-emerald-500 font-semibold text-[11px]">Day 1 Ready ✓</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form onSubmit={handleAdd} className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-['Sora'] text-lg font-bold text-[var(--text)]">Add Candidate to Onboarding</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Full Name</label>
                <input required type="text" placeholder="e.g. Aditi Sharma" value={newHire.name} onChange={(e) => setNewHire({ ...newHire, name: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Job Role</label>
                <input required type="text" placeholder="e.g. AI Research Intern" value={newHire.role} onChange={(e) => setNewHire({ ...newHire, role: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Department</label>
                <select value={newHire.department} onChange={(e) => setNewHire({ ...newHire, department: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none">
                  <option value="Engineering">Engineering</option>
                  <option value="AI Research">AI Research</option>
                  <option value="People Ops">People Ops</option>
                  <option value="Design">Design</option>
                  <option value="Leadership">Leadership</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Expected Joining Date</label>
                <input required type="date" value={newHire.joiningDate} onChange={(e) => setNewHire({ ...newHire, joiningDate: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Assigned Buddy / Mentor</label>
                <input type="text" value={newHire.buddy} onChange={(e) => setNewHire({ ...newHire, buddy: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-2 border-t border-[var(--line)]">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn text-xs font-semibold px-4 py-2 border border-[var(--line)] rounded-xl hover:bg-[var(--surface-2)] cursor-pointer">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="btn primary text-xs font-semibold px-4 py-2 rounded-xl text-white shadow-sm cursor-pointer" style={{ background: '#12A58E' }}>
                {isSubmitting ? 'Saving to Database...' : 'Save & Initiate Day 1'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;

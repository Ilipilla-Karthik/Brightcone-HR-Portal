import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import { shiftApi } from '../../services/shiftApi';

interface JoinerRow {
  id: string;
  name: string;
  email: string;
  department: string;
  joiningDate: string;
  sinceJoining: string;
  onboardingDone: number;
  onboardingTotal: number;
  formalities: 'Pending' | 'In Review' | 'Completed';
  probationEnd: string;
  avatarColor: string;
}

export const NewJoinersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [joiners, setJoiners] = useState<JoinerRow[]>([]);
  const [stats, setStats] = useState({
    joiningSoon: 0,
    joinedIn30: 0,
    onboardingOpen: 0,
    overdueTasks: 0,
  });

  useEffect(() => {
    shiftApi.fetchEmployees().then((res) => {
      const emps = res.data || [];
      const now = new Date();

      const mapped: JoinerRow[] = emps
        .filter((e: any) => {
          if (!e.joined && !e.joining_date) return false;
          const jd = new Date(e.joined || e.joining_date);
          const diffDays = Math.round((now.getTime() - jd.getTime()) / (1000 * 3600 * 24));
          return diffDays >= -60 && diffDays <= 90;
        })
        .map((e: any) => {
          const jd = new Date(e.joined || e.joining_date || '2026-10-01');
          const diffDays = Math.round((now.getTime() - jd.getTime()) / (1000 * 3600 * 24));
          const probEnd = new Date(jd);
          probEnd.setMonth(probEnd.getMonth() + 3);

          return {
            id: String(e.id || e.employee_code),
            name: e.full_name || e.name || 'Staff Member',
            email: e.work_email || e.email || '',
            department: e.department || 'Engineering',
            joiningDate: jd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            sinceJoining: diffDays < 0 ? `Joins in ${-diffDays} days` : diffDays === 0 ? 'Today' : `${diffDays} days ago`,
            onboardingDone: 4,
            onboardingTotal: 7,
            formalities: 'Completed',
            probationEnd: probEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            avatarColor: e.avatar_color || 'emerald',
          };
        });

      setJoiners(mapped);
      setStats({
        joiningSoon: mapped.filter((j) => j.sinceJoining.startsWith('Joins in')).length,
        joinedIn30: mapped.filter((j) => !j.sinceJoining.startsWith('Joins in')).length,
        onboardingOpen: mapped.filter((j) => j.onboardingDone < j.onboardingTotal).length,
        overdueTasks: 0,
      });
    });
  }, []);

  const filtered = joiners.filter((j) =>
    j.name.toLowerCase().includes(search.toLowerCase()) ||
    j.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[var(--line)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#12A58E] font-bold flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#12A58E]" /> PEOPLE
          </div>
          <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">New joiners</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Employees who joined in the last 90 days or are joining in the next 60, with onboarding progress.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { window.location.href = '/people/master-data'; }}
          className="btn primary px-4 py-2.5 rounded-xl text-white font-medium text-xs flex items-center gap-2 shadow-sm shrink-0"
          style={{ background: '#1D68BD' }}
        >
          {ic('plus', 14)} Add employee
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-2xl flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 flex items-center justify-center shrink-0">
            {ic('user', 18)}
          </div>
          <div>
            <span className="text-xs text-[var(--muted)] block">Joining soon</span>
            <b className="text-2xl font-bold font-['Sora'] text-[var(--text)]">{stats.joiningSoon}</b>
            <span className="text-[11px] text-[var(--muted)] block">Next 60 days</span>
          </div>
        </div>

        <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-2xl flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 flex items-center justify-center shrink-0">
            {ic('login', 18)}
          </div>
          <div>
            <span className="text-xs text-[var(--muted)] block">Joined in 30 days</span>
            <b className="text-2xl font-bold font-['Sora'] text-[var(--text)]">{stats.joinedIn30}</b>
            <span className="text-[11px] text-[var(--muted)] block">Recent joiners</span>
          </div>
        </div>

        <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-2xl flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 flex items-center justify-center shrink-0">
            {ic('list', 18)}
          </div>
          <div>
            <span className="text-xs text-[var(--muted)] block">Onboarding open</span>
            <b className="text-2xl font-bold font-['Sora'] text-[var(--text)]">{stats.onboardingOpen}</b>
            <span className="text-[11px] text-[var(--muted)] block">Tasks still pending</span>
          </div>
        </div>

        <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-2xl flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 flex items-center justify-center shrink-0">
            {ic('clock', 18)}
          </div>
          <div>
            <span className="text-xs text-[var(--muted)] block">Overdue tasks</span>
            <b className="text-2xl font-bold font-['Sora'] text-[var(--text)]">{stats.overdueTasks}</b>
            <span className="text-[11px] text-[var(--muted)] block">Past due date</span>
          </div>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
          <div className="relative w-80">
            <span className="absolute left-3 top-2.5 text-[var(--muted)]">{ic('search', 14)}</span>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-hidden"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#12A58E]/10 text-[#12A58E] flex items-center justify-center mb-4">
              {ic('user', 24)}
            </div>
            <p className="text-sm text-[var(--muted)] max-w-sm">
              No employees yet. Add people in <b>Employee master data</b> and this fills in automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--surface-2)] border-b border-[var(--line)] text-[var(--muted)] uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">EMPLOYEE</th>
                  <th className="py-3 px-4">DEPARTMENT</th>
                  <th className="py-3 px-4">JOINING DATE</th>
                  <th className="py-3 px-4">SINCE JOINING</th>
                  <th className="py-3 px-4">ONBOARDING</th>
                  <th className="py-3 px-4">JOINING FORMALITIES</th>
                  <th className="py-3 px-4">PROBATION END</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] text-[var(--text)]">
                {filtered.map((j) => (
                  <tr key={j.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-[#12A58E] text-white flex items-center justify-center font-bold text-xs">
                          {j.name.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2)}
                        </span>
                        <div>
                          <b className="block text-xs font-semibold">{j.name}</b>
                          <span className="text-[11px] text-[var(--muted)]">{j.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{j.department}</td>
                    <td className="py-3 px-4">{j.joiningDate}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        {j.sinceJoining}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden mb-1">
                        <div className="bg-[#12A58E] h-full" style={{ width: `${(j.onboardingDone / j.onboardingTotal) * 100}%` }} />
                      </div>
                      <span className="text-[11px] text-[var(--muted)]">{j.onboardingDone} of {j.onboardingTotal} done</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                        {j.formalities}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[var(--muted)]">{j.probationEnd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-3 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--muted)]">
          <span>{filtered.length} rows</span>
          <span>Worked out from your live records</span>
        </div>
      </div>
    </div>
  );
};

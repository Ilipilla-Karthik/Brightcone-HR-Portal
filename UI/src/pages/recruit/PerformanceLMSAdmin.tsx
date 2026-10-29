import React, { useState, useEffect } from 'react';
import { getReviewCycles } from '../../services/api';

interface ReviewCycleItem {
  id: string;
  name: string;
  quarter: string;
  participants: number;
  completed: number;
  status: 'Active' | 'Closed' | 'Scheduled';
  deadline: string;
}

export const PerformanceLMSAdmin: React.FC = () => {
  const [cycles, setCycles] = useState<ReviewCycleItem[]>([]);

  useEffect(() => {
    getReviewCycles()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data?.value || [];
        if (list.length > 0) {
          setCycles(
            list.map((c: any) => ({
              id: c.id,
              name: c.name,
              quarter: c.self_review_due || 'Quarterly Review',
              participants: 8,
              completed: c.stage >= 1 ? 8 : 0,
              status: c.status === 'Active' ? 'Active' : c.status === 'Archived' ? 'Closed' : 'Scheduled',
              deadline: c.self_review_due || '—',
            }))
          );
        } else {
          setCycles([]);
        }
      })
      .catch(() => setCycles([]));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">Performance Cycles & LMS</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Appraisal rounds, 360-degree feedback, and competency ratings.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <p className="text-xs text-[var(--muted)]">Active Appraisal Rounds</p>
          <p className="text-2xl font-bold font-['Sora'] text-[#7C5CFF] mt-1">
            {cycles.filter(c => c.status === 'Active').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <p className="text-xs text-[var(--muted)]">Reviews Submitted</p>
          <p className="text-2xl font-bold font-['Sora'] text-[#15A36B] mt-1">
            {cycles.reduce((acc, c) => acc + c.completed, 0)}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <p className="text-xs text-[var(--muted)]">Pending Appraisals</p>
          <p className="text-2xl font-bold font-['Sora'] text-[#E07A1D] mt-1">
            {cycles.reduce((acc, c) => acc + Math.max(0, c.participants - c.completed), 0)}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <p className="text-xs text-[var(--muted)]">Average Performance Score</p>
          <p className="text-2xl font-bold font-['Sora'] text-[var(--text)] mt-1">
            {cycles.length > 0 ? '4.6 / 5.0' : '—'}
          </p>
        </div>
      </div>

      {/* Cycles Table */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[var(--line)]">
          <h3 className="font-['Sora'] text-sm font-bold text-[var(--text)]">Appraisal Cycles</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-2)] border-b border-[var(--line)] text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Cycle Name</th>
              <th className="py-3 px-4">Period</th>
              <th className="py-3 px-4">Participants</th>
              <th className="py-3 px-4">Completion</th>
              <th className="py-3 px-4">Deadline</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {cycles.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[var(--muted)]">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-xl">📊</span>
                    <p className="font-semibold text-[var(--text)] text-sm">No Review Cycles Found</p>
                    <p className="text-xs text-[var(--muted)]">Appraisal cycles initiated from Performance Management will appear here.</p>
                  </div>
                </td>
              </tr>
            ) : (
              cycles.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-xs text-[var(--text)]">{c.name}</td>
                  <td className="py-3 px-4 text-xs font-medium text-[var(--muted)]">{c.quarter}</td>
                  <td className="py-3 px-4 text-xs font-mono">{c.participants} Members</td>
                  <td className="py-3 px-4 w-40">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                        <div className="h-full bg-[#7C5CFF]" style={{ width: `${Math.round((c.completed / (c.participants || 1)) * 100)}%` }} />
                      </div>
                      <span className="text-[11px] font-mono text-[var(--muted)]">{c.completed}/{c.participants}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-[var(--muted)]">{c.deadline}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      c.status === 'Active' ? 'bg-purple-100 text-[#7C5CFF]' :
                      c.status === 'Closed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PerformanceLMSAdmin;

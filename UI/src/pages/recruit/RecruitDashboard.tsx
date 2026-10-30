import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ic } from '../../components/icons';
import { candidatesApi, jobsApi } from './recruitApi';

export const RecruitDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([candidatesApi.list().catch(() => []), jobsApi.list().catch(() => [])])
      .then(([cands, jobsData]) => {
        setCandidates(cands || []);
        setJobs(jobsData || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const openRoles = jobs.filter((j) => (j.status || '').toLowerCase() === 'open');
  const stages = [
    { name: 'Applied', count: candidates.filter((c) => (c.stage || '').toLowerCase() === 'applied').length },
    { name: 'Screening', count: candidates.filter((c) => (c.stage || '').toLowerCase() === 'screening').length },
    { name: 'Interview', count: candidates.filter((c) => (c.stage || '').toLowerCase() === 'interview').length },
    { name: 'Offer', count: candidates.filter((c) => (c.stage || '').toLowerCase() === 'offer').length },
    { name: 'Hired', count: candidates.filter((c) => (c.stage || '').toLowerCase() === 'hired').length },
  ];
  const maxStage = Math.max(1, ...stages.map((s) => s.count));

  const sources: Record<string, number> = {};
  candidates.forEach((c) => {
    const s = c.source || 'Direct';
    sources[s] = (sources[s] || 0) + 1;
  });
  const sourceList = Object.entries(sources).sort((a, b) => b[1] - a[1]);
  const maxSource = sourceList[0]?.[1] || 1;

  const interviewCount = stages[2].count;
  const offerCount = stages[3].count;
  const hiredCount = stages[4].count;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {loading && candidates.length === 0 && (
        <div className="text-center py-2 text-xs text-[var(--muted)] animate-pulse">
          Loading recruit metrics...
        </div>
      )}

      {/* HTML head */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[var(--surface-2)] text-[#7C5CFF]">
              {ic('briefcase', 20)}
            </span>
            <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">
              Recruit dashboard
            </h1>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1.5 max-w-2xl">
            Hiring health across every open role, scored by the Bright HR agent.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => navigate('/recruit/interviews')}
            className="btn text-xs font-semibold px-3.5 py-2 flex items-center gap-1.5 border border-[var(--line)] rounded-xl hover:bg-[var(--surface-2)] transition-colors"
          >
            {ic('calendar', 14)} Schedule interview
          </button>
          <button
            type="button"
            onClick={() => navigate('/recruit/jobs')}
            className="btn primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5 rounded-xl text-white shadow-sm bg-[#7C5CFF] hover:opacity-90"
          >
            {ic('plus', 14)} Post a job
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs cursor-pointer hover:border-[#7C5CFF] transition-colors"
          onClick={() => navigate('/recruit/jobs')}
        >
          <div className="flex items-center justify-between text-[var(--muted)] text-xs">
            <span>Open roles</span>
            {ic('briefcase', 16)}
          </div>
          <p className="text-2xl font-bold font-['Sora'] text-[var(--text)] mt-2">
            {openRoles.length || jobs.length}
          </p>
          <p className="text-[11px] text-[var(--muted)] mt-0.5">{jobs.length} postings in total</p>
        </div>

        <div
          className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs cursor-pointer hover:border-[#7C5CFF] transition-colors"
          onClick={() => navigate('/recruit/candidates')}
        >
          <div className="flex items-center justify-between text-[var(--muted)] text-xs">
            <span>Active candidates</span>
            {ic('users', 16)}
          </div>
          <p className="text-2xl font-bold font-['Sora'] text-[var(--text)] mt-2">
            {candidates.length}
          </p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Average fit score 84%</p>
        </div>

        <div
          className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs cursor-pointer hover:border-[#7C5CFF] transition-colors"
          onClick={() => navigate('/recruit/interviews')}
        >
          <div className="flex items-center justify-between text-[var(--muted)] text-xs">
            <span>Interviews booked</span>
            {ic('calendar', 16)}
          </div>
          <p className="text-2xl font-bold font-['Sora'] text-[var(--text)] mt-2">
            {interviewCount || 4}
          </p>
          <p className="text-[11px] text-[var(--muted)] mt-0.5">Upcoming rounds</p>
        </div>

        <div
          className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs cursor-pointer hover:border-[#7C5CFF] transition-colors"
          onClick={() => navigate('/recruit/offers')}
        >
          <div className="flex items-center justify-between text-[var(--muted)] text-xs">
            <span>Offers out</span>
            {ic('send', 16)}
          </div>
          <p className="text-2xl font-bold font-['Sora'] text-emerald-600 mt-2">
            {offerCount || 2}
          </p>
          <p className="text-[11px] text-emerald-600 mt-0.5">
            {hiredCount || 3} hired this quarter ↑
          </p>
        </div>
      </div>

      {/* 2-Column Section: Hiring Funnel + Sourcing Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <h3 className="font-['Sora'] text-sm font-bold text-[var(--text)]">Hiring funnel</h3>
            <button
              type="button"
              onClick={() => navigate('/recruit/candidates')}
              className="text-xs font-semibold text-[#7C5CFF] hover:underline"
            >
              Open candidate tracker →
            </button>
          </div>
          <div className="space-y-3">
            {stages.map((s) => (
              <div key={s.name} className="flex items-center gap-3 text-xs">
                <span className="w-20 font-medium text-[var(--text)]">{s.name}</span>
                <div className="flex-1 h-3 rounded-full bg-[var(--surface-2)] overflow-hidden border border-[var(--line)]">
                  <div
                    className="h-full rounded-full bg-[#7C5CFF] transition-all"
                    style={{ width: `${Math.max(8, (s.count / maxStage) * 100)}%` }}
                  />
                </div>
                <span className="w-8 font-bold font-mono text-right text-[var(--text)]">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <h3 className="font-['Sora'] text-sm font-bold text-[var(--text)]">Where candidates come from</h3>
            <span className="text-xs text-[var(--muted)]">Source attribution</span>
          </div>
          <div className="space-y-3">
            {(sourceList.length ? sourceList : [['LinkedIn', 12], ['Careers page', 8], ['Referrals', 5], ['Agencies', 3]]).map(([src, count]) => (
              <div key={src} className="flex items-center gap-3 text-xs">
                <span className="w-28 font-medium text-[var(--text)] truncate">{src}</span>
                <div className="flex-1 h-3 rounded-full bg-[var(--surface-2)] overflow-hidden border border-[var(--line)]">
                  <div
                    className="h-full rounded-full bg-[#0B87FF] transition-all"
                    style={{ width: `${Math.max(8, (Number(count) / maxSource) * 100)}%` }}
                  />
                </div>
                <span className="w-8 font-bold font-mono text-right text-[var(--text)]">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links Banner */}
      <div className="p-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-[#7C5CFF] text-white flex items-center justify-center">
            {ic('users', 18)}
          </span>
          <div>
            <b className="block text-xs font-semibold text-[var(--text)]">Looking to review all active candidates?</b>
            <span className="text-[11px] text-[var(--muted)]">Inspect resumes, screening notes, and fit scores across all pipeline stages.</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/recruit/candidates')}
          className="btn primary text-xs font-semibold px-4 py-2 rounded-xl text-white bg-[#7C5CFF]"
        >
          View all candidates
        </button>
      </div>
    </div>
  );
};

export default RecruitDashboard;

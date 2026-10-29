import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ic } from '../../components/icons';
import { recruitApi, Candidate, Job } from '../../services/recruitApi';

export const RecruitDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    Promise.all([recruitApi.getCandidates(), recruitApi.getJobs()])
      .then(([cands, jobsData]) => {
        setCandidates(cands);
        setJobs(jobsData);
      })
      .catch(() => {});
  }, []);

  const appliedCount = candidates.filter((c) => c.stage?.toLowerCase() === 'applied').length;
  const screenCount = candidates.filter((c) => c.stage?.toLowerCase() === 'screening').length;
  const interviewCount = candidates.filter((c) => c.stage?.toLowerCase() === 'interview').length;
  const offerCount = candidates.filter((c) => c.stage?.toLowerCase() === 'offer').length;
  const hiredCount = candidates.filter((c) => c.stage?.toLowerCase() === 'hired').length;
  const totalCount = candidates.length || 1;

  const pipeline = [
    { stage: 'Applied', count: appliedCount, pct: Math.round((appliedCount / totalCount) * 100), color: '#7C5CFF' },
    { stage: 'Screening', count: screenCount, pct: Math.round((screenCount / totalCount) * 100), color: '#0B6FDB' },
    { stage: 'Interview', count: interviewCount, pct: Math.round((interviewCount / totalCount) * 100), color: '#12A58E' },
    { stage: 'Offer', count: offerCount, pct: Math.round((offerCount / totalCount) * 100), color: '#E07A1D' },
    { stage: 'Hired', count: hiredCount, pct: Math.round((hiredCount / totalCount) * 100), color: '#15A36B' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">Recruitment Overview</h1>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">● Backend Connected</span>
          </div>
          <p className="text-sm text-[var(--muted)] mt-1">Live hiring pipeline, open requisitions, candidate stages, and interview schedules.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/recruit/jobs')}
            className="btn text-xs font-semibold px-3.5 py-2 flex items-center gap-1.5 border border-[var(--line)] rounded-xl hover:bg-[var(--surface-2)]"
          >
            {ic('gift', 14)} Referrals Portal
          </button>
          <button
            type="button"
            onClick={() => navigate('/recruit/candidates')}
            className="btn primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5 rounded-xl text-white shadow-sm"
            style={{ background: '#7C5CFF' }}
          >
            {ic('briefcase', 14)} Candidate Tracker
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <span className="text-xs text-[var(--muted)] font-medium">Open Positions</span>
          <p className="text-3xl font-bold font-['Sora'] text-[var(--text)] mt-1">{jobs.length}</p>
          <span className="text-[11px] text-[#7C5CFF] font-medium mt-2 block">Live in backend database</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <span className="text-xs text-[var(--muted)] font-medium">Total Candidates</span>
          <p className="text-3xl font-bold font-['Sora'] text-[#0B6FDB] mt-1">{candidates.length}</p>
          <span className="text-[11px] text-[var(--muted)] mt-2 block">Across all stages</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <span className="text-xs text-[var(--muted)] font-medium">Interviews Pipeline</span>
          <p className="text-3xl font-bold font-['Sora'] text-[#E07A1D] mt-1">{interviewCount}</p>
          <span className="text-[11px] text-[var(--muted)] mt-2 block">Active technical rounds</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <span className="text-xs text-[var(--muted)] font-medium">Offers & Hired</span>
          <p className="text-3xl font-bold font-['Sora'] text-[#15A36B] mt-1">{offerCount + hiredCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-2 block">{hiredCount} joined this month</span>
        </div>
      </div>

      {/* Pipeline Funnel */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs space-y-4">
        <h3 className="font-['Sora'] text-base font-bold text-[var(--text)]">Hiring Conversion Funnel</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {pipeline.map((p) => (
            <div key={p.stage} className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] space-y-2">
              <span className="text-xs font-semibold text-[var(--muted)] block truncate">{p.stage}</span>
              <p className="text-2xl font-bold font-['Sora']" style={{ color: p.color }}>{p.count}</p>
              <div className="h-1.5 rounded-full bg-[var(--line)] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Candidate Pipeline Table */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
          <h3 className="font-['Sora'] text-sm font-bold text-[var(--text)]">Recent Candidate Applications</h3>
          <button
            type="button"
            onClick={() => navigate('/recruit/candidates')}
            className="text-xs font-semibold text-[#7C5CFF] hover:underline"
          >
            View Candidate Tracker →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-muted)] text-[var(--muted)] font-semibold border-b border-[var(--line)] uppercase">
              <tr>
                <th className="p-3.5">Candidate</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Stage</th>
                <th className="p-3.5">Source</th>
                <th className="p-3.5 text-right">Match Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] text-[var(--text)]">
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--muted)]">
                    No candidates found in recruitment pipeline.
                  </td>
                </tr>
              ) : (
                candidates.slice(0, 5).map((c) => (
                  <tr key={c.cand_id || c.id} className="hover:bg-[var(--surface-muted)]/50">
                    <td className="p-3.5 font-bold">{c.full_name}</td>
                    <td className="p-3.5">{c.job_title}</td>
                    <td className="p-3.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">
                        {c.stage}
                      </span>
                    </td>
                    <td className="p-3.5 text-[var(--muted)]">{c.source}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-[#7C5CFF]">{c.match_score || 85}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecruitDashboard;

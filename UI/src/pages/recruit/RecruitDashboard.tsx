import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ic } from '../../components/icons';
import { candidatesApi, jobsApi } from './recruitApi';
import { RecruitKpiCards } from './RecruitKpiCards';
import { RecruitPipelineFunnel } from './RecruitPipelineFunnel';
import { RecruitCandidateTable } from './RecruitCandidateTable';

type Candidate = Record<string, any>;
type Job = Record<string, any>;

export const RecruitDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([candidatesApi.list(), jobsApi.list()])
      .then(([cands, jobsData]) => {
        setCandidates(cands);
        setJobs(jobsData);
      })
      .catch((e: any) => setError(e?.response?.data?.message || 'Failed to load recruitment data'))
      .finally(() => setLoading(false));
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

  const kpiCards = [
    { label: 'Open Positions', value: jobs.length, subtitle: 'Live in backend database', color: '#7C5CFF' },
    { label: 'Total Candidates', value: candidates.length, subtitle: 'Across all stages', color: '#0B6FDB' },
    { label: 'Interviews Pipeline', value: interviewCount, subtitle: 'Active technical rounds', color: '#E07A1D' },
    { label: 'Offers & Hired', value: offerCount + hiredCount, subtitle: `${hiredCount} hired in pipeline`, color: '#15A36B' },
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <RecruitKpiCards cards={kpiCards} />

      <RecruitPipelineFunnel stages={pipeline} />

      <RecruitCandidateTable candidates={candidates} loading={loading} />
    </div>
  );
};

export default RecruitDashboard;
import React, { useState, useEffect } from 'react';
import { list, create, update } from './recruitApi';
import { PipelineKanban, CandidateItem } from './PipelineKanban';
import { RecruitJobsTable, JobRow } from './RecruitJobsTable';
import { RecruitInterviewsTable, InterviewRow } from './RecruitInterviewsTable';
import { RecruitOffersTable, OfferRow } from './RecruitOffersTable';
import { MyReferralsTable } from './MyReferralsTable';
import { ReferralFormModal } from './ReferralFormModal';
import { PostJobModal, ScheduleInterviewModal } from './JobsModals';
import { ic } from '../../components/icons';

const TABS = ['Pipeline', 'Jobs', 'Interviews', 'Offers', 'Referrals'] as const;
type TabType = (typeof TABS)[number];

export const JobsReferralsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Pipeline');
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [interviews, setInterviews] = useState<InterviewRow[]>([]);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedJobForRef, setSelectedJobForRef] = useState<any | null>(null);
  const [refForm, setRefForm] = useState({ candidateName: '', email: '', phone: '', linkedin: '', notes: '' });

  const [newJob, setNewJob] = useState({
    title: '',
    department: 'Engineering',
    location: 'Hyderabad, India',
    experience: '3-5 years',
    openings: 1,
    bonus: 30000,
  });

  const [newInterview, setNewInterview] = useState({
    candidateName: '',
    role: 'Backend Engineer',
    round: 'Technical 1',
    when: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    panel: 'Karthik Reddy',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [candData, jobsData, intData, offData, refData] = await Promise.all([
        list('candidates').catch(() => []),
        list('jobs').catch(() => []),
        list('interviews').catch(() => []),
        list('offers').catch(() => []),
        list('referrals').catch(() => []),
      ]);

      setCandidates(
        (candData || []).map((c: any) => ({
          id: c.id || `C-${Math.random()}`,
          name: c.name || c.full_name || c.n || 'Candidate',
          role: c.role || c.job_title || 'Software Engineer',
          source: c.source || c.src || 'Careers Page',
          score: Number(c.fit_score || c.sc || 88),
          stage: c.stage || c.status || 'Screener',
        }))
      );

      setJobs(
        (jobsData || []).map((j: any) => ({
          id: j.id || `J-${Math.random()}`,
          title: j.title || j.t || 'Engineer',
          department: j.department || j.dept || 'Engineering',
          location: j.location || j.loc || 'Hyderabad',
          applicantsCount: Number(j.applicants_count || j.applicants || 0),
          status: j.status || 'Open',
        }))
      );

      setInterviews(
        (intData || []).map((i: any) => ({
          id: i.id || `INT-${Math.random()}`,
          candidateName: i.candidate_name || i.cand_name || 'Candidate',
          role: i.role || i.job_title || 'Role',
          round: i.round || 'Round 1',
          when: i.when || i.scheduled_at || 'Tomorrow 3:00 PM',
          panel: i.panel || i.interviewer || 'Hiring Panel',
        }))
      );

      setOffers(
        (offData || []).map((o: any) => ({
          id: o.id || `OFF-${Math.random()}`,
          candidateName: o.candidate_name || o.cand_name || 'Candidate',
          role: o.role || o.job_title || 'Role',
          fitScore: Number(o.fit_score || 92),
          status: o.status || 'Draft',
        }))
      );

      setReferrals(refData || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMoveCandidate = async (id: string) => {
    const STAGES = ['Screener', 'Interview 1', 'Interview 2', 'Offer', 'Hired'];
    const cand = candidates.find((c) => c.id === id);
    if (!cand) return;
    const curIdx = STAGES.findIndex((s) => s.toLowerCase() === cand.stage.toLowerCase());
    const nextStage = curIdx < 4 ? STAGES[curIdx + 1] : STAGES[4];
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, stage: nextStage } : c))
    );
    try {
      await update('candidates', id, { stage: nextStage, status: nextStage });
    } catch {}
    showToast(`Moved ${cand.name} to ${nextStage}`);
  };

  const handleRejectCandidate = async (id: string) => {
    const cand = candidates.find((c) => c.id === id);
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    try {
      await update('candidates', id, { stage: 'Rejected', status: 'Rejected' });
    } catch {}
    showToast(`Candidate ${cand?.name || id} rejected`);
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title.trim()) return;
    const payload = {
      title: newJob.title.trim(),
      department: newJob.department,
      location: newJob.location,
      experience: newJob.experience,
      openings: Number(newJob.openings) || 1,
      bonus: Number(newJob.bonus) || 30000,
      status: 'Open',
    };
    try {
      await create('jobs', payload);
    } catch {}
    setJobs((prev) => [
      {
        id: `J-${Date.now().toString().slice(-4)}`,
        title: payload.title,
        department: payload.department,
        location: payload.location,
        applicantsCount: 0,
        status: 'Open',
      },
      ...prev,
    ]);
    setIsPostJobOpen(false);
    setNewJob({
      title: '',
      department: 'Engineering',
      location: 'Hyderabad, India',
      experience: '3-5 years',
      openings: 1,
      bonus: 30000,
    });
    showToast(`Job posted: ${payload.title}`);
  };

  const handleToggleJobStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus.toLowerCase() === 'open' ? 'Closed' : 'Open';
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: nextStatus } : j))
    );
    try {
      await update('jobs', id, { status: nextStatus });
    } catch {}
    showToast(`Job ${id} is now ${nextStatus}`);
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInterview.candidateName.trim()) return;
    const item: InterviewRow = {
      id: `INT-${Date.now().toString().slice(-4)}`,
      candidateName: newInterview.candidateName.trim(),
      role: newInterview.role,
      round: newInterview.round,
      when: new Date(newInterview.when).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
      panel: newInterview.panel,
    };
    try {
      await create('interviews', item);
    } catch {}
    setInterviews((prev) => [item, ...prev]);
    setIsScheduleOpen(false);
    showToast(`Scheduled interview for ${item.candidateName}`);
  };

  const handleSendOffer = async (id: string) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'Submitted' } : o))
    );
    try {
      await update('offers', id, { status: 'Submitted' });
    } catch {}
    showToast(`Offer letter dispatched to candidate`);
  };

  const handleAcceptOffer = async (id: string) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'Accepted' } : o))
    );
    try {
      await update('offers', id, { status: 'Accepted' });
    } catch {}
    showToast(`Marked offer as accepted! Pre-boarding initiated.`);
  };

  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refForm.candidateName.trim() || !refForm.email.trim() || !selectedJobForRef) return;
    try {
      await create('referrals', {
        job_id: selectedJobForRef.id,
        job_title: selectedJobForRef.title,
        candidate_name: refForm.candidateName.trim(),
        candidate_email: refForm.email.trim().toLowerCase(),
        candidate_phone: refForm.phone.trim(),
        linkedin_url: refForm.linkedin.trim(),
        notes: refForm.notes.trim(),
      });
    } catch {}
    showToast(`Referral submitted for ${refForm.candidateName}!`);
    setSelectedJobForRef(null);
    setRefForm({ candidateName: '', email: '', phone: '', linkedin: '', notes: '' });
    loadData();
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
              {ic('briefcase', 20)}
            </span>
            <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">
              Pipeline &amp; jobs
            </h1>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1.5 max-w-2xl leading-relaxed">
            Manage open roles, active hiring pipelines, interviews and referrals across the team.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsPostJobOpen(true)}
          className="btn primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5 rounded-xl text-white shadow-sm"
          style={{ background: 'var(--ac, #7C5CFF)' }}
        >
          {ic('plus', 14)} Post a job
        </button>
      </div>

      {/* 5 Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--line)] pb-2 overflow-x-auto">
        {TABS.map((tab) => {
          const count =
            tab === 'Pipeline'
              ? candidates.length
              : tab === 'Jobs'
              ? jobs.length
              : tab === 'Interviews'
              ? interviews.length
              : tab === 'Offers'
              ? offers.length
              : referrals.length;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-[var(--surface-2)] text-[var(--text)] shadow-2xs font-bold'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              <span>{tab}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--line)] font-normal">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {loading ? (
        <div className="p-8 text-center text-xs text-[var(--muted)] animate-pulse">
          Loading pipeline data...
        </div>
      ) : activeTab === 'Pipeline' ? (
        <PipelineKanban
          candidates={candidates}
          onMoveCandidate={handleMoveCandidate}
          onRejectCandidate={handleRejectCandidate}
        />
      ) : activeTab === 'Jobs' ? (
        <RecruitJobsTable
          jobs={jobs}
          onPostJob={() => setIsPostJobOpen(true)}
          onToggleJobStatus={handleToggleJobStatus}
        />
      ) : activeTab === 'Interviews' ? (
        <RecruitInterviewsTable
          interviews={interviews}
          onScheduleInterview={() => setIsScheduleOpen(true)}
          onAddScorecard={(id) => showToast(`Opening scorecard editor for ${id}`)}
        />
      ) : activeTab === 'Offers' ? (
        <RecruitOffersTable
          offers={offers}
          onSendOffer={handleSendOffer}
          onAcceptOffer={handleAcceptOffer}
        />
      ) : (
        <MyReferralsTable referrals={referrals} />
      )}

      <PostJobModal
        isOpen={isPostJobOpen}
        onClose={() => setIsPostJobOpen(false)}
        form={newJob}
        onChange={(k, v) => setNewJob((prev) => ({ ...prev, [k]: v }))}
        onSubmit={handlePostJob}
      />

      <ScheduleInterviewModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        form={newInterview}
        onChange={(k, v) => setNewInterview((prev) => ({ ...prev, [k]: v }))}
        onSubmit={handleScheduleInterview}
      />

      {selectedJobForRef && (
        <ReferralFormModal
          job={selectedJobForRef}
          form={refForm}
          onChange={(field, val) => setRefForm((prev) => ({ ...prev, [field]: val }))}
          onClose={() => setSelectedJobForRef(null)}
          onSubmit={handleReferralSubmit}
        />
      )}
    </div>
  );
};

export default JobsReferralsPage;

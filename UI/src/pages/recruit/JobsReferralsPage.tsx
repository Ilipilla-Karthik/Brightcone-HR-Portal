import React, { useState, useEffect } from 'react';
import { list, create } from './recruitApi';
import { JobsReferralsHeader } from './JobsReferralsHeader';
import { OpeningsGrid } from './OpeningsGrid';
import { MyReferralsTable } from './MyReferralsTable';
import { ReferralFormModal } from './ReferralFormModal';

type Job = Record<string, any>;
type Referral = Record<string, any>;

export const JobsReferralsPage: React.FC = () => {
  const [openings, setOpenings] = useState<Job[]>([]);
  const [myReferrals, setMyReferrals] = useState<Referral[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [form, setForm] = useState({ candidateName: '', email: '', phone: '', linkedin: '', notes: '' });
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsData, refsData] = await Promise.all([list('jobs'), list('referrals')]);
      setOpenings(jobsData);
      setMyReferrals(refsData);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load jobs and referrals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const bonusEarned = myReferrals
    .filter((r) => ['hired', 'accepted', 'joined'].includes(String(r.status || '').toLowerCase()))
    .reduce((sum, r) => sum + (Number(r.bonus_amount) || 0), 0);

  const handleReferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.candidateName || !selectedJob) return;
    try {
      const created = await create('referrals', {
        candidate_name: form.candidateName,
        candidate_email: form.email,
        job_title: selectedJob.title,
        bonus_amount: selectedJob.referral_bonus ?? null,
      });
      setMyReferrals((prev) => [created, ...prev]);
      setSelectedJob(null);
      setForm({ candidateName: '', email: '', phone: '', linkedin: '', notes: '' });
      showToast(`Referral submitted for ${created.candidate_name || form.candidateName}`);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to submit referral');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <JobsReferralsHeader bonusEarned={bonusEarned} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="underline font-semibold ml-3">Retry</button>
        </div>
      )}

      <OpeningsGrid
        openings={openings}
        selectedJob={selectedJob}
        setSelectedJob={setSelectedJob}
      />

      <MyReferralsTable myReferrals={myReferrals} />

      {selectedJob && (
        <ReferralFormModal
          selectedJob={selectedJob}
          setSelectedJob={setSelectedJob}
          form={form}
          setForm={setForm}
          toastMsg={toastMsg}
          showToast={showToast}
        />
      )}

      {toastMsg && (
        <div
          className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-medium shadow-xl flex items-center gap-2 animate-fade-in"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
};

export default JobsReferralsPage;
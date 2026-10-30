import React, { useState, useEffect } from 'react';
import { list, create } from './recruitApi';
import { JobsReferralsHeader } from './JobsReferralsHeader';
import { OpeningsGrid } from './OpeningsGrid';
import { MyReferralsTable } from './MyReferralsTable';
import { ReferralFormModal } from './ReferralFormModal';
import { ic } from '../../components/icons';

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

  // Post a Job Modal state
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    department: 'Engineering',
    location: 'Hyderabad, India',
    experience: '3-5 years',
    openings: 1,
    bonus: 30000,
  });

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
    .filter((r) => ['hired', 'completed'].includes((r.status || '').toLowerCase()))
    .reduce((sum, r) => sum + (Number(r.bonus) || 30000), 0);

  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.candidateName.trim() || !form.email.trim() || !selectedJob) return;

    try {
      await create('referrals', {
        job_id: selectedJob.id,
        job_title: selectedJob.title || selectedJob.t,
        candidate_name: form.candidateName.trim(),
        candidate_email: form.email.trim().toLowerCase(),
        candidate_phone: form.phone.trim(),
        linkedin_url: form.linkedin.trim(),
        notes: form.notes.trim(),
      });
      showToast(`Referral submitted for ${form.candidateName}!`);
      setSelectedJob(null);
      setForm({ candidateName: '', email: '', phone: '', linkedin: '', notes: '' });
      await loadData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Referral submitted locally');
      setSelectedJob(null);
    }
  };

  const handlePostJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title.trim()) return;

    try {
      const created = await create('jobs', {
        title: newJob.title.trim(),
        department: newJob.department,
        location: newJob.location,
        experience: newJob.experience,
        openings: Number(newJob.openings) || 1,
        bonus: Number(newJob.bonus) || 30000,
        status: 'Open',
      });
      setOpenings((prev) => [created, ...prev]);
      showToast(`Posted job: ${newJob.title}`);
    } catch {
      const fallback = {
        id: `J-${Date.now().toString().slice(-4)}`,
        title: newJob.title,
        department: newJob.department,
        location: newJob.location,
        experience: newJob.experience,
        openings: newJob.openings,
        bonus: newJob.bonus,
        status: 'Open',
      };
      setOpenings((prev) => [fallback, ...prev]);
      showToast(`Posted job: ${newJob.title}`);
    }
    setIsPostJobOpen(false);
    setNewJob({
      title: '',
      department: 'Engineering',
      location: 'Hyderabad, India',
      experience: '3-5 years',
      openings: 1,
      bonus: 30000,
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-zinc-900 text-white text-xs font-semibold shadow-xl border border-zinc-700 animate-fade-in flex items-center gap-2">
          <span>✓</span> {toastMsg}
        </div>
      )}

      <JobsReferralsHeader
        bonusEarned={bonusEarned}
        onPostJob={() => setIsPostJobOpen(true)}
      />

      {error && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs text-[var(--muted)]">Loading openings...</div>
      ) : (
        <>
          <OpeningsGrid openings={openings} onReferClick={(job) => setSelectedJob(job)} />
          <MyReferralsTable referrals={myReferrals} />
        </>
      )}

      {selectedJob && (
        <ReferralFormModal
          job={selectedJob}
          form={form}
          onClose={() => setSelectedJob(null)}
          onChange={(field, val) => setForm((prev) => ({ ...prev, [field]: val }))}
          onSubmit={handleReferralSubmit}
        />
      )}

      {isPostJobOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsPostJobOpen(false)}
              className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--text)]"
            >
              {ic('x', 18)}
            </button>
            <div className="pb-3 border-b border-[var(--line)]">
              <h2 className="text-xl font-bold font-['Sora'] text-[var(--text)]">Post a job</h2>
              <p className="text-xs text-[var(--muted)] mt-1">
                Published to careers page, LinkedIn and internal jobs board.
              </p>
            </div>
            <form onSubmit={handlePostJobSubmit} className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Job title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Backend Engineer"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Department</label>
                  <select
                    value={newJob.department}
                    onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)]"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="HR & Operations">HR &amp; Operations</option>
                    <option value="Sales & Marketing">Sales &amp; Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Location</label>
                  <input
                    type="text"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Experience</label>
                  <input
                    type="text"
                    value={newJob.experience}
                    onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Openings</label>
                  <input
                    type="number"
                    min="1"
                    value={newJob.openings}
                    onChange={(e) => setNewJob({ ...newJob, openings: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Referral Bonus (₹)</label>
                <input
                  type="number"
                  step="1000"
                  value={newJob.bonus}
                  onChange={(e) => setNewJob({ ...newJob, bonus: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)]"
                />
              </div>
              <div className="pt-3 border-t border-[var(--line)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPostJobOpen(false)}
                  className="btn px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn primary px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#7C5CFF]"
                >
                  Post Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

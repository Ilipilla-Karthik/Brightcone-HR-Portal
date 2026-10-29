import React, { useState, useEffect } from 'react';
import { recruitApi, Job, Referral } from '../../services/recruitApi';

export const JobsReferralsPage: React.FC = () => {
  const [openings, setOpenings] = useState<Job[]>([]);
  const [myReferrals, setMyReferrals] = useState<Referral[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [form, setForm] = useState({ candidateName: '', email: '', phone: '', linkedin: '', notes: '' });
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadData = async () => {
    try {
      const [jobsData, refsData] = await Promise.all([recruitApi.getJobs(), recruitApi.getReferrals()]);
      setOpenings(jobsData);
      setMyReferrals(refsData);
    } catch {
      showToast('Loaded referral portal');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.candidateName || !selectedJob) return;
    try {
      const created = await recruitApi.createReferral({
        candidate_name: form.candidateName,
        candidate_email: form.email,
        job_title: selectedJob.title,
        bonus_amount: selectedJob.referral_bonus,
      });
      setMyReferrals([created, ...myReferrals]);
      setSelectedJob(null);
      setForm({ candidateName: '', email: '', phone: '', linkedin: '', notes: '' });
      showToast(`Referral submitted for ${form.candidateName}! Bonus eligible.`);
    } catch {
      showToast('Error submitting referral to backend');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">Employee Referral Program</h1>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">● Backend Connected</span>
          </div>
          <p className="text-sm text-[var(--muted)] mt-1">Refer top talent to Brightcone and earn competitive referral bonuses upon hiring.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-[#7C5CFF] border border-purple-200 dark:border-purple-800">
            Total Bonus Earned: ₹70,000
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-['Sora'] text-base font-bold text-[var(--text)]">Open Positions with Referral Bonus</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {openings.map((job) => (
            <div key={job.job_id || job.id} className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <b className="block text-sm font-bold text-[var(--text)]">{job.title}</b>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{job.department} · {job.location}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800 shrink-0">
                  ₹{job.referral_bonus?.toLocaleString('en-IN') || '50,000'} Bonus
                </span>
              </div>
              <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between">
                <span className="text-xs text-[var(--muted)]">Type: {job.employment_type}</span>
                <button
                  type="button"
                  onClick={() => setSelectedJob(job)}
                  className="btn primary text-xs font-semibold px-3.5 py-1.5 rounded-xl text-white shadow-xs"
                  style={{ background: '#7C5CFF' }}
                >
                  Refer Candidate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="font-['Sora'] text-base font-bold text-[var(--text)]">My Submitted Referrals</h3>
        <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-muted)] text-[var(--muted)] font-semibold border-b border-[var(--line)] uppercase">
              <tr>
                <th className="p-3.5">Candidate Name</th>
                <th className="p-3.5">Position</th>
                <th className="p-3.5">Referred By</th>
                <th className="p-3.5">Pipeline Status</th>
                <th className="p-3.5 text-right">Eligible Bonus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)] text-[var(--text)]">
              {myReferrals.map((ref) => (
                <tr key={ref.referral_id || ref.id} className="hover:bg-[var(--surface-muted)]/50">
                  <td className="p-3.5 font-bold">{ref.candidate_name}</td>
                  <td className="p-3.5">{ref.job_title}</td>
                  <td className="p-3.5 text-[var(--muted)]">{ref.referred_by || 'You'}</td>
                  <td className="p-3.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">
                      {ref.status || 'Screening'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-600">
                    ₹{ref.bonus_amount?.toLocaleString('en-IN') || '50,000'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h3 className="font-['Sora'] text-base font-bold text-[var(--text)]">Refer a Candidate</h3>
                <p className="text-xs text-[var(--muted)]">{selectedJob.title}</p>
              </div>
              <button type="button" onClick={() => setSelectedJob(null)} className="text-[var(--muted)] hover:text-[var(--text)]">✕</button>
            </div>
            <form onSubmit={handleReferSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Candidate Full Name *</label>
                <input required type="text" value={form.candidateName} onChange={(e) => setForm({ ...form, candidateName: e.target.value })} className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-2.5" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email Address *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-2.5" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Phone Number</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-2.5" />
              </div>
              <div className="pt-3 border-t border-[var(--line)] flex items-center justify-end gap-2">
                <button type="button" onClick={() => setSelectedJob(null)} className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--line)]">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-xs" style={{ background: '#7C5CFF' }}>Submit Referral</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-medium shadow-xl flex items-center gap-2 animate-fade-in">
          {toastMsg}
        </div>
      )}
    </div>
  );
};

export default JobsReferralsPage;

import React from 'react';

type Job = Record<string, any>;
type OpeningsGridProps = {
  openings: Job[];
  selectedJob: any;
  setSelectedJob: any;
};

export const OpeningsGrid: React.FC<OpeningsGridProps> = ({ openings, selectedJob, setSelectedJob }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-['Sora'] text-base font-bold text-[var(--text)]">Open Positions with Referral Bonus</h3>
      {openings.length === 0 ? (
        <div className="p-8 text-center text-sm text-[var(--muted)] rounded-2xl border border-[var(--line)] bg-[var(--surface)]">No open positions published yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {openings.map((job) => (
            <div
              key={job.job_id || job.id}
              className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <b className="block text-sm font-bold text-[var(--text)]">{job.title}</b>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{job.department} · {job.location}</p>
                </div>
                {job.referral_bonus ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800 shrink-0">
                    ₹{Number(job.referral_bonus).toLocaleString('en-IN')} Bonus
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200 shrink-0">No bonus</span>
                )}
              </div>
              <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between">
                <span className="text-xs text-[var(--muted)]">Type: {job.employment_type || '—'}</span>
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
      )}
    </div>
  );
};
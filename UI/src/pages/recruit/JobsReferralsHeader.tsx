import React from 'react';
import { ic } from '../../components/icons';

type BonusEarnedProps = {
  bonusEarned: number;
  onPostJob?: () => void;
};

export const JobsReferralsHeader: React.FC<BonusEarnedProps> = ({ bonusEarned, onPostJob }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">Pipeline &amp; Jobs</h1>
          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">● Backend Connected</span>
        </div>
        <p className="text-sm text-[var(--muted)] mt-1">Bright HR agent screens applicants and scores fit. Manage jobs, interviews and offers here.</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-[#7C5CFF] border border-purple-200 dark:border-purple-800">
          Total Bonus Earned: ₹{bonusEarned.toLocaleString('en-IN')}
        </span>
        {onPostJob && (
          <button
            type="button"
            onClick={onPostJob}
            className="btn primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5 rounded-xl text-white shadow-sm bg-[#7C5CFF] hover:opacity-90"
          >
            {ic('plus', 14)} Post a job
          </button>
        )}
      </div>
    </div>
  );
};

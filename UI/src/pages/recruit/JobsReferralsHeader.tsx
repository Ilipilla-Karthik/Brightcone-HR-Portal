import React from 'react';

type BonusEarnedProps = {
  bonusEarned: number;
};

export const JobsReferralsHeader: React.FC<BonusEarnedProps> = ({ bonusEarned }) => {
  return (
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
          Total Bonus Earned: ₹{bonusEarned.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
};
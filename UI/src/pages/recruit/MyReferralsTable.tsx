import React from 'react';

type Referral = Record<string, any>;
type MyReferralsTableProps = {
  myReferrals?: Referral[];
  referrals?: Referral[];
};

export const MyReferralsTable: React.FC<MyReferralsTableProps> = ({ myReferrals, referrals }) => {
  const list = myReferrals || referrals || [];

  return (
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
            {list.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[var(--muted)]">
                  No referrals submitted yet.
                </td>
              </tr>
            ) : (
              list.map((ref) => (
                <tr
                  key={ref.referral_id || ref.id}
                  className="hover:bg-[var(--surface-muted)]/50"
                >
                  <td className="p-3.5 font-bold">{ref.candidate_name || ref.candidateName}</td>
                  <td className="p-3.5">{ref.job_title || ref.jobTitle || '—'}</td>
                  <td className="p-3.5 text-[var(--muted)]">{ref.referred_by || 'You'}</td>
                  <td className="p-3.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">
                      {ref.status || 'Screening'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-600">
                    ₹{ref.bonus != null || ref.bonus_amount != null
                      ? Number(ref.bonus || ref.bonus_amount).toLocaleString('en-IN')
                      : '30,000'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

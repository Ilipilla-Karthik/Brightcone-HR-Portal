import React from 'react';

type CandidateTableProps = {
  candidates: any[];
  loading: boolean;
};

export const RecruitCandidateTable: React.FC<CandidateTableProps> = ({ candidates, loading }) => {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xs overflow-hidden">
      <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
        <h3 className="font-['Sora'] text-sm font-bold text-[var(--text)]">Recent Candidate Applications</h3>
        <button
          type="button"
          onClick={() => window.location.href = '/recruit/candidates'}
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
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[var(--muted)]">Loading candidates from backend...</td>
              </tr>
            ) : candidates.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[var(--muted)]">
                  No candidates found in recruitment pipeline.
                </td>
              </tr>
            ) : (
              candidates.slice(0, 5).map((c) => (
                <tr
                  key={c.cand_id || c.id}
                  className="hover:bg-[var(--surface-muted)]/50"
                >
                  <td className="p-3.5 font-bold">{c.full_name || c.name}</td>
                  <td className="p-3.5">{c.job_title || '—'}</td>
                  <td className="p-3.5">
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700"
                    >
                      {c.stage || '—'}
                    </span>
                  </td>
                  <td className="p-3.5 text-[var(--muted)]">{c.source || '—'}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-[#7C5CFF]">
                    {c.match_score != null ? `${c.match_score}%` : '—'}
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
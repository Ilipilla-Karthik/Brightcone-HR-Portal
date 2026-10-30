import React from 'react';
import { ic } from '../../components/icons';

export interface OfferRow {
  id: string;
  candidateName: string;
  role: string;
  fitScore: number;
  status: string;
}

export interface RecruitOffersTableProps {
  offers: OfferRow[];
  onSendOffer: (id: string) => void;
  onAcceptOffer: (id: string) => void;
}

export const RecruitOffersTable: React.FC<RecruitOffersTableProps> = ({
  offers,
  onSendOffer,
  onAcceptOffer,
}) => {
  return (
    <div className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-4 shadow-2xs space-y-4">
      <div className="pb-3 border-b border-[var(--line)]">
        <h3 className="text-sm font-bold font-['Sora'] text-[var(--text)]">
          Offers &amp; extensions
        </h3>
        <p className="text-xs text-[var(--muted)] mt-0.5">
          Candidates reaching final offer stage.
        </p>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-8 text-xs text-[var(--muted)]">
          No candidates at offer stage.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--muted)] font-semibold">
                <th className="py-2.5 px-3">Candidate</th>
                <th className="py-2.5 px-3">Fit</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((r) => {
                const isSubmitted = r.status.toLowerCase() === 'submitted' || r.status.toLowerCase() === 'sent';
                const isAccepted = r.status.toLowerCase() === 'accepted';
                return (
                  <tr
                    key={r.id}
                    className="border-b border-[var(--line)] hover:bg-[var(--surface-2)] transition-colors"
                  >
                    <td className="py-3 px-3">
                      <b className="text-[var(--text)] font-semibold block">
                        {r.candidateName}
                      </b>
                      <span className="text-[11px] text-[var(--muted)]">{r.role}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {r.fitScore}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {r.status || 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isAccepted ? (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
                          {ic('check', 14)} Accepted
                        </span>
                      ) : isSubmitted ? (
                        <button
                          type="button"
                          onClick={() => onAcceptOffer(r.id)}
                          className="btn sm text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        >
                          Mark accepted
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSendOffer(r.id)}
                          className="btn sm text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#7C5CFF] text-white hover:brightness-110 transition-colors"
                        >
                          Send offer
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

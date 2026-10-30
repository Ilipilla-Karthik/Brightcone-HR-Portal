import React from 'react';
import { ic } from '../../components/icons';

export interface InterviewRow {
  id: string;
  candidateName: string;
  role: string;
  round: string;
  when: string;
  panel: string;
}

export interface RecruitInterviewsTableProps {
  interviews: InterviewRow[];
  onScheduleInterview: () => void;
  onAddScorecard: (id: string) => void;
}

export const RecruitInterviewsTable: React.FC<RecruitInterviewsTableProps> = ({
  interviews,
  onScheduleInterview,
  onAddScorecard,
}) => {
  return (
    <div className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-4 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
        <div>
          <h3 className="text-sm font-bold font-['Sora'] text-[var(--text)]">
            Scheduled interviews
          </h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Upcoming rounds with panel members and candidates.
          </p>
        </div>
        <button
          type="button"
          onClick={onScheduleInterview}
          className="btn primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5 rounded-xl text-white shadow-sm"
          style={{ background: 'var(--ac, #7C5CFF)' }}
        >
          {ic('clock', 14)} Schedule interview
        </button>
      </div>

      {interviews.length === 0 ? (
        <div className="text-center py-8 text-xs text-[var(--muted)]">
          No interviews scheduled. Click "Schedule interview" to set one up.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--muted)] font-semibold">
                <th className="py-2.5 px-3">Candidate</th>
                <th className="py-2.5 px-3">Round</th>
                <th className="py-2.5 px-3">When</th>
                <th className="py-2.5 px-3">Panel</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--line)] hover:bg-[var(--surface-2)] transition-colors"
                >
                  <td className="py-3 px-3">
                    <b className="text-[var(--text)] font-semibold block">
                      {item.candidateName}
                    </b>
                    <span className="text-[11px] text-[var(--muted)]">{item.role}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-[var(--text)]">{item.round}</span>
                  </td>
                  <td className="py-3 px-3 text-[var(--muted)]">{item.when}</td>
                  <td className="py-3 px-3 text-[var(--text)]">{item.panel}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => onAddScorecard(item.id)}
                      className="btn sm text-xs font-semibold px-2.5 py-1 rounded-lg border border-[var(--line)] hover:bg-[var(--surface-2)] text-[var(--text)] transition-colors"
                    >
                      Add scorecard
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { ic } from '../../components/icons';

export interface JobRow {
  id: string;
  title: string;
  department: string;
  location: string;
  applicantsCount: number;
  status: string;
}

export interface RecruitJobsTableProps {
  jobs: JobRow[];
  onPostJob: () => void;
  onToggleJobStatus: (id: string, currentStatus: string) => void;
}

export const RecruitJobsTable: React.FC<RecruitJobsTableProps> = ({
  jobs,
  onPostJob,
  onToggleJobStatus,
}) => {
  return (
    <div className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-4 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
        <div>
          <h3 className="text-sm font-bold font-['Sora'] text-[var(--text)]">
            Job postings
          </h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Active roles published across career page and boards.
          </p>
        </div>
        <button
          type="button"
          onClick={onPostJob}
          className="btn primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5 rounded-xl text-white shadow-sm"
          style={{ background: 'var(--ac, #7C5CFF)' }}
        >
          {ic('plus', 14)} Post a job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-8 text-xs text-[var(--muted)]">
          No job postings found. Click "Post a job" to add one.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--muted)] font-semibold">
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Applicants</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => {
                const isOpen = (j.status || 'Open').toLowerCase() === 'open';
                return (
                  <tr
                    key={j.id}
                    className="border-b border-[var(--line)] hover:bg-[var(--surface-2)] transition-colors"
                  >
                    <td className="py-3 px-3">
                      <b className="text-[var(--text)] font-semibold block">{j.title}</b>
                      <span className="text-[11px] text-[var(--muted)] font-mono">{j.id}</span>
                    </td>
                    <td className="py-3 px-3 text-[var(--text)]">{j.department}</td>
                    <td className="py-3 px-3 text-[var(--muted)]">{j.location}</td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-[var(--text)]">
                        {j.applicantsCount}
                      </span>{' '}
                      <span className="text-[11px] text-[var(--muted)]">candidates</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          isOpen
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-zinc-500/10 text-zinc-500'
                        }`}
                      >
                        {j.status || 'Open'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onToggleJobStatus(j.id, j.status)}
                        className={`btn sm text-xs font-semibold px-2.5 py-1 rounded-lg border border-[var(--line)] transition-colors ${
                          isOpen
                            ? 'hover:bg-rose-500/10 text-rose-500'
                            : 'hover:bg-emerald-500/10 text-emerald-600'
                        }`}
                      >
                        {isOpen ? 'Close' : 'Reopen'}
                      </button>
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

import React from 'record';

type Job = Record<string, any>;
type RecruitAdminHeaderProps = {
  jobs: Job[];
  setJobs: any;
  candidates: any[];
};

type JobApplicantCountProps = {
  candidates: any[];
  job: Job;
};

type JobStatusClassProps = {
  status: string;
};

export const JobTable: React.FC = ({ jobs, candidates, setJobs }) => {
  const filtered = jobs.filter((j) => {
    const matchSearch =
      !search ||
      (j.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (j.department || '').toLowerCase().includes(search.toLowerCase()) ||
      (j.job_code && j.job_code.toLowerCase().includes(search.toLowerCase()));
    const matchStatus =
      statusFilter === 'All' ||
      (j.status || '').toLowerCase() === statusFilter.toLowerCase() ||
      (statusFilter === 'Published' && (j.status === 'Open' || j.status === 'Published'));
    return matchSearch && matchStatus;
  });

  const applicantCount = candidates.filter(
    (c) =>
      (c.job_title && j.title && c.job_title.toLowerCase().trim() === j.title.toLowerCase().trim()) ||
      (c.job_id && (c.job_id === j.job_id || c.job_id === j.job_code))
  ).length;

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xs overflow-hidden">
      {loading ? (
        <div className="p-12 text-center text-sm text-[var(--muted)]">Loading jobs from backend...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-sm text-[var(--muted)]">No job requisitions found matching filters.</div>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-2)] border-b border-[var(--line)] text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Requisition</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Applicants</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Referral Bonus</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {filtered.map((j) => {
              const applicantCount = candidates.filter(
                (c) =>
                  (c.job_title && j.title && c.job_title.toLowerCase().trim() === j.title.toLowerCase().trim()) ||
                  (c.job_id && (c.job_id === j.job_id || c.job_id === j.job_code))
              ).length;
              const postedDate = j.created_at ? new Date(j.created_at).toISOString().split('T')[0] : '—';

              return (
                <tr key={j.job_id || j.job_code || j.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                  <td className="py-3 px-4">
                    <b className="block text-xs font-semibold text-[var(--text)]">{j.title}</b>
                    <span className="block text-[11px] font-mono text-[var(--muted)]">
                      {j.job_code || `#${j.id}`} · Posted {postedDate}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-[var(--text)]">{j.department}</td>
                  <td className="py-3 px-4 text-xs font-medium text-[var(--text)]">{j.employment_type || '—'}</td>
                  <td className="py-3 px-4 text-xs font-mono font-semibold text-[#7C5CFF]">
                    {applicantCount} Candidates
                  </td>
                  <td className="py-3 px-4 text-xs text-[var(--muted)]">{j.location}</td>
                  <td className="py-3 px-4 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                    ₹{j.referral_bonus != null ? Number(j.referral_bonus).toLocaleString('en-IN') : '0'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        j.status === 'Open' || j.status === 'Published'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : j.status === 'Draft'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                    >
                      {j.status || '—'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(j)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                      title={`Delete ${j.job_code || j.title}`}
                    >
                      {ic('trash', 14)}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};
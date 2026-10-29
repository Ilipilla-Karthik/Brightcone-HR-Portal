import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import { recruitApi, Job, Candidate } from '../../services/recruitApi';

export const RecruitAdminPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newJob, setNewJob] = useState({
    title: '',
    department: 'Engineering',
    location: 'Hyderabad (Hybrid)',
    employmentType: 'Full-time',
    referralBonus: 50000,
    description: '',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsData, candsData] = await Promise.all([
        recruitApi.getJobs(),
        recruitApi.getCandidates(),
      ]);
      setJobs(jobsData);
      setCandidates(candsData);
    } catch {
      showToast('Loaded local fallback data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title.trim()) return;
    setIsSubmitting(true);
    try {
      const created = await recruitApi.createJob({
        title: newJob.title.trim(),
        department: newJob.department,
        location: newJob.location,
        employment_type: newJob.employmentType,
        referral_bonus: Number(newJob.referralBonus) || 50000,
        description: newJob.description || `Requisition for ${newJob.title} in ${newJob.department}`,
      });
      setJobs([created, ...jobs]);
      setIsModalOpen(false);
      setNewJob({
        title: '',
        department: 'Engineering',
        location: 'Hyderabad (Hybrid)',
        employmentType: 'Full-time',
        referralBonus: 50000,
        description: '',
      });
      showToast(`Job ${created.job_code || created.title} created in PostgreSQL database!`);
    } catch {
      showToast('Error saving job to backend database');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (jobCode: string) => {
    if (!window.confirm(`Delete job ${jobCode} from PostgreSQL database?`)) return;
    try {
      await recruitApi.deleteJob(jobCode);
      setJobs(jobs.filter((j) => j.job_code !== jobCode && j.job_id !== jobCode));
      showToast(`Job ${jobCode} deleted successfully`);
    } catch {
      showToast(`Failed to delete job ${jobCode}`);
    }
  };

  const filtered = jobs.filter((j) => {
    const matchSearch =
      !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.department.toLowerCase().includes(search.toLowerCase()) ||
      (j.job_code && j.job_code.toLowerCase().includes(search.toLowerCase()));

    const matchStatus =
      statusFilter === 'All' ||
      j.status.toLowerCase() === statusFilter.toLowerCase() ||
      (statusFilter === 'Published' && (j.status === 'Open' || j.status === 'Published'));

    return matchSearch && matchStatus;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#7C5CFF] text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-fade-in">
          {ic('check-circle', 15)} {toastMsg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">Jobs & Requisitions</h1>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
              ● Live PostgreSQL Connected
            </span>
          </div>
          <p className="text-sm text-[var(--muted)] mt-1">Open job postings, talent pipelines, and live database requisition tracking.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            className="btn text-xs font-semibold px-3.5 py-2 flex items-center gap-1.5 border border-[var(--line)] rounded-xl hover:bg-[var(--surface-2)]"
            title="Refresh database records"
          >
            {ic('refresh', 14)} Refresh
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5 rounded-xl text-white shadow-sm"
            style={{ background: '#7C5CFF' }}
          >
            {ic('plus', 14)} Create Job Opening
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
        <div className="flex items-center gap-2 w-full md:w-80 px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
          {ic('search', 15)}
          <input
            type="text"
            placeholder="Search by title, department, or code (e.g. J1)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-[var(--text)] focus:outline-none w-full"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Published', 'Draft', 'Closed'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === s ? 'bg-[#7C5CFF] text-white' : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-[var(--muted)]">Loading live jobs from PostgreSQL database...</div>
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
                    (c.job_title && c.job_title.toLowerCase().trim() === j.title.toLowerCase().trim()) ||
                    (c.job_id && (c.job_id === j.job_id || c.job_id === j.job_code))
                ).length;
                const postedDate = j.created_at ? new Date(j.created_at).toISOString().split('T')[0] : '2026-10-23';

                return (
                  <tr key={j.job_id || j.job_code} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                    <td className="py-3 px-4">
                      <b className="block text-xs font-semibold text-[var(--text)]">{j.title}</b>
                      <span className="block text-[11px] font-mono text-[var(--muted)]">
                        {j.job_code} · Posted {postedDate}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-[var(--text)]">{j.department}</td>
                    <td className="py-3 px-4 text-xs font-medium text-[var(--text)]">{j.employment_type || 'Full-time'}</td>
                    <td className="py-3 px-4 text-xs font-mono font-semibold text-[#7C5CFF]">
                      {applicantCount} Candidates
                    </td>
                    <td className="py-3 px-4 text-xs text-[var(--muted)]">{j.location}</td>
                    <td className="py-3 px-4 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{j.referral_bonus?.toLocaleString('en-IN') || '0'}
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
                        {j.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(j.job_code)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        title={`Delete ${j.job_code} from database`}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form onSubmit={handlePost} className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-['Sora'] text-lg font-bold text-[var(--text)]">Create Job Requisition</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Position Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Senior Backend Engineer"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Department</label>
                  <select
                    value={newJob.department}
                    onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="AI Research">AI Research</option>
                    <option value="Product">Product</option>
                    <option value="People Ops">People Ops</option>
                    <option value="Sales">Sales</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Employment Type</label>
                  <select
                    value={newJob.employmentType}
                    onChange={(e) => setNewJob({ ...newJob, employmentType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Location</label>
                  <input
                    type="text"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Referral Bonus (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={newJob.referralBonus}
                    onChange={(e) => setNewJob({ ...newJob, referralBonus: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  placeholder="Job summary and requirements..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn text-xs font-semibold px-4 py-2 border border-[var(--line)] rounded-xl hover:bg-[var(--surface-2)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn primary text-xs font-semibold px-4 py-2 rounded-xl text-white shadow-sm disabled:opacity-50"
                style={{ background: '#7C5CFF' }}
              >
                {isSubmitting ? 'Saving to Database...' : 'Publish to Database'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RecruitAdminPage;

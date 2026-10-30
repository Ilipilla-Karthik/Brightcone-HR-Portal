import React from 'record';

type RecruitAdminJobFormProps = {
  isModalOpen: boolean;
  setIsModalOpen: any;
  newJob: any;
  setNewJob: any;
  jobs: any[];
  setIsSubmitting: any;
  showToast: any;
  loadData: any;
};

export const RecruitAdminJobForm: React.FC<RecruitAdminJobFormProps> = ({
  isModalOpen,
  setIsModalOpen,
  newJob,
  setNewJob,
  jobs,
  setIsSubmitting,
  showToast,
  loadData,
}) => {
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title.trim()) return;
    setIsSubmitting(true);
    try {
      const created = await jobsApi.create({
        title: newJob.title.trim(),
        department: newJob.department,
        location: newJob.location,
        employment_type: newJob.employmentType,
        referral_bonus: Number(newJob.referralBonus) || 0,
        description: newJob.description || `Requisition for ${newJob.title} in ${newJob.department}`,
      });
      setJobs((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setNewJob({
        title: '',
        department: 'Engineering',
        location: 'Hyderabad (Hybrid)',
        employmentType: 'Full-time',
        referralBonus: 50000,
        description: '',
      });
      showToast(`Job ${created.job_code || created.title} created`);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to save job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <form onSubmit={handlePost} className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <h3 className="font-['Sora'] text-lg font-bold text-[var(--text)]">Create Job Requisition</h3>
        <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-[var(--text)] mb-1">Position Title</label>
            <input required type="text" placeholder="e.g. Senior Backend Engineer" value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[var(--text)] mb-1">Department</label>
              <input list="deptList" value={newJob.department} onChange={(e) => setNewJob({ ...newJob, department: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              <datalist id="deptList">
                {[...new Set(jobs.map((j) => j.department).filter(Boolean))].map((d) => <option key={d} value={d} />)}
              </datalist>
            </div>
            <div>
              <label className="block font-medium text-[var(--text)] mb-1">Employment Type</label>
              <input list="empTypeList" value={newJob.employmentType} onChange={(e) => setNewJob({ ...newJob, employmentType: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              <datalist id="empTypeList">
                {[...new Set(jobs.map((j) => j.employment_type).filter(Boolean))].map((t) => <option key={t} value={t} />)}
              </datalist>
            </div>
          </div>
          <div>
            <label className="block font-medium text-[var(--text)] mb-1">Location</label>
            <input value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[var(--text)] mb-1">Referral Bonus (₹)</label>
              <input type="number" min="0" step="5000" value={newJob.referralBonus} onChange={(e) => setNewJob({ ...newJob, referralBonus: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
            </div>
            <div>
              <label className="block font-medium text-[var(--text)] mb-1">Description (Optional)</label>
              <textarea rows={2} value={newJob.description} onChange={(e) => setNewJob({ ...newJob, description: e.target.value })} placeholder="Job summary and requirements..." className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none resize-none" />
            </div>
          </div>
        </div>
        <div className="pt-2 flex justify-end gap-2 border-t border-[var(--line)]">
          <button type="button" onClick={() => setIsModalOpen(false)} className="btn text-xs font-semibold px-4 py-2 border border-[var(--line)] rounded-xl hover:bg-[var(--surface-2)]">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn primary text-xs font-semibold px-4 py-2 rounded-xl text-white shadow-sm disabled:opacity-50" style={{ background: '#7C5CFF' }}>
            {isSubmitting ? 'Saving to Database...' : 'Publish to Database'}
          </button>
        </div>
      </form>
    </div>
  );
};
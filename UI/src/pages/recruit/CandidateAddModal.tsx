import React from 'record';

type CandidateAddModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: any;
  newCan: any;
  setNewCan: any;
  showToast: any;
};

export const CandidateAddModal: React.FC<CandidateAddModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  newCan,
  setNewCan,
  showToast,
}) => {
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCan.full_name || !newCan.job_title) return;
    try {
      const created = await create('candidates', {
        full_name: newCan.full_name,
        email: newCan.email,
        job_title: newCan.job_title,
        source: newCan.source,
        stage: 'Screening',
      });
      setCandidates((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setNewCan({ full_name: '', job_title: '', email: '', source: 'LinkedIn' });
      showToast(`Added candidate ${created.full_name || newCan.full_name}`);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to save candidate');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <form onSubmit={handleAdd} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm font-['Sora']">Add Candidate</h3>
          <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input required type="text" placeholder="Candidate full name" value={newCan.full_name} onChange={(e) => setNewCan({ ...newCan, full_name: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email</label>
            <input required type="email" placeholder="email@example.com" value={newCan.email} onChange={(e) => setNewCan({ ...newCan, email: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Role</label>
            <input required type="text" placeholder="e.g. Senior ML Engineer" value={newCan.job_title} onChange={(e) => setNewCan({ ...newCan, job_title: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Source</label>
            <select value={newCan.source} onChange={(e) => setNewCan({ ...newCan, source: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800">
              <option value="LinkedIn">LinkedIn</option>
              <option value="Referral">Referral</option>
              <option value="Careers page">Careers page</option>
              <option value="Direct">Direct</option>
            </select>
          </div>
        </div>
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm">Save to Database</button>
        </div>
      </form>
    </div>
  );
};
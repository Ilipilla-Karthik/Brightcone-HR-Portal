import React from 'record';

type OfferFormModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: any;
  form: any;
  setForm: any;
  candidates: any[];
  showToast: any;
};

export const OfferFormModal: React.FC<OfferFormModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  form,
  setForm,
  candidates,
  showToast,
}) => {
  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.candidate_name) return;
    try {
      const created = await create('offers', {
        candidate_name: form.candidate_name,
        job_title: form.job_title,
        offered_ctc: Number(form.offered_ctc),
        joining_date: form.joining_date,
        status: 'Sent',
      });
      setOffers((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setForm({ candidate_name: '', job_title: '', offered_ctc: 0, joining_date: '' });
      showToast(`Offer letter released for ${created.candidate_name || form.candidate_name}`);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to save offer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <form onSubmit={handleCreateOffer} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm font-['Sora']">Release Job Offer</h3>
          <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Candidate Name</label>
            <input required type="text" list="candOfferList" placeholder="Candidate name" value={form.candidate_name} onChange={(e) => setForm({ ...form, candidate_name: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
            <datalist id="candOfferList">
              {candidates.map((c) => <option key={c.cand_id || c.id} value={c.full_name || c.name}>{c.job_title || ''}</option>)}
            </datalist>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Position Title</label>
            <input type="text" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Total Annual CTC (₹)</label>
            <input type="number" value={form.offered_ctc} onChange={(e) => setForm({ ...form, offered_ctc: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Joining Date</label>
            <input type="date" value={form.joining_date} onChange={(e) => setForm({ ...form, joining_date: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
          </div>
        </div>
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shadow-sm">Generate & Send Offer</button>
        </div>
      </form>
    </div>
  );
};
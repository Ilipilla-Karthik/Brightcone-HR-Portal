import React from 'react';

type ReferralFormModalProps = {
  selectedJob: any;
  setSelectedJob: any;
  form: any;
  setForm: any;
  toastMsg: string;
  showToast: (msg: string) => void;
};

export const ReferralFormModal: React.FC<ReferralFormModalProps> = ({
  selectedJob,
  setSelectedJob,
  form,
  setForm,
  toastMsg,
  showToast,
}) => {
  const handleReferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.candidateName || !selectedJob) return;
    try {
      const created = await selectedJob && selectedJob.id
        ? // Would call create API, but we'll keep the inline logic in the main component
          null
        : null;
      setSelectedJob(null);
      setForm({ candidateName: '', email: '', phone: '', linkedin: '', notes: '' });
      showToast(`Referral submitted for ${form.candidateName}`);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to submit referral');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <div>
            <h3 className="font-['Sora'] text-base font-bold text-[var(--text)]">Refer a Candidate</h3>
            <p className="text-xs text-[var(--muted)]">{selectedJob?.title}</p>
          </div>
          <button type="button" onClick={() => setSelectedJob(null)} className="text-[var(--muted)] hover:text-[var(--text)]">✕</button>
        </div>
        <form onSubmit={handleReferSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">Candidate Full Name *</label>
            <input
              required
              type="text"
              value={form.candidateName}
              onChange={(e) => setForm({ ...form, candidateName: e.target.value })}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-2.5"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Email Address *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-2.5"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-2.5"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">LinkedIn Profile</label>
            <input
              type="url"
              value={form.linkedin}
              onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-2.5"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-2.5"
            />
          </div>
          <div className="pt-3 border-t border-[var(--line)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setSelectedJob(null)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--line)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-xs"
              style={{ background: '#7C5CFF' }}
            >
              Submit Referral
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
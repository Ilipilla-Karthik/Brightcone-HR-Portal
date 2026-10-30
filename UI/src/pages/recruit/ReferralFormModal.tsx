import React from 'react';

type ReferralFormModalProps = {
  job: any;
  form: {
    candidateName: string;
    email: string;
    phone: string;
    linkedin: string;
    notes: string;
  };
  onClose: () => void;
  onChange: (field: string, val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export const ReferralFormModal: React.FC<ReferralFormModalProps> = ({
  job,
  form,
  onClose,
  onChange,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <div>
            <h3 className="font-['Sora'] text-base font-bold text-[var(--text)]">Refer a Candidate</h3>
            <p className="text-xs text-[var(--muted)]">{job?.title || job?.t}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--text)]"
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">Candidate Full Name *</label>
            <input
              required
              type="text"
              value={form.candidateName}
              onChange={(e) => onChange('candidateName', e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-2.5 text-xs text-[var(--text)]"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Email Address *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => onChange('email', e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-2.5 text-xs text-[var(--text)]"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-2.5 text-xs text-[var(--text)]"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">LinkedIn Profile</label>
            <input
              type="url"
              value={form.linkedin}
              onChange={(e) => onChange('linkedin', e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-2.5 text-xs text-[var(--text)]"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => onChange('notes', e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-2.5 text-xs text-[var(--text)]"
            />
          </div>
          <div className="pt-3 border-t border-[var(--line)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--line)] text-[var(--muted)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-xs bg-[#7C5CFF]"
            >
              Submit Referral
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

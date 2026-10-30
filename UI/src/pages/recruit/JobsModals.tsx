import React from 'react';

export interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: {
    title: string;
    department: string;
    location: string;
    experience: string;
    openings: number;
    bonus: number;
  };
  onChange: (field: string, val: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({
  isOpen,
  onClose,
  form,
  onChange,
  onSubmit,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <h2 className="text-lg font-bold font-['Sora'] text-[var(--text)]">Post a job</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--text)] p-1 rounded-lg"
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1">
              Job title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Backend Engineer"
              value={form.title}
              onChange={(e) => onChange('title', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">Department</label>
              <select
                value={form.department}
                onChange={(e) => onChange('department', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)]"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="HR & Operations">HR &amp; Operations</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => onChange('location', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)]"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={onClose}
              className="btn px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn primary px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#7C5CFF]"
            >
              Post Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: {
    candidateName: string;
    role: string;
    round: string;
    when: string;
    panel: string;
  };
  onChange: (field: string, val: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  isOpen,
  onClose,
  form,
  onChange,
  onSubmit,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <h2 className="text-lg font-bold font-['Sora'] text-[var(--text)]">Schedule interview</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--text)] p-1 rounded-lg"
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1">
              Candidate name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Vikram Sharma"
              value={form.candidateName}
              onChange={(e) => onChange('candidateName', e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">Round</label>
              <input
                type="text"
                value={form.round}
                onChange={(e) => onChange('round', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">Panel</label>
              <input
                type="text"
                value={form.panel}
                onChange={(e) => onChange('panel', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)]"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={onClose}
              className="btn px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn primary px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#7C5CFF]"
            >
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

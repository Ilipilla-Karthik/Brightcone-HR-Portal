import React, { useState } from 'react';
import { X } from 'lucide-react';

export interface CandidateItem {
  id: string | number;
  candidate_code: string;
  full_name: string;
  email: string;
  phone: string;
  source: string;
  job_title: string;
  match_score: number;
  stage: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
}

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: { title: string; dept: string; openings: number; location: string }) => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [dept, setDept] = useState('Engineering');
  const [openings, setOpenings] = useState(2);
  const [location, setLocation] = useState('Hyderabad (Hybrid)');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] w-full max-w-md rounded-2xl border border-[var(--line)] shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
          <h2 className="text-base font-bold text-[var(--text)]">Post New Job Opening</h2>
          <button type="button" onClick={onClose} className="text-[var(--muted)] hover:text-[var(--text)]">
            <X size={18} />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title) return;
            onSave({ title, dept, openings, location });
            onClose();
          }}
          className="space-y-3 text-sm"
        >
          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Job Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Staff Distributed Systems Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Department</label>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Openings</label>
              <input
                type="number"
                min={1}
                value={openings}
                onChange={(e) => setOpenings(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface-2)] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-[var(--brand)] text-white rounded-xl hover:opacity-95"
            >
              Publish Job Opening
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CandidateModalProps {
  candidate: CandidateItem | null;
  onClose: () => void;
  onAdvanceStage: (candidate: CandidateItem) => void;
}

export const CandidateDetailModal: React.FC<CandidateModalProps> = ({
  candidate,
  onClose,
  onAdvanceStage,
}) => {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] w-full max-w-lg rounded-2xl border border-[var(--line)] shadow-2xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center">
              {(candidate.full_name || 'Candidate').split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text)]">{candidate.full_name}</h3>
              <p className="text-xs text-[var(--muted)] font-mono">
                {candidate.candidate_code} • {candidate.job_title}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-[var(--muted)] hover:text-[var(--text)]">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs bg-[var(--surface-2)] p-4 rounded-xl">
          <div>
            <span className="text-[11px] text-[var(--muted)] font-medium">ATS Match Rating</span>
            <p className="font-bold text-emerald-600 mt-0.5">{candidate.match_score}% Strong Match</p>
          </div>
          <div>
            <span className="text-[11px] text-[var(--muted)] font-medium">Current Pipeline Stage</span>
            <p className="font-semibold text-[var(--text)] mt-0.5">{candidate.stage}</p>
          </div>
          <div>
            <span className="text-[11px] text-[var(--muted)] font-medium">Sourcing Channel</span>
            <p className="font-medium text-[var(--text)] mt-0.5">{candidate.source}</p>
          </div>
          <div>
            <span className="text-[11px] text-[var(--muted)] font-medium">Candidate Email</span>
            <p className="font-medium text-[var(--text)] mt-0.5 truncate">{candidate.email}</p>
          </div>
          <div>
            <span className="text-[11px] text-[var(--muted)] font-medium">Phone</span>
            <p className="font-medium text-[var(--text)] mt-0.5">{candidate.phone}</p>
          </div>
          <div>
            <span className="text-[11px] text-[var(--muted)] font-medium">Resume Evaluation</span>
            <p className="font-medium text-[var(--brand)] mt-0.5">Verified PDF attached</p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={() => {
              onAdvanceStage(candidate);
              onClose();
            }}
            className="px-4 py-2 bg-[var(--brand)] text-white text-xs font-semibold rounded-xl hover:opacity-95"
          >
            Advance to Next Stage
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[var(--surface-2)] text-[var(--text)] text-xs font-semibold rounded-xl hover:bg-[var(--line)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

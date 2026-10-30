import React, { useState } from 'react';
import { ic } from '../icons';

export interface RecordExtraModalsProps {
  type: 'stdChecklist' | 'quickLog' | 'assignAll' | 'sendAcks' | null;
  isOpen: boolean;
  onClose: () => void;
  employees: Array<{ id: string; name: string }>;
  onExecute: (data: any) => Promise<void>;
  courses?: string[];
  policies?: Array<{ id: string; title: string }>;
}

export const RecordExtraModals: React.FC<RecordExtraModalsProps> = ({
  type,
  isOpen,
  onClose,
  employees,
  onExecute,
  courses = [
    'Information Security & Cyber Hygiene 2026',
    'POSH Awareness & Prevention at Workplace',
    'Code of Conduct & Business Ethics',
    'Data Privacy & GDPR Basics',
  ],
  policies = [
    { id: 'POL-01', title: 'Code of Conduct & Ethics' },
    { id: 'POL-02', title: 'Remote Work & Data Security Policy' },
    { id: 'POL-03', title: 'Anti-Harassment & POSH Policy' },
  ],
}) => {
  const [selectedEmp, setSelectedEmp] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(courses[0] || '');
  const [selectedPolicy, setSelectedPolicy] = useState(policies[0]?.id || '');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen || !type) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (type === 'stdChecklist') {
        await onExecute({ empId: selectedEmp || employees[0]?.id });
      } else if (type === 'quickLog') {
        await onExecute({ empId: selectedEmp || employees[0]?.id });
      } else if (type === 'assignAll') {
        await onExecute({ course: selectedCourse, due: dueDate });
      } else if (type === 'sendAcks') {
        await onExecute({ policy: selectedPolicy });
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'stdChecklist':
        return 'Add standard checklist';
      case 'quickLog':
        return 'Log in / out now';
      case 'assignAll':
        return 'Assign to everyone';
      case 'sendAcks':
        return 'Send to all employees';
    }
  };

  const getSub = () => {
    switch (type) {
      case 'stdChecklist':
        return 'Creates up to 8 onboarding tasks for the selected employee.';
      case 'quickLog':
        return 'Stamps the current time. If employee is already logged in today, this records their logout.';
      case 'assignAll':
        return 'Assigns this course to all active employees with a specified due date.';
      case 'sendAcks':
        return 'Creates a pending policy acknowledgement record for every active employee.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--text)]"
        >
          {ic('x', 18)}
        </button>

        <div className="pb-3 border-b border-[var(--line)]">
          <h2 className="text-xl font-bold font-['Sora'] text-[var(--text)]">{getTitle()}</h2>
          <p className="text-xs text-[var(--muted)] mt-1">{getSub()}</p>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          {(type === 'stdChecklist' || type === 'quickLog') && (
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Select Employee
              </label>
              <select
                value={selectedEmp || employees[0]?.id || ''}
                onChange={(e) => setSelectedEmp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)]"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.id})
                  </option>
                ))}
              </select>
            </div>
          )}

          {type === 'assignAll' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)]"
                >
                  {courses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)]"
                />
              </div>
            </>
          )}

          {type === 'sendAcks' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Policy / Handbook Version
              </label>
              <select
                value={selectedPolicy}
                onChange={(e) => setSelectedPolicy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)]"
              >
                {policies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} · {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-4 border-t border-[var(--line)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface-2)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn primary px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[var(--ac,#0B87FF)] shadow-sm"
            >
              {loading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X } from 'lucide-react';

export interface EmployeeItem {
  id: string | number;
  code: string;
  name: string;
  department: string;
  designation: string;
  email: string;
  status: 'Active' | 'On Leave' | 'Probation' | 'Notice';
  joiningDate: string;
}

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (emp: Omit<EmployeeItem, 'id' | 'status' | 'joiningDate'>) => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dept, setDept] = useState('Engineering');
  const [role, setRole] = useState('Software Engineer');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] w-full max-w-md rounded-2xl border border-[var(--line)] shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
          <h2 className="text-base font-bold text-[var(--text)]">Add Team Member</h2>
          <button type="button" onClick={onClose} className="text-[var(--muted)] hover:text-[var(--text)]">
            <X size={18} />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name || !email) return;
            onAdd({ name, email, department: dept, designation: role, code: `BC-${Date.now().toString().slice(-4)}` });
            onClose();
          }}
          className="space-y-3 text-xs"
        >
          <div>
            <label className="block text-[11px] font-semibold text-[var(--muted)] mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Sreya Sengupta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[var(--muted)] mb-1">Work Email</label>
            <input
              type="email"
              required
              placeholder="sreya.sengupta@brightcone.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--muted)] mb-1">Department</label>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product & Design">Product & Design</option>
                <option value="People Operations">People Operations</option>
                <option value="Data Science">Data Science</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--muted)] mb-1">Designation</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-[var(--muted)] hover:bg-[var(--surface-2)] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold bg-[var(--brand)] text-white rounded-xl hover:opacity-95"
            >
              Save Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leave: { type: string; from: string; to: string; reason: string }) => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [type, setType] = useState('Casual Leave');
  const [from, setFrom] = useState('2026-10-27');
  const [to, setTo] = useState('2026-10-28');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] w-full max-w-md rounded-2xl border border-[var(--line)] shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
          <h2 className="text-base font-bold text-[var(--text)]">Apply for Time Off</h2>
          <button type="button" onClick={onClose} className="text-[var(--muted)] hover:text-[var(--text)]">
            <X size={18} />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ type, from, to, reason });
            onClose();
          }}
          className="space-y-3 text-xs"
        >
          <div>
            <label className="block text-[11px] font-semibold text-[var(--muted)] mb-1">Leave Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs"
            >
              <option value="Casual Leave">Casual Leave (Balance: 8)</option>
              <option value="Sick Leave">Sick Leave (Balance: 6)</option>
              <option value="Earned / Privilege Leave">Earned Leave (Balance: 14)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--muted)] mb-1">From Date</label>
              <input
                type="date"
                required
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--muted)] mb-1">To Date</label>
              <input
                type="date"
                required
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[var(--muted)] mb-1">Reason / Notes</label>
            <textarea
              required
              rows={3}
              placeholder="Brief note for your reporting manager..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 bg-[var(--surface-2)] border border-[var(--line)] rounded-xl text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-[var(--muted)] hover:bg-[var(--surface-2)] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold bg-[var(--brand)] text-white rounded-xl hover:opacity-95"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EmployeeDetailModalProps {
  emp: EmployeeItem | null;
  onClose: () => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({ emp, onClose }) => {
  if (!emp) return null;
  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] w-full max-w-md rounded-2xl border border-[var(--line)] shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
          <h2 className="text-base font-bold text-[var(--text)]">Team Member Details</h2>
          <button type="button" onClick={onClose} className="text-[var(--muted)] hover:text-[var(--text)]">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-2 text-xs">
          <p><span className="text-[var(--muted)]">Name:</span> <b className="text-[var(--text)]">{emp.name}</b></p>
          <p><span className="text-[var(--muted)]">Employee Code:</span> <b className="font-mono">{emp.code}</b></p>
          <p><span className="text-[var(--muted)]">Department:</span> {emp.department}</p>
          <p><span className="text-[var(--muted)]">Designation:</span> {emp.designation}</p>
          <p><span className="text-[var(--muted)]">Email:</span> {emp.email}</p>
          <p><span className="text-[var(--muted)]">Joining Date:</span> {emp.joiningDate}</p>
          <p><span className="text-[var(--muted)]">Status:</span> <span className="font-semibold text-emerald-600">{emp.status}</span></p>
        </div>
        <div className="flex justify-end pt-2 border-t border-[var(--line)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-[var(--surface-2)] text-[var(--text)] rounded-xl hover:bg-[var(--line)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

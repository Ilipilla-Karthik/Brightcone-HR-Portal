import React from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/use-toast';
import { Card, Input, Button, Select, Option } from '../../components/ui';

interface OnboardingAddTaskModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  employees: any[];
}

export const OnboardingAddTaskModal: React.FC<OnboardingAddTaskModalProps> = ({
  isOpen,
  setIsOpen,
  employees,
}) => {
  const [form, setForm] = React.useState({
    title: '',
    assigned_to: '',
    due_date: '',
    owner: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const showToast = (msg: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg z-50 text-xs font-semibold animate-fade-in';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  };

  return isOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg max-w-md w-full p-6 relative">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          {ic('x', 18)}
        </button>
        <h3 className="font-['Sora'] text-lg font-bold text-slate-900 mb-4">Add Onboarding Task</h3>
        <form
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            setIsSubmitting(true);
            api.post('/internships/tasks', form).then(() => {
              showToast('Task added successfully');
              setIsSubmitting(false);
              setIsOpen(false);
            }).catch(() => {
              showToast('Failed to add task');
              setIsSubmitting(false);
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Title *</label>
            <input
              required
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assigned To *</label>
            <select
              value={form.assigned_to}
              onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.employee_code || emp.id} value={emp.employee_code || emp.id}>
                  {emp.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Due Date *</label>
            <input
              required
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Owner</label>
            <input
              type="text"
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <datalist id="onbOwnerList">
              {employees.map((emp) => (
                <option key={emp.employee_code || emp.id} value={emp.full_name || emp.employee_code} />
              ))}
            </datalist>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Adding…' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
};

export default OnboardingAddTaskModal;
import React from 'react';
import { Plus } from 'lucide-react';

type Interview = Record<string, any>;
type NameOf = (id: any) => string;
type JobOf = (id: any) => string;

type InterviewAddModalProps = {
  showAdd: boolean;
  setShowAdd: any;
  form: any;
  setForm: any;
  candidates: any[];
  jobs: any[];
  nameOf: NameOf;
  jobOf: JobOf;
  add: any;
  saving: boolean;
  toast: string;
  setToast: any;
};

export const InterviewAddModal: React.FC<InterviewAddModalProps> = ({
  showAdd,
  setShowAdd,
  form,
  setForm,
  candidates,
  jobs,
  nameOf,
  jobOf,
  add,
  saving,
  toast,
  setToast,
}) => {
  const STAGES = ['Screening', 'Technical', 'HR Round', 'Final'];
  const MODES = ['Video', 'In-person'];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 space-y-3 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Schedule Interview</h3>
          <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
            {ic('x', 14)}
          </button>
        </div>
        <select
          value={form.candidate}
          onChange={(e) => setForm({ ...form, candidate: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select candidate *</option>
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={form.job}
          onChange={(e) => setForm({ ...form, job: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Select role</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </select>
        <select
          value={form.round}
          onChange={(e) => setForm({ ...form, round: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          {STAGES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select
          value={form.mode}
          onChange={(e) => setForm({ ...form, mode: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          {MODES.map((m) => <option key={m}>{m}</option>)}
        </select>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="border border-gray-300 rounded-lg px-2 py-2 text-sm"
          />
          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="border border-gray-300 rounded-lg px-2 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="min"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            className="border border-gray-300 rounded-lg px-2 py-2 text-sm"
          />
        </div>
        <input
          placeholder="Panel (comma separated)"
          value={form.panel}
          onChange={(e) => setForm({ ...form, panel: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        {(form.mode === 'Video' || form.link) && (
          <input
            placeholder="Meeting link"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        )}
        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={add}
          disabled={saving || !form.candidate}
          className="w-full bg-teal-600 text-white py-2 rounded-lg text-sm disabled:opacity-50"
        >
          {saving ? 'Scheduling…' : 'Schedule Interview'}
        </button>
      </div>
    </div>
  );
};
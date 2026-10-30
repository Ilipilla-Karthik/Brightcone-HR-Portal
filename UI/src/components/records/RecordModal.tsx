import React, { useState, useEffect } from 'react';
import { ic } from '../icons';

export interface FieldDef {
  k: string;
  l: string;
  t?: string;
  req?: number;
  ro?: number;
  half?: number;
  ph?: string;
  help?: string;
  o?: string[];
  ref?: string;
  sugFrom?: string;
}

export interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, any>) => Promise<void>;
  title: string;
  one: string;
  fields: FieldDef[];
  initialData?: Record<string, any> | null;
  employees?: Array<{ id: string; name: string }>;
}

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  one,
  fields,
  initialData,
  employees = [],
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        const defaults: Record<string, any> = {};
        fields.forEach((f) => {
          if (f.k === 'status' && f.o && f.o.length > 0) defaults[f.k] = f.o[0];
          else if (f.t === 'yesno') defaults[f.k] = 'No';
          else defaults[f.k] = '';
        });
        setFormData(defaults);
      }
      setError(null);
    }
  }, [isOpen, initialData, fields]);

  if (!isOpen) return null;

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of fields) {
      if (f.req && !f.ro && (!formData[f.k] || String(formData[f.k]).trim() === '')) {
        setError(`Please fill in required field: ${f.l}`);
        return;
      }
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save record.');
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (f: FieldDef) => {
    const val = formData[f.k] ?? '';
    const id = `rf_${f.k}`;

    if (f.ro) {
      return (
        <input
          id={id}
          value={val}
          readOnly
          tabIndex={-1}
          placeholder="Worked out automatically"
          className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--muted)]"
        />
      );
    }

    if (f.t === 'emp') {
      return (
        <select
          id={id}
          value={val}
          onChange={(e) => handleChange(f.k, e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none"
        >
          <option value="">{employees.length ? 'Select employee...' : 'No employees yet'}</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} ({e.id})
            </option>
          ))}
        </select>
      );
    }

    if (f.t === 'select' && f.o) {
      return (
        <select
          id={id}
          value={val}
          onChange={(e) => handleChange(f.k, e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none"
        >
          <option value="">Select...</option>
          {f.o.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (f.t === 'yesno') {
      return (
        <select
          id={id}
          value={val || 'No'}
          onChange={(e) => handleChange(f.k, e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none"
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      );
    }

    if (f.t === 'textarea') {
      return (
        <textarea
          id={id}
          rows={3}
          placeholder={f.ph || ''}
          value={val}
          onChange={(e) => handleChange(f.k, e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none"
        />
      );
    }

    if (f.t === 'file') {
      return (
        <div className="space-y-1">
          <input
            id={id}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              handleChange(f.k, file ? file.name : '');
            }}
            className="w-full text-xs text-[var(--text)] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[var(--surface-2)] file:text-[var(--text)] hover:file:bg-[var(--line)]"
          />
          {val && <p className="text-[11px] text-[var(--muted)]">Selected: {val}</p>}
        </div>
      );
    }

    const type = f.t === 'money' || f.t === 'number' ? 'number' : f.t === 'date' ? 'date' : f.t === 'time' ? 'time' : f.t === 'month' ? 'month' : 'text';

    return (
      <input
        id={id}
        type={type}
        step={f.t === 'money' || f.t === 'number' ? 'any' : undefined}
        min={f.t === 'money' || f.t === 'number' ? '0' : undefined}
        placeholder={f.ph || ''}
        value={val}
        onChange={(e) => handleChange(f.k, e.target.value)}
        className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none"
      />
    );
  };

  const formFields = fields.filter((f) => f.k !== 'id' && !f.ro);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative my-8 max-h-[90vh] flex flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          {ic('x', 18)}
        </button>

        <div className="pb-3 border-b border-[var(--line)]">
          <h2 className="text-xl font-bold font-['Sora'] text-[var(--text)]">
            {title || (initialData ? `Edit ${one.toLowerCase()}` : `Add ${one.toLowerCase()}`)}
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {initialData ? `Update record details below.` : `Fill in the details to add a new ${one.toLowerCase()}.`}
          </p>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {formFields.map((f) => {
              const isHalf = Boolean(f.half);
              return (
                <div key={f.k} className={isHalf ? 'col-span-1' : 'col-span-1 sm:col-span-2'}>
                  <label htmlFor={`rf_${f.k}`} className="block text-xs font-semibold text-[var(--text)] mb-1">
                    {f.l}
                    {f.req && !f.ro && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderInput(f)}
                  {f.help && <p className="text-[11px] text-[var(--muted)] mt-1">{f.help}</p>}
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[var(--line)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface-2)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn primary px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[var(--ac,#0B87FF)] shadow-sm hover:opacity-90"
            >
              {saving ? 'Saving...' : initialData ? 'Save Changes' : `Add ${one.toLowerCase()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

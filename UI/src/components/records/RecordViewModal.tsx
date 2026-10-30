import React from 'react';
import { ic } from '../icons';

export interface FieldDef {
  k: string;
  l: string;
  t?: string;
}

export interface RecordViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: Record<string, any> | null;
  fields: FieldDef[];
  one: string;
  icon?: string;
  onEdit: (record: Record<string, any>) => void;
  onDelete: (record: Record<string, any>) => void;
}

export const RecordViewModal: React.FC<RecordViewModalProps> = ({
  isOpen,
  onClose,
  record,
  fields,
  one,
  icon = 'file-text',
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !record) return null;

  const title = record.name || record.designation || record.title || record.task || record.id || one;
  const status = record.status;

  const formatValue = (field: FieldDef, val: any) => {
    if (val === undefined || val === null || val === '') return '—';
    if (field.t === 'money') return `₹${Number(val).toLocaleString('en-IN')}`;
    return String(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8 max-h-[90vh] flex flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          {ic('x', 18)}
        </button>

        <div className="flex items-center gap-3.5 pb-4 border-b border-[var(--line)]">
          <span className="w-12 h-12 rounded-2xl bg-[var(--surface-2)] text-[var(--ac,#0B87FF)] flex items-center justify-center text-xl shrink-0 shadow-2xs">
            {ic(icon, 24)}
          </span>
          <div className="min-w-0 pr-6">
            <h3 className="font-['Sora'] text-lg font-bold text-[var(--text)] truncate">
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[var(--muted)] font-mono">{record.id}</span>
              {status && (
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {status}
                </span>
              )}
              {record._arch && (
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  Archived
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="grid grid-cols-2 gap-4">
            {fields.map((f) => {
              const val = record[f.k];
              return (
                <div key={f.k} className="p-2.5 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--line)]/50">
                  <span className="block text-[11px] font-medium text-[var(--muted)]">{f.l}</span>
                  <b className="block text-xs font-semibold text-[var(--text)] mt-0.5 break-words">
                    {formatValue(f, val)}
                  </b>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(record);
            }}
            className="btn text-xs font-semibold text-red-600 hover:bg-red-500/10 px-3 py-2 rounded-xl transition-colors"
          >
            Delete
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface-2)]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(record);
              }}
              className="btn primary px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[var(--ac,#0B87FF)] shadow-sm"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

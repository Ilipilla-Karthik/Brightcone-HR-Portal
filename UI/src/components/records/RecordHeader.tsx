import React from 'react';
import { ic } from '../icons';

export interface RecordHeaderProps {
  title: string;
  desc?: string;
  one: string;
  icon?: string;
  totalCount: number;
  kpiStats: Array<{ label: string; count: number; sub?: string }>;
  onExportCSV: () => void;
  onAddNew: () => void;
  extraAction?: { label: string; icon?: string; onClick: () => void };
}

export const RecordHeader: React.FC<RecordHeaderProps> = ({
  title,
  desc,
  one,
  icon = 'list',
  totalCount,
  kpiStats,
  onExportCSV,
  onAddNew,
  extraAction,
}) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[var(--surface-2)] text-[var(--text)]">
              {ic(icon, 20)}
            </span>
            <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">
              {title}
            </h1>
          </div>
          {desc && (
            <p className="text-xs text-[var(--muted)] mt-1.5 max-w-2xl leading-relaxed">
              {desc}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onExportCSV}
            className="btn text-xs font-semibold px-3.5 py-2 flex items-center gap-1.5 border border-[var(--line)] rounded-xl hover:bg-[var(--surface-2)] transition-colors"
          >
            {ic('download', 14)} Export CSV
          </button>

          {extraAction && (
            <button
              type="button"
              onClick={extraAction.onClick}
              className="btn text-xs font-semibold px-3.5 py-2 flex items-center gap-1.5 border border-[var(--line)] rounded-xl hover:bg-[var(--surface-2)] transition-colors text-[var(--text)]"
            >
              {extraAction.icon && ic(extraAction.icon, 14)} {extraAction.label}
            </button>
          )}

          <button
            type="button"
            onClick={onAddNew}
            className="btn primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5 rounded-xl text-white shadow-sm"
            style={{ background: 'var(--ac, #0B87FF)' }}
          >
            {ic('plus', 14)} Add {one.toLowerCase()}
          </button>
        </div>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <p className="text-xs text-[var(--muted)] font-medium">Total records</p>
          <p className="text-2xl font-bold font-['Sora'] text-[var(--text)] mt-1">
            {totalCount}
          </p>
          <span className="text-[11px] text-[var(--muted)]">Live records</span>
        </div>

        {kpiStats.slice(0, 3).map((st, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs"
          >
            <p className="text-xs text-[var(--muted)] font-medium">{st.label}</p>
            <p
              className={`text-2xl font-bold font-['Sora'] mt-1 ${
                st.label.toLowerCase().includes('approved') || st.label.toLowerCase().includes('active')
                  ? 'text-[#15A36B]'
                  : st.label.toLowerCase().includes('pending')
                  ? 'text-[#E07A1D]'
                  : 'text-[var(--text)]'
              }`}
            >
              {st.count}
            </p>
            <span className="text-[11px] text-[var(--muted)]">{st.sub || 'Records'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

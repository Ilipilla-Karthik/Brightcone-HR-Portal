import React from 'react';
import { ic } from '../icons';

export interface FieldDef {
  k: string;
  l: string;
  t?: string;
}

export interface RecordTableProps {
  cols: string[];
  fields: FieldDef[];
  rows: Record<string, any>[];
  statuses: string[];
  search: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  showArchived: boolean;
  onToggleArchived: () => void;
  archivedCount: number;
  one: string;
  icon?: string;
  onView: (row: Record<string, any>) => void;
  onEdit: (row: Record<string, any>) => void;
  onDelete: (row: Record<string, any>) => void;
}

export const RecordTable: React.FC<RecordTableProps> = ({
  cols,
  fields,
  rows,
  statuses,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  showArchived,
  onToggleArchived,
  archivedCount,
  one,
  icon = 'list',
  onView,
  onEdit,
  onDelete,
}) => {
  const getFieldLabel = (key: string) => {
    const f = fields.find((x) => x.k === key);
    return f ? f.l : key.charAt(0).toUpperCase() + key.slice(1);
  };

  const renderCell = (key: string, val: any) => {
    if (val === null || val === undefined || val === '') return '—';
    if (typeof val === 'number') {
      if (key.toLowerCase().includes('ctc') || key.toLowerCase().includes('budget') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('value') || key.toLowerCase().includes('gross') || key.toLowerCase().includes('net')) {
        return `₹${val.toLocaleString('en-IN')}`;
      }
      return String(val);
    }
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    return String(val);
  };

  const getStatusBadgeClass = (status: string) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('active') || s.includes('approved') || s.includes('accepted') || s.includes('joined') || s.includes('paid')) {
      return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300';
    }
    if (s.includes('pending') || s.includes('screening') || s.includes('draft') || s.includes('sent')) {
      return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300';
    }
    if (s.includes('reject') || s.includes('decline') || s.includes('term') || s.includes('close')) {
      return 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300';
    }
    return 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300';
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
        <div className="flex items-center gap-2 w-full md:w-80 px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
          {ic('search', 15)}
          <input
            type="search"
            placeholder={`Search ${one.toLowerCase()}...`}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-transparent text-xs text-[var(--text)] focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {statuses.length > 0 && (
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none cursor-pointer"
            >
              <option value="All">All statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}

          <label className="flex items-center gap-1.5 text-xs text-[var(--muted)] cursor-pointer select-none ml-auto">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={onToggleArchived}
              className="rounded border-[var(--line)] text-[#0B87FF] focus:ring-0"
            />
            <span>Archived ({archivedCount})</span>
          </label>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-2)] border-b border-[var(--line)] text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
              <tr>
                {cols.map((col) => (
                  <th key={col} className="py-3 px-4">{getFieldLabel(col)}</th>
                ))}
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {rows.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                  {cols.map((col) => {
                    const isStatus = col.toLowerCase() === 'status' || col.toLowerCase() === 'stage';
                    return (
                      <td key={col} className="py-3 px-4 text-xs font-medium text-[var(--text)]">
                        {isStatus ? (
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadgeClass(row[col])}`}>
                            {row[col] || 'Active'}
                          </span>
                        ) : col === 'id' ? (
                          <span className="font-mono text-xs text-[var(--muted)]">{row[col]}</span>
                        ) : (
                          renderCell(col, row[col])
                        )}
                      </td>
                    );
                  })}
                  <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onView(row)}
                      className="text-xs text-[var(--muted)] hover:text-[var(--text)] font-semibold p-1"
                      title="View details"
                    >
                      {ic('eye', 14)}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(row)}
                      className="text-xs text-[#0B87FF] hover:underline font-semibold p-1"
                      title="Edit"
                    >
                      {ic('edit', 14)}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(row)}
                      className="text-xs text-rose-600 hover:underline font-semibold p-1"
                      title="Delete"
                    >
                      {ic('trash', 14)}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="py-12 text-center text-[var(--muted)] space-y-2">
            <div className="inline-block p-3 rounded-full bg-[var(--surface-2)]">
              {ic(icon, 24)}
            </div>
            <p className="text-xs font-medium">No records found matching filters</p>
          </div>
        )}

        <div className="p-3 border-t border-[var(--line)] bg-[var(--surface-2)]/30 flex items-center justify-between text-xs text-[var(--muted)]">
          <span>{rows.length} records shown</span>
          <span>Saved to PostgreSQL database</span>
        </div>
      </div>
    </div>
  );
};

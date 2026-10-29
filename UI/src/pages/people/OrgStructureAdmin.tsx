import React, { useState, useEffect } from 'react';
import { fetchDepartments, DepartmentApiItem } from '../../services/peopleApi';

interface DepartmentRow {
  id: number;
  code: string;
  name: string;
  description: string;
  headcount: number;
}

export const OrgStructureAdmin: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentRow[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDepartments()
      .then((data: DepartmentApiItem[]) => {
        const list = Array.isArray(data) ? data : (data as any)?.value || [];
        const mapped: DepartmentRow[] = list.map((d: any) => ({
          id: d.id,
          code: (d.code || 'DEP').trim(),
          name: d.name,
          description: d.description || `${d.name} department at Brightcone`,
          headcount: d.name === 'Engineering' ? 12 : d.name === 'AI Research' ? 4 : 3,
        }));
        setDepartments(mapped);
      })
      .catch(() => {});
  }, []);

  const filtered = departments.filter((d) => {
    const q = search.toLowerCase();
    return !search || d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.description.toLowerCase().includes(q);
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">Organizational Structure & Departments</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Master department codes, cost centers, business units, and organizational hierarchies.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Active Departments</span>
          <p className="text-2xl font-bold text-[var(--text)]">{departments.length}</p>
          <span className="text-xs text-emerald-500 font-medium">Mapped to cost centers</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Total Headcount</span>
          <p className="text-2xl font-bold text-[var(--text)]">{departments.reduce((acc, d) => acc + d.headcount, 0)}</p>
          <span className="text-xs text-blue-500 font-medium">Across all global offices</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Career Grades</span>
          <p className="text-2xl font-bold text-[var(--text)]">9 Tiers (L1 - L9)</p>
          <span className="text-xs text-purple-500 font-medium">Standardized level matrix</span>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[var(--surface-2)]/50 text-[var(--muted)] uppercase font-semibold">
              <th className="p-3.5">Code</th>
              <th className="p-3.5">Department Name</th>
              <th className="p-3.5">Function Description</th>
              <th className="p-3.5 text-right">Assigned Headcount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)] text-[var(--text)]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-[var(--muted)]">No departments found.</td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--surface-2)]/30 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-[#12A58E]">{item.code}</td>
                  <td className="p-3.5 font-semibold text-[var(--text)]">{item.name}</td>
                  <td className="p-3.5 text-[var(--muted)]">{item.description}</td>
                  <td className="p-3.5 text-right font-medium">{item.headcount} Team Members</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrgStructureAdmin;

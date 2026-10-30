import React from 'record';

type ReviewCycleItem = {
  id: string;
  name: string;
  period: string;
  participants: number;
  completed: number;
  status: string;
  deadline: string;
};

type LMSCyclesTableProps = {
  cycles: ReviewCycleItem[];
  loading: boolean;
};

export const LMSCyclesTable: React.FC<LMSCyclesTableProps> = ({ cycles, loading }) => {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xs overflow-hidden">
      <div className="p-4 border-b border-[var(--line)]">
        <h3 className="font-['Sora'] text-sm font-bold text-[var(--text)]">Appraisal Cycles</h3>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-[var(--surface-2)] border-b border-[var(--line)] text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
          <tr>
            <th className="py-3 px-4">Cycle Name</th>
            <th className="py-3 px-4">Self-Review Due</th>
            <th className="py-3 px-4">Participants</th>
            <th className="py-3 px-4">Completion</th>
            <th className="py-3 px-4">Deadline</th>
            <th className="py-3 px-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {loading ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-[var(--muted)]">Loading review cycles from backend...</td>
            </tr>
          ) : cycles.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-[var(--muted)]">
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-xl">📊</span>
                  <p className="font-semibold text-[var(--text)] text-sm">No Review Cycles Found</p>
                  <p className="text-xs text-[var(--muted)]">Appraisal cycles initiated from Performance Management will appear here.</p>
                </div>
              </td>
            </tr>
          ) : cycles.map((c) => (
            <tr key={c.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
              <td className="py-3 px-4 font-semibold text-xs text-[var(--text)]">{c.name}</td>
              <td className="py-3 px-4 text-xs font-medium text-[var(--muted)]">{c.period}</td>
              <td className="py-3 px-4 text-xs font-mono">{c.participants} Members</td>
              <td className="py-3 px-4 w-40">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                    <div
                      className="h-full bg-[#7C5CFF]"
                      style={{ width: `${c.participants > 0 ? Math.round((c.completed / c.participants) * 100) : 0}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-[var(--muted)]">{c.completed}/{c.participants}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-xs font-mono text-[var(--muted)]">{c.deadline}</td>
              <td className="py-3 px-4 text-right">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  c.status === 'Active' ? 'bg-purple-100 text-[#7C5CFF]' :
                  c.status === 'Closed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {c.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
import React from 'record';

type Req = Record<string, any>;
type ManpowerStatsProps = {
  reqs: Req[];
};

export const ManpowerStats: React.FC<ManpowerStatsProps> = ({ reqs }) => {
  const totalPositions = reqs.reduce((s, r) => s + (Number(r.positions) || 0), 0);
  const approved = reqs.filter((r) => r.status === 'Approved').length;
  const departments = new Set(reqs.map((r) => r.department).filter(Boolean)).size;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Target Headcount</p>
        <p className="text-2xl font-bold text-slate-900 mt-1 font-['Sora']">{totalPositions} Positions</p>
        <p className="text-[11px] text-blue-600 mt-0.5">Across {departments} departments</p>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Requisitions</p>
        <p className="text-2xl font-bold text-emerald-600 mt-1 font-['Sora']">{approved} Approved</p>
        <p className="text-[11px] text-slate-500 mt-0.5">Of {reqs.length} total requisitions</p>
      </div>
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Requisitions</p>
        <p className="text-2xl font-bold text-slate-900 mt-1 font-['Sora']">{reqs.length}</p>
        <p className="text-[11px] text-emerald-600 mt-0.5">In manpower registry</p>
      </div>
    </div>
  );
};
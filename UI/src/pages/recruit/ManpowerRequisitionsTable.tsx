import React from 'record';

type Req = Record<string, any>;
type ManpowerTableProps = {
  reqs: Req[];
};

export const ManpowerRequisitionsTable: React.FC<ManpowerTableProps> = ({ reqs }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Req ID</th>
              <th className="py-3 px-4">Role & Dept</th>
              <th className="py-3 px-4">Positions</th>
              <th className="py-3 px-4">Budget</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4">Required By</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {reqs.map((r) => (
              <tr key={r.code || r.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-mono font-medium text-slate-700">{r.code || `#${r.id}`}</td>
                <td className="py-3 px-4">
                  <p className="font-semibold text-slate-900">{r.designation}</p>
                  <p className="text-[11px] text-slate-500">{r.department}{r.location ? ` · ${r.location}` : ''}</p>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{r.positions ?? '—'}</td>
                <td className="py-3 px-4 font-mono text-slate-700">{r.budget || '—'}</td>
                <td className="py-3 px-4">{r.etype || '—'}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    r.reason === 'Replacement' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {r.reason || '—'}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600">{r.by || '—'}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    r.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                    r.status === 'Closed' ? 'bg-emerald-100 text-emerald-800' :
                    r.status === 'On hold' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {r.status || '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
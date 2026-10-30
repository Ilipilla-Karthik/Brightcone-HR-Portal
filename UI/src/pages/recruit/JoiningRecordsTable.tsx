import React from 'record';

type JoiningRecord = Record<string, any>;
type JoiningRecordProps = {
  joiners: JoiningRecord[];
};

export const JoiningRecordsTable: React.FC<JoiningRecordProps> = ({ joiners }) => {
  return (
    <table className="w-full text-xs text-left">
      <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
        <tr>
          <th className="py-3 px-4">Employee</th>
          <th className="py-3 px-4">Date of Joining</th>
          <th className="py-3 px-4">Documents</th>
          <th className="py-3 px-4">Assets / Setup</th>
          <th className="py-3 px-4">Status</th>
          <th className="py-3 px-4 text-right">Action</th>
        </tr>
      </thead>
      <tbody>
        {joiners.map((j) => (
          <tr key={j.code || j.id} className="hover:bg-slate-50 transition-colors">
            <td className="py-3 px-4"><p className="font-semibold text-slate-900">{j.emp}</p>{j.notes && <p className="text-[11px] text-slate-500">{j.notes}</p>}</td>
            <td className="py-3 px-4 font-mono font-medium text-slate-700">{j.doj || '—'}</td>
            <td className="py-3 px-4">
              <select
                value={j.docs || 'Not started'}
                className={`px-2 py-1 rounded-full text-[10px] font-bold border-0 cursor-pointer ${
                  j.docs === 'All collected' ? 'bg-emerald-100 text-emerald-800' :
                  j.docs === 'Partial' ? 'bg-amber-100 text-amber-800' :
                  'bg-slate-100 text-slate-600'
                }`}
              >
                <option value="Not started">Not started</option>
                <option value="Partial">Partial</option>
                <option value="All collected">All collected</option>
              </select>
            </td>
            <td className="py-3 px-4">
              <div className="flex flex-wrap gap-1">
                {['idcard', 'mail', 'laptop', 'bankd', 'pf'].map((k) => (
                  <button
                    key={k}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold cursor-pointer ${
                      j[k] === 'Yes' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {k === 'idcard' ? 'ID' : k === 'mail' ? 'Mail' : k === 'laptop' ? 'Laptop' : k === 'bankd' ? 'Bank' : 'PF'}
                  </button>
                ))}
              </div>
            </td>
            <td className="py-3 px-4">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${j.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : j.status === 'In progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                {j.status}
              </span>
            </td>
            <td className="py-3 px-4 text-right whitespace-nowrap">
              <div className="flex items-center justify-end gap-1.5">
                <button className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded cursor-pointer">Details</button>
                {j.status !== 'Completed' && (
                  <button className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer">Complete ✓</button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
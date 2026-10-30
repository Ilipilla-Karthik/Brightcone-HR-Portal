import React from 'record';

type Candidate = Record<string, any>;
type CandidateTableProps = {
  candidates: Candidate[];
  loading: boolean;
  stageFilter: string;
  setStageFilter: any;
  search: string;
  setSearch: any;
  handleMoveStage: any;
};

export const CandidateTable: React.FC<CandidateTableProps> = ({ candidates, loading, stageFilter, setStageFilter, search, setSearch, handleMoveStage }) => {
  const getStageBadge = (stage: string) => {
    const st = stage?.toLowerCase();
    if (st === 'offer' || st === 'hired') return 'bg-emerald-100 text-emerald-800';
    if (st === 'interview' || st === 'technical') return 'bg-purple-100 text-purple-800';
    if (st === 'screening') return 'bg-blue-100 text-blue-800';
    if (st === 'rejected') return 'bg-rose-100 text-rose-800';
    return 'bg-slate-100 text-slate-800';
  };

  const filtered = candidates.filter((c) => {
    const matchStage = stageFilter === 'All' ? true : c.stage?.toLowerCase() === stageFilter.toLowerCase();
    const name = c.full_name || c.name || '';
    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      (c.job_title && c.job_title.toLowerCase().includes(search.toLowerCase()));
    return matchStage && matchSearch;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Candidate</th>
              <th className="py-3 px-4">Target Role</th>
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4">Match Score</th>
              <th className="py-3 px-4">Stage</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">Loading candidates from backend...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">No candidates match this filter.</td>
              </tr>
            ) : filtered.map((c) => (
              <tr key={c.cand_id || c.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-semibold text-slate-900">{c.full_name || c.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{c.email || c.candidate_code || ''}</p>
                </td>
                <td className="py-3 px-4 font-medium text-slate-800">{c.job_title || '—'}</td>
                <td className="py-3 px-4 text-slate-600">{c.source || '—'}</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.match_score != null ? `${c.match_score}%` : '—'}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${getStageBadge(c.stage)}`}>
                    {c.stage || '—'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                  {c.stage === 'Applied' && (
                    <button onClick={() => handleMoveStage(c.cand_id || c.id, 'Screening')} className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-semibold">
                      Screen →
                    </button>
                  )}
                  {c.stage === 'Screening' && (
                    <button onClick={() => handleMoveStage(c.cand_id || c.id, 'Interview')} className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-[11px] font-semibold">
                      Interview →
                    </button>
                  )}
                  {c.stage === 'Interview' && (
                    <button onClick={() => handleMoveStage(c.cand_id || c.id, 'Offer')} className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-semibold">
                      Offer ★
                    </button>
                  )}
                  {c.stage === 'Offer' && (
                    <button onClick={() => handleMoveStage(c.cand_id || c.id, 'Hired')} className="px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-[11px] font-semibold">
                      Hired ✓
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
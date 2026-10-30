import React from 'record';

type CandidateFilterBarProps = {
  stageFilter: string;
  setStageFilter: any;
  search: string;
  setSearch: any;
};

export const CandidateFilterBar: React.FC<CandidateFilterBarProps> = ({ stageFilter, setStageFilter, search, setSearch }) => {
  const getStageBadge = (stage: string) => {
    const st = stage?.toLowerCase();
    if (st === 'offer' || st === 'hired') return 'bg-emerald-100 text-emerald-800';
    if (st === 'interview' || st === 'technical') return 'bg-purple-100 text-purple-800';
    if (st === 'screening') return 'bg-blue-100 text-blue-800';
    if (st === 'rejected') return 'bg-rose-100 text-rose-800';
    return 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
        {['All', 'Applied', 'Screening', 'Interview', 'Offer', 'Hired'].map((st) => (
          <button
            key={st}
            onClick={() => setStageFilter(st)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              stageFilter === st ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {st}
          </button>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          placeholder="Search candidates or roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
        <span className="absolute left-2.5 top-2.5 text-slate-400 w-3.5 h-3.5">&#128269;</span>
      </div>
    </div>
  );
};
import React from 'record';

type CandidateHeaderProps = {
  onAddCandidate: () => void;
};

export const CandidateHeader: React.FC<CandidateHeaderProps> = ({ onAddCandidate }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Sora']">Candidate Tracker</h1>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">● Backend Connected</span>
        </div>
        <p className="text-sm text-slate-500 mt-1">Real-time candidate pipeline communicating with backend API</p>
      </div>
      <button onClick={onAddCandidate} className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto">
        <span className="w-4 h-4">{ic('plus', 16)}</span> Add Candidate
      </button>
    </div>
  );
};
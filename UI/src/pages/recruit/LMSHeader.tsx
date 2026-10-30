import React from 'record';

type LMSToggleProps = {
  setIsMsgModalOpen: any;
};

export const LMSHeader: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
      <div>
        <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">Performance Cycles & LMS</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Appraisal rounds, 360-degree feedback, and competency ratings.</p>
      </div>
      <button
        type="button"
        onClick={() => setIsMsgModalOpen(true)}
        className="btn text-xs font-semibold px-3.5 py-2 border border-[var(--line)] rounded-xl hover:bg-[var(--surface-2)]"
      >
        Refresh
      </button>
    </div>
  );
};
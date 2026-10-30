import React from 'react';

type PipelineStageProps = {
  stage: string;
  count: number;
  pct: number;
  color: string;
};

export const RecruitPipelineFunnel: React.FC<PipelineStageProps[]> = ({ stages }) => {
  return (
    <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs space-y-4">
      <h3 className="font-['Sora'] text-base font-bold text-[var(--text)]">Hiring Conversion Funnel</h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
        {stages.map((s) => (
          <div
            key={s.stage}
            className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] space-y-2"
          >
            <span className="text-xs font-semibold text-[var(--muted)] block truncate">{s.stage}</span>
            <p
              className="text-2xl font-bold font-['Sora']"
              style={{ color: s.color }}
            >
              {s.count}
            </p>
            <div className="h-1.5 rounded-full bg-[var(--line)] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${s.pct}%`, background: s.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
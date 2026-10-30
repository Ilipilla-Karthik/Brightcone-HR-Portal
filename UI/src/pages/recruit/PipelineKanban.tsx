import React from 'react';
import { ic } from '../../components/icons';

export interface CandidateItem {
  id: string;
  name: string;
  role: string;
  source: string;
  score: number;
  stage: string;
}

export interface PipelineKanbanProps {
  candidates: CandidateItem[];
  onMoveCandidate: (id: string) => void;
  onRejectCandidate: (id: string) => void;
}

const STAGES = ['Screener', 'Interview 1', 'Interview 2', 'Offer', 'Hired'];

const getAvatarColor = (name: string) => {
  const colors = ['#0B6FDB', '#12A58E', '#7C5CFF', '#D9466F', '#E07A1D', '#0BA6CC'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
};

export const PipelineKanban: React.FC<PipelineKanbanProps> = ({
  candidates,
  onMoveCandidate,
  onRejectCandidate,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start">
      {STAGES.map((stage, stageIdx) => {
        const stageCands = candidates.filter(
          (c) => (c.stage || 'Screener').toLowerCase() === stage.toLowerCase()
        );

        return (
          <div
            key={stage}
            className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-3 shadow-2xs space-y-2.5 min-h-[360px]"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <h4 className="text-xs font-bold text-[var(--text)] font-['Sora'] flex items-center gap-1.5">
                <span>{stage}</span>
                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted)]">
                  {stageCands.length}
                </span>
              </h4>
            </div>

            <div className="space-y-2">
              {stageCands.length === 0 ? (
                <div className="text-center py-8 text-[11px] text-[var(--muted)] italic">
                  No candidates
                </div>
              ) : (
                stageCands.map((cand) => (
                  <div
                    key={cand.id}
                    className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] space-y-2 hover:border-[var(--muted)] transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-7 h-7 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0"
                        style={{ background: getAvatarColor(cand.name) }}
                      >
                        {cand.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <b className="text-xs text-[var(--text)] block truncate">
                          {cand.name}
                        </b>
                        <span className="text-[10px] text-[var(--muted)] block truncate">
                          {cand.role} · via {cand.source}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[var(--line)] text-[11px]">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md text-[10px]">
                        {cand.score}% fit
                      </span>

                      {stageIdx < 4 ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onMoveCandidate(cand.id)}
                            className="btn text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--line)] border border-[var(--line)] text-[var(--text)] cursor-pointer"
                          >
                            Move
                          </button>
                          <button
                            type="button"
                            onClick={() => onRejectCandidate(cand.id)}
                            className="p-1 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                            title={`Reject ${cand.name}`}
                            aria-label={`Reject ${cand.name}`}
                          >
                            {ic('x', 12)}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                          Hired
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

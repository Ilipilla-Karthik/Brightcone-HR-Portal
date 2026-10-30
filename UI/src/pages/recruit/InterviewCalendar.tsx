import React, { useMemo } from 'react';

type Interview = Record<string, any>;
type NameOf = (id: any) => string;

type InterviewCalendarProps = {
  items: Interview[];
  candidates: any[];
  nameOf: NameOf;
  toDateInput: (v: any) => string;
};

export const InterviewCalendar: React.FC<InterviewCalendarProps> = ({
  items,
  candidates,
  nameOf,
  toDateInput,
}) => {
  const byDate = useMemo(
    () => items.reduce((acc, it) => { const d = toDateInput((it as any).scheduled_at) || 'Unscheduled'; (acc[d] ||= []).push(it); return acc; }, {} as Record<string, Interview[]>),
    [items]
  );
  const sortedDates = useMemo(() => Object.keys(byDate).sort(), [byDate]);

  return sortedDates.length > 0 ? (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <h3 className="font-semibold text-gray-800">Calendar</h3>
      {sortedDates.map((d) => (
        <div key={d}>
          <p className="text-xs text-gray-500 mb-1">
            {d === 'Unscheduled'
              ? d
              : new Date(d).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
          </p>
          <div className="space-y-1">
            {byDate[d].map((it) => (
              <div
                key={it.id}
                className="flex items-center gap-3 bg-gray-50 border-l-4 border-teal-500 rounded px-3 py-1.5 text-sm"
              >
                <span className="font-medium">{toTimeInput(it.scheduled_at) || 'TBD'}</span>
                <span className="text-gray-700">{nameOf(it.candidate)}</span>
                <span className="text-xs text-gray-500">{it.round} · {it.mode}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ) : null;
};
import React from 'react';

type InterviewStatsCardsProps = {
  items: any[];
  icons: { today: React.ReactNode; pending: React.ReactNode; total: React.ReactNode; weekly: React.ReactNode };
};

export const InterviewStatsCards: React.FC<InterviewStatsCardsProps> = ({ items, icons }) => {
  const toDateInput = (v: any) => {
    if (!v) return '';
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  };
  const pending = items.filter((it) => (it.result || 'Pending') === 'Pending');

  // Pre-compute the "this week" count outside the JSX
  const weekCount = items.filter(
    (i) => {
      const scheduled = new Date(i.scheduled_at);
      const now = new Date();
      const daysDiff = (scheduled.getTime() - now.getTime()) / 86400000;
      return scheduled && daysDiff >= -7 && daysDiff <= 7;
    }
  ).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-500">Interviews Today</span>
          <span className="text-2xl font-bold text-blue-600">
            {String(items.filter((i) => toDateInput(i.scheduled_at) === new Date().toISOString().slice(0, 10)).length)}
          </span>
        </div>
        {icons.today}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-500">Pending Feedback</span>
          <span className="text-2xl font-bold text-amber-600">{String(pending.length)}</span>
        </div>
        {icons.pending}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-500">Total Scheduled</span>
          <span className="text-2xl font-bold text-teal-600">{String(items.length)}</span>
        </div>
        {icons.total}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-500">This Week</span>
          <span className="text-2xl font-bold text-purple-600">{String(weekCount)}</span>
        </div>
        {icons.weekly}
      </div>
    </div>
  );
};
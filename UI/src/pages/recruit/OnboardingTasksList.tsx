import React from 'react';

type OnboardingTasksListProps = {
  selectedEmp: string | null;
  grouped: Map<string, any[]>;
  showToast: any;
};

type TaskItem = {
  code?: string;
  id?: string;
  task: string;
  owner?: string;
  due?: string;
  status: string;
};

export const OnboardingTasksList: React.FC<OnboardingTasksListProps> = ({
  selectedEmp,
  grouped,
  showToast,
}) => {
  const selectedTasks = selectedEmp ? grouped.get(selectedEmp) || [] : [];
  const completedCount = selectedTasks.filter((t: TaskItem) => t.status === 'Completed').length;
  const pct = selectedTasks.length > 0 ? Math.round((completedCount / selectedTasks.length) * 100) : 0;
  const nextDue = selectedTasks
    .filter((t: TaskItem) => t.status !== 'Completed' && t.due)
    .map((t: TaskItem) => t.due)
    .sort()[0];

  return (
    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Day 1 Preparation</span>
          <h3 className="text-xl font-bold text-slate-900 font-['Sora'] mt-0.5">{selectedEmp}</h3>
          <p className="text-xs text-slate-500">
            {completedCount} of {selectedTasks.length} milestones completed
            {nextDue ? ` · Next due ${nextDue}` : ''}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">{pct}%</span>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Onboarding Milestones</h4>
        <div className="space-y-2.5">
          {selectedTasks.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No tasks for this joiner yet.</p>
          ) : (
            selectedTasks.map((task: TaskItem) => {
              const completed = task.status === 'Completed';
              return (
                <div
                  key={task.code || task.id}
                  onClick={() => toggleTask(task)}
                  className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={completed}
                      readOnly
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
                    />
                    <div>
                      <span
                        className={`text-xs font-medium block ${completed ? 'line-through text-slate-400' : 'text-slate-800'}`}
                      >
                        {task.task}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {task.owner ? `Owner: ${task.owner} · ` : ''}Due {task.due || '—'}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {completed ? 'Completed' : 'Pending'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
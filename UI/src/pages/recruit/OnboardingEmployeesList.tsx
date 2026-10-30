import React from 'react';

type OnboardingEmployeesListProps = {
  grouped: Map<string, any[]>;
  people: string[];
  selectedEmp: string | null;
  setSelectedEmp: any;
};

export const OnboardingEmployeesList: React.FC<OnboardingEmployeesListProps> = ({
  grouped,
  people,
  selectedEmp,
  setSelectedEmp,
}) => {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Incoming Joiners</h2>
      <div className="space-y-2">
        {people.map((emp) => {
          const empTasks = grouped.get(emp) || [];
          const done = empTasks.filter((t) => t.status === 'Completed').length;
          const empPct = empTasks.length > 0 ? Math.round((done / empTasks.length) * 100) : 0;
          const isSelected = selectedEmp === emp;
          return (
            <div
              key={emp}
              onClick={() => setSelectedEmp(emp)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected ? 'border-blue-500 bg-blue-50/40 shadow-sm ring-1 ring-blue-500' : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 text-sm">{emp}</span>
                <span className="text-xs font-mono font-bold text-blue-600">{empPct}%</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{empTasks.length} tasks · {done} completed</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
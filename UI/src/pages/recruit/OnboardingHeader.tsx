import React from 'react';

type OnboardingHeaderProps = {
  onAddTask: () => void;
};

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ onAddTask }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Sora']">New Hire Onboarding Checklist</h1>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">● Backend Linked</span>
        </div>
        <p className="text-sm text-slate-500 mt-1">IT provisioning, corporate access, compliance training, and Day 1 welcome</p>
      </div>
      <button onClick={onAddTask} className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto">
        <span className="w-4 h-4">{ic('plus', 16)}</span> Add Task
      </button>
    </div>
  );
};
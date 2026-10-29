import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import { recruitApi } from '../../services/recruitApi';

interface OnboardingCandidate {
  id: string;
  name: string;
  role: string;
  joiningDate: string;
  buddy: string;
  tasks: { title: string; completed: boolean }[];
}

export const OnboardingChecklistPage: React.FC = () => {
  const [candidates, setCandidates] = useState<OnboardingCandidate[]>([]);
  const [selectedCan, setSelectedCan] = useState<OnboardingCandidate | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    recruitApi.getCandidates().then((cands) => {
      const hired = cands.filter((c) => c.stage?.toLowerCase() === 'offer' || c.stage?.toLowerCase() === 'hired');
      if (hired.length > 0) {
        const mapped = hired.map((c, i) => {
          const id = c.candidate_code || `ONB-${i + 1}`;
          const savedTasks = localStorage.getItem(`onboarding_tasks_${id}`);
          const defaultTasks = [
            { title: 'Google Workspace & Slack account creation', completed: true },
            { title: 'Laptop workstation provisioned & ready', completed: true },
            { title: 'POSH & Security training enrolled', completed: false },
            { title: 'Manager 1-on-1 scheduled for Day 1', completed: false },
            { title: 'Buddy introduction call setup', completed: false },
          ];
          const tasks = savedTasks ? JSON.parse(savedTasks) : defaultTasks;
          return {
            id,
            name: c.full_name,
            role: c.job_title || 'New Team Member',
            joiningDate: 'Upcoming',
            buddy: 'Naresh Vemparala',
            tasks,
          };
        });
        setCandidates(mapped);
        setSelectedCan(mapped[0]);
      } else {
        setCandidates([]);
        setSelectedCan(null);
      }
    }).catch(() => {
      setCandidates([]);
      setSelectedCan(null);
    });
  }, []);

  const toggleTask = (candidateId: string, taskIdx: number) => {
    let newTasks: { title: string; completed: boolean }[] = [];
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id === candidateId) {
          const updated = [...c.tasks];
          updated[taskIdx] = { ...updated[taskIdx], completed: !updated[taskIdx].completed };
          newTasks = updated;
          try {
            localStorage.setItem(`onboarding_tasks_${candidateId}`, JSON.stringify(updated));
          } catch {}
          return { ...c, tasks: updated };
        }
        return c;
      })
    );
    setSelectedCan((prev) => {
      if (prev && prev.id === candidateId) {
        const updated = newTasks.length > 0 ? newTasks : [...prev.tasks];
        return { ...prev, tasks: updated };
      }
      return prev;
    });
    showToast('Checklist task updated & saved');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Sora']">New Hire Onboarding Checklist</h1>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">● Backend Linked</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">IT provisioning, corporate access, compliance training, and Day 1 welcome</p>
        </div>
        <button
          onClick={() => showToast('Dispatched IT provisioning webhook to Slack #it-ops')}
          className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <span className="w-4 h-4">{ic('plus', 16)}</span> Trigger IT Provisioning
        </button>
      </div>

      {candidates.length === 0 || !selectedCan ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-3xl text-slate-300">📋</span>
            <h3 className="font-bold text-slate-900 text-base font-['Sora']">No Onboarding Candidates</h3>
            <p className="text-xs text-slate-500 max-w-sm">When candidates are marked as offered or hired in the recruit pipeline, their Day-1 onboarding checklist will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Incoming Joiners</h2>
            <div className="space-y-2">
              {candidates.map((c) => {
                const completedCount = c.tasks.filter((t) => t.completed).length;
                const isSelected = selectedCan.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCan(c)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-50/40 shadow-sm ring-1 ring-blue-500' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-sm">{c.name}</span>
                      <span className="text-xs font-mono font-bold text-blue-600">
                        {Math.round((completedCount / c.tasks.length) * 100)}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{c.role}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Day 1: {c.joiningDate} · Buddy: {c.buddy}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Day 1 Preparation</span>
                <h3 className="text-xl font-bold text-slate-900 font-['Sora'] mt-0.5">{selectedCan.name}</h3>
                <p className="text-xs text-slate-500">{selectedCan.role} · Joining on {selectedCan.joiningDate}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                Assigned Buddy: {selectedCan.buddy}
              </span>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Onboarding Milestones</h4>
              <div className="space-y-2.5">
                {selectedCan.tasks.map((task, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleTask(selectedCan.id, idx)}
                    className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        readOnly
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
                      />
                      <span className={`text-xs font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.title}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      task.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {task.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-medium shadow-xl flex items-center gap-2 animate-fade-in">
          <span className="w-4 h-4 text-emerald-400">{ic('check', 16)}</span>
          {toastMsg}
        </div>
      )}
    </div>
  );
};

export default OnboardingChecklistPage;

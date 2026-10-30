import React, { useState, useEffect, useMemo } from 'react';
import { ic } from '../../components/icons';
import { recordsList, recordsCreate, recordsUpdate, employeesApi } from './recruitApi';
import { OnboardingHeader } from './OnboardingHeader';
import { OnboardingEmployeesList } from './OnboardingEmployeesList';
import { OnboardingTasksList } from './OnboardingTasksList';
import { OnboardingAddTaskModal } from './OnboardingAddTaskModal';

type OnboardTask = Record<string, any>;

const KIND = 'onboard2';

export const OnboardingChecklistPage: React.FC = () => {
  const [tasks, setTasks] = useState<OnboardTask[]>([]);
  const [employees, setEmployees] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmp, setSelectedEmp] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ emp: '', task: '', owner: '', due: '' });
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [taskRows, emps] = await Promise.all([recordsList(KIND), employeesApi.list().catch(() => [])]);
      setTasks(taskRows);
      setEmployees(emps);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load onboarding tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, OnboardTask[]>();
    tasks.forEach((t) => {
      const key = t.emp || 'Unassigned';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    return map;
  }, [tasks]);

  useEffect(() => {
    if (!selectedEmp && grouped.size > 0) {
      setSelectedEmp([...grouped.keys()][0]);
    }
  }, [grouped, selectedEmp]);

  const toggleTask = async (task: OnboardTask) => {
    const isDone = task.status === 'Completed';
    const payload = isDone ? { status: 'Pending', done: null } : { status: 'Completed', done: new Date().toISOString().slice(0, 10) };
    try {
      const updated = await recordsUpdate(KIND, task.code, payload);
      setTasks((prev) => prev.map((t) => (t.code === task.code ? updated : t)));
      showToast(isDone ? `Reopened "${task.task}"` : `Completed "${task.task}"`);
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Failed to update task');
    }
  };

  const people = [...grouped.keys()];
  const selectedTasks = selectedEmp ? grouped.get(selectedEmp) || [] : [];
  const completedCount = selectedTasks.filter((t) => t.status === 'Completed').length;
  const pct = selectedTasks.length > 0 ? Math.round((completedCount / selectedTasks.length) * 100) : 0;
  const nextDue = selectedTasks
    .filter((t) => t.status !== 'Completed' && t.due)
    .map((t) => t.due)
    .sort()[0];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <OnboardingHeader onAddTask={() => setIsModalOpen(true)} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="underline font-semibold ml-3">Retry</button>
        </div>
      )}

      <OnboardingEmployeesList
        grouped={grouped}
        people={people}
        selectedEmp={selectedEmp}
        setSelectedEmp={setSelectedEmp}
      />

      <OnboardingTasksList
        selectedEmp={selectedEmp}
        grouped={grouped}
        showToast={showToast}
      />

      {isModalOpen && (
        <OnboardingAddTaskModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          form={form}
          setForm={setForm}
          selectedEmp={selectedEmp}
          showToast={showToast}
          employees={employees}
        />
      )}
    </div>
  );
};

export default OnboardingChecklistPage;
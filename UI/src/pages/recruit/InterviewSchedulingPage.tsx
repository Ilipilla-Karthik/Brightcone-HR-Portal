import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Video, Calendar, Clock, X } from 'lucide-react';
import { list, create, remove, update } from './recruitApi';
import { InterviewStatsCards } from './InterviewStatsCards';
import { InterviewTable } from './InterviewTable';
import { InterviewCalendar } from './InterviewCalendar';
import { InterviewDetailModal } from './InterviewDetailModal';
import { InterviewAddModal } from './InterviewAddModal';
import { useNavigate } from 'react-router-dom';

type Interview = Record<string, any>;

export default function InterviewSchedulingPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Interview[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Interview | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    candidate: '',
    job: '',
    round: 'Screening',
    mode: 'Video',
    date: '',
    time: '',
    duration: '45',
    panel: '',
    link: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    Promise.all([list('interviews'), list('candidates'), list('jobs')])
      .then(([i, c, j]) => {
        setItems(i);
        setCandidates(c);
        setJobs(j);
      })
      .catch((e) => setError(e?.response?.data?.message || 'Failed to load interviews'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const byDate = useMemo(
    () =>
      items.reduce(
        (acc, it) => {
          const d = toDateInput((it as any).scheduled_at) || 'Unscheduled';
          (acc[d] ||= []).push(it);
          return acc;
        },
        {} as Record<string, Interview[]>
      ),
    [items]
  );
  const sortedDates = useMemo(() => Object.keys(byDate).sort(), [byDate]);
  const pending = useMemo(() => items.filter((it) => (it.result || 'Pending') === 'Pending'), [items]);

  const toDateInput = (v: any) => {
    if (!v) return '';
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  };
  const toTimeInput = (v: any) => {
    if (!v) return '';
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? '' : d.toTimeString().slice(0, 5);
  };
  const toLocalDT = (date: string, time: string) =>
    date && time ? new Date(`${date}T${time}:00`).toISOString() : new Date().toISOString();

  const nameOf = (id: any) => candidates.find((c) => c.id === Number(id))?.name || `#${id}`;
  const jobOf = (id: any) => jobs.find((j) => j.id === Number(id))?.title || (id ? `#${id}` : '');

  const openNew = () => {
    setForm({
      candidate: '',
      job: '',
      round: 'Screening',
      mode: 'Video',
      date: '',
      time: '',
      duration: '45',
      panel: '',
      link: '',
      notes: '',
    });
    setShowAdd(true);
  };

  const add = async () => {
    if (!form.candidate) {
      setToast('Candidate is required');
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        candidate: Number(form.candidate),
        round: form.round,
        mode: form.mode,
        scheduled_at: toLocalDT(form.date, form.time),
        duration_minutes: Number(form.duration) || 45,
        result: 'Pending',
      };
      if (form.job) payload.job = Number(form.job);
      if (form.panel) payload.panel = form.panel;
      if (form.link) payload.link = form.link;
      if (form.notes) payload.notes = form.notes;
      const created = await create('interviews', payload);
      setItems((prev) => [...prev, created]);
      setShowAdd(false);
      setToast('Interview scheduled');
    } catch (e: any) {
      setToast(e?.response?.data?.message || 'Failed to schedule interview');
    } finally { setSaving(false); }
  };

  const removeItem = async (id: number) => {
    try {
      await remove('interviews', id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setSelected(null);
      setToast('Interview removed');
    } catch (e: any) {
      setToast(e?.response?.data?.message || 'Failed to remove interview');
    }
  };

  const setResult = async (id: number, result: string) => {
    try {
      const updated = await update('interviews', id, { result });
      setItems((prev) =>
        prev.map((i) => (i.id === id ? updated : i))
      );
      setSelected((s) => (s && s.id === id ? updated : s));
      setToast(`Marked ${result.toLowerCase()}`);
    } catch (e: any) {
      setToast(e?.response?.data?.message || 'Failed to update result');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading interviews…</div>;
  if (error) return (
    <div className="p-8 text-center">
      <div className="text-red-600 mb-2">{error}</div>
      <button onClick={() => location.reload()} className="text-sm text-teal-700 underline">Retry</button>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 relative">
      <InterviewStatsCards items={items} icons={{ today: <Calendar className="w-5 h-5 text-blue-600" />, pending: <Clock className="w-5 h-5 text-amber-600" />, total: <Video className="w-5 h-5 text-teal-600" />, weekly: <Calendar className="w-5 h-5 text-purple-600" /> }} />

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Interviews ({items.length})</h2>
        <button onClick={openNew} className="flex items-center gap-1.5 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700 transition">
          <Plus className="w-4 h-4" /> Schedule
        </button>
      </div>

      <InterviewTable
        items={items}
        candidates={candidates}
        jobs={jobs}
        nameOf={nameOf}
        jobOf={jobOf}
        removeItem={removeItem}
        setResult={setResult}
        selected={selected}
        setSelected={setSelected}
      />

      <InterviewCalendar items={items} candidates={candidates} nameOf={nameOf} toDateInput={toDateInput} />

      <InterviewDetailModal
        selected={selected}
        setSelected={setSelected}
        nameOf={nameOf}
        jobOf={jobOf}
        setResult={setResult}
      />

      <InterviewAddModal
        showAdd={showAdd}
        setShowAdd={setShowAdd}
        form={form}
        setForm={setForm}
        candidates={candidates}
        jobs={jobs}
        nameOf={nameOf}
        jobOf={jobOf}
        add={add}
        saving={saving}
        toast={toast}
        setToast={setToast}
      />
    </div>
  );
}
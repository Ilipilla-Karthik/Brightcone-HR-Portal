import React, { useState, useEffect, useMemo } from 'react';
import { ic } from '../../components/icons';
import { recordsList, recordsCreate } from './recruitApi';
import { ManpowerHeader } from './ManpowerHeader';
import { ManpowerStats } from './ManpowerStats';
import { ManpowerRequisitionsTable } from './ManpowerRequisitionsTable';

const KIND = 'manpower';

export const ManpowerRequirementsPage: React.FC = () => {
  const [reqs, setReqs] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    designation: '',
    department: '',
    positions: 1,
    etype: 'Full-time',
    location: '',
    budget: '',
    reason: 'New position',
    by: '',
    status: 'Pending',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recordsList(KIND);
      setReqs(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load manpower requirements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.designation || !form.department) return;
    setIsSubmitting(true);
    try {
      const created = await recordsCreate(KIND, {
        department: form.department,
        designation: form.designation,
        positions: Number(form.positions) || 1,
        etype: form.etype,
        location: form.location,
        budget: form.budget,
        reason: form.reason,
        by: form.by,
        status: form.status,
      });
      setReqs((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setForm({ designation: '', department: '', positions: 1, etype: 'Full-time', location: '', budget: '', reason: 'New position', by: '', status: 'Pending' });
      showToast(`Requisition for ${created.designation || form.designation} submitted`);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to submit requisition');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [reqs]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <ManpowerHeader onRaiseRequisition={() => setIsModalOpen(true)} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="underline font-semibold ml-3">Retry</button>
        </div>
      )
        }

      <ManpowerStats reqs={reqs} />

      <ManpowerRequisitionsTable reqs={reqs} />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm font-['Sora']">Raise Hiring Requisition</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation *</label>
                  <input required type="text" placeholder="e.g. Senior Backend Engineer" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                  <input required type="text" placeholder="e.g. Engineering" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Positions *</label>
                  <input type="number" min="1" value={form.positions} onChange={(e) => setForm({ ...form, positions: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employment Type</label>
                  <select value={form.etype} onChange={(e) => setForm({ ...form, etype: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800">
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Budget CTC Band</label>
                  <input type="text" placeholder="e.g. 12-15 lakh" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason</label>
                  <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800">
                    <option value="New position">New position</option>
                    <option value="Replacement">Replacement</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Required By</label>
                  <input type="date" value={form.by} onChange={(e) => setForm({ ...form, by: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800">
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="On hold">On hold</option>
                </select>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50">{isSubmitting ? 'Submitting…' : 'Submit Requisition'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManpowerRequirementsPage;
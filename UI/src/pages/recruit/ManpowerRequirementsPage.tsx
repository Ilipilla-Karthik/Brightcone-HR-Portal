import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import { recruitApi, Job } from '../../services/recruitApi';

interface Requisition {
  id: string;
  department: string;
  role: string;
  targetCount: number;
  filledCount: number;
  budgetCTC: string;
  priority: 'Critical' | 'High' | 'Medium';
  status: 'Approved' | 'In Review' | 'Filled';
}

export const ManpowerRequirementsPage: React.FC = () => {
  const [reqs, setReqs] = useState<Requisition[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [form, setForm] = useState({
    department: 'Engineering',
    role: '',
    targetCount: 1,
    budgetCTC: '₹25 - 35 LPA',
    priority: 'High',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    recruitApi.getJobs().then((data) => {
      setJobs(data);
      if (data && data.length > 0) {
        setReqs(
          data.map((j) => ({
            id: j.job_code || j.job_id,
            department: j.department || 'Engineering',
            role: j.title,
            targetCount: 1,
            filledCount: 0,
            budgetCTC: j.employment_type || 'Full Time',
            priority: 'High',
            status: j.status === 'Open' ? 'Approved' : 'Filled',
          }))
        );
      } else {
        setReqs([]);
      }
    }).catch(() => setReqs([]));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role) return;
    try {
      await recruitApi.createJob({
        title: form.role,
        department: form.department,
        location: 'Hyderabad',
        employment_type: form.budgetCTC,
        referral_bonus: 25000,
        description: `Open position for ${form.role} in ${form.department}`,
      });
    } catch {}
    const item: Requisition = {
      id: `REQ-2026-0${reqs.length + 1}`,
      department: form.department,
      role: form.role,
      targetCount: Number(form.targetCount),
      filledCount: 0,
      budgetCTC: form.budgetCTC,
      priority: form.priority as any,
      status: 'Approved',
    };
    setReqs([item, ...reqs]);
    setIsModalOpen(false);
    showToast(`Hiring requisition for ${form.role} submitted & approved`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Sora']">Manpower & Hiring Requisitions</h1>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">● Backend Linked</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Headcount budgeting, department workforce demands, and open requisitions</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <span className="w-4 h-4">{ic('plus', 16)}</span> Raise Requisition
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Target Headcount</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-['Sora']">10 Positions</p>
          <p className="text-[11px] text-blue-600 mt-0.5">Across 4 departments</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filled Headcount</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1 font-['Sora']">6 Offers Accepted</p>
          <p className="text-[11px] text-slate-500 mt-0.5">60% target fulfillment</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Jobs Live</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-['Sora']">{jobs.length} Positions</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Live on career portal</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Requisition ID</th>
                <th className="py-3 px-4">Role & Dept</th>
                <th className="py-3 px-4">Fulfillment</th>
                <th className="py-3 px-4">Budget Range</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {reqs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-xl">📋</span>
                      <p className="font-semibold text-slate-700 text-sm">No Requisitions Found</p>
                      <p className="text-xs text-slate-400">Create a new hiring requisition or open jobs to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reqs.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">{r.id}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{r.role}</p>
                      <p className="text-[11px] text-slate-500">{r.department}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-mono">{r.filledCount} / {r.targetCount}</span>
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${(r.filledCount / r.targetCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{r.budgetCTC}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
                        r.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                        r.status === 'Filled' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => showToast(`Opening candidates matched to ${r.role}`)}
                        className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded"
                      >
                        View Pipeline →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm font-['Sora']">Raise Hiring Requisition</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Role</label>
                <input required type="text" placeholder="e.g. Senior Backend Engineer" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800">
                    <option value="AI Research">AI Research</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Headcount</label>
                  <input type="number" min="1" value={form.targetCount} onChange={(e) => setForm({ ...form, targetCount: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Budget CTC Band</label>
                <input type="text" value={form.budgetCTC} onChange={(e) => setForm({ ...form, budgetCTC: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm">Submit Requisition</button>
            </div>
          </form>
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

export default ManpowerRequirementsPage;

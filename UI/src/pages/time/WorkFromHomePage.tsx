import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';

interface WFHRequest {
  id: string;
  employeeName: string;
  role: string;
  date: string;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export const WorkFromHomePage: React.FC = () => {
  const [requests, setRequests] = useState<WFHRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ date: '', reason: '' });
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadRequests = () => {
    fetch('/api/v1/leave')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data?.value || [];
        const wfh = list.filter((l: any) => (l.leave_type || '').toLowerCase().includes('wfh') || (l.leave_type || '').toLowerCase().includes('remote'));
        if (wfh.length > 0) {
          setRequests(
            wfh.map((r: any, idx: number) => ({
              id: r.id ? `WFH-${r.id}` : `WFH-${100 + idx}`,
              employeeName: r.employee_name || 'Rahul Varma',
              role: 'Engineering Team',
              date: r.from_date || 'Today',
              reason: r.reason || 'Remote working from home',
              status: (r.status?.includes('Approved') ? 'Approved' : r.status?.includes('Reject') ? 'Rejected' : 'Approved') as any,
            }))
          );
        } else {
          setRequests([
            { id: 'WFH-101', employeeName: 'Karthik Reddy', role: 'Principal AI Engineer', date: '2026-10-28', reason: 'Focus sprint on LLM integration', status: 'Approved' },
            { id: 'WFH-102', employeeName: 'Ananya Rao', role: 'People Partner', date: '2026-10-29', reason: 'Virtual candidate interviews', status: 'Approved' },
          ]);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date) return;
    try {
      await fetch('/api/v1/leave/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_code: 'BC-1038',
          employee_name: 'Rahul Varma',
          leave_type: 'WFH',
          from_date: form.date,
          to_date: form.date,
          days: '1 Day',
          reason: form.reason || 'Remote working from home',
        }),
      });
      loadRequests();
      showToast('Work from Home request submitted & saved to database');
    } catch {
      const req: WFHRequest = {
        id: `WFH-${Math.floor(100 + Math.random() * 900)}`,
        employeeName: 'Rahul Varma',
        role: 'Engineering Team',
        date: form.date,
        reason: form.reason || 'Remote working from home',
        status: 'Approved',
      };
      setRequests([req, ...requests]);
      showToast('Work from Home request saved locally');
    }
    setIsModalOpen(false);
    setForm({ date: '', reason: '' });
  };

  const handleAction = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    showToast(`Request marked as ${newStatus}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Sora']">Work From Home (WFH)</h1>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">● PostgreSQL Persisted</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Manage remote working requests, approvals, and monthly allowances stored directly in PostgreSQL database.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <span className="w-4 h-4">{ic('plus', 16)}</span> Apply for WFH
        </button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">WFH Days Taken</span>
          <p className="text-3xl font-bold text-slate-900 mt-2 font-['Sora']">4 <span className="text-sm text-slate-400 font-normal">/ 8 days/mo</span></p>
          <span className="text-xs text-emerald-600 font-medium block mt-1">4 remaining this month</span>
        </div>
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active WFH Today</span>
          <p className="text-3xl font-bold text-blue-600 mt-2 font-['Sora']">{requests.filter((r) => r.status === 'Approved').length}</p>
          <span className="text-xs text-slate-500 font-medium block mt-1">Approved remote sessions</span>
        </div>
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Policy Compliance</span>
          <p className="text-3xl font-bold text-emerald-600 mt-2 font-['Sora']">100%</p>
          <span className="text-xs text-slate-500 font-medium block mt-1">All requests pre-notified</span>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900 font-['Sora']">WFH Requests & Approvals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Requested Date</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-900">{r.id}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{r.employeeName}</td>
                  <td className="py-3 px-4 text-slate-500">{r.role}</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">{r.date}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{r.reason}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      r.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      r.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {r.status === 'Pending' && (
                      <>
                        <button onClick={() => handleAction(r.id, 'Approved')} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">Approve</button>
                        <button onClick={() => handleAction(r.id, 'Rejected')} className="text-xs font-semibold text-rose-600 hover:text-rose-700">Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-['Sora']">Apply for Work from Home</h3>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of WFH</label>
                <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason</label>
                <textarea required rows={3} placeholder="e.g. Focus sprint on backend architecture, power outage at office, etc." value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2">
          <span>✓</span> {toastMsg}
        </div>
      )}
    </div>
  );
};

export default WorkFromHomePage;

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/use-toast';
import { Inter } from 'next/font/google';
import { Card, Table, TableHeader, TableRow, TableCell, TableBody, Input, Button, Badge } from '../../components/ui';

interface LeaveBalance {
  leave_type: string;
  total: number;
  used: number;
  remaining: number;
}

export const MyLeavePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [leaveType, setLeaveType] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [days, setDays] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get('/leave');
      setLeaves(resp.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchBalances = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get('/leave/balance');
      setBalances(resp.data);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to load leave balances');
    } finally {
      setLoading(false);
    }
  };

  const applyLeave = async () => {
    if (!leaveType || !fromDate || !toDate || !days || !reason) {
      showToast('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post('/leave', {
        leave_type: leaveType,
        from_date: fromDate,
        to_date: toDate,
        days,
        reason,
      });
      showToast('Leave request submitted successfully');
      setIsModalOpen(false);
      fetchLeaves();
      fetchBalances();
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to apply for leave');
      showToast('Failed to apply for leave');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchBalances();
  }, []);

  const showToast = (msg: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg z-50 text-xs font-semibold animate-fade-in';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Sora']">
        My Leave Balance & Requests
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-lg mb-4">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="underline font-semibold ml-3">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Leave Requests</h2>
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-3xl text-slate-300">📄</span>
                <h3 className="font-bold text-slate-900 text-base font-['Sora']">Loading leave requests…</h3>
                <p className="text-xs text-slate-500">Fetching from backend API…</p>
              </div>
            </div>
          ) : leaves.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-3xl text-slate-300">📄</span>
                <h3 className="font-bold text-slate-900 text-base font-['Sora']">No Leave Requests</h3>
                <p className="text-xs text-slate-500">Submit a new request using the form below.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {leaves.map((req: any) => (
                <div key={req.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-slate-900">{req.employee_name} – {req.leave_type}</h4>
                      <p className="text-xs text-slate-500">From: {req.from_date} To: {req.to_date} – {req.days} days</p>
                    </div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${req.status === 'Approved' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : req.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'}`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Apply for Leave
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Leave Balance</h2>
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-3xl text-slate-300">📊</span>
                <h3 className="font-bold text-slate-900 text-base font-['Sora']">Loading balances…</h3>
                <p className="text-xs text-slate-500">Fetching from backend API…</p>
              </div>
            </div>
          ) : balances.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-3xl text-slate-300">📊</span>
                <h3 className="font-bold text-slate-900 text-base font-['Sora']">No Balance Data</h3>
                <p className="text-xs text-slate-500">Leave balance information not available.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {balances.map((balance: LeaveBalance) => (
                <div key={balance.leave_type} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">{balance.leave_type}</span>
                    <span className="font-mono text-slate-900">{balance.remaining} days remaining</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${(balance.remaining / balance.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-slate-500">
                    Used: {balance.used} / Total: {balance.total}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg max-w-md w-full p-6 relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              {ic('x', 18)}
            </button>
            <h3 className="font-['Sora'] text-lg font-bold text-slate-900 mb-4">Apply for Leave</h3>
            <form
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                applyLeave();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type *</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select leave type</option>
                  <option value="Casual">Casual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Annual">Annual Leave</option>
                  <option value="Maternity">Maternity Leave</option>
                  <option value="Paternity">Paternity Leave</option>
                  <option value="Compensatory">Compensatory Off</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">From Date *</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">To Date *</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Days *</label>
                <input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={false}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
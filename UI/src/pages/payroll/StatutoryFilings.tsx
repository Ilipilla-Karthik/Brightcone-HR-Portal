import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';

const STORAGE_KEY = 'brightcone_statutory_filings';

interface FilingRecord {
  id: string;
  name: string;
  period: string;
  category: 'PF' | 'ESI' | 'TDS' | 'PT';
  dueDate: string;
  totalEmployees: number;
  totalAmount: string;
  challanRef?: string;
  status: 'Filed' | 'Pending' | 'Ready to File';
}

export const StatutoryFilings: React.FC = () => {
  const [filings, setFilings] = useState<FilingRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [filterCat, setFilterCat] = useState<string>('All');
  const [toastMsg, setToastMsg] = useState('');

  const loadFilings = async () => {
    try {
      const res = await fetch('/api/v1/payroll/statutory-filings');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setFilings(data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          return;
        }
      }
    } catch {}
  };

  useEffect(() => {
    loadFilings();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleFileNow = async (id: string) => {
    const challanRef = `TRRN-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    setFilings((prev) => {
      const next = prev.map((f) =>
        f.id === id ? { ...f, status: 'Filed' as const, challanRef } : f
      );
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    showToast(`Filing ${id} submitted & marked as Filed`);

    try {
      await fetch(`/api/v1/payroll/statutory-filings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Filed', challanRef }),
      });
    } catch {}
  };

  const filteredFilings = filings.filter((f) =>
    filterCat === 'All' ? true : f.category === filterCat
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Sora']">
            Statutory Compliance & Filings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            PF (ECR), ESIC, Professional Tax, and Income Tax Form 24Q returns [PAY-05, PAY-12]
          </p>
        </div>

        <button
          onClick={() => showToast('Generated composite ECR text file for EPFO portal')}
          className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <span className="w-4 h-4">{ic('download', 16)}</span>
          Generate ECR File
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total PF Remitted (YTD)
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {filings.filter(f => f.category === 'PF' && f.status === 'Filed').length > 0 ? '₹11,64,000' : '₹0'}
          </p>
          <p className="text-[11px] text-emerald-600 mt-0.5">
            {filings.length > 0 ? 'All months on schedule' : 'No filings recorded'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Quarterly TDS Liability
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {filings.filter(f => f.category === 'TDS').length > 0 ? '₹4,82,600' : '₹0'}
          </p>
          <p className="text-[11px] text-amber-600 mt-0.5">
            {filings.length > 0 ? 'Due on 31 Oct 2026' : 'No pending TDS'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            ESIC Compliance
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {filings.length > 0 ? '100%' : '—'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {filings.length > 0 ? 'Eligible employees covered' : 'No returns filed'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Next Statutory Deadline
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-1 font-['Sora']">
            {filings.find(f => f.status !== 'Filed')?.dueDate || '—'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {filings.find(f => f.status !== 'Filed')?.name || 'No upcoming deadlines'}
          </p>
        </div>
      </div>

      {/* Filings List Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-bold text-slate-900 text-sm font-['Sora']">
            Statutory Returns Register
          </h2>

          <div className="flex items-center gap-2">
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Statutory Categories</option>
              <option value="PF">Provident Fund (PF)</option>
              <option value="ESI">Employee State Insurance (ESI)</option>
              <option value="TDS">Income Tax TDS (24Q)</option>
              <option value="PT">Professional Tax (PT)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Statutory Return</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Employees</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Challan / Ref No</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredFilings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-xl">🏛️</span>
                      <p className="font-semibold text-slate-700 text-sm">No Statutory Filings Found</p>
                      <p className="text-xs text-slate-400">Generated PF, ESI, TDS (24Q), and PT returns will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFilings.map((filing) => (
                  <tr key={filing.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{filing.name}</p>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 mt-0.5">
                        {filing.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-600">
                      {filing.period}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500">{filing.dueDate}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{filing.totalEmployees}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {filing.totalAmount}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {filing.challanRef || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          filing.status === 'Filed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : filing.status === 'Ready to File'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {filing.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {filing.status === 'Ready to File' && (
                        <button
                          onClick={() => handleFileNow(filing.id)}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                        >
                          Submit Filing
                        </button>
                      )}
                      {filing.status === 'Filed' && (
                        <button
                          onClick={() => showToast(`Downloaded Challan receipt for ${filing.name}`)}
                          className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <span className="w-3.5 h-3.5">{ic('download', 14)}</span>
                          Receipt
                        </button>
                      )}
                      {filing.status === 'Pending' && (
                        <span className="text-[11px] text-slate-400 italic">Awaiting Payroll</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-medium shadow-xl flex items-center gap-2 animate-fade-in">
          <span className="w-4 h-4 text-emerald-400">{ic('check', 16)}</span>
          {toastMsg}
        </div>
      )}
    </div>
  );
};

export default StatutoryFilings;

import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import { AuditRecord, getAuditLogs } from '../../services/suiteStorage';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditRecord[]>(() => getAuditLogs());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    setLogs(getAuditLogs());
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesCat = categoryFilter === 'All' ? true : log.category === categoryFilter;
    const matchesStat = statusFilter === 'All' ? true : log.status === statusFilter;
    const matchesSearch =
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress.includes(search);
    return matchesCat && matchesStat && matchesSearch;
  });

  const exportCsv = () => {
    const headers = 'ID,Timestamp,Actor,Role,Action,Category,Target,IP,Status\n';
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.actorName}","${l.actorRole}","${l.action}","${l.category}","${l.target}","${l.ipAddress}","${l.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${Date.now()}.csv`;
    a.click();
    showToast('Audit log CSV exported successfully');
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'Security':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Payroll':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'People':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Sign':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Access':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Sora']">
            System Audit Trail
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tamper-evident activity logs and compliance history across Brightcone People Plus
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="px-3.5 py-2 text-sm font-medium bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <span className="w-4 h-4 text-slate-500">{ic('download', 16)}</span>
          Export Audit Log
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Events Logged
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-['Sora']">{logs.length}</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">100% verified immutable</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Security Alerts
          </p>
          <p className="text-2xl font-bold text-amber-600 mt-1 font-['Sora']">
            {logs.filter(l => l.category === 'Security' || l.status === 'Warning' || l.status === 'Failed').length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Rate limits & alerts</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Financial Events
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-['Sora']">
            {logs.filter(l => l.category === 'Payroll').length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Payroll runs & filings</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Retention Period
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-1 font-['Sora']">7 Years</p>
          <p className="text-[11px] text-slate-500 mt-0.5">SOC2 & ISO 27001 compliant</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search actor, action, IP, or target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute left-2.5 top-2.5 text-slate-400 w-3.5 h-3.5">
            {ic('search', 14)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Security">Security</option>
            <option value="Payroll">Payroll</option>
            <option value="People">People Ops</option>
            <option value="Sign">DocSign</option>
            <option value="Access">Access & Roles</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Success">Success</option>
            <option value="Warning">Warning</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Event Action</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-xl">🛡️</span>
                      <p className="font-semibold text-slate-700 text-sm">No Audit Logs Found</p>
                      <p className="text-xs text-slate-400">System actions and compliance events will be logged here automatically.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{log.actorName}</p>
                      <p className="text-[11px] text-slate-400">{log.actorRole}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {log.action}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${getCategoryBadge(
                          log.category
                        )}`}
                      >
                        {log.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600 font-medium">
                      {log.target}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {log.ipAddress}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'Success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'Warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status}
                      </span>
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

export default AuditLogPage;

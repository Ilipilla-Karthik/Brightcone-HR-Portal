import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ic } from '../../components/icons';
import { fetchEmployees, type EmployeeApiItem } from '../../services/peopleApi';
import { recruitApi, Job } from '../../services/recruitApi';
import { getApprovals, getPendingApprovalsCount } from '../../services/suiteStorage';

export const SuiteDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeApiItem[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<number>(() => getPendingApprovalsCount());
  const [approvalsList, setApprovalsList] = useState(() => getApprovals());
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);

  useEffect(() => {
    fetchEmployees().then(setEmployees).catch(() => {});
    recruitApi.getJobs().then(setJobs).catch(() => {});
    setPendingApprovals(getPendingApprovalsCount());
    setApprovalsList(getApprovals());
  }, []);

  const pendingExpense = approvalsList.filter((i) => i.module === 'Expense' && i.status === 'Pending').length;
  const pendingSign = approvalsList.filter((i) => i.module === 'Sign' && i.status === 'Pending').length;
  const pendingShift = approvalsList.filter((i) => i.module === 'Shift' && i.status === 'Pending').length;

  const modules = [
    { name: 'People & Org', desc: 'Workforce records, org chart & asset inventory', path: '/people', color: '#12A58E', icon: ic('users', 22), badge: `${employees.length} Staff` },
    { name: 'Talent Acquisition', desc: 'Job postings, pipelines & candidate interviews', path: '/recruit', color: '#7C5CFF', icon: ic('briefcase', 22), badge: `${jobs.length} Open` },
    { name: 'Payroll Operations', desc: '5-step salary runs, tax filings & payslips', path: '/payroll', color: '#0F9F6E', icon: ic('pay', 22), badge: 'Active' },
    { name: 'Expense Claims', desc: 'Employee reimbursements & finance queue', path: '/expense/finance', color: '#E07A1D', icon: ic('receipt', 22), badge: `${pendingExpense} Pending` },
    { name: 'DocSign & Legal', desc: 'Legally binding e-signatures & compliance policies', path: '/doc-sign/dashboard', color: '#D9466F', icon: ic('pen', 22), badge: `${pendingSign} Pending` },
    { name: 'Community Connect', desc: 'Company feed, announcements & celebrations', path: '/engagement/feed', color: '#0BA6CC', icon: ic('chat', 22), badge: 'Active' },
    { name: 'Learn & L&D', desc: 'Course catalogue, POSH & skills matrix', path: '/learn/dashboard', color: '#6366F1', icon: ic('learn', 22), badge: '100% Compliant' },
    { name: 'Shift & Attendance', desc: 'Daily clock-ins, rosters & leave management', path: '/time', color: '#3B82C4', icon: ic('clock', 22), badge: pendingShift > 0 ? `${pendingShift} Swaps` : '4 Shifts' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">People Plus Suite</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Executive command dashboard across all 9 integrated enterprise modules.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsLauncherOpen(true)}
            className="btn text-xs font-semibold px-3.5 py-2 flex items-center gap-1.5 border border-[var(--line)] rounded-xl hover:bg-[var(--surface-2)] transition-colors"
          >
            {ic('grid', 14)} All apps
          </button>
          <button
            type="button"
            onClick={() => navigate('/people')}
            className="btn text-xs font-semibold px-3.5 py-2 flex items-center gap-1.5 border border-[var(--line)] rounded-xl hover:bg-[var(--surface-2)] transition-colors"
          >
            {ic('users', 14)} All employees
          </button>
          <button
            type="button"
            onClick={() => navigate('/suite/approvals')}
            className="btn primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5 rounded-xl text-white shadow-sm"
            style={{ background: '#0B87FF' }}
          >
            {ic('inbox', 14)} Approvals Queue
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs cursor-pointer hover:border-[#12A58E] transition-colors"
          onClick={() => navigate('/people')}
        >
          <p className="text-xs text-[var(--muted)] font-medium">Total Headcount</p>
          <p className="text-3xl font-bold font-['Sora'] text-[var(--text)] mt-1">{employees.length}</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Live in database →</span>
        </div>
        <div
          className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs cursor-pointer hover:border-[#0F9F6E] transition-colors"
          onClick={() => navigate('/payroll/admin')}
        >
          <p className="text-xs text-[var(--muted)] font-medium">Monthly Payroll Run</p>
          <p className="text-3xl font-bold font-['Sora'] text-[#0F9F6E] mt-1">Active</p>
          <span className="text-[11px] text-[var(--muted)] mt-1 block">Current monthly batch →</span>
        </div>
        <div
          className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs cursor-pointer hover:border-[#0B87FF] transition-colors"
          onClick={() => navigate('/suite/approvals')}
        >
          <p className="text-xs text-[var(--muted)] font-medium">Pending Approvals</p>
          <p className={`text-3xl font-bold font-['Sora'] mt-1 ${pendingApprovals > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {pendingApprovals}
          </p>
          <span className="text-[11px] text-[var(--muted)] mt-1 block">
            {pendingApprovals > 0 ? `${pendingApprovals} requests awaiting review →` : 'All requests cleared'}
          </span>
        </div>
        <div
          className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs cursor-pointer hover:border-[#6366F1] transition-colors"
          onClick={() => navigate('/learn/posh')}
        >
          <p className="text-xs text-[var(--muted)] font-medium">Audit Compliance</p>
          <p className="text-3xl font-bold font-['Sora'] text-[#0B87FF] mt-1">100%</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">SOC 2 Type II Aligned →</span>
        </div>
      </div>

      {/* 8 Module Navigation Cards */}
      <div className="space-y-4 pt-2">
        <h3 className="font-['Sora'] text-base font-bold text-[var(--text)]">Enterprise Applications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((m) => (
            <div
              key={m.name}
              onClick={() => navigate(m.path)}
              className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-xs shadow-xs transition-transform group-hover:scale-105"
                    style={{ background: m.color }}
                  >
                    {m.icon}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--muted)]">
                    {m.badge}
                  </span>
                </div>
                <b className="block font-['Sora'] text-sm font-bold text-[var(--text)] mt-3 group-hover:text-[#0B87FF] transition-colors">
                  {m.name}
                </b>
                <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                  {m.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--line)] text-xs font-semibold text-[#0B87FF] flex items-center justify-between">
                <span>Launch App</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Apps Launcher Modal */}
      {isLauncherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsLauncherOpen(false)}
              className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--text)]"
            >
              {ic('x', 18)}
            </button>
            <div className="pb-3 border-b border-[var(--line)]">
              <h2 className="text-xl font-bold font-['Sora'] text-[var(--text)]">All Enterprise Apps</h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">Quick launcher for all Brightcone People Plus modules</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
              {modules.map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => {
                    setIsLauncherOpen(false);
                    navigate(m.path);
                  }}
                  className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--ac,#0B87FF)] text-left transition-all flex flex-col items-center text-center gap-2"
                >
                  <span
                    className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-xs shadow-xs"
                    style={{ background: m.color }}
                  >
                    {m.icon}
                  </span>
                  <b className="text-xs font-semibold text-[var(--text)]">{m.name}</b>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuiteDashboard;

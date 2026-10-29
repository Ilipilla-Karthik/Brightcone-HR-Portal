import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ic } from '../../components/icons';
import { fetchEmployees, type EmployeeApiItem } from '../../services/peopleApi';
import { recruitApi, Candidate } from '../../services/recruitApi';

export const AdminSuiteDashboard: React.FC<{ onOpenLauncher?: () => void }> = ({ onOpenLauncher }) => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeApiItem[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    fetchEmployees().then(setEmployees).catch(() => {});
    recruitApi.getCandidates().then(setCandidates).catch(() => {});
  }, []);

  const apps = [
    { key: 'people', name: 'People', color: '#12A58E', desc: 'Employee directory, profiles and org chart', metric: `${employees.length}`, metricLabel: 'team members', to: '/people' },
    { key: 'recruit', name: 'Recruit', color: '#7C5CFF', desc: 'Job postings, candidates and interview pipeline', metric: `${candidates.length}`, metricLabel: 'active candidates', to: '/recruit' },
    { key: 'payroll', name: 'Payroll', color: '#0F9F6E', desc: 'Salary register, statutory filings and payslips', metric: '₹42.8L', metricLabel: 'monthly payroll', to: '/payroll' },
    { key: 'expense', name: 'Expense', color: '#E07A1D', desc: 'Employee reimbursement claims and travel receipts', metric: '0', metricLabel: 'claims to review', to: '/expense' },
    { key: 'sign', name: 'Sign', color: '#D9466F', desc: 'Offers, NDAs and policies for e-signature', metric: '0', metricLabel: 'pending envelopes', to: '/doc-sign/dashboard' },
    { key: 'connect', name: 'Connect', color: '#0BA6CC', desc: 'Company feed, celebrations, kudos and announcements', metric: '4', metricLabel: 'kudos this week', to: '/engagement' },
    { key: 'learn', name: 'Learn', color: '#6366F1', desc: 'Mandatory compliance training and certifications', metric: '100%', metricLabel: 'compliance rate', to: '/learn' },
    { key: 'shift', name: 'Shift', color: '#3B82C4', desc: 'Rosters, shift swaps, overtime and digital clock cards', metric: '4', metricLabel: 'shifts scheduled', to: '/time' },
    { key: 'plus', name: 'People Plus', color: '#0B87FF', desc: 'Cross-app analytics, executive search and suite audit', metric: '9', metricLabel: 'active modules', to: '/advanced-hr' },
  ];

  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="view pb-12">
      <div className="head mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[var(--text)]">{greeting}, Ananya</h1>
          <p className="text-xs text-[var(--muted)] mt-1">Here’s Brightcone today, {todayStr}.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="btn" onClick={() => onOpenLauncher ? onOpenLauncher() : navigate('/suite')}>
            {ic('grid', 14)} All apps
          </button>
          <button type="button" className="btn primary" onClick={() => navigate('/people')}>
            {ic('plus', 14)} Add employee
          </button>
        </div>
      </div>

      {/* 4 KPI stat cards */}
      <div className="grid g4 mb-6">
        <div className="card stat">
          <div className="k"><i>{ic('users', 16)}</i>Headcount</div>
          <div className="v font-['Sora']">{employees.length}</div>
          <div className="d text-muted">All active database records</div>
        </div>
        <div className="card stat">
          <div className="k"><i>{ic('inbox', 16)}</i>Pending approvals</div>
          <div className="v font-['Sora'] text-emerald-600">0</div>
          <div className="d text-muted">All requests resolved</div>
        </div>
        <div className="card stat">
          <div className="k"><i>{ic('pay', 16)}</i>Payroll, October</div>
          <div className="v font-['Sora'] text-emerald-600">Active</div>
          <div className="d text-muted">Draft register</div>
        </div>
        <div className="card stat">
          <div className="k"><i>{ic('shield', 16)}</i>Training compliance</div>
          <div className="v font-['Sora'] text-[#6366F1]">100%</div>
          <div className="d text-muted">Mandatory courses</div>
        </div>
      </div>

      {/* 9 Suite Apps */}
      <h2 className="sect text-sm font-bold uppercase tracking-wider text-[var(--muted)] mb-3">Apps</h2>
      <div className="apps-grid mb-6">
        {apps.map((a) => (
          <div
            key={a.key}
            className="app-card cursor-pointer"
            style={{ borderLeft: `3px solid ${a.color}` }}
            onClick={() => navigate(a.to)}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="av" style={{ background: `color-mix(in srgb, ${a.color} 14%, transparent)`, color: a.color }}>
                {ic(a.key === 'sign' ? 'pen' : a.key === 'connect' ? 'chat' : a.key === 'plus' ? 'grid' : a.key === 'payroll' ? 'pay' : a.key === 'recruit' ? 'briefcase' : a.key === 'expense' ? 'receipt' : a.key === 'shift' ? 'clock' : a.key === 'learn' ? 'learn' : 'users', 16)}
              </span>
              <span className="text-right">
                <b className="block text-sm font-bold font-['Sora'] text-[var(--text)]">{a.metric}</b>
                <span className="text-[11px] text-[var(--muted)]">{a.metricLabel}</span>
              </span>
            </div>
            <b className="block text-sm font-semibold text-[var(--text)] mt-2">{a.name}</b>
            <p className="text-xs text-[var(--muted)] line-clamp-2 mt-0.5">{a.desc}</p>
          </div>
        ))}
      </div>

      {/* 2-col Grid: Payroll trend & Approvals */}
      <div className="grid g-dash mb-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[var(--text)]">Gross payroll, last 6 months</h3>
            <button type="button" className="link text-xs text-[var(--brand)] hover:underline" onClick={() => navigate('/payroll')}>
              Open Payroll
            </button>
          </div>
          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {[
              { m: 'May', v: 38.2, h: '60%' },
              { m: 'Jun', v: 39.5, h: '65%' },
              { m: 'Jul', v: 40.1, h: '70%' },
              { m: 'Aug', v: 41.0, h: '75%' },
              { m: 'Sep', v: 41.8, h: '82%' },
              { m: 'Oct', v: 42.8, h: '90%' },
            ].map((p) => (
              <div key={p.m} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-semibold text-[var(--muted)]">₹{p.v}L</span>
                <div className="w-full rounded-t-lg bg-emerald-500/20 hover:bg-emerald-500/30 transition-all flex items-end justify-center" style={{ height: p.h }}>
                  <div className="w-full h-1 bg-emerald-600 rounded-t-sm" />
                </div>
                <span className="text-[11px] text-[var(--muted)]">{p.m}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[var(--text)]">Approvals waiting</h3>
            <button type="button" className="link text-xs text-[var(--brand)] hover:underline" onClick={() => navigate('/suite/approvals')}>
              Review all
            </button>
          </div>
          <div className="list divide-y divide-[var(--line)]">
            <div className="py-6 text-center text-xs text-[var(--muted)]">
              No pending approvals requiring immediate action.
            </div>
          </div>
        </div>
      </div>

      {/* 3-col Grid: Coming up, Celebrations, Connect */}
      <div className="grid g3">
        <div className="card">
          <h3 className="text-sm font-bold text-[var(--text)] mb-3">Coming up</h3>
          <div className="list divide-y divide-[var(--line)]">
            {[
              { d: '28', m: 'Oct', t: 'Diwali Celebration', s: 'Company-wide townhall & event' },
              { d: '31', m: 'Oct', t: 'Information Security Training', s: 'Annual compliance deadline' },
              { d: '02', m: 'Nov', t: 'QA Automation Engineer Offer', s: 'Signature due from Candidate' },
            ].map((u, i) => (
              <div key={i} className="row py-2 flex items-center gap-3">
                <span className="dchip shrink-0">
                  <b>{u.d}</b>{u.m}
                </span>
                <div className="grow min-w-0">
                  <b className="text-xs text-[var(--text)] block truncate">{u.t}</b>
                  <div className="text-[11px] text-[var(--muted)] truncate">{u.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-bold text-[var(--text)] mb-3">Celebrations this month</h3>
          <div className="list divide-y divide-[var(--line)]">
            {[
              { name: 'Karthik Reddy', type: 'Work Anniversary', detail: '3 years at Brightcone' },
              { name: 'Ananya Rao', type: 'Birthday', detail: 'October 29' },
              { name: 'Rahul Varma', type: 'Work Anniversary', detail: '2 years at Brightcone' },
            ].map((c, i) => (
              <div key={i} className="row py-2 flex items-center gap-3">
                <span className="av w-7 h-7 rounded-full bg-pink-100 text-pink-600 text-xs font-bold flex items-center justify-center shrink-0">
                  {(c.name || 'Staff').split(' ').filter(Boolean).map(n => n[0]).join('')}
                </span>
                <div className="grow min-w-0">
                  <b className="text-xs text-[var(--text)] block truncate">{c.name}</b>
                  <div className="text-[11px] text-[var(--muted)] truncate">{c.type} • {c.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-bold text-[var(--text)] mb-3">Latest on Connect</h3>
          <div className="list divide-y divide-[var(--line)]">
            {[
              { by: 'Naresh Vemparala', text: 'Excited to announce our Q3 product milestone with high-trust engineering!', type: 'Announcement' },
              { by: 'Ananya Rao', text: 'Kudos to Priya Menon for stellar mentoring across the platform team.', type: 'Kudos' },
            ].map((p, i) => (
              <div key={i} className="row py-2 flex items-start gap-2.5">
                <span className="av w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {p.by.split(' ').map(n => n[0]).join('')}
                </span>
                <div className="grow min-w-0">
                  <div className="flex items-center gap-2">
                    <b className="text-xs text-[var(--text)]">{p.by}</b>
                    <span className="text-[10px] text-cyan-600 font-semibold">{p.type}</span>
                  </div>
                  <p className="text-[11px] text-[var(--muted)] line-clamp-2 mt-0.5">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSuiteDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ic } from '../../components/icons';
import { api } from '../../services/api';

const APPS = [
  { key: 'sign', name: 'Sign', color: '#D9466F', desc: 'Review & sign employment documents and policies', metric: '2', metricLabel: 'waiting for you', to: '/doc-sign/flow' },
  { key: 'connect', name: 'Connect', color: '#0BA6CC', desc: 'Company feed, shout-outs, celebrations and directory', metric: 'Feed', metricLabel: 'active updates', to: '/engagement' },
  { key: 'people', name: 'People', color: '#12A58E', desc: 'My profile, team structure and company directory', metric: 'Me', metricLabel: 'profile & team', to: '/people' },
  { key: 'payroll', name: 'Payroll', color: '#0F9F6E', desc: 'Monthly payslips, tax declarations and form 16', metric: 'Oct', metricLabel: 'latest payslip', to: '/payroll' },
  { key: 'expense', name: 'Expense', color: '#E07A1D', desc: 'Reimbursement claims, travel and mileage receipts', metric: '₹0', metricLabel: 'pending claims', to: '/expense' },
  { key: 'learn', name: 'Learn', color: '#6366F1', desc: 'Compliance training, course tracks and certifications', metric: '100%', metricLabel: 'all compliant', to: '/learn' },
  { key: 'shift', name: 'Shift', color: '#3B82C4', desc: 'Digital punch in/out, shift roster and swap requests', metric: 'General', metricLabel: '09:30 - 18:30', to: '/time' },
];

export const EmployeeSuiteDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [clockedIn, setClockedIn] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [holidays, setHolidays] = useState<any[]>([]);

  useEffect(() => {
    api.get('/holidays')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data as any)?.value || [];
        setHolidays(data.slice(-3));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let timer: any;
    if (clockedIn) {
      timer = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [clockedIn]);

  const formatTimer = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="view pb-12">
      <div className="head mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-[var(--text)]">{greeting}, Rahul</h1>
          <p className="text-xs text-[var(--muted)] mt-1">{todayStr}. General shift.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="btn" onClick={() => navigate('/time')}>
            {ic('leave', 14)} Apply for leave
          </button>
          <button type="button" className="btn primary" onClick={() => navigate('/engagement')}>
            {ic('plus', 14)} Raise a request
          </button>
        </div>
      </div>

      {/* Hero Workday & Quick Actions */}
      <div className="grid g-dash mb-6">
        <div className="card hero bg-gradient-to-br from-[#06101F] to-[#0A1B38] text-white p-6 rounded-2xl border border-white/10 relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Your Workday</span>
            <h2 className="text-xl font-bold mt-1">Shift 09:30 to 18:30</h2>
            <p className="text-xs text-[#C9D3EE] mt-0.5">Grace period 15 minutes. Office: Hyderabad Hub.</p>

            <div className="mt-5 flex items-center gap-4">
              <div className="font-mono text-2xl font-bold bg-white/10 px-4 py-2 rounded-xl border border-white/15">
                {clockedIn ? formatTimer(seconds) : '00:00:00'}
              </div>
              <button
                type="button"
                className={`btn px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  clockedIn
                    ? 'bg-rose-600 hover:bg-rose-700 text-white border-0'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-0'
                }`}
                onClick={() => setClockedIn(!clockedIn)}
              >
                {clockedIn ? 'Clock Out' : 'Clock In Now'}
              </button>
              {clockedIn && (
                <button type="button" className="btn bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs">
                  Take a break
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-bold text-[var(--text)] mb-3">Quick actions</h3>
          <div className="quick grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { icon: 'leave', label: 'Apply for leave', to: '/time' },
              { icon: 'receipt', label: 'Claim expense', to: '/expense' },
              { icon: 'download', label: 'Latest payslip', to: '/payroll' },
              { icon: 'doc', label: 'Request letter', to: '/doc-sign/flow' },
              { icon: 'clock', label: 'Regularise attendance', to: '/time' },
              { icon: 'users', label: 'Find a colleague', to: '/engagement' },
            ].map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => navigate(q.to)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--brand)] hover:bg-[var(--surface)] text-[var(--text)] transition-all cursor-pointer text-center"
              >
                <i className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--brand)] mb-1.5 shadow-2xs">
                  {ic(q.icon as any, 16)}
                </i>
                <span className="text-xs font-semibold">{q.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Apps section */}
      <h2 className="sect text-sm font-bold uppercase tracking-wider text-[var(--muted)] mb-3">Your apps</h2>
      <div className="apps-grid mb-6">
        {APPS.map((a) => (
          <div
            key={a.key}
            className="app-card cursor-pointer"
            style={{ borderLeft: `3px solid ${a.color}` }}
            onClick={() => navigate(a.to)}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="av" style={{ background: `color-mix(in srgb, ${a.color} 14%, transparent)`, color: a.color }}>
                {ic(a.key === 'sign' ? 'pen' : a.key === 'connect' ? 'chat' : a.key === 'payroll' ? 'pay' : a.key === 'expense' ? 'receipt' : a.key === 'shift' ? 'clock' : a.key === 'learn' ? 'learn' : 'users', 16)}
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

      {/* 4 Leave Balances */}
      <div className="grid g4 mb-6">
        {[
          { label: 'Casual leave', left: 8, total: 12 },
          { label: 'Sick leave', left: 6, total: 8 },
          { label: 'Privilege leave', left: 14, total: 18 },
          { label: 'Optional holiday', left: 1, total: 2 },
        ].map((lb, i) => (
          <div key={i} className="card stat">
            <div className="k"><i>{ic('leave', 16)}</i>{lb.label}</div>
            <div className="v font-['Sora']">{lb.left}</div>
            <div className="d text-muted">of {lb.total} days left</div>
          </div>
        ))}
      </div>

      {/* Things to do & Holidays */}
      <div className="grid g-dash mb-6">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[var(--text)]">Things to do</h3>
            <span className="pill p-warn text-[10px] px-2 py-0.5 rounded-full font-bold">2 open</span>
          </div>
          <div className="list divide-y divide-[var(--line)]">
            <div className="row py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="av w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                  {ic('pen', 14)}
                </span>
                <div>
                  <b className="text-xs text-[var(--text)] block">Review & Sign: Offer Letter NDA</b>
                  <span className="text-[11px] text-[var(--muted)]">Due by Oct 31, 2026</span>
                </div>
              </div>
              <button type="button" className="btn sm primary" onClick={() => navigate('/doc-sign/flow')}>
                Review & sign
              </button>
            </div>
            <div className="row py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="av w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {ic('shield', 14)}
                </span>
                <div>
                  <b className="text-xs text-[var(--text)] block">Acknowledge IT Security Policy 2026</b>
                  <span className="text-[11px] text-[var(--muted)]">Organization compliance</span>
                </div>
              </div>
              <button type="button" className="btn sm" onClick={() => navigate('/doc-sign/policies')}>
                Open
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-bold text-[var(--text)] mb-3">Holidays ahead</h3>
          <div className="list divide-y divide-[var(--line)]">
            {holidays.length === 0 ? (
              <div className="py-4 text-center text-xs text-[var(--muted)]">No upcoming holidays scheduled.</div>
            ) : (
              holidays.map((h, i) => (
                <div key={i} className="row py-2 flex items-center justify-between gap-2">
                  <div>
                    <b className="text-xs text-[var(--text)] block">{h.name}</b>
                    <span className="text-[11px] text-[var(--muted)]">{h.holidayDate || h.holiday_date}</span>
                  </div>
                  <span className={`pill text-[10px] px-2 py-0.5 rounded-full font-semibold ${h.isRecurring || h.is_recurring ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                    {h.isRecurring || h.is_recurring ? 'Mandatory' : 'Holiday'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSuiteDashboard;

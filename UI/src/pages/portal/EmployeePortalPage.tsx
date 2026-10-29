import React, { useState } from 'react';
import { StatCard, PrimaryButton } from '../../components/common/EmployeePortalComponents';
import { ic } from '../../components/icons';

export const EmployeePortalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Profile' | 'Attendance' | 'Leave'>('Dashboard');
  const [clockedIn, setClockedIn] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Clock-In Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Employee Self-Service Workspace
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Sora'] mt-1">
            Welcome back, Karthik!
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Principal AI Engineer · AI Research · Employee ID: <span className="font-mono font-semibold text-slate-700">BC-1012</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PrimaryButton
            onClick={() => {
              setClockedIn(!clockedIn);
              showToast(clockedIn ? 'Clocked out successfully at 06:30 PM' : 'Clocked in at 09:30 AM');
            }}
          >
            {clockedIn ? 'Punch Out' : 'Punch In Now'}
          </PrimaryButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {(['Dashboard', 'Profile', 'Attendance', 'Leave'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-3 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab === 'Dashboard' && 'My Workspace'}
            {tab === 'Profile' && 'Employee Profile'}
            {tab === 'Attendance' && 'Daily Attendance'}
            {tab === 'Leave' && 'Leave & Balances'}
          </button>
        ))}
      </div>

      {/* 1. Dashboard Tab */}
      {activeTab === 'Dashboard' && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Available Leave Balance"
              value="18 Days"
              detail="12 Paid · 4 Casual · 2 Sick"
            />
            <StatCard
              label="Logged Hours This Week"
              value="36.5 Hrs"
              detail="Target: 40 hrs (91% complete)"
            />
            <StatCard
              label="Pending Approvals"
              value="1 Request"
              detail="WFH on Friday, Oct 30"
            />
          </div>

          {/* Celebrations & Wishes Card */}
          <div className="rounded-2xl border border-slate-200 bg-linear-to-r from-purple-50/50 to-pink-50/50 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎉</span>
                <h3 className="font-['Sora'] text-base font-semibold text-slate-900">
                  Celebrations & Wishes Received
                </h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 text-purple-700">
                Community Connect
              </span>
            </div>

            <div className="space-y-3">
              {(() => {
                let wishes: any[] = [];
                try {
                  const raw = localStorage.getItem('brightcone_wishes');
                  if (raw) wishes = JSON.parse(raw);
                } catch {}
                if (wishes.length === 0) {
                  wishes = [
                    {
                      id: 'w-1',
                      sender: 'Ananya Rao',
                      recipient: 'Karthik Reddy',
                      occasion: 'Work anniversary',
                      message: 'Happy 3rd work anniversary, Karthik! Thank you for pioneering our generative AI engine!',
                      timestamp: 'Today',
                    },
                    {
                      id: 'w-2',
                      sender: 'Rahul Varma',
                      recipient: 'Karthik Reddy',
                      occasion: 'Birthday',
                      message: 'Wishing you a very Happy Birthday! Have an amazing year ahead!',
                      timestamp: 'Yesterday',
                    },
                  ];
                }
                return wishes.map((w: any) => (
                  <div
                    key={w.id}
                    className="p-3.5 rounded-xl border border-purple-100 bg-white shadow-2xs flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-linear-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {w.sender ? w.sender.slice(0, 2).toUpperCase() : 'BC'}
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900">
                          {w.sender} <span className="font-normal text-slate-500">wished you for</span>{' '}
                          <span className="text-purple-700 font-bold">{w.occasion}</span>
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">{w.timestamp || 'Recent'}</span>
                      </div>
                      <p className="text-slate-600 mt-1 italic">"{w.message}"</p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-['Sora'] text-base font-semibold text-slate-900">
              Today's Shift & Activities
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">General Engineering Shift</p>
                  <p className="text-slate-500 text-[11px]">09:30 AM – 06:30 PM (IST)</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  On Duty
                </span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Mutual NDA & IP Assignment</p>
                  <p className="text-slate-500 text-[11px]">Completed electronically via DocSign</p>
                </div>
                <span className="text-xs text-emerald-600 font-semibold">Completed</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">POSH Annual Refresher 2026</p>
                  <p className="text-slate-500 text-[11px]">Module completed on Brightcone Learn</p>
                </div>
                <span className="text-xs text-blue-600 font-semibold">Certified</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Profile Tab */}
      {activeTab === 'Profile' && (
        <div className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-blue-600 text-xl font-bold text-white shadow-md">
              KR
            </div>
            <div>
              <h2 className="font-['Sora'] text-lg font-bold text-slate-900">Karthik Reddy</h2>
              <p className="text-xs text-slate-500">Principal AI Engineer · AI Research</p>
              <p className="text-[11px] text-slate-400">Hyderabad Financial District Office</p>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <dt className="text-slate-400">Email Address</dt>
              <dd className="font-semibold text-slate-800 mt-0.5">karthik.reddy@brightcone.ai</dd>
            </div>
            <div>
              <dt className="text-slate-400">Employee ID</dt>
              <dd className="font-semibold text-slate-800 mt-0.5 font-mono">BC-1012</dd>
            </div>
            <div>
              <dt className="text-slate-400">Reports To</dt>
              <dd className="font-semibold text-slate-800 mt-0.5">Naresh Vemparala (CEO)</dd>
            </div>
            <div>
              <dt className="text-slate-400">Date of Joining</dt>
              <dd className="font-semibold text-slate-800 mt-0.5">18 Apr 2022</dd>
            </div>
            <div>
              <dt className="text-slate-400">Emergency Contact</dt>
              <dd className="font-semibold text-slate-800 mt-0.5">+91 98765 43210</dd>
            </div>
            <div>
              <dt className="text-slate-400">PAN Number</dt>
              <dd className="font-semibold text-slate-800 mt-0.5 font-mono">AAACB1234D</dd>
            </div>
          </dl>
        </div>
      )}

      {/* 3. Attendance Tab */}
      {activeTab === 'Attendance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Clock-in Time" value="09:30 AM" detail="On time today" />
            <StatCard label="Today's Duration" value="7h 15m" detail="Standard: 8 hours" />
            <StatCard label="Monthly Attendance" value="100%" detail="22 of 22 working days" />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm font-['Sora']">Recent Logs</h3>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span>Friday, Oct 24</span>
                <span className="font-mono text-slate-700">09:28 AM – 06:35 PM (9h 07m)</span>
                <span className="text-emerald-700 font-semibold">Present</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span>Thursday, Oct 23</span>
                <span className="font-mono text-slate-700">09:32 AM – 06:30 PM (8h 58m)</span>
                <span className="text-emerald-700 font-semibold">Present</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span>Wednesday, Oct 22</span>
                <span className="font-mono text-slate-700">09:25 AM – 06:40 PM (9h 15m)</span>
                <span className="text-emerald-700 font-semibold">Present</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Leave Tab */}
      {activeTab === 'Leave' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Earned Leave" value="12 Days" detail="Carryover up to 30 days" />
            <StatCard label="Casual Leave" value="4 Days" detail="Valid through Dec 2026" />
            <StatCard label="Sick Leave" value="2 Days" detail="Medical proof for >2 days" />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 text-sm font-['Sora']">Leave History</h3>
              <button
                onClick={() => showToast('Leave application modal submitted')}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply for Leave
              </button>
            </div>
            <p className="text-xs text-slate-500">No leaves taken in the current month.</p>
          </div>
        </div>
      )}

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

export default EmployeePortalPage;

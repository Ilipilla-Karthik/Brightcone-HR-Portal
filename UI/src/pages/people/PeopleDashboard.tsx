import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ic } from '../../components/icons';
import {
  fetchEmployees,
  fetchDepartments,
  fetchAssets,
  type EmployeeApiItem,
  type DepartmentApiItem,
  type AssetApiItem,
} from '../../services/peopleApi';

const DEPT_COLORS = ['#0B6FDB', '#7C5CFF', '#12A58E', '#15A36B', '#E07A1D', '#EC4899', '#8B5CF6'];

export const PeopleDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeApiItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentApiItem[]>([]);
  const [assets, setAssets] = useState<AssetApiItem[]>([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([fetchEmployees(), fetchDepartments(), fetchAssets()])
      .then(([emps, depts, asts]) => {
        if (!mounted) return;
        setEmployees(emps);
        setDepartments(depts);
        setAssets(asts);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const totalHeadcount = employees.length;
  const probationCount = employees.filter((e) => e.status?.toLowerCase().includes('probation')).length;
  const assignedAssets = assets.filter((a) => a.status?.toLowerCase() === 'assigned' || a.employee_code).length;
  const totalAssets = assets.length;
  const assetAllocationPct = totalAssets > 0 ? Math.round((assignedAssets / totalAssets) * 100) : 0;

  // Department distribution computed from live employees
  const deptCounts: Record<string, number> = {};
  employees.forEach((e) => {
    const dept = e.department || 'General';
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });

  const deptList = Object.entries(deptCounts).map(([name, count], index) => ({
    name,
    count,
    pct: totalHeadcount > 0 ? Math.round((count / totalHeadcount) * 100) : 0,
    color: DEPT_COLORS[index % DEPT_COLORS.length],
  }));

  // Sort by join date descending
  const recentJoiners = [...employees]
    .sort((a, b) => (b.joined || '').localeCompare(a.joined || ''))
    .slice(0, 5);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">People Management</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Master workforce data, organizational structure, and employee lifecycle.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/people')}
          className="btn primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5 rounded-xl text-white shadow-sm cursor-pointer"
          style={{ background: '#12A58E' }}
        >
          {ic('users', 14)} Open Directory
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <span className="text-xs text-[var(--muted)] font-medium">Total Headcount</span>
          <p className="text-3xl font-bold font-['Sora'] text-[var(--text)] mt-1">{totalHeadcount}</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-2 block">Live database records</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <span className="text-xs text-[var(--muted)] font-medium">Departments</span>
          <p className="text-3xl font-bold font-['Sora'] text-[#12A58E] mt-1">{departments.length}</p>
          <span className="text-[11px] text-[var(--muted)] mt-2 block">Active business units</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <span className="text-xs text-[var(--muted)] font-medium">On Probation</span>
          <p className="text-3xl font-bold font-['Sora'] text-[#E07A1D] mt-1">{probationCount}</p>
          <span className="text-[11px] text-[var(--muted)] mt-2 block">Probationary tracking</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
          <span className="text-xs text-[var(--muted)] font-medium">Asset Allocation</span>
          <p className="text-3xl font-bold font-['Sora'] text-[#0B6FDB] mt-1">{assetAllocationPct}%</p>
          <span className="text-[11px] text-[var(--muted)] mt-2 block">{assignedAssets} of {totalAssets} devices assigned</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs space-y-4">
          <h3 className="font-['Sora'] text-base font-bold text-[var(--text)]">Workforce by Department</h3>
          {deptList.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--muted)]">
              No department assignments recorded.
            </div>
          ) : (
            <div className="space-y-3.5 pt-2">
              {deptList.map((d) => (
                <div key={d.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[var(--text)]">{d.name}</span>
                    <span className="text-[var(--muted)]">{d.count} employees ({d.pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${d.pct}%`, background: d.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links / Recent Hires */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs space-y-4">
          <h3 className="font-['Sora'] text-base font-bold text-[var(--text)]">Recent Joiners</h3>
          {recentJoiners.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--muted)]">
              No employees recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-[var(--line)]">
              {recentJoiners.map((hire) => (
                <div key={hire.employee_code} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#12A58E] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {(hire.full_name || 'New Hire').split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2)}
                    </span>
                    <div>
                      <b className="block text-xs font-semibold text-[var(--text)]">{hire.full_name}</b>
                      <span className="block text-[11px] text-[var(--muted)]">{hire.job_title} · {hire.department}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[var(--muted)]">{hire.joined ? `Joined ${hire.joined}` : hire.employee_code}</span>
                </div>
              ))}
            </div>
          )}
          <div className="pt-2 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={() => navigate('/people/onboarding')}
              className="w-full text-center text-xs font-semibold text-[#12A58E] hover:underline cursor-pointer"
            >
              View Onboarding Pipeline →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeopleDashboard;

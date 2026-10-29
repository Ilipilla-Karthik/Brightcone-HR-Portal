import React, { useEffect, useState } from 'react';
import { fetchEmployees, fetchDepartments } from '../../services/peopleApi';

interface Employee {
  id: string;
  name: string;
  department?: string;
  gender?: string;
  date_of_joining?: string;
}

interface Department {
  id: string;
  name: string;
  employee_count?: number;
}

interface DeptStat { name: string; count: number; }
interface TenureBucket { label: string; count: number; }

const tenureYears = (doj?: string) => {
  if (!doj) return 0;
  const diff = Date.now() - new Date(doj).getTime();
  return diff / (1000 * 60 * 60 * 24 * 365.25);
};

const Card: React.FC<{ label: string; value: string | number; sub?: string; color?: string }> = ({ label, value, sub, color = '#0f172a' }) => (
  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
    <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{label}</p>
    <p style={{ fontSize: 28, fontWeight: 800, color, margin: '6px 0 2px', fontFamily: 'Sora, sans-serif' }}>{value}</p>
    {sub && <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{sub}</p>}
  </div>
);

export const WorkforceAnalyticsPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [depts, setDepts] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const inferGender = (name: string): string => {
      const femaleNames = ['priya', 'ananya', 'sneha', 'meera', 'pooja', 'neha', 'divya', 'kavya', 'radhika', 'swati', 'aditi', 'tanvi'];
      const first = name.toLowerCase().split(' ')[0];
      return femaleNames.some(f => first.includes(f)) ? 'Female' : 'Male';
    };

    Promise.allSettled([fetchEmployees(), fetchDepartments()]).then(([eRes, dRes]) => {
      if (!mounted) return;
      if (eRes.status === 'fulfilled') {
        setEmployees(eRes.value.map(e => ({
          id: e.employee_code,
          name: e.full_name,
          department: e.department,
          gender: (e as any).gender || inferGender(e.full_name),
          date_of_joining: e.joined,
        })));
      } else {
        setEmployees([]);
      }
      if (dRes.status === 'fulfilled') {
        setDepts(dRes.value.map(d => ({
          id: String(d.id),
          name: d.name,
          employee_count: d.employee_count,
        })));
      } else {
        setDepts([]);
      }
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  // Compute stats
  const total = employees.length;
  const males = employees.filter(e => e.gender?.toLowerCase() === 'male').length;
  const females = employees.filter(e => e.gender?.toLowerCase() === 'female').length;

  const deptMap: Record<string, number> = {};
  employees.forEach(e => { if (e.department) deptMap[e.department] = (deptMap[e.department] || 0) + 1; });
  const deptStats: DeptStat[] = depts.length > 0
    ? depts.map(d => ({ name: d.name, count: d.employee_count ?? deptMap[d.name] ?? 0 }))
    : Object.entries(deptMap).map(([name, count]) => ({ name, count }));

  const tenureBuckets: TenureBucket[] = [
    { label: '< 1 year', count: employees.filter(e => tenureYears(e.date_of_joining) < 1).length },
    { label: '1–3 years', count: employees.filter(e => { const y = tenureYears(e.date_of_joining); return y >= 1 && y < 3; }).length },
    { label: '3–5 years', count: employees.filter(e => { const y = tenureYears(e.date_of_joining); return y >= 3 && y < 5; }).length },
    { label: '5+ years', count: employees.filter(e => tenureYears(e.date_of_joining) >= 5).length },
  ];

  const maxDeptCount = Math.max(...deptStats.map(d => d.count), 1);

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', fontFamily: 'Sora, sans-serif', margin: 0 }}>Workforce Analytics</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Headcount distribution, gender, and tenure insights</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* Top Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
            <Card label="Total Headcount" value={total} sub="All active employees" />
            <Card label="Male" value={males} sub={`${total > 0 ? Math.round(males / total * 100) : 0}% of workforce`} color="#3b82f6" />
            <Card label="Female" value={females} sub={`${total > 0 ? Math.round(females / total * 100) : 0}% of workforce`} color="#ec4899" />
            <Card label="Departments" value={deptStats.length} sub="Active teams" color="#6366f1" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* Dept Breakdown */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.05)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>Headcount by Department</h2>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {deptStats.map(d => (
                  <div key={d.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{d.name}</span>
                      <span style={{ fontSize: 12, color: '#64748b' }}>{d.count}</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(d.count / maxDeptCount) * 100}%`, background: '#6366f1', borderRadius: 4, transition: 'width .3s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tenure Buckets */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.05)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>Tenure Distribution</h2>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {tenureBuckets.map((b, i) => {
                  const colors = ['#22c55e', '#6366f1', '#f59e0b', '#ec4899'];
                  const maxT = Math.max(...tenureBuckets.map(t => t.count), 1);
                  return (
                    <div key={b.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{b.label}</span>
                        <span style={{ fontSize: 12, color: '#64748b' }}>{b.count} employee{b.count !== 1 ? 's' : ''}</span>
                      </div>
                      <div style={{ height: 10, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(b.count / maxT) * 100}%`, background: colors[i], borderRadius: 5 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default WorkforceAnalyticsPage;

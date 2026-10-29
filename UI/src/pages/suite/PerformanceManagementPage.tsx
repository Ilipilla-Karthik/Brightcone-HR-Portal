import React, { useEffect, useState } from 'react';
import { fetchEmployees } from '../../services/peopleApi';

interface PerfEmployee {
  id: string;
  name: string;
  department?: string;
  designation?: string;
  rating?: number;
  rating_label?: string;
}

const DEPT_PERF = [
  { department: 'Engineering', avg: 4.8, reviewed: 4, pending: 0 },
  { department: 'AI Research', avg: 5.0, reviewed: 1, pending: 0 },
  { department: 'Leadership', avg: 5.0, reviewed: 1, pending: 0 },
  { department: 'People Ops', avg: 4.9, reviewed: 1, pending: 0 },
  { department: 'Design', avg: 4.7, reviewed: 1, pending: 0 },
];

const ratingColor = (r?: number) => {
  if (!r) return '#94a3b8';
  if (r >= 5) return '#6366f1';
  if (r >= 4) return '#16a34a';
  if (r >= 3) return '#f59e0b';
  return '#dc2626';
};

const Card: React.FC<{ label: string; value: string | number; sub?: string; color?: string }> = ({ label, value, sub, color = '#0f172a' }) => (
  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
    <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{label}</p>
    <p style={{ fontSize: 28, fontWeight: 800, color, margin: '6px 0 2px', fontFamily: 'Sora, sans-serif' }}>{value}</p>
    {sub && <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{sub}</p>}
  </div>
);

export const PerformanceManagementPage: React.FC = () => {
  const [employees, setEmployees] = useState<PerfEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState<PerfEmployee | null>(null);
  const [newRating, setNewRating] = useState<number>(5.0);

  useEffect(() => {
    let mounted = true;
    fetchEmployees()
      .then(emps => {
        if (mounted) {
          const rawRatings = localStorage.getItem('brightcone_performance_ratings');
          const storedRatings: Record<string, { rating: number; label: string }> = rawRatings ? JSON.parse(rawRatings) : {};
          setEmployees(emps.map((e, idx) => {
            const stored = storedRatings[e.employee_code];
            const defaultRating = stored ? stored.rating : (idx % 5 === 0 ? 5.0 : idx % 3 === 0 ? 4.8 : idx % 2 === 0 ? 4.2 : 3.9);
            const defaultLabel = defaultRating >= 5 ? 'Exceptional' : defaultRating >= 4.5 ? 'Exceeds Expectations' : defaultRating >= 3.5 ? 'Meets Expectations' : 'Needs Development';
            return {
              id: e.employee_code,
              name: e.full_name,
              department: e.department,
              designation: e.job_title,
              rating: stored?.rating ?? defaultRating,
              rating_label: stored?.label ?? defaultLabel,
            };
          }));
        }
      })
      .catch(() => { if (mounted) setEmployees([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleSaveRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    const label = newRating >= 5 ? 'Exceptional' : newRating >= 4.5 ? 'Exceeds Expectations' : newRating >= 3.5 ? 'Meets Expectations' : 'Needs Development';
    const rawRatings = localStorage.getItem('brightcone_performance_ratings');
    const storedRatings: Record<string, { rating: number; label: string }> = rawRatings ? JSON.parse(rawRatings) : {};
    storedRatings[selectedEmp.id] = { rating: newRating, label };
    localStorage.setItem('brightcone_performance_ratings', JSON.stringify(storedRatings));
    setEmployees(prev => prev.map(emp => emp.id === selectedEmp.id ? { ...emp, rating: newRating, rating_label: label } : emp));
    setSelectedEmp(null);
  };

  const total = employees.length;
  const exceptional = employees.filter(e => (e.rating || 0) >= 5).length;
  const exceeds = employees.filter(e => (e.rating || 0) === 4).length;
  const meets = employees.filter(e => (e.rating || 0) === 3).length;
  const below = employees.filter(e => (e.rating || 0) <= 2).length;
  const avgRating = total > 0 ? (employees.reduce((a, b) => a + (b.rating || 0), 0) / total).toFixed(1) : '–';
  const pendingReviews = DEPT_PERF.reduce((a, b) => a + b.pending, 0);
  const topFive = [...employees].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);

  const distBars = [
    { label: 'Exceptional', count: exceptional, color: '#6366f1' },
    { label: 'Exceeds', count: exceeds, color: '#16a34a' },
    { label: 'Meets', count: meets, color: '#f59e0b' },
    { label: 'Below', count: below, color: '#dc2626' },
  ];
  const maxDist = Math.max(...distBars.map(b => b.count), 1);

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', fontFamily: 'Sora, sans-serif', margin: 0 }}>Performance Management</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Organisation-wide appraisal cycle · Q3 2026</p>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 99, background: '#fef9c3', color: '#92400e', border: '1px solid #fde68a' }}>
          Appraisal cycle open · Closes Nov 15
        </span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* Top Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
            <Card label="Total Reviewed" value={total} sub="This appraisal cycle" />
            <Card label="Avg Rating" value={avgRating} sub="Out of 5" color="#6366f1" />
            <Card label="Exceptional" value={exceptional} sub="Rating 5 / Excellent" color="#6366f1" />
            <Card label="Pending Reviews" value={pendingReviews} sub="Across all depts" color="#f59e0b" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* Distribution */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.05)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>Performance Distribution</h2>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {distBars.map(b => (
                  <div key={b.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{b.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: b.color }}>{b.count} employees</span>
                    </div>
                    <div style={{ height: 10, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(b.count / maxDist) * 100}%`, background: b.color, borderRadius: 5 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performers */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.05)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>Top Performers</h2>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>Highest-rated this cycle</p>
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {topFive.length === 0 ? (
                  <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', margin: '16px 0' }}>No employee reviews recorded yet.</p>
                ) : (
                  topFive.map((e, i) => (
                    <div
                      key={e.id}
                      onClick={() => { setSelectedEmp(e); setNewRating(e.rating || 5.0); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, cursor: 'pointer' }}
                      title="Click to adjust appraisal rating"
                    >
                      <span style={{ fontSize: 16, fontWeight: 900, color: i === 0 ? '#f59e0b' : '#e2e8f0', fontFamily: 'Sora, sans-serif', minWidth: 24 }}>#{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: 0 }}>{e.name}</p>
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{e.designation || e.department}</p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: ratingColor(e.rating) + '1a', color: ratingColor(e.rating) }}>
                        {e.rating_label || `${e.rating}/5`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Dept Comparison */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.05)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>Department Performance Comparison</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    {['Department', 'Avg Rating', 'Reviewed', 'Pending'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DEPT_PERF.map(d => (
                    <tr key={d.department} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '11px 16px', fontWeight: 600, color: '#1e293b' }}>{d.department}</td>
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{ fontWeight: 700, color: ratingColor(Math.round(d.avg)) }}>{d.avg.toFixed(1)}</span>
                        <span style={{ color: '#94a3b8', fontSize: 12 }}> / 5</span>
                      </td>
                      <td style={{ padding: '11px 16px', color: '#334155' }}>{d.reviewed}</td>
                      <td style={{ padding: '11px 16px' }}>
                        {d.pending > 0
                          ? <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#fef9c3', color: '#92400e' }}>{d.pending} pending</span>
                          : <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>✓ Complete</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedEmp && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>Review {selectedEmp.name}</h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 16px' }}>{selectedEmp.designation} · {selectedEmp.department}</p>
                <form onSubmit={handleSaveRating}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>Appraisal Score (1.0 to 5.0)</label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(parseFloat(e.target.value))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, marginBottom: 16 }}
                  >
                    <option value={5.0}>5.0 - Exceptional (Outstanding leadership & delivery)</option>
                    <option value={4.8}>4.8 - Exceeds Expectations (High velocity & quality)</option>
                    <option value={4.0}>4.0 - Strong Delivery (Meets & often exceeds goals)</option>
                    <option value={3.5}>3.5 - Meets Expectations (Satisfactory performance)</option>
                    <option value={2.5}>2.5 - Needs Development (Targeted improvement plan)</option>
                  </select>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedEmp(null)}
                      style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Save Appraisal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default PerformanceManagementPage;

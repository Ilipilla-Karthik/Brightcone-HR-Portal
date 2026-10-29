import React, { useEffect, useState } from 'react';
import { fetchEmployees } from '../../services/peopleApi';

interface SurveyResult {
  department: string;
  score: number;
  response_rate: number;
  respondents: number;
}

const SURVEY_RESULTS: SurveyResult[] = [
  { department: 'Engineering', score: 82, response_rate: 91, respondents: 16 },
  { department: 'Product', score: 78, response_rate: 86, respondents: 6 },
  { department: 'Sales', score: 71, response_rate: 73, respondents: 8 },
  { department: 'HR & Ops', score: 88, response_rate: 100, respondents: 5 },
  { department: 'Finance', score: 75, response_rate: 75, respondents: 3 },
];

const TOP_ACTIVITIES = [
  { label: 'Team lunches & socials', participants: 34, trend: '+12%' },
  { label: 'Town hall attendees', participants: 41, trend: '+5%' },
  { label: 'Learning courses completed', participants: 27, trend: '+18%' },
  { label: 'Kudos & recognitions sent', participants: 22, trend: '+31%' },
  { label: 'Hackathon participation', participants: 18, trend: 'New' },
];

const Card: React.FC<{ label: string; value: string | number; sub?: string; color?: string }> = ({ label, value, sub, color = '#0f172a' }) => (
  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
    <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{label}</p>
    <p style={{ fontSize: 28, fontWeight: 800, color, margin: '6px 0 2px', fontFamily: 'Sora, sans-serif' }}>{value}</p>
    {sub && <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{sub}</p>}
  </div>
);

const scoreColor = (s: number) => s >= 80 ? '#16a34a' : s >= 65 ? '#f59e0b' : '#dc2626';

export const EngagementAnalyticsPage: React.FC = () => {
  const [totalEmployees, setTotalEmployees] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchEmployees()
      .then(emps => { if (mounted) setTotalEmployees(emps.length); })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const avgScore = Math.round(SURVEY_RESULTS.reduce((a, b) => a + b.score, 0) / SURVEY_RESULTS.length);
  const avgResponse = Math.round(SURVEY_RESULTS.reduce((a, b) => a + b.response_rate, 0) / SURVEY_RESULTS.length);
  const totalRespondents = SURVEY_RESULTS.reduce((a, b) => a + b.respondents, 0);

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', fontFamily: 'Sora, sans-serif', margin: 0 }}>Engagement Analytics</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Employee satisfaction, survey results, and participation metrics</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* Top Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,.05)', textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: scoreColor(avgScore), fontFamily: 'Sora, sans-serif', lineHeight: 1 }}>{avgScore}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 6 }}>Satisfaction Score</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>out of 100</div>
            </div>
            <Card label="Survey Response Rate" value={`${avgResponse}%`} sub={`${totalRespondents} of ~${totalEmployees} responded`} color={scoreColor(avgResponse)} />
            <Card label="Total Respondents" value={totalRespondents} sub="Last survey cycle" color="#6366f1" />
            <Card label="Departments Surveyed" value={SURVEY_RESULTS.length} sub="All teams included" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* Dept Scores */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.05)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>Department-wise Engagement</h2>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {SURVEY_RESULTS.map(s => (
                  <div key={s.department}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{s.department}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor(s.score) }}>{s.score}/100</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${s.score}%`, background: scoreColor(s.score), borderRadius: 4 }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Response rate: {s.response_rate}% · {s.respondents} responded</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Activities */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.05)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>Top Engagement Activities</h2>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>This quarter</p>
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {TOP_ACTIVITIES.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: 8, gap: 12 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#e2e8f0', fontFamily: 'Sora, sans-serif', minWidth: 28, textAlign: 'center' }}>{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', margin: 0 }}>{a.label}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{a.participants} participants</p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: a.trend.startsWith('+') ? '#16a34a' : '#6366f1', background: a.trend.startsWith('+') ? '#dcfce7' : '#ede9fe', padding: '2px 8px', borderRadius: 99 }}>{a.trend}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Survey Note */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>📋</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8', margin: 0 }}>Q3 2026 Employee Pulse Survey — Completed</p>
              <p style={{ fontSize: 12, color: '#3b82f6', margin: '2px 0 0' }}>Next survey scheduled for January 2027. Results shown above reflect 42 responses out of {totalEmployees} employees.</p>
            </div>
          </div>
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default EngagementAnalyticsPage;

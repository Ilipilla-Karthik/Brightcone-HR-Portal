import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  ComplianceRule,
  getComplianceRules,
  toggleComplianceRule as persistToggleRule,
} from '../../services/suiteStorage';

const CATEGORIES = ['All', 'HR Policy', 'Data Privacy', 'Security', 'Labour Law', 'Finance'];

export const ComplianceDashboardPage: React.FC = () => {
  const [rules, setRules] = useState<ComplianceRule[]>(() => getComplianceRules());
  const [catFilter, setCatFilter] = useState('All');
  const [toggling, setToggling] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setRules(getComplianceRules());
  }, []);

  const toggleRule = async (rule: ComplianceRule) => {
    setToggling(rule.id);
    const updated = persistToggleRule(rule.id);
    setRules(updated);
    try { await api.put(`/rules/${rule.id}`, { is_active: !rule.is_active }); } catch {}
    setToggling(null);
  };

  const filtered = rules.filter(r => {
    const matchCat = catFilter === 'All' || r.category === catFilter;
    const q = search.toLowerCase();
    return matchCat && (!q || r.name.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q));
  });

  const activeCount = rules.filter(r => r.is_active).length;
  const score = rules.length > 0 ? Math.round((activeCount / rules.length) * 100) : 0;

  const catColors: Record<string, string> = {
    'HR Policy': '#6366f1', 'Data Privacy': '#22c55e', 'Security': '#dc2626',
    'Labour Law': '#f59e0b', 'Finance': '#3b82f6',
  };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', fontFamily: 'Sora, sans-serif', margin: 0 }}>HR Compliance Dashboard</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Manage and monitor organisation-wide compliance rules</p>
      </div>

      {/* Score + Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: 16, marginBottom: 24, alignItems: 'center' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 28px', boxShadow: '0 1px 3px rgba(0,0,0,.05)', textAlign: 'center' }}>
          <div style={{ fontSize: 44, fontWeight: 900, color: score >= 80 ? '#16a34a' : score >= 60 ? '#f59e0b' : '#dc2626', fontFamily: 'Sora, sans-serif', lineHeight: 1 }}>{score}%</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Compliance Score</div>
        </div>
        {[
          { label: 'Total Rules', value: rules.length, color: '#0f172a' },
          { label: 'Active', value: activeCount, color: '#16a34a' },
          { label: 'Inactive', value: rules.length - activeCount, color: '#dc2626' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: s.color, margin: '6px 0 0', fontFamily: 'Sora, sans-serif' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rules…"
          style={{ flex: 1, minWidth: 200, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: catFilter === c ? '#6366f1' : '#fff', color: catFilter === c ? '#fff' : '#64748b' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(rule => {
          const catColor = catColors[rule.category] || '#64748b';
          return (
            <div key={rule.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,.05)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{rule.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: catColor + '1a', color: catColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{rule.category}</span>
                </div>
                {rule.description && <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{rule.description}</p>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: rule.is_active ? '#dcfce7' : '#fef2f2', color: rule.is_active ? '#16a34a' : '#dc2626', textTransform: 'uppercase' }}>
                  {rule.is_active ? 'Active' : 'Inactive'}
                </span>
                <button onClick={() => toggleRule(rule)} disabled={toggling === rule.id}
                  style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: rule.is_active ? '#fef2f2' : '#f0fdf4', color: rule.is_active ? '#dc2626' : '#16a34a', opacity: toggling === rule.id ? 0.6 : 1 }}>
                  {toggling === rule.id ? '…' : rule.is_active ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No rules match your filters</div>}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ComplianceDashboardPage;

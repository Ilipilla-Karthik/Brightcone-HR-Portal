import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { fetchEmployees } from '../../services/peopleApi';
import { getAccessControlOverrides, saveAccessControlOverride } from '../../services/suiteStorage';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  last_login?: string;
}

const ROLES = ['All', 'hr_admin', 'employee', 'manager'];

export const AccessControlPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchEmployees()
      .then(emps => {
        if (mounted) {
          const overrides = getAccessControlOverrides();
          setUsers(emps.map(e => {
            const ov = overrides[e.employee_code];
            const defaultRole = e.department === 'Leadership' || e.department === 'People Ops' ? 'hr_admin' : e.manager_name ? 'employee' : 'manager';
            const defaultStatus = e.status?.toLowerCase() === 'active' ? 'active' : 'inactive';
            return {
              id: e.employee_code,
              name: e.full_name,
              email: e.work_email,
              role: ov?.role || defaultRole,
              status: (ov?.status as any) || defaultStatus,
              last_login: e.joined || 'Recent',
            };
          }));
        }
      })
      .catch(() => {
        if (mounted) setUsers([]);
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const toggleStatus = async (user: AdminUser) => {
    setToggling(user.id);
    const next: 'active' | 'inactive' = user.status === 'active' ? 'inactive' : 'active';
    saveAccessControlOverride(user.id, { status: next });
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: next } : u));
    try { await api.put(`/employees/${user.id}`, { status: next === 'active' ? 'Active' : 'Inactive' }); } catch {}
    setToggling(null);
  };

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    const q = search.toLowerCase();
    return matchRole && (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  });

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = { hr_admin: '#6366f1', manager: '#f59e0b', employee: '#22c55e' };
    const c = colors[role] || '#64748b';
    return <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: c + '1a', color: c, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{role.replace('_', ' ')}</span>;
  };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', fontFamily: 'Sora, sans-serif', margin: 0 }}>Access Control</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Manage user accounts, roles, and login access</p>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
          style={{ flex: 1, minWidth: 220, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
        <div style={{ display: 'flex', gap: 6 }}>
          {ROLES.map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: roleFilter === r ? '#6366f1' : '#fff', color: roleFilter === r ? '#fff' : '#64748b' }}>
              {r === 'All' ? 'All roles' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}
      {!loading && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.05)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>User Accounts</span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Name', 'Email', 'Role', 'Last Login', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>{user.name}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{user.email}</td>
                    <td style={{ padding: '12px 16px' }}>{roleBadge(user.role)}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 12 }}>{user.last_login || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: user.status === 'active' ? '#dcfce7' : '#f1f5f9', color: user.status === 'active' ? '#16a34a' : '#94a3b8', textTransform: 'uppercase' }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => toggleStatus(user)} disabled={toggling === user.id}
                        style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: user.status === 'active' ? '#fef2f2' : '#f0fdf4', color: user.status === 'active' ? '#dc2626' : '#16a34a', opacity: toggling === user.id ? 0.6 : 1 }}>
                        {toggling === user.id ? '…' : user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No users match your filters</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AccessControlPage;

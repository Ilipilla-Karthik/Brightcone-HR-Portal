import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import {
  RolePermission,
  OrgSettings,
  SecuritySettings,
  getOrgSettings,
  saveOrgSettings,
  getSecuritySettings,
  saveSecuritySettings,
  getRolePermissions,
  saveRolePermissions,
} from '../../services/suiteStorage';

export const SettingsAccess: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Org' | 'RBAC' | 'Security'>('Org');
  const [permissions, setPermissions] = useState<RolePermission[]>(() => getRolePermissions());
  const [orgForm, setOrgForm] = useState<OrgSettings>(() => getOrgSettings());
  const [secForm, setSecForm] = useState<SecuritySettings>(() => getSecuritySettings());
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    setPermissions(getRolePermissions());
    setOrgForm(getOrgSettings());
    setSecForm(getSecuritySettings());
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const togglePerm = (index: number, role: keyof RolePermission) => {
    setPermissions((prev) => {
      const updated = prev.map((item, idx) => {
        if (idx === index && typeof item[role] === 'boolean') {
          return { ...item, [role]: !item[role] };
        }
        return item;
      });
      saveRolePermissions(updated);
      return updated;
    });
  };

  const saveSettings = () => {
    saveOrgSettings(orgForm);
    saveSecuritySettings(secForm);
    saveRolePermissions(permissions);
    showToast('Organization and security settings saved successfully');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Sora']">
            Settings & Access Control
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global organization policies, role-based module matrices, and security settings [PGS-15]
          </p>
        </div>

        <button
          onClick={saveSettings}
          className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <span className="w-4 h-4">{ic('check', 16)}</span>
          Save Changes
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('Org')}
          className={`pb-3 px-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'Org'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className="w-4 h-4">{ic('org', 16)}</span>
          Organization Profile
        </button>
        <button
          onClick={() => setActiveTab('RBAC')}
          className={`pb-3 px-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'RBAC'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className="w-4 h-4">{ic('shield', 16)}</span>
          Role Matrix (RBAC)
        </button>
        <button
          onClick={() => setActiveTab('Security')}
          className={`pb-3 px-3 text-sm font-semibold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'Security'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className="w-4 h-4">{ic('gear', 16)}</span>
          Security & Compliance
        </button>
      </div>

      {/* Tab 1: Organization Profile */}
      {activeTab === 'Org' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 font-['Sora']">Legal Entity Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Legal Name</label>
              <input
                type="text"
                value={orgForm.companyName}
                onChange={(e) => setOrgForm({ ...orgForm, companyName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Trade / Brand Name</label>
              <input
                type="text"
                value={orgForm.brandName}
                onChange={(e) => setOrgForm({ ...orgForm, brandName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Corporate ID (CIN)</label>
              <input
                type="text"
                value={orgForm.cin}
                onChange={(e) => setOrgForm({ ...orgForm, cin: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN</label>
              <input
                type="text"
                value={orgForm.gstin}
                onChange={(e) => setOrgForm({ ...orgForm, gstin: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Permanent Account No (PAN)</label>
              <input
                type="text"
                value={orgForm.pan}
                onChange={(e) => setOrgForm({ ...orgForm, pan: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Base Currency</label>
              <input
                type="text"
                value={orgForm.currency}
                disabled
                className="w-full bg-slate-100 border border-slate-300 rounded-lg p-2.5 text-slate-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Registered Address</label>
              <input
                type="text"
                value={orgForm.headquarters}
                onChange={(e) => setOrgForm({ ...orgForm, headquarters: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: RBAC Matrix */}
      {activeTab === 'RBAC' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-sm font-['Sora']">
                Module Authorization Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Grant or restrict feature access per user persona across all unified modules
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Module Name</th>
                  <th className="py-3 px-4 text-center">Admin</th>
                  <th className="py-3 px-4 text-center">People Ops</th>
                  <th className="py-3 px-4 text-center">Finance</th>
                  <th className="py-3 px-4 text-center">Manager</th>
                  <th className="py-3 px-4 text-center">Employee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissions.map((perm, idx) => (
                  <tr key={perm.module} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">{perm.module}</td>
                    {(['admin', 'peopleOps', 'finance', 'manager', 'employee'] as const).map(
                      (roleKey) => (
                        <td key={roleKey} className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={perm[roleKey]}
                            onChange={() => togglePerm(idx, roleKey)}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Security & Compliance */}
      {activeTab === 'Security' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 font-['Sora']">Security Protocols</h2>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <div>
                <p className="font-semibold text-slate-900">Enforce Multi-Factor Authentication (2FA)</p>
                <p className="text-slate-500">Require TOTP authenticator app for all employees</p>
              </div>
              <input
                type="checkbox"
                checked={secForm.enforce2FA}
                onChange={(e) => setSecForm({ ...secForm, enforce2FA: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <div>
                <p className="font-semibold text-slate-900">Google Workspace SSO</p>
                <p className="text-slate-500">Enable one-click OAuth login via corporate domain (@brightcone.ai)</p>
              </div>
              <input
                type="checkbox"
                checked={secForm.ssoGoogle}
                onChange={(e) => setSecForm({ ...secForm, ssoGoogle: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
              <label className="block font-semibold text-slate-900">
                Session Idle Timeout (Minutes)
              </label>
              <input
                type="number"
                value={secForm.sessionTimeoutMins}
                onChange={(e) =>
                  setSecForm({ ...secForm, sessionTimeoutMins: Number(e.target.value) })
                }
                className="w-32 bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
              <p className="text-slate-500">Users are automatically signed out after inactivity</p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
              <label className="block font-semibold text-slate-900">
                Allowed Corporate IP Ranges
              </label>
              <input
                type="text"
                value={secForm.ipAllowlist}
                onChange={(e) => setSecForm({ ...secForm, ipAllowlist: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
              />
              <p className="text-slate-500">
                Comma-separated CIDR blocks allowed for administrative console access
              </p>
            </div>
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

export default SettingsAccess;

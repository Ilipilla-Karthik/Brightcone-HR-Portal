import {
  ApprovalItem,
  RolePermission,
  OrgSettings,
  SecuritySettings,
  ComplianceRule,
  NotificationItem,
  PromotionRequest,
  AuditRecord,
  INITIAL_APPROVALS,
  INITIAL_RULES,
  INITIAL_ACTIONS,
  INITIAL_PROMOTIONS,
  INITIAL_AUDIT_LOGS,
} from './suiteDefaults';

export * from './suiteDefaults';

const APPROVALS_KEY = 'brightcone_suite_approvals';
const ORG_SETTINGS_KEY = 'brightcone_org_settings';
const SEC_SETTINGS_KEY = 'brightcone_sec_settings';
const RBAC_SETTINGS_KEY = 'brightcone_role_permissions';
const RULES_KEY = 'brightcone_compliance_rules';
const ACTIONS_KEY = 'brightcone_actions_reminders';
const PROMOTIONS_KEY = 'brightcone_suite_promotions';
const AUDIT_KEY = 'brightcone_audit_logs';
const USER_OVERRIDES_KEY = 'brightcone_access_control_overrides';

// Approvals
export function getApprovals(): ApprovalItem[] {
  try {
    const raw = localStorage.getItem(APPROVALS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(APPROVALS_KEY, JSON.stringify(INITIAL_APPROVALS));
    return INITIAL_APPROVALS;
  } catch {
    return INITIAL_APPROVALS;
  }
}

export function updateApprovalStatus(id: string, status: 'Approved' | 'Rejected'): ApprovalItem[] {
  const list = getApprovals();
  const target = list.find((i) => i.id === id);
  const updated = list.map((item) => (item.id === id ? { ...item, status } : item));
  try {
    localStorage.setItem(APPROVALS_KEY, JSON.stringify(updated));
    if (target) {
      addAuditLog(
        `Marked approval request "${target.title}" as ${status}`,
        target.module === 'Expense' ? 'Payroll' : target.module === 'Sign' ? 'Sign' : 'People',
        target.requesterName
      );
    }
  } catch {}
  return updated;
}

export function approveAllPending(): ApprovalItem[] {
  const list = getApprovals();
  const updated = list.map((item) => (item.status === 'Pending' ? { ...item, status: 'Approved' as const } : item));
  try {
    localStorage.setItem(APPROVALS_KEY, JSON.stringify(updated));
    addAuditLog('Bulk approved all pending requests', 'People', 'Approvals Queue');
  } catch {}
  return updated;
}

export function getPendingApprovalsCount(): number {
  return getApprovals().filter((i) => i.status === 'Pending').length;
}

// Settings & Access
export function getOrgSettings(): OrgSettings {
  const fallback: OrgSettings = {
    companyName: 'Brightcone Technologies Private Limited',
    brandName: 'Brightcone AI',
    cin: 'U72900TG2021PTC148810',
    gstin: '36AAACB1234D1Z5',
    pan: 'AAACB1234D',
    headquarters: 'Financial District, Nanakramguda, Hyderabad - 500032',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata (IST +05:30)',
  };
  try {
    const raw = localStorage.getItem(ORG_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveOrgSettings(data: OrgSettings): void {
  try {
    localStorage.setItem(ORG_SETTINGS_KEY, JSON.stringify(data));
    addAuditLog('Updated global organisation legal details & timezone', 'Access', data.companyName);
  } catch {}
}

export function getSecuritySettings(): SecuritySettings {
  const fallback: SecuritySettings = {
    enforce2FA: true,
    sessionTimeoutMins: 30,
    enforceStrongPassword: true,
    ssoGoogle: true,
    ipAllowlist: '106.51.78.0/24, 14.139.112.0/24',
  };
  try {
    const raw = localStorage.getItem(SEC_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveSecuritySettings(data: SecuritySettings): void {
  try {
    localStorage.setItem(SEC_SETTINGS_KEY, JSON.stringify(data));
    addAuditLog('Updated security policies and session timeouts', 'Security', 'Global Policies');
  } catch {}
}

export function getRolePermissions(): RolePermission[] {
  const fallback: RolePermission[] = [
    { module: 'People & Directory', admin: true, peopleOps: true, finance: false, manager: true, employee: true },
    { module: 'Recruit & ATS', admin: true, peopleOps: true, finance: false, manager: true, employee: false },
    { module: 'Payroll & Salary', admin: true, peopleOps: false, finance: true, manager: false, employee: false },
    { module: 'Expenses & Claims', admin: true, peopleOps: false, finance: true, manager: true, employee: true },
    { module: 'Sign & Policies', admin: true, peopleOps: true, finance: false, manager: true, employee: true },
    { module: 'Connect & Feed', admin: true, peopleOps: true, finance: true, manager: true, employee: true },
    { module: 'Learn & LMS', admin: true, peopleOps: true, finance: false, manager: true, employee: true },
    { module: 'Shift & Attendance', admin: true, peopleOps: true, finance: false, manager: true, employee: true },
    { module: 'Suite & Audit Logs', admin: true, peopleOps: false, finance: false, manager: false, employee: false },
  ];
  try {
    const raw = localStorage.getItem(RBAC_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveRolePermissions(perms: RolePermission[]): void {
  try {
    localStorage.setItem(RBAC_SETTINGS_KEY, JSON.stringify(perms));
    addAuditLog('Updated Role-Based Access Control (RBAC) matrix', 'Access', 'RBAC Matrix');
  } catch {}
}

// Compliance Rules
export function getComplianceRules(): ComplianceRule[] {
  try {
    const raw = localStorage.getItem(RULES_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(RULES_KEY, JSON.stringify(INITIAL_RULES));
    return INITIAL_RULES;
  } catch {
    return INITIAL_RULES;
  }
}

export function toggleComplianceRule(id: string): ComplianceRule[] {
  const rules = getComplianceRules();
  const updated = rules.map((r) => (r.id === id ? { ...r, is_active: !r.is_active } : r));
  try {
    localStorage.setItem(RULES_KEY, JSON.stringify(updated));
    const target = rules.find((r) => r.id === id);
    if (target) {
      addAuditLog(
        `${!target.is_active ? 'Enabled' : 'Disabled'} compliance rule: ${target.name}`,
        'Security',
        target.category
      );
    }
  } catch {}
  return updated;
}

// Actions & Reminders
export function getActionsReminders(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(ACTIONS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(ACTIONS_KEY, JSON.stringify(INITIAL_ACTIONS));
    return INITIAL_ACTIONS;
  } catch {
    return INITIAL_ACTIONS;
  }
}

export function markActionDone(id: string): NotificationItem[] {
  const items = getActionsReminders();
  const updated = items.map((i) => (i.id === id ? { ...i, status: 'done' as const } : i));
  try {
    localStorage.setItem(ACTIONS_KEY, JSON.stringify(updated));
    const target = items.find((i) => i.id === id);
    if (target) {
      addAuditLog(`Marked action "${target.title}" as completed`, 'People', target.category || 'General');
    }
  } catch {}
  return updated;
}

// Career & Promotions
export function getPromotionRequests(): PromotionRequest[] {
  try {
    const raw = localStorage.getItem(PROMOTIONS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(PROMOTIONS_KEY, JSON.stringify(INITIAL_PROMOTIONS));
    return INITIAL_PROMOTIONS;
  } catch {
    return INITIAL_PROMOTIONS;
  }
}

export function updatePromotionStatus(id: string, status: 'approved' | 'rejected'): PromotionRequest[] {
  const list = getPromotionRequests();
  const updated = list.map((p) => (p.id === id ? { ...p, status } : p));
  try {
    localStorage.setItem(PROMOTIONS_KEY, JSON.stringify(updated));
    const target = list.find((p) => p.id === id);
    if (target) {
      addAuditLog(
        `${status === 'approved' ? 'Approved' : 'Rejected'} promotion for ${target.employee_name} (${target.proposed_role})`,
        'People',
        target.department
      );
    }
  } catch {}
  return updated;
}

// Audit Logs
export function getAuditLogs(): AuditRecord[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(AUDIT_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
    return INITIAL_AUDIT_LOGS;
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

export function addAuditLog(
  action: string,
  category: 'Security' | 'Payroll' | 'People' | 'Sign' | 'Access',
  target: string,
  actorName = 'Ananya Rao',
  actorRole = 'HR Admin'
): void {
  const list = getAuditLogs();
  const record: AuditRecord = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    actorName,
    actorEmail: `${actorName.toLowerCase().replace(/\s+/g, '.')}@brightcone.com`,
    actorRole,
    action,
    category,
    target,
    ipAddress: '106.51.78.22',
    status: 'Success',
  };
  list.unshift(record);
  try {
    localStorage.setItem(AUDIT_KEY, JSON.stringify(list.slice(0, 100)));
  } catch {}
}

// Access Control Overrides
export function getAccessControlOverrides(): Record<string, { status?: string; role?: string }> {
  try {
    const raw = localStorage.getItem(USER_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAccessControlOverride(empCode: string, override: { status?: string; role?: string }): void {
  const map = getAccessControlOverrides();
  map[empCode] = { ...(map[empCode] || {}), ...override };
  try {
    localStorage.setItem(USER_OVERRIDES_KEY, JSON.stringify(map));
    addAuditLog(`Updated user account ${empCode} access profile`, 'Access', override.role || override.status || 'User');
  } catch {}
}

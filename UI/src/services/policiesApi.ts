import { PolicyRecord, HandbookRecord, PolicyAckRecord } from '../pages/doc_sign/types';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const policiesApi = {
  // 1. HR Policies
  async getPolicies(): Promise<PolicyRecord[]> {
    try {
      const res = await fetch('/api/v1/policies', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch policies');
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.value || [];
      if (list.length > 0) {
        return list.map((d: any) => ({
          id: d.policy_id || (typeof d.id === 'string' ? d.id : `POL-${d.id}`),
          name: d.name,
          category: d.category,
          version: d.version,
          effectiveDate: d.effective_date || '2026-01-01',
          nextReviewDate: d.next_review_date || '2027-01-01',
          owner: d.owner,
          file: d.file_name || 'Policy_Document.pdf',
          ackRequired: d.ack_required,
          status: d.status as any,
        }));
      }
    } catch {}
    return [
      { id: 'POL-01', name: 'Leave & Time-Off Policy 2026', category: 'Leave', version: '2.4', effectiveDate: '2026-01-01', nextReviewDate: '2026-12-31', owner: 'Ananya Rao', file: 'Leave_Policy_2026.pdf', ackRequired: true, status: 'Published' },
      { id: 'POL-02', name: 'Hybrid & Remote Work Framework', category: 'Attendance & WFH', version: '3.1', effectiveDate: '2026-03-01', nextReviewDate: '2027-02-28', owner: 'Naresh Vemparala', file: 'Hybrid_Work_Policy.pdf', ackRequired: true, status: 'Published' },
      { id: 'POL-03', name: 'Prevention of Sexual Harassment (POSH)', category: 'POSH', version: '2.0', effectiveDate: '2025-10-15', nextReviewDate: '2026-10-14', owner: 'Priya Menon', file: 'POSH_Policy_v2.pdf', ackRequired: true, status: 'Published' },
      { id: 'POL-04', name: 'IT Assets & Information Security', category: 'IT & security', version: '4.0', effectiveDate: '2026-02-15', nextReviewDate: '2027-02-14', owner: 'Karthik Reddy', file: 'InfoSec_Standard.pdf', ackRequired: true, status: 'Published' },
    ];
  },

  async createPolicy(payload: Partial<PolicyRecord>): Promise<PolicyRecord> {
    const res = await fetch('/api/v1/policies', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: payload.name,
        category: payload.category,
        version: payload.version,
        effective_date: payload.effectiveDate,
        next_review_date: payload.nextReviewDate,
        owner: payload.owner,
        file_name: payload.file,
        ack_required: payload.ackRequired,
        status: payload.status,
      }),
    });
    if (!res.ok) throw new Error('Failed to create policy');
    const d = await res.json();
    return {
      id: d.policy_id || `POL-${d.id}`,
      name: d.name,
      category: d.category,
      version: d.version,
      effectiveDate: d.effective_date || payload.effectiveDate || '',
      nextReviewDate: d.next_review_date || payload.nextReviewDate || '',
      owner: d.owner,
      file: d.file_name || payload.file || 'Policy.pdf',
      ackRequired: d.ack_required,
      status: d.status,
    };
  },

  async updatePolicy(id: string, payload: Partial<PolicyRecord>): Promise<void> {
    await fetch(`/api/v1/policies/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: payload.name,
        category: payload.category,
        version: payload.version,
        effective_date: payload.effectiveDate,
        next_review_date: payload.nextReviewDate,
        owner: payload.owner,
        file_name: payload.file,
        ack_required: payload.ackRequired,
        status: payload.status,
      }),
    });
  },

  // 2. Handbooks
  async getHandbooks(): Promise<HandbookRecord[]> {
    try {
      const res = await fetch('/api/v1/handbooks', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch handbooks');
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.value || [];
      if (list.length > 0) {
        return list.map((d: any) => ({
          id: d.handbook_id || (typeof d.id === 'string' ? d.id : `HB-${d.id}`),
          version: d.version,
          ver: d.version,
          effectiveDate: d.effective_date || '2026-01-01',
          eff: d.effective_date || '2026-01-01',
          title: d.title,
          owner: d.owner,
          file: d.file_name || 'Handbook.pdf',
          changes: d.changes_summary || '',
          changesSummary: d.changes_summary || '',
          status: d.status as any,
        }));
      }
    } catch {}
    return [
      { id: 'HB-01', ver: '4.0', version: '4.0', eff: '2026-01-01', effectiveDate: '2026-01-01', title: 'Brightcone Employee Handbook 2026', owner: 'Ananya Rao', file: 'Handbook_v4.0.pdf', changes: 'Annual revision with updated travel guidelines.', changesSummary: 'Annual revision with updated travel guidelines.', status: 'Published' },
      { id: 'HB-02', ver: '3.5', version: '3.5', eff: '2025-06-01', effectiveDate: '2025-06-01', title: 'Employee Handbook Mid-Year Addendum', owner: 'Naresh Vemparala', file: 'Handbook_v3.5.pdf', changes: 'Added AI Tool usage and intellectual property clauses.', changesSummary: 'Added AI Tool usage and intellectual property clauses.', status: 'Archived' },
    ];
  },

  async createHandbook(payload: Partial<HandbookRecord>): Promise<HandbookRecord> {
    const res = await fetch('/api/v1/handbooks', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        title: payload.title,
        version: payload.version || payload.ver,
        effective_date: payload.effectiveDate || payload.eff,
        owner: payload.owner,
        file_name: payload.file,
        changes_summary: payload.changesSummary || payload.changes,
        status: payload.status,
      }),
    });
    if (!res.ok) throw new Error('Failed to create handbook');
    const d = await res.json();
    return {
      id: d.handbook_id || `HB-${d.id}`,
      version: d.version,
      ver: d.version,
      effectiveDate: d.effective_date || '',
      eff: d.effective_date || '',
      title: d.title,
      owner: d.owner,
      file: d.file_name || 'Handbook.pdf',
      changes: d.changes_summary || '',
      changesSummary: d.changes_summary || '',
      status: d.status,
    };
  },

  // 3. Policy Acknowledgements
  async getAcknowledgements(): Promise<PolicyAckRecord[]> {
    try {
      const res = await fetch('/api/v1/policy-acknowledgements', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch acknowledgements');
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.value || [];
      if (list.length > 0) {
        return list.map((d: any) => ({
          id: d.ack_code || `ACK-${d.id}`,
          policyId: d.policy_id || 'POL-GEN',
          policyName: d.policy_name,
          employeeName: d.employee_name,
          employeeEmail: d.employee_email,
          department: d.department,
          sentDate: d.sent_date,
          dueDate: d.due_date,
          acknowledgedOn: d.acknowledged_on || undefined,
          status: d.status as any,
        }));
      }
    } catch {}
    return [];
  },

  async createAcknowledgement(payload: Partial<PolicyAckRecord>): Promise<PolicyAckRecord> {
    const res = await fetch('/api/v1/policy-acknowledgements', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        policy_id: payload.policyId,
        policy_name: payload.policyName,
        employee_name: payload.employeeName,
        employee_email: payload.employeeEmail,
        department: payload.department,
        sent_date: payload.sentDate,
        due_date: payload.dueDate,
        status: payload.status,
      }),
    });
    if (!res.ok) throw new Error('Failed to create acknowledgement');
    const d = await res.json();
    return {
      id: d.ack_code || `ACK-${d.id}`,
      policyId: d.policy_id,
      policyName: d.policy_name,
      employeeName: d.employee_name,
      employeeEmail: d.employee_email,
      department: d.department,
      sentDate: d.sent_date,
      dueDate: d.due_date,
      acknowledgedOn: d.acknowledged_on || undefined,
      status: d.status,
    };
  },

  async batchAcknowledgements(
    policyName: string,
    dueDate: string,
    recipients: { name: string; email: string; department: string }[]
  ): Promise<PolicyAckRecord[]> {
    const res = await fetch('/api/v1/policy-acknowledgements/batch', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        policy_name: policyName,
        due_date: dueDate,
        recipients,
      }),
    });
    if (!res.ok) throw new Error('Failed to dispatch batch acknowledgements');
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map((d: any) => ({
      id: d.ack_code || `ACK-${d.id}`,
      policyId: d.policy_id,
      policyName: d.policy_name,
      employeeName: d.employee_name,
      employeeEmail: d.employee_email,
      department: d.department,
      sentDate: d.sent_date,
      dueDate: d.due_date,
      acknowledgedOn: d.acknowledged_on || undefined,
      status: d.status,
    }));
  },

  async updateAcknowledgement(id: string | number, payload: { acknowledged_on?: string; status?: string }): Promise<void> {
    const numId = typeof id === 'number' ? id : parseInt(String(id).replace(/\D/g, ''), 10) || 1;
    await fetch(`/api/v1/policy-acknowledgements/${numId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
  },
};

export interface ApprovalItem {
  id: string;
  module: 'Leave' | 'Expense' | 'Shift' | 'Sign';
  title: string;
  requesterName: string;
  requesterRole: string;
  requesterDept: string;
  details: string;
  amountOrDuration?: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  priority: 'High' | 'Normal' | 'Low';
}

export interface RolePermission {
  module: string;
  admin: boolean;
  peopleOps: boolean;
  finance: boolean;
  manager: boolean;
  employee: boolean;
}

export interface OrgSettings {
  companyName: string;
  brandName: string;
  cin: string;
  gstin: string;
  pan: string;
  headquarters: string;
  currency: string;
  timezone: string;
}

export interface SecuritySettings {
  enforce2FA: boolean;
  sessionTimeoutMins: number;
  enforceStrongPassword: boolean;
  ssoGoogle: boolean;
  ipAllowlist: string;
}

export interface ComplianceRule {
  id: string;
  name: string;
  category: string;
  description?: string;
  is_active: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message?: string;
  priority: 'high' | 'medium' | 'low';
  due_date?: string;
  status: 'pending' | 'done';
  category?: string;
}

export interface PromotionRequest {
  id: string;
  employee_name: string;
  current_role: string;
  proposed_role: string;
  department: string;
  requested_by: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  category: 'Security' | 'Payroll' | 'People' | 'Sign' | 'Access';
  target: string;
  ipAddress: string;
  status: 'Success' | 'Warning' | 'Failed';
}

export const INITIAL_APPROVALS: ApprovalItem[] = [
  {
    id: 'appr-1',
    module: 'Leave',
    title: 'Casual Leave Request (3 Days)',
    requesterName: 'Priya Sharma',
    requesterRole: 'Senior Frontend Engineer',
    requesterDept: 'Engineering',
    details: 'Family function in Jaipur. Sabbatical and annual leave balance available.',
    amountOrDuration: '3 days (Nov 4 - Nov 6)',
    submittedAt: 'Today, 09:30 AM',
    status: 'Pending',
    priority: 'Normal',
  },
  {
    id: 'appr-2',
    module: 'Expense',
    title: 'Client Dinner & Cloud Architecture Meetup',
    requesterName: 'Rahul Varma',
    requesterRole: 'Lead Cloud Architect',
    requesterDept: 'Engineering',
    details: 'Q4 AI roadmap dinner with technical enterprise stakeholders. Invoices attached.',
    amountOrDuration: '₹8,450',
    submittedAt: 'Today, 10:15 AM',
    status: 'Pending',
    priority: 'High',
  },
  {
    id: 'appr-3',
    module: 'Shift',
    title: 'Shift Swap Request (Night to Morning)',
    requesterName: 'Vikram Patel',
    requesterRole: 'DevOps On-Call Engineer',
    requesterDept: 'Engineering',
    details: 'Swapping shift with Karthik Ilipilla for Nov 2 infrastructure deployment.',
    amountOrDuration: 'Night Shift -> Morning Shift',
    submittedAt: 'Yesterday, 04:20 PM',
    status: 'Pending',
    priority: 'High',
  },
  {
    id: 'appr-4',
    module: 'Sign',
    title: 'NDA & Intellectual Property Addendum',
    requesterName: 'Ananya Rao',
    requesterRole: 'VP of People & Culture',
    requesterDept: 'People Ops',
    details: 'Updated statutory IP disclosure agreement for AI Research team.',
    amountOrDuration: 'Legal Envelope #4092',
    submittedAt: 'Oct 27, 2026',
    status: 'Pending',
    priority: 'Normal',
  },
  {
    id: 'appr-5',
    module: 'Leave',
    title: 'Work From Home Extension (2 Days)',
    requesterName: 'Sneha Kulkarni',
    requesterRole: 'Product Designer',
    requesterDept: 'Design',
    details: 'Focused UI design sprint and home workspace setup.',
    amountOrDuration: '2 days (Oct 30 - Oct 31)',
    submittedAt: 'Yesterday, 02:10 PM',
    status: 'Pending',
    priority: 'Low',
  },
  {
    id: 'appr-6',
    module: 'Expense',
    title: 'Monitoring Software Licenses & Datadog Tier',
    requesterName: 'Amitabh Sen',
    requesterRole: 'Principal Data Engineer',
    requesterDept: 'AI Research',
    details: 'Infrastructure telemetry and OpenAI Enterprise evaluation tier subscription.',
    amountOrDuration: '₹34,200',
    submittedAt: 'Oct 26, 2026',
    status: 'Pending',
    priority: 'High',
  },
  {
    id: 'appr-7',
    module: 'Shift',
    title: 'Comp-off Credit Approval',
    requesterName: 'Meera Nambiar',
    requesterRole: 'HR Operations Specialist',
    requesterDept: 'People Ops',
    details: 'Weekend campus recruitment drive at BITS Pilani (8 hours worked).',
    amountOrDuration: '1 Day Comp-Off',
    submittedAt: 'Oct 25, 2026',
    status: 'Pending',
    priority: 'Normal',
  },
  {
    id: 'appr-8',
    module: 'Sign',
    title: 'Employment Contract & Role Progression Sign-off',
    requesterName: 'Karthik Ilipilla',
    requesterRole: 'AI Engineer',
    requesterDept: 'Engineering',
    details: 'Annual compensation revision & technical lead promotion sign-off document.',
    amountOrDuration: 'Offer Letter #8890',
    submittedAt: 'Oct 24, 2026',
    status: 'Pending',
    priority: 'High',
  },
];

export const INITIAL_RULES: ComplianceRule[] = [
  { id: 'r1', name: 'POSH Compliance', category: 'HR Policy', description: 'Prevention of Sexual Harassment policy must be acknowledged annually by all employees.', is_active: true },
  { id: 'r2', name: 'GDPR / DPDP Data Retention', category: 'Data Privacy', description: 'Employee personal data must be purged within 90 days of exit.', is_active: true },
  { id: 'r3', name: 'Password & Credential Policy', category: 'Security', description: 'Passwords must be at least 12 characters and rotated every 90 days.', is_active: true },
  { id: 'r4', name: 'Minimum Wage & Statutory Pay', category: 'Labour Law', description: 'All salaries must meet or exceed state minimum wage standards.', is_active: true },
  { id: 'r5', name: 'Expense Approval Threshold', category: 'Finance', description: 'Expenses above ₹10,000 require manager and finance approval.', is_active: true },
  { id: 'r6', name: 'Background Verification (BGV)', category: 'HR Policy', description: 'BGV must be completed within 30 days of joining for all employees.', is_active: true },
  { id: 'r7', name: 'Annual Leave Carry Forward', category: 'Labour Law', description: 'Max 10 leave days may be carried forward to the next calendar year.', is_active: true },
  { id: 'r8', name: 'IT Asset Return Policy', category: 'Security', description: 'All company assets must be returned within 5 days of employee exit.', is_active: true },
  { id: 'r9', name: 'Two-Factor Authentication (MFA)', category: 'Security', description: 'MFA required for all admin panel logins.', is_active: true },
  { id: 'r10', name: 'Payroll Audit Trail', category: 'Finance', description: 'All payroll changes must have an audit trail entry with approver info.', is_active: true },
];

export const INITIAL_ACTIONS: NotificationItem[] = [
  { id: 'act-1', title: 'Q3 Performance Appraisals Due', message: 'Manager reviews for Engineering and Design teams close Nov 15.', priority: 'high', due_date: '2026-11-15', status: 'pending', category: 'Performance' },
  { id: 'act-2', title: 'Probation Confirmation Review: Karthik Ilipilla', message: '90-day evaluation cycle due for confirmation sign-off.', priority: 'high', due_date: '2026-11-05', status: 'pending', category: 'People' },
  { id: 'act-3', title: 'Monthly PF & ESI Statutory Challans', message: 'Generate ECR file and complete remittance by 15th.', priority: 'medium', due_date: '2026-11-15', status: 'pending', category: 'Payroll' },
  { id: 'act-4', title: 'POSH Annual Policy Re-certification', message: 'Broadcast mandatory compliance training to 24 employees.', priority: 'medium', due_date: '2026-11-20', status: 'pending', category: 'Compliance' },
  { id: 'act-5', title: 'Pending Leave Approvals (4 items)', message: 'Review operational leave requests in Approvals queue.', priority: 'high', due_date: '2026-10-31', status: 'pending', category: 'Time & Attendance' },
  { id: 'act-6', title: 'Audit SOC 2 Type II Evidence Archive', message: 'Export system audit trail and backup snapshots.', priority: 'low', due_date: '2026-11-30', status: 'pending', category: 'Security' },
];

export const INITIAL_PROMOTIONS: PromotionRequest[] = [
  { id: 'prom-1', employee_name: 'Karthik Ilipilla', current_role: 'AI Engineer', proposed_role: 'Lead AI Systems Architect', department: 'Engineering', requested_by: 'Ananya Rao', status: 'pending', date: '2026-10-28' },
  { id: 'prom-2', employee_name: 'Priya Sharma', current_role: 'Senior Frontend Engineer', proposed_role: 'Staff Frontend Engineer', department: 'Engineering', requested_by: 'Rahul Varma', status: 'pending', date: '2026-10-25' },
  { id: 'prom-3', employee_name: 'Sneha Kulkarni', current_role: 'Product Designer', proposed_role: 'Lead Product Designer', department: 'Design', requested_by: 'Ananya Rao', status: 'pending', date: '2026-10-22' },
  { id: 'prom-4', employee_name: 'Vikram Patel', current_role: 'DevOps Engineer', proposed_role: 'Senior SRE Lead', department: 'Engineering', requested_by: 'Rahul Varma', status: 'pending', date: '2026-10-20' },
];

export const INITIAL_AUDIT_LOGS: AuditRecord[] = [
  { id: 'aud-1', timestamp: '2026-10-28 17:42:10', actorName: 'Ananya Rao', actorEmail: 'ananya.rao@brightcone.com', actorRole: 'HR Admin', action: 'Approved monthly salary batch', category: 'Payroll', target: 'Batch #2026-10', ipAddress: '106.51.78.22', status: 'Success' },
  { id: 'aud-2', timestamp: '2026-10-28 16:30:05', actorName: 'Karthik Ilipilla', actorEmail: 'karthik@brightcone.com', actorRole: 'Employee', action: 'Clocked out (Daily Attendance)', category: 'People', target: 'Attendance Log BC-8890', ipAddress: '14.139.112.44', status: 'Success' },
  { id: 'aud-3', timestamp: '2026-10-28 15:15:33', actorName: 'Rahul Varma', actorEmail: 'rahul.varma@brightcone.com', actorRole: 'Manager', action: 'Approved Leave Request', category: 'People', target: 'Leave Request #LR-9921', ipAddress: '106.51.78.19', status: 'Success' },
  { id: 'aud-4', timestamp: '2026-10-28 14:00:20', actorName: 'Ananya Rao', actorEmail: 'ananya.rao@brightcone.com', actorRole: 'HR Admin', action: 'Added Role Permission (Recruit)', category: 'Access', target: 'Manager Role ATS Read', ipAddress: '106.51.78.22', status: 'Success' },
  { id: 'aud-5', timestamp: '2026-10-28 12:20:11', actorName: 'Vikram Patel', actorEmail: 'vikram@brightcone.com', actorRole: 'DevOps', action: 'Requested Shift Swap', category: 'People', target: 'Shift Swap #SW-108', ipAddress: '49.207.214.88', status: 'Success' },
  { id: 'aud-6', timestamp: '2026-10-28 11:10:45', actorName: 'System Security', actorEmail: 'security@brightcone.com', actorRole: 'System', action: 'Enforced 2FA Challenge', category: 'Security', target: 'User Login rahul.varma', ipAddress: '106.51.78.19', status: 'Success' },
  { id: 'aud-7', timestamp: '2026-10-28 09:45:00', actorName: 'Meera Nambiar', actorEmail: 'meera.nambiar@brightcone.com', actorRole: 'HR Ops', action: 'Uploaded Document: BGV Form', category: 'Sign', target: 'Doc ID #DOC-889', ipAddress: '106.51.78.30', status: 'Success' },
  { id: 'aud-8', timestamp: '2026-10-27 18:22:19', actorName: 'Ananya Rao', actorEmail: 'ananya.rao@brightcone.com', actorRole: 'HR Admin', action: 'Triggered Data Backup Snapshot', category: 'Access', target: 'brightcone_hr_portal.sql.gz', ipAddress: '106.51.78.22', status: 'Success' },
];

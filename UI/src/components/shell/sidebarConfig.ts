import React from 'react';
import { ic } from '../icons';
import { getPendingApprovalsCount } from '../../services/suiteStorage';

export interface NavItem {
  label: string;
  to: string;
  badge?: string | number;
  icon: React.ReactNode;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface AppInfo {
  name: string;
  color: string;
  icon: React.ReactNode;
}

export const getAppInfo = (pathname: string): AppInfo => {
  if (pathname.startsWith('/doc-sign') || pathname.startsWith('/sign') || pathname.startsWith('/doc_sign')) {
    return { name: 'Sign', color: '#D9466F', icon: ic('pen', 20) };
  }
  if (pathname.startsWith('/engagement') || pathname.startsWith('/connect')) {
    return { name: 'Connect', color: '#0BA6CC', icon: ic('chat', 20) };
  }
  if (pathname.startsWith('/payroll')) {
    return { name: 'Payroll', color: '#0F9F6E', icon: ic('pay', 20) };
  }
  if (pathname.startsWith('/expense') || pathname.startsWith('/expenses')) {
    return { name: 'Expense', color: '#E07A1D', icon: ic('receipt', 20) };
  }
  if (pathname.startsWith('/learn')) {
    return { name: 'Learn', color: '#6366F1', icon: ic('learn', 20) };
  }
  if (pathname.startsWith('/time') || pathname.startsWith('/shift')) {
    return { name: 'Shift', color: '#3B82C4', icon: ic('calendar', 20) };
  }
  if (pathname.startsWith('/people') || pathname.startsWith('/employees')) {
    return { name: 'People', color: '#12A58E', icon: ic('users', 20) };
  }
  if (pathname.startsWith('/recruit') || pathname.startsWith('/recruitment')) {
    return { name: 'Recruit', color: '#7C5CFF', icon: ic('briefcase', 20) };
  }
  return { name: 'People Plus', color: '#0B87FF', icon: ic('grid', 20) };
};

const EMPLOYEE_PORTAL_NAV: NavSection[] = [
  {
    title: 'SELF SERVICE',
    items: [
      { label: 'My workspace', to: '/portal', icon: ic('grid', 15) },
      { label: 'My documents', to: '/doc-sign/flow', icon: ic('pen', 15) },
      { label: 'Company feed', to: '/engagement/feed', icon: ic('chat', 15) },
      { label: 'My payslips', to: '/payroll/payslips', icon: ic('pay', 15) },
      { label: 'My claims', to: '/expense', icon: ic('receipt', 15) },
    ],
  },
];

export const getSidebarSections = (p: string, role: 'hr_admin' | 'employee'): NavSection[] => {
  // 1. Sign Module
  if (p.startsWith('/doc-sign') || p.startsWith('/sign') || p.startsWith('/doc_sign')) {
    if (role === 'employee') {
      return [{ title: 'DOCUMENTS', items: [{ label: 'My documents', to: '/doc-sign/flow', icon: ic('pen', 15) }] }];
    }
    return [
      { title: 'OVERVIEW', items: [{ label: 'Dashboard', to: '/doc-sign/dashboard', icon: ic('dashboard', 15) }] },
      { title: 'DOCUMENTS', items: [{ label: 'Documents', to: '/doc-sign/requests', icon: ic('pen', 15) }, { label: 'Templates', to: '/doc-sign/templates', icon: ic('doc', 15) }] },
      { title: 'HR POLICIES & COMPLIANCE', items: [{ label: 'Employee handbook', to: '/doc-sign/handbook', icon: ic('doc', 15) }, { label: 'HR policies', to: '/doc-sign/policies', icon: ic('shield', 15) }, { label: 'Policy acknowledgements', to: '/doc-sign/acks', icon: ic('check', 15) }] },
    ];
  }

  // 2. Connect Module
  if (p.startsWith('/engagement') || p.startsWith('/connect')) {
    if (role === 'employee') {
      return [{ title: 'COMMUNITY', items: [{ label: 'Feed', to: '/engagement/feed', icon: ic('chat', 15) }, { label: 'Directory', to: '/engagement/directory', icon: ic('users', 15) }] }];
    }
    return [
      { title: 'OVERVIEW', items: [{ label: 'Feed', to: '/engagement/feed', icon: ic('chat', 15) }] },
      { title: 'COMMUNICATE', items: [{ label: 'Announcements', to: '/engagement/announcements', icon: ic('mega', 15) }, { label: 'Directory', to: '/engagement/directory', icon: ic('users', 15) }] },
      { title: 'EMPLOYEE ENGAGEMENT', items: [{ label: 'Events', to: '/engagement/events', icon: ic('calendar', 15) }, { label: 'Feedback', to: '/engagement/feedback', icon: ic('chat', 15) }, { label: 'Town halls', to: '/engagement/townhall', icon: ic('mega', 15) }, { label: 'Celebrations', to: '/engagement/celebrations', icon: ic('gift', 15) }] },
    ];
  }

  // 3. Payroll Module
  if (p.startsWith('/payroll')) {
    if (role === 'employee') {
      return [{
        title: 'COMPENSATION',
        items: [
          { label: 'My payslips', to: '/payroll/payslips', icon: ic('receipt', 15) },
          { label: 'My benefits', to: '/payroll/benefits', icon: ic('heart', 15) },
        ],
      }];
    }
    return [
      {
        title: 'PAYROLL OPERATIONS',
        items: [
          { label: 'Payroll overview', to: '/payroll', icon: ic('dashboard', 15) },
          { label: 'Run payroll wizard', to: '/payroll/admin', icon: ic('pay', 15) },
          { label: 'Monthly payroll', to: '/payroll/monthly', icon: ic('doc', 15) },
          { label: 'Payslip records', to: '/payroll/records', icon: ic('receipt', 15) },
        ],
      },
      {
        title: 'SALARY & REVISIONS',
        items: [
          { label: 'Salary structures', to: '/payroll/structures', icon: ic('chart', 15) },
          { label: 'Salary revisions', to: '/payroll/revisions', icon: ic('chart', 15) },
        ],
      },
      {
        title: 'COMPLIANCE & BENEFITS',
        items: [
          { label: 'Statutory compliance', to: '/payroll/compliance', icon: ic('shield', 15) },
          { label: 'PF & ESI compliance', to: '/payroll/pf-esi', icon: ic('shield', 15) },
          { label: 'Statutory filings', to: '/payroll/statutory', icon: ic('doc', 15) },
          { label: 'Benefits admin', to: '/payroll/benefits', icon: ic('heart', 15) },
        ],
      },
    ];
  }

  // 4. Expense Module
  if (p.startsWith('/expense') || p.startsWith('/expenses')) {
    if (role === 'employee') {
      return [{ title: 'EXPENSES', items: [{ label: 'My claims', to: '/expense/my-claims', icon: ic('receipt', 15) }] }];
    }
    return [
      {
        title: 'OVERVIEW',
        items: [
          { label: 'Expense dashboard', to: '/expense', icon: ic('dashboard', 15) },
        ],
      },
      {
        title: 'CLAIMS & EXPENSES',
        items: [
          { label: 'All claims', to: '/expense/claims', icon: ic('receipt', 15) },
          { label: 'Office expenses', to: '/expense/office', icon: ic('pay', 15) },
        ],
      },
    ];
  }

  // 5. Learn Module
  if (p.startsWith('/learn')) {
    if (role === 'employee') {
      return [
        {
          title: 'LEARNING',
          items: [{ label: 'My Learning', to: '/learn/my-learning', icon: ic('learn', 15) }],
        },
        {
          title: 'SKILLS & RECORDS',
          items: [
            { label: 'Skills Matrix', to: '/learn/skills', icon: ic('chart', 15) },
            { label: 'Records & Certificates', to: '/learn/records', icon: ic('doc', 15) },
            { label: 'Completion Tracker', to: '/learn/completion', icon: ic('check', 15) },
            { label: 'Recommendations', to: '/learn/recommendations', icon: ic('star', 15) },
          ],
        },
      ];
    }
    return [
      {
        title: 'COURSES & COMPLIANCE',
        items: [
          { label: 'Dashboard', to: '/learn/dashboard', icon: ic('dashboard', 15) },
          { label: 'Courses', to: '/learn/courses', icon: ic('learn', 15) },
          { label: 'Categories', to: '/learn/categories', icon: ic('grid', 15) },
          { label: 'Training Programmes', to: '/learn/training', icon: ic('list', 15) },
          { label: 'POSH', to: '/learn/posh', icon: ic('shield', 15) },
          { label: 'Security Training', to: '/learn/security-training', icon: ic('shield', 15) },
        ],
      },
      {
        title: 'SKILLS & RECORDS',
        items: [
          { label: 'Skills Matrix', to: '/learn/skills', icon: ic('chart', 15) },
          { label: 'Records & Certificates', to: '/learn/records', icon: ic('doc', 15) },
          { label: 'Completion Tracker', to: '/learn/completion', icon: ic('check', 15) },
          { label: 'Recommendations', to: '/learn/recommendations', icon: ic('star', 15) },
        ],
      },
    ];
  }

  // 6. Shift Module
  if (p.startsWith('/time') || p.startsWith('/shift')) {
    if (role === 'employee') {
      return [{ title: 'MY SCHEDULE', items: [{ label: 'My schedule', to: '/time/attendance', icon: ic('clock', 15) }] }];
    }
    return [
      { title: 'OVERVIEW', items: [{ label: 'Weekly roster', to: '/time/roster', icon: ic('calendar', 15) }] },
      {
        title: 'ATTENDANCE & LEAVE',
        items: [
          { label: 'Daily attendance', to: '/time/attendance', icon: ic('clock', 15) },
          { label: 'Login & logout', to: '/time/login-logout', icon: ic('login', 15) },
          { label: 'Leave requests', to: '/time/leave', icon: ic('leave', 15) },
          { label: 'Leave calculator', to: '/time/leave-calculator', icon: ic('calendar', 15) },
          { label: 'Work from home', to: '/time/wfh', icon: ic('home', 15) },
          { label: 'Comp-off tracker', to: '/time/comp-off', icon: ic('swap', 15) },
          { label: 'Holiday calendar', to: '/time/holidays', icon: ic('gift', 15) },
        ],
      },
      {
        title: 'MANAGE',
        items: [
          { label: 'Swap requests', to: '/time/swaps', icon: ic('swap', 15) },
          { label: 'Attendance & shifts', to: '/time/shifts', icon: ic('clock', 15) },
          { label: 'Leave quotas', to: '/time/leave-quotas', icon: ic('leave', 15) },
          { label: 'Leave types', to: '/time/leave-types', icon: ic('doc', 15) },
        ],
      },
    ];
  }

  // 7. People Module
  if (p.startsWith('/people') || p.startsWith('/employees')) {
    if (role === 'employee') {
      return [
        {
          title: 'DIRECTORY & WORKPLACE',
          items: [
            { label: 'People directory', to: '/people/directory', icon: ic('users', 15) },
            { label: 'Org chart', to: '/people/org-chart', icon: ic('org', 15) },
            { label: 'My documents', to: '/people/documents', icon: ic('doc', 15) },
            { label: 'My assets', to: '/people/assets', icon: ic('laptop', 15) },
            { label: 'HR helpdesk', to: '/people/helpdesk', icon: ic('chat', 15) },
            { label: 'Resignation', to: '/people/exit', icon: ic('logout', 15) },
          ],
        },
      ];
    }
    return [
      {
        title: 'OVERVIEW',
        items: [{ label: 'People dashboard', to: '/people/dashboard', icon: ic('dashboard', 15) }],
      },
      {
        title: 'WORKFORCE',
        items: [
          { label: 'Employees', to: '/people', icon: ic('users', 15) },
          { label: 'Org structure', to: '/people/org-chart', icon: ic('org', 15) },
          { label: 'Onboarding', to: '/people/onboarding', icon: ic('plus', 15) },
          { label: 'Exits & offboarding', to: '/people/exit', icon: ic('logout', 15) },
        ],
      },
      {
        title: 'EMPLOYEE MANAGEMENT',
        items: [
          { label: 'Employee master data', to: '/people/master-data', icon: ic('users', 15) },
          { label: 'Employee profiles', to: '/people/profiles', icon: ic('user', 15) },
          { label: 'New joiners', to: '/people/new-joiners', icon: ic('plus', 15) },
          { label: 'Probation tracking', to: '/people/probation', icon: ic('clock', 15) },
          { label: 'Employee documents', to: '/people/documents', icon: ic('doc', 15) },
          { label: 'Employee exit management', to: '/people/exit-management', icon: ic('logout', 15) },
        ],
      },
      {
        title: 'PERFORMANCE',
        items: [
          { label: 'Appraisal tracker', to: '/people/appraisals', icon: ic('chart', 15) },
          { label: 'Performance reviews', to: '/people/performance', icon: ic('star', 15) },
          { label: 'Probation reviews', to: '/people/probation-reviews', icon: ic('check', 15) },
          { label: 'Increment history', to: '/people/increments', icon: ic('pay', 15) },
          { label: 'Employee recognition', to: '/people/recognition', icon: ic('star', 15) },
        ],
      },
      {
        title: 'ADMINISTRATION & ASSETS',
        items: [
          { label: 'Laptop & assets', to: '/people/assets', icon: ic('laptop', 15) },
          { label: 'Access cards', to: '/people/access-cards', icon: ic('key', 15) },
          { label: 'Office facilities', to: '/people/facilities', icon: ic('building', 15) },
          { label: 'Vendor management', to: '/people/vendors', icon: ic('briefcase', 15) },
        ],
      },
    ];
  }

  // 8. Recruit Module
  if (p.startsWith('/recruit') || p.startsWith('/recruitment')) {
    if (role === 'employee') {
      return [
        {
          title: 'CAREERS',
          items: [{ label: 'Jobs & referrals', to: '/recruit/jobs', icon: ic('briefcase', 15) }],
        },
      ];
    }
    return [
      {
        title: 'PIPELINE & SOURCING',
        items: [
          { label: 'Recruit dashboard', to: '/recruit/dashboard', icon: ic('dashboard', 15) },
          { label: 'Candidate tracker', to: '/recruit/candidate-tracker', icon: ic('users', 15) },
          { label: 'Interview scheduling', to: '/recruit/interviews', icon: ic('clock', 15) },
          { label: 'Manpower requisitions', to: '/recruit/manpower', icon: ic('briefcase', 15) },
          { label: 'Jobs & pipelines', to: '/recruit/admin', icon: ic('briefcase', 15) },
        ],
      },
      {
        title: 'OFFERS & ONBOARDING',
        items: [
          { label: 'Offer letters', to: '/recruit/offers', icon: ic('pen', 15) },
          { label: 'Joining formalities & BGV', to: '/recruit/joining', icon: ic('shield', 15) },
          { label: 'Onboarding checklist', to: '/recruit/onboarding', icon: ic('check', 15) },
          { label: 'Campus & internships', to: '/recruit/internships', icon: ic('learn', 15) },
          { label: 'Employee referrals', to: '/recruit/jobs', icon: ic('gift', 15) },
        ],
      },
    ];
  }

  // 9. Suite Module & Default
  if (p.startsWith('/suite')) {
    if (role === 'employee') return EMPLOYEE_PORTAL_NAV;
    const pendingApprovals = getPendingApprovalsCount();
    return [
      {
        title: 'OVERVIEW',
        items: [
          { label: 'Suite dashboard', to: '/suite', icon: ic('grid', 15) },
          { label: 'Approvals inbox', to: '/suite/approvals', icon: ic('inbox', 15), badge: pendingApprovals > 0 ? String(pendingApprovals) : undefined },
          { label: 'Reports & analytics', to: '/suite/reports', icon: ic('chart', 15) },
        ],
      },
      {
        title: 'ADVANCED HR',
        items: [
          { label: 'Performance management', to: '/suite/performance', icon: ic('star', 15) },
          { label: 'Career growth & promotions', to: '/suite/career', icon: ic('chart', 15) },
          { label: 'Workforce analytics', to: '/suite/workforce-analytics', icon: ic('users', 15) },
          { label: 'Engagement analytics', to: '/suite/engagement', icon: ic('chat', 15) },
          { label: 'HR compliance dashboard', to: '/suite/compliance', icon: ic('shield', 15) },
          { label: 'Actions & reminders', to: '/suite/actions', icon: ic('bell', 15) },
          { label: 'Access control', to: '/suite/access-control', icon: ic('key', 15) },
        ],
      },
      {
        title: 'ADMINISTRATION',
        items: [
          { label: 'Settings & access', to: '/suite/settings', icon: ic('gear', 15) },
          { label: 'Audit log', to: '/suite/audit', icon: ic('list', 15) },
          { label: 'Data & backup', to: '/suite/data-backup', icon: ic('doc', 15) },
        ],
      },
    ];
  }

  // 10. People Plus Portal (Default)
  if (role === 'employee') return EMPLOYEE_PORTAL_NAV;

  const pendingApprovals = getPendingApprovalsCount();
  return [
    {
      title: 'EXECUTIVE SUITE',
      items: [
        { label: 'Suite dashboard', to: '/suite', icon: ic('grid', 15) },
        { label: 'Approvals inbox', to: '/suite/approvals', icon: ic('inbox', 15), badge: pendingApprovals > 0 ? String(pendingApprovals) : undefined },
        { label: 'Reports & analytics', to: '/suite/reports', icon: ic('chart', 15) },
      ],
    },
  ];
};

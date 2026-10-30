import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/authContext';
import { NotificationsProvider } from './services/NotificationsContext';
import { Login } from './pages/auth/Login';
import { AppRail } from './components/shell/AppRail';
import { Header } from './components/shell/Header';
import { SidebarNav } from './components/shell/SidebarNav';
import { CommandPalette } from './components/shell/CommandPalette';

import { SignDashboard } from './pages/doc_sign/SignDashboard';
import { SignatureRequests } from './pages/doc_sign/SignatureRequests';
import { SignDocumentFlow } from './pages/doc_sign/SignDocumentFlow';
import { TemplateBuilder } from './pages/doc_sign/TemplateBuilder';
import { EmployeeHandbookPage } from './pages/doc_sign/EmployeeHandbookPage';
import { HRPoliciesPage } from './pages/doc_sign/HRPoliciesPage';
import { PolicyAcknowledgementsPage } from './pages/doc_sign/PolicyAcknowledgementsPage';

import { CompanyFeedPage } from './pages/engagement/CompanyFeedPage';
import { AnnouncementsPage } from './pages/engagement/AnnouncementsPage';
import { DirectoryPage } from './pages/engagement/DirectoryPage';
import { CelebrationsPage } from './pages/engagement/CelebrationsPage';
import { CompanyEventsPage } from './pages/engagement/CompanyEventsPage';
import { FeedbackPage } from './pages/engagement/FeedbackPage';
import { TownhallPage } from './pages/engagement/TownhallPage';

import { PayrollDashboard } from './pages/payroll/PayrollDashboard';
import { PayrollAdminPage } from './pages/payroll/PayrollAdminPage';
import { SalaryStructurePage } from './pages/payroll/SalaryStructurePage';
import { StatutoryFilings } from './pages/payroll/StatutoryFilings';
import { MyPayslipsPage } from './pages/payroll/MyPayslipsPage';
import { BenefitsAdminPage } from './pages/payroll/BenefitsAdminPage';
import { MonthlyPayrollPage } from './pages/payroll/MonthlyPayrollPage';
import { PayslipRecordsPage } from './pages/payroll/PayslipRecordsPage';
import { SalaryRevisionsPage } from './pages/payroll/SalaryRevisionsPage';
import { PfEsiCompliancePage } from './pages/payroll/PfEsiCompliancePage';
import { StatutoryCompliancePage } from './pages/payroll/StatutoryCompliancePage';
import { ExpenseEmployeePage } from './pages/payroll/ExpenseEmployeePage';
import { ExpenseFinancePage } from './pages/payroll/ExpenseFinancePage';
import { OfficeExpensePage } from './pages/payroll/OfficeExpensePage';

import { LearnDashboard } from './pages/learn/LearnDashboard';
import { CourseCatalogueAdmin } from './pages/learn/CourseCatalogueAdmin';
import { EmployeeLearnPage } from './pages/learn/EmployeeLearnPage';
import { PoshPage } from './pages/learn/PoshPage';
import { SecurityTrainingPage } from './pages/learn/SecurityTrainingPage';
import { SkillsMatrixPage } from './pages/learn/SkillsMatrixPage';
import { TrainingCompletionPage } from './pages/learn/TrainingCompletionPage';
import { TrainingProgrammesPage } from './pages/learn/TrainingProgrammesPage';
import { CategoriesPage } from './pages/learn/CategoriesPage';
import { CertificatesRecordsPage } from './pages/learn/CertificatesRecordsPage';
import { SkillRecommendationsPage } from './pages/learn/SkillRecommendationsPage';

import { AttendanceAdmin } from './pages/time/AttendanceAdmin';
import { MyAttendancePage } from './pages/time/MyAttendancePage';
import { MyLeavePage } from './pages/time/MyLeavePage';
import { ShiftRosterPage } from './pages/time/ShiftRosterPage';
import { ShiftSwapPage } from './pages/time/ShiftSwapPage';
import { HolidayAdminPage } from './pages/time/HolidayAdminPage';
import { WorkFromHomePage } from './pages/WorkFromHomePage';
import { CompOffTrackerPage } from './pages/CompOffTrackerPage';
import { ShiftsPage } from './pages/time/ShiftsPage';
import { LeaveCalculatorPage } from './pages/LeaveCalculatorPage';
import { LeaveQuotasAdminPage } from './pages/time/LeaveQuotasAdminPage';
import { LeaveTypesAdminPage } from './pages/time/LeaveTypesAdminPage';

import { EmployeesPage } from './pages/people/EmployeesPage';
import { PeopleDashboard } from './pages/people/PeopleDashboard';
import { DirectoryOrgChart } from './pages/people/DirectoryOrgChart';
import { OnboardingPage } from './pages/people/OnboardingPage';
import { AssetsAdminPage } from './pages/people/AssetsAdminPage';
import { EmployeeDocuments } from './pages/people/EmployeeDocuments';
import { ExitManagementPage } from './pages/people/ExitManagementPage';
import { ProbationTracking } from './pages/people/ProbationTracking';
import { EmployeeProfilePage } from './pages/people/EmployeeProfilePage';
import { AccessCardPage } from './pages/people/AccessCardPage';
import { FacilitiesPage } from './pages/people/FacilitiesPage';
import { VendorPage } from './pages/people/VendorPage';
import { IncrementsPage } from './pages/people/IncrementsPage';
import { RecognitionPage } from './pages/people/RecognitionPage';
import { HelpdeskQueuePage } from './pages/people/HelpdeskQueuePage';
import { OrgStructureAdmin } from './pages/people/OrgStructureAdmin';
import { NewJoinersPage } from './pages/people/NewJoinersPage';
import { EmployeeExitManagementPage } from './pages/people/EmployeeExitManagementPage';
import { AppraisalTrackerPage } from './pages/people/AppraisalTrackerPage';
import { PerformanceReviewsPage } from './pages/people/PerformanceReviewsPage';
import { ProbationReviewsPage } from './pages/people/ProbationReviewsPage';

import { RecruitDashboard } from './pages/recruit/RecruitDashboard';
import { RecruitAdminPage } from './pages/recruit/RecruitAdminPage';
import { CandidateTrackerPage } from './pages/recruit/CandidateTrackerPage';
import InterviewSchedulingPage from './pages/recruit/InterviewSchedulingPage';
import { OfferLettersPage } from './pages/recruit/OfferLettersPage';
import { JoiningFormalitiesPage } from './pages/recruit/JoiningFormalitiesPage';
import { OnboardingChecklistPage } from './pages/recruit/OnboardingChecklistPage';
import { InternshipManagementPage } from './pages/recruit/InternshipManagementPage';
import { ManpowerRequirementsPage } from './pages/recruit/ManpowerRequirementsPage';
import { JobsReferralsPage } from './pages/recruit/JobsReferralsPage';
import { PerformanceLMSAdmin } from './pages/recruit/PerformanceLMSAdmin';

import { SuiteDashboard } from './pages/suite/SuiteDashboard';
import { ApprovalsInbox } from './pages/suite/ApprovalsInbox';
import { AuditLogPage } from './pages/suite/AuditLogPage';
import { SettingsAccess } from './pages/suite/SettingsAccess';
import { ReportsAnalytics } from './pages/suite/ReportsAnalytics';
import { AccessControlPage } from './pages/suite/AccessControlPage';
import { DataBackupPage } from './pages/suite/DataBackupPage';
import { WorkforceAnalyticsPage } from './pages/suite/WorkforceAnalyticsPage';
import { ComplianceDashboardPage } from './pages/suite/ComplianceDashboardPage';
import { ActionsRemindersPage } from './pages/suite/ActionsRemindersPage';
import { CareerPromotionsPage } from './pages/suite/CareerPromotionsPage';
import { EngagementAnalyticsPage } from './pages/suite/EngagementAnalyticsPage';
import { PerformanceManagementPage } from './pages/suite/PerformanceManagementPage';
import { EmployeePortalPage } from './pages/portal/EmployeePortalPage';

const AppLayout: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const isEmployee =
    user?.role?.toLowerCase()?.includes('employee') ||
    user?.email?.toLowerCase()?.includes('rahul') ||
    localStorage.getItem('persona') === 'employee';

  const [role, setRole] = useState<'hr_admin' | 'employee'>(
    isEmployee ? 'employee' : 'hr_admin'
  );
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    const isEmp =
      user?.role?.toLowerCase()?.includes('employee') ||
      user?.email?.toLowerCase()?.includes('rahul') ||
      localStorage.getItem('persona') === 'employee';
    setRole(isEmp ? 'employee' : 'hr_admin');
  }, [user]);

  const getAccentColor = (p: string) => {
    if (p.startsWith('/doc-sign') || p.startsWith('/sign') || p.startsWith('/doc_sign')) return '#D9466F';
    if (p.startsWith('/engagement') || p.startsWith('/connect')) return '#0BA6CC';
    if (p.startsWith('/payroll')) return '#0F9F6E';
    if (p.startsWith('/expense') || p.startsWith('/expenses')) return '#E07A1D';
    if (p.startsWith('/learn')) return '#6366F1';
    if (p.startsWith('/time') || p.startsWith('/shift')) return '#3B82C4';
    if (p.startsWith('/people') || p.startsWith('/employees')) return '#12A58E';
    if (p.startsWith('/recruit') || p.startsWith('/recruitment')) return '#7C5CFF';
    return '#0B87FF';
  };

  const accentColor = getAccentColor(location.pathname);

  if (!isAuthenticated) {
    return <Login />;
  }

  const defaultHome = role === 'employee' ? '/portal' : '/suite';

  return (
    <>
      <div
        className="app h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]"
        style={{ '--ac': accentColor } as React.CSSProperties}
      >
        <AppRail role={role} />
        <SidebarNav role={role} />

        <div className="main flex flex-col min-w-0 h-full overflow-hidden">
          <Header role={role} onOpenCommand={() => setIsCommandOpen(true)} />

          <main className="content flex-1 min-h-0 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Navigate to={defaultHome} replace />} />
              <Route path="/login" element={<Login />} />

              {/* Suite & Portal */}
              <Route path="/suite" element={<SuiteDashboard />} />
              <Route path="/suite/approvals" element={<ApprovalsInbox />} />
              <Route path="/suite/audit" element={<AuditLogPage />} />
              <Route path="/suite/settings" element={<SettingsAccess />} />
              <Route path="/suite/reports" element={<ReportsAnalytics />} />
              <Route path="/suite/access-control" element={<AccessControlPage />} />
              <Route path="/suite/data-backup" element={<DataBackupPage />} />
              <Route path="/suite/workforce-analytics" element={<WorkforceAnalyticsPage />} />
              <Route path="/suite/compliance" element={<ComplianceDashboardPage />} />
              <Route path="/suite/actions" element={<ActionsRemindersPage />} />
              <Route path="/suite/career" element={<CareerPromotionsPage />} />
              <Route path="/suite/engagement" element={<EngagementAnalyticsPage />} />
              <Route path="/suite/performance" element={<PerformanceManagementPage />} />
              <Route path="/portal" element={<EmployeePortalPage />} />

              {/* Sign */}
              <Route path="/doc-sign" element={<Navigate to={role === 'employee' ? '/doc-sign/flow' : '/doc-sign/dashboard'} replace />} />
              <Route path="/doc-sign/dashboard" element={<SignDashboard />} />
              <Route path="/doc-sign/handbook" element={<EmployeeHandbookPage />} />
              <Route path="/doc-sign/policies" element={<HRPoliciesPage />} />
              <Route path="/doc-sign/acks" element={<PolicyAcknowledgementsPage />} />
              <Route path="/doc-sign/requests" element={<SignatureRequests />} />
              <Route path="/doc-sign/templates" element={<TemplateBuilder />} />
              <Route path="/doc-sign/flow" element={<SignDocumentFlow />} />
              <Route path="/sign/*" element={<Navigate to={role === 'employee' ? '/doc-sign/flow' : '/doc-sign/dashboard'} replace />} />
              <Route path="/doc_sign/*" element={<Navigate to={role === 'employee' ? '/doc-sign/flow' : '/doc-sign/dashboard'} replace />} />

              {/* Connect */}
              <Route path="/engagement" element={<CompanyFeedPage />} />
              <Route path="/engagement/feed" element={<CompanyFeedPage />} />
              <Route path="/engagement/announcements" element={<AnnouncementsPage />} />
              <Route path="/engagement/directory" element={<DirectoryPage />} />
              <Route path="/engagement/celebrations" element={<CelebrationsPage />} />
              <Route path="/engagement/events" element={<CompanyEventsPage />} />
              <Route path="/engagement/feedback" element={<FeedbackPage />} />
              <Route path="/engagement/townhall" element={<TownhallPage />} />
              <Route path="/connect/*" element={<Navigate to="/engagement/feed" replace />} />

              {/* Payroll */}
              <Route path="/payroll" element={<PayrollDashboard />} />
              <Route path="/payroll/admin" element={<PayrollAdminPage />} />
              <Route path="/payroll/run" element={<PayrollAdminPage />} />
              <Route path="/payroll/monthly" element={<MonthlyPayrollPage />} />
              <Route path="/payroll/records" element={<PayslipRecordsPage />} />
              <Route path="/payroll/structures" element={<SalaryStructurePage />} />
              <Route path="/payroll/revisions" element={<SalaryRevisionsPage />} />
              <Route path="/payroll/statutory" element={<StatutoryFilings />} />
              <Route path="/payroll/pf-esi" element={<PfEsiCompliancePage />} />
              <Route path="/payroll/compliance" element={<StatutoryCompliancePage />} />
              <Route path="/payroll/payslips" element={<MyPayslipsPage />} />
              <Route path="/payroll/benefits" element={<BenefitsAdminPage />} />

              {/* Expense */}
              <Route path="/expense" element={<ExpenseEmployeePage />} />
              <Route path="/expense/finance" element={<ExpenseFinancePage />} />
              <Route path="/expense/claims" element={<ExpenseFinancePage />} />
              <Route path="/expense/office" element={<OfficeExpensePage />} />
              <Route path="/expense/my-claims" element={<ExpenseEmployeePage />} />
              <Route path="/expenses" element={<Navigate to={role === 'employee' ? '/expense' : '/expense/finance'} replace />} />
              <Route path="/expenses/claims" element={<ExpenseFinancePage />} />
              <Route path="/expenses/office" element={<OfficeExpensePage />} />
              <Route path="/expenses/my-claims" element={<ExpenseEmployeePage />} />

              {/* Learn */}
              <Route path="/learn" element={<Navigate to={role === 'employee' ? '/learn/my-learning' : '/learn/dashboard'} replace />} />
              <Route path="/learn/dashboard" element={<LearnDashboard />} />
              <Route path="/learn/courses" element={<CourseCatalogueAdmin />} />
              <Route path="/learn/my-learning" element={<EmployeeLearnPage />} />
              <Route path="/learn/posh" element={<PoshPage />} />
              <Route path="/learn/security" element={<SecurityTrainingPage />} />
              <Route path="/learn/security-training" element={<SecurityTrainingPage />} />
              <Route path="/learn/skills-matrix" element={<SkillsMatrixPage />} />
              <Route path="/learn/skills" element={<SkillsMatrixPage />} />
              <Route path="/learn/tracker" element={<TrainingCompletionPage />} />
              <Route path="/learn/completion" element={<TrainingCompletionPage />} />
              <Route path="/learn/programmes" element={<TrainingProgrammesPage />} />
              <Route path="/learn/training" element={<TrainingProgrammesPage />} />
              <Route path="/learn/categories" element={<CategoriesPage />} />
              <Route path="/learn/certificates" element={<CertificatesRecordsPage />} />
              <Route path="/learn/records" element={<CertificatesRecordsPage />} />
              <Route path="/learn/recommendations" element={<SkillRecommendationsPage />} />

              {/* Shift & Time */}
              <Route path="/time" element={<ShiftRosterPage />} />
              <Route path="/time/roster" element={<ShiftRosterPage />} />
              <Route path="/time/attendance" element={<AttendanceAdmin />} />
              <Route path="/time/login-logout" element={<MyAttendancePage />} />
              <Route path="/time/leave" element={<MyLeavePage />} />
              <Route path="/time/leave-balance" element={<MyLeavePage />} />
              <Route path="/time/leave-calculator" element={<LeaveCalculatorPage />} />
              <Route path="/time/leave/calculator" element={<LeaveCalculatorPage />} />
              <Route path="/time/leave-quotas" element={<LeaveQuotasAdminPage />} />
              <Route path="/time/leave/quotas" element={<LeaveQuotasAdminPage />} />
              <Route path="/time/quotas" element={<LeaveQuotasAdminPage />} />
              <Route path="/time/leave-types" element={<LeaveTypesAdminPage />} />
              <Route path="/time/leave/types" element={<LeaveTypesAdminPage />} />
              <Route path="/time/wfh" element={<WorkFromHomePage />} />
              <Route path="/time/comp-off" element={<CompOffTrackerPage />} />
              <Route path="/time/holidays" element={<HolidayAdminPage />} />
              <Route path="/time/swaps" element={<ShiftSwapPage />} />
              <Route path="/time/swap" element={<ShiftSwapPage />} />
              <Route path="/time/shifts" element={<ShiftsPage />} />
              <Route path="/shift/*" element={<Navigate to="/time/roster" replace />} />

              {/* People - Overview & Workforce */}
              <Route path="/people" element={<EmployeesPage />} />
              <Route path="/people/dashboard" element={<PeopleDashboard />} />
              <Route path="/people/overview" element={<PeopleDashboard />} />
              <Route path="/people/directory" element={<DirectoryOrgChart />} />
              <Route path="/people/org-chart" element={<DirectoryOrgChart />} />
              <Route path="/people/onboarding" element={<OnboardingPage />} />
              <Route path="/people/exit" element={<ExitManagementPage />} />
              <Route path="/people/exits" element={<ExitManagementPage />} />
              <Route path="/people/exit-management" element={<EmployeeExitManagementPage />} />

              {/* Employee Management */}
              <Route path="/people/employees" element={<EmployeesPage />} />
              <Route path="/people/master-data" element={<EmployeesPage />} />
              <Route path="/people/profiles" element={<EmployeeProfilePage />} />
              <Route path="/people/new-joiners" element={<NewJoinersPage />} />
              <Route path="/people/probation" element={<ProbationTracking />} />
              <Route path="/people/documents" element={<EmployeeDocuments />} />

              {/* Performance */}
              <Route path="/people/performance" element={<PerformanceReviewsPage />} />
              <Route path="/people/appraisals" element={<AppraisalTrackerPage />} />
              <Route path="/people/probation-reviews" element={<ProbationReviewsPage />} />
              <Route path="/people/increments" element={<IncrementsPage />} />
              <Route path="/people/recognition" element={<RecognitionPage />} />

              {/* Administration & Assets */}
              <Route path="/people/assets" element={<AssetsAdminPage />} />
              <Route path="/people/access-cards" element={<AccessCardPage />} />
              <Route path="/people/facilities" element={<FacilitiesPage />} />
              <Route path="/people/vendors" element={<VendorPage />} />

              {/* Operations */}
              <Route path="/people/helpdesk" element={<HelpdeskQueuePage />} />
              <Route path="/people/departments" element={<OrgStructureAdmin />} />
              <Route path="/employees/*" element={<Navigate to="/people" replace />} />

              {/* Recruit - All 9 Pages & Aliases */}
              <Route path="/recruit" element={<RecruitDashboard />} />
              <Route path="/recruit/dashboard" element={<RecruitDashboard />} />
              <Route path="/recruit/admin" element={<RecruitAdminPage />} />
              <Route path="/recruit/candidates" element={<CandidateTrackerPage />} />
              <Route path="/recruit/candidate-tracker" element={<CandidateTrackerPage />} />
              <Route path="/recruit/interviews" element={<InterviewSchedulingPage />} />
              <Route path="/recruit/offers" element={<OfferLettersPage />} />
              <Route path="/recruit/joining" element={<JoiningFormalitiesPage />} />
              <Route path="/recruit/onboarding" element={<OnboardingChecklistPage />} />
              <Route path="/recruit/internships" element={<InternshipManagementPage />} />
              <Route path="/recruit/manpower" element={<ManpowerRequirementsPage />} />
              <Route path="/recruit/jobs" element={<JobsReferralsPage />} />
              <Route path="/recruit/jobs-referrals" element={<JobsReferralsPage />} />
              <Route path="/recruit/performance" element={<PerformanceLMSAdmin />} />
              <Route path="/recruitment/*" element={<Navigate to="/recruit" replace />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to={defaultHome} replace />} />
            </Routes>
          </main>
        </div>
      </div>

      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppLayout />
        </Router>
      </NotificationsProvider>
    </AuthProvider>
  );
};

export default App;

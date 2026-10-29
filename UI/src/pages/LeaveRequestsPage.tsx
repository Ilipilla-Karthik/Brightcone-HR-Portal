import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Search, User, FileText, AlertCircle } from 'lucide-react';
import type { Employee, LeaveType, LeaveRequest, LeaveBalanceItem } from '../types';
import { api } from '../services/api';
import { ApplyLeaveModal } from '../components/leave/ApplyLeaveModal';
import { LeaveReviewModal } from '../components/leave/LeaveReviewModal';
import { LeaveBalancesCard } from '../components/leave/LeaveBalancesCard';
import { LeaveRequestsTable } from '../components/leave/LeaveRequestsTable';

interface LeaveRequestsPageProps {
  showSuccessToast?: (msg: string) => void;
  searchQuery?: string;
}

export const LeaveRequestsPage: React.FC<LeaveRequestsPageProps> = ({
  showSuccessToast,
  searchQuery = '',
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [activeView, setActiveView] = useState<'EMPLOYEE' | 'REVIEWER'>('EMPLOYEE');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tableSearch, setTableSearch] = useState<string>('');

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalanceItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBalancesLoading, setIsBalancesLoading] = useState<boolean>(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [reviewRequest, setReviewRequest] = useState<LeaveRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([api.fetchEmployees(), api.fetchLeaveTypes()]).then(([empRes, ltRes]) => {
      if (!isMounted) return;
      if (empRes.data && empRes.data.length > 0) {
        setEmployees(empRes.data);
        setSelectedEmployeeId(empRes.data[0].id);
      }
      if (ltRes.data) setLeaveTypes(ltRes.data);
    });
    return () => { isMounted = false; };
  }, []);

  const loadBalances = useCallback(async () => {
    if (!selectedEmployeeId) return;
    setIsBalancesLoading(true);
    try {
      const res = await api.fetchLeaveBalances(selectedEmployeeId, selectedYear);
      if (res.data) setBalances(res.data.balances || []);
    } catch {
      //
    } finally {
      setIsBalancesLoading(false);
    }
  }, [selectedEmployeeId, selectedYear]);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const res = await api.fetchLeaveRequests({
        employee_id: activeView === 'EMPLOYEE' ? selectedEmployeeId : undefined,
        year: selectedYear,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      if (res.data) setRequests(res.data);
      else setPageError(res.error || 'Failed to fetch leave requests');
    } catch (err: unknown) {
      setPageError(err instanceof Error ? err.message : 'Error fetching leave requests');
    } finally {
      setIsLoading(false);
    }
  }, [activeView, selectedEmployeeId, selectedYear, statusFilter]);

  useEffect(() => {
    loadRequests();
    if (activeView === 'EMPLOYEE') loadBalances();
  }, [loadRequests, loadBalances, activeView]);

  const handleCancel = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) return;
    try {
      await api.cancelLeaveRequest(id);
      showSuccessToast?.('Leave request cancelled successfully.');
      loadRequests();
      loadBalances();
    } catch {
      //
    }
  };

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);
  const filteredRequests = requests.filter((r) => {
    const q = (tableSearch || searchQuery).toLowerCase();
    if (!q) return true;
    return (
      r.employee_name.toLowerCase().includes(q) ||
      r.leave_type_name.toLowerCase().includes(q) ||
      r.reason.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-['Sora'] text-2xl font-bold tracking-tight text-[#0E1730] dark:text-[#E8EDFB]">
            Leave Requests & Balances
          </h1>
          <p className="text-xs text-[#5B6787] dark:text-[#8D97B0] mt-1">
            Apply for leave, track real-time leave balances, and review employee leave applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { loadRequests(); loadBalances(); }}
            className="p-2 rounded-xl text-[#5B6787] hover:bg-black/5 border border-[#E3E8F2] dark:border-[#172649] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0B6FDB] hover:bg-[#0957B0] shadow-md shadow-[#0B6FDB]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 bg-[#F8FAFD] dark:bg-[#070D1A] border border-[#E3E8F2] dark:border-[#172649] rounded-2xl text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('EMPLOYEE')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeView === 'EMPLOYEE' ? 'bg-[#0B6FDB] text-white shadow-xs' : 'text-[#5B6787]'
            }`}
          >
            <User className="w-3.5 h-3.5 inline mr-1.5" /> My Leave & Balances
          </button>
          <button
            onClick={() => setActiveView('REVIEWER')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeView === 'REVIEWER' ? 'bg-[#0B6FDB] text-white shadow-xs' : 'text-[#5B6787]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 inline mr-1.5" /> All Requests (HR Review)
          </button>
        </div>

        <div className="flex items-center gap-3">
          {activeView === 'EMPLOYEE' && employees.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[#5B6787]">Employee:</span>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                className="px-2.5 py-1.5 bg-white dark:bg-[#091224] border border-[#E3E8F2] dark:border-[#1B2A4A] rounded-xl text-xs"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-[#5B6787]">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-white dark:bg-[#091224] border border-[#E3E8F2] dark:border-[#1B2A4A] rounded-xl text-xs"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#5B6787]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-[#091224] border border-[#E3E8F2] dark:border-[#1B2A4A] rounded-xl text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {pageError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{pageError}</span>
        </div>
      )}

      {activeView === 'EMPLOYEE' && (
        <LeaveBalancesCard
          balances={balances}
          year={selectedYear}
          employeeName={selectedEmployee?.name}
          isLoading={isBalancesLoading}
        />
      )}

      <div className="rounded-2xl bg-white dark:bg-[#091224] border border-[#E3E8F2] dark:border-[#172649] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E3E8F2] dark:border-[#172649] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-[#0E1730] dark:text-white flex items-center gap-2">
            <span>{activeView === 'EMPLOYEE' ? 'My Leave Request History' : 'Employee Leave Requests'}</span>
            <span className="text-xs font-normal text-[#5B6787]">({filteredRequests.length} total)</span>
          </h3>
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search by name, leave type, reason..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFD] dark:bg-[#060D1A] border border-[#E3E8F2] dark:border-[#1B2A4A] rounded-xl text-xs"
            />
          </div>
        </div>

        <LeaveRequestsTable
          requests={filteredRequests}
          isLoading={isLoading}
          activeView={activeView}
          onReview={(req) => { setReviewRequest(req); setIsReviewModalOpen(true); }}
          onCancel={handleCancel}
        />
      </div>

      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => { loadRequests(); loadBalances(); }}
        employees={employees}
        leaveTypes={leaveTypes}
        initialEmployeeId={selectedEmployeeId}
        showSuccessToast={showSuccessToast}
      />

      <LeaveReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        request={reviewRequest}
        onSuccess={() => { loadRequests(); loadBalances(); }}
        showSuccessToast={showSuccessToast}
      />
    </div>
  );
};

export default LeaveRequestsPage;

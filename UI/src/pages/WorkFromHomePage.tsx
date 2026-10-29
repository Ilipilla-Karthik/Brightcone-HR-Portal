import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  RefreshCw,
  Search,
  Home,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { Employee, WorkFromHomeRequest } from '../types';
import { api } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { ApiStatusBanner } from '../components/common/ApiStatusBanner';
import { ApplyWfhModal } from '../components/wfh/ApplyWfhModal';
import { WfhReviewModal } from '../components/wfh/WfhReviewModal';
import { WfhTable } from '../components/wfh/WfhTable';

interface WorkFromHomePageProps {
  showSuccessToast?: (msg: string) => void;
  searchQuery?: string;
}

export const WorkFromHomePage: React.FC<WorkFromHomePageProps> = ({
  showSuccessToast,
  searchQuery = '',
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(1);
  const [activeView, setActiveView] = useState<'EMPLOYEE' | 'REVIEWER'>('EMPLOYEE');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tableSearch, setTableSearch] = useState<string>('');

  const [requests, setRequests] = useState<WorkFromHomeRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<WorkFromHomeRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    api.fetchEmployees().then((res: any) => {
      if (isMounted && res.data && res.data.length > 0) {
        setEmployees(res.data);
        setSelectedEmployeeId(res.data[0].id);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.fetchWfhRequests({
        employee_id: activeView === 'EMPLOYEE' ? selectedEmployeeId : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      if (res.data) setRequests(res.data);
    } catch {
      //
    } finally {
      setIsLoading(false);
    }
  }, [activeView, selectedEmployeeId, statusFilter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === 'PENDING').length;
    const approved = requests.filter((r) => r.status === 'APPROVED').length;
    const rejected = requests.filter((r) => r.status === 'REJECTED').length;
    return { total, pending, approved, rejected };
  }, [requests]);

  const filteredRequests = requests.filter((r) => {
    const q = (tableSearch || searchQuery).toLowerCase();
    if (!q) return true;
    return r.employee_name?.toLowerCase().includes(q) || r.reason?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <ApiStatusBanner onRefresh={loadRequests} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#0B6FDB] bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
            REMOTE WORKPLACE POLICY
          </span>
          <h1 className="font-['Sora'] text-2xl font-bold tracking-tight text-[#0E1730] dark:text-[#E8EDFB] mt-1">
            Work From Home Tracker
          </h1>
          <p className="text-xs text-[#5B6787] dark:text-[#8D97B0] mt-1">
            Submit, track, and manage employee remote working requests with live PostgreSQL persistence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadRequests}
            className="p-2 rounded-xl text-[#5B6787] hover:bg-black/5 border border-[#E3E8F2] dark:border-[#172649] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0B6FDB] hover:bg-[#0957B0] shadow-md shadow-[#0B6FDB]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> <span>Request WFH</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="TOTAL RECORDS" value={stats.total} icon={Home} />
        <StatCard label="PENDING REVIEW" value={stats.pending} icon={Clock} badge={{ text: 'Action Needed', variant: 'warn' }} />
        <StatCard label="APPROVED" value={stats.approved} icon={CheckCircle2} badge={{ text: 'Permitted', variant: 'ok' }} />
        <StatCard label="REJECTED" value={stats.rejected} icon={XCircle} badge={{ text: 'Declined', variant: 'bad' }} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 bg-[#F8FAFD] dark:bg-[#070D1A] border border-[#E3E8F2] dark:border-[#172649] rounded-2xl text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('EMPLOYEE')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeView === 'EMPLOYEE' ? 'bg-[#0B6FDB] text-white shadow-xs' : 'text-[#5B6787]'
            }`}
          >
            My Requests
          </button>
          <button
            onClick={() => setActiveView('REVIEWER')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeView === 'REVIEWER' ? 'bg-[#0B6FDB] text-white shadow-xs' : 'text-[#5B6787]'
            }`}
          >
            Management Queue
          </button>
        </div>

        <div className="flex items-center gap-3">
          {activeView === 'EMPLOYEE' && employees.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[#5B6787]">As Employee:</span>
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

          <div className="flex items-center gap-1">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase transition-colors cursor-pointer ${
                  statusFilter === st ? 'bg-[#0B6FDB] text-white' : 'text-[#5B6787] hover:bg-black/5'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search WFH records..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="pl-8 pr-3 py-1 bg-white dark:bg-[#060D1A] border border-[#E3E8F2] dark:border-[#1B2A4A] rounded-xl text-xs"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#091224] border border-[#E3E8F2] dark:border-[#172649] shadow-xs overflow-hidden">
        <WfhTable
          requests={filteredRequests}
          isLoading={isLoading}
          activeView={activeView}
          onReview={(req) => { setSelectedRequest(req); setIsReviewModalOpen(true); }}
          onRequestClick={() => setIsApplyModalOpen(true)}
        />
      </div>

      <ApplyWfhModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={loadRequests}
        employees={employees}
        initialEmployeeId={selectedEmployeeId}
        showSuccessToast={showSuccessToast}
      />

      <WfhReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        request={selectedRequest}
        onSuccess={loadRequests}
        showSuccessToast={showSuccessToast}
      />
    </div>
  );
};

export default WorkFromHomePage;

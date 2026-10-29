import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  RefreshCw,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeftRight,
} from 'lucide-react';
import type { Employee, Shift, SwapRequestDetail } from '../../types';
import { api } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { ApiStatusBanner } from '../../components/common/ApiStatusBanner';
import { CreateSwapModal } from '../../components/swaps/CreateSwapModal';
import { SwapReviewModal } from '../../components/swaps/SwapReviewModal';
import { SwapRequestsTable } from '../../components/swaps/SwapRequestsTable';

interface ShiftSwapPageProps {
  showSuccessToast?: (msg: string) => void;
  searchQuery?: string;
}

export const ShiftSwapPage: React.FC<ShiftSwapPageProps> = ({
  showSuccessToast,
  searchQuery = '',
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(1);
  const [activeView, setActiveView] = useState<'EMPLOYEE' | 'REVIEWER'>('EMPLOYEE');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tableSearch, setTableSearch] = useState<string>('');

  const [requests, setRequests] = useState<SwapRequestDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<SwapRequestDetail | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([api.fetchEmployees(), api.fetchShifts()]).then(([empRes, shiftRes]) => {
      if (!isMounted) return;
      if (empRes.data && empRes.data.length > 0) {
        setEmployees(empRes.data);
        setSelectedEmployeeId(empRes.data[0].id);
      }
      if (shiftRes.data) setShifts(shiftRes.data);
    });
    return () => { isMounted = false; };
  }, []);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.fetchSwapRequests({
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

  const handleCancel = async (id: number) => {
    if (!window.confirm('Cancel this shift swap proposal?')) return;
    try {
      await api.cancelSwapRequest(id);
      showSuccessToast?.('Shift swap request cancelled.');
      loadRequests();
    } catch {
      //
    }
  };

  const filteredRequests = requests.filter((r) => {
    const q = (tableSearch || searchQuery).toLowerCase();
    if (!q) return true;
    return r.requester_name.toLowerCase().includes(q) || (r.reason && r.reason.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <ApiStatusBanner onRefresh={loadRequests} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#0B6FDB] bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
            SHIFT ROSTER SCHEDULE
          </span>
          <h1 className="font-['Sora'] text-2xl font-bold tracking-tight text-[#0E1730] dark:text-[#E8EDFB] mt-1">
            Shift Swap Requests
          </h1>
          <p className="text-xs text-[#5B6787] dark:text-[#8D97B0] mt-1">
            Exchange scheduled shifts with team members. Approved swaps atomically update the weekly roster.
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
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0B6FDB] hover:bg-[#0957B0] shadow-md shadow-[#0B6FDB]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> <span>Propose Shift Swap</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="TOTAL PROPOSALS" value={stats.total} icon={ArrowLeftRight} />
        <StatCard label="PENDING REVIEW" value={stats.pending} icon={Clock} badge={{ text: 'Action Needed', variant: 'warn' }} />
        <StatCard label="APPROVED & SWAPPED" value={stats.approved} icon={CheckCircle2} badge={{ text: 'Swapped', variant: 'ok' }} />
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
            My Swap Requests
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
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase cursor-pointer ${
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
              placeholder="Search swap records..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="pl-8 pr-3 py-1 bg-white dark:bg-[#060D1A] border border-[#E3E8F2] dark:border-[#1B2A4A] rounded-xl text-xs"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#091224] border border-[#E3E8F2] dark:border-[#172649] shadow-xs overflow-hidden">
        <SwapRequestsTable
          requests={filteredRequests}
          isLoading={isLoading}
          onReview={(req) => { setSelectedRequest(req); setIsReviewModalOpen(true); }}
          onCancel={handleCancel}
          onProposeClick={() => setIsCreateModalOpen(true)}
        />
      </div>

      <CreateSwapModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadRequests}
        employees={employees}
        shifts={shifts}
        initialRequesterId={selectedEmployeeId}
        showSuccessToast={showSuccessToast}
      />

      <SwapReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        request={selectedRequest}
        onSuccess={loadRequests}
        showSuccessToast={showSuccessToast}
      />
    </div>
  );
};

export default ShiftSwapPage;

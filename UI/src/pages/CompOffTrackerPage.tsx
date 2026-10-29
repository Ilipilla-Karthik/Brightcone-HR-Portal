import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  RefreshCw,
  Search,
  Award,
  Sparkles,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import type {
  Employee,
  CompOffBalance,
  CompOffEntitlement,
  CompOffRequest,
} from '../types';
import { api } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { ApiStatusBanner } from '../components/common/ApiStatusBanner';
import { ApplyCompOffModal } from '../components/comp_off/ApplyCompOffModal';
import { GrantEntitlementModal } from '../components/comp_off/GrantEntitlementModal';
import { CompOffReviewModal } from '../components/comp_off/CompOffReviewModal';
import { CompOffTables } from '../components/comp_off/CompOffTables';

interface CompOffTrackerPageProps {
  showSuccessToast?: (msg: string) => void;
  searchQuery?: string;
}

export const CompOffTrackerPage: React.FC<CompOffTrackerPageProps> = ({
  showSuccessToast,
  searchQuery = '',
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(1);
  const [activeView, setActiveView] = useState<'EMPLOYEE' | 'REVIEWER'>('EMPLOYEE');
  const [activeSubTab, setActiveSubTab] = useState<'REQUESTS' | 'ENTITLEMENTS'>('REQUESTS');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tableSearch, setTableSearch] = useState<string>('');

  const [balance, setBalance] = useState<CompOffBalance | null>(null);
  const [requests, setRequests] = useState<CompOffRequest[]>([]);
  const [entitlements, setEntitlements] = useState<CompOffEntitlement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [isGrantModalOpen, setIsGrantModalOpen] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<CompOffRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    api.fetchEmployees().then((res: any) => {
      if (!isMounted) return;
      if (res.data && res.data.length > 0) {
        setEmployees(res.data);
        setSelectedEmployeeId(res.data[0].id);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const empId = activeView === 'EMPLOYEE' ? selectedEmployeeId : undefined;
      const [balRes, reqRes, entRes] = await Promise.all([
        selectedEmployeeId ? api.fetchCompOffBalance(selectedEmployeeId) : Promise.resolve({ data: null }),
        api.fetchCompOffRequests({ employee_id: empId, status: statusFilter !== 'ALL' ? statusFilter : undefined }),
        api.fetchCompOffEntitlements(empId),
      ]);
      if (balRes.data) setBalance(balRes.data);
      if (reqRes.data) setRequests(reqRes.data);
      if (entRes.data) setEntitlements(entRes.data);
    } catch {
      //
    } finally {
      setIsLoading(false);
    }
  }, [activeView, selectedEmployeeId, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    return {
      available: balance ? `${balance.available_days} days` : '0.0 days',
      totalEarned: balance ? `${balance.total_earned_days} days` : '0.0 days',
      used: balance ? `${balance.used_days} days` : '0.0 days',
      pending: balance ? `${balance.pending_days} days` : '0.0 days',
    };
  }, [balance]);

  const filteredRequests = requests.filter((r) => {
    const q = (tableSearch || searchQuery).toLowerCase();
    if (!q) return true;
    return r.employee_name?.toLowerCase().includes(q) || r.reason?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <ApiStatusBanner onRefresh={loadData} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#0B6FDB] bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
            OVERTIME COMPENSATORY BALANCE
          </span>
          <h1 className="font-['Sora'] text-2xl font-bold tracking-tight text-[#0E1730] dark:text-[#E8EDFB] mt-1">
            Comp-Off Tracker
          </h1>
          <p className="text-xs text-[#5B6787] dark:text-[#8D97B0] mt-1">
            Track earned compensatory leave from weekend or emergency shifts, view live balances, and submit redemption requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 rounded-xl text-[#5B6787] hover:bg-black/5 border border-[#E3E8F2] dark:border-[#172649] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsGrantModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
          >
            <Award className="w-4 h-4" /> <span>+ Grant Comp-Off</span>
          </button>
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0B6FDB] hover:bg-[#0957B0] shadow-md shadow-[#0B6FDB]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> <span>Apply Comp-Off</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="AVAILABLE BALANCE" value={stats.available} icon={Sparkles} badge={{ text: 'Available', variant: 'ok' }} />
        <StatCard label="TOTAL EARNED" value={stats.totalEarned} icon={Award} />
        <StatCard label="USED / REDEEMED" value={stats.used} icon={CheckCircle2} />
        <StatCard label="PENDING USAGE" value={stats.pending} icon={Clock} badge={{ text: 'Pending', variant: 'warn' }} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 bg-[#F8FAFD] dark:bg-[#070D1A] border border-[#E3E8F2] dark:border-[#172649] rounded-2xl text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('REQUESTS')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeSubTab === 'REQUESTS' ? 'bg-[#0B6FDB] text-white shadow-xs' : 'text-[#5B6787]'
            }`}
          >
            Usage Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveSubTab('ENTITLEMENTS')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeSubTab === 'ENTITLEMENTS' ? 'bg-[#0B6FDB] text-white shadow-xs' : 'text-[#5B6787]'
            }`}
          >
            Earned History ({entitlements.length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[#5B6787]">View as:</span>
            <select
              value={activeView}
              onChange={(e) => setActiveView(e.target.value as any)}
              className="px-2.5 py-1.5 bg-white dark:bg-[#091224] border border-[#E3E8F2] dark:border-[#1B2A4A] rounded-xl text-xs"
            >
              <option value="EMPLOYEE">Individual Employee</option>
              <option value="REVIEWER">All Employees</option>
            </select>
          </div>

          {activeView === 'EMPLOYEE' && employees.length > 0 && (
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-white dark:bg-[#091224] border border-[#E3E8F2] dark:border-[#1B2A4A] rounded-xl text-xs"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-1">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold uppercase cursor-pointer ${
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
              placeholder="Search records..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="pl-8 pr-3 py-1 bg-white dark:bg-[#060D1A] border border-[#E3E8F2] dark:border-[#1B2A4A] rounded-xl text-xs"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#091224] border border-[#E3E8F2] dark:border-[#172649] shadow-xs overflow-hidden">
        <CompOffTables
          activeSubTab={activeSubTab}
          requests={filteredRequests}
          entitlements={entitlements}
          isLoading={isLoading}
          onReview={(req) => { setSelectedRequest(req); setIsReviewModalOpen(true); }}
          onApplyClick={() => setIsApplyModalOpen(true)}
        />
      </div>

      <ApplyCompOffModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={loadData}
        employees={employees}
        initialEmployeeId={selectedEmployeeId}
        showSuccessToast={showSuccessToast}
      />

      <GrantEntitlementModal
        isOpen={isGrantModalOpen}
        onClose={() => setIsGrantModalOpen(false)}
        onSuccess={loadData}
        employees={employees}
        showSuccessToast={showSuccessToast}
      />

      <CompOffReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        request={selectedRequest}
        onSuccess={loadData}
        showSuccessToast={showSuccessToast}
      />
    </div>
  );
};

export default CompOffTrackerPage;

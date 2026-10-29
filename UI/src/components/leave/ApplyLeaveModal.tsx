import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import type {
  Employee,
  LeaveType,
  CreateLeaveRequestPayload,
  LeaveCalculationResult,
  LeaveBalanceItem,
} from '../../types';
import { api } from '../../services/api';
import { LeaveCalculationPreview } from './LeaveCalculationPreview';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employees: Employee[];
  leaveTypes: LeaveType[];
  initialEmployeeId?: number | null;
  showSuccessToast?: (msg: string) => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employees,
  leaveTypes,
  initialEmployeeId,
  showSuccessToast,
}) => {
  const [employeeId, setEmployeeId] = useState<number>(0);
  const [leaveTypeId, setLeaveTypeId] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isHalfDay, setIsHalfDay] = useState<boolean>(false);
  const [reason, setReason] = useState<string>('');

  const [balances, setBalances] = useState<LeaveBalanceItem[]>([]);
  const [calculationPreview, setCalculationPreview] = useState<LeaveCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const defaultEmp = initialEmployeeId || (employees.length > 0 ? employees[0].id : 0);
      setEmployeeId(defaultEmp);
      const activeTypes = leaveTypes.filter((lt) => lt.is_active);
      const defaultLt = activeTypes.length > 0 ? activeTypes[0].id : 0;
      setLeaveTypeId(defaultLt);
      setStartDate('');
      setEndDate('');
      setIsHalfDay(false);
      setReason('');
      setFormError(null);
      setCalculationPreview(null);
    }
  }, [isOpen, initialEmployeeId, employees, leaveTypes]);

  useEffect(() => {
    if (isOpen && employeeId) {
      api.fetchLeaveBalances(employeeId, 2026).then((res: any) => {
        if (res.data) setBalances(res.data.balances || []);
      });
    }
  }, [isOpen, employeeId]);

  useEffect(() => {
    if (!startDate || !endDate || !leaveTypeId) {
      setCalculationPreview(null);
      return;
    }
    const lt = leaveTypes.find((t) => t.id === leaveTypeId);
    if (!lt) return;

    let isCurrent = true;
    setIsCalculating(true);
    api.calculateLeaveDays({
      start_date: startDate,
      end_date: endDate,
      leave_type_code: lt.code,
      is_half_day: isHalfDay,
    })
      .then((res: any) => {
        if (!isCurrent) return;
        setIsCalculating(false);
        if (res.data) setCalculationPreview(res.data);
      })
      .catch(() => {
        if (isCurrent) setIsCalculating(false);
      });

    return () => { isCurrent = false; };
  }, [startDate, endDate, leaveTypeId, isHalfDay, leaveTypes]);

  if (!isOpen) return null;

  const selectedEmployee = employees.find((e) => e.id === employeeId);
  const currentBalance = balances.find((b) => b.leave_type_id === leaveTypeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!employeeId || !leaveTypeId || !startDate || !endDate || !reason.trim()) {
      setFormError('Please fill out all required fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: CreateLeaveRequestPayload = {
        employee_id: employeeId,
        leave_type_id: leaveTypeId,
        start_date: startDate,
        end_date: endDate,
        is_half_day: isHalfDay,
        reason: reason.trim(),
      };
      await api.createLeaveRequest(payload);
      showSuccessToast?.(`Leave application submitted for ${selectedEmployee?.name || 'Employee'}.`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0A1326] border border-[#E3E8F2] dark:border-[#1C3262] rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-[#0E1730] dark:text-white">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3E8F2] dark:border-[#16274E] bg-[#F8FAFD] dark:bg-[#0E1B38]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B6FDB]/10 text-[#0B6FDB] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0E1730] dark:text-white">Apply for Leave</h3>
              <p className="text-[11px] text-[#5B6787]">Submit a time-off application</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#5B6787] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mx-6 mt-4 p-3 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-start gap-2.5 text-xs text-[#D97706] dark:text-[#FBBF24]">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Security Note:</span> In this testing environment, employee context is selectable for review.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {formError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Employee</label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F8FAFD] dark:bg-[#060D1A] border border-[#E3E8F2] dark:border-[#1B2A4A] rounded-xl text-xs"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Leave Type</label>
              <select
                value={leaveTypeId}
                onChange={(e) => setLeaveTypeId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#F8FAFD] dark:bg-[#060D1A] border border-[#E3E8F2] dark:border-[#1B2A4A] rounded-xl text-xs"
              >
                {leaveTypes.filter((lt) => lt.is_active).map((lt) => (
                  <option key={lt.id} value={lt.id}>{lt.name} ({lt.code})</option>
                ))}
              </select>
              {currentBalance && (
                <span className="text-[11px] text-emerald-600 block mt-1">{currentBalance.remaining_days} days remaining</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFD] dark:bg-[#060D1A] border border-[#E3E8F2] dark:border-[#1B2A4A] rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFD] dark:bg-[#060D1A] border border-[#E3E8F2] dark:border-[#1B2A4A] rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="half-day"
              checked={isHalfDay}
              onChange={(e) => setIsHalfDay(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="half-day" className="text-xs">Half-Day Leave Option (0.5 days)</label>
          </div>

          <LeaveCalculationPreview
            calculationPreview={calculationPreview}
            currentBalance={currentBalance}
            isCalculating={isCalculating}
          />

          <div>
            <label className="block text-xs font-semibold mb-1">Reason for Leave</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please describe the purpose of your time off..."
              rows={3}
              className="w-full px-3 py-2 bg-[#F8FAFD] dark:bg-[#060D1A] border border-[#E3E8F2] dark:border-[#1B2A4A] rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E3E8F2] dark:border-[#16274E]">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-[#5B6787]">Cancel</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#0B6FDB] to-[#0284C7] rounded-xl shadow-md cursor-pointer"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeaveModal;

import React, { useState, useEffect } from 'react';
import type { LeaveQuota, LeaveType } from '../../types';
import { Modal } from '../common/Modal';
import { AlertCircle } from 'lucide-react';

interface LeaveQuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingQuota: LeaveQuota | null;
  leaveTypes: LeaveType[];
  onAddQuota: (quota: Omit<LeaveQuota, 'id' | 'pid' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  onUpdateQuota: (id: number, quota: Partial<LeaveQuota>) => Promise<boolean>;
}

export const LeaveQuotaModal: React.FC<LeaveQuotaModalProps> = ({
  isOpen,
  onClose,
  editingQuota,
  leaveTypes,
  onAddQuota,
  onUpdateQuota,
}) => {
  const [leaveTypeId, setLeaveTypeId] = useState<number>(leaveTypes[0]?.id || 1);
  const [year, setYear] = useState('2026');
  const [entitledDays, setEntitledDays] = useState('12.0');
  const [applicableGroup, setApplicableGroup] = useState('ALL');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingQuota) {
      setLeaveTypeId(editingQuota.leave_type_id);
      setYear(editingQuota.year.toString());
      setEntitledDays(editingQuota.entitled_days.toString());
      setApplicableGroup(editingQuota.applicable_group);
    } else {
      setLeaveTypeId(leaveTypes[0]?.id || 1);
      setYear('2026');
      setEntitledDays('12.0');
      setApplicableGroup('ALL');
    }
    setErrorMsg(null);
  }, [editingQuota, leaveTypes, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const parsedDays = parseFloat(entitledDays);
    const parsedYear = parseInt(year, 10);

    if (isNaN(parsedDays) || parsedDays <= 0) {
      setErrorMsg('Entitled days must be greater than zero.');
      return;
    }
    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      setErrorMsg('Please enter a valid policy year between 2000 and 2100.');
      return;
    }

    setIsSubmitting(true);
    let success = false;
    if (editingQuota) {
      success = await onUpdateQuota(editingQuota.id, {
        leave_type_id: leaveTypeId,
        year: parsedYear,
        entitled_days: parsedDays,
        applicable_group: applicableGroup.trim().toUpperCase() || 'ALL',
      });
    } else {
      success = await onAddQuota({
        leave_type_id: leaveTypeId,
        year: parsedYear,
        entitled_days: parsedDays,
        applicable_group: applicableGroup.trim().toUpperCase() || 'ALL',
      });
    }
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingQuota ? 'Edit Leave Quota Policy' : 'Create Leave Quota Policy'}
      description="Creates foreign-key linked quota in PostgreSQL table leave_quotas."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FDE8EA] dark:bg-[#3D141B] text-[#D93D4A] text-xs">
            <AlertCircle className="w-4 h-4 flex-none" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#0E1730] dark:text-[#E8EDFB] mb-1">
            Select Leave Type Category * (Foreign Key)
          </label>
          <select
            required
            value={leaveTypeId}
            onChange={(e) => setLeaveTypeId(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 rounded-xl text-xs bg-[#F8FAFD] dark:bg-[#122042] border border-[#E3E8F2] dark:border-[#1D2B52] focus:ring-2 focus:ring-[#0B6FDB] focus:outline-none"
          >
            {leaveTypes.map((lt) => (
              <option key={lt.id} value={lt.id}>
                {lt.name} ({lt.code}) — {lt.is_paid ? 'Paid' : 'Unpaid'}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#0E1730] dark:text-[#E8EDFB] mb-1">
              Policy Year * (2000-2100)
            </label>
            <input
              type="number"
              required
              min="2000"
              max="2100"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#F8FAFD] dark:bg-[#122042] border border-[#E3E8F2] dark:border-[#1D2B52] focus:ring-2 focus:ring-[#0B6FDB] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0E1730] dark:text-[#E8EDFB] mb-1">
              Entitled Days * (Supports Half-Days)
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              required
              value={entitledDays}
              onChange={(e) => setEntitledDays(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-[#F8FAFD] dark:bg-[#122042] border border-[#E3E8F2] dark:border-[#1D2B52] focus:ring-2 focus:ring-[#0B6FDB] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0E1730] dark:text-[#E8EDFB] mb-1">
            Applicable Employee Group *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. ALL, FEMALE_EMPLOYEES, PROBATION, CONTRACTORS"
            value={applicableGroup}
            onChange={(e) => setApplicableGroup(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs uppercase font-mono bg-[#F8FAFD] dark:bg-[#122042] border border-[#E3E8F2] dark:border-[#1D2B52] focus:ring-2 focus:ring-[#0B6FDB] focus:outline-none"
          />
          <span className="text-[11px] text-[#8D97B0] mt-1 block">
            Default is &apos;ALL&apos;. Group-specific rules override or supplement default policy.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E3E8F2] dark:border-[#1D2B52]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#E3E8F2] dark:border-[#1D2B52] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0B6FDB] hover:bg-[#0B6FDB]/90 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Saving...' : editingQuota ? 'Update Quota Policy' : 'Save Quota Allocation'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState, useEffect } from 'react';
import type { LeaveType } from '../../types';
import { Modal } from '../common/Modal';
import { AlertCircle } from 'lucide-react';

interface LeaveTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLeaveType: LeaveType | null;
  leaveTypes: LeaveType[];
  onAddLeaveType: (lt: Omit<LeaveType, 'id' | 'pid' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  onUpdateLeaveType: (id: number, lt: Partial<LeaveType>) => Promise<boolean>;
}

export const LeaveTypeModal: React.FC<LeaveTypeModalProps> = ({
  isOpen,
  onClose,
  editingLeaveType,
  leaveTypes,
  onAddLeaveType,
  onUpdateLeaveType,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isPaid, setIsPaid] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingLeaveType) {
      setName(editingLeaveType.name);
      setCode(editingLeaveType.code);
      setDescription(editingLeaveType.description || '');
      setIsPaid(editingLeaveType.is_paid);
      setIsActive(editingLeaveType.is_active);
    } else {
      setName('');
      setCode('');
      setDescription('');
      setIsPaid(true);
      setIsActive(true);
    }
    setErrorMsg(null);
  }, [editingLeaveType, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = name.trim();
    const cleanCode = code.trim().toUpperCase();

    if (!cleanName || !cleanCode) {
      setErrorMsg('Category name and code are both required.');
      return;
    }

    // Check unique code
    const duplicate = leaveTypes.some(
      (lt) => lt.id !== editingLeaveType?.id && lt.code.toUpperCase() === cleanCode
    );

    if (duplicate) {
      setErrorMsg(`A leave category with code "${cleanCode}" already exists. Codes must be unique.`);
      return;
    }

    setIsSubmitting(true);
    let success = false;
    if (editingLeaveType) {
      success = await onUpdateLeaveType(editingLeaveType.id, {
        name: cleanName,
        code: cleanCode,
        description: description.trim() || null,
        is_paid: isPaid,
        is_active: isActive,
      });
    } else {
      success = await onAddLeaveType({
        name: cleanName,
        code: cleanCode,
        description: description.trim() || null,
        is_paid: isPaid,
        is_active: isActive,
      });
    }
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingLeaveType ? 'Edit Leave Category' : 'Create Leave Category'}
      description={
        editingLeaveType
          ? `Update classification rules for leave type ${editingLeaveType.code}.`
          : 'Defines a master leave category in PostgreSQL table leave_types.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FDE8EA] dark:bg-[#3D141B] text-[#D93D4A] text-xs">
            <AlertCircle className="w-4 h-4 flex-none" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#0E1730] dark:text-[#E8EDFB] mb-1">
              Leave Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Bereavement Leave"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-[#F8FAFD] dark:bg-[#122042] border border-[#E3E8F2] dark:border-[#1D2B52] focus:ring-2 focus:ring-[#0B6FDB] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0E1730] dark:text-[#E8EDFB] mb-1">
              Code * (Unique)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. BL"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs uppercase font-mono bg-[#F8FAFD] dark:bg-[#122042] border border-[#E3E8F2] dark:border-[#1D2B52] focus:ring-2 focus:ring-[#0B6FDB] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#0E1730] dark:text-[#E8EDFB] mb-1">
            Description (Policy guidance)
          </label>
          <textarea
            rows={2}
            placeholder="Eligibility guidelines and entitlement rules for this category..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-[#F8FAFD] dark:bg-[#122042] border border-[#E3E8F2] dark:border-[#1D2B52] focus:ring-2 focus:ring-[#0B6FDB] focus:outline-none"
          />
        </div>

        <div className="pt-2 border-t border-[#E3E8F2] dark:border-[#1D2B52] space-y-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
              className="w-4 h-4 rounded text-[#0B6FDB] focus:ring-[#0B6FDB]"
            />
            <span className="text-xs font-medium text-[#0E1730] dark:text-[#E8EDFB]">
              Paid Leave (Salary paid as normal during absence)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-[#0B6FDB] focus:ring-[#0B6FDB]"
            />
            <span className="text-xs font-medium text-[#0E1730] dark:text-[#E8EDFB]">
              Active Policy (Visible to employees in leave application portal)
            </span>
          </label>
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
            {isSubmitting ? 'Saving...' : editingLeaveType ? 'Update Policy' : 'Create Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

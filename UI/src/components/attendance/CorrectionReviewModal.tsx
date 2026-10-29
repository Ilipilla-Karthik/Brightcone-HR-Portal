import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import type { AttendanceCorrectionRequest, ApproveCorrectionPayload, RejectCorrectionPayload } from '../../types';
import { attendanceApi } from '../../services/attendanceApi';
import { CorrectionAuditSnapshot } from './CorrectionAuditSnapshot';

interface CorrectionReviewModalProps {
  request: AttendanceCorrectionRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  showSuccessToast?: (msg: string) => void;
}

export const CorrectionReviewModal: React.FC<CorrectionReviewModalProps> = ({
  request,
  isOpen,
  onClose,
  onSuccess,
  showSuccessToast,
}) => {
  const [activeAction, setActiveAction] = useState<'IDLE' | 'APPROVE' | 'REJECT'>('IDLE');
  const [reviewerName, setReviewerName] = useState<string>('Ananya Rao (HR Ops)');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const isPending = request.status === 'PENDING';

  const formatTimeDisplay = (timeStr?: string | null): string => {
    if (!timeStr) return '--:--';
    const parts = timeStr.trim().split(':');
    if (parts.length >= 2) {
      const hour = parseInt(parts[0], 10);
      const min = parts[1];
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 === 0 ? 12 : hour % 12;
      return `${hour12 < 10 ? '0' + hour12 : hour12}:${min} ${ampm}`;
    }
    return timeStr;
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payload: ApproveCorrectionPayload = {
        reviewer_name: reviewerName.trim() || undefined,
        approval_notes: approvalNotes.trim() || undefined,
      };
      await attendanceApi.approveCorrection(request.id, payload);
      showSuccessToast?.(`Approved correction request for ${request.employee_name}.`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setErrorMsg('A rejection reason is required.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payload: RejectCorrectionPayload = {
        reviewer_name: reviewerName.trim() || undefined,
        rejection_reason: rejectionReason.trim(),
      };
      await attendanceApi.rejectCorrection(request.id, payload);
      showSuccessToast?.(`Rejected correction request for ${request.employee_name}.`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Rejection failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0A1326] border border-[#E3E8F2] dark:border-[#1C3262] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3E8F2] dark:border-[#16274E] bg-[#F8FAFD] dark:bg-[#0E1B38]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B6FDB]/10 text-[#0B6FDB] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0E1730] dark:text-white">Review Correction Request #{request.id}</h3>
              <p className="text-[11px] text-[#5B6787]">HR authorization workflow</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#5B6787] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <CorrectionAuditSnapshot request={request} formatTimeDisplay={formatTimeDisplay} />

          {isPending && activeAction === 'IDLE' && (
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveAction('APPROVE')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#10B981] to-[#059669] hover:brightness-110 shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> Authorize Correction
              </button>
              <button
                type="button"
                onClick={() => setActiveAction('REJECT')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 cursor-pointer"
              >
                <XCircle className="w-4 h-4" /> Reject Request
              </button>
            </div>
          )}

          {isPending && activeAction === 'APPROVE' && (
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3 animate-in fade-in">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Authorization
              </span>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Reviewer Name"
                className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E3E8F2] text-[#0E1730]"
              />
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Optional approval notes..."
                rows={2}
                className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E3E8F2] text-[#0E1730]"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setActiveAction('IDLE')} className="px-3 py-1.5 text-xs text-[#5B6787]">Back</button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#059669] hover:bg-[#047857] rounded-lg shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Confirm Approve'}
                </button>
              </div>
            </div>
          )}

          {isPending && activeAction === 'REJECT' && (
            <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-3 animate-in fade-in">
              <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Rejection Details
              </span>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Mandatory rejection reason..."
                rows={2}
                className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-[#E3E8F2] text-[#0E1730]"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setActiveAction('IDLE')} className="px-3 py-1.5 text-xs text-[#5B6787]">Back</button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorrectionReviewModal;

import React, { useEffect } from 'react';
import { X, Bell, Award } from 'lucide-react';
import { CompletionTrackerRecord } from '../../services/types';
import styles from './EmployeeDetailModal.module.css';

interface EmployeeDetailModalProps {
  isOpen: boolean;
  employee: CompletionTrackerRecord | null;
  onClose: () => void;
  onRemind?: (employeeId: string, employeeName: string) => Promise<void>;
  isReminding?: boolean;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  isOpen,
  employee,
  onClose,
  onRemind,
  isReminding = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !employee) return null;

  const initials = employee.employee_name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const items = employee.items || [];
  const hasIncomplete = employee.pending_count > 0 || employee.overdue_count > 0;

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="emp-detail-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.head}>
          <div className={styles.empHeader}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.empMeta}>
              <h2 id="emp-detail-title" className={styles.empName}>
                {employee.employee_name}
              </h2>
              <div className={styles.empSub}>
                <code>{employee.employee_id}</code>
                <span>•</span>
                <span className={styles.deptBadge}>{employee.department || 'General'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Summary Bar */}
        <div className={styles.summaryBar}>
          <div className={styles.statItem}>
            <span className={styles.statItemLabel}>Assigned</span>
            <span className={styles.statItemVal}>{employee.assigned_count}</span>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statItemLabel}>Completed</span>
            <span className={styles.statItemVal}>{employee.completed_count}</span>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statItemLabel}>Pending</span>
            <span className={styles.statItemVal}>{employee.pending_count}</span>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statItemLabel}>Overdue</span>
            <span
              className={
                employee.overdue_count > 0
                  ? `${styles.statItemVal} ${styles.statItemValBad}`
                  : styles.statItemVal
              }
            >
              {employee.overdue_count}
            </span>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statItemLabel}>Progress</span>
            <span className={styles.statItemVal}>
              {employee.assigned_count > 0 ? `${employee.progress_pct}%` : '— / No assignments'}
            </span>
          </div>

          <div>
            {onRemind && (
              <button
                type="button"
                className={styles.remindBtn}
                onClick={() => onRemind(employee.employee_id, employee.employee_name)}
                disabled={isReminding || !hasIncomplete}
                title={
                  !hasIncomplete
                    ? 'All assigned training completed'
                    : 'Send reminder for incomplete courses'
                }
              >
                <Bell size={14} />
                <span>{isReminding ? 'Sending...' : 'Remind'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Detailed Items Body */}
        <div className={styles.body}>
          <div className={styles.sectionTitle}>
            <span>Assigned Training Items ({items.length})</span>
            <span
              className={`${styles.pill} ${
                employee.status === 'Compliant'
                  ? styles.pCompliant
                  : employee.status === 'In progress'
                  ? styles.pInProgress
                  : employee.status === 'Overdue'
                  ? styles.pOverdue
                  : styles.pNotStarted
              }`}
            >
              {employee.status}
            </span>
          </div>

          {items.length === 0 ? (
            <div className={styles.emptyState}>
              No training items currently assigned to this employee.
            </div>
          ) : (
            <div className={styles.itemList}>
              {items.map((item) => {
                const isItemOverdue = item.status === 'Overdue';
                const isItemDone = item.status === 'Completed' || item.progress === 100;

                return (
                  <div key={item.id} className={styles.itemCard}>
                    <div className={styles.itemTop}>
                      <div className={styles.itemTitleArea}>
                        <h3 className={styles.itemTitle}>{item.title}</h3>
                        <div className={styles.itemBadges}>
                          <span className={styles.kindBadge}>{item.training_type}</span>

                          {item.is_assessment ? (
                            <span className={styles.assessmentBadge} title="Assessment-backed course with verified score">
                              <Award size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                              Assessment-backed
                            </span>
                          ) : (
                            <span className={styles.selfReportBadge} title="Self-reported completion">
                              Self-reported
                            </span>
                          )}

                          {item.score !== undefined && item.score !== null && (
                            <span className={styles.scoreBadge}>
                              Score: {item.score}%
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`${styles.pill} ${
                          isItemDone
                            ? styles.pCompliant
                            : item.status === 'In progress'
                            ? styles.pInProgress
                            : isItemOverdue
                            ? styles.pOverdue
                            : styles.pNotStarted
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className={styles.itemProgressRow}>
                      <div className={styles.itemProgressWrap}>
                        <div className={styles.progressBarTrack}>
                          <div
                            className={`${styles.progressBarFill} ${
                              isItemOverdue
                                ? styles.progressBarFillBad
                                : !isItemDone
                                ? styles.progressBarFillWarn
                                : ''
                            }`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span style={{ fontWeight: 600, minWidth: 36 }}>
                          {item.progress}%
                        </span>
                      </div>

                      <div className={styles.itemDates}>
                        {item.due_date && <span>Due: {item.due_date}</span>}
                        {item.completed_at && (
                          <span>Completed: {item.completed_at.slice(0, 10)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;

import React from 'react';
import { Eye, Bell } from 'lucide-react';
import { CompletionTrackerRecord } from '../../services/types';
import styles from './TrainingCompletionTable.module.css';

interface TrainingCompletionTableProps {
  records: CompletionTrackerRecord[];
  currentPage: number;
  totalPages: number;
  startIndex: number;
  pageSize: number;
  totalFiltered: number;
  onPageChange: (page: number) => void;
  onOpenDetails: (record: CompletionTrackerRecord) => void;
  onRemindSingle: (empId: string, empName: string) => void;
  isSingleReminding: boolean;
  isAdmin: boolean;
  getInitials: (name: string) => string;
}

export const TrainingCompletionTable: React.FC<TrainingCompletionTableProps> = ({
  records,
  currentPage,
  totalPages,
  startIndex,
  pageSize,
  totalFiltered,
  onPageChange,
  onOpenDetails,
  onRemindSingle,
  isSingleReminding,
  isAdmin,
  getInitials,
}) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Compliant':
        return styles.badgeOk;
      case 'In progress':
        return styles.badgeWarn;
      case 'Overdue':
        return styles.badgeBad;
      default:
        return styles.badgeMuted;
    }
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrap}>
        <table className={styles.table} aria-label="Training completion records">
          <thead>
            <tr>
              <th scope="col">Employee</th>
              <th scope="col">Department</th>
              <th scope="col" style={{ textAlign: 'center' }}>Assigned</th>
              <th scope="col" style={{ textAlign: 'center' }}>Completed</th>
              <th scope="col" style={{ textAlign: 'center' }}>Overdue</th>
              <th scope="col">Progress</th>
              <th scope="col">Status</th>
              <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? (
              records.map((emp) => (
                <tr key={emp.employee_id}>
                  <td>
                    <div className={styles.who}>
                      <span className={styles.avatar}>{getInitials(emp.employee_name)}</span>
                      <div className={styles.whoMeta}>
                        <span className={styles.whoName}>{emp.employee_name}</span>
                        <span className={styles.whoId}>{emp.employee_id}</span>
                      </div>
                    </div>
                  </td>
                  <td className={styles.deptCell}>{emp.department}</td>
                  <td style={{ textAlign: 'center' }}><b>{emp.assigned_count}</b></td>
                  <td style={{ textAlign: 'center', color: 'var(--ok, #0FA37F)' }}>
                    <b>{emp.completed_count}</b>
                  </td>
                  <td style={{ textAlign: 'center', color: emp.overdue_count > 0 ? 'var(--bad, #E02E2E)' : 'inherit' }}>
                    <b>{emp.overdue_count}</b>
                  </td>
                  <td>
                    <div className={styles.progressWrap}>
                      <div
                        className={styles.progressBar}
                        role="progressbar"
                        aria-valuenow={emp.progress_pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <span
                          className={`${styles.progressFill} ${
                            emp.progress_pct === 100
                              ? styles.fillOk
                              : emp.overdue_count > 0
                              ? styles.fillBad
                              : styles.fillWarn
                          }`}
                          style={{ width: `${emp.progress_pct}%` }}
                        />
                      </div>
                      <span className={styles.progressPct}>{emp.progress_pct}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(emp.status)}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.viewBtn}
                        onClick={() => onOpenDetails(emp)}
                        title={`View ${emp.employee_name}'s course progress`}
                      >
                        <Eye size={14} />
                        <span>Details</span>
                      </button>

                      {isAdmin && emp.overdue_count > 0 && (
                        <button
                          type="button"
                          className={styles.nudgeBtn}
                          onClick={() => onRemindSingle(emp.employee_id, emp.employee_name)}
                          disabled={isSingleReminding}
                          title={`Send overdue reminder to ${emp.employee_name}`}
                        >
                          <Bell size={13} />
                          <span>Remind</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className={styles.emptyState}>
                  No employees match the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalFiltered > pageSize && (
        <div className={styles.paginationRow}>
          <span className={styles.pageInfo}>
            Showing {startIndex + 1}–{Math.min(startIndex + pageSize, totalFiltered)} of {totalFiltered} employees
          </span>
          <div className={styles.paginationBtns}>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={currentPage <= 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            >
              Previous
            </button>
            <span className={styles.pageIndicator}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

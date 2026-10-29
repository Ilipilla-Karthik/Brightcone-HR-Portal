import React from 'react';
import { Download } from 'lucide-react';
import { CycleReviewItem } from '../../services/types';
import styles from './PerformanceAdminPage.module.css';

interface PerformanceReviewTableProps {
  reviews: CycleReviewItem[];
  onExport: () => void;
  onRemind: (employeeId: string, employeeName: string) => void;
  onRate: (review: CycleReviewItem) => void;
  remindingId: string | null;
}

export const PerformanceReviewTable: React.FC<PerformanceReviewTableProps> = ({
  reviews,
  onExport,
  onRemind,
  onRate,
  remindingId,
}) => {
  return (
    <div className={styles.tableCard}>
      <div className={styles.tableHead}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
          Review status
        </h3>
        <button
          type="button"
          className={styles.linkBtn}
          onClick={onExport}
          title="Download CSV report of employee ratings"
        >
          <Download size={14} />
          <span>Export ratings</span>
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table} aria-label="Employee Review Status Table">
          <thead>
            <tr>
              <th scope="col">Employee</th>
              <th scope="col">Manager</th>
              <th scope="col">Self-review</th>
              <th scope="col">Goals</th>
              <th scope="col">Rating</th>
              <th scope="col" style={{ textAlign: 'right' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {reviews.length > 0 ? (
              reviews.map((r) => {
                const isSubmitted = r.self_review_status === 'Submitted';
                const initials = r.employee_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <tr key={r.id}>
                    <td>
                      <div className={styles.whoCell}>
                        <div className={styles.avatar}>{initials}</div>
                        <div>
                          <p className={styles.empName}>{r.employee_name}</p>
                          <p className={styles.empDept}>{r.department}</p>
                        </div>
                      </div>
                    </td>
                    <td>{r.manager_name || '—'}</td>
                    <td>
                      <span
                        className={`${styles.pill} ${
                          isSubmitted ? styles.pOk : styles.pMute
                        }`}
                      >
                        {r.self_review_status}
                      </span>
                    </td>
                    <td>{r.goals_count}</td>
                    <td>
                      {r.rating ? (
                        <b style={{ color: 'var(--text, #0f172a)' }}>{r.rating}</b>
                      ) : (
                        <span style={{ color: 'var(--text-muted, #94a3b8)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div className={styles.actionCell}>
                        {!isSubmitted && (
                          <button
                            type="button"
                            className={`${styles.btn} ${styles.btnSm}`}
                            onClick={() => onRemind(r.employee_id, r.employee_name)}
                            disabled={remindingId === r.employee_id}
                            title="Send reminder to submit self-review"
                          >
                            {remindingId === r.employee_id ? 'Sending...' : 'Remind'}
                          </button>
                        )}
                        <button
                          type="button"
                          className={`${styles.btn} ${styles.btnSm} ${styles.btnPrimary}`}
                          onClick={() => onRate(r)}
                          title="Set final rating and recommended increment"
                        >
                          Rate
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px' }}>
                  No employee reviews found in this cycle.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PerformanceReviewTable;

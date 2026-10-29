import React from 'react';
import { LearnDashboardMetrics } from '../../services/types';
import styles from './LearnDashboard.module.css';

interface OpenMandatoryTableProps {
  rows: LearnDashboardMetrics['open_mandatory'];
  onNudge: (assignmentId: string, employeeName: string, employeeId: string) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  pageSize?: number;
}

const AV_COLORS = ['#2457F5', '#14B8E6', '#7C5CFF', '#0FA37F', '#E0811D', '#D9466F', '#3B82C4', '#6366F1'];

export const OpenMandatoryTable: React.FC<OpenMandatoryTableProps> = ({
  rows,
  onNudge,
  currentPage,
  setCurrentPage,
  pageSize = 8,
}) => {
  const totalOpen = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalOpen / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRows = rows.slice(startIndex, startIndex + pageSize);

  return (
    <div className={styles.tableCard}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Mandatory courses still open</h2>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table} aria-label="Open mandatory courses table">
          <thead>
            <tr>
              <th scope="col">Employee</th>
              <th scope="col">Course</th>
              <th scope="col">Due</th>
              <th scope="col">Progress</th>
              <th scope="col" style={{ textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row) => {
                const initials = row.employee_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase();
                const avColor =
                  AV_COLORS[[...row.employee_name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % AV_COLORS.length];
                return (
                  <tr key={row.assignment_id}>
                    <td>
                      <div className={styles.who}>
                        <span className={styles.av} style={{ backgroundColor: avColor }}>
                          {initials}
                        </span>
                        <div>
                          <b>{row.employee_name}</b>
                          <span>{row.department}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{row.course_title}</td>
                    <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      {row.due_date ? row.due_date : '—'}
                    </td>
                    <td>
                      <div style={{ minWidth: 130 }}>
                        <div
                          className={styles.bar}
                          role="progressbar"
                          aria-valuenow={row.progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <span style={{ width: `${row.progress}%` }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                          {row.progress}%
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className={styles.nudgeBtn}
                        onClick={() => onNudge(row.assignment_id, row.employee_name, row.employee_id)}
                        aria-label={`Nudge ${row.employee_name} for ${row.course_title}`}
                      >
                        Nudge
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className={styles.emptyState}>
                  Everyone is up to date.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalOpen > pageSize && (
        <div className={styles.paginationRow}>
          <span>
            Showing {startIndex + 1}–{Math.min(startIndex + pageSize, totalOpen)} of {totalOpen} records
          </span>
          <div className={styles.paginationBtns}>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className={styles.pageBtn}
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenMandatoryTable;

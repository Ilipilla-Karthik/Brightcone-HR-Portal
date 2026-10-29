import React from 'react';
import { Shield, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import styles from './TrainingCompletionPage.module.css';

interface CompletionOverviewCardsProps {
  aggregates: {
    totalAssigned: number;
    totalCompleted: number;
    totalPending: number;
    totalOverdue: number;
    overallPct: number;
  };
  counts: Record<string, number>;
}

export const CompletionOverviewCards: React.FC<CompletionOverviewCardsProps> = ({
  aggregates,
  counts,
}) => {
  return (
    <div className={styles.topGrid}>
      {/* Compliance Donut Card */}
      <div className={styles.donutCard}>
        <div className={styles.donutHeader}>
          <span className={styles.statLabel}>Overall compliance</span>
          <span className={styles.statSub}>
            {aggregates.totalAssigned > 0
              ? `${aggregates.totalCompleted} / ${aggregates.totalAssigned} items`
              : 'No assignments'}
          </span>
        </div>

        <div className={styles.donutWrap}>
          <div
            className={styles.donut}
            style={{ '--p': aggregates.overallPct } as React.CSSProperties}
            role="img"
            aria-label={`${aggregates.overallPct}% overall compliance`}
          >
            <b>{aggregates.totalAssigned > 0 ? `${aggregates.overallPct}%` : '0%'}</b>
          </div>

          <div className={styles.donutLegend}>
            <div className={styles.donutLegendItem}>
              <span className={styles.legendLabel}>
                <span className={`${styles.legendDot} ${styles.dotOk}`} />
                Compliant
              </span>
              <span className={styles.legendCount}>{counts.Compliant || 0}</span>
            </div>

            <div className={styles.donutLegendItem}>
              <span className={styles.legendLabel}>
                <span className={`${styles.legendDot} ${styles.dotWarn}`} />
                In progress
              </span>
              <span className={styles.legendCount}>{counts['In progress'] || 0}</span>
            </div>

            <div className={styles.donutLegendItem}>
              <span className={styles.legendLabel}>
                <span className={`${styles.legendDot} ${styles.dotBad}`} />
                Overdue
              </span>
              <span className={styles.legendCount}>{counts.Overdue || 0}</span>
            </div>

            <div className={styles.donutLegendItem}>
              <span className={styles.legendLabel}>
                <span className={`${styles.legendDot} ${styles.dotMuted}`} />
                Not started
              </span>
              <span className={styles.legendCount}>{counts['Not started'] || 0}</span>
            </div>

            <div className={styles.donutLegendItem}>
              <span className={styles.legendLabel}>
                <span className={`${styles.legendDot} ${styles.dotMuted}`} />
                Not assigned
              </span>
              <span className={styles.legendCount}>{counts['Not assigned'] || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statLabel}>Total assigned</span>
            <div className={styles.statIcon}>
              <Shield size={18} />
            </div>
          </div>
          <div className={styles.statValue}>{aggregates.totalAssigned}</div>
          <div className={styles.statSub}>Across active employees</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statLabel}>Completed</span>
            <div className={`${styles.statIcon} ${styles.statIconOk}`}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div className={styles.statValue}>{aggregates.totalCompleted}</div>
          <div className={styles.statSub}>Finished & verified</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statLabel}>In progress</span>
            <div className={`${styles.statIcon} ${styles.statIconWarn}`}>
              <Clock size={18} />
            </div>
          </div>
          <div className={styles.statValue}>{aggregates.totalPending}</div>
          <div className={styles.statSub}>Within deadline window</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statLabel}>Overdue</span>
            <div className={`${styles.statIcon} ${styles.statIconBad}`}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className={styles.statValue}>{aggregates.totalOverdue}</div>
          <div className={styles.statSub}>Past target deadline</div>
        </div>
      </div>
    </div>
  );
};

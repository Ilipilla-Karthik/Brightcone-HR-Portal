import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  BookOpen,
  Clock,
  Users,
  Bell,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  getLearnDashboard,
  createCourse,
  sendReminders,
} from '../../services/api';
import {
  CreateCoursePayload,
  LearnDashboardMetrics,
} from '../../services/types';
import AddEditCourseModal from '../../components/kit/AddEditCourseModal';
import Toast, { ToastMessage } from '../../components/kit/Toast';
import { OpenMandatoryTable } from './OpenMandatoryTable';
import styles from './LearnDashboard.module.css';

const INITIAL_PAGE_SIZE = 8;

export const LearnDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<LearnDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isReminding, setIsReminding] = useState(false);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, text }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getLearnDashboard();
      setMetrics(data);
    } catch {
      setError('Unable to load learning metrics. Please check network and retry.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddCourse = async (payload: CreateCoursePayload) => {
    try {
      await createCourse(payload);
      addToast('success', `Course "${payload.title}" created successfully`);
      await loadData();
    } catch (err: unknown) {
      addToast('error', 'Failed to create course');
      throw err;
    }
  };

  const handleRemindAllBehind = async () => {
    if (!metrics || metrics.people_behind_count === 0) {
      addToast('info', 'All employees are currently up to date on mandatory training.');
      return;
    }

    try {
      setIsReminding(true);
      const res = await sendReminders({ bulk: true });
      addToast(
        res.delivered > 0 ? 'success' : 'info',
        `${res.message}`
      );
      await loadData();
    } catch {
      addToast('error', 'Failed to send bulk reminders.');
    } finally {
      setIsReminding(false);
    }
  };

  const handleNudge = async (assignmentId: string, employeeName: string, employeeId: string) => {
    try {
      const res = await sendReminders({ assignment_id: assignmentId, employee_id: employeeId });
      const detail = res.details[0];
      if (detail && detail.status === 'Skipped') {
        addToast('info', `Reminder skipped for ${employeeName}: ${detail.reason || 'Cooldown active'}`);
      } else {
        addToast('success', `Reminder sent to ${employeeName}`);
      }
      await loadData();
    } catch {
      addToast('error', `Failed to send reminder to ${employeeName}`);
    }
  };

  if (isLoading && !metrics) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)' }}>
        <p>Loading Learn dashboard metrics...</p>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <p style={{ color: '#D93D4A' }}>{error}</p>
        <button
          onClick={loadData}
          style={{
            marginTop: 12,
            padding: '8px 16px',
            borderRadius: 8,
            background: '#0B6FDB',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const totalMandatoryAssigned =
    metrics?.compliance_breakdown?.reduce((sum, c) => sum + c.total_assigned, 0) ?? 0;
  const totalMandatoryDone =
    metrics?.compliance_breakdown?.reduce((sum, c) => sum + c.completed_count, 0) ?? 0;
  const compliance = metrics?.mandatory_compliance ?? 0;
  const hasMandatoryData = totalMandatoryAssigned > 0;
  const isComplianceGood = hasMandatoryData && compliance >= 80;
  const openMandatory = metrics?.open_mandatory || [];

  return (
    <div data-testid="learndashboard">
      {/* Dark Gradient Heading Band */}
      <section className={styles.band} aria-label="Learning dashboard overview">
        <div className={styles.bandInner}>
          <div className={styles.bandText}>
            <span className={styles.eyebrow}>
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-[#0FA37F]" />
              Learning & Development
            </span>
            <h1 className={styles.heroTitle}>Mandatory compliance at a glance</h1>
            <p className={styles.heroSub}>
              {metrics?.people_behind_count ?? 0} employees currently have open mandatory training items.
            </p>
          </div>

          <div className={styles.bandActions}>
            <button
              type="button"
              className={styles.remindBtn}
              onClick={handleRemindAllBehind}
              disabled={isReminding || (metrics?.people_behind_count ?? 0) === 0}
            >
              <Bell className="w-4 h-4" />
              <span>{isReminding ? 'Reminding...' : 'Remind all behind'}</span>
            </button>
            <button
              type="button"
              className={styles.addCourseBtn}
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Add course</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className={styles.statGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHead}>
              <span>Mandatory compliance</span>
              <ShieldCheck className="w-4 h-4" style={{ color: isComplianceGood ? '#0FA37F' : '#E0811D' }} />
            </div>
            <div className={styles.statValue}>
              {hasMandatoryData ? `${compliance}%` : '—'}
            </div>
            <div className={styles.statSub}>
              {hasMandatoryData ? (
                <span className={isComplianceGood ? styles.subSuccess : styles.subWarn}>
                  {isComplianceGood ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
                  {totalMandatoryDone}/{totalMandatoryAssigned} completions
                </span>
              ) : (
                <span>No mandatory assignments yet</span>
              )}
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHead}>
              <span>Active learners</span>
              <Users className="w-4 h-4" style={{ color: '#2457F5' }} />
            </div>
            <div className={styles.statValue}>{metrics?.active_learners_30d ?? 0}</div>
            <div className={styles.statSub}>Past 30 days active in courses</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHead}>
              <span>Catalog volume</span>
              <BookOpen className="w-4 h-4" style={{ color: '#7C5CFF' }} />
            </div>
            <div className={styles.statValue}>{metrics?.total_courses ?? 0}</div>
            <div className={styles.statSub}>
              <Link to="/learn/catalogue" className={styles.cardLink}>
                View catalogue →
              </Link>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statHead}>
              <span>Avg completion time</span>
              <Clock className="w-4 h-4" style={{ color: '#14B8E6' }} />
            </div>
            <div className={styles.statValue}>{metrics?.avg_completion_days ?? 0}d</div>
            <div className={styles.statSub}>Across all assigned items</div>
          </div>
        </div>
      </section>

      {/* Breakdown split row */}
      <div className={styles.splitRow}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Compliance by mandatory course</h2>
          </div>
          <div className={styles.breakdownList}>
            {metrics?.compliance_breakdown && metrics.compliance_breakdown.length > 0 ? (
              metrics.compliance_breakdown.map((item) => (
                <div key={item.course_id} className={styles.breakdownItem}>
                  <div className={styles.bInfo}>
                    <span className={styles.bTitle}>{item.title}</span>
                    <span className={styles.bMeta}>
                      {item.completed_count} of {item.total_assigned} completed
                    </span>
                  </div>
                  <div className={styles.bProgressWrap}>
                    <div className={styles.bar}>
                      <span style={{ width: `${item.completion_percentage}%` }} />
                    </div>
                    <span className={styles.bPercent}>{item.completion_percentage}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>No mandatory courses configured.</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Table Component */}
      <OpenMandatoryTable
        rows={openMandatory}
        onNudge={handleNudge}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageSize={INITIAL_PAGE_SIZE}
      />

      <AddEditCourseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddCourse}
        courseToEdit={null}
      />

      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default LearnDashboard;

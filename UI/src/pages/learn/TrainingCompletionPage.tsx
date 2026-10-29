import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Download, Bell } from 'lucide-react';
import {
  CompletionTrackerResponse,
  CompletionTrackerRecord,
  BulkAssignResponse,
} from '../../services/types';
import { getCompletionTracker, sendReminders } from '../../services/api';
import { BulkAssignModal } from '../../components/kit/BulkAssignModal';
import { EmployeeDetailModal } from '../../components/kit/EmployeeDetailModal';
import Toast, { ToastMessage } from '../../components/kit/Toast';
import { useAuth } from '../../services/authContext';
import { CompletionOverviewCards } from './CompletionOverviewCards';
import { TrainingCompletionTable } from './TrainingCompletionTable';
import styles from './TrainingCompletionPage.module.css';

const PAGE_SIZE = 10;

export const TrainingCompletionPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'hr_admin' || user?.role === 'admin';

  const [trackerData, setTrackerData] = useState<CompletionTrackerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<CompletionTrackerRecord | null>(null);
  const [isBulkReminding, setIsBulkReminding] = useState(false);
  const [isSingleReminding, setIsSingleReminding] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToasts((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, type, text }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadTracker = async () => {
    try {
      setIsLoading(true);
      const data = await getCompletionTracker();
      setTrackerData(data);
    } catch {
      addToast('error', 'Unable to load completion tracker data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTracker();
  }, []);

  const departments = useMemo(() => {
    if (!trackerData?.records) return [];
    return Array.from(new Set(trackerData.records.map((r) => r.department))).sort();
  }, [trackerData]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {
      All: 0,
      Compliant: 0,
      'In progress': 0,
      Overdue: 0,
      'Not started': 0,
      'Not assigned': 0,
    };
    if (!trackerData?.records) return map;
    map.All = trackerData.records.length;
    trackerData.records.forEach((r) => {
      if (map[r.status] !== undefined) {
        map[r.status] += 1;
      }
    });
    return map;
  }, [trackerData]);

  const aggregates = useMemo(() => {
    if (!trackerData?.records || trackerData.records.length === 0) {
      return { totalAssigned: 0, totalCompleted: 0, totalPending: 0, totalOverdue: 0, overallPct: 0 };
    }
    const totalAssigned = trackerData.records.reduce((s, r) => s + r.assigned_count, 0);
    const totalCompleted = trackerData.records.reduce((s, r) => s + r.completed_count, 0);
    const totalPending = trackerData.records.reduce((s, r) => s + r.pending_count, 0);
    const totalOverdue = trackerData.records.reduce((s, r) => s + r.overdue_count, 0);
    const overallPct = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;
    return { totalAssigned, totalCompleted, totalPending, totalOverdue, overallPct };
  }, [trackerData]);

  const filteredRecords = useMemo(() => {
    if (!trackerData?.records) return [];
    return trackerData.records.filter((rec) => {
      const matchesTab = activeTab === 'All' || rec.status === activeTab;
      const matchesDept = selectedDept === 'All' || rec.department === selectedDept;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        rec.employee_name.toLowerCase().includes(query) ||
        rec.employee_id.toLowerCase().includes(query);
      return matchesTab && matchesDept && matchesSearch;
    });
  }, [trackerData, activeTab, selectedDept, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + PAGE_SIZE);

  const handleBulkRemind = async () => {
    const overdueEmployees = trackerData?.records.filter((r) => r.overdue_count > 0) || [];
    if (overdueEmployees.length === 0) {
      addToast('info', 'No employees currently have overdue training items.');
      return;
    }
    try {
      setIsBulkReminding(true);
      const res = await sendReminders({
        bulk: true,
        employee_ids: overdueEmployees.map((r) => r.employee_id),
      });
      addToast('success', res.message || `Reminders sent to ${overdueEmployees.length} employees`);
    } catch {
      addToast('error', 'Failed to dispatch bulk training reminders.');
    } finally {
      setIsBulkReminding(false);
    }
  };

  const handleRemindSingle = async (employeeId: string, employeeName: string) => {
    try {
      setIsSingleReminding(true);
      await sendReminders({ employee_id: employeeId });
      addToast('success', `Reminder dispatched to ${employeeName}`);
    } catch {
      addToast('error', `Failed to deliver reminder to ${employeeName}`);
    } finally {
      setIsSingleReminding(false);
    }
  };

  const handleExportCSV = () => {
    if (!filteredRecords.length) {
      addToast('info', 'No records to export matching current filter.');
      return;
    }
    const headers = ['Employee ID', 'Employee Name', 'Department', 'Assigned', 'Completed', 'Pending', 'Overdue', 'Progress %', 'Status'];
    const rows = filteredRecords.map((r) => [
      r.employee_id,
      `"${r.employee_name.replace(/"/g, '""')}"`,
      `"${r.department.replace(/"/g, '""')}"`,
      r.assigned_count,
      r.completed_count,
      r.pending_count,
      r.overdue_count,
      `${r.progress_pct}%`,
      r.status,
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `training_completion_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('success', `Exported ${filteredRecords.length} records to CSV.`);
  };

  const getInitials = (name?: string) => {
    return (name || 'Employee').split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  };

  if (isLoading && !trackerData) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Calculating organization compliance rates...</p>
      </div>
    );
  }

  return (
    <div className={styles.page} data-testid="trainingcompletiontracker">
      <div className={styles.head}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Training completion tracker</h1>
          <p className={styles.desc}>
            Completion of security and compliance training for each employee.
          </p>
        </div>

        <div className={styles.btnGroup}>
          {isAdmin && (
            <button
              type="button"
              className={styles.remindBtn}
              onClick={handleBulkRemind}
              disabled={isBulkReminding}
            >
              <Bell size={15} />
              <span>{isBulkReminding ? 'Reminding...' : 'Bulk remind'}</span>
            </button>
          )}

          <button
            type="button"
            className={styles.exportBtn}
            onClick={handleExportCSV}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              className={styles.assignBtn}
              onClick={() => setIsBulkOpen(true)}
            >
              <Plus size={16} />
              <span>Assign course</span>
            </button>
          )}
        </div>
      </div>

      <CompletionOverviewCards aggregates={aggregates} counts={counts} />

      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {(['All', 'Compliant', 'In progress', 'Overdue', 'Not started', 'Not assigned'] as const).map(
            (tab) => (
              <button
                key={tab}
                type="button"
                className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
              >
                <span>{tab}</span>
                <span className={styles.tabBadge}>{counts[tab] || 0}</span>
              </button>
            )
          )}
        </div>

        <div className={styles.filterActions}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <select
            className={styles.deptSelect}
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      <TrainingCompletionTable
        records={paginatedRecords}
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        pageSize={PAGE_SIZE}
        totalFiltered={filteredRecords.length}
        onPageChange={setCurrentPage}
        onOpenDetails={setSelectedEmployee}
        onRemindSingle={handleRemindSingle}
        isSingleReminding={isSingleReminding}
        isAdmin={isAdmin}
        getInitials={getInitials}
      />

      {isBulkOpen && (
        <BulkAssignModal
          isOpen={isBulkOpen}
          onClose={() => setIsBulkOpen(false)}
          onSuccess={(res: BulkAssignResponse) => {
            addToast('success', res.message || 'Course assigned successfully.');
            loadTracker();
          }}
        />
      )}

      {selectedEmployee && (
        <EmployeeDetailModal
          isOpen={!!selectedEmployee}
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onRemind={handleRemindSingle}
        />
      )}

      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default TrainingCompletionPage;

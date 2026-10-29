import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Calendar as CalendarIcon,
  ArrowLeftRight,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Send,
} from 'lucide-react';
import type {
  WeeklyRosterResponse,
  Shift,
  EmployeeRosterRow,
  DayRosterEntry,
} from '../../types/attendance';
import { attendanceApi } from '../../services/attendanceApi';
import { StatCard } from '../../components/common/StatCard';
import { ApiStatusBanner } from '../../components/common/ApiStatusBanner';
import { ShiftAssignModal } from '../../components/roster/ShiftAssignModal';
import { PublishConfirmModal } from '../../components/roster/PublishConfirmModal';
import { RosterTable } from '../../components/roster/RosterTable';

export const ShiftRosterPage: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState<string>('2026-10-12');
  const [rosterData, setRosterData] = useState<WeeklyRosterResponse | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [selectedCell, setSelectedCell] = useState<{
    employee: EmployeeRosterRow;
    dayEntry: DayRosterEntry;
  } | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);

  const loadData = useCallback(async (weekStart: string) => {
    setIsLoading(true);
    try {
      const [rosterRes, shiftsRes] = await Promise.all([
        attendanceApi.fetchWeeklyRoster(weekStart),
        attendanceApi.fetchShifts(),
      ]);
      setRosterData(rosterRes);
      setShifts(shiftsRes);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(currentWeekStart);
  }, [currentWeekStart, loadData]);

  const handlePrevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d.toISOString().split('T')[0]);
  };

  const handleThisWeek = () => {
    setCurrentWeekStart('2026-10-12');
  };

  const formatDateRange = () => {
    if (!rosterData) return 'Oct 12, 2026 to Oct 18, 2026';
    const s = new Date(rosterData.week_start + 'T00:00:00');
    const e = new Date(rosterData.week_end + 'T00:00:00');
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${s.toLocaleDateString('en-US', opts)} to ${e.toLocaleDateString('en-US', opts)}`;
  };

  const handleCellClick = (employee: EmployeeRosterRow, dayEntry: DayRosterEntry) => {
    setSelectedCell({ employee, dayEntry });
  };

  const handleSaveAssignment = async (
    shiftId: number | null,
    isOff: boolean,
    notes?: string
  ) => {
    if (!selectedCell) return;
    await attendanceApi.assignShift({
      employee_id: selectedCell.employee.id,
      date: selectedCell.dayEntry.date,
      shift_id: shiftId,
      is_off: isOff,
      notes,
    });
    setToastMessage(`Updated ${selectedCell.employee.name}'s schedule.`);
    setTimeout(() => setToastMessage(null), 3000);
    await loadData(currentWeekStart);
  };

  const handlePublishRoster = async () => {
    if (!rosterData) return;
    await attendanceApi.publishRoster({
      week_start_date: rosterData.week_start,
      published_by: 'Ananya Rao',
    });
    setToastMessage(`Weekly roster published successfully.`);
    setTimeout(() => setToastMessage(null), 3000);
    await loadData(currentWeekStart);
  };

  const summary = rosterData?.summary || {
    scheduled_today: 13,
    total_employees: 14,
    shifts_defined: 4,
    shift_codes: ['GEN', 'USP', 'USC', 'NGT'],
    swap_requests_count: 2,
    on_leave_this_week_count: 1,
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      <ApiStatusBanner onRefresh={() => loadData(currentWeekStart)} />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#15A36B] text-white text-xs font-semibold rounded-xl shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#0B6FDB] mb-1">
            • SHIFT
          </span>
          <h1 className="text-2xl font-bold font-['Sora'] text-[#0E1730] dark:text-white">
            Weekly roster
          </h1>
          <p className="text-xs text-[#5B6787] dark:text-[#8D9BB8] mt-1">
            {formatDateRange()}. Click any cell to change that person&apos;s shift.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl bg-white dark:bg-[#0B152E] border border-[#E3E8F2] dark:border-[#17264D] p-1 shadow-2xs">
            <button
              onClick={handlePrevWeek}
              className="px-2.5 py-1.5 text-xs font-medium text-[#5B6787] dark:text-[#8D9BB8] hover:text-[#0E1730] dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <button
              onClick={handleThisWeek}
              className="px-3 py-1.5 text-xs font-semibold text-[#0B6FDB] bg-blue-50 dark:bg-[#142347] rounded-lg cursor-pointer"
            >
              This week
            </button>
            <button
              onClick={handleNextWeek}
              className="px-2.5 py-1.5 text-xs font-medium text-[#5B6787] dark:text-[#8D9BB8] hover:text-[#0E1730] dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#0B6FDB] to-[#0BA6CC] hover:brightness-110 shadow-lg shadow-[#0B6FDB]/30 transition-all cursor-pointer"
          >
            {rosterData?.is_published ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Published</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Publish Roster</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Scheduled today"
          value={summary.scheduled_today}
          subtext={`of ${summary.total_employees} people`}
          icon={Users}
        />
        <StatCard
          label="Shifts defined"
          value={summary.shifts_defined}
          subtext={summary.shift_codes.join(' · ')}
          icon={CalendarIcon}
        />
        <StatCard
          label="Swap requests"
          value={summary.swap_requests_count}
          subtext="Waiting for approval"
          icon={ArrowLeftRight}
        />
        <StatCard
          label="On leave this week"
          value={summary.on_leave_this_week_count}
          subtext="From approved leave"
          icon={Clock}
        />
      </div>

      {/* Roster Matrix Table */}
      <RosterTable
        employees={rosterData?.employees || []}
        onCellClick={handleCellClick}
        isLoading={isLoading}
      />

      {/* Modals */}
      <ShiftAssignModal
        isOpen={Boolean(selectedCell)}
        onClose={() => setSelectedCell(null)}
        employee={selectedCell?.employee || null}
        dayEntry={selectedCell?.dayEntry || null}
        availableShifts={shifts}
        onSave={handleSaveAssignment}
      />

      <PublishConfirmModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        weekStart={rosterData?.week_start || currentWeekStart}
        weekEnd={rosterData?.week_end || ''}
        onConfirm={handlePublishRoster}
      />
    </div>
  );
};

export default ShiftRosterPage;

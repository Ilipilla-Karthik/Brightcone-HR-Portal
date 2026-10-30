import React, { useState, useEffect, useMemo } from 'react';
import specData from '../../services/peoplePlus/spec.json';
import { fetchRecords, createRecord, updateRecord, deleteRecord } from '../../services/recordsApi';
import { fetchEmployees } from '../../services/peopleApi';
import { RecordHeader } from './RecordHeader';
import { RecordTable } from './RecordTable';
import { RecordModal } from './RecordModal';
import { RecordViewModal } from './RecordViewModal';
import { RecordExtraModals } from './RecordExtraModals';

export interface RecordModulePageProps {
  kind: string;
  customTitle?: string;
  customDesc?: string;
}

export const RecordModulePage: React.FC<RecordModulePageProps> = ({
  kind,
  customTitle,
  customDesc,
}) => {
  const spec = (specData.kinds as Record<string, any>)[kind] || {};
  const title = customTitle || spec.title || kind;
  const desc = customDesc || spec.desc || '';
  const one = spec.one || 'Record';
  const icon = spec.icon || 'list';
  const fields = useMemo(() => spec.f || [], [spec.f]);
  const cols = useMemo(() => spec.cols || ['id', 'status'], [spec.cols]);

  const [records, setRecords] = useState<any[]>([]);
  const [employees, setEmployees] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showArchived, setShowArchived] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [viewRecord, setViewRecord] = useState<any | null>(null);
  const [extraModalType, setExtraModalType] = useState<'stdChecklist' | 'quickLog' | 'assignAll' | 'sendAcks' | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [recs, emps] = await Promise.all([
        fetchRecords(kind),
        fetchEmployees().catch(() => []),
      ]);
      setRecords(recs || []);
      setEmployees((emps || []).map((e: any) => ({
        id: e.employee_code || String(e.id),
        name: e.full_name || e.employee_code,
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [kind]);

  const liveRecords = useMemo(() => records.filter((r) => !r._arch), [records]);
  const archivedRecords = useMemo(() => records.filter((r) => r._arch), [records]);

  const statuses = useMemo(() => {
    const list = new Set<string>();
    records.forEach((r) => {
      if (r.status) list.add(r.status);
    });
    if (spec.f) {
      const statusF = spec.f.find((f: any) => f.k === 'status');
      if (statusF?.o) statusF.o.forEach((opt: string) => list.add(opt));
    }
    return Array.from(list);
  }, [records, spec.f]);

  const kpiStats = useMemo(() => {
    const kpiList = spec.kpi || ['Active', 'Pending', 'Closed'];
    return kpiList.slice(0, 3).map((st: string) => ({
      label: st,
      count: liveRecords.filter((r) => (r.status || '').toLowerCase() === st.toLowerCase()).length,
      sub: `${st} records`,
    }));
  }, [liveRecords, spec.kpi]);

  const filteredRows = useMemo(() => {
    const pool = showArchived ? archivedRecords : liveRecords;
    return pool.filter((r) => {
      if (statusFilter !== 'All' && (r.status || '').toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return Object.values(r).some((val) => String(val || '').toLowerCase().includes(q));
    });
  }, [showArchived, archivedRecords, liveRecords, statusFilter, search]);

  const handleExportCSV = () => {
    if (!filteredRows.length) {
      showToast('No records to export');
      return;
    }
    const headers = cols.join(',');
    const rows = filteredRows.map((r) =>
      cols.map((c: string) => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${kind}_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast(`Exported ${filteredRows.length} records to CSV`);
  };

  const handleSave = async (data: Record<string, any>) => {
    if (selectedRecord) {
      const updated = await updateRecord(kind, selectedRecord.id, data);
      setRecords((prev) => prev.map((r) => (r.id === selectedRecord.id ? { ...r, ...updated } : r)));
      showToast(`Updated ${one.toLowerCase()} ${selectedRecord.id}`);
    } else {
      const created = await createRecord(kind, data);
      setRecords((prev) => [created, ...prev]);
      showToast(`Added new ${one.toLowerCase()}`);
    }
    setSelectedRecord(null);
  };

  const handleDelete = async (row: any) => {
    if (!window.confirm(`Are you sure you want to delete ${row.id || one}?`)) return;
    await deleteRecord(kind, row.id);
    setRecords((prev) => prev.filter((r) => r.id !== row.id));
    showToast(`Deleted ${row.id}`);
  };

  const getExtraAction = () => {
    if (kind === 'onboard2') {
      return {
        label: 'Add standard checklist',
        icon: 'list',
        onClick: () => setExtraModalType('stdChecklist'),
      };
    }
    if (kind === 'logs') {
      return {
        label: 'Log in / out now',
        icon: 'clock',
        onClick: () => setExtraModalType('quickLog'),
      };
    }
    if (kind === 'sectrain') {
      return {
        label: 'Assign to everyone',
        icon: 'users',
        onClick: () => setExtraModalType('assignAll'),
      };
    }
    if (kind === 'acks') {
      return {
        label: 'Send to all employees',
        icon: 'send',
        onClick: () => setExtraModalType('sendAcks'),
      };
    }
    return undefined;
  };

  const handleExtraExecute = async (payload: any) => {
    if (extraModalType === 'stdChecklist') {
      const tasks = [
        'Welcome email & portal login details sent',
        'Collect ID proof, certificates & PAN card',
        'Issue laptop & configure workspace email',
        'Assign buddy and team introduction meeting',
        'POSH & Information Security compliance training',
        'Brief on HR policies & leave system walkthrough',
        'Set up bank account & payroll details',
        'First week 1:1 check-in with manager',
      ];
      for (const t of tasks) {
        await createRecord('onboard2', {
          emp: payload.empId,
          task: t,
          status: 'Pending',
          due: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        });
      }
      showToast(`Created 8 onboarding tasks for ${payload.empId}`);
    } else if (extraModalType === 'quickLog') {
      const nowTime = new Date().toTimeString().slice(0, 5);
      const today = new Date().toISOString().split('T')[0];
      const open = liveRecords.find((r) => r.emp === payload.empId && r.date === today && !r.logout);
      if (open) {
        await updateRecord('logs', open.id, { logout: nowTime });
        showToast(`Logged out ${payload.empId} at ${nowTime}`);
      } else {
        await createRecord('logs', { emp: payload.empId, date: today, login: nowTime });
        showToast(`Logged in ${payload.empId} at ${nowTime}`);
      }
    } else if (extraModalType === 'assignAll') {
      for (const emp of employees) {
        await createRecord('sectrain', {
          course: payload.course,
          emp: emp.id,
          assigned: new Date().toISOString().split('T')[0],
          due: payload.due,
          status: 'Pending',
        });
      }
      showToast(`Assigned course to ${employees.length} employees`);
    } else if (extraModalType === 'sendAcks') {
      for (const emp of employees) {
        await createRecord('acks', {
          policy: payload.policy,
          emp: emp.id,
          sent: new Date().toISOString().split('T')[0],
          status: 'Pending',
        });
      }
      showToast(`Sent acknowledgements to ${employees.length} employees`);
    }
    await loadData();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {loading && records.length === 0 && (
        <div className="text-center py-4 text-xs text-[var(--muted)] animate-pulse">
          Loading live records from database...
        </div>
      )}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-zinc-900 text-white text-xs font-semibold shadow-xl border border-zinc-700 animate-fade-in flex items-center gap-2">
          <span>✓</span> {toastMsg}
        </div>
      )}

      <RecordHeader
        title={title}
        desc={desc}
        one={one}
        icon={icon}
        totalCount={liveRecords.length}
        kpiStats={kpiStats}
        onExportCSV={handleExportCSV}
        onAddNew={() => {
          setSelectedRecord(null);
          setIsAddOpen(true);
        }}
        extraAction={getExtraAction()}
      />

      <RecordTable
        cols={cols}
        fields={fields}
        rows={filteredRows}
        statuses={statuses}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        showArchived={showArchived}
        onToggleArchived={() => setShowArchived((prev) => !prev)}
        archivedCount={archivedRecords.length}
        one={one}
        icon={icon}
        onView={(row) => setViewRecord(row)}
        onEdit={(row) => {
          setSelectedRecord(row);
          setIsAddOpen(true);
        }}
        onDelete={handleDelete}
      />

      {isAddOpen && (
        <RecordModal
          isOpen={isAddOpen}
          onClose={() => {
            setIsAddOpen(false);
            setSelectedRecord(null);
          }}
          onSave={handleSave}
          title={selectedRecord ? `Edit ${one.toLowerCase()}` : `Add ${one.toLowerCase()}`}
          one={one}
          fields={fields}
          initialData={selectedRecord}
          employees={employees}
        />
      )}

      {viewRecord && (
        <RecordViewModal
          isOpen={Boolean(viewRecord)}
          onClose={() => setViewRecord(null)}
          record={viewRecord}
          fields={fields}
          one={one}
          icon={icon}
          onEdit={(row) => {
            setViewRecord(null);
            setSelectedRecord(row);
            setIsAddOpen(true);
          }}
          onDelete={handleDelete}
        />
      )}

      {extraModalType && (
        <RecordExtraModals
          type={extraModalType}
          isOpen={Boolean(extraModalType)}
          onClose={() => setExtraModalType(null)}
          employees={employees}
          onExecute={handleExtraExecute}
        />
      )}
    </div>
  );
};

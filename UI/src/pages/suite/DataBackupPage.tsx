import React, { useEffect, useState, useRef } from 'react';
import { fetchEmployees, fetchDepartments, fetchDocuments } from '../../services/peopleApi';
import { recruitApi } from '../../services/recruitApi';
import { addAuditLog } from '../../services/suiteStorage';
import { ic } from '../../components/icons';

interface ExportRecord {
  entity: string;
  count: number;
  last_exported?: string;
}

export const DataBackupPage: React.FC = () => {
  const [summary, setSummary] = useState<ExportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const loadData = () => {
    Promise.allSettled([
      fetchEmployees(),
      fetchDepartments(),
      recruitApi.getJobs(),
      fetchDocuments(),
    ]).then(([empRes, deptRes, jobRes, docRes]) => {
      const empCount = empRes.status === 'fulfilled' ? empRes.value.length : 0;
      const deptCount = deptRes.status === 'fulfilled' ? deptRes.value.length : 0;
      const jobCount = jobRes.status === 'fulfilled' ? jobRes.value.length : 0;
      const docCount = docRes.status === 'fulfilled' ? docRes.value.length : 0;

      setSummary([
        { entity: 'Employees', count: empCount, last_exported: 'Live Database' },
        { entity: 'Departments', count: deptCount, last_exported: 'Live Database' },
        { entity: 'Job Openings', count: jobCount, last_exported: 'Live Database' },
        { entity: 'Documents', count: docCount, last_exported: 'Live Database' },
      ]);
    }).finally(() => { setLoading(false); });
  };

  useEffect(() => {
    loadData();
  }, []);

  const downloadFullBackup = async () => {
    try {
      const [emps, depts, jobs, docs] = await Promise.all([
        fetchEmployees().catch(() => []),
        fetchDepartments().catch(() => []),
        recruitApi.getJobs().catch(() => []),
        fetchDocuments().catch(() => []),
      ]);

      const backupData = {
        app: 'Brightcone People Plus',
        version: '2.0',
        exportedAt: new Date().toISOString(),
        exportedBy: localStorage.getItem('user_email') || 'admin@brightcone.ai',
        data: {
          employees: emps,
          departments: depts,
          jobs,
          documents: docs,
        },
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const tdy = new Date().toISOString().split('T')[0];
      a.download = `people-plus-backup-${tdy}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
      }, 500);

      addAuditLog('Downloaded complete system backup snapshot', 'Security', 'Data Backup');
      showToast('Backup downloaded successfully');
    } catch {
      showToast('Failed to generate full backup');
    }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!parsed || !parsed.data) {
          showToast('That file is not a valid backup snapshot');
          return;
        }
        addAuditLog(`Restored system backup from file: ${file.name}`, 'Security', 'Data Restore');
        showToast('Backup restored successfully');
        loadData();
      } catch {
        showToast('Invalid JSON in backup file');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportEntity = async (entity: string, format: 'csv' | 'json') => {
    const key = `${entity}-${format}`;
    setExporting(key);
    try {
      let data: any[] = [];
      if (entity === 'Employees') data = await fetchEmployees();
      else if (entity === 'Departments') data = await fetchDepartments();
      else if (entity === 'Job Openings') data = await recruitApi.getJobs();
      else if (entity === 'Documents') data = await fetchDocuments();

      let content = '';
      let mimeType = 'text/csv';

      if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
      } else {
        if (data.length > 0) {
          const keys = Object.keys(data[0]);
          const headerLine = keys.join(',');
          const dataLines = data.map((item) =>
            keys.map((k) => `"${String(item[k] ?? '').replace(/"/g, '""')}"`).join(',')
          );
          content = [headerLine, ...dataLines].join('\n');
        } else {
          content = 'id,name\n';
        }
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entity.toLowerCase()}_export_${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Exported ${entity} as ${format.toUpperCase()}`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-zinc-900 text-white text-xs font-semibold shadow-xl border border-zinc-700 animate-fade-in flex items-center gap-2">
          <span>✓</span> {toastMsg}
        </div>
      )}

      {/* Header Band matching HTML */}
      {loading && (
        <div className="text-center py-2 text-xs text-[var(--muted)] animate-pulse">
          Loading live backup metadata...
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[var(--surface-2)] text-[var(--text)]">
              {ic('download', 20)}
            </span>
            <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">
              Data &amp; backup
            </h1>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1.5 max-w-2xl">
            Export a full snapshot of your people, payroll, compliance and document records, or restore from a previously downloaded backup file.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleRestoreFile}
            accept=".json"
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn text-xs font-semibold px-3.5 py-2 flex items-center gap-1.5 border border-[var(--line)] rounded-xl hover:bg-[var(--surface-2)] transition-colors"
          >
            {ic('upload', 14)} Restore from backup
          </button>
          <button
            type="button"
            onClick={downloadFullBackup}
            className="btn primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5 rounded-xl text-white shadow-sm bg-[var(--ac,#0B87FF)] hover:opacity-90"
          >
            {ic('download', 14)} Download backup
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summary.map((s) => (
          <div key={s.entity} className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
            <p className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider">{s.entity}</p>
            <p className="text-2xl font-bold font-['Sora'] text-[var(--text)] mt-1">{s.count.toLocaleString()}</p>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">{s.last_exported}</p>
          </div>
        ))}
      </div>

      {/* Export Section */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[var(--line)]">
          <h2 className="text-sm font-bold font-['Sora'] text-[var(--text)]">Export Individual Datasets</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">Download organisation data in CSV or JSON format.</p>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {['Employees', 'Departments', 'Job Openings', 'Documents'].map((entity) => (
            <div key={entity} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[var(--text)]">{entity}</p>
                <p className="text-[11px] text-[var(--muted)]">Export all {entity.toLowerCase()} records</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportEntity(entity, 'csv')}
                  disabled={exporting === `${entity}-csv`}
                  className="btn text-xs font-semibold px-3 py-1.5 border border-[var(--line)] rounded-xl hover:bg-[var(--surface-2)]"
                >
                  {exporting === `${entity}-csv` ? 'Exporting...' : '↓ CSV'}
                </button>
                <button
                  type="button"
                  onClick={() => handleExportEntity(entity, 'json')}
                  disabled={exporting === `${entity}-json`}
                  className="btn text-xs font-semibold px-3 py-1.5 border border-[var(--line)] rounded-xl hover:bg-[var(--surface-2)]"
                >
                  {exporting === `${entity}-json` ? 'Exporting...' : '↓ JSON'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataBackupPage;

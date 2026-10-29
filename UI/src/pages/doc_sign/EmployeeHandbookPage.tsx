import React, { useState, useEffect } from 'react';
import { HandbookRecord } from './types';
import { ic } from '../../components/icons';
import { policiesApi } from '../../services/policiesApi';

export const EmployeeHandbookPage: React.FC = () => {
  const [records, setRecords] = useState<HandbookRecord[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showArchived, setShowArchived] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<HandbookRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<HandbookRecord | null>(null);

  const [formVer, setFormVer] = useState('');
  const [formEff, setFormEff] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formOwner, setFormOwner] = useState('Ananya Rao');
  const [formFile, setFormFile] = useState('');
  const [formChanges, setFormChanges] = useState('');
  const [formStatus, setFormStatus] = useState<HandbookRecord['status']>('Draft');

  useEffect(() => {
    policiesApi.getHandbooks().then((data) => {
      setRecords(data);
    }).catch(() => setRecords([]));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const activeRecords = records.filter((r) => r.status !== 'Archived');
  const archivedRecords = records.filter((r) => r.status === 'Archived');
  const pool = showArchived ? archivedRecords : activeRecords;

  const filtered = pool.filter((r) => {
    const q = search.trim().toLowerCase();
    const ver = r.version || r.ver || '';
    const chg = r.changesSummary || r.changes || '';
    const matchSearch =
      !q ||
      r.id.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      ver.toLowerCase().includes(q) ||
      r.owner.toLowerCase().includes(q) ||
      chg.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAddModal = () => {
    setEditingRecord(null);
    setFormVer('4.1');
    setFormEff(new Date().toISOString().split('T')[0]);
    setFormTitle('Brightcone Employee Handbook 2026-27 (v4.1)');
    setFormOwner('Ananya Rao');
    setFormFile('Handbook_v4.1.pdf');
    setFormChanges('Updated hybrid attendance guidelines and remote allowances.');
    setFormStatus('Draft');
    setIsFormOpen(true);
  };

  const openEditModal = (rec: HandbookRecord) => {
    setEditingRecord(rec);
    setFormVer(rec.version || rec.ver);
    setFormEff(rec.effectiveDate || rec.eff);
    setFormTitle(rec.title);
    setFormOwner(rec.owner);
    setFormFile(rec.file || '');
    setFormChanges(rec.changesSummary || rec.changes || '');
    setFormStatus(rec.status);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Archived' } : r))
    );
    showToast('Handbook version moved to archive.');
  };

  const handleRestore = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Published' } : r))
    );
    showToast('Handbook version restored.');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editingRecord.id
            ? {
                ...r,
                ver: formVer,
                version: formVer,
                eff: formEff,
                effectiveDate: formEff,
                title: formTitle,
                owner: formOwner,
                file: formFile,
                changes: formChanges,
                changesSummary: formChanges,
                status: formStatus,
              }
            : r
        )
      );
      showToast(`Updated handbook version v${formVer}`);
    } else {
      const newRec: HandbookRecord = {
        id: `HB-00${records.length + 1}`,
        ver: formVer,
        version: formVer,
        eff: formEff,
        effectiveDate: formEff,
        title: formTitle,
        owner: formOwner,
        file: formFile,
        changes: formChanges,
        changesSummary: formChanges,
        status: formStatus,
      };
      setRecords([newRec, ...records]);
      showToast(`Created handbook version v${formVer}`);
    }
    setIsFormOpen(false);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Version', 'Title', 'Effective Date', 'Owner', 'File', 'Status'];
    const rows = filtered.map((r) => [
      r.id,
      r.version || r.ver,
      `"${r.title.replace(/"/g, '""')}"`,
      r.effectiveDate || r.eff,
      `"${r.owner}"`,
      r.file || '',
      r.status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `employee_handbook_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast('Exported Employee Handbook CSV.');
  };

  return (
    <div
      className="view pb-12 select-none"
      style={{ '--ac': '#D9466F', animation: 'fade .25s ease' } as React.CSSProperties}
    >
      {toastMessage && (
        <div className="toast on" style={{ position: 'fixed', zIndex: 100 }}>
          {ic('check', 18)}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Head */}
      <div className="head band">
        <div>
          <span className="eyebrow">Sign</span>
          <h1>Employee handbook</h1>
          <p>
            Versions of the employee handbook. Publish a version, then send it for acknowledgement.
          </p>
        </div>

        <div className="actions flex gap-2">
          <button type="button" className="btn" onClick={exportCSV}>
            {ic('download', 15)} Export CSV
          </button>
          <button
            type="button"
            className="btn primary"
            style={{ background: '#D9466F', borderColor: '#D9466F' }}
            onClick={openAddModal}
          >
            {ic('plus', 15)} Add handbook version
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid g4 mb-6">
        <div className="card stat">
          <div className="k"><i>{ic('doc', 16)}</i>Total records</div>
          <div className="v">{activeRecords.length}</div>
          <div className="d">{archivedRecords.length} archived</div>
        </div>
        <div className="card stat">
          <div className="k"><i>{ic('check', 16)}</i>Published</div>
          <div className="v">{records.filter((r) => r.status === 'Published').length}</div>
          <div className="d">Active company policies</div>
        </div>
        <div className="card stat">
          <div className="k"><i>{ic('clock', 16)}</i>Under review</div>
          <div className="v">{records.filter((r) => r.status === 'Under review').length}</div>
          <div className="d">Pending approval</div>
        </div>
        <div className="card stat">
          <div className="k"><i>{ic('edit', 16)}</i>Drafts</div>
          <div className="v">{records.filter((r) => r.status === 'Draft').length}</div>
          <div className="d">In preparation</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="toolbar flex items-center justify-between gap-3 p-3 border-b border-[var(--line)]">
          <div className="flex items-center gap-3 flex-1">
            <div className="search relative flex-1 max-w-sm">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                {ic('search', 14)}
              </span>
              <input
                className="input pl-8 w-full text-xs"
                placeholder="Search handbooks by title, version, owner..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input text-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All statuses</option>
              <option value="Published">Published</option>
              <option value="Under review">Under review</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs text-[var(--muted)] cursor-pointer">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
            />
            <span>Archived ({archivedRecords.length})</span>
          </label>
        </div>

        <div className="table-wrap overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Version</th>
                <th>Title</th>
                <th>Effective date</th>
                <th>Owner</th>
                <th>File</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const ver = r.version || r.ver;
                const eff = r.effectiveDate || r.eff;
                const pillClass =
                  r.status === 'Published'
                    ? 'p-ok'
                    : r.status === 'Under review'
                    ? 'p-info'
                    : r.status === 'Archived'
                    ? 'p-bad'
                    : 'p-warn';
                return (
                  <tr key={r.id}>
                    <td><b>v{ver}</b></td>
                    <td><b>{r.title}</b></td>
                    <td>{eff}</td>
                    <td>{r.owner}</td>
                    <td><span className="filechip">{ic('doc', 13)} {r.file || 'handbook.pdf'}</span></td>
                    <td><span className={`pill ${pillClass}`}>{r.status}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" className="btn sm ib" onClick={() => setViewRecord(r)} title="View">{ic('eye', 14)}</button>
                        {showArchived ? (
                          <button type="button" className="btn sm" onClick={() => handleRestore(r.id)}>{ic('restore', 14)} Restore</button>
                        ) : (
                          <>
                            <button type="button" className="btn sm ib" onClick={() => openEditModal(r)} title="Edit">{ic('edit', 14)}</button>
                            <button type="button" className="btn sm ib bad" onClick={() => handleDelete(r.id)} title="Archive">{ic('trash', 14)}</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isFormOpen && (
        <>
          <div className="scrim on fixed inset-0 bg-black/40 z-40" onClick={() => setIsFormOpen(false)} />
          <div className="modal on fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--surface)] p-6 rounded-2xl border border-[var(--line)] shadow-xl z-50 w-full max-w-lg">
            <h2 className="text-base font-bold font-heading mb-1">{editingRecord ? 'Edit' : 'Add'} handbook version</h2>
            <p className="sub text-xs text-[var(--muted)] mb-4">{editingRecord ? editingRecord.id : 'New revision release.'}</p>
            <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <label className="block"><span>Version *</span><input required className="input w-full" value={formVer} onChange={(e) => setFormVer(e.target.value)} /></label>
                <label className="block"><span>Effective date *</span><input required type="date" className="input w-full" value={formEff} onChange={(e) => setFormEff(e.target.value)} /></label>
              </div>
              <label className="block"><span>Title *</span><input required className="input w-full" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block"><span>Owner</span><input className="input w-full" value={formOwner} onChange={(e) => setFormOwner(e.target.value)} /></label>
                <label className="block"><span>Status</span>
                  <select className="input w-full" value={formStatus} onChange={(e) => setFormStatus(e.target.value as any)}>
                    <option value="Draft">Draft</option>
                    <option value="Under review">Under review</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </select>
                </label>
              </div>
              <label className="block"><span>Summary of changes</span><textarea className="input w-full" rows={2} value={formChanges} onChange={(e) => setFormChanges(e.target.value)} /></label>
              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--line)]">
                <button type="button" className="btn" onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button type="submit" className="btn primary" style={{ background: '#D9466F', borderColor: '#D9466F' }}>Save version</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Details View Modal */}
      {viewRecord && (
        <>
          <div className="scrim on fixed inset-0 bg-black/40 z-40" onClick={() => setViewRecord(null)} />
          <div className="modal on fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--surface)] p-6 rounded-2xl border border-[var(--line)] shadow-xl z-50 w-full max-w-md">
            <h2 className="text-base font-bold font-heading mb-1">{viewRecord.title}</h2>
            <div className="space-y-2 text-xs mt-3">
              <div><span className="text-[var(--muted)]">Version:</span> <b>v{viewRecord.version || viewRecord.ver}</b></div>
              <div><span className="text-[var(--muted)]">Effective date:</span> <b>{viewRecord.effectiveDate || viewRecord.eff}</b></div>
              <div><span className="text-[var(--muted)]">Owner:</span> <b>{viewRecord.owner}</b></div>
              <div><span className="text-[var(--muted)]">File:</span> <span className="font-mono">{viewRecord.file}</span></div>
              <div><span className="text-[var(--muted)]">Status:</span> <span className="pill p-ok">{viewRecord.status}</span></div>
              <div className="mt-2 p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--line)]">
                <strong className="block mb-1 text-[var(--text)]">Changes:</strong>
                <p className="text-[var(--muted)]">{viewRecord.changesSummary || viewRecord.changes}</p>
              </div>
            </div>
            <div className="flex justify-end mt-4 pt-3 border-t border-[var(--line)]">
              <button className="btn sm" onClick={() => setViewRecord(null)}>Close</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeHandbookPage;

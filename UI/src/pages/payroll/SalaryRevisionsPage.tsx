import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ic } from '../../components/icons';
import { useToast } from '../../components/ui/use-toast';
import { Card, Table, TableHeader, TableRow, TableCell, TableBody, Button } from '../../components/ui';

interface SalaryRevision {
  id: string;
  employee_code: string;
  employee_name: string;
  current_ctc: number;
  revised_ctc: number;
  percentage_increase: number;
  effective_date: string;
  status: string;
}

interface RevisionsFormValues {
  revised_ctc: number;
  percentage_increase: number;
  effective_date: string;
}

export const SalaryRevisionsPage: React.FC = () => {
  const [revisions, setRevisions] = useState<SalaryRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<RevisionsFormValues>({
    revised_ctc: 0,
    percentage_increase: 0,
    effective_date: new Date().toISOString().split('T')[0],
  });
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    api.get('/payroll/salary-revisions').then((res: any) => {
      setRevisions(res.data || []);
      setLoading(false);
    }).catch(() => {
      setRevisions([]);
      setLoading(false);
    });
  }, []);

  const handleCreate = () => {
    setEditing(null);
    setForm({
      revised_ctc: 0,
      percentage_increase: 0,
      effective_date: new Date().toISOString().split('T')[0],
    });
  };

  const handleEdit = (rev: SalaryRevision) => {
    setEditing(rev.id);
    setForm({
      revised_ctc: rev.revised_ctc,
      percentage_increase: rev.percentage_increase,
      effective_date: rev.effective_date,
    });
  };

  const handleSave = () => {
    setIsSubmitting(true);
    const payload = {
      revised_ctc: form.revised_ctc,
      percentage_increase: form.percentage_increase,
      effective_date: form.effective_date,
    };
    const url = editing ? `/api/payroll/salary-revisions/${editing}` : '/api/payroll/salary-revisions';
    api.post(url, payload).then(() => {
      showToast(editing ? 'Salary revision updated' : 'Salary revision created');
      setIsSubmitting(false);
      setEditing(null);
      useEffect(() => {
        api.get('/payroll/salary-revisions').then((res: any) => {
          setRevisions(res.data || []);
          setLoading(false);
        });
      }, []);
    }).catch(() => {
      showToast('Failed to save salary revision');
      setIsSubmitting(false);
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Sora']">
        Salary Revisions
      </h1>
      <p className="text-sm text-slate-500 mt-1">
        Manage salary revisions and CTC changes for employees
      </p>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
          Create New Revision
        </h2>
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Revised CTC</label>
            <input
              type="number"
              step="100"
              min="0"
              value={form.revised_ctc}
              onChange={(e) =>
                setForm({ ...form, revised_ctc: Number(e.target.value) })}
              className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Percentage Increase (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={form.percentage_increase}
              onChange={(e) =>
                setForm({ ...form, percentage_increase: Number(e.target.value) })}
              className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Effective Date</label>
            <input
              type="date"
              value={form.effective_date}
              onChange={(e) => setForm({ ...form, effective_date: e.target.value })}
              className="w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="sm:col-span-2 flex items-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving…' : 'Save Revision'}
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {isSubmitting ? (
        <div className="prose max-w-prose">
          <p>Saving revision…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {revisions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-3xl text-slate-300">📊</span>
                <h3 className="font-bold text-slate-900 text-base font-['Sora']">
                  No Salary Revisions Yet
                </h3>
                <p className="text-xs text-slate-500">
                  Add your first salary revision using the form above.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {revisions.map((rev: SalaryRevision) => (
                <div key={rev.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-between justify-between">
                    <div>
                      <span className="text-slate-600">
                        {rev.employee_code} – {rev.employee_name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {rev.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-slate-900">
                        ₹{rev.current_ctc.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-emerald-600 font-medium">
                        +{rev.percentage_increase}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-slate-700">
                      Revised CTC: ₹{rev.revised_ctc.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-slate-500">
                      Effective: {rev.effective_date}
                    </p>
                    {editing === rev.id ? (
                      <form
                        onSubmit={handleSave}
                        className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2"
                      >
                        <input
                          type="number"
                          step="100"
                          min="0"
                          value={form.revised_ctc}
                          onChange={(e) =>
                            setForm({ ...form, revised_ctc: Number(e.target.value) })}
                          className="border rounded px-2 py-1 w-full"
                        />
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={form.percentage_increase}
                          onChange={(e) =>
                            setForm({ ...form, percentage_increase: Number(e.target.value) })}
                          className="border rounded px-2 py-1 w-full"
                        />
                        <input
                          type="date"
                          value={form.effective_date}
                          onChange={(e) => setForm({ ...form, effective_date: e.target.value })}
                          className="border rounded px-2 py-1 w-full"
                        />
                        <div className="sm:col-span-2 flex items-end gap-2">
                          <button type="submit" className="px-3 py-1 text-xs bg-emerald-600 text-white rounded">
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditing(rev.id)}
                          className="text-xs text-emerald-600 underline hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                'Are you sure you want to delete this salary revision?'
                              )
                            ) {
                              api
                                .delete(`/api/payroll/salary-revisions/${rev.id}`)
                                .then(() => {
                                  showToast('Salary revision deleted');
                                  useEffect(() => {
                                    api.get('/payroll/salary-revisions').then(
                                      (res: any) => {
                                        setRevisions(res.data || []);
                                        setLoading(false);
                                      }
                                    );
                                  }, []);
                                })
                                .catch(() => {
                                  showToast('Failed to delete salary revision');
                                });
                            }
                          }}
                          className="text-xs text-rose-600 underline hover:underline"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
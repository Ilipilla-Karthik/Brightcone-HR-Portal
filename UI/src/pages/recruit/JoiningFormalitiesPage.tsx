import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import { recordsList, recordsCreate, recordsUpdate, employeesApi } from './recruitApi';
import { JoiningHeader } from './JoiningHeader';
import { JoiningRecordsTable } from './JoiningRecordsTable';
import { JoiningAssetsSection } from './JoiningAssetsSection';
import { JoiningAddJoinerModal } from './JoiningAddJoinerModal';

type JoiningRecord = Record<string, any>;

export const JoiningFormalitiesPage: React.FC = () => {
  const [joiners, setJoiners] = useState<JoiningRecord[]>([]);
  const [employees, setEmployees] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJoiner, setSelectedJoiner] = useState<JoiningRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newJoiner, setNewJoiner] = useState({ emp: '', doj: '', status: 'Pending', notes: '' });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadFormalities = async () => {
    setLoading(true);
    setError(null);
    try {
      const [records, emps] = await Promise.all([recordsList('joining'), employeesApi.list().catch(() => [])]);
      setJoiners(records);
      setEmployees(emps);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load joining formalities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFormalities(); }, []);

  const updateRecord = async (code: string, payload: Record<string, any>, message: string) => {
    try {
      const updated = await recordsUpdate('joining', code, payload);
      setJoiners((prev) => prev.map((j) => (j.code === code ? updated : j)));
      setSelectedJoiner((s) => (s && s.code === code ? updated : s));
      showToast(message);
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Failed to update record');
    }
  };

  const setDocs = (record: any, docs: string) =>
    updateRecord(record.code, { docs }, `Document collection marked "${docs}" for ${record.emp}`);

  const setStatusComplete = (record: any) =>
    updateRecord(record.code, { status: 'Completed' }, `Joining formalities completed for ${record.emp}`);

  const toggleAsset = (record: any, key: 'idcard' | 'mail' | 'laptop' | 'bankd' | 'pf' | 'appt') =>
    updateRecord(record.code, { [key]: record[key] === 'Yes' ? 'No' : 'Yes' }, `${key.toUpperCase()} toggled for ${record.emp}`);

  useEffect(() => { loadFormalities(); }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <JoiningHeader onAddJoiner={() => setIsModalOpen(true)} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadFormalities} className="underline font-semibold ml-3">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1 font-['Sora']">{loading ? '…' : `${joiners.filter((j) => j.status === 'Completed').length} Candidates`}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Formalities done</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-bold text-blue-600 mt-1 font-['Sora']">{loading ? '…' : `${joiners.filter((j) => j.status === 'In progress').length} Candidates`}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Verification underway</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Documents Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1 font-['Sora']">{loading ? '…' : `${joiners.filter((j) => j.docs !== 'All collected').length} Candidates`}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Submissions awaited</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <JoiningRecordsTable joiners={joiners} />
      </div>

      {selectedJoiner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-['Sora']">Joining Record</h3>
                <p className="text-xs text-slate-500">{selectedJoiner.emp} • DOJ {selectedJoiner.doj || '—'}</p>
              </div>
              <button onClick={() => setSelectedJoiner(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                ['idcard', 'ID Card'],
                ['mail', 'Email account'],
                ['laptop', 'Laptop'],
                ['bankd', 'Bank details'],
                ['pf', 'PF formalities'],
                ['appt', 'Appointment letter'],
              ].map(([k, label]) => (
                <div key={k} onClick={() => toggleAsset(selectedJoiner, k)} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                  <span className="text-slate-700 font-medium">{label}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedJoiner[k] === 'Yes' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                    {selectedJoiner[k] === 'Yes' ? 'Done ✓' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
            {selectedJoiner.notes && <p className="text-xs text-slate-500">Notes: {selectedJoiner.notes}</p>}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button onClick={() => setSelectedJoiner(null)} className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer">Done</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <JoiningAddJoinerModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          newJoiner={newJoiner}
          setNewJoiner={setNewJoiner}
          employees={employees}
          showToast={showToast}
          joiners={joiners}
        />
      )}
    </div>
  );
};

export default JoiningFormalitiesPage;
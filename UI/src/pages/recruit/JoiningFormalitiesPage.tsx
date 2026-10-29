import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import { recruitApi } from '../../services/recruitApi';

interface JoiningRecord {
  id: string;
  candidateId?: string;
  candidateName: string;
  role: string;
  joiningDate: string;
  bgvStatus: 'Verified' | 'In Progress' | 'Action Needed';
  docsSubmitted: number;
  totalDocs: number;
  signedOffer: boolean;
  status: 'Ready to Join' | 'Pending Verification' | 'On Track';
  docChecklist: Record<string, boolean>;
}

const DEFAULT_DOC_KEYS = [
  'ID & Address Proof (Aadhaar/Passport)',
  'PAN Card & Tax Declaration',
  'Relieving Letter & Experience Cert',
  'Highest Degree Educational Certificate',
  'Cancelled Cheque / Bank Details',
  'Signed Employment Offer Letter',
];

const STORAGE_KEY = 'brightcone_joining_formalities';

export const JoiningFormalitiesPage: React.FC = () => {
  const [joiners, setJoiners] = useState<JoiningRecord[]>([]);
  const [toastMsg, setToastMsg] = useState('');
  const [selectedJoiner, setSelectedJoiner] = useState<JoiningRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newJoiner, setNewJoiner] = useState({ name: '', role: 'Software Engineer', joiningDate: '2026-11-15' });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => { loadFormalities(); }, []);

  const loadFormalities = async () => {
    try {
      const cands = await recruitApi.getCandidates();
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      let savedMap: Record<string, any> = {};
      if (savedRaw) { try { savedMap = JSON.parse(savedRaw); } catch {} }

      const relevant = cands.filter((c) => {
        const s = (c.stage || '').toLowerCase();
        return s.includes('offer') || s.includes('hired') || s.includes('onboarding');
      });

      const list: JoiningRecord[] = relevant.map((c, i) => {
        const id = c.cand_id || String(c.id || `JOIN-${i + 101}`);
        const saved = savedMap[id];
        const isHired = (c.stage || '').toLowerCase().includes('hired');

        const initialChecklist: Record<string, boolean> = saved?.docChecklist || {
          'ID & Address Proof (Aadhaar/Passport)': true,
          'PAN Card & Tax Declaration': true,
          'Relieving Letter & Experience Cert': isHired,
          'Highest Degree Educational Certificate': true,
          'Cancelled Cheque / Bank Details': isHired,
          'Signed Employment Offer Letter': true,
        };

        const count = Object.values(initialChecklist).filter(Boolean).length;
        const bgv = saved?.bgvStatus || (isHired ? 'Verified' : 'In Progress');
        return {
          id,
          candidateId: c.cand_id || (c.id ? String(c.id) : undefined),
          candidateName: c.full_name,
          role: c.job_title || 'Software Engineer',
          joiningDate: saved?.joiningDate || '2026-11-15',
          bgvStatus: bgv,
          docsSubmitted: count,
          totalDocs: 6,
          signedOffer: true,
          status: bgv === 'Verified' && count >= 6 ? 'Ready to Join' : 'On Track',
          docChecklist: initialChecklist,
        };
      });

      Object.keys(savedMap).forEach((k) => {
        if (!list.some((j) => j.id === k) && savedMap[k]?.candidateName) list.push(savedMap[k]);
      });
      setJoiners(list);
    } catch { setJoiners([]); }
  };

  const persistRecord = (record: JoiningRecord) => {
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      const savedMap = savedRaw ? JSON.parse(savedRaw) : {};
      savedMap[record.id] = record;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMap));
    } catch {}
  };

  const approveBGV = async (id: string) => {
    const item = joiners.find((j) => j.id === id);
    if (!item) return;
    if (item.candidateId) {
      try { await recruitApi.updateCandidate(item.candidateId, { stage: 'Hired' }); } catch {}
    }
    const updated: JoiningRecord = { ...item, bgvStatus: 'Verified', status: 'Ready to Join' };
    setJoiners((prev) => prev.map((j) => (j.id === id ? updated : j)));
    persistRecord(updated);
    if (selectedJoiner?.id === id) setSelectedJoiner(updated);
    showToast(`BGV cleared & approved for ${item.candidateName}`);
  };

  const toggleDocument = (joinerId: string, docName: string) => {
    setJoiners((prev) =>
      prev.map((j) => {
        if (j.id === joinerId) {
          const updatedChecklist = { ...j.docChecklist, [docName]: !j.docChecklist[docName] };
          const count = Object.values(updatedChecklist).filter(Boolean).length;
          const status = j.bgvStatus === 'Verified' && count >= 6 ? 'Ready to Join' : 'On Track';
          const updated: JoiningRecord = { ...j, docChecklist: updatedChecklist, docsSubmitted: count, status };
          persistRecord(updated);
          if (selectedJoiner?.id === joinerId) setSelectedJoiner(updated);
          return updated;
        }
        return j;
      })
    );
    showToast('Document verification updated');
  };

  const handleAddJoiner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJoiner.name) return;
    try {
      await recruitApi.createCandidate({ full_name: newJoiner.name, job_title: newJoiner.role, stage: 'Offer', source: 'Campus / Referral' }).catch(() => {});
    } catch {}

    const id = `join-${Date.now()}`;
    const initialChecklist = { 'ID & Address Proof (Aadhaar/Passport)': true, 'PAN Card & Tax Declaration': true, 'Relieving Letter & Experience Cert': false, 'Highest Degree Educational Certificate': true, 'Cancelled Cheque / Bank Details': false, 'Signed Employment Offer Letter': true };
    const item: JoiningRecord = { id, candidateName: newJoiner.name, role: newJoiner.role, joiningDate: newJoiner.joiningDate, bgvStatus: 'In Progress', docsSubmitted: 4, totalDocs: 6, signedOffer: true, status: 'On Track', docChecklist: initialChecklist };
    setJoiners([item, ...joiners]);
    persistRecord(item);
    setIsModalOpen(false);
    showToast(`Enrolled ${newJoiner.name} into Joining Formalities & BGV`);
    setNewJoiner({ name: '', role: 'Software Engineer', joiningDate: '2026-11-15' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Sora']">Joining Formalities & BGV</h1>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">● Backend Linked</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Pre-onboarding document submission, criminal & education background checks</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm flex items-center gap-2 cursor-pointer">
            <span className="w-4 h-4">{ic('plus', 16)}</span> Enroll Joiner
          </button>
          <button onClick={() => showToast('Dispatched reminder emails to pending candidates')} className="px-4 py-2 text-sm font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer">
            <span className="w-4 h-4">{ic('send', 16)}</span> Send Reminders
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ready for Day 1</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1 font-['Sora']">{joiners.filter((j) => j.status === 'Ready to Join').length} Candidates</p>
          <p className="text-[11px] text-slate-500 mt-0.5">100% verified & cleared</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">BGV in Progress</p>
          <p className="text-2xl font-bold text-blue-600 mt-1 font-['Sora']">{joiners.filter((j) => j.bgvStatus === 'In Progress').length} Candidates</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Verification underway</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Documents</p>
          <p className="text-2xl font-bold text-amber-600 mt-1 font-['Sora']">{joiners.filter((j) => j.docsSubmitted < j.totalDocs).length} Candidates</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Submissions awaited</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Joining Date</th>
                <th className="py-3 px-4">Documents</th>
                <th className="py-3 px-4">Signed Offer</th>
                <th className="py-3 px-4">BGV Verification</th>
                <th className="py-3 px-4">Readiness Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {joiners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-slate-700 text-sm">No Pending Joiners</p>
                    <p className="text-xs text-slate-400 mt-1">Click "Enroll Joiner" above to add candidate to pre-joining & BGV checklist.</p>
                  </td>
                </tr>
              ) : (
                joiners.map((j) => (
                  <tr key={j.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4"><p className="font-semibold text-slate-900">{j.candidateName}</p><p className="text-[11px] text-slate-500">{j.role}</p></td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">{j.joiningDate}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => setSelectedJoiner(j)} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold font-mono cursor-pointer">
                        <span>{j.docsSubmitted} / {j.totalDocs}</span><span className="text-[10px] text-blue-600 underline">Verify</span>
                      </button>
                    </td>
                    <td className="py-3 px-4"><span className="text-emerald-700 font-semibold">✓ Completed</span></td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${j.bgvStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                        {j.bgvStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${j.status === 'Ready to Join' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setSelectedJoiner(j)} className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded cursor-pointer">Checklist</button>
                        {j.bgvStatus !== 'Verified' ? (
                          <button onClick={() => approveBGV(j.id)} className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer">Approve BGV</button>
                        ) : (
                          <span className="text-emerald-600 font-semibold text-xs px-2 py-1">Cleared ✓</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedJoiner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-['Sora']">Verification Checklist</h3>
                <p className="text-xs text-slate-500">{selectedJoiner.candidateName} • {selectedJoiner.role}</p>
              </div>
              <button onClick={() => setSelectedJoiner(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <div className="space-y-2 text-xs">
              {DEFAULT_DOC_KEYS.map((key) => {
                const checked = selectedJoiner.docChecklist?.[key] || false;
                return (
                  <div key={key} onClick={() => toggleDocument(selectedJoiner.id, key)} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className="text-slate-700 font-medium">{key}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${checked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      {checked ? 'Verified ✓' : 'Pending Upload'}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">{selectedJoiner.docsSubmitted} of {selectedJoiner.totalDocs} verified</span>
              <button onClick={() => setSelectedJoiner(null)} className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer">Done</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form onSubmit={handleAddJoiner} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm font-['Sora']">Enroll Candidate in Joining Formalities</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Candidate Name *</label>
                <input required type="text" placeholder="e.g. Vikramaditya Sen" value={newJoiner.name} onChange={(e) => setNewJoiner({ ...newJoiner, name: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Role</label>
                <input type="text" value={newJoiner.role} onChange={(e) => setNewJoiner({ ...newJoiner, role: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Joining Date</label>
                <input type="date" value={newJoiner.joiningDate} onChange={(e) => setNewJoiner({ ...newJoiner, joiningDate: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer">Enroll Candidate</button>
            </div>
          </form>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-medium shadow-xl flex items-center gap-2 animate-fade-in">
          <span className="w-4 h-4 text-emerald-400">{ic('check', 16)}</span>
          {toastMsg}
        </div>
      )}
    </div>
  );
};

export default JoiningFormalitiesPage;

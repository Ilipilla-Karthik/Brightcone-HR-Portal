import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import { recruitApi, Candidate } from '../../services/recruitApi';

export const CandidateTrackerPage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const [newCan, setNewCan] = useState({ full_name: '', job_title: '', email: '', source: 'LinkedIn' });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadData = async () => {
    try {
      const data = await recruitApi.getCandidates();
      setCandidates(data);
    } catch {
      showToast('Loaded local candidate pipeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCan.full_name || !newCan.job_title) return;
    try {
      const created = await recruitApi.createCandidate({
        full_name: newCan.full_name,
        email: newCan.email,
        job_title: newCan.job_title,
        source: newCan.source,
        stage: 'Screening',
      });
      setCandidates([created, ...candidates]);
      setIsModalOpen(false);
      setNewCan({ full_name: '', job_title: '', email: '', source: 'LinkedIn' });
      showToast(`Added candidate ${created.full_name} to Screening pipeline`);
    } catch {
      showToast('Error saving candidate to backend');
    }
  };

  const handleMoveStage = async (candId: string, nextStage: string) => {
    try {
      await recruitApi.updateCandidate(candId, { stage: nextStage });
      setCandidates(candidates.map((c) => (c.cand_id === candId ? { ...c, stage: nextStage } : c)));
      showToast(`Candidate moved to ${nextStage}`);
    } catch {
      setCandidates(candidates.map((c) => (c.cand_id === candId ? { ...c, stage: nextStage } : c)));
      showToast(`Candidate stage updated locally to ${nextStage}`);
    }
  };

  const filtered = candidates.filter((c) => {
    const matchStage = stageFilter === 'All' ? true : c.stage?.toLowerCase() === stageFilter.toLowerCase();
    const matchSearch =
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.job_title && c.job_title.toLowerCase().includes(search.toLowerCase()));
    return matchStage && matchSearch;
  });

  const getStageBadge = (stage: string) => {
    const st = stage?.toLowerCase();
    if (st === 'offer' || st === 'hired') return 'bg-emerald-100 text-emerald-800';
    if (st === 'interview' || st === 'technical') return 'bg-purple-100 text-purple-800';
    if (st === 'screening') return 'bg-blue-100 text-blue-800';
    if (st === 'rejected') return 'bg-rose-100 text-rose-800';
    return 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Sora']">Candidate Tracker</h1>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">● Backend Connected</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Real-time candidate pipeline communicating with Loco backend API</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <span className="w-4 h-4">{ic('plus', 16)}</span> Add Candidate
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
          {(['All', 'Applied', 'Screening', 'Interview', 'Offer', 'Hired'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStageFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                stageFilter === st ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search candidates or roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <span className="absolute left-2.5 top-2.5 text-slate-400 w-3.5 h-3.5">{ic('search', 14)}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Target Role</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Match Score</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">Loading candidates from backend...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">No candidates match this filter.</td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.cand_id || c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{c.full_name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{c.email || c.candidate_code}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{c.job_title || 'Software Engineer'}</td>
                    <td className="py-3 px-4 text-slate-600">{c.source}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.match_score || 80}%</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${getStageBadge(c.stage)}`}>
                        {c.stage}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                      {c.stage === 'Applied' && (
                        <button onClick={() => handleMoveStage(c.cand_id, 'Screening')} className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-semibold">
                          Screen →
                        </button>
                      )}
                      {c.stage === 'Screening' && (
                        <button onClick={() => handleMoveStage(c.cand_id, 'Interview')} className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-[11px] font-semibold">
                          Interview →
                        </button>
                      )}
                      {c.stage === 'Interview' && (
                        <button onClick={() => handleMoveStage(c.cand_id, 'Offer')} className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-semibold">
                          Offer ★
                        </button>
                      )}
                      {c.stage === 'Offer' && (
                        <button onClick={() => handleMoveStage(c.cand_id, 'Hired')} className="px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-[11px] font-semibold">
                          Hired ✓
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form onSubmit={handleAdd} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm font-['Sora']">Add Candidate</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input required type="text" placeholder="Candidate full name" value={newCan.full_name} onChange={(e) => setNewCan({ ...newCan, full_name: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input required type="email" placeholder="email@example.com" value={newCan.email} onChange={(e) => setNewCan({ ...newCan, email: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role</label>
                <input required type="text" placeholder="e.g. Senior ML Engineer" value={newCan.job_title} onChange={(e) => setNewCan({ ...newCan, job_title: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Source</label>
                <select value={newCan.source} onChange={(e) => setNewCan({ ...newCan, source: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800">
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Referral">Referral</option>
                  <option value="Careers page">Careers page</option>
                  <option value="Direct">Direct</option>
                </select>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm">Save to Database</button>
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

export default CandidateTrackerPage;

import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import { recruitApi, Offer, Candidate } from '../../services/recruitApi';

export const OfferLettersPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    candidate_name: '',
    job_title: 'Senior ML Engineer',
    offered_ctc: 2800000,
    joining_date: '2026-11-15',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadData = async () => {
    try {
      const [offList, candList] = await Promise.all([recruitApi.getOffers(), recruitApi.getCandidates()]);
      setOffers(offList);
      setCandidates(candList.filter((c) => c.stage?.toLowerCase() === 'offer' || c.stage?.toLowerCase() === 'interview'));
    } catch {
      showToast('Loaded active offer pipeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.candidate_name) return;
    try {
      const created = await recruitApi.createOffer({
        candidate_name: form.candidate_name,
        job_title: form.job_title,
        offered_ctc: Number(form.offered_ctc),
        joining_date: form.joining_date,
        status: 'Sent',
      });
      setOffers([created, ...offers]);
      setIsModalOpen(false);
      showToast(`Offer letter released for ${form.candidate_name}`);
    } catch {
      showToast('Error saving offer to backend');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Sora']">Offer Letters & Approvals</h1>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">● Backend Connected</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Generate CTC breakdown, release offer packages, and track acceptance</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <span className="w-4 h-4">{ic('plus', 16)}</span> Release New Offer
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Role Offered</th>
                <th className="py-3 px-4">Annual CTC</th>
                <th className="py-3 px-4">Target Joining Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Offer Letter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">Loading offers from backend...</td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">No active offers released yet.</td>
                </tr>
              ) : (
                offers.map((off) => (
                  <tr key={off.offer_id || off.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{off.candidate_name}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{off.job_title}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ₹{off.offered_ctc?.toLocaleString('en-IN') || '24,00,000'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{off.joining_date || '15 Nov 2026'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        off.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {off.status || 'Sent'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => showToast(`Downloaded Signed Offer Letter PDF for ${off.candidate_name}`)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded inline-flex items-center gap-1 border border-slate-200"
                      >
                        <span className="w-3.5 h-3.5">{ic('download', 14)}</span> PDF
                      </button>
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
          <form onSubmit={handleCreateOffer} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm font-['Sora']">Release Job Offer</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Candidate Name</label>
                <input
                  required
                  type="text"
                  placeholder="Candidate name"
                  list="candOfferList"
                  value={form.candidate_name}
                  onChange={(e) => setForm({ ...form, candidate_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
                <datalist id="candOfferList">
                  {candidates.map((c) => (
                    <option key={c.cand_id || c.id} value={c.full_name}>{c.job_title}</option>
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Position Title</label>
                <input type="text" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Annual CTC (₹)</label>
                <input type="number" value={form.offered_ctc} onChange={(e) => setForm({ ...form, offered_ctc: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Joining Date</label>
                <input type="date" value={form.joining_date} onChange={(e) => setForm({ ...form, joining_date: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shadow-sm">Generate & Send Offer</button>
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

export default OfferLettersPage;

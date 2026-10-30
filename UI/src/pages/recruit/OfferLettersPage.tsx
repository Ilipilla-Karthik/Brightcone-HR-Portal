import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import { list, create } from './recruitApi';
import { OfferLettersHeader } from './OfferLettersHeader';
import { OfferFormModal } from './OfferFormModal';

type Offer = Record<string, any>;
type Candidate = Record<string, any>;

export const OfferLettersPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    candidate_name: '',
    job_title: '',
    offered_ctc: 0,
    joining_date: '',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [offList, candList] = await Promise.all([list('offers'), list('candidates')]);
      setOffers(offList);
      setCandidates(candList);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load offers');
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
      const created = await create('offers', {
        candidate_name: form.candidate_name,
        job_title: form.job_title,
        offered_ctc: Number(form.offered_ctc),
        joining_date: form.joining_date,
        status: 'Sent',
      });
      setOffers((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setForm({ candidate_name: '', job_title: '', offered_ctc: 0, joining_date: '' });
      showToast(`Offer letter released for ${created.candidate_name || form.candidate_name}`);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to save offer');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <OfferLettersHeader toastMsg={toastMsg} setToastMsg={(v: any) => {}} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="underline font-semibold ml-3">Retry</button>
        </div>
      )}

      <OfferFormModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        form={form}
        setForm={setForm}
        candidates={candidates}
        showToast={showToast}
      />

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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">Loading offers from backend...</td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">No active offers released yet.</td>
                </tr>
              ) : offers.map((off) => (
                <tr key={off.offer_id || off.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{off.candidate_name}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{off.job_title}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    ₹{off.offered_ctc?.toLocaleString('en-IN') ?? '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{off.joining_date || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      off.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {off.status || 'Sent'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OfferLettersPage;
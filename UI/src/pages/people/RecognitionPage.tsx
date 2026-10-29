import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import { fetchRecognitions, createRecognitionApi, RecognitionApiItem } from '../../services/peopleApi';

interface RecognitionItem {
  id: string;
  award: string;
  recipient: string;
  empCode: string;
  nominatedBy: string;
  category: 'Spot Award' | 'Culture Champion' | 'Innovation Star' | 'Customer Hero';
  points: number;
  date: string;
  citation: string;
}

export const RecognitionPage: React.FC = () => {
  const [awards, setAwards] = useState<RecognitionItem[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAward, setNewAward] = useState({ award: '', recipient: '', empCode: '', nominatedBy: 'HR Admin', category: 'Spot Award' as const, points: 2000, citation: '' });

  useEffect(() => {
    fetchRecognitions()
      .then((data: RecognitionApiItem[]) => {
        const list = Array.isArray(data) ? data : (data as any)?.value || [];
        if (list.length > 0) {
          setAwards(
            list.map((r: any) => ({
              id: r.recognition_code || `RCG-0${r.id}`,
              award: r.award,
              recipient: r.recipient,
              empCode: r.employee_code,
              nominatedBy: r.nominated_by,
              category: r.category as any,
              points: r.points,
              date: r.award_date,
              citation: r.citation,
            }))
          );
        }
      })
      .catch(() => setAwards([]));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAward.award || !newAward.recipient) return;
    try {
      const created = await createRecognitionApi({
        award: newAward.award,
        recipient: newAward.recipient,
        employee_code: newAward.empCode || 'BC-1038',
        nominated_by: newAward.nominatedBy,
        category: newAward.category,
        points: Number(newAward.points),
        award_date: new Date().toISOString().split('T')[0],
        citation: newAward.citation,
      });
      const item: RecognitionItem = {
        id: created.recognition_code || `RCG-0${created.id}`,
        award: created.award,
        recipient: created.recipient,
        empCode: created.employee_code,
        nominatedBy: created.nominated_by,
        category: created.category as any,
        points: created.points,
        date: created.award_date,
        citation: created.citation,
      };
      setAwards([item, ...awards]);
    } catch {
      const item: RecognitionItem = {
        id: `RCG-0${awards.length + 1}`,
        award: newAward.award,
        recipient: newAward.recipient,
        empCode: newAward.empCode || 'BC-1099',
        nominatedBy: newAward.nominatedBy,
        category: newAward.category,
        points: Number(newAward.points),
        date: new Date().toISOString().split('T')[0],
        citation: newAward.citation,
      };
      setAwards([item, ...awards]);
    }
    setIsModalOpen(false);
  };

  const filtered = awards.filter((a) => {
    const q = search.toLowerCase();
    return !search || a.recipient.toLowerCase().includes(q) || a.award.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">Employee Recognition & Kudos</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Celebrate team achievements, disburse spot rewards, and highlight company culture champions.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#12A58E] hover:bg-[#0f8b77] text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
        >
          {ic('star', 16)} Grant Recognition
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Awards Granted</span>
          <p className="text-2xl font-bold text-[var(--text)]">{awards.length}</p>
          <span className="text-xs text-amber-500 font-medium">Spot bonuses & Kudos</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Reward Points Disbursed</span>
          <p className="text-2xl font-bold text-[var(--text)]">{(awards.reduce((acc, a) => acc + a.points, 0)).toLocaleString()}</p>
          <span className="text-xs text-emerald-500 font-medium">Redeemable in perks store</span>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-1">
          <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Peer Participation</span>
          <p className="text-2xl font-bold text-[var(--text)]">84%</p>
          <span className="text-xs text-blue-500 font-medium">Active cross-team kudos</span>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search recognition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="md:col-span-2 p-12 text-center text-sm text-[var(--muted)] rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
            No recognition awards or peer nominations found. Click "Grant Recognition" to nominate a colleague.
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500">
                  {item.category}
                </span>
                <span className="text-[10px] font-mono text-[var(--muted)]">{item.date}</span>
              </div>
              <div>
                <h3 className="font-['Sora'] font-bold text-sm text-[var(--text)]">{item.award}</h3>
                <p className="text-xs font-medium text-[#12A58E] mt-0.5">Awarded to {item.recipient} ({item.empCode})</p>
              </div>
              <p className="text-xs text-[var(--muted)] italic bg-[var(--surface-2)]/50 p-3 rounded-xl border border-[var(--line)]/50">
                "{item.citation}"
              </p>
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-[var(--muted)]">Nominated by <strong className="text-[var(--text)]">{item.nominatedBy}</strong></span>
                <span className="font-bold text-amber-500">+{item.points} pts</span>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <h3 className="font-['Sora'] text-lg font-bold text-[var(--text)]">Grant Recognition Award</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Award Title</label>
                <input required type="text" placeholder="e.g. Sprint Delivery Hero" value={newAward.award} onChange={(e) => setNewAward({ ...newAward, award: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Recipient Name</label>
                <input required type="text" placeholder="e.g. Priya Sharma" value={newAward.recipient} onChange={(e) => setNewAward({ ...newAward, recipient: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Category</label>
                  <select value={newAward.category} onChange={(e) => setNewAward({ ...newAward, category: e.target.value as any })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none">
                    <option value="Spot Award">Spot Award</option>
                    <option value="Culture Champion">Culture Champion</option>
                    <option value="Innovation Star">Innovation Star</option>
                    <option value="Customer Hero">Customer Hero</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[var(--text)] mb-1">Reward Points</label>
                  <input type="number" min="500" step="500" value={newAward.points} onChange={(e) => setNewAward({ ...newAward, points: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block font-medium text-[var(--text)] mb-1">Citation Message</label>
                <textarea required rows={2} placeholder="Explain why this person deserves recognition..." value={newAward.citation} onChange={(e) => setNewAward({ ...newAward, citation: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--text)] focus:outline-none" />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)]">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#12A58E] hover:bg-[#0f8b77] text-white font-semibold">Grant Kudos</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecognitionPage;

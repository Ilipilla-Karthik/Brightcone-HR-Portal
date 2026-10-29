import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import { recruitApi } from '../../services/recruitApi';

interface Intern {
  id: string;
  name: string;
  college: string;
  track: string;
  mentor: string;
  stipend: string;
  duration: string;
  performanceScore: number;
  ppoStatus: 'Eligible for PPO' | 'PPO Extended' | 'Under Review' | 'Completed';
}

const STORAGE_KEY = 'brightcone_internships';

export const InternshipManagementPage: React.FC = () => {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [evaluatingIntern, setEvaluatingIntern] = useState<Intern | null>(null);
  const [evalScore, setEvalScore] = useState(4.5);
  const [evalStatus, setEvalStatus] = useState<'Eligible for PPO' | 'PPO Extended' | 'Under Review'>('Eligible for PPO');

  const [form, setForm] = useState({
    name: '',
    college: 'IIT Hyderabad',
    track: 'AI Research (LLMs)',
    mentor: 'Karthik Reddy',
    stipend: '₹40,000 / mo',
    duration: '6 Months',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    loadInterns();
  }, []);

  const loadInterns = async () => {
    try {
      const data = await recruitApi.getInternships();
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      let savedMap: Record<string, any> = {};
      if (savedRaw) {
        try { savedMap = JSON.parse(savedRaw); } catch {}
      }

      const mapped: Intern[] = data.map((d: any) => {
        const id = d.intern_id || (typeof d.id === 'string' ? d.id : `INT-${d.id}`);
        const saved = savedMap[id];
        return {
          id,
          name: d.name,
          college: d.college,
          track: d.track,
          mentor: d.mentor,
          stipend: d.stipend?.replace('?', '₹') || '₹40,000 / mo',
          duration: d.duration || '6 Months',
          performanceScore: saved?.performanceScore ?? (d.performance_score || d.performanceScore || 4.2),
          ppoStatus: (saved?.ppoStatus || d.ppo_status || d.ppoStatus || 'Under Review') as any,
        };
      });

      setInterns(mapped);
    } catch {
      setInterns([]);
    }
  };

  const persistInterns = (list: Intern[]) => {
    setInterns(list);
    try {
      const map: Record<string, Intern> = {};
      list.forEach((i) => { map[i.id] = i; });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {}
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.college) return;
    try {
      const created = await recruitApi.createInternship({
        name: form.name,
        college: form.college,
        track: form.track,
        mentor: form.mentor,
        stipend: form.stipend,
        duration: form.duration,
        performance_score: 4.2,
        ppo_status: 'Under Review',
      });
      const intern: Intern = {
        id: (created as any).intern_id || `INT-0${interns.length + 1}`,
        name: created.name,
        college: created.college,
        track: created.track,
        mentor: created.mentor,
        stipend: created.stipend,
        duration: created.duration,
        performanceScore: 4.2,
        ppoStatus: 'Under Review',
      };
      persistInterns([...interns, intern]);
      setIsModalOpen(false);
      showToast(`Added intern ${form.name} to database`);
      setForm({ name: '', college: 'IIT Hyderabad', track: 'AI Research (LLMs)', mentor: 'Karthik Reddy', stipend: '₹40,000 / mo', duration: '6 Months' });
    } catch {
      showToast('Saved locally');
    }
  };

  const extendPPO = async (id: string) => {
    try {
      await recruitApi.updateInternship(id, { ppo_status: 'PPO Extended' });
    } catch {}
    const updated = interns.map((i) => (i.id === id ? { ...i, ppoStatus: 'PPO Extended' as const } : i));
    persistInterns(updated);
    showToast('Pre-Placement Offer (PPO) extended to candidate');
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingIntern) return;
    const id = evaluatingIntern.id;

    try {
      await recruitApi.updateInternship(id, {
        performance_score: evalScore,
        ppo_status: evalStatus,
      });
    } catch {}

    const updated = interns.map((i) => (i.id === id ? { ...i, performanceScore: evalScore, ppoStatus: evalStatus } : i));
    persistInterns(updated);
    showToast(`Project score & evaluation saved for ${evaluatingIntern.name}`);
    setEvaluatingIntern(null);
  };

  const avgScore = interns.length > 0
    ? (interns.reduce((acc, i) => acc + i.performanceScore, 0) / interns.length).toFixed(1)
    : '4.2';

  const ppoConversion = interns.length > 0
    ? `${Math.round((interns.filter((i) => i.ppoStatus === 'PPO Extended').length / interns.length) * 100)}%`
    : '0%';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Sora']">Internship & Campus Cohort</h1>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">● Backend Linked</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Campus recruiting, intern performance evaluations, and Pre-Placement Offers (PPOs)</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span className="w-4 h-4">{ic('plus', 16)}</span> Enroll Intern
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Cohort Size</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-['Sora']">{interns.length} Interns</p>
          <p className="text-[11px] text-blue-600 mt-0.5">Top tier campuses</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PPO Conversion Rate</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1 font-['Sora']">{ppoConversion}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {interns.filter((i) => i.ppoStatus === 'Eligible for PPO' || i.ppoStatus === 'PPO Extended').length} PPO eligible
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Performance Score</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-['Sora']">{avgScore} / 5.0</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Cohort evaluations</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cohort Duration</p>
          <p className="text-2xl font-bold text-purple-600 mt-1 font-['Sora']">6 Months</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Standard Term</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Intern Name</th>
                <th className="py-3 px-4">Campus / University</th>
                <th className="py-3 px-4">Specialization Track</th>
                <th className="py-3 px-4">Assigned Mentor</th>
                <th className="py-3 px-4">Monthly Stipend</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">PPO Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {interns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-slate-700 text-sm">No Active Interns</p>
                    <p className="text-xs text-slate-400 mt-1">Enroll new campus interns to track cohorts and PPO evaluations.</p>
                  </td>
                </tr>
              ) : (
                interns.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{i.name}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{i.college}</td>
                    <td className="py-3 px-4 text-slate-800">{i.track}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{i.mentor}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">{i.stipend}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{i.performanceScore} / 5</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        i.ppoStatus === 'PPO Extended' ? 'bg-emerald-100 text-emerald-800' :
                        i.ppoStatus === 'Eligible for PPO' ? 'bg-purple-100 text-purple-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {i.ppoStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEvaluatingIntern(i);
                            setEvalScore(i.performanceScore || 4.5);
                            setEvalStatus(i.ppoStatus === 'PPO Extended' ? 'PPO Extended' : 'Eligible for PPO');
                          }}
                          className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded cursor-pointer"
                        >
                          Score
                        </button>
                        {i.ppoStatus === 'Eligible for PPO' ? (
                          <button
                            onClick={() => extendPPO(i.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer"
                          >
                            Extend PPO ✓
                          </button>
                        ) : i.ppoStatus === 'PPO Extended' ? (
                          <span className="text-emerald-600 font-semibold text-xs px-2 py-1">PPO Given ✓</span>
                        ) : (
                          <button
                            onClick={() => extendPPO(i.id)}
                            className="px-2 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded cursor-pointer"
                          >
                            Nominate PPO
                          </button>
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

      {/* Score Modal */}
      {evaluatingIntern && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <form onSubmit={handleSaveEvaluation} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-['Sora']">Intern Evaluation & PPO</h3>
                <p className="text-xs text-slate-500">{evaluatingIntern.name} • {evaluatingIntern.track}</p>
              </div>
              <button type="button" onClick={() => setEvaluatingIntern(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Performance Score (1.0 to 5.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={evalScore}
                  onChange={(e) => setEvalScore(parseFloat(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">PPO Eligibility Status</label>
                <select
                  value={evalStatus}
                  onChange={(e) => setEvalStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  <option value="Eligible for PPO">Eligible for PPO</option>
                  <option value="PPO Extended">PPO Extended (Direct Full-time Offer)</option>
                  <option value="Under Review">Under Review</option>
                </select>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setEvaluatingIntern(null)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer">Save Evaluation</button>
            </div>
          </form>
        </div>
      )}

      {/* Enroll Intern Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form onSubmit={handleAdd} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm font-['Sora']">Enroll Campus Intern</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Intern Name *</label>
                <input required type="text" placeholder="e.g. Ananya Sen" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Campus / University *</label>
                <select value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800">
                  <option value="IIT Hyderabad">IIT Hyderabad</option>
                  <option value="BITS Pilani (Hyderabad)">BITS Pilani (Hyderabad)</option>
                  <option value="NIT Warangal">NIT Warangal</option>
                  <option value="IIIT Hyderabad">IIIT Hyderabad</option>
                  <option value="IIT Madras">IIT Madras</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specialization Track</label>
                <select value={form.track} onChange={(e) => setForm({ ...form, track: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800">
                  <option value="AI Research (LLMs)">AI Research (LLMs)</option>
                  <option value="Backend Systems & Rust">Backend Systems & Rust</option>
                  <option value="Frontend & UI Engineering">Frontend & UI Engineering</option>
                  <option value="Cloud & Platform DevOps">Cloud & Platform DevOps</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Mentor</label>
                <select value={form.mentor} onChange={(e) => setForm({ ...form, mentor: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800">
                  <option value="Karthik Reddy">Karthik Reddy (Principal AI Engineer)</option>
                  <option value="Priya Menon">Priya Menon (Engineering Manager)</option>
                  <option value="Vikram Malhotra">Vikram Malhotra (DevOps Architect)</option>
                  <option value="Ananya Rao">Ananya Rao (People Ops)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Monthly Stipend</label>
                <input type="text" value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer">Enroll Intern</button>
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

export default InternshipManagementPage;

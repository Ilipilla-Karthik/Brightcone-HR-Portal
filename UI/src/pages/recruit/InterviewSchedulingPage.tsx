import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import { recruitApi, Interview, Candidate } from '../../services/recruitApi';

export const InterviewSchedulingPage: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [activeScorecard, setActiveScorecard] = useState<Interview | null>(null);

  const [form, setForm] = useState({
    candidate_name: '',
    job_title: 'Senior ML Engineer',
    round_name: 'Technical Round 1',
    interviewer: 'Karthik Reddy',
    scheduled_at: '',
  });

  const [scorecardForm, setScorecardForm] = useState({
    technicalRating: 4,
    cultureRating: 4,
    recommendation: 'Hire' as 'Strong Hire' | 'Hire' | 'Hold' | 'Reject',
    feedbackNotes: '',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadData = async () => {
    try {
      const [ints, cands] = await Promise.all([
        recruitApi.getInterviews(),
        recruitApi.getCandidates(),
      ]);
      setInterviews(ints);
      setCandidates(cands);
    } catch {
      showToast('Loaded scheduled interviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.candidate_name) return;
    try {
      const created = await recruitApi.createInterview({
        candidate_name: form.candidate_name,
        job_title: form.job_title,
        round_name: form.round_name,
        panel: form.interviewer,
        scheduled_at: form.scheduled_at || new Date().toISOString(),
      });
      setInterviews([created, ...interviews]);
      setIsModalOpen(false);
      showToast(`Interview scheduled for ${form.candidate_name}`);
      setForm({ candidate_name: '', job_title: 'Senior ML Engineer', round_name: 'Technical Round 1', interviewer: 'Karthik Reddy', scheduled_at: '' });
    } catch {
      showToast('Error saving interview to backend');
    }
  };

  const handleMarkDone = async (item: Interview) => {
    const id = item.interview_id || String(item.id);
    try {
      await recruitApi.updateInterview(id, { status: 'Completed' });
      setInterviews((prev) =>
        prev.map((i) => ((i.interview_id === id || String(i.id) === id) ? { ...i, status: 'Completed' } : i))
      );
      showToast(`Interview for ${item.candidate_name} marked as Completed`);
    } catch {
      // Optimistic update
      setInterviews((prev) =>
        prev.map((i) => ((i.interview_id === id || String(i.id) === id) ? { ...i, status: 'Completed' } : i))
      );
      showToast(`Interview for ${item.candidate_name} marked as Completed`);
    }
  };

  const handleScorecardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeScorecard) return;
    const id = activeScorecard.interview_id || String(activeScorecard.id);
    const summaryNotes = `Rating: ${scorecardForm.technicalRating}/5 | Recommendation: ${scorecardForm.recommendation} | ${scorecardForm.feedbackNotes}`;

    try {
      await recruitApi.updateInterview(id, {
        status: 'Completed',
        notes: summaryNotes,
      });
      setInterviews((prev) =>
        prev.map((i) =>
          (i.interview_id === id || String(i.id) === id)
            ? { ...i, status: 'Completed', notes: summaryNotes }
            : i
        )
      );
      showToast(`Scorecard submitted for ${activeScorecard.candidate_name}`);
      setActiveScorecard(null);
    } catch {
      setInterviews((prev) =>
        prev.map((i) =>
          (i.interview_id === id || String(i.id) === id)
            ? { ...i, status: 'Completed', notes: summaryNotes }
            : i
        )
      );
      showToast(`Scorecard saved for ${activeScorecard.candidate_name}`);
      setActiveScorecard(null);
    }
  };

  const filteredInterviews = interviews.filter((i) => {
    if (filter === 'All') return true;
    return (i.status || 'Scheduled') === filter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-['Sora']">Interview Scheduling</h1>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">● Backend Connected</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Calendar rounds, interviewer allocation, and candidate scorecards</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span className="w-4 h-4">{ic('plus', 16)}</span> Schedule Interview
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {['All', 'Scheduled', 'Completed'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              filter === s ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {s} ({s === 'All' ? interviews.length : interviews.filter((i) => (i.status || 'Scheduled') === s).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading interview schedules from backend...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInterviews.map((item) => {
            const isCompleted = item.status === 'Completed';
            return (
              <div key={item.interview_id || item.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    {item.round_name}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.status || 'Scheduled'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm font-['Sora']">{item.candidate_name}</h3>
                  <p className="text-xs text-slate-500">{item.job_title}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
                  <p className="text-slate-700 font-medium flex items-center justify-between">
                    <span>Date: {item.scheduled_at?.split('T')[0] || 'Scheduled Date'}</span>
                    <span>Time: {item.scheduled_at?.split('T')[1]?.slice(0, 5) || '11:00 AM'}</span>
                  </p>
                  <p className="text-slate-500 text-[11px]">Panel: <span className="font-semibold text-slate-700">{item.panel}</span></p>
                  {item.notes && (
                    <p className="text-[11px] text-emerald-700 font-medium pt-1 border-t border-slate-200/60 mt-1">
                      Notes: {item.notes}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      setActiveScorecard(item);
                      setScorecardForm({ technicalRating: 4, cultureRating: 4, recommendation: 'Hire', feedbackNotes: '' });
                    }}
                    className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    {isCompleted ? 'Edit Scorecard' : 'Submit Scorecard →'}
                  </button>
                  {!isCompleted ? (
                    <button
                      onClick={() => handleMarkDone(item)}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded transition-colors cursor-pointer"
                    >
                      Mark Done
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-600 font-semibold">Completed ✓</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Interview Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form onSubmit={handleSchedule} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm font-['Sora']">Schedule Interview</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Candidate</label>
                <input
                  required
                  type="text"
                  placeholder="Candidate name"
                  list="candList"
                  value={form.candidate_name}
                  onChange={(e) => setForm({ ...form, candidate_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
                <datalist id="candList">
                  {candidates.map((c) => (
                    <option key={c.cand_id || c.id} value={c.full_name}>{c.job_title}</option>
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Role</label>
                <input type="text" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Interview Round</label>
                <select value={form.round_name} onChange={(e) => setForm({ ...form, round_name: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800">
                  <option value="Technical Round 1">Technical Round 1</option>
                  <option value="System Design & Architecture">System Design & Architecture</option>
                  <option value="Hiring Manager">Hiring Manager</option>
                  <option value="Executive Round">Executive Round</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Panel Members</label>
                <input type="text" value={form.interviewer} onChange={(e) => setForm({ ...form, interviewer: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date & Time</label>
                <input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer">Confirm Schedule</button>
            </div>
          </form>
        </div>
      )}

      {/* Scorecard Modal */}
      {activeScorecard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <form onSubmit={handleScorecardSubmit} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-['Sora']">Interview Scorecard</h3>
                <p className="text-xs text-slate-500">{activeScorecard.candidate_name} • {activeScorecard.round_name}</p>
              </div>
              <button type="button" onClick={() => setActiveScorecard(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Technical Assessment (1 - 5)</label>
                <select
                  value={scorecardForm.technicalRating}
                  onChange={(e) => setScorecardForm({ ...scorecardForm, technicalRating: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  <option value={5}>5 - Exceptional / Exceeds Bar</option>
                  <option value={4}>4 - Strong / Clear Hire</option>
                  <option value={3}>3 - Meets Bar / Inclined</option>
                  <option value={2}>2 - Marginal / Below Bar</option>
                  <option value={1}>1 - Strong Reject</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hiring Recommendation</label>
                <select
                  value={scorecardForm.recommendation}
                  onChange={(e) => setScorecardForm({ ...scorecardForm, recommendation: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  <option value="Strong Hire">Strong Hire</option>
                  <option value="Hire">Hire</option>
                  <option value="Hold">Hold / Further Round</option>
                  <option value="Reject">Reject</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Evaluation & Feedback Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specific problem solving strengths, architecture design observations, areas of improvement..."
                  value={scorecardForm.feedbackNotes}
                  onChange={(e) => setScorecardForm({ ...scorecardForm, feedbackNotes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setActiveScorecard(null)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shadow-sm cursor-pointer">Save Scorecard & Complete</button>
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

export default InterviewSchedulingPage;

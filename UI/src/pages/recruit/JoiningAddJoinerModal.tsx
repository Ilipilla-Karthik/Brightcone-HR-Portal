import React from 'react';

type JoiningAddJoinerModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: any;
  newJoiner: any;
  setNewJoiner: any;
  employees: any[];
  showToast: any;
  joiners: any[];
};

export const JoiningAddJoinerModal: React.FC<JoiningAddJoinerModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  newJoiner,
  setNewJoiner,
  employees,
  showToast,
  joiners,
}) => {
  const handleAddJoiner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJoiner.emp || !newJoiner.doj) return;
    setIsSubmitting(true);
    try {
      const created = await recordsCreate('joining', {
        emp: newJoiner.emp,
        doj: newJoiner.doj,
        docs: 'Not started',
        status: newJoiner.status,
        notes: newJoiner.notes,
      });
      setJoiners((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setNewJoiner({ emp: '', doj: '', status: 'Pending', notes: '' });
      showToast(`Enrolled ${created.emp || newJoiner.emp} into Joining Formalities`);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to enroll joiner');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <form onSubmit={handleAddJoiner} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm font-['Sora']">Enroll Joiner</h3>
          <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
        </div>
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Employee / Joiner *</label>
            <input required type="text" list="joinEmpList" placeholder="Employee name or code" value={newJoiner.emp} onChange={(e) => setNewJoiner({ ...newJoiner, emp: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
            <datalist id="joinEmpList">
              {employees.map((emp) => (
                <option key={emp.employee_code || emp.id} value={emp.full_name || emp.employee_code}>{emp.employee_code}</option>
              ))}
            </datalist>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Date of Joining *</label>
            <input required type="date" value={newJoiner.doj} onChange={(e) => setNewJoiner({ ...newJoiner, doj: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Status</label>
            <select value={newJoiner.status} onChange={(e) => setNewJoiner({ ...newJoiner, status: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800">
              <option value="Pending">Pending</option>
              <option value="In progress">In progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes</label>
            <textarea rows={2} value={newJoiner.notes} onChange={(e) => setNewJoiner({ ...newJoiner, notes: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800" />
          </div>
        </div>
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer disabled:opacity-50">{isSubmitting ? 'Enrolling…' : 'Enroll Candidate'}</button>
        </div>
      </form>
    </div>
  );
};
import React from 'record';

type RecruitAdminHeaderProps = {
  toastMsg: string;
  setToastMsg: any;
};

export const RecruitAdminHeader: React.FC<RecruitAdminHeaderProps> = ({ toastMsg, setToastMsg }) => {
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {toastMsg && (
        <div
          className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#7C5CFF] text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-fade-in"
        >
          {ic('check-circle', 15)} {toastMsg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-['Sora'] tracking-tight text-[var(--text)]">Jobs & Requisitions</h1>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
              ● Backend Connected
            </span>
          </div>
          <p className="text-sm text-[var(--muted)] mt-1">Open job postings, talent pipelines, and live database requisition tracking.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            className="btn text-xs font-semibold px-3.5 py-2 flex items-center gap-1.5 border border-[var(--line)] rounded-xl hover:bg-[var(--surface-2)]"
            title="Refresh database records"
          >
            {ic('refresh', 14)} Refresh
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5 rounded-xl text-white shadow-sm"
            style={{ background: '#7C5CFF' }}
          >
            {ic('plus', 14)} Create Job Opening
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-2xs">
        <div className="flex items-center gap-2 w-full md:w-80 px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)]">
          {ic('search', 15)}
          <input
            type="text"
            placeholder="Search by title, department, or code (e.g. J1)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-[var(--text)] focus:outline-none w-full"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Published', 'Draft', 'Closed'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === s ? 'bg-[#7C5CFF] text-white' : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
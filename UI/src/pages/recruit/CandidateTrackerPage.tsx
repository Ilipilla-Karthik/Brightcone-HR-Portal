import React, { useState, useEffect } from 'react';
import { ic } from '../../components/icons';
import { list, create, update } from './recruitApi';
import { CandidateHeader } from './CandidateHeader';
import { CandidateFilterBar } from './CandidateFilterBar';
import { CandidateTable } from './CandidateTable';
import { CandidateAddModal } from './CandidateAddModal';

type Candidate = Record<string, any>;

export const CandidateTrackerPage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await list('candidates');
      setCandidates(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load candidates');
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
      const created = await create('candidates', {
        full_name: newCan.full_name,
        email: newCan.email,
        job_title: newCan.job_title,
        source: newCan.source,
        stage: 'Screening',
      });
      setCandidates((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setNewCan({ full_name: '', job_title: '', email: '', source: 'LinkedIn' });
      showToast(`Added candidate ${created.full_name || newCan.full_name}`);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to save candidate');
    }
  };

  const handleMoveStage = async (candId: string, nextStage: string) => {
    try {
      const updated = await update('candidates', candId, { stage: nextStage });
      setCandidates((prev) => prev.map((c) => ((c.cand_id || c.id) === candId ? updated : c)));
      showToast(`Candidate moved to ${nextStage}`);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to update candidate stage');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <CandidateHeader onAddCandidate={() => setIsModalOpen(true)} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="underline font-semibold ml-3">Retry</button>
        </div>
      )}

      <CandidateFilterBar
        stageFilter={stageFilter}
        setStageFilter={setStageFilter}
        search={search}
        setSearch={setSearch}
      />

      <CandidateTable
        candidates={candidates}
        loading={loading}
        stageFilter={stageFilter}
        setStageFilter={setStageFilter}
        search={search}
        setSearch={setSearch}
        handleMoveStage={handleMoveStage}
      />

      {isModalOpen && (
        <CandidateAddModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          newCan={{ full_name: '', job_title: '', email: '', source: 'LinkedIn' }}
          setNewCan={(v: any) => {}}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default CandidateTrackerPage;
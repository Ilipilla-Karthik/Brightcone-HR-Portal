import React, { useState, useEffect } from 'react';
import { getReviewCycles } from '../../services/api';
import { api } from '../../services/api';
import { LMSHeader } from './LMSHeader';
import { LMSCyclesTable } from './LMSCyclesTable';

interface ReviewCycleItem {
  id: string;
  name: string;
  period: string;
  participants: number;
  completed: number;
  status: 'Active' | 'Closed' | 'Scheduled';
  deadline: string;
}

export const PerformanceLMSAdmin: React.FC = () => {
  const [cycles, setCycles] = useState<ReviewCycleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: any = await getReviewCycles();
      const list: any[] = Array.isArray(data) ? data : data?.value || [];

      const enriched: ReviewCycleItem[] = await Promise.all(
        list.map(async (c: any) => {
          let participants = 0;
          let completed = 0;
          try {
            const dash: any = (await api.get(`/performance/cycles/${c.id}/dashboard`)).data;
            const s = dash?.summary || {};
            participants = s.total_eligible ?? 0;
            completed = s.self_reviews_submitted ?? 0;
          } catch {
            /* dashboard unavailable for this cycle — fall back to 0 */
          }
          return {
            id: c.id,
            name: c.name,
            period: c.self_review_due || '—',
            participants,
            completed,
            status:
              c.status === 'Active' ? 'Active' : c.status === 'Archived' ? 'Closed' : 'Scheduled',
            deadline: c.self_review_due || '—',
          } as ReviewCycleItem;
        })
      );
      setCycles(enriched);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load review cycles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <LMSHeader />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="underline font-semibold ml-3">Retry</button>
        </div>
      )}

      <LMSCyclesTable cycles={cycles} loading={loading} />
    </div>
  );
};

export default PerformanceLMSAdmin;
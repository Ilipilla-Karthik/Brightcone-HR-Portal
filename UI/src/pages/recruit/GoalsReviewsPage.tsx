import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

/** Goals & performance review forms [REC-11] */
export const GoalsReviewsPage: React.FC = () => {
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: any = await api.get('/performance/cycles');
      setCycles(data?.data || data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load goal cycles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div className="page-container">Loading goal cycles from backend...</div>;
  if (error) return (
    <div className="page-container" data-testid="goalsreviewspage">
      <h2>GoalsReviewsPage</h2>
      <p>Error loading goal cycles: {error}</p>
    </div>
  );

  return (
    <div className="page-container" data-testid="goalsreviewspage">
      <h2>GoalsReviewsPage</h2>
      <p>Goals & performance review forms [REC-11]</p>
      {cycles.length > 0 ? (
        <ul>
          {cycles.map((c) => (
            <li key={c.id}>
              {c.name}: {c.status} - {c.participants} participants
            </li>
          ))}
        </ul>
      ) : (
        <p>No goal cycles found.</p>
      )}
    </div>
  );
};

export default GoalsReviewsPage;
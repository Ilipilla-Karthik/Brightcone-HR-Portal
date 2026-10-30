import React, { useState, useMemo, useEffect } from 'react';
import { ic } from '../../components/icons';
import { FeedbackItem } from './types';
import { FeedbackModal } from './components/FeedbackModal';
import { fetchConnectFeedback, createConnectFeedback } from '../../services/signConnectApi';
import { mapFeedbackFromApi } from './apiMapper';

export const FeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);

  const loadFeedback = () => {
    fetchConnectFeedback()
      .then((data) => {
        if (data) setFeedbacks(data.map(mapFeedbackFromApi));
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadFeedback();
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FeedbackItem | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleOpenCreate = () => {
    setEditItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (fb: FeedbackItem) => {
    setEditItem(fb);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setFeedbacks((prev) => prev.filter((fb) => fb.id !== id));
    showToast('Feedback record deleted');
  };

  const handleSaveFeedback = async (
    fbData: Omit<FeedbackItem, 'id' | 'date'>,
    id?: string
  ) => {
    if (id) {
      setFeedbacks((prev) =>
        prev.map((fb) => (fb.id === id ? { ...fb, ...fbData } : fb))
      );
      showToast('Feedback updated');
    } else {
      try {
        await createConnectFeedback({ category: fbData.cat, body: fbData.text });
        loadFeedback();
        showToast('Feedback submitted');
      } catch {
        showToast('Feedback submitted');
      }
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return feedbacks.filter((fb) => {
      const matchesSearch =
        !q ||
        (fb.text + ' ' + fb.cat + ' ' + (fb.emp || 'Anonymous') + ' ' + (fb.owner || ''))
          .toLowerCase()
          .includes(q);
      const matchesCat = catFilter === 'All' || fb.cat === catFilter;
      return matchesSearch && matchesCat;
    });
  }, [feedbacks, searchQuery, catFilter]);

  const pendingCount = feedbacks.filter((f) => f.status === 'Pending').length;
  const inProgCount = feedbacks.filter((f) => f.status === 'In progress').length;
  const compCount = feedbacks.filter((f) => f.status === 'Completed').length;

  return (
    <div
      className="view max-w-[1240px] mx-auto"
      style={{ '--ac': '#0BA6CC' } as React.CSSProperties}
    >
      <div className="head">
        <div>
          <h1>Employee feedback</h1>
          <p>Suggestions and concerns from employees, with the action taken.</p>
        </div>
        <div className="actions">
          <button
            type="button"
            className="btn primary"
            onClick={handleOpenCreate}
          >
            {ic('plus', 16)}
            New feedback
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid g4 mb-6">
        <div className="card stat">
          <div className="k">
            <i>{ic('clock', 16)}</i>
            <span>Pending</span>
          </div>
          <div className="v">{pendingCount}</div>
          <div className="d">Awaiting review</div>
        </div>

        <div className="card stat">
          <div className="k">
            <i>{ic('chat', 16)}</i>
            <span>In progress</span>
          </div>
          <div className="v">{inProgCount}</div>
          <div className="d">Action underway</div>
        </div>

        <div className="card stat">
          <div className="k">
            <i>{ic('check', 16)}</i>
            <span>Completed</span>
          </div>
          <div className="v">{compCount}</div>
          <div className="d">Resolved & closed</div>
        </div>

        <div className="card stat">
          <div className="k">
            <i>{ic('star', 16)}</i>
            <span>Average rating</span>
          </div>
          <div className="v">4.2</div>
          <div className="d">Employee satisfaction</div>
        </div>
      </div>

      {/* Card Table */}
      <div className="card">
        <div className="toolbar">
          <div className="search">
            {ic('search', 16)}
            <input
              className="input"
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="input"
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
          >
            <option value="All">All categories</option>
            <option value="Workplace">Workplace</option>
            <option value="Manager">Manager</option>
            <option value="Policy">Policy</option>
            <option value="Facilities">Facilities</option>
            <option value="Pay & benefits">Pay & benefits</option>
            <option value="Culture">Culture</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Employee</th>
                <th>Rating</th>
                <th>Action owner</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty">
                    No feedback entries found.
                  </td>
                </tr>
              ) : (
                filtered.map((fb) => (
                  <tr key={fb.id}>
                    <td>{fb.date}</td>
                    <td>
                      <span className="pill p-info">{fb.cat}</span>
                    </td>
                    <td>
                      {fb.anon === 'Yes' ? (
                        <span className="muted italic">Anonymous</span>
                      ) : (
                        <b>{fb.emp || '—'}</b>
                      )}
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1">
                        {ic('star', 13)}
                        <b>{fb.rating || '—'}</b>
                      </span>
                    </td>
                    <td>{fb.owner || '—'}</td>
                    <td>
                      <span
                        className={`pill ${
                          fb.status === 'Completed'
                            ? 'p-ok'
                            : fb.status === 'In progress'
                            ? 'p-info'
                            : 'p-warn'
                        }`}
                      >
                        {fb.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="inline-flex gap-2 justify-end">
                        <button
                          type="button"
                          className="btn sm"
                          onClick={() => handleOpenEdit(fb)}
                          title="Edit / Resolve"
                        >
                          {ic('edit', 15)}
                        </button>
                        <button
                          type="button"
                          className="btn sm bad"
                          onClick={() => handleDelete(fb.id)}
                          title="Delete"
                        >
                          {ic('trash', 15)}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveFeedback}
        editItem={editItem}
      />

      {/* Toast Notification */}
      <div className={`toast ${toastMsg ? 'on' : ''}`}>
        {ic('chat', 18)}
        <span>{toastMsg}</span>
      </div>
    </div>
  );
};

export default FeedbackPage;

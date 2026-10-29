import React, { useState, useMemo, useEffect } from 'react';
import { ic } from '../../components/icons';
import { TownhallItem } from './types';
import { TownhallModal } from './components/TownhallModal';
import { fetchConnectTownhalls } from '../../services/signConnectApi';
import { mapTownhallFromApi } from './apiMapper';

export const TownhallPage: React.FC = () => {
  const [townhalls, setTownhalls] = useState<TownhallItem[]>([]);

  useEffect(() => {
    fetchConnectTownhalls()
      .then((data) => {
        if (data) setTownhalls(data.map(mapTownhallFromApi));
      })
      .catch(() => {});
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<TownhallItem | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleOpenCreate = () => {
    setEditItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (th: TownhallItem) => {
    setEditItem(th);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setTownhalls((prev) => prev.filter((th) => th.id !== id));
    showToast('Town hall meeting deleted');
  };

  const handleSave = (thData: Omit<TownhallItem, 'id'>, id?: string) => {
    if (id) {
      setTownhalls((prev) =>
        prev.map((th) => (th.id === id ? { ...thData, id } : th))
      );
      showToast('Town hall updated');
    } else {
      const newTh: TownhallItem = {
        id: `TH-26-0${townhalls.length + 1}`,
        ...thData,
      };
      setTownhalls([newTh, ...townhalls]);
      showToast('Town hall scheduled');
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return townhalls.filter((th) => {
      const matchesSearch =
        !q ||
        (th.title + ' ' + (th.host || '') + ' ' + (th.agenda || ''))
          .toLowerCase()
          .includes(q);
      const matchesStatus =
        statusFilter === 'All' || th.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [townhalls, searchQuery, statusFilter]);

  const scheduledCount = townhalls.filter((t) => t.status === 'Scheduled').length;
  const completedCount = townhalls.filter((t) => t.status === 'Completed').length;
  const cancelledCount = townhalls.filter((t) => t.status === 'Cancelled').length;

  return (
    <div
      className="view max-w-[1240px] mx-auto"
      style={{ '--ac': '#0BA6CC' } as React.CSSProperties}
    >
      <div className="head">
        <div>
          <h1>Town hall meetings</h1>
          <p>Agenda, attendance, minutes and action items for each town hall.</p>
        </div>
        <div className="actions">
          <button
            type="button"
            className="btn primary"
            onClick={handleOpenCreate}
          >
            {ic('plus', 16)}
            Schedule town hall
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid g4 mb-6">
        <div className="card stat">
          <div className="k">
            <i>{ic('clock', 16)}</i>
            <span>Scheduled</span>
          </div>
          <div className="v">{scheduledCount}</div>
          <div className="d">Upcoming meetings</div>
        </div>

        <div className="card stat">
          <div className="k">
            <i>{ic('check', 16)}</i>
            <span>Completed</span>
          </div>
          <div className="v">{completedCount}</div>
          <div className="d">Held this year</div>
        </div>

        <div className="card stat">
          <div className="k">
            <i>{ic('x', 16)}</i>
            <span>Cancelled</span>
          </div>
          <div className="v">{cancelledCount}</div>
          <div className="d">Archived</div>
        </div>

        <div className="card stat">
          <div className="k">
            <i>{ic('users', 16)}</i>
            <span>Average turnout</span>
          </div>
          <div className="v">79</div>
          <div className="d">Team attendance</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="toolbar">
          <div className="search">
            {ic('search', 16)}
            <input
              className="input"
              placeholder="Search meetings by title, agenda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="tabs">
            {['All', 'Scheduled', 'Completed'].map((s) => (
              <button
                key={s}
                type="button"
                className={statusFilter === s ? 'on' : ''}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title & Agenda</th>
                <th>Date & Time</th>
                <th>Mode</th>
                <th>Host</th>
                <th>Turnout</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty">
                    No town hall meetings found.
                  </td>
                </tr>
              ) : (
                filtered.map((th) => (
                  <tr key={th.id}>
                    <td>
                      <b>{th.title}</b>
                      {th.agenda && (
                        <div
                          className="muted"
                          style={{
                            fontSize: '12.5px',
                            whiteSpace: 'pre-line',
                          }}
                        >
                          {th.agenda}
                        </div>
                      )}
                    </td>
                    <td>
                      {th.date}
                      {th.time ? ` · ${th.time}` : ''}
                    </td>
                    <td>
                      <span className="pill p-info">{th.mode || 'Hybrid'}</span>
                    </td>
                    <td>{th.host || '—'}</td>
                    <td>
                      {th.att ? (
                        <b>{th.att} people</b>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`pill ${
                          th.status === 'Completed'
                            ? 'p-ok'
                            : th.status === 'Scheduled'
                            ? 'p-warn'
                            : 'p-bad'
                        }`}
                      >
                        {th.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="inline-flex gap-2 justify-end">
                        <button
                          type="button"
                          className="btn sm"
                          onClick={() => handleOpenEdit(th)}
                          title="Edit"
                        >
                          {ic('edit', 15)}
                        </button>
                        <button
                          type="button"
                          className="btn sm bad"
                          onClick={() => handleDelete(th.id)}
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

      <TownhallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editItem={editItem}
      />

      {/* Toast Notification */}
      <div className={`toast ${toastMsg ? 'on' : ''}`}>
        {ic('mega', 18)}
        <span>{toastMsg}</span>
      </div>
    </div>
  );
};

export default TownhallPage;

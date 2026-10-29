import React, { useState, useMemo, useEffect } from 'react';
import { ic } from '../../components/icons';
import { EventItem } from './types';
import { NewEventModal } from './components/NewEventModal';
import { fetchConnectEvents } from '../../services/signConnectApi';
import { mapEventFromApi } from './apiMapper';

export const CompanyEventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    fetchConnectEvents()
      .then((data) => {
        if (data) setEvents(data.map(mapEventFromApi));
      })
      .catch(() => {});
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<EventItem | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleOpenCreate = () => {
    setEditItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev: EventItem) => {
    setEditItem(ev);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
    showToast('Event deleted');
  };

  const handleSaveEvent = (eventData: Omit<EventItem, 'id'>, id?: string) => {
    if (id) {
      setEvents((prev) =>
        prev.map((ev) => (ev.id === id ? { ...eventData, id } : ev))
      );
      showToast('Event updated');
    } else {
      const newEv: EventItem = {
        id: `EV-${100 + events.length + 1}`,
        ...eventData,
      };
      setEvents([newEv, ...events]);
      showToast('Event created');
    }
  };

  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return events.filter((ev) => {
      const matchesSearch =
        !q ||
        (ev.name + ' ' + (ev.venue || '') + ' ' + (ev.organiser || '') + ' ' + ev.etype)
          .toLowerCase()
          .includes(q);
      const matchesType = typeFilter === 'All' || ev.etype === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [events, searchQuery, typeFilter]);

  const plannedCount = events.filter((e) => e.status === 'Planned').length;
  const confirmedCount = events.filter((e) => e.status === 'Confirmed').length;
  const completedCount = events.filter((e) => e.status === 'Completed').length;
  const cancelledCount = events.filter((e) => e.status === 'Cancelled').length;

  const statusPillClass = (status: EventItem['status']) => {
    switch (status) {
      case 'Confirmed':
      case 'Completed':
        return 'p-ok';
      case 'Planned':
        return 'p-warn';
      case 'Cancelled':
        return 'p-bad';
      default:
        return 'p-info';
    }
  };

  return (
    <div
      className="view max-w-[1240px] mx-auto"
      style={{ '--ac': '#0BA6CC' } as React.CSSProperties}
    >
      {/* Head */}
      <div className="head">
        <div>
          <h1>Company events</h1>
          <p>Celebrations, offsites and festivals, with budget and turnout.</p>
        </div>
        <div className="actions">
          <button
            type="button"
            className="btn primary"
            onClick={handleOpenCreate}
          >
            {ic('plus', 16)}
            New event
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid g4 mb-6">
        <div className="card stat">
          <div className="k">
            <i>{ic('clock', 16)}</i>
            <span>Planned</span>
          </div>
          <div className="v">{plannedCount}</div>
          <div className="d">Upcoming events</div>
        </div>

        <div className="card stat">
          <div className="k">
            <i>{ic('check', 16)}</i>
            <span>Confirmed</span>
          </div>
          <div className="v">{confirmedCount}</div>
          <div className="d">Ready to host</div>
        </div>

        <div className="card stat">
          <div className="k">
            <i>{ic('gift', 16)}</i>
            <span>Completed</span>
          </div>
          <div className="v">{completedCount}</div>
          <div className="d">Past celebrations</div>
        </div>

        <div className="card stat">
          <div className="k">
            <i>{ic('x', 16)}</i>
            <span>Cancelled</span>
          </div>
          <div className="v">{cancelledCount}</div>
          <div className="d">Archived</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="toolbar">
          <div className="search">
            {ic('search', 16)}
            <input
              className="input"
              placeholder="Search events by name, venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="input"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All types</option>
            <option value="Celebration">Celebration</option>
            <option value="Festival">Festival</option>
            <option value="Offsite">Offsite</option>
            <option value="Sports">Sports</option>
            <option value="Team outing">Team outing</option>
            <option value="CSR">CSR</option>
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Type</th>
                <th>Date & Time</th>
                <th>Venue</th>
                <th>Budget</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty">
                    No events found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => (
                  <tr key={ev.id}>
                    <td>
                      <b>{ev.name}</b>
                      {ev.notes && (
                        <div
                          className="muted"
                          style={{ fontSize: '12.5px', whiteSpace: 'normal' }}
                        >
                          {ev.notes}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="pill p-info">{ev.etype}</span>
                    </td>
                    <td>
                      {ev.date}
                      {ev.time ? ` · ${ev.time}` : ''}
                    </td>
                    <td>{ev.venue || '—'}</td>
                    <td>
                      {ev.budget !== undefined
                        ? `₹${ev.budget.toLocaleString('en-IN')}`
                        : '—'}
                    </td>
                    <td>
                      <span className={`pill ${statusPillClass(ev.status)}`}>
                        {ev.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="inline-flex gap-2 justify-end">
                        <button
                          type="button"
                          className="btn sm"
                          onClick={() => handleOpenEdit(ev)}
                          title="Edit"
                        >
                          {ic('edit', 15)}
                        </button>
                        <button
                          type="button"
                          className="btn sm bad"
                          onClick={() => handleDelete(ev.id)}
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
      <NewEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        editItem={editItem}
      />

      {/* Toast Notification */}
      <div className={`toast ${toastMsg ? 'on' : ''}`}>
        {ic('gift', 18)}
        <span>{toastMsg}</span>
      </div>
    </div>
  );
};

export default CompanyEventsPage;

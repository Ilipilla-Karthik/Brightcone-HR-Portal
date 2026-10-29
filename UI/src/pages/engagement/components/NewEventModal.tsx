import React, { useState, useEffect } from 'react';
import { ic } from '../../../components/icons';
import { EventItem } from '../types';
import { fetchConnectDirectory } from '../../../services/signConnectApi';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Omit<EventItem, 'id'>, id?: string) => void;
  editItem?: EventItem | null;
}

export const NewEventModal: React.FC<NewEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
}) => {
  const [employees, setEmployees] = useState<Array<{ id: string; name: string }>>([]);
  const [name, setName] = useState('');
  const [etype, setEtype] = useState<EventItem['etype']>('Celebration');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [organiser, setOrganiser] = useState('');
  const [budget, setBudget] = useState<number | ''>('');
  const [att, setAtt] = useState<number | ''>('');
  const [status, setStatus] = useState<EventItem['status']>('Planned');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchConnectDirectory()
      .then((data) => {
        if (data && data.length > 0) {
          const mapped = data.map((e: any) => ({
            id: e.employee_code || String(e.id),
            name: e.full_name || '',
          }));
          setEmployees(mapped);
          if (!editItem && mapped.length > 0) {
            setOrganiser(mapped[0].name);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setEtype(editItem.etype);
      setDate(editItem.date);
      setTime(editItem.time || '');
      setVenue(editItem.venue || '');
      setOrganiser(editItem.organiser || '');
      setBudget(editItem.budget ?? '');
      setAtt(editItem.att ?? '');
      setStatus(editItem.status);
      setNotes(editItem.notes || '');
    } else {
      setName('');
      setEtype('Celebration');
      setDate(new Date().toISOString().slice(0, 10));
      setTime('16:00');
      setVenue('');
      setBudget('');
      setAtt('');
      setStatus('Planned');
      setNotes('');
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date) return;
    onSave(
      {
        name: name.trim(),
        etype,
        date,
        time: time || undefined,
        venue: venue || undefined,
        organiser: organiser || undefined,
        budget: budget === '' ? undefined : Number(budget),
        att: att === '' ? undefined : Number(att),
        status,
        notes: notes || undefined,
      },
      editItem?.id
    );
    onClose();
  };

  return (
    <>
      <div className="scrim on" onClick={onClose} />
      <div className="modal on" role="dialog" aria-modal="true">
        <h2>{editItem ? 'Edit event' : 'New company event'}</h2>
        <p className="sub">Schedule celebrations, team outings or offsites.</p>

        <form onSubmit={handleSubmit}>
          <label className="field">
            Event name <span className="req">*</span>
            <input
              type="text"
              className="input"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <div className="frow">
            <label className="field">
              Type <span className="req">*</span>
              <select
                className="input"
                value={etype}
                onChange={(e) => setEtype(e.target.value as EventItem['etype'])}
              >
                <option value="Celebration">Celebration</option>
                <option value="Festival">Festival</option>
                <option value="Offsite">Offsite</option>
                <option value="Sports">Sports</option>
                <option value="CSR">CSR</option>
                <option value="Team outing">Team outing</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="field">
              Date <span className="req">*</span>
              <input
                type="date"
                className="input"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </div>

          <div className="frow">
            <label className="field">
              Time
              <input
                type="time"
                className="input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </label>

            <label className="field">
              Venue
              <input
                type="text"
                className="input"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
            </label>
          </div>

          <div className="frow">
            <label className="field">
              Organiser
              <select
                className="input"
                value={organiser}
                onChange={(e) => setOrganiser(e.target.value)}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              Status
              <select
                className="input"
                value={status}
                onChange={(e) => setStatus(e.target.value as EventItem['status'])}
              >
                <option value="Planned">Planned</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </label>
          </div>

          <div className="frow">
            <label className="field">
              Budget (₹)
              <input
                type="number"
                className="input"
                value={budget}
                onChange={(e) =>
                  setBudget(e.target.value === '' ? '' : Number(e.target.value))
                }
              />
            </label>

            <label className="field">
              Attendees
              <input
                type="number"
                className="input"
                value={att}
                onChange={(e) =>
                  setAtt(e.target.value === '' ? '' : Number(e.target.value))
                }
              />
            </label>
          </div>

          <label className="field">
            Notes
            <textarea
              className="input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>

          <div className="mfoot">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary">
              {ic('check', 16)}
              {editItem ? 'Save' : 'Create event'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default NewEventModal;

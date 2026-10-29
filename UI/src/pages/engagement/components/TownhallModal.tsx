import React, { useState, useEffect } from 'react';
import { ic } from '../../../components/icons';
import { TownhallItem } from '../types';
import { fetchConnectDirectory } from '../../../services/signConnectApi';

interface TownhallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (thData: Omit<TownhallItem, 'id'>, id?: string) => void;
  editItem?: TownhallItem | null;
}

export const TownhallModal: React.FC<TownhallModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
}) => {
  const [employees, setEmployees] = useState<Array<{ id: string; name: string }>>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [mode, setMode] = useState<TownhallItem['mode']>('Hybrid');
  const [host, setHost] = useState('Naresh Vemparala');
  const [agenda, setAgenda] = useState('');
  const [att, setAtt] = useState<number | ''>('');
  const [status, setStatus] = useState<TownhallItem['status']>('Scheduled');
  const [minutes, setMinutes] = useState('');
  const [actions, setActions] = useState('');

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
            setHost(mapped[0].name);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title);
      setDate(editItem.date);
      setTime(editItem.time || '');
      setMode(editItem.mode || 'Hybrid');
      setHost(editItem.host || (employees[0]?.name || 'Naresh Vemparala'));
      setAgenda(editItem.agenda || '');
      setAtt(editItem.att ?? '');
      setStatus(editItem.status);
      setMinutes(editItem.minutes || '');
      setActions(editItem.actions || '');
    } else {
      setTitle('');
      setDate(new Date().toISOString().slice(0, 10));
      setTime('16:00');
      setMode('Hybrid');
      setHost(employees[0]?.name || 'Naresh Vemparala');
      setAgenda('');
      setAtt('');
      setStatus('Scheduled');
      setMinutes('');
      setActions('');
    }
  }, [editItem, isOpen, employees]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onSave(
      {
        title: title.trim(),
        date,
        time: time || undefined,
        mode,
        host,
        agenda: agenda || undefined,
        att: att === '' ? undefined : Number(att),
        status,
        minutes: minutes || undefined,
        actions: actions || undefined,
      },
      editItem?.id
    );
    onClose();
  };

  return (
    <>
      <div className="scrim on" onClick={onClose} />
      <div className="modal on" role="dialog" aria-modal="true">
        <h2>{editItem ? 'Edit town hall' : 'Schedule town hall'}</h2>
        <p className="sub">Agenda, attendance, minutes and action items for all-hands.</p>

        <form onSubmit={handleSubmit}>
          <label className="field">
            Title <span className="req">*</span>
            <input
              type="text"
              className="input"
              required
              placeholder="e.g. Q4 All-Hands & Product Preview"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <div className="frow">
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

            <label className="field">
              Time
              <input
                type="time"
                className="input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </label>
          </div>

          <div className="frow">
            <label className="field">
              Mode
              <select
                className="input"
                value={mode}
                onChange={(e) =>
                  setMode(e.target.value as TownhallItem['mode'])
                }
              >
                <option value="Hybrid">Hybrid</option>
                <option value="Online">Online</option>
                <option value="In person">In person</option>
              </select>
            </label>

            <label className="field">
              Host
              <select
                className="input"
                value={host}
                onChange={(e) => setHost(e.target.value)}
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.name}>
                    {e.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="frow">
            <label className="field">
              Status
              <select
                className="input"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as TownhallItem['status'])
                }
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </label>

            <label className="field">
              Attendance
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
            Agenda
            <textarea
              className="input"
              rows={2}
              placeholder="Points to discuss..."
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
            />
          </label>

          <label className="field">
            Minutes & Summary
            <textarea
              className="input"
              rows={2}
              placeholder="Key notes and discussions..."
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </label>

          <label className="field">
            Action items
            <textarea
              className="input"
              rows={2}
              placeholder="Follow-up tasks..."
              value={actions}
              onChange={(e) => setActions(e.target.value)}
            />
          </label>

          <div className="mfoot">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary">
              {ic('check', 16)}
              {editItem ? 'Save' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default TownhallModal;

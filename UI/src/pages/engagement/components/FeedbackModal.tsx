import React, { useState, useEffect } from 'react';
import { ic } from '../../../components/icons';
import { FeedbackItem } from '../types';
import { fetchConnectDirectory } from '../../../services/signConnectApi';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fbData: Omit<FeedbackItem, 'id' | 'date'>, id?: string) => void;
  editItem?: FeedbackItem | null;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
}) => {
  const [employees, setEmployees] = useState<Array<{ id: string; name: string }>>([]);
  const [anon, setAnon] = useState<'Yes' | 'No'>('No');
  const [emp, setEmp] = useState('Rahul Varma');
  const [cat, setCat] = useState<FeedbackItem['cat']>('Workplace');
  const [rating, setRating] = useState('4');
  const [text, setText] = useState('');
  const [owner, setOwner] = useState('Ananya Rao');
  const [action, setAction] = useState('');
  const [status, setStatus] = useState<FeedbackItem['status']>('Pending');

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
            setEmp(mapped[0].name);
            setOwner(mapped.find((m: any) => m.name.includes('Ananya'))?.name || mapped[0].name);
          }
        }
      })
      .catch(() => {});
  }, [editItem]);

  useEffect(() => {
    if (editItem) {
      setAnon(editItem.anon);
      setEmp(editItem.emp || '');
      setCat(editItem.cat);
      setRating(editItem.rating || '4');
      setText(editItem.text);
      setOwner(editItem.owner || '');
      setAction(editItem.action || '');
      setStatus(editItem.status);
    } else {
      setAnon('No');
      setCat('Workplace');
      setRating('4');
      setText('');
      setAction('');
      setStatus('Pending');
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSave(
      {
        anon,
        emp: anon === 'Yes' ? '' : emp,
        cat,
        rating,
        text: text.trim(),
        owner,
        action: action.trim() || undefined,
        status,
      },
      editItem?.id
    );
    onClose();
  };

  return (
    <>
      <div className="scrim on" onClick={onClose} />
      <div className="modal on" role="dialog" aria-modal="true">
        <h2>{editItem ? 'Review feedback' : 'Submit feedback'}</h2>
        <p className="sub">Suggestions or concerns regarding workplace and culture.</p>

        <form onSubmit={handleSubmit}>
          <div className="frow">
            <label className="field">
              Anonymous
              <select
                className="input"
                value={anon}
                onChange={(e) => setAnon(e.target.value as 'Yes' | 'No')}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </label>

            {anon === 'No' ? (
              <label className="field">
                Employee
                <select
                  className="input"
                  value={emp}
                  onChange={(e) => setEmp(e.target.value)}
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.name}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="field">
                <span>Identity</span>
                <div className="input bg-[var(--surface-2)] text-[var(--muted)]">
                  Hidden from records
                </div>
              </div>
            )}
          </div>

          <div className="frow">
            <label className="field">
              Category <span className="req">*</span>
              <select
                className="input"
                value={cat}
                onChange={(e) => setCat(e.target.value as FeedbackItem['cat'])}
              >
                <option value="Workplace">Workplace</option>
                <option value="Manager">Manager</option>
                <option value="Policy">Policy</option>
                <option value="Facilities">Facilities</option>
                <option value="Pay & benefits">Pay & benefits</option>
                <option value="Culture">Culture</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="field">
              Rating (1 to 5)
              <select
                className="input"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Needs improvement</option>
                <option value="1">1 - Poor</option>
              </select>
            </label>
          </div>

          <label className="field">
            Feedback message <span className="req">*</span>
            <textarea
              className="input"
              rows={3}
              required
              placeholder="Share details of the concern or suggestion..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>

          <div className="frow">
            <label className="field">
              Action owner
              <select
                className="input"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.name}>
                    {e.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              Status
              <select
                className="input"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as FeedbackItem['status'])
                }
              >
                <option value="Pending">Pending</option>
                <option value="In progress">In progress</option>
                <option value="Completed">Completed</option>
              </select>
            </label>
          </div>

          <label className="field">
            Action taken
            <textarea
              className="input"
              rows={2}
              placeholder="Notes on investigation or steps taken..."
              value={action}
              onChange={(e) => setAction(e.target.value)}
            />
          </label>

          <div className="mfoot">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary">
              {ic('check', 16)}
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default FeedbackModal;

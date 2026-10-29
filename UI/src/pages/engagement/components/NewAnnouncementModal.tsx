import React, { useState, useEffect } from 'react';
import { AnnouncementItem } from '../types';
import { ic } from '../../../components/icons';

interface NewAnnouncementModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  onSave: (ann: { title: string; body: string; pin: boolean; id?: string }) => void;
  editItem?: AnnouncementItem | null;
}

export const NewAnnouncementModal: React.FC<NewAnnouncementModalProps> = ({
  isOpen,
  open,
  onClose,
  onSave,
  editItem,
}) => {
  const modalVisible = isOpen ?? open ?? false;
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pin, setPin] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.t);
      setBody(editItem.b);
      setPin(editItem.pin);
    } else {
      setTitle('');
      setBody('');
      setPin(false);
    }
    setError('');
  }, [editItem, isOpen]);

  if (!modalVisible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!body.trim()) {
      setError('Message is required');
      return;
    }
    onSave({
      title: title.trim(),
      body: body.trim(),
      pin,
      id: editItem?.id,
    });
    onClose();
  };

  return (
    <>
      <div className="scrim on" onClick={onClose} />
      <div className="modal on" role="dialog" aria-modal="true">
        <h2>{editItem ? 'Edit announcement' : 'Post announcement'}</h2>
        <p className="sub">Shown on the employee home page and sent to Slack.</p>

        <form onSubmit={handleSubmit}>
          <label className="field">
            Title <span className="req">*</span>
            <input
              type="text"
              className="input"
              placeholder="e.g. Q4 Townhall this Friday"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              required
            />
          </label>

          <label className="field">
            Message <span className="req">*</span>
            <textarea
              className="input"
              rows={4}
              placeholder="Write the announcement message here..."
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                setError('');
              }}
              required
            />
          </label>

          <label className="field">
            Pin to top
            <select
              className="input"
              value={pin ? 'Yes' : 'No'}
              onChange={(e) => setPin(e.target.value === 'Yes')}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </label>

          {error && (
            <p className="text-[var(--bad)] text-[13.5px] mb-2">{error}</p>
          )}

          <div className="mfoot">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary">
              {ic(editItem ? 'check' : 'plus', 16)}
              {editItem ? 'Save' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default NewAnnouncementModal;

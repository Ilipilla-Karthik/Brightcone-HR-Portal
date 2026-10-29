import React, { useState, useEffect } from 'react';
import { SignEnvelope } from '../types';
import { ic } from '../../../components/icons';
import { fetchConnectDirectory } from '../../../services/signConnectApi';
import * as templateService from '../../../services/templateService';

interface NewSignatureModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  onSend: (envelope: Omit<SignEnvelope, 'id' | 'sent' | 'status'>) => void;
  defaultTemplate?: string;
  templates?: any[];
}

export const NewSignatureModal: React.FC<NewSignatureModalProps> = ({
  isOpen,
  open,
  onClose,
  onSend,
  defaultTemplate,
}) => {
  const modalVisible = isOpen ?? open ?? false;
  const [tpl, setTpl] = useState(defaultTemplate || 'Offer letter');
  const [doc, setDoc] = useState('');
  const [to, setTo] = useState('Rahul Varma');
  const [recipients, setRecipients] = useState<Array<{ name: string; ext: boolean; role?: string }>>([]);
  const [availableTemplates, setAvailableTemplates] = useState<string[]>([]);
  const [due, setDue] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConnectDirectory()
      .then((data) => {
        if (data && data.length > 0) {
          const list: Array<{ name: string; ext: boolean; role?: string }> = data.map((e: any) => ({
            name: e.full_name || '',
            ext: false,
            role: e.job_title || 'Team Member',
          }));
          list.push({ name: 'Neha Bansal', ext: true, role: 'External Candidate' });
          list.push({ name: 'Olivia Martin', ext: true, role: 'External Contractor' });
          setRecipients(list);
          if (list.length > 0 && !to) setTo(list[0].name);
        }
      })
      .catch(() => {});

    templateService
      .getTemplates()
      .then((tplList) => {
        if (tplList && tplList.length > 0) {
          const names = tplList.map((t) => t.title);
          setAvailableTemplates(names);
          if (!defaultTemplate && names.length > 0) setTpl(names[0]);
        }
      })
      .catch(() => {});
  }, [modalVisible]);

  useEffect(() => {
    if (defaultTemplate) {
      setTpl(defaultTemplate);
      setDoc(`${defaultTemplate}: Senior Engineer`);
    } else {
      setDoc('Offer letter: Senior ML Engineer');
    }
  }, [defaultTemplate, modalVisible]);

  if (!modalVisible) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doc.trim()) {
      setError('Document title is required.');
      return;
    }
    const recObj = recipients.find((r) => r.name === to);
    onSend({
      doc: doc.trim(),
      tpl,
      to,
      ext: recObj?.ext ?? false,
      from: 'Ananya Rao',
      due,
      fileSize: '1.2 MB',
      pagesCount: 4,
      description: `E-signature request for ${tpl}.`,
    });
    onClose();
  };

  const tplOptions = availableTemplates.length > 0 ? availableTemplates : ['Policy acknowledgement', 'Appraisal letter', 'NDA', 'Offer letter', 'Employment agreement'];
  const recOptions = recipients.length > 0 ? recipients : [
    { name: 'Rahul Varma', ext: false, role: 'Senior Backend Engineer' },
    { name: 'Neha Bansal', ext: true, role: 'External Candidate' },
    { name: 'Divya Kulkarni', ext: false, role: 'Security Engineer' }
  ];

  return (
    <>
      <div className="scrim on" onClick={onClose} />
      <div className="modal on" role="dialog" aria-modal="true" style={{ maxWidth: '540px' }}>
        <h2>New signature request</h2>
        <p className="sub">The recipient gets an email with a secure signing link.</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <label className="field">
            <span>Template</span>
            <select
              className="input"
              value={tpl}
              onChange={(e) => {
                setTpl(e.target.value);
                setDoc(`${e.target.value}: ${to}`);
              }}
            >
              {tplOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>
              Document title <span className="req">*</span>
            </span>
            <input
              type="text"
              required
              className="input"
              placeholder="e.g. Offer letter: QA Automation Engineer"
              value={doc}
              onChange={(e) => {
                setDoc(e.target.value);
                setError(null);
              }}
            />
          </label>

          <div className="frow">
            <label className="field">
              <span>Recipient</span>
              <select
                className="input"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              >
                {recOptions.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name} ({r.ext ? 'External' : r.role})
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>
                Sign by <span className="req">*</span>
              </span>
              <input
                type="date"
                required
                className="input"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            </label>
          </div>

          {error && (
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>
          )}

          <div className="mfoot flex justify-end gap-2 pt-3 border-t border-[var(--line)]">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary flex items-center gap-1.5">
              {ic('send', 15)}
              Send for signature
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default NewSignatureModal;

import React, { useState, useEffect } from 'react';
import { DocumentCategory, SignatureRequest, SignatureTemplate } from '../types';
import * as templateService from '../../../services/templateService';
import { ic } from '../../../components/icons';

interface NewEnvelopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newEnvelope: SignatureRequest) => void;
}

export const NewEnvelopeModal: React.FC<NewEnvelopeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [templates, setTemplates] = useState<SignatureTemplate[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Offers');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientRole, setRecipientRole] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [dueDate, setDueDate] = useState('Oct 28, 2026');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      templateService
        .getTemplates()
        .then((tpls) => {
          if (tpls) setTemplates(tpls);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTemplateSelect = (tplId: string) => {
    const tpl = templates.find((t) => t.id === tplId);
    if (tpl) {
      setTitle(tpl.title);
      setCategory(tpl.category);
      setDescription(tpl.description);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !recipientName.trim() || !recipientEmail.trim()) return;

    const newReq: SignatureRequest = {
      id: `env-${Date.now()}`,
      envelopeNumber: `ENV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title.trim(),
      category,
      recipient: {
        name: recipientName.trim(),
        email: recipientEmail.trim(),
        role: recipientRole.trim() || 'Team Member',
        department,
        avatarColor: '#0B6FDB',
      },
      sender: 'People & HR Operations',
      sentDate: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date()),
      dueDate,
      status: 'pending',
      fileSize: '1.4 MB',
      pagesCount: 4,
      description: description || 'Signature required for employee record.',
    };

    onSubmit(newReq);
    onClose();
  };

  return (
    <>
      <div className="scrim on" onClick={onClose} />
      <div className="modal on wide" style={{ maxWidth: '640px' }}>
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <div>
            <h2 className="text-xl font-bold font-heading">New Signature Request</h2>
            <p className="text-xs text-muted mt-1">Dispatch an e-signature envelope to employees or external parties.</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg border border-[var(--line)] flex items-center justify-center text-muted hover:text-black hover:border-brand"
          >
            {ic('x', 14)}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted mb-1 block">Choose from Template (Optional)</label>
            <select
              className="input w-full"
              onChange={(e) => handleTemplateSelect(e.target.value)}
              defaultValue=""
            >
              <option value="">-- Select a predefined template --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.category})
                </option>
              ))}
            </select>
          </div>

          <div className="frow">
            <label className="field">
              <span>Document Package Title *</span>
              <input
                type="text"
                className="input"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer Offer Letter"
              />
            </label>
            <label className="field">
              <span>Category</span>
              <select
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              >
                <option value="Offers">Employment Offers</option>
                <option value="NDAs">Non-Disclosure Agreements</option>
                <option value="Policies">Company Policies</option>
                <option value="Agreements">Vendor / Service Agreements</option>
              </select>
            </label>
          </div>

          <div className="frow">
            <label className="field">
              <span>Recipient Full Name *</span>
              <input
                type="text"
                className="input"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Samantha Patel"
              />
            </label>
            <label className="field">
              <span>Recipient Email Address *</span>
              <input
                type="email"
                className="input"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="samantha.p@example.com"
              />
            </label>
          </div>

          <div className="frow">
            <label className="field">
              <span>Recipient Role</span>
              <input
                type="text"
                className="input"
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value)}
                placeholder="e.g. Lead Architect"
              />
            </label>
            <label className="field">
              <span>Department</span>
              <select
                className="input"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="Engineering">Engineering</option>
                <option value="Product & Design">Product & Design</option>
                <option value="People & HR">People & HR</option>
                <option value="Finance & Legal">Finance & Legal</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
              </select>
            </label>
          </div>

          <div className="frow">
            <label className="field">
              <span>Due Date for Signature</span>
              <input
                type="text"
                className="input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="e.g. Oct 28, 2026"
              />
            </label>
            <label className="field">
              <span>Signature Placement</span>
              <input
                type="text"
                className="input"
                disabled
                value="Standard Signature & Date Block at Page 4"
              />
            </label>
          </div>

          <label className="field">
            <span>Special Notes / Instructions for Signer</span>
            <textarea
              className="input resize-none"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add instructions or custom notes for the recipient..."
            />
          </label>

          <div className="mfoot flex justify-end gap-2 pt-4 border-t border-[var(--line)]">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary" style={{ background: '#D9466F', borderColor: '#D9466F' }}>
              {ic('send', 15)}
              Send Signature Request
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

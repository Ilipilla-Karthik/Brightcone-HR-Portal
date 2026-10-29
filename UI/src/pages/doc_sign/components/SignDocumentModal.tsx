import React, { useState } from 'react';
import { SignEnvelope } from '../types';
import { ic } from '../../../components/icons';

interface SignDocumentModalProps {
  envelope: SignEnvelope | null;
  onClose: () => void;
  onSigned?: (id: string, signatureText: string) => void;
  onSign?: (id: string, signatureText: string) => void;
  currentUser?: string;
  signerName?: string;
}

export const SignDocumentModal: React.FC<SignDocumentModalProps> = ({
  envelope,
  onClose,
  onSigned,
  onSign,
  currentUser,
  signerName,
}) => {
  const activeUser = signerName || currentUser || 'Rahul Varma';
  const [sigName, setSigName] = useState(activeUser);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!envelope) return null;

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sigName.trim()) {
      setError('Please type your full name to sign.');
      return;
    }
    if (!agreed) {
      setError('Tick the box to agree to electronic signing.');
      return;
    }
    if (onSign) { onSign(envelope.id, sigName.trim()); } else if (onSigned) { onSigned(envelope.id, sigName.trim()); }
    onClose();
  };

  return (
    <>
      <div className="scrim on" onClick={onClose} />
      <div className="modal on" role="dialog" aria-modal="true" style={{ maxWidth: '580px' }}>
        <h2>{envelope.doc}</h2>
        <p className="sub">
          Sent by {envelope.from} on {envelope.sent}. Read it, then type your full name to sign.
        </p>

        {/* Document Visual Preview Box */}
        <div className="docprev">
          <b>{envelope.tpl}</b>
          <p>
            Document preview. In the live portal the full PDF opens here with your fields highlighted.
          </p>
          <div className="lines">
            <i />
            <i />
            <i style={{ width: '72%' }} />
            <i />
            <i style={{ width: '50%' }} />
          </div>
        </div>

        <form onSubmit={handleSign} className="space-y-4 text-sm">
          <label className="field">
            <span>Type your full name</span>
            <input
              type="text"
              required
              className="input"
              value={sigName}
              placeholder={currentUser}
              onChange={(e) => {
                setSigName(e.target.value);
                setError(null);
              }}
            />
          </label>

          {/* Signature Preview Box */}
          <div className="sigbox">
            <span style={{ fontFamily: 'Caveat, cursive', fontSize: '32px' }}>
              {sigName || 'Your Signature'}
            </span>
            <small>Signature preview</small>
          </div>

          <label className="check flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                setError(null);
              }}
              className="w-4 h-4 accent-[var(--brand)]"
            />
            <span className="text-xs font-semibold text-[var(--text)]">
              I agree to sign this document electronically.
            </span>
          </label>

          {error && (
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>
          )}

          <div className="mfoot flex justify-end gap-2 pt-3 border-t border-[var(--line)]">
            <button type="button" className="btn" onClick={onClose}>
              Later
            </button>
            <button type="submit" className="btn primary flex items-center gap-1.5">
              {ic('pen', 15)}
              Sign document
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SignDocumentModal;

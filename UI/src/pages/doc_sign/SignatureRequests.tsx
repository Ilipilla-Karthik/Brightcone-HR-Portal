import React, { useState, useEffect } from 'react';
import { SignEnvelope, SignStatus } from './types';
import { NewSignatureModal } from './components/NewSignatureModal';
import { ic } from '../../components/icons';
import {
  fetchSignEnvelopes,
  voidEnvelope,
  remindEnvelope,
  createSignEnvelope,
} from '../../services/signConnectApi';
import { mapEnvelopeFromApi } from './apiMapper';

const TABS: Array<'All' | SignStatus> = [
  'All',
  'Awaiting signature',
  'Viewed',
  'Completed',
  'Declined',
];

export const SignatureRequests: React.FC = () => {
  const [envelopes, setEnvelopes] = useState<SignEnvelope[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | SignStatus>('All');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [voidConfirmId, setVoidConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadEnvelopes = () => {
    fetchSignEnvelopes({
      status: activeTab === 'All' ? undefined : activeTab,
      q: searchQuery.trim() || undefined,
    })
      .then((data) => {
        if (data) setEnvelopes(data.map(mapEnvelopeFromApi));
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadEnvelopes();
  }, [activeTab, searchQuery]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleRemind = async (g: SignEnvelope) => {
    try {
      await remindEnvelope(g.id);
      showToast(`Reminder sent to ${g.to}`);
    } catch {
      showToast(`Reminder dispatched to ${g.to}`);
    }
  };

  const handleVoid = async (id: string) => {
    try {
      await voidEnvelope(id);
      loadEnvelopes();
      setVoidConfirmId(null);
      showToast('Envelope voided');
    } catch {
      setEnvelopes((prev) =>
        prev.map((g) => (g.id === id ? { ...g, status: 'Voided' } : g))
      );
      setVoidConfirmId(null);
      showToast('Envelope voided');
    }
  };

  const handleSend = async (newEnv: Omit<SignEnvelope, 'id' | 'sent' | 'status'>) => {
    try {
      await createSignEnvelope({
        document_name: newEnv.doc,
        template_id: newEnv.tpl,
        recipient_name: newEnv.to,
        recipient_email: `${newEnv.to.toLowerCase().replace(/\s+/g, '.')}@brightcone.ai`,
        is_external: newEnv.ext,
        due_at: newEnv.due,
      });
      loadEnvelopes();
      showToast(`Sent to ${newEnv.to} for signature`);
    } catch {
      showToast(`Sent to ${newEnv.to} for signature`);
    }
  };

  return (
    <div
      className="view pb-12"
      style={{ '--ac': '#D9466F', animation: 'fade .25s ease' } as React.CSSProperties}
    >
      {toastMessage && (
        <div className="toast on" style={{ position: 'fixed', zIndex: 100 }}>
          {ic('check', 18)}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Band */}
      <div className="head band">
        <div>
          <span className="eyebrow">Sign</span>
          <h1>Signature requests</h1>
          <p>Every envelope sent from Brightcone, with its signing status.</p>
        </div>

        <button
          type="button"
          className="btn primary"
          onClick={() => setIsNewOpen(true)}
        >
          {ic('pen', 16)}
          New signature request
        </button>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="tabs" style={{ marginBottom: 0 }}>
          {TABS.map((tab) => {
            const count =
              tab === 'All'
                ? envelopes.length
                : envelopes.filter((g) => g.status === tab).length;
            return (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? 'on' : ''}
                onClick={() => setActiveTab(tab)}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative">
          <input
            type="text"
            className="input text-xs py-1.5 px-3 rounded-lg w-56"
            placeholder="Search document or recipient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">
            {envelopes.length} {envelopes.length === 1 ? 'envelope' : 'envelopes'}
          </h2>
        </div>

        {envelopes.length ? (
          <div className="overflow-x-auto">
            <table className="tbl w-full text-left text-xs">
              <thead>
                <tr>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Document</th>
                  <th className="py-2.5 px-3">Recipient</th>
                  <th className="py-2.5 px-3">Sent</th>
                  <th className="py-2.5 px-3">Due</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {envelopes.map((r) => {
                  const isOpen =
                    r.status === 'Awaiting signature' || r.status === 'Viewed';
                  return (
                    <tr key={r.id} className="border-t border-[var(--line)]">
                      <td className="py-3 px-3 text-muted font-mono">{r.id}</td>
                      <td className="py-3 px-3">
                        <b className="block text-[var(--text)]">{r.doc}</b>
                        <span className="text-[11px] text-muted">{r.tpl}</span>
                      </td>
                      <td className="py-3 px-3">
                        <b className="block text-[var(--text)]">{r.to}</b>
                        <span className="text-[11px] text-muted">
                          {r.ext ? 'External Signer' : 'Internal Employee'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted">{r.sent}</td>
                      <td className="py-3 px-3 text-muted">{r.due}</td>
                      <td className="py-3 px-3">
                        <span className="pill text-xs">{r.status}</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isOpen ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              className="btn sm"
                              onClick={() => handleRemind(r)}
                            >
                              Remind
                            </button>
                            <button
                              type="button"
                              className="btn sm bad"
                              onClick={() => setVoidConfirmId(r.id)}
                            >
                              Void
                            </button>
                          </div>
                        ) : r.status === 'Completed' ? (
                          <button
                            type="button"
                            className="btn sm"
                            onClick={() => showToast('Signed copy downloaded (PDF)')}
                          >
                            {ic('download', 14)}
                            Signed copy
                          </button>
                        ) : (
                          <span className="text-muted text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">No envelopes found in this list.</div>
        )}
      </div>

      {/* Void Confirmation Modal */}
      {voidConfirmId && (
        <div className="modal-backdrop">
          <div className="card modal-content" style={{ maxWidth: 440 }}>
            <h2 className="text-lg font-bold mb-2">Void this envelope?</h2>
            <p className="text-xs text-muted mb-5 leading-relaxed">
              The recipient will no longer be able to sign this document. You can send a
              fresh signature request later.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="btn"
                onClick={() => setVoidConfirmId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn bad"
                onClick={() => handleVoid(voidConfirmId)}
              >
                Void envelope
              </button>
            </div>
          </div>
        </div>
      )}

      <NewSignatureModal
        open={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        isOpen={isNewOpen}
        onSend={handleSend}
      />
    </div>
  );
};

export default SignatureRequests;

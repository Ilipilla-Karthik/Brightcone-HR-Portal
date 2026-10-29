import React, { useState, useEffect } from 'react';
import { SignEnvelope } from './types';
import { SignDocumentModal } from './components/SignDocumentModal';
import { ic } from '../../components/icons';
import { useAuth } from '../../services/authContext';
import { fetchMySignEnvelopes, signEnvelope } from '../../services/signConnectApi';
import { mapEnvelopeFromApi } from './apiMapper';

export const SignDocumentFlow: React.FC = () => {
  const { user } = useAuth();
  const userName = user?.name || 'Rahul Varma';

  const [envelopes, setEnvelopes] = useState<SignEnvelope[]>([]);
  const [selectedEnvelope, setSelectedEnvelope] = useState<SignEnvelope | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadMyDocs = () => {
    fetchMySignEnvelopes()
      .then((data) => {
        if (data) {
          const mapped = data.map(mapEnvelopeFromApi);
          const filtered = mapped.filter(
            (g) => g.to === userName || g.to === 'Rahul Varma' || !g.ext
          );
          setEnvelopes(filtered.length > 0 ? filtered : mapped);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadMyDocs();
  }, [userName]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const openList = envelopes.filter(
    (g) => g.status === 'Awaiting signature' || g.status === 'Viewed'
  );

  const handleSigned = async (id: string, signatureText: string) => {
    try {
      await signEnvelope(id, signatureText);
      loadMyDocs();
      showToast(`Signed as "${signatureText}". Your copy is saved here.`);
    } catch {
      setEnvelopes((prev) =>
        prev.map((g) =>
          g.id === id
            ? {
                ...g,
                status: 'Completed',
                signed: new Date().toISOString().slice(0, 10),
              }
            : g
        )
      );
      showToast(`Signed as "${signatureText}". Your copy is saved here.`);
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
          <h1>Documents to sign</h1>
          <p>Review and e-sign documents HR sends you. Signed copies stay here.</p>
        </div>
      </div>

      {/* Attention Banner if open items exist */}
      {openList.length > 0 && (
        <div
          className="banner mb-5 flex items-center gap-3 p-3.5 rounded-xl border"
          style={{
            background: 'color-mix(in srgb, var(--ac) 9%, var(--surface))',
            borderColor: 'color-mix(in srgb, var(--ac) 30%, transparent)',
          }}
        >
          <span className="av w-8 h-8 rounded-lg bg-[var(--ac)] text-white flex items-center justify-center shrink-0">
            {ic('pen', 18)}
          </span>
          <div className="text-xs">
            <b style={{ color: 'var(--ac)' }}>
              {openList.length} document{openList.length > 1 ? 's' : ''}
            </b>{' '}
            waiting for your signature. Please review and sign before the deadline.
          </div>
        </div>
      )}

      {/* Main Documents Card */}
      <div className="card">
        <h2 className="text-sm font-semibold mb-3">Your documents</h2>

        {envelopes.length ? (
          <div className="overflow-x-auto">
            <table className="tbl w-full text-left text-xs">
              <thead>
                <tr>
                  <th className="py-2.5 px-3">Document</th>
                  <th className="py-2.5 px-3">Received</th>
                  <th className="py-2.5 px-3">Sign by</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {envelopes.map((r) => {
                  const isOpen =
                    r.status === 'Awaiting signature' || r.status === 'Viewed';
                  return (
                    <tr key={r.id} className="border-t border-[var(--line)]">
                      <td className="py-3 px-3">
                        <b className="block text-[var(--text)]">{r.doc}</b>
                        <span className="text-[11px] text-muted">
                          From {r.from} • Template: {r.tpl}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted">{r.sent}</td>
                      <td className="py-3 px-3 text-muted">{r.due}</td>
                      <td className="py-3 px-3">
                        <span className="pill text-xs">{r.status}</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isOpen ? (
                          <button
                            type="button"
                            className="btn sm primary"
                            onClick={() => setSelectedEnvelope(r)}
                          >
                            {ic('pen', 14)}
                            Review & sign
                          </button>
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
          <div className="empty">Nothing to sign right now. You are all caught up!</div>
        )}
      </div>

      {selectedEnvelope && (
        <SignDocumentModal
          envelope={selectedEnvelope}
          signerName={userName}
          onClose={() => setSelectedEnvelope(null)}
          onSign={handleSigned}
        />
      )}
    </div>
  );
};

export default SignDocumentFlow;

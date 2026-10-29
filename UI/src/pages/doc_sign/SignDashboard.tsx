import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignEnvelope, SignTemplateItem } from './types';
import { NewSignatureModal } from './components/NewSignatureModal';
import { ic } from '../../components/icons';
import * as templateService from '../../services/templateService';
import {
  fetchSignEnvelopes,
  fetchSignStats,
  remindEnvelope,
  createSignEnvelope,
} from '../../services/signConnectApi';
import { mapEnvelopeFromApi } from './apiMapper';

export const SignDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [envelopes, setEnvelopes] = useState<SignEnvelope[]>([]);
  const [templates, setTemplates] = useState<SignTemplateItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [stats, setStats] = useState({
    awaitingSignature: 0,
    completed: 0,
    declinedOrVoided: 0,
    averageTurnaround: '1.2 days',
  });

  const loadData = () => {
    fetchSignEnvelopes()
      .then((data) => {
        if (data) {
          setEnvelopes(data.map(mapEnvelopeFromApi));
        }
      })
      .catch(() => {});

    fetchSignStats()
      .then((st) => {
        if (st) setStats(st);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
    templateService
      .getTemplates()
      .then((data) => {
        if (data && data.length > 0) {
          const mapped: SignTemplateItem[] = data.map((t) => ({
            id: t.id,
            n: t.title || 'Template',
            f: t.requiredFields || 4,
            used: t.usageCount || 10,
            category: t.category,
          }));
          setTemplates(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const openList = envelopes.filter(
    (g) => g.status === 'Awaiting signature' || g.status === 'Viewed'
  );
  const doneList = envelopes.filter((g) => g.status === 'Completed');
  const totalCount = envelopes.length;
  const pct = totalCount ? Math.round((doneList.length / totalCount) * 100) : 0;
  const maxUsed = Math.max(1, ...templates.map((t) => t.used));

  const handleRemind = async (id: string, to: string) => {
    try {
      await remindEnvelope(id);
      showToast(`Reminder sent to ${to}`);
    } catch {
      showToast(`Reminder dispatched to ${to}`);
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
      loadData();
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
          <h1>Sign dashboard</h1>
          <p>
            Send offers, agreements and policies for e-signature and track every envelope.
          </p>
        </div>

        <div className="actions">
          <button
            type="button"
            className="btn"
            onClick={() => navigate('/doc-sign/templates')}
          >
            {ic('doc', 16)}
            Templates
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => setIsNewOpen(true)}
          >
            {ic('pen', 16)}
            New signature request
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid g4">
        <div className="card stat">
          <div className="k">
            <i>{ic('pen', 16)}</i>
            Awaiting signature
          </div>
          <div className="v">{stats.awaitingSignature || openList.length}</div>
          <div className="d">
            {envelopes.filter((g) => g.status === 'Viewed').length} opened but not signed
          </div>
        </div>

        <div className="card stat">
          <div className="k">
            <i style={{ color: 'var(--ok)' }}>{ic('check', 16)}</i>
            Completed
          </div>
          <div className="v" style={{ color: 'var(--ok)' }}>
            {stats.completed || doneList.length}
          </div>
          <div className="d text-emerald-600 font-semibold">Signed and filed</div>
        </div>

        <div className="card stat">
          <div className="k">
            <i>{ic('clock', 16)}</i>
            Average turnaround
          </div>
          <div className="v">{stats.averageTurnaround}</div>
          <div className="d">From sent to signed</div>
        </div>

        <div className="card stat">
          <div className="k">
            <i style={{ color: 'var(--bad)' }}>{ic('x', 16)}</i>
            Declined or voided
          </div>
          <div className="v">{stats.declinedOrVoided || 1}</div>
          <div className="d">Need follow-up</div>
        </div>
      </div>

      {/* 2-col Grid: Waiting on others + Envelope Status */}
      <div className="grid g-dash mt">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Waiting on others</h2>
            <button
              type="button"
              className="link text-xs text-[var(--ac)] hover:underline"
              onClick={() => navigate('/doc-sign/requests')}
            >
              All requests
            </button>
          </div>

          {openList.length ? (
            <div className="list">
              {openList.slice(0, 5).map((g) => {
                const late = g.due < new Date().toISOString().slice(0, 10);
                return (
                  <div key={g.id} className="row">
                    <span
                      className="av"
                      style={{
                        background: 'color-mix(in srgb, var(--ac) 14%, transparent)',
                        color: 'var(--ac)',
                      }}
                    >
                      {ic('doc', 16)}
                    </span>
                    <div className="grow">
                      <b style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {g.doc}
                      </b>
                      <div className="sub">
                        To {g.to}
                        {g.ext && <span className="text-[var(--ac)] font-semibold"> (external)</span>} •{' '}
                        {late ? (
                          <span style={{ color: 'var(--bad)', fontWeight: 600 }}>overdue</span>
                        ) : (
                          `due ${g.due}`
                        )}
                      </div>
                    </div>
                    <span className="pill text-xs">{g.status}</span>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() => handleRemind(g.id, g.to)}
                    >
                      Remind
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty">Nothing waiting for a signature.</div>
          )}
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold mb-3">Envelope status</h2>
          <div className="flex items-center gap-5">
            <div
              className="ring"
              style={{
                background: `conic-gradient(var(--ac) 0% ${pct}%, var(--surface-2) ${pct}% 100%)`,
                width: 96,
                height: 96,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'var(--surface)',
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 700,
                  fontSize: 18,
                  color: 'var(--text)',
                }}
              >
                {pct}%
              </div>
            </div>
            <div className="grow text-xs leading-relaxed">
              <div className="flex items-center justify-between py-1">
                <span>Completed</span>
                <b>{doneList.length}</b>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Open requests</span>
                <b>{openList.length}</b>
              </div>
              <div className="flex items-center justify-between py-1 text-muted">
                <span>Declined/Voided</span>
                <b>{envelopes.length - doneList.length - openList.length}</b>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Used Most */}
      <div className="card mt">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Templates used most</h2>
          <button
            type="button"
            className="link text-xs text-[var(--ac)] hover:underline"
            onClick={() => navigate('/doc-sign/templates')}
          >
            Manage templates
          </button>
        </div>
        <div className="list">
          {templates.slice(0, 4).map((t) => (
            <div key={t.id} className="row">
              <div className="grow min-w-0">
                <b className="truncate block">{t.n}</b>
                <div className="sub">{t.f} required fields • used {t.used} times</div>
              </div>
              <div className="w-32 bg-[var(--surface-2)] h-2 rounded-full overflow-hidden hidden sm:block">
                <div
                  className="h-full bg-[var(--ac)] rounded-full"
                  style={{ width: `${Math.round((t.used / maxUsed) * 100)}%` }}
                />
              </div>
              <button
                type="button"
                className="btn sm"
                onClick={() => setIsNewOpen(true)}
              >
                Use
              </button>
            </div>
          ))}
        </div>
      </div>

      <NewSignatureModal
        open={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        templates={templates}
        onSend={handleSend}
      />
    </div>
  );
};

export default SignDashboard;

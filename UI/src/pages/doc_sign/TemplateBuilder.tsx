import React, { useState, useEffect } from 'react';
import { SignTemplateItem, SignEnvelope } from './types';
import * as templateService from '../../services/templateService';
import { NewSignatureModal } from './components/NewSignatureModal';
import { ic } from '../../components/icons';

export const TemplateBuilder: React.FC = () => {
  const [templates, setTemplates] = useState<SignTemplateItem[]>([]);

  useEffect(() => {
    templateService
      .getTemplates()
      .then((data) => {
        if (data && data.length > 0) {
          setTemplates(
            data.map((t) => ({
              id: t.id,
              n: t.title || 'Template',
              f: t.requiredFields || 4,
              used: t.usageCount || 0,
              category: t.category,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleUseTemplate = (tplName: string) => {
    setSelectedTemplate(tplName);
    setIsModalOpen(true);
  };

  const handleSend = (newEnv: Omit<SignEnvelope, 'id' | 'sent' | 'status'>) => {
    setTemplates((prev) =>
      prev.map((t) => (t.n === newEnv.tpl ? { ...t, used: t.used + 1 } : t))
    );
    showToast(`Envelope sent to ${newEnv.to} for signature`);
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

      {/* Header */}
      <div className="head band">
        <div>
          <span className="eyebrow">Sign</span>
          <h1>Templates</h1>
          <p>Reusable documents with signature and form fields already placed.</p>
        </div>

        <div className="actions">
          <button
            type="button"
            className="btn flex items-center gap-1.5"
            onClick={() => showToast('Template upload isn’t connected in this prototype')}
          >
            {ic('upload', 16)}
            Upload template
          </button>
        </div>
      </div>

      {/* Template Grid */}
      <div className="tplgrid grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {templates.map((t) => (
          <div key={t.n} className="card">
            {/* Visual template preview layout */}
            <div className="tplprev">
              <i />
              <i />
              <i style={{ width: '62%' }} />
              <i />
              <i style={{ width: '40%' }} />
              <em>
                {ic('pen', 13)}
                Sign here
              </em>
            </div>

            <b className="block text-base">{t.n}</b>
            <div className="muted" style={{ fontSize: '12.5px', marginTop: '2px' }}>
              {t.f} fields · used {t.used} times
            </div>

            <div style={{ marginTop: '14px' }}>
              <button
                type="button"
                className="btn sm primary flex items-center gap-1.5"
                onClick={() => handleUseTemplate(t.n)}
              >
                {ic('send', 14)}
                Use template
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Signature Modal */}
      <NewSignatureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSend={handleSend}
        defaultTemplate={selectedTemplate || undefined}
      />
    </div>
  );
};

export default TemplateBuilder;

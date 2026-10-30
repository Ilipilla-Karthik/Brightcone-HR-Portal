import React, { useState, useRef } from 'react';
import { SignTemplateItem, SignEnvelope } from './types';
import { NewSignatureModal } from './components/NewSignatureModal';
import { ic } from '../../components/icons';

const initialTemplates: SignTemplateItem[] = [
  { n: 'Employment contract (India)', f: 6, used: 14 },
  { n: 'Non-disclosure agreement (mutual)', f: 4, used: 22 },
  { n: 'IP assignment declaration', f: 3, used: 9 },
  { n: 'Director loan agreement', f: 5, used: 2 },
  { n: 'Consulting services agreement', f: 7, used: 11 },
  { n: 'Asset handover declaration', f: 4, used: 18 },
];

export const TemplateBuilder: React.FC = () => {
  const [templates, setTemplates] = useState<SignTemplateItem[]>(initialTemplates);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUseTemplate = (tplName: string) => {
    setSelectedTemplate(tplName);
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const templateName = file.name.replace(/\.[^/.]+$/, '');
      const newTpl: SignTemplateItem = {
        n: templateName,
        f: 4,
        used: 0,
      };
      setTemplates((prev) => [newTpl, ...prev]);
      showToast(`Uploaded template: ${file.name}`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx"
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="btn flex items-center gap-1.5"
            onClick={() => fileInputRef.current?.click()}
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

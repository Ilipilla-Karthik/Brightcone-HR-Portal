import { EnvelopeApiRecord } from '../../services/signConnectApi';
import { SignEnvelope, SignStatus } from './types';

export function mapEnvelopeFromApi(r: EnvelopeApiRecord): SignEnvelope {
  return {
    id: r.code,
    doc: r.document_name,
    tpl: r.template_id || 'Document',
    to: r.recipient_name,
    ext: r.is_external,
    from: r.sender_name || 'Ananya Rao',
    sent: r.sent_at,
    due: r.due_at,
    status: (r.status as SignStatus) || 'Awaiting signature',
    signed: r.completed_at ? r.completed_at.slice(0, 10) : undefined,
  };
}

export type SignStatus =
  | 'Awaiting signature'
  | 'Viewed'
  | 'Completed'
  | 'Declined'
  | 'Voided'
  | 'Expired';

export type EnvelopeStatus =
  | 'pending'
  | 'signed'
  | 'declined'
  | 'draft'
  | 'viewed'
  | 'Viewed'
  | 'Completed'
  | 'Awaiting signature';

export type DocumentCategory = 'Offers' | 'NDAs' | 'Policies' | 'Agreements';

export interface RecipientInfo {
  name: string;
  email: string;
  role: string;
  department: string;
  avatarColor?: string;
}

export interface SignEnvelope {
  id: string;
  doc: string;
  tpl: string;
  to: string;
  ext?: boolean;
  from: string;
  sent: string;
  due: string;
  status: SignStatus;
  signed?: string;
  fileSize?: string;
  pagesCount?: number;
  description?: string;
}

export interface SignatureRequest {
  id: string;
  envelopeNumber?: string;
  title?: string;
  doc?: string;
  category?: DocumentCategory;
  recipient?: RecipientInfo | any;
  sender?: string;
  from?: string;
  sentDate?: string;
  sent?: string;
  dueDate?: string;
  due?: string;
  status: any;
  signedAt?: string;
  signed?: string;
  fileSize?: string;
  pagesCount?: number;
  description?: string;
  isExternal?: boolean;
  ext?: boolean;
  to?: string;
  tpl?: string;
  signatureText?: string;
}

export interface SignTemplateItem {
  id?: string;
  n: string;
  title?: string;
  f: number;
  requiredFields?: number;
  used: number;
  usageCount?: number;
  desc?: string;
  description?: string;
  category?: DocumentCategory;
  status?: string;
  bodyTemplate?: string;
}

export interface SignatureTemplate {
  id: string;
  title: string;
  n?: string;
  category: DocumentCategory;
  description: string;
  requiredFields: number;
  f?: number;
  lastUpdated?: string;
  usageCount: number;
  used?: number;
  status: 'active' | 'archived';
  bodyTemplate: string;
}

export interface HandbookRecord {
  id: string;
  ver: string;
  version: string;
  eff: string;
  effectiveDate: string;
  title: string;
  owner: string;
  file: string;
  changes: string;
  changesSummary: string;
  status: 'Draft' | 'Under review' | 'Published' | 'Archived';
}

export interface PolicyRecord {
  id: string;
  name: string;
  cat?: string;
  category: string;
  ver?: string;
  version: string;
  eff?: string;
  effectiveDate: string;
  review?: string;
  nextReviewDate: string;
  owner: string;
  file: string;
  ackReq?: boolean;
  ackRequired: boolean;
  status: 'Draft' | 'Under review' | 'Published';
  ack?: string[];
}

export interface PolicyAckRecord {
  id: string;
  policy?: string;
  policyId: string;
  policyName: string;
  emp?: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  sent?: string;
  sentDate: string;
  due?: string;
  dueDate: string;
  ackOn?: string;
  acknowledgedOn?: string;
  status: 'Pending' | 'Acknowledged' | 'Overdue';
}

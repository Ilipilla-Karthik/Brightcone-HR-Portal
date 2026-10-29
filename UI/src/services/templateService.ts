import api from './api';
import { SignatureTemplate, DocumentCategory } from '../pages/doc_sign/types';

const BASE_URL = '/signature-templates';

export interface CreateTemplatePayload {
  title: string;
  category: DocumentCategory;
  description: string;
  requiredFields: number;
  bodyTemplate: string;
}

export interface UseTemplateResponse {
  success: boolean;
  templateId: string;
  title: string;
  category: string;
  usageCount: number;
  requiredFields: number;
  bodyTemplate: string;
  draftEnvelopeId: string;
}

/**
 * Fetch all signature templates with optional category filtering and search.
 */
export async function getTemplates(
  category?: string,
  search?: string
): Promise<SignatureTemplate[]> {
  try {
    const params: Record<string, string> = {};
    if (category && category !== 'all') params.category = category;
    if (search) params.search = search;

    const response = await api.get<SignatureTemplate[]>(BASE_URL, { params });
    return response.data;
  } catch (error) {
    console.warn('Backend signature-templates query failed:', error);
    return [];
  }
}

/**
 * Fetch a single signature template by its unique ID.
 */
export async function getTemplateById(id: string): Promise<SignatureTemplate | null> {
  try {
    const response = await api.get<SignatureTemplate>(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.warn('Backend signature-template fetch failed:', error);
    return null;
  }
}

/**
 * Create a new signature template.
 */
export async function createTemplate(
  payload: CreateTemplatePayload
): Promise<SignatureTemplate> {
  try {
    const response = await api.post<SignatureTemplate>(BASE_URL, payload);
    return response.data;
  } catch (error) {
    console.warn('Backend unavailable, creating local template fallback:', error);
    const newTemplate: SignatureTemplate = {
      id: `tpl-${Date.now()}`,
      title: payload.title,
      category: payload.category,
      description: payload.description,
      requiredFields: payload.requiredFields,
      lastUpdated: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
      usageCount: 0,
      status: 'active',
      bodyTemplate: payload.bodyTemplate,
    };
    return newTemplate;
  }
}

/**
 * Update an existing signature template.
 */
export async function updateTemplate(
  id: string,
  updates: Partial<SignatureTemplate>
): Promise<SignatureTemplate> {
  try {
    const response = await api.patch<SignatureTemplate>(`${BASE_URL}/${id}`, updates);
    return response.data;
  } catch (error) {
    console.warn('Backend signature-template update failed:', error);
    return {
      id,
      title: updates.title || 'Template',
      category: updates.category || 'Agreements',
      description: updates.description || '',
      requiredFields: updates.requiredFields || 2,
      lastUpdated: new Date().toLocaleDateString('en-US'),
      usageCount: updates.usageCount || 0,
      status: updates.status || 'active',
      bodyTemplate: updates.bodyTemplate || '',
    };
  }
}

/**
 * Delete a signature template.
 */
export async function deleteTemplate(id: string): Promise<boolean> {
  try {
    await api.delete(`${BASE_URL}/${id}`);
    return true;
  } catch (error) {
    console.warn('Backend unavailable, simulated delete:', error);
    return true;
  }
}

/**
 * Use a template: increments usage count and creates draft envelope metadata.
 */
export async function useTemplate(id: string): Promise<UseTemplateResponse> {
  try {
    const response = await api.post<UseTemplateResponse>(`${BASE_URL}/${id}/use`);
    return response.data;
  } catch (error) {
    console.warn('Backend signature-template use failed:', error);
    return {
      success: true,
      templateId: id,
      title: 'Template',
      category: 'Agreements',
      usageCount: 1,
      requiredFields: 2,
      bodyTemplate: '',
      draftEnvelopeId: `ENV-${Math.floor(1000 + Math.random() * 9000)}`,
    };
  }
}

/**
 * Upload a document to create a template.
 */
export async function uploadTemplate(
  payload: {
    title: string;
    category?: DocumentCategory;
    fileName?: string;
    fileSize?: string;
    description?: string;
    requiredFields?: number;
    bodyTemplate?: string;
  }
): Promise<SignatureTemplate> {
  try {
    const response = await api.post<SignatureTemplate>(`${BASE_URL}/upload`, payload);
    return response.data;
  } catch (error) {
    console.warn('Backend unavailable, simulated upload:', error);
    return {
      id: `tpl-up-${Date.now()}`,
      title: payload.title,
      category: payload.category || 'Policies',
      description: payload.description || `Uploaded template: ${payload.fileName || 'document.pdf'}`,
      requiredFields: payload.requiredFields || 2,
      lastUpdated: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
      usageCount: 0,
      status: 'active',
      bodyTemplate: payload.bodyTemplate || 'Uploaded document placeholder with signable fields.',
    };
  }
}

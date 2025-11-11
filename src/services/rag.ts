import { env } from '../config/env';

const isDev = (import.meta as any)?.env?.DEV;
const DEFAULT_AGENTE3_API = 'http://localhost:3004/api';
const resolveAgente3Api = () => env.agente3Api || DEFAULT_AGENTE3_API;

async function fetchAgente3(path: string, options?: RequestInit): Promise<Response> {
  const base = isDev ? DEFAULT_AGENTE3_API : resolveAgente3Api();
  return await fetch(`${base}${path}`, options);
}

export type RagSimpleResponse = {
  success: boolean;
  answer?: string;
  sources?: Array<{ id: string; title?: string; score?: number; url?: string; type?: string }>;
  error?: string;
};

export async function ragSimple(query: string): Promise<RagSimpleResponse> {
  try {
    const res = await fetchAgente3('/rag/simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data?.error || 'Falha na consulta RAG simples.' };
    return data as RagSimpleResponse;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
  }
}

export type RagEmbeddingsResponse = {
  success: boolean;
  results?: Array<{ id: string; text: string; score: number; metadata?: Record<string, unknown> }>;
  error?: string;
};

export type RagSourceDetailsResponse = {
  success: boolean;
  details?: Record<string, unknown> | null;
  error?: string;
};

export async function ragSourceDetails(type: string, id: string | number): Promise<RagSourceDetailsResponse> {
  try {
    const res = await fetchAgente3(`/rag/source/${encodeURIComponent(type)}/${encodeURIComponent(String(id))}`);
    const data = await res.json();
    if (!res.ok) return { success: false, error: data?.error || 'Falha ao obter detalhes da fonte.' };
    return data as RagSourceDetailsResponse;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
  }
}

export async function ragEmbeddingsSearch(query: string): Promise<RagEmbeddingsResponse> {
  try {
    const res = await fetchAgente3('/rag/embeddings/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data?.error || 'Falha na busca por embeddings.' };
    return data as RagEmbeddingsResponse;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
  }
}
import { env } from '../config/env';

export type RagSimpleResponse = {
  success: boolean;
  answer?: string;
  sources?: Array<{ id: string; title?: string; score?: number; url?: string }>;
  error?: string;
};

export async function ragSimple(query: string): Promise<RagSimpleResponse> {
  if (!env.agente3Api) {
    return { success: false, error: 'Agente3 não configurado (VITE_AGENTE3_URL ausente).' };
  }
  try {
    const res = await fetch(`${env.agente3Api}/rag/simple`, {
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

export async function ragEmbeddingsSearch(query: string): Promise<RagEmbeddingsResponse> {
  if (!env.agente3Api) {
    return { success: false, error: 'Agente3 não configurado (VITE_AGENTE3_URL ausente).' };
  }
  try {
    const res = await fetch(`${env.agente3Api}/rag/embeddings/search`, {
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
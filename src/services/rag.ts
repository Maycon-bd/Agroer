import { env } from '../config/env';

const isDev = (import.meta as any)?.env?.DEV;
const DEFAULT_AGENTE3_API = 'http://localhost:3004/api';
const resolveAgente3Api = () => env.agente3Api || DEFAULT_AGENTE3_API;
const originBase = typeof window !== 'undefined' ? `${window.location.origin}/api` : DEFAULT_AGENTE3_API;

async function fetchAgente3WithFallback(path: string, options?: RequestInit): Promise<{ res: Response; data: any }> {
  const base = isDev ? DEFAULT_AGENTE3_API : resolveAgente3Api();
  try {
    const res = await fetch(`${base}${path}`, options);
    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await res.json() : await res.text();
    // normaliza para objeto
    return { res, data: typeof data === 'string' ? { success: false, error: data } : data };
  } catch (err) {
    // Em preview/prod não há proxy em `${origin}/api`. Evitar fallback para index.html.
    if (!isDev) throw err instanceof Error ? err : new Error('Falha ao conectar ao Agente3');
    const res = await fetch(`${originBase}${path}`, options);
    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await res.json() : await res.text();
    return { res, data: typeof data === 'string' ? { success: false, error: data } : data };
  }
}

export type RagSimpleResponse = {
  success: boolean;
  answer?: string;
  sources?: Array<{ id: string; title?: string; score?: number; url?: string; type?: string }>;
  error?: string;
};

export async function ragSimple(query: string): Promise<RagSimpleResponse> {
  try {
    const { res, data } = await fetchAgente3WithFallback('/rag/simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
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
    const { res, data } = await fetchAgente3WithFallback(`/rag/source/${encodeURIComponent(type)}/${encodeURIComponent(String(id))}`);
    if (!res.ok) return { success: false, error: data?.error || 'Falha ao obter detalhes da fonte.' };
    return data as RagSourceDetailsResponse;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
  }
}

export async function ragEmbeddingsSearch(query: string): Promise<RagEmbeddingsResponse> {
  try {
    const { res, data } = await fetchAgente3WithFallback('/rag/embeddings/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) return { success: false, error: data?.error || 'Falha na busca por embeddings.' };
    return data as RagEmbeddingsResponse;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
  }
}

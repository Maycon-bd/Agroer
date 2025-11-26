import { env } from '../config/env';

const isDev = (import.meta as any)?.env?.DEV;
const DEFAULT_AGENTE3_API = 'http://localhost:3004/api';
const resolveBase = () => (isDev ? DEFAULT_AGENTE3_API : (env.agente3Api || DEFAULT_AGENTE3_API));

async function api(path: string, init?: RequestInit) {
  const base = resolveBase();
  let lastErr: any = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${base}${path}`, { ...(init || {}), signal: controller.signal });
      clearTimeout(timeout);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Falha na requisição');
      return data;
    } catch (e: any) {
      lastErr = e;
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw new Error(lastErr?.message || 'Falha na requisição');
}

export async function pessoasSearch(q: string, tipo?: string) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (tipo) params.set('tipo', tipo);
  return await api(`/admin/pessoas/search?${params.toString()}`);
}

export async function pessoasAll() {
  return await api('/admin/pessoas/all');
}

export async function pessoasCreate(body: Record<string, unknown>) {
  return await api('/admin/pessoas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

export async function pessoasUpdate(id: number, body: Record<string, unknown>) {
  return await api(`/admin/pessoas/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

export async function pessoasInactivate(id: number) {
  return await api(`/admin/pessoas/${id}/inactivate`, { method: 'POST' });
}

export async function classificacaoSearch(q: string, tipo?: string) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (tipo) params.set('tipo', tipo);
  return await api(`/admin/classificacao/search?${params.toString()}`);
}

export async function classificacaoAll(tipo?: string) {
  const params = new URLSearchParams();
  if (tipo) params.set('tipo', tipo);
  return await api(`/admin/classificacao/all?${params.toString()}`);
}

export async function classificacaoCreate(body: Record<string, unknown>) {
  return await api('/admin/classificacao', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

export async function classificacaoUpdate(id: number, body: Record<string, unknown>) {
  return await api(`/admin/classificacao/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

export async function classificacaoInactivate(id: number) {
  return await api(`/admin/classificacao/${id}/inactivate`, { method: 'POST' });
}

export async function movimentosSearch(q: string) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  return await api(`/admin/movimentos/search?${params.toString()}`);
}

export async function movimentosCreate(body: Record<string, unknown>) {
  return await api('/admin/movimentos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

export async function movimentosAddParcelas(id: number, parcelas: Array<{ numero_parcela: number; data_vencimento: string; valor_parcela: number }>) {
  return await api(`/admin/movimentos/${id}/parcelas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ parcelas }) });
}

export async function movimentosAddClassificacoes(id: number, classificacoes: Array<{ classificacao_id: number; valor_classificacao: number; percentual?: number; justificativa?: string }>) {
  return await api(`/admin/movimentos/${id}/classificacoes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ classificacoes }) });
}

export async function movimentosUpdate(id: number, body: Record<string, unknown>) {
  return await api(`/admin/movimentos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

export async function movimentosInactivate(id: number) {
  return await api(`/admin/movimentos/${id}/inactivate`, { method: 'POST' });
}

export async function unifiedSearch(q: string, page: number = 1) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  params.set('page', String(page));
  params.set('pageSize', '25');
  return await api(`/admin/unified/search?${params.toString()}`);
}

export async function unifiedAll(page: number = 1) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', '25');
  return await api(`/admin/unified/all?${params.toString()}`);
}

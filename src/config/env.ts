export type EnvConfig = {
  agente1Api: string;
  agente2Api: string;
  agente3Api: string | null;
};

const normalize = (value?: string | null) => (value && value.trim() ? value.trim() : null);

const origin = typeof window !== 'undefined' ? window.location.origin : null;
const isDev = (import.meta as any)?.env?.DEV;

// Em modo dev, usamos mesma origem (proxy do Vite) para evitar bloqueio de porta
const defaultAgente1Base = isDev && origin ? origin : 'http://localhost:3001';
const defaultAgente2Base = isDev && origin ? origin : 'http://localhost:3002';
const defaultAgente3Base = isDev ? 'http://localhost:3004' : null;

export const env: EnvConfig = {
  agente1Api: `${normalize((import.meta as any)?.env?.VITE_AGENTE1_URL) || defaultAgente1Base}/api`,
  agente2Api: `${normalize((import.meta as any)?.env?.VITE_AGENTE2_URL) || defaultAgente2Base}/api`,
  agente3Api: (normalize((import.meta as any)?.env?.VITE_AGENTE3_URL) || defaultAgente3Base)
    ? `${normalize((import.meta as any)?.env?.VITE_AGENTE3_URL) || defaultAgente3Base}/api`
    : null,
};

export const hasAgente3 = !!env.agente3Api;
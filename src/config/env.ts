export type EnvConfig = {
  agente1Api: string;
  agente2Api: string;
  agente3Api: string | null;
};

const normalize = (value?: string | null) => (value && value.trim() ? value.trim() : null);

export const env: EnvConfig = {
  agente1Api: `${normalize((import.meta as any)?.env?.VITE_AGENTE1_URL) || 'http://localhost:3001'}/api`,
  agente2Api: `${normalize((import.meta as any)?.env?.VITE_AGENTE2_URL) || 'http://localhost:3002'}/api`,
  agente3Api: normalize((import.meta as any)?.env?.VITE_AGENTE3_URL)
    ? `${(import.meta as any).env.VITE_AGENTE3_URL}/api`
    : null,
};

export const hasAgente3 = !!env.agente3Api;
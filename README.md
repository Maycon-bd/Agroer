# AGROER - Analisador de Notas Fiscais

Sistema web para upload e análise de notas fiscais em PDF, com integração de IA (Gemini) e preparado para consultas RAG via Agente3.

## Funcionalidades
- Upload de arquivos PDF de notas fiscais
- Extração automática de dados usando IA Gemini
- Visualização dos dados extraídos em formato JSON e layout responsivo
- Validação e criação de movimentos (Agente2)
- Pesquisa com barra dedicada pronta para RAG (Agente3)

## Tecnologias
- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, Express
- **IA**: Google Gemini API

## Instalação (Frontend)
```bash
npm install
npm run dev
```
Acesse `http://localhost:5173/`.

## Variáveis de Ambiente do Frontend
- `VITE_AGENTE1_URL` (ex.: `http://localhost:3001`)
- `VITE_AGENTE2_URL` (ex.: `http://localhost:3002`)
- `VITE_AGENTE3_URL` (ex.: `http://localhost:3003`) — habilita a pesquisa RAG

Se `VITE_AGENTE3_URL` não estiver definido, o frontend mantém a barra de pesquisa, mas alerta que o Agente3 não está configurado.

## Agente3 (RAG)
O frontend já possui:
- `src/config/env.ts`: leitura centralizada das variáveis `VITE_*`
- `src/services/rag.ts`: métodos `ragSimple(query)` e `ragEmbeddingsSearch(query)`
- Integração na `App.tsx`: barra de pesquisa chama o serviço e exibe alertas/resultados

Endpoints esperados (exemplo):
- `POST /api/rag/simple` { query }
- `POST /api/rag/embeddings/search` { query }

## Docker
O projeto possui `docker-compose.yml` para frontend, Agente1 e Agente2. Para incluir o Agente3, adicione um serviço `agente3` expondo a porta (ex.: `3003`) e injete `VITE_AGENTE3_URL` no serviço `frontend`.

## Uso
1. Faça upload de um PDF
2. Extraia dados
3. Use a barra de pesquisa para testar a integração RAG
4. Valide e crie movimentos quando disponível

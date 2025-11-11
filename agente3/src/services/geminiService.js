import { GoogleGenerativeAI } from '@google/generative-ai';

function assertApiKey() {
  const key = process.env.GOOGLE_GEMINI_API_KEY;
  if (!key || key === 'your_gemini_api_key_here' || key === 'coloque_sua_chave_aqui') {
    throw new Error('GOOGLE_GEMINI_API_KEY não configurada para Agente3');
  }
  return key;
}

export function getTextModel() {
  const genAI = new GoogleGenerativeAI(assertApiKey());
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      maxOutputTokens: 160,
      temperature: 0.3,
      topK: 40,
      topP: 0.9,
    },
  });
}

export function getEmbeddingModel() {
  const genAI = new GoogleGenerativeAI(assertApiKey());
  // O SDK usa getGenerativeModel também para embeddings; o modelo expõe embedContent
  return genAI.getGenerativeModel({ model: 'text-embedding-004' });
}
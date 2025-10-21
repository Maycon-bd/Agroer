import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function testGemini20Flash() {
  try {
    console.log('🔑 Testando modelo gemini-2.0-flash...');
    console.log('🔧 Chave configurada:', process.env.GOOGLE_GEMINI_API_KEY ? 'SIM' : 'NÃO');
    
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error('Chave da API não configurada');
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    console.log('🤖 Fazendo teste simples com gemini-2.0-flash...');
    
    const result = await model.generateContent('Diga apenas "Olá, gemini-2.0-flash funcionando!"');
    const response = result.response.text();
    
    console.log('✅ Teste bem-sucedido!');
    console.log('📝 Resposta:', response);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.error('❌ Detalhes:', {
      message: error.message,
      stack: error.stack
    });
  }
}

testGemini20Flash();
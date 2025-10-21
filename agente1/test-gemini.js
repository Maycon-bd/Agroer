import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function testGeminiAPI() {
  try {
    console.log('🔑 Testando chave da API do Gemini...');
    console.log('🔧 Chave configurada:', process.env.GOOGLE_GEMINI_API_KEY ? 'SIM' : 'NÃO');
    console.log('🔧 Valor da chave:', process.env.GOOGLE_GEMINI_API_KEY?.substring(0, 10) + '...');
    
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error('Chave da API não configurada');
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    console.log('🤖 Fazendo teste simples com Gemini...');
    
    const result = await model.generateContent('Diga apenas "Olá, teste funcionando!"');
    const response = result.response.text();
    
    console.log('✅ Teste bem-sucedido!');
    console.log('📝 Resposta:', response);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.error('❌ Detalhes:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
  }
}

testGeminiAPI();
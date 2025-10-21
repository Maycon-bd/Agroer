import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';

// Carregar variáveis de ambiente
dotenv.config();

async function testGeminiWithPDF() {
  try {
    console.log('🔑 Testando gemini-2.0-flash com PDF...');
    console.log('🔧 Chave configurada:', process.env.GOOGLE_GEMINI_API_KEY ? 'SIM' : 'NÃO');
    
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error('Chave da API não configurada');
    }
    
    // Carregar o PDF de teste
    const pdfBuffer = fs.readFileSync('./nota-fiscal-teste.pdf');
    const base64Data = pdfBuffer.toString('base64');
    
    console.log('📄 PDF carregado, tamanho:', pdfBuffer.length, 'bytes');
    console.log('🔄 Base64 gerado, tamanho:', base64Data.length, 'caracteres');
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    console.log('🤖 Enviando PDF para gemini-2.0-flash...');
    
    const result = await model.generateContent([
      {
        text: "Extraia todo o texto desta nota fiscal em português. Mantenha a formatação e estrutura original do documento."
      },
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64Data
        }
      }
    ]);
    
    const response = result.response.text();
    
    console.log('✅ Teste bem-sucedido!');
    console.log('📝 Resposta (primeiros 200 caracteres):', response.substring(0, 200) + '...');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.error('❌ Detalhes:', {
      message: error.message,
      stack: error.stack?.substring(0, 500)
    });
  }
}

testGeminiWithPDF();
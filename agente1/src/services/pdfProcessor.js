import { GoogleGenerativeAI } from '@google/generative-ai';
import { createInvoicePrompt } from './promptService.js';
import { validateExtractedData } from './validationService.js';
import fs from 'fs';
import path from 'path';

// Função para inicializar Gemini AI (lazy loading)
function getGeminiModel() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

/**
 * Extrai texto do PDF usando Gemini Vision
 * @param {Buffer} pdfBuffer - Buffer do arquivo PDF
 * @returns {Promise<string>} - Texto extraído do PDF
 */
export async function extractTextFromPDF(pdfBuffer) {
  try {
    console.log('📖 Extraindo texto do PDF usando Gemini Vision...');
    console.log('📄 Tamanho do PDF:', pdfBuffer.length, 'bytes');
    
    if (!process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY === 'your_gemini_api_key_here') {
      throw new Error('Chave da API do Gemini não configurada. Configure GOOGLE_GEMINI_API_KEY no arquivo .env');
    }
    
    // Converter PDF para base64 para enviar ao Gemini
    const base64Data = pdfBuffer.toString('base64');
    
    // Usar Gemini Vision para extrair texto do PDF
    const visionModel = getGeminiModel();
    console.log('🤖 Enviando PDF para o Gemini...');
    
    let extractedText;
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        console.log(`🤖 Tentativa ${retryCount + 1}/${maxRetries + 1} - Enviando PDF para o Gemini...`);
        
        const result = await visionModel.generateContent([
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
        
        extractedText = result.response.text();
        console.log('✅ Texto extraído com sucesso, tamanho:', extractedText.length, 'caracteres');
        break; // Sucesso, sair do loop
        
      } catch (geminiError) {
        console.error(`❌ Erro do Gemini (tentativa ${retryCount + 1}):`, geminiError.message);
        
        // Verificar se é erro de sobrecarga (503) ou quota (429)
        const isRetryableError = geminiError.status === 503 || 
                                geminiError.status === 429 || 
                                geminiError.message.includes('overloaded') ||
                                geminiError.message.includes('quota');
        
        if (isRetryableError && retryCount < maxRetries) {
          const waitTime = Math.pow(2, retryCount) * 1000; // Backoff exponencial: 1s, 2s, 4s
          console.log(`⏳ Aguardando ${waitTime/1000}s antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retryCount++;
        } else {
          // Não é erro recuperável ou esgotaram as tentativas
          throw geminiError;
        }
      }
    }
    
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('Não foi possível extrair texto do PDF. O arquivo pode estar corrompido ou ser uma imagem.');
    }
    
    console.log(`📝 Texto extraído: ${extractedText.length} caracteres`);
    return extractedText;
    
  } catch (error) {
    console.error('❌ Erro ao extrair texto do PDF:', error);
    throw new Error(`Erro na extração de texto: ${error.message}`);
  }
}

/**
 * Processa texto com Gemini AI para extrair dados estruturados
 * @param {string} pdfText - Texto extraído do PDF
 * @returns {Promise<Object>} - Dados estruturados da nota fiscal
 */
export async function processWithGemini(pdfText) {
  try {
    console.log('🤖 Processando com Gemini AI...');
    
    if (!process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY === 'your_gemini_api_key_here') {
      throw new Error('Chave da API do Gemini não configurada. Configure GOOGLE_GEMINI_API_KEY no arquivo .env');
    }
    
    const prompt = createInvoicePrompt(pdfText);
    const model = getGeminiModel();
    
    const maxRetries = 3;
    let retryCount = 0;
    let text;
    
    while (retryCount <= maxRetries) {
      try {
        console.log(`🔄 Tentativa ${retryCount + 1}/${maxRetries + 1} - Enviando prompt para o Gemini...`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
        console.log('✅ Resposta do Gemini recebida, tamanho:', text.length, 'caracteres');
        break; // Sucesso, sair do loop
        
      } catch (geminiError) {
        console.error(`❌ Erro do Gemini no processamento (tentativa ${retryCount + 1}):`, geminiError.message);
        
        // Verificar se é erro de sobrecarga (503) ou quota (429)
        const isRetryableError = geminiError.status === 503 || 
                                geminiError.status === 429 || 
                                geminiError.message.includes('overloaded') ||
                                geminiError.message.includes('quota');
        
        if (isRetryableError && retryCount < maxRetries) {
          const waitTime = Math.pow(2, retryCount) * 1000; // Backoff exponencial: 1s, 2s, 4s
          console.log(`⏳ Aguardando ${waitTime/1000}s antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retryCount++;
        } else {
          // Não é erro recuperável ou esgotaram as tentativas
          throw geminiError;
        }
      }
    }
    
    // Tentar extrair JSON da resposta
    let extractedData;
    try {
      // Procurar por JSON na resposta (pode vir com texto adicional)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        extractedData = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError);
      console.log('📄 Resposta do Gemini:', text);
      throw new Error('Resposta do Gemini não está em formato JSON válido');
    }
    
    console.log('✅ Dados estruturados extraídos com sucesso');
    return extractedData;
    
  } catch (error) {
    console.error('❌ Erro no processamento com Gemini:', error);
    throw new Error(`Erro no processamento IA: ${error.message}`);
  }
}

/**
 * Função principal para extrair dados de nota fiscal
 * @param {Buffer} pdfBuffer - Buffer do arquivo PDF
 * @returns {Promise<Object>} - Dados estruturados e validados da nota fiscal
 */
export async function extractInvoiceData(pdfBuffer) {
  try {
    console.log('🚀 Iniciando extração de dados da nota fiscal...');
    
    // 1. Extrair texto do PDF
    const pdfText = await extractTextFromPDF(pdfBuffer);
    
    // 2. Processar com Gemini AI
    const rawData = await processWithGemini(pdfText);
    
    // 3. Validar e estruturar dados
    const validatedData = validateExtractedData(rawData);
    
    console.log('🎉 Extração concluída com sucesso!');
    
    return {
      ...validatedData,
      metadata: {
        extractedAt: new Date().toISOString(),
        textLength: pdfText.length,
        processingVersion: '1.0.0'
      }
    };
    
  } catch (error) {
    console.error('❌ Erro na extração de dados:', error);
    throw error;
  }
}
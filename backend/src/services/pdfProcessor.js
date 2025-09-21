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
    try {
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
    } catch (geminiError) {
      console.error('❌ Erro do Gemini:', geminiError.message);
      throw geminiError;
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
    console.log('🔄 Enviando prompt para o Gemini...');
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('✅ Resposta do Gemini recebida, tamanho:', text.length, 'caracteres');
    
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
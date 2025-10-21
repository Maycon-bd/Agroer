import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function testPDFUpload() {
  try {
    console.log('📤 Testando upload de PDF...');
    
    // Ler o PDF de teste
    const pdfBuffer = fs.readFileSync('nota-fiscal-teste.pdf');
    console.log('📄 PDF carregado, tamanho:', pdfBuffer.length, 'bytes');
    
    // Criar FormData
    const formData = new FormData();
    formData.append('pdf', pdfBuffer, {
      filename: 'nota-fiscal-teste.pdf',
      contentType: 'application/pdf'
    });
    
    console.log('🚀 Enviando para http://localhost:3001/api/pdf/extract...');
    
    // Fazer a requisição
    const response = await fetch('http://localhost:3001/api/pdf/extract', {
      method: 'POST',
      body: formData
    });
    
    console.log('📊 Status da resposta:', response.status, response.statusText);
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Sucesso!');
      console.log('📝 Dados extraídos:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Erro na resposta:');
      console.log('📝 Detalhes:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.error('❌ Detalhes:', {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
  }
}

testPDFUpload();
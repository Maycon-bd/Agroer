import fs from 'fs';
import { jsPDF } from 'jspdf';

// Criar um PDF de teste simples
const doc = new jsPDF();

// Adicionar conteúdo de uma nota fiscal fictícia
doc.setFontSize(16);
doc.text('NOTA FISCAL ELETRÔNICA', 20, 20);

doc.setFontSize(12);
doc.text('Número: 12345', 20, 40);
doc.text('Data de Emissão: 15/01/2024', 20, 50);

doc.text('FORNECEDOR:', 20, 70);
doc.text('Razão Social: Empresa Teste LTDA', 20, 80);
doc.text('CNPJ: 12.345.678/0001-90', 20, 90);

doc.text('FATURADO PARA:', 20, 110);
doc.text('Nome: João da Silva', 20, 120);
doc.text('CPF: 123.456.789-00', 20, 130);

doc.text('PRODUTOS/SERVIÇOS:', 20, 150);
doc.text('Descrição: Serviços de consultoria', 20, 160);
doc.text('Valor Total: R$ 1.500,00', 20, 170);

// Salvar o PDF
const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
fs.writeFileSync('nota-fiscal-teste.pdf', pdfBuffer);

console.log('✅ PDF de teste criado: nota-fiscal-teste.pdf');
console.log('📄 Tamanho:', pdfBuffer.length, 'bytes');
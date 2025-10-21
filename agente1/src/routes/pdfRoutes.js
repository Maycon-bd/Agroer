import express from 'express';
import { extractInvoiceData } from '../services/pdfProcessor.js';

const router = express.Router();

// Rota para upload e processamento de PDF
router.post('/extract', async (req, res) => {
  try {
    // Usar o middleware de upload configurado no servidor
    const upload = req.app.locals.upload;
    
    upload.single('pdf')(req, res, async (err) => {
      if (err) {
        console.error('Erro no upload:', err);
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Nenhum arquivo PDF foi enviado'
        });
      }

      try {
        console.log(`📄 Processando arquivo: ${req.file.originalname}`);
        console.log(`📊 Tamanho do arquivo: ${(req.file.size / 1024 / 1024).toFixed(2)}MB`);
        
        // Processar o PDF e extrair dados
        const extractedData = await extractInvoiceData(req.file.buffer);
        
        console.log('✅ Dados extraídos com sucesso');
        
        res.json({
          success: true,
          data: extractedData,
          metadata: {
            filename: req.file.originalname,
            size: req.file.size,
            processedAt: new Date().toISOString()
          }
        });
        
      } catch (processingError) {
        console.error('❌ Erro no processamento:', processingError);
        
        res.status(500).json({
          success: false,
          error: 'Erro ao processar o arquivo PDF',
          details: processingError.message
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota de teste
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rota de PDF funcionando',
    endpoints: {
      extract: 'POST /api/pdf/extract - Upload e extração de dados de PDF'
    }
  });
});

export default router;
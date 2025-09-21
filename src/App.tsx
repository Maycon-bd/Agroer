import React, { useState } from 'react';
import './App.css';

interface ExtractedData {
  fornecedor: {
    razaoSocial: string | null;
    nomeFantasia: string | null;
    cnpj: string | null;
  };
  faturado: {
    nomeCompleto: string | null;
    cpf: string | null;
  };
  numeroNotaFiscal: string | null;
  dataEmissao: string | null;
  descricaoProdutos: string | null;
  parcelas: Array<{
    numero: number;
    dataVencimento: string | null;
    valor: number;
  }>;
  valorTotal: number;
  classificacoesDespesa: Array<{
    categoria: string;
    subcategoria: string;
    percentual: number;
    valor: number;
    justificativa: string;
  }>;
  metadata?: {
    extractedAt: string;
    textLength: number;
    processingVersion: string;
  };
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [viewMode, setViewMode] = useState<'formatted' | 'json'>('json');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:3001/api';

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setExtractedData(null);
    } else {
      alert('Por favor, selecione apenas arquivos PDF.');
      event.target.value = '';
    }
  };

  const handleExtractData = async () => {
    if (!selectedFile) {
      alert('Por favor, selecione um arquivo PDF primeiro.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setExtractedData(null);
    
    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      
      console.log('📤 Enviando arquivo para processamento...');
      
      const response = await fetch(`${API_BASE_URL}/pdf/extract`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar arquivo');
      }
      
      if (result.success && result.data) {
        console.log('✅ Dados extraídos com sucesso:', result.data);
        setExtractedData(result.data);
      } else {
        throw new Error('Resposta inválida do servidor');
      }
      
    } catch (err) {
      console.error('❌ Erro no processamento:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      alert(`Erro ao processar arquivo: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (extractedData) {
      const jsonString = JSON.stringify(extractedData, null, 2);
      navigator.clipboard.writeText(jsonString).then(() => {
        alert('JSON copiado para a área de transferência!');
      });
    }
  };

  return (
    <div className="app">
      <div className="container">
        {/* Seção de Upload */}
        <div className="upload-section">
          <h1 className="main-title">Extração de Dados de Nota Fiscal</h1>
          <p className="subtitle">
            Carregue um PDF de nota fiscal e extraia os dados automaticamente usando IA
          </p>
          
          <div className="file-upload-area">
            <input
              type="file"
              id="file-input"
              accept=".pdf"
              onChange={handleFileSelect}
              className="file-input"
            />
            <label htmlFor="file-input" className="file-label">
              <div className="upload-icon">📄</div>
              <span>Clique para selecionar um arquivo PDF</span>
            </label>
          </div>

          {selectedFile && (
            <div className="selected-file">
              <span className="file-name">📎 {selectedFile.name}</span>
            </div>
          )}

          <button 
            className="extract-button"
            onClick={handleExtractData}
            disabled={!selectedFile || isProcessing}
          >
            {isProcessing ? 'PROCESSANDO...' : 'EXTRAIR DADOS'}
          </button>
        </div>

        {/* Seção de Erro */}
        {error && (
          <div className="error-section">
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Seção de Dados Extraídos */}
        {extractedData && (
          <div className="data-section">
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewMode === 'formatted' ? 'active' : ''}`}
                onClick={() => setViewMode('formatted')}
              >
                Visualização Formatada
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'json' ? 'active' : ''}`}
                onClick={() => setViewMode('json')}
              >
                JSON
              </button>
            </div>

            <div className="data-display">
              {viewMode === 'json' ? (
                <div className="json-container">
                  <pre className="json-content">
                    {JSON.stringify(extractedData, null, 2)}
                  </pre>
                  <button className="copy-button" onClick={copyToClipboard}>
                    Copiar JSON
                  </button>
                </div>
              ) : (
                <div className="formatted-view">
                  <div className="invoice-summary">
                    <h3>📄 Resumo da Nota Fiscal</h3>
                    <div className="summary-grid">
                      <div className="summary-item">
                        <strong>Número:</strong> {extractedData.numeroNotaFiscal || 'Não informado'}
                      </div>
                      <div className="summary-item">
                        <strong>Data de Emissão:</strong> {extractedData.dataEmissao || 'Não informada'}
                      </div>
                      <div className="summary-item">
                        <strong>Valor Total:</strong> R$ {extractedData.valorTotal?.toFixed(2) || '0,00'}
                      </div>
                    </div>
                  </div>

                  <div className="invoice-details">
                    <div className="detail-section">
                      <h4>🏢 Fornecedor</h4>
                      <p><strong>Razão Social:</strong> {extractedData.fornecedor?.razaoSocial || 'Não informado'}</p>
                      <p><strong>Nome Fantasia:</strong> {extractedData.fornecedor?.nomeFantasia || 'Não informado'}</p>
                      <p><strong>CNPJ:</strong> {extractedData.fornecedor?.cnpj || 'Não informado'}</p>
                    </div>

                    {extractedData.faturado && (
                      <div className="detail-section">
                        <h4>👤 Faturado</h4>
                        <p><strong>Nome:</strong> {extractedData.faturado.nomeCompleto || 'Não informado'}</p>
                        <p><strong>CPF:</strong> {extractedData.faturado.cpf || 'Não informado'}</p>
                      </div>
                    )}

                    {extractedData.descricaoProdutos && (
                      <div className="detail-section">
                        <h4>📦 Produtos/Serviços</h4>
                        <p>{extractedData.descricaoProdutos}</p>
                      </div>
                    )}

                    {extractedData.classificacoesDespesa && extractedData.classificacoesDespesa.length > 0 && (
                      <div className="detail-section">
                        <h4>🏷️ Classificação de Despesas</h4>
                        {extractedData.classificacoesDespesa.map((classificacao, index) => (
                          <div key={index} className="expense-classification">
                            <p><strong>Categoria:</strong> {classificacao.categoria}</p>
                            <p><strong>Subcategoria:</strong> {classificacao.subcategoria}</p>
                            <p><strong>Percentual:</strong> {classificacao.percentual.toFixed(1)}%</p>
                            <p><strong>Valor:</strong> R$ {classificacao.valor.toFixed(2)}</p>
                            <p><strong>Justificativa:</strong> {classificacao.justificativa}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {extractedData.parcelas && extractedData.parcelas.length > 0 && (
                      <div className="detail-section">
                        <h4>💰 Parcelas</h4>
                        {extractedData.parcelas.map((parcela, index) => (
                          <div key={index} className="installment">
                            <p><strong>Parcela {parcela.numero}:</strong> R$ {parcela.valor.toFixed(2)}</p>
                            {parcela.dataVencimento && <p><strong>Vencimento:</strong> {parcela.dataVencimento}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="help-text">
              Este JSON contém todos os dados extraídos da nota fiscal e pode ser usado para integração com outros sistemas.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

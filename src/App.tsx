import React, { useState } from 'react';
import './App.css';

interface ExtractedData {
  numeroNota: string;
  serie: string;
  dataEmissao: string;
  fornecedor: {
    nome: string;
    cnpj: string;
    endereco: string;
  };
  valorTotal: number;
  itens: Array<{
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }>;
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [viewMode, setViewMode] = useState<'formatted' | 'json'>('json');
  const [isProcessing, setIsProcessing] = useState(false);

  const mockData: ExtractedData = {
    numeroNota: "000008438",
    serie: "001",
    dataEmissao: "2025-01-15",
    fornecedor: {
      nome: "EMPRESA EXEMPLO LTDA",
      cnpj: "13.142.597/0001-46",
      endereco: "Rua das Flores, 123 - Centro - São Paulo/SP"
    },
    valorTotal: 1250.75,
    itens: [
      {
        descricao: "Produto A",
        quantidade: 2,
        valorUnitario: 500.00,
        valorTotal: 1000.00
      },
      {
        descricao: "Produto B",
        quantidade: 1,
        valorUnitario: 250.75,
        valorTotal: 250.75
      }
    ]
  };

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

  const handleExtractData = () => {
    if (!selectedFile) {
      alert('Por favor, selecione um arquivo PDF primeiro.');
      return;
    }

    setIsProcessing(true);
    
    // Simula processamento
    setTimeout(() => {
      setExtractedData(mockData);
      setIsProcessing(false);
    }, 2000);
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
                  <p>Visualização formatada será implementada em breve...</p>
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

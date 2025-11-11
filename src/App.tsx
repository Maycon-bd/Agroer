import React, { useState, useEffect } from 'react';
import './App.css';
import { env, hasAgente3 } from './config/env';
import { ragSimple, ragEmbeddingsSearch } from './services/rag';
import type { RagSimpleResponse, RagEmbeddingsResponse } from './services/rag';

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

interface AnalysisResult {
  fornecedor: {
    nome: string;
    cnpj: string;
    existe: boolean;
    id: number | null;
    status: string;
  };
  faturado: {
    nome: string;
    cpf: string;
    existe: boolean;
    id: number | null;
    status: string;
  };
  despesa: {
    descricao: string;
    existe: boolean;
    id: number | null;
    status: string;
  };
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [viewMode, setViewMode] = useState<'formatted' | 'json'>('json');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreatingMovement, setIsCreatingMovement] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Search state for RAG integrations
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchAnswer, setSearchAnswer] = useState<string | null>(null);
  const [searchSources, setSearchSources] = useState<RagSimpleResponse['sources'] | null>(null);
  const [searchEmbeddings, setSearchEmbeddings] = useState<RagEmbeddingsResponse['results'] | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 350);
    return () => clearTimeout(t);
  }, [searchQuery]);
  const API_BASE_URL = env.agente1Api;
  const VALIDATION_API_URL = env.agente2Api;

  // Debug logs
  console.log('🔧 Debug - Variáveis de ambiente:', {
    VITE_AGENTE1_URL: (import.meta as any)?.env?.VITE_AGENTE1_URL,
    VITE_AGENTE2_URL: (import.meta as any)?.env?.VITE_AGENTE2_URL,
    VITE_AGENTE3_URL: (import.meta as any)?.env?.VITE_AGENTE3_URL,
    API_BASE_URL,
    VALIDATION_API_URL,
    AGENTE3_API: env.agente3Api,
  });

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
      formData.append('file', selectedFile);
      
      console.log('📤 Enviando arquivo para processamento...');
      console.log('🔧 Debug - URL da requisição:', `${API_BASE_URL}/pdf/extract`);
      console.log('🔧 Debug - Arquivo selecionado:', selectedFile.name, selectedFile.size, 'bytes');
      
      const response = await fetch(`${API_BASE_URL}/pdf/extract`, {
        method: 'POST',
        body: formData,
      });
      
      console.log('🔧 Debug - Response status:', response.status, response.statusText);
      console.log('🔧 Debug - Response headers:', Object.fromEntries(response.headers.entries()));
      
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

  // RAG search handlers (stub for future integration)
  const performSearchRAG = async (query: string) => {
    console.log('🔎 Consulta RAG:', query);
    setIsSearching(true);
    setSearchError(null);
    setSearchAnswer(null);
    setSearchSources(null);
    setSearchEmbeddings(null);
    try {
      if (!hasAgente3) {
        throw new Error('Agente3 não configurado. Defina VITE_AGENTE3_URL para habilitar RAG.');
      }
      // Primeiro tenta RAG simples
      const simple = await ragSimple(query);
      if (!simple.success) {
        throw new Error(simple.error || 'Falha na consulta RAG simples.');
      }
      setSearchAnswer(simple.answer || null);
      setSearchSources(simple.sources || null);
      // Em seguida, consulta embeddings
      const emb = await ragEmbeddingsSearch(query);
      if (!emb.success) {
        throw new Error(emb.error || 'Falha na busca de embeddings.');
      }
      setSearchEmbeddings(emb.results || null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido na busca';
      console.warn('Busca RAG erro:', msg);
      setSearchError(msg);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    performSearchRAG(q);
  };

  const handleAnalyzeData = async () => {
    if (!extractedData) {
      alert('Nenhum dado extraído para analisar.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Preparar dados para análise
      const dadosParaAnalise = {
        nomeFornecedor: extractedData.fornecedor?.razaoSocial || '',
        cnpjFornecedor: extractedData.fornecedor?.cnpj || '',
        nomeFaturado: extractedData.faturado?.nomeCompleto || '',
        cpfFaturado: extractedData.faturado?.cpf || '',
        classificacaoDespesa: extractedData.classificacoesDespesa?.[0]?.categoria || 'MANUTENÇÃO E OPERAÇÃO',
        numeroNota: extractedData.numeroNotaFiscal || '',
        dataEmissao: extractedData.dataEmissao || '',
        valorTotal: extractedData.valorTotal || 0
      };

      console.log('📊 Enviando dados para análise...', dadosParaAnalise);
      
      const response = await fetch(`${VALIDATION_API_URL}/validation/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dadosExtraidos: dadosParaAnalise }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao analisar dados');
      }
      
      if (result.success && result.analise) {
        console.log('✅ Análise concluída:', result.analise);
        setAnalysisResult(result.analise);
      } else {
        throw new Error('Resposta inválida do servidor de análise');
      }
      
    } catch (err) {
      console.error('❌ Erro na análise:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      alert(`Erro ao analisar dados: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateMovement = async () => {
    if (!extractedData || !analysisResult) {
      alert('É necessário ter dados extraídos e análise concluída.');
      return;
    }

    setIsCreatingMovement(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Preparar dados para criação do movimento
      const dadosParaMovimento = {
        nomeFornecedor: extractedData.fornecedor?.razaoSocial || '',
        cnpjFornecedor: extractedData.fornecedor?.cnpj || '',
        nomeFaturado: extractedData.faturado?.nomeCompleto || '',
        cpfFaturado: extractedData.faturado?.cpf || '',
        classificacaoDespesa: extractedData.classificacoesDespesa?.[0]?.categoria || 'MANUTENÇÃO E OPERAÇÃO',
        numeroNota: extractedData.numeroNotaFiscal || '',
        dataEmissao: extractedData.dataEmissao || '',
        valorTotal: extractedData.valorTotal || 0,
        dataVencimento: extractedData.parcelas?.[0]?.dataVencimento || extractedData.dataEmissao
      };

      console.log('💾 Criando movimento...', { dadosParaMovimento, analysisResult });
      
      const response = await fetch(`${VALIDATION_API_URL}/validation/create-movement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          dadosExtraidos: dadosParaMovimento, 
          analise: analysisResult 
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar movimento');
      }
      
      if (result.success) {
        console.log('✅ Movimento criado:', result);
        setSuccessMessage(result.message);
        alert(result.message);
      } else {
        throw new Error('Resposta inválida do servidor');
      }
      
    } catch (err) {
      console.error('❌ Erro na criação do movimento:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      alert(`Erro ao criar movimento: ${errorMessage}`);
    } finally {
      setIsCreatingMovement(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        {/* Seção de Upload */}
        <div className="upload-section">
          <h1 className="main-title">Agroer</h1>
          <p className="subtitle">
            Agroer — Carregue um PDF de nota fiscal e extraia os dados automaticamente usando IA
          </p>
          {/* Search bar for future RAG integrations */}
          <form className="search-bar" onSubmit={handleSearchSubmit}>
            <input
              className="search-input"
              type="search"
              placeholder="Pesquisar notas, fornecedores, produtos..."
              aria-label="Pesquisar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">Pesquisar</button>
          </form>
          {debouncedQuery && (
            <div className="search-status">Consultando por: "{debouncedQuery}"</div>
          )}
          
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
            onClick={handleExtractData} 
            disabled={!selectedFile || isProcessing}
            className="extract-button"
          >
            {isProcessing ? 'PROCESSANDO...' : 'EXTRAIR DADOS'}
          </button>

          {/* Painel de resultados da pesquisa (abaixo do botão extrair) */}
          <div className="search-results">
            <div className="search-header">
              <h3>🔎 Resultados da Pesquisa</h3>
              {isSearching && <span className="search-loading">Consultando...</span>}
            </div>
            {searchError && (
              <div className="search-error">{searchError}</div>
            )}
            {!searchError && !searchAnswer && !searchEmbeddings && !isSearching && (
              <p className="search-empty">Nenhum resultado. Use o campo de pesquisa acima.</p>
            )}
            {searchAnswer && (
              <div className="search-answer">
                <strong>Resposta:</strong>
                <p>{searchAnswer}</p>
              </div>
            )}
            {searchSources && searchSources.length > 0 && (
              <div className="search-sources">
                <strong>Fontes:</strong>
                <div className="sources-list">
                  {searchSources.map((s) => (
                    <a key={s.id} className="source-item" href={s.url || '#'} target="_blank" rel="noopener noreferrer">
                      {s.title || s.id} {s.score !== undefined ? `• score ${s.score.toFixed(2)}` : ''}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {searchEmbeddings && searchEmbeddings.length > 0 && (
              <div className="search-embeddings">
                <strong>Resultados por Similaridade:</strong>
                <ul className="embeddings-list">
                  {searchEmbeddings.map((r) => (
                    <li key={r.id} className="embedding-item">
                      <span className="embedding-score">{r.score.toFixed(3)}</span>
                      <span className="embedding-text">{r.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Novos botões para análise e validação */}
          {extractedData && (
            <div className="analysis-buttons">
              <button 
                onClick={handleAnalyzeData} 
                disabled={isAnalyzing}
                className="analyze-button"
              >
                {isAnalyzing ? 'ANALISANDO...' : 'ANALISAR DADOS'}
              </button>
              
              {analysisResult && (
                <button 
                  onClick={handleCreateMovement} 
                  disabled={isCreatingMovement}
                  className="create-movement-button"
                >
                  {isCreatingMovement ? 'CRIANDO MOVIMENTO...' : 'CRIAR MOVIMENTO'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mensagem de sucesso */}
        {successMessage && (
          <div className="success-message">
            <h3>✅ Sucesso</h3>
            <p>{successMessage}</p>
          </div>
        )}

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
          <div className="extracted-data">
            <div className="data-header">
              <h2>📄 Dados Extraídos</h2>
              <div className="view-controls">
                <button 
                  onClick={() => setViewMode('formatted')}
                  className={viewMode === 'formatted' ? 'active' : ''}
                >
                  Formatado
                </button>
                <button 
                  onClick={() => setViewMode('json')}
                  className={viewMode === 'json' ? 'active' : ''}
                >
                  JSON
                </button>
                <button onClick={copyToClipboard} className="copy-button">
                  📋 Copiar JSON
                </button>
              </div>
            </div>

            {viewMode === 'formatted' ? (
              <div className="formatted-data">
                {/* Resumo da Nota Fiscal */}
                <div className="data-section">
                  <h3>📋 Resumo da Nota Fiscal</h3>
                  <div className="data-grid">
                    <div className="data-item">
                      <strong>Número:</strong> {extractedData.numeroNotaFiscal || 'Não informado'}
                    </div>
                    <div className="data-item">
                      <strong>Data de Emissão:</strong> {extractedData.dataEmissao || 'Não informada'}
                    </div>
                    <div className="data-item">
                      <strong>Valor Total:</strong> R$ {extractedData.valorTotal?.toFixed(2) || '0,00'}
                    </div>
                  </div>
                </div>

                {/* Fornecedor */}
                <div className="data-section">
                  <h3>🏢 Fornecedor</h3>
                  <div className="data-grid">
                    <div className="data-item">
                      <strong>Razão Social:</strong> {extractedData.fornecedor?.razaoSocial || 'Não informada'}
                    </div>
                    <div className="data-item">
                      <strong>Nome Fantasia:</strong> {extractedData.fornecedor?.nomeFantasia || 'Não informado'}
                    </div>
                    <div className="data-item">
                      <strong>CNPJ:</strong> {extractedData.fornecedor?.cnpj || 'Não informado'}
                    </div>
                  </div>
                </div>

                {/* Faturado */}
                <div className="data-section">
                  <h3>👤 Faturado</h3>
                  <div className="data-grid">
                    <div className="data-item">
                      <strong>Nome Completo:</strong> {extractedData.faturado?.nomeCompleto || 'Não informado'}
                    </div>
                    <div className="data-item">
                      <strong>CPF:</strong> {extractedData.faturado?.cpf || 'Não informado'}
                    </div>
                  </div>
                </div>

                {/* Produtos/Serviços */}
                <div className="data-section">
                  <h3>📦 Produtos/Serviços</h3>
                  <div className="data-item">
                    <strong>Descrição:</strong> {extractedData.descricaoProdutos || 'Não informada'}
                  </div>
                </div>

                {/* Classificações de Despesa */}
                {extractedData.classificacoesDespesa && extractedData.classificacoesDespesa.length > 0 && (
                  <div className="data-section">
                    <h3>💰 Classificações de Despesa</h3>
                    {extractedData.classificacoesDespesa.map((classificacao, index) => (
                      <div key={index} className="classification-item">
                        <div className="data-grid">
                          <div className="data-item">
                            <strong>Categoria:</strong> {classificacao.categoria}
                          </div>
                          <div className="data-item">
                            <strong>Subcategoria:</strong> {classificacao.subcategoria}
                          </div>
                          <div className="data-item">
                            <strong>Percentual:</strong> {classificacao.percentual}%
                          </div>
                          <div className="data-item">
                            <strong>Valor:</strong> R$ {classificacao.valor.toFixed(2)}
                          </div>
                        </div>
                        <div className="data-item">
                          <strong>Justificativa:</strong> {classificacao.justificativa}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Parcelas */}
                {extractedData.parcelas && extractedData.parcelas.length > 0 && (
                  <div className="data-section">
                    <h3>📅 Parcelas</h3>
                    {extractedData.parcelas.map((parcela, index) => (
                      <div key={index} className="parcela-item">
                        <div className="data-grid">
                          <div className="data-item">
                            <strong>Parcela:</strong> {parcela.numero}
                          </div>
                          <div className="data-item">
                            <strong>Vencimento:</strong> {parcela.dataVencimento || 'Não informado'}
                          </div>
                          <div className="data-item">
                            <strong>Valor:</strong> R$ {parcela.valor.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <pre className="json-data">
                {JSON.stringify(extractedData, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* Seção de Resultados da Análise */}
        {analysisResult && (
          <div className="analysis-result">
            <h2>🔍 Resultados da Análise</h2>
            
            <div className="analysis-section">
              <h3>🏢 Fornecedor</h3>
              <div className="analysis-item">
                <div className="analysis-status">
                  <span className={`status-badge ${analysisResult.fornecedor.existe ? 'exists' : 'not-exists'}`}>
                    {analysisResult.fornecedor.existe ? '✅ Existe' : '❌ Não existe'}
                  </span>
                </div>
                <div className="analysis-details">
                  <p><strong>Nome:</strong> {analysisResult.fornecedor.nome}</p>
                  <p><strong>CNPJ:</strong> {analysisResult.fornecedor.cnpj}</p>
                  <p><strong>Status:</strong> {analysisResult.fornecedor.status}</p>
                  {analysisResult.fornecedor.id && (
                    <p><strong>ID:</strong> {analysisResult.fornecedor.id}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="analysis-section">
              <h3>👤 Faturado</h3>
              <div className="analysis-item">
                <div className="analysis-status">
                  <span className={`status-badge ${analysisResult.faturado.existe ? 'exists' : 'not-exists'}`}>
                    {analysisResult.faturado.existe ? '✅ Existe' : '❌ Não existe'}
                  </span>
                </div>
                <div className="analysis-details">
                  <p><strong>Nome:</strong> {analysisResult.faturado.nome}</p>
                  <p><strong>CPF:</strong> {analysisResult.faturado.cpf}</p>
                  <p><strong>Status:</strong> {analysisResult.faturado.status}</p>
                  {analysisResult.faturado.id && (
                    <p><strong>ID:</strong> {analysisResult.faturado.id}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="analysis-section">
              <h3>💰 Despesa</h3>
              <div className="analysis-item">
                <div className="analysis-status">
                  <span className={`status-badge ${analysisResult.despesa.existe ? 'exists' : 'not-exists'}`}>
                    {analysisResult.despesa.existe ? '✅ Existe' : '❌ Não existe'}
                  </span>
                </div>
                <div className="analysis-details">
                  <p><strong>Descrição:</strong> {analysisResult.despesa.descricao}</p>
                  <p><strong>Status:</strong> {analysisResult.despesa.status}</p>
                  {analysisResult.despesa.id && (
                    <p><strong>ID:</strong> {analysisResult.despesa.id}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

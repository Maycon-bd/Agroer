import { useMemo, useState, useEffect } from 'react';
import './App.css';
import { unifiedSearch, unifiedAll, pessoasCreate, pessoasUpdate, pessoasSearch, classificacaoUpdate, classificacaoAll, movimentosCreate, movimentosUpdate, movimentosInactivate, movimentosAddClassificacoes, movimentosAddParcelas } from './services/admin';

type UnifiedItem = {
  type: 'Pessoas' | 'Classificacao' | 'MovimentoContas';
  id: number;
  title?: string;
  documento?: string;
  rel?: string;
  ativo?: boolean;
  tipo?: string;
  categoria?: string;
  subcategoria?: string;
  numero_documento?: string;
  data_emissao?: string;
  data_vencimento?: string;
  descricao?: string;
  valor_total?: number;
  tipo_movimento?: string;
  status_pagamento?: string;
  fornecedor_id?: number;
  fornecedor_nome?: string;
  fornecedor_doc?: string;
  fornecedor_tipo?: string;
  faturado_id?: number;
  faturado_nome?: string;
  faturado_doc?: string;
  faturado_tipo?: string;
  classificacoes?: string;
  categorias?: string;
  parcelas_count?: number;
};

export default function Screen2({ onBack }: { onBack?: () => void }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<string>('data_emissao');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [mode, setMode] = useState<'consultar' | 'cadastrar'>('consultar');
  const [editPessoa, setEditPessoa] = useState<UnifiedItem | null>(null);
  const [editClass, setEditClass] = useState<UnifiedItem | null>(null);
  const [formMov, setFormMov] = useState<{ numero_documento?: string; data_emissao?: string; data_vencimento?: string; descricao?: string; observacoes?: string; status_pagamento?: string; valor_total?: number; tipo_movimento?: string; fornecedor_id?: number; faturado_id?: number }>({ tipo_movimento: 'SAIDA', status_pagamento: 'PENDENTE' });
  const [editMov, setEditMov] = useState<UnifiedItem | null>(null);
  const [parcelas, setParcelas] = useState<Array<{ numero_parcela: number; data_vencimento: string; valor_parcela: number }>>([]);
  const [classifs, setClassifs] = useState<Array<{ classificacao_id: number; valor_classificacao: number; percentual?: number; justificativa?: string }>>([]);
  const [parcelaNum, setParcelaNum] = useState<number | ''>('');
  const [parcelaVenc, setParcelaVenc] = useState<string>('');
  const [parcelaValor, setParcelaValor] = useState<number | ''>('');
  const [classifId, setClassifId] = useState<number | ''>('');
  const [classifValor, setClassifValor] = useState<number | ''>('');
  const [classifPerc, setClassifPerc] = useState<number | ''>('');
  const [classifJus, setClassifJus] = useState<string>('');
  const [fornecedorNome, setFornecedorNome] = useState('');
  const [fornecedorDoc, setFornecedorDoc] = useState('');
  const [faturadoNome, setFaturadoNome] = useState('');
  const [faturadoDoc, setFaturadoDoc] = useState('');
  const [classifOptions, setClassifOptions] = useState<Array<{ id: number; descricao: string }>>([]);

  const hint = useMemo(() => 'Buscar por nome, documento, descrição, número... use & para múltiplos termos', []);

  const runSearch = async () => {
    setLoading(true);
    try {
      const res = await unifiedSearch(query, page);
      setItems(res?.items || []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const runAll = async () => {
    setLoading(true);
    try {
      const res = await unifiedAll(page);
      setItems(res?.items || []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (key: string) => {
    if (sortBy === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setSortDir('asc'); }
  };

  const sortedItems = useMemo(() => {
    const filtered = items.filter(it => it.type === 'MovimentoContas');
    const arr = [...filtered];
    arr.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const va = ((): any => {
        if (sortBy === 'valor_total') return a.valor_total ?? null;
        if (sortBy === 'data_emissao') return a.data_emissao ? new Date(a.data_emissao).getTime() : null;
        if (sortBy === 'data_vencimento') return a.data_vencimento ? new Date(a.data_vencimento).getTime() : null;
        if (sortBy === 'faturado_nome') return a.faturado_nome ?? '';
        if (sortBy === 'fornecedor_nome') return a.fornecedor_nome ?? '';
        if (sortBy === 'classificacoes') return a.classificacoes ?? '';
        if (sortBy === 'categorias') return a.categorias ?? '';
        if (sortBy === 'numero_documento') {
          const s = a.numero_documento ?? '';
          const n = Number(String(s).replace(/\D+/g, ''));
          return Number.isFinite(n) && String(n).length > 0 ? n : s;
        }
        if (sortBy === 'doc_faturado') return a.faturado_doc ?? '';
        if (sortBy === 'doc_fornecedor') return a.fornecedor_doc ?? '';
        if (sortBy === 'documento') return `${a.fornecedor_doc || ''} ${a.faturado_doc || ''}`.trim();
        if (sortBy === 'parcelas_count') return Number(a.parcelas_count ?? 0);
        if (sortBy === 'status_pagamento') return a.status_pagamento ?? '';
        return a.id;
      })();
      const vb = ((): any => {
        if (sortBy === 'valor_total') return b.valor_total ?? null;
        if (sortBy === 'data_emissao') return b.data_emissao ? new Date(b.data_emissao).getTime() : null;
        if (sortBy === 'data_vencimento') return b.data_vencimento ? new Date(b.data_vencimento).getTime() : null;
        if (sortBy === 'faturado_nome') return b.faturado_nome ?? '';
        if (sortBy === 'fornecedor_nome') return b.fornecedor_nome ?? '';
        if (sortBy === 'classificacoes') return b.classificacoes ?? '';
        if (sortBy === 'categorias') return b.categorias ?? '';
        if (sortBy === 'numero_documento') {
          const s = b.numero_documento ?? '';
          const n = Number(String(s).replace(/\D+/g, ''));
          return Number.isFinite(n) && String(n).length > 0 ? n : s;
        }
        if (sortBy === 'doc_faturado') return b.faturado_doc ?? '';
        if (sortBy === 'doc_fornecedor') return b.fornecedor_doc ?? '';
        if (sortBy === 'documento') return `${b.fornecedor_doc || ''} ${b.faturado_doc || ''}`.trim();
        if (sortBy === 'parcelas_count') return Number(b.parcelas_count ?? 0);
        if (sortBy === 'status_pagamento') return b.status_pagamento ?? '';
        return b.id;
      })();
      if (va === null || va === undefined) return 1;
      if (vb === null || vb === undefined) return -1;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      const sa = String(va).toLocaleLowerCase();
      const sb = String(vb).toLocaleLowerCase();
      if (sa < sb) return -1 * dir;
      if (sa > sb) return 1 * dir;
      return 0;
    });
    return arr;
  }, [items, sortBy, sortDir]);

  useEffect(() => {
    (async () => {
      try {
        const res = await classificacaoAll('DESPESA');
        const items = Array.isArray(res?.items) ? res.items : [];
        setClassifOptions(items.map((c: any) => ({ id: c.id, descricao: c.descricao })));
      } catch {}
    })();
  }, []);

  return (
    <div className="app">
      <div className="container">
        <div className="upload-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="main-title">Consultar Registros</h1>
            {onBack && <button className="file-change-btn" onClick={onBack}>Voltar</button>}
          </div>
          <div className="analysis-buttons" style={{ justifyContent: 'center' }}>
            <button className={mode === 'consultar' ? 'analyze-button' : 'file-change-btn'} onClick={() => setMode('consultar')}>Consultar</button>
            <button className={mode === 'cadastrar' ? 'create-movement-button' : 'file-change-btn'} onClick={() => setMode('cadastrar')}>Cadastrar</button>
          </div>

          {mode === 'consultar' && (
            <div className="search-results" style={{ marginTop: 12 }}>
              <div className="search-header" style={{ alignItems: 'center' }}>
                <h3>Buscar Registros</h3>
                {loading && <span className="search-loading">Consultando...</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input className="search-input" placeholder={hint} value={query} onChange={(e) => setQuery(e.target.value)} />
                <button className="search-button" onClick={() => { setPage(1); runSearch(); }}>Buscar</button>
                <button className="create-movement-button" onClick={() => { setPage(1); setQuery(''); runAll(); }}>Todos</button>
              </div>
            </div>
          )}

          {mode === 'consultar' && (
            <div className="search-results" style={{ marginTop: 16 }}>
              <div className="search-header"><h3>Lista</h3></div>
              <div className="list-wrap">
              <table className="list-table" style={{ minWidth: 1520 }}>
                <thead>
                  <tr>
                    <th style={{ width: 200 }} onClick={() => toggleSort('doc_faturado')}>CPF/CNPJ Faturado</th>
                    <th style={{ width: 200 }} onClick={() => toggleSort('doc_fornecedor')}>CPF/CNPJ Fornecedor</th>
                    <th style={{ width: 160 }} onClick={() => toggleSort('faturado_nome')}>Faturado</th>
                    <th style={{ width: 160 }} onClick={() => toggleSort('fornecedor_nome')}>Fornecedor</th>
                    
                    <th style={{ width: 120 }} onClick={() => toggleSort('valor_total')}>Valor</th>
                    <th style={{ width: 110 }} onClick={() => toggleSort('data_emissao')}>Emissão</th>
                    <th style={{ width: 110 }} onClick={() => toggleSort('data_vencimento')}>Vencimento</th>
                    <th style={{ width: 140 }}>Tipo</th>
                    <th style={{ width: 240 }} onClick={() => toggleSort('classificacoes')}>Classificações</th>
                    <th style={{ width: 200 }}>Descrição</th>
                    <th style={{ width: 120 }} onClick={() => toggleSort('numero_documento')}>Número NF</th>
                    <th style={{ width: 120 }} onClick={() => toggleSort('status_pagamento')}>Status</th>
                    <th style={{ width: 160 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedItems.length === 0 && (
                    <tr><td colSpan={15}>Nenhum registro.</td></tr>
                  )}
                  {sortedItems.map(it => (
                    <tr key={`${it.type}-${it.id}`}>
                      <td style={{ width: 200, fontFamily: 'Courier New, monospace' }}>{fmtDoc(it.faturado_doc)}</td>
                      <td style={{ width: 200, fontFamily: 'Courier New, monospace' }}>{fmtDoc(it.fornecedor_doc)}</td>
                      <td style={{ width: 160 }}>{it.faturado_nome || 'N/A'}</td>
                      <td style={{ width: 160 }}>{it.fornecedor_nome || 'N/A'}</td>
                      
                      <td style={{ width: 120 }}>{it.valor_total !== undefined ? `R$ ${Number(it.valor_total).toFixed(2)}` : 'N/A'}</td>
                      <td style={{ width: 110 }}>{fmtDate(it.data_emissao)}</td>
                      <td style={{ width: 110 }}>{fmtDate(it.data_vencimento)}</td>
                      <td style={{ width: 140 }}>{`${it.fornecedor_tipo || ''}${it.faturado_tipo ? ' / ' + it.faturado_tipo : ''}` || 'N/A'}</td>
                      <td style={{ width: 240 }}>{it.classificacoes || 'N/A'}</td>
                      <td style={{ width: 200 }}>{it.descricao || 'N/A'}</td>
                      <td style={{ width: 120, fontFamily: 'Courier New, monospace' }}>{it.numero_documento || 'N/A'}</td>
                      <td style={{ width: 120 }}>{it.status_pagamento || (it.ativo === false ? 'INATIVO' : 'N/A')}</td>
                      <td style={{ width: 160, overflow: 'visible' }}>
                         {it.type === 'MovimentoContas' && (
                           <>
                              <button className="file-change-btn" onClick={() => setEditMov(it)}>Editar</button>
                              <button className="search-button" onClick={async () => { await movimentosInactivate(it.id); await runSearch(); }}>Excluir</button>
                           </>
                         )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                <div>
                  <button className="file-change-btn" onClick={async () => { const np = Math.max(1, page - 1); setPage(np); if (query) { const res = await unifiedSearch(query, np); setItems(res?.items || []); } else { const res = await unifiedAll(np); setItems(res?.items || []); } }} disabled={page === 1 || loading}>Anterior</button>
                </div>
                <div>
                  <span style={{ fontSize: 12 }}>Página {page}</span>
                </div>
                <div>
                  <button className="create-movement-button" onClick={async () => { const np = page + 1; setPage(np); if (query) { const res = await unifiedSearch(query, np); setItems(res?.items || []); } else { const res = await unifiedAll(np); setItems(res?.items || []); } }} disabled={loading}>Próxima</button>
                </div>
              </div>
              </div>
            </div>
          )}

          {mode === 'cadastrar' && (
            <div className="search-results" style={{ marginTop: 16 }}>
              <div className="search-header" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Novo Registro</h3>
                <button className="file-change-btn" onClick={() => setMode('consultar')}>Voltar para Consultar</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input className="search-input" style={{ width: 280 }} placeholder="Fornecedor Nome" value={fornecedorNome} onChange={(e) => setFornecedorNome(e.target.value)} />
                  <input className="search-input" style={{ width: 180 }} placeholder="Fornecedor CPF/CNPJ" value={fornecedorDoc} onChange={(e) => setFornecedorDoc(e.target.value)} />
                  <input className="search-input" style={{ width: 280 }} placeholder="Faturado Nome" value={faturadoNome} onChange={(e) => setFaturadoNome(e.target.value)} />
                  <input className="search-input" style={{ width: 180 }} placeholder="Faturado CPF/CNPJ" value={faturadoDoc} onChange={(e) => setFaturadoDoc(e.target.value)} />
                  <input className="search-input" style={{ width: 160 }} placeholder="Número" value={formMov.numero_documento || ''} onChange={(e) => setFormMov({ ...formMov, numero_documento: e.target.value })} />
                  <input className="search-input" style={{ width: 150 }} type="date" placeholder="Data Emissão" value={formMov.data_emissao || ''} onChange={(e) => setFormMov({ ...formMov, data_emissao: e.target.value })} />
                  <input className="search-input" style={{ width: 150 }} type="date" placeholder="Data Vencimento" value={formMov.data_vencimento || ''} onChange={(e) => setFormMov({ ...formMov, data_vencimento: e.target.value })} />
                  <input className="search-input" style={{ width: 140 }} type="number" step="0.01" placeholder="Valor Total" value={formMov.valor_total !== undefined ? String(formMov.valor_total) : ''} onChange={(e) => setFormMov({ ...formMov, valor_total: Number(e.target.value) })} />
                  <select className="file-change-btn" value={formMov.tipo_movimento || 'SAIDA'} onChange={(e) => setFormMov({ ...formMov, tipo_movimento: e.target.value })}>
                    <option value="SAIDA">Saída</option>
                    <option value="ENTRADA">Entrada</option>
                  </select>
                  <select className="file-change-btn" value={formMov.status_pagamento || 'PENDENTE'} onChange={(e) => setFormMov({ ...formMov, status_pagamento: e.target.value })}>
                    <option value="PENDENTE">Pendente</option>
                    <option value="PAGO">Pago</option>
                    <option value="VENCIDO">Vencido</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                  <input className="search-input" placeholder="Descrição" value={formMov.descricao || ''} onChange={(e) => setFormMov({ ...formMov, descricao: e.target.value })} />
                  <input className="search-input" placeholder="Observações" value={formMov.observacoes || ''} onChange={(e) => setFormMov({ ...formMov, observacoes: e.target.value })} />
                  <button className="create-movement-button" onClick={async () => {
                    let fornecedor_id = formMov.fornecedor_id;
                    let faturado_id = formMov.faturado_id;
                    try {
                      if (!fornecedor_id && fornecedorDoc) {
                        const sr = await pessoasSearch(fornecedorDoc, 'FORNECEDOR');
                        const found = Array.isArray(sr?.items) ? sr.items.find((p: any) => String(p.documento).replace(/\D/g,'') === String(fornecedorDoc).replace(/\D/g,'')) : null;
                        if (found?.id) fornecedor_id = found.id; else if (fornecedorNome) {
                          const created = await pessoasCreate({ nome: fornecedorNome, documento: fornecedorDoc, tipo_relacionamento: 'FORNECEDOR' });
                          fornecedor_id = created?.id;
                        }
                      }
                      if (!faturado_id && faturadoDoc) {
                        const sr2 = await pessoasSearch(faturadoDoc, 'FATURADO');
                        const found2 = Array.isArray(sr2?.items) ? sr2.items.find((p: any) => String(p.documento).replace(/\D/g,'') === String(faturadoDoc).replace(/\D/g,'')) : null;
                        if (found2?.id) faturado_id = found2.id; else if (faturadoNome) {
                          const created2 = await pessoasCreate({ nome: faturadoNome, documento: faturadoDoc, tipo_relacionamento: 'FATURADO' });
                          faturado_id = created2?.id;
                        }
                      }
                    } catch {}
                    await movimentosCreate({ ...formMov, fornecedor_id, faturado_id, parcelas, classificacoes: classifs });
                    setFormMov({ tipo_movimento: 'SAIDA', status_pagamento: 'PENDENTE' });
                    setFornecedorNome(''); setFornecedorDoc(''); setFaturadoNome(''); setFaturadoDoc('');
                    setParcelas([]); setClassifs([]);
                    setMode('consultar'); await runSearch();
                  }}>Salvar Novo Registro</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginTop: 12 }}>
                  <div className="search-header"><h3>Parcelas</h3></div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <input className="search-input" style={{ width: 120 }} placeholder="Nº Parcela" value={parcelaNum === '' ? '' : String(parcelaNum)} onChange={(e) => setParcelaNum(e.target.value ? Number(e.target.value) : '')} />
                    <input className="search-input" style={{ width: 150 }} type="date" placeholder="Vencimento" value={parcelaVenc} onChange={(e) => setParcelaVenc(e.target.value)} />
                    <input className="search-input" style={{ width: 140 }} type="number" step="0.01" placeholder="Valor Parcela" value={parcelaValor === '' ? '' : String(parcelaValor)} onChange={(e) => setParcelaValor(e.target.value ? Number(e.target.value) : '')} />
                    <button className="file-change-btn" onClick={() => {
                      const n = typeof parcelaNum === 'number' ? parcelaNum : 0;
                      const dv = parcelaVenc;
                      const vp = typeof parcelaValor === 'number' ? parcelaValor : 0;
                      if (!n || !dv || !vp) return;
                      setParcelas(prev => [...prev, { numero_parcela: n, data_vencimento: dv, valor_parcela: vp }]);
                      setParcelaNum(''); setParcelaVenc(''); setParcelaValor('');
                    }}>Adicionar Parcela</button>
                  </div>
                {parcelas.length > 0 && (
                  <table className="json-data" style={{ width: '100%' }}>
                    <thead><tr><th>Nº</th><th>Vencimento</th><th>Valor</th><th></th></tr></thead>
                    <tbody>
                      {parcelas.map((p, idx) => (
                        <tr key={`p-${idx}`}>
                          <td>{p.numero_parcela}</td>
                          <td>{p.data_vencimento}</td>
                          <td>{`R$ ${p.valor_parcela.toFixed(2)}`}</td>
                          <td><button className="file-change-btn" onClick={() => setParcelas(prev => prev.filter((_, i) => i !== idx))}>Remover</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginTop: 12 }}>
                  <div className="search-header"><h3>Classificações da Nota</h3></div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <select className="file-change-btn" value={classifId === '' ? '' : String(classifId)} onChange={(e) => setClassifId(e.target.value ? Number(e.target.value) : '')} style={{ minWidth: 280 }}>
                    <option value="">Selecione uma classificação</option>
                    {classifOptions.map(c => (
                      <option key={c.id} value={c.id}>{c.descricao}</option>
                    ))}
                  </select>
                  <input className="search-input" style={{ width: 140 }} type="number" step="0.01" placeholder="Valor" value={classifValor === '' ? '' : String(classifValor)} onChange={(e) => setClassifValor(e.target.value ? Number(e.target.value) : '')} />
                  <input className="search-input" style={{ width: 90 }} type="number" step="0.01" placeholder="%" value={classifPerc === '' ? '' : String(classifPerc)} onChange={(e) => setClassifPerc(e.target.value ? Number(e.target.value) : '')} />
                  <input className="search-input" placeholder="Justificativa" value={classifJus} onChange={(e) => setClassifJus(e.target.value)} />
                  <button className="create-movement-button" onClick={() => {
                    const cid = typeof classifId === 'number' ? classifId : 0;
                    const vc = typeof classifValor === 'number' ? classifValor : 0;
                    const pc = typeof classifPerc === 'number' ? classifPerc : undefined;
                    const js = classifJus || undefined;
                    if (!cid || !vc) return;
                    setClassifs(prev => [...prev, { classificacao_id: cid, valor_classificacao: vc, percentual: pc, justificativa: js }]);
                    setClassifId(''); setClassifValor(''); setClassifPerc(''); setClassifJus('');
                  }}>Adicionar Classificação</button>
                  </div>
                {classifs.length > 0 && (
                  <table className="json-data" style={{ width: '100%' }}>
                    <thead><tr><th>ID</th><th>Valor</th><th>%</th><th>Justificativa</th><th></th></tr></thead>
                    <tbody>
                      {classifs.map((c, idx) => (
                        <tr key={`c-${idx}`}>
                          <td>{c.classificacao_id}</td>
                          <td>{`R$ ${c.valor_classificacao.toFixed(2)}`}</td>
                          <td>{c.percentual ?? ''}</td>
                          <td>{c.justificativa ?? ''}</td>
                          <td><button className="file-change-btn" onClick={() => setClassifs(prev => prev.filter((_, i) => i !== idx))}>Remover</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              </div>
            </div>
          )}

          {editPessoa && (
            <div className="search-results" style={{ marginTop: 16 }}>
              <div className="search-header"><h3>Editar Pessoa</h3></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="search-input" placeholder="Nome" value={editPessoa.title || ''} onChange={(e) => setEditPessoa({ ...editPessoa, title: e.target.value })} />
                <input className="search-input" placeholder="CPF/CNPJ" value={editPessoa.documento || ''} onChange={(e) => setEditPessoa({ ...editPessoa, documento: e.target.value })} />
                <select className="file-change-btn" value={editPessoa.rel || 'FORNECEDOR'} onChange={(e) => setEditPessoa({ ...editPessoa, rel: e.target.value })}>
                  <option value="FORNECEDOR">Fornecedor</option>
                  <option value="CLIENTE">Cliente</option>
                  <option value="FATURADO">Faturado</option>
                  <option value="FORNECEDOR_CLIENTE">Fornecedor/Cliente</option>
                </select>
                <button className="create-movement-button" onClick={async () => { await pessoasUpdate(editPessoa.id, { nome: editPessoa.title, documento: editPessoa.documento, tipo_relacionamento: editPessoa.rel }); setEditPessoa(null); await runSearch(); }}>Salvar</button>
                <button className="file-change-btn" onClick={() => setEditPessoa(null)}>Cancelar</button>
              </div>
            </div>
          )}

          {editClass && (
            <div className="search-results" style={{ marginTop: 16 }}>
              <div className="search-header"><h3>Editar Classificação</h3></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="search-input" placeholder="Descrição" value={editClass.title || ''} onChange={(e) => setEditClass({ ...editClass, title: e.target.value })} />
                <select className="file-change-btn" value={editClass.tipo || 'DESPESA'} onChange={(e) => setEditClass({ ...editClass, tipo: e.target.value })}>
                  <option value="DESPESA">Despesa</option>
                  <option value="RECEITA">Receita</option>
                </select>
                <input className="search-input" placeholder="Categoria" value={editClass.categoria || ''} onChange={(e) => setEditClass({ ...editClass, categoria: e.target.value })} />
                <input className="search-input" placeholder="Subcategoria" value={editClass.subcategoria || ''} onChange={(e) => setEditClass({ ...editClass, subcategoria: e.target.value })} />
                <button className="create-movement-button" onClick={async () => { await classificacaoUpdate(editClass.id, { descricao: editClass.title, tipo: editClass.tipo, categoria: editClass.categoria, subcategoria: editClass.subcategoria }); setEditClass(null); await runSearch(); }}>Salvar</button>
                <button className="file-change-btn" onClick={() => setEditClass(null)}>Cancelar</button>
              </div>
            </div>
          )}

          {editMov && (
            <div className="search-results" style={{ marginTop: 16 }}>
              <div className="search-header"><h3>Editar Movimento</h3></div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <input className="search-input" style={{ width: 170 }} placeholder="CPF/CNPJ Faturado" value={editMov.faturado_doc || ''} onChange={(e) => setEditMov({ ...editMov, faturado_doc: e.target.value })} />
                <input className="search-input" style={{ width: 170 }} placeholder="CPF/CNPJ Fornecedor" value={editMov.fornecedor_doc || ''} onChange={(e) => setEditMov({ ...editMov, fornecedor_doc: e.target.value })} />
                <input className="search-input" style={{ width: 260 }} placeholder="Faturado Nome" value={editMov.faturado_nome || ''} onChange={(e) => setEditMov({ ...editMov, faturado_nome: e.target.value })} />
                <input className="search-input" style={{ width: 260 }} placeholder="Fornecedor Nome" value={editMov.fornecedor_nome || ''} onChange={(e) => setEditMov({ ...editMov, fornecedor_nome: e.target.value })} />
                <select className="file-change-btn" value={editMov.faturado_tipo || 'FATURADO'} onChange={(e) => setEditMov({ ...editMov, faturado_tipo: e.target.value })}>
                  <option value="FATURADO">Faturado</option>
                  <option value="FORNECEDOR">Fornecedor</option>
                  <option value="CLIENTE">Cliente</option>
                  <option value="FORNECEDOR_CLIENTE">Fornecedor/Cliente</option>
                </select>
                <select className="file-change-btn" value={editMov.fornecedor_tipo || 'FORNECEDOR'} onChange={(e) => setEditMov({ ...editMov, fornecedor_tipo: e.target.value })}>
                  <option value="FORNECEDOR">Fornecedor</option>
                  <option value="FATURADO">Faturado</option>
                  <option value="CLIENTE">Cliente</option>
                  <option value="FORNECEDOR_CLIENTE">Fornecedor/Cliente</option>
                </select>
                <input className="search-input" style={{ width: 160 }} placeholder="Número Documento" value={editMov.numero_documento || ''} onChange={(e) => setEditMov({ ...editMov, numero_documento: e.target.value })} />
                <input className="search-input" style={{ width: 150 }} type="date" placeholder="Data Emissão" value={editMov.data_emissao || ''} onChange={(e) => setEditMov({ ...editMov, data_emissao: e.target.value })} />
                <input className="search-input" style={{ width: 150 }} type="date" placeholder="Data Vencimento" value={editMov.data_vencimento || ''} onChange={(e) => setEditMov({ ...editMov, data_vencimento: e.target.value })} />
                <input className="search-input" style={{ width: 140 }} type="number" step="0.01" placeholder="Valor Total" value={editMov.valor_total !== undefined ? String(editMov.valor_total) : ''} onChange={(e) => setEditMov({ ...editMov, valor_total: Number(e.target.value) })} />
                <select className="file-change-btn" value={editMov.tipo_movimento || 'SAIDA'} onChange={(e) => setEditMov({ ...editMov, tipo_movimento: e.target.value })}>
                  <option value="SAIDA">Saída</option>
                  <option value="ENTRADA">Entrada</option>
                </select>
                <select className="file-change-btn" value={editMov.status_pagamento || 'PENDENTE'} onChange={(e) => setEditMov({ ...editMov, status_pagamento: e.target.value })}>
                  <option value="PENDENTE">Pendente</option>
                  <option value="PAGO">Pago</option>
                  <option value="VENCIDO">Vencido</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
                <input className="search-input" placeholder="Descrição" value={editMov.descricao || ''} onChange={(e) => setEditMov({ ...editMov, descricao: e.target.value })} />
                <input className="search-input" style={{ width: 90 }} placeholder="Parcelas" value={editMov.parcelas_count !== undefined ? String(editMov.parcelas_count) : ''} disabled />
                <button className="create-movement-button" onClick={async () => {
                  await movimentosUpdate(editMov.id, {
                    numero_documento: editMov.numero_documento,
                    data_emissao: editMov.data_emissao,
                    data_vencimento: editMov.data_vencimento,
                    valor_total: editMov.valor_total,
                    tipo_movimento: editMov.tipo_movimento,
                    status_pagamento: editMov.status_pagamento,
                    descricao: editMov.descricao,
                  });
                  if (editMov.fornecedor_id) {
                    await pessoasUpdate(editMov.fornecedor_id, { nome: editMov.fornecedor_nome || '', documento: editMov.fornecedor_doc || '', tipo_relacionamento: editMov.fornecedor_tipo || 'FORNECEDOR' });
                  }
                  if (editMov.faturado_id) {
                    await pessoasUpdate(editMov.faturado_id, { nome: editMov.faturado_nome || '', documento: editMov.faturado_doc || '', tipo_relacionamento: editMov.faturado_tipo || 'FATURADO' });
                  }
                  setEditMov(null);
                  await runSearch();
                }}>Salvar</button>
                <button className="file-change-btn" onClick={() => setEditMov(null)}>Cancelar</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginTop: 12 }}>
                <div className="search-header"><h3>Classificações</h3></div>
                <EditClassifications classifOptions={classifOptions} movId={editMov.id} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginTop: 12 }}>
                <div className="search-header"><h3>Parcelas</h3></div>
                <EditParcelas movId={editMov.id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
  const fmtDate = (s?: string) => {
    if (!s) return 'N/A';
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('pt-BR');
  };

  const fmtDoc = (s?: string) => {
    const digits = String(s || '').replace(/\D+/g, '');
    if (!digits) return 'N/A';
    if (digits.length === 11) {
      return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9,11)}`;
    }
    if (digits.length === 14) {
      return `${digits.slice(0,2)}.${digits.slice(2,5)}.${digits.slice(5,8)}/${digits.slice(8,12)}-${digits.slice(12,14)}`;
    }
    return s || 'N/A';
  };

function EditClassifications({ classifOptions, movId }: { classifOptions: Array<{ id: number; descricao: string }>; movId: number }) {
  const [editClassifId, setEditClassifId] = useState<number | ''>('');
  const [editClassifValor, setEditClassifValor] = useState<number | ''>('');
  const [editClassifPerc, setEditClassifPerc] = useState<number | ''>('');
  const [editClassifJus, setEditClassifJus] = useState<string>('');
  const [editClassifs, setEditClassifs] = useState<Array<{ classificacao_id: number; valor_classificacao: number; percentual?: number; justificativa?: string }>>([]);
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <select className="file-change-btn" value={editClassifId === '' ? '' : String(editClassifId)} onChange={(e) => setEditClassifId(e.target.value ? Number(e.target.value) : '')} style={{ minWidth: 280 }}>
          <option value="">Selecione uma classificação</option>
          {classifOptions.map(c => (
            <option key={c.id} value={c.id}>{c.descricao}</option>
          ))}
        </select>
        <input className="search-input" style={{ width: 140 }} type="number" step="0.01" placeholder="Valor" value={editClassifValor === '' ? '' : String(editClassifValor)} onChange={(e) => setEditClassifValor(e.target.value ? Number(e.target.value) : '')} />
        <input className="search-input" style={{ width: 90 }} type="number" step="0.01" placeholder="%" value={editClassifPerc === '' ? '' : String(editClassifPerc)} onChange={(e) => setEditClassifPerc(e.target.value ? Number(e.target.value) : '')} />
        <input className="search-input" placeholder="Justificativa" value={editClassifJus} onChange={(e) => setEditClassifJus(e.target.value)} />
        <button className="create-movement-button" onClick={() => {
          const cid = typeof editClassifId === 'number' ? editClassifId : 0;
          const vc = typeof editClassifValor === 'number' ? editClassifValor : 0;
          const pc = typeof editClassifPerc === 'number' ? editClassifPerc : undefined;
          const js = editClassifJus || undefined;
          if (!cid || !vc) return;
          setEditClassifs(prev => [...prev, { classificacao_id: cid, valor_classificacao: vc, percentual: pc, justificativa: js }]);
          setEditClassifId(''); setEditClassifValor(''); setEditClassifPerc(''); setEditClassifJus('');
        }}>Adicionar Classificação</button>
        <button className="create-movement-button" onClick={async () => {
          await movimentosAddClassificacoes(movId, editClassifs);
          setEditClassifs([]);
        }}>Salvar Classificações</button>
      </div>
      {editClassifs.length > 0 && (
        <table className="json-data" style={{ width: '100%' }}>
          <thead><tr><th>ID</th><th>Valor</th><th>%</th><th>Justificativa</th><th></th></tr></thead>
          <tbody>
            {editClassifs.map((c, idx) => (
              <tr key={`ec-${idx}`}>
                <td>{c.classificacao_id}</td>
                <td>{`R$ ${c.valor_classificacao.toFixed(2)}`}</td>
                <td>{c.percentual ?? ''}</td>
                <td>{c.justificativa ?? ''}</td>
                <td><button className="file-change-btn" onClick={() => setEditClassifs(prev => prev.filter((_, i) => i !== idx))}>Remover</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function EditParcelas({ movId }: { movId: number }) {
  const [editParcelaNum, setEditParcelaNum] = useState<number | ''>('');
  const [editParcelaVenc, setEditParcelaVenc] = useState<string>('');
  const [editParcelaValor, setEditParcelaValor] = useState<number | ''>('');
  const [editParcelas, setEditParcelas] = useState<Array<{ numero_parcela: number; data_vencimento: string; valor_parcela: number }>>([]);
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input className="search-input" style={{ width: 120 }} placeholder="Nº Parcela" value={editParcelaNum === '' ? '' : String(editParcelaNum)} onChange={(e) => setEditParcelaNum(e.target.value ? Number(e.target.value) : '')} />
        <input className="search-input" style={{ width: 150 }} type="date" placeholder="Vencimento" value={editParcelaVenc} onChange={(e) => setEditParcelaVenc(e.target.value)} />
        <input className="search-input" style={{ width: 140 }} type="number" step="0.01" placeholder="Valor Parcela" value={editParcelaValor === '' ? '' : String(editParcelaValor)} onChange={(e) => setEditParcelaValor(e.target.value ? Number(e.target.value) : '')} />
        <button className="create-movement-button" onClick={() => {
          const n = typeof editParcelaNum === 'number' ? editParcelaNum : 0;
          const dv = editParcelaVenc;
          const vp = typeof editParcelaValor === 'number' ? editParcelaValor : 0;
          if (!n || !dv || !vp) return;
          setEditParcelas(prev => [...prev, { numero_parcela: n, data_vencimento: dv, valor_parcela: vp }]);
          setEditParcelaNum(''); setEditParcelaVenc(''); setEditParcelaValor('');
        }}>Adicionar Parcela</button>
        <button className="create-movement-button" onClick={async () => {
          await movimentosAddParcelas(movId, editParcelas);
          setEditParcelas([]);
        }}>Salvar Parcelas</button>
      </div>
      {editParcelas.length > 0 && (
        <table className="json-data" style={{ width: '100%' }}>
          <thead><tr><th>Nº</th><th>Vencimento</th><th>Valor</th><th></th></tr></thead>
          <tbody>
            {editParcelas.map((p, idx) => (
              <tr key={`ep-${idx}`}>
                <td>{p.numero_parcela}</td>
                <td>{p.data_vencimento}</td>
                <td>{`R$ ${p.valor_parcela.toFixed(2)}`}</td>
                <td><button className="file-change-btn" onClick={() => setEditParcelas(prev => prev.filter((_, i) => i !== idx))}>Remover</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

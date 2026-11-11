import React, { useState, useRef } from 'react';
import { Banca, Bloco, Materia } from '../types';
import {
  BLOCOS_EAP_OFICIAIS,
  auditarCoberturaEap,
  BlocoEapOficial,
  StatusAssuntoEap,
} from '../utils/eapEstrutura';
import { extractTextFromPdf } from '../services/geminiService';

interface PainelEapPremissasProps {
  bancas: Banca[];
  blocos: Bloco[];
  materias: Materia[];
  bancaSelecionadaId?: string | number;
  onSelecionarBanca?: (banca: Banca) => void;
  onNovaBancaClick: () => void;
  onSalvarMateriaDoAssunto: (dados: {
    blocoNome: string;
    blocoId?: string | number;
    nome: string;
    arquivoNome: string;
    arquivoTexto: string;
    arquivoBase64?: string;
    arquivoTipo: string;
    tamanhoBytes: number;
  }) => Promise<void>;
  onExcluirMateria: (materiaId: string | number) => Promise<void>;
  onAlternarModoClassico?: () => void;
}

export const PainelEapPremissas: React.FC<PainelEapPremissasProps> = ({
  bancas,
  blocos,
  materias,
  bancaSelecionadaId,
  onSelecionarBanca,
  onNovaBancaClick,
  onSalvarMateriaDoAssunto,
  onExcluirMateria,
  onAlternarModoClassico,
}) => {
  // Relatório de auditoria que cruza os 34 assuntos canônicos com as matérias cadastradas
  const auditoria = auditarCoberturaEap(materias);

  // Estados dos acordeons de blocos (por padrão todos abertos para conferência ágil)
  const [blocosAbertos, setBlocosAbertos] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
  });

  // Estado para upload direto em um assunto da EAP
  const [assuntoFazendoUpload, setAssuntoFazendoUpload] = useState<string | null>(null);
  const [mensagemUpload, setMensagemUpload] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Matéria selecionada para visualização do texto
  const [materiaVisualizando, setMateriaVisualizando] = useState<Materia | null>(null);

  // Filtro de visualização: todos | com_pdf | sem_pdf
  const [filtroVisualizacao, setFiltroVisualizacao] = useState<'todos' | 'com_pdf' | 'sem_pdf'>('todos');

  // Alterna bloco
  const toggleBloco = (numero: number) => {
    setBlocosAbertos((prev) => ({ ...prev, [numero]: !prev[numero] }));
  };

  const expandirTodos = () => {
    const todos: Record<number, boolean> = {};
    BLOCOS_EAP_OFICIAIS.forEach((b) => (todos[b.numero] = true));
    setBlocosAbertos(todos);
  };

  const recolherTodos = () => {
    const todos: Record<number, boolean> = {};
    BLOCOS_EAP_OFICIAIS.forEach((b) => (todos[b.numero] = false));
    setBlocosAbertos(todos);
  };

  // Upload direto de PDF vinculado ao assunto
  const handleFileChange = async (
    item: StatusAssuntoEap,
    blocoOficial: BlocoEapOficial,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const codigo = item.pdf.codigo;
    setAssuntoFazendoUpload(codigo);
    setMensagemUpload(`Extraindo texto do PDF: ${file.name}...`);

    try {
      let arquivoTexto = '';
      let arquivoBase64 = '';
      const isTxt = file.name.endsWith('.txt') || file.type === 'text/plain';

      if (isTxt) {
        arquivoTexto = await file.text();
      } else {
        try {
          arquivoTexto = await extractTextFromPdf(file);
        } catch (errPdf) {
          console.warn(`Falha na extração direta de texto do PDF ${file.name}, usando fallback base64:`, errPdf);
        }
      }

      // Converte para base64 como garantia para envio à IA
      if (file.size < 35 * 1024 * 1024) {
        try {
          arquivoBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string) || '');
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        } catch (errB64) {
          console.warn('Falha ao ler base64:', errB64);
        }
      }

      // Localiza bloco equivalente em blocos cadastrados se existir
      const blocoDb = blocos.find(
        (b) =>
          b.nome.toLowerCase().includes(`bloco ${blocoOficial.numero}`) ||
          b.nome.toLowerCase().includes(blocoOficial.codigo.toLowerCase())
      );

      setMensagemUpload(`Salvando assunto ${codigo} em Premissas...`);

      await onSalvarMateriaDoAssunto({
        blocoNome: blocoOficial.titulo,
        blocoId: blocoDb?.id,
        nome: `${item.pdf.codigo}_${item.pdf.nome.replace(/^\d+_/, '')}`,
        arquivoNome: file.name,
        arquivoTexto,
        arquivoBase64,
        arquivoTipo: file.type || (isTxt ? 'text/plain' : 'application/pdf'),
        tamanhoBytes: file.size,
      });

      setMensagemUpload(null);
    } catch (err: any) {
      alert(`Erro ao carregar PDF do assunto ${codigo}: ` + (err.message || 'Falha'));
    } finally {
      setAssuntoFazendoUpload(null);
      if (fileInputRefs.current[codigo]) {
        fileInputRefs.current[codigo]!.value = '';
      }
    }
  };

  // Localiza a banca selecionada ou seleciona a padrão FAFIPA Paramétrico
  const bancaAtiva =
    bancas.find((b) => String(b.id) === String(bancaSelecionadaId)) ||
    bancas.find((b) => b.nome.toLowerCase().includes('paramétrico') || b.nome.toLowerCase().includes('parametrico')) ||
    bancas.find((b) => b.nome.toLowerCase().includes('fafipa')) ||
    bancas[0] || {
      id: 'fafipa-parametrico',
      nome: 'FAFIPA Paramétrico',
      cargo: 'Engenheiro Civil',
      obs: 'Perfil paramétrico oficial calibrado com 40 questões, zero cálculos e gabarito balanceado.',
      arquivos: [],
    };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ---------------------------------------------------- */}
      {/* NÍVEL 1 DA EAP: BANCA & COBERTURA GLOBAL             */}
      {/* ---------------------------------------------------- */}
      <div className="bg-[#101726] border border-[#1e293b] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e293b] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Nível 1 · Topo da EAP
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Estrutura Analítica do Projeto (EAP)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <i className="fa-solid fa-sitemap text-amber-400"></i>
              <span>{bancaAtiva.nome}</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Cargo alvo: <span className="text-gray-200 font-semibold">{bancaAtiva.cargo || 'Engenheiro Civil'}</span> ·
              Prefeitura de Curitiba (Prova Real)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Seletor rápido de Bancas caso existam outras cadastradas */}
            {bancas.length > 1 && (
              <select
                value={bancaAtiva.id}
                onChange={(e) => {
                  const encontrada = bancas.find((b) => String(b.id) === e.target.value);
                  if (encontrada && onSelecionarBanca) onSelecionarBanca(encontrada);
                }}
                className="bg-[#0b1220] border border-[#1e293b] text-xs text-gray-200 px-3 py-2 rounded-xl focus:border-amber-500 focus:outline-none"
              >
                {bancas.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nome}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={onNovaBancaClick}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#1a253a] hover:bg-[#22314d] text-white border border-[#2b3b5c] transition flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-plus text-amber-400"></i>
              <span>Nova Banca</span>
            </button>

            {onAlternarModoClassico && (
              <button
                type="button"
                onClick={onAlternarModoClassico}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-gray-200 bg-[#0a0f1d] border border-[#1e293b] transition flex items-center gap-1.5 cursor-pointer"
                title="Alterna para a interface clássica de formulários avulsos"
              >
                <i className="fa-solid fa-table-list"></i>
                <span className="hidden sm:inline">Modo Clássico</span>
              </button>
            )}
          </div>
        </div>

        {/* Cards de Métricas da EAP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="bg-[#0b1220] border border-[#1e293b] p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Blocos Oficiais
            </span>
            <div className="text-xl font-black text-white font-mono mt-0.5">
              {auditoria.blocos.length} Blocos
            </div>
            <span className="text-[10px] text-gray-500 block mt-0.5">
              100% estruturados
            </span>
          </div>

          <div className="bg-[#0b1220] border border-[#1e293b] p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Assuntos do Edital
            </span>
            <div className="text-xl font-black text-cyan-400 font-mono mt-0.5">
              {auditoria.totalAssuntos} Assuntos
            </div>
            <span className="text-[10px] text-gray-500 block mt-0.5">
              Códigos 101 a 734
            </span>
          </div>

          <div className="bg-[#0b1220] border border-[#1e293b] p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              PDFs Carregados
            </span>
            <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
              {auditoria.totalComPdf} / {auditoria.totalAssuntos}
            </div>
            <span className="text-[10px] text-gray-500 block mt-0.5">
              {auditoria.totalSemPdf} pendentes via IA
            </span>
          </div>

          <div className="bg-[#0b1220] border border-[#1e293b] p-3.5 rounded-xl">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Cobertura da EAP
            </span>
            <div className="text-xl font-black text-amber-400 font-mono mt-0.5">
              {auditoria.percentualCobertura}%
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${auditoria.percentualCobertura}%` }}
              />
            </div>
          </div>
        </div>

        {/* Banner Informativo do Modo Híbrido com Aviso Transparente */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#0b1424] border border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <i className="fa-solid fa-shield-halved text-amber-400 text-base mt-0.5 shrink-0"></i>
            <div>
              <span className="font-bold text-white block">
                {auditoria.totalSemPdf > 0
                  ? `Modo Híbrido Ativo: ${auditoria.totalComPdf} PDFs carregados · ${auditoria.totalSemPdf} assuntos gerenciados pela IA Paramétrica oficial`
                  : `EAP 100% Coberta: Todos os ${auditoria.totalAssuntos} PDFs oficiais estão carregados no sistema!`}
              </span>
              <p className="text-gray-400 text-[11px] mt-0.5">
                {auditoria.totalSemPdf > 0
                  ? 'Você não precisa subir todos os arquivos de uma vez. Para os assuntos ainda sem PDF, a IA FAFIPA gera as questões com base no escopo canônico e tópicos fundamentais da EAP.'
                  : 'Todas as questões dos simulados e sessões serão formuladas com base no texto exato dos PDFs subidos.'}
              </p>
            </div>
          </div>

          {/* Filtros rápidos de exibição */}
          <div className="flex items-center gap-1.5 bg-[#0e1726] p-1 rounded-lg border border-[#1e293b] shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setFiltroVisualizacao('todos')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                filtroVisualizacao === 'todos'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Todos ({auditoria.totalAssuntos})
            </button>
            <button
              type="button"
              onClick={() => setFiltroVisualizacao('com_pdf')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                filtroVisualizacao === 'com_pdf'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Com PDF ({auditoria.totalComPdf})
            </button>
            <button
              type="button"
              onClick={() => setFiltroVisualizacao('sem_pdf')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                filtroVisualizacao === 'sem_pdf'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sem PDF ({auditoria.totalSemPdf})
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* NÍVEL 2 DA EAP: OS 7 BLOCOS OFICIAIS                 */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-folder-tree text-amber-400"></i>
            <span>Nível 2 · Os 7 Blocos Oficiais da EAP</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Estrutura canônica de acordo com a pasta de estudos e o edital de Curitiba
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={expandirTodos}
            className="text-gray-400 hover:text-white px-2 py-1 rounded bg-[#101726] border border-[#1e293b] transition cursor-pointer"
          >
            Expandir Todos
          </button>
          <button
            type="button"
            onClick={recolherTodos}
            className="text-gray-400 hover:text-white px-2 py-1 rounded bg-[#101726] border border-[#1e293b] transition cursor-pointer"
          >
            Recolher Todos
          </button>
        </div>
      </div>

      {/* Lista dos 7 Blocos em Acordeom Hierárquico */}
      <div className="space-y-4">
        {auditoria.blocos.map((blocoRelatorio) => {
          const { bloco, assuntos, comPdf, totalAssuntos, percentual } = blocoRelatorio;
          const estaAberto = Boolean(blocosAbertos[bloco.numero]);

          // Filtra os assuntos conforme o toggle do usuário
          const assuntosFiltrados = assuntos.filter((item) => {
            if (filtroVisualizacao === 'com_pdf') return item.temPdfSalvo;
            if (filtroVisualizacao === 'sem_pdf') return !item.temPdfSalvo;
            return true;
          });

          return (
            <div
              key={bloco.numero}
              className="bg-[#101726] border border-[#1e293b] rounded-2xl overflow-hidden transition-all duration-200"
            >
              {/* Header do Bloco (Nível 2) */}
              <div
                onClick={() => toggleBloco(bloco.numero)}
                className="p-4 sm:p-5 bg-[#131d31] hover:bg-[#16233c] cursor-pointer flex items-center justify-between gap-4 transition select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-sm shrink-0 ${
                      bloco.tipo === 'basica'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    0{bloco.numero}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-bold text-white truncate">
                        {bloco.titulo}
                      </span>
                      {bloco.tipo === 'basica' && (
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-blue-950/80 text-blue-300 border border-blue-800/60">
                          Básicas
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {bloco.subtitulo}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Badge de Cobertura */}
                  <div className="text-right hidden sm:block">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                        comPdf === totalAssuntos
                          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60'
                          : comPdf > 0
                          ? 'bg-amber-950/70 text-amber-300 border-amber-700/60'
                          : 'bg-slate-800 text-gray-400 border-slate-700'
                      }`}
                    >
                      {comPdf} / {totalAssuntos} PDFs ({percentual}%)
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center text-gray-400">
                    <i
                      className={`fa-solid fa-chevron-down transition-transform duration-200 text-xs ${
                        estaAberto ? 'rotate-180 text-white' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* NÍVEL 3 DA EAP: ASSUNTOS DO BLOCO */}
              {estaAberto && (
                <div className="p-4 sm:p-5 border-t border-[#1e293b] space-y-3 bg-[#0b1220]/60">
                  {assuntosFiltrados.length === 0 ? (
                    <div className="text-xs text-gray-500 text-center py-4 italic">
                      Nenhum assunto neste bloco corresponde ao filtro &quot;{filtroVisualizacao}&quot;.
                    </div>
                  ) : (
                    assuntosFiltrados.map((item) => {
                      const { pdf, temPdfSalvo, materiaSalva } = item;
                      const estaCarregando = assuntoFazendoUpload === pdf.codigo;

                      return (
                        <div
                          key={pdf.codigo}
                          className="bg-[#101726] border border-[#1e293b] hover:border-slate-700 rounded-xl p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition"
                        >
                          {/* Info do Assunto */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                                {pdf.codigo}
                              </span>
                              <span className="font-bold text-white text-sm">
                                {pdf.nome.replace(/^\d+_/, '').replace(/_/g, ' ')}
                              </span>
                              {temPdfSalvo ? (
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                                  <i className="fa-solid fa-check text-[9px]"></i>
                                  PDF Vinculado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60">
                                  <i className="fa-solid fa-bolt text-[9px]"></i>
                                  IA Paramétrica
                                </span>
                              )}
                            </div>

                            {/* Tópicos Fundamentais do Assunto */}
                            <div className="text-[11px] text-gray-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="text-gray-500">Escopo da prova:</span>
                              {pdf.topicosFundamentais.map((t, idx) => (
                                <span key={idx} className="text-gray-300 bg-slate-800/60 px-1.5 py-0.5 rounded text-[10px]">
                                  {t}
                                </span>
                              ))}
                            </div>

                            {/* Nome do arquivo salvo se houver */}
                            {temPdfSalvo && materiaSalva && (
                              <div className="text-[11px] text-emerald-400/90 mt-1.5 flex items-center gap-2 font-mono">
                                <i className="fa-solid fa-file-pdf text-emerald-400"></i>
                                <span className="truncate">{materiaSalva.arquivoNome}</span>
                                {materiaSalva.tamanhoBytes && (
                                  <span className="text-gray-500 text-[10px]">
                                    ({Math.round(materiaSalva.tamanhoBytes / 1024)} KB)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Ações do Assunto */}
                          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                            {/* Input Oculto de Arquivo */}
                            <input
                              type="file"
                              accept=".pdf,.txt"
                              ref={(el) => {
                                fileInputRefs.current[pdf.codigo] = el;
                              }}
                              onChange={(e) => handleFileChange(item, bloco, e)}
                              className="hidden"
                            />

                            {estaCarregando ? (
                              <div className="text-xs text-amber-300 bg-amber-950/50 px-3 py-1.5 rounded-lg border border-amber-700/60 flex items-center gap-2">
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                <span>{mensagemUpload || 'Processando...'}</span>
                              </div>
                            ) : temPdfSalvo && materiaSalva ? (
                              <>
                                {materiaSalva.arquivoTexto && (
                                  <button
                                    type="button"
                                    onClick={() => setMateriaVisualizando(materiaSalva)}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition flex items-center gap-1 cursor-pointer"
                                    title="Visualizar texto extraído do PDF"
                                  >
                                    <i className="fa-solid fa-eye text-cyan-400"></i>
                                    <span className="hidden sm:inline">Ver Texto</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => fileInputRefs.current[pdf.codigo]?.click()}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition flex items-center gap-1 cursor-pointer"
                                  title="Substituir PDF deste assunto"
                                >
                                  <i className="fa-solid fa-arrow-up-from-bracket"></i>
                                  <span className="hidden sm:inline">Substituir</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (
                                      confirm(
                                        `Deseja desvincular o arquivo do assunto ${pdf.codigo}? Ele passará a ser gerado via IA Paramétrica.`
                                      )
                                    ) {
                                      await onExcluirMateria(materiaSalva.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-xs text-gray-400 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                                  title="Remover PDF deste assunto"
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => fileInputRefs.current[pdf.codigo]?.click()}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <i className="fa-solid fa-cloud-arrow-up"></i>
                                <span>Subir PDF</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de Leitura / Visualização do Texto do PDF */}
      {materiaVisualizando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#101726] border border-[#1e293b] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#1e293b] bg-[#131d31] flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <i className="fa-solid fa-file-lines text-amber-400"></i>
                  <span>{materiaVisualizando.nome}</span>
                </h4>
                <p className="text-[11px] text-gray-400 font-mono">
                  {materiaVisualizando.arquivoNome} · {materiaVisualizando.blocoNome}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMateriaVisualizando(null)}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-gray-300 whitespace-pre-wrap leading-relaxed bg-[#0b1220]">
              {materiaVisualizando.arquivoTexto || 'Nenhum texto extraído armazenado para este arquivo.'}
            </div>

            <div className="p-3 border-t border-[#1e293b] bg-[#131d31] flex justify-end">
              <button
                type="button"
                onClick={() => setMateriaVisualizando(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

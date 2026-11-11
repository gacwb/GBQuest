import React from 'react';
import {
  ResultadoDistribuicaoSimulado,
  METRICAS_PROVA_REAL,
} from '../utils/simuladoPonderado';
import { Materia } from '../types';
import { auditarCoberturaEap } from '../utils/eapEstrutura';

interface ModalConferenciaSimuladoProps {
  aberto: boolean;
  onClose: () => void;
  distribuicao: ResultadoDistribuicaoSimulado;
  onSortearNovamente: () => void;
  modoFonte: 'ineditas' | 'banco';
  onChangeModoFonte: (modo: 'ineditas' | 'banco') => void;
  onIniciarSimulado: () => void;
  iniciando: boolean;
  progressoGeracao?: string;
  mapaDisponibilidadeBanco?: Record<string, number>;
  materias?: Materia[];
}

export const ModalConferenciaSimulado: React.FC<ModalConferenciaSimuladoProps> = ({
  aberto,
  onClose,
  distribuicao,
  onSortearNovamente,
  modoFonte,
  onChangeModoFonte,
  onIniciarSimulado,
  iniciando,
  progressoGeracao,
  mapaDisponibilidadeBanco = {},
  materias = [],
}) => {
  if (!aberto) return null;

  const itensComQuestoes = distribuicao.itens.filter((item) => item.quantidade > 0);
  const auditoriaEap = auditarCoberturaEap(materias);
  const mapaItensComPdf = new Map<string, { temPdf: boolean; nomeArquivo?: string }>();
  auditoriaEap.itens.forEach((st) => {
    mapaItensComPdf.set(st.pdf.codigo, {
      temPdf: st.temPdfSalvo,
      nomeArquivo: st.materiaSalva?.arquivoNome,
    });
  });

  const totalAssuntosRodada = itensComQuestoes.length;
  const assuntosComPdfNaRodada = itensComQuestoes.filter(
    (it) => mapaItensComPdf.get(it.pdf.codigo)?.temPdf
  ).length;
  const assuntosSemPdfNaRodada = totalAssuntosRodada - assuntosComPdfNaRodada;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#101726] border border-[#1e293b] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#1e293b] bg-[#131d31] flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PROVA REAL
              </span>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Simulado Oficial: FAFIPA — Curitiba (Eng. Civil)
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-1 flex flex-wrap items-center gap-3">
              <span>
                <i className="fa-solid fa-clock text-cyan-400 mr-1"></i>
                4h total (30 min gabarito · 3h30 líquidas)
              </span>
              <span>•</span>
              <span className="text-amber-300 font-semibold">
                <i className="fa-solid fa-bullseye text-amber-400 mr-1"></i>
                Meta de aprovação: {METRICAS_PROVA_REAL.META_APROVACAO_PCT}%
              </span>
              <span>•</span>
              <span className="text-emerald-300 font-mono">
                <i className="fa-solid fa-gauge-high text-emerald-400 mr-1"></i>
                Ritmo alvo: 5:15 m/q
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={iniciando}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/60 transition cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Seletor de Fonte: Gerar Inéditas vs Captar do Banco */}
          <div className="bg-[#0b1220] border border-[#1e293b] p-4 rounded-xl">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2.5">
              Fonte das Questões do Simulado
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onChangeModoFonte('ineditas')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  modoFonte === 'ineditas'
                    ? 'border-amber-500 bg-amber-500/10 text-white shadow-lg'
                    : 'border-[#1e293b] bg-[#131b2e]/60 text-gray-400 hover:text-gray-200 hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    modoFonte === 'ineditas' ? 'border-amber-400 bg-amber-500' : 'border-gray-600'
                  }`}
                >
                  {modoFonte === 'ineditas' && <div className="w-2 h-2 rounded-full bg-slate-950" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <i className="fa-solid fa-bolt text-amber-400"></i>
                    Gerar Questões Inéditas
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Gera questões inéditas via IA para as cotas dos PDFs e adiciona ao banco
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onChangeModoFonte('banco')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  modoFonte === 'banco'
                    ? 'border-blue-500 bg-blue-500/10 text-white shadow-lg'
                    : 'border-[#1e293b] bg-[#131b2e]/60 text-gray-400 hover:text-gray-200 hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    modoFonte === 'banco' ? 'border-blue-400 bg-blue-500' : 'border-gray-600'
                  }`}
                >
                  {modoFonte === 'banco' && <div className="w-2 h-2 rounded-full bg-slate-950" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <i className="fa-solid fa-layer-group text-blue-400"></i>
                    Captar do Banco
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Sorteia questões já cadastradas no acervo do banco de dados
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Cards de Resumo da Distribuição */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#131b2e] border border-[#1e293b] p-3 rounded-xl text-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Língua Portuguesa
              </span>
              <span className="text-lg font-black text-blue-400 font-mono">
                {distribuicao.totalPortugues} questões
              </span>
            </div>
            <div className="bg-[#131b2e] border border-[#1e293b] p-3 rounded-xl text-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Noções de Informática
              </span>
              <span className="text-lg font-black text-cyan-400 font-mono">
                {distribuicao.totalInformatica} questões
              </span>
            </div>
            <div className="bg-[#131b2e] border border-[#1e293b] p-3 rounded-xl text-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Engenharia Civil
              </span>
              <span className="text-lg font-black text-amber-400 font-mono">
                {distribuicao.totalEspecificas} questões
              </span>
            </div>
          </div>

          {/* Selos do DNA da Banca FAFIPA e Balanceamento de Gabarito */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#0d1e38] via-[#101b33] to-[#121c2e] border border-blue-900/50 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <i className="fa-solid fa-dna text-amber-400"></i>
                Perfil Paramétrico FAFIPA (Curitiba)
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] px-2 py-0.5 rounded font-bold font-mono bg-rose-950/70 text-rose-300 border border-rose-800/60 flex items-center gap-1">
                  <i className="fa-solid fa-ban text-[9px]"></i>
                  Zero Cálculos nas Específicas
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold font-mono bg-emerald-950/70 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
                  <i className="fa-solid fa-scale-balanced text-[9px]"></i>
                  Gabarito 8A · 8B · 8C · 8D · 8E
                </span>
              </div>
            </div>
            <div className="text-[11px] text-gray-400 flex flex-wrap items-center gap-2 pt-0.5 border-t border-slate-800/80">
              <span className="text-gray-300">Tipologias da Banca:</span>
              <span className="text-blue-300 font-mono font-semibold">22 Diretas Positivas (55%)</span>
              <span>•</span>
              <span className="text-purple-300 font-mono font-semibold">7 Itens I-II-III (18%)</span>
              <span>•</span>
              <span className="text-amber-300 font-mono font-semibold">5 Negativas/EXCETO (12%)</span>
              <span>•</span>
              <span className="text-emerald-300 font-mono font-semibold">3 Lacunas (8%)</span>
              <span>•</span>
              <span className="text-cyan-300 font-mono font-semibold">3 V ou F (7%)</span>
            </div>
          </div>

          {/* Banner de Auditoria da EAP e Modo Híbrido */}
          <div className="p-3.5 rounded-xl bg-[#0b1322] border border-amber-500/30 flex flex-col gap-2.5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-folder-tree text-amber-400 text-sm shrink-0"></i>
                <span className="font-bold text-white text-[13px]">
                  Auditoria da EAP: {auditoriaEap.totalComPdf} de {auditoriaEap.totalAssuntos} PDFs Cadastrados ({auditoriaEap.percentualCobertura}% de cobertura)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
                  {auditoriaEap.totalComPdf === auditoriaEap.totalAssuntos ? 'EAP 100% Coberta' : 'Modo Híbrido Ativo'}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950/70 text-blue-300 border border-blue-800/60">
                  Simulado Oficial: 40 Questões
                </span>
              </div>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed border-t border-slate-800/70 pt-2">
              <span className="text-amber-300 font-semibold">Estrutura Canônica da Prova:</span> Questões <b>01 a 05</b> (Português), <b>06 a 10</b> (Informática) e <b>11 a 40</b> (Específicas de Engenharia Civil embaralhadas). Nesta rodada, as <b>40 questões</b> foram distribuídas em <b>{itensComQuestoes.length} tópicos estratégicos</b> conforme os pesos do edital FAFIPA.
              {assuntosSemPdfNaRodada > 0 && (
                <span className="text-amber-200 block mt-1">
                  Nota: {assuntosSemPdfNaRodada} assunto(s) desta rodada não possuem PDF anexado e serão complementados automaticamente pela IA Paramétrica.
                </span>
              )}
            </p>
          </div>

          {/* Tabela de Conferência dos PDFs Sorteados para a Rodada */}
          <div className="bg-[#0b1220] border border-[#1e293b] rounded-xl overflow-hidden">
            <div className="p-3 bg-[#131d31] border-b border-[#1e293b] flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-list-ol text-amber-400"></i>
                  Composição da Prova Oficial ({distribuicao.totalQuestoes} Questões em {itensComQuestoes.length} Tópicos)
                </div>
                <div className="text-[10px] text-gray-400">
                  Tópicos de maior peso recebem 2 questões cada, somando exatamente o lote oficial de 40 questões
                </div>
              </div>
              <button
                type="button"
                onClick={onSortearNovamente}
                disabled={iniciando}
                className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition cursor-pointer"
                title="Gera outra rodada mantendo as proporções e rodando a roleta aleatória"
              >
                <i className="fa-solid fa-arrows-rotate text-[11px]"></i>
                Sortear Novamente
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-[#1e293b]/60">
              {itensComQuestoes.map((item) => {
                const disponiveis = mapaDisponibilidadeBanco[item.pdf.codigo] ?? 0;
                const ehMenorQue1 = item.pdf.pesoEstimado < 1.0;
                const statusPdf = mapaItensComPdf.get(item.pdf.codigo);

                return (
                  <div
                    key={item.pdf.codigo}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-[#131b2e]/40 transition text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-amber-400 text-[11px] bg-[#1a2333] px-1.5 py-0.5 rounded border border-[#2b374e]">
                          {item.pdf.codigo}
                        </span>
                        <span className="text-white font-medium truncate">
                          {item.pdf.nome.replace(/^\d+_/, '').replace(/_/g, ' ')}
                        </span>
                        {statusPdf?.temPdf ? (
                          <span
                            className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 font-semibold"
                            title={`PDF salvo em Premissas: ${statusPdf.nomeArquivo || ''}`}
                          >
                            <i className="fa-solid fa-check text-[8px] mr-0.5"></i>
                            PDF em Premissas
                          </span>
                        ) : (
                          <span
                            className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950/70 text-amber-300 border border-amber-800/60 font-semibold"
                            title="Assunto sem PDF subido: a IA gerará usando o escopo e tópicos canônicos da EAP."
                          >
                            <i className="fa-solid fa-bolt text-[8px] mr-0.5"></i>
                            IA Paramétrica
                          </span>
                        )}
                        {ehMenorQue1 && (
                          <span
                            className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950/70 text-purple-300 border border-purple-800/60 font-semibold"
                            title={`Assunto com peso residual sorteado na roleta estocástica. Foco nos conceitos fundamentais:\n• ${item.pdf.topicosFundamentais.join('\n• ')}`}
                          >
                            <i className="fa-solid fa-dice text-[8px] mr-1"></i>
                            Conceitos Fundamentais
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate mt-0.5">
                        {item.pdf.blocoNome}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {modoFonte === 'banco' && (
                        <div
                          className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                            disponiveis >= item.quantidade
                              ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-800/50'
                              : 'text-amber-400 bg-amber-950/50 border border-amber-800/50'
                          }`}
                        >
                          {disponiveis} no banco
                        </div>
                      )}

                      <div className="text-right">
                        <span className="font-mono font-bold text-white text-sm">
                          {item.quantidade}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-1">
                          {item.quantidade === 1 ? 'questão' : 'questões'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alerta de Progresso se estiver gerando via IA */}
          {iniciando && progressoGeracao && (
            <div className="bg-amber-950/40 border border-amber-600/50 rounded-xl p-3 flex items-center gap-3 animate-pulse">
              <i className="fa-solid fa-spinner fa-spin text-amber-400 text-lg"></i>
              <div className="text-xs text-amber-200 font-medium">{progressoGeracao}</div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#1e293b] bg-[#131d31] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-gray-400">
            Total selecionado:{' '}
            <span className="font-bold text-white font-mono">{distribuicao.totalQuestoes} questões</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={iniciando}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onIniciarSimulado}
              disabled={iniciando}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {iniciando ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Preparando Simulado...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-play"></i>
                  <span>Iniciar Simulado Real</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

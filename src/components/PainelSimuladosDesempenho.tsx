import React from 'react';
import { MetricasDesempenhoSimulados } from '../utils/simuladoPonderado';
import { SessaoCriada } from '../types';

interface PainelSimuladosDesempenhoProps {
  statsSimulados: MetricasDesempenhoSimulados;
  sessoesCriadas: SessaoCriada[];
  abrirConferenciaSimulado: () => void;
  iniciarSessaoAtiva: (
    ids: any[],
    assunto: string,
    sessao?: SessaoCriada,
    modoRevisao?: boolean
  ) => void;
  formatarTempoHorasMinutos: (segundos: number) => string;
  onPurgarSimulados?: () => Promise<void>;
}

export const PainelSimuladosDesempenho: React.FC<PainelSimuladosDesempenhoProps> = ({
  statsSimulados,
  sessoesCriadas,
  abrirConferenciaSimulado,
  iniciarSessaoAtiva,
  formatarTempoHorasMinutos,
  onPurgarSimulados,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Diagnóstico das Metas Oficiais da Prova FAFIPA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meta de Aprovação (98%) */}
        <div className="bg-[#131b2e] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <i className="fa-solid fa-bullseye text-base"></i>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Meta de Aprovação</h3>
                <p className="text-xs text-gray-400">FAFIPA Curitiba &bull; Engenheiro Civil</p>
              </div>
            </div>
            <span className="text-xs font-mono font-black px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Meta: 98% (39/40)
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Taxa Atual nos Simulados:</span>
              <span className="font-mono font-bold text-white">{statsSimulados.taxaAcertoMedia}%</span>
            </div>
            <div className="w-full bg-[#0a0f1d] border border-[#1e293b] h-3.5 rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  statsSimulados.metaAprovacaoAtingida
                    ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                }`}
                style={{ width: `${Math.min(100, statsSimulados.taxaAcertoMedia)}%` }}
              ></div>
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-rose-400 z-10 shadow"
                style={{ left: '98%' }}
                title="Linha da Meta: 98%"
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-gray-500">
              <span>0%</span>
              <span className="text-rose-400 font-bold font-mono">Meta: 98%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#0a0f1d] border border-[#1e293b] text-xs text-gray-300">
            {statsSimulados.metaAprovacaoAtingida ? (
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <i className="fa-solid fa-circle-check text-sm"></i>
                <span>Parabéns! Sua taxa média de acerto está dentro da zona de corte de aprovação (&ge; 98%).</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-400">
                <i className="fa-solid fa-circle-info text-amber-400 text-sm"></i>
                <span>
                  Para atingir 98%, é tolerado no máximo <strong>1 erro a cada 40 questões</strong> (39 acertos).
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Ritmo Oficial de Resolução (5:15 m/q) */}
        <div className="bg-[#131b2e] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <i className="fa-solid fa-stopwatch text-base"></i>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Ritmo da Prova Real</h3>
                <p className="text-xs text-gray-400">210 min líquidos (30 min reservados para gabarito)</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
              Limite: 5:15 m/q
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Ritmo Médio do Candidato:</span>
              <span className="font-mono font-bold text-white">{statsSimulados.minutosPorQuestaoFormatado}</span>
            </div>
            <div className="w-full bg-[#0a0f1d] border border-[#1e293b] h-3.5 rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  statsSimulados.dentroDoRitmoLimite
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                    : 'bg-gradient-to-r from-rose-600 to-red-500'
                }`}
                style={{
                  width: `${Math.min(100, (statsSimulados.segundosPorQuestaoMedio / 315) * 100)}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-gray-500">
              <span>0:00 m/q</span>
              <span className="text-blue-400 font-bold font-mono">Limite: 5:15 m/q (315s)</span>
              <span>8:00 m/q</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#0a0f1d] border border-[#1e293b] text-xs text-gray-300">
            {statsSimulados.totalSimuladosConcluidos === 0 ? (
              <span className="text-gray-400">
                Nenhum simulado concluído ainda. Realize a primeira prova para cronometrar seu ritmo oficial.
              </span>
            ) : statsSimulados.dentroDoRitmoLimite ? (
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <i className="fa-solid fa-gauge text-sm"></i>
                <span>
                  Excelente! Ritmo seguro com{' '}
                  <strong>
                    {Math.floor(statsSimulados.folgaSegundosPorQuestao / 60)}m{' '}
                    {statsSimulados.folgaSegundosPorQuestao % 60}s
                  </strong>{' '}
                  de folga por questão vs o teto da prova.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-rose-400 font-medium">
                <i className="fa-solid fa-triangle-exclamation text-sm"></i>
                <span>
                  Atenção ao tempo! O ritmo médio está acima de 5:15 m/q, arriscando faltar tempo para o gabarito.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Histórico de Simulados Realizados */}
      <div className="bg-[#131b2e] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e293b] pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-clipboard-check text-amber-400"></i>
              <span>Histórico de Provas de Simulado</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Provas de 40 questões ponderadas no perfil oficial FAFIPA Curitiba
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {statsSimulados.historicoSimulados.length > 0 && onPurgarSimulados && (
              <button
                onClick={async () => {
                  if (confirm('Deseja excluir o simulado de teste anterior, suas questões e métricas?')) {
                    await onPurgarSimulados();
                  }
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-800/60 transition flex items-center gap-1.5 cursor-pointer"
                title="Exclui o simulado de teste e zera as métricas"
              >
                <i className="fa-solid fa-trash-can text-[11px]"></i>
                <span>Zerar Simulado de Teste</span>
              </button>
            )}

            <button
              onClick={abrirConferenciaSimulado}
              className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 hover:brightness-110 transition shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-plus-circle"></i>
              <span>Novo Simulado (40Q)</span>
            </button>
          </div>
        </div>

        {statsSimulados.historicoSimulados.length === 0 ? (
          <div className="py-12 px-4 text-center max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-2xl shadow-inner">
              <i className="fa-solid fa-trophy"></i>
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">Nenhum simulado realizado ainda</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Gere seu primeiro simulado com 40 questões (5 Português, 5 Informática e 30 Específicas) calibradas
                rigorosamente com os 34 PDFs do edital de Curitiba.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={abrirConferenciaSimulado}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 hover:brightness-110 transition shadow-lg shadow-amber-500/20 inline-flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-rocket"></i>
                <span>Gerar 1º Simulado Oficial (40Q)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#0a0f1d] text-xs uppercase text-gray-400 border-b border-[#1e293b]">
                <tr>
                  <th className="p-3">Código / Prova</th>
                  <th className="p-3 text-center">Data</th>
                  <th className="p-3 text-center">Acertos</th>
                  <th className="p-3 text-center">Taxa de Acerto</th>
                  <th className="p-3 text-center">Ritmo (m/q)</th>
                  <th className="p-3 text-center">Tempo Total</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {statsSimulados.historicoSimulados.map((sim) => {
                  const sessaoOriginal = sessoesCriadas.find(
                    (s) => String(s.id) === String(sim.id) || s.codigo === sim.codigo
                  );

                  return (
                    <tr
                      key={String(sim.id)}
                      className="border-b border-[#1e293b] hover:bg-[#0a0f1d]/50 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded text-xs">
                            {sim.codigo}
                          </span>
                          {sim.atingiuMeta98 && (
                            <span
                              className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 flex items-center gap-1"
                              title="Meta de Aprovação de 98% Atingida!"
                            >
                              <i className="fa-solid fa-crown text-[9px] text-amber-400"></i>
                              Meta 98%
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center text-xs text-gray-400 font-mono">
                        {new Date(sim.data).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-white">
                        <span className="text-emerald-400">{sim.acertos}</span>
                        <span className="text-gray-500 font-normal"> / {sim.total}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`font-mono font-black text-xs px-2 py-0.5 rounded border ${
                            sim.atingiuMeta98
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                              : sim.taxaAcerto >= 80
                              ? 'bg-amber-950/80 text-amber-300 border-amber-700/80'
                              : 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                          }`}
                        >
                          {sim.taxaAcerto}%
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-xs">
                        <span
                          className={
                            sim.segundos / sim.total <= 315
                              ? 'text-emerald-400 font-bold'
                              : 'text-rose-400'
                          }
                        >
                          {sim.ritmoFormatado}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-xs text-gray-400">
                        {formatarTempoHorasMinutos(sim.segundos)}
                      </td>
                      <td className="p-3 text-right">
                        {sessaoOriginal && (
                          <button
                            onClick={() => {
                              const ids = sessaoOriginal.questaoIds || [];
                              iniciarSessaoAtiva(
                                ids,
                                sessaoOriginal.assunto,
                                sessaoOriginal,
                                true
                              );
                            }}
                            className="px-3 py-1 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-blue-600 text-gray-200 hover:text-white transition cursor-pointer flex items-center gap-1.5 ml-auto"
                          >
                            <i className="fa-solid fa-file-lines text-[10px]"></i>
                            <span>Revisar</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Composição Oficial da Prova FAFIPA (34 PDFs) */}
      <div className="bg-[#131b2e] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-layer-group text-blue-400"></i>
              <span>Estrutura dos 34 PDFs de Estudo da Prova Real</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Cobertura 100% do edital Curitiba dividida em 7 blocos e calibrada pela incidência histórica
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#0a0f1d] text-gray-300 border border-gray-700">
            40 Questões: 5 + 5 + 30
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-blue-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-300">
              <span>Bloco 1 &bull; Legislação Municipal</span>
              <span className="font-mono text-gray-400">PDFs 01 a 05</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Lei 15.800 (Código Edificações), Lei 15.511 (Zoneamento), Lei 15.852 (Uso do Solo), Lei 11.095 e LC 756.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-blue-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-300">
              <span>Bloco 2 &bull; Licitações e Custos</span>
              <span className="font-mono text-gray-400">PDFs 06 a 10</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Nova Lei 14.133/21, SINAPI/SICRO, BDI, Curva ABC, Fiscalização de Obras e Planejamento PERT-CPM.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-blue-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-300">
              <span>Bloco 3 &bull; Materiais e Estruturas</span>
              <span className="font-mono text-gray-400">PDFs 11 a 16</span>
            </div>
            <p className="text-[11px] text-gray-400">
              PDF 311 (Materiais - Gigante da prova), NBR 6118 (Concreto), NBR 6120 (Ações), Formas, Alvenarias.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-blue-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-300">
              <span>Bloco 4 &bull; Geotecnia e Infra</span>
              <span className="font-mono text-gray-400">PDFs 17 a 22</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Mecânica dos Solos, Fundações (NBR 6122), Drenagem Pluvial, Pavimentação Asfáltica e Obras de Arte.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-blue-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-300">
              <span>Bloco 5 &bull; Saneamento e Acessibilidade</span>
              <span className="font-mono text-gray-400">PDFs 23 a 26</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Abastecimento de Água, Esgoto Sanitário, Licenciamento Ambiental e NBR 9050 (Acessibilidade Universal).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0a0f1d] border border-blue-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-300">
              <span>Blocos 6 e 7 &bull; Segurança & Básicas</span>
              <span className="font-mono text-gray-400">PDFs 27 a 34</span>
            </div>
            <p className="text-[11px] text-gray-400">
              NR-18 e NR-35, Patologia das Construções, Perícias + 5Q Língua Portuguesa e 5Q Noções de Informática.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import {
  executarGeracaoLote500,
  ProgressoGeracaoLote,
  planejarLote500Questoes,
} from '../services/geradorLoteFafipa';
import { purgarSessoesEscalaS09aS20Db } from '../services/supabaseClient';
import { SessaoCriada } from '../types';

interface ModalGeradorLoteEscalaProps {
  isOpen: boolean;
  onClose: () => void;
  onConcluido: (sessoesCriadas: SessaoCriada[]) => void;
  cargoPadrao?: string;
  sessaoInicialPadrao?: number;
}

export const ModalGeradorLoteEscala: React.FC<ModalGeradorLoteEscalaProps> = ({
  isOpen,
  onClose,
  onConcluido,
  cargoPadrao = 'Engenheiro Civil - Curitiba',
  sessaoInicialPadrao = 1,
}) => {
  const [executando, setExecutando] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [cargo, setCargo] = useState(cargoPadrao);
  const [feedbackAcao, setFeedbackAcao] = useState<{ tipo: 'sucesso' | 'erro' | 'info'; texto: string } | null>(null);
  const [limpandoFallback, setLimpandoFallback] = useState(false);

  const [progresso, setProgresso] = useState<ProgressoGeracaoLote>({
    totalQuestoes: sessaoInicialPadrao === 9 ? 300 : 500,
    questoesConcluidas: 0,
    sessaoAtual: sessaoInicialPadrao,
    totalSessoes: 20,
    codigoSessaoAtual: `LOTE-500-S${String(sessaoInicialPadrao).padStart(2, '0')}`,
    assuntoAtual: 'Pronto para iniciar',
    dificuldadeAtual: 'FACIL',
    porcentagem: 0,
    pausado: false,
    mensagem: sessaoInicialPadrao === 9
      ? 'Pronto para regenerar Sessões 09 a 20 (300 questões) com cota blindada.'
      : 'Selecione abaixo se deseja regenerar as sessões 09 a 20 ou o lote completo.',
    tempoRestanteFormatado: '--:--',
    tempoDecorridoFormatado: '00:00',
  });

  React.useEffect(() => {
    if (isOpen) {
      const ini = sessaoInicialPadrao || 1;
      setProgresso((prev) => ({
        ...prev,
        sessaoAtual: ini,
        totalQuestoes: ini === 9 ? 300 : 500,
        codigoSessaoAtual: `LOTE-500-S${String(ini).padStart(2, '0')}`,
        questoesConcluidas: 0,
        porcentagem: 0,
        mensagem: ini === 9
          ? 'Pronto para regenerar Sessões 09 a 20 (300 questões) com cota blindada.'
          : 'Selecione abaixo se deseja regenerar as sessões 09 a 20 ou o lote completo.',
      }));
    }
  }, [isOpen, sessaoInicialPadrao]);

  const controleRef = useRef<{ pausado: boolean; abortar: boolean }>({
    pausado: false,
    abortar: false,
  });

  const sessoesCriadasAcumuladas = useRef<SessaoCriada[]>([]);

  if (!isOpen) return null;

  const handleExcluirSessoesFallback = async () => {
    if (!window.confirm('Confirma a exclusão das Sessões 09 a 20 (300 questões de fallback)?\n\nAs Sessões 01 a 08 permanecerão 100% preservadas e intactas.')) {
      return;
    }

    setLimpandoFallback(true);
    try {
      const res = await purgarSessoesEscalaS09aS20Db();
      setFeedbackAcao({
        tipo: 'sucesso',
        texto: `Limpeza concluída: ${res.sessoesRemovidas} sessões e ${res.questoesRemovidas} questões de fallback foram removidas. As Sessões 01 a 08 estão 100% protegidas!`,
      });
      setProgresso((prev) => ({
        ...prev,
        sessaoAtual: 9,
        codigoSessaoAtual: 'LOTE-500-S09',
        mensagem: 'Sessões 09 a 20 removidas. Pronto para regenerar com a IA otimizada.',
      }));
    } catch (e: any) {
      setFeedbackAcao({
        tipo: 'erro',
        texto: `Erro ao limpar sessões: ${e?.message || 'Falha na conexão com a nuvem'}`,
      });
    } finally {
      setLimpandoFallback(false);
    }
  };

  const iniciarGeracao = async (sessaoIni: number = 1, sessaoFim: number = 20) => {
    setExecutando(true);
    setPausado(false);
    setConcluido(false);
    setFeedbackAcao(null);
    controleRef.current = { pausado: false, abortar: false };

    // Se estiver gerando especificamente da S09 em diante, garante a purga prévia
    if (sessaoIni === 9) {
      try {
        await purgarSessoesEscalaS09aS20Db();
      } catch (err) {
        console.warn('Purga prévia automática continuou:', err);
      }
    }

    try {
      const resultado = await executarGeracaoLote500(
        cargo,
        (p) => {
          setProgresso(p);
          setPausado(p.pausado);
        },
        controleRef.current,
        sessaoIni,
        sessaoFim
      );

      sessoesCriadasAcumuladas.current = [
        ...sessoesCriadasAcumuladas.current,
        ...resultado.sessoesCriadas,
      ];

      if (!controleRef.current.abortar) {
        setConcluido(true);
        setExecutando(false);
        onConcluido(sessoesCriadasAcumuladas.current);
      }
    } catch (e) {
      console.error('Erro na geração em lote:', e);
      setExecutando(false);
    }
  };

  const alternarPausa = () => {
    if (pausado) {
      controleRef.current.pausado = false;
      setPausado(false);
    } else {
      controleRef.current.pausado = true;
      setPausado(true);
    }
  };

  const cancelarOuFechar = () => {
    if (executando) {
      if (confirm('A geração está em andamento. Deseja realmente parar? Todas as sessões já concluídas foram salvas com sucesso na nuvem.')) {
        controleRef.current.abortar = true;
        setExecutando(false);
        onConcluido(sessoesCriadasAcumuladas.current);
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="p-6 bg-gradient-to-r from-blue-950/80 via-[#0f172a] to-indigo-950/80 border-b border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 text-xl shadow-inner">
              <i className="fa-solid fa-rocket"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Motor de Geração em Escala: 500 Questões
              </h2>
              <p className="text-xs text-blue-300/80">
                FAFIPA Paramétrica &bull; 20 Sessões de 25Q &bull; Grade 200F / 200M / 100C
              </p>
            </div>
          </div>
          {!executando && (
            <button
              onClick={cancelarOuFechar}
              className="text-gray-400 hover:text-white transition p-1.5 rounded-lg hover:bg-slate-800"
              title="Fechar"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          )}
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Alerta Importante */}
          <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 flex items-start gap-3 text-amber-200 text-xs">
            <i className="fa-solid fa-triangle-exclamation text-amber-400 text-sm mt-0.5 shrink-0"></i>
            <div className="space-y-1">
              <strong className="font-semibold block text-amber-300">
                Mantenha esta aba aberta durante o processo
              </strong>
              <span>
                As 500 questões são geradas e sincronizadas em 20 sessões de 25 questões na nuvem (Supabase) e no cache local. Cada sessão concluída já fica imediatamente salva e protegida.
              </span>
            </div>
          </div>

          {/* Feedback de Ações (Ex: Purga de sessões) */}
          {feedbackAcao && (
            <div
              className={`rounded-xl p-3 flex items-start justify-between gap-3 text-xs ${
                feedbackAcao.tipo === 'sucesso'
                  ? 'bg-emerald-950/60 border border-emerald-600/60 text-emerald-200'
                  : feedbackAcao.tipo === 'erro'
                  ? 'bg-rose-950/60 border border-rose-600/60 text-rose-200'
                  : 'bg-blue-950/60 border border-blue-600/60 text-blue-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <i
                  className={`fa-solid ${
                    feedbackAcao.tipo === 'sucesso'
                      ? 'fa-circle-check text-emerald-400'
                      : feedbackAcao.tipo === 'erro'
                      ? 'fa-triangle-exclamation text-rose-400'
                      : 'fa-circle-info text-blue-400'
                  }`}
                ></i>
                <span>{feedbackAcao.texto}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackAcao(null)}
                className="text-gray-400 hover:text-white"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          )}

          {/* Alerta Informativo e de Blindagem */}
          <div className="bg-slate-900/90 border border-blue-900/40 rounded-xl p-4 flex items-start gap-3 text-slate-300 text-xs">
            <i className="fa-solid fa-shield-halved text-blue-400 text-base mt-0.5 shrink-0"></i>
            <div className="space-y-1">
              <strong className="font-semibold block text-blue-200">
                Geração Otimizada em Lotes de 5 Questões &bull; Proteção de Cota Gemini
              </strong>
              <span className="text-slate-400 leading-relaxed block">
                As chamadas são agrupadas de 5 em 5 com intervalo de 3s para manter o consumo abaixo de 200k TPM. Caso a cota oscile, o sistema aguarda 15s e retenta automaticamente sem recorrer a modelos genéricos.
              </span>
            </div>
          </div>

          {/* Métricas Consolidadas do Lote */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#131b2e] border border-[#1e293b] rounded-xl p-3 text-center">
              <span className="text-[11px] text-gray-400 block font-medium">Progresso</span>
              <span className="text-lg font-bold text-white font-mono">
                {progresso.porcentagem}%
              </span>
              <span className="text-[10px] text-blue-400 block font-sans">
                {progresso.questoesConcluidas}/{progresso.totalQuestoes} Q
              </span>
            </div>

            <div className="bg-[#131b2e] border border-[#1e293b] rounded-xl p-3 text-center">
              <span className="text-[11px] text-gray-400 block font-medium">Sessão Atual</span>
              <span className="text-lg font-bold text-indigo-400 font-mono">
                {progresso.sessaoAtual}/20
              </span>
              <span className="text-[10px] text-indigo-300 block font-sans truncate px-1">
                {progresso.codigoSessaoAtual || 'LOTE-500-S01'}
              </span>
            </div>

            <div className="bg-[#131b2e] border border-[#1e293b] rounded-xl p-3 text-center">
              <span className="text-[11px] text-gray-400 block font-medium flex items-center justify-center gap-1">
                <i className="fa-solid fa-clock text-[10px] text-gray-500"></i>
                Tempo Decorrido
              </span>
              <span className="text-lg font-bold text-slate-200 font-mono">
                {progresso.tempoDecorridoFormatado || '00:00'}
              </span>
              <span className="text-[10px] text-slate-400 block font-sans">
                {progresso.questoesPorMinuto ? `${progresso.questoesPorMinuto} Q/min` : 'Cronometrando'}
              </span>
            </div>

            <div className="bg-[#131b2e] border border-blue-900/40 rounded-xl p-3 text-center bg-gradient-to-b from-blue-950/20 to-transparent">
              <span className="text-[11px] text-blue-300 block font-medium flex items-center justify-center gap-1">
                <i className="fa-solid fa-hourglass-half text-[10px] text-blue-400"></i>
                Tempo Restante
              </span>
              <span className="text-lg font-bold text-cyan-300 font-mono">
                {progresso.tempoRestanteFormatado || '--:--'}
              </span>
              <span className="text-[10px] text-cyan-400/80 block font-sans">
                Estimativa dinâmica
              </span>
            </div>
          </div>

          {/* Barra de Progresso Animada */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 font-medium flex items-center gap-1.5">
                {executando && !pausado && (
                  <i className="fa-solid fa-spinner fa-spin text-blue-400"></i>
                )}
                {pausado && <i className="fa-solid fa-pause text-amber-400"></i>}
                {concluido && <i className="fa-solid fa-circle-check text-emerald-400"></i>}
                <span>{progresso.codigoSessaoAtual} (Sessão {progresso.sessaoAtual}/20)</span>
              </span>
              <span className="font-mono font-bold text-blue-400 text-sm">
                {progresso.questoesConcluidas} / {progresso.totalQuestoes} questões ({progresso.porcentagem}%)
              </span>
            </div>

            <div className="w-full bg-[#1e293b] rounded-full h-3.5 overflow-hidden p-0.5 border border-[#334155]">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  concluido
                    ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                    : pausado
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 animate-pulse'
                }`}
                style={{ width: `${Math.max(2, progresso.porcentagem)}%` }}
              ></div>
            </div>

            {/* Aviso de espera de cota com realce */}
            {progresso.aguardandoCota && (
              <div className="bg-amber-950/70 border border-amber-600/70 rounded-lg p-2.5 flex items-center gap-2 text-amber-300 text-xs animate-pulse">
                <i className="fa-solid fa-hourglass-half text-amber-400"></i>
                <span>{progresso.mensagem}</span>
              </div>
            )}

            {!progresso.aguardandoCota && (
              <p className="text-xs text-gray-400 italic pt-1 truncate">
                <strong className="text-gray-300 font-normal">Status: </strong>
                {progresso.mensagem}
              </p>
            )}
          </div>

          {/* Configuração de Cargo (Apenas antes de iniciar) */}
          {!executando && !concluido && (
            <div className="bg-[#131b2e] border border-[#1e293b] rounded-xl p-4 space-y-2">
              <label className="text-xs font-semibold text-gray-300 block">
                Cargo Alvo para Contextualização das Questões:
              </label>
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="input-field text-xs py-2 w-full"
                placeholder="Ex: Engenheiro Civil - Curitiba"
              />
              <p className="text-[11px] text-gray-500">
                A banca FAFIPA contextualizará os casos práticos nas atribuições municipais deste cargo.
              </p>
            </div>
          )}

          {/* Alerta de Conclusão */}
          {concluido && (
            <div className="bg-emerald-950/60 border border-emerald-700/80 rounded-xl p-4 flex items-center gap-3 text-emerald-200 text-xs">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl shrink-0">
                <i className="fa-solid fa-check"></i>
              </div>
              <div>
                <strong className="text-sm font-bold text-white block">
                  Lote Gerado e Sincronizado com Sucesso!
                </strong>
                <span>
                  As sessões foram atualizadas na nuvem com questões contextualizadas e gabaritos comentados. Você já pode acessá-las na aba "Sessões em Escala".
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé e Botões de Controle */}
        <div className="p-4 bg-[#0a0f1d] border-t border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelarOuFechar}
              className="btn-secondary text-xs py-2 px-3"
            >
              {executando ? 'Parar e Fechar' : concluido ? 'Fechar' : 'Cancelar'}
            </button>

            {!executando && !concluido && (
              <button
                type="button"
                onClick={handleExcluirSessoesFallback}
                disabled={limpandoFallback}
                className="text-xs py-2 px-3 rounded-xl font-medium text-rose-300 hover:text-white bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/50 transition flex items-center gap-1.5"
                title="Exclui LOTE-500-S09 a S20 do banco e cache sem afetar as sessões 01 a 08"
              >
                {limpandoFallback ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : (
                  <i className="fa-solid fa-trash-can text-rose-400"></i>
                )}
                <span>Excluir S09 a S20 Antigas</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {executando && (
              <button
                type="button"
                onClick={alternarPausa}
                className={`text-xs py-2 px-4 rounded-xl font-bold flex items-center gap-1.5 transition ${
                  pausado
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800/60'
                }`}
              >
                <i className={`fa-solid ${pausado ? 'fa-play' : 'fa-pause'}`}></i>
                <span>{pausado ? 'Retomar Geração' : 'Pausar'}</span>
              </button>
            )}

            {!executando && !concluido && (
              <>
                <button
                  type="button"
                  onClick={() => iniciarGeracao(1, 20)}
                  className="btn-secondary text-xs py-2 px-3 text-slate-300 hover:text-white flex items-center gap-1.5"
                  title="Gera todas as 20 sessões do início (500 questões)"
                >
                  <i className="fa-solid fa-rotate text-blue-400"></i>
                  <span>Lote Completo (01 a 20)</span>
                </button>

                <button
                  type="button"
                  onClick={() => iniciarGeracao(9, 20)}
                  className="btn-primary text-xs py-2 px-4 font-bold flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 border-blue-500"
                  title="Purga sessões 09 a 20 do fallback e regenera 300 questões de alta qualidade"
                >
                  <i className="fa-solid fa-rocket text-yellow-300"></i>
                  <span>Regenerar Sessões 09 a 20 (300Q)</span>
                </button>
              </>
            )}

            {concluido && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                }}
                className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 border-emerald-500"
              >
                <i className="fa-solid fa-list-check"></i>
                <span>Ver Sessões em Escala</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

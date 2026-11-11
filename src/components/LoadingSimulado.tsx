import React, { useEffect, useState } from 'react';
import { FRASES_LOADING_SIMULADO } from '../utils/eapEstrutura';

interface LoadingSimuladoProps {
  aberto: boolean;
  titulo?: string;
  subtitulo?: string;
  mensagemSubetapa?: string;
  progressoPct?: number; // 0 a 100 (opcional, se não passado simula avanço suave)
  onCancelar?: () => void;
}

export const LoadingSimulado: React.FC<LoadingSimuladoProps> = ({
  aberto,
  titulo = 'Gerando Caderno Oficial',
  subtitulo = 'FAFIPA Paramétrico · Prefeitura de Curitiba',
  mensagemSubetapa,
  progressoPct,
  onCancelar,
}) => {
  const [fraseIndex, setFraseIndex] = useState(0);
  const [simulatedPct, setSimulatedPct] = useState(0);

  // Alterna entre as frases temáticas requeridas a cada 2.8 segundos
  useEffect(() => {
    if (!aberto) {
      setFraseIndex(0);
      setSimulatedPct(0);
      return;
    }

    const fraseTimer = setInterval(() => {
      setFraseIndex((prev) => (prev + 1) % FRASES_LOADING_SIMULADO.length);
    }, 2800);

    return () => clearInterval(fraseTimer);
  }, [aberto]);

  // Se progressoPct não for fornecido, simula uma curva assintótica suave de 0% a 95%
  useEffect(() => {
    if (!aberto) return;

    if (progressoPct !== undefined) {
      setSimulatedPct(Math.min(100, Math.max(0, progressoPct)));
      return;
    }

    const progressTimer = setInterval(() => {
      setSimulatedPct((prev) => {
        if (prev >= 95) return 95;
        // Avanço desacelerado natural
        const incremento = Math.max(0.5, (95 - prev) * 0.08);
        return Math.min(95, prev + incremento);
      });
    }, 250);

    return () => clearInterval(progressTimer);
  }, [aberto, progressoPct]);

  if (!aberto) return null;

  const pctExibido = Math.round(progressoPct !== undefined ? progressoPct : simulatedPct);
  const fraseAtual = FRASES_LOADING_SIMULADO[fraseIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0e172a] border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 overflow-hidden text-center">
        {/* Glow de fundo */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Badge do Sistema */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide uppercase mb-4">
          <i className="fa-solid fa-crosshairs text-amber-400 animate-spin" style={{ animationDuration: '4s' }}></i>
          <span>FAFIPA Paramétrico · Prova Real</span>
        </div>

        {/* Título Principal */}
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1">
          {titulo}
        </h3>
        <p className="text-xs text-gray-400 mb-6">{subtitulo}</p>

        {/* Indicador Numérico 0 a 100% com Efeito Circular HUD */}
        <div className="relative my-4 flex flex-col items-center justify-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#1e293b"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="url(#loadingGradient)"
                strokeWidth="7"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * pctExibido) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-300 ease-out"
              />
              <defs>
                <linearGradient id="loadingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>

            {/* Valor Numérico Central */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black font-mono text-white tracking-tighter">
                {pctExibido}%
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400/90 mt-0.5">
                Progresso
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Progresso Linear */}
        <div className="w-full bg-slate-900/90 rounded-full h-2.5 p-0.5 border border-slate-700/80 mb-5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-blue-500 to-emerald-400 transition-all duration-300 shadow-sm shadow-amber-500/50"
            style={{ width: `${pctExibido}%` }}
          />
        </div>

        {/* Frase Rotativa Requerida */}
        <div className="min-h-[44px] flex items-center justify-center px-2 mb-3">
          <div
            key={fraseIndex}
            className="text-sm font-semibold text-amber-200 animate-fadeIn flex items-center gap-2"
          >
            <i className="fa-solid fa-wand-magic-sparkles text-amber-400 shrink-0"></i>
            <span>{fraseAtual}</span>
          </div>
        </div>

        {/* Mensagem Específica da Sub-etapa Atual */}
        {mensagemSubetapa && (
          <div className="text-xs text-gray-400 bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 truncate max-w-full">
            <i className="fa-solid fa-circle-notch fa-spin text-cyan-400 mr-2 text-[10px]"></i>
            <span className="font-mono text-gray-300">{mensagemSubetapa}</span>
          </div>
        )}

        {/* Botão Opcional Cancelar */}
        {onCancelar && (
          <div className="mt-5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onCancelar}
              className="text-xs text-gray-400 hover:text-gray-200 transition cursor-pointer"
            >
              Cancelar operação
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

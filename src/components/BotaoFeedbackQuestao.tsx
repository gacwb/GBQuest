import React, { useState, useEffect, useRef } from 'react';
import {
  FeedbackTipo,
  FeedbackQuestao,
  MOTIVOS_DESCURTIDA_PADRAO,
  salvarFeedbackQuestao,
  removerFeedbackQuestao,
  obterFeedbackQuestao,
} from '../services/feedbackService';
import { Questao } from '../types';

interface BotaoFeedbackQuestaoProps {
  questao: Pick<Questao, 'id' | 'enunciado' | 'disciplina' | 'assunto' | 'banca'>;
  onFeedbackChange?: (feedback: FeedbackQuestao | null) => void;
  className?: string;
  tamanho?: 'sm' | 'md';
}
 
export const BotaoFeedbackQuestao: React.FC<BotaoFeedbackQuestaoProps> = ({
  questao,
  onFeedbackChange,
  className = '',
  tamanho = 'sm',
}) => {
  const [feedback, setFeedback] = useState<FeedbackQuestao | null>(null);
  const [menuDescurtidaAberto, setMenuDescurtidaAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Carrega feedback salvo da questão
  useEffect(() => {
    if (!questao?.id) return;
    const fb = obterFeedbackQuestao(questao.id);
    setFeedback(fb || null);
  }, [questao?.id]);

  // Fecha menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuDescurtidaAberto(false);
      }
    };
    if (menuDescurtidaAberto) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuDescurtidaAberto]);

  const handleLike = () => {
    if (feedback?.tipo === 'like') {
      removerFeedbackQuestao(questao.id);
      setFeedback(null);
      onFeedbackChange?.(null);
    } else {
      const salvo = salvarFeedbackQuestao(questao, 'like');
      setFeedback(salvo);
      setMenuDescurtidaAberto(false);
      onFeedbackChange?.(salvo);
    }
  };

  const handleDislikeClick = () => {
    if (feedback?.tipo === 'dislike') {
      removerFeedbackQuestao(questao.id);
      setFeedback(null);
      setMenuDescurtidaAberto(false);
      onFeedbackChange?.(null);
    } else {
      // Abre menu de motivos ou salva direto com motivo padrão
      setMenuDescurtidaAberto((prev) => !prev);
    }
  };

  const handleEscolherMotivo = (motivo: string) => {
    const salvo = salvarFeedbackQuestao(questao, 'dislike', motivo);
    setFeedback(salvo);
    setMenuDescurtidaAberto(false);
    onFeedbackChange?.(salvo);
  };

  const ehLike = feedback?.tipo === 'like';
  const ehDislike = feedback?.tipo === 'dislike';

  const btnTamanhoClass =
    tamanho === 'sm' ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-xs';

  return (
    <div ref={containerRef} className={`relative inline-flex items-center gap-1 ${className}`}>
      {/* Botão LIKE (Curtir) */}
      <button
        type="button"
        onClick={handleLike}
        className={`inline-flex items-center gap-1.5 rounded-lg border transition-all cursor-pointer select-none ${btnTamanhoClass} ${
          ehLike
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-sm shadow-emerald-500/20 font-bold'
            : 'bg-slate-900/60 text-gray-400 hover:text-emerald-400 border-slate-800 hover:border-emerald-500/30'
        }`}
        title={ehLike ? 'Você curtiu esta questão (clique para remover)' : 'Curtir questão: ensina a IA a replicar este formato'}
        aria-label="Curtir questão"
      >
        <i className={`fa-solid fa-thumbs-up ${ehLike ? 'scale-110 text-emerald-400' : ''}`} />
        <span className="hidden sm:inline text-[11px] font-medium">
          {ehLike ? 'Elogiada' : 'Útil'}
        </span>
      </button>

      {/* Botão DISLIKE (Descurtir) */}
      <button
        type="button"
        onClick={handleDislikeClick}
        className={`inline-flex items-center gap-1.5 rounded-lg border transition-all cursor-pointer select-none ${btnTamanhoClass} ${
          ehDislike
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-sm shadow-rose-500/20 font-bold'
            : 'bg-slate-900/60 text-gray-400 hover:text-rose-400 border-slate-800 hover:border-rose-500/30'
        }`}
        title={
          ehDislike
            ? `Você descurtiu esta questão: "${feedback?.motivo || 'Ajustar'}" (clique para remover)`
            : 'Descurtir questão: ensina a IA o que deve ser evitado'
        }
        aria-label="Descurtir questão"
      >
        <i className={`fa-solid fa-thumbs-down ${ehDislike ? 'scale-110 text-rose-400' : ''}`} />
        <span className="hidden sm:inline text-[11px] font-medium">
          {ehDislike ? (feedback?.motivo ? 'Ajustar' : 'Ruim') : 'Ajustar'}
        </span>
      </button>

      {/* Menu Flutuante de Motivos de Descurtida para Refinar a IA */}
      {menuDescurtidaAberto && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-[#0e1726] border border-rose-500/40 rounded-xl p-3 shadow-2xl z-50 animate-fadeIn text-left">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
              <i className="fa-solid fa-triangle-exclamation text-rose-400"></i>
              O que a IA deve evitar?
            </span>
            <button
              type="button"
              onClick={() => setMenuDescurtidaAberto(false)}
              className="text-gray-400 hover:text-white text-xs cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mb-2 leading-relaxed">
            Selecione o motivo para alimentar o aprendizado contínuo do perfil paramétrico:
          </p>
          <div className="space-y-1.5">
            {MOTIVOS_DESCURTIDA_PADRAO.map((motivo) => (
              <button
                key={motivo}
                type="button"
                onClick={() => handleEscolherMotivo(motivo)}
                className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-950/40 hover:text-rose-200 border border-slate-800 hover:border-rose-500/40 text-gray-300 transition flex items-center justify-between group cursor-pointer"
              >
                <span>{motivo}</span>
                <i className="fa-solid fa-arrow-right text-[10px] opacity-0 group-hover:opacity-100 text-rose-400 transition" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

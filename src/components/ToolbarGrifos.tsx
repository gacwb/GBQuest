import React, { useEffect, useRef } from 'react';
import { CorGrifo, GrifoQuestao } from '../types';
import { ESTILOS_CORES_GRIFO } from '../utils/grifoTextProcessor';

interface ToolbarGrifosProps {
  posicao: { top: number; left: number; abaixo?: boolean };
  grifoAtivo?: GrifoQuestao | null;
  onEscolherCor: (cor: CorGrifo) => void;
  onRemoverGrifo?: () => void;
  onFechar: () => void;
}

const LISTA_CORES: CorGrifo[] = ['yellow', 'green', 'pink', 'cyan'];

export const ToolbarGrifos: React.FC<ToolbarGrifosProps> = ({
  posicao,
  grifoAtivo,
  onEscolherCor,
  onRemoverGrifo,
  onFechar,
}) => {
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Fecha a toolbar se o usuário clicar ou tocar estritamente fora da toolbar
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        onFechar();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onFechar();
      }
    };

    // Atraso curto para evitar fechar no próprio evento de seleção
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }, 60);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onFechar]);

  return (
    <div
      ref={toolbarRef}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: `${posicao.top}px`,
        left: `${posicao.left}px`,
        transform: posicao.abaixo
          ? 'translate(-50%, 8px)'
          : 'translate(-50%, -100%) translateY(-8px)',
        zIndex: 9999,
      }}
      className="bg-[#181d28]/95 backdrop-blur-md border border-[#3b475c] shadow-2xl shadow-black/95 rounded-2xl p-1.5 flex items-center gap-1.5 select-none animate-in fade-in zoom-in-95 duration-150 ring-1 ring-white/10"
    >
      {/* 4 Botões de Cores */}
      {LISTA_CORES.map((cor) => {
        const estilo = ESTILOS_CORES_GRIFO[cor];
        const estaSelecionada = grifoAtivo && grifoAtivo.cor === cor;

        return (
          <button
            key={cor}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEscolherCor(cor);
            }}
            title={`Grifar com ${estilo.nome}`}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              estaSelecionada
                ? 'bg-white/20 ring-2 ring-white/60 shadow-inner scale-105'
                : 'hover:bg-white/10 hover:scale-105'
            }`}
          >
            <span
              style={{ backgroundColor: estilo.corHex }}
              className="w-5 h-5 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-90"
            >
              {estaSelecionada && (
                <i className="fa-solid fa-check text-[10px] text-white font-black drop-shadow"></i>
              )}
            </span>
          </button>
        );
      })}

      {/* Opção de Excluir / Remover Grifo quando estiver editando um existente */}
      {grifoAtivo && onRemoverGrifo && (
        <>
          <div className="w-px h-5 bg-gray-700/80 mx-0.5" />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemoverGrifo();
            }}
            title="Remover este grifo"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-all cursor-pointer active:scale-95"
          >
            <i className="fa-regular fa-trash-can text-sm"></i>
          </button>
        </>
      )}

      {/* Botão fechar discreto */}
      <div className="w-px h-5 bg-gray-700/80 mx-0.5" />
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onFechar();
        }}
        title="Fechar"
        className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 text-xs transition cursor-pointer"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
};

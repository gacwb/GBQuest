import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { formatarEnunciado } from '../utils/enunciadoFormatter';
import { CorGrifo, GrifoQuestao } from '../types';
import {
  obterGrifosQuestao,
  salvarGrifo,
  atualizarCorGrifo,
  removerGrifo,
  limparGrifosQuestao,
} from '../services/grifosStorage';
import {
  processarTextoComGrifos,
  ESTILOS_CORES_GRIFO,
} from '../utils/grifoTextProcessor';
import { ToolbarGrifos } from './ToolbarGrifos';

interface EnunciadoQuestaoProps {
  enunciado: string | null | undefined;
  questaoId?: number | string;
  className?: string;
}

interface PosicaoToolbar {
  top: number;
  left: number;
  abaixo?: boolean;
}

interface SelecaoPendente {
  texto: string;
  startIndex: number;
  endIndex: number;
}

export const EnunciadoQuestao: React.FC<EnunciadoQuestaoProps> = ({
  enunciado,
  questaoId,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textoFormatado = useMemo(() => formatarEnunciado(enunciado), [enunciado]);

  // Grifos persistentes da questão
  const [grifos, setGrifos] = useState<GrifoQuestao[]>(() =>
    questaoId ? obterGrifosQuestao(questaoId) : []
  );

  // Estado da toolbar flutuante
  const [toolbarAberta, setToolbarAberta] = useState(false);
  const [posicaoToolbar, setPosicaoToolbar] = useState<PosicaoToolbar>({ top: 0, left: 0 });
  const [grifoAtivo, setGrifoAtivo] = useState<GrifoQuestao | null>(null);
  const [selecaoPendente, setSelecaoPendente] = useState<SelecaoPendente | null>(null);

  // Recarrega grifos quando questaoId muda ou evento de atualização é disparado
  useEffect(() => {
    if (!questaoId) {
      setGrifos([]);
      return;
    }

    setGrifos(obterGrifosQuestao(questaoId));

    const handleAtualizacao = (e: any) => {
      const qId = e.detail?.questaoId;
      if (qId === '*' || String(qId) === String(questaoId)) {
        setGrifos(obterGrifosQuestao(questaoId));
      }
    };

    window.addEventListener('gb_grifos_updated', handleAtualizacao);
    return () => {
      window.removeEventListener('gb_grifos_updated', handleAtualizacao);
    };
  }, [questaoId]);

  // Fecha toolbar ao mudar de questão
  useEffect(() => {
    setToolbarAberta(false);
    setGrifoAtivo(null);
    setSelecaoPendente(null);
  }, [questaoId]);

  // Blocos formatados do enunciado com offsets calculados
  const blocosComOffsets = useMemo(() => {
    const rawBlocos = textoFormatado
      .split(/\n\n+/)
      .map((b) => b.trim())
      .filter(Boolean);

    let searchCursor = 0;
    return rawBlocos.map((bloco) => {
      const offsetInicio = textoFormatado.indexOf(bloco, searchCursor);
      const safeOffset = offsetInicio >= 0 ? offsetInicio : searchCursor;
      searchCursor = safeOffset + bloco.length;
      return {
        texto: bloco,
        offsetInicio: safeOffset,
        offsetFim: safeOffset + bloco.length,
      };
    });
  }, [textoFormatado]);

  const textContainerRef = useRef<HTMLDivElement>(null);

  // Captura seleção de texto feita pelo usuário com mouse ou toque
  const handleSelecaoTexto = useCallback(() => {
    if (!questaoId) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) {
      return;
    }

    const range = selection.getRangeAt(0);
    const textoSelecionado = selection.toString().trim();

    if (!textoSelecionado || textoSelecionado.length === 0) {
      return;
    }

    const textContainer = textContainerRef.current || containerRef.current;
    if (!textContainer || !textContainer.contains(range.startContainer)) {
      return;
    }

    // Calcula posição da seleção relativa ao container principal
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect() || rect;

    const fitsAbove = rect.top - containerRect.top > 48;
    const top = fitsAbove
      ? Math.max(0, rect.top - containerRect.top)
      : Math.min(containerRect.height + 20, rect.bottom - containerRect.top + 6);

    const rawLeft = rect.left - containerRect.left + rect.width / 2;
    const left = Math.max(90, Math.min(containerRect.width - 90, rawLeft));

    // Determina o bloco exato e calcula o offset preciso no textoFormatado
    const startNode =
      range.startContainer.nodeType === Node.TEXT_NODE
        ? range.startContainer.parentElement
        : (range.startContainer as HTMLElement);

    const blockEl = startNode?.closest('[data-bloco-index]') as HTMLElement | null;

    let startIndex = -1;
    let endIndex = -1;

    // Cálculo universal e preciso de offsets usando DOM Range nativo
    try {
      const rootForCalc = blockEl || textContainer;
      const preStartRange = document.createRange();
      preStartRange.selectNodeContents(rootForCalc);
      preStartRange.setEnd(range.startContainer, range.startOffset);
      const startInRoot = preStartRange.toString().length;

      const preEndRange = document.createRange();
      preEndRange.selectNodeContents(rootForCalc);
      preEndRange.setEnd(range.endContainer, range.endOffset);
      const endInRoot = preEndRange.toString().length;

      if (blockEl) {
        const bIdx = parseInt(blockEl.getAttribute('data-bloco-index') || '0', 10);
        const blocoInfo = blocosComOffsets[bIdx];
        const offsetBase = blocoInfo ? blocoInfo.offsetInicio : 0;
        startIndex = offsetBase + startInRoot;
        endIndex = offsetBase + endInRoot;
      } else {
        startIndex = startInRoot;
        endIndex = endInRoot;
      }
    } catch {
      // Fallback para TreeWalker
      if (blockEl) {
        const bIdx = parseInt(blockEl.getAttribute('data-bloco-index') || '0', 10);
        const blocoInfo = blocosComOffsets[bIdx];
        const offsetBase = blocoInfo ? blocoInfo.offsetInicio : 0;

        const walker = document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT, null);
        let currOffset = 0;
        let node: Node | null = walker.nextNode();

        while (node) {
          const len = node.textContent ? node.textContent.length : 0;
          if (node === range.startContainer) {
            startIndex = offsetBase + currOffset + range.startOffset;
          }
          if (node === range.endContainer) {
            endIndex = offsetBase + currOffset + range.endOffset;
          }
          currOffset += len;
          node = walker.nextNode();
        }
      }
    }

    // Refinamento e fallback localizado
    if (startIndex < 0 || endIndex < 0 || startIndex >= endIndex) {
      let idx = -1;
      if (blockEl) {
        const bIdx = parseInt(blockEl.getAttribute('data-bloco-index') || '0', 10);
        const blocoInfo = blocosComOffsets[bIdx];
        if (blocoInfo) {
          const idxNoBloco = blocoInfo.texto.indexOf(textoSelecionado);
          if (idxNoBloco >= 0) {
            idx = blocoInfo.offsetInicio + idxNoBloco;
          }
        }
      }

      if (idx < 0) {
        idx = textoFormatado.indexOf(textoSelecionado);
      }
      if (idx < 0) {
        idx = textoFormatado.toLowerCase().indexOf(textoSelecionado.toLowerCase());
      }

      startIndex = idx >= 0 ? idx : 0;
      endIndex = startIndex + textoSelecionado.length;
    } else {
      // Garante que startIndex/endIndex casam com o trecho selecionado no textoFormatado
      const trecho = textoFormatado.substring(startIndex, endIndex);
      if (trecho.trim() !== textoSelecionado) {
        const posPerto = textoFormatado.indexOf(textoSelecionado, Math.max(0, startIndex - 40));
        if (posPerto >= 0 && Math.abs(posPerto - startIndex) < 120) {
          startIndex = posPerto;
          endIndex = posPerto + textoSelecionado.length;
        }
      }
    }

    setGrifoAtivo(null);
    setSelecaoPendente({
      texto: textoSelecionado,
      startIndex: Math.max(0, startIndex),
      endIndex: Math.max(0, endIndex),
    });
    setPosicaoToolbar({ top, left, abaixo: !fitsAbove });
    setToolbarAberta(true);
  }, [questaoId, textoFormatado, blocosComOffsets]);

  // Captura de eventos de seleção em múltiplos navegadores (mouse, toque e selectionchange)
  useEffect(() => {
    let timer: any = null;

    const handleSelectionEvent = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        handleSelecaoTexto();
      }, 30);
    };

    document.addEventListener('mouseup', handleSelectionEvent);
    document.addEventListener('touchend', handleSelectionEvent);
    document.addEventListener('selectionchange', handleSelectionEvent);

    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener('mouseup', handleSelectionEvent);
      document.removeEventListener('touchend', handleSelectionEvent);
      document.removeEventListener('selectionchange', handleSelectionEvent);
    };
  }, [handleSelecaoTexto]);

  // Clique em um grifo existente para alterar cor ou remover
  const handleCliqueGrifo = useCallback(
    (grifo: GrifoQuestao, e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (!containerRef.current) return;

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      const fitsAbove = rect.top - containerRect.top > 48;
      const top = fitsAbove
        ? Math.max(0, rect.top - containerRect.top)
        : Math.min(containerRect.height + 20, rect.bottom - containerRect.top + 6);

      const rawLeft = rect.left - containerRect.left + rect.width / 2;
      const left = Math.max(90, Math.min(containerRect.width - 90, rawLeft));

      setSelecaoPendente(null);
      setGrifoAtivo(grifo);
      setPosicaoToolbar({ top, left, abaixo: !fitsAbove });
      setToolbarAberta(true);
    },
    []
  );

  // Aplicação da cor escolhida na toolbar
  const handleEscolherCor = useCallback(
    (cor: CorGrifo) => {
      if (!questaoId) return;

      if (grifoAtivo) {
        // Altera a cor do grifo existente
        atualizarCorGrifo(questaoId, grifoAtivo.id, cor);
        setGrifos(obterGrifosQuestao(questaoId));
      } else if (selecaoPendente) {
        // Cria um novo grifo persistente
        salvarGrifo(questaoId, {
          cor,
          texto: selecaoPendente.texto,
          startIndex: selecaoPendente.startIndex,
          endIndex: selecaoPendente.endIndex,
        });
        setGrifos(obterGrifosQuestao(questaoId));

        // Limpa a seleção visual do navegador
        if (typeof window !== 'undefined' && window.getSelection) {
          window.getSelection()?.removeAllRanges();
        }
      }

      setToolbarAberta(false);
      setGrifoAtivo(null);
      setSelecaoPendente(null);
    },
    [questaoId, grifoAtivo, selecaoPendente]
  );

  // Remoção de um grifo existente
  const handleRemoverGrifo = useCallback(() => {
    if (!questaoId || !grifoAtivo) return;

    removerGrifo(questaoId, grifoAtivo.id);
    setGrifos(obterGrifosQuestao(questaoId));
    setToolbarAberta(false);
    setGrifoAtivo(null);
  }, [questaoId, grifoAtivo]);

  // Limpeza de todos os grifos da questão
  const handleLimparTodosGrifos = useCallback(() => {
    if (!questaoId) return;
    limparGrifosQuestao(questaoId);
    setGrifos([]);
    setToolbarAberta(false);
    setGrifoAtivo(null);
    setSelecaoPendente(null);
  }, [questaoId]);

  const handleFecharToolbar = useCallback(() => {
    setToolbarAberta(false);
    setGrifoAtivo(null);
    setSelecaoPendente(null);
  }, []);

  // Renderiza um texto aplicando grifos através de tags <mark>
  const renderizarTextoComGrifos = (texto: string, offsetBase: number = 0) => {
    const segmentos = processarTextoComGrifos(texto, grifos, offsetBase);

    return segmentos.map((seg, i) => {
      if (seg.tipo === 'texto') {
        return <React.Fragment key={i}>{seg.conteudo}</React.Fragment>;
      }

      const cor = seg.grifo?.cor || 'yellow';
      const estilo = ESTILOS_CORES_GRIFO[cor];

      return (
        <mark
          key={seg.grifo?.id || i}
          onClick={(e) => seg.grifo && handleCliqueGrifo(seg.grifo, e)}
          title="Clique para mudar de cor ou remover este grifo"
          className={`cursor-pointer rounded px-1 py-0.5 font-medium transition-all duration-150 inline shadow-sm hover:brightness-110 active:scale-95 ${estilo.bgHighlight} ${estilo.borderHighlight} ${estilo.textColor}`}
        >
          {seg.conteudo}
        </mark>
      );
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseUp={handleSelecaoTexto}
      onTouchEnd={handleSelecaoTexto}
      className={`relative select-text ${className}`}
    >
      {/* Barra de Ações / Status dos Grifos (quando a questão possui trechos grifados) */}
      {grifos.length > 0 && (
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-800/60 text-xs">
          <div className="flex items-center gap-1.5 text-amber-300/90 font-medium">
            <i className="fa-solid fa-highlighter text-[11px] text-amber-400"></i>
            <span>{grifos.length} trecho(s) grifado(s)</span>
          </div>
          <button
            type="button"
            onClick={handleLimparTodosGrifos}
            className="px-2 py-0.5 rounded text-[11px] font-medium text-rose-300 hover:text-rose-100 bg-rose-950/40 border border-rose-800/50 hover:bg-rose-900/40 transition flex items-center gap-1 cursor-pointer"
            title="Remover todos os grifos desta questão"
          >
            <i className="fa-regular fa-trash-can text-[10px]"></i>
            <span>Limpar grifos</span>
          </button>
        </div>
      )}

      {/* Toolbar Flutuante de Cores */}
      {toolbarAberta && (
        <ToolbarGrifos
          posicao={posicaoToolbar}
          grifoAtivo={grifoAtivo}
          onEscolherCor={handleEscolherCor}
          onRemoverGrifo={grifoAtivo ? handleRemoverGrifo : undefined}
          onFechar={handleFecharToolbar}
        />
      )}

      {/* Renderização do Enunciado */}
      {blocosComOffsets.length <= 1 ? (
        <div ref={textContainerRef} className="text-sm md:text-base text-gray-200 leading-relaxed font-normal whitespace-pre-line">
          {renderizarTextoComGrifos(textoFormatado, 0)}
        </div>
      ) : (
        <div ref={textContainerRef} className="text-sm md:text-base text-gray-200 space-y-3.5 leading-relaxed font-normal">
          {blocosComOffsets.map((item, idx) => {
            const bloco = item.texto;
            const ehPorque = bloco === 'PORQUE' || bloco === 'PORQUANTO';
            const ehComandoFinal = /^(?:Assinale|A respeito|(?:Está|É) correto|Com base|Diante)/i.test(
              bloco
            );
            const ehColuna = /^Coluna\s+[1-9IVX]+/i.test(bloco);

            return (
              <div
                key={idx}
                data-bloco-index={idx}
                className={`whitespace-pre-line ${
                  ehPorque
                    ? 'font-bold text-amber-400 tracking-wider text-xs md:text-sm uppercase py-1'
                    : ehColuna
                    ? 'font-semibold text-gray-100 pt-1'
                    : ehComandoFinal
                    ? 'font-medium text-blue-200/90 pt-1'
                    : ''
                }`}
              >
                {renderizarTextoComGrifos(bloco, item.offsetInicio)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EnunciadoQuestao;

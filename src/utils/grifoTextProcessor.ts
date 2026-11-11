import { GrifoQuestao, CorGrifo } from '../types';

export interface SegmentoTextoGrifado {
  tipo: 'texto' | 'grifo';
  conteudo: string;
  grifo?: GrifoQuestao;
}

export const ESTILOS_CORES_GRIFO: Record<
  CorGrifo,
  {
    nome: string;
    corHex: string;
    bgBadge: string;
    bgHighlight: string;
    borderHighlight: string;
    textColor: string;
  }
> = {
  yellow: {
    nome: 'Amarelo',
    corHex: '#eab308',
    bgBadge: 'bg-[#eab308]',
    bgHighlight: 'bg-amber-400/35 hover:bg-amber-400/45',
    borderHighlight: 'border-b-2 border-amber-400/80',
    textColor: 'text-amber-100',
  },
  green: {
    nome: 'Verde',
    corHex: '#84cc16',
    bgBadge: 'bg-[#84cc16]',
    bgHighlight: 'bg-lime-500/35 hover:bg-lime-500/45',
    borderHighlight: 'border-b-2 border-lime-400/80',
    textColor: 'text-lime-100',
  },
  pink: {
    nome: 'Rosa',
    corHex: '#ec4899',
    bgBadge: 'bg-[#ec4899]',
    bgHighlight: 'bg-pink-500/35 hover:bg-pink-500/45',
    borderHighlight: 'border-b-2 border-pink-400/80',
    textColor: 'text-pink-100',
  },
  cyan: {
    nome: 'Azul',
    corHex: '#06b6d4',
    bgBadge: 'bg-[#06b6d4]',
    bgHighlight: 'bg-cyan-500/35 hover:bg-cyan-500/45',
    borderHighlight: 'border-b-2 border-cyan-400/80',
    textColor: 'text-cyan-100',
  },
};

/**
 * Processa um texto e aplica os grifos correspondentes, dividindo em segmentos contínuos.
 * Robusto contra quebras de blocos, variações de offsets e espaços.
 */
export function processarTextoComGrifos(
  texto: string,
  grifos: GrifoQuestao[],
  offsetBase: number = 0
): SegmentoTextoGrifado[] {
  if (!texto) return [];
  if (!grifos || grifos.length === 0) {
    return [{ tipo: 'texto', conteudo: texto }];
  }

  interface RangeGrifo {
    start: number;
    end: number;
    grifo: GrifoQuestao;
  }

  const rangesValidos: RangeGrifo[] = [];
  const blocoStart = offsetBase;
  const blocoEnd = offsetBase + texto.length;

  grifos.forEach((g) => {
    if (!g.texto || g.texto.trim().length === 0) return;

    const gStart = Math.min(g.startIndex, g.endIndex);
    const gEnd = Math.max(g.startIndex, g.endIndex);

    // 1. Se o grifo não intersecta este bloco (quando há offsetBase > 0), ignora para este bloco
    if (offsetBase > 0 || (g.startIndex > 0 && g.endIndex > 0 && (gEnd <= blocoStart || gStart >= blocoEnd))) {
      if (gEnd <= blocoStart || gStart >= blocoEnd) {
        return;
      }
    }

    // 2. Tenta offset relativo ao bloco
    let localStart = Math.max(0, gStart - blocoStart);
    let localEnd = Math.min(texto.length, gEnd - blocoStart);
    let matchOffset = false;

    if (localStart >= 0 && localEnd <= texto.length && localEnd > localStart) {
      const sub = texto.substring(localStart, localEnd);
      if (sub === g.texto || sub.trim() === g.texto.trim()) {
        matchOffset = true;
      }
    }

    // 3. Busca perto da posição estimada (janela de ±20 caracteres) para evitar pular para outros parágrafos
    if (!matchOffset) {
      const searchStart = Math.max(0, localStart - 20);
      const searchEnd = Math.min(texto.length, localEnd + 20);
      const areaTexto = texto.substring(searchStart, searchEnd);
      const idxRel = areaTexto.indexOf(g.texto);
      if (idxRel >= 0) {
        localStart = searchStart + idxRel;
        localEnd = localStart + g.texto.length;
        matchOffset = true;
      } else {
        const idxLower = areaTexto.toLowerCase().indexOf(g.texto.toLowerCase());
        if (idxLower >= 0) {
          localStart = searchStart + idxLower;
          localEnd = localStart + g.texto.length;
          matchOffset = true;
        }
      }
    }

    // 4. Fallback global no bloco (apenas se offsetBase for 0 ou se o grifo couber inteiramente no bloco)
    if (!matchOffset) {
      const idxExato = texto.indexOf(g.texto);
      if (idxExato >= 0) {
        localStart = idxExato;
        localEnd = idxExato + g.texto.length;
        matchOffset = true;
      } else {
        const idxLower = texto.toLowerCase().indexOf(g.texto.toLowerCase());
        if (idxLower >= 0) {
          localStart = idxLower;
          localEnd = idxLower + g.texto.length;
          matchOffset = true;
        }
      }
    }

    if (matchOffset && localStart >= 0 && localEnd > localStart && localEnd <= texto.length) {
      rangesValidos.push({ start: localStart, end: localEnd, grifo: g });
    }
  });

  if (rangesValidos.length === 0) {
    return [{ tipo: 'texto', conteudo: texto }];
  }

  // Ordena por posição inicial; se empatar, o mais longo primeiro
  rangesValidos.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));

  // Elimina sobreposições para manter tags válidas
  const rangesFiltrados: RangeGrifo[] = [];
  let ultimoEnd = 0;

  for (const r of rangesValidos) {
    if (r.start >= ultimoEnd) {
      rangesFiltrados.push(r);
      ultimoEnd = r.end;
    } else if (r.end > ultimoEnd && r.start >= rangesFiltrados[rangesFiltrados.length - 1].start) {
      // Sobreposição parcial: ajusta início
      const ajustado = {
        ...r,
        start: ultimoEnd,
      };
      if (ajustado.end > ajustado.start) {
        rangesFiltrados.push(ajustado);
        ultimoEnd = ajustado.end;
      }
    }
  }

  // Constrói os segmentos ordenados
  const segmentos: SegmentoTextoGrifado[] = [];
  let cursor = 0;

  rangesFiltrados.forEach((r) => {
    if (r.start > cursor) {
      segmentos.push({
        tipo: 'texto',
        conteudo: texto.substring(cursor, r.start),
      });
    }

    segmentos.push({
      tipo: 'grifo',
      conteudo: texto.substring(r.start, r.end),
      grifo: r.grifo,
    });

    cursor = r.end;
  });

  if (cursor < texto.length) {
    segmentos.push({
      tipo: 'texto',
      conteudo: texto.substring(cursor),
    });
  }

  return segmentos;
}

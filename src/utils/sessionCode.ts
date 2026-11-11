export function extrairPrefixoBloco(bloco: string): string {
  const trimmed = (bloco || '').trim();
  // Check if starts with digits, e.g. "02_..." -> "02"
  const matchDigits = trimmed.match(/^(\d{1,2})/);
  if (matchDigits) return matchDigits[1].padStart(2, '0');

  // If starts with "Bloco XX", extract the number
  const matchBlocoNum = trimmed.match(/^bloco\s*(\d{1,2})/i);
  if (matchBlocoNum) return matchBlocoNum[1].padStart(2, '0');

  // Otherwise, take the 2 first alphanumeric characters
  const matchStart = trimmed.match(/^([a-zA-Z0-9]{2})/);
  if (matchStart) return matchStart[1].toUpperCase();

  return trimmed.slice(0, 2).toUpperCase() || '01';
}

export function extrairTipoNorma(leiOuDecreto: string): 'L' | 'D' {
  const lower = (leiOuDecreto || '').toLowerCase();
  if (
    lower.includes('decreto') ||
    lower.includes('dec.') ||
    lower.includes('_dec_') ||
    lower.includes('dec_') ||
    lower.startsWith('d_') ||
    lower.startsWith('d.')
  ) {
    return 'D';
  }
  return 'L';
}

export function extrairNumeroNorma(leiOuDecreto: string): string {
  const str = (leiOuDecreto || '').trim();

  // 1. Look for number directly following lei/decreto/dec/nº/n°
  const matchFollowing = str.match(/(?:lei|decreto|dec|nº|n°|num)[_\s.-]*([0-9.]+)/i);
  if (matchFollowing && matchFollowing[1]) {
    const digits = matchFollowing[1].replace(/\./g, '');
    if (digits.length >= 2) return digits;
  }

  // 2. Look for formatted brazilian law numbers like 14.133 or 8.112
  const matchDotNum = str.match(/\b(\d{1,2}\.\d{3})\b/);
  if (matchDotNum) {
    return matchDotNum[1].replace(/\./g, '');
  }

  // 3. Look for 4 to 6 digit numbers (e.g. 14133, 8112, 10406)
  const matchDigits = str.match(/\b(\d{4,6})\b/);
  if (matchDigits) {
    return matchDigits[1];
  }

  // 4. Any standalone numbers (skipping sub-item like 2.1 or 1.1 if a bigger number exists)
  const allNums = str.match(/\d+/g);
  if (allNums && allNums.length > 0) {
    const best = allNums.find((n) => n.length >= 3) || allNums[allNums.length - 1];
    return best;
  }

  return '00';
}

/**
 * Generates standard code: BL + 2 primeiros caracteres do bloco + L (lei) / D (decreto) + numero da Lei/Decreto
 * Example:
 * Bloco: 02_Licitações Contratos Custos
 * Lei: 2.1_Lei_14133_2021_Nova_Lei_Licitacoes_Contratos
 * Result: BL02L14133
 */
export function gerarCodigoSessaoPadrao(bloco: string, leiOuDecreto: string): string {
  const prefixoBloco = extrairPrefixoBloco(bloco);
  const tipo = extrairTipoNorma(leiOuDecreto);
  const numero = extrairNumeroNorma(leiOuDecreto);
  return `BL${prefixoBloco}${tipo}${numero}`;
}

/**
 * Generates session code with sequential suffix: e.g. BL02L14133x1, BL02L14133x2, etc.
 * Tracks existing sessions for this specific block & law.
 * If there are no sessions yet: starts with x1.
 * If there is already 1 session (legacy or x1): next is x2.
 * If x2 exists: next is x3.
 */
export function gerarCodigoSessaoComContagem(
  bloco: string,
  leiOuDecreto: string,
  sessoesExistentes: { codigo?: string; disciplina?: string; assunto?: string }[] = []
): string {
  const base = gerarCodigoSessaoPadrao(bloco, leiOuDecreto);
  const baseRegex = new RegExp(`^${base}(?:x(\\d+))?$`, 'i');

  let maxNum = 0;
  let countMatches = 0;

  for (const s of sessoesExistentes) {
    const cod = (s.codigo || '').trim();
    const match = cod.match(baseRegex);
    if (match) {
      countMatches++;
      if (match[1]) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed > maxNum) {
          maxNum = parsed;
        }
      } else {
        // Exists as base code without 'x' suffix (e.g. legacy session BL02L14133)
        if (maxNum < 1) {
          maxNum = 1;
        }
      }
    } else if (
      s.disciplina &&
      s.assunto &&
      gerarCodigoSessaoPadrao(s.disciplina, s.assunto) === base
    ) {
      countMatches++;
      if (maxNum < countMatches) {
        maxNum = countMatches;
      }
    }
  }

  const proximoNumero = Math.max(maxNum + 1, countMatches + 1, 1);
  return `${base}x${proximoNumero}`;
}

export type CategoriaTipoSessao = 'sessao' | 'simulado' | 'prova_anterior' | 'sessao_escala';

/**
 * Categoriza uma sessão entre:
 * - 'sessao': Sessão de estudo / caderno de lei
 * - 'simulado': Simulado Oficial da prova real (SIM-CTBA-...)
 * - 'prova_anterior': Prova anterior transcrita da banca FAFIPA (PRV-...)
 * - 'sessao_escala': Sessão em escala gerada pelo motor de volume (LOTE-500-...)
 */
export function obterTipoSessao(sessao: {
  tipo?: string;
  codigo?: string;
  assunto?: string;
  disciplina?: string;
}): CategoriaTipoSessao {
  const tipo = String(sessao.tipo || '').toLowerCase();
  const cod = String(sessao.codigo || '').toUpperCase();
  const ass = String(sessao.assunto || '').toLowerCase();
  const dis = String(sessao.disciplina || '').toLowerCase();

  // 1. Escala tem prioridade se for lote
  if (
    tipo === 'sessao_escala' ||
    cod.startsWith('LOTE-') ||
    ass.includes('sessão em escala') ||
    ass.includes('lote-500')
  ) {
    return 'sessao_escala';
  }

  // 2. Simulado oficial da prova real (SIM-CTBA-...)
  if (
    tipo === 'simulado' ||
    cod.startsWith('SIM-') ||
    ass.includes('simulado')
  ) {
    return 'simulado';
  }

  // 3. Prova anterior oficial (FAFIPA concurso real anterior)
  if (
    tipo === 'prova_anterior' ||
    cod.startsWith('PRV-') ||
    cod.startsWith('PROVA-') ||
    cod.startsWith('FAFIPA-201') ||
    cod.startsWith('FAFIPA-202')
  ) {
    return 'prova_anterior';
  }

  if (
    ass.includes('prova anterior') ||
    ass.includes('concurso anterior') ||
    ass.includes('transcrita') ||
    ass.includes('fafipa 20') ||
    ass.includes('fafipa 19') ||
    (ass.includes('prova real') && !ass.includes('simulado') && !dis.includes('simulado'))
  ) {
    return 'prova_anterior';
  }

  return 'sessao';
}

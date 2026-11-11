/**
 * Utilitário puro de normalização de enunciados para deduplicação precisa e rápida.
 * Strips prefixos de numeração (ex: "Questão 01 -", "1.", "Q1:") para garantir que
 * enunciados idênticos com ou sem numeração gerem exatamente a mesma chave.
 */
export function normalizarEnunciadoParaDeduplicacao(enunciado: string | undefined | null): string {
  if (!enunciado) return '';
  let str = String(enunciado).trim();
  // Strip "Questão 01 - ", "Questao 1: ", "Q1. ", "Q.01 - "
  str = str.replace(/^(?:quest[aã]o|q\.?)\s*0*\d{1,3}\b\s*[-:.)=]?\s*/i, '');
  // Strip "01. ", "1) ", "1 - " at start of text
  str = str.replace(/^0*\d{1,3}\s*[-:.)=]\s*/i, '');

  return str
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '')
    .slice(0, 150);
}


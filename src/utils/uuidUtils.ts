/**
 * Utilitários para geração de UUIDv4 e Hashing Determinístico de IDs
 * MiraQuest - Módulo de Rastreamento de Métricas e Questões
 */

/**
 * Gera um UUIDv4 único padrão RFC 4122 para novas questões e entidades
 */
export function gerarUUIDv4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback seguro em ambientes mais antigos
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Converte qualquer ID de texto (UUIDv4 ou alfanumérico como "FAFIPA-PORT-01")
 * em um número inteiro positivo determinístico de 32 bits (1 a 2.147.483.647).
 * Garante dispersão uniforme e elimina colisões causadas por parseInt(replace(/\D/g, ''))
 */
export function hashStringTo32BitInt(str: string | number): number {
  if (typeof str === 'number' && !isNaN(str) && Number.isInteger(str)) {
    return Math.abs(str);
  }
  const s = String(str || '').trim();
  if (!s) return 1;

  // Se já for uma string estritamente numérica curta
  if (/^\d+$/.test(s) && s.length <= 9) {
    const parsed = parseInt(s, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  // Algoritmo Murmur/FNV-1a 32-bit hash
  let hash = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    hash ^= s.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // Garante inteiro positivo positivo dentro do alcance de um INTEGER de 32-bit do Postgres
  const finalHash = (hash >>> 0) % 2147483647;
  return finalHash === 0 ? 1 : finalHash;
}

/**
 * Valida se a string fornecida possui formato de UUID válido
 */
export function ehUUIDValido(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str.trim());
}

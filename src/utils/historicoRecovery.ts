import { Questao, HistoricoRespostasMap, TentativaResposta } from '../types';
import { normalizarEnunciadoParaDeduplicacao } from './normalizarTexto';
import { obterQuestoesProvasAnterioresOficiais } from './provasAnterioresRegistry';

/**
 * Mapeia e recompõe o histórico de respostas para garantir que 100% das tentativas
 * dos usuários fiquem vinculadas às questões ativas do acervo, mesmo após migrações de ID,
 * sincronizações com Supabase ou re-gerações de chave.
 */
export function garantirMapeamentoHistoricoCompleto(
  questoes: Questao[],
  historico: HistoricoRespostasMap
): HistoricoRespostasMap {
  if (!historico || Object.keys(historico).length === 0) {
    return historico || {};
  }

  const mapaResultado: HistoricoRespostasMap = { ...historico };

  // Mapeador de enunciado normalizado -> Lista de questões no acervo com esse enunciado
  const statementToQuestionsMap = new Map<string, Questao[]>();
  const idToQuestionMap = new Map<string, Questao>();

  questoes.forEach((q) => {
    if (!q || q.id == null) return;
    const qIdStr = String(q.id).trim();
    idToQuestionMap.set(qIdStr, q);

    const norm = normalizarEnunciadoParaDeduplicacao(q.enunciado);
    if (norm) {
      if (!statementToQuestionsMap.has(norm)) {
        statementToQuestionsMap.set(norm, []);
      }
      statementToQuestionsMap.get(norm)!.push(q);
    }
  });

  // Mapeador de enunciados para provas oficiais
  const todasProvasOficiais = obterQuestoesProvasAnterioresOficiais();
  const officialStatementToCanonicalMap = new Map<string, string>();
  todasProvasOficiais.forEach((pq) => {
    const norm = normalizarEnunciadoParaDeduplicacao(pq.enunciado);
    if (norm) {
      officialStatementToCanonicalMap.set(norm, String(pq.id));
    }
  });

  // Auxiliar para mesclar tentativas de forma idempotente sem duplicatas
  const mesclarTentativas = (targetKey: string, tentativas: TentativaResposta[]) => {
    if (!targetKey) return;
    if (!mapaResultado[targetKey]) mapaResultado[targetKey] = [];

    tentativas.forEach((t) => {
      const jaExiste = mapaResultado[targetKey].some(
        (existente) =>
          existente.data === t.data &&
          existente.escolha === t.escolha &&
          Boolean(existente.acertou) === Boolean(t.acertou)
      );
      if (!jaExiste) {
        mapaResultado[targetKey].push(t);
      }
    });
  };

  // Processa todas as chaves do histórico
  Object.keys(historico).forEach((keyId) => {
    const tentativas = historico[keyId];
    if (!Array.isArray(tentativas) || tentativas.length === 0) return;

    // Caso 1: A chave existe diretamente nas questões do acervo
    const questaoDirect = idToQuestionMap.get(keyId);
    if (questaoDirect) {
      const norm = normalizarEnunciadoParaDeduplicacao(questaoDirect.enunciado);
      const canonicalId = norm ? officialStatementToCanonicalMap.get(norm) : undefined;

      mesclarTentativas(keyId, tentativas);
      mesclarTentativas(String(questaoDirect.id), tentativas);
      if (canonicalId) mesclarTentativas(canonicalId, tentativas);

      // Associa também a ID numérico correspondente se aplicável
      const numOnly = String(questaoDirect.id).replace(/\D/g, '');
      if (numOnly) mesclarTentativas(numOnly, tentativas);
      return;
    }

    // Caso 2: A chave não bate por ID exato, mas corresponde a um ID numérico que sofreu mutação
    const numOnly = keyId.replace(/\D/g, '');
    if (numOnly) {
      const qMatched = Array.from(idToQuestionMap.values()).find((q) => {
        const qNum = String(q.id).replace(/\D/g, '');
        return qNum === numOnly;
      });
      if (qMatched) {
        mesclarTentativas(String(qMatched.id), tentativas);
        mesclarTentativas(keyId, tentativas);
        return;
      }
    }

    // Caso 3: Procura por enunciado correspondente entre as questões ativas
    // Se a chave não existia mais, preserva sob keyId e copia para a questão com enunciado idêntico
    for (const q of idToQuestionMap.values()) {
      const normQ = normalizarEnunciadoParaDeduplicacao(q.enunciado);
      if (normQ && officialStatementToCanonicalMap.get(normQ) === keyId) {
        mesclarTentativas(String(q.id), tentativas);
      }
    }
  });

  return mapaResultado;
}

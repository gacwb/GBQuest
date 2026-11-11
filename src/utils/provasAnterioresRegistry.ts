import { Questao, SessaoCriada } from '../types';
import {
  TODAS_QUESTOES_PROVAS_FAFIPA_REAIS,
  SESSOES_PROVAS_FAFIPA_INICIAIS,
} from '../data/provasFafipaReais';
import { normalizarEnunciadoParaDeduplicacao } from './normalizarTexto';
import {
  carregarProvasCustomizadasLocalStorage,
  salvarProvasCustomizadasLocalStorage,
  migrarESanitizarProvasPassadas,
} from './uploadProvaUtils';

/**
 * Registro Central de Provas Anteriores Oficiais
 * 
 * Permite que Provas Reais Anteriores (FAFIPA e futuras bancas/órgãos) sejam cadastradas
 * com unicidade garantida, prevenindo duplicações de registros na nuvem e no localStorage.
 */

// Lista canônica de provas cadastradas no sistema
let questoesProvasAnterioresRegistradas: Questao[] = [...TODAS_QUESTOES_PROVAS_FAFIPA_REAIS];
let sessoesProvasAnterioresRegistradas: SessaoCriada[] = [...SESSOES_PROVAS_FAFIPA_INICIAIS];

// Mapas de indexação para busca rápida O(1)
let mapIdsProvasAnteriores = new Set<string>();
let mapEnunciadosProvasAnteriores = new Map<string, Questao>();

function reconstruirIndices() {
  mapIdsProvasAnteriores = new Set<string>();
  mapEnunciadosProvasAnteriores = new Map<string, Questao>();

  questoesProvasAnterioresRegistradas.forEach((q) => {
    mapIdsProvasAnteriores.add(String(q.id).trim().toLowerCase());
    const norm = normalizarEnunciadoParaDeduplicacao(q.enunciado);
    if (norm) {
      mapEnunciadosProvasAnteriores.set(norm, q);
    }
  });
}

// Carrega provas customizadas armazenadas no localStorage
export function carregarProvasCustomizadasArmazenadas(): void {
  try {
    const custom = carregarProvasCustomizadasLocalStorage();
    const { sessoesAtualizadas, questoesAtualizadas } = migrarESanitizarProvasPassadas(
      custom.sessoes || [],
      custom.questoes || []
    );

    if (questoesAtualizadas && questoesAtualizadas.length > 0) {
      questoesAtualizadas.forEach((nq) => {
        const idKey = String(nq.id).trim().toLowerCase();
        const norm = normalizarEnunciadoParaDeduplicacao(nq.enunciado);
        const jaExiste = mapIdsProvasAnteriores.has(idKey) || (norm && mapEnunciadosProvasAnteriores.has(norm));
        if (!jaExiste) {
          questoesProvasAnterioresRegistradas.push(nq);
        }
      });
    }
    if (sessoesAtualizadas && sessoesAtualizadas.length > 0) {
      sessoesAtualizadas.forEach((ns) => {
        const cod = String(ns.codigo || '').toLowerCase();
        const jaExiste = sessoesProvasAnterioresRegistradas.some(
          (s) => String(s.codigo || '').toLowerCase() === cod
        );
        if (!jaExiste) {
          sessoesProvasAnterioresRegistradas.push(ns);
        }
      });
    }
    reconstruirIndices();
  } catch (e) {
    console.warn('Erro ao carregar provas customizadas:', e);
  }
}

// Inicializa índices e carrega provas salvas
reconstruirIndices();
carregarProvasCustomizadasArmazenadas();

/**
 * Retorna todas as questões oficiais registradas de provas anteriores
 */
export function obterQuestoesProvasAnterioresOficiais(): Questao[] {
  return [...questoesProvasAnterioresRegistradas];
}

/**
 * Retorna todas as sessões oficiais registradas de provas anteriores
 */
export function obterSessoesProvasAnterioresOficiais(): SessaoCriada[] {
  return [...sessoesProvasAnterioresRegistradas];
}

/**
 * Registra novas questões de provas anteriores no acervo canônico (extensibilidade para novas provas)
 */
export function registrarNovasProvasAnteriores(
  novasQuestoes: Questao[],
  novasSessoes?: SessaoCriada[]
): void {
  novasQuestoes.forEach((nq) => {
    const idKey = String(nq.id).trim().toLowerCase();
    const norm = normalizarEnunciadoParaDeduplicacao(nq.enunciado);

    const jaExiste =
      mapIdsProvasAnteriores.has(idKey) ||
      (norm && mapEnunciadosProvasAnteriores.has(norm));

    if (!jaExiste) {
      questoesProvasAnterioresRegistradas.push({
        ...nq,
        tipo: 'prova_anterior',
        origem: 'prova_anterior',
        origemTipo: 'prova_passada',
      });
    }
  });

    if (novasSessoes) {
    novasSessoes.forEach((ns) => {
      const cod = String(ns.codigo || '').toLowerCase();
      const jaExiste = sessoesProvasAnterioresRegistradas.some(
        (s) => String(s.codigo || '').toLowerCase() === cod
      );
      if (!jaExiste) {
        sessoesProvasAnterioresRegistradas.push(ns);
      }
    });
  }

  reconstruirIndices();

  // Persiste no localStorage
  salvarProvasCustomizadasLocalStorage({
    questoes: novasQuestoes,
    sessoes: novasSessoes || [],
  });
}

/**
 * Verifica se um ID pertence a uma questão registrada de Prova Anterior
 */
export function ehIdDeProvaAnterior(id: string | number | undefined | null): boolean {
  if (id === undefined || id === null) return false;
  const idStr = String(id).trim().toLowerCase();
  return mapIdsProvasAnteriores.has(idStr);
}

/**
 * Atualiza os metadados (disciplina, assunto, cargo) de uma questão de prova anterior
 * no registro em memória e no armazenamento local de provas customizadas.
 */
export function atualizarQuestaoProvaAnteriorNoRegistro(
  questaoId: string | number,
  novosDados: { disciplina?: string; assunto?: string; cargo?: string }
): boolean {
  if (questaoId === undefined || questaoId === null) return false;
  const idStr = String(questaoId).trim().toLowerCase();
  let alterou = false;

  questoesProvasAnterioresRegistradas = questoesProvasAnterioresRegistradas.map((q) => {
    if (String(q.id).trim().toLowerCase() === idStr) {
      alterou = true;
      return {
        ...q,
        ...(novosDados.disciplina ? { disciplina: novosDados.disciplina } : {}),
        ...(novosDados.assunto ? { assunto: novosDados.assunto } : {}),
        ...(novosDados.cargo !== undefined ? { cargo: novosDados.cargo } : {}),
      };
    }
    return q;
  });

  if (alterou) {
    reconstruirIndices();
    try {
      const custom = carregarProvasCustomizadasLocalStorage();
      let customAlterou = false;
      const updatedQ = (custom.questoes || []).map((q) => {
        if (String(q.id).trim().toLowerCase() === idStr) {
          customAlterou = true;
          return {
            ...q,
            ...(novosDados.disciplina ? { disciplina: novosDados.disciplina } : {}),
            ...(novosDados.assunto ? { assunto: novosDados.assunto } : {}),
            ...(novosDados.cargo !== undefined ? { cargo: novosDados.cargo } : {}),
          };
        }
        return q;
      });
      if (customAlterou) {
        salvarProvasCustomizadasLocalStorage({
          questoes: updatedQ,
          sessoes: custom.sessoes || [],
        });
      }
    } catch (e) {
      console.warn('Erro ao atualizar questao customizada no storage:', e);
    }
  }

  return alterou;
}

/**
 * Localiza a questão canônica de prova anterior correspondente a um item (por ID ou enunciado)
 */
export function encontrarQuestaoCanonicaProvaAnterior(q: Questao): Questao | undefined {
  const idStr = String(q.id || '').trim().toLowerCase();
  if (mapIdsProvasAnteriores.has(idStr)) {
    return questoesProvasAnterioresRegistradas.find(
      (rq) => String(rq.id).trim().toLowerCase() === idStr
    );
  }

  const norm = normalizarEnunciadoParaDeduplicacao(q.enunciado);
  if (norm && mapEnunciadosProvasAnteriores.has(norm)) {
    return mapEnunciadosProvasAnteriores.get(norm);
  }

  return undefined;
}

/**
 * Higieniza e unifica um acervo de questões de forma estritamente idempotente.
 * 
 * Regras:
 * 1. Questões de provas anteriores são unificadas nas 74 questões canônicas registradas
 *    (ou nas N registradas se mais provas forem adicionadas).
 * 2. Qualquer cópia duplicada (com ID numérico ou réplica) é removida do acervo.
 * 3. Questões comuns geradas (simulados, lotes em escala e avulsas) são deduplicadas
 *    por ID único e enunciado normalizado.
 * 4. Nenhuma questão canônica é perdida e o total de provas anteriores é estritamente garantido.
 */
export function sanitizarAcervoQuestoes(
  questoes: Questao[],
  opcoes?: {
    emailUsuario?: string;
    historicoParaRemapear?: Record<string, any[]>;
  }
): {
  questoesLimpass: Questao[];
  idsRemovidos: (string | number)[];
  totalProvasAnteriores: number;
} {
  const statementMap = new Map<string, Questao>();
  const idSet = new Set<string>();
  const idsRemovidos: (string | number)[] = [];

  const todasProvasCanonica = obterQuestoesProvasAnterioresOficiais();

  // 1. Processa questões existentes
  questoes.forEach((q) => {
    if (!q || q.id === undefined || q.id === null) return;

    // Verifica se é uma questão de prova anterior (canônica ou clone legado)
    const canonica = encontrarQuestaoCanonicaProvaAnterior(q);
    if (canonica) {
      const canonicaIdStr = String(canonica.id);
      const qIdStr = String(q.id);

      // Se q é um clone com ID diferente do ID canônico (ex: ID numérico do Supabase), marca para expurgo
      if (canonicaIdStr !== qIdStr) {
        idsRemovidos.push(q.id);
        // Remapeia histórico se fornecido
        if (opcoes?.historicoParaRemapear && opcoes.historicoParaRemapear[qIdStr]) {
          const hist = opcoes.historicoParaRemapear;
          if (!hist[canonicaIdStr]) {
            hist[canonicaIdStr] = hist[qIdStr];
          } else {
            hist[canonicaIdStr] = [...hist[canonicaIdStr], ...hist[qIdStr]];
          }
          delete hist[qIdStr];
        }
        return;
      }

      // Se q é a própria questão canônica
      const norm = normalizarEnunciadoParaDeduplicacao(q.enunciado);
      if (idSet.has(canonicaIdStr)) {
        // Já foi inserida antes nesta mesma lista (duplicata exata de ID)
        idsRemovidos.push(q.id);
        return;
      }

      idSet.add(canonicaIdStr);
      if (norm) statementMap.set(norm, {
        ...canonica,
        origemTipo: 'prova_passada',
        tipo: 'prova_anterior',
        origem: 'prova_anterior',
        ...(opcoes?.emailUsuario ? { user_email: opcoes.emailUsuario } : {}),
      });
      return;
    }

    // Questões normais (simulados, em escala, avulsas)
    const norm = normalizarEnunciadoParaDeduplicacao(q.enunciado);
    const qIdStr = String(q.id);

    if (idSet.has(qIdStr)) {
      idsRemovidos.push(q.id);
      return;
    }

    if (norm) {
      if (statementMap.has(norm)) {
        idsRemovidos.push(q.id);
        return;
      }
      statementMap.set(norm, q);
      idSet.add(qIdStr);
    } else {
      // Sem enunciado normalizável, deduplica apenas por ID
      statementMap.set(`id_${qIdStr}`, q);
      idSet.add(qIdStr);
    }
  });

  // 2. Garante que TODAS as questões canônicas registradas de Provas Anteriores estejam presentes
  todasProvasCanonica.forEach((rq) => {
    const idKey = String(rq.id);
    const norm = normalizarEnunciadoParaDeduplicacao(rq.enunciado);

    if (!idSet.has(idKey) && (!norm || !statementMap.has(norm))) {
      const qCanonica: Questao = {
        ...rq,
        origemTipo: 'prova_passada',
        tipo: 'prova_anterior',
        origem: 'prova_anterior',
        ...(opcoes?.emailUsuario ? { user_email: opcoes.emailUsuario } : {}),
      };
      if (norm) statementMap.set(norm, qCanonica);
      else statementMap.set(`id_${idKey}`, qCanonica);
      idSet.add(idKey);
    }
  });

  const questoesLimpass = Array.from(statementMap.values());

  const totalProvasAnteriores = questoesLimpass.filter(
    (item) => item.origemTipo === 'prova_passada' || ehIdDeProvaAnterior(item.id)
  ).length;

  return {
    questoesLimpass,
    idsRemovidos,
    totalProvasAnteriores,
  };
}

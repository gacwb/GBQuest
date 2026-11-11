/**
 * Módulo de Feedback de Questões (Like / Dislike) e Aprendizado Paramétrico
 *
 * Armazena avaliações do usuário para alimentar continuamente o prompt do Gemini
 * com o que o candidato considerou bom (para replicar) e ruim (para extirpar).
 */

import { Questao } from '../types';

export type FeedbackTipo = 'like' | 'dislike';

export const MOTIVOS_DESCURTIDA_PADRAO = [
  'Cálculo excessivo nas específicas',
  'Enunciado confuso ou prolixo',
  'Gabarito ambíguo ou duvidoso',
  'Comentário raso / sem fundamentação',
  'Fora do padrão da banca FAFIPA',
] as const;

export type MotivoDescurtida = typeof MOTIVOS_DESCURTIDA_PADRAO[number] | string;

export interface FeedbackQuestao {
  id: string; // `fb_${questaoId}`
  questaoId: string | number;
  tipo: FeedbackTipo;
  motivo?: string;
  observacao?: string;
  enunciadoResumido?: string;
  disciplina?: string;
  assunto?: string;
  banca?: string;
  timestamp: number;
}

export const STORAGE_KEY_FEEDBACK = 'gb_questoes_feedback_v1';

/**
 * Carrega todos os feedbacks armazenados no localStorage
 */
export function carregarTodosFeedbacks(): FeedbackQuestao[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FEEDBACK);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Erro ao carregar feedbacks locais:', err);
    return [];
  }
}

/**
 * Salva ou atualiza a avaliação de uma questão
 */
export function salvarFeedbackQuestao(
  questao: {
    id: string | number;
    enunciado?: string;
    disciplina?: string;
    assunto?: string;
    banca?: string;
  },
  tipo: FeedbackTipo,
  motivo?: string,
  observacao?: string
): FeedbackQuestao {
  const existentes = carregarTodosFeedbacks();
  const questaoIdStr = String(questao.id);

  const novoFeedback: FeedbackQuestao = {
    id: `fb_${questaoIdStr}`,
    questaoId: questao.id,
    tipo,
    motivo: motivo || undefined,
    observacao: observacao || undefined,
    enunciadoResumido: questao.enunciado ? questao.enunciado.slice(0, 160).replace(/\s+/g, ' ').trim() : '',
    disciplina: questao.disciplina,
    assunto: questao.assunto,
    banca: questao.banca || 'FAFIPA',
    timestamp: Date.now(),
  };

  const filtrados = existentes.filter((f) => String(f.questaoId) !== questaoIdStr);
  const atualizados = [novoFeedback, ...filtrados];

  try {
    localStorage.setItem(STORAGE_KEY_FEEDBACK, JSON.stringify(atualizados));
  } catch (err) {
    console.warn('Erro ao persistir feedback no localStorage:', err);
  }

  return novoFeedback;
}

/**
 * Remove a avaliação de uma questão
 */
export function removerFeedbackQuestao(questaoId: string | number): void {
  const existentes = carregarTodosFeedbacks();
  const questaoIdStr = String(questaoId);
  const filtrados = existentes.filter((f) => String(f.questaoId) !== questaoIdStr);

  try {
    localStorage.setItem(STORAGE_KEY_FEEDBACK, JSON.stringify(filtrados));
  } catch (err) {
    console.warn('Erro ao remover feedback:', err);
  }
}

/**
 * Obtém o feedback atual de uma questão específica
 */
export function obterFeedbackQuestao(questaoId: string | number): FeedbackQuestao | undefined {
  const existentes = carregarTodosFeedbacks();
  const questaoIdStr = String(questaoId);
  return existentes.find((f) => String(f.questaoId) === questaoIdStr);
}

/**
 * Relatório consolidado para exibir ao usuário e orientar a IA
 */
export interface ResumoAprendizadoFeedback {
  totalLikes: number;
  totalDislikes: number;
  totalAvaliacoes: number;
  taxaAprovacao: number; // 0 a 100%
  motivosFrequentes: { motivo: string; quantidade: number }[];
  exemplosCurtidos: string[];
  exemplosDescurtidos: { texto: string; motivo?: string }[];
}

export function obterResumoAprendizadoFeedback(): ResumoAprendizadoFeedback {
  const feedbacks = carregarTodosFeedbacks();
  const likes = feedbacks.filter((f) => f.tipo === 'like');
  const dislikes = feedbacks.filter((f) => f.tipo === 'dislike');

  const contagemMotivos: Record<string, number> = {};
  dislikes.forEach((d) => {
    const m = d.motivo || 'Outro';
    contagemMotivos[m] = (contagemMotivos[m] || 0) + 1;
  });

  const motivosFrequentes = Object.entries(contagemMotivos)
    .map(([motivo, quantidade]) => ({ motivo, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade);

  const totalAvaliacoes = feedbacks.length;
  const taxaAprovacao = totalAvaliacoes > 0 ? Math.round((likes.length / totalAvaliacoes) * 100) : 100;

  const exemplosCurtidos = likes
    .slice(0, 5)
    .map((l) => l.enunciadoResumido || '')
    .filter(Boolean);

  const exemplosDescurtidos = dislikes.slice(0, 5).map((d) => ({
    texto: d.enunciadoResumido || '',
    motivo: d.motivo,
  }));

  return {
    totalLikes: likes.length,
    totalDislikes: dislikes.length,
    totalAvaliacoes,
    taxaAprovacao,
    motivosFrequentes,
    exemplosCurtidos,
    exemplosDescurtidos,
  };
}

export const QUORUM_MINIMO_AVALIACOES = 25;
export const MINIMO_RECORRENCIA_MOTIVO = 3;

/**
 * MODO PASSIVO DE COLETA ESTATÍSTICA:
 * Quando false, os botões de like/deslike continuam ativos e salvando avaliações normalmente,
 * mas a IA NÃO aplica restrições personalizadas ao prompt do Gemini (mesmo passando o quórum de 25).
 * A geração permanece 100% no padrão canônico da FAFIPA, permitindo testes sem viés.
 */
export const MODO_APRENDIZADO_ATIVO = false;

/**
 * Gera o bloco de instruções para a IA Gemini com base no aprendizado acumulado.
 * 
 * PROTEÇÕES ESTATÍSTICAS E ANTI-REPETIÇÃO:
 * 1. Modo Passivo (MODO_APRENDIZADO_ATIVO = false): Enquanto desativado, apenas acumula amostragem sem interferir na IA.
 * 2. Quórum de 25 Avaliações: A IA só aplica restrições personalizadas se houver maturidade estatística (>= 25 avaliações).
 * 3. Gatilho de Recorrência (>= 3): Deslikes isolados são descartados como ruído. Apenas padrões recorrentes viram proibições.
 * 4. Blindagem dos Parâmetros Basilares: O aprendizado jamais altera estrutura (40Q), ordenação (Q1-5 Port, Q6-10 Info, Q11-40 Esp) ou gabarito 8A-8B-8C-8D-8E.
 * 5. Anti-Mode Collapse (Anti-Repetição): O Like é puramente estilístico/abstrato. Nenhum texto ou artigo curtido é passado à IA como molde, garantindo máxima diversidade temática.
 */
export function gerarPromptAprendizadoFeedback(): string {
  // MODO PASSIVO ATIVO: Não injeta regras na IA, mantendo 100% a memória canônica da banca FAFIPA
  if (!MODO_APRENDIZADO_ATIVO) {
    return [
      'MEMÓRIA CANÔNICA DA BANCA (FAFIPA PARAMÉTRICA):',
      '• Privilegie enunciados objetivos, técnicos e conceituais de Engenharia Civil sem contas matemáticas complexas.',
      '• Fundamente sempre a alternativa correta com a lei municipal ou norma ABNT NBR correspondente.',
      '• Mantenha máxima diversidade de cobrança conceitual no escopo oficial do edital.',
    ].join('\n');
  }

  const resumo = obterResumoAprendizadoFeedback();

  // FASE DE AQUECIMENTO (Abaixo do Quórum de 25 avaliações):
  // Opera estritamente no DNA base canônico da banca FAFIPA, sem regras personalizadas prematuras.
  if (resumo.totalAvaliacoes < QUORUM_MINIMO_AVALIACOES) {
    return [
      'MEMÓRIA CANÔNICA DA BANCA (FAFIPA PARAMÉTRICA):',
      '• Privilegie enunciados objetivos, técnicos e conceituais de Engenharia Civil sem contas matemáticas complexas.',
      '• Fundamente sempre a alternativa correta com a lei municipal ou norma ABNT NBR correspondente.',
      '• Mantenha máxima diversidade de cobrança conceitual no escopo oficial do edital.',
    ].join('\n');
  }

  // MOTIVOS CONFIRMADOS: Apenas os que possuem 3 ou mais ocorrências comprovadas
  const motivosConfirmados = resumo.motivosFrequentes.filter(
    (m) => m.quantidade >= MINIMO_RECORRENCIA_MOTIVO
  );

  const linhas: string[] = [];
  linhas.push('MEMÓRIA DE APRENDIZADO REFORÇADO COM FEEDBACK DO CANDIDATO (AMOSTRAGEM CONSOLIDADA):');
  linhas.push(
    `Amostragem estatística madura: ${resumo.totalAvaliacoes} avaliações acumuladas (${resumo.totalLikes} likes 👍 / ${resumo.totalDislikes} dislikes 👎).`
  );

  if (motivosConfirmados.length > 0) {
    linhas.push('\nPADRÕES RECORRENTES REJEITADOS PELO CANDIDATO (ESTRITAMENTE PROIBIDO REPETIR):');
    motivosConfirmados.forEach((m) => {
      linhas.push(`- NÃO FAZER: ${m.motivo} (confirmado em ${m.quantidade} avaliações com deslike).`);
    });
  }

  linhas.push('\nPADRÕES EXIGIDOS DE QUALIDADE FORMAL E RIGOR (REPLICAR SEMPRE):');
  linhas.push('- Questões 100% conceituais nas específicas: memorize e cobre definições, prazos, competências e procedimentos procedimentais sem contas manuais.');
  linhas.push('- Citação formal expressa no comentário: indicar número do artigo da lei ou seção exata da NBR.');
  linhas.push('- Alternativas A, B, C, D, E homogêneas em tamanho e gramaticalmente perfeitas.');

  linhas.push('\nBLINDAGEM DE DIVERSIDADE TEMÁTICA E PARÂMETROS BASILARES (INVIOLÁVEL):');
  linhas.push('- DIVERSIDADE MANDATÓRIA: Garanta máxima amplitude e diversidade temática. Nunca replique a mesma situação-problema, mesmo prazo numérico ou mesmo artigo já explorado em questões vizinhas.');
  linhas.push('- PARÂMETROS BASILARES: Estas diretrizes de qualidade refinam o estilo, mas JAMAIS podem anular ou alterar a ordenação oficial da prova, as cotas de tipologias da banca ou o gabarito balanceado 8A, 8B, 8C, 8D, 8E.');

  return linhas.join('\n');
}

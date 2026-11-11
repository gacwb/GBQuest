/**
 * Módulo de Lógica para Filtros de Seleção Múltipla no Banco de Questões
 * 
 * Suporta combinações de:
 * - 'simulados': apenas questões geradas/utilizadas nos simulados oficiais
 * - 'resolvidas': questões com ao menos 1 resolução no histórico
 * - 'nao-resolvidas': questões sem resoluções
 * - 'acertei': questões cuja última resolução foi acerto
 * - 'errei': questões cuja última resolução foi erro
 * - 'caderno-erros': questões com histórico de erro (reincidente, inédito ou recuperado)
 */

import { Questao, TentativaResposta } from '../types';
import { classificarStatusCaderno, ModoFiltroCaderno, StatusErroCaderno } from './cadernoErros';
import { ehIdDeProvaAnterior, encontrarQuestaoCanonicaProvaAnterior } from './provasAnterioresRegistry';

export type TipoChipFiltroBanco =
  | 'simulados'
  | 'em-escala'
  | 'provas-anteriores'
  | 'resolvidas'
  | 'nao-resolvidas'
  | 'acertei'
  | 'errei';

/**
 * Identifica se uma questão pertence às Provas Reais Anteriores da FAFIPA
 */
export function ehQuestaoProvaAnterior(
  q: Questao,
  idsProvasAnteriores?: Set<string | number>
): boolean {
  const idStr = String(q.id || '').trim().toLowerCase();
  const idNum = Number(q.id);
  const orig = String((q as any).origem || '').toLowerCase();
  const tipo = String((q as any).tipo || '').toLowerCase();
  const ass = String(q.assunto || '').toLowerCase();
  const dis = String(q.disciplina || '').toLowerCase();

  // 1. Exclusão mandatória: se a questão for de simulado ou lote em escala, NUNCA é prova anterior
  if (
    q.origemTipo === 'lote_escala' ||
    orig === 'sessao_escala' ||
    tipo === 'sessao_escala' ||
    Boolean(q.loteCodigo) ||
    idStr.startsWith('lote') ||
    q.origemTipo === 'simulado' ||
    orig === 'simulado' ||
    tipo === 'simulado' ||
    (q as any).simulado === true ||
    idStr.startsWith('sim_')
  ) {
    return false;
  }

  // 2. Registro canônico de provas oficiais (FAFIPA Arapongas, Triunfo, Campo Magro, Lunardelli, Sarandi, Diamante, Educa, Sesa, etc.)
  if (ehIdDeProvaAnterior(q.id)) {
    return true;
  }

  // 3. Padrão canônico de prefixo de prova real da FAFIPA ou de provas transcritas
  if (idStr.startsWith('fafipa_') || idStr.startsWith('prv_')) {
    return true;
  }

  // 4. Verificação de correspondência com o acervo canônico registrado
  if (encontrarQuestaoCanonicaProvaAnterior(q)) {
    return true;
  }

  // 5. Alta autoridade relacional: Se a sessão de prova anterior oficial registrou este ID
  if (
    idsProvasAnteriores &&
    (idsProvasAnteriores.has(idStr) ||
      idsProvasAnteriores.has(String(q.id).trim()) ||
      (!isNaN(idNum) && idsProvasAnteriores.has(idNum)) ||
      idsProvasAnteriores.has(q.id))
  ) {
    return true;
  }

  // 6. Metadados explícitos de prova passada (desde que não seja simulado ou estudo avulso)
  if (q.origemTipo === 'prova_passada' || orig === 'prova_anterior' || tipo === 'prova_anterior') {
    if (ass.includes('simulado') || dis.includes('simulado')) {
      return false;
    }
    return true;
  }

  // 7. Heurística textual restrita a provas reais da FAFIPA/órgãos públicos oficiais
  const banca = String(q.banca || '').toLowerCase();
  return (
    (banca.includes('prova real') && !ass.includes('simulado') && !dis.includes('simulado')) ||
    dis.includes('paranaeduca') ||
    dis.includes('sesa')
  );
}

/**
 * Identifica se uma questão foi gerada em escala / lotes massivos (ex: LOTE-500)
 */
export function ehQuestaoEmEscala(
  q: Questao,
  idsEscala?: Set<string | number>,
  idsProvasAnteriores?: Set<string | number>
): boolean {
  // Prova real nunca é lote em escala
  if (ehQuestaoProvaAnterior(q, idsProvasAnteriores)) {
    return false;
  }

  const idStr = String(q.id || '').toLowerCase();
  const idNum = Number(q.id);

  // 1. Alta autoridade relacional: Se a sessão declarou este ID como escala
  if (idsEscala && (idsEscala.has(idStr) || (!isNaN(idNum) && idsEscala.has(idNum)) || idsEscala.has(q.id))) {
    return true;
  }

  // 2. Metadados explícitos da questão
  if (q.origemTipo === 'lote_escala') return true;
  if (Boolean(q.loteCodigo)) return true;
  if ((q as any).origem === 'sessao_escala' || (q as any).tipo === 'sessao_escala') return true;
  if (idStr.startsWith('lote500_') || idStr.startsWith('lote_')) return true;

  // 3. Detecção textual heurística de lote
  const ass = String(q.assunto || '').toLowerCase();
  const dis = String(q.disciplina || '').toLowerCase();
  return (
    ass.includes('lote-500') ||
    ass.includes('lote em escala') ||
    dis.includes('lote em escala') ||
    dis.includes('500q')
  );
}

/**
 * Identifica se uma questão pertence aos Simulados
 * (Exclui estritamente Provas Anteriores Reais e Questões geradas em Escala)
 */
export function ehQuestaoSimulado(
  q: Questao,
  idsSimulados: Set<string | number>,
  idsEscala?: Set<string | number>,
  idsProvasAnteriores?: Set<string | number>
): boolean {
  if (ehQuestaoProvaAnterior(q, idsProvasAnteriores)) return false;
  if (ehQuestaoEmEscala(q, idsEscala, idsProvasAnteriores)) return false;

  const qIdStr = String(q.id).trim();
  const qIdNum = Number(q.id);

  // 1. Alta autoridade relacional: Se a sessão de simulado declarou este ID
  if (
    idsSimulados &&
    (idsSimulados.has(qIdStr) || (!isNaN(qIdNum) && idsSimulados.has(qIdNum)) || idsSimulados.has(q.id))
  ) {
    return true;
  }

  // 2. Metadados diretos de simulado
  if (q.origemTipo === 'simulado') return true;
  if ((q as any).origem === 'simulado' || (q as any).simulado === true) return true;

  const idStr = String(q.id || '').toLowerCase();
  if (idStr.startsWith('sim_') || idStr.startsWith('simulado_')) return true;

  const ass = String(q.assunto || '').toLowerCase();
  const dis = String(q.disciplina || '').toLowerCase();
  const art = String(q.artigo || '').toLowerCase();

  // Apenas considera simulado se contiver menção explícita de simulado no assunto ou código
  if (!ass.includes('lote') && !dis.includes('lote')) {
    if (ass.includes('simulado') || art.includes('simulado')) {
      return true;
    }
  }

  return false;
}

export interface ParametrosFiltroMultiploBanco {
  questoes: Questao[];
  snapshotHistorico: Record<string | number, TentativaResposta[]>;
  idsSimulados: Set<string | number>;
  idsEscala?: Set<string | number>;
  idsProvasAnteriores?: Set<string | number>;
  chipsSelecionados: TipoChipFiltroBanco[];
  modoCadernoAtivo?: boolean;
  modoFiltroCaderno?: ModoFiltroCaderno;
  chipsCadernoSelecionados?: StatusErroCaderno[];
  filtroPalavra?: string;
  bancoBlocosSelecionados?: string[];
  bancoMateriasSelecionadas?: string[];
  gruposBlocosFiltro?: { blocoNome: string; materias: { key: string }[] }[];
}

/**
 * Avalia se uma questão atende aos filtros múltiplos selecionados
 */
export function questaoAtendeFiltrosMultiplos(
  q: Questao,
  historicoQ: TentativaResposta[] = [],
  idsSimulados: Set<string | number>,
  chips: TipoChipFiltroBanco[],
  modoCadernoAtivo: boolean = false,
  modoFiltroCaderno: ModoFiltroCaderno = 'todos',
  chipsCadernoSelecionados: StatusErroCaderno[] = [],
  idsEscala?: Set<string | number>,
  idsProvasAnteriores?: Set<string | number>
): boolean {
  const resolvida = historicoQ.length > 0;
  const ultimaTentativa = resolvida ? historicoQ[historicoQ.length - 1] : null;
  const acertouUltima = ultimaTentativa ? ultimaTentativa.acertou : false;
  const jaFoiErradaAoMenosUmaVez = historicoQ.some((t) => !t.acertou);

  // Modo especial: Caderno de Erros
  if (modoCadernoAtivo) {
    const infoCaderno = classificarStatusCaderno(historicoQ);
    if (!infoCaderno) return false;

    // Se houver seleção múltipla de chips do Caderno de Erros (ex: ['reincidente', 'inedito'])
    if (chipsCadernoSelecionados && chipsCadernoSelecionados.length > 0) {
      if (!chipsCadernoSelecionados.includes(infoCaderno.status)) {
        return false;
      }
    } else if (modoFiltroCaderno && modoFiltroCaderno !== 'todos') {
      // Fallback para compatibilidade caso modoFiltroCaderno ainda seja usado
      if (modoFiltroCaderno === 'reincidentes' && infoCaderno.status !== 'reincidente') return false;
      if (modoFiltroCaderno === 'ineditos' && infoCaderno.status !== 'inedito') return false;
      if (modoFiltroCaderno === 'recuperadas' && infoCaderno.status !== 'recuperada') return false;
    }
  }

  // Se nenhum chip estiver selecionado, passa livre no critério de status
  if (chips.length === 0) {
    return true;
  }

  // 1. Filtros de Origem ('simulados', 'em-escala', 'provas-anteriores'):
  // Se houver filtros de origem selecionados, a questão deve atender a pelo menos um deles (união/OR)
  const temFiltroSimulados = chips.includes('simulados');
  const temFiltroEscala = chips.includes('em-escala');
  const temFiltroProvasAnteriores = chips.includes('provas-anteriores');
  const chipsOrigemCount = [temFiltroSimulados, temFiltroEscala, temFiltroProvasAnteriores].filter(Boolean).length;

  if (chipsOrigemCount > 0) {
    let atendeOrigem = false;
    if (temFiltroSimulados && ehQuestaoSimulado(q, idsSimulados, idsEscala, idsProvasAnteriores)) {
      atendeOrigem = true;
    }
    if (temFiltroEscala && ehQuestaoEmEscala(q, idsEscala, idsProvasAnteriores)) {
      atendeOrigem = true;
    }
    if (temFiltroProvasAnteriores && ehQuestaoProvaAnterior(q, idsProvasAnteriores)) {
      atendeOrigem = true;
    }
    if (!atendeOrigem) {
      return false;
    }
  }

  // 2. Filtros de Status de Resolução e Desempenho
  const temFiltroResolvidas = chips.includes('resolvidas');
  const temFiltroNaoResolvidas = chips.includes('nao-resolvidas');
  const temFiltroAcertei = chips.includes('acertei');
  const temFiltroErrei = chips.includes('errei');

  const chipsStatusDesempenho = [
    temFiltroResolvidas,
    temFiltroNaoResolvidas,
    temFiltroAcertei,
    temFiltroErrei,
  ].filter(Boolean).length;

  // Se o usuário só selecionou filtros de origem ('simulados', 'em-escala' ou 'provas-anteriores') e nenhum status, já passou
  if (chipsStatusDesempenho === 0) {
    return true;
  }

  // Avaliação combinada multi-seleção de status:
  // - 'resolvidas' -> resolvida
  // - 'nao-resolvidas' -> !resolvida
  // - 'acertei' -> resolvida && acertouUltima
  // - 'errei' -> jaFoiErradaAoMenosUmaVez (todas que já foram erradas ao menos 1 vez no sistema, somatório cumulativo)
  let atendeAlgumStatus = false;

  if (temFiltroResolvidas && resolvida) {
    atendeAlgumStatus = true;
  }
  if (temFiltroNaoResolvidas && !resolvida) {
    atendeAlgumStatus = true;
  }
  if (temFiltroAcertei && resolvida && acertouUltima) {
    atendeAlgumStatus = true;
  }
  if (temFiltroErrei && jaFoiErradaAoMenosUmaVez) {
    atendeAlgumStatus = true;
  }

  return atendeAlgumStatus;
}

/**
 * Aplica os filtros múltiplos sobre a lista completa de questões
 */
export function aplicarFiltrosMultiplosBanco(params: ParametrosFiltroMultiploBanco): Questao[] {
  const {
    questoes,
    snapshotHistorico,
    idsSimulados,
    idsEscala,
    idsProvasAnteriores,
    chipsSelecionados,
    modoCadernoAtivo = false,
    modoFiltroCaderno = 'todos',
    chipsCadernoSelecionados = [],
    filtroPalavra = '',
    bancoBlocosSelecionados = [],
    bancoMateriasSelecionadas = [],
    gruposBlocosFiltro = [],
  } = params;

  const palavra = filtroPalavra.toLowerCase().trim();

  return questoes.filter((q) => {
    const historicoQ = snapshotHistorico[String(q.id)] || snapshotHistorico[Number(q.id)] || [];

    // 1. Critério de Status e Origem
    if (
      !questaoAtendeFiltrosMultiplos(
        q,
        historicoQ,
        idsSimulados,
        chipsSelecionados,
        modoCadernoAtivo,
        modoFiltroCaderno,
        chipsCadernoSelecionados,
        idsEscala,
        idsProvasAnteriores
      )
    ) {
      return false;
    }

    // 2. Filtro textual por palavra-chave
    if (palavra) {
      const matchPalavra =
        q.enunciado.toLowerCase().includes(palavra) ||
        (q.assunto && q.assunto.toLowerCase().includes(palavra)) ||
        (q.artigo && q.artigo.toLowerCase().includes(palavra)) ||
        (q.disciplina && q.disciplina.toLowerCase().includes(palavra));
      if (!matchPalavra) return false;
    }

    // 3. Filtro hierárquico de blocos e matérias
    // Aplica a restrição de bloco se o usuário selecionou blocos no dropdown
    if (bancoBlocosSelecionados.length > 0) {
      if (!q.disciplina) return false;
      const qDiscNorm = q.disciplina.trim().toLowerCase();
      const matchBloco = bancoBlocosSelecionados.some((b) => {
        const bNorm = b.trim().toLowerCase();
        return qDiscNorm === bNorm || qDiscNorm.includes(bNorm) || bNorm.includes(qDiscNorm);
      });
      if (!matchBloco) return false;
    }

    // Aplica a restrição de matéria específica se selecionada
    if (bancoMateriasSelecionadas.length > 0) {
      if (!q.assunto) return false;
      const qDiscNorm = (q.disciplina || '').trim().toLowerCase();
      const qAssNorm = q.assunto.trim().toLowerCase();
      const chaveNorm = `${qDiscNorm}:::${qAssNorm}`;

      const matchMateria = bancoMateriasSelecionadas.some((mKey) => {
        const mKeyNorm = mKey.trim().toLowerCase();
        if (mKeyNorm === chaveNorm) return true;
        if (mKeyNorm.endsWith(`:::${qAssNorm}`)) return true;
        const [blocoPart, matNomePart] = mKeyNorm.split(':::');
        const targetMat = (matNomePart || mKeyNorm).trim();
        if (targetMat) {
          const codMat = targetMat.slice(0, 3);
          if (codMat && !isNaN(Number(codMat))) {
            if (qAssNorm.startsWith(codMat) || qAssNorm.includes(codMat)) {
              return true;
            }
          }
        }
        return mKeyNorm.includes(qAssNorm) || qAssNorm.includes(targetMat);
      });
      if (!matchMateria) return false;
    }

    return true;
  });
}

/**
 * Calcula a quantidade de questões que atendem a cada chip individualmente para exibir nos badges
 */
export function calcularContagensChipsBanco(
  questoes: Questao[],
  snapshotHistorico: Record<string | number, TentativaResposta[]>,
  idsSimulados: Set<string | number>,
  idsEscala?: Set<string | number>,
  idsProvasAnteriores?: Set<string | number>
): Record<TipoChipFiltroBanco, number> {
  const contagens: Record<TipoChipFiltroBanco, number> = {
    simulados: 0,
    'em-escala': 0,
    'provas-anteriores': 0,
    resolvidas: 0,
    'nao-resolvidas': 0,
    acertei: 0,
    errei: 0,
  };

  questoes.forEach((q) => {
    const qIdStr = String(q.id).trim();
    const qIdNum = Number(q.id);
    const historicoQ = snapshotHistorico[qIdStr] || snapshotHistorico[qIdNum] || [];
    const resolvida = historicoQ.length > 0;
    const ultimaTentativa = resolvida ? historicoQ[historicoQ.length - 1] : null;
    const acertouUltima = ultimaTentativa ? ultimaTentativa.acertou : false;

    // 1. Provas Anteriores
    if (ehQuestaoProvaAnterior(q, idsProvasAnteriores)) {
      contagens['provas-anteriores']++;
    } else if (ehQuestaoEmEscala(q, idsEscala, idsProvasAnteriores)) {
      // 2. Em Escala (Lotes Massivos)
      contagens['em-escala']++;
    } else if (ehQuestaoSimulado(q, idsSimulados, idsEscala, idsProvasAnteriores)) {
      // 3. Simulados (isolado estritamente)
      contagens.simulados++;
    }

    // Resolvidas e Não Resolvidas
    if (resolvida) {
      contagens.resolvidas++;
      if (acertouUltima) {
        contagens.acertei++;
      }
    } else {
      contagens['nao-resolvidas']++;
    }

    // Errei: todas as questões já erradas ao menos 1 vez no sistema (conforme Desempenho e Caderno)
    const jaFoiErradaAoMenosUmaVez = historicoQ.some((t) => !t.acertou);
    if (jaFoiErradaAoMenosUmaVez) {
      contagens.errei++;
    }
  });

  return contagens;
}

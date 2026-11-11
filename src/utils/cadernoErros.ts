import { Questao, HistoricoRespostasMap, TentativaResposta, RegistroTempoSessao, SessaoCriada } from '../types';
import { construirMapaTempoTentativas } from './tempoQuestoes';

export type StatusErroCaderno = 'inedito' | 'reincidente' | 'recuperada';
export type ModoFiltroCaderno = 'todos' | 'reincidentes' | 'ineditos' | 'recuperadas';

export interface QuestaoCadernoInfo {
  questao: Questao;
  status: StatusErroCaderno;
  totalTentativas: number;
  totalErros: number;
  ultimaTentativa: TentativaResposta | null;
  primeiroErroData: number;
  ultimoErroData: number;
}

/**
 * Determina se uma tentativa de resposta foi realizada estritamente PELO Caderno de Erros
 * tentando recuperar a questão (e não em uma sessão regular ou na primeira vez em que foi errada).
 */
export function ehTentativaDoCaderno(
  tentativa: TentativaResposta,
  todasTentativasDaQuestao: TentativaResposta[],
  sessoesCriadas?: SessaoCriada[],
  registrosTempo?: RegistroTempoSessao[]
): boolean {
  // 1. Se foi explicitamente marcada com a origem
  if (tentativa.origem === 'caderno') return true;
  if (tentativa.origem === 'sessao') return false;

  // 2. Se a tentativa for anterior ou igual ao primeiro erro da questão,
  // ela é a resolução original que gerou a inclusão no caderno, e NUNCA uma tentativa de recuperação!
  const erros = (todasTentativasDaQuestao || []).filter((t) => !t.acertou);
  if (erros.length === 0) return false;
  const primeiroErro = erros[0];
  if (tentativa.data <= primeiroErro.data) return false;

  // 3. Se a tentativa ocorreu como parte de uma sessão de estudo/simulado criada
  if (sessoesCriadas && sessoesCriadas.length > 0) {
    const qIdStr = String(tentativa.questaoId || '');
    const ehDeSessao = sessoesCriadas.some((s) => {
      const temQuestao = (s.questaoIds || []).some((id) => String(id) === qIdStr);
      if (!temQuestao) return false;
      const sData = s.created_at ? new Date(s.created_at).getTime() : 0;
      return sData > 0 && Math.abs(tentativa.data - sData) < 30 * 60 * 1000;
    });
    if (ehDeSessao) return false;
  }

  // 4. Se a questão já havia sido errada antes desta tentativa (tentativa.data > primeiroErro.data)
  // e não pertence a uma sessão normal de estudos, ela é uma resolução do Caderno de Erros!
  return true;
}

/**
 * Sanitização defensiva em memória:
 * - Ordena cronologicamente por timestamp (data)
 * - Agrupa tentativas em janela <= 5 segundos (debounce contra duplo clique ou falha de rede)
 * - Mescla atualizações de tempo da mesma resposta sem criar linhas clonadas
 */
export function sanitizarHistoricoTentativasDefensivo(
  tentativas: TentativaResposta[] = []
): TentativaResposta[] {
  if (!Array.isArray(tentativas) || tentativas.length === 0) return [];

  // Ordena cronologicamente por data (mais antigas primeiro)
  const ordenadas = [...tentativas].sort((a, b) => (Number(a.data) || 0) - (Number(b.data) || 0));
  const resultado: TentativaResposta[] = [];

  for (let i = 0; i < ordenadas.length; i++) {
    const atual = ordenadas[i];
    if (!atual) continue;

    if (resultado.length === 0) {
      resultado.push({ ...atual });
      continue;
    }

    const anterior = resultado[resultado.length - 1];
    const deltaMs = Math.abs((Number(atual.data) || 0) - (Number(anterior.data) || 0));

    // Trava de 5 segundos contra duplicatas de rede / cliques repetidos
    if (deltaMs <= 5000) {
      if (atual.escolha === anterior.escolha || atual.acertou === anterior.acertou) {
        if ((Number(atual.tempoSegundos) || 0) > (Number(anterior.tempoSegundos) || 0)) {
          anterior.tempoSegundos = atual.tempoSegundos;
        }
        continue; // Descarta a duplicata
      }
    }

    resultado.push({ ...atual });
  }

  return resultado;
}

/**
 * Determina o status no Caderno de Erros para uma dada questão com base em seu histórico de tentativas.
 * Aplica a Máquina de Estados Estrita sobre o histórico sanitizado em janela de 5s:
 * - null: A questão nunca teve erro no histórico sanitizado.
 * - 'inedito': A questão possui exatamente 1 tentativa no histórico e foi ERRO (aguardando 1ª revisão).
 * - 'recuperada': A questão teve erro anterior, possui 2+ tentativas, e a ÚLTIMA tentativa foi ACERTO.
 * - 'reincidente': A questão teve erro anterior, possui 2+ tentativas, e a ÚLTIMA tentativa foi ERRO.
 */
export function classificarStatusCaderno(tentativas: TentativaResposta[]): {
  status: StatusErroCaderno;
  totalTentativas: number;
  totalErros: number;
  ultimaTentativa: TentativaResposta;
  primeiroErroData: number;
  ultimoErroData: number;
} | null {
  if (!tentativas || tentativas.length === 0) return null;

  // 1. Sanitiza previamente o histórico contra falsos positivos e duplicações
  const sanitizadas = sanitizarHistoricoTentativasDefensivo(tentativas);
  if (sanitizadas.length === 0) return null;

  const erros = sanitizadas.filter((t) => !t.acertou);
  if (erros.length === 0) {
    // Nunca foi errada
    return null;
  }

  const ultimaTentativa = sanitizadas[sanitizadas.length - 1];
  const primeiroErro = erros[0];
  const ultimoErro = erros[erros.length - 1];

  let status: StatusErroCaderno;
  if (sanitizadas.length === 1) {
    status = 'inedito';
  } else if (ultimaTentativa.acertou) {
    status = 'recuperada';
  } else {
    status = 'reincidente';
  }

  return {
    status,
    totalTentativas: sanitizadas.length,
    totalErros: erros.length,
    ultimaTentativa,
    primeiroErroData: primeiroErro.data,
    ultimoErroData: ultimoErro.data,
  };
}

/**
 * Obtém todas as questões pertencentes ao Caderno de Erros (que já foram erradas ao menos 1 vez na base).
 * Ordenação padrão do Caderno:
 * 1. Reincidentes (no topo)
 * 2. Inéditos (no meio)
 * 3. Recuperadas (no final)
 */
export function obterQuestoesCadernoErros(
  questoes: Questao[],
  historico: HistoricoRespostasMap
): QuestaoCadernoInfo[] {
  const caderno: QuestaoCadernoInfo[] = [];

  questoes.forEach((q) => {
    const tentativas = historico[String(q.id)] || historico[Number(q.id)] || [];
    const info = classificarStatusCaderno(tentativas);
    if (info) {
      caderno.push({
        questao: q,
        status: info.status,
        totalTentativas: info.totalTentativas,
        totalErros: info.totalErros,
        ultimaTentativa: info.ultimaTentativa,
        primeiroErroData: info.primeiroErroData,
        ultimoErroData: info.ultimoErroData,
      });
    }
  });

  return ordenarQuestoesCaderno(caderno);
}

/**
 * Ordena as questões do caderno de erros:
 * Critério: da mais antiga (errou há mais dias) primeiro, e as mais recentes pro final.
 * Em caso de empate no timestamp, prioriza reincidentes, inéditos e recuperadas.
 */
export function ordenarQuestoesCaderno(itens: QuestaoCadernoInfo[]): QuestaoCadernoInfo[] {
  const prioridade: Record<StatusErroCaderno, number> = {
    reincidente: 0,
    inedito: 1,
    recuperada: 2,
  };

  return [...itens].sort((a, b) => {
    const timeA = a.ultimaTentativa?.data || a.ultimoErroData || 0;
    const timeB = b.ultimaTentativa?.data || b.ultimoErroData || 0;

    // Critério principal: da mais antiga (errou há mais dias) primeiro, e mais recentes pro final
    if (timeA !== timeB) {
      return timeA - timeB;
    }

    const diff = prioridade[a.status] - prioridade[b.status];
    if (diff !== 0) return diff;

    return String(a.questao.id).localeCompare(String(b.questao.id));
  });
}

/**
 * Aplica o filtro de 3 modos do caderno de erros:
 * - 'reincidentes': apenas questões reincidentes
 * - 'ineditos': apenas erros inéditos
 * - 'recuperadas': apenas questões recuperadas
 * - 'todos': filtro desligado (exibe todas com reincidentes no topo e recuperadas no final)
 */
export function filtrarCadernoPorModo(
  itens: QuestaoCadernoInfo[],
  modo: ModoFiltroCaderno
): QuestaoCadernoInfo[] {
  if (modo === 'reincidentes') {
    return itens.filter((i) => i.status === 'reincidente');
  }
  if (modo === 'ineditos') {
    return itens.filter((i) => i.status === 'inedito');
  }
  if (modo === 'recuperadas') {
    return itens.filter((i) => i.status === 'recuperada');
  }
  return itens;
}

export interface MetricasRecuperacao {
  totalQuestoesCaderno: number;
  totalResolvidasNoPeriodo: number;
  recuperadas: number;
  reincidentes: number;
  ineditos: number;
  pendentesNoCaderno: number; // inéditos + reincidentes sem a tag recuperada
  taxaRecuperacao: number; // (recuperadas / totalResolvidasNoPeriodo) * 100
  tempoRevisandoSegundos: number;
}

/**
 * Calcula as métricas de RECUPERAÇÃO para a aba de Desempenho.
 * Garante que "Questões do caderno resolvidas" conte estritamente resoluções
 * feitas PELO caderno de erros tentando recuperar.
 */
export function calcularMetricasRecuperacao(
  questoes: Questao[],
  historico: HistoricoRespostasMap,
  registrosTempo: RegistroTempoSessao[],
  limiteInicio: number,
  limiteFim: number,
  isQuestaoNoFiltro: (q: Questao) => boolean,
  sessoesCriadas?: SessaoCriada[]
): MetricasRecuperacao {
  const questoesNoFiltro = questoes.filter(isQuestaoNoFiltro);

  // Questões no caderno que atendem aos filtros de matéria/bloco/banca
  const itensCadernoGeral: QuestaoCadernoInfo[] = [];
  questoesNoFiltro.forEach((q) => {
    const tentativas = historico[String(q.id)] || historico[Number(q.id)] || [];
    const info = classificarStatusCaderno(tentativas);
    if (info) {
      itensCadernoGeral.push({
        questao: q,
        status: info.status,
        totalTentativas: info.totalTentativas,
        totalErros: info.totalErros,
        ultimaTentativa: info.ultimaTentativa,
        primeiroErroData: info.primeiroErroData,
        ultimoErroData: info.ultimoErroData,
      });
    }
  });

  const totalQuestoesCaderno = itensCadernoGeral.length;

  // Analisa as resoluções ocorridas dentro da janela de tempo (período selecionado)
  // ESTRITAMENTE daquelas que foram resolvidas PELO caderno de erros tentando recuperar!
  const itensComAtividadeNoPeriodo: {
    questaoId: string;
    ultimaTentativaPeriodo: TentativaResposta;
    statusPeriodo: 'recuperada' | 'reincidente';
  }[] = [];

  itensCadernoGeral.forEach((item) => {
    const qIdStr = String(item.questao.id);
    const todasTentativas = sanitizarHistoricoTentativasDefensivo(
      historico[qIdStr] || historico[Number(item.questao.id)] || []
    );
    const tentativasNoPeriodo = todasTentativas.filter(
      (t) =>
        t.data >= limiteInicio &&
        t.data <= limiteFim &&
        ehTentativaDoCaderno(t, todasTentativas, sessoesCriadas, registrosTempo)
    );

    if (tentativasNoPeriodo.length > 0) {
      const ultimaPeriodo = tentativasNoPeriodo[tentativasNoPeriodo.length - 1];

      let statusPeriodo: 'recuperada' | 'reincidente';
      if (ultimaPeriodo.acertou) {
        statusPeriodo = 'recuperada';
      } else {
        statusPeriodo = 'reincidente';
      }

      itensComAtividadeNoPeriodo.push({
        questaoId: qIdStr,
        ultimaTentativaPeriodo: ultimaPeriodo,
        statusPeriodo,
      });
    }
  });

  const totalResolvidasNoPeriodo = itensComAtividadeNoPeriodo.length;
  const recuperadas = itensComAtividadeNoPeriodo.filter((i) => i.statusPeriodo === 'recuperada').length;
  const reincidentes = itensComAtividadeNoPeriodo.filter((i) => i.statusPeriodo === 'reincidente').length;

  const taxaRecuperacao =
    totalResolvidasNoPeriodo > 0
      ? Math.round((recuperadas / totalResolvidasNoPeriodo) * 100)
      : 0;

  // Total geral ainda no caderno sem a tag recuperada (inéditos + reincidentes) considerando o filtro de matérias
  const pendentesNoCaderno = itensCadernoGeral.filter(
    (i) => i.status === 'reincidente' || i.status === 'inedito'
  ).length;

  // Tempo gasto revisando questões do caderno de erros:
  // Soma o tempo das tentativas do caderno que ocorreram dentro do período filtrado
  // e que ESTRITAMENTE tiveram uma alternativa escolhida (não soma se pulou sem responder)
  let tempoRevisandoSegundos = 0;

  // Mapa rápido de registros de tempo por questaoId + data e agrupamento por questaoId
  const mapRegTempo: Record<string, number> = {};
  const registrosPorQuestao: Record<string, RegistroTempoSessao[]> = {};
  const registrosUsados = new Set<string>();

  if (Array.isArray(registrosTempo)) {
    registrosTempo.forEach((r) => {
      if (r.questaoId) {
        const qKey = String(r.questaoId);
        if (r.data) {
          mapRegTempo[`${qKey}_${r.data}`] = Number(r.segundos) || 0;
        }
        if (!registrosPorQuestao[qKey]) registrosPorQuestao[qKey] = [];
        registrosPorQuestao[qKey].push(r);
      }
    });
  }

  // Constrói mapa cronológico para calcular a duração real/estimada de cada tentativa
  const mapaTempoTentativas = construirMapaTempoTentativas(historico, registrosTempo);

  itensCadernoGeral.forEach((item) => {
    const qIdStr = String(item.questao.id);
    const todasTentativas = historico[qIdStr] || historico[Number(item.questao.id)] || [];
    todasTentativas.forEach((t) => {
      // Validação estrita: apenas soma se a tentativa ocorreu no período,
      // pertence ao caderno e TEVE UMA ALTERNATIVA ESCOLHIDA (não soma se pulou sem responder)
      const teveAlternativaEscolhida =
        typeof t.escolha === 'number' &&
        !isNaN(t.escolha) &&
        t.escolha >= 0;

      if (
        t.data >= limiteInicio &&
        t.data <= limiteFim &&
        teveAlternativaEscolhida &&
        ehTentativaDoCaderno(t, todasTentativas, sessoesCriadas, registrosTempo)
      ) {
        const uniqueKey = t.id ? String(t.id) : `${qIdStr}_${t.data}_${t.escolha}`;
        let segsTentativa = Number(t.tempoSegundos) || 0;
        if (!segsTentativa && mapRegTempo[`${qIdStr}_${t.data}`]) {
          segsTentativa = mapRegTempo[`${qIdStr}_${t.data}`];
          registrosUsados.add(`${qIdStr}_${t.data}`);
          const rec = registrosPorQuestao[qIdStr]?.find((r) => r.data === t.data);
          if (rec?.id) registrosUsados.add(rec.id);
        }
        if (!segsTentativa && registrosPorQuestao[qIdStr]) {
          const match = registrosPorQuestao[qIdStr].find(
            (r) =>
              !(r.id && registrosUsados.has(r.id)) &&
              !registrosUsados.has(`${qIdStr}_${r.data}`) &&
              Math.abs(Number(r.data) - Number(t.data)) <= 60000 &&
              Number(r.segundos) > 0
          );
          if (match) {
            segsTentativa = Number(match.segundos);
            if (match.id) registrosUsados.add(match.id);
            registrosUsados.add(`${qIdStr}_${match.data}`);
          }
        }
        if (!segsTentativa && mapaTempoTentativas.has(uniqueKey)) {
          segsTentativa = mapaTempoTentativas.get(uniqueKey) || 60;
        } else if (!segsTentativa) {
          segsTentativa = 60;
        }
        tempoRevisandoSegundos += segsTentativa;
      }
    });
  });

  // Inclui sessões dedicadas ou registros do tipo caderno no período que ainda não foram somados
  if (Array.isArray(registrosTempo)) {
    registrosTempo.forEach((r) => {
      if (r.data >= limiteInicio && r.data <= limiteFim) {
        const idKey = r.id || '';
        const dataKey = r.questaoId ? `${r.questaoId}_${r.data}` : '';
        if ((idKey && registrosUsados.has(idKey)) || (dataKey && registrosUsados.has(dataKey))) {
          return;
        }

        if (
          r.tipo === 'caderno' ||
          (r.id && (r.id.startsWith('caderno_') || r.id.startsWith('sessao_caderno_')))
        ) {
          tempoRevisandoSegundos += Number(r.segundos) || 0;
          if (idKey) registrosUsados.add(idKey);
          if (dataKey) registrosUsados.add(dataKey);
        }
      }
    });
  }

  return {
    totalQuestoesCaderno,
    totalResolvidasNoPeriodo,
    recuperadas,
    reincidentes,
    ineditos: 0,
    pendentesNoCaderno,
    taxaRecuperacao,
    tempoRevisandoSegundos,
  };
}

/**
 * Calcula há quantos dias uma questão foi resolvida com base em sua última tentativa registrada.
 * Retorna null se não houver tentativas válidas.
 * Exemplos conforme especificação:
 * - Se foi hoje: "Resolvida há 0 dias"
 * - Se foi ontem: "Resolvida há 1 dia"
 * - Se foi antes de ontem: "Resolvida há 2 dias"
 * - Se foi há N dias: "Resolvida há N dias"
 */
export function calcularDiasDesdeUltimaResolucao(
  tentativasOuData: TentativaResposta[] | number | string | Date | null | undefined,
  dataReferencia: Date = new Date()
): { dias: number; texto: string } | null {
  if (!tentativasOuData) return null;

  let timestampMs: number | null = null;

  if (Array.isArray(tentativasOuData)) {
    if (tentativasOuData.length === 0) return null;
    const ultima = tentativasOuData[tentativasOuData.length - 1];
    if (typeof ultima.data === 'number' && !isNaN(ultima.data)) {
      timestampMs = ultima.data;
    } else if (ultima.created_at) {
      timestampMs = new Date(ultima.created_at).getTime();
    }
  } else if (typeof tentativasOuData === 'number') {
    timestampMs = isNaN(tentativasOuData) ? null : tentativasOuData;
  } else if (typeof tentativasOuData === 'string') {
    const parsed = new Date(tentativasOuData).getTime();
    timestampMs = isNaN(parsed) ? null : parsed;
  } else if (tentativasOuData instanceof Date) {
    timestampMs = isNaN(tentativasOuData.getTime()) ? null : tentativasOuData.getTime();
  }

  if (timestampMs === null || isNaN(timestampMs)) return null;

  const dataResolvida = new Date(timestampMs);
  if (isNaN(dataResolvida.getTime())) return null;

  // Normalização para início do dia (00:00:00 local) para cálculo preciso de dias civis
  const refInicio = new Date(
    dataReferencia.getFullYear(),
    dataReferencia.getMonth(),
    dataReferencia.getDate()
  ).getTime();

  const resInicio = new Date(
    dataResolvida.getFullYear(),
    dataResolvida.getMonth(),
    dataResolvida.getDate()
  ).getTime();

  const diffMs = refInicio - resInicio;
  const dias = Math.max(0, Math.round(diffMs / (24 * 60 * 60 * 1000)));

  const texto = dias === 1 ? 'Resolvida há 1 dia' : `Resolvida há ${dias} dias`;

  return { dias, texto };
}

/**
 * Filtro padrão ao abrir a aplicação e acessar a tela de Desempenho ('hoje').
 */
export const PERIODO_FILTRO_PADRAO: 'hoje' = 'hoje';

export interface LimitesPeriodo {
  limiteInicio: number;
  limiteFim: number;
}

/**
 * Extrai partes de data civil (ano, mês 1-12, dia 1-31) no fuso America/Sao_Paulo
 */
export function obterPartesDataSaoPaulo(d: Date | number = new Date()): { ano: number; mes: number; dia: number } {
  const dateObj = typeof d === 'number' ? new Date(d) : d;
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const parts = formatter.formatToParts(dateObj);
    let ano = dateObj.getFullYear();
    let mes = dateObj.getMonth() + 1;
    let dia = dateObj.getDate();
    for (const p of parts) {
      if (p.type === 'year') ano = Number(p.value);
      if (p.type === 'month') mes = Number(p.value);
      if (p.type === 'day') dia = Number(p.value);
    }
    return { ano, mes, dia };
  } catch {
    return { ano: dateObj.getFullYear(), mes: dateObj.getMonth() + 1, dia: dateObj.getDate() };
  }
}

/**
 * Converte data civil de São Paulo para timestamp
 */
export function obterTimestampSaoPaulo(ano: number, mes: number, dia: number, horaStr = '00:00:00'): number {
  const m = String(mes).padStart(2, '0');
  const d = String(dia).padStart(2, '0');
  const iso = `${ano}-${m}-${d}T${horaStr}-03:00`;
  const parsed = new Date(iso).getTime();
  if (!isNaN(parsed)) return parsed;
  return new Date(ano, mes - 1, dia).getTime();
}

/**
 * Calcula os timestamps limite de início e fim para os filtros de período da tela de desempenho:
 * - 'hoje': do início do dia atual (00:00:00) até o momento atual (com suporte ao fuso America/Sao_Paulo)
 * - 'ontem': das 00:00:00 às 23:59:59 do dia de ontem
 * - 7: últimos 7 dias (agora - 7 dias até agora)
 * - 30: últimos 30 dias (agora - 30 dias até agora)
 * - 0: desde o início (0 até agora)
 * - 'custom': intervalo definido por dataInicioCustom e dataFimCustom (formato YYYY-MM-DD)
 */
export function calcularLimitesPeriodo(
  periodo: number | string,
  dataInicioCustom = '',
  dataFimCustom = '',
  agora: Date = new Date(),
  fuso?: string
): LimitesPeriodo {
  let limiteInicio = 0;
  let limiteFim = agora.getTime();

  if (periodo === 0) {
    limiteInicio = 0;
  } else if (periodo === 7) {
    limiteInicio = agora.getTime() - 7 * 24 * 60 * 60 * 1000;
  } else if (periodo === 30) {
    limiteInicio = agora.getTime() - 30 * 24 * 60 * 60 * 1000;
  } else if (periodo === 'hoje') {
    if (fuso === 'America/Sao_Paulo') {
      const { ano, mes, dia } = obterPartesDataSaoPaulo(agora);
      limiteInicio = obterTimestampSaoPaulo(ano, mes, dia, '00:00:00');
    } else {
      limiteInicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).getTime();
    }
  } else if (periodo === 'ontem') {
    if (fuso === 'America/Sao_Paulo') {
      const { ano, mes, dia } = obterPartesDataSaoPaulo(agora);
      const hojeInicioSp = obterTimestampSaoPaulo(ano, mes, dia, '00:00:00');
      const partesOntem = obterPartesDataSaoPaulo(new Date(hojeInicioSp - 12 * 3600 * 1000));
      limiteInicio = obterTimestampSaoPaulo(partesOntem.ano, partesOntem.mes, partesOntem.dia, '00:00:00');
      limiteFim = hojeInicioSp - 1;
    } else {
      limiteInicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 1).getTime();
      limiteFim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).getTime() - 1;
    }
  } else if (periodo === 'custom' && dataInicioCustom && dataFimCustom) {
    limiteInicio = new Date(dataInicioCustom + 'T00:00:00').getTime();
    limiteFim = new Date(dataFimCustom + 'T23:59:59').getTime();
  }

  return { limiteInicio, limiteFim };
}

/**
 * Função centralizada e sanitizada consumida tanto pela View Recuperado (Aba Desempenho)
 * quanto pelas pílulas/chips do Caderno de Erros (Aba 4 - Banco de Questões)
 * para assegurar 100% de coerência e sincronia absoluta.
 */
export function obterMetricasCadernoErrosSanitizadas(
  questoes: Questao[],
  historico: HistoricoRespostasMap,
  isQuestaoNoFiltro?: (q: Questao) => boolean
): {
  total: number;
  inedito: number;
  recuperada: number;
  reincidente: number;
  itens: QuestaoCadernoInfo[];
} {
  const itens: QuestaoCadernoInfo[] = [];
  let inedito = 0;
  let recuperada = 0;
  let reincidente = 0;

  questoes.forEach((q) => {
    if (isQuestaoNoFiltro && !isQuestaoNoFiltro(q)) return;
    const brutas = historico[String(q.id)] || historico[Number(q.id)] || [];
    const info = classificarStatusCaderno(brutas);
    if (info) {
      itens.push({
        questao: q,
        status: info.status,
        totalTentativas: info.totalTentativas,
        totalErros: info.totalErros,
        ultimaTentativa: info.ultimaTentativa,
        primeiroErroData: info.primeiroErroData,
        ultimoErroData: info.ultimoErroData,
      });
      if (info.status === 'inedito') inedito++;
      else if (info.status === 'recuperada') recuperada++;
      else if (info.status === 'reincidente') reincidente++;
    }
  });

  return {
    total: itens.length,
    inedito,
    recuperada,
    reincidente,
    itens,
  };
}


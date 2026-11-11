import { Questao, HistoricoRespostasMap, TentativaResposta, RegistroTempoSessao, SessaoCriada } from '../types';
import { ehTentativaDoCaderno } from './cadernoErros';

/**
 * Mapeia cada tentativa do histórico para a sua duração estimada/real em segundos.
 * Regras de prioridade:
 * 1. t.tempoSegundos (se presente e > 0)
 * 2. RegistroTempoSessao correspondente à questão e timestamp
 * 3. Delta entre respostas consecutivas na linha do tempo do usuário (quando entre 10s e 300s)
 * 4. Padrão realista de 60 segundos por questão para resoluções isoladas ou início de sessão
 */
export function construirMapaTempoTentativas(
  historico: HistoricoRespostasMap,
  registrosTempo?: RegistroTempoSessao[]
): Map<string, number> {
  const mapaTempo = new Map<string, number>();

  // 1. Extrai todas as tentativas de todas as questões em uma única linha do tempo ordenada
  const todas: { key: string; tentativa: TentativaResposta; questaoId: string }[] = [];

  for (const qId in historico) {
    const lista = historico[qId] || [];
    lista.forEach((t) => {
      const uniqueKey = t.id ? String(t.id) : `${qId}_${t.data}_${t.escolha}`;
      todas.push({ key: uniqueKey, tentativa: t, questaoId: qId });
    });
  }

  // Ordena cronologicamente por timestamp
  todas.sort((a, b) => (a.tentativa.data || 0) - (b.tentativa.data || 0));

  // Mapa rápido de registrosTempo por questaoId + data
  const mapRegTempo: Record<string, number> = {};
  if (Array.isArray(registrosTempo)) {
    registrosTempo.forEach((r) => {
      if (r.questaoId && r.data && Number(r.segundos) > 0) {
        mapRegTempo[`${r.questaoId}_${r.data}`] = Number(r.segundos);
      }
    });
  }

  // 2. Calcula os segundos de cada tentativa
  for (let i = 0; i < todas.length; i++) {
    const item = todas[i];
    const t = item.tentativa;
    const qId = item.questaoId;

    let segs = Number(t.tempoSegundos) || 0;

    // Se não tem tempoSegundos, tenta pelo registro de sessão/banco
    if (segs <= 0 && mapRegTempo[`${qId}_${t.data}`]) {
      segs = mapRegTempo[`${qId}_${t.data}`];
    }

    // Se ainda não tem, calcula pelo delta temporal com a questão anterior
    if (segs <= 0) {
      if (i > 0) {
        const prevData = todas[i - 1].tentativa.data || 0;
        const curData = t.data || 0;
        const diffSec = Math.round((curData - prevData) / 1000);

        if (diffSec >= 10 && diffSec <= 300) {
          segs = diffSec;
        } else if (diffSec > 0 && diffSec < 10) {
          segs = 15; // Mínimo plausível de leitura e clique
        } else {
          segs = 60; // Pausa longa / novo bloco de estudos
        }
      } else {
        segs = 60;
      }
    }

    mapaTempo.set(item.key, Math.max(1, segs));
  }

  return mapaTempo;
}

/**
 * Calcula o Tempo Total acumulado em TODAS as questões respondidas pelo usuário,
 * respeitando os filtros opcionais de período e escopo.
 */
export function calcularTempoTotalTodasQuestoes(
  historico: HistoricoRespostasMap,
  opcoes?: {
    limiteInicio?: number;
    limiteFim?: number;
    isQuestaoNoFiltro?: (qId: string) => boolean;
    registrosTempo?: RegistroTempoSessao[];
  }
): number {
  if (!historico || Object.keys(historico).length === 0) return 0;

  const mapaTempo = construirMapaTempoTentativas(historico, opcoes?.registrosTempo);
  let totalSegundos = 0;

  for (const qId in historico) {
    if (opcoes?.isQuestaoNoFiltro && !opcoes.isQuestaoNoFiltro(qId)) {
      continue;
    }

    const tentativas = historico[qId] || [];
    tentativas.forEach((t) => {
      // Valida se houve resposta selecionada
      if (typeof t.escolha !== 'number' || isNaN(t.escolha) || t.escolha < 0) {
        return;
      }

      // Valida período
      if (opcoes?.limiteInicio !== undefined && opcoes.limiteInicio > 0) {
        if (!t.data || t.data < opcoes.limiteInicio) return;
      }
      if (opcoes?.limiteFim !== undefined && opcoes.limiteFim > 0) {
        if (!t.data || t.data > opcoes.limiteFim) return;
      }

      const uniqueKey = t.id ? String(t.id) : `${qId}_${t.data}_${t.escolha}`;
      const segs = mapaTempo.get(uniqueKey) || Number(t.tempoSegundos) || 60;
      totalSegundos += segs;
    });
  }

  return totalSegundos;
}

/**
 * Calcula com precisão o tempo gasto revisando questões do Caderno de Erros (modo RECUPERAÇÃO).
 * Garante que questões com tentativas históricas sem `tempoSegundos` não fiquem zeradas.
 */
export function calcularTempoRevisandoErrosCaderno(
  questoes: Questao[],
  historico: HistoricoRespostasMap,
  limiteInicio: number,
  limiteFim: number,
  isQuestaoNoFiltro: (q: Questao) => boolean,
  sessoesCriadas?: SessaoCriada[],
  registrosTempo?: RegistroTempoSessao[]
): number {
  if (!historico || Object.keys(historico).length === 0) return 0;

  const mapaTempo = construirMapaTempoTentativas(historico, registrosTempo);
  let tempoRevisandoSegundos = 0;
  const registrosUsados = new Set<string>();

  const questoesNoFiltro = questoes.filter(isQuestaoNoFiltro);

  questoesNoFiltro.forEach((q) => {
    const qIdStr = String(q.id);
    const todasTentativas = historico[qIdStr] || historico[Number(q.id)] || [];

    // Se a questão nunca foi errada, não pertence ao caderno de erros
    const temErro = todasTentativas.some((t) => !t.acertou);
    if (!temErro) return;

    todasTentativas.forEach((t) => {
      const teveAlternativaEscolhida =
        typeof t.escolha === 'number' && !isNaN(t.escolha) && t.escolha >= 0;

      if (
        t.data >= limiteInicio &&
        t.data <= limiteFim &&
        teveAlternativaEscolhida &&
        ehTentativaDoCaderno(t, todasTentativas, sessoesCriadas, registrosTempo)
      ) {
        const uniqueKey = t.id ? String(t.id) : `${qIdStr}_${t.data}_${t.escolha}`;
        const segs = mapaTempo.get(uniqueKey) || Number(t.tempoSegundos) || 60;
        tempoRevisandoSegundos += segs;
        registrosUsados.add(uniqueKey);
      }
    });
  });

  // Inclui sessões dedicadas ao caderno que ainda não foram computadas
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

  return tempoRevisandoSegundos;
}

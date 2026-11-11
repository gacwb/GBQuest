export interface RegistroTempoSessao {
  id: string;
  sessaoId?: string | number;
  codigo?: string;
  titulo: string;
  segundos: number;
  data: number; // timestamp
  concluida?: boolean;
  totalQuestoes?: number;
  acertos?: number;
  erros?: number;
  taxaAcerto?: number;
  user_email?: string;
  disciplina?: string;
  assunto?: string;
  banca?: string;
}

export interface FiltrosTempoSessoes {
  disciplina?: string;   // Bloco individual (legado)
  disciplinas?: string[]; // Múltiplos Blocos selecionados via checkbox
  materiasFiltro?: string[]; // Múltiplas Matérias selecionadas individualmente via checkbox
  assunto?: string;      // Matéria / Lei
  banca?: string;        // Banca
  sessoesCriadas?: {
    id?: string | number;
    codigo?: string;
    disciplina?: string;
    assunto?: string;
    banca?: string;
    questaoIds?: (string | number)[];
    created_at?: string;
    dataHora?: string;
  }[];
  questoes?: { id?: string | number; disciplina?: string; assunto?: string; banca?: string }[];
  materias?: { id?: string | number; nome?: string; blocoId?: string | number; blocoNome?: string }[];
  blocos?: { id?: string | number; nome?: string }[];
}

/**
 * Formata segundos no formato MM:SS para exibição em tempo real na aba de sessões.
 * Ex: 65s -> "01:05", 360s -> "06:00"
 */
export function formatarTempoMinutosSegundos(segundosTotal: number): string {
  const total = Math.max(0, Math.floor(segundosTotal || 0));
  const minutos = Math.floor(total / 60);
  const segundos = total % 60;
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

/**
 * Formata segundos no formato solicitado: Horas/Minutos (ex: "1h 24min", "0h 15min").
 * Usado na aba Meu Desempenho para a métrica "Tempo em sessões".
 */
export function formatarTempoHorasMinutos(segundosTotal: number): string {
  const total = Math.max(0, Math.floor(segundosTotal || 0));
  const horas = Math.floor(total / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  return `${horas}h ${String(minutos).padStart(2, '0')}min`;
}

/**
 * Calcula a média de segundos gastos por questão (s/q).
 * Fórmula: segundosTotal / questões
 * Exemplo do usuário: 23 minutos (1380s) para 20 questões = 1380 / 20 = 69 segundos por questão.
 */
export function calcularSegundosPorQuestao(questoes: number, segundosTotal: number): number {
  if (!questoes || questoes <= 0 || !segundosTotal || segundosTotal <= 0) return 0;
  return Math.round(segundosTotal / questoes);
}

/**
 * Formata o ritmo em minutos por questão (m/q) no formato M:SS.
 * Converte os segundos por questão para a leitura em minutos e segundos.
 * Exemplo do usuário: 23 minutos para 20 questões = 69s -> "1:09" minutos por questão (1:09 m/q).
 */
export function formatarMinutosPorQuestao(questoes: number, segundosTotal: number): string {
  const segPorQ = calcularSegundosPorQuestao(questoes, segundosTotal);
  if (segPorQ <= 0) return '0:00';
  const minutos = Math.floor(segPorQ / 60);
  const segundos = segPorQ % 60;
  return `${minutos}:${String(segundos).padStart(2, '0')}`;
}

/**
 * Calcula o ritmo de resolução em questões por minuto (q/min).
 * Fórmula: questões / (segundosTotal / 60) = (questões * 60) / segundosTotal
 */
export function calcularQuestoesPorMinuto(questoes: number, segundosTotal: number): number {
  if (!questoes || questoes <= 0 || !segundosTotal || segundosTotal <= 0) return 0;
  const minutos = segundosTotal / 60;
  if (minutos <= 0) return 0;
  return Number((questoes / minutos).toFixed(2));
}

/**
 * Formata o valor de questões por minuto no padrão brasileiro com 2 casas decimais.
 */
export function formatarQuestoesPorMinuto(questoes: number, segundosTotal: number): string {
  const val = calcularQuestoesPorMinuto(questoes, segundosTotal);
  if (val <= 0) return '0,00';
  return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export interface ResumoSessaoAcertosErros {
  totalQuestoes: number;
  respondidas: number;
  acertos: number;
  erros: number;
  taxa: number; // 0 a 100
  finalizada: boolean;
}

/**
 * Calcula o resumo básico de erros, acertos e taxa percentual de uma sessão ativa.
 */
export function calcularResumoSessao(
  questaoIds: (number | string)[],
  respostasTemp: Record<string | number, { escolha: number; acertou: boolean }>
): ResumoSessaoAcertosErros {
  const totalQuestoes = (questaoIds || []).length;
  let acertos = 0;
  let erros = 0;
  let respondidas = 0;

  (questaoIds || []).forEach((qId) => {
    const resp = respostasTemp[qId];
    if (resp !== undefined) {
      respondidas++;
      if (resp.acertou) {
        acertos++;
      } else {
        erros++;
      }
    }
  });

  const taxa = respondidas > 0 ? Math.round((acertos / respondidas) * 100) : 0;
  const finalizada = totalQuestoes > 0 && respondidas >= totalQuestoes;

  return {
    totalQuestoes,
    respondidas,
    acertos,
    erros,
    taxa,
    finalizada,
  };
}

/**
 * Verifica se a resposta dada completa a última questão da sessão.
 */
export function ehUltimaQuestaoRespondida(
  questaoIds: (number | string)[],
  respostasAtuais: Record<string | number, { escolha: number; acertou: boolean }>,
  respondendoAgoraId: number | string
): boolean {
  if (!questaoIds || questaoIds.length === 0) return true;
  return questaoIds.every((id) => {
    if (String(id) === String(respondendoAgoraId)) return true;
    return respostasAtuais[id] !== undefined || respostasAtuais[String(id)] !== undefined;
  });
}

/**
 * Alterna o estado de eliminação (riscar / desriscar com tesourinha) de uma alternativa.
 */
export function toggleAlternativaRiscada(
  atuais: Record<string | number, Record<number, boolean>>,
  questaoId: string | number,
  altIdx: number
): Record<string | number, Record<number, boolean>> {
  const qKey = String(questaoId);
  const qMap = atuais[qKey] || {};
  return {
    ...atuais,
    [qKey]: {
      ...qMap,
      [altIdx]: !qMap[altIdx],
    },
  };
}

/**
 * Retorna se uma alternativa específica foi riscada / eliminada.
 */
export function estaAlternativaRiscada(
  atuais: Record<string | number, Record<number, boolean>>,
  questaoId: string | number,
  altIdx: number
): boolean {
  return Boolean(atuais[String(questaoId)]?.[altIdx]);
}

/**
 * Helper para comparação tolerante a maiúsculas, espaços e pontuações
 */
function textoContemOuIgual(base: string, filtro: string): boolean {
  if (!base || !filtro) return false;
  const b = base.trim().toLowerCase();
  const f = filtro.trim().toLowerCase();
  return b === f || b.includes(f) || f.includes(b);
}

/**
 * Calcula a soma em segundos do tempo gasto em sessões, considerando opcionalmente
 * limites de tempo do filtro de período (ex: Hoje, Ontem, 7 dias, etc) e filtros de
 * Disciplina (Bloco), Assunto (Matéria/Lei) e Banca.
 */
export function somarTempoSessoes(
  registros: RegistroTempoSessao[],
  limiteInicio?: number,
  limiteFim?: number,
  filtros?: FiltrosTempoSessoes
): number {
  if (!registros || registros.length === 0) return 0;

  return registros.reduce((acc, reg) => {
    let timestamp = reg.data || 0;
    const tempoValido = Math.max(0, Number(reg.segundos) || 0);
    if (tempoValido === 0) return acc;

    // Se o registro não possui timestamp e temos sessoesCriadas, tenta resgatar a data de criação
    if (!timestamp && filtros?.sessoesCriadas) {
      const sessaoMatch = filtros.sessoesCriadas.find(
        (s) =>
          (reg.sessaoId && s.id !== undefined && String(s.id) === String(reg.sessaoId)) ||
          (reg.codigo && s.codigo && s.codigo === reg.codigo) ||
          (s.disciplina && s.assunto && reg.disciplina === s.disciplina && reg.assunto === s.assunto)
      );
      if (sessaoMatch?.created_at) {
        timestamp = new Date(sessaoMatch.created_at).getTime();
      }
    }

    // 1. Filtro de Período / Data
    if (limiteInicio !== undefined && limiteFim !== undefined) {
      // Quando limiteInicio é 0 ("Desde o início"), aceita todos os registros
      if (limiteInicio > 0) {
        if (!timestamp || timestamp < limiteInicio) return acc;
      }
      if (limiteFim > 0 && timestamp > 0 && timestamp > limiteFim) return acc;
    }

    // 2. Filtro de Disciplina / Bloco, Assunto / Matéria e Banca
    if (filtros) {
      const filtroDisc = filtros.disciplina?.trim();
      const listaFiltroDisc = filtros.disciplinas;
      const filtroAss = filtros.assunto?.trim();
      const filtroBan = filtros.banca?.trim();

      // Se lista de disciplinas foi passada vazia (todas desmarcadas pelo usuário)
      if (listaFiltroDisc !== undefined && listaFiltroDisc.length === 0) {
        return acc;
      }

      if (filtroDisc || (listaFiltroDisc && listaFiltroDisc.length > 0) || filtroAss || filtroBan) {
        let regDisc = reg.disciplina || '';
        let regAss = reg.assunto || '';
        let regBan = reg.banca || '';

        // A. Se não estiver preenchido diretamente no registro, busca na lista de sessões criadas
        if (filtros.sessoesCriadas && filtros.sessoesCriadas.length > 0) {
          const sessaoEncontrada = filtros.sessoesCriadas.find(
            (s) =>
              (reg.sessaoId && s.id !== undefined && String(s.id) === String(reg.sessaoId)) ||
              (reg.codigo && s.codigo && s.codigo === reg.codigo) ||
              (s.codigo && reg.titulo && reg.titulo.includes(s.codigo)) ||
              (s.assunto && reg.titulo && reg.titulo.toLowerCase().includes(s.assunto.toLowerCase()))
          );
          if (sessaoEncontrada) {
            regDisc = regDisc || sessaoEncontrada.disciplina || '';
            regAss = regAss || sessaoEncontrada.assunto || '';
            regBan = regBan || sessaoEncontrada.banca || '';
          }
        }

        // B. Se a matéria está cadastrada na lista de matérias, infere o bloco/disciplina dela
        if (filtros.materias && filtros.materias.length > 0) {
          const matEncontrada = filtros.materias.find(
            (m) =>
              (m.nome && regAss && textoContemOuIgual(m.nome, regAss)) ||
              (m.nome && reg.titulo && textoContemOuIgual(reg.titulo, m.nome))
          );
          if (matEncontrada) {
            regDisc = regDisc || matEncontrada.blocoNome || '';
            regAss = regAss || matEncontrada.nome || '';
          }
        }

        // C. Se há questões associadas, infere disciplina/assunto pelas questões
        if (filtros.questoes && filtros.questoes.length > 0 && (!regDisc || !regAss)) {
          const qEncontrada = filtros.questoes.find(
            (q) =>
              (q.assunto && regAss && textoContemOuIgual(q.assunto, regAss)) ||
              (q.assunto && reg.titulo && textoContemOuIgual(reg.titulo, q.assunto))
          );
          if (qEncontrada) {
            regDisc = regDisc || qEncontrada.disciplina || '';
            regAss = regAss || qEncontrada.assunto || '';
            regBan = regBan || qEncontrada.banca || '';
          }
        }

        // D. Tenta inferir pelo título ou código (ex: "BL02L14133x1", "02_Licitações Contratos Custos")
        if (reg.titulo) {
          if (!regDisc && filtroDisc && textoContemOuIgual(reg.titulo, filtroDisc)) {
            regDisc = filtroDisc;
          }
          if (!regAss && filtroAss && textoContemOuIgual(reg.titulo, filtroAss)) {
            regAss = filtroAss;
          }
          if (!regBan && filtroBan && textoContemOuIgual(reg.titulo, filtroBan)) {
            regBan = filtroBan;
          }
        }

        // Se código tem prefixo de bloco como BL02 e filtroDisc começa com 02
        if (reg.codigo && (filtroDisc || (listaFiltroDisc && listaFiltroDisc.length > 0))) {
          const matchBlCod = reg.codigo.match(/^BL0?(\d+)/i);
          if (matchBlCod) {
            const targets = listaFiltroDisc || (filtroDisc ? [filtroDisc] : []);
            const foundTarget = targets.find((t) => {
              const mFiltro = t.match(/^0?(\d+)/);
              return mFiltro && mFiltro[1] === matchBlCod[1];
            });
            if (foundTarget) {
              regDisc = foundTarget;
            }
          }
        }

        // Validação final dos filtros ativos:
        if (listaFiltroDisc && listaFiltroDisc.length > 0) {
          const matchMulti = listaFiltroDisc.some(
            (fDisc) => textoContemOuIgual(regDisc, fDisc) || (reg.titulo && textoContemOuIgual(reg.titulo, fDisc))
          );
          if (!matchMulti) return acc;
        } else if (filtroDisc) {
          const match = textoContemOuIgual(regDisc, filtroDisc) || (reg.titulo && textoContemOuIgual(reg.titulo, filtroDisc));
          if (!match) return acc;
        }

        // Filtro de matérias individuais selecionadas por checkbox
        if (filtros.materiasFiltro && filtros.materiasFiltro.length > 0 && regAss) {
          const matchMat = filtros.materiasFiltro.some(
            (fMat) =>
              textoContemOuIgual(regAss, fMat) ||
              (fMat.includes(':::') && fMat.split(':::')[1] && textoContemOuIgual(regAss, fMat.split(':::')[1])) ||
              (reg.titulo && textoContemOuIgual(reg.titulo, fMat))
          );
          if (!matchMat) return acc;
        }

        if (filtroAss) {
          const match = textoContemOuIgual(regAss, filtroAss) || (reg.titulo && textoContemOuIgual(reg.titulo, filtroAss));
          if (!match) return acc;
        }

        if (filtroBan) {
          const match = textoContemOuIgual(regBan, filtroBan) || (reg.titulo && textoContemOuIgual(reg.titulo, filtroBan));
          if (!match) return acc;
        }
      }
    }

    return acc + tempoValido;
  }, 0);
}

export interface InfoConclusaoSessao {
  temTempo: boolean;
  segundos: number;
  concluida: boolean;
  temAssertividade: boolean;
  taxa: number; // 0 a 100
  acertos: number;
  erros: number;
  total: number;
  data?: number;
  segundosPorQuestao?: number;
  minutosPorQuestaoFormatado?: string;
  questoesPorMinuto?: number;
  questoesPorMinutoFormatado?: string;
}

/**
 * Encontra de forma robusta o registro de tempo correspondente a uma sessão,
 * cruzando por ID único, código oficial (ex: BL05L7x1), título ou correspondência legada.
 */
export function encontrarRegistroTempoSessao(
  sessao?: {
    id?: string | number;
    codigo?: string;
    disciplina?: string;
    assunto?: string;
    banca?: string;
    tempoSegundos?: number;
  } | null,
  registros?: RegistroTempoSessao[] | null,
  codigoExibido?: string
): RegistroTempoSessao | undefined {
  if (!sessao || !registros || registros.length === 0) return undefined;

  const targetId = sessao.id !== undefined && sessao.id !== null ? String(sessao.id).trim() : '';
  const targetCodigo = (sessao.codigo || '').trim().toLowerCase();
  const targetCodigoExibido = (codigoExibido || '').trim().toLowerCase();
  const targetDisc = (sessao.disciplina || '').trim().toLowerCase();
  const targetAss = (sessao.assunto || '').trim().toLowerCase();

  // 1. Prioridade absoluta: Correspondência EXATA por ID único da sessão
  if (targetId) {
    const porId = registros.filter((r) => {
      const rSessaoId = r.sessaoId !== undefined && r.sessaoId !== null ? String(r.sessaoId).trim() : '';
      const rId = (r.id || '').trim();
      return (rSessaoId && rSessaoId === targetId) || rId === `sessao_${targetId}`;
    });
    if (porId.length > 0) {
      return porId.sort((a, b) => (b.data || 0) - (a.data || 0))[0];
    }
  }

  // 2. Segunda prioridade: Correspondência EXATA por Código específico da sessão (ex: "BL04L1x2")
  const codigoParaBuscar = targetCodigo || targetCodigoExibido;
  if (codigoParaBuscar) {
    const porCodigo = registros.filter((r) => {
      const rCod = (r.codigo || '').trim().toLowerCase();
      const rSessaoId = (r.sessaoId ? String(r.sessaoId) : '').trim().toLowerCase();
      const rId = (r.id || '').trim().toLowerCase();
      const rTitulo = (r.titulo || '').toLowerCase();
      return (
        (rCod && rCod === codigoParaBuscar) ||
        (rSessaoId && rSessaoId === codigoParaBuscar) ||
        rId === `sessao_${codigoParaBuscar}` ||
        (rTitulo && rTitulo.includes(codigoParaBuscar))
      );
    });
    if (porCodigo.length > 0) {
      return porCodigo.sort((a, b) => (b.data || 0) - (a.data || 0))[0];
    }
  }

  // 3. Terceira prioridade: Registros legados ou salvos por disciplina + assunto
  // REGRA DE SEGURANÇA: Se o registro possui outro código com sufixo numérico diferente (ex: x1 vs x2),
  // ou outro sessaoId explícito diferente, NÃO deve cruzar (evita vazar tempo da 1ª sessão para a 2ª).
  // Mas se for registro legado legítimo daquela matéria, recupera com sucesso!
  const legados = registros.filter((r) => {
    const rDisc = (r.disciplina || '').trim().toLowerCase();
    const rAss = (r.assunto || '').trim().toLowerCase();
    const rCod = (r.codigo || '').trim().toLowerCase();
    const rSessaoId = r.sessaoId !== undefined && r.sessaoId !== null ? String(r.sessaoId).trim() : '';

    // Se o registro tem outro ID de sessão explícito diferente, não pertence a esta
    if (rSessaoId && targetId && rSessaoId !== targetId) return false;

    // Se ambos possuem código com sufixo xN e são diferentes (ex: x1 vs x2), não cruza
    if (rCod && codigoParaBuscar && rCod !== codigoParaBuscar) {
      const matchR = rCod.match(/x(\d+)$/);
      const matchTarget = codigoParaBuscar.match(/x(\d+)$/);
      if (matchR && matchTarget && matchR[1] !== matchTarget[1]) {
        return false;
      }
    }

    const matchDisc = !rDisc || !targetDisc || rDisc === targetDisc;
    const matchAss = rAss && targetAss && (rAss === targetAss || targetAss.includes(rAss) || rAss.includes(targetAss));
    const matchTitulo = Boolean(r.titulo && targetAss && r.titulo.toLowerCase().includes(targetAss));

    return (matchDisc && matchAss) || matchTitulo;
  });

  if (legados.length > 0) {
    return legados.sort((a, b) => (b.data || 0) - (a.data || 0))[0];
  }

  return undefined;
}

/**
 * Calcula o tempo real/estimado a partir dos timestamps registrados no Supabase das questões respondidas
 */
export function calcularTempoHistoricoQuestoes(
  questaoIds: (number | string)[],
  historicoRespostas?: Record<string | number, { escolha: number; acertou: boolean; data?: number }[]>,
  sessaoCreatedAt?: string
): number {
  if (!historicoRespostas || !questaoIds || questaoIds.length === 0) return 0;

  const timestamps: number[] = [];
  for (const qId of questaoIds) {
    const arr =
      historicoRespostas[qId] ||
      historicoRespostas[String(qId)] ||
      (typeof qId === 'string' && !isNaN(Number(qId)) ? historicoRespostas[Number(qId)] : undefined);
    if (arr && arr.length > 0) {
      arr.forEach((tentativa) => {
        if (tentativa.data && tentativa.data > 0) {
          timestamps.push(tentativa.data);
        }
      });
    }
  }

  if (timestamps.length === 0) return 0;
  timestamps.sort((a, b) => a - b);

  let totalSegundos = 0;
  const sessionStart = sessaoCreatedAt ? new Date(sessaoCreatedAt).getTime() : timestamps[0] - 60000;

  // Primeiro intervalo: do início até a 1ª questão respondida (entre 30s e 180s)
  const primeiroGap = Math.max(30, Math.min(180, Math.round((timestamps[0] - sessionStart) / 1000)));
  totalSegundos += primeiroGap;

  // Intervalos entre questões consecutivas
  for (let i = 1; i < timestamps.length; i++) {
    const diffSec = Math.round((timestamps[i] - timestamps[i - 1]) / 1000);
    if (diffSec > 0) {
      // Limita pausas a no máximo 180s (3 minutos) por questão
      totalSegundos += Math.min(diffSec, 180);
    }
  }

  return totalSegundos;
}

/**
 * Obtém as informações consolidadas de conclusão da sessão:
 * - Tempo de realização (em segundos e formatado)
 * - Assertividade (%) da última vez que foi concluída
 * - Número de acertos e total de questões
 */
export function obterInfoConclusaoSessao(
  sessao: {
    id?: string | number;
    codigo?: string;
    disciplina: string;
    assunto: string;
    banca?: string;
    quantidade?: number;
    questaoIds?: (number | string)[];
    tempoSegundos?: number;
    concluida?: boolean;
    taxaAcerto?: number;
    acertos?: number;
    erros?: number;
    created_at?: string;
  },
  registrosTempo: RegistroTempoSessao[],
  historicoRespostas?: Record<string | number, { escolha: number; acertou: boolean; data?: number }[]>,
  codigoExibido?: string
): InfoConclusaoSessao {
  const regSessao = encontrarRegistroTempoSessao(sessao, registrosTempo, codigoExibido);

  let segundos = Math.max(Number(regSessao?.segundos) || 0, Number(sessao.tempoSegundos) || 0);
  let concluida = Boolean(regSessao?.concluida || sessao.concluida);
  let total = sessao.quantidade || (sessao.questaoIds ? sessao.questaoIds.length : 0);
  let acertos = 0;
  let erros = 0;
  let taxa = 0;
  let temAssertividade = false;
  let data = regSessao?.data;

  // Verifica se há alguma questão respondida no histórico para esta sessão
  const idsQuestoes = sessao.questaoIds || [];
  let qtdQuestoesRespondidas = 0;
  let acertosContados = 0;
  let errosContados = 0;
  let maxTimestamp = 0;

  if (historicoRespostas && idsQuestoes.length > 0) {
    for (const qId of idsQuestoes) {
      const arr =
        historicoRespostas[qId] ||
        historicoRespostas[String(qId)] ||
        (typeof qId === 'string' && !isNaN(Number(qId)) ? historicoRespostas[Number(qId)] : undefined);
      if (arr && arr.length > 0) {
        qtdQuestoesRespondidas++;
        const ultimaTentativa = arr[arr.length - 1];
        if (ultimaTentativa.acertou) {
          acertosContados++;
        } else {
          errosContados++;
        }
        if (ultimaTentativa.data && ultimaTentativa.data > maxTimestamp) {
          maxTimestamp = ultimaTentativa.data;
        }
      }
    }
  }

  // Se a sessão não tinha registro de tempo salvo em localStorage ou no objeto, mas possui respostas no histórico:
  // Reconstrói o tempo com máxima precisão a partir dos timestamps registrados no banco Supabase
  if (segundos === 0 && qtdQuestoesRespondidas > 0) {
    segundos = calcularTempoHistoricoQuestoes(idsQuestoes, historicoRespostas, sessao.created_at);
  }

  // Se NÃO existe registro de tempo, NÃO há tempo gravado na sessão e NENHUMA questão foi respondida,
  // então a sessão é virgem/nova:
  if (!regSessao && segundos === 0 && qtdQuestoesRespondidas === 0) {
    return {
      temTempo: false,
      segundos: 0,
      concluida: false,
      temAssertividade: false,
      taxa: 0,
      acertos: 0,
      erros: 0,
      total,
      segundosPorQuestao: 0,
      minutosPorQuestaoFormatado: '0:00',
      questoesPorMinuto: 0,
      questoesPorMinutoFormatado: '0,00',
    };
  }

  // 1. Primeira prioridade de assertividade: dados do registro da sessão
  if (regSessao && regSessao.totalQuestoes && regSessao.totalQuestoes > 0 && regSessao.acertos !== undefined) {
    total = regSessao.totalQuestoes;
    acertos = regSessao.acertos;
    erros = regSessao.erros !== undefined ? regSessao.erros : Math.max(0, total - acertos);
    taxa = regSessao.taxaAcerto !== undefined ? regSessao.taxaAcerto : Math.round((acertos / total) * 100);
    temAssertividade = true;
    if (regSessao.concluida) concluida = true;
  } else if (qtdQuestoesRespondidas > 0 && idsQuestoes.length > 0 && qtdQuestoesRespondidas === idsQuestoes.length) {
    // 2. Se todas as questões foram respondidas no histórico
    total = idsQuestoes.length;
    acertos = acertosContados;
    erros = errosContados;
    taxa = Math.round((acertos / total) * 100);
    temAssertividade = true;
    concluida = true;
    if (!data) data = maxTimestamp;
  } else if (sessao.taxaAcerto !== undefined && sessao.acertos !== undefined && total > 0) {
    // 3. Propriedades gravadas diretamente na sessão
    acertos = sessao.acertos;
    erros = sessao.erros !== undefined ? sessao.erros : Math.max(0, total - acertos);
    taxa = sessao.taxaAcerto;
    temAssertividade = true;
    if (sessao.concluida) concluida = true;
  } else if (qtdQuestoesRespondidas > 0) {
    // 4. Parcialmente respondida
    total = idsQuestoes.length || total;
    acertos = acertosContados;
    erros = errosContados;
    taxa = Math.round((acertos / qtdQuestoesRespondidas) * 100);
    temAssertividade = true;
    if (!data) data = maxTimestamp;
  }

  const temTempo = segundos > 0;
  // Quantidade de questões para o cálculo do ritmo:
  // Se concluída ou total definido, usa total (ou respondidas se maior); senão o número de respondidas
  const questoesParaRitmo = (concluida && total > 0) ? total : (qtdQuestoesRespondidas > 0 ? qtdQuestoesRespondidas : total);
  const segundosPorQuestao = segundos > 0 ? calcularSegundosPorQuestao(questoesParaRitmo, segundos) : 0;
  const minutosPorQuestaoFormatado = segundos > 0 ? formatarMinutosPorQuestao(questoesParaRitmo, segundos) : '0:00';
  const questoesPorMinuto = segundos > 0 ? calcularQuestoesPorMinuto(questoesParaRitmo, segundos) : 0;
  const questoesPorMinutoFormatado = segundos > 0 ? formatarQuestoesPorMinuto(questoesParaRitmo, segundos) : '0,00';

  return {
    temTempo,
    segundos,
    concluida,
    temAssertividade,
    taxa,
    acertos,
    erros,
    total,
    data,
    segundosPorQuestao,
    minutosPorQuestaoFormatado,
    questoesPorMinuto,
    questoesPorMinutoFormatado,
  };
}

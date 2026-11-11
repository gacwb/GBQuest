import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classificarStatusCaderno,
  obterQuestoesCadernoErros,
  filtrarCadernoPorModo,
  ordenarQuestoesCaderno,
  calcularMetricasRecuperacao,
  calcularDiasDesdeUltimaResolucao,
  calcularLimitesPeriodo,
  PERIODO_FILTRO_PADRAO,
} from './cadernoErros';
import { Questao, HistoricoRespostasMap, TentativaResposta } from '../types';

test('classificarStatusCaderno retorna null se nunca foi errada', () => {
  const tentativas: TentativaResposta[] = [
    { questaoId: 1, escolha: 0, acertou: true, data: 1000 },
    { questaoId: 1, escolha: 0, acertou: true, data: 2000 },
  ];
  assert.equal(classificarStatusCaderno(tentativas), null);
});

test('classificarStatusCaderno retorna inedito para questão errada uma única vez', () => {
  const tentativas: TentativaResposta[] = [
    { questaoId: 1, escolha: 1, acertou: false, data: 1000 },
  ];
  const resultado = classificarStatusCaderno(tentativas);
  assert.notEqual(resultado, null);
  assert.equal(resultado?.status, 'inedito');
  assert.equal(resultado?.totalErros, 1);
});

test('classificarStatusCaderno retorna recuperada se errou e depois acertou', () => {
  const tentativas: TentativaResposta[] = [
    { questaoId: 1, escolha: 1, acertou: false, data: 1000 },
    { questaoId: 1, escolha: 0, acertou: true, data: 2000 },
  ];
  const resultado = classificarStatusCaderno(tentativas);
  assert.notEqual(resultado, null);
  assert.equal(resultado?.status, 'recuperada');
});

test('classificarStatusCaderno retorna reincidente se errou 2 ou mais vezes e a última é erro', () => {
  const tentativas: TentativaResposta[] = [
    { questaoId: 1, escolha: 1, acertou: false, data: 1000 },
    { questaoId: 1, escolha: 2, acertou: false, data: 10000 },
  ];
  const resultado = classificarStatusCaderno(tentativas);
  assert.notEqual(resultado, null);
  assert.equal(resultado?.status, 'reincidente');
  assert.equal(resultado?.totalErros, 2);
});

test('classificarStatusCaderno muda de reincidente para recuperada ao acertar', () => {
  const tentativas: TentativaResposta[] = [
    { questaoId: 1, escolha: 1, acertou: false, data: 1000 },
    { questaoId: 1, escolha: 2, acertou: false, data: 10000 },
    { questaoId: 1, escolha: 0, acertou: true, data: 20000 },
  ];
  const resultado = classificarStatusCaderno(tentativas);
  assert.notEqual(resultado, null);
  assert.equal(resultado?.status, 'recuperada');
});

test('classificarStatusCaderno volta para reincidente se errar novamente após ter sido recuperada', () => {
  const tentativas: TentativaResposta[] = [
    { questaoId: 1, escolha: 1, acertou: false, data: 1000 },
    { questaoId: 1, escolha: 0, acertou: true, data: 10000 },
    { questaoId: 1, escolha: 3, acertou: false, data: 20000 },
  ];
  const resultado = classificarStatusCaderno(tentativas);
  assert.notEqual(resultado, null);
  assert.equal(resultado?.status, 'reincidente');
});

test('ordenarQuestoesCaderno desempata por reincidentes, inéditos e recuperadas quando tem o mesmo timestamp', () => {
  const q1: Questao = { id: 1, banca: 'B', disciplina: 'D', assunto: 'A', artigo: '', enunciado: '', alternativas: [], correta: 0, comentario: '' };
  const q2: Questao = { id: 2, banca: 'B', disciplina: 'D', assunto: 'A', artigo: '', enunciado: '', alternativas: [], correta: 0, comentario: '' };
  const q3: Questao = { id: 3, banca: 'B', disciplina: 'D', assunto: 'A', artigo: '', enunciado: '', alternativas: [], correta: 0, comentario: '' };

  const itens = [
    { questao: q1, status: 'recuperada' as const, totalTentativas: 2, totalErros: 1, ultimaTentativa: null, primeiroErroData: 0, ultimoErroData: 0 },
    { questao: q2, status: 'reincidente' as const, totalTentativas: 2, totalErros: 2, ultimaTentativa: null, primeiroErroData: 0, ultimoErroData: 0 },
    { questao: q3, status: 'inedito' as const, totalTentativas: 1, totalErros: 1, ultimaTentativa: null, primeiroErroData: 0, ultimoErroData: 0 },
  ];

  const ordenado = ordenarQuestoesCaderno(itens);
  assert.equal(ordenado[0].status, 'reincidente');
  assert.equal(ordenado[1].status, 'inedito');
  assert.equal(ordenado[2].status, 'recuperada');
});

test('ordenarQuestoesCaderno ordena da mais antiga (errou há mais dias) primeiro e as mais recentes pro final', () => {
  const q1: Questao = { id: 1, banca: 'B', disciplina: 'D', assunto: 'A', artigo: '', enunciado: '', alternativas: [], correta: 0, comentario: '' };
  const q2: Questao = { id: 2, banca: 'B', disciplina: 'D', assunto: 'A', artigo: '', enunciado: '', alternativas: [], correta: 0, comentario: '' };
  const q3: Questao = { id: 3, banca: 'B', disciplina: 'D', assunto: 'A', artigo: '', enunciado: '', alternativas: [], correta: 0, comentario: '' };

  // q1: reincidente resolvida hoje (timestamp mais recente: 3000)
  // q2: inédito errado há 10 dias (timestamp mais antigo: 1000)
  // q3: recuperada resolvida há 3 dias (timestamp intermediário: 2000)
  const itens = [
    {
      questao: q1,
      status: 'reincidente' as const,
      totalTentativas: 2,
      totalErros: 2,
      ultimaTentativa: { questaoId: 1, escolha: 1, acertou: false, data: 3000 },
      primeiroErroData: 1000,
      ultimoErroData: 3000,
    },
    {
      questao: q2,
      status: 'inedito' as const,
      totalTentativas: 1,
      totalErros: 1,
      ultimaTentativa: { questaoId: 2, escolha: 1, acertou: false, data: 1000 },
      primeiroErroData: 1000,
      ultimoErroData: 1000,
    },
    {
      questao: q3,
      status: 'recuperada' as const,
      totalTentativas: 2,
      totalErros: 1,
      ultimaTentativa: { questaoId: 3, escolha: 0, acertou: true, data: 2000 },
      primeiroErroData: 500,
      ultimoErroData: 500,
    },
  ];

  const ordenado = ordenarQuestoesCaderno(itens);
  // Mais antiga primeiro (q2, data 1000)
  assert.equal(ordenado[0].questao.id, 2);
  // Intermediária (q3, data 2000)
  assert.equal(ordenado[1].questao.id, 3);
  // Mais recente pro final (q1, data 3000)
  assert.equal(ordenado[2].questao.id, 1);
});

test('filtrarCadernoPorModo funciona para todos, reincidentes, ineditos e recuperadas', () => {
  const q1: Questao = { id: 1, banca: 'B', disciplina: 'D', assunto: 'A', artigo: '', enunciado: '', alternativas: [], correta: 0, comentario: '' };
  const q2: Questao = { id: 2, banca: 'B', disciplina: 'D', assunto: 'A', artigo: '', enunciado: '', alternativas: [], correta: 0, comentario: '' };
  const q3: Questao = { id: 3, banca: 'B', disciplina: 'D', assunto: 'A', artigo: '', enunciado: '', alternativas: [], correta: 0, comentario: '' };

  const itens = [
    { questao: q1, status: 'reincidente' as const, totalTentativas: 2, totalErros: 2, ultimaTentativa: null, primeiroErroData: 0, ultimoErroData: 0 },
    { questao: q2, status: 'inedito' as const, totalTentativas: 1, totalErros: 1, ultimaTentativa: null, primeiroErroData: 0, ultimoErroData: 0 },
    { questao: q3, status: 'recuperada' as const, totalTentativas: 2, totalErros: 1, ultimaTentativa: null, primeiroErroData: 0, ultimoErroData: 0 },
  ];

  assert.equal(filtrarCadernoPorModo(itens, 'todos').length, 3);
  assert.equal(filtrarCadernoPorModo(itens, 'reincidentes').length, 1);
  assert.equal(filtrarCadernoPorModo(itens, 'reincidentes')[0].status, 'reincidente');
  assert.equal(filtrarCadernoPorModo(itens, 'ineditos').length, 1);
  assert.equal(filtrarCadernoPorModo(itens, 'ineditos')[0].status, 'inedito');
  assert.equal(filtrarCadernoPorModo(itens, 'recuperadas').length, 1);
  assert.equal(filtrarCadernoPorModo(itens, 'recuperadas')[0].status, 'recuperada');
});

test('calcularMetricasRecuperacao calcula acertos recuperados e reincidentes corretamente', () => {
  const questoes: Questao[] = [
    { id: '1', banca: 'B', disciplina: 'D', assunto: 'A', artigo: '', enunciado: '', alternativas: [], correta: 0, comentario: '' },
    { id: '2', banca: 'B', disciplina: 'D', assunto: 'A', artigo: '', enunciado: '', alternativas: [], correta: 0, comentario: '' },
    { id: '3', banca: 'B', disciplina: 'D', assunto: 'A', artigo: '', enunciado: '', alternativas: [], correta: 0, comentario: '' },
  ];

  const historico: HistoricoRespostasMap = {
    '1': [
      { questaoId: '1', escolha: 1, acertou: false, data: 1000, origem: 'sessao' },
      { questaoId: '1', escolha: 0, acertou: true, data: 10000, origem: 'caderno' },
    ],
    '2': [
      { questaoId: '2', escolha: 1, acertou: false, data: 1000, origem: 'sessao' },
      { questaoId: '2', escolha: 1, acertou: false, data: 10000, origem: 'caderno' },
    ],
    '3': [
      { questaoId: '3', escolha: 0, acertou: true, data: 1000, origem: 'sessao' }, // Nunca errada
    ],
  };

  const metricas = calcularMetricasRecuperacao(
    questoes,
    historico,
    [],
    0,
    20000,
    () => true
  );

  assert.equal(metricas.totalQuestoesCaderno, 2);
  assert.equal(metricas.totalResolvidasNoPeriodo, 2);
  assert.equal(metricas.recuperadas, 1);
  assert.equal(metricas.reincidentes, 1);
  assert.equal(metricas.taxaRecuperacao, 50);
  assert.equal(metricas.pendentesNoCaderno, 1); // questao 2 está reincidente (pendente)
});

test('calcularMetricasRecuperacao zera o período se o usuário não resolveu questões pelo caderno de erros', () => {
  const questoes: Questao[] = [
    { id: 'q1', banca: 'B', disciplina: 'D', assunto: 'A', artigo: '', enunciado: '', alternativas: [], correta: 0, comentario: '' },
    { id: 'q2', banca: 'B', disciplina: 'D', assunto: 'A', artigo: '', enunciado: '', alternativas: [], correta: 0, comentario: '' },
  ];

  // Usuário resolveu uma sessão hoje: errou q1 pela primeira vez e acertou q2
  const historico: HistoricoRespostasMap = {
    q1: [{ questaoId: 'q1', escolha: 1, acertou: false, data: 5000, origem: 'sessao' }],
    q2: [{ questaoId: 'q2', escolha: 0, acertou: true, data: 5000, origem: 'sessao' }],
  };

  const metricas = calcularMetricasRecuperacao(
    questoes,
    historico,
    [],
    4000,
    6000,
    () => true
  );

  // A questão q1 entrou no caderno como inédito, mas NENHUMA tentativa foi feita PELO caderno
  assert.equal(metricas.totalQuestoesCaderno, 1);
  assert.equal(metricas.pendentesNoCaderno, 1);
  assert.equal(metricas.totalResolvidasNoPeriodo, 0); // Estritamente zerado!
  assert.equal(metricas.recuperadas, 0);
  assert.equal(metricas.reincidentes, 0);
  assert.equal(metricas.taxaRecuperacao, 0);
});

test('Caderno de Erros mantém a questão acumulativamente mesmo após ser recuperada', () => {
  const tentativas: TentativaResposta[] = [
    { questaoId: 'q99', escolha: 2, acertou: false, data: 1000 },
    { questaoId: 'q99', escolha: 0, acertou: true, data: 2000 },
  ];
  // A questão foi recuperada
  const info = classificarStatusCaderno(tentativas);
  assert.notEqual(info, null);
  assert.equal(info?.status, 'recuperada');

  // Continua existindo no caderno de erros
  const q: Questao = { id: 'q99', banca: 'B', disciplina: 'D', assunto: 'A', artigo: '', enunciado: '', alternativas: [], correta: 0, comentario: '' };
  const caderno = obterQuestoesCadernoErros([q], { q99: tentativas });
  assert.equal(caderno.length, 1);
  assert.equal(caderno[0].status, 'recuperada');
});

test('Caderno de Erros transita de recuperada para reincidente se errar novamente', () => {
  const tentativas: TentativaResposta[] = [
    { questaoId: 'q100', escolha: 2, acertou: false, data: 1000 },
    { questaoId: 'q100', escolha: 0, acertou: true, data: 2000 }, // recuperou
    { questaoId: 'q100', escolha: 3, acertou: false, data: 3000 }, // reincidiu
  ];
  const info = classificarStatusCaderno(tentativas);
  assert.notEqual(info, null);
  assert.equal(info?.status, 'reincidente');
});

test('calcularMetricasRecuperacao preserva tentativas historicas (sem origem) que ocorreram apos o primeiro erro', () => {
  const questoes: Questao[] = [
    { id: 'qLegacy1', banca: 'B', disciplina: 'D', assunto: 'A', artigo: '', enunciado: '', alternativas: [], correta: 0, comentario: '' },
    { id: 'qLegacy2', banca: 'B', disciplina: 'D', assunto: 'A', artigo: '', enunciado: '', alternativas: [], correta: 0, comentario: '' },
  ];

  // Tentativas do histórico legado (sem o campo origem)
  const historico: HistoricoRespostasMap = {
    qLegacy1: [
      { questaoId: 'qLegacy1', escolha: 1, acertou: false, data: 1000 }, // Primeiro erro (inclusão)
      { questaoId: 'qLegacy1', escolha: 0, acertou: true, data: 10000 },  // Recuperada no caderno legado
    ],
    qLegacy2: [
      { questaoId: 'qLegacy2', escolha: 1, acertou: false, data: 1000 }, // Primeiro erro (inclusão)
      { questaoId: 'qLegacy2', escolha: 2, acertou: false, data: 10000 }, // Reincidente no caderno legado
    ],
  };

  const metricas = calcularMetricasRecuperacao(
    questoes,
    historico,
    [{ id: 'banco_q_qLegacy1_10000', questaoId: 'qLegacy1', titulo: 'Questão', segundos: 60, data: 10000, tipo: 'banco' }],
    5000,
    15000,
    () => true
  );

  // Ambas as questões foram recuperadas/reincidentes na segunda tentativa (data 2000)
  assert.equal(metricas.totalQuestoesCaderno, 2);
  assert.equal(metricas.totalResolvidasNoPeriodo, 2);
  assert.equal(metricas.recuperadas, 1);
  assert.equal(metricas.reincidentes, 1);
  assert.equal(metricas.taxaRecuperacao, 50);
  // Ambas as questões foram resolvidas no período (60s cada = 120s total estimado/real)
  assert.equal(metricas.tempoRevisandoSegundos, 120);
});

test('calcularDiasDesdeUltimaResolucao retorna null para historico vazio ou invalido', () => {
  assert.equal(calcularDiasDesdeUltimaResolucao([]), null);
  assert.equal(calcularDiasDesdeUltimaResolucao(null), null);
  assert.equal(calcularDiasDesdeUltimaResolucao(undefined), null);
});

test('calcularDiasDesdeUltimaResolucao calcula 0 dias se foi hoje', () => {
  const ref = new Date('2026-11-04T15:30:00Z');
  // Tentativa feita hoje cedo
  const hoje = new Date('2026-11-04T08:15:00Z').getTime();
  const res = calcularDiasDesdeUltimaResolucao(hoje, ref);
  assert.notEqual(res, null);
  assert.equal(res?.dias, 0);
  assert.equal(res?.texto, 'Resolvida há 0 dias');
});

test('calcularDiasDesdeUltimaResolucao calcula 1 dia se foi ontem', () => {
  const ref = new Date('2026-11-04T10:00:00');
  // Ontem à noite
  const ontem = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - 1, 22, 0).getTime();
  const res = calcularDiasDesdeUltimaResolucao(ontem, ref);
  assert.notEqual(res, null);
  assert.equal(res?.dias, 1);
  assert.equal(res?.texto, 'Resolvida há 1 dia');
});

test('calcularDiasDesdeUltimaResolucao calcula 2 dias se foi antes de ontem', () => {
  const ref = new Date('2026-11-04T10:00:00');
  // Antes de ontem
  const anteontem = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - 2, 14, 0).getTime();
  const res = calcularDiasDesdeUltimaResolucao(anteontem, ref);
  assert.notEqual(res, null);
  assert.equal(res?.dias, 2);
  assert.equal(res?.texto, 'Resolvida há 2 dias');
});

test('calcularDiasDesdeUltimaResolucao funciona com array de tentativas pegando a ultima', () => {
  const ref = new Date('2026-11-04T12:00:00');
  const dAntiga = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - 5).getTime();
  const dRecente = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - 3).getTime();
  const tentativas: TentativaResposta[] = [
    { questaoId: 10, escolha: 1, acertou: false, data: dAntiga },
    { questaoId: 10, escolha: 2, acertou: false, data: dRecente },
  ];
  const res = calcularDiasDesdeUltimaResolucao(tentativas, ref);
  assert.notEqual(res, null);
  assert.equal(res?.dias, 3);
  assert.equal(res?.texto, 'Resolvida há 3 dias');
});

test('calcularMetricasRecuperacao soma tempo apenas quando alternativa for efetivamente escolhida', () => {
  const questoes: Questao[] = [
    { id: 'qTime1', banca: 'B', disciplina: 'D', assunto: 'A', artigo: '', enunciado: '', alternativas: [], correta: 0, comentario: '' },
  ];

  // Tentativa 1: primeiro erro (10s)
  // Tentativa 2: pulou no caderno sem escolher alternativa (escolha undefined ou negativa, 50s) -> NÃO SOMA
  // Tentativa 3: respondeu no caderno escolhendo alternativa 0 (escolha 0, 75s) -> DEVE SOMAR
  const historico: HistoricoRespostasMap = {
    qTime1: [
      { questaoId: 'qTime1', escolha: 1, acertou: false, data: 1000, tempoSegundos: 10, origem: 'sessao' },
      { questaoId: 'qTime1', escolha: undefined as any, acertou: false, data: 2000, tempoSegundos: 50, origem: 'caderno' },
      { questaoId: 'qTime1', escolha: 0, acertou: true, data: 3000, tempoSegundos: 75, origem: 'caderno' },
    ],
  };

  const metricas = calcularMetricasRecuperacao(
    questoes,
    historico,
    [],
    0,
    5000,
    () => true
  );

  // Apenas a tentativa 3 (75s) deve ser somada, pois a tentativa 2 não teve alternativa escolhida
  assert.equal(metricas.tempoRevisandoSegundos, 75);
  assert.equal(metricas.recuperadas, 1);
});

test('calcularMetricasRecuperacao agrega tempo de registros de caderno mesmo com timestamp aproximado', () => {
  const questoes: Questao[] = [
    { id: 'qApprox1', banca: 'B', disciplina: 'D', assunto: 'A', artigo: '', enunciado: '', alternativas: [], correta: 0, comentario: '' },
    { id: 'qApprox2', banca: 'B', disciplina: 'D', assunto: 'A', artigo: '', enunciado: '', alternativas: [], correta: 0, comentario: '' },
  ];

  const historico: HistoricoRespostasMap = {
    qApprox1: [
      { questaoId: 'qApprox1', escolha: 1, acertou: false, data: 1000, origem: 'sessao' },
      { questaoId: 'qApprox1', escolha: 0, acertou: true, data: 2005, origem: 'caderno' }, // sem tempoSegundos direto
    ],
    qApprox2: [
      { questaoId: 'qApprox2', escolha: 1, acertou: false, data: 1000, origem: 'sessao' },
      { questaoId: 'qApprox2', escolha: 0, acertou: true, data: 4000, origem: 'caderno' }, // sem tempoSegundos direto
    ],
  };

  const registrosTempo = [
    // Registro 1: timestamp com 5ms de diferença (2000 vs 2005)
    { id: 'caderno_q_qApprox1_2000', questaoId: 'qApprox1', titulo: 'Caderno', segundos: 45, data: 2000, tipo: 'caderno' as const },
    // Registro 2: registro gravado com tipo caderno
    { id: 'caderno_q_qApprox2_4000', questaoId: 'qApprox2', titulo: 'Caderno', segundos: 65, data: 4000, tipo: 'caderno' as const },
  ];

  const metricas = calcularMetricasRecuperacao(
    questoes,
    historico,
    registrosTempo,
    0,
    9999,
    () => true
  );

  assert.equal(metricas.totalResolvidasNoPeriodo, 2);
  assert.equal(metricas.recuperadas, 2);
  // Ambos os tempos devem ser encontrados e somados (45 + 65 = 110s)
  assert.equal(metricas.tempoRevisandoSegundos, 110);
});

test('PERIODO_FILTRO_PADRAO deve ser estritamente "hoje"', () => {
  assert.equal(PERIODO_FILTRO_PADRAO, 'hoje');
});

test('calcularLimitesPeriodo calcula limites exatos para "hoje"', () => {
  const agoraFixo = new Date(2026, 10, 7, 14, 30, 0); // 07/Nov/2026 14:30:00
  const limites = calcularLimitesPeriodo('hoje', '', '', agoraFixo);

  const esperadoInicio = new Date(2026, 10, 7, 0, 0, 0, 0).getTime();
  const esperadoFim = agoraFixo.getTime();

  assert.equal(limites.limiteInicio, esperadoInicio);
  assert.equal(limites.limiteFim, esperadoFim);
});

test('calcularLimitesPeriodo calcula limites para "ontem" cobrindo o dia civil anterior inteiro', () => {
  const agoraFixo = new Date(2026, 10, 7, 14, 30, 0);
  const limites = calcularLimitesPeriodo('ontem', '', '', agoraFixo);

  const esperadoInicio = new Date(2026, 10, 6, 0, 0, 0, 0).getTime();
  const esperadoFim = new Date(2026, 10, 7, 0, 0, 0, 0).getTime() - 1;

  assert.equal(limites.limiteInicio, esperadoInicio);
  assert.equal(limites.limiteFim, esperadoFim);
});

test('calcularLimitesPeriodo calcula limites para 0 (desde o início), 7 dias e custom', () => {
  const agoraFixo = new Date(2026, 10, 7, 14, 30, 0);
  const inicioZero = calcularLimitesPeriodo(0, '', '', agoraFixo);
  assert.equal(inicioZero.limiteInicio, 0);

  const seteDias = calcularLimitesPeriodo(7, '', '', agoraFixo);
  assert.equal(seteDias.limiteInicio, agoraFixo.getTime() - 7 * 24 * 60 * 60 * 1000);

  const custom = calcularLimitesPeriodo('custom', '2026-11-01', '2026-11-05', agoraFixo);
  assert.equal(custom.limiteInicio, new Date('2026-11-01T00:00:00').getTime());
  assert.equal(custom.limiteFim, new Date('2026-11-05T23:59:59').getTime());
});

test('filtro padrão "hoje" inclui apenas tentativas realizadas na data de hoje', () => {
  const agoraFixo = new Date(2026, 10, 7, 15, 0, 0);
  const { limiteInicio, limiteFim } = calcularLimitesPeriodo(PERIODO_FILTRO_PADRAO, '', '', agoraFixo);

  const hojeTimestamp = new Date(2026, 10, 7, 10, 0, 0).getTime();
  const ontemTimestamp = new Date(2026, 10, 6, 18, 0, 0).getTime();
  const doisDiasTimestamp = new Date(2026, 10, 5, 12, 0, 0).getTime();

  const questoes: Questao[] = [
    { id: 1, enunciado: 'Q1', alternativas: ['A', 'B'], correta: 0, disciplina: 'Dir', assunto: 'Const', banca: 'CESPE', artigo: 'Art 1', comentario: 'Comentário' },
    { id: 2, enunciado: 'Q2', alternativas: ['A', 'B'], correta: 0, disciplina: 'Dir', assunto: 'Const', banca: 'CESPE', artigo: 'Art 1', comentario: 'Comentário' },
  ];

  const historico: HistoricoRespostasMap = {
    1: [
      { questaoId: 1, escolha: 1, acertou: false, data: doisDiasTimestamp, origem: 'sessao' },
      { questaoId: 1, escolha: 0, acertou: true, data: hojeTimestamp, origem: 'caderno' }, // resolvida HOJE
    ],
    2: [
      { questaoId: 2, escolha: 1, acertou: false, data: doisDiasTimestamp, origem: 'sessao' },
      { questaoId: 2, escolha: 0, acertou: true, data: ontemTimestamp, origem: 'caderno' }, // resolvida ONTEM
    ],
  };

  const metricasHoje = calcularMetricasRecuperacao(
    questoes,
    historico,
    [],
    limiteInicio,
    limiteFim,
    () => true
  );

  // Apenas a questão 1 deve constar nas recuperadas de HOJE
  assert.equal(metricasHoje.totalResolvidasNoPeriodo, 1);
  assert.equal(metricasHoje.recuperadas, 1);
});




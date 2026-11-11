import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatarTempoMinutosSegundos,
  formatarTempoHorasMinutos,
  calcularSegundosPorQuestao,
  formatarMinutosPorQuestao,
  calcularQuestoesPorMinuto,
  formatarQuestoesPorMinuto,
  calcularResumoSessao,
  ehUltimaQuestaoRespondida,
  somarTempoSessoes,
  obterInfoConclusaoSessao,
} from './sessionTimer.ts';

test('formatarTempoMinutosSegundos formats 0s as 00:00', () => {
  assert.equal(formatarTempoMinutosSegundos(0), '00:00');
});

test('formatarTempoMinutosSegundos formats 65s as 01:05', () => {
  assert.equal(formatarTempoMinutosSegundos(65), '01:05');
});

test('formatarTempoMinutosSegundos formats 3600s as 60:00', () => {
  assert.equal(formatarTempoMinutosSegundos(3600), '60:00');
});

test('formatarTempoHorasMinutos formats zero as 0h 00min', () => {
  assert.equal(formatarTempoHorasMinutos(0), '0h 00min');
});

test('formatarTempoHorasMinutos formats 45s as 0h 00min', () => {
  assert.equal(formatarTempoHorasMinutos(45), '0h 00min');
});

test('formatarTempoHorasMinutos formats 300s (5min) as 0h 05min', () => {
  assert.equal(formatarTempoHorasMinutos(300), '0h 05min');
});

test('formatarTempoHorasMinutos formats 3660s as 1h 01min', () => {
  assert.equal(formatarTempoHorasMinutos(3660), '1h 01min');
});

test('formatarTempoHorasMinutos formats 8100s as 2h 15min', () => {
  assert.equal(formatarTempoHorasMinutos(8100), '2h 15min');
});

test('calcularResumoSessao computes correct acertos, erros and accuracy percentage', () => {
  const ids = [101, 102, 103, 104];
  const respostas = {
    101: { escolha: 0, acertou: true },
    102: { escolha: 2, acertou: false },
    103: { escolha: 1, acertou: true },
  };
  const resumo = calcularResumoSessao(ids, respostas);
  assert.equal(resumo.totalQuestoes, 4);
  assert.equal(resumo.respondidas, 3);
  assert.equal(resumo.acertos, 2);
  assert.equal(resumo.erros, 1);
  assert.equal(resumo.taxa, 67); // Math.round(2/3 * 100)
  assert.equal(resumo.finalizada, false);
});

test('calcularResumoSessao detects finalizada when all questions answered', () => {
  const ids = [1, 2];
  const respostas = {
    1: { escolha: 0, acertou: true },
    2: { escolha: 1, acertou: true },
  };
  const resumo = calcularResumoSessao(ids, respostas);
  assert.equal(resumo.finalizada, true);
  assert.equal(resumo.taxa, 100);
});

test('ehUltimaQuestaoRespondida detects when answering the last question', () => {
  const ids = [1, 2, 3];
  const respostas = {
    1: { escolha: 0, acertou: true },
    2: { escolha: 1, acertou: false },
  };
  // Answering question 3 now completes the session
  assert.equal(ehUltimaQuestaoRespondida(ids, respostas, 3), true);
  // Answering question 1 again does not complete because 3 is still pending
  assert.equal(ehUltimaQuestaoRespondida(ids, {}, 1), false);
});

test('somarTempoSessoes sums seconds and respects optional time limits', () => {
  const now = Date.now();
  const registros = [
    { id: '1', titulo: 'Sessao 1', segundos: 600, data: now - 1000 },
    { id: '2', titulo: 'Sessao 2', segundos: 1200, data: now - 500000 },
  ];
  assert.equal(somarTempoSessoes(registros), 1800);
  assert.equal(somarTempoSessoes(registros, now - 2000, now), 600);
});

test('somarTempoSessoes filters by disciplina (bloco), assunto (materia) and banca', () => {
  const now = Date.now();
  const registros = [
    {
      id: '1',
      sessaoId: 's1',
      codigo: 'BL02L14133x1',
      titulo: '02_Licitações Contratos Custos - Lei 14.133/21',
      segundos: 1200, // 20min
      data: now,
      disciplina: '02_Licitações Contratos Custos',
      assunto: 'Lei 14.133/21',
      banca: 'Cebraspe',
    },
    {
      id: '2',
      sessaoId: 's2',
      codigo: 'BL03NR35x1',
      titulo: '03_Normas Técnicas Segurança - NR-35',
      segundos: 1800, // 30min
      data: now,
      disciplina: '03_Normas Técnicas Segurança',
      assunto: 'NR-35',
      banca: 'FGV',
    },
    {
      id: '3',
      sessaoId: 's3',
      codigo: 'BL02D11555x1',
      titulo: '02_Licitações Contratos Custos - Decreto 11.555/23',
      segundos: 600, // 10min
      data: now,
      // without explicit disciplina, inferred from sessoesCriadas
    },
  ];

  const sessoesCriadas = [
    {
      id: 's3',
      codigo: 'BL02D11555x1',
      disciplina: '02_Licitações Contratos Custos',
      assunto: 'Decreto 11.555/23',
      banca: 'Cebraspe',
    },
  ];

  // 1. Sem filtro: soma tudo (1200 + 1800 + 600 = 3600s = 1h)
  assert.equal(somarTempoSessoes(registros, 0, now + 1000), 3600);

  // 2. Filtro por bloco '02_Licitações Contratos Custos': deve somar reg 1 e reg 3 (1200 + 600 = 1800s)
  assert.equal(
    somarTempoSessoes(registros, 0, now + 1000, {
      disciplina: '02_Licitações Contratos Custos',
      sessoesCriadas,
    }),
    1800
  );

  // 3. Filtro por bloco '03_Normas Técnicas Segurança': deve somar apenas reg 2 (1800s)
  assert.equal(
    somarTempoSessoes(registros, 0, now + 1000, {
      disciplina: '03_Normas Técnicas Segurança',
      sessoesCriadas,
    }),
    1800
  );

  // 4. Filtro por assunto 'Lei 14.133/21': deve somar apenas reg 1 (1200s)
  assert.equal(
    somarTempoSessoes(registros, 0, now + 1000, {
      assunto: 'Lei 14.133/21',
      sessoesCriadas,
    }),
    1200
  );

  // 5. Filtro por banca 'FGV': deve somar apenas reg 2 (1800s)
  assert.equal(
    somarTempoSessoes(registros, 0, now + 1000, {
      banca: 'FGV',
      sessoesCriadas,
    }),
    1800
  );

  // 6. Filtro por matérias individuais (materiasFiltro): apenas Lei 14.133/21
  assert.equal(
    somarTempoSessoes(registros, 0, now + 1000, {
      disciplinas: ['02_Licitações Contratos Custos', '03_Normas Técnicas Segurança'],
      materiasFiltro: ['Lei 14.133/21'],
      sessoesCriadas,
    }),
    1200
  );

  // 7. Filtro por matérias individuais desmarcando uma delas
  assert.equal(
    somarTempoSessoes(registros, 0, now + 1000, {
      disciplinas: ['02_Licitações Contratos Custos'],
      materiasFiltro: ['02_Licitações Contratos Custos:::Decreto 11.555/23'],
      sessoesCriadas,
    }),
    600
  );
});

test('calcularQuestoesPorMinuto calculates exact pace based on user example', () => {
  // User example: 20 questoes in 23 minutes (1380s) -> 0.87
  assert.equal(calcularQuestoesPorMinuto(20, 1380), 0.87);
  // 10 questoes in 5 minutes (300s) -> 2.0
  assert.equal(calcularQuestoesPorMinuto(10, 300), 2.0);
  // Zero handling
  assert.equal(calcularQuestoesPorMinuto(0, 300), 0);
  assert.equal(calcularQuestoesPorMinuto(20, 0), 0);
});

test('formatarQuestoesPorMinuto formats with comma and 2 decimals in pt-BR', () => {
  // User example: 20 questoes in 23 minutes -> "0,87"
  assert.equal(formatarQuestoesPorMinuto(20, 1380), '0,87');
  // 10 questoes in 5 minutes -> "2,00"
  assert.equal(formatarQuestoesPorMinuto(10, 300), '2,00');
  // 0s -> "0,00"
  assert.equal(formatarQuestoesPorMinuto(0, 0), '0,00');
});

test('obterInfoConclusaoSessao includes questoesPorMinuto and questoesPorMinutoFormatado', () => {
  const sessao = {
    id: 1,
    codigo: 'BL06L629x1',
    disciplina: 'BLOCO 6',
    assunto: '629_Vistorias',
    quantidade: 20,
    tempoSegundos: 1380, // 23 minutos
    concluida: true,
  };
  const info = obterInfoConclusaoSessao(sessao, []);
  assert.equal(info.temTempo, true);
  assert.equal(info.segundos, 1380);
  assert.equal(info.questoesPorMinuto, 0.87);
  assert.equal(info.questoesPorMinutoFormatado, '0,87');
  // Minutos por questão: 23min (1380s) para 20 questões = 69s = 1:09 m/q
  assert.equal(info.segundosPorQuestao, 69);
  assert.equal(info.minutosPorQuestaoFormatado, '1:09');
});

test('calcularSegundosPorQuestao matches user exact example (1380s / 20 = 69s)', () => {
  assert.equal(calcularSegundosPorQuestao(20, 1380), 69);
  assert.equal(calcularSegundosPorQuestao(10, 300), 30);
  assert.equal(calcularSegundosPorQuestao(0, 1380), 0);
  assert.equal(calcularSegundosPorQuestao(20, 0), 0);
});

test('formatarMinutosPorQuestao formats 69s as 1:09 m/q reading', () => {
  assert.equal(formatarMinutosPorQuestao(20, 1380), '1:09');
  assert.equal(formatarMinutosPorQuestao(10, 300), '0:30');
  assert.equal(formatarMinutosPorQuestao(1, 125), '2:05');
  assert.equal(formatarMinutosPorQuestao(0, 0), '0:00');
});

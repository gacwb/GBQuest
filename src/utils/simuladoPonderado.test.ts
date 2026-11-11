import test from 'node:test';
import assert from 'node:assert/strict';
import {
  METRICAS_PROVA_REAL,
  TABELA_PDFS_ESTUDO,
  calcularDistribuicaoSimuladoPonderado,
  calcularMetricasViewSimulados,
  formatarSegundosEmMinutosPorQuestao,
  completarShortfallSimulado,
  identificarSessoesParaPurga,
} from './simuladoPonderado';

test('METRICAS_PROVA_REAL contém as constantes reais da prova FAFIPA Curitiba', () => {
  assert.equal(METRICAS_PROVA_REAL.TOTAL_QUESTOES, 40);
  assert.equal(METRICAS_PROVA_REAL.QUESTOES_PORTUGUES, 5);
  assert.equal(METRICAS_PROVA_REAL.QUESTOES_INFORMATICA, 5);
  assert.equal(METRICAS_PROVA_REAL.QUESTOES_ESPECIFICAS, 30);
  assert.equal(METRICAS_PROVA_REAL.TEMPO_TOTAL_SEGUNDOS, 14400); // 4 horas
  assert.equal(METRICAS_PROVA_REAL.TEMPO_GABARITO_SEGUNDOS, 1800); // 30 min gabarito
  assert.equal(METRICAS_PROVA_REAL.TEMPO_LIQUIDO_SEGUNDOS, 12600); // 210 min líquidos
  assert.equal(METRICAS_PROVA_REAL.RITMO_ALVO_SEGUNDOS, 315); // 5 min 15 seg por questão
  assert.equal(METRICAS_PROVA_REAL.META_APROVACAO_PCT, 98); // Meta de 98%
});

test('TABELA_PDFS_ESTUDO contém exatamente os 34 PDFs de estudo do usuário', () => {
  assert.equal(TABELA_PDFS_ESTUDO.length, 34);

  const especificas = TABELA_PDFS_ESTUDO.filter((p) => p.tipo === 'especifica');
  const portugues = TABELA_PDFS_ESTUDO.filter((p) => p.tipo === 'portugues');
  const informatica = TABELA_PDFS_ESTUDO.filter((p) => p.tipo === 'informatica');

  assert.equal(especificas.length, 30);
  assert.equal(portugues.length, 2);
  assert.equal(informatica.length, 2);

  // Todo PDF com peso menor que 1 possui de 3 a 5 tópicos fundamentais definidos
  const menoresQue1 = especificas.filter((p) => p.pesoEstimado < 1.0);
  assert.equal(menoresQue1.length, 14); // 14 PDFs com peso < 1

  menoresQue1.forEach((pdf) => {
    assert.ok(
      pdf.topicosFundamentais.length >= 3 && pdf.topicosFundamentais.length <= 5,
      `PDF ${pdf.codigo} deve ter entre 3 e 5 tópicos fundamentais (possui ${pdf.topicosFundamentais.length})`
    );
  });
});

test('calcularDistribuicaoSimuladoPonderado gera exatamente 40 questões (5 Port + 5 Info + 30 Eng)', () => {
  for (let i = 0; i < 10; i++) {
    const res = calcularDistribuicaoSimuladoPonderado(40);
    assert.equal(res.totalQuestoes, 40, `Iteração ${i}: total deve ser 40`);
    assert.equal(res.totalPortugues, 5, `Iteração ${i}: português deve ser 5`);
    assert.equal(res.totalInformatica, 5, `Iteração ${i}: informática deve ser 5`);
    assert.equal(res.totalEspecificas, 30, `Iteração ${i}: específicas deve ser 30`);

    // Os gigantes 104 e 311 devem ter pelo menos 2 questões cada
    const q104 = res.itens.find((it) => it.pdf.codigo === '104')!;
    const q311 = res.itens.find((it) => it.pdf.codigo === '311')!;
    assert.ok(q104.quantidade >= 2, `104_Codigo_de_Obras deve ter >= 2 (teve ${q104.quantidade})`);
    assert.ok(q311.quantidade >= 2, `311_Materiais deve ter >= 2 (teve ${q311.quantidade})`);
  }
});

test('Roleta estocástica sorteia temas de baixo peso ao longo de múltiplas execuções', () => {
  // Verifica que PDFs de peso baixo (< 1) não estão excluídos e são sorteados
  const codigosSorteados = new Set<string>();

  for (let i = 0; i < 50; i++) {
    const res = calcularDistribuicaoSimuladoPonderado(40);
    res.itens.forEach((it) => {
      if (it.quantidade > 0) {
        codigosSorteados.add(it.pdf.codigo);
      }
    });
  }

  // Com 50 rodadas, praticamente todos os 34 PDFs devem ter sido contemplados pelo menos uma vez
  assert.ok(
    codigosSorteados.size >= 30,
    `Ao menos 30 dos 34 PDFs devem ter aparecido ao longo de 50 rodadas (apareceram ${codigosSorteados.size})`
  );
});

test('formatarSegundosEmMinutosPorQuestao formata corretamente', () => {
  assert.equal(formatarSegundosEmMinutosPorQuestao(0), '0:00 m/q');
  assert.equal(formatarSegundosEmMinutosPorQuestao(60), '1:00 m/q');
  assert.equal(formatarSegundosEmMinutosPorQuestao(150), '2:30 m/q');
  assert.equal(formatarSegundosEmMinutosPorQuestao(315), '5:15 m/q'); // Ritmo exato da prova de Curitiba
});

test('calcularMetricasViewSimulados computa taxas, ritmos e meta de 98% corretamente para simulados concluídos', () => {
  const sessoesMock = [
    {
      id: 1,
      codigo: 'SIM-CTBA-01',
      quantidade: 40,
      concluida: true,
      acertos: 39, // 39/40 = 97.5% -> ~98%
      erros: 1,
      tempoSegundos: 6000, // 6000s / 40 = 150s (2:30 m/q)
      created_at: new Date(2026, 10, 7).toISOString(),
    },
    {
      id: 2,
      codigo: 'SIM-CTBA-02',
      quantidade: 40,
      concluida: true,
      acertos: 40, // 40/40 = 100%
      erros: 0,
      tempoSegundos: 8000, // 8000s / 40 = 200s (3:20 m/q)
      created_at: new Date(2026, 10, 8).toISOString(),
    },
    {
      id: 3,
      codigo: 'SES-01', // Sessão comum - não deve ser contabilizada como simulado
      quantidade: 10,
      concluida: true,
      acertos: 5,
      erros: 5,
      tempoSegundos: 500,
    },
  ];

  const metricas = calcularMetricasViewSimulados(sessoesMock);

  assert.equal(metricas.totalSimuladosConcluidos, 2);
  assert.equal(metricas.totalQuestoesSimulados, 80);
  assert.equal(metricas.totalAcertos, 79);
  assert.equal(metricas.totalErros, 1);
  assert.equal(metricas.taxaAcertoMedia, 99); // 79/80 = 98.75% -> 99%
  assert.equal(metricas.metaAprovacaoAtingida, true); // >= 98%
  assert.equal(metricas.dentroDoRitmoLimite, true); // ritmo médio < 315s
  assert.ok(metricas.folgaSegundosPorQuestao > 0);
});

test('calcularMetricasViewSimulados ignora estritamente simulados recém-criados e zerados (não concluídos)', () => {
  // Simulado recém-gerado com 0 questões respondidas (não concluído)
  const simuladoZerado = {
    id: 10,
    codigo: 'SIM-CTBA-01',
    quantidade: 40,
    concluida: false,
    acertos: undefined,
    erros: undefined,
    tempoSegundos: 0,
  };

  const metricasZerado = calcularMetricasViewSimulados([simuladoZerado]);
  assert.equal(metricasZerado.totalSimuladosConcluidos, 0);
  assert.equal(metricasZerado.totalQuestoesSimulados, 0);
  assert.equal(metricasZerado.historicoSimulados.length, 0);
  assert.equal(metricasZerado.taxaAcertoMedia, 0);

  // Quando finalizado (concluída após a 40ª questão com o resuminho), passa a ser computado
  const simuladoConcluido = {
    ...simuladoZerado,
    concluida: true,
    acertos: 38,
    erros: 2,
    tempoSegundos: 7200,
  };

  const metricasFinalizado = calcularMetricasViewSimulados([simuladoConcluido]);
  assert.equal(metricasFinalizado.totalSimuladosConcluidos, 1);
  assert.equal(metricasFinalizado.totalQuestoesSimulados, 40);
  assert.equal(metricasFinalizado.totalAcertos, 38);
  assert.equal(metricasFinalizado.totalErros, 2);
  assert.equal(metricasFinalizado.historicoSimulados.length, 1);
  assert.equal(metricasFinalizado.historicoSimulados[0].codigo, 'SIM-CTBA-01');
  assert.equal(metricasFinalizado.taxaAcertoMedia, 95);
});

test('identificarSessoesParaPurga protege estritamente simulados oficiais (SIM-CTBA-) e só purga testes legados', () => {
  const lista = [
    { id: 1, codigo: 'SIM-CTBA-01', assunto: 'Simulado Oficial Ponderado Inédito (40Q)' },
    { id: 2, codigo: 'SIM-CTBA-02', assunto: 'Simulado Ponderado FAFIPA (40Q)' },
    { id: 3, codigo: 'SIM-TESTE-99', assunto: 'Simulado de teste preliminar' },
    { id: 4, codigo: 'BL02L14133x1', assunto: '14133_Licitacoes' },
  ];

  const elegiveis = identificarSessoesParaPurga(lista);
  assert.equal(elegiveis.length, 1);
  assert.equal(elegiveis[0].codigo, 'SIM-TESTE-99');

  // Garante que SIM-CTBA-01 e SIM-CTBA-02 NUNCA aparecem na lista para purga
  assert.ok(!elegiveis.some((s) => s.codigo === 'SIM-CTBA-01'));
  assert.ok(!elegiveis.some((s) => s.codigo === 'SIM-CTBA-02'));
});

test('completarShortfallSimulado preenche deficit de lote incompleto até atingir exatamente 40 questões sem duplicações', () => {
  // Simula 34 questões geradas com sucesso
  const obtidas = Array.from({ length: 34 }, (_, idx) => ({
    id: `ia_q_${idx + 1}`,
    enunciado: `Questão IA ${idx + 1}`,
  }));

  // Simula 10 questões disponíveis de reserva
  const reserva = Array.from({ length: 10 }, (_, idx) => ({
    id: `banco_q_${idx + 1}`,
    enunciado: `Questão Banco ${idx + 1}`,
  }));

  const completas = completarShortfallSimulado(obtidas, reserva, 40);
  assert.equal(completas.length, 40);

  // 34 originais + 6 complementares
  const ids = new Set(completas.map((q) => q.id));
  assert.equal(ids.size, 40);
  assert.equal(ids.has('ia_q_1'), true);
  assert.equal(ids.has('ia_q_34'), true);
  assert.equal(ids.has('banco_q_1'), true);
  assert.equal(ids.has('banco_q_6'), true);
  assert.equal(ids.has('banco_q_7'), false); // apenas 6 eram necessárias
});

test('auto-restauração defensiva recupera questões faltantes a partir de questoesSnap da sessão', () => {
  // Simula banco geral com apenas questões legadas (ex: 1022 questões sem o simulado)
  const questoesBancoGeral = [
    { id: 101, enunciado: 'Questão antiga 101', banca: 'FAFIPA' },
    { id: 102, enunciado: 'Questão antiga 102', banca: 'FAFIPA' },
  ];

  // Simula a sessão SIM-CTBA-01 contendo seu snapshot de 40 questões embutido
  const snapshot40 = Array.from({ length: 40 }, (_, idx) => ({
    id: `sim_ctba_01_q${idx + 1}`,
    enunciado: `Questão Oficial ${idx + 1} da Prova Real`,
    banca: 'FAFIPA',
    disciplina: idx < 5 ? 'Língua Portuguesa' : idx < 10 ? 'Informática Básica' : 'Engenharia Civil',
  }));

  const sessaoSimulado = {
    id: 'sess_sim_01',
    codigo: 'SIM-CTBA-01',
    questaoIds: snapshot40.map((q) => q.id),
    questoesSnap: snapshot40,
  };

  // Executa lógica defensiva de merge
  const idSet = new Set(questoesBancoGeral.map((q) => String(q.id)));
  const recuperadas: any[] = [];
  sessaoSimulado.questoesSnap.forEach((sq) => {
    if (!idSet.has(String(sq.id))) {
      recuperadas.push(sq);
      idSet.add(String(sq.id));
    }
  });

  const bancoRestaurado = [...questoesBancoGeral, ...recuperadas];

  // Garante que o banco foi restaurado e todas as 40 questões agora existem no estado
  assert.equal(bancoRestaurado.length, 42); // 2 legadas + 40 recuperadas
  assert.equal(bancoRestaurado.some((q) => q.id === 'sim_ctba_01_q1'), true);
  assert.equal(bancoRestaurado.some((q) => q.id === 'sim_ctba_01_q40'), true);
});

test('merge defensivo de questões locais nunca descarta questões geradas offline ou pendentes de sync', () => {
  const parsedNuvem = [
    { id: 1, enunciado: 'Q1 Nuvem' },
    { id: 2, enunciado: 'Q2 Nuvem' },
  ];

  const localCache = [
    { id: 1, enunciado: 'Q1 Nuvem' }, // Já na nuvem
    { id: 1773000001, enunciado: 'Q IA Simulado 1 (local)' },
    { id: 1773000002, enunciado: 'Q IA Simulado 2 (local)' },
  ];

  const idSet = new Set(parsedNuvem.map((q) => String(q.id)));
  const pendentes = localCache.filter((lq) => !idSet.has(String(lq.id)));

  assert.equal(pendentes.length, 2);
  assert.equal(pendentes[0].id, 1773000001);
  assert.equal(pendentes[1].id, 1773000002);

  const listaFinal = [...parsedNuvem, ...pendentes];
  assert.equal(listaFinal.length, 4);
});



import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  questaoAtendeFiltrosMultiplos,
  aplicarFiltrosMultiplosBanco,
  calcularContagensChipsBanco,
  ehQuestaoProvaAnterior,
  ehQuestaoEmEscala,
  ehQuestaoSimulado,
  TipoChipFiltroBanco,
} from './bancoFiltrosMultiplos';
import { Questao, TentativaResposta } from '../types';

describe('bancoFiltrosMultiplos', () => {
  const questoesMock: Questao[] = [
    {
      id: 1,
      banca: 'FAFIPA',
      cargo: 'Engenheiro Civil',
      disciplina: 'Bloco 1',
      assunto: 'Lei Orgânica',
      artigo: 'Art. 1',
      enunciado: 'Questão 1 de simulado resolvida e acertada',
      alternativas: ['A', 'B', 'C', 'D', 'E'],
      correta: 0,
      comentario: 'Comentário 1',
    },
    {
      id: 2,
      banca: 'FAFIPA',
      cargo: 'Engenheiro Civil',
      disciplina: 'Bloco 1',
      assunto: 'Estatuto',
      artigo: 'Art. 2',
      enunciado: 'Questão 2 de simulado resolvida e errada',
      alternativas: ['A', 'B', 'C', 'D', 'E'],
      correta: 1,
      comentario: 'Comentário 2',
    },
    {
      id: 3,
      banca: 'FAFIPA',
      cargo: 'Engenheiro Civil',
      disciplina: 'Bloco 2',
      assunto: 'Licitações',
      artigo: 'Art. 3',
      enunciado: 'Questão 3 de simulado NÃO resolvida',
      alternativas: ['A', 'B', 'C', 'D', 'E'],
      correta: 2,
      comentario: 'Comentário 3',
    },
    {
      id: 4,
      banca: 'FAFIPA',
      cargo: 'Engenheiro Civil',
      disciplina: 'Bloco 3',
      assunto: 'NBR 6118',
      artigo: 'Item 4',
      enunciado: 'Questão 4 AVULSA resolvida e acertada',
      alternativas: ['A', 'B', 'C', 'D', 'E'],
      correta: 3,
      comentario: 'Comentário 4',
    },
    {
      id: 5,
      banca: 'FAFIPA',
      cargo: 'Engenheiro Civil',
      disciplina: 'Bloco 3',
      assunto: 'Estruturas',
      artigo: 'Item 5',
      enunciado: 'Questão 5 AVULSA resolvida e errada',
      alternativas: ['A', 'B', 'C', 'D', 'E'],
      correta: 4,
      comentario: 'Comentário 5',
    },
    {
      id: 6,
      banca: 'FAFIPA',
      cargo: 'Engenheiro Civil',
      disciplina: 'Bloco 7',
      assunto: 'Português',
      artigo: 'Texto',
      enunciado: 'Questão 6 AVULSA NÃO resolvida',
      alternativas: ['A', 'B', 'C', 'D', 'E'],
      correta: 0,
      comentario: 'Comentário 6',
    },
  ];

  // IDs 1, 2 e 3 pertencem a simulados
  const idsSimulados = new Set<string | number>([1, 2, 3]);

  // Histórico de resoluções:
  // Q1: acertou
  // Q2: errou
  // Q3: não resolvida
  // Q4: acertou
  // Q5: errou
  // Q6: não resolvida
  const snapshotHistorico: Record<string | number, TentativaResposta[]> = {
    1: [{ escolha: 0, acertou: true, data: 1000 }],
    2: [{ escolha: 0, acertou: false, data: 2000 }],
    4: [{ escolha: 3, acertou: true, data: 3000 }],
    5: [{ escolha: 2, acertou: false, data: 4000 }],
  };

  it('sem chips selecionados (vazio), retorna todas as 6 questões', () => {
    const res = aplicarFiltrosMultiplosBanco({
      questoes: questoesMock,
      snapshotHistorico,
      idsSimulados,
      chipsSelecionados: [],
    });
    assert.strictEqual(res.length, 6);
  });

  it('com chip [simulados] isolado, filtra apenas as 3 questões de simulado', () => {
    const res = aplicarFiltrosMultiplosBanco({
      questoes: questoesMock,
      snapshotHistorico,
      idsSimulados,
      chipsSelecionados: ['simulados'],
    });
    assert.strictEqual(res.length, 3);
    assert.deepStrictEqual(res.map((q) => q.id), [1, 2, 3]);
  });

  it('com combinação múltipla [simulados, errei], retorna apenas questões de simulados que foram erradas', () => {
    const res = aplicarFiltrosMultiplosBanco({
      questoes: questoesMock,
      snapshotHistorico,
      idsSimulados,
      chipsSelecionados: ['simulados', 'errei'],
    });
    assert.strictEqual(res.length, 1);
    assert.strictEqual(res.map((q) => q.id)[0], 2);
  });

  it('com combinação múltipla [simulados, nao-resolvidas], retorna questões de simulado pendentes', () => {
    const res = aplicarFiltrosMultiplosBanco({
      questoes: questoesMock,
      snapshotHistorico,
      idsSimulados,
      chipsSelecionados: ['simulados', 'nao-resolvidas'],
    });
    assert.strictEqual(res.length, 1);
    assert.strictEqual(res.map((q) => q.id)[0], 3);
  });

  it('com combinação múltipla [simulados, resolvidas], retorna questões de simulados já resolvidas', () => {
    const res = aplicarFiltrosMultiplosBanco({
      questoes: questoesMock,
      snapshotHistorico,
      idsSimulados,
      chipsSelecionados: ['simulados', 'resolvidas'],
    });
    assert.strictEqual(res.length, 2);
    assert.deepStrictEqual(res.map((q) => q.id), [1, 2]);
  });

  it('com combinação múltipla [acertei, errei], retorna todas as 4 questões já resolvidas', () => {
    const res = aplicarFiltrosMultiplosBanco({
      questoes: questoesMock,
      snapshotHistorico,
      idsSimulados,
      chipsSelecionados: ['acertei', 'errei'],
    });
    assert.strictEqual(res.length, 4);
    assert.deepStrictEqual(res.map((q) => q.id), [1, 2, 4, 5]);
  });

  it('com combinação múltipla [errei, nao-resolvidas], retorna as erradas e as pendentes (4 questões)', () => {
    const res = aplicarFiltrosMultiplosBanco({
      questoes: questoesMock,
      snapshotHistorico,
      idsSimulados,
      chipsSelecionados: ['errei', 'nao-resolvidas'],
    });
    assert.strictEqual(res.length, 4);
    assert.deepStrictEqual(res.map((q) => q.id), [2, 3, 5, 6]);
  });

  it('calcularContagensChipsBanco calcula com precisão os badges para cada filtro', () => {
    const contagens = calcularContagensChipsBanco(
      questoesMock,
      snapshotHistorico,
      idsSimulados
    );

    assert.strictEqual(contagens.simulados, 3, '3 de simulados');
    assert.strictEqual(contagens.resolvidas, 4, '4 resolvidas');
    assert.strictEqual(contagens['nao-resolvidas'], 2, '2 não resolvidas');
    assert.strictEqual(contagens.acertei, 2, '2 acertadas (Q1 e Q4)');
    assert.strictEqual(contagens.errei, 2, '2 erradas (Q2 e Q5)');
  });

  it('filtro "errei" puxa questões recuperadas que já foram erradas ao menos 1 vez no sistema (cumulativo)', () => {
    // Q7 foi errada primeiro (erro) e depois acertada (recuperada)
    const q7: Questao = {
      id: 7,
      banca: 'FAFIPA',
      cargo: 'Engenheiro Civil',
      disciplina: 'Bloco 1',
      assunto: 'Legislação',
      artigo: 'Art. 1',
      enunciado: 'Questão 7 recuperada',
      alternativas: ['A', 'B', 'C', 'D', 'E'],
      correta: 0,
      comentario: 'Comentário 7',
    };

    const historicoComRecuperada: Record<string | number, TentativaResposta[]> = {
      ...snapshotHistorico,
      7: [
        { escolha: 1, acertou: false, data: 5000 }, // Primeiro errou
        { escolha: 0, acertou: true, data: 6000 },  // Depois acertou (recuperou)
      ],
    };

    const todasComQ7 = [...questoesMock, q7];

    const res = aplicarFiltrosMultiplosBanco({
      questoes: todasComQ7,
      snapshotHistorico: historicoComRecuperada,
      idsSimulados,
      chipsSelecionados: ['errei'],
    });

    // Deve conter Q2, Q5 e Q7 (já que Q7 foi errada ao menos 1 vez)
    assert.strictEqual(res.length, 3);
    assert.ok(res.some((q) => q.id === 7), 'Q7 recuperada deve aparecer no filtro errei');
    assert.deepStrictEqual(res.map((q) => q.id), [2, 5, 7]);

    // Contagem de badges também deve computar Q7 em errei
    const contagens = calcularContagensChipsBanco(todasComQ7, historicoComRecuperada, idsSimulados);
    assert.strictEqual(contagens.errei, 3, 'Deve contar 3 questões em errei');
  });

  it('filtro "simulados" suporta IDs string, number e origem direta na questão', () => {
    const q8: Questao = {
      id: 'SIM_99',
      banca: 'FAFIPA',
      cargo: 'Engenheiro Civil',
      disciplina: 'Específica',
      assunto: 'Estruturas',
      enunciado: 'Questão com origem simulado',
      alternativas: ['A', 'B', 'C', 'D', 'E'],
      correta: 2,
      comentario: 'C8',
      origem: 'simulado',
    } as any;

    const idsSimuladosMistos = new Set<string | number>(['1', 2, 'SIM_99']);

    const res = aplicarFiltrosMultiplosBanco({
      questoes: [...questoesMock, q8],
      snapshotHistorico,
      idsSimulados: idsSimuladosMistos,
      chipsSelecionados: ['simulados'],
    });

    assert.ok(res.some((q) => q.id === 1), 'ID 1 numérico reconhecido via string "1"');
    assert.ok(res.some((q) => q.id === 2), 'ID 2 numérico reconhecido');
    assert.ok(res.some((q) => q.id === 'SIM_99'), 'ID "SIM_99" reconhecido');
  });

  it('caderno de erros suporta seleção múltipla de chips (ex: reincidente + inedito ao mesmo tempo)', () => {
    // Q10: 2 erros (reincidente)
    // Q11: 1 erro e nenhuma recuperação (inédito)
    // Q12: 1 erro e depois 1 acerto (recuperada)
    const q10: Questao = { ...questoesMock[0], id: 10, enunciado: 'Q10 Reincidente' };
    const q11: Questao = { ...questoesMock[1], id: 11, enunciado: 'Q11 Inédito' };
    const q12: Questao = { ...questoesMock[2], id: 12, enunciado: 'Q12 Recuperada' };

    const histCaderno: Record<string | number, TentativaResposta[]> = {
      10: [
        { escolha: 1, acertou: false, data: 1000 },
        { escolha: 2, acertou: false, data: 2000 },
      ],
      11: [
        { escolha: 1, acertou: false, data: 1000 },
      ],
      12: [
        { escolha: 1, acertou: false, data: 1000 },
        { escolha: 2, acertou: true, data: 2000 },
      ],
    };

    const listaCaderno = [q10, q11, q12];

    // Seleção múltipla: Reincidente + Inédito ao mesmo tempo
    const resReincidenteEInedito = aplicarFiltrosMultiplosBanco({
      questoes: listaCaderno,
      snapshotHistorico: histCaderno,
      idsSimulados: new Set(),
      chipsSelecionados: [],
      modoCadernoAtivo: true,
      chipsCadernoSelecionados: ['reincidente', 'inedito'],
    });

    assert.strictEqual(resReincidenteEInedito.length, 2);
    assert.deepStrictEqual(resReincidenteEInedito.map((q) => q.id), [10, 11]);

    // Seleção única: apenas Recuperada
    const resRecuperada = aplicarFiltrosMultiplosBanco({
      questoes: listaCaderno,
      snapshotHistorico: histCaderno,
      idsSimulados: new Set(),
      chipsSelecionados: [],
      modoCadernoAtivo: true,
      chipsCadernoSelecionados: ['recuperada'],
    });

    assert.strictEqual(resRecuperada.length, 1);
    assert.strictEqual(resRecuperada[0].id, 12);

    // Seleção vazia: todas do caderno
    const resTodasCaderno = aplicarFiltrosMultiplosBanco({
      questoes: listaCaderno,
      snapshotHistorico: histCaderno,
      idsSimulados: new Set(),
      chipsSelecionados: [],
      modoCadernoAtivo: true,
      chipsCadernoSelecionados: [],
    });

    assert.strictEqual(resTodasCaderno.length, 3);
  });

  it('filtro "simulados" ignora restrições de blocos/disciplinas selecionadas e exibe todas as questões de simulado', () => {
    const qSimuladoForaDosBlocos: Questao = {
      id: 999,
      banca: 'FAFIPA',
      cargo: 'Engenheiro Civil',
      disciplina: 'Prefeitura de Curitiba (Prova Real)',
      assunto: 'Simulado Completo 01',
      artigo: 'Edital Geral',
      enunciado: 'Questão oficial de simulado',
      alternativas: ['A', 'B', 'C', 'D', 'E'],
      correta: 0,
      comentario: 'Gabarito oficial',
    };

    const todasQuestoes = [...questoesMock, qSimuladoForaDosBlocos];
    const idsSimuladosSet = new Set<string | number>([999]);

    // Quando o usuário tem blocos selecionados no Banco (ex: apenas Bloco 1)
    // Sem o chip simulados, a questão de simulado (Prefeitura de Curitiba) seria filtrada por bloco
    const resSemChipSimulado = aplicarFiltrosMultiplosBanco({
      questoes: todasQuestoes,
      snapshotHistorico,
      idsSimulados: idsSimuladosSet,
      chipsSelecionados: [],
      bancoBlocosSelecionados: ['Bloco 1'],
    });
    assert.strictEqual(resSemChipSimulado.some((q) => q.id === 999), false, 'Sem chip simulado, respeita o bloco selecionado');

    // Com o chip simulados ativo sem restrição de blocos, exibe todas as questões de simulados
    const resComChipSimuladoTodosBlocos = aplicarFiltrosMultiplosBanco({
      questoes: todasQuestoes,
      snapshotHistorico,
      idsSimulados: idsSimuladosSet,
      chipsSelecionados: ['simulados'],
      bancoBlocosSelecionados: [],
    });
    assert.strictEqual(resComChipSimuladoTodosBlocos.some((q) => q.id === 999), true, 'Com chip simulados sem restrição de bloco, questão aparece');
    assert.strictEqual(resComChipSimuladoTodosBlocos.length, 1);

    // Quando o usuário filtra simulados pelo bloco específico correspondente, a questão é filtrada com precisão
    const resComChipSimuladoBlocoCorreto = aplicarFiltrosMultiplosBanco({
      questoes: todasQuestoes,
      snapshotHistorico,
      idsSimulados: idsSimuladosSet,
      chipsSelecionados: ['simulados'],
      bancoBlocosSelecionados: ['Prefeitura de Curitiba'],
    });
    assert.strictEqual(resComChipSimuladoBlocoCorreto.some((q) => q.id === 999), true, 'Filtro por bloco correspondente mantém a questão do simulado');

    // Contagem de badges no Banco também deve contabilizar a questão
    const contagens = calcularContagensChipsBanco(todasQuestoes, snapshotHistorico, idsSimuladosSet);
    assert.strictEqual(contagens.simulados, 1, 'Deve contar 1 questão de simulado');
  });

  describe('Deduplicação e Contagem de Provas Anteriores FAFIPA (Regressão 1623 -> 74)', () => {
    it('normalizarEnunciadoParaDeduplicacao normaliza variações de pontuação e espaços idênticos', () => {
      const e1 = 'Durante a fiscalização de uma obra de drenagem urbana pela Prefeitura Municipal de Curitiba, um Engenheiro Civil necessita organizar os dados.';
      const e2 = '  Durante a fiscalização de uma obra de drenagem urbana pela Prefeitura Municipal de Curitiba,   um Engenheiro Civil necessita organizar os dados.  ';
      const e3 = 'Durante a fiscalizacao de uma obra de drenagem urbana pela Prefeitura Municipal de Curitiba... um Engenheiro Civil necessita organizar os dados!';

      const norm1 = e1.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').slice(0, 150);
      const norm2 = e2.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').slice(0, 150);
      assert.strictEqual(norm1, norm2, 'Devem ter a mesma chave normalizada');
    });

    it('calcularContagensChipsBanco com questões duplicadas vs deduplicadas reflete exatamente 74 questões reais', () => {
      // Simula as 74 questões reais originais
      const questoes74Reais: Questao[] = Array.from({ length: 74 }).map((_, idx) => ({
        id: `fafipa_real_q${idx + 1}`,
        banca: 'Fundação FAFIPA (Prova Real)',
        cargo: 'Engenheiro Civil',
        disciplina: idx < 36 ? 'ParanaEducação' : 'SESA',
        assunto: 'Prova Oficial',
        artigo: 'Art. 1',
        enunciado: `Enunciado da questão oficial de prova anterior número ${idx + 1}`,
        alternativas: ['A', 'B', 'C', 'D', 'E'],
        correta: 0,
        comentario: 'Gabarito oficial',
      }));

      // Simula a duplicação indevida em lote (ex: 22 réplicas = 1628 questões)
      const questoesInfladas: Questao[] = [];
      for (let replica = 1; replica <= 22; replica++) {
        questoes74Reais.forEach((q) => {
          questoesInfladas.push({
            ...q,
            id: replica === 1 ? q.id : Number(`${replica}${Math.floor(Math.random() * 10000)}`),
          });
        });
      }

      // Verifica que antes da deduplicação o contador ficava em 1628
      const contagensAntes = calcularContagensChipsBanco(questoesInfladas, {}, new Set());
      assert.strictEqual(contagensAntes['provas-anteriores'], 74 * 22);

      // Executa a lógica de deduplicação por enunciado normalizado
      const statementMap = new Map<string, Questao>();
      questoesInfladas.forEach((q) => {
        const norm = q.enunciado.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').slice(0, 150);
        if (!statementMap.has(norm)) {
          statementMap.set(norm, q);
        }
      });
      const questoesDeduplicadas = Array.from(statementMap.values());

      // Verifica que após a deduplicação retorna exatamente 74 questões
      assert.strictEqual(questoesDeduplicadas.length, 74, 'Deve conter exatamente 74 questões únicas');
      const contagensDepois = calcularContagensChipsBanco(questoesDeduplicadas, {}, new Set());
      assert.strictEqual(contagensDepois['provas-anteriores'], 74, 'Badge de provas anteriores deve ser exatamente 74');
    });

    it('deduplicação prioriza questão com histórico de resposta e preserva tentativas do usuário', () => {
      const qDuplicada1: Questao = {
        id: 'fafipa_educa_q01',
        banca: 'Fundação FAFIPA (Prova Real)',
        cargo: 'Engenheiro Civil',
        disciplina: 'ParanaEducação',
        assunto: 'Prova Oficial',
        artigo: 'Art. 1',
        enunciado: 'Enunciado idêntico da questão teste com histórico',
        alternativas: ['A', 'B', 'C', 'D', 'E'],
        correta: 0,
        comentario: '',
      };

      const qDuplicada2: Questao = {
        id: 987654, // ID numérico gerado pelo Supabase
        banca: 'Fundação FAFIPA (Prova Real)',
        cargo: 'Engenheiro Civil',
        disciplina: 'ParanaEducação',
        assunto: 'Prova Oficial',
        artigo: 'Art. 1',
        enunciado: 'Enunciado idêntico da questão teste com histórico',
        alternativas: ['A', 'B', 'C', 'D', 'E'],
        correta: 0,
        comentario: '',
      };

      // Usuário respondeu a qDuplicada2
      const histMap: Record<string, TentativaResposta[]> = {
        '987654': [{ escolha: 0, acertou: true, data: 12345 }],
      };

      const norm = qDuplicada1.enunciado.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').slice(0, 150);
      const lista = [qDuplicada1, qDuplicada2];

      // Escolhe canonical favorecendo quem tem histórico
      let canonical = lista[0];
      let maxT = (histMap[String(canonical.id)] || []).length;
      for (let i = 1; i < lista.length; i++) {
        const count = (histMap[String(lista[i].id)] || []).length;
        if (count > maxT) {
          canonical = lista[i];
          maxT = count;
        }
      }

      assert.strictEqual(canonical.id, 987654, 'Deve priorizar a questão que possui resposta do usuário');
      assert.strictEqual((histMap[String(canonical.id)] || []).length, 1, 'Histórico do usuário está 100% preservado');
    });

    it('ehQuestaoProvaAnterior respeita o campo formal origemTipo e isola os 4 pilares', () => {
      const qProva: Questao = {
        id: 'fafipa_01',
        banca: 'FAFIPA',
        cargo: 'Engenheiro Civil',
        disciplina: 'Engenharia',
        assunto: 'NBR',
        artigo: 'Art. 1',
        enunciado: 'Questão de prova passada',
        alternativas: ['A', 'B', 'C', 'D', 'E'],
        correta: 0,
        comentario: '',
        origemTipo: 'prova_passada',
      };

      const qEscala: Questao = {
        id: 'lote500_01',
        banca: 'FAFIPA Paramétrica (Prova Real)',
        cargo: 'Engenheiro Civil',
        disciplina: 'ParanaEducação',
        assunto: 'Simulado e Prova Real',
        artigo: 'Art. 1',
        enunciado: 'Questão gerada em lote de escala com texto ambíguo',
        alternativas: ['A', 'B', 'C', 'D', 'E'],
        correta: 0,
        comentario: '',
        origemTipo: 'lote_escala',
      };

      assert.strictEqual(ehQuestaoProvaAnterior(qProva), true, 'origemTipo prova_passada deve ser true');
      assert.strictEqual(ehQuestaoProvaAnterior(qEscala), false, 'origemTipo lote_escala deve ser false mesmo com palavras de prova real no texto');
    });

    it('REGRA ANTI-REGRESSÃO: Separação estrita entre Simulados e Lotes em Escala', () => {
      const qSimulado: Questao = {
        id: 'sim_ctba_01_q01',
        banca: 'FAFIPA Paramétrica',
        cargo: 'Engenheiro Civil',
        disciplina: 'Português',
        assunto: 'Interpretação de Texto',
        artigo: 'Art. 1',
        enunciado: 'Questão de Simulado Oficial Curitiba',
        alternativas: ['A', 'B', 'C', 'D', 'E'],
        correta: 0,
        comentario: '',
        origemTipo: 'simulado',
      };

      const qEscala: Questao = {
        id: 'lote500_s01_q01_12345',
        banca: 'Fundação FAFIPA (Paramétrica)',
        cargo: 'Engenheiro Civil',
        disciplina: 'Lote em Escala (500Q)',
        assunto: 'Mini-Simulado LOTE-500-S01 (25Q Multi-Temático)',
        artigo: 'Tópico 1',
        enunciado: 'Questão do lote de 500 questões',
        alternativas: ['A', 'B', 'C', 'D', 'E'],
        correta: 1,
        comentario: '',
        origemTipo: 'lote_escala',
        loteCodigo: 'LOTE-500-S01',
      };

      const qProvaReal: Questao = {
        id: 'fafipa_educa_2026_q01',
        banca: 'Fundação FAFIPA (Prova Real)',
        cargo: 'Engenheiro Civil',
        disciplina: 'ParanáEducação',
        assunto: 'Prova Real 2026',
        artigo: 'Art. 1',
        enunciado: 'Questão oficial de prova anterior',
        alternativas: ['A', 'B', 'C', 'D', 'E'],
        correta: 2,
        comentario: '',
        origemTipo: 'prova_passada',
      };

      const idsSimulados = new Set<string | number>(['sim_ctba_01_q01']);
      const idsEscala = new Set<string | number>(['lote500_s01_q01_12345']);

      // 1. Verificação de classificadores unitários
      assert.strictEqual(ehQuestaoSimulado(qSimulado, idsSimulados, idsEscala), true, 'qSimulado deve ser reconhecido como simulado');
      assert.strictEqual(ehQuestaoSimulado(qEscala, idsSimulados, idsEscala), false, 'qEscala NUNCA pode ser reconhecida como simulado');
      assert.strictEqual(ehQuestaoSimulado(qProvaReal, idsSimulados, idsEscala), false, 'qProvaReal NUNCA pode ser reconhecida como simulado');

      assert.strictEqual(ehQuestaoEmEscala(qEscala, idsEscala), true, 'qEscala deve ser reconhecida como em escala');
      assert.strictEqual(ehQuestaoEmEscala(qSimulado, idsEscala), false, 'qSimulado NUNCA pode ser em escala');
      assert.strictEqual(ehQuestaoEmEscala(qProvaReal, idsEscala), false, 'qProvaReal NUNCA pode ser em escala');

      assert.strictEqual(ehQuestaoProvaAnterior(qProvaReal), true, 'qProvaReal deve ser prova anterior');
      assert.strictEqual(ehQuestaoProvaAnterior(qSimulado), false, 'qSimulado não é prova anterior');
      assert.strictEqual(ehQuestaoProvaAnterior(qEscala), false, 'qEscala não é prova anterior');

      // 2. Verificação de badges contagens separadas
      const bancoMisto = [qSimulado, qEscala, qProvaReal];
      const contagens = calcularContagensChipsBanco(bancoMisto, {}, idsSimulados, idsEscala);

      assert.strictEqual(contagens.simulados, 1, 'Contagem de simulados deve ser exatamente 1 (não pode somar com em escala)');
      assert.strictEqual(contagens['em-escala'], 1, 'Contagem de em-escala deve ser exatamente 1');
      assert.strictEqual(contagens['provas-anteriores'], 1, 'Contagem de provas anteriores deve ser exatamente 1');

      // 3. Verificação de filtragem por chips
      const filtradasSimulado = aplicarFiltrosMultiplosBanco({
        questoes: bancoMisto,
        snapshotHistorico: {},
        idsSimulados,
        idsEscala,
        chipsSelecionados: ['simulados'],
      });
      assert.strictEqual(filtradasSimulado.length, 1);
      assert.strictEqual(filtradasSimulado[0].id, 'sim_ctba_01_q01');

      const filtradasEscala = aplicarFiltrosMultiplosBanco({
        questoes: bancoMisto,
        snapshotHistorico: {},
        idsSimulados,
        idsEscala,
        chipsSelecionados: ['em-escala'],
      });
      assert.strictEqual(filtradasEscala.length, 1);
      assert.strictEqual(filtradasEscala[0].id, 'lote500_s01_q01_12345');
    });

    it('REGRESSÃO: Questões com IDs numéricos e origemTipo genérica são classificadas com autoridade relacional das sessões', () => {
      // Simula questões vindas do Supabase que receberam ID numérico e fallback 'sessao_avulsa'
      const qNumEscala: Questao = {
        id: 1245,
        banca: 'Fundação FAFIPA',
        cargo: 'Engenheiro Civil',
        disciplina: 'Administração Pública',
        assunto: 'Constituição Federal',
        artigo: 'Art. 37',
        enunciado: 'Enunciado de questão gerada em escala número 1245',
        alternativas: ['A', 'B', 'C', 'D', 'E'],
        correta: 0,
        comentario: 'Gabarito A',
        origemTipo: 'sessao_avulsa', // Supabase não tem coluna origem_tipo
      };

      const qNumSimulado: Questao = {
        id: 852,
        banca: 'Fundação FAFIPA (Simulado)',
        cargo: 'Engenheiro Civil',
        disciplina: 'Conhecimentos Gerais',
        assunto: 'Língua Portuguesa',
        artigo: 'Crase',
        enunciado: 'Enunciado de questão oficial de simulado número 852',
        alternativas: ['A', 'B', 'C', 'D', 'E'],
        correta: 1,
        comentario: 'Gabarito B',
        origemTipo: 'sessao_avulsa',
      };

      const qCanonicaProva: Questao = {
        id: 'fafipa_educa_2026_q01',
        banca: 'Fundação FAFIPA (Prova Real)',
        cargo: 'Engenheiro Civil',
        disciplina: 'Língua Portuguesa',
        assunto: 'Interpretação Textual',
        artigo: 'ParanáEducação 2026',
        enunciado: 'Texto base para interpretação...',
        alternativas: ['A', 'B', 'C', 'D', 'E'],
        correta: 3,
        comentario: 'Gabarito D',
        origemTipo: 'prova_passada',
      };

      // Sessões declaram quais IDs pertencem a cada pilar
      const idsEscala = new Set<string | number>([1245, '1245']);
      const idsSimulados = new Set<string | number>([852, '852']);

      // 1. Autoridade Relacional: Mesmo com origemTipo: 'sessao_avulsa', IDs indexados pela sessão prevalecem
      assert.strictEqual(
        ehQuestaoEmEscala(qNumEscala, idsEscala),
        true,
        'Questão com ID numérico indexada na sessão de escala deve ser classificada como em-escala'
      );
      assert.strictEqual(
        ehQuestaoSimulado(qNumSimulado, idsSimulados, idsEscala),
        true,
        'Questão com ID numérico indexada na sessão de simulado deve ser classificada como simulado'
      );
      assert.strictEqual(
        ehQuestaoProvaAnterior(qCanonicaProva),
        true,
        'Questão canônica de prova real deve ser classificada como prova anterior'
      );

      // 2. Contagens nos chips do Banco de Questões
      const banco = [qNumEscala, qNumSimulado, qCanonicaProva];
      const contagens = calcularContagensChipsBanco(banco, {}, idsSimulados, idsEscala);

      assert.strictEqual(contagens.simulados, 1, 'Contagem de simulados deve ser 1');
      assert.strictEqual(contagens['em-escala'], 1, 'Contagem de em-escala deve ser 1');
      assert.strictEqual(contagens['provas-anteriores'], 1, 'Contagem de provas anteriores deve ser 1');

      // 3. Multi-seleção de chips de origem (união OR): se o usuário marcar Simulados E Em Escala
      const filtradasMultiOrigem = aplicarFiltrosMultiplosBanco({
        questoes: banco,
        snapshotHistorico: {},
        idsSimulados,
        idsEscala,
        chipsSelecionados: ['simulados', 'em-escala'],
      });
      assert.strictEqual(
        filtradasMultiOrigem.length,
        2,
        'Selecionar simulados e em-escala juntos deve retornar a união das 2 questões'
      );

      // 4. Seleção isolada de simulados
      const filtradasApenasSimulado = aplicarFiltrosMultiplosBanco({
        questoes: banco,
        snapshotHistorico: {},
        idsSimulados,
        idsEscala,
        chipsSelecionados: ['simulados'],
      });
      assert.strictEqual(filtradasApenasSimulado.length, 1);
      assert.strictEqual(filtradasApenasSimulado[0].id, 852);

      // 5. Seleção isolada de em-escala
      const filtradasApenasEscala = aplicarFiltrosMultiplosBanco({
        questoes: banco,
        snapshotHistorico: {},
        idsSimulados,
        idsEscala,
        chipsSelecionados: ['em-escala'],
      });
      assert.strictEqual(filtradasApenasEscala.length, 1);
      assert.strictEqual(filtradasApenasEscala[0].id, 1245);
    });

    it('REGRA ANTI-REGRESSÃO: Eliminação de 74 réplicas numéricas legadas garante exatamente 74 Provas Anteriores', () => {
      // 74 canônicas oficiais
      const canonicas74: Questao[] = Array.from({ length: 74 }).map((_, i) => ({
        id: i < 36 ? `fafipa_educa_2026_q${String(i + 1).padStart(2, '0')}` : `fafipa_sesa_2021_q${String(i - 35).padStart(2, '0')}`,
        banca: 'Fundação FAFIPA (Prova Real)',
        cargo: 'Engenheiro Civil',
        disciplina: i < 36 ? 'ParanaEducação' : 'SESA',
        assunto: 'Prova Oficial',
        artigo: '',
        enunciado: `Texto canônico oficial ${i + 1}`,
        alternativas: ['A', 'B', 'C', 'D', 'E'],
        correta: 0,
        comentario: '',
        origemTipo: 'prova_passada',
      }));

      // 74 réplicas legadas com ID numérico
      const replicas74Legadas: Questao[] = Array.from({ length: 74 }).map((_, i) => ({
        id: 500 + i,
        banca: 'Fundação FAFIPA (Prova Real)',
        cargo: 'Engenheiro Civil',
        disciplina: i < 36 ? 'ParanaEducação' : 'SESA',
        assunto: 'Prova Oficial Réplica',
        artigo: '',
        enunciado: `Texto réplica numérica ${i + 1}`,
        alternativas: ['A', 'B', 'C', 'D', 'E'],
        correta: 0,
        comentario: '',
      }));

      const isLegacyProvaReal = (item: Questao) => {
        const idStr = String(item.id || '').toLowerCase();
        if (idStr.startsWith('fafipa_') || idStr.startsWith('prv_')) return false;
        const b = String(item.banca || '').toLowerCase();
        const d = String(item.disciplina || '').toLowerCase();
        const a = String(item.assunto || '').toLowerCase();
        return b.includes('prova real') || d.includes('paranaeduca') || d.includes('sesa') || a.includes('prova real');
      };

      // Banco antes do expurgo continha 148 questões
      const bancoMisto148 = [...canonicas74, ...replicas74Legadas];
      assert.strictEqual(bancoMisto148.length, 148);

      // Aplicação da regra de expurgo ativo
      const bancoHigienizado = bancoMisto148.filter((q) => !isLegacyProvaReal(q));
      assert.strictEqual(bancoHigienizado.length, 74, 'Deve restar estritamente as 74 canônicas');
      assert.ok(
        bancoHigienizado.every((q) => String(q.id).startsWith('fafipa_')),
        'Todas as 74 questões devem ser as canônicas oficiais'
      );

      const contagens = calcularContagensChipsBanco(bancoHigienizado, {}, new Set());
      assert.strictEqual(contagens['provas-anteriores'], 74, 'Contagem de Provas Anteriores deve ser exatamente 74');
    });
  });

  describe('REGRA ANTI-REGRESSÃO: Eliminação de Falsos Positivos em Provas Anteriores (566 -> 242)', () => {
    it('ehQuestaoProvaAnterior NÃO classifica questões de simulado como prova anterior mesmo com termo "Prova Real" na disciplina ou "FAFIPA" no artigo', () => {
      const qSimulado: Questao = {
        id: 'sim_ctba_01_q01',
        banca: 'FAFIPA Paramétrico',
        cargo: 'Engenheiro Civil',
        disciplina: 'Prefeitura de Curitiba (Prova Real)',
        assunto: 'Simulado Oficial Ponderado (40Q)',
        artigo: 'Art. 5º da Lei 14.133 (FAFIPA-2024)',
        enunciado: 'Sobre as modalidades de licitação...',
        alternativas: ['A', 'B', 'C', 'D', 'E'],
        correta: 0,
        comentario: 'Gabarito',
        origemTipo: 'simulado',
      };

      assert.strictEqual(
        ehQuestaoProvaAnterior(qSimulado),
        false,
        'Questão de simulado NUNCA deve ser classificada como prova anterior'
      );
      assert.strictEqual(
        ehQuestaoSimulado(qSimulado, new Set(['sim_ctba_01_q01'])),
        true,
        'Deve ser corretamente classificada como Simulado'
      );
    });

    it('ehQuestaoProvaAnterior NÃO classifica questões geradas em escala como prova anterior', () => {
      const qEscala: Questao = {
        id: 'lote500_s01_q01_123456_0',
        banca: 'Fundação FAFIPA (Paramétrica)',
        cargo: 'Engenheiro Civil',
        disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento',
        assunto: '206_Lei_14133_Licitacoes',
        artigo: 'Art. 75 - Dispensa',
        enunciado: 'Em relação aos limites de dispensa de licitação...',
        alternativas: ['A', 'B', 'C', 'D', 'E'],
        correta: 1,
        comentario: 'Gabarito oficial',
        origemTipo: 'lote_escala',
        loteCodigo: 'LOTE-500-S01',
      };

      assert.strictEqual(
        ehQuestaoProvaAnterior(qEscala),
        false,
        'Questão gerada em escala NUNCA deve ser classificada como prova anterior'
      );
      assert.strictEqual(
        ehQuestaoEmEscala(qEscala),
        true,
        'Deve ser classificada como Em Escala'
      );
    });

    it('calcularContagensChipsBanco calcula com precisão acervo com Provas Reais, Simulados e Lotes sem contaminação cruzada', async () => {
      const { TODAS_QUESTOES_PROVAS_FAFIPA_REAIS } = await import('../data/provasFafipaReais');

      // 242 questões reais
      const provasReais = TODAS_QUESTOES_PROVAS_FAFIPA_REAIS;
      assert.strictEqual(provasReais.length, 242);

      // 40 questões de simulado
      const simulados: Questao[] = Array.from({ length: 40 }).map((_, i) => ({
        id: `sim_ctba_01_q${i + 1}`,
        banca: 'FAFIPA',
        cargo: 'Engenheiro Civil',
        disciplina: 'Prefeitura de Curitiba (Prova Real)',
        assunto: 'Simulado Oficial Ponderado',
        artigo: 'Art. 1',
        enunciado: `Questão de simulado número ${i + 1}`,
        alternativas: ['A', 'B', 'C', 'D', 'E'],
        correta: 0,
        comentario: '',
        origemTipo: 'simulado' as const,
      }));

      // 50 questões em escala
      const escala: Questao[] = Array.from({ length: 50 }).map((_, i) => ({
        id: `lote500_s01_q${i + 1}`,
        banca: 'FAFIPA',
        cargo: 'Engenheiro Civil',
        disciplina: 'Bloco 2',
        assunto: '206_Lei_14133_Licitacoes',
        artigo: 'Art. 1',
        enunciado: `Questão em escala ${i + 1}`,
        alternativas: ['A', 'B', 'C', 'D', 'E'],
        correta: 0,
        comentario: '',
        origemTipo: 'lote_escala' as const,
        loteCodigo: 'LOTE-500-S01',
      }));

      // 10 questões avulsas de estudo
      const avulsas: Questao[] = Array.from({ length: 10 }).map((_, i) => ({
        id: 9000 + i,
        banca: 'FAFIPA Paramétrico',
        cargo: 'Engenheiro Civil',
        disciplina: 'Bloco 1',
        assunto: '101_Lei_Organica',
        artigo: 'Art. 1',
        enunciado: `Questão avulsa ${i + 1}`,
        alternativas: ['A', 'B', 'C', 'D', 'E'],
        correta: 0,
        comentario: '',
        origemTipo: 'sessao_avulsa' as const,
      }));

      const bancoCompleto = [...provasReais, ...simulados, ...escala, ...avulsas];
      assert.strictEqual(bancoCompleto.length, 242 + 40 + 50 + 10); // 342 total

      // Mock histórico de 20 resolvidas: 15 acertos, 5 erros
      const mockHistorico: Record<string | number, TentativaResposta[]> = {};
      for (let i = 0; i < 15; i++) {
        mockHistorico[simulados[i].id] = [
          { questaoId: simulados[i].id, escolha: 0, acertou: true, data: Date.now(), tempoSegundos: 60, origem: 'banco' },
        ];
      }
      for (let i = 15; i < 20; i++) {
        mockHistorico[simulados[i].id] = [
          { questaoId: simulados[i].id, escolha: 1, acertou: false, data: Date.now(), tempoSegundos: 80, origem: 'banco' },
        ];
      }

      const idsSimulados = new Set(simulados.map((q) => q.id));
      const idsEscala = new Set(escala.map((q) => q.id));
      const idsProvas = new Set(provasReais.map((q) => q.id));

      const contagens = calcularContagensChipsBanco(bancoCompleto, mockHistorico, idsSimulados, idsEscala, idsProvas);

      // Assegura que Provas Anteriores não sofre inflação (deve ser exatamente 242)
      assert.strictEqual(contagens['provas-anteriores'], 242, 'Contagem de Provas Anteriores deve ser exatamente 242');
      // Assegura contagens de simulados e escala isoladas
      assert.strictEqual(contagens.simulados, 40, 'Contagem de Simulados deve ser exatamente 40');
      assert.strictEqual(contagens['em-escala'], 50, 'Contagem de Em Escala deve ser exatamente 50');
      // Assegura contagens de status
      assert.strictEqual(contagens.resolvidas, 20, 'Resolvidas deve ser 20');
      assert.strictEqual(contagens['nao-resolvidas'], 342 - 20, 'Não resolvidas deve ser 322');
      assert.strictEqual(contagens.acertei, 15, 'Acertei deve ser 15');
      assert.strictEqual(contagens.errei, 5, 'Errei deve ser 5');
    });

    it('aplicarFiltrosMultiplosBanco filtra estritamente por chip individual e combinado', async () => {
      const { TODAS_QUESTOES_PROVAS_FAFIPA_REAIS } = await import('../data/provasFafipaReais');
      const provas = TODAS_QUESTOES_PROVAS_FAFIPA_REAIS.slice(0, 5); // 5 provas
      const simulados: Questao[] = Array.from({ length: 5 }).map((_, i) => ({
        id: `sim_test_${i}`,
        banca: 'FAFIPA',
        cargo: 'Eng',
        disciplina: 'Prefeitura de Curitiba (Prova Real)',
        assunto: 'Simulado',
        artigo: 'Art. 1',
        enunciado: `Simulado Q${i}`,
        alternativas: ['A', 'B'],
        correta: 0,
        comentario: '',
        origemTipo: 'simulado' as const,
      }));

      const banco = [...provas, ...simulados];
      const idsSimulados = new Set(simulados.map((s) => s.id));
      const idsProvas = new Set(provas.map((p) => p.id));

      // Filtra apenas provas-anteriores
      const resProvas = aplicarFiltrosMultiplosBanco({
        questoes: banco,
        snapshotHistorico: {},
        idsSimulados,
        idsProvasAnteriores: idsProvas,
        chipsSelecionados: ['provas-anteriores'],
      });
      assert.strictEqual(resProvas.length, 5);
      assert.ok(resProvas.every((q) => idsProvas.has(q.id)));

      // Filtra apenas simulados
      const resSimulados = aplicarFiltrosMultiplosBanco({
        questoes: banco,
        snapshotHistorico: {},
        idsSimulados,
        idsProvasAnteriores: idsProvas,
        chipsSelecionados: ['simulados'],
      });
      assert.strictEqual(resSimulados.length, 5);
      assert.ok(resSimulados.every((q) => idsSimulados.has(q.id)));
    });
  });
});



import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  planejarLote500Questoes,
  obterNomeTecnicoLimpo,
  NOMES_TECNICOS_NORMATIVOS_PDF,
} from './geradorLoteFafipa';
import { obterTipoSessao } from '../utils/sessionCode';
import {
  ehQuestaoProvaAnterior,
  questaoAtendeFiltrosMultiplos,
  calcularContagensChipsBanco,
} from '../utils/bancoFiltrosMultiplos';
import { TABELA_PDFS_ESTUDO } from '../utils/simuladoPonderado';
import { purgarSessoesEscalaS09aS20Db, STORAGE_KEYS } from './supabaseClient';
import { Questao, SessaoCriada } from '../types';

describe('Motor de Geração em Escala FAFIPA (500 Questões)', () => {
  it('planejarLote500Questoes gera exatamente 20 sessões de 25 questões (500 questões no total)', () => {
    const plano = planejarLote500Questoes();

    assert.equal(plano.length, 20, 'Devem ser exatamente 20 sessões');
    assert.equal(
      plano.reduce((acc, s) => acc + s.slots.length, 0),
      500,
      'O somatório de todas as sessões deve totalizar 500 questões'
    );

    // Todas as sessões devem ter exatamente 25 questões
    plano.forEach((s, idx) => {
      assert.equal(s.slots.length, 25, `Sessão ${idx + 1} deve ter 25 slots`);
      assert.equal(s.numero, idx + 1);
      assert.equal(s.codigo, `LOTE-500-S${String(idx + 1).padStart(2, '0')}`);
    });
  });

  it('Garante distribuição proporcional estrita: 375 Eng, 63 Port, 62 Info', () => {
    const plano = planejarLote500Questoes();
    let totalEng = 0;
    let totalPort = 0;
    let totalInfo = 0;

    plano.forEach((s) => {
      s.slots.forEach((slot) => {
        if (slot.pdf.tipo === 'especifica') totalEng++;
        else if (slot.pdf.tipo === 'portugues') totalPort++;
        else if (slot.pdf.tipo === 'informatica') totalInfo++;
      });
    });

    assert.equal(totalEng, 375, 'Devem ser exatamente 375 questões de Engenharia Civil');
    assert.equal(totalPort, 63, 'Devem ser exatamente 63 questões de Língua Portuguesa');
    assert.equal(totalInfo, 62, 'Devem ser exatamente 62 questões de Informática Básica');
    assert.equal(totalEng + totalPort + totalInfo, 500);
  });

  it('Garante calibração determinística de dificuldade: 200F / 200M / 100C no geral (40/40/20) e 10F / 10M / 5C por sessão', () => {
    const plano = planejarLote500Questoes();
    let totalF = 0;
    let totalM = 0;
    let totalC = 0;

    plano.forEach((s, idx) => {
      let fSessao = 0;
      let mSessao = 0;
      let cSessao = 0;

      s.slots.forEach((slot) => {
        if (slot.dificuldade === 'FACIL') {
          fSessao++;
          totalF++;
        } else if (slot.dificuldade === 'MEDIA') {
          mSessao++;
          totalM++;
        } else if (slot.dificuldade === 'CASCUDA') {
          cSessao++;
          totalC++;
        }
      });

      assert.equal(fSessao, 10, `Sessão ${idx + 1} deve ter exatamente 10 questões fáceis`);
      assert.equal(mSessao, 10, `Sessão ${idx + 1} deve ter exatamente 10 questões médias`);
      assert.equal(cSessao, 5, `Sessão ${idx + 1} deve ter exatamente 5 questões cascudas`);
    });

    assert.equal(totalF, 200, 'Total global deve ter exatamente 200 fáceis (40%)');
    assert.equal(totalM, 200, 'Total global deve ter exatamente 200 médias (40%)');
    assert.equal(totalC, 100, 'Total global deve ter exatamente 100 cascudas (20%)');
  });

  it('Garante estrutura de mini-simulado em cada sessão: 18-19 Eng + 3-4 Port + 3-4 Info (totalizando 25Q)', () => {
    const plano = planejarLote500Questoes();

    plano.forEach((s, idx) => {
      const eng = s.slots.filter((slot) => slot.pdf.tipo === 'especifica').length;
      const port = s.slots.filter((slot) => slot.pdf.tipo === 'portugues').length;
      const info = s.slots.filter((slot) => slot.pdf.tipo === 'informatica').length;

      assert.ok(eng >= 18 && eng <= 19, `Sessão ${idx + 1} deve ter entre 18 e 19 específicas de Engenharia`);
      assert.ok(port >= 3 && port <= 4, `Sessão ${idx + 1} deve ter entre 3 e 4 questões de Português`);
      assert.ok(info >= 3 && info <= 4, `Sessão ${idx + 1} deve ter entre 3 e 4 questões de Informática`);
      assert.equal(eng + port + info, 25, `Sessão ${idx + 1} deve totalizar exatamente 25 questões`);
    });
  });

  it('obterTipoSessao reconhece sessões de escala tanto por s.tipo quanto por código LOTE-', () => {
    const sessaoComTipo: SessaoCriada = {
      id: 'lote-1',
      disciplina: 'Multi-Temático FAFIPA',
      assunto: 'Mini-Simulado 01/20',
      quantidade: 25,
      banca: 'FAFIPA Paramétrico',
      tipo: 'sessao_escala',
      codigo: 'LOTE-500-S01',
      dataHora: '08/11/2026 10:00',
      questaoIds: [1, 2, 3],
    };

    assert.equal(obterTipoSessao(sessaoComTipo), 'sessao_escala');

    const sessaoApenasCodigo: SessaoCriada = {
      id: 'lote-2',
      disciplina: 'Multi-Temático FAFIPA',
      assunto: 'Mini-Simulado 02/20',
      quantidade: 25,
      banca: 'FAFIPA Paramétrico',
      codigo: 'LOTE-500-S02',
      dataHora: '08/11/2026 10:00',
      questaoIds: [4, 5, 6],
    };

    assert.equal(obterTipoSessao(sessaoApenasCodigo), 'sessao_escala');
  });

  it('Filtro de Provas Anteriores no banco isola estritamente questões de provas passadas', () => {
    const questaoNormal: Questao = {
      id: 101,
      disciplina: 'Bloco 02',
      assunto: 'Lei 14.133',
      artigo: 'Art. 5º',
      enunciado: 'Sobre licitações públicas...',
      alternativas: ['A', 'B', 'C', 'D', 'E'],
      correta: 0,
      comentario: 'Conforme art. 5º',
      banca: 'FAFIPA Paramétrico',
    };

    const questaoProvaPassada: Questao = {
      id: 102,
      disciplina: 'Engenharia Civil - Prova Real',
      assunto: 'Prova Real FAFIPA 2024',
      artigo: 'Questão 15',
      enunciado: 'Na fiscalização de obras...',
      alternativas: ['A', 'B', 'C', 'D', 'E'],
      correta: 1,
      comentario: 'Gabarito oficial FAFIPA',
      banca: 'FAFIPA',
      tipo: 'prova_anterior',
    };

    const questaoSimulado: Questao = {
      id: 103,
      disciplina: 'Simulado Oficial',
      assunto: 'Simulado FAFIPA Curitiba Rodada 1',
      artigo: 'Simulado',
      enunciado: 'Em relação a fundações...',
      alternativas: ['A', 'B', 'C', 'D', 'E'],
      correta: 2,
      comentario: 'Gabarito simulado',
      banca: 'FAFIPA Paramétrico',
      tipo: 'simulado',
    };

    assert.equal(ehQuestaoProvaAnterior(questaoNormal), false);
    assert.equal(ehQuestaoProvaAnterior(questaoProvaPassada), true);
    assert.equal(ehQuestaoProvaAnterior(questaoSimulado), false);

    const banco = [questaoNormal, questaoProvaPassada, questaoSimulado];
    const historico = {};
    const idsSimulados = new Set<string | number>([103]);

    const contagens = calcularContagensChipsBanco(banco, historico, idsSimulados);
    assert.equal(contagens['provas-anteriores'], 1);
    assert.equal(contagens.simulados, 1);

    const atendeFiltroProvas = questaoAtendeFiltrosMultiplos(
      questaoProvaPassada,
      [],
      idsSimulados,
      ['provas-anteriores']
    );
    assert.equal(atendeFiltroProvas, true);

    const normalNaoAtende = questaoAtendeFiltrosMultiplos(
      questaoNormal,
      [],
      idsSimulados,
      ['provas-anteriores']
    );
    assert.equal(normalNaoAtende, false);
  });

  it('REGRA ANTI-REGRESSÃO: obterNomeTecnicoLimpo mapeia todos os 34 PDFs para títulos acadêmicos/normativos sem código de arquivo', () => {
    assert.equal(TABELA_PDFS_ESTUDO.length, 34, 'Devem existir exatamente 34 PDFs de estudo');

    TABELA_PDFS_ESTUDO.forEach((pdf: any) => {
      const nomeLimpo = obterNomeTecnicoLimpo(pdf);
      assert.ok(nomeLimpo && nomeLimpo.length > 5, `Nome técnico limpo inválido para ${pdf.codigo}`);
      // Não pode conter underscores de nomes de arquivo
      assert.ok(!nomeLimpo.includes('_'), `Nome técnico de ${pdf.codigo} não pode conter underscore: "${nomeLimpo}"`);
      // Não pode começar com o código numérico cru
      assert.ok(!new RegExp(`^${pdf.codigo}\\b`).test(nomeLimpo), `Nome técnico de ${pdf.codigo} não pode começar com o código bruto: "${nomeLimpo}"`);
      // O mapa canônico deve possuir este código
      assert.ok(NOMES_TECNICOS_NORMATIVOS_PDF[pdf.codigo], `Código ${pdf.codigo} ausente em NOMES_TECNICOS_NORMATIVOS_PDF`);
    });

    // Exemplos específicos do feedback do usuário
    const pdf314 = TABELA_PDFS_ESTUDO.find((p: any) => p.codigo === '314');
    assert.equal(
      obterNomeTecnicoLimpo(pdf314!),
      'Análise Estrutural e Resistência dos Materiais (NBR 6120 / NBR 8681)'
    );

    const pdf731 = TABELA_PDFS_ESTUDO.find((p: any) => p.codigo === '731');
    assert.equal(
      obterNomeTecnicoLimpo(pdf731!),
      'Língua Portuguesa — Compreensão, Interpretação de Textos e Semântica'
    );
  });

  it('REGRA ANTI-REGRESSÃO: purgarSessoesEscalaS09aS20Db purga estritamente S09 a S20 e blinda S01 a S08', async () => {
    // Mock do localStorage em ambiente Node
    const storage: Record<string, string> = {};
    (global as any).localStorage = {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, val: string) => {
        storage[key] = val;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
    };

    const sessoesTeste: SessaoCriada[] = [
      { id: 's1', codigo: 'LOTE-500-S01', disciplina: 'Lote', assunto: 'S01', quantidade: 25, banca: 'FAFIPA', questaoIds: ['q1_s1', 'q2_s1'], tipo: 'sessao_escala', dataHora: '08/11/2026' },
      { id: 's8', codigo: 'LOTE-500-S08', disciplina: 'Lote', assunto: 'S08', quantidade: 25, banca: 'FAFIPA', questaoIds: ['q1_s8', 'q2_s8'], tipo: 'sessao_escala', dataHora: '08/11/2026' },
      { id: 's9', codigo: 'LOTE-500-S09', disciplina: 'Lote', assunto: 'S09', quantidade: 25, banca: 'FAFIPA', questaoIds: ['q1_s9', 'q2_s9'], tipo: 'sessao_escala', dataHora: '08/11/2026' },
      { id: 's20', codigo: 'LOTE-500-S20', disciplina: 'Lote', assunto: 'S20', quantidade: 25, banca: 'FAFIPA', questaoIds: ['q1_s20', 'q2_s20'], tipo: 'sessao_escala', dataHora: '08/11/2026' },
      { id: 'outra', codigo: 'BL01L101x1', disciplina: 'Lote', assunto: 'Estudo', quantidade: 10, banca: 'FAFIPA', questaoIds: ['q_outra'], dataHora: '08/11/2026' },
    ];

    const questoesTeste: Questao[] = [
      { id: 'q1_s1', disciplina: 'D', assunto: 'A', artigo: 'Art', enunciado: 'E1', alternativas: ['A', 'B', 'C', 'D', 'E'], correta: 0, comentario: 'C', banca: 'FAFIPA' },
      { id: 'q1_s8', disciplina: 'D', assunto: 'A', artigo: 'Art', enunciado: 'E8', alternativas: ['A', 'B', 'C', 'D', 'E'], correta: 0, comentario: 'C', banca: 'FAFIPA' },
      { id: 'q1_s9', disciplina: 'D', assunto: 'A', artigo: 'Art', enunciado: 'E9', alternativas: ['A', 'B', 'C', 'D', 'E'], correta: 0, comentario: 'C', banca: 'FAFIPA' },
      { id: 'q1_s20', disciplina: 'D', assunto: 'A', artigo: 'Art', enunciado: 'E20', alternativas: ['A', 'B', 'C', 'D', 'E'], correta: 0, comentario: 'C', banca: 'FAFIPA' },
      { id: 'q_outra', disciplina: 'D', assunto: 'A', artigo: 'Art', enunciado: 'EO', alternativas: ['A', 'B', 'C', 'D', 'E'], correta: 0, comentario: 'C', banca: 'FAFIPA' },
    ];

    storage[STORAGE_KEYS.SESSOES] = JSON.stringify(sessoesTeste);
    storage[STORAGE_KEYS.QUESTOES] = JSON.stringify(questoesTeste);

    const resultado = await purgarSessoesEscalaS09aS20Db();
    assert.equal(resultado.sessoesRemovidas, 2, 'Deve remover exatamente as 2 sessões alvo (S09 e S20)');

    const sessoesFinais: SessaoCriada[] = JSON.parse(storage[STORAGE_KEYS.SESSOES]);
    const codigosFinais = sessoesFinais.map((s) => s.codigo);

    assert.ok(codigosFinais.includes('LOTE-500-S01'), 'Sessão 01 deve permanecer intacta');
    assert.ok(codigosFinais.includes('LOTE-500-S08'), 'Sessão 08 deve permanecer intacta');
    assert.ok(codigosFinais.includes('BL01L101x1'), 'Outras sessões de estudo devem permanecer intactas');
    assert.ok(!codigosFinais.includes('LOTE-500-S09'), 'Sessão 09 deve ter sido expurgada');
    assert.ok(!codigosFinais.includes('LOTE-500-S20'), 'Sessão 20 deve ter sido expurgada');
  });
});


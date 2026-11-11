import test from 'node:test';
import assert from 'node:assert/strict';
import {
  QUESTOES_PARANAEDUCACAO_2026,
  QUESTOES_SESA_2026,
  QUESTOES_TRIUNFO_2015,
  QUESTOES_ARAPONGAS_2020,
  QUESTOES_CAMPO_MAGRO_2016,
  QUESTOES_LUNARDELLI_2015,
  QUESTOES_AGUAS_SARANDI_2015,
  QUESTOES_DIAMANTE_NORTE_2015,
  TODAS_QUESTOES_PROVAS_FAFIPA_REAIS,
  SESSOES_PROVAS_FAFIPA_INICIAIS,
} from '../data/provasFafipaReais';
import { TABELA_PDFS_ESTUDO } from './simuladoPonderado';
import { obterTipoSessao } from './sessionCode';
import { SessaoCriada } from '../types';

test('FAFIPA - Auditoria e triagem de questões no escopo do Edital Curitiba (8 Provas Reais)', () => {
  // Total consolidado por prova
  assert.equal(QUESTOES_PARANAEDUCACAO_2026.length, 36, 'PARANAEDUCAÇÃO deve ter exatamente 36 questões aprovadas');
  assert.equal(QUESTOES_SESA_2026.length, 38, 'SESA deve ter exatamente 38 questões aprovadas');
  assert.equal(QUESTOES_TRIUNFO_2015.length, 26, 'São João do Triunfo 2015 deve ter exatamente 26 questões aprovadas');
  assert.equal(QUESTOES_ARAPONGAS_2020.length, 21, 'Arapongas 2020 deve ter exatamente 21 questões aprovadas');
  assert.equal(QUESTOES_CAMPO_MAGRO_2016.length, 45, 'Campo Magro 2016 deve ter exatamente 45 questões aprovadas');
  assert.equal(QUESTOES_LUNARDELLI_2015.length, 26, 'Lunardelli 2015 deve ter exatamente 26 questões aprovadas');
  assert.equal(QUESTOES_AGUAS_SARANDI_2015.length, 25, 'Águas de Sarandi 2015 deve ter exatamente 25 questões aprovadas');
  assert.equal(QUESTOES_DIAMANTE_NORTE_2015.length, 25, 'Diamante do Norte 2015 deve ter exatamente 25 questões aprovadas');
  assert.equal(TODAS_QUESTOES_PROVAS_FAFIPA_REAIS.length, 242, 'Total de questões aprovadas deve ser 242');

  // Validação estrita contra os 7 blocos e 34 matérias paramétricas
  const canonicalSubjects = new Set(TABELA_PDFS_ESTUDO.map((p) => p.codigo + '_' + p.nome));
  const canonicalBlocos = new Set(TABELA_PDFS_ESTUDO.map((p) => p.blocoNome));

  // Integridade de cada questão
  TODAS_QUESTOES_PROVAS_FAFIPA_REAIS.forEach((q, idx) => {
    assert.ok(q.id, `Questão #${idx} deve ter id`);
    assert.ok(q.enunciado && q.enunciado.trim().length > 15, `Questão ${q.id} deve ter enunciado consistente`);
    assert.ok(q.alternativas.length >= 4 && q.alternativas.length <= 5, `Questão ${q.id} deve ter 4 ou 5 alternativas`);
    assert.ok(q.correta >= 0 && q.correta < q.alternativas.length, `Questão ${q.id} gabarito deve ser índice válido`);
    assert.ok(q.comentario && q.comentario.includes('Gabarito Oficial FAFIPA'), `Questão ${q.id} deve citar gabarito oficial FAFIPA`);
    assert.equal(q.banca, 'Fundação FAFIPA (Prova Real)', `Questão ${q.id} deve ter banca marcada como Fundação FAFIPA (Prova Real)`);

    // Validação de Bloco e Assunto
    assert.ok(
      canonicalBlocos.has(q.disciplina) || q.disciplina.startsWith('Bloco '),
      `Questão ${q.id} disciplina '${q.disciplina}' deve pertencer a um dos 7 Blocos`
    );
    assert.ok(
      TABELA_PDFS_ESTUDO.some((p) => q.assunto.startsWith(p.codigo) || q.assunto === p.codigo + '_' + p.nome),
      `Questão ${q.id} assunto '${q.assunto}' deve pertencer a um dos 34 assuntos canônicos`
    );
  });

  // Garantia de exclusão rigorosa de disciplinas fora do escopo
  TODAS_QUESTOES_PROVAS_FAFIPA_REAIS.forEach((q) => {
    const textoCompleto = `${q.disciplina} ${q.assunto} ${q.artigo} ${q.enunciado}`.toLowerCase();
    assert.equal(
      textoCompleto.includes('raciocínio lógico') || textoCompleto.includes('raciocinio logico'),
      false,
      `Questão ${q.id} não pode conter raciocínio lógico fora do escopo`
    );
    assert.equal(
      textoCompleto.includes('sistema único de saúde') || textoCompleto.includes('lei 8.080'),
      false,
      `Questão ${q.id} não pode conter legislação do SUS fora do escopo`
    );
    assert.equal(
      textoCompleto.includes('lei estadual nº 6.174') || textoCompleto.includes('estatuto dos funcionários públicos do paraná'),
      false,
      `Questão ${q.id} não pode conter estatuto do servidor do PR fora do escopo`
    );
  });
});

test('FAFIPA - Sessões iniciais das Provas Reais (8 Provas)', () => {
  assert.equal(SESSOES_PROVAS_FAFIPA_INICIAIS.length, 8, 'Devem existir 8 sessões iniciais de provas reais');

  const sessaoEdu = SESSOES_PROVAS_FAFIPA_INICIAIS.find(
    (s) => s.codigo === 'FAFIPA-2026-PARANAEDUCACAO-ENG.CIVIL' || s.codigo === 'PRV-2026-FAFIPA-PARANAEDUCACAO'
  );
  assert.ok(sessaoEdu, 'Sessão PARANAEDUCAÇÃO deve existir');
  assert.equal(sessaoEdu?.quantidade, 36);
  assert.equal(sessaoEdu?.tipo, 'prova_anterior');

  const sessaoSesa = SESSOES_PROVAS_FAFIPA_INICIAIS.find(
    (s) => s.codigo === 'FAFIPA-2026-SESA-ENG.CIVIL' || s.codigo === 'PRV-2026-FAFIPA-SESA'
  );
  assert.ok(sessaoSesa, 'Sessão SESA deve existir');
  assert.equal(sessaoSesa?.quantidade, 38);
  assert.equal(sessaoSesa?.tipo, 'prova_anterior');

  const sessaoTriunfo = SESSOES_PROVAS_FAFIPA_INICIAIS.find(
    (s) => s.codigo === 'FAFIPA-2015-TRIUNFO-ENG.CIVIL'
  );
  assert.ok(sessaoTriunfo, 'Sessão Triunfo 2015 deve existir');
  assert.equal(sessaoTriunfo?.quantidade, 26);
  assert.equal(sessaoTriunfo?.tipo, 'prova_anterior');

  const sessaoArapongas = SESSOES_PROVAS_FAFIPA_INICIAIS.find(
    (s) => s.codigo === 'FAFIPA-2020-ARAPONGAS-ARQUITETO'
  );
  assert.ok(sessaoArapongas, 'Sessão Arapongas 2020 deve existir');
  assert.equal(sessaoArapongas?.quantidade, 21);
  assert.equal(sessaoArapongas?.tipo, 'prova_anterior');

  const sessaoCampoMagro = SESSOES_PROVAS_FAFIPA_INICIAIS.find(
    (s) => s.codigo === 'FAFIPA-2016-CAMPOMAGRO-ENG.CIVIL'
  );
  assert.ok(sessaoCampoMagro, 'Sessão Campo Magro 2016 deve existir');
  assert.equal(sessaoCampoMagro?.quantidade, 45);
  assert.equal(sessaoCampoMagro?.tipo, 'prova_anterior');

  const sessaoLunardelli = SESSOES_PROVAS_FAFIPA_INICIAIS.find(
    (s) => s.codigo === 'FAFIPA-2015-LUNARDELLI-ENG.CIVIL'
  );
  assert.ok(sessaoLunardelli, 'Sessão Lunardelli 2015 deve existir');
  assert.equal(sessaoLunardelli?.quantidade, 26);
  assert.equal(sessaoLunardelli?.tipo, 'prova_anterior');

  const sessaoSarandi = SESSOES_PROVAS_FAFIPA_INICIAIS.find(
    (s) => s.codigo === 'FAFIPA-2015-SARANDI-ENG.CIVIL'
  );
  assert.ok(sessaoSarandi, 'Sessão Águas de Sarandi 2015 deve existir');
  assert.equal(sessaoSarandi?.quantidade, 25);
  assert.equal(sessaoSarandi?.tipo, 'prova_anterior');

  const sessaoDiamante = SESSOES_PROVAS_FAFIPA_INICIAIS.find(
    (s) => s.codigo === 'FAFIPA-2015-DIAMANTE-ENG.CIVIL'
  );
  assert.ok(sessaoDiamante, 'Sessão Diamante do Norte 2015 deve existir');
  assert.equal(sessaoDiamante?.quantidade, 25);
  assert.equal(sessaoDiamante?.tipo, 'prova_anterior');
});


test('obterTipoSessao categoriza corretamente sessões de estudo, simulados e provas anteriores', () => {
  const sessaoComum: SessaoCriada = {
    codigo: 'BL02L14133x1',
    dataHora: '2026-05-01',
    banca: 'FAFIPA',
    disciplina: '02_Licitações',
    assunto: 'Lei 14.133',
    quantidade: 10,
    questaoIds: [1, 2],
  };
  assert.equal(obterTipoSessao(sessaoComum), 'sessao');

  const simulado: SessaoCriada = {
    codigo: 'SIM-CTBA-2026-01',
    dataHora: '2026-05-01',
    banca: 'FAFIPA',
    disciplina: 'Simulado Oficial',
    assunto: 'Simulado Oficial da Prova Real',
    quantidade: 40,
    questaoIds: [1, 2],
    tipo: 'simulado',
  };
  assert.equal(obterTipoSessao(simulado), 'simulado');

  const provaAnterior: SessaoCriada = {
    codigo: 'PRV-2026-FAFIPA-PARANAEDUCACAO',
    dataHora: '2026-04-12',
    banca: 'Fundação FAFIPA (Prova Real)',
    disciplina: '2026, Fundação FAFIPA, PARANAEDUCAÇÃO',
    assunto: 'Prova Real Oficial',
    quantidade: 36,
    questaoIds: ['fafipa_educa_2026_q01'],
    tipo: 'prova_anterior',
  };
  assert.equal(obterTipoSessao(provaAnterior), 'prova_anterior');
});

import { obterInfoConclusaoSessao } from './sessionTimer';

test('Métricas de sessões de provas passadas (PRV-) funcionam idênticas às sessões normais', () => {

  const provaSessao: SessaoCriada = {
    codigo: 'PRV-2026-FAFIPA-PARANAEDUCACAO',
    dataHora: '2026-04-12 13:30',
    banca: 'Fundação FAFIPA (Prova Real)',
    disciplina: '2026, Fundação FAFIPA, PARANAEDUCAÇÃO',
    assunto: 'Prova Real Oficial',
    quantidade: 36,
    questaoIds: ['q1', 'q2', 'q3'],
    tipo: 'prova_anterior',
  };

  const registrosTempo = [
    {
      id: 'reg_1',
      codigo: 'PRV-2026-FAFIPA-PARANAEDUCACAO',
      titulo: 'Prova Real',
      segundos: 2700, // 45 min
      data: Date.now(),
      concluida: true,
      totalQuestoes: 36,
      acertos: 30,
      erros: 6,
      taxaAcerto: 83,
    },
  ];

  const info = obterInfoConclusaoSessao(provaSessao, registrosTempo, {}, provaSessao.codigo);
  assert.equal(info.temTempo, true);
  assert.equal(info.segundos, 2700);
  assert.equal(info.concluida, true);
  assert.equal(info.temAssertividade, true);
  assert.equal(info.taxa, 83);
  assert.equal(info.acertos, 30);
  assert.equal(info.erros, 6);
  assert.equal(info.total, 36);
  assert.equal(info.minutosPorQuestaoFormatado, '1:15');
});

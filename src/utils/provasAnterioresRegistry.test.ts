import test from 'node:test';
import assert from 'node:assert/strict';
import {
  obterQuestoesProvasAnterioresOficiais,
  obterSessoesProvasAnterioresOficiais,
  ehIdDeProvaAnterior,
  encontrarQuestaoCanonicaProvaAnterior,
  sanitizarAcervoQuestoes,
  registrarNovasProvasAnteriores,
} from './provasAnterioresRegistry';
import { Questao } from '../types';

test('Registro Canônico de Provas Anteriores - Carga Oficial', () => {
  const provas = obterQuestoesProvasAnterioresOficiais();
  assert.equal(provas.length, 242, 'Deve conter exatamente as 242 questões oficiais (8 Provas Reais FAFIPA)');

  const sessoes = obterSessoesProvasAnterioresOficiais();
  assert.equal(sessoes.length, 8, 'Deve conter as 8 sessões oficiais de prova real');

  // Verifica se todas têm IDs válidos
  provas.forEach((p) => {
    assert.ok(ehIdDeProvaAnterior(p.id), `ID ${p.id} deve ser reconhecido como prova anterior`);
    assert.equal(p.origemTipo, 'prova_passada');
  });
});

test('Prevenção de Duplicação em Reload: 1210 cópias clonadas são reduzidas a exatamente 242', () => {
  const canonicas = obterQuestoesProvasAnterioresOficiais();

  // Simula o bug reportado pelo usuário: 5 reloads gerando 5 cópias de cada uma das 242 questões (1210 cópias)
  const acervoCorrompidoCom1210: Questao[] = [];
  for (let reload = 1; reload <= 5; reload++) {
    canonicas.forEach((cq, index) => {
      // Clones numéricos como ocorriam ao sincronizar com Supabase ou acumular no localStorage
      acervoCorrompidoCom1210.push({
        ...cq,
        id: reload === 1 ? cq.id : 900000 + reload * 1000 + index,
        banca: 'Fundação FAFIPA (Prova Real)',
      });
    });
  }

  assert.equal(acervoCorrompidoCom1210.length, 1210, 'Simulação de acervo inflado com 1210 questões');

  const resultado = sanitizarAcervoQuestoes(acervoCorrompidoCom1210);
  assert.equal(resultado.totalProvasAnteriores, 242, 'Deve reduzir estritamente para 242 questões canônicas');
  assert.equal(resultado.questoesLimpass.length, 242, 'Acervo final deve conter exatamente 242 questões');
  assert.equal(resultado.idsRemovidos.length, 968, 'Deve ter removido as 968 duplicatas excedentes');

  // Verifica que os IDs restantes são 100% os IDs canônicos originais
  resultado.questoesLimpass.forEach((q) => {
    assert.ok(ehIdDeProvaAnterior(q.id), `ID resultante ${q.id} deve ser um ID canônico`);
  });
});

test('Idempotência Estrita: múltiplos reloads consecutivos mantêm contagem estável de 242', () => {
  const canonicas = obterQuestoesProvasAnterioresOficiais();

  let acervo = [...canonicas];

  // Simula 10 chamadas sucessivas de carregarQuestoes() e sanitização
  for (let round = 1; round <= 10; round++) {
    const res = sanitizarAcervoQuestoes(acervo);
    assert.equal(res.totalProvasAnteriores, 242, `Rodada ${round} deve manter exatamente 242 questões`);
    assert.equal(res.questoesLimpass.length, 242, `Tamanho do acervo na rodada ${round} deve ser 242`);
    acervo = res.questoesLimpass;
  }
});

test('Preservação de Histórico de Respostas durante a deduplicação', () => {
  const canonicas = obterQuestoesProvasAnterioresOficiais();
  const primeira = canonicas[0];

  // Histórico associado tanto ao ID canônico quanto a um clone numérico
  const historicoSimulado: Record<string, any[]> = {
    [String(primeira.id)]: [{ alternativa: 1, acertou: true }],
    '99999': [{ alternativa: 2, acertou: false }], // Resolução realizada em cópia numérica
  };

  const acervo = [
    primeira,
    {
      ...primeira,
      id: 99999, // clone numérico da primeira questão
    },
  ];

  sanitizarAcervoQuestoes(acervo, { historicoParaRemapear: historicoSimulado });

  assert.equal(historicoSimulado['99999'], undefined, 'Chave duplicada deve ser removida');
  assert.equal(
    historicoSimulado[String(primeira.id)].length,
    2,
    'Histórico da cópia deve ter sido migrado para a chave canônica'
  );
});

test('Extensibilidade: Adicionar nova prova anterior oficial no futuro', () => {
  // Simula o usuário adicionando uma prova oficial adicional (ex: 40 novas questões)
  const novasQuestoes: Questao[] = Array.from({ length: 40 }, (_, i) => ({
    id: `fafipa_concurso_2027_q${i + 1}`,
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 01 — Legislação',
    assunto: 'Nova Prova 2027',
    artigo: `Art. ${i + 1}`,
    enunciado: `Enunciado exclusivo da prova 2027 questão ${i + 1}`,
    alternativas: ['A', 'B', 'C', 'D', 'E'],
    correta: 0,
    comentario: 'Gabarito oficial',
    origemTipo: 'prova_passada',
  }));

  registrarNovasProvasAnteriores(novasQuestoes);

  const provasAtualizadas = obterQuestoesProvasAnterioresOficiais();
  assert.equal(
    provasAtualizadas.length,
    282,
    'Deve totalizar 242 + 40 = 282 questões de provas anteriores'
  );

  // Testa idempotência com 282 questões
  const res = sanitizarAcervoQuestoes(provasAtualizadas);
  assert.equal(res.totalProvasAnteriores, 282);
});

import { normalizarEnunciadoParaDeduplicacao } from './normalizarTexto';
import { migrarESanitizarProvasPassadas } from './uploadProvaUtils';

test('Normalização de enunciados remove prefixos de numeração', () => {
  const e1 = 'Questão 01 - Segundo a NBR 6118, sobre o cálculo de concreto armado...';
  const e2 = '1. Segundo a NBR 6118, sobre o cálculo de concreto armado...';
  const e3 = 'Segundo a NBR 6118, sobre o cálculo de concreto armado...';

  const k1 = normalizarEnunciadoParaDeduplicacao(e1);
  const k2 = normalizarEnunciadoParaDeduplicacao(e2);
  const k3 = normalizarEnunciadoParaDeduplicacao(e3);

  assert.equal(k1, k3, 'Questão 01 - deve gerar mesmo hash que sem prefixo');
  assert.equal(k2, k3, '1. deve gerar mesmo hash que sem prefixo');
});

test('Fusão de sessões legadas com o mesmo concurso', () => {
  const sessoesLegadas: any[] = [
    {
      id: 'sess_1',
      codigo: 'PRV-2026-FAFIPA-PARANAEDUCACAO',
      disciplina: '2026, Fundação FAFIPA, PARANAEDUCAÇÃO',
      quantidade: 36,
      tipo: 'prova_anterior',
      questaoIds: ['q1', 'q2'],
    },
    {
      id: 'sess_2',
      codigo: 'FAFIPA-2026-PARANAEDUCACAO-ENG.CIVIL',
      disciplina: '2026, Fundação FAFIPA, PARANAEDUCAÇÃO',
      quantidade: 36,
      tipo: 'prova_anterior',
      questaoIds: ['q1', 'q2', 'q3'],
    },
  ];

  const res = migrarESanitizarProvasPassadas(sessoesLegadas, []);
  assert.equal(res.sessoesAtualizadas.length, 1, 'Deve consolidar em 1 única sessão');
  assert.equal(res.sessoesAtualizadas[0].codigo, 'FAFIPA-2026-PARANAEDUCACAO-ENG.CIVIL');
});


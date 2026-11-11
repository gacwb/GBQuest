import test from 'node:test';
import assert from 'node:assert/strict';
import {
  construirMapaTempoTentativas,
  calcularTempoTotalTodasQuestoes,
  calcularTempoRevisandoErrosCaderno,
} from './tempoQuestoes';
import { HistoricoRespostasMap, Questao, TentativaResposta } from '../types';

test('REGRA ANTI-REGRESSÃO: construirMapaTempoTentativas calcula deltas reais entre resoluções', () => {
  const t0 = 1792333000000;
  const historico: HistoricoRespostasMap = {
    '101': [
      { id: 1, escolha: 0, acertou: true, data: t0 },
      { id: 2, escolha: 2, acertou: false, data: t0 + 65000 }, // +65s
    ],
    '102': [
      { id: 3, escolha: 1, acertou: true, data: t0 + 150000 }, // +85s
    ],
  };

  const mapa = construirMapaTempoTentativas(historico);

  // A primeira tentativa do histórico recebe o padrão de 60s
  assert.equal(mapa.get('1'), 60);
  // A segunda ocorreu 65s após a primeira -> 65s
  assert.equal(mapa.get('2'), 65);
  // A terceira ocorreu 85s após a segunda -> 85s
  assert.equal(mapa.get('3'), 85);
});

test('REGRA ANTI-REGRESSÃO: calcularTempoTotalTodasQuestoes soma tempo real de todas as questões respondidas', () => {
  const t0 = 1792333000000;
  const historico: HistoricoRespostasMap = {
    '101': [
      { id: 1, escolha: 0, acertou: true, data: t0 }, // 60s
      { id: 2, escolha: 2, acertou: false, data: t0 + 70000 }, // 70s
    ],
    '102': [
      { id: 3, escolha: 1, acertou: true, data: t0 + 160000 }, // 90s
    ],
  };

  const total = calcularTempoTotalTodasQuestoes(historico);
  assert.equal(total, 60 + 70 + 90); // 220s
});

test('REGRA ANTI-REGRESSÃO: calcularTempoRevisandoErrosCaderno não fica zerado para questões com histórico', () => {
  const t0 = 1792333000000;
  const questaoMock: Questao = {
    id: 101,
    disciplina: 'Engenharia Civil',
    assunto: 'Geotecnia',
    banca: 'FAFIPA',
    enunciado: 'Enunciado teste',
    alternativas: ['A', 'B', 'C', 'D', 'E'],
    correta: 0,
    cargo: 'Engenheiro Civil',
    artigo: '',
    comentario: '',
  };

  const historico: HistoricoRespostasMap = {
    '101': [
      { id: 1, escolha: 1, acertou: false, data: t0 }, // primeiro erro (não é recuperação)
      { id: 2, escolha: 0, acertou: true, data: t0 + 90000 }, // recuperação! (+90s)
    ],
  };

  const tempoRecup = calcularTempoRevisandoErrosCaderno(
    [questaoMock],
    historico,
    0,
    t0 + 500000,
    () => true
  );

  assert.equal(tempoRecup, 90);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { garantirMapeamentoHistoricoCompleto } from './historicoRecovery';
import { Questao, HistoricoRespostasMap } from '../types';

test('garantirMapeamentoHistoricoCompleto preserva e mapeia tentativas para IDs canônicos e numéricos', () => {
  const qCanonica: Questao = {
    id: 'fafipa_2016_cm_1',
    banca: 'FAFIPA',
    disciplina: 'Engenharia Civil',
    assunto: 'Licitações',
    artigo: 'Lei 14133',
    enunciado: 'Analise as assertivas a seguir referentes ao edital de obras publicas:',
    alternativas: ['Alt A', 'Alt B', 'Alt C', 'Alt D'],
    correta: 0,
    comentario: 'Comentario explicativo',
  };

  const historicoDesconectado: HistoricoRespostasMap = {
    '20161': [
      {
        questaoId: '20161',
        escolha: 0,
        acertou: true,
        data: 1700000000000,
        tempoSegundos: 45,
      },
    ],
  };

  const resultado = garantirMapeamentoHistoricoCompleto([qCanonica], historicoDesconectado);

  // Verifica se o histórico foi recuperado para o ID de string canônico 'fafipa_2016_cm_1'
  assert.ok(resultado['fafipa_2016_cm_1']);
  assert.equal(resultado['fafipa_2016_cm_1'].length, 1);
  assert.equal(resultado['fafipa_2016_cm_1'][0].acertou, true);

  // Verifica se a chave numérica original '20161' também foi preservada
  assert.ok(resultado['20161']);
  assert.equal(resultado['20161'].length, 1);
});

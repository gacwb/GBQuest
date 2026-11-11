import { test } from 'node:test';
import assert from 'node:assert';
import { salvarTentativaDb, executarHardResetHistoricoESessoes } from './supabaseClient';
import { STORAGE_KEYS } from './supabaseClient';

// Mock localStorage para ambiente Node.js de teste
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, value: string) => store.set(key, String(value)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };
}

test('salvarTentativaDb bloqueia disparos duplicados na mesma janela de debounce (< 5s)', async () => {
  const questaoId = 'q_anti_duplicate_test_100';
  localStorage.removeItem(STORAGE_KEYS.HISTORICO);

  const agora = Date.now();

  // 1. Primeira tentativa (erro na opção 1)
  await salvarTentativaDb(questaoId, {
    escolha: 1,
    acertou: false,
    data: agora,
  });

  // 2. Disparo duplicado 100ms depois (duplo clique com mesma escolha)
  await salvarTentativaDb(questaoId, {
    escolha: 1,
    acertou: false,
    data: agora + 100,
  });

  // 3. Outro disparo duplicado 1500ms depois (retry de rede)
  await salvarTentativaDb(questaoId, {
    escolha: 1,
    acertou: false,
    data: agora + 1500,
  });

  const historico = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORICO) || '{}');
  const tentativas = historico[questaoId] || [];

  // Deve haver EXATAMENTE 1 tentativa registrada, bloqueando os clones
  assert.strictEqual(tentativas.length, 1);
  assert.strictEqual(tentativas[0].escolha, 1);
  assert.strictEqual(tentativas[0].acertou, false);
});

test('executarHardResetHistoricoESessoes limpa historico e sessoes mas PRESERVA 100% das questoes', async () => {
  const questoesMock = [
    { id: 'q1', enunciado: 'Questão 1', alternativas: ['A', 'B'], correta: 0 },
    { id: 'q2', enunciado: 'Questão 2', alternativas: ['A', 'B'], correta: 1 },
  ];

  localStorage.setItem(STORAGE_KEYS.QUESTOES, JSON.stringify(questoesMock));
  localStorage.setItem(STORAGE_KEYS.HISTORICO, JSON.stringify({ q1: [{ escolha: 0, acertou: true, data: 1 }] }));
  localStorage.setItem(STORAGE_KEYS.SESSOES, JSON.stringify([{ id: 's1', codigo: 'SIM-01' }]));

  const res = await executarHardResetHistoricoESessoes();

  assert.strictEqual(res.success, true);
  assert.strictEqual(res.questoesPreservadas, 2);

  // Histórico e sessões devem ter sido resetados/limpos no cache
  const histApos = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORICO) || '{}');
  const sessoesApos = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSOES) || '[]');
  assert.strictEqual(Object.keys(histApos).length, 0);
  assert.strictEqual(sessoesApos.length, 0);

  // O acervo de questões deve estar 100% INTACTO
  const questoesRestantes = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTOES) || '[]');
  assert.strictEqual(questoesRestantes.length, 2);
  assert.strictEqual(questoesRestantes[0].id, 'q1');
  assert.strictEqual(questoesRestantes[1].id, 'q2');
});

test('detectarHistoricoOuSessoesCorrompidas identifica dados legados ou ausência do marcador v3', async () => {
  const { detectarHistoricoOuSessoesCorrompidas } = await import('./supabaseClient');

  localStorage.removeItem('gb_clean_reset_v3_auto');
  assert.strictEqual(detectarHistoricoOuSessoesCorrompidas(), true);

  localStorage.setItem('gb_clean_reset_v3_auto', 'true');
  localStorage.setItem(STORAGE_KEYS.SESSOES, '[]');
  localStorage.setItem(STORAGE_KEYS.HISTORICO, '{}');
  assert.strictEqual(detectarHistoricoOuSessoesCorrompidas(), false);

  // Se houver histórico com duplicações
  localStorage.setItem(
    STORAGE_KEYS.HISTORICO,
    JSON.stringify({
      q1: [
        { escolha: 1, acertou: false, timestamp: 1000 },
        { escolha: 1, acertou: false, timestamp: 1000 },
      ],
    })
  );
  assert.strictEqual(detectarHistoricoOuSessoesCorrompidas(), true);
});

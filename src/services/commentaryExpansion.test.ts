import { test } from 'node:test';
import assert from 'node:assert';
import { expandirComentarioQuestao } from './geminiService';
import { atualizarComentarioQuestaoSupabase } from './supabaseClient';

// Mock localStorage para ambiente Node.js
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, value: string) => store.set(key, String(value)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };
}

test('expandirComentarioQuestao deve ser uma função exposta em geminiService', () => {
  assert.strictEqual(typeof expandirComentarioQuestao, 'function');
});

test('atualizarComentarioQuestaoSupabase deve atualizar o localStorage e retornar um booleano', async () => {
  const questaoTeste = {
    id: 'test_q_commentary_123',
    enunciado: 'Questão Teste para Comentário',
    alternativas: ['A', 'B', 'C', 'D', 'E'],
    correta: 0,
    comentario: 'Comentário Inicial Antigo',
  };

  localStorage.setItem('gb_banco_questoes', JSON.stringify([questaoTeste]));

  const novoComentario = 'Alternativa A: [CORRETA] - Justificativa legal.\nAlternativa B: [INCORRETA] - Erro de prazo.';
  const resultado = await atualizarComentarioQuestaoSupabase('test_q_commentary_123', novoComentario);

  const bancoSalvo = JSON.parse(localStorage.getItem('gb_banco_questoes') || '[]');
  const qAtualizada = bancoSalvo.find((q: any) => q.id === 'test_q_commentary_123');

  assert.ok(qAtualizada);
  assert.strictEqual(qAtualizada.comentario, novoComentario);
});

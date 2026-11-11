import { describe, it } from 'node:test';
import assert from 'node:assert';

// Funções puras utilitárias para validação do Modo Leitura e atalhos de teclado
export function processarAtalhoLeitura(
  key: string,
  targetTagName: string,
  isContentEditable: boolean,
  sessaoAtiva: { indice: number; totalQuestoes: number } | null,
  modoLeituraAtual: boolean
): { novoModoLeitura: boolean; novoIndice: number; acaoExecutada: string | null } {
  // Ignora se o elemento focado for um input, textarea ou editável
  if (
    targetTagName === 'INPUT' ||
    targetTagName === 'TEXTAREA' ||
    isContentEditable
  ) {
    return {
      novoModoLeitura: modoLeituraAtual,
      novoIndice: sessaoAtiva ? sessaoAtiva.indice : 0,
      acaoExecutada: null,
    };
  }

  const k = key.toLowerCase();

  if (k === 'l') {
    return {
      novoModoLeitura: !modoLeituraAtual,
      novoIndice: sessaoAtiva ? sessaoAtiva.indice : 0,
      acaoExecutada: 'TOGGLE_MODO_LEITURA',
    };
  }

  if (sessaoAtiva) {
    if (k === 'a' && sessaoAtiva.indice > 0) {
      return {
        novoModoLeitura: modoLeituraAtual,
        novoIndice: sessaoAtiva.indice - 1,
        acaoExecutada: 'QUESTAO_ANTERIOR',
      };
    }

    if (k === 'd' && sessaoAtiva.indice < sessaoAtiva.totalQuestoes - 1) {
      return {
        novoModoLeitura: modoLeituraAtual,
        novoIndice: sessaoAtiva.indice + 1,
        acaoExecutada: 'QUESTAO_PROXIMA',
      };
    }
  }

  return {
    novoModoLeitura: modoLeituraAtual,
    novoIndice: sessaoAtiva ? sessaoAtiva.indice : 0,
    acaoExecutada: null,
  };
}

/**
 * Converte as teclas numéricas de 1 a 5 no índice correspondente da alternativa (0 a 4)
 * 1 -> 0 (A)
 * 2 -> 1 (B)
 * 3 -> 2 (C)
 * 4 -> 3 (D)
 * 5 -> 4 (E)
 */
export function obterIndiceAlternativaPorTecla(key: string): number | null {
  if (['1', '2', '3', '4', '5'].includes(key)) {
    return parseInt(key, 10) - 1;
  }
  return null;
}

/**
 * Regra de visibilidade da lista de cadernos / histórico (Aba 3)
 * A lista só deve ser oculta quando houver uma sessão ATIVA e o Modo Leitura estiver LIGADO.
 * Caso contrário (sem sessão ativa ou modo leitura desligado), a lista DEVE ser visível.
 */
export function deveExibirListaHistoricoCadernos(
  modoLeituraSessao: boolean,
  sessaoAtiva: any | null
): boolean {
  return !modoLeituraSessao || !sessaoAtiva;
}

describe('Modo Leitura e Atalhos de Teclado nas Sessões (REGRA ANTI-REGRESSÃO)', () => {
  it('alterna o estado do modo leitura ao pressionar a tecla L fora de campos de texto', () => {
    const res = processarAtalhoLeitura('l', 'DIV', false, { indice: 2, totalQuestoes: 10 }, false);
    assert.strictEqual(res.novoModoLeitura, true);
    assert.strictEqual(res.acaoExecutada, 'TOGGLE_MODO_LEITURA');

    const resDesativar = processarAtalhoLeitura('L', 'BODY', false, { indice: 2, totalQuestoes: 10 }, true);
    assert.strictEqual(resDesativar.novoModoLeitura, false);
    assert.strictEqual(resDesativar.acaoExecutada, 'TOGGLE_MODO_LEITURA');
  });

  it('avança para a próxima questão ao pressionar D dentro dos limites da sessão', () => {
    const res = processarAtalhoLeitura('d', 'BUTTON', false, { indice: 0, totalQuestoes: 5 }, false);
    assert.strictEqual(res.novoIndice, 1);
    assert.strictEqual(res.acaoExecutada, 'QUESTAO_PROXIMA');
  });

  it('não avança além da última questão ao pressionar D', () => {
    const res = processarAtalhoLeitura('d', 'DIV', false, { indice: 4, totalQuestoes: 5 }, false);
    assert.strictEqual(res.novoIndice, 4);
    assert.strictEqual(res.acaoExecutada, null);
  });

  it('retrocede para a questão anterior ao pressionar A dentro dos limites da sessão', () => {
    const res = processarAtalhoLeitura('a', 'SPAN', false, { indice: 3, totalQuestoes: 5 }, false);
    assert.strictEqual(res.novoIndice, 2);
    assert.strictEqual(res.acaoExecutada, 'QUESTAO_ANTERIOR');
  });

  it('não retrocede antes da primeira questão (índice 0) ao pressionar A', () => {
    const res = processarAtalhoLeitura('A', 'DIV', false, { indice: 0, totalQuestoes: 5 }, false);
    assert.strictEqual(res.novoIndice, 0);
    assert.strictEqual(res.acaoExecutada, null);
  });

  it('mapeia corretamente as teclas 1, 2, 3, 4 e 5 para os índices das alternativas A, B, C, D e E', () => {
    assert.strictEqual(obterIndiceAlternativaPorTecla('1'), 0); // Alternativa A
    assert.strictEqual(obterIndiceAlternativaPorTecla('2'), 1); // Alternativa B
    assert.strictEqual(obterIndiceAlternativaPorTecla('3'), 2); // Alternativa C
    assert.strictEqual(obterIndiceAlternativaPorTecla('4'), 3); // Alternativa D
    assert.strictEqual(obterIndiceAlternativaPorTecla('5'), 4); // Alternativa E
    assert.strictEqual(obterIndiceAlternativaPorTecla('6'), null); // Inválido
    assert.strictEqual(obterIndiceAlternativaPorTecla('a'), null); // Inválido
  });

  it('ignora completamente os atalhos A, D e L quando o usuário está digitando em INPUT ou TEXTAREA', () => {
    const resInput = processarAtalhoLeitura('l', 'INPUT', false, { indice: 1, totalQuestoes: 5 }, false);
    assert.strictEqual(resInput.novoModoLeitura, false);
    assert.strictEqual(resInput.acaoExecutada, null);

    const resTextarea = processarAtalhoLeitura('d', 'TEXTAREA', false, { indice: 1, totalQuestoes: 5 }, false);
    assert.strictEqual(resTextarea.novoIndice, 1);
    assert.strictEqual(resTextarea.acaoExecutada, null);

    const resEditable = processarAtalhoLeitura('a', 'DIV', true, { indice: 2, totalQuestoes: 5 }, false);
    assert.strictEqual(resEditable.novoIndice, 2);
    assert.strictEqual(resEditable.acaoExecutada, null);
  });

  it('REGRA ANTI-REGRESSÃO: nunca oculta a lista de cadernos se sessaoAtiva for null, prevenindo tela em branco na Aba 3', () => {
    assert.strictEqual(deveExibirListaHistoricoCadernos(true, null), true);
    assert.strictEqual(deveExibirListaHistoricoCadernos(false, null), true);
    assert.strictEqual(deveExibirListaHistoricoCadernos(false, { id: 's1' }), true);
    assert.strictEqual(deveExibirListaHistoricoCadernos(true, { id: 's1' }), false);
  });
});

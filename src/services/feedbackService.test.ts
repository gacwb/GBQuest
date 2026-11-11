import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  salvarFeedbackQuestao,
  obterFeedbackQuestao,
  removerFeedbackQuestao,
  carregarTodosFeedbacks,
  obterResumoAprendizadoFeedback,
  gerarPromptAprendizadoFeedback,
  STORAGE_KEY_FEEDBACK,
} from './feedbackService';

// Mock do localStorage para ambiente Node.js de teste
class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = new LocalStorageMock();
}

describe('feedbackService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('salva e recupera feedback de Like em uma questão', () => {
    const qMock = {
      id: 101,
      enunciado: 'Qual a norma de concreto armado?',
      disciplina: 'Engenharia Civil',
      assunto: 'NBR 6118',
      banca: 'FAFIPA',
    };

    const salvo = salvarFeedbackQuestao(qMock, 'like');
    assert.strictEqual(salvo.tipo, 'like');
    assert.strictEqual(salvo.questaoId, 101);

    const obtido = obterFeedbackQuestao(101);
    assert.ok(obtido);
    assert.strictEqual(obtido?.tipo, 'like');
    assert.strictEqual(obtido?.assunto, 'NBR 6118');
  });

  it('salva feedback de Dislike com motivo pré-definido e observação', () => {
    const qMock = {
      id: 'q_202',
      enunciado: 'Calcule a armadura de flexão com fck de 25 MPa...',
      disciplina: 'Engenharia Civil',
      assunto: 'NBR 6118',
      banca: 'FAFIPA',
    };

    salvarFeedbackQuestao(
      qMock,
      'dislike',
      'Cálculo excessivo nas específicas',
      'Pediu cálculo de momento fletor manual'
    );

    const obtido = obterFeedbackQuestao('q_202');
    assert.ok(obtido);
    assert.strictEqual(obtido?.tipo, 'dislike');
    assert.strictEqual(obtido?.motivo, 'Cálculo excessivo nas específicas');
    assert.strictEqual(obtido?.observacao, 'Pediu cálculo de momento fletor manual');
  });

  it('permite atualizar o feedback da mesma questão sem duplicar registros', () => {
    const qMock = {
      id: 303,
      enunciado: 'Questão sobre a Lei Orgânica...',
      disciplina: 'Legislação Municipal',
      assunto: 'Lei Orgânica',
      banca: 'FAFIPA',
    };

    salvarFeedbackQuestao(qMock, 'dislike', 'Enunciado confuso ou prolixo');
    assert.strictEqual(carregarTodosFeedbacks().length, 1);

    salvarFeedbackQuestao(qMock, 'like');
    const todos = carregarTodosFeedbacks();
    assert.strictEqual(todos.length, 1, 'Não deve duplicar registro para o mesmo id');
    assert.strictEqual(todos[0].tipo, 'like');
  });

  it('permite remover feedback quando desmarcado', () => {
    const qMock = {
      id: 404,
      enunciado: 'Sobre a Lei 14.133/2021...',
      disciplina: 'Licitações',
      assunto: 'Dispensa',
      banca: 'FAFIPA',
    };

    salvarFeedbackQuestao(qMock, 'like');
    assert.ok(obterFeedbackQuestao(404));

    removerFeedbackQuestao(404);
    assert.strictEqual(obterFeedbackQuestao(404), undefined);
  });

  it('obterResumoAprendizadoFeedback consolida métricas e motivos mais frequentes', () => {
    salvarFeedbackQuestao({ id: 1, enunciado: 'Q1' }, 'like');
    salvarFeedbackQuestao({ id: 2, enunciado: 'Q2' }, 'like');
    salvarFeedbackQuestao(
      { id: 3, enunciado: 'Q3' },
      'dislike',
      'Cálculo excessivo nas específicas'
    );
    salvarFeedbackQuestao(
      { id: 4, enunciado: 'Q4' },
      'dislike',
      'Cálculo excessivo nas específicas'
    );
    salvarFeedbackQuestao(
      { id: 5, enunciado: 'Q5' },
      'dislike',
      'Gabarito ambíguo ou duvidoso'
    );

    const resumo = obterResumoAprendizadoFeedback();
    assert.strictEqual(resumo.totalLikes, 2);
    assert.strictEqual(resumo.totalDislikes, 3);
    assert.strictEqual(resumo.totalAvaliacoes, 5);
    assert.strictEqual(resumo.taxaAprovacao, 40); // 2 de 5 = 40%

    assert.strictEqual(resumo.motivosFrequentes[0].motivo, 'Cálculo excessivo nas específicas');
    assert.strictEqual(resumo.motivosFrequentes[0].quantidade, 2);
  });

  it('gerarPromptAprendizadoFeedback mantém baseline canônico se não atingir o quórum de 25 avaliações', () => {
    // Registra apenas 10 avaliações (abaixo do quórum de 25)
    for (let i = 1; i <= 10; i++) {
      salvarFeedbackQuestao(
        { id: i, enunciado: `Questão ${i}` },
        i % 2 === 0 ? 'like' : 'dislike',
        'Cálculo excessivo nas específicas'
      );
    }

    const prompt = gerarPromptAprendizadoFeedback();
    // Deve retornar a memória canônica sem regras customizadas prematuras
    assert.ok(prompt.includes('MEMÓRIA CANÔNICA DA BANCA'));
    assert.ok(prompt.includes('Privilegie enunciados objetivos, técnicos e conceituais'));
    assert.strictEqual(prompt.includes('PADRÕES RECORRENTES REJEITADOS'), false);
  });

  it('gerarPromptAprendizadoFeedback no modo passivo mantém baseline canônico mesmo superando o quórum de 25 avaliações', () => {
    // Simula 30 avaliações totais (acima do quórum de 25):
    for (let i = 1; i <= 25; i++) {
      salvarFeedbackQuestao({ id: `like_${i}`, enunciado: `Questão Boa ${i}` }, 'like');
    }
    for (let i = 1; i <= 5; i++) {
      salvarFeedbackQuestao(
        { id: `dislike_calc_${i}`, enunciado: `Questão com conta ${i}` },
        'dislike',
        'Cálculo excessivo nas específicas'
      );
    }

    // Valida que as estatísticas foram apuradas corretamente
    const resumo = obterResumoAprendizadoFeedback();
    assert.strictEqual(resumo.totalAvaliacoes, 30);
    assert.strictEqual(resumo.totalLikes, 25);
    assert.strictEqual(resumo.totalDislikes, 5);

    // No modo passivo (MODO_APRENDIZADO_ATIVO = false), a IA NUNCA recebe restrições
    const prompt = gerarPromptAprendizadoFeedback();
    assert.ok(prompt.includes('MEMÓRIA CANÔNICA DA BANCA'));
    assert.ok(prompt.includes('Privilegie enunciados objetivos, técnicos e conceituais'));
    assert.strictEqual(prompt.includes('PADRÕES RECORRENTES REJEITADOS'), false);
    assert.strictEqual(prompt.includes('30 avaliações acumuladas'), false);
  });
});

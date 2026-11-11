import test from 'node:test';
import assert from 'node:assert/strict';
import {
  gerarDistribuicaoGabaritoBalanceada,
  formatarInstrucaoDistribuicaoGabarito,
  limparPrefixoAlternativa,
  atualizarComentarioGabarito,
  reembaralharAlternativasQuestao,
  garantirDistribuicaoUniforme,
} from './gabaritoRandomizer';

test('gerarDistribuicaoGabaritoBalanceada produz distribuição balanceada para 10 questões', () => {
  const dist = gerarDistribuicaoGabaritoBalanceada(10);
  assert.equal(dist.length, 10);

  // Cada alternativa (0, 1, 2, 3, 4) deve aparecer exatamente 2 vezes
  const contagens = [0, 0, 0, 0, 0];
  dist.forEach((idx) => {
    assert.ok(idx >= 0 && idx <= 4);
    contagens[idx]++;
  });

  for (let i = 0; i < 5; i++) {
    assert.equal(contagens[i], 2, `Alternativa ${i} deve aparecer exatamente 2 vezes`);
  }
});

test('gerarDistribuicaoGabaritoBalanceada lida com quantidades não múltiplas de 5', () => {
  const dist = gerarDistribuicaoGabaritoBalanceada(7);
  assert.equal(dist.length, 7);

  const contagens = [0, 0, 0, 0, 0];
  dist.forEach((idx) => contagens[idx]++);

  // Em 7 questões, a diferença máxima entre a mais e a menos frequente deve ser 1
  const max = Math.max(...contagens);
  const min = Math.min(...contagens);
  assert.ok(max - min <= 1);
});

test('formatarInstrucaoDistribuicaoGabarito gera texto com mapeamento de gabaritos', () => {
  const dist = [3, 4, 0, 2, 1];
  const texto = formatarInstrucaoDistribuicaoGabarito(dist);

  assert.ok(texto.includes('DISTRIBUIÇÃO UNIFORME E ALEATORIEDADE OBRIGATÓRIA'));
  assert.ok(texto.includes('Questão 1: gabarito na alternativa D (correta: 3)'));
  assert.ok(texto.includes('Questão 2: gabarito na alternativa E (correta: 4)'));
  assert.ok(texto.includes('Questão 3: gabarito na alternativa A (correta: 0)'));
  assert.ok(texto.includes('Questão 4: gabarito na alternativa C (correta: 2)'));
  assert.ok(texto.includes('Questão 5: gabarito na alternativa B (correta: 1)'));
});

test('limparPrefixoAlternativa remove prefixos A), B), etc.', () => {
  assert.equal(limparPrefixoAlternativa('A) Texto qualquer'), 'Texto qualquer');
  assert.equal(limparPrefixoAlternativa('B)   Outro texto'), 'Outro texto');
  assert.equal(limparPrefixoAlternativa('Texto sem prefixo'), 'Texto sem prefixo');
});

test('atualizarComentarioGabarito atualiza referências à letra do gabarito', () => {
  const com1 = 'Gabarito: B. A alternativa B está correta conforme a lei.';
  const res1 = atualizarComentarioGabarito(com1, 'B', 'D');
  assert.equal(res1, 'Gabarito: D. A alternativa D está correta conforme a lei.');

  // Não altera alíneas de leis ou outras palavras
  const com2 = 'Gabarito: B. Conforme art. 5º, alínea b do inciso I.';
  const res2 = atualizarComentarioGabarito(com2, 'B', 'E');
  assert.ok(res2.startsWith('Gabarito: E.'));
  assert.ok(res2.includes('alínea b')); // preservado!
});

test('reembaralharAlternativasQuestao move alternativa correta para o novo índice alvo', () => {
  const questaoOriginal = {
    enunciado: 'Qual a regra geral?',
    alternativas: [
      'A) Primeira errada',
      'B) Segunda correta verdadeira',
      'C) Terceira errada',
      'D) Quarta errada',
      'E) Quinta errada',
    ],
    correta: 1, // B
    comentario: 'Gabarito: B. A alternativa B está correta.',
  };

  // Mover para D (índice 3)
  const remanejada = reembaralharAlternativasQuestao(questaoOriginal, 3);

  assert.equal(remanejada.correta, 3);
  assert.equal(remanejada.alternativas[3], 'D) Segunda correta verdadeira');
  assert.ok(remanejada.alternativas[0].startsWith('A) '));
  assert.ok(remanejada.alternativas[1].startsWith('B) '));
  assert.ok(remanejada.alternativas[2].startsWith('C) '));
  assert.ok(remanejada.alternativas[4].startsWith('E) '));
  assert.ok(remanejada.comentario?.includes('Gabarito: D'));
});

test('garantirDistribuicaoUniforme corrige lote altamente enviesado em B', () => {
  // Simula o caso reportado pelo usuário: 8 de 10 questões com correta = 1 (B)
  const loteEnviesado = Array.from({ length: 10 }, (_, i) => ({
    enunciado: `Questão ${i + 1}`,
    alternativas: [
      'A) Opção 1',
      'B) Opção 2 correta',
      'C) Opção 3',
      'D) Opção 4',
      'E) Opção 5',
    ],
    correta: i < 8 ? 1 : 0, // 80% B, 20% A, 0% C, D, E
    comentario: 'Gabarito: B. Correto.',
  }));

  const corrigido = garantirDistribuicaoUniforme(loteEnviesado);

  const contagens = [0, 0, 0, 0, 0];
  corrigido.forEach((q) => contagens[q.correta]++);

  // Todas as 5 letras devem estar representadas (exatamente 2 cada em 10 questões)
  for (let i = 0; i < 5; i++) {
    assert.equal(contagens[i], 2, `Letra ${i} deve ter exatamente 2 questões após redistribuição`);
  }
});

test('garantirDistribuicaoUniforme corrige viés sutil de A e B em sessão de 10 questões (3A, 3B, 2C, 1D, 1E)', () => {
  // Caso real reportado pelo usuário: puxa muito para A e B (60% A e B)
  const gabaritosIniciais = [0, 0, 0, 1, 1, 1, 2, 2, 3, 4];
  const lote = gabaritosIniciais.map((correta, i) => ({
    enunciado: `Questão ${i + 1}`,
    alternativas: ['A) 1', 'B) 2', 'C) 3', 'D) 4', 'E) 5'],
    correta,
    comentario: `Gabarito: ${['A', 'B', 'C', 'D', 'E'][correta]}`,
  }));

  const corrigido = garantirDistribuicaoUniforme(lote);
  const contagens = [0, 0, 0, 0, 0];
  corrigido.forEach((q) => contagens[q.correta]++);

  // Em 10 questões, deve ter rigorosamente 2 A, 2 B, 2 C, 2 D, 2 E
  for (let i = 0; i < 5; i++) {
    assert.equal(contagens[i], 2, `Letra ${['A', 'B', 'C', 'D', 'E'][i]} deve ter exatamente 2`);
  }
});

test('garantirDistribuicaoUniforme em sessão de 5 questões garante exatamente 1A, 1B, 1C, 1D, 1E', () => {
  // Simula 5 questões geradas onde a IA colocou 3 em A e 2 em B
  const lote = [0, 0, 0, 1, 1].map((correta, i) => ({
    enunciado: `Questão ${i + 1}`,
    alternativas: ['A) 1', 'B) 2', 'C) 3', 'D) 4', 'E) 5'],
    correta,
    comentario: `Gabarito: ${correta === 0 ? 'A' : 'B'}`,
  }));

  const corrigido = garantirDistribuicaoUniforme(lote);
  const contagens = [0, 0, 0, 0, 0];
  corrigido.forEach((q) => contagens[q.correta]++);

  // Deve haver exatamente 1 de cada letra
  for (let i = 0; i < 5; i++) {
    assert.equal(contagens[i], 1, `Letra ${['A', 'B', 'C', 'D', 'E'][i]} deve ter exatamente 1`);
  }
});

test('garantirDistribuicaoUniforme em sessão de 20 questões garante exatamente 4A, 4B, 4C, 4D, 4E', () => {
  // Simula 20 questões onde a IA colocou metade em A e metade em B
  const lote = Array.from({ length: 20 }, (_, i) => ({
    enunciado: `Questão ${i + 1}`,
    alternativas: ['A) 1', 'B) 2', 'C) 3', 'D) 4', 'E) 5'],
    correta: i < 10 ? 0 : 1, // 10 A's e 10 B's
    comentario: 'Gabarito',
  }));

  const corrigido = garantirDistribuicaoUniforme(lote);
  const contagens = [0, 0, 0, 0, 0];
  corrigido.forEach((q) => contagens[q.correta]++);

  for (let i = 0; i < 5; i++) {
    assert.equal(contagens[i], 4, `Letra ${['A', 'B', 'C', 'D', 'E'][i]} deve ter exatamente 4`);
  }
});


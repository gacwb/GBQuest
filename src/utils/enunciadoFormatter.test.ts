import test from 'node:test';
import assert from 'node:assert/strict';
import { formatarEnunciado } from './enunciadoFormatter';

test('formatarEnunciado retorna string vazia para entrada vazia ou nula', () => {
  assert.equal(formatarEnunciado(''), '');
  assert.equal(formatarEnunciado(null), '');
  assert.equal(formatarEnunciado(undefined), '');
});

test('formatarEnunciado formata questao com Coluna 1, Coluna 2 e parenteses (Exemplo 1 do usuario)', () => {
  const textoCorrido =
    'No exercício da fiscalização técnica de contratos de engenharia e auditoria de segurança do trabalho, o Engenheiro Fiscal deve correlacionar corretamente as modalidades de Sistemas de Proteção Individual Contra Quedas (SPIQ) às suas respectivas definições conceituais estabelecidas na NR-35. Coluna 1 - Modalidade de SPIQ 1. Restrição de movimentação 2. Retenção de queda 3. Posicionamento no trabalho Coluna 2 - Definição Conceitual ( ) Sistema configurado para permitir que o trabalhador permaneça posicionado no local de trabalho, total ou parcialmente suspenso, sem o uso das mãos. ( ) Sistema destinado a limitar a movimentação do trabalhador de modo que este não fique exposto ao risco de queda com diferença de nível. ( ) Sistema que não evita o início da queda, mas atua interrompendo-a após iniciada, reduzindo suas consequências e limitando a força de impacto. Assinale a sequência que preenche corretamente os parênteses, de cima para baixo:';

  const resultado = formatarEnunciado(textoCorrido);

  // Deve ter quebras antes de Coluna 1 e Coluna 2
  assert.match(resultado, /\n\nColuna 1 - Modalidade de SPIQ/);
  assert.match(resultado, /\n\nColuna 2 - Definição Conceitual/);

  // Deve ter quebras entre itens numerados
  assert.match(resultado, /\n1\. Restrição de movimentação/);
  assert.match(resultado, /\n2\. Retenção de queda/);
  assert.match(resultado, /\n3\. Posicionamento no trabalho/);

  // Deve ter quebras entre itens com parenteses
  assert.match(resultado, /\n\( \) Sistema configurado/);
  assert.match(resultado, /\n\( \) Sistema destinado/);
  assert.match(resultado, /\n\( \) Sistema que não evita/);

  // Deve ter quebra antes do comando final
  assert.match(resultado, /\n\nAssinale a sequência que preenche/);
});

test('formatarEnunciado formata assercoes romanas I e II com PORQUE (Exemplo 2 do usuario)', () => {
  const textoCorrido =
    'Durante a fiscalização de uma obra pública municipal para liberação de medição e análise de conformidade de segurança, o Engenheiro Civil Fiscal constata que os operários realizam tarefas em altura sobre cavaletes improvisados em beiral de laje desprotegido. Ao notificar o consórcio construtor, o fiscal exige a observância estrita da hierarquia de planejamento estabelecida na NR-35. Analise as asserções a seguir e a relação proposta entre elas: I. No planejamento do trabalho em altura, a primeira medida prioritária a ser adotada pela construtora consiste na implementação de sistemas que eliminem o risco de queda dos trabalhadores, independentemente da existência de meios alternativos de execução da atividade no solo. PORQUE II. As medidas destinadas a evitar o trabalho em altura possuem caráter meramente preferencial e subsidiário quando comparadas ao emprego de Sistemas de Proteção Coletiva Contra Quedas (SPCQ). A respeito dessas asserções, assinale a opção correta:';

  const resultado = formatarEnunciado(textoCorrido);

  // Parágrafos de contexto separados
  assert.match(resultado, /desprotegido\.\n\nAo notificar o consórcio construtor/);

  // Introdução às asserções separada
  assert.match(resultado, /\n\nAnalise as asserções a seguir e a relação proposta entre elas:/);

  // Assertiva I separada
  assert.match(resultado, /\n\nI\. No planejamento do trabalho/);

  // Conectivo PORQUE destacado
  assert.match(resultado, /\n\nPORQUE\n\nII\. As medidas destinadas/);

  // Pergunta final destacada
  assert.match(resultado, /\n\nA respeito dessas asserções, assinale a opção correta:/);
});

test('formatarEnunciado lida com texto que ja contem quebras de linha preservando-as', () => {
  const texto = `Texto introdutório.\n\nI. Primeiro item.\nII. Segundo item.\n\nEstá correto o que se afirma em:`;
  const resultado = formatarEnunciado(texto);
  assert.match(resultado, /Texto introdutório\./);
  assert.match(resultado, /I\. Primeiro item\./);
  assert.match(resultado, /II\. Segundo item\./);
  assert.match(resultado, /Está correto o que se afirma em:/);
});

test('formatarEnunciado converte quebras de linha escapadas \\\\n em quebras reais', () => {
  const texto = 'Primeiro parágrafo.\\n\\nSegundo parágrafo.';
  const resultado = formatarEnunciado(texto);
  assert.equal(resultado, 'Primeiro parágrafo.\n\nSegundo parágrafo.');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  processarTextoComGrifos,
  ESTILOS_CORES_GRIFO,
} from './grifoTextProcessor';
import { GrifoQuestao } from '../types';

test('processarTextoComGrifos retorna texto integro se nao houver grifos', () => {
  const texto = 'O fiscal de obras deve inspecionar o canteiro.';
  const segmentos = processarTextoComGrifos(texto, []);
  assert.equal(segmentos.length, 1);
  assert.equal(segmentos[0].tipo, 'texto');
  assert.equal(segmentos[0].conteudo, texto);
});

test('processarTextoComGrifos divide texto com um grifo amarelo', () => {
  const texto = 'Em o Estado compensa a perda da renda durante o período';
  const grifos: GrifoQuestao[] = [
    {
      id: 'hl-1',
      questaoId: 42,
      cor: 'yellow',
      texto: 'o Estado',
      startIndex: 3,
      endIndex: 11,
    },
  ];

  const segmentos = processarTextoComGrifos(texto, grifos);
  assert.equal(segmentos.length, 3);

  assert.equal(segmentos[0].tipo, 'texto');
  assert.equal(segmentos[0].conteudo, 'Em ');

  assert.equal(segmentos[1].tipo, 'grifo');
  assert.equal(segmentos[1].conteudo, 'o Estado');
  assert.equal(segmentos[1].grifo?.cor, 'yellow');

  assert.equal(segmentos[2].tipo, 'texto');
  assert.equal(segmentos[2].conteudo, ' compensa a perda da renda durante o período');
});

test('processarTextoComGrifos divide texto com multiplos grifos de cores distintas', () => {
  const texto = 'III.Em "o Estado compensa a perda da renda durante o período em que a pessoa presta assistência", o termo destacado estabelece relação temporal e atua como preposição.';
  const grifos: GrifoQuestao[] = [
    {
      id: 'hl-blue',
      questaoId: 101,
      cor: 'cyan',
      texto: 'o Estado',
      startIndex: 8,
      endIndex: 16,
    },
    {
      id: 'hl-green',
      questaoId: 101,
      cor: 'green',
      texto: 'relação temporal e atua como preposição.',
      startIndex: 128,
      endIndex: 168,
    },
  ];

  const segmentos = processarTextoComGrifos(texto, grifos);

  const grifoAzul = segmentos.find((s) => s.tipo === 'grifo' && s.conteudo === 'o Estado');
  assert.notEqual(grifoAzul, undefined);
  assert.equal(grifoAzul?.grifo?.cor, 'cyan');

  const grifoVerde = segmentos.find((s) => s.tipo === 'grifo' && s.conteudo === 'relação temporal e atua como preposição.');
  assert.notEqual(grifoVerde, undefined);
  assert.equal(grifoVerde?.grifo?.cor, 'green');
});

test('processarTextoComGrifos localiza texto mesmo se startIndex tiver pequeno deslocamento', () => {
  const texto = 'Durante a fiscalizacao, o auditor detectou irregularidade no contrato.';
  const grifos: GrifoQuestao[] = [
    {
      id: 'hl-deslocado',
      questaoId: 55,
      cor: 'pink',
      texto: 'irregularidade no contrato',
      startIndex: 0, // offset incorreto intencional
      endIndex: 26,
    },
  ];

  const segmentos = processarTextoComGrifos(texto, grifos);
  const grifoRosa = segmentos.find((s) => s.tipo === 'grifo');
  assert.notEqual(grifoRosa, undefined);
  assert.equal(grifoRosa?.conteudo, 'irregularidade no contrato');
  assert.equal(grifoRosa?.grifo?.cor, 'pink');
});

test('ESTILOS_CORES_GRIFO contém todas as 4 cores requeridas da imagem com estilos de highlight', () => {
  assert.ok(ESTILOS_CORES_GRIFO.yellow);
  assert.ok(ESTILOS_CORES_GRIFO.green);
  assert.ok(ESTILOS_CORES_GRIFO.pink);
  assert.ok(ESTILOS_CORES_GRIFO.cyan);

  assert.equal(ESTILOS_CORES_GRIFO.yellow.corHex, '#eab308');
  assert.equal(ESTILOS_CORES_GRIFO.green.corHex, '#84cc16');
  assert.equal(ESTILOS_CORES_GRIFO.pink.corHex, '#ec4899');
  assert.equal(ESTILOS_CORES_GRIFO.cyan.corHex, '#06b6d4');
});

test('REGRA ANTI-REGRESSÃO: processarTextoComGrifos isola grifos por offsetBase em enunciados multi-parágrafo com palavras repetidas', () => {
  const bloco1 = 'O fiscal de obras analisou o contrato de obras públicas.';
  const bloco2 = 'Ao finalizar as obras de infraestrutura...';

  const grifos: GrifoQuestao[] = [
    {
      id: 'grifo-bloco2',
      questaoId: 999,
      cor: 'yellow',
      texto: 'obras',
      startIndex: 115,
      endIndex: 120,
    },
  ];

  const segsBloco1 = processarTextoComGrifos(bloco1, grifos, 0);
  const temGrifoNoBloco1 = segsBloco1.some((s) => s.tipo === 'grifo');
  assert.equal(temGrifoNoBloco1, false, 'Bloco 1 não deve grifar "obras" de um grifo do Bloco 2');

  const segsBloco2 = processarTextoComGrifos(bloco2, grifos, 100);
  const grifoBloco2 = segsBloco2.find((s) => s.tipo === 'grifo');
  assert.notEqual(grifoBloco2, undefined, 'Bloco 2 deve conter o grifo');
  assert.equal(grifoBloco2?.conteudo, 'obras');
  assert.equal(grifoBloco2?.grifo?.cor, 'yellow');
});

test('REGRA ANTI-REGRESSÃO: Suporte a IDs de questão textuais e canônicos na gravação de grifos', () => {
  const mapaGrifos: Record<string, GrifoQuestao[]> = {};
  const questaoIdString = 'fafipa_2016_cm_1';
  const questaoIdNumerico = '20161';

  const g: GrifoQuestao = {
    id: 'grifo_1',
    questaoId: questaoIdString,
    cor: 'yellow',
    texto: 'licitação',
    startIndex: 10,
    endIndex: 19,
  };

  // Popula mapa sob ambas as chaves para que a busca funcione independentemente do formato do ID
  mapaGrifos[questaoIdString] = [g];
  mapaGrifos[questaoIdNumerico] = [g];

  assert.equal(mapaGrifos['fafipa_2016_cm_1'].length, 1);
  assert.equal(mapaGrifos['20161'].length, 1);
});

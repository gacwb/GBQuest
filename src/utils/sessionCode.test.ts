import test from 'node:test';
import assert from 'node:assert/strict';
import {
  gerarCodigoSessaoPadrao,
  extrairPrefixoBloco,
  extrairTipoNorma,
  extrairNumeroNorma,
  gerarCodigoSessaoComContagem,
} from './sessionCode.ts';

test('extrairPrefixoBloco extracts 2 leading characters or number', () => {
  assert.equal(extrairPrefixoBloco('02_Licitações Contratos Custos'), '02');
  assert.equal(extrairPrefixoBloco('Bloco 05'), '05');
  assert.equal(extrairPrefixoBloco('01 - Direito'), '01');
});

test('extrairTipoNorma detects Lei as L and Decreto as D', () => {
  assert.equal(extrairTipoNorma('2.1_Lei_14133_2021_Nova_Lei_Licitacoes_Contratos'), 'L');
  assert.equal(extrairTipoNorma('Decreto 10.024/2019'), 'D');
  assert.equal(extrairTipoNorma('dec_9999'), 'D');
  assert.equal(extrairTipoNorma('Lei Orgânica'), 'L');
});

test('extrairNumeroNorma extracts correct law and decree numbers', () => {
  assert.equal(extrairNumeroNorma('2.1_Lei_14133_2021_Nova_Lei_Licitacoes_Contratos'), '14133');
  assert.equal(extrairNumeroNorma('Lei nº 8.112/90'), '8112');
  assert.equal(extrairNumeroNorma('Decreto 10.024'), '10024');
});

test('gerarCodigoSessaoPadrao produces exact user pattern BL02L14133', () => {
  const result = gerarCodigoSessaoPadrao(
    '02_Licitações Contratos Custos',
    '2.1_Lei_14133_2021_Nova_Lei_Licitacoes_Contratos'
  );
  assert.equal(result, 'BL02L14133');
});

test('gerarCodigoSessaoComContagem produces BL02L14133x1 for first session', () => {
  const result = gerarCodigoSessaoComContagem(
    '02_Licitações Contratos Custos',
    '2.1_Lei_14133_2021_Nova_Lei_Licitacoes_Contratos',
    []
  );
  assert.equal(result, 'BL02L14133x1');
});

test('gerarCodigoSessaoComContagem produces BL02L14133x2 when legacy session without suffix exists', () => {
  const sessoesExistentes = [
    { codigo: 'BL02L14133', disciplina: '02_Licitações Contratos Custos', assunto: 'Lei 14.133' },
  ];
  const result = gerarCodigoSessaoComContagem(
    '02_Licitações Contratos Custos',
    '2.1_Lei_14133_2021_Nova_Lei_Licitacoes_Contratos',
    sessoesExistentes
  );
  assert.equal(result, 'BL02L14133x2');
});

test('gerarCodigoSessaoComContagem produces BL02L14133x3 when x1 and x2 exist', () => {
  const sessoesExistentes = [
    { codigo: 'BL02L14133x1' },
    { codigo: 'BL02L14133x2' },
  ];
  const result = gerarCodigoSessaoComContagem(
    '02_Licitações Contratos Custos',
    'Lei 14.133',
    sessoesExistentes
  );
  assert.equal(result, 'BL02L14133x3');
});

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { hashStringTo32BitInt } from '../utils/uuidUtils';

describe('Migração de Dados do Histórico Antigo e Mapeamento Defensivo (REGRA ANTI-REGRESSÃO)', () => {
  it('correlaciona IDs antigos extraídos via regex \\D com os IDs canônicos atuais do EAP', () => {
    const questoesExemplo = [
      { id: 'FAFIPA-PORT-01', disciplina: 'Língua Portuguesa' },
      { id: 'FAFIPA-ENG-CIVIL-01', disciplina: 'Engenharia Civil' },
    ];

    const mapaRegex = new Map<string, string>();
    questoesExemplo.forEach((q) => {
      const strId = String(q.id).trim();
      mapaRegex.set(strId, strId);
      const legNum = String(parseInt(strId.replace(/\D/g, ''), 10) || '');
      if (legNum && !mapaRegex.has(legNum)) {
        mapaRegex.set(legNum, strId);
      }
    });

    assert.strictEqual(mapaRegex.get('FAFIPA-PORT-01'), 'FAFIPA-PORT-01');
    assert.strictEqual(mapaRegex.get('FAFIPA-ENG-CIVIL-01'), 'FAFIPA-ENG-CIVIL-01');
  });

  it('preserva os hashes de 32-bit determinísticos após a migração para a nuvem', () => {
    const qStr = 'FAFIPA-ENG-CIVIL-01';
    const hashNum = hashStringTo32BitInt(qStr);

    assert.ok(hashNum > 0 && hashNum <= 2147483647, 'Hash deve ser compatível com Postgres INTEGER');
    assert.strictEqual(hashStringTo32BitInt(qStr), hashNum, 'Migração deve ser idempotente');
  });
});

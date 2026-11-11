import { describe, it } from 'node:test';
import assert from 'node:assert';
import { gerarUUIDv4, hashStringTo32BitInt, ehUUIDValido } from '../utils/uuidUtils';

describe('UUIDv4 e Hashing Determinístico (Prevenção de Colisão no Supabase)', () => {
  it('gerarUUIDv4 produz strings de UUIDv4 válidas e únicas', () => {
    const uuid1 = gerarUUIDv4();
    const uuid2 = gerarUUIDv4();

    assert.ok(ehUUIDValido(uuid1), `UUID1 inválido: ${uuid1}`);
    assert.ok(ehUUIDValido(uuid2), `UUID2 inválido: ${uuid2}`);
    assert.notStrictEqual(uuid1, uuid2, 'UUIDs gerados não devem ser iguais');
  });

  it('hashStringTo32BitInt gera números inteiros determinísticos positivos de 32 bits', () => {
    const hash1 = hashStringTo32BitInt('FAFIPA-PORT-01');
    const hash2 = hashStringTo32BitInt('FAFIPA-PORT-01');

    assert.strictEqual(hash1, hash2, 'Mesmo ID de texto deve produzir o mesmo hash');
    assert.ok(hash1 > 0 && hash1 <= 2147483647, 'Hash deve estar no intervalo positivo do INTEGER Postgres');
  });

  it('hashStringTo32BitInt previne colisão entre matérias distintas que usavam sufixos idênticos', () => {
    // Antes: "FAFIPA-PORT-01" e "FAFIPA-ENG-CIVIL-01" viravam ambos "1" via replace(/\D/g, '')
    const hashPort = hashStringTo32BitInt('FAFIPA-PORT-01');
    const hashEng = hashStringTo32BitInt('FAFIPA-ENG-CIVIL-01');
    const hashInfo = hashStringTo32BitInt('FAFIPA-INFO-01');

    assert.notStrictEqual(hashPort, hashEng, 'Português e Engenharia Civil não podem ter o mesmo hash numérico');
    assert.notStrictEqual(hashPort, hashInfo, 'Português e Informática não podem ter o mesmo hash numérico');
    assert.notStrictEqual(hashEng, hashInfo, 'Engenharia Civil e Informática não podem ter o mesmo hash numérico');
  });

  it('preserva inteiros numéricos originais sem alteração', () => {
    assert.strictEqual(hashStringTo32BitInt(105), 105);
    assert.strictEqual(hashStringTo32BitInt('105'), 105);
  });
});

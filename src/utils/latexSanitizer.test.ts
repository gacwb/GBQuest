import { describe, it } from 'node:test';
import assert from 'node:assert';
import { limparSintaxeLatex } from './latexSanitizer';

describe('latexSanitizer', () => {
  it('converte o caso exato da captura do usuário ($k_{mod,1} \\cdot k_{mod,2} \\cdot k_{mod,3}$)', () => {
    const entrada = 'três fatores ($k_{mod,1} \\cdot k_{mod,2} \\cdot k_{mod,3}$), os quais';
    const saida = limparSintaxeLatex(entrada);
    assert.strictEqual(saida, 'três fatores (kmod,1 · kmod,2 · kmod,3), os quais');
    assert.ok(!saida.includes('$'), 'Não deve conter delimitador $');
    assert.ok(!saida.includes('\\cdot'), 'Não deve conter comando \\cdot');
    assert.ok(!saida.includes('{'), 'Não deve conter chaves TeX');
  });

  it('converte frações \\frac{a}{b} em (a / b)', () => {
    const entrada = 'resistência de cálculo $f_{cd} = \\frac{f_{ck}}{\\gamma_c}$';
    const saida = limparSintaxeLatex(entrada);
    assert.ok(saida.includes('(fck / γc)'), 'Fração convertida corretamente');
    assert.ok(!saida.includes('\\frac'));
    assert.ok(!saida.includes('$'));
  });

  it('converte potências e índices comuns (m^2 -> m², m^3 -> m³, \\ge -> ≥)', () => {
    const entrada = 'área de 50 m^{2} e volume de 10 m^3 com tensão \\ge 25 MPa e diâmetro \\phi 10 mm';
    const saida = limparSintaxeLatex(entrada);
    assert.ok(saida.includes('50 m²'));
    assert.ok(saida.includes('10 m³'));
    assert.ok(saida.includes('≥ 25 MPa'));
    assert.ok(saida.includes('Ø 10 mm'));
  });

  it('retorna texto inalterado se não houver sintaxe LaTeX', () => {
    const entrada = 'De acordo com a NBR 6118, o cobrimento nominal mínimo para vigas é de 30 mm.';
    const saida = limparSintaxeLatex(entrada);
    assert.strictEqual(saida, entrada);
  });
});

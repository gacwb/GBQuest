/**
 * Utilitário de sanitização e conversão de sintaxe LaTeX e fórmulas matemáticas
 * para tipografia limpa em texto corrido e caracteres Unicode padrão de concursos públicos.
 * 
 * Elimina resquícios como ($k_{mod,1} \cdot k_{mod,2} \cdot k_{mod,3}$), \frac, delimitadores $,
 * sobrescritos/subscritos TeX e comandos brutos que prejudicam a legibilidade em provas de engenharia.
 */

export function limparSintaxeLatex(texto: string | null | undefined): string {
  if (!texto) return '';

  let t = String(texto);

  // 1. Multiplicação e pontos medianos TeX: \cdot, \times, \ast
  t = t.replace(/\\cdot\b/g, '·');
  t = t.replace(/\\times\b/g, '×');
  t = t.replace(/\\ast\b/g, '*');

  // 2. Subscritos TeX simples: _{abc} -> _abc (elimina chaves aninhadas antes de processar frações)
  // Executa enquanto houver chaves aninhadas simples _{...}
  for (let i = 0; i < 3; i++) {
    t = t.replace(/_\{([^{}]+)\}/g, '_$1');
  }

  // 3. Sobrescritos numéricos TeX: ^{2} -> ², ^{3} -> ³
  t = t.replace(/\^\{?2\}?/g, '²');
  t = t.replace(/\^\{?3\}?/g, '³');
  t = t.replace(/\^\{?0\}?/g, '⁰');
  t = t.replace(/\^\{?1\}?/g, '¹');
  t = t.replace(/\^\{?4\}?/g, '⁴');
  t = t.replace(/\^\{([^{}]+)\}/g, '^$1');

  // 4. Frações: \frac{a}{b} -> (a / b)
  for (let i = 0; i < 3; i++) {
    t = t.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, '($1 / $2)');
  }

  // 5. Símbolos de desigualdade, letras gregas e raízes
  t = t.replace(/\\(?:ge|geq)\b/g, '≥');
  t = t.replace(/\\(?:le|leq)\b/g, '≤');
  t = t.replace(/\\approx\b/g, '≈');
  t = t.replace(/\\neq\b/g, '≠');
  t = t.replace(/\\pm\b/g, '±');
  t = t.replace(/\\mp\b/g, '∓');
  t = t.replace(/\\infty\b/g, '∞');
  t = t.replace(/\\(?:phi|emptyset)\b/g, 'Ø');
  t = t.replace(/\\Delta\b/g, 'Δ');
  t = t.replace(/\\gamma\b/g, 'γ');
  t = t.replace(/\\sigma\b/g, 'σ');
  t = t.replace(/\\tau\b/g, 'τ');
  t = t.replace(/\\alpha\b/g, 'α');
  t = t.replace(/\\beta\b/g, 'β');
  t = t.replace(/\\theta\b/g, 'θ');
  t = t.replace(/\\lambda\b/g, 'λ');
  t = t.replace(/\\mu\b/g, 'μ');
  t = t.replace(/\\pi\b/g, 'π');
  t = t.replace(/\\sqrt\s*\{([^{}]+)\}/g, '√($1)');

  // 6. Texto TeX interno: \text{abc} ou \mathrm{abc} -> abc
  t = t.replace(/\\(?:text|mathrm|mathbf|mathit)\s*\{([^{}]+)\}/g, '$1');

  // 7. Remoção de delimitadores de equação em bloco ($$ ... $$ ou \[ ... \])
  t = t.replace(/\$\$([^$]+)\$\$/g, '$1');
  t = t.replace(/\\\[([\s\S]+?)\\\]/g, '$1');
  t = t.replace(/\\\(([\s\S]+?)\\\)/g, '$1');

  // 8. Remoção de delimitadores inline ($ ... $)
  t = t.replace(/\$([^$]+)\$/g, '$1');

  // 9. Limpeza de comandos TeX remanescentes e barras invertidas isoladas (preserva quebras \n, \r, \t)
  t = t.replace(/\\(?!n\b|r\b|t\b)([a-zA-Z]{2,})/g, '$1');
  t = t.replace(/\{([^{}]+)\}/g, '$1');

  // 10. Ajustes de padronização tipográfica comum em engenharia
  // k_mod,1 -> kmod,1 (NBR 7190)
  t = t.replace(/k_mod,(\d)/g, 'kmod,$1');
  t = t.replace(/f_ck\b/g, 'fck');
  t = t.replace(/f_yk\b/g, 'fyk');
  t = t.replace(/f_yd\b/g, 'fyd');
  t = t.replace(/f_cd\b/g, 'fcd');
  t = t.replace(/gamma_([a-zA-Z])/g, 'γ$1');
  t = t.replace(/γ_([a-zA-Z])/g, 'γ$1');

  // Normaliza múltiplos espaços
  t = t.replace(/  +/g, ' ');

  return t.trim();
}

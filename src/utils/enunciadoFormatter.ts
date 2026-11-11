/**
 * Utilitário de formatação e diagramação de enunciados de questões de concurso.
 * Converte blocos de texto corrido em layouts com espaçamentos, parágrafos
 * e quebras de linha pertinentes (itens, colunas, assertivas I/II/III, parênteses e comandos finais).
 */

import { limparSintaxeLatex } from './latexSanitizer';

export function formatarEnunciado(texto: string | null | undefined): string {
  if (!texto) return '';

  // 1. Normaliza quebras de linha existentes e caracteres escapados (\r\n, \n)
  let t = String(texto)
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // 2. Sanitiza qualquer resquício de LaTeX TeX (ex: $k_{mod,1} \cdot k_{mod,2}$)
  t = limparSintaxeLatex(t);

  // 2. Colunas comparativas (ex: "Coluna 1 - Modalidade de SPIQ", "Coluna 2 - Definição Conceitual")
  t = t.replace(
    /(?:^|\s+)(Coluna\s+[1-9IVX]+(?:\s*[-–—:]\s*.*?)?)(?=\s+(?:\d+\.|\([^\)]*\)))/gi,
    '\n\n$1\n'
  );

  // 3. Chamadas de introdução a asserções e itens (ex: "Analise as asserções a seguir...:")
  t = t.replace(
    /(?<=[\.\:\;\n]|^)\s*(Analise as asserções a seguir[^\.:\n]*[:\.])/gi,
    '\n\n$1\n'
  );
  t = t.replace(
    /(?<=[\.\:\;\n]|^)\s*(Analise os itens a seguir[^\.:\n]*[:\.])/gi,
    '\n\n$1\n'
  );
  t = t.replace(
    /(?<=[\.\:\;\n]|^)\s*(Julgue os itens[^\.:\n]*[:\.])/gi,
    '\n\n$1\n'
  );
  t = t.replace(
    /(?<=[\.\:\;\n]|^)\s*(Considere as assertivas[^\.:\n]*[:\.])/gi,
    '\n\n$1\n'
  );
  t = t.replace(
    /(?<=[\.\:\;\n]|^)\s*(Com relação [^\.:\n]*julgue[^\.:\n]*[:\.])/gi,
    '\n\n$1\n'
  );

  // 4. Conectivo de relação de causa e efeito ("PORQUE II. ...", "PORQUANTO II. ...")
  t = t.replace(
    /(?:^|\.\s+|\s+)(PORQUE|PORQUANTO)\s+([I|V|X]+\.\s+[A-ZÀ-Ú])/g,
    '\n\n$1\n\n$2'
  );
  t = t.replace(
    /(?:^|\.\s+|\s+)(PORQUE|PORQUANTO)(?=\s*[\.\:\,])/g,
    '\n\n$1\n\n'
  );

  // 5. Assertivas em algarismos romanos (ex: "I. No planejamento...", "II. As medidas...", "III. O fiscal...")
  t = t.replace(
    /(?<=[\.\:\;\n]|^)\s*([I|V|X]+\.\s+[A-ZÀ-Ú])/g,
    '\n\n$1'
  );

  // 6. Itens numerados em listas e colunas (ex: " 1. Restrição...", " 2. Retenção...", " 3. Posicionamento...")
  t = t.replace(
    /(?<=\S)\s+([1-9]\.\s+[A-ZÀ-Ú])/g,
    '\n$1'
  );

  // 7. Parênteses de associação de colunas (ex: "( ) Sistema...", "(  ) Sistema...")
  t = t.replace(
    /(?<=\S)\s+(\(\s*[xXvVfF]?\s*\)\s+[A-ZÀ-Ú])/g,
    '\n$1'
  );

  // 8. Comandos e perguntas finais da questão (sem consumir pontuação precedente)
  t = t.replace(
    /(?<=[\.\:\;\n]|^)\s*(Assinale a sequência[^\.:\n]*[:\.])/gi,
    '\n\n$1'
  );
  t = t.replace(
    /(?<=[\.\:\;\n]|^)\s*(A respeito dessas asserções[^\.:\n]*[:\.])/gi,
    '\n\n$1'
  );
  t = t.replace(
    /(?<=[\.\:\;\n]|^)\s*(A respeito dos itens[^\.:\n]*[:\.])/gi,
    '\n\n$1'
  );
  t = t.replace(
    /(?<=[\.\:\;\n]|^)\s*(Assinale a opção correta[:\.])/gi,
    '\n\n$1'
  );
  t = t.replace(
    /(?<=[\.\:\;\n]|^)\s*(Assinale a alternativa (?:correta|incorreta)[:\.])/gi,
    '\n\n$1'
  );
  t = t.replace(
    /(?<=[\.\:\;\n]|^)\s*((?:Está|É) correto o que se afirma[^\.:\n]*[:\.])/gi,
    '\n\n$1'
  );
  t = t.replace(
    /(?<=[\.\:\;\n]|^)\s*(Com base no exposto[^\.:\n]*[:\.])/gi,
    '\n\n$1'
  );
  t = t.replace(
    /(?<=[\.\:\;\n]|^)\s*(Diante do exposto[^\.:\n]*[:\.])/gi,
    '\n\n$1'
  );
  t = t.replace(
    /(?<=[\.\:\;\n]|^)\s*(Considerando a situação hipotética[^\.:\n]*[:\.])/gi,
    '\n\n$1'
  );

  // 9. Parágrafos narrativos contextualizados (transições após ponto final)
  t = t.replace(
    /\.\s+(Ao notificar|Diante diss[oa]|Nesse contexto|Em face diss[oa]|Nessa situação|Sob essa ótica|Com base ness[ae])/g,
    '.\n\n$1'
  );

  // 10. Limpeza e normalização final de quebras consecutivas e espaçamentos
  const linhasLimpas = t
    .split('\n')
    .map((l) => l.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return linhasLimpas;
}

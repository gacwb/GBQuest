import {
  LETRAS_ALTERNATIVAS,
  limparPrefixoAlternativa,
  atualizarComentarioGabarito,
  reembaralharAlternativasQuestao,
} from './gabaritoRandomizer';

/**
 * Interface universal com 5 dimensões numéricas mensuráveis que definem
 * o estilo e DNA de qualquer banca examinadora.
 */
export interface PerfilDnaBanca {
  id: string;
  nome: string;
  sigla: string;

  // 1. Matriz de Tipologia (%) — Soma das porcentagens = 100%
  distribuicaoTipologias: {
    diretaPositiva: number;       // Múltipla escolha tradicional ("assinale a alternativa CORRETA")
    assertivasItens: number;      // Proposições numeradas I, II, III, IV ("Está CORRETO o que se afirma em:")
    comandoNegativo: number;      // Comandos com "EXCETO" ou "NÃO"
    preenchimentoLacunas: number; // Enunciado com lacunas pontilhadas _______
    verdadeiroOuFalso: number;    // Proposições com parênteses (__) e sequências V/F
    assercaoRazao: number;        // Duas proposições técnicas ligadas por "PORQUE"
  };

  // 2. Extensão Textual Máxima
  extensaoTexto: {
    enunciadoMaxLinhas: number;   // Máximo de linhas recomendadas para o enunciado
    alternativasMaxLinhas: number;// Máximo de linhas por alternativa (1 a 2 linhas)
    mediaPalavrasPorAlternativa: number; // Média de palavras por alternativa
  };

  // 3. Critérios de Exigência e Conteúdo
  exigencia: {
    calculosNumericosPct: number; // % de questões com cálculos (0 = Zero contas, 100% conceitual)
    literalidadeLeiPct: number;   // Grau de apego à letra da lei e NBRs (0 a 100)
    casosPraticosRotinaPct: number; // % de questões com abertura contextualizada na rotina do cargo
  };

  // 4. Engenharia de Distratores (Pesos de 1 a 5 para armadilhas da banca)
  distratores: {
    trocaPrazosValores: number;   // Alteração de prazos e índices numéricos
    inversaoSentidoNorma: number; // "permitido" vs "vedado", "obrigatório" vs "facultativo"
    adverbiosAbsolutos: number;   // "sempre", "nunca", "exclusivamente", "em qualquer hipótese"
    confusaoConceitosVizinhos: number; // Troca entre termos da mesma norma (ex: Anamnese vs Vistoria)
  };

  // 5. Formatação Visual de Prova
  formatacao: {
    destaqueComandoCaixaAlta: boolean; // Forçar CORRETA, INCORRETA, EXCETO, NÃO em caixa alta
    aberturaContextualizadaCargo: boolean; // "Em meio à vistoria técnica...", "Como Engenheiro da SESA..."
  };
}

/**
 * PERFIL PARAMÉTRICO OFICIAL DA FUNDAÇÃO FAFIPA
 * Calibrado a partir da análise empírica das 100 questões das provas reais
 * PARANAEDUCAÇÃO e SESA (Engenheiro Civil - Curitiba).
 */
export const PERFIL_FAFIPA_CURITIBA: PerfilDnaBanca = {
  id: 'fafipa-curitiba-eng-civil',
  nome: 'Fundação FAFIPA — Prefeitura de Curitiba (Engenheiro Civil)',
  sigla: 'FAFIPA',
  distribuicaoTipologias: {
    diretaPositiva: 55,       // 22 questões em 40 (55% da prova real)
    assertivasItens: 18,      // 7 questões em 40 (18% da prova real)
    comandoNegativo: 12,      // 5 questões em 40 (12% da prova real)
    preenchimentoLacunas: 8,  // 3 questões em 40 (8% da prova real)
    verdadeiroOuFalso: 7,     // 3 questões em 40 (7% da prova real)
    assercaoRazao: 0,         // 0 questões na prova real da FAFIPA
  },
  extensaoTexto: {
    enunciadoMaxLinhas: 4,
    alternativasMaxLinhas: 2,
    mediaPalavrasPorAlternativa: 15,
  },
  exigencia: {
    calculosNumericosPct: 0,  // ZERO CÁLCULOS nas questões específicas de Engenharia Civil e Legislação
    literalidadeLeiPct: 85,
    casosPraticosRotinaPct: 65,
  },
  distratores: {
    trocaPrazosValores: 5,
    inversaoSentidoNorma: 5,
    adverbiosAbsolutos: 4,
    confusaoConceitosVizinhos: 5,
  },
  formatacao: {
    destaqueComandoCaixaAlta: true,
    aberturaContextualizadaCargo: true,
  },
};

/**
 * Perfis de comparação universais demonstrando a replicabilidade do framework
 */
export const PERFIL_FCC_ENGENHARIA: PerfilDnaBanca = {
  id: 'fcc-engenharia',
  nome: 'Fundação Carlos Chagas (FCC)',
  sigla: 'FCC',
  distribuicaoTipologias: {
    diretaPositiva: 60,
    assertivasItens: 20,
    comandoNegativo: 5,
    preenchimentoLacunas: 5,
    verdadeiroOuFalso: 0,
    assercaoRazao: 10,
  },
  extensaoTexto: {
    enunciadoMaxLinhas: 6,
    alternativasMaxLinhas: 3,
    mediaPalavrasPorAlternativa: 25,
  },
  exigencia: {
    calculosNumericosPct: 25,
    literalidadeLeiPct: 70,
    casosPraticosRotinaPct: 50,
  },
  distratores: {
    trocaPrazosValores: 4,
    inversaoSentidoNorma: 4,
    adverbiosAbsolutos: 3,
    confusaoConceitosVizinhos: 4,
  },
  formatacao: {
    destaqueComandoCaixaAlta: false,
    aberturaContextualizadaCargo: true,
  },
};

export const PERFIL_FGV_ENGENHARIA: PerfilDnaBanca = {
  id: 'fgv-engenharia',
  nome: 'Fundação Getulio Vargas (FGV)',
  sigla: 'FGV',
  distribuicaoTipologias: {
    diretaPositiva: 35,
    assertivasItens: 25,
    comandoNegativo: 10,
    preenchimentoLacunas: 5,
    verdadeiroOuFalso: 5,
    assercaoRazao: 20,
  },
  extensaoTexto: {
    enunciadoMaxLinhas: 12,
    alternativasMaxLinhas: 4,
    mediaPalavrasPorAlternativa: 40,
  },
  exigencia: {
    calculosNumericosPct: 40,
    literalidadeLeiPct: 40,
    casosPraticosRotinaPct: 80,
  },
  distratores: {
    trocaPrazosValores: 3,
    inversaoSentidoNorma: 4,
    adverbiosAbsolutos: 4,
    confusaoConceitosVizinhos: 5,
  },
  formatacao: {
    destaqueComandoCaixaAlta: false,
    aberturaContextualizadaCargo: true,
  },
};

export const CATALAGO_BANCAS: Record<string, PerfilDnaBanca> = {
  fafipa: PERFIL_FAFIPA_CURITIBA,
  fcc: PERFIL_FCC_ENGENHARIA,
  fgv: PERFIL_FGV_ENGENHARIA,
};

export type TipoQuestaoFafipa =
  | 'direta_positiva'
  | 'assertivas_itens'
  | 'comando_negativo'
  | 'preenchimento_lacunas'
  | 'verdadeiro_ou_falso';

export interface CotasTipologiaSimulado {
  diretaPositiva: number;
  assertivasItens: number;
  comandoNegativo: number;
  preenchimentoLacunas: number;
  verdadeiroOuFalso: number;
  assercaoRazao: number;
  total: number;
}

/**
 * Calcula a quantidade exata de cada tipologia para fechar rigorosamente o total de questões
 * utilizando o método dos maiores restos.
 */
export function calcularCotasTipologia(
  perfil: PerfilDnaBanca = PERFIL_FAFIPA_CURITIBA,
  totalQuestoes: number = 40
): CotasTipologiaSimulado {
  const dist = perfil.distribuicaoTipologias;
  const rawDireta = (dist.diretaPositiva / 100) * totalQuestoes;
  const rawItens = (dist.assertivasItens / 100) * totalQuestoes;
  const rawNegativa = (dist.comandoNegativo / 100) * totalQuestoes;
  const rawLacunas = (dist.preenchimentoLacunas / 100) * totalQuestoes;
  const rawVF = (dist.verdadeiroOuFalso / 100) * totalQuestoes;
  const rawAssercao = ((dist.assercaoRazao || 0) / 100) * totalQuestoes;

  // Pisos inteiros
  let direta = Math.floor(rawDireta);
  let itens = Math.floor(rawItens);
  let negativa = Math.floor(rawNegativa);
  let lacunas = Math.floor(rawLacunas);
  let vf = Math.floor(rawVF);
  let assercao = Math.floor(rawAssercao);

  let soma = direta + itens + negativa + lacunas + vf + assercao;
  let resto = totalQuestoes - soma;

  // Fracionários para desempate
  const fracionarios = [
    { key: 'direta', val: rawDireta - direta },
    { key: 'itens', val: rawItens - itens },
    { key: 'negativa', val: rawNegativa - negativa },
    { key: 'lacunas', val: rawLacunas - lacunas },
    { key: 'vf', val: rawVF - vf },
    { key: 'assercao', val: rawAssercao - assercao },
  ].sort((a, b) => b.val - a.val);

  let idx = 0;
  while (resto > 0 && idx < fracionarios.length) {
    const k = fracionarios[idx].key;
    if (k === 'direta') direta++;
    else if (k === 'itens') itens++;
    else if (k === 'negativa') negativa++;
    else if (k === 'lacunas') lacunas++;
    else if (k === 'vf') vf++;
    else if (k === 'assercao') assercao++;
    resto--;
    idx++;
  }

  return {
    diretaPositiva: direta,
    assertivasItens: itens,
    comandoNegativo: negativa,
    preenchimentoLacunas: lacunas,
    verdadeiroOuFalso: vf,
    assercaoRazao: assercao,
    total: direta + itens + negativa + lacunas + vf + assercao,
  };
}

/**
 * MOTOR DE BALANCEAMENTO UNIFORME DE GABARITO (LOTE COMPLETO)
 *
 * Elimina de forma definitiva o vício comum de IAs que concentram alternativas em A e B.
 * Para N questões (ex: 40), gera uma cota exata (ex: 40/5 = exatamente 8 por letra A, B, C, D, E),
 * embaralha via Fisher-Yates com filtro anti-sequência tripla e reembaralha fisicamente
 * as alternativas de cada questão sincronizando o comentário explicativo.
 */
export function balancearGabaritoLoteCompleto<
  T extends { alternativas: string[]; correta: number; comentario?: string; [key: string]: any }
>(questoes: T[], totalAlvo: number = 40): T[] {
  if (!Array.isArray(questoes) || questoes.length === 0) {
    return questoes;
  }

  const n = questoes.length;
  const baseGabarito: number[] = [];

  // Distribui cotas perfeitas de 0 a 4 (A=0, B=1, C=2, D=3, E=4)
  for (let i = 0; i < n; i++) {
    baseGabarito.push(i % 5);
  }

  // Embaralhamento Fisher-Yates
  for (let i = baseGabarito.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = baseGabarito[i];
    baseGabarito[i] = baseGabarito[j];
    baseGabarito[j] = temp;
  }

  // Filtro anti-sequência tripla (evita 3 respostas iguais em sequência)
  for (let i = 2; i < baseGabarito.length; i++) {
    if (baseGabarito[i] === baseGabarito[i - 1] && baseGabarito[i] === baseGabarito[i - 2]) {
      const swapIdx = baseGabarito.findIndex((val, idx) => idx > i && val !== baseGabarito[i]);
      if (swapIdx !== -1) {
        const t = baseGabarito[i];
        baseGabarito[i] = baseGabarito[swapIdx];
        baseGabarito[swapIdx] = t;
      }
    }
  }

  // Aplica o reembaralhamento físico de cada questão
  return questoes.map((q, idx) => {
    const alvoCorreta = baseGabarito[idx];
    return reembaralharAlternativasQuestao(q, alvoCorreta) as T;
  });
}

/**
 * Monta as diretrizes do prompt da IA parametrizadas pelo perfil de DNA da banca.
 */
export function montarInstrucoesDnaBanca(perfil: PerfilDnaBanca = PERFIL_FAFIPA_CURITIBA): string {
  const isZeroCalculos = perfil.exigencia.calculosNumericosPct === 0;

  return `
DIRETRIZES DE ESTILO E DNA DA BANCA (${perfil.nome.toUpperCase()}):
1. ZERO CÁLCULOS NAS QUESTÕES ESPECÍFICAS:
   ${
     isZeroCalculos
       ? `É TERMINANTEMENTE PROIBIDO exigir cálculos matemáticos, contas aritméticas, dimensionamentos numéricos de vigas ou armaduras nas questões de Engenharia Civil e Legislação. O padrão da banca FAFIPA é 100% CONCEITUAL, NORMATIVO E PROCEDIMENTAL. As questões devem cobrar: critérios das NBRs (6118, 6120, 9050, 15575), parâmetros de projeto, definições de patologias da construção, procedimentos de fiscalização de obras e literalidade da Lei 14.133/21.`
       : `Até ${perfil.exigencia.calculosNumericosPct}% das questões podem conter aplicações diretas de fórmulas numéricas.`
   }

2. PROIBIÇÃO ABSOLUTA DE CÓDIGO OU SINTAXE LATEX:
   - É expressamente proibido usar sintaxe LaTeX como delimitadores $, $$, comandos \\cdot, \\times, \\frac, chaves { } ou subscritos de código.
   - Escreva fórmulas, grandezas e índices SEMPRE em texto simples e caracteres Unicode limpos (exemplo: 'kmod = kmod,1 · kmod,2 · kmod,3', 'fck ≥ 25 MPa', 'm²', 'm³', 'kN/m', '±', 'Ø').
   - NUNCA envolva variáveis ou fórmulas entre cifrões ($).

3. EXTENSÃO E CONCISÃO DAS ALTERNATIVAS:
   - As alternativas DEVEM SER CONCISAS (máximo de ${perfil.extensaoTexto.alternativasMaxLinhas} linhas cada, em média ${perfil.extensaoTexto.mediaPalavrasPorAlternativa} palavras).
   - É expressamente proibido redigir parágrafos longos, cansativos e repetitivos nas alternativas. A FAFIPA cobra respostas diretas (ex: termos técnicos pontuais, conceitos precisos ou pequenas orações objetivas).

4. FORMATAÇÃO E TERMOS DE COMANDO EM CAIXA ALTA:
   - Destaque em CAIXA ALTA E NEGRITO as palavras-chave de comando: ${
     perfil.formatacao.destaqueComandoCaixaAlta
       ? '**CORRETA**, **INCORRETA**, **EXCETO**, **NÃO**, **CORRETAMENTE**.'
       : 'segundo a formatação padrão.'
   }
   - Inicie muitas questões com contextualização da rotina do cargo de Engenheiro Civil (ex: "Em meio à vistoria técnica...", "Como responsável técnico pela fiscalização...", "Ao atuar na coordenação de projetos...").

5. ENGENHARIA DE DISTRATORES DA BANCA:
   - Altere sutilmente prazos legais e números da norma (ex: trocar 15 dias por 30 dias).
   - Inverta o sentido jurídico (trocar "independe de autorização" por "depende de prévia autorização", "vedado" por "permitido").
   - Utilize advérbios absolutistas falaciosos nas alternativas incorretas ("sempre", "nunca", "exclusivamente", "em qualquer hipótese").
   - Provoque confusão entre conceitos vizinhos da mesma norma técnica (ex: Anamnese vs Vistoria; Laje Maciça vs Nervurada; SICRO vs SINAPI).
`;
}

/**
 * Tipologias estruturais de questão cobradas no concurso da FAFIPA.
 */
export type TipologiaQuestao =
  | 'DIRETA_POSITIVA'
  | 'ASSERTIVAS_ITENS'
  | 'COMANDO_NEGATIVO'
  | 'PREENCHIMENTO_LACUNAS'
  | 'JULGAMENTO_VF';

/**
 * Gera a grade determinística de 40 slots para a prova FAFIPA - Prefeitura de Curitiba:
 * Exatamente:
 * - 22 'DIRETA_POSITIVA' (55%)
 * - 7 'ASSERTIVAS_ITENS' (18%)
 * - 5 'COMANDO_NEGATIVO' (12%)
 * - 3 'PREENCHIMENTO_LACUNAS' (8%)
 * - 3 'JULGAMENTO_VF' (7%)
 * Total: 40 questões balanceadas entre Português (5Q), Informática (5Q) e Engenharia Civil (30Q).
 */
export function gerarGradeTipologiasFafipa(total: number = 40): TipologiaQuestao[] {
  if (total !== 40) {
    // Proporção proporcional genérica caso mude o tamanho total
    const cotas = calcularCotasTipologia(PERFIL_FAFIPA_CURITIBA, total);
    const lista: TipologiaQuestao[] = [
      ...Array(cotas.diretaPositiva).fill('DIRETA_POSITIVA'),
      ...Array(cotas.assertivasItens).fill('ASSERTIVAS_ITENS'),
      ...Array(cotas.comandoNegativo).fill('COMANDO_NEGATIVO'),
      ...Array(cotas.preenchimentoLacunas).fill('PREENCHIMENTO_LACUNAS'),
      ...Array(cotas.verdadeiroOuFalso).fill('JULGAMENTO_VF'),
    ];
    return lista.slice(0, total);
  }

  // Distribuição homogênea por bloco para a prova real de 40 questões:
  // Bloco 1 (Português, Q01 a Q05 - 5Q): 3 Diretas, 1 Negativa, 1 Assertiva
  const blocoPortugues: TipologiaQuestao[] = [
    'DIRETA_POSITIVA',
    'COMANDO_NEGATIVO',
    'DIRETA_POSITIVA',
    'ASSERTIVAS_ITENS',
    'DIRETA_POSITIVA',
  ];

  // Bloco 2 (Informática, Q06 a Q10 - 5Q): 3 Diretas, 1 Lacunas, 1 V/F
  const blocoInformatica: TipologiaQuestao[] = [
    'DIRETA_POSITIVA',
    'PREENCHIMENTO_LACUNAS',
    'DIRETA_POSITIVA',
    'JULGAMENTO_VF',
    'DIRETA_POSITIVA',
  ];

  // Bloco 3 (Engenharia Civil e Legislação, Q11 a Q40 - 30Q):
  // 16 Diretas, 6 Assertivas, 4 Negativas, 2 Lacunas, 2 V/F
  // Somando: Diretas (3+3+16=22), Assertivas (1+0+6=7), Negativas (1+0+4=5), Lacunas (0+1+2=3), V/F (0+1+2=3) = 40Q!
  const blocoEngenharia: TipologiaQuestao[] = [
    'DIRETA_POSITIVA',
    'ASSERTIVAS_ITENS',
    'DIRETA_POSITIVA',
    'COMANDO_NEGATIVO',
    'DIRETA_POSITIVA',
    'PREENCHIMENTO_LACUNAS',
    'DIRETA_POSITIVA',
    'JULGAMENTO_VF',
    'ASSERTIVAS_ITENS',
    'DIRETA_POSITIVA',
    'COMANDO_NEGATIVO',
    'DIRETA_POSITIVA',
    'ASSERTIVAS_ITENS',
    'DIRETA_POSITIVA',
    'PREENCHIMENTO_LACUNAS',
    'DIRETA_POSITIVA',
    'JULGAMENTO_VF',
    'DIRETA_POSITIVA',
    'ASSERTIVAS_ITENS',
    'COMANDO_NEGATIVO',
    'DIRETA_POSITIVA',
    'ASSERTIVAS_ITENS',
    'DIRETA_POSITIVA',
    'COMANDO_NEGATIVO',
    'DIRETA_POSITIVA',
    'ASSERTIVAS_ITENS',
    'DIRETA_POSITIVA',
    'DIRETA_POSITIVA',
    'DIRETA_POSITIVA',
    'DIRETA_POSITIVA',
  ];

  return [...blocoPortugues, ...blocoInformatica, ...blocoEngenharia];
}

/**
 * Monta o molde estrutural obrigatório para ser injetado no prompt da IA para cada questão.
 */
export function montarInstrucaoMoldeTipologia(tipologia: TipologiaQuestao): string {
  switch (tipologia) {
    case 'ASSERTIVAS_ITENS':
      return `
[ESTRUTURA OBRIGATÓRIA DA QUESTÃO: FORMATO ASSERTIVAS NUMERADAS (I, II, III)]:
- O enunciado DEVE apresentar de 2 a 4 assertivas ou proposições técnicas numeradas em algarismos romanos:
  "I. Primeira afirmação técnica ou normativa..."
  "II. Segunda afirmação técnica ou normativa..."
  "III. Terceira afirmação técnica ou normativa..."
- O comando final da questão DEVE ser: "É correto o que se afirma em:" ou "Está correto o que se afirma apenas em:".
- As 5 alternativas (A, B, C, D, E) DEVEM ser combinações de itens (ex: A) I e II. B) II e III. C) I e III. D) I, II e III. E) Apenas I.).
- É PROIBIDO gerar múltipla escolha comum nesta questão.`;

    case 'COMANDO_NEGATIVO':
      return `
[ESTRUTURA OBRIGATÓRIA DA QUESTÃO: FORMATO COMANDO NEGATIVO (EXCETO / INCORRETA)]:
- O comando da questão DEVE obrigatoriamente conter a palavra em CAIXA ALTA E NEGRITO exigindo a alternativa errada:
  Exemplos de comando: "Assinale a alternativa INCORRETA:", "Assinale a opção que NÃO está de acordo com a norma:", ou "...EXCETO:".
- Quatro das 5 alternativas DEVEM ser afirmações verdadeiras e conformes com a norma.
- Apenas UMA alternativa (o gabarito correto da questão) DEVE conter o erro normativo ou técnico sutil.
- É PROIBIDO pedir a opção correta nesta questão.`;

    case 'PREENCHIMENTO_LACUNAS':
      return `
[ESTRUTURA OBRIGATÓRIA DA QUESTÃO: FORMATO PREENCHIMENTO DE LACUNAS]:
- O texto do enunciado DEVE conter de 1 a 3 lacunas demarcadas por travessões: "________".
- O comando final DEVE ser: "Assinale a alternativa que preenche, correta e respectivamente, as lacunas acima:".
- As 5 alternativas (A, B, C, D, E) DEVEM ser listas de termos ou valores separados por travessão (ex: "A) vistoria prévia – 30 dias – fiscalização").
- É PROIBIDO gerar questão sem lacunas nesta vaga.`;

    case 'JULGAMENTO_VF':
      return `
[ESTRUTURA OBRIGATÓRIA DA QUESTÃO: FORMATO VERDADEIRO OU FALSO (V / F)]:
- O enunciado DEVE apresentar de 3 a 4 sentenças precedidas por parênteses vazios:
  "(__) Primeira afirmativa técnica..."
  "(__) Segunda afirmativa técnica..."
  "(__) Terceira afirmativa técnica..."
- O comando final DEVE ser: "Assinale a alternativa que apresenta a sequência CORRETA de cima para baixo:".
- As 5 alternativas (A, B, C, D, E) DEVEM ser sequências das letras V e F (ex: A) V – F – V – F. B) F – V – V – F. C) V – V – F – F. D) F – F – V – V. E) V – F – F – V.).
- É PROIBIDO gerar múltipla escolha tradicional nesta questão.`;

    case 'DIRETA_POSITIVA':
    default:
      return `
[ESTRUTURA OBRIGATÓRIA DA QUESTÃO: FORMATO DIRETO POSITIVO (ESCOLHER A VERDADEIRA)]:
- Enunciado claro contextualizado com a rotina de Engenharia Civil e comando: "Assinale a alternativa CORRETA:".
- Alternativas curtas, precisas e objetivas (máximo de 2 linhas cada).`;
  }
}

/**
 * Classifica a tipologia de uma questão existente no banco de dados através de análise textual heurística.
 */
export function classificarTipologiaQuestao(q: {
  enunciado?: string | null;
  alternativas?: string[] | null;
}): TipologiaQuestao {
  const en = String(q?.enunciado || '');
  const alts = Array.isArray(q?.alternativas) ? q.alternativas.join(' ') : '';
  const textoCompleto = en + ' ' + alts;

  // 1. Verdadeiro ou Falso: parênteses (__) ou sequências V-F nas alternativas
  if (
    /(\(\s*__\s*\)|\(\s*\))/i.test(en) &&
    (/[VF]\s*[-–—]\s*[VF]/i.test(textoCompleto) || /verdadeiro.*falso/i.test(en))
  ) {
    return 'JULGAMENTO_VF';
  }

  // 2. Preenchimento de Lacunas: travessões contínuos ou menção explícita a lacunas
  if (/_{3,}/.test(en) || /preenche.*lacuna/i.test(en)) {
    return 'PREENCHIMENTO_LACUNAS';
  }

  // 3. Comandos Negativos: INCORRETA, EXCETO, NÃO em comando
  if (
    /assinale.*(?:INCORRET|EXCETO)/i.test(en) ||
    /(?:NÃO|NAO)\s+(?:é|se|constitui|apresenta|corresponde)/i.test(en) ||
    /alternativa\s+que\s+(?:NÃO|NAO)/i.test(en)
  ) {
    return 'COMANDO_NEGATIVO';
  }

  // 4. Assertivas com Itens Numerados: I., II., III. e comando de combinação
  if (
    /(?:I\.|II\.|III\.)/.test(en) &&
    (/(?:está|é) correto o que se afirma/i.test(en) ||
      /(?:estão|estao) corretas/i.test(en) ||
      /I e II/i.test(alts) ||
      /apenas I/i.test(alts))
  ) {
    return 'ASSERTIVAS_ITENS';
  }

  // 5. Caso padrão: Direta Positiva
  return 'DIRETA_POSITIVA';
}

/**
 * Níveis de dificuldade exigidos na prova FAFIPA:
 * - FACIL: 40% (Conceitos basilares, regras gerais, distratores claramente distintos, zero pegadinhas).
 * - MEDIA: 40% (Aplicação prática situacional, distratores plausíveis da mesma norma, atenção moderada).
 * - CASCUDA: 20% (Exceções normativas, distratores cirúrgicos de 1 palavra, itens romanos complexos, zero cálculos).
 */
export type DificuldadeQuestao = 'FACIL' | 'MEDIA' | 'CASCUDA';

/**
 * Gera a grade determinística de 40 dificuldades para a prova FAFIPA:
 * Rigorosamente:
 * - 16 Fáceis (40%)
 * - 16 Médias (40%)
 * - 8 Cascudas (20%)
 * Distribuídas proporcionalmente em cada grupo:
 * - Português (5Q): 2 Fáceis (40%), 2 Médias (40%), 1 Cascuda (20%)
 * - Informática (5Q): 2 Fáceis (40%), 2 Médias (40%), 1 Cascuda (20%)
 * - Engenharia Civil (30Q): 12 Fáceis (40%), 12 Médias (40%), 6 Cascudas (20%)
 */
export function gerarGradeDificuldadeFafipa(total: number = 40): DificuldadeQuestao[] {
  if (total !== 40) {
    const qtdCascuda = Math.round(total * 0.2);
    const qtdFacil = Math.round(total * 0.4);
    const qtdMedia = total - qtdCascuda - qtdFacil;
    return [
      ...Array(qtdFacil).fill('FACIL'),
      ...Array(qtdMedia).fill('MEDIA'),
      ...Array(qtdCascuda).fill('CASCUDA'),
    ].slice(0, total);
  }

  // Bloco 1: Língua Portuguesa (5Q): 2 Fáceis, 2 Médias, 1 Cascuda
  const blocoPortugues: DificuldadeQuestao[] = [
    'FACIL',
    'MEDIA',
    'FACIL',
    'MEDIA',
    'CASCUDA',
  ];

  // Bloco 2: Noções de Informática (5Q): 2 Fáceis, 2 Médias, 1 Cascuda
  const blocoInformatica: DificuldadeQuestao[] = [
    'FACIL',
    'MEDIA',
    'FACIL',
    'MEDIA',
    'CASCUDA',
  ];

  // Bloco 3: Conhecimentos Específicos de Engenharia Civil e Legislação (30Q):
  // 12 Fáceis (40%), 12 Médias (40%), 6 Cascudas (20%)
  // Distribuição harmoniosa e alternada para ritmo de prova realista
  const blocoEngenharia: DificuldadeQuestao[] = [
    'FACIL',
    'MEDIA',
    'FACIL',
    'CASCUDA',
    'MEDIA',
    'FACIL',
    'MEDIA',
    'CASCUDA',
    'FACIL',
    'MEDIA',
    'FACIL',
    'CASCUDA',
    'MEDIA',
    'FACIL',
    'MEDIA',
    'FACIL',
    'MEDIA',
    'CASCUDA',
    'FACIL',
    'MEDIA',
    'FACIL',
    'CASCUDA',
    'MEDIA',
    'FACIL',
    'MEDIA',
    'CASCUDA',
    'FACIL',
    'MEDIA',
    'FACIL',
    'MEDIA',
  ];

  return [...blocoPortugues, ...blocoInformatica, ...blocoEngenharia];
}

/**
 * Monta o molde de instrução imperativa de dificuldade para ser injetado no prompt da IA.
 */
export function montarInstrucaoMoldeDificuldade(dificuldade: DificuldadeQuestao): string {
  switch (dificuldade) {
    case 'FACIL':
      return `
[NÍVEL DE DIFICULDADE: FÁCIL (Cota Proporcional: 40%)]:
1. CRITÉRIO CONCEITUAL: Foque estritamente nos conceitos basilares, regras gerais canônicas e princípios consolidados da matéria.
2. DISTRATORES PATENTES: As 4 alternativas incorretas DEVEM conter erros conceituais claros, termos absurdos ou definições opostas óbvias, permitindo eliminação rápida por quem estudou o tema.
3. ZERO PEGADINHAS: É PROIBIDO utilizar pegadinhas capciosas, prazos limítrofes, trocas sutis de uma única palavra ou notas de rodapé de difícil acesso.`;

    case 'MEDIA':
      return `
[NÍVEL DE DIFICULDADE: MÉDIO (Cota Proporcional: 40%)]:
1. CRITÉRIO CONCEITUAL: Aplicação prática da norma técnica ou regra procedimental legal em situações situacionais cotidianas do Engenheiro Civil na prefeitura.
2. DISTRATORES PLAUSÍVEIS: As alternativas incorretas DEVEM utilizar conceitos técnicos válidos pertencentes à mesma norma ou contexto vizinho (ex: confundir parâmetros de agressividade ambiental vizinhos na NBR 6118, ou procedimentos de dispensa vs inexigibilidade).
3. ATENÇÃO MODERADA: Exige atenção do candidato a condições normativas de contorno e aplicabilidade.`;

    case 'CASCUDA':
      return `
[NÍVEL DE DIFICULDADE: CASCUDA / ALTA COMPLEXIDADE (Cota Proporcional: 20%)]:
1. CRITÉRIO CONCEITUAL: Exceções normativas expressas da Lei 14.133/21, vedações absolutas de difícil memorização, ou requisitos detalhados de NBRs (6118, 9050, 15575) que diferenciam o candidato de excelência.
2. DISTRATORES CIRÚRGICOS: As alternativas incorretas DEVEM parecer perfeitas e corretas à primeira vista, contendo apenas uma inversão sutil e fina de palavra-chave (ex: "independe de autorização" trocado por "depende de prévia autorização", "ato vinculado" por "ato discricionário", ou troca sutil de prazos limítrofes).
3. ANÁLISE COMBINATÓRIA REFINADA: Quando for no formato de Assertivas (I, II, III), estruture os itens de modo que pelo menos um item apresente uma armadilha fina de exceção, exigindo discernimento avançado para eliminar.
4. ZERO CÁLCULOS MATEMÁTICOS: É TERMINANTEMENTE PROIBIDO exigir contas matemáticas ou aritmética. A alta dificuldade DEVE residir 100% no rigor técnico e na armadilha conceitual.`;
  }
}

/**
 * Classifica a dificuldade de uma questão existente no banco através do histórico de acertos ou análise textual.
 */
export function classificarDificuldadeQuestao(
  q: { enunciado?: string | null; alternativas?: string[] | null },
  respostasHistorico?: { acertou: boolean }[]
): DificuldadeQuestao {
  // Se houver histórico de respostas com pelo menos 2 tentativas:
  if (respostasHistorico && respostasHistorico.length >= 2) {
    const acertos = respostasHistorico.filter((r) => r.acertou).length;
    const taxa = (acertos / respostasHistorico.length) * 100;
    if (taxa <= 50) return 'CASCUDA';
    if (taxa <= 80) return 'MEDIA';
    return 'FACIL';
  }

  // Heurística textual na ausência de histórico suficiente:
  const en = String(q?.enunciado || '');
  const alts = Array.isArray(q?.alternativas) ? q.alternativas.join(' ') : '';
  const texto = en + ' ' + alts;

  // Questões com múltiplos itens romanos, vedações ou exceções tendem a ser cascudas
  if (
    /(?:I\.\s.*II\.\s.*III\.\s.*IV\.)/s.test(en) ||
    /vedado|exceção|ressalvada|exclusivamente/i.test(texto)
  ) {
    return 'CASCUDA';
  }

  // Questões médias: casos situacionais, parâmetros específicos de norma
  if (/NBR|Lei nº|Decreto|fiscalização|critério|parâmetro/i.test(en)) {
    return 'MEDIA';
  }

  // Caso padrão: Fácil
  return 'FACIL';
}

/**
 * ESTRUTURAÇÃO DO SIMULADO OFICIAL FAFIPA PARAMÉTRICA (ORDENAMENTO CANÔNICO)
 *
 * Requisito obrigatório do usuário:
 * - Questões 01 a 05: Língua Portuguesa (5 questões)
 * - Questões 06 a 10: Noções de Informática (5 questões)
 * - Questões 11 a 40: Conhecimentos Específicos de Engenharia Civil (30 questões), aleatórias entre as específicas!
 *
 * Gabarito Rigorosamente Balanceado:
 * - Bloco Português (5Q): 1 A, 1 B, 1 C, 1 D, 1 E
 * - Bloco Informática (5Q): 1 A, 1 B, 1 C, 1 D, 1 E
 * - Bloco Engenharia Civil (30Q): 6 A, 6 B, 6 C, 6 D, 6 E
 * Total da Prova (40Q): exatamente 8 A, 8 B, 8 C, 8 D, 8 E (sem viés para A e B)!
 */
export function estruturarSimuladoOficialOrdenado<
  T extends {
    disciplina?: string;
    assunto?: string;
    alternativas: string[];
    correta: number;
    comentario?: string;
    [key: string]: any;
  }
>(questoes: T[], totalAlvo: number = 40): T[] {
  const ehPortugues = (q: T): boolean => {
    const d = (q.disciplina || '').toLowerCase();
    const a = (q.assunto || '').toLowerCase();
    const t = ((q as any).tipo || '').toLowerCase();
    return (
      t === 'portugues' ||
      d.includes('portug') ||
      a.includes('portug') ||
      a.includes('731') ||
      a.includes('732') ||
      a.includes('gramatica') ||
      a.includes('gramática') ||
      a.includes('interpretacao') ||
      a.includes('interpretação')
    );
  };

  const ehInformatica = (q: T): boolean => {
    const d = (q.disciplina || '').toLowerCase();
    const a = (q.assunto || '').toLowerCase();
    const t = ((q as any).tipo || '').toLowerCase();
    return (
      t === 'informatica' ||
      d.includes('inform') ||
      a.includes('inform') ||
      a.includes('733') ||
      a.includes('734') ||
      a.includes('hardware') ||
      a.includes('windows') ||
      a.includes('office')
    );
  };

  const portuguesList = questoes.filter(ehPortugues);
  const informaticaList = questoes.filter((q) => !ehPortugues(q) && ehInformatica(q));
  const especificasList = questoes.filter((q) => !ehPortugues(q) && !ehInformatica(q));

  // Metas do simulado oficial
  const qtdPort = totalAlvo === 40 ? 5 : Math.max(1, Math.round((totalAlvo * 5) / 40));
  const qtdInfo = totalAlvo === 40 ? 5 : Math.max(1, Math.round((totalAlvo * 5) / 40));
  const qtdEsp = totalAlvo - (qtdPort + qtdInfo);

  // Seleciona as cotas
  const portSlice = portuguesList.slice(0, qtdPort);
  const infoSlice = informaticaList.slice(0, qtdInfo);
  const espSlice = especificasList.slice(0, qtdEsp);

  // Se faltar em alguma categoria por contingência, completa com as restantes
  const usadas = new Set([...portSlice, ...infoSlice, ...espSlice]);
  const reservas = questoes.filter((q) => !usadas.has(q));

  while (portSlice.length < qtdPort && reservas.length > 0) {
    portSlice.push(reservas.shift()!);
  }
  while (infoSlice.length < qtdInfo && reservas.length > 0) {
    infoSlice.push(reservas.shift()!);
  }
  while (espSlice.length < qtdEsp && reservas.length > 0) {
    espSlice.push(reservas.shift()!);
  }

  // Embaralha as 30 específicas aleatoriamente entre si
  for (let i = espSlice.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [espSlice[i], espSlice[j]] = [espSlice[j], espSlice[i]];
  }

  // Balanceia o gabarito de cada bloco garantindo cotas perfeitas
  const portBalanceadas = balancearGabaritoLoteCompleto(portSlice, qtdPort);
  const infoBalanceadas = balancearGabaritoLoteCompleto(infoSlice, qtdInfo);
  const espBalanceadas = balancearGabaritoLoteCompleto(espSlice, qtdEsp);

  return [...portBalanceadas, ...infoBalanceadas, ...espBalanceadas];
}




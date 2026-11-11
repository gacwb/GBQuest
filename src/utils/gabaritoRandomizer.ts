/**
 * Utilitários para distribuição uniforme e aleatória de alternativas corretas (gabaritos).
 * Evita o viés comum de LLMs que concentram ~75% das respostas em B ou apenas em A/B/C.
 */

export const LETRAS_ALTERNATIVAS = ['A', 'B', 'C', 'D', 'E'] as const;

/**
 * Gera um array balanceado e aleatório de índices de gabarito (0 a 4) para N questões.
 * Garante que a frequência de cada alternativa (A, B, C, D, E) difira no máximo em 1.
 */
export function gerarDistribuicaoGabaritoBalanceada(quantidade: number): number[] {
  if (quantidade <= 0) return [];

  const base: number[] = [];
  // Preenche ciclicamente 0, 1, 2, 3, 4
  for (let i = 0; i < quantidade; i++) {
    base.push(i % 5);
  }

  // Fisher-Yates shuffle para garantir aleatoriedade uniforme
  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = base[i];
    base[i] = base[j];
    base[j] = temp;
  }

  // Evita 3 respostas corretas iguais consecutivas se quantidade >= 3
  for (let i = 2; i < base.length; i++) {
    if (base[i] === base[i - 1] && base[i] === base[i - 2]) {
      // Procura um elemento à frente diferente para trocar
      const swapIdx = base.findIndex((val, idx) => idx > i && val !== base[i]);
      if (swapIdx !== -1) {
        const t = base[i];
        base[i] = base[swapIdx];
        base[swapIdx] = t;
      }
    }
  }

  return base;
}

/**
 * Formata as instruções para o prompt da IA com o mapeamento pré-sorteado de gabaritos.
 */
export function formatarInstrucaoDistribuicaoGabarito(distribuicao: number[]): string {
  if (!distribuicao || distribuicao.length === 0) return '';

  const mapeamento = distribuicao
    .map((corretaIdx, i) => {
      const letra = LETRAS_ALTERNATIVAS[corretaIdx] || 'A';
      return `  - Questão ${i + 1}: gabarito na alternativa ${letra} (correta: ${corretaIdx})`;
    })
    .join('\n');

  return `
DISTRIBUIÇÃO UNIFORME E ALEATORIEDADE OBRIGATÓRIA DOS GABARITOS:
Para que a sessão seja realista e imprevisível, é EXPRESSAMENTE OBRIGATÓRIO distribuir a alternativa correta de forma equilibrada entre todas as 5 alternativas (A, B, C, D e E).
É TERMINANTEMENTE PROIBIDO concentrar as respostas corretas na letra B ou apenas nas letras A/B/C.
Siga rigorosamente a seguinte distribuição pré-sorteada para cada questão desta sessão:
${mapeamento}

REGRAS:
1. Em cada questão, coloque a alternativa verdadeira EXATAMENTE na letra indicada acima e defina o campo "correta" com o respectivo índice numérico (0=A, 1=B, 2=C, 3=D, 4=E).
2. O campo "comentario" deve estar 100% coerente com a letra onde você posicionou a alternativa correta.`;
}

/**
 * Limpa o prefixo de letra de uma alternativa (ex: "A) Texto" -> "Texto").
 */
export function limparPrefixoAlternativa(alt: string): string {
  if (!alt) return '';
  return alt.replace(/^[A-E]\)\s*/i, '').trim();
}

/**
 * Ajusta menções à letra do gabarito no comentário explicativo ao trocar de posição.
 */
export function atualizarComentarioGabarito(
  comentario: string,
  letraAntiga: string,
  letraNova: string
): string {
  if (!comentario || letraAntiga === letraNova) return comentario;

  // Substitui "Gabarito: [Letra]" ou "Gabarito [Letra]"
  let novo = comentario.replace(
    new RegExp(`(Gabarito\\s*[:\\-]?\\s*)(${letraAntiga})\\b`, 'gi'),
    `$1${letraNova}`
  );

  // Substitui "Alternativa [Letra] está correta" / "Alternativa [Letra] é a correta"
  novo = novo.replace(
    new RegExp(`(Alternativa\\s+)(${letraAntiga})(\\s+(?:está|é a|correta))`, 'gi'),
    `$1${letraNova}$3`
  );

  // Substitui "Letra [Letra] está correta"
  novo = novo.replace(
    new RegExp(`(Letra\\s+)(${letraAntiga})(\\s+(?:está|é a|correta))`, 'gi'),
    `$1${letraNova}$3`
  );

  return novo;
}

/**
 * Reembaralha as alternativas de uma única questão para posicionar a alternativa correta
 * em um novo índice pré-determinado, preservando o texto e sincronizando os prefixos.
 */
export function reembaralharAlternativasQuestao(
  questao: {
    alternativas: string[];
    correta: number;
    comentario?: string;
    [key: string]: any;
  },
  novoIndiceCorreto: number
): typeof questao {
  if (!Array.isArray(questao.alternativas) || questao.alternativas.length !== 5) {
    return questao;
  }

  const indiceAtual = typeof questao.correta === 'number' ? questao.correta : 0;
  if (indiceAtual === novoIndiceCorreto && novoIndiceCorreto >= 0 && novoIndiceCorreto < 5) {
    // Garante apenas a formatação dos prefixos
    const altsFormatadas = questao.alternativas.map((alt, idx) => {
      const semPrefixo = limparPrefixoAlternativa(alt);
      return `${LETRAS_ALTERNATIVAS[idx]}) ${semPrefixo}`;
    });
    return {
      ...questao,
      alternativas: altsFormatadas,
      correta: novoIndiceCorreto,
    };
  }

  const letraAntiga = LETRAS_ALTERNATIVAS[indiceAtual] || 'A';
  const letraNova = LETRAS_ALTERNATIVAS[novoIndiceCorreto] || 'A';

  // Extrai o conteúdo sem prefixos
  const conteudos = questao.alternativas.map(limparPrefixoAlternativa);
  const conteudoCorreto = conteudos[indiceAtual];
  const conteudosIncorretos = conteudos.filter((_, idx) => idx !== indiceAtual);

  // Monta novas 5 alternativas posicionando o correto no novoIndiceCorreto
  const novosConteudos: string[] = new Array(5);
  novosConteudos[novoIndiceCorreto] = conteudoCorreto;

  let incorretoIdx = 0;
  for (let i = 0; i < 5; i++) {
    if (i !== novoIndiceCorreto) {
      novosConteudos[i] = conteudosIncorretos[incorretoIdx++];
    }
  }

  const novasAlternativas = novosConteudos.map((c, idx) => `${LETRAS_ALTERNATIVAS[idx]}) ${c}`);
  const novoComentario = questao.comentario
    ? atualizarComentarioGabarito(questao.comentario, letraAntiga, letraNova)
    : questao.comentario;

  return {
    ...questao,
    alternativas: novasAlternativas,
    correta: novoIndiceCorreto,
    comentario: novoComentario,
  };
}

/**
 * Valida a lista de questões geradas e, caso haja assimetria/concentração excessiva
 * (ex: muitas em B ou nenhuma em D/E), redistribui os gabaritos para garantir
 * proporção uniforme (~20% por letra) e ordem imprevisível.
 */
export function garantirDistribuicaoUniforme<T extends { alternativas: string[]; correta: number; comentario?: string }>(
  questoes: T[]
): T[] {
  if (!Array.isArray(questoes) || questoes.length <= 1) {
    return questoes;
  }

  const total = questoes.length;
  const contagem = [0, 0, 0, 0, 0];
  questoes.forEach((q) => {
    const idx = typeof q.correta === 'number' && q.correta >= 0 && q.correta <= 4 ? q.correta : 0;
    contagem[idx]++;
  });

  // Cada letra (A=0, B=1, C=2, D=3, E=4) deve ter cota exata entre floor(total/5) e ceil(total/5)
  // Ex: para 5Q -> exatamente 1 de cada; 10Q -> exatamente 2 de cada; 20Q -> exatamente 4 de cada.
  const minEsperado = Math.floor(total / 5);
  const maxEsperado = Math.ceil(total / 5);
  const estaPerfeitamenteUniforme = contagem.every(
    (c) => c >= minEsperado && c <= maxEsperado
  );

  let temSequenciaTripla = false;
  for (let i = 2; i < total; i++) {
    if (questoes[i].correta === questoes[i - 1].correta && questoes[i].correta === questoes[i - 2].correta) {
      temSequenciaTripla = true;
      break;
    }
  }

  // Se a distribuição já estiver perfeitamente uniforme e sem trincas, apenas formata prefixos
  if (estaPerfeitamenteUniforme && !temSequenciaTripla) {
    return questoes.map((q) => {
      const idx = typeof q.correta === 'number' && q.correta >= 0 && q.correta < 5 ? q.correta : 0;
      return reembaralharAlternativasQuestao(q, idx) as T;
    });
  }

  // Gera uma meta de distribuição perfeitamente balanceada e reembaralha todas as alternativas
  const distribuicaoAlvo = gerarDistribuicaoGabaritoBalanceada(total);

  return questoes.map((q, idx) => {
    const alvoCorreta = distribuicaoAlvo[idx];
    return reembaralharAlternativasQuestao(q, alvoCorreta) as T;
  });
}

import { TABELA_PDFS_ESTUDO, ItemPdfEstudo } from './simuladoPonderado';

export interface EscopoResultado {
  noEscopo: boolean;
  motivoForaEscopo?: string;
  blocoNome: string;
  blocoNumero: number;
  assuntoOficial: string;
  codigoPdf?: string;
}

// Lista de palavras e temas explicitamente fora do escopo do concurso (ex: Prefeitura de Curitiba - Engenheiro Civil)
const TEMAS_FORA_DO_ESCOPO: { padrao: RegExp; motivo: string }[] = [
  { padrao: /\bmatem[aá]tica\s*(b[aá]sica|financeira)?\b/i, motivo: 'Matemática Básica não é cobrada no edital' },
  { padrao: /\b(regra de tr[eê]s|juros simples|juros compostos|fra[cç][oõ]es|porcentagem b[aá]sica)\b/i, motivo: 'Matemática Básica / Financeira fora do edital' },
  { padrao: /\bracioc[ií]nio\s*l[oó]gico\s*(matem[aá]tico)?\b/i, motivo: 'RLM genérico não consta no edital' },
  { padrao: /\b(biologia|qu[ií]mica geral|f[ií]sica b[aá]sica)\b/i, motivo: 'Ciências da Natureza geral fora do edital' },
  { padrao: /\bhist[oó]ria\s*(geral|do brasil)?\b/i, motivo: 'História geral fora do edital' },
  { padrao: /\bgeografia\s*(geral|do brasil)?\b/i, motivo: 'Geografia geral fora do edital' },
  { padrao: /\b(atualidades|conhecimentos gerais da cidade)\b/i, motivo: 'Atualidades genéricas fora do edital' },
];

/**
 * Normaliza texto para correspondência fonética e semântica
 */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Mapeamento e verificação rigorosa se uma questão pertence ao escopo oficial do concurso
 */
export function verificarEscopoQuestao(
  disciplina: string = '',
  assunto: string = '',
  enunciado: string = ''
): EscopoResultado {
  const discNorm = normalizar(disciplina);
  const assNorm = normalizar(assunto);
  const enunNorm = normalizar(enunciado);
  const textoCombinado = `${discNorm} ${assNorm} ${enunNorm.slice(0, 300)}`;

  // 1. Verifica se cai em algum tema explicitamente fora do escopo
  for (const tema of TEMAS_FORA_DO_ESCOPO) {
    if (tema.padrao.test(discNorm) || tema.padrao.test(assNorm)) {
      return {
        noEscopo: false,
        motivoForaEscopo: tema.motivo,
        blocoNome: 'Fora do Escopo',
        blocoNumero: 0,
        assuntoOficial: assunto || 'Fora do Edital',
      };
    }
  }

  // 2. Tenta encontrar correspondência direta com os 34 PDFs / Assuntos Oficiais do Edital
  let melhorPdf: ItemPdfEstudo | null = null;
  let melhorScore = 0;

  // Dicionário de termos técnicos específicos de engenharia civil, informática e português
  const REGRAS_ESPECIFICAS_MATERIA: { regex: RegExp; codigo: string; bonus: number }[] = [
    // Bloco 3
    { regex: /\b(teoria das estruturas|classes? de carregamento|carregamentos?|a[cç][oõ]es|rea[cç][oõ]es de apoio|esfor[cç]os solicitantes|momento fletor|for[cç]a cortante|cisalhamento|nbr 6120|nbr 8681|linhas? de influ[eê]ncia|treli[cç]as?|p[oó]rticos?|vigas? cont[ií]nuas?|diagramas? de esfor[cç]os|estabilidade das estruturas)\b/i, codigo: '314', bonus: 35 },
    { regex: /\b(concreto armado|nbr 6118|fck|armadura (longitudinal|transversal)|estribos?|cobrimento (m[ií]nimo|nominal)|ancoragem de armadura|fissura[cç][aã]o do concreto|estado limite [uú]ltimo|elu|els)\b/i, codigo: '315', bonus: 35 },
    { regex: /\b(materiais de constru[cç][aã]o|cimento portland|agregados?|brita|areia|ensaio de abatimento|slump test|nbr 12655|tra[cç]o de concreto|adi[cç][oõ]es minerais|pozolana|s[ií]lica)\b/i, codigo: '311', bonus: 30 },
    { regex: /\b(canteiro de obras|t[eé]cnicas construtivas|alvenaria estrutural|argamassas?|revestimento cer[aâ]mico|chapisco|embo[cç]o|reboco|nbr 16868)\b/i, codigo: '312', bonus: 30 },
    { regex: /\b(f[oó]rmas?|escoramento|desforma|lajes? (maci[cç]as?|nervuradas?|protendidas?)|coberturas?|telhados?|impermeabiliza[cç][aã]o|mantas? asf[aá]lticas?)\b/i, codigo: '313', bonus: 30 },
    { regex: /\b(estruturas? met[aá]licas?|a[cç]o estrutural|nbr 8800|perfis met[aá]licos|liga[cç][oõ]es soldadas|parafusadas|estruturas? de madeira|nbr 7190)\b/i, codigo: '316', bonus: 30 },

    // Bloco 4
    { regex: /\b(geologia|mec[aâ]nica dos solos|limites? de atterberg|plasticidade|liquidez|granulometria|compacta[cç][aã]o proctor|permeabilidade do solo|tens[oõ]es no solo)\b/i, codigo: '417', bonus: 30 },
    { regex: /\b(investiga[cç][aã]o geot[eé]cnica|sondagem a percuss[aã]o|spt|funda[cç][oõ]es? superficiais?|sapatas?|radiers?|blocos? de funda[cç][aã]o|capacidade de carga)\b/i, codigo: '418', bonus: 30 },
    { regex: /\b(funda[cç][oõ]es? profundas?|estacas? (h[eé]lice cont[ií]nua|pr[eé]-moldadas?|strauss|frankie|raiz)|tubul[oõ]es?|taludes?|conten[cç][oõ]es?|muros? de arrimo|estabilidade de taludes)\b/i, codigo: '419', bonus: 30 },
    { regex: /\b(hidrologia|c[aá]lculo de vaz[aã]o|bacia hidrogr[aá]fica|chuva de projeto|tempo de concentra[cç][aã]o|m[eé]todo racional|per[ií]odo de retorno)\b/i, codigo: '420', bonus: 30 },
    { regex: /\b(drenagem urbana|galerias? pluviais?|bocas? de lobo|po[cç]os? de visita|bueiros?|sarjetas?|condutos for[cç]ados|escoamento superficial)\b/i, codigo: '421', bonus: 30 },
    { regex: /\b(estradas?|rodovias?|infraestrutura urbana|pavimenta[cç][aã]o|cbuq|asfalto|subleito|base e sub-base|dimensionamento de pavimentos|terraplenagem)\b/i, codigo: '422', bonus: 30 },

    // Bloco 5
    { regex: /\b(abastecimento de [aá]gua|eta|esta[cç][aã]o de tratamento de [aá]gua|rede de distribui[cç][aã]o de [aá]gua|capta[cç][aã]o|adu[cç][aã]o|clora[cç][aã]o|coagula[cç][aã]o)\b/i, codigo: '523', bonus: 30 },
    { regex: /\b(esgotamento sanit[aá]rio|ete|esta[cç][aã]o de tratamento de esgoto|rede coletora de esgoto|lodos ativados|lagoas de estabiliza[cç][aã]o|fossa s[eé]ptica|sumidouro)\b/i, codigo: '524', bonus: 30 },
    { regex: /\b(res[ií]duos s[oó]lidos|pgrcc|conama 307|entulho|impactos ambientais|eia|rima|licenciamento ambiental|reciclagem de res[ií]duos)\b/i, codigo: '525', bonus: 30 },
    { regex: /\b(acessibilidade|nbr 9050|rampas|desenho universal|desempenho|nbr 15575|vida [uú]til de projeto|conforto ac[uú]stico|t[eé]rmico)\b/i, codigo: '526', bonus: 30 },

    // Bloco 6
    { regex: /\b(patologia das constru[cç][oõ]es|fissuras?|trincas?|carbonata[cç][aã]o|efloresc[eê]ncia|corros[aã]o de armaduras?|desagrega[cç][aã]o|infiltra[cç][aã]o)\b/i, codigo: '627', bonus: 30 },
    { regex: /\b(seguran[cç]a em obras|nr[\s-]*18|nr[\s-]*35|trabalho em altura|pcmat|pgr|epi|epc|andaimes?|guarda-corpo)\b/i, codigo: '628', bonus: 30 },
    { regex: /\b(vistorias?|per[ií]cias?|nbr 13752|laudo pericial|vistoria cautelar|art|anota[cç][aã]o de responsabilidade t[eé]cnica|documenta[cç][aã]o de obras)\b/i, codigo: '629', bonus: 30 },
    { regex: /\b(avalia[cç][aã]o de im[oó]veis|nbr 14653|m[eé]todo comparativo direto|deprecia[cç][aã]o ross-heidecke|grau de fundamenta[cç][aã]o|precis[aã]o)\b/i, codigo: '630', bonus: 30 },

    // Bloco 7
    { regex: /\b(compreens[aã]o|interpreta[cç][aã]o de textos?|sem[aâ]ntica|significado|sin[oô]nimos?|ant[oô]nimos?|coes[aã]o|coer[eê]ncia|g[eê]nero textual)\b/i, codigo: '731', bonus: 30 },
    { regex: /\b(gram[aá]tica|concord[aâ]ncia|reg[eê]ncia|crase|pontua[cç][aã]o|morfossintaxe|classes de palavras|pronomes?|ora[cç][oõ]es?|sintaxe|acentua[cç][aã]o|ortografia)\b/i, codigo: '732', bonus: 30 },
    { regex: /\b(sistema operacional|windows|arquivos|pastas|hardware|mem[oó]ria|cpu|disco r[ií]gido|painel de controle|extens[oõ]es de arquivos)\b/i, codigo: '733', bonus: 30 },
    { regex: /\b(excel|word|powerpoint|planilhas?|f[oó]rmulas?|navegadores?|correio eletr[oô]nico|gmail|outlook|internet|redes de computadores|navega[cç][aã]o)\b/i, codigo: '734', bonus: 30 },

    // Bloco 1
    { regex: /\b(lei org[aâ]nica|munic[ií]pio de curitiba|organiza[cç][aã]o administrativa municipal|poder executivo municipal|c[aâ]mara municipal)\b/i, codigo: '101', bonus: 35 },
    { regex: /\b(estatuto dos servidores|lei (municipal )?1\.?656|servidores municipais|est[aá]gio probat[oó]rio|vencimentos? e vantagens)\b/i, codigo: '102', bonus: 35 },
    { regex: /\b(zoneamento|uso do solo|lei 15\.?511|coeficiente de aproveitamento|taxa de ocupa[cç][aã]o|recuos? urban[ií]sticos?)\b/i, codigo: '103', bonus: 35 },
    { regex: /\b(c[oó]digo de obras|lei 11\.?095|alvar[aá] de constru[cç][aã]o|habite-se|p[eé]-direito|compartimentos? de edifica[cç][aã]o)\b/i, codigo: '104', bonus: 35 },
    { regex: /\b(licenciamento urban[ií]stico|posturas municipais|parcelamento do solo|loteamento|desmembramento|passeios? p[uú]blicos?)\b/i, codigo: '105', bonus: 35 },

    // Bloco 2
    { regex: /\b(licita[cç][oõ]es|lei 14\.?133|preg[aã]o|concorr[eê]ncia|di[aá]logo competitivo|dispensa de licita[cç][aã]o|inexigibilidade)\b/i, codigo: '206', bonus: 35 },
    { regex: /\b(planejamento da contrata[cç][aã]o|etp|estudo t[eé]cnico preliminar|termo de refer[eê]ncia|projeto b[aá]sico|projeto executivo)\b/i, codigo: '207', bonus: 35 },
    { regex: /\b(contratos administrativos|fiscaliza[cç][aã]o de obras|gest[aã]o de contratos|reequil[ií]brio econ[oô]mico|penalidades contratuais)\b/i, codigo: '208', bonus: 35 },
    { regex: /\b(planejamento e controle de obras|cronograma f[ií]sico-financeiro|curva s|pert[\/-]cpm|linha de balan[cç]o)\b/i, codigo: '209', bonus: 35 },
    { regex: /\b(or[cç]amento|medi[cç][aã]o|sinapi|bdi|encargos sociais|composi[cç][aã]o de custos|bim|planilha or[cç]ament[aá]ria)\b/i, codigo: '210', bonus: 35 },
  ];

  // Verifica bônus de termos técnicos específicos
  for (const regra of REGRAS_ESPECIFICAS_MATERIA) {
    if (regra.regex.test(textoCombinado)) {
      const pdfAlvo = TABELA_PDFS_ESTUDO.find((p) => p.codigo === regra.codigo);
      if (pdfAlvo) {
        melhorScore += regra.bonus;
        melhorPdf = pdfAlvo;
        break;
      }
    }
  }

  for (const pdf of TABELA_PDFS_ESTUDO) {
    let score = 0;
    const nomeNorm = normalizar(pdf.nome.replace(/^\d+_/, '').replace(/_/g, ' '));
    const blocoNorm = normalizar(pdf.blocoNome);

    // Correspondência de bloco ou disciplina
    if (discNorm.includes(blocoNorm) || blocoNorm.includes(discNorm)) score += 5;

    // Correspondência no nome do PDF / assunto
    if (assNorm.includes(nomeNorm) || nomeNorm.includes(assNorm)) score += 10;
    if (assNorm.includes(pdf.codigo)) score += 15;

    // Correspondência de palavras-chave nos tópicos fundamentais
    for (const topico of pdf.topicosFundamentais) {
      const topicoNorm = normalizar(topico);
      const palavrasChave = topicoNorm.split(/\s+/).filter((p) => p.length > 4);
      for (const palavra of palavrasChave) {
        if (assNorm.includes(palavra)) score += 4;
        if (enunNorm.includes(palavra)) score += 1;
      }
    }

    if (score > melhorScore) {
      melhorScore = score;
      melhorPdf = pdf;
    }
  }

  if (melhorPdf && melhorScore >= 5) {
    // Retorna ESTRITAMENTE o nome canônico do PDF cadastrado (ex: 314_Analise_Estrutural)
    return {
      noEscopo: true,
      blocoNome: melhorPdf.blocoNome,
      blocoNumero: melhorPdf.blocoNumero,
      assuntoOficial: melhorPdf.nome,
      codigoPdf: melhorPdf.codigo,
    };
  }

  // 3. Fallbacks para disciplinas conhecidas do edital mapeando SEMPRE para um dos 34 PDFs oficiais
  if (discNorm.includes('portugues') || discNorm.includes('lingua portuguesa')) {
    const pdf731 = TABELA_PDFS_ESTUDO.find((p) => p.codigo === '731')!;
    return {
      noEscopo: true,
      blocoNome: pdf731.blocoNome,
      blocoNumero: 7,
      assuntoOficial: pdf731.nome,
      codigoPdf: '731',
    };
  }

  if (discNorm.includes('informatica') || discNorm.includes('computador') || discNorm.includes('office')) {
    const pdf734 = TABELA_PDFS_ESTUDO.find((p) => p.codigo === '734')!;
    return {
      noEscopo: true,
      blocoNome: pdf734.blocoNome,
      blocoNumero: 7,
      assuntoOficial: pdf734.nome,
      codigoPdf: '734',
    };
  }

  if (
    discNorm.includes('engenharia') ||
    discNorm.includes('especific') ||
    discNorm.includes('construcao') ||
    discNorm.includes('estruturas')
  ) {
    const pdfPadrao = TABELA_PDFS_ESTUDO.find((p) => p.codigo === '314')!;
    return {
      noEscopo: true,
      blocoNome: pdfPadrao.blocoNome,
      blocoNumero: 3,
      assuntoOficial: pdfPadrao.nome,
      codigoPdf: '314',
    };
  }

  // Se não foi identificado nas 3 matérias oficiais, considera fora do escopo
  return {
    noEscopo: false,
    motivoForaEscopo: 'Disciplina ou tema não previsto no conteúdo programático do edital',
    blocoNome: 'Fora do Escopo',
    blocoNumero: 0,
    assuntoOficial: assunto || 'Fora do Edital',
  };
}

/**
 * Retorna os 34 assuntos oficiais agrupados por bloco com os nomes literais dos PDFs (ex: 314_Analise_Estrutural)
 */
export function obterCatalogoAssuntosOficiais() {
  return TABELA_PDFS_ESTUDO.map((p) => {
    const nomeLimpo = p.nome.replace(/^\d+_/, '').replace(/_/g, ' ');
    return {
      codigo: p.codigo,
      nome: p.nome,
      rotuloExibicao: `${p.codigo} - ${nomeLimpo}`,
      blocoNome: p.blocoNome,
      blocoNumero: p.blocoNumero,
      tipo: p.tipo,
    };
  });
}

/**
 * Encontra a matéria mais provável dentre os 34 PDFs oficiais para qualquer questão
 * Garante que NENHUMA matéria arbitrária ou fora do escopo seja atribuída
 */
export function encontrarPdfMaisProximo(
  disciplina: string = '',
  assunto: string = '',
  enunciado: string = ''
): ItemPdfEstudo {
  const discNorm = normalizar(disciplina);
  const assNorm = normalizar(assunto);
  const enunNorm = normalizar(enunciado);
  const texto = `${discNorm} ${assNorm} ${enunNorm.slice(0, 400)}`;

  // 1. Tenta correspondência direta por código (ex: 314, 315)
  for (const pdf of TABELA_PDFS_ESTUDO) {
    if (assNorm.includes(pdf.codigo) || discNorm.includes(pdf.codigo)) {
      return pdf;
    }
  }

  // 2. Pontuação por similaridade nos nomes e tópicos fundamentais
  let melhorPdf: ItemPdfEstudo = TABELA_PDFS_ESTUDO.find((p) => p.codigo === '314') || TABELA_PDFS_ESTUDO[0];
  let melhorPontos = -1;

  for (const pdf of TABELA_PDFS_ESTUDO) {
    let pontos = 0;
    const nomeLimpo = normalizar(pdf.nome.replace(/^\d+_/, '').replace(/_/g, ' '));
    const blocoNorm = normalizar(pdf.blocoNome);

    if (discNorm.includes(blocoNorm) || blocoNorm.includes(discNorm)) pontos += 10;
    if (assNorm.includes(nomeLimpo) || nomeLimpo.includes(assNorm)) pontos += 25;

    const palavrasAssunto = assNorm.split(/[\s,./-]+/).filter((w) => w.length >= 4);
    for (const pal of palavrasAssunto) {
      if (nomeLimpo.includes(pal)) pontos += 8;
    }

    for (const topico of pdf.topicosFundamentais) {
      const topNorm = normalizar(topico);
      const palavrasTopico = topNorm.split(/[\s,./-]+/).filter((w) => w.length >= 4);
      for (const pal of palavrasTopico) {
        if (assNorm.includes(pal)) pontos += 6;
        if (texto.includes(pal)) pontos += 2;
      }
    }

    if (pontos > melhorPontos) {
      melhorPontos = pontos;
      melhorPdf = pdf;
    }
  }

  // Se não pontuou o suficiente, direciona pelos ramos macro
  if (melhorPontos <= 0) {
    if (discNorm.includes('portugues') || assNorm.includes('portugues') || discNorm.includes('lingua')) {
      return TABELA_PDFS_ESTUDO.find((p) => p.codigo === '731')!;
    }
    if (discNorm.includes('informatica') || assNorm.includes('informatica')) {
      return TABELA_PDFS_ESTUDO.find((p) => p.codigo === '733')!;
    }
    return TABELA_PDFS_ESTUDO.find((p) => p.codigo === '314') || TABELA_PDFS_ESTUDO[0];
  }

  return melhorPdf;
}

/**
 * Reclassifica uma questão individual garantindo que seu assunto seja ESTRITAMENTE
 * um dos 34 nomes de PDFs oficiais cadastrados no edital (ex: 314_Analise_Estrutural).
 * Impede absolutamente o vazamento de matérias arbitrárias como "Teoria das Estruturas / Classes de Carregamento".
 */
export function reclassificarQuestaoParaEscopoEstrito(
  q: any,
  defaults?: { ano?: number; orgao?: string; banca?: string; cargo?: string }
): any {
  if (!q) return q;

  const escopo = verificarEscopoQuestao(q.disciplina || '', q.assunto || '', q.enunciado || '');

  let assuntoFinal = escopo.assuntoOficial;
  let blocoFinal = escopo.blocoNome;

  const pdfValido = TABELA_PDFS_ESTUDO.find(
    (p) => p.nome === assuntoFinal || p.codigo === escopo.codigoPdf
  );

  if (pdfValido) {
    assuntoFinal = pdfValido.nome;
    blocoFinal = pdfValido.blocoNome;
  } else {
    const maisProximo = encontrarPdfMaisProximo(q.disciplina || '', q.assunto || '', q.enunciado || '');
    assuntoFinal = maisProximo.nome;
    blocoFinal = maisProximo.blocoNome;
  }

  return {
    ...q,
    disciplina: blocoFinal,
    assunto: assuntoFinal,
    ano: q.ano || defaults?.ano,
    orgao: q.orgao || defaults?.orgao,
    banca: q.banca || defaults?.banca || 'Fundação FAFIPA',
    cargo: q.cargo || defaults?.cargo || 'Engenheiro Civil',
  };
}

/**
 * Reclassifica uma lista completa de questões para o escopo estrito dos 34 PDFs
 */
export function reclassificarQuestoesParaEscopoEstrito(
  questoes: any[],
  defaults?: { ano?: number; orgao?: string; banca?: string; cargo?: string }
): any[] {
  if (!Array.isArray(questoes)) return [];
  return questoes.map((q) => reclassificarQuestaoParaEscopoEstrito(q, defaults));
}

export interface ResumoMateriaSessao {
  blocoNome: string;
  assunto: string;
  quantidade: number;
}

/**
 * Analisa uma sessão (mesmo em escala, simulado ou prova anterior) e extrai o agrupamento
 * detalhado de todas as matérias e blocos abordados com suas respectivas contagens de questões.
 */
export function extrairResumoMateriasSessao(
  sessao: {
    disciplina?: string;
    assunto?: string;
    questaoIds?: (number | string)[];
    questoesSnap?: any[];
  },
  questoesBanco: any[] = []
): ResumoMateriaSessao[] {
  const mapaBanco = new Map<string, any>();
  questoesBanco.forEach((q) => {
    if (q?.id != null) {
      mapaBanco.set(String(q.id), q);
    }
  });

  const listaQ: any[] = [];
  if (Array.isArray(sessao.questoesSnap) && sessao.questoesSnap.length > 0) {
    listaQ.push(...sessao.questoesSnap);
  } else if (Array.isArray(sessao.questaoIds)) {
    sessao.questaoIds.forEach((id) => {
      const q = mapaBanco.get(String(id));
      if (q) listaQ.push(q);
    });
  }

  if (listaQ.length === 0) {
    return [
      {
        blocoNome: sessao.disciplina || 'Geral',
        assunto: sessao.assunto || 'Geral',
        quantidade: Array.isArray(sessao.questaoIds) ? sessao.questaoIds.length : 1,
      },
    ];
  }

  const mapaContagem = new Map<string, ResumoMateriaSessao>();

  listaQ.forEach((q) => {
    const rawDisc = q.disciplina || sessao.disciplina || 'Conhecimentos Gerais';
    const rawAss = q.assunto || sessao.assunto || 'Geral';

    // Se a questão possui disciplina genérica (ex: "Lote em Escala" ou "Prefeitura de Curitiba"),
    // tenta verificar o escopo oficial do concurso
    let blocoFinal = rawDisc;
    let assuntoFinal = rawAss;

    if (
      blocoFinal.toLowerCase().includes('lote em escala') ||
      blocoFinal.toLowerCase().includes('prova real')
    ) {
      const escopo = verificarEscopoQuestao(rawDisc, rawAss, q.enunciado || '');
      if (escopo.noEscopo) {
        blocoFinal = escopo.blocoNome;
        assuntoFinal = escopo.assuntoOficial;
      }
    }

    const chave = `${blocoFinal}:::${assuntoFinal}`;
    const existente = mapaContagem.get(chave) || {
      blocoNome: blocoFinal,
      assunto: assuntoFinal,
      quantidade: 0,
    };
    existente.quantidade++;
    mapaContagem.set(chave, existente);
  });

  return Array.from(mapaContagem.values()).sort((a, b) => b.quantidade - a.quantidade);
}

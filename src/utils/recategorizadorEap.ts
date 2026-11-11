import { Questao } from '../types';
import { TABELA_PDFS_ESTUDO, ItemPdfEstudo } from './simuladoPonderado';

/**
 * Motor Determinístico de Re-Categorização Paramétrica do EAP FAFIPA
 *
 * Transforma qualquer questão com categorias legadas, ortografias divergentes
 * ou etiquetas genéricas em uma das 34 Matérias Oficiais e 7 Blocos Canônicos.
 *
 * CUSTO DE TOKENS: ZERO. 100% determinístico baseado em dicionário léxico e regras.
 */

export const BLOCOS_CANONICOS_EAP: string[] = [
  'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
  'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
  'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
  'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
  'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
  'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
  'Bloco 7 — Informática e Português',
];

export interface ItemEapReferencia {
  codigo: string;
  assuntoNome: string;
  blocoNome: string;
  blocoNumero: number;
}

export const LISTA_34_MATERIAS_CANONICAS: ItemEapReferencia[] = TABELA_PDFS_ESTUDO.map((p) => ({
  codigo: p.codigo,
  assuntoNome: p.nome,
  blocoNome: p.blocoNome,
  blocoNumero: p.blocoNumero,
}));

export const MAPA_CODIGO_PARA_ITEM: Record<string, ItemEapReferencia> = {};
export const MAPA_ASSUNTO_PARA_ITEM: Record<string, ItemEapReferencia> = {};

LISTA_34_MATERIAS_CANONICAS.forEach((item) => {
  MAPA_CODIGO_PARA_ITEM[item.codigo] = item;
  MAPA_ASSUNTO_PARA_ITEM[item.assuntoNome] = item;
  MAPA_ASSUNTO_PARA_ITEM[`${item.codigo}_${item.assuntoNome}`] = item;
});

// Normaliza strings para comparação léxica tolerante a acentos e pontuações
function normalizarTexto(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface RegraMapeamento {
  codigo: string;
  termosPrimarios: string[]; // Alta relevância (+40 pts)
  termosSecundarios: string[]; // Relevância complementar (+15 pts)
}

const REGRAS_MAPEAMENTO: RegraMapeamento[] = [
  // --- BLOCO 1 ---
  {
    codigo: '101',
    termosPrimarios: ['lei organica', 'organica curitiba', '101', 'resumo 01', 'resumo 1', 'organizacao administrativa'],
    termosSecundarios: ['competencia municipal', 'vereadores', 'prefeito', 'lei complementar'],
  },
  {
    codigo: '102',
    termosPrimarios: ['estatuto dos servidores', 'estatuto do servidor', '102', 'resumo 02', 'resumo 2', 'lei 1656'],
    termosSecundarios: ['estagio probatorio', 'vacancia', 'demissao', 'licenca premio', 'cargo publico'],
  },
  {
    codigo: '103',
    termosPrimarios: ['zoneamento', 'uso do solo', 'ocupacao do solo', '103', 'resumo 03', 'resumo 3'],
    termosSecundarios: ['coeficiente de aproveitamento', 'taxa de ocupacao', 'recuo', 'afastamento', 'zr', 'zc', 'sehis'],
  },
  {
    codigo: '104',
    termosPrimarios: ['codigo de obras', 'alvara de construcao', 'habite se', '104', 'resumo 04', 'resumo 4', 'edificacoes curitiba'],
    termosSecundarios: ['compartimentos', 'pe direito', 'ventilacao', 'circulacao', 'embargo de obra'],
  },
  {
    codigo: '105',
    termosPrimarios: ['posturas', 'licenciamento', 'parcelamento do solo', 'loteamento', 'desmembramento', '105', 'resumo 05', 'resumo 5'],
    termosSecundarios: ['faixa non aedificandi', 'passeio publico', 'calcada', 'lei 6766'],
  },

  // --- BLOCO 2 ---
  {
    codigo: '206',
    termosPrimarios: ['licitacao', 'licitacoes', '14133', '14 133', '8666', '8 666', 'pregao', 'concorrencia', 'dispensa de licitacao', 'inexigibilidade', '206', 'resumo 06', 'resumo 6', '02 licitacoes'],
    termosSecundarios: ['dialogo competitivo', 'edital', 'habilitacao', 'menor preco', 'adjudicacao', 'homologacao'],
  },
  {
    codigo: '207',
    termosPrimarios: ['estudo tecnico preliminar', 'etp', 'termo de referencia', 'anteprojeto', 'projeto basico', 'matriz de riscos', '207', 'resumo 07', 'resumo 7'],
    termosSecundarios: ['planejamento da contratacao', 'tr', 'mapa de riscos'],
  },
  {
    codigo: '208',
    termosPrimarios: [
      'fiscalizacao de obras',
      'fiscalizacao de contratos',
      'fiscalizacao',
      'gestao de contratos',
      'contratos e fiscalizacao',
      'recebimento de obras',
      'aditivo contratual',
      'reequilibrio economico',
      'rescisao contratual',
      '208',
      'resumo 08',
      'resumo 8',
    ],
    termosSecundarios: [
      'fiscal do contrato',
      'recebimento provisorio',
      'recebimento definitivo',
      'retencao de garantia',
      'contrato administrativo',
    ],
  },
  {
    codigo: '209',
    termosPrimarios: ['cronograma fisico financeiro', 'curva s', 'pert cpm', 'caminho critico', 'planejamento de obras', '209', 'resumo 09', 'resumo 9'],
    termosSecundarios: ['folga total', 'folga livre', 'linha de balanco', 'duracao de atividades', 'redes de precedencia'],
  },
  {
    codigo: '210',
    termosPrimarios: ['orcamento', 'bdi', 'sinapi', 'sicro', 'curva abc', 'composicao de custos', 'encargos sociais', 'medicao de obras', '210', 'resumo 10', 'resumo 10'],
    termosSecundarios: ['custo direto', 'custo indireto', 'desoneracao', 'planilha orcamentaria', 'tcu', 'insumos'],
  },

  // --- BLOCO 3 ---
  {
    codigo: '311',
    termosPrimarios: ['materiais de construcao', 'cimento portland', 'agregados', 'areia', 'brita', 'cal hidratada', 'slump test', 'trabalhabilidade', '311', 'resumo 11'],
    termosSecundarios: ['pasta de cimento', 'granulometria', 'inchamento', 'modulo de finura', 'resistencia a compressao', 'fck'],
  },
  {
    codigo: '312',
    termosPrimarios: ['canteiro de obras', 'alvenaria de vedacao', 'alvenaria estrutural', 'revestimento', 'argamassa', 'chapisco', 'emboco', 'reboco', '312', 'resumo 12'],
    termosSecundarios: ['junta de dilatacao', 'verga', 'contraverga', 'layout de canteiro', 'argamassa colante', 'gesso'],
  },
  {
    codigo: '313',
    termosPrimarios: ['formas', 'escoramento', 'desforma', 'lajes', 'laje macica', 'laje nervurada', 'cobertura', 'telhado', 'impermeabilizacao', 'manta asfaltica', '313', 'resumo 13'],
    termosSecundarios: ['tesouras', 'calhas', 'rufos', 'estanqueidade', 'cimbre'],
  },
  {
    codigo: '314',
    termosPrimarios: ['analise estrutural', 'nbr 6120', 'esforco cortante', 'momento fletor', 'diagrama de momentos', 'hiperestatica', 'isostatica', 'estados limites', '314', 'resumo 14'],
    termosSecundarios: ['elu', 'els', 'flecha', 'cargas acidentais', 'peso proprio', 'vento', 'deformacao'],
  },
  {
    codigo: '315',
    termosPrimarios: ['concreto armado', 'nbr 6118', 'armadura longitudinal', 'estribos', 'ancoragem', 'cobrimento nominal', 'comprimento de traspasse', '315', 'resumo 15'],
    termosSecundarios: ['bielas', 'dominio de deformacao', 'cisalhamento', 'fissuracao', 'classe de agressividade'],
  },
  {
    codigo: '316',
    termosPrimarios: ['estruturas metalicas', 'nbr 8800', 'perfil metalico', 'solda', 'parafuso de alta resistencia', 'estruturas de madeira', 'nbr 7190', 'madeira', '316', 'resumo 16'],
    termosSecundarios: ['flambagem', 'trelica', 'ligacao parafusada', 'trrf', 'carbonizacao'],
  },

  // --- BLOCO 4 ---
  {
    codigo: '417',
    termosPrimarios: ['mecanica dos solos', 'geologia', 'limites de atterberg', 'proctor', 'compactacao de solos', 'tensao efetiva', 'terzaghi', '417', 'resumo 17'],
    termosSecundarios: ['indice de vazios', 'porosidade', 'grau de saturacao', 'permeabilidade', 'adensamento'],
  },
  {
    codigo: '418',
    termosPrimarios: ['sondagem', 'spt', 'nspt', 'sapata', 'fundacao superficial', 'fundacoes superficiais', 'radier', 'capacidade de carga do solo', '418', 'resumo 18'],
    termosSecundarios: ['sondagem a percussao', 'trado', 'recalque', 'sapata isolada', 'sapata corrida'],
  },
  {
    codigo: '419',
    termosPrimarios: ['fundacao profunda', 'fundacoes profundas', 'estaca', 'helice continua', 'tubulao', 'talude', 'contencao', 'muro de arrimo', 'cortina atirantada', 'empuxo de terra', '419', 'resumo 19'],
    termosSecundarios: ['rankine', 'coulomb', 'empuxo ativo', 'empuxo passivo', 'estaca cravada', 'bloco de coroamento'],
  },
  {
    codigo: '420',
    termosPrimarios: ['hidrologia', 'calculo de vazao', 'metodo racional', 'bacia hidrografica', 'tempo de concentracao', 'periodo de retorno', 'curva idf', '420', 'resumo 20'],
    termosSecundarios: ['pluviometria', 'escoamento superficial', 'coeficiente de runoff', 'precipitacao'],
  },
  {
    codigo: '421',
    termosPrimarios: ['drenagem urbana', 'galeria pluvial', 'boca de lobo', 'sarjeta', 'formula de manning', 'poco de visita pluvial', 'drenagem', '421', 'resumo 21'],
    termosSecundarios: ['recobrimento', 'declividade minima', 'dissipador de energia', 'sarjetao'],
  },
  {
    codigo: '422',
    termosPrimarios: ['rodovias', 'estradas', 'pavimento flexivel', 'cbuq', 'terraplenagem', 'corte e aterro', 'diagrama de bruckner', 'infraestrutura urbana', '422', 'resumo 22'],
    termosSecundarios: ['subleito', 'sub base', 'base brita', 'cbr', 'isc', 'imprimacao', 'asfalto'],
  },

  // --- BLOCO 5 ---
  {
    codigo: '523',
    termosPrimarios: ['abastecimento de agua', 'eta', 'estacao de tratamento de agua', 'adutora', 'rede de distribuicao de agua', 'reservatorio', 'coagulacao', 'floculacao', '523', 'resumo 23'],
    termosSecundarios: ['cloracao', 'filtracao', 'hidraulica predial', 'perda de carga', 'captacao superficial'],
  },
  {
    codigo: '524',
    termosPrimarios: ['esgotamento sanitario', 'ete', 'estacao de tratamento de esgoto', 'lodos ativados', 'lagoa de estabilizacao', 'dbo', 'dqo', 'rede coletora de esgoto', '524', 'resumo 24'],
    termosSecundarios: ['poco de visita esgoto', 'sifao invertido', 'decanter secundario', 'tratamento biologico'],
  },
  {
    codigo: '525',
    termosPrimarios: ['residuos solidos', 'conama 307', 'pgrcc', 'licenciamento ambiental', 'eia rima', 'aterro sanitario', 'impactos ambientais', '525', 'resumo 25'],
    termosSecundarios: ['lixiviado', 'chorume', 'classe a b c d', 'reciclagem de entulho'],
  },
  {
    codigo: '526',
    termosPrimarios: ['acessibilidade', 'nbr 9050', '9050', 'rampa de acessibilidade', 'piso tatil', 'sanitario acessivel', 'nbr 15575', 'desempenho', '526', 'resumo 26'],
    termosSecundarios: ['modulo de referencia', 'corrimão', 'guarda corpo acessivel', 'conforto acustico', 'vida util de projeto'],
  },

  // --- BLOCO 6 ---
  {
    codigo: '627',
    termosPrimarios: ['patologia das construcoes', 'fissuras', 'trincas', 'carbonatacao', 'corrosao de armaduras', 'eflorescencia', 'infiltracao', 'recuperacao estrutural', '627', 'resumo 27'],
    termosSecundarios: ['cloretos', 'desplacamento', 'bolhas', 'umidade ascendente'],
  },
  {
    codigo: '628',
    termosPrimarios: ['nr 18', 'nr18', 'nr 35', 'nr35', 'seguranca do trabalho', 'pgr construcao', 'cinto paraquedista', 'linha de vida', 'trabalho em altura', '628', 'resumo 28'],
    termosSecundarios: ['epi', 'epc', 'guarda corpo seguranca', 'andaime', 'instalacao eletrica provisoria'],
  },
  {
    codigo: '629',
    termosPrimarios: ['pericia', 'laudo pericial', 'vistoria cautelar', 'art crea', 'inspecao predial', 'normas tecnicas', '629', 'resumo 29'],
    termosSecundarios: ['perito', 'quesitos', 'assistente tecnico', 'dano emergente', 'lucro cessante'],
  },
  {
    codigo: '630',
    termosPrimarios: ['avaliacao de imoveis', 'nbr 14653', '14653', 'mcddm', 'metodo comparativo direto', 'metodo evolutivo', 'metodo involutivo', 'heidecke', '630', 'resumo 30'],
    termosSecundarios: ['grau de fundamentacao', 'grau de precisao', 'depreciacao fisica', 'fator de homogeneizacao'],
  },

  // --- BLOCO 7 ---
  {
    codigo: '731',
    termosPrimarios: [
      'portugues i',
      'interpretacao de texto',
      'compreensao de texto',
      'interpretacao',
      'compreensao',
      'semantica',
      'figuras de linguagem',
      'coesao e coerencia',
      '731',
      'resumo 31',
    ],
    termosSecundarios: ['anafora', 'metafora', 'antonimo', 'sinonimo', 'tipologia textual', 'generos textuais', 'portugues'],
  },
  {
    codigo: '732',
    termosPrimarios: [
      'portugues ii',
      'gramatica',
      'sintaxe',
      'concordancia verbal',
      'concordancia nominal',
      'concordancia',
      'regencia',
      'crase',
      'pontuacao',
      'morfologia',
      'ortografia',
      '732',
      'resumo 32',
      'lingua portuguesa',
    ],
    termosSecundarios: ['oracao subordinada', 'conjuncoes', 'colocacao pronominal', 'acentuacao', 'portugues'],
  },
  {
    codigo: '733',
    termosPrimarios: [
      'informatica i',
      'hardware',
      'windows',
      'sistema operacional',
      'processador',
      'memoria ram',
      'seguranca da informacao',
      'criptografia',
      '733',
      'resumo 33',
    ],
    termosSecundarios: ['antivirus', 'firewall', 'malware', 'backup', 'ssd', 'bios', 'tpm', 'informatica'],
  },
  {
    codigo: '734',
    termosPrimarios: [
      'informatica ii',
      'excel',
      'planilha eletronica',
      'word',
      'processador de texto',
      'internet',
      'correio eletronico',
      'navegador',
      'google chrome',
      '734',
      'resumo 34',
      'nocoes de informatica',
    ],
    termosSecundarios: ['formulas excel', 'procx', 'procv', 'tabela dinamica', 'email', 'protocolos', 'http', 'https', 'informatica'],
  },
];

function contemTermo(texto: string, termo: string): boolean {
  if (!texto || !termo) return false;
  if (termo.length <= 4) {
    const regex = new RegExp(`(?:^|\\s)${termo}(?:\\s|$)`, 'i');
    return regex.test(texto);
  }
  return texto.includes(termo);
}

/**
 * Avalia se uma questão já está em conformidade com o EAP paramétrico.
 */
export function estaNoPadraoEap(q: Questao): boolean {
  if (!q) return false;
  const ehBlocoValido = BLOCOS_CANONICOS_EAP.includes(q.disciplina);
  const ehAssuntoValido = Boolean(
    MAPA_ASSUNTO_PARA_ITEM[q.assunto] ||
      LISTA_34_MATERIAS_CANONICAS.some((m) => q.assunto === m.assuntoNome || q.assunto === `${m.codigo}_${m.assuntoNome}`)
  );
  return ehBlocoValido && ehAssuntoValido;
}

/**
 * Re-categoriza determinística e pontualmente uma questão individual para o EAP.
 */
export function normalizarQuestaoParaEap(q: Questao): {
  questao: Questao;
  foiAlterada: boolean;
  motivo?: string;
} {
  if (!q) {
    return { questao: q, foiAlterada: false };
  }

  // 1. Se já está 100% no padrão, preserva
  if (estaNoPadraoEap(q)) {
    return { questao: q, foiAlterada: false };
  }

  const disNorm = normalizarTexto(q.disciplina);
  const assNorm = normalizarTexto(q.assunto);
  const artNorm = normalizarTexto(q.artigo);
  const enunNorm = normalizarTexto(q.enunciado ? q.enunciado.slice(0, 300) : '');

  // 2. Pontua contra as 34 regras de mapeamento
  let melhorRegra: RegraMapeamento | null = null;
  let maiorPontuacao = -1;

  for (const regra of REGRAS_MAPEAMENTO) {
    let score = 0;

    // Match de código exato nas tags (ex: 206, 101, 731)
    if (contemTermo(disNorm, regra.codigo) || contemTermo(assNorm, regra.codigo)) {
      score += 120;
    }

    // Match de termos primários
    for (const termo of regra.termosPrimarios) {
      if (contemTermo(assNorm, termo)) score += 60;
      else if (contemTermo(disNorm, termo)) score += 40;
      else if (contemTermo(artNorm, termo)) score += 30;
      else if (contemTermo(enunNorm, termo)) score += 20;
    }

    // Match de termos secundários
    for (const termo of regra.termosSecundarios) {
      if (contemTermo(assNorm, termo)) score += 25;
      else if (contemTermo(disNorm, termo)) score += 15;
      else if (contemTermo(artNorm, termo)) score += 15;
      else if (contemTermo(enunNorm, termo)) score += 10;
    }

    if (score > maiorPontuacao) {
      maiorPontuacao = score;
      melhorRegra = regra;
    }
  }

  // Se atingiu uma pontuação mínima confiável
  if (melhorRegra && maiorPontuacao >= 20) {
    const item = MAPA_CODIGO_PARA_ITEM[melhorRegra.codigo];
    if (item) {
      const foiModificada = q.disciplina !== item.blocoNome || q.assunto !== item.assuntoNome;
      return {
        questao: {
          ...q,
          disciplina: item.blocoNome,
          assunto: item.assuntoNome,
        },
        foiAlterada: foiModificada,
        motivo: `Mapeado por afinidade léxica (score: ${maiorPontuacao}) para ${item.codigo} - ${item.assuntoNome}`,
      };
    }
  }

  // 3. Fallbacks estruturais para blocos genéricos (ex: Bloco 02 sem assunto específico)
  if (disNorm.includes('bloco 1') || disNorm.includes('bloco 01')) {
    const item = MAPA_CODIGO_PARA_ITEM['101'];
    return {
      questao: { ...q, disciplina: item.blocoNome, assunto: item.assuntoNome },
      foiAlterada: true,
      motivo: 'Fallback Bloco 1',
    };
  }
  if (disNorm.includes('bloco 2') || disNorm.includes('bloco 02') || disNorm.includes('licitacao')) {
    const item = MAPA_CODIGO_PARA_ITEM['206'];
    return {
      questao: { ...q, disciplina: item.blocoNome, assunto: item.assuntoNome },
      foiAlterada: true,
      motivo: 'Fallback Bloco 2',
    };
  }
  if (disNorm.includes('bloco 3') || disNorm.includes('bloco 03') || disNorm.includes('estrutura')) {
    const item = MAPA_CODIGO_PARA_ITEM['311'];
    return {
      questao: { ...q, disciplina: item.blocoNome, assunto: item.assuntoNome },
      foiAlterada: true,
      motivo: 'Fallback Bloco 3',
    };
  }
  if (disNorm.includes('bloco 4') || disNorm.includes('bloco 04') || disNorm.includes('geotecnia') || disNorm.includes('vias')) {
    const item = MAPA_CODIGO_PARA_ITEM['417'];
    return {
      questao: { ...q, disciplina: item.blocoNome, assunto: item.assuntoNome },
      foiAlterada: true,
      motivo: 'Fallback Bloco 4',
    };
  }
  if (disNorm.includes('bloco 5') || disNorm.includes('bloco 05') || disNorm.includes('saneamento') || disNorm.includes('ambiente')) {
    const item = MAPA_CODIGO_PARA_ITEM['523'];
    return {
      questao: { ...q, disciplina: item.blocoNome, assunto: item.assuntoNome },
      foiAlterada: true,
      motivo: 'Fallback Bloco 5',
    };
  }
  if (disNorm.includes('bloco 6') || disNorm.includes('bloco 06') || disNorm.includes('patologia') || disNorm.includes('seguranca')) {
    const item = MAPA_CODIGO_PARA_ITEM['627'];
    return {
      questao: { ...q, disciplina: item.blocoNome, assunto: item.assuntoNome },
      foiAlterada: true,
      motivo: 'Fallback Bloco 6',
    };
  }
  if (disNorm.includes('portugues') || disNorm.includes('lingua portuguesa')) {
    const item = MAPA_CODIGO_PARA_ITEM['731'];
    return {
      questao: { ...q, disciplina: item.blocoNome, assunto: item.assuntoNome },
      foiAlterada: true,
      motivo: 'Fallback Bloco 7 Português',
    };
  }
  if (disNorm.includes('informatica')) {
    const item = MAPA_CODIGO_PARA_ITEM['733'];
    return {
      questao: { ...q, disciplina: item.blocoNome, assunto: item.assuntoNome },
      foiAlterada: true,
      motivo: 'Fallback Bloco 7 Informática',
    };
  }

  // 4. Fallback final universal: Engenharia Civil (Bloco 3 - Materiais e Técnicas)
  const fallbackGeral = MAPA_CODIGO_PARA_ITEM['311'];
  return {
    questao: {
      ...q,
      disciplina: fallbackGeral.blocoNome,
      assunto: fallbackGeral.assuntoNome,
    },
    foiAlterada: true,
    motivo: 'Fallback Geral de Engenharia para Bloco 3',
  };
}

export interface RelatorioAuditoriaAcervoEap {
  totalQuestoes: number;
  totalJaParametricas: number;
  totalRecategorizadas: number;
  taxaConformidadeInicial: number;
  distribuicaoPorBloco: Record<string, number>;
  distribuicaoPorAssunto: Record<string, number>;
  variacoesLegadasMapeadas: {
    disciplinaOriginal: string;
    assuntoOriginal: string;
    blocoNovo: string;
    assuntoNovo: string;
    quantidade: number;
  }[];
  questoesSanitizadas: Questao[];
}

/**
 * Realiza a auditoria e re-categorização em lote de todo o acervo.
 */
export function auditarERecategorizarAcervo(questoes: Questao[]): RelatorioAuditoriaAcervoEap {
  const distribuicaoPorBloco: Record<string, number> = {};
  const distribuicaoPorAssunto: Record<string, number> = {};
  const variacoesMap = new Map<string, {
    disciplinaOriginal: string;
    assuntoOriginal: string;
    blocoNovo: string;
    assuntoNovo: string;
    quantidade: number;
  }>();

  let totalJaParametricas = 0;
  let totalRecategorizadas = 0;

  BLOCOS_CANONICOS_EAP.forEach((b) => (distribuicaoPorBloco[b] = 0));
  LISTA_34_MATERIAS_CANONICAS.forEach((m) => (distribuicaoPorAssunto[m.assuntoNome] = 0));

  const questoesSanitizadas = questoes.map((q) => {
    const jaEstava = estaNoPadraoEap(q);
    const { questao: novaQ, foiAlterada } = normalizarQuestaoParaEap(q);

    if (jaEstava) {
      totalJaParametricas++;
    } else {
      totalRecategorizadas++;
      const chaveVar = `${q.disciplina || '(Vazio)'} -> ${q.assunto || '(Vazio)'}`;
      const exist = variacoesMap.get(chaveVar);
      if (exist) {
        exist.quantidade++;
      } else {
        variacoesMap.set(chaveVar, {
          disciplinaOriginal: q.disciplina || '(Vazio)',
          assuntoOriginal: q.assunto || '(Vazio)',
          blocoNovo: novaQ.disciplina,
          assuntoNovo: novaQ.assunto,
          quantidade: 1,
        });
      }
    }

    distribuicaoPorBloco[novaQ.disciplina] = (distribuicaoPorBloco[novaQ.disciplina] || 0) + 1;
    distribuicaoPorAssunto[novaQ.assunto] = (distribuicaoPorAssunto[novaQ.assunto] || 0) + 1;

    return novaQ;
  });

  const total = questoes.length;
  const taxaConformidadeInicial = total > 0 ? Math.round((totalJaParametricas / total) * 100) : 100;

  return {
    totalQuestoes: total,
    totalJaParametricas,
    totalRecategorizadas,
    taxaConformidadeInicial,
    distribuicaoPorBloco,
    distribuicaoPorAssunto,
    variacoesLegadasMapeadas: Array.from(variacoesMap.values()).sort((a, b) => b.quantidade - a.quantidade),
    questoesSanitizadas,
  };
}

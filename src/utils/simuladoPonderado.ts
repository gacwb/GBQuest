/**
 * Módulo de Simulado Ponderado: FAFIPA — Prefeitura de Curitiba (Engenheiro Civil)
 *
 * Parâmetros Reais da Prova:
 * - 40 Questões (5 Língua Portuguesa + 5 Noções de Informática + 30 Conhecimentos Específicos)
 * - 4 Horas de Duração Total (240 minutos)
 * - 30 minutos reservados exclusivamente para preencher o gabarito
 * - 210 minutos líquidos de resolução (3h 30min)
 * - Ritmo alvo da prova: 5 min 15 seg por questão (5:15 m/q)
 * - Meta de aprovação: 98%
 */

export interface ItemPdfEstudo {
  codigo: string;
  nome: string;
  blocoNome: string;
  blocoNumero: number;
  tipo: 'especifica' | 'portugues' | 'informatica';
  pesoEstimado: number;
  topicosFundamentais: string[];
}

export const METRICAS_PROVA_REAL = {
  TOTAL_QUESTOES: 40,
  QUESTOES_PORTUGUES: 5,
  QUESTOES_INFORMATICA: 5,
  QUESTOES_ESPECIFICAS: 30,
  TEMPO_TOTAL_SEGUNDOS: 4 * 60 * 60, // 14.400s (4h)
  TEMPO_GABARITO_SEGUNDOS: 30 * 60, // 1.800s (30min)
  TEMPO_LIQUIDO_SEGUNDOS: 210 * 60, // 12.600s (3h30)
  RITMO_ALVO_SEGUNDOS: 315, // 5 min e 15 seg por questão
  META_APROVACAO_PCT: 98, // 98%
};

/**
 * Mapeamento oficial dos 34 PDFs de estudo cruzados com o Mapa de Incidência da FAFIPA
 */
export const TABELA_PDFS_ESTUDO: ItemPdfEstudo[] = [
  // BLOCO 01 — Legislação Municipal de Curitiba (5 PDFs)
  {
    codigo: '101',
    nome: '101_Lei_Organica_e_Organizacao_Administrativa',
    blocoNome: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
    blocoNumero: 1,
    tipo: 'especifica',
    pesoEstimado: 0.6,
    topicosFundamentais: [
      'Competências privativas e comuns do Município',
      'Organização e vedações dos Poderes Executivo e Legislativo',
      'Princípios fundamentais da administração pública municipal',
      'Estrutura dos órgãos da administração direta e indireta',
    ],
  },
  {
    codigo: '102',
    nome: '102_Estatuto_dos_Servidores',
    blocoNome: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
    blocoNumero: 1,
    tipo: 'especifica',
    pesoEstimado: 0.6,
    topicosFundamentais: [
      'Formas de provimento e vacância de cargo público',
      'Deveres, proibições e regime disciplinar',
      'Estabilidade, estágio probatório e avaliação de desempenho',
      'Direitos fundamentais, licenças e concessões',
    ],
  },
  {
    codigo: '103',
    nome: '103_Zoneamento_e_Uso_do_Solo',
    blocoNome: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
    blocoNumero: 1,
    tipo: 'especifica',
    pesoEstimado: 1.2,
    topicosFundamentais: [
      'Parâmetros urbanísticos: Coeficiente de Aproveitamento e Taxa de Ocupação',
      'Recuos obrigatórios e afastamento das divisas',
      'Zonas de uso residencial, comercial e industrial',
    ],
  },
  {
    codigo: '104',
    nome: '104_Codigo_de_Obras',
    blocoNome: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
    blocoNumero: 1,
    tipo: 'especifica',
    pesoEstimado: 2.4, // Gigante da prova (10 quedas)
    topicosFundamentais: [
      'Alvará de construção, habite-se e certidões',
      'Dimensões mínimas de compartimentos e ventilação/iluminação',
      'Circulações, escadas de emergência e saídas de segurança',
      'Infrações, embargos e penalidades de obras',
    ],
  },
  {
    codigo: '105',
    nome: '105_Licenciamento_Posturas_e_Parcelamento',
    blocoNome: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
    blocoNumero: 1,
    tipo: 'especifica',
    pesoEstimado: 1.0,
    topicosFundamentais: [
      'Regras de loteamento e desmembramento urbano',
      'Posturas municipais, passeios públicos e faixas de domínio',
      'Prazos e etapas de licenciamento e aprovação de projetos',
    ],
  },

  // BLOCO 02 — Licitações, Planejamento e Orçamento (5 PDFs)
  {
    codigo: '206',
    nome: '206_Licitacoes_Lei_14133',
    blocoNome: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    blocoNumero: 2,
    tipo: 'especifica',
    pesoEstimado: 1.1,
    topicosFundamentais: [
      'Modalidades de licitação (Pregão, Concorrência, Diálogo Competitivo)',
      'Hipóteses de Dispensa e Inexigibilidade de licitação',
      'Critérios de julgamento (menor preço, maior desconto)',
      'Regimes de execução de obras (empreitada por preço global e unitário)',
    ],
  },
  {
    codigo: '207',
    nome: '207_Planejamento_da_Contratacao',
    blocoNome: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    blocoNumero: 2,
    tipo: 'especifica',
    pesoEstimado: 0.5,
    topicosFundamentais: [
      'Estudo Técnico Preliminar (ETP): elementos obrigatórios',
      'Termo de Referência (TR) e Projeto Básico',
      'Matriz de alocação de riscos em contratos de obras',
    ],
  },
  {
    codigo: '208',
    nome: '208_Contratos_e_Fiscalizacao',
    blocoNome: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    blocoNumero: 2,
    tipo: 'especifica',
    pesoEstimado: 0.8,
    topicosFundamentais: [
      'Atribuições do gestor e do fiscal de obras e contratos',
      'Alterações contratuais unilaterais e limites de aditivos (25% e 50%)',
      'Recebimento provisório e definitivo de obras de engenharia',
      'Sanções administrativas por inexecução contratual',
    ],
  },
  {
    codigo: '209',
    nome: '209_Planejamento_e_Controle_de_Obras',
    blocoNome: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    blocoNumero: 2,
    tipo: 'especifica',
    pesoEstimado: 0.6,
    topicosFundamentais: [
      'Cronograma físico-financeiro de execução',
      'Curva S: interpretação e controle de desvios',
      'Método do Caminho Crítico (CPM / PERT): folgas e durações',
      'Linhas de balanço e produtividade',
    ],
  },
  {
    codigo: '210',
    nome: '210_Orcamento_Medicao_e_BIM',
    blocoNome: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    blocoNumero: 2,
    tipo: 'especifica',
    pesoEstimado: 1.3,
    topicosFundamentais: [
      'Composição de custos unitários e sistemas referenciais (SINAPI / SICRO)',
      'BDI (Benefícios e Despesas Indiretas): itens componentes e tributos',
      'Curva ABC de insumos e serviços',
      'Critérios de medição e pagamento de obras',
    ],
  },

  // BLOCO 03 — Materiais, Técnicas e Estruturas (6 PDFs)
  {
    codigo: '311',
    nome: '311_Materiais_de_Construcao',
    blocoNome: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    blocoNumero: 3,
    tipo: 'especifica',
    pesoEstimado: 2.2, // Gigante da prova (12 quedas)
    topicosFundamentais: [
      'Aglomerantes: tipos e classes de cimento Portland e cal',
      'Agregados: granulometria, umidade e inchamento da areia',
      'Concreto fresco: slump test, trabalhabilidade e exsudação',
      'Concreto endurecido: relação a/c, cura e ensaios de resistência',
    ],
  },
  {
    codigo: '312',
    nome: '312_Tecnicas_Construtivas_e_Canteiro',
    blocoNome: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    blocoNumero: 3,
    tipo: 'especifica',
    pesoEstimado: 0.4,
    topicosFundamentais: [
      'Layout de canteiro de obras e logística de armazenagem',
      'Alvenarias de vedação e estrutural: juntas e amarração',
      'Revestimentos cerâmicos e argamassas: chapisco, emboço e reboco',
      'Instalações provisórias de canteiro',
    ],
  },
  {
    codigo: '313',
    nome: '313_Formas_Lajes_Coberturas_e_Imperm',
    blocoNome: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    blocoNumero: 3,
    tipo: 'especifica',
    pesoEstimado: 0.8,
    topicosFundamentais: [
      'Sistemas de formas e escoramentos: prazos de desforma',
      'Tipos de lajes (maciças, nervuradas, pré-moldadas)',
      'Telhados e coberturas: inclinações e calhas',
      'Impermeabilização rígida vs. flexível (mantas e membranas)',
    ],
  },
  {
    codigo: '314',
    nome: '314_Analise_Estrutural',
    blocoNome: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    blocoNumero: 3,
    tipo: 'especifica',
    pesoEstimado: 1.1,
    topicosFundamentais: [
      'Ações permanentes e variáveis nas estruturas (NBR 6120)',
      'Diagramas de esforço cortante e momento fletor em vigas',
      'Combinações de ações e coeficientes de ponderação',
      'Estados Limites Últimos (ELU) e de Serviço (ELS)',
    ],
  },
  {
    codigo: '315',
    nome: '315_Concreto_Armado',
    blocoNome: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    blocoNumero: 3,
    tipo: 'especifica',
    pesoEstimado: 1.1,
    topicosFundamentais: [
      'Dimensionamento de vigas à flexão simples (NBR 6118)',
      'Armaduras longitudinais mínimas e armaduras de cisalhamento (estribos)',
      'Cobriments nominais e classes de agressividade ambiental',
      'Comprimento de ancoragem e traspasse de barras',
    ],
  },
  {
    codigo: '316',
    nome: '316_Estruturas_Metalicas_e_de_Madeira',
    blocoNome: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    blocoNumero: 3,
    tipo: 'especifica',
    pesoEstimado: 0.3,
    topicosFundamentais: [
      'Perfis metálicos laminados e soldados e suas aplicações',
      'Ligações soldadas e parafusadas: conceitos básicos',
      'Propriedades físicas e mecânicas da madeira e classes de resistência',
      'Tipos de esforços críticos em estruturas de madeira',
    ],
  },

  // BLOCO 04 — Geotecnia, Drenagem e Vias (6 PDFs)
  {
    codigo: '417',
    nome: '417_Geologia_e_Mecanica_dos_Solos',
    blocoNome: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    blocoNumero: 4,
    tipo: 'especifica',
    pesoEstimado: 1.3,
    topicosFundamentais: [
      'Índices físicos do solo: umidade, índice de vazios, porosidade',
      'Limites de Atterberg e classificação táctil-visual',
      'Compactação de solos: curva Proctor, energia e umidade ótima',
      'Tensões totais, efetivas e pressão neutra (Princípio de Terzaghi)',
    ],
  },
  {
    codigo: '418',
    nome: '418_Investigacao_e_Fundacoes_Superficiais',
    blocoNome: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    blocoNumero: 4,
    tipo: 'especifica',
    pesoEstimado: 1.1,
    topicosFundamentais: [
      'Sondagem a Percussão (SPT): interpretação do N_SPT e critério de parada',
      'Sapatas isoladas, corridas e associadas: critérios de dimensionamento',
      'Capacidade de carga de fundações diretas e tensões admissíveis',
      'Recalques imediatos e por adensamento',
    ],
  },
  {
    codigo: '419',
    nome: '419_Fundacoes_Profundas_Taludes_e_Contencoes',
    blocoNome: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    blocoNumero: 4,
    tipo: 'especifica',
    pesoEstimado: 0.3,
    topicosFundamentais: [
      'Tipos de estacas: hélice contínua, cravadas e brocas',
      'Blocos de coroamento e efeitos de grupo de estacas',
      'Empuxos de terra: teorias de Rankine e Coulomb (ativo, passivo e repouso)',
      'Estruturas de contenção: muros de gravidade e cortinas atirantadas',
    ],
  },
  {
    codigo: '420',
    nome: '420_Hidrologia_e_Calculo_de_Vazao',
    blocoNome: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    blocoNumero: 4,
    tipo: 'especifica',
    pesoEstimado: 0.6,
    topicosFundamentais: [
      'Ciclo hidrológico e balanço hídrico',
      'Método Racional para cálculo de vazão de pico de bacias',
      'Tempo de concentração e período de retorno (TR)',
      'Curvas intensidade-duração-frequência (IDF)',
    ],
  },
  {
    codigo: '421',
    nome: '421_Drenagem_Urbana',
    blocoNome: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    blocoNumero: 4,
    tipo: 'especifica',
    pesoEstimado: 1.0,
    topicosFundamentais: [
      'Bocas de lobo, sarjetas e caixas de ligação',
      'Dimensionamento hidráulico de galerias pluviais (Fórmula de Manning)',
      'Declividades mínimas, velocidades limites e recobrimento de tubos',
      'Técnicas compensatórias de drenagem sustentável',
    ],
  },
  {
    codigo: '422',
    nome: '422_Estradas_e_Infraestrutura_Urbana',
    blocoNome: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    blocoNumero: 4,
    tipo: 'especifica',
    pesoEstimado: 0.9,
    topicosFundamentais: [
      'Elementos de traçado geométrico de rodovias e vias urbanas',
      'Camadas de pavimento flexível: subleito, sub-base, base e CBUQ',
      'Movimento de terra: corte, aterro e diagrama de massas (Brückner)',
      'Drenagem superficial de pavimentos e rodovias',
    ],
  },

  // BLOCO 05 — Saneamento, Ambiente e Acessibilidade (4 PDFs)
  {
    codigo: '523',
    nome: '523_Abastecimento_de_Agua',
    blocoNome: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    blocoNumero: 5,
    tipo: 'especifica',
    pesoEstimado: 1.5, // Gigante (13 quedas)
    topicosFundamentais: [
      'Captação superficial e subterrânea de água',
      'Etapas de tratamento de água (ETA): coagulação, floculação, decantação, filtração e desinfecção',
      'Redes de distribuição: malhas e ramais, pressões mínimas e máximas',
      'Reservatórios de distribuição: dimensionamento de capacidade',
    ],
  },
  {
    codigo: '524',
    nome: '524_Esgotamento_Sanitario_e_ETE',
    blocoNome: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    blocoNumero: 5,
    tipo: 'especifica',
    pesoEstimado: 1.3, // Gigante (10 quedas)
    topicosFundamentais: [
      'Sistemas separadores absolutos de esgoto',
      'Dimensionamento hidráulico de redes coletoras de esgoto e declividades',
      'Etapas de Estações de Tratamento de Esgoto (ETE): primário, secundário (lodos ativados) e descarte',
      'Parâmetros DBO, DQO e eficiência de remoção',
    ],
  },
  {
    codigo: '525',
    nome: '525_Residuos_Solidos_e_Impactos_Ambientais',
    blocoNome: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    blocoNumero: 5,
    tipo: 'especifica',
    pesoEstimado: 0.7,
    topicosFundamentais: [
      'Classificação dos resíduos da construção civil (Resolução CONAMA 307: classes A, B, C, D)',
      'Aterros sanitários: impermeabilização de fundo e drenagem de lixiviado/gases',
      'Licenciamento ambiental: LP, LI, LO e Estudos de Impacto (EIA/RIMA)',
      'Planos de Gerenciamento de Resíduos da Construção Civil (PGRCC)',
    ],
  },
  {
    codigo: '526',
    nome: '526_Acessibilidade_Arquitetura_e_Desempenho',
    blocoNome: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    blocoNumero: 5,
    tipo: 'especifica',
    pesoEstimado: 0.9,
    topicosFundamentais: [
      'Parâmetros de rampas de acessibilidade (NBR 9050): inclinação máxima, patamares e corrimãos',
      'Sanitários acessíveis: dimensões, bacias e barras de apoio',
      'Piso tátil direcional e de alerta: sinalização obrigatória',
      'Norma de Desempenho de Edificações (NBR 15575): conceitos gerais',
    ],
  },

  // BLOCO 06 — Patologia, Segurança e Perícias (4 PDFs)
  {
    codigo: '627',
    nome: '627_Patologia_das_Construcoes',
    blocoNome: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
    blocoNumero: 6,
    tipo: 'especifica',
    pesoEstimado: 1.5,
    topicosFundamentais: [
      'Fissuras, trincas e rachaduras: causas, aberturas e mapeamento de tensões',
      'Corrosão de armaduras por carbonatação e penetração de íons cloreto',
      'Infiltrações e eflorescências em alvenarias e concreto',
      'Métodos de recuperação estrutural e reconstituição de cobrimento',
    ],
  },
  {
    codigo: '628',
    nome: '628_Seguranca_em_Obras_NR18_NR35',
    blocoNome: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
    blocoNumero: 6,
    tipo: 'especifica',
    pesoEstimado: 1.1,
    topicosFundamentais: [
      'Programa de Gerenciamento de Riscos (PGR) na construção (NR-18)',
      'Proteções contra quedas em altura: guarda-corpo, redes e telas',
      'Trabalho em altura (NR-35): cinto tipo paraquedista, talabarte e linha de vida',
      'Instalações elétricas provisórias e áreas de vivência em canteiro',
    ],
  },
  {
    codigo: '629',
    nome: '629_Vistorias_Pericias_e_Documentacao',
    blocoNome: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
    blocoNumero: 6,
    tipo: 'especifica',
    pesoEstimado: 0.8,
    topicosFundamentais: [
      'Diferença entre vistoria, perícia, avaliação e arbitramento',
      'Estrutura e elementos obrigatórios do laudo pericial de engenharia',
      'Vistoria cautelar de vizinhança prévia ao início de obras',
      'Artigo de Responsabilidade Técnica (ART) do CREA',
    ],
  },
  {
    codigo: '630',
    nome: '630_Avaliacao_de_Imoveis_NBR_14653',
    blocoNome: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
    blocoNumero: 6,
    tipo: 'especifica',
    pesoEstimado: 1.0,
    topicosFundamentais: [
      'Método Comparativo Direto de Dados de Mercado (MCDDM)',
      'Graus de fundamentação e precisão da avaliação',
      'Método Evolutivo e Método Involutivo para terrenos e edificações',
      'Depreciação física pelo método de Heidecke',
    ],
  },

  // BLOCO 07 — Informática e Português (4 PDFs de Conhecimentos Básicos)
  {
    codigo: '731',
    nome: '731_Portugues_I_Interpretacao_e_Semantica',
    blocoNome: 'Bloco 7 — Informática e Português',
    blocoNumero: 7,
    tipo: 'portugues',
    pesoEstimado: 2.0,
    topicosFundamentais: [
      'Compreensão e interpretação textual de artigos e notícias',
      'Coesão e coerência textual (anáfora, catáfora, conectivos)',
      'Significação das palavras (sinonímia, antonímia, conotação e denotação)',
      'Figuras de linguagem e tipologia textual',
    ],
  },
  {
    codigo: '732',
    nome: '732_Portugues_II_Gramatica_e_Literatura',
    blocoNome: 'Bloco 7 — Informática e Português',
    blocoNumero: 7,
    tipo: 'portugues',
    pesoEstimado: 3.0,
    topicosFundamentais: [
      'Classes gramaticais: pronomes, verbos e conjunções subordinativas',
      'Sintaxe do período simples e composto: funções sintáticas',
      'Regência verbal e emprego obrigatório/facultativo da crase',
      'Concordância nominal e concordância verbal',
      'Ortografia oficial, pontuação e acentuação gráfica',
    ],
  },
  {
    codigo: '733',
    nome: '733_Informatica_I_Conceitos_e_Sistemas',
    blocoNome: 'Bloco 7 — Informática e Português',
    blocoNumero: 7,
    tipo: 'informatica',
    pesoEstimado: 2.0,
    topicosFundamentais: [
      'Conceitos de hardware: memórias RAM/ROM, SSD e processadores',
      'Sistemas operacionais Windows 10/11: atalhos, painel e gerenciador de arquivos',
      'Segurança da informação: malware, phishing, backup e senhas seguras',
      'Conceitos básicos de redes: LAN, WAN, IP e DNS',
    ],
  },
  {
    codigo: '734',
    nome: '734_Informatica_II_Aplicativos_e_Internet',
    blocoNome: 'Bloco 7 — Informática e Português',
    blocoNumero: 7,
    tipo: 'informatica',
    pesoEstimado: 3.0,
    topicosFundamentais: [
      'Microsoft Word: formatação de parágrafos, estilos e controle de alterações',
      'Microsoft Excel: fórmulas essenciais (SOMA, SE, PROCV, MÉDIA, CONT.SE)',
      'Navegadores de internet (Google Chrome, Edge): guias, cookies e histórico',
      'Correio eletrônico (e-mail): campos Cco, anexos e protocolos POP3/IMAP',
    ],
  },
];

export interface ItemDistribuicaoSimulado {
  pdf: ItemPdfEstudo;
  quantidade: number;
  tipoCota: 'piso_fixo' | 'roleta_estocastica' | 'basica_fixa';
}

export interface ResultadoDistribuicaoSimulado {
  itens: ItemDistribuicaoSimulado[];
  totalQuestoes: number;
  totalPortugues: number;
  totalInformatica: number;
  totalEspecificas: number;
}

/**
 * Algoritmo Estocástico Ponderado de Simulado Real:
 * 1. Atribui 5 questões de Português e 5 de Informática entre os PDFs do Bloco 7.
 * 2. Atribui pisos fixos para os 16 PDFs de específicas com peso >= 1 (18 questões de piso).
 * 3. Preenche as 12 vagas restantes de específicas através de roleta aleatória ponderada
 *    entre os 14 PDFs com peso < 1 e frações residuais dos demais, garantindo que qualquer
 *    assunto do edital possa cair e fechando RIGOROSAMENTE em 40 questões!
 */
export function calcularDistribuicaoSimuladoPonderado(
  totalQuestoes: number = METRICAS_PROVA_REAL.TOTAL_QUESTOES
): ResultadoDistribuicaoSimulado {
  const distribuicao: Map<string, ItemDistribuicaoSimulado> = new Map();

  TABELA_PDFS_ESTUDO.forEach((pdf) => {
    distribuicao.set(pdf.codigo, {
      pdf,
      quantidade: 0,
      tipoCota: pdf.tipo === 'especifica' ? 'roleta_estocastica' : 'basica_fixa',
    });
  });

  // Se a prova for de 40 questões exatas (padrão oficial)
  if (totalQuestoes === METRICAS_PROVA_REAL.TOTAL_QUESTOES) {
    // 1. Português (5 questões fixas: 2 de interpretação 731 + 3 de gramática 732)
    distribuicao.get('731')!.quantidade = 2;
    distribuicao.get('732')!.quantidade = 3;

    // 2. Informática (5 questões fixas: 2 de sistemas/hardware 733 + 3 de aplicativos/office 734)
    distribuicao.get('733')!.quantidade = 2;
    distribuicao.get('734')!.quantidade = 3;

    // 3. Específicas: Atribui piso mínimo garantido para os PDFs com peso >= 1
    // 104 e 311 garantem 2 questões cada; os outros 14 com peso >= 1 garantem 1 questão cada = 18 questões
    const pdfsEspecificos = TABELA_PDFS_ESTUDO.filter((p) => p.tipo === 'especifica');

    pdfsEspecificos.forEach((pdf) => {
      if (pdf.pesoEstimado >= 2.0) {
        const item = distribuicao.get(pdf.codigo)!;
        item.quantidade = 2;
        item.tipoCota = 'piso_fixo';
      } else if (pdf.pesoEstimado >= 1.0) {
        const item = distribuicao.get(pdf.codigo)!;
        item.quantidade = 1;
        item.tipoCota = 'piso_fixo';
      }
    });

    const questoesEspecificasAtribuidas = pdfsEspecificos.reduce(
      (sum, p) => sum + distribuicao.get(p.codigo)!.quantidade,
      0
    );

    const vagasRestantes = METRICAS_PROVA_REAL.QUESTOES_ESPECIFICAS - questoesEspecificasAtribuidas; // 30 - 18 = 12 vagas

    // 4. Roleta Estocástica Ponderada: sorteia as vagas restantes entre todos os PDFs específicos
    // Dando peso relativo a cada um (com chance proporcional ao seu peso residual)
    const poolSorteio = pdfsEspecificos.map((pdf) => {
      const qJaAtribuida = distribuicao.get(pdf.codigo)!.quantidade;
      // Peso residual para concorrer a vagas adicionais
      const pesoRoleta = Math.max(0.1, pdf.pesoEstimado - qJaAtribuida * 0.8);
      return { codigo: pdf.codigo, peso: pesoRoleta };
    });

    for (let v = 0; v < vagasRestantes; v++) {
      const somaPesos = poolSorteio.reduce((acc, curr) => acc + curr.peso, 0);
      let r = Math.random() * somaPesos;
      let selecionadoCodigo = poolSorteio[0].codigo;

      for (const item of poolSorteio) {
        r -= item.peso;
        if (r <= 0) {
          selecionadoCodigo = item.codigo;
          break;
        }
      }

      const itemDist = distribuicao.get(selecionadoCodigo)!;
      itemDist.quantidade += 1;

      // Reduz o peso do selecionado para evitar repetição desproporcional na mesma rodada
      const poolItem = poolSorteio.find((p) => p.codigo === selecionadoCodigo);
      if (poolItem) {
        poolItem.peso = Math.max(0.05, poolItem.peso * 0.3);
      }
    }
  } else {
    // Caso de quantidade personalizada proporcional
    const proporcaoPort = Math.max(1, Math.round((5 / 40) * totalQuestoes));
    const proporcaoInfo = Math.max(1, Math.round((5 / 40) * totalQuestoes));
    const proporcaoEsp = Math.max(1, totalQuestoes - proporcaoPort - proporcaoInfo);

    distribuicao.get('731')!.quantidade = Math.max(1, Math.round(proporcaoPort * 0.4));
    distribuicao.get('732')!.quantidade = Math.max(1, proporcaoPort - distribuicao.get('731')!.quantidade);

    distribuicao.get('733')!.quantidade = Math.max(1, Math.round(proporcaoInfo * 0.4));
    distribuicao.get('734')!.quantidade = Math.max(1, proporcaoInfo - distribuicao.get('733')!.quantidade);

    // Distribui o restante entre específicas via maiores pesos
    const pdfsEsp = TABELA_PDFS_ESTUDO.filter((p) => p.tipo === 'especifica');
    const somaPesosEsp = pdfsEsp.reduce((acc, p) => acc + p.pesoEstimado, 0);

    let atribuidas = 0;
    pdfsEsp.forEach((p) => {
      const q = Math.floor((p.pesoEstimado / somaPesosEsp) * proporcaoEsp);
      distribuicao.get(p.codigo)!.quantidade = q;
      atribuidas += q;
    });

    let faltam = proporcaoEsp - atribuidas;
    let idx = 0;
    while (faltam > 0) {
      const p = pdfsEsp[idx % pdfsEsp.length];
      distribuicao.get(p.codigo)!.quantidade += 1;
      faltam--;
      idx++;
    }
  }

  const itensResultado = Array.from(distribuicao.values());

  const totalPortugues = itensResultado
    .filter((i) => i.pdf.tipo === 'portugues')
    .reduce((s, i) => s + i.quantidade, 0);
  const totalInformatica = itensResultado
    .filter((i) => i.pdf.tipo === 'informatica')
    .reduce((s, i) => s + i.quantidade, 0);
  const totalEspecificas = itensResultado
    .filter((i) => i.pdf.tipo === 'especifica')
    .reduce((s, i) => s + i.quantidade, 0);

  return {
    itens: itensResultado,
    totalQuestoes: totalPortugues + totalInformatica + totalEspecificas,
    totalPortugues,
    totalInformatica,
    totalEspecificas,
  };
}

export interface MetricasDesempenhoSimulados {
  totalSimuladosConcluidos: number;
  totalQuestoesSimulados: number;
  totalAcertos: number;
  totalErros: number;
  taxaAcertoMedia: number; // Porcentagem de 0 a 100
  metaAprovacaoAtingida: boolean; // true se >= 98%
  segundosPorQuestaoMedio: number;
  minutosPorQuestaoFormatado: string;
  ritmoLimiteSegundos: number; // 315s (5:15 m/q)
  dentroDoRitmoLimite: boolean;
  folgaSegundosPorQuestao: number; // Positivo se abaixo de 315s, negativo se estourou
  tempoTotalSegundos: number;
  historicoSimulados: {
    id: string | number;
    codigo: string;
    data: number;
    taxaAcerto: number;
    acertos: number;
    total: number;
    segundos: number;
    ritmoFormatado: string;
    atingiuMeta98: boolean;
  }[];
}

/**
 * Calcula todas as métricas exclusivas da View de Simulados
 */
export function calcularMetricasViewSimulados(
  sessoes: Array<{
    id?: number | string;
    codigo: string;
    concluida?: boolean;
    acertos?: number;
    erros?: number;
    taxaAcerto?: number;
    quantidade?: number;
    tempoSegundos?: number;
    created_at?: string;
  }>,
  registrosTempo: Array<{
    id: string;
    sessaoId?: number | string;
    codigo?: string;
    segundos: number;
    data: number;
    concluida?: boolean;
    acertos?: number;
    erros?: number;
    totalQuestoes?: number;
    taxaAcerto?: number;
  }> = []
): MetricasDesempenhoSimulados {
  // Filtra apenas sessões que são simulados da prova real (código SIM- ou nome Simulado)
  // E que foram DE FATO CONCLUÍDAS (após responder a última questão com resuminho de término)
  const simuladosValidos = sessoes.filter((s) => {
    const cod = String(s.codigo || '').toUpperCase();
    const ehSimulado = cod.startsWith('SIM-') || cod.includes('SIMULADO');
    if (!ehSimulado) return false;

    // Localiza registro de tempo correspondente (se existir)
    const reg = registrosTempo.find(
      (r) =>
        (s.id && r.sessaoId && String(r.sessaoId) === String(s.id)) ||
        (s.codigo && r.codigo && r.codigo.trim().toLowerCase() === s.codigo.trim().toLowerCase())
    );

    // O simulado só deve aparecer na view de desempenho após finalizar de fato:
    // 1) Marcado explicitamente como concluído na sessão (s.concluida === true)
    // 2) Ou marcado como concluído no registro de tempo (reg.concluida === true)
    // 3) Ou todas as questões foram respondidas (acertos + erros >= quantidade)
    const estaConcluida = Boolean(s.concluida || reg?.concluida);
    const qtdTotal = s.quantidade || reg?.totalQuestoes || 40;
    const acertos = s.acertos ?? reg?.acertos;
    const erros = s.erros ?? reg?.erros;
    const totalRespondidas =
      acertos !== undefined && erros !== undefined ? acertos + erros : undefined;
    const todasRespondidas =
      totalRespondidas !== undefined && totalRespondidas >= qtdTotal && qtdTotal > 0;

    return estaConcluida || todasRespondidas;
  });

  let totalQuestoes = 0;
  let totalAcertos = 0;
  let totalErros = 0;
  let tempoTotalSegundos = 0;

  const historicoSimulados: MetricasDesempenhoSimulados['historicoSimulados'] = [];

  simuladosValidos.forEach((s) => {
    const reg = registrosTempo.find(
      (r) =>
        (s.id && r.sessaoId && String(r.sessaoId) === String(s.id)) ||
        (s.codigo && r.codigo && r.codigo.trim().toLowerCase() === s.codigo.trim().toLowerCase())
    );

    const qtd = s.quantidade || reg?.totalQuestoes || 40;
    const acertos = s.acertos ?? reg?.acertos ?? 0;
    const erros = s.erros ?? reg?.erros ?? Math.max(0, qtd - acertos);
    const taxa = s.taxaAcerto ?? reg?.taxaAcerto ?? (qtd > 0 ? Math.round((acertos / qtd) * 100) : 0);
    const tempo = s.tempoSegundos ?? reg?.segundos ?? 0;
    const secPorQ = qtd > 0 ? tempo / qtd : 0;
    const minFormat = formatarSegundosEmMinutosPorQuestao(secPorQ);

    totalQuestoes += qtd;
    totalAcertos += acertos;
    totalErros += erros;
    tempoTotalSegundos += tempo;

    historicoSimulados.push({
      id: s.id || s.codigo,
      codigo: s.codigo,
      data: s.created_at ? new Date(s.created_at).getTime() : (reg?.data || Date.now()),
      taxaAcerto: taxa,
      acertos,
      total: qtd,
      segundos: tempo,
      ritmoFormatado: minFormat,
      atingiuMeta98: taxa >= METRICAS_PROVA_REAL.META_APROVACAO_PCT,
    });
  });

  const totalSimuladosConcluidos = simuladosValidos.length;
  const taxaAcertoMedia =
    totalQuestoes > 0 ? Math.round((totalAcertos / totalQuestoes) * 100) : 0;
  const segundosPorQuestaoMedio =
    totalQuestoes > 0 ? Math.round(tempoTotalSegundos / totalQuestoes) : 0;
  const minutosPorQuestaoFormatado = formatarSegundosEmMinutosPorQuestao(segundosPorQuestaoMedio);
  const ritmoLimite = METRICAS_PROVA_REAL.RITMO_ALVO_SEGUNDOS; // 315s
  const dentroDoRitmoLimite = segundosPorQuestaoMedio <= ritmoLimite;
  const folgaSegundosPorQuestao = ritmoLimite - segundosPorQuestaoMedio;

  return {
    totalSimuladosConcluidos,
    totalQuestoesSimulados: totalQuestoes,
    totalAcertos,
    totalErros,
    taxaAcertoMedia,
    metaAprovacaoAtingida: taxaAcertoMedia >= METRICAS_PROVA_REAL.META_APROVACAO_PCT,
    segundosPorQuestaoMedio,
    minutosPorQuestaoFormatado,
    ritmoLimiteSegundos: ritmoLimite,
    dentroDoRitmoLimite,
    folgaSegundosPorQuestao,
    tempoTotalSegundos,
    historicoSimulados,
  };
}

export function formatarSegundosEmMinutosPorQuestao(segundos: number): string {
  if (!segundos || isNaN(segundos) || segundos <= 0) return '0:00 m/q';
  const min = Math.floor(segundos / 60);
  const sec = Math.round(segundos % 60);
  return `${min}:${String(sec).padStart(2, '0')} m/q`;
}

/**
 * Garante que uma lista de questões para simulado atinja exatamente o total alvo (padrão 40),
 * complementando eventuais faltas com questões de reserva ou banco sem duplicações.
 */
export function completarShortfallSimulado<T extends { id: any; [key: string]: any }>(
  questoesObtidas: T[],
  questoesReserva: T[],
  totalAlvo: number = METRICAS_PROVA_REAL.TOTAL_QUESTOES
): T[] {
  if (questoesObtidas.length >= totalAlvo) {
    return questoesObtidas.slice(0, totalAlvo);
  }

  const idsExistentes = new Set(questoesObtidas.map((q) => String(q.id)));
  const complementares: T[] = [];

  for (const reserva of questoesReserva) {
    if (!idsExistentes.has(String(reserva.id))) {
      complementares.push(reserva);
      idsExistentes.add(String(reserva.id));
      if (questoesObtidas.length + complementares.length >= totalAlvo) {
        break;
      }
    }
  }

  return [...questoesObtidas, ...complementares].slice(0, totalAlvo);
}

/**
 * Filtro de segurança que garante que simulados oficiais (SIM-CTBA-) NUNCA sejam purgados.
 * Retorna apenas sessões de teste legadas elegíveis para exclusão em lote.
 */
export function identificarSessoesParaPurga<T extends { codigo?: string; assunto?: string }>(
  sessoes: T[]
): T[] {
  return sessoes.filter((s) => {
    const cod = String(s.codigo || '').toUpperCase();
    const ass = String(s.assunto || '').toLowerCase();
    // Prova Real e simulados oficiais são estritamente intocáveis
    if (cod.startsWith('SIM-CTBA-') || ass.includes('oficial')) return false;
    // Apenas testes legados são purgados
    return cod.startsWith('SIM-TESTE-') || ass.includes('simulado de teste');
  });
}

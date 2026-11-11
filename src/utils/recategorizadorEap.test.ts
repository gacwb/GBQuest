import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizarQuestaoParaEap,
  estaNoPadraoEap,
  auditarERecategorizarAcervo,
  BLOCOS_CANONICOS_EAP,
  LISTA_34_MATERIAS_CANONICAS,
} from './recategorizadorEap';
import { TODAS_QUESTOES_PROVAS_FAFIPA_REAIS } from '../data/provasFafipaReais';
import { Questao } from '../types';

test('EAP Recategorizador - Estrutura Canônica de 7 Blocos e 34 Matérias', () => {
  assert.equal(BLOCOS_CANONICOS_EAP.length, 7, 'Devem existir exatamente 7 Blocos Oficiais');
  assert.equal(LISTA_34_MATERIAS_CANONICAS.length, 34, 'Devem existir exatamente 34 Matérias Oficiais');
});

test('EAP Recategorizador - As 242 Questões Oficiais de Provas Reais já estão 100% conformes', () => {
  assert.equal(TODAS_QUESTOES_PROVAS_FAFIPA_REAIS.length, 242);

  TODAS_QUESTOES_PROVAS_FAFIPA_REAIS.forEach((q) => {
    assert.equal(
      estaNoPadraoEap(q),
      true,
      `Questão oficial ${q.id} (${q.disciplina} / ${q.assunto}) deve ser reconhecida como 100% no padrão EAP`
    );

    const { foiAlterada } = normalizarQuestaoParaEap(q);
    assert.equal(
      foiAlterada,
      false,
      `Questão oficial ${q.id} não deve sofrer mutação desnecessária`
    );
  });
});

test('EAP Recategorizador - Mapeamento de Variações Legadas Frequentes (Zero Tokens)', () => {
  const casosDeTeste: {
    disciplinaEntrada: string;
    assuntoEntrada: string;
    artigoEntrada?: string;
    enunciadoEntrada?: string;
    blocoEsperado: string;
    assuntoEsperado: string;
  }[] = [
    // Bloco 1
    {
      disciplinaEntrada: 'Legislação Municipal',
      assuntoEntrada: 'Lei Orgânica de Curitiba',
      blocoEsperado: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
      assuntoEsperado: '101_Lei_Organica_e_Organizacao_Administrativa',
    },
    {
      disciplinaEntrada: 'Legislação Municipal',
      assuntoEntrada: 'Estatuto dos Servidores Municipais',
      blocoEsperado: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
      assuntoEsperado: '102_Estatuto_dos_Servidores',
    },
    {
      disciplinaEntrada: 'Legislação',
      assuntoEntrada: 'Zoneamento e Uso do Solo',
      blocoEsperado: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
      assuntoEsperado: '103_Zoneamento_e_Uso_do_Solo',
    },
    {
      disciplinaEntrada: 'Código de Obras',
      assuntoEntrada: 'Alvará e Habite-se',
      blocoEsperado: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
      assuntoEsperado: '104_Codigo_de_Obras',
    },
    {
      disciplinaEntrada: 'Posturas',
      assuntoEntrada: 'Parcelamento do Solo Urbano',
      blocoEsperado: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
      assuntoEsperado: '105_Licenciamento_Posturas_e_Parcelamento',
    },

    // Bloco 2
    {
      disciplinaEntrada: '02_Licitações',
      assuntoEntrada: 'Lei 14.133/2021',
      blocoEsperado: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
      assuntoEsperado: '206_Licitacoes_Lei_14133',
    },
    {
      disciplinaEntrada: 'Direito Administrativo',
      assuntoEntrada: 'Estudo Técnico Preliminar e ETP',
      blocoEsperado: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
      assuntoEsperado: '207_Planejamento_da_Contratacao',
    },
    {
      disciplinaEntrada: 'Obras Públicas',
      assuntoEntrada: 'Fiscalização de Contratos e Recebimento de Obras',
      blocoEsperado: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
      assuntoEsperado: '208_Contratos_e_Fiscalizacao',
    },
    {
      disciplinaEntrada: 'Planejamento',
      assuntoEntrada: 'Cronograma Físico-Financeiro e Curva S',
      blocoEsperado: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
      assuntoEsperado: '209_Planejamento_e_Controle_de_Obras',
    },
    {
      disciplinaEntrada: 'Custos',
      assuntoEntrada: 'Orçamento SINAPI e Cálculo do BDI',
      blocoEsperado: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
      assuntoEsperado: '210_Orcamento_Medicao_e_BIM',
    },

    // Bloco 3
    {
      disciplinaEntrada: 'Engenharia Civil',
      assuntoEntrada: 'Materiais de Construção - Cimento e Agregados',
      blocoEsperado: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
      assuntoEsperado: '311_Materiais_de_Construcao',
    },
    {
      disciplinaEntrada: 'Edificações',
      assuntoEntrada: 'Alvenaria e Argamassas de Revestimento',
      blocoEsperado: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
      assuntoEsperado: '312_Tecnicas_Construtivas_e_Canteiro',
    },
    {
      disciplinaEntrada: 'Construção Civil',
      assuntoEntrada: 'Formas, Escoramento e Impermeabilização',
      blocoEsperado: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
      assuntoEsperado: '313_Formas_Lajes_Coberturas_e_Imperm',
    },
    {
      disciplinaEntrada: 'Estruturas',
      assuntoEntrada: 'Análise Estrutural e NBR 6120',
      blocoEsperado: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
      assuntoEsperado: '314_Analise_Estrutural',
    },
    {
      disciplinaEntrada: 'Engenharia',
      assuntoEntrada: 'NBR 6118 - Concreto Armado',
      blocoEsperado: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
      assuntoEsperado: '315_Concreto_Armado',
    },
    {
      disciplinaEntrada: 'Estruturas',
      assuntoEntrada: 'Estruturas Metálicas NBR 8800',
      blocoEsperado: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
      assuntoEsperado: '316_Estruturas_Metalicas_e_de_Madeira',
    },

    // Bloco 4
    {
      disciplinaEntrada: 'Geotecnia',
      assuntoEntrada: 'Mecânica dos Solos e Ensaio Proctor',
      blocoEsperado: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
      assuntoEsperado: '417_Geologia_e_Mecanica_dos_Solos',
    },
    {
      disciplinaEntrada: 'Geotecnia',
      assuntoEntrada: 'Sondagem SPT e Sapatas',
      blocoEsperado: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
      assuntoEsperado: '418_Investigacao_e_Fundacoes_Superficiais',
    },
    {
      disciplinaEntrada: 'Fundações',
      assuntoEntrada: 'Estacas e Muros de Contenção',
      blocoEsperado: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
      assuntoEsperado: '419_Fundacoes_Profundas_Taludes_e_Contencoes',
    },
    {
      disciplinaEntrada: 'Hidráulica',
      assuntoEntrada: 'Hidrologia e Cálculo de Vazão pelo Método Racional',
      blocoEsperado: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
      assuntoEsperado: '420_Hidrologia_e_Calculo_de_Vazao',
    },
    {
      disciplinaEntrada: 'Infraestrutura',
      assuntoEntrada: 'Drenagem Urbana e Galerias Pluviais',
      blocoEsperado: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
      assuntoEsperado: '421_Drenagem_Urbana',
    },
    {
      disciplinaEntrada: 'Transportes',
      assuntoEntrada: 'Pavimentação Asfáltica e Rodovias',
      blocoEsperado: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
      assuntoEsperado: '422_Estradas_e_Infraestrutura_Urbana',
    },

    // Bloco 5
    {
      disciplinaEntrada: 'Saneamento',
      assuntoEntrada: 'Abastecimento de Água e ETA',
      blocoEsperado: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
      assuntoEsperado: '523_Abastecimento_de_Agua',
    },
    {
      disciplinaEntrada: 'Saneamento Básico',
      assuntoEntrada: 'Esgotamento Sanitário e ETE',
      blocoEsperado: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
      assuntoEsperado: '524_Esgotamento_Sanitario_e_ETE',
    },
    {
      disciplinaEntrada: 'Meio Ambiente',
      assuntoEntrada: 'Resíduos Sólidos e CONAMA 307',
      blocoEsperado: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
      assuntoEsperado: '525_Residuos_Solidos_e_Impactos_Ambientais',
    },
    {
      disciplinaEntrada: 'Acessibilidade',
      assuntoEntrada: 'NBR 9050 - Rampas e Sanitários',
      blocoEsperado: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
      assuntoEsperado: '526_Acessibilidade_Arquitetura_e_Desempenho',
    },

    // Bloco 6
    {
      disciplinaEntrada: 'Patologia',
      assuntoEntrada: 'Fissuras e Corrosão de Armaduras',
      blocoEsperado: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
      assuntoEsperado: '627_Patologia_das_Construcoes',
    },
    {
      disciplinaEntrada: 'Segurança',
      assuntoEntrada: 'NR-18 e Trabalho em Altura NR-35',
      blocoEsperado: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
      assuntoEsperado: '628_Seguranca_em_Obras_NR18_NR35',
    },
    {
      disciplinaEntrada: 'Perícias',
      assuntoEntrada: 'Laudo Pericial e Vistoria Cautelar',
      blocoEsperado: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
      assuntoEsperado: '629_Vistorias_Pericias_e_Documentacao',
    },
    {
      disciplinaEntrada: 'Avaliações',
      assuntoEntrada: 'Avaliação de Imóveis NBR 14653',
      blocoEsperado: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
      assuntoEsperado: '630_Avaliacao_de_Imoveis_NBR_14653',
    },

    // Bloco 7
    {
      disciplinaEntrada: 'Português',
      assuntoEntrada: 'Interpretação e Compreensão de Texto',
      blocoEsperado: 'Bloco 7 — Informática e Português',
      assuntoEsperado: '731_Portugues_I_Interpretacao_e_Semantica',
    },
    {
      disciplinaEntrada: 'Língua Portuguesa',
      assuntoEntrada: 'Concordância e Sintaxe do Período Composto',
      blocoEsperado: 'Bloco 7 — Informática e Português',
      assuntoEsperado: '732_Portugues_II_Gramatica_e_Literatura',
    },
    {
      disciplinaEntrada: 'Informática Básica',
      assuntoEntrada: 'Hardware e Sistema Windows',
      blocoEsperado: 'Bloco 7 — Informática e Português',
      assuntoEsperado: '733_Informatica_I_Conceitos_e_Sistemas',
    },
    {
      disciplinaEntrada: 'Noções de Informática',
      assuntoEntrada: 'Microsoft Excel e Planilhas',
      blocoEsperado: 'Bloco 7 — Informática e Português',
      assuntoEsperado: '734_Informatica_II_Aplicativos_e_Internet',
    },
  ];

  casosDeTeste.forEach((caso, i) => {
    const qFicticia: Questao = {
      id: `teste_legado_${i}`,
      banca: 'FAFIPA',
      cargo: 'Engenheiro Civil',
      disciplina: caso.disciplinaEntrada,
      assunto: caso.assuntoEntrada,
      artigo: 'Art. 1',
      enunciado: caso.enunciadoEntrada || 'Enunciado fictício sobre a matéria de teste',
      alternativas: ['A', 'B', 'C', 'D'],
      correta: 0,
      comentario: 'Gabarito',
    };

    const res = normalizarQuestaoParaEap(qFicticia);
    assert.equal(
      res.questao.disciplina,
      caso.blocoEsperado,
      `Caso #${i} (${caso.disciplinaEntrada} / ${caso.assuntoEntrada}): Bloco divergente`
    );
    assert.equal(
      res.questao.assunto,
      caso.assuntoEsperado,
      `Caso #${i} (${caso.disciplinaEntrada} / ${caso.assuntoEntrada}): Assunto divergente`
    );
    assert.equal(res.foiAlterada, true);
  });
});

test('EAP Recategorizador - Auditoria em Lote e Contagem de Questões Re-Categorizadas', () => {
  const acervoMisto: Questao[] = [
    // 242 canônicas
    ...TODAS_QUESTOES_PROVAS_FAFIPA_REAIS,
    // 3 questões legadas fora do padrão
    {
      id: 'leg_1',
      banca: 'Banca Antiga',
      disciplina: '02_Licitações',
      assunto: 'Lei 14.133',
      artigo: 'Art. 1',
      enunciado: 'Sobre o pregão...',
      alternativas: ['A', 'B'],
      correta: 0,
      comentario: 'Explicação',
    },
    {
      id: 'leg_2',
      banca: 'Banca Antiga',
      disciplina: 'Geotecnia',
      assunto: 'Sondagem a Percussão SPT',
      artigo: 'NBR 6484',
      enunciado: 'O ensaio SPT...',
      alternativas: ['A', 'B'],
      correta: 0,
      comentario: 'Explicação',
    },
    {
      id: 'leg_3',
      banca: 'Banca Antiga',
      disciplina: 'Português',
      assunto: 'Interpretação de Texto',
      artigo: 'Geral',
      enunciado: 'O texto trata de...',
      alternativas: ['A', 'B'],
      correta: 0,
      comentario: 'Explicação',
    },
  ];

  const relatorio = auditarERecategorizarAcervo(acervoMisto);
  assert.equal(relatorio.totalQuestoes, 245);
  assert.equal(relatorio.totalJaParametricas, 242);
  assert.equal(relatorio.totalRecategorizadas, 3);
  assert.equal(relatorio.variacoesLegadasMapeadas.length, 3);

  // Todas as 245 agora estão estritamente no padrão
  relatorio.questoesSanitizadas.forEach((q) => {
    assert.equal(estaNoPadraoEap(q), true, `Questão ${q.id} deve estar no padrão após re-categorização`);
  });
});

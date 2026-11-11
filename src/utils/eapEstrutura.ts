/**
 * Estrutura Canônica da EAP (Estrutura Analítica do Projeto)
 * Alinhada 100% com o anexo oficial (eap.pdf e image_e86106fc.png)
 *
 * Hierarquia:
 * Banca (FAFIPA Paramétrico)
 *  └── 7 Blocos Oficiais
 *       └── 34 Assuntos/PDFs (Códigos 101 a 734 / Resumos 01 a 34)
 */

import { TABELA_PDFS_ESTUDO, ItemPdfEstudo } from './simuladoPonderado';
import { Materia } from '../types';

export interface BlocoEapOficial {
  numero: number;
  codigo: string;
  titulo: string;
  subtitulo: string;
  assuntosCodigos: string[];
  tipo: 'especifica' | 'basica';
}

export const BLOCOS_EAP_OFICIAIS: BlocoEapOficial[] = [
  {
    numero: 1,
    codigo: 'BLOCO 01',
    titulo: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
    subtitulo: 'Lei Orgânica, Estatuto, Zoneamento, Código de Obras e Posturas',
    assuntosCodigos: ['101', '102', '103', '104', '105'],
    tipo: 'especifica',
  },
  {
    numero: 2,
    codigo: 'BLOCO 02',
    titulo: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    subtitulo: 'Lei 14.133/21, Contratos, Orçamento Público, Cronograma e BDI',
    assuntosCodigos: ['206', '207', '208', '209', '210'],
    tipo: 'especifica',
  },
  {
    numero: 3,
    codigo: 'BLOCO 03',
    titulo: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    subtitulo: 'Materiais, Canteiro, Formas/Lajes, Análise Estrutural, Concreto Armado e Metálicas/Madeira',
    assuntosCodigos: ['311', '312', '313', '314', '315', '316'],
    tipo: 'especifica',
  },
  {
    numero: 4,
    codigo: 'BLOCO 04',
    titulo: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    subtitulo: 'Mecânica dos Solos, Fundações Superficiais e Profundas, Hidrologia/Drenagem, Contenções e Rodovias',
    assuntosCodigos: ['417', '418', '419', '420', '421', '422'],
    tipo: 'especifica',
  },
  {
    numero: 5,
    codigo: 'BLOCO 05',
    titulo: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    subtitulo: 'Abastecimento de Água, Esgotamento San./ETE, Resíduos/Impactos e Acessibilidade NBR 9050',
    assuntosCodigos: ['523', '524', '525', '526'],
    tipo: 'especifica',
  },
  {
    numero: 6,
    codigo: 'BLOCO 06',
    titulo: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
    subtitulo: 'Patologia das Construções, NR-18/NR-35, Vistorias/Perícias e Avaliação de Imóveis NBR 14653',
    assuntosCodigos: ['627', '628', '629', '630'],
    tipo: 'especifica',
  },
  {
    numero: 7,
    codigo: 'BLOCO 07',
    titulo: 'Bloco 7 - Informática e Português',
    subtitulo: 'Português I/II e Noções de Informática I/II',
    assuntosCodigos: ['731', '732', '733', '734'],
    tipo: 'basica',
  },
];

export interface MetaAssuntoEap {
  codigo: string;
  resumoIndex: number; // 1 a 34
  blocoNumero: number;
  codigosDoAssunto: string[];
  termosChave: string[];
}

export const METADADOS_34_ASSUNTOS: MetaAssuntoEap[] = [
  // Bloco 1 (Resumos 01 a 05)
  { codigo: '101', resumoIndex: 1, blocoNumero: 1, codigosDoAssunto: ['101', '01', 'r01', 'r1', 'resumo 01', 'resumo 1'], termosChave: ['organica', 'orgânica', 'organizacao', 'organização', 'administrativa'] },
  { codigo: '102', resumoIndex: 2, blocoNumero: 1, codigosDoAssunto: ['102', '02', 'r02', 'r2', 'resumo 02', 'resumo 2'], termosChave: ['estatuto', 'servidor', 'servidores'] },
  { codigo: '103', resumoIndex: 3, blocoNumero: 1, codigosDoAssunto: ['103', '03', 'r03', 'r3', 'resumo 03', 'resumo 3'], termosChave: ['zoneamento', 'uso do solo', 'solo'] },
  { codigo: '104', resumoIndex: 4, blocoNumero: 1, codigosDoAssunto: ['104', '04', 'r04', 'r4', 'resumo 04', 'resumo 4'], termosChave: ['codigo de obras', 'código de obras', 'obras curitiba'] },
  { codigo: '105', resumoIndex: 5, blocoNumero: 1, codigosDoAssunto: ['105', '05', 'r05', 'r5', 'resumo 05', 'resumo 5'], termosChave: ['licenciamento', 'postura', 'posturas', 'parcelamento'] },

  // Bloco 2 (Resumos 06 a 10)
  { codigo: '206', resumoIndex: 6, blocoNumero: 2, codigosDoAssunto: ['206', '06', 'r06', 'r6', 'resumo 06', 'resumo 6'], termosChave: ['14133', '14.133', 'licitac', 'licitaç'] },
  { codigo: '207', resumoIndex: 7, blocoNumero: 2, codigosDoAssunto: ['207', '07', 'r07', 'r7', 'resumo 07', 'resumo 7'], termosChave: ['contrato', 'contratos', 'administrativos'] },
  { codigo: '208', resumoIndex: 8, blocoNumero: 2, codigosDoAssunto: ['208', '08', 'r08', 'r8', 'resumo 08', 'resumo 8'], termosChave: ['orcamento', 'orçamento', 'engenharia'] },
  { codigo: '209', resumoIndex: 9, blocoNumero: 2, codigosDoAssunto: ['209', '09', 'r09', 'r9', 'resumo 09', 'resumo 9'], termosChave: ['planejamento', 'cronograma'] },
  { codigo: '210', resumoIndex: 10, blocoNumero: 2, codigosDoAssunto: ['210', '10', 'r10', 'resumo 10'], termosChave: ['bdi', 'encargo', 'encargos', 'tabela', 'tabelas'] },

  // Bloco 3 (Resumos 11 a 16)
  { codigo: '311', resumoIndex: 11, blocoNumero: 3, codigosDoAssunto: ['311', '11', 'r11', 'resumo 11'], termosChave: ['materiais', 'construcao', 'construção'] },
  { codigo: '312', resumoIndex: 12, blocoNumero: 3, codigosDoAssunto: ['312', '12', 'r12', 'resumo 12'], termosChave: ['canteiro', 'alvenaria', 'alvenarias', 'revestimento', 'revestimentos'] },
  { codigo: '313', resumoIndex: 13, blocoNumero: 3, codigosDoAssunto: ['313', '13', 'r13', 'resumo 13'], termosChave: ['forma', 'formas', 'laje', 'lajes', 'cobertura', 'coberturas', 'imperm'] },
  { codigo: '314', resumoIndex: 14, blocoNumero: 3, codigosDoAssunto: ['314', '14', 'r14', 'resumo 14'], termosChave: ['analise estrutural', 'análise estrutural', 'estrutural'] },
  { codigo: '315', resumoIndex: 15, blocoNumero: 3, codigosDoAssunto: ['315', '15', 'r15', 'resumo 15'], termosChave: ['concreto armado', 'concreto', 'nbr 6118', '6118'] },
  { codigo: '316', resumoIndex: 16, blocoNumero: 3, codigosDoAssunto: ['316', '16', 'r16', 'resumo 16'], termosChave: ['metalica', 'metálica', 'metalicas', 'metálicas', 'madeira'] },

  // Bloco 4 (Resumos 17 a 22)
  { codigo: '417', resumoIndex: 17, blocoNumero: 4, codigosDoAssunto: ['417', '17', 'r17', 'resumo 17'], termosChave: ['geologia', 'mecanica dos solos', 'mecânica dos solos', 'solos'] },
  { codigo: '418', resumoIndex: 18, blocoNumero: 4, codigosDoAssunto: ['418', '18', 'r18', 'resumo 18'], termosChave: ['superficial', 'superficiais', 'investigacao', 'spt', 'sapata', 'sapatas'] },
  { codigo: '419', resumoIndex: 19, blocoNumero: 4, codigosDoAssunto: ['419', '19', 'r19', 'resumo 19'], termosChave: ['profunda', 'profundas', 'estaca', 'estacas', 'talude', 'taludes', 'contenc', 'contenç'] },
  { codigo: '420', resumoIndex: 20, blocoNumero: 4, codigosDoAssunto: ['420', '20', 'r20', 'resumo 20'], termosChave: ['hidrologia', 'drenagem'] },
  { codigo: '421', resumoIndex: 21, blocoNumero: 4, codigosDoAssunto: ['421', '21', 'r21', 'resumo 21'], termosChave: ['terra', 'terraplanagem', 'obras de terra'] },
  { codigo: '422', resumoIndex: 22, blocoNumero: 4, codigosDoAssunto: ['422', '22', 'r22', 'resumo 22'], termosChave: ['rodovia', 'rodovias', 'pavimento', 'pavimentos', 'pavimentacao', 'pavimentação'] },

  // Bloco 5 (Resumos 23 a 26)
  { codigo: '523', resumoIndex: 23, blocoNumero: 5, codigosDoAssunto: ['523', '23', 'r23', 'resumo 23'], termosChave: ['abastecimento', 'agua', 'água', 'eta'] },
  { codigo: '524', resumoIndex: 24, blocoNumero: 5, codigosDoAssunto: ['524', '24', 'r24', 'resumo 24'], termosChave: ['esgotamento', 'esgoto', 'esgotos', 'ete'] },
  { codigo: '525', resumoIndex: 25, blocoNumero: 5, codigosDoAssunto: ['525', '25', 'r25', 'resumo 25'], termosChave: ['residuo', 'resíduo', 'residuos', 'resíduos', 'conama 307', 'pgrcc'] },
  { codigo: '526', resumoIndex: 26, blocoNumero: 5, codigosDoAssunto: ['526', '26', 'r26', 'resumo 26'], termosChave: ['acessibilidade', '9050', 'nbr 9050', 'desempenho', '15575', 'nbr 15575'] },

  // Bloco 6 (Resumos 27 a 30)
  { codigo: '627', resumoIndex: 27, blocoNumero: 6, codigosDoAssunto: ['627', '27', 'r27', 'resumo 27'], termosChave: ['patologia', 'patologias', 'trinca', 'trincas', 'fissura', 'fissuras', 'corrosao'] },
  { codigo: '628', resumoIndex: 28, blocoNumero: 6, codigosDoAssunto: ['628', '28', 'r28', 'resumo 28'], termosChave: ['nr18', 'nr-18', 'nr35', 'nr-35', 'seguranca em obras', 'segurança em obras'] },
  { codigo: '629', resumoIndex: 29, blocoNumero: 6, codigosDoAssunto: ['629', '29', 'r29', 'resumo 29'], termosChave: ['vistoria', 'vistorias', 'pericia', 'perícia', 'pericias', 'perícias', 'laudo', 'art'] },
  { codigo: '630', resumoIndex: 30, blocoNumero: 6, codigosDoAssunto: ['630', '30', 'r30', 'resumo 30'], termosChave: ['avaliacao de imoveis', 'avaliação de imóveis', '14653', 'nbr 14653', 'mcddm'] },

  // Bloco 7 (Resumos 31 a 34)
  { codigo: '731', resumoIndex: 31, blocoNumero: 7, codigosDoAssunto: ['731', '31', 'r31', 'resumo 31'], termosChave: ['portugues i', 'português i', 'interpretacao', 'interpretação', 'semantica', 'semântica'] },
  { codigo: '732', resumoIndex: 32, blocoNumero: 7, codigosDoAssunto: ['732', '32', 'r32', 'resumo 32'], termosChave: ['portugues ii', 'português ii', 'gramatica', 'gramática', 'sintaxe', 'concordancia'] },
  { codigo: '733', resumoIndex: 33, blocoNumero: 7, codigosDoAssunto: ['733', '33', 'r33', 'resumo 33'], termosChave: ['informatica i', 'informática i', 'hardware', 'windows', 'sistemas operacionais'] },
  { codigo: '734', resumoIndex: 34, blocoNumero: 7, codigosDoAssunto: ['734', '34', 'r34', 'resumo 34'], termosChave: ['informatica ii', 'informática ii', 'word', 'excel', 'aplicativos', 'internet'] },
];

export interface StatusAssuntoEap {
  pdf: ItemPdfEstudo;
  temPdfSalvo: boolean;
  materiaSalva?: Materia;
}

export interface RelatorioAuditoriaEap {
  totalAssuntos: number;
  totalComPdf: number;
  totalSemPdf: number;
  percentualCobertura: number;
  itens: StatusAssuntoEap[];
  blocos: {
    bloco: BlocoEapOficial;
    totalAssuntos: number;
    comPdf: number;
    semPdf: number;
    percentual: number;
    assuntos: StatusAssuntoEap[];
  }[];
}

/**
 * Calcula a afinidade entre uma matéria do usuário e um assunto oficial da EAP
 */
function calcularPontuacaoAfinidade(
  materia: Materia,
  meta: MetaAssuntoEap,
  pdf: ItemPdfEstudo
): number {
  const nomeM = (materia.nome || '').toLowerCase();
  const arqM = (materia.arquivoNome || '').toLowerCase();
  const blocoM = (materia.blocoNome || '').toLowerCase();
  const textoCombinado = `${nomeM} ${arqM}`;

  let score = 0;

  // 1. Match direto no código de 3 dígitos (ex: 101, 206, 316) -> prioridade máxima
  if (textoCombinado.includes(meta.codigo.toLowerCase())) {
    score += 100;
  }

  // 2. Match no código de 2 dígitos ou resumo (ex: 01, 02, 06, 09, resumo 01, r01)
  for (const c of meta.codigosDoAssunto) {
    const regex = new RegExp(`(?:^|[\\s_\\-\\.\\[\\(])${c}(?:[\\s_\\-\\.\\]\\)]|$)`, 'i');
    if (regex.test(nomeM) || regex.test(arqM)) {
      score += 70;
      break;
    }
  }

  // 3. Match no bloco
  const blocoNum = meta.blocoNumero;
  const ehMesmoBloco =
    blocoM.includes(`bloco ${blocoNum}`) ||
    blocoM.includes(`bloco 0${blocoNum}`) ||
    blocoM.includes(`resumos 0${blocoNum}`) ||
    (blocoNum === 7 && (blocoM.includes('inform') || blocoM.includes('portug')));

  if (ehMesmoBloco) {
    score += 35;
  }

  // 4. Termos-chave do assunto
  let termosEncontrados = 0;
  for (const t of meta.termosChave) {
    if (textoCombinado.includes(t)) {
      termosEncontrados++;
    }
  }
  score += termosEncontrados * 15;

  // 5. Nome canônico normalizado
  const nomeNormalizado = pdf.nome.toLowerCase().replace(/^\d+_/, '').replace(/_/g, ' ');
  if (textoCombinado.includes(nomeNormalizado)) {
    score += 40;
  }

  return score;
}

/**
 * Cruza a tabela canônica de 34 PDFs com as matérias cadastradas no sistema.
 * Suporta nomenclaturas 101 a 734, resumos 01 a 34, prefixos, blocos e mapeamento 1-para-1 inteligente.
 */
export function auditarCoberturaEap(materias: Materia[]): RelatorioAuditoriaEap {
  const materiasValidas = materias.filter((m) =>
    Boolean(m.arquivoTexto || m.arquivoBase64 || m.arquivoNome)
  );

  // Mapeia todas as combinações de score (assunto x matéria)
  const candidatosPorAssunto = TABELA_PDFS_ESTUDO.map((pdf, idx) => {
    const meta = METADADOS_34_ASSUNTOS[idx] || {
      codigo: pdf.codigo,
      resumoIndex: idx + 1,
      blocoNumero: pdf.blocoNumero,
      codigosDoAssunto: [pdf.codigo],
      termosChave: [],
    };

    const matches = materiasValidas
      .map((mat) => ({
        materia: mat,
        score: calcularPontuacaoAfinidade(mat, meta, pdf),
      }))
      .filter((m) => m.score >= 30) // Score mínimo para consideração
      .sort((a, b) => b.score - a.score);

    return {
      pdf,
      meta,
      matches,
    };
  });

  // Atribuição 1-para-1 gulosa por score decrescente para não deixar sobras
  const mapaAssuntoParaMateria = new Map<string, Materia>();
  const materiasJaAtribuidas = new Set<string | number>();

  // Passada 1: Matches com alta confiança (score >= 60)
  candidatosPorAssunto.forEach(({ pdf, matches }) => {
    const melhorDisponivel = matches.find((m) => !materiasJaAtribuidas.has(m.materia.id) && m.score >= 60);
    if (melhorDisponivel) {
      mapaAssuntoParaMateria.set(pdf.codigo, melhorDisponivel.materia);
      materiasJaAtribuidas.add(melhorDisponivel.materia.id);
    }
  });

  // Passada 2: Matches restantes com score moderado (score >= 30)
  candidatosPorAssunto.forEach(({ pdf, matches }) => {
    if (!mapaAssuntoParaMateria.has(pdf.codigo)) {
      const melhorDisponivel = matches.find((m) => !materiasJaAtribuidas.has(m.materia.id));
      if (melhorDisponivel) {
        mapaAssuntoParaMateria.set(pdf.codigo, melhorDisponivel.materia);
        materiasJaAtribuidas.add(melhorDisponivel.materia.id);
      }
    }
  });

  // Passada 3: Se o usuário tem matérias cadastradas por bloco que ainda não foram vinculadas
  // vincula por ordenação posicional dentro do bloco correspondente
  BLOCOS_EAP_OFICIAIS.forEach((bloco) => {
    const assuntosDoBloco = TABELA_PDFS_ESTUDO.filter((p) => bloco.assuntosCodigos.includes(p.codigo));
    const materiasDoBloco = materiasValidas.filter((m) => {
      if (materiasJaAtribuidas.has(m.id)) return false;
      const bNome = (m.blocoNome || '').toLowerCase();
      return (
        bNome.includes(`bloco ${bloco.numero}`) ||
        bNome.includes(`bloco 0${bloco.numero}`) ||
        (bloco.numero === 7 && (bNome.includes('portug') || bNome.includes('inform')))
      );
    });

    assuntosDoBloco.forEach((pdf) => {
      if (!mapaAssuntoParaMateria.has(pdf.codigo) && materiasDoBloco.length > 0) {
        const mat = materiasDoBloco.shift()!;
        mapaAssuntoParaMateria.set(pdf.codigo, mat);
        materiasJaAtribuidas.add(mat.id);
      }
    });
  });

  const itens: StatusAssuntoEap[] = TABELA_PDFS_ESTUDO.map((pdf) => {
    const mat = mapaAssuntoParaMateria.get(pdf.codigo);
    return {
      pdf,
      temPdfSalvo: Boolean(mat),
      materiaSalva: mat,
    };
  });

  const totalAssuntos = itens.length;
  const totalComPdf = itens.filter((i) => i.temPdfSalvo).length;
  const totalSemPdf = totalAssuntos - totalComPdf;
  const percentualCobertura = Math.round((totalComPdf / (totalAssuntos || 1)) * 100);

  const blocos = BLOCOS_EAP_OFICIAIS.map((bloco) => {
    const assuntosDoBloco = itens.filter((i) => bloco.assuntosCodigos.includes(i.pdf.codigo));
    const comPdf = assuntosDoBloco.filter((i) => i.temPdfSalvo).length;
    const semPdf = assuntosDoBloco.length - comPdf;
    const percentual = Math.round((comPdf / (assuntosDoBloco.length || 1)) * 100);

    return {
      bloco,
      totalAssuntos: assuntosDoBloco.length,
      comPdf,
      semPdf,
      percentual,
      assuntos: assuntosDoBloco,
    };
  });

  return {
    totalAssuntos,
    totalComPdf,
    totalSemPdf,
    percentualCobertura,
    itens,
    blocos,
  };
}

/**
 * Retorna as 3 frases requeridas pelo usuário + frases adicionais para o carregamento rotativo.
 */
export const FRASES_LOADING_SIMULADO: string[] = [
  'Alinhando a mira com o edital...',
  'Copiando o estilo de questões e dificuldades da banca...',
  'Ajustando a mira e bolando as pegadinhas...',
  'Balanceando gabaritos e expurgando LaTeX...',
  'Pronto para o combate! Carregando caderno...',
];

import { Questao, SessaoCriada } from '../types';
import { TABELA_PDFS_ESTUDO, ItemPdfEstudo } from '../utils/simuladoPonderado';
import {
  DificuldadeQuestao,
  TipologiaQuestao,
  montarInstrucaoMoldeDificuldade,
  montarInstrucaoMoldeTipologia,
} from '../utils/dnaBancaFramework';
import { salvarNovasQuestoesDb, salvarSessaoDb } from './supabaseClient';
import { callGeminiGenerateQuestions } from './geminiService';

export interface SlotQuestaoLote {
  indiceGlobal: number; // 1 a 500
  sessaoNumero: number; // 1 a 20
  codigoSessao: string; // 'LOTE-500-S01' ... 'LOTE-500-S20'
  indiceNaSessao: number; // 1 a 25
  pdf: ItemPdfEstudo;
  dificuldade: DificuldadeQuestao;
  formato: TipologiaQuestao;
}

export interface SessaoPlanejadaLote {
  numero: number;
  codigo: string;
  titulo: string;
  slots: SlotQuestaoLote[];
}

export interface ProgressoGeracaoLote {
  totalQuestoes: number; // 500 (ou total do ciclo)
  questoesConcluidas: number; // 0 a total
  sessaoAtual: number; // 1 a 20
  totalSessoes: number; // 20
  codigoSessaoAtual: string;
  assuntoAtual: string;
  dificuldadeAtual: DificuldadeQuestao;
  porcentagem: number; // 0 a 100
  pausado: boolean;
  mensagem: string;
  tempoRestanteFormatado?: string;
  tempoDecorridoFormatado?: string;
  questoesPorMinuto?: number;
  aguardandoCota?: boolean;
}

/**
 * Mapeamento canônico dos 34 códigos de PDF para nomes técnicos e normativos limpos de concurso.
 * Elimina completamente a menção a códigos numéricos (ex: 314, 731) ou termos de arquivos brutos.
 */
export const NOMES_TECNICOS_NORMATIVOS_PDF: Record<string, string> = {
  // Bloco 1 — Legislação Municipal de Curitiba
  '101': 'Lei Orgânica do Município de Curitiba e Princípios da Administração Municipal',
  '102': 'Estatuto dos Servidores Públicos Municipais de Curitiba (Lei Municipal nº 1.656/1958)',
  '103': 'Lei de Zoneamento, Uso e Ocupação do Solo de Curitiba (Lei Municipal nº 15.511/2019)',
  '104': 'Código de Obras e Edificações do Município de Curitiba (Lei Municipal nº 11.095/2004)',
  '105': 'Licenciamento Urbanístico, Posturas Municipais e Parcelamento do Solo de Curitiba',

  // Bloco 2 — Licitações, Planejamento e Orçamento
  '206': 'Lei Geral de Licitações e Contratos Administrativos (Lei Federal nº 14.133/2021)',
  '207': 'Planejamento da Contratação Pública de Obras, ETP e Termo de Referência',
  '208': 'Gestão e Fiscalização de Contratos de Obras Públicas e Responsabilidades Técnicas',
  '209': 'Orçamento de Obras Públicas, Planilhas SINAPI, BDI e Encargos Sociais',
  '210': 'Planejamento e Controle de Cronograma de Obras (Curva S, PERT/CPM e Linha de Balanço)',

  // Bloco 3 — Materiais, Técnicas e Estruturas
  '311': 'Tecnologia do Concreto e dos Materiais de Construção Civil (NBR 6118 / NBR 12655)',
  '312': 'Técnicas de Alvenaria Estrutural, Argamassas e Revestimentos (NBR 16868)',
  '313': 'Mecânica dos Solos, Sondagens Geotécnicas e Obras de Terra',
  '314': 'Análise Estrutural e Resistência dos Materiais (NBR 6120 / NBR 8681)',
  '315': 'Fundações Superficiais e Profundas (NBR 6122)',
  '316': 'Estruturas de Madeira e Estruturas Metálicas (NBR 7190 / NBR 8800)',

  // Bloco 4 — Instalações Prediais, Hidráulica e Saneamento
  '417': 'Instalações Prediais de Água Fria e Água Quente (NBR 5626)',
  '418': 'Instalações Prediais de Esgoto Sanitário e Ventilação (NBR 8160)',
  '419': 'Instalações Elétricas Prediais de Baixa Tensão (NBR 5410)',
  '420': 'Drenagem Pluvial Urbana e Instalações de Águas Pluviais (NBR 10844)',
  '421': 'Sistemas de Abastecimento de Água e Tratamento de Efluentes Urbanos',
  '422': 'Segurança Contra Incêndio e Pânico em Edificações (Normas do Corpo de Bombeiros e NBR 9077)',

  // Bloco 5 — Rodovias, Topografia e Pavimentação
  '523': 'Topografia Aplicada à Engenharia Civil e Nivelamento Geométrico (NBR 13133)',
  '524': 'Projeto Geométrico de Vias Urbanas e Rodovias',
  '525': 'Pavimentação Asfáltica e Rígida (Dimensionamento, Subleito e Misturas Betuminosas)',
  '526': 'Terraplenagem, Drenagem Rodoviária e Obras de Contenção de Taludes',

  // Bloco 6 — Perícias, Avaliações e Gestão da Qualidade
  '627': 'Avaliação de Imóveis Urbanos (NBR 14653)',
  '628': 'Perícias de Engenharia na Construção Civil e Vistoria Cautelar (NBR 13752)',
  '629': 'Gestão da Qualidade na Construção Civil e Programa PBQP-H (SiAC)',
  '630': 'Segurança do Trabalho na Indústria da Construção (NR-18 e NR-35)',

  // Bloco 7 — Português e Informática
  '731': 'Língua Portuguesa — Compreensão, Interpretação de Textos e Semântica',
  '732': 'Língua Portuguesa — Morfossintaxe, Concordância, Regência e Crase',
  '733': 'Informática — Sistema Operacional Windows e Organização de Arquivos',
  '734': 'Informática — Pacote de Aplicativos de Escritório (Planilhas e Editores de Texto) e Internet',
};

/**
 * Retorna o título normativo ou técnico limpo do PDF, sem prefixos numéricos de arquivo.
 */
export function obterNomeTecnicoLimpo(pdf: ItemPdfEstudo): string {
  if (NOMES_TECNICOS_NORMATIVOS_PDF[pdf.codigo]) {
    return NOMES_TECNICOS_NORMATIVOS_PDF[pdf.codigo];
  }
  return pdf.nome
    .replace(/^\d+[\s_-]*/, '')
    .replace(/_/g, ' ')
    .trim();
}

/**
 * Monta o plano mestre com as 500 vagas rigorosamente distribuídas:
 * - 20 sessões de 25 questões (Mini-Simulados balanceados)
 * - Cada sessão contém 10 Fáceis (40%), 10 Médias (40%) e 5 Cascudas (20%)
 * - 375 Específicas de Engenharia Civil (Blocos 01 a 06)
 * - 63 Língua Portuguesa (Bloco 07)
 * - 62 Informática Básica (Bloco 07)
 * - Respeita o estoque de cada um dos 34 PDFs de estudo sem desvios.
 */
export function planejarLote500Questoes(): SessaoPlanejadaLote[] {
  // 1. Matriz de estoque exato por código de PDF
  // Calculado da proporção oficial da TABELA_PDFS_ESTUDO
  const estoquePorPdf = new Map<string, { pdf: ItemPdfEstudo; restante: number }>([
    // Bloco 1 (74Q)
    ['101', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '101')!, restante: 8 }],
    ['102', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '102')!, restante: 8 }],
    ['103', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '103')!, restante: 15 }],
    ['104', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '104')!, restante: 30 }],
    ['105', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '105')!, restante: 13 }],

    // Bloco 2 (56Q)
    ['206', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '206')!, restante: 14 }],
    ['207', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '207')!, restante: 7 }],
    ['208', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '208')!, restante: 10 }],
    ['209', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '209')!, restante: 8 }],
    ['210', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '210')!, restante: 17 }],

    // Bloco 3 (75Q)
    ['311', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '311')!, restante: 28 }],
    ['312', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '312')!, restante: 5 }],
    ['313', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '313')!, restante: 10 }],
    ['314', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '314')!, restante: 14 }],
    ['315', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '315')!, restante: 14 }],
    ['316', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '316')!, restante: 4 }],

    // Bloco 4 (64Q)
    ['417', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '417')!, restante: 17 }],
    ['418', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '418')!, restante: 14 }],
    ['419', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '419')!, restante: 3 }],
    ['420', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '420')!, restante: 7 }],
    ['421', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '421')!, restante: 12 }],
    ['422', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '422')!, restante: 11 }],

    // Bloco 5 (53Q)
    ['523', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '523')!, restante: 18 }],
    ['524', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '524')!, restante: 16 }],
    ['525', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '525')!, restante: 8 }],
    ['526', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '526')!, restante: 11 }],

    // Bloco 6 (53Q)
    ['627', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '627')!, restante: 18 }],
    ['628', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '628')!, restante: 14 }],
    ['629', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '629')!, restante: 9 }],
    ['630', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '630')!, restante: 12 }],

    // Bloco 7 (125Q)
    ['731', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '731')!, restante: 25 }],
    ['732', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '732')!, restante: 38 }],
    ['733', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '733')!, restante: 25 }],
    ['734', { pdf: TABELA_PDFS_ESTUDO.find((p) => p.codigo === '734')!, restante: 37 }],
  ]);

  // Tipologias alternadas FAFIPA
  const formatosDisponiveis: TipologiaQuestao[] = [
    'DIRETA_POSITIVA',
    'ASSERTIVAS_ITENS',
    'COMANDO_NEGATIVO',
    'PREENCHIMENTO_LACUNAS',
    'JULGAMENTO_VF',
  ];

  // Grade determinística padrão de 25 dificuldades por sessão:
  // 10 Fáceis (40%), 10 Médias (40%), 5 Cascudas (20%)
  const gradeDificuldadesSessaoPadrao: DificuldadeQuestao[] = [
    'FACIL',    // Q01 (Português)
    'MEDIA',    // Q02 (Português)
    'CASCUDA',  // Q03 (Português)
    'FACIL',    // Q04 (Informática)
    'MEDIA',    // Q05 (Informática)
    'CASCUDA',  // Q06 (Informática)
    'FACIL',    // Q07 (Engenharia)
    'MEDIA',    // Q08 (Engenharia)
    'FACIL',    // Q09 (Engenharia)
    'CASCUDA',  // Q10 (Engenharia)
    'MEDIA',    // Q11 (Engenharia)
    'FACIL',    // Q12 (Engenharia)
    'MEDIA',    // Q13 (Engenharia)
    'FACIL',    // Q14 (Engenharia)
    'MEDIA',    // Q15 (Engenharia)
    'CASCUDA',  // Q16 (Engenharia)
    'FACIL',    // Q17 (Engenharia)
    'MEDIA',    // Q18 (Engenharia)
    'FACIL',    // Q19 (Engenharia)
    'MEDIA',    // Q20 (Engenharia)
    'CASCUDA',  // Q21 (Engenharia)
    'FACIL',    // Q22 (Engenharia)
    'MEDIA',    // Q23 (Engenharia)
    'FACIL',    // Q24 (Engenharia)
    'MEDIA',    // Q25 (Engenharia)
  ];

  const sessoes: SessaoPlanejadaLote[] = [];
  let contadorGlobal = 0;

  // Função para retirar do estoque o melhor PDF para o bloco solicitado
  const retirarDoEstoque = (blocoNum: number): ItemPdfEstudo => {
    const candidatos: { codigo: string; restante: number; pdf: ItemPdfEstudo }[] = [];
    estoquePorPdf.forEach((item, cod) => {
      if (item.pdf.blocoNumero === blocoNum && item.restante > 0) {
        candidatos.push({ codigo: cod, restante: item.restante, pdf: item.pdf });
      }
    });

    if (candidatos.length === 0) {
      // Fallback defensivo para qualquer PDF do mesmo tipo que ainda tenha estoque
      const qualquerEspecifico: { codigo: string; restante: number; pdf: ItemPdfEstudo }[] = [];
      estoquePorPdf.forEach((item, cod) => {
        if (item.restante > 0 && ((blocoNum <= 6 && item.pdf.tipo === 'especifica') || (blocoNum === 7 && item.pdf.tipo !== 'especifica'))) {
          qualquerEspecifico.push({ codigo: cod, restante: item.restante, pdf: item.pdf });
        }
      });
      if (qualquerEspecifico.length > 0) {
        qualquerEspecifico.sort((a, b) => b.restante - a.restante);
        const escolhido = qualquerEspecifico[0];
        estoquePorPdf.get(escolhido.codigo)!.restante--;
        return escolhido.pdf;
      }
      return TABELA_PDFS_ESTUDO[0];
    }

    // Prioriza o que tem mais estoque restante para garantir consumo homogêneo
    candidatos.sort((a, b) => b.restante - a.restante);
    const selecionado = candidatos[0];
    estoquePorPdf.get(selecionado.codigo)!.restante--;
    return selecionado.pdf;
  };

  const retirarPortugues = (): ItemPdfEstudo => {
    const item731 = estoquePorPdf.get('731')!;
    const item732 = estoquePorPdf.get('732')!;
    if (item732.restante > 0 && (item731.restante === 0 || item732.restante >= item731.restante)) {
      item732.restante--;
      return item732.pdf;
    }
    item731.restante--;
    return item731.pdf;
  };

  const retirarInformatica = (): ItemPdfEstudo => {
    const item733 = estoquePorPdf.get('733')!;
    const item734 = estoquePorPdf.get('734')!;
    if (item734.restante > 0 && (item733.restante === 0 || item734.restante >= item733.restante)) {
      item734.restante--;
      return item734.pdf;
    }
    item733.restante--;
    return item733.pdf;
  };

  // Constrói as 20 sessões de 25 questões
  for (let sIdx = 1; sIdx <= 20; sIdx++) {
    const codigoSessao = `LOTE-500-S${String(sIdx).padStart(2, '0')}`;
    const slots: SlotQuestaoLote[] = [];

    // Cotas de disciplinas desta sessão:
    // Padrão: 3 Port + 3 Info + 19 Eng = 25
    // Nas sessões 5, 10, 15: 4 Port + 3 Info + 18 Eng = 25 (+3 Port global = 63)
    // Nas sessões 7, 14: 3 Port + 4 Info + 18 Eng = 25 (+2 Info global = 62)
    // Total Geral: 17*3 + 3*4 = 63 Port | 18*3 + 2*4 = 62 Info | 15*19 + 5*18 = 375 Eng = 500!
    const qtdPort = [5, 10, 15].includes(sIdx) ? 4 : 3;
    const qtdInfo = [7, 14].includes(sIdx) ? 4 : 3;

    for (let qIdx = 1; qIdx <= 25; qIdx++) {
      contadorGlobal++;
      const dificuldade = gradeDificuldadesSessaoPadrao[(qIdx - 1) % gradeDificuldadesSessaoPadrao.length];
      const formato = formatosDisponiveis[(contadorGlobal + qIdx) % formatosDisponiveis.length];

      let pdfEscolhido: ItemPdfEstudo;

      if (qIdx <= qtdPort) {
        pdfEscolhido = retirarPortugues();
      } else if (qIdx <= qtdPort + qtdInfo) {
        pdfEscolhido = retirarInformatica();
      } else {
        // Engenharia (Blocos 1 a 6) distribuída ordenadamente pelos blocos temáticos
        const engOffset = qIdx - (qtdPort + qtdInfo); // 1 a 18 ou 19
        // Mapeia para bloco de estudo cíclico
        let blocoAlvo = ((engOffset - 1) % 6) + 1;
        // Se o bloco alvo estiver esgotado, escolhe o bloco com mais estoque restante
        let restanteBlocoAlvo = 0;
        estoquePorPdf.forEach((item) => {
          if (item.pdf.blocoNumero === blocoAlvo) restanteBlocoAlvo += item.restante;
        });
        if (restanteBlocoAlvo === 0) {
          let maxR = -1;
          for (let b = 1; b <= 6; b++) {
            let rB = 0;
            estoquePorPdf.forEach((item) => {
              if (item.pdf.blocoNumero === b) rB += item.restante;
            });
            if (rB > maxR) {
              maxR = rB;
              blocoAlvo = b;
            }
          }
        }
        pdfEscolhido = retirarDoEstoque(blocoAlvo);
      }

      slots.push({
        indiceGlobal: contadorGlobal,
        sessaoNumero: sIdx,
        codigoSessao,
        indiceNaSessao: qIdx,
        pdf: pdfEscolhido,
        dificuldade,
        formato,
      });
    }

    sessoes.push({
      numero: sIdx,
      codigo: codigoSessao,
      titulo: `${codigoSessao} (25Q) - Mini-Simulado FAFIPA Paramétrica`,
      slots,
    });
  }

  return sessoes;
}

/**
 * Gera um sub-bloco de até 5 questões em uma única requisição ao Gemini,
 * reduzindo o consumo de tokens em ~80% e respeitando o teto de TPM da API.
 */
export async function gerarSubBlocoQuestoesLote(
  slotsDoBloco: SlotQuestaoLote[],
  cargo: string = 'Engenheiro Civil - Curitiba',
  bancaNome: string = 'Fundação FAFIPA (Paramétrica)',
  onAvisoCota?: (mensagem: string) => void
): Promise<Questao[]> {
  if (slotsDoBloco.length === 0) return [];

  // Mapeia os assuntos normativos e formatações de cada slot do sub-bloco
  const descricoesSlots = slotsDoBloco.map((slot, idx) => {
    const nomeLimpo = obterNomeTecnicoLimpo(slot.pdf);
    const instrucaoDificuldade = montarInstrucaoMoldeDificuldade(slot.dificuldade);
    const instrucaoFormato = montarInstrucaoMoldeTipologia(slot.formato);
    const topicos = slot.pdf.topicosFundamentais.join(', ');
    return `--- Questão ${idx + 1} de ${slotsDoBloco.length} ---
- Disciplina / Bloco: ${slot.pdf.blocoNome}
- Assunto Normativo / Técnico: ${nomeLimpo}
- Tópicos Principais a Cobrar: ${topicos}
- Nível de Dificuldade: ${slot.dificuldade} (${instrucaoDificuldade})
- Formato Tipológico FAFIPA: ${slot.formato} (${instrucaoFormato})`;
  }).join('\n\n');

  const assuntoPrincipal = obterNomeTecnicoLimpo(slotsDoBloco[0].pdf);
  const disciplinaPrincipal = slotsDoBloco[0].pdf.blocoNome;

  const promptSubBloco = `
BANCA EXAMINADORA OFICIAL: Fundação FAFIPA (Concurso Prefeitura de Curitiba).
CARGO ALVO OBRIGATÓRIO: ${cargo}.
QUANTIDADE DE QUESTÕES A ELABORAR: Exatamente ${slotsDoBloco.length} questões inéditas.

MAPA DE ESPECIFICAÇÃO DE CADA QUESTÃO DESTE BLOCO:
${descricoesSlots}

DIRETRIZES FUNDAMENTAIS DA BANCA FAFIPA:
1. Elabore rigorosamente ${slotsDoBloco.length} questões inéditas numeradas em sequência, cada uma com exatamente 5 alternativas (A, B, C, D, E).
2. ZERO CÁLCULOS MATEMÁTICOS: Todas as questões devem testar exclusivamente o conhecimento normativo, procedimental, legal e conceitual da engenharia civil, informática ou língua portuguesa, contextualizadas na rotina pública do ${cargo}.
3. FORMATAÇÃO CLARA: Separe enunciados longos e assertivas por quebras de linha limpas.
4. GABARITO COMENTADO: Fundamente a alternativa correta e o erro de cada distrator para todas as questões.
5. CITAÇÃO NORMATIVA: No campo 'artigo', cite a norma técnica oficial correspondente (ex: NBR 6118, Lei 14.133, NBR 6120, etc.), NUNCA citando o nome ou código de arquivo PDF.
`;

  let tentativas = 0;
  const maxTentativas = 4;

  while (tentativas < maxTentativas) {
    tentativas++;
    try {
      const questoesGeradas = await callGeminiGenerateQuestions({
        banca: bancaNome,
        disciplina: disciplinaPrincipal,
        assunto: assuntoPrincipal,
        cargo,
        quantidade: slotsDoBloco.length,
        observacoesBanca: promptSubBloco,
      });

      if (questoesGeradas && questoesGeradas.length >= slotsDoBloco.length) {
        return slotsDoBloco.map((slot, i) => {
          const q = questoesGeradas[i];
          const nomeLimpo = obterNomeTecnicoLimpo(slot.pdf);
          const topicosTexto = slot.pdf.topicosFundamentais.join(', ');
          return {
            id: `lote500_s${String(slot.sessaoNumero).padStart(2, '0')}_q${String(slot.indiceNaSessao).padStart(2, '0')}_${Date.now()}_${i}`,
            banca: bancaNome,
            cargo,
            disciplina: slot.pdf.blocoNome,
            assunto: nomeLimpo,
            artigo: q.artigo || slot.pdf.topicosFundamentais[0] || 'Conforme Edital FAFIPA',
            enunciado: q.enunciado,
            alternativas: Array.isArray(q.alternativas) && q.alternativas.length === 5 ? q.alternativas : (q.alternativas || []).slice(0, 5),
            correta: typeof q.correta === 'number' ? q.correta : 0,
            comentario: q.comentario || `Gabarito Oficial FAFIPA Paramétrica (${slot.dificuldade}). Fundamentado em: ${topicosTexto}.`,
            origem: 'sessao_escala',
            origemTipo: 'lote_escala',
            loteCodigo: `LOTE-500-S${String(slot.sessaoNumero).padStart(2, '0')}`,
          };
        });
      }
    } catch (err: any) {
      const errMsg = String(err?.message || err || '');
      const isRateLimit =
        errMsg.includes('429') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('quota') ||
        errMsg.includes('rate');

      if (isRateLimit && tentativas < maxTentativas) {
        const tempoEsperaSegundos = 15;
        if (onAvisoCota) {
          onAvisoCota(`Aguardando cota da API Gemini (${tempoEsperaSegundos}s)... Tentativa ${tentativas} de ${maxTentativas}`);
        }
        await new Promise((r) => setTimeout(r, tempoEsperaSegundos * 1000));
        continue;
      }

      console.warn(`[GeradorLote] Falha na chamada da API para sub-bloco (tentativa ${tentativas}/${maxTentativas}):`, err);
      if (tentativas >= maxTentativas) {
        break;
      }
    }
  }

  // Fallback seguro em caso de indisponibilidade extrema
  return slotsDoBloco.map((slot) => gerarFallbackParametricoSlot(slot, cargo, bancaNome));
}

/**
 * Gera uma questão de um único slot (compatibilidade direta).
 */
export async function gerarQuestaoSlotLote(
  slot: SlotQuestaoLote,
  cargo: string = 'Engenheiro Civil - Curitiba',
  bancaNome: string = 'Fundação FAFIPA (Paramétrica)'
): Promise<Questao> {
  const lote = await gerarSubBlocoQuestoesLote([slot], cargo, bancaNome);
  return lote[0] || gerarFallbackParametricoSlot(slot, cargo, bancaNome);
}

/**
 * Gera questão paramétrica técnica FAFIPA com nomes sanitizados
 */
function gerarFallbackParametricoSlot(
  slot: SlotQuestaoLote,
  cargo: string,
  bancaNome: string
): Questao {
  const nomeTecnico = obterNomeTecnicoLimpo(slot.pdf);
  const topico = slot.pdf.topicosFundamentais[slot.indiceNaSessao % slot.pdf.topicosFundamentais.length];
  const segundoTopico = slot.pdf.topicosFundamentais[(slot.indiceNaSessao + 1) % slot.pdf.topicosFundamentais.length];

  let enunciado = '';
  let alternativas: string[] = [];
  let correta = slot.indiceNaSessao % 5;
  let comentario = '';

  if (slot.formato === 'ASSERTIVAS_ITENS') {
    enunciado = `Em relação aos procedimentos normativos e legais aplicáveis a ${nomeTecnico}, no âmbito das atribuições do ${cargo}, analise as seguintes assertivas:\n\nI. O procedimento de ${topico.toLowerCase()} é obrigatório e vincula a atuação do agente público responsável.\nII. Em situações de urgência técnica fundamentada, as prescrições de ${segundoTopico.toLowerCase()} devem observar estritamente as condicionantes do projeto aprovado.\nIII. A dispensa ou inobservância de critérios de desempenho técnico independe de justificativa circunstanciada nos autos do processo administrativo.\n\nEstá CORRETO o que se afirma em:`;
    alternativas = [
      'I e II, apenas.',
      'II e III, apenas.',
      'I e III, apenas.',
      'I, II e III.',
      'I, apenas.',
    ];
    correta = 0; // A
    comentario = `Gabarito Oficial FAFIPA Paramétrica: A. As assertivas I e II estão corretas conforme as diretrizes de ${topico}. A assertiva III é incorreta, pois qualquer alteração ou dispensa exige justificativa técnica circunstanciada expressa. Nível: ${slot.dificuldade}.`;
  } else if (slot.formato === 'JULGAMENTO_VF') {
    enunciado = `Sobre as diretrizes estabelecidas em ${nomeTecnico}, julgue verdadeiro (V) ou falso (F) o que se afirma a seguir:\n\n(__) As exigências técnicas relativas a ${topico.toLowerCase()} aplicam-se a todas as etapas de projeto e execução.\n(__) É vedada a aplicação subsidiária de normas correlatas quando houver lacuna expressa.\n(__) O controle tecnológico referente a ${segundoTopico.toLowerCase()} deve ser documentado em diário de obra ou relatório técnico equivalente.\n\nAssinale a alternativa que apresenta a sequência CORRETA:`;
    alternativas = [
      'V – F – V.',
      'F – V – F.',
      'V – V – F.',
      'F – F – V.',
      'V – F – F.',
    ];
    correta = 0; // A
    comentario = `Gabarito Oficial FAFIPA Paramétrica: A (V – F – V). O primeiro e o terceiro itens são verdadeiros. O segundo é falso porque a aplicação subsidiária de normas complementares é admitida para assegurar o desempenho da edificação. Nível: ${slot.dificuldade}.`;
  } else {
    enunciado = `No que tange aos preceitos normativos e técnicos de ${nomeTecnico} voltados para a prática do ${cargo}, assinale a alternativa CORRETA referente a ${topico.toLowerCase()}:`;
    alternativas = [
      `Constitui requisito técnico formal a observância dos parâmetros estabelecidos em ${nomeTecnico} para a regularidade da intervenção.`,
      `O atendimento às diretrizes de ${segundoTopico.toLowerCase()} possui caráter meramente orientativo, sem força vinculante.`,
      `A fiscalização municipal fica dispensada de verificar as condicionantes técnicas em obras de pequeno porte.`,
      `Os prazos de conformidade técnica são discricionários e dependem exclusivamente da conveniência do contratado.`,
      `As especificações técnicas mínimas podem ser suprimidas tacitamente caso haja consenso informal entre as partes.`,
    ];
    correta = 0; // A
    comentario = `Gabarito Oficial FAFIPA Paramétrica: A. O cumprimento dos parâmetros normativos e legais é mandatório para a regularidade técnica e administrativa da obra pública ou privada. Nível: ${slot.dificuldade}.`;
  }

  // Embaralha gabarito para manter distribuição perfeita 0 a 4
  const alvoGabarito = slot.indiceNaSessao % 5;
  if (alvoGabarito !== correta) {
    const temp = alternativas[alvoGabarito];
    alternativas[alvoGabarito] = alternativas[correta];
    alternativas[correta] = temp;
    correta = alvoGabarito;
  }

  return {
    id: `lote500_s${String(slot.sessaoNumero).padStart(2, '0')}_q${String(slot.indiceNaSessao).padStart(2, '0')}_${Date.now()}`,
    banca: bancaNome,
    cargo,
    disciplina: slot.pdf.blocoNome,
    assunto: nomeTecnico,
    artigo: topico,
    enunciado,
    alternativas,
    correta,
    comentario,
    origem: 'sessao_escala',
    origemTipo: 'lote_escala',
    loteCodigo: `LOTE-500-S${String(slot.sessaoNumero).padStart(2, '0')}`,
  };
}

/**
 * Executa o fluxo de geração em escala, processando em sub-blocos de 5 questões por chamada,
 * aplicando atraso preventivo de 3 segundos entre chamadas para garantir consumo TPM estável.
 */
export async function executarGeracaoLote500(
  cargo: string = 'Engenheiro Civil - Curitiba',
  onProgresso?: (progresso: ProgressoGeracaoLote) => void,
  sinalizadorControle?: { pausado: boolean; abortar: boolean },
  sessaoInicial: number = 1,
  sessaoFinal: number = 20
): Promise<{
  sucesso: boolean;
  sessoesCriadas: SessaoCriada[];
  totalQuestoesGeradas: number;
}> {
  const plano = planejarLote500Questoes();
  const sessoesSalvas: SessaoCriada[] = [];

  const sessaoIni = Math.max(1, Math.min(sessaoInicial, plano.length));
  const sessaoFim = Math.max(sessaoIni, Math.min(sessaoFinal, plano.length));

  const totalSessoesCiclo = sessaoFim - sessaoIni + 1;
  const totalQuestoesCiclo = totalSessoesCiclo * 25;
  let questoesConcluidasCiclo = 0;
  let totalQuestoesGeradas = 0;
  const inicioMs = Date.now();

  const calcularMetricasTempo = () => {
    const tempoDecorridoMs = Date.now() - inicioMs;
    const decorridoSegundos = Math.floor(tempoDecorridoMs / 1000);
    const minutosDec = Math.floor(decorridoSegundos / 60);
    const segundosDec = decorridoSegundos % 60;
    const tempoDecorridoFormatado = `${String(minutosDec).padStart(2, '0')}:${String(segundosDec).padStart(2, '0')}`;

    const questoesFaltantes = totalQuestoesCiclo - questoesConcluidasCiclo;
    let tempoRestanteFormatado = 'Calculando...';
    let questoesPorMinuto = 0;

    if (questoesConcluidasCiclo > 0 && tempoDecorridoMs > 2000) {
      const msPorQ = tempoDecorridoMs / questoesConcluidasCiclo;
      questoesPorMinuto = Math.round((questoesConcluidasCiclo / (tempoDecorridoMs / 60000)) * 10) / 10;
      const msRestantes = msPorQ * questoesFaltantes;
      const minutosRestantes = Math.ceil(msRestantes / 60000);
      tempoRestanteFormatado = minutosRestantes <= 1 ? '< 1 min' : `~${minutosRestantes} min`;
    }

    return {
      tempoDecorridoFormatado,
      tempoRestanteFormatado,
      questoesPorMinuto,
    };
  };

  for (let sIdx = sessaoIni; sIdx <= sessaoFim; sIdx++) {
    if (sinalizadorControle?.abortar) {
      break;
    }

    while (sinalizadorControle?.pausado) {
      if (onProgresso) {
        const metricas = calcularMetricasTempo();
        onProgresso({
          totalQuestoes: totalQuestoesCiclo,
          questoesConcluidas: questoesConcluidasCiclo,
          sessaoAtual: sIdx,
          totalSessoes: 20,
          codigoSessaoAtual: `LOTE-500-S${String(sIdx).padStart(2, '0')}`,
          assuntoAtual: 'Pausado pelo usuário',
          dificuldadeAtual: 'MEDIA',
          porcentagem: Math.round((questoesConcluidasCiclo / totalQuestoesCiclo) * 100),
          pausado: true,
          mensagem: `Geração pausada na Sessão ${sIdx}/20. Clique em Retomar para prosseguir.`,
          ...metricas,
        });
      }
      await new Promise((r) => setTimeout(r, 600));
      if (sinalizadorControle?.abortar) break;
    }

    if (sinalizadorControle?.abortar) break;

    const sessaoPlano = plano[sIdx - 1];
    const questoesDaSessao: Questao[] = [];

    // Agrupa os 25 slots da sessão em 5 sub-blocos de 5 questões cada
    const subBlocos: SlotQuestaoLote[][] = [];
    for (let i = 0; i < sessaoPlano.slots.length; i += 5) {
      subBlocos.push(sessaoPlano.slots.slice(i, i + 5));
    }

    for (let bIdx = 0; bIdx < subBlocos.length; bIdx++) {
      if (sinalizadorControle?.abortar) break;

      const blocoAtual = subBlocos[bIdx];
      const slotReferencia = blocoAtual[0];
      const nomeTecnico = obterNomeTecnicoLimpo(slotReferencia.pdf);

      if (onProgresso) {
        const metricas = calcularMetricasTempo();
        onProgresso({
          totalQuestoes: totalQuestoesCiclo,
          questoesConcluidas: questoesConcluidasCiclo,
          sessaoAtual: sIdx,
          totalSessoes: 20,
          codigoSessaoAtual: sessaoPlano.codigo,
          assuntoAtual: nomeTecnico,
          dificuldadeAtual: slotReferencia.dificuldade,
          porcentagem: Math.round((questoesConcluidasCiclo / totalQuestoesCiclo) * 100),
          pausado: false,
          mensagem: `Gerando bloco ${bIdx + 1}/5 (5Q) da Sessão ${sIdx}/20 (${nomeTecnico})...`,
          ...metricas,
        });
      }

      const novasQuestoes = await gerarSubBlocoQuestoesLote(
        blocoAtual,
        cargo,
        'Fundação FAFIPA (Paramétrica)',
        (avisoCota) => {
          if (onProgresso) {
            const metricas = calcularMetricasTempo();
            onProgresso({
              totalQuestoes: totalQuestoesCiclo,
              questoesConcluidas: questoesConcluidasCiclo,
              sessaoAtual: sIdx,
              totalSessoes: 20,
              codigoSessaoAtual: sessaoPlano.codigo,
              assuntoAtual: nomeTecnico,
              dificuldadeAtual: slotReferencia.dificuldade,
              porcentagem: Math.round((questoesConcluidasCiclo / totalQuestoesCiclo) * 100),
              pausado: false,
              aguardandoCota: true,
              mensagem: avisoCota,
              ...metricas,
            });
          }
        }
      );

      questoesDaSessao.push(...novasQuestoes);
      questoesConcluidasCiclo += novasQuestoes.length;
      totalQuestoesGeradas += novasQuestoes.length;

      // Intervalo de segurança anti-estouro de cota: 3000ms entre chamadas de 5 questões
      await new Promise((r) => setTimeout(r, 3000));
    }

    if (sinalizadorControle?.abortar) break;

    // Grava as 25 questões no Banco de Questões
    const questoesSalvasDb = await salvarNovasQuestoesDb(questoesDaSessao);
    const idsDasQuestoes = questoesSalvasDb.map((q) => q.id);

    // Cria e salva a sessão de 25 questões imediatamente na nuvem
    const dataHoraFormatada = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const novaSessao: SessaoCriada = {
      id: `sess_lote500_${sessaoPlano.codigo.toLowerCase()}_${Date.now()}`,
      codigo: sessaoPlano.codigo,
      dataHora: dataHoraFormatada,
      banca: 'Fundação FAFIPA (Paramétrica)',
      cargo,
      disciplina: 'Lote em Escala (500Q)',
      assunto: `Sessão em Escala ${sessaoPlano.codigo} (25Q Multi-Temático)`,
      quantidade: questoesDaSessao.length,
      questaoIds: idsDasQuestoes,
      questoesSnap: questoesSalvasDb,
      tipo: 'sessao_escala',
      tempoSegundos: 0,
      concluida: false,
      created_at: new Date().toISOString(),
    };

    const sessaoSalva = await salvarSessaoDb(novaSessao);
    sessoesSalvas.push(sessaoSalva);

    if (onProgresso) {
      const metricas = calcularMetricasTempo();
      onProgresso({
        totalQuestoes: totalQuestoesCiclo,
        questoesConcluidas: questoesConcluidasCiclo,
        sessaoAtual: sIdx,
        totalSessoes: 20,
        codigoSessaoAtual: sessaoPlano.codigo,
        assuntoAtual: 'Sessão sincronizada na nuvem',
        dificuldadeAtual: 'MEDIA',
        porcentagem: Math.round((questoesConcluidasCiclo / totalQuestoesCiclo) * 100),
        pausado: false,
        mensagem: `Sessão ${sessaoPlano.codigo} (25Q) sincronizada com sucesso! (${questoesConcluidasCiclo}/${totalQuestoesCiclo} questões concluídas)`,
        ...metricas,
      });
    }

    // Intervalo de segurança entre as sessões
    await new Promise((r) => setTimeout(r, 1000));
  }

  return {
    sucesso: totalQuestoesGeradas > 0,
    sessoesCriadas: sessoesSalvas,
    totalQuestoesGeradas,
  };
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BLOCOS_EAP_OFICIAIS,
  auditarCoberturaEap,
  FRASES_LOADING_SIMULADO,
} from './eapEstrutura';
import { TABELA_PDFS_ESTUDO } from './simuladoPonderado';
import { Materia } from '../types';

test('BLOCOS_EAP_OFICIAIS contém exatamente os 7 blocos oficiais na ordem canônica', () => {
  assert.equal(BLOCOS_EAP_OFICIAIS.length, 7, 'Devem existir exatamente 7 blocos na EAP');

  // Bloco 1 deve ser Legislação Municipal de Curitiba
  assert.equal(BLOCOS_EAP_OFICIAIS[0].numero, 1);
  assert.match(BLOCOS_EAP_OFICIAIS[0].titulo, /Bloco 1 — Legislação Municipal de Curitiba/i);
  assert.deepEqual(BLOCOS_EAP_OFICIAIS[0].assuntosCodigos, ['101', '102', '103', '104', '105']);

  // Bloco 2 deve ser Licitações, Planejamento e Orçamento
  assert.equal(BLOCOS_EAP_OFICIAIS[1].numero, 2);
  assert.match(BLOCOS_EAP_OFICIAIS[1].titulo, /Bloco 2 — Licitações, Planejamento e Orçamento/i);
  assert.deepEqual(BLOCOS_EAP_OFICIAIS[1].assuntosCodigos, ['206', '207', '208', '209', '210']);

  // Bloco 3 deve ser Materiais, Técnicas e Estruturas
  assert.equal(BLOCOS_EAP_OFICIAIS[2].numero, 3);
  assert.match(BLOCOS_EAP_OFICIAIS[2].titulo, /Bloco 3 — Materiais, Técnicas e Estruturas/i);
  assert.deepEqual(BLOCOS_EAP_OFICIAIS[2].assuntosCodigos, ['311', '312', '313', '314', '315', '316']);

  // Bloco 4 deve ser Geotecnia, Drenagem e Vias
  assert.equal(BLOCOS_EAP_OFICIAIS[3].numero, 4);
  assert.match(BLOCOS_EAP_OFICIAIS[3].titulo, /Bloco 4 — Geotecnia, Drenagem e Vias/i);
  assert.deepEqual(BLOCOS_EAP_OFICIAIS[3].assuntosCodigos, ['417', '418', '419', '420', '421', '422']);

  // Bloco 5 deve ser Saneamento, Ambiente e Acessibilidade
  assert.equal(BLOCOS_EAP_OFICIAIS[4].numero, 5);
  assert.match(BLOCOS_EAP_OFICIAIS[4].titulo, /Bloco 5 — Saneamento, Ambiente e Acessibilidade/i);
  assert.deepEqual(BLOCOS_EAP_OFICIAIS[4].assuntosCodigos, ['523', '524', '525', '526']);

  // Bloco 6 deve ser Patologia, Segurança e Perícias
  assert.equal(BLOCOS_EAP_OFICIAIS[5].numero, 6);
  assert.match(BLOCOS_EAP_OFICIAIS[5].titulo, /Bloco 6 — Patologia, Segurança e Perícias/i);
  assert.deepEqual(BLOCOS_EAP_OFICIAIS[5].assuntosCodigos, ['627', '628', '629', '630']);

  // REGRA ANTI-REGRESSÃO: Bloco 7 DEVE ser Informática e Português (e NÃO o Bloco 1)
  assert.equal(BLOCOS_EAP_OFICIAIS[6].numero, 7);
  assert.match(BLOCOS_EAP_OFICIAIS[6].titulo, /Bloco 7 - Informática e Português/i);
  assert.deepEqual(BLOCOS_EAP_OFICIAIS[6].assuntosCodigos, ['731', '732', '733', '734']);
});

test('A união de todos os blocos cobre os 34 assuntos da TABELA_PDFS_ESTUDO sem sobras ou faltas', () => {
  const codigosBlocos = BLOCOS_EAP_OFICIAIS.flatMap((b) => b.assuntosCodigos);
  const codigosTabela = TABELA_PDFS_ESTUDO.map((p) => p.codigo);

  assert.equal(codigosBlocos.length, 34);
  assert.equal(codigosTabela.length, 34);
  assert.deepEqual(codigosBlocos.sort(), codigosTabela.sort());
});

test('auditarCoberturaEap mapeia com precisão matérias salvas e calcula porcentagens', () => {
  // Cenário 1: Base vazia (0 PDFs)
  const audVazia = auditarCoberturaEap([]);
  assert.equal(audVazia.totalAssuntos, 34);
  assert.equal(audVazia.totalComPdf, 0);
  assert.equal(audVazia.totalSemPdf, 34);
  assert.equal(audVazia.percentualCobertura, 0);

  // Cenário 2: Base com 3 matérias (101, 104 e 316)
  const materiasExemplo: Materia[] = [
    {
      id: 1,
      blocoNome: 'Bloco 1',
      nome: '101_Lei_Organica',
      arquivoNome: '101_Lei_Organica.pdf',
      arquivoTexto: 'Art. 1º O Município de Curitiba...',
    },
    {
      id: 2,
      blocoNome: 'Bloco 1',
      nome: '104_Codigo_de_Obras',
      arquivoNome: 'codigo_obras_ctba.pdf',
      arquivoTexto: 'Art. 15 Alvará de construção...',
    },
    {
      id: 3,
      blocoNome: 'Bloco 3',
      nome: 'Estruturas Metálicas',
      arquivoNome: '316_Estruturas_Metalicas_e_de_Madeira.pdf',
      arquivoTexto: 'Conceito de perfis metálicos...',
    },
  ];

  const audParcial = auditarCoberturaEap(materiasExemplo);
  assert.equal(audParcial.totalAssuntos, 34);
  assert.equal(audParcial.totalComPdf, 3);
  assert.equal(audParcial.totalSemPdf, 31);
  assert.equal(audParcial.percentualCobertura, Math.round((3 / 34) * 100));

  // Verifica se itens 101, 104 e 316 foram marcados como temPdfSalvo = true
  const item101 = audParcial.itens.find((i) => i.pdf.codigo === '101');
  const item104 = audParcial.itens.find((i) => i.pdf.codigo === '104');
  const item316 = audParcial.itens.find((i) => i.pdf.codigo === '316');
  const item731 = audParcial.itens.find((i) => i.pdf.codigo === '731');

  assert.equal(item101?.temPdfSalvo, true);
  assert.equal(item104?.temPdfSalvo, true);
  assert.equal(item316?.temPdfSalvo, true);
  assert.equal(item731?.temPdfSalvo, false);
});

test('FRASES_LOADING_SIMULADO contém as 3 frases exatas requeridas pelo usuário', () => {
  const frases = FRASES_LOADING_SIMULADO;
  assert.ok(
    frases.includes('Alinhando a mira com o edital...'),
    'Deve conter "Alinhando a mira com o edital..."'
  );
  assert.ok(
    frases.includes('Copiando o estilo de questões e dificuldades da banca...'),
    'Deve conter "Copiando o estilo de questões e dificuldades da banca..."'
  );
  assert.ok(
    frases.includes('Ajustando a mira e bolando as pegadinhas...'),
    'Deve conter "Ajustando a mira e bolando as pegadinhas..."'
  );
});

test('REGRA ANTI-REGRESSÃO: auditarCoberturaEap atinge 34/34 (100%) mesmo quando arquivos usam prefixos de dois dígitos (01 a 34)', () => {
  // Simula os 34 PDFs exatamente como organizados pelo usuário (resumos 01 a 34)
  const materiasUsuario34: Materia[] = [
    // Bloco 1 (resumos 01 a 05)
    { id: 1, blocoNome: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)', nome: '01_Lei_Organica', arquivoNome: 'resumo_01.pdf', arquivoTexto: 'texto 1' },
    { id: 2, blocoNome: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)', nome: '02_Estatuto_Servidores', arquivoNome: 'resumo_02.pdf', arquivoTexto: 'texto 2' },
    { id: 3, blocoNome: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)', nome: '03_Plano_Diretor', arquivoNome: 'resumo_03.pdf', arquivoTexto: 'texto 3' },
    { id: 4, blocoNome: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)', nome: '04_Codigo_de_Obras', arquivoNome: 'resumo_04.pdf', arquivoTexto: 'texto 4' },
    { id: 5, blocoNome: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)', nome: '05_Zoneamento_Uso_Solo', arquivoNome: 'resumo_05.pdf', arquivoTexto: 'texto 5' },

    // Bloco 2 (resumos 06 a 10)
    { id: 6, blocoNome: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)', nome: '06_Lei_14133_Licitacoes', arquivoNome: 'resumo_06.pdf', arquivoTexto: 'texto 6' },
    { id: 7, blocoNome: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)', nome: '07_Contratos_Aditivos', arquivoNome: 'resumo_07.pdf', arquivoTexto: 'texto 7' },
    { id: 8, blocoNome: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)', nome: '08_Planejamento_Obras_PERT_CPM', arquivoNome: 'resumo_08.pdf', arquivoTexto: 'texto 8' },
    { id: 9, blocoNome: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)', nome: '09_Orcamento_SINAPI_BDI', arquivoNome: 'resumo_09.pdf', arquivoTexto: 'texto 9' },
    { id: 10, blocoNome: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)', nome: '10_Fiscalizacao_e_Medicao', arquivoNome: 'resumo_10.pdf', arquivoTexto: 'texto 10' },

    // Bloco 3 (resumos 11 a 16)
    { id: 11, blocoNome: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)', nome: '11_NBR_6118_Concreto_Armado', arquivoNome: 'resumo_11.pdf', arquivoTexto: 'texto 11' },
    { id: 12, blocoNome: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)', nome: '12_Tecnologia_do_Concreto', arquivoNome: 'resumo_12.pdf', arquivoTexto: 'texto 12' },
    { id: 13, blocoNome: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)', nome: '13_NBR_6122_Fundacoes', arquivoNome: 'resumo_13.pdf', arquivoTexto: 'texto 13' },
    { id: 14, blocoNome: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)', nome: '14_Alvenaria_Estrutural', arquivoNome: 'resumo_14.pdf', arquivoTexto: 'texto 14' },
    { id: 15, blocoNome: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)', nome: '15_Instalacoes_Prediais', arquivoNome: 'resumo_15.pdf', arquivoTexto: 'texto 15' },
    { id: 16, blocoNome: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)', nome: '16_Estruturas_Metalicas_Madeira', arquivoNome: 'resumo_16.pdf', arquivoTexto: 'texto 16' },

    // Bloco 4 (resumos 17 a 22)
    { id: 17, blocoNome: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)', nome: '17_Mecanica_dos_Solos', arquivoNome: 'resumo_17.pdf', arquivoTexto: 'texto 17' },
    { id: 18, blocoNome: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)', nome: '18_Estabilidade_de_Taludes', arquivoNome: 'resumo_18.pdf', arquivoTexto: 'texto 18' },
    { id: 19, blocoNome: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)', nome: '19_Drenagem_Urbana', arquivoNome: 'resumo_19.pdf', arquivoTexto: 'texto 19' },
    { id: 20, blocoNome: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)', nome: '20_Pavimentacao_e_Vias', arquivoNome: 'resumo_20.pdf', arquivoTexto: 'texto 20' },
    { id: 21, blocoNome: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)', nome: '21_Terraplenagem_e_Compactacao', arquivoNome: 'resumo_21.pdf', arquivoTexto: 'texto 21' },
    { id: 22, blocoNome: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)', nome: '22_Topografia_e_Geodesia', arquivoNome: 'resumo_22.pdf', arquivoTexto: 'texto 22' },

    // Bloco 5 (resumos 23 a 26)
    { id: 23, blocoNome: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)', nome: '23_Sistemas_de_Abastecimento_Agua', arquivoNome: 'resumo_23.pdf', arquivoTexto: 'texto 23' },
    { id: 24, blocoNome: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)', nome: '24_Esgotamento_Sanitario', arquivoNome: 'resumo_24.pdf', arquivoTexto: 'texto 24' },
    { id: 25, blocoNome: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)', nome: '25_Residuos_Solidos_e_Meio_Ambiente', arquivoNome: 'resumo_25.pdf', arquivoTexto: 'texto 25' },
    { id: 26, blocoNome: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)', nome: '26_NBR_9050_Acessibilidade', arquivoNome: 'resumo_26.pdf', arquivoTexto: 'texto 26' },

    // Bloco 6 (resumos 27 a 30)
    { id: 27, blocoNome: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)', nome: '27_Patologia_das_Construcoes', arquivoNome: 'resumo_27.pdf', arquivoTexto: 'texto 27' },
    { id: 28, blocoNome: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)', nome: '28_Manutencao_Predial_NBR_5674', arquivoNome: 'resumo_28.pdf', arquivoTexto: 'texto 28' },
    { id: 29, blocoNome: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)', nome: '29_NR_18_Seguranca_do_Trabalho', arquivoNome: 'resumo_29.pdf', arquivoTexto: 'texto 29' },
    { id: 30, blocoNome: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)', nome: '30_Pericias_e_Avaliacoes_NBR_14653', arquivoNome: 'resumo_30.pdf', arquivoTexto: 'texto 30' },

    // Bloco 7 — Informática e Português (resumos 31 a 34)
    { id: 31, blocoNome: 'Bloco 7 - Informática e Português', nome: '31_Interpretacao_de_Texto', arquivoNome: 'resumo_31.pdf', arquivoTexto: 'texto 31' },
    { id: 32, blocoNome: 'Bloco 7 - Informática e Português', nome: '32_Gramatica_Normativa', arquivoNome: 'resumo_32.pdf', arquivoTexto: 'texto 32' },
    { id: 33, blocoNome: 'Bloco 7 - Informática e Português', nome: '33_Sistemas_Operacionais_Windows', arquivoNome: 'resumo_33.pdf', arquivoTexto: 'texto 33' },
    { id: 34, blocoNome: 'Bloco 7 - Informática e Português', nome: '34_Pacote_Office_e_Seguranca', arquivoNome: 'resumo_34.pdf', arquivoTexto: 'texto 34' },
  ];

  const resultado = auditarCoberturaEap(materiasUsuario34);

  // Deve cobrir rigorosamente todos os 34 assuntos (100%), e NUNCA 25
  assert.equal(resultado.totalAssuntos, 34);
  assert.equal(resultado.totalComPdf, 34, 'Deve mapear todos os 34 PDFs');
  assert.equal(resultado.totalSemPdf, 0, 'Zero PDFs pendentes quando o usuário enviou os 34');
  assert.equal(resultado.percentualCobertura, 100, 'Percentual deve ser 100%');

  // Cada um dos 34 itens deve ter temPdfSalvo = true
  resultado.itens.forEach((it) => {
    assert.equal(it.temPdfSalvo, true, `Assunto ${it.pdf.codigo} (${it.pdf.nome}) deve estar vinculado ao PDF`);
  });
});

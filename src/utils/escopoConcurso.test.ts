import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  verificarEscopoQuestao,
  obterCatalogoAssuntosOficiais,
  extrairResumoMateriasSessao,
  encontrarPdfMaisProximo,
  reclassificarQuestaoParaEscopoEstrito,
  reclassificarQuestoesParaEscopoEstrito,
} from './escopoConcurso';
import {
  gerarTagSessaoProva,
  formatarTituloVisualProva,
  formatarBadgeMinimalistaProva,
  migrarESanitizarProvasPassadas,
} from './uploadProvaUtils';
import { TABELA_PDFS_ESTUDO } from './simuladoPonderado';

describe('escopoConcurso - Validação Estrita do Escopo FAFIPA Curitiba (Engenheiro Civil)', () => {
  it('identifica corretamente questões fora do escopo do edital (ex: Matemática Básica, Juros, Frações)', () => {
    // Caso 1: Matemática Básica (frações e regra de três)
    const q1 = verificarEscopoQuestao(
      'Matemática Básica',
      'Regra de Três Composta',
      'Se 5 operários constroem um muro em 10 dias...'
    );
    assert.strictEqual(q1.noEscopo, false);
    assert.strictEqual(q1.blocoNumero, 0);

    // Caso 2: Matemática Financeira (juros simples/compostos)
    const q2 = verificarEscopoQuestao(
      'Matemática Financeira',
      'Juros Simples e Compostos',
      'Um capital de R$ 10.000,00 foi aplicado à taxa de...'
    );
    assert.strictEqual(q2.noEscopo, false);

    // Caso 3: Raciocínio Lógico Matemático genérico
    const q3 = verificarEscopoQuestao(
      'Raciocínio Lógico',
      'Sequências Lógicas e Verdades e Mentiras',
      'Se todo A é B e nenhum B é C...'
    );
    assert.strictEqual(q3.noEscopo, false);
  });

  it('identifica e classifica corretamente questões no escopo do edital (Português, Informática e Engenharia Civil)', () => {
    // Caso 1: Língua Portuguesa - Concordância Nominal
    const qPort = verificarEscopoQuestao(
      'Língua Portuguesa',
      'Concordância Nominal e Verbal',
      'Assinale a alternativa em que a concordância nominal está de acordo com a norma culta:'
    );
    assert.strictEqual(qPort.noEscopo, true);
    assert.strictEqual(qPort.blocoNumero, 7);

    // Caso 2: Informática Básica - Microsoft Excel
    const qInfo = verificarEscopoQuestao(
      'Informática Básica',
      'Microsoft Excel 2016',
      'No Microsoft Excel, a fórmula =SOMA(A1:B5) realiza:'
    );
    assert.strictEqual(qInfo.noEscopo, true);
    assert.strictEqual(qInfo.blocoNumero, 7);

    // Caso 3: Engenharia Civil - NBR 6118 / Estruturas de Concreto
    const qConc = verificarEscopoQuestao(
      'Conhecimentos Específicos',
      'Tecnologia do Concreto e dos Materiais de Construção Civil (NBR 6118 / NBR 12655)',
      'Segundo a ABNT NBR 6118:2023, o cobrimento nominal mínimo de armadura para classe de agressividade III é:'
    );
    assert.strictEqual(qConc.noEscopo, true);
    assert.strictEqual(qConc.blocoNumero, 3);
  });

  it('REGRESSÃO: Mapeia questão de "Teoria das Estruturas / Classes de Carregamento e Ações" para 314_Analise_Estrutural sem arbitrar matéria fora do escopo', () => {
    const res = verificarEscopoQuestao(
      'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
      'Teoria das Estruturas / Classes de Carregamento e Ações',
      'Em uma estrutura isostática, as ações permanentes e variáveis devem ser combinadas segundo a NBR 8681...'
    );
    assert.strictEqual(res.noEscopo, true);
    assert.strictEqual(res.assuntoOficial, '314_Analise_Estrutural');
    assert.strictEqual(res.codigoPdf, '314');
  });

  it('obterCatalogoAssuntosOficiais retorna exatamente os 34 itens oficiais organizados nos 7 blocos', () => {
    const catalogo = obterCatalogoAssuntosOficiais();
    assert.strictEqual(catalogo.length, 34);

    const blocosPresentes = new Set(catalogo.map((c) => c.blocoNumero));
    assert.strictEqual(blocosPresentes.size, 7);
    for (let b = 1; b <= 7; b++) {
      assert.ok(blocosPresentes.has(b), `Bloco ${b} deve estar presente no catálogo oficial`);
    }

    // Cada item possui nome oficial idêntico a TABELA_PDFS_ESTUDO
    catalogo.forEach((c) => {
      const original = TABELA_PDFS_ESTUDO.find((p) => p.codigo === c.codigo);
      assert.ok(original);
      assert.strictEqual(c.nome, original.nome);
    });
  });

  it('reclassificarQuestaoParaEscopoEstrito substitui matéria arbitrária pelo assunto fechado do edital', () => {
    const qArbitraria = {
      id: 'q_teste_arbitraria',
      disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
      assunto: 'Teoria das Estruturas / Classes de Carregamento e Ações',
      enunciado: 'Sobre momento fletor e esforço cortante em vigas biapoiadas...',
      alternativas: ['A) ...', 'B) ...'],
      correta: 0,
      comentario: 'Gabarito A',
    };

    const reclassificada = reclassificarQuestaoParaEscopoEstrito(qArbitraria, {
      ano: 2019,
      orgao: 'Prefeitura de Tibagi',
      banca: 'Fundação FAFIPA',
      cargo: 'Engenheiro Civil',
    });

    assert.strictEqual(reclassificada.assunto, '314_Analise_Estrutural');
    assert.strictEqual(reclassificada.ano, 2019);
    assert.strictEqual(reclassificada.orgao, 'Prefeitura de Tibagi');
    assert.strictEqual(reclassificada.banca, 'Fundação FAFIPA');
  });

  it('gerarTagSessaoProva gera exatamente a tag padronizada FAFIPA-2019-TIBAGI-ENG.CIVIL', () => {
    const tag = gerarTagSessaoProva({
      banca: 'Fundação FAFIPA',
      ano: '2019',
      orgao: 'Prefeitura de Tibagi',
      cargo: 'Engenheiro Civil',
    });
    assert.strictEqual(tag, 'FAFIPA-2019-TIBAGI-ENG.CIVIL');
  });

  it('formatarTituloVisualProva exibe Banca, Ano, Órgão e Cargo em primeiro plano', () => {
    const titulo = formatarTituloVisualProva({
      banca: 'Fundação FAFIPA',
      ano: 2019,
      orgao: 'Prefeitura de Tibagi',
      cargo: 'Engenheiro Civil',
      codigo: 'FAFIPA-2019-TIBAGI-ENG.CIVIL',
    });
    assert.strictEqual(titulo, 'FAFIPA 2019 - Prefeitura de Tibagi - Engenheiro Civil');
  });

  it('formatarBadgeMinimalistaProva gera tag discreta com Ano, Órgão, Cargo e Banca', () => {
    const badge = formatarBadgeMinimalistaProva({
      id: 'prv_fafipa_2019_eng_civil_q01',
      banca: 'Fundação FAFIPA',
      ano: 2019,
      orgao: 'Prefeitura de Tibagi',
      cargo: 'Engenheiro Civil',
      disciplina: 'Bloco 3',
      assunto: '314_Analise_Estrutural',
      enunciado: 'Enunciado...',
      alternativas: ['A) 1', 'B) 2'],
      correta: 0,
      comentario: 'Comentario',
      tipo: 'prova_anterior',
      origemTipo: 'prova_passada',
      artigo: 'Questão 1 - Prova Real',
    });

    assert.ok(badge);
    assert.strictEqual(badge.textoFormatado, '2019 • Prefeitura de Tibagi • Eng. Civil • FAFIPA');
  });

  it('migrarESanitizarProvasPassadas converte a tag PROVA-FUNDACAO-F-2019-ENGENHEIRO-C-U1FT e reclassifica questões', () => {
    const sessoesTeste = [
      {
        codigo: 'PROVA-FUNDACAO-F-2019-ENGENHEIRO-C-U1FT',
        dataHora: '2019-10-01',
        banca: 'Fundação FAFIPA',
        cargo: 'Engenheiro Civil',
        disciplina: 'Conhecimentos Específicos',
        assunto: 'Prova Real FAFIPA 2019',
        quantidade: 1,
        questaoIds: ['q_u1ft_1'],
        questoesSnap: [
          {
            id: 'q_u1ft_1',
            banca: 'Fundação FAFIPA',
            disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas',
            assunto: 'Teoria das Estruturas / Classes de Carregamento e Ações',
            artigo: 'Questão 1 - Prova Real',
            enunciado: 'Calculando a reação de apoio e forças cortantes...',
            alternativas: ['A) 10 kN', 'B) 20 kN'],
            correta: 0,
            comentario: 'Gabarito A',
          },
        ],
      },
    ];

    const { sessoesAtualizadas, questoesAtualizadas, alterou } = migrarESanitizarProvasPassadas(
      sessoesTeste,
      sessoesTeste[0].questoesSnap as any
    );

    assert.strictEqual(alterou, true);
    assert.strictEqual(sessoesAtualizadas[0].codigo, 'FAFIPA-2019-TIBAGI-ENG.CIVIL');
    assert.strictEqual(sessoesAtualizadas[0].assunto, 'FAFIPA 2019 - Prefeitura de Tibagi - Engenheiro Civil');
    assert.strictEqual(sessoesAtualizadas[0].questoesSnap![0].assunto, '314_Analise_Estrutural');
    assert.strictEqual(questoesAtualizadas[0].assunto, '314_Analise_Estrutural');
  });

  it('extrairResumoMateriasSessao analisa sessões multi-temáticas e agrupa matérias com contagem exata', () => {
    const sessaoMulti = {
      disciplina: 'Lote em Escala (500Q)',
      assunto: 'Sessão em Escala LOTE-500-S01 (25Q Multi-Temático)',
      questaoIds: ['q1', 'q2', 'q3', 'q4', 'q5'],
      questoesSnap: [
        { id: 'q1', disciplina: 'Bloco 7 — Informática e Português', assunto: 'Língua Portuguesa' },
        { id: 'q2', disciplina: 'Bloco 7 — Informática e Português', assunto: 'Língua Portuguesa' },
        { id: 'q3', disciplina: 'Bloco 7 — Informática e Português', assunto: 'Informática' },
        { id: 'q4', disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas', assunto: 'NBR 6118 Concreto' },
        { id: 'q5', disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas', assunto: 'NBR 6118 Concreto' },
      ],
    };

    const resumo = extrairResumoMateriasSessao(sessaoMulti);
    assert.strictEqual(resumo.length, 3);

    const port = resumo.find((r) => r.assunto === 'Língua Portuguesa');
    assert.ok(port);
    assert.strictEqual(port.quantidade, 2);

    const conc = resumo.find((r) => r.assunto === 'NBR 6118 Concreto');
    assert.ok(conc);
    assert.strictEqual(conc.quantidade, 2);

    const info = resumo.find((r) => r.assunto === 'Informática');
    assert.ok(info);
    assert.strictEqual(info.quantidade, 1);
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  normalizarTextoGabaritoParaMapa,
  gerarIdQuestaoProvaCanonica,
  formatarQuestoesExtraidasParaAcervo,
  criarSessaoProvaImportada,
  formatarTituloVisualProva,
} from './uploadProvaUtils';

describe('uploadProvaUtils - Normalização e Integração de Provas', () => {
  it('converte texto livre de gabarito para mapa numérico com diferentes formatos', () => {
    const texto1 = '1-A, 2-C, 3-D, 4-B, 5-E';
    const mapa1 = normalizarTextoGabaritoParaMapa(texto1);
    assert.strictEqual(mapa1.get(1), 'A');
    assert.strictEqual(mapa1.get(2), 'C');
    assert.strictEqual(mapa1.get(3), 'D');
    assert.strictEqual(mapa1.get(4), 'B');
    assert.strictEqual(mapa1.get(5), 'E');

    const texto2 = `Questão 01: Letra B
Questão 02: Letra A
3. C
4) D
05 = E`;
    const mapa2 = normalizarTextoGabaritoParaMapa(texto2);
    assert.strictEqual(mapa2.get(1), 'B');
    assert.strictEqual(mapa2.get(2), 'A');
    assert.strictEqual(mapa2.get(3), 'C');
    assert.strictEqual(mapa2.get(4), 'D');
    assert.strictEqual(mapa2.get(5), 'E');
  });

  it('gera IDs canônicos determinísticos e sem caracteres especiais', () => {
    const id = gerarIdQuestaoProvaCanonica('Fundação FAFIPA', '2024', 'Engenheiro Civil', 1);
    assert.strictEqual(id, 'prv_fundacao_fafipa_2024_engenheiro_civil_q01');

    const id2 = gerarIdQuestaoProvaCanonica('VUNESP', 2023, 'Fiscal de Obras', 12);
    assert.strictEqual(id2, 'prv_vunesp_2023_fiscal_de_obras_q12');
  });

  it('formata questões extraídas aplicando gabarito oficial e padronizando alternativas', () => {
    const raw = [
      {
        numero: 1,
        disciplina: 'Língua Portuguesa',
        assunto: 'Crase',
        enunciado: 'Assinale a alternativa em que o uso do acento indicativo de crase é obrigatório.',
        alternativas: ['a ele', 'à noite', 'a cantar', 'a uma hora', 'a pé'],
        correta: 0,
        comentario: 'Crases em locuções adverbiais femininas.',
      },
    ];

    const meta = {
      banca: 'Fundação FAFIPA',
      ano: 2024,
      orgao: 'Prefeitura de Araucária',
      cargo: 'Engenheiro Civil',
    };

    const gabarito = new Map<number, string>([[1, 'B']]);
    const formatadas = formatarQuestoesExtraidasParaAcervo(raw, meta, gabarito);

    assert.strictEqual(formatadas.length, 1);
    assert.strictEqual(formatadas[0].correta, 1); // 1 = B
    assert.strictEqual(formatadas[0].tipo, 'prova_anterior');
    assert.strictEqual(formatadas[0].origemTipo, 'prova_passada');
    assert.strictEqual(formatadas[0].alternativas[0], 'A) a ele');
    assert.strictEqual(formatadas[0].alternativas[1], 'B) à noite');
    assert.strictEqual(formatadas[0].id, 'prv_fundacao_fafipa_2024_engenheiro_civil_q01');
  });

  it('cria sessão de prova com metadados corretos', () => {
    const meta = {
      banca: 'FAFIPA',
      ano: 2024,
      orgao: 'Curitiba',
      cargo: 'Engenheiro',
    };
    const questoesMock: any[] = [{ id: 'q1' }, { id: 'q2' }];

    const sessao = criarSessaoProvaImportada(meta, questoesMock);
    assert.strictEqual(sessao.codigo, 'FAFIPA-2024-CURITIBA-ENG');
    assert.strictEqual(sessao.quantidade, 2);
    assert.strictEqual(sessao.tipo, 'prova_anterior');
  });

  it('assegura regressão zero: tag "Fallback Antigo (Aguardando Regeneração)" não existe no código', async () => {
    const fs = await import('node:fs');
    const appTsx = fs.readFileSync('src/App.tsx', 'utf8');
    assert.strictEqual(
      appTsx.includes('Fallback Antigo (Aguardando Regeneração)'),
      false,
      'A tag Fallback Antigo (Aguardando Regeneração) não deve existir em nenhum lugar de src/App.tsx'
    );
  });

  it('assegura que callDirectGeminiExtrairProvaPdf e callGeminiExtrairProvaPdf estão exportados e implementam dupla resiliência', async () => {
    const geminiService = await import('../services/geminiService');
    assert.strictEqual(typeof geminiService.callDirectGeminiExtrairProvaPdf, 'function');
    assert.strictEqual(typeof geminiService.callGeminiExtrairProvaPdf, 'function');

    const geminiServiceCode = (await import('node:fs')).readFileSync('src/services/geminiService.ts', 'utf8');
    assert.ok(
      geminiServiceCode.includes('callDirectGeminiExtrairProvaPdf'),
      'O serviço deve conter a função de fallback direto multimodal'
    );
    assert.ok(
      geminiServiceCode.includes('backendFailed'),
      'O serviço deve capturar falhas no backend (incluindo 404) e ativar contingência'
    );
  });

  it('normaliza corretamente questões extraídas com LaTeX e caracteres especiais', () => {
    const questoesComLatex = [
      {
        numero: 1,
        disciplina: 'Estruturas de Concreto',
        assunto: 'Flexão Simples',
        enunciado: 'Para concreto C25 com $f_{ck} = 25$ MPa e $\\frac{x}{d} \\le 0,45$, assinale a assertiva correta:',
        alternativas: [
          'O valor de $k_{mod,1} \\cdot k_{mod,2}$ é unitário.',
          'A armadura mínima obedece à taxa de 0,15%.',
          'O módulo de elasticidade é $E_{ci} = 5600 \\sqrt{f_{ck}}$.',
          'A tensão de cisalhamento não pode ultrapassar $\\tau_{wd}$.',
          'Nenhuma das anteriores.',
        ],
        correta: 1,
        comentario: 'A taxa mínima é 0,15% conforme a NBR 6118.',
      },
    ];

    const meta = {
      banca: 'FAFIPA',
      ano: 2024,
      orgao: 'Pref Curitiba',
      cargo: 'Engenheiro Civil',
    };

    const formatadas = formatarQuestoesExtraidasParaAcervo(questoesComLatex, meta);
    assert.strictEqual(formatadas.length, 1);
    // Verifica que o LaTeX foi limpo e formatado com rigor
    assert.ok(!formatadas[0].enunciado.includes('$f_{ck}'), 'Enunciado não deve ter delimitadores $ residuais');
    assert.ok(formatadas[0].enunciado.includes('fck = 25'), 'Enunciado deve conter fck limpo sem sintaxe TeX');
    assert.ok(formatadas[0].alternativas[0].startsWith('A)'), 'Alternativa deve ter prefixo A)');
    assert.ok(!formatadas[0].alternativas[0].includes('\\cdot'), 'Alternativa não deve ter comando TeX \\cdot');
    assert.ok(formatadas[0].alternativas[0].includes('·'), 'Alternativa deve conter ponto mediano Unicode');
  });

  it('REGRESSÃO: prova de Campo Magro 2016 gera tag canônica e título corretos sem mutar para Tibagi', () => {
    const metaCampoMagro = {
      banca: 'Fundação FAFIPA',
      ano: '2016',
      orgao: 'Prefeitura de Campo Magro',
      cargo: 'Engenheiro Civil',
    };

    const sessao = criarSessaoProvaImportada(metaCampoMagro, [{ id: 'q_cm1' } as any]);
    assert.strictEqual(sessao.codigo, 'FAFIPA-2016-CAMPOMAGRO-ENG.CIVIL');
    assert.strictEqual(sessao.assunto, 'FAFIPA 2016 - Prefeitura de Campo Magro - Engenheiro Civil');
    assert.strictEqual(sessao.tipo, 'prova_anterior');

    // formatarTituloVisualProva não deve cair em 'Prefeitura de Tibagi' se orgao for omitido
    const tituloSemOrgao = formatarTituloVisualProva({
      codigo: 'FAFIPA-2016-CAMPOMAGRO-ENG.CIVIL',
      banca: 'FAFIPA',
      ano: 2016,
    });
    assert.ok(
      tituloSemOrgao.includes('Campo Magro'),
      `Título deve conter Campo Magro, recebido: ${tituloSemOrgao}`
    );
    assert.ok(
      !tituloSemOrgao.includes('Tibagi'),
      `Título não pode ser arbitrado como Tibagi para prova de Campo Magro`
    );
  });

  it('REGRESSÃO: migrarESanitizarProvasPassadas NUNCA funde ou sobrescreve Campo Magro 2016 com Tibagi 2019', async () => {
    const { migrarESanitizarProvasPassadas } = await import('./uploadProvaUtils');
    const { obterTipoSessao } = await import('./sessionCode');

    const sessaoTibagi = {
      id: 'sessao_tibagi_2019',
      codigo: 'FAFIPA-2019-TIBAGI-ENG.CIVIL',
      dataHora: '2026-01-01T00:00:00.000Z',
      disciplina: 'Conhecimentos Gerais e Específicos',
      assunto: 'FAFIPA 2019 - Prefeitura de Tibagi - Engenheiro Civil',
      tipo: 'prova_anterior' as const,
      banca: 'Fundação FAFIPA',
      ano: 2019,
      orgao: 'Prefeitura de Tibagi',
      cargo: 'Engenheiro Civil',
      quantidade: 40,
      questaoIds: ['q_tib_1'],
      questoesSnap: [],
    };

    const sessaoCampoMagro = {
      id: 'sessao_prv_campo_magro_2016',
      codigo: 'FAFIPA-2016-CAMPOMAGRO-ENG.CIVIL',
      dataHora: '2026-01-01T00:00:00.000Z',
      disciplina: 'Conhecimentos Gerais e Específicos',
      assunto: 'FAFIPA 2016 - Prefeitura de Campo Magro - Engenheiro Civil',
      tipo: 'prova_anterior' as const,
      banca: 'Fundação FAFIPA',
      ano: 2016,
      orgao: 'Prefeitura de Campo Magro',
      cargo: 'Engenheiro Civil',
      quantidade: 30,
      questaoIds: ['q_cm_1'],
      questoesSnap: [],
    };

    const sessoesEntrada = [sessaoTibagi, sessaoCampoMagro] as any;
    const { sessoesAtualizadas } = migrarESanitizarProvasPassadas(sessoesEntrada, []);

    // Deve conter AMBAS as sessões, sem unificação indevida
    assert.strictEqual(sessoesAtualizadas.length, 2, 'Ambas as provas (Tibagi e Campo Magro) devem coexistir');
    
    const cm = sessoesAtualizadas.find((s) => s.codigo === 'FAFIPA-2016-CAMPOMAGRO-ENG.CIVIL');
    assert.ok(cm, 'Sessão de Campo Magro 2016 deve existir com código intacto');
    assert.strictEqual(cm?.assunto, 'FAFIPA 2016 - Prefeitura de Campo Magro - Engenheiro Civil');
    assert.strictEqual(obterTipoSessao(cm!), 'prova_anterior', 'Deve ser classificada como prova_anterior');

    const tib = sessoesAtualizadas.find((s) => s.codigo === 'FAFIPA-2019-TIBAGI-ENG.CIVIL');
    assert.ok(tib, 'Sessão de Tibagi 2019 deve permanecer intacta');
  });

  it('REGRESSÃO: obterTipoSessao reconhece FAFIPA-2016-CAMPOMAGRO-ENG.CIVIL como prova_anterior mesmo sem s.tipo', async () => {
    const { obterTipoSessao } = await import('./sessionCode');
    const sessaoSemTipo = {
      codigo: 'FAFIPA-2016-CAMPOMAGRO-ENG.CIVIL',
      assunto: 'FAFIPA 2016 - Prefeitura de Campo Magro - Engenheiro Civil',
    };
    assert.strictEqual(obterTipoSessao(sessaoSemTipo), 'prova_anterior');
  });
});



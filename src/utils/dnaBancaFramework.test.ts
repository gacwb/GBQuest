import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  PERFIL_FAFIPA_CURITIBA,
  PERFIL_FCC_ENGENHARIA,
  PERFIL_FGV_ENGENHARIA,
  calcularCotasTipologia,
  balancearGabaritoLoteCompleto,
  estruturarSimuladoOficialOrdenado,
  montarInstrucoesDnaBanca,
  gerarGradeTipologiasFafipa,
  montarInstrucaoMoldeTipologia,
  classificarTipologiaQuestao,
  gerarGradeDificuldadeFafipa,
  montarInstrucaoMoldeDificuldade,
  classificarDificuldadeQuestao,
} from './dnaBancaFramework';

describe('dnaBancaFramework', () => {
  it('PERFIL_FAFIPA_CURITIBA contém métricas fiéis às provas reais', () => {
    assert.strictEqual(PERFIL_FAFIPA_CURITIBA.sigla, 'FAFIPA');
    assert.strictEqual(PERFIL_FAFIPA_CURITIBA.exigencia.calculosNumericosPct, 0, 'Zero cálculos nas específicas');
    assert.strictEqual(PERFIL_FAFIPA_CURITIBA.distribuicaoTipologias.diretaPositiva, 55, '55% de diretas positivas');
    assert.strictEqual(PERFIL_FAFIPA_CURITIBA.distribuicaoTipologias.assertivasItens, 18, '18% de assertivas');
    assert.strictEqual(PERFIL_FAFIPA_CURITIBA.distribuicaoTipologias.comandoNegativo, 12, '12% de negativas');
    assert.strictEqual(PERFIL_FAFIPA_CURITIBA.distribuicaoTipologias.preenchimentoLacunas, 8, '8% de lacunas');
    assert.strictEqual(PERFIL_FAFIPA_CURITIBA.distribuicaoTipologias.verdadeiroOuFalso, 7, '7% de V/F');

    const soma =
      PERFIL_FAFIPA_CURITIBA.distribuicaoTipologias.diretaPositiva +
      PERFIL_FAFIPA_CURITIBA.distribuicaoTipologias.assertivasItens +
      PERFIL_FAFIPA_CURITIBA.distribuicaoTipologias.comandoNegativo +
      PERFIL_FAFIPA_CURITIBA.distribuicaoTipologias.preenchimentoLacunas +
      PERFIL_FAFIPA_CURITIBA.distribuicaoTipologias.verdadeiroOuFalso;
    assert.strictEqual(soma, 100, 'A soma das porcentagens deve ser exatamente 100%');
  });

  it('calcularCotasTipologia fecha exatamente em 40 questões para FAFIPA', () => {
    const cotas = calcularCotasTipologia(PERFIL_FAFIPA_CURITIBA, 40);
    assert.strictEqual(cotas.total, 40, 'Total deve ser exatamente 40 questões');
    assert.strictEqual(cotas.diretaPositiva, 22, '55% de 40 = 22 questões');
    assert.strictEqual(cotas.assertivasItens, 7, '18% de 40 = 7 questões');
    assert.strictEqual(cotas.comandoNegativo, 5, '12% de 40 = 5 questões');
    assert.strictEqual(cotas.preenchimentoLacunas, 3, '8% de 40 = 3 questões');
    assert.strictEqual(cotas.verdadeiroOuFalso, 3, '7% de 40 = 3 questões');
  });

  it('calcularCotasTipologia fecha exatamente em 40 questões para outros perfis (FCC, FGV)', () => {
    const cotasFCC = calcularCotasTipologia(PERFIL_FCC_ENGENHARIA, 40);
    assert.strictEqual(cotasFCC.total, 40);

    const cotasFGV = calcularCotasTipologia(PERFIL_FGV_ENGENHARIA, 40);
    assert.strictEqual(cotasFGV.total, 40);
  });

  it('balancearGabaritoLoteCompleto elimina viés de A e B e garante 8 A, 8 B, 8 C, 8 D, 8 E em 40 questões', () => {
    // Simula um lote viciado onde todas as 40 questões geradas pela IA vieram em A (0) ou B (1)
    const loteViciado = Array.from({ length: 40 }, (_, i) => ({
      id: i + 1,
      enunciado: `Questão teste ${i + 1}`,
      alternativas: [
        'A) Alternativa 1',
        'B) Alternativa 2',
        'C) Alternativa 3',
        'D) Alternativa 4',
        'E) Alternativa 5',
      ],
      correta: i % 2 === 0 ? 0 : 1, // Todas em A ou B!
      comentario: 'Gabarito oficial A ou B',
    }));

    // Verifica que antes do balanceamento estava totalmente viciado
    const contagemAntes = [0, 0, 0, 0, 0];
    loteViciado.forEach((q) => contagemAntes[q.correta]++);
    assert.strictEqual(contagemAntes[0], 20);
    assert.strictEqual(contagemAntes[1], 20);
    assert.strictEqual(contagemAntes[2], 0);
    assert.strictEqual(contagemAntes[3], 0);
    assert.strictEqual(contagemAntes[4], 0);

    // Aplica o balanceador de lote completo
    const loteBalanceado = balancearGabaritoLoteCompleto(loteViciado, 40);
    assert.strictEqual(loteBalanceado.length, 40);

    // Contagem pós-balanceamento
    const contagemDepois = [0, 0, 0, 0, 0];
    loteBalanceado.forEach((q) => contagemDepois[q.correta]++);

    // Cada letra deve ter rigorosamente 40 / 5 = 8 questões!
    assert.strictEqual(contagemDepois[0], 8, 'Exatamente 8 questões com gabarito A');
    assert.strictEqual(contagemDepois[1], 8, 'Exatamente 8 questões com gabarito B');
    assert.strictEqual(contagemDepois[2], 8, 'Exatamente 8 questões com gabarito C');
    assert.strictEqual(contagemDepois[3], 8, 'Exatamente 8 questões com gabarito D');
    assert.strictEqual(contagemDepois[4], 8, 'Exatamente 8 questões com gabarito E');

    // Nenhuma sequência de 3 ou mais respostas iguais consecutivas
    for (let i = 2; i < loteBalanceado.length; i++) {
      const igual =
        loteBalanceado[i].correta === loteBalanceado[i - 1].correta &&
        loteBalanceado[i].correta === loteBalanceado[i - 2].correta;
      assert.strictEqual(igual, false, 'Não deve haver 3 gabaritos consecutivos idênticos');
    }
  });

  it('montarInstrucoesDnaBanca inclui diretrizes estritas de zero cálculos para FAFIPA e regra anti-latex', () => {
    const texto = montarInstrucoesDnaBanca(PERFIL_FAFIPA_CURITIBA);
    assert.ok(texto.includes('ZERO CÁLCULOS NAS QUESTÕES ESPECÍFICAS'));
    assert.ok(texto.includes('100% CONCEITUAL, NORMATIVO E PROCEDIMENTAL'));
    assert.ok(texto.includes('PROIBIÇÃO ABSOLUTA DE CÓDIGO OU SINTAXE LATEX'));
    assert.ok(texto.includes('EXTENSÃO E CONCISÃO DAS ALTERNATIVAS'));
    assert.ok(texto.includes('CORRETA'));
  });

  it('gerarGradeTipologiasFafipa retorna exatamente 22 diretas, 7 assertivas, 5 negativas, 3 lacunas e 3 V/F em 40 questões', () => {
    const grade = gerarGradeTipologiasFafipa(40);
    assert.strictEqual(grade.length, 40);

    const contagem: Record<string, number> = {};
    grade.forEach((tipo) => {
      contagem[tipo] = (contagem[tipo] || 0) + 1;
    });

    assert.strictEqual(contagem['DIRETA_POSITIVA'], 22, 'Exatamente 22 diretas positivas (55%)');
    assert.strictEqual(contagem['ASSERTIVAS_ITENS'], 7, 'Exatamente 7 assertivas com itens (18%)');
    assert.strictEqual(contagem['COMANDO_NEGATIVO'], 5, 'Exatamente 5 comandos negativos (12%)');
    assert.strictEqual(contagem['PREENCHIMENTO_LACUNAS'], 3, 'Exatamente 3 preenchimento de lacunas (8%)');
    assert.strictEqual(contagem['JULGAMENTO_VF'], 3, 'Exatamente 3 verdadeiro ou falso (7%)');
  });

  it('montarInstrucaoMoldeTipologia produz instruções obrigatórias para cada formato', () => {
    const moldeItens = montarInstrucaoMoldeTipologia('ASSERTIVAS_ITENS');
    assert.ok(moldeItens.includes('I, II, III'));
    assert.ok(moldeItens.includes('É correto o que se afirma em:'));

    const moldeNeg = montarInstrucaoMoldeTipologia('COMANDO_NEGATIVO');
    assert.ok(moldeNeg.includes('INCORRETA'));

    const moldeLac = montarInstrucaoMoldeTipologia('PREENCHIMENTO_LACUNAS');
    assert.ok(moldeLac.includes('________'));

    const moldeVF = montarInstrucaoMoldeTipologia('JULGAMENTO_VF');
    assert.ok(moldeVF.includes('(__)'));
    assert.ok(moldeVF.includes('V – F'));
  });

  it('classificarTipologiaQuestao detecta corretamente os formatos através de heurística textual', () => {
    assert.strictEqual(
      classificarTipologiaQuestao({
        enunciado: 'Sobre a Lei 14.133, assinale a alternativa INCORRETA:',
        alternativas: ['A) ...', 'B) ...'],
      }),
      'COMANDO_NEGATIVO'
    );

    assert.strictEqual(
      classificarTipologiaQuestao({
        enunciado: 'Considere os itens: I. Teste. II. Teste. É correto o que se afirma em:',
        alternativas: ['A) Apenas I.', 'B) I e II.'],
      }),
      'ASSERTIVAS_ITENS'
    );

    assert.strictEqual(
      classificarTipologiaQuestao({
        enunciado: 'O processo de ________ dura até ________ dias.',
        alternativas: ['A) licitação – 30', 'B) dispensa – 15'],
      }),
      'PREENCHIMENTO_LACUNAS'
    );

    assert.strictEqual(
      classificarTipologiaQuestao({
        enunciado: 'Julgue os itens a seguir: (__) Item 1. (__) Item 2.',
        alternativas: ['A) V – F', 'B) F – V'],
      }),
      'JULGAMENTO_VF'
    );

    assert.strictEqual(
      classificarTipologiaQuestao({
        enunciado: 'De acordo com a NBR 6118, assinale a alternativa CORRETA:',
        alternativas: ['A) ...', 'B) ...'],
      }),
      'DIRETA_POSITIVA'
    );
  });

  it('gerarGradeDificuldadeFafipa retorna exatamente 16 fáceis (40%), 16 médias (40%) e 8 cascudas (20%)', () => {
    const grade = gerarGradeDificuldadeFafipa(40);
    assert.strictEqual(grade.length, 40);

    const contagem: Record<string, number> = {};
    grade.forEach((dif) => {
      contagem[dif] = (contagem[dif] || 0) + 1;
    });

    assert.strictEqual(contagem['FACIL'], 16, 'Exatamente 16 questões fáceis (40%)');
    assert.strictEqual(contagem['MEDIA'], 16, 'Exatamente 16 questões médias (40%)');
    assert.strictEqual(contagem['CASCUDA'], 8, 'Exatamente 8 questões cascudas (20%)');

    // Validação dos sub-blocos:
    // Português (5Q): primeiros 5 índices
    const port = grade.slice(0, 5);
    assert.strictEqual(port.filter((d) => d === 'FACIL').length, 2, '2 fáceis em Português');
    assert.strictEqual(port.filter((d) => d === 'MEDIA').length, 2, '2 médias em Português');
    assert.strictEqual(port.filter((d) => d === 'CASCUDA').length, 1, '1 cascuda em Português');

    // Informática (5Q): índices 5 a 10
    const info = grade.slice(5, 10);
    assert.strictEqual(info.filter((d) => d === 'FACIL').length, 2, '2 fáceis em Informática');
    assert.strictEqual(info.filter((d) => d === 'MEDIA').length, 2, '2 médias em Informática');
    assert.strictEqual(info.filter((d) => d === 'CASCUDA').length, 1, '1 cascuda em Informática');

    // Engenharia Civil (30Q): índices 10 a 40
    const eng = grade.slice(10, 40);
    assert.strictEqual(eng.filter((d) => d === 'FACIL').length, 12, '12 fáceis em Engenharia');
    assert.strictEqual(eng.filter((d) => d === 'MEDIA').length, 12, '12 médias em Engenharia');
    assert.strictEqual(eng.filter((d) => d === 'CASCUDA').length, 6, '6 cascudas em Engenharia');
  });

  it('montarInstrucaoMoldeDificuldade gera regras imperativas para cada nível', () => {
    const facil = montarInstrucaoMoldeDificuldade('FACIL');
    assert.ok(facil.includes('FÁCIL'));
    assert.ok(facil.includes('ZERO PEGADINHAS'));

    const media = montarInstrucaoMoldeDificuldade('MEDIA');
    assert.ok(media.includes('MÉDIO'));
    assert.ok(media.includes('DISTRATORES PLAUSÍVEIS'));

    const cascuda = montarInstrucaoMoldeDificuldade('CASCUDA');
    assert.ok(cascuda.includes('CASCUDA / ALTA COMPLEXIDADE'));
    assert.ok(cascuda.includes('DISTRATORES CIRÚRGICOS'));
    assert.ok(cascuda.includes('ZERO CÁLCULOS MATEMÁTICOS'));
  });

  it('classificarDificuldadeQuestao avalia corretamente por histórico e heurística', () => {
    // Por histórico de acerto:
    assert.strictEqual(
      classificarDificuldadeQuestao({ enunciado: 'Teste' }, [
        { acertou: false },
        { acertou: false },
      ]),
      'CASCUDA'
    );
    assert.strictEqual(
      classificarDificuldadeQuestao({ enunciado: 'Teste' }, [
        { acertou: true },
        { acertou: false },
      ]),
      'CASCUDA'
    );
    assert.strictEqual(
      classificarDificuldadeQuestao({ enunciado: 'Teste' }, [
        { acertou: true },
        { acertou: true },
        { acertou: false },
      ]),
      'MEDIA'
    );
    assert.strictEqual(
      classificarDificuldadeQuestao({ enunciado: 'Teste' }, [
        { acertou: true },
        { acertou: true },
        { acertou: true },
      ]),
      'FACIL'
    );
  });

  it('estruturarSimuladoOficialOrdenado ordena rigorosamente: Q1-5 Português, Q6-10 Informática, Q11-40 Específicas com 8A, 8B, 8C, 8D, 8E', () => {
    // Cria um lote mockado contendo questões de Português, Informática e Específicas
    const questoesMock: any[] = [];

    // 8 de Português
    for (let i = 1; i <= 8; i++) {
      questoesMock.push({
        id: `port_${i}`,
        disciplina: 'Língua Portuguesa',
        assunto: '731_Interpretacao_de_Texto',
        enunciado: `Português questão ${i}`,
        alternativas: ['A) ...', 'B) ...', 'C) ...', 'D) ...', 'E) ...'],
        correta: 0, // Todas inicialmente em A para testar o balanceador interno
      });
    }

    // 8 de Informática
    for (let i = 1; i <= 8; i++) {
      questoesMock.push({
        id: `info_${i}`,
        disciplina: 'Noções de Informática',
        assunto: '733_Windows_Office',
        enunciado: `Informática questão ${i}`,
        alternativas: ['A) ...', 'B) ...', 'C) ...', 'D) ...', 'E) ...'],
        correta: 1, // Todas inicialmente em B
      });
    }

    // 35 de Engenharia Civil Específicas
    for (let i = 1; i <= 35; i++) {
      questoesMock.push({
        id: `esp_${i}`,
        disciplina: 'Engenharia Civil',
        assunto: `311_NBR_6118_${i}`,
        enunciado: `Específica questão ${i}`,
        alternativas: ['A) ...', 'B) ...', 'C) ...', 'D) ...', 'E) ...'],
        correta: 2, // Todas inicialmente em C
      });
    }

    const resultado = estruturarSimuladoOficialOrdenado(questoesMock, 40);

    // 1. Total deve ser exatamente 40
    assert.strictEqual(resultado.length, 40, 'Deve retornar exatamente 40 questões');

    // 2. Primeiras 5 DEVEM ser Língua Portuguesa
    const primeiras5 = resultado.slice(0, 5);
    primeiras5.forEach((q, idx) => {
      const match =
        q.disciplina?.toLowerCase().includes('portug') ||
        q.assunto?.toLowerCase().includes('portug') ||
        q.assunto?.includes('731');
      assert.ok(match, `Questão ${idx + 1} deve ser de Língua Portuguesa`);
    });

    // 3. Próximas 5 (índices 5 a 9) DEVEM ser Informática
    const proximas5 = resultado.slice(5, 10);
    proximas5.forEach((q, idx) => {
      const match =
        q.disciplina?.toLowerCase().includes('inform') ||
        q.assunto?.toLowerCase().includes('inform') ||
        q.assunto?.includes('733');
      assert.ok(match, `Questão ${idx + 6} deve ser de Noções de Informática`);
    });

    // 4. Últimas 30 (índices 10 a 39) DEVEM ser Específicas de Engenharia
    const ultimas30 = resultado.slice(10, 40);
    ultimas30.forEach((q, idx) => {
      const ehBasica =
        q.disciplina?.toLowerCase().includes('portug') ||
        q.disciplina?.toLowerCase().includes('inform');
      assert.strictEqual(ehBasica, false, `Questão ${idx + 11} não pode ser de Português/Informática`);
    });

    // 5. Gabarito das primeiras 5 (Português) deve ter exatamente 1 de cada letra (0, 1, 2, 3, 4)
    const gabPort = [0, 0, 0, 0, 0];
    primeiras5.forEach((q) => gabPort[q.correta]++);
    assert.deepStrictEqual(gabPort, [1, 1, 1, 1, 1], 'Português deve ter 1A, 1B, 1C, 1D, 1E');

    // 6. Gabarito das próximas 5 (Informática) deve ter exatamente 1 de cada letra (0, 1, 2, 3, 4)
    const gabInfo = [0, 0, 0, 0, 0];
    proximas5.forEach((q) => gabInfo[q.correta]++);
    assert.deepStrictEqual(gabInfo, [1, 1, 1, 1, 1], 'Informática deve ter 1A, 1B, 1C, 1D, 1E');

    // 7. Gabarito das 30 Específicas deve ter exatamente 6 de cada letra (0, 1, 2, 3, 4)
    const gabEsp = [0, 0, 0, 0, 0];
    ultimas30.forEach((q) => gabEsp[q.correta]++);
    assert.deepStrictEqual(gabEsp, [6, 6, 6, 6, 6], 'Específicas deve ter 6A, 6B, 6C, 6D, 6E');

    // 8. Total Geral do Gabarito do Simulado Oficial (40Q): exatamente 8 A, 8 B, 8 C, 8 D, 8 E
    const gabTotal = [0, 0, 0, 0, 0];
    resultado.forEach((q) => gabTotal[q.correta]++);
    assert.deepStrictEqual(gabTotal, [8, 8, 8, 8, 8], 'Simulado Oficial completo deve ter 8A, 8B, 8C, 8D, 8E');
  });
});


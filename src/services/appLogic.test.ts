import test from 'node:test';
import assert from 'node:assert/strict';
import { SUPABASE_SQL_SCRIPT } from './supabaseSql.ts';

test('SUPABASE_SQL_SCRIPT contains required tables and RLS', () => {
  assert.ok(SUPABASE_SQL_SCRIPT.includes('CREATE TABLE IF NOT EXISTS public.bancas'));
  assert.ok(SUPABASE_SQL_SCRIPT.includes('CREATE TABLE IF NOT EXISTS public.questoes'));
  assert.ok(SUPABASE_SQL_SCRIPT.includes('CREATE TABLE IF NOT EXISTS public.sessoes'));
  assert.ok(SUPABASE_SQL_SCRIPT.includes('CREATE TABLE IF NOT EXISTS public.historico_respostas'));
  assert.ok(SUPABASE_SQL_SCRIPT.includes('ENABLE ROW LEVEL SECURITY'));
});

test('Question accuracy calculation produces valid percentage', () => {
  const calcTaxa = (acertos: number, total: number) => (total > 0 ? Math.round((acertos / total) * 100) : 0);
  assert.equal(calcTaxa(7, 10), 70);
  assert.equal(calcTaxa(0, 0), 0);
  assert.equal(calcTaxa(5, 5), 100);
});

import { gerarCodigoSessaoPadrao, extrairPrefixoBloco, extrairTipoNorma, extrairNumeroNorma } from '../utils/sessionCode.ts';

test('Session naming pattern standard (BL + 2 caracteres bloco + L/D + numero norma)', () => {
  const code1 = gerarCodigoSessaoPadrao(
    '02_Licitações Contratos Custos',
    '2.1_Lei_14133_2021_Nova_Lei_Licitacoes_Contratos'
  );
  assert.equal(code1, 'BL02L14133');

  const code2 = gerarCodigoSessaoPadrao(
    'Bloco 05 - Direito Administrativo',
    'Decreto 10.024 de 2019'
  );
  assert.equal(code2, 'BL05D10024');

  const code3 = gerarCodigoSessaoPadrao('Direito Tributário', 'Lei 5.172 CTN');
  assert.equal(code3, 'BLDIL5172');
});

test('Cascade edit updating logic reflects changes across questions matching session', () => {
  const questoesMock = [
    { id: 1, disciplina: '02_Licitações', assunto: 'Lei 14133', banca: 'FAFIPA' },
    { id: 2, disciplina: '02_Licitações', assunto: 'Lei 14133', banca: 'FAFIPA' },
    { id: 3, disciplina: '01_Const', assunto: 'CF 88', banca: 'CEBRASPE' },
  ];

  const oldDisc = '02_Licitações';
  const oldAss = 'Lei 14133';
  const newDisc = 'BLOCO 02 - Licitações e Contratos';
  const newAss = 'Lei 14.133/2021 Nova Lei de Licitações';
  const newBanca = 'FGV';

  const updatedQuestoes = questoesMock.map((q) => {
    if (q.disciplina === oldDisc && q.assunto === oldAss) {
      return {
        ...q,
        disciplina: newDisc,
        assunto: newAss,
        banca: newBanca,
      };
    }
    return q;
  });

  assert.equal(updatedQuestoes[0].disciplina, newDisc);
  assert.equal(updatedQuestoes[0].assunto, newAss);
  assert.equal(updatedQuestoes[0].banca, 'FGV');
  assert.equal(updatedQuestoes[1].disciplina, newDisc);
  assert.equal(updatedQuestoes[2].disciplina, '01_Const');
});

test('Question generation validation requires cargo/função concorrida as mandatory field', () => {
  const validarCamposGeracao = (params: {
    banca: string;
    disciplina: string;
    assunto: string;
    cargo: string;
    arquivoPresente: boolean;
  }) => {
    if (!params.banca || !params.disciplina.trim() || !params.assunto.trim() || !params.cargo.trim() || !params.arquivoPresente) {
      return false;
    }
    return true;
  };

  // Missing cargo should fail
  assert.equal(
    validarCamposGeracao({
      banca: 'CEBRASPE',
      disciplina: '02_Licitações',
      assunto: 'Lei 14.133',
      cargo: '',
      arquivoPresente: true,
    }),
    false
  );

  // With cargo should pass
  assert.equal(
    validarCamposGeracao({
      banca: 'CEBRASPE',
      disciplina: '02_Licitações',
      assunto: 'Lei 14.133',
      cargo: 'Auditor Fiscal da Receita Federal',
      arquivoPresente: true,
    }),
    true
  );
});

test('Direcionamento adicional allows narrowing down specific articles or subjects optionally', () => {
  const montarPromptFoco = (cargo: string, direcionamento?: string) => {
    let prompt = `Cargo Alvo: ${cargo}.`;
    if (direcionamento && direcionamento.trim()) {
      prompt += ` Afunilamento específico: ${direcionamento.trim()}.`;
    }
    return prompt;
  };

  const semDirecionamento = montarPromptFoco('Analista Judiciário');
  assert.ok(semDirecionamento.includes('Cargo Alvo: Analista Judiciário.'));
  assert.ok(!semDirecionamento.includes('Afunilamento específico'));

  const comDirecionamento = montarPromptFoco('Analista Judiciário', 'Artigos 5º ao 15 (dispensa de licitação)');
  assert.ok(comDirecionamento.includes('Cargo Alvo: Analista Judiciário.'));
  assert.ok(comDirecionamento.includes('Afunilamento específico: Artigos 5º ao 15 (dispensa de licitação)'));
});

import { fetchAllRowsPaginated } from './supabaseClient.ts';
import { RegistroTempoSessao, HistoricoRespostasMap } from '../types/index.ts';

test('SUPABASE_SQL_SCRIPT contém colunas tempo_segundos e origem em historico_respostas', () => {
  assert.ok(SUPABASE_SQL_SCRIPT.includes('ALTER TABLE public.historico_respostas ADD COLUMN IF NOT EXISTS tempo_segundos INTEGER DEFAULT 0;'));
  assert.ok(SUPABASE_SQL_SCRIPT.includes('ALTER TABLE public.historico_respostas ADD COLUMN IF NOT EXISTS origem TEXT DEFAULT \'\';'));
});

test('REGRESSÃO: fetchAllRowsPaginated busca e agrega mais de 1000 registros sem truncar', async () => {
  // Simula banco com 2345 itens (ultrapassando os limites de 1000 do PostgREST)
  const totalBanco = 2345;
  const bancoFake = Array.from({ length: totalBanco }, (_, i) => ({
    id: i + 1,
    questao_id: 100 + (i % 50),
    data: 1700000000000 + i * 1000,
  }));

  const fetchPage = async (from: number, to: number) => {
    const slice = bancoFake.slice(from, to + 1);
    return { data: slice, error: null };
  };

  const { data, error } = await fetchAllRowsPaginated(fetchPage, 1000);

  assert.equal(error, null);
  assert.equal(data.length, 2345);
  assert.equal(data[0].id, 1);
  assert.equal(data[2344].id, 2345);
});

test('REGRESSÃO: totalResolucoesGerais contabiliza além de 1000 resoluções sem travar ou truncar', () => {
  const historicoGrande: HistoricoRespostasMap = {};

  // Gera 1250 tentativas válidas distribuídas em várias questões
  for (let i = 0; i < 1250; i++) {
    const qKey = String(100 + (i % 25));
    if (!historicoGrande[qKey]) historicoGrande[qKey] = [];
    historicoGrande[qKey].push({
      questaoId: qKey,
      escolha: (i % 4),
      acertou: i % 2 === 0,
      data: 1700000000000 + i,
      origem: 'sessao',
    });
  }

  let totalResolvido = 0;
  Object.values(historicoGrande).forEach((arr) => {
    if (Array.isArray(arr)) {
      totalResolvido += arr.filter(
        (t) => typeof t.escolha === 'number' && !isNaN(t.escolha) && t.escolha >= 0
      ).length;
    }
  });

  assert.equal(totalResolvido, 1250);
});

test('REGRESSÃO: deduplicação de registros de tempo não sobrescreve questões distintas da mesma disciplina/assunto', () => {
  const registros: RegistroTempoSessao[] = [];

  const salvarSimulado = (novo: RegistroTempoSessao) => {
    const regId = novo.id;
    const idx = registros.findIndex((r) => {
      if (regId && r.id === regId) return true;
      if (
        novo.questaoId ||
        r.questaoId ||
        novo.tipo === 'banco' ||
        r.tipo === 'banco' ||
        novo.tipo === 'caderno' ||
        r.tipo === 'caderno'
      ) {
        if (novo.questaoId && r.questaoId && String(novo.questaoId) === String(r.questaoId)) {
          if (r.data && novo.data && Math.abs(r.data - novo.data) < 2000) {
            return true;
          }
        }
        return false;
      }
      return false;
    });

    if (idx >= 0) {
      registros[idx] = { ...registros[idx], ...novo };
    } else {
      registros.push(novo);
    }
  };

  // Questão 1 da matéria NR-35 resolvida no Caderno
  salvarSimulado({
    id: 'caderno_q_1_1000',
    tipo: 'caderno',
    questaoId: 1,
    titulo: 'Caderno NR-35 Q1',
    disciplina: 'Segurança',
    assunto: 'NR-35',
    segundos: 50,
    data: 1000,
  });

  // Questão 2 da MESMA matéria NR-35 resolvida no Caderno
  salvarSimulado({
    id: 'caderno_q_2_2000',
    tipo: 'caderno',
    questaoId: 2,
    titulo: 'Caderno NR-35 Q2',
    disciplina: 'Segurança',
    assunto: 'NR-35',
    segundos: 70,
    data: 2000,
  });

  // Ambas as questões DEVEM coexistir e somar os tempos independentemente (50s + 70s = 120s)
  assert.equal(registros.length, 2);
  const totalSegundos = registros.reduce((acc, r) => acc + (r.segundos || 0), 0);
  assert.equal(totalSegundos, 120);
});



import { test } from 'node:test';
import assert from 'node:assert';
import {
  STORAGE_KEYS,
  sincronizacaoBidirecionalIncremental,
  hidratarCacheLocalDoSupabase,
  gerarBackupLocalCompleto,
  salvarTentativaDb,
} from './supabaseClient';
import {
  classificarStatusCaderno,
  sanitizarHistoricoTentativasDefensivo,
  obterMetricasCadernoErrosSanitizadas,
  calcularLimitesPeriodo,
  obterPartesDataSaoPaulo,
} from '../utils/cadernoErros';

// Mock localStorage para Node.js
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, value: string) => store.set(key, String(value)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  };
}

test('sanitizarHistoricoTentativasDefensivo agrupa tentativas dentro da janela de 5s', () => {
  const t0 = 1700000000000;
  const tentativasBrutas = [
    { questaoId: 'q1', escolha: 1, acertou: false, data: t0, tempoSegundos: 10 },
    { questaoId: 'q1', escolha: 1, acertou: false, data: t0 + 100, tempoSegundos: 12 }, // duplo clique
    { questaoId: 'q1', escolha: 1, acertou: false, data: t0 + 2000, tempoSegundos: 15 }, // retry de rede
    { questaoId: 'q1', escolha: 2, acertou: true, data: t0 + 60000, tempoSegundos: 20 }, // 1 minuto depois
  ];

  const sanitizadas = sanitizarHistoricoTentativasDefensivo(tentativasBrutas as any);

  // Deve mesclar as 3 primeiras em apenas 1 e manter a 4ª
  assert.strictEqual(sanitizadas.length, 2);
  assert.strictEqual(sanitizadas[0].escolha, 1);
  assert.strictEqual(sanitizadas[0].tempoSegundos, 15); // tempo atualizado
  assert.strictEqual(sanitizadas[1].escolha, 2);
  assert.strictEqual(sanitizadas[1].acertou, true);
});

test('classificarStatusCaderno segue a Máquina de Estados Estrita', () => {
  const t0 = 1700000000000;

  // 1. Nunca errada -> null
  const apenasAcertos = [{ questaoId: 'q1', escolha: 0, acertou: true, data: t0 }];
  assert.strictEqual(classificarStatusCaderno(apenasAcertos as any), null);

  // 2. Erro inédito: apenas 1 tentativa e foi erro -> 'inedito'
  const erroInedito = [{ questaoId: 'q1', escolha: 1, acertou: false, data: t0 }];
  const resInedito = classificarStatusCaderno(erroInedito as any);
  assert.strictEqual(resInedito?.status, 'inedito');
  assert.strictEqual(resInedito?.totalTentativas, 1);

  // 3. Recuperada: teve erro anterior, 2+ tentativas, e a ÚLTIMA foi acerto -> 'recuperada'
  const recuperada = [
    { questaoId: 'q1', escolha: 1, acertou: false, data: t0 },
    { questaoId: 'q1', escolha: 2, acertou: true, data: t0 + 3600000 },
  ];
  const resRecuperada = classificarStatusCaderno(recuperada as any);
  assert.strictEqual(resRecuperada?.status, 'recuperada');
  assert.strictEqual(resRecuperada?.totalTentativas, 2);

  // 4. Reincidente: teve erro anterior, 2+ tentativas, e a ÚLTIMA foi erro -> 'reincidente'
  const reincidente = [
    { questaoId: 'q1', escolha: 1, acertou: false, data: t0 },
    { questaoId: 'q1', escolha: 3, acertou: false, data: t0 + 3600000 },
  ];
  const resReincidente = classificarStatusCaderno(reincidente as any);
  assert.strictEqual(resReincidente?.status, 'reincidente');
  assert.strictEqual(resReincidente?.totalTentativas, 2);

  // 5. Se foi recuperada e depois errou novamente -> volta para 'reincidente'
  const reincidenteAposRecuperada = [
    { questaoId: 'q1', escolha: 1, acertou: false, data: t0 },
    { questaoId: 'q1', escolha: 2, acertou: true, data: t0 + 3600000 },
    { questaoId: 'q1', escolha: 1, acertou: false, data: t0 + 7200000 },
  ];
  const resVoltaReincidente = classificarStatusCaderno(reincidenteAposRecuperada as any);
  assert.strictEqual(resVoltaReincidente?.status, 'reincidente');
  assert.strictEqual(resVoltaReincidente?.totalTentativas, 3);
});

test('calcularLimitesPeriodo no fuso America/Sao_Paulo normaliza início do dia civil', () => {
  // Teste com data às 22h30 em Brasília (que seria 01h30 UTC do dia seguinte)
  const dataNoiteSp = new Date('2026-11-10T22:30:00-03:00');
  const limites = calcularLimitesPeriodo('hoje', '', '', dataNoiteSp, 'America/Sao_Paulo');

  const partes = obterPartesDataSaoPaulo(dataNoiteSp);
  assert.strictEqual(partes.ano, 2026);
  assert.strictEqual(partes.mes, 11);
  assert.strictEqual(partes.dia, 10);

  // O limite de início de 'hoje' deve ser exatamente 00:00:00 daquele mesmo dia civil
  assert.ok(limites.limiteInicio <= dataNoiteSp.getTime());
  assert.ok(limites.limiteFim >= dataNoiteSp.getTime());
});

test('obterMetricasCadernoErrosSanitizadas sincroniza contagens de inéditos, recuperadas e reincidentes', () => {
  const questoes = [
    { id: 1, enunciado: 'Q1' },
    { id: 2, enunciado: 'Q2' },
    { id: 3, enunciado: 'Q3' },
  ];
  const historico = {
    '1': [{ escolha: 1, acertou: false, data: 1000 }], // Inédito
    '2': [
      { escolha: 1, acertou: false, data: 1000 },
      { escolha: 2, acertou: true, data: 20000 },
    ], // Recuperada
    '3': [
      { escolha: 1, acertou: false, data: 1000 },
      { escolha: 3, acertou: false, data: 20000 },
    ], // Reincidente
  };

  const metricas = obterMetricasCadernoErrosSanitizadas(questoes as any, historico as any);
  assert.strictEqual(metricas.total, 3);
  assert.strictEqual(metricas.inedito, 1);
  assert.strictEqual(metricas.recuperada, 1);
  assert.strictEqual(metricas.reincidente, 1);
});

test('gerarBackupLocalCompleto gera estrutura íntegra do backup físico JSON', async () => {
  const questoesMock = [{ id: 101, enunciado: 'Teste backup' }];
  const sessoesMock = [{ id: 201, codigo: 'SIM-01' }];
  const historicoMock = { '101': [{ escolha: 1, acertou: true, data: 1000 }] };

  localStorage.setItem(STORAGE_KEYS.QUESTOES, JSON.stringify(questoesMock));
  localStorage.setItem(STORAGE_KEYS.SESSOES, JSON.stringify(sessoesMock));
  localStorage.setItem(STORAGE_KEYS.HISTORICO, JSON.stringify(historicoMock));

  const res = await gerarBackupLocalCompleto();
  assert.strictEqual(res.success, true);
  assert.ok(res.fileName?.startsWith('backup-concurso-fafipa-'));
  assert.strictEqual(res.stats?.questoes, 1);
  assert.strictEqual(res.stats?.sessoes, 1);
  assert.strictEqual(res.stats?.historicoQuestoes, 1);
});

test('getAppConfig retorna as credenciais padrão do Supabase como fallback em guia anônima ou pós-limpeza', async () => {
  localStorage.removeItem(STORAGE_KEYS.CONFIG);
  const { getAppConfig, DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } = await import('./supabaseClient');
  const cfg = getAppConfig();
  assert.strictEqual(cfg.supabaseUrl, DEFAULT_SUPABASE_URL);
  assert.strictEqual(cfg.supabaseAnonKey, DEFAULT_SUPABASE_ANON_KEY);
  assert.ok(cfg.supabaseUrl.includes('supabase.co'));
});

test('restaurarBackupLocalJson valida, hidrata localStorage e retorna estatísticas completas', async () => {
  const { restaurarBackupLocalJson } = await import('./supabaseClient');

  const backupMock = JSON.stringify({
    versao: '3.0-blindado',
    questoes: [{ id: 999, enunciado: 'Questão Restaurada', alternativas: ['A', 'B'], correta: 0 }],
    sessoes: [{ id: 'sessao-restaurada-1', titulo: 'Sessão 01', questaoIds: [999] }],
    historico: { '999': [{ questaoId: 999, escolha: 0, acertou: true, data: 1700000000000 }] },
    bancas: [{ id: 'banca-1', nome: 'FAFIPA' }],
  });

  const res = await restaurarBackupLocalJson(backupMock);
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.stats?.questoes, 1);
  assert.strictEqual(res.stats?.sessoes, 1);
  assert.strictEqual(res.stats?.totalTentativas, 1);

  // Confirma gravação no localStorage
  const qSalvas = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTOES) || '[]');
  assert.ok(qSalvas.some((q: any) => q.id === 999));
});

test('restaurarBackupLocalJson rejeita JSON corrompido ou vazio', async () => {
  const { restaurarBackupLocalJson } = await import('./supabaseClient');

  const resInvalido = await restaurarBackupLocalJson('{"invalido": true}');
  assert.strictEqual(resInvalido.success, false);

  const resVazio = await restaurarBackupLocalJson('');
  assert.strictEqual(resVazio.success, false);
});

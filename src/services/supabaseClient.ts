import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Banca,
  Bloco,
  Materia,
  Questao,
  OrigemTipoQuestao,
  SessaoCriada,
  TentativaResposta,
  HistoricoRespostasMap,
  AppConfig,
  RegistroTempoSessao,
} from '../types';
import {
  idbCarregarBlocos,
  idbSalvarBloco,
  idbExcluirBloco,
  idbCarregarMaterias,
  idbSalvarMateria,
  idbExcluirMateria,
  idbLimparTudo,
} from './materiaStorage';
import { getCurrentUser, isAdminEmail } from './authService';
import {
  TODAS_QUESTOES_PROVAS_FAFIPA_REAIS,
  SESSOES_PROVAS_FAFIPA_INICIAIS,
} from '../data/provasFafipaReais';
import {
  obterQuestoesProvasAnterioresOficiais,
  obterSessoesProvasAnterioresOficiais,
  ehIdDeProvaAnterior,
  sanitizarAcervoQuestoes,
  registrarNovasProvasAnteriores,
} from '../utils/provasAnterioresRegistry';
import { carregarProvasCustomizadasLocalStorage } from '../utils/uploadProvaUtils';
import {
  normalizarQuestaoParaEap,
  auditarERecategorizarAcervo,
  RelatorioAuditoriaAcervoEap,
} from '../utils/recategorizadorEap';
import { hashStringTo32BitInt } from '../utils/uuidUtils';

export const STORAGE_KEYS = {
  CONFIG: 'gb_config',
  BANCAS: 'gb_bancas',
  BLOCOS: 'gb_blocos',
  MATERIAS: 'gb_materias',
  QUESTOES: 'gb_questoes',
  SESSOES: 'gb_sessoescriadas',
  HISTORICO: 'gb_historico_respostas',
  LEGACY_MIGRATED: 'gb_legacy_migrated_v2',
  TEMPO_SESSOES: 'gb_tempo_sessoes_registros',
  GRIFOS: 'gb_grifos_questoes',
};

export type CloudSyncEventDetail = {
  status: 'syncing' | 'saved' | 'idle' | 'error';
  message: string;
  time: string;
  action?: string;
};

// Dispara sinalização visual instantânea ao lado do visor Cloud no cabeçalho
export function notificarEnvioCloud(
  payload: string | { status?: 'syncing' | 'saved' | 'idle' | 'error'; message: string; action?: string } = 'Dados enviados'
) {
  if (typeof window !== 'undefined') {
    const timeFormatted = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const fullTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const detail: CloudSyncEventDetail =
      typeof payload === 'string'
        ? { status: 'saved', message: payload, time: timeFormatted }
        : {
            status: payload.status || 'saved',
            message: payload.message || 'Dados enviados',
            time: timeFormatted,
            action: payload.action,
          };

    try {
      localStorage.setItem('gb_last_cloud_sync_time', timeFormatted);
      localStorage.setItem('gb_last_cloud_sync_full_time', fullTime);
      localStorage.setItem('gb_last_cloud_sync_msg', detail.message);
      localStorage.setItem('gb_last_cloud_sync_status', detail.status);
    } catch {}

    window.dispatchEvent(new CustomEvent('gb_cloud_sync_notified', { detail }));
  }
}


// Credenciais padrão imutáveis do projeto Supabase (Fallback para Guia Anônima e Cache Limpo)
export const DEFAULT_SUPABASE_URL = 'https://ajvvzmjvyvdvoistansh.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_HkC6HGVK1gHSZn-SP7mBLw_RoAbVaWx';

// Retrieve saved configurations (from localStorage, Vite env or default fallback)
export function getAppConfig(): AppConfig {
  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
  try {
    const saved = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(STORAGE_KEYS.CONFIG) : null;
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        supabaseUrl: parsed.supabaseUrl || metaEnv?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
        supabaseAnonKey: parsed.supabaseAnonKey || metaEnv?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
        geminiApiKey: parsed.geminiApiKey || '',
      };
    }
  } catch (e) {
    console.error('Erro ao ler configurações locais:', e);
  }

  return {
    supabaseUrl: metaEnv?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    supabaseAnonKey: metaEnv?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
    geminiApiKey: '',
  };
}

export async function salvarConfiguracaoSistemaSupabase(geminiApiKey: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client || !geminiApiKey) return false;
  try {
    const { data: existing } = await client
      .from('bancas')
      .select('id')
      .eq('nome', '__SYSTEM_CONFIG__')
      .maybeSingle();
    if (existing?.id) {
      await client.from('bancas').update({ obs: geminiApiKey.trim() }).eq('id', existing.id);
    } else {
      await client.from('bancas').insert({
        nome: '__SYSTEM_CONFIG__',
        cargo: 'CONFIG',
        user_email: '__SYSTEM__',
        obs: geminiApiKey.trim(),
      });
    }
    return true;
  } catch (e) {
    console.warn('Erro ao salvar configuração do sistema no Supabase:', e);
    return false;
  }
}

export async function carregarConfiguracaoSistemaSupabase(): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('bancas')
      .select('obs')
      .eq('nome', '__SYSTEM_CONFIG__')
      .maybeSingle();
    if (!error && data?.obs && data.obs.trim().length > 10) {
      return data.obs.trim();
    }
  } catch (e) {
    console.warn('Erro ao carregar configuração do sistema do Supabase:', e);
  }
  return null;
}

export function saveAppConfig(config: AppConfig) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    cachedClient = null;

    if (config.geminiApiKey) {
      salvarConfiguracaoSistemaSupabase(config.geminiApiKey).catch(() => {});
    }

    // Sincroniza com o servidor para disponibilizar para celular e outros dispositivos
    fetch('/api/cloud-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supabaseUrl: config.supabaseUrl,
        supabaseAnonKey: config.supabaseAnonKey,
        geminiApiKey: config.geminiApiKey || undefined,
      }),
    }).catch((err) => console.warn('Erro ao sincronizar config com servidor:', err));
  } catch (e) {
    console.error('Erro ao salvar configurações:', e);
  }
}

export async function syncConfigFromServer(): Promise<AppConfig> {
  try {
    const res = await fetch('/api/cloud-config');
    let geminiKeyFromServer = '';
    if (res.ok) {
      const data = await res.json();
      const local = getAppConfig();
      let changed = false;
      const merged: AppConfig = { ...local };

      if (data.supabaseUrl && data.supabaseAnonKey) {
        if (!local.supabaseUrl || !local.supabaseAnonKey || local.supabaseUrl !== data.supabaseUrl) {
          merged.supabaseUrl = data.supabaseUrl;
          merged.supabaseAnonKey = data.supabaseAnonKey;
          changed = true;
        }
      }

      if (data.geminiApiKey) {
        geminiKeyFromServer = data.geminiApiKey;
      }

      if (geminiKeyFromServer && geminiKeyFromServer.trim().length > 10) {
        if (!local.geminiApiKey || local.geminiApiKey.trim() === '' || local.geminiApiKey !== geminiKeyFromServer) {
          merged.geminiApiKey = geminiKeyFromServer;
          changed = true;
        }
      }

      if (changed) {
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(merged));
        cachedClient = null;
      }
    }

    // Fallback: se a chave ainda estiver vazia no localStorage deste dispositivo, consulta Supabase
    const currentLocal = getAppConfig();
    if (!currentLocal.geminiApiKey || currentLocal.geminiApiKey.trim() === '') {
      const keyFromDb = await carregarConfiguracaoSistemaSupabase();
      if (keyFromDb) {
        currentLocal.geminiApiKey = keyFromDb;
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(currentLocal));
        fetch('/api/cloud-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ geminiApiKey: keyFromDb }),
        }).catch(() => {});
        return currentLocal;
      }
    }
  } catch (e) {
    console.warn('Erro ao buscar config da nuvem no servidor:', e);
  }
  return getAppConfig();
}

let cachedClient: SupabaseClient | null = null;

export function cleanSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
}

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const config = getAppConfig();
  const url = cleanSupabaseUrl(config.supabaseUrl);
  if (url && config.supabaseAnonKey && url.startsWith('http')) {
    try {
      cachedClient = createClient(url, config.supabaseAnonKey.trim(), {
        auth: {
          persistSession: false,
        },
      });
      return cachedClient;
    } catch (e) {
      console.warn('Falha ao inicializar cliente Supabase:', e);
      return null;
    }
  }
  return null;
}

// Helper: get current active user email or default admin
function getActiveEmail(): string {
  const user = getCurrentUser();
  if (user && user.email) return user.email.trim().toLowerCase();
  return 'gahenrique.eng@gmail.com';
}

// ----------------------------------------------------
// MIGRAÇÃO 100% DOS DADOS LEGADOS PARA O ADM GABRIEL
// ----------------------------------------------------
export async function migrarDadosLegadosParaAdm(admEmail: string = 'gahenrique.eng@gmail.com'): Promise<{
  success: boolean;
  message: string;
}> {
  const cleanAdm = admEmail.trim().toLowerCase();
  const client = getSupabaseClient();

  try {
    // 1. Migrar no Supabase
    if (client) {
      await Promise.allSettled([
        client.from('bancas').update({ user_email: cleanAdm }).or('user_email.is.null,user_email.eq.,user_email.eq.undefined'),
        client.from('questoes').update({ user_email: cleanAdm }).or('user_email.is.null,user_email.eq.,user_email.eq.undefined'),
        client.from('sessoes').update({ user_email: cleanAdm }).or('user_email.is.null,user_email.eq.,user_email.eq.undefined'),
        client.from('historico_respostas').update({ user_email: cleanAdm }).or('user_email.is.null,user_email.eq.,user_email.eq.undefined'),
        client.from('blocos').update({ user_email: cleanAdm }).or('user_email.is.null,user_email.eq.,user_email.eq.undefined'),
        client.from('materias').update({ user_email: cleanAdm }).or('user_email.is.null,user_email.eq.,user_email.eq.undefined'),
      ]);
    }

    // 2. Migrar no LocalStorage
    const tables = [STORAGE_KEYS.BANCAS, STORAGE_KEYS.BLOCOS, STORAGE_KEYS.MATERIAS, STORAGE_KEYS.QUESTOES, STORAGE_KEYS.SESSOES];
    for (const key of tables) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const items = JSON.parse(raw);
          if (Array.isArray(items)) {
            const updated = items.map((item: any) => {
              if (!item.user_email || item.user_email === 'undefined') {
                return { ...item, user_email: cleanAdm };
              }
              return item;
            });
            localStorage.setItem(key, JSON.stringify(updated));
          }
        }
      } catch {}
    }

    // 3. Migrar no IndexedDB
    try {
      const bls = await idbCarregarBlocos();
      for (const b of bls) {
        if (!b.user_email) {
          await idbSalvarBloco({ ...b, user_email: cleanAdm });
        }
      }
      const mats = await idbCarregarMaterias();
      for (const m of mats) {
        if (!m.user_email) {
          await idbSalvarMateria({ ...m, user_email: cleanAdm });
        }
      }
    } catch {}

    localStorage.setItem(STORAGE_KEYS.LEGACY_MIGRATED, 'true');
    return {
      success: true,
      message: '100% dos dados legados foram vinculados com sucesso ao Administrador Gabriel!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro na migração: ${err.message || 'Falha desconhecida.'}`,
    };
  }
}

export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  tables?: {
    bancas: boolean;
    blocos: boolean;
    materias: boolean;
    questoes: boolean;
    sessoes: boolean;
    historico: boolean;
    usuarios: boolean;
  };
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase URL ou Chave Anon não configuradas. Preencha os campos abaixo.',
    };
  }

  try {
    const [bancasRes, blocosRes, materiasRes, questoesRes, sessoesRes, histRes, usuariosRes] = await Promise.all([
      client.from('bancas').select('id', { count: 'exact', head: true }),
      client.from('blocos').select('id', { count: 'exact', head: true }),
      client.from('materias').select('id', { count: 'exact', head: true }),
      client.from('questoes').select('id', { count: 'exact', head: true }),
      client.from('sessoes').select('id', { count: 'exact', head: true }),
      client.from('historico_respostas').select('id', { count: 'exact', head: true }),
      client.from('usuarios').select('id', { count: 'exact', head: true }),
    ]);

    const tables = {
      bancas: !bancasRes.error,
      blocos: !blocosRes.error,
      materias: !materiasRes.error,
      questoes: !questoesRes.error,
      sessoes: !sessoesRes.error,
      historico: !histRes.error,
      usuarios: !usuariosRes.error,
    };

    const hasMissingCore = !tables.bancas || !tables.questoes || !tables.sessoes || !tables.historico;

    if (hasMissingCore) {
      return {
        success: false,
        message: 'Conectado ao Supabase, mas algumas tabelas ainda não foram criadas. Copie e execute o script SQL da aba "Script SQL".',
        tables,
      };
    }

    return {
      success: true,
      message: 'Conexão com o Supabase estabelecida com sucesso! Todas as tabelas encontradas.',
      tables,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao testar conexão: ${err.message || 'Verifique as credenciais e tente novamente.'}`,
    };
  }
}

/**
 * Utilitário para buscar todos os registros de uma tabela no Supabase sem o limite padrão de 1000 linhas do PostgREST.
 * Pagina de forma robusta e transparente através de .range(from, to) em lotes de 1000 até coletar a base completa.
 */
export async function fetchAllRowsPaginated<T = any>(
  fetchPage: (from: number, to: number) => Promise<{ data: T[] | null; error: any }>,
  pageSize = 1000,
  maxTotal = 250000
): Promise<{ data: T[]; error: any }> {
  let allRows: T[] = [];
  let from = 0;
  while (from < maxTotal) {
    const to = from + pageSize - 1;
    const { data, error } = await fetchPage(from, to);
    if (error) {
      return { data: allRows, error };
    }
    if (!data || data.length === 0) {
      break;
    }
    allRows = allRows.concat(data);
    if (data.length < pageSize) {
      break;
    }
    from += pageSize;
  }
  return { data: allRows, error: null };
}

// ----------------------------------------------------
// BANCAS CRUD
// ----------------------------------------------------
export async function carregarBancas(): Promise<Banca[]> {
  const client = getSupabaseClient();
  const currentEmail = getActiveEmail();
  const isAdm = isAdminEmail(currentEmail);

  if (client) {
    try {
      let query = client.from('bancas').select('*').order('id', { ascending: false });
      if (isAdm) {
        query = query.or(`user_email.eq.${currentEmail},user_email.is.null,user_email.eq.,user_email.eq.undefined`);
      } else {
        query = query.eq('user_email', currentEmail);
      }

      let { data, error } = await query;
      if (error && (error.code === '42703' || error.message?.includes('user_email'))) {
        const retry = await client.from('bancas').select('*').order('id', { ascending: false });
        if (!retry.error && retry.data) {
          data = retry.data;
          error = null;
        }
      }

      if (!error && data) {
        const parsed: Banca[] = data.map((b: any) => ({
          id: b.id,
          user_email: b.user_email || currentEmail,
          nome: b.nome,
          cargo: b.cargo || '',
          arquivos: Array.isArray(b.arquivos) ? b.arquivos : typeof b.arquivos === 'string' ? JSON.parse(b.arquivos) : [],
          obs: b.obs || '',
          created_at: b.created_at,
        }));
        return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar bancas do Supabase, usando cache local:', e);
    }
  }

  // Fallback to localStorage filtered by current user
  try {
    const raw: Banca[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BANCAS) || '[]');
    return raw.filter((b) => {
      const email = (b.user_email || '').toLowerCase();
      if (isAdm) return !email || email === currentEmail || email === 'undefined';
      return email === currentEmail;
    });
  } catch {
    return [];
  }
}

export async function salvarBancaDb(novaBanca: { nome: string; cargo?: string; arquivos: string[]; obs: string }): Promise<Banca> {
  const client = getSupabaseClient();
  const userEmail = getActiveEmail();
  const tempId = Date.now();

  const bancaObj: Banca = {
    id: tempId,
    user_email: userEmail,
    nome: novaBanca.nome,
    cargo: novaBanca.cargo || '',
    arquivos: novaBanca.arquivos,
    obs: novaBanca.obs,
  };

  if (client) {
    try {
      const payload: Record<string, any> = {
        user_email: userEmail,
        nome: novaBanca.nome,
        arquivos: novaBanca.arquivos,
        obs: novaBanca.obs,
      };
      if (novaBanca.cargo) payload.cargo = novaBanca.cargo;

      const { data, error } = await client.from('bancas').insert(payload).select().single();
      if (!error && data) {
        bancaObj.id = data.id;
        bancaObj.created_at = data.created_at;
      }
    } catch (e) {
      console.warn('Erro ao salvar banca no Supabase, mantendo localmente:', e);
    }
  }

  // Update local storage
  try {
    const current: Banca[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BANCAS) || '[]');
    current.push(bancaObj);
    localStorage.setItem(STORAGE_KEYS.BANCAS, JSON.stringify(current));
  } catch {}

  notificarEnvioCloud('Banca salva na nuvem');
  return bancaObj;
}

export async function excluirBancaDb(id: number | string): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('bancas').delete().eq('id', id);
    } catch (e) {
      console.warn('Erro ao excluir banca do Supabase:', e);
    }
  }

  try {
    const current: Banca[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BANCAS) || '[]');
    const filtered = current.filter((b) => String(b.id) !== String(id));
    localStorage.setItem(STORAGE_KEYS.BANCAS, JSON.stringify(filtered));
  } catch {}

  notificarEnvioCloud('Banca removida');
}

export async function atualizarBancaDb(id: number | string, dados: Partial<Banca>): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const payload: Record<string, any> = {};
      if (dados.nome !== undefined) payload.nome = dados.nome;
      if (dados.cargo !== undefined) payload.cargo = dados.cargo;
      if (dados.arquivos !== undefined) payload.arquivos = dados.arquivos;
      if (dados.obs !== undefined) payload.obs = dados.obs;
      await client.from('bancas').update(payload).eq('id', id);
    } catch (e) {
      console.warn('Erro ao atualizar banca no Supabase:', e);
    }
  }

  try {
    const current: Banca[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BANCAS) || '[]');
    const updated = current.map((b) => (String(b.id) === String(id) ? { ...b, ...dados } : b));
    localStorage.setItem(STORAGE_KEYS.BANCAS, JSON.stringify(updated));
  } catch {}

  notificarEnvioCloud('Banca atualizada');
}

// ----------------------------------------------------
// BLOCOS (DISCIPLINAS) CRUD (Nuvem + Local)
// ----------------------------------------------------
export async function carregarBlocos(): Promise<Bloco[]> {
  const currentEmail = getActiveEmail();
  const isAdm = isAdminEmail(currentEmail);
  const client = getSupabaseClient();

  // 1. Try Supabase if connected
  if (client) {
    try {
      let query = client.from('blocos').select('*').order('id', { ascending: true });
      if (isAdm) {
        query = query.or(`user_email.eq.${currentEmail},user_email.is.null,user_email.eq.,user_email.eq.undefined`);
      } else {
        query = query.eq('user_email', currentEmail);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const parsed: Bloco[] = data.map((b: any) => ({
          id: b.id,
          user_email: b.user_email || currentEmail,
          nome: b.nome,
          descricao: b.descricao || '',
          created_at: b.created_at,
        }));
        return parsed;
      }
    } catch (e) {
      console.warn('Tabela blocos no Supabase ainda não inicializada ou erro:', e);
    }
  }

  // 2. Try IndexedDB
  const idbBlocos = await idbCarregarBlocos();
  const filteredIdb = idbBlocos.filter((b) => {
    const email = (b.user_email || '').toLowerCase();
    if (isAdm) return !email || email === currentEmail || email === 'undefined';
    return email === currentEmail;
  });
  if (filteredIdb.length > 0) return filteredIdb;

  // 3. Try localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BLOCOS);
    if (raw) {
      const parsed: Bloco[] = JSON.parse(raw);
      const filtered = parsed.filter((b) => {
        const email = (b.user_email || '').toLowerCase();
        if (isAdm) return !email || email === currentEmail || email === 'undefined';
        return email === currentEmail;
      });
      if (filtered.length > 0) return filtered;
    }
  } catch {}

  // 4. Default seed blocks for initial experience
  const defaultBlocos: Bloco[] = [
    { id: 1, user_email: currentEmail, nome: '01_Direito Administrativo', descricao: 'Princípios, atos, poderes e organização administrativa' },
    { id: 2, user_email: currentEmail, nome: '02_Licitações Contratos Custos', descricao: 'Lei 14.133/21, contratações públicas e termos de referência' },
    { id: 3, user_email: currentEmail, nome: '03_Direito Constitucional', descricao: 'Direitos fundamentais, administração e competências' },
  ];

  try {
    for (const b of defaultBlocos) {
      await idbSalvarBloco(b);
    }
  } catch {}

  return defaultBlocos;
}

export async function salvarBlocoDb(novo: { nome: string; descricao?: string }): Promise<Bloco> {
  const currentEmail = getActiveEmail();
  const id = Date.now();
  const blocoObj: Bloco = {
    id,
    user_email: currentEmail,
    nome: novo.nome.trim(),
    descricao: (novo.descricao || '').trim(),
    created_at: new Date().toISOString(),
  };

  // Try Supabase
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('blocos').insert({
        user_email: currentEmail,
        nome: blocoObj.nome,
        descricao: blocoObj.descricao,
      }).select().single();
      if (!error && data) {
        blocoObj.id = data.id;
        blocoObj.created_at = data.created_at;
      }
    } catch (e) {
      console.warn('Erro ao salvar bloco no Supabase, salvo localmente:', e);
    }
  }

  await idbSalvarBloco(blocoObj);

  try {
    const current: Bloco[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BLOCOS) || '[]');
    current.push(blocoObj);
    localStorage.setItem(STORAGE_KEYS.BLOCOS, JSON.stringify(current));
  } catch {}

  notificarEnvioCloud('Bloco salvo na nuvem');
  return blocoObj;
}

export async function atualizarBlocoDb(id: number | string, dados: Partial<Bloco>): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const payload: Record<string, any> = {};
      if (dados.nome !== undefined) payload.nome = dados.nome;
      if (dados.descricao !== undefined) payload.descricao = dados.descricao;
      await client.from('blocos').update(payload).eq('id', id);
    } catch {}
  }

  const current = await carregarBlocos();
  const target = current.find((b) => String(b.id) === String(id));
  if (target) {
    const updated = { ...target, ...dados };
    await idbSalvarBloco(updated);
  }

  try {
    const raw: Bloco[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BLOCOS) || '[]');
    const next = raw.map((b) => (String(b.id) === String(id) ? { ...b, ...dados } : b));
    localStorage.setItem(STORAGE_KEYS.BLOCOS, JSON.stringify(next));
  } catch {}

  notificarEnvioCloud('Bloco atualizado');
}

export async function excluirBlocoDb(id: number | string): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('blocos').delete().eq('id', id);
    } catch {}
  }

  await idbExcluirBloco(id);
  try {
    const raw: Bloco[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BLOCOS) || '[]');
    const next = raw.filter((b) => String(b.id) !== String(id));
    localStorage.setItem(STORAGE_KEYS.BLOCOS, JSON.stringify(next));
  } catch {}

  notificarEnvioCloud('Bloco removido');
}

// ----------------------------------------------------
// MATÉRIAS & LEIS (PDFs) CRUD (Nuvem + Local)
// ----------------------------------------------------
export async function carregarMaterias(): Promise<Materia[]> {
  const currentEmail = getActiveEmail();
  const isAdm = isAdminEmail(currentEmail);
  const client = getSupabaseClient();

  // 1. Try Supabase if connected
  if (client) {
    try {
      let query = client.from('materias').select('*').order('id', { ascending: false });
      if (isAdm) {
        query = query.or(`user_email.eq.${currentEmail},user_email.is.null,user_email.eq.,user_email.eq.undefined`);
      } else {
        query = query.eq('user_email', currentEmail);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const parsed: Materia[] = data.map((m: any) => ({
          id: m.id,
          user_email: m.user_email || currentEmail,
          blocoId: m.bloco_id,
          blocoNome: m.bloco_nome || '',
          nome: m.nome,
          arquivoNome: m.arquivo_nome || '',
          arquivoTexto: m.arquivo_texto || '',
          arquivoBase64: m.arquivo_base64 || '',
          arquivoTipo: m.arquivo_tipo || 'application/pdf',
          tamanhoBytes: m.tamanho_bytes || 0,
          created_at: m.created_at,
        }));

        // Mescla arquivoBase64 binário completo armazenado no IndexedDB local
        try {
          const idbList = await idbCarregarMaterias();
          const idbMap = new Map(idbList.map((im) => [String(im.id), im]));
          const idbNameMap = new Map(idbList.map((im) => [im.nome, im]));
          parsed.forEach((m) => {
            const local = idbMap.get(String(m.id)) || idbNameMap.get(m.nome);
            if (local) {
              if (local.arquivoBase64 && !m.arquivoBase64) {
                m.arquivoBase64 = local.arquivoBase64;
              }
              if (local.arquivoTexto && (!m.arquivoTexto || local.arquivoTexto.length > m.arquivoTexto.length)) {
                m.arquivoTexto = local.arquivoTexto;
              }
            }
          });
        } catch (e) {
          console.warn('Erro ao mesclar base64 de IndexedDB com Supabase:', e);
        }

        return parsed;
      }
    } catch (e) {
      console.warn('Tabela materias no Supabase ainda não inicializada ou erro:', e);
    }
  }

  // 2. Try IndexedDB
  const idbMaterias = await idbCarregarMaterias();
  const filteredIdb = idbMaterias.filter((m) => {
    const email = (m.user_email || '').toLowerCase();
    if (isAdm) return !email || email === currentEmail || email === 'undefined';
    return email === currentEmail;
  });
  if (filteredIdb.length > 0) return filteredIdb;

  // 3. Try localStorage metadata
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATERIAS);
    if (raw) {
      const parsed: Materia[] = JSON.parse(raw);
      return parsed.filter((m) => {
        const email = (m.user_email || '').toLowerCase();
        if (isAdm) return !email || email === currentEmail || email === 'undefined';
        return email === currentEmail;
      });
    }
  } catch {}

  return [];
}

export async function salvarMateriaDb(nova: Omit<Materia, 'id' | 'created_at'>): Promise<Materia> {
  const currentEmail = getActiveEmail();
  const id = Date.now();
  const materiaObj: Materia = {
    id,
    user_email: currentEmail,
    blocoId: nova.blocoId,
    blocoNome: nova.blocoNome,
    nome: nova.nome.trim(),
    arquivoNome: nova.arquivoNome,
    arquivoTexto: nova.arquivoTexto || '',
    arquivoBase64: nova.arquivoBase64 || '',
    arquivoTipo: nova.arquivoTipo || 'application/pdf',
    tamanhoBytes: nova.tamanhoBytes || 0,
    created_at: new Date().toISOString(),
  };

  // 1. Try saving to Supabase
  const client = getSupabaseClient();
  if (client) {
    try {
      const numBlocoId =
        nova.blocoId !== undefined && nova.blocoId !== null && !isNaN(Number(nova.blocoId))
          ? Number(nova.blocoId)
          : null;
      const { data, error } = await client.from('materias').insert({
        user_email: currentEmail,
        bloco_id: numBlocoId,
        bloco_nome: nova.blocoNome || '',
        nome: materiaObj.nome,
        arquivo_nome: materiaObj.arquivoNome,
        arquivo_texto: (materiaObj.arquivoTexto || '').slice(0, 100000), // persist text
        arquivo_tipo: materiaObj.arquivoTipo,
        tamanho_bytes: materiaObj.tamanhoBytes,
      }).select().single();

      if (!error && data) {
        materiaObj.id = data.id;
        materiaObj.created_at = data.created_at;
      }
    } catch (e) {
      console.warn('Erro ao salvar matéria no Supabase, salva no IndexedDB:', e);
    }
  }

  // 2. Save full content in IndexedDB
  await idbSalvarMateria(materiaObj);

  // 3. Cache lightweight metadata in localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATERIAS);
    const list: Materia[] = raw ? JSON.parse(raw) : [];
    const lightObj: Materia = {
      ...materiaObj,
      arquivoTexto: (materiaObj.arquivoTexto || '').slice(0, 5000),
      arquivoBase64: '',
    };
    list.push(lightObj);
    localStorage.setItem(STORAGE_KEYS.MATERIAS, JSON.stringify(list));
  } catch {}

  notificarEnvioCloud('Matéria salva na nuvem');
  return materiaObj;
}

export async function atualizarMateriaDb(id: number | string, dados: Partial<Materia>): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const payload: Record<string, any> = {};
      if (dados.nome !== undefined) payload.nome = dados.nome;
      if (dados.blocoId !== undefined) payload.bloco_id = dados.blocoId;
      if (dados.blocoNome !== undefined) payload.bloco_nome = dados.blocoNome;
      await client.from('materias').update(payload).eq('id', id);
    } catch {}
  }

  const all = await idbCarregarMaterias();
  const target = all.find((m) => String(m.id) === String(id));
  if (target) {
    const updated = { ...target, ...dados };
    await idbSalvarMateria(updated);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATERIAS);
    if (raw) {
      const list: Materia[] = JSON.parse(raw);
      const next = list.map((m) => (String(m.id) === String(id) ? { ...m, ...dados } : m));
      localStorage.setItem(STORAGE_KEYS.MATERIAS, JSON.stringify(next));
    }
  } catch {}

  notificarEnvioCloud('Matéria atualizada');
}

export async function excluirMateriaDb(id: number | string): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('materias').delete().eq('id', id);
    } catch {}
  }

  await idbExcluirMateria(id);

  try {
    const raw: Materia[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MATERIAS) || '[]');
    const next = raw.filter((m) => String(m.id) !== String(id));
    localStorage.setItem(STORAGE_KEYS.MATERIAS, JSON.stringify(next));
  } catch {}

  notificarEnvioCloud('Matéria removida');
}

// ----------------------------------------------------
import { normalizarEnunciadoParaDeduplicacao } from '../utils/normalizarTexto';
export { normalizarEnunciadoParaDeduplicacao };

// ----------------------------------------------------
// QUESTOES CRUD
// ----------------------------------------------------
export async function carregarQuestoes(): Promise<Questao[]> {
  const currentEmail = getActiveEmail();
  const client = getSupabaseClient();

  if (client) {
    try {
      // O acervo geral de questões do concurso é compartilhado e nunca deve ser bloqueado por filtro restritivo de user_id
      const fetchAllQuestoes = async () => {
        return await fetchAllRowsPaginated<any>(async (from, to) => {
          return await client
            .from('questoes')
            .select('*')
            .order('id', { ascending: true })
            .range(from, to);
        });
      };

      const { data, error } = await fetchAllQuestoes();

      if (!error && data) {
        const parsedRaw: Questao[] = data.map((q: any) => {
          const idStr = String(q.id || '').toLowerCase();
          const bancaStr = String(q.banca || '').toLowerCase();
          const assStr = String(q.assunto || '').toLowerCase();
          const disStr = String(q.disciplina || '').toLowerCase();
          const origStr = String(q.origem || '').toLowerCase();
          const tipoStr = String(q.tipo || '').toLowerCase();

          const resolvedOrigemTipo: OrigemTipoQuestao =
            q.origem_tipo ||
            q.origemTipo ||
            (idStr.startsWith('fafipa_') || idStr.startsWith('prv_') || bancaStr.includes('prova real')
              ? 'prova_passada'
              : idStr.startsWith('lote') ||
                origStr.includes('escala') ||
                tipoStr.includes('escala') ||
                assStr.includes('lote') ||
                disStr.includes('lote') ||
                Boolean(q.loteCodigo || q.lote_codigo)
              ? 'lote_escala'
              : idStr.startsWith('sim_') ||
                origStr === 'simulado' ||
                tipoStr === 'simulado' ||
                (assStr.includes('simulado') && !assStr.includes('lote'))
              ? 'simulado'
              : 'sessao_avulsa');

          return {
            id: q.id,
            user_email: q.user_email || currentEmail,
            banca: q.banca,
            cargo: q.cargo || '',
            disciplina: q.disciplina,
            assunto: q.assunto,
            artigo: q.artigo,
            enunciado: q.enunciado,
            alternativas: Array.isArray(q.alternativas) ? q.alternativas : typeof q.alternativas === 'string' ? JSON.parse(q.alternativas) : [],
            correta: typeof q.correta === 'number' ? q.correta : parseInt(q.correta, 10) || 0,
            comentario: q.comentario,
            tipo: q.tipo,
            origem: q.origem,
            origemTipo: resolvedOrigemTipo,
            hash_enunciado: normalizarEnunciadoParaDeduplicacao(q.enunciado),
            created_at: q.created_at,
          };
        });

        // Histórico de respostas em memória para remapeamento idempotente sem perda de dados
        let historicoParaRemapear: Record<string, any[]> = {};
        try {
          historicoParaRemapear = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORICO) || '{}');
        } catch {}

        // Coleta candidatos do cache local e de snapshots de sessões locais
        let rawLocal: Questao[] = [];
        try {
          rawLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTOES) || '[]');
        } catch {}

        const sessoesSnapQuestoes: Questao[] = [];
        try {
          const sessoesLocal: SessaoCriada[] = JSON.parse(
            localStorage.getItem(STORAGE_KEYS.SESSOES) ||
            localStorage.getItem('gb_sessoescriadas') ||
            localStorage.getItem('gb_sessoes') ||
            '[]'
          );
          sessoesLocal.forEach((s) => {
            if (Array.isArray(s.questoesSnap)) {
              s.questoesSnap.forEach((sq) => {
                if (sq && sq.id != null) sessoesSnapQuestoes.push(sq);
              });
            }
          });
        } catch {}

        // Candidatos consolidados de todas as fontes (inclui questões de provas customizadas)
        const customProvas = carregarProvasCustomizadasLocalStorage();
        const todasProvasOficiais = obterQuestoesProvasAnterioresOficiais();
        const todosCandidatos = [
          ...parsedRaw,
          ...rawLocal,
          ...sessoesSnapQuestoes,
          ...customProvas.questoes,
          ...todasProvasOficiais,
        ];

        // Higienização central idempotente com unicidade estrita
        const { questoesLimpass, idsRemovidos } = sanitizarAcervoQuestoes(todosCandidatos, {
          emailUsuario: currentEmail,
          historicoParaRemapear,
        });

        // Re-categorização determinística integral para o EAP FAFIPA (7 Blocos / 34 Matérias)
        const relatorioEap = auditarERecategorizarAcervo(questoesLimpass);
        const acervoNormalizadoEap = relatorioEap.questoesSanitizadas;

        // Salva histórico remapeado caso clones numéricos tenham sido consolidados
        try {
          localStorage.setItem(STORAGE_KEYS.HISTORICO, JSON.stringify(historicoParaRemapear));
        } catch {}

        // Atualiza cache local mesclado estritamente higienizado e padronizado no EAP
        try {
          localStorage.setItem(STORAGE_KEYS.QUESTOES, JSON.stringify(acervoNormalizadoEap));
        } catch {}

        // Limpeza assíncrona de réplicas detectadas no Supabase (se houver IDs purgados)
        if (client && idsRemovidos.length > 0) {
          setTimeout(async () => {
            try {
              for (let i = 0; i < idsRemovidos.length; i += 100) {
                const batch = idsRemovidos.slice(i, i + 100);
                await client.from('questoes').delete().in('id', batch);
              }
            } catch (err) {
              console.warn('Aviso ao expurgar duplicatas em background no Supabase:', err);
            }
          }, 3000);
        }

        return acervoNormalizadoEap;
      }
    } catch (e) {
      console.warn('Erro ao carregar questoes do Supabase, usando cache local:', e);
    }
  }

  try {
    const raw: Questao[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTOES) || '[]');
    let historicoParaRemapear: Record<string, any[]> = {};
    try {
      historicoParaRemapear = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORICO) || '{}');
    } catch {}

    const customProvas = carregarProvasCustomizadasLocalStorage();
    const todasProvasOficiais = obterQuestoesProvasAnterioresOficiais();
    const todosCandidatos = [...raw, ...customProvas.questoes, ...todasProvasOficiais];

    const { questoesLimpass } = sanitizarAcervoQuestoes(todosCandidatos, {
      emailUsuario: currentEmail,
      historicoParaRemapear,
    });
    const relatorioEap = auditarERecategorizarAcervo(questoesLimpass);
    const acervoNormalizadoEap = relatorioEap.questoesSanitizadas;
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTOES, JSON.stringify(acervoNormalizadoEap));
      localStorage.setItem(STORAGE_KEYS.HISTORICO, JSON.stringify(historicoParaRemapear));
    } catch {}
    return acervoNormalizadoEap;
  } catch {
    const customProvas = carregarProvasCustomizadasLocalStorage();
    const fallback = auditarERecategorizarAcervo([
      ...obterQuestoesProvasAnterioresOficiais(),
      ...customProvas.questoes,
    ]);
    return fallback.questoesSanitizadas;
  }
}

export async function salvarNovasQuestoesDb(novasQuestoes: Omit<Questao, 'id'>[]): Promise<Questao[]> {
  const client = getSupabaseClient();
  const currentEmail = getActiveEmail();
  const salvas: Questao[] = [];

  // Se forem questões de prova anterior recém-importadas, registra no storage dedicado de provas
  const questoesProvaAnterior = novasQuestoes.filter(
    (q) =>
      (q as any).origemTipo === 'prova_passada' ||
      (q as any).origem === 'prova_anterior' ||
      (q as any).tipo === 'prova_anterior'
  );
  if (questoesProvaAnterior.length > 0) {
    try {
      registrarNovasProvasAnteriores(questoesProvaAnterior as Questao[]);
      const qLocais: Questao[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTOES) || '[]');
      const mapQ = new Map<string, Questao>();
      qLocais.forEach((q) => mapQ.set(String(q.id), q));
      questoesProvaAnterior.forEach((q) => mapQ.set(String((q as Questao).id), q as Questao));
      localStorage.setItem(STORAGE_KEYS.QUESTOES, JSON.stringify(Array.from(mapQ.values())));
    } catch (e) {
      console.warn('Erro ao persistir questoes de prova anterior no cache local:', e);
    }
  }

  // Idempotência e prevenção de duplicatas na entrada
  let currentLocal: Questao[] = [];
  try {
    currentLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTOES) || '[]');
  } catch {}

  const seenStatements = new Set(
    currentLocal.map((q) => normalizarEnunciadoParaDeduplicacao(q.enunciado)).filter(Boolean)
  );

  const questoesUnicas = novasQuestoes.filter((q) => {
    const norm = normalizarEnunciadoParaDeduplicacao(q.enunciado);
    if (!norm) return true;
    if (seenStatements.has(norm)) return false;
    seenStatements.add(norm);
    return true;
  });

  if (questoesUnicas.length === 0) {
    return novasQuestoes as Questao[];
  }

  if (client) {
    try {
      const rowsToInsert = questoesUnicas.map((q) => {
        const row: Record<string, any> = {
          user_email: currentEmail,
          banca: q.banca,
          disciplina: q.disciplina,
          assunto: q.assunto,
          artigo: q.artigo,
          enunciado: q.enunciado,
          alternativas: q.alternativas,
          correta: q.correta,
          comentario: q.comentario,
        };
        if (q.cargo) row.cargo = q.cargo;
        return row;
      });

      let { data, error } = await client.from('questoes').insert(rowsToInsert).select();
      if (error && (error.code === '42703' || error.message?.includes('user_email') || error.message?.includes('cargo'))) {
        const fallbackRows = rowsToInsert.map(({ user_email, cargo, ...rest }) => rest);
        const retry = await client.from('questoes').insert(fallbackRows).select();
        if (!retry.error && retry.data) {
          data = retry.data;
          error = null;
        }
      }

      if (!error && data) {
        data.forEach((row: any) => {
          salvas.push({
            id: row.id,
            user_email: row.user_email || currentEmail,
            banca: row.banca,
            cargo: row.cargo || '',
            disciplina: row.disciplina,
            assunto: row.assunto,
            artigo: row.artigo,
            enunciado: row.enunciado,
            alternativas: Array.isArray(row.alternativas) ? row.alternativas : JSON.parse(row.alternativas),
            correta: row.correta,
            comentario: row.comentario,
            created_at: row.created_at,
          });
        });
      }
    } catch (e) {
      console.warn('Erro ao inserir questões no Supabase, salvando localmente:', e);
    }
  }

  // Fallback if Supabase was unavailable or didn't return rows
  if (salvas.length === 0) {
    const timestamp = Date.now();
    questoesUnicas.forEach((q, index) => {
      salvas.push({
        id: timestamp + index + 1,
        user_email: currentEmail,
        ...q,
      });
    });
  }

  // Sync to local storage com higienização estrita
  try {
    const current: Questao[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTOES) || '[]');
    const { questoesLimpass } = sanitizarAcervoQuestoes([...current, ...salvas]);
    localStorage.setItem(STORAGE_KEYS.QUESTOES, JSON.stringify(questoesLimpass));
  } catch {}

  notificarEnvioCloud(`${salvas.length} questões salvas na nuvem`);
  return salvas;
}

export async function excluirQuestaoDb(id: number | string): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('questoes').delete().eq('id', id);
    } catch (e) {
      console.warn('Erro ao deletar questao no Supabase:', e);
    }
  }

  try {
    const current: Questao[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTOES) || '[]');
    const filtered = current.filter((q) => String(q.id) !== String(id));
    localStorage.setItem(STORAGE_KEYS.QUESTOES, JSON.stringify(filtered));
  } catch {}

  notificarEnvioCloud('Questão excluída');
}

export async function atualizarQuestoesDb(
  filtro: { ids?: (number | string)[]; oldDisciplina?: string; oldAssunto?: string },
  novosDados: { disciplina?: string; assunto?: string; banca?: string; cargo?: string }
): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      if (filtro.ids && filtro.ids.length > 0) {
        await client.from('questoes').update(novosDados).in('id', filtro.ids);
      }
      if (filtro.oldDisciplina && filtro.oldAssunto) {
        await client
          .from('questoes')
          .update(novosDados)
          .eq('disciplina', filtro.oldDisciplina)
          .eq('assunto', filtro.oldAssunto);
      }
    } catch (e) {
      console.warn('Erro ao atualizar questões no Supabase:', e);
    }
  }

  try {
    const current: Questao[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTOES) || '[]');
    const idsSet = new Set((filtro.ids || []).map((id) => String(id)));
    const updated = current.map((q) => {
      const matchId = idsSet.has(String(q.id));
      const matchOld = Boolean(
        filtro.oldDisciplina &&
        filtro.oldAssunto &&
        q.disciplina === filtro.oldDisciplina &&
        q.assunto === filtro.oldAssunto
      );
      if (matchId || matchOld) {
        return {
          ...q,
          ...(novosDados.disciplina ? { disciplina: novosDados.disciplina } : {}),
          ...(novosDados.assunto ? { assunto: novosDados.assunto } : {}),
          ...(novosDados.banca ? { banca: novosDados.banca } : {}),
          ...(novosDados.cargo ? { cargo: novosDados.cargo } : {}),
        };
      }
      return q;
    });
    localStorage.setItem(STORAGE_KEYS.QUESTOES, JSON.stringify(updated));
  } catch (e) {
    console.warn('Erro ao salvar questoes atualizadas no localStorage:', e);
  }
}

/**
 * Re-categoriza integralmente todo o acervo para o EAP FAFIPA (7 Blocos / 34 Matérias)
 * e persiste as alterações no Supabase e no localStorage em background.
 */
export async function recategorizarESincronizarAcervoEap(questoesAtuais?: Questao[]): Promise<RelatorioAuditoriaAcervoEap> {
  const client = getSupabaseClient();
  let baseQuestoes: Questao[] = questoesAtuais || [];

  if (baseQuestoes.length === 0) {
    try {
      baseQuestoes = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTOES) || '[]');
    } catch {}
  }

  // Se ainda estiver vazio, carrega canônicas
  if (baseQuestoes.length === 0) {
    baseQuestoes = obterQuestoesProvasAnterioresOficiais();
  }

  const relatorio = auditarERecategorizarAcervo(baseQuestoes);

  // 1. Atualiza cache local
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTOES, JSON.stringify(relatorio.questoesSanitizadas));
  } catch {}

  // 2. Se houver questões que sofreram re-categorização e client Supabase estiver conectado, sincroniza
  if (client && relatorio.totalRecategorizadas > 0) {
    const alteradas = relatorio.questoesSanitizadas.filter((q, idx) => {
      const original = baseQuestoes[idx];
      return original && (original.disciplina !== q.disciplina || original.assunto !== q.assunto);
    });

    if (alteradas.length > 0) {
      setTimeout(async () => {
        try {
          // Atualiza em lotes de 25
          for (let i = 0; i < alteradas.length; i += 25) {
            const batch = alteradas.slice(i, i + 25);
            await Promise.all(
              batch.map((q) =>
                client
                  .from('questoes')
                  .update({ disciplina: q.disciplina, assunto: q.assunto })
                  .eq('id', q.id)
              )
            );
          }
          notificarEnvioCloud({
            status: 'saved',
            message: `${alteradas.length} questões padronizadas no EAP`,
          });
        } catch (err) {
          console.warn('Erro ao sincronizar re-categorização com Supabase:', err);
        }
      }, 500);
    }
  }

  return relatorio;
}

// ----------------------------------------------------
// SESSOES CRUD
// ----------------------------------------------------
export async function carregarSessoes(): Promise<SessaoCriada[]> {
  const currentEmail = getActiveEmail();
  const isAdm = isAdminEmail(currentEmail);
  const client = getSupabaseClient();

  if (client) {
    try {
      const fetchWithFilter = async (useEmailFilter: boolean) => {
        return await fetchAllRowsPaginated<any>(async (from, to) => {
          let query = client
            .from('sessoes')
            .select('*')
            .order('id', { ascending: false })
            .range(from, to);

          if (useEmailFilter) {
            if (isAdm) {
              query = query.or(`user_email.eq.${currentEmail},user_email.is.null,user_email.eq.,user_email.eq.undefined`);
            } else {
              query = query.eq('user_email', currentEmail);
            }
          }
          return await query;
        });
      };

      let { data, error } = await fetchWithFilter(Boolean(currentEmail && !isAdm));
      if (error || !data || data.length === 0) {
        const retryResult = await fetchWithFilter(false);
        if (!retryResult.error && retryResult.data && retryResult.data.length > 0) {
          data = retryResult.data;
          error = null;
        }
      }

      if (!error && data) {
        // Obter mapa local para garantir que métricas salvas localmente não sejam perdidas
        const localMap = new Map<string, Partial<SessaoCriada>>();
        try {
          const rawLocal: SessaoCriada[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSOES) || '[]');
          rawLocal.forEach((ls) => {
            if (ls.id !== undefined && ls.id !== null) localMap.set(String(ls.id), ls);
            if (ls.codigo) localMap.set(String(ls.codigo).toLowerCase(), ls);
          });
        } catch {}

        const parsed: SessaoCriada[] = data.map((s: any) => {
          const localMatch =
            (s.id !== undefined && s.id !== null ? localMap.get(String(s.id)) : undefined) ||
            (s.codigo ? localMap.get(String(s.codigo).toLowerCase()) : undefined);

          const tempo =
            s.tempo_segundos ??
            s.tempoSegundos ??
            s.duracao_segundos ??
            s.duracao ??
            s.tempo ??
            s.segundos ??
            localMatch?.tempoSegundos ??
            0;

          const concluida =
            s.concluida !== undefined
              ? Boolean(s.concluida)
              : Boolean(localMatch?.concluida);

          const taxaAcerto = s.taxa_acerto ?? s.taxaAcerto ?? localMatch?.taxaAcerto;
          const acertos = s.acertos ?? localMatch?.acertos;
          const erros = s.erros ?? localMatch?.erros;
          const codigoUpper = String(s.codigo || '').toUpperCase();
          const tipo =
            s.tipo ||
            localMatch?.tipo ||
            (codigoUpper.startsWith('SIM-')
              ? 'simulado'
              : codigoUpper.startsWith('PRV-') || codigoUpper.startsWith('FAFIPA-') || codigoUpper.startsWith('PROVA-')
              ? 'prova_anterior'
              : codigoUpper.startsWith('LOTE-')
              ? 'sessao_escala'
              : 'sessao');

          const parseArraySeguro = (val: any) => {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string') {
              try {
                const p = JSON.parse(val);
                if (Array.isArray(p)) return p;
              } catch {}
            }
            return undefined;
          };

          const questaoIdsParsed =
            parseArraySeguro(s.questao_ids) ||
            parseArraySeguro(s.questaoIds) ||
            localMatch?.questaoIds ||
            [];

          const questoesSnapParsed =
            parseArraySeguro(s.questoes_snap) ||
            parseArraySeguro(s.questoesSnap) ||
            localMatch?.questoesSnap;

          return {
            id: s.id,
            user_email: s.user_email || currentEmail,
            codigo: s.codigo,
            dataHora: s.data_hora || s.dataHora,
            banca: s.banca,
            cargo: s.cargo || '',
            disciplina: s.disciplina,
            assunto: s.assunto,
            quantidade: s.quantidade,
            tipo,
            questaoIds: questaoIdsParsed,
            tempoSegundos: Number(tempo) || 0,
            concluida,
            taxaAcerto: typeof taxaAcerto === 'number' ? taxaAcerto : undefined,
            acertos: typeof acertos === 'number' ? acertos : undefined,
            erros: typeof erros === 'number' ? erros : undefined,
            questoesSnap: questoesSnapParsed,
            created_at: s.created_at,
          };
        });

        // Merge defensivo: preserva qualquer sessão local que ainda não conste no resultado da nuvem
        const idSet = new Set(parsed.map((s) => String(s.id)));
        const codSet = new Set(parsed.map((s) => String(s.codigo || '').toLowerCase()));
        let rawLocal: SessaoCriada[] = [];
        try {
          rawLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSOES) || '[]');
        } catch {}

        const sessoesLocaisPendentes = rawLocal.filter((ls) => {
          const temId = ls.id !== undefined && ls.id !== null && idSet.has(String(ls.id));
          const temCod = ls.codigo && codSet.has(String(ls.codigo).toLowerCase());
          return !temId && !temCod;
        });

        // Garantir que as sessões de Provas Reais FAFIPA (iniciais e customizadas salvas) estejam incluídas
        const todasProvasOficiais = [
          ...SESSOES_PROVAS_FAFIPA_INICIAIS,
          ...obterSessoesProvasAnterioresOficiais(),
          ...carregarProvasCustomizadasLocalStorage().sessoes,
        ];

        todasProvasOficiais.forEach((prv) => {
          const cod = String(prv.codigo).toLowerCase();
          const jaExiste = codSet.has(cod) || sessoesLocaisPendentes.some((s) => String(s.codigo || '').toLowerCase() === cod);
          if (!jaExiste) {
            sessoesLocaisPendentes.push({
              ...prv,
              tipo: 'prova_anterior',
              user_email: currentEmail,
            });
            codSet.add(cod);
          }
        });

        const listaCompleta = [...parsed, ...sessoesLocaisPendentes];

        // Atualiza cache local mesclado
        try {
          localStorage.setItem(STORAGE_KEYS.SESSOES, JSON.stringify(listaCompleta));
        } catch {}

        return listaCompleta;
      }
    } catch (e) {
      console.warn('Erro ao carregar sessões do Supabase, usando local:', e);
    }
  }

  try {
    const raw: SessaoCriada[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSOES) || '[]');
    const filtered = raw.filter((s) => {
      const email = (s.user_email || '').toLowerCase();
      if (isAdm) return !email || email === currentEmail || email === 'undefined';
      return email === currentEmail;
    });
    const codSet = new Set(filtered.map((s) => String(s.codigo || '').toLowerCase()));
    const todasProvasOficiais = [
      ...SESSOES_PROVAS_FAFIPA_INICIAIS,
      ...obterSessoesProvasAnterioresOficiais(),
      ...carregarProvasCustomizadasLocalStorage().sessoes,
    ];
    const faltantes = todasProvasOficiais.filter((s) => !codSet.has(String(s.codigo || '').toLowerCase()));
    return [...filtered, ...faltantes];
  } catch {
    return [
      ...SESSOES_PROVAS_FAFIPA_INICIAIS,
      ...obterSessoesProvasAnterioresOficiais(),
      ...carregarProvasCustomizadasLocalStorage().sessoes,
    ];
  }
}

export async function salvarSessaoDb(sessao: SessaoCriada): Promise<SessaoCriada> {
  notificarEnvioCloud({ status: 'syncing', message: 'Enviando sessão para a nuvem...' });
  const client = getSupabaseClient();
  const currentEmail = getActiveEmail();
  const sessaoObj = { ...sessao, user_email: currentEmail };

  if (client) {
    try {
      const payload: Record<string, any> = {
        user_email: currentEmail,
        codigo: sessao.codigo,
        data_hora: sessao.dataHora,
        banca: sessao.banca,
        disciplina: sessao.disciplina,
        assunto: sessao.assunto,
        quantidade: sessao.quantidade,
        questao_ids: sessao.questaoIds,
      };
      if (sessao.cargo) payload.cargo = sessao.cargo;
      if (sessao.tipo) payload.tipo = sessao.tipo;
      if (sessao.tempoSegundos !== undefined) payload.tempo_segundos = sessao.tempoSegundos;
      if (sessao.concluida !== undefined) payload.concluida = sessao.concluida;
      if (sessao.taxaAcerto !== undefined) payload.taxa_acerto = sessao.taxaAcerto;
      if (sessao.acertos !== undefined) payload.acertos = sessao.acertos;
      if (sessao.erros !== undefined) payload.erros = sessao.erros;
      if (sessao.questoesSnap && sessao.questoesSnap.length > 0) {
        payload.questoes_snap = sessao.questoesSnap;
      }

      let { data, error } = await client.from('sessoes').insert(payload).select().single();
      if (
        error &&
        (error.code === '42703' ||
          error.message?.includes('user_email') ||
          error.message?.includes('cargo') ||
          error.message?.includes('tipo') ||
          error.message?.includes('tempo') ||
          error.message?.includes('concluida') ||
          error.message?.includes('taxa') ||
          error.message?.includes('questoes_snap'))
      ) {
        const {
          user_email,
          cargo,
          tipo,
          tempo_segundos,
          concluida,
          taxa_acerto,
          acertos,
          erros,
          questoes_snap,
          ...rest
        } = payload;
        const retry = await client.from('sessoes').insert(rest).select().single();
        if (!retry.error && retry.data) {
          data = retry.data;
          error = null;
        }
      }

      if (!error && data) {
        sessaoObj.id = data.id;
        sessaoObj.created_at = data.created_at;
      }
    } catch (e) {
      console.warn('Erro ao salvar sessão no Supabase, mantendo localmente:', e);
    }
  }

  if (!sessaoObj.id) {
    sessaoObj.id = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  try {
    const current: SessaoCriada[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSOES) || '[]');
    const idx = current.findIndex(
      (s) =>
        (s.id !== undefined && sessaoObj.id !== undefined && String(s.id) === String(sessaoObj.id)) ||
        (s.codigo && sessaoObj.codigo && s.codigo === sessaoObj.codigo)
    );
    if (idx >= 0) {
      current[idx] = sessaoObj;
    } else {
      current.unshift(sessaoObj);
    }
    localStorage.setItem(STORAGE_KEYS.SESSOES, JSON.stringify(current));
  } catch {}

  notificarEnvioCloud({ status: 'saved', message: 'Dados enviados' });
  return sessaoObj;
}

export async function excluirSessaoDb(id: number | string): Promise<void> {
  notificarEnvioCloud({ status: 'syncing', message: 'Excluindo da nuvem...' });
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('sessoes').delete().eq('id', id);
    } catch (e) {
      console.warn('Erro ao excluir sessão do Supabase:', e);
    }
  }

  try {
    const current: SessaoCriada[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSOES) || '[]');
    const filtered = current.filter((s) => String(s.id) !== String(id));
    localStorage.setItem(STORAGE_KEYS.SESSOES, JSON.stringify(filtered));
  } catch {}

  notificarEnvioCloud({ status: 'saved', message: 'Dados enviados' });
}

/**
 * Purga completa de todos os simulados de teste, suas questões geradas e tentativas de resposta associadas.
 */
export async function purgarSimuladosTesteDb(): Promise<{
  sessoesRemovidas: number;
  questoesRemovidas: number;
}> {
  notificarEnvioCloud({ status: 'syncing', message: 'Purgando simulados de teste...' });
  const client = getSupabaseClient();
  let sessoesRemovidas = 0;
  let questoesRemovidas = 0;

  try {
    // Identifica apenas simulados legados de teste, NUNCA simulados oficiais (SIM-CTBA-)
    const sessoesLocal: SessaoCriada[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSOES) || '[]');
    const simulados = sessoesLocal.filter((s) => {
      const cod = String(s.codigo || '').toUpperCase();
      const ass = String(s.assunto || '').toLowerCase();
      if (cod.startsWith('SIM-CTBA-') || ass.includes('oficial')) return false;
      return cod.startsWith('SIM-TESTE-') || ass.includes('simulado de teste');
    });

    const questaoIdsParaRemover = new Set<string | number>();
    simulados.forEach((s) => {
      (s.questaoIds || []).forEach((id) => questaoIdsParaRemover.add(id));
    });

    sessoesRemovidas = simulados.length;
    questoesRemovidas = questaoIdsParaRemover.size;

    // Remove sessões de simulado do localStorage
    const sessoesRestantes = sessoesLocal.filter((s) => !simulados.includes(s));
    localStorage.setItem(STORAGE_KEYS.SESSOES, JSON.stringify(sessoesRestantes));

    // Remove questões geradas do localStorage
    const questoesLocal: Questao[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTOES) || '[]');
    const questoesRestantes = questoesLocal.filter((q) => !questaoIdsParaRemover.has(q.id));
    localStorage.setItem(STORAGE_KEYS.QUESTOES, JSON.stringify(questoesRestantes));

    // Remove registros de tempo de simulados
    const tempoLocal: RegistroTempoSessao[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEMPO_SESSOES) || '[]');
    const tempoRestantes = tempoLocal.filter((t) => {
      const c = String(t.codigo || '').toUpperCase();
      return !c.startsWith('SIM-') && !c.includes('SIMULADO');
    });
    localStorage.setItem(STORAGE_KEYS.TEMPO_SESSOES, JSON.stringify(tempoRestantes));

    // Remove histórico de respostas dessas questões
    const historicoLocal: HistoricoRespostasMap = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORICO) || '{}');
    questaoIdsParaRemover.forEach((qid) => {
      delete historicoLocal[qid];
    });
    localStorage.setItem(STORAGE_KEYS.HISTORICO, JSON.stringify(historicoLocal));

    // 2. Se houver client Supabase, purga na nuvem também
    if (client) {
      for (const sim of simulados) {
        if (sim.id) {
          await client.from('sessoes').delete().eq('id', sim.id);
        }
      }
      for (const qid of questaoIdsParaRemover) {
        await client.from('questoes').delete().eq('id', qid);
        await client.from('historico_respostas').delete().eq('questao_id', qid);
      }
    }
  } catch (err) {
    console.warn('Aviso durante purga de simulados:', err);
  }

  notificarEnvioCloud({ status: 'saved', message: 'Simulados de teste purgados' });
  return { sessoesRemovidas, questoesRemovidas };
}

/**
 * Purga cirúrgica das sessões de escala S09 a S20 (geradas em fallback) e suas respectivas questões.
 * Protege 100% as sessões LOTE-500-S01 a LOTE-500-S08 e demais sessões/simulados do usuário.
 */
export async function purgarSessoesEscalaS09aS20Db(): Promise<{
  sessoesRemovidas: number;
  questoesRemovidas: number;
}> {
  notificarEnvioCloud({ status: 'syncing', message: 'Limpando sessões 09 a 20 do fallback...' });
  const client = getSupabaseClient();
  let sessoesRemovidas = 0;
  let questoesRemovidas = 0;

  try {
    const codigosAlvo = new Set<string>();
    for (let i = 9; i <= 20; i++) {
      codigosAlvo.add(`LOTE-500-S${String(i).padStart(2, '0')}`.toUpperCase());
    }

    const sessoesLocal: SessaoCriada[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSOES) || '[]');
    const sessoesParaRemover = sessoesLocal.filter((s) => {
      const cod = String(s.codigo || '').toUpperCase();
      return codigosAlvo.has(cod);
    });

    const questaoIdsParaRemover = new Set<string | number>();
    sessoesParaRemover.forEach((s) => {
      (s.questaoIds || []).forEach((id) => questaoIdsParaRemover.add(id));
    });

    // Identifica também questões salvas com o prefixo 'lote500_s09' a 'lote500_s20' caso existam
    const questoesLocal: Questao[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTOES) || '[]');
    questoesLocal.forEach((q) => {
      const idStr = String(q.id || '').toLowerCase();
      for (let i = 9; i <= 20; i++) {
        if (idStr.startsWith(`lote500_s${String(i).padStart(2, '0')}`)) {
          questaoIdsParaRemover.add(q.id);
        }
      }
    });

    sessoesRemovidas = sessoesParaRemover.length;
    questoesRemovidas = questaoIdsParaRemover.size;

    // Remove do localStorage
    const sessoesRestantes = sessoesLocal.filter((s) => !sessoesParaRemover.includes(s));
    localStorage.setItem(STORAGE_KEYS.SESSOES, JSON.stringify(sessoesRestantes));

    const questoesRestantes = questoesLocal.filter((q) => !questaoIdsParaRemover.has(q.id));
    localStorage.setItem(STORAGE_KEYS.QUESTOES, JSON.stringify(questoesRestantes));

    const tempoLocal: RegistroTempoSessao[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEMPO_SESSOES) || '[]');
    const tempoRestantes = tempoLocal.filter((t) => {
      const c = String(t.codigo || '').toUpperCase();
      return !codigosAlvo.has(c);
    });
    localStorage.setItem(STORAGE_KEYS.TEMPO_SESSOES, JSON.stringify(tempoRestantes));

    const historicoLocal: HistoricoRespostasMap = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORICO) || '{}');
    questaoIdsParaRemover.forEach((qid) => {
      delete historicoLocal[qid];
    });
    localStorage.setItem(STORAGE_KEYS.HISTORICO, JSON.stringify(historicoLocal));

    // Remove do Supabase
    if (client) {
      for (const s of sessoesParaRemover) {
        if (s.id) {
          await client.from('sessoes').delete().eq('id', s.id);
        }
        if (s.codigo) {
          await client.from('sessoes').delete().eq('codigo', s.codigo);
        }
      }
      for (const qid of questaoIdsParaRemover) {
        await client.from('questoes').delete().eq('id', qid);
        await client.from('historico_respostas').delete().eq('questao_id', qid);
      }
    }
  } catch (err) {
    console.warn('Aviso durante purga de sessões 09 a 20:', err);
  }

  notificarEnvioCloud({ status: 'saved', message: 'Sessões 09 a 20 purgadas com sucesso' });
  return { sessoesRemovidas, questoesRemovidas };
}

/**
 * Executa higienização e deduplicação profunda de todas as questões do banco (Supabase + localStorage).
 * - Identifica réplicas pelo enunciado normalizado
 * - PRESERVA 100% dos dados de histórico (acertos, erros, tentativas) transferindo tentativas para a questão canônica
 * - Remapeia os questionIds e snapshots nas sessões para o ID canônico
 * - Deleta cópias excedentes do Supabase em lotes seguros
 * - Retorna métricas precisas da higienização
 */
export async function deduplicarQuestoesDb(): Promise<{
  totalAntes: number;
  totalDepois: number;
  duplicatasRemovidas: number;
  provasAnterioresUnicas: number;
  questoesPreservadasComHistorico: number;
}> {
  notificarEnvioCloud({ status: 'syncing', message: 'Deduplicando e higienizando banco...' });
  const client = getSupabaseClient();
  const currentEmail = getActiveEmail();
  const isAdm = isAdminEmail(currentEmail);

  let rawQuestoes: Questao[] = [];
  try {
    rawQuestoes = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTOES) || '[]');
  } catch {}

  // Se Supabase estiver disponível, busca a lista completa da nuvem para garantir paridade total
  if (client) {
    try {
      const { data } = await fetchAllRowsPaginated<any>(async (from, to) => {
        let q = client.from('questoes').select('*').order('id', { ascending: true }).range(from, to);
        if (isAdm) {
          q = q.or(`user_email.eq.${currentEmail},user_email.is.null,user_email.eq.,user_email.eq.undefined`);
        } else {
          q = q.eq('user_email', currentEmail);
        }
        return await q;
      });
      if (data && data.length > 0) {
        const fromCloud: Questao[] = data.map((row: any) => ({
          id: row.id,
          user_email: row.user_email || currentEmail,
          banca: row.banca,
          cargo: row.cargo || '',
          disciplina: row.disciplina,
          assunto: row.assunto,
          artigo: row.artigo,
          enunciado: row.enunciado,
          alternativas: Array.isArray(row.alternativas) ? row.alternativas : JSON.parse(row.alternativas || '[]'),
          correta: typeof row.correta === 'number' ? row.correta : parseInt(row.correta, 10) || 0,
          comentario: row.comentario,
          created_at: row.created_at,
        }));

        const cloudIds = new Set(fromCloud.map((c) => String(c.id)));
        const pendentes = rawQuestoes.filter((lq) => !cloudIds.has(String(lq.id)));
        rawQuestoes = [...fromCloud, ...pendentes];
      }
    } catch (e) {
      console.warn('Erro ao carregar questões para deduplicação no Supabase:', e);
    }
  }

  const totalAntes = rawQuestoes.length;

  // Carrega histórico e sessões
  let historico: HistoricoRespostasMap = {};
  try {
    historico = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORICO) || '{}');
  } catch {}

  let sessoes: SessaoCriada[] = [];
  try {
    sessoes = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSOES) || '[]');
  } catch {}

  // Agrupa questões por enunciado normalizado
  const grupos = new Map<string, Questao[]>();
  rawQuestoes.forEach((q) => {
    const key = normalizarEnunciadoParaDeduplicacao(q.enunciado) || `id_${q.id}`;
    const list = grupos.get(key) || [];
    list.push(q);
    grupos.set(key, list);
  });

  const questoesCanonica: Questao[] = [];
  const idMapRemapeamento = new Map<string | number, string | number>();
  const idsParaDeletarNuvem: (string | number)[] = [];
  let questoesPreservadasComHistorico = 0;

  grupos.forEach((itens) => {
    if (itens.length === 1) {
      questoesCanonica.push(itens[0]);
      if ((historico[String(itens[0].id)] || []).length > 0) {
        questoesPreservadasComHistorico++;
      }
      return;
    }

    // Há duplicatas! Seleciona a melhor questão para ser canônica
    let canonical = itens[0];
    let maxTentativas = (historico[String(canonical.id)] || []).length;

    for (let i = 1; i < itens.length; i++) {
      const q = itens[i];
      const tentCount = (historico[String(q.id)] || []).length;
      const isStaticId = String(q.id).toLowerCase().startsWith('fafipa_') || String(q.id).toLowerCase().startsWith('prv_');
      const canonicalIsStatic = String(canonical.id).toLowerCase().startsWith('fafipa_') || String(canonical.id).toLowerCase().startsWith('prv_');

      if (tentCount > maxTentativas) {
        canonical = q;
        maxTentativas = tentCount;
      } else if (tentCount === maxTentativas) {
        if (isStaticId && !canonicalIsStatic) {
          canonical = q;
        }
      }
    }

    questoesCanonica.push(canonical);

    // Registra remapeamento e consolida histórico
    const canonicalKey = String(canonical.id);
    const historicoCanonico = historico[canonicalKey] || [];

    itens.forEach((q) => {
      if (String(q.id) !== String(canonical.id)) {
        idMapRemapeamento.set(q.id, canonical.id);
        idMapRemapeamento.set(String(q.id), canonical.id);
        idsParaDeletarNuvem.push(q.id);

        // Consolida histórico se o duplicado também tinha tentativas
        const histDup = historico[String(q.id)];
        if (Array.isArray(histDup) && histDup.length > 0) {
          histDup.forEach((t) => {
            historicoCanonico.push({
              ...t,
              questaoId: canonical.id,
            });
          });
          delete historico[String(q.id)];
        }
      }
    });

    if (historicoCanonico.length > 0) {
      historico[canonicalKey] = historicoCanonico;
      questoesPreservadasComHistorico++;
    }
  });

  // Atualiza sessões: remapeia questaoIds para o ID canônico e remove duplicatas dentro da sessão
  let sessoesModificadas = false;
  const sessoesAtualizadas = sessoes.map((s) => {
    let mudou = false;
    const novosIds: (string | number)[] = [];
    const seenIds = new Set<string>();

    (s.questaoIds || []).forEach((id) => {
      const remapeado = idMapRemapeamento.get(id) || id;
      if (remapeado !== id) mudou = true;
      const key = String(remapeado);
      if (!seenIds.has(key)) {
        seenIds.add(key);
        novosIds.push(remapeado);
      } else {
        mudou = true;
      }
    });

    if (mudou) {
      sessoesModificadas = true;
      return {
        ...s,
        questaoIds: novosIds,
        quantidade: novosIds.length,
      };
    }
    return s;
  });

  // Salva no localStorage
  localStorage.setItem(STORAGE_KEYS.QUESTOES, JSON.stringify(questoesCanonica));
  localStorage.setItem(STORAGE_KEYS.HISTORICO, JSON.stringify(historico));
  if (sessoesModificadas) {
    localStorage.setItem(STORAGE_KEYS.SESSOES, JSON.stringify(sessoesAtualizadas));
  }

  // Deleta duplicatas do Supabase se conectado
  if (client && idsParaDeletarNuvem.length > 0) {
    try {
      for (let i = 0; i < idsParaDeletarNuvem.length; i += 100) {
        const batch = idsParaDeletarNuvem.slice(i, i + 100);
        await client.from('questoes').delete().in('id', batch);
      }
      if (sessoesModificadas) {
        for (const s of sessoesAtualizadas) {
          if (s.id) {
            await client.from('sessoes').update({
              questao_ids: s.questaoIds,
              quantidade: s.quantidade,
            }).eq('id', s.id);
          }
        }
      }
    } catch (err) {
      console.warn('Erro ao sincronizar deduplicação no Supabase:', err);
    }
  }

  // Conta quantas provas anteriores únicas restaram
  const provasAnterioresUnicas = questoesCanonica.filter((q) => {
    const b = String(q.banca || '').toLowerCase();
    const idStr = String(q.id || '').toLowerCase();
    const dis = String(q.disciplina || '').toLowerCase();
    const ass = String(q.assunto || '').toLowerCase();
    return (
      b.includes('prova real') ||
      idStr.startsWith('fafipa_') ||
      idStr.startsWith('prv_') ||
      dis.includes('paranaeduca') ||
      dis.includes('sesa') ||
      ass.includes('paranaeduca') ||
      ass.includes('sesa')
    );
  }).length;

  const totalDepois = questoesCanonica.length;
  const duplicatasRemovidas = totalAntes - totalDepois;

  notificarEnvioCloud({ status: 'saved', message: `${duplicatasRemovidas} duplicatas eliminadas` });

  return {
    totalAntes,
    totalDepois,
    duplicatasRemovidas,
    provasAnterioresUnicas,
    questoesPreservadasComHistorico,
  };
}

export async function atualizarSessaoDb(id: number | string, dados: Partial<SessaoCriada>): Promise<void> {
  notificarEnvioCloud({ status: 'syncing', message: 'Atualizando na nuvem...' });
  const client = getSupabaseClient();
  if (client) {
    try {
      const payload: Record<string, any> = {};
      if (dados.codigo !== undefined) payload.codigo = dados.codigo;
      if (dados.banca !== undefined) payload.banca = dados.banca;
      if (dados.cargo !== undefined) payload.cargo = dados.cargo;
      if (dados.disciplina !== undefined) payload.disciplina = dados.disciplina;
      if (dados.assunto !== undefined) payload.assunto = dados.assunto;
      if (dados.quantidade !== undefined) payload.quantidade = dados.quantidade;
      if (dados.questaoIds !== undefined) payload.questao_ids = dados.questaoIds;
      if (dados.tempoSegundos !== undefined) payload.tempo_segundos = dados.tempoSegundos;
      if (dados.concluida !== undefined) payload.concluida = dados.concluida;
      if (dados.taxaAcerto !== undefined) payload.taxa_acerto = dados.taxaAcerto;
      if (dados.acertos !== undefined) payload.acertos = dados.acertos;
      if (dados.erros !== undefined) payload.erros = dados.erros;

      let { error } = await client.from('sessoes').update(payload).eq('id', id);
      if (
        error &&
        (error.code === '42703' ||
          error.message?.includes('tempo') ||
          error.message?.includes('concluida') ||
          error.message?.includes('taxa'))
      ) {
        const { tempo_segundos, concluida, taxa_acerto, acertos, erros, ...fallbackPayload } = payload;
        if (Object.keys(fallbackPayload).length > 0) {
          await client.from('sessoes').update(fallbackPayload).eq('id', id);
        }
      }
    } catch (e) {
      console.warn('Erro ao atualizar sessão no Supabase:', e);
    }
  }

  try {
    const current: SessaoCriada[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSOES) || '[]');
    const updated = current.map((s) => (String(s.id) === String(id) ? { ...s, ...dados } : s));
    localStorage.setItem(STORAGE_KEYS.SESSOES, JSON.stringify(updated));
  } catch {}

  notificarEnvioCloud({ status: 'saved', message: 'Dados enviados' });
}

// ----------------------------------------------------
// HISTORICO DE RESPOSTAS CRUD
// ----------------------------------------------------
export async function carregarHistorico(): Promise<HistoricoRespostasMap> {
  const currentEmail = getActiveEmail();
  const isAdm = isAdminEmail(currentEmail);
  const client = getSupabaseClient();

  let localHist: HistoricoRespostasMap = {};
  try {
    localHist = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORICO) || '{}');
  } catch {}

  if (client) {
    try {
      const fetchWithFilter = async (useEmailFilter: boolean) => {
        return await fetchAllRowsPaginated<any>(async (from, to) => {
          let query = client
            .from('historico_respostas')
            .select('*')
            .order('data', { ascending: true })
            .range(from, to);

          if (useEmailFilter) {
            if (isAdm) {
              query = query.or(`user_email.eq.${currentEmail},user_email.is.null,user_email.eq.,user_email.eq.undefined`);
            } else {
              query = query.eq('user_email', currentEmail);
            }
          }
          return await query;
        });
      };

      let { data, error } = await fetchWithFilter(Boolean(currentEmail && !isAdm));
      if (error || !data || data.length === 0) {
        const retryResult = await fetchWithFilter(false);
        if (!retryResult.error && retryResult.data && retryResult.data.length > 0) {
          data = retryResult.data;
          error = null;
        }
      }

      if (!error && data) {
        // Mapa determinístico multidimensional: Canônico, Hash 32-bit, Regex \D e Snapshots de Sessões
        const hashToCanonicalMap = new Map<string, string>();
        const legacyRegexMap = new Map<string, string>();

        try {
          const qLocais: Questao[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTOES) || '[]');
          const customProvas = carregarProvasCustomizadasLocalStorage();
          const todasProvasOficiais = obterQuestoesProvasAnterioresOficiais();
          const todasQuestoes = [...qLocais, ...customProvas.questoes, ...todasProvasOficiais];

          todasQuestoes.forEach((q) => {
            if (q && q.id != null) {
              const strId = String(q.id).trim();
              hashToCanonicalMap.set(strId, strId);
              const hashedNum = String(hashStringTo32BitInt(strId));
              if (!hashToCanonicalMap.has(hashedNum)) {
                hashToCanonicalMap.set(hashedNum, strId);
              }
              const legacyNum = String(parseInt(strId.replace(/\D/g, ''), 10) || '');
              if (legacyNum && !legacyRegexMap.has(legacyNum)) {
                legacyRegexMap.set(legacyNum, strId);
              }
            }
          });

          // Mapeamento extra através dos Snapshots das Sessões de Estudo salvas
          const sessoesLocais: SessaoCriada[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSOES) || '[]');
          sessoesLocais.forEach((s) => {
            if (Array.isArray(s.questoesSnap) && Array.isArray(s.questaoIds)) {
              s.questaoIds.forEach((qId, idx) => {
                const snapQ = s.questoesSnap?.[idx];
                if (qId != null && snapQ && snapQ.id != null) {
                  const canon = String(snapQ.id).trim();
                  const qIdStr = String(qId).trim();
                  hashToCanonicalMap.set(qIdStr, canon);
                  const legNum = String(parseInt(qIdStr.replace(/\D/g, ''), 10) || '');
                  if (legNum && !legacyRegexMap.has(legNum)) {
                    legacyRegexMap.set(legNum, canon);
                  }
                }
              });
            }
          });
        } catch {}

        const map: HistoricoRespostasMap = { ...localHist };

        data.forEach((row: any) => {
          const rawStrId = row.questao_id_str ? String(row.questao_id_str).trim() : '';
          const rawNumId = row.questao_id != null ? String(row.questao_id) : '';

          const canonicalQId =
            (rawStrId && hashToCanonicalMap.get(rawStrId)) ||
            (rawNumId && hashToCanonicalMap.get(rawNumId)) ||
            (rawNumId && legacyRegexMap.get(rawNumId)) ||
            (rawStrId && legacyRegexMap.get(rawStrId)) ||
            rawStrId ||
            rawNumId;

          if (!canonicalQId) return;

          const tentativa: TentativaResposta = {
            id: row.id,
            user_email: row.user_email || currentEmail,
            questaoId: canonicalQId,
            escolha: row.escolha,
            acertou: row.acertou,
            data: typeof row.data === 'number' ? row.data : parseInt(row.data, 10),
            created_at: row.created_at,
            tempoSegundos: row.tempo_segundos || row.tempoSegundos || undefined,
            origem: row.origem || undefined,
          };

          if (!map[canonicalQId]) map[canonicalQId] = [];
          const jaExiste = map[canonicalQId].some(
            (t) => t.data === tentativa.data && t.escolha === tentativa.escolha
          );
          if (!jaExiste) {
            map[canonicalQId].push(tentativa);
          }
        });

        // Atualiza cache local com o histórico completo sincronizado
        try {
          localStorage.setItem(STORAGE_KEYS.HISTORICO, JSON.stringify(map));
        } catch {}

        return map;
      }
    } catch (e) {
      console.warn('Erro ao carregar histórico do Supabase, usando local:', e);
    }
  }

  return localHist;
}

// Trava de concorrência e debounce em memória para impedir duplicações na raiz (cliques duplos / retries)
const travaTentativasEmVoo = new Set<string>();
const ultimaTentativaRegistradaPorQuestao = new Map<string, { escolha: number; data: number }>();

export async function salvarTentativaDb(
  questaoId: number | string,
  tentativa: {
    escolha: number;
    acertou: boolean;
    data: number;
    tempoSegundos?: number;
    origem?: 'caderno' | 'banco' | 'sessao' | 'simulado';
  }
): Promise<void> {
  const qKey = String(questaoId).trim();
  const currentEmail = getActiveEmail();
  const lockKey = `${currentEmail}_${qKey}`;
  const now = tentativa.data || Date.now();

  // 1. Trava contra duplo clique ou execução paralela simultânea
  if (travaTentativasEmVoo.has(lockKey)) {
    return;
  }

  // 2. Trava de debounce de 5 segundos contra inserções idênticas na mesma janela de tempo
  const ultimoRegistro = ultimaTentativaRegistradaPorQuestao.get(lockKey);
  if (ultimoRegistro) {
    const diffMs = Math.abs(now - ultimoRegistro.data);
    if (diffMs < 5000 && ultimoRegistro.escolha === tentativa.escolha) {
      // Mesma resposta na janela de 5 segundos: ignora duplicata defensivamente
      return;
    }
  }

  travaTentativasEmVoo.add(lockKey);
  ultimaTentativaRegistradaPorQuestao.set(lockKey, { escolha: tentativa.escolha, data: now });

  try {
    notificarEnvioCloud({ status: 'syncing', message: 'Enviando resposta para a nuvem...' });
    const client = getSupabaseClient();
    const qIdNum = hashStringTo32BitInt(questaoId);

    if (client) {
      try {
        const payload: Record<string, any> = {
          user_email: currentEmail,
          questao_id: qIdNum,
          questao_id_str: qKey,
          escolha: tentativa.escolha,
          acertou: tentativa.acertou,
          data: now,
        };
        if (tentativa.origem) payload.origem = tentativa.origem;
        if (tentativa.tempoSegundos) payload.tempo_segundos = tentativa.tempoSegundos;

        const { error } = await client.from('historico_respostas').insert(payload);
        if (
          error &&
          (error.code === '42703' ||
            error.message?.includes('questao_id_str') ||
            error.message?.includes('user_email') ||
            error.message?.includes('origem') ||
            error.message?.includes('tempo_segundos'))
        ) {
          const { questao_id_str, ...fallbackPayload } = payload;
          const fallbackRes = await client.from('historico_respostas').insert(fallbackPayload);
          if (fallbackRes.error) {
            await client.from('historico_respostas').insert({
              questao_id: qIdNum,
              escolha: tentativa.escolha,
              acertou: tentativa.acertou,
              data: now,
            });
          }
        }
      } catch (e) {
        console.warn('Erro ao registrar resposta no Supabase:', e);
      }
    }

    // Update localStorage com desduplicação rigorosa
    try {
      const current: HistoricoRespostasMap = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORICO) || '{}');
      if (!current[qKey]) current[qKey] = [];

      // Verifica se já não existe registro idêntico nos últimos 5 segundos
      const jaExisteRecente = current[qKey].some(
        (t) => t.escolha === tentativa.escolha && Math.abs((t.data || 0) - now) < 5000
      );

      if (!jaExisteRecente) {
        current[qKey].push({
          user_email: currentEmail,
          questaoId,
          escolha: tentativa.escolha,
          acertou: tentativa.acertou,
          data: now,
          tempoSegundos: tentativa.tempoSegundos,
          origem: tentativa.origem,
        });
        localStorage.setItem(STORAGE_KEYS.HISTORICO, JSON.stringify(current));
      }
    } catch {}

    notificarEnvioCloud({ status: 'saved', message: 'Dados enviados' });
  } finally {
    // Libera a trava após 600ms para permitir novas respostas deliberadas
    setTimeout(() => {
      travaTentativasEmVoo.delete(lockKey);
    }, 600);
  }
}

/**
 * Realiza o Hard Reset seletivo de histórico de respostas e sessões corrompidas,
 * preservando 100% INTACTO o acervo de 2.000 questões, bancas, blocos e matérias.
 */
export async function executarHardResetHistoricoESessoes(): Promise<{
  success: boolean;
  message: string;
  questoesPreservadas: number;
}> {
  notificarEnvioCloud({ status: 'syncing', message: 'Executando Hard Reset de histórico e sessões...' });
  const client = getSupabaseClient();
  const currentEmail = getActiveEmail();
  const isAdm = isAdminEmail(currentEmail);

  // 1. Apaga do Supabase APENAS as tabelas de histórico e sessões (NÃO toca na tabela questoes)
  if (client) {
    try {
      if (isAdm) {
        await Promise.allSettled([
          client.from('historico_respostas').delete().not('id', 'is', null),
          client.from('historico_respostas').delete().neq('id', 0),
          client.from('sessoes').delete().not('id', 'is', null),
          client.from('sessoes').delete().neq('id', 0),
        ]);
      } else {
        await Promise.allSettled([
          client.from('historico_respostas').delete().eq('user_email', currentEmail),
          client.from('historico_respostas').delete().or(`user_email.eq.${currentEmail},user_email.is.null,user_email.eq.`),
          client.from('sessoes').delete().eq('user_email', currentEmail),
          client.from('sessoes').delete().or(`user_email.eq.${currentEmail},user_email.is.null,user_email.eq.`),
        ]);
      }
    } catch (e) {
      console.warn('Aviso ao limpar histórico/sessões no Supabase:', e);
    }
  }

  // 2. Limpa do localStorage APENAS histórico e sessões, mantendo o acervo de questões 100% preservado
  let questoesPreservadas = 0;
  try {
    const questoesAtuais = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTOES) || '[]');
    questoesPreservadas = questoesAtuais.length;

    localStorage.removeItem(STORAGE_KEYS.HISTORICO);
    localStorage.removeItem(STORAGE_KEYS.SESSOES);
    localStorage.removeItem(STORAGE_KEYS.TEMPO_SESSOES);
    localStorage.removeItem('gb_sessoescriadas');
    localStorage.removeItem('gb_sessoes');
    localStorage.removeItem('gb_sessoes_estudo');
    localStorage.removeItem('gb_provas_customizadas_acervo');
    localStorage.removeItem('gb_questoes_simulados_ids');
    localStorage.removeItem('gb_questoes_escala_ids');
    localStorage.removeItem('gb_questoes_provas_anteriores_ids');
    localStorage.removeItem('gb_last_answered_time');
    localStorage.removeItem('gb_respostas_temp');
    localStorage.setItem(STORAGE_KEYS.SESSOES, '[]');
    localStorage.setItem(STORAGE_KEYS.HISTORICO, '{}');
    localStorage.setItem(STORAGE_KEYS.TEMPO_SESSOES, '[]');
  } catch {}

  // 3. Limpa mapa em memória de travas
  travaTentativasEmVoo.clear();
  ultimaTentativaRegistradaPorQuestao.clear();

  notificarEnvioCloud({ status: 'saved', message: 'Histórico resetado (Questões preservadas)' });
  return {
    success: true,
    message: `Hard Reset concluído com sucesso! Histórico e sessões corrompidas foram limpos. O acervo de ${questoesPreservadas} questões permaneceu 100% intacto e protegido.`,
    questoesPreservadas,
  };
}

/**
 * Detecta se existem vestígios de sessões antigas ou histórico corrompido que necessitem de purga automática.
 */
export function detectarHistoricoOuSessoesCorrompidas(): boolean {
  try {
    // Se o marcador definitivo v3 ainda não existe, requer inicialização limpa
    if (!localStorage.getItem('gb_clean_reset_v3_auto')) {
      return true;
    }

    const rawSessoes = localStorage.getItem(STORAGE_KEYS.SESSOES);
    if (rawSessoes) {
      const sessoes = JSON.parse(rawSessoes);
      if (Array.isArray(sessoes) && sessoes.length > 0) {
        const temSessaoCorrompida = sessoes.some(
          (s: any) => !s.id || (!Array.isArray(s.questaoIds) && !Array.isArray(s.questoesSnap))
        );
        if (temSessaoCorrompida) return true;
      }
    }

    const rawHistorico = localStorage.getItem(STORAGE_KEYS.HISTORICO);
    if (rawHistorico) {
      const hist = JSON.parse(rawHistorico);
      for (const qid of Object.keys(hist)) {
        const tentativas = hist[qid];
        if (Array.isArray(tentativas) && tentativas.length > 1) {
          const timestamps = tentativas.map((t: any) => t.timestamp || t.dataHora).filter(Boolean);
          const uniqueTimestamps = new Set(timestamps);
          if (uniqueTimestamps.size < timestamps.length) {
            return true;
          }
        }
      }
    }
  } catch {
    return true;
  }
  return false;
}

export async function zerarHistoricoDb(): Promise<void> {
  notificarEnvioCloud({ status: 'syncing', message: 'Resetando histórico na nuvem...' });
  const client = getSupabaseClient();
  const currentEmail = getActiveEmail();
  const isAdm = isAdminEmail(currentEmail);

  if (client) {
    try {
      if (isAdm) {
        await client.from('historico_respostas').delete().or(`user_email.eq.${currentEmail},user_email.is.null,user_email.eq.`);
      } else {
        await client.from('historico_respostas').delete().eq('user_email', currentEmail);
      }
    } catch (e) {
      console.warn('Erro ao zerar histórico no Supabase:', e);
    }
  }
  localStorage.removeItem(STORAGE_KEYS.HISTORICO);
  notificarEnvioCloud({ status: 'saved', message: 'Dados enviados' });
}

// -------------------------------------------------------------------------
// TEMPO EM SESSÕES (PERSISTÊNCIA E SINCRONIZAÇÃO)
// -------------------------------------------------------------------------
export function carregarRegistrosTempoSessoes(): RegistroTempoSessao[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEMPO_SESSOES);
    if (!raw) return [];
    const list: RegistroTempoSessao[] = JSON.parse(raw);
    const isAdm = isAdminEmail(getActiveEmail());
    const currentEmail = (getActiveEmail() || '').toLowerCase();
    return list.filter((r) => {
      const email = (r.user_email || '').toLowerCase();
      if (isAdm) return true;
      return !email || email === currentEmail;
    });
  } catch {
    return [];
  }
}

export async function salvarRegistroTempoSessao(registro: RegistroTempoSessao): Promise<void> {
  const currentEmail = getActiveEmail();
  const registroObj: RegistroTempoSessao = {
    ...registro,
    user_email: currentEmail,
    data: registro.data || Date.now(),
  };

  try {
    const current: RegistroTempoSessao[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEMPO_SESSOES) || '[]');
    const regId = registro.id;
    const regSessaoId = registro.sessaoId !== undefined && registro.sessaoId !== null ? String(registro.sessaoId) : '';
    const regCodigo = (registro.codigo || '').trim().toLowerCase();
    const regDisc = (registro.disciplina || '').trim().toLowerCase();
    const regAss = (registro.assunto || '').trim().toLowerCase();

    const indexExistente = current.findIndex((r) => {
      if (regId && r.id === regId) return true;
      // Registros individuais de resolução no Banco ou Caderno
      if (
        registro.questaoId ||
        r.questaoId ||
        registro.tipo === 'banco' ||
        r.tipo === 'banco' ||
        registro.tipo === 'caderno' ||
        r.tipo === 'caderno'
      ) {
        if (
          registro.questaoId &&
          r.questaoId &&
          String(registro.questaoId) === String(r.questaoId)
        ) {
          // Apenas substitui se for a mesma tentativa exata (mesmo timestamp aproximado dentro de 2s)
          if (r.data && registro.data && Math.abs(r.data - registro.data) < 2000) {
            return true;
          }
        }
        return false;
      }

      // Sessões completas de estudo/simulado
      const rSessaoId = r.sessaoId !== undefined && r.sessaoId !== null ? String(r.sessaoId) : '';
      const rCodigo = (r.codigo || '').trim().toLowerCase();
      const rDisc = (r.disciplina || '').trim().toLowerCase();
      const rAss = (r.assunto || '').trim().toLowerCase();

      if (regSessaoId && rSessaoId && regSessaoId === rSessaoId) return true;
      if (regCodigo && rCodigo && regCodigo === rCodigo) return true;
      if (regCodigo && rSessaoId && regCodigo === rSessaoId.toLowerCase()) return true;
      if (regSessaoId && rCodigo && regSessaoId.toLowerCase() === rCodigo) return true;
      if (!registro.questaoId && !r.questaoId && regDisc && regAss && rDisc === regDisc && rAss === regAss) return true;
      return false;
    });

    if (indexExistente >= 0) {
      current[indexExistente] = { ...current[indexExistente], ...registroObj };
    } else {
      current.push(registroObj);
    }
    localStorage.setItem(STORAGE_KEYS.TEMPO_SESSOES, JSON.stringify(current));
  } catch {}

  notificarEnvioCloud({ status: 'saved', message: 'Dados enviados' });
}

// Synchronize all local storage & IndexedDB items to Supabase
export async function sincronizarDadosParaSupabase(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase não conectado. Configure as credenciais primeiro.' };
  }

  const currentEmail = getActiveEmail();

  try {
    const bancasLocais: Banca[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BANCAS) || '[]');
    const questoesLocais: Questao[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTOES) || '[]');
    const sessoesLocais: SessaoCriada[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSOES) || '[]');
    const blocosLocais: Bloco[] = await idbCarregarBlocos();
    const materiasLocais: Materia[] = await idbCarregarMaterias();

    let bancasCount = 0;
    if (bancasLocais.length > 0) {
      const { error } = await client.from('bancas').insert(
        bancasLocais.map((b) => ({
          user_email: b.user_email || currentEmail,
          nome: b.nome,
          cargo: b.cargo || '',
          arquivos: b.arquivos,
          obs: b.obs || '',
        }))
      );
      if (!error) bancasCount = bancasLocais.length;
    }

    let blocosCount = 0;
    if (blocosLocais.length > 0) {
      const { error } = await client.from('blocos').insert(
        blocosLocais.map((bl) => ({
          user_email: bl.user_email || currentEmail,
          nome: bl.nome,
          descricao: bl.descricao || '',
        }))
      );
      if (!error) blocosCount = blocosLocais.length;
    }

    let materiasCount = 0;
    if (materiasLocais.length > 0) {
      const { error } = await client.from('materias').insert(
        materiasLocais.map((m) => ({
          user_email: m.user_email || currentEmail,
          bloco_id: m.blocoId || null,
          bloco_nome: m.blocoNome || '',
          nome: m.nome,
          arquivo_nome: m.arquivoNome,
          arquivo_texto: (m.arquivoTexto || '').slice(0, 100000),
          arquivo_tipo: m.arquivoTipo || 'application/pdf',
          tamanho_bytes: m.tamanhoBytes || 0,
        }))
      );
      if (!error) materiasCount = materiasLocais.length;
    }

    let questoesCount = 0;
    if (questoesLocais.length > 0) {
      const { error } = await client.from('questoes').insert(
        questoesLocais.map((q) => ({
          user_email: q.user_email || currentEmail,
          banca: q.banca,
          cargo: q.cargo || '',
          disciplina: q.disciplina,
          assunto: q.assunto,
          artigo: q.artigo,
          enunciado: q.enunciado,
          alternativas: q.alternativas,
          correta: q.correta,
          comentario: q.comentario,
        }))
      );
      if (!error) questoesCount = questoesLocais.length;
    }

    let sessoesCount = 0;
    if (sessoesLocais.length > 0) {
      const { error } = await client.from('sessoes').insert(
        sessoesLocais.map((s) => ({
          user_email: s.user_email || currentEmail,
          codigo: s.codigo,
          data_hora: s.dataHora,
          banca: s.banca,
          cargo: s.cargo || '',
          disciplina: s.disciplina,
          assunto: s.assunto,
          quantidade: s.quantidade,
          questao_ids: s.questaoIds,
        }))
      );
      if (!error) sessoesCount = sessoesLocais.length;
    }

    // 7. Sincroniza Histórico de Respostas dos Usuários (Estatísticas e Resoluções)
    let historicoCount = 0;
    try {
      const histLocal: HistoricoRespostasMap = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORICO) || '{}');
      const rowsHist: any[] = [];
      Object.entries(histLocal).forEach(([qId, tList]) => {
        if (Array.isArray(tList)) {
          const qIdNum = hashStringTo32BitInt(qId);
          tList.forEach((t) => {
            rowsHist.push({
              user_email: t.user_email || currentEmail,
              questao_id: qIdNum,
              questao_id_str: String(qId),
              escolha: t.escolha,
              acertou: t.acertou,
              data: t.data || Date.now(),
              tempo_segundos: t.tempoSegundos || 0,
              origem: t.origem || 'banco',
            });
          });
        }
      });

      if (rowsHist.length > 0) {
        for (let i = 0; i < rowsHist.length; i += 200) {
          const batch = rowsHist.slice(i, i + 200);
          let hRes = await client.from('historico_respostas').insert(batch);
          if (hRes.error && (hRes.error.code === '42703' || hRes.error.message?.includes('questao_id_str'))) {
            const fallback = batch.map(({ questao_id_str, ...rest }) => rest);
            hRes = await client.from('historico_respostas').insert(fallback);
          }
          if (!hRes.error) historicoCount += batch.length;
        }
      }
    } catch (e) {
      console.warn('Aviso ao sincronizar histórico de respostas:', e);
    }

    return {
      success: true,
      message: `Sincronização completa! Enviados para a nuvem: ${bancasCount} bancas, ${blocosCount} blocos, ${materiasCount} matérias, ${questoesCount} questões, ${sessoesCount} cadernos e ${historicoCount} resoluções do histórico.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro durante sincronização: ${err.message || 'Falha desconhecida.'}`,
    };
  }
}

/**
 * Sincronização Incremental Bidirecional (Merge Não Destrutivo):
 * - Usa operações de UPSERT no Supabase por ID/chave única (NUNCA usa .delete().neq('id', 0))
 * - Mescla dados locais e dados remotos sem perdas
 * - Nunca apaga dados de um lado só porque não existem no outro
 */
export async function sincronizacaoBidirecionalIncremental(): Promise<{
  success: boolean;
  message: string;
  counts: { sessoes: number; questoes: number; bancas: number; blocos: number; materias: number; historico: number };
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase não conectado. Configure a URL e Chave do Supabase primeiro.',
      counts: { sessoes: 0, questoes: 0, bancas: 0, blocos: 0, materias: 0, historico: 0 },
    };
  }

  notificarEnvioCloud({ status: 'syncing', message: 'Sincronização bidirecional (Upsert incremental)...' });
  const currentEmail = getActiveEmail();

  try {
    const bancasLocais: Banca[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BANCAS) || '[]');
    const questoesLocais: Questao[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTOES) || '[]');
    const sessoesLocais: SessaoCriada[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSOES) || '[]');
    const histLocal: HistoricoRespostasMap = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORICO) || '{}');
    const blocosLocais: Bloco[] = await idbCarregarBlocos();
    const materiasLocais: Materia[] = await idbCarregarMaterias();

    let bancasCount = 0;
    let blocosCount = 0;
    let materiasCount = 0;
    let questoesCount = 0;
    let sessoesCount = 0;
    let historicoCount = 0;

    // Trava de segurança: Bloqueia 100% qualquer envio para o Supabase se o estado local recém-carregado estiver com 0 questões
    if (questoesLocais.length === 0) {
      const cloudQ = await carregarQuestoes();
      if (cloudQ && cloudQ.length > 0) {
        localStorage.setItem(STORAGE_KEYS.QUESTOES, JSON.stringify(cloudQ));
        questoesLocais.push(...cloudQ);
      } else {
        notificarEnvioCloud({ status: 'idle', message: 'Sincronização abortada: 0 questões locais' });
        return {
          success: false,
          message: 'Envio bloqueado para proteção da nuvem: o acervo local possui 0 questões. Carregue os dados da nuvem ou restaure um backup JSON antes de sincronizar.',
          counts: { sessoes: 0, questoes: 0, bancas: 0, blocos: 0, materias: 0, historico: 0 },
        };
      }
    }

    // 1. Upsert não destrutivo de bancas
    if (bancasLocais.length > 0) {
      const rowsBancas = bancasLocais.map((b) => ({
        user_email: b.user_email || currentEmail,
        nome: b.nome,
        arquivos: b.arquivos,
        obs: b.obs || '',
        cargo: b.cargo || '',
      }));
      for (const row of rowsBancas) {
        try {
          const res = await client.from('bancas').upsert(row, { onConflict: 'nome' });
          if (!res.error) bancasCount++;
        } catch {}
      }
    }

    // 2. Upsert não destrutivo de blocos e matérias
    if (blocosLocais.length > 0) {
      const rowsBlocos = blocosLocais.map((bl) => ({
        user_email: bl.user_email || currentEmail,
        nome: bl.nome,
        descricao: bl.descricao || '',
      }));
      for (const row of rowsBlocos) {
        try {
          const res = await client.from('blocos').upsert(row, { onConflict: 'nome' });
          if (!res.error) blocosCount++;
        } catch {}
      }
    }

    if (materiasLocais.length > 0) {
      const rowsMaterias = materiasLocais.map((m) => ({
        user_email: m.user_email || currentEmail,
        bloco_id: m.blocoId || null,
        bloco_nome: m.blocoNome || '',
        nome: m.nome,
        arquivo_nome: m.arquivoNome,
        arquivo_texto: (m.arquivoTexto || '').slice(0, 100000),
        arquivo_tipo: m.arquivoTipo || 'application/pdf',
        tamanho_bytes: m.tamanhoBytes || 0,
      }));
      for (const row of rowsMaterias) {
        try {
          const res = await client.from('materias').upsert(row, { onConflict: 'nome' });
          if (!res.error) materiasCount++;
        } catch {}
      }
    }

    // 3. Upsert não destrutivo de Questões
    if (questoesLocais.length > 0) {
      for (let i = 0; i < questoesLocais.length; i += 100) {
        const batch = questoesLocais.slice(i, i + 100);
        const rowsQuestoes = batch.map((q) => {
          const row: Record<string, any> = {
            user_email: q.user_email || currentEmail,
            banca: q.banca,
            disciplina: q.disciplina,
            assunto: q.assunto,
            artigo: q.artigo,
            enunciado: q.enunciado,
            alternativas: q.alternativas,
            correta: q.correta,
            comentario: q.comentario,
          };
          if (q.id && typeof q.id === 'number') row.id = q.id;
          if (q.cargo) row.cargo = q.cargo;
          return row;
        });

        try {
          let qRes = await client.from('questoes').upsert(rowsQuestoes, { onConflict: 'id' });
          if (qRes.error && (qRes.error.code === '42703' || qRes.error.message?.includes('user_email') || qRes.error.message?.includes('cargo'))) {
            const fallback = rowsQuestoes.map(({ user_email, cargo, ...rest }) => rest);
            qRes = await client.from('questoes').upsert(fallback, { onConflict: 'id' });
          }
          if (!qRes.error) questoesCount += batch.length;
        } catch {}
      }
    }

    // 4. Upsert não destrutivo de Sessões
    if (sessoesLocais.length > 0) {
      for (const s of sessoesLocais) {
        const row: Record<string, any> = {
          user_email: s.user_email || currentEmail,
          codigo: s.codigo,
          data_hora: s.dataHora,
          banca: s.banca,
          disciplina: s.disciplina,
          assunto: s.assunto,
          quantidade: s.quantidade,
          questao_ids: s.questaoIds,
          questoes_snap: s.questoesSnap,
          concluida: s.concluida,
          taxa_acerto: s.taxaAcerto,
          acertos: s.acertos,
          erros: s.erros,
          tempo_segundos: s.tempoSegundos,
          tipo: s.tipo,
        };
        if (s.id && typeof s.id === 'number') row.id = s.id;
        if (s.cargo) row.cargo = s.cargo;

        try {
          let sRes = await client.from('sessoes').upsert(row, { onConflict: 'id' });
          if (sRes.error) {
            const { user_email, cargo, questoes_snap, ...fallback } = row;
            sRes = await client.from('sessoes').upsert(fallback);
          }
          if (!sRes.error) sessoesCount++;
        } catch {}
      }
    }

    // 5. Inserção incremental de Histórico (sem sobrescrita)
    const rowsHist: any[] = [];
    Object.entries(histLocal).forEach(([qId, tList]) => {
      if (Array.isArray(tList)) {
        const qIdNum = hashStringTo32BitInt(qId);
        tList.forEach((t) => {
          rowsHist.push({
            user_email: t.user_email || currentEmail,
            questao_id: qIdNum,
            questao_id_str: String(qId),
            escolha: t.escolha,
            acertou: t.acertou,
            data: t.data || Date.now(),
            tempo_segundos: t.tempoSegundos || 0,
            origem: t.origem || 'banco',
          });
        });
      }
    });

    if (rowsHist.length > 0) {
      for (let i = 0; i < rowsHist.length; i += 100) {
        const batch = rowsHist.slice(i, i + 100);
        try {
          let hRes = await client.from('historico_respostas').insert(batch);
          if (hRes.error) {
            const fallback = batch.map(({ questao_id_str, ...rest }) => rest);
            hRes = await client.from('historico_respostas').insert(fallback);
          }
          if (!hRes.error) historicoCount += batch.length;
        } catch {}
      }
    }

    // 6. Merge reverso (puxa novidades da nuvem para o cache local)
    try {
      const [qCloud, sCloud, hCloud] = await Promise.all([
        carregarQuestoes(),
        carregarSessoes(),
        carregarHistorico(),
      ]);

      if (qCloud && qCloud.length > questoesLocais.length) {
        localStorage.setItem(STORAGE_KEYS.QUESTOES, JSON.stringify(qCloud));
      }
      if (sCloud && sCloud.length > sessoesLocais.length) {
        localStorage.setItem(STORAGE_KEYS.SESSOES, JSON.stringify(sCloud));
      }
      if (hCloud && Object.keys(hCloud).length > Object.keys(histLocal).length) {
        localStorage.setItem(STORAGE_KEYS.HISTORICO, JSON.stringify(hCloud));
      }
    } catch {}

    notificarEnvioCloud({ status: 'saved', message: 'Sincronização concluída' });
    return {
      success: true,
      message: `Sincronização bidirecional concluída! Dados consolidados na nuvem e no cache: ${sessoesCount} sessões, ${questoesCount} questões e ${historicoCount} tentativas salvas sem nenhuma perda.`,
      counts: {
        sessoes: sessoesCount,
        questoes: questoesCount,
        bancas: bancasCount,
        blocos: blocosCount,
        materias: materiasCount,
        historico: historicoCount,
      },
    };
  } catch (err: any) {
    notificarEnvioCloud({ status: 'error', message: 'Falha na sincronização' });
    return {
      success: false,
      message: `Erro na sincronização bidirecional: ${err.message || 'Falha ao sincronizar com Supabase.'}`,
      counts: { sessoes: 0, questoes: 0, bancas: 0, blocos: 0, materias: 0, historico: 0 },
    };
  }
}

/**
 * Alias retrocompatível não destrutivo para substituirNuvemComDadosLocais
 */
export async function substituirNuvemComDadosLocais(): Promise<{
  success: boolean;
  message: string;
  counts?: { sessoes: number; questoes: number; bancas: number; blocos: number; materias: number; historico: number };
}> {
  return await sincronizacaoBidirecionalIncremental();
}

/**
 * Detecta se o cache local do navegador está vazio e hidrata completamente do Supabase
 * sem NUNCA enviar um estado vazio para a nuvem.
 */
export async function hidratarCacheLocalDoSupabase(): Promise<{
  success: boolean;
  message: string;
  questoesHidratadas: number;
  sessoesHidratadas: number;
  historicoHidratado: number;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase não conectado.',
      questoesHidratadas: 0,
      sessoesHidratadas: 0,
      historicoHidratado: 0,
    };
  }

  try {
    notificarEnvioCloud({ status: 'syncing', message: 'Hidratando dados da nuvem...' });

    const [bancasCloud, blocosCloud, materiasCloud, questoesCloud, sessoesCloud, historicoCloud] =
      await Promise.all([
        carregarBancas(),
        carregarBlocos(),
        carregarMaterias(),
        carregarQuestoes(),
        carregarSessoes(),
        carregarHistorico(),
      ]);

    if (questoesCloud && questoesCloud.length > 0) {
      localStorage.setItem(STORAGE_KEYS.QUESTOES, JSON.stringify(questoesCloud));
    }
    if (sessoesCloud && sessoesCloud.length > 0) {
      localStorage.setItem(STORAGE_KEYS.SESSOES, JSON.stringify(sessoesCloud));
    }
    if (historicoCloud && Object.keys(historicoCloud).length > 0) {
      localStorage.setItem(STORAGE_KEYS.HISTORICO, JSON.stringify(historicoCloud));
    }
    if (bancasCloud && bancasCloud.length > 0) {
      localStorage.setItem(STORAGE_KEYS.BANCAS, JSON.stringify(bancasCloud));
    }
    if (blocosCloud && blocosCloud.length > 0) {
      for (const b of blocosCloud) {
        await idbSalvarBloco(b);
      }
    }
    if (materiasCloud && materiasCloud.length > 0) {
      for (const m of materiasCloud) {
        await idbSalvarMateria(m);
      }
    }

    notificarEnvioCloud({ status: 'saved', message: 'Cache local hidratado' });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gb_dados_hidratados_da_nuvem'));
    }

    return {
      success: true,
      message: `Cache local hidratado com sucesso: ${questoesCloud.length} questões, ${sessoesCloud.length} sessões e histórico restaurados.`,
      questoesHidratadas: questoesCloud.length,
      sessoesHidratadas: sessoesCloud.length,
      historicoHidratado: Object.keys(historicoCloud).length,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Falha ao hidratar cache do Supabase: ${err.message || 'Erro de conexão.'}`,
      questoesHidratadas: 0,
      sessoesHidratadas: 0,
      historicoHidratado: 0,
    };
  }
}

/**
 * Gera e dispara o download de um arquivo físico .json contendo o backup completo
 * de questões, sessões, simulados, matérias e histórico de resoluções do usuário.
 */
export async function gerarBackupLocalCompleto(): Promise<{
  success: boolean;
  message: string;
  fileName?: string;
  stats?: {
    questoes: number;
    sessoes: number;
    historicoQuestoes: number;
    totalTentativas: number;
  };
}> {
  try {
    const bancas: Banca[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BANCAS) || '[]');
    const questoes: Questao[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTOES) || '[]');
    const sessoes: SessaoCriada[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSOES) || '[]');
    const historico: HistoricoRespostasMap = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORICO) || '{}');
    const tempoSessoes = JSON.parse(localStorage.getItem(STORAGE_KEYS.TEMPO_SESSOES) || '[]');
    const blocos = await idbCarregarBlocos();
    const materias = await idbCarregarMaterias();

    let totalTentativas = 0;
    Object.values(historico).forEach((arr) => {
      if (Array.isArray(arr)) totalTentativas += arr.length;
    });

    const dataAgora = new Date();
    const dataStr = dataAgora.toISOString().slice(0, 10);
    const fileName = `backup-concurso-fafipa-${dataStr}.json`;

    const payload = {
      versao: '3.0-blindado',
      exportadoEm: dataAgora.toISOString(),
      usuario: getActiveEmail(),
      resumo: {
        totalQuestoes: questoes.length,
        totalSessoes: sessoes.length,
        totalQuestoesComHistorico: Object.keys(historico).length,
        totalTentativas,
        totalBlocos: blocos.length,
        totalMaterias: materias.length,
        totalBancas: bancas.length,
      },
      bancas,
      blocos,
      materias,
      questoes,
      sessoes,
      historico,
      tempoSessoes,
    };

    if (typeof document !== 'undefined') {
      const jsonStr = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    return {
      success: true,
      message: `Backup físico gerado e descarregado com sucesso (${fileName})!`,
      fileName,
      stats: {
        questoes: questoes.length,
        sessoes: sessoes.length,
        historicoQuestoes: Object.keys(historico).length,
        totalTentativas,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao gerar backup local: ${err.message || 'Falha ao empacotar JSON.'}`,
    };
  }
}

/**
 * Restaura o estado da aplicação a partir de um arquivo físico de backup JSON.
 * - Valida integridade do JSON
 * - Atualiza o localStorage e IndexedDB
 * - Dispara evento gb_dados_hidratados_da_nuvem para reatividade instantânea no React
 * - Executa sincronização incremental bidirecional (.upsert) com o Supabase
 */
export async function restaurarBackupLocalJson(conteudoJson: string): Promise<{
  success: boolean;
  message: string;
  stats?: {
    questoes: number;
    sessoes: number;
    historicoQuestoes: number;
    totalTentativas: number;
  };
}> {
  try {
    if (!conteudoJson || typeof conteudoJson !== 'string') {
      return { success: false, message: 'Arquivo JSON inválido ou vazio.' };
    }

    const parsed = JSON.parse(conteudoJson);
    const questoes: Questao[] = Array.isArray(parsed.questoes) ? parsed.questoes : [];
    const sessoes: SessaoCriada[] = Array.isArray(parsed.sessoes) ? parsed.sessoes : [];
    const historico: HistoricoRespostasMap =
      parsed.historico && typeof parsed.historico === 'object' ? parsed.historico : {};
    const bancas: Banca[] = Array.isArray(parsed.bancas) ? parsed.bancas : [];
    const blocos: Bloco[] = Array.isArray(parsed.blocos) ? parsed.blocos : [];
    const materias: Materia[] = Array.isArray(parsed.materias) ? parsed.materias : [];
    const tempoSessoes = Array.isArray(parsed.tempoSessoes) ? parsed.tempoSessoes : [];

    if (questoes.length === 0 && sessoes.length === 0 && Object.keys(historico).length === 0) {
      return {
        success: false,
        message: 'O arquivo JSON não contém questões, sessões ou histórico válidos para restauração.',
      };
    }

    // 1. Grava no cache localStorage
    if (questoes.length > 0) {
      localStorage.setItem(STORAGE_KEYS.QUESTOES, JSON.stringify(questoes));
    }
    if (sessoes.length > 0) {
      localStorage.setItem(STORAGE_KEYS.SESSOES, JSON.stringify(sessoes));
    }
    if (Object.keys(historico).length > 0) {
      localStorage.setItem(STORAGE_KEYS.HISTORICO, JSON.stringify(historico));
    }
    if (bancas.length > 0) {
      localStorage.setItem(STORAGE_KEYS.BANCAS, JSON.stringify(bancas));
    }
    if (tempoSessoes.length > 0) {
      localStorage.setItem(STORAGE_KEYS.TEMPO_SESSOES, JSON.stringify(tempoSessoes));
    }

    // 2. Grava blocos e matérias no IndexedDB
    for (const b of blocos) {
      await idbSalvarBloco(b).catch(() => {});
    }
    for (const m of materias) {
      await idbSalvarMateria(m).catch(() => {});
    }

    let totalTentativas = 0;
    Object.values(historico).forEach((arr) => {
      if (Array.isArray(arr)) totalTentativas += arr.length;
    });

    // 3. Atualiza estado da interface React instantaneamente
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gb_dados_hidratados_da_nuvem'));
    }

    // 4. Executa upsert incremental para sincronizar com Supabase
    let syncMsg = '';
    try {
      const syncRes = await sincronizacaoBidirecionalIncremental();
      syncMsg = syncRes.success ? ' e sincronizado com o Supabase' : ' (nuvem pendente de conexão)';
    } catch (e: any) {
      syncMsg = ` (aviso na sincronização nuvem: ${e.message || 'offline'})`;
    }

    return {
      success: true,
      message: `Backup restaurado com sucesso${syncMsg}! ${questoes.length} questões, ${sessoes.length} sessões e ${totalTentativas} tentativas recuperadas.`,
      stats: {
        questoes: questoes.length,
        sessoes: sessoes.length,
        historicoQuestoes: Object.keys(historico).length,
        totalTentativas,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao processar o arquivo de backup: ${err.message || 'JSON inválido.'}`,
    };
  }
}

// Zera completamente todos os dados, premissas, cadernos e questões do banco na nuvem e do dispositivo
export async function zerarTudoDb(): Promise<{ success: boolean; message: string }> {
  notificarEnvioCloud({ status: 'syncing', message: 'Zerando base de dados...' });
  const client = getSupabaseClient();

  if (client) {
    try {
      await Promise.allSettled([
        client.from('questoes').delete().neq('id', 0),
        client.from('sessoes').delete().neq('id', 0),
        client.from('bancas').delete().neq('id', 0),
        client.from('blocos').delete().neq('id', 0),
        client.from('materias').delete().neq('id', 0),
        client.from('historico_respostas').delete().neq('id', 0),
      ]);
    } catch (e) {
      console.warn('Erro ao limpar tabelas no Supabase:', e);
    }
  }

  // Limpa cache local
  try {
    localStorage.removeItem(STORAGE_KEYS.QUESTOES);
    localStorage.removeItem(STORAGE_KEYS.SESSOES);
    localStorage.removeItem(STORAGE_KEYS.BANCAS);
    localStorage.removeItem(STORAGE_KEYS.BLOCOS);
    localStorage.removeItem(STORAGE_KEYS.MATERIAS);
    localStorage.removeItem(STORAGE_KEYS.HISTORICO);
    localStorage.removeItem(STORAGE_KEYS.TEMPO_SESSOES);
    localStorage.removeItem('gb_harmonizado_auto_v1');
    localStorage.setItem('gb_clean_start_v1', 'true');
  } catch {}

  // Limpa IndexedDB
  await idbLimparTudo();

  notificarEnvioCloud({ status: 'saved', message: 'Base zerada' });
  return { success: true, message: 'Todos os dados, premissas, sessões e questões foram zerados com sucesso!' };
}

/**
 * Script de migração de dados idempotente (Data Migration - Layer 2).
 * Re-correlaciona respostas antigas no Supabase (salvas com IDs legados de regex \D)
 * com os IDs canônicos atuais usando os snapshots das sessões salvas (questoesSnap).
 */
export async function migrarERecuperarHistoricoAntigoSupabase(): Promise<{
  sucesso: boolean;
  migradosCount: number;
  mensagem: string;
}> {
  notificarEnvioCloud({ status: 'syncing', message: 'Migrando histórico antigo no Supabase...' });
  const client = getSupabaseClient();
  const currentEmail = getActiveEmail();
  if (!client) {
    return { sucesso: false, migradosCount: 0, mensagem: 'Cliente Supabase não inicializado.' };
  }

  let migradosCount = 0;
  try {
    const { data: rows, error } = await client
      .from('historico_respostas')
      .select('*')
      .or(`user_email.eq.${currentEmail},user_email.is.null,user_email.eq.`);

    if (error || !rows) {
      return { sucesso: false, migradosCount: 0, mensagem: `Erro ao buscar histórico: ${error?.message}` };
    }

    const qLocais: Questao[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTOES) || '[]');
    const customProvas = carregarProvasCustomizadasLocalStorage();
    const todasProvasOficiais = obterQuestoesProvasAnterioresOficiais();
    const todasQuestoes = [...qLocais, ...customProvas.questoes, ...todasProvasOficiais];

    const mapaLegacyParaCanonico = new Map<string, string>();
    todasQuestoes.forEach((q) => {
      if (q && q.id != null) {
        const strId = String(q.id).trim();
        mapaLegacyParaCanonico.set(strId, strId);
        const legacyNum = String(parseInt(strId.replace(/\D/g, ''), 10) || '');
        if (legacyNum && !mapaLegacyParaCanonico.has(legacyNum)) {
          mapaLegacyParaCanonico.set(legacyNum, strId);
        }
      }
    });

    try {
      const sessoesLocais: SessaoCriada[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSOES) || '[]');
      sessoesLocais.forEach((s) => {
        if (Array.isArray(s.questoesSnap) && Array.isArray(s.questaoIds)) {
          s.questaoIds.forEach((qId, idx) => {
            const snapQ = s.questoesSnap?.[idx];
            if (qId != null && snapQ && snapQ.id != null) {
              const canon = String(snapQ.id).trim();
              const qIdStr = String(qId).trim();
              mapaLegacyParaCanonico.set(qIdStr, canon);
              const legNum = String(parseInt(qIdStr.replace(/\D/g, ''), 10) || '');
              if (legNum) mapaLegacyParaCanonico.set(legNum, canon);
            }
          });
        }
      });
    } catch {}

    for (const row of rows) {
      const rawStr = row.questao_id_str ? String(row.questao_id_str).trim() : '';
      const rawNum = row.questao_id != null ? String(row.questao_id) : '';

      const targetCanonical = mapaLegacyParaCanonico.get(rawStr) || mapaLegacyParaCanonico.get(rawNum);

      if (targetCanonical && rawStr !== targetCanonical) {
        const newHashNum = hashStringTo32BitInt(targetCanonical);
        const { error: updateErr } = await client
          .from('historico_respostas')
          .update({
            questao_id_str: targetCanonical,
            questao_id: newHashNum,
            user_email: currentEmail,
          })
          .eq('id', row.id);

        if (!updateErr) {
          migradosCount++;
        }
      }
    }

    await carregarHistorico();

    notificarEnvioCloud({ status: 'saved', message: `${migradosCount} registros re-vinculados!` });
    return {
      sucesso: true,
      migradosCount,
      mensagem: `Migração concluída com sucesso! ${migradosCount} respostas do histórico antigo foram re-vinculadas aos IDs canônicos.`,
    };
  } catch (err: any) {
    console.warn('Erro na migração de histórico antigo:', err);
    return { sucesso: false, migradosCount: 0, mensagem: `Erro: ${err.message || err}` };
  }
}

/**
 * Atualiza o comentário de uma questão no Supabase e no armazenamento local.
 */
export async function atualizarComentarioQuestaoSupabase(
  questaoId: string | number,
  novoComentario: string
): Promise<boolean> {
  const qIdStr = String(questaoId).trim();
  let updatedInSupabase = false;

  // 1. Atualiza no Supabase (se o cliente estiver conectado)
  const client = getSupabaseClient();
  if (client) {
    try {
      const idNum = parseInt(qIdStr, 10);
      let query = client.from('banco_questoes').update({ comentario: novoComentario });

      if (!isNaN(idNum) && idNum > 0) {
        const { error } = await query.or(`id.eq.${idNum},tracking_id.eq.${qIdStr}`);
        if (!error) updatedInSupabase = true;
      } else {
        const { error } = await query.eq('tracking_id', qIdStr);
        if (!error) updatedInSupabase = true;
      }
    } catch (err) {
      console.warn('Aviso: Falha ao atualizar comentário no Supabase:', err);
    }
  }

  // 2. Atualiza no localStorage para refletir imediatamente no estado local do app
  try {
    const rawBanco = localStorage.getItem('gb_banco_questoes');
    if (rawBanco) {
      const banco = JSON.parse(rawBanco);
      if (Array.isArray(banco)) {
        let alterado = false;
        const novoBanco = banco.map((q: any) => {
          if (String(q.id) === qIdStr || String(q.tracking_id) === qIdStr) {
            alterado = true;
            return { ...q, comentario: novoComentario };
          }
          return q;
        });

        if (alterado) {
          localStorage.setItem('gb_banco_questoes', JSON.stringify(novoBanco));
        }
      }
    }

    const rawSessoes = localStorage.getItem('gb_sessoes_estudo');
    if (rawSessoes) {
      const sessoes = JSON.parse(rawSessoes);
      if (Array.isArray(sessoes)) {
        let alteradoSessoes = false;
        const novasSessoes = sessoes.map((sessao: any) => {
          if (Array.isArray(sessao.questoes)) {
            const novasQ = sessao.questoes.map((q: any) => {
              if (String(q.id) === qIdStr || String(q.tracking_id) === qIdStr) {
                alteradoSessoes = true;
                return { ...q, comentario: novoComentario };
              }
              return q;
            });
            return { ...sessao, questoes: novasQ };
          }
          return sessao;
        });

        if (alteradoSessoes) {
          localStorage.setItem('gb_sessoes_estudo', JSON.stringify(novasSessoes));
        }
      }
    }
  } catch (err) {
    console.warn('Aviso ao atualizar comentário no localStorage:', err);
  }

  return updatedInSupabase;
}


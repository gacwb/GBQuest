import { CorGrifo, GrifoQuestao, MapaGrifosQuestoes } from '../types';
import { getSupabaseClient } from './supabaseClient';
import { getCurrentUser } from './authService';

function getActiveEmail(): string {
  const user = getCurrentUser();
  if (user && user.email) return user.email.trim().toLowerCase();
  return 'gahenrique.eng@gmail.com';
}

export const STORAGE_KEY_GRIFOS = 'gb_grifos_questoes';

export function carregarTodosGrifosLocal(): MapaGrifosQuestoes {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GRIFOS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Erro ao ler grifos do localStorage:', e);
    return {};
  }
}

export function salvarTodosGrifosLocal(mapa: MapaGrifosQuestoes): void {
  try {
    localStorage.setItem(STORAGE_KEY_GRIFOS, JSON.stringify(mapa));
  } catch (e) {
    console.warn('Erro ao salvar grifos no localStorage:', e);
  }
}

export function notificarAtualizacaoGrifos(questaoId: number | string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('gb_grifos_updated', {
        detail: { questaoId: String(questaoId) },
      })
    );
  }
}

/**
 * Retorna todos os grifos ativos para uma questão específica
 */
export function obterGrifosQuestao(questaoId: number | string): GrifoQuestao[] {
  if (!questaoId) return [];
  const mapa = carregarTodosGrifosLocal();
  const key = String(questaoId);
  return mapa[key] || [];
}

/**
 * Salva um novo trecho grifado para a questão
 */
export function salvarGrifo(
  questaoId: number | string,
  dados: {
    cor: CorGrifo;
    texto: string;
    startIndex: number;
    endIndex: number;
  }
): GrifoQuestao {
  const mapa = carregarTodosGrifosLocal();
  const key = String(questaoId);
  const lista = mapa[key] ? [...mapa[key]] : [];

  const novoGrifo: GrifoQuestao = {
    id: `grifo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    questaoId,
    cor: dados.cor,
    texto: dados.texto,
    startIndex: Math.min(dados.startIndex, dados.endIndex),
    endIndex: Math.max(dados.startIndex, dados.endIndex),
    created_at: Date.now(),
  };

  // Se já existe um grifo idêntico na mesma posição, apenas atualiza a cor
  const idxExistente = lista.findIndex(
    (g) => g.startIndex === novoGrifo.startIndex && g.endIndex === novoGrifo.endIndex
  );

  if (idxExistente >= 0) {
    lista[idxExistente] = { ...lista[idxExistente], cor: novoGrifo.cor };
  } else {
    lista.push(novoGrifo);
  }

  // Ordena por posição de início
  lista.sort((a, b) => a.startIndex - b.startIndex);
  mapa[key] = lista;
  salvarTodosGrifosLocal(mapa);
  notificarAtualizacaoGrifos(questaoId);

  // Sincroniza em background com o Supabase se configurado
  salvarGrifoNuvem(novoGrifo).catch(() => {});

  return novoGrifo;
}

/**
 * Altera a cor de um grifo existente
 */
export function atualizarCorGrifo(
  questaoId: number | string,
  grifoId: string,
  novaCor: CorGrifo
): void {
  const mapa = carregarTodosGrifosLocal();
  const key = String(questaoId);
  const lista = mapa[key] || [];

  const idx = lista.findIndex((g) => g.id === grifoId);
  if (idx >= 0) {
    lista[idx] = { ...lista[idx], cor: novaCor };
    mapa[key] = lista;
    salvarTodosGrifosLocal(mapa);
    notificarAtualizacaoGrifos(questaoId);

    atualizarGrifoNuvem(lista[idx]).catch(() => {});
  }
}

/**
 * Remove um grifo existente
 */
export function removerGrifo(questaoId: number | string, grifoId: string): void {
  const mapa = carregarTodosGrifosLocal();
  const key = String(questaoId);
  const lista = mapa[key] || [];

  const filtrados = lista.filter((g) => g.id !== grifoId);
  mapa[key] = filtrados;
  salvarTodosGrifosLocal(mapa);
  notificarAtualizacaoGrifos(questaoId);

  removerGrifoNuvem(grifoId).catch(() => {});
}

/**
 * Limpa todos os grifos de uma questão
 */
export function limparGrifosQuestao(questaoId: number | string): void {
  const mapa = carregarTodosGrifosLocal();
  const key = String(questaoId);
  delete mapa[key];
  salvarTodosGrifosLocal(mapa);
  notificarAtualizacaoGrifos(questaoId);
}

// ----------------------------------------------------
// SINCRONIZAÇÃO EM NUVEM (SUPABASE)
// ----------------------------------------------------

async function salvarGrifoNuvem(grifo: GrifoQuestao) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const email = getActiveEmail();
    const qIdNum = typeof grifo.questaoId === 'number' ? grifo.questaoId : parseInt(String(grifo.questaoId).replace(/\D/g, ''), 10) || Date.now();
    const payload: Record<string, any> = {
      id: grifo.id,
      user_email: email,
      questao_id: qIdNum,
      questao_id_str: String(grifo.questaoId),
      cor: grifo.cor,
      texto: grifo.texto,
      start_index: grifo.startIndex,
      end_index: grifo.endIndex,
    };
    const { error } = await client.from('grifos_questoes').upsert(payload);
    if (error && (error.code === '42703' || error.message?.includes('questao_id_str'))) {
      delete payload.questao_id_str;
      await client.from('grifos_questoes').upsert(payload);
    }
  } catch (e) {
    // Tabela opcional ou não provisionada ainda
  }
}

async function atualizarGrifoNuvem(grifo: GrifoQuestao) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('grifos_questoes').update({ cor: grifo.cor }).eq('id', grifo.id);
  } catch (e) {}
}

async function removerGrifoNuvem(grifoId: string) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('grifos_questoes').delete().eq('id', grifoId);
  } catch (e) {}
}

/**
 * Sincroniza grifos da nuvem ao iniciar a aplicação
 */
export async function sincronizarGrifosComNuvem(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const email = getActiveEmail();
    const { data, error } = await client
      .from('grifos_questoes')
      .select('*')
      .or(`user_email.eq.${email},user_email.is.null,user_email.eq.`);

    if (!error && Array.isArray(data) && data.length > 0) {
      const mapa = carregarTodosGrifosLocal();

      // Mapeador de IDs numéricos para IDs canônicos em string
      const numToCanonicalMap = new Map<string, string>();
      try {
        const qLocais = JSON.parse(localStorage.getItem('gb_questoes') || '[]');
        qLocais.forEach((q: any) => {
          if (q && q.id != null) {
            const strId = String(q.id);
            const numId = String(typeof q.id === 'number' ? q.id : parseInt(strId.replace(/\D/g, ''), 10) || '');
            if (numId) numToCanonicalMap.set(numId, strId);
          }
        });
      } catch {}

      data.forEach((row: any) => {
        const rawQId = row.questao_id_str || String(row.questao_id);
        const canonicalKey = numToCanonicalMap.get(rawQId) || numToCanonicalMap.get(String(row.questao_id)) || rawQId;

        const grifoItem: GrifoQuestao = {
          id: row.id,
          questaoId: canonicalKey,
          cor: row.cor as CorGrifo,
          texto: row.texto,
          startIndex: row.start_index,
          endIndex: row.end_index,
          created_at: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
        };

        const keysToAdd = new Set<string>([canonicalKey, rawQId, String(row.questao_id)]);
        keysToAdd.forEach((k) => {
          if (!k) return;
          if (!mapa[k]) mapa[k] = [];
          const exists = mapa[k].some((g) => g.id === row.id || (g.startIndex === grifoItem.startIndex && g.endIndex === grifoItem.endIndex));
          if (!exists) {
            mapa[k].push(grifoItem);
          }
        });
      });

      salvarTodosGrifosLocal(mapa);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gb_grifos_updated', { detail: { questaoId: '*' } }));
      }
    }
  } catch (e) {}
}

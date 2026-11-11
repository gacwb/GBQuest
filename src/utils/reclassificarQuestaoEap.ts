import { Questao, SessaoCriada } from '../types';
import { getSupabaseClient, STORAGE_KEYS, notificarEnvioCloud } from '../services/supabaseClient';
import { BLOCOS_CANONICOS_EAP, LISTA_34_MATERIAS_CANONICAS } from './recategorizadorEap';
import { TABELA_PDFS_ESTUDO, ItemPdfEstudo } from './simuladoPonderado';
import { atualizarQuestaoProvaAnteriorNoRegistro } from './provasAnterioresRegistry';

/**
 * Retorna as matérias canônicas de um determinado bloco
 */
export function obterMateriasDoBloco(blocoNumeroOuNome: number | string): ItemPdfEstudo[] {
  if (typeof blocoNumeroOuNome === 'number') {
    return TABELA_PDFS_ESTUDO.filter((p) => p.blocoNumero === blocoNumeroOuNome);
  }
  const str = String(blocoNumeroOuNome).trim().toLowerCase();
  // Extrai número do bloco (ex: 'Bloco 2' -> 2)
  const matchNum = str.match(/bloco\s*0?([1-7])/i);
  const num = matchNum ? parseInt(matchNum[1], 10) : null;

  return TABELA_PDFS_ESTUDO.filter((p) => {
    if (num && p.blocoNumero === num) return true;
    return (
      p.blocoNome.toLowerCase().includes(str) ||
      str.includes(p.blocoNome.toLowerCase())
    );
  });
}

/**
 * Valida se um par Bloco + Matéria pertence à estrutura canônica do EAP
 */
export function validarParEap(blocoNome: string, assuntoNome: string): boolean {
  if (!blocoNome || !assuntoNome) return false;
  const matchBloco = BLOCOS_CANONICOS_EAP.includes(blocoNome);
  const matchAssunto = LISTA_34_MATERIAS_CANONICAS.some(
    (m) => m.assuntoNome === assuntoNome && (m.blocoNome === blocoNome || !matchBloco)
  );
  return matchBloco && matchAssunto;
}

/**
 * Atualiza pura e imutavelmente uma questão dentro de uma lista de questões
 */
export function reclassificarQuestaoNaLista(
  questoes: Questao[],
  questaoId: string | number,
  novoBloco: string,
  novoAssunto: string,
  novoCargo?: string
): Questao[] {
  const idStr = String(questaoId).trim().toLowerCase();
  return questoes.map((q) => {
    if (String(q.id).trim().toLowerCase() === idStr) {
      return {
        ...q,
        disciplina: novoBloco,
        assunto: novoAssunto,
        ...(novoCargo !== undefined ? { cargo: novoCargo } : {}),
      };
    }
    return q;
  });
}

/**
 * Persiste a reclassificação manual da questão em todos os bancos de dados:
 * 1. Supabase (tabela 'questoes')
 * 2. LocalStorage ('gb_questoes')
 * 3. Provas Anteriores Customizadas e Registro em Memória
 * 4. Snapshots de sessões salvas ('gb_sessoescriadas')
 * 5. Notificação visual de Cloud Sync
 */
export async function persistirReclassificacaoQuestao(
  questaoId: string | number,
  novoBloco: string,
  novoAssunto: string,
  novoCargo?: string
): Promise<{ success: boolean; questaoAtualizada?: Questao; error?: string }> {
  if (questaoId === undefined || questaoId === null) {
    return { success: false, error: 'ID da questão não informado.' };
  }

  const idStr = String(questaoId).trim().toLowerCase();
  let questaoAtualizada: Questao | undefined;

  // 1. Atualiza no cache local de questões (localStorage)
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEYS.QUESTOES);
      if (raw) {
        const questoes: Questao[] = JSON.parse(raw);
        const listaAtualizada = reclassificarQuestaoNaLista(
          questoes,
          questaoId,
          novoBloco,
          novoAssunto,
          novoCargo
        );
        questaoAtualizada = listaAtualizada.find(
          (q) => String(q.id).trim().toLowerCase() === idStr
        );
        localStorage.setItem(STORAGE_KEYS.QUESTOES, JSON.stringify(listaAtualizada));
      }
    }
  } catch (err) {
    console.warn('Erro ao atualizar questao no localStorage:', err);
  }

  // 2. Se for questão de prova anterior, atualiza no registro canônico e armazenamento customizado
  try {
    atualizarQuestaoProvaAnteriorNoRegistro(questaoId, {
      disciplina: novoBloco,
      assunto: novoAssunto,
      cargo: novoCargo,
    });
  } catch (err) {
    console.warn('Erro ao atualizar questao no registro de provas anteriores:', err);
  }

  // 3. Atualiza nos snapshots das sessões salvas
  try {
    if (typeof window !== 'undefined') {
      const rawSessoes =
        localStorage.getItem(STORAGE_KEYS.SESSOES) ||
        localStorage.getItem('gb_sessoescriadas') ||
        '[]';
      const sessoes: SessaoCriada[] = JSON.parse(rawSessoes);
      let houveAlteracao = false;

      sessoes.forEach((s) => {
        if (Array.isArray(s.questoesSnap)) {
          s.questoesSnap = s.questoesSnap.map((sq) => {
            if (String(sq.id).trim().toLowerCase() === idStr) {
              houveAlteracao = true;
              return {
                ...sq,
                disciplina: novoBloco,
                assunto: novoAssunto,
                ...(novoCargo !== undefined ? { cargo: novoCargo } : {}),
              };
            }
            return sq;
          });
        }
      });

      if (houveAlteracao) {
        localStorage.setItem(STORAGE_KEYS.SESSOES, JSON.stringify(sessoes));
        localStorage.setItem('gb_sessoescriadas', JSON.stringify(sessoes));
      }
    }
  } catch (err) {
    console.warn('Erro ao atualizar snapshots de sessoes:', err);
  }

  // 4. Atualiza no Supabase (se conectado)
  const client = getSupabaseClient();
  if (client) {
    try {
      const payload: Record<string, any> = {
        disciplina: novoBloco,
        assunto: novoAssunto,
      };
      if (novoCargo !== undefined) {
        payload.cargo = novoCargo;
      }

      const { error } = await client.from('questoes').update(payload).eq('id', questaoId);
      if (error) {
        console.warn('Aviso Supabase ao reclassificar questão:', error.message);
      }
    } catch (e: any) {
      console.warn('Exceção ao persistir no Supabase:', e);
    }
  }

  // 5. Notificação de sincronização na Nuvem
  notificarEnvioCloud({
    status: 'saved',
    message: `Questão reclassificada: ${novoAssunto}`,
  });

  return {
    success: true,
    questaoAtualizada,
  };
}

import { Questao, SessaoCriada } from '../types';
import { limparSintaxeLatex } from './latexSanitizer';
import {
  reclassificarQuestaoParaEscopoEstrito,
  reclassificarQuestoesParaEscopoEstrito,
} from './escopoConcurso';

export interface MetadadosProvaImportada {
  banca: string;
  ano: string | number;
  orgao: string;
  cargo: string;
  descricao?: string;
  gabaritoTexto?: string;
}

export interface QuestaoExtraidaRaw {
  numero?: number;
  disciplina?: string;
  assunto?: string;
  enunciado: string;
  alternativas: string[];
  correta: number;
  comentario?: string;
  noEscopo?: boolean;
  motivoForaEscopo?: string;
  desconsiderada?: boolean;
  blocoNome?: string;
  blocoNumero?: number;
  codigoPdf?: string;
}

export const STORAGE_KEY_PROVAS_CUSTOMIZADAS = 'gb_provas_customizadas_acervo';

/**
 * Gera a tag limpa e canônica para sessões de prova anterior
 * Ex: FAFIPA-2019-TIBAGI-ENG.CIVIL
 */
export function gerarTagSessaoProva(meta: MetadadosProvaImportada): string {
  // Banca
  const bancaUpper = (meta.banca || '').toUpperCase();
  let b = 'FAFIPA';
  if (bancaUpper.includes('FAFIPA')) {
    b = 'FAFIPA';
  } else if (bancaUpper.includes('CEBRASPE') || bancaUpper.includes('CESPE')) {
    b = 'CEBRASPE';
  } else if (bancaUpper.includes('FGV')) {
    b = 'FGV';
  } else if (bancaUpper.includes('VUNESP')) {
    b = 'VUNESP';
  } else {
    b = bancaUpper.replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'PROVA';
  }

  // Ano
  const a = String(meta.ano || '2019').replace(/\D/g, '').slice(0, 4) || '2019';

  // Órgão / Município
  const orgaoUpper = (meta.orgao || '').toUpperCase();
  let org = 'GERAL';
  if (orgaoUpper.includes('TIBAGI')) {
    org = 'TIBAGI';
  } else if (orgaoUpper.includes('CAMPOMAGRO') || orgaoUpper.includes('CAMPO MAGRO')) {
    org = 'CAMPOMAGRO';
  } else if (orgaoUpper.includes('ARAPONGAS')) {
    org = 'ARAPONGAS';
  } else if (orgaoUpper.includes('CURITIBA')) {
    org = 'CURITIBA';
  } else if (orgaoUpper.includes('PARANAEDUCACAO') || orgaoUpper.includes('EDUCA')) {
    org = 'PARANA';
  } else if (orgaoUpper.includes('SESA')) {
    org = 'SESA';
  } else {
    const limpo = orgaoUpper
      .replace(/^PREFEITURA\s*(MUNICIPAL)?\s*(DE|DO|DA)?\s*/i, '')
      .replace(/^CAMARA\s*(MUNICIPAL)?\s*(DE|DO|DA)?\s*/i, '')
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 15);
    org = limpo || 'GERAL';
  }

  // Cargo
  const cargoUpper = (meta.cargo || '').toUpperCase();
  let c = 'ENG.CIVIL';
  if (cargoUpper.includes('CIVIL')) {
    c = 'ENG.CIVIL';
  } else if (cargoUpper.includes('ENGENHEIRO') || cargoUpper.includes('ENGENHARIA')) {
    c = 'ENG';
  } else {
    c = cargoUpper.replace(/[^A-Z0-9]/g, '').slice(0, 10) || 'ENG.CIVIL';
  }

  return `${b}-${a}-${org}-${c}`;
}

/**
 * Formata o título em primeiro plano das sessões de provas anteriores para Aba 3
 * Ex: FAFIPA 2019 - Prefeitura de Tibagi - Engenheiro Civil
 */
export function formatarTituloVisualProva(s: {
  banca?: string;
  ano?: number | string;
  orgao?: string;
  cargo?: string;
  codigo?: string;
  assunto?: string;
}): string {
  // Banca
  let banca = 'FAFIPA';
  const bUpper = String(s.banca || '').toUpperCase();
  if (bUpper.includes('FAFIPA')) banca = 'FAFIPA';
  else if (bUpper.includes('CEBRASPE') || bUpper.includes('CESPE')) banca = 'CEBRASPE';
  else if (bUpper.includes('FGV')) banca = 'FGV';
  else if (bUpper.includes('VUNESP')) banca = 'VUNESP';
  else if (s.banca) banca = s.banca.replace(/\s*\(.*\)/, '').trim();

  // Ano
  let ano = '';
  if (s.ano) {
    ano = String(s.ano).slice(0, 4);
  } else {
    const cod = String(s.codigo || '') + ' ' + String(s.assunto || '');
    const match = cod.match(/\b(19\d\d|20\d\d)\b/);
    ano = match ? match[1] : '2019';
  }

  // Órgão
  let orgao = '';
  if (s.orgao && s.orgao.trim()) {
    orgao = s.orgao.trim();
  } else {
    // 1. Tenta extrair do assunto se já formatado no padrão "BANCA ANO - Órgão - Cargo"
    const partesAssunto = String(s.assunto || '').split(' - ');
    if (partesAssunto.length >= 3 && partesAssunto[1].trim()) {
      orgao = partesAssunto[1].trim();
    } else {
      const texto = (String(s.codigo || '') + ' ' + String(s.assunto || '')).toUpperCase();
      if (texto.includes('CAMPOMAGRO') || texto.includes('CAMPO MAGRO')) orgao = 'Prefeitura de Campo Magro';
      else if (texto.includes('ARAPONGAS')) orgao = 'Prefeitura de Arapongas';
      else if (texto.includes('TIBAGI')) orgao = 'Prefeitura de Tibagi';
      else if (texto.includes('CURITIBA')) orgao = 'Prefeitura de Curitiba';
      else if (texto.includes('PARANAEDUCACAO') || texto.includes('EDUCA')) orgao = 'PARANAEDUCAÇÃO';
      else if (texto.includes('SESA')) orgao = 'SESA';
      else {
        // Tenta extrair a 3ª parte do código "BANCA-ANO-ORGAO-CARGO"
        const partesCod = String(s.codigo || '').split('-');
        if (partesCod.length >= 3 && partesCod[2].trim()) {
          const rawOrg = partesCod[2].trim();
          const formatado = rawOrg.charAt(0).toUpperCase() + rawOrg.slice(1).toLowerCase();
          orgao = `Prefeitura de ${formatado}`;
        } else {
          orgao = 'Prefeitura Municipal';
        }
      }
    }
  }

  // Cargo
  let cargo = s.cargo || 'Engenheiro Civil';
  if (/engenheiro\s*civil/i.test(cargo)) cargo = 'Engenheiro Civil';
  else if (/engenheiro/i.test(cargo)) cargo = 'Engenheiro Civil';

  return `${banca} ${ano} - ${orgao} - ${cargo}`;
}

/**
 * Extrai e formata o badge discreto e minimalista para questões de prova real
 * Ex: 2019 • Prefeitura de Tibagi • Eng. Civil • FAFIPA
 */
export function formatarBadgeMinimalistaProva(q: Questao): {
  ano: string;
  orgao: string;
  cargo: string;
  banca: string;
  textoFormatado: string;
} | null {
  const isProva =
    q.origemTipo === 'prova_passada' ||
    q.tipo === 'prova_anterior' ||
    q.origem === 'prova_anterior' ||
    String(q.id).startsWith('prv_') ||
    String(q.id).startsWith('fafipa_') ||
    /prova real/i.test(q.artigo || '') ||
    /prova real/i.test(q.banca || '');

  if (!isProva) return null;

  // Ano
  let ano = q.ano ? String(q.ano) : '';
  if (!ano) {
    const match =
      String(q.artigo || '').match(/\b(19\d\d|20\d\d)\b/) ||
      String(q.id || '').match(/_(19\d\d|20\d\d)_/);
    ano = match ? match[1] : '2019';
  }

  // Órgão
  let orgao = q.orgao || '';
  if (!orgao) {
    const texto = (String(q.artigo || '') + ' ' + String(q.id || '')).toUpperCase();
    if (texto.includes('TIBAGI')) orgao = 'Prefeitura de Tibagi';
    else if (texto.includes('PARANAEDUCACAO') || texto.includes('EDUCA')) orgao = 'PARANAEDUCAÇÃO';
    else if (texto.includes('SESA')) orgao = 'SESA';
    else if (texto.includes('CURITIBA')) orgao = 'Prefeitura de Curitiba';
    else orgao = 'Prefeitura de Tibagi';
  }

  // Cargo
  let cargo = q.cargo || 'Eng. Civil';
  if (/engenheiro\s*civil/i.test(cargo)) cargo = 'Eng. Civil';

  // Banca
  let banca = 'FAFIPA';
  const bNorm = String(q.banca || '').toUpperCase();
  if (bNorm.includes('FAFIPA')) banca = 'FAFIPA';
  else if (bNorm.includes('CEBRASPE') || bNorm.includes('CESPE')) banca = 'CEBRASPE';
  else if (bNorm.includes('FGV')) banca = 'FGV';
  else if (bNorm.includes('VUNESP')) banca = 'VUNESP';
  else banca = q.banca ? q.banca.replace(/\s*\(.*\)/, '').slice(0, 10) : 'FAFIPA';

  return {
    ano,
    orgao,
    cargo,
    banca,
    textoFormatado: `${ano} • ${orgao} • ${cargo} • ${banca}`,
  };
}

/**
 * Converte texto livre de gabarito em um mapa de número -> letra ('A', 'B', 'C', 'D', 'E')
 * Suporta formatos:
 * - "1-A, 2-B, 3-C"
 * - "1: A\n2: B"
 * - "01. A 02. B"
 * - "Questão 1: Letra C"
 */
export function normalizarTextoGabaritoParaMapa(textoGabarito: string): Map<number, string> {
  const mapa = new Map<number, string>();
  if (!textoGabarito || typeof textoGabarito !== 'string') return mapa;

  // Regex robusto para capturar número de questão seguido de letra (A-E), aceitando
  // ": Letra B", "- Letra C", ". A", "= D", "01. B", "1 B"
  const padrao = /(?:quest[aã]o\s*)?0*(\d{1,3})\s*(?:[-:.)=]|\s)*\s*(?:(?:letra|alternativa|resposta)\s*)?([a-eA-E])\b/gi;
  let match: RegExpExecArray | null;

  while ((match = padrao.exec(textoGabarito)) !== null) {
    const num = parseInt(match[1], 10);
    const letra = match[2].toUpperCase();
    if (!isNaN(num) && num > 0) {
      mapa.set(num, letra);
    }
  }

  return mapa;
}

/**
 * Gera um ID canônico determinístico para questão de prova anterior
 * Ex: prv_fafipa_2024_eng_civil_q01
 */
export function gerarIdQuestaoProvaCanonica(
  banca: string,
  ano: string | number,
  cargo: string,
  numero: number
): string {
  const sanitize = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

  const b = sanitize(banca || 'prova').slice(0, 20);
  const c = sanitize(cargo || 'geral').slice(0, 25);
  const a = String(ano || new Date().getFullYear()).replace(/\D/g, '').slice(0, 4) || '2024';
  const n = String(numero).padStart(2, '0');

  return `prv_${b}_${a}_${c}_q${n}`;
}

/**
 * Converte as questões extraídas e metadados no formato final canônico de `Questao`
 */
export function formatarQuestoesExtraidasParaAcervo(
  rawQuestoes: QuestaoExtraidaRaw[],
  meta: MetadadosProvaImportada,
  gabaritoMapa?: Map<number, string>,
  apenasNoEscopo: boolean = false
): Questao[] {
  const letraParaIndice: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };

  const questoesValidas = rawQuestoes.filter((raw) => {
    if (raw.desconsiderada) return false;
    if (apenasNoEscopo && raw.noEscopo === false) return false;
    return true;
  });

  return questoesValidas.map((raw, idx) => {
    const num = raw.numero && raw.numero > 0 ? raw.numero : idx + 1;
    let correta = typeof raw.correta === 'number' && raw.correta >= 0 && raw.correta <= 4 ? raw.correta : 0;

    // Se houver gabarito oficial explícito para este número, sobrepõe com precisão
    if (gabaritoMapa && gabaritoMapa.has(num)) {
      const letra = gabaritoMapa.get(num)!;
      if (letraParaIndice[letra] !== undefined) {
        correta = letraParaIndice[letra];
      }
    }

    // Garante prefixos A), B), C), D), E) nas alternativas
    const alternativasFormatadas = (raw.alternativas || []).map((alt, aIdx) => {
      const letraEsperada = String.fromCharCode(65 + aIdx);
      const altLimpa = limparSintaxeLatex(alt).trim();
      if (/^[A-E]\)\s*/i.test(altLimpa)) {
        return altLimpa.replace(/^[a-e]\)/i, `${letraEsperada})`);
      }
      return `${letraEsperada}) ${altLimpa}`;
    });

    const canonicalId = gerarIdQuestaoProvaCanonica(meta.banca, meta.ano, meta.cargo, num);

    const qBruta: Questao = {
      id: canonicalId,
      banca: meta.banca.trim() || 'Fundação FAFIPA',
      ano: Number(meta.ano) || new Date().getFullYear(),
      orgao: meta.orgao.trim() || 'Prefeitura de Tibagi',
      cargo: meta.cargo.trim() || 'Engenheiro Civil',
      disciplina: (raw.blocoNome || raw.disciplina || 'Conhecimentos Específicos').trim(),
      assunto: (raw.assunto || 'Geral da Prova').trim(),
      enunciado: limparSintaxeLatex(raw.enunciado || '').trim(),
      alternativas: alternativasFormatadas,
      correta,
      comentario: limparSintaxeLatex(
        raw.comentario || `Gabarito oficial: alternativa ${String.fromCharCode(65 + correta)}.`
      ).trim(),
      tipo: 'prova_anterior',
      origem: 'prova_anterior',
      origemTipo: 'prova_passada',
      artigo: `Questão ${num} - Prova Real ${meta.banca} (${meta.ano})`,
    };

    // Reclassifica estritamente para os 34 PDFs oficiais
    return reclassificarQuestaoParaEscopoEstrito(qBruta, {
      ano: Number(meta.ano) || new Date().getFullYear(),
      orgao: meta.orgao.trim() || 'Prefeitura de Tibagi',
      banca: meta.banca.trim() || 'Fundação FAFIPA',
      cargo: meta.cargo.trim() || 'Engenheiro Civil',
    });
  });
}

/**
 * Cria a sessão de estudo correspondente para a prova importada
 * com a tag solicitada: FAFIPA-2019-TIBAGI-ENG.CIVIL
 */
export function criarSessaoProvaImportada(
  meta: MetadadosProvaImportada,
  questoes: Questao[]
): SessaoCriada {
  const codigo = gerarTagSessaoProva(meta);
  const tituloVisual = formatarTituloVisualProva({
    banca: meta.banca,
    ano: meta.ano,
    orgao: meta.orgao,
    cargo: meta.cargo,
    codigo,
  });

  return {
    id: `sessao_prv_${Date.now()}`,
    codigo,
    dataHora: new Date().toISOString(),
    banca: meta.banca || 'Fundação FAFIPA',
    cargo: meta.cargo || 'Engenheiro Civil',
    ano: Number(meta.ano) || 2019,
    orgao: meta.orgao || 'Prefeitura de Tibagi',
    disciplina: 'Conhecimentos Gerais e Específicos',
    assunto: tituloVisual,
    tipo: 'prova_anterior',
    quantidade: questoes.length,
    questaoIds: questoes.map((q) => q.id),
    questoesSnap: questoes,
    concluida: false,
    acertos: 0,
    erros: 0,
    tempoSegundos: 0,
  };
}

/**
 * Salva provas customizadas no LocalStorage
 */
export function salvarProvasCustomizadasLocalStorage(dados: {
  questoes: Questao[];
  sessoes: SessaoCriada[];
}): void {
  try {
    if (typeof window === 'undefined') return;
    const antigasRaw = localStorage.getItem(STORAGE_KEY_PROVAS_CUSTOMIZADAS);
    const antigas: { questoes: Questao[]; sessoes: SessaoCriada[] } = antigasRaw
      ? JSON.parse(antigasRaw)
      : { questoes: [], sessoes: [] };

    // Mescla garantindo IDs únicos
    const mapQ = new Map<string, Questao>();
    (antigas.questoes || []).forEach((q) => mapQ.set(String(q.id), q));
    dados.questoes.forEach((q) => mapQ.set(String(q.id), q));

    const mapS = new Map<string, SessaoCriada>();
    (antigas.sessoes || []).forEach((s) => mapS.set(String(s.codigo || s.id), s));
    dados.sessoes.forEach((s) => mapS.set(String(s.codigo || s.id), s));

    const payload = {
      questoes: Array.from(mapQ.values()),
      sessoes: Array.from(mapS.values()),
    };

    localStorage.setItem(STORAGE_KEY_PROVAS_CUSTOMIZADAS, JSON.stringify(payload));
  } catch (e) {
    console.warn('Erro ao salvar provas customizadas no localStorage:', e);
  }
}

/**
 * Carrega provas customizadas previamente salvas do LocalStorage
 */
export function carregarProvasCustomizadasLocalStorage(): {
  questoes: Questao[];
  sessoes: SessaoCriada[];
} {
  try {
    if (typeof window === 'undefined') return { questoes: [], sessoes: [] };
    const raw = localStorage.getItem(STORAGE_KEY_PROVAS_CUSTOMIZADAS);
    if (!raw) return { questoes: [], sessoes: [] };
    const parsed = JSON.parse(raw);
    return {
      questoes: Array.isArray(parsed?.questoes) ? parsed.questoes : [],
      sessoes: Array.isArray(parsed?.sessoes) ? parsed.sessoes : [],
    };
  } catch {
    return { questoes: [], sessoes: [] };
  }
}

/**
 * Higieniza e migra provas passadas (especialmente a sessão de 2019 da Prefeitura de Tibagi),
 * convertendo tags antigas (como PROVA-FUNDACAO-F-2019-ENGENHEIRO-C-U1FT) para o padrão
 * canônico 'FAFIPA-2019-TIBAGI-ENG.CIVIL', atribuindo o título visual em primeiro plano
 * e reclassificando todas as questões para as 34 matérias oficiais fechadas do edital.
 */
export function migrarESanitizarProvasPassadas(
  sessoes: SessaoCriada[],
  questoes: Questao[]
): {
  sessoesAtualizadas: SessaoCriada[];
  questoesAtualizadas: Questao[];
  alterou: boolean;
} {
  let alterou = false;

  const mapQ = new Map<string, Questao>();
  (questoes || []).forEach((q) => {
    if (q && q.id !== undefined && q.id !== null) {
      mapQ.set(String(q.id), q);
    }
  });

  const sessoesMapeadas = (sessoes || []).map((s) => {
    const codUpper = String(s.codigo || '').toUpperCase();
    const assUpper = String(s.assunto || '').toUpperCase();
    const discUpper = String(s.disciplina || '').toUpperCase();

    // Mapping for ParanaEducacao
    if (codUpper === 'PRV-2026-FAFIPA-PARANAEDUCACAO' || codUpper.includes('PARANAEDUCACAO')) {
      alterou = true;
      return {
        ...s,
        codigo: 'FAFIPA-2026-PARANAEDUCACAO-ENG.CIVIL',
        assunto: 'FAFIPA 2026 - PARANAEDUCAÇÃO - Engenheiro Civil',
        tipo: 'prova_anterior' as const,
      };
    }

    // Mapping for SESA
    if (codUpper === 'PRV-2026-FAFIPA-SESA' || codUpper.includes('FAFIPA-SESA')) {
      alterou = true;
      return {
        ...s,
        codigo: 'FAFIPA-2026-SESA-ENG.CIVIL',
        assunto: 'FAFIPA 2026 - SESA - Promotor de Saúde (Engenheiro Civil)',
        tipo: 'prova_anterior' as const,
      };
    }

    const isTibagi2019 =
      codUpper.includes('U1FT') ||
      codUpper.includes('PROVA-FUNDACAO-F-2019') ||
      codUpper === 'FAFIPA-2019-TIBAGI-ENG.CIVIL' ||
      ((codUpper.includes('TIBAGI') || assUpper.includes('TIBAGI')) &&
        (codUpper.includes('2019') || String(s.ano) === '2019') &&
        !codUpper.includes('CAMPOMAGRO') &&
        !assUpper.includes('CAMPO MAGRO') &&
        !codUpper.includes('ARAPONGAS') &&
        !assUpper.includes('ARAPONGAS'));

    if (isTibagi2019) {
      alterou = true;
      const novoCodigo = 'FAFIPA-2019-TIBAGI-ENG.CIVIL';
      const novoTitulo = 'FAFIPA 2019 - Prefeitura de Tibagi - Engenheiro Civil';

      const rawSnap = Array.isArray(s.questoesSnap) && s.questoesSnap.length > 0 ? s.questoesSnap : [];
      const snapReclassificado = reclassificarQuestoesParaEscopoEstrito(rawSnap, {
        ano: 2019,
        orgao: 'Prefeitura de Tibagi',
        banca: 'Fundação FAFIPA',
        cargo: 'Engenheiro Civil',
      }).map((q) => ({
        ...q,
        ano: 2019,
        orgao: 'Prefeitura de Tibagi',
        banca: 'Fundação FAFIPA',
        cargo: 'Engenheiro Civil',
        tipo: 'prova_anterior' as const,
        origem: 'prova_anterior',
        origemTipo: 'prova_passada' as const,
      }));

      snapReclassificado.forEach((q) => {
        mapQ.set(String(q.id), q);
      });

      return {
        ...s,
        codigo: novoCodigo,
        banca: 'Fundação FAFIPA',
        ano: 2019,
        orgao: 'Prefeitura de Tibagi',
        cargo: 'Engenheiro Civil',
        tipo: 'prova_anterior' as const,
        disciplina: 'Conhecimentos Gerais e Específicos',
        assunto: novoTitulo,
        questoesSnap: snapReclassificado.length > 0 ? snapReclassificado : s.questoesSnap,
      };
    }

    if (
      s.tipo === 'prova_anterior' ||
      codUpper.startsWith('PRV-') ||
      codUpper.startsWith('FAFIPA-') ||
      codUpper.startsWith('PROVA-')
    ) {
      const tituloAtualizado = formatarTituloVisualProva(s);
      if (s.assunto !== tituloAtualizado || s.tipo !== 'prova_anterior') {
        alterou = true;
        return {
          ...s,
          assunto: tituloAtualizado,
          tipo: 'prova_anterior' as const,
        };
      }
    }

    return s;
  });

  // Deduplica sessões por código para unificar instâncias legadas com a instância canônica
  const mapSessaoCod = new Map<string, SessaoCriada>();
  sessoesMapeadas.forEach((s) => {
    const key = String(s.codigo || s.id).toUpperCase();
    const existente = mapSessaoCod.get(key);
    if (!existente) {
      mapSessaoCod.set(key, s);
    } else {
      alterou = true;
      // Funde questaoIds e questoesSnap
      const qIdsExistente = Array.isArray(existente.questaoIds) ? existente.questaoIds : [];
      const qIdsNovos = Array.isArray(s.questaoIds) ? s.questaoIds : [];
      const mergedIds = Array.from(new Set([...qIdsExistente, ...qIdsNovos]));

      const snapsExistente = Array.isArray(existente.questoesSnap) ? existente.questoesSnap : [];
      const snapsNovos = Array.isArray(s.questoesSnap) ? s.questoesSnap : [];
      const snapMap = new Map<string, any>();
      [...snapsExistente, ...snapsNovos].forEach((sq) => {
        if (sq && sq.id != null) snapMap.set(String(sq.id), sq);
      });

      mapSessaoCod.set(key, {
        ...existente,
        questaoIds: mergedIds,
        questoesSnap: Array.from(snapMap.values()),
        quantidade: Math.max(existente.quantidade || 0, s.quantidade || 0, mergedIds.length),
      });
    }
  });

  const sessoesAtualizadas = Array.from(mapSessaoCod.values());

  const questoesAtualizadas = Array.from(mapQ.values()).map((q) => {
    const artUpper = String(q.artigo || '').toUpperCase();
    const idUpper = String(q.id || '').toUpperCase();
    const banUpper = String(q.banca || '').toUpperCase();

    const isTibagiOu2019 =
      idUpper.includes('TIBAGI') ||
      artUpper.includes('TIBAGI') ||
      idUpper.includes('U1FT') ||
      (banUpper.includes('FAFIPA') && (artUpper.includes('2019') || q.ano === 2019));

    if (isTibagiOu2019) {
      alterou = true;
      const reclassificada = reclassificarQuestaoParaEscopoEstrito(q, {
        ano: 2019,
        orgao: 'Prefeitura de Tibagi',
        banca: 'Fundação FAFIPA',
        cargo: 'Engenheiro Civil',
      });
      return {
        ...reclassificada,
        ano: 2019,
        orgao: 'Prefeitura de Tibagi',
        banca: 'Fundação FAFIPA',
        cargo: 'Engenheiro Civil',
        tipo: 'prova_anterior' as const,
        origem: 'prova_anterior',
        origemTipo: 'prova_passada' as const,
      };
    }

    if (q.origemTipo === 'prova_passada' || q.tipo === 'prova_anterior') {
      return reclassificarQuestaoParaEscopoEstrito(q);
    }

    return q;
  });

  if (alterou && typeof window !== 'undefined') {
    salvarProvasCustomizadasLocalStorage({
      questoes: questoesAtualizadas.filter(
        (q) => q.origemTipo === 'prova_passada' || q.tipo === 'prova_anterior'
      ),
      sessoes: sessoesAtualizadas.filter((s) => s.tipo === 'prova_anterior'),
    });
  }

  return { sessoesAtualizadas, questoesAtualizadas, alterou };
}

export type UserRole = 'ADMIN' | 'USER';

export interface UserProfile {
  id: string;
  email: string;
  nome: string;
  username: string;
  celular: string;
  role: UserRole;
  avatarUrl?: string;
  created_at?: string;
}

export interface Banca {
  id: number | string;
  created_at?: string;
  user_email?: string;
  user_id?: string;
  nome: string;
  cargo?: string;
  arquivos: string[];
  obs: string;
}

export interface Bloco {
  id: number | string;
  created_at?: string;
  user_email?: string;
  user_id?: string;
  nome: string;
  descricao?: string;
}

export interface Materia {
  id: number | string;
  created_at?: string;
  user_email?: string;
  user_id?: string;
  blocoId?: number | string;
  blocoNome: string;
  nome: string;
  arquivoNome: string;
  arquivoTexto?: string;
  arquivoBase64?: string;
  arquivoTipo?: string;
  tamanhoBytes?: number;
}

export type OrigemTipoQuestao = 'prova_passada' | 'sessao_avulsa' | 'simulado' | 'lote_escala';

export interface Questao {
  id: number | string;
  created_at?: string;
  user_email?: string;
  user_id?: string;
  banca: string;
  cargo?: string;
  disciplina: string;
  assunto: string;
  artigo: string;
  enunciado: string;
  alternativas: string[];
  correta: number; // 0 for A, 1 for B, 2 for C, etc.
  comentario: string;
  tipo?: 'estudo' | 'simulado' | 'prova_anterior';
  origem?: string;
  origemTipo?: OrigemTipoQuestao;
  hash_enunciado?: string;
  loteCodigo?: string;
  ano?: number;
  orgao?: string;
}

export interface SessaoCriada {
  id?: number | string;
  created_at?: string;
  user_email?: string;
  user_id?: string;
  codigo: string;
  dataHora: string;
  banca: string;
  cargo?: string;
  disciplina: string;
  assunto: string;
  quantidade: number;
  questaoIds: (number | string)[];
  tipo?: 'sessao' | 'simulado' | 'prova_anterior' | 'sessao_escala';
  tempoSegundos?: number;
  concluida?: boolean;
  taxaAcerto?: number;
  acertos?: number;
  erros?: number;
  questoesSnap?: Questao[];
  ano?: number;
  orgao?: string;
}

export interface RegistroTempoSessao {
  id: string;
  tipo?: 'sessao' | 'banco' | 'caderno' | 'simulado' | 'prova_anterior' | 'sessao_escala';
  questaoId?: string | number;
  sessaoId?: string | number;
  codigo?: string;
  titulo: string;
  segundos: number;
  data: number; // timestamp
  concluida?: boolean;
  totalQuestoes?: number;
  acertos?: number;
  erros?: number;
  taxaAcerto?: number;
  user_email?: string;
  disciplina?: string;
  assunto?: string;
  banca?: string;
}

export interface TentativaResposta {
  id?: number | string;
  created_at?: string;
  user_email?: string;
  user_id?: string;
  questaoId?: number | string;
  escolha: number;
  acertou: boolean;
  data: number;
  tempoSegundos?: number;
  origem?: 'caderno' | 'banco' | 'sessao' | 'simulado' | 'prova_anterior' | 'sessao_escala';
}

export type HistoricoRespostasMap = Record<string | number, TentativaResposta[]>;

export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  geminiApiKey: string;
}

export type CorGrifo = 'yellow' | 'green' | 'pink' | 'cyan';

export interface GrifoQuestao {
  id: string;
  questaoId: number | string;
  cor: CorGrifo;
  texto: string;
  startIndex: number;
  endIndex: number;
  created_at?: number;
}

export type MapaGrifosQuestoes = Record<string, GrifoQuestao[]>;


export const SUPABASE_SQL_SCRIPT = `-- ============================================================
-- SCRIPT SQL DE CRIAÇÃO E ATUALIZAÇÃO - GBQUEST (SUPABASE)
-- Execute este script no SQL Editor do seu projeto Supabase
-- ============================================================

-- 1. Tabela de Usuários e Perfis de Acesso
CREATE TABLE IF NOT EXISTS public.usuarios (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    email TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    username TEXT NOT NULL,
    celular TEXT DEFAULT '',
    senha TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER'
);

-- 2. Tabela de Bancas e Perfis
CREATE TABLE IF NOT EXISTS public.bancas (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    user_email TEXT DEFAULT '',
    nome TEXT NOT NULL,
    cargo TEXT DEFAULT '',
    arquivos JSONB NOT NULL DEFAULT '[]'::jsonb,
    obs TEXT DEFAULT ''
);

-- 3. Tabela de Blocos de Estudo (Disciplinas organizadas)
CREATE TABLE IF NOT EXISTS public.blocos (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    user_email TEXT DEFAULT '',
    nome TEXT NOT NULL,
    descricao TEXT DEFAULT ''
);

-- 4. Tabela de Matérias & Leis (Arquivos e PDFs)
CREATE TABLE IF NOT EXISTS public.materias (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    user_email TEXT DEFAULT '',
    bloco_id BIGINT,
    bloco_nome TEXT DEFAULT '',
    nome TEXT NOT NULL,
    arquivo_nome TEXT DEFAULT '',
    arquivo_texto TEXT DEFAULT '',
    arquivo_tipo TEXT DEFAULT 'application/pdf',
    tamanho_bytes BIGINT DEFAULT 0
);

-- 5. Tabela do Banco de Questões
CREATE TABLE IF NOT EXISTS public.questoes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    user_email TEXT DEFAULT '',
    banca TEXT NOT NULL,
    cargo TEXT DEFAULT '',
    disciplina TEXT NOT NULL,
    assunto TEXT NOT NULL,
    artigo TEXT NOT NULL,
    enunciado TEXT NOT NULL,
    alternativas JSONB NOT NULL DEFAULT '[]'::jsonb,
    correta INTEGER NOT NULL DEFAULT 0,
    comentario TEXT NOT NULL
);

-- 6. Tabela de Sessões Criadas (Cadernos de Treino)
CREATE TABLE IF NOT EXISTS public.sessoes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    user_email TEXT DEFAULT '',
    codigo TEXT NOT NULL,
    data_hora TEXT NOT NULL,
    banca TEXT NOT NULL,
    cargo TEXT DEFAULT '',
    disciplina TEXT NOT NULL,
    assunto TEXT NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 10,
    questao_ids JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 7. Tabela de Histórico de Respostas dos Usuários
CREATE TABLE IF NOT EXISTS public.historico_respostas (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    user_email TEXT DEFAULT '',
    questao_id BIGINT NOT NULL,
    escolha INTEGER NOT NULL,
    acertou BOOLEAN NOT NULL,
    data BIGINT NOT NULL
);

-- 8. Tabela de Grifos e Destaques em Questões
CREATE TABLE IF NOT EXISTS public.grifos_questoes (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    user_email TEXT DEFAULT '',
    questao_id BIGINT NOT NULL,
    cor TEXT NOT NULL,
    texto TEXT NOT NULL,
    start_index INTEGER NOT NULL DEFAULT 0,
    end_index INTEGER NOT NULL DEFAULT 0
);

-- 9. Adição de Colunas para Bancos já existentes (Compatibilidade Automática)
ALTER TABLE public.bancas ADD COLUMN IF NOT EXISTS user_email TEXT DEFAULT '';
ALTER TABLE public.bancas ADD COLUMN IF NOT EXISTS cargo TEXT DEFAULT '';

ALTER TABLE public.questoes ADD COLUMN IF NOT EXISTS user_email TEXT DEFAULT '';
ALTER TABLE public.questoes ADD COLUMN IF NOT EXISTS cargo TEXT DEFAULT '';

ALTER TABLE public.sessoes ADD COLUMN IF NOT EXISTS user_email TEXT DEFAULT '';
ALTER TABLE public.sessoes ADD COLUMN IF NOT EXISTS cargo TEXT DEFAULT '';

ALTER TABLE public.historico_respostas ADD COLUMN IF NOT EXISTS user_email TEXT DEFAULT '';
ALTER TABLE public.historico_respostas ADD COLUMN IF NOT EXISTS tempo_segundos INTEGER DEFAULT 0;
ALTER TABLE public.historico_respostas ADD COLUMN IF NOT EXISTS origem TEXT DEFAULT '';

-- 9. MIGRACÃO AUTOMÁTICA: Transferir 100% dos dados legados para o perfil Administrador (Gabriel)
UPDATE public.bancas 
SET user_email = 'gahenrique.eng@gmail.com' 
WHERE user_email IS NULL OR user_email = '' OR user_email = 'undefined';

UPDATE public.questoes 
SET user_email = 'gahenrique.eng@gmail.com' 
WHERE user_email IS NULL OR user_email = '' OR user_email = 'undefined';

UPDATE public.sessoes 
SET user_email = 'gahenrique.eng@gmail.com' 
WHERE user_email IS NULL OR user_email = '' OR user_email = 'undefined';

UPDATE public.historico_respostas 
SET user_email = 'gahenrique.eng@gmail.com' 
WHERE user_email IS NULL OR user_email = '' OR user_email = 'undefined';

UPDATE public.blocos 
SET user_email = 'gahenrique.eng@gmail.com' 
WHERE user_email IS NULL OR user_email = '' OR user_email = 'undefined';

UPDATE public.materias 
SET user_email = 'gahenrique.eng@gmail.com' 
WHERE user_email IS NULL OR user_email = '' OR user_email = 'undefined';

-- 10. Inserir Conta de Administrador Padrão se não existir
INSERT INTO public.usuarios (email, nome, username, celular, senha, role)
VALUES ('gahenrique.eng@gmail.com', 'Gabriel', 'Gabriel', '(41) 9 9790 9082', 'adm123', 'ADMIN')
ON CONFLICT (email) DO UPDATE 
SET role = 'ADMIN', nome = 'Gabriel', username = 'Gabriel', celular = '(41) 9 9790 9082';

-- 11. Índices para Otimização de Busca e Isolamento de Usuários
CREATE INDEX IF NOT EXISTS idx_bancas_user_email ON public.bancas(user_email);
CREATE INDEX IF NOT EXISTS idx_blocos_user_email ON public.blocos(user_email);
CREATE INDEX IF NOT EXISTS idx_materias_user_email ON public.materias(user_email);
CREATE INDEX IF NOT EXISTS idx_questoes_user_email ON public.questoes(user_email);
CREATE INDEX IF NOT EXISTS idx_sessoes_user_email ON public.sessoes(user_email);
CREATE INDEX IF NOT EXISTS idx_historico_user_email ON public.historico_respostas(user_email);

-- 12. Habilitação de Políticas de Segurança (Row Level Security - RLS)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grifos_questoes ENABLE ROW LEVEL SECURITY;

-- 13. Políticas de Acesso com Anon Key
DROP POLICY IF EXISTS "Permitir acesso anonimo a usuarios" ON public.usuarios;
CREATE POLICY "Permitir acesso anonimo a usuarios" ON public.usuarios FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura anonima de bancas" ON public.bancas;
CREATE POLICY "Permitir leitura anonima de bancas" ON public.bancas FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura anonima de blocos" ON public.blocos;
CREATE POLICY "Permitir leitura anonima de blocos" ON public.blocos FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura anonima de materias" ON public.materias;
CREATE POLICY "Permitir leitura anonima de materias" ON public.materias FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura anonima de questoes" ON public.questoes;
CREATE POLICY "Permitir leitura anonima de questoes" ON public.questoes FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura anonima de sessoes" ON public.sessoes;
CREATE POLICY "Permitir leitura anonima de sessoes" ON public.sessoes FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura anonima de historico" ON public.historico_respostas;
CREATE POLICY "Permitir leitura anonima de historico" ON public.historico_respostas FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura anonima de grifos" ON public.grifos_questoes;
CREATE POLICY "Permitir leitura anonima de grifos" ON public.grifos_questoes FOR ALL TO anon USING (true) WITH CHECK (true);

COMMENT ON TABLE public.usuarios IS 'Perfis de usuários GBQuest com hierarquia ADMIN e USER';
`;

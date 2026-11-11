# Plano de Correção Crítica: Persistência em Guia Anônima, Pós-Login e Restauração de Backup JSON

Plano de implementação para blindar a conexão com o Supabase quando o cache é limpo ou ao navegar em modo anônimo, acionar a hidratação de dados automaticamente após login e permitir restauração física direta de backup JSON com sincronização em nuvem.

### User Review & Critical Decisions

> [!IMPORTANT]
> **Parâmetros e Decisões Confirmados pelo Usuário:**
> 1. **Fallback Padrão de Credenciais do Supabase:**
>    - `Project URL`: `https://ajvvzmjvyvdvoistansh.supabase.co`
>    - `Anon / Publishable Key`: `sb_publishable_HkC6HGVK1gHSZn-SP7mBLw_RoAbVaWx`
>    - Fixadas diretamente como fallback padrão em `src/services/supabaseClient.ts` e `server.ts`. O app nunca mais dependerá exclusivamente do `localStorage` para conseguir conectar ao Supabase em guias anônimas ou novos dispositivos.
> 2. **Gatilho de Hidratação no Boot e Pós-Login (`onAuthStateChange`):**
>    - No carregamento inicial (`inicializar()`) e no evento de autenticação (`handleAuthChange`), o app verifica se o cache local está zerado/incompleto e executa `hidratarCacheLocalDoSupabase()` **antes** de qualquer tentativa de persistência local/nuvem.
>    - Nas consultas de leitura (`carregarQuestoes`, `carregarSessoes`, `carregarHistorico`), a busca não bloqueará por divergência de `user_id` / `user_email`, trazendo integralmente o acervo de questões, sessões e histórico existentes no banco.
> 3. **Trava de Proteção Contra Sobrescrita Vazia:**
>    - Qualquer rotina de sync ou upsert para a nuvem terá bloqueio estrito se o total local de questões for `0`, prevenindo que estados não inicializados apaguem a nuvem.
> 4. **Botão "Restaurar Backup (JSON)":**
>    - Implementado no modal de Configurações ao lado de "Baixar Backup Local (JSON)".
>    - Ao selecionar o arquivo `.json`:
>      1. Valida o formato e integridade dos dados (questões, sessões, histórico).
>      2. Atualiza imediatamente o `localStorage`.
>      3. Emite `gb_dados_hidratados_da_nuvem` para reatividade instantânea da interface React.
>      4. Dispara `sincronizacaoBidirecionalIncremental()` para sincronizar (upsert) tudo com o Supabase.

---

### 1. Overview & Core Concept

- **Problema:** Ao limpar o cache ou navegar em guia anônima, as chaves do Supabase armazenadas no `localStorage` eram perdidas, e o evento de login não disparava a hidratação da nuvem. O usuário logava e via a aplicação vazia com 0 questões.
- **Solução:** 
  1. Definir as credenciais do Supabase como fallback estático nativo do projeto.
  2. Amarrar a rotina de hidratação tanto à montagem da aplicação quanto ao evento de transição de autenticação.
  3. Garantir flexibilidade nas consultas do Supabase para acervo compartilhado de questões do concurso.
  4. Adicionar restauração imediata a partir de arquivo de backup JSON físico com merge bidirecional.

---

### 2. User Experience & Visual Design

- **Modal de Configurações (Aba Conexão Nuvem):**
  - No card de **Backup de Segurança Físico (JSON)**:
    - **Botão 1 (Existente):** `Baixar Backup Local (JSON)` (ícone de download).
    - **Botão 2 (Novo):** `Restaurar Backup (JSON)` (ícone `fa-upload`, cor azul/esmeralda, acoplado a input invisível `.json`).
  - Durante a restauração: indicador de leitura do arquivo, toast de sucesso informando quantidade de questões, sessões e histórico restaurados, e acionamento automático da sincronização com Supabase.
- **Experiência em Guia Anônima:**
  - O app já abre com status de conexão verde ao Supabase.
  - Ao realizar login com a conta de Administrador ou Google, a hidratação correta é disparada imediatamente, exibindo todas as questões, cadernos e simulados sem exigir nenhum clique manual em botões de sync.

---

### 3. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PERSISTÊNCIA RESILIENTE EM 3 NÍVEIS                  │
└────────────────────────────────────────────────────────────────────────┘

  [ Guia Anônima / Cache Limpo ]
              │
              ▼
  ┌────────────────────────────────────────────────────────┐
  │ 1. Fallback Estático de Credenciais                     │
  │    URL: https://ajvvzmjvyvdvoistansh.supabase.co       │
  │    KEY: sb_publishable_...                             │
  │    ➔ Supabase Client Conectado Imediatamente           │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ 2. Eventos de Inicialização & Login                    │
  │    • inicializar() no mount                            │
  │    • handleAuthChange() ao logar                       │
  │    ➔ Se cache vazio: hidratarCacheLocalDoSupabase()    │
  │    ➔ Sem filtro bloqueador de user_id                  │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │ 3. Restauração de Emergência (Arquivo .JSON)           │
  │    • Importa JSON via FileReader                       │
  │    • Grava no localStorage                             │
  │    • Atualiza React State (gb_dados_hidratados)        │
  │    • Executa Upsert Incremental na Nuvem               │
  └────────────────────────────────────────────────────────┘
```

#### Arquivos a Modificar:
1. `src/services/supabaseClient.ts`:
   - Configurar `DEFAULT_SUPABASE_URL` e `DEFAULT_SUPABASE_ANON_KEY` com os valores fornecidos pelo usuário.
   - Ajustar `getAppConfig()` para retornar os padrões se não houver dados no `localStorage`.
   - Em `carregarQuestoes()`, `carregarSessoes()` e `carregarHistorico()`, tornar a busca resiliente a diferenças ou ausência de `user_email`.
   - Adicionar trava de segurança no `salvarNovasQuestoesDb`, `sincronizacaoBidirecionalIncremental` e afins para recusar operações com acervo vazio (`questoes.length === 0`).
   - Implementar `restaurarBackupLocalJson(conteudoJson: string)` que valida, hidrata o cache e roda o upsert na nuvem.
2. `server.ts`:
   - Configurar os mesmos fallbacks de URL e Anon Key no servidor.
3. `src/App.tsx`:
   - Adicionar a chamada de `hidratarCacheLocalDoSupabase()` dentro de `handleAuthChange` quando `updated != null` e o cache estiver sem questões.
   - Garantir que a inicialização execute a hidratação antes de setar `loadingData(false)`.
4. `src/components/SettingsModal.tsx`:
   - Adicionar o botão "Restaurar Backup (JSON)" ao lado do botão de download, com input de arquivo oculto e feedback de progresso/sucesso.
5. `src/services/persistenceIncrementalSync.test.ts`:
   - Adicionar testes automatizados cobrindo a restauração via JSON, detecção de fallbacks de credenciais e a trava contra sincronização com acervo vazio.

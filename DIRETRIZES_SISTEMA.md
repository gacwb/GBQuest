# Diretrizes de Engenharia e Arquitetura do Sistema

Este documento registra as diretrizes de qualidade, prevenção de regressão e resiliência adotadas no desenvolvimento do aplicativo.

---

## 1. Regra de Ouro: Prevenção de Regressão com Testes Automatizados
* Toda vez que um bug for corrigido ou uma nova ferramenta/recurso for integrado, é **obrigatório** criar ou atualizar um teste automatizado correspondente (`src/**/*.test.ts`) para validar o comportamento e evitar que o erro volte a ocorrer em interações futuras.
* A suíte de testes deve permanecer 100% verde antes de qualquer entrega.

---

## 2. Protocolo de Resiliência de IA e Transparência de Cota (Anti-Silent Fallback)

### A. Proibição Absoluta de Fallbacks Silenciosos Degradados
* **Regra**: Erros temporários de infraestrutura (429 Rate Limit, 503 Overloaded, 504 Gateway Timeout) **NUNCA** podem degradar a qualidade do dado gerado ou substituir a IA por modelos estáticos/genéricos de forma oculta.
* **Comportamento Obrigatório**:
  1. O sistema deve pausar o fluxo de geração imediatamente;
  2. Notificar visualmente o usuário na interface com mensagem explícita: `"Limite temporário de taxa atingido. Aguardando renovação da cota da API em X segundos (Tentativa N de 3)..."`;
  3. Aplicar *Exponential Backoff* (pausa de 15 segundos);
  4. Retomar a chamada com a IA real do Gemini.
  5. Fallback estático é expressamente proibido para lidar com erros de cota de API.

### B. Disciplina de Vazão e Economia de Cabeçalho (Batch Efficiency)
* Em qualquer operação em lote ou geração volumosa (acima de 10 questões):
  1. **Agrupamento de Requisições**: As questões devem ser geradas em blocos (ex: 5 questões por chamada), amortizando o custo de retransmissão de cabeçalhos institucionais e diretrizes do edital em até 80%;
  2. **Intervalo Mínimo de Segurança**: Deve existir um delay programado entre chamadas (mínimo de 2.500ms a 3.500ms) para evitar picos de Tokens por Minuto (TPM) e Requisições por Minuto (RPM);
  3. **Operação em Zona Verde**: O consumo máximo previsto deve operar sempre abaixo de 50% dos limites de Nível 1 da API Google Gemini.

### C. Higienização Normativa Obrigatória de Metadados
* **Regra**: Nenhum identificador interno, nome bruto de arquivo (ex: `314_Analise_Estrutural`, `731_Portugues`), prefixo numérico ou extensão pode vazar para enunciados, alternativas ou comentários de questões.
* **Mapeamento Obrigatório**: O sistema deve utilizar dicionário sanitizador com a nomenclatura formal, técnica e acadêmica correspondente antes da elaboração do prompt e da renderização na interface.

### D. Transparência Operacional com ETA Real (Estimated Time of Arrival)
* Toda operação em lote deve informar, além da porcentagem (`0% a 100%`), o **Tempo Restante Estimado (ETA em minutos)** calculado dinamicamente com base na velocidade média real observada e o tempo decorrido.

---

## 3. Protocolo de Integridade do Banco e Prevenção de Duplicações Infinitas (Idempotência de Seed e Sincronização)

### A. Idempotência Obrigatória em Sementes Estáticas
* **Causa Raiz Prevenida**: Questões estáticas de provas anteriores (74 questões reais FAFIPA) possuíam IDs em string (`fafipa_educa_...`) e eram inseridas no Supabase sem ID explícito a cada reload. Como o Supabase gerava IDs numéricos seriais, o check `idSet.has('fafipa_...')` falhava a cada abertura de página, re-inserindo as 74 questões em loop (atingindo 1.623 réplicas).
* **Regra**: Questões de seed estático nunca devem ser auto-inseridas repetidamente no banco em segundo plano. Qualquer verificação de existência deve ser feita pelo **enunciado normalizado** (`normalizarEnunciadoParaDeduplicacao`).

### B. Preservação Mandatória do Histórico do Usuário
* Ao deduplicar ou expurgar registros excedentes no banco de questões, a questão que detém tentativas de resposta no `historico_respostas` é categorizada como canônica.
* Nenhuma resposta do usuário, taxa de acerto ou erro pode ser perdida. Cópias adicionais são consolidadas e qualquer tentativa em réplicas é reatribuída para a questão canônica.
* As referências em sessões (`questaoIds`) são remapeadas para o ID canônico preservado.

---

## 4. Diretriz Universal de Geração Paramétrica da Banca (FAFIPA Curitiba)

### A. Régua de Dificuldade Calibrada (40% Fácil / 40% Média / 20% Cascuda)
* **Regra Universal**: Todo e qualquer mecanismo de geração de questões novas (sessões avulsas de 1 assunto, simulados oficiais ou lotes de 500Q em escala) deve aplicar rigorosamente a proporção:
  * **40% FÁCEIS**: Conceitos nucleares, definições diretas, regras e competências básicas do tema;
  * **40% MÉDIAS**: Casos práticos hipotéticos de rotina, prazos, procedimentos formais e aplicação direta da norma;
  * **20% CASCUDAS (DIFÍCEIS)**: Casos analíticos complexos de fiscalização, assertivas analíticas múltiplas (I, II e III), pegadinhas sutis de competência versus atribuição e exceções normativas expressas.

### B. Proibição de Cálculos Pesados nas Matérias Específicas de Engenharia Civil
* É expressamente proibido exigir cálculos manuais extensos, integração/diferenciação ou fórmulas longas. O foco da banca FAFIPA é em **interpretação de conformidade técnica, normas ABNT/NBR, especificações de materiais, planejamento, execução e fiscalização de obras públicas e contratos administrativos**.

### C. Gabarito Rigorosamente Balanceado e Sanitização
* Gabaritos devem possuir distribuição uniforme e equilibrada entre as alternativas (A, B, C, D, E), sendo proibida concentração em letras específicas.
* Nomes brutos de arquivos (ex: `731_`, `314_`) devem ser sempre sanitizados para a nomenclatura acadêmica e formal correspondente.


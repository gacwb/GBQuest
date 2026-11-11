import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  gerarDistribuicaoGabaritoBalanceada,
  formatarInstrucaoDistribuicaoGabarito,
  garantirDistribuicaoUniforme,
} from './src/utils/gabaritoRandomizer';
import { limparSintaxeLatex } from './src/utils/latexSanitizer';
import { verificarEscopoQuestao } from './src/utils/escopoConcurso';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLOUD_CONFIG_PATH = path.join(__dirname, '.cloud-config.json');

function readStoredCloudConfig(): { supabaseUrl?: string; supabaseAnonKey?: string; geminiApiKey?: string } {
  try {
    if (fs.existsSync(CLOUD_CONFIG_PATH)) {
      const raw = fs.readFileSync(CLOUD_CONFIG_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Erro ao ler .cloud-config.json:', e);
  }
  return {};
}

function writeStoredCloudConfig(cfg: { supabaseUrl?: string; supabaseAnonKey?: string; geminiApiKey?: string }) {
  try {
    fs.writeFileSync(CLOUD_CONFIG_PATH, JSON.stringify(cfg, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Erro ao gravar .cloud-config.json:', e);
  }
}

// In-memory cache of cloud config
let inMemoryCloudConfig: { supabaseUrl?: string; supabaseAnonKey?: string; geminiApiKey?: string } = readStoredCloudConfig();

function getCleanSupabaseClient(): SupabaseClient | null {
  const url = (inMemoryCloudConfig.supabaseUrl || process.env.VITE_SUPABASE_URL || '')
    .trim()
    .replace(/\/rest\/v1\/?$/, '')
    .replace(/\/$/, '');
  const key = (inMemoryCloudConfig.supabaseAnonKey || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  if (url && key && url.startsWith('http')) {
    try {
      return createClient(url, key, { auth: { persistSession: false } });
    } catch {
      return null;
    }
  }
  return null;
}

// Loads shared Gemini API Key persisted in Supabase
async function loadSystemConfigFromSupabase(): Promise<string | null> {
  const client = getCleanSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('bancas')
      .select('obs')
      .eq('nome', '__SYSTEM_CONFIG__')
      .maybeSingle();
    if (!error && data?.obs && data.obs.trim().length > 10) {
      const key = data.obs.trim();
      inMemoryCloudConfig.geminiApiKey = key;
      writeStoredCloudConfig(inMemoryCloudConfig);
      console.log('Chave Gemini compartilhada carregada do Supabase com sucesso.');
      return key;
    }
  } catch (e) {
    console.warn('Aviso: Não foi possível consultar chave no Supabase:', e);
  }
  return null;
}

// Saves shared Gemini API Key persistently in Supabase
async function saveSystemConfigToSupabase(geminiApiKey: string) {
  const client = getCleanSupabaseClient();
  if (!client || !geminiApiKey) return;
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
    console.log('Chave Gemini compartilhada gravada com sucesso no Supabase.');
  } catch (e) {
    console.warn('Aviso ao salvar chave no Supabase:', e);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Support JSON and base64 payloads up to 50mb
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Pre-load shared key from Supabase on startup
  loadSystemConfigFromSupabase().catch(() => {});

  // Shared Cloud Config for all devices (computers, cellphones, tablets, and all users)
  app.get('/api/cloud-config', async (_req: Request, res: Response) => {
    if (!inMemoryCloudConfig.geminiApiKey) {
      await loadSystemConfigFromSupabase();
    }
    const supabaseUrl = inMemoryCloudConfig.supabaseUrl || process.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = inMemoryCloudConfig.supabaseAnonKey || process.env.VITE_SUPABASE_ANON_KEY || '';
    const geminiApiKey = inMemoryCloudConfig.geminiApiKey || '';
    res.json({
      supabaseUrl,
      supabaseAnonKey,
      geminiApiKey,
      hasConfig: Boolean(supabaseUrl && supabaseAnonKey),
      hasGeminiKey: Boolean(geminiApiKey || (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY')),
    });
  });

  app.post('/api/cloud-config', async (req: Request, res: Response) => {
    const { supabaseUrl, supabaseAnonKey, geminiApiKey } = req.body;
    inMemoryCloudConfig = {
      ...inMemoryCloudConfig,
      ...(supabaseUrl !== undefined ? { supabaseUrl: String(supabaseUrl).trim() } : {}),
      ...(supabaseAnonKey !== undefined ? { supabaseAnonKey: String(supabaseAnonKey).trim() } : {}),
      ...(geminiApiKey !== undefined ? { geminiApiKey: String(geminiApiKey).trim() } : {}),
    };
    writeStoredCloudConfig(inMemoryCloudConfig);

    if (geminiApiKey && String(geminiApiKey).trim().length > 10) {
      await saveSystemConfigToSupabase(String(geminiApiKey).trim());
    }

    res.json({
      success: true,
      message: 'Configuração gravada no servidor e banco de dados com sucesso. Compartilhada com todos os usuários.',
      config: {
        supabaseUrl: inMemoryCloudConfig.supabaseUrl,
        hasKey: Boolean(inMemoryCloudConfig.supabaseAnonKey),
        hasGeminiKey: Boolean(inMemoryCloudConfig.geminiApiKey),
      },
    });
  });

  // Status check for server-configured keys
  app.get('/api/config-status', (_req: Request, res: Response) => {
    const stored = readStoredCloudConfig();
    const supabaseUrl = stored.supabaseUrl || process.env.VITE_SUPABASE_URL || '';
    res.json({
      hasServerGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      hasServerSupabaseUrl: Boolean(supabaseUrl),
    });
  });

  // TEST GEMINI API KEY ENDPOINT
  app.post('/api/test-gemini', async (req: Request, res: Response): Promise<void> => {
    try {
      const { customApiKey } = req.body;
      let apiKeyToUse = customApiKey || inMemoryCloudConfig.geminiApiKey;
      if (!apiKeyToUse) {
        apiKeyToUse = (await loadSystemConfigFromSupabase()) || process.env.GEMINI_API_KEY;
      }

      if (!apiKeyToUse || apiKeyToUse === 'MY_GEMINI_API_KEY') {
        res.status(400).json({
          success: false,
          error: 'Nenhuma chave da API informada. Cole sua chave nos campos abaixo ou salve nas Configurações.',
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: apiKeyToUse,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      let responseText = 'OK';
      let lastErr: any = null;
      const modelsToTry = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];

      for (let attempt = 0; attempt < 2; attempt++) {
        for (const m of modelsToTry) {
          try {
            const resp = await ai.models.generateContent({
              model: m,
              contents: 'Ping: responda apenas "OK"',
            });
            responseText = resp.text?.trim() || 'OK';
            lastErr = null;
            break;
          } catch (e: any) {
            lastErr = e;
          }
        }
        if (!lastErr) break;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (lastErr) {
        throw lastErr;
      }

      res.json({
        success: true,
        message: 'Chave do Gemini validada com sucesso! Conexão com a IA ativa.',
        response: responseText,
      });
    } catch (err: any) {
      console.error('Erro ao testar chave Gemini:', err);
      let errorMsg = err.message || 'Erro ao validar chave Gemini.';
      try {
        const parsed = JSON.parse(errorMsg);
        if (parsed.error?.message) errorMsg = parsed.error.message;
      } catch {}

      if (errorMsg.includes('Lightning dunning') || errorMsg.includes('dunning')) {
        errorMsg = 'A chave do ambiente padrão está indisponível. Por favor, insira sua chave pessoal do Gemini nas Configurações para utilizar seus créditos próprios.';
      }

      res.status(400).json({
        success: false,
        error: errorMsg,
      });
    }
  });

  // REAL GEMINI API CALL FOR GENERATING CONTEST QUESTIONS
  app.post('/api/generate-questions', async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        banca = 'Banca Padrão',
        disciplina = 'Geral',
        assunto = 'Legislação',
        cargo = '',
        direcionamentoAdicional = '',
        quantidade = 10,
        observacoesBanca = '',
        questoesExistentes = [],
        fileText = '',
        fileBase64 = '',
        mimeType = 'application/pdf',
        customApiKey = '',
      } = req.body;

      let apiKeyToUse = customApiKey || inMemoryCloudConfig.geminiApiKey;
      if (!apiKeyToUse) {
        apiKeyToUse = (await loadSystemConfigFromSupabase()) || process.env.GEMINI_API_KEY;
      }

      if (!apiKeyToUse || apiKeyToUse === 'MY_GEMINI_API_KEY') {
        res.status(400).json({
          error: 'A chave da API do Gemini ainda não foi configurada na plataforma. O Administrador (gahenrique.eng@gmail.com) precisa acessar as Configurações para definir a chave compartilhada.',
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: apiKeyToUse,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const cargoPromptSection = cargo
        ? `\nCONTEXTO OBRIGATÓRIO DO CARGO/FUNÇÃO CONCORRIDA:
O candidato está concorrendo ao cargo/função: "${cargo}".
Você DEVE obrigatoriamente contextualizar as questões criadas para a realidade, rotina prática, competências, atribuições legais e responsabilidades inerentes ao cargo de "${cargo}".
Formule enunciados que tragam casos hipotéticos e situações práticas vivenciadas por um "${cargo}" na aplicação desta legislação, mantendo o nível de profundidade e rigor exigido em concursos públicos de alto nível para esse cargo.`
        : '';

      const direcionamentoPromptSection = direcionamentoAdicional
        ? `\nDIRECIONAMENTO ESPECÍFICO DO CANDIDATO (AFUNILAMENTO):
O usuário solicitou afunilar especificamente no seguinte foco: "${direcionamentoAdicional}".
Concentre e delimite a elaboração das questões prioritariamente nestes artigos, temas ou capítulos indicados da lei/decreto.`
        : '';

      let antiRepeticaoSection = '';
      if (Array.isArray(questoesExistentes) && questoesExistentes.length > 0) {
        const totalExistentes = questoesExistentes.length;
        const resumoAmostra = questoesExistentes
          .slice(-30)
          .map(
            (q: any, idx: number) =>
              `- Questão anterior ${idx + 1}: ${q.artigo ? `[${q.artigo}] ` : ''}${q.enunciadoResumido || ''}`
          )
          .join('\n');

        antiRepeticaoSection = `
DIRETRIZ DE RELEVÂNCIA DO MATERIAL FONTE (PDF) E VARIAÇÃO DE MODELO/FORMATO:
O candidato já realizou sessões anteriores a partir deste mesmo PDF (${totalExistentes} questões já cadastradas no histórico).
Abaixo estão exemplos textuais de enunciados já elaborados anteriormente (use esta lista APENAS para NÃO repetir a mesma redação):
${resumoAmostra}

REGRAS DETERMINANTES PARA A ELABORAÇÃO:
1. FOCO OBRIGATÓRIO NA RELEVÂNCIA DO MATERIAL FONTE (PDF):
   - As questões DEVEM ser formuladas com base na RELEVÂNCIA real do assunto dentro do material fornecido (PDF).
   - É EXPRESSAMENTE PROIBIDO fugir do foco principal do PDF, buscar artigos periféricos de rodapé ou criar complexidade desnecessária e artificial apenas para não duplicar questões.
   - O núcleo central do PDF e os temas mais importantes para o cargo DEVEM continuar sendo a prioridade absoluta de cobrança.

2. REPETIÇÃO DE ASSUNTOS RELEVANTES É PERMITIDA E NECESSÁRIA:
   - Os mesmos assuntos, conceitos nucleares e artigos centrais PODEM E DEVEM ser cobrados novamente em sessões sucessivas. Perguntas diferentes sobre o mesmo assunto relevante são indispensáveis para o treino e fixação profunda do conteúdo.
   - A ÚNICA PROIBIÇÃO É: NÃO REPETIR A EXATA TRANSCRIÇÃO TEXTUAL DA PERGUNTA (ENUNCIADO) OU DAS ALTERNATIVAS. Não duplique a redação literal de perguntas anteriores.

3. COMO NÃO DUPLICAR PERGUNTAS: ALTERE O MODELO E O FORMATO (SEM FUGIR DO FOCO DO PDF):
   - Para abordar novamente o mesmo assunto relevante do PDF sem duplicar a pergunta, ALTERE O MODELO E O FORMATO da questão:
     a) Modelo Caso Prático / Situação Hipotética: formule uma nova narrativa prática contextualizada nas atribuições do cargo de "${cargo || 'concurso'}";
     b) Modelo Assertivas Múltiplas: itens I, II e III para o candidato julgar quais afirmativas estão corretas ou incorretas;
     c) Modelo Incorreta: solicitar a identificação da alternativa INCORRETA (explorando exceções, vedações ou proibições da mesma regra legal);
     d) Modelo Relação de Causa e Efeito: asserções interligadas por "PORQUE";
     e) Modelo Inversão de Ângulo: se uma questão anterior cobrou o prazo, agora cobre a autoridade competente, os requisitos formais, o procedimento ou as consequências do descumprimento daquela mesma regra.
4. Mantenha fidelidade estrita ao material fonte, sem divagações teóricas desmedidas e sem inventar complexidade artificial.`;
      }

      const qtdNumerica = Math.max(1, Number(quantidade) || 10);
      const distribuicaoAlvo = gerarDistribuicaoGabaritoBalanceada(qtdNumerica);
      const instrucaoGabarito = formatarInstrucaoDistribuicaoGabarito(distribuicaoAlvo);

      const systemPrompt = `Você é um renomado elaborador de questões para bancas examinadoras de concursos públicos no Brasil (como Cebraspe, FCC, FGV, FAFIPA, Vunesp, etc.).
Sua tarefa é ler atentamente o texto ou PDF da lei/decreto fornecido e elaborar exatamente ${quantidade} questões inéditas, de alto nível, no estilo da banca "${banca}".
${cargoPromptSection}
${direcionamentoPromptSection}
${antiRepeticaoSection}
${instrucaoGabarito}

RÉGUA DE DIFICULDADE MANDATÓRIA (40% FÁCIL / 40% MÉDIA / 20% CASCUDA):
Distribua as questões geradas estritamente na calibração paramétrica oficial da banca:
- 40% FÁCEIS: Conceitos nucleares, definições diretas, regras e competências básicas do tema.
- 40% MÉDIAS: Casos práticos hipotéticos de rotina, prazos, procedimentos formais e aplicação direta da norma.
- 20% CASCUDAS (DIFÍCEIS): Casos analíticos complexos de fiscalização, assertivas analíticas múltiplas (I, II e III), pegadinhas sutis de competência versus atribuição e exceções normativas expressas.

DIRETRIZ DE CÁLCULO E FÓRMULAS NAS MATÉRIAS ESPECÍFICAS DE ENGENHARIA CIVIL:
É expressamente proibido exigir cálculos manuais extensos ou fórmulas longas. A banca cobra interpretação de conformidade técnica, NBRs, especificações de materiais, planejamento e fiscalização de obras públicas e contratos administrativos.

DIRETRIZES FUNDAMENTAIS:
1. BANCA: "${banca}". ${observacoesBanca ? `Observações específicas do estilo da banca: ${observacoesBanca}` : 'Foque na literalidade da lei, prazos, competências, exceções e pegadinhas clássicas da banca.'}
2. CARGO / FUNÇÃO ALVO: ${cargo ? `"${cargo}" (As questões, casos concretos e situações hipotéticas DEVEM ser contextualizados na atuação prática deste cargo).` : 'Geral de concursos públicos.'}
3. DISCIPLINA (BLOCO): "${disciplina}".
4. ASSUNTO (LEI/DECRETO): "${assunto}".
${direcionamentoAdicional ? `5. DIRECIONAMENTO / FOCO: "${direcionamentoAdicional}" (Priorize e afunile nestes artigos/temas da lei).\n` : ''}5. FORMATO: Cada questão deve ter exatamente 5 alternativas identificadas com "A) ", "B) ", "C) ", "D) ", "E) ".
6. GABARITO (correta) E ALEATORIEDADE OBRIGATÓRIA: Um número inteiro de 0 a 4 indicando a alternativa correta (0 = A, 1 = B, 2 = C, 3 = D, 4 = E). É TERMINANTEMENTE PROIBIDO concentrar gabaritos em B ou apenas em ABC; posicione a resposta verdadeira na letra exata definida na lista de distribuição pré-sorteada.
7. FUNDAMENTAÇÃO (artigo): Citação precisa do artigo, parágrafo ou inciso (ex: "Art. 14, § 2º - ${assunto}").
8. GABARITO COMENTADO (comentario) OBRIGATÓRIO EM TÓPICOS (A, B, C, D, E):
   O campo 'comentario' DEVE OBRIGATORIAMENTE ser estruturado em tópicos explicativos individuais para TODAS as alternativas de A a E, no seguinte formato:
   - Alternativa A: [Análise minuciosa apontando se é a CORRETA ou INCORRETA, explicando o motivo/erro]
   - Alternativa B: [Análise minuciosa apontando se é a CORRETA ou INCORRETA, explicando o motivo/erro]
   - Alternativa C: [Análise minuciosa apontando se é a CORRETA ou INCORRETA, explicando o motivo/erro]
   - Alternativa D: [Análise minuciosa apontando se é a CORRETA ou INCORRETA, explicando o motivo/erro]
   - Alternativa E: [Análise minuciosa apontando se é a CORRETA ou INCORRETA, explicando o motivo/erro]
   Destaque claramente qual é a CORRETA (com citação do artigo/norma) e explique a pegadinha ou erro de cada uma das 4 INCORRETAS.
9. RELEVÂNCIA DO MATERIAL FONTE: Formule com base na relevância real do assunto dentro do PDF. Não fuja do foco principal do material nem invente complexidade artificial apenas para evitar temas anteriores. Repita os temas centrais do PDF utilizando formatos e modelos variados de questões (caso prático, assertivas I/II/III, incorreta, prazos, etc.), garantindo que nenhuma pergunta tenha a mesma transcrição textual de outra.
10. FORMATAÇÃO E ESPAÇAMENTOS OBRIGATÓRIOS DO ENUNCIADO: Nunca retorne o enunciado em um bloco de texto corrido. Organize com quebras de linha pertinentes (\n\n para separar parágrafos de contexto, títulos de Colunas e a pergunta/comando final; e \n para separar itens numerados 1., 2., assertivas I, II, itens com parênteses '( )' e conectivos como 'PORQUE').
11. PROIBIÇÃO ABSOLUTA DE CÓDIGO OU SINTAXE LATEX: É expressamente proibido usar sintaxe LaTeX como delimitadores $, $$, comandos \\cdot, \\times, \\frac, chaves { } ou subscritos de código. Escreva fórmulas, grandezas e índices SEMPRE em texto simples e caracteres Unicode limpos (exemplo: 'kmod = kmod,1 · kmod,2 · kmod,3', 'fck ≥ 25 MPa', 'm²', 'm³', 'kN/m', '±', 'Ø'). Nunca envolva variáveis ou fórmulas entre cifrões ($).

Retorne estritamente um array JSON de objetos conforme o schema solicitado.`;

      const promptText = `Por favor, elabore exatamente ${quantidade} questões sobre ${assunto} (Disciplina: ${disciplina})${cargo ? ` contextualizadas especificamente para o cargo/função de "${cargo}"` : ''}${direcionamentoAdicional ? ` com direcionamento específico em: "${direcionamentoAdicional}"` : ''}, respeitando o estilo da banca ${banca}.
ATENÇÃO AO FOCO E RELEVÂNCIA: As questões devem ser formuladas com base na relevância do assunto dentro do PDF fornecido. Não fuja do foco principal do material apenas para não repetir temas. Você PODE E DEVE repetir os assuntos mais relevantes do PDF, desde que NÃO REPITA A EXATA TRANSCRIÇÃO TEXTUAL da pergunta: altere o modelo e formato (caso prático, itens I/II/III, alternativa incorreta, etc.).
${instrucaoGabarito}
${fileText ? `Texto da Lei extraído:\n"""\n${fileText.substring(0, 35000)}\n"""` : 'Analise o arquivo anexado.'}`;

      const contentsParts: any[] = [];

      // If a base64 file (PDF or text) was provided and no raw text, attach as inlineData
      if (fileBase64 && !fileText) {
        contentsParts.push({
          inlineData: {
            mimeType: mimeType || 'application/pdf',
            data: fileBase64,
          },
        });
      }

      contentsParts.push({
        text: promptText,
      });

      const modelsToTry = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
      let textResponse = '';
      let lastGenError: any = null;

      for (const modelCandidate of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelCandidate,
            contents: {
              parts: contentsParts,
            },
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.65,
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.LOW,
              },
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    artigo: {
                      type: Type.STRING,
                      description: 'Citação do artigo, parágrafo ou inciso que fundamenta a questão',
                    },
                    enunciado: {
                      type: Type.STRING,
                      description: 'Enunciado completo da questão de concurso',
                    },
                    alternativas: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Cinco alternativas (A, B, C, D, E)',
                    },
                    correta: {
                      type: Type.INTEGER,
                      description: 'Índice de 0 a 4 da alternativa correta',
                    },
                    comentario: {
                      type: Type.STRING,
                      description: 'Gabarito Comentado minucioso com a fundamentação legal e análise dos distratores',
                    },
                  },
                  required: ['artigo', 'enunciado', 'alternativas', 'correta', 'comentario'],
                },
              },
            },
          });

          textResponse = response.text || '';
          if (textResponse) {
            lastGenError = null;
            break;
          }
        } catch (mErr: any) {
          console.warn(`Tentativa com modelo ${modelCandidate} falhou:`, mErr?.message || mErr);
          lastGenError = mErr;
          if (mErr?.message?.includes('503') || mErr?.message?.includes('demand')) {
            await new Promise((r) => setTimeout(r, 1200));
          }
        }
      }

      if (!textResponse && lastGenError) {
        throw lastGenError;
      }
      let generatedQuestions = [];

      try {
        generatedQuestions = JSON.parse(textResponse);
      } catch (parseErr) {
        console.error('Falha ao parsear JSON do Gemini:', parseErr, textResponse);
        const match = textResponse.match(/\[[\s\S]*\]/);
        if (match) {
          generatedQuestions = JSON.parse(match[0]);
        } else {
          throw new Error('Não foi possível interpretar a resposta estruturada do Gemini.');
        }
      }

      // Filtro anti-repetição de questões idênticas:
      // Garante que nenhuma questão gerada tenha enunciado idêntico a questões já existentes no banco
      if (Array.isArray(questoesExistentes) && questoesExistentes.length > 0 && Array.isArray(generatedQuestions)) {
        const enunciadosExistentesNormalizados = new Set(
          questoesExistentes
            .map((q: any) => (q?.enunciadoResumido || '').toLowerCase().replace(/\s+/g, ' ').trim())
            .filter((e: string) => e.length > 15)
        );
        generatedQuestions = generatedQuestions.filter((gq: any) => {
          if (!gq?.enunciado) return true;
          const enNorm = gq.enunciado.slice(0, 160).toLowerCase().replace(/\s+/g, ' ').trim();
          return !enunciadosExistentesNormalizados.has(enNorm);
        });
      }

      // Garante aleatoriedade e distribuição perfeitamente uniforme dos gabaritos (A, B, C, D, E)
      generatedQuestions = garantirDistribuicaoUniforme(generatedQuestions);

      // Sanitiza qualquer resquício de LaTeX ou fórmulas TeX das questões retornadas
      generatedQuestions = generatedQuestions.map((gq: any) => ({
        ...gq,
        enunciado: limparSintaxeLatex(gq.enunciado),
        alternativas: Array.isArray(gq.alternativas) ? gq.alternativas.map(limparSintaxeLatex) : gq.alternativas,
        comentario: limparSintaxeLatex(gq.comentario),
      }));

      res.json({
        success: true,
        count: generatedQuestions.length,
        questions: generatedQuestions,
      });
    } catch (error: any) {
      console.error('Erro ao gerar questões com Gemini:', error);
      let errorMsg = error.message || 'Erro inesperado ao se comunicar com a API do Gemini.';
      try {
        const parsed = JSON.parse(errorMsg);
        if (parsed.error?.message) {
          errorMsg = parsed.error.message;
        }
      } catch {}

      if (errorMsg.includes('Lightning dunning') || errorMsg.includes('dunning')) {
        errorMsg = 'A chave de IA do sistema atingiu o limite de requisições ou créditos esgotados. O Administrador (gahenrique.eng@gmail.com) precisa verificar os créditos ou atualizar a chave no painel de Configurações.';
      }

      res.status(500).json({
        error: errorMsg,
      });
    }
  });

  // ENDPOINT DE EXPANSÃO DE GABARITO COMENTADO VIA GEMINI (A, B, C, D, E)
  app.post('/api/expand-commentary', async (req: Request, res: Response): Promise<void> => {
    try {
      const { questao, customApiKey } = req.body;

      if (!questao || !questao.enunciado || !Array.isArray(questao.alternativas)) {
        res.status(400).json({ error: 'Dados da questão inválidos para expansão de comentário.' });
        return;
      }

      let apiKeyToUse = customApiKey || inMemoryCloudConfig.geminiApiKey;
      if (!apiKeyToUse) {
        apiKeyToUse = (await loadSystemConfigFromSupabase()) || process.env.GEMINI_API_KEY;
      }

      if (!apiKeyToUse || apiKeyToUse === 'MY_GEMINI_API_KEY') {
        res.status(400).json({
          error: 'A chave da API do Gemini não foi configurada para expandir o comentário.',
        });
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: apiKeyToUse,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const letraCorretaMap = ['A', 'B', 'C', 'D', 'E'];
      const idxCorreta = typeof questao.correta === 'number' && questao.correta >= 0 && questao.correta <= 4 ? questao.correta : 0;
      const letraCorreta = letraCorretaMap[idxCorreta];

      const systemPrompt = `Você é um professor renomado e especialista em provas de concursos públicos brasileiros.
Sua missão é gerar um Gabarito Comentado EXHAUSTIVO e DIDÁTICO para uma questão existente, analisando INDIVIDUALMENTE cada uma das 5 alternativas (A, B, C, D, E).

ESTRUTURA DE RESPOSTA OBRIGATÓRIA (EM TÓPICOS):
- Alternativa A: [Análise dizendo se é a CORRETA ou INCORRETA. Se for a correta, apresente a fundamentação legal/técnica. Se for incorreta, explique exatamente o erro, a pegadinha ou o termo equivocado].
- Alternativa B: [Análise dizendo se é a CORRETA ou INCORRETA...].
- Alternativa C: [Análise dizendo se é a CORRETA ou INCORRETA...].
- Alternativa D: [Análise dizendo se é a CORRETA ou INCORRETA...].
- Alternativa E: [Análise dizendo se é a CORRETA ou INCORRETA...].

REGRAS RÍGIDAS:
1. A alternativa correta oficial da questão é a **Letra ${letraCorreta}** (índice ${idxCorreta}). Seu comentário DEVE obrigatoriamente marcar a Letra ${letraCorreta} como a única CORRETA.
2. Destaque em letras maiúsculas as palavras [CORRETA] ou [INCORRETA] no início de cada tópico.
3. Se houver artigo de lei (${questao.artigo || 'legislação da matéria'}), cite-o expressamente na fundamentação da alternativa correta.
4. PROIBIÇÃO ABSOLUTA DE LATEX: Não use sintaxe LaTeX ($ ou $$ ou \\frac). Use apenas texto simples e caracteres Unicode.`;

      const promptText = `Por favor, elabore o gabarito comentado completo e estruturado em tópicos (A, B, C, D, E) para a seguinte questão:

Disciplina: ${questao.disciplina || 'Geral'} | Assunto: ${questao.assunto || 'Concurso'} | Banca: ${questao.banca || 'Oficial'}
${questao.artigo ? `Fundamentação/Artigo: ${questao.artigo}` : ''}

Enunciado:
"""
${questao.enunciado}
"""

Alternativas:
${questao.alternativas.map((alt: string, i: number) => `${letraCorretaMap[i] || i}) ${alt}`).join('\n')}

Gabarito Oficial: Letra ${letraCorreta} (Alternativa ${idxCorreta + 1})`;

      const modelsToTry = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
      let responseText = '';
      let lastErr: any = null;

      for (const m of modelsToTry) {
        try {
          const resp = await ai.models.generateContent({
            model: m,
            contents: promptText,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.5,
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.LOW,
              },
            },
          });
          responseText = resp.text || '';
          if (responseText.trim().length > 20) {
            lastErr = null;
            break;
          }
        } catch (e: any) {
          lastErr = e;
        }
      }

      if (!responseText && lastErr) {
        throw lastErr;
      }

      const comentarioSanitizado = limparSintaxeLatex(responseText.trim());

      res.json({
        success: true,
        comentario: comentarioSanitizado,
      });
    } catch (err: any) {
      console.error('Erro ao expandir comentário da questão:', err);
      res.status(500).json({
        error: err.message || 'Erro ao gerar expansão do comentário.',
      });
    }
  });

  // ENDPOINT DE EXTRAÇÃO INTELIGENTE DE PROVAS EM PDF COM GEMINI
  app.post('/api/provas/extrair-pdf', async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        fileBase64 = '',
        fileText = '',
        mimeType = 'application/pdf',
        banca = 'Fundação FAFIPA',
        ano = '2024',
        orgao = 'Concurso Público',
        cargo = 'Engenheiro Civil',
        gabaritoTexto = '',
        customApiKey = '',
      } = req.body;

      if (!fileBase64 && !fileText) {
        res.status(400).json({
          error: 'Nenhum arquivo ou texto de prova fornecido. Por favor, anexe o arquivo PDF da prova.',
        });
        return;
      }

      let apiKeyToUse = (customApiKey && customApiKey !== 'MY_GEMINI_API_KEY') ? customApiKey.trim() : inMemoryCloudConfig.geminiApiKey;
      if (!apiKeyToUse || apiKeyToUse === 'MY_GEMINI_API_KEY') {
        apiKeyToUse = (await loadSystemConfigFromSupabase()) || inMemoryCloudConfig.geminiApiKey || process.env.GEMINI_API_KEY;
      }

      if (!apiKeyToUse || apiKeyToUse === 'MY_GEMINI_API_KEY') {
        res.status(400).json({
          error: 'A chave da API do Gemini ainda não foi configurada. Acesse as Configurações para validar a chave ou ative a assinatura Pro.',
        });
        return;
      }

      // Se o usuário enviou uma chave personalizada válida (como a Pro), persiste no servidor
      if (customApiKey && customApiKey !== 'MY_GEMINI_API_KEY' && customApiKey.length > 20) {
        inMemoryCloudConfig.geminiApiKey = customApiKey.trim();
        writeStoredCloudConfig(inMemoryCloudConfig);
        saveSystemConfigToSupabase(customApiKey.trim()).catch(() => {});
      }

      const ai = new GoogleGenAI({
        apiKey: apiKeyToUse,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const gabaritoPromptSection = gabaritoTexto && gabaritoTexto.trim().length > 0
        ? `\nGABARITO OFICIAL FORNECIDO PELO USUÁRIO:
"""
${gabaritoTexto.trim().substring(0, 10000)}
"""
REGRA DETERMINANTE DE GABARITO: Utilize o gabarito oficial acima para determinar o índice 'correta' (0=A, 1=B, 2=C, 3=D, 4=E) de cada questão. O índice DEVE corresponder estritamente ao gabarito oficial informado.`
        : `\nGABARITO OFICIAL: Não fornecido explicitamente. Determine a alternativa correta ('correta', de 0 a 4) com base na resolução técnica e fundamentada da questão e na jurisprudência/legislação aplicável.`;

      const systemPrompt = `Você é um perito em catalogação, transcrição e estruturação de cadernos de prova oficiais de concursos públicos brasileiros (com especialidade em bancas como FAFIPA, VUNESP, CEBRASPE, FCC, FGV).
Sua missão é extrair do caderno de prova em anexo TODAS as questões de múltipla escolha com máxima sensibilidade e rigor cirúrgico, exatamente como em uma leitura multimodal direta.

METADADOS DO CONCURSO:
- Banca Examinadora: "${banca}"
- Ano da Prova: "${ano}"
- Órgão / Ente: "${orgao}"
- Cargo Concorrido: "${cargo}"

DIRETRIZES FUNDAMENTAIS DE TRANSCRIÇÃO:
1. FIDELIDADE ABSOLUTA: Não resuma nem altere o enunciado ou as alternativas. Mantenha os textos originais, artigos citados, tabelas e dados técnicos descritos.
2. REMOÇÃO DE RUÍDOS: Descarte cabeçalhos de página, rodapés repetitivos com número de página, propagandas de cursinhos ou marcas d'água.
3. ESTRUTURA DO ENUNCIADO: Organize o texto com quebras de linha limpas (\\n\\n) separando parágrafos de contexto, assertivas I, II, III e a pergunta/comando final.
4. ALTERNATIVAS: Extraia cada alternativa com seu texto completo, identificando A, B, C, D e E.
5. DISCIPLINA E ASSUNTO: Categorize cada questão com a disciplina correspondente e o tema/assunto específico.
6. ESCOPO OFICIAL DO EDITAL (PREFEITURA DE CURITIBA - ENGENHEIRO CIVIL - FAFIPA):
As matérias válidas do concurso são:
- Língua Portuguesa (Gramática, Interpretação, Sintaxe, Crase, Pontuação)
- Informática Básica (Windows, Correio Eletrônico, MS Word, MS Excel)
- Conhecimentos Específicos de Engenharia Civil (Legislação Municipal, Licitações 14.133, Orçamento, Materiais, Concreto NBR 6118, Fundações NBR 6122, Solos, Pavimentação, Drenagem, Hidráulica, Segurança NR-18, Acessibilidade NBR 9050, Desempenho NBR 15575).
REGRA DE FORA DO ESCOPO: Questões de Matemática Básica (frações, juros, regra de três), Raciocínio Lógico Matemático alheio ao edital, História ou outras matérias NÃO CONSTAM no edital. Para essas, marque "noEscopo: false" e descreva a matéria em "assunto". Para as que constam no edital, marque "noEscopo: true".
7. GABARITO (correta): Um número inteiro de 0 a 4 (0=A, 1=B, 2=C, 3=D, 4=E).
8. COMENTÁRIO DIDÁTICO (comentario): Um comentário conciso justificando a alternativa correta com base na lei, norma técnica ou regra gramatical.
9. PROIBIÇÃO DE LATEX: Não use sintaxe LaTeX ($ ou $$ ou \\frac). Escreva fórmulas em texto limpo e caracteres Unicode (ex: m², m³, fck ≥ 25 MPa).

${gabaritoPromptSection}

Retorne estritamente um array JSON de objetos aderente ao schema solicitado.`;

      const promptText = `Por favor, analise o caderno de prova oficial em anexo da banca "${banca}" (${ano} - ${orgao} - ${cargo}).
Sua tarefa é identificar e transcrever TODAS as questões de múltipla escolha presentes no documento da primeira à última (ex: 1 até 40), sem pular nenhuma questão.
Preserve a numeração original, a íntegra dos enunciados e todas as alternativas de A a E no schema JSON.`;

      const contentsParts: any[] = [];
      if (fileBase64) {
        // Envia o PDF binário nativamente para o Gemini aproveitar todo o motor multimodal visual/documental
        contentsParts.push({
          inlineData: {
            mimeType: mimeType || 'application/pdf',
            data: fileBase64,
          },
        });
        const promptComApoio = fileText && fileText.trim().length > 100
          ? `${promptText}\n\n(Texto auxiliar extraído das camadas do PDF para apoio):\n"""\n${fileText.substring(0, 50000)}\n"""`
          : promptText;
        contentsParts.push({ text: promptComApoio });
      } else {
        contentsParts.push({
          text: `${promptText}\n\nTexto extraído do documento:\n"""\n${fileText.substring(0, 120000)}\n"""`,
        });
      }

      const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest'];
      let response: any = null;
      let lastCallError: any = null;

      for (const modelCandidate of modelsToTry) {
        try {
          response = await ai.models.generateContent({
            model: modelCandidate,
            contents: {
              parts: contentsParts,
            },
            config: {
              systemInstruction: systemPrompt,
              maxOutputTokens: 16384,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    numero: {
                      type: Type.INTEGER,
                      description: 'Número original da questão na prova impressa (ex: 1, 2, ..., 40)',
                    },
                    disciplina: {
                      type: Type.STRING,
                      description: 'Disciplina ou matéria da questão',
                    },
                    assunto: {
                      type: Type.STRING,
                      description: 'Tema ou assunto específico cobrado',
                    },
                    enunciado: {
                      type: Type.STRING,
                      description: 'Enunciado integral da questão',
                    },
                    alternativas: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'As opções de resposta (A, B, C, D, E)',
                    },
                    correta: {
                      type: Type.INTEGER,
                      description: 'Índice de 0 a 4 da alternativa correta (0=A, 1=B, 2=C, 3=D, 4=E)',
                    },
                    comentario: {
                      type: Type.STRING,
                      description: 'Gabarito comentado explicando a fundamentação da resposta',
                    },
                    noEscopo: {
                      type: Type.BOOLEAN,
                      description: 'true se a questão está contida no edital, false se for matéria alheia (ex: Matemática Básica)',
                    },
                  },
                  required: ['numero', 'disciplina', 'assunto', 'enunciado', 'alternativas', 'correta', 'comentario'],
                },
              },
            },
          });
          if (response && response.text) {
            break;
          }
        } catch (modelErr: any) {
          console.warn(`Tentativa com modelo ${modelCandidate} falhou:`, modelErr?.message || modelErr);
          lastCallError = modelErr;
        }
      }

      if (!response || !response.text) {
        throw lastCallError || new Error('O modelo não retornou conteúdo para a prova enviada.');
      }

      const rawText = response.text || '';
      let extractedQuestions: any[] = [];

      try {
        extractedQuestions = JSON.parse(rawText);
      } catch (pErr) {
        const match = rawText.match(/\[[\s\S]*\]/);
        if (match) {
          extractedQuestions = JSON.parse(match[0]);
        } else {
          throw new Error('Não foi possível interpretar a resposta estruturada do Gemini.');
        }
      }

      // Sanitiza LaTeX e classifica com precisão no escopo oficial do edital
      extractedQuestions = extractedQuestions.map((eq: any, index: number) => {
        const escopo = verificarEscopoQuestao(eq.disciplina, eq.assunto, eq.enunciado);
        const noEscopoDefinitivo = eq.noEscopo !== undefined ? (Boolean(eq.noEscopo) && escopo.noEscopo) : escopo.noEscopo;

        return {
          numero: Number(eq.numero) || index + 1,
          disciplina: escopo.noEscopo ? escopo.blocoNome : (eq.disciplina || 'Fora do Escopo'),
          assunto: escopo.noEscopo ? (eq.assunto || escopo.assuntoOficial) : `${eq.assunto || 'Tema'} (Fora do Edital)`,
          enunciado: limparSintaxeLatex(eq.enunciado || ''),
          alternativas: Array.isArray(eq.alternativas) ? eq.alternativas.map(limparSintaxeLatex) : eq.alternativas,
          correta: typeof eq.correta === 'number' && eq.correta >= 0 && eq.correta <= 4 ? eq.correta : 0,
          comentario: limparSintaxeLatex(eq.comentario || ''),
          noEscopo: noEscopoDefinitivo,
          motivoForaEscopo: !noEscopoDefinitivo ? (escopo.motivoForaEscopo || 'Disciplina não prevista no edital') : undefined,
          blocoNome: escopo.blocoNome,
          blocoNumero: escopo.blocoNumero,
          codigoPdf: escopo.codigoPdf,
          desconsiderada: !noEscopoDefinitivo,
        };
      });

      res.json({
        success: true,
        count: extractedQuestions.length,
        questions: extractedQuestions,
      });
    } catch (err: any) {
      console.error('Erro na extração de prova PDF:', err);
      let errorMsg = err.message || 'Erro ao extrair questões da prova com o Gemini.';
      try {
        const parsed = JSON.parse(errorMsg);
        if (parsed.error?.message) errorMsg = parsed.error.message;
      } catch {}
      res.status(500).json({ error: errorMsg, details: err.message });
    }
  });

  // Previne cache estático agressivo no navegador para garantir que novos layouts apareçam imediatamente
  app.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // Setup Vite in Dev or static in Production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GBQuest Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Falha ao iniciar servidor:', err);
  process.exit(1);
});

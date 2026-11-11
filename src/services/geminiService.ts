import { getAppConfig } from './supabaseClient';
import * as pdfjsLib from 'pdfjs-dist';
import {
  gerarDistribuicaoGabaritoBalanceada,
  formatarInstrucaoDistribuicaoGabarito,
  garantirDistribuicaoUniforme,
} from '../utils/gabaritoRandomizer';
import { limparSintaxeLatex } from '../utils/latexSanitizer';
import { verificarEscopoQuestao } from '../utils/escopoConcurso';

// Configure PDF.js worker
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
} catch (e) {
  console.warn('Configuração de worker pdf.js:', e);
}

export interface QuestaoExistenteResumo {
  artigo?: string;
  enunciadoResumido?: string;
}

export interface GenerateQuestionsParams {
  banca: string;
  disciplina: string;
  assunto: string;
  cargo?: string;
  direcionamentoAdicional?: string;
  quantidade: number;
  observacoesBanca?: string;
  questoesExistentes?: QuestaoExistenteResumo[];
  file?: File;
  fileText?: string;
  fileBase64?: string;
  mimeType?: string;
}

export async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || '');
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

// Extract clean text from PDF using PDF.js
export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';
    const maxPages = Math.min(pdf.numPages, 40);

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      fullText += `\n[Página ${i}]\n` + pageText;
    }

    return fullText.trim();
  } catch (err) {
    console.warn('Não foi possível extrair texto puro do PDF com PDF.js, tentando fallback:', err);
    return '';
  }
}

// Test Gemini API Key
export async function testGeminiApiKey(apiKey?: string): Promise<{ success: boolean; message: string }> {
  const config = getAppConfig();
  const keyToTest = apiKey || config.geminiApiKey;

  if (!keyToTest) {
    return {
      success: false,
      message: 'Nenhuma chave de API informada. Cole sua chave nos campos abaixo.',
    };
  }

  // 1. Try server test endpoint first
  try {
    const res = await fetch('/api/test-gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customApiKey: keyToTest }),
    });

    const raw = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(raw);
    } catch {}

    if (res.ok && data.success) {
      return { success: true, message: 'Chave Gemini validada com sucesso! Conexão com a IA ativa.' };
    }

    if (data.error) {
      return { success: false, message: `Erro na chave: ${data.error}` };
    }
  } catch (e) {
    console.warn('Erro ao testar via backend, tentando direto no Google:', e);
  }

  // 2. Direct fallback to Google Generative Language API
  try {
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
    let lastErr = '';

    for (const model of modelsToTry) {
      try {
        const directRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyToTest}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Ping: responda OK' }] }],
            }),
          }
        );

        const directData = await directRes.json();
        if (directRes.ok && directData.candidates?.[0]) {
          return { success: true, message: 'Chave do Gemini validada com sucesso direto na API do Google!' };
        } else if (directData.error?.message) {
          lastErr = directData.error.message;
        }
      } catch (err: any) {
        lastErr = err.message || 'Erro de rede';
      }
    }

    if (lastErr) {
      return { success: false, message: `Erro do Google Gemini: ${lastErr}` };
    }
  } catch (err: any) {
    return { success: false, message: `Falha na verificação da chave: ${err.message || 'Erro de rede'}` };
  }

  return { success: false, message: 'Não foi possível validar a chave. Verifique se copiou corretamente.' };
}

// Client-side direct call to Google Gemini (used as fallback when server proxy errors or times out)
async function callDirectGoogleGemini(
  apiKey: string,
  params: GenerateQuestionsParams,
  fileText: string
): Promise<any[]> {
  const cargoPrompt = params.cargo
    ? `\nCONTEXTO OBRIGATÓRIO DO CARGO/FUNÇÃO CONCORRIDA:\nO candidato está concorrendo ao cargo de "${params.cargo}". Elabore as questões com casos práticos e situações hipotéticas rigorosamente contextualizadas nas funções, rotina prática e atribuições de um "${params.cargo}".`
    : '';

  const direcionamentoPrompt = params.direcionamentoAdicional
    ? `\nDIRECIONAMENTO ESPECÍFICO (AFUNILAMENTO): Delimite e priorize as questões especificamente em: "${params.direcionamentoAdicional}".`
    : '';

  const observacoesBancaPrompt = params.observacoesBanca
    ? `\nDIRETRIZES E REQUISITOS DE ESTILO DA BANCA:\n${params.observacoesBanca}`
    : '';

  const antiRepeticaoPrompt =
    params.questoesExistentes && params.questoesExistentes.length > 0
      ? `\nDIRETRIZ DE RELEVÂNCIA DO MATERIAL FONTE (PDF) E VARIAÇÃO DE MODELO/FORMATO:
O candidato já realizou sessões anteriores a partir deste mesmo PDF (${params.questoesExistentes.length} questões cadastradas no histórico).
Abaixo estão exemplos textuais de enunciados já elaborados anteriormente (use esta lista APENAS para NÃO repetir a mesma redação):
${params.questoesExistentes.slice(-30).map((q, i) => `- [${q.artigo || 'Geral'}] ${q.enunciadoResumido || ''}`).join('\n')}

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
     a) Modelo Caso Prático / Situação Hipotética: formule uma nova narrativa prática contextualizada nas atribuições do cargo de "${params.cargo || 'concurso'}";
     b) Modelo Assertivas Múltiplas: itens I, II e III para o candidato julgar quais afirmativas estão corretas ou incorretas;
     c) Modelo Incorreta: solicitar a identificação da alternativa INCORRETA (explorando exceções, vedações ou proibições da mesma regra legal);
     d) Modelo Relação de Causa e Efeito: asserções interligadas por "PORQUE";
     e) Modelo Inversão de Ângulo: se uma questão anterior cobrou o prazo, agora cobre a autoridade competente, os requisitos formais, o procedimento ou as consequências do descumprimento daquela mesma regra.
4. Mantenha fidelidade estrita ao material fonte, sem divagações teóricas desmedidas e sem inventar complexidade artificial.`
      : '';

  const qtdNumerica = Math.max(1, Number(params.quantidade) || 10);
  const distribuicaoAlvo = gerarDistribuicaoGabaritoBalanceada(qtdNumerica);
  const instrucaoGabarito = formatarInstrucaoDistribuicaoGabarito(distribuicaoAlvo);

  const systemPrompt = `Você é um renomado elaborador de questões para bancas examinadoras de concursos públicos no Brasil.
Elabore exatamente ${params.quantidade} questões inéditas no estilo da banca "${params.banca}".
Cargo/Função Alvo: "${params.cargo || 'Geral de Concurso'}".
Disciplina: "${params.disciplina}". Assunto: "${params.assunto}".${cargoPrompt}${direcionamentoPrompt}${observacoesBancaPrompt}${antiRepeticaoPrompt}
${instrucaoGabarito}

RÉGUA DE DIFICULDADE MANDATÓRIA (40% FÁCIL / 40% MÉDIA / 20% CASCUDA):
Distribua as questões geradas estritamente na calibração paramétrica oficial da banca:
- 40% FÁCEIS: Conceitos nucleares, definições diretas, regras e competências básicas do tema.
- 40% MÉDIAS: Casos práticos hipotéticos de rotina, prazos, procedimentos formais e aplicação direta da norma.
- 20% CASCUDAS (DIFÍCEIS): Casos analíticos complexos de fiscalização, assertivas analíticas múltiplas (I, II e III), pegadinhas sutis de competência versus atribuição e exceções normativas expressas.

DIRETRIZ DE CÁLCULO E FÓRMULAS NAS MATÉRIAS ESPECÍFICAS DE ENGENHARIA CIVIL:
É expressamente proibido exigir cálculos manuais extensos ou fórmulas longas. A banca cobra interpretação de conformidade técnica, NBRs, especificações de materiais, planejamento e fiscalização de obras públicas e contratos administrativos.

Cada questão deve ter:
- artigo: Citação do artigo/lei que fundamenta
- enunciado: Texto claro e desafiador no estilo de concurso contextualizado no cargo. FORMATAÇÃO E ESPAÇAMENTOS OBRIGATÓRIOS DO ENUNCIADO: Nunca retorne o texto como um bloco corrido único. Utilize quebras de linha pertinentes (\n\n para separar parágrafos de contexto, títulos de Colunas e a pergunta/comando final; e \n para separar itens numerados 1., 2., assertivas I, II, itens com parênteses '( )' e conectivos como 'PORQUE').
- alternativas: Array com exatamente 5 strings ("A) ...", "B) ...", "C) ...", "D) ...", "E) ...")
- correta: Número de 0 a 4 indicando o gabarito. É expressamente proibido concentrar respostas em B ou ABC; respeite rigorosamente a distribuição pré-sorteada informada acima.
- comentario: Gabarito Comentado OBRIGATORIAMENTE estruturado em tópicos para TODAS as alternativas de A a E (Alternativa A: ..., Alternativa B: ..., etc.), justificando a alternativa correta com a fundamentação legal e explicando a pegadinha ou erro de cada uma das 4 opções incorretas.
RELEVÂNCIA DO MATERIAL FONTE: Formule com base na relevância real do assunto dentro do PDF. Não fuja do foco principal do material nem invente complexidade artificial apenas para evitar temas anteriores. Repita os temas centrais do PDF utilizando formatos e modelos variados de questões, garantindo que nenhuma pergunta tenha a mesma transcrição textual de outra.

Retorne APENAS um array JSON válido sem markdown.`;

  const prompt = `Elabore ${params.quantidade} questões de concurso sobre ${params.assunto} (${params.disciplina})${params.cargo ? ` contextualizadas especificamente para o cargo/função de "${params.cargo}"` : ''}${params.direcionamentoAdicional ? ` com foco afunilado em: "${params.direcionamentoAdicional}"` : ''}, estilo ${params.banca}.
ATENÇÃO AO FOCO E RELEVÂNCIA: As questões devem ser formuladas com base na relevância do assunto dentro do PDF fornecido. Não fuja do foco principal do material apenas para não repetir temas. Você PODE E DEVE repetir os assuntos mais relevantes do PDF, desde que NÃO REPITA A EXATA TRANSCRIÇÃO TEXTUAL da pergunta: altere o modelo e formato (caso prático, itens I/II/III, alternativa incorreta, etc.).
${instrucaoGabarito}
Legislação:
"""
${fileText.substring(0, 35000)}
"""`;

  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
  let lastErrorMsg = '';

  for (const model of modelsToTry) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.65,
            },
          }),
        }
      );

      const raw = await response.text();
      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        lastErrorMsg = 'A API do Google retornou uma resposta não-JSON.';
        continue;
      }

      if (!response.ok) {
        lastErrorMsg = data.error?.message || `Erro no modelo ${model}.`;
        continue;
      }

      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedText) {
        lastErrorMsg = 'Nenhum texto gerado retornado pelo modelo.';
        continue;
      }

      const parsedQuestions = JSON.parse(generatedText);
      const list = Array.isArray(parsedQuestions) ? parsedQuestions : [parsedQuestions];

      let filteredList = list;
      if (params.questoesExistentes && params.questoesExistentes.length > 0) {
        const enunciadosExistentesNormalizados = new Set(
          params.questoesExistentes
            .map((q) => (q?.enunciadoResumido || '').toLowerCase().replace(/\s+/g, ' ').trim())
            .filter((e) => e.length > 15)
        );
        filteredList = list.filter((gq: any) => {
          if (!gq?.enunciado) return true;
          const enNorm = gq.enunciado.slice(0, 160).toLowerCase().replace(/\s+/g, ' ').trim();
          return !enunciadosExistentesNormalizados.has(enNorm);
        });
      }

      // Garante aleatoriedade e distribuição uniforme de gabaritos
      return garantirDistribuicaoUniforme(filteredList);
    } catch (err: any) {
      lastErrorMsg = err.message || 'Erro ao conectar à API do Gemini.';
    }
  }

  throw new Error(lastErrorMsg || 'Falha ao gerar questões com a IA do Google Gemini.');
}

// Main generation function
export async function callGeminiGenerateQuestions(params: GenerateQuestionsParams): Promise<any[]> {
  const config = getAppConfig();
  let fileText = params.fileText || '';
  let fileBase64 = params.fileBase64 || '';
  let mimeType = params.mimeType || 'application/pdf';

  if (!fileText && !fileBase64 && params.file) {
    mimeType = params.file.type || (params.file.name.endsWith('.txt') ? 'text/plain' : 'application/pdf');

    if (params.file.name.endsWith('.txt') || params.file.type === 'text/plain') {
      fileText = await readFileAsText(params.file);
    } else {
      // Extract text directly from PDF for fast, lightweight payload
      try {
        fileText = await extractTextFromPdf(params.file);
      } catch (e) {
        console.warn('Erro na extração de texto do PDF:', e);
      }

      // If text extraction was empty (e.g. scanned image), send base64 if small enough (< 12MB)
      if (!fileText && params.file.size < 12 * 1024 * 1024) {
        fileBase64 = await readFileAsBase64(params.file);
      }
    }
  }

  // 1. First attempt: Full-stack backend endpoint
  try {
    const response = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        banca: params.banca,
        disciplina: params.disciplina,
        assunto: params.assunto,
        cargo: params.cargo,
        direcionamentoAdicional: params.direcionamentoAdicional,
        quantidade: params.quantidade,
        observacoesBanca: params.observacoesBanca,
        questoesExistentes: params.questoesExistentes,
        fileText,
        fileBase64,
        mimeType,
        customApiKey: config.geminiApiKey || undefined,
      }),
    });

    const rawResponseText = await response.text();
    let data: any = null;

    try {
      data = JSON.parse(rawResponseText);
    } catch {
      // The server returned HTML (e.g. 504 Timeout or 413 Payload Too Large from reverse proxy)
      console.warn('Resposta do servidor não é JSON:', rawResponseText.substring(0, 200));

      // If user has a personal key, fallback to direct Google Gemini call!
      if (config.geminiApiKey) {
        console.log('Tentando chamada direta ao Google Gemini com chave pessoal...');
        return await callDirectGoogleGemini(config.geminiApiKey, params, fileText);
      }

      if (response.status === 504 || rawResponseText.includes('504')) {
        throw new Error('Tempo limite esgotado (504 Gateway Timeout). Tente gerar menos questões (ex: 5 ou 10) ou use um arquivo menor.');
      } else if (response.status === 413 || rawResponseText.includes('413')) {
        throw new Error('Arquivo muito pesado para envio (413 Payload Too Large). Tente enviar um arquivo em formato .txt ou menor.');
      } else {
        throw new Error(`O servidor retornou um erro inesperado (Status ${response.status}). Verifique sua chave de API nas Configurações.`);
      }
    }

    if (!response.ok) {
      const errDetail = data?.error || 'Erro ao gerar questões com a IA do Gemini.';

      // If server key is depleted or invalid and user has custom key, try direct fallback
      if (config.geminiApiKey && (errDetail.includes('depleted') || errDetail.includes('RESOURCE_EXHAUSTED') || errDetail.includes('API key'))) {
        console.log('Chave do servidor indisponível. Tentando chamada direta ao Google Gemini com chave pessoal...');
        return await callDirectGoogleGemini(config.geminiApiKey, params, fileText);
      }

      throw new Error(errDetail);
    }

    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error('Formato inválido retornado pela IA.');
    }

    return data.questions;
  } catch (err: any) {
    // If backend failed and custom key exists, try direct Google call as final lifeline
    if (config.geminiApiKey && !err.message?.includes('Google Gemini')) {
      try {
        console.log('Tentando fallback direto na API do Gemini...');
        return await callDirectGoogleGemini(config.geminiApiKey, params, fileText);
      } catch (fallbackErr: any) {
        throw new Error(fallbackErr.message || err.message);
      }
    }

    throw err;
  }
}

export interface ExtrairProvaPdfParams {
  file: File;
  banca: string;
  ano: string | number;
  orgao: string;
  cargo: string;
  gabaritoTexto?: string;
  onProgress?: (msg: string) => void;
}

/**
 * Motor direto do Google Gemini no navegador (Client-Side Multimodal Engine)
 * Executado como fallback imediato com máxima sensibilidade multimodal quando o servidor backend retornar 404 ou indisponibilidade.
 */
export async function callDirectGeminiExtrairProvaPdf(params: {
  apiKey: string;
  fileBase64?: string;
  fileText?: string;
  banca?: string;
  ano?: string | number;
  orgao?: string;
  cargo?: string;
  gabaritoTexto?: string;
  mimeType?: string;
  onProgress?: (msg: string) => void;
}): Promise<any[]> {
  const {
    apiKey,
    fileBase64 = '',
    fileText = '',
    banca = 'Fundação FAFIPA',
    ano = '2024',
    orgao = 'Concurso Público',
    cargo = 'Engenheiro Civil',
    gabaritoTexto = '',
    mimeType = 'application/pdf',
    onProgress,
  } = params;

  onProgress?.('Ativando motor direto multimodal do Google Gemini...');

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
8. COMENTÁRIO EXPLICATIVO: Forneça uma fundamentação técnica e jurídica clara para a resposta correta de cada questão.
${gabaritoPromptSection}

Retorne estritamente um array JSON de questões com as propriedades: numero, disciplina, assunto, enunciado, alternativas, correta, comentario, noEscopo.`;

  const promptText = `Analise detalhadamente o caderno de prova oficial anexo (Banca ${banca}, Ano ${ano}, Órgão ${orgao}, Cargo ${cargo}) e extraia todas as questões com máxima sensibilidade e precisão.`;

  const contentsParts: any[] = [];

  // Se houver base64 e não for excessivo (< 20MB), anexa como inlineData para leitura multimodal completa
  if (fileBase64 && fileBase64.length < 20 * 1024 * 1024) {
    contentsParts.push({
      inlineData: {
        mimeType: mimeType || 'application/pdf',
        data: fileBase64,
      },
    });
    const promptComApoio = fileText && fileText.trim().length > 100
      ? `${promptText}\n\n(Texto auxiliar complementar extraído das camadas do documento para validação):\n"""\n${fileText.substring(0, 45000)}\n"""`
      : promptText;
    contentsParts.push({ text: promptComApoio });
  } else {
    // Caso contrário (arquivo muito pesado ou sem base64), utiliza o texto de alta fidelidade do PDF.js
    contentsParts.push({
      text: `${promptText}\n\nTexto integral do caderno de prova:\n"""\n${(fileText || '').substring(0, 120000)}\n"""`,
    });
  }

  const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest'];
  let lastErrorMsg = '';

  for (const model of modelsToTry) {
    try {
      onProgress?.(`Analisando documento com motor multimodal ${model}...`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: contentsParts }],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    numero: { type: 'INTEGER' },
                    disciplina: { type: 'STRING' },
                    assunto: { type: 'STRING' },
                    enunciado: { type: 'STRING' },
                    alternativas: {
                      type: 'ARRAY',
                      items: { type: 'STRING' },
                    },
                    correta: { type: 'INTEGER' },
                    comentario: { type: 'STRING' },
                    noEscopo: { type: 'BOOLEAN' },
                  },
                  required: ['numero', 'disciplina', 'assunto', 'enunciado', 'alternativas', 'correta', 'comentario'],
                },
              },
            },
          }),
        }
      );

      const raw = await response.text();
      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        lastErrorMsg = 'A API do Google retornou uma resposta não interpretável.';
        continue;
      }

      if (!response.ok) {
        lastErrorMsg = data.error?.message || `Erro na API do Google (HTTP ${response.status}).`;
        continue;
      }

      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedText) {
        lastErrorMsg = 'O modelo Gemini não retornou o texto estruturado da prova.';
        continue;
      }

      let parsedQuestions: any[] = [];
      try {
        parsedQuestions = JSON.parse(generatedText);
      } catch {
        const match = generatedText.match(/\[[\s\S]*\]/);
        if (match) {
          parsedQuestions = JSON.parse(match[0]);
        } else {
          throw new Error('Não foi possível interpretar a estrutura JSON do documento.');
        }
      }

      if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
        lastErrorMsg = 'Nenhuma questão foi identificada na prova enviada.';
        continue;
      }

      // Sanitiza e normaliza questões aplicando classificação estrita do escopo oficial do edital
      return parsedQuestions.map((eq: any, index: number) => {
        const escopo = verificarEscopoQuestao(eq.disciplina, eq.assunto, eq.enunciado);
        const noEscopoDefinitivo = eq.noEscopo !== undefined ? (Boolean(eq.noEscopo) && escopo.noEscopo) : escopo.noEscopo;

        return {
          numero: Number(eq.numero) || index + 1,
          disciplina: escopo.noEscopo ? escopo.blocoNome : (eq.disciplina || 'Fora do Escopo'),
          assunto: escopo.noEscopo ? (eq.assunto || escopo.assuntoOficial) : `${eq.assunto || 'Tema'} (Fora do Edital)`,
          enunciado: limparSintaxeLatex(eq.enunciado || ''),
          alternativas: Array.isArray(eq.alternativas) ? eq.alternativas.map(limparSintaxeLatex) : [],
          correta: typeof eq.correta === 'number' && eq.correta >= 0 && eq.correta <= 4 ? eq.correta : 0,
          comentario: limparSintaxeLatex(eq.comentario || ''),
          noEscopo: noEscopoDefinitivo,
          motivoForaEscopo: !noEscopoDefinitivo ? (escopo.motivoForaEscopo || 'Disciplina não prevista no edital deste concurso') : undefined,
          blocoNome: escopo.blocoNome,
          blocoNumero: escopo.blocoNumero,
          codigoPdf: escopo.codigoPdf,
          desconsiderada: !noEscopoDefinitivo,
        };
      });
    } catch (err: any) {
      lastErrorMsg = err?.message || 'Erro ao conectar à API do Gemini.';
    }
  }

  throw new Error(lastErrorMsg || 'Falha ao extrair questões diretamente pelo Google Gemini.');
}

/**
 * Envia o arquivo PDF de prova para extração inteligente com Dupla Resiliência:
 * 1. Tenta o servidor backend (/api/provas/extrair-pdf).
 * 2. Em caso de 404, 502, 504, 413 ou falha de rede, aciona AUTOMATICAMENTE
 *    o motor direto multimodal do Google Gemini no navegador.
 */
export async function callGeminiExtrairProvaPdf(
  params: ExtrairProvaPdfParams
): Promise<any[]> {
  const config = getAppConfig();
  params.onProgress?.('Lendo e codificando arquivo PDF da prova...');

  let fileBase64 = '';
  let fileText = '';

  try {
    fileBase64 = await readFileAsBase64(params.file);
  } catch (e) {
    console.warn('Falha na codificação base64, tentando texto direto:', e);
  }

  // Tenta extração complementar de texto local para arquivos extensos
  try {
    params.onProgress?.('Analisando camadas de texto do PDF via PDF.js...');
    fileText = await extractTextFromPdf(params.file);
  } catch {}

  // Helper para resolver chave ativa (localStorage ou cloud config)
  const resolveApiKey = async (): Promise<string> => {
    let key = config.geminiApiKey || '';
    if (!key || key === 'MY_GEMINI_API_KEY') {
      try {
        const cloudRes = await fetch('/api/cloud-config');
        if (cloudRes.ok) {
          const cloudData = await cloudRes.json();
          if (cloudData.geminiApiKey && cloudData.geminiApiKey !== 'MY_GEMINI_API_KEY') {
            key = cloudData.geminiApiKey;
          }
        }
      } catch {}
    }
    return key;
  };

  // 1. Tenta extração pelo Servidor Express
  let backendFailed = false;
  let backendErrorDetail = '';
  let statusCode = 0;

  try {
    params.onProgress?.('Enviando prova para o servidor de inteligência...');
    const response = await fetch('/api/provas/extrair-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileBase64,
        fileText,
        mimeType: params.file.type || 'application/pdf',
        banca: params.banca,
        ano: params.ano,
        orgao: params.orgao,
        cargo: params.cargo,
        gabaritoTexto: params.gabaritoTexto || '',
        customApiKey: config.geminiApiKey || undefined,
      }),
    });

    statusCode = response.status;
    const data = await response.json().catch(() => ({}));

    if (response.ok && data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
      params.onProgress?.(`Sucesso! ${data.questions.length} questões identificadas.`);
      return data.questions.map((eq: any, index: number) => {
        const escopo = verificarEscopoQuestao(eq.disciplina, eq.assunto, eq.enunciado);
        const noEscopoDefinitivo = eq.noEscopo !== undefined ? (Boolean(eq.noEscopo) && escopo.noEscopo) : escopo.noEscopo;

        return {
          numero: Number(eq.numero) || index + 1,
          disciplina: escopo.noEscopo ? (eq.blocoNome || escopo.blocoNome) : (eq.disciplina || 'Fora do Escopo'),
          assunto: escopo.noEscopo ? (eq.assunto || escopo.assuntoOficial) : `${eq.assunto || 'Tema'} (Fora do Edital)`,
          enunciado: limparSintaxeLatex(eq.enunciado || ''),
          alternativas: Array.isArray(eq.alternativas) ? eq.alternativas.map(limparSintaxeLatex) : [],
          correta: typeof eq.correta === 'number' && eq.correta >= 0 && eq.correta <= 4 ? eq.correta : 0,
          comentario: limparSintaxeLatex(eq.comentario || ''),
          noEscopo: noEscopoDefinitivo,
          motivoForaEscopo: !noEscopoDefinitivo ? (escopo.motivoForaEscopo || 'Disciplina não prevista no edital deste concurso') : undefined,
          blocoNome: escopo.blocoNome,
          blocoNumero: escopo.blocoNumero,
          codigoPdf: escopo.codigoPdf,
          desconsiderada: !noEscopoDefinitivo,
        };
      });
    }

    backendFailed = true;
    backendErrorDetail = data?.error || data?.details || `HTTP ${response.status}`;
  } catch (fetchErr: any) {
    backendFailed = true;
    backendErrorDetail = fetchErr?.message || 'Falha de rede';
  }

  // 2. Se o servidor retornou 404, 502, 504, 413 ou falha de rede:
  // Ativa instantaneamente o motor cliente multimodal do Gemini!
  if (backendFailed) {
    console.warn(`Servidor indisponível (${backendErrorDetail}). Ativando fallback cliente multimodal.`);
    const activeKey = await resolveApiKey();

    if (!activeKey) {
      throw new Error(
        `Servidor indisponível (${backendErrorDetail}) e nenhuma chave de API Gemini configurada. Acesse as Configurações para validar sua chave.`
      );
    }

    params.onProgress?.(`Servidor indisponível (${statusCode || '404'}). Ativando motor direto multimodal do Google Gemini...`);

    const directQuestions = await callDirectGeminiExtrairProvaPdf({
      apiKey: activeKey,
      fileBase64,
      fileText,
      banca: params.banca,
      ano: params.ano,
      orgao: params.orgao,
      cargo: params.cargo,
      gabaritoTexto: params.gabaritoTexto,
      mimeType: params.file.type || 'application/pdf',
      onProgress: params.onProgress,
    });

    params.onProgress?.(`Sucesso! ${directQuestions.length} questões identificadas via motor multimodal direto.`);
    return directQuestions;
  }

  throw new Error('Não foi possível extrair as questões do documento informado.');
}

/**
 * Expande o Gabarito Comentado de uma questão existente para o formato detalhado A-E via IA (Gemini).
 */
export async function expandirComentarioQuestao(questao: {
  enunciado: string;
  alternativas: string[];
  correta: number;
  artigo?: string;
  disciplina?: string;
  assunto?: string;
  banca?: string;
  comentario?: string;
}): Promise<string> {
  const config = getAppConfig();

  // 1. Tenta endpoint do backend
  try {
    const res = await fetch('/api/expand-commentary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questao,
        customApiKey: config.geminiApiKey || undefined,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.comentario) {
        return data.comentario;
      }
    }
  } catch (err) {
    console.warn('Erro ao chamar /api/expand-commentary no backend, tentando fallback:', err);
  }

  // 2. Fallback direto caso o servidor não esteja respondendo
  const apiKey = config.geminiApiKey;
  if (!apiKey) {
    throw new Error('Chave da API do Gemini não configurada. Insira sua chave nas Configurações.');
  }

  const letraCorretaMap = ['A', 'B', 'C', 'D', 'E'];
  const idxCorreta = typeof questao.correta === 'number' && questao.correta >= 0 && questao.correta <= 4 ? questao.correta : 0;
  const letraCorreta = letraCorretaMap[idxCorreta];

  const systemPrompt = `Você é um professor especialista em concursos públicos.
Gere um Gabarito Comentado EXHAUSTIVO e DIDÁTICO analisando CADA UMA das alternativas (A, B, C, D, E) individualmente.

Estrutura obrigatória em tópicos:
- Alternativa A: [CORRETA/INCORRETA] - explicação detalhada
- Alternativa B: [CORRETA/INCORRETA] - explicação detalhada
- Alternativa C: [CORRETA/INCORRETA] - explicação detalhada
- Alternativa D: [CORRETA/INCORRETA] - explicação detalhada
- Alternativa E: [CORRETA/INCORRETA] - explicação detalhada

A única alternativa [CORRETA] oficial é a Letra ${letraCorreta}. NUNCA use sintaxe LaTeX.`;

  const promptText = `Questão:
Enunciado: ${questao.enunciado}
Alternativas:
${(questao.alternativas || []).map((a, i) => `${letraCorretaMap[i] || i}) ${a}`).join('\n')}
Gabarito Oficial: Letra ${letraCorreta}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: promptText }] }],
      }),
    }
  );

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Não foi possível expandir o comentário com a IA.');

  return limparSintaxeLatex(text.trim());
}

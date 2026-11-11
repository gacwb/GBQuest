import { Questao, SessaoCriada } from '../types';
import { QUESTOES_TRIUNFO_2015, SESSAO_TRIUNFO_2015 } from './provas/provaTriunfo2015';
import { QUESTOES_ARAPONGAS_2020, SESSAO_ARAPONGAS_2020 } from './provas/provaArapongas2020';
import { QUESTOES_CAMPO_MAGRO_2016, SESSAO_CAMPO_MAGRO_2016 } from './provas/provaCampoMagro2016';
import { QUESTOES_LUNARDELLI_2015, SESSAO_LUNARDELLI_2015 } from './provas/provaLunardelli2015';
import { QUESTOES_AGUAS_SARANDI_2015, SESSAO_AGUAS_SARANDI_2015 } from './provas/provaAguasSarandi2015';
import { QUESTOES_DIAMANTE_NORTE_2015, SESSAO_DIAMANTE_NORTE_2015 } from './provas/provaDiamanteNorte2015';

export { QUESTOES_TRIUNFO_2015, SESSAO_TRIUNFO_2015 };
export { QUESTOES_ARAPONGAS_2020, SESSAO_ARAPONGAS_2020 };
export { QUESTOES_CAMPO_MAGRO_2016, SESSAO_CAMPO_MAGRO_2016 };
export { QUESTOES_LUNARDELLI_2015, SESSAO_LUNARDELLI_2015 };
export { QUESTOES_AGUAS_SARANDI_2015, SESSAO_AGUAS_SARANDI_2015 };
export { QUESTOES_DIAMANTE_NORTE_2015, SESSAO_DIAMANTE_NORTE_2015 };

/**
 * QUESTÕES REAIS DA PROVA 1: PARANAEDUCAÇÃO (2026)
 * Cargo: Engenheiro Civil - Curitiba
 * Banca: Fundação FAFIPA
 * Total lido: 40 questões.
 * Aprovadas no Edital: 36 questões (8 Português, 4 Informática, 24 Específicas / Legislação)
 * Descartadas: 4 questões (Q09 a Q12 - Raciocínio Lógico)
 */
export const QUESTOES_PARANAEDUCACAO_2026: Questao[] = [
  // --- Língua Portuguesa (Q01 a Q08) ---
  {
    id: 'fafipa_educa_2026_q01',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Interpretação e Organização Global de Texto',
    enunciado: 'O texto seguinte servirá de base para responder às questões de 1 a 8.\n\n"Leitura e infância: o desafio de formar novos leitores no Brasil [...] A pesquisa Retratos da Leitura no Brasil 2024 revela um cenário preocupante: apenas 47% da população brasileira com 5 anos ou mais pode ser considerada leitora..."\n\nConsiderando a organização global do texto, pode-se afirmar que seu objetivo principal é:',
    alternativas: [
      'Propor a obrigatoriedade da leitura literária no Ensino Médio.',
      'Criticar a atuação das escolas na formação de leitores, já que os professores não incentivam a leitura como antes.',
      'Comprovar que os adolescentes brasileiros de 14 a 17 são o grupo que mais lê no país.',
      'Apresentar dados de uma pesquisa recente e discutir fatores que influenciam a formação de leitores no Brasil.',
      'Defender a substituição da leitura literária por recursos digitais no processo educacional.',
    ],
    correta: 3, // D
    comentario: 'Gabarito Oficial FAFIPA: D. O texto jornalístico-informativo apresenta os dados da pesquisa Retratos da Leitura no Brasil 2024 (IPEC/Instituto Pró-Livro) e analisa fatores como renda, ambiente familiar e hábitos de leitura.',
  },
  {
    id: 'fafipa_educa_2026_q02',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Compreensão Textual',
    enunciado: 'De acordo com o texto, julgue verdadeiro (V) ou falso (F) o que se afirma a seguir e, então, assinale a alternativa com a sequência CORRETA.\n\n(__) A pesquisa demonstra que os professores são os principais responsáveis pela formação do leitor.\n(__) O hábito de leitura tende a aumentar progressivamente conforme a idade dos estudantes.\n(__) A diminuição do interesse pela leitura ao longo da idade está relacionada, entre outros fatores, à concorrência com outras formas de lazer.\n(__) Estudantes de baixa renda apresentam índices de leitura mais elevados que os de alta renda.',
    alternativas: [
      'V, V, F, F.',
      'F, F, V, V.',
      'V, F, V, V.',
      'F, V, V, F.',
      'F, F, V, F.',
    ],
    correta: 4, // E
    comentario: 'Gabarito Oficial FAFIPA: E (F, F, V, F). I: Falsa (a família é a determinante principal); II: Falsa (a leitura decresce com a idade); III: Verdadeira (concorrência com redes, games e vídeos); IV: Falsa (estudantes de maior renda leem mais devido ao acesso a livros e bibliotecas).',
  },
  {
    id: 'fafipa_educa_2026_q03',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Coesão Referencial e Pronomes',
    enunciado: 'No trecho "Esses números, embora relativamente altos considerando as diferentes realidades presentes no país, revelam uma tendência preocupante", o pronome demonstrativo "esses" exerce função coesiva ao:',
    alternativas: [
      'Antecipar informações que ainda serão apresentadas.',
      'Indicar um referente implícito relacionado às bibliotecas escolares.',
      'Substituir uma expressão de valor avaliativo.',
      'Retomar os dados estatísticos sobre a média de livros lidos por diferentes faixas etárias.',
      'Estabelecer relação de oposição entre dois argumentos apresentados em parágrafos distintos.',
    ],
    correta: 3, // D
    comentario: 'Gabarito Oficial FAFIPA: D. O pronome anafórico "esses" retoma as médias numéricas de livros lidos citadas no parágrafo anterior (7,27 livros entre 5-10 anos; 7,56 entre 11-13 anos; 6,20 entre 14-17 anos).',
  },
  {
    id: 'fafipa_educa_2026_q04',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Sintaxe do Período Composto',
    enunciado: 'No trecho "A pesquisa indica que a família é determinante na formação de leitores", a oração introduzida por "que" exerce função sintática de:',
    alternativas: [
      'Predicativo do sujeito.',
      'Complemento nominal de "indica".',
      'Objeto indireto do verbo "indica".',
      'Objeto direto do verbo "indica".',
      'Sujeito da oração principal.',
    ],
    correta: 3, // D
    comentario: 'Gabarito Oficial FAFIPA: D. O verbo "indicar" é transitivo direto (quem indica, indica algo). A oração "que a família é determinante..." é subordinada substantiva objetiva direta.',
  },
  {
    id: 'fafipa_educa_2026_q05',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Pontuação e Conjunções',
    enunciado: 'No trecho "O desafio, portanto, é tornar a leitura mais atrativa, acessível e conectada à realidade das novas gerações", as vírgulas que isolam "portanto" justificam-se porque:',
    alternativas: [
      'Delimitam uma oração subordinada adverbial fronteada.',
      'Marcam o deslocamento de um advérbio intercalado com valor conclusivo.',
      'Sinalizam uma enumeração de termos coordenados.',
      'Indicam elipse do verbo da oração anterior.',
      'Separam um aposto explicativo.',
    ],
    correta: 1, // B
    comentario: 'Gabarito Oficial FAFIPA: B. "Portanto" é uma conjunção conclusiva deslocada para o interior da oração (intercalada), exigindo isolamento por vírgulas.',
  },
  {
    id: 'fafipa_educa_2026_q06',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Morfossintaxe',
    enunciado: 'Acerca do emprego das palavras e de suas funções sintáticas nos trechos retirados do texto, considere as assertivas a seguir:\n\nI. No trecho "ao mesmo tempo, o levantamento traz pistas importantes sobre onde estão as principais barreiras", a palavra "principais" classifica-se como adjetivo e exerce função sintática de adjunto adnominal, pois caracteriza o substantivo "barreiras".\nII. No trecho "entre 5 e 10 anos, a média é de 7,27 livros por ano", a expressão "por ano" funciona como adjunto adverbial de tempo, sendo introduzida pela preposição "por".\nIII. No trecho "apenas 47% da população brasileira com 5 anos ou mais pode ser considerada leitora", a palavra "apenas" classifica-se como advérbio e exerce função sintática de adjunto adverbial, indicando ideia de restrição.\nIV. No trecho "a leitura ainda é fortemente estimulada pela família e pela escola", a palavra "fortemente" é classificada como adjetivo, pois caracteriza o verbo "estimulada".\n\nEstá CORRETO o que se afirma em:',
    alternativas: [
      'I, II e III, apenas.',
      'I, III e IV, apenas.',
      'I, II, III e IV.',
      'II e IV, apenas.',
      'I e II, apenas.',
    ],
    correta: 0, // A
    comentario: 'Gabarito Oficial FAFIPA: A. Assertiva IV está incorreta porque "fortemente" é advérbio de modo modificando o particípio "estimulada", e não adjetivo.',
  },
  {
    id: 'fafipa_educa_2026_q07',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Conjunções e Semântica',
    enunciado: 'No período "Embora relativamente altos considerando as diferentes realidades presentes no país, os números revelam uma tendência preocupante", o termo "embora" estabelece uma relação semântica de:',
    alternativas: [
      'Condição.',
      'Finalidade.',
      'Comparação.',
      'Conformidade.',
      'Concessão.',
    ],
    correta: 4, // E
    comentario: 'Gabarito Oficial FAFIPA: E. "Embora" é conjunção subordinativa concessiva por excelência, introduzindo uma ressalva que não impede a ocorrência do fato principal.',
  },
  {
    id: 'fafipa_educa_2026_q08',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Figuras de Linguagem',
    enunciado: 'No trecho "A leitura é uma das principais portas para o conhecimento", a expressão "portas" constitui um exemplo de:',
    alternativas: [
      'Metáfora.',
      'Antítese.',
      'Hipérbato.',
      'Eufemismo.',
      'Ironia.',
    ],
    correta: 0, // A
    comentario: 'Gabarito Oficial FAFIPA: A. Metáfora é a comparação implícita em que o termo "portas" é empregado fora de seu sentido literal, designando meio de acesso ou passagem para o saber.',
  },

  // --- Informática Básica (Q13 a Q16) ---
  {
    id: 'fafipa_educa_2026_q13',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '733_Informatica_I_Conceitos_e_Sistemas',
    artigo: 'Conceitos de Inteligência Artificial e Aprendizado de Máquina',
    enunciado: 'Durante a implantação de um modelo de aprendizado de máquina para prever demandas de atendimento em um órgão público, você observou excelente desempenho nos dados de treinamento, porém houve queda significativa de desempenho quando o modelo foi aplicado a novos dados. Diante desse cenário, assinale a alternativa que descreve CORRETAMENTE o fenômeno identificado.',
    alternativas: [
      'Normalização, processo de padronização de dados para reduzir variações de escala.',
      'Clusterização, técnica de agrupamento de dados rotulados para aumentar a precisão.',
      'Balanceamento de carga, técnica de distribuição de requisições entre servidores.',
      'Overfitting, caracterizado pelo ajuste excessivo do modelo aos dados de treinamento, reduzindo sua capacidade de generalização.',
      'Underfitting, caracterizado pelo excesso de parâmetros e alta adaptação aos dados de treinamento.',
    ],
    correta: 3, // D
    comentario: 'Gabarito Oficial FAFIPA: D. O overfitting (sobreajuste) ocorre quando o modelo "decora" o conjunto de treino, perdendo o poder de generalização diante de novos dados desconhecidos.',
  },
  {
    id: 'fafipa_educa_2026_q14',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '734_Informatica_II_Aplicativos_e_Internet',
    artigo: 'Fórmulas e Funções de Texto no Excel',
    enunciado: 'Em uma planilha do Microsoft Excel 2016, a célula A1 contém o texto: "Processo Seletivo Público do Serviço Social Autônomo PARANAEDUCAÇÃO"\n\nVocê precisa extrair automaticamente a palavra PARANAEDUCAÇÃO, que corresponde à última palavra do texto (15 caracteres), utilizando uma função adequada do Excel 2016. Diante desse contexto, assinale a alternativa que apresenta a fórmula CORRETA para realizar essa extração.',
    alternativas: [
      '=NÚM.CARACT(A1)',
      '=DIREITA(A1;15)',
      '=ESQUERDA(A1;15)',
      '=EXT.TEXTO(A1;1;15)',
      '=MAIÚSCULA(A1;15)',
    ],
    correta: 1, // B
    comentario: 'Gabarito Oficial FAFIPA: B. A função `=DIREITA(texto; [núm_caract])` retorna o número especificado de caracteres a partir da borda direita da cadeia de texto. Como PARANAEDUCAÇÃO possui 15 letras no final da string, `=DIREITA(A1;15)` é a sintaxe exata.',
  },
  {
    id: 'fafipa_educa_2026_q15',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '733_Informatica_I_Conceitos_e_Sistemas',
    artigo: 'Requisitos do Sistema Operacional Windows 11',
    enunciado: 'Você ficou de avaliar os requisitos de hardware para atualização do Windows 10 PRO para o Windows 11 PRO. Entre os critérios técnicos exigidos pelo Microsoft Windows 11 está a presença de um recurso específico de segurança baseado em hardware. Diante desse contexto, assinale a alternativa que apresenta CORRETAMENTE esse requisito.',
    alternativas: [
      'Processador com arquitetura de 32 bits ou 64 bits.',
      'Presença do módulo TPM 2.0 habilitado.',
      'Suporte à partição no formato NTFS como sistema de arquivos principal.',
      'Placa de vídeo compatível com DirectX 9.',
      'Suporte a BIOS legado configurado no modo CSM.',
    ],
    correta: 1, // B
    comentario: 'Gabarito Oficial FAFIPA: B. O Windows 11 exige obrigatoriamente processador compatível de 64 bits, UEFI com Inicialização Segura (Secure Boot) e o chip de segurança TPM (Trusted Platform Module) versão 2.0 ativado.',
  },
  {
    id: 'fafipa_educa_2026_q16',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '733_Informatica_I_Conceitos_e_Sistemas',
    artigo: 'Segurança da Informação e Criptografia Assimétrica',
    enunciado: 'Um órgão público passou a utilizar criptografia assimétrica para troca segura de documentos entre setores. Um técnico de informática orientou que, para garantir confidencialidade na comunicação, o emissor deveria utilizar uma chave específica no momento do envio da mensagem. Diante desse contexto, assinale a alternativa que indica CORRETAMENTE qual chave deve ser utilizada para garantir que somente o destinatário consiga ler o conteúdo.',
    alternativas: [
      'Hash da mensagem do destinatário gerado antes da transmissão.',
      'Chave pública do emissor.',
      'Chave privada do emissor.',
      'Chave pública do destinatário.',
      'Chave privada do destinatário compartilhada previamente.',
    ],
    correta: 3, // D
    comentario: 'Gabarito Oficial FAFIPA: D. Na criptografia assimétrica, para garantir confidencialidade (sigilo), a mensagem é cifrada com a chave pública do destinatário, de modo que apenas o próprio destinatário (portador da chave privada correspondente) possa decifrá-la.',
  },

  // --- Legislação e Específicas de Engenharia Civil (Q17 a Q40) ---
  {
    id: 'fafipa_educa_2026_q17',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '206_Licitacoes_Lei_14133',
    artigo: 'Art. 37, caput da Constituição Federal',
    enunciado: 'De acordo com a Constituição Federal de 1988, a administração pública direta e indireta de qualquer dos Poderes da União, dos Estados, do Distrito Federal e dos Municípios, incluindo o PARANÁEDUCAÇÃO, obedecerá a alguns princípios. São eles:\n\nI. Legalidade.\nII. Impessoalidade.\nIII. Moralidade.\nIV. Eficiência.\nV. Proporcionalidade.\n\nEstá CORRETO o que se afirma em:',
    alternativas: [
      'I, II e V, apenas.',
      'II e III, apenas.',
      'I, II, e IV, apenas.',
      'I, II, III, IV e V.',
      'I, II, III e IV, apenas.',
    ],
    correta: 4, // E
    comentario: 'Gabarito Oficial FAFIPA: E. O Art. 37 da CF/88 consagra o princípio clássico do LIMPE (Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência). O item V (Proporcionalidade) é princípio administrativo implícito ou previsto em lei ordinária, mas não figura expressamente no rol do caput do Art. 37.',
  },
  {
    id: 'fafipa_educa_2026_q18',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '206_Licitacoes_Lei_14133',
    artigo: 'Lei 14.133/21 - Fases da Licitação',
    enunciado: 'No que diz respeito às fases de licitação do PARANAEDUCAÇÃO, julgue verdadeiro (V) ou falso (F) o que se afirma a seguir e, então, assinale a alternativa com a sequência CORRETA.\n\n(__) A publicidade do edital de licitação será realizada mediante divulgação e manutenção do inteiro teor do ato convocatório e de seus anexos no Portal Nacional de Contratações Públicas (PNCP).\n(__) Após a definição da melhor proposta, se a diferença em relação à proposta classificada em segundo lugar for de pelo menos 5% (cinco por cento), a Administração poderá admitir o reinício da disputa aberta, nos termos estabelecidos no instrumento convocatório, para a definição das demais colocações.\n(__) Definido o resultado do julgamento, a Administração poderá negociar condições mais vantajosas com o primeiro colocado.\n(__) Quando a fase de habilitação anteceder a de julgamento e já tiver sido encerrada, não caberá exclusão de licitante por motivo relacionado à habilitação, salvo em razão de fatos supervenientes ou só conhecidos após o julgamento.\n(__) Encerradas as fases de julgamento e habilitação, e exauridos os recursos administrativos, o processo licitatório será encaminhado à autoridade superior para adjudicação e homologação.',
    alternativas: [
      'V, V, V, V, V.',
      'V, V, F, F, F.',
      'F, V, F, V, V.',
      'V, V, F, F, V.',
      'F, F, V, V, V.',
    ],
    correta: 0, // A
    comentario: 'Gabarito Oficial FAFIPA: A (Todas V). Todas as afirmações reproduzem os preceitos expressos da Lei 14.133/2021 sobre publicação no PNCP (Art. 54), reinício de lances quando há diferença >= 5% (Art. 56), negociação (Art. 61) e encerramento recursal (Art. 71).',
  },
  {
    id: 'fafipa_educa_2026_q19',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '206_Licitacoes_Lei_14133',
    artigo: 'Art. 29 da Lei 14.133/21',
    enunciado: 'De acordo com a Lei nº 14.133/2021, Lei de Licitação do PARANÁEDUCAÇÃO, assinale a alternativa que preenche CORRETAMENTE a lacuna a seguir.\n\nExistem modalidades de licitação que seguem o rito procedimental comum, constante no artigo 17 da referida Lei, mas será adotada (o) _________________________ sempre que o objeto possuir padrões de desempenho e qualidade que possam ser objetivamente definidos pelo edital, por meio de especificações usuais de mercado.',
    alternativas: [
      'Pregão',
      'Leilão',
      'Contratação direta',
      'Concorrência',
      'Dispensa de licitação',
    ],
    correta: 0, // A
    comentario: 'Gabarito Oficial FAFIPA: A. Conforme o art. 29 da Lei nº 14.133/2021: "A licitação será realizada de preferência sob a modalidade pregão sempre que o objeto possuir padrões de desempenho e qualidade que possam ser objetivamente definidos pelo edital, por meio de especificações usuais de mercado".',
  },
  {
    id: 'fafipa_educa_2026_q20',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '208_Contratos_e_Fiscalizacao',
    artigo: 'Decreto nº 11.878/2024 - Credenciamento',
    enunciado: 'De acordo com o Decreto nº 11.878/2024, que regulamenta a Lei nº 14.133/2021, no que diz respeito ao Credenciamento, considere as afirmações a seguir:\n\nI. Credenciado é o fornecedor ou prestador de serviço que atende às exigências do edital de credenciamento, apto a ser convocado, quando necessário, para a execução do objeto.\nII. Sistema de Cadastramento Unificado de Fornecedores - SICAF é a ferramenta informatizada, integrante do Sistema de Compras do Governo Federal - Compras.gov.br, disponibilizada pelo Ministério da Gestão e da Inovação em Serviços Públicos, para cadastramento dos licitantes ou fornecedores...\nIII. Edital de credenciamento é o instrumento convocatório que divulga a intenção de compra de bens ou de contratação de serviços e estabelece critérios para futuras contratações.\nIV. Credenciante é o órgão ou entidade da administração pública federal responsável pelo procedimento de credenciamento.\nV. Credenciamento é o órgão ou entidade da administração pública federal responsável pelo procedimento do mesmo.\n\nEstá CORRETO o que se afirma em:',
    alternativas: [
      'II e III, apenas.',
      'I, II e V, apenas.',
      'I, II, III e IV, apenas.',
      'I, II, e IV, apenas.',
      'I, II, III, IV e V.',
    ],
    correta: 2, // C
    comentario: 'Gabarito Oficial FAFIPA: C. O item V está incorreto porque o "Credenciamento" é o procedimento auxiliar de contratação em si, e não o "órgão ou entidade responsável" (que é o credenciante, definido no item IV).',
  },
  {
    id: 'fafipa_educa_2026_q21',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '311_Materiais_de_Construcao',
    artigo: 'Metodologia BIM - Níveis de Desenvolvimento (LOD)',
    enunciado: 'Na elaboração de projetos de edificações públicas utilizando a metodologia BIM, os Níveis de Desenvolvimento (LOD) são fundamentais para garantir a precisão, a colaboração e a eficiência em todas as fases do projeto. Sobre a aplicação e os benefícios dos LODs, assinale a alternativa que NÃO corresponde a uma característica dessa metodologia.',
    alternativas: [
      'Identificar antecipadamente os problemas durante a fase de projeto pelo uso dos níveis de desenvolvimento, reduzindo a necessidade de alterações dispendiosas na obra.',
      'Definir o modelo LOD 500 para a gestão de instalações, pois fornecem dados fiéis à construção realizada que subsidiam a manutenção e futuras reformas.',
      'Estabelecer uma linguagem comum que permite aos envolvidos compreenderem a confiabilidade das informações dos elementos em cada fase do projeto.',
      'Indicar os níveis de responsabilidade dentro da estrutura de LODs para favorecer a colaboração eficaz entre equipes multidisciplinares e simplificar a coordenação de conflitos.',
      'Determinar que todos os componentes do modelo devem atingir o nível máximo de detalhamento geométrico desde o início.',
    ],
    correta: 4, // E
    comentario: 'Gabarito Oficial FAFIPA: E. É incorreto exigir nível máximo de detalhamento desde o início. A premissa central do LOD (100, 200, 300, 350, 400, 500) é a progressão gradual de detalhamento conforme o avanço das fases (concepção -> anteprojeto -> projeto executivo -> as-built).',
  },
  {
    id: 'fafipa_educa_2026_q22',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '314_Analise_Estrutural',
    artigo: 'NBR 6120 - Ações para o Cálculo de Estruturas de Edificações',
    enunciado: 'Em relação às diretrizes impostas pela NBR 6120, preencha as lacunas e assinale a alternativa com a sequência CORRETA.\n\nNo projeto de estruturas enterradas, devem ser consideradas as pressões atuantes na estrutura devido ao ___________________, __________________ e eventuais sobrecargas sobre o terreno adjacente.',
    alternativas: [
      'momento fletor, esforço cortante',
      'peso próprio, recalque diferencial',
      'coeficiente de mola, deslocamento horizontal',
      'empuxo do solo, empuxo hidrostático',
      'atrito lateral, cisalhamento basal',
    ],
    correta: 3, // D
    comentario: 'Gabarito Oficial FAFIPA: D. Conforme a NBR 6120, estruturas enterradas (muros, subsolos, reservatórios) devem obrigatoriamente considerar o empuxo do solo (ativo, em repouso ou passivo), o empuxo hidrostático (nível do lençol freático) e as sobrecargas na superfície do terreno adjacente.',
  },
  {
    id: 'fafipa_educa_2026_q23',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '316_Estruturas_Metalicas_e_de_Madeira',
    artigo: 'NBR 8800 - Estruturas de Aço - Pontos de Contenção Lateral',
    enunciado: 'No dimensionamento de estruturas de aço, a definição apropriada dos pontos de contenção lateral é determinante para o cálculo do comprimento de flambagem e a verificação da estabilidade global. Nesse sentido, assinale a alternativa que NÃO corresponde a uma forma válida de ponto de contenção lateral.',
    alternativas: [
      'Um nó de uma barra de uma subestrutura de contraventamento formada por um sistema em treliça.',
      'Um nó de um pórtico cuja estabilidade é assegurada por ligações articuladas que permitem a livre rotação.',
      'Um ponto qualquer das subestruturas de contraventamentos citadas na norma, devidamente ligado a um nó dessas subestruturas.',
      'Um nó de um elemento contraventado devidamente ligado a uma subestrutura de contraventamento.',
      'Um nó de um pórtico no qual a estabilidade é assegurada pela rigidez à flexão das barras e pela capacidade de transmissão de momentos das ligações.',
    ],
    correta: 1, // B
    comentario: 'Gabarito Oficial FAFIPA: B. Ligações puramente articuladas com livre rotação não impedem o deslocamento lateral nem fornecem rigidez de travamento a nós sem contraventamento externo.',
  },
  {
    id: 'fafipa_educa_2026_q24',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '311_Materiais_de_Construcao',
    artigo: 'Metodologia BIM - Modelo Federado',
    enunciado: 'Determinado Engenheiro Civil atua na coordenação de projetos de um edifício institucional, utilizando a metodologia BIM para promover a compatibilização entre as diversas disciplinas, tendo sido estabelecido, para a verificação de interferências, o uso de um modelo federado. Diante do exposto e considerando as características técnicas da federação de modelos, assinale a alternativa CORRETA.',
    alternativas: [
      'O modelo federado vincula os diversos modelos mono-disciplinares sem mesclar as suas propriedades em uma base de dados única, mantendo a distinção e a integridade dos componentes de cada disciplina.',
      'A federação de projetos exige a fusão completa dos arquivos nativos em um único modelo central, o que unifica as camadas de desenho e elimina a autoria individual das disciplinas envolvidas.',
      'O processo consiste na conversão automática dos objetos paramétricos em blocos tridimensionais estáticos, removendo os dados não geométricos para reduzir a complexidade do arquivo final.',
      'A utilização desse modelo permite que o engenheiro estrutural edite diretamente a geometria dos elementos arquitetônicos dentro do ambiente federado, alterando as definições originais do projeto.',
      'O conceito refere-se à sobreposição de plantas baixas bidimensionais, possibilitando a análise visual de conflitos sem a necessidade de processamento de modelos volumétricos.',
    ],
    correta: 0, // A
    comentario: 'Gabarito Oficial FAFIPA: A. O modelo federado agrega e vincula os modelos parciais (arquitetura, estrutura, MEP) em um ambiente comum sem fundir os bancos de dados nativos, preservando a autoria e integridade dos arquivos originais.',
  },
  {
    id: 'fafipa_educa_2026_q25',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '316_Estruturas_Metalicas_e_de_Madeira',
    artigo: 'NBR 7190 - Estruturas de Madeira em Situação de Incêndio',
    enunciado: 'No âmbito do projeto e dimensionamento de estruturas de madeira, a norma estabelece critérios específicos para garantir a segurança da edificação sob condições excepcionais. Assim, entende-se por dimensionamento em situação de incêndio:',
    alternativas: [
      'O posicionamento dos apoios e pilares, com a premissa de que a capacidade de carga é garantida pela ausência de carbonização nas zonas de emenda.',
      'A verificação da integridade das faces externas das vigas, com a indicação de que o colapso ocorre principalmente pela perda de seção transversal por umidade.',
      'A verificação dos elementos estruturais e suas conexões, com ou sem revestimento contrafogo, no que se refere à capacidade resistente em temperatura elevada.',
      'O cálculo da estabilidade das peças de madeira, com a suposição de que as ligações metálicas mantêm sua rigidez nominal durante toda a curva de incêndio.',
      'A análise dos componentes estruturais protegidos, com foco na manutenção das propriedades elásticas do material em temperatura ambiente.',
    ],
    correta: 2, // C
    comentario: 'Gabarito Oficial FAFIPA: C. O dimensionamento em situação de incêndio avalia a capacidade de carga residual dos elementos estruturais e conexões durante o tempo requerido de resistência ao fogo (TRRF), descontando a camada carbonizada.',
  },
  {
    id: 'fafipa_educa_2026_q26',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '526_Acessibilidade_Arquitetura_e_Desempenho',
    artigo: 'NBR 9050 - Sinalização em Braille em Corrimãos',
    enunciado: 'Para garantir a acessibilidade em circulações verticais, a NBR 9050/2021 estabelece critérios rígidos para a sinalização de identificação de pavimentos junto a escadas fixas e rampas. No que tange especificamente ao posicionamento da sinalização em Braille, a norma determina que esta deve estar:',
    alternativas: [
      'Fixada no espelho do primeiro degrau de cada lance de escada.',
      'Localizada na face inferior do corrimão para proteção contra o desgaste mecânico.',
      'Obrigatoriamente posicionada na geratriz superior do prolongamento do corrimão.',
      'Aplicada na borda lateral da porta de acesso, próximo ao batente.',
      'Instalada unicamente na parede lateral da escada ou rampa.',
    ],
    correta: 2, // C
    comentario: 'Gabarito Oficial FAFIPA: C. Conforme a NBR 9050, a sinalização em Braille que identifica o pavimento nas escadas e rampas deve ser instalada na geratriz superior do prolongamento horizontal do corrimão.',
  },
  {
    id: 'fafipa_educa_2026_q27',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '206_Licitacoes_Lei_14133',
    artigo: 'Plano de Contratações Anual (PCA) na Lei 14.133',
    enunciado: 'Devido a danos causados por fortes chuvas, foi identificada a necessidade urgente de contratar um serviço de contenção de encostas não previsto originalmente no Plano de Contratações Anual (PCA). Diante desse cenário, assinale a alternativa que contenha CORRETAMENTE o período e a condição legal para realizar a alteração no PCA.',
    alternativas: [
      'No período anterior à aprovação da Lei Orçamentária Anual, através de solicitação formal escrita.',
      'A qualquer momento, desde que a modificação seja submetida à consulta pública por trinta dias.',
      'Até o encerramento do primeiro trimestre do exercício financeiro, independentemente de justificativa.',
      'Durante o ano de sua execução, mediante justificativa aprovada pela autoridade competente.',
      'Após a publicação da Lei Orçamentária Anual, desde que haja disponibilidade orçamentária previamente certificada pela unidade financeira.',
    ],
    correta: 3, // D
    comentario: 'Gabarito Oficial FAFIPA: D. O PCA pode ser alterado ou atualizado durante o seu ano de execução, mediante justificativa fundamentada e aprovação formal da autoridade máxima competente do órgão.',
  },
  {
    id: 'fafipa_educa_2026_q28',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '417_Geologia_e_Mecanica_dos_Solos',
    artigo: 'Investigação do Subsolo e Amostragem Indeformada',
    enunciado: 'Na fase de investigação de um terreno para a construção de um edifício, a equipe de geotecnia optou por um método que possibilita um exame detalhado do perfil do subsolo e permite extrair blocos indeformados dos materiais existentes, assim como a realização de ensaios in situ. Portanto, o método de investigação descrito no caso apresentado é denominado CORRETAMENTE como:',
    alternativas: [
      'Poços exploratórios e trincheiras.',
      'Sondagens rotativas e mistas.',
      'Sondagens a trado.',
      'Sondagem à percussão com medida de torque.',
      'Sondagens de simples reconhecimento.',
    ],
    correta: 0, // A
    comentario: 'Gabarito Oficial FAFIPA: A. Poços e trincheiras a céu aberto permitem a inspeção visual direta contínua das camadas do solo e a extração de blocos cúbicos indeformados com parafina.',
  },
  {
    id: 'fafipa_educa_2026_q29',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '206_Licitacoes_Lei_14133',
    artigo: 'Art. 6º, XXIII da Lei 14.133/21 - Termo de Referência',
    enunciado: 'Para a regular instrução de processos licitatórios de obras e serviços de engenharia, a elaboração do Termo de Referência (TR) exige a definição precisa de parâmetros técnicos e administrativos que balizarão a futura relação contratual. Nesse sentido, assinale a alternativa que NÃO contém um elemento obrigatório que constitui o TR, conforme a legislação vigente.',
    alternativas: [
      'Descrição da solução como um todo, considerado todo o ciclo de vida do objeto.',
      'Especificação da garantia exigida e das condições de manutenção e assistência técnica, quando for o caso.',
      'Modelo de gestão do contrato, que descreve como a execução e responsabilidade da fiscalização de qualidade será realizada integralmente pela empresa contratada.',
      'Especificação do produto, preferencialmente conforme catálogo eletrônico de padronização, observados os requisitos de qualidade, rendimento, compatibilidade, durabilidade e segurança.',
      'Indicação dos locais de entrega dos produtos e das regras para recebimentos provisório e definitivo, quando for o caso.',
    ],
    correta: 2, // C
    comentario: 'Gabarito Oficial FAFIPA: C. A fiscalização da qualidade e do cumprimento do contrato é dever indelegável da própria Administração Pública (fiscal do contrato), e não realizada "integralmente pela empresa contratada".',
  },
  {
    id: 'fafipa_educa_2026_q30',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
    assunto: '627_Patologia_das_Construcoes',
    artigo: 'Patologias de Sistemas Hidráulicos',
    enunciado: 'O Engenheiro Civil responsável pela manutenção de sistemas hidráulicos em uma edificação pública verifica danos severos em componentes sujeitos ao escoamento de água. O laudo técnico aponta que o dano não foi causado por atrito de sólidos, mas sim por um fenômeno físico onde zonas de baixa pressão fizeram o líquido entrar em ebulição, formando bolhas de vapor que, ao atingirem zonas de alta pressão, colapsaram violentamente. Com base no mecanismo de desgaste descrito no laudo, assinale a alternativa que indica CORRETAMENTE a patologia descrita.',
    alternativas: [
      'Corrosão com Cavitação.',
      'Corrosão por Aeração Diferencial.',
      'Corrosão Galvânica.',
      'Corrosão por Erosão.',
      'Fadiga de Corrosão.',
    ],
    correta: 0, // A
    comentario: 'Gabarito Oficial FAFIPA: A. O colapso violento de microbolhas de vapor d\'água geradas por depressão local (ebulição a frio) arrancando partículas metálicas e danificando rotores de bombas e válvulas é a cavitação mecânica combinada com corrosão.',
  },
  {
    id: 'fafipa_educa_2026_q31',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '208_Contratos_e_Fiscalizacao',
    artigo: 'Art. 156 da Lei 14.133/21 - Dosimetria das Sanções',
    enunciado: 'Na esfera da fiscalização de contratos administrativos, a aplicação de sanções exige que o gestor realize um processo de dosimetria para definir a penalidade adequada, fugindo de automatismos que possam gerar injustiças ou desproporcionalidade. Diante de tal premissa, são parâmetros que devem ser considerados na aplicação das sanções, EXCETO:',
    alternativas: [
      'A vinculação estrita à previsão subjetiva do edital.',
      'Os danos que dela provierem para a Administração Pública.',
      'As circunstâncias agravantes ou atenuantes.',
      'As peculiaridades do caso concreto.',
      'A implantação ou o aperfeiçoamento de programa de integridade, conforme normas e orientações dos órgãos de controle.',
    ],
    correta: 0, // A
    comentario: 'Gabarito Oficial FAFIPA: A. Conforme o § 1º do art. 156 da Lei 14.133/21, são parâmetros legais objetivos: a natureza e gravidade, peculiaridades do caso, danos gerados, circunstâncias agravantes/atenuantes e programa de integridade. "Previsão subjetiva do edital" é vedada pelo princípio da objetividade e legalidade.',
  },
  {
    id: 'fafipa_educa_2026_q32',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '208_Contratos_e_Fiscalizacao',
    artigo: 'Art. 131 da Lei 14.133/21 - Extinção Contratual e Equilíbrio',
    enunciado: 'Preencha as lacunas e assinale a alternativa com a sequência CORRETA.\n\nA extinção do contrato não configurará _____________________ para o reconhecimento do desequilíbrio econômico-financeiro, hipótese em que será concedida o(a) _______________ por meio de termo indenizatório.',
    alternativas: [
      'restrição, ressarcimento',
      'permissão, multa',
      'base legal, cobrança',
      'óbice, indenização',
      'autorização, sanção',
    ],
    correta: 3, // D
    comentario: 'Gabarito Oficial FAFIPA: D. Texto literal do art. 131, caput, da Lei 14.133/21: "A extinção do contrato não configurará óbice para o reconhecimento do desequilíbrio econômico-financeiro, hipótese em que será concedida indenização por meio de termo indenizatório".',
  },
  {
    id: 'fafipa_educa_2026_q33',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '315_Concreto_Armado',
    artigo: 'NBR 6118 - Ancoragem por Aderência',
    enunciado: 'No detalhamento das armaduras de um pórtico em concreto armado, ao verificar os comprimentos de ancoragem nas ligações viga-pilar, é preciso definir os dispositivos auxiliares para garantir a transferência correta dos esforços da barra para o concreto, respeitando os critérios de aderência estabelecidos pela NBR 6118. Nesse contexto, assinale a alternativa que apresenta CORRETAMENTE os dispositivos previstos na norma para serem combinados ao trecho reto na ancoragem por aderência.',
    alternativas: [
      'Dobra em cotovelo de 45 graus, grampo de fixação lateral e solda de topo com penetração total.',
      'Gancho apenas em barras tracionadas, barra transversal soldada e chapa soldada na ponta da barra.',
      'Chumbador de expansão, anel de travamento por cunha e rosca direta na armadura.',
      'Luva roscada de continuidade, adesivo epóxi estrutural e conectores de cisalhamento tipo pino.',
      'Traspasse por compressão, presilha metálica de emenda e dobra fria sem mandril.',
    ],
    correta: 1, // B
    comentario: 'Gabarito Oficial FAFIPA: B. Segundo a NBR 6118, a ancoragem de armaduras passivas por aderência pode ser feita em linha reta ou combinada com ganchos (apenas nas extremidades de barras tracionadas), barras transversais soldadas ou dispositivos mecânicos/chapas soldadas na extremidade.',
  },
  {
    id: 'fafipa_educa_2026_q34',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '525_Residuos_Solidos_e_Impactos_Ambientais',
    artigo: 'Licenciamento Ambiental Municipal de Parcelamento do Solo',
    enunciado: 'Um município está analisando o pedido de aprovação para um novo projeto de parcelamento do solo urbano. Conforme a legislação de regência, no licenciamento ambiental de competência municipal, a aprovação do projeto de atividade ou de empreendimento deve ocorrer mediante a emissão de:',
    alternativas: [
      'Licença urbanística e ambiental integrada.',
      'Permissão de uso e ocupação sustentável unificada.',
      'Autorização de parcelamento e manejo simplificado.',
      'Alvará de regularização fundiária conjunta.',
      'Certificado de diretrizes ambientais e urbanas.',
    ],
    correta: 0, // A
    comentario: 'Gabarito Oficial FAFIPA: A. O procedimento de competência municipal em parcelamentos do solo é formalizado pela concessão da licença urbanística e ambiental integrada.',
  },
  {
    id: 'fafipa_educa_2026_q35',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '206_Licitacoes_Lei_14133',
    artigo: 'Art. 72 da Lei 14.133/21 - Instrução da Contratação Direta',
    enunciado: 'Para a instrução de um processo de contratação direta visando à reforma emergencial de uma edificação pública, a administração pública deve compor os autos com a documentação que fundamente a ausência do certame licitatório. Tendo em vista o que foi mencionado, assinale a alternativa que apresenta CORRETAMENTE um dos documentos obrigatórios para a instrução desse processo.',
    alternativas: [
      'O termo de renúncia ao direito de concorrência assinado pelas demais empresas do setor.',
      'A autorização legislativa específica publicada em diário oficial para a dispensa do certame.',
      'O parecer jurídico e os pareceres técnicos, se for o caso, que demonstrem o atendimento dos requisitos exigidos.',
      'O comprovante de recolhimento antecipado da garantia de execução no valor total do contrato.',
      'A certidão de auditoria externa independente validando os preços unitários da planilha orçamentária.',
    ],
    correta: 2, // C
    comentario: 'Gabarito Oficial FAFIPA: C. O art. 72, inciso III, da Lei nº 14.133/2021 estabelece como documento obrigatório na instrução da contratação direta: "o parecer jurídico e pareceres técnicos, se for o caso, que demonstrem o atendimento dos requisitos exigidos".',
  },
  {
    id: 'fafipa_educa_2026_q36',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '206_Licitacoes_Lei_14133',
    artigo: 'Art. 18, § 1º, V da Lei 14.133/21 - ETP Compra vs Locação',
    enunciado: 'Na elaboração do Estudo Técnico Preliminar (ETP) para a estruturação de um órgão público, a equipe de planejamento se deparou com a necessidade de definir o modelo de fornecimento de máquinas pesadas. Consoante o disposto na legislação vigente, quando houver a possibilidade de compra ou de locação de bens, o estudo técnico preliminar deverá considerar:',
    alternativas: [
      'O histórico de manutenção e a vida útil, com indicação da modalidade que transfira a responsabilidade técnica ao fabricante.',
      'A disponibilidade orçamentária do exercício, com a escolha que promova o menor desembolso financeiro.',
      'O valor de mercado e a depreciação contábil, com indicação da preferência pela incorporação do bem ao patrimônio ativo.',
      'Os custos e os benefícios de cada opção, com indicação da alternativa mais vantajosa.',
      'A padronização da frota e a compatibilidade operacional, com indicação da opção que priorize a modernização tecnológica do setor.',
    ],
    correta: 3, // D
    comentario: 'Gabarito Oficial FAFIPA: D. O art. 18, § 1º, V, da Lei 14.133/2021 dispõe que o ETP deverá conter o "levantamento de mercado (...) quando houver a possibilidade de compra ou de locação de bens, o estudo técnico preliminar deverá considerar os custos e os benefícios de cada opção, com indicação da alternativa mais vantajosa".',
  },
  {
    id: 'fafipa_educa_2026_q37',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '210_Orcamento_Medicao_e_BIM',
    artigo: 'Composição de BDI e Tributos Diretos (Súmula 254 TCU)',
    enunciado: 'A elaboração de orçamentos de referência exige a correta composição do BDI (Benefícios e Despesas Indiretas) para garantir o preço justo da obra. A legislação vigente e a jurisprudência estabelecem os itens mínimos que devem ser evidenciados nessa composição. Com base nisso, são componentes obrigatórios do BDI, EXCETO:',
    alternativas: [
      'A taxa de rateio da administração central.',
      'Os percentuais de tributos incidentes sobre o preço do serviço.',
      'A taxa de risco, seguro e garantia do empreendimento.',
      'Os tributos de natureza direta e personalística que oneram o contratado.',
      'A taxa de lucro.',
    ],
    correta: 3, // D
    comentario: 'Gabarito Oficial FAFIPA: D. Conforme jurisprudência pacificada do TCU (Súmula 254 e Acórdão 2622/2013) e legislação orçamentária, tributos de natureza direta e personalística como IRPJ (Imposto de Renda Pessoa Jurídica) e CSLL não podem compor o BDI.',
  },
  {
    id: 'fafipa_educa_2026_q38',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
    assunto: '628_Seguranca_em_Obras_NR18_NR35',
    artigo: 'NR-35 - Trabalho em Altura - Permissão de Trabalho (PT)',
    enunciado: 'Para garantir a segurança contínua nas operações em altura, a NR-35 estabelece critérios rigorosos para a gestão administrativa da Permissão de Trabalho (PT). Assim sendo, assinale a alternativa CORRETA em relação à validade e à revalidação da PT.',
    alternativas: [
      'O tempo válido é de 8 horas, necessitando a revalidação para a continuidade da atividade em condições alteradas ou com nova equipe, desde que as mudanças sejam registradas no verso do documento.',
      'A validade limita-se à duração da atividade e ao turno ou jornada de trabalho, podendo ser revalidada apenas se não houver mudanças nas condições estabelecidas ou na equipe.',
      'O documento tem validade de 24 horas, permitindo a continuidade dos trabalhos em turnos subsequentes somente se realizada troca de equipe.',
      'Validade é de 12 horas, sendo a revalidação permitida para o turno seguinte mesmo com alteração na equipe, mediante assinatura do documento existente pelos novos integrantes.',
      'A validade é indeterminada enquanto durar a atividade específica, dispensando-se novas emissões diárias desde que haja supervisão contínua.',
    ],
    correta: 1, // B
    comentario: 'Gabarito Oficial FAFIPA: B. Segundo o item 35.4.8 da NR-35, a Permissão de Trabalho tem validade limitada à duração da atividade, não podendo ser superior a um turno de trabalho. Ela pode ser revalidada desde que as condições de trabalho e a equipe permaneçam inalteradas.',
  },
  {
    id: 'fafipa_educa_2026_q39',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '311_Materiais_de_Construcao',
    artigo: 'BIM - Common Data Environment (CDE)',
    enunciado: 'O Ambiente Comum de Dados (CDE) é a base para a gestão da informação na metodologia BIM. Considerando suas funções fundamentais para o trabalho colaborativo e o fluxo de dados durante o ciclo de vida do projeto, analise as assertivas a seguir:\n\nI. O CDE deve conectar equipes e dados em um ambiente único, onde o acesso às informações é controlado e concedido aos participantes conforme suas respectivas autorizações.\nII. A plataforma deve permitir a edição simultânea e irrestrita de todos os arquivos nativos por qualquer membro da equipe, visando eliminar a necessidade de processos de aprovação.\nIII. O sistema prioriza o armazenamento dos dados de projeto e construção, operando de forma independente das atividades downstream para evitar a sobrecarga de informações no ambiente central.\nIV. O sistema deve ser configurado para sobrescrever automaticamente as versões anteriores dos arquivos, descartando o histórico de alterações para otimizar o armazenamento e evitar a redundância de dados.\n\nEstá CORRETO o que se afirma em:',
    alternativas: [
      'I, II, III e IV.',
      'III e IV, apenas.',
      'I, II e IV, apenas.',
      'I, apenas.',
      'II e III, apenas.',
    ],
    correta: 3, // D
    comentario: 'Gabarito Oficial FAFIPA: D. Apenas o item I está correto. O CDE (ISO 19650) exige controle de versão rígido (nunca sobrescrever sem histórico - item IV falso), portões de aprovação/status (Work in Progress -> Shared -> Published -> Archived - item II falso) e integração contínua do ciclo de vida.',
  },
  {
    id: 'fafipa_educa_2026_q40',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
    assunto: '630_Avaliacao_de_Imoveis_NBR_14653',
    artigo: 'NBR 16747 - Inspeção Predial - Anamnese',
    enunciado: 'Um profissional de Engenharia Civil foi solicitado para realizar a inspeção predial de um edifício institucional que apresenta fissuras generalizadas. Como procedimento inicial, ele conduz uma série de entrevistas estruturadas com os gestores da edificação para coletar dados e obter informações sobre o histórico de intervenções e manutenções realizadas desde a sua construção. De acordo com a situação descrita, assinale a alternativa que corresponde à CORRETA denominação técnica atribuída a essa etapa da inspeção predial.',
    alternativas: [
      'Anamnese.',
      'Vistoria.',
      'Perícia.',
      'Diagnóstico.',
      'Auditoria.',
    ],
    correta: 0, // A
    comentario: 'Gabarito Oficial FAFIPA: A. Conforme a NBR 16747 (Inspeção Predial), a "anamnese" é o procedimento preliminar de levantamento de dados, histórico da edificação, intervenções anteriores, queixas dos usuários e documentação com os gestores.',
  },
];

/**
 * QUESTÕES REAIS DA PROVA 2: SESA (2026)
 * Cargo: Promotor de Saúde Profissional - Engenheiro Civil
 * Banca: Fundação FAFIPA
 * Total lido: 60 questões.
 * Aprovadas no Edital de Curitiba: 38 questões (8 Português, 30 Específicas / Lei 14.133)
 * Descartadas: 22 questões (Q09 a Q13 - Raciocínio Lógico; Q14 a Q30 - Legislação SUS/Estadual PR)
 */
export const QUESTOES_SESA_2026: Questao[] = [
  // --- Língua Portuguesa (Q01 a Q08) ---
  {
    id: 'fafipa_sesa_2026_q01',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Morfologia - Classes de Palavras',
    enunciado: 'O texto seguinte servirá de base para responder às questões de 1 a 8.\n\n"Cuidados com a pele, alimentação e hidratação são essenciais no verão e festas de fim de ano..."\n\nEm relação às classes de palavras empregadas em trechos do texto, considere as assertivas a seguir:\n\nI. No trecho "A hidratação adequada é fundamental para a manutenção do equilíbrio do organismo", o termo "adequada" classifica-se como adjetivo, por caracterizar o substantivo "hidratação".\nII. Em "É importante observar sinais como boca seca e diminuição da urina", o vocábulo "como" é uma preposição, introduzindo uma relação de comparação.\nIII. Em "aproveite o verão, mas não esqueça do protetor", a palavra "mas" classifica-se como conjunção coordenativa explicativa.\nIV. Em "Beber água regularmente ajuda a prevenir complicações", o termo "regularmente" classifica-se como advérbio de modo.\n\nEstá CORRETO o que se afirma em:',
    alternativas: [
      'I e III, apenas.',
      'II e IV, apenas.',
      'I, II, III e IV.',
      'II e III, apenas.',
      'I e IV, apenas.',
    ],
    correta: 4, // E
    comentario: 'Gabarito Oficial FAFIPA: E. I e IV corretas. O item II está incorreto ("como" atua como conjunção comparativa/exemplificativa); o item III está incorreto ("mas" é conjunção coordenativa adversativa, não explicativa).',
  },
  {
    id: 'fafipa_sesa_2026_q02',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Sintaxe dos Termos da Oração',
    enunciado: 'No que tange às funções sintáticas dos termos destacados no texto, considere as assertivas a seguir:\n\nI. No trecho "Os cuidados com a pele impactam diretamente na saúde", a expressão "Os cuidados com a pele" exerce a função de sujeito composto do verbo "impactam".\nII. Em "Adolescentes e adultos devem consumir pelo menos dois litros de água por dia", a expressão "dois litros de água" atua como objeto direto do verbo "consumir".\nIII. Em "Praticar exercícios no início da manhã ou fim da tarde", as expressões "no início da manhã" ou "fim da tarde" indicam o momento da prática de exercícios, logo, exercem a função de adjunto adverbial de tempo.\nIV. Em "O cardápio do Natal brasileiro, por exemplo, ainda é uma adaptação de países frios", "uma adaptação de países frios" desempenha o papel de predicativo do sujeito.\nV. Em "O verão também exige atenção ao uso de repelentes, que evitam picadas de mosquitos e a transmissão de doenças como dengue, zika e chikungunya", os termos "dengue, zika e chikungunya" funcionam como vocativo.\n\nEstá CORRETO o que se afirma em:',
    alternativas: [
      'II, IV e V, apenas.',
      'I, III e V, apenas.',
      'II, III e IV, apenas.',
      'I, II e III, apenas.',
      'I, IV e V, apenas.',
    ],
    correta: 2, // C
    comentario: 'Gabarito Oficial FAFIPA: C (II, III e IV apenas). Item I é incorreto (o sujeito "Os cuidados com a pele" é simples, cujo núcleo é "cuidados"); item V é incorreto (são termos exemplificativos/apositivos ligados a doenças, e não vocativo).',
  },
  {
    id: 'fafipa_sesa_2026_q03',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Interpretação e Finalidade do Texto',
    enunciado: 'Ao destacar que 68% dos casos de desidratação atingem pessoas a partir dos 50 anos, o texto tem como finalidade:',
    alternativas: [
      'Justificar a substituição da água por bebidas isotônicas.',
      'Alertar para a maior vulnerabilidade desse grupo etário.',
      'Indicar que a desidratação afeta exclusivamente idosos.',
      'Proibir a prática de exercícios físicos entre idosos.',
      'Recomendar a eliminação total da exposição solar.',
    ],
    correta: 1, // B
    comentario: 'Gabarito Oficial FAFIPA: B. O dado estatístico evidencia a vulnerabilidade biológica da população com mais de 50 anos frente à perda de líquidos, justificando o alerta da SESA.',
  },
  {
    id: 'fafipa_sesa_2026_q04',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Compreensão de Situação Hipotética',
    enunciado: 'Considerando as informações apresentadas no texto sobre os sinais de desidratação, analise a situação a seguir:\n\nDurante uma tarde de calor intenso, Roberto, 68 anos, apresenta boca seca, dor de cabeça, diminuição do volume urinário ao longo do dia e refere tontura ao se levantar. Apesar disso, afirma não ter praticado esforço físico significativo e acredita que os sintomas são consequência apenas da idade.\n\nDe acordo com o texto base, a interpretação adequada do quadro apresentado por Roberto é a de que:',
    alternativas: [
      'O aumento do volume urinário indica desidratação, logo, não é o caso de Roberto.',
      'Os sinais relatados sugerem um quadro de desidratação, que requer atenção imediata e aumento da ingestão hídrica.',
      'A ausência de atividade física intensa afasta a possibilidade de desidratação, indicando apenas cansaço passageiro.',
      'A tontura ao se levantar é suficiente para descartar a relação dos sintomas com o consumo insuficiente de líquidos, já que não é sintoma de desidratação.',
      'Os sintomas descritos são compatíveis com um processo natural do envelhecimento, não caracterizando, necessariamente, uma condição de saúde séria.',
    ],
    correta: 1, // B
    comentario: 'Gabarito Oficial FAFIPA: B. Boca seca, tontura e oligúria (pouca urina) são listados expressamente no texto como sinais clínicos de alerta de desidratação.',
  },
  {
    id: 'fafipa_sesa_2026_q05',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Semântica: Sinonímia e Antonímia',
    enunciado: 'Sobre as relações de sentido (sinonímia e antonímia) entre termos empregados no texto, considere as assertivas a seguir:\n\nI. No trecho "atenção redobrada com a pele, a alimentação e a hidratação", o termo "redobrada" pode ser substituído por "intensificada", sem prejuízo de sentido.\nII. No segmento "cuidados essenciais no verão", o vocábulo "essenciais" estabelece relação de sinonímia com "preliminares", sem prejuízo de sentido.\nIII. No trecho "o período mais crítico para exposição solar", o termo "crítico" apresenta sentido oposto ao de "seguro", no contexto.\nIV. No enunciado "nem todos os repelentes têm eficácia comprovada", o termo "comprovada" pode ser compreendido como sinônimo de "validada", mantendo o sentido.\nV. No trecho "bebidas alcoólicas [...] aumentam a desidratação", o termo "desidratação" estabelece relação de antonímia com "hidratação".\n\nEstá CORRETO o que se afirma em:',
    alternativas: [
      'II, III e IV, apenas.',
      'I, II e V, apenas.',
      'I, II, IV e V, apenas.',
      'I, II, III e IV e V.',
      'I, III, IV e V, apenas.',
    ],
    correta: 4, // E
    comentario: 'Gabarito Oficial FAFIPA: E (I, III, IV e V). A assertiva II é falsa porque "essencial" (indispensável, fundamental) não é sinônimo de "preliminar" (inicial, introdutório).',
  },
  {
    id: 'fafipa_sesa_2026_q06',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Compreensão de Texto',
    enunciado: 'De acordo com o texto, a Secretaria de Estado da Saúde reforça cuidados no verão porque:',
    alternativas: [
      'O período favorece apenas problemas relacionados à alimentação.',
      'O lazer substitui integralmente as práticas de autocuidado.',
      'Hábitos típicos da estação podem impactar o bem-estar das pessoas.',
      'Há aumento exclusivo de doenças infecciosas.',
      'As temperaturas elevadas inviabilizam atividades ao ar livre.',
    ],
    correta: 2, // C
    comentario: 'Gabarito Oficial FAFIPA: C. O texto pontua textualmente que os hábitos do verão (férias, sol, confraternizações, desregramento) influenciam a saúde e o bem-estar individual.',
  },
  {
    id: 'fafipa_sesa_2026_q07',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Fonética e Fonologia',
    enunciado: 'Considere as assertivas a seguir:\n\nI. Em "cafeína", há hiato entre "e" e "í".\nII. Em "DEET", há encontro consonantal entre "E" e "E".\nIII. Em "Chikungunya", há dígrafo em "ch".\nIV. Em "Aedes aegypti", há encontro consonantal entre "p" e "t".\nV. Em "climatizadores", há dígrafo em "cl".\nVI. Em "quedas", há hiato entre "u" e "e".\n\nEstá CORRETO o que se afirma em:',
    alternativas: [
      'II, V e VI, apenas.',
      'I, III e IV, apenas.',
      'III e V, apenas.',
      'I e VI, apenas.',
      'II e IV, apenas.',
    ],
    correta: 1, // B
    comentario: 'Gabarito Oficial FAFIPA: B (I, III e IV). I: cafe-í-na (hiato); III: ch (dígrafo consonantal); IV: pt (encontro consonantal impróprio). V está errado (cl é encontro consonantal, não dígrafo); VI está errado (qu é dígrafo e não hiato).',
  },
  {
    id: 'fafipa_sesa_2026_q08',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Interpretação e Recomendações em Saúde',
    enunciado: 'Considerando as orientações apresentadas no texto, analise a situação a seguir:\n\nCarlota, 62 anos, participará de uma confraternização familiar no período da tarde, em um dia de forte calor. Ela pretende consumir bebidas alcoólicas para se refrescar, usar chinelos durante todo o evento e realizar uma caminhada ao meio-dia, sem o uso de protetor solar.\n\nDe acordo com as recomendações do texto base, a conduta mais adequada para Carlota seria:',
    alternativas: [
      'Manter o planejamento inicial, visto que as recomendações preventivas apresentadas no texto não estabelecem restrições específicas para indivíduos acima de 60 anos.',
      'Reorganizar sua rotina, realizando a caminhada em horários de menor incidência solar, passando protetor, priorizando a ingestão de água e abstendo-se do consumo de bebidas alcoólicas.',
      'Manter o consumo de bebidas alcoólicas ao longo do evento, desde que estejam geladas, a fim de minimizar os efeitos do calor.',
      'Substituir o uso de protetor solar por vestimentas leves e confortáveis, uma vez que a exposição solar indireta reduz os riscos à saúde.',
      'Continuar com a exposição solar prolongada, desde que utilize protetor solar com FPS 15.',
    ],
    correta: 1, // B
    comentario: 'Gabarito Oficial FAFIPA: B. O texto orienta explicitamente evitar sol entre 9h e 16h, aplicar FPS >= 30, hidratar-se com água/sucos e evitar bebidas alcoólicas (que desidratam) e chinelos (risco de queda em idosos).',
  },

  // --- Conhecimentos Específicos de Engenharia Civil & Licitações (Q31 a Q60) ---
  {
    id: 'fafipa_sesa_2026_q31',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '312_Tecnicas_Construtivas_e_Canteiro',
    artigo: 'Gestão da Qualidade no Canteiro de Obras',
    enunciado: 'A padronização dos processos é um dos pilares da gestão da qualidade em canteiros de obras. Ao estabelecer critérios claros para cada etapa da execução, o projeto alcança níveis superiores de eficiência e sustentabilidade. Com base nos benefícios dessa prática, assinale a alternativa CORRETA.',
    alternativas: [
      'Concentra a gestão na produtividade imediata, desvinculando o planejamento da obra das exigências de certificações ambientais.',
      'Torna mais simples evitar retrabalhos, desperdícios de materiais e prejuízos financeiros.',
      'Facilita a execução ao restringir o monitoramento técnico somente à fase de entrega final das instalações.',
      'Prioriza a redução do custo fixo da mão de obra através da flexibilização das normas de segurança vigentes.',
      'Fomenta a agilidade visual do empreendimento ao dispensar os registros de inspeção em etapas intermediárias.',
    ],
    correta: 1, // B
    comentario: 'Gabarito Oficial FAFIPA: B. A padronização de procedimentos executivos minimiza a variabilidade, reduzindo drasticamente retrabalhos, consumo excessivo de materiais e custos orçamentários.',
  },
  {
    id: 'fafipa_sesa_2026_q32',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
    assunto: '627_Patologia_das_Construcoes',
    artigo: 'Patologia do Concreto: Carbonatação',
    enunciado: 'Em meio à vistoria técnica em um hospital da rede estadual, foram identificadas manifestações patológicas em elementos de concreto armado. Ao observar manchas brancas superficiais seguidas de fissuras e desplacamento do recobrimento, suspeita-se de um processo químico causado pela entrada de dióxido de carbono nos poros do concreto. Tendo em vista o que foi mencionado, assinale a alternativa CORRETA que identifica essa patologia.',
    alternativas: [
      'Reação atmosférica do cimento.',
      'Carbonatação do concreto.',
      'Hidratação das armaduras.',
      'Transmutação de aditivos.',
      'Cavitação mineral de agregados.',
    ],
    correta: 1, // B
    comentario: 'Gabarito Oficial FAFIPA: B. A carbonatação é a reação do CO2 atmosférico com o hidróxido de cálcio [Ca(OH)2] do concreto formando CaCO3, o que reduz o pH do meio alcalino (de ~12,5 para < 9), despassivando as armaduras e causando corrosão expansiva e desplacamento.',
  },
  {
    id: 'fafipa_sesa_2026_q33',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '523_Abastecimento_de_Agua',
    artigo: 'NBR 15575 / Instalações Hidrossanitárias: Válvulas de Descarga',
    enunciado: 'Na análise técnica do projeto hidrossanitário de reforma de uma Unidade de Pronto Atendimento (UPA), você identifica as válvulas de descarga nos sanitários públicos. Para garantir o desempenho adequado do sistema, é necessário validar o projeto conforme a NBR 15575. Nesse sentido, assinale a alternativa que apresenta CORRETAMENTE a premissa de projeto obrigatória para as válvulas de descarga.',
    alternativas: [
      'A coluna de alimentação pode ser compartilhada com chuveiros e lavatórios, desde que o diâmetro nominal da tubulação seja superior a 50 mm para evitar perda de carga.',
      'O abastecimento deve ocorrer estritamente por ramal direto da rede pública, garantindo a pressão mínima dinâmica sem depender do reservatório superior.',
      'Deve haver coluna exclusiva para abastecê-la, saindo diretamente do reservatório, não podendo ser ligado a qualquer outro ramal nesta coluna.',
      'É permitida a ligação de outros ramais na mesma coluna da válvula de descarga, contanto que sejam instalados dispositivos redutores de pressão nos pontos secundários.',
      'A instalação requer um sistema de pressurização auxiliar independente caso o reservatório direto da rede pública esteja posicionado a menos de dois metros de altura.',
    ],
    correta: 2, // C
    comentario: 'Gabarito Oficial FAFIPA: C. Para evitar oscilações severas de vazão e contaminação por retrossifonagem em outros pontos de consumo, as válvulas de descarga exigem prumada/coluna de distribuição exclusiva a partir do barrilete do reservatório.',
  },
  {
    id: 'fafipa_sesa_2026_q34',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '206_Licitacoes_Lei_14133',
    artigo: 'Art. 18 da Lei 14.133/21 - Elementos Obrigatórios do ETP',
    enunciado: 'Você está avaliando a conformidade de um Estudo Técnico Preliminar (ETP) elaborado para uma nova obra hospitalar. A função é assegurar que o documento contenha todos os elementos obrigatórios exigidos pela Lei n.º 14.133/2021 antes de prosseguir para a fase de edital. Nessa análise, são itens que devem compor o estudo, EXCETO:',
    alternativas: [
      'Levantamento de mercado, que consiste na análise das alternativas possíveis, e justificativa técnica e econômica da escolha do tipo de solução a contratar.',
      'Posicionamento conclusivo sobre a adequação da contratação para o atendimento da necessidade a que se destina.',
      'Justificativas para o parcelamento ou não da contratação.',
      'Descrição da necessidade da contratação, considerado o problema a ser resolvido sob a perspectiva do interesse público.',
      'Providências a serem adotadas pela diretoria posteriormente à celebração do contrato, inclusive quanto à capacitação de servidores.',
    ],
    correta: 4, // E
    comentario: 'Gabarito Oficial FAFIPA: E. Conforme o art. 18, § 2º da Lei 14.133/21, o item de "providências a serem adotadas pela administração previamente à celebração do contrato" é que consta como elemento facultativo ou preparatório do ETP, e não providências posteriores atribuídas a uma diretoria específica.',
  },
  {
    id: 'fafipa_sesa_2026_q35',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '206_Licitacoes_Lei_14133',
    artigo: 'Art. 6º, XXIII da Lei 14.133/21 - Termo de Referência',
    enunciado: 'Como Engenheiro da SESA, você é encarregado de revisar o Termo de Referência (TR) para a contratação de serviços. Este documento deve reunir os elementos necessários e suficientes para caracterizar a licitação. São parâmetros obrigatórios que devem constar no TR conforme a legislação vigente, EXCETO:',
    alternativas: [
      'Descrição da solução como um todo, considerado todo o ciclo de vida do objeto.',
      'Definição do objeto, incluídos sua natureza, os quantitativos, o prazo do contrato e, se for o caso, a possibilidade de sua prorrogação.',
      'Modelo de gestão do contrato, que descreve como a execução do objeto será acompanhada e fiscalizada pelo órgão ou entidade.',
      'Critérios de medição e de pagamento.',
      'Fundamentação da contratação, que impõe a divulgação irrestrita e integral dos estudos técnicos preliminares, abrangendo, inclusive, as classificadas como sigilosas.',
    ],
    correta: 4, // E
    comentario: 'Gabarito Oficial FAFIPA: E. Informações classificadas como sigilosas por lei não são divulgadas de forma irrestrita. O princípio da publicidade não abrange partes protegidas por segredo industrial ou segurança.',
  },
  {
    id: 'fafipa_sesa_2026_q36',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '210_Orcamento_Medicao_e_BIM',
    artigo: 'Composição de Custos Unitários',
    enunciado: 'Assinale a alternativa que preenche CORRETAMENTE a lacuna a seguir.\n\nA composição de custo unitário consiste no detalhamento do custo do serviço que expresse a descrição, quantidades, produtividades e custos unitários dos materiais, mão de obra e equipamentos necessários à execução de uma _____________________.',
    alternativas: [
      'taxa administrativa',
      'unidade de medida',
      'etapa global',
      'parcela mensal',
      'verba de contingência',
    ],
    correta: 1, // B
    comentario: 'Gabarito Oficial FAFIPA: B. Pela definição clássica de engenharia de custos e da Lei 14.133/21, o custo unitário representa os insumos necessários para executar uma "unidade de medida" do serviço (ex: m², m³, kg, un).',
  },
  {
    id: 'fafipa_sesa_2026_q37',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
    assunto: '628_Seguranca_em_Obras_NR18_NR35',
    artigo: 'Código de Ética Profissional da Engenharia (Resolução 1002 CONFEA)',
    enunciado: 'No exercício da função na SESA, a atuação técnica do Engenheiro Civil impacta diretamente a qualidade de vida da população paranaense e deve ser pautada no Código de Ética que fundamenta a profissão. Considerando o disposto sobre o objetivo da profissão, assinale a alternativa CORRETA.',
    alternativas: [
      'A profissão constitui um recurso técnico de exploração racional, tendo como escopo principal a maximização da infraestrutura física e a otimização dos recursos produtivos do Estado.',
      'A profissão é um instrumento de soberania tecnológica, cujo objetivo central é assegurar a independência dos métodos construtivos e a valorização patrimonial dos empreendimentos públicos.',
      'A profissão configura-se como atividade de natureza econômica, focada essencialmente no cumprimento de contratos e na eficiência orçamentária das obras executadas.',
      'A profissão é bem social da humanidade, tendo como objetivos maiores a preservação e o desenvolvimento harmônico do ser humano, de seu ambiente e de seus valores.',
      'A profissão caracteriza-se pela aplicação estrita das ciências exatas, visando prioritariamente a segurança estrutural das edificações em detrimento de variáveis socioambientais.',
    ],
    correta: 3, // D
    comentario: 'Gabarito Oficial FAFIPA: D. O Código de Ética Profissional (Resolução CONFEA nº 1.002/2002) proclama no Art. 3º que a profissão é um bem social da humanidade e tem por objetivo a preservação e o desenvolvimento harmônico do ser humano, seu meio ambiente e seus valores.',
  },
  {
    id: 'fafipa_sesa_2026_q38',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '417_Geologia_e_Mecanica_dos_Solos',
    artigo: 'Investigação Geotécnica in situ: Ensaio de Cone (CPT)',
    enunciado: 'Para a fase de planejamento da construção de um novo complexo hospitalar em uma região litorânea, o Engenheiro da SESA analisa as opções de investigação geotécnica adequadas para um solo com presença de argilas moles. O relatório técnico sugere a realização do ensaio de cone para refinar os dados de projeto. Diante do exposto, assinale a alternativa que define CORRETAMENTE a metodologia e a finalidade desse ensaio.',
    alternativas: [
      'Consiste na cravação contínua de uma ponteira composta de cone e luva de atrito, sendo usado para determinação da estratigrafia e podendo dar indicação da classificação do solo.',
      'Envolve a rotação de uma palheta cruciforme inserida no solo, medindo o torque necessário para cisalhar o material e determinar sua resistência não drenada.',
      'Utiliza uma placa metálica cônica instalada na superfície, sobre a qual são aplicados carregamentos progressivos para medir o módulo de deformabilidade do aterro.',
      'Trata-se de um método geofísico não destrutivo que emprega ondas eletromagnéticas para mapear interferências no subsolo sem a necessidade de perfuração física.',
      'Baseia-se na cravação dinâmica de um amostrador padrão por meio da queda livre de um cone, permitindo a coleta de amostras deformadas a cada metro perfurado.',
    ],
    correta: 0, // A
    comentario: 'Gabarito Oficial FAFIPA: A. O ensaio de cone (CPT - Cone Penetration Test) crava estaticamente uma ponteira cônica com luva de atrito lateral para medir a resistência de ponta (qc) e o atrito lateral (fs), gerando perfis contínuos de estratigrafia do solo.',
  },
  {
    id: 'fafipa_sesa_2026_q39',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
    assunto: '628_Seguranca_em_Obras_NR18_NR35',
    artigo: 'NR-18 - Segurança em Escavações e Taludes',
    enunciado: 'No acompanhamento de obras de ampliação de unidades hospitalares, o Engenheiro deve fiscalizar as etapas de infraestrutura para garantir a segurança dos trabalhadores e a estabilidade do maciço de terra. Com base nos requisitos da NR-18 para atividades de escavação, julgue verdadeiro (V) ou falso (F) o que se afirma a seguir e, então, assinale a alternativa com a sequência CORRETA.\n\n(__) Quando existirem cabos elétricos, tubulações de água, esgoto ou gás na proximidade da escavação, devem ser tomadas medidas preventivas de modo a eliminar o risco de acidentes durante a execução.\n(__) O talude da escavação deve permanecer exposto às intempéries durante a execução da obra para favorecer os efeitos da erosão interna e superficial durante a execução da obra.\n(__) Os escoramentos utilizados como medida de prevenção devem ser inspecionados diariamente.\n(__) O tráfego de veículos pesados próximo às escavações deve ser mantido em velocidade mais elevada que o padrão para promover a compactação dinâmica do solo adjacente através da vibração gerada.',
    alternativas: [
      'V, F, V, F.',
      'F, V, F, V.',
      'V, F, F, V.',
      'V, V, F, F.',
      'F, F, V, V.',
    ],
    correta: 0, // A
    comentario: 'Gabarito Oficial FAFIPA: A (V, F, V, F). A NR-18 veda taludes expostos a erosões e proíbe tráfego pesado e vibrações que desestabilizem a borda das escavações.',
  },
  {
    id: 'fafipa_sesa_2026_q40',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '314_Analise_Estrutural',
    artigo: 'NBR 6120 - Cargas em Reservatórios e Tanques',
    enunciado: 'Como responsável técnico pela elaboração e fiscalização de projetos de sistemas de água e esgoto em unidades hospitalares, você deve definir as cargas atuantes em reservatórios e tanques, seguindo os critérios da NBR 6120. Nesse sentido, assinale a alternativa que indica CORRETAMENTE como deve ser considerado o nível d\'água para o cálculo de carga dessas estruturas.',
    alternativas: [
      'A definição do nível limita-se à cota de entrada da tubulação de alimentação proveniente da rede pública.',
      'O cálculo considera a altura geométrica total das paredes, independentemente da posição dos dispositivos de saída.',
      'Deve ser igual ao máximo possível compatível com o sistema de extravasão.',
      'Corresponde à média operacional prevista para o consumo diário da unidade de saúde.',
      'Baseia-se na altura manométrica máxima atingida pelas bombas de recalque do sistema.',
    ],
    correta: 2, // C
    comentario: 'Gabarito Oficial FAFIPA: C. Conforme a NBR 6120, o nível d\'água para dimensionamento estrutural de reservatórios e tanques deve ser considerado como a cota máxima possível de transbordamento permitida pelo dispositivo extravasor (ladrão).',
  },
  {
    id: 'fafipa_sesa_2026_q41',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '316_Estruturas_Metalicas_e_de_Madeira',
    artigo: 'NBR 8800 - Método dos Estados-Limites',
    enunciado: 'Ao desenvolver o dimensionamento de estruturas metálicas para novas coberturas de hospitais da rede estadual, tem-se que aplicar o método dos estados-limite para assegurar o desempenho da edificação. Dessa forma, utilizando como base o princípio fundamental desse método, assinale a alternativa CORRETA sobre a condição de aceitação do projeto.',
    alternativas: [
      'A superação de um ou mais estados-limite é aceitável em combinações de ações excepcionais, contanto que a estrutura mantenha sua estabilidade geométrica global.',
      'O critério de dimensionamento baseia-se somente na tensão admissível dos materiais na fase elástica, tolerando o escoamento localizado em conexões.',
      'O método exige que nenhum estado-limite aplicável seja excedido quando a estrutura for submetida a todas as combinações apropriadas de ações.',
      'O método permite que os limites de deformação sejam ultrapassados em vigas secundárias, focando a verificação de segurança somente nos pilares e vigas principais.',
      'A estrutura atende aos objetivos de projeto mesmo se o estado-limite de serviço for excedido, desde que o estado-limite último de ruptura seja preservado.',
    ],
    correta: 2, // C
    comentario: 'Gabarito Oficial FAFIPA: C. O princípio reitor do método dos estados-limites (NBR 8800 e NBR 8681) impõe que nenhum estado-limite aplicável (nem último - ELU, nem de utilização/serviço - ELS) seja ultrapassado sob quaisquer das combinações de ações regulamentares.',
  },
  {
    id: 'fafipa_sesa_2026_q42',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '206_Licitacoes_Lei_14133',
    artigo: 'Art. 17 da Lei 14.133/21 - Rito e Fases do Processo Licitatório',
    enunciado: 'Após concluir os estudos para a reforma de uma unidade hospitalar, a equipe de planejamento da SESA encerra a fase preparatória do certame. Seguindo rigorosamente o rito processual estabelecido na Lei n.º 14.133/2021, assinale a alternativa que indica CORRETAMENTE a fase que deve ocorrer em sequência imediata à fase preparatória.',
    alternativas: [
      'De divulgação do edital de licitação.',
      'De apresentação de propostas e lances, quando for o caso.',
      'De cadastramento prévio dos interessados e qualificação técnica.',
      'De habilitação jurídica, fiscal, social e trabalhista.',
      'De julgamento das propostas técnicas e de preço.',
    ],
    correta: 0, // A
    comentario: 'Gabarito Oficial FAFIPA: A. De acordo com a sequência de fases prevista no art. 17 da Lei nº 14.133/2021: I - preparatória; II - de divulgação do edital de licitação; III - de apresentação de propostas e lances; IV - de julgamento; V - de habilitação; VI - recursal; VII - de homologação.',
  },
  {
    id: 'fafipa_sesa_2026_q43',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '206_Licitacoes_Lei_14133',
    artigo: 'Art. 5º da Lei 14.133/21 - Princípios',
    enunciado: 'O Engenheiro Civil, ao atuar no planejamento estratégico, deve pautar sua conduta nos princípios estabelecidos pela Lei n.º 14.133, que apresenta um rol extenso de princípios que devem ser observados na aplicação da norma. São alguns destes princípios, EXCETO:',
    alternativas: [
      'Legalidade.',
      'Moralidade.',
      'Impessoalidade.',
      'Subjetividade.',
      'Publicidade.',
    ],
    correta: 3, // D
    comentario: 'Gabarito Oficial FAFIPA: D. O art. 5º da Lei nº 14.133/2021 impõe o julgamento objetivo e a impessoalidade. A "subjetividade" é diametralmente oposta a todos os preceitos de direito administrativo licitatório.',
  },
  {
    id: 'fafipa_sesa_2026_q44',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '315_Concreto_Armado',
    artigo: 'NBR 16055 - Paredes de Concreto Moldadas no Local',
    enunciado: 'Ao analisar o projeto estrutural de uma nova Unidade de Pronto Atendimento (UPA) que utilizará o sistema construtivo de paredes de concreto, deve-se verificar se as solicitações de cálculo atendem às exigências normativas para garantir a estabilidade global da edificação. Considerando o disposto sobre as ações horizontais na parede, assinale a alternativa que indica CORRETAMENTE quais esforços devem ser obrigatoriamente considerados no dimensionamento.',
    alternativas: [
      'As originadas pelo vento e pelo desaprumo.',
      'As decorrentes da excentricidade acidental das lajes de cobertura.',
      'As provenientes da sobrecarga acidental de uso nos pavimentos adjacentes.',
      'As geradas da retração hidráulica por secagem.',
      'As oriundas das variações volumétricas de origem térmica.',
    ],
    correta: 0, // A
    comentario: 'Gabarito Oficial FAFIPA: A. Segundo a NBR 16055 (Paredes de concreto), as ações horizontais a serem computadas obrigatoriamente na estabilidade global da edificação são as originadas pelas forças do vento e pelos efeitos do desaprumo global acidental.',
  },
  {
    id: 'fafipa_sesa_2026_q45',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '209_Planejamento_e_Controle_de_Obras',
    artigo: 'Planejamento de Obras - Curva S',
    enunciado: 'No monitoramento das obras de reforma das unidades de saúde, é utilizada a Curva S como ferramenta visual para acompanhar o desempenho do empreendimento. Ao analisar o gráfico comparativo entre o planejado e o realizado, é possível identificar desvios de prazo através do eixo do tempo. Com base na interpretação técnica desse gráfico, assinale a alternativa CORRETA sobre o deslocamento horizontal.',
    alternativas: [
      'O deslocamento horizontal deve ser interpretado como erro de planejamento inicial, obrigando o gestor a descartar a linha de base e adotar uma nova metodologia de acompanhamento financeiro.',
      'A análise horizontal serve para mensurar a qualidade técnica dos serviços executados, dissociando-se da verificação de prazos ou cronogramas.',
      'O deslocamento horizontal indica variações no orçamento acumulado, onde a movimentação para a direita representa uma economia de recursos em relação ao fluxo de caixa base.',
      'Um deslocamento da curva para a esquerda sinaliza que a equipe de obra está ociosa, exigindo a reprogramação das atividades para preencher as lacunas temporais do cronograma.',
      'É indicado que, se o deslocamento for para a esquerda, significa projeto adiantado e, se o deslocamento for para a direita, significa projeto atrasado.',
    ],
    correta: 4, // E
    comentario: 'Gabarito Oficial FAFIPA: E. No gráfico da Curva S (eixo X = tempo, eixo Y = % acumulado), alcançar o mesmo percentual de avanço físico em uma data anterior (deslocamento para a esquerda no eixo temporal) indica cronograma adiantado.',
  },
  {
    id: 'fafipa_sesa_2026_q46',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '208_Contratos_e_Fiscalizacao',
    artigo: 'Art. 6º, XXVII da Lei 14.133/21 - Matriz de Riscos',
    enunciado: 'Para garantir o equilíbrio econômico-financeiro em obras da SESA, o Engenheiro Civil deve compreender a natureza dos instrumentos previstos na Lei de Licitações. Assim, nos termos da definição, a matriz de riscos classifica-se juridicamente de forma CORRETA como:',
    alternativas: [
      'uma modalidade de licitação.',
      'um estudo técnico preliminar.',
      'uma cláusula contratual.',
      'um critério de julgamento.',
      'um procedimento auxiliar.',
    ],
    correta: 2, // C
    comentario: 'Gabarito Oficial FAFIPA: C. O art. 6º, XXVII, da Lei nº 14.133/2021 define a matriz de riscos como a "cláusula contratual definidora de riscos e de responsabilidades entre as partes e caracterizadora do equilíbrio econômico-financeiro inicial do contrato".',
  },
  {
    id: 'fafipa_sesa_2026_q47',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '526_Acessibilidade_Arquitetura_e_Desempenho',
    artigo: 'NBR 9050 - Maçanetas de Portas Acessíveis',
    enunciado: 'Você é responsável por vistoriar a acessibilidade das portas em uma nova ala hospitalar. Diante disso, preencha as lacunas a seguir e, então, assinale a alternativa com a sequência CORRETA.\n\nAs maçanetas devem, preferencialmente, ser do tipo alavanca, apresentando uma distância mínima de _____ mm da superfície da porta. As maçanetas devem ser instaladas a uma altura que pode variar entre _____ m e _____ m do piso acabado.',
    alternativas: [
      '45 / 0,85 / 1,15.',
      '40 / 0,80 / 1,10.',
      '35 / 0,60 / 1,10.',
      '30 / 0,90 / 1,20.',
      '50 / 0,70 / 1,00.',
    ],
    correta: 1, // B
    comentario: 'Gabarito Oficial FAFIPA: B. Segundo a NBR 9050, maçanetas tipo alavanca devem ter afastamento mínimo de 40 mm em relação à folha da porta e altura de instalação entre 0,80 m e 1,10 m do piso acabado.',
  },
  {
    id: 'fafipa_sesa_2026_q48',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '316_Estruturas_Metalicas_e_de_Madeira',
    artigo: 'NBR 7190 - Estruturas de Madeira: Índice de Esbeltez',
    enunciado: 'Atuando na manutenção e reparo de obras da Saúde, o Engenheiro Civil frequentemente precisa verificar a integridade de estruturas em madeira. Para garantir a segurança contra a instabilidade das peças, é necessário determinar a esbeltez dos elementos. Assim sendo, assinale a alternativa que indica CORRETAMENTE, conforme a norma técnica, quais são os parâmetros considerados para calcular o índice de esbeltez.',
    alternativas: [
      'O vão livre teórico entre apoios, a densidade básica do material e a carga acidental normativa.',
      'O comprimento físico total da peça, o módulo de elasticidade longitudinal e a resistência à compressão paralela.',
      'A área da seção transversal, o peso específico aparente e o fator de modificação para a classe de carregamento.',
      'A classe de resistência da madeira, a porcentagem de umidade ambiente e os coeficientes de ponderação das ações.',
      'O comprimento de flambagem, o momento de inércia na direção analisada e a área da seção transversal.',
    ],
    correta: 4, // E
    comentario: 'Gabarito Oficial FAFIPA: E. O índice de esbeltez (lambda) é dado pela razão entre o comprimento de flambagem efetivo (Lfl) e o raio de giração (i), sendo o raio de giração a raiz quadrada da razão entre o momento de inércia (I) e a área da seção transversal (A): i = sqrt(I/A).',
  },
  {
    id: 'fafipa_sesa_2026_q49',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '315_Concreto_Armado',
    artigo: 'NBR 6118 - Torção em Elementos Estruturais',
    enunciado: 'Ao atuar na análise e fiscalização de projetos públicos de engenharia na SESA, é dever do Engenheiro Civil garantir que o dimensionamento dos elementos estruturais esteja em estrita conformidade com a NBR 6118. Considerando o disposto na norma, assinale a alternativa que apresenta CORRETAMENTE como deve ser feito o cálculo das tensões provenientes da torção.',
    alternativas: [
      'O cálculo das tensões provenientes da torção devem ser calculadas pelas fórmulas da teoria da elasticidade e seus efeitos acrescidos aos outros esforços, examinados como estado múltiplo de tensão.',
      'O cálculo deve ser realizado utilizando coeficientes empíricos de majoração, não considerando a interação com momentos fletores para simplificação do estado limite último.',
      'A verificação das tensões ocorre priorizando o cálculo da análise geométrica da seção transversal em detrimento das fórmulas analíticas de resistência dos materiais.',
      'As tensões necessitam ser calculadas com base na teoria da plasticidade, devendo seus efeitos ser avaliados isoladamente dos demais esforços para evitar o colapso progressivo.',
      'Tais tensões precisam ser subtraídas dos esforços de cisalhamento quando houver atuação simultânea, garantindo a economia de armadura transversal na peça estrutural.',
    ],
    correta: 0, // A
    comentario: 'Gabarito Oficial FAFIPA: A. Na NBR 6118, a torção no concreto armado (especialmente em peças tubulares equivalentes ou no regime de verificação elástica) soma seus efeitos tangenciais às tensões de cisalhamento e flexão, constituindo um estado composto/múltiplo de tensões.',
  },
  {
    id: 'fafipa_sesa_2026_q50',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '206_Licitacoes_Lei_14133',
    artigo: 'Art. 12, VII da Lei 14.133/21 - Plano de Contratações Anual (PCA)',
    enunciado: 'No desempenho de atividades administrativas e de planejamento de licitações na SESA, tem-se que alinhar as demandas de obras e serviços às diretrizes da Lei Federal n.º 14.133/2021. Considerando o texto legal, assinale a alternativa que indica CORRETAMENTE como deve ser a divulgação e a observância do plano de contratações anual.',
    alternativas: [
      'Deverá ser divulgado e mantido à disposição do público em sítio eletrônico oficial e será observado pelo ente federativo na realização de licitações e na execução dos contratos.',
      'A publicidade do documento é restrita aos servidores do órgão até a publicação do edital, visando manter o sigilo estratégico das futuras contratações.',
      'A divulgação deve ocorrer prioritariamente via diário oficial impresso, sendo o acesso digital uma medida complementar facultativa aos órgãos de controle.',
      'Deve ser arquivado fisicamente no setor de engenharia, estando disponível para consulta pública somente mediante requerimento formal presencialmente.',
      'O plano serve como documento de gestão interna, dispensando a observância estrita durante a fase de execução dos contratos administrativos.',
    ],
    correta: 0, // A
    comentario: 'Gabarito Oficial FAFIPA: A. O art. 12, VII, da Lei nº 14.133/2021 estabelece que o Plano de Contratações Anual deverá ser divulgado e mantido à disposição do público no PNCP e em sítio eletrônico oficial, sendo de observância obrigatória na realização das contratações.',
  },
  {
    id: 'fafipa_sesa_2026_q51',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '311_Materiais_de_Construcao',
    artigo: 'Metodologia BIM - Conceitos Fundamentais',
    enunciado: 'Para aprimorar a gestão de obras públicas na SESA, é fundamental entender os conceitos básicos das tecnologias e diferenciá-las das práticas tradicionais. Sobre a metodologia do Building Information Modelling (BIM), assinale a alternativa CORRETA.',
    alternativas: [
      'É uma técnica de modelagem puramente visual voltada para a produção de maquetes eletrônicas e renderizações fotorealistas.',
      'Trata-se de um método de desenho manual em pranchetas, utilizado para criar esboços artísticos das fachadas dos hospitais.',
      'Consiste em um sistema de Gerenciamento Eletrônico de Documentos (GED) que organiza pastas digitais em nuvem, servindo como repositório estático para arquivos PDF e imagens da obra.',
      'Refere-se à utilização de softwares de desenho vetorial focados na representação gráfica bidimensional, mantendo as disciplinas de projeto em arquivos independentes e não parametrizados.',
      'É um processo colaborativo baseado em modelos tridimensionais inteligentes que abrangem a criação, o gerenciamento e o compartilhamento de informações sobre um projeto de construção.',
    ],
    correta: 4, // E
    comentario: 'Gabarito Oficial FAFIPA: E. O BIM não é mero software CAD 3D, mas uma metodologia holística e colaborativa de gestão da informação paramétrica ao longo de todo o ciclo de vida do ativo.',
  },
  {
    id: 'fafipa_sesa_2026_q52',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '417_Geologia_e_Mecanica_dos_Solos',
    artigo: 'Índices Físicos do Solo: Grau de Saturação',
    enunciado: 'No desenvolvimento de projeto de fundação para uma nova unidade de saúde, faz-se necessário interpretar corretamente os relatórios de sondagem frente aos índices físicos do solo para prever o comportamento do terreno. Diante disso, assinale a alternativa que indica CORRETAMENTE o nome do índice definido pela razão entre o volume de água e o volume de vazios do solo.',
    alternativas: [
      'Grau de saturação.',
      'Porosidade.',
      'Teor de umidade.',
      'Peso específico natural.',
      'Índice de vazios.',
    ],
    correta: 0, // A
    comentario: 'Gabarito Oficial FAFIPA: A. O Grau de Saturação (Sr) é a relação percentual entre o volume de água contido nos poros (Vw) e o volume total de vazios do solo (Vv): Sr = (Vw / Vv) * 100%. Quando Sr = 100%, o solo está saturado.',
  },
  {
    id: 'fafipa_sesa_2026_q53',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '311_Materiais_de_Construcao',
    artigo: 'NBR 15575 - Desempenho: Impacto de Corpo Duro',
    enunciado: 'No desenvolvimento de atividades de controle de qualidade dos serviços executados em obras da SESA, o Engenheiro deve compreender os fundamentos dos ensaios de desempenho para validar os relatórios técnicos. Tendo em vista o método de avaliação de resistência ao impacto de corpo duro, assinale a alternativa que define CORRETAMENTE o seu princípio.',
    alternativas: [
      'Liberação de um corpo de prova de altura eventual, utilizando velocidade inicial impulsionada mecanicamente para simular impactos acidentais.',
      'Projeção pneumática de esferas metálicas contra a superfície do material para avaliar a resistência à abrasão superficial profunda.',
      'Utilização de um pêndulo com massa variável que atinge o componente lateralmente, medindo-se a energia absorvida durante a deformação elástica.',
      'Corpo com massa e forma conhecidas, liberado de altura estabelecida, em queda livre, que, ao atingir o componente, provoca dano verificável.',
      'Aplicação de uma carga estática concentrada no centro geométrico do componente, aumentada gradualmente até o surgimento de fissuras visíveis.',
    ],
    correta: 3, // D
    comentario: 'Gabarito Oficial FAFIPA: D. O ensaio de corpo duro da NBR 15575-4 utiliza uma esfera de aço de 1 kg ou 0,5 kg em queda livre ou pêndulo a partir de uma altura determinada gerando energia de impacto conhecida (ex: 2,5 J, 3,75 J) para verificar se há lascamentos, perfurações ou ruína.',
  },
  {
    id: 'fafipa_sesa_2026_q54',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '419_Fundacoes_Profundas_Taludes_e_Contencoes',
    artigo: 'Dinâmica dos Solos e Processos Erosivos',
    enunciado: 'O manejo inadequado do terreno é um fator determinante para a degradação ambiental em áreas de intervenção. Com base na dinâmica dos solos, assinale a alternativa que apresenta CORRETAMENTE uma condição ou prática que promove a intensificação dos processos erosivos.',
    alternativas: [
      'O planejamento do uso da terra, respeitando a sua aptidão técnica e limitações físicas.',
      'A adoção de práticas preventivas antes do início de qualquer escavação.',
      'A exposição direta do solo ao sol e à chuva, o que facilita a destruição de seus agregados.',
      'A manutenção da cobertura vegetal original para proteger a superfície do impacto das águas.',
      'O aumento da permeabilidade e da capacidade de infiltração do terreno.',
    ],
    correta: 2, // C
    comentario: 'Gabarito Oficial FAFIPA: C. O desmatamento e desnudamento do terreno expõem o solo ao impacto direto das gotas de chuva (efeito splash) e ao ressecamento solar, desagregando os torrões e acelerando a erosão laminar e em ravinas.',
  },
  {
    id: 'fafipa_sesa_2026_q55',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
    assunto: '628_Seguranca_em_Obras_NR18_NR35',
    artigo: 'NR-35 - Trabalho em Altura: Talabarte com Absorvedor de Energia',
    enunciado: 'Ao acompanhar atividades de manutenção predial em altura nas unidades da SESA, é responsabilidade do Engenheiro Civil verificar a adequação dos Equipamentos de Proteção Individual (EPIs), conforme a NR-35. Tendo em vista os requisitos para sistemas de retenção de quedas, assinale a alternativa CORRETA sobre a especificação técnica quando o elemento de ligação utilizado for um talabarte.',
    alternativas: [
      'Deve-se utilizar um talabarte com sistema de estabilização de impacto vertical.',
      'É mandatório o uso de talabarte com mecanismo de dissipação por mola helicoidal.',
      'Deve ser um talabarte integrado com absorvedor de energia.',
      'Tem que ser um talabarte dotado de redutor de tensão inercial.',
      'O dispositivo precisa ser um talabarte equipado com compensador de carga dinâmica.',
    ],
    correta: 2, // C
    comentario: 'Gabarito Oficial FAFIPA: C. A NR-35 exige que o talabarte para retenção de queda com comprimento superior a 0,90 m possua obrigatoriamente um absorvedor de energia integrado para limitar a força de impacto transmitida ao corpo do trabalhador a no máximo 6 kN.',
  },
  {
    id: 'fafipa_sesa_2026_q56',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '208_Contratos_e_Fiscalizacao',
    artigo: 'Art. 6º da Lei 14.133/21 - Regimes de Execução de Obras',
    enunciado: 'Ainda na esfera das conceituações trazidas pela Lei de Licitações e Contratos Administrativos, julgue verdadeiro (V) ou falso (F) o que se afirma a seguir e assinale a alternativa com a sequência CORRETA.\n\n(__) Empreitada por preço global: contratação da execução da obra ou do serviço por preço certo de unidades determinadas.\n(__) Contratação integrada: regime de contratação de obras e serviços de engenharia em que o contratado é responsável por elaborar e desenvolver os projetos básico e executivo, executar obras e serviços de engenharia, fornecer bens ou prestar serviços especiais e realizar montagem, teste, pré-operação e as demais operações necessárias e suficientes para a entrega final do objeto.\n(__) Credenciamento: processo administrativo de chamamento público em que a Administração Pública convoca interessados em prestar serviços ou fornecer bens para que, preenchidos os requisitos necessários, se credenciem no órgão ou na entidade para executar o objeto quando convocados.\n(__) Diálogo competitivo: modalidade de licitação obrigatória para aquisição de bens e serviços comuns, cujo critério de julgamento poderá ser o de menor preço ou o de maior desconto.',
    alternativas: [
      'V, F, V, F.',
      'V, V, F, F.',
      'V, F, F, V.',
      'F, V, F, V.',
      'F, V, V, F.',
    ],
    correta: 4, // E
    comentario: 'Gabarito Oficial FAFIPA: E (F, V, V, F). I é Falsa (por preço de unidades determinadas é empreitada por preço unitário, e não global); IV é Falsa (diálogo competitivo é para inovações e complexidades técnicas, e não para "bens e serviços comuns", que usam pregão).',
  },
  {
    id: 'fafipa_sesa_2026_q57',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '208_Contratos_e_Fiscalizacao',
    artigo: 'Art. 155 a 160 da Lei 14.133/21 - Sanções e Desconsideração da PJ',
    enunciado: 'Uma tarefa essencial ao ofício de engenheiro civil investido de cargo público é a de dominar a Lei de Licitações e Contratos Administrativos, e conhecer as infrações e sanções administrativas que a Lei estabelece. Acerca do assunto, julgue verdadeiro (V) ou falso (F) o que se afirma a seguir e assinale a alternativa com a sequência CORRETA.\n\n(__) Se a multa aplicada e as indenizações cabíveis forem superiores ao valor de pagamento eventualmente devido pela Administração ao contratado, além da perda desse valor, a diferença será descontada da garantia prestada ou será cobrada judicialmente.\n(__) Na hipótese de deferimento de pedido de produção de novas provas ou de juntada de provas julgadas indispensáveis pela comissão, o licitante ou o contratado poderá apresentar alegações finais no prazo de 30 (trinta) dias úteis, contado da data da intimação.\n(__) Serão indeferidas pela comissão, mediante decisão fundamentada, provas ilícitas, impertinentes, desnecessárias, protelatórias ou intempestivas.\n(__) A personalidade jurídica poderá ser desconsiderada sempre que utilizada com abuso do direito para facilitar, encobrir ou dissimular a prática dos atos ilícitos previstos nesta Lei ou para provocar confusão patrimonial...',
    alternativas: [
      'V, F, V, F.',
      'V, F, F, V.',
      'V, F, V, V.',
      'F, V, V, F.',
      'F, V, F, V.',
    ],
    correta: 2, // C
    comentario: 'Gabarito Oficial FAFIPA: C (V, F, V, V). O item II é falso porque o prazo para alegações finais após novas provas é de 15 (quinze) dias úteis (art. 158, § 2º), e não 30 dias úteis.',
  },
  {
    id: 'fafipa_sesa_2026_q58',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '208_Contratos_e_Fiscalizacao',
    artigo: 'Art. 155 e 156 da Lei 14.133/21 - Infrações Administrativas',
    enunciado: 'Tendo por base as infrações e sanções administrativas estabelecidas pela Lei de Licitações e Contratos Administrativos, considere as assertivas a seguir:\n\nI. O licitante ou o contratado será responsabilizado administrativamente pela seguinte infração: apresentar declaração ou documentação falsa exigida para o certame ou prestar declaração falsa durante a licitação ou a execução do contrato.\nII. O licitante ou o contratado será responsabilizado administrativamente pela seguinte infração: ensejar o retardamento da execução ou da entrega do objeto da licitação com ou sem motivo justificado.\nIII. Serão aplicadas ao responsável pelas infrações administrativas previstas nesta Lei as seguintes sanções: a) advertência; b) multa; c) impedimento de licitar e contratar; d) declaração de inidoneidade para licitar ou contratar.\nIV. Na aplicação das sanções, serão considerados: a) a natureza e a gravidade da infração cometida; b) as peculiaridades do caso concreto; c) as circunstâncias agravantes ou atenuantes; d) os danos que dela provierem para a Administração Pública; e) a implantação ou o aperfeiçoamento de programa de integridade, conforme normas e orientações dos órgãos de controle.\n\nEstá CORRETO o que se afirma em:',
    alternativas: [
      'I, II e III, apenas.',
      'II e IV, apenas.',
      'I, III e IV, apenas.',
      'II e III, apenas.',
      'I, II e IV, apenas.',
    ],
    correta: 2, // C
    comentario: 'Gabarito Oficial FAFIPA: C (I, III e IV apenas). O item II está incorreto porque a infração legal se configura quando o retardamento se dá "sem motivo justificado" (art. 155, VII), e não "com ou sem motivo justificado".',
  },
  {
    id: 'fafipa_sesa_2026_q59',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '208_Contratos_e_Fiscalizacao',
    artigo: 'Art. 137 e 139 da Lei 14.133/21 - Extinção dos Contratos',
    enunciado: 'À luz do que prevê a Lei nº 14.133/2021 acerca das hipóteses de extinção dos contratos, considere as assertivas a seguir:\n\nI. Constituirá motivo para extinção do contrato, a qual deverá ser formalmente motivada nos autos do processo, assegurados o contraditório e a ampla defesa, a seguinte situação: desatendimento das determinações regulares emitidas pela autoridade designada para acompanhar e fiscalizar sua execução ou por autoridade superior.\nII. Constituirá motivo para extinção do contrato, a qual deverá ser formalmente motivada nos autos do processo, assegurados o contraditório e a ampla defesa, a seguinte situação: caso fortuito ou força maior, regularmente comprovados, impeditivos da execução do contrato.\nIII. O contratado terá direito à extinção do contrato na seguinte hipótese: repetidas suspensões que totalizem 30 (trinta) dias úteis, independentemente do pagamento obrigatório de indenização pelas sucessivas e contratualmente imprevistas desmobilizações e mobilizações e outras previstas.\nIV. A extinção determinada por ato unilateral da Administração poderá acarretar, sem prejuízo das sanções previstas nesta Lei, na seguinte consequência: retenção dos créditos decorrentes do contrato até o limite dos prejuízos causados à Administração Pública e das multas aplicadas.\n\nEstá CORRETO o que se afirma em:',
    alternativas: [
      'I, II e III, apenas.',
      'I, II e IV, apenas.',
      'II e III, apenas.',
      'III e IV, apenas.',
      'II, III e IV, apenas.',
    ],
    correta: 1, // B
    comentario: 'Gabarito Oficial FAFIPA: B (I, II e IV). O item III está incorreto porque o prazo que autoriza o contratado a rescindir por suspensões sucessivas na Lei 14.133/21 é de 3 meses (ou mais de 2 meses no caso de calamidade/grave perturbação), e não 30 dias úteis.',
  },
  {
    id: 'fafipa_sesa_2026_q60',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '206_Licitacoes_Lei_14133',
    artigo: 'Art. 6º da Lei 14.133/21 - Conceitos Fundamentais',
    enunciado: 'Um tema de grande importância para o dia a dia do engenheiro civil investido na condição de agente público é acerca dos contratos administrativos. Nesse sentido, a Lei nº 14.133/2021, Lei de Licitações e Contratos Administrativos, lhe é basilar. De acordo com a referida Lei, bem como em relação às conceituações por ela trazidas, considere as assertivas a seguir:\n\nI. Obra: toda atividade estabelecida, por força de lei, como privativa das profissões de arquiteto e engenheiro que implica intervenção no meio ambiente por meio de um conjunto harmônico de ações que, agregadas, formam um todo que inova o espaço físico da natureza ou acarreta alteração substancial das características originais de bem imóvel.\nII. Bens e serviços especiais: aqueles cujos padrões de desempenho e qualidade podem ser objetivamente definidos pelo edital, por meio de especificações usuais de mercado.\nIII. Serviços contínuos com regime de dedicação exclusiva de mão de obra: aqueles cujo modelo de execução contratual exige, entre outros requisitos, que: a) os empregados do contratado fiquem à disposição nas dependências do contratante para a prestação dos serviços; b) o contratado não compartilhe os recursos humanos e materiais disponíveis de uma contratação para execução simultânea de outros contratos; c) o contratado possibilite a fiscalização pelo contratante quanto à distribuição, controle e supervisão dos recursos humanos alocados aos seus contratos.\nIV. Projeto básico: conjunto de elementos necessários e suficientes à execução completa da obra, com o detalhamento das soluções previstas no projeto superior, a identificação de serviços, de materiais e de equipamentos a serem incorporados à obra, bem como suas especificações técnicas, de acordo com as normas técnicas pertinentes.\n\nEstá CORRETO o que se afirma em:',
    alternativas: [
      'I, II e III, apenas.',
      'II e III, apenas.',
      'I e III, apenas.',
      'II, III e IV, apenas.',
      'II e IV, apenas.',
    ],
    correta: 2, // C
    comentario: 'Gabarito Oficial FAFIPA: C (I e III apenas). O item II está incorreto (o conceito descrito é o de bens e serviços comuns, e não especiais); o item IV está incorreto (o conceito descrito que traz a "execução completa com detalhamento de soluções" é o de Projeto Executivo, e não Projeto Básico).',
  },
];

/**
 * TODAS AS QUESTÕES DE PROVAS REAIS APROVADAS NO ESCOPO PARAMÉTRICO
 * Total: 242 questões
 * - PARANAEDUCAÇÃO 2026: 36 questões
 * - SESA 2026: 38 questões
 * - São João do Triunfo 2015: 26 questões
 * - Arapongas 2020: 21 questões
 * - Campo Magro 2016: 45 questões
 * - Lunardelli 2015: 26 questões
 * - Águas de Sarandi 2015: 25 questões
 * - Diamante do Norte 2015: 25 questões
 */
export const TODAS_QUESTOES_PROVAS_FAFIPA_REAIS: Questao[] = [
  ...QUESTOES_PARANAEDUCACAO_2026.map((q) => ({
    ...q,
    tipo: 'prova_anterior' as const,
    origem: 'prova_anterior',
    origemTipo: 'prova_passada' as const,
  })),
  ...QUESTOES_SESA_2026.map((q) => ({
    ...q,
    tipo: 'prova_anterior' as const,
    origem: 'prova_anterior',
    origemTipo: 'prova_passada' as const,
  })),
  ...QUESTOES_TRIUNFO_2015.map((q) => ({
    ...q,
    tipo: 'prova_anterior' as const,
    origem: 'prova_anterior',
    origemTipo: 'prova_passada' as const,
  })),
  ...QUESTOES_ARAPONGAS_2020.map((q) => ({
    ...q,
    tipo: 'prova_anterior' as const,
    origem: 'prova_anterior',
    origemTipo: 'prova_passada' as const,
  })),
  ...QUESTOES_CAMPO_MAGRO_2016.map((q) => ({
    ...q,
    tipo: 'prova_anterior' as const,
    origem: 'prova_anterior',
    origemTipo: 'prova_passada' as const,
  })),
  ...QUESTOES_LUNARDELLI_2015.map((q) => ({
    ...q,
    tipo: 'prova_anterior' as const,
    origem: 'prova_anterior',
    origemTipo: 'prova_passada' as const,
  })),
  ...QUESTOES_AGUAS_SARANDI_2015.map((q) => ({
    ...q,
    tipo: 'prova_anterior' as const,
    origem: 'prova_anterior',
    origemTipo: 'prova_passada' as const,
  })),
  ...QUESTOES_DIAMANTE_NORTE_2015.map((q) => ({
    ...q,
    tipo: 'prova_anterior' as const,
    origem: 'prova_anterior',
    origemTipo: 'prova_passada' as const,
  })),
];

/**
 * DEFINIÇÃO DAS SESSÕES OFICIAIS DE PROVAS REAIS PERMANENTES
 */
export const SESSOES_PROVAS_FAFIPA_INICIAIS: SessaoCriada[] = [
  {
    id: 'prv_2026_fafipa_paranaeducacao',
    codigo: 'FAFIPA-2026-PARANAEDUCACAO-ENG.CIVIL',
    dataHora: '12/04/2026 13:30',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil - Curitiba',
    disciplina: '2026, Fundação FAFIPA, PARANAEDUCAÇÃO',
    assunto: 'FAFIPA 2026 - PARANAEDUCAÇÃO - Engenheiro Civil',
    quantidade: QUESTOES_PARANAEDUCACAO_2026.length, // 36
    questaoIds: QUESTOES_PARANAEDUCACAO_2026.map((q) => q.id),
    questoesSnap: QUESTOES_PARANAEDUCACAO_2026,
    tipo: 'prova_anterior',
    tempoSegundos: 0,
    concluida: false,
    ano: 2026,
    orgao: 'PARANAEDUCAÇÃO',
    created_at: new Date(2026, 3, 12, 13, 30).toISOString(),
  },
  {
    id: 'prv_2026_fafipa_sesa',
    codigo: 'FAFIPA-2026-SESA-ENG.CIVIL',
    dataHora: '29/03/2026 13:30',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Promotor de Saúde - Engenheiro Civil',
    disciplina: '2026, Fundação FAFIPA, SESA',
    assunto: 'FAFIPA 2026 - SESA - Promotor de Saúde (Engenheiro Civil)',
    quantidade: QUESTOES_SESA_2026.length, // 38
    questaoIds: QUESTOES_SESA_2026.map((q) => q.id),
    questoesSnap: QUESTOES_SESA_2026,
    tipo: 'prova_anterior',
    tempoSegundos: 0,
    concluida: false,
    ano: 2026,
    orgao: 'SESA',
    created_at: new Date(2026, 2, 29, 13, 30).toISOString(),
  },
  SESSAO_TRIUNFO_2015,
  SESSAO_ARAPONGAS_2020,
  SESSAO_CAMPO_MAGRO_2016,
  SESSAO_LUNARDELLI_2015,
  SESSAO_AGUAS_SARANDI_2015,
  SESSAO_DIAMANTE_NORTE_2015,
];


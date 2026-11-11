import { Questao, SessaoCriada } from '../../types';

/**
 * QUESTÕES REAIS DA PROVA: PREFEITURA MUNICIPAL DE CAMPO MAGRO (2016)
 * Cargo: Engenheiro Civil
 * Banca: Fundação FAFIPA
 * Total da Prova Original: 50 questões
 * Aprovadas no Escopo Paramétrico (7 Blocos / 34 Matérias): 45 questões
 *   - Língua Portuguesa: 10 questões (Q01 a Q10)
 *   - Noções de Informática: 10 questões (Q16 a Q25)
 *   - Conhecimentos Específicos de Engenharia Civil: 25 questões (Q26 a Q50)
 * Descartadas por estarem fora do Edital: 5 questões
 *   - Q11 a Q15 (Raciocínio Lógico e Matemático / Sequências / Conjuntos / Regra de 3)
 */

export const QUESTOES_CAMPO_MAGRO_2016: Questao[] = [
  // --- Língua Portuguesa (Q01 a Q10) ---
  {
    id: 'fafipa_campomagro_2016_q01',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Compreensão e Interpretação de Texto',
    enunciado:
      'O texto a seguir servirá de base para responder às questões de 01 a 10:\n\n' +
      '"Mensagem subliminar\nGabriela Cabral\n\n' +
      'A mensagem subliminar designa o tipo de mensagem que não é perceptível pelos limites sensoriais do organismo. Dessa forma, é transmitida por estímulos pouco intensos que não são percebidos pela consciência humana, mas que são notados inconscientemente pela visão periférica (em casos de mensagens visuais), a qual capta imagens sem utilizar a fóvea (parte da retina que focaliza objetos). Quanto maior for a intensidade dos estímulos supraliminares, maior é a chance de estes serem percebidos, de forma que o armazenamento dos estímulos subliminares se dá quando os supraliminares estão sendo armazenados.\n' +
      'De forma auditiva, olfativa, gustativa, tátil ou visual, as mensagens subliminares, ao serem absorvidas, não são identificadas pelo cérebro, o que facilmente as sobrepõe às escolhas, atitudes e tomada de decisões influenciando-as. Apesar de atuarem sobre os cinco sentidos humanos, 90% das mensagens subliminares estão sob as formas visuais e auditivas.\n' +
      'Conscientemente, não se pode perceber a quantidade e a forma de milhares de estímulos que se recebem diariamente, mas cientistas, através de experiências, conseguiram perceber quando o cérebro registra uma mensagem subliminar e como isso ocorre.\n' +
      'A mensagem subliminar, apesar de ser antiética e proibida pelo Código de Defesa do Consumidor, ainda é empregada na televisão em comerciais, shows, novelas, filmes, eventos e outros que se valem de tal meio para se autopromoverem e ainda para realizarem um merchandising dos produtos de seus colaboradores."\n\n' +
      'Com base no texto, assinale a alternativa que contém apenas informações INCORRETAS:',
    alternativas: [
      'A mensagem subliminar é um tipo de mensagem que não é percebida pelos limites sensoriais do organismo.',
      'O armazenamento dos estímulos subliminares ocorre, concomitantemente, ao dos estímulos superliminares.',
      'A maioria das mensagens subliminares são provocadas por estímulos visuais e auditivos.',
      'As mensagens subliminares podem ser livremente empregadas apenas em comerciais.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. O texto afirma expressamente que a mensagem subliminar é "antiética e proibida pelo Código de Defesa do Consumidor", além de ser empregada clandestinamente em múltiplos meios (shows, novelas, filmes, eventos), de modo que a afirmação de que pode ser "livremente empregada" é flagrantemente incorreta.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q02',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Emprego do Sinal Indicativo de Crase',
    enunciado: 'Assinale a oração em que o sinal indicativo de crase foi INCORRETAMENTE empregado:',
    alternativas: [
      'Vocês contaram essa história àlguem?',
      'A família de José preparou a festa de aniversário para ele às escondidas.',
      'Por favor, entregue o relatório àquela secretária!',
      'Os viajantes partiram às 8:00 horas.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. "Alguém" é pronome indefinido que não admite artigo feminino "a", sendo vedado o emprego do acento grave indicativo de crase antes de pronomes indefinidos.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q03',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Classes de Palavras: Pronomes Indefinidos',
    enunciado: 'Na oração “Ninguém viu Joana nos últimos dias.”, a palavra “ninguém” é classificada como:',
    alternativas: [
      'Advérbio.',
      'Pronome Indefinido.',
      'Numeral.',
      'Substantivo.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. "Ninguém" é um pronome substantivo indefinido, referindo-se à 3ª pessoa do discurso de maneira vaga ou indeterminada.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q04',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Concordância Nominal: Adjetivos de Cores e Substantivos Apositivos',
    enunciado: 'Quais formas adjetivais cabem nas lacunas da oração “Por que você comprou meias _______, calças ______ e camisas _________?”:',
    alternativas: [
      'Laranja, cinzas, vermelha.',
      'Laranjas, cinza, vermelhas.',
      'Laranja, cinza, vermelhas.',
      'Laranjas, cinzas, vermelhas.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C (Laranja, cinza, vermelhas). Substantivos empregados como adjetivos de cor (laranja, cinza) permanecem invariáveis no plural ("meias laranja", "calças cinza"). Já "vermelha" é adjetivo genuíno e flexiona normalmente concordando com "camisas" ("camisas vermelhas").',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q05',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Termos Integrantes da Oração: Objeto Direto',
    enunciado: 'Na oração “Eles compraram um carro usado.”, a expressão “um carro usado” desempenha a função de:',
    alternativas: [
      'Objeto direto.',
      'Sujeito.',
      'Objeto indireto.',
      'Adjunto adverbial.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. O verbo "comprar" é transitivo direto (quem compra, compra algo sem preposição obrigatória); o termo "um carro usado" completa seu sentido, exercendo a função sintática de Objeto Direto.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q06',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Regência Verbal: Verbo Auxiliar',
    enunciado: 'Assinale a alternativa que complete a regência do verbo “auxiliar” na oração “Elas não nos auxiliaram __ limpar as salas.”:',
    alternativas: [
      'a.',
      'por.',
      'de.',
      'em.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. Na norma culta, o verbo auxiliar rege a preposição "a" quando associado a verbo no infinitivo: auxiliar alguém a fazer algo ("auxiliaram a limpar").',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q07',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Divisão Silábica e Contagem de Sílabas',
    enunciado: 'Quantas sílabas tem a palavra “reflorestar”:',
    alternativas: [
      '5 sílabas.',
      '4 sílabas.',
      '7 sílabas.',
      '8 sílabas.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. A divisão silábica da palavra é re-flo-res-tar, constituindo um vocábulo de 4 sílabas (polissílabo).',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q08',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Conjunções Subordinativas Integrantes',
    enunciado:
      'Quais conjunções subordinativas podem preencher, adequada e respectivamente, as lacunas do período “Meus pais disseram __ eles vêm nos visitar hoje, mas não sei ao certo ___ vão ficar até o jantar.”:',
    alternativas: [
      'se, se.',
      'se, que.',
      'que, se.',
      'que, que.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. Na primeira oração, a oração subordinada substantiva objetiva direta introduz certeza declarada ("disseram que eles vêm"); na segunda, introduz dúvida/incerteza ("não sei ao certo se vão ficar"). Ambas atuam como conjunções subordinativas integrantes.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q09',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Regência Nominal e Emprego de Preposição',
    enunciado:
      'Assinale a opção que contém a preposição que preenche a lacuna da oração “Nos últimos quatro anos, o interesse _ línguas estrangeiras cresceu vertiginosamente.”:',
    alternativas: [
      'de.',
      'a.',
      'sob.',
      'por.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. O substantivo "interesse" rege habitualmente a preposição "por" ("interesse por algo/alguém"). Logo: "o interesse por línguas estrangeiras".',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q10',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Pronomes Relativos e Funções Sintáticas',
    enunciado:
      'Qual função desempenha a palavra “que” na oração “As camisas que comprei ontem não couberam direito.”:',
    alternativas: [
      'Pronome relativo.',
      'Pronome interrogativo.',
      'Pronome adjetivo.',
      'Conjunção subordinativa causal.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. A palavra "que" introduz uma oração subordinada adjetiva ("que comprei ontem") e substitui o antecedente "as camisas" ("comprei as camisas ontem"), exercendo a função morfológica de Pronome Relativo.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },

  // --- Noções de Informática (Q16 a Q25) ---
  {
    id: 'fafipa_campomagro_2016_q16',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '734_Informatica_II_Aplicativos_e_Internet',
    artigo: 'Processadores de Texto: Teclas de Atalho no MS-Word',
    enunciado:
      'Considerando o Ms-Word 2010, versão em português, em sua instalação padrão, a opção de "Salvar Como" que permite salvar uma cópia do documento, ou salvar o documento em um local diferente, pode ser acessada através da tecla:',
    alternativas: [
      'F1.',
      'F2.',
      'F5.',
      'F12.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. No Microsoft Word (e pacote Office), a tecla de função F12 aciona diretamente a caixa de diálogo "Salvar Como". F1 abre a Ajuda e F5 abre a caixa Localizar/Substituir/Ir para.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q17',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '734_Informatica_II_Aplicativos_e_Internet',
    artigo: 'Navegadores Web: Conceito de Software Portable',
    enunciado: 'A versão PORTABLE do navegador Google Chrome é caracterizada por:',
    alternativas: [
      'Ser compatível apenas com o Sistema Operacional LINUX.',
      'Não exigir ser instalada no computador, podendo ser executada diretamente de um pendrive.',
      'Ser desenvolvida apenas para os smartphones com o Sistema Operacional Android.',
      'Permitir apenas o acesso ao site de busca www.google.com.br.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. Softwares portáteis (portables) são executáveis que operam de forma autocontida sem necessidade de instalação no sistema operacional ou gravação no Registro do Windows, podendo ser rodados a partir de unidades removíveis como pendrives.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q18',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '733_Informatica_I_Conceitos_e_Sistemas',
    artigo: 'Sistemas Operacionais: Estrutura de Diretórios no Windows',
    enunciado:
      'Considerando o Sistema Operacional Windows, em sua instalação padrão, no Prompt de Comando a indicação da unidade "C:\\" representa:',
    alternativas: [
      'A Raiz do disco rígido.',
      'A Lixeira.',
      'O diretório Meus Documentos.',
      'O diretório Arquivos de Programas.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. "C:\\" representa a raiz (root directory) da partição principal do disco rígido onde o sistema operacional e os arquivos principais se encontram instalados.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q19',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '733_Informatica_I_Conceitos_e_Sistemas',
    artigo: 'Gerenciamento de Pastas e Arquivos no Windows 10',
    enunciado:
      'Considerando o Sistema Operacional Windows 10, e um diretório vazio, ao criar uma NOVA PASTA através do Explorador de Arquivos, é preciso informar um nome para sua identificação. Caso o usuário NÃO informe um nome para a respectiva pasta:',
    alternativas: [
      'Uma mensagem de erro será exibida e a pasta não será criada.',
      'A pasta será criada sem um nome de identificação.',
      'A pasta será criada com o nome padrão "Nova pasta".',
      'Uma mensagem de erro será exibida, solicitando que o usuário informe um nome para a pasta.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. Ao criar uma pasta no Explorador de Arquivos sem digitar nenhum texto e pressionar Enter, o Windows atribui automaticamente o nome padrão "Nova pasta" (ou "Nova pasta (2)" caso já exista outra).',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q20',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '734_Informatica_II_Aplicativos_e_Internet',
    artigo: 'Recursos de Ilustração e Desenho no MS-Word',
    enunciado:
      'Considerando o Ms-Word 2010, versão em português, em sua instalação padrão, setas, estrelas, retângulos e círculos podem ser inseridos em um documento através do recurso:',
    alternativas: [
      'Geometria.',
      'Objetos.',
      'Formas.',
      'Figuras.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. Na guia "Inserir" do grupo "Ilustrações" do Microsoft Word, o comando denominado "Formas" (Shapes) disponibiliza formas pré-desenhadas geométricas, setas, faixas e estrelas.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q21',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '734_Informatica_II_Aplicativos_e_Internet',
    artigo: 'Planilhas Eletrônicas: Tipos de Gráficos no MS-Excel',
    enunciado:
      'Considerando o Ms-Excel 2010, versão em português em sua instalação padrão, as opções Dispersão, Pizza e Barras representam, respectivamente, tipos de:',
    alternativas: [
      'Bordas da página.',
      'Gráficos.',
      'Sumários.',
      'Parágrafos.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. Na guia "Inserir" do Microsoft Excel, o grupo "Gráficos" inclui categorias consagradas como Colunas, Linhas, Pizza, Barra, Área e Dispersão (X,Y).',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q22',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '734_Informatica_II_Aplicativos_e_Internet',
    artigo: 'Mecanismos de Busca e Navegação na Internet',
    enunciado:
      'Considerando o motor de busca www.google.com.br, abaixo da barra de pesquisa, por padrão, existe(m) disponível(eis) para o usuário:',
    alternativas: [
      'Apenas um botão com a opção de pesquisar.',
      'Dois botões com opções de pesquisar.',
      'Três botões com opções de pesquisar.',
      'Quatro botões com opções de pesquisar.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. Na página inicial clássica de busca do Google existem exatamente dois botões de ação: "Pesquisa Google" e "Estou com sorte".',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q23',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '734_Informatica_II_Aplicativos_e_Internet',
    artigo: 'Correio Eletrônico: Conceitos e Procedimentos de E-mail',
    enunciado: 'Acerca da atividade de envio e recebimento de E-Mails, assinale a alternativa CORRETA:',
    alternativas: [
      'Ao utilizar a opção de RESPONDER um e-mail, os anexos recebidos não serão incluídos na resposta do e-mail.',
      'O campo "Cc" permite a inclusão de apenas um destinatário, enquanto o campo "Cco" possibilita a inclusão de diversos endereços de e-mails.',
      'Ao anexar um documento no e-mail, é realizada uma operação de download do arquivo do computador do usuário para a internet.',
      'O campo "Assunto" é de preenchimento obrigatório, ou seja, sem seu preenchimento o e-mail não pode ser enviado.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. Ao clicar em "Responder", os clientes de e-mail por padrão copiam apenas o histórico de texto da mensagem original, omitindo os arquivos anexos (para reenviar os anexos utiliza-se a opção "Encaminhar").',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q24',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '734_Informatica_II_Aplicativos_e_Internet',
    artigo: 'Operações com Linhas e Colunas no MS-Excel',
    enunciado:
      'Considerando o Ms-Excel 2010, versão em português em sua instalação padrão, ao clicar diretamente na letra "B" que identifica o cabeçalho da coluna na planilha:',
    alternativas: [
      'A coluna B será automaticamente duplicada.',
      'A coluna B será ocultada da planilha.',
      'A primeira linha será selecionada.',
      'Toda a coluna será selecionada.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. Ao clicar no rótulo da letra de uma coluna no Excel, o aplicativo seleciona imediatamente todas as células contidas naquela coluna inteira, de 1 até a última linha.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q25',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '734_Informatica_II_Aplicativos_e_Internet',
    artigo: 'Configuração de Página e Marca d’Água no MS-Word',
    enunciado:
      'Considerando o Ms-Word 2010, versão em português, em sua instalação padrão, o recurso de "MARCA D\'ÁGUA", realiza uma personalização:',
    alternativas: [
      'Na borda da página.',
      'No cabeçalho da página.',
      'No rodapé da página.',
      'No Plano de Fundo da Página.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. A marca d’água insere textos esmaecidos (como "Confidencial" ou "Rascunho") ou imagens semitransparentes no plano de fundo de cada página do documento.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },

  // --- Conhecimentos Específicos de Engenharia Civil (Q26 a Q50) ---
  {
    id: 'fafipa_campomagro_2016_q26',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '417_Geologia_e_Mecanica_dos_Solos',
    artigo: 'Identificação e Classificação de Solos em Obras Rodoviárias',
    enunciado:
      'Sabendo que o solo é uma formação natural resultante da transformação de uma rocha-mãe pela influência de diversos processos físicos, físico-químicos e biológicos e de imprescindível conhecimento no âmbito da engenharia rodoviária, assinale a alternativa CORRETA quanto à descrição dos solos apresentados:',
    alternativas: [
      'Turfa – Solo sem plasticidade, marrom-escuro a preto, muito compressível e combustível quando seco; Cascalho – Solo com grande percentagem de pedregulho, podendo ter diferentes origens fluvial, glacial e residual; Topsoil – Solo areno-siltoso, com pouca ou nenhuma argila, encontrado nas camadas superficiais de terrenos de pequena declividade, ou nas partes baixas de bacias hidrográficas.',
      'Turfa – Solo com grande percentagem de pedregulho, podendo ter diferentes origens fluvial, glacial e residual; Cascalho – Solo sem plasticidade, marrom-escuro a preto, muito compressível e combustível quando seco; Topsoil – Solo areno-siltoso, com pouca ou nenhuma argila, encontrado nas camadas superficiais de terrenos de pequena declividade, ou nas partes baixas de bacias hidrográficas.',
      'Turfa – Solo areno-siltoso, com pouca ou nenhuma argila, encontrado nas camadas superficiais de terrenos de pequena declividade, ou nas partes baixas de bacias hidrográficas; Cascalho – Solo com grande percentagem de pedregulho, podendo ter diferentes origens fluvial, glacial e residual; Topsoil – Solo sem plasticidade, marrom-escuro a preto, muito compressível e combustível quando seco.',
      'Turfa – Solo sem plasticidade, marrom-escuro a preto, muito compressível e combustível quando seco; Cascalho – Solo areno-siltoso, com pouca ou nenhuma argila, encontrado nas camadas superficiais de terrenos de pequena declividade, ou nas partes baixas de bacias hidrográficas; Topsoil – Solo com grande percentagem de pedregulho, podendo ter diferentes origens fluvial, glacial e residual.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. A turfa é um solo altamente orgânico, escuro, compressível e combustível; cascalho é fração granular grossa de pedregulhos; e topsoil é o solo superficial de topo de horizonte pedológico.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q27',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '417_Geologia_e_Mecanica_dos_Solos',
    artigo: 'Índices Físicos do Solo: Índice de Vazios e Porosidade',
    enunciado:
      'Os índices físicos são relações entre volume e peso das fases do solo. Tendo como referência as siglas: Var = volume de ar; Va = volume de água; Vg = volume dos grãos sólidos; Vt = volume total e Vv = volume de vazios; assinale a alternativa que traga o índice de vazios (e) e a porosidade (n) de uma amostra de solo respectivamente nessa ordem, sabendo que o mesmo possui os seguintes volumes adimensionais: Vt = 6 e Vg = 3.',
    alternativas: [
      '0,50; 1.',
      '2; 1.',
      '0,50; 2.',
      '1; 0,50.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D (1; 0,50). Volume de vazios: Vv = Vt - Vg = 6 - 3 = 3. O índice de vazios é dado por e = Vv / Vg = 3 / 3 = 1,0. A porosidade é dada por n = Vv / Vt = 3 / 6 = 0,50.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q28',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '417_Geologia_e_Mecanica_dos_Solos',
    artigo: 'Capilaridade e Tensão Superficial em Solos',
    enunciado:
      'Dentre as propriedades físicas e mecânicas do solo, destaca-se a propriedade que os solos apresentam de poder absorver água por ação da tensão superficial, inclusive opondo-se à força da gravidade, que é conhecida como:',
    alternativas: [
      'Permeabilidade.',
      'Compressibilidade.',
      'Capilaridade.',
      'Elasticidade.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. A capilaridade é o fenômeno físico provocado pelas forças de atração molecular e tensão superficial na interface meniscal água-ar nos canalículos formados pelos poros do solo, promovendo a ascensão capilar.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q29',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '311_Materiais_de_Construcao',
    artigo: 'Materiais de Construção: Classificação de Brita Corrida',
    enunciado: 'A brita corrida é definida tecnicamente como:',
    alternativas: [
      'O resultante da britagem, sem haver qualquer processo de separação granulométrica.',
      'Uma porção de rocha não trabalhada, ou seja, rocha bruta.',
      'A brita que obedece a determinados limites de diâmetro.',
      'O produto da britagem, com diâmetro das partículas menores que 2,0mm.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. Brita corrida (ou material britado bica corrida) é o material obtido diretamente do britador primário/secundário sem passar por peneiramento classificatório prévio de separação granulométrica.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q30',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '523_Abastecimento_de_Agua',
    artigo: 'Rede de Distribuição de Água: Vazão de Distribuição',
    enunciado:
      'Rede de distribuição é a parte do sistema de abastecimento formada de tubulações e órgãos acessórios, destinada a colocar água potável à disposição dos consumidores, de forma contínua, em quantidade e pressão recomendadas. Assim, diante da definição apresentada, o consumo acrescido das perdas que podem ocorrer na rede é a:',
    alternativas: [
      'Área de manobra.',
      'Área de medição.',
      'Vazão de distribuição.',
      'Pressão estática disponível.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. Na NBR 12218, a vazão de distribuição corresponde à vazão demandada pelos consumidores acrescida do volume estimado de perdas operacionais e físicas ao longo da malha distribuidora.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q31',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '523_Abastecimento_de_Agua',
    artigo: 'Sistemas de Abastecimento: Conceito de Zona de Pressão',
    enunciado:
      'No Projeto de rede de distribuição de água para abastecimento público a área abrangida por uma subdivisão da rede, na qual as pressões estática e dinâmica obedecem a limites prefixados, é denominada de:',
    alternativas: [
      'Zona mista.',
      'Zona de pressão.',
      'Zona interstística.',
      'Zona perimetral.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. Segundo a NBR 12218, "zona de pressão" é a subdivisão topográfica da malha distribuidora abastecida de forma independente (por reservatórios ou válvulas redutoras) para manter as pressões dentro dos limites normativos.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q32',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '523_Abastecimento_de_Agua',
    artigo: 'NBR 12218: Limites de Pressão Estática e Dinâmica em Redes de Água',
    enunciado:
      'Complete as lacunas da frase abaixo de acordo com a NBR 12218 - Projeto de rede de distribuição de água para abastecimento público:\n\n' +
      '“A pressão estática máxima nas tubulações distribuidoras deve ser de ____ kPa, e a pressão dinâmica mínima, de ____ kPa.”',
    alternativas: [
      '1.000; 100.',
      '1.200, 50.',
      '500; 10.',
      '500; 100.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D (500 kPa; 100 kPa). A NBR 12218 estabelece que a pressão estática máxima não deve ultrapassar 500 kPa (50 mca) para evitar rompimentos, e a pressão dinâmica mínima não deve ser inferior a 100 kPa (10 mca) no ponto mais desfavorável.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q33',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '421_Drenagem_Urbana',
    artigo: 'Drenagem Urbana e Coberturas: Área de Captação',
    enunciado:
      'Na drenagem urbana a área, em metros quadrados, projetada na horizontal da superfície impermeável da cobertura onde a água é recepcionada, recebe o nome de:',
    alternativas: [
      'Área de manancial.',
      'Área de captação.',
      'Área de suprimento.',
      'Área de virgem.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. Na NBR 10844 (Instalações prediais de águas pluviais), área de captação (ou área de contribuição) é a projeção horizontal da área impermeabilizada que recolhe a precipitação pluviométrica e a canaliza para as calhas.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q34',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '524_Esgotamento_Sanitario_e_ETE',
    artigo: 'Órgãos Acessórios de Redes de Esgoto: Tubo de Inspeção e Limpeza (TIL)',
    enunciado:
      'Em uma rede pública de esgoto, o dispositivo não visitável que permite a inspeção e introdução de equipamentos de limpeza denomina-se:',
    alternativas: [
      'Poço de visita (PV).',
      'Terminal de limpeza (TL).',
      'Tubo de inspeção e limpeza (TIL).',
      'Caixa de passagem (CP).',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. O Tubo de Inspeção e Limpeza (TIL) é o poço de inspeção não visitável que permite a passagem de hastes de desobstrução e inspeção por vídeo da rede coletora de esgoto.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q35',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '524_Esgotamento_Sanitario_e_ETE',
    artigo: 'Obras Especiais em Redes de Esgoto: Sifão Invertido em Cursos d’Água',
    enunciado:
      'Na execução da rede pública de esgoto no município de Campo Magro, diante de um curso d’água identificado na escavação, o engenheiro utilizou uma técnica de rebaixamento do trecho com escoamento sob pressão para viabilizar a continuidade da rede. Essa técnica denomina-se:',
    alternativas: [
      'Recobrimento.',
      'Tubo de queda.',
      'Sifão invertido.',
      'Buzinote.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. O sifão invertido é uma canalização sob pressão instalada para transpor depressões, galerias ou cursos d’água fluviais, mantendo a continuidade do escoamento gravitacional a jusante.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q36',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '524_Esgotamento_Sanitario_e_ETE',
    artigo: 'Tratamento Biológico de Esgoto: Biofiltro Aerado Submerso',
    enunciado:
      'Em uma estação de tratamento de esgoto sanitário, a unidade de tratamento biológico na qual se desenvolve processo unitário com adição de ar, dotada de meio suporte estruturado e randômico e de decantador secundário para remoção de sólidos em suspensão de seu efluente, recebe o nome de:',
    alternativas: [
      'Biofiltro aerado submerso.',
      'Câmara seletora.',
      'Sistema de utilidade.',
      'Biofiltro anaeróbico submerso.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. O Biofiltro Aerado Submerso (BAS) é um reator biológico de biomassa aderida onde o esgoto flui através de meio suporte granular ou plástico com aeração artificial contínua.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q37',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '524_Esgotamento_Sanitario_e_ETE',
    artigo: 'Processamento e Gerenciamento de Lodo em ETE: Desaguamento',
    enunciado: 'O desaguamento em uma estação de tratamento de esgoto sanitário é a operação que:',
    alternativas: [
      'Limpa os decantadores primários.',
      'Reduz a umidade do lodo.',
      'Retira o excesso de sedimentos dos floculadores.',
      'Envia para o ambiente o esgoto tratado.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. O desaguamento (ou desidratação do lodo por centrífuga, filtro prensa ou leitos de secagem) tem a finalidade de reduzir o teor de água do lodo digerido, facilitando seu transporte e destinação final.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q38',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '524_Esgotamento_Sanitario_e_ETE',
    artigo: 'Cinética do Tratamento por Lodos Ativados: Idade do Lodo',
    enunciado: 'O tempo de detenção celular na estação de tratamento de esgoto sanitário equivale a:',
    alternativas: [
      'Tempo de sedimentação.',
      'Taxa de escoamento em vertedor.',
      'Tempo de tratamento do esgoto.',
      'Idade do lodo.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. O tempo médio de retenção de sólidos celulares (θc) no sistema de tratamento biológico é denominado tecnicamente como "Idade do Lodo" (tempo de retenção celular).',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q39',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '524_Esgotamento_Sanitario_e_ETE',
    artigo: 'Fases do Tratamento de Esgoto: Tratamento Terciário',
    enunciado:
      'No processo de tratamento de esgoto sanitário, a etapa que visa, principalmente, à remoção de nutrientes (fósforo e nitrogênio) ou microrganismos patogênicos, recebe o nome de:',
    alternativas: [
      'Tratamento primário.',
      'Tratamento secundário.',
      'Tratamento terciário.',
      'Tratamento quaternário.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. O tratamento terciário é a etapa avançada pós-tratamento biológico que objetiva remover nutrientes eutrofizantes (N e P), metais pesados, microrganismos ou compostos refratários.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q40',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '209_Planejamento_e_Controle_de_Obras',
    artigo: 'Planejamento e Controle de Obras: Cronograma Físico',
    enunciado:
      'Em um canteiro de obra o documento em que se registram, pela ordem de sucessão em que são executados, os serviços necessários à realização da construção e os respectivos prazos, previstos em função dos recursos e facilidades que se supõe serem disponíveis é o:',
    alternativas: [
      'Livro de Ordem.',
      'Cronograma de obras.',
      'Planilha de quantitativos.',
      'Memorial descritivo.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. O cronograma de obras é a representação gráfica e temporal da sequência das atividades construtivas e seus prazos estimados de início e término.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q41',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '210_Orcamento_Medicao_e_BIM',
    artigo: 'Avaliação de Custos Imobiliários: Custo Unitário de Construção (CUB)',
    enunciado:
      'Assinale a alternativa que representa a nomenclatura CORRETA do resultado obtido pela divisão do custo global da construção, pela área equivalente em área de custo padrão global:',
    alternativas: [
      'Custo unitário de construção.',
      'Custo total da construção.',
      'Custo equivalente da construção.',
      'Custo real da construção.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. Segundo a NBR 12721, a razão entre o custo global da obra e a área equivalente total em área de custo padrão representa o Custo Unitário da Construção.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q42',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
    assunto: '104_Codigo_de_Obras',
    artigo: 'Conceituação de Áreas de Edificação: Área Privativa Acessória',
    enunciado:
      'Em uma edificação as áreas, situadas fora dos limites físicos da área privativa principal, tais como depósitos, box de lavanderia, vagas de garagem vinculadas, são denominadas de:',
    alternativas: [
      'Área global.',
      'Área contundente.',
      'Área paralela a principal.',
      'Área privativa acessória.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. Na conceituação da NBR 12721 e normas edílicas, a área privativa acessória compreende as áreas de uso exclusivo do condômino localizadas fora dos limites da unidade principal (ex.: depósito no subsolo ou vaga vinculada).',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q43',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '210_Orcamento_Medicao_e_BIM',
    artigo: 'NBR 12721: Classificação Orçamentária de Serviços de Pavimentação',
    enunciado:
      'De acordo com a NBR 12721 - Avaliação de custos de construção para incorporação imobiliária e outras disposições para condomínios edilícios, na discriminação orçamentária o serviço de contrapiso é classificado como:',
    alternativas: [
      'Infraestrutura.',
      'Supraestrutura.',
      'Revestimentos.',
      'Pavimentações.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. Na estrutura analítica padrão de orçamento da NBR 12721, o serviço de contrapiso integra o item "Pavimentações" (item 7), como base de piso.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q44',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
    assunto: '629_Vistorias_Pericias_e_Documentacao',
    artigo: 'NBR 13752: Requisitos de Laudos de Perícias de Engenharia',
    enunciado:
      'Na apresentação de todos os laudos de perícias em edificações civis (NBR 13752), devem constar obrigatoriamente as seguintes informações, EXCETO:',
    alternativas: [
      'A data da vistoria.',
      'O cálculo e a determinação do valor final.',
      'O diagnóstico da situação encontrada.',
      'O proprietário do bem objeto da perícia.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. O cálculo do valor monetário do bem é objeto específico de laudo de avaliação de imóveis (NBR 14653). Os laudos de perícia de engenharia diagnóstica focam em constatação fática, causas, anomalias e responsabilidades técnicas.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q45',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '311_Materiais_de_Construcao',
    artigo: 'Armazenamento de Aglomerantes: Pilhas de Sacos de Cimento',
    enunciado:
      'Os sacos de cimento de 50 Kg devem ser armazenados em locais bem secos e bem protegidos para preservação da qualidade, e de forma que permita fácil acesso à inspeção e à identificação de cada lote. As pilhas devem ser colocadas sobre estrados secos e NÃO devem conter mais de:',
    alternativas: [
      'Cinco sacos de altura.',
      'Dez sacos de altura.',
      'Vinte sacos de altura.',
      'Quinze sacos de altura.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B (Dez sacos de altura). Conforme normas técnicas e de segurança na construção (NR-18 e boas práticas de tecnologia de concreto), o empilhamento máximo de sacos de cimento sobre estrado de madeira é de 10 sacos para evitar a compactação e empedramento das camadas inferiores.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q46',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '315_Concreto_Armado',
    artigo: 'Conceito e Mecanismo do Concreto Protendido',
    enunciado:
      'Quando a armadura de aço em uma obra é previamente alongada por equipamentos especiais, com a finalidade de, em condições de serviço, impedir ou limitar a fissuração e os deslocamentos da estrutura, bem como propiciar o melhor aproveitamento de aços de alta resistência no estado-limite último, tem-se a:',
    alternativas: [
      'Protensão.',
      'Dilatação.',
      'Compressão.',
      'Torção.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. A protensão consiste na aplicação deliberada de tensões prévias de compressão no concreto através do tracionamento de cordoalhas ou barras de aço de alta resistência, pré ou pós-tensionadas.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q47',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '315_Concreto_Armado',
    artigo: 'NBR 6118: Simbologia de Tensões de Cisalhamento',
    enunciado: 'A simbologia τ_wd (tau_wd) retirada da NBR 6118 - Projeto de estruturas de concreto — Procedimento, significa:',
    alternativas: [
      'Tensão normal solicitante de cálculo.',
      'Tensão de cisalhamento de cálculo, por torção.',
      'Tensão de cisalhamento de cálculo, por força cortante.',
      'Tensão normal no aço de armadura passiva.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. Na NBR 6118, a letra grega tau (τ) representa tensões tangenciais; o subíndice "w" refere-se à força cortante na alma (web) e "d" denota valor de projeto/cálculo (design). Logo, τ_wd é a tensão de cisalhamento de cálculo por força cortante.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q48',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '315_Concreto_Armado',
    artigo: 'Estados-Limites Últimos: Capacidade Resistente e Ruptura',
    enunciado: 'A capacidade resistente em uma estrutura de concreto armado é definida conceitualmente como:',
    alternativas: [
      'Sua segurança à ruptura.',
      'A capacidade de carga da estrutura.',
      'O peso da estrutura.',
      'O período de tempo que a estrutura permanece em condições normais.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. Nos termos conceituais das normas de dimensionamento estrutural, a capacidade resistente traduz a margem de segurança da peça estrutural contra a ocorrência do estado-limite último de ruptura.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q49',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
    assunto: '627_Patologia_das_Construcoes',
    artigo: 'Patologia das Construções: Mecanismo de Lixiviação do Concreto',
    enunciado: 'Lixiviação nas edificações em concreto armado com fechamento em alvenaria é:',
    alternativas: [
      'A expansão por ação de águas ou solos que contenham ou estejam contaminados com sulfatos, dando origem a reações expansivas e deletérias com a pasta de cimento hidratado.',
      'A expansão por ação das reações entre os álcalis do concreto e agregados reativos.',
      'A despassivação por carbonatação, ou seja, por ação do gás carbônico da atmosfera sobre o aço da armadura.',
      'O mecanismo responsável por dissolver e carrear os compostos hidratados da pasta de cimento por ação de águas puras, carbônicas agressivas, ácidas e outras.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. A lixiviação ocorre pela ação da água percolante que dissolve e transporta o hidróxido de cálcio [Ca(OH)2] da matriz de concreto, provocando perda de massa, aumento da porosidade e formação de eflorescências.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
  {
    id: 'fafipa_campomagro_2016_q50',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '315_Concreto_Armado',
    artigo: 'NBR 6118: Diagrama Tensão-Deformação Parábola-Retângulo do Concreto',
    enunciado:
      'No diagrama tensão-deformação idealizado (parábola-retângulo) para compressão do concreto estabelecido pela NBR 6118, o coeficiente que multiplica a resistência de cálculo fcd no patamar plástico constante (entre as deformações de 2‰ e 3,5‰), substituído pela letra "x", é:',
    alternativas: [
      '0,85.',
      '0,65.',
      '0,45.',
      '0,25.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A (0,85). Na NBR 6118, para concretos de classes até C50, a tensão máxima de cálculo no patamar de escoamento plástico é dada por σ_c = 0,85 * fcd, sendo o fator 0,85 correspondente ao Efeito Rüsch para carregamento mantido ao longo do tempo.',
    ano: 2016,
    orgao: 'Prefeitura de Campo Magro',
  },
];

export const SESSAO_CAMPO_MAGRO_2016: SessaoCriada = {
  id: 'prv_2016_fafipa_campomagro',
  codigo: 'FAFIPA-2016-CAMPOMAGRO-ENG.CIVIL',
  dataHora: '15/05/2016 13:30',
  banca: 'Fundação FAFIPA (Prova Real)',
  cargo: 'Engenheiro Civil',
  disciplina: '2016, Fundação FAFIPA, Prefeitura de Campo Magro',
  assunto: 'FAFIPA 2016 - Prefeitura de Campo Magro - Engenheiro Civil',
  quantidade: QUESTOES_CAMPO_MAGRO_2016.length, // 45
  questaoIds: QUESTOES_CAMPO_MAGRO_2016.map((q) => q.id),
  questoesSnap: QUESTOES_CAMPO_MAGRO_2016,
  tipo: 'prova_anterior',
  tempoSegundos: 0,
  concluida: false,
  ano: 2016,
  orgao: 'Prefeitura de Campo Magro',
  created_at: new Date(2016, 4, 15, 13, 30).toISOString(),
};

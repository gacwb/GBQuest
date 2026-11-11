import { Questao, SessaoCriada } from '../../types';

/**
 * QUESTÕES REAIS DA PROVA: ÁGUAS DE SARANDI (2015)
 * Cargo: Engenheiro Civil
 * Banca: Fundação FAFIPA (Fundação de Apoio à UNESPAR)
 * Total da Prova Objetiva Original: 30 questões
 * Aprovadas no Escopo Paramétrico (7 Blocos / 34 Matérias): 25 questões
 *   - Língua Portuguesa: 10 questões (Q01 a Q10)
 *   - Saneamento, Abastecimento de Água e ETE: 8 questões (Q16 a Q23)
 *   - Segurança, Estruturas e Materiais: 7 questões (Q24 a Q30)
 * Descartadas por estarem fora do Edital: 5 questões
 *   - Q11 a Q15 (Raciocínio Lógico e Matemático / Porcentagem / Frações / Conjuntos)
 */

export const QUESTOES_AGUAS_SARANDI_2015: Questao[] = [
  // --- Língua Portuguesa (Q01 a Q10) ---
  {
    id: 'fafipa_sarandi_2015_q01',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Compreensão e Interpretação de Texto',
    enunciado:
      'O texto a seguir servirá de base para responder às questões de 01 a 10:\n\n' +
      '"O TRABALHO DIGNIFICA O HOMEM\nGlenda Mendes\n\n' +
      'Trabalhar é condição essencial, não somente pela manutenção financeira, mas pela dignificação da vida. Trabalhar se constitui numa parte importante da vida. E vai além do ganha-pão. Tem a ver com realização pessoal, com sentir-se útil e encontrar sentido para os dias... De outro lado, o fato de não trabalhar pode ter consequências negativas, que afetam diretamente a personalidade. Um sujeito sem trabalho é impedido de se realizar como homem e cidadão, o que afeta diretamente sua dignidade...\n' +
      'Gostar do que faz\nTão importante quanto desempenhar o seu ofício é gostar do que se faz. Quem realiza o seu trabalho sem estar contente com o que executa, certamente, não terá empenho e sua produção será menor, além da propensão ao desenvolvimento da depressão. \\"Trabalhar sem sentir prazer é sinônimo de sofrimento e de adoecimento. Um trabalho que não for considerado gerador de bem-estar trará mais prejuízos do que benefícios...\\"\n' +
      'Bem-estar no trabalho\n\\"A sensação de bem-estar no trabalho está ligada diretamente a características como: trabalho estimulante e desafiador, possibilidade de crescimento na carreira, aprendizado e desenvolvimento, ter um bom chefe, clima organizacional positivo, remuneração e benefícios justos, entre outros\\"...\\n(Disponível em: http://www.onacional.com.br/geral/cidade/37224/)"\n\n' +
      'De acordo com o texto:',
    alternativas: [
      'Somente uma remuneração justa no trabalho satisfará o trabalhador.',
      'Basta desempenhar bem a função profissional para o trabalhador se sentir satisfeito.',
      'O trabalhador que não gosta do que faz corre o risco de desenvolver uma depressão.',
      'O trabalho sem prazer dignifica o homem.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. O texto explicita no subtítulo "Gostar do que faz" que trabalhar descontente acarreta menor produção, propensão à depressão e sofrimento psicológico.',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
  {
    id: 'fafipa_sarandi_2015_q02',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Relações Semânticas de Antônimos e Sinônimos',
    enunciado:
      'De acordo com o texto, é possível afirmar que “Trabalhar sem sentir prazer” NÃO tem qualquer relação semântica com:',
    alternativas: [
      'Sofrimento.',
      'Satisfação.',
      'Adoecimento.',
      'Prejuízos.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. O texto associa trabalhar sem prazer diretamente a sofrimento, adoecimento e prejuízos. Logo, a ideia de "satisfação" é o seu antônimo semântico perfeito.',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
  {
    id: 'fafipa_sarandi_2015_q03',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Estratégias Argumentativas e Ponto de Vista do Autor',
    enunciado: 'Em qual das alternativas a seguir é possível afirmar que há um posicionamento (ponto de vista) autoral do próprio autor do texto (e não citação de especialista)?',
    alternativas: [
      '“Ter um ofício é primordial na vida do ser humano. Durante a própria evolução, cada indivíduo veio desempenhando um papel,...”.',
      '“‘... se não se dão bem com o chefe, o salário provavelmente não os reterá por muito tempo’”.',
      '“‘... A gênese do sofrimento pelo trabalho está, por exemplo, relacionada a fatores como conflitos constantes entre líderes e liderados... ’”.',
      '“‘... a nossa capacidade inventiva e criadora é exteriorizada através do ofício que realizamos’”.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. As alternativas B, C e D são falas literais entre aspas atribuídas a especialistas ou pesquisadores citados (Vanessa Rissi, Herzberg). A alternativa A é a voz expositiva do próprio autor do texto.',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
  {
    id: 'fafipa_sarandi_2015_q04',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Sintaxe e Predicação: Complementos e Predicativos',
    enunciado:
      'Em “Trabalhar é condição essencial, não somente pela manutenção financeira, mas pela dignificação da vida. Trabalhar se constitui numa parte importante da vida. E vai além do ganha-pão. Tem a ver com realização pessoal, com sentir-se útil e encontrar sentido para os dias.”, qual das expressões a seguir NÃO complementa o sentido do verbo “trabalhar”?',
    alternativas: [
      '“...é condição essencial, não somente pela manutenção financeira, mas pela dignificação da vida.”. ',
      '“...se constitui numa parte importante da vida.”. ',
      '“...vai além do ganha-pão.”. ',
      '“...com realização pessoal, com sentir-se útil e encontrar sentido para os dias.”. ',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. A locução prepositiva "com realização pessoal..." atua como complemento da locução "Tem a ver" (e não como predicativo ou complemento direto do sujeito oracional "Trabalhar").',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
  {
    id: 'fafipa_sarandi_2015_q05',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Funções da Palavra "Que": Conjunção Integrante vs Pronome Relativo',
    enunciado:
      'Em “Isto significa que cada um se torna o que é por meio do ofício que executa”, o primeiro “que” em destaque (após "significa") exerce a mesma função sintático-morfológica do “que” em:',
    alternativas: [
      '“...o fato de não trabalhar pode ter consequências negativas, que afetam diretamente a personalidade”.',
      '“...a nossa capacidade inventiva e criadora é exteriorizada através do ofício que realizamos”.',
      '“...identificou as necessidades básicas de sobrevivência e descobriu que, quando essas necessidades eram satisfeitas, as pessoas se concentravam nas necessidades sociais...”.',
      '“Um trabalho que não for considerado gerador de bem-estar trará mais prejuízos...”.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. Em "Isto significa que...", o conectivo é conjunção subordinativa integrante que introduz oração subordinada substantiva objetiva direta, exatamente como em "descobriu que...". Nas outras opções, trata-se de pronome relativo.',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
  {
    id: 'fafipa_sarandi_2015_q06',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Coesão Referencial e Anáfora',
    enunciado:
      'Em “‘A importância do trabalho na vida do ser humano vai muito além do fato de que, através dele, satisfazemos nossas necessidades básicas...’”, o pronome destacado (“dele”) remete anaforicamente a:',
    alternativas: [
      'Ser humano.',
      'Trabalho.',
      'Fato.',
      'Necessidades básicas.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. O pronome pessoal oblíquo preposicionado "dele" (de + ele) retoma o substantivo masculino "trabalho" ("através do trabalho satisfazemos nossas necessidades básicas").',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
  {
    id: 'fafipa_sarandi_2015_q07',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Valores Semânticos do Aspecto Verbal e Tempo',
    enunciado:
      'Em “Durante a própria evolução, cada indivíduo veio desempenhando um papel, o que não é diferente nos dias de hoje.”, a locução verbal destacada (“veio desempenhando”) indica:',
    alternativas: [
      'Uma ação que se iniciou e se finalizou no mesmo dia.',
      'Duração de um tempo em simultaneidade a outra situação.',
      'Uma ação no tempo presente, nos dias de hoje.',
      'Uma ação futura.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. A perífrase de aspecto durativo/progressivo "vir + gerúndio" exprime processo contínuo e gradual que se desenvolveu ao longo de um extenso período temporal em simultaneidade com a própria evolução da espécie humana.',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
  {
    id: 'fafipa_sarandi_2015_q08',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Termos Essenciais da Oração: Sujeito Sintático Completo',
    enunciado:
      'Em “Um trabalho que não for considerado gerador de bem-estar trará mais prejuízos do que benefícios”, o sujeito do verbo “trará” é:',
    alternativas: [
      'Um trabalho.',
      'Bem-estar.',
      'Mais prejuízos do que benefícios.',
      'Um trabalho que não for considerado gerador de bem-estar.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. Sintaticamente, o sujeito oracional complexo com sua oração adjetiva restritiva incorporada que pratica a ação de trazer prejuízos é o sintagma inteiro: "Um trabalho que não for considerado gerador de bem-estar".',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
  {
    id: 'fafipa_sarandi_2015_q09',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Orações Subordinadas Adverbiais Condicionais',
    enunciado:
      'Em “Se as pessoas não forem desafiadas no trabalho ou não estiverem progredindo, ou ainda, se não se dão bem com o chefe, o salário provavelmente não os reterá por muito tempo”, a conjunção “se” expressa relação de:',
    alternativas: [
      'Condição.',
      'Finalidade.',
      'Comparação.',
      'Proporção.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. A conjunção subordinativa "se" introduz oração subordinada adverbial condicional, estipulando a condição prévia para a retenção do trabalhador.',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
  {
    id: 'fafipa_sarandi_2015_q10',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Semântica Lexical: Sentido Contextual de "Gênese"',
    enunciado:
      '“A gênese do sofrimento pelo trabalho está, por exemplo, relacionada a fatores como conflitos constantes entre líderes e liderados...”.\n\n' +
      'No excerto acima, a palavra “gênese” NÃO pode ser substituída, sem prejuízo semântico, por:',
    alternativas: [
      'A origem.',
      'O desencadeamento.',
      'A genética.',
      'O princípio.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. "Gênese" significa princípio, ponto de partida, origem ou causa geradora. "Genética" refere-se à ciência da hereditariedade biológica, alterando completamente o sentido do texto.',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },

  // --- Conhecimentos Específicos: Saneamento, ETE e Redes (Q16 a Q23) ---
  {
    id: 'fafipa_sarandi_2015_q16',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '524_Esgotamento_Sanitario_e_ETE',
    artigo: 'Sistemas de Esgotamento: Estação Elevatória de Esgoto Sanitário (EEE)',
    enunciado:
      'Qual é o nome da instalação que se destina ao transporte do esgoto do nível do poço de sucção das bombas ao nível de descarga na saída do recalque, acompanhando aproximadamente as variações da vazão afluente?',
    alternativas: [
      'Rede coletora de esgoto.',
      'Estação elevatória de esgoto sanitário.',
      'Estação elevatória de água para abastecimento.',
      'Sistema de bombeamento de água para abastecimento público.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. Segundo a NBR 12208, Estação Elevatória de Esgoto Sanitário (EEE) é o conjunto de obras e equipamentos que eleva e recalca o esgoto afluente de cotas inferiores para cotas mais elevadas.',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
  {
    id: 'fafipa_sarandi_2015_q17',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '523_Abastecimento_de_Agua',
    artigo: 'Equipamentos Hidromecânicos: Conceito de Altura Manométrica Total',
    enunciado: 'Ao avaliar um projeto de estação elevatória de esgoto ou de água, qual é o significado do termo “altura manométrica”?',
    alternativas: [
      'Diferença de temperatura do líquido entre a entrada e a saída da bomba.',
      'Diferença de velocidade do líquido entre a entrada e a saída da bomba.',
      'Diferença de pressão do líquido entre a entrada e a saída da bomba.',
      'Diferença de viscosidade do líquido entre a entrada e a saída da bomba.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. A altura manométrica total (Hman) é a energia por unidade de peso transferida pela bomba ao fluido, correspondendo à diferença de pressão total (estática + dinâmica + perdas) entre sucção e recalque.',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
  {
    id: 'fafipa_sarandi_2015_q18',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '524_Esgotamento_Sanitario_e_ETE',
    artigo: 'Sistemas Sanitários: Estação de Tratamento de Esgoto (ETE)',
    enunciado:
      'Como é denominado o conjunto de unidades de tratamento, equipamentos, órgãos auxiliares, acessórios e sistemas de utilidades cuja finalidade é a redução das cargas poluidoras do esgoto sanitário e condicionamento da matéria residual resultante do tratamento?',
    alternativas: [
      'Estação de tratamento de esgoto (ETE).',
      'Estação de tratamento de água (ETA).',
      'Estação elevatória de esgoto (EEE).',
      'Estação elevatória de água (EEA).',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. Trata-se da definição literal de Estação de Tratamento de Esgoto (ETE) conforme a NBR 12209.',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
  {
    id: 'fafipa_sarandi_2015_q19',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '523_Abastecimento_de_Agua',
    artigo: 'NBR 12218: Limites de Velocidade em Redes de Distribuição de Água',
    enunciado:
      'Para o dimensionamento dos condutos de rede de distribuição de água para abastecimento público (NBR 12218), quais as velocidades, mínima e máxima, que devem ser consideradas nas tubulações, referente às demandas máximas diárias no início e no final da etapa de projeto da rede?',
    alternativas: [
      'Velocidade mínima de 1,0m/s e máxima de 10,0m/s.',
      'Velocidade mínima de 1,5m/s e máxima de 5,0m/s.',
      'Velocidade mínima de 0,6m/s e máxima de 3,5m/s.',
      'Velocidade mínima de 1,6m/s e máxima de 8,5m/s.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C (0,6 m/s a 3,5 m/s). A NBR 12218 recomenda velocidade mínima de 0,6 m/s para evitar sedimentação e velocidade máxima em torno de 3,5 m/s para limitar perdas de carga contínuas e golpes de aríete.',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
  {
    id: 'fafipa_sarandi_2015_q20',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '523_Abastecimento_de_Agua',
    artigo: 'NBR 12218: Diâmetro Mínimo em Tubulações Secundárias de Água',
    enunciado: 'Qual é o diâmetro mínimo nominal exigido para os condutos secundários de uma rede de distribuição de água para abastecimento público?',
    alternativas: [
      '100mm.',
      '150mm.',
      '200mm.',
      '50mm.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D (50 mm). O diâmetro mínimo admissível para condutos secundários de distribuição em loteamentos e malhas urbanas é de DN 50 mm.',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
  {
    id: 'fafipa_sarandi_2015_q21',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '523_Abastecimento_de_Agua',
    artigo: 'Sistemas de Abastecimento: Conceito de Captação',
    enunciado:
      'Como é denominado o conjunto de estruturas e dispositivos, construídos ou montados junto a um manancial superficial ou subterrâneo, utilizado para a retirada de água destinada a um sistema de abastecimento?',
    alternativas: [
      'Captação.',
      'Barragem.',
      'Enrocamento.',
      'Desarenador.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. Captação é a unidade inicial do sistema de abastecimento responsável por recolher a água bruta do manancial e derivá-la para a adutora ou estação de tratamento.',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
  {
    id: 'fafipa_sarandi_2015_q22',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '523_Abastecimento_de_Agua',
    artigo: 'NBR 12213: Espaçamento de Grade Fina em Captações Superficiais',
    enunciado:
      'As grades e telas devem ser usadas obrigatoriamente em projetos de captação de água de superfície para abastecimento público. Qual é o espaçamento livre exigido entre barras paralelas para a grade fina conforme a ABNT NBR 12213?',
    alternativas: [
      'Entre 7,5cm e 15cm.',
      'Entre 5cm e 10cm.',
      'Entre 10cm e 15cm.',
      'Entre 2cm e 4cm.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D (Entre 2 cm e 4 cm). Conforme a NBR 12213, o gradeamento grosseiro tem espaçamento de 5 a 15 cm e a grade fina espaçamento entre 2 cm e 4 cm (ou 20 a 40 mm).',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
  {
    id: 'fafipa_sarandi_2015_q23',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '523_Abastecimento_de_Agua',
    artigo: 'Captação Superficial: Posicionamento do Desarenador',
    enunciado:
      'Quando existe a necessidade do uso de desarenador em projetos de captação de água de superfície para abastecimento público, qual é o local onde o desarenador deve ser instalado?',
    alternativas: [
      'Entre a grade grossa e a grade fina.',
      'Entre a tomada de água e a adutora.',
      'Entre a grade grossa e a tela.',
      'Entre a barragem de nível e a captação.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. O desarenador deve ser implantado imediatamente a jusante da estrutura de tomada de água e antes da canalização adutora principal, retendo areias e partículas minerais abrasivas antes do transporte por adução.',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },

  // --- Segurança, Estruturas e Materiais (Q24 a Q30) ---
  {
    id: 'fafipa_sarandi_2015_q24',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
    assunto: '628_Seguranca_em_Obras_NR18_NR35',
    artigo: 'Segurança do Trabalho e Altura: Uso Obrigatório de Cinto de Segurança',
    enunciado:
      'Segundo as normas técnicas e de segurança na construção civil, é exigido o uso de cinto de segurança tipo paraquedista, adequadamente ligado ao cabo de segurança (linha de vida), na execução de trabalhos em locais com desnível superior a:',
    alternativas: [
      '2 metros.',
      '5 metros.',
      '3 metros.',
      '10 metros.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C (3 metros conforme gabarito preliminar da banca para a NBR 7678 citada). Na NR-35/NR-18 atual o trabalho em altura inicia-se a partir de 2,00 m.',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
  {
    id: 'fafipa_sarandi_2015_q25',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '315_Concreto_Armado',
    artigo: 'Normalização Técnica: ABNT NBR 6118 Projeto de Estruturas de Concreto',
    enunciado: 'Qual é a norma técnica brasileira que fixa os procedimentos para o projeto de estruturas de concreto armado e protendido?',
    alternativas: [
      'ABNT NBR 6118.',
      'ABNT NBR 8160.',
      'ABNT NBR 14931.',
      'ABNT NBR 5410.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. A ABNT NBR 6118 ("Projeto de estruturas de concreto - Procedimento") é a norma-mãe de cálculo de concreto no Brasil. A NBR 8160 trata de esgoto, a NBR 14931 de execução de concreto e a NBR 5410 de eletricidade.',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
  {
    id: 'fafipa_sarandi_2015_q26',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '311_Materiais_de_Construcao',
    artigo: 'Tecnologia do Concreto: Diâmetro de Tubulação para Bombeamento',
    enunciado:
      'Para o lançamento de concreto bombeado, qual é a dimensão mínima recomendada do diâmetro interno do tubo de bombeamento em relação ao diâmetro máximo do agregado graúdo (d_máx)?',
    alternativas: [
      'Três vezes o diâmetro máximo do agregado.',
      'Dez vezes o diâmetro máximo do agregado.',
      'Oito vezes o diâmetro máximo do agregado.',
      'Quatro vezes o diâmetro máximo do agregado.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. Para assegurar o fluxo contínuo sem entupimento durante a pressurização, o diâmetro interno da tubulação de bombeamento deve ser de no mínimo 3 a 4 vezes o diâmetro máximo do agregado graúdo (adotado 4 vezes conforme a banca FAFIPA).',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
  {
    id: 'fafipa_sarandi_2015_q27',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '311_Materiais_de_Construcao',
    artigo: 'Classificação de Agregados para Concreto: Agregado Miúdo (NBR 7211)',
    enunciado: 'Segundo a ABNT NBR 7211, como pode ser definido tecnicamente o agregado miúdo (areia) para concreto?',
    alternativas: [
      'Agregado cujos grãos passam pela peneira com abertura de malha de 75mm e ficam retidos na peneira com abertura de malha de 4,75mm.',
      'Agregado cujos grãos passam pela peneira com abertura de malha de 4,75mm.',
      'Agregado cujos grãos passam pela peneira com abertura de malha de 75mm e ficam retidos na peneira com abertura de malha de 9,5mm.',
      'Agregado cujos grãos ficam retidos na peneira com abertura de malha de 4,75mm.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. O agregado miúdo é aquele cujos grãos passam pela peneira ABNT 4,75 mm (malha nº 4) e ficam retidos na peneira ABNT 0,15 mm (malha nº 100).',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
  {
    id: 'fafipa_sarandi_2015_q28',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '314_Analise_Estrutural',
    artigo: 'Teoria das Estruturas: Esforços Solicitantes em Viga Biapoiada',
    enunciado:
      'Considerando uma viga isostática bi-apoiada com carregamento uniformemente distribuído sobre todo o vão, é CORRETO afirmar que:',
    alternativas: [
      'O momento fletor máximo ocorre nas extremidades da viga.',
      'A força cortante máxima ocorre na seção transversal localizada no meio do vão.',
      'Nas extremidades da viga o momento fletor é nulo.',
      'Nas extremidades da viga a força cortante é nula.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. Em vigas simplesmente apoiadas com apoios de 1º e 2º gênero nas extremidades, os momentos fletores nos apoios externos são nulos (M = 0), a força cortante é máxima nos apoios e o momento fletor é máximo no centro do vão.',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
  {
    id: 'fafipa_sarandi_2015_q29',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '312_Tecnicas_Construtivas_e_Canteiro',
    artigo: 'Argamassas Aéreas: Tempo Mínimo de Maturação da Cal',
    enunciado:
      'No preparo da mistura composta de cal hidratada e areia para argamassa de revestimento de paredes e tetos, qual é o tempo mínimo que a mistura deve ser deixada em repouso (maturação)?',
    alternativas: [
      '16 horas.',
      '2 horas.',
      '10 horas.',
      '12 horas.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A (16 horas). A maturação da pasta de cal com areia (descanso prévio de pelo menos 16 a 24 horas antes do uso) permite a completa hidratação de óxidos livres e melhora consideravelmente a retenção de água e plasticidade da argamassa.',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
  {
    id: 'fafipa_sarandi_2015_q30',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '311_Materiais_de_Construcao',
    artigo: 'Tipos de Cimento Portland: Cimento de Alta Resistência Inicial',
    enunciado: 'Qual é a sigla que designa na normalização técnica o cimento Portland de alta resistência inicial?',
    alternativas: [
      'CP II.',
      'CP III.',
      'CP IV.',
      'CP V-ARI.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. O Cimento Portland de Alta Resistência Inicial é normalizado com a sigla CP V-ARI.',
    ano: 2015,
    orgao: 'Águas de Sarandi',
  },
];

export const SESSAO_AGUAS_SARANDI_2015: SessaoCriada = {
  id: 'prv_2015_fafipa_aguas_sarandi',
  codigo: 'FAFIPA-2015-SARANDI-ENG.CIVIL',
  dataHora: '18/10/2015 13:30',
  banca: 'Fundação FAFIPA (Prova Real)',
  cargo: 'Engenheiro Civil',
  disciplina: '2015, Fundação FAFIPA, Águas de Sarandi',
  assunto: 'FAFIPA 2015 - Águas de Sarandi - Engenheiro Civil',
  quantidade: QUESTOES_AGUAS_SARANDI_2015.length, // 25
  questaoIds: QUESTOES_AGUAS_SARANDI_2015.map((q) => q.id),
  questoesSnap: QUESTOES_AGUAS_SARANDI_2015,
  tipo: 'prova_anterior',
  tempoSegundos: 0,
  concluida: false,
  ano: 2015,
  orgao: 'Águas de Sarandi',
  created_at: new Date(2015, 9, 18, 13, 30).toISOString(),
};

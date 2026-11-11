import { Questao, SessaoCriada } from '../../types';

/**
 * QUESTÕES REAIS DA PROVA: PREFEITURA DE SÃO JOÃO DO TRIUNFO (2015)
 * Cargo: Engenheiro Civil
 * Banca: Fundação FAFIPA
 * Total da Prova Original: 30 questões
 * Aprovadas no Escopo Paramétrico (7 Blocos / 34 Matérias): 26 questões
 *   - Língua Portuguesa: 10 questões (Q01 a Q10)
 *   - Informática Básica: 1 questão (Q13)
 *   - Conhecimentos Específicos de Engenharia Civil: 15 questões (Q16 a Q30)
 * Descartadas por estarem fora do Edital: 4 questões
 *   - Q11 (Conhecimentos Gerais - Símbolo Câncer de Mama / Outubro Rosa)
 *   - Q12 (Conhecimentos Gerais - Símbolo de gênero)
 *   - Q14 (História Municipal de São João do Triunfo - Porto fluvial)
 *   - Q15 (Atualidades Políticas 2015 - Extradição Pizzolato)
 */

export const QUESTOES_TRIUNFO_2015: Questao[] = [
  // --- Língua Portuguesa (Q01 a Q10) ---
  {
    id: 'fafipa_triunfo_2015_q01',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Compreensão e Interpretação de Texto',
    enunciado:
      'O texto a seguir servirá de base para responder às questões de 01 a 10:\n\n' +
      '"Sociedade desvaloriza docência ao achar que todos podem lecionar\n\n' +
      'Todo dia 15 de outubro, comemora-se, em nosso país, o Dia dos Professores. Como docente, fico especialmente feliz por ser lembrada, nesta data, pelos meus alunos, ex-alunos, amigos e familiares. Mensagens de afeto e de estima deixam, sem dúvida, todo educador feliz.\n' +
      'Entretanto, além de mensagens de apoio e carinho, ouso dizer, em nome dos professores brasileiros, que desejamos ser reconhecidos, por todos os segmentos da sociedade, como profissionais do ensino.\n' +
      'Infelizmente, ainda hoje, a imagem da docência permanece no campo dos valores altruístas e da realização pessoal. O dom e a vocação, o amor pelas crianças, o amor pelo outro, o amor pela profissão e o amor pelo saber parecem sustentar a ideia que se tem sobre o ser professor.\n' +
      'Por sua vez, esse entendimento socialmente construído e persistente traz implícito um equívoco: o de não reconhecer a existência de um conjunto de saberes indispensável ao trabalho docente que os outros – que não são professores – não dominam.\n' +
      'Entendo que o mais importante deles, e que se encontra unicamente no domínio dos professores, diz respeito ao saber fazer com que o conhecimento seja aprendido e apreendido pelo aluno por meio da ação docente. É o que a sociedade espera que ele faça.\n' +
      'Assim, neste 15 de outubro, a bandeira que eu levanto é a de combate à ideia de que \\"qualquer um pode ser professor\\". Infelizmente, o não reconhecimento de um conhecimento específico para o exercício da docência associado à precarização da profissão [...] vem contribuindo para que a docência se mostre menos motivadora do que outras opções profissionais, o que tem acarretado escassez de professores, especialmente em algumas áreas e segmentos de ensino.\n' +
      'Em pesquisa sobre a atratividade da carreira docente, desenvolvida pela Fundação Carlos Chagas sob a encomenda da Fundação Victor Civita, em 2009, uma aluna de uma escola pública de Feira de Santana (BA), preocupada com o futuro da profissão docente, argumenta: \\"hoje em dia, quase ninguém quer ser professor. Nossos pais não querem que nós sejamos professores, mas eles querem que existam bons professores. Mas, como é que vai existir bons professores se meu pai não quer, o dela não quer? Como é que vai ter professores? Aí fica difícil, não é?\\".\n' +
      'E fica mesmo! Cada um de nós é responsável pela construção de um referencial positivo do professor. A bandeira pelo reconhecimento profissional do ensino implica também no desenvolvimento de políticas públicas que tenham como prioridade a valorização do magistério, dos cursos de licenciatura e no reconhecimento do papel do ensino e da educação básica para o desenvolvimento do país, para a formação de uma cidadania ativa e para a construção de uma sociedade mais justa e mais humana.\n' +
      'Cada um dos mais de 2 milhões de professores brasileiros merece não só o nosso reconhecimento, como também o direito de ser de fato assistido em sua formação e em seu desenvolvimento profissional. Parabéns, professor! Parabéns, também, aos jovens que optaram pela docência como profissão!\\n(http://noticias.uol.com.br/opiniao/coluna/)"\n\n' +
      'A respeito das informações constantes do texto, é INCORRETO afirmar que:',
    alternativas: [
      'A autora é também professora.',
      'A autora busca argumentar a favor da valorização dos professores brasileiros.',
      'A autora advoga o fato de que ser professor requer conhecimentos específicos e combate a ideia de que qualquer um pode ser professor.',
      'Atualmente, a profissão de professor preenche todas as expectativas. Conforme estudo promovido pela Fundação Carlos Chagas, a maioria dos estudantes deseja contribuir com a educação.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. O texto evidencia exatamente o oposto: a profissão sofre de precarização e desvalorização, e a pesquisa da Fundação Carlos Chagas citada pela autora aponta que "quase ninguém quer ser professor" ("Nossos pais não querem que nós sejamos professores"), gerando escassez de docentes.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q02',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Interpretação Textual e Propósito Comunicativo',
    enunciado: 'Ao final do texto, a autora parabeniza a classe, por que:',
    alternativas: [
      'O texto recupera a data comemorativa do Dia do Professor, 12 de outubro.',
      'O Dia do Professor foi recentemente comemorado, no dia 15 de outubro, e o texto faz menção a esse fato.',
      'Os professores merecem os parabéns pelas mudanças que têm feito na sociedade brasileira e por estarem satisfeitos com a profissão.',
      'A autora parabeniza os professores do Brasil porque são profissionais intensamente valorizados e com todo o suporte necessário para o exercício do ofício.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. O texto foi motivado pela comemoração do Dia do Professor (15 de outubro), como destacado logo no primeiro parágrafo ("Todo dia 15 de outubro, comemora-se, em nosso país, o Dia dos Professores"). Ao final, a autora reforça os parabéns pela data à categoria docente.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q03',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Semântica e Significação Contextual',
    enunciado:
      'Em dado momento do texto, a autora afirma que: “Infelizmente, ainda hoje, a imagem da docência permanece no campo dos valores altruístas e da realização pessoal”. A expressão em destaque significa:',
    alternativas: [
      'Valores que prejudicam outras pessoas.',
      'Valores que beneficiam outras pessoas.',
      'Valores excêntricos.',
      'Valores que alteram o comportamento de uma pessoa.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. O termo "altruísta" deriva de altruísmo, que é a disposição de se preocupar com o bem-estar do próximo, visando ao benefício de outras pessoas de forma desinteressada.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q04',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Coesão Lexical e Sinonímia',
    enunciado: 'A palavra “professor” é retomada, ao longo do texto, por outras, EXCETO:',
    alternativas: [
      'Docente.',
      'Profissional do ensino.',
      'Educador.',
      'Mestre.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. Ao longo do texto, a autora emprega os termos "docente", "profissional do ensino" e "educador" para retomar a figura do professor. A palavra "mestre" não é utilizada no corpo do texto para essa substituição.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q05',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Termos Essenciais e Integrantes da Oração / Sintaxe',
    enunciado:
      'No título do texto “Sociedade desvaloriza docência”, é possível encontrar a seguinte estrutura sintática:',
    alternativas: [
      'Sujeito Simples + Verbo Transitivo Direto + Objeto Direto.',
      'Sujeito Composto + Verbo Transitivo Indireto + Objeto Indireto.',
      'Oração Sem Sujeito + Predicado Verbo-Nominal.',
      'Substantivo Simples + Verbo + Adjetivo.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. "Sociedade" é o Sujeito Simples (núcleo único); "desvaloriza" é Verbo Transitivo Direto (quem desvaloriza, desvaloriza algo); "docência" é o Objeto Direto (sem preposição obrigatória).',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q06',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Semântica dos Advérbios e Modalização',
    enunciado:
      'Em alguns momentos, o emprego do advérbio de modo “infelizmente” caracteriza o texto da autora, de modo a indicar:',
    alternativas: [
      'Seu posicionamento (descontente) diante do assunto abordado.',
      'Seu estado de espírito diante da crise mundial.',
      'Sua insatisfação ao observar a quantidade de manifestos que ocorreram no início do ano, no Brasil.',
      'Sua recusa em admitir a ineficiência do ensino brasileiro.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. O advérbio "infelizmente" atua como um modalizador discursivo de atitude enunciativa, expressando o descontentamento e a lamentação da autora em relação à realidade e ao descaso com o magistério.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q07',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Pontuação e Emprego da Vírgula com Vocativo',
    enunciado:
      'No último parágrafo do texto, o segmento “Parabéns, professor!” contém vírgula, para:',
    alternativas: [
      'Separar o sujeito de seu predicado, dando-lhe mais destaque.',
      'Enfatizar o aposto “Parabéns”.',
      'Isolar o vocativo da oração: “professor”.',
      'Nenhuma das alternativas anteriores está correta.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. O termo "professor" é um vocativo (termo de chamamento/invocação direta ao interlocutor), que deve ser obrigatoriamente isolado por vírgula na norma culta.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q08',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Acentuação Gráfica de Paroxítonas Terminadas em Ditongo',
    enunciado:
      'As palavras “salário”, “docência” e “níveis” são acentuadas graficamente pela mesma regra gramatical:',
    alternativas: [
      'O enunciado está equivocado. Tais palavras não são acentuadas pela mesma regra gramatical, tendo em vista que as duas primeiras são trissílabas, já a última é dissílaba.',
      'Todas as palavras proparoxítonas devem ser acentuadas graficamente.',
      'Paroxítonas terminadas em ditongo.',
      'Oxítonas terminadas em vogal, seguidas ou não de “s”.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. Sa-lá-rio, do-cên-cia e ní-veis são todas palavras paroxítonas (sílaba tônica na penúltima sílaba) terminadas em ditongo oral crescente/decrescente (seguido ou não de s), recaindo sob a mesma regra de acentuação gráfica.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q09',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Flexão e Modos Verbais (Presente do Subjuntivo)',
    enunciado:
      'Releia: “Nossos pais não querem que nós sejamos professores, mas eles querem que existam bons professores”.\n\n' +
      'O verbo em destaque (“sejamos”) está conjugado na primeira pessoa do plural, no modo:',
    alternativas: [
      'Substantivo.',
      'Subjuntivo.',
      'Superlativo.',
      'Indicativo.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. O verbo "sejamos" (do verbo ser) encontra-se conjugado na primeira pessoa do plural do Presente do Subjuntivo ("que nós sejamos"), expressando desejo/possibilidade dependente de oração subordinada.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q10',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Sintaxe: Adjunto Adnominal',
    enunciado:
      'Releia o trecho: “Nossos pais não querem que nós sejamos professores, mas eles querem que existam bons professores”.\n\n' +
      'Funcionam como adjunto adnominal da oração as palavras:',
    alternativas: [
      'Nossos – bons.',
      'Pais – eles.',
      'Não – mas – que.',
      'Pais – Professores.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. "Nossos" é pronome adjetivo possessivo que acompanha e determina o substantivo "pais", exercendo a função de adjunto adnominal. "Bons" é adjetivo que qualifica diretamente o substantivo "professores", atuando também como adjunto adnominal.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },

  // --- Noções de Informática (Q13) ---
  {
    id: 'fafipa_triunfo_2015_q13',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '733_Informatica_I_Conceitos_e_Sistemas',
    artigo: 'Conceitos Básicos de Armazenamento e Cópia de Segurança (Backup)',
    enunciado:
      'Acerca das noções gerais sobre a vida tecnológica, realizar o BACKUP em um microcomputador é importante para:',
    alternativas: [
      'Manter o antivírus atualizado.',
      'Que os dados possam ser restaurados em caso da perda dos dados originais.',
      'Que a internet fique livre de pragas virtuais.',
      'Melhorar a performance da memória CACHE.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. O backup consiste em uma cópia de segurança periódica dos dados armazenados em um dispositivo para uma mídia secundária ou nuvem, garantindo sua recuperação íntegra diante de panes de hardware, exclusões acidentais, ataques de ransomware ou desastres.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },

  // --- Conhecimentos Específicos de Engenharia Civil (Q16 a Q30) ---
  {
    id: 'fafipa_triunfo_2015_q16',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '314_Analise_Estrutural',
    artigo: 'Tensão de Cisalhamento e Esforços Solicitantes',
    enunciado:
      'Os esforços ativos e reativos estabilizam as estruturas, deixando-as em equilíbrio. A desintegração destas ocorre se algumas partes constituintes sofrerem valores extremos, em virtude de esforços de corte tangencial paralelo à seção transversal, denominado de:\n(Fonte: Botelhos, Campos)',
    alternativas: [
      'Compressão.',
      'Tração.',
      'Cisalhamento.',
      'Torção.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. O esforço que atua paralelamente ao plano da seção transversal, tendendo a provocar o escorregamento relativo entre camadas adjacentes de uma peça estrutural, é a força cortante ou tensão de cisalhamento.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q17',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '314_Analise_Estrutural',
    artigo: 'Flexão Normal e Diagrama de Momento Fletor em Viga Biapoiada',
    enunciado:
      'No estudo à flexão normal nas vigas isostáticas, uma viga de 7 metros biapoiada em suas extremidades com um carregamento uniformemente distribuído de 9 tf/m, tem em seu diagrama de forças cortantes igual a zero no meio do vão desta viga e neste local também o valor máximo do diagrama de momentos fletores que, em tf.m, é igual a:\n(Fonte: Botelhos, Campos)',
    alternativas: [
      '55,13.',
      '110,25.',
      '31,50.',
      '63,00.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A (55,13 tf.m). Em uma viga biapoiada submetida a carga uniformemente distribuída q ao longo do vão L, o momento fletor máximo no centro do vão é calculado pela fórmula clássica:\n' +
      'M_máx = (q * L²) / 8 = (9 tf/m * 7² m²) / 8 = (9 * 49) / 8 = 441 / 8 = 55,125 tf.m ≈ 55,13 tf.m.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q18',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '314_Analise_Estrutural',
    artigo: 'Resistência dos Materiais: Flambagem em Peças Comprimidas',
    enunciado:
      'Assinale a opção que complete a lacuna da frase abaixo, sobre Resistência dos Materiais:\n\n' +
      '“Peças comprimidas de grande altura podem __________, fato que é sensivelmente reduzido se a altura da peça for pequena.”',
    alternativas: [
      'Estender.',
      'Vibrar.',
      'Distribuir.',
      'Flambar.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. A flambagem (instabilidade elástica lateral) ocorre preponderantemente em peças esbeltas e delgadas submetidas à compressão axial quando a carga atinge a carga crítica de Euler. Em peças curtas e robustas, predomina a ruptura por esmagamento do material.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q19',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '524_Esgotamento_Sanitario_e_ETE',
    artigo: 'Instalações Prediais de Esgoto Sanitário: Fecho Hídrico e Desconectores',
    enunciado: 'Nos sistemas prediais de esgoto sanitário, o fecho hídrico é:',
    alternativas: [
      'A probabilidade de que o número esperado de aparelhos sanitários, em uso simultâneo, seja ultrapassado.',
      'A camada líquida, de nível constante, que em um desconector veda a passagem dos gases.',
      'A caixa onde se reúnem os efluentes líquidos, cuja disposição exija elevação mecânica.',
      'A cadeia de participantes que atuam com o objetivo de planejar, projetar, fabricar, executar, utilizar e manter o empreendimento.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. Segundo a NBR 8160 (Sistemas prediais de esgoto sanitário), fecho hídrico é a camada líquida mantida em nível constante no interior de um desconector (sifão), cuja finalidade primordial é impedir o retorno de gases e odores desagradáveis da rede coletora para o ambiente habitado.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q20',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '524_Esgotamento_Sanitario_e_ETE',
    artigo: 'Instalações de Esgoto: Caixas de Inspeção e Tubulações',
    enunciado:
      'Assinale a única alternativa INCORRETA sobre os sistemas prediais de esgoto sanitário:',
    alternativas: [
      'O interior das tubulações, embutidas ou não, deve ser acessível por intermédio de dispositivos de inspeção.',
      'Os desvios, as mudanças de declividade e a junção de tubulações enterradas devem ser feitos mediante o emprego de caixas de inspeção ou poços de visita.',
      'Em prédios com mais de dois pavimentos, as caixas de inspeção não devem ser instaladas a menos de 2,00 m de distância dos tubos de queda que contribuem para elas.',
      'As caixas de inspeção não podem ser usadas para receber efluentes fecais.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. A alternativa D é incorreta porque as caixas de inspeção podem e devem receber efluentes primários (esgoto fecal) e secundários da rede predial, permitindo a manutenção e desobstrução das canalizações.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q21',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '524_Esgotamento_Sanitario_e_ETE',
    artigo: 'Dimensionamento de Esgoto Predial: Unidade de Hunter de Contribuição (UHC)',
    enunciado:
      'A unidade de Hunter de contribuição (UHC) nos sistemas prediais de esgoto sanitário é o fator numérico que representa a contribuição considerada em função da utilização habitual de cada tipo de:',
    alternativas: [
      'Encanamento.',
      'Coletor.',
      'Aparelho sanitário.',
      'Caixa.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. A Unidade de Hunter de Contribuição (UHC) é um número adimensional probabilístico atribuído a cada aparelho sanitário específico (ex.: bacia sanitária = 6 UHC, lavatório = 1 UHC, pia de cozinha = 3 UHC) para dimensionar os ramais e tubos de queda.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q22',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '523_Abastecimento_de_Agua',
    artigo: 'Captação de Água Subterrânea: Poço Artesiano e Aquíferos',
    enunciado:
      'O poço de água que quando a água se encontra abaixo da camada impermeável e sem necessidade de bombeamento é denominado de:',
    alternativas: [
      'Artesiano.',
      'Semi-artesiano.',
      'Lençol freático.',
      'Recalque.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. O poço artesiano (ou jorrante) perfura um aquífero confinado entre camadas impermeáveis onde a pressão hidrostática (carga piezométrica) é suficiente para fazer a água jorrar naturalmente na superfície sem necessidade de conjunto motobomba.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q23',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '419_Fundacoes_Profundas_Taludes_e_Contencoes',
    artigo: 'Fundações Profundas: Método Executivo do Tubulão Tipo Chicago',
    enunciado:
      'Assinale a alternativa que representa o tipo de Tubulão, fundação profunda, que obedece ao método executivo mostrado abaixo:\n\n' +
      '“O poço é aberto por etapas, após se escavar até certa profundidade, colocam-se pranchas de escoramento que são mantidas em posição por meio de travamento de anéis metálicos, escorado o primeiro trecho, escava-se novo trecho e escora-se como anteriormente, repetindo-se essa sequência de operação, até atingir o terreno onde será feita a base; estando esta concluída, passa-se à concretagem.”',
    alternativas: [
      'Tubulão tipo cisterna.',
      'Tubulão tipo chicago.',
      'Tubulão centrifugado.',
      'Tubulão tipo protendido.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. O tubulão tipo Chicago é escavado a céu aberto em solos coesivos por etapas sucessivas (geralmente de 1,0 m a 1,5 m de profundidade), escorado lateralmente por pranchas verticais de madeira travadas internamente por anéis metálicos circulares bi-partidos.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q24',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '311_Materiais_de_Construcao',
    artigo: 'Tecnologia do Concreto: Processo de Amassamento e Mistura',
    enunciado:
      'Na produção do concreto, o processo que tem por finalidade estabelecer contato íntimo entre os materiais componentes para se obter um recobrimento de pasta de cimento sobre as partículas dos agregados, assim como uma mistura homogênea de todos os materiais, está elencada na alternativa:',
    alternativas: [
      'Lançamento.',
      'Amassamento.',
      'Transporte.',
      'Bombeamento.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. O amassamento (mistura mecânica em betoneira ou manual) tem por objetivo garantir a perfeita homogeneização dos constituintes (cimento, água, agregados miúdos e graúdos e aditivos), envolvendo cada grão de agregado com a pasta de cimento.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q25',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '313_Formas_Lajes_Coberturas_e_Imperm',
    artigo: 'Formas e Cimbramentos de Madeira: Chapuzes e Escoramentos',
    enunciado:
      'As pequenas peças de madeiras feitas de sarrafos de 2,5 x 10,0 cm, de cerca de 15 a 20 cm de comprimento, geralmente empregadas como suporte e reforço de pregação das peças de escoramento, ou como apoio dos extremos das escoras, utilizadas nas formas de madeira para as estruturas em concreto armado, são:',
    alternativas: [
      'Os chapuzes.',
      'As talas.',
      'As cunhas.',
      'Os calços.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. Na carpintaria de formas para concreto, "chapuz" é o pedaço de sarrafo pregado para travar guias, gravatas, pontaletes e escoras, transmitindo cargas e impedindo o deslocamento lateral das peças de cimbramento.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q26',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 3 — Materiais, Técnicas e Estruturas (resumos 11 a 16)',
    assunto: '316_Estruturas_Metalicas_e_de_Madeira',
    artigo: 'Estruturas de Madeira: Tesouras de Cobertura e Sambladuras',
    enunciado:
      'Na estrutura em madeira de uma tesoura de cobertura, as sambladuras são:',
    alternativas: [
      'As divisões entre águas de uma cobertura.',
      'Acessórios de fixação das peças utilizadas.',
      'As emendas e ligações realizadas entre peças.',
      'Os recobrimentos longitudinais no sentido da inclinação do telhado.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. Sambladuras (ou ensambladuras) são as juntas, nós, entalhes e ligações feitas na madeira (como dente simples, espiga, encaixe de nós de tesoura) para unir duas ou mais peças estruturais e transmitir os esforços de tração e compressão.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q27',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '525_Residuos_Solidos_e_Impactos_Ambientais',
    artigo: 'Aterros Sanitários: Sistema de Cobertura Final e Impermeabilização',
    enunciado:
      'Segundo as Normas Técnicas vigentes sobre Aterros Sanitários, a camada de material aplicada sobre os resíduos, destinada ao fechamento da área aterrada, garantindo a integridade do maciço, minimizando a infiltração das águas de chuva e possibilitando o uso futuro da área recebe o nome de:',
    alternativas: [
      'Sistema vegetativo.',
      'Sistema de trincheiras.',
      'Sistemas condicionantes.',
      'Sistema de cobertura final.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. O sistema de cobertura final é a camada impermeabilizante e de solo vegetal implantada após o esgotamento da célula do aterro para conter odores e biogás, impedir a percolação excessiva de águas pluviais e viabilizar a recuperação ambiental da área.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q28',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '525_Residuos_Solidos_e_Impactos_Ambientais',
    artigo: 'Resíduos Sólidos Urbanos: Geração e Características do Lixiviado (Chorume)',
    enunciado: 'Lixiviados em um aterro sanitário são:',
    alternativas: [
      'Os efluentes líquidos gerados como resultado da percolação de água de chuva através dos resíduos sólidos.',
      'Os processos de coagulação empregados na remoção de compostos orgânicos.',
      'Os processos de floculação empregados na remoção de compostos orgânicos.',
      'Os processos de adsorção através de carvão ativado.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. Lixiviado (também denominado chorume) é o líquido escuro e de elevada carga orgânica e metálica resultante da biodegradação dos resíduos sólidos associada à percolação e lixiviação provocadas pelas águas pluviais que atravessam a massa do aterro.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q29',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '523_Abastecimento_de_Agua',
    artigo: 'Instalações Prediais de Água Fria: Alojamento de Tubulações em Sulcos',
    enunciado:
      'Nos sistemas prediais de água fria, a cavidade destinada a acomodar tubulações de água, aberta ou pré-moldada, de modo a não afetar a resistência da parte do edifício onde é executada e onde o acesso só pode se dar pela destruição da cobertura, é o:',
    alternativas: [
      'Componente.',
      'Alimentador.',
      'Sulco.',
      'Duto.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. Conforme a NBR 5626, "sulco" (ou ranhura) é o rebaixo na alvenaria ou piso destinado a embutir canalizações prediais de modo protegido, diferenciando-se de dutos ou shafts visitáveis cujo acesso não requer a quebra ou demolição do revestimento.',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
  {
    id: 'fafipa_triunfo_2015_q30',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '523_Abastecimento_de_Agua',
    artigo: 'NBR 5626: Dimensionamento de Reservatórios Prediais de Água Fria (24h de Consumo)',
    enunciado:
      'A capacidade dos reservatórios de uma instalação predial de água fria deve ser estabelecida levando-se em consideração o padrão de consumo de água no edifício e, onde for possível obter informações, a frequência e duração de interrupções do abastecimento. Assim, o volume de água reservado para uso doméstico deve ser, no mínimo, o necessário para:',
    alternativas: [
      '24 h de consumo normal no edifício, considerando o volume de água para combate a incêndio.',
      '24 h de consumo normal no edifício, sem considerar o volume de água para combate a incêndio.',
      '48 h de consumo normal no edifício, considerando o volume de água para combate a incêndio.',
      '48 h de consumo normal no edifício, sem considerar o volume de água para combate a incêndio.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. Segundo as diretrizes da ABNT NBR 5626 para instalações prediais de água fria, a capacidade de reservação de água para consumo diário normal do edifício deve assegurar no mínimo 24 horas de autonomia, sem computar a reserva técnica de combate a incêndio (RTI).',
    ano: 2015,
    orgao: 'Prefeitura de São João do Triunfo',
  },
];

export const SESSAO_TRIUNFO_2015: SessaoCriada = {
  id: 'prv_2015_fafipa_triunfo',
  codigo: 'FAFIPA-2015-TRIUNFO-ENG.CIVIL',
  dataHora: '15/11/2015 13:30',
  banca: 'Fundação FAFIPA (Prova Real)',
  cargo: 'Engenheiro Civil',
  disciplina: '2015, Fundação FAFIPA, Prefeitura de São João do Triunfo',
  assunto: 'FAFIPA 2015 - Prefeitura de São João do Triunfo - Engenheiro Civil',
  quantidade: QUESTOES_TRIUNFO_2015.length, // 26
  questaoIds: QUESTOES_TRIUNFO_2015.map((q) => q.id),
  questoesSnap: QUESTOES_TRIUNFO_2015,
  tipo: 'prova_anterior',
  tempoSegundos: 0,
  concluida: false,
  ano: 2015,
  orgao: 'Prefeitura de São João do Triunfo',
  created_at: new Date(2015, 10, 15, 13, 30).toISOString(),
};

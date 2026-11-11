import { Questao, SessaoCriada } from '../../types';

/**
 * QUESTÕES REAIS DA PROVA: PREFEITURA MUNICIPAL DE LUNARDELLI (2015)
 * Cargo: Engenheiro Civil
 * Banca: Fundação FAFIPA (Fundação de Apoio à UNESPAR)
 * Total da Prova Objetiva Original: 30 questões
 * Aprovadas no Escopo Paramétrico (7 Blocos / 34 Matérias): 26 questões
 *   - Língua Portuguesa: 5 questões (Q01 a Q05)
 *   - Legislação Edílica, Código de Obras e Posturas: 6 questões (Q10 a Q15)
 *   - Saneamento, ETE e Drenagem: 5 questões (Q16 a Q20)
 *   - Geotecnia e Fundações: 5 questões (Q21 a Q25)
 *   - Avaliação, Orçamento e Licitações: 5 questões (Q26 a Q30)
 * Descartadas por estarem fora do Edital: 4 questões
 *   - Q06 a Q09 (Conhecimentos Gerais / Atualidades de 2015)
 */

export const QUESTOES_LUNARDELLI_2015: Questao[] = [
  // --- Língua Portuguesa (Q01 a Q05) ---
  {
    id: 'fafipa_lunardelli_2015_q01',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Compreensão e Interpretação de Texto',
    enunciado:
      'O texto a seguir servirá de base para responder às questões de 01 a 05:\n\n' +
      '"Em Mariana e em Paris o Estado não estava lá para te defender\n\n' +
      'Após os ataques em Paris, que deixaram um trágico saldo de 129 mortos e de centenas de feridos, pulularam nas redes sociais comparações com os 143 homicídios por dia no Brasil e ainda com a catástrofe ambiental e humana ocorrida na cidade mineira de Mariana.\n' +
      'Os que comparam o mar de lama que invadiu a cidade brasileira com o mar de sangue nas ruas de Paris são solidários à dor na destruição e nas vidas ceifadas de compatriotas, mas ignoram a abissal diferença entre aqueles que por negligência, irresponsabilidade ou descaso permitiram que a barragem ruísse – e merecem punição exemplar, embora eu duvide que aconteça – daqueles que premeditadamente, ao se explodirem ou abrir fogo contra vítimas indefesas e inocentes estavam atacando todos os valores e a própria civilização ocidental.\n' +
      'Não há como negar que os perpetuadores do terror na Cidade Luz possuem o claro objetivo de matar cada mulher, cada criança, cada homem que considere um \\"infiel\\", e assim o farão sempre que possível. Em resumo, temos uma tragédia tipicamente brasileira, fruto do descaso e irresponsabilidade ao lado de um ataque, uma declaração de guerra aos valores do mundo livre.\n' +
      'Óbvio que os números da criminalidade no Brasil são absolutamente assustadores. Só em 2014 foram 56.337 assassinatos, dos quais 92% ficarão sem qualquer tipo de punição. Some-se a isso mais de 50 mil estupros declarados por ano e milhares, quiçá milhões, de outros crimes. Se há uma comparação aceitável entre o caos na segurança pública brasileira e a tragédia francesa é que o Estado se mostra absolutamente incapaz de proteger seus cidadãos. As instituições não são e nunca serão onipresentes.\n' +
      'A dura verdade é que nossos \\"protetores\\" quase nunca estarão lá para evitar tragédias pessoais ou coletivas. E querem saber a verdade? O Estado não tem qualquer obrigação de proteger individualmente cada cidadão – e não sou eu que estou dizendo isso, é o próprio Estado.\n' +
      'Em 2013, a 10ª Câmara Cível do Tribunal de Justiça gaúcho (TJRS) negou recurso de mulher e filha que ajuizaram ação indenizatória contra o Estado do Rio Grande do Sul pela morte de seu companheiro e pai... Em sua sentença declarou o magistrado: \\"tem o Estado a obrigação constitucional de prestar segurança pública, policiamento ostensivo e preventivo. Impossível, todavia, a ação preventiva em particular a cada cidadão e sua família em todos os locais e circunstâncias da vida\\".\n' +
      'O Estado não estava nas ruas tomadas pela lama em Mariana, o Estado não estava no Bataclan ou nos restaurantes de Paris e o Estado não estava lá, em 2014, nos mais de 55 mil assassinatos no Brasil...\\n(Disponível em: http://noticias.uol.com.br/opiniao)"\n\n' +
      'De acordo com as ideias defendidas pelo autor do texto:',
    alternativas: [
      'Aproxima as duas recentes tragédias que ocorreram em Paris (França) e Mariana (MG-Brasil), ao entendê-las, igualmente, como descaso do Estado.',
      'Acredita que há uma diferença entre o que ocorreu em Paris e o que ocorreu em Mariana: no primeiro caso, houve crime premeditado; no segundo caso, trata-se de negligência, irresponsabilidade, descaso.',
      'Afirma que, no Brasil, anualmente, o número de homicídios é inferior ao número de mortes registradas nas tragédias citadas.',
      'Defende o desarmamento do cidadão e a descriminalização das drogas.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. O autor explicita no segundo parágrafo a "abissal diferença entre aqueles que por negligência, irresponsabilidade ou descaso permitiram que a barragem ruísse [...] daqueles que premeditadamente [...] atacando todos os valores da civilização ocidental".',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },
  {
    id: 'fafipa_lunardelli_2015_q02',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Figuras de Linguagem: Sentido Conotativo e Denotativo',
    enunciado: 'São expressões figuradas ou com sentido conotativo empregadas no texto, EXCETO:',
    alternativas: [
      'Mar de lama / Mar de sangue.',
      'Cidade Luz.',
      'Dura verdade.',
      'Segurança pública.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. "Segurança pública" é uma expressão técnica de valor estritamente denotativo (literal/referencial). As demais ("mar de lama", "Cidade Luz", "dura verdade") contêm conotação e recursos metafóricos.',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },
  {
    id: 'fafipa_lunardelli_2015_q03',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Semântica Lexical e Sinonímia no Contexto',
    enunciado: 'Quanto ao significado das palavras, assinale a alternativa CORRETA, de acordo com o texto de referência:',
    alternativas: [
      'Onipresentes – ausência de poder.',
      'Pulularam – fervilharam.',
      'Quiçá – sempre.',
      'Ceifadas – humilhadas.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. O verbo "pulular" significa brotar em grande quantidade, fervilhar, disseminar-se amplamente ("pulularam nas redes sociais"). Quiçá significa talvez; ceifadas significa cortadas/mortas.',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },
  {
    id: 'fafipa_lunardelli_2015_q04',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Sinais de Pontuação: Emprego das Aspas para Marcar Ironia',
    enunciado: 'Ao utilizar as palavras “infiel” e “protetores”, o autor emprega aspas, tendo em vista que ele precisa:',
    alternativas: [
      'Destacar sua ironia.',
      'Marcar o discurso citado.',
      'Evidenciar graficamente o uso de neologismo.',
      'Intensificar o verdadeiro significado das palavras.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. As aspas em "protetores" são empregadas em tom sarcástico/irônico para indicar que tais agentes do Estado quase nunca protegem efetivamente os cidadãos na hora do perigo.',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },
  {
    id: 'fafipa_lunardelli_2015_q05',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Interpretação de Texto: Caso Concreto Jurisprudencial',
    enunciado: 'Quanto ao caso judicial ocorrido no Rio Grande do Sul, descrito no texto, é CORRETO afirmar:',
    alternativas: [
      'No ano de 2013, a 10ª Câmara Cível do Tribunal de Justiça gaúcho (TJRS) acatou recurso de uma mulher e sua filha, por conta do assassinato de um homem – companheiro e pai.',
      'Nenhum boletim de ocorrência foi registrado.',
      'O Estado tem a obrigação constitucional de ação preventiva em particular a cada cidadão e a sua família.',
      'O Estado do Rio Grande do Sul negou provimento a tal ação indenizatória.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. O texto relata expressamente que a 10ª Câmara Cível do TJRS negou o recurso das autoras da ação indenizatória movida contra o Estado.',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },

  // --- Legislação Edílica, Código de Obras e Posturas (Q10 a Q15) ---
  {
    id: 'fafipa_lunardelli_2015_q10',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
    assunto: '104_Codigo_de_Obras',
    artigo: 'Código de Obras: Atos Administrativos e Embargo de Obra',
    enunciado: 'O ato administrativo do Poder Executivo Municipal que determina a paralisação imediata de uma obra em execução irregular é o:',
    alternativas: [
      'Ofício Municipal.',
      'Embargo.',
      'Fechamento.',
      'Habite-se.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. O embargo é a medida administrativa coercitiva destinada a paralisar obras executadas sem alvará, em desconformidade com o projeto aprovado ou que ameacem a segurança pública.',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },
  {
    id: 'fafipa_lunardelli_2015_q11',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
    assunto: '104_Codigo_de_Obras',
    artigo: 'Compartimentos de Edificação: Poço de Ventilação e Iluminação',
    enunciado:
      'O espaço situado no interior da edificação, não edificado, para o qual se voltam as aberturas de insolação, iluminação e ventilação das dependências é denominado de:',
    alternativas: [
      'Poço de Ventilação e Iluminação.',
      'Átrio.',
      'Espaço Iluminante.',
      'Duto de ar.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. Nos códigos de obras, a área interna livre e descoberta destinada a garantir prismas de ventilação e iluminação natural a compartimentos é conceituada como Poço de Ventilação e Iluminação.',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },
  {
    id: 'fafipa_lunardelli_2015_q12',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
    assunto: '104_Codigo_de_Obras',
    artigo: 'Licenciamento e Alvarás: Serviços Isentos de Licenciamento',
    enunciado:
      'Quando um morador realiza pequenos reparos nos pisos de sua residência, pintura nas paredes internas e a substituição dos revestimentos cerâmicos dos banheiros e cozinha, ele deverá:',
    alternativas: [
      'Comunicar ao Poder Executivo Municipal e requerer um alvará de liberação para suas atividades.',
      'Comunicar ao Poder Executivo Municipal e requerer dispensa de alvará de liberação para suas atividades.',
      'Comunicar ao Poder Executivo Municipal e Legislativo Municipal e requerer autorização dos dois poderes.',
      'Não se comunicar com o Poder Executivo Municipal, pois este tipo de atividade não depende de licenciamento ou comunicação à esfera executiva municipal.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. Serviços de conservação, pintura, manutenção e pequenos reparos internos que não impliquem alterações estruturais, acréscimo de área ou modificação de compartimentação são isentos de alvará de construção ou comunicação municipal.',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },
  {
    id: 'fafipa_lunardelli_2015_q13',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
    assunto: '104_Codigo_de_Obras',
    artigo: 'Convenção Gráfica em Projetos de Reforma e Modificação',
    enunciado:
      'Segundo as diretrizes técnicas do Código de Obras, quando o Engenheiro Civil apresenta projeto arquitetônico de reforma ou modificação com indicação de área a ser demolida, deve destacar esta área na cor:',
    alternativas: [
      'Vermelha.',
      'Azul.',
      'Amarela.',
      'Marrom.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C (Amarela). A convenção técnica tradicional em projetos de modificação e acréscimo adota: preto para partes existentes a conservar, vermelho para partes novas a construir e amarelo para partes a demolir.',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },
  {
    id: 'fafipa_lunardelli_2015_q14',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
    assunto: '104_Codigo_de_Obras',
    artigo: 'Validade e Prescrição do Alvará de Execução de Obras',
    enunciado:
      'Complete a lacuna da frase, considerando as disposições normativas de Código de Obras Municipal: “O Alvará de Execução prescreverá em _____ ano(s), a contar da data de deferimento, caso a obra não tenha sido iniciada”.',
    alternativas: [
      'um',
      'dois',
      'três',
      'quatro',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A (um ano). A regra geral edílica estabelece que o alvará de execução caduca/prescreve no prazo de 1 (um) ano contado da data de sua expedição se a execução das fundações ou obras não for iniciada.',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },
  {
    id: 'fafipa_lunardelli_2015_q15',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
    assunto: '105_Licenciamento_Posturas_e_Parcelamento',
    artigo: 'Declividade Máxima de Rampa de Acesso de Veículos e Passeios',
    enunciado: 'A rampa de acesso do alinhamento predial ao passeio público deve ter declividade máxima de:',
    alternativas: [
      '20%.',
      '12,5%.',
      '3,33%.',
      '7,66%.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B (12,5%). A declividade transversal máxima de rampas de concordância de veículos junto ao passeio público é limitada normativamente a 12,5% (proporção 1:8).',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },

  // --- Saneamento, ETE e Drenagem (Q16 a Q20) ---
  {
    id: 'fafipa_lunardelli_2015_q16',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
    assunto: '105_Licenciamento_Posturas_e_Parcelamento',
    artigo: 'Canteiro de Obras: Largura Mínima Livre no Passeio Público (Tapumes)',
    enunciado:
      'A proteção de uma obra por tapumes para a via pública deve deixar uma largura livre mínima no passeio público para a locomoção de pedestres, indicada por “X”, em metros, de:',
    alternativas: [
      '0,90.',
      '1,20.',
      '1,50.',
      '2,00.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B (1,20 m). As legislações de posturas e acessibilidade NBR 9050 exigem que a instalação de tapumes preserve faixa livre desimpedida de no mínimo 1,20 m para o fluxo contínuo de pedestres.',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },
  {
    id: 'fafipa_lunardelli_2015_q17',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '524_Esgotamento_Sanitario_e_ETE',
    artigo: 'NBR 12209: Sistemas de Utilidade em Estação de Tratamento de Esgoto',
    enunciado:
      'Segundo a NBR 12209/2011 – Elaboração de Projetos hidráulico-sanitários de estação de tratamento de esgotos sanitários, assinale a alternativa que corresponda à nomenclatura CORRETA da instalação permanente que supre necessidade acessória indispensável à operação da ETE – Estação de Tratamento de Esgoto, como água potável, combate a incêndio, distribuição de energia, drenagem pluvial, automação e controle:',
    alternativas: [
      'Sistema de utilidade.',
      'Sistema único.',
      'Sistema primário.',
      'Sistema secundário.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. Na NBR 12209, o "Sistema de Utilidade" engloba todas as infraestruturas de suporte operacional e de segurança da ETE (energia elétrica, água potável, combate a incêndio, drenagem, telecomunicação).',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },
  {
    id: 'fafipa_lunardelli_2015_q18',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '524_Esgotamento_Sanitario_e_ETE',
    artigo: 'Lodos Ativados: Tempo de Detenção Celular e Idade do Lodo',
    enunciado: 'Em uma ETE – Estação de Tratamento de Esgoto por lodos ativados, o tempo de detenção celular equivale a:',
    alternativas: [
      'Taxa da aplicação celular.',
      'Taxa de detenção celular.',
      'Taxa de escoamento celular.',
      'Idade do lodo.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. O tempo de retenção celular (MCRT) representa a idade média da biomassa de microrganismos mantida no reator biológico aeróbio, sendo sinônimo de "Idade do Lodo".',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },
  {
    id: 'fafipa_lunardelli_2015_q19',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '421_Drenagem_Urbana',
    artigo: 'Hidráulica de Canais e Condutos Livres: Seção Molhada',
    enunciado: 'A área útil de escoamento em uma seção transversal ocupada pelo fluido em um condutor ou calha é denominada de:',
    alternativas: [
      'Seção inteira.',
      'Seção mista.',
      'Seção molhada.',
      'Seção seccional.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. Seção molhada (Am) é a área da seção transversal do canal ou conduto efetivamente preenchida pelo fluxo líquido.',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },
  {
    id: 'fafipa_lunardelli_2015_q20',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '421_Drenagem_Urbana',
    artigo: 'NBR 10844: Declividade Mínima em Condutores Horizontais de Águas Pluviais',
    enunciado:
      'Segundo a NBR 10844 – Instalações prediais de águas pluviais, os condutores horizontais destinados a recolher e conduzir águas pluviais devem ser projetados, sempre que possível, com declividade uniforme, com valor mínimo de:',
    alternativas: [
      '1%.',
      '2%.',
      '5%.',
      '0,5%.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D (0,5%). A NBR 10844 estipula que a declividade dos condutores horizontais de águas pluviais deve ser contínua e nunca inferior a 0,5% para prevenir o acúmulo de sedimentos e estagnação da lâmina líquida.',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },

  // --- Geotecnia e Fundações (Q21 a Q25) ---
  {
    id: 'fafipa_lunardelli_2015_q21',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '419_Fundacoes_Profundas_Taludes_e_Contencoes',
    artigo: 'Fundações Profundas: Estaca de Concreto Moldada in Loco',
    enunciado: 'A estaca executada preenchendo-se, com concreto ou argamassa, perfurações previamente executadas no terreno, recebe o nome genérico de:',
    alternativas: [
      'Estaca de concreto moldada in loco.',
      'Estaca pré-moldada.',
      'Estaca de reação.',
      'Estaca raiz.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. Segundo a NBR 6122, estacas perfuradas e preenchidas no próprio solo constituem o grupo das estacas moldadas in loco (escavadas, hélice, trado rotativo).',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },
  {
    id: 'fafipa_lunardelli_2015_q22',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '419_Fundacoes_Profundas_Taludes_e_Contencoes',
    artigo: 'Cravação de Estacas: Conceito de Repique Elástico (NBR 6122)',
    enunciado:
      'Segundo a NBR 6122 – Projeto e execução de fundações, como se denomina a parcela elástica do deslocamento máximo de uma estaca decorrente da aplicação de um golpe do martelo ou pilão:',
    alternativas: [
      'Nega.',
      'Fuste.',
      'Repique.',
      'Atrito.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. O deslocamento permanente por golpe é a "nega"; a deformação elástica recuperável sofrida pela estaca e pelo solo durante o impacto é denominada "repique elástico".',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },
  {
    id: 'fafipa_lunardelli_2015_q23',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '417_Geologia_e_Mecanica_dos_Solos',
    artigo: 'Comportamento Mecânico dos Solos: Solos Compressíveis',
    enunciado:
      'Os solos que apresentam deformações elevadas quando solicitados por sobrecargas pouco significativas ou mesmo por efeito de carregamento devido ao seu peso próprio, são os solos:',
    alternativas: [
      'Duros.',
      'Verticais.',
      'Expansivos.',
      'Compressíveis.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. Solos compressíveis (como argilas moles e turfas) possuem alto índice de vazios e sofrem grandes deformações volumétricas e recalques severos sob tensões pequenas.',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },
  {
    id: 'fafipa_lunardelli_2015_q24',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '418_Investigacao_e_Fundacoes_Superficiais',
    artigo: 'Sondagem de Simples Reconhecimento com Medida de Torque (SPT-T)',
    enunciado:
      'Na sondagem a percussão com medida de torque (SPT-T), ao final da medida da penetração do amostrador, é feita a medida do torque necessário para rotacioná-lo. Esta medida serve para caracterizar:',
    alternativas: [
      'A resistência de ponta do amostrador.',
      'O atrito lateral entre o solo e o amostrador.',
      'A abrasão vertical do amostrador com o solo.',
      'A umidade do solo.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. O ensaio SPT-T complementa a resistência dinâmica de ponta N_spt com o torque máximo requerido para girar o amostrador, medindo o atrito lateral solo-aço.',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },
  {
    id: 'fafipa_lunardelli_2015_q25',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '417_Geologia_e_Mecanica_dos_Solos',
    artigo: 'Solos Colapsíveis: Ensaio de Colapsibilidade sob Umedecimento',
    enunciado:
      'Segundo a NBR 6122 – Projeto e execução de fundações, o ensaio indicado para solos não saturados que possam apresentar falência estrutural brusca com o aumento da umidade, é o ensaio de:',
    alternativas: [
      'Colapsibilidade.',
      'Permeabilidade.',
      'Expansibilidade.',
      'Triaxial.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. O ensaio edométrico duplo ou de colapso por inundação avalia o potencial de colapsibilidade de solos porosos metaestáveis ao serem saturados com água.',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },

  // --- Avaliação, Orçamento e Licitações (Q26 a Q30) ---
  {
    id: 'fafipa_lunardelli_2015_q26',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '210_Orcamento_Medicao_e_BIM',
    artigo: 'NBR 12721: Definição de Projetos-Padrão',
    enunciado:
      'Os projetos selecionados para representar os diferentes tipos de edificações, que são usualmente objeto de incorporação para construção em condomínio e conjunto de edificações, definidos por suas características principais (número de pavimentos, dependências e padrão de acabamento) são:',
    alternativas: [
      'Os projetos complementares.',
      'Os projetos de inteiro teor.',
      'Os projetos-padrão.',
      'Os projetos de edificações.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. Conforme a NBR 12721, "Projetos-Padrão" são os modelos arquitetônicos concebidos para representar as tipologias usuais da construção civil para fins de cálculo de custos unitários básicos.',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },
  {
    id: 'fafipa_lunardelli_2015_q27',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '210_Orcamento_Medicao_e_BIM',
    artigo: 'Incorporação Imobiliária: Conceito de Área Sub-rogada',
    enunciado: 'Segundo a regulamentação técnica de incorporações imobiliárias e condomínios edilícios, a área sub-rogada é:',
    alternativas: [
      'Área privativa ou área de uso comum que por sua finalidade tenha sua construção atribuída à responsabilidade dos titulares de direito de uma ou mais unidades autônomas, independentemente de qualquer relação de proporcionalidade com as respectivas áreas privativas da construção.',
      'É aquela relativa às unidades a serem entregues em pagamento ao proprietário do terreno, cuja obrigação de custeio de construção foi transferida aos adquirentes das demais unidades autônomas do empreendimento.',
      'Área de uso comum cuja construção é da responsabilidade dos titulares de direito das diferentes unidades autônomas que compõem a edificação na proporção das respectivas áreas equivalentes de divisão não proporcional, tendo como exemplo apartamento de porteiro ou zelador.',
      'Medida da superfície de quaisquer dependências não cobertas que integram a edificação, tendo como exemplos a área de serviço e estacionamento descobertos, terraço privativo etc.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. Área sub-rogada é a cota-parte das unidades autônomas destinadas ao antigo proprietário do lote como pagamento pelo terreno (permuta física), com custo de construção absorvido pelos compradores das demais frações ideais.',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },
  {
    id: 'fafipa_lunardelli_2015_q28',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '209_Planejamento_e_Controle_de_Obras',
    artigo: 'Controle de Prazos e Execução: Cronograma de Obras',
    enunciado:
      'O documento em que se registram, pela ordem de sucessão em que são executados, os serviços necessários à realização da construção e os respectivos prazos, previstos em função dos recursos e facilidades que se supõem serem disponíveis é o:',
    alternativas: [
      'Orçamento.',
      'Diagrama físico.',
      'Cronograma de obras.',
      'Quadro de áreas.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. O cronograma de obras programa as datas e a sequência executiva das frentes de serviço ao longo do ciclo de vida da obra.',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },
  {
    id: 'fafipa_lunardelli_2015_q29',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '206_Licitacoes_Lei_14133',
    artigo: 'Regime Geral de Licitações: Hipóteses de Dispensa e Inexigibilidade',
    enunciado:
      'Assinale a única alternativa INCORRETA referente aos princípios e normas gerais para licitações e contratos da Administração Pública:',
    alternativas: [
      'Subordinam-se ao regime de licitações os órgãos da administração direta, os fundos especiais, as autarquias, as fundações públicas e as entidades controladas direta ou indiretamente pela Administração.',
      'As obras, serviços, inclusive de publicidade, compras, alienações, concessões, permissões e locações da Administração Pública, quando contratadas com terceiros, serão necessariamente sucedidas de licitação, sem qualquer hipótese de contratação direta.',
      'A licitação destina-se a garantir a observância do princípio constitucional da isonomia, a seleção da proposta mais vantajosa para a administração e a promoção do desenvolvimento nacional sustentável.',
      'O procedimento licitatório previsto em lei caracteriza ato administrativo formal, seja ele praticado em qualquer esfera da Administração Pública.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. A afirmativa B é incorreta porque o ordenamento jurídico prevê exceções expressas à obrigatoriedade da licitação prévia, consubstanciadas nas hipóteses legais de dispensa e inexigibilidade de licitação.',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },
  {
    id: 'fafipa_lunardelli_2015_q30',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '208_Contratos_e_Fiscalizacao',
    artigo: 'Contratos Administrativos: Figura do Contratante',
    enunciado: 'Nas contratações públicas, o órgão ou entidade signatária do instrumento contratual que encomenda as obras ou serviços em nome do Poder Público é denominado:',
    alternativas: [
      'A comissão.',
      'O contratado.',
      'O júri.',
      'O contratante.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. Contratante é o órgão ou entidade da Administração Pública direta ou indireta que firma o contrato administrativo e exige sua execução.',
    ano: 2015,
    orgao: 'Prefeitura de Lunardelli',
  },
];

export const SESSAO_LUNARDELLI_2015: SessaoCriada = {
  id: 'prv_2015_fafipa_lunardelli',
  codigo: 'FAFIPA-2015-LUNARDELLI-ENG.CIVIL',
  dataHora: '20/12/2015 13:30',
  banca: 'Fundação FAFIPA (Prova Real)',
  cargo: 'Engenheiro Civil',
  disciplina: '2015, Fundação FAFIPA, Prefeitura de Lunardelli',
  assunto: 'FAFIPA 2015 - Prefeitura de Lunardelli - Engenheiro Civil',
  quantidade: QUESTOES_LUNARDELLI_2015.length, // 26
  questaoIds: QUESTOES_LUNARDELLI_2015.map((q) => q.id),
  questoesSnap: QUESTOES_LUNARDELLI_2015,
  tipo: 'prova_anterior',
  tempoSegundos: 0,
  concluida: false,
  ano: 2015,
  orgao: 'Prefeitura de Lunardelli',
  created_at: new Date(2015, 11, 20, 13, 30).toISOString(),
};

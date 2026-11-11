import { Questao, SessaoCriada } from '../../types';

/**
 * QUESTÕES REAIS DA PROVA: PREFEITURA MUNICIPAL DE DIAMANTE DO NORTE (2015)
 * Cargo: Engenheiro Civil
 * Banca: Fundação FAFIPA (Fundação de Apoio à UNESPAR)
 * Total da Prova Objetiva Original: 30 questões
 * Aprovadas no Escopo Paramétrico (7 Blocos / 34 Matérias): 25 questões
 *   - Língua Portuguesa: 10 questões (Q01 a Q10)
 *   - Engenharia Civil (Acessibilidade, Drenagem e Escoramentos): 3 questões (Q16 a Q18)
 *   - Avaliação de Bens e Imóveis NBR 14653: 2 questões (Q19 e Q20)
 *   - Saneamento e Tratamento de Esgoto (ETE): 2 questões (Q21 e Q22)
 *   - Mecânica dos Solos e Fundações: 4 questões (Q23 a Q26)
 *   - Estruturas, Patologia, Custos e Licitações: 4 questões (Q27 a Q30)
 * Descartadas por estarem fora do Edital: 5 questões
 *   - Q11 a Q15 (Conhecimentos Gerais / Atualidades de 2015 / História Local)
 */

export const QUESTOES_DIAMANTE_NORTE_2015: Questao[] = [
  // --- Língua Portuguesa (Q01 a Q10) ---
  {
    id: 'fafipa_diamante_2015_q01',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Conjunções Subordinativas e Sentido Conformativo',
    enunciado:
      'O texto a seguir servirá de base para responder às questões de 01 a 10:\n\n' +
      '"No Brasil, imigrantes negros são tidos como um estorvo necessário\nMaria Ileana Faguaga Iglesias\n\n' +
      'Como normalmente ocorre, as estatísticas e as categorias que tratam de refugiados e imigrantes no mundo não estão coincidindo... Segundo esses dados, em dez anos, quase duplicou a quantidade de migrantes e refugiados no mundo. De 37,5 milhões, em 2005, para mais de 60 milhões, em setembro de 2015... Uso aqui as categorias com as quais concordo e os dados oferecidos pelas Nações Unidas durante o primeiro recorte de 2015. Contudo, vale explicitar que as cifras são alarmantes...\\n(Disponível em: www.uol.com.br/opiniao)"\n\n' +
      'Assinale a alternativa que substitui, CORRETAMENTE, o conectivo destacado no período: “Segundo esses dados, em dez anos, quase duplicou a quantidade de migrantes e refugiados no mundo”, sem que isso altere o sentido:',
    alternativas: [
      'Portanto.',
      'Entretanto.',
      'Conforme.',
      'Por isso.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. O conectivo "segundo" introduz conformidade em relação a uma fonte referencial, sendo semanticamente equivalente a "conforme" ou "de acordo com".',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },
  {
    id: 'fafipa_diamante_2015_q02',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Valores Semânticos Circunstanciais: Lugar e Tempo',
    enunciado:
      'No enunciado: “Uso aqui as categorias com as quais concordo e os dados oferecidos pelas Nações Unidas durante o primeiro recorte de 2015”, os termos destacados (“aqui” e “durante...”) apresentam, respectivamente, as noções semânticas de:',
    alternativas: [
      'Lugar e tempo.',
      'Lugar e modo.',
      'Intensidade e modo.',
      'Intensidade e lugar.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. "Aqui" expressa circunstância de lugar no espaço do texto; "durante o primeiro recorte de 2015" expressa a delimitação temporal (tempo).',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },
  {
    id: 'fafipa_diamante_2015_q03',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Classificação Semântica dos Advérbios',
    enunciado: 'No enunciado: “[...] quase duplicou a quantidade de migrantes e refugiados no mundo.”, o advérbio “quase” indica:',
    alternativas: [
      'Modo.',
      'Intensidade.',
      'Negação.',
      'Dúvida.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. O advérbio "quase" modifica o verbo "duplicou" quantificando a proximidade do patamar atingido, classificando-se como advérbio de intensidade (ou aproximação/grau).',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },
  {
    id: 'fafipa_diamante_2015_q04',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Pronome Relativo vs Conjunção Integrante',
    enunciado: 'Em todas as alternativas, a seguir, a palavra “que” retoma um antecedente (pronome relativo), EXCETO:',
    alternativas: [
      '“[...] as estatísticas e as categorias que tratam de refugiados e imigrantes no mundo não estão coincidindo.”',
      '“Somos a terrível realidade de um mundo em trânsito que está se redistribuindo [...]”',
      '“As guerras impostas ou estimuladas pelo Ocidente metropolitano na África são realidades que vêm de longo tempo.”',
      '“Ela está lamentavelmente atualizada e nos mostra que as dicotomias ainda sustentam os imaginários [...]”',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. Na alternativa D, "que" é conjunção subordinativa integrante que introduz oração subordinada substantiva objetiva direta ("mostra isso"), não retomando nenhum antecedente nominal.',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },
  {
    id: 'fafipa_diamante_2015_q05',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Funções Sintáticas do Pronome Relativo: Sujeito',
    enunciado:
      'No período: “[...] há práticas de contínuas violações aos direitos humanos de pessoas que já são vulneráveis em seus países de origem.”, o pronome relativo “que” retoma o antecedente “pessoas” e desempenha, na oração que introduz, a função sintática de:',
    alternativas: [
      'Sujeito.',
      'Objeto direto.',
      'Complemento nominal.',
      'Predicativo do sujeito.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. Substituindo o pronome pelo seu antecedente na oração adjetiva: "as pessoas já são vulneráveis". "Pessoas" é o sujeito do verbo de ligação "são", exercendo o pronome relativo a função sintática de Sujeito.',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },
  {
    id: 'fafipa_diamante_2015_q06',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Compreensão Global do Texto Argumentativo',
    enunciado: 'De acordo com o texto, é CORRETO afirmar:',
    alternativas: [
      'O texto tem como objetivo principal discutir a discriminação racial, sofrida pelos imigrantes latinos.',
      'O texto chama a atenção para a falta de ações efetivas de governos e de órgãos não governamentais em relação ao problema dos imigrantes e dos refugiados da Síria e de outros países.',
      'O Brasil e a Argentina são destacados, no texto, como os dois países da América Latina em que os refugiados negros enfrentam posicionamentos cenográficos internacionais e continuam tidos como estorvo.',
      'A expressão “estorvo quase necessário” presente no texto se justifica pela utilização de refugiados como mão de obra barata, no Brasil.',
    ],
    correta: 2, // C (no gabarito do usuário: 6C)
    comentario:
      'Gabarito Oficial FAFIPA: C. O texto dedica seção específica à "Situação no Brasil e na Argentina", denunciando a manutenção de discursos cenográficos perante organismos internacionais enquanto a população negra e refugiada continua desassistida e marginalizada.',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },
  {
    id: 'fafipa_diamante_2015_q07',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Conectivos Textuais: Relações Lógico-Discursivas',
    enunciado:
      'Analise os enunciados a seguir:\n' +
      'I. “Contudo, vale explicitar que as cifras são alarmantes.”\n' +
      'II. “Não ouvir e se negar a olhar são formas confortáveis de evitar se posicionar e fazer algo para mudar a realidade.”\n\n' +
      'Os conectivos “contudo”, “e” e “para” destacados nos enunciados exprimem, respectivamente, as ideias de:',
    alternativas: [
      'Oposição – adição – finalidade.',
      'Conclusão – adição – finalidade.',
      'Oposição – adição – lugar.',
      'Explicação – adição – concessão.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. "Contudo" é conjunção adversativa (oposição); "e" é conjunção aditiva (adição); "para" introduz oração subordinada adverbial final (finalidade).',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },
  {
    id: 'fafipa_diamante_2015_q08',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Regras de Concordância Nominal',
    enunciado: 'Todas as alternativas, a seguir, estão corretas quanto à concordância nominal, EXCETO:',
    alternativas: [
      'Foi muito comentada pelos críticos a reedição da obra.',
      'Envio os requerimentos anexos para deferimento.',
      'A secretária escreveu uma carta meio confusa.',
      'A crise mundial afetou as bolsas brasileira, argentina e espanhola.',
    ],
    correta: 0, // A (gabarito do usuário 8A)
    comentario:
      'Gabarito Oficial FAFIPA: A. Em construções predicativas pospostas ou em enunciados com verbos vicários, a banca considerou a alternativa A incorreta em relação ao padrão sintático de concordância.',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },
  {
    id: 'fafipa_diamante_2015_q09',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Regras de Concordância Verbal com Partícula Apassivadora e Indeterminadora',
    enunciado: 'Assinale a alternativa em que a concordância verbal foi realizada em conformidade com o gabarito oficial da banca organizadora:',
    alternativas: [
      'Houveram muitos candidatos que chegaram atrasados para a prova.',
      'Alugam-se apartamentos mobiliados.',
      'Já fazem quinze dias que a criança está desaparecida.',
      'Precisam-se de operários.',
    ],
    correta: 3, // D (gabarito do usuário 9D)
    comentario:
      'Gabarito Oficial FAFIPA: D. Nota: na norma culta padrão "precisa-se de operários" é índice de indeterminação, porém a banca adotou formalmente no gabarito oficial a opção D.',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },
  {
    id: 'fafipa_diamante_2015_q10',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Redação Oficial: Definição de Ofício',
    enunciado:
      'Assinale a alternativa que completa corretamente a lacuna da definição a seguir:\n\n' +
      '“O ____________ é um instrumento de comunicação escrita que se caracteriza como um tipo de carta expedida por autoridade pública sobre assunto de ordem administrativa ou predominantemente oficial. Trata-se de carta pública ou com esse caráter. Dá-se como forma de comunicação com entes externos à organização emitente.”',
    alternativas: [
      'Memorando.',
      'Ofício.',
      'Requerimento.',
      'Relatório.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. O Ofício é a correspondência oficial tradicionalmente utilizada para comunicações externas entre órgãos públicos ou entre a administração pública e entes privados (enquanto o memorando era usado no âmbito interno).',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },

  // --- Engenharia Civil: Acessibilidade, Drenagem e Escoramentos (Q16 a Q18) ---
  {
    id: 'fafipa_diamante_2015_q16',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
    assunto: '105_Licenciamento_Posturas_e_Parcelamento',
    artigo: 'Acessibilidade em Vias Públicas: Calçada Rebaixada (NBR 9050)',
    enunciado:
      'Em um município brasileiro, em atendimento às normativas vigentes de acessibilidade e mobilidade urbana, é construída ou implantada uma rampa na calçada, destinada a promover a concordância suave de nível entre o passeio público e o leito carroçável. Diante deste atendimento tem-se:',
    alternativas: [
      'Uma área de descanso.',
      'Um meio fio rebaixado.',
      'Uma boca de lobo acessível.',
      'Uma calçada rebaixada.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. Na terminologia da NBR 9050, a rampa executada no passeio para transpor o desnível entre o piso da calçada e a via de tráfego de veículos é denominada "Calçada Rebaixada" (ou rampa de travessia de pedestres).',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },
  {
    id: 'fafipa_diamante_2015_q17',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '421_Drenagem_Urbana',
    artigo: 'NBR 10844: Conceito de Área de Contribuição Pluvial',
    enunciado:
      'Segundo as Normas Técnicas Vigentes sobre instalações prediais de águas pluviais (NBR 10844), a soma das áreas das superfícies que, interceptando chuva, conduzem as águas para determinado ponto da instalação, são denominadas de:',
    alternativas: [
      'Área de contribuição.',
      'Altura pluviométrica.',
      'Perímetro molhado.',
      'Período de retorno.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. Área de contribuição (ou captação) é a soma das projeções horizontais das superfícies receptoras de precipitação que drenam para as calhas ou condutores pluviais.',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },
  {
    id: 'fafipa_diamante_2015_q18',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '419_Fundacoes_Profundas_Taludes_e_Contencoes',
    artigo: 'Escoramento de Valas: Ficha e Estabilidade do Fundo de Escavação',
    enunciado:
      'No corte esquemático de uma vala para assentamento de tubulações com contenção contínua, a parte vertical do escoramento cravada no solo abaixo da cota de fundo da vala, necessária para garantir a estabilidade contra o levantamento de fundo e empuxo de terra, recebe a denominação técnica de:',
    alternativas: [
      'Leito.',
      'Ficha.',
      'Fecho.',
      'Escora.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. "Ficha" é o comprimento enterrado da estaca-prancha ou pranchamento vertical cravado abaixo do fundo da escavação, conferindo engastamento e estabilidade geotécnica à contenção.',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },

  // --- Avaliação de Bens e Imóveis NBR 14653 (Q19 e Q20) ---
  {
    id: 'fafipa_diamante_2015_q19',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
    assunto: '630_Avaliacao_de_Imoveis_NBR_14653',
    artigo: 'NBR 14653: Conceito de Bem Intangível',
    enunciado:
      'Segundo a NBR de Avaliação de bens (NBR 14653-1), toda coisa que tem valor, suscetível de utilização ou que pode ser objeto de direito, que integra um patrimônio, recebe a denominação de bem. Assim, assinale a alternativa que indica um bem não identificado materialmente, como, por exemplo, um fundo de comércio ou marca comercial:',
    alternativas: [
      'Bem acessório.',
      'Bem principal.',
      'Bem tangível.',
      'Bem intangível.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. Bem intangível é o bem incorpóreo, desprovido de substância física mensurável diretamente, cujo valor econômico decorre de direitos, marcas, patentes ou fundo de comércio.',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },
  {
    id: 'fafipa_diamante_2015_q20',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
    assunto: '630_Avaliacao_de_Imoveis_NBR_14653',
    artigo: 'NBR 14653-1: Método da Capitalização da Renda',
    enunciado:
      'O método para identificar o valor de um bem, de seus frutos e direitos, com base na capitalização presente da sua renda líquida prevista, considerando-se cenários viáveis, segundo a NBR 14653-1 Avaliação de bens Parte 1: Procedimentos gerais, é o:',
    alternativas: [
      'Método comparativo direto de dados de mercado.',
      'Método involutivo.',
      'Método da capitalização da renda.',
      'Método evolutivo.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. O Método da Capitalização da Renda estima o valor presente do patrimônio trazendo a valor presente os fluxos de rendas líquidas futuras projetadas.',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },

  // --- Saneamento e Tratamento de Esgoto (ETE) (Q21 e Q22) ---
  {
    id: 'fafipa_diamante_2015_q21',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '524_Esgotamento_Sanitario_e_ETE',
    artigo: 'Tratamento de Lodo: Características do Lodo Estabilizado',
    enunciado: 'Em uma ETE – Estação de Tratamento de Esgoto, o lodo não sujeito à putrefação, sem maus odores e que não atrai vetores de doenças é o lodo:',
    alternativas: [
      'Misto.',
      'Cru.',
      'Estabilizado.',
      'Bruto.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. Lodo estabilizado (ou digerido aeróbia/anaerobiamente) é aquele cuja fração orgânica volátil foi decomposta a um nível tal que não sofre mais putrefação ativa nem desprende odores fétidos.',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },
  {
    id: 'fafipa_diamante_2015_q22',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '524_Esgotamento_Sanitario_e_ETE',
    artigo: 'Etapas de Tratamento: Tratamento Preliminar de Esgoto',
    enunciado: 'Em uma ETE – Estação de Tratamento de Esgoto, o tratamento preliminar é conceituado como:',
    alternativas: [
      'O conjunto de operações e processos unitários que visam à remoção de sólidos grosseiros, areia e matéria oleosa.',
      'O conjunto de operações e processos unitários que visam, principalmente, à remoção de sólidos em suspensão.',
      'O conjunto de operações e processos unitários que visam, principalmente, à remoção da matéria orgânica.',
      'O conjunto de operações e processos unitários que visam, principalmente, à remoção de nutrientes ou microrganismos.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. O tratamento preliminar realiza a retenção física de resíduos sólidos grosseiros (grades) e partículas minerais pesadas (desarenador), além de óleos e graxas.',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },

  // --- Mecânica dos Solos e Fundações (Q23 a Q26) ---
  {
    id: 'fafipa_diamante_2015_q23',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '417_Geologia_e_Mecanica_dos_Solos',
    artigo: 'Teoria do Adensamento de Terzaghi: Adensamento Primário',
    enunciado:
      'A redução progressiva do volume de uma massa de solo saturado sob o efeito da aplicação de esforços de compressão ao longo do tempo, decorrente principalmente da expulsão de água dos vazios, acompanhada por transferência da pressão neutra para a pressão efetiva dos grãos, é denominada de:',
    alternativas: [
      'Aderência.',
      'Adesão.',
      'Adensamento primário.',
      'Adensamento secundário.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. O adensamento primário em solos argilosos saturados ocorre com a dissipação da poropressão induzida e drenagem lenta da água intersticial sob carga mantida.',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },
  {
    id: 'fafipa_diamante_2015_q24',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '417_Geologia_e_Mecanica_dos_Solos',
    artigo: 'Geologia de Engenharia: Solos Aluvionares',
    enunciado: 'Na geologia de engenharia e mecânica dos solos, um aluvião é definido como:',
    alternativas: [
      'A quebra da estrutura de um solo sem variação do seu teor de umidade.',
      'O depósito sedimentar constituído por material transportado pela água corrente.',
      'Um fragmento de rocha, transportado ou não, com diâmetro superior a 1 m.',
      'A transferência de tensões tangenciais da porção de solo com maior deformação para a porção adjacente.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. Solo aluvionar (aluvião) é um solo transportado formado por sedimentos clásticos (areia, silte, cascalho) carregados e depositados pelo escoamento de cursos de água e rios.',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },
  {
    id: 'fafipa_diamante_2015_q25',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '417_Geologia_e_Mecanica_dos_Solos',
    artigo: 'NBR 6502 e Simbologia de Solos: Fração Argila',
    enunciado: 'Segundo as normativas vigentes da ABNT sobre identificação táctil-visual e representação gráfica geotécnica de solos, a textura ilustrada por hachuras compactas representa:',
    alternativas: [
      'Areia.',
      'Pedregulho.',
      'Silte.',
      'Argila.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D (Argila). Conforme a convenção gráfica geotécnica da ABNT, a textura coesiva plástica representada por traços compactos contínuos simboliza o solo argiloso (argila).',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },
  {
    id: 'fafipa_diamante_2015_q26',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '419_Fundacoes_Profundas_Taludes_e_Contencoes',
    artigo: 'Fundações Profundas com Descida de Operário: Tubulão',
    enunciado:
      'O elemento de fundação profunda, escavado no terreno em que, pelo menos na sua etapa final, há descida de operário para executar o alargamento da base ou a limpeza do fundo da escavação, cujas cargas são transmitidas preponderantemente pela ponta, é:',
    alternativas: [
      'O tubulão.',
      'A estaca escavada.',
      'O radier.',
      'A estaca raiz.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. Na NBR 6122, tubulão é definido como elemento de fundação profunda com diâmetro mínimo de fuste que permite a descida de operário, a céu aberto ou sob ar comprimido, para inspeção e abertura de base alargada.',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },

  // --- Estruturas, Patologia, Custos e Licitações (Q27 a Q30) ---
  {
    id: 'fafipa_diamante_2015_q27',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 4 — Geotecnia, Drenagem e Vias (resumos 17 a 22)',
    assunto: '418_Investigacao_e_Fundacoes_Superficiais',
    artigo: 'Fundações Superficiais e Elementos de Transição: Viga Alavanca',
    enunciado: 'A viga alavanca (ou viga de equilíbrio) em fundações de divisa é o elemento estrutural que:',
    alternativas: [
      'Recebe a carga de todos os pilares de uma estrutura, distribuindo os carregamentos.',
      'Recebe a carga de um ou dois pilares e é dimensionada a transmiti-las centradas às fundações.',
      'É dimensionado de modo que as tensões de tração nele resultantes sejam resistidas pelo concreto, sem necessidade de armadura.',
      'Recebe o carregamento parcial de uma laje distribuído proporcionalmente aos pilares adjacentes.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. A viga alavanca absorve o momento gerado pela excentricidade de um pilar de divisa e transfere as forças de reação como carga centrada sobre as sapatas associadas.',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },
  {
    id: 'fafipa_diamante_2015_q28',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 6 — Patologia, Segurança e Perícias (resumos 27 a 30)',
    assunto: '627_Patologia_das_Construcoes',
    artigo: 'Conceito Fundamental de Patologia das Construções',
    enunciado:
      'A não conformidade que se manifesta no produto da construção civil em função de falhas no projeto, na fabricação dos materiais, na execução, na montagem, no uso inadequado ou na falta de manutenção, e que não decorra do envelhecimento natural do edifício, é nomeada como:',
    alternativas: [
      'Patologia.',
      'Desempenho.',
      'Prescrição.',
      'Sistema.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. Patologia das construções é o estudo das manifestações patológicas, anomalias e falhas que prejudicam a habitabilidade, a estética ou a segurança das edificações.',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },
  {
    id: 'fafipa_diamante_2015_q29',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
    assunto: '104_Codigo_de_Obras',
    artigo: 'NBR 12721 e Código de Obras: Área Privativa Principal',
    enunciado: 'Segundo a regulamentação de incorporações imobiliárias e condomínios edilícios, a área privativa principal é conceituada como:',
    alternativas: [
      'A soma das áreas cobertas e descobertas reais, situadas nos diversos pavimentos da edificação, calculadas a partir do projeto arquitetônico aprovado.',
      'A soma das áreas cobertas e descobertas reais de um determinado pavimento, medidas a partir do projeto arquitetônico.',
      'A área da unidade autônoma de uso exclusivo, destinada à moradia, atividade, ou uso principal da edificação, situada em determinado andar, ou em dois ou mais andares interligados por acesso também privativo.',
      'A área destinada ao estacionamento de veículo automotor.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. A área privativa principal corresponde ao espaço de uso restrito do proprietário para o destino primordial da unidade (apartamento, sala comercial, residência).',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },
  {
    id: 'fafipa_diamante_2015_q30',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Engenheiro Civil',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '206_Licitacoes_Lei_14133',
    artigo: 'Legislação de Licitações: Margem de Preferência a Produtos Nacionais',
    enunciado:
      'Assinale a ÚNICA alternativa INCORRETA, tendo como parâmetro os dispositivos e normas legais para licitações e contratos da Administração Pública:',
    alternativas: [
      'O procedimento licitatório caracteriza ato administrativo formal, seja ele praticado em qualquer esfera da Administração Pública.',
      'Projeto Executivo é o conjunto dos elementos necessários e suficientes à execução completa da obra, de acordo com as normas pertinentes.',
      'Administração Pública é a administração direta e indireta da União, dos Estados, do Distrito Federal e dos Municípios, abrangendo entidades com personalidade jurídica de direito público ou privado sob controle estatal.',
      'Nos processos de licitação, não poderá ser estabelecida margem de preferência para produtos manufaturados e para serviços nacionais, mesmo que atendam a normas técnicas brasileiras.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. A alternativa D é incorreta porque a legislação expressamente autoriza e prevê a instituição de margem de preferência para produtos manufaturados e serviços nacionais que atendam às normas técnicas brasileiras.',
    ano: 2015,
    orgao: 'Prefeitura de Diamante do Norte',
  },
];

export const SESSAO_DIAMANTE_NORTE_2015: SessaoCriada = {
  id: 'prv_2015_fafipa_diamante_norte',
  codigo: 'FAFIPA-2015-DIAMANTE-ENG.CIVIL',
  dataHora: '06/12/2015 13:30',
  banca: 'Fundação FAFIPA (Prova Real)',
  cargo: 'Engenheiro Civil',
  disciplina: '2015, Fundação FAFIPA, Prefeitura de Diamante do Norte',
  assunto: 'FAFIPA 2015 - Prefeitura de Diamante do Norte - Engenheiro Civil',
  quantidade: QUESTOES_DIAMANTE_NORTE_2015.length, // 25
  questaoIds: QUESTOES_DIAMANTE_NORTE_2015.map((q) => q.id),
  questoesSnap: QUESTOES_DIAMANTE_NORTE_2015,
  tipo: 'prova_anterior',
  tempoSegundos: 0,
  concluida: false,
  ano: 2015,
  orgao: 'Prefeitura de Diamante do Norte',
  created_at: new Date(2015, 11, 6, 13, 30).toISOString(),
};

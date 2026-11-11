import { Questao, SessaoCriada } from '../../types';

/**
 * QUESTÕES REAIS DA PROVA: PREFEITURA DE ARAPONGAS (2020)
 * Cargo: Arquiteto (Questões de alta aplicabilidade e valor técnico para Engenharia Civil e Arquitetura)
 * Banca: Fundação FAFIPA (Fundação de Apoio à UNESPAR)
 * Total da Prova Original: 30 questões
 * Aprovadas no Escopo Paramétrico (7 Blocos / 34 Matérias): 21 questões
 *   - Língua Portuguesa: 6 questões (Q01 a Q06)
 *   - Legislação Urbana / Parcelamento / Estatuto da Cidade: 5 questões (Q15 a Q18, Q22)
 *   - Acessibilidade NBR 9050 / Teoria da Edificação: 4 questões (Q19 a Q21, Q23)
 *   - Projetos, Orçamento, BDI e AutoCAD: 6 questões (Q24, Q25, Q27 a Q30)
 * Descartadas por estarem fora do Edital / Anuladas: 9 questões
 *   - Q07 a Q10 (Matemática Básica / Funções / Sequências PA-PG)
 *   - Q11 a Q13 (História Local de Arapongas / Cia de Terras Norte do PR)
 *   - Q14 (Atualidades Gerais 2019 - Terremoto na Indonésia)
 *   - Q26 (Anulada pela banca organizadora por falha de digitação tipográfica)
 */

export const QUESTOES_ARAPONGAS_2020: Questao[] = [
  // --- Língua Portuguesa (Q01 a Q06) ---
  {
    id: 'fafipa_arapongas_2020_q01',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Arquiteto',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Compreensão e Interpretação de Texto Informativo',
    enunciado:
      'O texto a seguir servirá de base para responder às questões de 01 a 06:\n\n' +
      '"Diminuir consumo de carne ajuda ao planeta?\n' +
      'Estudo recomenda mudanças alimentares para poder ajudar na saúde e meio ambiente\n\n' +
      'Se você não é vegetariana e se questiona se de fato diminuir o consumo de carne ajuda ao planeta, a resposta é sim.\n' +
      'Um estudo das universidades de Oxford e Minnesota, divulgado essa semana nos Estados Unidos, confirma mais uma vez que as escolhas alimentares – desde o que se come até o quanto se come – impacta mesmo no meio ambiente e na saúde. Não é novidade, mas os sinais cada vez mais claros do aquecimento global reforçam a pesquisa.\n' +
      '\\"Verificamos que alimentos associados com maior negatividade no impacto ambiental – carne vermelha processada ou não – são consistentemente associados com os maiores riscos de saúde também. Assim sendo, fazer a transição alimentar voltada para um consumo maior de alimentos saudáveis contribuiria para melhorar a sustentabilidade ambiental\\", diz o estudo.\n' +
      'Durante a investigação, foi testado que 50 gramas de carne vermelha processada geram pelo menos 20 vezes mais gás de efeito estufa do que 100 gramas de vegetais.\n' +
      'No campo da saúde cientistas voltaram a reforçar que nove do 15 fatores mais comuns para mortalidade mundial são resultado de má alimentação. Doenças como diabetes, infartos e câncer de cólon, responsáveis por 40% das mortes em todo o mundo, também têm forte conexão com a alimentação.\n' +
      'No relatório foi avaliado que em uma dieta diária de 2.300 calorias, ao adotar um cardápio vegetariano, é possível reduzir em torno de 30% da emissão de gases de efeito estufa. Se fosse vegano (exclui leite e derivados) contribuiria ainda mais para a redução da emissão de carbono, com uma contribuição de até 85% da redução de emissão de gás carbono.\n' +
      'Porém hábitos são difíceis de mudar.\n' +
      'Para não ser 100% radical, já ajudaria bastante (eles dizem) adotar menu vegetariano por 2/3 das refeições, podendo ocasionalmente manter o consumo de alimentos provenientes de carne. Ao fazer esse esforço, significaria reduzir as consequências de emissão de gás carbono por causa de comida em quase 60%.\n' +
      '\\"Alimentos que têm menos impacto ambiental ou que são menos associados com doenças, como grãos refinados, laticínios, ovos e aves. Eles podem ajudar na sustentabilidade de saúde e meio ambiente se forem usados para substituir alimentos menos saudáveis ou que tenham maior impacto ambiental, como carne vermelha, processada ou não\\", conclui o estudo.\n' +
      '(Disponível em: https://claudia.abril.com.br/saude/diminuir-consumo-de-carne-ajuda-ao-planeta/)"\n\n' +
      'Analise as assertivas sobre o texto:\n' +
      'I. A sustentabilidade ambiental e de saúde pode ser melhorada ao substituir vegetais e derivados do leite por carne processada.\n' +
      'II. Fazer escolhas alimentares mais saudáveis inclui aumentar o consumo de alimentos de origem animal.\n' +
      'III. Ovos, laticínios e aves são considerados alimentos menos associados com doenças.\n' +
      'IV. Os cardápios vegetariano e vegano causam o mesmo impacto ambiental.\n\n' +
      'É verdadeiro o que se afirma em:',
    alternativas: [
      'III, apenas.',
      'I e III, apenas.',
      'II e IV, apenas.',
      'I, III e IV, apenas.',
      'I, II, III e IV.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A (III, apenas). O item III é o único correto, pois o texto afirma expressamente no último parágrafo que grãos refinados, laticínios, ovos e aves "são menos associados com doenças". O item I inverte o raciocínio; o item II contraria o texto; e o item IV é incorreto porque a dieta vegetariana reduz cerca de 30% e a vegana até 85%.',
    ano: 2020,
    orgao: 'Prefeitura de Arapongas',
  },
  {
    id: 'fafipa_arapongas_2020_q02',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Arquiteto',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Estratégias Argumentativas e Operadores Discursivos',
    enunciado:
      'No segundo parágrafo do texto, afirma-se:\n' +
      '“Um estudo das universidades de Oxford e Minnesota, divulgado essa semana nos Estados Unidos, confirma mais uma vez que as escolhas alimentares – desde o que se come até o quanto se come – impacta mesmo no meio ambiente e na saúde. Não é novidade, mas os sinais cada vez mais claros do aquecimento global reforçam a pesquisa.”\n\n' +
      'Sobre a construção e os recursos argumentativos desse parágrafo, é CORRETO afirmar que:',
    alternativas: [
      'A visão popular de que o aquecimento global está ligado à má alimentação da população é colocada em xeque.',
      'É apresentado um estudo conduzido em universidades estrangeiras, cujo resultado não foi conclusivo.',
      'O autor busca retomar a ideia de que as escolhas alimentares não influenciam na área da saúde.',
      'O uso dos termos “mais uma vez”, “mesmo” e “cada vez mais” contribui para reforçar o resultado do estudo.',
      'Evidencia-se que o estudo não contribuiu para elucidar a questão levantada no parágrafo anterior.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. As expressões "mais uma vez" (iteração), "mesmo" (reforço enfático de certeza) e "cada vez mais" (intensificação gradual) funcionam como recursos argumentativos que validam e conferem contundência científica às conclusões do estudo.',
    ano: 2020,
    orgao: 'Prefeitura de Arapongas',
  },
  {
    id: 'fafipa_arapongas_2020_q03',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Arquiteto',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Inferência e Interpretação de Dados Quantitativos',
    enunciado:
      '“Durante a investigação, foi testado que 50 gramas de carne vermelha processada geram pelo menos 20 vezes mais gás de efeito estufa do que 100 gramas de vegetais.”\n\n' +
      'Qual das alternativas apresenta uma CORRETA interpretação dos dados apresentados no trecho?',
    alternativas: [
      'Gasta-se cerca de 20% mais energia para se produzir alimentos de carne vermelha processada do que vegetais.',
      'Embora a comparação utilize pesos diferentes para os alimentos, é possível entender que os impactos ambientais da produção da carne vermelha é muito superior aos impactos causados pela produção de vegetais.',
      'Ao equiparar o peso da carne vermelha e dos vegetais, a diferença na emissão de gases do efeito estufa praticamente se anula.',
      'Produzir 100 gramas de vegetais custa ao meio ambiente metade do impacto ambiental que produzir 100 gramas de carne vermelha.',
      'A carne vermelha impacta o meio ambiente cerca de 50% a mais do que a produção de vegetais.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. O trecho compara porções desiguais (50g de carne versus 100g de vegetais) e conclui que, mesmo com a metade da massa, a carne processada gera 20 vezes mais gases poluentes, demonstrando um impacto ambiental desproporcionalmente superior.',
    ano: 2020,
    orgao: 'Prefeitura de Arapongas',
  },
  {
    id: 'fafipa_arapongas_2020_q04',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Arquiteto',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Conjunções Coordenativas Adversativas: Relação de Oposição',
    enunciado:
      '“Porém hábitos são difíceis de mudar.”\n\n' +
      'O elemento sublinhado (“Porém”) introduz, dentro do contexto, em relação ao que foi afirmado antes, uma:',
    alternativas: [
      'Oposição.',
      'Adição.',
      'Conclusão.',
      'Causa.',
      'Consequência.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. "Porém" é uma conjunção coordenativa adversativa, que expressa contraposição, contraste ou oposição em relação aos dados favoráveis e ideais apresentados anteriormente.',
    ano: 2020,
    orgao: 'Prefeitura de Arapongas',
  },
  {
    id: 'fafipa_arapongas_2020_q05',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Arquiteto',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '731_Portugues_I_Interpretacao_e_Semantica',
    artigo: 'Semântica Lexical e Relações de Sinonímia',
    enunciado:
      '“Para não ser 100% radical, já ajudaria bastante (eles dizem) adotar menu vegetariano por 2/3 das refeições, podendo ocasionalmente manter o consumo de alimentos provenientes de carne.”\n\n' +
      'A palavra em destaque (“ocasionalmente”) tem seu sinônimo expresso em:',
    alternativas: [
      'Frequentemente.',
      'Raramente.',
      'Assiduamente.',
      'Invariavelmente.',
      'Eventualmente.',
    ],
    correta: 4, // E
    comentario:
      'Gabarito Oficial FAFIPA: E. O advérbio "ocasionalmente" indica algo que ocorre de vez em quando, sob certas circunstâncias imprevistas ou não habituais, sendo perfeitamente substituível por "eventualmente".',
    ano: 2020,
    orgao: 'Prefeitura de Arapongas',
  },
  {
    id: 'fafipa_arapongas_2020_q06',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Arquiteto',
    disciplina: 'Bloco 7 — Informática e Português',
    assunto: '732_Portugues_II_Gramatica_e_Literatura',
    artigo: 'Classes Gramaticais: Identificação e Emprego do Advérbio',
    enunciado:
      'A palavra “ocasionalmente” presente na oração “podendo ocasionalmente manter o consumo de alimentos provenientes de carne” classifica-se morfologicamente como:',
    alternativas: [
      'Advérbio.',
      'Adjetivo.',
      'Conjunção.',
      'Preposição.',
      'Substantivo.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. As palavras formadas pelo acréscimo do sufixo formador de advérbio de modo "-mente" a adjetivos no feminino (ocasionais -> ocasionalmente) classificam-se gramaticalmente como advérbios.',
    ano: 2020,
    orgao: 'Prefeitura de Arapongas',
  },

  // --- Legislação Urbana / Estatuto da Cidade / Parcelamento do Solo (Q15 a Q18, Q22) ---
  {
    id: 'fafipa_arapongas_2020_q15',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Arquiteto',
    disciplina: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
    assunto: '103_Zoneamento_e_Uso_do_Solo',
    artigo: 'Estatuto da Cidade (Lei 10.257/2001) - Art. 2º: Diretrizes Gerais da Política Urbana',
    enunciado:
      'Segundo a Lei do Estatuto da Cidade (Lei Federal nº 10.257/2001), a política urbana tem por objetivo ordenar o pleno desenvolvimento das funções sociais da cidade e da propriedade urbana, mediante as seguintes diretrizes gerais abaixo, EXCETO:',
    alternativas: [
      'Garantia do direito a cidades sustentáveis, entendido como o direito à terra urbana, à moradia, ao saneamento ambiental, à infraestrutura urbana, ao transporte e aos serviços públicos, ao trabalho e ao lazer, para as presentes e futuras gerações.',
      'Gestão democrática por meio da participação da população e de associações representativas dos vários segmentos da comunidade na formulação, execução e acompanhamento de planos, programas e projetos de desenvolvimento urbano.',
      'Planejamento do desenvolvimento das cidades, da distribuição pontual da população e das atividades econômicas do Município e do território sob sua área de influência, de modo a evitar e corrigir as distorções do crescimento urbano e seus efeitos negativos sobre o meio ambiente.',
      'Integração e complementaridade entre as atividades urbanas e rurais, tendo em vista o desenvolvimento socioeconômico do Município e do território sob sua área de influência.',
      'Adoção de padrões de produção e consumo de bens e serviços e de expansão urbana compatíveis com os limites da sustentabilidade ambiental, social e econômica do Município e do território sob sua área de influência.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. O inciso IV do art. 2º da Lei 10.257/2001 estabelece o "planejamento do desenvolvimento das cidades, da distribuição ESPACIAL da população e das atividades econômicas do Município...", e não "distribuição pontual". A alteração do termo tornou a alternativa C incorreta (EXCETO).',
    ano: 2020,
    orgao: 'Prefeitura de Arapongas',
  },
  {
    id: 'fafipa_arapongas_2020_q16',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Arquiteto',
    disciplina: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
    assunto: '103_Zoneamento_e_Uso_do_Solo',
    artigo: 'Estatuto da Cidade (Lei 10.257/2001) - Art. 9º: Usucapião Especial Urbano',
    enunciado:
      'Complete as lacunas do texto da Lei denominada Estatuto da Cidade (Lei Federal nº 10.257/2001), sobre Usucapião Especial de Imóvel Urbano e assinale a alternativa CORRETA:\n\n' +
      '“Aquele que possuir como sua área ou edificação urbana de até ______________, por _______ anos, ininterruptamente e sem oposição, utilizando-a para sua moradia ou de sua família, adquirir-lhe-á o domínio, desde que não seja proprietário de outro imóvel urbano ou rural”.',
    alternativas: [
      '250 m² / 3.',
      '250 m² / 5.',
      '125 m² / 5.',
      '125 m² / 3.',
      '125 m² / 10.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B (250 m² / 5 anos). Conforme o art. 9º da Lei 10.257/2001 (e art. 183 da CF/88): "Aquele que possuir como sua área ou edificação urbana de até 250 m² (duzentos e cinquenta metros quadrados), por 5 (cinco) anos, ininterruptamente e sem oposição, utilizando-a para sua moradia ou de sua família, adquirir-lhe-á o domínio...".',
    ano: 2020,
    orgao: 'Prefeitura de Arapongas',
  },
  {
    id: 'fafipa_arapongas_2020_q17',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Arquiteto',
    disciplina: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
    assunto: '105_Licenciamento_Posturas_e_Parcelamento',
    artigo: 'Lei 6.766/1979 - Parcelamento do Solo Urbano: Conceito de Desmembramento',
    enunciado:
      'Tendo como referência a Lei Federal N.º 6.766/1979 que dispõe sobre o Parcelamento do Solo Urbano e dá outras Providências, assinale a alternativa CORRETA:',
    alternativas: [
      'Considera-se loteamento a divisão de gleba em lotes destinados a edificação, com abertura de novas vias de circulação, de logradouros públicos ou prolongamento, modificação ou ampliação das vias existentes e de fornecimento de toda a infraestrutura adequada.',
      'Considera-se desmembramento a subdivisão de gleba em lotes destinados a edificação, com aproveitamento do sistema viário existente, desde que não implique na abertura de novas vias e logradouros públicos, nem no prolongamento, modificação ou ampliação dos já existentes.',
      'Considera-se lote o terreno servido de toda infraestrutura necessária cujas dimensões atendam aos índices urbanísticos definidos pelo código de obras municipal ou lei municipal para a zona em que se situe.',
      'A infraestrutura básica dos parcelamentos é constituída pelos mobiliários urbanos de escoamento das águas pluviais, iluminação pública, esgotamento sanitário, abastecimento de água potável, energia elétrica pública e domiciliar e vias de circulação.',
      'O lote poderá ser constituído sob a forma de imóvel autônomo e de unidade imobiliária integrante de condomínio de lotes.',
    ],
    correta: 1, // B
    comentario:
      'Gabarito Oficial FAFIPA: B. O art. 2º, § 2º da Lei 6.766/1979 conceitua literalmente desmembramento como: "a subdivisão de gleba em lotes destinados a edificação, com aproveitamento do sistema viário existente, desde que não implique na abertura de novas vias e logradouros públicos, nem no prolongamento, modificação ou ampliação dos já existentes".',
    ano: 2020,
    orgao: 'Prefeitura de Arapongas',
  },
  {
    id: 'fafipa_arapongas_2020_q18',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Arquiteto',
    disciplina: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
    assunto: '105_Licenciamento_Posturas_e_Parcelamento',
    artigo: 'Lei 6.766/1979 - Requisitos Urbanísticos para Loteamentos e Dimensões Mínimas',
    enunciado:
      'Segundo a Lei Federal N.º 6.766/1979 que dispõe sobre o Parcelamento do Solo Urbano e dá outras Providências, os loteamentos deverão atender que as áreas destinadas a sistemas de circulação, a implantação de equipamento urbano e comunitário, bem como a espaços livres de uso público, serão proporcionais à densidade de ocupação prevista pelo plano diretor ou aprovada por lei municipal para a zona em que se situem e os lotes terão área mínima de:',
    alternativas: [
      '150 m² e frente mínima de 5 metros, salvo quando o loteamento se destinar a urbanização específica ou edificação de conjuntos habitacionais de interesse social, previamente aprovados pelos órgãos públicos competentes.',
      '125 m² e frente mínima de 6 metros, salvo quando o loteamento se destinar a urbanização específica ou edificação de conjuntos habitacionais de interesse social, previamente aprovados pelos órgãos públicos competentes.',
      '175 m² e frente mínima de 5,5 metros, salvo quando o loteamento se destinar a urbanização específica ou edificação de conjuntos habitacionais de interesse social, previamente aprovados pelos órgãos públicos competentes.',
      '150 m² e frente mínima de 6 metros, salvo quando o loteamento se destinar a urbanização específica ou edificação de conjuntos habitacionais de interesse social, previamente aprovados pelos órgãos públicos competentes.',
      '125 m² e frente mínima de 5 metros, salvo quando o loteamento se destinar a urbanização específica ou edificação de conjuntos habitacionais de interesse social, previamente aprovados pelos órgãos públicos competentes.',
    ],
    correta: 4, // E
    comentario:
      'Gabarito Oficial FAFIPA: E (125 m² e frente mínima de 5 metros). Conforme o art. 4º, inciso II da Lei 6.766/1979: "os lotes terão área mínima de 125 m² (cento e vinte e cinco metros quadrados) e frente mínima de 5 (cinco) metros, salvo quando o loteamento se destinar a urbanização específica ou edificação de conjuntos habitacionais de interesse social...".',
    ano: 2020,
    orgao: 'Prefeitura de Arapongas',
  },
  {
    id: 'fafipa_arapongas_2020_q22',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Arquiteto',
    disciplina: 'Bloco 1 — Legislação Municipal de Curitiba (resumos 01 a 05)',
    assunto: '105_Licenciamento_Posturas_e_Parcelamento',
    artigo: 'Passeios Públicos e Calçadas: Faixa Livre, de Serviço e de Acesso',
    enunciado:
      'Assinale a alternativa INCORRETA quanto ao dimensionamento mínimo das calçadas (passeio público):',
    alternativas: [
      'A faixa de serviço serve para acomodar o mobiliário, os canteiros, as árvores e os postes de iluminação ou sinalização. Nas calçadas a serem construídas, recomenda-se reservar uma faixa de serviço com largura mínima de 0,60 metros.',
      'A faixa livre ou passeio destina-se exclusivamente à circulação de pedestres, deve ser livre de qualquer obstáculo, ter inclinação transversal até 3 %, ser contínua entre lotes e ter no mínimo 1,20 metros de largura e 2,10 metros de altura livre.',
      'A faixa de acesso consiste no espaço de passagem da área pública para o lote. Esta faixa é possível apenas em calçadas com largura superior a 2,00 metros. Serve para acomodar a rampa de acesso aos lotes lindeiros sob autorização do município para edificações já construídas.',
      'O acesso de veículos aos lotes e seus espaços de circulação e estacionamento deve ser feito de forma a não interferir na faixa livre de circulação de pedestres, sem criar degraus ou desníveis. Nas faixas de serviço e de acesso é permitida a existência de rampas.',
      'As obras eventualmente existentes sobre o passeio devem ser convenientemente sinalizadas e isoladas, assegurando-se a largura mínima de 1,20 metros para circulação, garantindo-se as condições de acesso e segurança de pedestres e pessoas com mobilidade reduzida.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. Segundo as normas técnicas de calçadas e a NBR 9050, a faixa de serviço recomendada para acomodar postes, árvores e lixeiras possui largura mínima padrão de 0,70 m a 0,75 m (e não 0,60 m), o que torna a afirmativa A incorreta.',
    ano: 2020,
    orgao: 'Prefeitura de Arapongas',
  },

  // --- Acessibilidade NBR 9050 e Teoria da Edificação (Q19 a Q21, Q23) ---
  {
    id: 'fafipa_arapongas_2020_q19',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Arquiteto',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '526_Acessibilidade_Arquitetura_e_Desempenho',
    artigo: 'NBR 9050 - Acessibilidade a Edificações, Mobiliário e Espaços Urbanos: Foco de Pedestres',
    enunciado: 'Segundo as Normas de Acessibilidade (NBR 9050), foco de pedestres é:',
    alternativas: [
      'A indicação luminosa de permissão ou impedimento de locomoção na faixa apropriada.',
      'Qualquer elemento natural ou edificado que possa ser utilizado como referência de orientação direcional por todas as pessoas, especialmente as com deficiência visual.',
      'Qualquer dispositivo de comando, acionamento, comutação ou comunicação, como, por exemplo, telefones, intercomunicadores, interruptores, torneiras, registros, válvulas, botoeiras, painéis de comando, entre outros.',
      'O espaço sem obstáculos, destinado a garantir manobra, deslocamento e aproximação de todas as pessoas, para utilização de mobiliário ou elemento com autonomia e segurança.',
      'O elemento que possa interferir no fluxo de pedestres, como, por exemplo, mobiliário urbano, entradas de edificações junto ao alinhamento, vitrines junto ao alinhamento, vegetação, postes de sinalização, entre outros.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. Na terminologia da NBR 9050, "foco de pedestres" é definido como o elemento de sinalização luminosa de trânsito que indica aos pedestres a permissão (verde) ou impedimento (vermelho) de efetuar a travessia na faixa apropriada.',
    ano: 2020,
    orgao: 'Prefeitura de Arapongas',
  },
  {
    id: 'fafipa_arapongas_2020_q20',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Arquiteto',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '526_Acessibilidade_Arquitetura_e_Desempenho',
    artigo: 'NBR 9050 - Dimensões Referenciais e Módulo de Deslocamento com Muletas',
    enunciado:
      'Conforme os parâmetros referenciais antropométricos da Norma de Acessibilidade ABNT NBR 9050 para deslocamento de pessoas em pé, a dimensão de largura necessária para a locomoção de uma pessoa utilizando muletas canadenses ou bengalas é de:',
    alternativas: [
      '1,00 metro.',
      '1,10 metros.',
      '1,20 metros.',
      '1,30 metros.',
      '1,40 metros.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C (1,20 metros). A NBR 9050 estabelece a faixa de 1,20 m de largura referencial livre como dimensão necessária para permitir a projeção e o deslocamento seguro de uma pessoa com duas muletas ou apoiada em andador.',
    ano: 2020,
    orgao: 'Prefeitura de Arapongas',
  },
  {
    id: 'fafipa_arapongas_2020_q21',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Arquiteto',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '526_Acessibilidade_Arquitetura_e_Desempenho',
    artigo: 'NBR 9050 - Escadas, Degraus e Altura de Corrimãos Duplos',
    enunciado:
      'A Norma de Acessibilidade (ABNT NBR 9050) permite a instalação de apenas um corrimão duplo com duas alturas, a 0,92 metros e a 0,70 metros do piso, em escadas e degraus isolados, quando a largura for restrita, respeitando sempre a largura mínima de passagem de:',
    alternativas: [
      '1,10 metros em ambos os lados.',
      '1,30 metros em ambos os lados.',
      '1,50 metros em ambos os lados.',
      '1,20 metros em ambos os lados.',
      '1,05 metros em ambos os lados.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D (1,20 metros). A NBR 9050 define a largura mínima de circulação em escadas e rampas acessíveis coletivas como 1,20 metro com corrimãos instalados em ambas as laterais nas alturas padronizadas de 0,92 m e 0,70 m.',
    ano: 2020,
    orgao: 'Prefeitura de Arapongas',
  },
  {
    id: 'fafipa_arapongas_2020_q23',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Arquiteto',
    disciplina: 'Bloco 5 — Saneamento, Ambiente e Acessibilidade (resumos 23 a 26)',
    assunto: '526_Acessibilidade_Arquitetura_e_Desempenho',
    artigo: 'Teoria da Arquitetura e Intervenção Urbana: Conversão Funcional / Retrofit',
    enunciado: 'Na arquitetura e no urbanismo, a conversão funcional é conceituada como:',
    alternativas: [
      'O produto constituído por conjunto de edificações de usos variados, equipamentos urbanos, obras de infraestrutura e de serviços definidas e articuladas em conformidade com os princípios e as técnicas do urbanismo para, ao integrar a microrregião, desempenhar determinadas funções ambientais em níveis adequados.',
      'O período de execução física para materialização dos empreendimentos e projetos.',
      'A atividade que reúne as especialidades que contribuem para qualificação técnica dos projetos para a obra e operação dos objetos da construção.',
      'A atividade que reúne as especialidades necessárias à qualificação específica e otimização da operacionalização da edificação durante seu uso e operação.',
      'A recuperação e adaptação de edifício, monumento ou espaço urbano, habilitando-o para novas funções.',
    ],
    correta: 4, // E
    comentario:
      'Gabarito Oficial FAFIPA: E. A conversão funcional (ou retrofit / reutilização adaptativa) consiste na intervenção projetual que recupera, moderniza e adapta um edifício existente ou espaço urbano degradado, conferindo-lhe um novo uso e funções sociais contemporâneas.',
    ano: 2020,
    orgao: 'Prefeitura de Arapongas',
  },

  // --- Projetos, Orçamento, BDI e AutoCAD (Q24, Q25, Q27 a Q30) ---
  {
    id: 'fafipa_arapongas_2020_q24',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Arquiteto',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '207_Planejamento_da_Contratacao',
    artigo: 'Etapas e Fases de Projetos de Edificações: Projeto da Edificação',
    enunciado:
      'O plano geral para a construção de edificações representada pelo conjunto de estudos e desenhos constantes nos projetos arquitetônico e complementares da obra objeto de incorporação é o:',
    alternativas: [
      'Projeto completo de edificação.',
      'Projeto executivo arquitetônico.',
      'Projeto completo arquitetônico.',
      'Projeto da edificação.',
      'Projeto de reforma de edificação.',
    ],
    correta: 3, // D
    comentario:
      'Gabarito Oficial FAFIPA: D. Na terminologia da NBR 13531 e NBR 13532, o "Projeto da Edificação" compreende a totalidade integrada de projetos (arquitetura, estruturas, fundações, instalações hidrossanitárias, elétricas, especiais) que materializam o plano geral da obra.',
    ano: 2020,
    orgao: 'Prefeitura de Arapongas',
  },
  {
    id: 'fafipa_arapongas_2020_q25',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Arquiteto',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '207_Planejamento_da_Contratacao',
    artigo: 'NBR 13532: Concepção Arquitetônica da Edificação',
    enunciado:
      'O projeto de concepção arquitetônica da edificação abrange a determinação e a representação dos ambientes e seus compartimentos, seus elementos, componentes e materiais da edificação, com a sua organização, agenciamento, definição estética e ordenamento do espaço construído para uso humano ou representativo:',
    alternativas: [
      'De estereótipo funcional.',
      'De veia harmoniosa e prática.',
      'De cunho cultural ou monumental.',
      'De encaminhamento acessível a todos.',
      'De direcionamento ao uso coletivo.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C. O texto normativo da NBR 13532 define concepção arquitetônica como o arranjo físico e estético dos ambientes para atender ao uso humano funcional ou expressar significado representativo "de cunho cultural ou monumental".',
    ano: 2020,
    orgao: 'Prefeitura de Arapongas',
  },
  {
    id: 'fafipa_arapongas_2020_q27',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Arquiteto',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '207_Planejamento_da_Contratacao',
    artigo: 'Estudo Preliminar Arquitetônico (EP-ARQ) e Informações de Referência',
    enunciado:
      'O Estudo preliminar arquitetônico (EP-ARQ) deve conter as Informações de referência a serem utilizadas, conforme apontado na alternativa:',
    alternativas: [
      'Programa de necessidades de arquitetura (PN-ARQ); programas de necessidades obtidos pelas demais atividades técnicas (quando aplicável); levantamento topográfico e cadastral (LV-TOP); levantamento de dados para arquitetura (LV-ARQ); estudo de viabilidade de arquitetura (EV-ARQ) e outras informações.',
      'Levantamento de dados para arquitetura (LV-ARQ); programa de necessidades para arquitetura (PN-ARQ) e levantamento de dados obtidos pelas demais atividades técnicas das especialidades.',
      'Necessárias à concepção arquitetônica da edificação (ambiente construído ou artificial) e aos serviços de obra, como nome, número e dimensões (gabaritos, áreas úteis e construídas) dos ambientes de acordo com legislação vigentes e Normas Brasileiras vigentes; características funcionais ou das atividades em cada ambiente (ocupação, capacidade, movimentos, fluxos e períodos) e características, dimensões e serviços dos equipamentos e mobiliário; requisitos ambientais, níveis de desempenho.',
      'Programa geral de necessidades; instalações especiais (elétricas, mecânicas, hidráulicas e sanitárias e de segurança e acessibilidade); estudo de viabilidade de arquitetura (EV-ARQ) e outras informações.',
      'Programa geral de necessidades; levantamento de dados para a arquitetura (LV-ARQ); características, dimensões e serviços dos equipamentos e mobiliário; requisitos ambientais, níveis de desempenho; instalações especiais (elétricas, mecânicas, hidráulicas e sanitárias e de segurança e acessibilidade) e outras informações.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. Segundo a NBR 13532, os insumos de entrada (informações de referência) obrigatórios para a elaboração do Estudo Preliminar de Arquitetura (EP-ARQ) incluem o PN-ARQ, levantamento topográfico LV-TOP, levantamento cadastral LV-ARQ e o Estudo de Viabilidade EV-ARQ.',
    ano: 2020,
    orgao: 'Prefeitura de Arapongas',
  },
  {
    id: 'fafipa_arapongas_2020_q28',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Arquiteto',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '210_Orcamento_Medicao_e_BIM',
    artigo: 'Orçamento de Obras: Custos Diretos e BDI no Preço Final Estimado da Obra',
    enunciado:
      'Os custos diretos e a taxa de Benefício e Despesas Indiretas (BDI), a qual engloba os custos indiretos e o lucro, compõem o preço:',
    alternativas: [
      'Final de venda da obra.',
      'Estimado de custo da obra.',
      'Estimado de investimento da obra.',
      'Variável final da obra.',
      'Final estimado para a obra.',
    ],
    correta: 4, // E
    comentario:
      'Gabarito Oficial FAFIPA: E (Final estimado para a obra). Na composição orçamentária para licitações e contratações públicas, o somatório dos custos diretos (materiais, mão de obra, equipamentos) acrescido da taxa percentual de BDI (administração central, tributos, riscos, seguros e lucro) resulta no Preço Final Estimado para a Obra.',
    ano: 2020,
    orgao: 'Prefeitura de Arapongas',
  },
  {
    id: 'fafipa_arapongas_2020_q29',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Arquiteto',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '207_Planejamento_da_Contratacao',
    artigo: 'Projeto Básico: Elementos Obrigatórios e Cronograma Físico-Financeiro',
    enunciado: 'Na composição do projeto básico, deve constar também:',
    alternativas: [
      'O cronograma físico-financeiro com as despesas mensais previstas para serem incorridas ao longo da execução da obra ou serviço.',
      'Os projetos da obra, incluído os complementares e planilha de custos.',
      'O cronograma físico-financeiro com planilha de custos completa incluído BDI.',
      'Orçamento da obra total com índices arquitetônicos preenchidos.',
      'Os projetos da obra com índices arquitetônicos preenchidos.',
    ],
    correta: 0, // A
    comentario:
      'Gabarito Oficial FAFIPA: A. De acordo com as leis de contratações públicas e diretrizes do IBRAOP, o Projeto Básico deve contemplar expressamente o cronograma físico-financeiro discriminando as despesas e desembolsos mensais previstos ao longo da execução do contrato.',
    ano: 2020,
    orgao: 'Prefeitura de Arapongas',
  },
  {
    id: 'fafipa_arapongas_2020_q30',
    banca: 'Fundação FAFIPA (Prova Real)',
    cargo: 'Arquiteto',
    disciplina: 'Bloco 2 — Licitações, Planejamento e Orçamento (resumos 06 a 10)',
    assunto: '210_Orcamento_Medicao_e_BIM',
    artigo: 'Ferramentas de Desenho Técnico e Modelagem Computacional: Comando FILLET no AutoCAD',
    enunciado:
      'O comando do software de desenho eletrônico AutoCAD que permite o encontro de duas linhas com um arco tangente às duas linhas é o comando:',
    alternativas: [
      'CHAMFER.',
      'BREAK.',
      'FILLET.',
      'TRIM.',
      'EXTEND.',
    ],
    correta: 2, // C
    comentario:
      'Gabarito Oficial FAFIPA: C (FILLET). O comando FILLET no AutoCAD realiza o arredondamento (concordância) das extremidades de dois objetos com um arco tangente de raio especificado (Radius). O comando CHAMFER cria um chanfro reto; TRIM apara; e BREAK quebra a linha.',
    ano: 2020,
    orgao: 'Prefeitura de Arapongas',
  },
];

export const SESSAO_ARAPONGAS_2020: SessaoCriada = {
  id: 'prv_2020_fafipa_arapongas_arquiteto',
  codigo: 'FAFIPA-2020-ARAPONGAS-ARQUITETO',
  dataHora: '09/02/2020 08:30',
  banca: 'Fundação FAFIPA (Prova Real)',
  cargo: 'Arquiteto',
  disciplina: '2020, Fundação FAFIPA, Prefeitura de Arapongas',
  assunto: 'FAFIPA 2020 - Prefeitura de Arapongas - Arquiteto',
  quantidade: QUESTOES_ARAPONGAS_2020.length, // 21
  questaoIds: QUESTOES_ARAPONGAS_2020.map((q) => q.id),
  questoesSnap: QUESTOES_ARAPONGAS_2020,
  tipo: 'prova_anterior',
  tempoSegundos: 0,
  concluida: false,
  ano: 2020,
  orgao: 'Prefeitura de Arapongas',
  created_at: new Date(2020, 1, 9, 8, 30).toISOString(),
};

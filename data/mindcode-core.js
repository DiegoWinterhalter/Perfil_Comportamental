/* ============================================================
   MINDCODE CORE — Base de dados (V1)
   ------------------------------------------------------------
   Camada de CONTEÚDO, separada da lógica.
   Nenhuma função de cálculo aqui — só dados estruturados.
   Carregado no site via <script src="data/mindcode-core.js"></script>
   antes dos arquivos de lógica.

   Fonte: "MINDCODE — Projeto Completo para Implementação" (briefing V1).
   Próximas etapas leem este objeto; nunca escrevem texto solto no código.
   ============================================================ */

const MINDCODE_CORE = {

  version: 'core-1.0',

  /* ---------------- MARCA ---------------- */
  brand: {
    name: 'MINDCODE',
    signature: 'Seu código de comportamento, decisão e performance',
    author: 'Diego Winterhalter'
  },

  /* ---------------- AVISOS METODOLÓGICOS ---------------- */
  meta: {
    disclaimer:
      'O MINDCODE é uma ferramenta comportamental aplicada, baseada em ' +
      'autorrelato. Não é diagnóstico psicológico nem instrumento clínico. ' +
      'O resultado é uma hipótese interpretativa e depende do momento, do ' +
      'contexto e da autopercepção de quem responde. Nenhum perfil é melhor ' +
      'que outro; o método serve ao desenvolvimento, não ao rótulo.',
    iecrNote:
      'O IECR é uma estimativa comportamental do esforço de adaptação entre ' +
      'perfis diferentes. Não mede consumo energético cerebral nem atividade ' +
      'neural — indica diferenças de ritmo, linguagem, controle e decisão.'
  },

  /* ---------------- REGRAS DE PONTUAÇÃO ---------------- */
  /* Apenas os parâmetros. A lógica que os aplica fica no engine (Etapa 2). */
  scoringRules: {
    responseValue: 5,        // cada resposta vale 5% (20 perguntas)
    totalQuestions: 20,
    classification: [
      { min: 0,  max: 15,  label: 'Baixa expressão',     note: 'Menor preferência natural por esse padrão.' },
      { min: 20, max: 30,  label: 'Expressão moderada',  note: 'Perfil presente, mas não central.' },
      { min: 35, max: 45,  label: 'Alta expressão',      note: 'Tendência relevante e frequente.' },
      { min: 50, max: 100, label: 'Predominância forte', note: 'Perfil central no padrão comportamental atual.' }
    ],
    dominanceThreshold:   55, // dominante >= 55%  -> flag HIGH_INTENSITY
    balancedDifference:    5, // gap 1º-2º <= 5pp  -> flag BALANCED
    distributedMax:       35, // dominante <= 35%  -> candidato a DISTRIBUTED
    distributedSpread:    10, // ... E gap 1º-3º <= 10pp -> confirma DISTRIBUTED
    lowExpressionMax:     10, // perfil <= 10%      -> flag LOW_EXPRESSION
    highFrictionThreshold:75  // IECR do par dom+sec >= 75 -> flag HIGH_FRICTION_PAIR
  },

  /* Mapa alternativa -> arquétipo (regra oficial do briefing) */
  answerMap: { A: 'pavao', B: 'cachorro', C: 'macaco', D: 'leao' },

  /* ---------------- OS 4 ARQUÉTIPOS ---------------- */
  /* color: ajustável — paleta MINDCODE (cobre/grafite + cor por perfil). */
  profiles: {

    leao: {
      key: 'leao',
      name: 'Leão',
      title: 'O Conquistador',
      nucleus: 'Resultado',
      color: '#B08A57',
      definition: 'Alta orientação à ação, autonomia, velocidade decisória e eficácia prática.',
      essence:
        'O Leão opera por resultado. Decide enquanto outros ainda avaliam, ' +
        'age enquanto outros analisam e move as coisas para frente mesmo sem ' +
        'todas as respostas. Sua presença dá direção ao ambiente.',
      strengths: [
        'Liderança natural e iniciativa',
        'Decisão rápida sob pressão',
        'Foco implacável em metas e prazos',
        'Coragem para assumir riscos calculados',
        'Capacidade de destravar e mover projetos'
      ],
      attention: [
        'Imposição e baixa tolerância ao contraditório',
        'Impaciência com ritmos mais lentos',
        'Atropela emoções alheias em nome do objetivo',
        'Dificuldade de ouvir antes de decidir',
        'Confunde urgência sentida com prioridade real'
      ],
      riskCore: 'Imposição, impaciência e baixa escuta.',
      communication: {
        seek:  'Objetivo, ganho concreto e espaço para decidir.',
        avoid: 'Rodeio, insegurança e excesso de detalhe.'
      },
      phrase: 'Sua força te leva longe; sua escuta define quem segue caminhando com você.'
    },

    pavao: {
      key: 'pavao',
      name: 'Pavão',
      title: 'O Visionário',
      nucleus: 'Expressão',
      color: '#7A8FA3',
      definition: 'Alta expressividade, novidade, criatividade, reconhecimento e influência social.',
      essence:
        'O Pavão opera por expressão. Enxerga conexões que outros não veem, ' +
        'transforma ideias em narrativa e faz as pessoas se interessarem pelo ' +
        'que propõe. Sua energia atrai e gera movimento.',
      strengths: [
        'Criatividade aplicada e soluções não óbvias',
        'Conexão social rápida e genuína',
        'Comunicação que mobiliza e inspira',
        'Entusiasmo que contagia equipes',
        'Visão de futuro e leitura de tendências'
      ],
      attention: [
        'Dispersão e dificuldade de concluir',
        'Busca excessiva de validação e reconhecimento',
        'Tendência a prometer mais do que entrega',
        'Impaciência com rotina e detalhe',
        'Decisão guiada por empolgação'
      ],
      riskCore: 'Dispersão, busca excessiva de validação e prometer demais.',
      communication: {
        seek:  'Energia, novidade e reconhecimento.',
        avoid: 'Frieza, burocracia e corte de entusiasmo.'
      },
      phrase: 'Sua energia abre portas; sua consistência decide o que permanece aberto.'
    },

    macaco: {
      key: 'macaco',
      name: 'Macaco',
      title: 'O Estrategista',
      nucleus: 'Controle',
      color: '#6F8A87',
      definition: 'Alta análise, coerência, previsibilidade, comparação e redução de risco.',
      essence:
        'O Macaco opera por controle. Analisa em profundidade, antecipa ' +
        'cenários e garante qualidade antes de avançar. Onde há improviso, ' +
        'ele traz estrutura.',
      strengths: [
        'Análise profunda e pensamento crítico',
        'Antecipação de riscos e cenários',
        'Padrão alto de qualidade e precisão',
        'Coerência entre o que diz e o que faz',
        'Decisão fundamentada em dados'
      ],
      attention: [
        'Paralisia analítica e excesso de cautela',
        'Rigidez diante de mudança',
        'Crítica que soa como desvalorização',
        'Demora para decidir em contexto incerto',
        'Dificuldade de agir sem todas as informações'
      ],
      riskCore: 'Paralisia analítica, rigidez e excesso de crítica.',
      communication: {
        seek:  'Lógica, prova e previsibilidade.',
        avoid: 'Improviso, pressão sem base e promessa vaga.'
      },
      phrase: 'Sua análise protege a decisão; o momento certo de agir também faz parte da análise.'
    },

    cachorro: {
      key: 'cachorro',
      name: 'Cachorro',
      title: 'O Guardião do Vínculo',
      nucleus: 'Vínculo',
      color: '#B07C5A',
      definition: 'Alta orientação relacional, confiança, cooperação, cuidado e segurança emocional.',
      essence:
        'O Cachorro opera por vínculo. Lê emoção, sustenta confiança e ' +
        'constrói relações que se mantêm no tempo. É quem garante que ' +
        'ninguém fique para trás.',
      strengths: [
        'Escuta genuína e leitura emocional',
        'Construção de confiança duradoura',
        'Cooperação e espírito de equipe',
        'Lealdade e consistência relacional',
        'Cuidado que cria ambientes seguros'
      ],
      attention: [
        'Autoabandono em favor do outro',
        'Dificuldade de dizer não',
        'Evita conflito mesmo quando necessário',
        'Leva críticas para o lado pessoal',
        'Decisão travada por medo de desapontar'
      ],
      riskCore: 'Autoabandono, dificuldade de dizer não e evitar conflito.',
      communication: {
        seek:  'Acolhimento, segurança e vínculo.',
        avoid: 'Agressividade, indiferença e humilhação.'
      },
      phrase: 'Seu cuidado sustenta as pessoas; cuidar de si é o que sustenta o seu cuidado.'
    }
  },

  /* ---------------- CONTEÚDO APLICADO POR PERFIL ----------------
     Blocos densos consumidos pelo Relatório Completo.
     Um conjunto por arquétipo: emocional, comunicação (agrada/irrita),
     trabalho (líder/liderado/parceiro), compra, venda, negociação e
     plano de desenvolvimento.
     Quando as Partes 1-3 do Core forem incorporadas, estes textos
     podem ser substituídos pela versão estendida — sem mudar a chave.
     --------------------------------------------------------------- */
  applied: {

    leao: {
      emotional:
        'O Leão sente a emoção como combustível de ação. A frustração vira ' +
        'pressa, a contrariedade vira firmeza e a vitória renova a energia. ' +
        'Tende a processar pouco internamente e a agir cedo — o que protege ' +
        'da paralisia, mas pode passar por cima do próprio cansaço e do tempo ' +
        'emocional das outras pessoas. Aprende muito quando dá nome ao que ' +
        'sente antes de transformar tudo em tarefa.',
      pleases: [
        'Objetividade e clareza no que se espera dele',
        'Liberdade para decidir e executar do seu jeito',
        'Ambientes que valorizam resultado e progresso',
        'Pessoas preparadas, que respeitam o tempo dele'
      ],
      annoys: [
        'Rodeio, reuniões longas e conversa sem conclusão',
        'Controle excessivo sobre o método dele',
        'Indecisão e falta de posicionamento',
        'Promessas que não se cumprem'
      ],
      work: {
        asLeader:  'Lidera puxando ritmo e dando direção. É rápido para decidir e cobrar, e protege a entrega — precisa cuidar para não centralizar nem atropelar quem pensa diferente.',
        asLed:     'Funciona melhor com metas claras e autonomia. Trava sob microgerenciamento; rende quando confiam nele e medem por resultado.',
        asPartner: 'É o parceiro que destrava e move. Traz energia de execução, mas precisa de alguém que segure o detalhe e o ritmo das pessoas.'
      },
      buys:
        'Decide rápido quando enxerga vantagem clara. Quer ir direto ao ' +
        'ponto: o que resolve, quanto custa, qual o ganho. Excesso de etapa ' +
        'e de explicação esfria a compra.',
      sells:
        'Vende com firmeza e foco em resultado. Conduz para o fechamento e ' +
        'transmite segurança — o risco é apressar o cliente e falar mais do ' +
        'que escuta. Ganha quando faz perguntas antes de propor.',
      negotiates:
        'Negocia de forma direta e competitiva, gosta de fechar. Tende a ' +
        'querer ganhar a queda de braço — avança mais quando troca disputa ' +
        'por objetivo comum.',
      development: [
        'Ouvir até o fim antes de decidir ou responder',
        'Dar tempo e espaço ao ritmo de quem é mais analítico ou relacional',
        'Separar urgência sentida de prioridade real',
        'Reconhecer o esforço das pessoas, não só o resultado'
      ]
    },

    pavao: {
      emotional:
        'O Pavão sente intensamente e expressa com facilidade. A emoção ' +
        'aparece na comunicação, no entusiasmo e também na oscilação: ' +
        'empolga rápido e desanima rápido. Reconhecimento o energiza; a ' +
        'sensação de ser ignorado o esvazia. Cresce quando aprende a ' +
        'sustentar a motivação a partir de dentro, sem depender da plateia.',
      pleases: [
        'Reconhecimento sincero pelo que faz e por quem é',
        'Espaço para criar, propor e inovar',
        'Ambientes leves, dinâmicos e com pessoas',
        'Variedade e novos desafios'
      ],
      annoys: [
        'Frieza, burocracia e rotina rígida',
        'Ser cortado ou ignorado quando se expressa',
        'Excesso de regras sem sentido aparente',
        'Ambientes sem energia e sem troca humana'
      ],
      work: {
        asLeader:  'Lidera inspirando e comunicando visão. Mobiliza pelo entusiasmo — precisa cuidar da constância, do acompanhamento e de não prometer além do que a equipe entrega.',
        asLed:     'Rende com reconhecimento e liberdade criativa. Murcha em ambiente cinza; precisa de retorno frequente e de sentir que sua contribuição é vista.',
        asPartner: 'É o parceiro que traz ideia, narrativa e energia. Precisa de alguém que ajude a fechar e a transformar empolgação em entrega.'
      },
      buys:
        'Compra pela visão e pela experiência. Analisa possibilidades, ' +
        'gosta do novo e do que tem história. Conecta-se com quem comunica ' +
        'com energia — desanima com frieza e processo arrastado.',
      sells:
        'Vende encantando e contando história. Cria desejo e clima, é ' +
        'caloroso e criativo — o risco é prometer demais e perder o detalhe. ' +
        'Ganha quando ancora o entusiasmo em fatos e cumpre o combinado.',
      negotiates:
        'Negocia pela relação e pelo clima, busca o ganha-ganha simpático. ' +
        'Pode ceder cedo para manter a simpatia — avança quando sustenta o ' +
        'valor com tranquilidade.',
      development: [
        'Concluir o que começa antes de abrir uma nova frente',
        'Ancorar promessas e propostas em dados concretos',
        'Construir motivação interna, menos dependente de aplauso',
        'Dar atenção ao detalhe e ao acompanhamento'
      ]
    },

    macaco: {
      emotional:
        'O Macaco sente de forma contida e processa por dentro. Prefere ' +
        'entender a emoção a expressá-la, e busca controle como forma de ' +
        'segurança. Isso traz estabilidade, mas pode acumular tensão ' +
        'silenciosa e adiar conversas. Evolui quando percebe que nomear o ' +
        'que sente também é uma forma de organizar — não uma perda de ' +
        'controle.',
      pleases: [
        'Clareza de regras, critérios e expectativas',
        'Tempo para analisar antes de decidir',
        'Ambientes organizados e previsíveis',
        'Trabalho bem feito e reconhecido pela qualidade'
      ],
      annoys: [
        'Improviso e mudança de última hora',
        'Pressão para decidir sem informação suficiente',
        'Promessas vagas e falta de consistência',
        'Desorganização e retrabalho'
      ],
      work: {
        asLeader:  'Lidera pela estrutura e pelo exemplo de consistência. Garante qualidade e processo — precisa cuidar para não travar a equipe com excesso de exigência ou de análise.',
        asLed:     'Rende com clareza, previsibilidade e tempo para fazer bem feito. Sofre com pressa e ambiguidade; entrega padrão alto quando confiam no método dele.',
        asPartner: 'É o parceiro que traz rigor e segurança. Precisa de alguém que ajude a acelerar e a decidir quando a informação nunca é 100%.'
      },
      buys:
        'Compra com análise. Examina cada detalhe, compara, pesquisa e ' +
        'evita surpresa. Quer prova, consistência e previsibilidade — ' +
        'pressão e improviso afastam.',
      sells:
        'Vende com consistência e domínio técnico. Transmite confiança pela ' +
        'preparação e pela coerência — o risco é afogar o cliente em detalhe ' +
        'e demorar a conduzir. Ganha quando traduz a análise em decisão simples.',
      negotiates:
        'Negocia com critério e preparação, ancorado em dados. Tende a ' +
        'travar diante do imprevisto — avança quando define de antemão sua ' +
        'margem e seu limite.',
      development: [
        'Definir o ponto de "informação suficiente" e decidir',
        'Flexibilizar diante do imprevisto e da mudança',
        'Trazer a crítica com mais empatia e menos dureza técnica',
        'Expor o que incomoda antes que a tensão acumule'
      ]
    },

    cachorro: {
      emotional:
        'O Cachorro sente pelo vínculo. A emoção das pessoas ao redor o ' +
        'afeta diretamente, e a harmonia do ambiente pesa no seu próprio ' +
        'estado. É leal, acolhedor e atento — mas pode se abandonar para ' +
        'cuidar dos outros e levar o conflito para o lado pessoal. Cresce ' +
        'quando entende que cuidar de si não é egoísmo: é o que sustenta o ' +
        'cuidado com os outros.',
      pleases: [
        'Ambientes de confiança, respeito e cooperação',
        'Sentir que pertence e que é valorizado como pessoa',
        'Relações estáveis e combinados cumpridos',
        'Poder ajudar e contribuir com o grupo'
      ],
      annoys: [
        'Agressividade, grosseria e clima hostil',
        'Indiferença e frieza nas relações',
        'Conflito aberto e disputa constante',
        'Sentir-se usado ou desvalorizado'
      ],
      work: {
        asLeader:  'Lidera pelo cuidado e pela confiança, constrói times unidos. Precisa desenvolver firmeza: cobrar, dar retorno difícil e tomar decisões impopulares sem se sentir culpado.',
        asLed:     'Rende em ambientes de respeito e segurança emocional. Sofre com hostilidade e instabilidade; é leal e consistente quando se sente parte.',
        asPartner: 'É o parceiro que sustenta o vínculo e o clima. Precisa de alguém que o ajude a se posicionar e a não absorver o que não é dele.'
      },
      buys:
        'Compra pela confiança e pela relação. Busca indicação de quem ' +
        'conhece, quer se sentir seguro e bem atendido. Decide com calma — ' +
        'pressão e frieza quebram a conexão.',
      sells:
        'Vende construindo relação e confiança. Escuta de verdade e cria ' +
        'vínculo — o risco é evitar conduzir para o fechamento e ter ' +
        'dificuldade de defender o preço. Ganha quando une cuidado e firmeza.',
      negotiates:
        'Negocia buscando acordo bom para todos e preservando a relação. ' +
        'Tende a ceder para evitar o atrito — avança quando entende que ' +
        'sustentar valor também é respeito por si.',
      development: [
        'Praticar dizer não e sustentar limites com tranquilidade',
        'Encarar conversas difíceis em vez de adiá-las',
        'Não levar crítica e conflito para o lado pessoal',
        'Cuidar das próprias necessidades, não só das dos outros'
      ]
    }
  },

  /* ---------------- 12 COMBINAÇÕES HÍBRIDAS ---------------- */
  /* Chave = dominante+secundário (ordem importa: leao+pavao != pavao+leao). */
  hybrids: {
    'leao+pavao': {
      name: 'Líder Magnético',
      essence: 'Resultado com presença, influência e carisma.',
      potential: 'Liderança inspiradora, vendas, palco, negociação e construção de marca pessoal.',
      risk: 'Impulsividade, excesso de exposição, baixa paciência com detalhes e busca de reconhecimento.',
      phrase: 'Você mobiliza salas; a constância é o que transforma impacto em autoridade.',
      development: 'Sustentar consistência, ouvir mais, planejar antes de agir e separar confiança de vaidade.'
    },
    'leao+macaco': {
      name: 'Executor Estratégico',
      essence: 'Ação com estrutura, lógica e controle.',
      potential: 'Execução de alto padrão, gestão de operações e decisões complexas com risco controlado.',
      risk: 'Rigidez sob pressão, frieza com pessoas e impaciência com quem não acompanha o ritmo.',
      phrase: 'Você entrega com precisão; lembrar do humano é o que torna a entrega sustentável.',
      development: 'Flexibilizar diante do imprevisto, comunicar com mais calor e delegar sem microgerenciar.'
    },
    'leao+cachorro': {
      name: 'Protetor Forte',
      essence: 'Firmeza com cuidado, lealdade e senso de proteção.',
      potential: 'Liderança que protege a equipe, gestão de pessoas com firmeza e ambientes de confiança.',
      risk: 'Oscilar entre dureza e culpa, assumir cargas dos outros e dificuldade de ser firme sem se sentir mal.',
      phrase: 'Sua firmeza protege; sua escuta é o que faz a proteção ser aceita.',
      development: 'Separar firmeza de agressividade, definir limites claros e evitar carregar o que é do outro.'
    },
    'pavao+leao': {
      name: 'Influenciador de Impacto',
      essence: 'Expressão, criatividade, ousadia e ambição.',
      potential: 'Vendas de alto impacto, lançamentos, posicionamento de marca e mobilização de público.',
      risk: 'Prometer além da entrega, dispersão entre projetos e decisão movida por empolgação.',
      phrase: 'Você cria desejo; a entrega no prazo é o que converte desejo em reputação.',
      development: 'Concluir antes de iniciar o próximo, ancorar promessas em dados e medir resultado, não só alcance.'
    },
    'pavao+macaco': {
      name: 'Criativo Estruturado',
      essence: 'Originalidade com análise e refinamento.',
      potential: 'Criação com método, conteúdo de qualidade e projetos inovadores bem fundamentados.',
      risk: 'Tensão entre soltar e controlar, autocrítica que trava e perfeccionismo na entrega.',
      phrase: 'Sua ideia ganha forma na estrutura; publicar imperfeito ainda é melhor que reter perfeito.',
      development: 'Definir prazos para fechar, aceitar versões boas o suficiente e proteger a fase criativa do julgamento.'
    },
    'pavao+cachorro': {
      name: 'Conector Afetivo',
      essence: 'Comunicação, calor humano, empatia e experiência.',
      potential: 'Relacionamento com clientes, experiência, comunidade e vendas consultivas baseadas em confiança.',
      risk: 'Evitar conversas difíceis, depender de aprovação e dificuldade de cobrar ou negociar valor.',
      phrase: 'Você aproxima pessoas; nomear o que é difícil é o que mantém a relação honesta.',
      development: 'Praticar conversas francas, sustentar preço e separar ser querido de ser respeitado.'
    },
    'macaco+leao': {
      name: 'Estrategista de Resultado',
      essence: 'Análise criteriosa com ambição e execução.',
      potential: 'Planejamento que vira execução, decisões de risco calculado e liderança técnica.',
      risk: 'Demora para decidir, exigência alta consigo e com o time e baixa tolerância ao erro.',
      phrase: 'Sua análise mira o alvo; agir antes da certeza total também é estratégia.',
      development: 'Definir o ponto de "informação suficiente", decidir com prazo e aliviar a cobrança sobre o time.'
    },
    'macaco+pavao': {
      name: 'Inventor Analítico',
      essence: 'Investigação, criatividade e pensamento original.',
      potential: 'Solução de problemas complexos, inovação fundamentada e pesquisa aplicada.',
      risk: 'Análise sem conclusão, dispersão entre ideias e dificuldade de transformar estudo em entrega.',
      phrase: 'Você investiga fundo; escolher uma direção é o que transforma estudo em resultado.',
      development: 'Fechar ciclos, priorizar uma frente por vez e definir o que conta como "pronto".'
    },
    'macaco+cachorro': {
      name: 'Guardião Cuidadoso',
      essence: 'Responsabilidade, precisão e cuidado humano.',
      potential: 'Processos confiáveis, suporte de qualidade e ambientes organizados e seguros.',
      risk: 'Excesso de zelo, dificuldade de delegar e tendência a absorver tensão silenciosamente.',
      phrase: 'Seu cuidado garante o padrão; pedir ajuda também é parte de cuidar bem.',
      development: 'Delegar com confiança, expor o que incomoda e flexibilizar diante do imprevisto.'
    },
    'cachorro+leao': {
      name: 'Defensor Leal',
      essence: 'Empatia com firmeza quando há ameaça ao vínculo.',
      potential: 'Defesa da equipe, mediação com posição clara e liderança protetora.',
      risk: 'Oscilar entre evitar conflito e reagir forte demais quando o vínculo é ameaçado.',
      phrase: 'Você protege quem é seu; firmeza constante evita a explosão acumulada.',
      development: 'Trazer limites cedo, regular a reação sob ameaça e dosar firmeza no dia a dia.'
    },
    'cachorro+pavao': {
      name: 'Acolhedor Expressivo',
      essence: 'Afeto, sociabilidade, pertencimento e leveza.',
      potential: 'Construção de comunidade, hospitalidade, clima de equipe e relação calorosa com clientes.',
      risk: 'Dependência de aprovação, dificuldade de dizer não e fuga de assuntos pesados.',
      phrase: 'Você cria pertencimento; sustentar o difícil é o que torna o acolhimento confiável.',
      development: 'Praticar o não, encarar conversas adiadas e separar harmonia de evitação.'
    },
    'cachorro+macaco': {
      name: 'Cuidador Estruturado',
      essence: 'Cuidado com organização, segurança e consistência.',
      potential: 'Suporte organizado, processos humanos e ambientes previsíveis e seguros.',
      risk: 'Rigidez no cuidado, autocobrança e dificuldade de lidar com mudança ou conflito.',
      phrase: 'Sua consistência gera segurança; flexibilidade evita que o cuidado vire controle.',
      development: 'Aceitar o imprevisto, soltar o controle aos poucos e expor as próprias necessidades.'
    }
  },

  /* ---------------- MATRIZ IECR ---------------- */
  /* Esforço de adaptação por par. value 0-100. Matriz simétrica. */
  iecrMatrix: {
    'leao+leao':         { value: 65, level: 'Alto moderado',  orientation: 'Evitar disputa de controle.' },
    'leao+pavao':        { value: 50, level: 'Médio',          orientation: 'Preservar energia e trazer foco.' },
    'leao+macaco':       { value: 75, level: 'Alto',           orientation: 'Equilibrar velocidade e análise.' },
    'leao+cachorro':     { value: 80, level: 'Alto',           orientation: 'Suavizar o tom e criar segurança.' },
    'pavao+leao':        { value: 50, level: 'Médio',          orientation: 'Preservar energia e trazer foco.' },
    'pavao+pavao':       { value: 35, level: 'Baixo/moderado', orientation: 'Evitar dispersão e falta de execução.' },
    'pavao+macaco':      { value: 75, level: 'Alto',           orientation: 'Conciliar improviso e estrutura.' },
    'pavao+cachorro':    { value: 30, level: 'Baixo',          orientation: 'Cuidar da dependência e do excesso emocional.' },
    'macaco+leao':       { value: 75, level: 'Alto',           orientation: 'Equilibrar velocidade e análise.' },
    'macaco+pavao':      { value: 75, level: 'Alto',           orientation: 'Conciliar improviso e estrutura.' },
    'macaco+macaco':     { value: 35, level: 'Baixo/moderado', orientation: 'Evitar análise excessiva.' },
    'macaco+cachorro':   { value: 55, level: 'Médio',          orientation: 'Traduzir crítica técnica com empatia.' },
    'cachorro+leao':     { value: 80, level: 'Alto',           orientation: 'Suavizar o tom e criar segurança.' },
    'cachorro+pavao':    { value: 30, level: 'Baixo',          orientation: 'Cuidar da dependência e do excesso emocional.' },
    'cachorro+macaco':   { value: 55, level: 'Médio',          orientation: 'Traduzir crítica técnica com empatia.' },
    'cachorro+cachorro': { value: 25, level: 'Baixo',          orientation: 'Evitar falta de assertividade.' }
  },

  /* ---------------- PERFIS ESPECIAIS ---------------- */
  /* Blocos que entram quando o resultado não cai num dominante claro. */
  specialProfiles: {
    highIntensity: {
      name: 'Alta Intensidade',
      trigger: 'Perfil dominante igual ou acima de 55%.',
      text:
        'O perfil dominante aparece com força acentuada. Isso traz clareza ' +
        'de identidade e potência de ação, mas também concentra os riscos ' +
        'desse arquétipo. Quanto mais intenso o padrão, mais importante a ' +
        'autorregulação consciente.'
    },
    balanced: {
      name: 'Perfil Equilibrado',
      trigger: 'Diferença entre 1º e 2º perfil de até 5 pontos percentuais.',
      text:
        'Dois perfis aparecem praticamente lado a lado. Em vez de um ' +
        'dominante único, você opera por uma combinação ativa, alternando ' +
        'padrões conforme o contexto — versatilidade que funciona melhor ' +
        'quando há clareza sobre qual modo usar em cada situação.'
    },
    distributed: {
      name: 'Perfil Distribuído',
      trigger: 'Nenhum perfil acima de 35%.',
      text:
        'Os quatro perfis aparecem de forma relativamente equilibrada, sem ' +
        'um padrão central forte. Indica adaptabilidade e leitura ampla de ' +
        'contextos, mas pode trazer sensação de identidade comportamental ' +
        'pouco definida. O desenvolvimento passa por reconhecer qual perfil ' +
        'ativar conscientemente em cada cenário.'
    },
    lowExpression: {
      leao:     'Baixa expressão do Leão pode indicar menor naturalidade para impor ritmo, decidir rápido e assumir a frente. Em contextos que exigem direção e firmeza, vale desenvolver esse acionamento de forma consciente.',
      pavao:    'Baixa expressão do Pavão pode indicar menor naturalidade para se expor, comunicar com energia e buscar visibilidade. Em contextos que exigem influência e narrativa, vale treinar esse repertório.',
      macaco:   'Baixa expressão do Macaco pode indicar menor naturalidade para análise detalhada, planejamento e cautela. Em decisões de risco, vale incorporar mais estrutura antes de agir.',
      cachorro: 'Baixa expressão do Cachorro pode indicar menor naturalidade para leitura emocional, escuta e cuidado relacional. Em contextos de equipe e vínculo, vale desenvolver essa sensibilidade.'
    }
  },

  /* ---------------- QUESTIONÁRIO OFICIAL V1 ---------------- */
  /* 20 perguntas. A=pavao, B=cachorro, C=macaco, D=leao. */
  questionnaire: [
    { id: 1, text: 'Sempre busco ser...', options: {
      A: { profile: 'pavao',    text: 'Inovador, criativo e visionário' },
      B: { profile: 'cachorro', text: 'Divertido, amigo e benéfico' },
      C: { profile: 'macaco',   text: 'Responsável, meticuloso e previsível' },
      D: { profile: 'leao',     text: 'Focado, determinado e persistente' } } },
    { id: 2, text: 'Em uma viagem quero...', options: {
      A: { profile: 'pavao',    text: 'Explorar novos lugares' },
      B: { profile: 'cachorro', text: 'Conversar com os passageiros' },
      C: { profile: 'macaco',   text: 'Planejar a viagem' },
      D: { profile: 'leao',     text: 'Ser o capitão' } } },
    { id: 3, text: 'Se você quiser se dar bem comigo...', options: {
      A: { profile: 'pavao',    text: 'Me dê liberdade' },
      B: { profile: 'cachorro', text: 'Seja amigável, carinhoso e compreensivo' },
      C: { profile: 'macaco',   text: 'Não descumpra o que combinar comigo' },
      D: { profile: 'leao',     text: 'Seja objetivo, respeite meu tempo e venha preparado' } } },
    { id: 4, text: 'Minha filosofia de vida é...', options: {
      A: { profile: 'pavao',    text: 'Para ganhar, tem de inventar novas regras' },
      B: { profile: 'cachorro', text: 'Para eu ganhar, ninguém precisa perder' },
      C: { profile: 'macaco',   text: 'Para ganhar, tem de seguir as regras' },
      D: { profile: 'leao',     text: 'Há ganhadores e perdedores, e eu acredito ser um ganhador' } } },
    { id: 5, text: 'Não existe nada de errado em...', options: {
      A: { profile: 'pavao',    text: 'Mudar de ideia' },
      B: { profile: 'cachorro', text: 'Colocar os outros na frente' },
      C: { profile: 'macaco',   text: 'Ser consistente' },
      D: { profile: 'leao',     text: 'Se colocar na frente' } } },
    { id: 6, text: 'Eu gosto de chegar...', options: {
      A: { profile: 'pavao',    text: 'Em outro lugar' },
      B: { profile: 'cachorro', text: 'Junto' },
      C: { profile: 'macaco',   text: 'Na hora' },
      D: { profile: 'leao',     text: 'Na frente' } } },
    { id: 7, text: 'Eu gosto de...', options: {
      A: { profile: 'pavao',    text: 'Provocar novas formas de pensar' },
      B: { profile: 'cachorro', text: 'Construir memórias' },
      C: { profile: 'macaco',   text: 'Fazer sentido' },
      D: { profile: 'leao',     text: 'Fazer progresso' } } },
    { id: 8, text: 'O ditado que mais gosto é...', options: {
      A: { profile: 'pavao',    text: 'O que puder sonhar poderá realizar' },
      B: { profile: 'cachorro', text: 'Ninguém conquista nada sozinho' },
      C: { profile: 'macaco',   text: 'Se for pra fazer mal feito então não faça' },
      D: { profile: 'leao',     text: 'O feito é melhor do que o perfeito' } } },
    { id: 9, text: 'Eu sempre gostei de...', options: {
      A: { profile: 'pavao',    text: 'Explorar' },
      B: { profile: 'cachorro', text: 'Realizar uma abordagem natural' },
      C: { profile: 'macaco',   text: 'Evitar surpresas' },
      D: { profile: 'leao',     text: 'Focalizar a meta' } } },
    { id: 10, text: 'Gosto quando no meu dia...', options: {
      A: { profile: 'pavao',    text: 'Aprendo coisas novas' },
      B: { profile: 'cachorro', text: 'Me divirto com meus amigos' },
      C: { profile: 'macaco',   text: 'Tudo segue conforme planejado' },
      D: { profile: 'leao',     text: 'Consigo fazer muitas coisas' } } },
    { id: 11, text: 'Eu gosto de...', options: {
      A: { profile: 'pavao',    text: 'Novidades e de novos projetos' },
      B: { profile: 'cachorro', text: 'Calor humano e diversão' },
      C: { profile: 'macaco',   text: 'Ordem e sistematização' },
      D: { profile: 'leao',     text: 'Coisas claras e simples' } } },
    { id: 12, text: 'Se me convidar para um passeio...', options: {
      A: { profile: 'pavao',    text: 'Que seja para um lugar diferente' },
      B: { profile: 'cachorro', text: 'Que seja para um lugar com pessoas legais' },
      C: { profile: 'macaco',   text: 'Que seja para onde eu não passe trabalho' },
      D: { profile: 'leao',     text: 'Que seja para aproveitar ao máximo' } } },
    { id: 13, text: 'Eu penso que...', options: {
      A: { profile: 'pavao',    text: 'É bom ser manso, mas andar com um porrete' },
      B: { profile: 'cachorro', text: 'Unidos venceremos, divididos perderemos' },
      C: { profile: 'macaco',   text: 'Um homem prevenido vale por dois' },
      D: { profile: 'leao',     text: 'O ataque é melhor que a defesa' } } },
    { id: 14, text: 'Busco conselhos com...', options: {
      A: { profile: 'pavao',    text: 'Qualquer pessoa' },
      B: { profile: 'cachorro', text: 'Pessoas de quem eu gosto' },
      C: { profile: 'macaco',   text: 'Autoridades no assunto' },
      D: { profile: 'leao',     text: 'Pessoas bem-sucedidas' } } },
    { id: 15, text: 'Quando vou comprar algo sempre...', options: {
      A: { profile: 'pavao',    text: 'Analiso diversas possibilidades' },
      B: { profile: 'cachorro', text: 'Busco indicação de amigos e familiares' },
      C: { profile: 'macaco',   text: 'Analiso cada detalhe antes de escolher' },
      D: { profile: 'leao',     text: 'Decido rápido quando vejo vantagem clara' } } },
    { id: 16, text: 'Bons resultados dependem de...', options: {
      A: { profile: 'pavao',    text: 'Inovação' },
      B: { profile: 'cachorro', text: 'Pessoas' },
      C: { profile: 'macaco',   text: 'Planejar' },
      D: { profile: 'leao',     text: 'Ação' } } },
    { id: 17, text: 'Minha preocupação é...', options: {
      A: { profile: 'pavao',    text: 'Gerar ideias novas' },
      B: { profile: 'cachorro', text: 'Fazer com que as pessoas gostem' },
      C: { profile: 'macaco',   text: 'Fazer com que funcione' },
      D: { profile: 'leao',     text: 'Fazer com que aconteça' } } },
    { id: 18, text: 'Gosto de usar meu tempo para...', options: {
      A: { profile: 'pavao',    text: 'Pensar na vida e em novos projetos' },
      B: { profile: 'cachorro', text: 'Curtir a família e amigos' },
      C: { profile: 'macaco',   text: 'Planejar o que quero fazer' },
      D: { profile: 'leao',     text: 'Realizar tarefas' } } },
    { id: 19, text: 'Eu me divirto quando...', options: {
      A: { profile: 'pavao',    text: 'Tenho novidades' },
      B: { profile: 'cachorro', text: 'Estou com os outros' },
      C: { profile: 'macaco',   text: 'Tenho clareza sobre regras e critérios' },
      D: { profile: 'leao',     text: 'Estou me exercitando' } } },
    { id: 20, text: 'Acredito que...', options: {
      A: { profile: 'pavao',    text: 'Não é fácil seguir regras' },
      B: { profile: 'cachorro', text: 'Duas cabeças pensam melhor que uma' },
      C: { profile: 'macaco',   text: 'É preferível olhar, antes de pular' },
      D: { profile: 'leao',     text: 'Quem quer competir precisa estar preparado' } } }
  ],

  /* ---------------- PRODUTOS E PREÇOS ----------------
     'features' alimenta a pagina de planos (Etapa 6).
     Itens marcados com '*' no inicio sao renderizados como bloqueados.
     -------------------------------------------------- */
  products: {
    enxuto: {
      name: 'Relatório Enxuto',
      price: 59.90, priceLabel: 'R$ 59,90', priceNote: 'pagamento único',
      pages: '3 a 5',
      role: 'Entrada',
      tagline: 'Seu perfil comportamental, direto ao ponto.',
      features: [
        '3 a 5 páginas em PDF para baixar e guardar',
        'Percentuais dos quatro perfis',
        'Perfil dominante e secundário',
        'Pontos fortes e pontos de atenção',
        'Frase de reflexão personalizada',
        '*IECR e análise aprofundada — exclusivos do Completo'
      ]
    },
    completo: {
      name: 'Relatório Completo',
      price: 299.90, priceLabel: 'R$ 299,90',
      installments: '12× de R$ 29,90 sem juros', priceNote: 'ou 12× de R$ 29,90',
      pages: '18 a 30',
      role: 'Mais escolhido',
      featured: true,
      tagline: 'A leitura completa do seu código de comportamento.',
      features: [
        '22 páginas de análise aprofundada',
        'Combinação híbrida detalhada',
        'Perfil emocional e perfil de comunicação',
        'Como você compra, vende, negocia e lidera',
        'IECR — Índice de Esforço Cognitivo Relacional',
        'Matriz de esforço relacional entre perfis',
        'Plano de desenvolvimento individual'
      ]
    },
    empresarial: {
      name: 'Plano Empresarial',
      price: 1995, priceLabel: 'R$ 1.995', priceNote: 'por mês',
      note: 'Até 20 consultas por mês; planos maiores sob consulta',
      role: 'Para equipes',
      tagline: 'O MINDCODE aplicado à sua equipe comercial.',
      features: [
        'Até 20 análises por mês',
        'Relatórios completos para o time',
        'Leitura comportamental de equipe',
        'Apoio à contratação e à formação de times',
        'Planos maiores sob consulta'
      ]
    },
    certificacao: {
      name: 'Certificação MINDCODE Mentor',
      price: 8759, priceLabel: 'R$ 8.759', priceNote: 'formação completa',
      note: 'Curso de 20h para aplicar e interpretar o método',
      role: 'Formação',
      tagline: 'Torne-se um aplicador certificado do método.',
      features: [
        'Curso de 20 horas com Diego Winterhalter',
        'Aplicação e interpretação do método MINDCODE',
        'Uso dos arquétipos, híbridos e do IECR',
        'Material e suporte para atuar como mentor',
        'Certificação MINDCODE Mentor'
      ]
    }
  },

  /* ---------------- ESTRUTURA DOS RELATÓRIOS ---------------- */
  /* Ordem das seções. Os builders (Etapas 4 e 5) leem isto. */
  reportStructure: {
    enxuto: [
      'capa', 'percentuais', 'dominante', 'pontosFortes',
      'pontosAtencao', 'fraseReflexao', 'secundario', 'ctaCompleto'
    ],
    completo: [
      'capa', 'metodoEtica', 'resultadoGeral', 'interpretacaoPercentuais',
      'dominanteAprofundado', 'pontosFortes', 'sabotagens', 'secundario',
      'combinacaoHibrida', 'perfilEmocional', 'perfilComunicacao',
      'oQueAgrada', 'oQueIrrita', 'perfilTrabalho', 'comoCompra',
      'comoVende', 'comoNegocia', 'iecr', 'mapaEsforco', 'graficosIecr',
      'comunicacaoPorPerfil', 'planoDesenvolvimento', 'sinteseFinal',
      'ofertaContinuidade'
    ]
  }
};

/* Exporta como global (site estático) e como módulo (caso haja build). */
if (typeof window !== 'undefined') { window.MINDCODE_CORE = MINDCODE_CORE; }
if (typeof module !== 'undefined' && module.exports) { module.exports = MINDCODE_CORE; }

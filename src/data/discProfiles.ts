export interface ProfileData {
  nome: string;
  descricaoCurta: string;
  descricaoCompleta: string;
  potencialidades: string[];
  relacoesInterpessoais: string;
  tomadaDecisao: string;
  motivadores: {
    principal: string;
    secundario: string;
  };
  medos: string[];
  melhorAdequacao: string;
  pontosDesenvolver: string[];
  comunicacao: {
    comoComunicar: string;
    comoReceber: string;
  };
  planoAcao: string[];
  cargosIdeais: string[];
  alertasCriticos: {
    malInterpretado: string[];
    perdaColaboradores: string[];
    medosTravas: string[];
  };
}

export const discProfiles: Record<string, ProfileData> = {
  D: {
    nome: "Dominante Puro",
    descricaoCurta: "Líder natural, direto e orientado a resultados",
    descricaoCompleta: "Indivíduo altamente assertivo, competitivo e focado em resultados. Toma decisões rápidas, gosta de desafios e busca controle sobre situações. Prefere ambientes dinâmicos onde pode exercer autonomia e alcançar objetivos mensuráveis. Tende a ser impaciente com detalhes e processos lentos.",
    potencialidades: [
      "Liderança natural e comando",
      "Tomada de decisão rápida e assertiva",
      "Foco intenso em resultados e metas",
      "Capacidade de assumir riscos calculados",
      "Coragem para enfrentar desafios difíceis",
      "Iniciativa e proatividade",
      "Habilidade de motivar equipes para ação",
      "Visão estratégica e pensamento de longo prazo"
    ],
    relacoesInterpessoais: "Direto e franco nas comunicações. Pode ser percebido como autoritário ou insensível. Valoriza pessoas que entregam resultados e não desperdiçam tempo. Prefere comunicação objetiva e vai direto ao ponto.",
    tomadaDecisao: "Decisões rápidas, intuitivas e baseadas em resultados esperados. Confia em sua própria avaliação e não hesita em assumir riscos. Pode tomar decisões sem consultar amplamente a equipe.",
    motivadores: {
      principal: "Poder e Conquista - Busca controle, autoridade e alcançar metas ambiciosas",
      secundario: "Competição - Motivado por vencer, superar desafios e ser o melhor"
    },
    medos: [
      "Perder o controle ou autoridade",
      "Ser visto como fraco ou vulnerável",
      "Falhar em alcançar objetivos",
      "Ser manipulado ou controlado por outros",
      "Perder tempo com ineficiências"
    ],
    melhorAdequacao: "Posições de liderança executiva, gestão de projetos críticos, empreendedorismo, vendas de alto impacto, consultoria estratégica, posições que exigem tomada de decisão rápida e responsabilidade por resultados.",
    pontosDesenvolver: [
      "Desenvolver paciência e escuta ativa",
      "Aprender a delegar sem microgerenciar",
      "Considerar impactos emocionais nas pessoas",
      "Reduzir tendência a confronto desnecessário",
      "Equilibrar velocidade com qualidade e detalhes",
      "Desenvolver empatia e sensibilidade interpessoal"
    ],
    comunicacao: {
      comoComunicar: "Seja direto, objetivo e focado em resultados. Use dados e fatos. Não enrole nem seja prolixo. Apresente soluções, não apenas problemas.",
      comoReceber: "Seja claro, conciso e prepare-se com informações relevantes. Não leve críticas diretas para o pessoal. Esteja pronto para defender suas ideias com dados."
    },
    planoAcao: [
      "Praticar escuta ativa em reuniões - perguntar antes de decidir",
      "Implementar check-ins regulares com a equipe para entender necessidades emocionais",
      "Dedicar 10 minutos diários para reflexão antes de decisões importantes",
      "Solicitar feedback sobre estilo de comunicação e ajustar",
      "Participar de treinamento de inteligência emocional"
    ],
    cargosIdeais: ["CEO/Diretor Executivo", "Gerente de Projetos", "Empreendedor", "Consultor Estratégico", "Gerente de Vendas", "Diretor de Operações"],
    alertasCriticos: {
      malInterpretado: [
        "Sua objetividade pode ser vista como frieza ou falta de sensibilidade",
        "Sua assertividade pode parecer agressividade ou arrogância",
        "Sua pressa por resultados pode parecer desrespeito com o tempo dos outros",
        "Seu foco em metas pode parecer desinteresse pelas pessoas",
        "Sua franqueza direta pode ser interpretada como grosseria"
      ],
      perdaColaboradores: [
        "Colaboradores podem se sentir desvalorizados se não receberem reconhecimento emocional",
        "A pressão constante por resultados pode gerar esgotamento na equipe",
        "A falta de paciência com erros pode criar ambiente de medo",
        "Pessoas podem sair por sentirem que suas ideias nunca são ouvidas",
        "O estilo autoritário pode afastar talentos que buscam autonomia"
      ],
      medosTravas: [
        "O medo de perder controle te impede de delegar e desenvolver líderes",
        "O medo de parecer fraco te impede de pedir ajuda quando precisa",
        "O medo de falhar te faz assumir tudo sozinho, gerando sobrecarga",
        "O medo de perder tempo te impede de investir em relacionamentos importantes",
        "O medo de ser manipulado te faz desconfiar de boas intenções"
      ]
    }
  },
  I: {
    nome: "Influente Puro",
    descricaoCurta: "Comunicativo, entusiasta e orientado a pessoas",
    descricaoCompleta: "Indivíduo extremamente sociável, otimista e persuasivo. Energizado por interações sociais e trabalho em equipe. Excelente comunicador que inspira e motiva outros através de entusiasmo e carisma. Prefere ambientes colaborativos e dinâmicos com muita interação humana.",
    potencialidades: [
      "Comunicação excepcional e persuasão",
      "Capacidade de inspirar e motivar equipes",
      "Networking natural e construção de relacionamentos",
      "Criatividade e pensamento inovador",
      "Otimismo contagiante e energia positiva",
      "Habilidade de trabalhar em equipe",
      "Adaptabilidade a mudanças",
      "Capacidade de resolver conflitos com diplomacia"
    ],
    relacoesInterpessoais: "Caloroso, amigável e acessível. Constrói relacionamentos facilmente e mantém rede ampla de contatos. Pode ser percebido como superficial por trocar profundidade por amplitude de conexões. Evita conflitos diretos.",
    tomadaDecisao: "Decisões baseadas em intuição, emoções e impacto nas pessoas. Consulta amplamente antes de decidir. Pode protelar decisões difíceis que afetem relacionamentos. Confia em 'feeling' e feedback social.",
    motivadores: {
      principal: "Reconhecimento Social - Busca aprovação, popularidade e ser valorizado publicamente",
      secundario: "Harmonia - Motivado por ambientes positivos e relacionamentos agradáveis"
    },
    medos: [
      "Rejeição social ou ser ignorado",
      "Perder popularidade ou aprovação",
      "Isolamento ou trabalhar sozinho",
      "Ser visto como chato ou desinteressante",
      "Conflitos interpessoais diretos"
    ],
    melhorAdequacao: "Vendas, relações públicas, marketing, recursos humanos, treinamento e desenvolvimento, atendimento ao cliente, gestão de eventos, posições que envolvem apresentações e networking.",
    pontosDesenvolver: [
      "Aumentar foco e disciplina em tarefas",
      "Melhorar follow-through e conclusão de projetos",
      "Desenvolver atenção a detalhes e precisão",
      "Aprender a dizer 'não' e estabelecer limites",
      "Reduzir tendência a prometer demais",
      "Equilibrar sociabilidade com produtividade"
    ],
    comunicacao: {
      comoComunicar: "Seja amigável, entusiasta e positivo. Use histórias e exemplos. Permita tempo para interação social. Reconheça publicamente suas contribuições.",
      comoReceber: "Mantenha tom positivo e colaborativo. Forneça reconhecimento frequente. Evite críticas públicas. Use feedback sandwich (positivo-construtivo-positivo)."
    },
    planoAcao: [
      "Usar técnicas de time-management (Pomodoro) para manter foco",
      "Criar checklist diários para garantir conclusão de tarefas",
      "Praticar revisão de detalhes antes de finalizar trabalhos",
      "Estabelecer limites claros de disponibilidade social no trabalho",
      "Participar de curso de gestão de projetos para estruturação"
    ],
    cargosIdeais: ["Gerente de Vendas", "Especialista em Marketing", "Coordenador de RH", "Relações Públicas", "Facilitador/Trainer", "Gerente de Contas"],
    alertasCriticos: {
      malInterpretado: [
        "Seu entusiasmo pode ser visto como falta de seriedade ou profissionalismo",
        "Sua sociabilidade pode parecer fofoca ou perda de tempo",
        "Sua expressividade pode ser interpretada como exagero ou drama",
        "Sua necessidade de interação pode parecer carência ou dependência",
        "Sua informalidade pode ser vista como desrespeito à hierarquia"
      ],
      perdaColaboradores: [
        "Colaboradores podem se frustrar com promessas não cumpridas",
        "A falta de foco pode sobrecarregar quem precisa compensar",
        "Pessoas analíticas podem se irritar com a falta de detalhes",
        "Funcionários podem sair por falta de direção clara e consistência",
        "A evitação de conflitos pode deixar problemas sem solução"
      ],
      medosTravas: [
        "O medo de rejeição te faz evitar decisões difíceis que desagradam",
        "O medo de ser desinteressante te faz prometer mais do que pode entregar",
        "O medo de conflito te impede de dar feedbacks necessários",
        "O medo de ficar sozinho te faz aceitar qualquer convite, perdendo foco",
        "O medo de perder popularidade te impede de liderar com firmeza"
      ]
    }
  },
  S: {
    nome: "Estável Puro",
    descricaoCurta: "Paciente, confiável e orientado a harmonia",
    descricaoCompleta: "Indivíduo calmo, paciente e consistente. Valoriza estabilidade, harmonia e trabalho em equipe. Excelente ouvinte e mediador natural. Prefere ambientes previsíveis com rotinas estabelecidas. Leal e comprometido com pessoas e organizações.",
    potencialidades: [
      "Paciência excepcional e persistência",
      "Confiabilidade e consistência",
      "Habilidade de ouvir atentamente",
      "Mediação de conflitos e diplomacia",
      "Lealdade e comprometimento de longo prazo",
      "Trabalho em equipe e colaboração",
      "Estabilidade emocional",
      "Capacidade de criar ambientes harmoniosos"
    ],
    relacoesInterpessoais: "Caloroso, empático e solidário. Cria relacionamentos profundos e duradouros. Evita conflitos ativamente e busca consenso. Pode ser visto como indeciso por buscar agradar a todos. Prefere ambientes de baixo conflito.",
    tomadaDecisao: "Decisões lentas, ponderadas e consultivas. Busca consenso e considera impacto em todas as partes. Pode protelar decisões por medo de causar desconforto. Valoriza segurança sobre inovação arriscada.",
    motivadores: {
      principal: "Segurança e Estabilidade - Busca ambiente previsível, relacionamentos duradouros e baixo risco",
      secundario: "Harmonia - Motivado por paz, equilíbrio e ausência de conflitos"
    },
    medos: [
      "Mudanças súbitas ou instabilidade",
      "Conflitos interpessoais ou confrontos",
      "Perder segurança ou estabilidade",
      "Ser forçado a tomar decisões rápidas",
      "Desapontar pessoas ou quebrar confiança"
    ],
    melhorAdequacao: "Recursos humanos, atendimento ao cliente, suporte técnico, administração, assistência executiva, ensino, serviços sociais, posições que requerem paciência e consistência.",
    pontosDesenvolver: [
      "Desenvolver assertividade e capacidade de dizer não",
      "Aumentar tolerância a mudanças e incerteza",
      "Acelerar processo de tomada de decisão",
      "Aprender a lidar construtivamente com conflitos",
      "Reduzir resistência a inovações",
      "Equilibrar necessidades próprias com dos outros"
    ],
    comunicacao: {
      comoComunicar: "Seja paciente, gentil e não agressivo. Dê tempo para processar informações. Evite pressão por decisões rápidas. Reconheça e valorize contribuições estáveis.",
      comoReceber: "Forneça contexto e razões para mudanças. Dê aviso prévio de alterações. Use tom calmo e respeitoso. Evite confrontos diretos ou críticas públicas."
    },
    planoAcao: [
      "Praticar assertividade em situações de baixo risco",
      "Estabelecer prazos pessoais para decisões para evitar procrastinação",
      "Participar de curso de gestão de mudanças",
      "Identificar uma 'pequena mudança' semanal para praticar adaptabilidade",
      "Treinamento em negociação e resolução de conflitos"
    ],
    cargosIdeais: ["Analista de RH", "Assistente Executivo", "Coordenador Administrativo", "Atendimento ao Cliente", "Professor/Instrutor", "Gestor de Relacionamento"],
    alertasCriticos: {
      malInterpretado: [
        "Sua calma pode ser vista como falta de urgência ou preguiça",
        "Sua paciência pode parecer lentidão ou falta de iniciativa",
        "Sua busca por harmonia pode parecer indecisão ou falta de opinião",
        "Sua lealdade pode ser interpretada como submissão ou dependência",
        "Sua resistência a mudanças pode parecer teimosia ou acomodação"
      ],
      perdaColaboradores: [
        "Colaboradores ambiciosos podem sair por falta de desafios e crescimento",
        "A evitação de conflitos pode deixar problemas crescerem sem solução",
        "Pessoas dinâmicas podem se frustrar com a lentidão nas decisões",
        "A dificuldade em dar feedback negativo pode prejudicar o desenvolvimento da equipe",
        "Funcionários podem sair por falta de reconhecimento ou promoção"
      ],
      medosTravas: [
        "O medo de mudança te faz perder oportunidades de crescimento",
        "O medo de conflito te impede de defender suas ideias e conquistas",
        "O medo de desagradar te faz aceitar mais trabalho do que deveria",
        "O medo de instabilidade te mantém em situações que já não te servem",
        "O medo de confronto te impede de cobrar o que é seu por direito"
      ]
    }
  },
  C: {
    nome: "Conforme Puro",
    descricaoCurta: "Analítico, preciso e orientado a qualidade",
    descricaoCompleta: "Indivíduo meticuloso, analítico e focado em precisão. Valoriza qualidade, exatidão e procedimentos corretos. Toma decisões baseadas em dados e análise cuidadosa. Prefere ambientes estruturados com padrões claros e expectativas bem definidas.",
    potencialidades: [
      "Atenção excepcional a detalhes",
      "Pensamento analítico e lógico",
      "Qualidade e precisão no trabalho",
      "Capacidade de identificar erros e problemas",
      "Respeito a regras e procedimentos",
      "Planejamento meticuloso",
      "Expertise técnico profundo",
      "Consistência e confiabilidade"
    ],
    relacoesInterpessoais: "Reservado, formal e focado em trabalho. Prefere comunicação escrita e estruturada. Pode ser visto como distante ou crítico. Valoriza competência técnica sobre carisma. Constrói relacionamentos lentamente baseados em confiança e respeito mútuo.",
    tomadaDecisao: "Decisões lentas, baseadas em dados extensivos e análise completa. Busca informações de múltiplas fontes antes de concluir. Pode sofrer de 'análise-paralisia'. Prefere ter certeza absoluta antes de agir.",
    motivadores: {
      principal: "Conhecimento e Precisão - Busca expertise, excelência técnica e fazer as coisas corretamente",
      secundario: "Ordem - Motivado por estrutura, processos e padrões de qualidade"
    },
    medos: [
      "Cometer erros ou ser impreciso",
      "Críticas ao trabalho ou competência técnica",
      "Ambiguidade e falta de clareza",
      "Quebrar regras ou padrões",
      "Tomar decisões sem informação suficiente"
    ],
    melhorAdequacao: "Análise de dados, qualidade e compliance, finanças e contabilidade, engenharia, pesquisa, auditoria, TI e programação, posições técnicas especializadas.",
    pontosDesenvolver: [
      "Desenvolver flexibilidade e tolerância a ambiguidade",
      "Acelerar tomada de decisão com informação 'suficiente'",
      "Melhorar habilidades interpessoais e comunicação",
      "Reduzir perfeccionismo excessivo",
      "Aprender a trabalhar com incerteza",
      "Equilibrar qualidade com prazos realistas"
    ],
    comunicacao: {
      comoComunicar: "Seja lógico, preciso e baseado em dados. Forneça detalhes e documentação. Dê tempo para análise. Respeite expertise técnico e evite pressão por decisões rápidas.",
      comoReceber: "Use comunicação clara e documentada. Forneça contexto completo e dados. Evite mudanças de última hora. Reconheça precisão e qualidade do trabalho."
    },
    planoAcao: [
      "Praticar 'decisão com 80% de informação' em situações de baixo risco",
      "Participar de atividades sociais para desenvolver soft skills",
      "Estabelecer prazo limite para análises para evitar over-analysis",
      "Curso de comunicação interpessoal e apresentações",
      "Praticar delegação de tarefas menos críticas"
    ],
    cargosIdeais: ["Analista de Dados", "Contador/Auditor", "Engenheiro de Qualidade", "Analista de Sistemas", "Pesquisador", "Compliance Officer"],
    alertasCriticos: {
      malInterpretado: [
        "Sua atenção a detalhes pode ser vista como perfeccionismo paralisante",
        "Sua reserva pode parecer frieza ou desinteresse pelas pessoas",
        "Suas perguntas podem ser interpretadas como desconfiança ou crítica",
        "Sua cautela pode parecer pessimismo ou negatividade",
        "Sua precisão pode ser vista como rigidez ou inflexibilidade"
      ],
      perdaColaboradores: [
        "Colaboradores podem se sentir microgerenciados pela busca por perfeição",
        "A lentidão nas decisões pode frustrar pessoas mais dinâmicas",
        "O foco excessivo em erros pode desmotivar a equipe",
        "A falta de reconhecimento emocional pode fazer pessoas se sentirem máquinas",
        "Funcionários criativos podem sair por falta de espaço para experimentar"
      ],
      medosTravas: [
        "O medo de errar te faz analisar demais e perder oportunidades de ação",
        "O medo de crítica te impede de mostrar trabalho antes de estar 'perfeito'",
        "O medo de ambiguidade te faz evitar projetos com incerteza",
        "O medo de quebrar regras te impede de inovar e questionar processos",
        "O medo de parecer incompetente te faz esconder dúvidas importantes"
      ]
    }
  },
  DI: {
    nome: "Dominante-Influente",
    descricaoCurta: "Líder carismático, enérgico e persuasivo",
    descricaoCompleta: "Combinação poderosa de assertividade e carisma. Líder natural que inspira através de energia, entusiasmo e visão. Excelente em vendas, apresentações e motivação de equipes. Toma decisões rápidas mas considera impacto nas pessoas. Busca resultados através de influência e persuasão.",
    potencialidades: [
      "Liderança inspiradora e carismática",
      "Comunicação persuasiva e impactante",
      "Capacidade de vender ideias e visões",
      "Energia contagiante e motivação de equipes",
      "Networking estratégico",
      "Tomada de decisão rápida considerando pessoas",
      "Inovação e pensamento criativo orientado a resultados"
    ],
    relacoesInterpessoais: "Extrovertido, carismático e envolvente. Constrói relacionamentos amplos e diversos. Pode dominar conversas. Combina franqueza com charme. Prefere ambientes sociais dinâmicos.",
    tomadaDecisao: "Decisões rápidas mas com consideração ao impacto social. Usa intuição e feedback de rede. Confia em carisma para implementar decisões. Menos paciente com análise excessiva.",
    motivadores: {
      principal: "Reconhecimento e Conquista - Busca ser admirado por resultados e impacto",
      secundario: "Influência - Motivado por persuadir e inspirar outros"
    },
    medos: [
      "Perder influência ou popularidade",
      "Falhar publicamente",
      "Ser ignorado ou desvalorizado",
      "Perder controle sobre resultados"
    ],
    melhorAdequacao: "Vendas executivas, liderança de equipes comerciais, empreendedorismo, consultoria, posições de visibilidade e influência.",
    pontosDesenvolver: [
      "Desenvolver paciência com detalhes e processos",
      "Equilibrar entusiasmo com análise",
      "Melhorar escuta ativa",
      "Reduzir tendência a dominar conversas"
    ],
    comunicacao: {
      comoComunicar: "Seja direto mas entusiasta. Reconheça conquistas. Dê espaço para expressão. Use histórias de sucesso.",
      comoReceber: "Prepare apresentações impactantes. Use dados com storytelling. Reconheça publicamente."
    },
    planoAcao: [
      "Praticar pausas estratégicas em conversas",
      "Incluir análise de dados em apresentações",
      "Delegar follow-through para garantir execução",
      "Buscar feedback sobre impacto nas pessoas"
    ],
    cargosIdeais: ["Diretor Comercial", "CEO de Startup", "Consultor de Vendas", "Líder de Equipe", "Palestrante", "Head de Marketing"],
    alertasCriticos: {
      malInterpretado: [
        "Sua energia pode ser vista como impulsividade ou falta de reflexão",
        "Sua confiança pode parecer arrogância ou ego inflado",
        "Sua rapidez pode parecer atropelamento das pessoas e processos",
        "Seu carisma pode ser visto como manipulação ou superficialidade",
        "Sua ambição pode parecer insensibilidade aos outros"
      ],
      perdaColaboradores: [
        "Colaboradores podem se sentir ofuscados pelo seu brilho pessoal",
        "A pressão por resultados rápidos pode esgotar a equipe",
        "Pessoas mais analíticas podem se frustrar com a falta de profundidade",
        "Funcionários podem sair por sentirem-se usados para seus objetivos",
        "A tendência a dominar pode silenciar vozes importantes da equipe"
      ],
      medosTravas: [
        "O medo de falhar publicamente te faz evitar riscos importantes",
        "O medo de perder influência te faz competir quando deveria colaborar",
        "O medo de ser ignorado te faz falar demais e ouvir de menos",
        "O medo de perder controle te impede de desenvolver sucessores",
        "O medo de ser desvalorizado te faz buscar reconhecimento excessivo"
      ]
    }
  },
  DC: {
    nome: "Dominante-Conforme",
    descricaoCurta: "Líder estratégico, focado em excelência",
    descricaoCompleta: "Combinação de assertividade com precisão analítica. Busca resultados através de planejamento meticuloso e execução rigorosa. Exige alto padrão de si e dos outros. Excelente em projetos complexos que requerem liderança e atenção a detalhes.",
    potencialidades: [
      "Planejamento estratégico rigoroso",
      "Execução de alta qualidade",
      "Liderança focada em resultados e padrões",
      "Análise crítica e tomada de decisão informada",
      "Capacidade de identificar e resolver problemas complexos"
    ],
    relacoesInterpessoais: "Profissional, focado e exigente. Respeita competência. Pode ser percebido como frio ou crítico. Prefere relacionamentos baseados em desempenho.",
    tomadaDecisao: "Decisões bem fundamentadas em dados e análise. Balanceia velocidade com precisão. Confia em expertise própria e fatos.",
    motivadores: {
      principal: "Excelência e Controle - Busca resultados de alta qualidade com domínio total",
      secundario: "Competência - Motivado por demonstrar expertise"
    },
    medos: [
      "Erros que comprometam resultados",
      "Perder controle de qualidade",
      "Ser visto como incompetente"
    ],
    melhorAdequacao: "Gestão de projetos complexos, engenharia, finanças, auditoria, consultoria estratégica, posições técnicas de liderança.",
    pontosDesenvolver: [
      "Desenvolver habilidades interpessoais",
      "Equilibrar exigência com empatia",
      "Aceitar que 'bom o suficiente' às vezes é suficiente"
    ],
    comunicacao: {
      comoComunicar: "Seja preciso, preparado e focado em resultados. Use dados. Respeite tempo.",
      comoReceber: "Apresente informações estruturadas. Demonstre competência. Evite ambiguidades."
    },
    planoAcao: [
      "Incluir reconhecimento de esforço da equipe",
      "Praticar feedback construtivo",
      "Desenvolver inteligência emocional"
    ],
    cargosIdeais: ["Diretor de Operações", "Gerente de Projetos", "Controller Financeiro", "Diretor de Qualidade", "CTO"],
    alertasCriticos: {
      malInterpretado: [
        "Sua exigência pode ser vista como perfeccionismo tóxico",
        "Sua frieza analítica pode parecer falta de humanidade",
        "Suas críticas podem ser interpretadas como ataques pessoais",
        "Sua independência pode parecer arrogância ou desdém pela equipe",
        "Seu foco em qualidade pode parecer desprezo por velocidade"
      ],
      perdaColaboradores: [
        "Colaboradores podem se sentir nunca bons o suficiente",
        "O ambiente de alta pressão pode gerar burnout na equipe",
        "Pessoas criativas podem sair por falta de espaço para errar",
        "A falta de conexão emocional pode criar distância da equipe",
        "Funcionários podem sair por não receberem reconhecimento positivo"
      ],
      medosTravas: [
        "O medo de errar te faz revisar obsessivamente ao invés de confiar",
        "O medo de perder controle te impede de delegar trabalho importante",
        "O medo de parecer incompetente te faz esconder vulnerabilidades",
        "O medo de falhar te faz evitar projetos com risco de insucesso",
        "O medo de crítica te faz ser excessivamente duro consigo mesmo"
      ]
    }
  },
  IS: {
    nome: "Influente-Estável",
    descricaoCurta: "Facilitador empático, colaborativo e paciente",
    descricaoCompleta: "Combinação de sociabilidade com paciência e consistência. Excelente em criar ambientes colaborativos e harmoniosos. Natural em facilitar grupos e mediar conflitos. Valoriza relacionamentos profundos e duradouros.",
    potencialidades: [
      "Facilitação de grupos e equipes",
      "Criação de ambientes harmoniosos",
      "Mediação de conflitos",
      "Construção de relacionamentos duradouros",
      "Comunicação empática e acessível"
    ],
    relacoesInterpessoais: "Caloroso, acessível e paciente. Cria conexões profundas. Evita conflitos e busca harmonia. Excelente ouvinte.",
    tomadaDecisao: "Decisões consultivas e consensuais. Considera impacto em todos. Pode ser lento em decidir.",
    motivadores: {
      principal: "Harmonia e Conexão - Busca relacionamentos positivos e ambiente pacífico",
      secundario: "Reconhecimento - Valoriza ser apreciado por contribuições"
    },
    medos: [
      "Conflitos e desentendimentos",
      "Rejeição ou isolamento",
      "Mudanças disruptivas"
    ],
    melhorAdequacao: "Recursos humanos, treinamento, atendimento ao cliente, facilitação, coaching, serviços sociais.",
    pontosDesenvolver: [
      "Desenvolver assertividade",
      "Acelerar tomada de decisão",
      "Lidar construtivamente com conflitos"
    ],
    comunicacao: {
      comoComunicar: "Seja gentil, paciente e colaborativo. Reconheça contribuições. Evite pressão.",
      comoReceber: "Use tom positivo. Forneça feedback construtivo. Valorize lealdade."
    },
    planoAcao: [
      "Praticar dizer 'não' de forma gentil",
      "Estabelecer prazos para decisões",
      "Treinamento em assertividade"
    ],
    cargosIdeais: ["Coordenador de RH", "Trainer", "Coach", "Facilitador", "Gerente de Atendimento", "Assistente Social"],
    alertasCriticos: {
      malInterpretado: [
        "Sua gentileza pode ser vista como fraqueza ou falta de pulso",
        "Sua busca por harmonia pode parecer indecisão ou falta de posição",
        "Sua empatia pode parecer parcialidade ou favoritismo",
        "Sua paciência pode ser interpretada como falta de urgência",
        "Sua informalidade pode parecer falta de profissionalismo"
      ],
      perdaColaboradores: [
        "Colaboradores ambiciosos podem sair por falta de direção firme",
        "Problemas não resolvidos podem se acumular e explodir",
        "Pessoas diretas podem se frustrar com a falta de decisões claras",
        "A evitação de conflitos pode criar ambiente de passivo-agressividade",
        "Funcionários podem sair por falta de feedbacks honestos sobre desempenho"
      ],
      medosTravas: [
        "O medo de conflito te faz evitar conversas difíceis necessárias",
        "O medo de rejeição te faz ceder demais em negociações",
        "O medo de desagradar te impede de dar feedbacks construtivos",
        "O medo de mudança te faz resistir a melhorias necessárias",
        "O medo de parecer antipático te faz aceitar comportamentos inadequados"
      ]
    }
  },
  SC: {
    nome: "Estável-Conforme",
    descricaoCurta: "Especialista confiável, metódico e consistente",
    descricaoCompleta: "Combinação de paciência com precisão analítica. Excelente em trabalhos que requerem consistência, atenção a detalhes e qualidade. Prefere ambientes estruturados com expectativas claras. Confiável e metódico.",
    potencialidades: [
      "Consistência excepcional",
      "Atenção a detalhes",
      "Confiabilidade",
      "Trabalho de alta qualidade",
      "Paciência com tarefas repetitivas"
    ],
    relacoesInterpessoais: "Reservado mas leal. Prefere grupos pequenos. Constrói confiança gradualmente. Evita conflitos.",
    tomadaDecisao: "Decisões cuidadosas baseadas em análise e consenso. Prefere ter todas as informações.",
    motivadores: {
      principal: "Segurança e Qualidade - Busca estabilidade com padrões elevados",
      secundario: "Ordem - Valoriza estrutura e previsibilidade"
    },
    medos: [
      "Mudanças súbitas",
      "Erros ou imperfeições",
      "Conflitos interpessoais"
    ],
    melhorAdequacao: "Análise, auditoria, controle de qualidade, suporte técnico, administração, pesquisa.",
    pontosDesenvolver: [
      "Aumentar velocidade de decisão",
      "Desenvolver flexibilidade",
      "Melhorar comunicação assertiva"
    ],
    comunicacao: {
      comoComunicar: "Seja claro, detalhado e paciente. Forneça contexto. Evite surpresas.",
      comoReceber: "Dê tempo para processar. Use informações escritas. Reconheça qualidade."
    },
    planoAcao: [
      "Praticar adaptação a pequenas mudanças",
      "Estabelecer limites de tempo para análises",
      "Curso de comunicação assertiva"
    ],
    cargosIdeais: ["Analista de Qualidade", "Auditor", "Contador", "Técnico Especialista", "Pesquisador", "Suporte Técnico"],
    alertasCriticos: {
      malInterpretado: [
        "Sua reserva pode ser vista como frieza ou desinteresse",
        "Sua cautela pode parecer medo ou falta de confiança",
        "Seu ritmo pode ser interpretado como lentidão ou preguiça",
        "Sua atenção a detalhes pode parecer obsessão ou bloqueio",
        "Sua preferência por rotina pode parecer falta de criatividade"
      ],
      perdaColaboradores: [
        "Colaboradores dinâmicos podem se frustrar com a lentidão de processos",
        "A resistência a mudanças pode fazer equipe perder oportunidades",
        "Pessoas extrovertidas podem se sentir isoladas no ambiente",
        "A falta de feedback positivo pode desmotivar a equipe",
        "Funcionários criativos podem sair por falta de espaço para inovação"
      ],
      medosTravas: [
        "O medo de mudança te faz resistir mesmo a melhorias necessárias",
        "O medo de errar te paralisa diante de decisões importantes",
        "O medo de conflito te faz engolir insatisfações que crescem",
        "O medo de julgamento te impede de compartilhar boas ideias",
        "O medo de incerteza te mantém preso em zonas de conforto limitantes"
      ]
    }
  }
};

export function getProfileDescription(d: number, i: number, s: number, c: number): ProfileData {
  const scores = { D: d, I: i, S: s, C: c };
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  
  const primary = sorted[0][0];
  const secondary = sorted[1][0];
  
  // Se a diferença entre o primeiro e segundo for pequena, considera perfil composto
  const diff = sorted[0][1] - sorted[1][1];
  
  if (diff <= 5 && sorted[1][1] > 0) {
    const compositeKey = `${primary}${secondary}`;
    if (discProfiles[compositeKey]) {
      return discProfiles[compositeKey];
    }
  }
  
  return discProfiles[primary] || discProfiles.D;
}

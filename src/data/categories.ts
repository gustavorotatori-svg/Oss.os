import { MainCategory, MainCategoryConfig, Product } from '../types';

export const MAIN_CATEGORIES_CONFIG: MainCategoryConfig[] = [
  {
    id: 'Vestuário',
    name: 'Vestuário',
    slug: 'vestuario',
    icon: '🥋',
    kanji: '着',
    tagline: 'FIGHTWEAR & KIMONOS',
    description: 'Armaduras do tatame: kimonos de alta gramatura, rashguards de compressão, shorts de grappling e faixas oficiais.',
    gradientBg: 'from-amber-950/80 via-zinc-900/60 to-zinc-950/90',
    accentColor: 'text-amber-400',
    borderAccent: 'border-amber-500',
    groups: [
      {
        id: 'kimonos',
        name: 'Kimonos (Gis)',
        slug: 'kimonos',
        icon: '🥋',
        description: 'Trançados tradicionais, gramaturas de 350g a 550g e cortes aprovados para competição e treino diário.',
        subcategories: [
          {
            id: 'kimonos-competicao',
            name: 'Kimonos de Competição',
            slug: 'kimonos-competicao',
            description: 'Modelagens ajustadas, lapela vulcanizada rígida e tecidos conformes às regras IBJJF / CBJJ.',
            badge: 'IBJJF APROVADO',
            keywords: ['competição', 'competition', 'pro', 'ibjjf', 'h1x', 'mundial', 'challenger', 'onyx']
          },
          {
            id: 'kimonos-treino',
            name: 'Kimonos de Treino',
            slug: 'kimonos-treino',
            description: 'Trançados resistentes Pearl Weave e Gold Weave para suportar a rotina pesada do dia a dia.',
            badge: 'ALTA DURABILIDADE',
            keywords: ['treino', 'training', 'pearl weave', 'kiku', 'classic', 'resistente', 'diário']
          },
          {
            id: 'kimonos-ripstop',
            name: 'Kimonos Ripstop & Leves',
            slug: 'kimonos-ripstop',
            description: 'Ultraleves para pesagem apertada e treinos no calor com secagem acelerada.',
            badge: 'ULTRALIGHT',
            keywords: ['ripstop', 'leve', 'light', 'viagem', 'secagem rápida', 'pesagem']
          },
          {
            id: 'kimonos-infantis',
            name: 'Kimonos Infantis',
            slug: 'kimonos-infantis',
            description: 'Tamanhos M00 a M4 especialmente desenvolvidos para o conforto e anatomia dos pequenos campeões.',
            badge: 'KIDS & JUVENIL',
            keywords: ['infantil', 'kids', 'juvenil', 'm0', 'm1', 'm2', 'm3', 'm4', 'criança']
          }
        ]
      },
      {
        id: 'rashguards',
        name: 'Rashguards & No-Gi',
        slug: 'rashguards',
        icon: '👕',
        description: 'Camisas de compressão UV50+ com costuras flatlock para proteção térmica e contra bactérias do tatame.',
        subcategories: [
          {
            id: 'rashguards-manga-longa',
            name: 'Rashguards Manga Longa',
            slug: 'rashguards-manga-longa',
            description: 'Cobertura completa dos braços contra queimaduras de tatame e arranhões de raspagens.',
            badge: 'PROTEÇÃO TOTAL',
            keywords: ['manga longa', 'long sleeve', 'full arm', 'compressão completa']
          },
          {
            id: 'rashguards-manga-curta',
            name: 'Rashguards Manga Curta',
            slug: 'rashguards-manga-curta',
            description: 'Máxima amplitude de ombros e ventilação para treinos intensos sem kimono.',
            badge: 'ALTA VENTILAÇÃO',
            keywords: ['manga curta', 'short sleeve', 'ventilada']
          },
          {
            id: 'rashguards-graduadas',
            name: 'Rashguards Graduadas (IBJJF)',
            slug: 'rashguards-graduadas',
            description: 'Padrão com 10% da cor da sua faixa para torneios oficiais No-Gi.',
            badge: 'RANKED NO-GI',
            keywords: ['graduada', 'ranked', 'faixa', 'branca', 'azul', 'roxa', 'marrom', 'preta', 'ibjjf']
          }
        ]
      },
      {
        id: 'bermudas',
        name: 'Bermudas & Fight Shorts',
        slug: 'bermudas-shorts',
        icon: '🩳',
        description: 'Bermudas de grappling sem zíperes externos, com fenda lateral e elasticidade em 4 direções.',
        subcategories: [
          {
            id: 'fight-shorts',
            name: 'Fight Shorts de Grappling',
            slug: 'fight-shorts',
            description: 'Cós com cordão interno e grip de silicone para não deslizar nas trocas de pegada.',
            badge: 'GRAPPLING PRO',
            keywords: ['fight shorts', 'bermuda', 'grappling', 'boardshorts', 'tora-ko', 'sem velcro']
          },
          {
            id: 'spats-compressao',
            name: 'Shorts de Compressão & Spats',
            slug: 'spats-compressao',
            description: 'Calças e bermudas térmicas coladas para suporte muscular e proteção de joelhos.',
            badge: 'COMPRESSÃO',
            keywords: ['spat', 'spats', 'calça compressão', 'térmica', 'under-layer']
          }
        ]
      },
      {
        id: 'faixas',
        name: 'Faixas & Graduações',
        slug: 'faixas',
        icon: '🎗️',
        description: 'O símbolo da jornada: de branca a preta com ponta vermelha e costuras ultra-resistentes.',
        subcategories: [
          {
            id: 'faixas-competicao',
            name: 'Faixas de Competição (Heavy Weave)',
            slug: 'faixas-competicao',
            description: 'Algodão grosso de 10 a 12 costuras com nó firme que não solta durante as lutas.',
            badge: 'NÓ BLINDADO',
            keywords: ['competição', 'pesada', 'heavy', '12 costuras', 'densa', 'ponteira 12cm']
          },
          {
            id: 'faixas-treino',
            name: 'Faixas Tradicionais de Treino',
            slug: 'faixas-treino',
            description: 'Maleáveis e resistentes para uso contínuo no tatame com acabamento clássico.',
            badge: 'CONFORTÁVEL',
            keywords: ['treino', 'tradicional', 'algodão', 'branca', 'azul', 'roxa', 'marrom', 'preta']
          }
        ]
      },
      {
        id: 'casual',
        name: 'Casual & Lifestyle BJJ',
        slug: 'casual',
        icon: '🧢',
        description: 'A identidade do jiu-jitsu fora do tatame com moletons pesados e camisetas com arte clássica.',
        subcategories: [
          {
            id: 'moletons-bjj',
            name: 'Moletons & Casacos Tatame',
            slug: 'moletons-bjj',
            description: 'Moletons térmicos de alta gramatura para aquecimento pré-luta e pós-treino.',
            badge: 'PRE-FIGHT WARMUP',
            keywords: ['moletom', 'hoodie', 'casaco', 'jaqueta', 'fleece']
          },
          {
            id: 'camisetas-bjj',
            name: 'Camisetas & Bonés',
            slug: 'camisetas-bjj',
            description: 'Camisetas de algodão egípcio e bonés snapback com a estética autêntica da arte suave.',
            badge: 'LIFESTYLE',
            keywords: ['camiseta', 't-shirt', 'boné', 'roots', 'jiujiteiro']
          }
        ]
      }
    ]
  },
  {
    id: 'Equipamentos',
    name: 'Equipamentos',
    slug: 'equipamentos',
    icon: '🛡️',
    kanji: '具',
    tagline: 'TATAMES, CT & PREPARAÇÃO',
    description: 'A infraestrutura do seu treino: tatames de alta densidade, bonecos de treino solo e equipamentos de pegada.',
    gradientBg: 'from-emerald-950/80 via-zinc-900/60 to-zinc-950/90',
    accentColor: 'text-emerald-400',
    borderAccent: 'border-emerald-500',
    groups: [
      {
        id: 'tatames',
        name: 'Tatames & Pisos (Mats)',
        slug: 'tatames',
        icon: '🟩',
        description: 'Absorção de impacto de alto rendimento para quedas de judô, wrestling e rolas pesados.',
        subcategories: [
          {
            id: 'tatames-eva',
            name: 'Tatames de Encaixe EVA',
            slug: 'tatames-eva',
            description: 'Placas modulares de 20mm, 30mm e 40mm com textura antiderrapante tipo palha de arroz.',
            badge: 'MODULAR 40MM',
            keywords: ['tatame eva', 'placa', 'encaixe', 'dente', '30mm', '40mm', 'tatame']
          },
          {
            id: 'tatames-roll-out',
            name: 'Tatames Roláveis (Roll-out Mats)',
            slug: 'tatames-roll-out',
            description: 'Pisos profissionais contínuos sem frestas, fáceis de enrolar e transportar para seminários.',
            badge: 'PADRÃO INTERNACIONAL',
            keywords: ['roll out', 'rolável', 'mat', 'esteira', 'sem fresta', 'vinil']
          },
          {
            id: 'lonas-protecoes',
            name: 'Lonas & Proteções de Parede',
            slug: 'lonas-protecoes',
            description: 'Acolchoamento para paredes do dojô e lonas de cobertura com tratamento antimicrobiano.',
            badge: 'SEGURANÇA DO CT',
            keywords: ['lona', 'parede', 'proteção parede', 'espuma parede', 'revestimento']
          }
        ]
      },
      {
        id: 'treino-solo',
        name: 'Treinamento Solo & Pegada',
        slug: 'treino-solo',
        icon: '🤼',
        description: 'Ferramentas táticas para treinar drills de guarda, passagens e força isométrica em casa.',
        subcategories: [
          {
            id: 'grappling-dummies',
            name: 'Bonecos de Treino (Grappling Dummies)',
            slug: 'grappling-dummies',
            description: 'Manequins anatômicos com pernas e braços articulados para repetição de chaves e passagens.',
            badge: 'DRILLS SOLO',
            keywords: ['boneco', 'dummy', 'grappling dummy', 'manequim', 'treino solo']
          },
          {
            id: 'elasticos-grip',
            name: 'Elásticos de Pegada (Grip Trainers)',
            slug: 'elasticos-grip',
            description: 'Simuladores de manga de kimono e faixas elásticas para explosão nos dedos e antebraço.',
            badge: 'PEGADA DE FERRO',
            keywords: ['grip trainer', 'pegada', 'manga kimono', 'elástico', 'antebraço']
          },
          {
            id: 'forca-kettlebell',
            name: 'Kettlebells & Força Funcional',
            slug: 'forca-kettlebell',
            description: 'Pesos livres focados em quadril, posterior de coxa e estabilização de core para lutadores.',
            badge: 'CORE & QUADRIL',
            keywords: ['kettlebell', 'corda naval', 'sandbag', 'funcional', 'core']
          }
        ]
      },
      {
        id: 'dojo-ct',
        name: 'Estrutura de Dojô & Academia',
        slug: 'dojo-ct',
        icon: '🏫',
        description: 'Equipamentos de gerenciamento de tempo de rola, contagem de pontos e organização da academia.',
        subcategories: [
          {
            id: 'placar-cronometro',
            name: 'Placares & Cronômetros de Treino',
            slug: 'placar-cronometro',
            description: 'Relógios de intervalo digitais programáveis com sinal sonoro potente para rolas de 6 min.',
            badge: 'GESTÃO DE ROLAS',
            keywords: ['cronômetro', 'placar', 'timer', 'alarme', 'round']
          },
          {
            id: 'suportes-acessorios',
            name: 'Suportes & Cabides Reforçados',
            slug: 'suportes-acessorios',
            description: 'Cabides industriais de alta carga para secagem e exposição de kimonos pesados.',
            badge: 'ORGANIZAÇÃO',
            keywords: ['suporte', 'cabide kimono', 'organizador', 'rack']
          }
        ]
      }
    ]
  },
  {
    id: 'Suplementos',
    name: 'Suplementos',
    slug: 'suplementos',
    icon: '⚡',
    kanji: '力',
    tagline: 'PERFORMANCE & RECOVERY',
    description: 'Combustível para aguentar 10 rolas seguidos: creatina 100% pura, eletrólitos anti-cãibra e recuperação articular.',
    gradientBg: 'from-orange-950/80 via-zinc-900/60 to-zinc-950/90',
    accentColor: 'text-orange-400',
    borderAccent: 'border-orange-500',
    groups: [
      {
        id: 'forca-explosao',
        name: 'Força & Explosão',
        slug: 'forca-explosao',
        icon: '💥',
        description: 'Suplementos comprovados cientificamente para aumento de torque nas quedas e guarda fechada.',
        subcategories: [
          {
            id: 'creatina',
            name: 'Creatina Creapure® & Monohidratada',
            slug: 'creatina',
            description: 'Saturação de fosfocreatina para manter a explosão máxima nos primeiros 2 minutos de luta.',
            badge: 'CREAPURE® 100%',
            keywords: ['creatina', 'creapure', 'monohidratada', 'força', 'explosão', 'dux', 'growth']
          },
          {
            id: 'pre-treino',
            name: 'Pré-Treino & Foco Mental',
            slug: 'pre-treino',
            description: 'Fórmulas sem efeito rebote com tirosina e cafeína microencapsulada para reflexos afiados.',
            badge: 'FOCO TÁTICO',
            keywords: ['pré-treino', 'pre-workout', 'foco', 'energia', 'beta alanina']
          }
        ]
      },
      {
        id: 'proteinas-recovery',
        name: 'Proteínas & Recuperação',
        slug: 'proteinas-recovery',
        icon: '🥛',
        description: 'Reconstrução de microlesões musculares para acordar sem dor e pronto para o próximo treino.',
        subcategories: [
          {
            id: 'whey-protein',
            name: 'Whey Protein Isolado & Concentrado',
            slug: 'whey-protein',
            description: 'Proteína do soro do leite de rápida absorção e alto valor biológico de aminoácidos essenciais.',
            badge: 'ALTA PUREZA',
            keywords: ['whey', 'proteína', 'isolado', 'concentrado', 'wpi', 'wpc']
          },
          {
            id: 'glutamina-eaa',
            name: 'Glutamina, BCAA & EAA',
            slug: 'glutamina-eaa',
            description: 'Suporte imunológico e anti-catabólico para períodos de corte de peso e treinos duplos.',
            badge: 'IMUNO DEFESA',
            keywords: ['glutamina', 'bcaa', 'eaa', 'aminoácidos', 'recuperação']
          }
        ]
      },
      {
        id: 'hidratacao-eletrolitos',
        name: 'Hidratação & Eletrólitos',
        slug: 'hidratacao-eletrolitos',
        icon: '💧',
        description: 'Reposição rápida de sódio, potássio e magnésio perdidos no suor para banir as cãibras.',
        subcategories: [
          {
            id: 'eletrolitos-po',
            name: 'Eletrólitos em Pó & Pastilhas',
            slug: 'eletrolitos-po',
            description: 'Zero açúcar, reposição iônica imediata para beber durante o treino de kimono.',
            badge: 'ANTI-CÃIBRA',
            keywords: ['eletrólitos', 'sais', 'hidratação', 'isotônico', 'pastilhas']
          },
          {
            id: 'geis-carboidratos',
            name: 'Géis & Carboidratos Intra-Treino',
            slug: 'geis-carboidratos',
            description: 'Palatinose e géis energéticos para manter a glicemia durante campeonatos com várias lutas.',
            badge: 'ENERGIA CONTÍNUA',
            keywords: ['gel', 'palatinose', 'maltodextrina', 'carboidrato', 'intra-treino']
          }
        ]
      },
      {
        id: 'articulacoes-vitaminas',
        name: 'Saúde Articular & Vitaminas',
        slug: 'articulacoes-vitaminas',
        icon: '🦴',
        description: 'Proteção preventiva para cartilagens de joelho, ombros estalando e dedos inflamados.',
        subcategories: [
          {
            id: 'colageno-articular',
            name: 'Colágeno Tipo II & Glucosamina',
            slug: 'colageno-articular',
            description: 'Cuidado direto para tendões e cartilagens que sofrem torções e alavancas no tatame.',
            badge: 'BLINDAGEM ARTICULAR',
            keywords: ['colágeno', 'tipo 2', 'tipo ii', 'glucosamina', 'condroitina', 'articulação']
          },
          {
            id: 'omega-multivitaminico',
            name: 'Ômega 3 & Multivitamínicos',
            slug: 'omega-multivitaminico',
            description: 'Ação anti-inflamatória sistêmica natural e micronutrientes indispensáveis para a imunidade.',
            badge: 'ANTI-INFLAMATÓRIO',
            keywords: ['ômega 3', 'omega 3', 'multivitamínico', 'vitaminas', 'anti-inflamatório']
          }
        ]
      }
    ]
  },
  {
    id: 'Acessórios',
    name: 'Acessórios',
    slug: 'acessorios',
    icon: '🎒',
    kanji: '備',
    tagline: 'PROTEÇÃO, TRANSPORTE & TATAME CARE',
    description: 'Os guardiões da sua integridade: protetores bucais, fitas de dedo (finger tapes), orelheiras e mochilas à prova de kimono úmido.',
    gradientBg: 'from-blue-950/80 via-zinc-900/60 to-zinc-950/90',
    accentColor: 'text-blue-400',
    borderAccent: 'border-blue-500',
    groups: [
      {
        id: 'protecao-individual',
        name: 'Proteção Individual',
        slug: 'protecao-individual',
        icon: '🛡️',
        description: 'Equipamentos anatômicos para preservar dentes, orelhas e articulações contra choques mecânicos.',
        subcategories: [
          {
            id: 'protetor-bucal',
            name: 'Protetores Bucais Moldáveis',
            slug: 'protetor-bucal',
            description: 'Gel termomoldável com canal de respiração livre para proteger a dentição e absorver impactos de queixo.',
            badge: 'PROTEÇÃO DENTAL',
            keywords: ['protetor bucal', 'mouthguard', 'moldável', 'dente', 'gel', 'venum', 'shock doctor']
          },
          {
            id: 'orelheiras-bjj',
            name: 'Orelheiras de Jiu-Jitsu (Earguards)',
            slug: 'orelheiras-bjj',
            description: 'Evite a orelha de couve-flor: copos acolchoados com tiras de velcro duplo anti-deslocamento.',
            badge: 'ANTI-COUVE-FLOR',
            keywords: ['orelheira', 'earguard', 'orelha', 'couve-flor', 'protetor orelha']
          },
          {
            id: 'joelheiras-cotoveleiras',
            name: 'Joelheiras de Neoprene 7mm',
            slug: 'joelheiras-cotoveleiras',
            description: 'Amortecimento ideal para passagens de joelho no chão e estabilização de ligamentos cruzados.',
            badge: 'NEOPRENE 7MM',
            keywords: ['joelheira', 'neoprene', 'cotoveleira', 'joelho', 'ligamento']
          },
          {
            id: 'coquilhas',
            name: 'Coquilhas & Shorts Protetores',
            slug: 'coquilhas',
            description: 'Copo rígido ventilado com borda emborrachada para segurança indispensável na raspagem.',
            badge: 'DEFESA PÉLVICA',
            keywords: ['coquilha', 'protetor genital', 'cup', 'groin']
          }
        ]
      },
      {
        id: 'mochilas-transporte',
        name: 'Mochilas & Bolsas de Transporte',
        slug: 'mochilas-transporte',
        icon: '🎒',
        description: 'Bagagem reforçada com compartimento isolado e impermeável para levar o kimono encharcado de suor.',
        subcategories: [
          {
            id: 'mochilas-kimono',
            name: 'Mochilas Impermeáveis para Kimono',
            slug: 'mochilas-kimono',
            description: 'Compartimento ventilado roll-top com forro antibacteriano lavável para kimonos pesados.',
            badge: 'WET-POCKET PRO',
            keywords: ['mochila', 'bolsa kimono', 'impermeável', 'duffle', 'jiujiteiro bag']
          },
          {
            id: 'malas-duffle',
            name: 'Malas Duffle & Viagem de Torneio',
            slug: 'malas-duffle',
            description: 'Espaço generoso para 2 a 3 kimonos, calçados e suplementos com alças de ombro ergonômicas.',
            badge: 'COMPETITOR TRAVEL',
            keywords: ['mala', 'duffle bag', 'viagem', 'grande capacidade']
          }
        ]
      },
      {
        id: 'cuidados-higiene',
        name: 'Dedos, Higiene & Tatame Care',
        slug: 'cuidados-higiene',
        icon: '🩹',
        description: 'Tudo para curar e prevenir lesões de pegada, micoses, ringworm e manter o kimono perfumado.',
        subcategories: [
          {
            id: 'finger-tape',
            name: 'Finger Tapes BJJ (Fitas para Dedos)',
            slug: 'finger-tape',
            description: 'Fitas adesivas de 0.8cm e 1.25cm 100% algodão médico que não descolam com o suor da luta.',
            badge: 'PEGADA PROTEGIDA',
            keywords: ['finger tape', 'fita dedo', 'esparadrapo', 'tape', 'dedo', 'fita adesiva']
          },
          {
            id: 'sabonetes-antifungicos',
            name: 'Sabonetes Antifúngicos & Antissépticos',
            slug: 'sabonetes-antifungicos',
            description: 'Formulados com óleo de Melaleuca (Tea Tree) e ativos bactericidas para defesa total da pele.',
            badge: 'ANTI-RINGWORM',
            keywords: ['sabonete', 'antifúngico', 'tea tree', 'melaleuca', 'higiene', 'pele']
          },
          {
            id: 'spray-odor-kimono',
            name: 'Sprays Anti-Odor & Limpeza de Kimono',
            slug: 'spray-odor-kimono',
            description: 'Elimina o cheiro de suor acumulado nas tramas grossas sem desbotar o tecido.',
            badge: 'ANTI-ODOR',
            keywords: ['spray', 'odor', 'limpeza', 'lavagem kimono', 'aroma']
          }
        ]
      },
      {
        id: 'garrafas-utilitarios',
        name: 'Garrafas, Shakers & Utilitários',
        slug: 'garrafas-utilitarios',
        icon: '🚰',
        description: 'Acessórios essenciais à beira do tatame para hidratação contínua e organização da sua faixa.',
        subcategories: [
          {
            id: 'shakers-galao',
            name: 'Galões 2.2L & Shakers Térmicos',
            slug: 'shakers-galao',
            description: 'Coqueteleiras em aço inox e galões reforçados BPA-Free com tampa antivazamento.',
            badge: '2.2L CAPACITY',
            keywords: ['garrafa', 'galão', 'shaker', 'coqueteleira', 'inox', 'água']
          },
          {
            id: 'porta-faixas',
            name: 'Porta-Faixas & Displays de Graduação',
            slug: 'porta-faixas',
            description: 'Expositores de madeira nobre para guardar com honra todas as faixas da sua trajetória.',
            badge: 'MEMORIAL BJJ',
            keywords: ['porta faixa', 'display', 'quadro faixa', 'graduação']
          }
        ]
      }
    ]
  }
];

/**
 * Helper to get all primary categories
 */
export const getMainCategories = (): MainCategory[] => {
  return ['Vestuário', 'Equipamentos', 'Suplementos', 'Acessórios'];
};

/**
 * Helper to get configuration for a given main category
 */
export const getMainCategoryConfig = (id: MainCategory): MainCategoryConfig | undefined => {
  return MAIN_CATEGORIES_CONFIG.find(c => c.id === id);
};

/**
 * Flat list of all detailed subcategories with parent associations
 */
export interface FlatSubcategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  badge?: string;
  mainCategoryId: MainCategory;
  groupId: string;
  groupName: string;
  keywords: string[];
}

export const getAllDetailedSubcategories = (): FlatSubcategoryItem[] => {
  const result: FlatSubcategoryItem[] = [];
  MAIN_CATEGORIES_CONFIG.forEach(mainCat => {
    mainCat.groups.forEach(group => {
      group.subcategories.forEach(sub => {
        result.push({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          badge: sub.badge,
          mainCategoryId: mainCat.id,
          groupId: group.id,
          groupName: group.name,
          keywords: sub.keywords || []
        });
      });
    });
  });
  return result;
};

/**
 * Maps any product to its primary MainCategory
 */
export const resolveProductMainCategory = (product: Product): MainCategory => {
  if (product.mainCategory) return product.mainCategory;

  const titleLower = (product.title || '').toLowerCase();
  const catLower = (product.category || '').toLowerCase();
  const subLower = (product.subCategory || '').toLowerCase();
  const combined = `${titleLower} ${catLower} ${subLower}`;

  // 1. Vestuário
  if (
    catLower.includes('kimono') || catLower.includes('rashguard') || catLower.includes('bermuda') ||
    catLower.includes('shorts') || catLower.includes('faixa') || catLower.includes('roupas') ||
    catLower === 'vestuário' || catLower.includes('gi') ||
    combined.includes('kimono') || combined.includes('rashguard') || combined.includes('faixa ') || combined.includes('shorts')
  ) {
    return 'Vestuário';
  }

  // 2. Equipamentos
  if (
    catLower.includes('tatame') || catLower.includes('mat') || catLower.includes('equipamento para iniciante') ||
    catLower === 'equipamentos' || combined.includes('tatame') || combined.includes('dummy') || combined.includes('kettlebell') ||
    combined.includes('boneco de treino') || combined.includes('grip trainer')
  ) {
    return 'Equipamentos';
  }

  // 3. Suplementos
  if (
    catLower.includes('suplemento') || catLower.includes('nutrição') ||
    combined.includes('creatina') || combined.includes('whey') || combined.includes('eletrólitos') ||
    combined.includes('glutamina') || combined.includes('colágeno') || combined.includes('pré-treino')
  ) {
    return 'Suplementos';
  }

  // 4. Acessórios
  if (
    catLower.includes('acessór') || catLower.includes('protetor') || catLower.includes('proteção') ||
    combined.includes('mochila') || combined.includes('tape') || combined.includes('orelheira') ||
    combined.includes('bucal') || combined.includes('joelheira') || combined.includes('coquilha') || combined.includes('sabonete')
  ) {
    return 'Acessórios';
  }

  return 'Vestuário';
};

/**
 * Matches a product to a specific category filter
 */
export const isProductMatchingCategoryFilter = (
  product: Product,
  selectedCategory: string,
  selectedSubCategories: string[] = []
): boolean => {
  if (selectedCategory === 'All' && selectedSubCategories.length === 0) return true;

  const productMainCat = resolveProductMainCategory(product);
  const titleLower = (product.title || '').toLowerCase();
  const descLower = (product.description || '').toLowerCase();
  const subLower = (product.subCategory || '').toLowerCase();
  const subDetailedLower = (product.subCategoryDetailed || '').toLowerCase();
  const subGroupLower = (product.subCategoryGroup || '').toLowerCase();
  const categoryLower = (product.category || '').toLowerCase();
  const combined = `${titleLower} ${descLower} ${subLower} ${subDetailedLower} ${subGroupLower} ${categoryLower}`;

  // Match main category if selected
  if (selectedCategory !== 'All') {
    const isMainCatMatch = 
      productMainCat === selectedCategory ||
      categoryLower === selectedCategory.toLowerCase() ||
      (selectedCategory === 'Vestuário' && productMainCat === 'Vestuário') ||
      (selectedCategory === 'Equipamentos' && productMainCat === 'Equipamentos') ||
      (selectedCategory === 'Suplementos' && productMainCat === 'Suplementos') ||
      (selectedCategory === 'Acessórios' && productMainCat === 'Acessórios');

    // Legacy compatibility for special filters
    if (selectedCategory === 'Equipamentos para Iniciantes') {
      const matchIniciante = product.practitionerLevel === 'Iniciante' || combined.includes('iniciante') || combined.includes('branca');
      if (!matchIniciante && !isMainCatMatch) return false;
    } else if (selectedCategory === 'Roupas de Competição') {
      const matchComp = product.practitionerLevel === 'Avançado' || combined.includes('competição') || combined.includes('ibjjf');
      if (!matchComp && !isMainCatMatch) return false;
    } else if (!isMainCatMatch) {
      return false;
    }
  }

  // Match subcategories if any is selected
  if (selectedSubCategories.length > 0) {
    return selectedSubCategories.some(sub => {
      const targetSub = sub.toLowerCase();

      // Check explicit properties
      if (product.subCategoryDetailed && product.subCategoryDetailed.toLowerCase() === targetSub) return true;
      if (product.subCategory && product.subCategory.toLowerCase() === targetSub) return true;
      if (product.subCategoryGroup && product.subCategoryGroup.toLowerCase() === targetSub) return true;

      // Special Kimonos Subcategories Check
      if (targetSub.includes('competição')) {
        return combined.includes('competição') || combined.includes('competition') || combined.includes('h1x') || combined.includes('ibjjf');
      }
      if (targetSub.includes('treino')) {
        return combined.includes('treino') || combined.includes('training') || combined.includes('pearl weave') || combined.includes('kiku');
      }
      if (targetSub.includes('ripstop') || targetSub.includes('leve')) {
        return combined.includes('ripstop') || combined.includes('leve') || combined.includes('light');
      }
      if (targetSub.includes('infantil') || targetSub.includes('kids')) {
        return combined.includes('infantil') || combined.includes('kids') || product.gender === 'Infantil';
      }

      // Check general inclusion
      return combined.includes(targetSub);
    });
  }

  return true;
};

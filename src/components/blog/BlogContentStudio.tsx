import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Copy, Check, BookOpen, Tag, Target, ShoppingBag, Lightbulb, FileText, Share2, Layers, Award, UserCheck, ShieldAlert, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BlogPost, Product } from '@/src/types';

interface BlogContentStudioProps {
  onDraftCreated?: (post: Partial<BlogPost>) => void;
  productList?: Product[];
}

export interface ContentIdeaTemplate {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  targetAudience: string;
  keywords: string[];
  readTime: string;
  suggestedProducts: string[];
  outline: {
    heading: string;
    description: string;
    keyPoints: string[];
  }[];
  affiliateCallToAction: string;
  socialHook: string;
}

export const PRE_BUILT_IDEAS: ContentIdeaTemplate[] = [
  {
    id: 'idea-gi-guide',
    category: 'Guia de Kimonos',
    title: 'Guia Definitivo do Kimono Perfeito: Trançados, GSM e Regras IBJJF',
    subtitle: 'Tudo o que você precisa saber sobre tecidos Pearl, Gold e Single Weave antes de investir no seu uniforme.',
    targetAudience: 'Iniciantes Faixa-Branca e Atletas de Competição',
    keywords: ['como escolher kimono', 'kimono trançado pearl weave', 'tabela de tamanhos bjj A0 a A5', 'regras ibjjf kimonos 2026', 'melhor kimono duravel'],
    readTime: '9 MIN',
    suggestedProducts: ['Kimono Venum Elite BJJ', 'Kimono Atama Mundial', 'Kimono Koral Light'],
    outline: [
      {
        heading: '1. Entendendo os Tipos de Trançado (Single, Pearl, Gold e Double Weave)',
        description: 'Análise da gramatura (GSM) e densidade dos tecidos de algodão para prever durabilidade, rigidez na pegada do oponente e peso na balança.',
        keyPoints: [
          'Single Weave (300-450 GSM): Leve, ideal para dias quentes e bater peso.',
          'Pearl Weave (400-550 GSM): O padrão moderno perfeito balanceando leveza e resistência ao rasgo.',
          'Gold/Double Weave (650-900 GSM): O blindado clássico que dificulta a pegada mas pesa na balança.'
        ]
      },
      {
        heading: '2. Tabela de Tamanhos: Decifrando A0, A1, A2, A2L e A3',
        description: 'Como interpretar as medidas das marcas e a importância dos cortes Long (L) e Heavy (H) para atletas altos ou mais fortes.',
        keyPoints: [
          'A2L (Long): Perfeito para biotipos esguios e compridos sem sobra de tecido.',
          'Margem de encolhimento de 3% a 7% na secagem natural vs secadora.',
          'Medição oficial da distância da boca da manga ao punho no exame pré-luta.'
        ]
      },
      {
        heading: '3. Homologação IBJJF: Cores Permitidas e Espessura da Gola de EVA',
        description: 'Evite o dissabor de ser desclassificado na checagem oficial de equipamentos antes do combate.',
        keyPoints: [
          'Cores oficiais: Somente Branco, Azul Real e Preto. Proibidos kimonos marinho escuro ou mesclados.',
          'Gola com recheio de borracha EVA bactericida: Previne acúmulo de suor e fungos.',
          'Comprimento mínimo da calça em relação ao osso do tornozelo (máximo 5cm).'
        ]
      },
      {
        heading: '4. Cuidados e Manutenção: Como Lavar sem Destruir as Fibras',
        description: 'Métodos para eliminar o odor bacteriano sem desbotar o tecido nem usar alvejantes agressivos.',
        keyPoints: [
          'Uso de vinagre de álcool no enxágue para fixar a cor e neutralizar mofo.',
          'Nunca lavar com água quente a menos que queira encolher intencionalmente.',
          'Secagem à sombra em local arejado.'
        ]
      }
    ],
    affiliateCallToAction: 'Confira a nossa seleção curada de kimonos com frete grátis e menor preço verificado do mercado.',
    socialHook: 'Sabe a diferença entre Pearl Weave e Gold Weave? Descubra como escolher o kimono ideal que dura anos no tatame!'
  },
  {
    id: 'idea-brand-reviews',
    category: 'Reviews de Marcas',
    title: 'Análise Comparativa de Marcas de BJJ: Venum vs Koral vs Atama vs Tatami',
    subtitle: 'Colocamos os modelos mais vendidos sob avaliação rigorosa de durabilidade, costuras e custo-benefício.',
    targetAudience: 'Praticantes Intermediários e Avançados',
    keywords: ['review kimono venum', 'atama mundial vale a pena', 'koral x tatami fightwear', 'melhores marcas jiu jitsu', 'comparativo kimono durabilidade'],
    readTime: '11 MIN',
    suggestedProducts: ['Kimono Venum Contender 2.0', 'Kimono Atama Trançado', 'Rashguard Venum Gorilla'],
    outline: [
      {
        heading: '1. O Cenário das Marcas Tradicionais vs Marcas de Alta Performance',
        description: 'Histórico da evolução dos equipamentos e a transição das marcas clássicas cariocas para os gigantes globais de MMA/BJJ.',
        keyPoints: [
          'Tradição e heritage: Atama e Koral moldaram o esporte nos anos 90 e 2000.',
          'Inovação têxtil e design agressivo: Venum, KVRA e Tatami lideram os jovens atletas.'
        ]
      },
      {
        heading: '2. Avaliação da Costura Tripla e Reforços de Joelho/Axila',
        description: 'Onde os kimonos costumam rasgar primeiro durante treinos duros de passagem de guarda.',
        keyPoints: [
          'Reforço de costura nas axilas, saia da jaqueta e cavalo da calça.',
          'Tecido Ripstop nas calças vs Algodão Sarja tradicional.'
        ]
      },
      {
        heading: '3. Ranking de Custo-Benefício e Longevidade',
        description: 'Cálculo do custo por treino (CPT) com base na vida útil estimada de 2 a 5 anos de cada marca.',
        keyPoints: [
          'Categoria Entrada: Ótima durabilidade por valor acessível.',
          'Categoria Premium Competidor: Leveza extrema e ajuste anatômico sob medida.'
        ]
      }
    ],
    affiliateCallToAction: 'Compare as ofertas exclusivas das marcas de elite em nossa loja parceira e garanta seu cupom.',
    socialHook: 'Atama, Venum ou Koral? Comparamos os kimonos mais populares no tatame. Veja qual vale o seu investimento!'
  },
  {
    id: 'idea-training-recovery',
    category: 'Dicas de Treino',
    title: 'Manual de Longevidade no Tatame: Proteção de Dedos, Nutrição e Recuperação',
    subtitle: 'Estratégias científicas para praticantes de todas as idades evitarem lesões e treinarem 5 vezes por semana sem dor.',
    targetAudience: 'Praticantes Máster 30+, Atletas e Entusiastas',
    keywords: ['esparadrapagem dedos bjj', 'prevenção de lesões jiu jitsu', 'recuperação muscular bjj', 'suplementos para tatame', 'treino de jiu jitsu sem dor'],
    readTime: '8 MIN',
    suggestedProducts: ['Esparadrapo Esportivo BJJ', 'Protetor Bucal Venum Challenger', 'BCAA + Glutamina Growth'],
    outline: [
      {
        heading: '1. Esparadrapagem de Precisão (Taping Method para Dedos)',
        description: 'Técnica de amarração em X para suportar as articulações intergalângicas e prevenir a deformação da artrite de gola.',
        keyPoints: [
          'Aplicação do padrão cruzado travando as duas falanges.',
          'Preservação da sensibilidade tátil mantendo a gola firme.'
        ]
      },
      {
        heading: '2. Hidratação e Protocolo Repositor de Eletrólitos',
        description: 'A perda de sais minerais em uma sessão de 2 horas e como evitar cãibras nos minutos finais do rola.',
        keyPoints: [
          'Ingestão de Sódio, Potássio e Magnésio pré e pós-treino.',
          'Suplementação estratégica de Creatina e Glutamina para reparação tecidual.'
        ]
      },
      {
        heading: '3. Gerenciamento de Carga de Treino (Periodização Inteligente)',
        description: 'Saber a hora de fazer rolas leves (Flow Training) vs sparring de intensidade competitiva.',
        keyPoints: [
          'A regra dos 80/20: 80% do treino focado em técnica e posição, 20% em intensidade máxima.',
          'Higienização de arranhões e prevenção de infecções fúngicas ou bacterianas (Staph/Ringworm).'
        ]
      }
    ],
    affiliateCallToAction: 'Proteja suas articulações com esparadrapos de alta fixação e suplementos homologados em nosso portal.',
    socialHook: 'Acorda com dores nos dedos depois do treino de gola? Veja nosso guia prático de esparadrapagem e recuperação!'
  },
  {
    id: 'idea-interviews',
    category: 'Entrevistas',
    title: 'Entrevista Exclusiva: Mentalidade de Campeão e Segredos da Guarda Aranha',
    subtitle: 'Conversamos com grandes faixas-pretas sobre o equilíbrio entre carreira, rotina de treinos e filosofia dos mestres.',
    targetAudience: 'Todos os Praticantes e Admiradores da Arte Suave',
    keywords: ['entrevista faixa preta bjj', 'segredos guarda aranha', 'filosofia jiu jitsu', 'rotina atleta bjj', 'histórias do tatame'],
    readTime: '10 MIN',
    suggestedProducts: ['Rashguard Manto NoGi', 'Bermuda de Luta Venum', 'Faixa Preta Atama Premium'],
    outline: [
      {
        heading: '1. Trajetória da Faixa Branca à Faixa Preta de Elite',
        description: 'Os maiores obstáculos superados, momentos de desânimo na faixa azul e a virada de chave para a consistência.',
        keyPoints: [
          'Manter a mente de principiante (Shoshin) mesmo após décadas de tatame.',
          'A importância de um ambiente familiar e dojo acolhedor.'
        ]
      },
      {
        heading: '2. Desconstruindo a Guarda Aranha e o Rola Moderno',
        description: 'Conceitos biomecânicos de alavanca, quebra de postura e antecipação das passagens de guarda.',
        keyPoints: [
          'Pressão constante nos bíceps e variação rápida para triângulo e omoplata.',
          'Transição fluida para guarda laçada quando o oponente postureia.'
        ]
      },
      {
        heading: '3. A Escolha dos Equipamentos no Tatame do Mestre',
        description: 'O que um faixa preta experiente procura em um kimono e por que a leveza e ajuste são inegociáveis.',
        keyPoints: [
          'Preferência por rashguards com banda de silicone na cintura.',
          'Kimonos de caimento justo sem excesso de pano para pegadas inimigas.'
        ]
      }
    ],
    affiliateCallToAction: 'Inspire-se nos campeões e confira o equipamento de alta performance recomendado nesta entrevista.',
    socialHook: 'Confira nosso bate-papo exclusivo com mestres da faixa preta falando sobre disciplina, guarda e equipamentos de elite!'
  }
];

export const BlogContentStudio: React.FC<BlogContentStudioProps> = ({ onDraftCreated, productList = [] }) => {
  const [selectedTopic, setSelectedTopic] = useState<ContentIdeaTemplate>(PRE_BUILT_IDEAS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customKeyword, setCustomKeyword] = useState('');
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');

  // Custom Generator state
  const [customCategory, setCustomCategory] = useState('Guia de Kimonos');
  const [customAudience, setCustomAudience] = useState('Faixa-Branca Iniciante');
  const [customFocus, setCustomFocus] = useState('Escolha e Tamanho de Kimonos');
  const [generatedOutline, setGeneratedOutline] = useState<ContentIdeaTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCopyOutline = (idea: ContentIdeaTemplate) => {
    const text = `
=== PAUTA BLOG SEO & OUTLINE: ${idea.title} ===
Categoria: ${idea.category}
Público-Alvo: ${idea.targetAudience}
Tempo de Leitura: ${idea.readTime}
Palavras-Chave SEO: ${idea.keywords.join(', ')}

ESTRUTURA DO ARTIGO:
${idea.outline.map((sec, idx) => `
${idx + 1}. ${sec.heading}
Descrição: ${sec.description}
Pontos-Chave:
${sec.keyPoints.map(p => `  - ${p}`).join('\n')}
`).join('\n')}

PRODUTOS AFILIADOS SUGERIDOS:
${idea.suggestedProducts.map(p => `- ${p}`).join('\n')}

CHAMADA PARA AÇÃO (CTA):
${idea.affiliateCallToAction}

HOOK PARA REDES SOCIAIS:
"${idea.socialHook}"
`.trim();

    navigator.clipboard.writeText(text);
    setCopiedId(idea.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleGenerateCustom = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated: ContentIdeaTemplate = {
        id: `custom-${Date.now()}`,
        category: customCategory,
        title: `Guia Tático: ${customFocus} para ${customAudience}`,
        subtitle: `Tudo o que você precisa dominar sobre ${customFocus.toLowerCase()} com análise tática e recomendação de equipamentos.`,
        targetAudience: customAudience,
        keywords: [customFocus.toLowerCase(), 'jiu jitsu brasil', 'equipamentos bjj', customAudience.toLowerCase(), 'dicas de tatame'],
        readTime: '7 MIN',
        suggestedProducts: ['Kimono Alta Performance', 'Rashguard Compressão Pro', 'Protetor Bucal'],
        outline: [
          {
            heading: `1. Introdução Fundamental a ${customFocus}`,
            description: `Por que dominar este conceito é essencial no desenvolvimento do ${customAudience}.`,
            keyPoints: [
              'Conceitos basilares de alavanca e biomecânica do corpo.',
              'Erros clássicos cometidos no início e como corrigi-los rapidamente.'
            ]
          },
          {
            heading: '2. Passo a Passo Técnico e Execução Detalhada',
            description: 'Divisão em etapas visuais para praticar com segurança no treino diário.',
            keyPoints: [
              'Ponto de contato inicial e quebra de postura.',
              'Manutenção do controle do quadril e antecipação das reações.'
            ]
          },
          {
            heading: '3. Equipamentos e Suportes que Fazem a Diferença',
            description: 'Como utilizar vestuário apropriado para aumentar a eficiência e conforto no treino.',
            keyPoints: [
              'A importância de tecidos leves que reduzem a fadiga.',
              'Proteção articular adequada para evitar interrupções nos treinos.'
            ]
          }
        ],
        affiliateCallToAction: 'Encontre os melhores produtos de Jiu-Jitsu recomendados por especialistas no portal OSS.OS.',
        socialHook: `Quer evolução rápida em ${customFocus}? Confira nosso novo guia completo feito sob medida para ${customAudience}!`
      };
      setGeneratedOutline(generated);
      setSelectedTopic(generated);
      setIsGenerating(false);
    }, 600);
  };

  return (
    <div className="bg-zinc-950 text-white p-6 md:p-10 border border-zinc-800 shadow-2xl relative overflow-hidden my-12">
      {/* Decorative Background Elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-green-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-zinc-800 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-red-600 text-white rounded-none">
              <Sparkles size={18} />
            </span>
            <Badge className="bg-red-600/20 text-red-500 border border-red-600/40 rounded-none font-mono text-[9px] uppercase tracking-[0.3em] px-3 py-1">
              ESTÚDIO DE CONTEÚDO & SEO AFILIADO
            </Badge>
          </div>
          <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic-serif -skew-x-2">
            Pautas, Outlines & Ideias de Artigos
          </h2>
          <p className="text-xs text-zinc-400 font-sans mt-2 max-w-2xl leading-relaxed">
            Gere estruturas otimizadas para atração orgânica de praticantes, cobrindo guias de kimono, reviews de marcas, dicas de treino e entrevistas.
          </p>
        </div>

        {/* Studio Tabs */}
        <div className="flex items-center gap-2 bg-zinc-900 p-1.5 border border-zinc-800">
          <button
            onClick={() => setActiveTab('preset')}
            className={`px-4 py-2.5 text-[10px] font-mono font-black uppercase tracking-widest transition-all rounded-none flex items-center gap-2 ${
              activeTab === 'preset'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <BookOpen size={12} />
            <span>Pautas Prontas SEO</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2.5 text-[10px] font-mono font-black uppercase tracking-widest transition-all rounded-none flex items-center gap-2 ${
              activeTab === 'custom'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Cpu size={12} />
            <span>Gerador Tático IA</span>
          </button>
        </div>
      </div>

      {activeTab === 'preset' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          {/* Topics Navigation Cards */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 flex items-center gap-2">
              <Layers size={14} className="text-red-500" />
              <span>Selecione um Tópico de Valor</span>
            </h3>
            {PRE_BUILT_IDEAS.map((idea) => {
              const isSelected = selectedTopic.id === idea.id;
              return (
                <div
                  key={idea.id}
                  onClick={() => setSelectedTopic(idea)}
                  className={`p-5 cursor-pointer border transition-all text-left relative overflow-hidden group ${
                    isSelected
                      ? 'bg-zinc-900 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)]'
                      : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[9px] font-mono font-black uppercase tracking-widest px-2 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {idea.category}
                    </span>
                    <span className="text-[8px] font-mono text-zinc-400">{idea.readTime}</span>
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-tight leading-snug group-hover:text-red-500 transition-colors line-clamp-2">
                    {idea.title}
                  </h4>
                  <p className="text-[10px] text-zinc-400 line-clamp-2 mt-2 font-sans">
                    {idea.subtitle}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Selected Outline Details View */}
          <div className="lg:col-span-8 bg-zinc-900/90 border border-zinc-800 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-zinc-800">
                <div>
                  <span className="text-[9px] font-mono font-black uppercase tracking-widest text-red-500 block mb-1">
                    {selectedTopic.category} • PÚBLICO: {selectedTopic.targetAudience}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white">
                    {selectedTopic.title}
                  </h3>
                </div>
                <Button
                  onClick={() => handleCopyOutline(selectedTopic)}
                  className="bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] font-black uppercase tracking-widest px-5 py-5 rounded-none flex items-center gap-2 transition-all shadow-lg shrink-0"
                >
                  {copiedId === selectedTopic.id ? (
                    <>
                      <Check size={14} className="stroke-[3]" />
                      <span>OUTLINE COPIADO!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>COPIAR ESTRUTURA COMPLETE</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Keywords chips */}
              <div className="mb-6">
                <span className="text-[9px] font-mono font-black uppercase tracking-widest text-zinc-400 block mb-2 flex items-center gap-1.5">
                  <Tag size={12} className="text-green-500" />
                  <span>Palavras-Chave Foco em SEO:</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedTopic.keywords.map((kw, i) => (
                    <span key={i} className="text-[9px] font-mono bg-zinc-800 text-zinc-300 px-2.5 py-1 border border-zinc-700">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Structured Outline Headings */}
              <div className="space-y-6 mb-8">
                <h4 className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-300 border-b border-zinc-800 pb-2 flex items-center gap-2">
                  <FileText size={14} className="text-red-500" />
                  <span>Esqueleto do Artigo (H2 / H3 & Subtópicos)</span>
                </h4>
                {selectedTopic.outline.map((section, idx) => (
                  <div key={idx} className="bg-zinc-950/60 p-4 border-l-2 border-red-600 border-zinc-800/60">
                    <h5 className="text-xs font-black uppercase tracking-wide text-white mb-1">
                      {section.heading}
                    </h5>
                    <p className="text-[11px] text-zinc-400 mb-3 font-sans leading-relaxed">
                      {section.description}
                    </p>
                    <ul className="space-y-1.5 pl-2">
                      {section.keyPoints.map((pt, pIdx) => (
                        <li key={pIdx} className="text-[10px] text-zinc-300 font-sans flex items-start gap-2">
                          <span className="text-red-500 font-bold mt-0.5">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Affiliate & Conversion Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-zinc-800">
                <div className="bg-zinc-950 p-4 border border-zinc-800">
                  <span className="text-[9px] font-mono font-black uppercase tracking-widest text-green-500 flex items-center gap-1.5 mb-2">
                    <ShoppingBag size={12} />
                    <span>Produtos Afiliados Recomendados</span>
                  </span>
                  <ul className="space-y-1">
                    {selectedTopic.suggestedProducts.map((p, idx) => (
                      <li key={idx} className="text-[10px] font-bold text-zinc-300 flex items-center gap-2">
                        <Check size={10} className="text-green-500 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-zinc-950 p-4 border border-zinc-800">
                  <span className="text-[9px] font-mono font-black uppercase tracking-widest text-red-500 flex items-center gap-1.5 mb-2">
                    <Share2 size={12} />
                    <span>Hook de Engajamento Social</span>
                  </span>
                  <p className="text-[10px] italic text-zinc-300 font-sans leading-relaxed">
                    "{selectedTopic.socialHook}"
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Option to Draft Post in Portal */}
            {onDraftCreated && (
              <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-400">
                  Deseja carregar este esqueleto diretamente no editor de postagens do portal?
                </span>
                <Button
                  onClick={() => {
                    onDraftCreated({
                      title: selectedTopic.title,
                      excerpt: selectedTopic.subtitle,
                      category: selectedTopic.category,
                      content: selectedTopic.outline.map(s => `<h2>${s.heading}</h2><p>${s.description}</p><ul>${s.keyPoints.map(k => `<li>${k}</li>`).join('')}</ul>`).join('\n\n'),
                      readTime: selectedTopic.readTime,
                      author: 'Redação OSS.OS'
                    });
                  }}
                  className="bg-white text-black hover:bg-zinc-200 font-mono text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-none"
                >
                  Usar Como Rascunho
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Custom Generator Tab */
        <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8 relative z-10">
          <div className="max-w-3xl mx-auto space-y-6">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2 border-b border-zinc-800 pb-4">
              <Cpu className="text-red-600" size={20} />
              <span>Gerador de Pautas Personalizadas para o Portal</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-[9px] font-mono font-black uppercase tracking-widest text-zinc-400 block mb-2">
                  Categoria Principal
                </label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs font-mono p-3 uppercase tracking-wider text-white focus:border-red-600 outline-none"
                >
                  <option value="Guia de Kimonos">Guia de Kimonos</option>
                  <option value="Reviews de Marcas">Reviews de Marcas</option>
                  <option value="Dicas de Treino">Dicas de Treino & Saúde</option>
                  <option value="Entrevistas">Entrevistas & Histórias</option>
                  <option value="Técnica">Táticas & Passagens</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-mono font-black uppercase tracking-widest text-zinc-400 block mb-2">
                  Público-Alvo
                </label>
                <select
                  value={customAudience}
                  onChange={(e) => setCustomAudience(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs font-mono p-3 uppercase tracking-wider text-white focus:border-red-600 outline-none"
                >
                  <option value="Faixa-Branca Iniciante">Faixa-Branca Iniciante</option>
                  <option value="Praticante Intermediário">Praticante Intermediário</option>
                  <option value="Atleta de Competição">Atleta de Competição</option>
                  <option value="Praticante Máster 30+">Praticante Máster 30+</option>
                  <option value="Praticantes No-Gi">Praticantes No-Gi</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-mono font-black uppercase tracking-widest text-zinc-400 block mb-2">
                  Tópico ou Foco Específico
                </label>
                <input
                  type="text"
                  placeholder="Ex: Durabilidade, Dieta, Raspagens..."
                  value={customFocus}
                  onChange={(e) => setCustomFocus(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-xs font-mono p-3 text-white focus:border-red-600 outline-none uppercase tracking-wider"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerateCustom}
              disabled={isGenerating || !customFocus}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-black uppercase tracking-[0.2em] py-6 rounded-none shadow-xl transition-all"
            >
              {isGenerating ? (
                <span className="animate-pulse flex items-center gap-2">
                  <Sparkles size={16} className="animate-spin" />
                  GERANDO ESTRUTURA SEO E OUTLINE...
                </span>
              ) : (
                <span>GERAR PAUTA E ESTRUTURA TÁTICA</span>
              )}
            </Button>

            {generatedOutline && (
              <div className="mt-8 pt-8 border-t border-zinc-800 animate-fadeIn">
                <div className="bg-zinc-950 p-6 border border-zinc-800">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-green-600 text-white border-none rounded-none text-[8px] font-mono uppercase tracking-widest">
                      OUTLINE GERADO COM SUCESSO
                    </Badge>
                    <Button
                      onClick={() => handleCopyOutline(generatedOutline)}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-none"
                    >
                      Copiar Outline
                    </Button>
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-tight text-white mb-2">
                    {generatedOutline.title}
                  </h4>
                  <p className="text-xs text-zinc-400 font-sans mb-4">
                    {generatedOutline.subtitle}
                  </p>

                  <div className="space-y-4">
                    {generatedOutline.outline.map((sec, i) => (
                      <div key={i} className="p-3 bg-zinc-900 border-l-2 border-red-600">
                        <h5 className="text-xs font-bold text-white uppercase">{sec.heading}</h5>
                        <p className="text-[10px] text-zinc-400 font-sans mt-1">{sec.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogContentStudio;

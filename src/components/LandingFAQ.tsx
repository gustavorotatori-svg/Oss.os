import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ShoppingBag,
  BookOpen,
  Award,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Info,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface FAQItem {
  id: string;
  category: 'gear' | 'pricing' | 'community' | 'rules';
  categoryLabel: string;
  question: string;
  answer: React.ReactNode;
  keywords: string[];
  cta?: {
    label: string;
    targetView: string;
  };
}

interface LandingFAQProps {
  onNavigate?: (view: string) => void;
  onOpenChat?: () => void;
}

export const LandingFAQ: React.FC<LandingFAQProps> = ({ onNavigate, onOpenChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['faq-1', 'faq-4']));

  const faqData: FAQItem[] = useMemo(() => [
    {
      id: 'faq-1',
      category: 'gear',
      categoryLabel: 'Equipamentos & Kimonos',
      question: 'Como escolher o tamanho e a gramatura (GSM) ideal de Kimono?',
      answer: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <p>
            Os tamanhos de kimono são padronizados em escala alfanumérica: <strong>A0 a A5</strong> (masculino/unissex) e <strong>F1 a F4</strong> (feminino), com variações como <strong>L</strong> (Long/Membros longos) e <strong>H</strong> (Heavy/Tórax amplo).
          </p>
          <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3.5 border border-zinc-200 dark:border-zinc-800 rounded-none space-y-2">
            <div className="font-mono text-xs font-black uppercase text-black dark:text-white flex items-center gap-1.5">
              <Award size={14} className="text-green-600" />
              Guia Rápido de Gramatura (GSM - Gramas por Metro Quadrado):
            </div>
            <ul className="list-disc list-inside text-xs space-y-1 text-zinc-600 dark:text-zinc-400">
              <li><strong>Single Weave (350–420 GSM):</strong> Leve, secagem ultrarrápida, ideal para treinos no calor e para bater peso em campeonatos.</li>
              <li><strong>Pearl / Gold Weave (450–550 GSM):</strong> O padrão-ouro do BJJ; equilibra conforto térmico, alta resistência à tração e durabilidade no tatame.</li>
              <li><strong>Double Weave (650+ GSM):</strong> Extremamente denso e encorpado, dificulta muito a pegada do adversário, porém é mais quente e pesado.</li>
            </ul>
          </div>
          <p className="text-xs text-zinc-500">
            <em>Dica do Mestre:</em> Sempre considere a margem de encolhimento de 3% a 7% na primeira lavagem para tecidos pré-encolhidos.
          </p>
        </div>
      ),
      keywords: ['tamanho', 'kimono', 'gsm', 'gramatura', 'medidas', 'a1', 'a2', 'a3', 'a4', 'f1', 'f2', 'tecido', 'trançado'],
      cta: {
        label: 'Ir para Arsenal Técnico (Loja)',
        targetView: 'SHOP'
      }
    },
    {
      id: 'faq-2',
      category: 'rules',
      categoryLabel: 'Regras & Competições',
      question: 'Quais são as regras oficiais da IBJJF / CBJJ para aprovação do Kimono?',
      answer: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <p>
            Para competir em torneios oficiais regulamentados pela <strong>IBJJF</strong> e <strong>CBJJ</strong>, o kimono deve cumprir critérios rigorosos na checagem de entrada:
          </p>
          <ul className="space-y-2 text-xs">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-green-600 shrink-0 mt-0.5" />
              <span><strong>Cores Permitidas:</strong> Apenas Branco, Azul Real (Royal Blue) ou Preto unicolor. Não são permitidas combinações de cores (ex: calça azul com jaqueta branca).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-green-600 shrink-0 mt-0.5" />
              <span><strong>Gola e Espessura:</strong> Deve ter no máximo 5 cm de largura e 1,3 cm de espessura de EVA/algodão para permitir pegada justa do adversário.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-green-600 shrink-0 mt-0.5" />
              <span><strong>Comprimento de Mangas e Calça:</strong> As mangas devem atingir o pulso com os braços estendidos à frente, mantendo folga interna suficiente para aprovação no aparelho medidor oficial.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={15} className="text-green-600 shrink-0 mt-0.5" />
              <span><strong>Patches e Costuras:</strong> Patches são permitidos estritamente nas zonas autorizadas (ombros, peitoral superior, saia inferior e pernas).</span>
            </li>
          </ul>
        </div>
      ),
      keywords: ['ibjjf', 'cbjj', 'regras', 'competição', 'cor de kimono', 'patch', 'medidor', 'checagem', 'campeonato'],
      cta: {
        label: 'Ver Equipamentos Certificados',
        targetView: 'SHOP'
      }
    },
    {
      id: 'faq-3',
      category: 'gear',
      categoryLabel: 'Equipamentos & Kimonos',
      question: 'Como lavar e cuidar do Kimono e da Rash Guard para durarem anos?',
      answer: (
        <div className="space-y-2.5 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <p>
            O suor acumulado e a atrito constante nas fibras aceleram a proliferação de fungos e bactérias. Para maximizar a vida útil:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20">
              <span className="font-mono font-bold text-red-600 dark:text-red-400 uppercase block mb-1">
                ❌ O QUE NUNCA FAZER:
              </span>
              <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-400">
                <li>Nunca use água quente (encolhe e cozinha as fibras).</li>
                <li>Nunca use secadora nem alvejantes com cloro.</li>
                <li>Nunca deixe o kimono molhado acumulado no saco de treino.</li>
              </ul>
            </div>
            <div className="p-3 bg-green-500/5 dark:bg-green-500/10 border border-green-500/20">
              <span className="font-mono font-bold text-green-600 dark:text-green-400 uppercase block mb-1">
                ✅ RECOMENDAÇÕES OSS.OS:
              </span>
              <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-400">
                <li>Lave logo após o treino com sabão neutro.</li>
                <li>Adicione bicarbonato de sódio ou vinagre de álcool no enxágue.</li>
                <li>Seque sempre do avesso, à sombra e em local ventilado.</li>
              </ul>
            </div>
          </div>
        </div>
      ),
      keywords: ['lavar', 'limpeza', 'cuidados', 'durabilidade', 'cheiro', 'mau odor', 'secadora', 'encolher', 'rashguard']
    },
    {
      id: 'faq-4',
      category: 'pricing',
      categoryLabel: 'Comparador de Preços',
      question: 'Como funciona o Comparador de Preços e o algoritmo Custo por Durabilidade (CPD)?',
      answer: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <p>
            Nosso rastreador monitora em tempo real ofertas em lojas e marketplaces parceiros (Amazon, Mercado Livre, Shopee, Keiko, Venum, Kingz, etc.).
          </p>
          <div className="p-4 bg-zinc-900 text-white border-l-4 border-green-500 space-y-2">
            <span className="text-xs font-mono font-black uppercase text-green-400 flex items-center gap-1">
              <Sparkles size={13} /> O que é o Score CPD?
            </span>
            <p className="text-xs text-zinc-300 leading-normal">
              O índice de <strong>Custo por Durabilidade (CPD)</strong> cruza o preço de compra atual com a vida útil estimada em meses de tatame (baseada no histórico de avaliações e denúncias de desgaste da comunidade). Um kimono de R$ 600 que dura 3 anos custa R$ 16/mês, enquanto um de R$ 350 que rasga em 6 meses custa R$ 58/mês!
            </p>
          </div>
        </div>
      ),
      keywords: ['comparador', 'preço', 'ofertas', 'desconto', 'cpd', 'custo por durabilidade', 'rastreador', 'promoção', 'barato'],
      cta: {
        label: 'Acessar Comparador de Preços',
        targetView: 'COMPARATOR'
      }
    },
    {
      id: 'faq-5',
      category: 'pricing',
      categoryLabel: 'Comparador de Preços',
      question: 'O Diário dos Oss.os cobra alguma taxa do usuário ao clicar nas ofertas?',
      answer: (
        <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <p>
            <strong>Não! O portal é 100% gratuito para praticantes e atletas.</strong>
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Trabalhamos com links de afiliados transparentes e parcerias com as principais marcas. Quando você clica em "Ver Oferta" e conclui uma compra no e-commerce parceiro, recebemos uma pequena comissão cobrada do vendedor. Esse valor financia a infraestrutura de servidores, servidores de inteligência e apoia nossos projetos sociais de Jiu-Jitsu.
          </p>
        </div>
      ),
      keywords: ['taxa', 'gratuito', 'pago', 'afiliados', 'transparência', 'comissão', 'preço']
    },
    {
      id: 'faq-6',
      category: 'community',
      categoryLabel: 'Comunidade & Diário',
      question: 'O que é o Diário de Treinos do OSS.OS e como registrar minhas sessões?',
      answer: (
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <p>
            O <strong>Diário dos Oss.os</strong> é um registro inteligente focado na evolução do jiu-jiteiro. No módulo <em>UserDashboard / Diário</em>, você pode:
          </p>
          <ul className="list-disc list-inside text-xs space-y-1.5 text-zinc-600 dark:text-zinc-400">
            <li>Acompanhar dias consecutivos e frequência semanal no tatame (streak).</li>
            <li>Anotar técnicas estudadas (raspagens, passagens, finalizações e defesa pessoal).</li>
            <li>Contabilizar número de rolas e carga estimada de treino.</li>
            <li>Monitorar o desgaste dos seus kimonos e faixas ativas.</li>
            <li>Receber resumos visuais de consistência para a sua graduação de faixa.</li>
          </ul>
        </div>
      ),
      keywords: ['diário', 'treino', 'comunidade', 'frequência', 'faixa', 'rolas', 'técnicas', 'graduação', 'dashboard'],
      cta: {
        label: 'Abrir Meu Diário de Treinos',
        targetView: 'COMMUNITY'
      }
    },
    {
      id: 'faq-7',
      category: 'community',
      categoryLabel: 'Comunidade & Diário',
      question: 'Como o OSS.OS apoia projetos sociais e academias parceiras de BJJ?',
      answer: (
        <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <p>
            O Jiu-Jitsu é uma das ferramentas de inclusão social mais poderosas do Brasil. O projeto <strong>Diário dos Oss.os</strong> destina porcentagens dos resultados de parcerias e doações diretas para:
          </p>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-black dark:text-white">
              <Award size={14} className="text-green-600" />
              Pilares Sociais OSS.OS:
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              1. Doação de kimonos e faixas para crianças e jovens em projetos cadastrados.<br />
              2. Apoio no custeio de inscrições em campeonatos estaduais e nacionais para atletas promessas.<br />
              3. Divulgação gratuita de academias parceiras e filiadas.
            </p>
          </div>
        </div>
      ),
      keywords: ['projeto social', 'doação', 'acadêmia', 'apoio', 'inclusão', 'crianças', 'atleta', 'parceiros'],
      cta: {
        label: 'Ver Academias Parceiras',
        targetView: 'PARTNER_GYMS'
      }
    },
    {
      id: 'faq-8',
      category: 'rules',
      categoryLabel: 'Regras & Cuidados',
      question: 'Qual é a diferença entre Rash Guards com proteção UV50+ e bermudas de No-Gi?',
      answer: (
        <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <p>
            No treino sem kimono (<strong>No-Gi / Grappling</strong>), o vestuário precisa prevenir queimaduras de atrito no tatame (mat-burn) e transmitir compressão muscular adequada.
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            As <strong>Rash Guards técnicas</strong> possuem elasticidade multidirecional de 4 vias (spandex/poliéster) e proteção solar UV50+. As <strong>Bermudas de Fightwear</strong> contam com abertura lateral reforçada (split-leg) e fecho duplo de velcro com cordão interno para não escorregar durante quedas e raspagens.
          </p>
        </div>
      ),
      keywords: ['nogi', 'rashguard', 'bermuda', 'grappling', 'uv50', 'luta livre', 'fightwear']
    }
  ], []);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filteredFaqs.map(f => f.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const filteredFaqs = useMemo(() => {
    return faqData.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchQuestion = item.question.toLowerCase().includes(q);
      const matchKeywords = item.keywords.some(k => k.toLowerCase().includes(q));
      const matchCategory = item.categoryLabel.toLowerCase().includes(q);

      return matchQuestion || matchKeywords || matchCategory;
    });
  }, [faqData, selectedCategory, searchQuery]);

  return (
    <section 
      id="landing-faq-section"
      className="py-20 bg-white dark:bg-black border-t border-b border-zinc-200 dark:border-zinc-900 relative overflow-hidden"
    >
      {/* Subtle Tactical Visual Pattern Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header Block */}
        <div className="mb-10 space-y-3">
          <h2 className="text-3xl md:text-5xl font-black uppercase italic -skew-x-6 tracking-tighter text-black dark:text-white leading-none">
            PERGUNTAS <span className="text-green-600">FREQUENTES</span>
          </h2>

          <p className="text-zinc-500 dark:text-zinc-400 font-light text-sm max-w-2xl leading-relaxed">
            Respostas diretas sobre escolha de kimonos, gramaturas, aprovação na IBJJF e cuidados com equipamentos.
          </p>
        </div>

        {/* Search Bar & Category Filter Controls */}
        <div className="bg-zinc-50 dark:bg-zinc-950 p-5 border border-zinc-200 dark:border-zinc-800 mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar dúvida: ex. kimono, IBJJF, tamanho, lavagem, rastreador..."
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-black dark:text-white pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-green-600 dark:focus:border-green-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white text-xs font-mono"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Expand / Collapse Actions */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={expandAll}
                className="px-3 py-2 text-[10px] font-mono font-bold uppercase border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer"
              >
                Expandir Todos
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-2 text-[10px] font-mono font-bold uppercase border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer"
              >
                Recolher
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            <span className="text-[10px] font-mono uppercase text-zinc-400 flex items-center gap-1 shrink-0 mr-1">
              <Filter size={12} /> Categoria:
            </span>
            {[
              { id: 'all', label: 'Todas as Dúvidas' },
              { id: 'gear', label: 'Equipamentos & Kimonos' },
              { id: 'rules', label: 'Regras & IBJJF' },
              { id: 'pricing', label: 'Comparador de Preços' },
              { id: 'community', label: 'Comunidade & Diário' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-[10px] font-mono font-black uppercase tracking-wider whitespace-nowrap border transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                    : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:text-black dark:hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        {filteredFaqs.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 space-y-3">
            <HelpCircle size={32} className="mx-auto text-zinc-400" />
            <h4 className="font-mono font-bold text-sm uppercase text-black dark:text-white">
              Nenhuma dúvida encontrada para "{searchQuery}"
            </h4>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Tente buscar com outros termos como "kimono", "tamanho", "rastreador" ou limpe os filtros selecionados.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black text-xs font-mono font-bold uppercase transition-all cursor-pointer"
            >
              Resetar Busca
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isExpanded = expandedIds.has(faq.id);

              return (
                <div
                  key={faq.id}
                  className={`border transition-all ${
                    isExpanded
                      ? 'border-black dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-md'
                      : 'border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40 hover:border-zinc-400 dark:hover:border-zinc-700'
                  }`}
                >
                  {/* Accordion Question Header */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-none text-[8px] uppercase font-mono font-bold py-0.5 px-2">
                          {faq.categoryLabel}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-black dark:text-white leading-snug">
                        {faq.question}
                      </h3>
                    </div>

                    <div className={`p-2 border transition-all shrink-0 mt-1 ${
                      isExpanded
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                        : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'
                    }`}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {/* Accordion Answer Content */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 border-t border-zinc-150 dark:border-zinc-900 space-y-4">
                          {faq.answer}

                          {/* Interactive Action Link */}
                          {faq.cta && onNavigate && (
                            <div className="pt-2">
                              <button
                                onClick={() => onNavigate(faq.cta!.targetView)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-black hover:bg-green-600 text-white dark:bg-white dark:hover:bg-green-600 dark:text-black dark:hover:text-white text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
                              >
                                <span>{faq.cta.label}</span>
                                <ArrowRight size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Contact / Direct Support CTA Box */}
        <div className="mt-12 p-6 sm:p-8 bg-zinc-900 text-white border-l-4 border-green-500 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-lg font-black uppercase tracking-tight flex items-center justify-center md:justify-start gap-2">
              <MessageSquare size={18} className="text-green-500" />
              Não encontrou a resposta para o seu equipamento ou dúvida?
            </h4>
            <p className="text-xs text-zinc-400 max-w-xl">
              Nossa equipe de praticantes e curadores de BJJ e o assistente virtual do OSS.OS estão prontos para ajudar você a escolher o gear ideal ou tirar dúvidas de regulamento.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onOpenChat && (
              <button
                onClick={onOpenChat}
                className="px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-mono text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm flex items-center gap-2"
              >
                <Sparkles size={14} />
                Perguntar à IA OSS.OS
              </button>
            )}
            {onNavigate && (
              <button
                onClick={() => onNavigate('CONTACT')}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-black uppercase tracking-widest border border-zinc-700 transition-all cursor-pointer"
              >
                Fale Conosco
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingFAQ;

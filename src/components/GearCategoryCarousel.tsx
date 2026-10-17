import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Shield, 
  ShoppingBag, 
  Flame, 
  Layers, 
  ArrowRight,
  Sparkles,
  Trophy,
  BookOpen,
  GraduationCap,
  Dumbbell,
  Award,
  PackageCheck
} from 'lucide-react';
import { Category, Product } from '../types';
import { KimonoIcon } from './KimonoLoader';

export interface GearCategoryCarouselProps {
  productList?: Product[];
  selectedCategory: Category | 'All';
  onSelectCategory: (category: Category | 'All') => void;
  onNavigate: (view: string) => void;
  className?: string;
}

interface CategoryItem {
  id: Category | 'All';
  title: string;
  tag: string;
  subtitle: string;
  kanji: string;
  icon: React.ReactNode;
  accentColor: string;
  borderAccent: string;
  gradientBg: string;
  bgImage: string;
  isFeaturedCategory?: boolean;
}

const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: 'Equipamentos para Iniciantes',
    title: 'Equipamentos para Iniciantes',
    tag: 'STARTER PACK / INICIANTE',
    subtitle: 'Kimonos Leves de Entrada, Faixas Brancas & Kits Primeiro Treino',
    kanji: '初',
    icon: <Award size={20} className="text-emerald-400" />,
    accentColor: 'text-emerald-400',
    borderAccent: 'border-emerald-500',
    gradientBg: 'from-emerald-950/90 via-zinc-900/60 to-zinc-950/90',
    bgImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
    isFeaturedCategory: true
  },
  {
    id: 'Roupas de Competição',
    title: 'Roupas de Competição',
    tag: 'IBJJF APPROVED / COMPETIÇÃO',
    subtitle: 'Gis Trançados 450-550 GSM, Rashguards Graduadas & Fight Shorts Pro',
    kanji: '勝',
    icon: <Trophy size={20} className="text-amber-400" />,
    accentColor: 'text-amber-400',
    borderAccent: 'border-amber-500',
    gradientBg: 'from-amber-950/90 via-zinc-900/60 to-zinc-950/90',
    bgImage: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=600&auto=format&fit=crop',
    isFeaturedCategory: true
  },
  {
    id: 'Acessórios de Treino',
    title: 'Acessórios de Treino',
    tag: 'TATAME ESSENTIALS',
    subtitle: 'Protetores Bucais Moldáveis, Orelheiras, Joelheiras 7mm & Bolsas',
    kanji: '具',
    icon: <PackageCheck size={20} className="text-blue-400" />,
    accentColor: 'text-blue-400',
    borderAccent: 'border-blue-500',
    gradientBg: 'from-blue-950/90 via-zinc-900/60 to-zinc-950/90',
    bgImage: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?q=80&w=600&auto=format&fit=crop',
    isFeaturedCategory: true
  },
  {
    id: 'Nutrição Esportiva',
    title: 'Nutrição Esportiva',
    tag: 'PERFORMANCE & RECOVERY',
    subtitle: 'Creatina Creapure®, Whey Isolado, Eletrólitos & Repositores',
    kanji: '力',
    icon: <Flame size={20} className="text-orange-400" />,
    accentColor: 'text-orange-400',
    borderAccent: 'border-orange-500',
    gradientBg: 'from-orange-950/90 via-zinc-900/60 to-zinc-950/90',
    bgImage: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=600&auto=format&fit=crop',
    isFeaturedCategory: true
  },
  {
    id: 'Livros/DVDs de Técnicas',
    title: 'Livros/DVDs de Técnicas',
    tag: 'ESTUDO & INSTRUÇÃO',
    subtitle: 'Cursos Online de Meia Guarda, E-books Técnicos & Instrucionais No-Gi',
    kanji: '術',
    icon: <GraduationCap size={20} className="text-purple-400" />,
    accentColor: 'text-purple-400',
    borderAccent: 'border-purple-500',
    gradientBg: 'from-purple-950/90 via-zinc-900/60 to-zinc-950/90',
    bgImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop',
    isFeaturedCategory: true
  },
  {
    id: 'Kimonos',
    title: 'Kimonos & Gis',
    tag: 'TRANÇADOS TRADICIONAIS',
    subtitle: 'Trançados Leves, Gold Weave, Ripstop e Edições Limitadas',
    kanji: '着',
    icon: <KimonoIcon size={20} className="text-current" />,
    accentColor: 'text-zinc-900 dark:text-zinc-100',
    borderAccent: 'border-zinc-900 dark:border-zinc-100',
    gradientBg: 'from-zinc-900/90 via-zinc-900/60 to-zinc-950/90',
    bgImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'Rashguards',
    title: 'Rashguards No-Gi',
    tag: 'COMPRESSÃO UV50+',
    subtitle: 'Manga Longa, Curta & Modelagens de Alta Durabilidade',
    kanji: '衣',
    icon: <Zap size={18} className="text-amber-500" />,
    accentColor: 'text-amber-500',
    borderAccent: 'border-amber-500',
    gradientBg: 'from-amber-950/90 via-zinc-900/60 to-zinc-950/90',
    bgImage: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'Faixas',
    title: 'Faixas de Graduação',
    tag: 'BRANCA À PRETA',
    subtitle: 'Costuras Reforçadas, Ponteira Vermelha e Graus Oficiais',
    kanji: '帯',
    icon: <Shield size={18} className="text-red-500" />,
    accentColor: 'text-red-500',
    borderAccent: 'border-red-500',
    gradientBg: 'from-red-950/90 via-zinc-900/60 to-zinc-950/90',
    bgImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'All',
    title: 'Todos os Equipamentos',
    tag: 'CATÁLOGO GERAL',
    subtitle: 'Rastreador com acervo completo de ofertas ao vivo',
    kanji: '全',
    icon: <Layers size={18} className="text-green-500" />,
    accentColor: 'text-green-500',
    borderAccent: 'border-green-500',
    gradientBg: 'from-green-950/90 via-zinc-900/60 to-zinc-950/90',
    bgImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop'
  }
];

export const GearCategoryCarousel: React.FC<GearCategoryCarouselProps> = ({
  productList = [],
  selectedCategory,
  onSelectCategory,
  onNavigate,
  className = ''
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getCategoryCount = (categoryId: Category | 'All'): number => {
    if (categoryId === 'All') return productList.length;
    
    // Custom Jiu-Jitsu Portal Categories Filter Logic
    if (categoryId === 'Equipamentos para Iniciantes') {
      return productList.filter(p => 
        p.category === 'Equipamentos para Iniciantes' ||
        p.practitionerLevel === 'Iniciante' ||
        (p.category === 'Faixas' && (p.beltColor === 'Branca' || p.title.toLowerCase().includes('branca'))) ||
        p.title.toLowerCase().includes('iniciante') ||
        p.title.toLowerCase().includes('primeiro') ||
        p.title.toLowerCase().includes('entry') ||
        (p.subCategory && p.subCategory.toLowerCase().includes('iniciante'))
      ).length;
    }

    if (categoryId === 'Roupas de Competição') {
      return productList.filter(p => 
        p.category === 'Roupas de Competição' ||
        p.practitionerLevel === 'Avançado' ||
        (p.category === 'Kimonos' && (p.title.toLowerCase().includes('mundial') || p.title.toLowerCase().includes('challenger') || p.title.toLowerCase().includes('onyx') || p.title.toLowerCase().includes('ryu') || p.title.toLowerCase().includes('h1x') || (p.price && p.price > 400))) ||
        (p.category === 'Rashguards' && (p.title.toLowerCase().includes('ibjjf') || p.title.toLowerCase().includes('neo-tiger') || p.title.toLowerCase().includes('oficial') || p.title.toLowerCase().includes('series'))) ||
        (p.category === 'Bermudas' && (p.title.toLowerCase().includes('tora-ko') || p.title.toLowerCase().includes('boardshorts') || p.title.toLowerCase().includes('combat'))) ||
        (p.category === 'Faixas' && (p.beltColor === 'Azul' || p.beltColor === 'Roxa' || p.beltColor === 'Marrom' || p.beltColor === 'Preta'))
      ).length;
    }

    if (categoryId === 'Acessórios de Treino') {
      return productList.filter(p => 
        p.category === 'Acessórios de Treino' ||
        p.category === 'Acessórios' ||
        p.category === 'Equipamentos de Proteção' ||
        p.category === 'Protetores' ||
        p.category === 'Tatames' ||
        p.productType === 'Acessório' ||
        p.productType === 'Equipamento'
      ).length;
    }

    if (categoryId === 'Nutrição Esportiva') {
      return productList.filter(p => 
        p.category === 'Nutrição Esportiva' ||
        p.category === 'Suplementos' ||
        p.category === 'Nutrição' ||
        p.productType === 'Suplemento' ||
        p.title.toLowerCase().includes('creatina') ||
        p.title.toLowerCase().includes('whey')
      ).length;
    }

    if (categoryId === 'Livros/DVDs de Técnicas') {
      return productList.filter(p => 
        p.category === 'Livros/DVDs de Técnicas' ||
        p.category === 'Cursos Online' ||
        p.category === 'E-books' ||
        p.category === 'Serviços' ||
        p.category === 'Conteúdo Digital' ||
        p.productType === 'Serviço' ||
        p.title.toLowerCase().includes('livro') ||
        p.title.toLowerCase().includes('curso') ||
        p.title.toLowerCase().includes('instrucional') ||
        p.title.toLowerCase().includes('e-book') ||
        p.title.toLowerCase().includes('workshop')
      ).length;
    }

    if (categoryId === 'Equipamentos de Proteção') {
      return productList.filter(p => p.category === 'Equipamentos de Proteção' || p.category === 'Protetores').length;
    }
    return productList.filter(p => p.category === categoryId).length;
  };

  const handleCategoryClick = (categoryId: Category | 'All') => {
    onSelectCategory(categoryId);
    onNavigate('SHOP');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className={`w-full bg-white dark:bg-black py-10 border-b border-zinc-200 dark:border-zinc-850 relative overflow-hidden ${className}`}>
      {/* Background Japanese Watermark */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-9xl font-black text-black/[0.02] dark:text-white/[0.02] select-none pointer-events-none font-sans">
        武道
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Header with Title and Scroll Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
              <span className="text-[9px] font-mono font-black uppercase tracking-[0.25em] text-red-600 dark:text-red-400">
                SELEÇÃO TÉCNICA // CATEGORIAS DE TATAME
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase italic -skew-x-6 tracking-tighter text-black dark:text-white leading-none">
              EQUIPAMENTOS DE JIU-JITSU
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              Explore o catálogo organizado por categoria técnica e filtre instantaneamente na loja
            </p>
          </div>

          {/* Carousel Navigation Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="w-9 h-9 border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white flex items-center justify-center shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#ffffff] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
              aria-label="Rolar categorias para a esquerda"
            >
              <ChevronLeft size={18} className="stroke-[2.5px]" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="w-9 h-9 border-2 border-black dark:border-white bg-white dark:bg-zinc-950 text-black dark:text-white flex items-center justify-center shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#ffffff] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
              aria-label="Rolar categorias para a direita"
            >
              <ChevronRight size={18} className="stroke-[2.5px]" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrolling Track */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-1 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {CATEGORIES_DATA.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = getCategoryCount(cat.id);

            return (
              <motion.div
                key={cat.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick(cat.id)}
                className={`snap-start shrink-0 w-[240px] sm:w-[270px] group relative overflow-hidden cursor-pointer border-2 transition-all duration-300 bg-white dark:bg-zinc-950 flex flex-col justify-between ${
                  isSelected
                    ? 'border-green-600 dark:border-green-500 shadow-[6px_6px_0px_#16a34a]'
                    : 'border-black dark:border-zinc-800 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#27272a] hover:border-black dark:hover:border-white hover:shadow-[6px_6px_0px_#000000] dark:hover:shadow-[6px_6px_0px_#ffffff]'
                }`}
              >
                {/* Visual Top Header Image Frame */}
                <div className="relative h-28 w-full overflow-hidden bg-zinc-900 border-b-2 border-black dark:border-zinc-800">
                  <img
                    src={cat.bgImage}
                    alt={cat.title}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-110 group-hover:brightness-90 transition-all duration-700"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradientBg} opacity-80 group-hover:opacity-60 transition-opacity`} />

                  {/* Japanese Kanji Accent */}
                  <span className="absolute top-2 right-3 text-3xl font-black text-white/20 group-hover:text-white/40 select-none pointer-events-none font-sans transition-colors">
                    {cat.kanji}
                  </span>

                  {/* Tag Pill */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-black/90 text-white border border-white/20 font-mono font-black text-[7.5px] uppercase tracking-widest px-2 py-0.5">
                      {cat.tag}
                    </span>
                  </div>

                  {/* Icon + Category Name inside Image */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between z-10 text-white">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-black/80 backdrop-blur-sm border border-white/20">
                        {cat.icon}
                      </div>
                      <span className="font-mono font-black text-xs uppercase tracking-wider text-white drop-shadow-md">
                        {cat.title}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body Details */}
                <div className="p-4 flex flex-col justify-between flex-1 bg-white dark:bg-zinc-950">
                  <div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium line-clamp-2 leading-relaxed mb-3">
                      {cat.subtitle}
                    </p>
                  </div>

                  {/* Footer with Count and Arrow CTA */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                        {count} {count === 1 ? 'Produto' : 'Produtos'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[9px] font-mono font-black uppercase tracking-wider text-black dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      <span>VER</span>
                      <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Selected Bottom Indicator */}
                {isSelected && (
                  <div className="h-1 w-full bg-green-600 dark:bg-green-500" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GearCategoryCarousel;

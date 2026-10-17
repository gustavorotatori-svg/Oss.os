import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Search, X, SlidersHorizontal, Star, Filter, Tag, Zap, 
  RotateCcw, Award, Check, ChevronDown, ChevronUp, Layers, 
  Sparkles, TrendingUp, DollarSign, ShieldCheck, Dumbbell, 
  BookOpen, Shirt, Flame, ArrowUpDown, Trophy, CheckCircle2
} from 'lucide-react';
import { Category, Product, PopularityFilter } from '../types';
import { Slider } from '@/components/ui/slider';
import { getProductPractitionerLevel, matchesCategoryFilter } from '../lib/filterUtils';

export interface AdvancedSearchSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: Category | 'All';
  setSelectedCategory: (cat: Category | 'All') => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  maxProductPrice: number;
  selectedBrands: string[];
  setSelectedBrands: (brands: string[]) => void;
  availableBrands: string[];
  selectedRating: number;
  setSelectedRating: (rating: number) => void;
  selectedPopularity?: string;
  setSelectedPopularity?: (popularity: string) => void;
  selectedPractitionerLevels: string[];
  setSelectedPractitionerLevels: (levels: string[]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onOpenFilterDrawer: () => void;
  onOpenAiFilter?: () => void;
  onOpenSeoOptimizer?: () => void;
  totalProductsCount: number;
  filteredProductsCount: number;
  productList: Product[];
  className?: string;
}

export interface PortalCategoryItem {
  id: Category | 'All';
  label: string;
  shortLabel: string;
  icon: string;
  description?: string;
}

export const PORTAL_CATEGORIES: PortalCategoryItem[] = [
  { id: 'All', label: 'Todas as Categorias', shortLabel: 'Todos', icon: '⚡' },
  { id: 'Kimonos', label: 'Kimonos (Gi Tradicional)', shortLabel: 'Kimonos', icon: '🥋', description: 'Armaduras trançadas leves, pro e de competição' },
  { id: 'Rashguards', label: 'Rashguards (No-Gi Compressão)', shortLabel: 'Rashguards', icon: '👕', description: 'Segunda pele UV50+ e proteção antimicrobiana' },
  { id: 'Suplementos', label: 'Suplementos & Nutrição Esportiva', shortLabel: 'Suplementos', icon: '⚡', description: 'Creatina, Whey CFM, Eletrólitos e Recovery' },
  { id: 'Faixas', label: 'Faixas & Graduações BJJ', shortLabel: 'Faixas', icon: '🎗️', description: 'Da Faixa Branca à Faixa Preta oficial IBJJF' },
  { id: 'Bermudas', label: 'Bermudas & Shorts Grappling', shortLabel: 'Bermudas', icon: '🩳', description: 'Sem velcro externo com abertura lateral' },
  { id: 'Equipamentos de Proteção', label: 'Equipamentos de Proteção & Bucais', shortLabel: 'Proteção', icon: '🛡️', description: 'Protetores bucais, joelheiras e orelheiras' },
  { id: 'Tatames', label: 'Tatames, Pisos & Revestimento', shortLabel: 'Tatames', icon: '🟩', description: 'Módulos EVA de alta densidade e lona vinílica' },
  { id: 'Cursos Online', label: 'Cursos Online & Livros Técnicos', shortLabel: 'Cursos/Livros', icon: '📚', description: 'Instrucionais de passagens, guardas e finalizações' },
  { id: 'Acessórios', label: 'Acessórios, Mochilas & Fitas', shortLabel: 'Acessórios', icon: '🎒', description: 'Finger tape, mochilas de combate e garrafas térmicas' },
];

const SEARCH_SUGGESTIONS = [
  'Kimono Trançado Leve',
  'Rashguard No-Gi IBJJF',
  'Creatina Creapure',
  'Faixa Preta Algodão Pesado',
  'Protetor Bucal Moldável',
  'Livro Passagem de Guarda',
  'Shorts Grappling Venum',
  'Kimono Jiujiteiro H1X'
];

export const AdvancedSearchSection: React.FC<AdvancedSearchSectionProps> = ({
  searchQuery = '',
  setSearchQuery = (_q: string) => {},
  selectedCategory = 'All',
  setSelectedCategory = (_cat: Category | 'All') => {},
  priceRange = [0, 2000],
  setPriceRange = (_range: [number, number]) => {},
  maxProductPrice = 2000,
  selectedBrands = [],
  setSelectedBrands = (_brands: string[]) => {},
  availableBrands = [],
  selectedRating = 0,
  setSelectedRating = (_rating: number) => {},
  selectedPopularity = 'all',
  setSelectedPopularity = (_pop: string) => {},
  selectedPractitionerLevels = [],
  setSelectedPractitionerLevels = (_levels: string[]) => {},
  sortBy = 'featured',
  setSortBy = (_sort: string) => {},
  onOpenFilterDrawer = () => {},
  onOpenAiFilter,
  onOpenSeoOptimizer,
  totalProductsCount = 0,
  filteredProductsCount = 0,
  productList = [],
  className = ''
}) => {
  const { t } = useTranslation();
  const [isAdvancedFiltersExpanded, setIsAdvancedFiltersExpanded] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 640;
    }
    return true;
  });
  const [brandSearchInput, setBrandSearchInput] = useState<string>('');
  const [minPriceInput, setMinPriceInput] = useState<string>(String(priceRange[0]));
  const [maxPriceInput, setMaxPriceInput] = useState<string>(String(priceRange[1]));

  // Sync inputs when priceRange prop changes
  React.useEffect(() => {
    setMinPriceInput(String(priceRange[0]));
    setMaxPriceInput(String(priceRange[1]));
  }, [priceRange]);

  // Count products by category with unified alias matching
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: productList.length };
    PORTAL_CATEGORIES.forEach(cat => {
      if (cat.id === 'All') return;
      counts[cat.id] = productList.filter(p => matchesCategoryFilter(p, cat.id)).length;
    });
    return counts;
  }, [productList]);

  // Count products by brand
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    productList.forEach(p => {
      if (p.brand) {
        counts[p.brand] = (counts[p.brand] || 0) + 1;
      }
    });
    return counts;
  }, [productList]);

  // Count products by rating tier
  const ratingCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4.5: 0, 4: 0, 3.5: 0, 3: 0 };
    productList.forEach(p => {
      const r = p.rating || 0;
      if (r >= 5) counts[5]++;
      if (r >= 4.5) counts[4.5]++;
      if (r >= 4) counts[4]++;
      if (r >= 3.5) counts[3.5]++;
      if (r >= 3) counts[3]++;
    });
    return counts;
  }, [productList]);

  // Count products by practitioner level
  const practitionerLevelCounts = useMemo(() => {
    const counts: Record<string, number> = { Iniciante: 0, Intermediário: 0, Avançado: 0 };
    productList.forEach(p => {
      const lvl = getProductPractitionerLevel(p);
      if (lvl === 'Iniciante') {
        counts.Iniciante++;
      } else if (lvl === 'Intermediário') {
        counts.Intermediário++;
      } else if (lvl === 'Avançado') {
        counts.Avançado++;
      } else if (lvl === 'Todos') {
        counts.Iniciante++;
        counts.Intermediário++;
        counts.Avançado++;
      }
    });
    return counts;
  }, [productList]);

  // Count products by popularity tier
  const popularityCounts = useMemo(() => {
    let high = 0;
    let bestSellers = 0;
    let trending = 0;
    let champions = 0;

    productList.forEach(p => {
      const pop = p.popularity ?? (p.salesCount ? p.salesCount * 0.8 : ((p.rating || 4) * 18));
      if (pop >= 70 || (p.salesCount && p.salesCount >= 100)) high++;
      if ((p.salesCount && p.salesCount >= 120) || (p.popularity && p.popularity >= 85) || p.isBestPrice) bestSellers++;
      if ((p.trendScore && p.trendScore >= 80) || (p.popularity && p.popularity >= 80) || (p.tags && p.tags.some(t => t.toLowerCase().includes('destaque') || t.toLowerCase().includes('ibjjf')))) trending++;
      if (p.practitionerLevel === 'Avançado' || (p.tags && p.tags.some(t => t.toLowerCase().includes('pro') || t.toLowerCase().includes('campeão')))) champions++;
    });

    return {
      all: productList.length,
      popular: high,
      best_sellers: bestSellers,
      trending: trending,
      champions: champions
    };
  }, [productList]);

  // Filter available brands by search
  const filteredBrandsList = useMemo(() => {
    if (!brandSearchInput.trim()) return availableBrands;
    return availableBrands.filter(b => 
      b.toLowerCase().includes(brandSearchInput.toLowerCase().trim())
    );
  }, [availableBrands, brandSearchInput]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedCategory !== 'All') count++;
    if (priceRange[0] > 0 || priceRange[1] < maxProductPrice) count++;
    if (selectedBrands.length > 0) count += selectedBrands.length;
    if (selectedRating > 0) count++;
    if (selectedPopularity && selectedPopularity !== 'all') count++;
    if (selectedPractitionerLevels.length > 0) count += selectedPractitionerLevels.length;
    return count;
  }, [searchQuery, selectedCategory, priceRange, maxProductPrice, selectedBrands, selectedRating, selectedPopularity, selectedPractitionerLevels]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setPriceRange([0, maxProductPrice]);
    setSelectedBrands([]);
    setSelectedRating(0);
    if (setSelectedPopularity) setSelectedPopularity('all');
    setSelectedPractitionerLevels([]);
    setSortBy('relevance');
  };

  const toggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const toggleLevel = (level: string) => {
    if (selectedPractitionerLevels.includes(level)) {
      setSelectedPractitionerLevels(selectedPractitionerLevels.filter(l => l !== level));
    } else {
      setSelectedPractitionerLevels([...selectedPractitionerLevels, level]);
    }
  };

  const applyPricePreset = (min: number, max: number) => {
    const newMin = Math.max(0, min);
    const newMax = Math.min(max, maxProductPrice);
    setPriceRange([newMin, newMax]);
  };

  const handlePriceInputApply = () => {
    const parsedMin = Math.max(0, parseInt(minPriceInput) || 0);
    const parsedMax = Math.min(maxProductPrice, Math.max(parsedMin, parseInt(maxPriceInput) || maxProductPrice));
    setPriceRange([parsedMin, parsedMax]);
  };

  return (
    <section 
      className={`w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300 ${className}`}
      id="advanced-search-system"
      aria-label="Sistema de Busca Avançada de Jiu-Jitsu"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        
        {/* TOP ROW: Header Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black dark:text-white font-headline">
                Catálogo de Equipamentos
              </h2>
              <span className="text-[11px] font-mono text-zinc-500 font-bold bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 border border-zinc-200 dark:border-zinc-800">
                {filteredProductsCount} de {totalProductsCount} itens
              </span>
            </div>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-0.5">
              Curadoria técnica filtrada para o praticante do tatame
            </p>
          </div>

          {/* Action Tools: AI Assistant Button & Drawer Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenAiFilter && (
              <button
                type="button"
                id="btn-trigger-ai-filter"
                onClick={onOpenAiFilter}
                className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-500 text-white font-mono text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                title="Refinar busca por biotipo e estilo"
              >
                <Sparkles size={13} />
                <span>Recomendador BJJ</span>
              </button>
            )}

            <button
              type="button"
              id="btn-trigger-filter-drawer"
              onClick={onOpenFilterDrawer}
              className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-black font-mono text-xs font-black uppercase tracking-wider shadow-xs transition-all cursor-pointer"
              title={t('filter.title', { defaultValue: 'Abrir painel lateral de filtros' })}
            >
              <SlidersHorizontal size={14} />
              <span>{t('filter.title', { defaultValue: 'Filtros' })}</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-mono font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* SEARCH BAR & FILTER ACCORDION TOGGLE */}
        <div className="space-y-3">
          <div className="flex items-center bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-700 focus-within:border-red-600 dark:focus-within:border-red-500 transition-colors shadow-sm">
            <div className="pl-4 text-zinc-400 flex items-center justify-center">
              <Search size={18} />
            </div>
            <input
              type="text"
              id="input-advanced-search-query"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('header.search_placeholder', { defaultValue: 'Buscar por kimono, rashguard, suplementos, marcas ou faixa...' })}
              className="w-full bg-transparent px-3 py-3.5 text-sm font-sans text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
              aria-label="Buscar equipamentos"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-2 mr-1 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                title="Limpar busca"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsAdvancedFiltersExpanded(!isAdvancedFiltersExpanded)}
              className={`px-4 py-3.5 border-l border-zinc-200 dark:border-zinc-700 font-mono text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                isAdvancedFiltersExpanded 
                  ? 'bg-red-600 text-white' 
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-750'
              }`}
              id="btn-toggle-advanced-filters"
            >
              <Filter size={13} />
              <span className="hidden sm:inline">Filtros Táticos</span>
              {activeFiltersCount > 0 && !isAdvancedFiltersExpanded && (
                <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-mono font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              {isAdvancedFiltersExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* QUICK CATEGORY SELECTOR BAR (ALWAYS ACCESSIBLE) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 pb-1">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest shrink-0 pr-1 flex items-center gap-1">
              <Layers size={11} className="text-red-500" />
              Categorias:
            </span>
            {PORTAL_CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat.id;
              const count = categoryCounts[cat.id] ?? 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-600 text-white border-red-600 shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600'
                  }`}
                  title={cat.description || cat.label}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.shortLabel}</span>
                  <span className={`text-[9px] ${isSelected ? 'text-white/80' : 'text-zinc-400 dark:text-zinc-500'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search Suggestions */}
          {!searchQuery && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs pt-0.5">
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest shrink-0">
                {t('header.popular_suggestions', { defaultValue: 'Sugestões Rápidas:' })}
              </span>
              {SEARCH_SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setSearchQuery(sug)}
                  className="shrink-0 px-2 py-0.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white hover:border-zinc-400 text-[9px] font-mono transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* EXPANDED 5-COLUMN ADVANCED FILTERS PANEL */}
        <AnimatePresence>
          {isAdvancedFiltersExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/50 p-4 sm:p-5 space-y-5"
              id="advanced-filters-panel"
            >
              {/* FILTERS STATUS HEADER BAR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <span className="text-[11px] font-mono font-black uppercase tracking-wider text-black dark:text-white">
                    Filtros Avançados de Busca BJJ
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    (5 critérios: Categoria, Marca, Preço, Nível Técnico & Avaliação)
                  </span>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-[10px] font-mono text-red-600 dark:text-red-400 hover:underline font-bold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                  >
                    <RotateCcw size={11} />
                    <span>Resetar Todos os Filtros ({activeFiltersCount})</span>
                  </button>
                )}
              </div>

              {/* 5 DEDICATED COLUMNS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                
                {/* 1. CATEGORIAS DE JIU-JITSU */}
                <div className="space-y-3 bg-white dark:bg-zinc-950 p-3.5 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Layers size={13} className="text-red-500" />
                        <h3 className="text-[10px] font-mono font-black uppercase tracking-wider text-black dark:text-white">
                          1. Categoria
                        </h3>
                      </div>
                      {selectedCategory !== 'All' && (
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('All')}
                          className="text-[9px] font-mono text-red-600 hover:underline font-bold"
                        >
                          Limpar
                        </button>
                      )}
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                      {PORTAL_CATEGORIES.map(cat => {
                        const isSelected = selectedCategory === cat.id;
                        const count = categoryCounts[cat.id] ?? 0;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`w-full px-2.5 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center justify-between border transition-all ${
                              isSelected
                                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                                : 'bg-zinc-50 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <span>{cat.icon}</span>
                              <span className="truncate">{cat.shortLabel}</span>
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[8px] opacity-75">({count})</span>
                              {isSelected && <Check size={11} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-[8px] font-mono text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-900">
                    {selectedCategory === 'All' ? 'Todas as categorias ativas' : `Filtro: ${selectedCategory}`}
                  </div>
                </div>

                {/* 2. MARCAS HOMOLOGADAS */}
                <div className="space-y-3 bg-white dark:bg-zinc-950 p-3.5 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Tag size={13} className="text-red-600" />
                        <h3 className="text-[10px] font-mono font-black uppercase tracking-wider text-black dark:text-white">
                          2. Marca ({availableBrands.length})
                        </h3>
                      </div>
                      {selectedBrands.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedBrands([])}
                          className="text-[9px] font-mono text-red-600 hover:underline font-bold"
                        >
                          Limpar ({selectedBrands.length})
                        </button>
                      )}
                    </div>

                    {/* Brand Search input */}
                    <input
                      type="text"
                      value={brandSearchInput}
                      onChange={(e) => setBrandSearchInput(e.target.value)}
                      placeholder="Filtrar marca..."
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-1 text-xs font-mono text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-red-600 mb-1.5"
                    />

                    {/* Brands List */}
                    <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                      {filteredBrandsList.map(brand => {
                        const isSelected = selectedBrands.includes(brand);
                        const count = brandCounts[brand] || 0;
                        return (
                          <button
                            key={brand}
                            type="button"
                            onClick={() => toggleBrand(brand)}
                            className={`w-full px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center justify-between border transition-all ${
                              isSelected
                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black border-black dark:border-white shadow-xs'
                                : 'bg-zinc-50 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                            }`}
                          >
                            <span className="truncate">{brand}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[8px] opacity-75">({count})</span>
                              {isSelected && <Check size={11} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-[8px] font-mono text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-900">
                    {selectedBrands.length === 0 ? 'Nenhuma restrição' : `${selectedBrands.length} marca(s) selecionada(s)`}
                  </div>
                </div>

                {/* 3. FAIXA DE PREÇO */}
                <div className="space-y-3 bg-white dark:bg-zinc-950 p-3.5 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Zap size={13} className="text-green-600" />
                        <h3 className="text-[10px] font-mono font-black uppercase tracking-wider text-black dark:text-white">
                          3. Faixa de Preço
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono font-black text-green-600">
                        R$ {priceRange[0]} - R$ {priceRange[1]}
                      </span>
                    </div>

                    <div className="py-1 px-1">
                      <Slider
                        defaultValue={[0, maxProductPrice]}
                        max={maxProductPrice}
                        step={10}
                        value={priceRange}
                        onValueChange={(val) => setPriceRange(val as [number, number])}
                        className="py-1.5"
                      />
                      <div className="flex justify-between text-[8px] font-mono text-zinc-400 uppercase pt-0.5">
                        <span>R$ 0</span>
                        <span>R$ {maxProductPrice}</span>
                      </div>
                    </div>

                    {/* Manual Min/Max Inputs */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="flex-1">
                        <label className="text-[8px] font-mono text-zinc-400 uppercase block mb-0.5">Mín</label>
                        <input
                          type="number"
                          value={minPriceInput}
                          onChange={(e) => setMinPriceInput(e.target.value)}
                          onBlur={handlePriceInputApply}
                          onKeyDown={(e) => e.key === 'Enter' && handlePriceInputApply()}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-1.5 py-1 text-xs font-mono text-black dark:text-white focus:outline-none focus:border-green-600"
                        />
                      </div>
                      <span className="text-zinc-400 text-xs mt-3">-</span>
                      <div className="flex-1">
                        <label className="text-[8px] font-mono text-zinc-400 uppercase block mb-0.5">Máx</label>
                        <input
                          type="number"
                          value={maxPriceInput}
                          onChange={(e) => setMaxPriceInput(e.target.value)}
                          onBlur={handlePriceInputApply}
                          onKeyDown={(e) => e.key === 'Enter' && handlePriceInputApply()}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-1.5 py-1 text-xs font-mono text-black dark:text-white focus:outline-none focus:border-green-600"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handlePriceInputApply}
                        className="mt-3 px-2 py-1 bg-green-600 text-white font-mono text-[9px] font-bold hover:bg-green-500 uppercase transition-colors"
                      >
                        OK
                      </button>
                    </div>

                    {/* Quick Presets */}
                    <div className="grid grid-cols-2 gap-1 pt-2 text-[8px] font-mono font-bold">
                      <button
                        type="button"
                        onClick={() => applyPricePreset(0, 150)}
                        className={`p-1 border text-left truncate transition-all ${
                          priceRange[0] === 0 && priceRange[1] === 150
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                        }`}
                      >
                        Até R$ 150
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPricePreset(150, 350)}
                        className={`p-1 border text-left truncate transition-all ${
                          priceRange[0] === 150 && priceRange[1] === 350
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                        }`}
                      >
                        R$ 150 - 350
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPricePreset(350, 700)}
                        className={`p-1 border text-left truncate transition-all ${
                          priceRange[0] === 350 && priceRange[1] === 700
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                        }`}
                      >
                        R$ 350 - 700
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPricePreset(700, maxProductPrice)}
                        className={`p-1 border text-left truncate transition-all ${
                          priceRange[0] === 700 && priceRange[1] === maxProductPrice
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                        }`}
                      >
                        Acima de R$ 700
                      </button>
                    </div>
                  </div>

                  <div className="text-[8px] font-mono text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-900">
                    Preços tabelados e comparados em tempo real
                  </div>
                </div>

                {/* 4. TIPO DE PRATICANTE */}
                <div className="space-y-3 bg-white dark:bg-zinc-950 p-3.5 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Award size={13} className="text-blue-500" />
                        <h3 className="text-[10px] font-mono font-black uppercase tracking-wider text-black dark:text-white">
                          4. Nível do Praticante
                        </h3>
                      </div>
                      {selectedPractitionerLevels.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedPractitionerLevels([])}
                          className="text-[9px] font-mono text-red-600 hover:underline font-bold"
                        >
                          Limpar
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {[
                        { 
                          id: 'Iniciante', 
                          title: 'Iniciante (Faixa Branca)', 
                          icon: '🔰',
                          desc: 'Custo-benefício & durabilidade para os primeiros rolas'
                        },
                        { 
                          id: 'Intermediário', 
                          title: 'Intermediário (Azul & Roxa)', 
                          icon: '🥋',
                          desc: 'Treinos intensos, leveza e secagem rápida'
                        },
                        { 
                          id: 'Avançado', 
                          title: 'Avançado (Marrom & Preta)', 
                          icon: '🏆',
                          desc: 'Alta performance, lapela vulcanizada & padrão IBJJF'
                        }
                      ].map(level => {
                        const isSelected = selectedPractitionerLevels.includes(level.id);
                        const count = practitionerLevelCounts[level.id] || 0;
                        return (
                          <button
                            key={level.id}
                            type="button"
                            onClick={() => toggleLevel(level.id)}
                            className={`w-full p-2 text-left border transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-zinc-50 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                            }`}
                          >
                            <div className="flex items-center justify-between font-mono text-[9px] font-black uppercase">
                              <span className="flex items-center gap-1.5 truncate">
                                <span>{level.icon}</span>
                                <span className="truncate">{level.title}</span>
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[8px] opacity-80">({count})</span>
                                {isSelected && <Check size={11} />}
                              </div>
                            </div>
                            <p className={`text-[8px] font-sans mt-0.5 line-clamp-1 ${isSelected ? 'text-white/80' : 'text-zinc-400'}`}>
                              {level.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-[8px] font-mono text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-900">
                    {selectedPractitionerLevels.length === 0 ? 'Adequado para todos os níveis' : `${selectedPractitionerLevels.join(', ')}`}
                  </div>
                </div>

                {/* 5. AVALIAÇÕES MÍNIMAS */}
                <div className="space-y-3 bg-white dark:bg-zinc-950 p-3.5 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Star size={13} className="text-yellow-500 fill-yellow-500" />
                        <h3 className="text-[10px] font-mono font-black uppercase tracking-wider text-black dark:text-white">
                          5. Avaliação Mínima
                        </h3>
                      </div>
                      {selectedRating > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedRating(0)}
                          className="text-[9px] font-mono text-red-600 hover:underline font-bold"
                        >
                          Todas
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      {[5, 4.5, 4, 3.5, 3].map(ratingValue => {
                        const isSelected = selectedRating === ratingValue;
                        const count = ratingCounts[ratingValue] || 0;
                        return (
                          <button
                            key={ratingValue}
                            type="button"
                            onClick={() => setSelectedRating(selectedRating === ratingValue ? 0 : ratingValue)}
                            className={`w-full px-2 py-1.5 text-[9px] font-mono font-bold uppercase border flex items-center justify-between transition-all ${
                              isSelected
                                ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500 font-black shadow-xs'
                                : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center text-yellow-500">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    size={10}
                                    className={i < Math.floor(ratingValue) ? 'fill-yellow-500 text-yellow-500' : 'text-zinc-300 dark:text-zinc-700'}
                                  />
                                ))}
                              </div>
                              <span className="text-[8px]">
                                {ratingValue === 5 ? '5.0 Máx' : `${ratingValue}+`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[8px] opacity-75">({count})</span>
                              {isSelected && <Check size={11} className="text-yellow-500" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-[8px] font-mono text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-900">
                    {selectedRating > 0 ? `Filtrando: ${selectedRating}+ estrelas` : 'Exibindo todas as avaliações'}
                  </div>
                </div>

              </div>

              {/* BOTTOM CONTROLS: POPULARITY & SORTING */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                {/* Popularity Shortcuts */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-mono uppercase text-zinc-400 font-black flex items-center gap-1">
                    <Flame size={12} className="text-orange-500" />
                    Popularidade:
                  </span>
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'popular', label: '🔥 Em Alta' },
                    { id: 'best_sellers', label: '⭐ Best-Sellers' },
                    { id: 'trending', label: '⚡ Destaques' },
                  ].map(pop => (
                    <button
                      key={pop.id}
                      type="button"
                      onClick={() => setSelectedPopularity && setSelectedPopularity(pop.id)}
                      className={`px-2 py-1 text-[9px] font-mono font-bold uppercase border transition-all ${
                        selectedPopularity === pop.id
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                      }`}
                    >
                      {pop.label}
                    </button>
                  ))}
                </div>

                {/* Sort Selector */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-[9px] font-mono uppercase text-zinc-400 font-black shrink-0">
                    Ordenar por:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-2 py-1 text-xs font-mono text-black dark:text-white focus:outline-none focus:border-red-600 font-bold"
                  >
                    <option value="popularity">🔥 Mais Populares & Vendidos</option>
                    <option value="relevance">⚡ Relevância Match</option>
                    <option value="rating">⭐ Mais Bem Avaliados</option>
                    <option value="price-asc">💰 Menor Preço</option>
                    <option value="price-desc">💎 Maior Preço</option>
                    <option value="discount-desc">🏷️ Maiores Descontos</option>
                    <option value="name-asc">🔤 Nome (A-Z)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DYNAMIC ACTIVE FILTER CHIPS ROW */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-mono uppercase font-black text-zinc-400 flex items-center gap-1 mr-1">
              <Filter size={11} className="text-red-500" />
              Filtros Ativos ({activeFiltersCount}):
            </span>

            {/* Search Query Chip */}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-mono text-[9px] font-bold">
                <span>Busca: "{searchQuery}"</span>
                <button type="button" onClick={() => setSearchQuery('')} className="hover:text-black dark:hover:text-white" title="Remover filtro">
                  <X size={10} />
                </button>
              </span>
            )}

            {/* Category Chip */}
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black font-mono text-[9px] font-bold">
                <span>Categoria: {selectedCategory}</span>
                <button type="button" onClick={() => setSelectedCategory('All')} className="text-red-400 hover:text-red-500" title="Remover categoria">
                  <X size={10} />
                </button>
              </span>
            )}

            {/* Price Chip */}
            {(priceRange[0] > 0 || priceRange[1] < maxProductPrice) && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-50 dark:bg-green-950/60 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 font-mono text-[9px] font-bold">
                <span>Preço: R$ {priceRange[0]} - R$ {priceRange[1]}</span>
                <button type="button" onClick={() => setPriceRange([0, maxProductPrice])} className="hover:text-black dark:hover:text-white" title="Remover filtro">
                  <X size={10} />
                </button>
              </span>
            )}

            {/* Brands Chips */}
            {(selectedBrands || []).map(b => (
              <span key={b} className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-mono text-[9px] font-bold">
                <span>Marca: {b}</span>
                <button type="button" onClick={() => toggleBrand(b)} className="hover:text-red-600" title="Remover marca">
                  <X size={10} />
                </button>
              </span>
            ))}

            {/* Practitioner Levels Chips */}
            {(selectedPractitionerLevels || []).map(l => (
              <span key={l} className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-mono text-[9px] font-bold">
                <span>Nível: {l}</span>
                <button type="button" onClick={() => toggleLevel(l)} className="hover:text-red-600" title="Remover nível">
                  <X size={10} />
                </button>
              </span>
            ))}

            {/* Rating Chip */}
            {selectedRating > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-yellow-50 dark:bg-yellow-950/60 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 font-mono text-[9px] font-bold">
                <span>Avaliação: {selectedRating}+ ★</span>
                <button type="button" onClick={() => setSelectedRating(0)} className="hover:text-red-600" title="Remover filtro de estrelas">
                  <X size={10} />
                </button>
              </span>
            )}

            {/* Popularity Chip */}
            {selectedPopularity && selectedPopularity !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 font-mono text-[9px] font-bold">
                <span>Popularidade: {
                  selectedPopularity === 'popular' ? '🔥 Em Alta' : 
                  selectedPopularity === 'best_sellers' ? '⭐ Best-Sellers' : 
                  selectedPopularity === 'trending' ? '⚡ Destaques' : '🏆 Pro Level'
                }</span>
                <button type="button" onClick={() => setSelectedPopularity && setSelectedPopularity('all')} className="hover:text-red-600" title="Remover filtro">
                  <X size={10} />
                </button>
              </span>
            )}

            {/* Clear All Button */}
            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-mono text-[9px] font-black uppercase transition-colors shadow-xs cursor-pointer"
              title="Resetar todos os filtros"
            >
              <RotateCcw size={10} />
              <span>Limpar Todos</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

export default AdvancedSearchSection;

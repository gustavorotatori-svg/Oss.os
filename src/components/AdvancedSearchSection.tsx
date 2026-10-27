import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, X, SlidersHorizontal, Star, Filter, Tag, Zap, 
  RotateCcw, Award, Check, ChevronDown, ChevronUp, Layers, 
  Sparkles, TrendingUp, DollarSign, ShieldCheck, Dumbbell, 
  BookOpen, Shirt, Flame, ArrowUpDown, Trophy, CheckCircle2
} from 'lucide-react';
import { Category, Product, PopularityFilter } from '../types';
import { Slider } from '@/components/ui/slider';

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
  const [isAdvancedFiltersExpanded, setIsAdvancedFiltersExpanded] = useState<boolean>(false);
  const [brandSearchInput, setBrandSearchInput] = useState<string>('');
  const [minPriceInput, setMinPriceInput] = useState<string>(String(priceRange[0]));
  const [maxPriceInput, setMaxPriceInput] = useState<string>(String(priceRange[1]));

  // Sync inputs when priceRange prop changes
  React.useEffect(() => {
    setMinPriceInput(String(priceRange[0]));
    setMaxPriceInput(String(priceRange[1]));
  }, [priceRange]);

  // Count products by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: productList.length };
    productList.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
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

  // Filter available brands by internal search
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* TOP ROW: Header Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black dark:text-white font-headline">
                Catálogo de Equipamentos
              </h2>
              <span className="text-[11px] font-mono text-zinc-500 font-bold">
                ({filteredProductsCount} {filteredProductsCount === 1 ? 'item' : 'itens'})
              </span>
            </div>
          </div>

          {/* Action Tools: AI Assistant Button & Drawer Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenAiFilter && (
              <button
                type="button"
                id="btn-trigger-ai-filter"
                onClick={onOpenAiFilter}
                className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-500 text-white font-mono text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
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
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-black font-mono text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              title="Abrir painel lateral completo de filtros"
            >
              <SlidersHorizontal size={14} />
              <span>Painel Completo</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-mono font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* SEARCH BAR WITH AUTOCOMPLETE & EXPAND CONTROLS */}
        <div className="relative">
          <div className="flex items-center bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-700 focus-within:border-red-600 dark:focus-within:border-red-500 transition-colors shadow-sm">
            <div className="pl-4 text-zinc-400 flex items-center justify-center">
              <Search size={18} />
            </div>
            <input
              type="text"
              id="input-advanced-search-query"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por kimono, rashguard, suplementos, marcas (ex: Venum, Atama), faixas, cursos..."
              className="w-full bg-transparent px-3 py-3.5 text-sm font-sans text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
              aria-label="Buscar equipamentos de Jiu-Jitsu"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-2 mr-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                title="Limpar termo de busca"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsAdvancedFiltersExpanded(!isAdvancedFiltersExpanded)}
              className={`px-4 py-3.5 border-l border-zinc-200 dark:border-zinc-700 font-mono text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                isAdvancedFiltersExpanded 
                  ? 'bg-red-600 text-white' 
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-750'
              }`}
            >
              <Filter size={13} />
              <span className="hidden sm:inline">Filtros Táticos</span>
              {isAdvancedFiltersExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* Quick Search Suggestions */}
          {!searchQuery && (
            <div className="flex items-center gap-2 pt-2 overflow-x-auto no-scrollbar text-xs">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest shrink-0">
                Sugestões:
              </span>
              {SEARCH_SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setSearchQuery(sug)}
                  className="shrink-0 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-zinc-400 text-[10px] font-mono transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ADVANCED FILTER CRITERIA (PRICE, BRANDS, RATINGS, POPULARITY, LEVEL, SORT) */}
        <AnimatePresence>
          {isAdvancedFiltersExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/40 p-4 sm:p-5 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* A. FAIXA DE PREÇO (PRICE RANGE) */}
                <div className="space-y-3 bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-850 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Zap size={14} className="text-green-600" />
                        <h2 className="text-[10px] font-mono font-black uppercase tracking-wider text-black dark:text-white">
                          2. Faixa de Preço (R$)
                        </h2>
                      </div>
                      <span className="text-xs font-mono font-black text-green-600">
                        R$ {priceRange[0]} - R$ {priceRange[1]}
                      </span>
                    </div>

                    <div className="py-2 px-1">
                      <Slider
                        defaultValue={[0, maxProductPrice]}
                        max={maxProductPrice}
                        step={10}
                        value={priceRange}
                        onValueChange={(val) => setPriceRange(val as [number, number])}
                        className="py-2"
                      />
                      <div className="flex justify-between text-[9px] font-mono text-zinc-400 uppercase pt-1">
                        <span>R$ 0</span>
                        <span>R$ {maxProductPrice}</span>
                      </div>
                    </div>

                    {/* Manual Min/Max Inputs */}
                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex-1">
                        <label className="text-[8px] font-mono text-zinc-400 uppercase block mb-0.5">Mín (R$)</label>
                        <input
                          type="number"
                          value={minPriceInput}
                          onChange={(e) => setMinPriceInput(e.target.value)}
                          onBlur={handlePriceInputApply}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-1 text-xs font-mono text-black dark:text-white focus:outline-none focus:border-green-600"
                        />
                      </div>
                      <span className="text-zinc-400 text-xs mt-3">-</span>
                      <div className="flex-1">
                        <label className="text-[8px] font-mono text-zinc-400 uppercase block mb-0.5">Máx (R$)</label>
                        <input
                          type="number"
                          value={maxPriceInput}
                          onChange={(e) => setMaxPriceInput(e.target.value)}
                          onBlur={handlePriceInputApply}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-1 text-xs font-mono text-black dark:text-white focus:outline-none focus:border-green-600"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handlePriceInputApply}
                        className="mt-3 px-2 py-1 bg-green-600 text-white font-mono text-[10px] font-bold hover:bg-green-500 uppercase transition-colors"
                      >
                        OK
                      </button>
                    </div>
                  </div>

                  {/* Price Presets */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                    <span className="text-[8px] font-mono uppercase text-zinc-400 tracking-wider block">
                      Atalhos Rápidos de Preço:
                    </span>
                    <div className="grid grid-cols-2 gap-1 text-[9px] font-mono font-bold">
                      <button
                        type="button"
                        onClick={() => applyPricePreset(0, 150)}
                        className={`p-1.5 border text-left transition-all ${
                          priceRange[0] === 0 && priceRange[1] === 150
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                        }`}
                      >
                        Até R$ 150 (Econômico)
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPricePreset(150, 350)}
                        className={`p-1.5 border text-left transition-all ${
                          priceRange[0] === 150 && priceRange[1] === 350
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                        }`}
                      >
                        R$ 150 - R$ 350 (No-Gi/Shorts)
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPricePreset(350, 700)}
                        className={`p-1.5 border text-left transition-all ${
                          priceRange[0] === 350 && priceRange[1] === 700
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                        }`}
                      >
                        R$ 350 - R$ 700 (Kimonos Pro)
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPricePreset(700, maxProductPrice)}
                        className={`p-1.5 border text-left transition-all ${
                          priceRange[0] === 700 && priceRange[1] === maxProductPrice
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                        }`}
                      >
                        Acima de R$ 700 (Flagships)
                      </button>
                    </div>
                  </div>
                </div>

                {/* B. MARCAS POPULARES (POPULAR BRANDS) */}
                <div className="space-y-3 bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-850 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Tag size={14} className="text-red-600" />
                        <h2 className="text-[10px] font-mono font-black uppercase tracking-wider text-black dark:text-white">
                          3. Marcas Homologadas ({availableBrands.length})
                        </h2>
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

                    {/* Search Brands input */}
                    <input
                      type="text"
                      value={brandSearchInput}
                      onChange={(e) => setBrandSearchInput(e.target.value)}
                      placeholder="Filtrar marca (ex: Venum, Koral)..."
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1.5 text-xs font-mono text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-red-600 mb-2"
                    />

                    {/* Brands List Chips */}
                    <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                      {filteredBrandsList.map(brand => {
                        const isSelected = selectedBrands.includes(brand);
                        const count = brandCounts[brand] || 0;
                        return (
                          <button
                            key={brand}
                            type="button"
                            onClick={() => toggleBrand(brand)}
                            className={`w-full px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-between border transition-all ${
                              isSelected
                                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                                : 'bg-zinc-50 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                            }`}
                          >
                            <span className="truncate">{brand}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] opacity-75">({count})</span>
                              {isSelected && <Check size={11} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedBrands.length > 0 && (
                    <div className="text-[9px] font-mono text-zinc-400 pt-1">
                      {selectedBrands.length} marca(s) selecionada(s)
                    </div>
                  )}
                </div>

                {/* C. AVALIAÇÕES (RATINGS - A PARTIR DE X ESTRELAS) */}
                <div className="space-y-3 bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-850 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <h2 className="text-[10px] font-mono font-black uppercase tracking-wider text-black dark:text-white">
                          4. Avaliação (a partir de)
                        </h2>
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

                    <div className="space-y-1.5">
                      {[5, 4.5, 4, 3.5, 3].map(ratingValue => {
                        const isSelected = selectedRating === ratingValue;
                        const count = ratingCounts[ratingValue] || 0;
                        return (
                          <button
                            key={ratingValue}
                            type="button"
                            onClick={() => setSelectedRating(selectedRating === ratingValue ? 0 : ratingValue)}
                            className={`w-full px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase border flex items-center justify-between transition-all ${
                              isSelected
                                ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500 font-black'
                                : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex items-center text-yellow-500">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    size={11}
                                    className={i < Math.floor(ratingValue) ? 'fill-yellow-500 text-yellow-500' : 'text-zinc-300 dark:text-zinc-700'}
                                  />
                                ))}
                              </div>
                              <span className="text-[9px]">
                                {ratingValue === 5 ? '5.0 (Nota Máxima)' : `${ratingValue}+ Estrelas`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] opacity-75 font-mono">({count})</span>
                              {isSelected && <Check size={12} className="text-yellow-500" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-[9px] font-sans text-zinc-400 italic">
                    Notas computadas com base em avaliações verificadas de atletas do tatame.
                  </p>
                </div>

                {/* D. POPULARIDADE & ORDENAÇÃO DINÂMICA */}
                <div className="space-y-3 bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-850 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Flame size={14} className="text-orange-500" />
                        <h2 className="text-[10px] font-mono font-black uppercase tracking-wider text-black dark:text-white">
                          5. Popularidade & Ordenação
                        </h2>
                      </div>
                    </div>

                    {/* Popularity Filter Buttons */}
                    <div className="space-y-1 mb-3">
                      <label className="text-[8px] font-mono uppercase text-zinc-400 tracking-wider block">
                        Filtro de Popularidade:
                      </label>
                      <div className="grid grid-cols-2 gap-1 text-[9px] font-mono font-bold">
                        <button
                          type="button"
                          onClick={() => setSelectedPopularity && setSelectedPopularity('all')}
                          className={`p-1.5 border text-left flex items-center justify-between transition-all ${
                            selectedPopularity === 'all'
                              ? 'bg-orange-600 text-white border-orange-600 font-black'
                              : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                          }`}
                        >
                          <span>Todos</span>
                          <span className="text-[8px] opacity-80">({popularityCounts.all})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedPopularity && setSelectedPopularity('popular')}
                          className={`p-1.5 border text-left flex items-center justify-between transition-all ${
                            selectedPopularity === 'popular'
                              ? 'bg-orange-600 text-white border-orange-600 font-black'
                              : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                          }`}
                        >
                          <span className="flex items-center gap-1">🔥 Em Alta</span>
                          <span className="text-[8px] opacity-80">({popularityCounts.popular})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedPopularity && setSelectedPopularity('best_sellers')}
                          className={`p-1.5 border text-left flex items-center justify-between transition-all ${
                            selectedPopularity === 'best_sellers'
                              ? 'bg-orange-600 text-white border-orange-600 font-black'
                              : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                          }`}
                        >
                          <span className="flex items-center gap-1">⭐ Best-Sellers</span>
                          <span className="text-[8px] opacity-80">({popularityCounts.best_sellers})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedPopularity && setSelectedPopularity('trending')}
                          className={`p-1.5 border text-left flex items-center justify-between transition-all ${
                            selectedPopularity === 'trending'
                              ? 'bg-orange-600 text-white border-orange-600 font-black'
                              : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                          }`}
                        >
                          <span className="flex items-center gap-1">⚡ Destaques</span>
                          <span className="text-[8px] opacity-80">({popularityCounts.trending})</span>
                        </button>
                      </div>
                    </div>

                    {/* Sort Selector */}
                    <div className="space-y-1">
                      <label className="text-[8px] font-mono uppercase text-zinc-400 tracking-wider block">
                        Ordenar Resultados:
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-1.5 text-xs font-mono text-black dark:text-white focus:outline-none focus:border-red-600 font-bold"
                      >
                        <option value="popularity">🔥 Mais Populares & Vendidos</option>
                        <option value="relevance">⚡ Relevância OSS.OS Match</option>
                        <option value="rating">⭐ Mais Bem Avaliados (★ ↘)</option>
                        <option value="price-asc">💰 Menor Preço (R$ ↗)</option>
                        <option value="price-desc">💎 Maior Preço (R$ ↘)</option>
                        <option value="discount-desc">🏷️ Maiores Descontos (% OFF)</option>
                        <option value="name-asc">🔤 Nome do Produto (A-Z)</option>
                      </select>
                    </div>
                  </div>

                  {/* Practitioner Levels */}
                  <div className="space-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                    <label className="text-[8px] font-mono uppercase text-zinc-400 tracking-wider block">
                      Nível de Prática:
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {['Iniciante', 'Intermediário', 'Avançado'].map(level => {
                        const isSelected = selectedPractitionerLevels.includes(level);
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => toggleLevel(level)}
                            className={`p-1 text-[8px] font-mono font-bold uppercase border text-center transition-all ${
                              isSelected
                                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                                : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                            }`}
                          >
                            {level === 'Iniciante' ? 'Iniciante' : level === 'Intermediário' ? 'Interm.' : 'Avançado'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. DYNAMIC ACTIVE FILTER CHIPS ROW */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] font-mono uppercase font-black text-zinc-400 flex items-center gap-1">
              <Filter size={11} />
              Filtros Ativos ({activeFiltersCount}):
            </span>

            {/* Search Query Chip */}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-mono text-[10px] font-bold">
                <span>Busca: "{searchQuery}"</span>
                <button type="button" onClick={() => setSearchQuery('')} className="hover:text-black dark:hover:text-white" title="Remover filtro">
                  <X size={11} />
                </button>
              </span>
            )}

            {/* Category Chip */}
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] font-bold">
                <span>Categoria: {selectedCategory}</span>
                <button type="button" onClick={() => setSelectedCategory('All')} className="text-red-400 hover:text-red-500" title="Remover filtro">
                  <X size={11} />
                </button>
              </span>
            )}

            {/* Price Chip */}
            {(priceRange[0] > 0 || priceRange[1] < maxProductPrice) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-950/60 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 font-mono text-[10px] font-bold">
                <span>Preço: R$ {priceRange[0]} - R$ {priceRange[1]}</span>
                <button type="button" onClick={() => setPriceRange([0, maxProductPrice])} className="hover:text-black dark:hover:text-white" title="Remover filtro">
                  <X size={11} />
                </button>
              </span>
            )}

            {/* Brands Chips */}
            {(selectedBrands || []).map(b => (
              <span key={b} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-mono text-[10px] font-bold">
                <span>Marca: {b}</span>
                <button type="button" onClick={() => toggleBrand(b)} className="hover:text-red-600" title="Remover marca">
                  <X size={11} />
                </button>
              </span>
            ))}

            {/* Rating Chip */}
            {selectedRating > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 dark:bg-yellow-950/60 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 font-mono text-[10px] font-bold">
                <span>Avaliação: {selectedRating}+ ★</span>
                <button type="button" onClick={() => setSelectedRating(0)} className="hover:text-red-600" title="Remover filtro de estrelas">
                  <X size={11} />
                </button>
              </span>
            )}

            {/* Popularity Chip */}
            {selectedPopularity && selectedPopularity !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 font-mono text-[10px] font-bold">
                <span>Popularidade: {
                  selectedPopularity === 'popular' ? '🔥 Em Alta' : 
                  selectedPopularity === 'best_sellers' ? '⭐ Best-Sellers' : 
                  selectedPopularity === 'trending' ? '⚡ Destaques' : '🏆 Pro Level'
                }</span>
                <button type="button" onClick={() => setSelectedPopularity && setSelectedPopularity('all')} className="hover:text-red-600" title="Remover filtro de popularidade">
                  <X size={11} />
                </button>
              </span>
            )}

            {/* Practitioner Levels Chips */}
            {(selectedPractitionerLevels || []).map(l => (
              <span key={l} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-mono text-[10px] font-bold">
                <span>Nível: {l}</span>
                <button type="button" onClick={() => toggleLevel(l)} className="hover:text-red-600" title="Remover nível">
                  <X size={11} />
                </button>
              </span>
            ))}

            {/* Clear All Button */}
            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-mono text-[10px] font-black uppercase transition-colors shadow-sm"
              title="Resetar todos os filtros"
            >
              <RotateCcw size={11} />
              <span>Limpar Todos os Filtros</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
export default AdvancedSearchSection;

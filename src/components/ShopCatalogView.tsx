import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { List as VirtualList, useListRef } from 'react-window';
import { 
  ShoppingBag, Flame, Sparkles, Filter, SlidersHorizontal, 
  RotateCcw, ArrowRight, ShieldCheck, Award, BookOpen, 
  ExternalLink, Layers, Search, ChevronRight, Check, Eye, Zap, RefreshCw
} from 'lucide-react';
import { Category, Product } from '../types';
import PremiumProductCard from './PremiumProductCard';
import AdvancedSearchSection from './AdvancedSearchSection';
import { CategoryHierarchyNav } from './CategoryHierarchyNav';
import { DealHighlightBanner } from './DealHighlightBanner';
import { DynamicSizeChart } from './DynamicSizeChart';
import { WolfWisdom } from '@/components/WolfWisdom';
import { LandingFAQ } from './LandingFAQ';
import { PartnerGyms } from './PartnerGyms';
import { AIProductFilter } from './AIProductFilter';
import KimonoFoldingLoader from './KimonoFoldingLoader';
import { CinematicHero } from './CinematicHero';
import { OfflineCatalogBar } from './OfflineCatalogBar';

interface VirtualProductRowProps {
  index: number;
  style: React.CSSProperties;
  ariaAttributes?: {
    "aria-posinset": number;
    "aria-setsize": number;
    role: "listitem";
  };
  rows: Product[][];
  columnCount: number;
  onQuickView: (product: Product) => void;
  onCheckout: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  wishlist: Set<string>;
  onToggleWishlist: (id: string) => void;
  comparedProductIds?: Set<string>;
  onToggleCompare: (product: Product) => void;
  wishlistAlerts?: Set<string>;
  onToggleAlert?: (productId: string, targetPrice?: number, channels?: { push: boolean; email: boolean; app: boolean }, notificationEmail?: string) => void;
  onOpenReviews?: (product: Product) => void;
  onOpenSeoOptimizer?: (productId?: string) => void;
}

const VirtualProductRow: React.FC<VirtualProductRowProps> = ({
  index,
  style,
  rows,
  columnCount,
  onQuickView,
  onCheckout,
  onAddToCart,
  wishlist,
  onToggleWishlist,
  comparedProductIds,
  onToggleCompare,
  wishlistAlerts,
  onToggleAlert,
  onOpenReviews,
  onOpenSeoOptimizer
}) => {
  const rowProducts = rows[index] || [];

  return (
    <div
      style={{
        ...style,
        paddingBottom: '24px',
        boxSizing: 'border-box'
      }}
      className="w-full"
    >
      <div
        className="grid gap-6 h-full"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`
        }}
      >
        {rowProducts.map((product) => (
          <div key={product.id} className="h-full">
            <PremiumProductCard
              product={product}
              onQuickView={onQuickView}
              onCheckout={onCheckout}
              onQuickBuy={onCheckout}
              onAddToCart={onAddToCart}
              isInWishlist={wishlist.has(product.id)}
              onToggleWishlist={onToggleWishlist}
              isComparing={comparedProductIds ? comparedProductIds.has(product.id) : false}
              onToggleCompare={onToggleCompare}
              isAlertActive={wishlistAlerts?.has(product.id)}
              onToggleAlert={onToggleAlert}
              onOpenReviews={onOpenReviews}
              onOpenSeoOptimizer={onOpenSeoOptimizer ? (p) => onOpenSeoOptimizer(p.id) : undefined}
            />
          </div>
        ))}
        {rowProducts.length < columnCount &&
          Array.from({ length: columnCount - rowProducts.length }).map((_, i) => (
            <div key={`empty-slot-${i}`} className="hidden sm:block" />
          ))
        }
      </div>
    </div>
  );
};

export interface ShopCatalogViewProps {
  productList: Product[];
  filteredProducts: Product[];
  paginatedProducts: Product[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
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
  setSelectedPopularity?: (pop: string) => void;
  selectedPractitionerLevels: string[];
  setSelectedPractitionerLevels: (levels: string[]) => void;
  selectedSubCategories?: string[];
  setSelectedSubCategories?: (subs: string[] | ((prev: string[]) => string[])) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onOpenFilterDrawer: () => void;
  onQuickView: (product: Product) => void;
  onCheckout: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  wishlist: Set<string>;
  onToggleWishlist: (id: string) => void;
  comparedProductIds?: Set<string>;
  onToggleCompare: (product: Product) => void;
  wishlistAlerts?: Set<string>;
  onToggleAlert?: (productId: string, targetPrice?: number, channels?: { push: boolean; email: boolean; app: boolean }, notificationEmail?: string) => void;
  onNavigate: (view: any) => void;
  onOpenReviews?: (product: Product) => void;
  onOpenSeoOptimizer?: (productId?: string) => void;
}

export const ShopCatalogView: React.FC<ShopCatalogViewProps> = ({
  productList = [],
  filteredProducts = [],
  paginatedProducts = [],
  currentPage = 1,
  totalPages = 1,
  setCurrentPage = (_page: number | ((prev: number) => number)) => {},
  searchQuery = '',
  setSearchQuery = (_query: string) => {},
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
  selectedSubCategories = [],
  setSelectedSubCategories = (_subs: string[] | ((prev: string[]) => string[])) => {},
  sortBy = 'featured',
  setSortBy = (_sort: string) => {},
  onOpenFilterDrawer = () => {},
  onQuickView = (_product: Product) => {},
  onCheckout = (_product: Product) => {},
  onAddToCart = (_product: Product) => {},
  wishlist = new Set(),
  onToggleWishlist = (_id: string) => {},
  comparedProductIds = new Set(),
  onToggleCompare = (_product: Product) => {},
  wishlistAlerts = new Set(),
  onToggleAlert = (_productId: string, _targetPrice?: number, _channels?: { push: boolean; email: boolean; app: boolean }, _notificationEmail?: string) => {},
  onNavigate = (_view: any) => {},
  onOpenReviews,
  onOpenSeoOptimizer
}) => {
  const { t } = useTranslation();
  const listRef = useListRef();
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'virtualized' | 'grid'>('virtualized');
  const [isVirtualizedAll, setIsVirtualizedAll] = useState(false);
  const [columnCount, setColumnCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 4;
    const w = window.innerWidth;
    if (w < 640) return 1;
    if (w < 768) return 2;
    if (w < 1024) return 3;
    return 4;
  });
  const [showAiFilterModal, setShowAiFilterModal] = useState(false);
  const [showSizeCalculator, setShowSizeCalculator] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isManualDemoActive, setIsManualDemoActive] = useState(false);
  const isFirstMount = useRef(true);

  // Responsive column count based on viewport/container width
  useEffect(() => {
    const updateColumns = () => {
      const elWidth = containerRef.current?.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 1200);
      if (elWidth < 600) {
        setColumnCount(1);
      } else if (elWidth < 840) {
        setColumnCount(2);
      } else if (elWidth < 1140) {
        setColumnCount(3);
      } else {
        setColumnCount(4);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Monitor filter criteria changes to trigger the Kimono Folding Animation
  const filterKey = useMemo(() => {
    return [
      searchQuery,
      selectedCategory,
      priceRange[0],
      priceRange[1],
      selectedBrands.join(','),
      selectedRating,
      selectedPopularity,
      selectedPractitionerLevels.join(','),
      (selectedSubCategories || []).join(','),
      sortBy
    ].join('|');
  }, [
    searchQuery,
    selectedCategory,
    priceRange,
    selectedBrands,
    selectedRating,
    selectedPopularity,
    selectedPractitionerLevels,
    selectedSubCategories,
    sortBy
  ]);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setIsFiltering(false);
    }, 120);
    return () => clearTimeout(timer);
  }, [filterKey]);

  // Virtualization rows grouping & dynamic dimension calculations
  const displayProducts = useMemo(() => {
    return isVirtualizedAll ? filteredProducts : paginatedProducts;
  }, [isVirtualizedAll, filteredProducts, paginatedProducts]);

  const rows = useMemo(() => {
    const items = displayProducts || [];
    const chunked: Product[][] = [];
    for (let i = 0; i < items.length; i += columnCount) {
      chunked.push(items.slice(i, i + columnCount));
    }
    return chunked;
  }, [displayProducts, columnCount]);

  const rowHeight = useMemo(() => {
    if (columnCount === 1) return 590;
    if (columnCount === 2) return 570;
    return 560;
  }, [columnCount]);

  const listHeight = useMemo(() => {
    if (rows.length === 0) return 320;
    if (rows.length === 1) return rowHeight + 10;
    const maxViewport = typeof window !== 'undefined' && window.innerHeight ? Math.max(520, Math.min(800, window.innerHeight - 200)) : 740;
    return Math.min(rows.length * rowHeight, maxViewport);
  }, [rows.length, rowHeight]);

  useEffect(() => {
    if (listRef.current?.scrollToRow) {
      listRef.current.scrollToRow({ index: 0, behavior: 'instant' });
    }
  }, [filterKey, currentPage, isVirtualizedAll, viewMode]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setPriceRange([0, maxProductPrice]);
    setSelectedBrands([]);
    setSelectedRating(0);
    if (setSelectedPopularity) setSelectedPopularity('all');
    setSelectedPractitionerLevels([]);
    setSortBy('relevance');
  };

  return (
    <div className="w-full space-y-8 pb-16">
      
      {/* 0. CINEMATIC BJJ HERO (REEL CINEMATOGRÁFICO DO TATAME) */}
      <CinematicHero
        productList={productList}
        onQuickView={onQuickView}
        onNavigate={onNavigate}
        onSelectCategory={setSelectedCategory}
        onOpenFilterDrawer={onOpenFilterDrawer}
      />

      {/* 1. DEAL HIGHLIGHT BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DealHighlightBanner
          productList={productList}
          onSelectProduct={onQuickView}
          onAddToCart={onAddToCart}
          onToggleCompare={onToggleCompare}
          isComparing={false}
        />
      </div>

      {/* 2.5 BJJ PRODUCT CATEGORIZATION SYSTEM */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryHierarchyNav
          productList={productList}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSubCategories={selectedSubCategories}
          setSelectedSubCategories={setSelectedSubCategories}
        />
      </div>

      {/* 3. ADVANCED SEARCH & FILTER SECTION */}
      <div id="catalog-products-grid">
        <AdvancedSearchSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          maxProductPrice={maxProductPrice}
          selectedBrands={selectedBrands}
          setSelectedBrands={setSelectedBrands}
          availableBrands={availableBrands}
          selectedRating={selectedRating}
          setSelectedRating={setSelectedRating}
          selectedPopularity={selectedPopularity}
          setSelectedPopularity={setSelectedPopularity}
          selectedPractitionerLevels={selectedPractitionerLevels}
          setSelectedPractitionerLevels={setSelectedPractitionerLevels}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onOpenFilterDrawer={onOpenFilterDrawer}
          onOpenAiFilter={() => setShowAiFilterModal(!showAiFilterModal)}
          onOpenSeoOptimizer={onOpenSeoOptimizer ? () => onOpenSeoOptimizer() : undefined}
          totalProductsCount={productList.length}
          filteredProductsCount={filteredProducts.length}
          productList={productList}
        />
      </div>

      {/* AI Search Filter Accordion */}
      <AnimatePresence>
        {showAiFilterModal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <div className="bg-zinc-950 p-6 border-2 border-green-500/40 relative">
              <button
                type="button"
                onClick={() => setShowAiFilterModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
              <AIProductFilter
                onFilter={(criteria) => {
                  if (criteria.keywords && criteria.keywords.length > 0) {
                    setSearchQuery(criteria.keywords.join(' '));
                  }
                  if (criteria.category) {
                    setSelectedCategory(criteria.category);
                  }
                  setShowAiFilterModal(false);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. PRODUCTS RESULTS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Offline Status & Product Images Cache Manager Bar */}
        <OfflineCatalogBar products={productList} className="mb-2" />

        {/* Results Header with Count and Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-black uppercase tracking-tight text-black dark:text-white font-mono">
              {t('catalog.results_header', { defaultValue: 'Resultados do Acervo' })}
            </span>
            <span className="text-xs font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 border border-zinc-200 dark:border-zinc-700">
              {filteredProducts.length === 1 
                ? t('catalog.items_count', { count: filteredProducts.length, defaultValue: '1 produto' })
                : t('catalog.items_count_plural', { count: filteredProducts.length, defaultValue: `${filteredProducts.length} produtos` })}
            </span>

            {/* Filter loading state badge */}
            <AnimatePresence>
              {isFiltering && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 animate-pulse"
                >
                  <Flame size={12} className="animate-spin text-red-600" />
                  <span>{t('catalog.filtering', { defaultValue: 'Filtrando catálogo...' })}</span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-zinc-500">
              {t('catalog.pagination', { page: currentPage, total: Math.max(1, totalPages), defaultValue: `Página ${currentPage} de ${Math.max(1, totalPages)}` })}
            </span>
          </div>
        </div>

        {/* Product Cards Grid, Folding Kimono Loader or Empty State */}
        <AnimatePresence mode="wait">
          {isFiltering ? (
            <motion.div
              key="kimono-folding-loading-state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-10 shadow-sm"
            >
              <KimonoFoldingLoader
                message="Filtrando o catálogo..."
                subMessage="Organizando os melhores kimonos e equipamentos para você • OSS!"
                size="md"
                showStepsIndicator={false}
              />
            </motion.div>
          ) : filteredProducts.length === 0 ? (
            <motion.div
              key="kimono-empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-zinc-50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-950/80 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <Search size={28} />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-black uppercase text-black dark:text-white font-mono">
                  {t('catalog.no_products_found', { defaultValue: 'Nenhum equipamento encontrado' })}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                  {t('catalog.no_products_desc', { defaultValue: 'Não encontramos produtos que correspondam a todos os filtros selecionados. Tente ajustar a faixa de preço, marcas ou categoria.' })}
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                >
                  <RotateCcw size={14} />
                  <span>{t('filter.clear_all', { defaultValue: 'Limpar Todos os Filtros' })}</span>
                </button>
              </div>
            </motion.div>
          ) : viewMode === 'virtualized' ? (
            <motion.div
              key="kimono-products-virtualized"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div 
                ref={containerRef}
                className="w-full relative border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950/40 p-3 sm:p-5 rounded-xl shadow-xs"
              >
                {/* Virtualization Performance Info Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-zinc-200 dark:border-zinc-800 text-xs font-mono">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/25 font-bold uppercase text-[10px] tracking-wider">
                      <Zap size={11} className="fill-green-500 text-green-500" />
                      Virtualização Ativa (react-window)
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {displayProducts.length} produtos • {rows.length} {rows.length === 1 ? 'linha' : 'linhas'} • Apenas nós visíveis no DOM
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsVirtualizedAll(prev => !prev)}
                      className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:border-black dark:hover:border-white transition-colors cursor-pointer"
                      title="Alternar entre todo o catálogo filtrado ou página atual"
                    >
                      {isVirtualizedAll ? `Todo o Acervo (${filteredProducts.length})` : `Página Atual (${paginatedProducts.length})`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                      title="Alternar para renderização de Grid DOM sem virtualização"
                    >
                      Grid Padrão
                    </button>
                  </div>
                </div>

                {/* react-window VirtualList */}
                <VirtualList
                  listRef={listRef}
                  rowCount={rows.length}
                  rowHeight={rowHeight}
                  rowComponent={VirtualProductRow}
                  rowProps={{
                    rows,
                    columnCount,
                    onQuickView,
                    onCheckout,
                    onAddToCart,
                    wishlist,
                    onToggleWishlist,
                    comparedProductIds,
                    onToggleCompare,
                    wishlistAlerts,
                    onToggleAlert,
                    onOpenReviews,
                    onOpenSeoOptimizer
                  }}
                  style={{
                    height: listHeight,
                    width: '100%'
                  }}
                  className="focus:outline-none overflow-y-auto pr-1"
                  overscanCount={2}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="kimono-products-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800 text-xs font-mono">
                <span className="text-zinc-500 text-[11px]">
                  Modo Grid Convencional ({paginatedProducts.length} itens renderizados)
                </span>
                <button
                  type="button"
                  onClick={() => setViewMode('virtualized')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 hover:bg-green-500 text-white font-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Zap size={11} />
                  Ativar Virtualização (react-window)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {(paginatedProducts || []).map((product) => (
                  <PremiumProductCard
                    key={product.id}
                    product={product}
                    onQuickView={onQuickView}
                    onCheckout={onCheckout}
                    onQuickBuy={onCheckout}
                    onAddToCart={onAddToCart}
                    isInWishlist={wishlist.has(product.id)}
                    onToggleWishlist={onToggleWishlist}
                    isComparing={comparedProductIds ? comparedProductIds.has(product.id) : false}
                    onToggleCompare={onToggleCompare}
                    isAlertActive={wishlistAlerts?.has(product.id)}
                    onToggleAlert={onToggleAlert}
                    onOpenReviews={onOpenReviews}
                    onOpenSeoOptimizer={onOpenSeoOptimizer ? (p) => onOpenSeoOptimizer(p.id) : undefined}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination Controls */}
        {viewMode === 'virtualized' && isVirtualizedAll ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-xs font-mono">
            <span className="text-zinc-500">
              Modo Contínuo Virtualizado: Todos os {filteredProducts.length} produtos carregados no rolador com virtualização DOM de alta performance.
            </span>
            <button
              type="button"
              onClick={() => {
                setIsVirtualizedAll(false);
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white text-xs font-mono font-bold uppercase hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Alternar para Navegação Paginada
            </button>
          </div>
        ) : totalPages > 1 ? (
          <div className="flex items-center justify-center gap-2 pt-8">
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(1, typeof prev === 'number' ? prev - 1 : 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white text-xs font-mono font-bold uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              {t('common.back', { defaultValue: 'Anterior' })}
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isCurrent = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 font-mono text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                        : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, typeof prev === 'number' ? prev + 1 : totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white text-xs font-mono font-bold uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              {t('common.next', { defaultValue: 'Próxima' })}
            </button>
          </div>
        ) : null}

      </div>

      {/* 5. DYNAMIC SIZE CHART CALCULATOR TRIGGER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="p-6 bg-zinc-900 text-white border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[10px] font-mono text-green-500 uppercase font-black tracking-widest">
              Tabela de Medidas Inteligente
            </span>
            <h3 className="text-lg font-black uppercase font-headline">
              Dúvidas sobre o tamanho do seu Kimono ou Rashguard?
            </h3>
            <p className="text-xs text-zinc-400 font-sans max-w-xl">
              Calcule com precisão seu tamanho ideal (A0, A1, A2, A3, A4, P, M, G, GG) baseado em sua altura, peso e encolhimento do tecido trançado.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowSizeCalculator(!showSizeCalculator)}
            className="px-5 py-3 bg-white text-black hover:bg-zinc-200 font-mono text-xs font-black uppercase tracking-wider transition-colors shrink-0"
          >
            {showSizeCalculator ? 'Ocultar Calculadora' : 'Abrir Tabela de Medidas'}
          </button>
        </div>

        {showSizeCalculator && (
          <div className="mt-4">
            <DynamicSizeChart category={selectedCategory !== 'All' ? selectedCategory : 'Kimonos'} />
          </div>
        )}
      </div>

      {/* 6. MESTRE & DOJO WISDOM */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <WolfWisdom />
      </div>

      {/* 7. PARTNER GYMS & ACADEMIES */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PartnerGyms />
      </div>

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LandingFAQ onNavigate={onNavigate} />
      </div>

    </div>
  );
};
export default ShopCatalogView;

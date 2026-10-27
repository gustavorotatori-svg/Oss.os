import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shirt, 
  ShieldAlert, 
  Zap, 
  PackageCheck, 
  ChevronRight, 
  Check, 
  X, 
  Filter, 
  Sparkles,
  Layers,
  Search,
  ArrowRight,
  Info
} from 'lucide-react';
import { Category, MainCategory, Product } from '../types';
import { MAIN_CATEGORIES_CONFIG, getMainCategoryConfig, resolveProductMainCategory } from '../data/categories';

export interface CategoryHierarchyNavProps {
  productList?: Product[];
  selectedCategory?: Category | 'All';
  setSelectedCategory?: (category: Category | 'All') => void;
  selectedSubCategories?: string[];
  setSelectedSubCategories?: (subs: string[] | ((prev: string[]) => string[])) => void;
  className?: string;
}

export const CategoryHierarchyNav: React.FC<CategoryHierarchyNavProps> = ({
  productList = [],
  selectedCategory = 'All',
  setSelectedCategory = (_cat: Category | 'All') => {},
  selectedSubCategories = [],
  setSelectedSubCategories = (_subs: string[] | ((prev: string[]) => string[])) => {},
  className = ''
}) => {
  const [activeGroupTab, setActiveGroupTab] = useState<string | null>(null);
  const [subSearchQuery, setSubSearchQuery] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Determine current active main category
  const activeMainCategory: MainCategory | null = useMemo(() => {
    if (selectedCategory === 'All') return null;
    if (['Vestuário', 'Equipamentos', 'Suplementos', 'Acessórios'].includes(selectedCategory)) {
      return selectedCategory as MainCategory;
    }
    // Check if selectedCategory is one of our sub-aliases
    if (['Kimonos', 'Rashguards', 'Bermudas', 'Shorts', 'Faixas', 'Roupas de Competição'].includes(selectedCategory)) {
      return 'Vestuário';
    }
    if (['Tatames', 'Mats', 'Equipamentos para Iniciantes'].includes(selectedCategory)) {
      return 'Equipamentos';
    }
    if (['Nutrição Esportiva', 'Nutrição'].includes(selectedCategory)) {
      return 'Suplementos';
    }
    if (['Acessórios de Treino', 'Protetores', 'Equipamentos de Proteção'].includes(selectedCategory)) {
      return 'Acessórios';
    }
    return null;
  }, [selectedCategory]);

  const activeConfig = useMemo(() => {
    return activeMainCategory ? getMainCategoryConfig(activeMainCategory) : null;
  }, [activeMainCategory]);

  // Product counts by Main Category
  const mainCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: productList.length,
      Vestuário: 0,
      Equipamentos: 0,
      Suplementos: 0,
      Acessórios: 0
    };

    productList.forEach(p => {
      const mainCat = resolveProductMainCategory(p);
      if (counts[mainCat] !== undefined) {
        counts[mainCat]++;
      }
    });

    return counts;
  }, [productList]);

  // Counts by detailed subcategory
  const subCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    productList.forEach(p => {
      const detailed = p.subCategoryDetailed || p.subCategory;
      if (detailed) {
        counts[detailed] = (counts[detailed] || 0) + 1;
      }
      if (p.subCategoryGroup) {
        counts[p.subCategoryGroup] = (counts[p.subCategoryGroup] || 0) + 1;
      }
    });
    return counts;
  }, [productList]);

  // Handle Main Category click
  const handleSelectMainCategory = (cat: Category | 'All') => {
    setSelectedCategory(cat);
    setActiveGroupTab(null);
    setSelectedSubCategories([]);
    setSubSearchQuery('');
  };

  // Toggle or set a specific detailed subcategory
  const handleToggleSubCategory = (subName: string) => {
    setSelectedSubCategories(prev => {
      if (prev.includes(subName)) {
        return prev.filter(s => s !== subName);
      } else {
        return [...prev, subName];
      }
    });
  };

  // Clear all subcategories
  const handleClearSubFilters = () => {
    setSelectedSubCategories([]);
    setActiveGroupTab(null);
    setSubSearchQuery('');
  };

  // Select a group tab (e.g. Kimonos inside Vestuário)
  const handleSelectGroup = (groupId: string) => {
    if (activeGroupTab === groupId) {
      setActiveGroupTab(null);
    } else {
      setActiveGroupTab(groupId);
    }
  };

  // Icon mapping for main categories
  const getMainCatIcon = (id: string) => {
    switch (id) {
      case 'Vestuário':
        return <Shirt size={16} className="text-amber-500" />;
      case 'Equipamentos':
        return <ShieldAlert size={16} className="text-emerald-500" />;
      case 'Suplementos':
        return <Zap size={16} className="text-orange-500" />;
      case 'Acessórios':
        return <PackageCheck size={16} className="text-blue-500" />;
      default:
        return <Layers size={16} className="text-zinc-400" />;
    }
  };

  return (
    <div id="bjj-category-system" className={`bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 shadow-sm ${className}`}>
      {/* 1. Header Bar with Category Navigation title & active breadcrumbs */}
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 bg-red-600 rounded-none transform rotate-45" />
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">
            SISTEMA DE CATEGORIAS BJJ
          </span>
          <span className="hidden sm:inline-block text-[9px] font-mono text-zinc-400 dark:text-zinc-500 border-l border-zinc-300 dark:border-zinc-700 pl-2.5">
            Hierarquia Técnica do Tatame
          </span>
        </div>

        {/* Active Breadcrumb / Filter Status */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
            <span className="text-zinc-400">Portal</span>
            <ChevronRight size={10} className="text-zinc-400" />
            <span className={activeMainCategory ? 'text-zinc-900 dark:text-zinc-200 font-bold' : 'text-red-600 font-bold'}>
              {selectedCategory === 'All' ? 'Todos os Produtos' : selectedCategory}
            </span>
            {selectedSubCategories.length > 0 && (
              <>
                <ChevronRight size={10} className="text-zinc-400" />
                <span className="text-red-600 dark:text-red-400 font-bold truncate max-w-[140px]">
                  {selectedSubCategories.join(', ')}
                </span>
              </>
            )}
          </div>

          {(selectedCategory !== 'All' || selectedSubCategories.length > 0) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedSubCategories([]);
                setActiveGroupTab(null);
              }}
              className="ml-2 px-2 py-0.5 text-[9px] font-mono uppercase bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 transition-colors flex items-center gap-1"
              title="Limpar todos os filtros de categoria"
            >
              <X size={10} />
              <span>Limpar</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            title={isExpanded ? 'Recolher painel de categorias' : 'Expandir categorias'}
          >
            <Filter size={12} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* 2. Main Categories Grid Buttons (Vestuário, Equipamentos, Suplementos, Acessórios) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {/* All Products Option */}
            <button
              id="cat-btn-all"
              onClick={() => handleSelectMainCategory('All')}
              className={`p-3 text-left border transition-all relative overflow-hidden group ${
                selectedCategory === 'All'
                  ? 'border-red-600 bg-red-600/5 dark:bg-red-950/20 shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-400 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-base">🥋</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${
                  selectedCategory === 'All' 
                    ? 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 font-bold' 
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                }`}>
                  {mainCategoryCounts.All}
                </span>
              </div>
              <div className="font-mono font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-white flex items-center justify-between">
                <span>Todos</span>
                {selectedCategory === 'All' && <Check size={12} className="text-red-600 shrink-0" />}
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                Catálogo geral unificado
              </p>
            </button>

            {/* 4 Main Categories defined by user */}
            {MAIN_CATEGORIES_CONFIG.map(cat => {
              const isSelected = activeMainCategory === cat.id;
              const count = mainCategoryCounts[cat.id] || 0;

              return (
                <button
                  key={cat.id}
                  id={`cat-btn-${cat.slug}`}
                  onClick={() => handleSelectMainCategory(cat.id)}
                  className={`p-3 text-left border transition-all relative overflow-hidden group ${
                    isSelected
                      ? `border-red-600 bg-red-600/5 dark:bg-red-950/20 shadow-sm ring-1 ring-red-600/30`
                      : `border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-400 dark:hover:border-zinc-700`
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base">{cat.icon}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 opacity-60">
                        {cat.kanji}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 border ${
                        isSelected 
                          ? 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 font-bold' 
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                      }`}>
                        {count}
                      </span>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-white flex items-center justify-between">
                    <span>{cat.name}</span>
                    {isSelected && <Check size={12} className="text-red-600 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                    {cat.tagline}
                  </p>
                </button>
              );
            })}
          </div>

          {/* 3. Detailed Subcategories Explorer (Dynamic per Active Main Category) */}
          {activeConfig && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/80 space-y-4"
            >
              {/* Category Info Header & Group Tabs */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/60 p-3 border border-zinc-200 dark:border-zinc-800">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{activeConfig.icon}</span>
                    <span className="text-xs font-mono font-black uppercase text-zinc-900 dark:text-white tracking-wider">
                      SUB-CATEGORIAS DE {activeConfig.name.toUpperCase()}
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold">
                      {activeConfig.groups.length} Grupos Especializados
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {activeConfig.description}
                  </p>
                </div>

                {/* Subcategory Search Input */}
                <div className="relative min-w-[200px] max-w-xs">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={subSearchQuery}
                    onChange={(e) => setSubSearchQuery(e.target.value)}
                    placeholder="Filtrar subcategorias..."
                    className="w-full pl-8 pr-3 py-1.5 text-[11px] font-mono bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-none focus:outline-none focus:border-red-600 text-zinc-900 dark:text-white placeholder:text-zinc-400"
                  />
                  {subSearchQuery && (
                    <button
                      onClick={() => setSubSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Subcategory Groups & Detailed items */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(activeConfig?.groups || []).map(group => {
                  // Filter subcategories by search query if present
                  const filteredSubs = (group.subcategories || []).filter(sub => {
                    if (!subSearchQuery) return true;
                    const q = subSearchQuery.toLowerCase();
                    return sub.name.toLowerCase().includes(q) || sub.description.toLowerCase().includes(q);
                  });

                  if (filteredSubs.length === 0 && subSearchQuery) return null;

                  return (
                    <div 
                      key={group.id} 
                      className="border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 p-3 space-y-2.5 flex flex-col justify-between"
                    >
                      <div>
                        {/* Group Header */}
                        <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">{group.icon}</span>
                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                              {group.name}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-zinc-400">
                            {filteredSubs.length} opções
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-1">
                          {group.description}
                        </p>

                        {/* Detailed Subcategory Items (Pills / Buttons) */}
                        <div className="mt-2.5 space-y-1.5">
                          {(filteredSubs || []).map(sub => {
                            const isSubSelected = (selectedSubCategories || []).includes(sub.name);
                            const count = subCategoryCounts[sub.name] || 0;

                            return (
                              <button
                                key={sub.id}
                                id={`subcat-btn-${sub.slug}`}
                                onClick={() => handleToggleSubCategory(sub.name)}
                                className={`w-full text-left p-2 border transition-all flex items-start justify-between gap-2 text-[10px] font-mono group/item ${
                                  isSubSelected
                                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-zinc-900 dark:border-white shadow-sm'
                                    : 'bg-zinc-50/70 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600'
                                }`}
                              >
                                <div className="space-y-0.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <div className={`w-2.5 h-2.5 border flex items-center justify-center shrink-0 transition-colors ${
                                      isSubSelected
                                        ? 'bg-green-500 border-green-500'
                                        : 'border-zinc-300 dark:border-zinc-700 group-hover/item:border-zinc-500'
                                    }`}>
                                      {isSubSelected && <Check size={8} className="text-white" />}
                                    </div>
                                    <span className="font-bold truncate">{sub.name}</span>
                                  </div>
                                  <p className={`text-[9px] pl-4 truncate ${
                                    isSubSelected ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400 dark:text-zinc-500'
                                  }`}>
                                    {sub.description}
                                  </p>
                                </div>

                                <div className="flex flex-col items-end shrink-0 gap-1">
                                  {sub.badge && (
                                    <span className={`text-[8px] font-mono font-bold px-1 py-0.2 tracking-wider ${
                                      isSubSelected
                                        ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                                    }`}>
                                      {sub.badge}
                                    </span>
                                  )}
                                  {count > 0 && (
                                    <span className={`text-[9px] font-mono ${
                                      isSubSelected ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400'
                                    }`}>
                                      {count} prod.
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Filter Chips Bar */}
              {(selectedSubCategories || []).length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mr-1">
                    Filtros Selecionados:
                  </span>
                  {(selectedSubCategories || []).map(sub => (
                    <span
                      key={sub}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold bg-red-600 text-white"
                    >
                      <span>{sub}</span>
                      <button
                        onClick={() => handleToggleSubCategory(sub)}
                        className="hover:bg-black/20 p-0.5 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={handleClearSubFilters}
                    className="text-[10px] font-mono text-red-600 dark:text-red-400 hover:underline ml-2"
                  >
                    Limpar Filtros ({(selectedSubCategories || []).length})
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

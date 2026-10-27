import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, X, ShoppingBag, Newspaper, Tag, ArrowRight, 
  Sparkles, History, Flame, ChevronRight, Scale, Mic,
  ExternalLink, BellRing, Layers, Filter
} from 'lucide-react';
import { Product, BlogPost } from '../types';
import ImageOptimization from '@/components/ImageOptimization';

export interface GlobalHeaderSearchProps {
  productList: Product[];
  blogPosts: BlogPost[];
  onNavigate: (view: 'LANDING' | 'SHOP' | 'BLOG' | 'PODCAST' | 'COMPARATOR' | 'WISHLIST' | 'SETTINGS' | 'TRANSPARENCY' | 'ABOUT' | 'CONTACT') => void;
  onSelectProduct: (product: Product) => void;
  onSelectBlogPost: (post: BlogPost) => void;
  onSelectShopCategory?: (category: string) => void;
  onSelectBlogCategory?: (category: string) => void;
  onSetShopSearchTerm?: (term: string) => void;
  onSetBlogSearchQuery?: (query: string) => void;
  className?: string;
}

// Category metadata helper for rich rendering
interface CategoryItem {
  id: string;
  name: string;
  type: 'shop' | 'blog' | 'section';
  count: number;
  iconName?: string;
  description?: string;
}

const POPULAR_SEARCH_SUGGESTIONS = [
  'Kimono Trançado',
  'Rashguard',
  'Passagem de Guarda',
  'Suplementos',
  'Nutrição',
  'Venum',
  'Dicas de Treino',
  'Regras IBJJF'
];

export const GlobalHeaderSearch: React.FC<GlobalHeaderSearchProps> = ({
  productList,
  blogPosts,
  onNavigate,
  onSelectProduct,
  onSelectBlogPost,
  onSelectShopCategory,
  onSelectBlogCategory,
  onSetShopSearchTerm,
  onSetBlogSearchQuery,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'articles' | 'categories'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('oss_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading recent searches:', e);
    }
  }, []);

  // Keyboard shortcut (Ctrl+K or Cmd+K) to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const cleanTerm = term.trim();
    const updated = [cleanTerm, ...recentSearches.filter(s => s.toLowerCase() !== cleanTerm.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('oss_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving recent searches:', e);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('oss_recent_searches');
    } catch (e) {
      console.error('Error clearing recent searches:', e);
    }
  };

  // Compile categories list dynamically
  const categoriesList = useMemo(() => {
    const map = new Map<string, CategoryItem>();

    // Add product categories
    productList.forEach(p => {
      if (p.category) {
        const existing = map.get(`shop_${p.category}`);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(`shop_${p.category}`, {
            id: `shop_${p.category}`,
            name: p.category,
            type: 'shop',
            count: 1,
            description: 'Categoria de Equipamentos & Produtos da Loja'
          });
        }
      }
    });

    // Add blog categories
    blogPosts.forEach(b => {
      if (b.category) {
        const existing = map.get(`blog_${b.category}`);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(`blog_${b.category}`, {
            id: `blog_${b.category}`,
            name: b.category,
            type: 'blog',
            count: 1,
            description: 'Categoria de Artigos, Notícias & Tutoriais'
          });
        }
      }
    });

    return Array.from(map.values());
  }, [productList, blogPosts]);

  // Filtered search results
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { products: [], articles: [], categories: [], total: 0 };
    }

    // Products matching
    const products = productList.filter(p => 
      p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.platform?.toLowerCase().includes(q) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    ).slice(0, 6);

    // Articles matching
    const articles = blogPosts.filter(b => 
      b.title?.toLowerCase().includes(q) ||
      b.excerpt?.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q) ||
      b.content?.toLowerCase().includes(q) ||
      (b.tags && b.tags.some(t => t.toLowerCase().includes(q)))
    ).slice(0, 6);

    // Categories matching
    const categories = categoriesList.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    ).slice(0, 6);

    const total = products.length + articles.length + categories.length;

    return { products, articles, categories, total };
  }, [query, productList, blogPosts, categoriesList]);

  // Keyboard navigation support
  const flattenedResults = useMemo(() => {
    const list: Array<{ type: 'product' | 'article' | 'category'; item: any }> = [];
    if (activeTab === 'all' || activeTab === 'products') {
      searchResults.products.forEach(p => list.push({ type: 'product', item: p }));
    }
    if (activeTab === 'all' || activeTab === 'articles') {
      searchResults.articles.forEach(a => list.push({ type: 'article', item: a }));
    }
    if (activeTab === 'all' || activeTab === 'categories') {
      searchResults.categories.forEach(c => list.push({ type: 'category', item: c }));
    }
    return list;
  }, [searchResults, activeTab]);

  const handleKeyDownInput = (e: React.KeyboardEvent) => {
    if (flattenedResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < flattenedResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : flattenedResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < flattenedResults.length) {
        const target = flattenedResults[selectedIndex];
        handleSelectResultItem(target.type, target.item);
      } else if (query.trim()) {
        // Default search submit
        handleSearchSubmit(query);
      }
    }
  };

  const handleSelectResultItem = (type: 'product' | 'article' | 'category', item: any) => {
    saveRecentSearch(query || item.title || item.name);
    setIsOpen(false);
    setQuery('');

    if (type === 'product') {
      onSelectProduct(item);
      onNavigate('SHOP');
    } else if (type === 'article') {
      onSelectBlogPost(item);
      onNavigate('BLOG');
    } else if (type === 'category') {
      if (item.type === 'shop') {
        if (onSelectShopCategory) onSelectShopCategory(item.name);
        onNavigate('SHOP');
      } else if (item.type === 'blog') {
        if (onSelectBlogCategory) onSelectBlogCategory(item.name);
        onNavigate('BLOG');
      }
    }
  };

  const handleSearchSubmit = (searchTerm: string) => {
    saveRecentSearch(searchTerm);
    setIsOpen(false);

    if (activeTab === 'articles') {
      if (onSetBlogSearchQuery) onSetBlogSearchQuery(searchTerm);
      onNavigate('BLOG');
    } else if (activeTab === 'products') {
      if (onSetShopSearchTerm) onSetShopSearchTerm(searchTerm);
      onNavigate('SHOP');
    } else {
      // Default to shop or blog depending on results
      if (searchResults.products.length > 0) {
        if (onSetShopSearchTerm) onSetShopSearchTerm(searchTerm);
        onNavigate('SHOP');
      } else if (searchResults.articles.length > 0) {
        if (onSetBlogSearchQuery) onSetBlogSearchQuery(searchTerm);
        onNavigate('BLOG');
      } else {
        if (onSetShopSearchTerm) onSetShopSearchTerm(searchTerm);
        onNavigate('SHOP');
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Header Search Trigger Input (Desktop) */}
      <div 
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80 text-zinc-500 hover:text-black dark:hover:text-white border border-zinc-200/80 dark:border-zinc-800/80 rounded-none cursor-pointer transition-all w-52 lg:w-72 group shadow-inner select-none"
        title="Buscar produtos, artigos e categorias (Ctrl+K)"
        id="global-header-search-trigger"
      >
        <Search size={14} className="text-zinc-400 group-hover:text-green-600 transition-colors shrink-0" />
        <span className="text-[10px] font-mono font-medium truncate flex-1 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
          Pesquisar portal...
        </span>
        <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-mono font-bold text-zinc-400 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded shadow-2xs">
          ⌘K
        </kbd>
      </div>

      {/* Header Search Icon Button (Mobile) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="flex md:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all rounded-lg"
        title="Abrir Busca Global"
        id="global-header-search-mobile-btn"
      >
        <Search size={18} />
      </motion.button>

      {/* Global Search Dialog Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-12 md:pt-20 px-3 sm:px-4 bg-black/65 backdrop-blur-md">
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="w-full max-w-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              id="global-search-modal-container"
            >
              {/* Search Bar Header */}
              <div className="relative flex items-center gap-3 px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <Search size={18} className="text-green-600 shrink-0 animate-pulse" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(-1);
                  }}
                  onKeyDown={handleKeyDownInput}
                  placeholder="Pesquisar artigos, produtos, marcas ou categorias..."
                  className="flex-1 bg-transparent text-sm font-medium text-black dark:text-white placeholder-zinc-400 focus:outline-none"
                  id="global-search-input"
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery('');
                      inputRef.current?.focus();
                    }}
                    className="p-1 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                    title="Limpar busca"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors rounded-sm text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Esc</span>
                  <X size={16} />
                </button>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 px-4 py-2 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-100/30 dark:bg-zinc-900/30 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'Todos', count: searchResults.total },
                  { id: 'products', label: '🛒 Produtos', count: searchResults.products.length },
                  { id: 'articles', label: '📰 Artigos', count: searchResults.articles.length },
                  { id: 'categories', label: '🏷️ Categorias', count: searchResults.categories.length },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setSelectedIndex(-1);
                    }}
                    className={`px-3 py-1 text-[10px] font-mono font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                        : 'text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    {tab.label} {query.trim() && tab.count > 0 ? `(${tab.count})` : ''}
                  </button>
                ))}
              </div>

              {/* Modal Content Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-[250px] max-h-[60vh]">
                {/* Empty Query State: Recent Searches & Trending Suggestions */}
                {!query.trim() && (
                  <div className="space-y-6 py-2">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-widest text-zinc-400">
                            <History size={12} className="text-zinc-500" />
                            Buscas Recentes
                          </span>
                          <button
                            onClick={clearRecentSearches}
                            className="text-[9px] font-mono text-zinc-400 hover:text-red-500 transition-colors uppercase tracking-wider"
                          >
                            Limpar
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((term, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setQuery(term);
                                inputRef.current?.focus();
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer"
                            >
                              <History size={10} className="text-zinc-400" />
                              <span>{term}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Popular / Trending Suggestions */}
                    <div>
                      <span className="flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-widest text-zinc-400 mb-2.5">
                        <Flame size={12} className="text-yellow-500" />
                        Termos Populares & Sugestões
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_SEARCH_SUGGESTIONS.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setQuery(sug);
                              inputRef.current?.focus();
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border border-zinc-200 dark:border-zinc-800 text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400 transition-all cursor-pointer"
                          >
                            <Sparkles size={10} className="text-green-500" />
                            <span>{sug}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Featured Top Categories Grid */}
                    <div>
                      <span className="flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-widest text-zinc-400 mb-2.5">
                        <Layers size={12} className="text-green-500" />
                        Principais Categorias do Portal
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { name: 'Kimonos', type: 'shop', icon: '🥋', desc: 'Trançados, Leves e Competição' },
                          { name: 'Rashguards', type: 'shop', icon: '👕', desc: 'Manga Longa & Curta Nogi' },
                          { name: 'Dicas de Treino', type: 'blog', icon: '💡', desc: 'Aprimoramento Técnico & Tático' },
                          { name: 'Suplementos', type: 'shop', icon: '⚡', desc: 'Whey, Creatina & Recuperação' },
                          { name: 'Guia de Kimonos', type: 'blog', icon: '📖', desc: 'Análises de Durabilidade & Gramatura' },
                          { name: 'Reviews de Marcas', type: 'blog', icon: '⭐', desc: 'Venum, KVRA, Atama & Kingz' },
                        ].map((cat, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              if (cat.type === 'shop') {
                                if (onSelectShopCategory) onSelectShopCategory(cat.name);
                                onNavigate('SHOP');
                              } else {
                                if (onSelectBlogCategory) onSelectBlogCategory(cat.name);
                                onNavigate('BLOG');
                              }
                              setIsOpen(false);
                            }}
                            className="flex flex-col text-left p-2.5 bg-zinc-50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-base">{cat.icon}</span>
                              <ChevronRight size={12} className="text-zinc-400 group-hover:text-green-500 transition-colors" />
                            </div>
                            <span className="text-xs font-bold text-black dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">
                              {cat.name}
                            </span>
                            <span className="text-[9.5px] text-zinc-500 line-clamp-1 mt-0.5">
                              {cat.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Active Results View */}
                {query.trim() && (
                  <div className="space-y-6">
                    {/* No Results Found State */}
                    {searchResults.total === 0 && (
                      <div className="text-center py-12 px-4 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                          <Search size={22} />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-wider text-black dark:text-white">
                          Nenhum resultado para "{query}"
                        </h4>
                        <p className="text-xs text-zinc-500 max-w-md mx-auto">
                          Tente buscar por marcas como Venum, tipos de equipamento como Kimono ou Rashguard, ou assuntos como Nutrição e Passagem de Guarda.
                        </p>
                        <div className="pt-2 flex justify-center gap-2">
                          <button
                            onClick={() => {
                              if (onSetShopSearchTerm) onSetShopSearchTerm(query);
                              onNavigate('SHOP');
                              setIsOpen(false);
                            }}
                            className="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer"
                          >
                            Buscar na Loja
                          </button>
                          <button
                            onClick={() => {
                              if (onSetBlogSearchQuery) onSetBlogSearchQuery(query);
                              onNavigate('BLOG');
                              setIsOpen(false);
                            }}
                            className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900"
                          >
                            Buscar no Blog
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Products Section */}
                    {(activeTab === 'all' || activeTab === 'products') && searchResults.products.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2.5 pb-1 border-b border-zinc-100 dark:border-zinc-900">
                          <span className="flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-widest text-green-600">
                            <ShoppingBag size={12} />
                            Produtos da Loja ({searchResults.products.length})
                          </span>
                          <button
                            onClick={() => handleSearchSubmit(query)}
                            className="text-[9px] font-mono text-zinc-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1"
                          >
                            Ver Todos os Produtos <ArrowRight size={10} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {searchResults.products.map((prod) => (
                            <div
                              key={prod.id}
                              onClick={() => handleSelectResultItem('product', prod)}
                              className="flex items-center gap-3 p-2 bg-zinc-50/80 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 transition-all cursor-pointer group"
                            >
                              <ImageOptimization
                                src={prod.imageUrl}
                                alt={prod.title}
                                widthForce={80}
                                quality={75}
                                containerClassName="w-12 h-12 shrink-0 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
                                className="w-full h-full object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="px-1.5 py-0.2 bg-zinc-200 dark:bg-zinc-800 text-[8px] font-mono font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                                    {prod.category}
                                  </span>
                                  {prod.brand && (
                                    <span className="text-[8px] font-mono text-zinc-400 uppercase">
                                      • {prod.brand}
                                    </span>
                                  )}
                                </div>
                                <h5 className="text-xs font-bold text-black dark:text-white truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                  {prod.title}
                                </h5>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs font-black font-mono text-black dark:text-white">
                                    R$ {prod.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                  {prod.isBestPrice && (
                                    <span className="text-[8px] font-mono font-black text-green-600 bg-green-500/10 px-1">
                                      Melhor Preço
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ChevronRight size={14} className="text-zinc-400 group-hover:text-green-500 shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Blog Articles Section */}
                    {(activeTab === 'all' || activeTab === 'articles') && searchResults.articles.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2.5 pb-1 border-b border-zinc-100 dark:border-zinc-900">
                          <span className="flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-widest text-indigo-500">
                            <Newspaper size={12} />
                            Artigos & Notícias ({searchResults.articles.length})
                          </span>
                          <button
                            onClick={() => {
                              if (onSetBlogSearchQuery) onSetBlogSearchQuery(query);
                              onNavigate('BLOG');
                              setIsOpen(false);
                            }}
                            className="text-[9px] font-mono text-zinc-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1"
                          >
                            Ver Todos no Blog <ArrowRight size={10} />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {searchResults.articles.map((art) => (
                            <div
                              key={art.id}
                              onClick={() => handleSelectResultItem('article', art)}
                              className="flex items-center gap-3 p-2.5 bg-zinc-50/80 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 transition-all cursor-pointer group"
                            >
                              <ImageOptimization
                                src={art.imageUrl}
                                alt={art.title}
                                widthForce={80}
                                quality={75}
                                containerClassName="w-12 h-12 shrink-0 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
                                className="w-full h-full object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="px-1.5 py-0.2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[8px] font-mono font-bold uppercase">
                                    {art.category}
                                  </span>
                                  {art.readTime && (
                                    <span className="text-[8px] font-mono text-zinc-400">
                                      • {art.readTime}
                                    </span>
                                  )}
                                </div>
                                <h5 className="text-xs font-bold text-black dark:text-white truncate group-hover:text-indigo-500 transition-colors">
                                  {art.title}
                                </h5>
                                <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">
                                  {art.excerpt}
                                </p>
                              </div>
                              <ChevronRight size={14} className="text-zinc-400 group-hover:text-indigo-500 shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Content Categories Section */}
                    {(activeTab === 'all' || activeTab === 'categories') && searchResults.categories.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2.5 pb-1 border-b border-zinc-100 dark:border-zinc-900">
                          <span className="flex items-center gap-1.5 text-[9px] font-mono font-black uppercase tracking-widest text-yellow-600">
                            <Tag size={12} />
                            Categorias Encontradas ({searchResults.categories.length})
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {searchResults.categories.map((cat) => (
                            <div
                              key={cat.id}
                              onClick={() => handleSelectResultItem('category', cat)}
                              className="flex items-center justify-between p-2.5 bg-zinc-50/80 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className={`w-2 h-2 rounded-full ${cat.type === 'shop' ? 'bg-green-500' : 'bg-indigo-500'}`} />
                                <div>
                                  <span className="text-xs font-bold text-black dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 block truncate">
                                    {cat.name}
                                  </span>
                                  <span className="text-[8px] font-mono text-zinc-400 uppercase">
                                    {cat.type === 'shop' ? 'Loja de Equipamentos' : 'Portal de Artigos'} • {cat.count} {cat.count === 1 ? 'item' : 'itens'}
                                  </span>
                                </div>
                              </div>
                              <ArrowRight size={12} className="text-zinc-400 group-hover:text-black dark:group-hover:text-white shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-4 py-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 flex items-center justify-between text-[9px] font-mono text-zinc-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-bold">↑</kbd>
                    <kbd className="px-1 py-0.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-bold">↓</kbd> Navegar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-bold">↵</kbd> Selecionar
                  </span>
                </div>
                <span>OSS.OS Unified Portal Search</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalHeaderSearch;

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Search, X, ShoppingBag, Newspaper, Tag, ArrowRight, 
  Sparkles, History, Flame, ChevronRight, Scale, Mic, MicOff,
  ExternalLink, BellRing, Layers, Filter, Check, Volume2
} from 'lucide-react';
import { Product, BlogPost } from '../types';
import ImageOptimization from '@/components/ImageOptimization';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { 
  VoiceExpandingRing, 
  DynamicWaveform, 
  VoiceWaveformEqualizerCombo 
} from './VoiceAmplitudeVisualizer';

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
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language === 'pt' ? 'pt-BR' : i18n?.language === 'es' ? 'es-ES' : 'en-US';
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'articles' | 'categories'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const voiceSearch = useVoiceSearch({
    lang: currentLang,
    onTranscriptChange: (text) => {
      setQuery(text);
    },
    onTranscriptFinal: (text) => {
      if (text.trim()) {
        handleSearchSubmit(text.trim());
      }
    }
  });

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
      {voiceSearch.isListening ? (
        <div 
          onClick={() => setIsOpen(true)}
          className="hidden md:flex items-center justify-between gap-2 px-3 py-1.5 bg-red-500/10 dark:bg-red-950/40 hover:bg-red-500/15 border border-red-500/70 dark:border-red-500/80 rounded-none transition-all w-72 lg:w-96 group cursor-pointer select-none"
          style={{
            boxShadow: `0 0 ${10 + voiceSearch.amplitude * 24}px rgba(239, 68, 68, ${0.28 + voiceSearch.amplitude * 0.45})`,
            borderColor: voiceSearch.amplitude > 0.7 ? '#ef4444' : voiceSearch.amplitude > 0.4 ? '#f87171' : 'rgba(239, 68, 68, 0.75)'
          }}
          title={t('voice.listening', { defaultValue: 'Microfone ouvindo em tempo real. Clique para abrir ou use os controles.' })}
          id="global-header-search-trigger-listening"
        >
          {/* Left: Dynamic Expanding/Contracting Voice Ring & Label */}
          <div className="flex items-center gap-1.5 shrink-0">
            <VoiceExpandingRing
              size="sm"
              amplitude={voiceSearch.amplitude}
              isListening={voiceSearch.isListening}
              showIcon={false}
            />
            <span className="text-[10px] font-mono font-black text-red-600 dark:text-red-400 tracking-wider uppercase">
              {t('voice.listening_short', { defaultValue: 'OUVINDO' })}
            </span>
          </div>

          {/* Center: Live spoken transcript preview */}
          <div className="flex-1 truncate mx-1 text-[11px] font-mono text-zinc-800 dark:text-zinc-200 font-medium">
            {voiceSearch.transcript ? (
              <span className="text-black dark:text-white font-bold italic truncate">"{voiceSearch.transcript}"</span>
            ) : (
              <span className="text-zinc-400 italic animate-pulse">{t('voice.speak_now', { defaultValue: 'Fale agora...' })}</span>
            )}
          </div>

          {/* Dynamic Audio Input Waveform & Equalizer Visualizer (Scales with Real-time Amplitude) */}
          <div 
            className="flex items-center gap-1 shrink-0 px-1.5 py-0.5 bg-black/10 dark:bg-white/10 rounded-xs border border-zinc-300 dark:border-zinc-800"
            title={`${t('voice.amplitude', { defaultValue: 'Amplitude da voz' })}: ${Math.round(voiceSearch.amplitude * 100)}%`}
          >
            <VoiceWaveformEqualizerCombo
              amplitude={voiceSearch.amplitude}
              frequencyBands={voiceSearch.frequencyBands}
            />
          </div>

          {/* Quick Actions (Confirm / Cancel) */}
          <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => {
                if (voiceSearch.transcript.trim()) {
                  handleSearchSubmit(voiceSearch.transcript.trim());
                }
                voiceSearch.stopListening();
              }}
              className="p-1 text-green-600 dark:text-green-400 hover:bg-green-500/20 rounded transition-colors"
              title={t('voice.search_action', { defaultValue: 'Buscar transcrição falada' })}
            >
              <Check size={14} />
            </button>
            <button
              type="button"
              onClick={() => voiceSearch.cancelListening()}
              className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
              title={t('voice.cancel', { defaultValue: 'Cancelar' })}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => setIsOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80 text-zinc-500 hover:text-black dark:hover:text-white border border-zinc-200/80 dark:border-zinc-800/80 rounded-none cursor-pointer transition-all w-52 lg:w-72 group shadow-inner select-none"
          title={t('header.search_placeholder', { defaultValue: 'Buscar produtos, artigos e categorias (Ctrl+K)' })}
          id="global-header-search-trigger"
        >
          <Search size={14} className="text-zinc-400 group-hover:text-green-600 transition-colors shrink-0" />
          <span className="text-[10px] font-mono font-medium truncate flex-1 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
            {query.trim() || t('header.search_placeholder', { defaultValue: 'Pesquisar portal...' })}
          </span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-mono font-bold text-zinc-400 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded shadow-2xs">
            ⌘K
          </kbd>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              voiceSearch.startListening();
            }}
            className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors rounded"
            title={t('voice.start', { defaultValue: 'Pesquisar por voz (Microfone)' })}
            id="global-header-voice-mic-btn"
          >
            <Mic size={14} />
          </button>
        </div>
      )}

      {/* Header Search & Mic Buttons (Mobile) */}
      <div className="flex md:hidden items-center gap-0.5 shrink-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="w-8 h-8 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all rounded-none shrink-0 cursor-pointer"
          title={t('header.search_placeholder', { defaultValue: 'Abrir Busca Global' })}
          id="global-header-search-mobile-btn"
        >
          <Search size={17} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (voiceSearch.isListening) {
              voiceSearch.stopListening();
            } else {
              voiceSearch.startListening();
            }
          }}
          className={`w-8 h-8 flex items-center justify-center transition-all rounded-none relative shrink-0 cursor-pointer ${
            voiceSearch.isListening
              ? 'text-red-500 bg-red-500/15 ring-2 ring-red-500/40 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
          title={voiceSearch.isListening ? t('voice.listening') : t('voice.start')}
          id="global-header-search-mobile-mic-btn"
        >
          {voiceSearch.isListening ? (
            <VoiceExpandingRing
              size="sm"
              amplitude={voiceSearch.amplitude}
              isListening={voiceSearch.isListening}
              showIcon={true}
            />
          ) : (
            <Mic size={17} />
          )}
        </motion.button>
      </div>

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
                  placeholder={t('header.search_placeholder', { defaultValue: 'Pesquisar artigos, produtos, marcas ou categorias...' })}
                  className="flex-1 bg-transparent text-sm font-medium text-black dark:text-white placeholder-zinc-400 focus:outline-none"
                  id="global-search-input"
                />

                {/* Microphone Toggle Button inside Search Modal Header */}
                <button
                  type="button"
                  onClick={() => {
                    if (voiceSearch.isListening) {
                      voiceSearch.stopListening();
                    } else {
                      voiceSearch.startListening();
                    }
                  }}
                  className={`p-1.5 transition-all rounded flex items-center gap-1.5 ${
                    voiceSearch.isListening
                      ? 'bg-red-500 text-white shadow-xs animate-pulse'
                      : 'text-zinc-400 hover:text-red-500 hover:bg-red-500/10'
                  }`}
                  title={voiceSearch.isListening ? t('voice.stop', { defaultValue: 'Parar escuta' }) : t('voice.start', { defaultValue: 'Pesquisar por voz' })}
                  id="global-search-modal-mic-toggle"
                >
                  <Mic size={16} />
                  {voiceSearch.isListening && (
                    <span className="text-[10px] font-mono font-bold uppercase hidden sm:inline">
                      {Math.round(voiceSearch.amplitude * 100)}%
                    </span>
                  )}
                </button>

                {query && (
                  <button
                    onClick={() => {
                      setQuery('');
                      voiceSearch.resetTranscript();
                      inputRef.current?.focus();
                    }}
                    className="p-1 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                    title={t('header.clear', { defaultValue: 'Limpar busca' })}
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

              {/* Live Microphone Amplitude & Speech Recognition Visualizer Panel (Inside Modal) */}
              <AnimatePresence>
                {voiceSearch.isListening && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/10 dark:bg-red-950/30 border-b border-red-500/30 px-4 py-3 overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      {/* Left: Dynamic Expanding Acoustic Ring + Status & Transcript */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="shrink-0">
                          <VoiceExpandingRing
                            size="md"
                            amplitude={voiceSearch.amplitude}
                            isListening={voiceSearch.isListening}
                            showIcon={true}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-mono font-black text-red-600 dark:text-red-400 uppercase tracking-widest">
                              {t('voice.listening', { defaultValue: 'Microfone Ativo • Ouvindo sua voz' })}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-300 bg-white/70 dark:bg-zinc-900/70 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                              {t('voice.amplitude', { defaultValue: 'Amplitude' })}: {Math.round(voiceSearch.amplitude * 100)}%
                            </span>
                          </div>

                          <div className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                            {voiceSearch.transcript ? (
                              <span>
                                <span className="text-zinc-400 font-mono text-[10px] uppercase mr-1.5">Detectado:</span>
                                <span className="font-bold text-black dark:text-white underline decoration-red-500 decoration-2">
                                  "{voiceSearch.transcript}"
                                </span>
                              </span>
                            ) : (
                              <span className="text-zinc-400 italic">
                                {t('voice.speak_hint', { defaultValue: 'Fale agora: nome do produto, técnica, marca ou categoria...' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: 16-band Spectrum Equalizer Visualizer & Controls */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0 w-full sm:w-auto">
                        <div 
                          className="flex items-end gap-1 h-7 px-2.5 py-1 bg-black/10 dark:bg-white/5 rounded border border-red-500/20"
                          title={`${t('voice.amplitude', { defaultValue: 'Amplitude da voz' })}: ${Math.round(voiceSearch.amplitude * 100)}%`}
                        >
                          {voiceSearch.detailedBands.map((band, i) => {
                            const h = Math.max(3, Math.min(22, Math.round(band * 22)));
                            const color = band > 0.75 ? '#ef4444' : band > 0.45 ? '#f59e0b' : '#22c55e';
                            return (
                              <span
                                key={i}
                                className="w-1 rounded-xs transition-all duration-75"
                                style={{
                                  height: `${h}px`,
                                  backgroundColor: color,
                                  boxShadow: band > 0.6 ? `0 0 5px ${color}` : 'none'
                                }}
                              />
                            );
                          })}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (voiceSearch.transcript.trim()) {
                                handleSearchSubmit(voiceSearch.transcript.trim());
                              }
                              voiceSearch.stopListening();
                            }}
                            className="px-2.5 py-1 text-[10px] font-mono font-bold bg-green-600 hover:bg-green-700 text-white rounded-xs uppercase tracking-wider flex items-center gap-1 transition-colors"
                          >
                            <Check size={12} />
                            {t('voice.search_action', { defaultValue: 'Buscar' })}
                          </button>
                          <button
                            type="button"
                            onClick={() => voiceSearch.stopListening()}
                            className="px-2 py-1 text-[10px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xs uppercase tracking-wider flex items-center gap-1 transition-colors"
                          >
                            <MicOff size={12} />
                            {t('voice.stop_action', { defaultValue: 'Parar' })}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Real-Time Full-Width SVG Waveform (Scales crests to voice amplitude) */}
                    <div className="mt-2.5 pt-2 border-t border-red-500/20">
                      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">
                        <span className="uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-ping" />
                          Onda Acústica Dinâmica
                        </span>
                        <span>Escala Vocal: {Math.round(voiceSearch.amplitude * 100)}%</span>
                      </div>
                      <DynamicWaveform
                        amplitude={voiceSearch.amplitude}
                        height={30}
                      />
                    </div>

                    {/* Voice Amplitude Linear Bar Gauge */}
                    <div className="mt-2 w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-75 rounded-full"
                        style={{
                          width: `${Math.max(4, Math.min(100, voiceSearch.amplitude * 100))}%`,
                          backgroundColor: voiceSearch.amplitude > 0.75 ? '#ef4444' : voiceSearch.amplitude > 0.45 ? '#f59e0b' : '#22c55e'
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 px-4 py-2 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-100/30 dark:bg-zinc-900/30 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: t('categories.All', { defaultValue: 'Todos' }), count: searchResults.total },
                  { id: 'products', label: `🛒 ${t('nav.shop', { defaultValue: 'Produtos' })}`, count: searchResults.products.length },
                  { id: 'articles', label: `📰 ${t('nav.blog', { defaultValue: 'Artigos' })}`, count: searchResults.articles.length },
                  { id: 'categories', label: `🏷️ ${t('nav.categories', { defaultValue: 'Categorias' })}`, count: searchResults.categories.length },
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
                            {t('header.recent_searches', { defaultValue: 'Buscas Recentes' })}
                          </span>
                          <button
                            onClick={clearRecentSearches}
                            className="text-[9px] font-mono text-zinc-400 hover:text-red-500 transition-colors uppercase tracking-wider"
                          >
                            {t('header.clear', { defaultValue: 'Limpar' })}
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
                        {t('header.popular_suggestions', { defaultValue: 'Termos Populares & Sugestões' })}
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

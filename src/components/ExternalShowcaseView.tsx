import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, 
  Share2, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  Tag, 
  Search, 
  Filter, 
  Award, 
  Ruler, 
  ArrowRight, 
  Star, 
  Heart, 
  Check, 
  ShoppingBag, 
  Building2, 
  Zap, 
  Clock, 
  Copy,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { Product } from '../types';
import BJJImage from './BJJImage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ExternalShowcaseViewProps {
  productList: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onCheckout: (product: Product) => void;
  wishlist: Set<string>;
  onToggleWishlist: (product: Product) => void;
  onOpenSizeChart?: () => void;
  onOpenExchangeModal?: () => void;
  onNavigate: (view: any) => void;
  onSignIn?: () => void;
  user?: any;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  playClickSound?: () => void;
}

export const ExternalShowcaseView: React.FC<ExternalShowcaseViewProps> = ({
  productList = [],
  onSelectProduct,
  onAddToCart,
  onCheckout,
  wishlist,
  onToggleWishlist,
  onOpenSizeChart,
  onOpenExchangeModal,
  onNavigate,
  onSignIn,
  user,
  addToast,
  playClickSound
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [copiedLink, setCopiedLink] = useState(false);

  const categories = [
    { id: 'TODOS', label: 'Tudo', icon: '🥋' },
    { id: 'Kimonos', label: 'Kimonos', icon: '🥋' },
    { id: 'Rashguards', label: 'Rashguards No-Gi', icon: '⚡' },
    { id: 'Faixas', label: 'Faixas & Graduação', icon: '🎗️' },
    { id: 'Protetores', label: 'Proteções & Joelheiras', icon: '🛡️' },
    { id: 'Acessórios', label: 'Bolsas & Acessórios', icon: '🎒' }
  ];

  // Best deal / discount calculation
  const deals = useMemo(() => {
    return productList.filter(p => p.originalPrice && p.originalPrice > p.price);
  }, [productList]);

  const filtered = useMemo(() => {
    return productList.filter(p => {
      const matchCat = selectedCategory === 'TODOS' || 
        p.category?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (selectedCategory === 'Kimonos' && p.title.toLowerCase().includes('kimono')) ||
        (selectedCategory === 'Rashguards' && (p.title.toLowerCase().includes('rash') || p.title.toLowerCase().includes('lycra'))) ||
        (selectedCategory === 'Faixas' && p.title.toLowerCase().includes('faixa')) ||
        (selectedCategory === 'Protetores' && (p.title.toLowerCase().includes('protetor') || p.title.toLowerCase().includes('joelheira')));
      
      const matchSearch = !searchTerm || 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.brand.toLowerCase().includes(searchTerm.toLowerCase());

      return matchCat && matchSearch;
    });
  }, [productList, selectedCategory, searchTerm]);

  const handleCopyPublicLink = () => {
    playClickSound?.();
    const url = window.location.origin + window.location.pathname + '?mode=external';
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      addToast('Link público da vitrine copiado para a área de transferência!', 'success');
      setTimeout(() => setCopiedLink(false), 3000);
    }).catch(() => {
      addToast('Não foi possível copiar o link.', 'error');
    });
  };

  return (
    <div className="w-full min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white transition-colors duration-200">
      
      {/* 1. TOP EXTERNAL VISUALIZATION CONTROLS BAR */}
      <div className="sticky top-16 z-30 bg-zinc-900 text-white border-b border-zinc-800 px-4 sm:px-6 py-2.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-green-400">
                  VISUALIZAÇÃO EXTERNA ATIVA
                </span>
                <span className="text-[9px] font-mono bg-zinc-800 text-zinc-300 px-1.5 py-0.2 border border-zinc-700">
                  Modo Vitrine Pública
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans hidden md:block">
                Exibição limpa para clientes, academias parceiras e visitantes externos sem painéis administrativos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopyPublicLink}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold uppercase transition-colors border border-zinc-700 cursor-pointer"
              title="Copiar link compartilhável para clientes"
            >
              {copiedLink ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
              <span>{copiedLink ? 'Copiado!' : 'Compartilhar Vitrine'}</span>
            </button>

            {user ? (
              <button
                onClick={() => {
                  playClickSound?.();
                  onNavigate('DASHBOARD');
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-green-600 hover:bg-green-500 text-black text-xs font-mono font-black uppercase transition-colors cursor-pointer"
              >
                <span>Voltar ao Meu Painel</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <button
                onClick={() => {
                  playClickSound?.();
                  onSignIn?.();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-black hover:bg-zinc-200 text-xs font-mono font-black uppercase transition-colors cursor-pointer"
              >
                <span>Acessar / Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. CINEMATIC HERO BANNER (VISUAL FIRST) */}
      <div className="relative overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-white py-12 md:py-20 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles size={14} className="text-green-400" />
                <span>Curadoria Oficial do Jiu-Jitsu Brasileiro</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight font-mono leading-tight">
                VITRINE OFICIAL DO TATAME
              </h1>
              <p className="text-sm sm:text-base text-zinc-300 font-sans leading-relaxed">
                Equipamentos de alta performance, kimonos homologados, faixas e proteções com comparação de preços em tempo real e troca facilitada para atletas de todas as graduações.
              </p>

              {/* Live Trust Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="flex items-center gap-2 p-2 bg-zinc-900/60 border border-zinc-800 text-[11px] font-mono">
                  <ShieldCheck size={16} className="text-green-400 shrink-0" />
                  <span>Curadoria Faixa Preta</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-zinc-900/60 border border-zinc-800 text-[11px] font-mono">
                  <RefreshCw size={16} className="text-green-400 shrink-0" />
                  <span>Troca em 30 Dias</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-zinc-900/60 border border-zinc-800 text-[11px] font-mono">
                  <TrendingDown size={16} className="text-green-400 shrink-0" />
                  <span>Menor Preço Alertas</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-zinc-900/60 border border-zinc-800 text-[11px] font-mono">
                  <Building2 size={16} className="text-green-400 shrink-0" />
                  <span>120+ Dojos Parceiros</span>
                </div>
              </div>
            </div>

            {/* Visual Quick Search & Filter Widget */}
            <div className="w-full md:w-96 bg-zinc-900/90 border border-zinc-800 p-5 space-y-4 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-mono font-black uppercase text-zinc-300 flex items-center gap-1.5">
                  <Search size={14} className="text-green-400" />
                  Busca Rápida na Vitrine
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {filtered.length} itens disponíveis
                </span>
              </div>

              <div className="relative">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ex: Kimono Trançado, Faixa Azul, Rashguard..."
                  className="bg-black border-zinc-700 text-white text-xs h-10 pl-3 pr-8 rounded-none"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-2.5 text-zinc-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenSizeChart?.()}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-mono font-bold uppercase flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors"
                >
                  <Ruler size={13} className="text-green-400" />
                  <span>Tabela de Medidas</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenExchangeModal?.()}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-mono font-bold uppercase flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors"
                >
                  <RefreshCw size={13} className="text-green-400" />
                  <span>Garantia de Troca</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. VISUAL CATEGORY PILLS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black uppercase text-zinc-500 dark:text-zinc-400">
              Categorias Principais:
            </span>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Mostrando {filtered.length} de {productList.length} itens
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                playClickSound?.();
                setSelectedCategory(cat.id);
              }}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 shrink-0 border cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. VISUAL PRODUCT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {filtered.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-8 space-y-3">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-zinc-400">
              <Search size={28} />
            </div>
            <h3 className="text-base font-mono font-black uppercase text-black dark:text-white">
              Nenhum equipamento encontrado para esta busca
            </h3>
            <p className="text-xs text-zinc-500 font-sans max-w-sm mx-auto">
              Tente selecionar outra categoria ou limpar os termos da pesquisa.
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('TODOS');
              }}
              variant="outline"
              className="font-mono text-xs uppercase"
            >
              Ver Todos os Equipamentos
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product) => {
              const isWishlisted = wishlist.has(product.id);
              const discountPercent = product.originalPrice && product.originalPrice > product.price
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : null;

              return (
                <div
                  key={product.id}
                  className="group bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 hover:border-black dark:hover:border-white transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-xl"
                >
                  {/* Image & Badges */}
                  <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-900 overflow-hidden cursor-pointer" onClick={() => onSelectProduct(product)}>
                    <BJJImage
                      src={product.imageUrl}
                      alt={product.title}
                      aspectRatio="aspect-square"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
                      {discountPercent && (
                        <span className="bg-red-600 text-white font-mono text-[10px] font-black px-2 py-0.5 shadow-sm">
                          -{discountPercent}% OFF
                        </span>
                      )}
                      <span className="bg-black/80 dark:bg-white/90 text-white dark:text-black font-mono text-[9px] font-bold px-1.5 py-0.5 uppercase backdrop-blur-xs">
                        {product.platform || 'Oficial'}
                      </span>
                    </div>

                    {/* Wishlist Heart */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playClickSound?.();
                        onToggleWishlist(product);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-xs flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-red-600 transition-colors shadow-md z-10 cursor-pointer"
                      title={isWishlisted ? "Remover dos favoritos" : "Salvar equipamento"}
                    >
                      <Heart size={16} className={isWishlisted ? "fill-red-600 text-red-600" : ""} />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase">
                        <span>{product.brand}</span>
                        <span>{product.category}</span>
                      </div>
                      <h3 
                        onClick={() => onSelectProduct(product)}
                        className="text-xs font-mono font-bold text-black dark:text-white line-clamp-2 hover:underline cursor-pointer leading-snug"
                      >
                        {product.title}
                      </h3>
                    </div>

                    {/* Pricing */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-mono font-black text-green-600 dark:text-green-400">
                          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs font-mono text-zinc-400 line-through">
                            R$ {product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">
                        Em até 10x sem juros no Pix/Cartão
                      </span>
                    </div>

                    {/* Direct Visual Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound?.();
                          onAddToCart(product);
                        }}
                        className="py-2.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white font-mono text-[10px] font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-200 dark:border-zinc-800"
                      >
                        <ShoppingBag size={12} />
                        <span>Sacola</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playClickSound?.();
                          onCheckout(product);
                        }}
                        className="py-2.5 bg-green-600 hover:bg-green-500 text-black font-mono text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1 shadow-md cursor-pointer"
                      >
                        <span>Comprar</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. PARTNER ACADEMIES & CONFIDENCE BADGES */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono font-black uppercase text-green-600 tracking-widest block">
              REDE HOMOLOGADA
            </span>
            <h3 className="text-xl font-mono font-black uppercase text-black dark:text-white">
              Confiado por Dojos & Atletas em Todo o Brasil
            </h3>
            <p className="text-xs text-zinc-500 max-w-xl mx-auto font-sans">
              Mais de 120 centros de treinamento de Jiu-Jitsu recomendam o ecossistema OSS.OS para aquisição de kimonos homologados para treino diário e competições IBJJF/CBJJ.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 opacity-80 grayscale hover:grayscale-0 transition-all">
            {['Alliance Jiu-Jitsu', 'Gracie Barra', 'Checkmat BJJ', 'Nova União', 'Atos Jiu-Jitsu', 'GFTeam', 'Ribeiro Jiu-Jitsu'].map((gym) => (
              <div 
                key={gym}
                className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
              >
                🥋 {gym}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ExternalShowcaseView;

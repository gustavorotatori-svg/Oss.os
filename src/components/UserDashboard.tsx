import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Bookmark, 
  Bell, 
  ShoppingBag, 
  LogOut, 
  Trash2, 
  ExternalLink,
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Settings, 
  Flame, 
  Award, 
  Clock,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Laptop,
  Scale,
  Ruler,
  TrendingDown,
  RefreshCw,
  Search,
  Check
} from 'lucide-react';
import { Product } from '../types';
import BJJImage from './BJJImage';

export interface UserDashboardProps {
  user: any;
  onSignOut: () => void;
  wishlistCount: number;
  reviewsCount?: number;
  alertsCount: number;
  onNavigate: (view: string) => void;
  loyaltyEnabled?: boolean;
  loyaltyPointsRatio?: number;
  loyaltyWelcomeBonus?: number;
  loyaltyReviewBonus?: number;
  loyaltyMinRedeemPoints?: number;
  loyaltyDiscountValue?: number;
  initialFocusMode?: any;
  onFocusModeChange?: (mode: any) => void;
  viewedProductIds?: string[];
  productList?: Product[];
  wishlistProducts?: Product[];
  wishlistAlerts?: Set<string>;
  onTogglePriceAlert?: (productId: string) => Promise<boolean | void> | void;
  onSelectProduct?: (product: Product) => void;
  onAddReview?: (productId: string, review: any) => void;
  addToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  playClickSound?: () => void;
  userBelt?: string;
  onUpdateUserBelt?: (belt: string) => Promise<void> | void;
  filterByTechnicalLevel?: boolean;
  onToggleFilterByTechnicalLevel?: (enabled: boolean) => void;
  themePreference?: 'light' | 'dark' | 'system';
  onSelectTheme?: (preference: 'light' | 'dark' | 'system') => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  onSignOut,
  wishlistCount = 0,
  alertsCount = 0,
  onNavigate,
  productList = [],
  wishlistProducts = [],
  wishlistAlerts = new Set(),
  viewedProductIds = [],
  onTogglePriceAlert,
  onSelectProduct,
  addToast = (_msg?: string, _type?: 'success' | 'error' | 'info') => {},
  playClickSound = () => {},
  userBelt = 'Branca',
  onUpdateUserBelt,
  themePreference = 'system',
  onSelectTheme
}) => {
  const [activeTab, setActiveTab] = useState<'wishlist' | 'alerts' | 'history' | 'preferences'>('wishlist');
  const [selectedBelt, setSelectedBelt] = useState(userBelt || 'Branca');

  const bjjBelts = [
    { name: 'Branca', color: 'bg-zinc-100 text-black border-zinc-300', patch: 'bg-black', stripes: 4, rankLabel: 'Iniciante' },
    { name: 'Azul', color: 'bg-blue-600 text-white border-blue-700', patch: 'bg-black', stripes: 4, rankLabel: 'Intermediário' },
    { name: 'Roxa', color: 'bg-purple-600 text-white border-purple-700', patch: 'bg-black', stripes: 4, rankLabel: 'Avançado' },
    { name: 'Marrom', color: 'bg-amber-900 text-white border-amber-950', patch: 'bg-black', stripes: 4, rankLabel: 'Quase Mestre' },
    { name: 'Preta', color: 'bg-zinc-950 text-white border-zinc-800', patch: 'bg-red-600', stripes: 6, rankLabel: 'Faixa Preta' },
  ];

  // Resolve alerted products memoized
  const alertedProducts = useMemo(() => {
    return productList.filter(p => wishlistAlerts.has(p.id));
  }, [productList, wishlistAlerts]);

  // Memoize history products resolved from viewedProductIds and productList
  const historyProducts = useMemo(() => {
    if (!productList || productList.length === 0 || !viewedProductIds || viewedProductIds.length === 0) {
      return productList.slice(0, 4);
    }
    const resolved = viewedProductIds
      .map(id => productList.find(p => p.id === id))
      .filter((p): p is Product => p !== undefined);
    return resolved.length > 0 ? resolved : productList.slice(0, 4);
  }, [viewedProductIds, productList]);

  // Calculate estimated savings from wishlist discounts
  const estimatedSavings = useMemo(() => {
    return wishlistProducts.reduce((acc, p) => {
      if (p.originalPrice && p.originalPrice > p.price) {
        return acc + (p.originalPrice - p.price);
      }
      return acc + (p.price * 0.1); // baseline 10%
    }, 0);
  }, [wishlistProducts]);

  const handleSelectBelt = async (beltName: string) => {
    playClickSound();
    setSelectedBelt(beltName);
    if (onUpdateUserBelt) {
      await onUpdateUserBelt(beltName);
    }
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 }
    });
    addToast(`Graduação atualizada para Faixa ${beltName}!`, 'success');
  };

  const currentBeltObj = bjjBelts.find(b => b.name === selectedBelt) || bjjBelts[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 space-y-6 text-black dark:text-white font-sans animate-fadeIn">
      
      {/* 1. VISUAL ATHLETE PROFILE CARD WITH REALISTIC BELT */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 z-10">
          <div className="relative">
            <div className="w-16 h-16 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-mono font-black text-xl flex items-center justify-center border-2 border-black dark:border-white shadow-md">
              {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'BJJ'}
            </div>
            <span className="absolute -bottom-1 -right-1 p-1 bg-green-500 rounded-full text-black border-2 border-white dark:border-zinc-900">
              <Sparkles size={11} />
            </span>
          </div>

          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-mono font-black uppercase text-black dark:text-white">
                {user?.displayName || 'Atleta do Tatame'}
              </h1>
              <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 font-mono text-[9px] font-black uppercase">
                Conta Verificada
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-mono">
              {user?.email || 'atleta@oss.os'}
            </p>

            {/* Visual Belt Graphic */}
            <div className="pt-1.5 flex items-center gap-2">
              <div className={`h-6 px-3 flex items-center gap-2 border shadow-xs ${currentBeltObj.color}`}>
                <span className="text-[10px] font-mono font-black uppercase tracking-wider">
                  Faixa {currentBeltObj.name}
                </span>
                <div className={`h-full w-4 flex items-center justify-center gap-0.5 px-0.5 ${currentBeltObj.patch}`}>
                  <span className="w-0.5 h-3 bg-white"></span>
                  <span className="w-0.5 h-3 bg-white"></span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                • {currentBeltObj.rankLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Quick External Showcase & Logout CTA */}
        <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100 dark:border-zinc-900 z-10">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onNavigate('EXTERNAL_SHOWCASE');
            }}
            className="flex-1 md:flex-none px-4 py-2.5 bg-green-600 hover:bg-green-500 text-black font-mono text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            title="Visualizar a plataforma como visitante ou cliente externo"
          >
            <Eye size={14} />
            <span>Ver Vitrine Externa</span>
          </button>

          <button
            type="button"
            onClick={onSignOut}
            className="px-3.5 py-2.5 bg-zinc-100 hover:bg-red-500/10 text-zinc-600 hover:text-red-600 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-red-400 border border-zinc-200 dark:border-zinc-800 font-mono text-xs font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Sair da conta"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>

      {/* 2. VISUAL METRICS AT A GLANCE (NO TEXT WALLS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div 
          onClick={() => setActiveTab('wishlist')}
          className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-4 hover:border-black dark:hover:border-white transition-all cursor-pointer group space-y-1 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Salvos no Tatame
            </span>
            <div className="p-1.5 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
              <Bookmark size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-black dark:text-white">
            {wishlistCount}
          </div>
          <p className="text-[10px] text-zinc-500 font-sans truncate">
            {wishlistCount > 0 ? 'Equipamentos monitorados' : 'Nenhum salvo ainda'}
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('alerts')}
          className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-4 hover:border-black dark:hover:border-white transition-all cursor-pointer group space-y-1 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Alertas Ativos
            </span>
            <div className="p-1.5 bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-colors">
              <Bell size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-black dark:text-white">
            {alertsCount}
          </div>
          <p className="text-[10px] text-zinc-500 font-sans truncate">
            {alertsCount > 0 ? 'Monitorando menor valor' : 'Pronto para ativar'}
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('history')}
          className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-4 hover:border-black dark:hover:border-white transition-all cursor-pointer group space-y-1 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Vistos Recentemente
            </span>
            <div className="p-1.5 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
              <Clock size={15} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-black dark:text-white">
            {historyProducts.length}
          </div>
          <p className="text-[10px] text-zinc-500 font-sans truncate">
            Histórico visual de produtos
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Economia Estimada
            </span>
            <div className="p-1.5 bg-green-500/10 text-green-500">
              <TrendingDown size={15} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-black text-green-600 dark:text-green-400 truncate">
            R$ {estimatedSavings.toFixed(2)}
          </div>
          <p className="text-[10px] text-zinc-500 font-sans truncate">
            Descontos médios dos seus itens
          </p>
        </div>

      </div>

      {/* 3. VISUAL BELT GRADUATION SELECTOR (COMPACT & INTUITIVE) */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-amber-500" />
            <h3 className="text-xs font-mono font-black uppercase text-black dark:text-white">
              Sua Graduação no Tatame (Clique para Mudar)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            Atual: <strong>Faixa {selectedBelt}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {bjjBelts.map((belt) => (
            <button
              key={belt.name}
              type="button"
              onClick={() => handleSelectBelt(belt.name)}
              className={`p-2.5 border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                selectedBelt === belt.name
                  ? 'border-black dark:border-white ring-2 ring-green-500 shadow-md bg-zinc-50 dark:bg-zinc-900'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 bg-white dark:bg-zinc-950'
              }`}
            >
              <div className={`w-full h-4 ${belt.color} flex items-center justify-between px-1.5`}>
                <span className="text-[7.5px] font-mono font-bold">{belt.name}</span>
                <span className={`w-2 h-full ${belt.patch}`}></span>
              </div>
              <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-300">
                {belt.name} {selectedBelt === belt.name && '✓'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. VISUAL QUICK ACTION TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={() => {
            playClickSound();
            onNavigate('SHOP');
          }}
          className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 flex items-center gap-2.5 transition-all text-left cursor-pointer group"
        >
          <div className="p-2 bg-black dark:bg-white text-white dark:text-black group-hover:scale-110 transition-transform">
            <ShoppingBag size={14} />
          </div>
          <div>
            <span className="text-[11px] font-mono font-black uppercase block text-black dark:text-white">
              Explorar Loja
            </span>
            <span className="text-[9px] text-zinc-400 font-sans">
              Catálogo completo
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            playClickSound();
            onNavigate('COMPARATOR');
          }}
          className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 flex items-center gap-2.5 transition-all text-left cursor-pointer group"
        >
          <div className="p-2 bg-green-600 text-black group-hover:scale-110 transition-transform">
            <Scale size={14} />
          </div>
          <div>
            <span className="text-[11px] font-mono font-black uppercase block text-black dark:text-white">
              Comparador
            </span>
            <span className="text-[9px] text-zinc-400 font-sans">
              Menores preços
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            playClickSound();
            onNavigate('EXTERNAL_SHOWCASE');
          }}
          className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 flex items-center gap-2.5 transition-all text-left cursor-pointer group"
        >
          <div className="p-2 bg-blue-600 text-white group-hover:scale-110 transition-transform">
            <Eye size={14} />
          </div>
          <div>
            <span className="text-[11px] font-mono font-black uppercase block text-black dark:text-white">
              Modo Vitrine
            </span>
            <span className="text-[9px] text-zinc-400 font-sans">
              Visão de cliente
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            playClickSound();
            setActiveTab('preferences');
          }}
          className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 flex items-center gap-2.5 transition-all text-left cursor-pointer group"
        >
          <div className="p-2 bg-zinc-800 text-white group-hover:scale-110 transition-transform">
            <Settings size={14} />
          </div>
          <div>
            <span className="text-[11px] font-mono font-black uppercase block text-black dark:text-white">
              Preferências
            </span>
            <span className="text-[9px] text-zinc-400 font-sans">
              Tema e ajustes
            </span>
          </div>
        </button>
      </div>

      {/* 5. VISUAL TABS NAVIGATION */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto no-scrollbar pt-2">
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setActiveTab('wishlist');
          }}
          className={`pb-3 px-3 font-mono text-xs font-black uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'wishlist'
              ? 'border-black dark:border-white text-black dark:text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
        >
          <Bookmark size={14} />
          <span>Equipamentos Salvos ({wishlistCount})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playClickSound();
            setActiveTab('alerts');
          }}
          className={`pb-3 px-3 font-mono text-xs font-black uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'alerts'
              ? 'border-black dark:border-white text-black dark:text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
        >
          <Bell size={14} />
          <span>Alertas de Preço ({alertsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playClickSound();
            setActiveTab('history');
          }}
          className={`pb-3 px-3 font-mono text-xs font-black uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'history'
              ? 'border-black dark:border-white text-black dark:text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
        >
          <Clock size={14} />
          <span>Vistos Recentemente ({historyProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playClickSound();
            setActiveTab('preferences');
          }}
          className={`pb-3 px-3 font-mono text-xs font-black uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'preferences'
              ? 'border-black dark:border-white text-black dark:text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
        >
          <Settings size={14} />
          <span>Ajustes & Tema</span>
        </button>
      </div>

      {/* 6. TAB CONTENT (STREAMLINED, VISUAL, NO INFINITE READING) */}
      <div className="pt-2">
        
        {/* Tab 1: Wishlist */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistProducts.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 space-y-4">
                <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-zinc-400">
                  <Bookmark size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-mono font-black uppercase text-black dark:text-white">
                    Sua lista de salvos está vazia
                  </h4>
                  <p className="text-xs text-zinc-400 font-sans max-w-sm mx-auto">
                    Navegue pela vitrine e clique no coração para salvar kimonos e rashguards de interesse.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('SHOP')}
                  className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-black uppercase cursor-pointer"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {wishlistProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-3 flex flex-col justify-between space-y-2 group hover:border-black dark:hover:border-white transition-all shadow-xs"
                  >
                    <div className="aspect-square bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden">
                      <BJJImage
                        src={product.imageUrl}
                        alt={product.title}
                        aspectRatio="aspect-square"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="absolute top-2 left-2 bg-red-600 text-white font-mono text-[9px] font-black px-1.5 py-0.5">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-zinc-400 uppercase block truncate">
                        {product.brand} • {product.category}
                      </span>
                      <h4 className="text-xs font-mono font-bold text-black dark:text-white line-clamp-2">
                        {product.title}
                      </h4>
                      <div className="flex items-baseline gap-2 pt-0.5">
                        <span className="text-sm font-mono font-black text-green-600 dark:text-green-400">
                          R$ {product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[10px] font-mono text-zinc-400 line-through">
                            R$ {product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-900">
                      <button
                        type="button"
                        onClick={() => onSelectProduct?.(product)}
                        className="flex-1 py-2 bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] font-bold uppercase transition-colors text-center cursor-pointer"
                      >
                        Ver Detalhes
                      </button>
                      {onTogglePriceAlert && (
                        <button
                          type="button"
                          onClick={() => onTogglePriceAlert(product.id)}
                          className={`p-2 border font-mono text-[10px] transition-colors cursor-pointer ${
                            wishlistAlerts.has(product.id)
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                              : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white'
                          }`}
                          title={wishlistAlerts.has(product.id) ? 'Alerta Ativo' : 'Criar Alerta de Preço'}
                        >
                          <Bell size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Price Alerts */}
        {activeTab === 'alerts' && (
          <div>
            {alertedProducts.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 space-y-4">
                <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                  <Bell size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-mono font-black uppercase text-black dark:text-white">
                    Nenhum alerta de preço ativo
                  </h4>
                  <p className="text-xs text-zinc-400 font-sans max-w-sm mx-auto">
                    Ative o sino nos produtos favoritados para receber notificações automáticas de desconto.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('SHOP')}
                  className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-black uppercase cursor-pointer"
                >
                  Explorar Equipamentos
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {alertedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-3.5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 shrink-0 border border-zinc-200 dark:border-zinc-800">
                        <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 text-left">
                        <span className="text-[9px] font-mono text-zinc-400 uppercase block truncate">
                          {p.brand} • {p.category}
                        </span>
                        <h4 className="text-xs font-mono font-bold text-black dark:text-white truncate">
                          {p.title}
                        </h4>
                        <span className="text-xs font-mono font-black text-green-600 dark:text-green-400">
                          R$ {p.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2 py-1 font-bold uppercase hidden sm:inline">
                        Monitorando Queda
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectProduct?.(p)}
                        className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white font-mono text-[10px] font-bold uppercase cursor-pointer"
                      >
                        Ver
                      </button>
                      {onTogglePriceAlert && (
                        <button
                          type="button"
                          onClick={() => onTogglePriceAlert(p.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Remover alerta"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: History */}
        {activeTab === 'history' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {historyProducts.map((product) => (
              <div 
                key={product.id}
                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-3 space-y-2 flex flex-col justify-between"
              >
                <div className="aspect-square bg-zinc-100 dark:bg-zinc-900 relative overflow-hidden">
                  <BJJImage
                    src={product.imageUrl}
                    alt={product.title}
                    aspectRatio="aspect-square"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-zinc-400 uppercase block truncate">
                    {product.brand}
                  </span>
                  <h4 className="text-xs font-mono font-bold text-black dark:text-white line-clamp-2">
                    {product.title}
                  </h4>
                  <div className="flex items-baseline gap-2 pt-0.5">
                    <span className="text-sm font-mono font-black text-green-600 dark:text-green-400">
                      R$ {product.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectProduct?.(product)}
                  className="w-full py-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-mono text-[10px] font-bold uppercase transition-colors text-center cursor-pointer"
                >
                  Acessar Produto
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Preferences & Theme */}
        {activeTab === 'preferences' && (
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-6 space-y-6 max-w-2xl">
            <div className="space-y-1 text-left">
              <h3 className="text-sm font-mono font-black uppercase text-black dark:text-white">
                Seletor de Tema Visual
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                Escolha o modo de exibição ou use o modo automático (Claro das 06h às 18h, Escuro das 18h às 24h).
              </p>
            </div>

            {onSelectTheme && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onSelectTheme('system');
                  }}
                  className={`p-3 border text-left transition-all cursor-pointer ${
                    themePreference === 'system'
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 bg-white dark:bg-zinc-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Laptop size={16} />
                    <span className="text-[8px] font-mono px-1 bg-green-600 text-white font-bold">6H-18H</span>
                  </div>
                  <span className="text-xs font-mono font-bold uppercase block mt-2">Automático</span>
                  <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">Claro de dia, escuro à noite</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onSelectTheme('light');
                  }}
                  className={`p-3 border text-left transition-all cursor-pointer ${
                    themePreference === 'light'
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 bg-white dark:bg-zinc-950'
                  }`}
                >
                  <Sun size={16} className="text-amber-500" />
                  <span className="text-xs font-mono font-bold uppercase block mt-2">Modo Claro</span>
                  <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">Sempre claro</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onSelectTheme('dark');
                  }}
                  className={`p-3 border text-left transition-all cursor-pointer ${
                    themePreference === 'dark'
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 bg-white dark:bg-zinc-950'
                  }`}
                >
                  <Moon size={16} className="text-blue-400" />
                  <span className="text-xs font-mono font-bold uppercase block mt-2">Modo Escuro</span>
                  <span className="text-[10px] text-zinc-400 font-sans block mt-0.5">Sempre escuro</span>
                </button>
              </div>
            )}

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-mono">
                Sessão ativa como: <strong>{user?.displayName || user?.email}</strong>
              </span>
              <button
                type="button"
                onClick={onSignOut}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-black uppercase transition-colors cursor-pointer"
              >
                Encerrar Sessão
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default UserDashboard;

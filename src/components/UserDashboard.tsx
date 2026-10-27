import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  Award
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
  initialFocusMode?: string;
  onFocusModeChange?: (mode: string) => void;
  viewedProductIds?: string[];
  productList?: Product[];
  wishlistProducts?: Product[];
  wishlistAlerts?: Set<string>;
  onTogglePriceAlert?: (productId: string) => void;
  onSelectProduct?: (product: Product) => void;
  onAddReview?: (productId: string, review: any) => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  playClickSound?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  onSignOut,
  wishlistCount,
  alertsCount,
  onNavigate,
  loyaltyEnabled = false,
  productList = [],
  wishlistProducts = [],
  wishlistAlerts = new Set(),
  onTogglePriceAlert,
  onSelectProduct,
  addToast,
  playClickSound
}) => {
  const [activeTab, setActiveTab] = useState<'wishlist' | 'alerts' | 'account'>('wishlist');

  // Filter alerted products
  const alertedProducts = productList.filter(p => wishlistAlerts.has(p.id));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-6">
      
      {/* 1. COMPACT ATHLETE PROFILE BAR */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-mono font-black text-base flex items-center justify-center border border-zinc-800">
            {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'BJJ'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black uppercase text-black dark:text-white font-mono">
                {user?.displayName || 'Atleta OSS'}
              </h1>
              <span className="text-[9px] font-mono font-bold bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 border border-zinc-200 dark:border-zinc-700">
                {user?.belt ? `Faixa ${user.belt}` : 'Atleta Cadastrado'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              {user?.email || 'atleta@oss.os'}
            </p>
          </div>
        </div>

        {/* Operational Stats & Logout */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100 dark:border-zinc-900">
          <button
            onClick={() => onNavigate('SHOP')}
            className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-black dark:text-white font-mono text-xs font-bold uppercase transition-colors"
          >
            Ver Acervo
          </button>
          <button
            onClick={onSignOut}
            className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 font-mono text-xs font-bold uppercase transition-colors flex items-center gap-1.5"
            title="Encerrar sessão"
          >
            <LogOut size={13} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* 2. OPERATIONAL NAVIGATION TABS */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
        <button
          onClick={() => {
            setActiveTab('wishlist');
            playClickSound?.();
          }}
          className={`pb-3 px-3 font-mono text-xs font-black uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'wishlist'
              ? 'border-black dark:border-white text-black dark:text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
          }`}
        >
          <Bookmark size={14} />
          <span>Salvos ({wishlistCount})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('alerts');
            playClickSound?.();
          }}
          className={`pb-3 px-3 font-mono text-xs font-black uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'alerts'
              ? 'border-black dark:border-white text-black dark:text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
          }`}
        >
          <Bell size={14} />
          <span>Alertas de Preço ({alertsCount})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('account');
            playClickSound?.();
          }}
          className={`pb-3 px-3 font-mono text-xs font-black uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'account'
              ? 'border-black dark:border-white text-black dark:text-white'
              : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
          }`}
        >
          <Settings size={14} />
          <span>Configurações</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          {wishlistProducts.length === 0 ? (
            <div className="p-12 text-center bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <Bookmark size={28} className="mx-auto text-zinc-400" />
              <div className="space-y-1">
                <p className="text-sm font-mono font-bold text-black dark:text-white uppercase">
                  Sua lista de desejos está vazia
                </p>
                <p className="text-xs text-zinc-500 font-sans">
                  Navegue pelo catálogo e clique no ícone de marcador para salvar kimonos e rashguards de interesse.
                </p>
              </div>
              <button
                onClick={() => onNavigate('SHOP')}
                className="mt-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-black uppercase tracking-wider"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {wishlistProducts.map((product) => (
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
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wide block">
                      {product.brand}
                    </span>
                    <h3 className="text-xs font-mono font-bold text-black dark:text-white line-clamp-2">
                      {product.title}
                    </h3>
                    <div className="flex items-baseline gap-2 pt-1">
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
                      onClick={() => onSelectProduct?.(product)}
                      className="flex-1 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-mono text-[10px] font-bold uppercase text-center"
                    >
                      Ver Detalhes
                    </button>
                    {onTogglePriceAlert && (
                      <button
                        onClick={() => onTogglePriceAlert(product.id)}
                        className={`p-2 border font-mono text-[10px] transition-colors ${
                          wishlistAlerts.has(product.id)
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                            : 'border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-black dark:hover:text-white'
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

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {alertedProducts.length === 0 ? (
            <div className="p-12 text-center bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <Bell size={28} className="mx-auto text-zinc-400" />
              <div className="space-y-1">
                <p className="text-sm font-mono font-bold text-black dark:text-white uppercase">
                  Nenhum alerta de preço ativo
                </p>
                <p className="text-xs text-zinc-500 font-sans">
                  Ative alertas em qualquer produto do catálogo para ser notificado quando o preço cair.
                </p>
              </div>
              <button
                onClick={() => onNavigate('SHOP')}
                className="mt-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-black uppercase tracking-wider"
              >
                Ver Equipamentos
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {alertedProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3.5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 shrink-0 border border-zinc-200 dark:border-zinc-800">
                      <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
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
                    <button
                      onClick={() => onSelectProduct?.(p)}
                      className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-black dark:text-white font-mono text-[10px] font-bold uppercase"
                    >
                      Acessar
                    </button>
                    {onTogglePriceAlert && (
                      <button
                        onClick={() => onTogglePriceAlert(p.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                        title="Desativar Alerta"
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

      {activeTab === 'account' && (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-mono font-black uppercase text-black dark:text-white">
              Dados do Atleta
            </h3>
            <p className="text-xs text-zinc-500 font-sans">
              Gerencie suas preferências de sincronização e autenticação no ecossistema OSS.OS.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-zinc-400 uppercase text-[9px] block">Nome de Registro</span>
              <span className="font-bold text-black dark:text-white">{user?.displayName || 'Não informado'}</span>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-zinc-400 uppercase text-[9px] block">E-mail Vinculado</span>
              <span className="font-bold text-black dark:text-white">{user?.email || 'Não informado'}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
            <button
              onClick={onSignOut}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-black uppercase tracking-wider transition-colors"
            >
              Encerrar Sessão
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;

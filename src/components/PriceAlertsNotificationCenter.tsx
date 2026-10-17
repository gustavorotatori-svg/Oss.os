import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, BellRing, BellOff, X, Check, TrendingDown, Tag, 
  ExternalLink, Sparkles, Trash2, Mail, Smartphone, Zap, 
  ArrowRight, ShieldCheck, RefreshCw, ShoppingBag, Eye
} from 'lucide-react';
import { Product, InAppPriceAlertNotification, WishlistItem } from '../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface PriceAlertsNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: InAppPriceAlertNotification[];
  monitoredProducts: { product: Product; alert: Partial<WishlistItem> }[];
  onMarkAsRead?: (notificationId: string) => void;
  onClearAllNotifications?: () => void;
  onRemoveAlert?: (productId: string) => void;
  onEditAlert?: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
  onSimulatePriceDrop?: (product?: Product) => void;
  userEmail?: string;
}

export const PriceAlertsNotificationCenter: React.FC<PriceAlertsNotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications = [],
  monitoredProducts = [],
  onMarkAsRead,
  onClearAllNotifications,
  onRemoveAlert,
  onEditAlert,
  onSelectProduct,
  onSimulatePriceDrop,
  userEmail
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'alerts' | 'simulation'>('notifications');
  const safeNotifications = notifications || [];
  const safeMonitoredProducts = monitoredProducts || [];
  const unreadCount = safeNotifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Central de Alertas de Preço e Notificações"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-2xl bg-zinc-950 border border-zinc-800 text-white shadow-2xl overflow-hidden font-mono flex flex-col max-h-[88vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-black border-b border-zinc-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-950/80 border border-green-600/60 text-green-400 shadow-[2px_2px_0px_0px_rgba(34,197,94,0.3)]">
                <BellRing size={18} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                    CENTRAL DE ALERTAS DE PREÇO
                  </h2>
                  {unreadCount > 0 && (
                    <Badge className="bg-green-600 text-white border-none rounded-none text-[9px] px-1.5 py-0.5 animate-bounce">
                      {unreadCount} NOVO{unreadCount > 1 ? 'S' : ''}
                    </Badge>
                  )}
                </div>
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest">
                  Monitoramento em tempo real de Kimonos, Faixas e Suplementos
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all cursor-pointer"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-zinc-800 bg-zinc-900/50 text-[10px] uppercase font-bold shrink-0">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer border-b-2 ${
                activeTab === 'notifications'
                  ? 'border-green-500 text-green-400 bg-zinc-900'
                  : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/30'
              }`}
            >
              <TrendingDown size={14} />
              <span>Avisos de Queda ({safeNotifications.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer border-b-2 ${
                activeTab === 'alerts'
                  ? 'border-green-500 text-green-400 bg-zinc-900'
                  : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/30'
              }`}
            >
              <Tag size={14} />
              <span>Produtos Monitorados ({safeMonitoredProducts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('simulation')}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-all cursor-pointer border-b-2 ${
                activeTab === 'simulation'
                  ? 'border-red-500 text-red-400 bg-zinc-900'
                  : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/30'
              }`}
            >
              <Sparkles size={14} />
              <span>Simulador de Alerta</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4">

            {/* TAB 1: NOTIFICATIONS FEED */}
            {activeTab === 'notifications' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[9px] uppercase text-zinc-400 pb-1 border-b border-zinc-850">
                  <span>Notificações de Quedas de Preço & Ofertas</span>
                  {safeNotifications.length > 0 && onClearAllNotifications && (
                    <button
                      onClick={onClearAllNotifications}
                      className="text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={11} />
                      Limpar Histórico
                    </button>
                  )}
                </div>

                {safeNotifications.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-zinc-800 bg-zinc-900/20 p-6">
                    <Bell className="mx-auto mb-3 text-zinc-600 animate-pulse" size={32} />
                    <h3 className="text-xs font-bold uppercase text-zinc-300 mb-1">
                      Nenhum alerta de preço disparado ainda
                    </h3>
                    <p className="text-[9px] text-zinc-500 max-w-sm mx-auto mb-4">
                      Defina um preço alvo nos produtos para receber avisos imediatos por e-mail e push quando o valor atingir sua meta.
                    </p>
                    {safeMonitoredProducts.length > 0 ? (
                      <Button
                        onClick={() => {
                          if (onSimulatePriceDrop) {
                            onSimulatePriceDrop(monitoredProducts[0]?.product);
                          }
                        }}
                        className="bg-green-600 hover:bg-green-500 text-white rounded-none text-[9px] font-black uppercase tracking-wider py-1.5 px-4"
                      >
                        ⚡ Simular Disparo no 1º Favorito
                      </Button>
                    ) : (
                      <Button
                        onClick={onClose}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-none text-[9px] font-black uppercase tracking-wider py-1.5 px-4"
                      >
                        Explorar Catálogo e Configurar Alertas
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {safeNotifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3.5 border transition-all ${
                          !notif.isRead 
                            ? 'bg-zinc-900/90 border-green-500/60 shadow-[0_0_12px_rgba(34,197,94,0.15)]' 
                            : 'bg-zinc-900/40 border-zinc-800'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={notif.productImage}
                            alt={notif.productTitle}
                            className="w-14 h-14 object-cover border border-zinc-800 bg-white shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[8px] font-black uppercase tracking-wider text-green-400 flex items-center gap-1">
                                <Zap size={11} className="text-yellow-400" />
                                {notif.type === 'target_met' ? '🎯 PREÇO ALVO ATINGIDO' : '🔥 PROMOÇÃO RELÂMPAGO'}
                              </span>
                              <span className="text-[8px] text-zinc-500">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <h4 className="text-xs font-bold text-white truncate mt-0.5">
                              {notif.productTitle}
                            </h4>

                            <div className="flex items-center gap-3 mt-1.5">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-[9px] text-zinc-400">Hoje:</span>
                                <span className="text-xs font-black text-green-400">
                                  R$ {notif.currentPrice.toFixed(2)}
                                </span>
                              </div>

                              <div className="flex items-baseline gap-1">
                                <span className="text-[8px] text-zinc-500">Meta:</span>
                                <span className="text-[9px] text-zinc-300 font-bold">
                                  R$ {notif.targetPrice.toFixed(2)}
                                </span>
                              </div>

                              {notif.savings > 0 && (
                                <Badge variant="outline" className="rounded-none bg-green-500/10 text-green-400 border-green-500/40 text-[8px] px-1 py-0">
                                  Economia de R$ {notif.savings.toFixed(2)}
                                </Badge>
                              )}
                            </div>

                            {/* Action Bar */}
                            <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-zinc-800/80 gap-2">
                              <span className="text-[8px] text-zinc-500 uppercase">
                                Loja: {notif.platform}
                              </span>

                              <div className="flex items-center gap-2">
                                {!notif.isRead && onMarkAsRead && (
                                  <button
                                    onClick={() => onMarkAsRead(notif.id)}
                                    className="text-[8.5px] text-zinc-400 hover:text-white underline cursor-pointer"
                                  >
                                    Marcar como lida
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    if (onSelectProduct) {
                                      const found = safeMonitoredProducts.find(p => p.product.id === notif.productId)?.product;
                                      if (found) {
                                        onSelectProduct(found);
                                        onClose();
                                      }
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-green-600 hover:bg-green-500 text-white text-[8px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                                >
                                  <span>Ver Oferta</span>
                                  <ExternalLink size={10} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MONITORED PRODUCTS */}
            {activeTab === 'alerts' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[9px] uppercase text-zinc-400 pb-1 border-b border-zinc-850">
                  <span>Equipamentos com Alerta de Preço Ativo ({safeMonitoredProducts.length})</span>
                  <span className="text-zinc-500">Notificações Automáticas</span>
                </div>

                {safeMonitoredProducts.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-zinc-800 bg-zinc-900/20 p-6">
                    <Tag className="mx-auto mb-3 text-zinc-600" size={32} />
                    <h3 className="text-xs font-bold uppercase text-zinc-300 mb-1">
                      Nenhum produto configurado para alerta
                    </h3>
                    <p className="text-[9px] text-zinc-500 max-w-sm mx-auto mb-4">
                      Acesse a loja e clique no ícone de sino nos cards de kimonos, rashguards ou faixas para definir seu preço ideal.
                    </p>
                    <Button
                      onClick={onClose}
                      className="bg-green-600 hover:bg-green-500 text-white rounded-none text-[9px] font-black uppercase tracking-wider py-1.5 px-4"
                    >
                      Ir para o Catálogo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {safeMonitoredProducts.map(({ product, alert }) => {
                      const targetVal = alert.targetPrice || Math.round(product.price * 0.9);
                      const diff = product.price - targetVal;
                      const diffPct = Math.round((diff / product.price) * 100);

                      return (
                        <div
                          key={product.id}
                          className="p-3 bg-zinc-900/50 border border-zinc-800 flex items-center justify-between gap-3 hover:border-zinc-700 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-12 h-12 object-cover border border-zinc-800 bg-white shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[8px] font-black uppercase text-red-400 block truncate">
                                {product.brand} • {product.category}
                              </span>
                              <h4 className="text-xs font-bold text-white truncate">
                                {product.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] text-zinc-400">Atual: R$ {product.price.toFixed(2)}</span>
                                <span className="text-[9px] font-black text-green-400">
                                  Meta: R$ {targetVal.toFixed(2)} (-{diffPct}%)
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {onEditAlert && (
                              <button
                                onClick={() => onEditAlert(product)}
                                className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[8.5px] uppercase font-bold border border-zinc-700 cursor-pointer"
                                title="Editar Preço Alvo"
                              >
                                Editar Meta
                              </button>
                            )}

                            {onRemoveAlert && (
                              <button
                                onClick={() => onRemoveAlert(product.id)}
                                className="p-2 bg-zinc-900 hover:bg-red-950/80 hover:text-red-400 text-zinc-400 border border-zinc-800 hover:border-red-800 transition-colors cursor-pointer"
                                title="Remover Alerta"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SIMULATOR & PREVIEW */}
            {activeTab === 'simulation' && (
              <div className="space-y-4">
                <div className="p-4 bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-red-400 flex items-center gap-2">
                      <Sparkles size={16} />
                      TESTE DE DISPARO DE ALERTA DE PREÇO
                    </span>
                    <Badge variant="outline" className="bg-red-950/40 text-red-400 border-red-800 rounded-none text-[8px]">
                      MODO TÁTICO
                    </Badge>
                  </div>

                  <p className="text-[9px] text-zinc-300 leading-relaxed">
                    Este simulador dispara imediatamente o fluxo completo de alerta de preço para validar:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[8.5px]">
                    <div className="p-2.5 bg-black border border-zinc-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-red-400 font-bold">
                        <Smartphone size={12} />
                        Web Push API
                      </div>
                      <p className="text-zinc-400">Notificação instantânea no navegador</p>
                    </div>

                    <div className="p-2.5 bg-black border border-zinc-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <Mail size={12} />
                        E-mail Informativo
                      </div>
                      <p className="text-zinc-400">Envio para {userEmail || 'email cadastrado'}</p>
                    </div>

                    <div className="p-2.5 bg-black border border-zinc-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
                        <Zap size={12} />
                        In-App Toast
                      </div>
                      <p className="text-zinc-400">Aviso visual em destaque no portal</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={() => {
                        if (onSimulatePriceDrop) {
                          onSimulatePriceDrop(monitoredProducts[0]?.product);
                        }
                      }}
                      className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider text-[10px] py-3 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
                    >
                      ⚡ Disparar Alerta Simulado Agora
                    </Button>
                  </div>
                </div>

                {/* Email Template Preview Box */}
                <div className="p-4 bg-black border border-zinc-800 space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Mail size={12} className="text-emerald-500" />
                    PRÉ-VISUALIZAÇÃO DO E-MAIL DE ALERTA
                  </span>

                  <div className="p-3 bg-zinc-950 border border-zinc-850 font-sans text-zinc-200 text-[10px] space-y-2">
                    <div className="border-b border-zinc-800 pb-2 flex items-center justify-between">
                      <span className="font-bold text-white">OSS.OS • Alerta de Queda de Preço</span>
                      <span className="text-[8px] text-zinc-500">contato@oss.os</span>
                    </div>

                    <p className="font-semibold text-emerald-400">
                      OSS! O kimono / equipamento que você estava monitorando atingiu o seu preço alvo!
                    </p>

                    <p className="text-[9px] text-zinc-400">
                      Detectamos uma queda de preço de até 25% na loja parceira. Clique no link para garantir com frete e condições exclusivas da comunidade do Jiu-Jitsu.
                    </p>

                    <div className="p-2 bg-zinc-900 border border-zinc-800 flex items-center justify-between text-[9px]">
                      <span>Código de Desconto Especial: <strong>OSSVIP10</strong></span>
                      <span className="text-green-400 font-bold">Válido por 24h</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-3 bg-black border-t border-zinc-800 flex items-center justify-between text-[9px] text-zinc-500 shrink-0">
            <span>DIÁRIO DOS OSS.OS • MONITORAMENTO CONTÍNUO</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold uppercase transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PriceAlertsNotificationCenter;

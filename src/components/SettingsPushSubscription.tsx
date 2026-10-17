import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Zap,
  Settings,
  Shield,
  Tag,
  TrendingDown,
  RefreshCw,
  Heart,
  Sparkles,
  Smartphone,
  ExternalLink,
  Info,
  Filter
} from 'lucide-react';
import { Product } from '../types';
import { requestFCMToken, registerFCMServiceWorker, sendRealFCMPush } from '../lib/fcmService';

export interface SettingsPushSubscriptionProps {
  wishlistProducts?: Product[];
  userEmail?: string;
  onNavigateWishlist?: () => void;
  className?: string;
  addToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  viewedProductIds?: string[];
  productList?: Product[];
}

const PUSH_CATEGORY_TOPICS = [
  {
    id: 'topico-kimonos',
    name: 'Kimonos Trançados & Competição',
    category: 'Kimonos',
    icon: '🥋',
    description: 'Kimonos pesados, trançados, de treino e homologados IBJJF / CBJJ.'
  },
  {
    id: 'topico-faixas',
    name: 'Faixas de Jiu-Jitsu (Todas as Cores)',
    category: 'Faixas',
    icon: '🪢',
    description: 'Liquidações de faixas branca a preta, ponta vermelha e edições premium.'
  },
  {
    id: 'topico-nogi',
    name: 'No-Gi, Rashguards & Bermudas',
    category: 'Rashguards',
    icon: '⚡',
    description: 'Compressão muscular, lycras No-Gi, bermudas de tatame e spats.'
  },
  {
    id: 'topico-protecao',
    name: 'Equipamentos de Proteção & Bucais',
    category: 'Equipamentos de Proteção',
    icon: '🛡️',
    description: 'Protetores bucais térmicos, joelheiras de neoprene e orelheiras.'
  },
  {
    id: 'topico-acessorios',
    name: 'Bolsas, Mochilas & Acessórios',
    category: 'Acessórios',
    icon: '🎒',
    description: 'Mochilas impermeáveis, sabonetes tatame, esparadrapos e garrafas.'
  },
  {
    id: 'topico-suplementos',
    name: 'Nutrição Esportiva & Suplementos',
    category: 'Suplementos',
    icon: '💊',
    description: 'Creatina Creapure, Whey Protein concentrado/isolado e eletrólitos.'
  }
];

export const SettingsPushSubscription: React.FC<SettingsPushSubscriptionProps> = ({
  wishlistProducts = [],
  userEmail,
  onNavigateWishlist,
  className = '',
  addToast = (msg: string, type?: 'success' | 'error' | 'info') => console.log(msg, type),
  viewedProductIds = [],
  productList = []
}) => {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [swStatus, setSwStatus] = useState<'checking' | 'active' | 'inactive'>('checking');
  const [notifyPriceDrops, setNotifyPriceDrops] = useState(true);
  const [notifyCoupons, setNotifyCoupons] = useState(true);
  const [notifyRestock, setNotifyRestock] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Category topic automated subscription states
  const [autoSubscribeTopics, setAutoSubscribeTopics] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('oss_auto_subscribe_category_topics');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  const [subscribedTopicIds, setSubscribedTopicIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('oss_subscribed_category_topics');
      if (saved) {
        return new Set<string>(JSON.parse(saved));
      }
    } catch (e) {}
    return new Set<string>(['topico-kimonos', 'topico-faixas', 'topico-nogi']);
  });

  const [discountThreshold, setDiscountThreshold] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('oss_topic_discount_threshold');
      return saved ? Number(saved) : 10;
    } catch (e) {
      return 10;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('oss_subscribed_category_topics', JSON.stringify(Array.from(subscribedTopicIds)));
      localStorage.setItem('oss_auto_subscribe_category_topics', JSON.stringify(autoSubscribeTopics));
      localStorage.setItem('oss_topic_discount_threshold', String(discountThreshold));
    } catch (e) {}
  }, [subscribedTopicIds, autoSubscribeTopics, discountThreshold]);

  // Detect top searched / viewed categories for automatic subscription
  const detectedCategories = React.useMemo(() => {
    const counts: Record<string, number> = {};
    viewedProductIds.forEach(id => {
      const p = productList.find(item => item.id === id);
      if (p && p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
  }, [viewedProductIds, productList]);

  // Auto-subscribe if enabled
  useEffect(() => {
    if (!autoSubscribeTopics || detectedCategories.length === 0) return;
    setSubscribedTopicIds(prev => {
      const next = new Set(prev);
      PUSH_CATEGORY_TOPICS.forEach(topic => {
        if (detectedCategories.some(cat => 
          topic.category.toLowerCase().includes(cat.toLowerCase()) || 
          cat.toLowerCase().includes(topic.category.toLowerCase())
        )) {
          next.add(topic.id);
        }
      });
      return next;
    });
  }, [autoSubscribeTopics, detectedCategories]);

  // Check Service Worker registration on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration()
        .then((reg) => {
          if (reg && reg.active) {
            setSwStatus('active');
          } else {
            // Try to detect ready service worker
            navigator.serviceWorker.ready
              .then(() => setSwStatus('active'))
              .catch(() => setSwStatus('inactive'));
          }
        })
        .catch(() => setSwStatus('inactive'));
    } else {
      setSwStatus('inactive');
    }
  }, []);

  // Subscribe to Push Notifications via existing Service Worker
  const handleSubscribe = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      addToast('Seu navegador não oferece suporte para notificações push.', 'error');
      return;
    }

    if (permission === 'denied') {
      setShowGuide(true);
      addToast('Notificações bloqueadas nas permissões do seu navegador. Siga as instruções abaixo.', 'info');
      return;
    }

    setIsSubscribing(true);
    try {
      // 1. Ensure FCM Service Worker is registered
      let reg: ServiceWorkerRegistration | undefined;
      try {
        reg = await registerFCMServiceWorker();
        setSwStatus('active');
      } catch (swErr) {
        console.warn('[PushSettings] Service Worker register fallback:', swErr);
      }

      // 2. Request permission from user
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        localStorage.setItem('oss_push_price_alerts_subscribed', 'true');
        localStorage.setItem('oss_push_subscribed_at', new Date().toISOString());

        // 3. Obtain real FCM registration token
        const fcmToken = await requestFCMToken(true);
        if (fcmToken) {
          console.log('[PushSettings] Token FCM ativo:', fcmToken.substring(0, 16) + '...');
        }

        // 4. Dispatch welcome notification via existing Service Worker
        if (reg && 'showNotification' in reg) {
          await reg.showNotification('🥋 Alertas de Preço OSS Ativados!', {
            body: `Monitorando ${wishlistProducts.length > 0 ? wishlistProducts.length : 'seus'} produtos favoritos. Notificações FCM ativas!`,
            icon: '/icon.png',
            badge: '/icon.png',
            vibrate: [200, 100, 200],
            tag: 'oss-price-alert-activated',
            data: { url: '/?view=WISHLIST' }
          } as any);
        } else if ('Notification' in window) {
          new Notification('🥋 Alertas de Preço OSS Ativados!', {
            body: 'Seus produtos favoritos estão sob monitoramento de preços 24/7.',
            icon: '/icon.png'
          });
        }

        addToast('Notificações Push ativadas com sucesso via Firebase Cloud Messaging!', 'success');
      } else if (result === 'denied') {
        setShowGuide(true);
        addToast('Permissão de notificação negada pelo navegador.', 'info');
      }
    } catch (err: any) {
      console.error('[PushSettings] Error subscribing to push:', err);
      addToast(`Erro ao ativar notificações: ${err.message || 'Tente novamente.'}`, 'error');
    } finally {
      setIsSubscribing(false);
    }
  };

  // Simulate price drop push notification on a favorite product
  const handleTestPriceDrop = async () => {
    if (permission !== 'granted') {
      addToast('Ative as notificações antes de testar a notificação.', 'info');
      return;
    }

    setIsTesting(true);
    try {
      const sampleFav = wishlistProducts.length > 0 
        ? wishlistProducts[0] 
        : {
            id: '1',
            title: 'Kimono BJJ Vagabond Ultra Light Edição Limitada',
            price: 419.90,
            originalPrice: 599.90,
            imageUrl: '/icon.png'
          };

      const oldPrice = sampleFav.originalPrice || (sampleFav.price * 1.35);
      const newPrice = sampleFav.price;
      const diff = (oldPrice - newPrice).toFixed(2);
      const percent = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

      const fcmRes = await sendRealFCMPush({
        token: localStorage.getItem('oss_fcm_token') || undefined,
        title: `🔥 Preço Baixou: ${sampleFav.title.slice(0, 36)}...`,
        body: `Economia de R$ ${diff} (-${percent}%)! De R$ ${oldPrice.toFixed(2)} por apenas R$ ${newPrice.toFixed(2)}. Toque para ver no tatame!`,
        productId: sampleFav.id,
        productTitle: sampleFav.title,
        productPrice: sampleFav.price,
        imageUrl: sampleFav.imageUrl || '/icon.png',
        data: { url: '/?view=WISHLIST' }
      });

      if (fcmRes.success) {
        addToast(`Push FCM despachado com sucesso via servidor Firebase!`, 'success');
      } else {
        // Fallback local dispatch
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          if (reg) {
            await reg.showNotification(`🔥 Preço Baixou: ${sampleFav.title.slice(0, 38)}...`, {
              body: `Economia de R$ ${diff} (-${percent}%)! De R$ ${oldPrice.toFixed(2)} por apenas R$ ${newPrice.toFixed(2)}. Toque para ver no tatame!`,
              icon: sampleFav.imageUrl || '/icon.png',
              badge: '/icon.png',
              vibrate: [200, 100, 200],
              tag: `oss-price-drop-${sampleFav.id}`,
              data: { url: '/?view=WISHLIST' }
            } as any);
          }
        }
        addToast(`Notificação disparada localmente para: ${sampleFav.title}!`, 'success');
      }
    } catch (err: any) {
      console.warn('[PushSettings] Test notification error:', err);
      addToast('Não foi possível disparar a notificação de teste.', 'error');
    } finally {
      setTimeout(() => setIsTesting(false), 800);
    }
  };

  return (
    <div className={`bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 font-sans ${className}`}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-900">
        <div className="flex items-start gap-3">
          <div className={`p-3 border shrink-0 ${
            permission === 'granted'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : permission === 'denied'
              ? 'bg-red-500/10 text-red-500 border-red-500/30'
              : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
          }`}>
            {permission === 'granted' ? (
              <BellRing className="animate-pulse" size={24} />
            ) : permission === 'denied' ? (
              <BellOff size={24} />
            ) : (
              <Bell size={24} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-mono font-black uppercase tracking-wider text-black dark:text-white">
                ALERTAS PUSH DE PREÇO DOS FAVORITOS
              </h3>
              <span className="text-[7.5px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 border border-zinc-200 dark:border-zinc-700 uppercase font-black">
                Service Worker PWA
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
              Assine notificações instantâneas no navegador para ser avisado quando kimonos, faixas, rashguards e suplementos da sua lista de favoritos entrarem em promoção.
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-mono font-black uppercase tracking-widest border ${
            permission === 'granted'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
              : permission === 'denied'
              ? 'bg-red-500/10 text-red-500 border-red-500/30'
              : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              permission === 'granted'
                ? 'bg-emerald-500 animate-ping'
                : permission === 'denied'
                ? 'bg-red-500'
                : 'bg-amber-500'
            }`} />
            <span>
              {permission === 'granted' 
                ? 'Push Ativo' 
                : permission === 'denied' 
                ? 'Bloqueado' 
                : 'Pendente'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Action Box */}
      <div className="my-6 p-5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Heart size={14} className="text-red-500 fill-red-500" />
            <span className="text-xs font-mono font-black uppercase text-black dark:text-white">
              {wishlistProducts.length > 0 
                ? `${wishlistProducts.length} Produtos na sua Lista de Favoritos`
                : 'Nenhum produto nos favoritos ainda'}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
            {wishlistProducts.length > 0
              ? 'O Service Worker verifica automaticamente quedas de preço e cupons para seus itens salvos.'
              : 'Adicione kimonos e faixas aos seus favoritos para monitorar promoções em tempo real.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          {permission !== 'granted' ? (
            <button
              id="btn-subscribe-push-settings"
              onClick={handleSubscribe}
              disabled={isSubscribing}
              className="w-full md:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-mono font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubscribing ? (
                <>
                  <RefreshCw className="animate-spin" size={14} />
                  <span>Configurando Service Worker...</span>
                </>
              ) : (
                <>
                  <BellRing className="animate-bounce" size={14} />
                  <span>Assinar Notificações Push</span>
                </>
              )}
            </button>
          ) : (
            <>
              <button
                id="btn-test-price-drop-sw"
                onClick={handleTestPriceDrop}
                disabled={isTesting}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-[10px] uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                title="Dispara uma notificação simulada de queda de preço através do Service Worker existente"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="animate-spin" size={12} />
                    <span>Disparando SW...</span>
                  </>
                ) : (
                  <>
                    <Zap size={12} />
                    <span>Testar Queda de Preço</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSubscribe}
                className="px-3 py-2.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-mono font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw size={11} />
                <span>Atualizar Inscrição</span>
              </button>
            </>
          )}

          {wishlistProducts.length > 0 && onNavigateWishlist && (
            <button
              onClick={onNavigateWishlist}
              className="px-3 py-2.5 border border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white text-zinc-600 dark:text-zinc-300 font-mono font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Heart size={11} className="text-red-500" />
              <span>Ver Favoritos</span>
            </button>
          )}
        </div>
      </div>

      {/* Preferences & Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
        {/* Toggle 1: Price Drops */}
        <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <TrendingDown size={14} className="text-emerald-500" />
              <span className="text-[11px] font-mono font-bold uppercase text-black dark:text-white">Quedas de Preço</span>
            </div>
            <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400">
              Avisos instantâneos quando o preço dos favoritos cair no Mercado Livre, Amazon e Shopee.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNotifyPriceDrops(!notifyPriceDrops)}
            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
              notifyPriceDrops ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <span className={`w-3.5 h-3.5 rounded-full bg-white block transition-transform absolute top-0.75 ${
              notifyPriceDrops ? 'left-4.5' : 'left-1'
            }`} />
          </button>
        </div>

        {/* Toggle 2: Coupons */}
        <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Tag size={14} className="text-amber-500" />
              <span className="text-[11px] font-mono font-bold uppercase text-black dark:text-white">Cupons Relâmpago</span>
            </div>
            <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400">
              Notificar cupons de desconto aplicáveis aos equipamentos da sua lista de desejos.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNotifyCoupons(!notifyCoupons)}
            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
              notifyCoupons ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <span className={`w-3.5 h-3.5 rounded-full bg-white block transition-transform absolute top-0.75 ${
              notifyCoupons ? 'left-4.5' : 'left-1'
            }`} />
          </button>
        </div>

        {/* Toggle 3: Restock */}
        <div className="p-3.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-blue-500" />
              <span className="text-[11px] font-mono font-bold uppercase text-black dark:text-white">Volta ao Estoque</span>
            </div>
            <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400">
              Avisos quando tamanhos de kimono (A1, A2, A3) esgotados voltarem a ficar disponíveis.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNotifyRestock(!notifyRestock)}
            className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 mt-1 ${
              notifyRestock ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <span className={`w-3.5 h-3.5 rounded-full bg-white block transition-transform absolute top-0.75 ${
              notifyRestock ? 'left-4.5' : 'left-1'
            }`} />
          </button>
        </div>
      </div>

      {/* NEW: AUTOMATED TOPIC SUBSCRIPTION BY PRODUCT CATEGORY */}
      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4" id="settings-category-topics">
        <div className="p-4 sm:p-5 bg-amber-500/5 dark:bg-amber-950/20 border-2 border-amber-500/30 dark:border-amber-700/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                <h4 className="text-xs font-mono font-black uppercase tracking-wider text-black dark:text-white">
                  AUTOMATIZAR ASSINATURA EM TÓPICOS POR CATEGORIA
                </h4>
                <span className="text-[7.5px] font-mono bg-amber-500 text-black px-1.5 py-0.5 font-black uppercase">
                  Recomendado
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-mono max-w-xl">
                Garante que você receba apenas alertas de preços para os tipos de kimonos ou equipamentos que você mais busca no tatame.
              </p>
            </div>

            {/* Main Automation Switch */}
            <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-2.5 border border-zinc-200 dark:border-zinc-800 shrink-0">
              <span className="text-[9.5px] font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300">
                {autoSubscribeTopics ? 'Auto-Assinar por Busca: ATIVO' : 'Auto-Assinar: PAUSADO'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={autoSubscribeTopics}
                onClick={() => {
                  const next = !autoSubscribeTopics;
                  setAutoSubscribeTopics(next);
                  if (next) {
                    addToast('Assinatura automática por buscas ativada!', 'success');
                  } else {
                    addToast('Assinatura automática pausada. Gerencie manualmente abaixo.', 'info');
                  }
                }}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  autoSubscribeTopics ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full bg-white block transition-transform absolute top-0.75 ${
                  autoSubscribeTopics ? 'left-5.5' : 'left-1'
                }`} />
              </button>
            </div>
          </div>

          {detectedCategories.length > 0 && autoSubscribeTopics && (
            <div className="mt-3 pt-3 border-t border-amber-500/20 text-[10px] font-mono text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Categorias identificadas no seu histórico: <strong>{detectedCategories.join(', ')}</strong>. Tópicos correspondentes estão ativos automaticamente!
              </span>
            </div>
          )}
        </div>

        {/* Discount Sensitivity Threshold Selector */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
          <span className="text-zinc-700 dark:text-zinc-300 text-[10.5px] font-bold uppercase flex items-center gap-1.5">
            <Filter size={12} className="text-red-500" />
            Receber alertas para quedas de:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { val: 5, label: '≥ 5%' },
              { val: 10, label: '≥ 10%' },
              { val: 20, label: '≥ 20%' },
              { val: 30, label: '≥ 30% Relâmpago' }
            ].map(th => (
              <button
                key={th.val}
                type="button"
                onClick={() => {
                  setDiscountThreshold(th.val);
                  addToast(`Sensibilidade de queda ajustada para acima de ${th.val}%.`, 'info');
                }}
                className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase transition-colors cursor-pointer border ${
                  discountThreshold === th.val
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-800'
                }`}
              >
                {th.label}
              </button>
            ))}
          </div>
        </div>

        {/* Individual Category Topics Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {PUSH_CATEGORY_TOPICS.map(topic => {
            const isSub = subscribedTopicIds.has(topic.id);
            const isRecommended = detectedCategories.some(cat => 
              topic.category.toLowerCase().includes(cat.toLowerCase()) || 
              cat.toLowerCase().includes(topic.category.toLowerCase())
            );

            return (
              <div
                key={topic.id}
                className={`p-3 border transition-all flex flex-col justify-between gap-2 ${
                  isSub
                    ? 'bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800'
                    : 'bg-zinc-50/70 dark:bg-zinc-950/30 border-dashed border-zinc-200 dark:border-zinc-800 opacity-80'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-base">{topic.icon}</span>
                      <span className="text-[10.5px] font-mono font-black text-black dark:text-white uppercase truncate">
                        {topic.name}
                      </span>
                    </div>
                    {/* Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isSub}
                      onClick={() => {
                        setSubscribedTopicIds(prev => {
                          const next = new Set(prev);
                          if (next.has(topic.id)) {
                            next.delete(topic.id);
                            addToast(`Tópico "${topic.name}" desativado.`, 'info');
                          } else {
                            next.add(topic.id);
                            addToast(`Tópico "${topic.name}" ativado com sucesso!`, 'success');
                          }
                          return next;
                        });
                      }}
                      className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        isSub ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full bg-white block transition-transform absolute top-0.75 ${
                        isSub ? 'left-4.5' : 'left-0.75'
                      }`} />
                    </button>
                  </div>
                  <p className="text-[9px] text-zinc-500 font-mono line-clamp-2">
                    {topic.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-900 text-[8px] font-mono">
                  {isRecommended ? (
                    <span className="text-amber-600 dark:text-amber-400 font-black">
                      ⭐ Buscado por você
                    </span>
                  ) : (
                    <span className="text-zinc-400">{isSub ? 'Notificações Ativas' : 'Silenciado'}</span>
                  )}
                  {isSub && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Quedas ≥ {discountThreshold}%</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guide if Permission is Denied */}
      <AnimatePresence>
        {showGuide && permission === 'denied' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-4 bg-red-500/10 border border-red-500/30 text-black dark:text-white overflow-hidden font-mono"
          >
            <div className="flex items-center justify-between pb-2 border-b border-red-500/20 mb-3">
              <span className="text-xs font-black uppercase text-red-500 flex items-center gap-1.5">
                <AlertTriangle size={14} /> Como Desbloquear Notificações no Navegador
              </span>
              <button
                onClick={() => setShowGuide(false)}
                className="text-[10px] text-zinc-400 hover:text-black dark:hover:text-white"
              >
                ✕ Fechar Guia
              </button>
            </div>
            <ol className="text-[11px] space-y-1.5 text-zinc-700 dark:text-zinc-300 list-decimal pl-4">
              <li>Clique no ícone de <strong>Cadeado 🔒</strong> ou <strong>Configurações do Site</strong> ao lado da barra de endereço do navegador.</li>
              <li>Procure o item <strong>Notificações</strong> e altere de <em>Bloquear</em> para <strong>Permitir</strong>.</li>
              <li>Recarregue esta página e clique novamente em <strong>Assinar Notificações Push</strong>.</li>
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPushSubscription;

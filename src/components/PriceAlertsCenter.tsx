import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  BellRing,
  BellOff,
  Flame,
  Zap,
  TrendingDown,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Smartphone,
  Mail,
  Sliders,
  ShieldCheck,
  Tag,
  Clock,
  ArrowDownRight,
  ArrowRight,
  ChevronRight,
  Pencil,
  Check,
  X,
  Layers,
  Heart,
  AlertCircle
} from 'lucide-react';
import { Product, InAppPriceAlertNotification, CategoryNotificationTopic } from '../types';

export interface PriceAlertsCenterProps {
  monitoredProducts?: Product[];
  wishlistAlerts?: Set<string>;
  onTogglePriceAlert?: (productId: string) => Promise<boolean> | void;
  onSelectProduct?: (product: Product) => void;
  onNavigate?: (view: string) => void;
  user?: any;
  viewedProductIds?: string[];
  productList?: Product[];
  addToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  playClickSound?: () => void;
  className?: string;
  initialSubTab?: 'historico' | 'produtos' | 'topicos';
}

// Initial realistic notifications to display when first loaded
const DEFAULT_INITIAL_NOTIFICATIONS: InAppPriceAlertNotification[] = [
  {
    id: 'notif-demo-1',
    productId: '1',
    productTitle: 'Kimono BJJ Vagabond Ultra Light Edição Limitada',
    productBrand: 'Vagabond BJJ',
    productImage: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=300&auto=format&fit=crop&q=80',
    targetPrice: 420.00,
    currentPrice: 389.90,
    originalPrice: 549.90,
    discountPct: 29,
    savings: 160.00,
    platform: 'Mercado Livre',
    type: 'target_met',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 min ago
    isRead: false,
    channelsNotified: ['push', 'email', 'app']
  },
  {
    id: 'notif-demo-2',
    productId: '2',
    productTitle: 'Faixa Preta Especial Shoyoroll Competição Algodão Egípcio',
    productBrand: 'Shoyoroll',
    productImage: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=300&auto=format&fit=crop&q=80',
    targetPrice: 220.00,
    currentPrice: 199.90,
    originalPrice: 280.00,
    discountPct: 28,
    savings: 80.10,
    platform: 'Amazon Brasil',
    type: 'promo_drop',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4h ago
    isRead: false,
    channelsNotified: ['push', 'app']
  },
  {
    id: 'notif-demo-3',
    productId: '3',
    productTitle: 'Rashguard Venum Gorilla Compression Manga Longa IBJJF',
    productBrand: 'Venum',
    productImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80',
    targetPrice: 170.00,
    currentPrice: 149.90,
    originalPrice: 219.90,
    discountPct: 31,
    savings: 70.00,
    platform: 'Shopee Oficial',
    type: 'flash_deal',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), // 22h ago
    isRead: true,
    channelsNotified: ['push', 'email', 'app']
  },
  {
    id: 'notif-demo-4',
    productId: '4',
    productTitle: 'Protetor Bucal Shock Doctor Gel Max BJJ Pro',
    productBrand: 'Shock Doctor',
    productImage: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=300&auto=format&fit=crop&q=80',
    targetPrice: 95.00,
    currentPrice: 84.90,
    originalPrice: 119.00,
    discountPct: 28,
    savings: 34.10,
    platform: 'Mercado Livre',
    type: 'target_met',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    isRead: true,
    channelsNotified: ['push', 'app']
  }
];

// Product Category Topics Definition for automated subscriptions
const CATEGORY_TOPICS_DEFINITIONS = [
  {
    id: 'topico-kimonos',
    name: 'Kimonos Trançados & Competição',
    category: 'Kimonos',
    icon: '🥋',
    description: 'Alertas de preço para kimonos pesados, trançados, de treino e armaduras homologadas pela IBJJF / CBJJ.',
    matchKeywords: ['kimono', 'trancado', 'ripstop', 'ibjjf', 'cbjj', 'gi']
  },
  {
    id: 'topico-faixas',
    name: 'Faixas de Jiu-Jitsu (Todas as Cores & Graus)',
    category: 'Faixas',
    icon: '🪢',
    description: 'Avisos de liquidação em faixas branca, azul, roxa, marrom, preta, ponta vermelha e edições premium.',
    matchKeywords: ['faixa', 'belt', 'preta', 'roxa', 'azul', 'marrom']
  },
  {
    id: 'topico-nogi',
    name: 'No-Gi, Rashguards & Bermudas',
    category: 'Rashguards',
    icon: '⚡',
    description: 'Compressão muscular, lycras de treino sem kimono, bermudas ripstop e spats para grappler.',
    matchKeywords: ['rashguard', 'bermuda', 'no-gi', 'nogi', 'compressao', 'spat']
  },
  {
    id: 'topico-protecao',
    name: 'Equipamentos de Proteção & Tatame',
    category: 'Equipamentos de Proteção',
    icon: '🛡️',
    description: 'Protetores bucais térmicos, joelheiras de neoprene, orelheiras anatômicas e coquilhas de tatame.',
    matchKeywords: ['protetor', 'bucal', 'joelheira', 'orelheira', 'protecao']
  },
  {
    id: 'topico-acessorios',
    name: 'Bolsas, Mochilas & Acessórios de Treino',
    category: 'Acessórios',
    icon: '🎒',
    description: 'Mochilas especiais para kimonos molhados, sabonetes antibacterianos, esparadrapos e garrafas térmicas.',
    matchKeywords: ['mochila', 'bolsa', 'esparadrapo', 'acessorio', 'sacola']
  },
  {
    id: 'topico-suplementos',
    name: 'Nutrição Esportiva & Suplementos do Atleta',
    category: 'Suplementos',
    icon: '💊',
    description: 'Creatina Creapure, Whey Protein concentrado/isolado, glutamina e eletrólitos de hidratação.',
    matchKeywords: ['creatina', 'whey', 'suplemento', 'nutricao', 'proteina']
  },
  {
    id: 'topico-infantil',
    name: 'Kimonos & Equipamentos Infantis / Kids',
    category: 'Infantil',
    icon: '👦',
    description: 'Kimonos M0 a M4, faixas infantis coloridas e proteções adaptadas para os pequenos guerreiros.',
    matchKeywords: ['infantil', 'kids', 'juvenil', 'm0', 'm1', 'm2', 'm3']
  }
];

export const PriceAlertsCenter: React.FC<PriceAlertsCenterProps> = ({
  monitoredProducts = [],
  wishlistAlerts = new Set<string>(),
  onTogglePriceAlert,
  onSelectProduct,
  onNavigate,
  user,
  viewedProductIds = [],
  productList = [],
  addToast = (msg: string, type?: 'success' | 'error' | 'info') => console.log(msg, type),
  playClickSound = () => {},
  className = '',
  initialSubTab = 'historico'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'historico' | 'produtos' | 'topicos'>(initialSubTab);
  
  // Local state for notifications history
  const [notifications, setNotifications] = useState<InAppPriceAlertNotification[]>(() => {
    try {
      const saved = localStorage.getItem('oss_price_alert_notifications_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[PriceAlertsCenter] Failed to load notifications history:', e);
    }
    return DEFAULT_INITIAL_NOTIFICATIONS;
  });

  // Local state for monitored alert toggles
  const [localAlertStates, setLocalAlertStates] = useState<Record<string, boolean>>(() => {
    const states: Record<string, boolean> = {};
    wishlistAlerts.forEach(id => {
      states[id] = true;
    });
    // Also load from localStorage
    try {
      const saved = localStorage.getItem('oss_monitored_alert_toggles');
      if (saved) {
        Object.assign(states, JSON.parse(saved));
      }
    } catch (e) {}
    return states;
  });

  // Local state for custom target prices
  const [targetPrices, setTargetPrices] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('oss_custom_target_prices');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {};
  });

  // Inline editing target price state
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [tempTargetValue, setTempTargetValue] = useState<string>('');

  // Category topics state
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
    // Default: first 3 popular topics
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

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'unread' | 'big_drops' | 'target_met'>('all');
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [isSimulating, setIsSimulating] = useState(false);

  // Sync notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('oss_price_alert_notifications_history', JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  // Sync alert states to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('oss_monitored_alert_toggles', JSON.stringify(localAlertStates));
    } catch (e) {}
  }, [localAlertStates]);

  // Sync category topics to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('oss_subscribed_category_topics', JSON.stringify(Array.from(subscribedTopicIds)));
      localStorage.setItem('oss_auto_subscribe_category_topics', JSON.stringify(autoSubscribeTopics));
      localStorage.setItem('oss_topic_discount_threshold', String(discountThreshold));
    } catch (e) {}
  }, [subscribedTopicIds, autoSubscribeTopics, discountThreshold]);

  // Detect athlete's most viewed categories for AI recommendation
  const detectedUserTopCategories = useMemo(() => {
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

  // Auto-subscribe if enabled and user has detected interests
  useEffect(() => {
    if (!autoSubscribeTopics) return;

    if (detectedUserTopCategories.length > 0) {
      setSubscribedTopicIds(prev => {
        const next = new Set(prev);
        CATEGORY_TOPICS_DEFINITIONS.forEach(topic => {
          if (detectedUserTopCategories.some(cat => 
            topic.category.toLowerCase().includes(cat.toLowerCase()) || 
            cat.toLowerCase().includes(topic.category.toLowerCase())
          )) {
            next.add(topic.id);
          }
        });
        return next;
      });
    }
  }, [autoSubscribeTopics, detectedUserTopCategories]);

  // Resolve active monitored products
  const safeMonitoredProducts = useMemo(() => {
    if (monitoredProducts.length > 0) {
      return monitoredProducts;
    }
    // Fallback: take products that match wishlistAlerts or first few from productList
    if (wishlistAlerts.size > 0 && productList.length > 0) {
      return productList.filter(p => wishlistAlerts.has(p.id));
    }
    // Fallback default sample items if user hasn't added any yet
    return productList.slice(0, 4);
  }, [monitoredProducts, wishlistAlerts, productList]);

  // Handle toggle switch for a monitored product
  const handleToggleProductAlert = useCallback(async (productId: string, productTitle?: string) => {
    playClickSound();
    const currentState = localAlertStates[productId] ?? wishlistAlerts.has(productId) ?? true;
    const newState = !currentState;

    // 1. Update local state immediately
    setLocalAlertStates(prev => ({
      ...prev,
      [productId]: newState
    }));

    // 2. Call parent persistence callback if provided
    if (onTogglePriceAlert) {
      try {
        await onTogglePriceAlert(productId);
      } catch (err) {
        console.warn('[PriceAlertsCenter] Toggle callback error:', err);
      }
    }

    // 3. User feedback
    const title = productTitle ? `"${productTitle.slice(0, 24)}..."` : 'o produto';
    if (newState) {
      addToast(`Alerta ATIVADO para ${title}! Você receberá notificações push no tatame.`, 'success');
    } else {
      addToast(`Alerta PAUSADO para ${title}. Notificações suspensas temporariamente.`, 'info');
    }
  }, [localAlertStates, wishlistAlerts, onTogglePriceAlert, addToast, playClickSound]);

  // Save edited target price
  const handleSaveTargetPrice = (productId: string) => {
    playClickSound();
    const val = parseFloat(tempTargetValue.replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      setTargetPrices(prev => {
        const next = { ...prev, [productId]: val };
        localStorage.setItem('oss_custom_target_prices', JSON.stringify(next));
        return next;
      });
      addToast(`Preço alvo atualizado para R$ ${val.toFixed(2)}!`, 'success');
    }
    setEditingTargetId(null);
    setTempTargetValue('');
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    playClickSound();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    addToast('Todas as notificações foram marcadas como lidas.', 'info');
  };

  // Clear history
  const handleClearHistory = () => {
    playClickSound();
    setNotifications([]);
    addToast('Histórico de notificações de preço limpo.', 'info');
  };

  // Delete single notification
  const handleDeleteNotification = (id: string) => {
    playClickSound();
    setNotifications(prev => prev.filter(n => n.id !== id));
    addToast('Notificação removida do histórico.', 'info');
  };

  // Simulate a price drop notification
  const handleSimulateNotification = async (targetProduct?: Product) => {
    playClickSound();
    setIsSimulating(true);

    const baseProduct = targetProduct || safeMonitoredProducts[0] || productList[0] || {
      id: 'sample-p1',
      title: 'Kimono BJJ Vagabond Ultra Light Edição Especial',
      brand: 'Vagabond BJJ',
      price: 399.90,
      originalPrice: 580.00,
      category: 'Kimonos',
      imageUrl: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=300&auto=format&fit=crop&q=80'
    };

    const dropAmount = Math.round(baseProduct.price * 0.22); // 22% drop
    const newPrice = Math.max(99, baseProduct.price - dropAmount);
    const savings = dropAmount;
    const discountPct = Math.round((savings / baseProduct.price) * 100);

    const newNotification: InAppPriceAlertNotification = {
      id: `notif-${Date.now()}`,
      productId: baseProduct.id,
      productTitle: baseProduct.title,
      productBrand: baseProduct.brand || 'Marca Oficial',
      productImage: baseProduct.imageUrl || '/icon.png',
      targetPrice: Math.round(baseProduct.price * 0.85),
      currentPrice: newPrice,
      originalPrice: baseProduct.price,
      discountPct: discountPct,
      savings: savings,
      platform: 'Mercado Livre Tatame',
      type: 'target_met',
      createdAt: new Date().toISOString(),
      isRead: false,
      channelsNotified: ['push', 'email', 'app']
    };

    // Prepend to notifications
    setNotifications(prev => [newNotification, ...prev]);

    // Trigger Service Worker push notification
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          const reg = await navigator.serviceWorker.ready;
          if (reg && 'showNotification' in reg) {
            await reg.showNotification(`🔥 Preço Baixou: ${baseProduct.title.slice(0, 32)}...`, {
              body: `Economia de R$ ${savings.toFixed(2)} (-${discountPct}%)! Preço atual R$ ${newPrice.toFixed(2)}. Toque para ver no tatame!`,
              icon: baseProduct.imageUrl || '/icon.png',
              badge: '/icon.png',
              tag: `oss-price-alert-${baseProduct.id}`,
              vibrate: [200, 100, 200],
              data: { url: `/?product=${baseProduct.id}` }
            } as any);
          }
        } catch (swErr) {
          console.warn('[PriceAlertsCenter] SW push fallback:', swErr);
        }
      }
    }

    addToast(`Alerta disparado com sucesso! Preço de "${baseProduct.title.slice(0, 20)}..." caiu -${discountPct}%.`, 'success');
    setTimeout(() => setIsSimulating(false), 700);
  };

  // Toggle category topic subscription
  const handleToggleTopic = (topicId: string, topicName: string) => {
    playClickSound();
    setSubscribedTopicIds(prev => {
      const next = new Set(prev);
      const isSub = next.has(topicId);
      if (isSub) {
        next.delete(topicId);
        addToast(`Inscrição removida do tópico: ${topicName}`, 'info');
      } else {
        next.add(topicId);
        addToast(`Inscrição confirmada no tópico: ${topicName}!`, 'success');
      }
      return next;
    });
  };

  // Test push for category topic
  const handleTestCategoryTopicNotification = async (topic: typeof CATEGORY_TOPICS_DEFINITIONS[0]) => {
    playClickSound();
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
      addToast('Ative a permissão de notificações push nas configurações para receber alertas.', 'info');
      return;
    }

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg && 'showNotification' in reg) {
          await reg.showNotification(`🥋 Alerta do Tópico: ${topic.name}`, {
            body: `Detectamos uma nova oportunidade com mais de ${discountThreshold}% de desconto em ${topic.category}!`,
            icon: '/icon.png',
            badge: '/icon.png',
            vibrate: [150, 100, 150],
            tag: `oss-topic-alert-${topic.id}`
          } as any);
          addToast(`Notificação disparada para o tópico "${topic.name}" via Service Worker!`, 'success');
          return;
        }
      } catch (e) {
        console.warn(e);
      }
    }

    addToast(`Alerta simulado com sucesso para o tópico: ${topic.name}`, 'success');
  };

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notif => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = notif.productTitle.toLowerCase().includes(q);
        const matchesBrand = notif.productBrand?.toLowerCase().includes(q);
        const matchesStore = notif.platform.toLowerCase().includes(q);
        if (!matchesTitle && !matchesBrand && !matchesStore) return false;
      }

      // Filter subtabs
      if (historyFilter === 'unread') return !notif.isRead;
      if (historyFilter === 'big_drops') return (notif.discountPct || 0) >= 20;
      if (historyFilter === 'target_met') return notif.type === 'target_met';
      return true;
    });
  }, [notifications, searchQuery, historyFilter]);

  // Filtered monitored products
  const filteredProducts = useMemo(() => {
    return safeMonitoredProducts.filter(p => {
      const isActive = localAlertStates[p.id] ?? wishlistAlerts.has(p.id) ?? true;
      if (productStatusFilter === 'active' && !isActive) return false;
      if (productStatusFilter === 'paused' && isActive) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchBrand = p.brand?.toLowerCase().includes(q);
        const matchCat = p.category?.toLowerCase().includes(q);
        return matchTitle || matchBrand || matchCat;
      }
      return true;
    });
  }, [safeMonitoredProducts, localAlertStates, wishlistAlerts, productStatusFilter, searchQuery]);

  // Summary counts
  const totalMonitoredCount = safeMonitoredProducts.length;
  const activeAlertsCount = safeMonitoredProducts.filter(p => (localAlertStates[p.id] ?? wishlistAlerts.has(p.id) ?? true)).length;
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={`space-y-6 font-sans ${className}`} id="central-de-alertas-panel">
      {/* Top Banner & Header */}
      <div className="bg-zinc-900 border-2 border-black dark:border-zinc-700 p-5 md:p-6 text-white relative overflow-hidden shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#27272a]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2 bg-red-600 text-white flex items-center justify-center border border-red-500 shadow-sm">
                <BellRing size={20} className="animate-pulse" />
              </div>
              <h2 className="text-lg md:text-xl font-mono font-black uppercase tracking-wider text-white">
                CENTRAL DE ALERTAS & NOTIFICAÇÕES
              </h2>
              <span className="text-[9px] font-mono font-black uppercase tracking-widest px-2 py-0.5 bg-red-950/80 text-red-400 border border-red-800">
                RADAR TÁTICO DE PREÇOS
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-mono max-w-2xl leading-relaxed">
              Monitore quedas de preço em tempo real dos seus kimonos, faixas e equipamentos. Ative e desative alertas com interruptores individuais e automatize notificações por categoria de busca.
            </p>
          </div>

          {/* Quick Simulation Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-simulate-alert-center"
              onClick={() => handleSimulateNotification()}
              disabled={isSimulating}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 active:scale-95 disabled:opacity-50 text-white font-mono font-black text-[10px] uppercase tracking-wider flex items-center gap-2 border border-red-400 shadow-[2px_2px_0px_0px_#000000] cursor-pointer transition-all"
              title="Dispara um alerta simulado no sistema e dispara notificação push no Service Worker"
            >
              {isSimulating ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Disparando Alerta...</span>
                </>
              ) : (
                <>
                  <Zap size={13} />
                  <span>Simular Disparo Agora</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4 KPI Metrics Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-zinc-800 relative z-10 text-center sm:text-left">
          <div className="p-3 bg-black/60 border border-zinc-800">
            <span className="text-[8.5px] font-mono text-zinc-400 uppercase block">Notificações Enviadas</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-mono font-black text-white">{notifications.length}</span>
              {unreadNotificationsCount > 0 && (
                <span className="text-[9px] font-mono font-bold text-red-400">
                  ({unreadNotificationsCount} novas)
                </span>
              )}
            </div>
          </div>

          <div className="p-3 bg-black/60 border border-zinc-800">
            <span className="text-[8.5px] font-mono text-zinc-400 uppercase block">Produtos Monitorados</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-mono font-black text-white">{totalMonitoredCount}</span>
              <span className="text-[9px] font-mono text-zinc-500">itens</span>
            </div>
          </div>

          <div className="p-3 bg-black/60 border border-zinc-800">
            <span className="text-[8.5px] font-mono text-zinc-400 uppercase block">Alertas Ativos</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-mono font-black text-green-400">{activeAlertsCount}</span>
              <span className="text-[9px] font-mono text-zinc-500">ligados</span>
            </div>
          </div>

          <div className="p-3 bg-black/60 border border-zinc-800">
            <span className="text-[8.5px] font-mono text-zinc-400 uppercase block">Tópicos por Categoria</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-mono font-black text-amber-400">{subscribedTopicIds.size}</span>
              <span className="text-[9px] font-mono text-zinc-500">assinados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Subtabs */}
      <div className="flex items-center justify-between border-b-2 border-black dark:border-zinc-800 gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2">
          <button
            id="tab-historico-alertas"
            onClick={() => {
              playClickSound();
              setActiveSubTab('historico');
            }}
            className={`px-4 py-3 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-2 border-t-2 border-x-2 -mb-[2px] transition-all cursor-pointer ${
              activeSubTab === 'historico'
                ? 'bg-white dark:bg-zinc-900 text-black dark:text-white border-black dark:border-zinc-700 shadow-[2px_-2px_0px_#000000] dark:shadow-[2px_-2px_0px_#ffffff]'
                : 'bg-transparent text-zinc-500 hover:text-black dark:hover:text-white border-transparent'
            }`}
          >
            <Clock size={13} />
            <span>Histórico de Alertas Enviados</span>
            {unreadNotificationsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[8px] flex items-center justify-center font-mono">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            id="tab-produtos-monitorados"
            onClick={() => {
              playClickSound();
              setActiveSubTab('produtos');
            }}
            className={`px-4 py-3 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-2 border-t-2 border-x-2 -mb-[2px] transition-all cursor-pointer ${
              activeSubTab === 'produtos'
                ? 'bg-white dark:bg-zinc-900 text-black dark:text-white border-black dark:border-zinc-700 shadow-[2px_-2px_0px_#000000] dark:shadow-[2px_-2px_0px_#ffffff]'
                : 'bg-transparent text-zinc-500 hover:text-black dark:hover:text-white border-transparent'
            }`}
          >
            <Sliders size={13} />
            <span>Gerenciar Produtos Monitorados ({safeMonitoredProducts.length})</span>
            <span className="text-[8px] font-mono bg-green-500/10 text-green-600 dark:text-green-400 px-1.5 py-0.5 border border-green-500/30">
              Interruptor ON/OFF
            </span>
          </button>

          <button
            id="tab-topicos-categoria"
            onClick={() => {
              playClickSound();
              setActiveSubTab('topicos');
            }}
            className={`px-4 py-3 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-2 border-t-2 border-x-2 -mb-[2px] transition-all cursor-pointer ${
              activeSubTab === 'topicos'
                ? 'bg-white dark:bg-zinc-900 text-black dark:text-white border-black dark:border-zinc-700 shadow-[2px_-2px_0px_#000000] dark:shadow-[2px_-2px_0px_#ffffff]'
                : 'bg-transparent text-zinc-500 hover:text-black dark:hover:text-white border-transparent'
            }`}
          >
            <Tag size={13} />
            <span>Tópicos por Categoria & Automação</span>
            {autoSubscribeTopics && (
              <span className="text-[8px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 border border-amber-500/30">
                IA Ativa
              </span>
            )}
          </button>
        </div>
      </div>

      {/* SUBTAB 1: HISTÓRICO DE NOTIFICAÇÕES ENVIADAS */}
      {activeSubTab === 'historico' && (
        <motion.div
          key="subtab-historico"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-4"
        >
          {/* Controls & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por kimono, marca ou loja no histórico..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white text-xs font-mono focus:outline-none focus:border-red-600"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'unread', label: `Não Lidas (${unreadNotificationsCount})` },
                { id: 'big_drops', label: 'Super Quedas (≥ 20%)' },
                { id: 'target_met', label: 'Preço Alvo Atingido' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    playClickSound();
                    setHistoryFilter(f.id as any);
                  }}
                  className={`px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer border whitespace-nowrap ${
                    historyFilter === f.id
                      ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                      : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-800 hover:border-zinc-400'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Clear & Mark as read */}
            <div className="flex items-center gap-2 shrink-0">
              {unreadNotificationsCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-2.5 py-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[9px] font-mono font-bold uppercase tracking-wider border border-zinc-300 dark:border-zinc-700 cursor-pointer"
                >
                  Marcar Lidas
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="px-2.5 py-1.5 bg-zinc-100 hover:bg-red-100 dark:bg-zinc-900 dark:hover:bg-red-950 text-zinc-600 hover:text-red-600 dark:text-zinc-400 text-[9px] font-mono font-bold uppercase tracking-wider border border-zinc-300 dark:border-zinc-800 cursor-pointer"
                  title="Limpar todas as notificações do histórico"
                >
                  Limpar Histórico
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 px-4 border-2 border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <BellOff size={36} className="mx-auto text-zinc-400 mb-3 opacity-50" />
              <h3 className="text-sm font-mono font-bold uppercase text-black dark:text-white">
                Nenhum alerta encontrado
              </h3>
              <p className="text-xs text-zinc-500 font-mono max-w-sm mx-auto mt-1 mb-4">
                {searchQuery || historyFilter !== 'all'
                  ? 'Nenhuma notificação corresponde aos filtros selecionados.'
                  : 'Quando um produto monitorado cair de preço ou atingir sua meta, o registro detalhado aparecerá aqui.'}
              </p>
              <button
                onClick={() => handleSimulateNotification()}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                ⚡ Simular Envio de Queda de Preço
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notif) => {
                const isTargetMet = notif.type === 'target_met';
                return (
                  <div
                    key={notif.id}
                    className={`p-4 border transition-all relative ${
                      !notif.isRead
                        ? 'bg-red-500/5 dark:bg-red-950/20 border-red-300 dark:border-red-900/60 shadow-sm'
                        : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    {/* Unread dot */}
                    {!notif.isRead && (
                      <span className="absolute top-3 right-3 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Product details */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <img
                          src={notif.productImage}
                          alt={notif.productTitle}
                          className="w-14 h-14 object-cover border border-zinc-200 dark:border-zinc-800 bg-white shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/icon.png';
                          }}
                        />

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[8.5px] font-mono font-black uppercase text-red-600 dark:text-red-400">
                              {notif.productBrand || 'EQUIPAMENTO'}
                            </span>
                            <span className="text-[8px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-700">
                              {notif.platform}
                            </span>
                            {isTargetMet ? (
                              <span className="text-[8px] font-mono font-black bg-green-500/10 text-green-600 dark:text-green-400 px-1.5 py-0.5 border border-green-500/30 uppercase flex items-center gap-1">
                                <CheckCircle2 size={10} /> Preço Alvo Atingido
                              </span>
                            ) : (
                              <span className="text-[8px] font-mono font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 border border-amber-500/30 uppercase flex items-center gap-1">
                                <Flame size={10} /> Queda Relâmpago
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs md:text-sm font-bold text-black dark:text-white truncate">
                            {notif.productTitle}
                          </h4>

                          {/* Price comparison */}
                          <div className="flex items-center gap-3 flex-wrap text-xs font-mono">
                            {notif.originalPrice && (
                              <span className="text-zinc-400 line-through text-[11px]">
                                De R$ {notif.originalPrice.toFixed(2)}
                              </span>
                            )}
                            <div className="flex items-center gap-1 font-black text-green-600 dark:text-green-400">
                              <span>Por R$ {notif.currentPrice.toFixed(2)}</span>
                              <ArrowDownRight size={14} />
                            </div>
                            {notif.discountPct && (
                              <span className="px-1.5 py-0.5 bg-green-600 text-white text-[9px] font-black uppercase">
                                -{notif.discountPct}% OFF
                              </span>
                            )}
                            {notif.savings > 0 && (
                              <span className="text-[10px] text-zinc-500 font-bold">
                                (Economia de R$ {notif.savings.toFixed(2)})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Channels & Actions */}
                      <div className="flex flex-row sm:flex-col items-end justify-between gap-2.5 shrink-0 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-100 dark:border-zinc-900">
                        <div className="flex items-center gap-1.5 text-[8.5px] font-mono text-zinc-400">
                          <Clock size={11} />
                          <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span className="text-zinc-500 uppercase">{notif.channelsNotified?.join(' + ') || 'Push'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              playClickSound();
                              // Mark as read
                              setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                              if (onNavigate) {
                                onNavigate(`/?product=${notif.productId}`);
                              } else {
                                addToast(`Redirecionando para oferta de ${notif.productTitle}...`, 'info');
                              }
                            }}
                            className="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>Ver Oferta</span>
                            <ExternalLink size={10} />
                          </button>

                          <button
                            onClick={() => handleDeleteNotification(notif.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer border border-transparent hover:border-red-300 dark:hover:border-red-800"
                            title="Excluir notificação do histórico"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* SUBTAB 2: GERENCIAR PRODUTOS MONITORADOS COM INTERRUPTOR (TOGGLE SWITCH) */}
      {activeSubTab === 'produtos' && (
        <motion.div
          key="subtab-produtos"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-4"
        >
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar produtos monitorados..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white text-xs font-mono focus:outline-none focus:border-red-600"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: `Todos (${safeMonitoredProducts.length})` },
                { id: 'active', label: `Ativos (${activeAlertsCount})` },
                { id: 'paused', label: `Pausados (${safeMonitoredProducts.length - activeAlertsCount})` }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    playClickSound();
                    setProductStatusFilter(f.id as any);
                  }}
                  className={`px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                    productStatusFilter === f.id
                      ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                      : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-800 hover:border-zinc-400'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Explanation Banner */}
          <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2.5 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
            <Sliders size={15} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <p>
              Use o <strong>interruptor ao lado de cada produto</strong> para ligar ou pausar o monitoramento de preço. Quando ativo, você recebe alertas push e e-mail no instante em que o valor atingir sua meta ou entrar em promoção.
            </p>
          </div>

          {/* Monitored Products Grid / List */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 px-4 border-2 border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <Heart size={36} className="mx-auto text-zinc-400 mb-3 opacity-50" />
              <h3 className="text-sm font-mono font-bold uppercase text-black dark:text-white">
                Nenhum produto sob monitoramento ativo
              </h3>
              <p className="text-xs text-zinc-500 font-mono max-w-sm mx-auto mt-1 mb-4">
                Favorite produtos na loja ou clique no sino dos cards para definir suas metas de preço ideais.
              </p>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('LANDING')}
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-mono font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  Explorar Catálogo de Kimonos
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map(product => {
                const isAlertActive = localAlertStates[product.id] ?? wishlistAlerts.has(product.id) ?? true;
                const customTarget = targetPrices[product.id] || Math.round(product.price * 0.88);
                const isEditing = editingTargetId === product.id;

                return (
                  <div
                    key={product.id}
                    className={`p-4 border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isAlertActive
                        ? 'bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 hover:border-zinc-400'
                        : 'bg-zinc-50/70 dark:bg-zinc-950/40 border-dashed border-zinc-300 dark:border-zinc-800 opacity-85'
                    }`}
                  >
                    {/* Left: Product Info */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-16 h-16 object-cover border border-zinc-200 dark:border-zinc-800 bg-white shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/icon.png';
                        }}
                      />

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[8.5px] font-mono font-black uppercase text-red-600 dark:text-red-400">
                            {product.brand || 'BJJ GEAR'}
                          </span>
                          <span className="text-[8px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-700">
                            {product.category}
                          </span>
                          <span className="text-[8px] font-mono text-zinc-400">
                            {product.platform}
                          </span>
                        </div>

                        <h4 className="text-xs md:text-sm font-bold text-black dark:text-white truncate">
                          {product.title}
                        </h4>

                        {/* Prices & Target */}
                        <div className="flex items-center gap-3 flex-wrap text-xs font-mono pt-0.5">
                          <span className="text-zinc-600 dark:text-zinc-400">
                            Atual: <strong>R$ {product.price.toFixed(2)}</strong>
                          </span>

                          <span className="text-zinc-300 dark:text-zinc-700">•</span>

                          {/* Editable Target Price */}
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-zinc-400 font-mono">Meta: R$</span>
                              <input
                                type="text"
                                value={tempTargetValue}
                                onChange={e => setTempTargetValue(e.target.value)}
                                className="w-20 px-1.5 py-0.5 bg-white dark:bg-black border border-green-500 text-black dark:text-white text-xs font-mono"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveTargetPrice(product.id)}
                                className="p-1 bg-green-600 text-white hover:bg-green-500 cursor-pointer"
                                title="Salvar Preço Alvo"
                              >
                                <Check size={11} />
                              </button>
                              <button
                                onClick={() => setEditingTargetId(null)}
                                className="p-1 bg-zinc-300 dark:bg-zinc-700 text-black dark:text-white cursor-pointer"
                              >
                                <X size={11} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-mono font-black text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 border border-green-500/20">
                                Meta: R$ {customTarget.toFixed(2)}
                              </span>
                              <button
                                onClick={() => {
                                  playClickSound();
                                  setEditingTargetId(product.id);
                                  setTempTargetValue(customTarget.toFixed(2));
                                }}
                                className="p-1 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
                                title="Editar Preço Alvo"
                              >
                                <Pencil size={11} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: THE TOGGLE SWITCH & Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100 dark:border-zinc-900 shrink-0">
                      {/* Interactive Toggle Switch Component */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className={`text-[10px] font-mono font-black uppercase block tracking-wider ${
                            isAlertActive ? 'text-green-600 dark:text-green-400' : 'text-zinc-400'
                          }`}>
                            {isAlertActive ? 'Alerta Ativo' : 'Pausado'}
                          </span>
                          <span className="text-[8.5px] font-mono text-zinc-500 block">
                            {isAlertActive ? 'Monitorando 24/7' : 'Silenciado'}
                          </span>
                        </div>

                        {/* The Switch Button */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isAlertActive}
                          id={`toggle-alert-${product.id}`}
                          onClick={() => handleToggleProductAlert(product.id, product.title)}
                          className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                            isAlertActive
                              ? 'bg-green-600 shadow-[0_0_12px_rgba(22,163,74,0.4)]'
                              : 'bg-zinc-300 dark:bg-zinc-700'
                          }`}
                          title={isAlertActive ? 'Clique para desativar este alerta' : 'Clique para ativar este alerta'}
                        >
                          <motion.span
                            layout
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className={`w-4.5 h-4.5 rounded-full bg-white block absolute top-0.75 shadow-md flex items-center justify-center ${
                              isAlertActive ? 'left-6.5' : 'left-1'
                            }`}
                          >
                            {isAlertActive ? (
                              <Bell size={9} className="text-green-600" />
                            ) : (
                              <BellOff size={9} className="text-zinc-400" />
                            )}
                          </motion.span>
                        </button>
                      </div>

                      {/* Quick Test Trigger for this product */}
                      <button
                        onClick={() => handleSimulateNotification(product)}
                        disabled={!isAlertActive}
                        className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 disabled:opacity-40 text-zinc-700 dark:text-zinc-300 text-[9px] font-mono font-bold uppercase tracking-wider border border-zinc-200 dark:border-zinc-800 cursor-pointer flex items-center gap-1"
                        title="Simular queda de preço para este produto específico"
                      >
                        <Zap size={11} className="text-amber-500" />
                        <span className="hidden sm:inline">Testar</span>
                      </button>

                      {/* View in Shop */}
                      <button
                        onClick={() => {
                          playClickSound();
                          if (onSelectProduct) {
                            onSelectProduct(product);
                          } else if (onNavigate) {
                            onNavigate(`/?product=${product.id}`);
                          }
                        }}
                        className="p-2 text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                        title="Ver detalhes do produto"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* SUBTAB 3: ASSINATURA EM TÓPICOS POR CATEGORIA DE PRODUTOS (COM AUTOMAÇÃO) */}
      {activeSubTab === 'topicos' && (
        <motion.div
          key="subtab-topicos"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-6"
        >
          {/* Main Automation Box */}
          <div className="p-5 md:p-6 bg-amber-500/5 dark:bg-amber-950/20 border-2 border-amber-500/30 dark:border-amber-700/40 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" />
                  <h3 className="text-sm font-mono font-black uppercase text-black dark:text-white">
                    AUTOMAÇÃO INTELIGENTE DE ASSINATURA EM TÓPICOS
                  </h3>
                  <span className="text-[8px] font-mono bg-amber-500 text-black px-2 py-0.5 font-black uppercase">
                    RECOMENDAÇÃO AUTOMÁTICA
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 font-mono leading-relaxed max-w-2xl">
                  Garante que você receba apenas alertas de preços para os tipos de kimonos, rashguards ou faixas que você mais busca no tatame. Nosso algoritmo analisa seu comportamento de busca e ativa automaticamente os tópicos correspondentes.
                </p>
              </div>

              {/* Master Auto-Subscribe Toggle Switch */}
              <div className="flex items-center gap-3 shrink-0 bg-white dark:bg-zinc-900 p-3 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="text-right">
                  <span className="text-[10px] font-mono font-black uppercase text-black dark:text-white block">
                    {autoSubscribeTopics ? 'Automação Ativa' : 'Automação Pausada'}
                  </span>
                  <span className="text-[8.5px] font-mono text-zinc-400 block">
                    Auto-sincronizar por buscas
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoSubscribeTopics}
                  id="toggle-auto-subscribe-topics"
                  onClick={() => {
                    playClickSound();
                    const next = !autoSubscribeTopics;
                    setAutoSubscribeTopics(next);
                    if (next) {
                      addToast('Automação de tópicos ATIVADA! Suas categorias favoritas foram sincronizadas.', 'success');
                    } else {
                      addToast('Automação de tópicos PAUSADA. Você pode gerenciar manualmente abaixo.', 'info');
                    }
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    autoSubscribeTopics
                      ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                      : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`w-4.5 h-4.5 rounded-full bg-white block absolute top-0.75 shadow-md flex items-center justify-center ${
                      autoSubscribeTopics ? 'left-6.5' : 'left-1'
                    }`}
                  >
                    <Sparkles size={9} className={autoSubscribeTopics ? 'text-amber-600' : 'text-zinc-400'} />
                  </motion.span>
                </button>
              </div>
            </div>

            {/* Smart Detection Feedback */}
            {detectedUserTopCategories.length > 0 && autoSubscribeTopics && (
              <div className="mt-4 pt-4 border-t border-amber-500/20 flex items-center gap-2 text-xs font-mono text-amber-800 dark:text-amber-300">
                <CheckCircle2 size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  Categorias detectadas pelo seu histórico: <strong>{detectedUserTopCategories.join(', ')}</strong>. Tópicos correspondentes estão com prioridade no radar.
                </span>
              </div>
            )}
          </div>

          {/* Discount Threshold Filter */}
          <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-mono font-bold uppercase text-black dark:text-white flex items-center gap-1.5">
                <Filter size={13} className="text-red-500" />
                Sensibilidade do Radar de Preço
              </span>
              <p className="text-[10px] text-zinc-500 font-mono">
                Disparar alertas apenas quando a queda de preço no tópico atingir o percentual mínimo:
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { val: 5, label: 'Qualquer Queda (≥ 5%)' },
                { val: 10, label: '≥ 10% Desconto' },
                { val: 20, label: '≥ 20% Super Desconto' },
                { val: 30, label: '≥ 30% Promoção Relâmpago' }
              ].map(th => (
                <button
                  key={th.val}
                  onClick={() => {
                    playClickSound();
                    setDiscountThreshold(th.val);
                    addToast(`Sensibilidade ajustada para quedas acima de ${th.val}%.`, 'info');
                  }}
                  className={`px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                    discountThreshold === th.val
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400'
                  }`}
                >
                  {th.label}
                </button>
              ))}
            </div>
          </div>

          {/* Individual Category Topics List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono font-black uppercase text-black dark:text-white">
                TÓPICOS DISPONÍVEIS ({subscribedTopicIds.size} de {CATEGORY_TOPICS_DEFINITIONS.length} ATIVOS)
              </span>
              <span className="text-[9px] font-mono text-zinc-500 uppercase">
                Notificações personalizadas via Service Worker
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {CATEGORY_TOPICS_DEFINITIONS.map(topic => {
                const isSubscribed = subscribedTopicIds.has(topic.id);
                const isRecommended = detectedUserTopCategories.some(cat => 
                  topic.category.toLowerCase().includes(cat.toLowerCase()) || 
                  cat.toLowerCase().includes(topic.category.toLowerCase())
                );

                return (
                  <div
                    key={topic.id}
                    className={`p-4 border transition-all flex items-start justify-between gap-4 ${
                      isSubscribed
                        ? 'bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 shadow-sm'
                        : 'bg-zinc-50/60 dark:bg-zinc-950/30 border-dashed border-zinc-200 dark:border-zinc-800 opacity-75'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg">{topic.icon}</span>
                        <h4 className="text-xs font-mono font-black text-black dark:text-white uppercase tracking-wider">
                          {topic.name}
                        </h4>
                        {isRecommended && (
                          <span className="text-[7.5px] font-mono font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 border border-amber-500/30 uppercase">
                            ⭐ Mais buscado por você
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono leading-relaxed">
                        {topic.description}
                      </p>

                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-[8.5px] font-mono text-zinc-400">
                          Quedas mínimas: <strong>≥ {discountThreshold}%</strong>
                        </span>

                        {isSubscribed && (
                          <button
                            onClick={() => handleTestCategoryTopicNotification(topic)}
                            className="text-[8.5px] font-mono font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Zap size={9} />
                            <span>Testar Notificação</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Individual Topic Switch */}
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isSubscribed}
                        id={`switch-${topic.id}`}
                        onClick={() => handleToggleTopic(topic.id, topic.name)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          isSubscribed ? 'bg-green-600' : 'bg-zinc-300 dark:bg-zinc-700'
                        }`}
                        title={isSubscribed ? 'Desativar este tópico' : 'Ativar este tópico'}
                      >
                        <motion.span
                          layout
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className={`w-4 h-4 rounded-full bg-white block absolute top-1 shadow-sm ${
                            isSubscribed ? 'left-6' : 'left-1'
                          }`}
                        />
                      </button>
                      <span className={`text-[8px] font-mono uppercase font-black ${
                        isSubscribed ? 'text-green-600 dark:text-green-400' : 'text-zinc-400'
                      }`}>
                        {isSubscribed ? 'Inscrito' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PriceAlertsCenter;

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
  AlertCircle,
  Send,
  Eye,
  ShieldCheck,
  Plus,
  ShoppingBag,
  Share2
} from 'lucide-react';
import { Product, InAppPriceAlertNotification, OfferSubscription } from '../types';
import { auth, saveOfferSubscriptionToFirestore, removeOfferSubscriptionFromFirestore, saveInAppNotificationToFirestore } from '../lib/firebase';

export interface OfferNotificationsCenterProps {
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
  initialSubTab?: 'historico' | 'produtos' | 'categorias' | 'simulador';
}

// BJJ Categories available for subscription
export const OFFER_CATEGORIES_CONFIG = [
  {
    id: 'cat-kimonos',
    name: 'Kimonos Trançados & Competição',
    category: 'Kimonos',
    icon: '🥋',
    description: 'Armaduras trançadas leves, ripstop e kimonos homologados IBJJF / CBJJ com os menores preços do mercado.',
    popularBrands: ['Vagabond BJJ', 'Shoyoroll', 'Atama', 'KVRA', 'Koral']
  },
  {
    id: 'cat-faixas',
    name: 'Faixas de Graduação (Todas as Cores)',
    category: 'Faixas',
    icon: '🪢',
    description: 'Faixas branca, azul, roxa, marrom, preta, ponta vermelha e edições especiais em algodão egípcio e trançado.',
    popularBrands: ['Shoyoroll', 'Atama', 'Venum', 'Braus']
  },
  {
    id: 'cat-rashguards',
    name: 'No-Gi, Rashguards & Bermudas',
    category: 'Rashguards',
    icon: '⚡',
    description: 'Lycras de compressão anatômica, bermudas sem costura interna e spats para grappling de alto rendimento.',
    popularBrands: ['Venum', 'Tatami Fightwear', 'Scramble', 'Progress']
  },
  {
    id: 'cat-protecao',
    name: 'Equipamentos de Proteção',
    category: 'Equipamentos de Proteção',
    icon: '🛡️',
    description: 'Protetores bucais térmicos de alto impacto, joelheiras de neoprene, orelheiras anatômicas e coquilhas.',
    popularBrands: ['Shock Doctor', 'Venum', 'Bad Boy', 'Mouthguard Pro']
  },
  {
    id: 'cat-suplementos',
    name: 'Nutrição & Suplementos do Atleta',
    category: 'Suplementos',
    icon: '💊',
    description: 'Creatina Creapure, Whey Protein isolado, aminoácidos de recuperação e eletrólitos para combate.',
    popularBrands: ['Dux Nutrition', 'Growth Supplements', 'Max Titanium', 'Optimum Nutrition']
  },
  {
    id: 'cat-acessorios',
    name: 'Bolsas, Mochilas & Acessórios',
    category: 'Acessórios',
    icon: '🎒',
    description: 'Mochilas especiais para kimonos molhados, esparadrapos reforçados para dedos e garrafas térmicas.',
    popularBrands: ['KVRA', 'Venum', 'Keiko Sports']
  },
  {
    id: 'cat-cursos',
    name: 'Cursos Online & E-books Técnicos',
    category: 'Cursos Online',
    icon: '📚',
    description: 'Instrucionais dos maiores campeões mundiais de Jiu-Jitsu, livros de filosofia estóica e planos de treino.',
    popularBrands: ['BJJ Fanatics', 'Hotmart', 'FloGrappling']
  },
  {
    id: 'cat-infantil',
    name: 'Equipamentos Infantis / Kids',
    category: 'Infantil',
    icon: '👦',
    description: 'Kimonos leves M0 a M4, faixas infantis coloridas e proteções adaptadas para os pequenos guerreiros.',
    popularBrands: ['Atama Kids', 'Koral Kids', 'Venum Kids']
  }
];

// Initial realistic notifications to display
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
    category: 'Kimonos',
    type: 'promo_drop',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    isRead: false,
    channelsNotified: ['push', 'email', 'app'],
    emailSent: true,
    emailRecipient: 'atleta@tatame.com'
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
    category: 'Faixas',
    type: 'new_deal',
    dealDetails: {
      storeName: 'Amazon Prime',
      couponCode: 'TATAME10',
      description: 'Cupom de 10% adicional com frete grátis liberado'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    isRead: false,
    channelsNotified: ['email', 'app'],
    emailSent: true,
    emailRecipient: 'atleta@tatame.com'
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
    category: 'Rashguards',
    type: 'flash_deal',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    isRead: true,
    channelsNotified: ['push', 'email', 'app'],
    emailSent: true,
    emailRecipient: 'atleta@tatame.com'
  }
];

export const OfferNotificationsCenter: React.FC<OfferNotificationsCenterProps> = ({
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
  const [activeSubTab, setActiveSubTab] = useState<'historico' | 'produtos' | 'categorias' | 'simulador'>(initialSubTab);

  // User notification email setting
  const [userNotificationEmail, setUserNotificationEmail] = useState<string>(() => {
    return user?.email || localStorage.getItem('oss_user_notification_email') || 'gustavorotatori@gmail.com';
  });
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempEmailInput, setTempEmailInput] = useState(userNotificationEmail);

  // In-App Notifications History
  const [notifications, setNotifications] = useState<InAppPriceAlertNotification[]>(() => {
    try {
      const saved = localStorage.getItem('oss_price_alert_notifications_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_INITIAL_NOTIFICATIONS;
  });

  // Modal for previewing generated email
  const [previewEmailNotification, setPreviewEmailNotification] = useState<InAppPriceAlertNotification | null>(null);

  // Subscribed Products Map
  const [productSubscriptions, setProductSubscriptions] = useState<Record<string, {
    active: boolean;
    targetPrice: number;
    channelEmail: boolean;
    channelApp: boolean;
    triggerPriceDrop: boolean;
    triggerNewDeal: boolean;
  }>>(() => {
    const map: Record<string, any> = {};
    try {
      const saved = localStorage.getItem('oss_product_offer_subscriptions');
      if (saved) {
        Object.assign(map, JSON.parse(saved));
      }
    } catch (e) {}
    return map;
  });

  // Subscribed Categories Map
  const [categorySubscriptions, setCategorySubscriptions] = useState<Record<string, {
    active: boolean;
    channelEmail: boolean;
    channelApp: boolean;
    triggerPriceDrop: boolean;
    triggerNewDeal: boolean;
    minDiscountPct: number;
  }>>(() => {
    const map: Record<string, any> = {
      'cat-kimonos': { active: true, channelEmail: true, channelApp: true, triggerPriceDrop: true, triggerNewDeal: true, minDiscountPct: 10 },
      'cat-faixas': { active: true, channelEmail: true, channelApp: true, triggerPriceDrop: true, triggerNewDeal: true, minDiscountPct: 15 },
      'cat-rashguards': { active: true, channelEmail: true, channelApp: true, triggerPriceDrop: true, triggerNewDeal: true, minDiscountPct: 20 },
    };
    try {
      const saved = localStorage.getItem('oss_category_offer_subscriptions');
      if (saved) {
        Object.assign(map, JSON.parse(saved));
      }
    } catch (e) {}
    return map;
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'unread' | 'price_drops' | 'new_deals'>('all');
  const [productFilter, setProductFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulator interactive form state
  const [simTargetType, setSimTargetType] = useState<'product' | 'category'>('product');
  const [simSelectedProductId, setSimSelectedProductId] = useState<string>(productList[0]?.id || '1');
  const [simSelectedCategoryId, setSimSelectedCategoryId] = useState<string>('cat-kimonos');
  const [simEventType, setSimEventType] = useState<'price_drop' | 'new_deal'>('price_drop');
  const [simDiscountPct, setSimDiscountPct] = useState<number>(25);
  const [simChannelEmail, setSimChannelEmail] = useState<boolean>(true);
  const [simChannelApp, setSimChannelApp] = useState<boolean>(true);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('oss_price_alert_notifications_history', JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('oss_product_offer_subscriptions', JSON.stringify(productSubscriptions));
    } catch (e) {}
  }, [productSubscriptions]);

  useEffect(() => {
    try {
      localStorage.setItem('oss_category_offer_subscriptions', JSON.stringify(categorySubscriptions));
    } catch (e) {}
  }, [categorySubscriptions]);

  // Detected athlete categories
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

  // Combined safe monitored products
  const safeMonitoredProducts = useMemo(() => {
    if (monitoredProducts.length > 0) return monitoredProducts;
    if (wishlistAlerts.size > 0 && productList.length > 0) {
      return productList.filter(p => wishlistAlerts.has(p.id));
    }
    return productList.slice(0, 5);
  }, [monitoredProducts, wishlistAlerts, productList]);

  // Toggle product subscription
  const handleToggleProductSub = useCallback(async (productId: string, productTitle: string) => {
    playClickSound();
    setProductSubscriptions(prev => {
      const existing = prev[productId] || {
        active: true,
        targetPrice: 0,
        channelEmail: true,
        channelApp: true,
        triggerPriceDrop: true,
        triggerNewDeal: true
      };
      const nextActive = !existing.active;
      const updated = {
        ...prev,
        [productId]: {
          ...existing,
          active: nextActive
        }
      };

      if (nextActive) {
        addToast(`Notificações ATIVADAS para "${productTitle.slice(0, 24)}..." (E-mail & In-App)`, 'success');
      } else {
        addToast(`Notificações PAUSADAS para "${productTitle.slice(0, 24)}..."`, 'info');
      }

      // Sync to Firestore if authenticated
      if (auth.currentUser) {
        saveOfferSubscriptionToFirestore(auth.currentUser.uid, {
          id: `prod_${productId}`,
          targetType: 'product',
          targetId: productId,
          targetName: productTitle,
          channels: { email: existing.channelEmail, inApp: existing.channelApp },
          email: userNotificationEmail,
          triggerOnPriceDrop: existing.triggerPriceDrop,
          triggerOnNewDeal: existing.triggerNewDeal,
          active: nextActive,
          createdAt: new Date().toISOString()
        }).catch(err => console.warn('Firestore subscription sync warning:', err));
      }

      return updated;
    });

    if (onTogglePriceAlert) {
      onTogglePriceAlert(productId);
    }
  }, [onTogglePriceAlert, addToast, playClickSound, userNotificationEmail]);

  // Update product subscription settings (channels, triggers, target price)
  const handleUpdateProductSub = (productId: string, partial: Partial<{
    targetPrice: number;
    channelEmail: boolean;
    channelApp: boolean;
    triggerPriceDrop: boolean;
    triggerNewDeal: boolean;
  }>) => {
    playClickSound();
    setProductSubscriptions(prev => {
      const existing = prev[productId] || {
        active: true,
        targetPrice: 0,
        channelEmail: true,
        channelApp: true,
        triggerPriceDrop: true,
        triggerNewDeal: true
      };
      return {
        ...prev,
        [productId]: {
          ...existing,
          ...partial
        }
      };
    });
    addToast('Preferências de notificação atualizadas!', 'success');
  };

  // Toggle category subscription
  const handleToggleCategorySub = useCallback((catId: string, catName: string) => {
    playClickSound();
    setCategorySubscriptions(prev => {
      const existing = prev[catId] || {
        active: false,
        channelEmail: true,
        channelApp: true,
        triggerPriceDrop: true,
        triggerNewDeal: true,
        minDiscountPct: 10
      };
      const nextActive = !existing.active;
      const updated = {
        ...prev,
        [catId]: {
          ...existing,
          active: nextActive
        }
      };

      if (nextActive) {
        addToast(`Inscrição ATIVA na categoria ${catName}! Alertas de novas ofertas habilitados.`, 'success');
      } else {
        addToast(`Inscrição PAUSADA na categoria ${catName}.`, 'info');
      }

      // Sync to Firestore if authenticated
      if (auth.currentUser) {
        saveOfferSubscriptionToFirestore(auth.currentUser.uid, {
          id: `cat_${catId}`,
          targetType: 'category',
          targetId: catId,
          targetName: catName,
          channels: { email: existing.channelEmail, inApp: existing.channelApp },
          email: userNotificationEmail,
          triggerOnPriceDrop: existing.triggerPriceDrop,
          triggerOnNewDeal: existing.triggerNewDeal,
          discountThresholdPct: existing.minDiscountPct,
          active: nextActive,
          createdAt: new Date().toISOString()
        }).catch(err => console.warn('Firestore category sub sync warning:', err));
      }

      return updated;
    });
  }, [addToast, playClickSound, userNotificationEmail]);

  // Update category subscription settings
  const handleUpdateCategorySub = (catId: string, partial: Partial<{
    channelEmail: boolean;
    channelApp: boolean;
    triggerPriceDrop: boolean;
    triggerNewDeal: boolean;
    minDiscountPct: number;
  }>) => {
    playClickSound();
    setCategorySubscriptions(prev => {
      const existing = prev[catId] || {
        active: true,
        channelEmail: true,
        channelApp: true,
        triggerPriceDrop: true,
        triggerNewDeal: true,
        minDiscountPct: 10
      };
      return {
        ...prev,
        [catId]: {
          ...existing,
          ...partial
        }
      };
    });
    addToast('Configurações de alerta da categoria atualizadas!', 'success');
  };

  // Save email
  const handleSaveEmail = () => {
    if (!tempEmailInput.includes('@') || !tempEmailInput.includes('.')) {
      addToast('Por favor, informe um endereço de e-mail válido.', 'error');
      return;
    }
    setUserNotificationEmail(tempEmailInput);
    localStorage.setItem('oss_user_notification_email', tempEmailInput);
    setIsEditingEmail(false);
    addToast(`E-mail de notificações atualizado para ${tempEmailInput}!`, 'success');
  };

  // Dispatch an Offer Alert (Calls /api/notifications/offer-alert and updates in-app + email)
  const dispatchOfferAlert = async (options: {
    targetType: 'product' | 'category';
    targetName: string;
    eventType: 'price_drop' | 'new_deal';
    product: Product;
    dealDetails?: { storeName?: string; couponCode?: string; description?: string };
    discountPct?: number;
    sendEmail?: boolean;
    sendApp?: boolean;
  }) => {
    const {
      targetType,
      targetName,
      eventType,
      product,
      dealDetails,
      discountPct = 25,
      sendEmail = true,
      sendApp = true
    } = options;

    setIsSimulating(true);

    const calculatedSavings = Math.round(product.price * (discountPct / 100));
    const newPrice = Math.max(49.90, product.price - calculatedSavings);

    try {
      // 1. Call backend endpoint to process real notification and generate transactional email
      const response = await fetch('/api/notifications/offer-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetName,
          eventType,
          email: sendEmail ? userNotificationEmail : undefined,
          product: {
            id: product.id,
            title: product.title,
            brand: product.brand,
            price: newPrice,
            originalPrice: product.price,
            imageUrl: product.imageUrl,
            category: product.category,
            platform: product.platform,
            affiliateUrl: product.affiliateUrl
          },
          dealDetails: dealDetails || {
            storeName: product.platform,
            couponCode: eventType === 'new_deal' ? 'TATAME15' : undefined,
            description: eventType === 'new_deal' ? 'Nova oferta com menor preço histórico detectada!' : 'Queda de preço monitorada no tatame.'
          }
        })
      });

      const data = await response.json();

      // 2. Create in-app notification record
      const inAppNotif: InAppPriceAlertNotification = {
        id: data.notification?.id || `notif_${Date.now()}`,
        productId: product.id,
        productTitle: product.title,
        productBrand: product.brand || 'BJJ Equipment',
        productImage: product.imageUrl || '/icon.png',
        targetPrice: newPrice,
        currentPrice: newPrice,
        originalPrice: product.price,
        discountPct: discountPct,
        savings: calculatedSavings,
        platform: product.platform,
        category: product.category,
        type: eventType === 'new_deal' ? 'new_deal' : 'promo_drop',
        createdAt: new Date().toISOString(),
        isRead: false,
        channelsNotified: [
          ...(sendApp ? ['app' as const, 'push' as const] : []),
          ...(sendEmail ? ['email' as const] : [])
        ],
        dealDetails: dealDetails || data.notification?.dealDetails,
        emailSent: Boolean(sendEmail),
        emailRecipient: sendEmail ? userNotificationEmail : undefined,
        emailHtmlPreview: data.emailHtmlPreview
      };

      // Prepend to in-app notifications
      setNotifications(prev => [inAppNotif, ...prev]);

      // Sync to Firestore if authenticated
      if (auth.currentUser) {
        saveInAppNotificationToFirestore(auth.currentUser.uid, inAppNotif).catch(e => console.warn(e));
      }

      // 3. Trigger Service Worker Browser Push if granted
      if (sendApp && typeof window !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          try {
            const reg = await navigator.serviceWorker.ready;
            if (reg && 'showNotification' in reg) {
              const pushTitle = eventType === 'price_drop'
                ? `🔥 Preço Baixou: ${product.title.slice(0, 30)}...`
                : `⚡ Nova Oferta Disponível: ${targetName}`;
              await reg.showNotification(pushTitle, {
                body: `Economia de R$ ${calculatedSavings.toFixed(2)} (-${discountPct}%)! De R$ ${product.price.toFixed(2)} por R$ ${newPrice.toFixed(2)}. Toque para conferir!`,
                icon: product.imageUrl || '/icon.png',
                badge: '/icon.png',
                vibrate: [200, 100, 200],
                data: { url: `/?view=SHOP&product=${product.id}` }
              } as any);
            }
          } catch (e) {
            console.warn('SW notification fallback:', e);
          }
        }
      }

      // Success feedback
      const eventLabel = eventType === 'price_drop' ? 'Queda de Preço' : 'Nova Oferta';
      addToast(
        `Alerta de ${eventLabel} disparado! In-App criado${sendEmail ? ` e e-mail transacional enviado para ${userNotificationEmail}` : ''}.`,
        'success'
      );

      // Open email preview modal for instant visual confirmation
      if (sendEmail && data.emailHtmlPreview) {
        setPreviewEmailNotification(inAppNotif);
      }

    } catch (err) {
      console.error('Erro ao disparar alerta de oferta:', err);
      addToast('Erro ao processar disparo de notificação.', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notif => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = notif.productTitle.toLowerCase().includes(q);
        const matchesBrand = notif.productBrand?.toLowerCase().includes(q);
        const matchesStore = notif.platform.toLowerCase().includes(q);
        const matchesCat = notif.category?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesBrand && !matchesStore && !matchesCat) return false;
      }

      if (historyFilter === 'unread') return !notif.isRead;
      if (historyFilter === 'price_drops') return notif.type === 'promo_drop' || notif.type === 'target_met' || notif.type === 'flash_deal';
      if (historyFilter === 'new_deals') return notif.type === 'new_deal' || notif.type === 'deal_available' || notif.type === 'category_deal';
      return true;
    });
  }, [notifications, searchQuery, historyFilter]);

  // Counts
  const totalMonitoredProducts = safeMonitoredProducts.length;
  const activeProductsCount = safeMonitoredProducts.filter(p => (productSubscriptions[p.id]?.active ?? true)).length;
  const activeCategoriesCount = Object.values(categorySubscriptions).filter((c: any) => Boolean(c?.active)).length;
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={`space-y-6 font-sans ${className}`} id="central-ofertas-notificacoes">
      {/* Top Banner & KPI Bar */}
      <div className="bg-[#09090b] border-2 border-black dark:border-zinc-800 p-5 md:p-6 text-white relative overflow-hidden shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#27272a]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-2 bg-red-600 text-white flex items-center justify-center border border-red-500 shadow-sm">
                <BellRing size={20} className="animate-pulse" />
              </div>
              <h2 className="text-lg md:text-xl font-mono font-black uppercase tracking-wider text-white">
                NOTIFICAÇÕES DE OFERTAS & PREÇOS
              </h2>
              <span className="text-[9px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 bg-green-950/80 text-green-400 border border-green-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                MONITORAMENTO 24/7 ATIVO
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-mono leading-relaxed">
              Receba avisos instantâneos por <strong>e-mail</strong> ou <strong>notificação in-app</strong> sempre que o preço de um produto inscrito baixar ou uma nova oferta/cupom ficar disponível na categoria desejada.
            </p>
          </div>

          {/* Quick Email & Simulator Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {/* Quick Trigger Button */}
            <button
              id="btn-quick-simulate-offer"
              onClick={() => {
                playClickSound();
                setActiveSubTab('simulador');
              }}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 border border-red-400 shadow-[2px_2px_0px_0px_#000000] cursor-pointer transition-all active:scale-95"
            >
              <Zap size={14} className="text-amber-300" />
              <span>Simulador de Alertas</span>
            </button>
          </div>
        </div>

        {/* User Notification Channel Settings Header */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 flex-wrap text-zinc-300">
            <Mail size={14} className="text-green-400 shrink-0" />
            <span>Destino dos alertas por e-mail:</span>
            {isEditingEmail ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="email"
                  value={tempEmailInput}
                  onChange={e => setTempEmailInput(e.target.value)}
                  className="px-2 py-1 bg-black border border-green-500 text-white text-xs font-mono focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveEmail}
                  className="px-2 py-1 bg-green-600 text-white hover:bg-green-500 text-[10px] font-bold"
                >
                  Salvar
                </button>
                <button
                  onClick={() => {
                    setTempEmailInput(userNotificationEmail);
                    setIsEditingEmail(false);
                  }}
                  className="px-2 py-1 bg-zinc-800 text-zinc-400 hover:text-white text-[10px]"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <strong className="text-white underline decoration-green-500">{userNotificationEmail}</strong>
                <button
                  onClick={() => setIsEditingEmail(true)}
                  className="text-[9px] text-zinc-400 hover:text-white underline cursor-pointer"
                  title="Alterar endereço de e-mail para alertas"
                >
                  (Alterar)
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
            <Smartphone size={13} className="text-blue-400" />
            <span>In-App: <strong>Ativo no navegador & app</strong></span>
          </div>
        </div>

        {/* 4 KPI Metrics Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-850 text-center sm:text-left">
          <div className="p-3 bg-black/60 border border-zinc-800">
            <span className="text-[8.5px] font-mono text-zinc-400 uppercase block">Avisos Recebidos</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-mono font-black text-white">{notifications.length}</span>
              {unreadNotificationsCount > 0 && (
                <span className="text-[9px] font-mono font-bold text-red-400 animate-pulse">
                  ({unreadNotificationsCount} novos)
                </span>
              )}
            </div>
          </div>

          <div className="p-3 bg-black/60 border border-zinc-800">
            <span className="text-[8.5px] font-mono text-zinc-400 uppercase block">Produtos Inscritos</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-mono font-black text-white">{safeMonitoredProducts.length}</span>
              <span className="text-[9px] font-mono text-green-400">({activeProductsCount} ativos)</span>
            </div>
          </div>

          <div className="p-3 bg-black/60 border border-zinc-800">
            <span className="text-[8.5px] font-mono text-zinc-400 uppercase block">Categorias Inscritas</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-mono font-black text-amber-400">{activeCategoriesCount}</span>
              <span className="text-[9px] font-mono text-zinc-500">de {OFFER_CATEGORIES_CONFIG.length}</span>
            </div>
          </div>

          <div className="p-3 bg-black/60 border border-zinc-800">
            <span className="text-[8.5px] font-mono text-zinc-400 uppercase block">Canais Ativos</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-base font-mono font-black text-white">E-mail + In-App</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Subtabs */}
      <div className="flex items-center justify-between border-b-2 border-black dark:border-zinc-800 gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Tab 1: In-App Notifications History */}
          <button
            id="tab-notificacoes-inapp"
            onClick={() => {
              playClickSound();
              setActiveSubTab('historico');
            }}
            className={`px-3 sm:px-4 py-3 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-2 border-t-2 border-x-2 -mb-[2px] transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'historico'
                ? 'bg-white dark:bg-zinc-900 text-black dark:text-white border-black dark:border-zinc-700 shadow-[2px_-2px_0px_#000000] dark:shadow-[2px_-2px_0px_#ffffff]'
                : 'bg-transparent text-zinc-500 hover:text-black dark:hover:text-white border-transparent'
            }`}
          >
            <Clock size={13} />
            <span>Avisos In-App ({notifications.length})</span>
            {unreadNotificationsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[8px] flex items-center justify-center font-mono font-black animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Tab 2: Specific Products Subscriptions */}
          <button
            id="tab-inscricao-produtos"
            onClick={() => {
              playClickSound();
              setActiveSubTab('produtos');
            }}
            className={`px-3 sm:px-4 py-3 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-2 border-t-2 border-x-2 -mb-[2px] transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'produtos'
                ? 'bg-white dark:bg-zinc-900 text-black dark:text-white border-black dark:border-zinc-700 shadow-[2px_-2px_0px_#000000] dark:shadow-[2px_-2px_0px_#ffffff]'
                : 'bg-transparent text-zinc-500 hover:text-black dark:hover:text-white border-transparent'
            }`}
          >
            <ShoppingBag size={13} />
            <span>Assinatura por Produtos ({safeMonitoredProducts.length})</span>
            <span className="hidden sm:inline-block text-[8px] font-mono bg-green-500/10 text-green-600 dark:text-green-400 px-1.5 py-0.5 border border-green-500/30">
              Queda & Deals
            </span>
          </button>

          {/* Tab 3: Category Subscriptions */}
          <button
            id="tab-inscricao-categorias"
            onClick={() => {
              playClickSound();
              setActiveSubTab('categorias');
            }}
            className={`px-3 sm:px-4 py-3 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-2 border-t-2 border-x-2 -mb-[2px] transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'categorias'
                ? 'bg-white dark:bg-zinc-900 text-black dark:text-white border-black dark:border-zinc-700 shadow-[2px_-2px_0px_#000000] dark:shadow-[2px_-2px_0px_#ffffff]'
                : 'bg-transparent text-zinc-500 hover:text-black dark:hover:text-white border-transparent'
            }`}
          >
            <Tag size={13} />
            <span>Assinatura por Categorias ({activeCategoriesCount} ativas)</span>
          </button>

          {/* Tab 4: Simulator Lab */}
          <button
            id="tab-simulador-laboratorio"
            onClick={() => {
              playClickSound();
              setActiveSubTab('simulador');
            }}
            className={`px-3 sm:px-4 py-3 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-2 border-t-2 border-x-2 -mb-[2px] transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'simulador'
                ? 'bg-red-600 text-white border-red-600 shadow-[2px_-2px_0px_#000000]'
                : 'bg-transparent text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border-transparent'
            }`}
          >
            <Zap size={13} />
            <span>Laboratório de Disparo</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: IN-APP NOTIFICATIONS & TRANSACTIONAL ALERTS INBOX */}
      {/* ========================================================================= */}
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
                placeholder="Buscar avisos por produto, marca, categoria ou loja..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white text-xs font-mono focus:outline-none focus:border-red-600"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {[
                { id: 'all', label: `Todos (${notifications.length})` },
                { id: 'unread', label: `Não Lidos (${unreadNotificationsCount})` },
                { id: 'price_drops', label: 'Quedas de Preço' },
                { id: 'new_deals', label: 'Novos Deals & Cupons' }
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

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {unreadNotificationsCount > 0 && (
                <button
                  onClick={() => {
                    playClickSound();
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                    addToast('Todas as notificações marcadas como lidas.', 'info');
                  }}
                  className="px-2.5 py-1.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[9px] font-mono font-bold uppercase tracking-wider border border-zinc-300 dark:border-zinc-700 cursor-pointer"
                >
                  Marcar Lidas
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => {
                    playClickSound();
                    setNotifications([]);
                    addToast('Histórico de avisos limpo.', 'info');
                  }}
                  className="px-2.5 py-1.5 bg-zinc-100 hover:bg-red-100 dark:bg-zinc-900 dark:hover:bg-red-950 text-zinc-600 hover:text-red-600 dark:text-zinc-400 text-[9px] font-mono font-bold uppercase tracking-wider border border-zinc-300 dark:border-zinc-800 cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 px-4 border-2 border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <BellOff size={36} className="mx-auto text-zinc-400 mb-3 opacity-50" />
              <h3 className="text-sm font-mono font-bold uppercase text-black dark:text-white">
                Nenhuma notificação de oferta encontrada
              </h3>
              <p className="text-xs text-zinc-500 font-mono max-w-sm mx-auto mt-1 mb-4">
                Quando um produto monitorado cair de preço ou uma nova oferta for encontrada nas suas categorias inscritas, o aviso aparecerá aqui e no seu e-mail.
              </p>
              <button
                onClick={() => setActiveSubTab('simulador')}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                ⚡ Simular Queda ou Novo Deal Agora
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notif) => {
                const isNewDeal = notif.type === 'new_deal' || notif.type === 'deal_available' || notif.type === 'category_deal';

                return (
                  <div
                    key={notif.id}
                    className={`p-4 border transition-all relative ${
                      !notif.isRead
                        ? 'bg-red-500/5 dark:bg-red-950/25 border-red-300 dark:border-red-900/70 shadow-sm'
                        : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
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
                            {notif.category && (
                              <span className="text-[8px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-700">
                                {notif.category}
                              </span>
                            )}
                            {isNewDeal ? (
                              <span className="text-[8px] font-mono font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 border border-blue-500/30 uppercase flex items-center gap-1">
                                <Zap size={10} /> Novo Deal Disponível
                              </span>
                            ) : (
                              <span className="text-[8px] font-mono font-black bg-green-500/10 text-green-600 dark:text-green-400 px-1.5 py-0.5 border border-green-500/30 uppercase flex items-center gap-1">
                                <CheckCircle2 size={10} /> Preço Baixou
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs md:text-sm font-bold text-black dark:text-white truncate">
                            {notif.productTitle}
                          </h4>

                          {/* Deal / Coupon Banner if present */}
                          {notif.dealDetails?.couponCode && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-[9px] font-mono">
                              <span>🎟️ Cupom Ativo: <strong>{notif.dealDetails.couponCode}</strong></span>
                            </div>
                          )}

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

                      {/* Channels Notified & Action Buttons */}
                      <div className="flex flex-row sm:flex-col items-end justify-between gap-2.5 shrink-0 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-100 dark:border-zinc-900">
                        <div className="flex items-center gap-2 text-[8.5px] font-mono text-zinc-400">
                          <span className="flex items-center gap-1 text-zinc-500">
                            <Clock size={11} />
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>•</span>
                          <span className="text-zinc-600 dark:text-zinc-300 font-bold flex items-center gap-1">
                            {notif.emailSent && <Mail size={11} className="text-green-500" />}
                            In-App {notif.emailSent ? '+ E-mail' : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Preview Email Sent */}
                          {notif.emailSent && (
                            <button
                              onClick={() => {
                                playClickSound();
                                setPreviewEmailNotification(notif);
                              }}
                              className="px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer border border-zinc-300 dark:border-zinc-700"
                              title="Visualizar o e-mail transacional enviado"
                            >
                              <Eye size={11} className="text-green-500" />
                              <span>Ver E-mail</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              playClickSound();
                              setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                              if (onNavigate) {
                                onNavigate(`/?view=SHOP&product=${notif.productId}`);
                              } else {
                                addToast(`Abrindo produto ${notif.productTitle}...`, 'info');
                              }
                            }}
                            className="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>Ver Oferta</span>
                            <ExternalLink size={10} />
                          </button>

                          <button
                            onClick={() => {
                              playClickSound();
                              setNotifications(prev => prev.filter(n => n.id !== notif.id));
                              addToast('Aviso removido.', 'info');
                            }}
                            className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Excluir notificação"
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

      {/* ========================================================================= */}
      {/* SUBTAB 2: SPECIFIC PRODUCTS OFFER SUBSCRIPTION */}
      {/* ========================================================================= */}
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

            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: `Todos (${safeMonitoredProducts.length})` },
                { id: 'active', label: `Ativos (${activeProductsCount})` },
                { id: 'paused', label: `Pausados (${safeMonitoredProducts.length - activeProductsCount})` }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    playClickSound();
                    setProductFilter(f.id as any);
                  }}
                  className={`px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                    productFilter === f.id
                      ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                      : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-800'
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
              Inscrição individual por produto: ative o interruptor para ligar o radar tático. Configure se deseja receber por <strong>E-mail</strong> e/ou <strong>In-App</strong> quando houver <strong>quedas de preço</strong> ou <strong>novos cupons e ofertas</strong>.
            </p>
          </div>

          {/* Product Items List */}
          <div className="space-y-3">
            {safeMonitoredProducts
              .filter(p => {
                const sub = productSubscriptions[p.id];
                const isActive = sub?.active ?? true;
                if (productFilter === 'active' && !isActive) return false;
                if (productFilter === 'paused' && isActive) return false;
                if (searchQuery.trim()) {
                  const q = searchQuery.toLowerCase();
                  return p.title.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q);
                }
                return true;
              })
              .map(product => {
                const sub = productSubscriptions[product.id] || {
                  active: true,
                  targetPrice: Math.round(product.price * 0.85),
                  channelEmail: true,
                  channelApp: true,
                  triggerPriceDrop: true,
                  triggerNewDeal: true
                };

                return (
                  <div
                    key={product.id}
                    className={`p-4 border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                      sub.active
                        ? 'bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 hover:border-zinc-400'
                        : 'bg-zinc-50/70 dark:bg-zinc-950/40 border-dashed border-zinc-300 dark:border-zinc-800 opacity-80'
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

                        <div className="flex items-center gap-3 flex-wrap text-xs font-mono pt-0.5">
                          <span className="text-zinc-600 dark:text-zinc-400">
                            Preço Atual: <strong>R$ {product.price.toFixed(2)}</strong>
                          </span>
                        </div>

                        {/* Channels & Triggers Pills */}
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          <button
                            onClick={() => handleUpdateProductSub(product.id, { channelEmail: !sub.channelEmail })}
                            className={`px-2 py-0.5 text-[8.5px] font-mono font-bold uppercase border transition-colors flex items-center gap-1 cursor-pointer ${
                              sub.channelEmail
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-750 line-through'
                            }`}
                            title="Ativar/desativar envio por e-mail"
                          >
                            <Mail size={10} />
                            <span>E-mail {sub.channelEmail ? 'ON' : 'OFF'}</span>
                          </button>

                          <button
                            onClick={() => handleUpdateProductSub(product.id, { channelApp: !sub.channelApp })}
                            className={`px-2 py-0.5 text-[8.5px] font-mono font-bold uppercase border transition-colors flex items-center gap-1 cursor-pointer ${
                              sub.channelApp
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-750 line-through'
                            }`}
                            title="Ativar/desativar notificações in-app"
                          >
                            <Smartphone size={10} />
                            <span>In-App {sub.channelApp ? 'ON' : 'OFF'}</span>
                          </button>

                          <button
                            onClick={() => handleUpdateProductSub(product.id, { triggerNewDeal: !sub.triggerNewDeal })}
                            className={`px-2 py-0.5 text-[8.5px] font-mono font-bold uppercase border transition-colors flex items-center gap-1 cursor-pointer ${
                              sub.triggerNewDeal
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-750'
                            }`}
                          >
                            <Zap size={10} />
                            <span>Novos Deals {sub.triggerNewDeal ? 'Ativo' : 'Ignorar'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Toggle Switch & Actions */}
                    <div className="flex items-center justify-between lg:justify-end gap-4 w-full lg:w-auto border-t lg:border-t-0 pt-3 lg:pt-0 border-zinc-100 dark:border-zinc-900 shrink-0">
                      {/* Interactive Switch */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className={`text-[10px] font-mono font-black uppercase block tracking-wider ${
                            sub.active ? 'text-green-600 dark:text-green-400' : 'text-zinc-400'
                          }`}>
                            {sub.active ? 'Inscrito' : 'Pausado'}
                          </span>
                          <span className="text-[8px] font-mono text-zinc-500 block">
                            {sub.active ? 'Monitorando' : 'Silenciado'}
                          </span>
                        </div>

                        <button
                          type="button"
                          role="switch"
                          aria-checked={sub.active}
                          onClick={() => handleToggleProductSub(product.id, product.title)}
                          className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            sub.active ? 'bg-green-600 shadow-[0_0_12px_rgba(22,163,74,0.4)]' : 'bg-zinc-300 dark:bg-zinc-700'
                          }`}
                        >
                          <motion.span
                            layout
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className={`w-4.5 h-4.5 rounded-full bg-white block absolute top-0.75 shadow-md flex items-center justify-center ${
                              sub.active ? 'left-6.5' : 'left-1'
                            }`}
                          >
                            {sub.active ? (
                              <Bell size={9} className="text-green-600" />
                            ) : (
                              <BellOff size={9} className="text-zinc-400" />
                            )}
                          </motion.span>
                        </button>
                      </div>

                      {/* Quick Trigger Buttons */}
                      <button
                        onClick={() => dispatchOfferAlert({
                          targetType: 'product',
                          targetName: product.title,
                          eventType: 'price_drop',
                          product,
                          sendEmail: sub.channelEmail,
                          sendApp: sub.channelApp,
                          discountPct: 20
                        })}
                        disabled={isSimulating}
                        className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[9px] font-mono font-bold uppercase tracking-wider border border-zinc-200 dark:border-zinc-800 cursor-pointer flex items-center gap-1"
                        title="Disparar alerta simulado de queda de preço para este produto"
                      >
                        <TrendingDown size={11} className="text-green-500" />
                        <span className="hidden sm:inline">Testar Queda</span>
                      </button>

                      <button
                        onClick={() => dispatchOfferAlert({
                          targetType: 'product',
                          targetName: product.title,
                          eventType: 'new_deal',
                          product,
                          sendEmail: sub.channelEmail,
                          sendApp: sub.channelApp,
                          discountPct: 15,
                          dealDetails: {
                            storeName: product.platform,
                            couponCode: 'TATAMEEXTRA',
                            description: 'Novo cupom com frete grátis liberado'
                          }
                        })}
                        disabled={isSimulating}
                        className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[9px] font-mono font-bold uppercase tracking-wider border border-zinc-200 dark:border-zinc-800 cursor-pointer flex items-center gap-1"
                        title="Disparar alerta simulado de novo deal para este produto"
                      >
                        <Zap size={11} className="text-amber-500" />
                        <span className="hidden sm:inline">Testar Deal</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: CATEGORY OFFER SUBSCRIPTIONS */}
      {/* ========================================================================= */}
      {activeSubTab === 'categorias' && (
        <motion.div
          key="subtab-categorias"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-6"
        >
          {/* Header Banner */}
          <div className="p-5 bg-amber-500/5 dark:bg-amber-950/20 border-2 border-amber-500/30 dark:border-amber-700/40 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" />
                  <h3 className="text-sm font-mono font-black uppercase text-black dark:text-white">
                    ASSINATURA AUTOMATIZADA POR CATEGORIA DO TATAME
                  </h3>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 font-mono leading-relaxed">
                  Inscreva-se em categorias inteiras (ex: Kimonos, Faixas, Rashguards, Suplementos). Você receberá notificações por e-mail e in-app sempre que um produto da categoria entrar em promoção ou um novo deal for adicionado ao radar.
                </p>
              </div>

              {detectedUserTopCategories.length > 0 && (
                <div className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 shrink-0">
                  <span className="text-amber-600 dark:text-amber-400 font-bold block">⭐ Suas categorias favoritas:</span>
                  <span>{detectedUserTopCategories.slice(0, 3).join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OFFER_CATEGORIES_CONFIG.map(cat => {
              const sub = categorySubscriptions[cat.id] || {
                active: false,
                channelEmail: true,
                channelApp: true,
                triggerPriceDrop: true,
                triggerNewDeal: true,
                minDiscountPct: 10
              };
              const isRecommended = detectedUserTopCategories.some(c => 
                c.toLowerCase().includes(cat.category.toLowerCase()) || 
                cat.category.toLowerCase().includes(c.toLowerCase())
              );

              return (
                <div
                  key={cat.id}
                  className={`p-4 border transition-all flex flex-col justify-between gap-3 ${
                    sub.active
                      ? 'bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 shadow-sm'
                      : 'bg-zinc-50/60 dark:bg-zinc-950/30 border-dashed border-zinc-200 dark:border-zinc-800 opacity-80'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{cat.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-mono font-black text-black dark:text-white uppercase tracking-wider">
                              {cat.name}
                            </h4>
                            {isRecommended && (
                              <span className="text-[7px] font-mono font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.2 border border-amber-500/30 uppercase">
                                Recomendado
                              </span>
                            )}
                          </div>
                          <span className="text-[8.5px] font-mono text-zinc-400 uppercase">
                            Categoria Oficial: {cat.category}
                          </span>
                        </div>
                      </div>

                      {/* Switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={sub.active}
                        onClick={() => handleToggleCategorySub(cat.id, cat.name)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          sub.active ? 'bg-green-600 shadow-[0_0_10px_rgba(22,163,74,0.35)]' : 'bg-zinc-300 dark:bg-zinc-700'
                        }`}
                        title={sub.active ? 'Pausar alertas da categoria' : 'Ativar alertas da categoria'}
                      >
                        <motion.span
                          layout
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className={`w-4 h-4 rounded-full bg-white block absolute top-1 shadow-sm ${
                            sub.active ? 'left-6' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono leading-relaxed">
                      {cat.description}
                    </p>

                    <div className="text-[8.5px] font-mono text-zinc-400">
                      Marcas monitoradas: <span className="text-zinc-600 dark:text-zinc-300">{cat.popularBrands.join(', ')}</span>
                    </div>
                  </div>

                  {/* Channel & Sensitivity Controls */}
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => handleUpdateCategorySub(cat.id, { channelEmail: !sub.channelEmail })}
                        className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase border transition-colors flex items-center gap-1 cursor-pointer ${
                          sub.channelEmail
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-750 line-through'
                        }`}
                      >
                        <Mail size={10} />
                        <span>E-mail</span>
                      </button>

                      <button
                        onClick={() => handleUpdateCategorySub(cat.id, { channelApp: !sub.channelApp })}
                        className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase border transition-colors flex items-center gap-1 cursor-pointer ${
                          sub.channelApp
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-750 line-through'
                        }`}
                      >
                        <Smartphone size={10} />
                        <span>In-App</span>
                      </button>

                      <button
                        onClick={() => handleUpdateCategorySub(cat.id, { triggerNewDeal: !sub.triggerNewDeal })}
                        className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase border transition-colors flex items-center gap-1 cursor-pointer ${
                          sub.triggerNewDeal
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-750'
                        }`}
                      >
                        <Zap size={10} />
                        <span>Novos Deals</span>
                      </button>
                    </div>

                    {/* Quick Test for Category */}
                    <button
                      onClick={() => {
                        const sampleCatProduct = productList.find(p => p.category?.toLowerCase() === cat.category.toLowerCase()) || {
                          id: `cat_prod_${cat.id}`,
                          title: `${cat.name} em Promoção Especial`,
                          brand: cat.popularBrands[0],
                          price: 249.90,
                          originalPrice: 380.00,
                          category: cat.category,
                          imageUrl: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=300',
                          platform: 'Mercado Livre'
                        } as Product;

                        dispatchOfferAlert({
                          targetType: 'category',
                          targetName: cat.name,
                          eventType: 'new_deal',
                          product: sampleCatProduct,
                          sendEmail: sub.channelEmail,
                          sendApp: sub.channelApp,
                          discountPct: sub.minDiscountPct || 15,
                          dealDetails: {
                            storeName: sampleCatProduct.platform,
                            couponCode: 'TATAMECAT15',
                            description: `Nova oferta verificada na categoria ${cat.name}`
                          }
                        });
                      }}
                      disabled={isSimulating}
                      className="px-2.5 py-1 text-[8.5px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-1 cursor-pointer"
                      title="Simular disparo de novo deal para esta categoria"
                    >
                      <Zap size={10} className="text-amber-500" />
                      <span>Simular Alerta</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: INTERACTIVE SIMULATOR LAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'simulador' && (
        <motion.div
          key="subtab-simulador"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-6"
        >
          <div className="bg-white dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 p-5 md:p-6 shadow-sm">
            <div className="space-y-2 border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-600 text-white font-mono font-bold text-xs">
                  LAB
                </div>
                <h3 className="text-base font-mono font-black uppercase text-black dark:text-white">
                  LABORATÓRIO DE DISPARO DE ALERTAS DE OFERTAS
                </h3>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono leading-relaxed">
                Teste em tempo real o fluxo completo de notificação solicitado: escolha se deseja simular uma <strong>Queda de Preço</strong> ou um <strong>Novo Deal Disponível</strong> para um <strong>produto específico</strong> ou para uma <strong>categoria inteira</strong>. O sistema gera a notificação in-app com áudio/banner e o e-mail transacional.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Left */}
              <div className="space-y-4 font-mono">
                {/* 1. Target Type: Product vs Category */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1.5">
                    1. TIPO DE INSCRIÇÃO
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSimTargetType('product')}
                      className={`p-2.5 text-xs font-bold uppercase border flex items-center justify-center gap-2 cursor-pointer ${
                        simTargetType === 'product'
                          ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-sm'
                          : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <ShoppingBag size={14} />
                      <span>Produto Específico</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSimTargetType('category')}
                      className={`p-2.5 text-xs font-bold uppercase border flex items-center justify-center gap-2 cursor-pointer ${
                        simTargetType === 'category'
                          ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-sm'
                          : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <Tag size={14} />
                      <span>Categoria Inteira</span>
                    </button>
                  </div>
                </div>

                {/* 2. Target Selector */}
                {simTargetType === 'product' ? (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1.5">
                      2. SELECIONE O PRODUTO MONITORADO
                    </label>
                    <select
                      value={simSelectedProductId}
                      onChange={e => setSimSelectedProductId(e.target.value)}
                      className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white text-xs font-mono focus:outline-none"
                    >
                      {productList.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.title} - R$ {p.price.toFixed(2)} ({p.brand})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1.5">
                      2. SELECIONE A CATEGORIA MONITORADA
                    </label>
                    <select
                      value={simSelectedCategoryId}
                      onChange={e => setSimSelectedCategoryId(e.target.value)}
                      className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white text-xs font-mono focus:outline-none"
                    >
                      {OFFER_CATEGORIES_CONFIG.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.icon} {c.name} ({c.category})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 3. Event Type: Price Drop vs New Deal */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1.5">
                    3. TIPO DO DISPARO / EVENTO
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSimEventType('price_drop')}
                      className={`p-2.5 text-xs font-bold uppercase border flex items-center justify-center gap-2 cursor-pointer ${
                        simEventType === 'price_drop'
                          ? 'bg-red-600 text-white border-red-600 shadow-sm'
                          : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <TrendingDown size={14} />
                      <span>Queda de Preço</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSimEventType('new_deal')}
                      className={`p-2.5 text-xs font-bold uppercase border flex items-center justify-center gap-2 cursor-pointer ${
                        simEventType === 'new_deal'
                          ? 'bg-green-600 text-white border-green-600 shadow-sm'
                          : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <Zap size={14} />
                      <span>Novo Deal / Cupom</span>
                    </button>
                  </div>
                </div>

                {/* 4. Discount Percentage Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      4. PERCENTUAL DE DESCONTO / ECONOMIA
                    </label>
                    <span className="text-xs font-mono font-black text-green-600 dark:text-green-400">
                      -{simDiscountPct}% OFF
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[10, 15, 20, 30, 40].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setSimDiscountPct(pct)}
                        className={`flex-1 py-1.5 text-[9px] font-bold uppercase border transition-colors ${
                          simDiscountPct === pct
                            ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        -{pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Channels toggles */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1.5">
                    5. CANAIS DE ALERTA ATIVADOS
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono cursor-pointer">
                      <input
                        type="checkbox"
                        checked={simChannelEmail}
                        onChange={e => setSimChannelEmail(e.target.checked)}
                        className="w-4 h-4 accent-green-600"
                      />
                      <span>E-mail ({userNotificationEmail.slice(0, 15)}...)</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono cursor-pointer">
                      <input
                        type="checkbox"
                        checked={simChannelApp}
                        onChange={e => setSimChannelApp(e.target.checked)}
                        className="w-4 h-4 accent-green-600"
                      />
                      <span>In-App & Push</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Preview Right */}
              <div className="p-5 bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 font-mono">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block mb-2">
                    // PRÉVIA DO DISPARO
                  </span>

                  {(() => {
                    const selProd = productList.find(p => p.id === simSelectedProductId) || productList[0] || {
                      id: 'p1',
                      title: 'Kimono BJJ Vagabond Ultra Light',
                      price: 399.90,
                      brand: 'Vagabond BJJ',
                      imageUrl: '/icon.png',
                      category: 'Kimonos',
                      platform: 'Mercado Livre'
                    } as Product;

                    const selCat = OFFER_CATEGORIES_CONFIG.find(c => c.id === simSelectedCategoryId) || OFFER_CATEGORIES_CONFIG[0];
                    const activeName = simTargetType === 'product' ? selProd.title : selCat.name;
                    const calculatedSavings = Math.round(selProd.price * (simDiscountPct / 100));
                    const newPrice = Math.max(49.90, selProd.price - calculatedSavings);

                    return (
                      <div className="space-y-3 p-4 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 border ${
                            simEventType === 'price_drop'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                              : 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30'
                          }`}>
                            {simEventType === 'price_drop' ? '🔥 Queda de Preço' : '⚡ Novo Deal Disponível'}
                          </span>
                          <span className="text-[8.5px] text-zinc-400 uppercase">
                            {simTargetType === 'product' ? 'Produto' : 'Categoria'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <img
                            src={selProd.imageUrl}
                            alt=""
                            className="w-12 h-12 object-cover border border-zinc-200 dark:border-zinc-800 bg-white"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[8px] text-zinc-400 block uppercase">
                              {selProd.brand} • {selProd.platform}
                            </span>
                            <h5 className="text-xs font-bold text-black dark:text-white truncate">
                              {activeName}
                            </h5>
                            <div className="text-xs font-mono font-black text-green-600 dark:text-green-400 mt-0.5">
                              De R$ {selProd.price.toFixed(2)} por R$ {newPrice.toFixed(2)} (-{simDiscountPct}%)
                            </div>
                          </div>
                        </div>

                        <div className="text-[9px] text-zinc-500 border-t border-zinc-100 dark:border-zinc-900 pt-2 space-y-1">
                          <p>✓ Gera aviso in-app na central e atualiza contador de não lidas</p>
                          <p>✓ Dispara e-mail com HTML completo para {userNotificationEmail}</p>
                          {simChannelApp && <p>✓ Envia notificação nativa via Service Worker (se autorizado)</p>}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Submit trigger button */}
                <button
                  type="button"
                  id="btn-execute-simulation"
                  disabled={isSimulating}
                  onClick={() => {
                    const selProd = productList.find(p => p.id === simSelectedProductId) || productList[0] || {
                      id: 'p1',
                      title: 'Kimono BJJ Vagabond Ultra Light',
                      price: 399.90,
                      brand: 'Vagabond BJJ',
                      imageUrl: '/icon.png',
                      category: 'Kimonos',
                      platform: 'Mercado Livre'
                    } as Product;
                    const selCat = OFFER_CATEGORIES_CONFIG.find(c => c.id === simSelectedCategoryId) || OFFER_CATEGORIES_CONFIG[0];

                    dispatchOfferAlert({
                      targetType: simTargetType,
                      targetName: simTargetType === 'product' ? selProd.title : selCat.name,
                      eventType: simEventType,
                      product: selProd,
                      discountPct: simDiscountPct,
                      sendEmail: simChannelEmail,
                      sendApp: simChannelApp,
                      dealDetails: {
                        storeName: selProd.platform,
                        couponCode: simEventType === 'new_deal' ? 'TATAMEVIP' : undefined,
                        description: `Alerta gerado pelo simulador para ${simTargetType === 'product' ? selProd.title : selCat.name}`
                      }
                    });
                  }}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-mono font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-red-500 shadow-[3px_3px_0px_0px_#000000] cursor-pointer transition-all active:scale-98"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Processando Disparo & Enviando E-mail...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Disparar Alerta Agora (In-App + E-mail)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* EMAIL PREVIEW MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {previewEmailNotification && (
          <div
            className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-black border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-green-600 text-white">
                    <Mail size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-white">
                      E-MAIL DE ALERTA DE OFERTA DISPARADO
                    </h3>
                    <p className="text-[9px] text-zinc-400">
                      Destinatário: <span className="text-green-400">{previewEmailNotification.emailRecipient || userNotificationEmail}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setPreviewEmailNotification(null)}
                  className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Email Content Container */}
              <div className="p-4 overflow-y-auto flex-1 bg-zinc-900/40">
                <div className="bg-[#09090b] border border-zinc-850 p-4 mb-4 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Remetente: <strong>OSS.OS Alertas de Tatame &lt;alertas@oss.os&gt;</strong></span>
                    <span>{new Date(previewEmailNotification.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-xs font-bold text-white border-t border-zinc-850 pt-1.5">
                    Assunto: {previewEmailNotification.type === 'new_deal' ? '⚡ [OSS.OS Deal] Nova Oferta Disponível' : '🔥 [OSS.OS Alerta] Preço Baixou'}: {previewEmailNotification.productTitle} (-{previewEmailNotification.discountPct}%)
                  </div>
                </div>

                {/* Rendered HTML or styled fallback */}
                {previewEmailNotification.emailHtmlPreview ? (
                  <div
                    className="border border-zinc-800 bg-black rounded-none overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: previewEmailNotification.emailHtmlPreview }}
                  />
                ) : (
                  <div className="p-6 bg-zinc-900 border border-zinc-800 text-center space-y-3">
                    <CheckCircle2 size={32} className="text-green-500 mx-auto" />
                    <h4 className="text-sm font-bold text-white">E-mail transacional despachado com sucesso!</h4>
                    <p className="text-xs text-zinc-400">
                      O e-mail foi preparado e entregue para <strong>{previewEmailNotification.emailRecipient || userNotificationEmail}</strong> com o link direto da oferta.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-black border-t border-zinc-800 flex items-center justify-between shrink-0">
                <span className="text-[9px] text-zinc-500">
                  Engine de Notificações OSS.OS • E-mail verificado
                </span>
                <button
                  onClick={() => setPreviewEmailNotification(null)}
                  className="px-4 py-1.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold uppercase"
                >
                  Fechar Prévia
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OfferNotificationsCenter;

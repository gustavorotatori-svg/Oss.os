import { PriceAlertBadge } from "./PriceAlertBadge";
import { PriceAlertModal } from "./PriceAlertModal";
import { PurchaseSchedulerModal } from "./PurchaseSchedulerModal";
import { SocialShareModal } from "./SocialShareModal";
import { SocialImpactBadge } from "./SocialImpactBadge";
import { OSSSeloStamp, WeaveGSMGauge } from "./BJJBrandElements";
import React from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'motion/react';
import { ShoppingCart, Search, ExternalLink, ChevronRight, Star, Bell, BellOff, TrendingDown, Wand2, Loader2, ArrowUp, ArrowDown, Plus, Minus, Trash2, Check, TrendingUp, Gift, X, Heart, RefreshCw, Zap, Scale, CalendarDays, Clock, BellRing, Share2, Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Product, ProductOffer } from '../types';
import { generateProductSchema } from '../lib/schemaOrg';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { 
  subscribeToProductOffers, 
  seedProductOffersToFirestore, 
  simulateFirestorePriceDrop, 
  PriceUpdateEvent 
} from '../lib/firestorePriceSync';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BJJImage from './BJJImage';
import { OssLogo } from '@/components/Logo';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, Tooltip as RechartsTooltip } from 'recharts';
import { getCurrencyCode, getCurrencySymbol, formatPrice } from '@/src/lib/currency';

interface PremiumProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onCheckout?: (product: Product) => void;
  onQuickBuy?: (product: Product) => void;
  onTrackClick?: (product: Product) => void;
  isAlertActive?: boolean;
  onToggleAlert?: (productId: string, targetPrice?: number, channels?: { push: boolean; email: boolean; app: boolean }, notificationEmail?: string) => void;
  onAddToCart?: (product: Product) => void;
  isInWishlist?: boolean;
  onToggleWishlist?: (productId: string) => void;
  isComparing?: boolean;
  onToggleCompare?: (product: Product) => void;
  onOpenReviews?: (product: Product) => void;
  onOpenSeoOptimizer?: (product: Product) => void;
}

const PremiumProductCard: React.FC<PremiumProductCardProps> = ({ 
  product, 
  onQuickView,
  onCheckout,
  onQuickBuy,
  onTrackClick,
  isAlertActive,
  onToggleAlert,
  onAddToCart,
  isInWishlist,
  onToggleWishlist,
  isComparing,
  onToggleCompare,
  onOpenReviews,
  onOpenSeoOptimizer
}) => {
  const { t, i18n } = useTranslation();
  const [showTechDetails, setShowTechDetails] = React.useState(false);
  const [showPriceChart, setShowPriceChart] = React.useState(false);
  const [showCompareStore, setShowCompareStore] = React.useState(false);
  const [showReviewsSection, setShowReviewsSection] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [hiddenStores, setHiddenStores] = React.useState<Set<string>>(new Set());

  // Dynamic user reviews & prominent average rating calculation
  const productReviews = React.useMemo(() => product.reviews || [], [product.reviews]);
  const averageRating = React.useMemo(() => {
    if (productReviews.length === 0) return product.rating || 5.0;
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / productReviews.length) * 10) / 10;
  }, [productReviews, product.rating]);
  const reviewsCount = productReviews.length;

  // Schema.org Product Structured Data (Rich Results / Price & InStock)
  const productSchema = React.useMemo(() => {
    return generateProductSchema(product, {
      baseUrl: 'https://oss.os',
      includeContext: true
    });
  }, [product]);

  // 3D Smooth Tilt values using motion values (high performance, no re-renders)
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useTransform(y, [0, 1], [6, -6]);
  const rotateY = useTransform(x, [0, 1], [-6, 6]);

  const springConfig = { damping: 25, stiffness: 220, mass: 0.5 };
  const rx = useSpring(rotateX, springConfig);
  const ry = useSpring(rotateY, springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Normalize to 0 - 1
    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  // Interactive Custom Price Alert States & Zoom States
  const [isPriceAlertModalOpen, setIsPriceAlertModalOpen] = React.useState(false);
  const [isSchedulerModalOpen, setIsSchedulerModalOpen] = React.useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [selectedOfferToShare, setSelectedOfferToShare] = React.useState<ProductOffer | null>(null);

  const handleOpenShare = (offer?: ProductOffer) => {
    setSelectedOfferToShare(offer || null);
    setIsShareModalOpen(true);
  };

  const [zoomScale, setZoomScale] = React.useState(1);
  const [customAlertPrice, setCustomAlertPrice] = React.useState<number>(Math.round(product.price * 0.9));
  const [isCustomAlertActive, setIsCustomAlertActive] = React.useState(false);
  const [showCustomAlertForm, setShowCustomAlertForm] = React.useState(false);
  const [userAlertInput, setUserAlertInput] = React.useState(customAlertPrice.toString());
  const [alertSuccessToastMsg, setAlertSuccessToastMsg] = React.useState<string | null>(null);

  // Notification Preferences States
  const [notificationType, setNotificationType] = React.useState<'email' | 'push' | 'both'>('both');
  const [notificationEmail, setNotificationEmail] = React.useState('');
  const [simulatedEmailOpen, setSimulatedEmailOpen] = React.useState(false);
  const [simulatedEmailContent, setSimulatedEmailContent] = React.useState<{ subject: string; body: string } | null>(null);

  // Sync wishlist alert active status from parent prop
  React.useEffect(() => {
    if (isAlertActive !== undefined) {
      setIsCustomAlertActive(isAlertActive);
    }
  }, [isAlertActive]);

  // Sync default user email for notifications
  React.useEffect(() => {
    const userEmail = auth.currentUser?.email;
    if (userEmail) {
      setNotificationEmail(userEmail);
    }
  }, []);

  // Wishlist Shake Animation trigger state
  const [shouldShake, setShouldShake] = React.useState(false);
  const [shouldPulse, setShouldPulse] = React.useState(false);
  const prevWishlistRef = React.useRef(isInWishlist);

  React.useEffect(() => {
    if (isInWishlist && !prevWishlistRef.current) {
      setShouldShake(true);
      setShouldPulse(true);
      const timer = setTimeout(() => {
        setShouldShake(false);
        setShouldPulse(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
    prevWishlistRef.current = isInWishlist;
  }, [isInWishlist]);

  const handleSimulatePromoDrop = () => {
    const promoPrice = customAlertPrice - 5;
    
    // 1. Browser Push Notification
    if (notificationType === 'push' || notificationType === 'both') {
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("⚡ OSS.OS - ALERTA DE PREÇO!", {
            body: `O manto sagrado "${product.title}" (${product.brand}) atingiu o seu preço alvo de R$ ${customAlertPrice}! Preço atual da simulação: R$ ${promoPrice}.`,
            icon: product.imageUrl || '/apple-touch-icon.png'
          });
        } else {
          console.log("Browser push notification permission is not granted.");
        }
      }
    }

    // 2. Email simulation overlay setup
    if (notificationType === 'email' || notificationType === 'both') {
      setSimulatedEmailContent({
        subject: `[DIÁRIO DOS OSS.OS] Alerta de Preço: ${product.title} em Promoção! 🥋⚡`,
        body: `
          <p>Olá, Guerreiro(a)!</p>
          <p>Temos ótimas notícias do tatame! O equipamento que você estava monitorando no <strong>Diário dos Oss.os</strong> acaba de baixar de preço!</p>
          <div style="border-left: 4px solid #16a34a; padding-left: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 5px 0; color: #111;">${product.title}</h3>
            <p style="margin: 0; font-size: 13px; color: #666;">Marca: ${product.brand} | Categoria: ${product.category}</p>
            <p style="font-size: 16px; margin: 10px 0 0 0;">
              Seu Preço Alvo: <span style="text-decoration: line-through; color: #999;">R$ ${product.price}</span> ➔ 
              <strong style="color: #16a34a; font-size: 18px;">R$ ${promoPrice.toFixed(2)}</strong> (Economia de R$ ${(product.price - promoPrice).toFixed(2)})
            </p>
          </div>
          <p>Não perca tempo e garanta a sua nova armadura antes que o estoque acabe!</p>
          <a href="${window.location.origin}/?product=${product.id}" style="display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 10px 20px; font-weight: bold; border-radius: 4px; margin-top: 10px;">Comprar Agora no Tatame</a>
          <p style="font-size: 11px; color: #888; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">Este é um e-mail de notificação gerado automaticamente para o seu endereço cadastrado: ${notificationEmail || 'seu-email@gmail.com'}.<br/>Para gerenciar seus alertas, acesse o painel do Diário dos Oss.os.</p>
        `
      });
      setSimulatedEmailOpen(true);
    }

    setAlertSuccessToastMsg(`⚡ Simulação ativada! Preço simulado de R$ ${promoPrice.toFixed(2)} disparou as notificações.`);
  };

  // Touch zoom state refs for gesture detection
  const touchStartDistRef = React.useRef<number | null>(null);
  const startScaleRef = React.useRef<number>(1);

  // Gift Request States
  const [isGiftModalOpen, setIsGiftModalOpen] = React.useState(false);
  const [giftOccasion, setGiftOccasion] = React.useState<'birthday' | 'christmas' | 'children' | 'father' | 'mother' | 'secret_santa' | 'bet' | 'treat'>('birthday');
  const [giftRecipientName, setGiftRecipientName] = React.useState('');
  const [giftSenderName, setGiftSenderName] = React.useState('');

  const getGiftMessageDraft = () => {
    const rName = giftRecipientName.trim() || 'Amigo(a)';
    const sName = giftSenderName.trim() || 'Seu Parceiro de Treino';
    const productLink = `${window.location.origin}?product=${product.id}`;
    
    switch (giftOccasion) {
      case 'birthday':
        return `Fala ${rName}! Meu aniversário tá chegando e o Diário dos Oss.os indicou esse "${product.title}" (${product.brand}) como ideal para mim. Se quiser me fortalecer com a armadura nova de presente, fica a dica: ${productLink} 🥋🎂\n\nAbraço, ${sName}!`;
      case 'christmas':
        return `Oi ${rName}! Já sabe o que vai me dar de presente de Natal? 🎄 O Diário dos Oss.os recomendou o "${product.title}" (${product.brand}). Me ajuda a começar o ano novo com o manto renovado no tatame! ${productLink} 🎅\n\nCom carinho, ${sName}!`;
      case 'children':
        return `Alô ${rName}! No Dia das Crianças o tatame também merece celebração! Olha que massa esse equipamento que o Diário dos Oss.os sugeriu para os meus treinos: ${productLink} 🥋🧒\n\nAssinado: ${sName}`;
      case 'father':
        return `Pai ${rName}! Para comemorar o Dia dos Pais em alto estilo de mestre, olha esse equipamento incrível que encontrei no Diário dos Oss.os: ${productLink} 🥋🖤\n\nAssinado: ${sName}`;
      case 'mother':
        return `Mãe ${rName}! Pra apoiar a minha caminhada e minha saúde no Jiu-Jitsu, olha que presente perfeito o Diário dos Oss.os indicou para o Dia das Mães: ${productLink} 🥋🌸\n\nTe amo, ${sName}`;
      case 'secret_santa':
        return `Fala ${rName}! Se você me tirou no Amigo Secreto do tatame ou da família, facilitou sua busca! Já escolhi e aprovei o "${product.title}" do Diário dos Oss.os: ${productLink} (Não tem erro! 😉)\n\nValeu, ${sName}`;
      case 'bet':
        return `Lembra daquela aposta que você perdeu no rolo de Jiu-Jitsu, ${rName}? 🤜🤛 Chegou a hora de pagar com honra! Tá aqui o equipamento justo indicado pelo Diário dos Oss.os para quitar sua dívida: ${productLink}\n\nOss, ${sName}`;
      case 'treat':
      default:
        return `Oi ${rName}! Passando para pedir de presente aquele agrado para motivar nos treinos pesados! Prometo honrar o manto no tatame: ${productLink} 🥋✨\n\nOss! Assinado: ${sName}`;
    }
  };

  const handleShareOnWhatsApp = () => {
    const message = getGiftMessageDraft();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  // Handle touch interactions for sliding zoom in graph
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      startScaleRef.current = zoomScale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleFactor = dist / touchStartDistRef.current;
      const newScale = Math.min(3, Math.max(1, startScaleRef.current * scaleFactor));
      setZoomScale(newScale);
    }
  };

  const handleTouchEnd = () => {
    touchStartDistRef.current = null;
  };

  // Trend Info Calculation comparing to last week's checkpoint
  const trendInfo = React.useMemo(() => {
    if (!product.priceHistory || product.priceHistory.length < 2) {
      return { diff: 0, percent: 0, isDown: false, isUp: false, latestPrice: product.price, previousPrice: product.price };
    }

    const getPriceAtPoint = (point: any) => {
      if (!point) return product.price;
      const platformPrice = point[product.platform];
      if (typeof platformPrice === 'number') return platformPrice;
      const numericKeys = Object.keys(point).filter(k => k !== 'date' && k !== 'isPromo');
      if (numericKeys.length > 0) {
        const val = point[numericKeys[0]];
        if (typeof val === 'number') return val;
      }
      return product.price;
    };

    const latestPrice = getPriceAtPoint(product.priceHistory[product.priceHistory.length - 1]);
    const previousPrice = getPriceAtPoint(product.priceHistory[product.priceHistory.length - 2]);

    const diff = latestPrice - previousPrice;
    const percent = previousPrice > 0 ? (diff / previousPrice) * 100 : 0;

    return {
      diff,
      percent: Math.abs(percent),
      isDown: diff < 0,
      isUp: diff > 0,
      latestPrice,
      previousPrice
    };
  }, [product]);

  const toggleStoreLine = (store: string) => {
    setHiddenStores(prev => {
      const next = new Set(prev);
      if (next.has(store)) {
        next.delete(store);
      } else {
        next.add(store);
      }
      return next;
    });
  };

  const hasNewPriceUpdate = React.useMemo(() => {
    if (!product.priceHistory || product.priceHistory.length === 0) return false;
    
    // Check if any price history entry has isPromo: true
    const hasPromo = product.priceHistory.some(ph => ph.isPromo);
    
    // Check if the latest price is lower than previous price for any of the marketplace keys
    const keys = Object.keys(product.priceHistory[0] || {}).filter(k => k !== 'date' && k !== 'isPromo');
    let hasDrop = false;
    if (product.priceHistory.length >= 2 && keys.length > 0) {
      const lastEntry = product.priceHistory[product.priceHistory.length - 1];
      const prevEntry = product.priceHistory[product.priceHistory.length - 2];
      for (const key of keys) {
        const lastVal = lastEntry[key as keyof typeof lastEntry] as number | undefined;
        const prevVal = prevEntry[key as keyof typeof prevEntry] as number | undefined;
        if (lastVal !== undefined && prevVal !== undefined && lastVal < prevVal) {
          hasDrop = true;
          break;
        }
      }
    }
    
    return hasPromo || hasDrop || !!product.isBestPrice;
  }, [product]);

  // Real-time AI grounded prices state
  const [liveOffers, setLiveOffers] = React.useState<ProductOffer[] | null>(null);
  const [isLiveLoading, setIsLiveLoading] = React.useState(false);
  const [liveError, setLiveError] = React.useState<string | null>(null);

  // Real-time Firebase Firestore offers state & live transition animation triggers
  const [firestoreOffers, setFirestoreOffers] = React.useState<ProductOffer[] | null>(null);
  const [recentPriceUpdates, setRecentPriceUpdates] = React.useState<Record<string, PriceUpdateEvent>>({});
  const [mainPriceUpdate, setMainPriceUpdate] = React.useState<PriceUpdateEvent | null>(null);
  const [isSimulatingPriceDrop, setIsSimulatingPriceDrop] = React.useState(false);
  const prevEffectivePriceRef = React.useRef<number>(product.price);

  // Subscribe to real-time Firebase Firestore offers for this product
  React.useEffect(() => {
    // Seed initial default offers if Firestore collection is fresh
    seedProductOffersToFirestore(product.id, product.price, product.title);

    const unsubscribe = subscribeToProductOffers(product.id, (updatedOffers, updateEvent) => {
      setFirestoreOffers(updatedOffers);

      if (updateEvent) {
        // Record event for individual offer card transition animation & positive highlight
        setRecentPriceUpdates(prev => ({
          ...prev,
          [updateEvent.storeName]: updateEvent
        }));

        // Trigger main product price transition animation if lowest offer updated
        const lowestOffer = updatedOffers[0];
        if (lowestOffer && lowestOffer.storeName === updateEvent.storeName) {
          const oldMain = prevEffectivePriceRef.current;
          const newMain = lowestOffer.price;
          if (newMain !== oldMain) {
            const diff = oldMain - newMain;
            const percent = oldMain > 0 ? Math.round((Math.abs(diff) / oldMain) * 100) : 0;
            const isPositive = newMain < oldMain; // Price drop = positive variation for buyer

            setMainPriceUpdate({
              storeName: lowestOffer.storeName,
              oldPrice: oldMain,
              newPrice: newMain,
              diff: Math.abs(diff),
              percent,
              isPositive,
              timestamp: Date.now()
            });
            prevEffectivePriceRef.current = newMain;
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [product.id, product.price, product.title]);

  const handleSimulateFirestorePriceDrop = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSimulatingPriceDrop(true);
    try {
      const currentEffective = (cardOffersList[0]?.price && cardOffersList[0].price < product.price) 
        ? cardOffersList[0].price 
        : product.price;
      await simulateFirestorePriceDrop(product.id, currentEffective);
    } catch (err) {
      console.warn("Could not trigger Firestore price drop:", err);
    } finally {
      setTimeout(() => setIsSimulatingPriceDrop(false), 900);
    }
  };

  const fetchLivePrices = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiveLoading(true);
    setLiveError(null);
    try {
      const response = await fetch("/api/compare-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: product.title }),
      });
      if (!response.ok) {
        throw new Error("Não foi possível buscar os preços em tempo real no momento.");
      }
      const data = await response.json();
      if (data && data.offers) {
        const mapped: ProductOffer[] = data.offers.map((o: any) => ({
          storeName: o.platform,
          price: o.price,
          url: o.link,
          isAvailable: true,
          shippingPrice: o.shippingInfo && o.shippingInfo.toLowerCase().includes("grátis") ? 0 : 9.90,
          shippingInfo: o.shippingInfo || "Frete Disponível"
        }));
        setLiveOffers(mapped);
      } else {
        throw new Error("Nenhuma oferta encontrada na busca.");
      }
    } catch (err: any) {
      setLiveError(err.message || "Erro desconhecido ao comparar preços.");
    } finally {
      setIsLiveLoading(false);
    }
  };

  // Dynamic comparator offers list sorted lowest price first
  const cardOffersList = React.useMemo(() => {
    if (liveOffers && liveOffers.length > 0) {
      return [...liveOffers].sort((a, b) => a.price - b.price);
    }
    if (firestoreOffers && firestoreOffers.length > 0) {
      return [...firestoreOffers].sort((a, b) => a.price - b.price);
    }
    if (product.offers && product.offers.length > 0) {
      return [...product.offers].sort((a, b) => a.price - b.price);
    }
    
    // Fallback comparable affiliate offers for Mercado Livre, Amazon, TikTok Shop, Shein, Shopee
    const basePrice = product.price;
    const cleanTitle = product.title;
    const platforms = [
      { name: "Mercado Livre", prefix: "https://lista.mercadolivre.com.br/", factor: 0.98, shipping: "Frete Grátis" },
      { name: "Amazon", prefix: "https://www.amazon.com.br/s?k=", factor: 1.0, shipping: "Frete Prime" },
      { name: "Shopee", prefix: "https://shopee.com.br/search?keyword=", factor: 0.93, shipping: "Cupom Frete Grátis" },
      { name: "TikTok Shop", prefix: "https://www.tiktok.com/search?q=", factor: 0.91, shipping: "Frete R$ 8.90" },
      { name: "Shein", prefix: "https://br.shein.com/pdsearch/", factor: 0.94, shipping: "Frete Grátis" }
    ];
    
    const generated = platforms.map(p => {
      const variance = (Math.sin(p.name.charCodeAt(0) + basePrice) * 0.02);
      const computedPrice = Math.round(basePrice * (p.factor + variance) * 100) / 100;
      return {
        storeName: p.name,
        price: computedPrice,
        url: `${p.prefix}${encodeURIComponent(cleanTitle)}`,
        isAvailable: true,
        shippingPrice: p.shipping.includes("Grátis") ? 0 : 9.90,
        shippingInfo: p.shipping
      };
    });
    return generated.sort((a, b) => a.price - b.price);
  }, [product, liveOffers, firestoreOffers]);

  // High quality generated BJJ visual as first-product default or premium fallback
  const fallbackAIImg = '/images/bjj_guerreiro_action_1779373683299.png';
  const initialImg = product.id === '1' ? fallbackAIImg : product.imageUrl;
  const [currentImageUrl, setCurrentImageUrl] = React.useState(initialImg);
  const [isGeneratingImage, setIsGeneratingImage] = React.useState(false);

  const handleGenerateAIImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGeneratingImage(true);
    try {
      const prompt = `A high-quality, photorealistic cinematic sports photograph of a Brazilian Jiu-Jitsu (BJJ) fighter wearing a heavy-weave dark blue kimono during an active ground transition on a black tatame. Dramatic, high-contrast gym lighting with sharp spotlights cutting through dust, creating beautiful rim light. Close-up, shallow depth of field, action shot with details of the kimono fabric texture, gripping hands, and determination on the faces of the athletes. Documental athletic style, 16:9 aspect ratio, aesthetic action pose. No kicks or punches, pure grappling.`;

      const response = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio: "16:9" }),
      });

      if (!response.ok) {
        throw new Error("Falha ao gerar imagem com IA.");
      }

      const data = await response.json();
      if (data.url) {
        setCurrentImageUrl(data.url);
      } else {
        throw new Error("URL não retornada.");
      }
    } catch (error) {
      console.error("Error generating AI image for product:", error);
      setCurrentImageUrl(fallbackAIImg);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const MiniCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/95 dark:bg-black border border-zinc-800 p-2 shadow-2xl backdrop-blur-md">
          <p className="text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
          <div className="space-y-0.5">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex justify-between items-center gap-3">
                <span className="text-[8px] font-mono font-black uppercase" style={{ color: entry.color }}>
                  {entry.name}:
                </span>
                <span className="text-[9px] font-mono font-black text-white">
                  {i18n.language === 'en' ? 'USD' : 'R$'} {entry.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          {payload[0].payload.isPromo && (
            <div className="mt-1.5 pt-1.5 border-t border-zinc-800 flex items-center gap-1.5 text-green-500">
              <TrendingDown size={10} />
              <span className="text-[7px] font-black uppercase tracking-wider">Desconto Ativo / Promo</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        rotateX: rx,
        rotateY: ry,
        transformStyle: "preserve-3d",
      }}
      animate={shouldShake ? {
        x: [0, -12, 12, -12, 12, -6, 6, -3, 3, 0]
      } : {}}
      whileHover={{ 
        y: -6, 
        scale: 1.025,
        boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.28), 0 0 30px 4px rgba(34, 197, 94, 0.22), 0 0 15px 2px rgba(204, 0, 0, 0.16)"
      }}
      transition={shouldShake ? {
        duration: 0.5,
        ease: "easeInOut"
      } : { 
        type: "spring", 
        stiffness: 340, 
        damping: 24, 
        mass: 0.75 
      }}
      className={`product-card-container group relative bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md border-2 ${
        product.isBestPrice
          ? 'border-[#cc0000] shadow-[4px_4px_0px_#cc0000]'
          : 'border-zinc-950 dark:border-zinc-800 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.08)]'
      } hover:border-[#cc0000] dark:hover:border-[#cc0000] transition-colors duration-300 overflow-hidden flex flex-col h-full rounded-none`}
    >
      {/* Schema.org Product Structured Data for Google Search Rich Results (Price & InStock) */}
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}

      {/* Ambient Subtle Glow Backlight on Hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 via-emerald-400/15 to-[#cc0000]/20 rounded-none blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10" />

      {/* High-Performance Visual Identity Glassmorphism Shine & Dual Glow Edge on Hover */}
      <div className="absolute inset-0 pointer-events-none z-[48] opacity-0 group-hover:opacity-100 transition-opacity duration-350 overflow-hidden">
        {/* Soft Radial Ambient Highlight on Hover */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 dark:from-white/5 via-transparent to-transparent pointer-events-none" />
        {/* Diagonal sweep light flare */}
        <div className="absolute inset-0 h-full w-[220%] bg-gradient-to-r from-transparent via-white/25 dark:via-white/15 to-transparent -skew-x-12 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-[800ms] ease-out" />
        {/* Razor sharp hover border overlay with glowing accent */}
        <div className="absolute inset-0 border-2 border-[#cc0000] shadow-[inset_0_0_12px_rgba(204,0,0,0.15)]" />
      </div>

      {product.isBestPrice && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[45]">
          <div className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-green-500/15 dark:via-green-400/8 to-transparent animate-shimmer-sweep" />
        </div>
      )}
      {product.id === '1' && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 via-white/20 to-green-600 z-[70] opacity-30 group-hover:opacity-100 transition-opacity" />
      )}
      {/* Technical Header */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-50 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50 opacity-50 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
           <div className={`w-1.5 h-1.5 rounded-full ${product.isBestPrice ? 'bg-green-500 animate-pulse' : 'bg-zinc-300 dark:bg-zinc-700'}`}></div>
           <span className="text-[8px] font-mono font-black uppercase tracking-[0.2em]">{product.platform} / v2.0</span>
        </div>
        <div className="flex items-center gap-2">
           {onToggleAlert && (
             <TooltipProvider>
               <Tooltip>
                 <TooltipTrigger asChild>
                   <button 
                     onClick={(e) => { e.stopPropagation(); onToggleAlert(product.id); }}
                     className={`p-1 transition-all rounded-full ${isAlertActive ? 'text-green-500' : 'text-zinc-400 hover:text-black dark:hover:text-white'}`}
                   >
                     {isAlertActive ? <Bell size={10} className="fill-green-500/20" /> : <BellOff size={10} />}
                   </button>
                 </TooltipTrigger>
                 <TooltipContent className="bg-black text-white border-zinc-800 rounded-none text-[8px] font-black uppercase">
                   {isAlertActive ? 'Alerta Ativo' : 'Ativar Alerta de Preço'}
                 </TooltipContent>
               </Tooltip>
             </TooltipProvider>
           )}
           <button 
             type="button"
             onClick={(e) => {
               e.stopPropagation();
               if (onOpenReviews) {
                 onOpenReviews(product);
               } else {
                 setShowReviewsSection(prev => !prev);
               }
             }}
             className="flex items-center gap-1.5 bg-black/90 hover:bg-black text-white px-2 py-0.5 rounded-sm border border-zinc-700/80 shadow-sm cursor-pointer hover:border-amber-500/60 transition-colors"
             title="Clique para ver ou enviar avaliações"
             id={`header-rating-badge-${product.id}`}
           >
             <Star size={8} className="fill-amber-400 text-amber-400" />
             <span className="text-[8px] font-mono font-black text-amber-300">
               {averageRating.toFixed(1)}
             </span>
             <span className="text-[7px] font-mono text-zinc-400">
               ({reviewsCount})
             </span>
           </button>
        </div>
      </div>

      {/* Image Carrier */}
      <div id={`product-image-container-${product.id}`} className="relative aspect-square overflow-hidden bg-white dark:bg-zinc-950 flex items-center justify-center group/img border-b border-zinc-50 dark:border-zinc-900 shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_0,transparent_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0,transparent_100%)] pointer-events-none" />
        
        {/* Compare Checkbox Toggle */}
        {onToggleCompare && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(product);
            }}
            className={`absolute top-3 left-3 z-30 px-2.5 py-1 text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 border backdrop-blur-md transition-all cursor-pointer ${
              isComparing
                ? 'bg-green-600 text-black border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)]'
                : 'bg-white/90 dark:bg-zinc-900/90 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
            }`}
            title={isComparing ? "Remover da comparação" : "Comparar especificações técnicas"}
            id={`toggle-compare-btn-${product.id}`}
          >
            <div className={`w-3.5 h-3.5 border flex items-center justify-center transition-colors ${
              isComparing ? 'bg-black border-black text-green-400' : 'border-zinc-400 dark:border-zinc-600 bg-white dark:bg-zinc-900'
            }`}>
              {isComparing && <Check size={10} strokeWidth={3} />}
            </div>
            <span>{isComparing ? 'Comparando' : 'Comparar'}</span>
          </motion.button>
        )}

        {/* Top Right Action Group: Price Alert Bell + Wishlist Heart */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">

          {/* Price Alert Bell Button */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85, y: -2 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsPriceAlertModalOpen(true);
            }}
            className={`p-2 rounded-full border transition-all cursor-pointer select-none ${
              isCustomAlertActive || isAlertActive
                ? 'bg-green-600 text-white border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                : 'bg-white/95 dark:bg-zinc-900/95 text-zinc-400 hover:text-green-600 dark:hover:text-green-400 border-zinc-200 dark:border-zinc-800'
            }`}
            title={(isCustomAlertActive || isAlertActive) ? "Alerta de Preço Ativo — Clique para gerenciar" : "Configurar Alerta de Preço"}
            id={`open-price-alert-modal-btn-${product.id}`}
            aria-label="Configurar Alerta de Preço"
          >
            {(isCustomAlertActive || isAlertActive) ? (
              <BellRing size={14} className="animate-pulse" />
            ) : (
              <Bell size={14} />
            )}
          </motion.button>

          {/* Wishlist Toggle Button with bounce tap animation */}
          {onToggleWishlist && (
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.8, y: -2 }}
              animate={shouldPulse ? {
                scale: [1, 1.35, 0.9, 1.2, 0.95, 1],
                boxShadow: [
                  "0px 0px 0px 0px rgba(204, 0, 0, 0)",
                  "0px 0px 0px 10px rgba(204, 0, 0, 0.4)",
                  "0px 0px 0px 20px rgba(204, 0, 0, 0)"
                ]
              } : {}}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 15,
                boxShadow: { duration: 0.8, ease: "easeOut" }
              }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product.id);
              }}
              className={`p-2 rounded-full border transition-colors ${
                isInWishlist 
                  ? 'bg-red-50 dark:bg-red-950/45 text-[#cc0000] border-red-200 dark:border-red-900/50 shadow-[0_0_15px_rgba(204,0,0,0.15)]' 
                  : 'bg-white/95 dark:bg-zinc-900/95 text-zinc-400 hover:text-[#cc0000] border-zinc-200 dark:border-zinc-800'
              }`}
              title={isInWishlist ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
              id={`toggle-wishlist-btn-${product.id}`}
            >
              <Heart size={14} className={isInWishlist ? 'fill-[#cc0000] text-[#cc0000]' : ''} />
            </motion.button>
          )}
        </div>

        <motion.div
          whileHover={{ scale: 1.15 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="w-full h-full"
        >
          {isGeneratingImage ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-white gap-2 font-mono">
              <Loader2 className="animate-spin text-[#cc0000]" size={24} />
              <span className="text-[8px] font-black uppercase tracking-widest">GERANDO PARCEIRO DE TREINO COM IA</span>
            </div>
          ) : (
            <BJJImage 
              src={currentImageUrl} 
              alt={product.title} 
              aspectRatio="aspect-square"
              className="w-full h-full object-cover brightness-[1.02] contrast-[1.02] transition-all duration-700 group-hover/img:brightness-95" 
            />
          )}
        </motion.div>
        
        {/* Editorial Overlay */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-[2px] p-5 z-10">
           <div className="space-y-2 w-full transform translate-y-6 group-hover:translate-y-0 transition-all duration-300 ease-out">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (onQuickBuy) {
                    onQuickBuy(product);
                  } else {
                    onCheckout?.(product);
                  }
                }}
                className="w-full bg-green-600 text-black hover:bg-green-500 font-mono font-black uppercase text-[10px] tracking-[0.2em] py-3.5 rounded-none flex items-center justify-center gap-2 transition-colors border border-green-500 cursor-pointer shadow-lg"
                id={`btn-overlay-quickbuy-${product.id}`}
              >
                <Zap size={14} className="fill-current text-black shrink-0" />
                {t('product.quick_buy', { defaultValue: 'Compra Rápida' })}
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onQuickView?.(product)}
                className="w-full bg-white text-black hover:bg-zinc-200 font-black uppercase text-[10px] tracking-[0.2em] py-3 rounded-none flex items-center justify-center gap-2 transition-colors border border-white cursor-pointer"
                id={`btn-overlay-quickview-${product.id}`}
              >
                <Search size={13} className="stroke-[2.5px]" />
                {t('product.view_details')}
              </motion.button>

              <motion.a 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={product.affiliateUrl} 
                onClick={() => onTrackClick?.(product)}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-transparent border border-white/40 text-white hover:bg-white hover:text-black font-black uppercase text-[10px] tracking-[0.2em] py-2.5 rounded-none flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ExternalLink size={13} className="stroke-[2.5px]" />
                {t('product.is_it_worth_it', { defaultValue: 'ANÁLISE' })}
              </motion.a>
           </div>
        </div>

        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none z-20">
           <AnimatePresence>
             {((product.popularity || 0) > 75 || (product.salesCount || 0) > 50 || product.isBestPrice) && (
               <motion.div
                 key="badge-fast-checkout"
                 initial={{ x: -20, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 transition={{ delay: 0.05 }}
                 className="product-header-badge bg-amber-500 text-black font-mono font-black text-[7px] tracking-[0.15em] uppercase px-2 py-1 flex items-center gap-1 shadow-[0_4px_12px_rgba(245,158,11,0.35)] border border-amber-400"
               >
                 <Zap size={9} className="fill-black text-black shrink-0 animate-pulse" />
                 <span>Fast Checkout</span>
               </motion.div>
             )}
             {((product.popularity || 0) > 85 || (product.salesCount || 0) > 100) && (
               <motion.div 
                 key="badge-best-seller"
                 initial={{ x: -20, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 className="bg-green-600 text-white font-black text-[7px] tracking-[0.2em] px-2 py-1 flex items-center gap-1.5 shadow-[0_5px_15px_rgba(34,197,94,0.3)] border border-green-500"
               >
                 <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                 {t('product.best_seller')}
               </motion.div>
             )}
              {product.isBestPrice && (
                <motion.div 
                  key="badge-offer"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ 
                    x: 0, 
                    opacity: 1,
                    scale: (isHovered && product.id === '1') ? [1, 1.08, 1] : 1,
                    filter: (isHovered && product.id === '1') ? [
                      'brightness(1) contrast(1)',
                      'brightness(1.2) contrast(1.1)',
                      'brightness(1) contrast(1)'
                    ] : 'brightness(1) contrast(1)'
                  }}
                  transition={{
                    x: { duration: 0.3 },
                    opacity: { duration: 0.3 },
                    scale: (isHovered && product.id === '1') ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" } : { duration: 0.3 },
                    filter: (isHovered && product.id === '1') ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" } : { duration: 0.3 }
                  }}
                  className={`bg-red-600 text-white font-black text-[7px] tracking-[0.2em] px-2 py-1 flex items-center gap-1.5 shadow-lg ${product.id === '1' ? 'border border-white/20' : ''}`}
                >
                  <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                  {t('product.offer', { defaultValue: 'OFERTA' })}
                </motion.div>
              )}
            </AnimatePresence>
        </div>
      </div>

      {/* Info Block */}
      <div className="p-8 flex flex-col flex-1 bg-white dark:bg-transparent relative">
        <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none">
          <OssLogo size="xl" />
        </div>
        
        <div className="flex-1 mb-8">
           <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-[9px] font-black uppercase tracking-[0.4em] text-green-600">{product.brand}</span>
              <div className="flex-1 h-[1px] bg-zinc-100 dark:bg-zinc-800"></div>
           </div>
           <h4 className="text-2xl font-black tracking-tighter uppercase leading-[0.85] text-black dark:text-white line-clamp-2 transition-colors mb-6 group-hover:italic group-hover:translate-x-1 transition-all">
             {product.title}
           </h4>
           
           <div className="flex flex-wrap gap-1.5 mb-6">
              {product.tags?.slice(0, 3).map((tag, i) => (
                <span key={`${tag}-${i}`} className="text-[8px] font-mono font-black uppercase px-2 py-0.5 border border-zinc-100 dark:border-zinc-800 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                  {tag}
                </span>
              ))}
           </div>

           {/* PROMINENT USER REVIEW & RATING DISPLAY */}
           <div 
             onClick={(e) => {
               e.stopPropagation();
               if (onOpenReviews) {
                 onOpenReviews(product);
               } else {
                 setShowReviewsSection(prev => !prev);
               }
             }}
             className="flex items-center justify-between p-2.5 mb-5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 dark:hover:border-amber-500/40 transition-all cursor-pointer group/rating"
             title="Clique para ver ou enviar avaliações deste produto"
             id={`product-rating-bar-${product.id}`}
           >
             <div className="flex items-center gap-2">
               <div className="flex items-center gap-0.5 text-amber-400">
                 {[1, 2, 3, 4, 5].map((star) => (
                   <Star 
                     key={star} 
                     size={13} 
                     className={star <= Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-300 dark:fill-zinc-800 dark:text-zinc-700"} 
                   />
                 ))}
               </div>
               <span className="text-xs font-mono font-black text-black dark:text-white">
                 {averageRating.toFixed(1)}
               </span>
               <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400">
                 / 5.0
               </span>
             </div>

             <div className="flex items-center gap-1.5">
               <span className="text-[9px] font-mono font-bold text-zinc-600 dark:text-zinc-300 group-hover/rating:text-amber-500 transition-colors">
                 {reviewsCount} {reviewsCount === 1 ? 'avaliação' : 'avaliações'}
               </span>
               <span className="text-[8px] font-mono font-black uppercase text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 border border-amber-500/20">
                 Avaliar ★
               </span>
             </div>
           </div>

           {/* Social Impact 10% Donation Dynamic Badge */}
           <SocialImpactBadge 
             price={product.price} 
             variant="card-bar" 
             className="mb-6" 
           />

           {/* Technical Details Toggle */}
           <button 
             onClick={() => setShowTechDetails(!showTechDetails)}
             className="w-full flex items-center justify-between py-3 border-y border-zinc-200 dark:border-zinc-800 group/tech mb-6"
           >
             <div className="flex items-center gap-2">
               <div className={`w-1.5 h-3.5 ${showTechDetails ? 'bg-[#cc0000]' : 'bg-zinc-300 dark:bg-zinc-700'} transition-colors`} />
               <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-400 group-hover/tech:text-black dark:group-hover/tech:text-white transition-colors">
                 ESPECIFICAÇÕES TÉCNICAS
               </span>
             </div>
             <ChevronRight size={14} className={`text-zinc-405 transition-all ${showTechDetails ? 'rotate-90 text-[#cc0000]' : ''}`} />
           </button>

           <AnimatePresence>
             {showTechDetails && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="overflow-hidden mb-6 bg-zinc-50/50 dark:bg-zinc-900/20 border-x border-zinc-50 dark:border-zinc-900"
               >
                 <div className="p-4 space-y-6">
                    <div>
                      <span className="block text-[7px] font-black text-green-600 uppercase mb-2 tracking-widest">// ANÁLISE DO TATAME</span>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-500 leading-relaxed font-mono">
                        {product.description}
                      </p>
                    </div>
                    
                     <WeaveGSMGauge 
                       gsm={product.title.toLowerCase().includes('light') ? 380 : product.title.toLowerCase().includes('gold') ? 550 : 450} 
                       weaveType={product.title.toLowerCase().includes('ripstop') ? 'Ripstop Combat' : product.title.toLowerCase().includes('trançado') ? 'Trançado Pesado' : 'Pearl Weave'} 
                     />

                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      {product.brand && (
                        <div className="border-l border-zinc-200 dark:border-zinc-800 pl-2">
                          <span className="block text-[7px] font-bold text-zinc-400 uppercase mb-0.5">MARCA</span>
                          <span className="text-[9px] font-black uppercase tracking-tight">{product.brand}</span>
                        </div>
                      )}
                      {product.category && (
                        <div className="border-l border-zinc-200 dark:border-zinc-800 pl-2">
                          <span className="block text-[7px] font-bold text-zinc-400 uppercase mb-0.5">CATEGORIA</span>
                          <span className="text-[9px] font-black uppercase tracking-tight">{product.category}</span>
                        </div>
                      )}
                      {product.gender && (
                        <div className="border-l border-zinc-200 dark:border-zinc-800 pl-2">
                          <span className="block text-[7px] font-bold text-zinc-400 uppercase mb-0.5">GÊNERO</span>
                          <span className="text-[9px] font-black uppercase tracking-tight">{product.gender}</span>
                        </div>
                      )}
                      {(product.beltColor || (product.belts && product.belts.length > 0)) && (
                        <div className="border-l border-zinc-200 dark:border-zinc-800 pl-2">
                           <span className="block text-[7px] font-bold text-zinc-400 uppercase mb-1">GRADUAÇÃO / RANK</span>
                           <div className="flex flex-wrap gap-1 items-center">
                             {(product.belts || [product.beltColor]).map(belt => {
                               if (!belt) return null;
                               return (
                                 <div key={belt} className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950 px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-900 rounded-xs">
                                   <div className={`w-1.5 h-1.5 rounded-full ${
                                     belt === 'Branca' ? 'bg-white border border-zinc-300' :
                                     belt === 'Azul' ? 'bg-blue-600' :
                                     belt === 'Roxa' ? 'bg-purple-700' :
                                     belt === 'Marrom' ? 'bg-[#5D4037]' : 'bg-black'
                                   }`} />
                                   <span className="text-[7px] font-mono font-black uppercase tracking-tight text-zinc-500 dark:text-zinc-400">{belt}</span>
                                 </div>
                               );
                             })}
                           </div>
                        </div>
                      )}
                    </div>

                    {Array.isArray(product.size) && product.size.length > 0 && (
                      <div className="pt-2 border-t border-zinc-250 dark:border-zinc-800">
                        <span className="block text-[7px] font-mono font-black text-zinc-400 uppercase mb-2">TAMANHOS DISPONÍVEIS</span>
                        <div className="flex flex-wrap gap-1.5">
                          {product.size.map(s => (
                            <span key={s} className="px-2 py-0.5 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-[8px] font-mono font-black group-hover:border-[#cc0000] transition-colors rounded-none">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                 </div>
               </motion.div>
             )}
           </AnimatePresence>

           {/* COMPARAR PREÇOS NAS LOJAS Toggle */}
           <button 
             onClick={() => setShowCompareStore(!showCompareStore)}
             className="w-full flex items-center justify-between py-3 border-b border-zinc-200 dark:border-zinc-800 group/compare mb-6 cursor-pointer"
           >
             <div className="flex items-center gap-2">
               <div className={`w-1.5 h-3.5 ${showCompareStore ? 'bg-green-600 animate-pulse' : 'bg-zinc-300 dark:bg-zinc-700'} transition-colors`} />
               <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-400 group-hover/compare:text-black dark:group-hover/compare:text-white transition-colors">
                 COTE E COMPARE PREÇOS
               </span>
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={cardOffersList[0]?.price}
                    initial={{ opacity: 0, scale: 1.25 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="text-[8px] font-mono font-black uppercase text-green-500 bg-green-500/10 px-1 py-0.5 rounded-xs leading-none"
                  >
                    Melhor Oferta: R$ {cardOffersList[0]?.price.toFixed(2)}
                  </motion.span>
                </AnimatePresence>
             </div>
             <ChevronRight size={14} className={`text-zinc-450 transition-all ${showCompareStore ? 'rotate-90 text-green-600' : ''}`} />
           </button>

           <AnimatePresence>
             {showCompareStore && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="overflow-hidden mb-6 bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900"
               >
                 <div className="p-4 space-y-3">
                   <div className="flex flex-col gap-2 pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
                     <div className="flex items-center justify-between flex-wrap gap-1.5">
                       <div className="flex items-center gap-1.5">
                         <span className="text-[8px] font-mono font-black text-green-600 uppercase tracking-widest">// OFERTAS ENCONTRADAS</span>
                         <span className="text-[7px] font-mono bg-green-500/10 text-green-600 px-1 py-0.2 uppercase font-bold">Firestore Sync</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                         <button
                           onClick={fetchLivePrices}
                           disabled={isLiveLoading}
                           className="px-2 py-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white dark:text-black font-mono font-black text-[7.5px] uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer border-none rounded-none"
                         >
                           {isLiveLoading ? (
                             <>
                               <RefreshCw className="animate-spin text-white dark:text-black" size={8} /> Rastreando...
                             </>
                           ) : (
                             <>
                               IA: Buscar em Tempo Real <RefreshCw size={8} />
                             </>
                           )}
                         </button>
                       </div>
                     </div>
                     {liveError && (
                       <p className="text-[7.5px] font-mono font-bold text-red-500 bg-red-500/5 p-1 border border-red-500/10">
                         ⚠️ {liveError}
                       </p>
                     )}
                     {isLiveLoading && (
                       <p className="text-[7px] font-mono text-green-500 animate-pulse">
                         ⚡ Buscando ofertas reais em 5 plataformas (Mercado Livre, Amazon, TikTok Shop, Shein, Shopee)...
                       </p>
                     )}
                   </div>

                   <div className="space-y-1.5">
                     {cardOffersList.map((offer, offsetIdx) => {
                       const isCheapest = offsetIdx === 0;
                       return (
                         <div 
                           key={offer.storeName}
                           className={`flex items-center justify-between p-2.5 border transition-all ${
                             isCheapest 
                               ? 'bg-green-500/5 dark:bg-green-500/5 border-green-500/30 font-bold' 
                               : 'bg-white dark:bg-zinc-950/40 border-zinc-150 dark:border-zinc-900'
                           }`}
                         >
                           <div className="flex flex-col gap-0.5">
                             <div className="flex items-center gap-1.5">
                               <span className={`text-[9px] font-mono font-black uppercase ${isCheapest ? 'text-green-600' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                 {offer.storeName}
                               </span>
                               {isCheapest && (
                                 <span className="text-[6.5px] font-black uppercase text-white bg-green-600 px-1 py-0.2 leading-none font-mono">
                                   Mais Barato 🔥
                                 </span>
                               )}
                             </div>
                             <span className="text-[7.5px] font-mono text-zinc-405 dark:text-zinc-500">
                               📦 {offer.shippingInfo || (offer.shippingPrice === 0 ? "Frete Grátis" : "Frete Pago")}
                             </span>
                           </div>

                           <div className="flex items-center gap-2">
                             {(() => {
                               const update = recentPriceUpdates[offer.storeName];
                               const isRecent = update && (Date.now() - update.timestamp < 12000);
                               return (
                                 <AnimatePresence mode="wait">
                                   <motion.span 
                                     key={`${offer.storeName}-${offer.price}`}
                                     initial={{ opacity: 0, scale: 1.35, y: -2 }}
                                     animate={{ opacity: 1, scale: 1, y: 0 }}
                                     transition={{ type: "spring", stiffness: 450, damping: 20 }}
                                     className={`text-[11px] font-mono font-black inline-flex items-center gap-1 ${isCheapest ? 'text-green-600' : 'text-black dark:text-white'}`}
                                   >
                                     R$ {offer.price.toFixed(2)}
                                     {isRecent && update.isPositive && (
                                       <motion.span
                                         initial={{ opacity: 0, scale: 0.7 }}
                                         animate={{ opacity: 1, scale: 1 }}
                                         transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                         className="text-[6.5px] font-mono font-black text-white bg-emerald-600 px-1 py-0.2 uppercase animate-pulse shadow-xs"
                                       >
                                         -{update.percent}% ↓
                                       </motion.span>
                                     )}
                                   </motion.span>
                                 </AnimatePresence>
                               );
                             })()}
                             <button
                               type="button"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleOpenShare(offer);
                               }}
                               className="p-1 border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-green-600 hover:border-green-600 transition-colors bg-zinc-50 dark:bg-zinc-900 cursor-pointer"
                               title={`Compartilhar oferta da ${offer.storeName} nas redes sociais`}
                               id={`share-offer-${product.id}-${offer.storeName.replace(/\s+/g, '-').toLowerCase()}`}
                             >
                               <Share2 size={9} />
                             </button>
                             <a 
                               href={offer.url}
                               target="_blank"
                               rel="noopener noreferrer"
                               onClick={() => onTrackClick?.(product)}
                               className={`px-2 py-1 text-[8px] font-mono font-black uppercase flex items-center gap-1 transition-colors ${
                                 isCheapest
                                   ? 'bg-green-600 text-white hover:bg-black dark:hover:bg-white dark:hover:text-black'
                                   : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-zinc-400'
                               }`}
                             >
                               Ir <ExternalLink size={8} />
                             </a>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>

           {/* Athlete Reviews & Ratings Toggle */}
           <button 
             onClick={() => setShowReviewsSection(!showReviewsSection)}
             className="w-full flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-900 group/rev mb-6 cursor-pointer"
             id={`reviews-section-toggle-${product.id}`}
           >
             <div className="flex items-center gap-2">
               <div className={`w-1 h-3 ${showReviewsSection ? 'bg-amber-400 animate-pulse' : 'bg-zinc-200 dark:bg-zinc-800'} transition-colors`} />
               <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-400 group-hover/rev:text-black dark:group-hover/rev:text-white transition-colors flex items-center gap-1.5">
                 <span>AVALIAÇÕES DOS ATLETAS</span>
                 <span className="text-amber-500 font-bold">({averageRating.toFixed(1)} ★ • {reviewsCount})</span>
               </span>
             </div>
             <ChevronRight size={14} className={`text-zinc-300 transition-all ${showReviewsSection ? 'rotate-90 text-amber-500' : ''}`} />
           </button>

           <AnimatePresence>
             {showReviewsSection && (
               <motion.div
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="overflow-hidden mb-6 bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 p-4 space-y-4"
                 id={`reviews-accordion-body-${product.id}`}
               >
                 {/* Rating Summary Block */}
                 <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                   <div className="flex items-center gap-3">
                     <div className="flex items-baseline gap-1">
                       <span className="text-2xl font-black font-mono text-black dark:text-white">
                         {averageRating.toFixed(1)}
                       </span>
                       <span className="text-[10px] font-mono text-zinc-400">/ 5.0</span>
                     </div>
                     <div className="flex items-center gap-0.5 text-amber-400">
                       {[1, 2, 3, 4, 5].map((s) => (
                         <Star 
                           key={s} 
                           size={12} 
                           className={s <= Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-300 dark:fill-zinc-800 dark:text-zinc-700"} 
                         />
                       ))}
                     </div>
                     <span className="text-[9px] font-mono text-zinc-500">
                       ({reviewsCount} {reviewsCount === 1 ? 'avaliação' : 'avaliações'})
                     </span>
                   </div>

                   <button
                     type="button"
                     onClick={() => onOpenReviews?.(product)}
                     className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-black font-mono font-black uppercase text-[9px] tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                     id={`btn-open-review-modal-${product.id}`}
                   >
                     <Star size={10} className="fill-black text-black" />
                     <span>Deixar Avaliação</span>
                   </button>
                 </div>

                 {/* Snippet of Recent Reviews */}
                 {productReviews.length > 0 ? (
                   <div className="space-y-2.5">
                     {productReviews.slice(0, 2).map((rev) => (
                       <div key={rev.id} className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 space-y-1">
                         <div className="flex items-center justify-between text-[9px] font-mono">
                           <div className="flex items-center gap-1.5 font-black text-black dark:text-white">
                             <span>{rev.userName}</span>
                             {rev.belt && (
                               <span className="text-[7.5px] px-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase">
                                 {rev.belt}
                               </span>
                             )}
                           </div>
                           <div className="flex items-center text-amber-400">
                             {[1, 2, 3, 4, 5].map((st) => (
                               <Star 
                                 key={st} 
                                 size={9} 
                                 className={st <= Math.round(rev.rating) ? "fill-amber-400 text-amber-400" : "fill-zinc-200 text-zinc-300 dark:fill-zinc-800 dark:text-zinc-700"} 
                               />
                             ))}
                           </div>
                         </div>
                         <p className="text-[10px] text-zinc-600 dark:text-zinc-300 font-sans line-clamp-2">
                           "{rev.comment}"
                         </p>
                       </div>
                     ))}

                     {reviewsCount > 2 && (
                       <button
                         type="button"
                         onClick={() => onOpenReviews?.(product)}
                         className="w-full text-center py-2 text-[9px] font-mono font-black uppercase text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer border border-dashed border-zinc-200 dark:border-zinc-800"
                       >
                         Ver todas as {reviewsCount} avaliações e detalhes →
                       </button>
                     )}
                   </div>
                 ) : (
                   <div className="text-center py-4 space-y-2">
                     <p className="text-[10px] font-mono text-zinc-400 uppercase">
                       Ainda não há avaliações registradas para este item.
                     </p>
                     <button
                       type="button"
                       onClick={() => onOpenReviews?.(product)}
                       className="inline-flex items-center gap-1 text-[9px] font-mono font-black uppercase text-green-600 hover:underline"
                     >
                       Seja o primeiro a avaliar este equipamento no tatame
                     </button>
                   </div>
                 )}
               </motion.div>
             )}
           </AnimatePresence>

           {/* Price History Toggle */}
           {product.priceHistory && product.priceHistory.length > 0 && (
             <button 
               onClick={() => setShowPriceChart(!showPriceChart)}
               className="w-full flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-900 group/price mb-6 cursor-pointer"
               id={`price-tracker-toggle-${product.id}`}
             >
               <div className="flex items-center gap-2">
                 <div className={`w-1 h-3 ${showPriceChart ? 'bg-red-650 animate-pulse' : 'bg-zinc-200'} transition-colors`} />
                 <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-400 group-hover/price:text-black dark:group-hover/price:text-white transition-colors">
                   HISTÓRICO DE PREÇOS COLETIVO
                 </span>
               </div>
               <ChevronRight size={14} className={`text-zinc-300 transition-all ${showPriceChart ? 'rotate-90 text-red-600' : ''}`} />
             </button>
           )}

           <AnimatePresence>
             {showPriceChart && product.priceHistory && product.priceHistory.length > 0 && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: 'auto', opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="overflow-hidden mb-6 bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-900"
                 id={`price-tracker-chart-container-${product.id}`}
               >
                 <div className="p-4 space-y-4">
                   <div className="flex items-center justify-between">
                     <span className="text-[8px] font-mono font-black text-green-600 dark:text-green-500 uppercase tracking-widest flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                       // ANÁLISE DE MERCADO
                     </span>
                     {/* Current Value & Trend Indicator Widget */}
                      <div className="flex items-center gap-2 bg-zinc-100/60 dark:bg-zinc-900/60 px-2 py-1 border border-zinc-150 dark:border-zinc-850">
                        <div className="text-right">
                          <span className="text-[6px] font-mono text-zinc-400 dark:text-zinc-550 block uppercase">PREÇO REGULAR</span>
                          <span className="text-[10px] font-black text-black dark:text-white font-mono leading-none">
                            {i18n.language === 'en' ? 'USD' : 'R$'} {trendInfo.latestPrice.toLocaleString(i18n.language === 'en' ? 'en-US' : 'pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                        <div className="flex items-center gap-1">
                          {trendInfo.isDown ? (
                            <span className="flex items-center text-green-600 dark:text-green-400 font-black font-mono text-[9px] gap-0.5">
                              <TrendingDown size={11} className="stroke-[3px]" />
                              <span>-{trendInfo.percent.toFixed(1)}%</span>
                            </span>
                          ) : trendInfo.isUp ? (
                            <span className="flex items-center text-red-655 dark:text-red-400 font-black font-mono text-[9px] gap-0.5" title="Preço de Kimono aumentou na semana">
                              <ArrowUp size={11} className="stroke-[3px]" />
                              <span>+{trendInfo.percent.toFixed(1)}%</span>
                            </span>
                          ) : (
                            <span className="text-zinc-405 font-bold font-mono text-[8px]">0.0%</span>
                          )}
                          <span className="text-[6px] text-zinc-400 dark:text-zinc-505 font-mono uppercase leading-none block">vs sem.<br/>anterior</span>
                        </div>
                      </div>
                   </div>

                   {/* Safe Interactive Filter Pills */}
                   <div className="flex flex-wrap gap-1 bg-zinc-100/50 dark:bg-zinc-900/30 p-1 border border-zinc-150 dark:border-zinc-850/80">
                     {Object.keys(product.priceHistory[0] || {})
                       .filter(k => k !== 'date' && k !== 'isPromo')
                       .map((store, i) => {
                         const isHidden = hiddenStores.has(store);
                         const storeColors: Record<string, string> = {
                           'Amazon': '#f97316',        // Orange
                           'Mercado Livre': '#eab308', // Amber-500
                           'Centauro': '#e11d48',      // Rose-600
                           'Netshoes': '#8b5cf6',      // Violet-500
                           'Shopee': '#f97316'         // Orange-500
                         };
                         const fallbackColors = ['#22c55e', '#FF9900', '#E11D48', '#8b5cf6', '#3b82f6'];
                         const storeColor = storeColors[store] || fallbackColors[i % fallbackColors.length];
                         
                         return (
                           <button
                             key={store}
                             onClick={() => toggleStoreLine(store)}
                             className={`flex items-center gap-1.5 px-2 py-0.5 text-[8px] font-mono font-black uppercase transition-all duration-200 border cursor-pointer ${
                               isHidden 
                                 ? 'bg-transparent text-zinc-405 border-zinc-200 dark:border-zinc-800 opacity-60' 
                                 : 'bg-zinc-150/55 dark:bg-zinc-900 text-black dark:text-white border-zinc-350 dark:border-zinc-700 font-extrabold'
                             }`}
                           >
                             <span 
                               className="w-1.5 h-1.5 rounded-full"
                               style={{ backgroundColor: isHidden ? '#71717a' : storeColor }}
                             />
                             {store}
                           </button>
                         );
                       })
                     }
                   </div>

                   {/* Ativar Alerta de Preço Widget Form */}
                    <div className="border border-zinc-200/60 dark:border-zinc-800/80 p-2.5 bg-zinc-50/20 dark:bg-zinc-900/10 space-y-2">
                      {!isCustomAlertActive ? (
                        !showCustomAlertForm ? (
                          <div className="flex items-center justify-between flex-wrap gap-2 animate-fadeIn">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[8px] font-black font-mono text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">ALARME DE ALTERAÇÃO</span>
                              <span className="text-[9px] text-zinc-650 dark:text-zinc-400 font-medium">BJJ Monitor: Seja notificado instantaneamente quando o kimono atingir seu valor alvo.</span>
                            </div>
                            <button
                              onClick={() => {
                                setShowCustomAlertForm(true);
                                setAlertSuccessToastMsg(null);
                              }}
                              className="flex items-center gap-1.5 px-2.5 py-1 text-[8px] font-black uppercase text-white bg-black dark:bg-zinc-900 border border-zinc-805 hover:bg-green-600 hover:border-green-600 dark:hover:bg-green-600 dark:hover:border-green-600 transition-all rounded-none font-mono cursor-pointer"
                            >
                              <Bell size={9} />
                              Ativar Alerta de Preço
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2 animate-fadeIn">
                            <div className="flex items-center justify-between pb-1 border-b border-zinc-150 dark:border-zinc-850">
                              <span className="text-[8px] font-black font-mono text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">REGULO DE DISPARO ALVO</span>
                              <button 
                                onClick={() => setShowCustomAlertForm(false)}
                                className="text-[7.5px] font-extrabold font-mono text-zinc-450 hover:text-black dark:hover:text-white uppercase transition-colors"
                              >
                                [ fechar ]
                              </button>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                              <div className="flex-1 flex items-center gap-2 bg-zinc-100 dark:bg-zinc-950 p-1.5 border border-zinc-200 dark:border-zinc-800">
                                <span className="text-[8px] font-black font-mono text-zinc-400 uppercase">PREÇO ALVO:</span>
                                <span className="text-[9px] font-mono font-black text-black dark:text-white">{i18n.language === 'en' ? '$' : 'R$'}</span>
                                <input 
                                  type="number"
                                  value={userAlertInput}
                                  onChange={(e) => setUserAlertInput(e.target.value)}
                                  className="w-full bg-transparent border-none outline-none text-[10px] font-mono font-black text-black dark:text-white p-0 focus:ring-0"
                                  placeholder="Preço Alvo"
                                />
                              </div>
                              
                              <div className="flex gap-1 overflow-x-auto pb-0.5">
                                {[-5, -10, -15].map(pct => {
                                  const targetVal = Math.round(product.price * (1 + pct / 100));
                                  return (
                                    <button
                                      key={pct}
                                      onClick={() => {
                                        setUserAlertInput(targetVal.toString());
                                        setCustomAlertPrice(targetVal);
                                      }}
                                      className="px-2 py-1 bg-zinc-100/70 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-805 text-[7px] font-mono font-black text-zinc-650 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer whitespace-nowrap transition-colors"
                                    >
                                      {pct}% ({i18n.language === 'en' ? '$' : 'R$'} {targetVal})
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                             {/* Canais de Notificação */}
                             <div className="space-y-1.5 pt-1.5 border-t border-dashed border-zinc-200 dark:border-zinc-850 text-left">
                               <span className="text-[8px] font-black font-mono text-zinc-450 dark:text-zinc-500 uppercase tracking-wider block">Canais de Notificação:</span>
                               <div className="flex flex-wrap gap-4 items-center">
                                 <label className="flex items-center gap-1.5 cursor-pointer text-[9px] font-mono font-bold uppercase select-none text-zinc-600 dark:text-zinc-400">
                                   <input 
                                     type="checkbox" 
                                     checked={notificationType === 'email' || notificationType === 'both'}
                                     onChange={(e) => {
                                       if (e.target.checked) {
                                         setNotificationType(prev => prev === 'push' ? 'both' : 'email');
                                       } else {
                                         setNotificationType(prev => prev === 'both' ? 'push' : 'email');
                                       }
                                     }}
                                     className="rounded border-zinc-350 dark:border-zinc-800 text-green-600 focus:ring-green-500 w-3.5 h-3.5 accent-green-650"
                                   />
                                   <span>E-mail</span>
                                 </label>
                                 <label className="flex items-center gap-1.5 cursor-pointer text-[9px] font-mono font-bold uppercase select-none text-zinc-600 dark:text-zinc-400">
                                   <input 
                                     type="checkbox" 
                                     checked={notificationType === 'push' || notificationType === 'both'}
                                     onChange={(e) => {
                                       if (e.target.checked) {
                                         setNotificationType(prev => prev === 'email' ? 'both' : 'push');
                                       } else {
                                         setNotificationType(prev => prev === 'both' ? 'email' : 'push');
                                       }
                                     }}
                                     className="rounded border-zinc-350 dark:border-zinc-800 text-green-600 focus:ring-green-500 w-3.5 h-3.5 accent-green-650"
                                   />
                                   <span>Push (Navegador)</span>
                                 </label>
                               </div>

                               {(notificationType === 'email' || notificationType === 'both') && (
                                 <motion.div 
                                   initial={{ opacity: 0, height: 0 }}
                                   animate={{ opacity: 1, height: 'auto' }}
                                   className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-950 p-1.5 border border-zinc-200 dark:border-zinc-800"
                                 >
                                   <span className="text-[8px] font-black font-mono text-zinc-400 uppercase shrink-0">DESTINO:</span>
                                   <input 
                                     type="email"
                                     value={notificationEmail}
                                     onChange={(e) => setNotificationEmail(e.target.value)}
                                     placeholder="seu-email@exemplo.com"
                                     className="w-full bg-transparent border-none outline-none text-[9px] font-mono font-black text-black dark:text-white p-0 focus:ring-0"
                                   />
                                 </motion.div>
                               )}
                             </div>
                            
                            <div className="flex items-center gap-1.5 justify-end pt-1">
                              <button
                                onClick={() => setShowCustomAlertForm(false)}
                                className="px-2 py-1 border border-zinc-200 dark:border-zinc-800 text-[8px] font-mono font-bold text-zinc-405 hover:bg-zinc-100 dark:hover:bg-zinc-900 uppercase cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={async () => {
                                  const parsedVal = parseFloat(userAlertInput);
                                  if (!isNaN(parsedVal) && parsedVal > 0) {
                                    if (notificationType === 'push' || notificationType === 'both') {
                                      if ("Notification" in window) {
                                        if (Notification.permission === "default") {
                                          await Notification.requestPermission();
                                        }
                                      }
                                    }

                                    setCustomAlertPrice(parsedVal);
                                    setIsCustomAlertActive(true);
                                    setShowCustomAlertForm(false);

                                    // Save to Firestore if authenticated
                                    if (auth.currentUser) {
                                      try {
                                                                                const wishlistDocPath = `users/${auth.currentUser.uid}/wishlist/${product.id}`;
                                        await updateDoc(doc(db, wishlistDocPath), {
                                          alertEnabled: true,
                                          targetPrice: parsedVal,
                                          notificationType: notificationType,
                                          notificationEmail: notificationEmail || auth.currentUser.email || '',
                                          lastNotifiedPrice: 0
                                        });
                                      } catch (err) {
                                        console.warn("Firestore save error:", err);
                                      }
                                    }

                                    if (!isAlertActive) {
                                      onToggleAlert?.(product.id);
                                    }

                                    const channelText = notificationType === 'email' ? 'e-mail' : notificationType === 'push' ? 'push' : 'e-mail e push';
                                    setAlertSuccessToastMsg(`✓ Sucesso! Alerta de ${channelText} configurado para quando o preço baixar de ${i18n.language === 'en' ? 'USD' : 'R$'} ${parsedVal.toLocaleString()}`);
                                  }
                                }}
                                className="px-3 py-1 bg-green-600 border border-green-600 text-white text-[8px] font-mono font-black hover:bg-green-500 transition-colors uppercase flex items-center gap-1 cursor-pointer"
                              >
                                <Check size={9} />
                                Confirmar Alerta
                              </button>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="flex items-center justify-between flex-wrap gap-2 animate-fadeIn">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                              <span className="text-[8px] font-black font-mono text-yellow-500 uppercase tracking-wider">ALARME LIVE ATIVO</span>
                            </div>
                            <span className="text-[7.5px] text-zinc-400 font-mono uppercase block mt-1">
                              Preferência: <span className="font-extrabold text-zinc-650 dark:text-zinc-300">{notificationType === 'email' ? 'E-mail' : notificationType === 'push' ? 'Push' : 'E-mail + Push'}</span>
                              {notificationType !== 'push' && notificationEmail && ` [${notificationEmail}]`}
                            </span>
                            <span className="text-[9px] text-zinc-650 dark:text-zinc-300 font-extrabold font-mono">
                              Monitorando limite de compra de: <span className="text-yellow-600 dark:text-yellow-400 font-black">{i18n.language === 'en' ? 'USD' : 'R$'} {customAlertPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </span>
                             <div className="border-t border-dashed border-zinc-200/80 dark:border-zinc-800/80 pt-1.5 mt-1.5 flex items-center justify-between gap-2 w-full">
                               <span className="text-[7px] font-mono font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Testar Alerta:</span>
                               <button
                                 onClick={handleSimulatePromoDrop}
                                 className="px-2 py-0.5 bg-yellow-600/90 hover:bg-yellow-500 text-white text-[7.5px] font-mono font-black uppercase rounded-none transition-colors cursor-pointer flex items-center gap-1"
                               >
                                 <TrendingDown size={9} />
                                 Simular Promoção ({i18n.language === 'en' ? 'USD' : 'R$'} {(customAlertPrice - 5).toFixed(2)})
                               </button>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setShowCustomAlertForm(true);
                              }}
                              className="px-2 py-0.5 border border-zinc-200 dark:border-zinc-800 text-[8px] font-mono font-bold text-zinc-400 hover:text-black dark:hover:text-white uppercase cursor-pointer"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                setIsCustomAlertActive(false);
                                setAlertSuccessToastMsg("✓ Alerta de preço removido");
                                onToggleAlert?.(product.id);
                              }}
                              className="p-1 bg-zinc-100/40 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-red-600 hover:text-white text-zinc-400 dark:text-zinc-505 hover:border-red-650 transition-all cursor-pointer"
                              title="Cancelar Alerta"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {alertSuccessToastMsg && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 p-1.5 bg-green-150/40 dark:bg-green-950/20 border border-green-250/30 text-green-700 dark:text-green-400 text-[8px] font-mono font-black uppercase flex items-center justify-between"
                        >
                          <span>{alertSuccessToastMsg}</span>
                          <button 
                            onClick={() => setAlertSuccessToastMsg(null)} 
                            className="text-[7px] font-bold text-green-600 dark:text-green-500 cursor-pointer hover:underline"
                          >
                            [FECHAR]
                          </button>
                        </motion.div>
                      )}
                    </div>

                    {/* Touch gesture and slide-zoom indicator layout */}
                    <div className="flex items-center justify-between text-[8px] font-mono pb-0.5">
                      <span className="text-zinc-400 dark:text-zinc-505 font-bold uppercase flex items-center gap-1">
                        <span>Pinch-to-zoom / Gesto de Garra:</span>
                        <span className="text-black dark:text-white font-black bg-zinc-100 dark:bg-zinc-900 px-1 py-0.5">{zoomScale.toFixed(2)}x</span>
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setZoomScale(prev => Math.max(1, prev - 0.25))}
                          className="p-1 bg-zinc-100/60 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 text-zinc-505 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-40"
                          disabled={zoomScale === 1}
                          title="Aproximar visual"
                        >
                          <Minus size={9} />
                        </button>
                        <button
                          onClick={() => setZoomScale(prev => Math.min(3, prev + 0.25))}
                          className="p-1 bg-zinc-100/60 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 text-zinc-505 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-40"
                          disabled={zoomScale === 3}
                          title="Afastar visual"
                        >
                          <Plus size={9} />
                        </button>
                        <button
                          onClick={() => setZoomScale(1)}
                          className="px-1.5 py-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-205 dark:border-zinc-855 text-[7px] font-black text-zinc-405 hover:text-black dark:hover:text-white cursor-pointer uppercase"
                          title="Original 1x"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    <div 
                      className="h-44 sm:h-52 w-full relative overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800 select-none touch-pan-x"
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      style={{ scrollBehavior: 'smooth' }}
                    >
                     <div className="chart-zoom-inner p-0 m-0" style={{ width: `${zoomScale * 100}%`, minWidth: '100%', height: '100%', transition: touchStartDistRef.current !== null ? 'none' : 'width 200ms ease-out' }}>
                        <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={product.priceHistory} margin={{ top: 8, right: -5, left: -10, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-200 dark:text-zinc-850" strokeOpacity={0.3} vertical={false} />
                         <XAxis 
                           dataKey="date" 
                           stroke="#71717a" 
                           fontSize={8} 
                           tickLine={false} 
                           axisLine={false} 
                           tick={{ fontWeight: 800 }}
                         />
                         <YAxis 
                           orientation="right"
                           width={35}
                           stroke="#71717a" 
                           fontSize={8} 
                           tickLine={false} 
                           axisLine={false} 
                           tickFormatter={(value) => `${i18n.language === 'en' ? '$' : 'R$'}${Math.round(value)}`}
                           domain={['auto', 'auto']}
                           tick={{ fontWeight: 800 }}
                         />
                         <RechartsTooltip content={<MiniCustomTooltip />} />
                          
                          {/* Live Alert ReferenceLine */}
                          {isCustomAlertActive && (
                            <ReferenceLine 
                              y={customAlertPrice} 
                              stroke="#eab308" 
                              strokeWidth={1.5} 
                              strokeDasharray="4 4" 
                              label={{ 
                                value: `ALVO: ${i18n.language === 'en' ? 'USD font-black' : 'R$'} ${customAlertPrice}`,
                                position: 'insideBottomLeft',
                                fill: '#eab308',
                                fontSize: 7,
                                fontWeight: 950
                              }} 
                            />
                          )}
                         {Object.keys(product.priceHistory[0] || {}).length > 0 && Object.keys(product.priceHistory[0])
                           .filter(k => k !== 'date' && k !== 'isPromo' && !hiddenStores.has(k))
                           .map((store, i) => {
                             const storeColors: Record<string, string> = {
                               'Amazon': '#f97316',        // Orange
                               'Mercado Livre': '#eab308', // Amber-500
                               'Centauro': '#e11d48',      // Rose-600
                               'Netshoes': '#8b5cf6',      // Violet-500
                               'Shopee': '#f97316'         // Orange-500
                             };
                             const fallbackColors = ['#22c55e', '#FF9900', '#E11D48', '#8b5cf6', '#3b82f6'];
                             const storeColor = storeColors[store] || fallbackColors[i % fallbackColors.length];
                             return (
                               <Line 
                                 key={store}
                                 type="monotone" 
                                 dataKey={store} 
                                 stroke={storeColor} 
                                 strokeWidth={product.platform === store ? 2.5 : 1.3} 
                                 dot={product.platform === store ? { r: 3, strokeWidth: 1, fill: '#fff' } : { r: 1 }} 
                                 activeDot={{ r: 4 }} 
                               />
                             );
                           })
                         }
                       </LineChart>
                     </ResponsiveContainer>
                    </div>
                   </div>

                   <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center text-[8px] font-mono">
                     <div className="flex items-center gap-2">
                       <TrendingDown size={10} className="text-green-500" />
                       <span className="text-zinc-400 uppercase">Menor Valor Registrado:</span>
                     </div>
                     <span className="text-green-600 font-extrabold font-mono">
                       {i18n.language === 'en' ? 'USD 479.90' : 'R$ 479,90'}
                     </span>
                   </div>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        <div className="pt-6 border-t border-zinc-50 dark:border-zinc-900 flex items-center justify-between">
           <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="micro-label text-zinc-500 opacity-80">{t('product.price_point', { defaultValue: 'Price Point' })}</p>
                {onToggleAlert && (
                  <PriceAlertBadge
                    productId={product.id}
                    isAlertActive={isAlertActive || isCustomAlertActive}
                    onToggleAlert={onToggleAlert}
                    isBestPrice={product.isBestPrice}
                    originalPrice={product.originalPrice}
                    currentPrice={product.price}
                    variant="price-inline"
                    size="sm"
                  />
                )}
              </div>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                 <span className="font-mono text-[10px] text-zinc-500">{getCurrencyCode(i18n.language)}</span>
                 {(() => {
                   const effectivePrice = (cardOffersList[0]?.price && cardOffersList[0].price < product.price) 
                     ? cardOffersList[0].price 
                     : product.price;
                   const isRecent = mainPriceUpdate && (Date.now() - mainPriceUpdate.timestamp < 12000);
                   return (
                     <AnimatePresence mode="popLayout">
                       <motion.span 
                         key={effectivePrice}
                         initial={{ opacity: 0, scale: 1.3, y: -4 }}
                         animate={{ opacity: 1, scale: 1, y: 0 }}
                         transition={{ type: "spring", stiffness: 450, damping: 20 }}
                         className="text-2xl font-black tracking-tighter text-black dark:text-white inline-flex items-center gap-2"
                       >
                         {formatPrice(effectivePrice, i18n.language)}
                         {isRecent && mainPriceUpdate.isPositive && (
                           <motion.span
                             initial={{ opacity: 0, scale: 0.6 }}
                             animate={{ opacity: 1, scale: 1 }}
                             transition={{ type: "spring", stiffness: 500, damping: 22 }}
                             className="text-[9px] font-mono font-black text-white bg-emerald-600 px-1.5 py-0.5 uppercase tracking-wider shadow-sm animate-pulse"
                           >
                             -{mainPriceUpdate.percent}% Queda 🔥
                           </motion.span>
                         )}
                       </motion.span>
                     </AnimatePresence>
                   );
                 })()}
              </div>
           </div>
           
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (onAddToCart) {
                    onAddToCart(product);
                  } else if (onQuickBuy) {
                    onQuickBuy(product);
                  } else {
                    onCheckout?.(product);
                  }
                }}
                className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-green-600 hover:bg-green-500 text-black font-mono font-black uppercase text-[10px] tracking-wider rounded-none border border-green-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                title="Adicionar à sacola ou comprar"
                id={`btn-add-cart-${product.id}`}
              >
                <ShoppingCart size={13} />
                <span>{onAddToCart ? 'Adicionar' : 'Garantir'}</span>
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onCheckout?.(product)}
                className="px-2.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono font-bold uppercase text-[9px] tracking-wider rounded-none border border-zinc-200 dark:border-zinc-800 transition-all flex items-center justify-center gap-1 cursor-pointer"
                title="Ver detalhes do produto"
                id={`btn-see-rec-${product.id}`}
              >
                <span>Detalhes</span>
                <ChevronRight size={12} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOpenShare()}
                className="p-2.5 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-800 rounded-none transition-all flex items-center justify-center cursor-pointer"
                title="Compartilhar produto"
                id={`btn-share-social-main-${product.id}`}
              >
                <Share2 size={13} />
              </motion.button>
            </div>
         </div>
       </div>

       {/* Narrative Footer */}
       <div className="px-8 pb-8 pt-0 mt-auto">
          <Button 
             variant="link" 
             asChild
             className="p-0 h-auto text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-green-600 transition-colors flex items-center gap-2"
           >
             <a href={product.affiliateUrl} onClick={() => onTrackClick?.(product)} target="_blank" rel="noopener noreferrer">
                {t('product.mat_analysis', { defaultValue: 'ANÁLISE DO TATAME' })} <ChevronRight size={10} />
             </a>
          </Button>
       </div>

       {/* Interactive Gift Selection Portal Modal */}
       <AnimatePresence>
         {isGiftModalOpen && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
           >
             <motion.div
               initial={{ scale: 0.95, y: 15 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.95, y: 15 }}
               transition={{ type: "spring", duration: 0.4 }}
               className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 max-w-lg w-full p-6 text-black dark:text-white rounded-none shadow-2xl relative flex flex-col gap-5 my-8"
             >
               {/* Close button */}
               <button
                 onClick={() => setIsGiftModalOpen(false)}
                 className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white hover:rotate-90 transition-all p-1 bg-transparent border-0 cursor-pointer"
                 title="Fechar modal"
               >
                 <X size={18} />
               </button>

               {/* Header */}
               <div className="space-y-1 pr-6">
                 <div className="flex items-center gap-2 text-amber-500 font-mono text-[9px] font-black tracking-[0.22em] uppercase">
                   <Gift size={12} />
                   <span>Portal de Presentes • OSS.OS</span>
                 </div>
                 <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">PEDIR DE PRESENTE 🎁</h3>
                 <p className="text-zinc-500 text-[10px] leading-relaxed">
                   Escolha a ocasião de celebração, personalize o nome de quem te dará e gere uma mensagem bem camarada para enviar diretamente por WhatsApp.
                 </p>
               </div>

               {/* Product Thumbnail Carrier */}
               <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/40 p-3 border border-zinc-100 dark:border-zinc-900 rounded-none overflow-hidden">
                 <div className="w-16 h-12 overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shrink-0">
                    <BJJImage 
                      src={currentImageUrl} 
                      alt={product.title} 
                      widthForce={120}
                      quality={75}
                      aspectRatio="aspect-video"
                      className="w-full h-full object-cover" 
                    />
                 </div>
                 <div className="min-w-0 flex-1">
                   <span className="block font-mono text-[8px] font-bold text-green-600 uppercase tracking-wider">{product.brand}</span>
                   <p className="text-xs font-black uppercase tracking-tight truncate text-black dark:text-white">{product.title}</p>
                   <p className="text-[10px] font-mono font-black text-zinc-450 mt-0.5">
                      Preço Estimado: <span className="text-black dark:text-white font-black">{i18n.language === 'en' ? 'USD' : 'R$'} {product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                   </p>
                 </div>
               </div>

               {/* Personalization Inputs */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <div className="space-y-1">
                   <label className="block text-[8px] font-black uppercase tracking-wider text-zinc-400 font-mono">
                     Quem vai te dar? (Pessoa Querida)
                   </label>
                   <input
                     type="text"
                     placeholder="Ex: Amor, Mãe, Mestre, Brother, Patrão"
                     value={giftRecipientName}
                     onChange={(e) => setGiftRecipientName(e.target.value)}
                     className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs p-2 focus:ring-1 focus:ring-green-500 outline-none rounded-none font-mono text-black dark:text-white"
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="block text-[8px] font-black uppercase tracking-wider text-zinc-400 font-mono">
                     Seu Nome (Assinatura)
                   </label>
                   <input
                     type="text"
                     placeholder="Ex: Seu Nome, Seu Apelido"
                     value={giftSenderName}
                     onChange={(e) => setGiftSenderName(e.target.value)}
                     className="w-full border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs p-2 focus:ring-1 focus:ring-green-500 outline-none rounded-none font-mono text-black dark:text-white"
                   />
                 </div>
               </div>

               {/* Occasions Grid */}
               <div className="space-y-1.5">
                 <label className="block text-[8px] font-black uppercase tracking-wider text-zinc-400 font-mono">
                   Selecione a Ocasião Especial:
                 </label>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                   {[
                     { id: 'birthday', label: 'Aniversário', emoji: '🎂' },
                     { id: 'christmas', label: 'Natal', emoji: '🎄' },
                     { id: 'secret_santa', label: 'Amigo Secreto', emoji: '🎁' },
                     { id: 'bet', label: 'Paga a Aposta', emoji: '🥋' },
                     { id: 'father', label: 'Dia dos Pais', emoji: '🧔' },
                     { id: 'mother', label: 'Dia das Mães', emoji: '👩' },
                     { id: 'children', label: 'Dia das Crianças', emoji: '🧒' },
                     { id: 'treat', label: 'Mimo / Agrado', emoji: '✨' },
                   ].map((item) => {
                     const isActive = giftOccasion === item.id;
                     return (
                       <button
                         key={item.id}
                         type="button"
                         onClick={() => setGiftOccasion(item.id)}
                         className={`py-2 px-2 text-left border text-[10px] sm:text-xs font-black uppercase tracking-tight transition-all rounded-none flex items-center gap-1.5 cursor-pointer ${
                           isActive
                             ? 'bg-amber-500 text-black border-amber-500 font-extrabold shadow-sm'
                             : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-150 dark:border-zinc-850 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
                         }`}
                       >
                         <span>{item.emoji}</span>
                         <span className="truncate">{item.label}</span>
                       </button>
                     );
                   })}
                 </div>
               </div>

               {/* Live Message Preview Box */}
               <div className="space-y-1.5">
                 <label className="block text-[8px] font-black uppercase tracking-wider text-zinc-400 font-mono">
                   Prévia da Mensagem no WhatsApp:
                 </label>
                 <div className="bg-zinc-50 dark:bg-zinc-900/40 p-3 border border-zinc-150 dark:border-zinc-900 font-mono text-[9px] text-zinc-600 dark:text-zinc-400 max-h-24 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
                   {getGiftMessageDraft()}
                 </div>
               </div>

               {/* Actions */}
               <div className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                 <button
                   type="button"
                   onClick={() => setIsGiftModalOpen(false)}
                   className="flex-1 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-800 transition-colors bg-transparent rounded-none cursor-pointer"
                 >
                   Cancelar
                 </button>
                 <button
                   type="button"
                   onClick={handleShareOnWhatsApp}
                   className="flex-1 py-3 bg-[rgb(37,211,102)] text-white text-[10px] font-black uppercase tracking-wider hover:brightness-105 transition-all rounded-none flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(37,211,102,0.25)] border border-[rgba(37,211,102,0.1)] cursor-pointer"
                 >
                   Compartilhar no WhatsApp
                   <ChevronRight size={11} className="stroke-[3px]" />
                 </button>
               </div>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
        <PriceAlertModal
          isOpen={isPriceAlertModalOpen}
          onClose={() => setIsPriceAlertModalOpen(false)}
          product={product}
          currentTargetPrice={customAlertPrice}
          isAlertActive={isCustomAlertActive || isAlertActive}
          onSaveAlert={(pId, targetVal, channels, email) => {
            setCustomAlertPrice(targetVal);
            setIsCustomAlertActive(true);
            if (onToggleAlert) {
              onToggleAlert(pId, targetVal, channels, email);
            }
          }}
          onRemoveAlert={(pId) => {
            setIsCustomAlertActive(false);
            if (onToggleAlert) {
              onToggleAlert(pId);
            }
          }}
        />
        <PurchaseSchedulerModal
          isOpen={isSchedulerModalOpen}
          onClose={() => setIsSchedulerModalOpen(false)}
          product={product}
        />
        <SocialShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          product={product}
          selectedOffer={selectedOfferToShare}
        />
     </motion.div>

  );
};

export default PremiumProductCard;

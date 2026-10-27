import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, 
  ExternalLink, 
  TrendingDown, 
  Store, 
  Cloud, 
  Loader2, 
  Search, 
  Filter, 
  ChevronRight, 
  ArrowLeft, 
  Share2, 
  Check,
  Award,
  DollarSign,
  Truck,
  Scale,
  Sparkles,
  Info,
  ShieldCheck,
  Clock,
  RotateCcw,
  Calendar,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ProductOffer, Product } from '@/src/types';
import { Badge } from '@/components/ui/badge';
import { SocialShareModal } from '@/src/components/SocialShareModal';
import { Button } from '@/components/ui/button';
import { db, auth, subscribeToProductOffers, seedProductOffers } from '@/src/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { products as initialProducts } from '@/src/data/products';
import { motion, AnimatePresence } from 'motion/react';
import { TacticalComparison } from './TacticalComparison';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface PriceComparatorProps {
  offers?: ProductOffer[];
  productTitle?: string;
  productId?: string;
  onBack?: () => void;
}

export const PriceComparator: React.FC<PriceComparatorProps> = ({ offers, productTitle, productId, onBack }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'pt';

  const dict: Record<string, Record<string, string>> = {
    en: {
      syncing: "Syncing...",
      live_firestore: "Live Firestore Offers",
      local_offers: "Local Offers",
      store: "Store",
      price: "Price",
      action: "Action",
      best_price: "Best Price",
      free_shipping: "Free Shipping",
      shipping: "Shipping",
      shipping_consult: "Shipping to check",
      total: "Total",
      go_to_store: "Go to Store",
      note: "Prices shown are updated periodically and may vary depending on the availability of partner stores.",
      search_placeholder: "Search BJJ gear...",
      all_categories: "All Categories",
      compare_title: "Price Comparison Portal",
      compare_subtitle: "Find kimonos, rashguards, belts, and supplements at the lowest price across major partner stores.",
      back_to_list: "Back to List",
      best_deal_title: "Best Choice Recommendation",
      best_deal_text: "You save up to {savings} by buying at {store}!",
      no_products_found: "No products found matching your search.",
      compare_btn: "Compare Prices",
      copied: "Link copied to clipboard!",
      share: "Share Comparison",
      savings: "Savings",
      original_price: "Original Price",
      bjj_portal_title: "BJJ Price Comparator",
      mode_prices: "Price Comparator",
      mode_tactical: "Tactical Comparison",
      durability_calculator_title: "Estimated Annual Savings (Cost vs. Durability)",
      durability_calculator_subtitle: "Based on review history and mat durability, see how much you save by choosing gear with high longevity.",
      training_frequency: "Weekly Training Frequency",
      gear_scope: "Equipment Scope",
      annual_savings: "Estimated Annual Savings",
      three_year_savings: "3-Year Accumulated Savings",
      cost_per_month: "Cost per Month of Use",
      durability_index: "Estimated Lifespan",
      top_cpd_products: "Top Cost-per-Durability Gear",
      vs_low_durability: "vs. Low Durability Brands",
      months: "months"
    },
    es: {
      syncing: "Sincronizando...",
      live_firestore: "Ofertas de Firestore en Vivo",
      local_offers: "Ofertas Locales",
      store: "Tienda",
      price: "Precio",
      action: "Acción",
      best_price: "Mejor Precio",
      free_shipping: "Envío Gratis",
      shipping: "Envío",
      shipping_consult: "Envío a consultar",
      total: "Total",
      go_to_store: "Ir a la Tienda",
      note: "Los precios mostrados se aplican periódicamente y pueden variar según la disponibilidad de las tiendas asociadas.",
      search_placeholder: "Buscar equipamiento de BJJ...",
      all_categories: "Todas las categorías",
      compare_title: "Portal de Comparación de Precios",
      compare_subtitle: "Encuentra kimonos, rashguards, cinturones y suplementos al precio más bajo en las principales tiendas asociadas.",
      back_to_list: "Volver a la Lista",
      best_deal_title: "Recomendación de Mejor Opción",
      best_deal_text: "¡Ahorras hasta {savings} comprando en {store}!",
      no_products_found: "No se encontraron productos que coincidan con la búsqueda.",
      compare_btn: "Comparar Precios",
      copied: "¡Enlace copiado al portapapeles!",
      share: "Compartir Comparación",
      savings: "Ahorro",
      original_price: "Precio Original",
      bjj_portal_title: "Comparador de Precios BJJ",
      mode_prices: "Comparador de Precios",
      mode_tactical: "Comparación Táctica",
      durability_calculator_title: "Ahorro Anual Estimado (Costo vs. Durabilidad)",
      durability_calculator_subtitle: "Según el historial de reseñas y durabilidad en el tatami, vea cuánto ahorra eligiendo equipamiento de alta longevidad.",
      training_frequency: "Frecuencia Semanal de Entrenamiento",
      gear_scope: "Alcance de Equipamiento",
      annual_savings: "Ahorro Anual Estimado",
      three_year_savings: "Ahorro Acumulado en 3 Años",
      cost_per_month: "Costo por Mes de Uso",
      durability_index: "Durabilidad Estimada",
      top_cpd_products: "Mejor Equipamiento Costo x Durabilidad",
      vs_low_durability: "vs. Marcas de Baja Durabilidad",
      months: "meses"
    },
    pt: {
      syncing: "Sincronizando...",
      live_firestore: "Ofertas Live Firestore",
      local_offers: "Ofertas Locais",
      store: "Loja",
      price: "Preço",
      action: "Ação",
      best_price: "Melhor Preço",
      free_shipping: "Frete Grátis",
      shipping: "Frete",
      shipping_consult: "Frete a consultar",
      total: "Total",
      go_to_store: "Ir para Loja",
      note: "Os preços apresentados são atualizados periodicamente e podem variar conforme a disponibilidade das lojas parceiras.",
      search_placeholder: "Buscar equipamentos de jiu-jitsu...",
      all_categories: "Todas as Categorias",
      compare_title: "Portal Comparador de Preços",
      compare_subtitle: "Encontre kimonos, rashguards, faixas e suplementos pelo menor preço nas maiores lojas parceiras.",
      back_to_list: "Voltar para Lista",
      best_deal_title: "Recomendação OSS.OS de Melhor Escolha",
      best_deal_text: "Você economiza até {savings} comprando na {store}!",
      no_products_found: "Nenhum produto encontrado com a busca atual.",
      compare_btn: "Comparar Preços",
      copied: "Link copiado para a área de transferência!",
      share: "Compartilhar Comparativo",
      savings: "Economia",
      original_price: "Preço Original",
      bjj_portal_title: "Comparador BJJ de Preços Multi-Lojas",
      mode_prices: "Comparador de Preços",
      mode_tactical: "Comparação Táctica",
      cheapest_badge: "🏆 MENOR PREÇO ENCONTRADO",
      cheapest_store_highlight: "Melhor Escolha: {store} por R$ {price}",
      savings_text: "Economize R$ {savings} ({percent}% OFF) comprando nesta plataforma!",
      compare_platforms: "Comparativo Mercado Livre, Amazon, TikTok Shop, Shein e Shopee",
      durability_calculator_title: "Economia Anual Estimada (Custo x Durabilidade)",
      durability_calculator_subtitle: "Com base no histórico de avaliações e durabilidade real no tatame, veja o valor acumulado em R$ economizado ao escolher equipamentos de alta longevidade.",
      training_frequency: "Frequência Semanal de Treino",
      gear_scope: "Perímetro de Equipamento",
      annual_savings: "Economia Anual Estimada",
      three_year_savings: "Economia Acumulada em 3 Anos",
      cost_per_month: "Custo por Mês de Uso",
      durability_index: "Durabilidade Estimada",
      top_cpd_products: "Equipamentos com Melhor Custo x Durabilidade",
      vs_low_durability: "vs. Marcas de Baixa Durabilidade",
      months: "meses"
    }
  };

  const currentDict = dict[lang] || dict['pt'];

  // Global States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [shareModalProduct, setShareModalProduct] = useState<Product | null>(null);
  const [isSocialShareModalOpen, setIsSocialShareModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedStore, setSelectedStore] = useState<string>('Todas');
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);
  const [comparatorMode, setComparatorMode] = useState<'prices' | 'tactical'>('prices');

  // States for Annual Savings / Cost-per-durability calculator
  const [trainingDays, setTrainingDays] = useState<2 | 4 | 6>(4);
  const [savingsScope, setSavingsScope] = useState<'all' | 'kimonos' | 'rashguards'>('all');
  const [isDurabilityCalculatorOpen, setIsDurabilityCalculatorOpen] = useState<boolean>(true);

  // Helper calculation for Cost per Durability metrics across initialProducts
  const durabilityMetrics = useMemo(() => {
    // Wear factor based on training frequency per week
    const wearFactor = trainingDays === 2 ? 0.85 : trainingDays === 4 ? 1.0 : 1.35;

    // Filter relevant products based on scope
    const scopedProducts = initialProducts.filter(p => {
      if (savingsScope === 'kimonos') return p.category === 'Kimonos';
      if (savingsScope === 'rashguards') return p.category === 'Rashguards' || p.category === 'Bermudas';
      return true;
    });

    const analyzed = scopedProducts.map(prod => {
      const offers = generateDynamicOffers(prod);
      const bestPrice = offers[0]?.price || prod.price;
      const rating = prod.rating || 4.5;
      const reviewsCount = prod.reviews?.length || (prod.rating ? Math.round(prod.rating * 14) : 18);

      // Durability multiplier based on review rating
      const ratingMult = 0.6 + (rating / 5.0) * 0.6; // e.g. 5.0 => 1.2x, 4.0 => 1.08x
      
      let baseLifespanMonths = 24;
      if (prod.category === 'Kimonos') baseLifespanMonths = 30;
      else if (prod.category === 'Rashguards' || prod.category === 'Bermudas') baseLifespanMonths = 18;
      else if (prod.category === 'Faixas') baseLifespanMonths = 48;
      else if (prod.category === 'Suplementos') baseLifespanMonths = 1;
      else baseLifespanMonths = 12;

      const estimatedLifespanMonths = Math.max(1, Math.round((baseLifespanMonths * ratingMult) / wearFactor));
      const costPerMonth = bestPrice / estimatedLifespanMonths;

      // Low durability benchmark cost per month for same category
      let lowDurabilityMonthlyCost = 35.0;
      if (prod.category === 'Kimonos') lowDurabilityMonthlyCost = 42.0;
      else if (prod.category === 'Rashguards' || prod.category === 'Bermudas') lowDurabilityMonthlyCost = 22.0;
      else if (prod.category === 'Faixas') lowDurabilityMonthlyCost = 7.5;
      else if (prod.category === 'Suplementos') lowDurabilityMonthlyCost = 85.0;

      const monthlySavingsPerItem = Math.max(0, lowDurabilityMonthlyCost - costPerMonth);
      const annualSavingsPerItem = monthlySavingsPerItem * 12;

      // Score 1-10
      const cpdScore = Math.min(10, Math.max(1, Math.round((35 / Math.max(1, costPerMonth)) * (rating / 5.0) * 2.2)));

      return {
        product: prod,
        bestPrice,
        rating,
        reviewsCount,
        estimatedLifespanMonths,
        costPerMonth,
        monthlySavingsPerItem,
        annualSavingsPerItem,
        cpdScore,
        bestStore: offers[0]?.storeName || 'Loja Parceira'
      };
    });

    // Sort by CPD Score descending
    analyzed.sort((a, b) => b.cpdScore - a.cpdScore);

    // Calculate aggregated annual savings for a practitioner's gear kit
    let totalAnnualSavings = 0;
    if (savingsScope === 'all') {
      const topKimono = analyzed.find(a => a.product.category === 'Kimonos');
      const topRash = analyzed.find(a => a.product.category === 'Rashguards' || a.product.category === 'Bermudas');
      const topFaixa = analyzed.find(a => a.product.category === 'Faixas');

      const kimonoSaved = (topKimono?.annualSavingsPerItem || 280) * 1.5;
      const rashSaved = (topRash?.annualSavingsPerItem || 160) * 2;
      const faixaSaved = (topFaixa?.annualSavingsPerItem || 45) * 1;

      totalAnnualSavings = Math.round(kimonoSaved + rashSaved + faixaSaved);
    } else if (savingsScope === 'kimonos') {
      const topKimonos = analyzed.slice(0, 3);
      const avgSaved = topKimonos.reduce((acc, curr) => acc + curr.annualSavingsPerItem, 0) / Math.max(1, topKimonos.length);
      totalAnnualSavings = Math.round(avgSaved * 2);
    } else {
      const topRashes = analyzed.slice(0, 3);
      const avgSaved = topRashes.reduce((acc, curr) => acc + curr.annualSavingsPerItem, 0) / Math.max(1, topRashes.length);
      totalAnnualSavings = Math.round(avgSaved * 3);
    }

    totalAnnualSavings = Math.round(totalAnnualSavings * (wearFactor >= 1.0 ? wearFactor : 1.0));
    const accumulated3YrSavings = totalAnnualSavings * 3;

    return {
      topProducts: analyzed.slice(0, 4),
      totalAnnualSavings,
      accumulated3YrSavings,
      avgCostPerMonth: analyzed.length > 0 ? (analyzed.reduce((a, b) => a + b.costPerMonth, 0) / analyzed.length) : 0
    };
  }, [trainingDays, savingsScope]);

  // Firestore & local offers fetching/storing
  const [firestoreOffers, setFirestoreOffers] = useState<ProductOffer[] | null>(null);
  const [isDbLoading, setIsDbLoading] = useState<boolean>(false);
  const [isLiveFromDb, setIsLiveFromDb] = useState<boolean>(false);

  // Load & subscribe to real-time Firestore offers when productId changes
  useEffect(() => {
    const currentId = productId || selectedProduct?.id;
    const targetProduct = selectedProduct || initialProducts.find(p => p.id === currentId);

    if (!currentId) {
      setFirestoreOffers(null);
      setIsLiveFromDb(false);
      return;
    }

    setIsDbLoading(true);

    // Seed default offers if needed so Firestore has offers to track and compare
    if (targetProduct) {
      seedProductOffers(currentId, targetProduct.price, targetProduct.title).catch((err) => {
        console.warn("Notice seeding initial product offers:", err);
      });
    }

    // Subscribe to live real-time price updates via onSnapshot
    const unsubscribe = subscribeToProductOffers(
      currentId,
      (offers) => {
        if (offers && offers.length > 0) {
          setFirestoreOffers(offers);
          setIsLiveFromDb(true);
        } else {
          setFirestoreOffers(null);
          setIsLiveFromDb(false);
        }
        setIsDbLoading(false);
      },
      (error) => {
        console.warn("Real-time offers sync error:", error);
        setIsDbLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [productId, selectedProduct]);

  // Handle URL deep link on mount
  useEffect(() => {
    if (productId) return; // Embedded widget mode
    const params = new URLSearchParams(window.location.search);
    const urlProductId = params.get('compare') || params.get('productId');
    if (urlProductId) {
      const found = initialProducts.find(p => p.id === urlProductId);
      if (found) {
        setSelectedProduct(found);
      }
    }
  }, [productId]);

  // Dynamic offers generator based on price (with brand & category variations for Mercado Livre, Amazon, TikTok Shop, Shein, Shopee)
  const generateDynamicOffers = (prod: Product): ProductOffer[] => {
    if (prod.offers && prod.offers.length > 0) {
      return prod.offers;
    }

    const basePrice = prod.price;
    const titleClean = prod.title;

    // All required platforms plus specialized stores
    const storesConfig = [
      {
        name: 'Mercado Livre',
        discount: 0.98,
        shipping: 0,
        url: prod.affiliateUrl || `https://lista.mercadolivre.com.br/${encodeURIComponent(titleClean)}`
      },
      {
        name: 'Amazon',
        discount: 1.0,
        shipping: 0, // Prime
        url: `https://www.amazon.com.br/s?k=${encodeURIComponent(titleClean)}&tag=ossosbjj-20`
      },
      {
        name: 'Shopee',
        discount: 0.93,
        shipping: 0, // Cupom Frete
        url: `https://shopee.com.br/search?keyword=${encodeURIComponent(titleClean)}`
      },
      {
        name: 'TikTok Shop',
        discount: 0.91,
        shipping: 8.90,
        url: `https://www.tiktok.com/search?q=${encodeURIComponent(titleClean)}`
      },
      {
        name: 'Shein',
        discount: 0.94,
        shipping: 0,
        url: `https://br.shein.com/pdsearch/${encodeURIComponent(titleClean)}`
      }
    ];

    // Add category specific stores
    if (prod.category === 'Kimonos') {
      storesConfig.push({ name: 'Venum Brasil', discount: 0.97, shipping: 19.90, url: 'https://venum.com.br' });
    } else if (prod.category === 'Suplementos') {
      storesConfig.push({ name: 'Growth Supps', discount: 0.89, shipping: 12.00, url: 'https://gsuplementos.com.br' });
    } else {
      storesConfig.push({ name: 'Centauro', discount: 1.02, shipping: 0, url: 'https://centauro.com.br' });
    }

    const items: ProductOffer[] = storesConfig.map((store) => {
      const variance = (Math.sin(store.name.charCodeAt(0) + basePrice) * 0.02);
      const computedPrice = Math.round(basePrice * (store.discount + variance) * 100) / 100;
      return {
        storeName: store.name,
        price: computedPrice,
        url: store.url || '#',
        isAvailable: true,
        shippingPrice: store.shipping,
        shippingInfo: store.shipping === 0 ? 'Frete Grátis' : `Frete R$ ${store.shipping.toFixed(2)}`
      };
    });

    return items.sort((a, b) => (a.price + (a.shippingPrice || 0)) - (b.price + (b.shippingPrice || 0)));
  };

  // Compile active offers
  const activeOffers = useMemo(() => {
    if (productId) {
      return firestoreOffers !== null ? firestoreOffers : (offers || []);
    }
    if (selectedProduct) {
      return firestoreOffers !== null ? firestoreOffers : generateDynamicOffers(selectedProduct);
    }
    return [];
  }, [productId, selectedProduct, firestoreOffers, offers]);

  // Handle link sharing
  const handleShare = (prod: Product) => {
    setShareModalProduct(prod);
    setIsSocialShareModalOpen(true);
    const shareUrl = `${window.location.origin}${window.location.pathname}?compare=${prod.id}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedProductId(prod.id);
        setTimeout(() => setCopiedProductId(null), 2500);
      }).catch(() => {});
    }
  };

  // Categories list
  const categories = ['Todos', 'Kimonos', 'Faixas', 'Roupas', 'Suplementos', 'Acessórios'];

  // Affiliate Platforms filter list
  const affiliateStores = ['Todas', 'Mercado Livre', 'Amazon', 'TikTok Shop', 'Shein', 'Shopee'];

  // Filter products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter(prod => {
      const matchSearch = prod.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (prod.brand && prod.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCat = selectedCategory === 'Todos' || prod.category === selectedCategory;

      let matchStore = true;
      if (selectedStore !== 'Todas') {
        const offers = generateDynamicOffers(prod);
        matchStore = offers.some(o => o.storeName.toLowerCase() === selectedStore.toLowerCase());
      }

      return matchSearch && matchCat && matchStore;
    });
  }, [searchTerm, selectedCategory, selectedStore]);

  // Helper calculation for lowest price
  const lowestOffer = useMemo(() => {
    if (activeOffers.length === 0) return null;
    const sorted = [...activeOffers].sort((a, b) => (a.price + (a.shippingPrice || 0)) - (b.price + (b.shippingPrice || 0)));
    return sorted[0];
  }, [activeOffers]);

  // Highest offer for savings calculations
  const highestOffer = useMemo(() => {
    if (activeOffers.length === 0) return null;
    const sorted = [...activeOffers].sort((a, b) => (a.price + (a.shippingPrice || 0)) - (b.price + (b.shippingPrice || 0)));
    return sorted[sorted.length - 1];
  }, [activeOffers]);

  const maxSavings = useMemo(() => {
    if (!lowestOffer || !highestOffer) return 0;
    const diff = (highestOffer.price + (highestOffer.shippingPrice || 0)) - (lowestOffer.price + (lowestOffer.shippingPrice || 0));
    return diff > 0 ? diff : 0;
  }, [lowestOffer, highestOffer]);

  // Metric calculation for a single selected product
  const selectedProductDurability = useMemo(() => {
    if (!selectedProduct) return null;
    const wearFactor = trainingDays === 2 ? 0.85 : trainingDays === 4 ? 1.0 : 1.35;
    const bestPrice = lowestOffer?.price || selectedProduct.price;
    const rating = selectedProduct.rating || 4.8;
    const ratingMult = 0.6 + (rating / 5.0) * 0.6;
    let baseLifespan = 24;
    if (selectedProduct.category === 'Kimonos') baseLifespan = 30;
    else if (selectedProduct.category === 'Rashguards' || selectedProduct.category === 'Bermudas') baseLifespan = 18;
    else if (selectedProduct.category === 'Faixas') baseLifespan = 48;
    else if (selectedProduct.category === 'Suplementos') baseLifespan = 1;

    const estimatedLifespanMonths = Math.max(1, Math.round((baseLifespan * ratingMult) / wearFactor));
    const costPerMonth = bestPrice / estimatedLifespanMonths;

    let benchmarkMonthly = 40.0;
    if (selectedProduct.category === 'Kimonos') benchmarkMonthly = 48.0;
    else if (selectedProduct.category === 'Rashguards') benchmarkMonthly = 22.0;

    const monthlySavings = Math.max(0, benchmarkMonthly - costPerMonth);
    const lifespanSavings = monthlySavings * estimatedLifespanMonths;
    const annualSavings = monthlySavings * 12;

    return {
      estimatedLifespanMonths,
      costPerMonth,
      lifespanSavings,
      annualSavings,
      rating
    };
  }, [selectedProduct, lowestOffer, trainingDays]);

  // 1. EMBEDDED WIDGET MODE (Has specific productId/offers passed from gallery)
  if (productId) {
    if (activeOffers.length === 0) {
      return (
        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center rounded-none">
          <Store className="mx-auto mb-3 text-zinc-300 dark:text-zinc-700" size={32} />
          <p className="text-sm text-zinc-500 font-medium italic">
            {isDbLoading ? 'Sincronizando comparador...' : `Buscando ofertas para "${productTitle || 'equipamento'}"...`}
          </p>
          <p className="text-xs text-zinc-400 mt-2">
            Verificando Mercado Livre, Amazon e principais lojas especializadas.
          </p>
        </div>
      );
    }

    const sortedOffers = [...activeOffers].sort((a, b) => a.price - b.price);
    const lowestPrice = sortedOffers[0].price;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
            Comparador de Preços
          </h3>
          <div className="flex items-center gap-2">
            {isDbLoading ? (
              <span className="text-[9px] text-zinc-400 font-mono flex items-center gap-1 uppercase animate-pulse">
                <Loader2 size={10} className="animate-spin text-zinc-400" /> {currentDict.syncing}
              </span>
            ) : isLiveFromDb ? (
              <Badge className="bg-green-600 hover:bg-green-700 text-white border-none rounded-none text-[9px] uppercase font-black flex items-center gap-1 py-1 px-2">
                <Cloud size={10} className="animate-bounce" /> {activeOffers.length} {currentDict.live_firestore}
              </Badge>
            ) : (
              <Badge className="bg-zinc-800 hover:bg-zinc-900 text-white border-none rounded-none text-[9px] uppercase font-black py-1 px-2">
                {activeOffers.length} {currentDict.local_offers}
              </Badge>
            )}
          </div>
        </div>

        <div className="overflow-hidden border border-zinc-100 dark:border-zinc-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500">{currentDict.store}</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500">{currentDict.price}</th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-wider text-zinc-500">{currentDict.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {sortedOffers.map((offer, index) => {
                const isBest = offer.price === lowestPrice;
                return (
                  <tr 
                    key={`${offer.storeName}-${index}`} 
                    className={`group transition-colors ${isBest ? 'bg-green-50/30 dark:bg-green-900/5' : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30'}`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-black dark:text-white uppercase tracking-tight">
                          {offer.storeName}
                        </span>
                        {isBest && (
                          <div className="flex items-center gap-1 text-[9px] font-black uppercase text-green-600 bg-green-100 dark:bg-green-950 px-1.5 py-0.5 animate-pulse">
                            <TrendingDown size={10} />
                            {currentDict.best_price}
                          </div>
                        )}
                      </div>
                      {offer.shippingPrice === 0 ? (
                        <span className="text-[9px] uppercase font-bold text-green-600">{currentDict.free_shipping}</span>
                      ) : offer.shippingPrice ? (
                        <span className="text-[9px] uppercase font-bold text-zinc-400">{currentDict.shipping}: R$ {offer.shippingPrice.toFixed(2)}</span>
                      ) : (
                        <span className="text-[9px] uppercase font-bold text-zinc-400">{currentDict.shipping_consult}</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className={`font-black text-base ${isBest ? 'text-green-600' : 'text-black dark:text-white'}`}>
                          R$ {offer.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        {offer.shippingPrice !== undefined && (
                          <span className="text-[10px] text-zinc-400">
                            {currentDict.total}: R$ {(offer.price + offer.shippingPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button 
                        asChild
                        size="sm"
                        className={`rounded-none font-black uppercase text-[10px] tracking-widest ${
                          isBest 
                            ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-green-600 dark:hover:bg-green-600' 
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        <a href={offer.url} target="_blank" rel="noopener noreferrer">
                          {currentDict.go_to_store}
                          <ExternalLink size={12} className="ml-1" />
                        </a>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-tight mt-2 flex items-center gap-1">
          <ShoppingCart size={10} />
          {currentDict.note}
        </p>
      </div>
    );
  }

  // 2. STANDALONE PORTAL MODE
  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
      <AnimatePresence mode="wait">
        {!selectedProduct ? (
          // Grid & Selector view
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="space-y-10"
          >
            {onBack && (
              <div className="flex items-center gap-2 text-[9px] font-mono font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">
                <button 
                  onClick={onBack} 
                  className="hover:text-red-500 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 bg-transparent border-none p-0 outline-none"
                >
                  <ArrowLeft size={10} className="-mt-0.5" /> DIÁRIO DOS OSS.OS
                </button>
                <span>/</span>
                <span className="text-black dark:text-white">{currentDict.mode_prices}</span>
              </div>
            )}

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6 bg-zinc-50/50 dark:bg-zinc-950/20">
              <button
                onClick={() => setComparatorMode('prices')}
                className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-t-2 border-r border-l border-b-0 transition-all rounded-none flex items-center gap-2 ${
                  comparatorMode === 'prices'
                    ? 'border-t-green-600 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-black dark:text-white font-black'
                    : 'border-t-transparent border-transparent text-zinc-400 hover:text-black dark:hover:text-white bg-transparent'
                }`}
              >
                <DollarSign size={14} className={comparatorMode === 'prices' ? 'text-green-600' : ''} />
                {currentDict.mode_prices}
              </button>
              <button
                onClick={() => setComparatorMode('tactical')}
                className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-t-2 border-r border-l border-b-0 transition-all rounded-none flex items-center gap-2 ${
                  comparatorMode === 'tactical'
                    ? 'border-t-red-600 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-black dark:text-white font-black'
                    : 'border-t-transparent border-transparent text-zinc-400 hover:text-black dark:hover:text-white bg-transparent'
                }`}
              >
                <Scale size={14} className={comparatorMode === 'tactical' ? 'text-red-600' : ''} />
                {currentDict.mode_tactical}
              </button>
            </div>

            {comparatorMode === 'prices' ? (
              <>
                {/* Header Hero Section */}
                <div className="border border-zinc-200 dark:border-zinc-800 p-8 md:p-12 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Scale size={320} className="text-zinc-400" strokeWidth={1} />
                  </div>
                  <div className="max-w-2xl relative z-10 space-y-4">
                    <Badge className="bg-green-600 text-white rounded-none border-none py-1 px-3 text-[9px] uppercase font-black tracking-widest">
                      <Sparkles size={10} className="mr-1 animate-pulse" /> {currentDict.bjj_portal_title}
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic -skew-x-6 text-black dark:text-white">
                      {currentDict.compare_title}
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium max-w-lg leading-relaxed">
                      {currentDict.compare_subtitle}
                    </p>
                  </div>
                </div>

                {/* Controls Bar */}
                <div className="space-y-4 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                  <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder={currentDict.search_placeholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 rounded-none text-sm transition-all"
                      />
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-[9px] font-mono font-black uppercase text-zinc-400 mr-1 flex items-center gap-1">
                        <Filter size={10} /> Categoria:
                      </span>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1.5 text-[10px] uppercase font-black tracking-widest border transition-all rounded-none cursor-pointer ${
                            selectedCategory === cat
                              ? 'bg-green-600 border-green-600 text-white'
                              : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Affiliate Marketplace Stores Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                    <span className="text-[9px] font-mono font-black uppercase text-zinc-400 mr-1 flex items-center gap-1">
                      <Store size={10} /> Plataforma:
                    </span>
                    {affiliateStores.map((st) => (
                      <button
                        key={st}
                        onClick={() => setSelectedStore(st)}
                        className={`px-3 py-1 text-[9px] uppercase font-black tracking-wider border transition-all rounded-none cursor-pointer flex items-center gap-1 ${
                          selectedStore === st
                            ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                            : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        {st === 'Mercado Livre' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />}
                        {st === 'Amazon' && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />}
                        {st === 'TikTok Shop' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />}
                        {st === 'Shein' && <span className="w-1.5 h-1.5 rounded-full bg-pink-500 inline-block" />}
                        {st === 'Shopee' && <span className="w-1.5 h-1.5 rounded-full bg-orange-600 inline-block" />}
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Durability & Annual Savings Calculator Section */}
                <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden my-8 shadow-sm">
                  {/* Header Bar */}
                  <div 
                    onClick={() => setIsDurabilityCalculatorOpen(!isDurabilityCalculatorOpen)}
                    className="p-5 bg-gradient-to-r from-zinc-900 via-zinc-900 to-black text-white flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 border border-green-500/40 text-green-400">
                        <TrendingDown size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black uppercase tracking-wider text-white">
                            {currentDict.durability_calculator_title}
                          </h3>
                          <Badge className="bg-green-600 text-white border-none rounded-none text-[8px] uppercase font-black py-0.5 px-2">
                            Algoritmo OSS.OS
                          </Badge>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 hidden sm:block">
                          {currentDict.durability_calculator_subtitle}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-none cursor-pointer"
                    >
                      {isDurabilityCalculatorOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </Button>
                  </div>

                  {isDurabilityCalculatorOpen && (
                    <div className="p-6 space-y-6">
                      {/* Controls & Metrics Row */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        {/* Interactive Controls */}
                        <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900/40 p-5 border border-zinc-100 dark:border-zinc-800 space-y-5 flex flex-col justify-between">
                          <div className="space-y-4">
                            <div>
                              <label className="text-[10px] font-mono font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5 mb-2">
                                <Calendar size={12} className="text-green-600" />
                                {currentDict.training_frequency}
                              </label>
                              <div className="grid grid-cols-3 gap-2">
                                {([2, 4, 6] as const).map((days) => (
                                  <button
                                    key={days}
                                    onClick={() => setTrainingDays(days)}
                                    className={`py-2 px-2 text-[10px] font-black uppercase tracking-widest border transition-all rounded-none cursor-pointer ${
                                      trainingDays === days
                                        ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                                        : 'bg-white dark:bg-zinc-950 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:text-black dark:hover:text-white'
                                    }`}
                                  >
                                    {days}x / semana
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-mono font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5 mb-2">
                                <ShieldCheck size={12} className="text-green-600" />
                                {currentDict.gear_scope}
                              </label>
                              <div className="grid grid-cols-3 gap-2">
                                <button
                                  onClick={() => setSavingsScope('all')}
                                  className={`py-2 px-1 text-[9px] font-black uppercase tracking-wider border transition-all rounded-none cursor-pointer ${
                                    savingsScope === 'all'
                                      ? 'bg-green-600 text-white border-green-600'
                                      : 'bg-white dark:bg-zinc-950 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:text-black dark:hover:text-white'
                                  }`}
                                >
                                  Kit Completo
                                </button>
                                <button
                                  onClick={() => setSavingsScope('kimonos')}
                                  className={`py-2 px-1 text-[9px] font-black uppercase tracking-wider border transition-all rounded-none cursor-pointer ${
                                    savingsScope === 'kimonos'
                                      ? 'bg-green-600 text-white border-green-600'
                                      : 'bg-white dark:bg-zinc-950 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:text-black dark:hover:text-white'
                                  }`}
                                >
                                  Kimonos
                                </button>
                                <button
                                  onClick={() => setSavingsScope('rashguards')}
                                  className={`py-2 px-1 text-[9px] font-black uppercase tracking-wider border transition-all rounded-none cursor-pointer ${
                                    savingsScope === 'rashguards'
                                      ? 'bg-green-600 text-white border-green-600'
                                      : 'bg-white dark:bg-zinc-950 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:text-black dark:hover:text-white'
                                  }`}
                                >
                                  Rashguards
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80 text-[10px] text-zinc-500 flex items-center gap-2">
                            <Info size={14} className="text-green-600 shrink-0" />
                            <span>
                              Cálculo baseado no desgaste de fibra por treino e média de resenhas verificadas.
                            </span>
                          </div>
                        </div>

                        {/* Calculated Savings Cards */}
                        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Card 1: Annual Savings */}
                          <div className="p-6 bg-green-50/50 dark:bg-green-950/20 border-2 border-green-600 flex flex-col justify-between space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-black uppercase text-green-700 dark:text-green-400 tracking-wider flex items-center gap-1">
                                <DollarSign size={12} />
                                {currentDict.annual_savings}
                              </span>
                              <Badge className="bg-green-600 text-white text-[8px] uppercase font-black">
                                +12 Meses
                              </Badge>
                            </div>

                            <div>
                              <div className="text-3xl md:text-4xl font-black text-green-600 tracking-tight italic">
                                R$ {durabilityMetrics.totalAnnualSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                              <p className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 mt-1">
                                Economizados anualmente ao evitar trocas recorrentes de marcas frágeis.
                              </p>
                            </div>

                            <div className="pt-3 border-t border-green-200 dark:border-green-900/60 flex items-center justify-between text-[10px] text-green-800 dark:text-green-300 font-bold">
                              <span>Média Mensal Salva:</span>
                              <span>R$ {(durabilityMetrics.totalAnnualSavings / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês</span>
                            </div>
                          </div>

                          {/* Card 2: 3-Year Accumulated Savings */}
                          <div className="p-6 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1">
                                <RotateCcw size={12} className="text-green-600" />
                                {currentDict.three_year_savings}
                              </span>
                              <Badge className="bg-zinc-800 dark:bg-zinc-700 text-white text-[8px] uppercase font-black">
                                Longo Prazo
                              </Badge>
                            </div>

                            <div>
                              <div className="text-3xl md:text-4xl font-black text-black dark:text-white tracking-tight italic">
                                R$ {durabilityMetrics.accumulated3YrSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                              <p className="text-[10px] font-medium text-zinc-500 mt-1">
                                Valor acumulado projetado em 36 meses de treinos constantes.
                              </p>
                            </div>

                            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                              <span>Índice Médio C/Mês:</span>
                              <span className="font-bold text-black dark:text-white">R$ {durabilityMetrics.avgCostPerMonth.toFixed(2)}/mês</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Top Recommended Cost-per-Durability Products Grid */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-1.5">
                            <Award size={12} className="text-green-600" />
                            {currentDict.top_cpd_products}
                          </h4>
                          <span className="text-[9px] font-mono text-zinc-400 uppercase">
                            Ordenado por Histórico de Durabilidade
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {durabilityMetrics.topProducts.map((item) => (
                            <div 
                              key={item.product.id}
                              onClick={() => setSelectedProduct(item.product)}
                              className="p-3 border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 hover:border-green-600 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                            >
                              <div className="flex gap-3 items-center">
                                <img 
                                  src={item.product.imageUrl} 
                                  alt={item.product.title} 
                                  className="w-12 h-12 object-cover border border-zinc-100 dark:border-zinc-800 shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-[8px] font-mono font-black text-green-600 uppercase">
                                    Score {item.cpdScore}/10 CPD
                                  </p>
                                  <h5 className="font-black text-xs text-black dark:text-white uppercase truncate group-hover:text-green-600 transition-colors">
                                    {item.product.title}
                                  </h5>
                                  <p className="text-[9px] text-zinc-400 truncate">
                                    R$ {item.bestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} na {item.bestStore}
                                  </p>
                                </div>
                              </div>

                              <div className="p-2 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-900/60 space-y-1 text-[9px]">
                                <div className="flex justify-between text-zinc-500 font-mono">
                                  <span>{currentDict.durability_index}:</span>
                                  <span className="font-bold text-black dark:text-white">~{item.estimatedLifespanMonths} {currentDict.months}</span>
                                </div>
                                <div className="flex justify-between font-bold text-green-600">
                                  <span>{currentDict.cost_per_month}:</span>
                                  <span>R$ {item.costPerMonth.toFixed(2)}/mês</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-24 border border-dashed border-zinc-200 dark:border-zinc-800">
                    <Store className="mx-auto mb-4 text-zinc-300 dark:text-zinc-700" size={48} />
                    <p className="text-zinc-500 italic text-sm">{currentDict.no_products_found}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((prod) => {
                      const simulatedOffers = generateDynamicOffers(prod);
                      const bestOfferPrice = simulatedOffers[0]?.price || prod.price;
                      const bestOfferStore = simulatedOffers[0]?.storeName || 'Parceiros';

                      return (
                        <motion.div
                          key={prod.id}
                          whileHover={{ y: -6 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex flex-col justify-between overflow-hidden relative group"
                        >
                          <div className="relative pt-[100%] bg-zinc-50 dark:bg-zinc-900/40 overflow-hidden border-b border-zinc-100 dark:border-zinc-900">
                            <img
                              src={prod.imageUrl}
                              alt={prod.title}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                              loading="lazy"
                            />
                            <Badge className="absolute top-3 left-3 bg-black dark:bg-white text-white dark:text-black rounded-none border-none uppercase tracking-widest text-[8px] font-black py-1 px-2">
                              {prod.category}
                            </Badge>
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-1">
                              <p className="text-[9px] font-mono font-black text-zinc-400 uppercase tracking-widest">
                                {prod.brand || 'BJJ CORE'}
                              </p>
                              <h3 className="font-black text-base text-black dark:text-white uppercase tracking-tight line-clamp-1 group-hover:text-green-600 transition-colors">
                                {prod.title}
                              </h3>
                            </div>

                            {/* Comparative Quick Details */}
                            <div className="space-y-2 p-3 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-900">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-zinc-400 uppercase">Preço Base</span>
                                <span className="text-zinc-500 line-through text-[11px]">
                                  R$ {prod.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black text-green-600 uppercase flex items-center gap-1">
                                  <TrendingDown size={10} /> Melhor Oferta
                                </span>
                                <span className="text-green-600 font-black text-sm">
                                  R$ {bestOfferPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                              <p className="text-[8px] font-bold text-zinc-400 text-right uppercase">
                                Disponível na {bestOfferStore}
                              </p>
                            </div>

                            <div className="pt-2 flex gap-2">
                              <Button
                                onClick={() => setSelectedProduct(prod)}
                                className="flex-1 rounded-none bg-black dark:bg-white text-white dark:text-black hover:bg-green-600 dark:hover:bg-green-600 font-black uppercase text-[10px] tracking-widest transition-colors py-4"
                              >
                                {currentDict.compare_btn}
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleShare(prod)}
                                className="rounded-none border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-black dark:hover:text-white"
                              >
                                {copiedProductId === prod.id ? (
                                  <Check size={14} className="text-green-600" />
                                ) : (
                                  <Share2 size={14} />
                                )}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <TacticalComparison productList={initialProducts} onBack={onBack} />
            )}
          </motion.div>
        ) : (
          // Comparison Details view (for selected product)
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* Nav Back Button */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Button
                variant="ghost"
                onClick={() => setSelectedProduct(null)}
                className="rounded-none hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase font-black tracking-widest"
              >
                <ArrowLeft size={14} className="mr-2" />
                {currentDict.back_to_list}
              </Button>

              <Button
                variant="outline"
                onClick={() => handleShare(selectedProduct)}
                className="rounded-none border-zinc-200 dark:border-zinc-800 text-[10px] uppercase font-black tracking-widest"
              >
                {copiedProductId === selectedProduct.id ? (
                  <>
                    <Check size={14} className="mr-2 text-green-600" />
                    {currentDict.copied}
                  </>
                ) : (
                  <>
                    <Share2 size={14} className="mr-2" />
                    {currentDict.share}
                  </>
                )}
              </Button>
            </div>

            {/* Comparative View Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Product Details */}
              <div className="lg:col-span-5 border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-6 space-y-6">
                <div className="relative pt-[100%] bg-zinc-50 dark:bg-zinc-900/40 overflow-hidden border border-zinc-100 dark:border-zinc-900">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="space-y-2 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                  <p className="text-[10px] font-mono font-black text-green-600 uppercase tracking-[0.3em]">
                    {selectedProduct.brand || 'BJJ ORIGINAL'} // {selectedProduct.category}
                  </p>
                  <h2 className="text-3xl font-black uppercase tracking-tighter italic -skew-x-6 text-black dark:text-white">
                    {selectedProduct.title}
                  </h2>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Descrição Técnica</h4>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
                    {selectedProduct.description || 'Equipamento de alta resistência para treinamento técnico e campeonatos de Jiu-Jitsu. Testado e homologado pelos melhores atletas.'}
                  </p>
                </div>

                {/* Specs */}
                <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-900 font-mono text-[10px] text-zinc-500">
                  <div className="flex justify-between py-1 border-b border-zinc-50 dark:border-zinc-900/30">
                    <span className="uppercase text-zinc-400">Categoria</span>
                    <span className="font-bold text-black dark:text-white">{selectedProduct.category}</span>
                  </div>
                  {selectedProduct.brand && (
                    <div className="flex justify-between py-1 border-b border-zinc-50 dark:border-zinc-900/30">
                      <span className="uppercase text-zinc-400">Marca</span>
                      <span className="font-bold text-black dark:text-white">{selectedProduct.brand}</span>
                    </div>
                  )}
                  {selectedProduct.size && selectedProduct.size.length > 0 && (
                    <div className="flex justify-between py-1 border-b border-zinc-50 dark:border-zinc-900/30">
                      <span className="uppercase text-zinc-400">Tamanhos Disponíveis</span>
                      <span className="font-bold text-black dark:text-white">{selectedProduct.size.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Comparison Table & Analysis */}
              <div className="lg:col-span-7 space-y-6">
                {/* Recommendation Banner */}
                {lowestOffer && (
                  <div className="border-2 border-green-600 bg-green-50/50 dark:bg-green-950/20 p-5 flex items-start gap-4">
                    <div className="bg-green-600 p-2.5 text-white">
                      <Award size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase tracking-widest text-green-700 dark:text-green-400">
                        {currentDict.best_deal_title}
                      </h4>
                      <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        {currentDict.best_deal_text
                          .replace('{savings}', `R$ ${maxSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
                          .replace('{store}', lowestOffer.storeName)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Specific Product Cost x Durability Analysis Box */}
                {selectedProductDurability && (
                  <div className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-green-600" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white">
                          Análise de Custo por Durabilidade
                        </h4>
                      </div>
                      <Badge className="bg-green-600 text-white rounded-none border-none text-[8px] uppercase font-black">
                        Rating {selectedProductDurability.rating} ★
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800">
                        <span className="text-[8px] font-mono font-black uppercase text-zinc-400 block">
                          Durabilidade Est.
                        </span>
                        <span className="text-sm font-black text-black dark:text-white italic">
                          ~{selectedProductDurability.estimatedLifespanMonths} meses
                        </span>
                      </div>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800">
                        <span className="text-[8px] font-mono font-black uppercase text-zinc-400 block">
                          Custo / Mês
                        </span>
                        <span className="text-sm font-black text-green-600 italic">
                          R$ {selectedProductDurability.costPerMonth.toFixed(2)}
                        </span>
                      </div>

                      <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                        <span className="text-[8px] font-mono font-black uppercase text-green-700 dark:text-green-400 block">
                          Economia Anual
                        </span>
                        <span className="text-sm font-black text-green-600 italic">
                          R$ {selectedProductDurability.annualSavings.toFixed(0)}
                        </span>
                      </div>
                    </div>

                    <p className="text-[9px] text-zinc-400 flex items-center gap-1">
                      <Info size={10} className="text-green-600 shrink-0" />
                      Estimativa de economia em R$ baseada na vida útil estendida no tatame vs marcas frágeis.
                    </p>
                  </div>
                )}

                {/* Comparison Table */}
                <div className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                      Lojas Parceiras & Preços
                    </h3>
                    <div className="flex items-center gap-2">
                      {isDbLoading ? (
                        <span className="text-[9px] text-zinc-400 font-mono flex items-center gap-1 uppercase animate-pulse">
                          <Loader2 size={10} className="animate-spin text-zinc-400" /> {currentDict.syncing}
                        </span>
                      ) : isLiveFromDb ? (
                        <Badge className="bg-green-600 text-white border-none rounded-none text-[9px] uppercase font-black flex items-center gap-1 py-1 px-2">
                          <Cloud size={10} /> {activeOffers.length} {currentDict.live_firestore}
                        </Badge>
                      ) : (
                        <Badge className="bg-zinc-800 text-white border-none rounded-none text-[9px] uppercase font-black py-1 px-2">
                          {activeOffers.length} {currentDict.local_offers}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="overflow-hidden border border-zinc-100 dark:border-zinc-800">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                          <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500">{currentDict.store}</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500">{currentDict.price}</th>
                          <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-wider text-zinc-500">{currentDict.action}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {activeOffers.map((offer, index) => {
                          const isBest = lowestOffer && offer.storeName === lowestOffer.storeName;
                          return (
                            <tr
                              key={`${offer.storeName}-${index}`}
                              className={`group transition-colors ${isBest ? 'bg-green-50/30 dark:bg-green-900/5' : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30'}`}
                            >
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-black dark:text-white uppercase tracking-tight">
                                    {offer.storeName}
                                  </span>
                                  {isBest && (
                                    <div className="flex items-center gap-1 text-[9px] font-black uppercase text-green-600 bg-green-100 dark:bg-green-950 px-1.5 py-0.5 animate-pulse">
                                      <TrendingDown size={10} />
                                      {currentDict.best_price}
                                    </div>
                                  )}
                                </div>
                                {offer.shippingPrice === 0 ? (
                                  <span className="text-[9px] uppercase font-bold text-green-600 flex items-center gap-0.5">
                                    <Truck size={8} /> {currentDict.free_shipping}
                                  </span>
                                ) : offer.shippingPrice ? (
                                  <span className="text-[9px] uppercase font-bold text-zinc-400 flex items-center gap-0.5">
                                    <Truck size={8} /> {currentDict.shipping}: R$ {offer.shippingPrice.toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="text-[9px] uppercase font-bold text-zinc-400 flex items-center gap-0.5">
                                    <Truck size={8} /> {currentDict.shipping_consult}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex flex-col">
                                  <span className={`font-black text-base ${isBest ? 'text-green-600' : 'text-black dark:text-white'}`}>
                                    R$ {offer.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                  {offer.shippingPrice !== undefined && (
                                    <span className="text-[10px] text-zinc-400">
                                      {currentDict.total}: R$ {(offer.price + offer.shippingPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <Button
                                  asChild
                                  size="sm"
                                  className={`rounded-none font-black uppercase text-[10px] tracking-widest ${
                                    isBest
                                      ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-green-600 dark:hover:bg-green-600'
                                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white'
                                  }`}
                                >
                                  <a href={offer.url} target="_blank" rel="noopener noreferrer">
                                    {currentDict.go_to_store}
                                    <ExternalLink size={12} className="ml-1" />
                                  </a>
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-tight mt-4 flex items-center gap-1.5">
                    <Info size={10} />
                    {currentDict.note}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SocialShareModal
        isOpen={isSocialShareModalOpen}
        onClose={() => {
          setIsSocialShareModalOpen(false);
          setShareModalProduct(null);
        }}
        product={shareModalProduct}
      />
    </div>
  );
};

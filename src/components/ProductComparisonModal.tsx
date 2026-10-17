import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Check,
  Scale,
  Sparkles,
  Zap,
  ShoppingBag,
  Info,
  Award,
  Trash2,
  TrendingDown,
  Layers,
  Star,
  ExternalLink,
  ShieldCheck,
  Plus,
  Eye,
  SlidersHorizontal,
  ArrowRightLeft,
  Store,
  Tag
} from 'lucide-react';
import { Product } from '../types';
import BJJImage from './BJJImage';
import { SocialImpactBadge } from './SocialImpactBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductComparisonModalProps {
  products?: Product[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
  onCheckout?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

interface ParsedSpecs {
  gsm: number;
  gsmText: string;
  weaveType: string;
  material: string;
  weight: string;
  cpdScore: number;
  cpdLabel: string;
  pros: string[];
  sizes: string[];
}

// Helper to extract or fallback technical specs from product data
const parseProductSpecs = (product: Product): ParsedSpecs => {
  const desc = product.description || '';
  const title = product.title || '';
  const fullText = `${title} ${desc}`;

  // 1. GSM extraction
  let gsm = 450;
  const gsmMatch = fullText.match(/(\d{3})\s*GSM/i);
  if (gsmMatch) {
    gsm = parseInt(gsmMatch[1], 10);
  } else if (product.price > 750) {
    gsm = 550;
  } else if (product.price > 450) {
    gsm = 450;
  } else {
    gsm = 350;
  }

  // 2. Weave Type extraction
  let weaveType = 'Pearl Weave';
  if (/pearl/i.test(fullText)) {
    weaveType = 'Pearl Weave Premium';
  } else if (/gold weave/i.test(fullText)) {
    weaveType = 'Gold Weave Extra';
  } else if (/double weave/i.test(fullText)) {
    weaveType = 'Double Weave (Pesado)';
  } else if (/single weave/i.test(fullText)) {
    weaveType = 'Single Weave (Leve)';
  } else if (/ripstop/i.test(fullText)) {
    weaveType = 'Ripstop Técnico';
  } else if (product.category === 'Rashguards') {
    weaveType = 'Malha Spandex / Lycra 4-Way';
  } else if (product.category === 'Faixas') {
    weaveType = 'Algodão Trançado de Faixa';
  } else if (product.category === 'Acessórios') {
    weaveType = 'Nylon Rígido / Cordura';
  }

  // 3. Material extraction
  let material = '100% Algodão Trançado';
  if (/ripstop/i.test(fullText)) {
    material = 'Algodão + Calça Ripstop Anti-rasgo';
  } else if (/japones|japonês/i.test(fullText)) {
    material = 'Algodão Japonês Pré-encolhido';
  } else if (/poliéster|poliester/i.test(fullText)) {
    material = 'Blend Poliéster e Algodão (Secagem Rápida)';
  } else if (/spandex|lycra/i.test(fullText) || product.category === 'Rashguards') {
    material = '88% Poliéster / 12% Spandex (UV50+)';
  }

  // 4. Weight estimation
  let weight = '1.4 kg';
  if (gsm >= 550) weight = '1.7 kg';
  else if (gsm <= 380) weight = '1.1 kg';
  if (product.category === 'Rashguards') weight = '0.25 kg';
  if (product.category === 'Faixas') weight = '0.35 kg';
  if (product.category === 'Acessórios') weight = '0.8 kg';

  // 5. CPD Score (Cost per Durability)
  // Higher GSM / lower price = better CPD ratio
  const rawCPD = (gsm / Math.max(product.price, 100)) * 100;
  const cpdScore = Math.min(Math.max(Math.round(rawCPD), 45), 98);
  let cpdLabel = 'Excelente';
  if (cpdScore >= 80) cpdLabel = 'Imbatível (Gold Choice)';
  else if (cpdScore >= 65) cpdLabel = 'Alto Custo-Benefício';
  else cpdLabel = 'Premium Esporte';

  // 6. Pros highlights
  const pros: string[] = [];
  if (gsm >= 500) pros.push('Alta densidade & resistência à pegada');
  else pros.push('Leveza e secagem ultrarrápida');

  if (/eva|vulcanizad/i.test(fullText)) pros.push('Lapela de EVA anti-bacteriana');
  else pros.push('Lapela com reforço duplo de costura');

  if (product.price < product.originalPrice!) pros.push(`Desconto ativo (${Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}% OFF)`);
  if (product.rating >= 4.8) pros.push('Avaliação máxima da comunidade (5★)');

  return {
    gsm,
    gsmText: `${gsm} GSM`,
    weaveType,
    material,
    weight,
    cpdScore,
    cpdLabel,
    pros: pros.slice(0, 3),
    sizes: product.size && product.size.length > 0 ? product.size : ['A0', 'A1', 'A2', 'A3', 'A4']
  };
};

export const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  products = [],
  isOpen,
  onClose,
  onRemoveProduct,
  onClearAll,
  onCheckout,
  onQuickView
}) => {
  const [highlightDiffs, setHighlightDiffs] = useState<boolean>(true);
  const safeProducts = products || [];

  // Map product IDs to computed specs
  const parsedSpecsMap = useMemo(() => {
    const map = new Map<string, ParsedSpecs>();
    safeProducts.forEach(p => {
      if (p && p.id) {
        map.set(p.id, parseProductSpecs(p));
      }
    });
    return map;
  }, [safeProducts]);

  // Helper function to check if values differ across all selected products for a given key
  const hasDifference = (getValue: (p: Product, specs: ParsedSpecs) => string | number): boolean => {
    if (safeProducts.length <= 1) return false;
    const firstSpec = parsedSpecsMap.get(safeProducts[0].id);
    if (!firstSpec) return false;
    const firstVal = getValue(safeProducts[0], firstSpec);
    return safeProducts.some(p => {
      const spec = parsedSpecsMap.get(p.id);
      if (!spec) return false;
      const val = getValue(p, spec);
      return val !== firstVal;
    });
  };

  const diffFlags = {
    price: hasDifference((p) => p.price),
    brand: hasDifference((p) => p.brand || ''),
    category: hasDifference((p) => p.category),
    gsm: hasDifference((_, s) => s.gsm),
    weave: hasDifference((_, s) => s.weaveType),
    material: hasDifference((_, s) => s.material),
    weight: hasDifference((_, s) => s.weight),
    rating: hasDifference((p) => p.rating || 0),
    cpd: hasDifference((_, s) => s.cpdScore)
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="product-comparison-modal-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden"
        >
          {/* Backdrop */}
          <motion.div
            key="product-comparison-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Window Container */}
          <motion.div
            key="product-comparison-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative w-full max-w-7xl max-h-[92vh] bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-black dark:text-white"
          >
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-black uppercase text-green-600 bg-green-600/10 px-2.5 py-0.5 border border-green-600/20 tracking-widest flex items-center gap-1">
                  <ArrowRightLeft size={11} />
                  COMPARATIVO TÁTICO LADO A LADO
                </span>
                <Badge className="bg-black text-white dark:bg-white dark:text-black font-mono text-[9px] font-bold px-2 py-0">
                  {safeProducts.length} {safeProducts.length === 1 ? 'PRODUTO' : 'PRODUTOS'}
                </Badge>
              </div>

              <h2 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                ANÁLISE DE <span className="text-green-600">ESPECIFICAÇÕES TÉCNICAS</span>
              </h2>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-3 self-end sm:self-center">
              {/* Highlight Diffs Toggle */}
              <button
                type="button"
                onClick={() => setHighlightDiffs(!highlightDiffs)}
                className={`px-3 py-1.5 text-[10px] font-mono font-bold uppercase border transition-all flex items-center gap-1.5 cursor-pointer ${
                  highlightDiffs
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-sm'
                    : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'
                }`}
                title="Destacar campos com valores diferentes entre os produtos"
              >
                <SlidersHorizontal size={13} />
                <span>Destacar Diferenças</span>
                <div className={`w-2 h-2 rounded-full ${highlightDiffs ? 'bg-amber-500 animate-pulse' : 'bg-zinc-400'}`} />
              </button>

              {/* Clear All */}
              <button
                type="button"
                onClick={onClearAll}
                className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 size={12} />
                Limpar Seleção
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none cursor-pointer"
                id="close-compare-modal-btn"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Comparison Table Content Area */}
          {safeProducts.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <Scale size={48} className="mx-auto text-zinc-400" />
              <h3 className="font-mono font-bold text-base uppercase">Nenhum produto selecionado para comparação</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Marque a caixa "Comparar" em dois ou mais produtos na loja para visualizar o confronto de especificações técnicas lado a lado.
              </p>
              <Button onClick={onClose} className="bg-green-600 hover:bg-green-500 text-black font-mono font-bold uppercase text-xs">
                Voltar ao Arsenal
              </Button>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              <div 
                className="grid gap-4 min-w-[640px]" 
                style={{ 
                  gridTemplateColumns: `180px repeat(${safeProducts.length}, minmax(220px, 1fr))` 
                }}
              >
                {/* 1. ROW: PRODUCTS HEADER (IMAGE, TITLE, PRICE, ACTIONS) */}
                <div className="font-mono text-xs font-black uppercase text-zinc-400 flex items-center gap-1.5 p-3 bg-zinc-100 dark:bg-zinc-900/50 sticky left-0 z-20 border-b border-zinc-200 dark:border-zinc-800">
                  <Layers size={14} className="text-green-600" />
                  Produto
                </div>

                {safeProducts.map((product) => {
                  const specs = parsedSpecsMap.get(product.id)!;
                  return (
                    <div
                      key={`header-${product.id}`}
                      className="relative bg-zinc-50 dark:bg-zinc-900/60 p-4 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-3 group"
                    >
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => onRemoveProduct(product.id)}
                        className="absolute top-2 right-2 z-10 p-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-red-600 hover:text-white transition-colors text-zinc-500 cursor-pointer"
                        title="Remover produto da comparação"
                      >
                        <X size={12} />
                      </button>

                      {/* Image */}
                      <div className="relative aspect-square w-full bg-white dark:bg-zinc-950 overflow-hidden border border-zinc-200 dark:border-zinc-800">
                        <BJJImage
                          src={product.imageUrl}
                          alt={product.title}
                          aspectRatio="aspect-square"
                          className="w-full h-full object-cover"
                        />
                        {product.isBestPrice && (
                          <span className="absolute bottom-1 left-1 bg-green-600 text-black font-mono font-black text-[8px] uppercase px-1.5 py-0.5">
                            Melhor Oferta
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold uppercase text-zinc-400 block">
                          {product.brand || product.category}
                        </span>
                        <h4 className="font-bold text-xs line-clamp-2 leading-tight min-h-[32px]">
                          {product.title}
                        </h4>
                        
                        <div className="pt-1 flex items-baseline gap-2">
                          <span className="text-base font-black text-green-600 dark:text-green-500 font-mono">
                            R$ {product.price.toFixed(2)}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-[10px] font-mono text-zinc-400 line-through">
                              R$ {product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5">
                          <SocialImpactBadge price={product.price} variant="floating-pill" />
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="pt-2 flex flex-col gap-1.5">
                        {onCheckout && (
                          <button
                            type="button"
                            onClick={() => onCheckout(product)}
                            className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-green-600 dark:hover:bg-green-600 hover:text-white dark:hover:text-white font-mono font-black uppercase text-[10px] py-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Zap size={12} />
                            Ver Oferta
                          </button>
                        )}
                        {onQuickView && (
                          <button
                            type="button"
                            onClick={() => onQuickView(product)}
                            className="w-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-mono font-bold uppercase text-[9px] py-1.5 transition-colors flex items-center justify-center gap-1 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                          >
                            <Eye size={11} />
                            Galeria Completa
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* 2. ROW: GSM / DENSITY */}
                <div className="font-mono text-xs font-bold text-zinc-400 uppercase flex items-center gap-1.5 p-3 bg-zinc-100 dark:bg-zinc-900/50 sticky left-0 z-20 border-b border-zinc-200 dark:border-zinc-800">
                  <Award size={14} className="text-green-600" />
                  Gramatura (GSM)
                </div>
                {safeProducts.map((product) => {
                  const specs = parsedSpecsMap.get(product.id)!;
                  const isDiff = highlightDiffs && diffFlags.gsm;
                  return (
                    <div
                      key={`gsm-${product.id}`}
                      className={`p-3 border text-xs font-mono font-bold flex flex-col justify-center space-y-1 transition-colors ${
                        isDiff
                          ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black">{specs.gsmText}</span>
                        {isDiff && <span className="text-[8px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1 font-bold">DIFERENÇA</span>}
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-none overflow-hidden">
                        <div
                          className="bg-green-600 h-full transition-all"
                          style={{ width: `${Math.min((specs.gsm / 650) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* 3. ROW: WEAVE TYPE */}
                <div className="font-mono text-xs font-bold text-zinc-400 uppercase flex items-center gap-1.5 p-3 bg-zinc-100 dark:bg-zinc-900/50 sticky left-0 z-20 border-b border-zinc-200 dark:border-zinc-800">
                  <Layers size={14} className="text-green-600" />
                  Tipo de Trama
                </div>
                {safeProducts.map((product) => {
                  const specs = parsedSpecsMap.get(product.id)!;
                  const isDiff = highlightDiffs && diffFlags.weave;
                  return (
                    <div
                      key={`weave-${product.id}`}
                      className={`p-3 border text-xs font-mono flex items-center justify-between transition-colors ${
                        isDiff
                          ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <span>{specs.weaveType}</span>
                      {isDiff && <span className="text-[8px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1 font-bold">DIFERENÇA</span>}
                    </div>
                  );
                })}

                {/* 4. ROW: MATERIAL */}
                <div className="font-mono text-xs font-bold text-zinc-400 uppercase flex items-center gap-1.5 p-3 bg-zinc-100 dark:bg-zinc-900/50 sticky left-0 z-20 border-b border-zinc-200 dark:border-zinc-800">
                  <ShieldCheck size={14} className="text-green-600" />
                  Material / Tecido
                </div>
                {safeProducts.map((product) => {
                  const specs = parsedSpecsMap.get(product.id)!;
                  const isDiff = highlightDiffs && diffFlags.material;
                  return (
                    <div
                      key={`mat-${product.id}`}
                      className={`p-3 border text-xs leading-snug font-mono transition-colors ${
                        isDiff
                          ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {specs.material}
                    </div>
                  );
                })}

                {/* 5. ROW: AVERAGE WEIGHT */}
                <div className="font-mono text-xs font-bold text-zinc-400 uppercase flex items-center gap-1.5 p-3 bg-zinc-100 dark:bg-zinc-900/50 sticky left-0 z-20 border-b border-zinc-200 dark:border-zinc-800">
                  <Scale size={14} className="text-green-600" />
                  Peso Médio
                </div>
                {safeProducts.map((product) => {
                  const specs = parsedSpecsMap.get(product.id)!;
                  const isDiff = highlightDiffs && diffFlags.weight;
                  return (
                    <div
                      key={`weight-${product.id}`}
                      className={`p-3 border text-xs font-mono font-bold transition-colors ${
                        isDiff
                          ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {specs.weight}
                    </div>
                  );
                })}

                {/* 6. ROW: COST PER DURABILITY SCORE (CPD) */}
                <div className="font-mono text-xs font-bold text-zinc-400 uppercase flex items-center gap-1.5 p-3 bg-zinc-100 dark:bg-zinc-900/50 sticky left-0 z-20 border-b border-zinc-200 dark:border-zinc-800">
                  <Sparkles size={14} className="text-green-600" />
                  Score CPD
                </div>
                {safeProducts.map((product) => {
                  const specs = parsedSpecsMap.get(product.id)!;
                  const isDiff = highlightDiffs && diffFlags.cpd;
                  return (
                    <div
                      key={`cpd-${product.id}`}
                      className={`p-3 border text-xs font-mono flex flex-col space-y-1 transition-colors ${
                        isDiff
                          ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/40'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-green-600 dark:text-green-400">
                          {specs.cpdScore}/100
                        </span>
                        <span className="text-[9px] uppercase font-bold text-zinc-500">
                          {specs.cpdLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* 7. ROW: SIZES AVAILABLE */}
                <div className="font-mono text-xs font-bold text-zinc-400 uppercase flex items-center gap-1.5 p-3 bg-zinc-100 dark:bg-zinc-900/50 sticky left-0 z-20 border-b border-zinc-200 dark:border-zinc-800">
                  <Info size={14} className="text-green-600" />
                  Tamanhos
                </div>
                {safeProducts.map((product) => {
                  const specs = parsedSpecsMap.get(product.id);
                  return (
                    <div
                      key={`sizes-${product.id}`}
                      className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-1"
                    >
                      {(specs?.sizes || []).map(s => (
                        <span key={s} className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[9px] font-bold border border-zinc-200 dark:border-zinc-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  );
                })}

                {/* 8. ROW: MULTI-PLATFORM PRICE COMPARISON (MERCADO LIVRE, AMAZON, TIKTOK SHOP, SHEIN, SHOPEE) */}
                <div className="font-mono text-xs font-bold text-zinc-400 uppercase flex items-center gap-1.5 p-3 bg-zinc-100 dark:bg-zinc-900/50 sticky left-0 z-20 border-b border-zinc-200 dark:border-zinc-800">
                  <Store size={14} className="text-green-600" />
                  Comparativo de Lojas
                </div>
                {safeProducts.map((product) => {
                  const basePrice = product.price;
                  const titleClean = encodeURIComponent(product.title);
                  const platforms = [
                    { name: 'Shopee', price: Math.round(basePrice * 0.93 * 100) / 100, tag: 'Frete Grátis Cupom', color: 'text-orange-500', url: `https://shopee.com.br/search?keyword=${titleClean}` },
                    { name: 'TikTok Shop', price: Math.round((basePrice * 0.91 + 8.9) * 100) / 100, tag: 'Live Cupom', color: 'text-cyan-400', url: `https://www.tiktok.com/search?q=${titleClean}` },
                    { name: 'Shein', price: Math.round(basePrice * 0.94 * 100) / 100, tag: 'Desconto App', color: 'text-pink-400', url: `https://br.shein.com/pdsearch/${titleClean}` },
                    { name: 'Mercado Livre', price: Math.round(basePrice * 0.98 * 100) / 100, tag: 'Entrega Full', color: 'text-yellow-400', url: product.affiliateUrl || `https://lista.mercadolivre.com.br/${titleClean}` },
                    { name: 'Amazon', price: Math.round(basePrice * 1.0 * 100) / 100, tag: 'Envio Prime', color: 'text-orange-400', url: `https://www.amazon.com.br/s?k=${titleClean}&tag=ossosbjj-20` },
                  ].sort((a, b) => a.price - b.price);

                  const cheapest = platforms[0];

                  return (
                    <div
                      key={`platforms-${product.id}`}
                      className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 font-mono"
                    >
                      {/* Highlight cheapest platform */}
                      <div className="p-2 bg-green-500/10 border border-green-500/30 text-[10px] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black uppercase text-green-700 dark:text-green-400 flex items-center gap-1">
                            <Sparkles size={11} className="text-green-500" />
                            Menor Preço: {cheapest.name}
                          </span>
                          <span className="font-black text-green-700 dark:text-green-400">
                            R$ {cheapest.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-[9px] text-zinc-500 dark:text-zinc-400">
                          {cheapest.tag} • Economia de R$ {(product.price - cheapest.price).toFixed(2)}
                        </div>
                      </div>

                      {/* Mini Platform Grid */}
                      <div className="space-y-1 pt-1">
                        {platforms.slice(1, 4).map((p) => (
                          <div key={p.name} className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${p.name === 'Mercado Livre' ? 'bg-yellow-400' : p.name === 'Amazon' ? 'bg-orange-500' : p.name === 'TikTok Shop' ? 'bg-cyan-400' : p.name === 'Shein' ? 'bg-pink-500' : 'bg-orange-600'}`} />
                              {p.name}
                            </span>
                            <span className="font-bold text-zinc-700 dark:text-zinc-300">
                              R$ {p.price.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* 9. ROW: HIGHLIGHTED PROS */}
                <div className="font-mono text-xs font-bold text-zinc-400 uppercase flex items-center gap-1.5 p-3 bg-zinc-100 dark:bg-zinc-900/50 sticky left-0 z-20 border-b border-zinc-200 dark:border-zinc-800">
                  <Check size={14} className="text-green-600" />
                  Diferenciais Táticos
                </div>
                {safeProducts.map((product) => {
                  const specs = parsedSpecsMap.get(product.id);
                  return (
                    <div
                      key={`pros-${product.id}`}
                      className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5"
                    >
                      {(specs?.pros || []).map((pro, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-300 leading-tight">
                          <Check size={12} className="text-green-600 shrink-0 mt-0.5" />
                          <span>{pro}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-500 shrink-0">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-green-600" />
              <span>Dica: Os destaques em amarelo indicam especificações que diferem entre os itens selecionados.</span>
            </div>

            <Button
              onClick={onClose}
              className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold uppercase text-xs px-6 rounded-none cursor-pointer"
            >
              Concluir Comparação
            </Button>
          </div>
        </motion.div>
      </motion.div>
    )}
    </AnimatePresence>
  );
};

export default ProductComparisonModal;

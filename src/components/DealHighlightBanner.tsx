import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Flame, ShoppingBag, Zap, Tag, ArrowRight, ShieldCheck, Clock, Percent, Star, Check, Scale } from 'lucide-react';
import { Product } from '../types';
import BJJImage from './BJJImage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/src/lib/currency';

interface DealHighlightBannerProps {
  productList: Product[];
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onToggleCompare?: (product: Product) => void;
  isComparing?: boolean;
}

export const DealHighlightBanner: React.FC<DealHighlightBannerProps> = ({
  productList,
  onSelectProduct,
  onAddToCart,
  onToggleCompare,
  isComparing = false,
}) => {
  const { t, i18n } = useTranslation();
  // Find the deal with the highest percentage discount
  const topDeal = useMemo(() => {
    if (!productList || productList.length === 0) return null;

    let maxDiscount = -1;
    let bestProduct: Product | null = null;

    for (const p of productList) {
      if (p.originalPrice && p.originalPrice > p.price) {
        const discountPct = ((p.originalPrice - p.price) / p.originalPrice) * 100;
        if (discountPct > maxDiscount) {
          maxDiscount = discountPct;
          bestProduct = p;
        }
      }
    }

    // Fallback if no discount exists, pick best price or first
    if (!bestProduct) {
      bestProduct = productList.find(p => p.isBestPrice) || productList[0];
    }

    return bestProduct;
  }, [productList]);

  if (!topDeal) return null;

  const originalPrice = topDeal.originalPrice || topDeal.price * 1.25;
  const discountPct = Math.round(((originalPrice - topDeal.price) / originalPrice) * 100);
  const savingsAmount = (originalPrice - topDeal.price).toFixed(2);

  const dealReviews = topDeal.reviews || [];
  const averageRating = dealReviews.length > 0 
    ? Math.round((dealReviews.reduce((acc, r) => acc + r.rating, 0) / dealReviews.length) * 10) / 10 
    : (topDeal.rating || 5.0);

  return (
    <section className="relative w-full max-w-7xl mx-auto my-6 px-4 sm:px-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-black to-zinc-950 text-white border-2 border-red-600/80 shadow-xl">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />
        
        {/* Background glow behind image */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center p-6 sm:p-8 md:p-10">
          
          {/* Left Column: Offer Badges, Title & Value Prop (Col 7) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Header Tag & Rating */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 bg-[#cc0000] text-white font-mono text-[10px] font-black uppercase px-2.5 py-1 tracking-wider">
                <Flame size={13} className="text-amber-300" />
                {t('deal.super_offer', { defaultValue: 'SUPER OFERTA' })} • {discountPct}% OFF
              </span>

              {/* Average Rating */}
              <div 
                onClick={() => onSelectProduct?.(topDeal)} 
                className="flex items-center gap-1.5 bg-zinc-900/90 text-zinc-300 px-2.5 py-1 border border-zinc-800 font-mono text-[10px] cursor-pointer hover:border-amber-500/60 transition-colors"
                title={t('product.reviews', { defaultValue: 'Avaliações dos atletas' })}
              >
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((st) => (
                    <Star key={st} size={11} className={st <= Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "fill-zinc-700 text-zinc-700"} />
                  ))}
                </div>
                <span className="font-mono font-black text-amber-300">{averageRating.toFixed(1)}</span>
                <span className="text-zinc-500 font-mono text-[9px]">({dealReviews.length})</span>
              </div>
            </div>

            {/* Title & Brand */}
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest block">
                {topDeal.brand || topDeal.category}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white leading-tight">
                {topDeal.title}
              </h2>
            </div>

            {/* Description Snippet */}
            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 max-w-2xl leading-relaxed font-sans font-light">
              {topDeal.description}
            </p>

            {/* Price Box & Savings Callout */}
            <div className="pt-2 flex flex-wrap items-end gap-4 p-4 bg-zinc-900/80 border border-zinc-800/80">
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase block font-semibold">
                  {t('product.best_price', { defaultValue: 'Preço Promocional' })}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-green-400 tracking-tight">
                    {formatPrice(topDeal.price, i18n.language)}
                  </span>
                  <span className="text-sm font-mono text-zinc-500 line-through">
                    {formatPrice(originalPrice, i18n.language)}
                  </span>
                </div>
              </div>

              <div className="border-l border-zinc-800 pl-4 py-1">
                <span className="text-[9px] font-mono uppercase text-zinc-400 font-bold block">
                  {t('deal.savings', { defaultValue: 'ECONOMIA' })}
                </span>
                <span className="text-sm font-bold font-mono text-white">
                  {formatPrice(originalPrice - topDeal.price, i18n.language)}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                onClick={() => onSelectProduct ? onSelectProduct(topDeal) : null}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-black font-mono font-black uppercase text-xs tracking-wider px-6 py-5 rounded-none cursor-pointer transition-all flex items-center justify-center gap-2"
                id="deal-banner-view-btn"
              >
                <Zap size={14} fill="black" />
                {t('product.buy_now', { defaultValue: 'Garantir Oferta' })}
                <ArrowRight size={14} />
              </Button>

              {onAddToCart && (
                <Button
                  onClick={() => onAddToCart(topDeal)}
                  variant="outline"
                  className="w-full sm:w-auto bg-zinc-900 hover:bg-white hover:text-black text-white border-zinc-700 font-mono font-bold uppercase text-xs px-5 py-5 rounded-none cursor-pointer transition-colors flex items-center justify-center gap-2"
                  id="deal-banner-cart-btn"
                >
                  <ShoppingBag size={14} />
                  {t('product.add_to_cart', { defaultValue: 'Adicionar à Sacola' })}
                </Button>
              )}
            </div>

            {/* Guarantees */}
            <div className="pt-1 flex items-center gap-2 text-[10px] font-mono text-zinc-400">
              <ShieldCheck size={13} className="text-green-500" />
              <span>{t('consent.text2', { defaultValue: 'Vendedor Homologado & Produto Original' })}</span>
            </div>

          </div>

          {/* Right Column: Product Spotlight Image (Col 5) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm aspect-square bg-zinc-950 border-2 border-zinc-800 p-3 group overflow-hidden shadow-xl">
              <BJJImage
                src={topDeal.imageUrl}
                alt={topDeal.title}
                aspectRatio="aspect-square"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Platform tag */}
              <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-md text-green-400 font-mono font-bold text-[10px] uppercase px-2.5 py-1 border border-zinc-800">
                {topDeal.platform}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DealHighlightBanner;

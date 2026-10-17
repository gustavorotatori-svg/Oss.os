import React, { useState, useMemo } from 'react';
import { Star, MessageSquare, User, Trash2, Shield, Calendar, Check, ArrowDownAZ } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Review } from '@/src/types';
import { ReviewForm } from './ReviewForm';

interface ProductReviewsProps {
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'date'>) => Promise<any> | any;
  isLoggedIn?: boolean;
  onSignIn?: () => void;
  currentUserId?: string;
  currentUserDisplayName?: string;
  onDeleteReview?: (reviewId: string) => void;
  purchasedProductIds?: string[];
  productId: string;
  onAcquireProduct?: () => void;
  isAdmin?: boolean;
  onHighlightReview?: (reviewId: string, isFeatured: boolean) => void;
}

const BELT_COLORS = [
  { level: 1, name: 'Faixa Branca (Graduação Básica / Iniciante)', colorClass: 'bg-zinc-100 text-zinc-850', borderClass: 'border-zinc-300 dark:border-zinc-700', sleeveClass: 'bg-black', textColor: 'text-zinc-500' },
  { level: 2, name: 'Faixa Azul (Graduação Intermediária)', colorClass: 'bg-blue-600 text-white', borderClass: 'border-blue-700', sleeveClass: 'bg-black', textColor: 'text-blue-600 dark:text-blue-400' },
  { level: 3, name: 'Faixa Roxa (Graduação Avançada)', colorClass: 'bg-indigo-800 text-white', borderClass: 'border-indigo-900', sleeveClass: 'bg-black', textColor: 'text-purple-600 dark:text-purple-400' },
  { level: 4, name: 'Faixa Marrom (Graduação Avançada Superior)', colorClass: 'bg-yellow-900 text-white', borderClass: 'border-yellow-950', sleeveClass: 'bg-black', textColor: 'text-amber-800 dark:text-amber-500' },
  { level: 5, name: 'Faixa Preta (Nível de Mestre / Padrão OSS)', colorClass: 'bg-zinc-950 text-white border-red-600', borderClass: 'border-zinc-900', sleeveClass: 'bg-red-600', textColor: 'text-red-600 dark:text-red-400' },
];

export const ProductReviews: React.FC<ProductReviewsProps> = ({ 
  reviews, 
  onAddReview, 
  isLoggedIn, 
  onSignIn,
  currentUserId,
  currentUserDisplayName,
  onDeleteReview,
  purchasedProductIds = [],
  productId,
  onAcquireProduct,
  isAdmin = false,
  onHighlightReview
}) => {
  const [sortOrder, setSortOrder] = useState<'newest' | 'highest' | 'lowest'>('newest');

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => Math.round(r.rating) === stars).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { stars, count, percentage };
  });

  const getBeltLabel = (rating: number) => {
    const rounded = Math.round(rating);
    const found = BELT_COLORS.find(b => b.level === rounded);
    return found ? found.name : 'Sem Graduação';
  };

  const sortedReviews = useMemo(() => {
    const reviewsCopy = [...reviews];
    
    // Sort featuring first, then applying selected sortOrder
    return reviewsCopy.sort((a, b) => {
      // Primary: Featured reviews go first
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;

      // Secondary: User selected sortOrder
      if (sortOrder === 'highest') {
        return b.rating - a.rating;
      }
      if (sortOrder === 'lowest') {
        return a.rating - b.rating;
      }
      
      // Newest first sorting (parse dd/mm/yyyy or yyyy-mm-dd dates)
      try {
        const partsA = a.date.includes('/') ? a.date.split('/') : a.date.split('-');
        const partsB = b.date.includes('/') ? b.date.split('/') : b.date.split('-');
        
        if (partsA.length === 3 && partsB.length === 3) {
          const dateA = a.date.includes('/')
            ? new Date(parseInt(partsA[2]), parseInt(partsA[1]) - 1, parseInt(partsA[0]))
            : new Date(parseInt(partsA[0]), parseInt(partsA[1]) - 1, parseInt(partsA[2]));
          const dateB = b.date.includes('/')
            ? new Date(parseInt(partsB[2]), parseInt(partsB[1]) - 1, parseInt(partsB[0]))
            : new Date(parseInt(partsB[0]), parseInt(partsB[1]) - 1, parseInt(partsB[2]));
          return dateB.getTime() - dateA.getTime();
        }
      } catch (e) {
        // Fallback
      }
      return 0;
    });
  }, [reviews, sortOrder]);

  const renderBeltBar = (rating: number) => {
    const roundedRating = Math.round(rating);
    const belt = BELT_COLORS.find(b => b.level === roundedRating) || BELT_COLORS[0];

    return (
      <div className={`flex flex-col sm:flex-row sm:items-center gap-3`}>
        <div className={`relative h-6 w-36 ${belt.level === 5 ? 'bg-zinc-950 border-2 border-red-600' : `${belt.colorClass} border`} flex items-center shadow-md overflow-hidden`}>
          <div className={`absolute right-0 top-0 bottom-0 w-10 ${belt.sleeveClass} flex items-center justify-center gap-[3px] px-1`}>
            <div className="w-[1.5px] h-4 bg-zinc-100" />
            <div className="w-[1.5px] h-4 bg-zinc-100" />
            <div className="w-[1.5px] h-4 bg-zinc-100" />
            <div className="w-[1.5px] h-4 bg-zinc-100" />
          </div>
          <div className="absolute right-10 top-0 bottom-0 w-[1px] bg-white opacity-40" />
          <span className="text-[7.5px] pl-2 font-black tracking-widest uppercase font-mono truncate text-white mix-blend-difference">
            OSSS
          </span>
        </div>
        <span className={`text-[9px] font-mono font-black uppercase tracking-wider ${belt.textColor}`}>
          {belt.name}
        </span>
      </div>
    );
  };

  const hasPurchasedCurrent = purchasedProductIds.includes(productId);

  return (
    <div className="space-y-8">
      {/* Dojo Grading Summary Shield */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-none relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-zinc-150 dark:bg-zinc-850/20 rotate-45 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center flex-1 w-full relative z-10">
          {/* Main Average Rating Indicator */}
          <div className="bg-black dark:bg-white text-white dark:text-black p-5 text-center min-w-[120px] shrink-0 border border-zinc-800 dark:border-zinc-200 shadow-xl w-full sm:w-auto">
            <span className="text-4xl font-black font-mono leading-none tracking-tighter">
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
            </span>
            <div className="flex items-center justify-center gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={10} 
                  className={star <= Math.round(averageRating) ? "fill-current text-green-600 dark:text-green-500" : "opacity-20"} 
                />
              ))}
            </div>
            <p className="text-[7px] font-mono font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mt-2">
              GRADUAÇÃO DO TATAME
            </p>
          </div>

          {/* Dynamic Distribution Bar list Layout (no Recharts context crash) */}
          <div className="flex-1 w-full max-w-sm flex flex-col justify-center min-h-[143px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[7.5px] font-mono font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                GRADUAÇÃO POR ATLETAS DO DOJO
              </span>
            </div>

            <div className="w-full">
              <div className="space-y-2 w-full">
                {distribution.map((item) => {
                  const belt = BELT_COLORS.find(b => b.level === item.stars) || BELT_COLORS[0];
                  return (
                    <div key={item.stars} className="flex items-center gap-2 text-[8px] font-mono">
                      <span className={`w-14 truncate font-black uppercase tracking-tight ${belt.textColor}`}>
                        {item.stars === 5 ? 'PRETA' : item.stars === 4 ? 'MARROM' : item.stars === 3 ? 'ROXA' : item.stars === 2 ? 'AZUL' : 'BRANCA'} ({item.stars}★)
                      </span>
                      <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 overflow-hidden rounded-none border border-zinc-300/30">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          className={`h-full ${item.stars === 5 ? 'bg-zinc-950 dark:bg-zinc-50' : item.stars === 4 ? 'bg-amber-800' : item.stars === 3 ? 'bg-purple-700' : item.stars === 2 ? 'bg-blue-600' : 'bg-zinc-400'}`}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      <span className="w-8 text-zinc-400 font-bold text-right shrink-0">({item.count})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="hidden sm:block border-l border-zinc-200 dark:border-zinc-800 h-16 self-stretch mx-2" />

          {/* Overall Count Text */}
          <div className="shrink-0">
            <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Shield size={14} className="text-green-600" /> Relatórios do Dojo
            </h4>
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-1">
              {reviews.length} {reviews.length === 1 ? 'Combate Analisado' : 'Combates Analisados'}
            </p>
            <div className="mt-2 text-[9px] font-mono uppercase bg-zinc-100 dark:bg-zinc-850 px-2.5 py-1 inline-block border border-zinc-300/30 text-zinc-500">
              Graduação Média: <strong className="text-black dark:text-white">{getBeltLabel(averageRating)}</strong>
            </div>
          </div>
        </div>

        {/* Action Button - Hosted inside Shancdn Dialog ReviewForm */}
        <div className="shrink-0 w-full lg:w-auto relative z-10">
          <ReviewForm
            productId={productId}
            isLoggedIn={!!isLoggedIn}
            onSignIn={onSignIn || (() => {})}
            currentUserDisplayName={currentUserDisplayName}
            onAddReview={onAddReview}
            hasPurchased={hasPurchasedCurrent}
            onAcquireProduct={onAcquireProduct}
          />
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="py-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50/20">
            <MessageSquare size={36} className="mb-4 opacity-20 text-green-600" />
            <p className="text-[10px] font-black uppercase tracking-widest font-mono text-center">Nenhum Atleta Submeteu Relatório de Combate para este Item.</p>
            <p className="text-[9px] text-zinc-400 italic mt-1 font-mono uppercase">Seja o pioneiro, submeta seu report e ganhe respeito no tatame!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Toolbar for Sorting Acervo Técnico */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-zinc-200 dark:border-zinc-800/80 p-4 bg-zinc-50/50 dark:bg-zinc-900/20 gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 font-mono flex items-center gap-1.5">
                <ArrowDownAZ size={14} className="text-zinc-400" /> Filtrar Acervo Técnico
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase font-mono text-zinc-400">Ordenar por:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'newest' | 'highest' | 'lowest')}
                  className="bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-none outline-none focus:ring-1 focus:ring-black dark:focus:ring-white text-black dark:text-white font-mono cursor-pointer"
                >
                  <option value="newest">Mais Recentes</option>
                  <option value="highest">Maior Nota (★ Descendente)</option>
                  <option value="lowest">Menor Nota (★ Ascendente)</option>
                </select>
              </div>
            </div>

            <motion.div 
              layout
              className="grid grid-cols-1 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {sortedReviews.map((review) => {
                  // Verified badge condition checks if the review's userId matches the purchasedProductIds state for this product
                  const isVerifiedPurchase = review.userId && currentUserId && review.userId === currentUserId && purchasedProductIds.includes(productId);

                  return (
                    <motion.div 
                      key={review.id} 
                      initial={{ opacity: 0, y: -24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 15 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      layout
                      className={`p-6 border flex gap-6 shadow-sm hover:shadow-md transition-all relative rounded-none ${
                        review.isFeatured 
                          ? 'bg-amber-500/5 border-amber-500/30 dark:bg-amber-950/10 dark:border-amber-500/20' 
                          : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-850'
                      }`}
                    >
                      <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 flex items-center justify-center shrink-0">
                        <User size={22} className="text-zinc-400" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h6 className="text-[11px] font-black uppercase tracking-tighter text-black dark:text-white font-mono flex items-center gap-1.5">
                              <span className="inline-block w-2 h-2 bg-green-600 rounded-full" /> {review.userName}
                            </h6>
                            {review.isFeatured && (
                              <span className="text-[7.5px] font-black bg-gradient-to-r from-amber-500 to-yellow-600 text-white border border-amber-600 px-2 py-0.5 rounded-none font-mono uppercase flex items-center gap-1 shadow-sm leading-none">
                                ★ Destaque do Tatame
                              </span>
                            )}
                            {isVerifiedPurchase ? (
                              <span className="text-[7.5px] font-bold bg-green-600 text-white border border-green-700 px-2 py-0.5 rounded-none font-mono uppercase flex items-center gap-1 shadow-sm leading-none animate-pulse">
                                <Check size={10} className="stroke-[3]" /> Verified Purchase
                              </span>
                            ) : (
                              <span className="text-[7.5px] font-bold bg-green-50 text-green-700 border border-green-200/50 px-1 py-0.5 rounded-none font-mono uppercase leading-none">
                                Compra de Afiliado Confirmada
                              </span>
                            )}
                          </div>
                          <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                            <Calendar size={10} /> {review.date}
                          </span>
                        </div>

                        {/* Highly thematic physical belt display */}
                        <div className="py-1">
                          {renderBeltBar(review.rating)}
                        </div>

                        <div className="p-3 border border-zinc-100 dark:border-zinc-900 bg-zinc-50/40 dark:bg-zinc-950/40 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold italic text-justify rounded-none">
                          "{review.comment}"
                        </div>
                      </div>
                      
                      {/* Admin action buttons */}
                      {isAdmin ? (
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                          <button 
                            onClick={() => onHighlightReview && onHighlightReview(review.id, !review.isFeatured)}
                            className={`p-1.5 transition-all border ${
                              review.isFeatured 
                                ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600' 
                                : 'text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-amber-500 hover:border-amber-500'
                            }`}
                            title={review.isFeatured ? "Remover Destaque" : "Destacar Avaliação"}
                          >
                            <Star size={12} className={review.isFeatured ? "fill-current text-white" : ""} />
                          </button>
                          {onDeleteReview && (
                            <button 
                              onClick={() => onDeleteReview(review.id)}
                              className="p-1.5 text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-red-500 hover:border-red-500 transition-all bg-white dark:bg-zinc-900"
                              title="Excluir Avaliação (Moderação Admin)"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      ) : (
                        currentUserId && review.userId === currentUserId && onDeleteReview && (
                          <button 
                            onClick={() => onDeleteReview(review.id)}
                            className="absolute top-4 right-4 text-zinc-300 hover:text-red-500 transition-colors p-2"
                            title="Excluir Avaliação"
                          >
                            <Trash2 size={14} />
                          </button>
                        )
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

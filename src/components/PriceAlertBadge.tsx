import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, BellRing, TrendingDown, BellOff, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface PriceAlertBadgeProps {
  productId: string;
  isAlertActive?: boolean;
  onToggleAlert?: (productId: string) => void;
  isBestPrice?: boolean;
  originalPrice?: number;
  currentPrice?: number;
  variant?: 'floating-overlay' | 'header-icon' | 'badge-banner' | 'price-inline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  productTitle?: string;
}

export const PriceAlertBadge: React.FC<PriceAlertBadgeProps> = ({
  productId,
  isAlertActive = false,
  onToggleAlert,
  isBestPrice = false,
  originalPrice,
  currentPrice,
  variant = 'floating-overlay',
  size = 'md',
  className = '',
  productTitle
}) => {
  // Calculate price drop percentage if prices available
  const hasPriceDrop = isBestPrice || (originalPrice && currentPrice && originalPrice > currentPrice);
  const discountPercent = (originalPrice && currentPrice && originalPrice > currentPrice)
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onToggleAlert) {
      onToggleAlert(productId);
    }
  };

  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;

  // Render variant 1: Floating Overlay Icon Button (Top right on product card images)
  if (variant === 'floating-overlay') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85, y: -2 }}
              onClick={handleClick}
              className={`relative flex items-center justify-center p-2 rounded-full border transition-all cursor-pointer select-none ${
                isAlertActive
                  ? 'bg-green-600 text-white border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                  : hasPriceDrop
                  ? 'bg-yellow-500 text-black border-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.3)]'
                  : 'bg-white/95 dark:bg-zinc-900/95 text-zinc-400 hover:text-green-600 dark:hover:text-green-400 border-zinc-200 dark:border-zinc-800'
              } ${className}`}
              aria-label={isAlertActive ? 'Desativar alerta de preço' : 'Ativar alerta de preço'}
              id={`alert-badge-btn-${productId}`}
            >
              {/* Outer Pulse Animation Ring when active or on price drop */}
              {(isAlertActive || hasPriceDrop) && (
                <span className="absolute inset-0 rounded-full animate-ping opacity-60 pointer-events-none border border-current" />
              )}

              {/* Pulsing Aura Effect */}
              {isAlertActive && (
                <motion.span
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 rounded-full bg-green-500/40 pointer-events-none"
                />
              )}

              {/* Icon */}
              {isAlertActive ? (
                <BellRing size={iconSize} className="animate-bounce" />
              ) : hasPriceDrop ? (
                <TrendingDown size={iconSize} className="animate-pulse stroke-[2.5px]" />
              ) : (
                <Bell size={iconSize} />
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="bg-black text-white border border-zinc-800 rounded-none text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 shadow-xl z-50"
          >
            {isAlertActive ? (
              <span className="flex items-center gap-1.5 text-green-400">
                <BellRing size={11} className="animate-pulse" />
                Alerta de Preço Ativo — Notificações Ligadas!
              </span>
            ) : hasPriceDrop ? (
              <span className="flex items-center gap-1.5 text-yellow-400">
                <TrendingDown size={11} />
                Preço Baixou! Clique para Receber Avisos
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Bell size={11} />
                Ativar Alerta de Baixa de Preço
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Render variant 2: Header / Technical Inline Icon
  if (variant === 'header-icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClick}
              className={`relative inline-flex items-center gap-1.5 px-2 py-1 text-[8.5px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer border rounded-none ${
                isAlertActive
                  ? 'bg-green-600/10 border-green-600/50 text-green-600 dark:text-green-400'
                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white'
              } ${className}`}
              id={`alert-header-btn-${productId}`}
            >
              {isAlertActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              )}
              {isAlertActive ? (
                <BellRing size={iconSize} className="text-green-500 animate-pulse" />
              ) : (
                <Bell size={iconSize} />
              )}
              <span>{isAlertActive ? 'Alerta LIGADO' : 'Alerta'}</span>
            </motion.button>
          </TooltipTrigger>
          <TooltipContent className="bg-black text-white border-zinc-800 rounded-none text-[8.5px] font-black uppercase">
            {isAlertActive ? 'Alerta de Preço Ativo' : 'Ativar Alerta de Preço'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Render variant 3: Badge Banner (With Pulse & Price Drop indicator)
  if (variant === 'badge-banner') {
    return (
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleClick}
        className={`relative overflow-hidden inline-flex items-center gap-1.5 px-2.5 py-1 border text-[8px] font-mono font-black uppercase tracking-widest cursor-pointer shadow-md ${
          isAlertActive
            ? 'bg-green-600 text-white border-green-500'
            : hasPriceDrop
            ? 'bg-yellow-500 text-black border-yellow-400'
            : 'bg-zinc-900 text-zinc-200 border-zinc-800 hover:border-green-600'
        } ${className}`}
        id={`alert-banner-btn-${productId}`}
      >
        {/* Pulsing Background Aura */}
        {(isAlertActive || hasPriceDrop) && (
          <span className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
        )}

        <div className="relative z-10 flex items-center gap-1">
          {isAlertActive ? (
            <>
              <BellRing size={11} className="animate-bounce shrink-0" />
              <span>ALERTA ATIVO</span>
            </>
          ) : hasPriceDrop ? (
            <>
              <TrendingDown size={11} className="animate-pulse shrink-0" />
              <span>{discountPercent ? `${discountPercent}% OFF — ATIVAR ALERTA` : 'OFERTA — ATIVAR ALERTA'}</span>
            </>
          ) : (
            <>
              <Bell size={11} className="shrink-0" />
              <span>ATIVAR ALERTA</span>
            </>
          )}
        </div>
      </motion.button>
    );
  }

  // Render variant 4: Price Inline Badge
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={handleClick}
      className={`relative inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer border ${
        isAlertActive
          ? 'bg-green-600/20 text-green-600 dark:text-green-400 border-green-500/50'
          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 hover:text-green-500 border-zinc-200 dark:border-zinc-800'
      } ${className}`}
      title={isAlertActive ? 'Alerta Ativo' : 'Ativar Alerta de Baixa de Preço'}
      id={`alert-inline-btn-${productId}`}
    >
      {(isAlertActive || hasPriceDrop) && (
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
      )}
      {isAlertActive ? (
        <BellRing size={10} className="text-green-500 animate-pulse" />
      ) : (
        <Bell size={10} />
      )}
      <span>{isAlertActive ? 'Monitorando' : 'Avisar Queda'}</span>
    </motion.button>
  );
};

export default PriceAlertBadge;

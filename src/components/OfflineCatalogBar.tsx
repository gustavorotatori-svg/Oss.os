import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wifi, 
  WifiOff, 
  HardDrive, 
  Download, 
  CheckCircle2, 
  RefreshCw, 
  Trash2, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Layers
} from 'lucide-react';
import { Product } from '../types';
import { 
  getOfflineCacheStats, 
  precacheProductImages, 
  extractProductImageUrls, 
  clearProductImageCache,
  OfflineCacheStats
} from '../lib/offlineCatalogService';

export interface OfflineCatalogBarProps {
  products: Product[];
  className?: string;
}

export const OfflineCatalogBar: React.FC<OfflineCatalogBarProps> = ({ products, className = '' }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [stats, setStats] = useState<OfflineCacheStats>({
    imageCount: 0,
    isOffline: false,
    isSupported: true
  });

  const [isCaching, setIsCaching] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [justFinished, setJustFinished] = useState(false);

  // Load cache stats
  const refreshStats = useCallback(async () => {
    const s = await getOfflineCacheStats();
    setStats(s);
  }, []);

  // Monitor online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      refreshStats();
    };
    const handleOffline = () => {
      setIsOnline(false);
      refreshStats();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial load
    refreshStats();

    // Listen for Service Worker pre-cache updates
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PRECACHE_PRODUCT_IMAGES_COMPLETE') {
        refreshStats();
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [refreshStats]);

  // Handle saving all catalog images
  const handleSaveCatalogOffline = async () => {
    if (isCaching) return;
    setIsCaching(true);
    setJustFinished(false);

    const urls = extractProductImageUrls(products);
    setProgress({ current: 0, total: urls.length });

    try {
      const res = await precacheProductImages(urls, (cached, total) => {
        setProgress({ current: cached, total });
      });

      if (res.success) {
        setJustFinished(true);
        setTimeout(() => setJustFinished(false), 4000);
      }
    } catch (err) {
      console.warn('[OfflineBar] Erro no pre-cache:', err);
    } finally {
      setIsCaching(false);
      refreshStats();
    }
  };

  // Handle clearing cached images
  const handleClearCache = async () => {
    if (confirm('Deseja limpar as imagens de produtos salvas em cache no dispositivo?')) {
      await clearProductImageCache();
      await refreshStats();
      setProgress(null);
    }
  };

  const totalPossibleImages = extractProductImageUrls(products).length;
  const percentageCached = totalPossibleImages > 0 
    ? Math.min(100, Math.round((stats.imageCount / totalPossibleImages) * 100))
    : 0;

  return (
    <div className={`w-full font-mono text-xs ${className}`}>
      {/* 1. Offline Mode Alert Banner (prominently shown whenever navigator is offline) */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 p-3 bg-amber-500/10 border-2 border-amber-500/50 text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <WifiOff size={16} className="text-amber-400 shrink-0" />
              <div>
                <span className="font-black uppercase tracking-wider block text-amber-200">
                  Modo Tatame Offline Ativo
                </span>
                <span className="text-[11px] text-amber-400/80">
                  Sem internet. O catálogo e as {stats.imageCount} fotos salvas em cache continuam navegáveis.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] bg-amber-950/80 border border-amber-800 text-amber-300 px-2 py-1 font-bold">
                {stats.imageCount} IMAGENS EM CACHE
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Compact / Expandable Offline Manager Toolbar */}
      <div className="bg-zinc-900/90 border border-zinc-800 backdrop-blur-md p-2.5 sm:px-4 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Status Badge & Cached Images Summary */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-black/60 border border-zinc-800 text-zinc-300">
              {isOnline ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">ONLINE</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[10px] font-bold text-amber-400 uppercase">OFFLINE</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-zinc-300 text-[11px]">
              <HardDrive size={13} className="text-red-500" />
              <span className="font-bold">
                {stats.imageCount} {stats.imageCount === 1 ? 'foto em cache' : 'fotos em cache'}
              </span>
              <span className="text-zinc-500 hidden sm:inline">
                ({percentageCached}% do catálogo salvo)
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {isCaching ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800 text-white border border-zinc-700">
                <RefreshCw size={12} className="animate-spin text-red-500" />
                <span className="text-[11px] font-bold">
                  Cacheando {progress?.current || 0}/{progress?.total || 0}...
                </span>
              </div>
            ) : justFinished ? (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-950/80 border border-green-700 text-green-300 text-[11px] font-bold">
                <CheckCircle2 size={13} />
                <span>Catálogo Salvo no Cache!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSaveCatalogOffline}
                disabled={!isOnline}
                className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  percentageCached === 100
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                }`}
                title="Salvar todas as fotos do catálogo no Service Worker para navegação sem internet"
              >
                <Download size={12} />
                <span>{percentageCached === 100 ? 'Revalidar Fotos' : 'Salvar Catálogo Offline'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-zinc-400 hover:text-white transition-colors"
              title={isExpanded ? 'Recolher detalhes do cache' : 'Ver detalhes do cache offline'}
            >
              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>
        </div>

        {/* Dynamic Progress Bar while pre-caching */}
        {isCaching && progress && progress.total > 0 && (
          <div className="w-full bg-black/60 h-1.5 rounded-full overflow-hidden border border-zinc-800">
            <motion.div
              className="h-full bg-gradient-to-r from-red-600 to-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }}
              transition={{ ease: 'easeOut', duration: 0.2 }}
            />
          </div>
        )}

        {/* 3. Expanded Panel Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400 space-y-2"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1">
                <div className="bg-black/40 p-2 border border-zinc-800">
                  <span className="text-zinc-500 block text-[9px] uppercase">Armazenamento</span>
                  <span className="text-white font-bold">Cache Service Worker (CacheStorage)</span>
                </div>
                <div className="bg-black/40 p-2 border border-zinc-800">
                  <span className="text-zinc-500 block text-[9px] uppercase">Estratégia</span>
                  <span className="text-white font-bold">Cache-First + Background Revalidate</span>
                </div>
                <div className="bg-black/40 p-2 border border-zinc-800">
                  <span className="text-zinc-500 block text-[9px] uppercase">Fotos em Cache</span>
                  <span className="text-white font-bold">{stats.imageCount} de {totalPossibleImages} fotos</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="text-zinc-500 text-[10px]">
                  💡 Conforme você navega e abre os kimonos, as fotos são cacheadas automaticamente para viagens ou academias sem sinal.
                </span>

                {stats.imageCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCache}
                    className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-red-400 uppercase transition-colors"
                  >
                    <Trash2 size={11} />
                    <span>Esvaziar Cache de Imagens</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OfflineCatalogBar;

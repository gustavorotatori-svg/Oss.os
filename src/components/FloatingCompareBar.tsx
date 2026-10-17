import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRightLeft, X, Scale, Sparkles, Check } from 'lucide-react';
import { Product } from '../types';
import BJJImage from './BJJImage';

interface FloatingCompareBarProps {
  selectedProducts?: Product[];
  comparedProducts?: Product[];
  onOpenCompareModal?: () => void;
  onOpenCompare?: () => void;
  onRemoveProduct?: (productId: string) => void;
  onClearAll?: () => void;
}

export const FloatingCompareBar: React.FC<FloatingCompareBarProps> = ({
  selectedProducts,
  comparedProducts,
  onOpenCompareModal,
  onOpenCompare,
  onRemoveProduct = (_productId: string) => {},
  onClearAll = () => {}
}) => {
  const products = selectedProducts && selectedProducts.length > 0 
    ? selectedProducts 
    : (comparedProducts || []);

  if (products.length === 0) return null;

  const canCompare = products.length >= 2;
  const handleOpen = onOpenCompareModal || onOpenCompare || (() => {});

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] sm:w-auto"
      >
        <div className="bg-black/95 dark:bg-zinc-950/95 text-white border-2 border-green-600 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-md p-3 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 rounded-none">
          {/* Product Thumbnails List */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full no-scrollbar">
            <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-zinc-800">
              <Scale size={16} className="text-green-500 animate-pulse" />
              <div className="text-left">
                <span className="text-[9px] font-mono font-black uppercase text-green-400 block tracking-wider">
                  COMPARADOR ({products.length}/4)
                </span>
                <span className="text-[10px] font-mono text-zinc-400 block">
                  {canCompare ? 'Pronto para comparar' : 'Selecione mais 1 item'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="relative group w-10 h-10 bg-zinc-900 border border-zinc-700 shrink-0 overflow-hidden"
                >
                  <BJJImage
                    src={prod.imageUrl}
                    alt={prod.title}
                    aspectRatio="aspect-square"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveProduct(prod.id)}
                    className="absolute inset-0 bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    title={`Remover ${prod.title}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            <button
              type="button"
              onClick={onClearAll}
              className="px-3 py-2 text-[10px] font-mono font-bold uppercase text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Limpar
            </button>

            <motion.button
              type="button"
              whileHover={{ scale: canCompare ? 1.05 : 1 }}
              whileTap={{ scale: canCompare ? 0.95 : 1 }}
              disabled={!canCompare}
              onClick={handleOpen}
              className={`px-4 py-2.5 text-[10px] font-mono font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer ${
                canCompare
                  ? 'bg-green-600 text-black hover:bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
              }`}
              id="open-side-by-side-compare-btn"
            >
              <ArrowRightLeft size={13} />
              <span>Comparar Especificações</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingCompareBar;

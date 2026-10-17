import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Zap, ShoppingBag, Heart, Trash2, Scale, Bell, Info } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
  icon?: React.ReactNode;
}

interface ToastContainerProps {
  toasts?: ToastItem[];
  onDismissToast?: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts = [],
  onDismissToast = (_id: string) => {},
}) => {
  const safeToasts = toasts || [];
  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-[300] flex flex-col gap-2.5 w-[calc(100%-2rem)] sm:w-full max-w-[380px] pointer-events-none">
      <AnimatePresence mode="popLayout">
        {safeToasts.map((toast) => {
          const isSuccess = toast.type === 'success' || !toast.type;
          const isError = toast.type === 'error';

          // Determine border & background styling
          const borderStyle = isSuccess
            ? 'border-2 border-green-600 bg-black/95 text-white shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
            : isError
            ? 'border-2 border-red-600 bg-black/95 text-white shadow-[0_10px_30px_rgba(204,0,0,0.3)]'
            : 'border-2 border-amber-500 bg-black/95 text-white shadow-[0_10px_30px_rgba(245,158,11,0.2)]';

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 25, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: 50, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`pointer-events-auto relative overflow-hidden p-3.5 sm:p-4 rounded-none flex items-center gap-3 backdrop-blur-md ${borderStyle}`}
            >
              {/* Icon Container */}
              <div className={`shrink-0 w-9 h-9 flex items-center justify-center font-mono font-bold text-xs ${
                isSuccess
                  ? 'bg-green-600/20 text-green-400 border border-green-500/40'
                  : isError
                  ? 'bg-red-600/20 text-red-400 border border-red-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                {toast.icon ? (
                  toast.icon
                ) : isSuccess ? (
                  <Check size={16} strokeWidth={3} className="text-green-400" />
                ) : isError ? (
                  <X size={16} strokeWidth={3} className="text-red-400" />
                ) : (
                  <Zap size={16} className="text-amber-400" />
                )}
              </div>

              {/* Message */}
              <div className="flex-1 min-w-0 pr-1">
                <p className="text-[11px] font-mono font-extrabold uppercase tracking-wider leading-snug break-words">
                  {toast.message}
                </p>
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={() => onDismissToast(toast.id)}
                className="shrink-0 p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Fechar notificação"
              >
                <X size={14} />
              </button>

              {/* Animated Progress Timer Bar at the bottom */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 4, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-1 ${
                  isSuccess ? 'bg-green-500' : isError ? 'bg-red-500' : 'bg-amber-500'
                }`}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;

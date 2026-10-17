import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Settings,
  Sparkles,
  RefreshCw,
  Heart,
  ChevronRight
} from 'lucide-react';
import { NotificationPermissionModal } from './NotificationPermissionModal';
import { NotificationOnboardingModal } from './NotificationOnboardingModal';
import { Product } from '../types';

export interface NotificationSubscriptionProps {
  wishlistProducts?: Product[];
  onSimulateFavoritePromo?: (product?: Product) => void;
  className?: string;
  variant?: 'banner' | 'card' | 'compact' | 'badge-only';
}

export const NotificationSubscription: React.FC<NotificationSubscriptionProps> = ({
  wishlistProducts = [],
  onSimulateFavoritePromo,
  className = '',
  variant = 'card'
}) => {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'status' | 'guide'>('status');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleRequest = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    
    if (permission === 'denied') {
      setModalInitialTab('guide');
      setIsModalOpen(true);
      return;
    }

    setIsRequesting(true);
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'denied') {
        setModalInitialTab('guide');
        setIsModalOpen(true);
      }
    } catch (e) {
      console.error('Error requesting permission', e);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleOpenGuide = () => {
    setModalInitialTab('guide');
    setIsModalOpen(true);
  };

  const handleOpenStatus = () => {
    setModalInitialTab('status');
    setIsModalOpen(true);
  };

  // Variant 1: Badge Only
  if (variant === 'badge-only') {
    return (
      <>
        <button
          onClick={handleOpenStatus}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-mono font-black uppercase tracking-wider border transition-all cursor-pointer ${
            permission === 'granted'
              ? 'bg-green-500/10 text-green-400 border-green-500/30'
              : permission === 'denied'
              ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
          } ${className}`}
        >
          {permission === 'granted' ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Notificações Ativas</span>
            </>
          ) : permission === 'denied' ? (
            <>
              <BellOff size={10} className="text-red-400" />
              <span>Bloqueado (Abrir Guia)</span>
            </>
          ) : (
            <>
              <BellRing size={10} className="animate-bounce text-amber-400" />
              <span>Ativar Alertas Push</span>
            </>
          )}
        </button>

        <NotificationPermissionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onPermissionChange={setPermission}
          wishlistProducts={wishlistProducts}
          onSimulateFavoritePromo={onSimulateFavoritePromo}
          initialTab={modalInitialTab}
        />
      </>
    );
  }

  // Variant 2: Card / Banner
  return (
    <div
      className={`relative overflow-hidden bg-zinc-950 border-2 ${
        permission === 'denied'
          ? 'border-red-900/60 bg-gradient-to-r from-red-950/20 to-zinc-950'
          : permission === 'granted'
          ? 'border-green-900/60 bg-gradient-to-r from-green-950/20 to-zinc-950'
          : 'border-zinc-800 bg-gradient-to-r from-zinc-900/50 to-zinc-950'
      } p-5 sm:p-6 text-white font-sans ${className}`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Left Side Icon & Info */}
        <div className="flex items-start gap-3.5">
          <div
            className={`p-3 rounded-none border shrink-0 ${
              permission === 'denied'
                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                : permission === 'granted'
                ? 'bg-green-500/10 text-green-400 border-green-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            {permission === 'denied' ? (
              <BellOff size={22} className="animate-pulse" />
            ) : permission === 'granted' ? (
              <CheckCircle2 size={22} />
            ) : (
              <BellRing size={22} className="animate-bounce" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm sm:text-base font-mono font-black uppercase tracking-wider text-white">
                {permission === 'denied'
                  ? 'Notificações de Promoção Bloqueadas'
                  : permission === 'granted'
                  ? 'Monitoramento de Promoções Ativo'
                  : 'Alertas de Preço & Promoções em Favoritos'}
              </h4>

              {/* Status Badge */}
              <span
                className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 border ${
                  permission === 'denied'
                    ? 'bg-red-600/20 text-red-400 border-red-500/40'
                    : permission === 'granted'
                    ? 'bg-green-600/20 text-green-400 border-green-500/40'
                    : 'bg-amber-600/20 text-amber-400 border-amber-500/40'
                }`}
              >
                {permission === 'denied'
                  ? 'Bloqueado no Navegador'
                  : permission === 'granted'
                  ? 'Push Habilitado'
                  : 'Disponível'}
              </span>
            </div>

            <p className="text-xs text-zinc-400 max-w-xl">
              {permission === 'denied'
                ? 'Você bloqueou as notificações anteriormente. Acesse o guia de configuração para desbloquear e receber alertas quando seus kimonos e rashguards favoritos entrarem em promoção.'
                : permission === 'granted'
                ? 'Seus produtos favoritos estão protegidos com verificação contínua. Você será notificado no celular e desktop no instante em que houver queda de preço.'
                : 'Ative as notificações push do navegador para receber avisos instantâneos de descontos, cupons relâmpago e ofertas dos seus produtos favoritos no tatame.'}
            </p>
          </div>
        </div>

        {/* Right Side Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto justify-start md:justify-end">
          {permission === 'denied' ? (
            <>
              <button
                onClick={handleOpenGuide}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              >
                <Settings size={14} />
                Como Desbloquear nas Configurações
              </button>
              <button
                onClick={handleOpenStatus}
                className="px-3 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw size={12} />
                Verificar
              </button>
            </>
          ) : permission === 'granted' ? (
            <>
              <button
                onClick={handleOpenStatus}
                className="px-4 py-2.5 bg-green-600 hover:bg-green-500 text-black font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              >
                <Flame size={14} />
                Gerenciar & Testar Alerta
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(34,197,94,0.35)]"
              >
                <BellRing size={14} className="animate-bounce" />
                Conhecer Benefícios & Ativar
              </button>
              <button
                onClick={handleRequest}
                disabled={isRequesting}
                className="px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Ativar Direto
              </button>
            </>
          )}
        </div>
      </div>

      <NotificationPermissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPermissionChange={setPermission}
        wishlistProducts={wishlistProducts}
        onSimulateFavoritePromo={onSimulateFavoritePromo}
        initialTab={modalInitialTab}
      />

      <NotificationOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onPermissionGranted={() => {
          if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
          }
        }}
        wishlistProducts={wishlistProducts}
      />
    </div>
  );
};

export default NotificationSubscription;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Bell,
  BellRing,
  CheckCircle2,
  X,
  Sparkles,
  TrendingDown,
  Flame,
  ShieldCheck,
  Ticket,
  ChevronRight,
  ArrowRight,
  Smartphone,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { Product } from '../types';
import { requestFCMToken, registerFCMServiceWorker } from '../lib/fcmService';

export interface NotificationOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted: () => void;
  wishlistProducts?: Product[];
  sampleProduct?: Product;
}

type PreviewType = 'price_drop' | 'new_drop' | 'coupon';

export const NotificationOnboardingModal: React.FC<NotificationOnboardingModalProps> = ({
  isOpen,
  onClose,
  onPermissionGranted,
  wishlistProducts = [],
  sampleProduct
}) => {
  const [activePreview, setActivePreview] = useState<PreviewType>('price_drop');
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionResult, setPermissionResult] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [isTestSent, setIsTestSent] = useState(false);

  if (!isOpen) return null;

  // Determine target product for dynamic preview
  const previewProduct = wishlistProducts.length > 0 
    ? wishlistProducts[0] 
    : sampleProduct || {
        id: 'sample-kimono',
        title: 'Kimono Trançado Reforçado OSS Pro',
        price: 369.90,
        originalPrice: 529.90,
        platform: 'Mercado Livre',
        imageUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=300&auto=format&fit=crop'
      };

  const discountPercent = previewProduct.originalPrice
    ? Math.round(((previewProduct.originalPrice - previewProduct.price) / previewProduct.originalPrice) * 100)
    : 30;

  const handleRequestNativePush = async () => {
    if (typeof window === 'undefined') return;

    if (!('Notification' in window)) {
      setPermissionResult('denied');
      return;
    }

    setIsRequesting(true);
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        setPermissionResult('granted');
        localStorage.setItem('oss_notif_onboarding_completed', 'true');
        localStorage.removeItem('oss_notif_onboarding_dismissed');
        localStorage.setItem('oss_push_price_alerts_subscribed', 'true');

        // Register FCM Service Worker & obtain FCM token
        try {
          await registerFCMServiceWorker();
          await requestFCMToken(true);
        } catch (fcmErr) {
          console.warn('[Onboarding] FCM token retrieval fallback:', fcmErr);
        }

        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore if canvas blocked
        }

        // Send native welcome test notification
        try {
          const title = "🥋 Diário dos Oss.os • Notificações Ativadas!";
          const options = {
            body: "Você será o primeiro a saber quando um produto favoritado entrar em promoção ou surgir um cupom relâmpago. Oss!",
            icon: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=128&auto=format&fit=crop"
          };

          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification(title, options as any);
            });
          } else {
            new Notification(title, options);
          }
        } catch (err) {
          console.warn("Could not dispatch welcome notification:", err);
        }

        onPermissionGranted();
      } else {
        setPermissionResult('denied');
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setPermissionResult('denied');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismissLater = () => {
    localStorage.setItem('oss_notif_onboarding_dismissed', 'true');
    onClose();
  };

  const handleSendSimulatedTest = () => {
    setIsTestSent(true);
    setTimeout(() => setIsTestSent(false), 3500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-zinc-950 border-2 border-zinc-800 text-white shadow-2xl overflow-hidden z-10 font-sans"
        >
          {/* Top Header Banner */}
          <div className="relative bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-b border-zinc-800 p-5 sm:p-6 overflow-hidden">
            {/* Background martial grid accent */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-[9px] font-black uppercase tracking-widest">
                    <BellRing size={11} className="animate-bounce" />
                    Radar de Oportunidades • Push Nativo
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
                    100% no seu navegador
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-mono uppercase tracking-tight text-white flex items-center gap-2">
                  Nunca Perca um Desconto ou Drop no Tatame
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed max-w-xl">
                  Seja avisado no exato segundo em que seus kimonos e faixas favoritos entrarem em promoção ou receberem cupons exclusivos.
                </p>
              </div>

              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white p-1.5 transition-colors border border-transparent hover:border-zinc-700 shrink-0 cursor-pointer"
                title="Fechar"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {permissionResult === 'granted' ? (
              /* Success State Screen */
              <div className="py-8 px-4 text-center space-y-5 bg-green-950/20 border border-green-800/40">
                <div className="w-16 h-16 mx-auto bg-green-500/20 text-green-400 border border-green-500/40 flex items-center justify-center">
                  <CheckCircle2 size={36} className="animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-mono font-black uppercase tracking-wider text-green-400">
                    Notificações Nativas Conectadas!
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto">
                    Seu navegador agora está sincronizado com o radar de preços do Diário dos Oss.os. Sempre que houver queda de preço nos seus itens favoritos ou um cupom relâmpago, você receberá um alerta direto.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white font-mono text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                  >
                    Voltar ao Tatame e Navegar
                  </button>
                </div>
              </div>
            ) : permissionResult === 'denied' ? (
              /* Denied Instructions Screen */
              <div className="p-5 space-y-4 bg-red-950/20 border border-red-800/40">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                    <Bell size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-mono font-black uppercase tracking-wider text-red-400">
                      Permissão Bloqueada no Navegador
                    </h3>
                    <p className="text-xs text-zinc-300">
                      O seu navegador bloqueou a solicitação de notificações. Para ser avisado sobre quedas de preço e cupons, é necessário autorizar nas opções do site.
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-4 space-y-2 text-xs text-zinc-300 font-mono">
                  <div className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                    <Laptop size={13} className="text-amber-400" />
                    Como Desbloquear Rápido:
                  </div>
                  <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-zinc-400">
                    <li>Clique no ícone de <strong>Cadeado 🔒</strong> ou <strong>Ajustes do Site</strong> ao lado esquerdo da barra de endereço (URL).</li>
                    <li>Localize o item <strong>Notificações</strong> e altere para <strong>Permitir</strong>.</li>
                    <li>Recarregue a página para ativar o radar.</li>
                  </ol>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleRequestNativePush}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Tentar Novamente
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              /* Standard Onboarding Flow */
              <>
                {/* 3 Core Value Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 space-y-2">
                    <div className="w-8 h-8 rounded-none bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center">
                      <TrendingDown size={16} />
                    </div>
                    <h3 className="font-mono text-xs font-bold uppercase text-white tracking-wider">
                      Quedas de Preço em Tempo Real
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                      Monitoramento contínuo no Mercado Livre, Amazon e Shopee. Notificação instantânea assim que o preço atingir a mínima.
                    </p>
                  </div>

                  <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 space-y-2">
                    <div className="w-8 h-8 rounded-none bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Flame size={16} />
                    </div>
                    <h3 className="font-mono text-xs font-bold uppercase text-white tracking-wider">
                      Drops & Novidades Exclusivas
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                      Lançamento de kimonos de edição limitada, rashguards de competição e novas faixas artesanais em primeira mão.
                    </p>
                  </div>

                  <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 space-y-2">
                    <div className="w-8 h-8 rounded-none bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Ticket size={16} />
                    </div>
                    <h3 className="font-mono text-xs font-bold uppercase text-white tracking-wider">
                      Cupons Relâmpago & Frete Zero
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                      Cupons secretos com limite de uso negociados especialmente para os atletas da comunidade OSS antes de esgotarem.
                    </p>
                  </div>
                </div>

                {/* Interactive Live Preview Box */}
                <div className="bg-zinc-900/60 border border-zinc-800 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                    <span className="font-mono text-[11px] font-black uppercase text-zinc-300 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-amber-400" />
                      Veja como você receberá os alertas:
                    </span>

                    {/* Preview Type Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setActivePreview('price_drop')}
                        className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          activePreview === 'price_drop'
                            ? 'bg-green-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        Queda de Preço
                      </button>
                      <button
                        onClick={() => setActivePreview('new_drop')}
                        className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          activePreview === 'new_drop'
                            ? 'bg-amber-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        Lançamento
                      </button>
                      <button
                        onClick={() => setActivePreview('coupon')}
                        className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          activePreview === 'coupon'
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        Cupom
                      </button>
                    </div>
                  </div>

                  {/* Realistic Browser Push Notification Mockup Card */}
                  <div className="relative bg-zinc-950 border-2 border-zinc-700/80 p-3.5 shadow-xl rounded-none transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                        {activePreview === 'price_drop' ? (
                          <span className="font-mono text-sm font-black text-green-400">-{discountPercent}%</span>
                        ) : activePreview === 'new_drop' ? (
                          <Flame size={20} className="text-amber-400" />
                        ) : (
                          <Ticket size={20} className="text-blue-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                            Agora • Diário dos Oss.os Radar
                          </span>
                          <span className="text-[9px] font-mono text-zinc-500">Google Chrome / Mobile</span>
                        </div>

                        {activePreview === 'price_drop' && (
                          <>
                            <h4 className="text-xs font-bold text-white font-mono leading-tight">
                              🔥 Menor Preço Histórico: {previewProduct.title}
                            </h4>
                            <p className="text-[11px] text-zinc-300 font-sans">
                              O produto baixou de <span className="line-through text-zinc-500">R$ {previewProduct.originalPrice?.toFixed(2) || '529.90'}</span> para <span className="text-green-400 font-bold">R$ {previewProduct.price.toFixed(2)}</span> no {previewProduct.platform}!
                            </p>
                          </>
                        )}

                        {activePreview === 'new_drop' && (
                          <>
                            <h4 className="text-xs font-bold text-white font-mono leading-tight">
                              🥋 Drop Exclusivo: Nova Edição Limitada BJJ Disponível!
                            </h4>
                            <p className="text-[11px] text-zinc-300 font-sans">
                              A nova coleção de kimonos trançados reforçados acabou de entrar no catálogo oficial com frete promocional.
                            </p>
                          </>
                        )}

                        {activePreview === 'coupon' && (
                          <>
                            <h4 className="text-xs font-bold text-white font-mono leading-tight">
                              ⚡ Cupom Relâmpago: 15% OFF + Frete Grátis
                            </h4>
                            <p className="text-[11px] text-zinc-300 font-sans">
                              Use o cupom <span className="font-mono bg-zinc-800 px-1 py-0.5 text-amber-300 font-bold">OSS15</span> para compras no Mercado Livre e Shopee nas próximas 2 horas.
                            </p>
                          </>
                        )}

                        <div className="pt-2 flex items-center gap-2">
                          <button
                            onClick={handleSendSimulatedTest}
                            className="text-[10px] font-mono font-bold uppercase tracking-wider text-green-400 hover:text-green-300 flex items-center gap-1 cursor-pointer"
                          >
                            {isTestSent ? '✓ Simulação visual executada' : 'Ver como funciona na prática →'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trust Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-green-400" />
                      Sem spam • Desative a qualquer instante nas configurações
                    </span>
                    <span className="flex items-center gap-1">
                      <Smartphone size={12} className="text-zinc-400" />
                      Compatível com Computador e Celular
                    </span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleRequestNativePush}
                    disabled={isRequesting}
                    className="w-full py-3.5 px-6 bg-green-600 hover:bg-green-500 active:scale-[0.99] text-white font-mono text-xs sm:text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all shadow-[0_0_25px_rgba(34,197,94,0.35)] cursor-pointer"
                  >
                    <BellRing size={16} className={isRequesting ? 'animate-spin' : 'animate-bounce'} />
                    {isRequesting ? 'Aguardando sua confirmação...' : 'Ativar Alertas Push Nativos Agora'}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      onClick={handleDismissLater}
                      className="text-zinc-400 hover:text-zinc-200 font-mono text-[10px] uppercase tracking-wider underline underline-offset-4 cursor-pointer"
                    >
                      Lembrar mais tarde
                    </button>

                    <button
                      onClick={() => {
                        localStorage.setItem('oss_notif_onboarding_completed', 'true');
                        onClose();
                      }}
                      className="text-zinc-500 hover:text-zinc-400 font-mono text-[10px] uppercase tracking-wider cursor-pointer"
                    >
                      Não tenho interesse agora
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NotificationOnboardingModal;

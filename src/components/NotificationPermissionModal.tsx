import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  BellOff,
  BellRing,
  AlertTriangle,
  CheckCircle2,
  X,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  Smartphone,
  Globe,
  Flame,
  Tag,
  Heart,
  ShieldCheck,
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';
import { Product } from '../types';
import { requestFCMToken, registerFCMServiceWorker, sendRealFCMPush } from '../lib/fcmService';

export interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionChange?: (permission: NotificationPermission) => void;
  wishlistProducts?: Product[];
  onSimulateFavoritePromo?: (product?: Product) => void;
  initialTab?: 'status' | 'guide';
}

type BrowserType = 'chrome' | 'safari' | 'firefox' | 'edge' | 'mobile';

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  isOpen,
  onClose,
  onPermissionChange,
  wishlistProducts = [],
  onSimulateFavoritePromo,
  initialTab = 'status'
}) => {
  const [currentPermission, setCurrentPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [activeBrowser, setActiveBrowser] = useState<BrowserType>('chrome');
  const [copiedInstructions, setCopiedInstructions] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'guide'>(initialTab);
  const [testSent, setTestSent] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('oss_fcm_token');
    return null;
  });
  const [isSendingRealPush, setIsSendingRealPush] = useState(false);

  // Sync state whenever modal opens or permission changes
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && 'Notification' in window) {
      const perm = Notification.permission;
      setCurrentPermission(perm);
      const token = localStorage.getItem('oss_fcm_token');
      if (token) setFcmToken(token);

      if (perm === 'denied') {
        setActiveTab('guide');
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [isOpen, initialTab]);

  // Check browser permission status
  const checkPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = Notification.permission;
      setCurrentPermission(perm);
      if (onPermissionChange) {
        onPermissionChange(perm);
      }
      if (perm === 'granted') {
        const token = await requestFCMToken();
        if (token) setFcmToken(token);
      }
      return perm;
    }
    return 'default';
  };

  // Request browser permission
  const handleRequestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }
    setIsRequesting(true);
    try {
      const permission = await Notification.requestPermission();
      setCurrentPermission(permission);
      if (onPermissionChange) {
        onPermissionChange(permission);
      }
      if (permission === 'granted') {
        localStorage.setItem('oss_push_price_alerts_subscribed', 'true');
        
        // Register FCM Service Worker & obtain registration token
        try {
          await registerFCMServiceWorker();
          const token = await requestFCMToken(true);
          if (token) setFcmToken(token);
        } catch (fcmErr) {
          console.warn('[FCM Modal] Erro ao obter token FCM:', fcmErr);
        }

        // Send a test welcome notification
        try {
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification('🥋 Alertas de Favoritos OSS.OS Ativados!', {
                body: 'Você será avisado em primeira mão quando seus produtos favoritos entrarem em promoção ou baixarem de preço.',
                icon: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=128&auto=format&fit=crop',
                vibrate: [100, 50, 100],
                tag: 'oss-favorites-activated'
              } as any);
            });
          } else {
            new Notification('🥋 Alertas de Favoritos OSS.OS Ativados!', {
              body: 'Você será avisado em primeira mão quando seus produtos favoritos entrarem em promoção.',
              icon: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=128&auto=format&fit=crop'
            });
          }
        } catch (e) {
          console.warn('Instant notification fallback:', e);
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  // Trigger simulated favorite promo notification
  const handleTestFavoriteAlert = () => {
    const targetProduct = wishlistProducts.length > 0
      ? wishlistProducts[0]
      : ({
          id: 'kimono-demo-promo',
          title: 'Kimono BJJ Vagabond Ultra Light Edição Limitada',
          description: 'Kimono premium ultra leve para treino e competição de Jiu-Jitsu.',
          price: 419.90,
          originalPrice: 599.90,
          imageUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop',
          category: 'Kimonos',
          platform: 'Mercado Livre',
          rating: 4.9,
          reviewsCount: 142,
          isBestPrice: true,
          affiliateUrl: 'https://mercadolivre.com.br'
        } as unknown as Product);

    if (onSimulateFavoritePromo) {
      onSimulateFavoritePromo(targetProduct);
    } else {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const discountPct = targetProduct.originalPrice
          ? Math.round(((targetProduct.originalPrice - targetProduct.price) / targetProduct.originalPrice) * 100)
          : 30;

        const notifTitle = `🔥 Alerta de Promoção: -${discountPct}% no seu Favorito!`;
        const notifBody = `O ${targetProduct.title} baixou de R$ ${targetProduct.originalPrice?.toFixed(2) || '599.90'} para R$ ${targetProduct.price.toFixed(2)}!`;

        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(notifTitle, {
              body: notifBody,
              icon: targetProduct.imageUrl || 'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=128&auto=format&fit=crop',
              vibrate: [200, 100, 200],
              tag: `oss-promo-${targetProduct.id}`,
              data: { url: '/shop' }
            } as any);
          });
        } else {
          new Notification(notifTitle, {
            body: notifBody,
            icon: targetProduct.imageUrl
          });
        }
      }
    }

    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  // Copy guide instructions to clipboard
  const handleCopyInstructions = () => {
    let guideText = '';
    if (activeBrowser === 'chrome' || activeBrowser === 'edge') {
      guideText = `Instruções para desbloquear notificações no Google Chrome / Edge:\n1. Clique no ícone de Cadeado 🔒 ou Configurações à esquerda do endereço do site (URL).\n2. Encontre 'Notificações' e selecione 'Permitir'.\n3. Recarregue a página no navegador.`;
    } else if (activeBrowser === 'firefox') {
      guideText = `Instruções para desbloquear notificações no Firefox:\n1. Clique no ícone de permissão/escudo ao lado do endereço do site.\n2. Remova o bloqueio em 'Permissões > Notificações'.\n3. Recarregue a página no navegador.`;
    } else if (activeBrowser === 'safari') {
      guideText = `Instruções para desbloquear notificações no Safari:\n1. No menu superior, acesse 'Safari > Ajustes > Sites > Notificações'.\n2. Localize este site e selecione 'Permitir'.`;
    } else {
      guideText = `Instruções para desbloquear notificações no Celular (Android / iOS):\n1. No Android: Toque nos 3 pontos ⋮ > Configurações do site > Notificações > Permitir.\n2. No iOS (iPhone): Adicione o app à Tela de Início (PWA) e autorize as notificações nos Ajustes do iOS.`;
    }

    navigator.clipboard.writeText(guideText).then(() => {
      setCopiedInstructions(true);
      setTimeout(() => setCopiedInstructions(false), 2500);
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-zinc-950 border-2 border-zinc-800 text-white shadow-2xl overflow-hidden z-10 font-sans"
        >
          {/* Header Bar */}
          <div className={`p-4 sm:p-6 border-b flex items-start justify-between gap-4 ${
            currentPermission === 'denied'
              ? 'bg-red-950/40 border-red-900/50'
              : currentPermission === 'granted'
              ? 'bg-green-950/40 border-green-900/50'
              : 'bg-zinc-900/60 border-zinc-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-none border shrink-0 ${
                currentPermission === 'denied'
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : currentPermission === 'granted'
                  ? 'bg-green-500/20 text-green-400 border-green-500/40'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              }`}>
                {currentPermission === 'denied' ? (
                  <BellOff size={22} className="animate-pulse" />
                ) : currentPermission === 'granted' ? (
                  <CheckCircle2 size={22} />
                ) : (
                  <BellRing size={22} className="animate-bounce" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-mono font-black uppercase tracking-wider text-white">
                    {currentPermission === 'denied'
                      ? 'Notificações Bloqueadas no Navegador'
                      : currentPermission === 'granted'
                      ? 'Notificações Push Conectadas'
                      : 'Alertas de Promoção nos Favoritos'}
                  </h3>
                  {/* Status Pill Badge */}
                  <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 border ${
                    currentPermission === 'denied'
                      ? 'bg-red-600/30 text-red-400 border-red-500/40'
                      : currentPermission === 'granted'
                      ? 'bg-green-600/30 text-green-400 border-green-500/40'
                      : 'bg-amber-600/30 text-amber-400 border-amber-500/40'
                  }`}>
                    {currentPermission === 'denied' ? 'Bloqueado' : currentPermission === 'granted' ? 'Ativo' : 'Pendente'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-sans mt-0.5">
                  {currentPermission === 'denied'
                    ? 'O navegador bloqueou os alertas. Siga as instruções abaixo para desbloquear nas configurações.'
                    : currentPermission === 'granted'
                    ? 'Monitorando seus produtos favoritos 24/7 contra quedas de preço e cupons relâmpago.'
                    : 'Receba alertas instantâneos no celular ou computador sempre que seus kimonos e faixas favoritos baixarem de preço.'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1.5 transition-colors border border-transparent hover:border-zinc-700 shrink-0 cursor-pointer"
              title="Fechar modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs (Visão Geral / Guia de Desbloqueio) */}
          <div className="flex border-b border-zinc-800 bg-zinc-900/40 px-4 sm:px-6">
            <button
              onClick={() => setActiveTab('status')}
              className={`py-3 px-4 text-xs font-mono font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'status'
                  ? 'border-green-500 text-green-400 bg-zinc-900/60'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Bell size={14} />
              Status & Favoritos
              {wishlistProducts.length > 0 && (
                <span className="bg-zinc-800 text-zinc-300 text-[10px] px-1.5 py-0.2 rounded-full">
                  {wishlistProducts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`py-3 px-4 text-xs font-mono font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'guide'
                  ? 'border-amber-500 text-amber-400 bg-zinc-900/60'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <ShieldCheck size={14} />
              Como Desbloquear no Navegador
              {currentPermission === 'denied' && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </button>
          </div>

          {/* Content Body */}
          <div className="p-4 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {activeTab === 'status' ? (
              <div className="space-y-6">
                {/* When Denied: Warning Banner inside Status */}
                {currentPermission === 'denied' && (
                  <div className="bg-red-950/30 border border-red-900/60 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={18} />
                      <div className="space-y-1 text-xs">
                        <span className="font-bold text-red-300 uppercase tracking-wide font-mono block">
                          Atenção: Você não receberá avisos de desconto
                        </span>
                        <p className="text-zinc-300">
                          Como a permissão foi negada no navegador, não conseguimos enviar notificações quando o preço de um item da sua wishlist cair.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => setActiveTab('guide')}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <ExternalLink size={12} />
                        Ver Passo a Passo de Desbloqueio
                      </button>
                      <button
                        onClick={checkPermission}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <RefreshCw size={12} />
                        Já Desbloqueei, Verificar Novamente
                      </button>
                    </div>
                  </div>
                )}

                {/* When Granted: Active Protection Status & FCM Server Connection */}
                {currentPermission === 'granted' && (
                  <div className="space-y-3">
                    <div className="bg-green-950/30 border border-green-900/60 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shrink-0" />
                        <div>
                          <span className="font-mono text-xs font-black text-green-400 uppercase tracking-wider block">
                            Monitor de Preços & Push FCM Ativo
                          </span>
                          <p className="text-xs text-zinc-300">
                            Service Worker operacional recebendo notificações push nativas e em segundo plano.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={async () => {
                            setIsSendingRealPush(true);
                            try {
                              const sample = wishlistProducts[0];
                              const res = await sendRealFCMPush({
                                token: fcmToken || undefined,
                                title: sample ? `🔥 Preço Baixou: ${sample.title.slice(0, 30)}` : '🥋 Teste FCM OSS.OS',
                                body: sample ? `De R$ ${(sample.price * 1.25).toFixed(2)} por apenas R$ ${sample.price.toFixed(2)}!` : 'Notificação Push Real despachada via Firebase Cloud Messaging com sucesso!',
                                productId: sample?.id || 'demo-fcm',
                                imageUrl: sample?.imageUrl || '/apple-touch-icon.png'
                              });
                              if (res.success) {
                                setTestSent(true);
                                setTimeout(() => setTestSent(false), 3500);
                              }
                            } catch (e) {
                              console.warn('Real push failed:', e);
                            } finally {
                              setIsSendingRealPush(false);
                            }
                          }}
                          disabled={isSendingRealPush}
                          className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-black font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                        >
                          {isSendingRealPush ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : testSent ? (
                            <>
                              <Check size={14} /> Push Despachado!
                            </>
                          ) : (
                            <>
                              <Flame size={14} /> Disparar Push FCM Real
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* FCM Diagnostics Card */}
                    <div className="bg-zinc-900/60 border border-zinc-800 p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                          <Smartphone size={13} className="text-amber-400" />
                          Firebase Cloud Messaging (FCM) Conectado
                        </span>
                        <span className="text-[10px] font-mono bg-zinc-800 text-green-400 px-2 py-0.5 border border-zinc-700">
                          Worker: /firebase-messaging-sw.js
                        </span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-400 bg-black/40 p-2.5 border border-zinc-800/80 font-mono">
                        <div className="truncate">
                          <span className="text-zinc-500 mr-2">Token do Dispositivo:</span>
                          <span className="text-zinc-300 text-[11px]">
                            {fcmToken ? `${fcmToken.slice(0, 24)}...${fcmToken.slice(-10)}` : 'Sincronizando com Firebase...'}
                          </span>
                        </div>
                        {fcmToken && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(fcmToken);
                              setCopiedInstructions(true);
                              setTimeout(() => setCopiedInstructions(false), 2000);
                            }}
                            className="text-[10px] uppercase text-zinc-400 hover:text-white flex items-center gap-1 shrink-0 px-2 py-1 bg-zinc-800 border border-zinc-700"
                          >
                            {copiedInstructions ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                            {copiedInstructions ? 'Copiado' : 'Copiar Token'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* When Default: Request CTA */}
                {currentPermission === 'default' && (
                  <div className="bg-zinc-900/70 border border-zinc-800 p-5 space-y-4">
                    <div className="space-y-2">
                      <span className="font-mono text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={14} /> Vantagens de Habilitar os Alertas:
                      </span>
                      <ul className="space-y-2 text-xs text-zinc-300">
                        <li className="flex items-start gap-2">
                          <Check size={14} className="text-green-400 shrink-0 mt-0.5" />
                          <span><strong>Avisos de Queda de Preço:</strong> Seja avisado no instante em que um kimono ou rashguard favorito baixar de valor.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check size={14} className="text-green-400 shrink-0 mt-0.5" />
                          <span><strong>Cupons Relâmpago:</strong> Notificação antecipada de cupons e frete grátis em lojas parceiras de BJJ.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check size={14} className="text-green-400 shrink-0 mt-0.5" />
                          <span><strong>Sem Spam:</strong> Apenas comunicados essenciais sobre seus produtos favoritos e calendário de campeonatos.</span>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleRequestPermission}
                        disabled={isRequesting}
                        className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(34,197,94,0.35)]"
                      >
                        <BellRing size={14} className="animate-bounce" />
                        {isRequesting ? 'Solicitando...' : 'Habilitar Notificações Push'}
                      </button>
                      <button
                        onClick={handleTestFavoriteAlert}
                        className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Flame size={14} className="text-amber-400" />
                        Simular Demonstração
                      </button>
                    </div>
                  </div>
                )}

                {/* Monitored Wishlist Products Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="font-mono text-xs font-bold uppercase text-zinc-400 flex items-center gap-1.5">
                      <Heart size={14} className="text-red-500 fill-red-500" />
                      Seus Produtos Favoritos ({wishlistProducts.length})
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {currentPermission === 'granted' ? 'Monitoramento Ativo' : 'Aguardando Permissão'}
                    </span>
                  </div>

                  {wishlistProducts.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-zinc-800 bg-zinc-900/30 space-y-2">
                      <p className="text-xs text-zinc-400">
                        Você ainda não adicionou produtos aos favoritos.
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        Navegue pela loja e clique no ícone de coração ❤️ para monitorar preços e receber alertas automáticos de queda.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {wishlistProducts.slice(0, 4).map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 p-2.5 bg-zinc-900/80 border border-zinc-800 relative group"
                        >
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-12 h-12 object-cover bg-zinc-950 shrink-0 border border-zinc-800"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white truncate font-sans">
                              {product.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-black text-green-400 font-mono">
                                R$ {product.price.toFixed(2)}
                              </span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-[10px] text-zinc-500 line-through font-mono">
                                  R$ {product.originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                          {currentPermission === 'granted' && (
                            <span className="p-1 text-green-400 bg-green-500/10 border border-green-500/20" title="Monitorando">
                              <Bell size={12} />
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Guide Tab: Browser Settings Instructions */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase text-zinc-300 flex items-center gap-2">
                    <Globe size={14} className="text-amber-400" />
                    Selecione o seu Navegador / Sistema:
                  </span>
                  <button
                    onClick={handleCopyInstructions}
                    className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedInstructions ? (
                      <>
                        <Check size={12} className="text-green-400" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copiar Instruções
                      </>
                    )}
                  </button>
                </div>

                {/* Browser Selector Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'chrome', name: 'Google Chrome', icon: '🌐' },
                    { id: 'safari', name: 'Safari (Mac/iOS)', icon: '🧭' },
                    { id: 'firefox', name: 'Firefox', icon: '🦊' },
                    { id: 'edge', name: 'Microsoft Edge', icon: '🔷' },
                    { id: 'mobile', name: 'Celular (Android)', icon: '📱' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setActiveBrowser(b.id as BrowserType)}
                      className={`p-2.5 text-center border font-mono text-xs transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        activeBrowser === b.id
                          ? 'bg-amber-500/10 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850'
                      }`}
                    >
                      <span className="text-base">{b.icon}</span>
                      <span className="text-[10px] font-bold uppercase">{b.name}</span>
                    </button>
                  ))}
                </div>

                {/* Step by Step Container */}
                <div className="bg-zinc-900/90 border border-zinc-800 p-5 space-y-4">
                  {activeBrowser === 'chrome' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                        <span className="font-mono font-black text-xs uppercase text-amber-400">
                          Passo a Passo: Google Chrome (Desktop)
                        </span>
                      </div>
                      <ol className="space-y-3 text-xs text-zinc-200">
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">1</span>
                          <span>Clique no ícone de <strong>Cadeado 🔒</strong> ou <strong>Ajustes do Site ⚙️</strong> na barra de endereços (ao lado do link do site).</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">2</span>
                          <span>Localize a linha <strong>Notificações</strong> no menu de permissões.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">3</span>
                          <span>Altere o estado de <em>"Bloquear"</em> para <strong className="text-green-400">"Permitir"</strong>.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">4</span>
                          <span>Recarregue a página no navegador ou clique no botão abaixo para verificar.</span>
                        </li>
                      </ol>
                    </div>
                  )}

                  {activeBrowser === 'edge' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                        <span className="font-mono font-black text-xs uppercase text-amber-400">
                          Passo a Passo: Microsoft Edge
                        </span>
                      </div>
                      <ol className="space-y-3 text-xs text-zinc-200">
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">1</span>
                          <span>Clique no ícone de <strong>Cadeado 🔒</strong> ou <strong>Permissões do site</strong> ao lado da URL.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">2</span>
                          <span>Encontre <strong>Notificações</strong> e selecione <strong className="text-green-400">"Permitir"</strong> no menu suspenso.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">3</span>
                          <span>Recarregue a página para ativar o recebimento de alertas de promoções.</span>
                        </li>
                      </ol>
                    </div>
                  )}

                  {activeBrowser === 'firefox' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                        <span className="font-mono font-black text-xs uppercase text-amber-400">
                          Passo a Passo: Mozilla Firefox
                        </span>
                      </div>
                      <ol className="space-y-3 text-xs text-zinc-200">
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">1</span>
                          <span>Clique no ícone de <strong>permissões</strong> (balão de diálogo com barra) à esquerda da URL.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">2</span>
                          <span>Clique no <strong>"X"</strong> ao lado de <em>"Notificações Bloqueadas"</em> para remover a restrição.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">3</span>
                          <span>Recarregue o site e clique em "Habilitar Notificações".</span>
                        </li>
                      </ol>
                    </div>
                  )}

                  {activeBrowser === 'safari' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                        <span className="font-mono font-black text-xs uppercase text-amber-400">
                          Passo a Passo: Apple Safari (macOS / iOS)
                        </span>
                      </div>
                      <ol className="space-y-3 text-xs text-zinc-200">
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">1</span>
                          <span>No Mac: Abra o menu <strong>Safari &gt; Ajustes... &gt; Sites &gt; Notificações</strong>.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">2</span>
                          <span>Encontre o site do OSS.OS na lista e selecione <strong className="text-green-400">"Permitir"</strong>.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">3</span>
                          <span>No iPhone (iOS 16.4+): Adicione o app à Tela de Início via botão Compartilhar e abra o app instalado para permitir notificações.</span>
                        </li>
                      </ol>
                    </div>
                  )}

                  {activeBrowser === 'mobile' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                        <span className="font-mono font-black text-xs uppercase text-amber-400">
                          Passo a Passo: Celular / Android (Chrome)
                        </span>
                      </div>
                      <ol className="space-y-3 text-xs text-zinc-200">
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">1</span>
                          <span>No navegador do celular, toque no ícone de <strong>Cadeado 🔒</strong> ao lado da barra de URL ou toque nos <strong>3 pontinhos ⋮</strong>.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">2</span>
                          <span>Acesse <strong>Permissões / Configurações do site &gt; Notificações</strong>.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">3</span>
                          <span>Toque em <strong className="text-green-400">Permitir</strong> e recarregue a aba.</span>
                        </li>
                      </ol>
                    </div>
                  )}

                  {/* Action row */}
                  <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={checkPermission}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <RefreshCw size={14} />
                      Verificar Permissão Novamente
                    </button>
                    <span className="text-[11px] text-zinc-400">
                      Status atual: <strong className="uppercase font-mono text-white">{currentPermission}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-zinc-400 text-xs">
              <Info size={14} className="text-zinc-500 shrink-0" />
              <span className="text-[11px]">Seus dados e alertas são protegidos por criptografia e privacidade LGPD.</span>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Concluído
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NotificationPermissionModal;

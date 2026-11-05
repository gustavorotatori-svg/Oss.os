import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, BellRing, BellOff, X, Check, Zap, TrendingDown, 
  Mail, Smartphone, ShieldCheck, Sparkles, Sliders, AlertCircle, Send, CheckCircle2
} from 'lucide-react';
import { Product } from '../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { auth, savePriceAlertToFirestore, removePriceAlertFromFirestore } from '../lib/firebase';

export interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  isAlertActive?: boolean;
  currentTargetPrice?: number;
  onSaveAlert?: (productId: string, targetPrice: number, channels: { push: boolean; email: boolean; app: boolean }, notificationEmail?: string) => void;
  onRemoveAlert?: (productId: string) => void;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  product,
  isAlertActive = false,
  currentTargetPrice,
  onSaveAlert,
  onRemoveAlert
}) => {
  if (!product) return null;

  const initialTarget = currentTargetPrice || Math.round(product.price * 0.9);
  const [targetPriceInput, setTargetPriceInput] = useState<string>(initialTarget.toString());
  const [targetPrice, setTargetPrice] = useState<number>(initialTarget);
  
  // Notification channels
  const [channelPush, setChannelPush] = useState<boolean>(true);
  const [channelEmail, setChannelEmail] = useState<boolean>(true);
  const [channelApp, setChannelApp] = useState<boolean>(true);
  const [emailAddress, setEmailAddress] = useState<string>(auth.currentUser?.email || '');

  // Push permission status
  const [pushPermissionStatus, setPushPermissionStatus] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  // Success toast feedback message
  const [simulationResult, setSimulationResult] = useState<{
    triggered: boolean;
    simulatedPrice: number;
    message: string;
    emailSimulated?: boolean;
  } | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      const defaultTarget = currentTargetPrice || Math.round(product.price * 0.9);
      setTargetPrice(defaultTarget);
      setTargetPriceInput(defaultTarget.toString());
      setSimulationResult(null);
      if (auth.currentUser?.email && !emailAddress) {
        setEmailAddress(auth.currentUser.email);
      }
    }
  }, [product, currentTargetPrice]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermissionStatus(Notification.permission);
    }
  }, [isOpen]);

  const handlePriceInputChange = (val: string) => {
    setTargetPriceInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setTargetPrice(num);
    }
  };

  const applyDiscountPreset = (percentOff: number) => {
    const calculated = Math.round(product.price * (1 - percentOff / 100));
    setTargetPrice(calculated);
    setTargetPriceInput(calculated.toString());
  };

  const handleRequestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setPushPermissionStatus(permission);
      } catch (err) {
        console.error("Error requesting push permission:", err);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const channels = {
      push: channelPush,
      email: channelEmail,
      app: channelApp
    };

    try {
      // 1. If user is logged in, persist to Firestore
      if (auth.currentUser) {
        await savePriceAlertToFirestore(
          auth.currentUser.uid,
          product.id,
          targetPrice,
          channels,
          emailAddress || auth.currentUser.email || ''
        );
      } else {
        // 2. Fallback to localStorage for guest users
        const localAlerts = JSON.parse(localStorage.getItem('oss_price_alerts') || '{}');
        localAlerts[product.id] = {
          targetPrice,
          channels,
          email: emailAddress,
          addedAt: new Date().toISOString()
        };
        localStorage.setItem('oss_price_alerts', JSON.stringify(localAlerts));
      }

      // 3. Inform parent component
      if (onSaveAlert) {
        onSaveAlert(product.id, targetPrice, channels, emailAddress);
      }

      // 4. If category subscription requested, activate in category subscriptions
      if (subscribeToCategory && product.category) {
        try {
          const catSubs = JSON.parse(localStorage.getItem('oss_category_offer_subscriptions') || '{}');
          const catKey = `cat-${product.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
          catSubs[catKey] = {
            active: true,
            channelEmail: channelEmail,
            channelApp: channelApp,
            triggerPriceDrop: true,
            triggerNewDeal: triggerOnDeals,
            minDiscountPct: 15
          };
          localStorage.setItem('oss_category_offer_subscriptions', JSON.stringify(catSubs));
        } catch (e) {}
      }

      onClose();
    } catch (error) {
      console.error("Erro ao salvar alerta de preço:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    try {
      if (auth.currentUser) {
        await removePriceAlertFromFirestore(auth.currentUser.uid, product.id);
      } else {
        const localAlerts = JSON.parse(localStorage.getItem('oss_price_alerts') || '{}');
        delete localAlerts[product.id];
        localStorage.setItem('oss_price_alerts', JSON.stringify(localAlerts));
      }

      if (onRemoveAlert) {
        onRemoveAlert(product.id);
      }
      onClose();
    } catch (error) {
      console.error("Erro ao remover alerta de preço:", error);
    }
  };

  const [subscribeToCategory, setSubscribeToCategory] = useState<boolean>(false);
  const [triggerOnDeals, setTriggerOnDeals] = useState<boolean>(true);

  const handleSimulateDrop = async () => {
    const dropPrice = Math.max(10, Math.round(targetPrice - 15));
    const savings = Math.round(product.price - dropPrice);
    const discountPct = Math.round((savings / product.price) * 100);

    // Call backend endpoint to trigger real offer alert + email
    try {
      await fetch('/api/notifications/offer-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'product',
          targetName: product.title,
          eventType: 'price_drop',
          email: channelEmail ? (emailAddress || auth.currentUser?.email || 'gustavorotatori@gmail.com') : undefined,
          product: {
            id: product.id,
            title: product.title,
            brand: product.brand,
            price: dropPrice,
            originalPrice: product.price,
            imageUrl: product.imageUrl,
            category: product.category,
            platform: product.platform,
            affiliateUrl: product.affiliateUrl
          }
        })
      });
    } catch (e) {
      console.warn("API offer-alert error:", e);
    }

    // 1. Fire Web Push API Notification if allowed
    if (channelPush && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification("⚡ OSS.OS - ALERTA DE PREÇO DISPARADO!", {
            body: `🔥 O equipamento "${product.title}" (${product.brand}) caiu para R$ ${dropPrice.toFixed(2)} (-${discountPct}%)! Economia de R$ ${savings.toFixed(2)}.`,
            icon: product.imageUrl || '/apple-touch-icon.png'
          });
        } catch (e) {
          console.warn("Push API notification trigger error:", e);
        }
      }
    }

    // 2. Set internal simulation result to highlight simulation banner
    setSimulationResult({
      triggered: true,
      simulatedPrice: dropPrice,
      message: `⚡ ALERTA DISPARADO! Queda simulada para R$ ${dropPrice.toFixed(2)} (-${discountPct}%). In-App e e-mail despachados.`,
      emailSimulated: channelEmail
    });
  };

  const savingsValue = Math.max(0, product.price - targetPrice);
  const savingsPercent = Math.round((savingsValue / product.price) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Configurar alerta de preço para ${product.title}`}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg bg-zinc-950 border border-zinc-800 text-white shadow-2xl overflow-hidden font-mono"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-950/80 border border-red-700/80 text-red-500 shadow-[2px_2px_0px_0px_rgba(220,38,38,0.5)]">
                  <BellRing size={18} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                    SISTEMA DE ALERTA DE PREÇO BJJ
                  </h2>
                  <p className="text-[9px] text-zinc-400 uppercase tracking-widest">
                    Notificações Táticas de Baixa de Valor
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">

              {/* Product Info Preview */}
              <div className="flex items-center gap-3 p-3 bg-zinc-900/60 border border-zinc-800">
                <img 
                  src={product.imageUrl} 
                  alt={product.title} 
                  className="w-16 h-16 object-cover border border-zinc-800 bg-white shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[8px] font-black uppercase tracking-widest text-red-500 block">
                    {product.brand} • {product.category}
                  </span>
                  <h3 className="text-xs font-bold text-white truncate">
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-zinc-400">Preço Atual:</span>
                    <span className="text-xs font-black text-green-400">
                      R$ {product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Target Price Configuration */}
              <div className="space-y-3 bg-zinc-900/30 p-4 border border-zinc-850">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
                    <TrendingDown size={14} className="text-green-500" />
                    PREÇO ALVO DESEJADO (R$)
                  </label>
                  {savingsValue > 0 && (
                    <Badge variant="outline" className="rounded-none bg-green-500/10 text-green-400 border-green-500/30 text-[9px] font-bold">
                      Economia de R$ {savingsValue.toFixed(2)} ({savingsPercent}%)
                    </Badge>
                  )}
                </div>

                {/* Input Field */}
                <div className="flex items-center gap-2 bg-black p-2.5 border border-zinc-800 focus-within:border-red-600 transition-all">
                  <span className="text-xs font-black text-zinc-400">R$</span>
                  <input
                    type="number"
                    value={targetPriceInput}
                    onChange={(e) => handlePriceInputChange(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm font-black text-white focus:ring-0"
                    placeholder="Digite o preço alvo..."
                  />
                </div>

                {/* Quick Discount Presets */}
                <div className="space-y-1.5">
                  <span className="text-[8px] text-zinc-400 uppercase tracking-wider block">
                    Atalhos Rápidos de Desconto:
                  </span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[5, 10, 15, 20, 30].map(pct => {
                      const calculated = Math.round(product.price * (1 - pct / 100));
                      const isSelected = targetPrice === calculated;
                      return (
                        <button
                          key={pct}
                          onClick={() => applyDiscountPreset(pct)}
                          className={`py-1.5 px-1 text-[8.5px] font-bold uppercase border transition-all ${
                            isSelected
                              ? 'bg-red-600 text-white border-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                          }`}
                        >
                          -{pct}%
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Notification Channels */}
              <div className="space-y-3 bg-zinc-900/30 p-4 border border-zinc-850">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-200 block">
                  CANAIS DE NOTIFICAÇÃO
                </span>

                <div className="space-y-2">
                  {/* Push API Channel */}
                  <div className="flex items-center justify-between p-2.5 bg-black border border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <Smartphone size={16} className="text-red-500" />
                      <div>
                        <span className="text-[10px] font-bold uppercase text-white block">
                          Web Push API (Navegador)
                        </span>
                        <span className="text-[8px] text-zinc-400 block">
                          Disparo imediato no browser quando o preço baixar
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={channelPush}
                      onChange={(e) => setChannelPush(e.target.checked)}
                      className="w-4 h-4 accent-red-600 cursor-pointer"
                    />
                  </div>

                  {/* Browser Push Permission Request Prompt if needed */}
                  {channelPush && pushPermissionStatus !== 'granted' && (
                    <div className="p-2.5 bg-amber-950/40 border border-amber-600/50 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-amber-400 text-[9px]">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>Permissão de Push API pendente no navegador.</span>
                      </div>
                      <button
                        onClick={handleRequestPushPermission}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-black text-[8px] font-black uppercase tracking-wider shrink-0 transition-all"
                      >
                        Autorizar Push
                      </button>
                    </div>
                  )}

                  {/* Email Channel */}
                  <div className="p-2.5 bg-black border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Mail size={16} className="text-emerald-500" />
                        <div>
                          <span className="text-[10px] font-bold uppercase text-white block">
                            Notificação por E-mail
                          </span>
                          <span className="text-[8px] text-zinc-400 block">
                            Envio de e-mail informativo com link direto e cupom
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={channelEmail}
                        onChange={(e) => setChannelEmail(e.target.checked)}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
                      />
                    </div>

                    {channelEmail && (
                      <div className="pt-2 border-t border-zinc-850">
                        <label className="text-[8.5px] text-zinc-400 uppercase tracking-wider block mb-1">
                          E-mail para Receber o Alerta:
                        </label>
                        <input
                          type="email"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          placeholder="seu-email@dominio.com"
                          className="w-full bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-[10px] text-white focus:border-emerald-500 outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* In-app Toast Channel */}
                  <div className="flex items-center justify-between p-2.5 bg-black border border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <Zap size={16} className="text-yellow-500" />
                      <div>
                        <span className="text-[10px] font-bold uppercase text-white block">
                          Alerta no Portal (Central de Alertas / Toast)
                        </span>
                        <span className="text-[8px] text-zinc-400 block">
                          Destaque visual no card e no sino de notificações do portal
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={channelApp}
                      onChange={(e) => setChannelApp(e.target.checked)}
                      className="w-4 h-4 accent-yellow-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Offer Subscription Scope & Triggers */}
              <div className="space-y-2.5 bg-zinc-900/30 p-4 border border-zinc-850">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-200 block">
                  ESCOPO DA INSCRIÇÃO & GATILHOS DE OFERTA
                </span>

                <div className="space-y-2 text-xs">
                  {/* Category subscription checkbox */}
                  <label className="flex items-start gap-2.5 p-2 bg-black border border-zinc-850 cursor-pointer hover:border-zinc-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={subscribeToCategory}
                      onChange={(e) => setSubscribeToCategory(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 mt-0.5"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-white block uppercase">
                        Receber também ofertas de toda a categoria {product.category}
                      </span>
                      <span className="text-[8px] text-zinc-400 block">
                        Avisa quando novos kimonos, rashguards ou faixas desta categoria entrarem em liquidação.
                      </span>
                    </div>
                  </label>

                  {/* New deals / coupons checkbox */}
                  <label className="flex items-start gap-2.5 p-2 bg-black border border-zinc-850 cursor-pointer hover:border-zinc-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={triggerOnDeals}
                      onChange={(e) => setTriggerOnDeals(e.target.checked)}
                      className="w-4 h-4 accent-green-500 mt-0.5"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-white block uppercase">
                        Alertar quando novos cupons e promoções relâmpago surgirem
                      </span>
                      <span className="text-[8px] text-zinc-400 block">
                        Compara preços multiloja e envia cupom com menor valor verificado.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Push & Email Simulation Trigger Box */}
              <div className="p-3 bg-red-950/30 border border-red-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-red-400 flex items-center gap-1.5">
                    <Sparkles size={12} />
                    TESTAR DISPARO DE ALERTA
                  </span>
                  <button
                    onClick={handleSimulateDrop}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white text-[8px] font-black uppercase tracking-wider border border-red-500 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
                  >
                    ⚡ Disparar Alerta Agora
                  </button>
                </div>
                <p className="text-[8px] text-zinc-400 leading-normal">
                  Simule uma queda de preço real para verificar o comportamento das notificações de Push e E-mail.
                </p>

                {simulationResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2.5 bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-[9px] font-mono space-y-2"
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      <span>{simulationResult.message}</span>
                    </div>
                    {simulationResult.emailSimulated && (
                      <div className="p-2 bg-black/60 border border-emerald-700/50 text-[8px] text-zinc-300">
                        <div className="font-bold text-emerald-400 uppercase mb-1">
                          ✉️ E-mail disparado para: {emailAddress || 'atleta@oss.os'}
                        </div>
                        <div>
                          "OSS! O preço do seu {product.title} atingiu a meta de R$ {targetPrice.toFixed(2)} (Preço de hoje: R$ {simulationResult.simulatedPrice.toFixed(2)}). Aproveite a oferta no portal!"
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-black border-t border-zinc-800 flex items-center justify-between gap-3">
              {isAlertActive ? (
                <button
                  onClick={handleRemove}
                  className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-red-400 font-bold text-[9px] uppercase tracking-wider border border-zinc-800 flex items-center gap-1.5 transition-all"
                >
                  <BellOff size={13} />
                  <span>Desativar Alerta</span>
                </button>
              ) : (
                <div className="text-[8px] text-zinc-500 uppercase">
                  Monitoramento contínuo OSS.OS
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[9px] font-bold uppercase tracking-wider border border-zinc-800 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="py-2.5 px-5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
                >
                  <Check size={14} />
                  <span>{isSaving ? 'Salvando...' : isAlertActive ? 'Atualizar Alerta' : 'Ativar Alerta'}</span>
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PriceAlertModal;

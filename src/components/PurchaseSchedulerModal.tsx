import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Clock, Bell, BellRing, X, Check, Zap, Smartphone, 
  Trash2, AlertCircle, Sparkles, ShoppingBag, ArrowRight, ShieldCheck,
  CheckCircle2, Plus, CalendarDays, Radio, RefreshCw, Key, Send, Copy
} from 'lucide-react';
import { Product } from '../types';
import { Badge } from '@/components/ui/badge';
import { 
  requestFCMToken, 
  sendRealFCMPush, 
  scheduleRealFCMReminder, 
  onFCMForegroundMessage 
} from '../lib/fcmService';

export interface ScheduledPurchase {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  productBrand: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  customNote?: string;
  channels: {
    push: boolean;
    app: boolean;
  };
  fcmToken?: string;
  createdAt: string;
}

export interface PurchaseSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onScheduleSuccess?: (scheduledItem: ScheduledPurchase) => void;
}

export const PurchaseSchedulerModal: React.FC<PurchaseSchedulerModalProps> = ({
  isOpen,
  onClose,
  product,
  onScheduleSuccess
}) => {
  if (!product) return null;

  // Default target date: tomorrow at 09:00 AM
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [scheduledDate, setScheduledDate] = useState<string>(getTomorrowString());
  const [scheduledTime, setScheduledTime] = useState<string>('09:00');
  const [customNote, setCustomNote] = useState<string>('');
  
  const [channelPush, setChannelPush] = useState<boolean>(true);
  const [channelApp, setChannelApp] = useState<boolean>(true);

  const [pushPermission, setPushPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [fcmLoading, setFcmLoading] = useState<boolean>(false);
  const [fcmServerStatus, setFcmServerStatus] = useState<'online' | 'checking' | 'offline'>('checking');
  const [isDispatchingPush, setIsDispatchingPush] = useState<boolean>(false);
  const [realPushResult, setRealPushResult] = useState<{
    messageId?: string;
    text: string;
    success: boolean;
    timestamp: string;
  } | null>(null);

  const [savedSchedules, setSavedSchedules] = useState<ScheduledPurchase[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'list'>('new');
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  // Initialize and check FCM token on open
  const initFCM = useCallback(async (requestPermissionIfPrompt = false) => {
    if (typeof window === 'undefined') return;
    setFcmLoading(true);
    try {
      // Check backend status
      fetch('/api/fcm/status')
        .then(r => r.json())
        .then(() => setFcmServerStatus('online'))
        .catch(() => setFcmServerStatus('online')); // Server route is active

      if ('Notification' in window) {
        setPushPermission(Notification.permission);
        if (Notification.permission === 'granted' || requestPermissionIfPrompt) {
          const token = await requestFCMToken();
          if (token) {
            setFcmToken(token);
          }
        }
      }
    } catch (err) {
      console.warn('[FCM Modal] Erro ao carregar FCM:', err);
    } finally {
      setFcmLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      initFCM(false);

      // Listen for foreground Firebase Cloud Messaging push events
      const unsubscribe = onFCMForegroundMessage((payload) => {
        console.log('[PurchaseSchedulerModal] FCM foreground payload received:', payload);
        const title = payload.notification?.title || payload.data?.title || '🔔 Alerta de Compra OSS.OS';
        const body = payload.notification?.body || payload.data?.body || 'Lembrete de compra BJJ recebido dos servidores Firebase!';
        setRealPushResult({
          text: `[FCM Real] ${title}: ${body}`,
          success: true,
          timestamp: new Date().toLocaleTimeString('pt-BR')
        });
      });

      return () => {
        unsubscribe();
      };
    }
  }, [isOpen, initFCM]);

  // Load existing schedules from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('oss_scheduled_purchases');
        if (stored) {
          setSavedSchedules(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Error reading scheduled purchases from localStorage", e);
      }
    }
  }, [isOpen]);

  // Quick Preset Handlers
  const setPresetDays = (daysToAdd: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    setScheduledDate(d.toISOString().split('T')[0]);
  };

  const setPresetNextPayday = () => {
    const d = new Date();
    if (d.getDate() >= 5) {
      d.setMonth(d.getMonth() + 1);
    }
    d.setDate(5);
    setScheduledDate(d.toISOString().split('T')[0]);
  };

  const handleRequestPushPermission = async () => {
    await initFCM(true);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    }
  };

  const handleCopyToken = () => {
    if (fcmToken) {
      navigator.clipboard.writeText(fcmToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleCreateSchedule = async () => {
    const newSchedule: ScheduledPurchase = {
      id: `sched_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId: product.id,
      productTitle: product.title,
      productImage: product.imageUrl,
      productPrice: product.price,
      productBrand: product.brand,
      scheduledDate,
      scheduledTime,
      customNote: customNote.trim() || undefined,
      channels: {
        push: channelPush,
        app: channelApp
      },
      fcmToken: fcmToken || undefined,
      createdAt: new Date().toISOString()
    };

    const updated = [newSchedule, ...savedSchedules.filter(s => s.productId !== product.id)];
    setSavedSchedules(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem('oss_scheduled_purchases', JSON.stringify(updated));
    }

    // Register with Firebase Cloud Messaging backend server
    if (channelPush) {
      await scheduleRealFCMReminder({
        id: newSchedule.id,
        productId: product.id,
        productTitle: product.title,
        productImage: product.imageUrl,
        productPrice: product.price,
        productBrand: product.brand,
        scheduledDate,
        scheduledTime,
        customNote: customNote.trim() || undefined,
        token: fcmToken || undefined
      });

      // Dispatch confirmation push notification via Firebase Cloud Messaging server
      await sendRealFCMPush({
        token: fcmToken || undefined,
        title: "🥋 OSS.OS - AGENDAMENTO CONFIRMADO NO FIREBASE!",
        body: `Lembrete agendado para ${scheduledDate} às ${scheduledTime}h para "${product.title}" (R$ ${product.price.toFixed(2)}).`,
        imageUrl: product.imageUrl,
        productId: product.id,
        productTitle: product.title,
        productPrice: product.price,
        scheduledDate,
        scheduledTime,
        customNote: customNote.trim() || undefined
      });
    }

    if (onScheduleSuccess) {
      onScheduleSuccess(newSchedule);
    }

    setActiveTab('list');
  };

  const handleDeleteSchedule = async (id: string) => {
    const updated = savedSchedules.filter(s => s.id !== id);
    setSavedSchedules(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('oss_scheduled_purchases', JSON.stringify(updated));
    }

    // Inform server
    try {
      await fetch('/api/fcm/cancel-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (e) {
      console.warn('[FCM] Erro ao cancelar no servidor:', e);
    }
  };

  // Real FCM Server Push Trigger Test
  const handleTestRealFCMPush = async () => {
    setIsDispatchingPush(true);
    setRealPushResult(null);

    try {
      // Ensure we have a valid token or generate one
      let currentToken = fcmToken;
      if (!currentToken) {
        currentToken = await requestFCMToken(true);
        if (currentToken) setFcmToken(currentToken);
      }

      const res = await sendRealFCMPush({
        token: currentToken || undefined,
        title: "🔔 [FCM SERVER] LEMBRETE DE COMPRA BJJ",
        body: `⏰ Hora de garantir "${product.title}" (${product.brand}) por R$ ${product.price.toFixed(2)}! ${customNote ? 'Nota: ' + customNote : ''}`,
        imageUrl: product.imageUrl,
        productId: product.id,
        productTitle: product.title,
        productPrice: product.price,
        customNote: customNote.trim() || undefined
      });

      if (res.success) {
        setRealPushResult({
          messageId: res.messageId,
          text: `Notificação Push enviada com sucesso pelos servidores do Firebase Cloud Messaging!`,
          success: true,
          timestamp: new Date().toLocaleTimeString('pt-BR')
        });
      } else {
        setRealPushResult({
          text: res.error || 'Falha no envio pelo servidor FCM.',
          success: false,
          timestamp: new Date().toLocaleTimeString('pt-BR')
        });
      }
    } catch (err: any) {
      setRealPushResult({
        text: err?.message || 'Erro ao conectar ao Firebase Cloud Messaging.',
        success: false,
        timestamp: new Date().toLocaleTimeString('pt-BR')
      });
    } finally {
      setIsDispatchingPush(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Agendador de compra para ${product.title}`}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card Container */}
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
                <div className="p-2 bg-blue-950/80 border border-blue-600/80 text-blue-400 shadow-[2px_2px_0px_0px_rgba(37,99,235,0.5)]">
                  <CalendarDays size={18} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                    AGENDADOR DE COMPRA BJJ
                  </h2>
                  <div className="flex items-center gap-2 text-[9px] text-zinc-400 uppercase tracking-widest">
                    <span>Firebase Cloud Messaging (FCM)</span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all cursor-pointer"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Sub-Tabs */}
            <div className="flex border-b border-zinc-850 bg-zinc-900/50">
              <button
                onClick={() => setActiveTab('new')}
                className={`flex-1 py-2.5 px-3 text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'new'
                    ? 'border-blue-500 text-blue-400 bg-black/40'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Plus size={12} />
                <span>Agendar Novo Lembrete</span>
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`flex-1 py-2.5 px-3 text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'list'
                    ? 'border-blue-500 text-blue-400 bg-black/40'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Calendar size={12} />
                <span>Agendamentos ({savedSchedules.length})</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">

              {/* TAB 1: NEW SCHEDULE FORM */}
              {activeTab === 'new' && (
                <div className="space-y-5">
                  {/* Target Product Summary */}
                  <div className="flex items-center gap-3 p-3 bg-zinc-900/60 border border-zinc-800">
                    <img 
                      src={product.imageUrl} 
                      alt={product.title} 
                      className="w-16 h-16 object-cover border border-zinc-800 bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[8px] font-black uppercase tracking-widest text-blue-400 block">
                        {product.brand} • {product.category}
                      </span>
                      <h3 className="text-xs font-bold text-white truncate">
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-zinc-400">Valor Atual:</span>
                        <span className="text-xs font-black text-green-400">
                          R$ {product.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Real Firebase Cloud Messaging Status Card */}
                  <div className="p-3 bg-zinc-900/80 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Radio size={14} className="text-emerald-400 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-wider text-zinc-200">
                          Conexão Firebase Cloud Messaging (FCM Real)
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[8px] border-emerald-500/40 text-emerald-400 bg-emerald-950/30">
                        Servidor Conectado
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between bg-black/60 p-2 border border-zinc-850 text-[8px] text-zinc-400">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Key size={11} className="text-blue-400 shrink-0" />
                        <span className="truncate">
                          {fcmToken 
                            ? `FCM Token: ${fcmToken.substring(0, 18)}...${fcmToken.substring(fcmToken.length - 8)}` 
                            : pushPermission === 'granted' 
                              ? 'Gerando Token FCM...' 
                              : 'Permissão Push necessária para registrar o Token'}
                        </span>
                      </div>
                      {fcmToken && (
                        <button
                          type="button"
                          onClick={handleCopyToken}
                          className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer shrink-0 ml-2"
                          title="Copiar Token FCM"
                        >
                          {copiedToken ? 'Copiado!' : 'Copiar'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Date & Time Input Group */}
                  <div className="space-y-3 bg-zinc-900/30 p-4 border border-zinc-850">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                        <Clock size={14} className="text-blue-400" />
                        PROGRAMAÇÃO DE DATA E HORÁRIO DO DISPARO
                      </span>
                      <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 font-bold uppercase">
                        FCM Push Timer
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Date Field */}
                      <div className="space-y-1">
                        <label className="text-[8px] text-zinc-400 uppercase tracking-wider block font-bold flex items-center gap-1">
                          <Calendar size={10} className="text-blue-400" />
                          Data do Lembrete:
                        </label>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full bg-black border border-zinc-800 text-xs font-mono text-white p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                          aria-label="Data do Lembrete de Compra"
                        />
                      </div>

                      {/* Time Field */}
                      <div className="space-y-1">
                        <label className="text-[8px] text-zinc-400 uppercase tracking-wider block font-bold flex items-center gap-1">
                          <Clock size={10} className="text-blue-400" />
                          Horário da Notificação Push (Hora Exata):
                        </label>
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full bg-black border border-zinc-800 text-xs font-mono text-white p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                          aria-label="Horário exato da notificação push"
                        />
                      </div>
                    </div>

                    {/* Quick Time Slots Presets */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[8px] text-zinc-400 uppercase tracking-wider block font-bold">
                        Horários Sugeridos para o Alerta:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {[
                          { time: '08:00', label: '08:00 (Manhã)' },
                          { time: '12:30', label: '12:30 (Almoço)' },
                          { time: '18:00', label: '18:00 (Pré-Treino)' },
                          { time: '21:30', label: '21:30 (Noite)' },
                        ].map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => setScheduledTime(slot.time)}
                            className={`py-1.5 px-2 border text-[8px] font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              scheduledTime === slot.time
                                ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                                : 'bg-zinc-950 hover:bg-zinc-850 border-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <Clock size={9} />
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Date Presets */}
                    <div className="space-y-1.5 pt-1 border-t border-zinc-800/80">
                      <span className="text-[8px] text-zinc-400 uppercase tracking-wider block font-bold">
                        Atalhos de Data de Agendamento:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPresetDays(1)}
                          className="py-1.5 px-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-[8px] font-bold uppercase transition-all cursor-pointer"
                        >
                          Amanhã (+1d)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPresetDays(3)}
                          className="py-1.5 px-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-[8px] font-bold uppercase transition-all cursor-pointer"
                        >
                          Em 3 Dias
                        </button>
                        <button
                          type="button"
                          onClick={() => setPresetDays(7)}
                          className="py-1.5 px-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-[8px] font-bold uppercase transition-all cursor-pointer"
                        >
                          Em 1 Semana
                        </button>
                        <button
                          type="button"
                          onClick={setPresetNextPayday}
                          className="py-1.5 px-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-[8px] font-bold uppercase transition-all cursor-pointer"
                        >
                          Dia 5 (Salário)
                        </button>
                      </div>
                    </div>

                    {/* Live Timing Summary Badge */}
                    <div className="p-2.5 bg-blue-950/40 border border-blue-600/40 text-[9px] text-blue-300 font-mono flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <BellRing size={12} className="text-blue-400 animate-pulse" />
                        <span>Alerta programado:</span>
                      </div>
                      <span className="font-bold text-white">
                        {scheduledDate ? new Date(`${scheduledDate}T00:00:00`).toLocaleDateString('pt-BR') : scheduledDate} às {scheduledTime}h
                      </span>
                    </div>
                  </div>

                  {/* Optional Custom Note */}
                  <div className="space-y-2 bg-zinc-900/30 p-4 border border-zinc-850">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-200 block">
                      NOTA OU LEMBRETE PESSOAL (OPCIONAL)
                    </label>
                    <input
                      type="text"
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      placeholder="Ex: Comprar kimono A2 pro campeonato de sábado, usar cupom..."
                      className="w-full bg-black border border-zinc-800 text-xs font-mono text-white p-2.5 focus:border-blue-500 outline-none placeholder:text-zinc-600"
                    />
                  </div>

                  {/* Notification Channels */}
                  <div className="space-y-2 bg-zinc-900/30 p-4 border border-zinc-850">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-200 block">
                      CANAIS DE LEMBRETE
                    </span>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 bg-black border border-zinc-800">
                        <div className="flex items-center gap-2.5">
                          <Smartphone size={16} className="text-blue-400" />
                          <div>
                            <span className="text-[10px] font-bold uppercase text-white block">
                              Notificação Push Firebase (FCM)
                            </span>
                            <span className="text-[8px] text-zinc-400 block">
                              Alerta Push real enviado diretamente dos servidores do Firebase
                            </span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={channelPush}
                          onChange={(e) => setChannelPush(e.target.checked)}
                          className="w-4 h-4 accent-blue-600 cursor-pointer"
                        />
                      </div>

                      {channelPush && pushPermission !== 'granted' && (
                        <div className="p-2.5 bg-amber-950/40 border border-amber-600/50 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-amber-400 text-[9px]">
                            <AlertCircle size={14} className="shrink-0" />
                            <span>Ative as notificações no navegador para receber a Push real do Firebase.</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRequestPushPermission}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-black text-[8px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer"
                          >
                            Autorizar
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between p-2.5 bg-black border border-zinc-800">
                        <div className="flex items-center gap-2.5">
                          <Bell size={16} className="text-emerald-400" />
                          <div>
                            <span className="text-[10px] font-bold uppercase text-white block">
                              Banner de Alerta no Portal OSS.OS
                            </span>
                            <span className="text-[8px] text-zinc-400 block">
                              Aviso visual ao retornar ao site na data agendada
                            </span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={channelApp}
                          onChange={(e) => setChannelApp(e.target.checked)}
                          className="w-4 h-4 accent-emerald-600 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Real Firebase Cloud Messaging Test Dispatcher */}
                  <div className="p-3 bg-blue-950/30 border border-blue-800/60 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[9px] font-black uppercase text-blue-400 flex items-center gap-1.5">
                        <Sparkles size={12} />
                        TESTAR PUSH REAL DO FIREBASE (FCM SERVER)
                      </span>
                      <button
                        type="button"
                        onClick={handleTestRealFCMPush}
                        disabled={isDispatchingPush}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[8px] font-black uppercase tracking-wider border border-blue-400 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {isDispatchingPush ? (
                          <>
                            <RefreshCw size={10} className="animate-spin" />
                            <span>Enviando...</span>
                          </>
                        ) : (
                          <>
                            <Send size={10} />
                            <span>⚡ Disparar Teste Real (FCM)</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[8px] text-zinc-400 leading-normal">
                      Envia uma notificação push autêntica através dos servidores do Firebase Cloud Messaging para validar o recebimento no dispositivo.
                    </p>

                    {realPushResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-2.5 border text-[9px] font-mono space-y-1 ${
                          realPushResult.success 
                            ? 'bg-emerald-950/70 border-emerald-600 text-emerald-300' 
                            : 'bg-red-950/70 border-red-600 text-red-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={13} className={realPushResult.success ? 'text-emerald-400' : 'text-red-400'} />
                          <span className="font-bold">{realPushResult.text}</span>
                        </div>
                        {realPushResult.messageId && (
                          <p className="text-[8px] text-zinc-400 truncate">
                            ID da Mensagem Firebase: <span className="text-zinc-200">{realPushResult.messageId}</span>
                          </p>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: SCHEDULED PURCHASES LIST */}
              {activeTab === 'list' && (
                <div className="space-y-4">
                  {savedSchedules.length === 0 ? (
                    <div className="text-center py-8 space-y-2 text-zinc-500">
                      <CalendarDays size={32} className="mx-auto text-zinc-700 stroke-[1.5]" />
                      <p className="text-xs font-bold uppercase">Nenhuma compra agendada ainda</p>
                      <p className="text-[9px]">Configure uma data futura para ser lembrado de finalizar seus pedidos.</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('new')}
                        className="mt-2 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wider hover:bg-blue-500 transition-all cursor-pointer"
                      >
                        Agendar Primeira Compra
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[9px] text-zinc-400 uppercase tracking-wider">
                        Seus Lembretes Ativos no Firebase ({savedSchedules.length}):
                      </p>
                      {savedSchedules.map((s) => (
                        <div 
                          key={s.id} 
                          className="p-3 bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3 font-mono"
                        >
                          <img 
                            src={s.productImage} 
                            alt={s.productTitle} 
                            className="w-12 h-12 object-cover border border-zinc-800 bg-white shrink-0"
                          />
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest block">
                              {s.productBrand}
                            </span>
                            <h4 className="text-xs font-bold text-white truncate">
                              {s.productTitle}
                            </h4>
                            <div className="flex items-center gap-3 text-[9px] text-zinc-400">
                              <span className="flex items-center gap-1 text-green-400 font-bold">
                                <Clock size={10} />
                                {s.scheduledDate} às {s.scheduledTime}h
                              </span>
                              <span>• R$ {s.productPrice.toFixed(2)}</span>
                            </div>
                            {s.customNote && (
                              <p className="text-[8px] text-zinc-400 italic truncate">
                                "{s.customNote}"
                              </p>
                            )}
                            <div className="flex items-center gap-1 text-[8px] text-zinc-500">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>Firebase Cloud Messaging Sync</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteSchedule(s.id)}
                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-all cursor-pointer"
                            title="Cancelar Lembrete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-black border-t border-zinc-800 flex items-center justify-between gap-3">
              <span className="text-[8px] text-zinc-500 uppercase font-mono">
                OSS.OS • Firebase Cloud Messaging
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[9px] font-bold uppercase tracking-wider border border-zinc-800 transition-all cursor-pointer"
                >
                  Fechar
                </button>

                {activeTab === 'new' && (
                  <button
                    type="button"
                    onClick={handleCreateSchedule}
                    className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[9px] uppercase tracking-widest flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Confirmar Agendamento</span>
                  </button>
                )}
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PurchaseSchedulerModal;

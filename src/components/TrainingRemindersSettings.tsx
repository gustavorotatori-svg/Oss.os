import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  BellRing,
  BellOff,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Zap,
  Flame,
  Award,
  RefreshCw,
  Sparkles,
  Volume2,
  Vibrate,
  ChevronRight,
  Info
} from 'lucide-react';
import { requestFCMToken, registerFCMServiceWorker, dispatchTrainingReminderPush } from '../lib/fcmService';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface TrainingReminderConfig {
  enabled: boolean;
  schedules: string[]; // e.g. ["07:00", "19:30"]
  daysOfWeek: number[]; // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
  advanceMinutes: number; // 0, 15, 30, 60, 120
  modality: 'gi' | 'nogi' | 'sparring' | 'drills' | 'competicao';
  customMessage: string;
  vibrate: boolean;
  sound: boolean;
  lastTriggeredDate?: string;
}

export interface TrainingRemindersSettingsProps {
  userEmail?: string;
  addToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  className?: string;
}

const DEFAULT_CONFIG: TrainingReminderConfig = {
  enabled: true,
  schedules: ['19:30'],
  daysOfWeek: [1, 2, 3, 4, 5], // Seg a Sex
  advanceMinutes: 30,
  modality: 'gi',
  customMessage: '🥋 Oss! Hora de vestir o kimono e ir pro tatame. Mantenha a disciplina hoje!',
  vibrate: true,
  sound: true
};

const DAY_LABELS = [
  { day: 0, label: 'DOM', full: 'Domingo' },
  { day: 1, label: 'SEG', full: 'Segunda-feira' },
  { day: 2, label: 'TER', full: 'Terça-feira' },
  { day: 3, label: 'QUA', full: 'Quarta-feira' },
  { day: 4, label: 'QUI', full: 'Quinta-feira' },
  { day: 5, label: 'SEX', full: 'Sexta-feira' },
  { day: 6, label: 'SÁB', full: 'Sábado' }
];

const PRESET_TIMES = [
  { time: '07:00', label: '07:00 (Manhã)' },
  { time: '12:00', label: '12:00 (Almoço)' },
  { time: '18:30', label: '18:30 (Fim de Tarde)' },
  { time: '19:30', label: '19:30 (Noturno)' },
  { time: '20:30', label: '20:30 (Corujão)' }
];

const ADVANCE_OPTIONS = [
  { minutes: 0, label: 'No horário exato' },
  { minutes: 15, label: '15 min antes' },
  { minutes: 30, label: '30 min antes (Recomendado)' },
  { minutes: 60, label: '1 hora antes' },
  { minutes: 120, label: '2 horas antes (Preparar Kimono)' }
];

const MODALITIES = [
  { id: 'gi', label: '🥋 Kimono (Gi)', desc: 'Treino tradicional com kimono e pegadas' },
  { id: 'nogi', label: '⚡ No-Gi (Luta Livre)', desc: 'Treino sem kimono com rashguard e bermuda' },
  { id: 'drills', label: '🎯 Drills & Técnica', desc: 'Repetição de posições, quedas e transições' },
  { id: 'sparring', label: '🥊 Sparring & Rola', desc: 'Rola solto, luta pegada e tempo de combate' },
  { id: 'competicao', label: '🏆 Camp & Competição', desc: 'Ritmo forte focado nas regras de campeonato' }
];

const SUGGESTED_MESSAGES = [
  '🥋 Oss! Hora de vestir o kimono e ir pro tatame. Mantenha a disciplina hoje!',
  '⚡ Hoje é dia de No-Gi! Pegue a rashguard, encha a garrafa e vá ao dojo.',
  '🛡️ A faixa preta é a branca que nunca desistiu. O treino está te esperando!',
  '🔥 Menos desculpas, mais rola. Prepare sua mochila do tatame agora!'
];

export const TrainingRemindersSettings: React.FC<TrainingRemindersSettingsProps> = ({
  userEmail,
  addToast = (msg: string, type?: 'success' | 'error' | 'info') => console.log(msg, type),
  className = ''
}) => {
  // Load config from LocalStorage or Defaults
  const [config, setConfig] = useState<TrainingReminderConfig>(() => {
    try {
      const saved = localStorage.getItem('oss_training_reminders');
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Erro ao carregar lembretes de treino:', e);
    }
    return DEFAULT_CONFIG;
  });

  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [newTimeInput, setNewTimeInput] = useState('18:00');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEnablingPush, setIsEnablingPush] = useState(false);
  const [activeFiredInfo, setActiveFiredInfo] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('oss_training_reminders', JSON.stringify(config));
    } catch (e) {
      console.warn('Erro ao salvar localmente:', e);
    }
  }, [config]);

  // Load from Firestore if user is authenticated
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    getDoc(doc(db, 'users', user.uid))
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.trainingReminders) {
            setConfig(prev => ({ ...prev, ...data.trainingReminders }));
          }
        }
      })
      .catch((err) => console.warn('[TrainingReminders] Firestore load error:', err));
  }, []);

  // Update Notification permission status on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Active in-browser background ticker that fires reminder when due
  useEffect(() => {
    if (!config.enabled || config.schedules.length === 0) return;

    const checkInterval = setInterval(() => {
      const now = new Date();
      const currentDay = now.getDay();
      
      // Check if current day of week is selected
      if (!config.daysOfWeek.includes(currentDay)) return;

      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTotalMin = currentHours * 60 + currentMinutes;

      // Check each schedule time
      config.schedules.forEach((timeStr) => {
        const [schH, schM] = timeStr.split(':').map(Number);
        const scheduleTotalMin = schH * 60 + schM;
        const targetReminderMin = scheduleTotalMin - (config.advanceMinutes || 0);

        // If current time matches target reminder minute (within 1-minute window)
        if (currentTotalMin === targetReminderMin) {
          const todayDateKey = now.toISOString().split('T')[0];
          const dedupeKey = `oss_training_reminder_sent_${timeStr}_${todayDateKey}`;

          if (!sessionStorage.getItem(dedupeKey)) {
            sessionStorage.setItem(dedupeKey, 'true');
            console.log(`[TrainingReminders] Disparando notificação de treino para ${timeStr}...`);
            setActiveFiredInfo(`Lembrete disparado para o treino de ${timeStr}h!`);

            dispatchTrainingReminderPush({
              time: timeStr,
              modality: config.modality,
              customMessage: config.customMessage,
              advanceMinutes: config.advanceMinutes
            }).catch(console.warn);

            addToast(`🥋 Lembrete de Treino: Tatame às ${timeStr}h!`, 'success');
          }
        }
      });
    }, 20000); // Check every 20 seconds

    return () => clearInterval(checkInterval);
  }, [config, addToast]);

  // Request Notification permission via FCM Service Worker
  const handleEnablePushPermission = async () => {
    setIsEnablingPush(true);
    try {
      await registerFCMServiceWorker();
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        await requestFCMToken(true);
        addToast('Permissão de Notificações concedida com sucesso!', 'success');
      } else {
        addToast('Permissão negada. Desbloqueie as notificações no seu navegador.', 'info');
      }
    } catch (err: any) {
      console.warn('Erro ao habilitar permissões push:', err);
      addToast('Não foi possível obter permissão de notificação.', 'error');
    } finally {
      setIsEnablingPush(false);
    }
  };

  // Test notification directly
  const handleTestNotification = async () => {
    if (permission !== 'granted') {
      await handleEnablePushPermission();
      if (Notification.permission !== 'granted') return;
    }

    setIsTesting(true);
    try {
      const sampleTime = config.schedules[0] || '19:30';
      const result = await dispatchTrainingReminderPush({
        time: sampleTime,
        modality: config.modality,
        customMessage: config.customMessage,
        advanceMinutes: config.advanceMinutes
      });

      if (result.success) {
        addToast(`🥋 Notificação de Treino de teste enviada via Push!`, 'success');
      } else {
        // Fallback local dispatch
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          if (reg) {
            await reg.showNotification(`🥋 OSS.OS - Lembrete de Treino (${config.modality.toUpperCase()})`, {
              body: `${config.customMessage} • Treino às ${sampleTime}h`,
              icon: '/apple-touch-icon.png',
              badge: '/apple-touch-icon.png',
              vibrate: config.vibrate ? [200, 100, 200, 100, 300] : undefined,
              tag: 'oss-training-reminder-test',
              data: { url: '/?view=SETTINGS' }
            } as any);
          }
        } else if ('Notification' in window) {
          new Notification(`🥋 OSS.OS - Lembrete de Treino (${config.modality.toUpperCase()})`, {
            body: `${config.customMessage} • Treino às ${sampleTime}h`,
            icon: '/apple-touch-icon.png'
          });
        }
        addToast(`Notificação disparada com sucesso no seu dispositivo!`, 'success');
      }
    } catch (e: any) {
      console.warn('Erro ao testar lembrete de treino:', e);
      addToast('Erro ao disparar notificação de teste.', 'error');
    } finally {
      setTimeout(() => setIsTesting(false), 700);
    }
  };

  // Save changes to cloud
  const handleSaveToCloud = async () => {
    setIsSaving(true);
    try {
      // 1. LocalStorage
      localStorage.setItem('oss_training_reminders', JSON.stringify(config));

      // 2. Server API sync
      await fetch('/api/fcm/training-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail || auth.currentUser?.email || 'atleta@oss.os',
          config
        })
      }).catch(err => console.warn('[TrainingReminders] Server sync error:', err));

      // 3. Firestore sync if authenticated
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          trainingReminders: config,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      addToast('Configurações de Lembretes de Treino salvas com sucesso!', 'success');
    } catch (e: any) {
      console.warn('Erro ao salvar no Firestore:', e);
      addToast('Salvo localmente no dispositivo.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle day of week
  const toggleDay = (day: number) => {
    setConfig(prev => {
      const exists = prev.daysOfWeek.includes(day);
      const nextDays = exists 
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day].sort((a, b) => a - b);
      return { ...prev, daysOfWeek: nextDays };
    });
  };

  // Select all or weekday shortcuts
  const selectDaysPreset = (preset: 'all' | 'weekdays' | 'weekends') => {
    if (preset === 'all') {
      setConfig(prev => ({ ...prev, daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }));
    } else if (preset === 'weekdays') {
      setConfig(prev => ({ ...prev, daysOfWeek: [1, 2, 3, 4, 5] }));
    } else {
      setConfig(prev => ({ ...prev, daysOfWeek: [0, 6] }));
    }
  };

  // Add custom time
  const handleAddTime = (timeToAdd: string) => {
    if (!timeToAdd) return;
    if (config.schedules.includes(timeToAdd)) {
      addToast(`Horário ${timeToAdd} já está na sua lista de treinos.`, 'info');
      return;
    }
    setConfig(prev => ({
      ...prev,
      schedules: [...prev.schedules, timeToAdd].sort()
    }));
    addToast(`Horário ${timeToAdd}h adicionado aos treinos!`, 'success');
  };

  // Remove time
  const handleRemoveTime = (timeToRemove: string) => {
    if (config.schedules.length <= 1) {
      addToast('Mantenha ao menos um horário de treino configurado.', 'info');
      return;
    }
    setConfig(prev => ({
      ...prev,
      schedules: prev.schedules.filter(t => t !== timeToRemove)
    }));
  };

  return (
    <div className={`bg-white dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 p-6 md:p-8 font-sans ${className}`}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-850">
        <div className="flex items-start gap-3.5">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: [0, -10, 10, -5, 0] }}
            className={`p-3 border shrink-0 transition-colors ${
              config.enabled
                ? 'bg-green-600 text-white border-green-700 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border-zinc-300 dark:border-zinc-800'
            }`}
          >
            {config.enabled ? <BellRing size={24} className="animate-pulse" /> : <BellOff size={24} />}
          </motion.div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-mono font-black uppercase tracking-wider text-black dark:text-white">
                LEMBRETES DE TREINO DIÁRIOS
              </h3>
              <span className="text-[7.5px] font-mono bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30 px-2 py-0.5 font-black uppercase">
                PUSH SERVICE 24/7
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
              Defina os horários em que você treina Jiu-Jitsu e receba notificações automáticas no seu navegador para não perder o rola no tatame.
            </p>
          </div>
        </div>

        {/* Master ON/OFF Switch */}
        <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/60 p-2.5 border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto">
          <span className="text-[9.5px] font-mono font-black uppercase text-zinc-700 dark:text-zinc-300">
            {config.enabled ? 'Lembretes: ATIVOS' : 'Lembretes: PAUSADOS'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={config.enabled}
            onClick={() => {
              const next = !config.enabled;
              setConfig(prev => ({ ...prev, enabled: next }));
              if (next) {
                addToast('Lembretes de treino ativados!', 'success');
              } else {
                addToast('Lembretes de treino pausados.', 'info');
              }
            }}
            className={`w-11 h-6 rounded-none transition-colors relative cursor-pointer shrink-0 ${
              config.enabled ? 'bg-green-600' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <motion.span
              animate={{ left: config.enabled ? '22px' : '3px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-4 h-4 bg-white block absolute top-1"
            />
          </button>
        </div>
      </div>

      {/* Push Permission Alert Bar */}
      {permission !== 'granted' && (
        <div className="my-5 p-4 bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-amber-500 shrink-0" />
            <div className="text-xs font-mono">
              <span className="font-black text-amber-600 dark:text-amber-400 uppercase block">
                Permissão de Push Pendente
              </span>
              <span className="text-zinc-600 dark:text-zinc-400 text-[11px]">
                Para que os avisos cheguem na sua tela mesmo com a aba em segundo plano, autorize as notificações.
              </span>
            </div>
          </div>
          <button
            onClick={handleEnablePushPermission}
            disabled={isEnablingPush}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-mono font-black text-[10px] uppercase tracking-wider shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isEnablingPush ? <RefreshCw size={12} className="animate-spin" /> : <Bell size={12} />}
            <span>Ativar Permissão Push</span>
          </button>
        </div>
      )}

      {/* Main Settings Body */}
      <div className={`space-y-6 mt-6 transition-opacity ${config.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
        
        {/* 1. Daily Training Times Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-black uppercase text-black dark:text-white flex items-center gap-1.5">
              <Clock size={14} className="text-green-600" />
              <span>Horários Diários dos Treinos</span>
            </label>
            <span className="text-[10px] font-mono text-zinc-400">
              {config.schedules.length} {config.schedules.length === 1 ? 'horário configurado' : 'horários configurados'}
            </span>
          </div>

          {/* Active Schedules Badges */}
          <div className="flex flex-wrap gap-2 items-center min-h-[44px] p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
            {config.schedules.map((time) => (
              <motion.div
                key={time}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black font-mono font-black text-xs uppercase tracking-wider shadow-sm"
              >
                <Clock size={12} className="text-green-400 dark:text-green-600" />
                <span>{time}h</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTime(time)}
                  className="hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                  title={`Remover treino das ${time}h`}
                >
                  ✕
                </button>
              </motion.div>
            ))}

            {config.schedules.length === 0 && (
              <span className="text-xs font-mono text-zinc-400 italic">
                Nenhum horário selecionado. Escolha um dos atalhos abaixo ou insira um novo.
              </span>
            )}
          </div>

          {/* Quick Presets & Add Custom Time */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold uppercase text-zinc-400 mr-1">// ATALHOS:</span>
              {PRESET_TIMES.map(preset => {
                const isSelected = config.schedules.includes(preset.time);
                return (
                  <button
                    key={preset.time}
                    type="button"
                    onClick={() => handleAddTime(preset.time)}
                    className={`px-2.5 py-1 text-[9.5px] font-mono font-bold uppercase transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-green-600 text-white border-green-700 opacity-60 cursor-default'
                        : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white'
                    }`}
                  >
                    + {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={newTimeInput}
                onChange={(e) => setNewTimeInput(e.target.value)}
                className="bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800 text-xs font-mono px-2.5 py-1.5 text-black dark:text-white"
              />
              <button
                type="button"
                onClick={() => handleAddTime(newTimeInput)}
                className="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black font-mono font-black text-[10px] uppercase tracking-wider flex items-center gap-1 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Plus size={11} />
                <span>Adicionar</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Days of Week Selector */}
        <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-black uppercase text-black dark:text-white flex items-center gap-1.5">
              <Calendar size={14} className="text-green-600" />
              <span>Dias de Treino na Semana</span>
            </label>
            <div className="flex items-center gap-2 text-[9px] font-mono">
              <button
                type="button"
                onClick={() => selectDaysPreset('weekdays')}
                className="text-zinc-500 hover:text-black dark:hover:text-white underline cursor-pointer"
              >
                Seg-Sex
              </button>
              <span className="text-zinc-300">|</span>
              <button
                type="button"
                onClick={() => selectDaysPreset('all')}
                className="text-zinc-500 hover:text-black dark:hover:text-white underline cursor-pointer"
              >
                Todos
              </button>
              <span className="text-zinc-300">|</span>
              <button
                type="button"
                onClick={() => selectDaysPreset('weekends')}
                className="text-zinc-500 hover:text-black dark:hover:text-white underline cursor-pointer"
              >
                Fim de Semana
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {DAY_LABELS.map(d => {
              const isActive = config.daysOfWeek.includes(d.day);
              return (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => toggleDay(d.day)}
                  className={`p-2.5 sm:p-3 text-center transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-black shadow-sm'
                      : 'bg-zinc-50 dark:bg-zinc-900/60 text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-850'
                  }`}
                >
                  <span className="block text-xs font-mono font-black">{d.label}</span>
                  <span className={`block text-[7.5px] font-mono uppercase mt-0.5 ${isActive ? 'text-green-400 dark:text-green-600 font-bold' : 'text-zinc-500'}`}>
                    {isActive ? 'Ativo' : 'OFF'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Advance Notice Window */}
        <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
          <label className="text-xs font-mono font-black uppercase text-black dark:text-white flex items-center gap-1.5">
            <Zap size={14} className="text-amber-500" />
            <span>Antecedência do Alerta</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {ADVANCE_OPTIONS.map(opt => {
              const isSelected = config.advanceMinutes === opt.minutes;
              return (
                <button
                  key={opt.minutes}
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, advanceMinutes: opt.minutes }))}
                  className={`p-2.5 text-left transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 text-black dark:text-white font-black'
                      : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400'
                  }`}
                >
                  <span className="block text-xs font-mono">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Modality Selection */}
        <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
          <label className="text-xs font-mono font-black uppercase text-black dark:text-white flex items-center gap-1.5">
            <Flame size={14} className="text-red-500" />
            <span>Foco / Modalidade do Tatame</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {MODALITIES.map(m => {
              const isSelected = config.modality === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, modality: m.id as any }))}
                  className={`p-3 text-left transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-sm'
                      : 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 opacity-80 hover:opacity-100'
                  }`}
                >
                  <span className="block text-xs font-mono font-black text-black dark:text-white uppercase">
                    {m.label}
                  </span>
                  <span className="block text-[9.5px] font-mono text-zinc-500 mt-1 line-clamp-2">
                    {m.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Custom Motivational Message */}
        <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-900">
          <label className="text-xs font-mono font-black uppercase text-black dark:text-white flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-green-500" />
              <span>Mensagem Personalizada de Notificação</span>
            </span>
            <span className="text-[9px] font-mono text-zinc-400">Texto exibido no corpo da Push</span>
          </label>
          <input
            type="text"
            value={config.customMessage}
            onChange={(e) => setConfig(prev => ({ ...prev, customMessage: e.target.value }))}
            className="w-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800 px-3.5 py-2.5 text-xs font-mono text-black dark:text-white focus:outline-none focus:border-green-600"
            placeholder="Digite sua frase motivacional de treino..."
          />
          {/* Suggestions */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[8px] font-mono uppercase text-zinc-400">// SUGESTÕES:</span>
            {SUGGESTED_MESSAGES.map((msg, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, customMessage: msg }))}
                className="text-[9px] font-mono text-zinc-600 dark:text-zinc-400 hover:text-green-600 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 border border-zinc-200 dark:border-zinc-800 transition-colors truncate max-w-xs cursor-pointer"
                title={msg}
              >
                "{msg.slice(0, 32)}..."
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Action Footer */}
      <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
          <span className="text-[10px] font-mono font-bold uppercase text-zinc-600 dark:text-zinc-400">
            {config.enabled 
              ? `${config.schedules.length} horários ativos nos dias selecionados`
              : 'Lembretes desativados'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Test Push Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleTestNotification}
            disabled={isTesting || !config.enabled}
            className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            title="Dispara imediatamente um lembrete real de treino no seu dispositivo"
          >
            {isTesting ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Disparando Push...</span>
              </>
            ) : (
              <>
                <Zap size={13} className="text-amber-500" />
                <span>Testar Notificação Agora</span>
              </>
            )}
          </motion.button>

          {/* Save Configuration Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleSaveToCloud}
            disabled={isSaving}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={13} />
                <span>Salvar Configurações</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default TrainingRemindersSettings;

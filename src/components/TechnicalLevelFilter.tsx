import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  Sparkles, 
  Zap, 
  Check, 
  ChevronRight, 
  ShieldAlert, 
  Layers, 
  RotateCcw,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Product } from '../types';
import { fireCenterConfetti } from '../lib/confetti';
import { getProductPractitionerLevel } from '../lib/filterUtils';

export interface BeltConfig {
  id: string;
  name: string;
  short: string;
  kanji: string;
  title: string;
  desc: string;
  bgClass: string;
  borderClass: string;
  tipClass: string;
  textClass: string;
  glowColor: string;
  particleColors: string[];
}

export const BJJ_BELTS: BeltConfig[] = [
  {
    id: 'Branca',
    name: 'Faixa Branca',
    short: 'Branca',
    kanji: '白帯',
    title: 'Iniciante • Fundamentos',
    desc: 'Sobrevivência, base, defesa pessoal e postura nos primeiros rolas.',
    bgClass: 'bg-white',
    borderClass: 'border-zinc-300 dark:border-zinc-700',
    tipClass: 'bg-black',
    textClass: 'text-zinc-900',
    glowColor: 'rgba(255, 255, 255, 0.8)',
    particleColors: ['#ffffff', '#f4f4f5', '#e4e4e7', '#a1a1aa', '#ef4444']
  },
  {
    id: 'Azul',
    name: 'Faixa Azul',
    short: 'Azul',
    kanji: '青帯',
    title: 'Intermediário • Guarda & Passagem',
    desc: 'Domínio técnico amplo, conexões de raspagens e passagens dinâmicas.',
    bgClass: 'bg-blue-600',
    borderClass: 'border-blue-700',
    tipClass: 'bg-black',
    textClass: 'text-white',
    glowColor: 'rgba(37, 99, 235, 0.85)',
    particleColors: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#ffffff']
  },
  {
    id: 'Roxa',
    name: 'Faixa Roxa',
    short: 'Roxa',
    kanji: '紫帯',
    title: 'Avançado • Velocidade & Fluidez',
    desc: 'Ajuste fino de alavancas, transições rápidas e arsenal de finalizações.',
    bgClass: 'bg-purple-700',
    borderClass: 'border-purple-800',
    tipClass: 'bg-black',
    textClass: 'text-white',
    glowColor: 'rgba(147, 51, 234, 0.85)',
    particleColors: ['#9333ea', '#a855f7', '#c084fc', '#e9d5ff', '#ffffff']
  },
  {
    id: 'Marrom',
    name: 'Faixa Marrom',
    short: 'Marrom',
    kanji: '茶帯',
    title: 'Sênior • Pressão & Peso',
    desc: 'Especialista em distribuição de peso, chaves de perna e pressão cirúrgica.',
    bgClass: 'bg-amber-900',
    borderClass: 'border-amber-950',
    tipClass: 'bg-black',
    textClass: 'text-white',
    glowColor: 'rgba(180, 83, 9, 0.85)',
    particleColors: ['#78350f', '#92400e', '#b45309', '#d97706', '#ffffff']
  },
  {
    id: 'Preta',
    name: 'Faixa Preta',
    short: 'Preta',
    kanji: '黒帯',
    title: 'Mestria & Professor • Competição Pro',
    desc: 'A maestria do Jiu-Jitsu. Detalhes invisíveis, comando e alta performance.',
    bgClass: 'bg-zinc-950',
    borderClass: 'border-black',
    tipClass: 'bg-red-600',
    textClass: 'text-white',
    glowColor: 'rgba(220, 38, 38, 0.85)',
    particleColors: ['#000000', '#dc2626', '#ef4444', '#f59e0b', '#ffffff']
  }
];

export interface TechnicalLevelFilterProps {
  userBelt: string;
  onUpdateUserBelt: (belt: string) => Promise<void> | void;
  filterByTechnicalLevel: boolean;
  onToggleFilterByTechnicalLevel: (enabled: boolean) => void;
  productList?: Product[];
  className?: string;
  compact?: boolean;
}

export const TechnicalLevelFilter: React.FC<TechnicalLevelFilterProps> = ({
  userBelt = 'Branca',
  onUpdateUserBelt,
  filterByTechnicalLevel,
  onToggleFilterByTechnicalLevel,
  productList = [],
  className = '',
  compact = false
}) => {
  const [targetBelt, setTargetBelt] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(3);
  const [isLevelingUp, setIsLevelingUp] = useState<boolean>(false);
  const [showCelebrationBadge, setShowCelebrationBadge] = useState<boolean>(false);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeConfig = BJJ_BELTS.find(b => b.short === userBelt) || BJJ_BELTS[0];
  const targetConfig = BJJ_BELTS.find(b => b.short === targetBelt) || activeConfig;

  // Web Audio chime for countdown and level-up sounds
  const playTone = (frequency: number, duration: number = 0.15, type: OscillatorType = 'sine') => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio fallback silent
    }
  };

  const playLevelUpChord = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const chord = [330, 440, 554.37, 659.25, 880];
      chord.forEach((freq, idx) => {
        setTimeout(() => {
          try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(0.09, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.6);
          } catch (_) {}
        }, idx * 70);
      });
    } catch (e) {}
  };

  // Trigger belt selection countdown
  const handleSelectBelt = (beltShort: string) => {
    if (beltShort === userBelt && !isLevelingUp) {
      // Already this belt - quick pulse
      playTone(440, 0.1);
      return;
    }

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    setTargetBelt(beltShort);
    setCountdown(3);
    setIsLevelingUp(true);
    setShowCelebrationBadge(false);
    playTone(523.25, 0.12); // C5
  };

  // Immediate completion without waiting
  const completeLevelUp = (chosenBelt: string) => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    setIsLevelingUp(false);
    setTargetBelt(null);
    onUpdateUserBelt(chosenBelt);
    setShowCelebrationBadge(true);

    const config = BJJ_BELTS.find(b => b.short === chosenBelt) || activeConfig;
    playLevelUpChord();
    fireCenterConfetti({
      colors: config.particleColors,
      particleCount: 140,
      spread: 85
    });

    setTimeout(() => {
      setShowCelebrationBadge(false);
    }, 3200);
  };

  // Countdown clock loop
  useEffect(() => {
    if (isLevelingUp && targetBelt) {
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current!);
            completeLevelUp(targetBelt);
            return 0;
          }
          const nextVal = prev - 1;
          // Tone pitch shifts up as countdown approaches zero
          playTone(523.25 + (3 - nextVal) * 120, 0.12);
          return nextVal;
        });
      }, 700);

      return () => {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
        }
      };
    }
  }, [isLevelingUp, targetBelt]);

  // Count products matching user's active technical level
  const matchingProductsCount = React.useMemo(() => {
    if (!productList || productList.length === 0) return 0;
    return productList.filter(p => {
      const lvl = getProductPractitionerLevel(p);
      if (lvl === 'Todos') return true;
      if (userBelt === 'Branca') return lvl === 'Iniciante';
      if (userBelt === 'Azul' || userBelt === 'Roxa') return lvl === 'Intermediário';
      if (userBelt === 'Marrom' || userBelt === 'Preta') return lvl === 'Avançado';
      return true;
    }).length;
  }, [productList, userBelt]);

  return (
    <div 
      className={`relative bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 transition-all duration-300 overflow-hidden ${className} ${
        isLevelingUp ? 'ring-2 ring-red-500/50 shadow-xl' : ''
      }`}
      style={{
        boxShadow: isLevelingUp ? `0 0 30px ${targetConfig.glowColor}` : undefined
      }}
    >
      {/* Background radial aura that reacts to active belt */}
      <div 
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-700"
        style={{
          backgroundColor: isLevelingUp ? targetConfig.glowColor : activeConfig.glowColor
        }}
      />

      {/* LEVEL-UP MODAL / COUNTDOWN OVERLAY */}
      <AnimatePresence>
        {isLevelingUp && targetBelt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30 bg-zinc-950/92 backdrop-blur-md p-4 sm:p-5 flex flex-col items-center justify-between text-white"
          >
            {/* Top header badge */}
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <Sparkles size={12} className="animate-spin text-amber-400" />
                GRADUAÇÃO EM SINCRONIZAÇÃO
              </span>
            </div>

            {/* Central Countdown Counter & Belt Evolution */}
            <div className="flex flex-col items-center justify-center my-auto space-y-3 text-center">
              {/* Transition Belt Badge */}
              <div className="flex items-center gap-2 text-xs font-mono font-black">
                <span className="px-2 py-0.5 border border-zinc-700 text-zinc-400 bg-zinc-900">
                  {userBelt}
                </span>
                <ArrowRight size={13} className="text-amber-400 animate-pulse" />
                <span 
                  className={`px-2.5 py-1 border font-black uppercase tracking-wider shadow-lg ${targetConfig.bgClass} ${targetConfig.textClass} ${targetConfig.borderClass}`}
                  style={{
                    boxShadow: `0 0 20px ${targetConfig.glowColor}`
                  }}
                >
                  🥋 {targetConfig.name}
                </span>
              </div>

              {/* Countdown Number with Spring Pop */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                {/* Rotating SVG Ring */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-zinc-800"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-amber-400 transition-all duration-500 ease-linear"
                    strokeDasharray={`${((4 - countdown) / 3) * 100}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                <AnimatePresence mode="wait">
                  <motion.span
                    key={`countdown-${countdown}`}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.4, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    className="absolute font-mono font-black text-3xl text-amber-400 drop-shadow-md"
                  >
                    {countdown}
                  </motion.span>
                </AnimatePresence>
              </div>

              <div className="space-y-0.5">
                <p className="text-xs font-mono font-black uppercase tracking-wider text-white">
                  Consagrando Novo Nível BJJ...
                </p>
                <p className="text-[10px] font-sans text-zinc-400 max-w-xs">
                  {targetConfig.desc}
                </p>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2 w-full pt-2">
              <button
                type="button"
                onClick={() => {
                  if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                  setIsLevelingUp(false);
                  setTargetBelt(null);
                }}
                className="flex-1 py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-[10px] font-mono font-bold uppercase transition-colors border border-zinc-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => completeLevelUp(targetBelt)}
                className="flex-1 py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-mono font-black uppercase transition-colors shadow-md flex items-center justify-center gap-1 cursor-pointer"
              >
                <Zap size={11} className="fill-black" />
                <span>Aplicar Já</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEVEL-UP CELEBRATION TOAST BADGE */}
      <AnimatePresence>
        {showCelebrationBadge && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-2 left-2 right-2 z-20 bg-gradient-to-r from-amber-600 via-red-600 to-amber-600 p-2 shadow-2xl text-white flex items-center justify-between border border-amber-400/40"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🥋</span>
              <div>
                <p className="text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1">
                  <span>LEVEL UP! GRADUAÇÃO CONFIRMADA</span>
                  <Sparkles size={11} className="text-yellow-300" />
                </p>
                <p className="text-[9px] font-sans text-white/90">
                  Catálogo sincronizado com a <strong>{activeConfig.name}</strong> • OSS!
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCelebrationBadge(false)}
              className="text-white/80 hover:text-white p-1 text-xs"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPONENT BODY */}
      <div className={`p-4 sm:p-5 space-y-4 ${compact ? 'p-3 space-y-3' : ''}`}>
        
        {/* HEADER: TITLE & STRICT FILTER SWITCH */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-7 h-7 flex items-center justify-center border shadow-xs transition-colors duration-500"
              style={{
                backgroundColor: activeConfig.bgClass.includes('white') ? '#fafafa' : undefined,
                borderColor: activeConfig.glowColor
              }}
            >
              <Award 
                size={15} 
                className={activeConfig.short === 'Preta' ? 'text-red-500' : 'text-zinc-700 dark:text-zinc-200'} 
              />
            </div>
            <div>
              <h3 className="text-xs font-mono font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                <span>Filtrar por Meu Nível</span>
                {filterByTechnicalLevel && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                )}
              </h3>
              <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                Graduação BJJ & Recomendações Táticas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[9px] font-mono uppercase text-zinc-400 hidden sm:inline">
              {filterByTechnicalLevel ? 'Restrito' : 'Aberto'}
            </span>
            <Switch
              checked={filterByTechnicalLevel}
              onCheckedChange={(val) => {
                onToggleFilterByTechnicalLevel(val);
                playTone(val ? 600 : 350, 0.1);
              }}
              className="data-[state=checked]:bg-green-600 cursor-pointer"
              title="Ativar/Desativar filtragem estrita pela sua faixa"
            />
          </div>
        </div>

        {/* ACTIVE BELT SHOWCASE CARD */}
        <div 
          className="relative bg-white dark:bg-zinc-950 border p-3 sm:p-3.5 transition-all duration-500"
          style={{
            borderColor: activeConfig.glowColor,
            boxShadow: `0 2px 14px ${activeConfig.glowColor.replace('0.85', '0.15').replace('0.8', '0.15')}`
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Belt Graphic Bar with rank tip */}
              <div 
                className={`w-14 sm:w-16 h-7 border relative flex items-center justify-end shadow-xs ${activeConfig.bgClass} ${activeConfig.borderClass}`}
              >
                {/* Ponteira (Black or Red bar at tip of belt) */}
                <div className={`h-full w-4 sm:w-5 ${activeConfig.tipClass} flex items-center justify-around px-0.5`}>
                  {/* Rank degree stripes (white or red) */}
                  <div className="w-0.5 h-4 bg-white/90" />
                  <div className="w-0.5 h-4 bg-white/90" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-mono font-black uppercase tracking-tight text-black dark:text-white">
                    {activeConfig.name}
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-zinc-400">
                    {activeConfig.kanji}
                  </span>
                </div>
                <p className="text-[9px] font-sans text-zinc-500 dark:text-zinc-400 line-clamp-1">
                  {activeConfig.title}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 border ${activeConfig.bgClass} ${activeConfig.textClass} ${activeConfig.borderClass}`}>
                🥋 ATIVA
              </span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE 5-BELT SELECTION RACK */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[9px] font-mono uppercase text-zinc-400">
            <span>Selecione para Evoluir / Testar:</span>
            <span>5 Faixas Oficiais IBJJF</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {BJJ_BELTS.map((belt) => {
              const isCurrent = userBelt === belt.short;
              const isTarget = targetBelt === belt.short;

              return (
                <button
                  key={`belt-selector-${belt.id}`}
                  type="button"
                  onClick={() => handleSelectBelt(belt.short)}
                  title={`${belt.name} • Clique para evoluir e aplicar animação de contagem regressiva`}
                  className={`group relative flex flex-col items-center p-1.5 sm:p-2 border transition-all duration-200 cursor-pointer ${
                    isCurrent
                      ? 'border-green-600 bg-white dark:bg-zinc-950 scale-[1.03] shadow-md ring-1 ring-green-500/40'
                      : isTarget
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 scale-105 ring-2 ring-amber-500 animate-pulse'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 hover:border-zinc-400 dark:hover:border-zinc-650 hover:scale-[1.02]'
                  }`}
                >
                  {/* Miniature Belt Strap Visual with tip */}
                  <div className={`w-full h-3 sm:h-3.5 border relative flex items-center justify-end shadow-xs ${belt.bgClass} ${belt.borderClass}`}>
                    <div className={`h-full w-2 sm:w-2.5 ${belt.tipClass} flex items-center justify-center`}>
                      <div className="w-0.5 h-2 bg-white/90" />
                    </div>
                  </div>

                  <span className="text-[9px] font-mono font-black uppercase mt-1 text-black dark:text-white truncate w-full text-center">
                    {belt.short}
                  </span>

                  {isCurrent && (
                    <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-green-600 text-white rounded-full flex items-center justify-center text-[8px] shadow-xs">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* FOOTER METRICS & FILTER IMPACT */}
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between text-[10px] font-mono text-zinc-500 gap-1.5">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
            <span className="truncate">
              <strong>{matchingProductsCount}</strong> produtos adequados ao nível <strong>{userBelt}</strong>
            </span>
          </div>

          <div className="text-[9px] text-zinc-400 font-mono">
            {filterByTechnicalLevel 
              ? '⚡ Filtro ativo no acervo' 
              : 'Clique no botão acima para isolar seu nível'}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TechnicalLevelFilter;

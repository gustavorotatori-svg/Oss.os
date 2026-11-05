import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Clock, Check, Sparkles, ChevronDown } from 'lucide-react';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface ThemeSelectorProps {
  themePreference: ThemePreference;
  onSelectTheme: (preference: ThemePreference) => void;
  isDark: boolean;
  className?: string;
  showDropdown?: boolean;
}

/**
 * Hook or helper to determine current scheduled mode:
 * 06:00 to 18:00 -> Claro (Light)
 * 18:00 to 24:00 (and until 06:00) -> Escuro (Dark)
 */
export function getScheduledThemeState(): { isDark: boolean; label: string; currentHour: number } {
  const currentHour = new Date().getHours();
  // Claro das 6h às 18h, Escuro das 18h às 24h / 6h
  const isNight = currentHour >= 18 || currentHour < 6;
  return {
    isDark: isNight,
    label: isNight ? 'Escuro' : 'Claro',
    currentHour
  };
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  themePreference,
  onSelectTheme,
  isDark,
  className = '',
  showDropdown = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scheduledState, setScheduledState] = useState(getScheduledThemeState);

  // Update schedule status every minute
  useEffect(() => {
    const update = () => setScheduledState(getScheduledThemeState());
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (pref: ThemePreference) => {
    onSelectTheme(pref);
    setIsOpen(false);
  };

  const getButtonTitle = () => {
    if (themePreference === 'system') {
      return `Tema Automático (06h-18h Claro, 18h-24h Escuro) • Agora: ${scheduledState.label}`;
    }
    if (themePreference === 'light') {
      return 'Tema Claro (Manual)';
    }
    return 'Tema Escuro (Manual)';
  };

  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      {/* Header Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={() => {
          if (showDropdown) {
            setIsOpen(prev => !prev);
          } else {
            // Simple cycle if dropdown disabled
            const next = themePreference === 'system' ? 'light' : themePreference === 'light' ? 'dark' : 'system';
            onSelectTheme(next);
          }
        }}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={getButtonTitle()}
        title={getButtonTitle()}
        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-none relative cursor-pointer shrink-0"
        id="theme-selector-trigger"
      >
        {themePreference === 'system' ? (
          <div className="relative flex items-center justify-center">
            {scheduledState.isDark ? (
              <Moon size={16} className="text-indigo-400" />
            ) : (
              <Sun size={17} className="text-amber-500" />
            )}
            {/* Schedule Indicator Dot */}
            <span 
              className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-green-500 border border-white dark:border-black shadow-[0_0_4px_#22c55e]" 
              title="Automático pelo horário (6h-18h Claro / 18h-24h Escuro)"
            />
          </div>
        ) : themePreference === 'light' ? (
          <Sun size={17} className="text-amber-500" />
        ) : (
          <Moon size={16} className="text-indigo-400" />
        )}
      </motion.button>

      {/* Dropdown Popover */}
      <AnimatePresence>
        {isOpen && showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full right-0 mt-1.5 w-64 sm:w-72 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-[150] p-1.5 space-y-1 text-black dark:text-white"
          >
            {/* Header info */}
            <div className="px-2.5 py-1.5 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
              <span className="text-[9px] font-mono font-black uppercase tracking-widest text-zinc-400">
                // Seletor de Tema
              </span>
              <span className="text-[8.5px] font-mono font-bold text-zinc-500 dark:text-zinc-400">
                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Option: Automático (Horário) - Recommended */}
            <button
              type="button"
              onClick={() => handleSelect('system')}
              className={`w-full text-left p-2 transition-all flex items-start gap-2.5 cursor-pointer border ${
                themePreference === 'system'
                  ? 'bg-zinc-100 dark:bg-zinc-900 border-green-600/50 shadow-xs'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60 border-transparent'
              }`}
            >
              <div className="w-6 h-6 rounded bg-green-500/10 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                <Clock size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black uppercase tracking-tight text-black dark:text-white flex items-center gap-1.5">
                    Automático (Sistema)
                    <span className="text-[7.5px] px-1 py-0.2 bg-green-600 text-white font-bold">HORÁRIO</span>
                  </span>
                  {themePreference === 'system' && <Check size={12} className="text-green-600 shrink-0" />}
                </div>
                <p className="text-[9px] font-sans text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                  ☀️ Claro (06h às 18h) • 🌙 Escuro (18h às 24h)
                </p>
                <div className="mt-1 flex items-center gap-1 text-[8px] font-mono font-bold text-green-600 dark:text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span>Agora: Modo {scheduledState.label}</span>
                </div>
              </div>
            </button>

            {/* Option: Claro */}
            <button
              type="button"
              onClick={() => handleSelect('light')}
              className={`w-full text-left p-2 transition-all flex items-start gap-2.5 cursor-pointer border ${
                themePreference === 'light'
                  ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-400 dark:border-zinc-600 shadow-xs'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60 border-transparent'
              }`}
            >
              <div className="w-6 h-6 rounded bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                <Sun size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black uppercase tracking-tight text-black dark:text-white">
                    Modo Claro
                  </span>
                  {themePreference === 'light' && <Check size={12} className="text-green-600 shrink-0" />}
                </div>
                <p className="text-[9px] font-sans text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                  Fixo em tema claro, independente do horário.
                </p>
              </div>
            </button>

            {/* Option: Escuro */}
            <button
              type="button"
              onClick={() => handleSelect('dark')}
              className={`w-full text-left p-2 transition-all flex items-start gap-2.5 cursor-pointer border ${
                themePreference === 'dark'
                  ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-400 dark:border-zinc-600 shadow-xs'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60 border-transparent'
              }`}
            >
              <div className="w-6 h-6 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Moon size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black uppercase tracking-tight text-black dark:text-white">
                    Modo Escuro
                  </span>
                  {themePreference === 'dark' && <Check size={12} className="text-green-600 shrink-0" />}
                </div>
                <p className="text-[9px] font-sans text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                  Fixo em tema escuro, independente do horário.
                </p>
              </div>
            </button>

            {/* Micro footnote */}
            <div className="px-2 py-1 pt-1.5 border-t border-zinc-100 dark:border-zinc-900 text-[8px] font-mono text-zinc-400 text-center">
              Preferência salva localmente no navegador
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSelector;

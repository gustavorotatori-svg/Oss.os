import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'pt', name: 'Português', nativeName: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'en', name: 'English', nativeName: 'English (US)', flag: '🇺🇸' },
  { code: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' }
];

interface LanguageSelectorProps {
  variant?: 'header' | 'compact' | 'drawer' | 'inline' | 'sidebar';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'header',
  className
}) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize initial language code (e.g. 'pt-BR' -> 'pt')
  const normalizeCode = (lng?: string): string => {
    if (!lng) return 'pt';
    const primary = lng.split('-')[0].toLowerCase();
    const match = AVAILABLE_LANGUAGES.find(l => l.code === primary);
    return match ? match.code : 'pt';
  };

  const [currentCode, setCurrentCode] = useState<string>(() => normalizeCode(i18n.language));

  // Sync state if i18n changes elsewhere
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentCode(normalizeCode(lng));
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // Click outside listener for dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentLanguage = AVAILABLE_LANGUAGES.find(l => l.code === currentCode) || AVAILABLE_LANGUAGES[0];

  const handleSelectLanguage = (code: string) => {
    setCurrentCode(code);
    setIsOpen(false);

    i18n.changeLanguage(code).then(() => {
      setCurrentCode(code);
    }).catch(err => {
      console.warn('[LanguageSelector] Erro ao alterar idioma:', err);
    });

    if (typeof document !== 'undefined') {
      document.documentElement.lang = code;
      try {
        localStorage.setItem('i18nextLng', code);
        localStorage.setItem('oss_preferred_language', code);
      } catch {
        // sandbox safe fallback
      }
      window.dispatchEvent(new CustomEvent('app-language-changed', { detail: code }));
    }
  };

  // Inline / Grid representation for Mobile Drawers or Settings Panels
  if (variant === 'drawer' || variant === 'inline') {
    return (
      <div className={cn("space-y-2 w-full", className)}>
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono font-black uppercase tracking-widest text-zinc-400">
            // {t('common.select_language', { defaultValue: 'SELECIONAR IDIOMA' })}
          </span>
          <span className="text-[10px] font-mono text-zinc-500 font-bold">
            {currentLanguage.flag} {currentLanguage.nativeName}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-1">
          {AVAILABLE_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentCode;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-2 text-left text-xs font-mono font-bold transition-all border cursor-pointer",
                  isSelected
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm"
                    : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                )}
              >
                <span className="text-sm shrink-0">{lang.flag}</span>
                <span className="truncate text-[10.5px] uppercase tracking-wide">{lang.nativeName}</span>
                {isSelected && <Check size={12} className="ml-auto shrink-0 text-green-500" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Sidebar compact variant
  if (variant === 'sidebar') {
    return (
      <div ref={containerRef} className={cn("relative w-full", className)}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all font-mono text-[9px] font-black uppercase tracking-widest rounded-none shadow-sm cursor-pointer"
          title={`Idioma ativo: ${currentLanguage.nativeName}`}
        >
          <div className="flex items-center gap-2 truncate">
            <span className="text-sm leading-none">{currentLanguage.flag}</span>
            <span className="truncate">{currentLanguage.nativeName}</span>
          </div>
          <ChevronDown size={11} className={cn("text-zinc-400 transition-transform duration-200", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <div className="absolute bottom-full left-0 mb-1 w-full max-h-64 overflow-y-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl z-[120] p-1 space-y-0.5 animate-in fade-in-0 zoom-in-95">
            <div className="px-2 py-1.5 border-b border-zinc-100 dark:border-zinc-900 text-[8px] font-mono font-black uppercase tracking-widest text-zinc-400 flex items-center justify-between">
              <span>{t('common.select_language', { defaultValue: 'Selecionar Idioma' })}</span>
              <Languages size={10} />
            </div>
            {AVAILABLE_LANGUAGES.map((lang) => {
              const isActive = lang.code === currentCode;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 text-[9.5px] font-mono font-bold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer",
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black font-black"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm leading-none">{lang.flag}</span>
                    <span className="truncate">{lang.nativeName}</span>
                  </div>
                  {isActive && <Check size={11} className="text-green-500 shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Header and Compact Dropdown Menu
  return (
    <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={cn(
          "h-8 sm:h-9 px-1.5 sm:px-2.5 rounded-none border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all flex items-center gap-1 sm:gap-1.5 group z-[60] cursor-pointer text-zinc-700 dark:text-zinc-300 shrink-0",
          variant === 'compact' && "h-8 px-1.5 text-xs"
        )}
        title={`Idioma: ${currentLanguage.nativeName} (${currentLanguage.code.toUpperCase()})`}
      >
        <span className="text-base leading-none select-none">{currentLanguage.flag}</span>
        <span className="text-[10px] font-mono font-black uppercase tracking-widest hidden sm:inline">
          {currentLanguage.code}
        </span>
        <ChevronDown 
          size={11} 
          className={cn("text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-transform duration-200", isOpen && "rotate-180")} 
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 rounded-none border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 min-w-[220px] max-h-[75vh] overflow-y-auto z-[120] shadow-2xl p-0 animate-in fade-in-0 zoom-in-95"
        >
          <div className="sticky top-0 z-10 px-3 py-2 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/90 backdrop-blur-md flex items-center justify-between">
            <p className="text-[9px] font-mono font-black uppercase tracking-widest text-zinc-400">
              {t('common.select_language', { defaultValue: 'Selecionar Idioma' })}
            </p>
            <Languages size={12} className="text-zinc-400" />
          </div>

          <div className="p-1 space-y-0.5">
            {AVAILABLE_LANGUAGES.map((lang) => {
              const isActive = lang.code === currentCode;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={cn(
                    "w-full rounded-none px-3 py-2 cursor-pointer text-[10px] font-mono font-black uppercase tracking-wider flex items-center justify-between transition-colors outline-none text-left",
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black font-extrabold shadow-xs'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base leading-none shrink-0">{lang.flag}</span>
                    <span className="truncate">{lang.nativeName}</span>
                  </div>
                  {isActive && (
                    <Check size={12} className="text-green-500 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

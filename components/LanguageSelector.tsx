import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'zh', name: '简体中文', flag: '🇨🇳' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' }
  ];

  // Robustly find the current language even if it has a sub-code (e.g., pt-BR)
  const currentLanguage = languages.find(l => i18n.language && i18n.language.startsWith(l.code)) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-9 px-3 rounded-none border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all flex items-center gap-2 group z-[60]"
        )}
      >
        <Languages size={14} className="text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">
          {currentLanguage.code}
        </span>
        <ChevronDown size={10} className="text-zinc-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="rounded-none border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 min-w-[180px] z-[100] shadow-2xl p-0 overflow-hidden"
      >
        <div className="p-2 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Select Language</p>
        </div>
        {languages.map((lang) => {
          const isActive = i18n.language && i18n.language.startsWith(lang.code);
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => {
                console.log(`Changing language to: ${lang.code}`);
                i18n.changeLanguage(lang.code);
              }}
              className={cn(
                "rounded-none px-4 py-3 cursor-pointer text-[10px] font-black uppercase tracking-widest flex items-center justify-between transition-colors outline-none",
                isActive 
                  ? 'bg-black text-white dark:bg-white dark:text-black' 
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-base leading-none">{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

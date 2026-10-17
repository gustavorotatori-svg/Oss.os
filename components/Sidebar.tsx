import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  Home, 
  ShoppingCart, 
  Newspaper, 
  Mic, 
  Heart, 
  Mail,
  Settings,
  Trophy,
  Instagram,
  Facebook,
  Twitter,
  ChevronRight,
  User,
  Award,
  Dumbbell,
  Users,
  Zap,
  Smartphone,
  Eye
} from 'lucide-react';
import { OssLogo } from './Logo';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from './LanguageSelector';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: any) => void;
  currentView: string;
  wishlistCount: number;
  user: any;
  onSignIn: () => void;
  onSignOut: () => void;
  onEnterFocusMode?: () => void;
  onInstallApp?: () => void;
  isDark?: boolean;
  themePreference?: 'light' | 'dark' | 'system';
  onToggleTheme?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onNavigate, 
  currentView,
  wishlistCount,
  user,
  onSignIn,
  onSignOut,
  onEnterFocusMode,
  onInstallApp,
  isDark,
  themePreference,
  onToggleTheme
}) => {
  const { t, i18n } = useTranslation();

  const menuItems = [
    { label: t('nav.home'), value: 'LANDING', icon: Home },
    { label: t('nav.shop'), value: 'SHOP', icon: ShoppingCart },
    { label: 'Vitrine Externa', value: 'EXTERNAL_SHOWCASE', icon: Eye, isNew: true },
    { label: t('landing.compare_prices', { defaultValue: 'Comparar Preços' }), value: 'COMPARATOR', icon: Award, isNew: true },
    { label: t('nav.blog', { defaultValue: 'Notícias' }), value: 'BLOG', icon: Newspaper, isNew: true },
    { label: t('nav.podcast', { defaultValue: 'Podcast' }), value: 'PODCAST', icon: Mic, isNew: true },
    { label: t('nav.wishlist'), value: 'WISHLIST', icon: Heart, count: wishlistCount },
    { label: 'Transparência 10%', value: 'TRANSPARENCY', icon: Trophy },
    { label: t('nav.profile'), value: 'SETTINGS', icon: Settings },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 z-[110] w-[85%] max-w-sm bg-white dark:bg-zinc-950 shadow-2xl flex flex-col border-r border-zinc-200 dark:border-zinc-800"
          >
            {/* Header */}
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <OssLogo size="sm" className="text-black dark:text-white" />
                <div className="flex flex-col">
                  <span className="micro-label text-green-600 font-bold uppercase tracking-widest leading-none mt-1">{t('common.admin')} // v3.0</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-none hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                <X size={20} />
              </Button>
            </div>

            {/* User Profile / Auth */}
            <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
               {user ? (
                 <div className="flex flex-col gap-3">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       {user.photoURL ? (
                         <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800" />
                       ) : (
                         <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                           <User size={20} className="text-zinc-400" />
                         </div>
                       )}
                       <div className="flex flex-col">
                         <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{user.displayName || 'Guerreiro'}</span>
                         <span className="text-[8px] font-mono text-zinc-400 truncate max-w-[120px]">{user.email}</span>
                       </div>
                     </div>
                     <button onClick={onSignOut} className="text-[9px] font-black uppercase tracking-widest text-red-600 hover:opacity-70">Sair</button>
                   </div>
                   {onEnterFocusMode && (
                     <Button
                       onClick={() => {
                         onEnterFocusMode();
                         onClose();
                       }}
                       className="w-full bg-green-600 hover:bg-green-500 text-white rounded-none font-black text-[9px] tracking-widest py-3 h-auto uppercase mt-1.5 border-none flex items-center justify-center gap-1.5 animate-pulse shadow-md shadow-green-600/20"
                     >
                       <Zap size={10} /> Ativar Modo Foco
                     </Button>
                   )}
                 </div>
               ) : (
                 <div className="flex flex-col gap-2 w-full">
                   <Button 
                     onClick={onSignIn}
                     className="w-full bg-black dark:bg-white text-white dark:text-black rounded-none font-sans font-black uppercase tracking-widest text-[9px] py-4 h-auto hover:bg-zinc-900 dark:hover:bg-zinc-100 transition-all shadow-md"
                   >
                     Conectar ao Tatame
                   </Button>
                   <span className="text-center font-mono text-[7px] text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] mt-1 block">
                     Google // Apple // E-mail
                   </span>
                 </div>
               )}
            </div>
            
            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-4 py-8">
              <nav className="flex flex-col gap-1">
                {menuItems.map((item, idx) => (
                  <motion.button 
                    key={item.value}
                    initial={{ x: -25, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ 
                      delay: idx * 0.05,
                      type: 'spring',
                      stiffness: 260,
                      damping: 30
                    }}
                    onClick={() => {
                      onNavigate(item.value);
                      onClose();
                    }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center justify-between p-4 group transition-all rounded-none border-b border-zinc-50 dark:border-zinc-900 last:border-b-0 ${
                      currentView === item.value 
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg z-10' 
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 hover:pl-6'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon size={18} className={currentView === item.value ? '' : 'text-zinc-300 group-hover:text-green-600 transition-colors'} />
                      <span className="micro-label font-black text-[10px]">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.isNew && (
                        <span className={`text-[7.5px] font-mono font-black uppercase px-1.5 py-0.5 rounded-none tracking-widest flex items-center gap-1 shadow-sm ${
                          currentView === item.value 
                            ? 'bg-green-500 text-black font-black' 
                            : 'bg-green-600/15 dark:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30'
                        }`}>
                          <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                          NOVO
                        </span>
                      )}
                      {item.count !== undefined && item.count > 0 && (
                        <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-sm ${currentView === item.value ? 'bg-white text-black' : 'bg-red-600 text-white'}`}>
                          {item.count}
                        </span>
                      )}
                      <ChevronRight size={14} className={`transition-transform duration-300 ${currentView === item.value ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                    </div>
                  </motion.button>
                ))}
              </nav>


            </div>

            {/* PWA Install Promo Box */}
            {onInstallApp && (
              <div className="px-8 pb-3 pt-3 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/40 dark:bg-zinc-900/10">
                <Button 
                  onClick={() => {
                    onInstallApp();
                    onClose();
                  }}
                  variant="outline"
                  className="w-full border-green-500/25 hover:border-green-500 bg-green-500/5 hover:bg-green-500/15 text-green-600 dark:text-green-400 font-sans font-black uppercase tracking-wider text-[9px] py-4 h-auto flex items-center justify-center gap-2 rounded-none transition-all cursor-pointer shadow-[0_2px_10px_rgba(34,197,94,0.02)]"
                >
                  <Smartphone size={13} className="animate-pulse" />
                  Salvar o Webapp na Área de Trabalho
                </Button>
              </div>
            )}

            {/* Quick Settings (Theme & Language) */}
            <div className="px-8 py-5 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10 flex items-center justify-between gap-4">
              {/* Theme Selector */}
              <div className="flex flex-col gap-1.5 flex-1">
                <span className="text-[8px] font-mono font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">// TEMA</span>
                <button
                  onClick={onToggleTheme}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-zinc-850 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all font-mono text-[9px] font-black uppercase tracking-widest rounded-none shadow-sm cursor-pointer"
                >
                  {themePreference === 'light' ? '☀️ Claro' : themePreference === 'dark' ? '🌙 Escuro' : '💻 Automático'}
                </button>
              </div>

              {/* Language Selector */}
              <div className="flex flex-col gap-1.5 flex-1">
                <span className="text-[8px] font-mono font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">// IDIOMA</span>
                <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black w-full flex items-center justify-center">
                  <LanguageSelector variant="compact" className="w-full justify-between h-8" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950">
               <div className="flex justify-between items-center mb-8">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-300">Social Connect</h4>
                  <div className="flex gap-4">
                    <Instagram size={18} className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer transition-colors" />
                    <Facebook size={18} className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer transition-colors" />
                    <Twitter size={18} className="text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer transition-colors" />
                  </div>
               </div>
               <div className="flex flex-col items-center">
                  <div className="w-12 h-[2px] bg-zinc-100 dark:bg-zinc-900 mb-6" />
                  <p className="text-[8px] text-center font-black uppercase tracking-[0.2em] text-zinc-500 leading-relaxed">
                    © 2026 OSS.OS <br/> 
                    <span className="text-[7px] text-zinc-400">Crafted for the Professional BJJ Community</span>
                  </p>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

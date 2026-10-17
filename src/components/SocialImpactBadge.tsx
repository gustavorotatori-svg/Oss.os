import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Info, X, ShieldCheck, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface SocialImpactBadgeProps {
  price: number;
  variant?: 'badge-header' | 'card-bar' | 'inline' | 'floating-pill';
  percentage?: number;
  className?: string;
  onClick?: () => void;
  showModalOnClick?: boolean;
}

export const SocialImpactBadge: React.FC<SocialImpactBadgeProps> = ({
  price,
  variant = 'card-bar',
  percentage = 10,
  className = '',
  onClick,
  showModalOnClick = true
}) => {
  const { i18n } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const donationAmount = price * (percentage / 100);
  const formattedDonation = i18n.language === 'en'
    ? `$${donationAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `R$ ${donationAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick();
    if (showModalOnClick) {
      setIsModalOpen(true);
    }
  };

  const modalElement = (
    <AnimatePresence>
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-950 border-2 border-emerald-600 dark:border-emerald-500 shadow-[8px_8px_0px_#059669] p-6 max-w-md w-full relative overflow-hidden"
          >
            {/* Header accent strip */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600" />
            
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-850">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <Heart size={15} className="fill-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-mono font-black text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                    PROGRAMA OSS // IMPACTO SOCIAL
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-medium">Curadoria com Propósito no Tatame</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Donation Highlight Value */}
            <div className="p-4 mb-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-1">
                VALOR REVERTIDO AUTOMATICAMENTE DESTA COMPRA:
              </span>
              <div className="text-3xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                <Heart size={20} className="fill-current text-emerald-600 dark:text-emerald-400" />
                {formattedDonation}
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 mt-1 block">
                (10% da receita/comissão sem nenhum custo adicional para você)
              </span>
            </div>

            {/* Explanatory Points */}
            <div className="space-y-3 mb-6 text-[11px] text-zinc-650 dark:text-zinc-350 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Kimonos Novos & Faixas:</strong> Fornecimento de kimonos oficiais e equipamentos de segurança para crianças e jovens em projetos sociais parceiros de BJJ.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Award size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Inscrições em Campeonatos:</strong> Financiamento de taxas de inscrição e transporte de atletas de baixa renda em competições estaduais e nacionais.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Sparkles size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Transparência Certificada:</strong> Você adquire pelo melhor preço verificado nas lojas oficiais e fortalece a comunidade do Jiu-Jitsu.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-black uppercase text-[10px] tracking-widest py-3 border-none rounded-none transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              ENTENDIDO • OSS!
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Variant 1: Header Badge on Top of Image
  if (variant === 'badge-header') {
    return (
      <>
        <motion.div
          onClick={handleClick}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.08 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`group/social bg-emerald-700 hover:bg-emerald-600 text-white font-mono font-black text-[7px] tracking-[0.14em] uppercase px-2 py-1 flex items-center gap-1.5 shadow-[0_4px_12px_rgba(4,120,87,0.4)] border border-emerald-400 cursor-pointer pointer-events-auto select-none transition-colors ${className}`}
          title={`Impacto Social: 10% (${formattedDonation}) é doado a projetos sociais de BJJ`}
        >
          <Heart size={8.5} className="fill-white text-white shrink-0 animate-pulse" />
          <span>IMPACTO SOCIAL: +{formattedDonation}</span>
        </motion.div>
        {modalElement}
      </>
    );
  }

  // Variant 2: Floating Pill
  if (variant === 'floating-pill') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 font-mono text-[9px] font-bold uppercase tracking-wider rounded-none hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all cursor-pointer select-none ${className}`}
          title="Clique para ver detalhes do Impacto Social"
        >
          <Heart size={10} className="fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400 animate-pulse" />
          <span>Impacto Social: <strong className="font-black text-emerald-700 dark:text-emerald-300">+{formattedDonation}</strong></span>
          <Info size={10} className="opacity-60 ml-0.5" />
        </button>
        {modalElement}
      </>
    );
  }

  // Variant 3: Inline Text / Label
  if (variant === 'inline') {
    return (
      <>
        <div 
          onClick={handleClick}
          className={`inline-flex items-center gap-1 text-[9px] font-mono text-emerald-700 dark:text-emerald-400 cursor-pointer hover:underline ${className}`}
        >
          <Heart size={10} className="fill-current text-emerald-600" />
          <span>Doação BJJ: <strong>+{formattedDonation}</strong></span>
        </div>
        {modalElement}
      </>
    );
  }

  // Default Variant: Interactive Card Bar in Card Body
  return (
    <>
      <div 
        onClick={handleClick}
        className={`group/impact relative overflow-hidden bg-emerald-50/80 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-800/40 p-2.5 flex items-center justify-between gap-2 transition-all hover:bg-emerald-100/80 dark:hover:bg-emerald-900/30 hover:border-emerald-400 dark:hover:border-emerald-600 cursor-pointer select-none ${className}`}
        title="Clique para saber mais sobre a doação de 10% para projetos sociais"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 bg-emerald-600 dark:bg-emerald-500 rounded-none flex items-center justify-center text-white shrink-0 shadow-sm group-hover/impact:scale-110 transition-transform">
            <Heart size={11} className="fill-white animate-pulse" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[8px] font-mono font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 truncate">
                IMPACTO SOCIAL // 10%
              </span>
              <Info size={9} className="text-emerald-600 dark:text-emerald-400 opacity-60 group-hover/impact:opacity-100 transition-opacity" />
            </div>
            <span className="text-[8.5px] text-zinc-500 dark:text-zinc-400 font-sans truncate">
              Kimonos e suporte p/ projetos de BJJ
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="font-mono text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 border border-emerald-300/80 dark:border-emerald-700/80 tracking-tight shadow-2xs">
            +{formattedDonation}
          </span>
        </div>
      </div>
      {modalElement}
    </>
  );
};
export default SocialImpactBadge;

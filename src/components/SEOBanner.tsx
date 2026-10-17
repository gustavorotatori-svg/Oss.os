import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ShieldCheck, Zap, TrendingDown, Check, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SEOBannerProps {
  onCompareClick?: () => void;
  onExploreClick?: () => void;
}

export const SEOBanner: React.FC<SEOBannerProps> = ({ onCompareClick, onExploreClick }) => {
  return (
    <section className="w-full bg-zinc-950 text-white border-y border-zinc-850 py-8 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left Title & Value Prop */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-green-500 text-black text-[9px] font-black font-mono uppercase tracking-widest">
                100% GRATUITO
              </span>
              <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                // MOTOR DE BUSCA & COMPARADOR DE PREÇOS BJJ
              </span>
            </div>
            
            <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight text-white">
              Por que o OSS.OS é 100% Gratuito para Atletas e Dojos?
            </h2>
            
            <p className="text-xs md:text-sm text-zinc-400 font-serif italic leading-relaxed">
              Eliminamos a intermediação abusiva. Nosso motor inteligente varre lojas oficiais e marketplaces para você encontrar o menor preço em kimonos, rashguards e faixas sem pagar nenhuma taxa ou assinatura.
            </p>
          </div>

          {/* Right Highlights & Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="p-3 bg-zinc-900 border border-zinc-800">
              <div className="flex items-center gap-1.5 text-green-400 text-xs font-black mb-1">
                <TrendingDown size={14} /> -40% MÉDIA
              </div>
              <span className="block text-[10px] text-zinc-400 font-mono uppercase">
                Economia Real
              </span>
            </div>

            <div className="p-3 bg-zinc-900 border border-zinc-800">
              <div className="flex items-center gap-1.5 text-green-400 text-xs font-black mb-1">
                <ShieldCheck size={14} /> LGPD OK
              </div>
              <span className="block text-[10px] text-zinc-400 font-mono uppercase">
                Dados Blindados
              </span>
            </div>

            <div className="p-3 bg-zinc-900 border border-zinc-800 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-green-400 text-xs font-black mb-1">
                <Scale size={14} /> SEM VIÉS
              </div>
              <span className="block text-[10px] text-zinc-400 font-mono uppercase">
                Comparação Neutra
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

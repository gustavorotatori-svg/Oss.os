import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Flame, Scale, Layers, SearchX, RotateCcw } from 'lucide-react';

/* ============================================================================
   1. OSS SELO STAMP (Selo de Autenticidade & Garantia do Tatame)
   ============================================================================ */
export interface OSSSeloStampProps {
  variant?: 'compact' | 'badge' | 'full' | 'hero';
  text?: string;
  className?: string;
  serialNumber?: string;
}

export const OSSSeloStamp: React.FC<OSSSeloStampProps> = ({
  variant = 'badge',
  text = 'SELO DE QUALIDADE TATAME • CURATORIA OSS.OS',
  className = '',
  serialNumber = 'BJJ-2026-81'
}) => {
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-950/40 dark:bg-red-950/60 border border-red-600/40 text-red-500 font-mono text-[9px] font-black uppercase tracking-widest ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
        <span>OSS.OS • 柔術</span>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={`relative inline-flex items-center gap-3 px-4 py-2 bg-black border-2 border-red-600 text-white font-mono shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] ${className}`}>
        <div className="flex flex-col items-center justify-center bg-red-600 text-black px-2 py-1 font-black text-xs leading-none">
          <span>柔</span>
          <span>術</span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-[0.25em] text-red-500 uppercase">CURATORIA OFICIAL</span>
            <span className="text-[8px] text-zinc-500 font-mono">SN: {serialNumber}</span>
          </div>
          <p className="text-xs font-sans font-black tracking-wider uppercase text-white">
            100% VERIFICADO NO TATAME
          </p>
        </div>
        <ShieldCheck size={18} className="text-red-500 ml-1" />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-red-600/50 text-red-400 font-mono text-[10px] uppercase tracking-widest ${className}`}>
      <span className="font-serif italic text-red-500 font-bold">押</span>
      <span className="font-bold">{text}</span>
      <span className="text-[8px] text-zinc-500 font-normal">[{serialNumber}]</span>
    </div>
  );
};

/* ============================================================================
   2. BELT RANK BAR (Indicador de Graduação de Faixa BJJ)
   ============================================================================ */
export type BeltRank = 'white' | 'blue' | 'purple' | 'brown' | 'black' | 'coral' | 'red';

export interface BeltRankBarProps {
  rank?: BeltRank;
  stripes?: number; // 0 to 4 graus
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const BELT_CONFIGS: Record<BeltRank, { bg: string; border: string; barBg: string; text: string; ptName: string }> = {
  white: { bg: 'bg-zinc-100 text-black', border: 'border-zinc-300', barBg: 'bg-black', text: 'Faixa Branca (White Belt)', ptName: 'BRANCA' },
  blue: { bg: 'bg-blue-600 text-white', border: 'border-blue-500', barBg: 'bg-black', text: 'Faixa Azul (Blue Belt)', ptName: 'AZUL' },
  purple: { bg: 'bg-purple-700 text-white', border: 'border-purple-600', barBg: 'bg-black', text: 'Faixa Roxa (Purple Belt)', ptName: 'ROXA' },
  brown: { bg: 'bg-amber-900 text-white', border: 'border-amber-800', barBg: 'bg-black', text: 'Faixa Marrom (Brown Belt)', ptName: 'MARROM' },
  black: { bg: 'bg-black text-white', border: 'border-zinc-800', barBg: 'bg-red-600', text: 'Faixa Preta (Black Belt)', ptName: 'PRETA' },
  coral: { bg: 'bg-gradient-to-r from-red-600 via-black to-red-600 text-white', border: 'border-red-600', barBg: 'bg-black', text: 'Faixa Coral (7º/8º Dan)', ptName: 'CORAL' },
  red: { bg: 'bg-red-700 text-white', border: 'border-red-600', barBg: 'bg-black', text: 'Faixa Vermelha (9º/10º Dan)', ptName: 'VERMELHA' }
};

export const BeltRankBar: React.FC<BeltRankBarProps> = ({
  rank = 'black',
  stripes = 2,
  showLabel = true,
  className = '',
  size = 'md'
}) => {
  const config = BELT_CONFIGS[rank] || BELT_CONFIGS.black;
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Belt Strap Body */}
      <div className={`relative flex items-center justify-between border ${config.border} ${config.bg} ${isSm ? 'h-5 px-1.5 min-w-[90px]' : isLg ? 'h-8 px-3 min-w-[150px]' : 'h-6 px-2 min-w-[120px]'} font-mono shadow-sm`}>
        {/* Belt Name */}
        <span className={`font-black uppercase tracking-wider ${isSm ? 'text-[8px]' : isLg ? 'text-[11px]' : 'text-[9px]'}`}>
          {config.ptName}
        </span>

        {/* Rank Bar Sleeve (Ponteira) */}
        <div className={`flex items-center justify-end px-1 ${config.barBg} ${isSm ? 'h-3 w-7' : isLg ? 'h-5 w-12' : 'h-4 w-9'} border border-black/40`}>
          {/* White Rank Stripes (Graus) */}
          <div className="flex items-center gap-0.5">
            {Array.from({ length: Math.min(4, Math.max(0, stripes)) }).map((_, idx) => (
              <span
                key={idx}
                className={`bg-white ${isSm ? 'w-0.5 h-2' : isLg ? 'w-1 h-3.5' : 'w-0.5 h-2.5'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {showLabel && (
        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:inline">
          {config.text}
        </span>
      )}
    </div>
  );
};

/* ============================================================================
   3. WEAVE GSM GAUGE (Densidade do Tecido Trançado do Kimono)
   ============================================================================ */
export interface WeaveGSMGaugeProps {
  gsm?: number; // e.g. 350, 450, 550, 650
  weaveType?: string; // e.g. "Pearl Weave", "Single Weave", "Gold Weave", "Ripstop"
  className?: string;
}

export const WeaveGSMGauge: React.FC<WeaveGSMGaugeProps> = ({
  gsm = 450,
  weaveType = 'Pearl Weave',
  className = ''
}) => {
  // Normalize gsm percentage for gauge bar (Range 300 to 750 GSM)
  const pct = Math.min(100, Math.max(10, ((gsm - 300) / 450) * 100));

  let densityLabel = 'LEVE (Treino Diario)';
  if (gsm >= 500) densityLabel = 'PESADO (Competicao / Blindado)';
  else if (gsm >= 420) densityLabel = 'MEDIO (Equilibrado)';

  return (
    <div className={`bg-zinc-950 border border-zinc-800 p-3 space-y-2 font-mono ${className}`}>
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5 text-zinc-300 font-bold uppercase tracking-wider">
          <Layers size={12} className="text-green-500" />
          <span>TECIDO: {weaveType}</span>
        </div>
        <span className="text-green-500 font-black text-xs">{gsm} GSM</span>
      </div>

      {/* Density Meter Bar */}
      <div className="relative w-full h-1.5 bg-zinc-900 border border-zinc-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-green-500 via-amber-500 to-red-600"
        />
      </div>

      <div className="flex justify-between items-center text-[8px] text-zinc-500 uppercase tracking-widest">
        <span>300 GSM (Lite)</span>
        <span className="text-zinc-400 font-bold">{densityLabel}</span>
        <span>750 GSM (Gold)</span>
      </div>
    </div>
  );
};

/* ============================================================================
   4. TATAME GRID SECTION (Wrapper com Cantoneiras Japonesas e Grid Tático)
   ============================================================================ */
export interface TatameGridSectionProps {
  title: string;
  subtitle?: string;
  tag?: string;
  kanji?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const TatameGridSection: React.FC<TatameGridSectionProps> = ({
  title,
  subtitle,
  tag = 'OSS.OS CORE',
  kanji = '柔',
  children,
  className = '',
  action
}) => {
  return (
    <section className={`relative border border-zinc-800 bg-black/90 p-6 md:p-8 ${className}`}>
      {/* Tactical L-Corner Marks */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-600 pointer-events-none" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-600 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-600 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-600 pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-zinc-800 pb-4 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-red-950/80 border border-red-800 text-red-500 font-mono text-[9px] font-black uppercase tracking-widest">
              {tag}
            </span>
            <span className="font-serif italic text-zinc-600 text-xs font-bold">{kanji}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-zinc-400 font-sans tracking-wide mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {action && (
          <div className="shrink-0">
            {action}
          </div>
        )}
      </div>

      {/* Section Content */}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
};

/* ============================================================================
   5. EMPTY STATE TATAME (Estado Vazio Autoral sem Fluff Genérico)
   ============================================================================ */
export interface EmptyStateTatameProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  resetText?: string;
  icon?: React.ReactNode;
}

export const EmptyStateTatame: React.FC<EmptyStateTatameProps> = ({
  title = 'NENHUM KIMONO ENCONTRADO NO TATAME',
  description = 'Sua busca não retornou resultados com os filtros selecionados. Tente ajustar a faixa de preço, marca ou categoria.',
  onReset,
  resetText = 'LIMPAR FILTROS E VOLTAR AO CATÁLOGO',
  icon
}) => {
  return (
    <div className="relative border-2 border-dashed border-zinc-800 bg-zinc-950/60 p-8 sm:p-12 text-center my-8">
      {/* Background Kanji Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
        <span className="font-serif text-[180px] font-black text-white">空</span>
      </div>

      <div className="relative z-10 max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 mx-auto rounded-none bg-black border-2 border-zinc-700 flex items-center justify-center text-red-500 shadow-md">
          {icon || <SearchX size={24} />}
        </div>

        <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white font-mono">
          {title}
        </h3>

        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          {description}
        </p>

        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] font-black uppercase tracking-widest transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
          >
            <RotateCcw size={13} />
            <span>{resetText}</span>
          </button>
        )}
      </div>
    </div>
  );
};

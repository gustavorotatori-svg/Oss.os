import React from 'react';
import { motion } from 'motion/react';

export interface KimonoLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  subtext?: string;
  className?: string;
  overlay?: boolean;
}

export const KimonoIcon: React.FC<{ size?: number; className?: string; color?: string }> = ({
  size = 32,
  className = '',
  color = 'currentColor'
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Kimono BJJ"
    >
      {/* Kimono Jacket Body & Sleeves */}
      <path
        d="M20 10L6 22L14 27L17 21V52H47V21L50 27L58 22L44 10H20Z"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Left Lapel (Crossed over) */}
      <path
        d="M20 10L33 36L29 42L17 14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right Lapel */}
      <path
        d="M44 10L31 36"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Black Belt / Faixa Preta Base */}
      <rect
        x="17"
        y="36"
        width="30"
        height="6"
        fill="#18181b"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Belt Knot */}
      <rect
        x="29"
        y="34"
        width="6"
        height="10"
        rx="1"
        fill="#09090b"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      {/* Left Hanging Belt End with Red Bar (Ponteira Vermelha) */}
      <path
        d="M29 44L27 58H31L33 44H29Z"
        fill="#09090b"
        stroke="currentColor"
        strokeWidth="1"
      />
      {/* Red Rank Bar (Faixa Preta Graduada) */}
      <path
        d="M27.5 51L27 57H31L31.5 51H27.5Z"
        fill="#dc2626"
      />
      {/* White Stripes (Graus) */}
      <line x1="28" y1="53" x2="30.5" y2="53" stroke="#ffffff" strokeWidth="1" />
      <line x1="28" y1="55" x2="30.5" y2="55" stroke="#ffffff" strokeWidth="1" />
      {/* Right Hanging Belt End */}
      <path
        d="M33 44L35 56H38L35 44H33Z"
        fill="#09090b"
        stroke="currentColor"
        strokeWidth="1"
      />
      {/* Jacket Texture / Reinforced Gola lines */}
      <line x1="22" y1="18" x2="28" y2="28" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
      <line x1="42" y1="18" x2="36" y2="28" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
    </svg>
  );
};

export const KimonoLoader: React.FC<KimonoLoaderProps> = ({
  size = 'md',
  text = 'FILTRANDO NO TATAME...',
  subtext = 'Atualizando curadoria de kimonos, faixas e equipamentos',
  className = '',
  overlay = false
}) => {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 48 : 36;
  const ringSize = size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-24 h-24' : 'w-16 h-16';

  const content = (
    <div className={`flex flex-col items-center justify-center text-center p-6 select-none ${className}`}>
      {/* Spinning Kimono Emblem */}
      <div className={`relative ${ringSize} flex items-center justify-center mb-4`}>
        {/* Outer tactical rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 opacity-70"
        />

        {/* Counter-rotating accent ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-1 rounded-full border-2 border-t-green-500 border-r-transparent border-b-red-600 border-l-transparent"
        />

        {/* Pulsing Aura Glow */}
        <motion.div
          animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-2 bg-green-500/10 dark:bg-green-400/15 rounded-full blur-sm"
        />

        {/* Rotating & Floating Kimono Icon */}
        <motion.div
          animate={{
            rotateY: [0, 180, 360],
            rotateZ: [0, 5, -5, 0],
            scale: [0.95, 1.05, 0.95]
          }}
          transition={{
            rotateY: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
            rotateZ: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
            scale: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="relative z-10 text-zinc-900 dark:text-zinc-100 drop-shadow-md flex items-center justify-center"
        >
          <KimonoIcon size={iconSize} />
        </motion.div>
      </div>

      {/* Loading Status Text */}
      {text && (
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
            <p className="text-[11px] font-mono font-black uppercase tracking-[0.25em] text-zinc-900 dark:text-zinc-100">
              {text}
            </p>
          </div>
          {subtext && (
            <p className="text-[9px] font-sans text-zinc-500 dark:text-zinc-400 font-medium tracking-wide max-w-xs">
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center min-h-[300px]"
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

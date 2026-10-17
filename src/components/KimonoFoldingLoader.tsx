import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check, Flame } from 'lucide-react';

export interface KimonoFoldingLoaderProps {
  message?: string;
  subMessage?: string;
  colorTheme?: 'white' | 'royal' | 'black';
  size?: 'sm' | 'md' | 'lg';
  showStepsIndicator?: boolean;
  inline?: boolean;
  className?: string;
}

export const KimonoFoldingLoader: React.FC<KimonoFoldingLoaderProps> = ({
  message = "Dobrando o kimono e filtrando o acervo...",
  subMessage = "Ajustando a pegada nos filtros selecionados • OSS",
  colorTheme = 'white',
  size = 'md',
  showStepsIndicator = true,
  inline = false,
  className = ""
}) => {
  // Cycle between 0 (laid flat), 1 (left sleeve folded), 2 (right sleeve folded), 3 (bottom folded up), 4 (belt tied)
  const [step, setStep] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<'white' | 'royal' | 'black'>(colorTheme);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 5);
    }, 1100);

    return () => clearInterval(interval);
  }, []);

  // Theme palettes
  const palettes = {
    white: {
      fabric: '#F4F4F5', // zinc-100
      fabricBorder: '#D4D4D8', // zinc-300
      lapel: '#E4E4E7', // zinc-200
      lapelBorder: '#A1A1AA', // zinc-400
      lapelAccent: '#DC2626', // red-600
      shadow: 'rgba(0, 0, 0, 0.08)',
      innerLines: '#E4E4E7',
      label: 'Branco Tradicional'
    },
    royal: {
      fabric: '#1D4ED8', // blue-700
      fabricBorder: '#1E40AF', // blue-800
      lapel: '#1E3A8A', // blue-900
      lapelBorder: '#172554', // blue-950
      lapelAccent: '#F59E0B', // amber-500
      shadow: 'rgba(0, 0, 0, 0.25)',
      innerLines: '#2563EB',
      label: 'Azul Royal BJJ'
    },
    black: {
      fabric: '#18181B', // zinc-900
      fabricBorder: '#27272A', // zinc-800
      lapel: '#09090B', // zinc-950
      lapelBorder: '#3F3F46', // zinc-700
      lapelAccent: '#DC2626', // red-600
      shadow: 'rgba(0, 0, 0, 0.4)',
      innerLines: '#27272A',
      label: 'Preto Campeão'
    }
  };

  const currentTheme = palettes[selectedColor];

  // Scale based on size prop
  const scaleClass = {
    sm: 'max-w-[240px]',
    md: 'max-w-[320px]',
    lg: 'max-w-[420px]'
  }[size];

  const stepsList = [
    { label: 'Posicionamento', desc: 'Vagui estendido no tatame' },
    { label: 'Manga Esquerda', desc: 'Lapela cruzada' },
    { label: 'Manga Direita', desc: 'Dobra frontal' },
    { label: 'Corpo & Saia', desc: 'Dobra compacta' },
    { label: 'Faixa & Nó OSS', desc: 'Acervo pronto' },
  ];

  return (
    <div
      id="kimono-folding-loader-container"
      className={`relative flex flex-col items-center justify-center ${
        inline ? 'p-6 sm:p-10' : 'py-14 px-4 sm:px-8 min-h-[360px]'
      } w-full text-center select-none ${className}`}
    >
      {/* Background Tatame Texture Accent */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl opacity-40 dark:opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Main Kimono SVG Animation Container */}
      <div className={`relative w-full ${scaleClass} aspect-[4/3] flex items-center justify-center mx-auto`}>
        <svg
          viewBox="0 0 320 260"
          className="w-full h-full drop-shadow-xl overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Tatame Mat Shadow */}
            <filter id="tatameShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="10" floodOpacity="0.15" />
            </filter>
            {/* Pearl Weave pattern */}
            <pattern id="pearlWeave" width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M 0 3 L 6 3 M 3 0 L 3 6" stroke={currentTheme.innerLines} strokeWidth="0.75" strokeOpacity="0.6" />
            </pattern>
          </defs>

          {/* 0. Tatame Outline Base (Mat Matched Ground) */}
          <rect
            x="30"
            y="235"
            width="260"
            height="10"
            rx="5"
            className="fill-zinc-200/80 dark:fill-zinc-800/80"
          />

          {/* MAIN KIMONO GROUP */}
          <g id="kimono-full-model" filter="url(#tatameShadow)">
            
            {/* 1. LOWER SKIRT / BODY (Folds upward at step 3 & 4) */}
            <motion.g
              id="kimono-skirt"
              initial={false}
              animate={{
                y: step >= 3 ? -35 : 0,
                scaleY: step >= 3 ? 0.65 : 1,
                opacity: 1
              }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              style={{ originX: '160px', originY: '170px' }}
            >
              {/* Back / skirt jacket body */}
              <path
                d="M 100 120 L 220 120 L 230 215 L 90 215 Z"
                fill={currentTheme.fabric}
                stroke={currentTheme.fabricBorder}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M 100 120 L 220 120 L 230 215 L 90 215 Z"
                fill="url(#pearlWeave)"
              />
              {/* Side slit split typical in BJJ gis */}
              <line x1="90" y1="185" x2="95" y2="215" stroke={currentTheme.lapelAccent} strokeWidth="3" />
              <line x1="230" y1="185" x2="225" y2="215" stroke={currentTheme.lapelAccent} strokeWidth="3" />
            </motion.g>

            {/* 2. MAIN CHEST TORSO / BACK */}
            <path
              d="M 100 45 L 220 45 L 220 160 L 100 160 Z"
              fill={currentTheme.fabric}
              stroke={currentTheme.fabricBorder}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M 100 45 L 220 45 L 220 160 L 100 160 Z"
              fill="url(#pearlWeave)"
            />

            {/* BJJ Chest Patch (OSS / IBJJF Approved Style) */}
            <rect
              x="180"
              y="75"
              width="24"
              height="16"
              rx="2"
              fill={currentTheme.lapelAccent}
              stroke="#FFFFFF"
              strokeWidth="0.8"
            />
            <text
              x="192"
              y="86"
              fill="#FFFFFF"
              fontSize="8"
              fontWeight="900"
              fontFamily="monospace"
              textAnchor="middle"
            >
              OSS
            </text>

            {/* Collar / Back Neck Collar */}
            <path
              d="M 135 45 Q 160 55 185 45 L 185 38 Q 160 48 135 38 Z"
              fill={currentTheme.lapel}
              stroke={currentTheme.lapelBorder}
              strokeWidth="2"
            />

            {/* 3. LEFT SLEEVE (Folds inward at step >= 1) */}
            <motion.g
              id="kimono-left-sleeve"
              initial={false}
              animate={{
                rotate: step >= 1 ? 52 : 0,
                x: step >= 1 ? 50 : 0,
                y: step >= 1 ? 25 : 0,
                scaleX: step >= 1 ? 0.9 : 1
              }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              style={{ originX: '100px', originY: '50px' }}
            >
              {/* Arm fabric */}
              <path
                d="M 100 50 L 30 75 L 45 130 L 100 115 Z"
                fill={currentTheme.fabric}
                stroke={currentTheme.fabricBorder}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M 100 50 L 30 75 L 45 130 L 100 115 Z"
                fill="url(#pearlWeave)"
              />
              {/* Sleeve Cuff / Punho Reforçado */}
              <path
                d="M 30 75 L 45 130"
                stroke={currentTheme.lapelAccent}
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Reinforced stitching lines */}
              <line x1="42" y1="80" x2="54" y2="126" stroke={currentTheme.fabricBorder} strokeWidth="1" strokeDasharray="2 2" />
            </motion.g>

            {/* 4. RIGHT SLEEVE (Folds inward over the left at step >= 2) */}
            <motion.g
              id="kimono-right-sleeve"
              initial={false}
              animate={{
                rotate: step >= 2 ? -52 : 0,
                x: step >= 2 ? -50 : 0,
                y: step >= 2 ? 25 : 0,
                scaleX: step >= 2 ? 0.9 : 1
              }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              style={{ originX: '220px', originY: '50px' }}
            >
              {/* Arm fabric */}
              <path
                d="M 220 50 L 290 75 L 275 130 L 220 115 Z"
                fill={currentTheme.fabric}
                stroke={currentTheme.fabricBorder}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M 220 50 L 290 75 L 275 130 L 220 115 Z"
                fill="url(#pearlWeave)"
              />
              {/* Sleeve Cuff / Punho Reforçado */}
              <path
                d="M 290 75 L 275 130"
                stroke={currentTheme.lapelAccent}
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Reinforced stitching lines */}
              <line x1="278" y1="80" x2="266" y2="126" stroke={currentTheme.fabricBorder} strokeWidth="1" strokeDasharray="2 2" />
            </motion.g>

            {/* 5. LAPELS (Classic BJJ V-Neck Overlap: Right under Left) */}
            {/* Left Lapel flap crossing towards right */}
            <path
              d="M 135 45 L 175 160 L 160 160 L 125 45 Z"
              fill={currentTheme.lapel}
              stroke={currentTheme.lapelBorder}
              strokeWidth="2"
            />
            {/* Right Lapel flap crossing over left (Traditional BJJ alignment) */}
            <path
              d="M 185 45 L 145 160 L 160 160 L 195 45 Z"
              fill={currentTheme.lapel}
              stroke={currentTheme.lapelBorder}
              strokeWidth="2.5"
            />
            {/* EVA Core thick collar rim */}
            <line x1="185" y1="45" x2="145" y2="160" stroke={currentTheme.lapelAccent} strokeWidth="2.5" />

            {/* 6. COMPACT FOLDED STATE SHADOW (Appears when folded) */}
            <motion.rect
              x="110"
              y="55"
              width="100"
              height="115"
              rx="6"
              fill="none"
              stroke={currentTheme.fabricBorder}
              strokeWidth="1.5"
              strokeDasharray="4 4"
              initial={false}
              animate={{ opacity: step >= 3 ? 0.8 : 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* 7. BLACK BELT (FAIXA PRETA BJJ) - Wraps & ties at step 4 */}
            <motion.g
              id="bjj-belt-wrapper"
              initial={false}
              animate={{
                opacity: step >= 4 ? 1 : 0,
                scale: step >= 4 ? 1 : 0.85,
                y: step >= 4 ? 0 : 15
              }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              {/* Belt Band around the waist */}
              <rect
                x="92"
                y="125"
                width="136"
                height="22"
                rx="3"
                fill="#18181B"
                stroke="#09090B"
                strokeWidth="2"
              />

              {/* Belt 8-stitch lines */}
              <line x1="95" y1="130" x2="225" y2="130" stroke="#3F3F46" strokeWidth="1" />
              <line x1="95" y1="136" x2="225" y2="136" stroke="#3F3F46" strokeWidth="1" />
              <line x1="95" y1="142" x2="225" y2="142" stroke="#3F3F46" strokeWidth="1" />

              {/* Classic BJJ Belt Knot (Nó de Faixa) */}
              <rect
                x="146"
                y="121"
                width="28"
                height="30"
                rx="4"
                fill="#18181B"
                stroke="#09090B"
                strokeWidth="2"
              />
              <path
                d="M 148 126 Q 160 134 172 126"
                stroke="#52525B"
                strokeWidth="2"
                fill="none"
              />

              {/* Hanging Belt Left End */}
              <motion.g
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                style={{ originX: '152px', originY: '145px' }}
              >
                <path
                  d="M 150 148 L 140 215 L 155 215 L 162 148 Z"
                  fill="#18181B"
                  stroke="#09090B"
                  strokeWidth="1.5"
                />
              </motion.g>

              {/* Hanging Belt Right End with Red Bar & Degrees (Tarja Vermelha e Graus) */}
              <motion.g
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                style={{ originX: '168px', originY: '145px' }}
              >
                <path
                  d="M 162 148 L 170 225 L 186 225 L 174 148 Z"
                  fill="#18181B"
                  stroke="#09090B"
                  strokeWidth="1.5"
                />
                {/* Red Bar (Ponteira de Instrutor / Faixa Preta) */}
                <path
                  d="M 166 185 L 170 225 L 186 225 L 182 185 Z"
                  fill="#DC2626"
                  stroke="#991B1B"
                  strokeWidth="1"
                />
                {/* White Degree Stripes (4 Graus de Faixa Preta) */}
                <rect x="168" y="192" width="13" height="2.5" fill="#FFFFFF" rx="0.5" />
                <rect x="169" y="198" width="13" height="2.5" fill="#FFFFFF" rx="0.5" />
                <rect x="170" y="204" width="14" height="2.5" fill="#FFFFFF" rx="0.5" />
                <rect x="171" y="210" width="14" height="2.5" fill="#FFFFFF" rx="0.5" />
              </motion.g>

              {/* Gold Sparkle on belt knot completion */}
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.3, 0.9, 1.1],
                  opacity: [0, 1, 0.8, 1]
                }}
                transition={{ duration: 0.5 }}
              >
                <circle cx="160" cy="136" r="4" fill="#F59E0B" />
                <path d="M 160 128 L 160 144 M 152 136 L 168 136" stroke="#F59E0B" strokeWidth="1.5" />
              </motion.g>
            </motion.g>

            {/* Sparkle burst at final step */}
            {step === 4 && (
              <motion.g
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 1.4] }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              >
                <circle cx="95" cy="50" r="3" fill="#EAB308" />
                <circle cx="225" cy="50" r="3" fill="#EAB308" />
                <circle cx="160" cy="30" r="4" fill="#DC2626" />
                <circle cx="70" cy="160" r="2.5" fill="#EAB308" />
                <circle cx="250" cy="160" r="2.5" fill="#EAB308" />
              </motion.g>
            )}
          </g>
        </svg>
      </div>

      {/* Textual Feedback and Stage Description */}
      <div className="mt-4 space-y-1.5 max-w-md mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-full text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
          <Flame size={13} className="text-red-600 dark:text-red-500 animate-pulse" />
          <span>{message}</span>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans tracking-wide">
          {subMessage}
        </p>
      </div>

      {/* Step Indicators: 5 Progressive Dots / Stages */}
      {showStepsIndicator && (
        <div className="mt-5 flex flex-col items-center gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {stepsList.map((item, idx) => {
              const isActive = step === idx;
              const isPast = step > idx;

              return (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 sm:gap-2"
                >
                  <div
                    className={`flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-600 text-white font-mono text-[10px] font-black shadow-md shadow-red-600/30 ring-2 ring-red-400/40 scale-110'
                        : isPast
                        ? 'w-6 h-6 rounded-full bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-mono text-[9px] font-bold'
                        : 'w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-400 font-mono text-[9px]'
                    }`}
                    title={`${item.label}: ${item.desc}`}
                  >
                    {isPast ? <Check size={12} strokeWidth={3} /> : idx + 1}
                  </div>
                  {idx < stepsList.length - 1 && (
                    <div
                      className={`h-0.5 w-3 sm:w-5 rounded-full transition-colors duration-300 ${
                        isPast ? 'bg-zinc-900 dark:bg-zinc-200' : 'bg-zinc-200 dark:bg-zinc-800'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Current step label */}
          <div className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
            <span className="font-bold text-red-600 dark:text-red-400">
              Passo {step + 1}/5:
            </span>
            <span>{stepsList[step].label}</span>
            <span className="text-zinc-400 dark:text-zinc-600">—</span>
            <span className="italic text-zinc-500">{stepsList[step].desc}</span>
          </div>
        </div>
      )}

      {/* Color Palette Switcher (Permite ao usuário alternar a cor do kimono para experimentar) */}
      <div className="mt-4 flex items-center gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 text-[10px] font-mono text-zinc-500">
        <span>Cor do Kimono:</span>
        <button
          type="button"
          onClick={() => setSelectedColor('white')}
          className={`px-2 py-0.5 rounded border transition-colors ${
            selectedColor === 'white'
              ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white border-zinc-400 dark:border-zinc-500 font-bold'
              : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          Branco
        </button>
        <button
          type="button"
          onClick={() => setSelectedColor('royal')}
          className={`px-2 py-0.5 rounded border transition-colors ${
            selectedColor === 'royal'
              ? 'bg-blue-600 text-white border-blue-700 font-bold'
              : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          Azul Royal
        </button>
        <button
          type="button"
          onClick={() => setSelectedColor('black')}
          className={`px-2 py-0.5 rounded border transition-colors ${
            selectedColor === 'black'
              ? 'bg-zinc-900 text-white border-zinc-950 font-bold'
              : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          Preto
        </button>
      </div>
    </div>
  );
};

export default KimonoFoldingLoader;

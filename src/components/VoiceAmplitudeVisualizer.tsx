import React, { useEffect, useState, useRef } from 'react';
import { Mic } from 'lucide-react';

interface VoiceExpandingRingProps {
  amplitude: number; // 0 to 1 normalized volume
  isListening?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

/**
 * Expanding/Contracting acoustic ring system that dynamically scales
 * its radius, border thickness, opacity, and glow based on the real-time audio amplitude.
 */
export const VoiceExpandingRing: React.FC<VoiceExpandingRingProps> = ({
  amplitude,
  isListening = true,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  // Clamp amplitude to 0-1
  const amp = Math.max(0, Math.min(1, amplitude));

  // Dimensions based on size variant
  const dimensions = {
    sm: { core: 'w-5 h-5', icon: 11, container: 'w-7 h-7' },
    md: { core: 'w-7 h-7', icon: 14, container: 'w-10 h-10' },
    lg: { core: 'w-12 h-12', icon: 20, container: 'w-16 h-16' },
  }[size];

  // Dynamic scale calculations based on amplitude:
  // Ring 1 (Inner core breath): scales from 1.0 to 1.35
  const scaleInner = 1 + amp * 0.35;
  // Ring 2 (Acoustic pulse ring): scales from 1.0 to 1.75
  const scaleMid = 1 + amp * 0.75;
  // Ring 3 (Outer shockwave ring): scales from 1.0 to 2.3
  const scaleOuter = 1 + amp * 1.3;

  // Dynamic glow and opacity
  const glowBlur = Math.round(4 + amp * 20);
  const glowOpacity = (0.35 + amp * 0.65).toFixed(2);
  const ring2Opacity = (0.25 + amp * 0.6).toFixed(2);
  const ring3Opacity = Math.max(0, (amp - 0.1) * 0.8).toFixed(2);

  return (
    <div className={`relative flex items-center justify-center ${dimensions.container} ${className}`}>
      {/* Outer Shockwave Ring (contracts to 1, expands up to 2.3x on vocal peaks) */}
      {isListening && (
        <span
          className="absolute inset-0 rounded-full border border-red-500 pointer-events-none transition-transform duration-75 ease-out"
          style={{
            transform: `scale(${scaleOuter})`,
            opacity: ring3Opacity,
            borderColor: amp > 0.6 ? '#ef4444' : '#f87171',
            boxShadow: `0 0 ${glowBlur * 1.2}px rgba(239, 68, 68, ${ring3Opacity})`,
          }}
        />
      )}

      {/* Middle Acoustic Ripple Ring (contracts and expands with amplitude) */}
      {isListening && (
        <span
          className="absolute inset-0 rounded-full border-2 border-red-500/80 pointer-events-none transition-transform duration-75 ease-out"
          style={{
            transform: `scale(${scaleMid})`,
            opacity: ring2Opacity,
            borderColor: amp > 0.7 ? '#ef4444' : amp > 0.4 ? '#f59e0b' : '#22c55e',
            boxShadow: `0 0 ${glowBlur}px rgba(239, 68, 68, ${glowOpacity})`,
          }}
        />
      )}

      {/* Core Expanding Aura */}
      <div
        className={`relative flex items-center justify-center rounded-full transition-transform duration-75 ease-out ${dimensions.core} ${
          isListening
            ? 'bg-red-500 text-white shadow-lg'
            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
        }`}
        style={{
          transform: `scale(${scaleInner})`,
          boxShadow: isListening
            ? `0 0 ${glowBlur}px rgba(239, 68, 68, ${glowOpacity}), inset 0 0 6px rgba(255, 255, 255, 0.4)`
            : 'none',
        }}
      >
        {showIcon && (
          <Mic
            size={dimensions.icon}
            className={`transition-transform duration-75 ${
              isListening ? 'animate-pulse' : ''
            }`}
            style={{
              transform: `scale(${1 + amp * 0.15})`,
            }}
          />
        )}
      </div>
    </div>
  );
};

interface DynamicWaveformProps {
  amplitude: number; // 0 to 1
  frequencyBands?: number[];
  width?: number | string;
  height?: number;
  className?: string;
  compact?: boolean;
}

/**
 * Dynamic SVG Audio Waveform that continuously undulates and scales
 * its wave crest height, wavelength, and harmonic amplitude based on real-time voice input.
 */
export const DynamicWaveform: React.FC<DynamicWaveformProps> = ({
  amplitude,
  frequencyBands = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
  width = '100%',
  height = 24,
  className = '',
  compact = false,
}) => {
  const [phase, setPhase] = useState(0);
  const animFrameRef = useRef<number | null>(null);

  // Smooth continuous phase animation for the waveform motion
  useEffect(() => {
    let currentPhase = 0;
    const animate = () => {
      // Faster phase velocity when speaking louder
      const speed = 0.08 + amplitude * 0.16;
      currentPhase += speed;
      setPhase(currentPhase);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [amplitude]);

  const amp = Math.max(0.08, Math.min(1, amplitude));
  const centerY = height / 2;
  const points = compact ? 24 : 40;
  const viewBoxWidth = 120;

  // Generate primary sine wave with real-time amplitude scaling
  const maxCrest = (height / 2) * 0.92;
  const wavePoints: [number, number][] = [];
  const secondaryPoints: [number, number][] = [];

  for (let i = 0; i <= points; i++) {
    const x = (i / points) * viewBoxWidth;
    const progress = i / points;
    // Window envelope: smooth damping at edges so waveform anchors at start/end
    const envelope = Math.sin(progress * Math.PI);

    // Primary harmonic: wave crest scales directly with amp
    const y1 =
      centerY +
      Math.sin(progress * Math.PI * 4 + phase) *
        (amp * maxCrest * envelope) +
      Math.sin(progress * Math.PI * 8 - phase * 1.3) *
        (amp * maxCrest * 0.35 * envelope);

    // Secondary subtle harmonic for rich acoustic depth
    const y2 =
      centerY +
      Math.sin(progress * Math.PI * 5 + phase * 1.5 + Math.PI / 3) *
        (amp * maxCrest * 0.65 * envelope);

    wavePoints.push([x, Math.max(1, Math.min(height - 1, y1))]);
    secondaryPoints.push([x, Math.max(1, Math.min(height - 1, y2))]);
  }

  // Construct SVG path strings
  const pathD1 = wavePoints.reduce((acc, [x, y], idx) => {
    return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }, '');

  const pathD2 = secondaryPoints.reduce((acc, [x, y], idx) => {
    return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }, '');

  // Fill path to close along the bottom
  const fillD = `${pathD1} L ${viewBoxWidth} ${height} L 0 ${height} Z`;

  // Color gradient shifts from emerald (quiet) -> gold (mid) -> bright crimson red (high volume)
  const strokeColor =
    amp > 0.7 ? '#ef4444' : amp > 0.4 ? '#f59e0b' : '#22c55e';
  const strokeWidth = compact ? 1.5 + amp * 1.2 : 2 + amp * 1.8;

  return (
    <div
      className={`relative overflow-hidden flex items-center ${className}`}
      style={{ height: `${height}px` }}
    >
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full"
        style={{
          filter: amp > 0.4 ? `drop-shadow(0 0 ${Math.round(amp * 8)}px ${strokeColor})` : 'none',
        }}
      >
        <defs>
          <linearGradient id="waveFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25 + amp * 0.35} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="waveStrokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor={amp > 0.6 ? '#ef4444' : '#f59e0b'} />
            <stop offset="100%" stopColor={amp > 0.75 ? '#dc2626' : '#22c55e'} />
          </linearGradient>
        </defs>

        {/* Ambient Gradient Fill Under Wave */}
        <path d={fillD} fill="url(#waveFillGrad)" />

        {/* Secondary Background Harmonic Wave */}
        <path
          d={pathD2}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1}
          strokeOpacity={0.35 + amp * 0.4}
          strokeDasharray="2,2"
        />

        {/* Primary Animated Acoustic Waveform */}
        <path
          d={pathD1}
          fill="none"
          stroke="url(#waveStrokeGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

interface VoiceWaveformEqualizerComboProps {
  amplitude: number;
  frequencyBands: number[];
  className?: string;
}

/**
 * Combined compact waveform & expanding indicator badge for the header search bar
 */
export const VoiceWaveformEqualizerCombo: React.FC<VoiceWaveformEqualizerComboProps> = ({
  amplitude,
  frequencyBands,
  className = '',
}) => {
  const amp = Math.max(0, Math.min(1, amplitude));

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Real-time Dynamic Waveform Canvas */}
      <div className="w-16 sm:w-20 lg:w-24 h-5 flex items-center">
        <DynamicWaveform amplitude={amp} height={20} compact />
      </div>

      {/* 5-bar responsive vertical equalizer that scales with frequency & amplitude */}
      <div
        className="flex items-end gap-0.5 h-4 w-9 justify-center"
        aria-label="Equalizador vocal"
      >
        {frequencyBands.slice(0, 5).map((band, idx) => {
          const heightPx = Math.max(3, Math.min(16, Math.round(band * 16)));
          const barColor =
            band > 0.75 ? '#ef4444' : band > 0.45 ? '#f59e0b' : '#22c55e';
          return (
            <span
              key={idx}
              className="w-1 rounded-xs transition-all duration-75"
              style={{
                height: `${heightPx}px`,
                backgroundColor: barColor,
                boxShadow: band > 0.5 ? `0 0 4px ${barColor}` : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Live Percentage Badge */}
      <span className="text-[9px] font-mono font-bold text-zinc-700 dark:text-zinc-200 min-w-[26px] text-right">
        {Math.round(amp * 100)}%
      </span>
    </div>
  );
};

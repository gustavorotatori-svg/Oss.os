import confetti from 'canvas-confetti';

/**
 * Dispara explosões de partículas (canvas-confetti) no centro da tela com cores temáticas de Jiu-Jitsu / OSS.OS
 */
export interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
}

export function fireCenterConfetti(options?: ConfettiOptions) {
  try {
    const defaultColors = ['#22c55e', '#eab308', '#ffffff', '#10b981', '#3b82f6', '#ef4444'];
    const origin = options?.origin || { x: 0.5, y: 0.5 };
    const particleCount = options?.particleCount || 160;
    const spread = options?.spread || 90;
    const colors = options?.colors || defaultColors;

    // Main Center Burst
    confetti({
      particleCount,
      spread,
      origin,
      colors,
      ticks: 250,
      gravity: 0.9,
      scalar: 1.1,
      shapes: ['square', 'circle']
    });

    // Secondary side bursts for rich celebratory feel
    setTimeout(() => {
      confetti({
        particleCount: Math.floor(particleCount * 0.6),
        angle: 60,
        spread: 60,
        origin: { x: 0.15, y: 0.6 },
        colors,
        gravity: 1,
        scalar: 1
      });
    }, 120);

    setTimeout(() => {
      confetti({
        particleCount: Math.floor(particleCount * 0.6),
        angle: 120,
        spread: 60,
        origin: { x: 0.85, y: 0.6 },
        colors,
        gravity: 1,
        scalar: 1
      });
    }, 240);

    // Play celebration audio chord if Web Audio is available
    if (typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          const playNote = (freq: number, delay: number, dur: number) => {
            setTimeout(() => {
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.frequency.value = freq;
              osc.type = 'triangle';
              gain.gain.setValueAtTime(0, audioCtx.currentTime);
              gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.04);
              gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
              osc.start();
              osc.stop(audioCtx.currentTime + dur);
            }, delay);
          };
          playNote(523.25, 0, 0.35); // C5
          playNote(659.25, 100, 0.35); // E5
          playNote(783.99, 200, 0.4); // G5
          playNote(1046.50, 320, 0.55); // C6
        }
      } catch (e) {
        // Silently skip audio if unavailable or restricted
      }
    }
  } catch (err) {
    console.warn('[OSS.OS] Confetti execution skipped:', err);
  }
}

/**
 * Celebração específica ao adicionar o primeiro item na sacola
 */
export function fireFirstCartItemConfetti() {
  fireCenterConfetti({
    particleCount: 140,
    spread: 80,
    origin: { x: 0.5, y: 0.5 },
    colors: ['#22c55e', '#eab308', '#ffffff', '#10b981', '#38bdf8']
  });
}

/**
 * Celebração grandiosa ao finalizar uma compra / redirecionamento de parceiro
 */
export function firePurchaseCelebrationConfetti() {
  fireCenterConfetti({
    particleCount: 200,
    spread: 100,
    origin: { x: 0.5, y: 0.5 },
    colors: ['#22c55e', '#eab308', '#ffffff', '#10b981', '#ef4444', '#f59e0b']
  });
}

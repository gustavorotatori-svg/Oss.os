import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, Crown, Sparkles, Award, Star, Flame, CheckCircle2, X, ChevronRight, Gift } from 'lucide-react';

export interface LoyaltyMilestone {
  points: number;
  title: string;
  badge: string;
  beltTier: string;
  trophyColor: string;
  description: string;
  perk: string;
  rankIndex: number;
}

export const LOYALTY_MILESTONES: LoyaltyMilestone[] = [
  {
    points: 100,
    title: 'Guerreiro Iniciante',
    badge: '🥋 1º Grau no Tatame',
    beltTier: 'Faixa Branca Reforçada',
    trophyColor: 'from-amber-400 via-amber-500 to-amber-700',
    description: 'Primeiro grande marco de fidelidade alcançado! Você fincou suas raízes na linhagem OSS.',
    perk: 'Desbloqueio de E-books Técnicos & 1º Selo de Consistência',
    rankIndex: 1
  },
  {
    points: 250,
    title: 'Guardião da Guarda',
    badge: '🛡️ Bronze Conquistador',
    beltTier: 'Faixa Azul Pro',
    trophyColor: 'from-blue-400 via-indigo-500 to-blue-700',
    description: '250 pontos acumulados com disciplina. Sua guarda e sua pegada estão inquebráveis!',
    perk: 'Acesso prioritário a sorteios de kimonos oficiais e kits',
    rankIndex: 2
  },
  {
    points: 500,
    title: 'Mestre da Passagem',
    badge: '⚔️ Prata de Honra',
    beltTier: 'Faixa Roxa Mestre',
    trophyColor: 'from-purple-400 via-purple-600 to-indigo-800',
    description: 'Meio milhar de pontos de fidelidade! Você domina o ritmo dos treinos e reviews técnicos.',
    perk: 'Desconto duplo em cupons parceiros e destaque no mural de atletas',
    rankIndex: 3
  },
  {
    points: 750,
    title: 'Predador dos Tatames',
    badge: '👑 Ouro Supremo',
    beltTier: 'Faixa Marrom Elite',
    trophyColor: 'from-amber-500 via-orange-500 to-amber-800',
    description: '750 pontos! Referência de disciplina e consistência entre praticantes de todas as graduações.',
    perk: 'Cupom de R$ 50 de desconto exclusivo e badge dourado no perfil',
    rankIndex: 4
  },
  {
    points: 1000,
    title: 'Lenda Faixa Preta OSS',
    badge: '🏆 Grand Slam 1.000 PTS',
    beltTier: 'Faixa Preta Tarja Vermelha',
    trophyColor: 'from-yellow-300 via-amber-400 to-yellow-600',
    description: '1.000 pontos atingidos! O patamar mais nobre da jornada marcial no ecossistema OSS.OS.',
    perk: 'Status VIP Vitalício, sorteios mensais automáticos e troféu digital perpétuo',
    rankIndex: 5
  },
  {
    points: 1500,
    title: 'Grão-Mestre Coral',
    badge: '🌟 Mestre Eterno',
    beltTier: 'Faixa Coral Tradicional',
    trophyColor: 'from-red-500 via-amber-400 to-red-700',
    description: '1.500 pontos de pura dedicação, honra e transmissão de conhecimento no tatame.',
    perk: 'Acesso antecipado a todos os lançamentos de produtos e eventos VIP',
    rankIndex: 6
  },
  {
    points: 2000,
    title: 'Hall da Fama BJJ',
    badge: '⚡ Lendário Imortal',
    beltTier: 'Faixa Vermelha 10º Grau',
    trophyColor: 'from-yellow-200 via-yellow-400 to-amber-600',
    description: '2.000 pontos acumulados! Imortalizado no ápice do Jiu-Jitsu nacional e internacional.',
    perk: 'Insígnia Dourada do Hall da Fama no perfil e kit surpresa oficial',
    rankIndex: 7
  }
];

interface FloatingTrophyItem {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  rotation: number;
  type: 'trophy' | 'crown' | 'medal' | 'star';
  color: string;
}

interface LoyaltyMilestoneCelebrationProps {
  milestone: LoyaltyMilestone | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToFidelidade?: () => void;
  currentPoints?: number;
}

export const LoyaltyMilestoneCelebration: React.FC<LoyaltyMilestoneCelebrationProps> = ({
  milestone,
  isOpen,
  onClose,
  onNavigateToFidelidade,
  currentPoints
}) => {
  // Fire canvas-confetti sequence when opened with a milestone
  useEffect(() => {
    if (!isOpen || !milestone) return;

    // 1. Initial Double-Cannon Blast (Left & Right)
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 70,
      origin: { x: 0.05, y: 0.8 },
      colors: ['#FFD700', '#F59E0B', '#10B981', '#FFFFFF', '#DC2626', '#EAB308']
    });

    confetti({
      particleCount: 80,
      angle: 120,
      spread: 70,
      origin: { x: 0.95, y: 0.8 },
      colors: ['#FFD700', '#F59E0B', '#10B981', '#FFFFFF', '#DC2626', '#EAB308']
    });

    // 2. Center Starburst
    const centerTimeout = setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { x: 0.5, y: 0.45 },
        colors: ['#FFD700', '#F59E0B', '#FBBF24', '#FFFFFF', '#10B981'],
        scalar: 1.2
      });
    }, 350);

    // 3. Continuous Shower of Gold & Emerald Confetti for 3.2 seconds
    const duration = 3200;
    const animationEnd = Date.now() + duration;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 20 * (timeLeft / duration);
      confetti({
        particleCount,
        startVelocity: 25,
        spread: 360,
        ticks: 60,
        origin: {
          x: Math.random() * 0.8 + 0.1,
          y: Math.random() * 0.3
        },
        colors: ['#FFD700', '#F59E0B', '#10B981', '#FFFFFF', '#DC2626', '#EAB308']
      });
    }, 250);

    return () => {
      clearTimeout(centerTimeout);
      clearInterval(interval);
    };
  }, [isOpen, milestone]);

  // Generate 16 Floating Trophies that ascend across the screen
  const floatingTrophies = useMemo<FloatingTrophyItem[]>(() => {
    const types: ('trophy' | 'crown' | 'medal' | 'star')[] = ['trophy', 'trophy', 'crown', 'trophy', 'medal', 'trophy', 'star'];
    const colors = [
      'text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.7)]',
      'text-amber-400 drop-shadow-[0_0_14px_rgba(245,158,11,0.7)]',
      'text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.6)]',
      'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]',
      'text-amber-300 drop-shadow-[0_0_12px_rgba(252,211,77,0.7)]'
    ];

    return Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      left: Math.round((i * 6.2 + (Math.sin(i) * 3) + 2) % 94),
      size: 26 + (i % 5) * 8, // 26px to 58px
      duration: 5.5 + (i % 4) * 1.2, // 5.5s to 9.1s
      delay: (i * 0.25) % 2.5,
      drift: (i % 2 === 0 ? 1 : -1) * (20 + (i % 3) * 15),
      rotation: (i % 2 === 0 ? 1 : -1) * (15 + (i % 4) * 10),
      type: types[i % types.length],
      color: colors[i % colors.length]
    }));
  }, []);

  if (!isOpen || !milestone) return null;

  return (
    <AnimatePresence>
      <div 
        id="loyalty-milestone-modal-root"
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none"
      >
        {/* Darkened backdrop with radial celebration glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Floating Trophies Layer (Ascending through viewport) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {floatingTrophies.map((item) => (
            <motion.div
              key={item.id}
              initial={{
                y: '115vh',
                x: 0,
                opacity: 0,
                scale: 0.6,
                rotate: -item.rotation
              }}
              animate={{
                y: '-25vh',
                x: [0, item.drift, -item.drift * 0.5, item.drift * 0.8],
                opacity: [0, 0.9, 0.95, 0.8, 0],
                scale: [0.6, 1.15, 1, 1.05, 0.9],
                rotate: [ -item.rotation, item.rotation, -item.rotation * 0.5, item.rotation ]
              }}
              transition={{
                duration: item.duration,
                delay: item.delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                position: 'absolute',
                left: `${item.left}%`,
                bottom: 0
              }}
              className={`flex flex-col items-center justify-center ${item.color}`}
            >
              {item.type === 'trophy' ? (
                <Trophy size={item.size} strokeWidth={2.2} />
              ) : item.type === 'crown' ? (
                <Crown size={item.size} strokeWidth={2.2} />
              ) : item.type === 'medal' ? (
                <Award size={item.size} strokeWidth={2.2} />
              ) : (
                <Star size={item.size} strokeWidth={2.2} />
              )}
              
              {/* Mini glowing sparkles & points indicator on larger trophies */}
              {item.size >= 40 && (
                <motion.span
                  animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="mt-1 px-1.5 py-0.5 bg-yellow-400 text-black font-mono font-black text-[9px] rounded-full shadow-lg"
                >
                  +{milestone.points} PTS
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Center Celebratory Achievement Card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 320, damping: 25 }}
          className="relative z-20 w-full max-w-lg bg-zinc-950 text-white border-2 border-yellow-500/80 shadow-[0_0_50px_rgba(234,179,8,0.35)] rounded-2xl overflow-hidden p-6 sm:p-8"
        >
          {/* Decorative Corner Ribbons / Tatame Accent */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-full transition-colors cursor-pointer"
            title="Fechar celebração"
          >
            <X size={18} />
          </button>

          {/* Golden Trophy Hero Center */}
          <div className="relative flex flex-col items-center text-center">
            {/* Pulsing Light Rays Aura */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="absolute -top-8 w-44 h-44 rounded-full bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(234,179,8,0.25)_360deg)] pointer-events-none"
            />

            {/* Main Trophy Icon with Float and Golden Halo */}
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, -3, 3, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut"
              }}
              className="relative my-2 p-5 rounded-2xl bg-gradient-to-b from-yellow-400/20 via-amber-500/10 to-transparent border border-yellow-400/40 shadow-[0_0_30px_rgba(250,204,21,0.4)]"
            >
              <Trophy size={64} className="text-yellow-400 fill-yellow-400/20 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]" />
              
              {/* Crown Floating Badge */}
              <motion.div
                animate={{ scale: [1, 1.25, 1], y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-3 -right-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black p-1.5 rounded-full shadow-lg"
              >
                <Crown size={18} className="fill-black" />
              </motion.div>
            </motion.div>

            {/* Achievement Eyebrow Header */}
            <div className="inline-flex items-center gap-2 px-3 py-1 mt-3 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-mono font-black uppercase tracking-widest">
              <Sparkles size={12} className="animate-spin" />
              <span>MARCO DE FIDELIDADE ALCANÇADO</span>
            </div>

            {/* Milestone Title & Points */}
            <h3 className="mt-3 text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-white drop-shadow-sm">
              {milestone.title}
            </h3>

            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="text-xs font-mono font-bold text-yellow-400 bg-yellow-950/60 border border-yellow-500/40 px-2.5 py-0.5 rounded">
                {milestone.badge}
              </span>
              <span className="text-xs font-mono font-bold text-zinc-400">
                • {milestone.beltTier}
              </span>
            </div>

            {/* Points Tag Banner */}
            <div className="mt-4 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center gap-3">
              <div className="p-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg">
                <Flame size={18} className="fill-yellow-400" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Pontos Atuais no Portal
                </span>
                <span className="text-lg font-black font-mono text-yellow-400">
                  {currentPoints || milestone.points} <span className="text-xs text-zinc-400 font-bold">PTS OSS.OS</span>
                </span>
              </div>
            </div>

            {/* Milestone Description */}
            <p className="mt-4 text-xs text-zinc-300 leading-relaxed max-w-sm">
              {milestone.description}
            </p>

            {/* Unlocked Benefit Box */}
            <div className="mt-4 w-full p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-left flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wide block">
                  Benefício / Vantagem Desbloqueada:
                </span>
                <p className="text-xs text-zinc-200 font-medium">
                  {milestone.perk}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 w-full flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-mono font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-yellow-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Eternizar Conquista (OSS!)</span>
              </button>

              {onNavigateToFidelidade && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToFidelidade();
                  }}
                  className="w-full sm:w-auto py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Gift size={14} className="text-yellow-400" />
                  <span>Ver Prêmios</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LoyaltyMilestoneCelebration;

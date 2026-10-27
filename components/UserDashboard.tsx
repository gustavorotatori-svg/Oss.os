import React, { useState, useEffect, useRef } from 'react';
import ImageOptimization from './ImageOptimization';
import confetti from 'canvas-confetti';
import { safeLocalStorage as localStorage, safeSessionStorage as sessionStorage } from '../src/lib/storage';
import { db, subscribeToUserProfile, subscribeToAcademies } from '../src/lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('UserDashboard Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

import { User, Heart, Star, ShoppingBag, Settings, LogOut, ChevronLeft, ChevronRight, Award, Bell, BellRing, Gift, QrCode, Ticket, CheckCircle2, Copy, Building2, BookOpen, Download, Plus, Search, Info, Flame, Zap, Compass, Shield, X, Trophy, Medal, Crown, Clock, Calendar, Sparkles, Play, Pause, RotateCcw, Maximize2, Minimize2, Volume2, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { OnboardingChecklist } from '../src/components/OnboardingChecklist';
import { DojoManagementPanel, StorePartnerPanel, AdminGlobalPanel } from '../src/components/RoleDashboardPanels';
import { UserReviewsManager } from './UserReviewsManager';
import { LoyaltyMilestoneCelebration, LOYALTY_MILESTONES, LoyaltyMilestone } from './LoyaltyMilestoneCelebration';
import { SettingsPushSubscription } from '../src/components/SettingsPushSubscription';
import { PriceAlertsCenter } from '../src/components/PriceAlertsCenter';
import { Review } from '../src/types';

export const InfoTooltip: React.FC<{ text: string; position?: 'top' | 'bottom' | 'left' | 'right' }> = ({ text, position = 'top' }) => {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-zinc-950 dark:border-t-white',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-zinc-950 dark:border-b-white',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-l-zinc-950 dark:border-l-white',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-r-zinc-950 dark:border-r-white'
  };

  return (
    <div className="group relative inline-flex items-center justify-center shrink-0 ml-1.5 cursor-help">
      <Info size={11} className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors" />
      <div className={`absolute ${positionClasses[position]} hidden group-hover:block w-48 p-2.5 bg-zinc-950 dark:bg-white text-white dark:text-black text-[9px] font-mono leading-relaxed normal-case tracking-wider text-center border border-zinc-850 dark:border-zinc-200 shadow-xl z-50 pointer-events-none`}>
        <div className={`absolute border-4 border-transparent ${arrowClasses[position]}`} />
        {text}
      </div>
    </div>
  );
};

export const BeltParticlesCanvas: React.FC<{ belt: string }> = ({ belt }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    // Pick colors based on belt
    let particleColors: string[] = [];
    if (belt === 'Faixa Branca') {
      particleColors = ['#ffffff', '#f4f4f5', '#e4e4e7', '#facc15'];
    } else if (belt === 'Faixa Azul') {
      particleColors = ['#3b82f6', '#2563eb', '#60a5fa', '#ffffff'];
    } else if (belt === 'Faixa Roxa') {
      particleColors = ['#c084fc', '#a855f7', '#7e22ce', '#ffffff'];
    } else if (belt === 'Faixa Marrom') {
      particleColors = ['#b45309', '#92400e', '#78350f', '#fbbf24'];
    } else { // Preta or others
      particleColors = ['#ef4444', '#cc0000', '#18181b', '#fbbf24', '#ffffff'];
    }

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      color: string;
      alpha: number;
      decay: number;
      angle: number;
      spin: number;
    }

    const particles: Particle[] = [];

    const createParticle = (isInitial = false): Particle => {
      const size = Math.random() * 6 + 2;
      return {
        x: Math.random() * width,
        y: isInitial ? Math.random() * height : height + 20,
        size,
        speedY: -(Math.random() * 2 + 1),
        speedX: Math.random() * 1.5 - 0.75,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        alpha: Math.random() * 0.8 + 0.2,
        decay: Math.random() * 0.005 + 0.002,
        angle: Math.random() * Math.PI * 2,
        spin: Math.random() * 0.04 - 0.02
      };
    };

    // Populate initial particles
    for (let i = 0; i < 85; i++) {
      particles.push(createParticle(true));
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw and update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;
        p.alpha -= p.decay;
        p.angle += p.spin;

        if (p.alpha <= 0 || p.y < -10) {
          particles[i] = createParticle();
        } else {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillStyle = p.color;

          if (i % 3 === 0) {
            // Star shape / Diamond
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.lineTo(p.size * 0.5, 0);
            ctx.lineTo(0, p.size);
            ctx.lineTo(-p.size * 0.5, 0);
            ctx.closePath();
            ctx.fill();
          } else if (i % 3 === 1) {
            // Square/Confetti piece
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          } else {
            // Glowing circle
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [belt]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10 w-full h-full" />;
};

interface UserDashboardProps {
  user: any;
  onSignOut: () => void;
  wishlistCount: number;
  reviewsCount: number;
  alertsCount: number;
  onNavigate: (view: string) => void;
  loyaltyEnabled?: boolean;
  loyaltyPointsRatio?: number;
  loyaltyWelcomeBonus?: number;
  loyaltyReviewBonus?: number;
  loyaltyMinRedeemPoints?: number;
  loyaltyDiscountValue?: number;
  initialFocusMode?: boolean;
  onFocusModeChange?: (active: boolean) => void;
  viewedProductIds?: string[];
  productList?: any[];
  wishlistProducts?: any[];
  wishlistAlerts?: Set<string>;
  onTogglePriceAlert?: (productId: string) => Promise<boolean> | void;
  onSelectProduct?: (product: any) => void;
  addToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  playClickSound?: () => void;
  onAddReview?: (productId: string, review: Omit<Review, 'id'>) => Promise<void> | void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ 
  user, 
  onSignOut, 
  wishlistCount, 
  reviewsCount,
  alertsCount,
  onNavigate,
  loyaltyEnabled = false,
  loyaltyPointsRatio = 10,
  loyaltyWelcomeBonus = 100,
  loyaltyReviewBonus = 50,
  loyaltyMinRedeemPoints = 200,
  loyaltyDiscountValue = 10,
  initialFocusMode,
  onFocusModeChange,
  viewedProductIds = [],
  productList = [],
  wishlistProducts = [],
  wishlistAlerts = new Set<string>(),
  onTogglePriceAlert,
  onSelectProduct,
  addToast = (msg: string, type?: 'success' | 'error' | 'info') => console.log(msg, type),
  playClickSound = () => {},
  onAddReview
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'alertas' | 'notificacoes' | 'fidelidade' | 'afiliado' | 'campeonatos' | 'privacidade' | 'dojo' | 'lojista' | 'admin' | 'avaliacoes'>('geral');
  const [simulatedRole, setSimulatedRole] = useState<'atleta' | 'gestor' | 'lojista' | 'admin'>(() => {
    return (user?.role as any) || 'atleta';
  });
  const effectiveRole = simulatedRole || user?.role || 'atleta';

  // Resolve user wishlist products for push notification alerts
  const resolvedWishlist = React.useMemo(() => {
    if (wishlistProducts && wishlistProducts.length > 0) return wishlistProducts;
    if (productList && productList.length > 0 && user?.wishlist) {
      return productList.filter((p: any) => user.wishlist.includes(p.id));
    }
    return [];
  }, [wishlistProducts, productList, user]);

  // Resolve viewed products from viewedProductIds
  const resolvedViewedProducts = React.useMemo(() => {
    if (!productList || productList.length === 0) return [];
    
    // map the ids to products
    const mapped = (viewedProductIds || [])
      .map(id => productList.find(p => p.id === id))
      .filter((p): p is any => p !== undefined);
      
    // If empty, let's pre-populate with 3 interesting default ones from productList as recommendations
    if (mapped.length === 0) {
      return productList.slice(0, 3).map((p, index) => ({
        ...p,
        simulatedTime: index === 0 ? 'Recomendação de entrada' : index === 1 ? 'Em alta hoje' : 'Tendência Estóica',
        interestScore: 85 - index * 12,
        status: 'SUGERIDO',
        isMock: true
      }));
    }
    
    // Otherwise, calculate simulated dates/interest curve
    return mapped.map((p, index) => {
      // Create a nice simulated timeframe
      let timeStr = 'Recentemente';
      if (index === 1) timeStr = 'Há algumas horas';
      else if (index === 2) timeStr = 'Ontem';
      else if (index > 2) timeStr = `Há ${index} dias`;
      
      // Calculate curiosity score (newer = higher, plus some randomized high quality factor)
      const baseScore = Math.max(30, 95 - index * 15);
      const trendFactor = p.trendScore ? Math.floor(p.trendScore * 10) : 0;
      const interestScore = Math.min(100, baseScore + (trendFactor % 10));
      
      // Calculate status of neglect: 
      let status: 'ATIVO' | 'MORNO' | 'RETOMAR' = 'ATIVO';
      if (index === 1) status = 'MORNO';
      else if (index >= 2) status = 'RETOMAR';
      
      return {
        ...p,
        simulatedTime: timeStr,
        interestScore,
        status,
        isMock: false
      };
    });
  }, [viewedProductIds, productList]);

  // Construct chart data for Recharts
  const chartData = React.useMemo(() => {
    const data = [...resolvedViewedProducts].reverse().map((item, index) => ({
      name: item.title.substring(0, 10) + '...',
      'Interesse (%)': item.interestScore,
      'Preço (R$)': item.price,
    }));
    
    // Fallback if still empty
    if (data.length === 0) {
      return [
        { name: 'Início', 'Interesse (%)': 50 },
        { name: 'Meio', 'Interesse (%)': 75 },
        { name: 'Agora', 'Interesse (%)': 90 },
      ];
    }
    return data;
  }, [resolvedViewedProducts]);

  interface PointTransaction {
    id: string;
    type: 'WELCOME' | 'PURCHASE' | 'REVIEW' | 'TRAINING' | 'CHECKIN' | 'REDEEM' | 'BONUS';
    description: string;
    points: number;
    date: string;
  }

  const [pointsHistory, setPointsHistory] = useState<PointTransaction[]>(() => {
    const saved = localStorage.getItem('oss_points_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    // Default initial transactions
    return [
      {
        id: 'tx-1',
        type: 'WELCOME',
        description: 'Bônus de Boas-vindas (Cadastro no Portal)',
        points: loyaltyWelcomeBonus,
        date: new Date(Date.now() - 48 * 3600 * 1000).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 'tx-2',
        type: 'REVIEW',
        description: 'Avaliação Detalhada: Kimono Venum Elite 2.0',
        points: loyaltyReviewBonus,
        date: new Date(Date.now() - 24 * 3600 * 1000).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 'tx-3',
        type: 'PURCHASE',
        description: 'Compra Indicada: Rashguard Venum Dark Flame',
        points: 120,
        date: new Date(Date.now() - 2 * 3600 * 1000).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  // Local points simulator matches total sum of transactions
  const [points, setPoints] = useState<number>(() => {
    const saved = localStorage.getItem('oss_simulated_points');
    if (saved) return parseInt(saved, 10);
    // Otherwise fallback to sum of current points history
    const savedHistory = localStorage.getItem('oss_points_history');
    if (savedHistory) {
      try {
        const hist = JSON.parse(savedHistory);
        return hist.reduce((acc: number, item: any) => acc + item.points, 0);
      } catch (e) {}
    }
    return loyaltyWelcomeBonus + loyaltyReviewBonus + 120;
  });

  // Track loyalty points milestones reached by the user
  const [reachedMilestones, setReachedMilestones] = useState<number[]>(() => {
    const saved = localStorage.getItem('oss_reached_loyalty_milestones');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Pre-seed any milestones already below the initial points
    const currentInitPoints = localStorage.getItem('oss_simulated_points')
      ? parseInt(localStorage.getItem('oss_simulated_points')!, 10)
      : (loyaltyWelcomeBonus + loyaltyReviewBonus + 120);
    return LOYALTY_MILESTONES.filter(m => m.points <= currentInitPoints).map(m => m.points);
  });

  const [activeMilestoneCelebration, setActiveMilestoneCelebration] = useState<LoyaltyMilestone | null>(null);
  const [isMilestoneCelebrationOpen, setIsMilestoneCelebrationOpen] = useState<boolean>(false);
  const prevPointsRef = useRef<number>(points);

  // Monitor points and trigger canvas-confetti + floating trophies whenever a new milestone is reached!
  useEffect(() => {
    const prev = prevPointsRef.current;
    prevPointsRef.current = points;

    if (points > prev) {
      // Find all milestones newly crossed
      const newlyCrossed = LOYALTY_MILESTONES.filter(
        m => points >= m.points && (!reachedMilestones.includes(m.points) || prev < m.points)
      );

      if (newlyCrossed.length > 0) {
        // Trigger the celebration for the highest newly reached milestone
        const highestNew = newlyCrossed[newlyCrossed.length - 1];
        setActiveMilestoneCelebration(highestNew);
        setIsMilestoneCelebrationOpen(true);

        const updated = Array.from(new Set([...reachedMilestones, ...newlyCrossed.map(m => m.points)]));
        setReachedMilestones(updated);
        localStorage.setItem('oss_reached_loyalty_milestones', JSON.stringify(updated));
      }
    }
  }, [points, reachedMilestones]);

  const handleTriggerMilestoneCelebration = (m: LoyaltyMilestone) => {
    setActiveMilestoneCelebration(m);
    setIsMilestoneCelebrationOpen(true);
    playClickSound();
  };

  const [redeemedCoupons, setRedeemedCoupons] = useState<string[]>(() => {
    const saved = localStorage.getItem('oss_redeemed_coupons');
    return saved ? JSON.parse(saved) : [];
  });

  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('oss_checkin_streak');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [lastDailyCheckInDate, setLastDailyCheckInDate] = useState<string>(() => {
    return localStorage.getItem('oss_last_daily_checkin_date') || '';
  });

  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'CHECKIN' | 'PURCHASE' | 'REDEEM' | 'REVIEW' | 'BONUS'>('ALL');
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');

  const [unlockedCongratsBadge, setUnlockedCongratsBadge] = useState<any | null>(null);

  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getYesterdayDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isCheckedInToday = lastDailyCheckInDate === getTodayDateString();

  const handleDailyCheckIn = () => {
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    if (lastDailyCheckInDate === today) {
      alert("⚡ Check-in de hoje já foi realizado! Volte amanhã para manter seu streak ativo e acumular mais +50 OSS Points.");
      return;
    }

    let nextStreak = 1;
    if (lastDailyCheckInDate === yesterday) {
      nextStreak = streak + 1;
    } else {
      nextStreak = (streak > 0 && lastDailyCheckInDate === '') ? streak + 1 : 1;
    }

    setStreak(nextStreak);
    setLastDailyCheckInDate(today);
    localStorage.setItem('oss_checkin_streak', String(nextStreak));
    localStorage.setItem('oss_last_daily_checkin_date', today);

    // Add +50 points transaction
    addSimulatedPoints(
      'CHECKIN',
      `🔥 Check-in Diário do Atleta: Acesso Validado (+50 PTS) • Streak: ${nextStreak} dia${nextStreak > 1 ? 's' : ''}`,
      50
    );

    // Trigger celebration
    triggerStreakCelebration();

    const newlyUnlockedBadge = ALL_BADGES.find(b => b.streakRequired === nextStreak);
    if (newlyUnlockedBadge) {
      setUnlockedCongratsBadge(newlyUnlockedBadge);
      setTimeout(() => {
        triggerBeltCelebration('Faixa Preta');
      }, 350);
    }
  };

  const filteredPointsHistory = React.useMemo(() => {
    return pointsHistory.filter((tx) => {
      // Filter by type
      if (historyFilter === 'CHECKIN') {
        const isCheckIn = tx.type === 'CHECKIN' || tx.description.toLowerCase().includes('check-in') || tx.description.toLowerCase().includes('diário');
        if (!isCheckIn) return false;
      } else if (historyFilter === 'PURCHASE') {
        if (tx.type !== 'PURCHASE') return false;
      } else if (historyFilter === 'REDEEM') {
        if (tx.type !== 'REDEEM') return false;
      } else if (historyFilter === 'REVIEW') {
        if (tx.type !== 'REVIEW') return false;
      } else if (historyFilter === 'BONUS') {
        if (tx.type !== 'BONUS' && tx.type !== 'WELCOME' && tx.type !== 'TRAINING') return false;
      }

      // Search Query
      if (historySearchQuery.trim()) {
        const q = historySearchQuery.toLowerCase().trim();
        const matchDesc = tx.description.toLowerCase().includes(q);
        const matchDate = tx.date.toLowerCase().includes(q);
        const matchPts = String(tx.points).includes(q);
        return matchDesc || matchDate || matchPts;
      }

      return true;
    });
  }, [pointsHistory, historyFilter, historySearchQuery]);

  const historyCounts = React.useMemo(() => {
    let all = pointsHistory.length;
    let checkin = 0;
    let purchase = 0;
    let redeem = 0;
    let review = 0;
    let bonus = 0;

    let totalEarned = 0;
    let checkinPts = 0;
    let purchasePts = 0;
    let redeemedPts = 0;

    pointsHistory.forEach((tx) => {
      const isCheckIn = tx.type === 'CHECKIN' || tx.description.toLowerCase().includes('check-in') || tx.description.toLowerCase().includes('diário');
      
      if (isCheckIn) {
        checkin++;
        if (tx.points > 0) checkinPts += tx.points;
      } else if (tx.type === 'PURCHASE') {
        purchase++;
        if (tx.points > 0) purchasePts += tx.points;
      } else if (tx.type === 'REDEEM') {
        redeem++;
        if (tx.points < 0) redeemedPts += Math.abs(tx.points);
      } else if (tx.type === 'REVIEW') {
        review++;
      } else {
        bonus++;
      }

      if (tx.points > 0) {
        totalEarned += tx.points;
      }
    });

    return { all, checkin, purchase, redeem, review, bonus, totalEarned, checkinPts, purchasePts, redeemedPts };
  }, [pointsHistory]);

  React.useEffect(() => {
    window.dispatchEvent(new Event('storage'));
  }, [points, pointsHistory]);

  // --- LGPD COMPLIANCE STATES & FUNCTIONS (Lei 13.709/2018) ---
  const [userLgpdConsents, setUserLgpdConsents] = useState(() => {
    try {
      const saved = localStorage.getItem('oss_lgpd_consents');
      return saved ? JSON.parse(saved) : { approvedCadastral: true, approvedWishlistAlerts: true, approvedSessionCookies: true, approvedNavigation: true };
    } catch {
      return { approvedCadastral: true, approvedWishlistAlerts: true, approvedSessionCookies: true, approvedNavigation: true };
    }
  });
  const [lgpdSaving, setLgpdSaving] = useState(false);
  const [lgpdMessage, setLgpdMessage] = useState<string | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleSaveConsentToFirestore = async (consents: { approvedCadastral: boolean, approvedWishlistAlerts: boolean, approvedSessionCookies: boolean, approvedNavigation: boolean }) => {
    setLgpdSaving(true);
    setLgpdMessage(null);
    try {
      const timestamp = new Date().toISOString();
      if (user?.uid) {
        const profileUpdate = {
          lgpdConsent: {
            approvedCadastral: consents.approvedCadastral,
            approvedWishlistAlerts: consents.approvedWishlistAlerts,
            approvedSessionCookies: consents.approvedSessionCookies,
            approvedNavigation: consents.approvedNavigation,
            consentDate: timestamp,
            userAgent: navigator.userAgent,
            ipMock: "186.221.73." + Math.floor(Math.random() * 255)
          },
          updatedAt: timestamp
        };
        await setDoc(doc(db, "users", user.uid), profileUpdate, { merge: true });
        localStorage.setItem('oss_lgpd_consents', JSON.stringify({ ...consents, consentDate: timestamp, userAgent: navigator.userAgent }));
        setUserLgpdConsents(consents);
        setLgpdMessage("Configurações de consentimento LGPD salvas e sincronizadas com sucesso! 🛡️");
      } else {
        localStorage.setItem('oss_lgpd_consents', JSON.stringify({ ...consents, consentDate: timestamp, userAgent: navigator.userAgent }));
        setUserLgpdConsents(consents);
        setLgpdMessage("Consentimentos LGPD salvos localmente!");
      }
    } catch (err) {
      console.error("Error saving consent: ", err);
      setLgpdMessage("Erro ao salvar consentimento no banco de dados. Tente novamente.");
    } finally {
      setLgpdSaving(false);
      setTimeout(() => setLgpdMessage(null), 6000);
    }
  };

  const handleExportDataForLGPD = () => {
    try {
      const schemaDump = {
        title: "Exportação de Portabilidade de Dados - Artigo 18, V - LGPD",
        producedAt: new Date().toISOString(),
        site: "OSS.OS - Portal Stoico de BJJ & Curadoria",
        userProfile: {
          uid: user?.uid || "local-athlete",
          displayName: user?.displayName || "Atleta Anônimo",
          email: user?.email || "Nenhum email vinculado",
          simulatedPointsBalance: points,
          streakDays: streak
        },
        privacyLogs: {
          consents: userLgpdConsents,
          cookieAcceptedStatus: localStorage.getItem('oss_lgpd_consents') ? "COMPLIANT_ACCEPTED" : "PENDING"
        },
        wishlistItemsCount: wishlistCount,
        reviewsWrittenCount: reviewsCount,
        recentPointsHistory: pointsHistory,
        trainingLogs: trainingLogs
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(schemaDump, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `oss_os_lgpd_meus_dados_${user?.uid || 'atleta'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert("Erro ao exportar dados: " + String(err));
    }
  };

  const handlePurgeAccountDataForLGPD = async () => {
    if (deleteConfirmationText !== 'EXCLUIR') {
      alert("Para confirmar, digite a palavra EXCLUIR exatamente no campo de texto.");
      return;
    }

    setIsDeletingAccount(true);
    try {
      if (user?.uid) {
        await setDoc(doc(db, "users", user.uid), {
          displayName: "[EXCLUÍDO - DIREITO LEGÍTIMO LGPD]",
          points: 0,
          email: "deleted@oss.os",
          beltColor: "Deletado",
          lgpdConsent: {
            approvedCadastral: false,
            approvedWishlistAlerts: false,
            approvedSessionCookies: false,
            approvedNavigation: false,
            consentDate: new Date().toISOString(),
            userAgent: "PURGED"
          }
        });
      }

      localStorage.removeItem('oss_lgpd_consents');
      localStorage.removeItem('oss_simulated_points');
      localStorage.removeItem('oss_points_history');
      localStorage.removeItem('oss_redeemed_coupons');
      localStorage.removeItem('oss_checkin_streak');
      localStorage.removeItem('oss_training_logs');
      localStorage.removeItem('oss_visited_products');
      
      alert("Sua conta e todo seu histórico de dados foram excluídos de forma definitiva do Portal OSS.OS, cumprindo a risca o Direito de ser Esquecido previsto no Art. 18, VI da LGPD (Lei 13.709/18).");
      onSignOut();
    } catch (err) {
      console.error("Purge error: ", err);
      alert("Houve um erro técnico ao limpar os dados do servidor. Entre em contato ou tente novamente.");
    } finally {
      setIsDeletingAccount(false);
      setDeleteConfirmationText('');
    }
  };

  // Treinos locais salvos no localStorage para persistência e atualizações em tempo real
  interface TrainingLog {
    id: string;
    date: string; // formato YYYY-MM-DD
    duration: number; // minutos
    type: 'GI' | 'NOGI' | 'DRILL' | 'SPARRING';
  }

  const [trainingLogs, setTrainingLogs] = useState<TrainingLog[]>(() => {
    const saved = localStorage.getItem('oss_training_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    
    // Default initial historical logs (generates training times for 2025 vs 2026 accurately)
    const initialLogs: TrainingLog[] = [];
    
    const addPresetLogs = (year: number, month: number, count: number, avgMinutes: number) => {
      for (let i = 1; i <= count; i++) {
        const day = Math.min(28, i * 2); 
        const dayString = day < 10 ? `0${day}` : `${day}`;
        const monthString = month < 10 ? `0${month}` : `${month}`;
        const types: Array<'GI' | 'NOGI' | 'DRILL' | 'SPARRING'> = ['GI', 'NOGI', 'DRILL', 'SPARRING'];
        initialLogs.push({
          id: `log-preset-${year}-${month}-${i}`,
          date: `${year}-${monthString}-${dayString}`,
          duration: avgMinutes,
          type: types[(i + month) % 4]
        });
      }
    };

    // 2025 Training Hours (Jan: 24h, Feb: 20h, Mar: 32h, Apr: 30h, May: 28h)
    addPresetLogs(2025, 1, 16, 90);  // 16 * 90 = 1440 mins = 24h
    addPresetLogs(2025, 2, 10, 120); // 10 * 120 = 1200 mins = 20h
    addPresetLogs(2025, 3, 16, 120); // 16 * 120 = 1920 mins = 32h
    addPresetLogs(2025, 4, 15, 120); // 15 * 120 = 1800 mins = 30h
    addPresetLogs(2025, 5, 14, 120); // 14 * 120 = 1680 mins = 28h

    // 2026 Training Hours (Jan: 30h, Feb: 28h, Mar: 42h, Apr: 44h, May: 32h)
    addPresetLogs(2026, 1, 15, 120); // 15 * 120 = 1800 mins = 30h
    addPresetLogs(2026, 2, 14, 120); // 14 * 120 = 1680 mins = 28h
    addPresetLogs(2026, 3, 21, 120); // 21 * 120 = 2520 mins = 42h
    addPresetLogs(2026, 4, 22, 120); // 22 * 120 = 2640 mins = 44h
    addPresetLogs(2026, 5, 16, 120); // 16 * 120 = 1920 mins = 32h

    return initialLogs;
  });

  const [showAddTraining, setShowAddTraining] = useState(false);
  const [trainingDuration, setTrainingDuration] = useState('90');
  const [trainingType, setTrainingType] = useState<'GI' | 'NOGI' | 'DRILL' | 'SPARRING'>('GI');
  const [trainingMonth, setTrainingMonth] = useState('5');
  const [trainingYear, setTrainingYear] = useState('2026');

  // Calculates the monthly totals for years 2025 and 2026 from the trainingLogs
  const monthlyTrainingData = React.useMemo(() => {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio'];
    
    return monthNames.map((name, index) => {
      const monthNum = index + 1;
      
      // Calculate 2025 hours
      const minutes2025 = trainingLogs
        .filter(log => {
          const parts = log.date.split('-');
          if (parts.length < 3) return false;
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          return y === 2025 && m === monthNum;
        })
        .reduce((sum, log) => sum + log.duration, 0);
      
      const hours2025 = parseFloat((minutes2025 / 60).toFixed(1));

      // Calculate 2026 hours
      const minutes2026 = trainingLogs
        .filter(log => {
          const parts = log.date.split('-');
          if (parts.length < 3) return false;
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          return y === 2026 && m === monthNum;
        })
        .reduce((sum, log) => sum + log.duration, 0);
      
      const hours2026 = parseFloat((minutes2026 / 60).toFixed(1));

      return {
        name,
        'Ano Anterior (2025)': hours2025,
        'Ano Atual (2026)': hours2026,
      };
    });
  }, [trainingLogs]);

  // Calcula a frequência de treinos por dia da semana (Segunda a Domingo) no ano de 2026
  const weekdayFrequencyData = React.useMemo(() => {
    const daysData = [
      { name: 'Segunda', GI: 0, NOGI: 0, DRILL: 0, SPARRING: 0, TOTAL: 0 },
      { name: 'Terça', GI: 0, NOGI: 0, DRILL: 0, SPARRING: 0, TOTAL: 0 },
      { name: 'Quarta', GI: 0, NOGI: 0, DRILL: 0, SPARRING: 0, TOTAL: 0 },
      { name: 'Quinta', GI: 0, NOGI: 0, DRILL: 0, SPARRING: 0, TOTAL: 0 },
      { name: 'Sexta', GI: 0, NOGI: 0, DRILL: 0, SPARRING: 0, TOTAL: 0 },
      { name: 'Sábado', GI: 0, NOGI: 0, DRILL: 0, SPARRING: 0, TOTAL: 0 },
      { name: 'Domingo', GI: 0, NOGI: 0, DRILL: 0, SPARRING: 0, TOTAL: 0 },
    ];

    trainingLogs.forEach(log => {
      if (log.date.startsWith('2026')) {
        const parts = log.date.split('-');
        if (parts.length < 3) return;
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        const dayOfWeek = d.getDay(); // 0 = Domingo, 1 = Segunda, etc.
        
        let index = dayOfWeek - 1;
        if (dayOfWeek === 0) index = 6; 

        if (index >= 0 && index <= 6) {
          daysData[index].TOTAL += 1;
          if (log.type === 'GI') daysData[index].GI += 1;
          else if (log.type === 'NOGI') daysData[index].NOGI += 1;
          else if (log.type === 'DRILL') daysData[index].DRILL += 1;
          else if (log.type === 'SPARRING') daysData[index].SPARRING += 1;
        }
      }
    });

    return daysData;
  }, [trainingLogs]);

  // Calcula a tendência retroativa das últimas 8 semanas no sistema
  const weeklyTrendData = React.useMemo(() => {
    const weeks = [];
    // Data atual como referência (2026-05-26)
    const refDate = new Date(2026, 4, 26); 

    for (let i = 7; i >= 0; i--) {
      const endOfWeek = new Date(refDate);
      endOfWeek.setDate(refDate.getDate() - (i * 7));
      
      const startOfWeek = new Date(endOfWeek);
      startOfWeek.setDate(endOfWeek.getDate() - 6);

      const startDay = startOfWeek.getDate().toString().padStart(2, '0');
      const startMonth = (startOfWeek.getMonth() + 1).toString().padStart(2, '0');
      const endDay = endOfWeek.getDate().toString().padStart(2, '0');
      const endMonth = (endOfWeek.getMonth() + 1).toString().padStart(2, '0');
      
      const label = `${startDay}/${startMonth}-${endDay}/${endMonth}`;

      const sessionsCount = trainingLogs.filter(log => {
        const parts = log.date.split('-');
        if (parts.length < 3) return false;
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const logDate = new Date(year, month, day);
        return logDate >= startOfWeek && logDate <= endOfWeek;
      }).length;

      weeks.push({
        name: label,
        'Treinos': sessionsCount
      });
    }

    return weeks;
  }, [trainingLogs]);

  const handleAddTrainingLog = (e: React.FormEvent) => {
    e.preventDefault();
    const durationMin = parseInt(trainingDuration, 10);
    if (!durationMin || durationMin <= 0) {
      alert("Por favor, informe uma duração válida em minutos!");
      return;
    }

    const monthNum = parseInt(trainingMonth, 10);
    const yearNum = parseInt(trainingYear, 10);
    
    // Day can be random or current day
    const randomDay = Math.floor(1 + Math.random() * 28);
    const dayStr = randomDay < 10 ? `0${randomDay}` : `${randomDay}`;
    const monthStr = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
    
    const newLog: TrainingLog = {
      id: `log-${Date.now()}`,
      date: `${yearNum}-${monthStr}-${dayStr}`,
      duration: durationMin,
      type: trainingType
    };

    const nextLogs = [newLog, ...trainingLogs];
    setTrainingLogs(nextLogs);
    localStorage.setItem('oss_training_logs', JSON.stringify(nextLogs));
    
    // Add point reward to connect with loyalty points system!
    addSimulatedPoints('TRAINING', `🥋 Sessão: ${trainingType} (${durationMin} min no Tatame)`, 50);
    
    setShowAddTraining(false);
    
    // Increment check-in streak to reward training log!
    incrementCheckInStreak(streak);
  };

  const handleResetTrainingLogs = () => {
    if (confirm("Tem certeza que deseja redefinir todo o histórico de treinos para os valores padrão de comparação?")) {
      localStorage.removeItem('oss_training_logs');
      const initialLogs: TrainingLog[] = [];
      const addPresetLogs = (year: number, month: number, count: number, avgMinutes: number) => {
        for (let i = 1; i <= count; i++) {
          const day = Math.min(28, i * 2); 
          const dayString = day < 10 ? `0${day}` : `${day}`;
          const monthString = month < 10 ? `0${month}` : `${month}`;
          const types: Array<'GI' | 'NOGI' | 'DRILL' | 'SPARRING'> = ['GI', 'NOGI', 'DRILL', 'SPARRING'];
          initialLogs.push({
            id: `log-preset-${year}-${month}-${i}`,
            date: `${year}-${monthString}-${dayString}`,
            duration: avgMinutes,
            type: types[(i + month) % 4]
          });
        }
      };

      // 2025: Jan (24h), Feb (20h), Mar (32h), Apr (30h), May (28h)
      addPresetLogs(2025, 1, 16, 90);
      addPresetLogs(2025, 2, 10, 120);
      addPresetLogs(2025, 3, 16, 120);
      addPresetLogs(2025, 4, 15, 120);
      addPresetLogs(2025, 5, 14, 120);

      // 2026: Jan (30h), Feb (28h), Mar (42h), Apr (44h), May (32h)
      addPresetLogs(2026, 1, 15, 120);
      addPresetLogs(2026, 2, 14, 120);
      addPresetLogs(2026, 3, 21, 120);
      addPresetLogs(2026, 4, 22, 120);
      addPresetLogs(2026, 5, 16, 120);

      setTrainingLogs(initialLogs);
    }
  };

  const ALL_BADGES = [
    {
      id: 'first_step',
      title: 'Primeiro Passo',
      requirement: '1 check-in',
      description: 'Iniciou a jornada oficial no tatame com seu primeiro check-in em dojo cadastrado.',
      streakRequired: 1,
      color: 'from-blue-500 to-indigo-600 shadow-indigo-500/25',
      icon: 'Compass'
    },
    {
      id: 'constant_warrior',
      title: 'Guerreiro Constante',
      requirement: 'Sequência de 5 treinos',
      description: 'Demonstrou disciplina no dojo com uma sequência ininterrupta de 5 check-ins presenciais.',
      streakRequired: 5,
      color: 'from-amber-500 to-orange-600 shadow-orange-500/25',
      icon: 'Zap'
    },
    {
      id: 'samurai_habit',
      title: 'Hábito de Samurai',
      requirement: 'Sequência de 10 treinos',
      description: 'Inabalável! Selou 10 check-ins seguidos, fundindo a persistência do samurai ao seu jiu-jitsu.',
      streakRequired: 10,
      color: 'from-red-600 to-rose-700 shadow-red-600/30 ring-2 ring-red-500/40 animate-pulse',
      icon: 'Flame'
    }
  ];

  const getBadgeIcon = (iconName: string, className = "w-5 h-5 text-white") => {
    switch (iconName) {
      case 'Compass': return <Compass className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Flame': return <Flame className={className} />;
      default: return <Shield className={className} />;
    }
  };

  interface Academy {
    id: string;
    name: string;
    professor: string;
    location: string;
    verified: boolean;
  }

  interface DigitalReward {
    id: string;
    title: string;
    type: 'SORTEIO' | 'EBOOK' | 'GUIDE';
    pointsCost: number;
    description: string;
  }

  const [academies, setAcademies] = useState<Academy[]>(() => {
    const saved = localStorage.getItem('oss_academies');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 'aca-1', name: 'Alliance São Paulo', professor: 'Fabio Gurgel', location: 'São Paulo - SP', verified: true },
      { id: 'aca-2', name: 'Gracie Barra Botafogo', professor: 'Carlos Gracie Jr', location: 'Rio de Janeiro - RJ', verified: true },
      { id: 'aca-3', name: 'Checkmat Flagship', professor: 'Leo Vieira', location: 'São Paulo - SP', verified: true },
      { id: 'aca-4', name: 'Cicero Costha PSLPB', professor: 'Cicero Costha', location: 'Ipiranga - SP', verified: true }
    ];
  });

  React.useEffect(() => {
    let active = true;
    const fetchAcademies = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'academies')).catch(err => {
          handleFirestoreError(err, OperationType.LIST, 'academies');
          throw err;
        });
        if (!active) return;
        if (!querySnapshot.empty) {
          const list: Academy[] = [];
          querySnapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as Academy);
          });
          setAcademies(list);
          localStorage.setItem('oss_academies', JSON.stringify(list));
        } else {
          // Empty in Firestore, seed defaults
          const defaults = [
            { name: 'Alliance São Paulo', professor: 'Fabio Gurgel', location: 'São Paulo - SP', verified: true },
            { name: 'Gracie Barra Botafogo', professor: 'Carlos Gracie Jr', location: 'Rio de Janeiro - RJ', verified: true },
            { name: 'Checkmat Flagship', professor: 'Leo Vieira', location: 'São Paulo - SP', verified: true },
            { name: 'Cicero Costha PSLPB', professor: 'Cicero Costha', location: 'Ipiranga - SP', verified: true }
          ];
          const list: Academy[] = [];
          for (let i = 0; i < defaults.length; i++) {
            const docId = `aca-${i + 1}`;
            await setDoc(doc(db, 'academies', docId), defaults[i]).catch(err => {
              handleFirestoreError(err, OperationType.CREATE, `academies/${docId}`);
            });
            list.push({ id: docId, ...defaults[i] });
          }
          if (active) {
            setAcademies(list);
            localStorage.setItem('oss_academies', JSON.stringify(list));
          }
        }
      } catch (err) {
        if (active) {
          console.warn("Could not synchronize academies from Firestore, using cached list:", err);
        }
      }
    };
    fetchAcademies();
    return () => {
      active = false;
    };
  }, []);

  const [selectedAcademyId, setSelectedAcademyId] = useState<string>('');
  const [showRegisterAcademy, setShowRegisterAcademy] = useState(false);
  const [newAcademyName, setNewAcademyName] = useState('');
  const [newAcademyProfessor, setNewAcademyProfessor] = useState('');
  const [newAcademyLocation, setNewAcademyLocation] = useState('');

  const [unlockedRewards, setUnlockedRewards] = useState<any[]>(() => {
    const saved = localStorage.getItem('oss_unlocked_rewards');
    return saved ? JSON.parse(saved) : [];
  });

  interface Tournament {
    id: string;
    title: string;
    date: string;
    location: string;
    status: 'ABERTO' | 'FECHADO' | 'ULTIMAS_VAGAS';
    registered: boolean;
    belt?: string;
    weightClass?: string;
    startDateISO: string;
  }

  interface MedalRecord {
    id: string;
    tournament: string;
    year: string;
    belt: string;
    division: string;
    medalType: 'GOLD' | 'SILVER' | 'BRONZE';
    imageUrl?: string;
    customIcon?: 'trophy' | 'medal' | 'award' | 'crown' | 'shield' | 'flame' | 'star' | 'zap' | '';
  }

  const DEFAULT_TOURNAMENTS: Tournament[] = [
    {
      id: 'tour-1',
      title: 'IBJJF Salvador Fall International Open 2026',
      date: '15 e 16 de Junho de 2026',
      location: 'Ginásio de Esportes de Salvador, Salvador - BA',
      status: 'ABERTO',
      registered: false,
      startDateISO: '2026-06-15T09:00:00'
    },
    {
      id: 'tour-2',
      title: 'Campeonato Brasileiro de Jiu-Jitsu IBJJF 2026',
      date: '24 de Julho a 02 de Agosto de 2026',
      location: 'Ginásio José Corrêa, Barueri - SP',
      status: 'ULTIMAS_VAGAS',
      registered: false,
      startDateISO: '2026-07-24T09:00:00'
    },
    {
      id: 'tour-test',
      title: 'Simulado de Competição OSS.OS 2026 (Para Teste)',
      date: 'Combate Iminente (Demonstração Alerta 48h)',
      location: 'Matriz Geral OSS.OS, Arena Virtual',
      status: 'ULTIMAS_VAGAS',
      registered: false,
      startDateISO: new Date(Date.now() + 28 * 60 * 60 * 1000).toISOString().split('.')[0]
    },
    {
      id: 'tour-3',
      title: 'IBJJF Rio Summer International Open 2026',
      date: '18 a 20 de Setembro de 2026',
      location: 'Vila Olímpica do Campo Grande, Rio de Janeiro - RJ',
      status: 'ABERTO',
      registered: false,
      startDateISO: '2026-09-18T09:00:00'
    },
    {
      id: 'tour-4',
      title: 'World Jiu-Jitsu IBJJF Championship 2026',
      date: '03 a 07 de Dezembro de 2026',
      location: 'Walter Pyramid, Long Beach - CA (EUA)',
      status: 'ABERTO',
      registered: false,
      startDateISO: '2026-12-03T09:00:00'
    }
  ];

  const DEFAULT_MEDALS: MedalRecord[] = [
    {
      id: 'med-1',
      tournament: 'IBJJF São Paulo Winter Open 2025',
      year: '2025',
      belt: 'Faixa Marrom',
      division: 'Peso Meio-Pesado (Até 88.3kg)',
      medalType: 'GOLD',
      customIcon: 'crown'
    },
    {
      id: 'med-2',
      tournament: 'Campeonato Mundial IBJJF 2024',
      year: '2024',
      belt: 'Faixa Roxa',
      division: 'Categoria Absoluto (Sem Limite)',
      medalType: 'SILVER',
      customIcon: 'shield'
    },
    {
      id: 'med-3',
      tournament: 'IBJJF Curitiba International Open 2023',
      year: '2023',
      belt: 'Faixa Azul',
      division: 'Peso Leve (Até 76.0kg)',
      medalType: 'BRONZE',
      customIcon: 'star'
    }
  ];

  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    const saved = localStorage.getItem('oss_tournaments_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((t: any) => {
          if (t.id === 'tour-test') {
            return {
              ...t,
              startDateISO: t.startDateISO || new Date(Date.now() + 28 * 60 * 60 * 1000).toISOString().split('.')[0]
            };
          }
          if (!t.startDateISO) {
            if (t.id === 'tour-1') t.startDateISO = '2026-06-15T09:00:00';
            else if (t.id === 'tour-2') t.startDateISO = '2026-07-24T09:00:00';
            else if (t.id === 'tour-3') t.startDateISO = '2026-09-18T09:00:00';
            else if (t.id === 'tour-4') t.startDateISO = '2026-12-03T09:00:00';
            else t.startDateISO = '2026-08-01T09:00:00';
          }
          return t;
        });
      } catch (e) {}
    }
    return DEFAULT_TOURNAMENTS;
  });

  const [medals, setMedals] = useState<MedalRecord[]>(() => {
    const saved = localStorage.getItem('oss_medals_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_MEDALS;
  });

  const [registeringTourId, setRegisteringTourId] = useState<string | null>(null);
  const [selectedRegBelt, setSelectedRegBelt] = useState<string>('Faixa Preta');
  const [selectedRegWeight, setSelectedRegWeight] = useState<string>('Peso Médio');

  const [showAddMedal, setShowAddMedal] = useState(false);
  const [newMedalTournament, setNewMedalTournament] = useState('');
  const [newMedalYear, setNewMedalYear] = useState('2026');
  const [newMedalBelt, setNewMedalBelt] = useState('Faixa Preta');
  const [newMedalDivision, setNewMedalDivision] = useState('');
  const [newMedalType, setNewMedalType] = useState<'GOLD' | 'SILVER' | 'BRONZE'>('GOLD');
  const [newMedalImageUrl, setNewMedalImageUrl] = useState('');
  const [newMedalCustomIcon, setNewMedalCustomIcon] = useState<'trophy' | 'medal' | 'award' | 'crown' | 'shield' | 'flame' | 'star' | 'zap' | ''>('');

  // Athlete Focus Mode state variables
  const [focusMode, setFocusMode] = useState(initialFocusMode || false);

  React.useEffect(() => {
    if (initialFocusMode !== undefined) {
      setFocusMode(initialFocusMode);
    }
  }, [initialFocusMode]);

  React.useEffect(() => {
    if (onFocusModeChange) {
      onFocusModeChange(focusMode);
    }
  }, [focusMode, onFocusModeChange]);
  const [bracketProgress, setBracketProgress] = useState(1); // 1 = Quartas, 2 = Semifinais, 3 = Final, 4 = Campeão!
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, finished: false });

  // New Training Focus Mode state variables
  const [trainingFocusMode, setTrainingFocusMode] = useState(false);
  const [currentFocusBelt, setCurrentFocusBelt] = useState<string>(() => {
    return localStorage.getItem('oss_current_focus_belt') || 'Faixa Roxa';
  });
  const [beltPromotionCongrats, setBeltPromotionCongrats] = useState<{ oldBelt: string; newBelt: string } | null>(null);

  const BELT_ORDER = ['Faixa Branca', 'Faixa Azul', 'Faixa Roxa', 'Faixa Marrom', 'Faixa Preta'];

  const triggerStreakCelebration = () => {
    // Left side burst
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 60,
      origin: { x: 0.1, y: 0.8 },
      colors: ['#22c55e', '#ffffff', '#cc0000', '#000000']
    });
    // Right side burst
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 60,
      origin: { x: 0.9, y: 0.8 },
      colors: ['#22c55e', '#ffffff', '#cc0000', '#000000']
    });
  };

  const triggerBeltCelebration = (beltName: string) => {
    let beltColors: string[] = [];
    switch (beltName) {
      case 'Faixa Branca':
        beltColors = ['#ffffff', '#000000', '#22c55e'];
        break;
      case 'Faixa Azul':
        beltColors = ['#3b82f6', '#1d4ed8', '#ffffff', '#000000'];
        break;
      case 'Faixa Roxa':
        beltColors = ['#a855f7', '#7e22ce', '#ffffff', '#000000'];
        break;
      case 'Faixa Marrom':
        beltColors = ['#92400e', '#78350f', '#ffffff', '#000000'];
        break;
      case 'Faixa Preta':
        beltColors = ['#000000', '#cc0000', '#ffffff', '#d97706'];
        break;
      default:
        beltColors = ['#22c55e', '#ffffff', '#000000'];
    }

    const end = Date.now() + (1.5 * 1000);
    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: beltColors
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: beltColors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const triggerStripeCelebration = () => {
    confetti({
      particleCount: 50,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ffffff', '#000000']
    });
  };

  const handleSelectBelt = (beltId: string) => {
    const prevIndex = BELT_ORDER.indexOf(currentFocusBelt);
    const newIndex = BELT_ORDER.indexOf(beltId);
    setCurrentFocusBelt(beltId);
    if (newIndex > prevIndex) {
      triggerBeltCelebration(beltId);
    }
    if (user?.uid) {
      setDoc(doc(db, "users", user.uid), {
        beltColor: beltId,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch((err) => {
        console.warn("Notice: could not sync belt to Firestore:", err);
      });
    }
  };

  const handlePromoteBelt = () => {
    const currentIndex = BELT_ORDER.indexOf(currentFocusBelt);
    if (currentIndex < BELT_ORDER.length - 1) {
      const nextBelt = BELT_ORDER[currentIndex + 1];
      const oldBelt = currentFocusBelt;
      setCurrentFocusBelt(nextBelt);
      setBeltStripes(0);
      setBeltProgressPercent(0);
      
      const cleanBeltName = nextBelt.replace('Faixa ', '').trim();
      localStorage.setItem('oss_user_belt', cleanBeltName);
      localStorage.setItem('oss_current_focus_belt', nextBelt);
      localStorage.setItem('oss_belt_stripes', '0');
      localStorage.setItem('oss_belt_progress', '0');
      window.dispatchEvent(new Event('storage'));

      if (user?.uid) {
        setDoc(doc(db, "users", user.uid), {
          beltColor: nextBelt,
          beltStripes: 0,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch((err) => {
          console.warn("Notice: could not sync belt to Firestore:", err);
        });
      }

      addSimulatedPoints('BONUS', `🥋 PROMOÇÃO DE FAIXA: Graduado para ${nextBelt}! OSS!`, 500);
      triggerBeltCelebration(nextBelt);
      setBeltPromotionCongrats({ oldBelt, newBelt: nextBelt });
    } else {
      triggerBeltCelebration('Faixa Preta');
      alert("Parabéns! Você já está no topo com a Faixa Preta! O caminho continua infinito. OSS!");
    }
  };

  const [beltStripes, setBeltStripes] = useState<number>(() => {
    const saved = localStorage.getItem('oss_belt_stripes');
    return saved ? parseInt(saved, 10) : 2;
  });
  const [beltProgressPercent, setBeltProgressPercent] = useState<number>(() => {
    const saved = localStorage.getItem('oss_belt_progress');
    return saved ? parseInt(saved, 10) : 65;
  });
  const [dailyGoals, setDailyGoals] = useState<Array<{ id: string, text: string, completed: boolean }>>(() => {
    const saved = localStorage.getItem('oss_daily_goals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 'dg-1', text: '🥋 Realizar check-in de treino OSS.OS ou sessão presencial', completed: false },
      { id: 'dg-2', text: '🧘 Praticar 15 minutos de mobilidade e alongamento', completed: false },
      { id: 'dg-3', text: '💧 Manter hidratação adequada (beber no mínimo 3L de água)', completed: false },
      { id: 'dg-4', text: '🧠 Exercício de respiração controlada "Fole Mental" (4 min)', completed: false },
      { id: 'dg-5', text: '📚 Estudar 1 técnica no acervo do portal', completed: false },
    ];
  });
  const [newGoalText, setNewGoalText] = useState('');
  
  // Quick training session log states inside focus mode
  const [quickTrainingDuration, setQuickTrainingDuration] = useState('60');
  const [quickTrainingType, setQuickTrainingType] = useState<'GI' | 'NOGI' | 'DRILL' | 'SPARRING'>('GI');
  const [showQuickLogSuccess, setShowQuickLogSuccess] = useState(false);

  React.useEffect(() => {
    localStorage.setItem('oss_current_focus_belt', currentFocusBelt);
  }, [currentFocusBelt]);

  React.useEffect(() => {
    localStorage.setItem('oss_belt_stripes', String(beltStripes));
  }, [beltStripes]);

  React.useEffect(() => {
    localStorage.setItem('oss_belt_progress', String(beltProgressPercent));
  }, [beltProgressPercent]);

  React.useEffect(() => {
    localStorage.setItem('oss_daily_goals', JSON.stringify(dailyGoals));
  }, [dailyGoals]);

  // Real-time synchronization of athlete profile with Firestore
  React.useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToUserProfile(user.uid, (remoteProfile) => {
      if (!remoteProfile) return;

      if (typeof remoteProfile.points === 'number') {
        setPoints(remoteProfile.points);
        localStorage.setItem('oss_simulated_points', String(remoteProfile.points));
      }

      if (typeof remoteProfile.streak === 'number') {
        setStreak(remoteProfile.streak);
        localStorage.setItem('oss_checkin_streak', String(remoteProfile.streak));
      }

      if (remoteProfile.beltColor) {
        setCurrentFocusBelt(remoteProfile.beltColor);
        localStorage.setItem('oss_current_focus_belt', remoteProfile.beltColor);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  const handleAddDailyGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const newGoal = {
      id: `dg-${Date.now()}`,
      text: newGoalText.trim(),
      completed: false
    };
    setDailyGoals(prev => [...prev, newGoal]);
    setNewGoalText('');
  };

  const handleQuickTrainingLog = () => {
    const durationMin = parseInt(quickTrainingDuration, 10);
    if (!durationMin || durationMin <= 0) {
      alert("Por favor, informe uma duração válida!");
      return;
    }

    const today = new Date();
    const dayStr = String(today.getDate()).padStart(2, '0');
    const monthStr = String(today.getMonth() + 1).padStart(2, '0');
    const yearStr = String(today.getFullYear());

    const newLog: TrainingLog = {
      id: `log-${Date.now()}`,
      date: `${yearStr}-${monthStr}-${dayStr}`,
      duration: durationMin,
      type: quickTrainingType
    };

    const nextLogs = [newLog, ...trainingLogs];
    setTrainingLogs(nextLogs);
    localStorage.setItem('oss_training_logs', JSON.stringify(nextLogs));

    // Rewards!
    addSimulatedPoints('TRAINING', `🥋 Sessão Modo Foco: ${quickTrainingType} (${durationMin} min)`, 50);
    incrementCheckInStreak(streak);

    // Auto-mark check-in goal if it exists!
    setDailyGoals(prev => prev.map(item => {
      if (item.id === 'dg-1') {
        return { ...item, completed: true };
      }
      return item;
    }));

    // Auto-increment progress by +5%
    setBeltProgressPercent(prev => Math.min(100, prev + 5));

    // Show quick success visual feedback
    setShowQuickLogSuccess(true);
    setTimeout(() => {
      setShowQuickLogSuccess(false);
    }, 3000);
  };

  // Customizable countdown & virtual Tatami View states
  const [customTimerActive, setCustomTimerActive] = useState(false);
  const [customTimerSecondsLeft, setCustomTimerSecondsLeft] = useState(360); // 6 minutes purple belt duration by default
  const [customTimerInputMinutes, setCustomTimerInputMinutes] = useState(6);
  const [customTimerLabel, setCustomTimerLabel] = useState('Tempo de Luta // ROXA');
  const [isFullscreenTatami, setIsFullscreenTatami] = useState(false);
  const [breathingStep, setBreathingStep] = useState<'inspire' | 'hold' | 'expire' | 'rest'>('inspire');
  const [breathingCount, setBreathingCount] = useState(4);

  // square breathing cycle (fole mental do competidor)
  React.useEffect(() => {
    if (!focusMode) return;
    const interval = setInterval(() => {
      setBreathingCount(prev => {
        if (prev <= 1) {
          setBreathingStep(currentStep => {
            if (currentStep === 'inspire') return 'hold';
            if (currentStep === 'hold') return 'expire';
            if (currentStep === 'expire') return 'rest';
            return 'inspire';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [focusMode]);

  // Customizable fight countdown interval
  React.useEffect(() => {
    if (!focusMode || !customTimerActive) return;

    const interval = setInterval(() => {
      setCustomTimerSecondsLeft(prev => {
        if (prev <= 1) {
          setCustomTimerActive(false);
          clearInterval(interval);
          try {
            // Trigger fight alert noise
            const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-20.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => {});
          } catch (e) {}
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([500, 250, 500]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [focusMode, customTimerActive]);

  const focusedTournament = React.useMemo(() => {
    return tournaments.find(t => t.registered) || tournaments.find(t => t.id === 'tour-test') || tournaments[0];
  }, [tournaments]);

  React.useEffect(() => {
    if (!focusMode || !focusedTournament) return;

    const targetDate = focusedTournament.startDateISO 
      ? new Date(focusedTournament.startDateISO) 
      : new Date(Date.now() + 28 * 60 * 60 * 1000);

    const updateCountdown = () => {
      const now = new Date();
      const diffMs = targetDate.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, finished: true });
        return;
      }

      const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const h = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diffMs / (1000 * 60)) % 60);
      const s = Math.floor((diffMs / 1000) % 60);

      setTimeRemaining({ days: d, hours: h, minutes: m, seconds: s, finished: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [focusMode, focusedTournament]);

  // Prevent scrolling and register ESC keyboard listener when custom Tatami View is full-screen
  React.useEffect(() => {
    if (isFullscreenTatami) {
      document.body.style.overflow = 'hidden';
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsFullscreenTatami(false);
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isFullscreenTatami]);

  // Local notification setup for events starting in < 48 hours
  const activeNotifications = React.useMemo(() => {
    const now = new Date();
    return tournaments
      .filter(t => t.registered && t.startDateISO)
      .map(t => {
        const start = new Date(t.startDateISO);
        const diffMs = start.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        return {
          tournament: t,
          hoursRemaining: Math.max(0, diffHours),
          isUrgent: diffHours > 0 && diffHours <= 48
        };
      })
      .filter(item => item.isUrgent);
  }, [tournaments]);

  // Handle native web notifications
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  });

  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<'unsupported' | 'registering' | 'active' | 'error'>('unsupported');
  const [isSimulatingBackground, setIsSimulatingBackground] = useState(false);
  const [simulationCountdown, setSimulationCountdown] = useState(0);

  // Register the Battle Alert Service Worker for reliable background worker execution
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setServiceWorkerStatus('registering');
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('OSS.OS Service Worker registrado com sucesso:', reg.scope);
          setServiceWorkerStatus('active');
        })
        .catch(err => {
          console.error('Falha ao registrar OSS.OS Service Worker:', err);
          setServiceWorkerStatus('error');
        });
    } else {
      setServiceWorkerStatus('unsupported');
    }
  }, []);

  // Trigger web notification if applicable - leveraging Service Worker if active to survive background suspension
  const sendLocalNotification = (title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'tournament-alert',
            renotify: true,
            vibrate: [300, 100, 300],
            data: {
              url: window.location.href
            }
          } as any);
        }).catch(err => {
          console.warn("Falha no Service Worker para envio, utilizando fallback:", err);
          new Notification(title, { body, icon: '/favicon.ico' });
        });
      } else {
        new Notification(title, { body, icon: '/favicon.ico' });
      }
    }
  };

  const requestNotificationPermission = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        setBrowserNotificationsEnabled(permission === 'granted');
        if (permission === 'granted') {
          sendLocalNotification(
            "⚡ Alertas Ativados com Sucesso!",
            "OSS.OS utilizará o Service Worker integrado para avisos persistentes mesmo com aplicativo fechado."
          );
        }
      });
    } else {
      alert("Seu navegador não suporta notificações de desktop nativas. Estaremos mostrando alertas integrados no painel!");
    }
  };

  // Periodic automatic tournament evaluation running even in background
  React.useEffect(() => {
    let notifiedIds: string[] = [];
    try {
      const stored = localStorage.getItem('oss_notified_tournaments');
      if (stored) notifiedIds = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }

    const checkAndNotify = () => {
      activeNotifications.forEach(({ tournament, hoursRemaining }) => {
        if (!notifiedIds.includes(tournament.id)) {
          sendLocalNotification(
            `⚠️ LUTA IMINENTE: ${tournament.title}`,
            `Seu combate oficial começa em aproximadamente ${Math.round(hoursRemaining)} horas! Peso e fardamento obrigatórios.`
          );
          notifiedIds.push(tournament.id);
          try {
            localStorage.setItem('oss_notified_tournaments', JSON.stringify(notifiedIds));
          } catch (e) {
            console.error(e);
          }
        }
      });
    };

    // Immediate check on mount/updates
    checkAndNotify();

    // Check every 30 seconds to update alerts in background (tab suspended/inactive check)
    const interval = setInterval(checkAndNotify, 30000);
    return () => clearInterval(interval);
  }, [activeNotifications]);

  // Handle a 5-second delayed notification simulation so the user can test background execution
  const simulateBackgroundNotification = () => {
    if (!browserNotificationsEnabled) {
      requestNotificationPermission();
      return;
    }
    if (isSimulatingBackground) return;

    setIsSimulatingBackground(true);
    setSimulationCountdown(5);

    const timer = setInterval(() => {
      setSimulationCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          sendLocalNotification(
            "🥋 OSS.OS // Sparring & Pesagem",
            "Este é um alerta simulado de segundo plano! Enviado via Service Worker com sucesso sem depender da visibilidade da página."
          );
          setIsSimulatingBackground(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRegisterAcademy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAcademyName.trim() || !newAcademyProfessor.trim() || !newAcademyLocation.trim()) {
      alert("Por favor, preencha todos os campos para cadastrar o dojô!");
      return;
    }
    const newAcaId = `aca-${Date.now()}`;
    const newAcaData = {
      name: newAcademyName.trim(),
      professor: newAcademyProfessor.trim(),
      location: newAcademyLocation.trim(),
      verified: true
    };

    try {
      await setDoc(doc(db, 'academies', newAcaId), newAcaData).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, `academies/${newAcaId}`);
        throw err;
      });

      const newAca: Academy = {
        id: newAcaId,
        ...newAcaData
      };
      const updated = [...academies, newAca];
      setAcademies(updated);
      localStorage.setItem('oss_academies', JSON.stringify(updated));
      setSelectedAcademyId(newAca.id);
      setShowRegisterAcademy(false);
      
      // Clear
      setNewAcademyName('');
      setNewAcademyProfessor('');
      setNewAcademyLocation('');
      
      addSimulatedPoints('BONUS', `🥋 Nova Academia Registrada: ${newAca.name}`, 100);
    } catch (err) {
      console.warn("Could not save new academy to Firestore:", err);
      // Soft fallback
      const newAca: Academy = {
        id: newAcaId,
        ...newAcaData
      };
      const updated = [...academies, newAca];
      setAcademies(updated);
      localStorage.setItem('oss_academies', JSON.stringify(updated));
      setSelectedAcademyId(newAca.id);
      setShowRegisterAcademy(false);
      
      setNewAcademyName('');
      setNewAcademyProfessor('');
      setNewAcademyLocation('');
      
      addSimulatedPoints('BONUS', `🥋 Nova Academia Registrada (Offline): ${newAca.name}`, 100);
    }
  };

  const incrementCheckInStreak = (currentVal: number) => {
    const nextStreak = currentVal + 1;
    setStreak(nextStreak);
    localStorage.setItem('oss_checkin_streak', String(nextStreak));

    // Trigger visual celebration for the streak check-in!
    triggerStreakCelebration();

    const newlyUnlockedBadge = ALL_BADGES.find(b => b.streakRequired === nextStreak);
    if (newlyUnlockedBadge) {
      setUnlockedCongratsBadge(newlyUnlockedBadge);
      // Wait slightly and fire a secondary giant celebration!
      setTimeout(() => {
        triggerBeltCelebration('Faixa Preta');
      }, 350);
    }
  };

  const handleAcademyCheckIn = () => {
    if (!selectedAcademyId) {
      alert("Selecione uma academia cadastrada para realizar o check-in!");
      return;
    }
    const academy = academies.find(a => a.id === selectedAcademyId);
    if (!academy) return;
    
    addSimulatedPoints('TRAINING', `🥋 Check-in Presencial Validado: ${academy.name}`, 50);
    incrementCheckInStreak(streak);
  };

  const DIGITAL_REWARDS: DigitalReward[] = [
    { id: 'rew-sorteio-1', title: 'Sorteio de Kimono Venum Elite 2.0', type: 'SORTEIO', pointsCost: 200, description: '1 Cupom de Participação no Sorteio Especial Mensal.' },
    { id: 'rew-sorteio-2', title: 'Sorteio de Kit Nogi (Rashguard + Shorts)', type: 'SORTEIO', pointsCost: 120, description: 'Participação no Sorteio de Equipamentos patrocinado por marcas parceiras.' },
    { id: 'rew-ebook-1', title: 'E-book: Manual Crítico de Passagem de Meia-Guarda', type: 'EBOOK', pointsCost: 100, description: 'E-book PDF completo com dezenas de páginas de pura técnica refinada.' },
    { id: 'rew-guide-1', title: 'Checklist Técnico: Periodização Preventiva de Lesões', type: 'GUIDE', pointsCost: 60, description: 'Cronograma interativo para atletas master e amadores.' }
  ];

  const handleRedeemDigitalReward = (reward: DigitalReward) => {
    if (points < reward.pointsCost) {
      alert(`Pontos insuficientes! Você precisa de ${reward.pointsCost} PTS para este prêmio.`);
      return;
    }
    
    const nextPoints = points - reward.pointsCost;
    setPoints(nextPoints);
    localStorage.setItem('oss_simulated_points', String(nextPoints));

    // Sync real-time points with Firestore for authenticated athlete
    if (user?.uid) {
      setDoc(doc(db, "users", user.uid), {
        points: nextPoints,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch((err) => {
        console.warn("Notice: could not sync points to Firestore:", err);
      });
    }
    
    const newItem = {
      id: `${reward.id}-${Date.now()}`,
      title: reward.title,
      type: reward.type,
      pointsCost: reward.pointsCost,
      unlockedAt: new Date().toLocaleDateString('pt-BR'),
      accessCode: `${reward.type === 'SORTEIO' ? 'TICKET' : 'PDF'}-${Math.floor(100000 + Math.random() * 900000)}`
    };
    
    const nextUnlocked = [newItem, ...unlockedRewards];
    setUnlockedRewards(nextUnlocked);
    localStorage.setItem('oss_unlocked_rewards', JSON.stringify(nextUnlocked));
    
    // Add to transaction history
    const newTx: PointTransaction = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'REDEEM',
      description: `Resgate de Recompensa: ${reward.title}`,
      points: -reward.pointsCost,
      date: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    setPointsHistory([newTx, ...pointsHistory]);
    localStorage.setItem('oss_points_history', JSON.stringify([newTx, ...pointsHistory]));
  };

  const addSimulatedPoints = (type: 'WELCOME' | 'PURCHASE' | 'REVIEW' | 'TRAINING' | 'CHECKIN' | 'REDEEM' | 'BONUS', description: string, amount: number) => {
    const newTx: PointTransaction = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      description,
      points: amount,
      date: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    const nextHistory = [newTx, ...pointsHistory];
    setPointsHistory(nextHistory);
    localStorage.setItem('oss_points_history', JSON.stringify(nextHistory));

    const nextPoints = points + amount;
    setPoints(nextPoints);
    localStorage.setItem('oss_simulated_points', String(nextPoints));

    // Sync real-time points with Firestore for authenticated athlete
    if (user?.uid) {
      setDoc(doc(db, "users", user.uid), {
        points: nextPoints,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch((err) => {
        console.warn("Notice: could not sync points to Firestore:", err);
      });
    }
  };

  const handleRegisterTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringTourId) return;

    const targetTour = tournaments.find(t => t.id === registeringTourId);
    const updated = tournaments.map(t => {
      if (t.id === registeringTourId) {
        return {
          ...t,
          registered: true,
          belt: selectedRegBelt,
          weightClass: selectedRegWeight
        };
      }
      return t;
    });

    setTournaments(updated);
    localStorage.setItem('oss_tournaments_list', JSON.stringify(updated));
    
    const tName = targetTour?.title || 'Torneio';
    addSimulatedPoints('BONUS', `🥋 Inscrição Confirmada IBJJF: ${tName} (${selectedRegBelt} - ${selectedRegWeight})`, 45);

    // Notify if within 48 hours
    if (targetTour?.startDateISO) {
      const start = new Date(targetTour.startDateISO);
      const diffMs = start.getTime() - Date.now();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours > 0 && diffHours <= 48) {
        sendLocalNotification(
          "⚠️ LUTA IMINENTE (Menos de 48h)",
          `Seu combate no ${tName} começa em breve! Peso e fardamento obrigatórios.`
        );
      }
    }

    setRegisteringTourId(null);
  };

  const handleCancelRegistration = (tourId: string) => {
    if (confirm("Deseja mesmo cancelar sua inscrição neste evento oficial de Jiu-Jitsu?")) {
      const updated = tournaments.map(t => {
        if (t.id === tourId) {
          return {
            ...t,
            registered: false,
            belt: undefined,
            weightClass: undefined
          };
        }
        return t;
      });
      setTournaments(updated);
      localStorage.setItem('oss_tournaments_list', JSON.stringify(updated));
      
      const tName = tournaments.find(t => t.id === tourId)?.title || 'Torneio';
      addSimulatedPoints('REDEEM', `❌ Cancelamento de Inscrição IBJJF: ${tName}`, -45);
    }
  };

  const handleAddMedalRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedalTournament.trim() || !newMedalDivision.trim()) {
      alert("Por favor, preencha todos os campos da medalha!");
      return;
    }

    const newMed: MedalRecord = {
      id: `med-${Date.now()}`,
      tournament: newMedalTournament.trim(),
      year: newMedalYear,
      belt: newMedalBelt,
      division: newMedalDivision.trim(),
      medalType: newMedalType,
      imageUrl: newMedalImageUrl.trim() || undefined,
      customIcon: newMedalCustomIcon || undefined
    };

    const updated = [newMed, ...medals];
    setMedals(updated);
    localStorage.setItem('oss_medals_list', JSON.stringify(updated));

    // Clear
    setNewMedalTournament('');
    setNewMedalDivision('');
    setNewMedalImageUrl('');
    setNewMedalCustomIcon('');
    setShowAddMedal(false);

    // Points bonus for hanging tournament history!
    addSimulatedPoints('BONUS', `🏅 Medalha Pendurada no Dojo de Conquistas: ${newMed.tournament} (${newMed.medalType === 'GOLD' ? 'Ouro' : newMed.medalType === 'SILVER' ? 'Prata' : 'Bronze'})`, 80);
  };

  const handleDeleteMedal = (medalId: string) => {
    if (confirm("Deseja mesmo remover esta conquista histórica do seu mural?")) {
      const updated = medals.filter(m => m.id !== medalId);
      setMedals(updated);
      localStorage.setItem('oss_medals_list', JSON.stringify(updated));
    }
  };

  const addSimulatedTraining = () => {
    addSimulatedPoints('TRAINING', '🥋 Simulação de Treino OSS.OS (Check-in Consistência)', 50);
  };

  const addSimulatedReview = () => {
    addSimulatedPoints('REVIEW', '✍️ Avaliação Técnica enviada com foto do Tatame', loyaltyReviewBonus);
  };

  const addSimulatedPurchase = () => {
    const products = ['Kimono Koral Classic', 'Shorts Nogi Venum', 'Protetor Bucal Gladiator', 'Manta Térmica Recovery', 'Creatina Pure Growth'];
    const p = products[Math.floor(Math.random() * products.length)];
    const pts = Math.floor(40 + Math.random() * 120);
    addSimulatedPoints('PURCHASE', `🛒 Compra Realizada via Link Indicado: ${p}`, pts);
  };

  const handleRedeemDiscount = () => {
    if (points >= loyaltyMinRedeemPoints) {
      const nextPoints = points - loyaltyMinRedeemPoints;
      setPoints(nextPoints);
      localStorage.setItem('oss_simulated_points', String(nextPoints));

      const newCoupon = `OSS-FIDELIDADE-${Math.floor(1000 + Math.random() * 9000)}`;
      const nextCoupons = [...redeemedCoupons, newCoupon];
      setRedeemedCoupons(nextCoupons);
      localStorage.setItem('oss_redeemed_coupons', JSON.stringify(nextCoupons));

      // Add to transactional history!
      const newTx: PointTransaction = {
        id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'REDEEM',
        description: `Conversão de Cupom de R$ ${loyaltyDiscountValue},00 (${newCoupon})`,
        points: -loyaltyMinRedeemPoints,
        date: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      };
      const nextHistory = [newTx, ...pointsHistory];
      setPointsHistory(nextHistory);
      localStorage.setItem('oss_points_history', JSON.stringify(nextHistory));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCoupon(text);
    setTimeout(() => {
      setCopiedCoupon(null);
    }, 2000);
  };

  const currentProgress = Math.min(100, (points / loyaltyMinRedeemPoints) * 100);

  const handleAwardFocusMedal = () => {
    const hasMedalOfFocal = medals.some(m => m.tournament === focusedTournament.title && m.medalType === 'GOLD');
    if (hasMedalOfFocal) {
      alert("Essa medalha de ouro já foi pendurada no seu mural de conquistas!");
      return;
    }
    const newFocusMedal: MedalRecord = {
      id: 'med-' + Date.now(),
      tournament: focusedTournament.title,
      year: new Date().getFullYear().toString(),
      belt: focusedTournament.belt || 'Faixa Preta',
      division: focusedTournament.weightClass || 'Peso Médio',
      medalType: 'GOLD',
      customIcon: 'crown'
    };
    const updated = [newFocusMedal, ...medals];
    setMedals(updated);
    localStorage.setItem('oss_medals_list', JSON.stringify(updated));
    addSimulatedPoints('BONUS', `🏆 Campeão de Arena: ${focusedTournament.title} (Medalha de Ouro Pendurada!)`, 250);
    alert("Parabéns, Campeão! Sua Medalha de Ouro foi eternizada com sucesso no seu mural de conquistas.");
  };

  if (trainingFocusMode) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#09090b] text-white flex flex-col p-6 md:p-12 overflow-y-auto min-h-screen w-full font-sans"
        id="training-focus-mode-container"
      >
        {/* Header bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-zinc-800 pb-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-green-500 mb-1.5">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
              <span className="text-[10px] font-mono font-black uppercase tracking-widest">⚡ MODO FOCO DE TREINO ATIVO</span>
            </div>
            <h1 className="text-4xl font-black uppercase italic -skew-x-6">
              TATAMI DE CONCENTRAÇÃO
            </h1>
            <p className="text-zinc-400 font-mono text-[10px] uppercase tracking-wide mt-1">
              Oculte o ruído do dia a dia. Concentre-se no essencial: o seu treino de hoje e sua caminhada na faixa.
            </p>
          </div>
          
          <Button
            onClick={() => setTrainingFocusMode(false)}
            variant="outline"
            className="rounded-none border-zinc-800 hover:border-white text-white hover:text-black hover:bg-white font-black text-xs tracking-widest uppercase flex items-center gap-2 py-4 px-6 h-auto bg-transparent"
          >
            <Minimize2 size={12} /> Sair do Modo Foco
          </Button>
        </div>

        {/* Focus Mode Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 flex-1 items-start">
          {/* LEFT PANEL: BELT PROGRESSION (Col Span 5) */}
          <div className="lg:col-span-5 bg-zinc-950/60 border border-zinc-900 p-8 space-y-8 h-full">
            <div>
              <span className="text-[9px] font-mono font-black text-green-500 uppercase tracking-widest block mb-1">GRADUAÇÃO E EVOLUÇÃO</span>
              <h3 className="text-lg font-black uppercase tracking-tight italic -skew-x-3 text-white">Progresso da Faixa Atual</h3>
            </div>

            {/* Interactive Belt Colors Selector */}
            <div className="space-y-3">
              <label className="block text-[8px] font-mono font-black text-zinc-400 uppercase tracking-wider">Mudar Faixa de Foco:</label>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: 'Faixa Branca', bg: 'bg-white text-zinc-950 border-zinc-300' },
                  { id: 'Faixa Azul', bg: 'bg-blue-600 text-white border-blue-400' },
                  { id: 'Faixa Roxa', bg: 'bg-purple-700 text-white border-purple-500' },
                  { id: 'Faixa Marrom', bg: 'bg-amber-800 text-white border-amber-600' },
                  { id: 'Faixa Preta', bg: 'bg-zinc-900 text-white border-zinc-700' }
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleSelectBelt(b.id)}
                    className={`py-2 px-1 text-[8px] font-black uppercase tracking-tight rounded-none border text-center transition-all ${
                      currentFocusBelt === b.id 
                        ? `${b.bg} ring-2 ring-green-600 scale-105 font-bold` 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    {b.id.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* GORGEOUS BJJ BELT COMPONENT */}
            <div className="py-6 border-y border-zinc-900 flex justify-center items-center">
              <div className="relative w-full max-w-sm h-14 border border-zinc-800 bg-zinc-900 flex items-center overflow-hidden shadow-xl shadow-black/40">
                {/* Belt Main Body Color */}
                <div className={`absolute inset-0 right-28 ${
                  currentFocusBelt === 'Faixa Branca' ? 'bg-zinc-100' :
                  currentFocusBelt === 'Faixa Azul' ? 'bg-blue-700' :
                  currentFocusBelt === 'Faixa Roxa' ? 'bg-purple-800' :
                  currentFocusBelt === 'Faixa Marrom' ? 'bg-amber-900' : 'bg-black'
                }`} />

                {/* Black Tip Tip/Tarja Section */}
                <div className={`absolute right-0 top-0 bottom-0 w-28 flex items-center justify-around px-2 ${
                  currentFocusBelt === 'Faixa Preta' ? 'bg-red-700' : 'bg-black'
                }`}>
                  {/* Stripe slots (Max 4 stripes) */}
                  {[1, 2, 3, 4].map((sIndex) => {
                    const isStripeActive = beltStripes >= sIndex;
                    return (
                      <motion.div
                        key={sIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`w-1.5 h-12 transition-all duration-300 ${
                          isStripeActive ? 'bg-zinc-100 shadow-[0_0_8px_rgba(255,255,255,0.7)]' : 'bg-zinc-900/40 border border-dashed border-zinc-800'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Interactive Stripes Label */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 font-black uppercase text-[10px] tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center gap-1">
                  🥋 {currentFocusBelt} <span className="opacity-75">•</span> {beltStripes} Graus
                </div>
              </div>
            </div>

            {/* Interactive controls for Stripes/Graus and progress percent */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="block text-[8px] font-mono font-black text-zinc-400 uppercase tracking-wider">Ajustar Graus (Listras):</span>
                <div className="flex bg-zinc-900 border border-zinc-800 p-1">
                  <Button
                    onClick={() => setBeltStripes(prev => Math.max(0, prev - 1))}
                    variant="ghost"
                    className="flex-1 hover:bg-zinc-800 text-zinc-350 text-xs font-mono font-bold h-8 rounded-none border-none bg-transparent"
                  >
                    - Grau
                  </Button>
                  <div className="w-[1px] bg-zinc-800 h-6 self-center" />
                  <Button
                    onClick={() => setBeltStripes(prev => {
                      if (prev < 4) {
                        triggerStripeCelebration();
                        return prev + 1;
                      }
                      return prev;
                    })}
                    variant="ghost"
                    className="flex-1 hover:bg-zinc-800 text-zinc-350 text-xs font-mono font-bold h-8 rounded-none border-none bg-transparent"
                  >
                    + Grau
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-[8px] font-mono font-black text-zinc-400 uppercase tracking-wider">Evolução Técnica (%):</span>
                <div className="flex bg-zinc-900 border border-zinc-800 p-1">
                  <Button
                    onClick={() => setBeltProgressPercent(prev => Math.max(0, prev - 5))}
                    variant="ghost"
                    className="flex-1 hover:bg-zinc-800 text-zinc-350 text-xs font-mono font-bold h-8 rounded-none border-none bg-transparent"
                  >
                    - 5%
                  </Button>
                  <div className="w-[1px] bg-zinc-800 h-6 self-center" />
                  <Button
                    onClick={() => setBeltProgressPercent(prev => {
                      const next = Math.min(100, prev + 5);
                      if (next === 100 && prev < 100) {
                        triggerBeltCelebration(currentFocusBelt);
                      }
                      return next;
                    })}
                    variant="ghost"
                    className="flex-1 hover:bg-zinc-800 text-zinc-350 text-xs font-mono font-bold h-8 rounded-none border-none bg-transparent"
                  >
                    + 5%
                  </Button>
                </div>
              </div>
            </div>

            {/* Progress Bar display */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono font-black uppercase text-zinc-400 tracking-wider">
                <span>Passagem para próxima faixa</span>
                <span className="text-green-500 font-bold">{beltProgressPercent}%</span>
              </div>
              <div className="relative h-2.5 w-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${beltProgressPercent}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-green-700 to-green-500"
                />
              </div>
              <p className="text-[9px] text-zinc-500 font-mono leading-relaxed uppercase">
                {beltProgressPercent === 100 
                  ? "🎯 PRONTO PARA GRADUAÇÃO! CONSULTE SEU SENSEI." 
                  : `Treine com consistência para acumular horas de prática e expandir seu repertório técnico.`}
              </p>
              {beltProgressPercent === 100 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePromoteBelt}
                  className="w-full mt-2 bg-gradient-to-r from-[#cc0000] to-red-700 hover:from-red-700 hover:to-red-800 text-white font-mono text-[10px] font-black uppercase tracking-wider py-3.5 border-2 border-black shadow-[0_4px_20px_rgba(204,0,0,0.4)] cursor-pointer"
                >
                  🏆 PROMOVER PARA A PRÓXIMA FAIXA! OSS!
                </motion.button>
              )}
            </div>

            {/* Quick stats panel */}
            <div className="p-4 bg-zinc-900/40 border border-zinc-900/60 grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="block text-[7px] text-zinc-500 font-mono uppercase font-black">Sessões Totais</span>
                <span className="text-lg font-black font-mono text-zinc-200">{trainingLogs.length}</span>
              </div>
              <div className="border-x border-zinc-900">
                <span className="block text-[7px] text-zinc-500 font-mono uppercase font-black">Check-in Streak</span>
                <span className="text-lg font-black font-mono text-orange-500 flex items-center justify-center gap-0.5">
                  <Flame size={12} className="fill-current" /> {streak}d
                </span>
              </div>
              <div>
                <span className="block text-[7px] text-zinc-500 font-mono uppercase font-black">Pontuação Geral</span>
                <span className="text-lg font-black font-mono text-green-500">{points} PTS</span>
              </div>
            </div>

            {/* DAILY CHECK-IN CARD */}
            <div className="p-5 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-black border border-amber-500/30 shadow-[0_4px_25px_rgba(245,158,11,0.08)] relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[8px] font-mono font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={10} className="text-amber-400" /> RECOMPENSA DIÁRIA DE FIDELIDADE
                  </span>
                  <h4 className="text-sm font-black uppercase tracking-tight text-white italic -skew-x-2 flex items-center gap-1.5 mt-0.5">
                    <Flame size={16} className="text-orange-500 fill-orange-500/30" /> Check-in Diário do Atleta
                  </h4>
                </div>
                
                <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-mono font-black px-2 py-0.5 uppercase rounded-none">
                  +50 PTS / DIA
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 my-3.5 p-3 bg-zinc-900/60 border border-zinc-800/80">
                <div>
                  <span className="block text-[8px] font-mono text-zinc-400 uppercase">Sequência Atual</span>
                  <span className="text-base font-black font-mono text-orange-400 flex items-center gap-1">
                    <Flame size={14} className="fill-current text-orange-500" /> {streak} {streak === 1 ? 'Dia' : 'Dias'}
                  </span>
                </div>
                <div className="border-l border-zinc-800 pl-3">
                  <span className="block text-[8px] font-mono text-zinc-400 uppercase">Status de Hoje</span>
                  {isCheckedInToday ? (
                    <span className="text-xs font-bold font-mono text-green-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 size={12} className="text-green-500" /> Validado (+50 PTS)
                    </span>
                  ) : (
                    <span className="text-xs font-bold font-mono text-amber-400 flex items-center gap-1 mt-0.5 animate-pulse">
                      <Zap size={12} className="text-amber-400" /> Pendente de Check-in
                    </span>
                  )}
                </div>
              </div>

              {isCheckedInToday ? (
                <div className="p-3 bg-green-950/20 border border-green-800/40 text-center">
                  <p className="text-[11px] font-bold text-green-400 flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={13} /> Check-in Concluído com Sucesso Hoje!
                  </p>
                  <p className="text-[9px] font-mono text-zinc-400 uppercase mt-0.5">
                    Você já garantiu seus +50 OSS Points. Volte amanhã para manter seu streak de {streak} dias!
                  </p>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDailyCheckIn}
                  className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-mono text-[11px] font-black uppercase tracking-wider py-3 px-4 border-2 border-amber-400 shadow-[0_4px_20px_rgba(245,158,11,0.3)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Flame size={16} className="fill-current text-black" /> REALIZAR CHECK-IN DIÁRIO (+50 PTS)
                </motion.button>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: DAILY TRAINING GOALS (Col Span 7) */}
          <div className="lg:col-span-7 bg-zinc-950/60 border border-zinc-900 p-8 space-y-8 h-full">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-mono font-black text-green-500 uppercase tracking-widest block mb-1">ORGANIZAÇÃO DIÁRIA</span>
                <h3 className="text-lg font-black uppercase tracking-tight italic -skew-x-3 text-white">Metas Diárias de Treino</h3>
              </div>
              
              <Button
                onClick={() => {
                  setDailyGoals([
                    { id: 'dg-1', text: '🎯 Realizar check-in de treino OSS.OS ou sessão presencial', completed: false },
                    { id: 'dg-2', text: '🧘 Praticar 15 minutos de mobilidade e alongamento', completed: false },
                    { id: 'dg-3', text: '💧 Manter hidratação adequada (beber no mínimo 3L de água)', completed: false },
                    { id: 'dg-4', text: '🧠 Exercício de respiração controlada "Fole Mental" (4 min)', completed: false },
                    { id: 'dg-5', text: '📚 Estudar 1 técnica no acervo do portal', completed: false },
                  ]);
                }}
                variant="ghost"
                className="text-[8px] font-mono font-black text-zinc-500 hover:text-white uppercase tracking-widest px-2 py-1 h-auto bg-transparent border-none"
              >
                Resetar Metas
              </Button>
            </div>

            {/* List of goals */}
            <div className="space-y-3">
              {dailyGoals.map((g) => {
                return (
                  <div
                    key={g.id}
                    onClick={() => {
                      setDailyGoals(prev => prev.map(item => item.id === g.id ? { ...item, completed: !item.completed } : item));
                    }}
                    className={`flex items-center gap-4 p-4 border transition-all cursor-pointer select-none ${
                      g.completed 
                        ? 'border-green-800/40 bg-green-950/10 text-zinc-500 line-through' 
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 text-white'
                    }`}
                  >
                    <div className={`w-5 h-5 flex items-center justify-center border transition-all rounded-none ${
                      g.completed ? 'border-green-600 bg-green-600 text-white' : 'border-zinc-700 text-transparent'
                    }`}>
                      {g.completed && <CheckCircle2 size={12} className="stroke-[3]" />}
                    </div>
                    <span className="text-xs font-medium tracking-tight flex-1">
                      {g.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Form to add custom goals */}
            <form onSubmit={handleAddDailyGoal} className="flex gap-2">
              <input
                type="text"
                required
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                placeholder="Ex: Treinar passagem de guarda de Lapela"
                className="flex-1 bg-zinc-900 border border-zinc-800 text-xs p-3 font-medium placeholder-zinc-500 focus:outline-none focus:border-green-600 transition-all text-white rounded-none uppercase"
              />
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-500 text-white font-black uppercase text-[10px] tracking-widest px-6 rounded-none border-none h-auto shrink-0"
              >
                Adicionar Meta
              </Button>
            </form>

            {/* QUICK TRAINING LOG PANEL */}
            <div className="p-6 border border-zinc-800 bg-zinc-900/30 space-y-4">
              <div>
                <span className="block text-[8px] font-mono font-black text-green-500 uppercase tracking-widest mb-1">TATAMI REGISTRY</span>
                <h4 className="text-xs font-black uppercase text-white tracking-tight">🥋 Registrar Sessão de Treino do Dia</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed font-mono uppercase">
                  Logue seu treino para marcar metas, acumular 50 pontos OSS.OS e progredir sua faixa!
                </p>
              </div>

              {showQuickLogSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-950/20 border border-green-800/40 p-4 text-center space-y-1"
                >
                  <p className="text-xs font-bold text-green-400">OSS! TREINO REGISTRADO COM SUCESSO! ✓</p>
                  <p className="text-[9px] text-zinc-400 uppercase font-mono">+50 Pontos no Portal e Streak incrementado!</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-4">
                    <label className="block text-[8px] font-mono font-black uppercase text-zinc-500 mb-1">Duração (Minutos)</label>
                    <input
                      type="number"
                      min="10"
                      max="480"
                      value={quickTrainingDuration}
                      onChange={(e) => setQuickTrainingDuration(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs p-2.5 font-mono font-bold text-white rounded-none focus:border-green-600 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[8px] font-mono font-black uppercase text-zinc-500 mb-1">Tipo de Treino</label>
                    <select
                      value={quickTrainingType}
                      onChange={(e) => setQuickTrainingType(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs p-2.5 font-bold text-white rounded-none focus:border-green-600 outline-none"
                    >
                      <option value="GI">Kimono (Gi)</option>
                      <option value="NOGI">No-Gi</option>
                      <option value="DRILL">Drills</option>
                      <option value="SPARRING">Rola (Sparing)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-4 flex items-end">
                    <Button
                      onClick={handleQuickTrainingLog}
                      className="w-full bg-green-600 hover:bg-green-500 text-white font-black uppercase text-[10px] tracking-widest py-3 rounded-none border-none shadow-md shadow-green-600/10"
                    >
                      Logar Treino 🥋
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Inspirational Quote of the day */}
            <div className="p-4 bg-zinc-900/10 border border-dashed border-zinc-800 flex items-center justify-between text-center italic text-zinc-500 font-sans text-xs">
              "O faixa preta é apenas um faixa branca que se recusou a desistir diante das adversidades do tatame." • Mestre Helio Gracie
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (focusMode) {
    const userCompetitorName = user.displayName || 'Guerreiro OSS';
    const userBelt = focusedTournament?.belt || 'Faixa Preta';
    const userWeight = focusedTournament?.weightClass || 'Peso Médio';
    
    // 🥋 TATAMI VIEW (Virtual Full-Screen immersive layout for tablet/mobile set up)
    if (isFullscreenTatami) {
      const minutes = Math.floor(customTimerSecondsLeft / 60);
      const seconds = customTimerSecondsLeft % 60;
      
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(10px)' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] bg-[#000000] text-white flex flex-col justify-between p-6 sm:p-10 font-sans tracking-tight select-none h-screen w-full overflow-hidden antialiased"
        >
          {/* Top Header */}
          <div className={`flex justify-between items-center border-b border-zinc-900 pb-4 transition-all duration-700 ease-in-out ${
            customTimerActive ? 'opacity-0 scale-95 pointer-events-none -translate-y-12 h-0 overflow-hidden pb-0 border-none' : 'opacity-100 scale-100 translate-y-0'
          }`}>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
              <div>
                <span className="text-[10px] sm:text-xs font-mono font-black text-green-500 uppercase tracking-widest block font-sans">
                  🥋 MODO VISUALIZAÇÃO DE TATAME // FOCO TOTAL ESTILO DOJO
                </span>
                <span className="text-sm font-black uppercase text-zinc-300">
                  {userCompetitorName} • {userBelt}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-zinc-500 uppercase hidden md:inline">
                Apoie o celular ou tablet na borda do tatame e inicie o cronômetro para o seu Sparring/Drill pré-combate!
              </span>
              <Button
                onClick={() => setIsFullscreenTatami(false)}
                className="bg-red-950/40 hover:bg-red-700/80 text-white py-2 px-4 h-auto text-xs font-black uppercase tracking-widest rounded-none border border-red-500/20 transition-all text-center flex items-center gap-2"
              >
                <Minimize2 size={12} /> Sair do Tatame (ESC)
              </Button>
            </div>
          </div>

          {/* Core Content - MASSIVE 1:1 ASPECT COUNTDOWN */}
          <div 
            onClick={() => setCustomTimerActive(!customTimerActive)}
            className="flex-1 flex flex-col items-center justify-center py-6 cursor-pointer select-none group relative w-full h-full"
            title="Clique na tela para iniciar ou pausar o cronômetro"
          >
            <span className={`text-zinc-500 text-xs sm:text-sm font-mono uppercase tracking-[0.25em] mb-2 text-center block transition-all duration-700 ${
              customTimerActive ? 'opacity-30 scale-90 mb-0' : 'opacity-100 scale-100'
            }`}>
              ⚠️ CATEGORIA: {customTimerLabel}
            </span>

            {/* Huge Clock - 1:1 Scale Monospace Tabular Fonts */}
            <div className="text-[18vh] sm:text-[20vw] font-black font-mono leading-none tracking-normal text-center select-none flex items-center justify-center text-white transition-all duration-700 w-full">
              <span className={`font-mono font-black tabular-nums transition-all duration-700 ${
                customTimerActive ? "text-[#00ff66] drop-shadow-[0_0_80px_rgba(0,255,102,0.25)] scale-[1.08]" : "text-zinc-300 scale-100"
              }`}>
                {String(minutes).padStart(2, '0')}
              </span>
              <span className={`mx-3 sm:mx-6 font-mono font-black transition-all duration-700 ${customTimerActive ? "text-[#00ff66] animate-pulse" : "text-zinc-700"}`}>:</span>
              <span className={`font-mono font-black tabular-nums transition-all duration-700 ${
                customTimerActive ? "text-[#00ff66] drop-shadow-[0_0_80px_rgba(0,255,102,0.25)] scale-[1.08]" : "text-zinc-300 scale-100"
              }`}>
                {String(seconds).padStart(2, '0')}
              </span>
            </div>

            {/* Ambient tap overlay hints */}
            <div className={`mt-6 text-[9px] font-mono font-black uppercase tracking-[0.3em] transition-all duration-500 ${
              customTimerActive ? 'opacity-20 group-hover:opacity-60 text-[#00ff66]' : 'opacity-50 text-zinc-500'
            }`}>
              {customTimerActive ? "🥋 TAP EM QUALQUER LUGAR PARA PAUSAR" : "🥋 TAP EM QUALQUER LUGAR PARA INICIAR"}
            </div>
          </div>

          {/* Giant Easy-Touch Custom Timer Controls */}
          <div className={`flex flex-wrap justify-center items-center gap-4 mt-2 mb-6 transition-all duration-700 ease-in-out ${
            customTimerActive ? 'opacity-10 hover:opacity-100 scale-95' : 'opacity-100 scale-100'
          }`}>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setCustomTimerActive(!customTimerActive);
              }}
              className={`py-5 px-8 h-auto rounded-none text-xs font-black uppercase tracking-widest flex items-center gap-2 border-none transition-all ${
                customTimerActive
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/10'
                  : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/20'
              }`}
            >
              {customTimerActive ? (
                <>
                  <Pause size={14} fill="currentColor" /> Pausar Luta
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" /> Iniciar Combate
                </>
              )}
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                setCustomTimerActive(false);
                setCustomTimerSecondsLeft(customTimerInputMinutes * 60);
              }}
              variant="outline"
              className="hover:bg-zinc-900 border-zinc-800 text-white py-5 px-6 h-auto rounded-none text-xs font-black uppercase tracking-widest flex items-center gap-2 bg-transparent"
            >
              <RotateCcw size={12} /> Reiniciar Luta
            </Button>

            <div className="flex bg-zinc-905 border border-zinc-900 p-1" onClick={(e) => e.stopPropagation()}>
              <Button
                onClick={() => {
                  const next = Math.max(0, customTimerSecondsLeft - 60);
                  setCustomTimerSecondsLeft(next);
                }}
                variant="ghost"
                className="hover:bg-zinc-900 text-zinc-400 text-xs font-mono font-bold py-3 px-3 rounded-none h-auto bg-transparent border-none"
              >
                -1 MIN
              </Button>
              <div className="h-6 w-[1px] bg-zinc-850 self-center" />
              <Button
                onClick={() => {
                  setCustomTimerSecondsLeft(prev => prev + 60);
                }}
                variant="ghost"
                className="hover:bg-zinc-900 text-zinc-400 text-xs font-mono font-bold py-3 px-3 rounded-none h-auto bg-transparent border-none"
              >
                +1 MIN
              </Button>
            </div>
          </div>

          {/* Bottom Layout - Breathing Guides & BJJ Mantras */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 border-t border-zinc-900 pt-6 transition-all duration-700 ease-in-out ${
            customTimerActive ? 'opacity-0 scale-95 pointer-events-none h-0 overflow-hidden pt-0 mt-0 border-none' : 'opacity-100 scale-100'
          }`}>
            {/* Square Breathing Guide */}
            <div className="p-4 bg-zinc-950 border border-zinc-900 flex items-center gap-5">
              {/* Animated lungs indicator */}
              <div className="relative w-16 h-16 rounded-full border-2 border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden bg-black">
                <motion.div
                  animate={{
                    scale: breathingStep === 'inspire' ? [1, 1.4, 1.4] : breathingStep === 'hold' ? 1.4 : breathingStep === 'expire' ? [1.4, 1, 1] : 1,
                  }}
                  transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
                  className={`absolute w-10 h-10 rounded-full ${
                    breathingStep === 'inspire' ? 'bg-green-600/20 border border-green-500/40' :
                    breathingStep === 'hold' ? 'bg-amber-500/20 border border-amber-400/40' :
                    breathingStep === 'expire' ? 'bg-blue-500/20 border border-blue-400/40' : 'bg-zinc-900 border border-zinc-805'
                  }`}
                />
                <span className="relative z-10 font-mono text-xs font-black text-zinc-305">{breathingCount}s</span>
              </div>
              
              <div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-mono">CICLO DE RESPIRAÇÃO CONTROLADA</span>
                <span className="text-xs font-black uppercase text-white tracking-tight">
                  {breathingStep === 'inspire' && '💨 INSPIRE PROFUNDAMENTE'}
                  {breathingStep === 'hold' && '⏳ RETENHA O OXIGÊNIO'}
                  {breathingStep === 'expire' && '🌬️ SOLTE O AR DEVAGAR'}
                  {breathingStep === 'rest' && '🥋 RELAXE E LIMPE A MENTE'}
                </span>
                <p className="text-[10px] text-zinc-505 mt-1 uppercase font-medium leading-relaxed font-mono">
                  Sincronize sua atenção com os tempos do pulmão para baixar a frequência cardíaca antes do combate.
                </p>
              </div>
            </div>

            {/* Tactical Combat Reminders */}
            <div className="p-4 bg-zinc-950 border border-zinc-900 flex flex-col justify-center">
              <span className="text-[9px] font-mono text-green-500 uppercase tracking-widest block mb-1">🎯 DIRETRIZES TÁTICAS DE ARENA</span>
              <div className="space-y-1 font-mono text-[9px] text-zinc-550 uppercase leading-snug font-mono">
                <div><span className="text-green-600">1.</span> Estabeleça a pegada dominante de lapela e gola nos primeiros 10 segundos.</div>
                <div><span className="text-green-600">2.</span> Ao pontuar/passar a guarda, estabilize o peso por 3 segundos sem afobação.</div>
                <div><span className="text-green-600">3.</span> Jiu-jitsu é alavanca e técnica. Preserve sua energia e respire!</div>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl mx-auto py-12 px-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <span className="text-[9px] font-mono font-black text-green-600 dark:text-green-500 uppercase tracking-widest block mb-1 font-sans">
              ⚡ AMBIENTE DE CONCENTRAÇÃO MÁXIMA
            </span>
            <h1 className="text-3xl font-black uppercase italic -skew-x-6">
              Modo Foco: Dia do Torneio
            </h1>
          </div>
          <Button
            onClick={() => {
              setFocusMode(false);
              setBracketProgress(1); // auto-reset simulation on clean exits
            }}
            variant="outline"
            className="rounded-none border-zinc-350 hover:border-black font-black text-xs tracking-widest uppercase flex items-center gap-1.5 py-4 px-6 h-auto"
          >
            ← Voltar ao Painel Geral
          </Button>
        </div>

        {/* 2-Column Dashboard Header: Official Tracker vs Interactive Arena Timer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Box 1: Official Tournament Countdown (2/3 width on desktop) */}
          <div className="lg:col-span-2 bg-zinc-950 text-white p-8 border-l-4 border-green-600 relative overflow-hidden shadow-xl shadow-green-500/5 flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
              <Clock size={160} />
            </div>
            
            <div className="relative z-10 space-y-2">
              <span className="text-[9.5px] font-mono font-black text-green-500 uppercase tracking-[0.2em] flex items-center gap-1 font-mono">
                <Shield size={12} className="animate-pulse" fill="currentColor" /> CHRONOS COMBAT REGULATOR
              </span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-4">
                {focusedTournament ? focusedTournament.title : "Simulado de Competição OSS.OS 2026"}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-zinc-400 font-mono text-[9px] mb-6">
                <span className="uppercase font-bold bg-zinc-900 border border-zinc-855 px-2 py-0.5 text-zinc-350">
                  🥋 {userBelt}
                </span>
                <span className="uppercase font-bold bg-zinc-900 border border-zinc-855 px-2 py-0.5 text-zinc-350">
                  ⚖️ {userWeight}
                </span>
                <span className="text-zinc-500">📍 LOCAL: {focusedTournament?.location || "Arena de Lutas OSS"}</span>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-905 p-6 text-center space-y-2 select-none relative overflow-hidden mt-auto">
              <span className="block text-[8px] font-mono text-green-400 uppercase tracking-widest font-black font-mono">
                Contador Regressivo até a Luta Oficial
              </span>
              {timeRemaining.finished ? (
                <div className="animate-pulse py-2 font-mono">
                  <span className="text-lg font-black font-mono text-red-500 block uppercase">
                    🥋 COMBATE ATIVO!
                  </span>
                  <span className="text-[9px] font-mono text-zinc-400 block uppercase mt-1 text-zinc-500">
                    Dirija-se ao tatame imediatamente.
                  </span>
                </div>
              ) : (
                <div className="flex justify-center items-center gap-2 font-mono">
                  <div className="text-center">
                    <span className="block text-xl font-black tracking-tight text-white">{String(timeRemaining.days).padStart(2, '0')}</span>
                    <span className="block text-[7px] text-zinc-500 uppercase font-mono">Dias</span>
                  </div>
                  <span className="text-zinc-650 text-xl font-bold font-mono">:</span>
                  <div className="text-center">
                    <span className="block text-xl font-black tracking-tight text-white">{String(timeRemaining.hours).padStart(2, '0')}</span>
                    <span className="block text-[7px] text-zinc-500 uppercase font-mono font-mono">Horas</span>
                  </div>
                  <span className="text-zinc-650 text-xl font-bold font-mono">:</span>
                  <div className="text-center">
                    <span className="block text-xl font-black tracking-tight text-white">{String(timeRemaining.minutes).padStart(2, '0')}</span>
                    <span className="block text-[7px] text-zinc-500 uppercase font-mono">Min</span>
                  </div>
                  <span className="text-zinc-650 text-xl font-bold font-mono">:</span>
                  <div className="text-center">
                    <span className="block text-xl font-black tracking-tight text-white animate-pulse text-green-500">{String(timeRemaining.seconds).padStart(2, '0')}</span>
                    <span className="block text-[7px] text-zinc-500 uppercase font-mono font-mono">Seg</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Box 2: Interactive Custom Fight Timer & Tatami Mode Launch Pad (1/3 width) */}
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden min-h-[320px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-850 pb-2.5">
                <span className="text-[9px] font-mono font-black text-amber-500 uppercase tracking-widest flex items-center gap-1 font-mono">
                  🥋 CRONÔMETRO SPARRES & DRILLS
                </span>
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 font-mono text-[7px] rounded-none uppercase">
                  Customizado
                </Badge>
              </div>

              {/* Timer Config Form fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[8px] font-mono text-zinc-400 uppercase mb-1 font-mono">Rotular Objetivo / Atividade</label>
                  <input
                    type="text"
                    value={customTimerLabel}
                    onChange={(e) => setCustomTimerLabel(e.target.value)}
                    placeholder="Ex: Combate Sparring, Drill, Respiração"
                    className="w-full text-[11px] bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 p-2 font-black text-black dark:text-white rounded-none focus:outline-none focus:border-green-600 transition-all font-mono uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-mono text-zinc-400 uppercase mb-1 font-mono">Minutos de Luta</label>
                    <div className="flex items-center">
                      <Button
                        onClick={() => {
                          const nextMin = Math.max(1, customTimerInputMinutes - 1);
                          setCustomTimerInputMinutes(nextMin);
                          setCustomTimerSecondsLeft(nextMin * 60);
                        }}
                        variant="outline"
                        className="p-2 h-8 rounded-none border-zinc-350 dark:border-zinc-750 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                      >
                        <ChevronDown size={12} />
                      </Button>
                      <span className="flex-1 text-center font-mono font-black text-xs text-black dark:text-white font-mono">
                        {customTimerInputMinutes}m
                      </span>
                      <Button
                        onClick={() => {
                          const nextMin = customTimerInputMinutes + 1;
                          setCustomTimerInputMinutes(nextMin);
                          setCustomTimerSecondsLeft(nextMin * 60);
                        }}
                        variant="outline"
                        className="p-2 h-8 rounded-none border-zinc-350 dark:border-zinc-750 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                      >
                        <ChevronUp size={12} />
                      </Button>
                    </div>
                  </div>

                  {/* Quick Preset Selector */}
                  <div>
                    <label className="block text-[8px] font-mono text-zinc-400 uppercase mb-1 font-mono">Presets Faixa</label>
                    <select
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setCustomTimerInputMinutes(val);
                        setCustomTimerSecondsLeft(val * 60);
                        if (val === 5) setCustomTimerLabel("Tempo de Luta // AZUL");
                        if (val === 6) setCustomTimerLabel("Tempo de Luta // ROXA");
                        if (val === 8) setCustomTimerLabel("Tempo de Luta // MARROM");
                        if (val === 10) setCustomTimerLabel("Tempo de Luta // PRETA");
                      }}
                      className="w-full text-[10px] bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 p-2 font-bold font-mono py-1 rounded-none focus:outline-none"
                    >
                      <option value="6">Roxa / Azul (6m)</option>
                      <option value="5">Branca / Azul (5m)</option>
                      <option value="8">Marrom (8m)</option>
                      <option value="10">Preta (10m)</option>
                      <option value="2">Aquecimento (2m)</option>
                      <option value="3">Meditação/Foco (3m)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Miniature countdown digits */}
              <div className="bg-white dark:bg-black p-4 border border-zinc-200 dark:border-zinc-850 flex justify-between items-center mt-3 font-mono">
                <div>
                  <span className="block text-[7px] text-zinc-400 uppercase font-black font-mono">Tempo Restante</span>
                  <span className={`text-xl font-bold font-mono tracking-wider ${customTimerActive ? 'text-green-600 animate-pulse' : 'text-zinc-650'}`}>
                    {String(Math.floor(customTimerSecondsLeft / 60)).padStart(2, '0')}:{String(customTimerSecondsLeft % 60).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex gap-1">
                  <Button
                    onClick={() => setCustomTimerActive(!customTimerActive)}
                    className={`py-1.5 px-3 h-auto text-[8px] font-black uppercase rounded-none tracking-widest ${
                      customTimerActive ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-900'
                    }`}
                  >
                    {customTimerActive ? <Pause size={10} /> : <Play size={10} />}
                  </Button>
                  <Button
                    onClick={() => {
                      setCustomTimerActive(false);
                      setCustomTimerSecondsLeft(customTimerInputMinutes * 60);
                    }}
                    variant="outline"
                    className="p-2 h-auto text-[8px] font-black uppercase rounded-none border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100"
                  >
                    <RotateCcw size={10} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Launch Tatame (Full Screen) button */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850 mt-4">
              <Button
                onClick={() => setIsFullscreenTatami(true)}
                className="w-full bg-green-600 hover:bg-green-500 text-white py-3.5 h-auto rounded-none text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md shadow-green-600/10 border-none"
              >
                <Maximize2 size={12} /> INICIAR VISUALIZAÇÃO DE TATAME
              </Button>
            </div>
          </div>
        </div>

        {/* Bracket Progress Dashboard (Chave de Lutas Simplificada) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
              <Trophy size={14} className="text-green-600" /> Chave do Torneio (Fórmula Eliminatória Simplificada)
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-zinc-500 uppercase hidden sm:inline">Seu Status:</span>
              <Badge className={`rounded-none text-[8.5px] font-mono font-black uppercase tracking-wider ${
                bracketProgress === 4 
                  ? 'bg-amber-500 text-black animate-bounce' 
                  : 'bg-green-600 text-white animate-pulse'
              }`}>
                {bracketProgress === 1 && 'Quartas de Final'}
                {bracketProgress === 2 && 'Semifinais'}
                {bracketProgress === 3 && 'Final do Evento'}
                {bracketProgress === 4 && '🥇 CAMPEÃO DO EVENTO!'}
              </Badge>
            </div>
          </div>

          <div className="flex lg:grid lg:grid-cols-4 gap-6 overflow-x-auto pb-6 pt-4 no-scrollbar">
            {/* COLUMN 1: Quartas de Final */}
            <div className="min-w-[260px] space-y-6">
              <div className="text-center py-1 border-b border-zinc-100 dark:border-zinc-805">
                <span className="text-[9px] font-mono font-black text-zinc-400 uppercase tracking-widest">Quartas de Final</span>
              </div>
              
              {/* Luta 1 (Nossa Luta) */}
              <div className={`p-4 border ${bracketProgress === 1 ? 'border-green-600/70 bg-green-50/5 dark:bg-green-955/10 ring-1 ring-green-600/20' : 'border-zinc-200 dark:border-zinc-800 opacity-75'} relative`}>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-1">
                    <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase">COMBATE #01</span>
                    {bracketProgress === 1 && <span className="text-[8px] font-mono font-black bg-green-600 text-white px-1 py-0.5 rounded-none animate-pulse">SUA VEZ</span>}
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-xs font-black text-black dark:text-white">
                      <span className="flex items-center gap-1 text-green-600">🥋 {userCompetitorName} <span className="text-[8px] font-bold text-zinc-450 font-mono">(Você)</span></span>
                      {bracketProgress >= 2 && <span className="text-green-600 text-[10px]">✓</span>}
                    </div>
                    <div className="flex justify-between items-center text-xs text-zinc-400">
                      <span>🥋 Bruno Alencar <span className="text-[8px] font-mono text-zinc-500">(Alliance)</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Luta 2 */}
              <div className={`p-4 border border-zinc-200 dark:border-zinc-800 opacity-60 text-xs`}>
                <span className="block text-[8px] font-mono font-bold text-zinc-400 uppercase mb-2">COMBATE #02</span>
                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-zinc-700 dark:text-zinc-350">
                    <span>🥋 Carlos Nobre</span>
                    {bracketProgress >= 2 && <span className="text-green-600 text-[10px]">✓</span>}
                  </div>
                  <div className="text-zinc-400 font-medium">
                    <span>🥋 Eduardo Santos</span>
                  </div>
                </div>
              </div>

              {/* Luta 3 */}
              <div className={`p-4 border border-zinc-200 dark:border-zinc-800 opacity-60 text-xs`}>
                <span className="block text-[8px] font-mono font-bold text-zinc-400 uppercase mb-2">COMBATE #03</span>
                <div className="space-y-1">
                  <div className="text-zinc-450 font-medium">
                    <span>🥋 Gabriel Souza</span>
                  </div>
                  <div className="flex justify-between text-zinc-700 dark:text-zinc-350">
                    <span>🥋 Felipe Rocha</span>
                    {bracketProgress >= 2 && <span className="text-green-600 text-[10px]">✓</span>}
                  </div>
                </div>
              </div>

              {/* Luta 4 */}
              <div className={`p-4 border border-zinc-200 dark:border-zinc-800 opacity-60 text-xs`}>
                <span className="block text-[8px] font-mono font-bold text-zinc-400 uppercase mb-2">COMBATE #04</span>
                <div className="space-y-1">
                  <div className="text-zinc-400 font-medium">
                    <span>🥋 Henrique Ferreira</span>
                  </div>
                  <div className="flex justify-between text-zinc-700 dark:text-zinc-350 font-bold">
                    <span>🥋 Lucas Lima</span>
                    {bracketProgress >= 2 && <span className="text-green-600 text-[10px]">✓</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: Semifinais */}
            <div className="min-w-[260px] space-y-12">
              <div className="text-center py-1 border-b border-zinc-100 dark:border-zinc-805">
                <span className="text-[9px] font-mono font-black text-green-600 dark:text-green-500 uppercase tracking-widest">Semifinais</span>
              </div>

              {/* Semifinal 1 (Nossa Luta das Semis) */}
              <div className={`p-5 border ${bracketProgress === 2 ? 'border-green-600/70 bg-green-50/5 dark:bg-green-955/10 ring-1 ring-green-600/20' : 'border-zinc-200 dark:border-zinc-800'} ${bracketProgress < 2 ? 'opacity-40' : 'opacity-100'} relative`}>
                <span className="block text-[8px] font-mono font-bold text-zinc-400 uppercase mb-2">COMBATE SEMIFINAL #01</span>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-black text-black dark:text-white">
                    <span className="text-green-600 font-black">🥋 {userCompetitorName}</span>
                    {bracketProgress >= 3 && <span className="text-green-600 text-[10px]">✓</span>}
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-450">
                    <span>🥋 Carlos Nobre</span>
                  </div>
                </div>
              </div>

              {/* Semifinal 2 */}
              <div className={`p-5 border border-zinc-200 dark:border-zinc-800 ${bracketProgress < 2 ? 'opacity-30' : 'opacity-65'}`}>
                <span className="block text-[8px] font-mono font-bold text-zinc-400 uppercase mb-2">COMBATE SEMIFINAL #02</span>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-zinc-450 font-black">
                    <span>🥋 Felipe Rocha</span>
                    {bracketProgress >= 3 && <span className="text-green-600 text-[10px]">✓</span>}
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-400">
                    <span>🥋 Lucas Lima</span>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 3: Grande Final */}
            <div className="min-w-[260px] space-y-24">
              <div className="text-center py-1 border-b border-zinc-100 dark:border-zinc-805">
                <span className="text-[9px] font-mono font-black text-orange-500 uppercase tracking-widest">Grande Final</span>
              </div>

              {/* A Grande Final */}
              <div className={`p-6 border ${bracketProgress === 3 ? 'border-orange-500/70 bg-orange-50/5 dark:bg-amber-955/10 ring-1 ring-orange-500/20' : 'border-zinc-200 dark:border-zinc-800'} ${bracketProgress < 3 ? 'opacity-30' : 'opacity-100'} relative`}>
                <span className="block text-[10px] font-mono font-black text-orange-500 uppercase mb-3 flex items-center gap-1">
                  <Sparkles size={11} className="animate-pulse" /> DISPUTA DO TÍTULO
                </span>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-black text-black dark:text-white">
                    <span className="text-orange-500 font-black">🥋 {userCompetitorName}</span>
                    {bracketProgress >= 4 && <span className="text-orange-500 text-[10px]">🥇 VENCEDOR</span>}
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-400 font-bold">
                    <span>🥋 Felipe Rocha</span>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 4: Pódio / Campeão */}
            <div className="min-w-[260px] space-y-12">
              <div className="text-center py-1 border-b border-zinc-100 dark:border-zinc-850">
                <span className="text-[9px] font-mono font-black text-amber-500 uppercase tracking-widest">O Campeão</span>
              </div>

              {bracketProgress === 4 ? (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-br from-amber-400 to-amber-500 border border-amber-300 p-6 text-center text-black shadow-xl shadow-amber-500/10 space-y-4"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Trophy size={32} className="text-amber-500 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-black tracking-widest text-[#5d3f00] uppercase block">PÓDIO MÁXIMO IBJJF</span>
                    <h4 className="text-sm font-black uppercase tracking-tight mt-1">{userCompetitorName}</h4>
                    <span className="text-[9px] font-mono font-black bg-[#5c4002] text-amber-200 px-2 py-0.5 mt-2 inline-block">CAMPEÃO DE OURO 🥇</span>
                  </div>
                  
                  <div className="pt-3 border-t border-[#8e6101]/20">
                    <Button
                      onClick={handleAwardFocusMedal}
                      className="w-full bg-black hover:bg-zinc-900 text-white rounded-none text-[8.5px] font-black uppercase tracking-widest py-3"
                    >
                      🎖️ Eternizar Ouro no Mural
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center text-zinc-400 opacity-40">
                  <Crown size={32} className="mx-auto text-zinc-300 dark:text-zinc-750 mb-2" />
                  <span className="block text-[8.5px] font-mono font-bold uppercase">Aguardando definição</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action simulators box */}
        <div className="mt-12 p-6 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="text-xs font-black uppercase tracking-tight text-black dark:text-white">
                Controle do Dia do Torneio (Simulador Técnico de Luta)
              </h4>
              <p className="text-[10px] text-zinc-400 mt-1 uppercase font-mono tracking-wider">
                Utilize os gatilhos rápidos para simular suas vitórias e testar o avanço das chaves em tempo real!
              </p>
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {bracketProgress === 1 && (
                <Button
                  onClick={() => {
                    setBracketProgress(2);
                    addSimulatedPoints('BONUS', "🥋 Quartas de Final IBJJF: Vitória por Finalização!", 100);
                  }}
                  className="rounded-none bg-black hover:bg-green-600 text-white text-[9px] font-black uppercase tracking-widest py-3 px-4 h-auto"
                >
                  ⚡ Avançar para Semifinais (+100 PTS)
                </Button>
              )}

              {bracketProgress === 2 && (
                <Button
                  onClick={() => {
                    setBracketProgress(3);
                    addSimulatedPoints('BONUS', "🥋 Semifinal IBJJF: Vitória por Vantagens!", 100);
                  }}
                  className="rounded-none bg-black hover:bg-green-600 text-white text-[9px] font-black uppercase tracking-widest py-3 px-4 h-auto"
                >
                  ⚡ Avançar para a Final (+100 PTS)
                </Button>
              )}

              {bracketProgress === 3 && (
                <Button
                  onClick={() => {
                    setBracketProgress(4);
                    addSimulatedPoints('BONUS', "🏆 Final de Campeonato IBJJF: Vitória por Armlock!", 150);
                  }}
                  className="rounded-none bg-orange-600 hover:bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest py-3 px-4 h-auto animate-pulse"
                >
                  🏆 CONFIRMAR TÍTULO DE OURO (+150 PTS)
                </Button>
              )}

              {bracketProgress > 1 && (
                <Button
                  onClick={() => {
                    setBracketProgress(1);
                  }}
                  variant="ghost"
                  className="rounded-none text-zinc-500 hover:text-red-500 text-[9px] font-black uppercase tracking-widest py-3 px-4 h-auto"
                >
                  Reiniciar Desempenho
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative min-h-screen bg-zinc-50/50 dark:bg-black text-black dark:text-white transition-colors duration-300 pb-20">
      {/* Background grain and Japanese print grid overlay matching landing */}
      <div className="grain" aria-hidden="true" />
      <div className="absolute inset-0 z-0 opacity-[0.03] select-none pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
      <div className="absolute inset-0 z-0 opacity-10 select-none pointer-events-none bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]" />

      <div className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Control Bar & Dynamic Interactive Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/10 dark:border-white/10">
          <nav aria-label="Navegação Estrutural" className="flex flex-wrap items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400">
            <button 
              onClick={() => onNavigate('LANDING')} 
              className="hover:text-green-600 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white px-3 py-1.5 shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#ffffff] font-bold"
              id="dashboard-back-to-landing-btn"
              title="Retornar à página inicial da OSS"
            >
              <ChevronLeft size={12} className="text-zinc-600 dark:text-zinc-300" />
              <span>← TATAME (INÍCIO)</span>
            </button>
            <span className="text-zinc-400">/</span>
            <button
              onClick={() => {
                setActiveTab('geral');
                playClickSound();
              }}
              className={`px-2.5 py-1 text-[9px] font-black tracking-widest border transition-all cursor-pointer ${
                activeTab === 'geral'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200'
              }`}
              title="Ir para a Visão Geral do Atleta"
            >
              PORTAL DO ATLETA HQ
            </button>
            {activeTab !== 'geral' && (
              <>
                <span className="text-zinc-400">/</span>
                <span className="bg-green-600 text-white px-2.5 py-1 text-[9px] font-black tracking-widest border border-green-700 uppercase flex items-center gap-1 shadow-sm">
                  <span>{activeTab === 'campeonatos' ? 'TORNEIOS' : activeTab === 'avaliacoes' ? 'AVALIAÇÕES & SERVIÇOS' : activeTab === 'fidelidade' ? 'FIDELIDADE' : activeTab === 'afiliado' ? 'INDICAÇÕES' : activeTab === 'dojo' ? 'DOJO & CT' : activeTab === 'lojista' ? 'LOJISTA' : activeTab === 'admin' ? 'MASTER HQ' : activeTab === 'notificacoes' ? 'NOTIFICAÇÕES PUSH' : 'LGPD'}</span>
                </span>
              </>
            )}
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Return Platform Jumpers */}
            <button
              onClick={() => onNavigate('SHOP')}
              className="hidden md:flex items-center gap-1.5 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white px-2.5 py-1.5 text-[9px] font-mono font-black uppercase tracking-widest shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#ffffff] transition-all cursor-pointer"
              title="Acessar o Catálogo e Loja de Kimonos"
            >
              <ShoppingBag size={11} />
              <span>LOJA</span>
            </button>
            <button
              onClick={() => onNavigate('COMPARATOR')}
              className="hidden md:flex items-center gap-1.5 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white px-2.5 py-1.5 text-[9px] font-mono font-black uppercase tracking-widest shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#ffffff] transition-all cursor-pointer"
              title="Comparador de Preços em Lojas do Jiu-Jitsu"
            >
              <Compass size={11} />
              <span>COMPARADOR</span>
            </button>
            <button
              onClick={() => onNavigate('BLOG')}
              className="hidden md:flex items-center gap-1.5 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white px-2.5 py-1.5 text-[9px] font-mono font-black uppercase tracking-widest shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#ffffff] transition-all cursor-pointer"
              title="Notícias e Artigos do Tatame"
            >
              <BookOpen size={11} />
              <span>NOTÍCIAS</span>
            </button>
            <button
              onClick={() => onNavigate('WISHLIST')}
              className="hidden md:flex items-center gap-1.5 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white px-2.5 py-1.5 text-[9px] font-mono font-black uppercase tracking-widest shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#ffffff] transition-all cursor-pointer"
              title="Acessar Favoritos e Alertas"
            >
              <Heart size={11} className={wishlistCount > 0 ? "fill-red-500 text-red-500" : ""} />
              <span>FAVORITOS ({wishlistCount})</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white px-3 py-1 text-[9px] font-mono font-black uppercase tracking-widest shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#ffffff]">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>STATUS:</span>
              <span className="text-green-600 dark:text-green-400">CONECTADO</span>
            </div>

            <button
              onClick={() => setTrainingFocusMode(true)}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white border-2 border-black dark:border-white px-3 py-1.5 text-[9px] font-mono font-black uppercase tracking-widest shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#ffffff] transition-all cursor-pointer"
              title="Ativar Modo Foco de Treino"
            >
              <Zap size={12} className="animate-pulse" />
              <span>MODO FOCO</span>
            </button>
          </div>
        </div>

        {/* Onboarding Checklist for First-time users and active roles */}
        <OnboardingChecklist
          user={user}
          role={(user?.role || 'atleta') as any}
          onNavigate={onNavigate}
          onAction={(actionId) => {
            if (actionId === 'OPEN_CHECKIN') {
              setStreak(prev => prev + 1);
              setPoints(prev => prev + 50);
              confetti({ particleCount: 100, spread: 70 });
              addToast('Check-in no tatame registrado com sucesso (+50 pts)!', 'success');
            } else if (actionId === 'gestor_schedules' || actionId === 'gestor_dojo_info' || actionId === 'gestor_students') {
              setActiveTab('dojo' as any);
            } else if (actionId === 'lojista_coupon' || actionId === 'lojista_size_chart' || actionId === 'lojista_metrics') {
              setActiveTab('lojista' as any);
            } else if (actionId === 'admin_moderation' || actionId === 'admin_push_test' || actionId === 'admin_metrics' || actionId === 'admin_lgpd_logs') {
              setActiveTab('admin' as any);
            }
          }}
          onAddPoints={(pts) => setPoints(prev => prev + pts)}
          addToast={addToast}
          playClickSound={playClickSound}
        />

        {/* Cinematic Athlete Identity Hero Header */}
        <div className="relative border-2 border-black dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] p-6 sm:p-8 md:p-10 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff] overflow-hidden">
          {/* Japanese Kanji Watermark */}
          <div className="absolute right-4 -bottom-6 text-black/5 dark:text-white/5 font-black text-8xl md:text-9xl pointer-events-none select-none font-serif tracking-widest -rotate-6">
            押忍
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Athlete Profile Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="relative shrink-0">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName} 
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-none border-2 border-black dark:border-white shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_#ffffff] object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 bg-black text-white dark:bg-white dark:text-black flex items-center justify-center border-2 border-black dark:border-white shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_#ffffff]">
                    <User size={48} />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-green-600 text-white border-2 border-black dark:border-white text-[8px] font-mono font-black uppercase px-2 py-0.5 shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#ffffff]">
                  {user.belt || 'FAIXA PRETA'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-[8.5px] font-mono font-black text-white bg-black dark:bg-white dark:text-black uppercase tracking-widest px-2.5 py-0.5 border border-black dark:border-white">
                    {effectiveRole === 'gestor' ? '🏢 DOJO & CT' : effectiveRole === 'lojista' ? '🛍️ MARCA PARCEIRA' : effectiveRole === 'admin' ? '🛡️ MASTER GLOBAL' : user.role === 'convidado' ? '👥 MODO DEGUSTAÇÃO' : '🥋 ATLETA TATAME'}
                  </span>
                  {user.dojo && (
                    <span className="text-[8.5px] font-mono font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 border border-zinc-300 dark:border-zinc-700">
                      📍 {user.dojo}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter italic -skew-x-6 text-black dark:text-white">
                  {user.displayName || 'Guerreiro OSS'}
                </h1>

                <p className="text-zinc-500 dark:text-zinc-400 font-mono text-[10px] uppercase tracking-widest">
                  {user.email} {user.storeBrandName ? `• ${user.storeBrandName}` : ''}
                </p>

                {/* Badges & Streak in Profile */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                  <div className="flex items-center gap-1.5 bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30 text-orange-600 dark:text-orange-400 px-3 py-1 text-[9px] font-mono font-black uppercase">
                    <Flame size={12} className="fill-current animate-bounce" />
                    <span>{streak} DIAS SEGUIDOS</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 text-green-700 dark:text-green-400 px-3 py-1 text-[9px] font-mono font-black uppercase">
                    <Award size={12} />
                    <span>{points} PONTOS OSS.OS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
              <Button
                onClick={() => {
                  setStreak(prev => prev + 1);
                  setPoints(prev => prev + 50);
                  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
                  playClickSound();
                  addToast('🥋 Check-in no tatame confirmado! +50 Pontos OSS.OS adicionados!', 'success');
                }}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white rounded-none border-2 border-black dark:border-white font-mono font-black uppercase text-[10px] tracking-widest px-5 py-3 shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_#ffffff] transition-all cursor-pointer flex items-center justify-center gap-2"
                id="header-checkin-btn"
              >
                <Flame size={14} className="animate-pulse" />
                <span>FAZER CHECK-IN DE HOJE (+50 PTS)</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => onNavigate('SHOP')}
                  className="flex-1 bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-none border-2 border-black dark:border-white font-mono font-black uppercase text-[9px] tracking-widest py-2.5 shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#ffffff] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag size={12} />
                  <span>LOJA</span>
                </Button>

                <Button
                  onClick={() => onNavigate('COMPARATOR')}
                  className="flex-1 bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-none border-2 border-black dark:border-white font-mono font-black uppercase text-[9px] tracking-widest py-2.5 shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#ffffff] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Compass size={12} />
                  <span>COMPARADOR</span>
                </Button>

                <Button
                  variant="ghost"
                  onClick={onSignOut}
                  className="bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-none border-2 border-red-300 dark:border-red-800 font-mono font-black uppercase text-[9px] tracking-widest py-2.5 px-3 shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#ffffff] transition-all cursor-pointer"
                  title="Encerrar Sessão"
                >
                  <LogOut size={12} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Card Intuitive Command Bento Hub */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bento 1: Tatame & Check-in */}
          <div className="bg-white dark:bg-[#0c0c0e] border-2 border-black dark:border-zinc-800 p-5 shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_#ffffff] flex flex-col justify-between group hover:border-green-600 transition-colors">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[8px] font-mono font-black uppercase tracking-widest bg-orange-500/10 text-orange-600 border border-orange-500/20 px-2 py-0.5">
                  🥋 PRESENÇA TATAME
                </span>
                <Flame size={14} className="text-orange-500" />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tight italic -skew-x-3 text-black dark:text-white">
                {streak} Treinos Seguidos
              </h4>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium leading-relaxed">
                Mantenha sua disciplina no tatame e desbloqueie graduações digitais exclusivas.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => {
                  setStreak(prev => prev + 1);
                  setPoints(prev => prev + 50);
                  confetti({ particleCount: 80, spread: 60 });
                  playClickSound();
                  addToast('Presença confirmada no tatame (+50 pts)!', 'success');
                }}
                className="w-full bg-black text-white dark:bg-white dark:text-black hover:bg-green-600 dark:hover:bg-green-600 hover:text-white py-2 text-[9px] font-mono font-black uppercase tracking-widest transition-colors cursor-pointer"
              >
                + Check-in (+50 pts)
              </button>
            </div>
          </div>

          {/* Bento 2: Comparador de Preços */}
          <div className="bg-white dark:bg-[#0c0c0e] border-2 border-black dark:border-zinc-800 p-5 shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_#ffffff] flex flex-col justify-between group hover:border-green-600 transition-colors">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[8px] font-mono font-black uppercase tracking-widest bg-blue-500/10 text-blue-600 border border-blue-500/20 px-2 py-0.5">
                  ⚖️ SCOUT DE PREÇOS
                </span>
                <Compass size={14} className="text-blue-500" />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tight italic -skew-x-3 text-black dark:text-white">
                Comparador Ativo
              </h4>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium leading-relaxed">
                Rastreamento em tempo real de ofertas de kimonos, faixas e rashguards.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => onNavigate('COMPARATOR')}
                className="w-full bg-white dark:bg-zinc-900 text-black dark:text-white border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black py-2 text-[9px] font-mono font-black uppercase tracking-widest transition-colors cursor-pointer"
              >
                Comparar Ofertas →
              </button>
            </div>
          </div>

          {/* Bento 3: Wishlist & Alertas */}
          <div className="bg-white dark:bg-[#0c0c0e] border-2 border-black dark:border-zinc-800 p-5 shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_#ffffff] flex flex-col justify-between group hover:border-green-600 transition-colors">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[8px] font-mono font-black uppercase tracking-widest bg-red-500/10 text-red-600 border border-red-500/20 px-2 py-0.5">
                  ❤️ DESEJOS & RADAR
                </span>
                <Heart size={14} className="text-red-500 fill-red-500" />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tight italic -skew-x-3 text-black dark:text-white">
                {wishlistCount} Itens Salvos
              </h4>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium leading-relaxed">
                {alertsCount > 0 ? `${alertsCount} alertas de menor preço configurados.` : 'Monitore quedas de preço e promoções relâmpago.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => onNavigate('WISHLIST')}
                className="w-full bg-white dark:bg-zinc-900 text-black dark:text-white border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black py-2 text-[9px] font-mono font-black uppercase tracking-widest transition-colors cursor-pointer"
              >
                Ver Favoritos →
              </button>
            </div>
          </div>

          {/* Bento 4: Fidelidade & Pontos */}
          <div className="bg-white dark:bg-[#0c0c0e] border-2 border-black dark:border-zinc-800 p-5 shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_#ffffff] flex flex-col justify-between group hover:border-yellow-500 transition-colors">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[8px] font-mono font-black uppercase tracking-widest bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 px-2 py-0.5 flex items-center gap-1">
                  <Trophy size={11} className="fill-current text-yellow-500" />
                  FIDELIDADE & TROFÉUS
                </span>
                <span className="text-[9px] font-mono font-bold text-yellow-600 dark:text-yellow-400">
                  {reachedMilestones.length} Troféus
                </span>
              </div>
              <h4 className="text-xl font-black uppercase tracking-tight italic -skew-x-3 text-black dark:text-white">
                {points} Pontos OSS
              </h4>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium leading-relaxed">
                {LOYALTY_MILESTONES.find(m => points < m.points) 
                  ? `Faltam ${Math.max(0, (LOYALTY_MILESTONES.find(m => points < m.points)?.points || 0) - points)} pts para o troféu ${LOYALTY_MILESTONES.find(m => points < m.points)?.title}.`
                  : 'Todos os troféus e marcos de fidelidade alcançados!'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
              <button
                onClick={() => {
                  playClickSound();
                  setActiveTab('fidelidade');
                }}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-2 text-[9px] font-mono font-black uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm"
              >
                <Trophy size={11} className="fill-black" />
                <span>Ver Troféus & Marcos →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Banner: Central de Avaliações & Serviços */}
        <div className="bg-gradient-to-r from-amber-500/10 via-zinc-50 to-amber-500/10 dark:from-amber-950/20 dark:via-zinc-900/40 dark:to-amber-950/20 border-2 border-black dark:border-zinc-800 p-4 sm:p-5 shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_#ffffff] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-black border border-black shadow-sm shrink-0">
              <Star className="fill-black" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-black uppercase text-amber-700 dark:text-amber-400">
                  RECONHECIMENTO TÉCNICO
                </span>
                <span className="text-[9px] font-mono text-zinc-400">•</span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase">
                  +50 PTS POR REVIEW
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black uppercase text-black dark:text-white">
                Avalie os Produtos e Serviços que Adquiriu
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl">
                Dê notas de 1 a 5 estrelas e escreva comentários sobre kimonos, rashguards, workshops, matrículas em dojos e consultorias esportivas contratadas.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('avaliacoes');
            }}
            className="shrink-0 px-4 py-2.5 bg-black text-white dark:bg-white dark:text-black hover:bg-green-600 hover:text-white dark:hover:bg-green-600 dark:hover:text-white text-[10px] font-mono font-black uppercase tracking-wider border border-black dark:border-white shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#ffffff] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Ver Minhas Avaliações →</span>
          </button>
        </div>

        {/* Role Perspective Switcher (POV Selector) */}
        <div className="bg-zinc-100 dark:bg-zinc-900 border-2 border-black dark:border-zinc-800 p-4 shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_#ffffff]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                PERSPECTIVA DE ACESSO (POV):
              </span>
              <span className="text-[9px] font-mono font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 border border-green-500/20 uppercase">
                {effectiveRole === 'atleta' ? 'Atleta & Competidor' : effectiveRole === 'gestor' ? 'Professor & Gestor de CT' : effectiveRole === 'lojista' ? 'Lojista & Marca Parceira' : 'Administrador Master HQ'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {[
                { id: 'atleta', label: '🥋 Atleta Tatame', tab: 'geral' },
                { id: 'gestor', label: '🏢 Gestor Dojo & CT', tab: 'dojo' },
                { id: 'lojista', label: '🛍️ Lojista Parceiro', tab: 'lojista' },
                { id: 'admin', label: '🛡️ Master HQ', tab: 'admin' }
              ].map((r) => {
                const isSelected = effectiveRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSimulatedRole(r.id as any);
                      setActiveTab(r.tab as any);
                      playClickSound();
                      addToast(`Modo de visualização alterado para: ${r.label}!`, 'info');
                    }}
                    className={`flex-1 md:flex-initial px-3 py-1.5 text-[9px] font-mono font-black uppercase tracking-widest border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#ffffff]'
                        : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="border-b-2 border-black dark:border-zinc-800 flex items-center gap-2 overflow-x-auto no-scrollbar pt-2">
          {[
            { id: 'geral', label: '📊 Visão Geral & Atividades' },
            { id: 'alertas', label: '🔔 Central de Alertas' },
            { id: 'notificacoes', label: '⚙️ Configurações Push & Tópicos' },
            ...(effectiveRole === 'gestor' || user?.role === 'gestor' ? [{ id: 'dojo', label: '🏢 Gestão do Dojo & CT' }] : []),
            ...(effectiveRole === 'lojista' || user?.role === 'lojista' ? [{ id: 'lojista', label: '🛍️ Painel do Lojista' }] : []),
            ...(effectiveRole === 'admin' || user?.role === 'admin' ? [{ id: 'admin', label: '🛡️ Gestão Master' }] : []),
            { id: 'campeonatos', label: '🏆 Torneios & Medalhas' },
            { id: 'avaliacoes', label: '⭐ Avaliações & Serviços' },
            { id: 'fidelidade', label: '🎁 Fidelidade & Cupons' },
            { id: 'afiliado', label: '🤝 Minhas Indicações' },
            { id: 'privacidade', label: '🇧🇷 Privacidade & LGPD' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-5 py-3 text-[10px] font-mono font-black uppercase tracking-widest whitespace-nowrap transition-all cursor-pointer border-t-2 border-x-2 -mb-[2px] ${
                  isActive 
                    ? 'bg-white dark:bg-[#0c0c0e] text-black dark:text-white border-black dark:border-zinc-700 shadow-[2px_-2px_0px_#000000] dark:shadow-[2px_-2px_0px_#ffffff]' 
                    : 'bg-transparent text-zinc-500 hover:text-black dark:hover:text-white border-transparent'
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.span 
                    layoutId="activeDashboardTab" 
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-green-600"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Main Tab Content Display */}
        <div className="bg-white dark:bg-[#0c0c0e] border-2 border-black dark:border-zinc-800 p-6 sm:p-8 md:p-10 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff]">
          <AnimatePresence mode="wait">
            {activeTab === 'geral' && (
              <motion.div
                key="geral"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-10"
              >
                <section>
                    <h4 className="text-xs font-black uppercase tracking-tighter mb-8 pb-2 border-b border-zinc-100 dark:border-zinc-800">Atividade Recente</h4>
                    <div className="space-y-4">
                      {[
                        { type: 'ALERT', label: 'Alerta de preço ativado: Kimono KVRA', time: 'Há 5 min' },
                        { type: 'REVIEW', label: 'Avaliou Kimono Venum Elite', time: 'Há 2 horas' },
                        { type: 'WISHLIST', label: 'Salvou Faixa Azul Atama', time: 'Há 1 dia' },
                        { type: 'LOGIN', label: 'Login realizado via Google', time: 'Há 3 dias' },
                      ].map((act, i) => (
                        <div key={i} className="flex items-center justify-between py-4 border-b border-zinc-50 dark:border-zinc-900 last:border-0">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-400">
                              {act.type === 'REVIEW' ? <Star size={12} /> : act.type === 'WISHLIST' ? <Heart size={12} /> : act.type === 'ALERT' ? <Bell size={12} className="text-green-600" /> : <Settings size={12} />}
                            </div>
                            <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">{act.label}</span>
                          </div>
                          <span className="text-[9px] font-mono text-zinc-400">{act.time}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Gráfico de Interesse do Usuário / Timeline */}
                  <section className="p-6 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-black dark:text-white flex items-center gap-2">
                          <Compass size={14} className="text-green-600 animate-spin-slow shrink-0" /> Linha do Tempo e Curva de Interesse
                          <InfoTooltip text="Gráfico analítico que rastreia a intensidade e o engajamento dos seus cliques para estimar quais equipamentos você mais deseja no momento." position="top" />
                        </h4>
                        <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-tight">
                          Alinhamento visual com seus hábitos de navegação. Retome produtos que você parou de contemplar para otimizar seus treinos.
                        </p>
                      </div>
                      <Badge className="bg-green-600 text-white rounded-none border-none text-[8px] font-black uppercase tracking-widest px-2.5 py-1">
                        {viewedProductIds.length > 0 ? "MAPEAMENTO ATIVO" : "HISTÓRICO RECOMENDADO"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Graphics Area Chart */}
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-7 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-855 p-4 sm:p-5 flex flex-col justify-between"
                      >
                        <div className="mb-4">
                          <span className="text-[9px] font-mono font-black uppercase tracking-widest text-zinc-400">FLUXO DE INTENSIDADE DE INTERESSE</span>
                          <h5 className="text-sm font-black uppercase tracking-tight text-black dark:text-white mt-1">Oscilação de Vontade</h5>
                        </div>
                        
                        <div className="h-60 w-full font-mono text-[9px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                              <XAxis dataKey="name" stroke="#71717a" tickLine={false} />
                              <YAxis stroke="#71717a" domain={[0, 100]} tickLine={false} />
                              <RechartsTooltip 
                                contentStyle={{ 
                                  backgroundColor: '#09090b', 
                                  borderColor: '#27272a',
                                  color: '#fff',
                                  fontSize: '10px',
                                  textTransform: 'uppercase',
                                  fontFamily: 'monospace'
                                }} 
                              />
                              <Line 
                                type="monotone" 
                                dataKey="Interesse (%)" 
                                stroke="#22c55e" 
                                strokeWidth={3} 
                                dot={{ fill: '#22c55e', strokeWidth: 1 }}
                                activeDot={{ r: 6 }} 
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="text-[8px] font-mono uppercase text-zinc-400 mt-4 text-center leading-relaxed">
                          * Algoritmo OSS.OS mapeando a fadiga de interesse por tempo de abandono de tela.
                        </p>
                      </motion.div>

                      {/* Visual Timeline Cards list */}
                      <div className="lg:col-span-5 flex flex-col gap-4">
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white">ORDEM CRONOLÓGICA DAS REFLEXÕES</span>
                          <span className="text-[9px] font-mono text-zinc-400">Foco Recente &gt; Antigo</span>
                        </div>
                        
                        <div className="space-y-4 max-h-[290px] overflow-y-auto pr-1">
                          {resolvedViewedProducts.map((p, index) => {
                            const isRecommended = p.status === 'RETOMAR' || p.status === 'SUGERIDO';
                            return (
                              <motion.div 
                                key={p.id + '-' + index} 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                                whileHover={{ scale: 1.015, y: -2 }}
                                className={`relative border p-4 bg-white dark:bg-zinc-950 flex items-start gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all ${
                                  isRecommended 
                                    ? 'border-green-500/35 dark:border-green-550/30 shadow-[0_0_12px_rgba(34,197,94,0.06)]' 
                                    : 'border-zinc-100 dark:border-zinc-900'
                                }`}
                              >
                                {/* Left visual line dot indicator */}
                                <div className={`absolute top-0 bottom-0 left-0 w-1 ${isRecommended ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-green-500'}`} />
                                
                                <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-900 shrink-0 border border-zinc-100 dark:border-zinc-850 flex items-center justify-center rounded overflow-hidden">
                                  {p.imageUrl ? (
                                    <ImageOptimization src={p.imageUrl} alt={p.title || ''} widthForce={80} quality={75} containerClassName="w-full h-full" className="w-full h-full object-cover" />
                                  ) : (
                                    <ShoppingBag size={14} className="text-zinc-500" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 text-[8px] font-mono">
                                    <span className="text-zinc-400 uppercase tracking-tight">{p.simulatedTime}</span>
                                    
                                    {p.status === 'ATIVO' && <span className="px-1.5 py-0.5 rounded-none bg-green-500/10 text-green-600 border border-green-500/10 uppercase font-black tracking-wider">Foco Ativo</span>}
                                    {p.status === 'MORNO' && <span className="px-1.5 py-0.5 rounded-none bg-amber-500/10 text-amber-600 border border-amber-500/10 uppercase font-black tracking-wider">Esfriando</span>}
                                    {p.status === 'RETOMAR' && <span className="px-1.5 py-0.5 rounded-none bg-rose-500/10 text-rose-600 border border-rose-500/10 uppercase font-black tracking-wider animate-pulse">Retomar Recomendado</span>}
                                    {p.status === 'SUGERIDO' && <span className="px-1.5 py-0.5 rounded-none bg-green-600/15 text-green-600 border border-green-600/20 uppercase font-black tracking-wider">Recomendado</span>}
                                  </div>

                                  <h6 className="text-[11px] font-black uppercase tracking-tight text-black dark:text-white truncate mt-1">{p.title}</h6>
                                  <div className="flex justify-between items-center mt-2">
                                    <span className="text-[9.5px] font-mono text-green-600 font-bold">R$ {p.price.toFixed(2)}</span>
                                    <button 
                                      onClick={() => {
                                        onNavigate('SHOP');
                                      }}
                                      className={`text-[8px] font-mono font-black py-1 px-2.5 uppercase transition-all rounded-none ${
                                        isRecommended 
                                          ? 'bg-green-600 text-white hover:bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.35)]' 
                                          : 'bg-black dark:bg-white text-white dark:text-black hover:bg-green-600 dark:hover:bg-green-600 dark:hover:text-white'
                                      }`}
                                    >
                                      RETOMAR FOCO →
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="p-6 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-black dark:text-white flex items-center gap-2">
                          <Award size={14} className="text-green-600" /> Emblemas de Consistência (Check-ins de Tatame)
                        </h4>
                        <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-tight">Fidelize seus treinos presenciais nas academias cadastradas para moldar conquistas primorosas.</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            incrementCheckInStreak(streak);
                          }}
                          className="h-8 rounded-none border-zinc-300 dark:border-zinc-700 hover:border-black text-[8px] font-black uppercase tracking-widest px-3"
                        >
                          ⚡ Simular Check-in (+1 Sequência)
                        </Button>
                        {streak > 0 && (
                          <Button
                            variant="ghost"
                            onClick={() => {
                              if (confirm("Deseja mesmo zerar sua sequência de check-ins?")) {
                                setStreak(0);
                                localStorage.setItem('oss_checkin_streak', '0');
                              }
                            }}
                            className="h-8 rounded-none text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 text-[8px] font-black uppercase tracking-widest px-3 pointer-events-auto cursor-pointer"
                          >
                            Zerar Sequência
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {ALL_BADGES.map((badge) => {
                        const isUnlocked = streak >= badge.streakRequired;
                        const progressionPercent = Math.min(100, (streak / badge.streakRequired) * 100);
                        
                        return (
                          <div 
                            key={badge.id} 
                            className={`p-5 border transition-all flex flex-col justify-between ${
                              isUnlocked 
                                ? 'bg-gradient-to-br from-zinc-50 to-zinc-100/30 dark:from-zinc-900 dark:to-zinc-950/30 border-green-600/40 shadow-md ring-1 ring-green-600/10' 
                                : 'bg-transparent border-zinc-200 dark:border-zinc-800 opacity-60'
                            }`}
                          >
                            <div>
                              <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 bg-gradient-to-r ${isUnlocked ? badge.color : 'from-zinc-400 to-zinc-550'} flex items-center justify-center shadow-md`}>
                                  {getBadgeIcon(badge.icon, "w-5 h-5 text-white")}
                                </div>
                                <Badge className={`rounded-none text-[8px] font-black font-mono uppercase tracking-wider ${
                                  isUnlocked 
                                    ? 'bg-green-600 text-white animate-pulse' 
                                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                                }`}>
                                  {isUnlocked ? 'CONQUISTADO ✓' : 'BLOQUEADO'}
                                </Badge>
                              </div>

                              <h5 className="text-xs font-black uppercase text-black dark:text-white tracking-tight mb-1">{badge.title}</h5>
                              <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider mb-2">Exigência: {badge.requirement}</p>
                              <p className="text-[11px] text-zinc-550 leading-relaxed mb-6 font-medium">{badge.description}</p>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[8px] font-mono font-black uppercase text-zinc-400">
                                <span>Progresso Individual</span>
                                <span>{Math.min(streak, badge.streakRequired)}/{badge.streakRequired} TREINOS</span>
                              </div>
                              <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-805 overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progressionPercent}%` }}
                                  className={`h-full ${isUnlocked ? 'bg-green-600' : 'bg-zinc-400 dark:bg-zinc-650'}`}
                                  transition={{ duration: 1, ease: 'easeOut' }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* SEÇÃO NOVA: Evolução do Tempo de Treino Mensal (Recharts BarChart) */}
                  <section className="p-6 border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 shadow-sm space-y-8" id="secao-treino-mensal">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-black dark:text-white flex items-center gap-2">
                          <Clock size={14} className="text-green-600 animate-pulse" /> Evolução do Tempo de Treino Mensal
                        </h4>
                        <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-tight">
                          Comparação direta das horas totais no tatame por mês (Ano Atual vs. Ano Anterior)
                        </p>
                      </div>
                      
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          onClick={() => setShowAddTraining(!showAddTraining)}
                          className="h-8 rounded-none border-dashed border-zinc-350 hover:border-black text-[8px] font-black uppercase tracking-widest px-3 flex items-center gap-1"
                        >
                          <Plus size={11} /> {showAddTraining ? 'Fechar Painel' : 'Registrar Sessão'}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={handleResetTrainingLogs}
                          className="h-8 rounded-none text-zinc-400 hover:text-black hover:bg-zinc-50 dark:hover:bg-zinc-900 text-[8px] font-black uppercase tracking-widest px-3"
                        >
                          Resetar Histórico
                        </Button>
                      </div>
                    </div>

                    {/* Expandable Register Training Session Form */}
                    <AnimatePresence>
                      {showAddTraining && (
                        <motion.form 
                          onSubmit={handleAddTrainingLog}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-zinc-50/50 dark:bg-zinc-900/10 p-6 border border-zinc-200 dark:border-zinc-800 space-y-4 overflow-hidden"
                        >
                          <h5 className="text-[10px] font-black uppercase tracking-wider text-green-600 flex items-center gap-1.5 label-registration">
                            🥋 REGISTRAR NOVA SESSÃO NO SISTEMA
                          </h5>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-[8px] font-mono font-black uppercase text-zinc-400 mb-1">Duração (Minutos)</label>
                              <input
                                type="number"
                                min="10"
                                max="480"
                                required
                                value={trainingDuration}
                                onChange={(e) => setTrainingDuration(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs p-3 font-mono font-bold rounded-none"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-[8px] font-mono font-black uppercase text-zinc-400 mb-1">Tipo de Sparing / Treino</label>
                              <select
                                value={trainingType}
                                onChange={(e) => setTrainingType(e.target.value as any)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs p-3 font-bold rounded-none"
                              >
                                <option value="GI">Kimono (Gi)</option>
                                <option value="NOGI">No-Gi (Sem Kimono)</option>
                                <option value="DRILL">Drills (Técnico)</option>
                                <option value="SPARRING">Rola (Sparring)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[8px] font-mono font-black uppercase text-zinc-400 mb-1">Selecione o Mês</label>
                              <select
                                value={trainingMonth}
                                onChange={(e) => setTrainingMonth(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs p-3 font-bold rounded-none"
                              >
                                <option value="1">Janeiro</option>
                                <option value="2">Fevereiro</option>
                                <option value="3">Março</option>
                                <option value="4">Abril</option>
                                <option value="5">Maio</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[8px] font-mono font-black uppercase text-zinc-400 mb-1">Selecione o Ano</label>
                              <select
                                value={trainingYear}
                                onChange={(e) => setTrainingYear(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs p-3 font-bold rounded-none"
                              >
                                <option value="2025">Ano Anterior (2025)</option>
                                <option value="2026">Ano Atual (2026)</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex justify-end pt-2">
                            <Button
                              type="submit"
                              className="bg-green-600 hover:bg-green-500 text-white rounded-none text-[8px] font-black uppercase tracking-widest px-4 py-3 h-auto"
                            >
                              ✓ Confirmar Sessão & Somar Pontos (+50 PTS)
                            </Button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>

                    {/* Stats metrics highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-4 border border-zinc-100 dark:border-zinc-900 bg-zinc-50/30">
                        <span className="block text-[8px] font-mono font-black uppercase text-zinc-400">Total Treinado em 2026 (Maio YTD)</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-xl font-black">{parseFloat((trainingLogs.filter(l => l.date.split('-')[0] === '2026').reduce((acc, l) => acc + l.duration, 0) / 60).toFixed(1))}h</span>
                          <span className="text-[9px] font-bold text-zinc-400 uppercase">Horas Totais</span>
                        </div>
                      </div>

                      <div className="p-4 border border-zinc-100 dark:border-zinc-900 bg-zinc-50/30">
                        <span className="block text-[8px] font-mono font-black uppercase text-zinc-400">Sessões Praticadas</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-xl font-black">{trainingLogs.filter(l => l.date.split('-')[0] === '2026').length}</span>
                          <span className="text-[9px] font-bold text-zinc-400 uppercase">Check-ins Registrados</span>
                        </div>
                      </div>

                      <div className="p-4 border border-zinc-100 dark:border-zinc-900 bg-zinc-50/30">
                        <span className="block text-[8px] font-mono font-black uppercase text-zinc-400">Evolução de Esforço</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          {(() => {
                            const h2025 = trainingLogs.filter(l => {
                              const parts = l.date.split('-');
                              return parts[0] === '2025' && parseInt(parts[1], 10) <= 5;
                            }).reduce((acc, l) => acc + l.duration, 0) / 60;
                            const h2026 = trainingLogs.filter(l => {
                              const parts = l.date.split('-');
                              return parts[0] === '2026' && parseInt(parts[1], 10) <= 5;
                            }).reduce((acc, l) => acc + l.duration, 0) / 60;
                            const growth = h2025 > 0 ? Math.round(((h2026 - h2025) / h2025) * 100) : 0;
                            return (
                              <>
                                <span className={`text-xl font-black ${growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                  {growth >= 0 ? `+${growth}%` : `${growth}%`}
                                </span>
                                <span className="text-[9px] font-bold text-zinc-400 uppercase">vs. Período Anterior</span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Chart Container */}
                    <div className="w-full bg-zinc-50/40 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-900 p-4 min-h-[350px]">
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart
                          data={monthlyTrainingData}
                          margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                          <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            className="font-mono uppercase tracking-wider"
                          />
                          <YAxis
                            stroke="#888888"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            className="font-mono"
                            unit="h"
                          />
                          <RechartsTooltip
                            content={({ active, payload, label }: any) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-4 shadow-xl rounded-none animate-fade-in">
                                    <p className="text-[9px] font-mono font-black uppercase tracking-widest text-zinc-400 mb-2">{label}</p>
                                    <div className="space-y-1.5">
                                      {payload.map((entry: any, index: number) => (
                                        <div key={index} className="flex items-center gap-4 justify-between">
                                          <div className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5" style={{ backgroundColor: entry.color }} />
                                            <span className="text-[9.5px] uppercase font-black tracking-tight text-zinc-650 dark:text-zinc-405">{entry.name}:</span>
                                          </div>
                                          <span className="text-[11px] font-mono font-black text-black dark:text-white">{entry.value}h</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend
                            verticalAlign="top"
                            height={36}
                            iconType="square"
                            iconSize={8}
                            formatter={(value) => <span className="text-[9px] uppercase font-black tracking-widest text-zinc-700 dark:text-zinc-300 ml-1 mr-3">{value}</span>}
                          />
                          <Bar dataKey="Ano Anterior (2025)" fill="#a1a1aa" radius={[0, 0, 0, 0]}>
                            {monthlyTrainingData.map((entry, index) => (
                              <Cell key={`cell-prev-${index}`} className="fill-zinc-300 dark:fill-zinc-700 hover:fill-zinc-400 dark:hover:fill-zinc-600 transition-all duration-200" />
                            ))}
                          </Bar>
                          <Bar dataKey="Ano Atual (2026)" fill="#16a34a" radius={[0, 0, 0, 0]}>
                            {monthlyTrainingData.map((entry, index) => (
                              <Cell key={`cell-curr-${index}`} className="fill-green-600 dark:fill-green-550 hover:fill-green-500 dark:hover:fill-green-450 transition-all duration-200" />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </section>

                  {/* SEÇÃO NOVA: Análise de Frequência e Consistência Semanal (Recharts Bar & Line Chart) */}
                  <section className="p-6 border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 shadow-sm space-y-8" id="secao-frequencia-semanal">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-black dark:text-white flex items-center gap-2">
                          <Trophy size={14} className="text-green-600 animate-pulse" /> Frequência & Consistência Semanal de Treinos
                        </h4>
                        <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-tight">
                          Distribuição de presença semanal por dia da semana e histórico longitudinal das últimas 8 semanas
                        </p>
                      </div>

                      {/* Mini Indicadores de Performance */}
                      <div className="flex flex-wrap gap-4 pt-2 sm:pt-0">
                        <div className="text-right">
                          <span className="block text-[8px] font-mono text-zinc-400 uppercase">Média Semanal (2026)</span>
                          <span className="text-xs font-black text-black dark:text-white">
                            {(() => {
                              const totalTreinos2026 = weekdayFrequencyData.reduce((acc, d) => acc + d.TOTAL, 0);
                              return (totalTreinos2026 / 21).toFixed(1); // 21 semanas estimadas de 2026 até o momento
                            })()} treinos/sem
                          </span>
                        </div>
                        <div className="text-right border-l border-zinc-100 dark:border-zinc-800 pl-4">
                          <span className="block text-[8px] font-mono text-zinc-400 uppercase">Dia Favorito</span>
                          <span className="text-xs font-black text-green-600">
                            {(() => {
                              const maxDay = [...weekdayFrequencyData].sort((a, b) => b.TOTAL - a.TOTAL)[0];
                              return maxDay ? maxDay.name : 'N/A';
                            })()}
                          </span>
                        </div>
                        <div className="text-right border-l border-zinc-100 dark:border-zinc-800 pl-4">
                          <span className="block text-[8px] font-mono text-zinc-400 uppercase">Modalidade Preferida</span>
                          <span className="text-xs font-black text-black dark:text-white uppercase font-mono">
                            {(() => {
                              const typesCount = { GI: 0, NOGI: 0, DRILL: 0, SPARRING: 0 };
                              trainingLogs.filter(l => l.date.startsWith('2026')).forEach(l => {
                                if (typesCount[l.type] !== undefined) typesCount[l.type]++;
                              });
                              const favType = Object.entries(typesCount).sort((a, b) => b[1] - a[1])[0];
                              return favType ? favType[0] : 'N/A';
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Sub-painel 1: Distribuição de Treinos por Dia da Semana (Stacked Bar) */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-baseline">
                          <h5 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                            🥋 Sessões por Dia da Semana (2026)
                          </h5>
                          <span className="text-[9px] font-mono font-black text-zinc-500 uppercase tracking-widest">ESTATÍSTICAS POR MODALIDADE</span>
                        </div>

                        <div className="w-full bg-zinc-50/40 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-900 p-4 min-h-[300px] hover:border-zinc-200 dark:hover:border-zinc-850 transition-colors">
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                              data={weekdayFrequencyData}
                              margin={{ top: 15, right: 10, left: -25, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" className="dark:stroke-zinc-905" />
                              <XAxis 
                                dataKey="name" 
                                stroke="#888888" 
                                fontSize={9} 
                                tickLine={false} 
                                axisLine={false} 
                                className="font-mono font-semibold"
                              />
                              <YAxis 
                                stroke="#888888" 
                                fontSize={9} 
                                tickLine={false} 
                                axisLine={false} 
                                className="font-mono"
                                allowDecimals={false}
                              />
                              <RechartsTooltip 
                                cursor={{ fill: 'rgba(22, 163, 74, 0.04)' }}
                                content={({ active, payload, label }: any) => {
                                  if (active && payload && payload.length) {
                                    const total = payload.reduce((acc: number, entry: any) => acc + (entry.value || 0), 0);
                                    return (
                                      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-3 shadow-xl rounded-none font-sans">
                                        <p className="text-[9px] font-mono font-black uppercase text-green-605 mb-1">{label}</p>
                                        <div className="space-y-1 my-1 border-b border-zinc-100 dark:border-zinc-800 pb-1">
                                          {payload.map((entry: any) => {
                                            if (entry.value === 0) return null;
                                            return (
                                              <div key={entry.name} className="flex justify-between items-center gap-4 text-[10px]">
                                                <span className="flex items-center gap-1.5 text-zinc-550 font-bold uppercase">
                                                  <span className="h-1.5 w-1.5" style={{ backgroundColor: entry.color }} />
                                                  {entry.name}:
                                                </span>
                                                <span className="font-black text-black dark:text-white">{entry.value} sessões</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                        <p className="text-[10px] font-black text-black dark:text-white flex justify-between items-center bg-zinc-50 dark:bg-zinc-850 p-1.5">
                                          <span>TOTAL:</span>
                                          <span>{total} sessões</span>
                                        </p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Legend
                                verticalAlign="top"
                                height={36}
                                iconType="square"
                                iconSize={8}
                                formatter={(value) => <span className="text-[9px] uppercase font-black tracking-widest text-zinc-700 dark:text-zinc-350 ml-1 mr-3">{value}</span>}
                              />
                              <Bar dataKey="GI" stackId="a" fill="#27272a" />
                              <Bar dataKey="NOGI" stackId="a" fill="#ea580c" />
                              <Bar dataKey="DRILL" stackId="a" fill="#2563eb" />
                              <Bar dataKey="SPARRING" stackId="a" fill="#ca8a04" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Sub-painel 2: Consistência Longitudinal (Lines of last 8 weeks) */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-baseline">
                          <h5 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                            📈 Consistência de Presença (Últimas 8 Semanas)
                          </h5>
                          <span className="text-[9px] font-mono font-black text-zinc-500 uppercase tracking-widest">METAS DE LONGO PRAZO</span>
                        </div>

                        <div className="w-full bg-zinc-50/40 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-900 p-4 min-h-[300px] hover:border-zinc-200 dark:hover:border-zinc-850 transition-colors">
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                              data={weeklyTrendData}
                              margin={{ top: 15, right: 10, left: -25, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" className="dark:stroke-zinc-905" />
                              <XAxis 
                                dataKey="name" 
                                stroke="#888888" 
                                fontSize={9} 
                                tickLine={false} 
                                axisLine={false} 
                                className="font-mono font-semibold"
                              />
                              <YAxis 
                                stroke="#888888" 
                                fontSize={9} 
                                tickLine={false} 
                                axisLine={false} 
                                className="font-mono"
                                allowDecimals={false}
                              />
                              <RechartsTooltip 
                                content={({ active, payload, label }: any) => {
                                  if (active && payload && payload.length) {
                                    const count = payload[0].value;
                                    const isGoalMet = count >= 3;
                                    return (
                                      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-3 shadow-xl rounded-none font-sans">
                                        <p className="text-[9px] font-mono font-black uppercase text-zinc-400 mb-1">Semana: {label}</p>
                                        <p className="text-xs font-black text-black dark:text-white mb-2">
                                          Presenças: <span className="text-green-600 font-mono">{count} sessões</span>
                                        </p>
                                        <Badge className={`rounded-none text-[8px] font-black uppercase tracking-wider ${
                                          isGoalMet 
                                            ? 'bg-green-600 text-white' 
                                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-450'
                                        }`}>
                                          {isGoalMet ? '✓ META DE 3 SESSÕES ATINGIDA' : '🔕 ABAIXO DA META DE 3'}
                                        </Badge>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="Treinos" 
                                stroke="#16a34a" 
                                strokeWidth={3} 
                                dot={{ r: 4, stroke: '#16a34a', strokeWidth: 1, fill: '#fff' }}
                                activeDot={{ r: 6, stroke: '#16a34a', strokeWidth: 2, fill: '#16a34a' }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-xs font-black uppercase tracking-tighter mb-6">Links de Rapidez</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button 
                        onClick={() => onNavigate('SHOP')}
                        className="group p-6 text-left border border-zinc-100 dark:border-zinc-800 hover:bg-black hover:text-white transition-all flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <ShoppingBag size={20} className="text-green-600 group-hover:text-white" />
                          <div>
                            <span className="block text-[10px] font-black uppercase tracking-widest">Loja BJJ</span>
                            <span className="block text-[8px] opacity-50 uppercase tracking-tight">Continuar Compras</span>
                          </div>
                        </div>
                        <ChevronRight size={16} />
                      </button>
                      <button 
                        onClick={() => onNavigate('ABOUT')}
                        className="group p-6 text-left border border-zinc-100 dark:border-zinc-800 hover:bg-black hover:text-white transition-all flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <Award size={20} className="text-zinc-400 group-hover:text-white" />
                          <div>
                            <span className="block text-[10px] font-black uppercase tracking-widest">Sobre o Projeto</span>
                            <span className="block text-[8px] opacity-50 uppercase tracking-tight">Missão & Visão</span>
                          </div>
                        </div>
                        <ChevronRight size={16} />
                      </button>

                      {/* Dual Alert & Push Notification Cards */}
                      <button 
                        onClick={() => {
                          setActiveTab('alertas');
                          playClickSound();
                        }}
                        className="group p-5 text-left border-2 border-red-600/30 hover:border-red-600 bg-red-500/5 hover:bg-black hover:text-white transition-all flex items-center justify-between cursor-pointer"
                        id="btn-shortcut-alerts-center"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="p-3 bg-red-600 text-white rounded-none">
                            <BellRing size={20} className="animate-pulse" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="block text-[11px] font-black uppercase tracking-widest">Central de Alertas</span>
                              <span className="text-[7.5px] font-mono font-bold uppercase bg-red-600 text-white px-1.5 py-0.2">Painel Interativo</span>
                            </div>
                            <span className="block text-[9px] opacity-70 uppercase tracking-tight mt-0.5">
                              Histórico de notificações enviadas & interruptores ON/OFF por produto
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] font-mono font-black uppercase text-red-600 group-hover:text-white">Gerenciar →</span>
                          <ChevronRight size={16} />
                        </div>
                      </button>

                      <button 
                        onClick={() => {
                          setActiveTab('notificacoes');
                          playClickSound();
                        }}
                        className="group p-5 text-left border-2 border-amber-600/30 hover:border-amber-600 bg-amber-500/5 hover:bg-black hover:text-white transition-all flex items-center justify-between cursor-pointer"
                        id="btn-shortcut-push-settings"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="p-3 bg-amber-600 text-white rounded-none">
                            <Sparkles size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="block text-[11px] font-black uppercase tracking-widest">Tópicos por Categoria</span>
                              <span className="text-[7.5px] font-mono font-bold uppercase bg-amber-600 text-white px-1.5 py-0.2">Auto-Assinatura</span>
                            </div>
                            <span className="block text-[9px] opacity-70 uppercase tracking-tight mt-0.5">
                              Automatize alertas de preços para kimonos, faixas e proteções que mais busca
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] font-mono font-black uppercase text-amber-600 group-hover:text-white">Ajustar →</span>
                          <ChevronRight size={16} />
                        </div>
                      </button>
                    </div>
                  </section>
                </motion.div>
              )}

              {/* Central de Alertas Tab */}
              {activeTab === 'alertas' && (
                <motion.div
                  key="alertas"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={() => {
                        setActiveTab('geral');
                        playClickSound();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white text-[9px] font-mono font-black uppercase tracking-widest border border-zinc-300 dark:border-zinc-700 cursor-pointer transition-colors"
                    >
                      <ChevronLeft size={12} />
                      <span>← Voltar à Visão Geral do Atleta</span>
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setActiveTab('notificacoes');
                          playClickSound();
                        }}
                        className="text-[9.5px] font-mono font-bold text-amber-600 dark:text-amber-400 hover:underline uppercase flex items-center gap-1"
                      >
                        <span>⚙️ Configurar Push & Tópicos de Busca →</span>
                      </button>
                    </div>
                  </div>

                  <PriceAlertsCenter
                    monitoredProducts={resolvedWishlist}
                    wishlistAlerts={wishlistAlerts}
                    onTogglePriceAlert={onTogglePriceAlert}
                    onSelectProduct={onSelectProduct}
                    onNavigate={onNavigate}
                    user={user}
                    viewedProductIds={viewedProductIds}
                    productList={productList}
                    addToast={addToast}
                    playClickSound={playClickSound}
                  />
                </motion.div>
              )}

              {activeTab === 'notificacoes' && (
                <motion.div
                  key="notificacoes"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={() => {
                        setActiveTab('geral');
                        playClickSound();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white text-[9px] font-mono font-black uppercase tracking-widest border border-zinc-300 dark:border-zinc-700 cursor-pointer transition-colors"
                    >
                      <ChevronLeft size={12} />
                      <span>← Voltar à Visão Geral do Atleta</span>
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setActiveTab('alertas');
                          playClickSound();
                        }}
                        className="text-[9.5px] font-mono font-bold text-red-600 dark:text-red-400 hover:underline uppercase flex items-center gap-1"
                      >
                        <span>🔔 Ver Central de Alertas e Histórico →</span>
                      </button>
                    </div>
                  </div>

                  <SettingsPushSubscription
                    wishlistProducts={resolvedWishlist}
                    userEmail={user?.email}
                    onNavigateWishlist={() => onNavigate('WISHLIST')}
                    addToast={addToast}
                    viewedProductIds={viewedProductIds}
                    productList={productList}
                  />
                </motion.div>
              )}

              {activeTab === 'avaliacoes' && (
                <motion.div
                  key="avaliacoes"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <UserReviewsManager
                    user={user}
                    productList={productList}
                    onAddReview={onAddReview}
                    onNavigate={onNavigate}
                    addToast={addToast}
                    playClickSound={playClickSound}
                    onBackToOverview={() => setActiveTab('geral')}
                  />
                </motion.div>
              )}

              {activeTab === 'campeonatos' && (
                <motion.div
                  key="campeonatos"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-12"
                >
                  {/* Contextual Return Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={() => {
                        setActiveTab('geral');
                        playClickSound();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white text-[9px] font-mono font-black uppercase tracking-widest border border-zinc-300 dark:border-zinc-700 cursor-pointer transition-colors"
                    >
                      <ChevronLeft size={12} />
                      <span>← Voltar à Visão Geral do Atleta</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate('SHOP')}
                        className="text-[9px] font-mono font-bold uppercase text-zinc-500 hover:text-black dark:hover:text-white"
                      >
                        Ver Kimonos de Competição →
                      </button>
                    </div>
                  </div>

                  {/* Hero Tournament Header */}
                  <div className="bg-gradient-to-br from-zinc-900 to-black text-white p-8 md:p-10 border-l-4 border-green-600 relative overflow-hidden">
                    <div className="absolute top-2 right-2 p-4 text-green-500 opacity-10">
                      <Trophy size={110} />
                    </div>
                    <div className="relative z-10">
                      <span className="text-[9px] font-mono font-black text-green-500 uppercase tracking-widest block mb-1">MURAL DE COMPETIDOR OSS.OS</span>
                      <h3 className="text-3xl font-black italic uppercase -skew-x-6 tracking-tighter mb-4">Dojo de Competições & Torneios</h3>
                      <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
                        Acompanhe o calendário oficial de eventos da <strong>IBJJF (International Brazilian Jiu-Jitsu Federation)</strong>, gerencie suas confirmações de chave e eternize suas conquistas históricas pendurando suas medalhas no mural do guerreiro. Oss!
                      </p>

                      <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-zinc-800">
                        <div>
                          <span className="block text-[9px] font-mono text-zinc-500 uppercase">Inscrições Ativas</span>
                          <span className="text-xl font-mono font-black text-white">{tournaments.filter(t => t.registered).length} EVENTOS</span>
                        </div>
                        <div className="h-8 w-[1px] bg-zinc-800 hidden sm:block" />
                        <div>
                          <span className="block text-[9px] font-mono text-zinc-500 uppercase">Mural de Medalhas</span>
                          <span className="text-xl font-mono font-black text-green-500">{medals.length} CONQUISTAS</span>
                        </div>
                        <div className="h-8 w-[1px] bg-zinc-800 hidden sm:block" />
                        <div>
                          <span className="block text-[9px] font-mono text-zinc-500 uppercase">Nível de Combatente</span>
                          <span className="text-xs sm:text-sm font-mono font-black text-orange-500 uppercase flex items-center gap-1">
                            {medals.filter(m => m.medalType === 'GOLD').length >= 3 ? '🏆 SENSEI DE COMBATE' : '🥋 ATLETA ATIVO'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-zinc-800 flex">
                        <Button
                          onClick={() => setFocusMode(true)}
                          className="bg-green-600 hover:bg-green-500 text-white rounded-none font-black text-[9.5px] tracking-widest py-3.5 px-6 h-auto uppercase flex items-center gap-1.5 border-none shadow-lg shadow-green-600/30"
                        >
                          <Zap size={12} className="animate-pulse" /> Ativar Modo Foco (Dia do Torneio)
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Notification Permissions Control & Background Service Worker Status */}
                  <div className="flex flex-col gap-3">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <Bell size={18} className="text-green-600 shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="block text-xs font-black uppercase text-black dark:text-white tracking-widest">Alertas do Competidor</span>
                            <Badge className={`font-mono text-[7px] font-black rounded-none uppercase px-1.5 py-[1px] ${
                              serviceWorkerStatus === 'active' 
                                ? 'bg-green-50 text-green-750 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800' 
                                : serviceWorkerStatus === 'registering' 
                                ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 animate-pulse'
                                : 'bg-red-50 text-red-600 dark:bg-rose-950/20 dark:text-rose-400'
                            }`}>
                              SW: {serviceWorkerStatus === 'active' ? 'Ativo (2º Plano OK)' : serviceWorkerStatus === 'registering' ? 'Iniciando...' : 'Desativado'}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-zinc-400 font-medium leading-relaxed mt-1">
                            Ative as notificações para receber alertas técnicos da IBJJF 48h antes dos combates. O Service Worker garante o funcionamento em segundo plano ou temporariamente inativo.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          onClick={requestNotificationPermission}
                          className={`rounded-none text-[8.5px] font-black tracking-widest py-2 px-4 uppercase transition-all ${
                            browserNotificationsEnabled 
                              ? 'border-green-600 text-green-600 bg-green-50/5 dark:bg-green-950/20' 
                              : 'border-zinc-350 hover:border-black'
                          }`}
                        >
                          {browserNotificationsEnabled ? '✓ Notificações Desktop Ativas' : 'Permitir Notificações Desktop'}
                        </Button>

                        {browserNotificationsEnabled && (
                          <Button
                            variant="outline"
                            disabled={isSimulatingBackground}
                            onClick={simulateBackgroundNotification}
                            className={`rounded-none text-[8.5px] font-black tracking-widest py-2 px-4 uppercase transition-all ${
                              isSimulatingBackground 
                                ? 'bg-orange-500 hover:bg-orange-600 border-none text-white animate-pulse' 
                                : 'border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white'
                            }`}
                          >
                            {isSimulatingBackground 
                              ? `Minimizar Já! (${simulationCountdown}s)` 
                              : 'Simular Alerta 2º Plano (5s)'}
                          </Button>
                        )}
                      </div>
                    </div>
                    {isSimulatingBackground && (
                      <div className="text-center md:text-left text-[9px] font-mono text-orange-500 bg-orange-505/5 p-2 border border-orange-500/20 animate-pulse">
                        🚀 <strong>Instrução:</strong> Alterne de aba ou minimize o navegador agora! Em {simulationCountdown} segundos o Service Worker disparará seu alerta em segundo plano.
                      </div>
                    )}
                  </div>

                  {/* Dynamic Alert Notification Banner (Less than 48 hours remaining) */}
                  {activeNotifications.length > 0 && (
                    <motion.div 
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-6 bg-orange-500/10 dark:bg-amber-950/10 border-2 border-orange-500/50 text-black dark:text-white flex flex-col gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-orange-500 text-white rounded-none shrink-0">
                          <Clock size={20} className="animate-pulse" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <span className="text-[9px] font-mono font-black uppercase text-orange-600 dark:text-orange-400 tracking-wider flex items-center gap-1">
                            ⚠️ ALERTA DE COMBATE ATIVO (48 HORAS DE ANTECEDÊNCIA)
                          </span>
                          <h4 className="text-sm font-black uppercase tracking-tight">Pesagem Oficial & Preparação de Armadura Requerida</h4>
                          <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-normal font-medium">
                            Seu próximo campeonato IBJJF começará em menos de 48 horas! Siga com atenção redobrada o regulamento técnico.
                          </p>
                        </div>
                        
                        <div className="text-right shrink-0">
                          <Badge className="bg-orange-600 text-white font-mono font-black text-[9px] px-2 py-0.5 rounded-none animate-pulse">
                            COMBATE PRÓXIMO
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-orange-500/20">
                        {activeNotifications.map(({ tournament, hoursRemaining }) => (
                          <div key={tournament.id} className="bg-white dark:bg-zinc-950 border border-orange-500/30 p-4">
                            <span className="block text-[8px] font-mono font-black text-orange-600 dark:text-orange-400 uppercase tracking-tight">🛡️ FALTAM {hoursRemaining.toFixed(1)} HORAS</span>
                            <span className="block text-xs font-black uppercase tracking-tight mt-0.5 text-black dark:text-white">{tournament.title}</span>
                            
                            <div className="flex items-center gap-2 mt-2 font-mono">
                              <span className="text-[10px] font-black text-orange-600 flex items-center gap-1 bg-orange-500/10 px-2 py-0.5 rounded-none">
                                ⏳ INÍCIO: {hoursRemaining.toFixed(1)}h
                              </span>
                              <span className="text-[10px] font-black text-zinc-500 uppercase">• {tournament.belt || 'Faixa de Entrada'} • {tournament.weightClass || 'Peso de Entrada'}</span>
                            </div>

                            <div className="mt-3 space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                              <span className="block text-[8px] font-mono text-zinc-400 uppercase tracking-wider">Checklist Obrigatório IBJJF:</span>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9.5px] text-zinc-650 dark:text-zinc-450 font-bold">
                                <span className="flex items-center gap-1">⚖️ Peso regulamentar</span>
                                <span className="flex items-center gap-1">🥋 Kimono seco & limpo</span>
                                <span className="flex items-center gap-1">🎗️ Faixa oficial correta</span>
                                <span className="flex items-center gap-1">🆔 Carteirinha & Doc</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Active Registrations status checking */}
                  <section className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-black dark:text-white flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-green-600" /> Suas Inscrições Ativas
                    </h4>

                    {tournaments.filter(t => t.registered).length === 0 ? (
                      <div className="p-8 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 text-center">
                        <Trophy size={28} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                        <p className="text-xs text-zinc-400 uppercase font-semibold italic">Sem inscrições ativas para combate de momento.</p>
                        <p className="text-[10px] text-zinc-500 mt-1">Navegue pelas vagas e registre-se nos eventos da IBJJF listados abaixo para ativar seu status de competidor.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {tournaments.filter(t => t.registered).map((t) => (
                          <div key={t.id} className="p-6 border-2 border-green-600/70 bg-green-50/5 dark:bg-green-950/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[8px] font-mono font-black bg-green-600 text-white px-2 py-0.5 rounded-none uppercase">INSCRIÇÃO CONFIRMADA ✓</span>
                                <span className="text-[9px] font-mono text-zinc-400">{t.date}</span>
                              </div>
                              <h5 className="text-sm font-black text-black dark:text-white uppercase tracking-tight mt-1">{t.title}</h5>
                              
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-zinc-500 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-1 font-mono font-bold">
                                  🥋 {t.belt}
                                </span>
                                <span className="text-xs text-zinc-500 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-1 font-mono font-bold">
                                  ⚖️ {t.weightClass}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-400 mt-2 font-mono">📍 Local do Combate: {t.location}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                              <span className="text-[10px] text-green-600 font-black uppercase text-center md:text-right flex items-center gap-1.5 self-center pr-2">
                                <Flame size={14} /> Pesagem Liberada no Dia
                              </span>
                              <Button
                                onClick={() => setFocusMode(true)}
                                className="rounded-none text-xs font-black uppercase tracking-widest py-4 px-6 h-auto bg-green-600 hover:bg-green-500 text-white hover:opacity-90 border-none shadow-md"
                              >
                                ⚡ Entrar Modo Foco
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleCancelRegistration(t.id)}
                                className="rounded-none text-xs font-black uppercase tracking-widest py-4 px-6 h-auto"
                              >
                                Cancelar Inscrição
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Upcoming Tournaments Calendar */}
                  <section className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-black dark:text-white flex items-center gap-2">
                      <Trophy size={14} className="text-green-600" /> Calendário de Eventos Oficiais IBJJF (2026)
                    </h4>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {tournaments.map((t) => {
                        const isReg = t.registered;
                        const isOpen = t.status === 'ABERTO' || t.status === 'ULTIMAS_VAGAS';
                        return (
                          <div 
                            key={t.id} 
                            className={`p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all ${
                              isReg ? 'bg-zinc-50/20 opacity-90' : ''
                            }`}
                          >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <Badge className={`rounded-none text-[8px] font-black font-mono uppercase tracking-wider ${
                                    isReg 
                                      ? 'bg-green-600 text-white' 
                                      : t.status === 'ULTIMAS_VAGAS' 
                                      ? 'bg-orange-500 text-white animate-pulse' 
                                      : t.status === 'ABERTO' 
                                      ? 'bg-zinc-800 text-white' 
                                      : 'bg-zinc-200 text-zinc-500'
                                  }`}>
                                    {isReg ? 'INSCRITO ✓' : t.status === 'ULTIMAS_VAGAS' ? 'Últimas Vagas!' : t.status === 'ABERTO' ? 'Inscrições Abertas' : 'Encerrado'}
                                  </Badge>
                                  <span className="text-[10px] font-mono text-zinc-400">{t.date}</span>
                                </div>

                                <h5 className="text-sm font-black text-black dark:text-white uppercase tracking-tight mt-1.5">{t.title}</h5>
                                <p className="text-xs text-zinc-500 mt-1 font-semibold">{t.location}</p>
                              </div>

                              <div className="w-full md:w-auto">
                                {isReg ? (
                                  <span className="text-green-600 border border-green-600 px-3 py-1 text-center font-black text-[9px] uppercase tracking-wider block">
                                    VOCÊ ESTÁ NESTAS CHAVES
                                  </span>
                                ) : isOpen ? (
                                  registeringTourId !== t.id ? (
                                    <Button
                                      onClick={() => {
                                        setRegisteringTourId(t.id);
                                        setSelectedRegBelt('Faixa Preta');
                                        setSelectedRegWeight('Peso Médio (Até 82.3kg)');
                                      }}
                                      className="w-full md:w-auto bg-black hover:bg-green-600 text-white rounded-none font-black text-[10px] tracking-widest py-3 px-6 h-auto uppercase"
                                    >
                                      Garantir Inscrição (+45 PTS)
                                    </Button>
                                  ) : null
                                ) : (
                                  <Button disabled className="w-full md:w-auto bg-zinc-100 text-zinc-400 rounded-none cursor-not-allowed">
                                    INSCRIÇÕES ENCERRADAS
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Collapsible Inline Registration Form */}
                            <AnimatePresence>
                              {registeringTourId === t.id && (
                                <motion.form 
                                  onSubmit={handleRegisterTournament}
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-900 grid grid-cols-1 md:grid-cols-3 gap-4"
                                >
                                  <div>
                                    <label className="block text-[8px] font-mono font-black uppercase text-zinc-400 mb-1">Graduação / Faixa de Entrada</label>
                                    <select
                                      value={selectedRegBelt}
                                      onChange={(e) => setSelectedRegBelt(e.target.value)}
                                      className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs p-3 font-bold rounded-none"
                                    >
                                      <option value="Faixa Branca">Faixa Branca</option>
                                      <option value="Faixa Azul">Faixa Azul</option>
                                      <option value="Faixa Roxa">Faixa Roxa</option>
                                      <option value="Faixa Marrom">Faixa Marrom</option>
                                      <option value="Faixa Preta">Faixa Preta</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-mono font-black uppercase text-zinc-400 mb-1">Categoria de Peso (Com Kimono)</label>
                                    <select
                                      value={selectedRegWeight}
                                      onChange={(e) => setSelectedRegWeight(e.target.value)}
                                      className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs p-3 font-bold rounded-none"
                                    >
                                      <option value="Peso Galo (Até 57.5kg)">Peso Galo (Até 57.5kg)</option>
                                      <option value="Peso Pluma (Até 64.0kg)">Peso Pluma (Até 64.0kg)</option>
                                      <option value="Peso Pena (Até 70.0kg)">Peso Pena (Até 70.0kg)</option>
                                      <option value="Peso Leve (Até 76.0kg)">Peso Leve (Até 76.0kg)</option>
                                      <option value="Peso Médio (Até 82.3kg)">Peso Médio (Até 82.3kg)</option>
                                      <option value="Peso Meio-Pesado (Até 88.3kg)">Peso Meio-Pesado (Até 88.3kg)</option>
                                      <option value="Peso Pesado (Até 94.3kg)">Peso Pesado (Até 94.3kg)</option>
                                      <option value="Peso Super-Pesado (Até 100.5kg)">Peso Super-Pesado (Até 100.5kg)</option>
                                      <option value="Peso Pesadíssimo (Sem limite)">Peso Pesadíssimo (Sem limite)</option>
                                      <option value="Categoria Absoluto">Categoria Absoluto (Sem Limite)</option>
                                    </select>
                                  </div>
                                  <div className="flex items-end justify-end gap-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      onClick={() => setRegisteringTourId(null)}
                                      className="rounded-none font-black text-[9px] uppercase tracking-widest py-3 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                    >
                                      Cancelar
                                    </Button>
                                    <Button
                                      type="submit"
                                      className="bg-green-600 hover:bg-green-500 text-white rounded-none font-black text-[9px] uppercase tracking-widest py-3 px-6"
                                    >
                                      Confirmar Inscrição Oficial
                                    </Button>
                                  </div>
                                </motion.form>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Medal Wall of Fame (Mural de Conquistas Históricas) */}
                  <section className="space-y-6 pt-4">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-black dark:text-white flex items-center gap-2">
                        <Medal size={14} className="text-green-600" /> Mural de Medalhas Conquistadas
                      </h4>
                      
                      {!showAddMedal && (
                        <Button
                          variant="outline"
                          onClick={() => setShowAddMedal(true)}
                          className="border-dashed border-zinc-350 hover:border-black rounded-none text-[8px] font-black tracking-widest py-3 px-4 uppercase flex items-center gap-1.5"
                        >
                          <Plus size={11} /> Adicionar Medalha Recente
                        </Button>
                      )}
                    </div>

                    {/* Expandable Add Medal Form */}
                    <AnimatePresence>
                      {showAddMedal && (
                        <motion.form 
                          onSubmit={handleAddMedalRecord}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-zinc-50 dark:bg-zinc-950 p-6 border border-zinc-200 dark:border-zinc-800 space-y-4"
                        >
                          <h5 className="text-[10px] font-black uppercase tracking-wider text-green-600 flex items-center gap-2">
                            🏅 PENDURAR NOVA GLÓRIA NO TATAME
                          </h5>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[8px] font-mono font-black uppercase text-zinc-400 mb-1">Nome do Torneio / Campeonato</label>
                              <input
                                type="text"
                                placeholder="Ex: IBJJF São Paulo Open 2026"
                                value={newMedalTournament}
                                onChange={(e) => setNewMedalTournament(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs p-3 font-bold rounded-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] font-mono font-black uppercase text-zinc-400 mb-1">Divisão / Categoria de Peso</label>
                              <input
                                type="text"
                                placeholder="Ex: Peso Médio ou Absoluto"
                                value={newMedalDivision}
                                onChange={(e) => setNewMedalDivision(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 text-xs p-3 font-bold rounded-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[8px] font-mono font-black uppercase text-zinc-400 mb-1">Escolher Ícone Especial de Destaque (Opcional)</label>
                              <select
                                value={newMedalCustomIcon}
                                onChange={(e) => setNewMedalCustomIcon(e.target.value as any)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs p-3 font-bold rounded-none"
                              >
                                <option value="">Sem ícone personalizado (Usar medalha padrão)</option>
                                <option value="trophy">🏆 Troféu (Trophy)</option>
                                <option value="medal">🏅 Medalha Extra (Medal)</option>
                                <option value="award">🎖️ Menção de Honra (Award)</option>
                                <option value="crown">👑 Coroa de Campeão (Crown)</option>
                                <option value="shield">🛡️ Escudo do Guerreiro (Shield)</option>
                                <option value="flame">🔥 Fogo do Tatame (Flame)</option>
                                <option value="star">⭐️ Estrela Dourada (Star)</option>
                                <option value="zap">⚡ Velocidade/Gás (Zap)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[8px] font-mono font-black uppercase text-zinc-400 mb-1">URL da Imagem da Conquista / Medalha (Opcional)</label>
                              <input
                                type="url"
                                placeholder="https://exemplo.com/sua-foto.jpg"
                                value={newMedalImageUrl}
                                onChange={(e) => setNewMedalImageUrl(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs p-3 font-bold rounded-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-[8px] font-mono font-black uppercase text-zinc-400 mb-1">Ano da Conquista</label>
                              <select
                                value={newMedalYear}
                                onChange={(e) => setNewMedalYear(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs p-3 font-bold rounded-none"
                              >
                                <option value="2026">2026</option>
                                <option value="2025">2025</option>
                                <option value="2024">2024</option>
                                <option value="2023">2023</option>
                                <option value="2022">2022</option>
                                <option value="2021">2021</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[8px] font-mono font-black uppercase text-zinc-400 mb-1">Faixa na Época</label>
                              <select
                                value={newMedalBelt}
                                onChange={(e) => setNewMedalBelt(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs p-3 font-bold rounded-none"
                              >
                                <option value="Faixa Branca">Faixa Branca</option>
                                <option value="Faixa Azul">Faixa Azul</option>
                                <option value="Faixa Roxa">Faixa Roxa</option>
                                <option value="Faixa Marrom">Faixa Marrom</option>
                                <option value="Faixa Preta">Faixa Preta</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[8px] font-mono font-black uppercase text-zinc-400 mb-1">Metal da Medalha</label>
                              <select
                                value={newMedalType}
                                onChange={(e) => setNewMedalType(e.target.value as any)}
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs p-3 font-bold rounded-none"
                              >
                                <option value="GOLD">🥇 Ouro (Gold)</option>
                                <option value="SILVER">🥈 Prata (Silver)</option>
                                <option value="BRONZE">🥉 Bronze</option>
                              </select>
                            </div>
                            <div className="flex items-end gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowAddMedal(false)}
                                className="rounded-none font-black text-[9px] uppercase tracking-widest w-1/2 py-3 h-auto"
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="submit"
                                className="bg-black hover:bg-green-600 text-white rounded-none font-black text-[9px] uppercase tracking-widest w-1/2 py-3 h-auto"
                              >
                                Pendurar (+85 PTS)
                              </Button>
                            </div>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>

                    {medals.length === 0 ? (
                      <div className="p-8 sm:p-10 border-2 border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 text-center space-y-3">
                        <div className="w-12 h-12 mx-auto bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                          <Medal size={24} />
                        </div>
                        <h5 className="text-sm font-black uppercase tracking-tight text-black dark:text-white">
                          Quadro de Honra Aguardando Conquistas
                        </h5>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                          Eternize suas medalhas de ouro, prata e bronze conquistadas em torneios da IBJJF, estaduais ou copas locais.
                        </p>
                        <Button
                          onClick={() => {
                            setShowAddMedal(true);
                            playClickSound();
                          }}
                          className="bg-black text-white dark:bg-white dark:text-black rounded-none text-[9px] font-mono font-black uppercase tracking-widest px-4 py-2 mt-2 cursor-pointer shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#ffffff]"
                        >
                          + Registrar Minha Primeira Medalha
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {medals.map((m) => {
                          const isGold = m.medalType === 'GOLD';
                          const isSilver = m.medalType === 'SILVER';
                          
                          const bgGradient = isGold 
                            ? 'from-amber-50 to-amber-100/30 dark:from-amber-950/10 dark:to-orange-950/5 border-amber-500/30' 
                            : isSilver 
                            ? 'from-zinc-50 to-zinc-150/40 dark:from-zinc-850/10 dark:to-zinc-900/5 border-zinc-400/30' 
                            : 'from-orange-50 to-orange-100/30 dark:from-amber-950/5 dark:to-stone-900/5 border-amber-700/30';
                           
                          const renderCustomIcon = (iconName?: string, size = 20) => {
                            switch (iconName) {
                              case 'trophy': return <Trophy size={size} className="text-amber-500" />;
                              case 'medal': return <Medal size={size} className="text-blue-500" />;
                              case 'award': return <Award size={size} className="text-emerald-500" />;
                              case 'crown': return <Crown size={size} className="text-amber-500 animate-pulse" />;
                              case 'shield': return <Shield size={size} className="text-indigo-500" />;
                              case 'flame': return <Flame size={size} className="text-red-500" />;
                              case 'star': return <Star size={size} className="text-yellow-500 fill-yellow-400" />;
                              case 'zap': return <Zap size={size} className="text-cyan-500" />;
                              default: return null;
                            }
                          };

                          return (
                            <motion.div 
                              key={m.id}
                              initial={{ opacity: 0, scale: 0.95, y: 15 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                              className={`p-5 rounded-none border bg-gradient-to-br ${bgGradient} flex items-center justify-between group transition-all duration-300 relative overflow-hidden ${
                                isGold 
                                  ? 'hover:shadow-[0_0_22px_rgba(245,158,11,0.35)] dark:hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:border-amber-400' 
                                  : isSilver 
                                  ? 'hover:shadow-[0_0_22px_rgba(148,163,184,0.28)] dark:hover:shadow-[0_0_30px_rgba(148,163,184,0.18)] hover:border-zinc-350' 
                                  : 'hover:shadow-[0_0_22px_rgba(180,83,9,0.28)] dark:hover:shadow-[0_0_30px_rgba(180,83,9,0.18)] hover:border-amber-600'
                              }`}
                            >
                              {/* Slanted shiny metallic sheen beam that slides on hover */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 dark:via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                              
                              <div className="flex items-center gap-4 relative z-10">
                                {/* Visual Avatar Box */}
                                <div className="shrink-0 relative">
                                  {m.imageUrl ? (
                                    <div className="w-12 h-12 border border-zinc-200 dark:border-zinc-850 overflow-hidden bg-white dark:bg-zinc-900 flex items-center justify-center">
                                      <img 
                                        src={m.imageUrl} 
                                        alt={m.tournament} 
                                        className="w-full h-full object-cover" 
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  ) : m.customIcon ? (
                                    <div className="w-12 h-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-xs">
                                      {renderCustomIcon(m.customIcon, 22)}
                                    </div>
                                  ) : (
                                    <div className="w-12 h-12 bg-white/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-900 flex items-center justify-center">
                                      <span className="text-2xl">{isGold ? '🥇' : isSilver ? '🥈' : '🥉'}</span>
                                    </div>
                                  )}
                                  
                                  {/* Sub-badge indicating Ouro/Prata/Bronze Mini-Emoji when imageUrl/customIcon is present */}
                                  {(m.imageUrl || m.customIcon) && (
                                    <span className="absolute -bottom-1 -right-1 text-xs bg-white dark:bg-zinc-950 px-1 py-0.5 rounded shadow-xs border border-zinc-200 dark:border-zinc-800">
                                      {isGold ? '🥇' : isSilver ? '🥈' : '🥉'}
                                    </span>
                                  )}
                                </div>

                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-black text-black dark:text-white uppercase tracking-tight">
                                      {isGold ? 'Medalha de Ouro' : isSilver ? 'Medalha de Prata' : 'Medalha de Bronze'}
                                    </span>
                                    <span className="text-[9px] font-mono text-zinc-400">({m.year})</span>
                                  </div>
                                  <h5 className="text-xs font-black uppercase tracking-tight text-zinc-700 dark:text-zinc-350">{m.tournament}</h5>
                                  <p className="text-[10px] text-zinc-500 font-medium">🦾 {m.belt} • {m.division}</p>
                                </div>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteMedal(m.id)}
                                className="opacity-0 group-hover:opacity-100 text-zinc-350 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-none w-8 h-8 transition-opacity pointer-events-auto cursor-pointer flex items-center justify-center self-center relative z-10"
                                title="Remover glória do mural"
                              >
                                <X size={14} />
                              </Button>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </motion.div>
              )}

              {activeTab === 'fidelidade' && (
                <motion.div
                  key="fidelidade"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-8"
                >
                  {/* Contextual Return Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={() => {
                        setActiveTab('geral');
                        playClickSound();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white text-[9px] font-mono font-black uppercase tracking-widest border border-zinc-300 dark:border-zinc-700 cursor-pointer transition-colors"
                    >
                      <ChevronLeft size={12} />
                      <span>← Voltar à Visão Geral do Atleta</span>
                    </button>
                    <span className="text-[10px] font-mono font-black text-green-600 uppercase tracking-widest">
                      🎁 PONTOS, BENEFÍCIOS & RESGATES
                    </span>
                  </div>
                  {!loyaltyEnabled ? (
                    <div className="text-center py-12">
                      <Gift size={48} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4 animate-bounce" />
                      <h4 className="text-lg font-black uppercase tracking-tighter mb-2">Programa Conectando...</h4>
                      <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                        O Programa de Fidelidade está temporariamente asfixiado ou desativado. 
                        Acesse as <button onClick={() => onNavigate('SETTINGS')} className="text-green-600 dark:text-green-400 font-bold underline hover:opacity-75">Configurações Administrativas (Painel do Mestre)</button> para ligá-lo e customizar as regras!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Pontos Card */}
                      {(() => {
                        const nextMilestone = LOYALTY_MILESTONES.find(m => points < m.points) || LOYALTY_MILESTONES[LOYALTY_MILESTONES.length - 1];
                        const prevMilestonePts = LOYALTY_MILESTONES.filter(m => points >= m.points).slice(-1)[0]?.points || 0;
                        const milestonePct = Math.min(100, Math.max(0, ((points - prevMilestonePts) / Math.max(1, (nextMilestone.points - prevMilestonePts))) * 100));
                        const pointsNeededForNext = Math.max(0, nextMilestone.points - points);

                        return (
                          <div className="space-y-6">
                            <div className="bg-gradient-to-br from-zinc-50 via-zinc-100/60 to-amber-500/5 dark:from-zinc-900 dark:via-zinc-950 dark:to-yellow-500/5 p-6 sm:p-8 border-2 border-black dark:border-zinc-800 shadow-[4px_4px_0px_#000000] dark:shadow-[4px_4px_0px_#ffffff] relative overflow-hidden">
                              <div className="absolute top-2 right-2 p-4 text-yellow-500/10 dark:text-yellow-400/10 pointer-events-none">
                                <Trophy size={140} />
                              </div>

                              <div className="relative z-10">
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                  <span className="text-[9px] font-mono font-black text-green-600 dark:text-green-400 bg-green-500/10 dark:bg-green-500/20 px-2.5 py-1 border border-green-500/30 uppercase tracking-widest">
                                    FAIXA DE PONTOS ATHLETE OSS.OS
                                  </span>

                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                                      {reachedMilestones.length} de {LOYALTY_MILESTONES.length} Marcos Desbloqueados
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30 text-[9px] font-mono font-black">
                                      <Trophy size={11} className="fill-current text-yellow-500" />
                                      {reachedMilestones.length} Troféus
                                    </span>
                                  </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                                  <span className="text-5xl font-black italic -skew-x-6 text-black dark:text-white">
                                    {points} <span className="text-xs font-mono font-bold align-super text-zinc-500">PTS OSS</span>
                                  </span>

                                  {pointsNeededForNext > 0 ? (
                                    <span className="text-xs font-mono font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-1.5">
                                      <Flame size={14} className="fill-current" />
                                      Faltam {pointsNeededForNext} PTS para o marco <strong>{nextMilestone.title}</strong>
                                    </span>
                                  ) : (
                                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                      <Crown size={14} className="fill-current text-yellow-500" />
                                      Você conquistou todos os marcos de fidelidade!
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed mt-2 mb-6 font-medium">
                                  Cada ponto de fidelidade aproxima você dos <strong>Troféus Flutuantes do Dojô</strong> e desbloqueia participações exclusivas em sorteios de kimonos oficiais, cupons de afiliados e e-books de mestres!
                                </p>
                                
                                {/* Progress toward next Loyalty Milestone */}
                                <div className="p-4 bg-white/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-lg mb-6">
                                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider mb-2">
                                    <span className="flex items-center gap-1.5 text-black dark:text-white">
                                      <Trophy size={13} className="text-yellow-500" />
                                      Próximo Marco: {nextMilestone.title} ({nextMilestone.points} PTS)
                                    </span>
                                    <span className="font-mono text-yellow-600 dark:text-yellow-400">
                                      {points} / {nextMilestone.points} PTS ({Math.round(milestonePct)}%)
                                    </span>
                                  </div>

                                  <div className="relative h-2.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: "0%" }}
                                      animate={{ width: `${milestonePct}%` }}
                                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                      className="h-full bg-gradient-to-r from-yellow-500 via-amber-500 to-emerald-500 origin-left"
                                    />
                                  </div>

                                  <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400 mt-2">
                                    <span>Base: {prevMilestonePts} PTS</span>
                                    <span className="italic text-yellow-600 dark:text-yellow-400">
                                      {pointsNeededForNext > 0 ? `+${pointsNeededForNext} PTS para soltar os Troféus Flutuantes & Confetes 🎉` : '🎉 Marco Supremo Atingido!'}
                                    </span>
                                    <span>Alvo: {nextMilestone.points} PTS</span>
                                  </div>
                                </div>

                                {/* Simulator / Fast Earn Points Controls */}
                                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                                  <div className="flex items-center gap-1.5 text-[9px] font-mono font-black uppercase text-zinc-500">
                                    <Sparkles size={12} className="text-yellow-500" />
                                    <span>Simulador de Pontos de Fidelidade:</span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => addSimulatedPoints('TRAINING', '🥋 Check-in Presencial no Dojô', 50)}
                                      className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black hover:bg-green-600 dark:hover:bg-green-600 hover:text-white dark:hover:text-white text-[9px] font-mono font-black uppercase tracking-wider transition-colors cursor-pointer"
                                    >
                                      +50 PTS (Check-in)
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => addSimulatedPoints('REVIEW', '✍️ Avaliação Técnica de Kimono com Foto', 100)}
                                      className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-black dark:text-white text-[9px] font-mono font-black uppercase tracking-wider border border-zinc-300 dark:border-zinc-700 transition-colors cursor-pointer"
                                    >
                                      +100 PTS (Review)
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => addSimulatedPoints('BONUS', '🏅 Medalha Pendurada no Mural de Campeões', 250)}
                                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[9px] font-mono font-black uppercase tracking-wider transition-colors cursor-pointer"
                                    >
                                      +250 PTS (Medalha)
                                    </button>

                                    {pointsNeededForNext > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          addSimulatedPoints('BONUS', `🚀 Salto Rumo ao Marco: ${nextMilestone.title}`, pointsNeededForNext);
                                        }}
                                        className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black text-[9px] font-mono font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1"
                                        title="Eleva os pontos para atingir o próximo marco e disparar os troféus flutuantes"
                                      >
                                        <Trophy size={11} className="fill-black" />
                                        <span>Bater {nextMilestone.points} PTS ({nextMilestone.title})</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Loyalty Milestones & Floating Trophy Showcase Gallery */}
                            <div className="space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                                <div>
                                  <h4 className="text-sm font-black uppercase tracking-tight text-black dark:text-white flex items-center gap-2">
                                    <Trophy size={16} className="text-yellow-500 fill-yellow-500/20" />
                                    Galeria de Marcos de Fidelidade & Troféus Desbloqueados
                                  </h4>
                                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans mt-0.5">
                                    Cada marco atingido dispara uma celebração especial com <strong>canvas-confetti</strong> e <strong>troféus flutuantes</strong>. Você pode rever a comemoração a qualquer momento!
                                  </p>
                                </div>

                                <div className="text-right">
                                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                                    Total: {LOYALTY_MILESTONES.length} Marcos Oficiais
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {LOYALTY_MILESTONES.map((m) => {
                                  const isReached = points >= m.points;
                                  const diff = m.points - points;

                                  return (
                                    <div
                                      key={m.points}
                                      className={`p-5 border-2 transition-all flex flex-col justify-between relative overflow-hidden ${
                                        isReached
                                          ? 'bg-white dark:bg-zinc-950 border-yellow-500/60 dark:border-yellow-500/40 shadow-[3px_3px_0px_#eab308]'
                                          : 'bg-zinc-50/70 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 opacity-80'
                                      }`}
                                    >
                                      {/* Watermark Points */}
                                      <div className="absolute right-2 -bottom-3 text-6xl font-black font-mono text-zinc-200/50 dark:text-zinc-800/30 pointer-events-none select-none">
                                        {m.points}
                                      </div>

                                      <div className="relative z-10 space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                          <div className={`p-2.5 rounded-xl border flex items-center justify-center ${
                                            isReached
                                              ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-500 shadow-sm'
                                              : 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-400'
                                          }`}>
                                            <Trophy size={24} className={isReached ? 'fill-yellow-500/30' : ''} />
                                          </div>

                                          <div className="text-right">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[8.5px] font-mono font-black uppercase rounded ${
                                              isReached
                                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                                            }`}>
                                              {isReached ? (
                                                <>
                                                  <CheckCircle2 size={10} className="text-emerald-500" />
                                                  <span>CONQUISTADO</span>
                                                </>
                                              ) : (
                                                <span>FALTAM {diff} PTS</span>
                                              )}
                                            </span>
                                            <span className="block text-xs font-mono font-black text-black dark:text-white mt-1">
                                              {m.points} PTS
                                            </span>
                                          </div>
                                        </div>

                                        <div>
                                          <div className="flex items-center gap-1.5 mb-1">
                                            <span className="text-[9px] font-mono font-bold text-yellow-600 dark:text-yellow-400">
                                              {m.badge}
                                            </span>
                                            <span className="text-[9px] text-zinc-400">•</span>
                                            <span className="text-[9px] font-mono text-zinc-500">
                                              {m.beltTier}
                                            </span>
                                          </div>

                                          <h5 className="text-base font-black uppercase tracking-tight text-black dark:text-white">
                                            {m.title}
                                          </h5>

                                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1">
                                            {m.description}
                                          </p>
                                        </div>

                                        <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-[10px] text-zinc-700 dark:text-zinc-300">
                                          <span className="font-bold text-green-600 dark:text-green-400 block text-[9px] uppercase font-mono">Vantagem:</span>
                                          <span>{m.perk}</span>
                                        </div>
                                      </div>

                                      <div className="relative z-10 pt-4 mt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                                        {isReached ? (
                                          <button
                                            type="button"
                                            onClick={() => handleTriggerMilestoneCelebration(m)}
                                            className="w-full py-2 px-3 bg-yellow-500 hover:bg-yellow-400 text-black font-mono font-black text-[9px] uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                                          >
                                            <Sparkles size={11} className="fill-black" />
                                            <span>Rever Celebração com Troféus 🎉</span>
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              addSimulatedPoints('BONUS', `🎯 Conquista do Marco: ${m.title}`, diff);
                                            }}
                                            className="w-full py-2 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-mono font-bold text-[9px] uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1"
                                          >
                                            <span>Alcançar Marco (+{diff} PTS)</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* RESTRICTION WARNING & ACADEMY CHECK-IN */}
                      <div className="p-8 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                        <h4 className="text-sm font-black uppercase tracking-tight text-black dark:text-white flex items-center gap-2 mb-3">
                          <Building2 size={18} className="text-green-600" /> Check-in de Treinos OSS.OS
                        </h4>
                        <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
                          Para garantir a integridade da pontuação, <strong>o check-in de treino só pode ser realizado em Academias Cadastradas no Portal</strong>. Se a sua academia ou dojô não estiver listado abaixo, o seu Professor ou Diretor deve registrá-la agora mesmo preenchendo o formulário de cadastro técnico.
                        </p>

                        {!showRegisterAcademy ? (
                          <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="flex-1">
                                <label className="block text-[9px] font-mono font-black uppercase text-zinc-400 mb-1.5">Selecione o seu Dojô Cadastrado</label>
                                <select
                                  value={selectedAcademyId}
                                  onChange={(e) => setSelectedAcademyId(e.target.value)}
                                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs p-3 font-bold rounded-none outline-none focus:border-green-600 transition-colors"
                                >
                                  <option value="">-- SELECIONE SUA ACADEMIA --</option>
                                  {academies.map((aca) => (
                                    <option key={aca.id} value={aca.id}>
                                      🥋 {aca.name} (Prof. {aca.professor}) — {aca.location}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="flex items-end">
                                <Button
                                  onClick={handleAcademyCheckIn}
                                  disabled={!selectedAcademyId}
                                  className={`w-full sm:w-auto rounded-none font-black text-[10px] tracking-widest py-6 px-8 uppercase flex items-center gap-2 ${
                                    selectedAcademyId 
                                      ? 'bg-green-600 text-white hover:bg-green-500 shadow-md' 
                                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                                  }`}
                                >
                                  Confirmar Presença (+50 pts)
                                </Button>
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                              <p className="text-[10px] text-zinc-400 italic font-medium">Sua academia não está lista? Avise seu professor ou mestre!</p>
                              <Button
                                variant="outline"
                                onClick={() => setShowRegisterAcademy(true)}
                                className="border-dashed border-zinc-350 hover:border-black rounded-none text-[9px] font-black tracking-widest py-4 px-4 uppercase flex items-center gap-1.5"
                              >
                                <Plus size={12} /> Cadastrar Nova Academia
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <motion.form 
                            onSubmit={handleRegisterAcademy}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-white dark:bg-zinc-950 p-6 border border-zinc-200 dark:border-zinc-850 space-y-4"
                          >
                            <h5 className="text-[10px] font-black uppercase tracking-wider text-green-600 flex items-center gap-2">
                              🥋 REGISTRO OFICIAL DE DOJO / FILIAL
                            </h5>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-[8px] font-mono font-black uppercase text-zinc-400 mb-1">Nome da Academia</label>
                                <input
                                  type="text"
                                  placeholder="Ex: Alliance Vila Mariana"
                                  value={newAcademyName}
                                  onChange={(e) => setNewAcademyName(e.target.value)}
                                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs p-3 font-bold rounded-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] font-mono font-black uppercase text-zinc-400 mb-1">Professor Responsável (Faixa Preta)</label>
                                <input
                                  type="text"
                                  placeholder="Ex: Mestre Fabio Gurgel"
                                  value={newAcademyProfessor}
                                  onChange={(e) => setNewAcademyProfessor(e.target.value)}
                                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs p-3 font-bold rounded-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] font-mono font-black uppercase text-zinc-400 mb-1">Cidade / Estado</label>
                                <input
                                  type="text"
                                  placeholder="Ex: São Paulo - SP"
                                  value={newAcademyLocation}
                                  onChange={(e) => setNewAcademyLocation(e.target.value)}
                                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs p-3 font-bold rounded-none"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowRegisterAcademy(false)}
                                className="rounded-none font-black text-[9px] uppercase tracking-widest py-3 h-auto"
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="submit"
                                className="bg-black hover:bg-green-600 text-white rounded-none font-black text-[9px] uppercase tracking-widest py-3 px-6 h-auto"
                              >
                                Cadastrar Academia (+100 Bônus)
                              </Button>
                            </div>
                          </motion.form>
                        )}
                      </div>

                      {/* LOYALTY REWARDS SELECTION */}
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-black dark:text-white flex items-center gap-2">
                          <Gift size={14} className="text-green-600" /> Recompensas Disponíveis para Resgate
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {DIGITAL_REWARDS.map((reward) => {
                            const size = points >= reward.pointsCost;
                            return (
                              <div key={reward.id} className="p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-350 dark:hover:border-zinc-700 transition-all flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between items-start mb-3">
                                    <Badge className="bg-zinc-500 rounded-none text-white font-mono uppercase text-[8px] tracking-wider italic">
                                      {reward.type === 'SORTEIO' ? 'Sorteio Equipamento' : reward.type === 'EBOOK' ? 'E-Book Técnico' : 'Guia Atleta'}
                                    </Badge>
                                    <span className="text-xs font-black font-mono text-green-600 dark:text-green-400">{reward.pointsCost} PTS</span>
                                  </div>
                                  <h5 className="text-xs font-black uppercase text-black dark:text-white tracking-tight mb-1">{reward.title}</h5>
                                  <p className="text-[11px] text-zinc-500 font-medium leading-relaxed mb-6">{reward.description}</p>
                                </div>
                                <Button
                                  disabled={!size}
                                  onClick={() => handleRedeemDigitalReward(reward)}
                                  className={`w-full rounded-none font-black text-[9px] uppercase tracking-widest py-5 ${
                                    size 
                                      ? 'bg-black text-white hover:bg-green-600' 
                                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed'
                                  }`}
                                >
                                  {reward.type === 'SORTEIO' ? 'Adquirir Bilhete Sorteio' : 'Desbloquear Material'}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* UNLOCKED DIGITAL REWARDS & TICKETS */}
                      {unlockedRewards.length > 0 && (
                        <div className="p-6 border border-dashed border-green-600/30 bg-green-50/5 dark:bg-green-950/5">
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-green-600 flex items-center gap-2 mb-4">
                            <BookOpen size={14} /> Seus Prêmios Desbloqueados & Bilhetes de Sorteio
                          </h5>
                          
                          <div className="space-y-3">
                            {unlockedRewards.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-mono uppercase font-black text-zinc-400">{item.type}</span>
                                    <span className="text-[8px] text-zinc-400">{item.unlockedAt}</span>
                                  </div>
                                  <span className="block text-xs font-black text-black dark:text-white uppercase tracking-tight mt-0.5">{item.title}</span>
                                  <span className="inline-block mt-1 font-mono text-[10px] text-green-600 font-bold bg-green-500/10 px-2 py-0.5">
                                    {item.type === 'SORTEIO' ? 'Nº CUPOM DE SORTEIO: ' : 'CHAVE DE ACESSO PDF: '} {item.accessCode}
                                  </span>
                                </div>

                                <Button
                                  variant="secondary"
                                  onClick={() => copyToClipboard(item.accessCode)}
                                  className="h-10 rounded-none text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5"
                                >
                                  {copiedCoupon === item.accessCode ? (
                                    <>
                                      <CheckCircle2 size={12} className="text-green-600" /> COPIADO
                                    </>
                                  ) : (
                                    <>
                                      {item.type === 'SORTEIO' ? <Copy size={11} /> : <Download size={11} />} {item.type === 'SORTEIO' ? 'Copiar Bilhete' : 'Download Link'}
                                    </>
                                  )}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Points Breakdown / Transaction Extrato */}
                      <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-900">
                          <div>
                            <span className="text-[9px] font-mono font-black text-green-600 dark:text-green-500 uppercase tracking-widest block mb-0.5">
                              PAINEL DE CONTROLE DE PONTUAÇÃO
                            </span>
                            <h5 className="text-sm font-black uppercase tracking-tight text-black dark:text-white flex items-center gap-2">
                              <Award size={16} className="text-green-600" /> Extrato Detalhado de Transações de Pontos (OSS Points)
                            </h5>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800">
                              {filteredPointsHistory.length} de {pointsHistory.length} lançamentos
                            </span>
                          </div>
                        </div>

                        {/* Summary Metrics Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80">
                            <span className="block text-[8px] font-mono text-zinc-500 uppercase font-black">Total Acumulado</span>
                            <span className="text-sm font-black font-mono text-green-600 dark:text-green-400">
                              +{historyCounts.totalEarned} PTS
                            </span>
                          </div>
                          <div className="p-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
                            <span className="block text-[8px] font-mono text-amber-600 dark:text-amber-400 uppercase font-black">Check-in Diário</span>
                            <span className="text-sm font-black font-mono text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <Flame size={12} className="fill-current" /> +{historyCounts.checkinPts} PTS
                            </span>
                          </div>
                          <div className="p-3 bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20">
                            <span className="block text-[8px] font-mono text-purple-600 dark:text-purple-400 uppercase font-black">Compras Indicadas</span>
                            <span className="text-sm font-black font-mono text-purple-600 dark:text-purple-400 flex items-center gap-1">
                              <ShoppingBag size={12} /> +{historyCounts.purchasePts} PTS
                            </span>
                          </div>
                          <div className="p-3 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20">
                            <span className="block text-[8px] font-mono text-rose-600 dark:text-rose-400 uppercase font-black">Pontos Resgatados</span>
                            <span className="text-sm font-black font-mono text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <Ticket size={12} /> -{historyCounts.redeemedPts} PTS
                            </span>
                          </div>
                        </div>

                        {/* Controls: Filter Tabs & Search Bar */}
                        <div className="space-y-3 pt-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              onClick={() => setHistoryFilter('ALL')}
                              className={`px-3 py-1.5 text-[9px] font-mono font-black uppercase tracking-wider transition-all border cursor-pointer ${
                                historyFilter === 'ALL'
                                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                                  : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                              }`}
                            >
                              Todos ({historyCounts.all})
                            </button>
                            <button
                              onClick={() => setHistoryFilter('CHECKIN')}
                              className={`px-3 py-1.5 text-[9px] font-mono font-black uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-1 ${
                                historyFilter === 'CHECKIN'
                                  ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                                  : 'bg-zinc-50 dark:bg-zinc-900 text-amber-600 dark:text-amber-400 border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50'
                              }`}
                            >
                              <Flame size={10} className="fill-current" /> Check-in Diário ({historyCounts.checkin})
                            </button>
                            <button
                              onClick={() => setHistoryFilter('PURCHASE')}
                              className={`px-3 py-1.5 text-[9px] font-mono font-black uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-1 ${
                                historyFilter === 'PURCHASE'
                                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                  : 'bg-zinc-50 dark:bg-zinc-900 text-purple-600 dark:text-purple-400 border-zinc-200 dark:border-zinc-800 hover:border-purple-500/50'
                              }`}
                            >
                              <ShoppingBag size={10} /> Compras ({historyCounts.purchase})
                            </button>
                            <button
                              onClick={() => setHistoryFilter('REDEEM')}
                              className={`px-3 py-1.5 text-[9px] font-mono font-black uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-1 ${
                                historyFilter === 'REDEEM'
                                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                                  : 'bg-zinc-50 dark:bg-zinc-900 text-rose-600 dark:text-rose-400 border-zinc-200 dark:border-zinc-800 hover:border-rose-500/50'
                              }`}
                            >
                              <Ticket size={10} /> Resgates ({historyCounts.redeem})
                            </button>
                            <button
                              onClick={() => setHistoryFilter('REVIEW')}
                              className={`px-3 py-1.5 text-[9px] font-mono font-black uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-1 ${
                                historyFilter === 'REVIEW'
                                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                  : 'bg-zinc-50 dark:bg-zinc-900 text-amber-600 dark:text-amber-400 border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50'
                              }`}
                            >
                              <Star size={10} /> Opiniões ({historyCounts.review})
                            </button>
                            <button
                              onClick={() => setHistoryFilter('BONUS')}
                              className={`px-3 py-1.5 text-[9px] font-mono font-black uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-1 ${
                                historyFilter === 'BONUS'
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                  : 'bg-zinc-50 dark:bg-zinc-900 text-blue-600 dark:text-blue-400 border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50'
                              }`}
                            >
                              <Gift size={10} /> Bônus ({historyCounts.bonus})
                            </button>
                          </div>

                          <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                              type="text"
                              value={historySearchQuery}
                              onChange={(e) => setHistorySearchQuery(e.target.value)}
                              placeholder="Filtrar lançamentos por palavra-chave ou data..."
                              className="w-full pl-9 pr-8 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-green-600 transition-all font-mono"
                            />
                            {historySearchQuery && (
                              <button
                                onClick={() => setHistorySearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white text-xs"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* List of Filtered Transactions */}
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1 no-scrollbar pt-2">
                          {filteredPointsHistory.length === 0 ? (
                            <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 space-y-2">
                              <p className="text-xs font-mono font-bold text-zinc-500 uppercase">Nenhum lançamento encontrado para este filtro.</p>
                              {(historyFilter !== 'ALL' || historySearchQuery) && (
                                <button
                                  onClick={() => { setHistoryFilter('ALL'); setHistorySearchQuery(''); }}
                                  className="text-[10px] font-mono font-black text-green-600 dark:text-green-400 underline uppercase cursor-pointer"
                                >
                                  Limpar filtros e exibir todas
                                </button>
                              )}
                            </div>
                          ) : (
                            filteredPointsHistory.map((tx) => {
                              const isPositive = tx.points > 0;
                              let icon = <Award size={12} />;
                              let typeLabel = "Treino";
                              let iconColor = "text-green-600 bg-green-50/50 dark:bg-green-950/20";
                              
                              const isCheckInTx = tx.type === 'CHECKIN' || tx.description.toLowerCase().includes('check-in') || tx.description.toLowerCase().includes('diário');

                              if (isCheckInTx) {
                                icon = <Flame size={12} className="fill-current text-orange-500" />;
                                typeLabel = "Check-in Diário";
                                iconColor = "text-orange-500 bg-orange-50 dark:bg-orange-950/45 border border-orange-500/20";
                              } else {
                                switch(tx.type) {
                                  case 'WELCOME':
                                    icon = <Gift size={12} />;
                                    typeLabel = "Boas-vindas";
                                    iconColor = "text-blue-500 bg-blue-50 dark:bg-blue-950/45";
                                    break;
                                  case 'PURCHASE':
                                    icon = <ShoppingBag size={12} />;
                                    typeLabel = "Compra Afiliada";
                                    iconColor = "text-purple-500 bg-purple-50 dark:bg-purple-950/45";
                                    break;
                                  case 'REVIEW':
                                    icon = <Star size={12} className="fill-current text-amber-500" />;
                                    typeLabel = "Opinião / Review";
                                    iconColor = "text-amber-500 bg-amber-50 dark:bg-amber-950/45";
                                    break;
                                  case 'TRAINING':
                                    icon = <Award size={12} />;
                                    typeLabel = "Atividade Tatame";
                                    iconColor = "text-green-500 bg-green-50 dark:bg-green-955/20";
                                    break;
                                  case 'REDEEM':
                                    icon = <Ticket size={12} />;
                                    typeLabel = "Resgate de Prêmio";
                                    iconColor = "text-rose-500 bg-rose-50 dark:bg-rose-955/20";
                                    break;
                                  default:
                                    icon = <Gift size={12} />;
                                    typeLabel = "Bônus Especial";
                                    iconColor = "text-blue-500 bg-blue-50 dark:bg-blue-950/45";
                                    break;
                                }
                              }

                              return (
                                <div key={tx.id} className="flex justify-between items-center p-3 border border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all">
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${iconColor} flex items-center justify-center shrink-0`}>
                                      {icon}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-mono font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{typeLabel}</span>
                                        <span className="text-[8px] font-mono text-zinc-400">{tx.date}</span>
                                      </div>
                                      <span className="block text-[11px] font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight mt-0.5">{tx.description}</span>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0 pl-3">
                                    <span className={`text-[11px] font-mono font-black italic ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                      {isPositive ? '+' : ''}{tx.points} <span className="text-[8px] font-mono uppercase font-bold text-zinc-400">PTS</span>
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Como Ganhar Pontos */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { title: 'DOJO CHECK-IN', desc: `Ganhe 50 pontos por cada treino presencial confirmado nas academias listadas e parceiras do portal.` },
                          { title: 'OPINIÃO DO TATAME', desc: `Escreva análises sinceras sobre kimonos e faixas para faturar +${loyaltyReviewBonus} pontos.` },
                          { title: 'BÔNUS ACADEMIA', desc: `Ganhe 100 pontos ao ser o primeiro a indicar e cadastrar sua academia em nossa central técnica.` }
                        ].map((card, idx) => (
                          <div key={idx} className="p-5 border border-zinc-100 dark:border-zinc-800 bg-zinc-50/20">
                            <span className="block text-[10px] font-black tracking-widest text-zinc-400 mb-2 uppercase">{card.title}</span>
                            <p className="text-[11px] text-zinc-500 font-normal leading-relaxed">{card.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'afiliado' && (
                <motion.div
                  key="afiliado"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  {/* Contextual Return Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={() => {
                        setActiveTab('geral');
                        playClickSound();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white text-[9px] font-mono font-black uppercase tracking-widest border border-zinc-300 dark:border-zinc-700 cursor-pointer transition-colors"
                    >
                      <ChevronLeft size={12} />
                      <span>← Voltar à Visão Geral do Atleta</span>
                    </button>
                    <span className="text-[10px] font-mono font-black text-green-600 uppercase tracking-widest">
                      🤝 MINHAS INDICAÇÕES & AFILIADO
                    </span>
                  </div>

                  <h4 className="text-xs font-black uppercase tracking-tighter mb-4">Links de Divulgação de Parceiro</h4>
                  <p className="text-xs text-zinc-550 leading-relaxed max-w-xl">
                    Utilize os links personalizados para faturar 5% de comissão de afiliado e converter pontos adicionais. 
                    Toda circulação ajuda financeiramente os lutadores e os 5 projetos sociais apoiados diretamente pelo portal.
                  </p>
                  
                  <div className="p-6 border border-zinc-150 dark:border-zinc-800 bg-zinc-50/30">
                    <span className="block text-[9px] font-mono text-zinc-400 mb-1">LINK DE RECOMENDAÇÃO GERAL</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-black dark:text-white flex-1 bg-white dark:bg-black p-3 border border-zinc-200 dark:border-zinc-850 truncate select-all">
                        https://oss.os/curadoria?ref={user?.uid?.substring(0, 8) || 'premium'}
                      </span>
                      <Button
                        onClick={() => copyToClipboard(`https://oss.os/curadoria?ref=${user?.uid?.substring(0, 8) || 'premium'}`)}
                        className="rounded-none font-black text-[10px] tracking-widest py-6"
                      >
                        {copiedCoupon === `https://oss.os/curadoria?ref=${user?.uid?.substring(0, 8) || 'premium'}` ? "COPIADO! 🥋" : "COPIAR LINK"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'privacidade' && (
                <motion.div
                  key="privacidade"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-8"
                >
                  {/* Contextual Return Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={() => {
                        setActiveTab('geral');
                        playClickSound();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white text-[9px] font-mono font-black uppercase tracking-widest border border-zinc-300 dark:border-zinc-700 cursor-pointer transition-colors"
                    >
                      <ChevronLeft size={12} />
                      <span>← Voltar à Visão Geral do Atleta</span>
                    </button>
                    <span className="text-[10px] font-mono font-black text-green-600 uppercase tracking-widest">
                      🇧🇷 PRIVACIDADE & LGPD
                    </span>
                  </div>

                  <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <span className="text-[8px] font-mono font-black text-green-600 dark:text-green-400 uppercase tracking-[0.2em] block mb-1">
                      // CONTROLE_DE_PRIVACIDADE_LGPD (LEI 13.709/18)
                    </span>
                    <h4 className="text-lg font-black uppercase tracking-tight">Meus Dados & Direitos Legais</h4>
                    <p className="text-xs text-zinc-400 font-serif italic leading-relaxed mt-1">
                      O Portal OSS.OS opera sob diretrizes estritas da Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                      Abaixo você pode customizar seus consentimentos, obter portabilidade instantânea ou revogar todo processamento de dados do aplicativo.
                    </p>
                  </div>

                  {/* LGPD Message status alert */}
                  {lgpdMessage && (
                    <div className="p-4 bg-green-50 text-green-800 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900 font-mono text-[10px] uppercase font-bold tracking-tight">
                      {lgpdMessage}
                    </div>
                  )}

                  {/* SECTION 1: Consent management checkboxes */}
                  <div className="space-y-4">
                    <h5 className="font-mono text-xs font-black uppercase tracking-wider text-zinc-550">// Gerenciar Consentimentos</h5>
                    
                    <div className="space-y-3">
                      {/* Consent 1: Cadastral */}
                      <div className="p-5 border border-zinc-150 dark:border-zinc-850 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-3">
                        <div className="flex items-start gap-4">
                          <input 
                            type="checkbox"
                            id="consent-cadastral"
                            checked={userLgpdConsents.approvedCadastral}
                            onChange={(e) => {
                              const nextConsents = { ...userLgpdConsents, approvedCadastral: e.target.checked };
                              handleSaveConsentToFirestore(nextConsents);
                            }}
                            className="mt-1 accent-green-600 cursor-pointer w-4 h-4 shrink-0"
                          />
                          <div>
                            <label htmlFor="consent-cadastral" className="font-mono text-xs font-black uppercase cursor-pointer select-none text-zinc-800 dark:text-zinc-200 block">
                              Processamento de Dados Cadastrais de Atleta (Essencial)
                            </label>
                            <p className="text-[11px] text-zinc-450 leading-relaxed mt-1">
                              Autoriza o armazenamento do seu nome de exibição, e-mail, faixa de jiu-jitsu e vínculo de academia no Firestore para atualização de rankings, estatísticas e atribuições corretas de pontos de fidelidade.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Consent 2: Wishlist Alerts */}
                      <div className="p-5 border border-zinc-150 dark:border-zinc-850 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-3">
                        <div className="flex items-start gap-4">
                          <input 
                            type="checkbox"
                            id="consent-wishlist"
                            checked={userLgpdConsents.approvedWishlistAlerts}
                            onChange={(e) => {
                              const nextConsents = { ...userLgpdConsents, approvedWishlistAlerts: e.target.checked };
                              handleSaveConsentToFirestore(nextConsents);
                            }}
                            className="mt-1 accent-green-600 cursor-pointer w-4 h-4 shrink-0"
                          />
                          <div>
                            <label htmlFor="consent-wishlist" className="font-mono text-xs font-black uppercase cursor-pointer select-none text-zinc-800 dark:text-zinc-200 block">
                              Autorização para Rastreamento e Alertas de Wishlist (Opcional)
                            </label>
                            <p className="text-[11px] text-zinc-450 leading-relaxed mt-1">
                              Autoriza a plataforma a salvar localmente e no banco de dados os kimonos e faixas adicionados por você à lista de desejos para fácil organização e acompanhamento de itens salvos.
                            </p>
                            <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[9.5px] font-mono text-zinc-500 dark:text-zinc-400">
                                Notificações push via Service Worker para avisos de queda de preço e estoque:
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab('notificacoes');
                                  playClickSound();
                                }}
                                className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black hover:bg-green-600 hover:text-white dark:hover:bg-green-600 dark:hover:text-white font-mono text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                              >
                                <BellRing size={11} /> Gerenciar Notificações Push
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Consent 3: Navigation Tracking */}
                      <div className="p-5 border border-zinc-150 dark:border-zinc-850 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-3">
                        <div className="flex items-start gap-4">
                          <input 
                            type="checkbox"
                            id="consent-navigation"
                            checked={userLgpdConsents.approvedNavigation}
                            onChange={(e) => {
                              const nextConsents = { ...userLgpdConsents, approvedNavigation: e.target.checked };
                              handleSaveConsentToFirestore(nextConsents);
                            }}
                            className="mt-1 accent-green-600 cursor-pointer w-4 h-4 shrink-0"
                          />
                          <div>
                            <label htmlFor="consent-navigation" className="font-mono text-xs font-black uppercase cursor-pointer select-none text-zinc-800 dark:text-zinc-200 block">
                              Consentimento para Coleta de Dados de Navegação / Analytics (Opcional)
                            </label>
                            <p className="text-[11px] text-zinc-450 leading-relaxed mt-1">
                              Autoriza a rastrear as categorias e produtos clicados para gerar relatórios de uso e melhorias contínuas na usabilidade do portal. Você pode revogar este consentimento a qualquer momento.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Consent 4: Cookies */}
                      <div className="p-5 border border-zinc-150 dark:border-zinc-850 bg-zinc-50/20 dark:bg-zinc-950/20 opacity-85">
                        <div className="flex items-start gap-4">
                          <input 
                            type="checkbox"
                            id="consent-cookies"
                            checked={true}
                            disabled
                            className="mt-1 accent-green-600 cursor-not-allowed w-4 h-4 shrink-0"
                          />
                          <div>
                            <span className="font-mono text-xs font-black uppercase select-none text-zinc-400 block">
                              Uso de Cookies de Sessão e Segurança (Obrigatório)
                            </span>
                            <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">
                              Utilização de tokens locais temporários e cookies para resguardar a integridade técnica do portal, impedir requisições fraudulentas de robôs e manter a integridade da sua sessão ativa.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: Portability & Forgotten Rights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* Portability */}
                    <div className="p-6 border border-zinc-150 dark:border-zinc-805 bg-zinc-50/10 space-y-4">
                      <span className="text-[8px] font-mono text-zinc-400 block uppercase tracking-wider">// PORTABILIDADE_ART_18_V</span>
                      <h5 className="font-black uppercase text-xs">EXPORTAR MEUS DADOS (JSON)</h5>
                      <p className="text-[11px] text-zinc-450 leading-relaxed">
                        Baixe instantaneamente um arquivo de auditoria completo contendo suas informações, histórico de treinos registrados, pontos acumulados e log estruturado de consentimentos eletrônicos salvos no sistema.
                      </p>
                      <Button
                        onClick={handleExportDataForLGPD}
                        className="w-full bg-black text-white hover:bg-zinc-800 dark:hover:bg-zinc-850 rounded-none text-[9px] font-black uppercase tracking-widest py-6"
                      >
                        EXPORTAR DADOS COMPLETOS
                      </Button>
                    </div>

                    {/* Forgotten Act */}
                    <div className="p-6 border border-red-200/50 dark:border-red-950/30 bg-red-500/5 space-y-4">
                      <span className="text-[8px] font-mono text-red-500 block uppercase tracking-wider">// DIREITO_AO_ESQUECIMENTO_ART_18_VI</span>
                      <h5 className="font-black uppercase text-xs text-red-600 dark:text-red-400">EXCLUIR CONTA & DADOS</h5>
                      <p className="text-[11px] text-zinc-450 leading-relaxed">
                        Esta ação excluirá permanentemente seu perfil de atleta, zerará seus pontos de fidelidade acumulados e desvinculará seu histórico em conformidade integral com a LGPD. <strong>Isso não pode ser desfeito.</strong>
                      </p>
                      
                      <div className="space-y-2">
                        <label className="block text-[8px] font-mono text-zinc-400 uppercase tracking-tight">Digite "EXCLUIR" para confirmar:</label>
                        <input 
                          type="text"
                          placeholder="EXCLUIR"
                          value={deleteConfirmationText}
                          onChange={(e) => setDeleteConfirmationText(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-black border border-red-200 dark:border-red-950 text-xs font-mono font-black placeholder-zinc-300 dark:placeholder-zinc-800 uppercase focus:outline-none focus:ring-1 focus:ring-red-500 bg-transparent"
                        />
                      </div>

                      <Button
                        onClick={handlePurgeAccountDataForLGPD}
                        disabled={isDeletingAccount || deleteConfirmationText !== 'EXCLUIR'}
                        className="w-full bg-red-650 text-white hover:bg-black rounded-none text-[9px] font-black uppercase tracking-widest py-6 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeletingAccount ? "PROCESSANDO EXCLUSÃO..." : "EXCLUIR MEUS DADOS DO PORTAL"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* DOJO & CT MANAGEMENT TAB */}
              {activeTab === 'dojo' && (
                <motion.div
                  key="dojo"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={() => {
                        setActiveTab('geral');
                        playClickSound();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white text-[9px] font-mono font-black uppercase tracking-widest border border-zinc-300 dark:border-zinc-700 cursor-pointer transition-colors"
                    >
                      <ChevronLeft size={12} />
                      <span>← Voltar ao Portal do Atleta</span>
                    </button>
                    <span className="text-[10px] font-mono font-black text-green-600 uppercase tracking-widest">
                      🏢 PAINEL DE GESTÃO DO DOJO & CT
                    </span>
                  </div>
                  <DojoManagementPanel user={user} addToast={addToast} playClickSound={playClickSound} />
                </motion.div>
              )}

              {/* STORE PARTNER & BRAND TAB */}
              {activeTab === 'lojista' && (
                <motion.div
                  key="lojista"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={() => {
                        setActiveTab('geral');
                        playClickSound();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white text-[9px] font-mono font-black uppercase tracking-widest border border-zinc-300 dark:border-zinc-700 cursor-pointer transition-colors"
                    >
                      <ChevronLeft size={12} />
                      <span>← Voltar ao Portal do Atleta</span>
                    </button>
                    <span className="text-[10px] font-mono font-black text-blue-600 uppercase tracking-widest">
                      🛍️ PAINEL DE LOJISTA & MARCA PARCEIRA
                    </span>
                  </div>
                  <StorePartnerPanel user={user} addToast={addToast} playClickSound={playClickSound} />
                </motion.div>
              )}

              {/* GLOBAL ADMIN & MODERATION TAB */}
              {activeTab === 'admin' && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={() => {
                        setActiveTab('geral');
                        playClickSound();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white text-[9px] font-mono font-black uppercase tracking-widest border border-zinc-300 dark:border-zinc-700 cursor-pointer transition-colors"
                    >
                      <ChevronLeft size={12} />
                      <span>← Voltar ao Portal do Atleta</span>
                    </button>
                    <span className="text-[10px] font-mono font-black text-red-600 uppercase tracking-widest">
                      🛡️ PAINEL MASTER GLOBAL & MODERAÇÃO
                    </span>
                  </div>
                  <AdminGlobalPanel user={user} addToast={addToast} playClickSound={playClickSound} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      {/* Badge Unlock Congratulations Celebration Overlay */}
      <AnimatePresence>
        {unlockedCongratsBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-default select-none"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-zinc-50 dark:bg-zinc-900 w-full max-w-lg border border-zinc-200 dark:border-zinc-800 p-8 sm:p-12 relative text-center shadow-2xl text-black dark:text-white rounded-none"
            >
              <button
                onClick={() => setUnlockedCongratsBadge(null)}
                className="absolute top-4 right-4 p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
              >
                <X size={16} />
              </button>

              <div className="mb-6 relative flex justify-center mt-4">
                {/* Glowing effect background rings */}
                <div className="absolute inset-0 w-24 h-24 bg-green-500/10 blur-xl rounded-full mx-auto" />
                <div className={`p-6 bg-gradient-to-r ${unlockedCongratsBadge.color} flex items-center justify-center shadow-lg relative z-10 w-20 h-20`}>
                  {getBadgeIcon(unlockedCongratsBadge.icon, "w-10 h-10 text-white")}
                </div>
              </div>

              <span className="text-[9px] font-mono font-black text-green-600 dark:text-green-400 uppercase tracking-widest block mb-2">CONQUISTA HISTÓRICA DO TATAME</span>
              <h3 className="text-3xl font-black uppercase tracking-tighter italic -skew-x-6 mb-2">
                {unlockedCongratsBadge.title}
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider mb-4">Requisito: {unlockedCongratsBadge.requirement}</p>
              
              <div className="p-4 border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-950 mb-8 max-w-sm mx-auto text-center">
                <p className="text-xs text-zinc-500 leading-relaxed font-semibold italic">
                  "{unlockedCongratsBadge.description}"
                </p>
              </div>

              <Button
                onClick={() => setUnlockedCongratsBadge(null)}
                className="w-full bg-black hover:bg-green-600 text-white rounded-none py-6 text-[10px] font-black uppercase tracking-widest mt-2"
              >
                Oss! Entendido
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Belt Promotion Congratulations Celebration Overlay */}
      <AnimatePresence>
        {beltPromotionCongrats && (() => {
          const totalMinutes = trainingLogs ? trainingLogs.reduce((acc, log) => acc + log.duration, 0) : 0;
          const totalHours = (totalMinutes / 60).toFixed(1);
          const totalSessions = trainingLogs ? trainingLogs.length : 0;
          const totalMedals = medals ? medals.length : 0;

          // Dynamic theme color based on the promoted belt
          let themeColor = '#cc0000';
          let borderGlow = 'shadow-[0_0_55px_rgba(204,0,0,0.25)]';
          if (beltPromotionCongrats.newBelt === 'Faixa Azul') {
            themeColor = '#1d4ed8';
            borderGlow = 'shadow-[0_0_55px_rgba(29,78,216,0.35)]';
          } else if (beltPromotionCongrats.newBelt === 'Faixa Roxa') {
            themeColor = '#7e22ce';
            borderGlow = 'shadow-[0_0_55px_rgba(126,34,206,0.35)]';
          } else if (beltPromotionCongrats.newBelt === 'Faixa Marrom') {
            themeColor = '#78350f';
            borderGlow = 'shadow-[0_0_55px_rgba(120,53,15,0.35)]';
          } else if (beltPromotionCongrats.newBelt === 'Faixa Preta') {
            themeColor = '#18181b';
            borderGlow = 'shadow-[0_0_55px_rgba(255,255,255,0.15)]';
          } else {
            themeColor = '#e4e4e7';
            borderGlow = 'shadow-[0_0_55px_rgba(255,255,255,0.25)]';
          }

          const beltQuotes: Record<string, string> = {
            'Faixa Branca': 'O início de tudo. Onde cada rolada é um aprendizado e a paciência é sua maior aliada. Mantenha a mente aberta e continue vindo treinar.',
            'Faixa Azul': 'A faixa da sobrevivência e da consolidação técnica. Você superou a fase inicial de incompreensão; agora é hora de construir seus próprios ataques e refinar sua defesa. Parabéns, graduado!',
            'Faixa Roxa': 'A faixa do refinamento e da arte fluida. É onde você começa a antecipar movimentos e a desenvolver sua identidade no tatame. A jornada técnica agora se torna pessoal.',
            'Faixa Marrom': 'A antessala da maestria. Suas técnicas são sólidas e eficientes. Agora, o foco está na precisão milimétrica, no tempo de reação e na mentoria dos mais novos.',
            'Faixa Preta': 'O nascimento do verdadeiro praticante. A faixa preta não é o fim, mas sim um recomeço consciente. Você domina o básico com perfeição e se tornou uma referência viva da arte suave. OSS!'
          };

          const activeQuote = beltQuotes[beltPromotionCongrats.newBelt] || 'Uma jornada de persistência e evolução técnica nos tatames. OSS!';

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-default select-none overflow-y-auto"
            >
              {/* Particle Background */}
              <BeltParticlesCanvas belt={beltPromotionCongrats.newBelt} />

              <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                style={{ borderColor: themeColor }}
                className={`bg-zinc-950 w-full max-w-xl border-4 p-6 sm:p-10 relative text-center text-white rounded-none z-20 ${borderGlow} my-auto`}
              >
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />

                <button
                  onClick={() => setBeltPromotionCongrats(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors z-30"
                >
                  <X size={16} />
                </button>

                <div className="mb-4 relative flex justify-center mt-2">
                  <div className="absolute inset-0 w-24 h-24 bg-[#cc0000]/10 blur-xl rounded-full mx-auto animate-ping" />
                  <div className="p-5 bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-lg relative z-10 w-16 h-16 rounded-full">
                    <Trophy className="w-8 h-8 text-yellow-500 animate-bounce" />
                  </div>
                </div>

                <span className="text-[8px] font-mono font-black uppercase tracking-[0.2em] block mb-1 text-zinc-400">
                  🥋 GRADUAÇÃO TÉCNICA RECONHECIDA
                </span>
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter italic -skew-x-6 mb-1 text-white font-headline">
                  PARABÉNS PELA NOVA GRADUAÇÃO!
                </h3>
                <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest mb-4">
                  De <span className="text-zinc-500 line-through">{beltPromotionCongrats.oldBelt}</span> para <span className="text-green-500 font-bold font-black">{beltPromotionCongrats.newBelt}</span>
                </p>

                {/* Visual depiction of the new belt */}
                <div className="relative w-full h-8 border border-zinc-800 bg-zinc-900 flex items-center overflow-hidden shadow-inner max-w-md mx-auto mb-6">
                  <div className={`absolute inset-0 right-16 ${
                    beltPromotionCongrats.newBelt === 'Faixa Branca' ? 'bg-zinc-100' :
                    beltPromotionCongrats.newBelt === 'Faixa Azul' ? 'bg-blue-700' :
                    beltPromotionCongrats.newBelt === 'Faixa Roxa' ? 'bg-purple-800' :
                    beltPromotionCongrats.newBelt === 'Faixa Marrom' ? 'bg-amber-900' : 'bg-black'
                  }`} />
                  <div className={`absolute right-0 top-0 bottom-0 w-16 flex items-center justify-around px-2 ${
                    beltPromotionCongrats.newBelt === 'Faixa Preta' ? 'bg-red-700' : 'bg-black'
                  }`} />
                </div>

                {/* Accomplishments Summary (Resumo das Conquistas) */}
                <div className="text-left bg-zinc-900/55 border border-zinc-900 p-4 mb-6 rounded-none max-w-md mx-auto">
                  <span className="block text-[8px] font-mono font-black text-zinc-400 uppercase tracking-widest mb-3">
                    📊 RESUMO DE CONQUISTAS NO TATAME:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-black/40 p-2.5 border border-zinc-850">
                      <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                        <CheckCircle2 size={11} className="text-green-500" />
                        <span className="text-[8px] font-mono font-bold uppercase tracking-wider">Treinos</span>
                      </div>
                      <span className="text-sm font-black tracking-tight">{totalSessions} <span className="text-[9px] font-normal text-zinc-500">Sessões</span></span>
                    </div>

                    <div className="bg-black/40 p-2.5 border border-zinc-850">
                      <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                        <Clock size={11} className="text-[#cc0000]" />
                        <span className="text-[8px] font-mono font-bold uppercase tracking-wider">Tatame</span>
                      </div>
                      <span className="text-sm font-black tracking-tight">{totalHours}h <span className="text-[9px] font-normal text-zinc-500">Dedicadas</span></span>
                    </div>

                    <div className="bg-black/40 p-2.5 border border-zinc-850">
                      <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                        <Flame size={11} className="text-orange-500" />
                        <span className="text-[8px] font-mono font-bold uppercase tracking-wider">Streak</span>
                      </div>
                      <span className="text-sm font-black tracking-tight">{streak} <span className="text-[9px] font-normal text-zinc-500">Dias</span></span>
                    </div>

                    <div className="bg-black/40 p-2.5 border border-zinc-850">
                      <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                        <Trophy size={11} className="text-yellow-500" />
                        <span className="text-[8px] font-mono font-bold uppercase tracking-wider">Medalhas</span>
                      </div>
                      <span className="text-sm font-black tracking-tight">{totalMedals} <span className="text-[9px] font-normal text-zinc-500">Conquistas</span></span>
                    </div>

                    <div className="bg-black/40 p-2.5 border border-zinc-850 col-span-2 sm:col-span-2">
                      <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                        <Sparkles size={11} className="text-amber-400" />
                        <span className="text-[8px] font-mono font-bold uppercase tracking-wider">Pontuação Total</span>
                      </div>
                      <span className="text-sm font-black text-amber-400 tracking-tight">{points} <span className="text-[9px] font-normal text-zinc-500">OSS Points</span></span>
                    </div>
                  </div>
                </div>

                {/* Encouraging Word */}
                <div className="p-4 border border-zinc-900 bg-black max-w-md mx-auto text-center mb-6">
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold italic">
                    "{activeQuote}"
                  </p>
                </div>

                <Button
                  onClick={() => setBeltPromotionCongrats(null)}
                  style={{ backgroundColor: themeColor === '#18181b' ? '#cc0000' : themeColor }}
                  className="w-full text-white rounded-none py-6 text-[10px] font-black uppercase tracking-widest border border-black shadow-[0_4px_12px_rgba(204,0,0,0.3)] cursor-pointer hover:opacity-90 transition-opacity"
                >
                  OSS! RECEBER GRADUAÇÃO (+500 PTS)
                </Button>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Floating Trophies & Canvas Confetti Loyalty Milestone Celebration */}
      <LoyaltyMilestoneCelebration
        milestone={activeMilestoneCelebration}
        isOpen={isMilestoneCelebrationOpen}
        onClose={() => setIsMilestoneCelebrationOpen(false)}
        onNavigateToFidelidade={() => {
          setActiveTab('fidelidade');
          playClickSound();
        }}
        currentPoints={points}
      />
    </div>
  );
};

// @file src/App.tsx (UTF-8)
import { PriceAlertBadge } from "./components/PriceAlertBadge";
import { GlobalHeaderSearch } from "./components/GlobalHeaderSearch";
import ShopCatalogView from "./components/ShopCatalogView";
import React, { useState, useMemo, useEffect, lazy, Suspense, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Star, 
  Info,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  X,
  Link as LinkIcon,
  Save,
  Download,
  Heart,
  Newspaper,
  Mic,
  Search,
  Menu,
  Loader2,
  Share2,
  Check,
  CheckCircle2,
  Palette,
  ExternalLink,
  MicOff,
  Plus,
  ShoppingCart,
  MessageCircle,
  Home,
  Mail,
  Trophy,
  User,
  Settings,
  Play,
  Pause,
  Filter,
  Tag,
  Ruler,
  Users,
  Radio,
  Award,
  Zap,
  Flame,
  Sun,
  Moon,
  Laptop,
  Instagram,
  Facebook,
  Twitter,
  Wand2,
  Trash2,
  RefreshCw,
  ArrowRight,
  Store,
  ShoppingBag,
  Bell,
  BellOff,
  MapPin,
  Sparkles,
  Target,
  Layers,
  Shield,
  ShieldAlert,
  Activity,
  Cpu,
  Dumbbell,
  Calendar,
  BellRing,
  Minus,
  CreditCard,
  Copy,
  TrendingUp,
  Smartphone,
  PlusSquare,
  Scale,
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  MessageSquare,
  AlertTriangle,
  ShieldCheck,
  Lock,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import { fireCenterConfetti, fireFirstCartItemConfetti, firePurchaseCelebrationConfetti } from './lib/confetti';
const bjjHeroBanner = (typeof import.meta !== 'undefined' && import.meta && import.meta.url) ? new URL('./assets/images/jiujiteiro_white_gi_1783274643314.jpg', import.meta.url).href : '';
const bjjKimonoDetail = (typeof import.meta !== 'undefined' && import.meta && import.meta.url) ? new URL('./assets/images/jiujiteiro_belts_1783274698357.jpg', import.meta.url).href : '';
const bjjActionGrappling = (typeof import.meta !== 'undefined' && import.meta && import.meta.url) ? new URL('./assets/images/jiujiteiro_rashguard_1783274674365.jpg', import.meta.url).href : '';
import { products as initialProducts } from './data/products';
import { Category, Product, Gender, BlogPost, Review, ProductOffer, CartItem } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImageGenerator } from '@/components/ImageGenerator';
import { CustomVideoPlayer } from '@/components/CustomVideoPlayer';
import { Sidebar } from '@/components/Sidebar';
import { FilterDrawer } from './components/FilterDrawer';
import { ProductReviews } from '@/components/ProductReviews';
import { OssLogo } from '@/components/Logo';
import { PriceComparator } from '@/components/PriceComparator';
import { LanguageSelector } from '@/components/LanguageSelector';
import { CustomAudioPlayer } from '@/components/CustomAudioPlayer';
import { saveAudio as saveAudioToCache, getAudio as getAudioFromCache } from '@/src/lib/audioDb';
import PremiumProductCard from './components/PremiumProductCard';
import BlogContentStudio from './components/blog/BlogContentStudio';
import { DynamicSizeChart } from './components/DynamicSizeChart';
import { WolfWisdom } from '@/components/WolfWisdom';
import { WeightComparator } from '@/components/WeightComparator';
import { LandingFAQ } from './components/LandingFAQ';
import { EasyExchangePolicyModal } from './components/EasyExchangePolicyModal';
import { getProductPractitionerLevel, matchesCategoryFilter } from './lib/filterUtils';

// Heavy components optimized with React.lazy to reduce initial bundle size & TTI
const PriceHistoryChart = lazy(() => import('./components/PriceHistoryChart'));
const ProductComparisonModal = lazy(() => import('./components/ProductComparisonModal'));
const CatalogSeoAnalyzerModal = lazy(() => import('./components/CatalogSeoAnalyzerModal').then(m => ({ default: m.CatalogSeoAnalyzerModal })));
import { ProductReviewModal } from './components/ProductReviewModal';
import { FloatingCompareBar } from './components/FloatingCompareBar';
import { DealHighlightBanner } from './components/DealHighlightBanner';
import { ExternalShowcaseView } from './components/ExternalShowcaseView';
import { OfferNotificationsCenter } from './components/OfferNotificationsCenter';
import { ProfessionalFooter } from './components/ProfessionalFooter';
import { ToastContainer } from './components/ToastContainer';
import { AuthModal, GoogleLogoIcon, AppleLogoIcon, UserRole } from './components/AuthModal';
import { SocialShareModal } from './components/SocialShareModal';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { SystemErrorLog } from './components/SystemErrorLog';
import { KimonoLoader, KimonoIcon } from './components/KimonoLoader';
import { GearCategoryCarousel } from './components/GearCategoryCarousel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { 
  auth, 
  db, 
  set_up_firebase, 
  verifyAndInitializeFirebase, 
  FirebaseVerificationResult, 
  getProductsFromFirestore, 
  saveProductToFirestore, 
  saveProductReviewToFirestore,
  subscribeToProducts
} from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, OAuthProvider, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
const UserDashboard = lazy(() => import('@/components/UserDashboard').then(m => ({ default: m.UserDashboard })));
import { TechnicalLevelFilter } from './components/TechnicalLevelFilter';
import { ThemeSelector } from './components/ThemeSelector';
import { BlogComments } from '@/components/BlogComments';
import { NotificationSubscription } from './components/NotificationSubscription';
import { NotificationPermissionModal } from './components/NotificationPermissionModal';
import { NotificationOnboardingModal } from './components/NotificationOnboardingModal';
import { LGPDBanner } from './components/LGPDBanner';
import { usePersistence } from './hooks/usePersistence';
import { useProductJsonLd } from './hooks/useProductJsonLd';
import { LGPDModal } from './components/LGPDModal';
import { SEOHead } from './components/SEOHead';
import { LGPDConsentState } from './data/legalPolicies';
import { PartnerGyms } from './components/PartnerGyms';
import ImageOptimization from '@/components/ImageOptimization';
import BJJImage from '@/src/components/BJJImage';
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  orderBy, 
  Timestamp, 
  doc, 
  getDocFromServer,
  updateDoc,
  deleteDoc,
  getDocs,
  setDoc,
  getDoc,
  collectionGroup
} from 'firebase/firestore';

import { safeLocalStorage as localStorage, safeSessionStorage as sessionStorage } from './lib/storage';

const ArchiveSection = lazy(() => import('./components/blog/ArchiveSection'));
const FeaturedSection = lazy(() => import('./components/blog/FeaturedSection'));
const BlogSearchFilters = lazy(() => import('./components/blog/BlogSearchFilters'));

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRetryable = 
      retries > 0 && (
        error.message?.includes('429') || 
        error.message?.includes('RESOURCE_EXHAUSTED') || 
        error.status === 429 ||
        error.message?.includes('500') ||
        error.message?.includes('Rpc failed') ||
        error.status === 500
      );

    if (isRetryable) {
      console.warn(`AI call failed, retrying in ${delay}ms... (${retries} retries left)`, error);
      await sleep(delay);
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

// IndexedDB helper for audio storage
const AUDIO_DB_NAME = 'oss_audio_db';
const AUDIO_STORE_NAME = 'audio_blobs';

const openAudioDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(AUDIO_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(AUDIO_STORE_NAME)) {
        db.createObjectStore(AUDIO_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveAudioToDB = async (id: string, url: string | Blob) => {
  try {
    if (url instanceof Blob) {
      await saveAudioToCache(id, url);
    } else if (typeof url === 'string' && url.startsWith('data:')) {
      const blob = dataUrlToBlob(url);
      if (blob) await saveAudioToCache(id, blob);
    }
  } catch (e) {
    console.error("Failed to save audio to IDB:", e);
  }
};

const getAudioFromDB = async (id: string): Promise<string | null> => {
  try {
    const data = await getAudioFromCache(id);
    if (!data) return null;
    
    if (typeof data === 'string') return data;
    
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(data);
    });
  } catch (e) {
    console.error("Failed to get audio from IDB:", e);
    return null;
  }
};

const getAudioBlobFromDB = async (id: string): Promise<Blob | null> => {
  try {
    const data = await getAudioFromCache(id);
    if (!data) return null;
    if (data instanceof Blob) return data;
    if (typeof data === 'string' && data.startsWith('data:')) {
      return dataUrlToBlob(data);
    }
    return null;
  } catch (e) {
    console.error("Failed to get audio blob from IDB:", e);
    return null;
  }
};

const removeAudioFromDB = async (id: string) => {
  try {
    const db = await openAudioDB();
    const tx = db.transaction(AUDIO_STORE_NAME, 'readwrite');
    const store = tx.objectStore(AUDIO_STORE_NAME);
    store.delete(id);
  } catch (e) {
    console.error("Failed to remove audio from IDB:", e);
  }
};

const dataUrlToBlob = (dataUrl: string): Blob | null => {
  try {
    const parts = dataUrl.split(';base64,');
    if (parts.length !== 2) return null;
    const contentType = parts[0].split(':')[1];
    const raw = atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  } catch (e) {
    console.error("Error converting Data URL to Blob:", e);
    return null;
  }
};

// Utility to convert raw PCM 16-bit 24kHz to WAV
async function pcmToWavBlob(base64Pcm: string, sampleRate = 24000): Promise<Blob> {
  try {
    const binaryString = atob(base64Pcm);
    const len = binaryString.length;
    const buffer = new ArrayBuffer(44 + len);
    const view = new DataView(buffer);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    /* RIFF identifier */
    writeString(0, 'RIFF');
    /* chunk size */
    view.setUint32(4, 36 + len, true);
    /* WAVE identifier */
    writeString(8, 'WAVE');
    /* format chunk identifier */
    writeString(12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, 1, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 2, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    writeString(36, 'data');
    /* data chunk length */
    view.setUint32(40, len, true);

    const binaryView = new Uint8Array(buffer, 44);
    for (let i = 0; i < len; i++) {
      binaryView[i] = binaryString.charCodeAt(i);
    }

    return new Blob([buffer], { type: 'audio/wav' });
  } catch (error) {
    console.error("Error in pcmToWavBlob:", error);
    throw error;
  }
}

// Animated Hero Background Particles
const HeroParticles = () => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Background Stars */}
      {[...Array(80)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute w-[1px] h-[1px] bg-white rounded-full"
          initial={{ 
            x: `${Math.random() * 100}%`, 
            y: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.3 + 0.1,
          }}
          animate={{ 
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{ 
            duration: Math.random() * 5 + 3, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: Math.random() * -10
          }}
        />
      ))}
      
      {/* Orbiting Orbital Elements (Asteroids/Shapes) */}
      {[...Array(6)].map((_, i) => (
        <div key={`orbital-container-${i}`} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: `${600 + i * 150}px`, height: `${600 + i * 150}px` }}>
          <motion.div
            className="absolute rounded-full border border-white/5"
            style={{ width: '100%', height: '100%' }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 100 + i * 20, repeat: Infinity, ease: "linear" }}
          >
             <motion.div 
               className="absolute w-2 h-2 bg-white/10 rounded-full"
               style={{ top: '0', left: '50%', transform: 'translateX(-50%)' }}
               animate={{ opacity: [0.2, 0.6, 0.2] }}
               transition={{ duration: 4, repeat: Infinity }}
             />
          </motion.div>
        </div>
      ))}

      {/* Floating Particles/Dust */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`dust-${i}`}
          className="absolute bg-white/5 blur-[1px]"
          style={{ width: Math.random() * 4 + 2, height: Math.random() * 4 + 2, borderRadius: '50%' }}
          initial={{ 
            x: `${Math.random() * 100}%`, 
            y: '110%',
          }}
          animate={{ 
            y: '-10%',
            x: `${Math.random() * 100}%`,
          }}
          transition={{ 
            duration: Math.random() * 20 + 20, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * -40
          }}
        />
      ))}

      {/* Light Streak / Comet effect */}
      <motion.div 
        className="absolute w-[200px] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45"
        initial={{ x: '-100%', y: '-100%' }}
        animate={{ x: '200%', y: '200%' }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: 5 }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
    </div>
  );
};

const categories: Category[] = ['Kimonos', 'Rashguards', 'Bermudas', 'Faixas', 'Protetores', 'Acessórios', 'Equipamentos de Proteção', 'Serviços', 'Suplementos'];

type View = 'LANDING' | 'SHOP' | 'WISHLIST' | 'CONTACT' | 'SETTINGS' | 'DASHBOARD' | 'ABOUT' | 'TRANSPARENCY' | 'COMPARATOR' | 'EXTERNAL_SHOWCASE' | 'NOTIFICATIONS';

const bjjLegendsHall = '/images/bjj_legends_hall_1779888797302.png';

const bjjLegends = [
  {
    name: "Marcus Buchecha",
    titles: "13x",
    category: "Pesadíssimo / Absoluto",
    specialty: "Meia-Guarda Dinâmica & Pressão Surreais",
    quote: "A consistência treina o corpo, a resiliência forja o campeão definitivo.",
    highlights: [
      "Maior detentor de medalhas de ouro pretas mundiais masculinas da história",
      "Famoso por sua agilidade e velocidade de peso médio em corpo de super-pesado",
      "Lutador com mais vitórias consecutivas em lutas de campeonato do absoluto"
    ],
    avatar: "https://images.unsplash.com/photo-1549476464-37392f717541?q=80&w=300&auto=format&fit=crop"
  },
  {
    name: "Roger Gracie",
    titles: "10x",
    category: "Super Pesado / Absoluto",
    specialty: "Estrangulamento da Montada & Alinhamento Clínico",
    quote: "Se você dominar os fundamentos perfeitamente, não precisa inventar complexidades.",
    highlights: [
      "Considerado o maior competidor puro de todos os tempos (Goat)",
      "Finalizou todos os 10 oponentes no histórico campeonato mundial de 2009",
      "Conhecido por nunca ter sido finalizado na faixa preta em competidores da elite"
    ],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop"
  },
  {
    name: "Bruno Malfacine",
    titles: "10x",
    category: "Peso Galo (Roosterweight)",
    specialty: "Passagens Explosivas & Raspagem de Gancho",
    quote: "A estatura de um campeão se mede pela integridade técnica de seu espírito.",
    highlights: [
      "Detentor do recorde masculino absoluto de sua divisão com 10 títulos mundiais",
      "Mistura velocidade atômica com distribuição de peso insuperável",
      "Dominou a categoria peso galo de forma ininterrupta e imbatível por 12 anos"
    ],
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop"
  },
  {
    name: "Gabi Pessanha",
    titles: "10x",
    category: "Super Pesado / Absoluto FEM",
    specialty: "Guarda-Laçada Ofensiva & Pressão Absoluta",
    quote: "As medalhas são forjadas na perseverança silenciosa dos tatames da Cidade de Deus.",
    highlights: [
      "Fenômeno atual do Jiu-Jitsu feminino, detentora de múltiplos Grand Slams seguidos",
      "Domina o absoluto e categorias de peso com consistência tática irretocável",
      "Lenda imbatível que estabeleceu um padrão inédito de dominância física e técnica"
    ],
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"
  },
  {
    name: "Bia Mesquita",
    titles: "9x*",
    category: "Peso Leve / Absoluto FEM",
    specialty: "Chave de Braço Voadora & Ataques de Costas",
    quote: "A determinação no tatame transforma barreiras intransponíveis em solo firme.",
    highlights: [
      "9 títulos mundiais oficiais e amplamente reconhecidos na elite da faixa preta",
      "Umas das guardas mais completas e finalizadoras em campeonatos mundiais",
      "Destaque inquestionável e coroada como lenda viva do jiu-jitsu mundial"
    ],
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop"
  },
  {
    name: "Michelle Nicolini",
    titles: "8x",
    category: "Peso Pena / Absoluto FEM",
    specialty: "Guarda de Calcanhar & Chave de Pé Brutal",
    quote: "Flexibilidade sem agressividade técnica é apenas contorcionismo.",
    highlights: [
      "Revolucionou a guarda-aranha moderna com ataques constantes de triângulo e chave de braço",
      "Histórico de exibições agressivas sempre buscando submeter suas rivais",
      "Teve transições de elite para campeonatos sem pano e circuito profissional de MMA"
    ],
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=300&auto=format&fit=crop"
  },
  {
    name: "Letícia Ribeiro",
    titles: "7x",
    category: "Peso Pluma (Light Feather) FEM",
    specialty: "Ataques de Omoplata & Controle de lapela",
    quote: "Ensinar a arte e dar o sangue pelas alunas é viver o Jiu-Jitsu por inteiro.",
    highlights: [
      "Líder de uma das maiores equipes femininas da história das artes marciais",
      "Multicampeã mundial em duas décadas diferentes, mantendo soberania física",
      "Mentorada por mestres consagrados e fundadora da aliança Gracie Humaitá feminina"
    ],
    avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=300&auto=format&fit=crop"
  },
  {
    name: "Leandro Lo",
    titles: "7x",
    category: "Leve ao Meio-Pesado / Absoluto",
    specialty: "Passagem Toreando Dinâmica & Guarda X Ativa",
    quote: "O tatame é meu santuário, e minha maior virtude é lutar com amor e alegria.",
    highlights: [
      "Venceu campeonatos mundiais em 5 categorias de peso distintas na faixa preta",
      "O coração mais vibrante do esporte, famoso por reviravoltas miraculosas em finais",
      "Seu estilo explosivo de passar em pé revolucionou o esporte nos anos 2010"
    ],
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop"
  },
  {
    name: "Hannette Staack",
    titles: "7x",
    category: "Medio-Pesado / Absoluto FEM",
    specialty: "Quedas de Judô & Pressão de Cruzada de Joelho",
    quote: "A glória reside em honrar o kimono tradicional com técnica pura e limpa.",
    highlights: [
      "Combinação formidável de técnica em pé (quedas) e jogo de solo compacto",
      "Sete vezes campeã mundial da IBJJF com apresentações técnicas irretocáveis",
      "Forte defensora e difusora do jiu-jitsu clássico de defesa pessoal e competição"
    ],
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300&auto=format&fit=crop"
  },
  {
    name: "Xande Ribeiro",
    titles: "7x",
    category: "Peso Pesado / Absoluto",
    specialty: "Guarda Fechada Intransponível & Alavancas Reais",
    quote: "Se sua base está bem assentada e sua postura correta, ninguém passa sua guarda.",
    highlights: [
      "Famoso por ter tido a guarda menos passada da história do esporte moderno",
      "Venceu finais de absoluto épicas contra os adversários mais pesados",
      "Co-fundador da célebre Ribeiro Jiu-Jitsu, sendo autor de manuais técnicos primorosos"
    ],
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=300&auto=format&fit=crop"
  }
];

// Framer Motion staggered entrance and blur animations for the Hero content
const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    }
  }
};

const heroItemVariantsBasic = {
  hidden: { opacity: 0, y: 25 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

const heroTitleVariants = {
  hidden: { opacity: 0, y: 40, filter: "blur(12px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 70, damping: 12, duration: 1.0 }
  }
};

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPerfMonitorOpen, setIsPerfMonitorOpen] = useState<boolean>(false);
  const [isSystemErrorLogOpen, setIsSystemErrorLogOpen] = useState<boolean>(false);
  
  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isAlreadyInstalled, setIsAlreadyInstalled] = useState<boolean>(false);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(() => {
    return localStorage.getItem('oss_pwa_banner_dismissed') !== 'true';
  });

  useEffect(() => {
    // Check if already in standalone mode
    const checkIsStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (navigator as any).standalone === true;
    
    setIsAlreadyInstalled(!!checkIsStandalone);

    // Detect iOS
    const iOSCheck = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOSCheck);

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent browser from showing default banner
      e.preventDefault();
      // Store the event so we can trigger it on user request
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If app is installed, fire feedback
    window.addEventListener('appinstalled', () => {
      setIsAlreadyInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      addToast("Parabéns! O Diário dos Oss.os foi instalado com sucesso.", "success");
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      try {
        // Trigger the prompt
        deferredPrompt.prompt();
        // Wait for choice
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsAlreadyInstalled(true);
          setIsInstallable(false);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.warn("Prompt trigger error:", err);
        setShowInstallModal(true);
      }
    } else {
      // Prompt is not available (e.g. iOS or standalone or waiting)
      // Open our premium instructions modal
      setShowInstallModal(true);
    }
  };

  const [hasScrolled, setHasScrolled] = useState(false);
  
  // Onboarding Tour States
  const [showOnboardingTour, setShowOnboardingTour] = useState<boolean>(() => {
    return localStorage.getItem('oss_onboarding_tour_completed') !== 'true';
  });
  const [currentTourStep, setCurrentTourStep] = useState<number>(0);

  useEffect(() => {
    const handleStartTour = () => {
      setCurrentTourStep(0);
      setShowOnboardingTour(true);
    };
    window.addEventListener('start-onboarding-tour', handleStartTour);
    return () => {
      window.removeEventListener('start-onboarding-tour', handleStartTour);
    };
  }, []);
  const [selectedLegendIndex, setSelectedLegendIndex] = useState<number>(0);
  const [bjjActiveTab, setBjjActiveTab] = useState<'profile' | 'sparring'>('profile');
  const [combatOpponentIndex, setCombatOpponentIndex] = useState<number>(1);
  const [isCombatRunning, setIsCombatRunning] = useState<boolean>(false);
  const [combatPhase, setCombatPhase] = useState<'IDLE' | 'STARTED' | 'MID_FIGHT' | 'SUBMISSION' | 'ENDED'>('IDLE');
  const [combatLogs, setCombatLogs] = useState<string[]>([]);
  const [combatWinnerName, setCombatWinnerName] = useState<string | null>(null);

  const handleStartCombatSimulation = (fighterAIndex: number, fighterBIndex: number) => {
    if (fighterAIndex === fighterBIndex) {
      return;
    }
    const fighterA = bjjLegends[fighterAIndex];
    const fighterB = bjjLegends[fighterBIndex];
    
    setIsCombatRunning(true);
    setCombatWinnerName(null);
    setCombatPhase('STARTED');
    setCombatLogs([
      `🥋 COMBATE CONFIRMADO // OSS`,
      `👉 LUTADOR A: ${fighterA.name.toUpperCase()} (Especialidade: ${fighterA.specialty})`,
      `👉 LUTADOR B: ${fighterB.name.toUpperCase()} (Especialidade: ${fighterB.specialty})`,
      `⏳ Ambos os atletas adentram a área central. Cumprimentam o árbitro e batem bochechas. LUTA INICIADA!`
    ]);

    // Stage 1: Standing Combat (Collar Ties & Takedowns)
    setTimeout(() => {
      setCombatPhase('MID_FIGHT');
      setCombatLogs(prev => [
        ...prev,
        `🤼 COMBATE EM PÉ // pegadas extremamente firmes na gola e manga.`,
        `⚡ ${fighterA.name} finta uma transição rápida e consegue desequilibrar ${fighterB.name} com um excelente Ouchi Gari!`,
        `🛡️ Mas ${fighterB.name} escorrega com elasticidade impressionante e arruma uma transição veloz puxando para a meia-guarda.`
      ]);
    }, 1500);

    // Stage 2: Ground Passing Game
    setTimeout(() => {
      setCombatLogs(prev => [
        ...prev,
        `🧱 COMBATE NO SOLO // Desenvolvem-se as defesas e alavancas.`,
        `🥋 ${fighterA.name} começa a prender a lapela tentando cansar a postura defensiva.`,
        `🌪️ ${fighterB.name} ataca de forma genial ativando sua lendária habilidade: "${fighterB.specialty}".`,
        `🔥 O tatame ferve sob a pressão absurda de ambos os competidores!`
      ]);
    }, 3200);

    // Stage 3: Submission attempt
    setTimeout(() => {
      setCombatPhase('SUBMISSION');
      setCombatLogs(prev => [
        ...prev,
        `🚨 MOMENTO DO BOTE // O estrangulamento ou chave está próximo!`,
        `💥 ${fighterA.name} dá um giro espetacular e consegue avançar direto para a montada!`,
        `🦾 Ele isola o braço, encaixa a postura e inicia sua assinatura: "${fighterA.specialty}".`
      ]);
    }, 5000);

    // Stage 4: End & Winner declared
    setTimeout(() => {
      setCombatPhase('ENDED');
      const titlesA = parseInt(fighterA.titles) || 7;
      const titlesB = parseInt(fighterB.titles) || 7;
      const roll = Math.random() * (titlesA + titlesB);
      const winner = roll > titlesB ? fighterA : fighterB;
      const loser = winner === fighterA ? fighterB : fighterA;

      const submissions = [
        `🏆 FIM DE PAPO! ${winner.name} ajusta o estrangulamento gola-rodada partindo da montada. Sem escapatória para ${loser.name}, que dá o tapout (bateu)! Vitória monumental no tatame do OSS.`,
        `🏆 QUE ATAQUE! Em uma raspagem relâmpago de meia-guarda profunda, ${winner.name} sobe direto nas costas e sela o combate com um estrangulamento arco e flecha justíssimo! OSS!`,
        `🏆 DECISÃO UNÂNIME! Após 10 minutos de uma intensidade insana, ${winner.name} garante a vitória com 2 vantagens extras conquistadas por tentativas brutais de finalização e passagem de guarda!`,
        `🏆 ARREPIANTE! ${winner.name} saca uma chave de braço voadora inacreditável nos segundos finais! ${loser.name} bate imediatamente antes do estalo! OSS!`
      ];

      const chosenSub = submissions[Math.floor(Math.random() * submissions.length)];
      setCombatWinnerName(winner.name);
      setCombatLogs(prev => [...prev, `🔥 COMBATE ENCERRADO:`, chosenSub]);
      setIsCombatRunning(false);
    }, 7000);
  };

  const [dealFilter, setDealFilter] = useState<'discount' | 'price'>('discount');
  const [isRefreshingDeals, setIsRefreshingDeals] = useState(false);
  const [dealsLastUpdated, setDealsLastUpdated] = useState<string>('Preço Live // Atualizado');
  const [simulatedDiscountBump, setSimulatedDiscountBump] = useState<Record<string, number>>({});

  const [rssFeeds, setRssFeeds] = useState<{ id: string; name: string; url: string; active: boolean }[]>(() => {
    const saved = localStorage.getItem('oss_rss_scout_feeds_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: "1", name: "Gracie Magazine", url: "https://www.graciemag.com/feed/", active: true },
      { id: "2", name: "BJJ Heroes News", url: "https://www.bjjheroes.com/feed", active: true },
      { id: "3", name: "BJJ Eastern Europe", url: "https://www.bjjee.com/feed/", active: false }
    ];
  });

  useEffect(() => {
    localStorage.setItem('oss_rss_scout_feeds_v1', JSON.stringify(rssFeeds));
  }, [rssFeeds]);

  useEffect(() => {
    let lastRun = 0;
    let timeoutId: any = null;

    const handleScroll = () => {
      const now = Date.now();

      const update = () => {
        const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = totalScroll > 0 ? (window.scrollY / totalScroll) * 100 : 0;
        setScrollProgress(progress);
        setHasScrolled(window.scrollY > 5);
        lastRun = Date.now();
      };

      if (now - lastRun >= 100) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        update();
      } else if (!timeoutId) {
        timeoutId = setTimeout(() => {
          update();
          timeoutId = null;
        }, 100 - (now - lastRun));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState<View>('LANDING');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('oss_sidebar_collapsed') === 'true';
    }
    return false;
  });
  const [sidebarNavSearch, setSidebarNavSearch] = useState('');
  const [isSearchBadgePulsing, setIsSearchBadgePulsing] = useState(false);
  const lastSearchBadgePulseTimeRef = useRef<number>(0);
  const searchPulseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Throttle sidebar search counter badge pulse effect to at most once every 3 seconds
  useEffect(() => {
    if (!sidebarNavSearch.trim()) {
      setIsSearchBadgePulsing(false);
      if (searchPulseTimerRef.current) {
        clearTimeout(searchPulseTimerRef.current);
        searchPulseTimerRef.current = null;
      }
      return;
    }

    const now = Date.now();
    const elapsedSinceLastPulse = now - lastSearchBadgePulseTimeRef.current;

    // Only trigger pulsing if at least 3 seconds have passed since the previous pulse
    if (elapsedSinceLastPulse >= 3000) {
      lastSearchBadgePulseTimeRef.current = now;
      setIsSearchBadgePulsing(true);

      if (searchPulseTimerRef.current) {
        clearTimeout(searchPulseTimerRef.current);
      }

      searchPulseTimerRef.current = setTimeout(() => {
        setIsSearchBadgePulsing(false);
        searchPulseTimerRef.current = null;
      }, 1500);
    }

    return () => {
      if (searchPulseTimerRef.current) {
        clearTimeout(searchPulseTimerRef.current);
      }
    };
  }, [sidebarNavSearch]);
  const heroRef = useRef<HTMLDivElement>(null);
  const [isHeroFullscreen, setIsHeroFullscreen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleLandingDisclosure = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = document.fullscreenElement === heroRef.current;
      setIsHeroFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleHeroFullscreen = async () => {
    if (!heroRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await heroRef.current.requestFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  // Analytics State
  const [platformMetrics, setPlatformMetrics] = useState<Record<string, { clicks: number; conversions: number }>>(() => {
    const saved = localStorage.getItem('oss_platform_metrics_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      "Mercado Livre": { clicks: 742, conversions: 62 },
      "Amazon": { clicks: 589, conversions: 48 },
      "Growth": { clicks: 320, conversions: 42 },
      "Decathlon": { clicks: 198, conversions: 12 },
      "Shopee": { clicks: 245, conversions: 15 },
      "Netshoes": { clicks: 112, conversions: 8 },
      "Centauro": { clicks: 88, conversions: 5 },
      "Venum": { clicks: 154, conversions: 18 },
      "KVRA": { clicks: 120, conversions: 11 },
      "Shein": { clicks: 45, conversions: 2 },
      "TikTok": { clicks: 76, conversions: 4 }
    };
  });

  useEffect(() => {
    localStorage.setItem('oss_platform_metrics_v2', JSON.stringify(platformMetrics));
  }, [platformMetrics]);

  const [productClicks, setProductClicks] = useState<Record<string, { title: string, platform: string, clicks: number, conversions: number }>>(() => {
    const saved = localStorage.getItem('oss_product_clicks_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Seed with some popular curated items
    return {
      "curated-venum-challenger": { title: "Kimono Venum Challenger 4.0", platform: "Amazon", clicks: 124, conversions: 12 },
      "curated-atama-mundial": { title: "Kimono Atama Mundial #26", platform: "Mercado Livre", clicks: 145, conversions: 14 },
      "curated-creatina-growth": { title: "Creatina Monohidratada 250g", platform: "Growth", clicks: 210, conversions: 32 },
      "curated-rash-venum": { title: "Rash Guard Venum NoGi Pro", platform: "Venum", clicks: 95, conversions: 11 },
      "curated-outshock-atama": { title: "Kimono Outshock Iniciante", platform: "Decathlon", clicks: 64, conversions: 4 }
    };
  });

  useEffect(() => {
    localStorage.setItem('oss_product_clicks_v2', JSON.stringify(productClicks));
  }, [productClicks]);

  // Central tracking trigger for clicks
  const trackClick = (productId: string, productTitle: string, platform: string) => {
    console.log(`[ANALYTICS] Tracking click on ${productTitle} (${platform})`);
    
    // 1. Update platform metrics
    setPlatformMetrics(prev => {
      const current = prev[platform] || { clicks: 0, conversions: 0 };
      return {
        ...prev,
        [platform]: {
          ...current,
          clicks: current.clicks + 1
        }
      };
    });

    // 2. Update product clicks
    setProductClicks(prev => {
      const current = prev[productId] || { title: productTitle, platform, clicks: 0, conversions: 0 };
      return {
        ...prev,
        [productId]: {
          ...current,
          clicks: current.clicks + 1
        }
      };
    });
  };

  // Central tracking trigger for conversions
  const trackConversion = (productId: string, productTitle: string, platform: string) => {
    console.log(`[ANALYTICS] Tracking conversion on ${productTitle} (${platform})`);
    
    // 1. Update platform metrics
    setPlatformMetrics(prev => {
      const current = prev[platform] || { clicks: 0, conversions: 0 };
      return {
        ...prev,
        [platform]: {
          ...current,
          conversions: current.conversions + 1
        }
      };
    });

    // 2. Update product clicks
    setProductClicks(prev => {
      const current = prev[productId] || { title: productTitle, platform, clicks: 0, conversions: 0 };
      return {
        ...prev,
        [productId]: {
          ...current,
          conversions: current.conversions + 1
        }
      };
    });
  };

  // Custom Toast System
  interface Toast {
    id: string;
    message: string;
    type: 'success' | 'info' | 'error';
    icon?: React.ReactNode;
  }
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success', icon?: React.ReactNode) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type, icon }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Auth States
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [dashboardFocusMode, setDashboardFocusMode] = useState(false);

  // Auth Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('atleta');
  const [authModalRegisterMode, setAuthModalRegisterMode] = useState(false);
  const [installedShortcut, setInstalledShortcut] = useState(false);

  // Firebase verification report & Firestore initialization
  const [firebaseReport, setFirebaseReport] = useState<FirebaseVerificationResult | null>(null);

  // Configure Firebase Firestore connection to manage products, authentication sessions, offers and reviews persistency
  useEffect(() => {
    let unsubscribeProducts: (() => void) | null = null;

    verifyAndInitializeFirebase().then((report) => {
      setFirebaseReport(report);
      if (report.isValid) {
        // Subscribe to real-time products synchronization from Firestore
        unsubscribeProducts = subscribeToProducts((remoteProducts) => {
          if (remoteProducts && remoteProducts.length > 0) {
            setProductList((prev) => {
              const productMap = new Map();
              prev.forEach((p) => productMap.set(p.id, p));
              remoteProducts.forEach((rp) => {
                productMap.set(rp.id, { ...productMap.get(rp.id), ...rp });
              });
              return Array.from(productMap.values());
            });
          }
        }, (err) => {
          console.log("Firestore products sync skipped or offline:", err);
        });
      }
    }).catch((err) => {
      console.warn("Falha na inicialização e verificação do Firebase:", err);
      set_up_firebase();
    });

    return () => {
      if (unsubscribeProducts) {
        unsubscribeProducts();
      }
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthLoading(false);
      
      if (u) {
        // Read local guest data
        const localWishlistStr = localStorage.getItem('oss_wishlist');
        let localWishlistIds: string[] = [];
        if (localWishlistStr) {
          try {
            localWishlistIds = JSON.parse(localWishlistStr);
          } catch (e) {}
        }

        const localPointsStr = localStorage.getItem('oss_simulated_points');
        const localHistoryStr = localStorage.getItem('oss_points_history');
        const localPoints = localPointsStr ? parseInt(localPointsStr, 10) : 100;
        let localHistory: any[] = [];
        if (localHistoryStr) {
          try {
            localHistory = JSON.parse(localHistoryStr);
          } catch (e) {}
        }

        // Sync local wishlist items up to Firestore after login
        if (localWishlistIds.length > 0) {
          const itemsToSync = [...localWishlistIds];
          Promise.all(
            itemsToSync.map(async (id) => {
              const wishlistDocPath = `users/${u.uid}/wishlist/${id}`;
              try {
                await setDoc(doc(db, wishlistDocPath), { addedAt: new Date().toISOString() }, { merge: true });
                return id;
              } catch (err) {
                console.warn("Error uploading local wishlist item to Firestore: ", err);
                return null;
              }
            })
          ).then((results) => {
            const syncedIds = results.filter((id): id is string => Boolean(id));
            if (syncedIds.length > 0) {
              localStorage.removeItem('oss_wishlist');
              const firstId = syncedIds[0];
              const targetProd = productList.find(p => p.id === firstId) || initialProducts.find(p => p.id === firstId);
              const message = syncedIds.length === 1
                ? `Item "${targetProd?.title || 'Produto'}" sincronizado com seus favoritos no Firestore! 🥋`
                : `${syncedIds.length} itens dos favoritos sincronizados com sucesso no Firestore! 🥋`;

              addToast(
                message,
                'success',
                <Heart size={15} className="text-red-500 fill-red-500 animate-pulse" />
              );
            }
          });
        }

        // Sync LGPD consent state bidirectional
        getDoc(doc(db, "users", u.uid)).then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data?.belt) {
              setUserBelt(data.belt);
              localStorage.setItem('oss_user_belt', data.belt);
            }
            if (data?.lgpdConsent) {
              localStorage.setItem('oss_lgpd_consents', JSON.stringify(data.lgpdConsent));
            } else {
              const localConsent = localStorage.getItem('oss_lgpd_consents');
              if (localConsent) {
                try {
                  const consentObj = JSON.parse(localConsent);
                  updateDoc(doc(db, "users", u.uid), {
                    lgpdConsent: consentObj,
                    updatedAt: new Date().toISOString()
                  }).catch(err => console.warn("Error syncing local LGPD consent: ", err));
                } catch (e) {}
              }
            }

            // Merge guest progress (points & history) with account data
            const dbPoints = data?.points !== undefined ? data.points : 100;
            const dbHistory = data?.pointsHistory || [];

            // Merge transactions based on unique id
            const mergedHistory = [...dbHistory];
            localHistory.forEach((ltx) => {
              if (ltx && ltx.id && !mergedHistory.some((dtx) => dtx.id === ltx.id)) {
                mergedHistory.push(ltx);
              }
            });

            const maxPoints = Math.max(localPoints, dbPoints);

            // Save to Firestore and local storage
            updateDoc(doc(db, "users", u.uid), {
              points: maxPoints,
              pointsHistory: mergedHistory,
              updatedAt: new Date().toISOString()
            }).then(() => {
              localStorage.setItem('oss_simulated_points', String(maxPoints));
              localStorage.setItem('oss_points_history', JSON.stringify(mergedHistory));
              if (data?.streak !== undefined) {
                localStorage.setItem('oss_checkin_streak', String(data.streak));
              }
              window.dispatchEvent(new Event('storage'));
            }).catch(err => {
              console.warn("Error syncing merged points to Firestore: ", err);
              localStorage.setItem('oss_simulated_points', String(dbPoints));
              localStorage.setItem('oss_points_history', JSON.stringify(dbHistory));
              if (data?.streak !== undefined) {
                localStorage.setItem('oss_checkin_streak', String(data.streak));
              }
              window.dispatchEvent(new Event('storage'));
            });
          } else {
            // First time login for OAuth users (Google/Apple) - initialize default profile in Firestore using any guest data
            const timestamp = new Date().toISOString();
            const defaultProfile = {
              displayName: u.displayName || u.email?.split('@')[0] || "Atleta do Tatame",
              email: u.email || "",
              points: Math.max(100, localPoints),
              streak: parseInt(localStorage.getItem('oss_checkin_streak') || '0', 10),
              belt: "Branca",
              dojo: "Dojo Local / Garagem",
              createdAt: timestamp,
              updatedAt: timestamp,
              pointsHistory: localHistory.length > 0 ? localHistory : [
                {
                  id: 'tx-1',
                  type: 'WELCOME',
                  description: 'Bônus de Boas-vindas (Cadastro no Portal)',
                  points: 100,
                  date: timestamp
                }
              ],
              lgpdConsent: {
                approvedCadastral: true,
                approvedWishlistAlerts: true,
                approvedSessionCookies: true,
                approvedNavigation: true,
                consentDate: timestamp,
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server/Unknown'
              }
            };
            setDoc(doc(db, "users", u.uid), defaultProfile)
              .then(() => {
                localStorage.setItem('oss_simulated_points', String(defaultProfile.points));
                localStorage.setItem('oss_checkin_streak', String(defaultProfile.streak));
                localStorage.setItem('oss_points_history', JSON.stringify(defaultProfile.pointsHistory));
                const localConsent = localStorage.getItem('oss_lgpd_consents');
                if (!localConsent) {
                  localStorage.setItem('oss_lgpd_consents', JSON.stringify(defaultProfile.lgpdConsent));
                }
                window.dispatchEvent(new Event('storage'));
              })
              .catch(err => console.warn("Error creating default user profile for OAuth user: ", err));
          }
        }).catch(err => console.warn("Error checking user doc for sync: ", err));

        // Sync wishlist from Firestore
        const wishlistPath = `users/${u.uid}/wishlist`;
        const q = query(collection(db, wishlistPath));
        let isFirstWishlistSync = true;
        const unsubWishlist = onSnapshot(q, (snapshot) => {
          const syncedIds = new Set(snapshot.docs.map(doc => doc.id));
          const alertedIds = new Set(snapshot.docs.filter(doc => doc.data().alertEnabled).map(doc => doc.id));
          setWishlist(syncedIds);
          setWishlistAlerts(alertedIds);

          if (isFirstWishlistSync) {
            isFirstWishlistSync = false;
            // Notify if items loaded from Firestore on login and guest wasn't uploading local items
            if (syncedIds.size > 0 && localWishlistIds.length === 0) {
              const firstId = Array.from(syncedIds)[0];
              const targetProd = productList.find(p => p.id === firstId) || initialProducts.find(p => p.id === firstId);
              const message = syncedIds.size === 1
                ? `Item "${targetProd?.title || 'Produto'}" sincronizado da sua conta no Firestore! 🥋`
                : `${syncedIds.size} itens da Lista de Desejos sincronizados com o Firestore! 🥋`;

              addToast(
                message,
                'success',
                <Heart size={15} className="text-red-500 fill-red-500 animate-pulse" />
              );
            }
          }
        });
        return () => unsubWishlist();
      } else {
        setWishlist(new Set());
      }
    });
    return () => unsubscribe();
  }, []);

  // Background seed for Firestore product offers to demonstrate the live Firestore pricing comparator
  useEffect(() => {
    const seedProductOffers = async () => {
      const seededKey = 'oss_offers_seeded_v3';
      if (localStorage.getItem(seededKey)) return;

      try {
        // Seed offers for product 3 (Rash Guard No-Gi Phantom) which has no static offers
        const offersForProduct3 = [
          { storeName: 'Amazon Live', price: 119.90, url: 'https://amazon.com.br/rash-guard-venum', isAvailable: true, shippingPrice: 12.00 },
          { storeName: 'Shopee Live', price: 109.90, url: 'https://shopee.com.br/rash-guard-phantom', isAvailable: true, shippingPrice: 0.00 },
          { storeName: 'Centauro Live', price: 139.90, url: 'https://centauro.com.br/rash-guard', isAvailable: true, shippingPrice: 0.00 }
        ];

        for (const [index, offer] of offersForProduct3.entries()) {
          const offerDocId = `offer_${index + 1}`;
          await setDoc(doc(db, `products/3/offers`, offerDocId), offer);
        }

        // Also seed a special high-discount offer for product 1 to see live database updates
        const offersForProduct1 = [
          { storeName: 'Mercado Livre Firestore', price: 459.90, url: 'https://mercadolivre.com.br/s/kimono-jiu-jitsu-venum', isAvailable: true, shippingPrice: 0.00 },
          { storeName: 'Amazon Live', price: 479.00, url: 'https://amazon.com.br/dp/B08X9Z1Y2X_exclusive', isAvailable: true, shippingPrice: 0.00 }
        ];

        for (const [index, offer] of offersForProduct1.entries()) {
          const offerDocId = `live_offer_${index + 1}`;
          await setDoc(doc(db, `products/1/offers`, offerDocId), offer);
        }

        localStorage.setItem(seededKey, 'true');
        console.info('Successfully seeded Firestore product offers.');
      } catch (error) {
        console.warn('Could not seed product offers to Firestore:', error);
      }
    };

    const timer = setTimeout(() => {
      seedProductOffers();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSignIn = (role: UserRole = 'atleta', isRegister: boolean = false) => {
    setAuthModalRole(role);
    setAuthModalRegisterMode(isRegister);
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  useEffect(() => {
    // Map path to View
    const searchParams = new URLSearchParams(location.search);
    const isExternalParam = searchParams.get('mode') === 'external';

    const path = location.pathname.substring(1).toUpperCase() || 'LANDING';
    const validViews: View[] = ['LANDING', 'SHOP', 'WISHLIST', 'CONTACT', 'SETTINGS', 'DASHBOARD', 'ABOUT', 'TRANSPARENCY', 'COMPARATOR', 'EXTERNAL_SHOWCASE', 'NOTIFICATIONS'];
    
    if (isExternalParam || path === 'EXTERNAL' || path === 'EXTERNAL_SHOWCASE' || path === 'VITRINE') {
      setView('EXTERNAL_SHOWCASE');
    } else if (path === 'NOTIFICATIONS' || path === 'ALERTAS' || path === 'OFERTAS-ALERTAS' || path === 'NOTIFICACOES' || path === 'OFFERS') {
      setView('NOTIFICATIONS');
    } else if (validViews.includes(path as View)) {
      setView(path as View);
    } else {
      setView('LANDING');
    }
    
    // Auto-scroll to top on view change
    window.scrollTo(0, 0);
  }, [location]);

  const handleNavigate = (newView: View) => {
    if (newView === 'EXTERNAL_SHOWCASE') {
      navigate('/external');
      return;
    }
    const path = newView === 'LANDING' ? '/' : `/${newView.toLowerCase()}`;
    navigate(path);
  };

  const enterAthleteFocusMode = () => {
    setDashboardFocusMode(true);
    handleNavigate('SETTINGS');
  };

  // Keyboard shortcut listener (Alt + F) to toggle Athlete Focus Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is logged in
      if (!user) return;
      
      // Alt + F to enter Focus Mode
      if (e.altKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        enterAthleteFocusMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  const [wishlist, setWishlist] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oss_wishlist');
      if (saved) {
        try {
          return new Set(JSON.parse(saved));
        } catch (e) {}
      }
    }
    return new Set();
  });
  const [wishlistAlerts, setWishlistAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem('oss_wishlist', JSON.stringify(Array.from(wishlist)));
  }, [wishlist]);
  const [viewedProductIds, setViewedProductIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oss_viewed_products');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [purchasedProductIds, setPurchasedProductIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oss_purchased_products');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [recommendedProductIds, setRecommendedProductIds] = useState<string[]>([]);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [lastWishlistSize, setLastWishlistSize] = useState(() => wishlist.size);
  const [pulseWishlist, setPulseWishlist] = useState(false);

  useEffect(() => {
    if (wishlist.size > lastWishlistSize) {
      setPulseWishlist(true);
      const timer = setTimeout(() => setPulseWishlist(false), 800);
      setLastWishlistSize(wishlist.size);
      return () => clearTimeout(timer);
    } else if (wishlist.size !== lastWishlistSize) {
      setLastWishlistSize(wishlist.size);
    }
  }, [wishlist.size, lastWishlistSize]);

  useEffect(() => {
    localStorage.setItem('oss_viewed_products', JSON.stringify(viewedProductIds));
  }, [viewedProductIds]);

  useEffect(() => {
    localStorage.setItem('oss_purchased_products', JSON.stringify(purchasedProductIds));
  }, [purchasedProductIds]);

  const generateRecommendations = async () => {
    if (viewedProductIds.length === 0 && purchasedProductIds.length === 0 && wishlist.size === 0) return;
    
    setIsGeneratingRecommendations(true);
    try {
      const userHistory = {
        viewed: viewedProductIds.map(id => productList.find(p => p.id === id)?.title).filter(Boolean),
        purchased: purchasedProductIds.map(id => productList.find(p => p.id === id)?.title).filter(Boolean),
        wishlist: Array.from(wishlist).map(id => productList.find(p => p.id === id)?.title).filter(Boolean)
      };

      const products = productList.map(p => ({ id: p.id, title: p.title, category: p.category, brand: p.brand }));

      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userHistory, products })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to get recommendations from AI server");

      if (data.ids && Array.isArray(data.ids)) {
        setRecommendedProductIds(Array.from(new Set(data.ids)));
      }
    } catch (error) {
      console.warn("Error generating recommendations:", error);
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  // Debounced recommendation generation
  useEffect(() => {
    const timer = setTimeout(() => {
      generateRecommendations();
    }, 5000); // 5 second debounce to avoid rapid API calls
    return () => clearTimeout(timer);
  }, [viewedProductIds, purchasedProductIds, wishlist]);

  const [productToRemoveFromWishlist, setProductToRemoveFromWishlist] = useState<string | null>(null);
  const [curatedProductIdToDelete, setCuratedProductIdToDelete] = useState<string | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [heroSearchVal, setHeroSearchVal] = useState('');
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [selectedPractitionerLevels, setSelectedPractitionerLevels] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedBelts, setSelectedBelts] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startVoiceSearch = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping speech recognition:', e);
        }
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      addToast('Seu navegador não suporta busca por voz.', 'error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = i18n.language === 'pt' ? 'pt-BR' : i18n.language === 'es' ? 'es-ES' : 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      addToast(t('voice.listening'), 'info', <Mic size={14} className="animate-pulse text-green-500" />);
    };

    let lastFinalTranscript = '';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = 0; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      const fullTranscript = finalTranscript + interimTranscript;
      setSearchQuery(fullTranscript);

      if (finalTranscript && finalTranscript !== lastFinalTranscript) {
        lastFinalTranscript = finalTranscript;
        addToast(t('voice.searching_for', { query: finalTranscript }), 'success', <Search size={14} />);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'aborted') {
        console.error('Speech recognition error', event.error);
        addToast(t('voice.error'), 'error');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
    }
  };

  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc' | 'rating-desc' | 'rating' | 'name-asc' | 'name-desc'>('relevance');

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedBrands([]);
    setSelectedProductTypes([]);
    setSelectedPractitionerLevels([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedGenders([]);
    setSelectedBelts([]);
    setSelectedSubCategories([]);
    setSelectedPlatforms([]);
    setPriceRange([0, 1000]);
    setSelectedRating(0);
    setSelectedPopularity('all');
    setSearchQuery('');
    
    // Reset AI Refinement
    setAiRefinementQuery('');
    setSelectedAiStyles([]);
    setSelectedAiMaterials([]);
    setAiRelevanceWeight(50);
    setIsAiRefinementActive(false);
  };

  enum OperationType {
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    LIST = 'list',
    GET = 'get',
    WRITE = 'write',
  }

  interface FirestoreErrorInfo {
    error: string;
    operationType: OperationType;
    path: string | null;
    authInfo: {
      userId?: string | null;
      email?: string | null;
      emailVerified?: boolean | null;
      isAnonymous?: boolean | null;
      tenantId?: string | null;
      providerInfo?: {
        providerId?: string | null;
        email?: string | null;
      }[];
    }
  }

  function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
      },
      operationType,
      path
    }
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }

  const handleAddReview = async (productId: string, newReview: Omit<Review, 'id' | 'date'>) => {
    if (!user) {
      addToast("Apenas usuários autenticados podem avaliar.", "error");
      return;
    }

    const reviewData = {
      ...newReview,
      userId: user.uid,
      userAvatar: user.photoURL || undefined,
      date: new Date().toLocaleDateString('pt-BR'),
      createdAt: Timestamp.now()
    };

    const reviewsPath = `products/${productId}/reviews`;
    try {
      await addDoc(collection(db, reviewsPath), reviewData);
      addToast("Avaliação enviada com sucesso!", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, reviewsPath);
    }
  };

  const handleDeleteReview = async (productId: string, reviewId: string) => {
    if (!user && !isAdminAuthenticated) {
      addToast("Apenas usuários autenticados ou administradores podem moderar.", "error");
      return;
    }
    
    if (!confirm(isAdminAuthenticated ? "Deseja realmente excluir esta avaliação como Administrador?" : "Deseja realmente remover sua avaliação?")) return;

    const reviewPath = `products/${productId}/reviews/${reviewId}`;
    try {
      await deleteDoc(doc(db, reviewPath));
      addToast(isAdminAuthenticated ? "Avaliação excluída pelo moderador." : "Avaliação removida.", "info");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, reviewPath);
    }
  };

  const handleHighlightReview = async (productId: string, reviewId: string, isFeatured: boolean) => {
    if (!isAdminAuthenticated) {
      addToast("Apenas administradores podem destacar avaliações.", "error");
      return;
    }

    const reviewPath = `products/${productId}/reviews/${reviewId}`;
    try {
      await updateDoc(doc(db, reviewPath), { isFeatured });
      addToast(isFeatured ? "Avaliação destacada no tatame!" : "Destaque removido.", "success");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, reviewPath);
    }
  };

  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [selectedPopularity, setSelectedPopularity] = useState<string>('all');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [checkoutQuantity, setCheckoutQuantity] = useState<number>(1);
  const [isCelebrating, setIsCelebrating] = useState(false);

  useEffect(() => {
    if (isCelebrating) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const playChime = (freq: number, delay: number, duration: number) => {
          setTimeout(() => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
          }, delay);
        };
        playChime(523.25, 0, 0.4);
        playChime(659.25, 120, 0.4);
        playChime(783.99, 240, 0.4);
        playChime(1046.50, 360, 0.6);
      } catch (e) {
        console.log("Audio celebration not supported in this environment");
      }

      try {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#22c55e', '#eab308', '#ffffff', '#10b981', '#3b82f6']
        });

        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors: ['#22c55e', '#eab308', '#ffffff', '#10b981']
          });
        }, 150);

        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors: ['#22c55e', '#eab308', '#ffffff', '#10b981']
          });
        }, 300);

        setTimeout(() => {
          confetti({
            particleCount: 60,
            spread: 100,
            origin: { y: 0.4 },
            colors: ['#eab308', '#ffffff', '#22c55e']
          });
        }, 450);
      } catch (err) {
        console.warn("Confetti failed to fire", err);
      }
    }
  }, [isCelebrating]);

  const [isKimonoTipsOpen, setIsKimonoTipsOpen] = useState(false);
  const [selectedCheckoutProduct, setSelectedCheckoutProduct] = useState<Product | null>(null);
  const [checkoutSelectedSize, setCheckoutSelectedSize] = useState<string>('');
  const [checkoutSizingWarning, setCheckoutSizingWarning] = useState<{ type: 'match' | 'warning' | 'unusual' | null; message: string; recommended: string } | null>(null);
  const [acceptedCheckoutTerms, setAcceptedCheckoutTerms] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedGalleryProduct, setSelectedGalleryProduct] = useState<Product | null>(null);
  const [selectedReviewProduct, setSelectedReviewProduct] = useState<Product | null>(null);
  const [selectedPriceHistoryProduct, setSelectedPriceHistoryProduct] = useState<Product | null>(null);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const itemsPerPage = 8;
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    category: true,
    brand: true,
    size: false,
    color: false,
    gender: false,
    belt: false,
    subCategory: false,
    rating: false,
    platform: true
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShopSidebarOpen, setIsShopSidebarOpen] = useState(true);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  // AI Refinement States
  const [aiRefinementQuery, setAiRefinementQuery] = useState('');
  const [selectedAiStyles, setSelectedAiStyles] = useState<string[]>([]);
  const [selectedAiMaterials, setSelectedAiMaterials] = useState<string[]>([]);
  const [aiRelevanceWeight, setAiRelevanceWeight] = useState(50);
  const [isAiRefinementActive, setIsAiRefinementActive] = useState(false);

  const [playingPodcastId, setPlayingPodcastId] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isNotificationOnboardingOpen, setIsNotificationOnboardingOpen] = useState(false);
  const [notificationModalInitialTab, setNotificationModalInitialTab] = useState<'status' | 'guide'>('status');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
      const isCompleted = localStorage.getItem('oss_notif_onboarding_completed') === 'true';
      const isDismissed = localStorage.getItem('oss_notif_onboarding_dismissed') === 'true';

      // Auto-trigger notification onboarding if user hasn't configured native push yet
      if (Notification.permission === 'default' && !isCompleted && !isDismissed) {
        const timer = setTimeout(() => {
          setIsNotificationOnboardingOpen(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleRequestNotificationPermission = async (forceGuideIfDenied = true) => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) {
      addToast("Seu navegador não suporta notificações por push.", "error");
      return;
    }

    if (Notification.permission === 'denied') {
      setNotificationPermission('denied');
      setIsPushSubscribed(false);
      if (forceGuideIfDenied) {
        setNotificationModalInitialTab('guide');
        setIsNotificationModalOpen(true);
      }
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        setIsPushSubscribed(true);
        addToast("Notificações Push autorizadas! Você receberá alertas de promoções.", "success", <Bell size={14} className="text-green-500 animate-bounce" />);
        try {
          new Notification("Diário dos Oss.os 🥋", {
            body: "Notificações de promoções nos seus produtos favoritos ativadas com sucesso! Oss!",
            icon: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=80&auto=format&fit=crop"
          });
        } catch (e) {
          console.warn("Instant notification failed", e);
        }
      } else if (permission === 'denied') {
        setIsPushSubscribed(false);
        addToast("Permissão negada no navegador. Abra as configurações para desbloquear.", "error");
        if (forceGuideIfDenied) {
          setNotificationModalInitialTab('guide');
          setIsNotificationModalOpen(true);
        }
      }
    } catch (error) {
      console.error("Erro ao solicitar permissão de notificação:", error);
      addToast("Erro ao solicitar permissão.", "error");
    }
  };

  const triggerFavoritePromotionPush = (targetProduct?: Product) => {
    const prod = targetProduct || wishlistProducts[0] || productList.find(p => p.isBestPrice) || productList[0];
    if (!prod) return;

    const discountPct = prod.originalPrice && prod.originalPrice > prod.price
      ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)
      : 25;

    const notifTitle = `🔥 Alerta de Promoção: -${discountPct}% no seu Favorito!`;
    const notifBody = `O ${prod.title} baixou para R$ ${prod.price.toFixed(2)}! Clique para conferir a oferta no OSS.OS.`;

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(notifTitle, {
              body: notifBody,
              icon: prod.imageUrl || "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=128&auto=format&fit=crop",
              vibrate: [200, 100, 200],
              tag: `oss-favorite-promo-${prod.id}`,
              data: { url: "/shop" }
            } as any);
          });
        } else {
          try {
            new Notification(notifTitle, {
              body: notifBody,
              icon: prod.imageUrl
            });
          } catch (e) {
            console.warn("Direct notification fallback:", e);
          }
        }
        addToast(`Alerta de promoção enviado para: ${prod.title}!`, 'success', <BellRing size={14} className="text-green-500" />);
      } else if (Notification.permission === 'denied') {
        setNotificationModalInitialTab('guide');
        setIsNotificationModalOpen(true);
      } else {
        handleRequestNotificationPermission();
      }
    }
  };

  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oss_theme_preference');
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    }
    return 'system';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('oss_theme_preference');
      if (savedTheme === 'dark') return true;
      if (savedTheme === 'light') return false;
      
      // Modo Automático (Sistema): Claro das 06h às 18h, Escuro das 18h às 24h
      const hour = new Date().getHours();
      return hour >= 18 || hour < 6;
    }
    return false;
  });

  const handleSelectThemePreference = (nextPreference: 'light' | 'dark' | 'system') => {
    setThemePreference(nextPreference);
    if (typeof window !== 'undefined') {
      localStorage.setItem('oss_theme_preference', nextPreference);
    }

    const currentHour = new Date().getHours();
    const isNight = currentHour >= 18 || currentHour < 6;
    const currentMode = isNight ? 'Escuro 🌙' : 'Claro ☀️';

    const modeLabels = {
      light: 'Modo Claro ativo ☀️ (Manual)',
      dark: 'Modo Escuro ativo 🌙 (Manual)',
      system: `Modo Automático ativo 🕒 (06h–18h Claro | 18h–24h Escuro • Agora: ${currentMode})`
    };
    addToast(modeLabels[nextPreference], 'info');
  };

  const toggleTheme = () => {
    let nextPreference: 'light' | 'dark' | 'system';
    if (themePreference === 'system') {
      nextPreference = 'light';
    } else if (themePreference === 'light') {
      nextPreference = 'dark';
    } else {
      nextPreference = 'system';
    }
    handleSelectThemePreference(nextPreference);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateThemeBasedOnTimeAndSystem = () => {
      let shouldBeDark = false;
      if (themePreference === 'dark') {
        shouldBeDark = true;
      } else if (themePreference === 'light') {
        shouldBeDark = false;
      } else {
        // Modo Automático (Sistema): Claro das 06h às 18h, Escuro das 18h às 24h/06h
        const hour = new Date().getHours();
        shouldBeDark = hour >= 18 || hour < 6;
      }
      setIsDark(shouldBeDark);
    };

    updateThemeBasedOnTimeAndSystem();

    // Verify time changes periodically (every 30 seconds) to switch seamlessly at 06:00 and 18:00
    const intervalId = setInterval(updateThemeBasedOnTimeAndSystem, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [themePreference]);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isNotificationBannerDismissed, setIsNotificationBannerDismissed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('oss_notif_banner_dismissed') === 'true';
    }
    return false;
  });

  const [filterByTechnicalLevel, setFilterByTechnicalLevel] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('oss_filter_by_technical_level') === 'true';
    }
    return false;
  });

  const [userBelt, setUserBelt] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedUserBelt = localStorage.getItem('oss_user_belt');
      if (savedUserBelt) return savedUserBelt;
      const savedFocusBelt = localStorage.getItem('oss_current_focus_belt');
      if (savedFocusBelt) {
        return savedFocusBelt.replace('Faixa ', '').trim();
      }
    }
    return 'Branca';
  });

  const updateUserBelt = async (newBelt: string) => {
    setUserBelt(newBelt);
    if (typeof window !== 'undefined') {
      localStorage.setItem('oss_user_belt', newBelt);
      localStorage.setItem('oss_current_focus_belt', `Faixa ${newBelt}`);
      window.dispatchEvent(new Event('storage'));
    }
    if (user?.uid) {
      try {
        const timestamp = new Date().toISOString();
        await setDoc(doc(db, "users", user.uid), {
          belt: newBelt,
          updatedAt: timestamp
        }, { merge: true });
        addToast(`Sua graduação foi atualizada para Faixa ${newBelt}! 🥋`, "success");
      } catch (err) {
        console.warn("Erro ao sincronizar nova faixa no Firestore: ", err);
      }
    } else {
      addToast(`Sua graduação foi atualizada localmente para Faixa ${newBelt}! 🥋`, "success");
    }
  };

  useEffect(() => {
    localStorage.setItem('oss_filter_by_technical_level', String(filterByTechnicalLevel));
  }, [filterByTechnicalLevel]);

  useEffect(() => {
    const handleStorageChange = async () => {
      const savedUserBelt = localStorage.getItem('oss_user_belt');
      if (savedUserBelt) {
        setUserBelt(savedUserBelt);
      } else {
        const savedFocusBelt = localStorage.getItem('oss_current_focus_belt');
        if (savedFocusBelt) {
          setUserBelt(savedFocusBelt.replace('Faixa ', '').trim());
        }
      }

      // Live sync points and history to Firestore if logged in
      if (auth.currentUser) {
        const localPointsStr = localStorage.getItem('oss_simulated_points');
        const localHistoryStr = localStorage.getItem('oss_points_history');
        if (localPointsStr && localHistoryStr) {
          try {
            const pointsVal = parseInt(localPointsStr, 10);
            const historyVal = JSON.parse(localHistoryStr);
            
            const userDocRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userDocRef, {
              points: pointsVal,
              pointsHistory: historyVal,
              updatedAt: new Date().toISOString()
            });
          } catch (e) {
            console.warn("Error live-syncing points to Firestore: ", e);
          }
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);
  const [productList, setProductList] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oss_curated_products_v4');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length > 0) return parsed;
        } catch (e) {
          console.error("Error parsing curated products", e);
        }
      }
    }
    const unique = new Map();
    initialProducts.forEach(p => {
      if (!unique.has(p.id)) unique.set(p.id, p);
    });
    return Array.from(unique.values());
  });

  useEffect(() => {
    localStorage.setItem('oss_curated_products_v4', JSON.stringify(productList));
  }, [productList]);

  // Comparison State
  const [comparedProductIds, setComparedProductIds] = useState<Set<string>>(new Set());
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  const toggleCompareProduct = (product: Product) => {
    setComparedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
      } else {
        if (next.size >= 4) {
          addToast("Você pode comparar até 4 produtos simultaneamente.", "info");
          return prev;
        }
        next.add(product.id);
      }
      return next;
    });
  };

  const handleRemoveCompareProduct = (productId: string) => {
    setComparedProductIds(prev => {
      const next = new Set(prev);
      next.delete(productId);
      if (next.size === 0) {
        setIsCompareModalOpen(false);
      }
      return next;
    });
  };

  const handleClearCompareAll = () => {
    setComparedProductIds(new Set());
    setIsCompareModalOpen(false);
  };

  // SEO Optimizer & Keyword Engine State
  const [isSeoModalOpen, setIsSeoModalOpen] = useState<boolean>(false);
  const [selectedSeoProductId, setSelectedSeoProductId] = useState<string | null>(null);

  const handleUpdateProductSeo = async (updatedProduct: Product) => {
    setProductList(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    if (db) {
      try {
        await setDoc(doc(db, "products", String(updatedProduct.id)), {
          title: updatedProduct.title,
          description: updatedProduct.description,
          tags: updatedProduct.tags || [],
          seoKeywords: updatedProduct.seoKeywords || [],
          seoOptimizedTitle: updatedProduct.seoOptimizedTitle || updatedProduct.title,
          seoOptimizedDescription: updatedProduct.seoOptimizedDescription || updatedProduct.description,
          seoScore: updatedProduct.seoScore || 95,
          seoSearchIntent: updatedProduct.seoSearchIntent || 'Transacional',
          seoAnalysis: updatedProduct.seoAnalysis,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.warn("Firestore product sync offline or skipped:", e);
      }
    }
  };

  const handleBatchUpdateProductsSeo = async (updatedProducts: Product[]) => {
    const map = new Map(updatedProducts.map(p => [p.id, p]));
    setProductList(prev => prev.map(p => map.get(p.id) || p));
    if (db) {
      try {
        for (const p of updatedProducts) {
          await setDoc(doc(db, "products", String(p.id)), {
            title: p.title,
            description: p.description,
            tags: p.tags || [],
            seoKeywords: p.seoKeywords || [],
            seoOptimizedTitle: p.seoOptimizedTitle || p.title,
            seoOptimizedDescription: p.seoOptimizedDescription || p.description,
            seoScore: p.seoScore || 95,
            seoSearchIntent: p.seoSearchIntent || 'Transacional',
            seoAnalysis: p.seoAnalysis,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      } catch (e) {
        console.warn("Firestore batch product sync offline or skipped:", e);
      }
    }
  };

  const comparedProductsList = useMemo(() => {
    return Array.from(comparedProductIds)
      .map(id => productList.find(p => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [comparedProductIds, productList]);

  // Listen to all reviews across all products to dynamically update average ratings and counts
  useEffect(() => {
    if (!user) return;
    const q = query(collectionGroup(db, 'reviews'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Group reviews by productId
      const reviewsByProduct: Record<string, Review[]> = {};
      
      snapshot.docs.forEach((doc) => {
        const parts = doc.ref.path.split('/');
        // Path is like: products/{productId}/reviews/{reviewId}
        if (parts.length >= 4 && parts[0] === 'products' && parts[2] === 'reviews') {
          const productId = parts[1];
          if (!reviewsByProduct[productId]) {
            reviewsByProduct[productId] = [];
          }
          reviewsByProduct[productId].push({
            id: doc.id,
            ...doc.data()
          } as Review);
        }
      });

      // Update productList by merging default static reviews with Firestore reviews
      setProductList((prevList) => {
        return prevList.map((prod) => {
          const defaultReviews = prod.reviews || [];
          const dbReviews = reviewsByProduct[prod.id] || [];
          
          // Combine reviews avoiding duplicates by id
          const combinedReviews = [...dbReviews];
          defaultReviews.forEach((dr) => {
            if (!combinedReviews.some((r) => r.id === dr.id)) {
              combinedReviews.push(dr);
            }
          });

          // Re-calculate average rating
          const rating = combinedReviews.length > 0
            ? combinedReviews.reduce((sum, r) => sum + r.rating, 0) / combinedReviews.length
            : prod.rating || 0;

          return {
            ...prod,
            reviews: combinedReviews,
            rating: parseFloat(parseFloat(String(rating)).toFixed(1))
          };
        });
      });
    }, (error) => {
      console.error("Error listening to collectionGroup(reviews):", error);
    });

    return () => unsubscribe();
  }, [user]);

  const activeProduct = useMemo(() => {
    if (!selectedCheckoutProduct) return null;
    return productList.find(p => p.id === selectedCheckoutProduct.id) || selectedCheckoutProduct;
  }, [selectedCheckoutProduct, productList]);

  const currentProductReviews = useMemo(() => {
    if (!activeProduct) return [];
    return activeProduct.reviews || [];
  }, [activeProduct]);

  const activeGalleryProduct = useMemo(() => {
    if (!selectedGalleryProduct) return null;
    return productList.find(p => p.id === selectedGalleryProduct.id) || selectedGalleryProduct;
  }, [selectedGalleryProduct, productList]);

  const galleryProductReviews = useMemo(() => {
    if (!activeGalleryProduct) return [];
    return activeGalleryProduct.reviews || [];
  }, [activeGalleryProduct]);

  const activeReviewProduct = useMemo(() => {
    if (!selectedReviewProduct) return null;
    return productList.find(p => p.id === selectedReviewProduct.id) || selectedReviewProduct;
  }, [selectedReviewProduct, productList]);

  // Read product ID from URL query parameters (e.g. ?product=id) if shared or directly visited
  const urlProductId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('product');
  }, [location.search]);

  // Determine current active product entity or ID for SEO and Schema.org JSON-LD structured data injection
  const selectedProductForSeo = useMemo(() => {
    if (activeGalleryProduct) return activeGalleryProduct;
    if (activeProduct) return activeProduct;
    if (activeReviewProduct) return activeReviewProduct;
    if (urlProductId) {
      return productList.find(p => p.id === urlProductId) || urlProductId;
    }
    return null;
  }, [activeGalleryProduct, activeProduct, activeReviewProduct, urlProductId, productList]);

  // Hook that dynamically generates and injects Schema.org JSON-LD structured data into the page head
  // whenever a product is selected or loaded, ensuring all Firestore SEO fields are mapped correctly
  useProductJsonLd(selectedProductForSeo, {
    fallbackProducts: productList,
    onInjected: (ld) => {
      console.log(`[SEO JSON-LD] Injetado Schema.org Product para: "${ld.name}"`);
    }
  });

  const handleAddProductReview = async (productId: string, reviewData: Omit<Review, 'id'>) => {
    try {
      const savedReview = await saveProductReviewToFirestore(productId, reviewData);
      addToast("Avaliação enviada com sucesso! Oss!", "success", <Star className="text-amber-400 fill-amber-400" size={14} />);
      
      // Update local productList immediately (optimistic UI update)
      setProductList(prevList => prevList.map(p => {
        if (p.id === productId) {
          const currentReviews = p.reviews || [];
          const updatedReviews = [savedReview, ...currentReviews.filter(r => r.id !== savedReview.id)];
          const newAvg = Math.round((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length) * 10) / 10;
          return {
            ...p,
            reviews: updatedReviews,
            rating: newAvg
          };
        }
        return p;
      }));

      // Update selectedReviewProduct if still open
      setSelectedReviewProduct(prev => {
        if (!prev || prev.id !== productId) return prev;
        const currentReviews = prev.reviews || [];
        const updatedReviews = [savedReview, ...currentReviews.filter(r => r.id !== savedReview.id)];
        const newAvg = Math.round((updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length) * 10) / 10;
        return {
          ...prev,
          reviews: updatedReviews,
          rating: newAvg
        };
      });

      // Bonus loyalty points
      if (loyaltyEnabled && loyaltyReviewBonus > 0) {
        addToast(`+${loyaltyReviewBonus} pontos de fidelidade concedidos por seu review!`, "success", <Award className="text-amber-400" size={14} />);
      }
    } catch (err) {
      console.error("Erro ao salvar avaliação:", err);
      addToast("Avaliação salva localmente.", "info");
    }
  };

  // Dynamic affiliate offer prices sorted lowest price first for modal view comparison
  const activeProductOffers = useMemo(() => {
    if (!activeProduct) return [];
    if (activeProduct.offers && activeProduct.offers.length > 0) {
      return [...activeProduct.offers].sort((a, b) => a.price - b.price);
    }
    
    const basePrice = activeProduct.price;
    const cleanTitle = activeProduct.title;
    const platforms = [
      { name: "Mercado Livre", prefix: "https://lista.mercadolivre.com.br/", factor: 0.98, shipping: "Frete Grátis" },
      { name: "Amazon", prefix: "https://www.amazon.com.br/s?k=", factor: 1.0, shipping: "Frete Prime" },
      { name: "Shopee", prefix: "https://shopee.com.br/search?keyword=", factor: 0.96, shipping: "Cupom Grátis" },
      { name: "Centauro", prefix: "https://esportes.centauro.com.br/busca?q=", factor: 1.02, shipping: "Entrega Expressa" }
    ];
    
    const generated = platforms.map(p => {
      const variance = (Math.sin(p.name.charCodeAt(0) + basePrice) * 0.02);
      const computedPrice = Math.round(basePrice * (p.factor + variance) * 100) / 100;
      return {
        storeName: p.name,
        price: computedPrice,
        url: `${p.prefix}${encodeURIComponent(cleanTitle)}`,
        isAvailable: true,
        shippingPrice: p.shipping.includes("Grátis") ? 0 : 9.90,
        shippingInfo: p.shipping
      };
    });
    return generated.sort((a, b) => a.price - b.price);
  }, [activeProduct]);

  // Real-time Metrics Logic (Realism)
  const trendingProducts = useMemo(() => {
    return [...productList].sort((a, b) => ((b.trendScore || 0) * 2 + (b.popularity || 0)) - ((a.trendScore || 0) * 2 + (a.popularity || 0))).slice(0, 4);
  }, [productList]);

  const bestSellers = useMemo(() => {
    return [...productList].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, 3);
  }, [productList]);

  const maxProductPrice = useMemo(() => {
    if (productList.length === 0) return 1000;
    return Math.ceil(Math.max(...productList.map(p => p.price)));
  }, [productList]);

  // Dynamic Deals Calculation (percentage reductions and overall lowest prices)
  const productsWithDeals = useMemo(() => {
    return productList.map(p => {
      const currentPrice = p.price;
      const rawOriginal = p.originalPrice;
      // If it doesn't have an original price, calculate a stable original price based on popularity to simulate historical discount
      const calculatedOriginal = rawOriginal || (currentPrice * (1 + (p.popularity ? (p.popularity % 15 + 10) / 100 : 0.16)));
      
      // Apply simulated discount bump (dynamic live price scanning)
      const bumpFactor = simulatedDiscountBump[p.id] || 0;
      const finalPrice = Math.max(10, currentPrice * (1 - bumpFactor));
      
      const discountAmount = calculatedOriginal - finalPrice;
      const discountPercent = Math.round((discountAmount / calculatedOriginal) * 100);
      
      return {
        ...p,
        originalPrice: Number(calculatedOriginal.toFixed(2)),
        price: Number(finalPrice.toFixed(2)),
        discountPercent,
        discountAmount: Number(discountAmount.toFixed(2))
      };
    });
  }, [productList, simulatedDiscountBump]);

  const sortedDeals = useMemo(() => {
    if (dealFilter === 'discount') {
      return [...productsWithDeals]
        .filter(p => p.discountPercent > 0)
        .sort((a, b) => b.discountPercent - a.discountPercent)
        .slice(0, 8);
    } else {
      return [...productsWithDeals]
        .sort((a, b) => a.price - b.price)
        .slice(0, 8);
    }
  }, [productsWithDeals, dealFilter]);

  const handleRefreshDeals = () => {
    setIsRefreshingDeals(true);
    if (typeof playClickSound === 'function') {
      playClickSound();
    }
    setTimeout(() => {
      const newBumps: Record<string, number> = {};
      productList.forEach(p => {
        if (Math.random() > 0.4) {
          // 4% to 18% dynamic discount increase
          newBumps[p.id] = parseFloat((Math.random() * 0.14 + 0.04).toFixed(3));
        }
      });
      setSimulatedDiscountBump(newBumps);
      
      const timeStr = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setDealsLastUpdated(`${timeStr}`);
      setIsRefreshingDeals(false);
      
      addToast(
        "Métricas de Afiliados Sincronizadas da Nuvem! Novas ofertas live detectadas.",
        "success",
        <Sparkles className="text-yellow-500 animate-pulse" size={14} />
      );
    }, 1200);
  };

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // Update price range when maxProductPrice changes or if it exceeds current max
  useEffect(() => {
    if (priceRange[1] > maxProductPrice && maxProductPrice > 0) {
      setPriceRange([priceRange[0], maxProductPrice]);
    } else if (priceRange[1] === 1000 && maxProductPrice !== 1000 && maxProductPrice > 0) {
      setPriceRange([0, maxProductPrice]);
    }
  }, [maxProductPrice]);

  const [blogList, setBlogList] = useState<BlogPost[]>([]); // To hold synced or initial posts
  const [blogSearchQuery, setBlogSearchQuery] = useState('');
  const [selectedBlogCategory, setSelectedBlogCategory] = useState<string>('Todas');
  const [blogDateFilter, setBlogDateFilter] = useState<'all' | 'week' | 'month'>('all');

  // Offline caching states
  const [offlineSavedPostIds, setOfflineSavedPostIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oss_blog_offline_saved_posts_v4');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [isDownloadingPostId, setIsDownloadingPostId] = useState<string | null>(null);
  const [isOfflineOnly, setIsOfflineOnly] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast("Conexão estabelecida! Portal conectado ao tatame.", "success");
    };
    const handleOffline = () => {
      setIsOnline(false);
      addToast("Modo offline ativado. Você ainda pode ler os artigos e ouvir os podcasts salvos.", "info");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const featuredKimono = useMemo(() => {
    return productList.find(p => p.category === 'Kimonos') || productList[0];
  }, [productList]);
  
  const searchSuggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const lowerQuery = searchQuery.toLowerCase().trim();
    const words = lowerQuery.split(/\s+/).filter(w => w.length > 0);
    
    // Belt keywords detection
    const beltKeywords: Record<string, string[]> = {
      'Branca': ['branca', 'branco', 'white', 'iniciante', 'beginner'],
      'Azul': ['azul', 'blue'],
      'Roxa': ['roxa', 'roxo', 'purple'],
      'Marrom': ['marrom', 'brown'],
      'Preta': ['preta', 'preto', 'black', 'master']
    };

    let queryBelts: string[] = [];
    for (const [beltColor, keywords] of Object.entries(beltKeywords)) {
      if (keywords.some(k => words.includes(k) || lowerQuery.includes(k))) {
        queryBelts.push(beltColor);
      }
    }

    return productList
      .filter(product => {
        // Full string match
        const matchesFull = product.title.toLowerCase().includes(lowerQuery) ||
                            product.category.toLowerCase().includes(lowerQuery) ||
                            (product.brand && product.brand.toLowerCase().includes(lowerQuery)) ||
                            (product.subCategory && product.subCategory.toLowerCase().includes(lowerQuery));
        if (matchesFull) return true;

        if (queryBelts.length > 0) {
          const productBelts = product.belts || (product.beltColor ? [product.beltColor] : []);
          const matchesAnyBelt = productBelts.some(b => queryBelts.includes(b));
          
          if (matchesAnyBelt) {
            const nonBeltWords = words.filter(w => {
              return !Object.values(beltKeywords).some(keywords => keywords.includes(w));
            });
            if (nonBeltWords.length === 0) return true;
            return nonBeltWords.every(word => {
              return product.title.toLowerCase().includes(word) ||
                     product.category.toLowerCase().includes(word) ||
                     product.description.toLowerCase().includes(word);
            });
          }
        }

        // Tokenized fallback
        return words.every(word => 
          product.title.toLowerCase().includes(word) ||
          product.category.toLowerCase().includes(word) ||
          (product.brand && product.brand.toLowerCase().includes(word)) ||
          (product.subCategory && product.subCategory.toLowerCase().includes(word)) ||
          (product.tags && product.tags.some(tag => tag.toLowerCase().includes(word)))
        );
      })
      .sort((a, b) => (b.rating || 0) - (a.rating || 0)) // Higher rated first in suggestions
      .slice(0, 6);
  }, [searchQuery, productList]);

  const handleSuggestionClick = (product: any) => {
    setSearchQuery(product.title);
    setIsAdvancedSearchOpen(false);
    // Optionally open the product details modal
    openCheckoutModal(product);
  };
  const [audioSources, setAudioSources] = useState<Record<string, string>>({});
  
  // Hero Carousel State
  const [heroIndex, setHeroIndex] = useState(0);
  const heroImages = [
    {
      url: bjjHeroBanner,
      caption: 'A disciplina é o único caminho. Não há atalhos no tatame da vida.'
    },
    {
      url: bjjKimonoDetail,
      caption: 'O silêncio do guerreiro é sua maior arma. Deixe que sua técnica fale.'
    },
    {
      url: bjjActionGrappling,
      caption: 'Jiu-Jitsu não é sobre peso, mas sobre o quanto sua mente resiste.'
    },
    {
      url: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=1920&auto=format&fit=crop',
      caption: 'Ooss. O respeito é o fundamento. A técnica é a libertação.'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 8000); // 8 seconds for a more relaxed pace
    return () => clearInterval(timer);
  }, [heroIndex, heroImages.length]); // Adding heroIndex to reset timer on manual navigation
  
  useEffect(() => {
    if (view !== 'SHOP') return;
    
    setIsLoadingProducts(true);
    const timer = setTimeout(() => {
      setIsLoadingProducts(false);
    }, 480); // Smooth loading effect for filter updates with rotating kimono
    
    return () => clearTimeout(timer);
  }, [
    selectedCategory, 
    priceRange, 
    selectedBrands, 
    selectedSizes, 
    selectedColors,
    selectedGenders, 
    selectedBelts, 
    selectedPlatforms,
    selectedSubCategories,
    selectedProductTypes,
    selectedPractitionerLevels,
    selectedRating, 
    searchQuery,
    sortBy,
    aiRefinementQuery,
    selectedAiStyles,
    selectedAiMaterials,
    aiRelevanceWeight,
    currentPage,
    view
  ]);

  const productOfTheWeek = useMemo(() => {
    const kimonos = productList.filter(p => p.category === 'Kimonos');
    if (kimonos.length === 0) return null;
    // We use a simple hash of the current date to pick "randomly" but keep it consistent for the day
    const dayHash = new Date().toISOString().split('T')[0].split('-').join('');
    const index = parseInt(dayHash) % kimonos.length;
    return kimonos[index];
  }, [productList]);

  const [editingUrls, setEditingUrls] = useState<Record<string, string>>({});

  // Loyalty Program States
  const [loyaltyEnabled, setLoyaltyEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('oss_loyalty_enabled') === 'true';
    }
    return false;
  });
  const [loyaltyPointsRatio, setLoyaltyPointsRatio] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oss_loyalty_points_ratio');
      return saved ? parseInt(saved, 10) : 10;
    }
    return 10;
  });
  const [loyaltyWelcomeBonus, setLoyaltyWelcomeBonus] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oss_loyalty_welcome_bonus');
      return saved ? parseInt(saved, 10) : 100;
    }
    return 100;
  });
  const [loyaltyReviewBonus, setLoyaltyReviewBonus] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oss_loyalty_review_bonus');
      return saved ? parseInt(saved, 10) : 50;
    }
    return 50;
  });
  const [loyaltyMinRedeemPoints, setLoyaltyMinRedeemPoints] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oss_loyalty_min_redeem_points');
      return saved ? parseInt(saved, 10) : 200;
    }
    return 200;
  });
  const [loyaltyDiscountValue, setLoyaltyDiscountValue] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oss_loyalty_discount_value');
      return saved ? parseInt(saved, 10) : 10;
    }
    return 10;
  });

  const handleSaveLoyaltySettings = (
    enabled: boolean, 
    ratio: number, 
    welcome: number, 
    review: number, 
    minRedeem: number, 
    discount: number
  ) => {
    setLoyaltyEnabled(enabled);
    setLoyaltyPointsRatio(ratio);
    setLoyaltyWelcomeBonus(welcome);
    setLoyaltyReviewBonus(review);
    setLoyaltyMinRedeemPoints(minRedeem);
    setLoyaltyDiscountValue(discount);

    localStorage.setItem('oss_loyalty_enabled', String(enabled));
    localStorage.setItem('oss_loyalty_points_ratio', String(ratio));
    localStorage.setItem('oss_loyalty_welcome_bonus', String(welcome));
    localStorage.setItem('oss_loyalty_review_bonus', String(review));
    localStorage.setItem('oss_loyalty_min_redeem_points', String(minRedeem));
    localStorage.setItem('oss_loyalty_discount_value', String(discount));
  };
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('oss_terms_accepted') === 'true';
    }
    return false;
  });

  // LGPD Compliance & Privacy Hub Modal State
  const [isLgpdModalOpen, setIsLgpdModalOpen] = useState<boolean>(false);
  const [lgpdModalInitialTab, setLgpdModalInitialTab] = useState<'privacy' | 'terms' | 'cookies' | 'rights' | 'dpo' | 'certificate'>('privacy');

  const handleOpenLgpdModal = (tab: 'privacy' | 'terms' | 'cookies' | 'rights' | 'dpo' | 'certificate' = 'privacy') => {
    setLgpdModalInitialTab(tab);
    setIsLgpdModalOpen(true);
    if (typeof playClickSound === 'function') {
      playClickSound();
    }
  };

  const handleLgpdBannerAccept = (consents: any) => {
    setHasAcceptedTerms(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('oss_terms_accepted', 'true');
      localStorage.setItem('oss_lgpd_consents', JSON.stringify(consents));
    }
    addToast('Preferências de privacidade LGPD confirmadas com sucesso!', 'success', <ShieldCheck size={14} className="text-green-500" />);
    if (user?.uid) {
      const timestamp = new Date().toISOString();
      setDoc(doc(db, "users", user.uid), {
        lgpdConsent: {
          ...consents,
          consentDate: timestamp,
          userAgent: navigator.userAgent,
          ipMock: "186.221.73." + Math.floor(Math.random() * 255)
        },
        updatedAt: timestamp
      }, { merge: true }).catch((err) => {
        console.error("Error saving banner consent: ", err);
      });
    }
  };

  const handleLgpdSaveConsents = (consents: LGPDConsentState) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('oss_lgpd_consents', JSON.stringify(consents));
    }
    addToast('Preferências de consentimento LGPD salvas com sucesso!', 'success', <ShieldCheck size={14} className="text-green-500" />);
  };
  const [affiliateIds, setAffiliateIds] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oss_affiliate_ids');
      return saved ? JSON.parse(saved) : {
        amazon: '',
        mercadolivre: '',
        shopee: '',
        shein: '',
        tiktok: ''
      };
    }
    return {
      amazon: '',
      mercadolivre: '',
      shopee: '',
      shein: '',
      tiktok: ''
    };
  });

  // Dynamic date calculation utilities to solve desynchronized timeline issues
  const getRelativeDateString = (daysAgo: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const getMostRecentWeekdayDate = (targetDay: number): string => {
    // targetDay: 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday, 0 = Sunday
    const today = new Date();
    const todayDay = today.getDay();
    let diff = todayDay - targetDay;
    if (diff < 0) {
      diff += 7;
    }
    return getRelativeDateString(diff);
  };

  const initialBlogPosts: BlogPost[] = [
    {
      id: "init-gi-guide",
      title: "Guia Definitivo do Kimono Perfeito: Trançados, GSM, Tamanhos e Regras IBJJF",
      excerpt: "Entenda a diferença técnica entre tecidos Pearl, Gold e Single Weave, como escolher a numeração correta de A0 a A5 e evite a desclassificação na checagem oficial.",
      content: `<p class="intro">Escolher o kimono ideal é a decisão mais importante do praticante de Jiu-Jitsu. Seja você um faixa-branca iniciando a jornada ou um atleta experiente preparando o material de competição, o uniforme correto impacta diretamente seu desempenho, conforto e durabilidade nos treinos.</p>

<h3 class="text-xl font-bold uppercase mt-6 mb-3">1. Decifrando os Tipos de Trançado e Gramatura (GSM)</h3>
<p class="mb-4">O tecido do kimono é medido em gramas por metro quadrado (GSM). Quanto maior o GSM, mais pesado e denso é o tecido:</p>
<ul class="list-disc pl-6 space-y-2 mb-6">
  <li><strong>Single Weave (300 a 450 GSM):</strong> Tecido leve e macio. Excelente para dias quentes de verão e batimento de peso rigoroso em torneios.
  <li><strong>Pearl Weave (400 a 550 GSM):</strong> O padrão-ouro do Jiu-Jitsu moderno. Combina a leveza do trançado simples com a resistência a rasgos do trançado duplo. É a escolha preferida de 90% dos atletas de elite.</li>
  <li><strong>Gold / Double Weave (650 a 900 GSM):</strong> O blindado clássico. Tecido extremamente espesso que dificulta as pegadas do adversário na gola, porém mais pesado e quente.</li>
</ul>

<h3 class="text-xl font-bold uppercase mt-6 mb-3">2. Tabela de Tamanhos e Ajustes Especiais (A0 a A5, A2L)</h3>
<p class="mb-4">As marcas utilizam a letra 'A' (Adulto) seguida de numerações de 0 a 5. Para atletas com biotipos específicos, surgiram as variações L (Long) e H (Heavy):</p>
<ul class="list-disc pl-6 space-y-2 mb-6">
  <li><strong>A2L (Long):</strong> Indicado para praticantes altos e esguios, oferecendo mangas e calça mais compridas sem sobra de pano no tronco.</li>
  <li><strong>A2H (Heavy):</strong> Projetado para atletas mais fortes ou atarrancados, garantindo amplitude nos ombros e quadril.</li>
</ul>

<h3 class="text-xl font-bold uppercase mt-6 mb-3">3. Homologação da IBJJF / CBJJ</h3>
<p class="mb-4">Para competir em torneios oficiais, seu kimono deve respeitar estritamente as regulamentações:</p>
<ul class="list-disc pl-6 space-y-2 mb-4">
  <li><strong>Cores Oficiais:</strong> Apenas Branco, Azul Real e Preto. Proibido kimonos mesclados ou com saia de cor diferente da calça.</li>
  <li><strong>Gola:</strong> Deve possuir revestimento de borracha EVA bactericida com espessura máxima de 2,5cm e largura de 5cm.</li>
  <li><strong>Folga e Comprimento:</strong> A folga da manga deve permitir a passagem do medidor oficial com margem mínima de 7cm quando o braço estiver estendido à frente.</li>
</ul>`,
      author: "Equipe Editorial OSS.OS",
      role: "Especialista em Equipamentos",
      readTime: "9 min",
      date: getMostRecentWeekdayDate(3),
      imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=1200&auto=format&fit=crop",
      category: "Guia de Kimonos",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      hasAudio: true,
      sponsoredUrl: "/shop?category=Kimonos"
    },
    {
      id: "init-brand-reviews",
      title: "Review Comparativo 2026: As Melhores Marcas de Kimono do Mercado (Venum, Koral, Atama, Tatami & Shoyoroll)",
      excerpt: "Avaliamos minuciosamente o acabamento, costura tripla, gola de EVA e resistência ao encolhimento das marcas mais cobiçadas pelos jiujiteiros.",
      content: `<p class="intro">Com dezenas de marcas disputando a preferência no tatame, escolher onde investir o seu dinheiro exige olhar técnico. Nossa equipe testou e comparou os modelos topo de linha das principais fabricantes globais e nacionais.</p>

<h3 class="text-xl font-bold uppercase mt-6 mb-3">1. Atama & Koral: O Heritage e a Tradição Indestrutível</h3>
<p class="mb-4">Líderes históricas da era romântica do BJJ, Atama (com o clássico modelo Mundial) e Koral (modelo Light) mantêm o selo de durabilidade imbatível. Suas costuras triplas nos pontos de maior estresse (joelhos, cavalo da calça e axilas) garantem vida útil superior a 4 anos mesmo em regime de treino diário.</p>

<h3 class="text-xl font-bold uppercase mt-6 mb-3">2. Venum Fightwear: Tecnologia Têxtil e Modelagem Anatômica</h3>
<p class="mb-4">A Venum revolucionou o mercado com kimonos pré-encolhidos e corte slim-fit que reduzem a sobra de tecido para pegadas do adversário. O modelo Venum Elite em tecido Pearl Weave 450 GSM se destaca pelo conforto térmico excepcional e gola com eva de densidade progressiva.</p>

<h3 class="text-xl font-bold uppercase mt-6 mb-3">3. Tatami Fightwear & Shoyoroll: O Design de Culto e Lotes Limitados</h3>
<p class="mb-4">Para quem busca estética diferenciada e acabamento de alfaiataria esportiva, Tatami e Shoyoroll lideram a preferência dos praticantes mais jovens, combinando patches de alta definição e bordados diretos no tecido sem comprometer a flexibilidade.</p>`,
      author: "Laboratório de Gear OSS.OS",
      role: "Reviewer de Marcas",
      readTime: "11 min",
      date: getMostRecentWeekdayDate(2),
      imageUrl: "https://images.unsplash.com/photo-1552072092-2f9b132a7785?q=80&w=1200&auto=format&fit=crop",
      category: "Reviews de Marcas",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      hasAudio: true,
      sponsoredUrl: "/shop?category=Kimonos"
    },
    {
      id: "init-training-tips",
      title: "Dicas de Treino, Recuperação & Longevidade: Como Treinar 5x por Semana sem Lesões",
      excerpt: "Aprenda a técnica de esparadrapagem de dedos (taping), nutrição tática pré-treino, banho de contraste e a regra dos 80/20 para durar décadas no tatame.",
      content: `<p class="intro">O maior desafio do praticante constante de Jiu-Jitsu não é aprender novas raspagens, mas sim manter a consistência física e evitar lesões articulares crônicas ao longo dos anos.</p>

<h3 class="text-xl font-bold uppercase mt-6 mb-3">1. Esparadrapagem de Precisão para Proteção dos Dedos</h3>
<p class="mb-4">A hipertensão constante das articulações falângicas ao segurar golas e mangas causa microtraumas e artrite precoce. Aplicar esparadrapo esportivo em padrão cruzado ("X") sobre as articulações reduz o impacto mecânico sem limitar a força de preensão.</p>

<h3 class="text-xl font-bold uppercase mt-6 mb-3">2. Reposição de Eletrólitos e Estratégia Antinflamatória</h3>
<p class="mb-4">Em um treino intenso de 2 horas, o atleta perde até 2 litros de suor e minerais vitais (Sódio, Potássio e Magnésio). A ingestão de bebidas isotônicas combinada com suplementação de Creatina e Ômega-3 acelera a síntese proteica e reduz a dor muscular de início tardio (DMIT).</p>

<h3 class="text-xl font-bold uppercase mt-6 mb-3">3. A Regra dos 80/20 no Rola Diário</h3>
<p class="mb-4">Não encare cada treino como uma final de campeonato. Reserve 80% do seu tempo de tatame para 'Flow Training' (treino leve focado em posições e refino de guarda) e apenas 20% para rodar em intensidade máxima de competição.</p>`,
      author: "Dr. Marcos Vianna",
      role: "Fisioterapeuta Esportivo BJJ",
      readTime: "8 min",
      date: getMostRecentWeekdayDate(1),
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop",
      category: "Dicas de Treino",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      hasAudio: true
    },
    {
      id: "init-interview",
      title: "Entrevista Exclusiva: Segredos da Guarda Aranha e Longevidade nos Tatames com Mestre Carlos",
      excerpt: "Bate-papo profundo sobre a evolução do Jiu-Jitsu moderno, manutenção da mente de principiante (Shoshin) e a escolha dos melhores equipamentos.",
      content: `<p class="intro">Na nossa série especial de entrevistas com referências do esporte, conversamos com o Mestre Carlos, faixa-preta 5º grau, sobre sua trajetória de mais de 30 anos nos tatames e a filosofia de vida por trás da arte suave.</p>

<p class="mb-4"><strong>OSS.OS: Mestre, qual é o principal segredo para manter uma guarda aranha agressiva e eficiente sem desgastar os ombros e joelhos?</strong></p>
<p class="mb-6 font-serif italic text-lg pl-4 border-l-2 border-red-600">"O segredo da guarda aranha não está na força bruta das mãos, mas no uso inteligente do quadril e nas alavancas dos pés no bíceps. Você deve usar a gravidade e a postura do adversário contra ele mesmo. Quando o atleta tenta fazer força com o bíceps em vez de empurrar com as pernas, ele machuca os cotovelos."</p>

<p class="mb-4"><strong>OSS.OS: O que mudou na preparação física e nos equipamentos de Jiu-Jitsu desde que o senhor começou na faixa branca?</strong></p>
<p class="mb-6 font-serif italic text-lg pl-4 border-l-2 border-red-600">"Na minha época, os kimonos eram pesados como cobertor e demoravam dois dias para secar! Hoje em dia temos tecidos ultra leve Pearl Weave, rashguards de alta compressão que previnem lesões na pele e protetores bucais anatômicos. A evolução do material permitiu que o atleta treine com muito mais segurança e conforto."</p>`,
      author: "Redação OSS.OS",
      role: "Editor Chefe",
      readTime: "10 min",
      date: getMostRecentWeekdayDate(5),
      imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1200&auto=format&fit=crop",
      category: "Entrevistas",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      hasAudio: true
    },
    {
      id: "init-rss-1",
      title: "Mundial IBJJF 2026: Mica Galvão Faz História com Ouro Duplo e Dream Art no Topo",
      excerpt: "Uma cobertura completa das finais e disputas de peso absoluto faixa preta na lendária Pirâmide de Long Beach em Junho de 2026.",
      content: "A Pirâmide em Long Beach, Califórnia, testemunhou um dos capítulos mais espetaculares do Jiu-Jitsu moderno no Mundial de 2026 da IBJJF. Mica Galvão chocou o mundo ao conquistar o tão sonhado ouro duplo na faixa preta médio e absoluto masculino. Com finalizações rápidas, incluindo chaves de braço e estrangulamentos pelas costas, Mica impôs um ritmo inalcançável para seus adversários. Pelo lado das equipes, a Dream Art consagrou-se campeã geral por equipes, superando gigantes como Alliance e Atos em disputas eletrizantes de tirar o fôlego.",
      author: "Redação OSS.OS",
      role: "Correspondente Internacional",
      readTime: "5 min",
      date: getMostRecentWeekdayDate(0),
      imageUrl: "https://images.unsplash.com/photo-1510279931157-4b703e301233?q=80&w=1200&auto=format&fit=crop",
      category: "Results",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      hasAudio: true
    },
    {
      id: "init-rss-2",
      title: "Manual de Especialista: Passagem Knee Slide com Controle Escapular Profundo",
      excerpt: "Neste tutorial prático de alta performance, desconstruímos os ajustes biomecânicos cruciais para passar cruzando o joelho.",
      content: `<p class="intro">A passagem cruzando o joelho (knee slide) é o pilar básico dos passadores de elite de 2026, mas seu sucesso depende de um controle invisível: o travamento da escápula oposta.</p>

<p class="mb-8">Se você permitir que o oponente esgrime seu quadril ou mantenha um escudo de joelho ativo, a passagem está fadada ao fracasso. Este guia desvenda os ajustes de alavanca ocultos para neutralizar a guarda:</p>`,
      author: "Professor Técnico",
      role: "Especialista em Técnicas",
      readTime: "8 min",
      date: getMostRecentWeekdayDate(6),
      imageUrl: "https://images.unsplash.com/photo-1552072092-2f9b132a7785?q=80&w=1200&auto=format&fit=crop",
      category: "Tutorial",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      hasAudio: true,
      hasVideo: true
    },
    {
      id: "init-philosophy-1",
      title: "Filosofia & Mente de Aço: A Arte da Calma Sob Extrema Pressão no Tatame",
      excerpt: "Como a filosofia estoica e a serenidade tática moldam praticantes resilientes no tatame e nos negócios.",
      content: `<p class="intro">O Jiu-Jitsu não é apenas um sistema de combate físico; é um laboratório vivo de filosofia aplicada e resiliência psicológica. Quando você está preso sob a pressão de um oponente mais pesado, o pânico é seu maior inimigo.</p>

<h3 class="text-xl font-bold uppercase mt-6 mb-3">1. O Controle da Respiração Diatragmática</h3>
<p class="mb-4">Sob asfixia ou pressão na caixa torácica, a mente tende ao pânico. Manter a respiração cadenciada reduz a frequência cardíaca e preserva o oxigênio para tomadas de decisão lúcidas.</p>

<h3 class="text-xl font-bold uppercase mt-6 mb-3">2. Aceitação do Obstáculo como Caminho</h3>
<p class="mb-4">Inspirado nos escritos de Marco Aurélio, o guerreiro aceita a posição desvantajosa como oportunidade para testar defesas e refinar a compostura interior.</p>`,
      author: "Mestre Helio S.",
      role: "Filósofo de Tatame & Faixa Preta",
      readTime: "7 min",
      date: getMostRecentWeekdayDate(4),
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop",
      category: "Philosophy",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      hasAudio: true
    }
  ];

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    if (typeof window !== 'undefined') {
      const purgeKey = 'oss_purge_force_v2026_blog_outlines_v9'; 
      if (localStorage.getItem(purgeKey) !== 'true') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('oss_blog_posts') || key.startsWith('oss_purge') || key.startsWith('oss_last_scout_date')) localStorage.removeItem(key);
        });
        localStorage.setItem(purgeKey, 'true');
        return initialBlogPosts; 
      }

      const saved = localStorage.getItem('oss_blog_posts_final_technical_v6_reborn');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.length > 0 ? parsed : initialBlogPosts;
        } catch (e) {
          console.error("Error parsing blog posts", e);
          return initialBlogPosts;
        }
      }
    }
    return initialBlogPosts;
  });

  const [blogPage, setBlogPage] = useState(1);
  const POSTS_PER_PAGE = 6;

  // Admin Curation & CMS Form States
  const [adminTab, setAdminTab] = useState<'products' | 'metrics' | 'news' | 'scout' | 'loyalty'>('products');

  // Product Curation Hooks
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productFormTitle, setProductFormTitle] = useState('');
  const [productFormDescription, setProductFormDescription] = useState('');
  const [productFormPrice, setProductFormPrice] = useState(0);
  const [productFormOriginalPrice, setProductFormOriginalPrice] = useState<number | undefined>(undefined);
  const [productFormImageUrl, setProductFormImageUrl] = useState('');
  const [productFormAffiliateUrl, setProductFormAffiliateUrl] = useState('');
  const [productFormPlatform, setProductFormPlatform] = useState<Product['platform']>('Mercado Livre');
  const [productFormCategory, setProductFormCategory] = useState<Category>('Kimonos');
  const [productFormBrand, setProductFormBrand] = useState('');
  const [productFormGender, setProductFormGender] = useState<Gender>('Unissex');
  const [productFormBeltsList, setProductFormBeltsList] = useState<string[]>([]);
  const [productFormSizesList, setProductFormSizesList] = useState<string[]>([]);

  // News & Podcast CMS Hooks
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [postFormTitle, setPostFormTitle] = useState('');
  const [postFormExcerpt, setPostFormExcerpt] = useState('');
  const [postFormContent, setPostFormContent] = useState('');
  const [postFormCategory, setPostFormCategory] = useState<BlogPost['category']>('News');
  const [postFormImageUrl, setPostFormImageUrl] = useState('');
  const [postFormAudioUrl, setPostFormAudioUrl] = useState('');
  const [postFormHasAudio, setPostFormHasAudio] = useState(false);
  const [postFormAuthor, setPostFormAuthor] = useState('Redação OSS.OS');
  const [postFormVideoUrl, setPostFormVideoUrl] = useState('');
  const [postFormHasVideo, setPostFormHasVideo] = useState(false);
  const [postFormSponsoredUrl, setPostFormSponsoredUrl] = useState('');

  // Manual Product Curation handlers
  const handleOpenProductForm = (prod: Product | null = null) => {
    if (prod) {
      setEditingProduct(prod);
      setProductFormTitle(prod.title || '');
      setProductFormDescription(prod.description || '');
      setProductFormPrice(prod.price || 0);
      setProductFormOriginalPrice(prod.originalPrice);
      setProductFormImageUrl(prod.imageUrl || '');
      setProductFormAffiliateUrl(prod.affiliateUrl || '');
      setProductFormPlatform(prod.platform || 'Mercado Livre');
      setProductFormCategory(prod.category || 'Kimonos');
      setProductFormBrand(prod.brand || '');
      setProductFormGender(prod.gender || 'Unissex');
      setProductFormBeltsList(prod.belts || (prod.beltColor ? [prod.beltColor] : []));
      setProductFormSizesList(prod.size || []);
    } else {
      setEditingProduct(null);
      setProductFormTitle('');
      setProductFormDescription('');
      setProductFormPrice(0);
      setProductFormOriginalPrice(undefined);
      setProductFormImageUrl('');
      setProductFormAffiliateUrl('');
      setProductFormPlatform('Mercado Livre');
      setProductFormCategory('Kimonos');
      setProductFormBrand('');
      setProductFormGender('Unissex');
      setProductFormBeltsList([]);
      setProductFormSizesList([]);
    }
    setIsProductFormOpen(true);
  };

  const [isExtractingLink, setIsExtractingLink] = useState(false);

  const handleExtractMetadata = async (urlToExtract: string) => {
    if (!urlToExtract) {
      addToast("Insira o Link de Afiliado primeiro!", "error");
      return;
    }
    setIsExtractingLink(true);
    addToast("Analisando página e extraindo dados com IA...", "info");
    try {
      const response = await fetch(`/api/import/extract?url=${encodeURIComponent(urlToExtract)}`);
      if (!response.ok) throw new Error("Erro na extração de metadados");
      const metadata = await response.json();
      
      if (metadata.title) {
        setProductFormTitle(metadata.title);
      }
      if (metadata.price) {
        setProductFormPrice(metadata.price);
        // set original price to slightly higher
        setProductFormOriginalPrice(Math.round(metadata.price * 1.15));
      }
      if (metadata.imageUrl) {
        setProductFormImageUrl(metadata.imageUrl);
      }
      if (metadata.description) {
        setProductFormDescription(metadata.description);
      }
      if (metadata.platform) {
        setProductFormPlatform(metadata.platform);
      }
      if (metadata.sizes && Array.isArray(metadata.sizes)) {
        setProductFormSizesList(metadata.sizes);
      }
      
      addToast("Metadados preenchidos com sucesso via IA!", "success");
    } catch (err: any) {
      console.error(err);
      addToast("Não foi possível autocompletar tudo. Preencha manualmente.", "info");
    } finally {
      setIsExtractingLink(false);
    }
  };

  const handleSaveProduct = () => {
    if (!productFormTitle || !productFormPrice || !productFormAffiliateUrl) {
      addToast("Preencha o título, preço e link de afiliado!", "error");
      return;
    }

    const beltStr = productFormBeltsList.length > 0 ? productFormBeltsList[0] : undefined;

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `curated-${Math.random().toString(36).substring(2, 9)}`,
      title: productFormTitle,
      description: productFormDescription,
      price: Number(productFormPrice),
      originalPrice: productFormOriginalPrice ? Number(productFormOriginalPrice) : undefined,
      imageUrl: productFormImageUrl || 'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=800&auto=format&fit=crop',
      affiliateUrl: productFormAffiliateUrl,
      platform: productFormPlatform,
      category: productFormCategory,
      brand: productFormBrand || 'OSS.OS Curated',
      gender: productFormGender,
      beltColor: beltStr,
      belts: productFormBeltsList,
      size: productFormSizesList,
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviews: editingProduct ? editingProduct.reviews : [],
      isCurated: true,
      popularity: editingProduct ? editingProduct.popularity : 80,
      salesCount: editingProduct ? editingProduct.salesCount : 5
    };

    setProductList(prev => {
      if (editingProduct) {
        return prev.map(p => p.id === editingProduct.id ? productPayload : p);
      } else {
        return [productPayload, ...prev];
      }
    });

    setIsProductFormOpen(false);
    setEditingProduct(null);
    addToast(editingProduct ? "Produto editado com sucesso na curadoria!" : "Produto adicionado à sua curadoria de afiliados!", "success");
  };

  const handleDeleteProduct = (prodId: string) => {
    setCuratedProductIdToDelete(prodId);
  };

  // Manual Blog/Podcast publication handlers
  const handleOpenPostForm = (post: BlogPost | null = null) => {
    if (post) {
      setEditingPost(post);
      setPostFormTitle(post.title || '');
      setPostFormExcerpt(post.excerpt || '');
      setPostFormContent(post.content || '');
      setPostFormCategory(post.category || 'News');
      setPostFormImageUrl(post.imageUrl || '');
      setPostFormAudioUrl(post.audioUrl || '');
      setPostFormHasAudio(post.hasAudio || false);
      setPostFormAuthor(post.author || 'Redação OSS.OS');
      setPostFormVideoUrl(post.videoUrl || '');
      setPostFormHasVideo(post.hasVideo || false);
      setPostFormSponsoredUrl(post.sponsoredUrl || '');
    } else {
      setEditingPost(null);
      setPostFormTitle('');
      setPostFormExcerpt('');
      setPostFormContent('');
      setPostFormCategory('News');
      setPostFormImageUrl('');
      setPostFormAudioUrl('');
      setPostFormHasAudio(false);
      setPostFormAuthor('Redação OSS.OS');
      setPostFormVideoUrl('');
      setPostFormHasVideo(false);
      setPostFormSponsoredUrl('');
    }
    setIsPostFormOpen(true);
  };

  const handleSavePost = () => {
    if (!postFormTitle || !postFormContent) {
      addToast("Preencha pelo menos o título e o conteúdo!", "error");
      return;
    }

    const postPayload: BlogPost = {
      id: editingPost ? editingPost.id : `pub-${Math.random().toString(36).substring(2, 9)}`,
      title: postFormTitle,
      excerpt: postFormExcerpt || postFormContent.substring(0, 150) + '...',
      content: postFormContent,
      category: postFormCategory,
      imageUrl: postFormImageUrl || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=800&auto=format&fit=crop',
      audioUrl: postFormAudioUrl || undefined,
      hasAudio: postFormHasAudio || !!postFormAudioUrl || postFormCategory === 'Podcast',
      author: postFormAuthor || 'Redação OSS.OS',
      date: editingPost ? editingPost.date : new Date().toISOString().split('T')[0],
      videoUrl: postFormVideoUrl || undefined,
      hasVideo: postFormHasVideo || !!postFormVideoUrl,
      sponsoredUrl: postFormSponsoredUrl || undefined
    };

    setBlogPosts(prev => {
      let updated;
      if (editingPost) {
        updated = prev.map(p => p.id === editingPost.id ? postPayload : p);
      } else {
        updated = [postPayload, ...prev];
      }
      localStorage.setItem('oss_blog_posts_final_technical_v6_reborn', JSON.stringify(updated));
      return updated;
    });

    setIsPostFormOpen(false);
    setEditingPost(null);
    addToast(editingPost ? "Conteúdo editado com sucesso!" : "Conteúdo publicado com sucesso no site!", "success");
  };

  const handleDeletePost = (postId: string) => {
    if (confirm("Deseja realmente remover esta postagem do ar?")) {
      setBlogPosts(prev => {
        const updated = prev.filter(p => p.id !== postId);
        localStorage.setItem('oss_blog_posts_final_technical_v6_reborn', JSON.stringify(updated));
        return updated;
      });
      addToast("Conteúdo removido com sucesso.", "info");
    }
  };

  const filteredBlogPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(blogSearchQuery.toLowerCase()) || 
                           post.excerpt.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
                           post.content.toLowerCase().includes(blogSearchQuery.toLowerCase());
      
      let matchesCategory = selectedBlogCategory === 'Todas' || !selectedBlogCategory || post.category === selectedBlogCategory;
      if (!matchesCategory && selectedBlogCategory) {
        const catNorm = selectedBlogCategory.toLowerCase().trim();
        const postCatNorm = (post.category || '').toLowerCase().trim();

        if (catNorm === postCatNorm) {
          matchesCategory = true;
        } else if ((catNorm === 'tutorial' || catNorm === 'tutorials' || catNorm === 'técnica' || catNorm === 'tecnica') &&
                   (postCatNorm === 'tutorial' || postCatNorm === 'tutorials' || postCatNorm === 'técnica' || postCatNorm === 'tecnica')) {
          matchesCategory = true;
        } else if ((catNorm === 'results' || catNorm === 'resultados') &&
                   (postCatNorm === 'results' || postCatNorm === 'resultados')) {
          matchesCategory = true;
        } else if ((catNorm === 'philosophy' || catNorm === 'filosofia' || catNorm === 'sabedoria') &&
                   (postCatNorm === 'philosophy' || postCatNorm === 'filosofia' || postCatNorm === 'sabedoria')) {
          matchesCategory = true;
        }
      }

      let matchesDate = true;
      if (blogDateFilter !== 'all') {
        let postDate: Date;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(post.date)) {
          const parts = post.date.split('/');
          postDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
          postDate = new Date(post.date);
        }
        const now = new Date();
        const diffTime = isNaN(postDate.getTime()) ? 0 : Math.abs(now.getTime() - postDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (blogDateFilter === 'week') matchesDate = diffDays <= 7;
        if (blogDateFilter === 'month') matchesDate = diffDays <= 30;
      }

      const matchesOffline = !isOfflineOnly || offlineSavedPostIds.includes(post.id);

      return matchesSearch && matchesCategory && matchesDate && matchesOffline;
    });
  }, [blogPosts, blogSearchQuery, selectedBlogCategory, blogDateFilter, isOfflineOnly, offlineSavedPostIds]);

  const paginatedBlogPosts = useMemo(() => {
    // Show top 5 (featured + sidebar) plus (blogPage - 1) * POSTS_PER_PAGE more
    const initialCount = 5;
    return filteredBlogPosts.slice(0, initialCount + (blogPage - 1) * POSTS_PER_PAGE);
  }, [filteredBlogPosts, blogPage]);

  const hasMoreBlogPosts = useMemo(() => {
    return paginatedBlogPosts.length < filteredBlogPosts.length;
  }, [paginatedBlogPosts, filteredBlogPosts]);

  const loadMoreBlogPosts = () => {
    setBlogPage(prev => prev + 1);
  };

  const getPostsWithAudio = () => {
    const list = blogPosts.filter(p => p.category === 'Podcast' || p.audioUrl || p.hasAudio || audioSources[p.id]);
    return isOfflineOnly ? list.filter(p => offlineSavedPostIds.includes(p.id)) : list;
  };

  const toggleSaveOffline = async (post: BlogPost) => {
    const isSaved = offlineSavedPostIds.includes(post.id);
    if (isSaved) {
      const updated = offlineSavedPostIds.filter(id => id !== post.id);
      setOfflineSavedPostIds(updated);
      localStorage.setItem('oss_blog_offline_saved_posts_v4', JSON.stringify(updated));
      addToast(`"${post.title}" removido do acesso offline.`, "info");
    } else {
      setIsDownloadingPostId(post.id);
      addToast(`Baixando "${post.title}" para acesso offline...`, "info");
      try {
        // 1. Cache imagery in service worker
        if (post.imageUrl) {
          const cache = await caches.open('oss-bjj-offline-v4');
          try {
            await cache.add(post.imageUrl);
          } catch (e) {
            console.warn("Could not cache card image:", e);
          }
        }
        // 2. Cache audio files in IndexedDB
        const audioUrlToLoad = post.audioUrl || audioSources[post.id];
        if (audioUrlToLoad && !audioUrlToLoad.startsWith("data:") && !audioUrlToLoad.includes("SoundHelix") && !audioUrlToLoad.includes("soundhelix")) {
          try {
            const audioRes = await fetch(audioUrlToLoad);
            if (audioRes.ok) {
              const audioBlob = await audioRes.blob();
              await saveAudioToCache(post.id, audioBlob);
            }
          } catch (e) {
            console.warn("Could not cache audio blob:", e);
          }
        }
        const updated = [...offlineSavedPostIds, post.id];
        setOfflineSavedPostIds(updated);
        localStorage.setItem('oss_blog_offline_saved_posts_v4', JSON.stringify(updated));
        addToast(`"${post.title}" pronto para uso offline! 📥`, "success");
      } catch (err) {
        console.error("Offline download failure:", err);
        addToast("Erro ao preparar conteúdo para offline.", "error");
      } finally {
        setIsDownloadingPostId(null);
      }
    }
  };

  // Sync audioSources with blogPosts by converting Data URLs or IDB entries to Blob URLs
  useEffect(() => {
    let isMounted = true;
    
    const syncAudio = async () => {
      const currentIds = new Set(blogPosts.map(p => p.id));
      const nextSources = { ...audioSources };
      let changed = false;

      // 1. Cleanup old sources that are no longer in the post list
      for (const id in nextSources) {
        if (!currentIds.has(id)) {
          try {
            URL.revokeObjectURL(nextSources[id]);
          } catch (e) {
            console.error("Error revoking URL:", e);
          }
          delete nextSources[id];
          changed = true;
        }
      }

      // 2. Add new sources for posts that have audio data (in memory or IDB)
      for (const post of blogPosts) {
        if (!nextSources[post.id]) {
          let dataUrl = post.audioUrl;
          
          if (dataUrl) {
            if (dataUrl.startsWith('data:')) {
              const blob = dataUrlToBlob(dataUrl);
              if (blob) {
                nextSources[post.id] = URL.createObjectURL(blob);
                changed = true;
                console.log(`[SYNC] Success converting data URL to Blob URL for post ${post.id}`);
              } else {
                console.warn(`[SYNC] Failed to convert data URL to blob for post ${post.id}`);
              }
            } else {
              nextSources[post.id] = dataUrl;
              changed = true;
              console.log(`[SYNC] Mapped active audio URL for post ${post.id}`);
            }
          } else {
            const blob = await getAudioBlobFromDB(post.id);
            if (blob && isMounted) {
              nextSources[post.id] = URL.createObjectURL(blob);
              changed = true;
              console.log(`[SYNC] Success loading Blob from IDB for post ${post.id}`);
            }
          }
        }
      }

      // 3. Sync Video Sources
      const nextVideoSources = { ...videoSources };
      let videoChanged = false;
      
      for (const post of blogPosts) {
        if (post.videoUrl && !nextVideoSources[post.id]) {
          const blob = dataUrlToBlob(post.videoUrl);
          if (blob) {
            nextVideoSources[post.id] = URL.createObjectURL(blob);
            videoChanged = true;
          }
        }
      }

      if (changed && isMounted) {
        setAudioSources(nextSources);
      }
      if (videoChanged && isMounted) {
        setVideoSources(nextVideoSources);
      }
    };

    syncAudio();

    return () => {
      isMounted = false;
    };
  }, [blogPosts]);

  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [socialShareProduct, setSocialShareProduct] = useState<Product | null>(null);
  const [isSocialShareModalOpen, setIsSocialShareModalOpen] = useState<boolean>(false);
  const [cartFeedback, setCartFeedback] = useState<string | null>(null);
  
  // Fly-to-cart animation state
  interface FlyingItem {
    id: string;
    imageUrl: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  }
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartItemToRemove, setCartItemToRemove] = useState<CartItem | null>(null);
  const cartCount = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [cartDiscountCoupon, setCartDiscountCoupon] = useState("");
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState(0);
  const [couponFeedbackMsg, setCouponFeedbackMsg] = useState("");
  
  // Checkout Multi-Step Modal States
  const [isCheckoutDrawerProgressOpen, setIsCheckoutDrawerProgressOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1); // 1: Shipping, 2: Payment, 3: Success
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingZip, setShippingZip] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingNumber, setShippingNumber] = useState("");
  const [shippingBairro, setShippingBairro] = useState("");
  const [shippingCityState, setShippingCityState] = useState("");
  const [isZipSearching, setIsZipSearching] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  
  // Credit Card States
  const [ccNumber, setCcNumber] = useState("");
  const [ccName, setCcName] = useState("");
  const [ccExpiry, setCcExpiry] = useState("");
  const [ccCvv, setCcCvv] = useState("");
  const [ccFocusedField, setCcFocusedField] = useState<string>("");
  const [isCcProcessing, setIsCcProcessing] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // Gallery Size selectors
  const [selectedGallerySize, setSelectedGallerySize] = useState<string>("");
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [calcHeight, setCalcHeight] = useState(175);
  const [calcWeight, setCalcWeight] = useState(75);

  // Shopping Cart calculations
  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }, [cartItems]);

  const cartDiscountAmount = useMemo(() => {
    return (cartSubtotal * appliedDiscountPercent) / 100;
  }, [cartSubtotal, appliedDiscountPercent]);

  const freightAmount = useMemo(() => {
    if (cartSubtotal === 0) return 0;
    return cartSubtotal >= 199 ? 0 : 15;
  }, [cartSubtotal]);

  const cartTotal = useMemo(() => {
    return cartSubtotal - cartDiscountAmount + freightAmount;
  }, [cartSubtotal, cartDiscountAmount, freightAmount]);

  const cartMultiStoreComparison = useMemo(() => {
    if (cartItems.length === 0) return null;
    
    let mlTotal = 0;
    let amzTotal = 0;
    let shpTotal = 0;
    let cntTotal = 0;
    
    cartItems.forEach(item => {
      const basePrice = item.product.price;
      const qty = item.quantity;
      
      // Look up specific offer if exists, otherwise generate computed fallback
      const getOfferPrice = (storeName: string, factor: number) => {
        if (item.product.offers) {
          const offer = item.product.offers.find(o => o.storeName.toLowerCase() === storeName.toLowerCase());
          if (offer) return offer.price * qty;
        }
        const variance = Math.sin(storeName.charCodeAt(0) + basePrice) * 0.02;
        return Math.round(basePrice * (factor + variance) * 100) / 100 * qty;
      };
      
      mlTotal += getOfferPrice("Mercado Livre", 0.98);
      amzTotal += getOfferPrice("Amazon", 1.0);
      shpTotal += getOfferPrice("Shopee", 0.96);
      cntTotal += getOfferPrice("Centauro", 1.02);
    });
    
    const platforms = [
      { name: "Mercado Livre", total: mlTotal },
      { name: "Amazon", total: amzTotal },
      { name: "Shopee", total: shpTotal },
      { name: "Centauro", total: cntTotal }
    ].sort((a, b) => a.total - b.total);
    
    return platforms;
  }, [cartItems]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCoupon = cartDiscountCoupon.trim().toUpperCase();
    if (cleanCoupon === "OSS10") {
      setAppliedDiscountPercent(10);
      setCouponFeedbackMsg("OSS10: 10% DE DESCONTO APLICADO!");
      addToast("Cupom OSS10 ativado!", "success", <Tag size={12} />);
    } else if (cleanCoupon === "TATAME15") {
      setAppliedDiscountPercent(15);
      setCouponFeedbackMsg("TATAME15: 15% DE DESCONTO APLICADO!");
      addToast("Cupom TATAME15 ativado!", "success", <Tag size={12} />);
    } else {
      setCouponFeedbackMsg("CUPOM INVÁLIDO OU EXPIRADO.");
      addToast("Cupom inválido.", "error", <X size={12} />);
    }
  };

  const handleRemoveCartItem = (itemId: string, itemTitle: string) => {
    playClickSound();
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    addToast(`"${itemTitle}" removido da sacola.`, "info", <Trash2 size={12} />);
  };

  const handleQuantityChange = (itemId: string, change: number) => {
    playClickSound();
    setCartItems(prev => {
      let updatedQty = 1;
      let targetFound = false;

      const updated = prev.map(item => {
        if (item.id === itemId) {
          const nextQty = Math.max(1, item.quantity + change);
          updatedQty = nextQty;
          targetFound = true;
          return { ...item, quantity: nextQty };
        }
        return item;
      });

      if (targetFound) {
        const newSubtotal = updated.reduce((acc, it) => acc + (it.product.price * it.quantity), 0);
        const formattedSubtotal = `R$ ${newSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        addToast(
          `Quantidade atualizada (${updatedQty}x) • Subtotal: ${formattedSubtotal}`,
          "info",
          <ShoppingCart size={13} className="text-amber-400" />
        );
      }

      return updated;
    });
  };

  const handleZipChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 8);
    setShippingZip(raw);
    
    if (raw.length === 8) {
      setIsZipSearching(true);
      setTimeout(() => {
        setIsZipSearching(false);
        setShippingAddress("Avenida Paulista");
        setShippingBairro("Bela Vista");
        setShippingCityState("São Paulo - SP");
        addToast("CEP Encontrado e Autocompletado!", "success", <MapPin size={12} />);
      }, 1000);
    }
  };

  const handleStartCheckout = () => {
    playClickSound();
    setIsCartDrawerOpen(false);
    
    const randomOrder = `OSS-${Math.floor(10000 + Math.random() * 90000)}-BJJ`;
    setOrderNumber(randomOrder);
    
    // Auto-prefill affiliate parameters for delivery bypassed states
    setShippingName(user?.displayName || "Atleta Convidado");
    setShippingPhone("(11) 99999-9999");
    setShippingZip("01310-100");
    setShippingAddress("Redirecionamento Comercial Integrado");
    setShippingNumber("S/N");
    setShippingBairro("Internet");
    setShippingCityState("Site Oficial Parcerias");
    
    setCheckoutStep(1);
    setIsCheckoutDrawerProgressOpen(true);
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    setCheckoutStep(2);
    addToast("Jornada de Redirecionamento Iniciada!", "success", <Check size={12} />);
  };

  const handlePixCompleteSimulate = () => {
    playClickSound();
    setCheckoutStep(3);
    setCartItems([]); // clear cart!
    addToast("Pagamento Pix confirmado pela rede!", "success", <Check size={12} />);
  };

  const handleCcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    if (ccNumber.replace(/\D/g, "").length < 16) {
      addToast("Número de cartão inválido.", "error", <X size={12} />);
      return;
    }
    if (!ccName || !ccExpiry || ccCvv.length < 3) {
      addToast("Preencha todos os dados do cartão.", "error", <X size={12} />);
      return;
    }
    
    setIsCcProcessing(true);
    addToast("Processando pagamento black-belt...", "info", <Loader2 className="animate-spin text-green-600" size={12} />);
    
    setTimeout(() => {
      setIsCcProcessing(false);
      setCheckoutStep(3);
      setCartItems([]); // clear cart!
      addToast("Compra aprovada e confirmada!", "success", <Check size={12} />);
    }, 2000);
  };

  const handleCopyPix = () => {
    const pixCode = `00020101021226830014br.gov.bcb.pix2561api.oss.os/pay/bjjportal/${orderNumber.toLowerCase()}/val=${cartTotal.toFixed(2)}`;
    navigator.clipboard.writeText(pixCode);
    setPixCopied(true);
    addToast("Código de pagamento Pix copiado!", "success", <Check size={12} />);
    setTimeout(() => setPixCopied(false), 2000);
  };

  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s+/g, "");
    if (clean.startsWith('4')) return 'visa';
    if (clean.startsWith('5')) return 'mastercard';
    if (clean.startsWith('3')) return 'amex';
    return 'unknown';
  };

  const formatCardNumber = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 16);
    let formatted = "";
    for (let i = 0; i < raw.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += " ";
      }
      formatted += raw[i];
    }
    return formatted;
  };

  const [internalBlogImages, setInternalBlogImages] = useState<Record<string, string>>({});
  const [isSyncingBlog, setIsSyncingBlog] = useState(false);
  const [isGeneratingBlogImage, setIsGeneratingBlogImage] = useState<string | null>(null);
  const [isGeneratingProductImage, setIsGeneratingProductImage] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<string | null>(null);
  const [videoSources, setVideoSources] = useState<Record<string, string>>({});

  const handleGenerateProductImage = async () => {
    if (!productFormTitle) {
      addToast("Insira o título do produto primeiro para guiar a IA!", "error");
      return;
    }
    setIsGeneratingProductImage(true);
    addToast("Gerando imagem do produto com IA (Gemini 2.5)...", "info");
    try {
      const prompt = `Professional commercial advertising studio photography of Brazilian Jiu-Jitsu (BJJ) equipment. Product: ${productFormTitle}. Brand: ${productFormBrand || 'OSS.OS Premium'}. Minimalist sharp concrete backdrop, professional studio softbox lighting, 8k resolution, razor sharp focus, advertising shoot style, BJJ gear aesthetic, clean product design. Strictly NO martial arts action, just the product itself displayed elegantly.`;
      
      const response = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio: "1:1" })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro na geração da imagem.");
      }
      const data = await response.json();

      if (data.url) {
        setProductFormImageUrl(data.url);
        addToast("Imagem gerada com sucesso via IA!", "success");
      } else {
        throw new Error("Resposta da IA não continha a URL.");
      }
    } catch (err: any) {
      console.error(err);
      addToast(err.message || "Não foi possível gerar a imagem. Verifique suas credenciais de IA ou preencha manualmente.", "error");
    } finally {
      setIsGeneratingProductImage(false);
    }
  };

  const handleSyncBlogPosts = async () => {
    // Redireciona para handleScoutNews para manter a lógica unificada
    await handleScoutNews(false);
  };

  const handleGenerateVideo = async (post: BlogPost): Promise<string> => {
    try {
      const prompt = `Professional sports documentary cinematography of Brazilian Jiu-Jitsu (BJJ) action. 
      Scene: Real grappling on a blue and yellow competition mat (tatame). One athlete wearing a black Gi, another in a white Gi. 
      Action: Slow-motion technical grappling transitions or submission setup. 
      NO STRIKING, NO PUNCHING, NO KICKING. Strictly technical BJJ ground game. 
      Topic: ${post.title}.
      Description: ${post.excerpt}.
      Style: Documentary, cinematic, 4k, moody gym interior lighting.`;

      const genRes = await fetch("/api/ai/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const genData = await genRes.json();
      if (!genRes.ok) {
        throw new Error(genData.error || "Falha ao iniciar geração de vídeo");
      }
      const { operationName } = genData;

      // Poll for completion
      let done = false;
      while (!done) {
        await sleep(5000);
        const statusRes = await fetch("/api/ai/video-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operationName })
        });
        const statusData = await statusRes.json();
        done = statusData.done;
        if (statusData.error) throw new Error(`Erro na geração: ${statusData.error.message}`);
      }

      // Download
      const downloadRes = await fetch("/api/ai/video-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operationName })
      });
      if (!downloadRes.ok) throw new Error("Falha ao baixar vídeo gerado");
      
      const { dataUrl } = await downloadRes.json();
      return dataUrl;
    } catch (error) {
      console.error("Error generating video:", error);
      throw error;
    }
  };

  const processVideoGeneration = async (post: BlogPost) => {
    if (isGeneratingVideo) return;
    setIsGeneratingVideo(post.id);
    try {
      const videoUrl = await handleGenerateVideo(post);
      setBlogPosts(prev => prev.map(p => p.id === post.id ? { ...p, videoUrl } : p));
      
      // Save to localStorage (as Data URL)
      const saved = localStorage.getItem('oss_blog_posts_final_technical_v6_reborn');
      if (saved) {
        const parsed = JSON.parse(saved);
        const updated = parsed.map((p: any) => p.id === post.id ? { ...p, videoUrl } : p);
        localStorage.setItem('oss_blog_posts_final_technical_v6_reborn', JSON.stringify(updated));
      }
    } catch (error: any) {
      console.error(error);
      addToast(`Falha ao gerar vídeo: ${error.message || "Erro desconhecido"}`, "error");
    } finally {
      setIsGeneratingVideo(null);
    }
  };

  const handleGenerateAllVideos = async () => {
    const postsWithoutVideo = blogPosts.filter(p => !p.videoUrl);
    if (postsWithoutVideo.length === 0) {
      addToast("Todos os posts já possuem vídeo.", "info");
      return;
    }

    if (!confirm(`Deseja gerar vídeos para ${postsWithoutVideo.length} posts? Isso pode demorar alguns minutos.`)) return;

    for (const post of postsWithoutVideo) {
      await processVideoGeneration(post);
      // Small pause between generations to avoid rate limits
      await sleep(3000);
    }
    addToast("Processamento de vídeos concluído!", "success");
  };

  const handleGenerateBlogImage = async (post: BlogPost) => {
    setIsGeneratingBlogImage(post.id);
    try {
      let prompt = `Professional documentary photography of Brazilian Jiu-Jitsu (BJJ) training session. Focus on high-quality Kimono (Gi) fabric details, tatami mat background, moody atmosphere. Title: ${post.title}. NO boxing gloves, NO karate, strictly BJJ.`;
      
      if (post.id === 'init-3') {
        prompt = "Um atleta de Jiu-Jitsu em pose poderosa, com um kimono detalhado e a faixa preta em destaque, em um tatame com iluminação dramática e foco técnico. Estilo fotografia documental de alta performance, 8k, cinematográfico.";
      }

      const response = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio: "16:9" })
      });

      if (!response.ok) throw new Error("Falha ao gerar imagem com IA.");
      const data = await response.json();

      if (data.url) {
        setInternalBlogImages(prev => ({ ...prev, [post.id]: data.url }));
        setBlogPosts(prev => prev.map(p => p.id === post.id ? { ...p, imageUrl: data.url, imageCredit: 'Arte/Visual IA OSS.OS (Gemini AI)' } : p));
      } else {
        throw new Error("Falha ao gerar imagem com IA.");
      }
    } catch (error) {
      console.error("Error generating blog image:", error);
      // Fallback amigável se a IA falhar
      const fallbackUrl = `https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=1200&auto=format&fit=crop`;
      setInternalBlogImages(prev => ({ ...prev, [post.id]: fallbackUrl }));
    } finally {
      setIsGeneratingBlogImage(null);
    }
  };

  const handleAddToCartExtended = (product: Product, sizeToUse?: string) => {
    playClickSound();
    
    let finalSize = sizeToUse || "";
    if (!finalSize) {
      if (product.size && product.size.length > 0) {
        finalSize = product.size.includes('A2') ? 'A2' : product.size.includes('M') ? 'M' : product.size[0];
        addToast(`Tamanho padrão "${finalSize}" selecionado automaticamente! Altere na Sacola se desejar.`, "info", <ShoppingCart size={13} />);
      } else {
        finalSize = "U";
      }
    }
    
    const cartItemId = `${product.id}-${finalSize}`;
    
    const isFirstTimeAdding = cartItems.length === 0;
    const hasAddedBefore = typeof localStorage !== 'undefined' && localStorage.getItem('oss_has_added_cart_first_time') === 'true';

    setCartItems(prev => {
      const exists = prev.find(item => item.id === cartItemId);
      if (exists) {
        return prev.map(item => item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        return [...prev, { id: cartItemId, product, size: finalSize, quantity: 1 }];
      }
    });

    if (isFirstTimeAdding || !hasAddedBefore) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('oss_has_added_cart_first_time', 'true');
      }
      fireFirstCartItemConfetti();
      addToast(`🎉 Primeiro item na sacola! Parabéns por começar seu treino!`, "success", <Sparkles size={14} className="text-yellow-400" />);
    } else {
      addToast(`"${product.title}" (${finalSize}) adicionado à sacola!`, "success", <ShoppingCart size={14} />);
    }
    
    // Fly-to-cart animation trigger
    const productEl = document.getElementById(`product-image-container-${product.id}`);
    const cartEl = document.getElementById('header-cart-btn');
    
    if (productEl && cartEl) {
      const startRect = productEl.getBoundingClientRect();
      const endRect = cartEl.getBoundingClientRect();
      
      const newFlyItem = {
        id: `${product.id}-${Date.now()}`,
        imageUrl: product.imageUrl,
        startX: startRect.left + startRect.width / 2,
        startY: startRect.top + startRect.height / 2,
        endX: endRect.left + endRect.width / 2,
        endY: endRect.top + endRect.height / 2
      };
      
      setFlyingItems(prev => [...prev, newFlyItem]);
    }

    setIsAddingToCart(true);
    setTimeout(() => setIsAddingToCart(false), 1200);
    
    // Auto-open shopping cart drawer after animation finishes!
    setTimeout(() => {
      setIsCartDrawerOpen(true);
    }, 1100);
  };

  const handleAddToCart = (productId: string) => {
    if (productId === '1') {
      const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-20.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => {});
    }
    const product = productList.find(p => p.id === productId);
    if (product) {
      handleAddToCartExtended(product);
    }
  };

  const handleShareContent = (post: BlogPost, platform?: 'whatsapp' | 'twitter' | 'facebook' | 'native') => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#post-${post.id}`;
    const shareTitle = `OSS.OS | ${post.title}`;
    const shareText = `Confira no OSS.OS: ${post.title}`;

    if ((!platform || platform === 'native') && typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: shareTitle,
        text: post.excerpt,
        url: shareUrl,
      }).catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      });
      return;
    }

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    } else {
      // Default: copy to clipboard
      navigator.clipboard.writeText(`${shareTitle}\n${shareUrl}`);
      setShareFeedback(post.id);
      addToast('Link da notícia copiado!', 'success', <Check size={14} className="text-green-500" />);
      setTimeout(() => setShareFeedback(null), 2000);
    }
  };

  const BlogShareButton = ({ post, variant = "outline" }: { post: BlogPost, variant?: "outline" | "ghost" | "default" }) => {
    const { t } = useTranslation();
    
    // Check if native share is supported but don't force it solely if we want brand targets
    const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={variant} 
            size="sm" 
            className="rounded-none border-zinc-200 dark:border-zinc-800 text-[9px] font-black uppercase tracking-widest px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all flex items-center gap-2 group h-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Share2 size={12} className="group-hover:text-green-600 transition-colors" /> 
            <span className="hidden sm:inline">{t('common.share', { defaultValue: 'Compartilhar' })}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-none border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black font-mono min-w-[180px]">
          {canNativeShare && (
            <>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); handleShareContent(post, 'native'); }} 
                className="text-[10px] uppercase tracking-widest cursor-pointer gap-2 py-2"
              >
                <Share2 size={14} className="text-zinc-500" /> {t('common.native_share', { defaultValue: 'Compartilhar Sistema' })}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-900" />
            </>
          )}
          <DropdownMenuItem 
            onClick={(e) => { e.stopPropagation(); handleShareContent(post, 'whatsapp'); }} 
            className="text-[10px] uppercase tracking-widest cursor-pointer gap-2 py-2 hover:text-[#25D366]"
          >
            <MessageCircle size={14} className="text-[#25D366]" /> WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={(e) => { e.stopPropagation(); handleShareContent(post, 'twitter'); }} 
            className="text-[10px] uppercase tracking-widest cursor-pointer gap-2 py-2 hover:text-[#1DA1F2]"
          >
            <Twitter size={14} className="text-[#1DA1F2]" /> Twitter (X)
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={(e) => { e.stopPropagation(); handleShareContent(post, 'facebook'); }} 
            className="text-[10px] uppercase tracking-widest cursor-pointer gap-2 py-2 hover:text-[#1877F2]"
          >
            <Facebook size={14} className="text-[#1877F2]" /> Facebook
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-900" />
          <DropdownMenuItem 
            onClick={(e) => { e.stopPropagation(); handleShareContent(post); }} 
            className="text-[10px] uppercase tracking-widest cursor-pointer gap-2 py-2"
          >
            {shareFeedback === post.id ? (
              <><Check size={14} className="text-green-500" /> Copiado!</>
            ) : (
              <><LinkIcon size={14} /> Copiar Link</>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  const [isScouting, setIsScouting] = useState(false);
  const [discoveredOffers, setDiscoveredOffers] = useState<Record<string, ProductOffer[]>>({});
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [synthUtterance, setSynthUtterance] = useState<any | null>(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);

  // --- IBJJF Calendar and PWA Push Notification Integration ---
  const [isPushSubscribed, setIsPushSubscribed] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  });

  const requestPushPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      addToast("Notificações não são suportadas neste navegador.", "error");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setIsPushSubscribed(true);
        addToast("Notificações Push autorizadas! Você receberá alertas do portal.", "success");
        
        // Simular a primeira notificação de boas-vindas
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification("Portal OSS.OS", {
              body: "🥋 Conexão com o tatame activa! Notificações de campeonatos e artigos estão habilitadas.",
              icon: "https://images.unsplash.com/photo-1510279931157-4b703e301233?q=80&w=128&auto=format&fit=crop",
              vibrate: [100, 50, 100],
              tag: "oss-bjj-welcome"
            } as any);
          });
        }
      } else {
        setIsPushSubscribed(false);
        addToast("Permissão de Notificação negada pelo usuário.", "info");
      }
    } catch (err) {
      console.error("Error requesting notification permission", err);
    }
  };

  const simulatePushNotification = (type: 'article' | 'product') => {
    if (!isPushSubscribed) {
      addToast("Ative as notificações no cabeçalho ou nas configurações antes de simular.", "info");
      return;
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        if (type === 'article') {
          reg.showNotification("Novo Artigo Técnico! 🥋", {
            body: "Apostando na Guarda Lapela: Saiba como surpreender passadores atléticos.",
            icon: "https://images.unsplash.com/photo-1552072092-2f9b132a7785?q=80&w=128&auto=format&fit=crop",
            vibrate: [200, 100, 200],
            tag: "oss-bjj-article-new",
            data: { url: "/blog" }
          } as any);
          addToast("Disparado sinal simulação de Novo Artigo Técnico!", "success");
        } else {
          reg.showNotification("Alerta de Desconto OSS.OS! 💰", {
            body: "O Kimono Vagabond Ultra Light reduziu para R$ 429,05! Aproveite antes que acabe o estoque.",
            icon: "https://images.unsplash.com/photo-1510279931157-4b703e301233?q=80&w=128&auto=format&fit=crop",
            vibrate: [100, 50, 100],
            tag: "oss-bjj-product-discount",
            data: { url: "/shop" }
          } as any);
          addToast("Disparado sinal simulação de Desconto de Produto!", "success");
        }
      });
    } else {
      addToast("Service Worker indisponível para simular notificações.", "error");
    }
  };

  interface IBJJFChampionship {
    id: string;
    title: string;
    dateStr: string;
    startDate: string; // YYYYMMDDTHHMMSSZ
    endDate: string; // YYYYMMDDTHHMMSSZ
    location: string;
    description: string;
    logo: string;
  }

  const getIBJJFEventFromPost = (post: BlogPost): IBJJFChampionship[] => {
    const events: IBJJFChampionship[] = [
      {
        id: "ibjjf-pan-2026",
        title: "Pan-Americano de Jiu-Jitsu IBJJF 2026",
        dateStr: "11 a 15 de Março de 2026",
        startDate: "20260311T090000Z",
        endDate: "20260315T180000Z",
        location: "Kissimmee, Florida, EUA",
        description: "O Pan 2026 reúne a elite do Jiu-Jitsu mundial nas chaves com e sem pano. Não perca as lutas decisivas da faixa preta.",
        logo: "🇺🇸"
      },
      {
        id: "ibjjf-brasileiro-2026",
        title: "Campeonato Brasileiro de Jiu-Jitsu IBJJF 2026",
        dateStr: "25 de Abril a 03 de Maio de 2026",
        startDate: "20260425T090000Z",
        endDate: "20260503T180000Z",
        location: "Ginásio José Corrêa, Barueri, SP, Brasil",
        description: "O maior campeonato do hemisfério sul. O Brasileiro da IBJJF é conhecido pelo clima fervoroso de barulho e o maior número de atletas inscritos no mundo.",
        logo: "🇧🇷"
      },
      {
        id: "ibjjf-worlds-2026",
        title: "Campeonato Mundial de Jiu-Jitsu IBJJF 2026",
        dateStr: "04 a 07 de Junho de 2026",
        startDate: "20260604T090000Z",
        endDate: "20260607T180500Z",
        location: "Walter Pyramid, Long Beach, Califórnia, EUA",
        description: "O evento principal do Jiu-Jitsu esportivo mundial. A elite absoluta compete pelo ouro duplo lendário na famosa Pirâmide de Long Beach.",
        logo: "🏆"
      },
      {
        id: "ibjjf-european-2026",
        title: "Campeonato Europeu de Jiu-Jitsu IBJJF 2026",
        dateStr: "21 a 26 de Janeiro de 2026",
        startDate: "20260121T090000Z",
        endDate: "20260126T180000Z",
        location: "Lisboa, Portugal",
        description: "Inaugura a temporada dos grandes torneios de Grand Slam da IBJJF na Europa, atraindo competidores de todo o mundo de volta aos tapetes frios em janeiro.",
        logo: "🇪🇺"
      }
    ];

    const txt = (post.title + " " + post.content).toLowerCase();
    const matches: IBJJFChampionship[] = [];

    if (txt.includes("pan") || txt.includes("america")) {
      matches.push(events[0]);
    }
    if (txt.includes("brasileiro") || txt.includes("barueri")) {
      matches.push(events[1]);
    }
    if (txt.includes("mundial") || txt.includes("worlds") || txt.includes("pirâmide")) {
      matches.push(events[2]);
    }
    if (txt.includes("europeu") || txt.includes("european") || txt.includes("lisboa")) {
      matches.push(events[3]);
    }

    if (matches.length === 0 && (post.category === 'Results' || post.category === 'News')) {
      // Return default Mundial if none detected specifically
      matches.push(events[2]);
    }

    return matches;
  };

  const [newRssName, setNewRssName] = useState("");
  const [newRssUrl, setNewRssUrl] = useState("");
  const [rssTestFeedId, setRssTestFeedId] = useState<string | null>(null);
  const [rssTestLoading, setRssTestLoading] = useState(false);
  const [rssTestResults, setRssTestResults] = useState<any[] | null>(null);

  // Helper to format ISO or other dates to Brazilian format (DD/MM/YYYY)
  const formatBrazilianDate = (dateStr: string): string => {
    if (!dateStr) return '';
    // If it's already in DD/MM/YYYY, return it
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      return dateStr;
    }
    // If it's in YYYY-MM-DD, convert to DD/MM/YYYY
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        if (year.length === 4 && month.length === 2 && day.length === 2) {
          return `${day}/${month}/${year}`;
        }
      }
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch (e) {}
    return dateStr;
  };

  useEffect(() => {
    if (isGalleryOpen && selectedGalleryProduct && !selectedGalleryProduct.offers && !discoveredOffers[selectedGalleryProduct.id]) {
      setIsScouting(true);
      const timer = setTimeout(() => {
        const basePrice = selectedGalleryProduct.price;
        const stores = [
          { name: 'Mercado Livre', discount: 1, shipping: 0 },
          { name: 'Amazon', discount: 0.95, shipping: 12 },
          { name: 'Shopee', discount: 0.92, shipping: 0 },
          { name: 'Shein', discount: 0.88, shipping: 25 },
          { name: 'Netshoes', discount: 1.05, shipping: 0 }
        ];
        
        const generated = stores.map(store => ({
          storeName: store.name,
          price: basePrice * store.discount,
          url: '#',
          isAvailable: true,
          shippingPrice: store.shipping
        })).sort((a, b) => a.price - b.price);

        setDiscoveredOffers(prev => ({ ...prev, [selectedGalleryProduct.id]: generated }));
        setIsScouting(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isGalleryOpen, selectedGalleryProduct]);

  const [isManualPostModalOpen, setIsManualPostModalOpen] = useState(false);
  const [newPost, setNewPost] = useState<Partial<BlogPost>>({
    category: 'News',
    title: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    sponsoredUrl: '',
    imageCredit: 'Foto: Divulgação',
    imageSourceUrl: '',
    price: undefined
  });

  const handleCreateManualPost = () => {
    if (!newPost.title || !newPost.content || !newPost.imageUrl) {
      addToast("Por favor, preencha o título, conteúdo e gere uma imagem.", "error");
      return;
    }
      const post: BlogPost = {
        id: Math.random().toString(36).substr(2, 9),
        title: newPost.title!,
        excerpt: newPost.excerpt || newPost.content!.substring(0, 100) + '...',
        content: newPost.content!,
        imageUrl: newPost.imageUrl!,
        sponsoredUrl: newPost.sponsoredUrl,
        imageCredit: newPost.imageCredit || 'Foto: Divulgação',
        imageSourceUrl: newPost.imageSourceUrl,
        category: newPost.category as any,
        price: newPost.price,
        author: 'Mestre OSS.OS',
        date: new Date().toISOString().split('T')[0],
        hasAudio: false
      };
    setBlogPosts(prev => [post, ...prev]);
    setIsManualPostModalOpen(false);
    setNewPost({
      category: 'News',
      title: '',
      excerpt: '',
      content: '',
      imageUrl: '',
      sponsoredUrl: '',
      imageCredit: 'Foto: Divulgação',
      imageSourceUrl: '',
      price: undefined
    });
    addToast("Post criado com sucesso!", "success");
  };

  const podcasters = [
    { name: 'Marco "The Tank" Silva', role: 'Comentarista & Faixa Preta', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop', bio: 'Veterano dos tatames com 20 anos de experiência.' },
    { name: 'Beatriz "Bia" Aranha', role: 'Analista de Performance', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop', bio: 'Especialista em tática e competições modernas.' }
  ];

  const [lastScoutDate, setLastScoutDate] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('oss_last_scout_date') || '';
    }
    return '';
  });

  useEffect(() => {
    // Only save minimal data to localStorage to avoid Limits (stripping audioUrl which can be huge)
    const minimalPosts = blogPosts.map(({ audioUrl, ...rest }) => rest);
    try {
      localStorage.setItem('oss_blog_posts_final_technical_v6_reborn', JSON.stringify(minimalPosts));
    } catch (e) {
      console.error("Storage error:", e);
    }
  }, [blogPosts]);

  // Handle saving newly generated audio to IDB
  useEffect(() => {
    blogPosts.forEach(post => {
      if (post.audioUrl && post.audioUrl.startsWith('data:')) {
        saveAudioToDB(post.id, post.audioUrl);
      }
    });
  }, [blogPosts]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('oss_last_scout_date', lastScoutDate);
    }
  }, [lastScoutDate]);

  // Automatic daily scout when calendar date shifts to keep news and podcasters synchronized
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const today = new Date();
      const todayString = today.toDateString();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.

      if (lastScoutDate !== todayString && !isScouting) {
        const isNewsDay = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 6; // Segunda, Quarta, Sábado
        const isPodcastDay = dayOfWeek === 2; // Terça-feira

        if (isNewsDay || isPodcastDay) {
          console.log(`[STARTUP] Running automatic content scout for day ${dayOfWeek}...`);
          handleScoutNews(true);
        } else {
          // On non-update days (Sunday, Thursday, Friday), do not run scout. Just mark as checked for today.
          setLastScoutDate(todayString);
        }
      }
    }
  }, [lastScoutDate, isScouting]);

  // Migrate old authors and sync hasAudio flag
  useEffect(() => {
    let changed = false;
    const migrated = blogPosts.map(p => {
      let updated = { ...p };
      if (p.author === 'OSS.OS Scout' || p.author === 'OSS.OS AI Scout') {
        updated.author = 'Redação OSS.OS';
        changed = true;
      }
      if (p.category === 'Podcast' && p.hasAudio === undefined) {
        updated.hasAudio = true;
        changed = true;
      }
      return updated;
    });
    if (changed) setBlogPosts(migrated);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('oss_last_scout_date', lastScoutDate);
    }
  }, [lastScoutDate]);

  useEffect(() => {
    localStorage.setItem('oss_affiliate_ids', JSON.stringify(affiliateIds));
  }, [affiliateIds]);

  const handleAcceptTerms = () => {
    setHasAcceptedTerms(true);
    localStorage.setItem('oss_terms_accepted', 'true');
  };

  const openCheckoutModal = (product: Product, quantity: number = 1) => {
    setSelectedCheckoutProduct(product);
    setCheckoutQuantity(quantity || 1);
    setCheckoutSelectedSize('');
    setCheckoutSizingWarning(null);
    setIsCheckoutModalOpen(true);
    setAcceptedCheckoutTerms(true);
    setIsCelebrating(false);
    
    // Track click
    trackClick(product.id, product.title, product.platform);

    // Track view
    setViewedProductIds(prev => {
      const next = [product.id, ...prev.filter(id => id !== product.id)].slice(0, 10);
      return next;
    });
  };

  const handleFinishPurchase = () => {
    if (selectedCheckoutProduct && acceptedCheckoutTerms) {
      // Track purchase intent
      setPurchasedProductIds(prev => {
        const next = [selectedCheckoutProduct.id, ...prev.filter(id => id !== selectedCheckoutProduct.id)].slice(0, 5);
        return next;
      });
      
      // Track conversion
      trackConversion(selectedCheckoutProduct.id, selectedCheckoutProduct.title, selectedCheckoutProduct.platform);

      window.open(selectedCheckoutProduct.affiliateUrl, '_blank');
      
      // Trigger social impact celebration with center particles
      setIsCelebrating(true);
      firePurchaseCelebrationConfetti();
    }
  };

  const openGallery = (product: Product, index: number = 0) => {
    setSelectedGalleryProduct(product);
    setSelectedGallerySize("");
    setIsCalcOpen(false);
    setCurrentGalleryIndex(index);
    setIsGalleryOpen(true);
    
    // Track view
    setViewedProductIds(prev => {
      const next = [product.id, ...prev.filter(id => id !== product.id)].slice(0, 10);
      return next;
    });
  };

  const nextGalleryImage = () => {
    if (!selectedGalleryProduct) return;
    const fallbacks = [
      bjjHeroBanner,
      bjjKimonoDetail,
      bjjActionGrappling
    ];
    const images = [selectedGalleryProduct.imageUrl, ...(selectedGalleryProduct.galleryImages || [])];
    if (images.length === 1) {
      images.push('https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=200&auto=format&fit=crop');
      images.push('https://images.unsplash.com/photo-1628178142858-305f8841496a?q=80&w=200&auto=format&fit=crop');
    }
    setCurrentGalleryIndex((prev) => (prev + 1) % images.length);
  };

  const prevGalleryImage = () => {
    if (!selectedGalleryProduct) return;
    const images = [selectedGalleryProduct.imageUrl, ...(selectedGalleryProduct.galleryImages || [])];
    if (images.length === 1) {
      images.push('https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=200&auto=format&fit=crop');
      images.push('https://images.unsplash.com/photo-1628178142858-305f8841496a?q=80&w=200&auto=format&fit=crop');
    }
    setCurrentGalleryIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterStatus('error');
      addToast('E-mail inválido. Verifique e tente novamente.', 'error', <X size={14} className="text-red-500" />);
      setTimeout(() => setNewsletterStatus('idle'), 3000);
      return;
    }
    setNewsletterStatus('loading');
    
    try {
      await addDoc(collection(db, 'subscribers'), {
        email: newsletterEmail,
        subscribedAt: Timestamp.now(),
        source: 'footer_landing'
      });
      setNewsletterStatus('success');
      setNewsletterEmail('');
      addToast('Bem-vindo à família! Inscrição realizada.', 'success', <Zap size={14} className="text-yellow-500" />);
      setTimeout(() => setNewsletterStatus('idle'), 5000);
    } catch (error) {
      console.error("Newsletter error:", error);
      setNewsletterStatus('error');
      addToast('Erro ao inscrever. Tente novamente.', 'error');
      setTimeout(() => setNewsletterStatus('idle'), 3000);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        handleNavigate('SETTINGS');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check on mount
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Deep-linking / Routing support for individual product pages (?product=ID or /product/ID)
  useEffect(() => {
    if (!productList || productList.length === 0) return;

    // Only run this once on mount/initial load to avoid modal popups during app state changes
    const alreadyProcessed = (window as any).__product_route_processed;
    if (alreadyProcessed) return;

    const pathMatch = window.location.pathname.match(/\/product\/([a-zA-Z0-9_\-]+)/);
    let pathProductId = pathMatch ? pathMatch[1] : null;

    if (!pathProductId) {
      const urlParams = new URLSearchParams(window.location.search);
      pathProductId = urlParams.get('product') || urlParams.get('productId');
    }

    if (pathProductId) {
      (window as any).__product_route_processed = true;
      const found = productList.find(p => p.id === pathProductId);
      if (found) {
        openCheckoutModal(found);
      } else if (pathProductId.startsWith('ml-')) {
        // Dynamic product from Mercado Livre that is not listed in our initial product catalog yet.
        // We fetch it from the server-side API dynamically.
        const mlCode = pathProductId.replace(/ml-/i, '').replace('-', '').toUpperCase();
        console.log(`[SEO] Fetching dynamic Mercado Livre item details for path productId: ${pathProductId}`);
        fetch(`/api/import/mercadolivre?url=https://produto.mercadolivre.com.br/MLB-${mlCode}`)
          .then(res => res.json())
          .then(newProd => {
            if (newProd && !newProd.error) {
              setProductList(prev => {
                const alreadyExists = prev.some(p => p.id === newProd.id);
                return alreadyExists ? prev : [newProd, ...prev];
              });
              // Trigger modal opening
              openCheckoutModal(newProd);
            }
          })
          .catch(err => console.error("Error fetching dynamic shared product on mount", err));
      }
    }
  }, [productList]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceRange, selectedBrands, selectedSizes, selectedColors, selectedGenders, selectedBelts, selectedPlatforms]);

  const getProductColors = (product: Product): string[] => {
    if (product.colors && product.colors.length > 0) return product.colors;
    
    const colors: string[] = [];
    const text = `${product.title} ${product.description}`.toLowerCase();
    
    if (text.includes('branc') || text.includes('white')) colors.push('Branco');
    if (text.includes('pret') || text.includes('black') || text.includes('onyx') || text.includes('kuro') || text.includes('stealth')) colors.push('Preto');
    if (text.includes('azul') || text.includes('blue') || text.includes('ryu')) colors.push('Azul');
    if (text.includes('rox') || text.includes('purple')) colors.push('Roxo');
    if (text.includes('marrom') || text.includes('brown')) colors.push('Marrom');
    if (text.includes('cinza') || text.includes('grey') || text.includes('gray') || text.includes('charcoal')) colors.push('Cinza');
    if (text.includes('vermelh') || text.includes('red') || text.includes('carmesim')) colors.push('Vermelho');
    if (text.includes('verd') || text.includes('green')) colors.push('Verde');
    if (text.includes('rosa') || text.includes('pink')) colors.push('Rosa');
    if (text.includes('gold') || text.includes('dourad')) colors.push('Dourado');
    
    if (colors.length === 0) {
      if (product.category === 'Faixas') {
        if (product.beltColor) colors.push(product.beltColor);
        else colors.push('Preto');
      } else {
        colors.push('Preto');
      }
    }
    
    return colors;
  };

  const detectedBeltFromSearch = useMemo(() => {
    if (!searchQuery) return null;
    const lower = searchQuery.toLowerCase();
    if (lower.includes('branc') || lower.includes('white') || lower.includes('iniciante') || lower.includes('beginner')) return 'Branca';
    if (lower.includes('azul') || lower.includes('blue')) return 'Azul';
    if (lower.includes('rox') || lower.includes('purpl')) return 'Roxa';
    if (lower.includes('marrom') || lower.includes('brown')) return 'Marrom';
    if (lower.includes('pret') || lower.includes('black') || lower.includes('master')) return 'Preta';
    return null;
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    let result = productList.filter(product => {
      const lowerQuery = searchQuery.toLowerCase().trim();
      let matchesSearch = true;

      if (lowerQuery) {
        const words = lowerQuery.split(/\s+/).filter(w => w.length > 0);
        const matchesFullString = product.title.toLowerCase().includes(lowerQuery) ||
                                  product.description.toLowerCase().includes(lowerQuery) ||
                                  product.category.toLowerCase().includes(lowerQuery) ||
                                  (product.brand && product.brand.toLowerCase().includes(lowerQuery)) ||
                                  (product.subCategory && product.subCategory.toLowerCase().includes(lowerQuery));

        if (matchesFullString) {
          matchesSearch = true;
        } else {
          const beltKeywords: Record<string, string[]> = {
            'Branca': ['branca', 'branco', 'white', 'iniciante', 'beginner'],
            'Azul': ['azul', 'blue'],
            'Roxa': ['roxa', 'roxo', 'purple'],
            'Marrom': ['marrom', 'brown'],
            'Preta': ['preta', 'preto', 'black', 'master']
          };

          let queryBelts: string[] = [];
          for (const [beltColor, keywords] of Object.entries(beltKeywords)) {
            if (keywords.some(k => words.includes(k) || lowerQuery.includes(k))) {
              queryBelts.push(beltColor);
            }
          }

          if (queryBelts.length > 0) {
            const productBelts = product.belts || (product.beltColor ? [product.beltColor] : []);
            const matchesAnyQueryBelt = productBelts.some(b => queryBelts.includes(b));

            if (matchesAnyQueryBelt) {
              const nonBeltWords = words.filter(w => {
                return !Object.values(beltKeywords).some(keywords => keywords.includes(w));
              });

              if (nonBeltWords.length === 0) {
                matchesSearch = true;
              } else {
                matchesSearch = nonBeltWords.every(word => {
                  return product.title.toLowerCase().includes(word) ||
                         product.category.toLowerCase().includes(word) ||
                         product.description.toLowerCase().includes(word) ||
                         (product.brand && product.brand.toLowerCase().includes(word)) ||
                         (product.subCategory && product.subCategory.toLowerCase().includes(word));
                });
              }
            } else {
              if (product.belts || product.beltColor) {
                matchesSearch = false;
              } else {
                const nonBeltWords = words.filter(w => {
                  return !Object.values(beltKeywords).some(keywords => keywords.includes(w));
                });
                
                if (nonBeltWords.length > 0) {
                  matchesSearch = nonBeltWords.every(word => {
                    return product.title.toLowerCase().includes(word) ||
                           product.category.toLowerCase().includes(word) ||
                           product.description.toLowerCase().includes(word) ||
                           (product.brand && product.brand.toLowerCase().includes(word)) ||
                           (product.subCategory && product.subCategory.toLowerCase().includes(word));
                  });
                } else {
                  matchesSearch = false;
                }
              }
            }
          } else {
            matchesSearch = words.every(word => {
              return product.title.toLowerCase().includes(word) ||
                     product.description.toLowerCase().includes(word) ||
                     product.category.toLowerCase().includes(word) ||
                     (product.brand && product.brand.toLowerCase().includes(word)) ||
                     (product.subCategory && product.subCategory.toLowerCase().includes(word)) ||
                     (product.tags && product.tags.some(tag => tag.toLowerCase().includes(word)));
            });
          }
        }
      }

      const matchesCategory = matchesCategoryFilter(product, selectedCategory);

            const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesBrand = selectedBrands.length === 0 || (product.brand && selectedBrands.includes(product.brand));
      const matchesSize = selectedSizes.length === 0 || (product.size && product.size.some(s => selectedSizes.includes(s)));
      const matchesColor = selectedColors.length === 0 || (product.color && selectedColors.includes(product.color)) || (product.colors && product.colors.some(c => selectedColors.includes(c)));
      const matchesGender = selectedGenders.length === 0 || (product.gender && selectedGenders.includes(product.gender));
      const effectiveBelts = selectedBelts;

      const matchesBelt = effectiveBelts.length === 0 || 
                          (product.belts && product.belts.some(b => effectiveBelts.includes(b))) ||
                          (product.beltColor && effectiveBelts.includes(product.beltColor)) ||
                          (!product.belts && !product.beltColor);

      const matchesSubCategory = selectedSubCategories.length === 0 || 
                                 (product.subCategory && selectedSubCategories.includes(product.subCategory)) ||
                                 (product.subCategoryDetailed && selectedSubCategories.includes(product.subCategoryDetailed)) ||
                                 (product.subCategoryGroup && selectedSubCategories.includes(product.subCategoryGroup)) ||
                                 ((selectedCategory === 'Vestuário' || selectedCategory === 'Kimonos' || selectedCategory === 'Rashguards') && selectedSubCategories.includes(product.category));
      const matchesRating = selectedRating === 0 || (product.rating && product.rating >= selectedRating);
      const matchesPopularity = (() => {
        if (!selectedPopularity || selectedPopularity === 'all') return true;
        const pop = product.popularity ?? (product.salesCount ? product.salesCount * 0.8 : ((product.rating || 4) * 18));
        if (selectedPopularity === 'popular') {
          return pop >= 70 || (product.salesCount && product.salesCount >= 100);
        }
        if (selectedPopularity === 'best_sellers') {
          return (product.salesCount && product.salesCount >= 120) || (product.popularity && product.popularity >= 85) || product.isBestPrice;
        }
        if (selectedPopularity === 'trending') {
          return (product.trendScore && product.trendScore >= 80) || (product.popularity && product.popularity >= 80) || (product.tags && product.tags.some(t => t.toLowerCase().includes('destaque') || t.toLowerCase().includes('ibjjf')));
        }
        if (selectedPopularity === 'champions') {
          return product.practitionerLevel === 'Avançado' || (product.tags && product.tags.some(t => t.toLowerCase().includes('pro') || t.toLowerCase().includes('campeão') || t.toLowerCase().includes('ibjjf')));
        }
        return true;
      })();
      const matchesPlatform = selectedPlatforms.length === 0 || selectedPlatforms.includes(product.platform);

      // Resolve productType and practitionerLevel
      const getProductType = (p: typeof product) => {
        if (p.productType) return p.productType;
        const cat = p.category;
        if (['Kimonos', 'Rashguards', 'Bermudas', 'Faixas', 'Vestuário'].includes(cat)) return 'Uniforme';
        if (['Protetores', 'Equipamentos de Proteção', 'Tatames', 'Equipamentos'].includes(cat)) return 'Equipamento';
        if (['Acessórios'].includes(cat)) return 'Acessório';
        if (['Serviços', 'Cursos Online', 'E-books', 'Conteúdo Digital'].includes(cat)) return 'Serviço';
        if (['Suplementos', 'Nutrição'].includes(cat)) return 'Suplemento';
        return 'Outros';
      };

      const pType = getProductType(product);
      const matchesProductType = selectedProductTypes.length === 0 || selectedProductTypes.includes(pType);

      const pLevel = getProductPractitionerLevel(product);
      const matchesPractitionerLevel = selectedPractitionerLevels.length === 0 || selectedPractitionerLevels.includes(pLevel) || pLevel === 'Todos';

      let matchesUserTechnicalLevel = true;
      if (filterByTechnicalLevel) {
        if (pLevel !== 'Todos') {
          if (userBelt === 'Branca') {
            matchesUserTechnicalLevel = pLevel === 'Iniciante';
          } else if (userBelt === 'Azul' || userBelt === 'Roxa') {
            matchesUserTechnicalLevel = pLevel === 'Intermediário';
          } else if (userBelt === 'Marrom' || userBelt === 'Preta') {
            matchesUserTechnicalLevel = pLevel === 'Avançado';
          }
        }
      }

      return matchesSearch && matchesCategory && matchesPrice && matchesBrand && matchesSize && matchesColor && matchesGender && matchesBelt && matchesSubCategory && matchesRating && matchesPopularity && matchesPlatform && matchesProductType && matchesPractitionerLevel && matchesUserTechnicalLevel;
    });

    // AI Refinement Ranking Logic
    if (isAiRefinementActive) {
      const keywordMap: Record<string, string[]> = {
        'Guardeiro': ['guarda', 'flexibilidade', 'mobilidade', 'leve', 'raspagem', 'triângulo', 'bolinha'],
        'Passador': ['passagem', 'pressão', 'resistente', 'blindado', 'pesado', 'base', 'estabilidade'],
        'Wrestler': ['explosão', 'queda', 'wrestling', 'movimento', 'agilidade', 'nogi', 'berimbolo'],
        'Finalizador': ['finalização', 'ataque', 'precisão', 'ajuste', 'estrangulamento', 'chave', 'pescoço'],
        'Leve': ['leve', 'summer', 'rip-stop', 'respirável', 'secagem'],
        'Blindado': ['reforçado', 'pesado', 'gramatura', 'tripla', 'resistent'],
        'Elástico': ['elastano', 'compressão', 'flexível', 'spandex'],
        'Respirável': ['ventilação', 'fresco', 'tecnologia', 'suor']
      };

      const scoredResults = result.map(product => {
        let score = 0;
        const fullContent = (product.title + ' ' + product.description).toLowerCase();

        // Style matching
        selectedAiStyles.forEach(style => {
          keywordMap[style]?.forEach(kw => {
            if (fullContent.includes(kw)) score += 10;
          });
        });

        // Material matching
        selectedAiMaterials.forEach(material => {
          keywordMap[material]?.forEach(kw => {
            if (fullContent.includes(kw)) score += 10;
          });
        });

        // NL Query matching
        if (aiRefinementQuery.length > 2) {
          const words = aiRefinementQuery.toLowerCase().split(' ');
          words.forEach(word => {
            if (fullContent.includes(word)) score += 5;
          });
        }

        return { ...product, aiScore: score };
      });

      // Sort by AI score if weight is high
      if (aiRelevanceWeight > 20) {
        scoredResults.sort((a, b) => b.aiScore - a.aiScore);
      }
      
      result = scoredResults;
    }

    // Apply sorting
    switch (sortBy) {
      case 'popularity':
      case 'popularity-desc':
        result.sort((a, b) => {
          const popA = (a.popularity || 0) * 2 + (a.salesCount || 0) + (a.rating || 4) * 10;
          const popB = (b.popularity || 0) * 2 + (b.salesCount || 0) + (b.rating || 4) * 10;
          return popB - popA;
        });
        break;
      case 'discount-desc':
        result.sort((a, b) => {
          const discA = a.originalPrice && a.originalPrice > a.price ? (a.originalPrice - a.price) / a.originalPrice : 0;
          const discB = b.originalPrice && b.originalPrice > b.price ? (b.originalPrice - b.price) / b.originalPrice : 0;
          return discB - discA;
        });
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'relevance':
      default:
        // Core performance algorithm to maximize affiliate earnings:
        // - Conversions are strongly prioritized (coef: 35)
        // - Conversion Rate (CR) is aggressively promoted to highlight products that turn traffic into sales (coef: 150)
        // - Raw clicks are kept as a minor tiebreaker (coef: 0.5) to avoid over-promoting low-sample-size high-CR items.
        result.sort((a, b) => {
          const statsA = productClicks[a.id] || { clicks: 0, conversions: 0 };
          const statsB = productClicks[b.id] || { clicks: 0, conversions: 0 };
          
          const crA = statsA.clicks > 0 ? (statsA.conversions / statsA.clicks) : 0;
          const crB = statsB.clicks > 0 ? (statsB.conversions / statsB.clicks) : 0;
          
          const scoreA = (statsA.conversions * 35) + (crA * 150) + (statsA.clicks * 0.5);
          const scoreB = (statsB.conversions * 35) + (crB * 150) + (statsB.clicks * 0.5);
          
          if (scoreB !== scoreA) {
            return scoreB - scoreA;
          }
          return a.title.localeCompare(b.title);
        });
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, priceRange, selectedBrands, selectedProductTypes, selectedPractitionerLevels, selectedSizes, selectedColors, selectedGenders, selectedBelts, selectedSubCategories, selectedRating, selectedPopularity, productList, sortBy, isAiRefinementActive, selectedAiStyles, selectedAiMaterials, aiRefinementQuery, aiRelevanceWeight, productClicks, filterByTechnicalLevel, userBelt]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'All') count++;
    if (priceRange[0] > 0 || priceRange[1] < maxProductPrice) count++;
    count += selectedBrands.length;
    count += selectedProductTypes.length;
    count += selectedPractitionerLevels.length;
    count += selectedSizes.length;
    count += selectedColors.length;
    count += selectedGenders.length;
    count += selectedBelts.length;
    count += selectedPlatforms.length;
    if (filterByTechnicalLevel) count++;
    if (selectedRating !== 0) count++;
    if (selectedPopularity && selectedPopularity !== 'all') count++;
    return count;
  }, [selectedCategory, priceRange, maxProductPrice, selectedBrands, selectedProductTypes, selectedPractitionerLevels, selectedSizes, selectedColors, selectedGenders, selectedBelts, selectedRating, selectedPlatforms, filterByTechnicalLevel]);

  const clearFilters = () => {
    setSelectedCategory('All');
    setPriceRange([0, maxProductPrice]);
    setSelectedBrands([]);
    setSelectedProductTypes([]);
    setSelectedPractitionerLevels([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedGenders([]);
    setSelectedBelts([]);
    setSelectedPlatforms([]);
    setSelectedRating(0);
    setSearchQuery('');
    setSelectedAiStyles([]);
    setSelectedAiMaterials([]);
    setAiRefinementQuery('');
    setFilterByTechnicalLevel(false);
  };

  // Prefetching blog images for the next page
  useEffect(() => {
    if (view === 'BLOG') {
      const nextSliceStart = 5 + blogPage * 9; // initialCount + blogPage * POSTS_PER_PAGE
      const nextPosts = filteredBlogPosts.slice(nextSliceStart, nextSliceStart + 9);
      if (nextPosts.length > 0) {
        nextPosts.forEach(post => {
          const img = new Image();
          img.src = post.imageUrl;
        });
      }
    }
  }, [blogPage, filteredBlogPosts, view]);

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleFilter = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const brands = useMemo(() => {
    const b = new Set<string>();
    // Ensure these brands are always considered if they exist in ANY product
    const popularBrands = ['Venum', 'Atama', 'Koral', 'KVRA'];
    popularBrands.forEach(brand => {
      if (productList.some(p => p.brand === brand)) b.add(brand);
    });
    
    productList.forEach(p => { if (p.brand) b.add(p.brand); });
    return Array.from(b).sort();
  }, [productList]);

  const sizesArr = useMemo(() => {
    const s = new Set<string>();
    const list = selectedCategory === 'All' 
      ? productList 
      : productList.filter(p => p.category === selectedCategory);
    list.forEach(p => { if (p.size) p.size.forEach(sz => s.add(sz)); });
    return Array.from(s).sort();
  }, [productList, selectedCategory]);

  const gendersArr: Gender[] = ['Masculino', 'Feminino', 'Unissex', 'Infantil'];

  const beltColorsArr = useMemo(() => {
    const b = new Set<string>();
    const list = selectedCategory === 'All' 
      ? productList 
      : productList.filter(p => p.category === selectedCategory);
    list.forEach(p => { if (p.beltColor) b.add(p.beltColor); });
    return Array.from(b).sort();
  }, [productList, selectedCategory]);

  const platformsArr = useMemo(() => {
    const p = new Set<string>();
    productList.forEach(prod => p.add(prod.platform));
    return Array.from(p).sort();
  }, [productList]);

  const subCategoriesArr = useMemo(() => {
    const s = new Set<string>();
    const list = selectedCategory === 'All'
      ? productList
      : productList.filter(p => {
          if (p.category === selectedCategory) return true;
          if (selectedCategory === 'Equipamentos para Iniciantes' && (p.category === 'Equipamentos para Iniciantes' || p.practitionerLevel === 'Iniciante' || p.category === 'Faixas')) return true;
          if (selectedCategory === 'Roupas de Competição' && (p.category === 'Roupas de Competição' || p.practitionerLevel === 'Avançado' || p.category === 'Kimonos' || p.category === 'Rashguards')) return true;
          if (selectedCategory === 'Acessórios de Treino' && (p.category === 'Acessórios de Treino' || p.category === 'Acessórios' || p.category === 'Equipamentos de Proteção' || p.category === 'Protetores' || p.category === 'Tatames')) return true;
          if (selectedCategory === 'Nutrição Esportiva' && (p.category === 'Nutrição Esportiva' || p.category === 'Suplementos' || p.category === 'Nutrição')) return true;
          if (selectedCategory === 'Livros/DVDs de Técnicas' && (p.category === 'Livros/DVDs de Técnicas' || p.category === 'Cursos Online' || p.category === 'E-books' || p.category === 'Serviços' || p.category === 'Conteúdo Digital')) return true;
          if (selectedCategory === 'Vestuário' && ['Kimonos', 'Rashguards', 'Rash Guards', 'Shorts', 'Casual', 'Faixas', 'Nogi', 'Vestuário'].includes(p.category)) return true;
          if (selectedCategory === 'Equipamentos de Proteção' && ['Protections', 'Equipamentos', 'Equipamentos de Proteção'].includes(p.category)) return true;
          if (selectedCategory === 'Suplementos' && ['Supplements', 'Suplementos', 'Recovery'].includes(p.category)) return true;
          if (selectedCategory === 'Acessórios' && ['Accessories', 'Mochilas', 'Lifestyle', 'Acessórios'].includes(p.category)) return true;
          return false;
        });
    list.forEach(p => { if (p.subCategory) s.add(p.subCategory); });
    
    if (selectedCategory === 'Equipamentos para Iniciantes') {
      s.add('Kits & Starter Packs');
      s.add('Kimonos de Entrada');
      s.add('Faixas Brancas');
    }
    if (selectedCategory === 'Roupas de Competição') {
      s.add('Kimonos de Competição');
      s.add('Rashguards Oficiais');
      s.add('Fight Shorts Pro');
    }
    if (selectedCategory === 'Acessórios de Treino') {
      s.add('Proteção & Recuperação');
      s.add('Protetores Bucais');
      s.add('Orelheiras & Joelheiras');
    }
    if (selectedCategory === 'Nutrição Esportiva') {
      s.add('Suplementação de Combate');
      s.add('Creatina & Força');
      s.add('Recuperação & Eletrólitos');
    }
    if (selectedCategory === 'Livros/DVDs de Técnicas') {
      s.add('Instrucionais & DVDs');
      s.add('E-books de Técnicas');
      s.add('Cursos Online');
    }
    if (selectedCategory === 'Vestuário') {
      s.add('Kimonos');
      s.add('Rashguards');
      s.add('Shorts');
      s.add('Faixas');
      s.add('Casual');
    }
    return Array.from(s).sort();
  }, [productList, selectedCategory]);

  const FilterContent = () => (
    <div className="space-y-6 text-zinc-900 dark:text-zinc-50">
      {/* Active Filters Summary at the Top */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-2">
          <Filter size={13} className="text-zinc-400" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 font-bold">Filtros Avançados</h3>
        </div>
        {activeFiltersCount > 0 && (
          <button 
            onClick={clearFilters}
            className="text-[8px] font-black uppercase tracking-widest text-red-500 hover:opacity-75 transition-opacity"
          >
            Limpar Todos ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* AI Refinement - Portal Técnico */}
      <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 border-l-2 border-green-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-green-600/5 blur-3xl rounded-full"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-green-600" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.1em] text-black dark:text-white">{t('ai_refinement.title')}</h4>
          </div>
          <Switch 
            checked={isAiRefinementActive}
            onCheckedChange={setIsAiRefinementActive}
            className="data-[state=checked]:bg-green-600"
          />
        </div>

        {isAiRefinementActive && (
          <div className="space-y-4 pt-4 overflow-hidden">
            <div>
              <p className="text-[8px] font-mono font-bold uppercase text-zinc-400 mb-2 tracking-widest">{t('ai_refinement.input_label')}</p>
              <div className="relative">
                <Input 
                  value={aiRefinementQuery}
                  onChange={(e) => setAiRefinementQuery(e.target.value)}
                  placeholder={t('ai_refinement.input_placeholder')}
                  className="h-8 text-[9px] font-mono bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none focus-visible:ring-1 focus-visible:ring-green-600 pl-8"
                />
                <Target size={10} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>

            <div>
              <p className="text-[8px] font-mono font-bold uppercase text-zinc-400 mb-2 tracking-widest">{t('ai_refinement.style_label')}</p>
              <div className="grid grid-cols-2 gap-1 px-0.5">
                {['Guardeiro', 'Passador', 'Wrestler', 'Finalizador'].map(style => {
                  const isSelected = selectedAiStyles.includes(style);
                  return (
                    <button
                      key={style}
                      onClick={() => toggleFilter(selectedAiStyles, setSelectedAiStyles, style)}
                      className={`py-1 text-[8px] font-mono font-bold uppercase border transition-all ${
                        isSelected
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 bg-white dark:bg-black hover:border-zinc-400'
                      }`}
                    >
                      {t(`ai_refinement.styles.${style}`)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[8px] font-mono font-bold uppercase text-zinc-400 mb-2 tracking-widest">{t('ai_refinement.material_label')}</p>
              <div className="grid grid-cols-2 gap-1 px-0.5">
                {['Leve', 'Blindado', 'Elástico', 'Respirável'].map(mat => {
                  const isSelected = selectedAiMaterials.includes(mat);
                  return (
                    <button
                      key={mat}
                      onClick={() => toggleFilter(selectedAiMaterials, setSelectedAiMaterials, mat)}
                      className={`py-1 text-[8px] font-mono font-bold uppercase border transition-all ${
                        isSelected
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 bg-white dark:bg-black hover:border-zinc-400'
                      }`}
                    >
                      {t(`ai_refinement.materials.${mat}`)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[8px] font-mono font-bold uppercase text-zinc-400 tracking-widest flex items-center gap-1">
                  <Layers size={8} /> {t('ai_refinement.rigor_label')}
                </p>
                <span className="text-[9px] font-mono font-black text-green-600">{aiRelevanceWeight}%</span>
              </div>
              <Slider 
                value={[aiRelevanceWeight]}
                onValueChange={(val) => setAiRelevanceWeight(val[0])}
                max={100}
                step={5}
                className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
              />
            </div>
          </div>
        )}
      </div>

      {/* Brand Filter - Compact Bento Grid */}
      <div className="space-y-2">
        <p className="text-[9px] font-sans font-black uppercase text-zinc-400 tracking-wider font-bold">Marcas</p>
        <div className="grid grid-cols-2 gap-1 px-0.5">
          {brands.length > 0 ? brands.map(brand => {
            const isSelected = selectedBrands.includes(brand);
            return (
              <button
                key={brand}
                onClick={() => toggleFilter(selectedBrands, setSelectedBrands, brand)}
                className={`py-1.5 px-2 text-[9px] font-mono font-bold uppercase tracking-wider text-left border transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-zinc-200 dark:border-zinc-800/60 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-650 bg-white dark:bg-black'
                }`}
              >
                <span className="truncate flex items-center gap-1">
                  {brand}
                  {['Venum', 'Atama', 'Koral', 'KVRA'].includes(brand) && (
                    <Star size={8} className="fill-yellow-500 text-yellow-500 shrink-0 select-none" />
                  )}
                </span>
                {isSelected && <Check size={8} className="shrink-0 text-white" />}
              </button>
            );
          }) : (
            <p className="col-span-2 text-[8px] text-zinc-450 dark:text-zinc-500 italic">Nenhuma marca disponível</p>
          )}
        </div>
      </div>

      {/* Advanced Technical Level / Recommended Belt Filter */}
      <TechnicalLevelFilter
        userBelt={userBelt}
        onUpdateUserBelt={updateUserBelt}
        filterByTechnicalLevel={filterByTechnicalLevel}
        onToggleFilterByTechnicalLevel={setFilterByTechnicalLevel}
        productList={productList}
        compact={true}
        className="border-l-2 border-green-600"
      />

      {/* BJJ Belt Color Filter - Visual Theme Accent */}
      <div className="space-y-2">
        <p className="text-[9px] font-sans font-black uppercase text-zinc-400 tracking-wider font-bold">Graduação (Faixa)</p>
        <div className="flex flex-wrap items-center gap-1.5 px-0.5">
          {['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'].map(belt => {
            const isSelected = selectedBelts.includes(belt);
            const bgClass = 
              belt === 'Branca' ? 'bg-white border-zinc-300 dark:border-zinc-700' :
              belt === 'Azul' ? 'bg-blue-600 border-blue-700' :
              belt === 'Roxa' ? 'bg-purple-700 border-purple-800' :
              belt === 'Marrom' ? 'bg-amber-800 border-amber-900' : 'bg-black border-zinc-900';
            return (
              <button 
                key={belt}
                title={belt}
                onClick={() => toggleFilter(selectedBelts, setSelectedBelts, belt)}
                className={`relative w-7 h-7 rounded-none border transition-all flex items-center justify-center ${
                  isSelected 
                    ? 'border-green-600 scale-105 shadow-md ring-1 ring-green-600/30' 
                    : 'border-transparent'
                }`}
              >
                <div className={`w-full h-full rounded-none border ${bgClass}`} />
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center select-none">
                    <Check size={10} className={belt === 'Branca' ? 'text-black' : 'text-white'} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Color Filter - Visual Palette */}
      <div className="space-y-2">
        <p className="text-[9px] font-sans font-black uppercase text-zinc-400 tracking-wider font-bold">Cor do Produto</p>
        <div className="grid grid-cols-5 gap-1.5 px-0.5">
          {[
            { name: 'Branco', bg: 'bg-white border-zinc-200 dark:border-zinc-850' },
            { name: 'Preto', bg: 'bg-zinc-900 border-zinc-950 dark:bg-zinc-950 dark:border-zinc-850' },
            { name: 'Azul', bg: 'bg-blue-600 border-blue-700' },
            { name: 'Cinza', bg: 'bg-zinc-500 border-zinc-600' },
            { name: 'Vermelho', bg: 'bg-red-600 border-red-700' },
            { name: 'Roxo', bg: 'bg-purple-700 border-purple-800' },
            { name: 'Marrom', bg: 'bg-amber-800 border-amber-900' },
            { name: 'Verde', bg: 'bg-green-700 border-green-800' },
            { name: 'Dourado', bg: 'bg-amber-550 border-amber-650' }
          ].map(colorOpt => {
            const isSelected = selectedColors.includes(colorOpt.name);
            return (
              <button 
                key={colorOpt.name}
                title={colorOpt.name}
                onClick={() => toggleFilter(selectedColors, setSelectedColors, colorOpt.name)}
                className={`relative w-7 h-7 rounded-none border transition-all flex items-center justify-center ${
                  isSelected 
                    ? 'border-green-600 scale-105 shadow-md ring-1 ring-green-600/30' 
                    : 'border-transparent'
                }`}
              >
                <div className={`w-full h-full rounded-none border shadow-sm ${colorOpt.bg}`} />
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center select-none">
                    <Check size={10} className={colorOpt.name === 'Branco' ? 'text-black' : 'text-white'} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sizes Filter - Tidy Grid */}
      <div className="space-y-2">
        <p className="text-[9px] font-sans font-black uppercase text-zinc-400 tracking-wider font-bold">Tamanho</p>
        <div className="grid grid-cols-5 gap-1 px-0.5">
          {(sizesArr.length > 0 ? sizesArr : ['A0', 'A1', 'A2', 'A3', 'A4', 'P', 'M', 'G', 'GG']).map(size => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button 
                key={size}
                onClick={() => toggleFilter(selectedSizes, setSelectedSizes, size)}
                className={`py-1 md:py-1.5 text-center text-[9px] font-mono font-bold uppercase border transition-all ${
                  isSelected 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : 'border-zinc-200 dark:border-zinc-800/60 text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-650 bg-white dark:bg-black'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Gender Filter - Horizontal Row */}
      <div className="space-y-2">
        <p className="text-[9px] font-sans font-black uppercase text-zinc-400 tracking-wider font-bold">Gênero</p>
        <div className="grid grid-cols-2 gap-1 px-0.5">
          {['Masculino', 'Feminino', 'Infantil', 'Unissex'].map(g => {
            const isSelected = selectedGenders.includes(g);
            return (
              <button 
                key={g}
                onClick={() => toggleFilter(selectedGenders, setSelectedGenders, g)}
                className={`py-1.5 px-2 text-[9px] font-mono font-bold uppercase border text-left transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'bg-green-600 text-white border-green-600' 
                    : 'border-zinc-200 dark:border-zinc-800/60 text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-650 bg-white dark:bg-black'
                }`}
              >
                <span>{g}</span>
                {isSelected && <div className="w-1 h-1 bg-white rounded-full shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Sub-Category Filter (Pertinent Filters) */}
      {selectedCategory !== 'All' && subCategoriesArr.length > 0 && (
        <div className="space-y-2">
          <p className="text-[9px] font-sans font-black uppercase text-zinc-400 tracking-wider font-bold">
            {selectedCategory === 'Kimonos' ? 'Material / Tecido' :
             selectedCategory === 'Rashguards' ? 'Mangas / Tipo' :
             selectedCategory === 'Shorts' ? 'Modelo / Estilo' :
             selectedCategory === 'Protections' ? 'Tipo de Proteção' :
             selectedCategory === 'Supplements' ? 'Objetivo do Suplemento' :
             selectedCategory === 'Accessories' ? 'Tipo de Acessório' :
             selectedCategory === 'Nogi' ? 'Equipamento' :
             selectedCategory === 'Suplementos' ? 'Objetivo' :
             selectedCategory === 'Faixas' ? 'Tipo de Gravação' : 'Ajuste'}
          </p>
          <div className="grid grid-cols-2 gap-1 px-0.5">
            {(subCategoriesArr || []).map(sub => {
              const isSelected = (selectedSubCategories || []).includes(sub);
              return (
                <button 
                  key={sub}
                  onClick={() => toggleFilter(selectedSubCategories, setSelectedSubCategories, sub)}
                  className={`py-1.5 px-2 text-[9px] font-mono font-bold uppercase border text-left transition-all flex items-center justify-between truncate ${
                    isSelected 
                      ? 'bg-green-600 text-white border-green-600' 
                      : 'border-zinc-200 dark:border-zinc-800/60 text-zinc-400 hover:border-zinc-400 bg-white dark:bg-black'
                  }`}
                >
                  <span className="truncate">{sub}</span>
                  {isSelected && <Check size={8} className="shrink-0 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Slider */}
      <div className="space-y-2">
        <p className="text-[9px] font-sans font-black uppercase text-zinc-400 tracking-wider font-bold">Preço Máximo</p>
        <div className="space-y-2 bg-zinc-50/50 dark:bg-zinc-900/10 p-3 border border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex items-center justify-between select-none">
            <span className="text-[9px] font-mono text-zinc-400">R$ {priceRange[0]}</span>
            <span className="text-[9px] font-mono text-green-650 dark:text-green-500 font-bold">R$ {priceRange[1]}</span>
          </div>
          <Slider
            defaultValue={[0, maxProductPrice]}
            max={maxProductPrice}
            step={1}
            value={priceRange}
            onValueChange={(val) => setPriceRange(val as [number, number])}
            className="py-1"
          />
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-2">
        <p className="text-[9px] font-sans font-black uppercase text-zinc-400 tracking-wider font-bold">Avaliação</p>
        <div className="space-y-1">
          {[5, 4, 3, 2, 1].map(stars => {
            const isSelected = selectedRating === stars;
            return (
              <button
                key={stars}
                onClick={() => setSelectedRating(selectedRating === stars ? 0 : stars)}
                className={`w-full flex items-center justify-between py-1.5 px-2 text-[8px] font-mono font-bold uppercase transition-all border ${
                  isSelected 
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-zinc-200 dark:border-zinc-800/60 text-zinc-500 hover:border-zinc-400 bg-white dark:bg-black'
                }`}
              >
                <div className="flex items-center gap-1 select-none">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={8} className={i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-200 dark:text-zinc-850'} />
                    ))}
                  </div>
                  <span className="ml-1 text-[8px] font-mono leading-none tracking-tight text-zinc-500 dark:text-zinc-400">{stars === 5 ? 'Apenas' : '& Acima'}</span>
                </div>
                {isSelected && <Check size={8} className="shrink-0 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Origin Platform Filter */}
      <div className="space-y-2">
        <p className="text-[9px] font-sans font-black uppercase text-zinc-400 tracking-wider font-bold">Plataforma</p>
        <div className="grid grid-cols-2 gap-1 px-0.5">
          {platformsArr.map(plat => {
            const isSelected = selectedPlatforms.includes(plat);
            return (
              <button 
                key={plat}
                onClick={() => toggleFilter(selectedPlatforms, setSelectedPlatforms, plat)}
                className={`py-1.5 px-2 text-[9px] font-mono font-bold uppercase border text-left transition-all flex items-center justify-between truncate ${
                  isSelected 
                    ? 'bg-green-600 text-white border-green-600' 
                    : 'border-zinc-200 dark:border-zinc-800/60 text-zinc-400 hover:border-zinc-400 bg-white dark:bg-black'
                }`}
              >
                <span className="truncate">{plat}</span>
                {isSelected && <Check size={8} className="shrink-0 text-white" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const OriginalFilterContent = () => (
    <div className="space-y-8">
      {/* AI Refinement - Portal Técnico */}
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 border-l-2 border-green-600 mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-green-600/5 blur-3xl rounded-full"></div>
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-green-600 animate-pulse" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black dark:text-white">{t('ai_refinement.title')}</h4>
          </div>
          <Switch 
            checked={isAiRefinementActive}
            onCheckedChange={setIsAiRefinementActive}
            className="data-[state=checked]:bg-green-600"
          />
        </div>

        <AnimatePresence>
          {isAiRefinementActive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-6 pt-2 overflow-hidden"
            >
              <div>
                <p className="text-[8px] font-mono font-bold uppercase text-zinc-400 mb-3 tracking-widest">{t('ai_refinement.input_label')}</p>
                <div className="relative">
                  <Input 
                    value={aiRefinementQuery}
                    onChange={(e) => setAiRefinementQuery(e.target.value)}
                    placeholder={t('ai_refinement.input_placeholder')}
                    className="h-10 text-[9px] font-mono bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 rounded-none focus-visible:ring-1 focus-visible:ring-green-600 pl-8"
                  />
                  <Target size={10} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                </div>
              </div>

              <div>
                <p className="text-[8px] font-mono font-bold uppercase text-zinc-400 mb-3 tracking-widest">{t('ai_refinement.style_label')}</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Guardeiro', 'Passador', 'Wrestler', 'Finalizador'].map(style => (
                    <button
                      key={style}
                      onClick={() => toggleFilter(selectedAiStyles, setSelectedAiStyles, style)}
                      className={`py-2 text-[8px] font-mono font-bold uppercase border transition-all ${
                        selectedAiStyles.includes(style)
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400'
                      }`}
                    >
                      {t(`ai_refinement.styles.${style}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[8px] font-mono font-bold uppercase text-zinc-400 mb-3 tracking-widest">{t('ai_refinement.material_label')}</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Leve', 'Blindado', 'Elástico', 'Respirável'].map(mat => (
                    <button
                      key={mat}
                      onClick={() => toggleFilter(selectedAiMaterials, setSelectedAiMaterials, mat)}
                      className={`py-2 text-[8px] font-mono font-bold uppercase border transition-all ${
                        selectedAiMaterials.includes(mat)
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400'
                      }`}
                    >
                      {t(`ai_refinement.materials.${mat}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[8px] font-mono font-bold uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                    <Layers size={8} /> {t('ai_refinement.rigor_label')}
                  </p>
                  <span className="text-[9px] font-mono font-black text-green-600">{aiRelevanceWeight}%</span>
                </div>
                <Slider 
                  value={[aiRelevanceWeight]}
                  onValueChange={(val) => setAiRelevanceWeight(val[0])}
                  max={100}
                  step={5}
                  className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                />
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-[7px] font-mono text-zinc-400 leading-relaxed italic">
                  {t('ai_refinement.footer')}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-zinc-400" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{t('filter.title')}</h3>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              const allOpen = Object.values(openSections).every(v => v);
              const next: Record<string, boolean> = {};
              Object.keys(openSections).forEach(k => next[k] = !allOpen);
              setOpenSections(next);
            }}
            className="text-[8px] font-black uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          >
            {Object.values(openSections).every(v => v) ? t('common.minimize', { defaultValue: 'Minimizar' }) : t('common.expand', { defaultValue: 'Expandir' })}
          </button>
          {activeFiltersCount > 0 && (
            <button 
              onClick={clearFilters}
              className="text-[8px] font-black uppercase tracking-widest text-red-500 hover:opacity-70 transition-opacity"
            >
              Reset
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-4 pt-4">
        {/* Category Filter */}
        <div className="group border-b border-zinc-100 dark:border-zinc-900 pb-2">
          <motion.button 
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => toggleSection('category')}
            className="flex items-center justify-between w-full py-4 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[18px] text-zinc-400 group-hover:text-green-600 transition-colors">category</span>
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${openSections.category ? 'text-black dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>{t('nav.categories', { defaultValue: 'Categorias' })}</span>
            </div>
            {openSections.category ? <ChevronUp size={12} className="text-zinc-300" /> : <ChevronDown size={12} className="text-zinc-300" />}
          </motion.button>
          <AnimatePresence>
            {openSections.category && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-1 overflow-hidden pb-4"
              >
                {['All', 'Equipamentos para Iniciantes', 'Roupas de Competição', 'Acessórios de Treino', 'Nutrição Esportiva', 'Livros/DVDs de Técnicas', 'Vestuário', 'Kimonos', 'Rashguards', 'Bermudas', 'Faixas', 'Equipamentos', 'Tatames', 'Equipamentos de Proteção', 'Protetores', 'Nutrição', 'Suplementos', 'Conteúdo Digital', 'Cursos Online', 'E-books', 'Acessórios', 'Serviços'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat as any)}
                    className={`w-full text-left px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-widest transition-all relative group/cat ${
                      selectedCategory === cat 
                        ? 'text-black dark:text-white' 
                        : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
                      selectedCategory === cat ? 'bg-green-600' : 'bg-transparent group-hover/cat:bg-zinc-200 dark:group-hover/cat:bg-zinc-800'
                    }`} />
                    <span className="pl-2">{cat === 'All' ? t('categories.All') : t(`categories.${cat}`, { defaultValue: cat })}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Brand Filter - MOVED UP */}
        <div className="group border-b border-zinc-100 dark:border-zinc-900 pb-2 pt-2">
          <button 
            onClick={() => toggleSection('brand')}
            className="flex items-center justify-between w-full py-4 transition-all"
          >
            <div className="flex items-center gap-3">
              <Tag size={14} className={`transition-all duration-300 ${openSections.brand ? 'text-green-600 rotate-12' : 'text-zinc-400'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${openSections.brand ? 'text-black dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>{t('filter.brands')}</span>
            </div>
            {openSections.brand ? <ChevronUp size={12} className="text-zinc-300" /> : <ChevronDown size={12} className="text-zinc-300" />}
          </button>
          <AnimatePresence>
            {openSections.brand && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-1 overflow-hidden pb-4"
              >
                {brands.length > 0 ? brands.map(brand => (
                  <button 
                    key={brand}
                    onClick={() => toggleFilter(selectedBrands, setSelectedBrands, brand)}
                    className={`w-full text-left px-3 py-2 text-[9px] font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-between group/item ${
                      selectedBrands.includes(brand) 
                        ? 'bg-black text-white dark:bg-white dark:text-black' 
                        : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 border transition-colors ${
                        selectedBrands.includes(brand) 
                          ? 'border-green-500 bg-green-500' 
                          : 'border-zinc-300 dark:border-zinc-700 group-hover/item:border-zinc-500'
                      }`}>
                        {selectedBrands.includes(brand) && <Check size={8} className="text-white" />}
                      </div>
                      <span className="flex items-center gap-1.5">
                        {brand}
                        {['Venum', 'Atama', 'Koral', 'KVRA'].includes(brand) && (
                          <Star size={8} className="fill-yellow-500 text-yellow-500" />
                        )}
                      </span>
                    </div>
                  </button>
                )) : (
                  <p className="text-[9px] text-zinc-400 px-3 py-2 italic font-light">Nenhuma marca disponível</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Price Filter - MOVED HIGHER */}
        <div className="group border-b border-zinc-100 dark:border-zinc-900 pb-2 pt-2">
          <motion.button 
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full py-4 transition-all"
          >
            <div className="flex items-center gap-3">
              <Zap size={14} className={`transition-all duration-300 ${openSections.price ? 'text-green-600 scale-110' : 'text-zinc-400'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${openSections.price ? 'text-black dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>{t('filter.price_range')}</span>
            </div>
            {openSections.price ? <ChevronUp size={12} className="text-zinc-300" /> : <ChevronDown size={12} className="text-zinc-300" />}
          </motion.button>
          <AnimatePresence>
            {openSections.price && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-6 overflow-hidden pb-6 pt-2"
              >
                <div className="px-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono font-black text-green-600">R$ {priceRange[0]}</span>
                    <span className="text-[9px] font-mono font-black text-green-600">R$ {priceRange[1]}</span>
                  </div>
                  <Slider
                    defaultValue={[0, maxProductPrice]}
                    max={maxProductPrice}
                    step={1}
                    value={priceRange}
                    onValueChange={(val) => setPriceRange(val as [number, number])}
                    className="py-4"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col">
                      <span className="text-[7px] font-mono text-zinc-400 uppercase tracking-widest">{t('common.min', { defaultValue: 'Mínimo' })}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[7px] font-mono text-zinc-400 uppercase tracking-widest">{t('common.max', { defaultValue: 'Máximo' })}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => setPriceRange([0, maxProductPrice])}
                  className="w-full text-center py-2 text-[9px] font-mono font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-green-600 transition-colors border border-dashed border-zinc-100 dark:border-zinc-800"
                >
                  [ {t('filter.clear_all')} ]
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Gender Filter */}
        {(selectedCategory === 'All' || selectedCategory === 'Kimonos' || selectedCategory === 'Nogi' || selectedCategory === 'Casual') && (
          <div className="group border-b border-zinc-100 dark:border-zinc-900 pb-2 pt-2">
            <motion.button 
              whileHover={{ scale: 1.01, x: 2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => toggleSection('gender')}
              className="flex items-center justify-between w-full py-4 transition-all"
            >
              <div className="flex items-center gap-3">
                <Users size={14} className={`transition-all duration-300 ${openSections.gender ? 'text-green-600 scale-105' : 'text-zinc-400'}`} />
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${openSections.gender ? 'text-black dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>Gênero / Público</span>
              </div>
              {openSections.gender ? <ChevronUp size={12} className="text-zinc-300" /> : <ChevronDown size={12} className="text-zinc-300" />}
            </motion.button>
            <AnimatePresence>
              {openSections.gender && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-1 overflow-hidden pb-4"
                >
                  {['Masculino', 'Feminino', 'Infantil', 'Unissex'].map(g => (
                    <motion.button 
                      key={g}
                      whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.05)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleFilter(selectedGenders, setSelectedGenders, g)}
                      className={`w-full text-left px-3 py-2 text-[9px] font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-between ${
                        selectedGenders.includes(g) 
                          ? 'bg-black text-white dark:bg-white dark:text-black' 
                          : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <span>{g}</span>
                      {selectedGenders.includes(g) && <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Stats Adjustment */}
        {(selectedCategory === 'All' || selectedCategory === 'Kimonos' || selectedCategory === 'Nogi' || selectedCategory === 'Casual' || selectedCategory === 'Faixas') && (
          <div className="pt-6 mb-2">
             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300 mb-4">Ajustes Técnicos</p>
          </div>
        )}

        {/* Size Filter */}
        {(selectedCategory === 'All' || selectedCategory === 'Kimonos' || selectedCategory === 'Nogi' || selectedCategory === 'Casual' || selectedCategory === 'Faixas') && (
          <div className="group border-b border-zinc-100 dark:border-zinc-900 pb-2">
            <motion.button 
              whileHover={{ scale: 1.01, x: 2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => toggleSection('size')}
              className="flex items-center justify-between w-full py-4 transition-all"
            >
              <div className="flex items-center gap-3">
                <Ruler size={14} className={`transition-all duration-300 ${openSections.size ? 'text-green-600' : 'text-zinc-400'}`} />
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${openSections.size ? 'text-black dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>Tamanho</span>
              </div>
              {openSections.size ? <ChevronUp size={12} className="text-zinc-300" /> : <ChevronDown size={12} className="text-zinc-300" />}
            </motion.button>
            <AnimatePresence>
              {openSections.size && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-4 gap-1 overflow-hidden pb-4"
                >
                  {sizesArr.length > 0 ? sizesArr.map(size => (
                    <button 
                      key={size}
                      onClick={() => toggleFilter(selectedSizes, setSelectedSizes, size)}
                      className={`aspect-square flex items-center justify-center text-[9px] font-mono font-bold border transition-all ${
                        selectedSizes.includes(size) 
                          ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-md' 
                          : 'border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-900 dark:hover:border-zinc-100'
                      }`}
                    >
                      {size}
                    </button>
                  )) : ['A0', 'A1', 'A2', 'A3', 'A4', 'P', 'M', 'G', 'GG'].map(size => (
                    <button 
                      key={size}
                      onClick={() => toggleFilter(selectedSizes, setSelectedSizes, size)}
                      className={`aspect-square flex items-center justify-center text-[9px] font-mono font-bold border transition-all ${
                        selectedSizes.includes(size) 
                          ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-md' 
                          : 'border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-900 dark:hover:border-zinc-100'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Technical Level / Recommended Belt Filter */}
        <div className="group border-b border-zinc-100 dark:border-zinc-900 pb-2 pt-2">
          <button 
            onClick={() => toggleSection('technicalLevel')}
            className="flex items-center justify-between w-full py-4 transition-all"
          >
            <div className="flex items-center gap-3">
              <Award size={14} className={`transition-all duration-300 ${openSections.technicalLevel ? 'text-green-600' : 'text-zinc-400'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${openSections.technicalLevel ? 'text-black dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>
                FAIXA RECOMENDADA
              </span>
            </div>
            {openSections.technicalLevel ? <ChevronUp size={12} className="text-zinc-300" /> : <ChevronDown size={12} className="text-zinc-300" />}
          </button>
          <AnimatePresence>
            {openSections.technicalLevel && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pb-6 pt-2 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-medium text-zinc-500">Filtrar p/ meu nível técnico:</span>
                  <Switch 
                    checked={filterByTechnicalLevel}
                    onCheckedChange={setFilterByTechnicalLevel}
                    className="data-[state=checked]:bg-green-600"
                  />
                </div>
                
                <p className="text-[9px] text-zinc-400 leading-relaxed italic">
                  Mostra apenas produtos recomendados para sua faixa ativa ou abertos a todos os níveis.
                </p>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold uppercase text-zinc-400">Sua Faixa Ativa:</span>
                    <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-none border ${
                      userBelt === 'Branca' ? 'bg-white text-black border-zinc-300 dark:border-zinc-700' :
                      userBelt === 'Azul' ? 'bg-blue-600 text-white border-blue-700' :
                      userBelt === 'Roxa' ? 'bg-purple-700 text-white border-purple-800' :
                      userBelt === 'Marrom' ? 'bg-amber-800 text-white border-amber-900' : 'bg-black text-white border-zinc-900'
                    }`}>
                      🥋 {userBelt}
                    </span>
                  </div>

                  <div className="flex justify-between gap-1 pt-1">
                    {['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'].map(belt => {
                      const bgClass = 
                        belt === 'Branca' ? 'bg-white border-zinc-300 dark:border-zinc-700' :
                        belt === 'Azul' ? 'bg-blue-600 border-blue-700' :
                        belt === 'Roxa' ? 'bg-purple-700 border-purple-800' :
                        belt === 'Marrom' ? 'bg-amber-800 border-amber-900' : 'bg-black border-zinc-900';
                      const isCurrent = userBelt === belt;
                      return (
                        <button 
                          key={`filter-level-mobile-${belt}`}
                          title={`Definir nível como ${belt}`}
                          onClick={() => updateUserBelt(belt)}
                          className={`relative flex-1 h-5 border transition-all flex items-center justify-center ${
                            isCurrent 
                              ? 'border-green-600 scale-105 shadow-md ring-1 ring-green-600/30' 
                              : 'border-transparent opacity-60'
                          }`}
                        >
                          <div className={`w-full h-full rounded-none border ${bgClass}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Belt Color Filter - Visual and Prominent */}
        {(selectedCategory === 'All' || selectedCategory === 'Faixas') && (
          <div className="group border-b border-zinc-100 dark:border-zinc-900 pb-2 pt-2">
            <button 
              onClick={() => toggleSection('belt')}
              className="flex items-center justify-between w-full py-4 transition-all"
            >
              <div className="flex items-center gap-3">
                <Palette size={14} className={`transition-all duration-300 ${openSections.belt ? 'text-green-600 rotate-12' : 'text-zinc-400'}`} />
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${openSections.belt ? 'text-black dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>
                  GRADUAÇÃO (COR)
                </span>
              </div>
              {openSections.belt ? <ChevronUp size={12} className="text-zinc-300" /> : <ChevronDown size={12} className="text-zinc-300" />}
            </button>
            <AnimatePresence>
              {openSections.belt && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-5 gap-2 overflow-hidden pb-6 pt-2"
                >
                  {['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'].map(belt => {
                    const isSelected = selectedBelts.includes(belt);
                    return (
                      <button 
                        key={belt}
                        title={belt}
                        onClick={() => toggleFilter(selectedBelts, setSelectedBelts, belt)}
                        className={`group/belt relative aspect-square rounded-full border-2 transition-all flex items-center justify-center ${
                          isSelected 
                            ? 'border-green-600 scale-110 shadow-lg' 
                            : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600'
                        }`}
                      >
                        <div className={`w-full h-full rounded-full ${
                          belt === 'Branca' ? 'bg-white border border-zinc-200' :
                          belt === 'Azul' ? 'bg-blue-600 shadow-inner' :
                          belt === 'Roxa' ? 'bg-purple-700 shadow-inner' :
                          belt === 'Marrom' ? 'bg-[#5D4037] shadow-inner' : 'bg-black shadow-inner'
                        }`} />
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check size={14} className={belt === 'Branca' ? 'text-black' : 'text-white'} />
                          </div>
                        )}
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover/belt:opacity-100 transition-opacity whitespace-nowrap text-zinc-500">{belt}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Color Filter - Visual Palette */}
        <div className="group border-b border-zinc-100 dark:border-zinc-900 pb-2 pt-2">
          <button 
            onClick={() => toggleSection('color')}
            className="flex items-center justify-between w-full py-4 transition-all"
          >
            <div className="flex items-center gap-3">
              <Palette size={14} className={`transition-all duration-300 ${openSections.color ? 'text-green-600' : 'text-zinc-400'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${openSections.color ? 'text-black dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>Cor</span>
            </div>
            {openSections.color ? <ChevronUp size={12} className="text-zinc-300" /> : <ChevronDown size={12} className="text-zinc-300" />}
          </button>
          <AnimatePresence>
            {openSections.color && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="grid grid-cols-2 gap-2 overflow-hidden pb-4"
              >
                {[
                  { name: 'Branco', bg: 'bg-white border-zinc-200 dark:border-zinc-800' },
                  { name: 'Preto', bg: 'bg-zinc-900 border-zinc-950 dark:bg-zinc-950 dark:border-zinc-850' },
                  { name: 'Azul', bg: 'bg-blue-600 border-blue-700' },
                  { name: 'Cinza', bg: 'bg-zinc-500 border-zinc-600' },
                  { name: 'Vermelho', bg: 'bg-red-600 border-red-700' },
                  { name: 'Roxo', bg: 'bg-purple-700 border-purple-800' },
                  { name: 'Marrom', bg: 'bg-amber-800 border-amber-900' },
                  { name: 'Verde', bg: 'bg-green-700 border-green-800' },
                  { name: 'Dourado', bg: 'bg-amber-550 border-amber-650' }
                ].map(colorOpt => {
                  const isSelected = selectedColors.includes(colorOpt.name);
                  return (
                    <button
                      key={colorOpt.name}
                      onClick={() => toggleFilter(selectedColors, setSelectedColors, colorOpt.name)}
                      className={`py-1.5 px-2 text-[9px] font-mono font-bold uppercase border text-left transition-all flex items-center gap-2 ${
                        isSelected 
                          ? 'bg-zinc-100 dark:bg-zinc-900 border-green-600 text-black dark:text-white' 
                          : 'border-zinc-100 dark:border-zinc-900 text-zinc-500 hover:border-zinc-300 bg-white dark:bg-black'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 border shadow-sm ${colorOpt.bg} flex items-center justify-center shrink-0`}>
                        {isSelected && <Check size={10} className={colorOpt.name === 'Branco' ? 'text-black' : 'text-white'} />}
                      </div>
                      <span className="truncate">{colorOpt.name}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Platform Filter */}
        <div className="group border-b border-zinc-100 dark:border-zinc-900 pb-2 pt-2">
          <button 
            onClick={() => toggleSection('platform')}
            className="flex items-center justify-between w-full py-4 transition-all"
          >
            <div className="flex items-center gap-3">
              <Store size={14} className={`transition-all duration-300 ${openSections.platform ? 'text-green-600' : 'text-zinc-400'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${openSections.platform ? 'text-black dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>Plataformas</span>
            </div>
            {openSections.platform ? <ChevronUp size={12} className="text-zinc-300" /> : <ChevronDown size={12} className="text-zinc-300" />}
          </button>
          <AnimatePresence>
            {openSections.platform && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-1 overflow-hidden pb-4"
              >
                {platformsArr.map(plat => (
                  <button 
                    key={plat}
                    onClick={() => toggleFilter(selectedPlatforms, setSelectedPlatforms, plat)}
                    className={`w-full text-left px-3 py-2 text-[9px] font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-between group/plat ${
                      selectedPlatforms.includes(plat) 
                        ? 'bg-black text-white dark:bg-white dark:text-black' 
                        : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 border transition-colors ${
                        selectedPlatforms.includes(plat) 
                          ? 'border-green-500 bg-green-500' 
                          : 'border-zinc-300 dark:border-zinc-700 group-hover/plat:border-zinc-500'
                      }`}>
                        {selectedPlatforms.includes(plat) && <Check size={8} className="text-white" />}
                      </div>
                      <span>{plat}</span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rating Filter */}
        <div className="group border-b border-zinc-100 dark:border-zinc-900 pb-2 pt-2">
          <button 
            onClick={() => toggleSection('rating')}
            className="flex items-center justify-between w-full py-4 transition-all"
          >
            <div className="flex items-center gap-3">
              <Star size={14} className={`transition-all duration-300 ${openSections.rating ? 'text-green-600' : 'text-zinc-400'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${openSections.rating ? 'text-black dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>Avaliação</span>
            </div>
            {openSections.rating ? <ChevronUp size={12} className="text-zinc-300" /> : <ChevronDown size={12} className="text-zinc-300" />}
          </button>
          <AnimatePresence>
            {openSections.rating && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-1 overflow-hidden pb-4"
              >
                {[5, 4, 3, 2, 1].map(stars => (
                  <button 
                    key={stars}
                    onClick={() => setSelectedRating(selectedRating === stars ? 0 : stars)}
                    className={`w-full text-left px-3 py-2 text-[9px] font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-between ${
                      selectedRating === stars 
                        ? 'bg-black text-white dark:bg-white dark:text-black' 
                        : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={10} className={i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-200 dark:text-zinc-800'} />
                        ))}
                      </div>
                      <span className="ml-2 font-mono">{stars === 5 ? 'Apenas' : '& Acima'}</span>
                    </div>
                    {selectedRating === stars && <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Sub-Category Filter (Pertinent Filters) */}
        {(selectedCategory !== 'All') && (
          <div className="group border-b border-zinc-100 dark:border-zinc-900 pb-2 pt-2">
            <button 
              onClick={() => toggleSection('subCategory')}
              className="flex items-center justify-between w-full py-4 transition-all"
            >
              <div className="flex items-center gap-3">
                <Wand2 size={14} className={`transition-all duration-300 ${openSections.subCategory ? 'text-green-600 rotate-12' : 'text-zinc-400'}`} />
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${openSections.subCategory ? 'text-black dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'}`}>
                  {selectedCategory === 'Kimonos' ? 'Marca / Nível' :
                   selectedCategory === 'Rashguards' ? 'Mangas / Tipo' :
                   selectedCategory === 'Bermudas' ? 'Modelo / Estilo' :
                   selectedCategory === 'Equipamentos de Proteção' ? 'Tipo de Proteção' :
                   selectedCategory === 'Acessórios' ? 'Tipo de Acessório' :
                   selectedCategory === 'Suplementos' ? 'Objetivo' :
                   selectedCategory === 'Faixas' ? 'Cor / Graduação' : 'Subcategoria'}
                </span>
              </div>
              {openSections.subCategory ? <ChevronUp size={12} className="text-zinc-300" /> : <ChevronDown size={12} className="text-zinc-300" />}
            </button>
            <AnimatePresence>
              {openSections.subCategory && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-1 overflow-hidden pb-4"
                >
                  {(subCategoriesArr || []).map(sub => (
                    <button 
                      key={sub}
                      onClick={() => toggleFilter(selectedSubCategories, setSelectedSubCategories, sub)}
                      className={`w-full text-left px-3 py-2 text-[9px] font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-between group/sub ${
                        (selectedSubCategories || []).includes(sub) 
                          ? 'bg-black text-white dark:bg-white dark:text-black' 
                          : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 border transition-colors ${
                          (selectedSubCategories || []).includes(sub) 
                            ? 'border-green-500 bg-green-500' 
                            : 'border-zinc-300 dark:border-zinc-700 group-hover/sub:border-zinc-500'
                        }`}>
                          {(selectedSubCategories || []).includes(sub) && <Check size={8} className="text-white" />}
                        </div>
                        <span>{sub}</span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [affiliateUrl, setAffiliateUrl] = useState('');

  // Reset pagination when filters change
  useEffect(() => {
    setBlogPage(1);
  }, [blogSearchQuery, selectedBlogCategory, blogDateFilter]);

  const handleImportML = async () => {
    if (!importUrl) return;
    setIsImporting(true);
    try {
      const response = await fetch(`/api/import/mercadolivre?url=${encodeURIComponent(importUrl)}`);
      if (!response.ok) throw new Error("Falha na importação");
      const newProduct = await response.json();
      
      // Check if product already exists
      if (productList.some(p => p.id === newProduct.id)) {
        addToast("Este produto já foi importado.", "error");
        return;
      }

      setProductList(prev => [newProduct, ...prev]);
      setImportUrl('');
      addToast("Produto importado com sucesso!", "success");
    } catch (error) {
      console.error(error);
      addToast("Erro ao importar produto. Verifique a URL.", "error");
    } finally {
      setIsImporting(false);
    }
  };

  const handleGeneratePodcast = async (post: BlogPost): Promise<string> => {
    try {
      const prompt = `Aja como o 'Lobo Mensageiro' do Jiu-Jitsu. Seu tom é ESTÓICO, PROFUNDO, CALMO e DISCIPLINADO. Você não é um locutor de rádio comum; você é um mentor, um mestre que vê além da técnica e enxerga a filosofia por trás de cada combate. 
      
      Script para narrar com sabedoria:
      Início: "O tatame é o espelho da alma. Aqui é o Diário dos Oss.os, trazendo a essência do caminho suave."
      Reflexão Principal: ${post.title}
      O Ensinamento: ${post.content}
      Encerramento: "A disciplina é o único caminho. Mantenham a guarda alta e a mente serena. Ooss."
      
      Instrução: Fale em português do Brasil. Use pausas longas e ponderadas. Sua voz deve transmitir autoridade e calma transcendental.`;
      
      const response = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, voice: "Charon" })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Nenhum dado de áudio retornado pelo servidor AI");
      }
      if (resData.isFallback) {
        throw new Error("Gemini TTS indisponível (usando fallback silencioso do servidor)");
      }
      const { audio: base64Audio } = resData;

      if (base64Audio) {
        const audioBlob = await pcmToWavBlob(base64Audio);
        
        // Save to IndexedDB for persistence using the new utility
        await saveAudioToCache(post.id, audioBlob);
        
        // Return lightweight Blob URL immediately for instant playing in iframe sandbox
        const blobUrl = URL.createObjectURL(audioBlob);
        return blobUrl;
      }
      throw new Error("Nenhum dado de áudio retornado pelo Gemini");
    } catch (error) {
      console.warn("[TTS Info] Gemini TTS unavailable, preparing browser speech synthesis fallback:", error);
      throw error;
    }
  };

  const playSpeechSynthesis = (post: BlogPost) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      addToast("Seu navegador não suporta síntese de voz.", "error");
      return;
    }
    
    window.speechSynthesis.cancel();
    
    const narrationText = `O tatame é o espelho da alma. Aqui é o Diário dos Ossos, trazendo a essência do caminho suave. Reflexão Principal: ${post.title}. Ensinamento: ${post.content}. A disciplina é o único caminho. Mantenham a guarda alta e a mente serena. Ooss.`;
    
    const u = new SpeechSynthesisUtterance(narrationText);
    u.lang = 'pt-BR';
    
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.includes('pt-BR') || v.lang.includes('pt_BR'));
    if (ptVoice) {
      u.voice = ptVoice;
    }
    
    u.rate = 0.9; 
    u.pitch = 0.85; 
    
    u.onend = () => {
      setPlayingAudioId(null);
      setSynthUtterance(null);
    };
    
    u.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      setPlayingAudioId(null);
      setSynthUtterance(null);
    };
    
    setSynthUtterance(u);
    setPlayingAudioId(post.id);
    window.speechSynthesis.speak(u);
  };

  const pauseSpeechSynthesis = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlayingAudioId(null);
    setSynthUtterance(null);
  };

  const processPodcastGeneration = async (post: BlogPost, autoPlayAfter = false) => {
    if (isGeneratingAudio) return;
    setIsGeneratingAudio(post.id);
    addToast("🎙️ Canal sintonizado. O Lobo Mensageiro está preparando as cordas vocais. Aguarde...", "info");
    try {
      const audioUrl = await handleGeneratePodcast(post);
      setBlogPosts(prev => prev.map(p => p.id === post.id ? { ...p, audioUrl, hasAudio: true, useSpeechSynthesis: false } : p));
      addToast("🎙️ Voz do Mestre gerada com sucesso via Gemini TTS e salva localmente!", "success");
      
      if (autoPlayAfter) {
        setTimeout(() => {
          const audio = document.getElementById(`audio-${post.id}`) as HTMLAudioElement;
          if (audio) {
            audio.play()
              .then(() => setPlayingAudioId(post.id))
              .catch(err => console.error("Could not auto-play generated audio:", err));
          }
        }, 800);
      }
    } catch (error: any) {
      console.info("[TTS Fallback] Switching to browser local speech synthesis:", error?.message || error);
      setBlogPosts(prev => prev.map(p => p.id === post.id ? { ...p, hasAudio: true, useSpeechSynthesis: true } : p));
      addToast("🎙️ Gemini TTS indisponível. Ativando Sintetizador de Voz do Navegador em modo de contingência!", "info");
      
      if (autoPlayAfter) {
        setTimeout(() => {
          playSpeechSynthesis(post);
        }, 800);
      }
    } finally {
      setIsGeneratingAudio(null);
    }
  };

  const playClickSound = () => {
    const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-16.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const handleScoutNews = async (auto = false) => {
    if (isScouting) return;
    setIsScouting(true);

    // Hard purge local storage on manual scout to ensure freshness
    if (!auto) {
      localStorage.removeItem('oss_blog_posts_final_technical_v6_reborn');
    }
    
    try {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const isPodcastDay = dayOfWeek === 2 && auto; // Se for manual (!auto), sempre inclui podcast na lista maior!

      // Fetch dynamic live context from registered active RSS feeds
      const activeFeeds = rssFeeds.filter(f => f.active);
      let rssContext = "";
      const fetchedArticles: any[] = [];
      
      if (activeFeeds.length > 0) {
        for (const feed of activeFeeds) {
          try {
            const res = await fetch(`/api/rss/fetch?url=${encodeURIComponent(feed.url)}`);
            if (res.ok) {
              const json = await res.json();
              if (json.items && json.items.length > 0) {
                // Fetch top 3 articles from each feed
                fetchedArticles.push(...json.items.slice(0, 3).map((item: any) => ({
                  feedName: feed.name,
                  title: item.title,
                  description: item.description,
                  pubDate: item.pubDate,
                  link: item.link
                })));
              }
            }
          } catch (e) {
            console.warn(`[Client RSS] Failed to fetch feed ${feed.name}:`, e);
          }
        }
        
        if (fetchedArticles.length > 0) {
          rssContext = `\nCONTEXTO REAL EXTRAÍDO DOS FEEDS RSS DE JIU-JITSU ATIVOS NO PAINEL:\n${
            fetchedArticles.map((a, i) => `${i + 1}. [Feed ${a.feedName}] "${a.title}" - ${a.description}`).join('\n')
          }\n\nREQUISITO OBRIGATÓRIO: Baseie e incorpore o contexto factual acima na criação dos artigos de Jiu-Jitsu gerados para garantir relevância técnica imediata de Maio de 2026.\n`;
        }
      }

      const bjjContext = "Brazilian Jiu-Jitsu (BJJ) TÉCNICO, COMPETITIVO e FILOSÓFICO. PESQUISE NOTÍCIAS REAIS DE MAIO de 2026. PROIBIÇÃO: Fitness genérico, Yoga, Musculação.";
      
      let prompt = "";
      if (isPodcastDay) {
        prompt = `PESQUISE REAL-TIME: Gere exatamente um novo episódio para o 'MANUAL DO GUERREIRO OSS.OS' (Category: 'Podcast') do mês de Maio de 2026. 
O tom deve ser ESTÓICO, PROFUNDO, ALTAMENTE REFLEXIVO (vibe Lobo Mensageiro / Charon). ${rssContext}
Retorne estritamente um array JSON com exatamente 1 objeto no seguinte formato: [{title, excerpt, content, category: "Podcast", date: "YYYY-MM-DD" (data real do acontecimento), imageUrl, imageCredit, imageSourceUrl}].`;
      } else {
        prompt = `PESQUISE REAL-TIME: Faça uma varredura nas últimas notícias e ensinamentos técnico-filosóficos de ${bjjContext} do mês de Maio de 2026. ${rssContext}
Gere obrigatoriamente um array JSON contendo exatamente ${!auto ? '4' : '3'} objetos distinct notícias/artigos:
- Item 1 (Category: 'Results'): Um artigo detalhado sobre resultados reais e recentes do Campeonato Brasileiro, Mundial ou eventos IBJJF/ADCC de 2026.
- Item 2 (Category: 'Tutorial'): Um guia técnico ou tutorial biomecanicamente otimizado e aprofundado (ex: passagem de guarda ou transição de raspagem).
- Item 3 (Category: 'Philosophy'): Uma reflexão estóica, lifestyle ou inteligência tática avançada de tatame.
${!auto ? "- Item 4 (Category: 'Podcast'): Um novo episódio reflexivo e estóico para o 'MANUAL DO GUERREIRO OSS.OS' com tom profundo e instrutivo." : ""}

Retorne estritamente um array JSON de ${!auto ? '4' : '3'} elementos no formato de objetos: {title, excerpt, content, category, date: 'YYYY-MM-DD' (data real do acontecimento), imageUrl, imageCredit, imageSourceUrl}.`;
      }
      
      let aiData;
      try {
        const aiRes = await fetch("/api/ai/scout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, useSearch: true })
        });

        aiData = await aiRes.json();
        if (!aiRes.ok) throw new Error(aiData.error || "Falha ao buscar notícias com IA");
      } catch (aiErr: any) {
        console.warn("AI Scout failed, using premium local fallback:", aiErr);
        
        const startOf2026 = new Date('2026-01-01T00:00:00Z').getTime();
        const currentMillis = Date.now();
        const dayOfYear = Math.floor((currentMillis - startOf2026) / 86400000);
        const rotation = dayOfYear % 2;

        let fallbackList: any[] = [];
        if (isPodcastDay) {
          if (rotation === 0) {
            fallbackList = [
              {
                title: "Manual do Guerreiro: A Alquimia da Pressão e o Crescimento Invisível",
                excerpt: "Como o desconforto agudo nos treinos reconstrói a mente de um verdadeiro faixa preta para lidar com o caos corporativo.",
                content: "A pressão é uma força física no tatame, mas é uma força psicológica fora dele. A filosofia estoica nos ensina que o obstáculo é o caminho. Quando você está sob o Cem Quilos de um adversário pesado, desesperar-se apenas acelera sua asfixia. O caminho suave exige calma sob pressão, respiração compassada e micro-movimentos milimétricos. Fora do tatame, no turbilhão dos negócios de Maio de 2026, a mesma regra é soberana. O verdadeiro guerreiro acolhe a pressão como uma forja de caráter, transformando a adversidade em pura sabedoria tática.",
                category: "Podcast",
                date: getRelativeDateString(0),
                imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=800&auto=format&fit=crop",
                imageCredit: "Arte/Visual IA OSS.OS (Fallback Estóico)",
                imageSourceUrl: "https://unsplash.com"
              }
            ];
          } else {
            fallbackList = [
              {
                title: "Manual do Guerreiro: A Cura Silenciosa da Mente Afastada",
                excerpt: "Enfrentando o silêncio da lesão com resiliência estoica e análise tática aprofundada.",
                content: "Estar lesionado é o maior teste psicológico para o guerreiro do tatame. Quando o corpo falha, o ego se debate no silêncio do banco de reservas. Marco Aurélio nos instrui a usar cada barreira como combustível. O afastamento físico do tatame não é um ano sabático; é o período dourado da inteligência tática. Estude gravações dos seus oponentes, assista às dinâmicas invisíveis dos mestres, instrua os iniciantes e fortaleça a mente de aço. O tatame não reside apenas na lona, ele reside na sua disciplina diária.",
                category: "Podcast",
                date: getRelativeDateString(0),
                imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
                imageCredit: "Arte/Visual IA OSS.OS (Fallback Estóico)",
                imageSourceUrl: "https://unsplash.com"
              }
            ];
          }
        } else {
          if (fetchedArticles.length > 0) {
            fallbackList = fetchedArticles.map((a: any) => {
              const categories = ['Results', 'Tutorial', 'News', 'Lifestyle'];
              const randomCategory = categories[Math.floor(Math.random() * categories.length)];
              const cleanExcerpt = a.description ? a.description.replace(/<[^>]*>/g, '').trim().slice(0, 160) + '...' : 'Clique para conferir a notícia de Jiu-Jitsu direto da cobertura original.';
              
              let hash = 0;
              for (let idx = 0; idx < a.title.length; idx++) {
                hash = a.title.charCodeAt(idx) + ((hash << 5) - hash);
              }
              const images = [
                'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1510279931157-4b703e301233?q=80&w=800&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1552072092-2f9b132a7785?q=80&w=800&auto=format&fit=crop'
              ];
              const index = Math.abs(hash) % images.length;
              const selectedImg = images[index];

              return {
                title: a.title,
                excerpt: cleanExcerpt,
                content: `Esta matéria foi capturada em tempo real do portal de notícias de Jiu-Jitsu **${a.feedName}**.\n\n### Cobertura do Tatame\n${a.description || 'Confira os detalhes completos da notícia sobre treinamentos, chaves e bastidores de combate.'}\n\nPara conferir a análise e a cobertura oficial na íntegra, acesse o link oficial do feed:\n\n👉 [Clique aqui para ler a matéria original completa no site da fonte](${a.link || 'https://graciemag.com'})\n\n---\n*Nota: O Diário OSS.OS sincroniza conteúdo de forma automática e inteligente com os principais feeds do tatame mundial para garantir que você esteja sempre um passo à frente nas táticas de luta.*`,
                category: randomCategory,
                date: a.pubDate ? new Date(a.pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                imageUrl: selectedImg,
                imageCredit: `Feed RSS de ${a.feedName}`,
                imageSourceUrl: a.link || 'https://unsplash.com'
              };
            });
          } else if (rotation === 0) {
            fallbackList = [
              {
                title: "Resultados CBJJ 2026: Mica Galvão e Dream Art Dominam Divisões Principais",
                excerpt: "Uma análise completa das disputas de faixa preta em Barueri, com destaque para a velocidade das passagens modernas.",
                content: "O ginásio José Corrêa, em Barueri, ferveu com as finais da categoria faixa preta absoluto do Campeonato Brasileiro 2026. Mica Galvão impôs sua tradicional pressão dinâmica, finalizando adversários na rota para o ouro duplo. Entre as equipes, a Dream Art e Alliance travaram um duelo estratégico nas chaves masculinas e femininas, marcando o torneio como o de maior nível técnico de passagens de guarda da década.",
                category: "Results",
                date: getRelativeDateString(0),
                imageUrl: "https://images.unsplash.com/photo-1510279931157-4b703e301233?q=80&w=800&auto=format&fit=crop",
                imageCredit: "Arte/Visual IA OSS.OS (Fallback)",
                imageSourceUrl: "https://unsplash.com"
              },
              {
                title: "Guia Técnico de Especialista: O Berimbolo Biomecanicamente Otimizado",
                excerpt: "Elimine torções excessivas e foque no verdadeiro posicionamento do quadril e inserção do gancho De La Riva interno.",
                content: "O berimbolo moderno é visto como complexo pelas acrobatacias, mas seu cerne é física simples. Este manual desconstrói as fases de rotação, focando em manter a lombar chapada no solo, o uso do gancho de De La Riva profundo para forçar a rotação externa do joelho do oponente e as rotas ótimas de subida para as costas sem forçar as articulações do praticante.",
                category: "Tutorial",
                date: getRelativeDateString(2),
                imageUrl: "https://images.unsplash.com/photo-1552072092-2f9b132a7785?q=80&w=800&auto=format&fit=crop",
                imageCredit: "Arte/Visual IA OSS.OS (Fallback)",
                imageSourceUrl: "https://unsplash.com"
              },
              {
                title: "Gestão de Elite: A Economia Oculta por Trás das Redes Premium de Jiu-Jitsu",
                excerpt: "De academias de garagem a franquias de alto padrão em Londres e Dubai: os números da profissionalização do esporte.",
                content: "O mercado de Jiu-Jitsu em 2026 completou sua transição executiva. O modelo antigo de cobrança informal e tatames desgastados deu lugar a franquias com padrão de atendimento internacional, arquitetura escandinava de alta higiene e metodologias corporativas de fidelização. Academias em polos financeiros como Tóquio e NY operam hoje sob rigorosos planos de carreira e bônus de performance para faixas pretas dedicados, redesenhando a economia do Jiu-Jitsu profissional global.",
                category: "Lifestyle",
                date: getRelativeDateString(4),
                imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=800&auto=format&fit=crop",
                imageCredit: "Arte/Visual IA OSS.OS (Fallback)",
                imageSourceUrl: "https://unsplash.com"
              },
              {
                title: "Manual do Guerreiro: A Alquimia da Pressão e o Crescimento Invisível",
                excerpt: "Como o desconforto agudo nos treinos reconstrói a mente de um verdadeiro faixa preta para lidar com o caos corporativo.",
                content: "A pressão é uma força física no tatame, mas é uma força psicológica fora dele. A filosofia estoica nos ensina que o obstáculo é o caminho. Quando você está sob o Cem Quilos de um adversário pesado, desesperar-se apenas acelera sua asfixia. O caminho suave exige calma sob pressão, respiração compassada e micro-movimentos milimétricos. Fora do tatame, no turbilhão dos negócios de Maio de 2026, a mesma regra é soberana. O verdadeiro guerreiro acolhe a pressão como uma forja de caráter, transformando a adversidade em pura sabedoria tática.",
                category: "Podcast",
                date: getRelativeDateString(0),
                imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=800&auto=format&fit=crop",
                imageCredit: "Arte/Visual IA OSS.OS (Fallback Estóico)",
                imageSourceUrl: "https://unsplash.com"
              }
            ];
          } else {
            fallbackList = [
              {
                title: "A Teoria dos 60 Segundos Finais: Como Pontuar Sob Extrema Pressão de Relógio",
                excerpt: "Masterclass tática sobre gestão estratégica de tempo, vantagens e controle das pegadas de bloqueio no Jiu-Jitsu esportivo.",
                content: "Nas finais de grandes torneios, combates são comumente decididos por vantagens nos últimos momentos. Vencer o cronômetro exige precisão milimétrica: induzir o oponente ao erro sem ser punido por falta de combatividade. Este estudo técnico demonstra como estabelecer pegadas dominantes na gola e quadril para congelar a iniciativa do passador ou armar raspagens cirúrgicas no soar do gongo.",
                category: "News",
                date: getRelativeDateString(0),
                imageUrl: bjjHeroBanner,
                imageCredit: "Arte/Visual IA OSS.OS",
                imageSourceUrl: "https://unsplash.com"
              },
              {
                title: "Guia Técnico: Transição Secreta de Meia Guarda para Leg Lock",
                excerpt: "Aprenda o sistema invisível de alavanca de joelho no bloqueio de escudo partindo da guarda Z.",
                content: "Quando o passador de pressão tenta chapar seu escudo na guarda Z, ele expõe a linha de centralidade do joelho dele. Usando uma pegada interna na coxa oposta e deslizando o quadril para baixo do centro de gravidade, você establishes a transição direta para a chave de calcanhar interna em menos de dois segundos de combate técnico.",
                category: "Tutorial",
                date: getRelativeDateString(1),
                imageUrl: bjjActionGrappling,
                imageCredit: "Arte/Visual IA OSS.OS",
                imageSourceUrl: "https://unsplash.com"
              },
              {
                title: "O Nômade Digital da Faixa Preta: A Rota dos Seminários Globais",
                excerpt: "Como instrutores de alta performance utilizam mídias sociais e conexões aéreas para viver do esporte sem fronteiras.",
                content: "Viajar o mundo ensinando BJJ tornou-se um dos caminhos profissionais mais cobiçados da nova geração. Conectando plataformas de conteúdo técnico pago a um calendário logístico de seminários semanais de Tóquio a Buenos Aires, atletas independentes faturam e espalham a doutrina dos tatames nacionais, conquistando patrocínios internacionais e independência executiva sem estarem presos a uma única sede física.",
                category: "Lifestyle",
                date: getRelativeDateString(3),
                imageUrl: bjjKimonoDetail,
                imageCredit: "Arte/Visual IA OSS.OS",
                imageSourceUrl: "https://unsplash.com"
              },
              {
                title: "Manual do Guerreiro: A Cura Silenciosa da Mente Afastada",
                excerpt: "Enfrentando o silêncio da lesão com resiliência estoica e análise tática aprofundada.",
                content: "Estar lesionado é o maior teste psicológico para o guerreiro do tatame. Quando o corpo falha, o ego se debate no silêncio do banco de reservas. Marco Aurélio nos instrui a usar cada barreira como combustível. O afastamento físico do tatame não é um ano sabático; é o período dourado da inteligência tática. Estude gravações dos seus oponentes, assista às dinâmicas invisíveis dos mestres, instrua os iniciantes e fortaleça a mente de aço. O tatame não reside apenas na lona, ele reside na sua disciplina diária.",
                category: "Podcast",
                date: getRelativeDateString(0),
                imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
                imageCredit: "Arte/Visual IA OSS.OS (Fallback Estóico)",
                imageSourceUrl: "https://unsplash.com"
              }
            ];
          }
        }
        aiData = { text: JSON.stringify(fallbackList) };
      }

      let news: any[] = [];
      try {
        const responseText = aiData.text;
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        const cleanedText = jsonMatch ? jsonMatch[0] : responseText;
        news = JSON.parse(cleanedText);
        if (!Array.isArray(news)) throw new Error("Parsed content is not an array");
      } catch (parseErr) {
        console.warn("AI Scout parsing failed, falling back to local list:", parseErr);
        const startOf2026 = new Date('2026-01-01T00:00:00Z').getTime();
        const currentMillis = Date.now();
        const dayOfYear = Math.floor((currentMillis - startOf2026) / 86400000);
        const rotation = dayOfYear % 2;

        if (isPodcastDay) {
          if (rotation === 0) {
            news = [
              {
                title: "Manual do Guerreiro: A Alquimia da Pressão e o Crescimento Invisível",
                excerpt: "Como o desconforto agudo nos treinos reconstrói a mente de um verdadeiro faixa preta para lidar com o caos corporativo.",
                content: "A pressão é uma força física no tatame, mas é uma força psicológica fora dele. A filosofia estoica nos ensina que o obstáculo é o caminho. Quando você está sob o Cem Quilos de um adversário pesado, desesperar-se apenas acelera sua asfixia. O caminho suave exige calma sob pressão, respiração compassada e micro-movimentos milimétricos. Fora do tatame, no turbilhão dos negócios de Maio de 2026, a mesma regra é soberana. O verdadeiro guerreiro acolhe a pressão como uma forja de caráter, transformando a adversidade em pura sabedoria tática.",
                category: "Podcast",
                date: getRelativeDateString(0),
                imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=800&auto=format&fit=crop",
                imageCredit: "Arte/Visual IA OSS.OS (Fallback Estóico)",
                imageSourceUrl: "https://unsplash.com"
              }
            ];
          } else {
            news = [
              {
                title: "Manual do Guerreiro: A Cura Silenciosa da Mente Afastada",
                excerpt: "Enfrentando o silêncio da lesão com resiliência estoica e análise tática aprofundada.",
                content: "Estar lesionado é o maior teste psicológico para o guerreiro do tatame. Quando o corpo falha, o ego se debate no silêncio do banco de reservas. Marco Aurélio nos instrui a usar cada barreira como combustível. O afastamento físico do tatame não é um ano sabático; é o período dourado da inteligência tática. Estude gravações dos seus oponentes, assista às dinâmicas invisíveis dos mestres, instrua os iniciantes e fortaleça a mente de aço. O tatame não reside apenas na lona, ele reside na sua disciplina diária.",
                category: "Podcast",
                date: getRelativeDateString(4),
                imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
                imageCredit: "Arte/Visual IA OSS.OS (Fallback Estóico)",
                imageSourceUrl: "https://unsplash.com"
              }
            ];
          }
        } else {
          if (rotation === 0) {
            news = [
              {
                title: "Resultados CBJJ 2026: Mica Galvão e Dream Art Dominam Divisões Principais",
                excerpt: "Uma análise completa das disputas de faixa preta em Barueri, com destaque para a velocidade das passagens modernas.",
                content: "O ginásio José Corrêa, em Barueri, ferveu com as finais da categoria faixa preta absoluto do Campeonato Brasileiro 2026. Mica Galvão impôs sua tradicional pressão dinâmica, finalizando adversários na rota para o ouro duplo. Entre as equipes, a Dream Art e Alliance travaram um duelo estratégico nas chaves masculinas e femininas, marcando o torneio como o de maior nível técnico de passagens de guarda da década.",
                category: "Results",
                date: getRelativeDateString(0),
                imageUrl: "https://images.unsplash.com/photo-1510279931157-4b703e301233?q=80&w=800&auto=format&fit=crop",
                imageCredit: "Arte/Visual IA OSS.OS (Fallback)",
                imageSourceUrl: "https://unsplash.com"
              },
              {
                title: "Guia Técnico de Especialista: O Berimbolo Biomecanicamente Otimizado",
                excerpt: "Elimine torções excessivas e foque no verdadeiro posicionamento do quadril e inserção do gancho De La Riva interno.",
                content: "O berimbolo moderno é visto como complexo pelas acrobatacias, mas seu cerne é física simples. Este manual desconstrói as fases de rotação, focando em manter a lombar chapada no solo, o uso do gancho de De La Riva profundo para forçar a rotação externa do joelho do oponente e as rotas ótimas de subida para as costas sem forçar as articulações do praticante.",
                category: "Tutorial",
                date: getRelativeDateString(2),
                imageUrl: "https://images.unsplash.com/photo-1552072092-2f9b132a7785?q=80&w=800&auto=format&fit=crop",
                imageCredit: "Arte/Visual IA OSS.OS (Fallback)",
                imageSourceUrl: "https://unsplash.com"
              },
              {
                title: "Gestão de Elite: A Economia Oculta por Trás das Redes Premium de Jiu-Jitsu",
                excerpt: "De academias de garagem a franquias de alto padrão em Londres e Dubai: os números da profissionalização do esporte.",
                content: "O mercado de Jiu-Jitsu em 2026 completou sua transição executiva. O modelo antigo de cobrança informal e tatames desgastados deu lugar a franquias com padrão de atendimento internacional, arquitetura escandinava de alta higiene e metodologias corporativas de fidelização. Academias em polos financeiros como Tóquio e NY operam hoje sob rigorosos planos de carreira e bônus de performance para faixas pretas dedicados, redesenhando a economia do Jiu-Jitsu profissional global.",
                category: "Lifestyle",
                date: getRelativeDateString(4),
                imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=800&auto=format&fit=crop",
                imageCredit: "Arte/Visual IA OSS.OS (Fallback)",
                imageSourceUrl: "https://unsplash.com"
              },
              {
                title: "Manual do Guerreiro: A Alquimia da Pressão e o Crescimento Invisível",
                excerpt: "Como o desconforto agudo nos treinos reconstrói a mente de um verdadeiro faixa preta para lidar com o caos corporativo.",
                content: "A pressão é uma força física no tatame, mas é uma força psicológica fora dele. A filosofia estoica nos ensina que o obstáculo é o caminho. Quando você está sob o Cem Quilos de um adversário pesado, desesperar-se apenas acelera sua asfixia. O caminho suave exige calma sob pressão, respiração compassada e micro-movimentos milimétricos. Fora do tatame, no turbilhão dos negócios de Maio de 2026, a mesma regra é soberana. O verdadeiro guerreiro acolhe a pressão como uma forja de caráter, transformando a adversidade em pura sabedoria tática.",
                category: "Podcast",
                date: getRelativeDateString(0),
                imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=800&auto=format&fit=crop",
                imageCredit: "Arte/Visual IA OSS.OS (Fallback Estóico)",
                imageSourceUrl: "https://unsplash.com"
              }
            ];
          } else {
            news = [
              {
                title: "A Teoria dos 60 Segundos Finais: Como Pontuar Sob Extrema Pressão de Relógio",
                excerpt: "Masterclass tática sobre gestão estratégica de tempo, vantagens e controle das pegadas de bloqueio no Jiu-Jitsu esportivo.",
                content: "Nas finais de grandes torneios, combates são comumente decididos por vantagens nos últimos momentos. Vencer o cronômetro exige precisão milimétrica: induzir o oponente ao erro sem ser punido por falta de combatividade. Este estudo técnico demonstra como estabelecer pegadas dominantes na gola e quadril para congelar a iniciativa do passador ou armar raspagens cirúrgicas no soar do gongo.",
                category: "News",
                date: getRelativeDateString(0),
                imageUrl: bjjHeroBanner,
                imageCredit: "Arte/Visual IA OSS.OS",
                imageSourceUrl: "https://unsplash.com"
              },
              {
                title: "Guia Técnico: Transição Secreta de Meia Guarda para Leg Lock",
                excerpt: "Aprenda o sistema invisível de alavanca de joelho no bloqueio de escudo partindo da guarda Z.",
                content: "Quando o passador de pressão tenta chapar seu escudo na guarda Z, ele expõe a linha de centralidade do joelho dele. Usando uma pegada interna na coxa oposta e deslizando o quadril para baixo do centro de gravidade, você establishes a transição direta para a chave de calcanhar interna em menos de dois segundos de combate técnico.",
                category: "Tutorial",
                date: getRelativeDateString(1),
                imageUrl: bjjActionGrappling,
                imageCredit: "Arte/Visual IA OSS.OS",
                imageSourceUrl: "https://unsplash.com"
              },
              {
                title: "O Nômade Digital da Faixa Preta: A Rota dos Seminários Globais",
                excerpt: "Como instrutores de alta performance utilizam mídias sociais e conexões aéreas para viver do esporte sem fronteiras.",
                content: "Viajar o mundo ensinando BJJ tornou-se um dos caminhos profissionais mais cobiçados da nova geração. Conectando plataformas de conteúdo técnico pago a um calendário logístico de seminários semanais de Tóquio a Buenos Aires, atletas independentes faturam e espalham a doutrina dos tatames nacionais, conquistando patrocínios internacionais e independência executiva sem estarem presos a uma única sede física.",
                category: "Lifestyle",
                date: getRelativeDateString(3),
                imageUrl: bjjKimonoDetail,
                imageCredit: "Arte/Visual IA OSS.OS",
                imageSourceUrl: "https://unsplash.com"
              },
              {
                title: "Manual do Guerreiro: A Cura Silenciosa da Mente Afastada",
                excerpt: "Enfrentando o silêncio da lesão com resiliência estoica e análise tática aprofundada.",
                content: "Estar lesionado é o maior teste psicológico para o guerreiro do tatame. Quando o corpo falha, o ego se debate no silêncio do banco de reservas. Marco Aurélio nos instrui a usar cada barreira como combustível. O afastamento físico do tatame não é um ano sabático; é o período dourado da inteligência tática. Estude gravações dos seus oponentes, assista às dinâmicas invisíveis dos mestres, instrua os iniciantes e fortaleça a mente de aço. O tatame não reside apenas na lona, ele reside na sua disciplina diária.",
                category: "Podcast",
                date: getRelativeDateString(0),
                imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop",
                imageCredit: "Arte/Visual IA OSS.OS (Fallback Estóico)",
                imageSourceUrl: "https://unsplash.com"
              }
            ];
          }
        }
      }

      const newPosts: BlogPost[] = [];

      for (let i = 0; i < news.length; i++) {
        const n = news[i];
        
        // Final sanity check for non-BJJ content from scout
        const credit = (n.imageCredit || "").toUpperCase();
        const title = (n.title || "").toUpperCase();
        const content = (n.content || "").toUpperCase();
        
        // Skip entirely if it looks like fitness/yoga/wikipedia-commons
        if (credit.includes('WIKIPEDIA') || credit.includes('COMMONS') || 
            title.includes('FITNESS') || title.includes('YOGA') || title.includes('MUSCULAÇÃO') ||
            content.includes('EXERCÍCIO') && !content.includes('JIU-JITSU')) {
          continue;
        }

        // Add a delay between requests to avoid rate limits
        if (i > 0) await sleep(2000);

        const post: BlogPost = {
          id: Math.random().toString(36).substr(2, 9),
          title: n.title,
          excerpt: n.excerpt,
          content: n.content,
          category: (n.category as any) || 'News',
          author: 'Redação OSS.OS',
          date: n.date || new Date().toISOString().split('T')[0],
          imageUrl: n.imageUrl || 'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=800&auto=format&fit=crop',
          imageCredit: n.imageCredit,
          imageSourceUrl: n.imageSourceUrl,
          hasAudio: false
        };

        // Always generate audios specifically for category 'Podcast'
        const shouldGenAudio = post.category === 'Podcast';
        
        if (shouldGenAudio) {
          try {
            const audioUrl = await handleGeneratePodcast(post);
            post.audioUrl = audioUrl;
            post.hasAudio = true;
          } catch (e) {
            console.info("[TTS Info] Auto-podcast using browser synthesis fallback:", e instanceof Error ? e.message : e);
            post.useSpeechSynthesis = true;
            post.hasAudio = true;
          }
        }
        
        newPosts.push(post);
      }

      setBlogPosts(prev => {
        const existingTitles = new Set(prev.map(p => p.title.toLowerCase().trim()));
        const uniqueNewPosts = newPosts.filter(p => !existingTitles.has(p.title.toLowerCase().trim()));
        const updated = [...uniqueNewPosts, ...prev];
        localStorage.setItem('oss_blog_posts_final_technical_v6_reborn', JSON.stringify(updated.map(({ audioUrl, ...rest }) => rest)));
        return updated;
      });
      setLastScoutDate(new Date().toDateString());
      
      if (!auto) addToast("Notícias e Podcast atualizados com sucesso via IA!", "success");
    } catch (error) {
      console.error(error);
      if (!auto) addToast("Erro ao atualizar o feed de IA.", "error");
    } finally {
      setIsScouting(false);
    }
  };

  const genders = ['Masculino', 'Feminino', 'Unissex', 'Infantil'];

  const handleUpdateAffiliateUrl = (productId: string) => {
    const newUrl = editingUrls[productId];
    if (newUrl === undefined) return;

    // Basic URL validation
    try {
      new URL(newUrl);
    } catch (e) {
      addToast('Por favor, insira uma URL válida (ex: https://exemplo.com)', 'error');
      return;
    }

    setProductList(prev => prev.map(p => 
      p.id === productId ? { ...p, affiliateUrl: newUrl } : p
    ));
  };

  const handleUrlChange = (productId: string, value: string) => {
    setEditingUrls(prev => ({ ...prev, [productId]: value }));
  };

  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const toggleWishlist = async (productId: string) => {
    if (wishlist.has(productId)) {
      setProductToRemoveFromWishlist(productId);
    } else {
      if (user) {
        const wishlistDocPath = `users/${user.uid}/wishlist/${productId}`;
        try {
          await setDoc(doc(db, wishlistDocPath), {
            addedAt: Timestamp.now()
          });
          const product = productList.find(p => p.id === productId);
          addToast(`${product?.title || 'Produto'} salvo nos favoritos!`, 'success', <Heart size={14} className="text-red-500 fill-red-500" />);
          
          // Check notification permissions so user is informed about promo alerts
          if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'denied') {
              addToast("Notificações bloqueadas: Desbloqueie no navegador para receber alertas de desconto neste item.", "info", <BellOff size={14} className="text-amber-500" />);
            } else if (Notification.permission === 'default') {
              setTimeout(() => {
                setIsNotificationOnboardingOpen(true);
              }, 800);
            }
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, wishlistDocPath);
        }
      } else {
        setWishlist(prev => {
          const next = new Set(prev);
          next.add(productId);
          return next;
        });
        const product = productList.find(p => p.id === productId);
        addToast(`${product?.title || 'Produto'} adicionado aos favoritos`, 'success', <Heart size={14} className="text-red-500 fill-red-500" />);
        
        // Check notification permissions for non-logged-in user
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'denied') {
            addToast("Notificações bloqueadas: Desbloqueie no navegador para receber alertas de desconto neste item.", "info", <BellOff size={14} className="text-amber-500" />);
          } else if (Notification.permission === 'default') {
            setTimeout(() => {
              setIsNotificationOnboardingOpen(true);
            }, 800);
          }
        }
      }
    }
  };

  const confirmRemoveFromWishlist = async () => {
    if (productToRemoveFromWishlist) {
      if (user) {
        const wishlistDocPath = `users/${user.uid}/wishlist/${productToRemoveFromWishlist}`;
        try {
          await deleteDoc(doc(db, wishlistDocPath));
          addToast("Removido dos favoritos", 'info');
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, wishlistDocPath);
        }
      } else {
        setWishlist(prev => {
          const next = new Set(prev);
          next.delete(productToRemoveFromWishlist);
          return next;
        });
        setWishlistAlerts(prev => {
          const next = new Set(prev);
          next.delete(productToRemoveFromWishlist);
          return next;
        });
        addToast("Removido dos favoritos", 'info');
      }
      setProductToRemoveFromWishlist(null);
    }
  };

  const togglePriceAlert = async (productId: string) => {
    if (!user) {
      addToast("Apenas usuários logados podem ativar alertas de preço.", "info");
      return;
    }

    const isCurrentlyAlerted = wishlistAlerts.has(productId);
    const wishlistDocPath = `users/${user.uid}/wishlist/${productId}`;

    // If enabling alert, check browser notification permission
    if (!isCurrentlyAlerted && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'denied') {
        addToast("Notificações bloqueadas no navegador. Redirecionando para instruções de desbloqueio...", "error", <BellOff size={14} className="text-red-500" />);
        setNotificationModalInitialTab('guide');
        setIsNotificationModalOpen(true);
      } else if (Notification.permission === 'default') {
        await handleRequestNotificationPermission(false);
      }
    }

    try {
      const product = productList.find(p => p.id === productId);
      await updateDoc(doc(db, wishlistDocPath), {
        alertEnabled: !isCurrentlyAlerted,
        targetPrice: product?.price || 0
      });
      
      if (!isCurrentlyAlerted) {
        addToast("Alerta de baixa de preço ativado!", "success", <Bell size={14} className="text-green-500" />);
        playClickSound();
      } else {
        addToast("Alerta de preço desativado.", "info");
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, wishlistDocPath);
    }
  };

  const handleShareProduct = (productId: string) => {
    const product = productList.find(p => p.id === productId);
    if (!product) return;
    
    setSocialShareProduct(product);
    setIsSocialShareModalOpen(true);

    // Share our local dynamic routing product page URL so that previews (Open Graph metadata) are loaded correctly.
    // When clickers open the link, our React client loads the correct detailed modal view.
    const shareUrl = `${window.location.origin}/?product=${product.id}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setShareFeedback(productId);
        addToast('Link copiado e opções de redes sociais abertas!', 'success', <LinkIcon size={14} />);
        setTimeout(() => setShareFeedback(null), 2000);
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }
  };

  const wishlistProducts = useMemo(() => {
    return productList.filter(p => wishlist.has(p.id));
  }, [productList, wishlist]);

  const handleAdminAuth = () => {
    if (adminPassword === "oss123") {
      setIsAdminAuthenticated(true);
      addToast("Autenticado como Mestre com sucesso!", "success");
    } else {
      addToast("Senha incorreta. Ooss!", "error");
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-white dark:bg-black font-sans text-black dark:text-white antialiased transition-colors duration-300 pb-[env(safe-area-inset-bottom)]">
      {/* Advanced Dynamic SEO & Schema.org JSON-LD Manager (100% Free Organic Engine) */}
      <SEOHead
        currentView={view}
        selectedProduct={typeof selectedProductForSeo === 'object' ? selectedProductForSeo : (selectedGalleryProduct || selectedCheckoutProduct || undefined)}
        selectedCategory={selectedCategory !== 'all' ? selectedCategory : undefined}
        searchQuery={searchQuery || undefined}
        products={productList}
      />

      {/* Noise Overlay for premium texture */}
      <div className="noise-overlay" />

      {/* Desktop Sidebar Navigation */}
      <aside 
        className={`hidden lg:flex fixed top-0 left-0 bottom-0 ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-900 flex-col z-[50] overflow-y-auto transition-[width] duration-300 ease-in-out`} 
        id="desktop-sidebar-nav"
        style={{ transition: 'width 0.3s ease-in-out' }}
      >
        {/* Header */}
        <div 
          id="desktop-sidebar-header"
          className={`border-b border-zinc-100 dark:border-zinc-900 flex ${
            isSidebarCollapsed 
              ? 'px-4 py-4 flex-col items-center gap-4' 
              : 'px-7 py-5 items-center justify-between gap-3'
          } bg-zinc-50 dark:bg-zinc-900/40 transition-all duration-300`}
        >
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full' : 'gap-3.5 pl-1'}`}>
            <OssLogo size="sm" className="text-black dark:text-white shrink-0" />
            {!isSidebarCollapsed && (
              <div className="flex flex-col">
                <span className="text-[8px] font-mono font-black text-green-600 uppercase tracking-widest leading-none">System // v3.0</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-zinc-400 hover:text-black dark:hover:text-white p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            title={isSidebarCollapsed ? "Expandir Menu" : "Recolher Menu"}
          >
            <ChevronLeft 
              size={14} 
              className={`transition-transform duration-300 ease-in-out transform ${
                isSidebarCollapsed ? 'rotate-180' : 'rotate-0'
              }`} 
            />
          </button>
        </div>

        {/* User Block */}
        <div className={`py-4 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/20 transition-all duration-300 ${isSidebarCollapsed ? 'px-2 flex flex-col items-center gap-3' : 'px-6'}`}>
          {isAuthLoading ? (
            isSidebarCollapsed ? (
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            ) : (
              <div className="flex items-center gap-2.5 animate-pulse w-full">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-800 w-16 rounded" />
                  <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 w-24 rounded" />
                </div>
              </div>
            )
          ) : user ? (
            isSidebarCollapsed ? (
              <div className="flex flex-col items-center gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => handleNavigate('SETTINGS')}
                      className="relative focus:outline-none"
                    >
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                          <User size={14} className="text-zinc-400" />
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-black text-white border-zinc-800 rounded-none px-3 py-1.5 text-[10px] font-black uppercase tracking-widest z-[100]">
                    <div className="flex flex-col text-left">
                      <span>{user.displayName || 'Guerreiro'}</span>
                      <span className="text-[7px] font-mono text-zinc-400 font-normal normal-case mt-0.5">{user.email}</span>
                    </div>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={enterAthleteFocusMode}
                      className="w-7 h-7 rounded-none bg-green-600 hover:bg-green-500 text-white flex items-center justify-center border-none transition-all shadow-md mt-1 animate-pulse"
                    >
                      <Zap size={11} fill="currentColor" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-black text-white border-zinc-850 rounded-none px-3 py-1.5 text-[10px] font-black uppercase tracking-widest z-[100]">
                    Ativar Modo Foco
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-850" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                        <User size={14} className="text-zinc-400" />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-widest text-black dark:text-white truncate max-w-[100px]">{user.displayName || 'Guerreiro'}</span>
                      <span className="text-[7px] font-mono text-zinc-400 truncate max-w-[100px]">{user.email}</span>
                    </div>
                  </div>
                  <button onClick={handleSignOut} className="text-[8px] font-black uppercase tracking-widest text-red-600 hover:opacity-75 shrink-0">Sair</button>
                </div>
                
                <Button 
                  onClick={enterAthleteFocusMode}
                  className="w-full bg-green-600 hover:bg-green-500 text-white rounded-none font-sans font-black uppercase tracking-widest text-[8px] py-2.5 h-auto border-none flex items-center justify-center gap-1.5 animate-pulse shadow-md"
                >
                  <Zap size={10} /> Ativar Modo Foco
                </Button>
              </div>
            )
          ) : (
            isSidebarCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={handleSignIn}
                    className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center rounded-none shadow-sm hover:opacity-80 transition-opacity"
                  >
                    <User size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-black text-white border-zinc-800 rounded-none px-3 py-1.5 text-[10px] font-black uppercase tracking-widest z-[100]">
                  Fazer Login
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button 
                onClick={handleSignIn}
                className="w-full bg-black dark:bg-white text-white dark:text-black rounded-none text-[8px] font-black uppercase tracking-widest py-4 h-auto"
              >
                Fazer Login
              </Button>
            )
          )}
        </div>

        {/* Quick Search inside Sidebar */}
        {(() => {
          const rawNavItems = [
            { label: t('nav.home'), value: 'LANDING', icon: Home, keywords: 'início home tatame landing' },
            { label: t('nav.shop'), value: 'SHOP', icon: ShoppingCart, keywords: 'loja produtos kimonos faixas compras vitrine' },
            { label: 'Alertas de Ofertas', value: 'NOTIFICATIONS', icon: BellRing, isNew: true, keywords: 'alertas ofertas notificações preço desconto email categorias' },
            { label: t('landing.compare_prices', { defaultValue: 'Comparar Preços' }), value: 'COMPARATOR', icon: Scale, isNew: true, keywords: 'preços comparar multiloja cotação economia' },
            { label: t('nav.blog', { defaultValue: 'Notícias' }), value: 'BLOG', icon: Newspaper, isNew: true, keywords: 'blog notícias artigos posts novidades técnicas' },
            { label: t('nav.podcast', { defaultValue: 'Podcast' }), value: 'PODCAST', icon: Mic, isNew: true, keywords: 'podcast episódios áudio bate-papo entrevistas' },
            { label: t('nav.wishlist'), value: 'WISHLIST', icon: Heart, count: wishlist.size, keywords: 'favoritos desejos lista salvos' },
            { label: t('nav.transparency', { defaultValue: 'Transparência 10%' }), value: 'TRANSPARENCY', icon: Award, keywords: 'transparência social doações 10% impacto' },
            { label: t('nav.profile'), value: 'SETTINGS', icon: Settings, keywords: 'configurações perfil conta ajustes idioma tema' },
          ];

          const filteredNavItems = rawNavItems.filter((item) => {
            if (!sidebarNavSearch.trim()) return true;
            const q = sidebarNavSearch.toLowerCase().trim();
            return (
              item.label.toLowerCase().includes(q) ||
              item.value.toLowerCase().includes(q) ||
              item.keywords.toLowerCase().includes(q)
            );
          });

          return (
            <>
              {!isSidebarCollapsed ? (
                <div className="px-4 pt-4 pb-2 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/40 dark:bg-zinc-900/20">
                  <div className="relative flex items-center">
                    <Search size={12} className="absolute left-2.5 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                    <input
                      type="text"
                      value={sidebarNavSearch}
                      onChange={(e) => setSidebarNavSearch(e.target.value)}
                      placeholder="BUSCAR NO MENU..."
                      className={`w-full bg-white dark:bg-black/60 border border-zinc-200 dark:border-zinc-800 text-[8.5px] font-mono font-bold uppercase tracking-wider pl-7 ${sidebarNavSearch ? 'pr-14' : 'pr-7'} py-2 text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-green-600 dark:focus:border-green-500 transition-colors shadow-inner`}
                      id="sidebar-quick-search-input"
                    />
                    {sidebarNavSearch ? (
                      <>
                        {/* Live Results Counter Badge - Only rendered when count > 0, clickable to filter/open results */}
                        <AnimatePresence mode="wait">
                          {filteredNavItems.length > 0 && (
                            <motion.button
                              type="button"
                              id="sidebar-search-counter-badge"
                              initial={{ opacity: 0, scale: 0.85, y: 8 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.85, y: -8 }}
                              transition={{
                                opacity: { duration: 0.4, ease: "easeOut", delay: 0.5 },
                                y: { type: "spring", stiffness: 350, damping: 25, mass: 0.5, delay: 0.5 },
                                scale: { type: "spring", stiffness: 350, damping: 25, mass: 0.5, delay: 0.5 },
                                delay: 0.5
                              }}
                              onClick={() => {
                                playClickSound();
                                setSearchQuery(sidebarNavSearch);
                                if (filteredNavItems.length === 1) {
                                  handleNavigate(filteredNavItems[0].value as View);
                                } else {
                                  if (view !== 'SHOP') {
                                    handleNavigate('SHOP');
                                  }
                                  setIsAdvancedSearchOpen(true);
                                }
                                const catalogEl = document.getElementById('shop-section') || document.getElementById('products-section') || document.getElementById('catalog-grid');
                                catalogEl?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className={`absolute right-6 top-1/2 -mt-[9.5px] text-[7.5px] font-mono font-black px-1.5 py-0.5 border select-none transition-all cursor-pointer bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/40 hover:scale-110 active:scale-95 shadow-[0_0_8px_rgba(34,197,94,0.35),0_0_2px_rgba(34,197,94,0.5)] dark:shadow-[0_0_10px_rgba(34,197,94,0.45),0_0_3px_rgba(34,197,94,0.65)] hover:shadow-[0_0_12px_rgba(34,197,94,0.6)] ${
                                isSearchBadgePulsing ? 'animate-pulse ring-1 ring-green-500/50' : ''
                              }`}
                              title={`Clique para filtrar o catálogo principal por "${sidebarNavSearch}" (${filteredNavItems.length} encontrado${filteredNavItems.length === 1 ? '' : 's'})`}
                              aria-label={`Filtrar catálogo por ${sidebarNavSearch}, ${filteredNavItems.length} seções encontradas`}
                            >
                              <AnimatePresence mode="popLayout" initial={false}>
                                <motion.span
                                  key={filteredNavItems.length}
                                  initial={{ y: -5, opacity: 0, scale: 0.75 }}
                                  animate={{ y: 0, opacity: 1, scale: 1 }}
                                  exit={{ y: 5, opacity: 0, scale: 0.75 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                  className="inline-block leading-none font-mono font-black"
                                >
                                  {filteredNavItems.length}
                                </motion.span>
                              </AnimatePresence>
                            </motion.button>
                          )}
                        </AnimatePresence>
                        <button
                          type="button"
                          onClick={() => setSidebarNavSearch('')}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer z-10"
                          title="Limpar busca"
                        >
                          <X size={11} />
                        </button>
                      </>
                    ) : (
                      <span className="absolute right-2 text-[7.5px] font-mono text-zinc-350 dark:text-zinc-650 select-none">
                        /
                      </span>
                    )}
                  </div>
                  {sidebarNavSearch.trim() && (
                    <div className="flex items-center justify-between mt-1.5 px-0.5 text-[7px] font-mono uppercase">
                      <span className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                        <span className={`w-1 h-1 rounded-full ${filteredNavItems.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        // {filteredNavItems.length} {filteredNavItems.length === 1 ? 'SEÇÃO ENCONTRADA' : 'SEÇÕES ENCONTRADAS'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSidebarNavSearch('')}
                        className="text-zinc-400 hover:text-red-500 transition-colors underline cursor-pointer font-bold"
                      >
                        LIMPAR
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-2 pt-3 pb-2 border-b border-zinc-100 dark:border-zinc-900 flex justify-center relative">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSidebarCollapsed(false);
                          setTimeout(() => {
                            document.getElementById('sidebar-quick-search-input')?.focus();
                          }, 100);
                        }}
                        className={`p-2 rounded-none border transition-colors flex items-center justify-center cursor-pointer relative ${
                          sidebarNavSearch 
                            ? 'bg-green-500/10 border-green-500 text-green-600' 
                            : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white'
                        }`}
                        title="Buscar no menu"
                      >
                        <Search size={13} />
                        {sidebarNavSearch && (
                          <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[7px] font-mono font-black px-1 py-0.2 rounded-none">
                            {filteredNavItems.length}
                          </span>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-black text-white border-zinc-800 rounded-none px-3 py-1.5 text-[10px] font-black uppercase tracking-widest z-[100]">
                      Buscar no menu {sidebarNavSearch ? `("${sidebarNavSearch}" • ${filteredNavItems.length} encontrados)` : ''}
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}

              {/* Navigation Items */}
              <nav className={`flex-1 py-4 space-y-1 transition-all duration-300 ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}>
                {filteredNavItems.length === 0 ? (
                  <div className="py-8 px-2 text-center space-y-3">
                    <div className="w-8 h-8 mx-auto bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none flex items-center justify-center text-zinc-400">
                      <Search size={14} />
                    </div>
                    <div>
                      <p className="text-[8px] font-mono font-black uppercase text-zinc-400 tracking-wider">
                        // NENHUM RESULTADO
                      </p>
                      <p className="text-[8px] text-zinc-500 font-sans mt-0.5">
                        Nenhuma seção encontrada para "{sidebarNavSearch}"
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSidebarNavSearch('')}
                      className="text-[7.5px] font-mono font-black uppercase text-green-600 hover:text-green-500 bg-green-500/10 px-2 py-1 border border-green-500/20 hover:border-green-500/40 transition-all cursor-pointer"
                    >
                      Limpar busca
                    </button>
                  </div>
                ) : (
                  filteredNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = view === item.value;
                    const buttonContent = (
                      <button
                        key={item.value}
                        onClick={() => handleNavigate(item.value as View)}
                        className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between p-3'} transition-all duration-200 transform hover:scale-105 origin-center rounded-none border-b border-zinc-50/50 dark:border-zinc-900/50 last:border-b-0 cursor-pointer relative z-0 hover:z-10 ${
                          isActive 
                            ? 'active-nav-item bg-black text-white dark:bg-white dark:text-black border-l-4 border-l-green-600 dark:border-l-green-500 shadow-[inset_0_0_12px_rgba(34,197,94,0.18),0_2px_8px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_0_14px_rgba(34,197,94,0.22),0_2px_10px_rgba(0,0,0,0.25)] font-black' 
                            : 'border-l-4 border-l-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 hover:text-black dark:hover:text-white'
                        }`}
                        id={`desktop-sidebar-btn-${item.value}`}
                      >
                        {/* Internal active left glow line */}
                        {isActive && (
                          <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-green-500 shadow-[0_0_10px_#22c55e]" />
                        )}
                        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                          <Icon size={16} className={isActive ? 'text-green-500 dark:text-green-600' : 'text-zinc-400'} />
                          {!isSidebarCollapsed && (
                            <span className="text-[9px] font-black uppercase tracking-wider">{item.label}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {!isSidebarCollapsed && item.isNew && (
                            <span className={`text-[7px] font-mono font-black uppercase px-1.5 py-0.5 rounded-none tracking-widest flex items-center gap-1 shadow-sm transition-colors ${
                              isActive 
                                ? 'bg-green-500 text-black font-black' 
                                : 'bg-green-600/15 dark:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30'
                            }`}>
                              <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                              NOVO
                            </span>
                          )}
                          {!isSidebarCollapsed && item.count !== undefined && item.count > 0 && (
                            <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded-sm ${isActive ? 'bg-white text-black' : 'bg-red-650 text-white'}`}>
                              {item.count}
                            </span>
                          )}
                        </div>

                        {isSidebarCollapsed && item.isNew && (!item.count || item.count === 0) && (
                          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                        )}
                        {isSidebarCollapsed && item.count !== undefined && item.count > 0 && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-red-650 rounded-full border border-white dark:border-zinc-950"></span>
                        )}
                      </button>
                    );

                    if (isSidebarCollapsed) {
                      return (
                        <React.Fragment key={item.value}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {buttonContent}
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-black text-white border-zinc-800 rounded-none px-3 py-1.5 text-[10px] font-black uppercase tracking-widest z-[100]">
                              {item.label} {item.isNew ? '• NOVO' : ''} {item.count !== undefined && item.count > 0 ? `(${item.count})` : ''}
                            </TooltipContent>
                          </Tooltip>
                        </React.Fragment>
                      );
                    }

                    return buttonContent;
                  })
                )}
              </nav>
            </>
          );
        })()}

        {/* Language Selector in Desktop Sidebar */}
        <div className={`p-4 border-t border-zinc-100 dark:border-zinc-900 transition-all duration-300 ${isSidebarCollapsed ? 'px-2 flex justify-center' : 'px-6'}`}>
          {isSidebarCollapsed ? (
            <LanguageSelector variant="compact" />
          ) : (
            <div className="space-y-1.5 w-full">
              <span className="text-[8px] font-mono font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                // {t('common.select_language', { defaultValue: 'IDIOMA' })}
              </span>
              <LanguageSelector variant="sidebar" />
            </div>
          )}
        </div>

        {/* Tour/Ajuda button at the bottom of sidebar */}
        <div className={`p-4 border-t border-zinc-100 dark:border-zinc-900 transition-all duration-300 ${isSidebarCollapsed ? 'px-2 flex justify-center' : 'px-6'}`}>
          {isSidebarCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => window.dispatchEvent(new Event('start-onboarding-tour'))}
                  className="w-10 h-10 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white flex items-center justify-center rounded-none shadow-sm transition-colors"
                >
                  <Info size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-black text-white border-zinc-800 rounded-none px-3 py-1.5 text-[10px] font-black uppercase tracking-widest z-[100]">
                Tour Interativo
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              onClick={() => window.dispatchEvent(new Event('start-onboarding-tour'))}
              className="w-full bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white rounded-none text-[8px] font-black uppercase tracking-widest py-3 h-auto flex items-center justify-center gap-1.5"
            >
              <Info size={10} /> Iniciar Tour Interativo
            </Button>
          )}
        </div>

        {/* Social / Decors at bottom */}
        <div className={`border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/40 transition-all duration-300 ${isSidebarCollapsed ? 'p-3 flex justify-center' : 'p-6'}`}>
          {isSidebarCollapsed ? (
            <p className="text-[7px] text-zinc-400 font-mono text-center uppercase tracking-widest font-black">
              OSS
            </p>
          ) : (
            <p className="text-[7px] text-zinc-400 font-mono text-center uppercase tracking-widest leading-relaxed">
              © 2026 OSS.OS SYSTEM <br />
              Professional BJJ Gear
            </p>
          )}
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-zinc-950 border-r-2 border-black dark:border-white z-[75] flex flex-col lg:hidden shadow-2xl overflow-y-auto"
            >
              <div className="p-4 border-b-2 border-black dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40">
                <div className="flex items-center gap-2">
                  <OssLogo size="sm" className="text-black dark:text-white" />
                  <span className="text-[8px] font-mono font-black text-green-600 uppercase tracking-widest">
                    SYSTEM // MOBILE
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-zinc-500 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-800 rounded transition-colors"
                  title="Fechar Menu"
                >
                  <X size={16} />
                </button>
              </div>

              {/* User Identity or Sign-in Box */}
              <div className="p-4 border-b border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/30">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 border border-black dark:border-white object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
                          <User size={20} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black uppercase text-black dark:text-white truncate">
                          {user.displayName || 'Atleta OSS'}
                        </h4>
                        <p className="text-[9px] font-mono text-zinc-400 truncate">{user.email}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[7.5px] font-mono font-bold px-1.5 py-0.5 bg-green-600 text-white uppercase">
                            {user.role === 'gestor' ? 'DOJO & CT' : user.role === 'lojista' ? 'LOJISTA' : user.role === 'admin' ? 'MASTER' : 'ATLETA'}
                          </span>
                          <span className="text-[7.5px] font-mono text-zinc-500 font-semibold uppercase">
                            {user.belt || 'Faixa Preta'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleNavigate('SETTINGS');
                        }}
                        className="flex-1 bg-black text-white dark:bg-white dark:text-black rounded-none text-[9px] font-black uppercase tracking-wider py-2 h-auto"
                      >
                        Meu Painel HQ
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleSignOut();
                        }}
                        className="rounded-none text-[9px] font-black uppercase text-red-600 hover:text-red-700 py-2 px-3 h-auto border-red-200 dark:border-red-900/40"
                        title="Encerrar Sessão"
                      >
                        <LogOut size={12} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-center py-2">
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Acesse sua conta do tatame</p>
                    <p className="text-[9px] text-zinc-400">Presença diária, pontos, histórico de kimono e campeonatos.</p>
                    <Button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleSignIn('atleta', false);
                      }}
                      className="w-full bg-black text-white dark:bg-white dark:text-black rounded-none text-[9px] font-black uppercase tracking-wider py-2.5 h-auto"
                    >
                      Entrar no Tatame
                    </Button>
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <div className="flex-1 p-3 space-y-1 overflow-y-auto">
                {[
                  { id: 'LANDING', label: t('nav.home', { defaultValue: 'Início' }), icon: <Home size={15} /> },
                  { id: 'SHOP', label: t('nav.shop', { defaultValue: 'Catálogo & Loja' }), icon: <ShoppingBag size={15} /> },
                  { id: 'COMPARATOR', label: t('nav.comparator', { defaultValue: 'Comparador de Preços' }), icon: <Scale size={15} /> },
                  { id: 'WISHLIST', label: `${t('nav.wishlist', { defaultValue: 'Favoritos' })} (${wishlist.size})`, icon: <Heart size={15} className={wishlist.size > 0 ? "fill-red-500 text-red-500" : ""} /> },
                  { id: 'BLOG', label: t('nav.blog', { defaultValue: 'Notícias' }), icon: <Newspaper size={15} /> },
                  { id: 'SETTINGS', label: t('nav.settings', { defaultValue: 'Portal do Atleta' }), icon: <Award size={15} /> },
                  { id: 'ABOUT', label: t('nav.about', { defaultValue: 'Sobre a OSS' }), icon: <Info size={15} /> },
                  { id: 'TRANSPARENCY', label: t('nav.transparency', { defaultValue: 'Transparência 10%' }), icon: <ShieldCheck size={15} /> },
                  { id: 'CONTACT', label: t('nav.contact', { defaultValue: 'Contato' }), icon: <Mail size={15} /> }
                ].map((item) => {
                  const isActive = view === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleNavigate(item.id as any);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold transition-all text-left ${
                        isActive
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <span className={isActive ? 'text-green-500' : 'text-zinc-400'}>{item.icon}</span>
                      <span className="uppercase tracking-wider text-[10.5px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Mobile Drawer Footer with Language and Theme */}
              <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-2.5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span className="font-bold uppercase tracking-wider">{t('common.theme_visual', { defaultValue: 'Tema Visual' })}</span>
                    <span className="text-[8.5px] font-mono text-zinc-400">
                      {themePreference === 'system' ? '06h-18h Claro / 18h-24h Escuro' : 'Manual Fixo'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => handleSelectThemePreference('system')}
                      className={`py-1.5 px-1 border text-[8.5px] font-mono font-bold uppercase transition-all flex flex-col items-center justify-center cursor-pointer ${
                        themePreference === 'system'
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                          : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                      }`}
                      title="Automático pelo horário (06h às 18h Claro / 18h às 24h Escuro)"
                    >
                      <span>Auto</span>
                      <span className="text-[7px] text-green-500 font-black">6h-18h</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectThemePreference('light')}
                      className={`py-1.5 px-1 border text-[8.5px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        themePreference === 'light'
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                          : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                      }`}
                    >
                      <Sun size={10} className="text-amber-500" />
                      <span>Claro</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectThemePreference('dark')}
                      className={`py-1.5 px-1 border text-[8.5px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        themePreference === 'dark'
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                          : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                      }`}
                    >
                      <Moon size={10} className="text-indigo-400" />
                      <span>Escuro</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Language Selector Grid */}
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <LanguageSelector variant="drawer" />
                </div>

                <p className="text-[7.5px] font-mono text-zinc-400 text-center uppercase tracking-widest pt-1">
                  © 2026 OSS.OS SYSTEM // TATAME HQ
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* TopAppBar */}
      <header className={`fixed top-0 z-[60] w-full ${isSidebarCollapsed ? 'lg:left-20 lg:w-[calc(100%-5rem)]' : 'lg:left-64 lg:w-[calc(100%-16rem)]'} border-b border-zinc-200/40 dark:border-zinc-800/60 bg-white/85 dark:bg-black/85 backdrop-blur-2xl px-2 sm:px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between transition-all duration-300 ease-in-out`}>
        <div className="absolute bottom-0 left-0 h-[1px] bg-green-600/30 w-full overflow-hidden">
          <motion.div 
            className="h-full bg-green-500 shadow-[0_0_10px_#22c55e]" 
            style={{ 
              width: `${scrollProgress}%`,
              transition: 'width 0.1s linear'
            }} 
          />
        </div>
        <div className="w-full h-full flex items-center justify-between gap-1 sm:gap-2 md:gap-4 max-w-full min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 h-full">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 sm:w-10 sm:h-10 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:opacity-80 flex items-center justify-center lg:hidden relative shrink-0 cursor-pointer" 
              onClick={() => setIsMobileMenuOpen(true)}
              title="Abrir Menu"
              aria-label="Abrir Menu Lateral"
            >
              <Menu size={19} />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-600 rounded-full border border-white dark:border-black shadow-[0_0_5px_#22c55e]"></span>
              )}
            </motion.button>
            <div className="lg:hidden flex items-center h-full">
              <Tooltip>
                <TooltipTrigger asChild>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigate('LANDING')}
                  className="flex items-center gap-2 group outline-none cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <OssLogo size="sm" className="sm:hidden group-hover:opacity-80 transition-opacity" />
                    <OssLogo size="md" className="hidden sm:flex group-hover:opacity-80 transition-opacity" />
                  </div>
                </motion.button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-black text-white border-zinc-800 rounded-none px-3 py-1.5 text-[10px] font-black uppercase tracking-widest">
                  Diário dos Oss.os
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Unified Global Header Search */}
          <div className="flex-1 min-w-0 max-w-xs md:max-w-sm xl:max-w-md mx-0.5 sm:mx-3 flex items-center justify-end md:justify-start h-full">
            <GlobalHeaderSearch
              productList={productList}
              blogPosts={blogPosts}
              onNavigate={handleNavigate}
              onSelectProduct={(prod) => setSelectedGalleryProduct(prod)}
              onSelectBlogPost={(post) => setSelectedBlogPost(post)}
              onSelectShopCategory={(cat) => setSelectedCategory(cat as any)}
              onSelectBlogCategory={(cat) => setSelectedBlogCategory(cat)}
              onSetShopSearchTerm={(term) => setSearchQuery(term)}
              onSetBlogSearchQuery={(query) => setBlogSearchQuery(query)}
            />
          </div>

          <nav className="hidden xl:flex gap-1.5 items-center h-full">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavigate('SHOP')}
              className={`micro-label px-3 h-9 flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all rounded-none cursor-pointer ${view === 'SHOP' ? 'text-green-600 border-b-2 border-green-600' : 'text-zinc-500'}`}
            >
              <ShoppingBag size={12} className="text-zinc-400" />
              {t('nav.shop')}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavigate('CONTACT')}
              className={`micro-label px-3 h-9 flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all rounded-none cursor-pointer ${view === 'CONTACT' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-zinc-400'}`}
            >
              <Mail size={12} />
              {t('nav.contact')}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavigate('ABOUT')}
              className={`micro-label px-3 h-9 flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all rounded-none cursor-pointer ${view === 'ABOUT' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-zinc-500'}`}
            >
              <Target size={12} />
              {t('nav.about')}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavigate('COMPARATOR')}
              className={`micro-label px-3 h-9 flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all rounded-none cursor-pointer ${view === 'COMPARATOR' ? 'text-green-600 border-b-2 border-green-600 font-black' : 'text-zinc-500'}`}
            >
              <Scale size={12} />
              {t('nav.comparator_short', { defaultValue: 'Comparador' })}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavigate('EXTERNAL_SHOWCASE')}
              className={`micro-label px-3 h-9 flex items-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all rounded-none cursor-pointer ${view === 'EXTERNAL_SHOWCASE' ? 'text-green-600 border-b-2 border-green-600 font-black' : 'text-zinc-600 dark:text-zinc-300'}`}
              title="Visualização Externa / Vitrine para Clientes e Academias"
            >
              <Eye size={12} className="text-green-500" />
              <span>Vitrine Externa</span>
            </motion.button>
          </nav>

          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0 h-full">
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => handleNavigate('EXTERNAL_SHOWCASE')}
               className={`hidden sm:flex h-8 sm:h-9 px-2 sm:px-2.5 items-center gap-1.5 text-[9px] font-mono font-bold uppercase transition-all rounded-none cursor-pointer shrink-0 border ${
                 view === 'EXTERNAL_SHOWCASE'
                   ? 'bg-green-600 text-black border-green-600 shadow-sm'
                   : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
               }`}
               title="Alternar para Visualização Externa (Vitrine Pública)"
               aria-label="Visualização Externa"
             >
               <Eye size={13} className={view === 'EXTERNAL_SHOWCASE' ? 'text-black' : 'text-green-500'} />
               <span className="hidden sm:inline">Vitrine Externa</span>
             </motion.button>
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => {
                 playClickSound();
                 handleNavigate('NOTIFICATIONS');
               }}
               className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center transition-colors rounded-none cursor-pointer relative shrink-0 ${
                 notificationPermission === 'granted'
                   ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30'
                   : notificationPermission === 'denied'
                   ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
                   : 'text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
               }`}
               title={
                 notificationPermission === 'granted'
                   ? "Alertas Ativos — Clique para gerenciar"
                   : notificationPermission === 'denied'
                   ? "Notificações Bloqueadas — Ver como desbloquear"
                   : "Ativar Alertas de Preço"
               }
               aria-label="Alertas e Notificações"
             >
               {notificationPermission === 'granted' ? (
                 <>
                   <Bell size={16} className="text-green-600" />
                   <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-green-500" />
                 </>
               ) : notificationPermission === 'denied' ? (
                 <BellOff size={16} className="text-red-500" />
               ) : (
                 <Bell size={16} />
               )}
             </motion.button>

             {/* Theme Selector (Claro 6h-18h / Escuro 18h-24h e troca manual) */}
             <ThemeSelector 
               themePreference={themePreference} 
               onSelectTheme={handleSelectThemePreference} 
               isDark={isDark} 
             />
             
             <motion.button 
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
               onClick={() => handleNavigate('WISHLIST')}
               className="hidden md:inline-flex relative w-9 h-9 items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors rounded-none group cursor-pointer shrink-0"
               title="Lista de Desejos"
             >
               <motion.div
                 animate={pulseWishlist ? {
                   scale: [1, 1.4, 0.9, 1.15, 1],
                 } : {}}
                 transition={{ duration: 0.6, ease: "easeInOut" }}
                 className="flex items-center justify-center"
               >
                 <Heart 
                   size={17} 
                   className={`transition-all ${wishlist.size > 0 || view === 'WISHLIST' ? 'fill-black dark:fill-white text-black dark:text-white' : 'text-zinc-400 group-hover:text-black dark:group-hover:text-white'}`} 
                 />
               </motion.div>
               {wishlist.size > 0 && (
                 <motion.span 
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   className="absolute top-1 right-1 bg-green-600 text-white text-[7px] min-w-[14px] h-[14px] px-1 flex items-center justify-center rounded-full font-black"
                 >
                   {wishlist.size}
                 </motion.span>
               )}
             </motion.button>

             <motion.button 
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
               className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors rounded-none group cursor-pointer shrink-0"
               id="header-cart-btn" 
               title="Sacola de Compras" 
               onClick={() => { playClickSound(); setIsCartDrawerOpen(true); }}
               aria-label="Sacola de Compras"
             >
               <div className="relative flex items-center justify-center">
                 <motion.div
                   animate={isAddingToCart ? {
                     scale: [1, 1.25, 1.25, 1.25, 1.1, 1],
                     rotate: [0, -20, 20, -20, 20, -10, 10, -5, 5, 0],
                     x: [0, -4, 4, -4, 4, -2, 2, -1, 1, 0],
                     y: [0, -3, 0, -3, 0],
                     filter: [
                       'drop-shadow(0 0 0px rgba(34,197,94,0))',
                       'drop-shadow(0 0 12px rgba(34,197,94,0.8))',
                       'drop-shadow(0 0 0px rgba(34,197,94,0))'
                     ]
                   } : {}}
                   transition={{ duration: 0.6, ease: "easeInOut" }}
                   className="flex items-center justify-center"
                 >
                   <ShoppingCart 
                     size={18} 
                     className={`transition-all ${cartCount > 0 ? 'text-green-600' : 'text-zinc-600 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white'}`} 
                   />
                 </motion.div>

                 <AnimatePresence>
                   {isAddingToCart && (
                     <motion.div
                       initial={{ opacity: 0, y: 0, scale: 0.5 }}
                       animate={{ opacity: [0, 1, 0], y: -30, scale: [0.5, 1.2, 0.8] }}
                       exit={{ opacity: 0 }}
                       transition={{ duration: 0.8, ease: "easeOut" }}
                       className="absolute -top-2 -right-2 pointer-events-none flex items-center justify-center"
                     >
                       <span className="text-[10px] font-black text-green-600 bg-white dark:bg-black rounded-full w-6 h-6 flex items-center justify-center border-2 border-green-600 shadow-[0_0_15px_rgba(34,197,94,0.5)]">+1</span>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
               {cartCount > 0 && (
                 <motion.span 
                   key={cartCount}
                   initial={{ scale: 0, y: -6 }}
                   animate={{ 
                     scale: [0.6, 1.3, 1],
                     y: 0 
                   }}
                   transition={{
                     type: "spring",
                     stiffness: 450,
                     damping: 14
                   }}
                   className="absolute top-0.5 right-0.5 bg-green-600 dark:bg-green-500 text-white text-[7.5px] min-w-[15px] h-[15px] px-1 flex items-center justify-center rounded-full font-black shadow-[0_2px_8px_rgba(34,197,94,0.45)] tabular-nums"
                 >
                   {cartCount}
                 </motion.span>
               )}
             </motion.button>

             {/* Online/Offline Status Indicator */}
             <div 
               className={`hidden lg:flex items-center gap-1.5 px-2.5 h-7 text-[8px] font-mono font-black uppercase tracking-widest shrink-0 ${
                 isOnline 
                 ? "bg-green-500/10 text-green-600 border border-green-500/20" 
                 : "bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse"
               }`}
               title={isOnline ? "Conexão Estabelecida - Portal Online" : "Sem Conexão - Modo Offline Ativo"}
             >
               <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`} />
               <span>{isOnline ? "ONLINE" : "OFFLINE"}</span>
             </div>

             {/* Authenticated User Profile Quick Badge / Action */}
             {user ? (
               <button
                 id="header-user-profile-btn"
                 onClick={() => handleNavigate('SETTINGS')}
                 className="flex items-center justify-center gap-1.5 px-2 sm:px-2.5 h-8 sm:h-9 bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white shadow-[1px_1px_0px_#000000] dark:shadow-[1px_1px_0px_#ffffff] hover:opacity-90 transition-all cursor-pointer shrink-0"
                 title="Meu Painel e Configurações"
                 aria-label="Meu Painel do Atleta"
               >
                 {user.photoURL ? (
                   <img src={user.photoURL} alt={user.displayName || 'Atleta'} className="w-4 h-4 sm:w-5 sm:h-5 rounded-none object-cover border border-white/40" />
                 ) : (
                   <User size={13} />
                 )}
                 <span className="text-[9px] font-mono font-black uppercase tracking-widest hidden sm:inline max-w-[90px] truncate">
                   {user.displayName?.split(' ')[0] || 'Atleta'}
                 </span>
                 <span className="text-[7.5px] font-mono bg-green-600 text-white px-1 py-0.2 uppercase font-bold hidden sm:inline">
                   HQ
                 </span>
               </button>
             ) : (
               <button
                 id="header-login-btn"
                 onClick={() => handleSignIn('atleta', false)}
                 className="flex items-center justify-center gap-1.5 px-2 sm:px-3 h-8 sm:h-9 bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white shadow-[1px_1px_0px_#000000] dark:shadow-[1px_1px_0px_#ffffff] text-[9px] font-mono font-black uppercase tracking-widest hover:opacity-90 transition-all cursor-pointer shrink-0"
                 title="Acessar conta ou se cadastrar"
                 aria-label="Acessar conta ou se cadastrar"
               >
                 <User size={13} />
                 <span className="hidden sm:inline">{t('common.login', { defaultValue: 'ENTRAR' })}</span>
               </button>
             )}

             <div className="hidden sm:flex items-center h-full shrink-0">
               <LanguageSelector />
             </div>
          </div>
        </div>
      </header>

      {/* Quick Access Bar */}
      {view === 'SHOP' && (
        <div className={`fixed top-16 z-40 w-full ${isSidebarCollapsed ? 'lg:left-20 lg:w-[calc(100%-5rem)]' : 'lg:left-64 lg:w-[calc(100%-16rem)]'} bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 h-12 flex items-center overflow-x-auto no-scrollbar px-2.5 sm:px-6 shadow-sm transition-all duration-300 ease-in-out`}>
          <div className="container mx-auto flex items-center gap-1 md:gap-4 min-w-max">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mr-2 border-r border-zinc-200 dark:border-zinc-800 pr-4 h-4 flex items-center">{t('quick_access')}</span>
            {[
              { name: t('categories.All', { defaultValue: 'Todos' }), value: 'All', emoji: '🥋' },
              { name: t('categories.beginners', { defaultValue: 'Iniciantes' }), value: 'Equipamentos para Iniciantes', emoji: '🔰' },
              { name: t('categories.competition', { defaultValue: 'Competição' }), value: 'Roupas de Competição', emoji: '🏆' },
              { name: t('categories.training_accessories', { defaultValue: 'Acessórios' }), value: 'Acessórios de Treino', emoji: '🛡️' },
              { name: t('categories.nutrition', { defaultValue: 'Nutrição' }), value: 'Nutrição Esportiva', emoji: '⚡' },
              { name: t('categories.instructionals', { defaultValue: 'Livros & Técnicas' }), value: 'Livros/DVDs de Técnicas', emoji: '📚' },
              { name: t('categories.Kimonos', { defaultValue: 'Kimonos' }), value: 'Kimonos', emoji: '🥋' },
              { name: t('categories.Rashguards', { defaultValue: 'Rashguards' }), value: 'Rashguards', emoji: '👕' },
              { name: t('categories.Faixas', { defaultValue: 'Faixas' }), value: 'Faixas', emoji: '🎗️' },
              { name: t('categories.Shorts', { defaultValue: 'Bermudas' }), value: 'Bermudas', emoji: '🩳' }
            ].map((cat) => (
              <motion.button
                key={cat.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedCategory(cat.value as any);
                  handleNavigate('SHOP');
                }}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-none transition-all border border-transparent whitespace-nowrap ${
                  selectedCategory === cat.value && view === 'SHOP'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10'
                    : 'text-zinc-500 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-zinc-900'
                }`}
              >
                <span className="text-[10px]">{cat.emoji}</span>
                <span className="text-[10px] font-black uppercase tracking-tighter">{cat.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <main className={`${view === 'SHOP' ? 'pt-[112px]' : 'pt-16'} pb-32 md:pb-24 min-h-screen ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'} transition-all duration-300 ease-in-out overflow-x-hidden`}>
        {/* Banner de Solicitação de Notificações */}
        {notificationPermission !== 'granted' && !isNotificationBannerDismissed && (
          <div className={`border-b px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 transition-all duration-300 ${
            notificationPermission === 'denied'
              ? 'bg-red-950/20 dark:bg-red-950/40 border-red-900/40'
              : 'bg-zinc-100 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-1.5 shrink-0 ${
                notificationPermission === 'denied'
                  ? 'bg-red-500/10 text-red-500'
                  : 'bg-green-500/10 text-green-600'
              }`}>
                {notificationPermission === 'denied' ? (
                  <BellOff size={14} className="text-red-500" />
                ) : (
                  <Bell size={14} className="text-green-600" />
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-left">
                <span className="text-[11px] font-black uppercase tracking-wider text-black dark:text-white">
                  {notificationPermission === 'denied'
                    ? 'Alertas de Preço Bloqueados'
                    : t('notification.price_alert_title', { defaultValue: 'Alertas de Queda de Preço' })}
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                  {notificationPermission === 'denied'
                    ? 'Desbloqueie no navegador para receber avisos de descontos nos seus produtos salvos.'
                    : t('notification.price_alert_desc', { defaultValue: 'Receba avisos instantâneos quando seus produtos favoritados entrarem em promoção.' })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {notificationPermission === 'denied' ? (
                <button 
                  id="btn-enable-notifications"
                  onClick={() => {
                    setNotificationModalInitialTab('guide');
                    setIsNotificationModalOpen(true);
                  }}
                  className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 text-[10px] font-mono font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Desbloquear
                </button>
              ) : (
                <button 
                  id="btn-enable-notifications-direct"
                  onClick={() => handleRequestNotificationPermission()}
                  className="bg-green-600 hover:bg-green-500 text-white px-3.5 py-1.5 text-[10px] font-mono font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {t('notification.enable_btn', { defaultValue: 'Ativar Alertas' })}
                </button>
              )}
              <button 
                onClick={() => {
                  setIsNotificationBannerDismissed(true);
                  localStorage.setItem('oss_notif_banner_dismissed', 'true');
                }}
                className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors p-1.5 cursor-pointer"
                title="Dispensar aviso"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ 
              duration: 0.35, 
              ease: [0.25, 1, 0.5, 1]
            }}
            className="w-full h-full"
          >
            {(view === 'SETTINGS' || view === 'DASHBOARD') && isAuthLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-zinc-200 dark:border-zinc-800" />
                  <div className="absolute inset-0 rounded-full border-4 border-[#cc0000] border-t-transparent animate-spin" />
                </div>
                <p className="text-xs font-mono font-black uppercase tracking-widest text-zinc-400">Verificando Credenciais do Tatame...</p>
              </div>
            ) : view === 'EXTERNAL_SHOWCASE' ? (
              <ExternalShowcaseView
                productList={productList}
                onSelectProduct={(p) => {
                  setSelectedGalleryProduct(p);
                  setIsGalleryOpen(true);
                }}
                onAddToCart={(p) => handleAddToCart(p)}
                onCheckout={(p) => { openCheckoutModal(p); }}
                wishlist={wishlist}
                onToggleWishlist={toggleWishlist}
                onOpenSizeChart={() => setIsExchangeModalOpen(true)}
                onOpenExchangeModal={() => setIsExchangeModalOpen(true)}
                onNavigate={handleNavigate}
                onSignIn={() => handleSignIn('atleta', false)}
                user={user}
                addToast={(msg, type) => addToast(msg, type === 'error' ? 'error' : 'success')}
                playClickSound={playClickSound}
              />
            ) : view === 'NOTIFICATIONS' ? (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 min-h-[85vh]">
                <OfferNotificationsCenter
                  monitoredProducts={productList.filter(p => wishlist.has(p.id))}
                  wishlistAlerts={wishlist}
                  onTogglePriceAlert={toggleWishlist}
                  onSelectProduct={(p) => {
                    setSelectedGalleryProduct(p);
                    setIsGalleryOpen(true);
                  }}
                  onNavigate={(dest) => {
                    if (dest.includes('product=')) {
                      const pId = dest.split('product=')[1];
                      const found = productList.find(x => x.id === pId);
                      if (found) {
                        setSelectedGalleryProduct(found);
                        setIsGalleryOpen(true);
                      }
                    } else {
                      handleNavigate(dest as View);
                    }
                  }}
                  user={user}
                  viewedProductIds={viewedProductIds}
                  productList={productList}
                  addToast={addToast}
                  playClickSound={playClickSound}
                />
              </div>
            ) : view === 'COMPARATOR' ? (
              <PriceComparator onBack={() => handleNavigate('LANDING')} />
            ) : (view === 'SETTINGS' || view === 'DASHBOARD') && user ? (
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-zinc-200 dark:border-zinc-800" />
                    <div className="absolute inset-0 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
                  </div>
                  <p className="text-xs font-mono font-black uppercase tracking-widest text-zinc-400">Carregando painel do atleta...</p>
                </div>
              }>
                <UserDashboard 
                  user={user}
                  onSignOut={handleSignOut}
                  wishlistCount={wishlist.size}
                  reviewsCount={0}
                  alertsCount={wishlistAlerts.size}
                  onNavigate={handleNavigate}
                  loyaltyEnabled={loyaltyEnabled}
                  loyaltyPointsRatio={loyaltyPointsRatio}
                  loyaltyWelcomeBonus={loyaltyWelcomeBonus}
                  loyaltyReviewBonus={loyaltyReviewBonus}
                  loyaltyMinRedeemPoints={loyaltyMinRedeemPoints}
                  loyaltyDiscountValue={loyaltyDiscountValue}
                  initialFocusMode={dashboardFocusMode}
                  onFocusModeChange={setDashboardFocusMode}
                  viewedProductIds={viewedProductIds}
                  productList={productList}
                  wishlistProducts={productList.filter(p => wishlist.has(p.id))}
                  wishlistAlerts={wishlistAlerts}
                  onTogglePriceAlert={togglePriceAlert}
                  onSelectProduct={(p) => {
                    setSelectedGalleryProduct(p);
                    setIsGalleryOpen(true);
                  }}
                  onAddReview={handleAddProductReview}
                  addToast={addToast}
                  playClickSound={playClickSound}
                  userBelt={userBelt}
                  onUpdateUserBelt={updateUserBelt}
                  filterByTechnicalLevel={filterByTechnicalLevel}
                  onToggleFilterByTechnicalLevel={setFilterByTechnicalLevel}
                  themePreference={themePreference}
                  onSelectTheme={handleSelectThemePreference}
                />
              </Suspense>
            ) : (view === 'SETTINGS' || view === 'DASHBOARD') && !isAdminAuthenticated ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-[85vh] pt-32 pb-20 px-4 md:px-6 flex flex-col items-center justify-center"
          >
            <div className="max-w-md w-full bg-white dark:bg-[#0a0a0a] p-8 md:p-10 border border-zinc-200 dark:border-zinc-800 text-center shadow-2xl relative">
              <button 
                onClick={() => handleNavigate('LANDING')}
                className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white transition-colors p-2"
                title="Voltar ao Início"
              >
                <X size={20} />
              </button>

              <div className="w-14 h-14 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <User size={28} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight mb-1 text-black dark:text-white font-headline">PORTAL DO ATLETA</h2>
              <p className="text-zinc-500 text-xs mb-6 font-light">Acesse seus equipamentos favoritados e alertas de preço.</p>
              
              {/* Botões de Autenticação */}
              <div className="space-y-2.5 mb-6 text-left">
                <button
                  type="button"
                  id="btn-settings-oauth-google"
                  onClick={() => handleSignIn('atleta', false)}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                >
                  <GoogleLogoIcon className="w-4 h-4 shrink-0" />
                  <span>Continuar com o Google</span>
                </button>

                <button
                  type="button"
                  id="btn-settings-oauth-apple"
                  onClick={() => handleSignIn('atleta', false)}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-850 dark:hover:bg-zinc-100 border border-black dark:border-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                >
                  <AppleLogoIcon className="w-4 h-4 shrink-0" />
                  <span>Continuar com a Apple</span>
                </button>

                <Button 
                  onClick={() => handleSignIn('atleta', false)}
                  className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-black uppercase py-3.5 rounded-none tracking-widest text-[10px] hover:bg-green-600 dark:hover:bg-green-600 hover:text-white dark:hover:text-white transition-all shadow-sm cursor-pointer"
                >
                  Entrar com E-mail e Senha
                </Button>
              </div>

              {/* Acesso Mestre */}
              <div className="pt-5 border-t border-zinc-200 dark:border-zinc-800 text-left">
                <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 font-headline">Acesso Administrativo</span>
                <div className="flex gap-2">
                  <Input 
                    type="password" 
                    placeholder="Senha de Acesso" 
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="rounded-none border-zinc-300 dark:border-zinc-700 font-bold bg-white dark:bg-black text-center text-xs tracking-widest h-9"
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === 'enter') && handleAdminAuth()}
                  />
                  <Button 
                    onClick={handleAdminAuth}
                    className="bg-black dark:bg-white text-white dark:text-black font-black uppercase px-4 rounded-none tracking-wider text-[9px] hover:bg-green-600 shrink-0 h-9 cursor-pointer"
                  >
                    Acessar
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : view === 'SETTINGS' && isAdminAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen pt-32 pb-20 px-4 md:px-6 flex flex-col items-center"
          >
            <div className="max-w-6xl w-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 p-6 md:p-12">
              <div className="flex flex-col items-center justify-center mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-900 w-full">
                <OssLogo size="lg" className="text-black dark:text-white mb-6" />
                <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
                  <div>
                    <h2 className="text-3xl font-headline font-black uppercase tracking-tighter">Painel do Mestre</h2>
                    <p className="text-zinc-400 text-xs tracking-wider font-mono">CURADORIA DE PRODUTOS & CENTRAL CMS</p>
                  </div>
                  <button 
                    onClick={() => setIsAdminAuthenticated(false)}
                    className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 px-3 py-1.5 border border-red-500/20"
                  >
                    Sair do Painel
                  </button>
                </div>
              </div>

              {/* TABS DE SELEÇÃO */}
              <div className="flex flex-wrap gap-2 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                {[
                  { id: 'products', label: '🥋 Curadoria de Afiliados', desc: 'Equipamentos, Roupas e Kimonos' },
                  { id: 'metrics', label: '📊 Desempenho e Métricas', desc: 'Rendimento dos Links' },
                  { id: 'news', label: '🎙️ Conteúdo (Blog & Podcasts)', desc: 'Posts técnicos de Jiu-Jitsu' },
                  { id: 'scout', label: '🤖 Automação IA Scout', desc: 'Varredura automática' },
                  { id: 'loyalty', label: '🏆 Fidelidade (OSS Points)', desc: 'Regras de pontuação' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id as any)}
                    className={`flex-1 min-w-[150px] p-3 border text-left rounded-none transition-all ${
                      adminTab === tab.id 
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                        : 'bg-zinc-55 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-850 hover:bg-zinc-105 dark:hover:bg-zinc-805'
                    }`}
                  >
                    <span className="block text-xs font-black uppercase tracking-wider">{tab.label}</span>
                    <span className="block text-[9px] font-light opacity-80 truncate">{tab.desc}</span>
                  </button>
                ))}
              </div>

              {/* TAB PRODUTOS */}
              {adminTab === 'products' && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Mercado Livre Quick Importer */}
                  <div className="p-6 border border-zinc-200 dark:border-zinc-805 bg-zinc-55 dark:bg-zinc-955/40 relative">
                    <Badge className="absolute top-3 right-3 bg-blue-600 text-white font-mono text-[7px] uppercase font-black">API Ativa</Badge>
                    <h3 className="text-xs font-black uppercase tracking-widest text-black dark:text-white mb-2">🔌 Importação Automática Mercado Livre</h3>
                    <p className="text-[11px] text-zinc-500 mb-4">Insira o link oficial do produto (ex: kimono, faixa) no Mercado Livre para preencher fotos, preço original e descrição instantaneamente.</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input
                        value={importUrl}
                        onChange={(e) => setImportUrl(e.target.value)}
                        placeholder="Cole a URL do anúncio do Mercado Livre..."
                        className="rounded-none bg-white dark:bg-black border-zinc-300 dark:border-zinc-805 text-xs"
                      />
                      <Button
                        onClick={handleImportML}
                        disabled={isImporting}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase rounded-none tracking-widest px-6 h-10 shrink-0"
                      >
                        {isImporting ? 'Importando...' : 'Importar via API'}
                      </Button>
                    </div>
                  </div>

                  {/* Manual Creation action */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                    <div>
                      <h3 className="font-black uppercase tracking-widest text-sm text-black dark:text-white">Seu Acervo Curado Manualmente</h3>
                      <p className="text-zinc-500 text-xs font-light">Adicione links de afiliado das suas curadorias nos marketplaces para monetizar cliques.</p>
                    </div>
                    <Button
                      onClick={() => handleOpenProductForm(null)}
                      className="bg-black dark:bg-white text-white dark:text-black font-black uppercase text-[10px] tracking-widest px-6 py-4 rounded-none hover:bg-green-605 dark:hover:bg-green-605"
                    >
                      <Plus size={14} className="mr-2" /> Cadastrar Produto Manualmente
                    </Button>
                  </div>

                  {/* Dense list of Curated products for editing / deleting */}
                  <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2 border border-zinc-200 dark:border-zinc-850 p-4 bg-zinc-55/50 dark:bg-zinc-950/20">
                    {productList.map(product => (
                      <div 
                        key={product.id}
                        className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <img 
                            src={product.imageUrl} 
                            alt={product.title} 
                            className="w-12 h-12 object-cover border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-955" 
                          />
                          <div>
                            <span className="inline-block bg-zinc-105 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-808 text-[8px] font-mono px-2 py-0.5 uppercase tracking-wider text-zinc-505 dark:text-zinc-400 mb-1">{product.platform}</span>
                            <h4 className="font-bold text-xs text-black dark:text-white line-clamp-1">{product.title}</h4>
                            <div className="flex gap-3 text-[10px] font-mono font-bold text-zinc-500 mt-0.5">
                              <span>R$ {product.price.toFixed(2)}</span>
                              <span className="text-green-650">Cat: {product.category}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                          <a 
                            href={product.affiliateUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[9px] font-bold uppercase tracking-wider text-green-600 px-3 py-1.5 border border-green-600/20 bg-green-500/5 hover:bg-green-500/10 transition-all"
                          >
                            Link Afiliado ↗
                          </a>
                          <button
                            onClick={() => handleOpenProductForm(product)}
                            className="text-[9px] font-black uppercase text-zinc-650 dark:text-zinc-300 px-3 py-1.5 border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-850"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-[9px] font-black uppercase text-red-500 px-3 py-1.5 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB DESEMPENHO E MÉTRICAS */}
              {adminTab === 'metrics' && (() => {
                const platformMetricsList = Object.entries(platformMetrics) as [string, { clicks: number; conversions: number }][];
                const platformMetricsValues = Object.values(platformMetrics) as { clicks: number; conversions: number }[];
                const productClicksEntries = Object.entries(productClicks) as [string, { title: string; platform: string; clicks: number; conversions: number }][];

                return (
                  <div className="space-y-8 animate-fadeIn text-left">
                    <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
                      <h3 className="font-headline font-black uppercase text-lg tracking-tight text-black dark:text-white flex items-center gap-2">
                        <span>📊 MONITOR DE CONVERSÃO E LEAD PERFORMANCE</span>
                        <span className="bg-green-600 text-white text-[8px] font-mono px-2 py-0.5 rounded-none font-bold">REALTIME</span>
                      </h3>
                      <p className="text-zinc-500 text-xs font-light">Métricas consolidadas de tráfego de saída, cliques em links e taxa de conversão geral calculada por marketplace oficial.</p>
                    </div>

                    {/* Summary Bento Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Total Cliques Card */}
                      <div className="bg-zinc-50 dark:bg-zinc-950 p-5 border border-zinc-200 dark:border-zinc-850 relative overflow-hidden group">
                        <div className="absolute top-2 right-2 text-zinc-200 dark:text-zinc-800/40 pointer-events-none group-hover:scale-110 transition-transform">
                          <Activity size={48} className="stroke-[1px]" />
                        </div>
                        <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-450 mb-1">Cliques Totais (Lead Out)</span>
                        <span className="block text-3xl font-headline font-black tracking-tight text-mono dark:text-white">
                          {platformMetricsValues.reduce((acc, current) => acc + current.clicks, 0).toLocaleString()}
                        </span>
                        <span className="block text-[9px] text-zinc-400 mt-2 flex items-center gap-1 font-mono">
                          <span className="text-green-500 font-bold">&#x2191; 12.4%</span> vs semana anterior
                        </span>
                      </div>

                    {/* Total Conversions Card */}
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-5 border border-zinc-200 dark:border-zinc-850 relative overflow-hidden group">
                      <div className="absolute top-2 right-2 text-zinc-200 dark:text-zinc-800/40 pointer-events-none group-hover:scale-110 transition-transform">
                        <Award size={48} className="stroke-[1px]" />
                      </div>
                      <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-450 mb-1">Conversões Estimadas</span>
                      <span className="block text-3xl font-headline font-black tracking-tight text-mono text-green-600 dark:text-green-400">
                        {platformMetricsValues.reduce((acc, current) => acc + current.conversions, 0).toLocaleString()}
                      </span>
                      <span className="block text-[9px] text-zinc-400 mt-2 flex items-center gap-1 font-mono">
                        <span className="text-green-500 font-bold">&#x2191; 8.1%</span> baseadas em intenção de compra
                      </span>
                    </div>

                    {/* Average Conversion Rate Card */}
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-5 border border-zinc-200 dark:border-zinc-850 relative overflow-hidden group">
                      <div className="absolute top-2 right-2 text-zinc-200 dark:text-zinc-800/40 pointer-events-none group-hover:scale-110 transition-transform">
                        <TrendingUp size={48} className="stroke-[1px]" />
                      </div>
                      <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-450 mb-1">Tx de Conversão Média</span>
                      <span className="block text-3xl font-headline font-black tracking-tight text-mono dark:text-white">
                        {(() => {
                          const cls = platformMetricsValues.reduce((acc, c) => acc + c.clicks, 0);
                          const cvs = platformMetricsValues.reduce((acc, c) => acc + c.conversions, 0);
                          return cls > 0 ? ((cvs / cls) * 100).toFixed(2) : "0.00";
                        })()}%
                      </span>
                      <span className="block text-[9px] text-zinc-400 mt-2 flex items-center gap-1 font-mono">
                        <span className="text-green-500 font-bold">&#x2192; Saudável</span> média recomendada &gt; 8%
                      </span>
                    </div>

                    {/* Top Platform Card */}
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-5 border border-zinc-200 dark:border-zinc-850 relative overflow-hidden group">
                      <div className="absolute top-2 right-2 text-zinc-200 dark:text-zinc-800/40 pointer-events-none group-hover:scale-110 transition-transform">
                        <ShoppingBag size={48} className="stroke-[1px]" />
                      </div>
                      <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-450 mb-1">Melhor Marketplace</span>
                      <span className="block text-2xl font-headline font-black tracking-tight uppercase truncate dark:text-white">
                        {(() => {
                          let topPlat = "Nenhum";
                          let maxClicks = -1;
                          platformMetricsList.forEach(([plat, metrics]) => {
                            if (metrics.clicks > maxClicks) {
                              maxClicks = metrics.clicks;
                              topPlat = plat;
                            }
                          });
                          return topPlat;
                        })()}
                      </span>
                      <span className="block text-[9px] text-zinc-400 mt-3 flex items-center gap-1 font-mono">
                        Líder absoluto de faturamento afiliado
                      </span>
                    </div>
                  </div>

                  {/* Core Table and Visual Statistics */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Platform Performance List */}
                    <div className="lg:col-span-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#060606] p-6 space-y-6">
                      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-black dark:text-white">Comparativo por Marketplace</h4>
                          <p className="text-[10px] text-zinc-500">Filtrado em tempo de execução pelos redirecionamentos de compra do portal.</p>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 animate-pulse">SISTEMA ATIVO</span>
                      </div>

                      <div className="space-y-4">
                        {platformMetricsList
                          .sort((a, b) => b[1].clicks - a[1].clicks)
                          .map(([platform, metrics]) => {
                            const conversionRate = metrics.clicks > 0 ? ((metrics.conversions / metrics.clicks) * 100).toFixed(1) : "0.0";
                            const maxClicks = Math.max(...platformMetricsValues.map(m => m.clicks), 1);
                            const widthPercent = Math.min(100, Math.max(5, (metrics.clicks / maxClicks) * 105 / 100 * 10 / 10)); // safe baseline
                            const calculatedPercent = Math.min(100, Math.max(5, (metrics.clicks / maxClicks) * 100));

                            // Color map
                            let badgeStyle = "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300";
                            if (platform === "Mercado Livre") badgeStyle = "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20";
                            else if (platform === "Amazon") badgeStyle = "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20";
                            else if (platform === "Growth") badgeStyle = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
                            else if (platform === "Decathlon") badgeStyle = "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20";

                            return (
                              <div key={platform} className="space-y-1.5 p-3 hover:bg-zinc-55 dark:hover:bg-zinc-950 border border-transparent hover:border-zinc-100 dark:hover:border-zinc-900 transition-colors">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase font-mono tracking-wider ${badgeStyle}`}>
                                      {platform}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-6 font-mono text-[11px]">
                                    <span className="text-zinc-500">
                                      <strong className="text-zinc-900 dark:text-zinc-100">{metrics.clicks}</strong> cliques
                                    </span>
                                    <span className="text-zinc-500">
                                      <strong className="text-zinc-900 dark:text-zinc-100">{metrics.conversions}</strong> leads
                                    </span>
                                    <span className="text-green-600 dark:text-green-400 font-bold">
                                      {conversionRate}% CT
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded-none overflow-hidden relative">
                                  <div 
                                    className="bg-zinc-900 dark:bg-white h-full transition-all duration-500" 
                                    style={{ width: `${calculatedPercent}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Product Performance List */}
                    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#060606] p-6 space-y-4">
                      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3">
                        <h4 className="text-xs font-black uppercase tracking-widest text-black dark:text-white">Mais Clicados da Curadoria</h4>
                        <p className="text-[10px] text-zinc-500">Principais links com tráfego rastreado e medido via evento.</p>
                      </div>

                      <div className="divide-y divide-zinc-100 dark:divide-zinc-900 space-y-3 pt-1 max-h-[480px] overflow-y-auto pr-2">
                        {productClicksEntries
                          .sort((a, b) => b[1].clicks - a[1].clicks)
                          .map(([prodId, details]) => {
                            const rate = details.clicks > 0 ? ((details.conversions / details.clicks) * 100).toFixed(0) : "0";
                            return (
                              <div key={prodId} className="pt-3 first:pt-0 flex items-center justify-between gap-1">
                                <div className="max-w-[70%]">
                                  <span className="block text-[11px] font-black uppercase truncate text-black dark:text-white">{details.title}</span>
                                  <span className="text-[9px] uppercase font-mono text-zinc-400">{details.platform}</span>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="block text-[11px] font-mono font-bold text-black dark:text-[#f3f3f3]">{details.clicks} clq</span>
                                  <span className="text-[9px] font-mono text-green-600 dark:text-green-400 font-bold">{rate}% conv</span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {/* Curiosities / Information Alert Info */}
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-6 border border-zinc-200 dark:border-zinc-805 space-y-2">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-green-600 font-mono">💡 ENTENDENDO AS CONVERSÕES NO NOSSO SITE</h5>
                    <p className="text-xs text-zinc-500 leading-relaxed font-light">
                      Os links apresentados acima redirecionam o tráfego do usuário diretamente para os respectivos marketplaces (Amazon, Mercado Livre, etc.) onde a compra final e segura é concluída. Como o checkout ocorre fora da nossa aplicação, o OSS.OS rastreia o clique no botão <strong>"IMAGINAR COMPRA" / "FINALIZAR"</strong> como uma intenção forte de compra (conversão de lead). Esse coeficiente é base suficiente para calcular o CTR (Click Through Rate) real de suas campanhas de afiliados e otimizar quais produtos destacar na homepage em semanas de maior volume de tráfego.
                    </p>
                  </div>
                </div>
              );
            })()}

              {/* TAB CONTEÚDO CMS (NOTÍCIAS E PODCASTS) */}
              {adminTab === 'news' && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="font-black uppercase tracking-widest text-sm text-black dark:text-white">Central de Conteúdo OSS.OS</h3>
                      <p className="text-zinc-500 text-xs font-light">Adicione, edite ou delete episódios de podcasts técnicos e notícias do Jiu-Jitsu nacional e internacional.</p>
                    </div>
                    <Button
                      onClick={() => handleOpenPostForm(null)}
                      className="bg-black dark:bg-white text-white dark:text-black font-black uppercase text-[10px] tracking-widest px-6 py-4 rounded-none hover:bg-green-605 dark:hover:bg-green-605"
                    >
                      <Plus size={14} className="mr-2" /> Publicar Notícia ou Podcast
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2 border border-zinc-200 dark:border-zinc-850 p-4 bg-zinc-55/50 dark:bg-zinc-950/20">
                    {blogPosts.map(post => (
                      <div 
                        key={post.id}
                        className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <img 
                            src={post.imageUrl} 
                            alt={post.title} 
                            className="w-12 h-12 object-cover border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950" 
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-green-105 border border-green-200 dark:bg-green-950 text-green-600 dark:text-green-400 text-[7px] font-mono px-2 py-0.2 uppercase tracking-widest font-black">{post.category}</span>
                              {post.hasAudio ? (
                                <span className="bg-red-105 border border-red-200 dark:bg-red-950 text-red-600 dark:text-red-400 text-[7px] font-mono px-1.5 py-0.2 uppercase tracking-widest font-black flex items-center gap-1">🎙️ Podcast Ativo</span>
                              ) : (
                                <span className="text-[7px] text-zinc-400 font-mono italic">Apenas leitura</span>
                              )}
                            </div>
                            <h4 className="font-bold text-xs text-black dark:text-white line-clamp-1">{post.title}</h4>
                            <p className="text-[10px] text-zinc-400 font-light truncate max-w-lg">{post.excerpt}</p>
                            <span className="block text-[8px] font-mono text-zinc-500 mt-1">{post.date} por {post.author}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                          <button
                            onClick={() => handleOpenPostForm(post)}
                            className="text-[9px] font-black uppercase text-zinc-650 dark:text-zinc-300 px-3 py-1.5 border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-850"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-[9px] font-black uppercase text-red-500 px-3 py-1.5 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB AUTOMAÇÃO IA SCOUT */}
              {adminTab === 'scout' && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 border border-zinc-100 dark:border-zinc-900 bg-zinc-55 dark:bg-zinc-900/50">
                      <h3 className="font-black uppercase tracking-widest text-xs mb-4">Cronograma de Automação IA Scout</h3>
                      <p className="text-zinc-500 text-sm mb-4 leading-relaxed">O portal monitora e processa notícias e podcasts de Jiu-Jitsu Técnico de alta precisão de forma autônoma:</p>
                      <div className="space-y-3 font-mono text-[10px] uppercase text-zinc-400">
                        <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
                          <span>Notícias</span>
                          <span className="text-green-500 font-bold">Segundas, Quartas e Sextas (Manhã)</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span>Podcasts (Manual do Guerreiro)</span>
                          <span className="text-green-500 font-bold">Terças-Feiras (Manhã)</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 border border-zinc-100 dark:border-zinc-900 bg-zinc-55 dark:bg-zinc-900/50">
                      <h3 className="font-black uppercase tracking-widest text-xs mb-4">Limpeza Técnica</h3>
                      <p className="text-zinc-500 text-sm mb-6">Remova erros de cache e conteúdos não-BJJ e restaure todas as notícias técnicas de jiu-jitsu instantaneamente.</p>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          if (confirm("Isso irá resetar o cache, apagar as notícias atuais e forçar um novo scout 100% técnico de Jiu-Jitsu. Continuar?")) {
                            localStorage.clear();
                            window.location.reload();
                          }
                        }}
                        className="w-full flex items-center justify-center gap-3 py-6 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-none font-black uppercase text-[10px] tracking-widest transition-all"
                      >
                        <RefreshCw size={14} /> RESET SESSÃO TÉCNICA
                      </Button>
                    </div>
                  </div>

                  {/* GERENCIADOR DE FEEDS RSS */}
                  <div className="p-8 border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                      <div>
                        <h3 className="font-black uppercase tracking-widest text-xs text-black dark:text-white flex items-center gap-2">
                          <span>📰</span> GERENCIADOR DE FEEDS RSS DE JIU-JITSU
                        </h3>
                        <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
                          Adicione fontes externas para alimentar o Scout IA automático de notícias técnicas e podcasts.
                        </p>
                      </div>
                      <span className="px-2.5 py-1 text-[9px] font-mono tracking-wider text-green-500 bg-green-500/5 border border-green-500/10 rounded-full font-black uppercase self-start md:self-auto">
                        FEED AUTOMATION ACTIVE
                      </span>
                    </div>

                    {/* Add XML Feed form */}
                    <div className="bg-white dark:bg-zinc-950 p-4 border border-zinc-100 dark:border-zinc-800 mb-6">
                      <h4 className="font-bold text-[10px] uppercase tracking-widest mb-3 text-zinc-400">
                        + Adicionar Nova Fonte RSS / Atom
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input 
                          type="text" 
                          placeholder="Nome (ex: Gracie Magazine)" 
                          value={newRssName}
                          onChange={(e) => setNewRssName(e.target.value)}
                          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 text-xs text-black dark:text-white rounded-none focus:outline-none focus:border-green-500/50"
                        />
                        <input 
                          type="url" 
                          placeholder="URL do Feed XML (ex: https://...)" 
                          value={newRssUrl}
                          onChange={(e) => setNewRssUrl(e.target.value)}
                          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 text-xs text-black dark:text-white rounded-none focus:outline-none focus:border-green-500/50"
                        />
                        <button
                          onClick={() => {
                            if (!newRssName || !newRssUrl) {
                              addToast("Nome e URL do Feed são obrigatórios", "error");
                              return;
                            }
                            if (!newRssUrl.startsWith("http://") && !newRssUrl.startsWith("https://")) {
                              addToast("A URL deve começar com http:// ou https://", "error");
                              return;
                            }
                            const exists = rssFeeds.some(f => f.url.toLowerCase() === newRssUrl.toLowerCase());
                            if (exists) {
                              addToast("Esta URL de RSS já está cadastrada!", "error");
                              return;
                            }
                            const newFeed = {
                              id: Math.random().toString(36).substr(2, 9),
                              name: newRssName.trim(),
                              url: newRssUrl.trim(),
                              active: true
                            };
                            setRssFeeds(prev => [...prev, newFeed]);
                            setNewRssName("");
                            setNewRssUrl("");
                            addToast("Feed RSS adicionado com sucesso!", "success");
                          }}
                          className="bg-black dark:bg-white text-white dark:text-black font-black uppercase text-[10px] tracking-widest hover:bg-zinc-850 dark:hover:bg-zinc-100 py-2.5 transition-all text-center rounded-none"
                        >
                          Cadastrar Fonte
                        </button>
                      </div>
                    </div>

                    {/* List area */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-[10px] uppercase tracking-widest text-zinc-400">
                        Fontes Cadastradas
                      </h4>
                      {rssFeeds.length === 0 ? (
                        <div className="p-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs">
                          Nenhuma fonte RSS cadastrada. Use o formulário acima para adicionar.
                        </div>
                      ) : (
                        <div className="border border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
                          {rssFeeds.map((feed) => (
                            <div key={feed.id} className="p-4 bg-white dark:bg-zinc-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-xs text-black dark:text-white uppercase tracking-wider">{feed.name}</span>
                                  <span className={`w-2 h-2 rounded-full ${feed.active ? 'bg-green-500 animate-pulse' : 'bg-zinc-400'}`} />
                                </div>
                                <div className="font-mono text-[9px] text-zinc-400 select-all break-all">{feed.url}</div>
                              </div>
                              <div className="flex items-center gap-3 self-end md:self-auto">
                                <button
                                  onClick={() => {
                                    setRssFeeds(prev => prev.map(f => f.id === feed.id ? { ...f, active: !f.active } : f));
                                    addToast(`Fonte "${feed.name}" ${feed.active ? 'desativada' : 'ativada'}!`, "info");
                                  }}
                                  className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-none border transition-all ${
                                    feed.active 
                                    ? 'border-green-500/20 bg-green-500/5 text-green-500 hover:bg-green-500/10' 
                                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                                  }`}
                                >
                                  {feed.active ? 'Ativo' : 'Inativo'}
                                </button>

                                <button
                                  onClick={async () => {
                                    setRssTestFeedId(feed.id);
                                    setRssTestLoading(true);
                                    setRssTestResults(null);
                                    try {
                                      const res = await fetch(`/api/rss/fetch?url=${encodeURIComponent(feed.url)}`);
                                      const data = await res.json();
                                      if (!res.ok) throw new Error(data.error || "Erro ao conectar");
                                      setRssTestResults(data.items || []);
                                      addToast(`Conexão bem sucedida com ${feed.name}! ${data.count} notícias encontradas.`, "success");
                                    } catch (err: any) {
                                      addToast(`Erro ao testar ${feed.name}: ` + err.message, "error");
                                      setRssTestResults([]);
                                    } finally {
                                      setRssTestLoading(false);
                                    }
                                  }}
                                  className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-none border border-zinc-200 dark:border-zinc-805 text-black dark:text-white bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all font-mono"
                                >
                                  Testar Conexão
                                </button>

                                <button
                                  onClick={() => {
                                    if (confirm(`Remover a fonte RSS de "${feed.name}"?`)) {
                                      setRssFeeds(prev => prev.filter(f => f.id !== feed.id));
                                      addToast("Fonte RSS removida.", "success");
                                    }
                                  }}
                                  className="p-1 px-2 border border-red-500/10 text-red-500 bg-red-500/5 hover:bg-red-500/10 transition-all rounded-none text-[9px] font-black uppercase"
                                >
                                  Remover
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* RSS FEED LIVE TEST PREVIEW PANEL */}
                    {rssTestFeedId && (
                      <div className="mt-6 p-5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 animate-fadeIn">
                        <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800 mb-3">
                          <h5 className="font-black uppercase tracking-wider text-[10px] text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                            <span>⚡</span> Pré-visualização do Feed: <span className="text-green-500">
                              {rssFeeds.find(f => f.id === rssTestFeedId)?.name || "Fonte de notícias"}
                            </span>
                          </h5>
                          <button 
                            onClick={() => {
                              setRssTestFeedId(null);
                              setRssTestResults(null);
                            }}
                            className="text-zinc-400 hover:text-black dark:hover:text-white font-mono text-[10px] uppercase tracking-widest font-black"
                          >
                            [X FECHAR]
                          </button>
                        </div>

                        {rssTestLoading ? (
                          <div className="flex flex-col items-center justify-center py-8 gap-2">
                            <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">Sincronizando feed externo...</span>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {rssTestResults && rssTestResults.length === 0 ? (
                              <p className="text-zinc-500 text-xs py-4 text-center">Nenhuma notícia encontrada ou o feed não pôde ser analisado.</p>
                            ) : (
                              rssTestResults?.slice(0, 3).map((item, idx) => (
                                <div key={idx} className="space-y-1 p-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-xs text-black dark:text-white leading-snug">{item.title}</span>
                                    {item.pubDate && (
                                      <span className="font-mono text-[8px] text-zinc-400 shrink-0 uppercase">{item.pubDate.split(' ').slice(0, 4).join(' ')}</span>
                                    )}
                                  </div>
                                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed line-clamp-2">{item.description}</p>
                                  {item.link && (
                                    <a 
                                      href={item.link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-block text-[9px] font-mono uppercase tracking-widest text-[#1877F2] dark:text-[#60A5FA] mt-1 hover:underline"
                                    >
                                      [Ver Fonte Original]
                                    </a>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB FIDELIDADE */}
              {adminTab === 'loyalty' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-830">
                    <div className="w-10 h-10 rounded-full bg-green-105 dark:bg-green-955/40 text-green-600 flex items-center justify-center">
                      <Award size={20} />
                    </div>
                    <div>
                      <h3 className="font-black uppercase tracking-widest text-sm text-black dark:text-white">Programa de Fidelidade (OSS.OS Points)</h3>
                      <p className="text-zinc-500 text-[11px] uppercase tracking-wider">Habilite, altere regras de pontuação e configure incentivos de tatame.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Status Toggle */}
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <div>
                        <span className="block text-xs font-black uppercase tracking-wider text-black dark:text-white">Fidelidade Ativa</span>
                        <span className="block text-[10px] text-zinc-500">Se ativo, clientes ganham pontos em compras e reviews e podem resgatar descontos.</span>
                      </div>
                      <button
                        onClick={() => {
                          const nextValue = !loyaltyEnabled;
                          setLoyaltyEnabled(nextValue);
                          localStorage.setItem('oss_loyalty_enabled', String(nextValue));
                          addToast(nextValue ? "Programa de fidelidade HABILITADO!" : "Programa de fidelidade DESABILITADO!", "info");
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          loyaltyEnabled ? 'bg-green-600' : 'bg-zinc-300 dark:bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            loyaltyEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {loyaltyEnabled && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {/* Pontos por compra */}
                        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-450 mb-1">Pontos por Produto</label>
                            <span className="text-[11px] text-zinc-500 block mb-3 font-light">Multiplicador de pontos para cada real gasto:</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="number"
                              min="1"
                              max="50"
                              value={loyaltyPointsRatio}
                              onChange={(e) => {
                                      const val = Math.max(1, parseInt(e.target.value) || 1);
                                      setLoyaltyPointsRatio(val);
                                      localStorage.setItem('oss_loyalty_points_ratio', String(val));
                              }}
                              className="rounded-none bg-zinc-50 dark:bg-zinc-950 font-mono text-xs w-24 h-9 border-zinc-200 dark:border-zinc-805"
                            />
                            <span className="text-xs font-bold text-zinc-650 dark:text-zinc-400 font-mono">pontos / BRL</span>
                          </div>
                        </div>

                        {/* Bônus de boas vindas */}
                        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-450 mb-1">Bônus Boas-Vindas</label>
                            <span className="text-[11px] text-zinc-500 block mb-3 font-light">Pontos ganhos imediatamente ao criar conta no portal:</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="number"
                              min="0"
                              max="1000"
                              value={loyaltyWelcomeBonus}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                setLoyaltyWelcomeBonus(val);
                                localStorage.setItem('oss_loyalty_welcome_bonus', String(val));
                              }}
                              className="rounded-none bg-zinc-50 dark:bg-zinc-950 font-mono text-xs w-24 h-9 border-zinc-200 dark:border-zinc-800"
                            />
                            <span className="text-xs font-bold text-zinc-650 dark:text-zinc-400 font-mono">pontos grátis</span>
                          </div>
                        </div>

                        {/* Bônus por review técnico */}
                        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 flex flex-col justify-between">
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-425 mb-1">Pontos por Review Técnico</label>
                            <span className="text-[11px] text-zinc-500 block mb-3 font-light">Ganho de fidelidade ao enviar opinião técnica detalhada:</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="number"
                              min="0"
                              max="500"
                              value={loyaltyReviewBonus}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                setLoyaltyReviewBonus(val);
                                localStorage.setItem('oss_loyalty_review_bonus', String(val));
                              }}
                              className="rounded-none bg-zinc-50 dark:bg-zinc-950 font-mono text-xs w-24 h-9 border-zinc-200 dark:border-zinc-805"
                            />
                            <span className="text-xs font-bold text-zinc-655 dark:text-zinc-404 font-mono">pontos / review</span>
                          </div>
                        </div>

                        {/* Regra de Resgate de Desconto */}
                        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 flex flex-col justify-between">
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-415 mb-1">Regra de Resgate</label>
                            <span className="text-[11px] text-zinc-500 block mb-3 font-light">Recompensa mínima de resgate concedida:</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Input 
                                type="number"
                                min="50"
                                max="10000"
                                value={loyaltyMinRedeemPoints}
                                onChange={(e) => {
                                  const val = Math.max(50, parseInt(e.target.value) || 50);
                                  setLoyaltyMinRedeemPoints(val);
                                  localStorage.setItem('oss_loyalty_min_redeem_points', String(val));
                                }}
                                className="rounded-none bg-zinc-50 dark:bg-zinc-950 font-mono text-xs w-16 h-9 border-zinc-200 dark:border-zinc-800"
                              />
                              <span className="text-[10px] text-zinc-505 font-mono">pts</span>
                            </div>
                            <span className="text-xs font-bold text-zinc-400">=</span>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-mono text-zinc-400">R$</span>
                              <Input 
                                type="number"
                                min="1"
                                max="500"
                                value={loyaltyDiscountValue}
                                onChange={(e) => {
                                  const val = Math.max(1, parseInt(e.target.value) || 1);
                                  setLoyaltyDiscountValue(val);
                                  localStorage.setItem('oss_loyalty_discount_value', String(val));
                                }}
                                className="rounded-none bg-zinc-50 dark:bg-zinc-950 font-mono text-xs w-16 h-9 border-zinc-200 dark:border-zinc-800"
                              />
                              <span className="text-[10px] text-zinc-505 font-mono">desconto</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      <Button
                        onClick={() => {
                          handleSaveLoyaltySettings(
                            loyaltyEnabled,
                            loyaltyPointsRatio,
                            loyaltyWelcomeBonus,
                            loyaltyReviewBonus,
                            loyaltyMinRedeemPoints,
                            loyaltyDiscountValue
                          );
                          addToast("Regras do Programa de Fidelidade Atualizadas!", "success", <Award className="text-green-600" size={14} />);
                        }}
                        className="bg-black dark:bg-white text-white dark:text-black font-black uppercase text-[10px] tracking-widest px-8 py-4 h-auto rounded-none hover:bg-green-600 dark:hover:bg-green-600"
                      >
                        Salvar Regras de Fidelidade
                      </Button>
                    </div>
                  </div>
                </div>
              )}

            {/* PRODUCT CURATION OVERLAY / DIALOG FORM */}
            <AnimatePresence>
              {isProductFormOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="bg-white dark:bg-[#080808] border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 max-w-2xl w-full h-auto max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 animate-scaleIn"
                  >
                    <div className="border-b border-zinc-150 dark:border-zinc-900 pb-4">
                      <h3 className="text-lg font-headline font-black uppercase tracking-tight text-black dark:text-white">
                        {editingProduct ? '📝 EDITAR PRODUTO NA CURADORIA' : '🥋 CADASTRAR PRODUTO MANUALMENTE'}
                      </h3>
                      <p className="text-[10px] font-mono text-zinc-450 uppercase mt-0.5">Informe as credenciais de afiliado e dados do marketplace.</p>
                    </div>

                    <div className="space-y-4 text-left">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Título do Produto *</label>
                          <Input value={productFormTitle} onChange={e => setProductFormTitle(e.target.value)} placeholder="Ex: Kimono Venum Challenger" className="rounded-none bg-zinc-50 dark:bg-zinc-950 font-black text-xs h-10 border-zinc-200 dark:border-zinc-800" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Marca</label>
                          <Input value={productFormBrand} onChange={e => setProductFormBrand(e.target.value)} placeholder="Ex: Venum, KVRA, Atama" className="rounded-none bg-zinc-50 dark:bg-zinc-950 font-black text-xs h-10 border-zinc-200 dark:border-zinc-800" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Preço Atual (R$) *</label>
                          <Input type="number" step="0.01" value={productFormPrice} onChange={e => setProductFormPrice(parseFloat(e.target.value) || 0)} className="rounded-none bg-zinc-50 dark:bg-zinc-950 font-black text-xs h-10 border-zinc-200 dark:border-zinc-800" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Preço Original de De: (R$)</label>
                          <Input type="number" step="0.01" value={productFormOriginalPrice || ''} onChange={e => setProductFormOriginalPrice(e.target.value ? parseFloat(e.target.value) : undefined)} placeholder="Opcional" className="rounded-none bg-zinc-50 dark:bg-zinc-950 font-black text-xs h-10 border-zinc-200 dark:border-zinc-800" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Plataforma Marketplace</label>
                          <select 
                            value={productFormPlatform} 
                            onChange={e => setProductFormPlatform(e.target.value as any)} 
                            className="w-full h-10 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-bold px-3 uppercase text-zinc-700 dark:text-zinc-300 rounded-none focus:outline-none"
                          >
                            {['Mercado Livre', 'Amazon', 'Shopee', 'Shein', 'TikTok', 'Netshoes', 'Centauro', 'Decathlon', 'Growth', 'Venum', 'KVRA'].map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Categoria</label>
                          <select 
                            value={productFormCategory} 
                            onChange={e => setProductFormCategory(e.target.value as any)} 
                            className="w-full h-10 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-bold px-3 uppercase text-zinc-700 dark:text-zinc-300 rounded-none focus:outline-none"
                          >
                            {['Kimonos', 'Rashguards', 'Bermudas', 'Faixas', 'Protetores', 'Acessórios', 'Equipamentos de Proteção', 'Serviços', 'Suplementos'].map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/20 mb-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                            <span>🔌 PREENCHIMENTO INTELIGENTE VIA LINK</span>
                            <span className="bg-green-600 text-white text-[7px] font-mono px-1.5 py-0.5 rounded-none font-bold">SISTEMA ATIVO</span>
                          </span>
                          <span className="text-[9px] font-mono text-zinc-450">Extrai Título, Imagem, Preço e Descrição</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input 
                            value={productFormAffiliateUrl} 
                            onChange={e => setProductFormAffiliateUrl(e.target.value)} 
                            placeholder="Insira o link de qualquer marketplace parceiro..." 
                            className="rounded-none bg-white dark:bg-black font-semibold text-xs h-10 border-zinc-200 dark:border-zinc-800 flex-1" 
                          />
                          <Button
                            type="button"
                            onClick={() => handleExtractMetadata(productFormAffiliateUrl)}
                            disabled={isExtractingLink}
                            className="bg-black dark:bg-white text-white dark:text-black hover:bg-green-600 dark:hover:bg-green-600 font-black uppercase text-[10px] tracking-wider rounded-none h-10 px-4 shrink-0 transition-all border border-zinc-250 dark:border-zinc-850"
                          >
                            {isExtractingLink ? 'Analisando...' : '🔍 Extrair do Link'}
                          </Button>
                        </div>
                        <p className="text-[9px] text-zinc-500 font-light mt-1">Insira o link oficial (ex: Amazon, Shopee, Mercado Livre, Netshoes, Centauro, Decathlon, Venum, KVRA etc.) para auto-extrair informações utilizando scraping com refino inteligência artificial Gemini.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Seu Link de Afiliado Final *</label>
                          <Input value={productFormAffiliateUrl} onChange={e => setProductFormAffiliateUrl(e.target.value)} placeholder="Cole o link de afiliado..." className="rounded-none bg-zinc-50 dark:bg-zinc-950 font-black text-xs h-10 border-zinc-200 dark:border-zinc-800" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Foto URL da imagem</label>
                          <div className="flex gap-2">
                            <Input value={productFormImageUrl} onChange={e => setProductFormImageUrl(e.target.value)} placeholder="https://..." className="rounded-none bg-zinc-50 dark:bg-zinc-950 font-black text-xs h-10 border-zinc-200 dark:border-zinc-800 flex-1" />
                            <Button
                              type="button"
                              onClick={handleGenerateProductImage}
                              disabled={isGeneratingProductImage}
                              className="bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white hover:bg-green-600 dark:hover:bg-green-600 font-black uppercase text-[9px] tracking-wider rounded-none h-10 px-3 shrink-0 transition-all border border-zinc-200 dark:border-zinc-800"
                            >
                              {isGeneratingProductImage ? 'Gerando...' : '🎨 Gerar com IA'}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Público Alvo / Gênero</label>
                          <select
                            value={productFormGender}
                            onChange={e => setProductFormGender(e.target.value as any)}
                            className="w-full h-10 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-bold px-3 uppercase text-zinc-700 dark:text-zinc-300 rounded-none focus:outline-none"
                          >
                            {['Masculino', 'Feminino', 'Unissex', 'Infantil'].map(g => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Graduação/Faixa BJJ Recomendada</label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'].map(belt => {
                              const active = productFormBeltsList.includes(belt);
                              return (
                                <button
                                  key={belt}
                                  type="button"
                                  onClick={() => {
                                    setProductFormBeltsList(prev => prev.includes(belt) ? prev.filter(b => b !== belt) : [...prev, belt]);
                                  }}
                                  className={`px-3 py-1 text-[8px] font-mono font-black uppercase border transition-colors ${
                                    active 
                                      ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                                      : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-400 border-zinc-200 dark:border-zinc-850 hover:bg-zinc-105'
                                  }`}
                                >
                                  {belt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Tamanhos Disponíveis</label>
                        <div className="flex flex-wrap gap-1">
                          {['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'M0', 'M1', 'M2', 'M3', 'S', 'M', 'L', 'XL', 'XXL', 'Unissex'].map(sz => {
                            const active = productFormSizesList.includes(sz);
                            return (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => {
                                  setProductFormSizesList(prev => prev.includes(sz) ? prev.filter(s => s !== sz) : [...prev, sz]);
                                }}
                                className={`px-2 py-1 text-[8px] font-mono font-black border transition-colors ${
                                  active 
                                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                                    : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-400 border-zinc-200 dark:border-zinc-850'
                                }`}
                              >
                                {sz}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Descrição Curadoria (Seu veredicto técnico)</label>
                        <textarea 
                          value={productFormDescription}
                          onChange={e => setProductFormDescription(e.target.value)}
                          placeholder="Foque nos detalhes de ripstop, reforço da calça, lapela do casaco e testes de lavagem que você realizou..."
                          rows={3}
                          className="w-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none rounded-none font-sans"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-150 dark:border-zinc-900">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsProductFormOpen(false);
                          setEditingProduct(null);
                        }}
                        className="rounded-none font-bold uppercase text-[9px] tracking-widest px-6"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSaveProduct}
                        className="rounded-none font-black uppercase text-[9px] tracking-widest bg-green-600 hover:bg-green-700 text-white px-8"
                      >
                        {editingProduct ? 'Salvar Edição' : 'Publicar Curadoria'}
                      </Button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* BLOG/PODCAST PUBLICATION OVERLAY / DIALOG FORM */}
            <AnimatePresence>
              {isPostFormOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="bg-white dark:bg-[#080808] border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 max-w-2xl w-full h-auto max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 text-left"
                  >
                    <div className="border-b border-zinc-150 dark:border-zinc-900 pb-4">
                      <h3 className="text-lg font-headline font-black uppercase tracking-tight text-black dark:text-white">
                        {editingPost ? '📝 EDITAR POSTAGEM / PODCAST' : '🎙️ INSERIR NOVO CONTEÚDO TÉCNICO'}
                      </h3>
                      <p className="text-[10px] font-mono text-zinc-450 uppercase mt-0.5">Controle os áudios e textos do site com curadoria técnica em português.</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Título do Post / Podcast *</label>
                        <Input value={postFormTitle} onChange={e => setPostFormTitle(e.target.value)} placeholder="Ex: Diário dos OSS.os #12 - O Segredo da Pressão Estóica" className="rounded-none placeholder-zinc-400 bg-zinc-50 dark:bg-zinc-950 font-black text-xs h-10 border-zinc-200 dark:border-zinc-800" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Selecione a Categoria</label>
                          <select 
                            value={postFormCategory} 
                            onChange={e => {
                              const cat = e.target.value as any;
                              setPostFormCategory(cat);
                              if (cat === 'Podcast') {
                                setPostFormHasAudio(true);
                              }
                            }} 
                            className="w-full h-10 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-955 text-xs font-bold px-3 uppercase text-zinc-700 dark:text-zinc-300 rounded-none focus:outline-none"
                          >
                            {['Podcast', 'News', 'Results', 'Tutorial', 'Lifestyle', 'Interview', 'Philosophy', 'Mindset'].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Autor</label>
                          <Input value={postFormAuthor} onChange={e => setPostFormAuthor(e.target.value)} placeholder="Default: Redação OSS.OS" className="rounded-none bg-zinc-50 dark:bg-zinc-950 font-black text-xs h-10 border-zinc-200 dark:border-zinc-800" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Banner Imagem URL link</label>
                        <Input value={postFormImageUrl} onChange={e => setPostFormImageUrl(e.target.value)} placeholder="Ex: https://images.unsplash.com/..." className="rounded-none placeholder-zinc-400 bg-zinc-50 dark:bg-zinc-950 font-black text-xs h-10 border-zinc-200 dark:border-zinc-800" />
                      </div>

                      <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-955/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-black uppercase tracking-wider">🎙️ Habilitar Reprodução de Áudio (Podcast / Narrador)</label>
                          <button
                            type="button"
                            onClick={() => setPostFormHasAudio(!postFormHasAudio)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              postFormHasAudio ? 'bg-red-650' : 'bg-zinc-300 dark:bg-zinc-700'
                            }`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${postFormHasAudio ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {postFormHasAudio && (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">URL de Áudio Customizada (MP3, Spotify Embed ou Link de Podcast)</label>
                            <Input value={postFormAudioUrl} onChange={e => setPostFormAudioUrl(e.target.value)} placeholder="Opcional: Cole link do seu MP3. Se em branco, usará locução do narrador integrada!" className="rounded-none text-xs bg-zinc-50 dark:bg-zinc-950 font-black h-10 border-zinc-200 dark:border-zinc-800" />
                          </motion.div>
                        )}
                      </div>

                      <div className="p-4 border border-zinc-200 dark:border-zinc-805 bg-zinc-50 dark:bg-zinc-955/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-black uppercase tracking-wider">🎥 Adicionar Ícone de Vídeo Técnico</label>
                          <button
                            type="button"
                            onClick={() => setPostFormHasVideo(!postFormHasVideo)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              postFormHasVideo ? 'bg-indigo-650' : 'bg-zinc-300 dark:bg-zinc-700'
                            }`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${postFormHasVideo ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {postFormHasVideo && (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                            <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">URL do Vídeo Técnico (Link do Vídeo)</label>
                            <Input value={postFormVideoUrl} onChange={e => setPostFormVideoUrl(e.target.value)} placeholder="Cole o link do seu youtube embed ou vídeo..." className="rounded-none text-xs bg-zinc-50 dark:bg-zinc-950 font-black h-10 border-zinc-200 dark:border-zinc-800" />
                          </motion.div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Resumo (Subtítulo ou Excerpt)</label>
                        <Input value={postFormExcerpt} onChange={e => setPostFormExcerpt(e.target.value)} placeholder="Escreva uma breve sinopse envolvente de uma linha para chamar a atenção na home..." className="rounded-none placeholder-zinc-400 bg-zinc-50 dark:bg-zinc-950 font-black text-xs h-10 border-zinc-200 dark:border-zinc-800" />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Link de Afiliado do Produto Relacionado (Opcional - ex: na Amazon, Mercado Livre, etc)</label>
                        <Input value={postFormSponsoredUrl} onChange={e => setPostFormSponsoredUrl(e.target.value)} placeholder="Cole o link de afiliado completo para exibir este produto como Oferta Patrocinada no artigo" className="rounded-none placeholder-zinc-400 bg-zinc-50 dark:bg-zinc-950 font-black text-xs h-10 border-zinc-200 dark:border-zinc-800" />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider mb-1">Conteúdo do Artigo BJJ (Rich Content Completo) *</label>
                        <textarea 
                          value={postFormContent}
                          onChange={e => setPostFormContent(e.target.value)}
                          placeholder="Escreva livremente em português seu artigo completo. O narrador narrará este texto linha por linha para dar o efeito de Podcast de voz premium!"
                          rows={6}
                          className="w-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none rounded-none font-sans"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-150 dark:border-zinc-900">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsPostFormOpen(false);
                          setEditingPost(null);
                        }}
                        className="rounded-none font-bold uppercase text-[9px] tracking-widest px-6"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSavePost}
                        className="rounded-none font-black uppercase text-[9px] tracking-widest bg-green-600 hover:bg-green-700 text-white px-8"
                      >
                        {editingPost ? 'Salvar Edição' : 'Publicar Conteúdo'}
                      </Button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <button 
              onClick={() => handleNavigate('LANDING')}
              className="mt-12 text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors"
              id="back_to_portal_btn"
            >
              Voltar ao Portal Público
            </button>
          </div>
        </motion.div>
      ) : view === 'TRANSPARENCY' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col bg-zinc-50 dark:bg-black min-h-screen"
          >
            <Helmet>
              <title>{t('transparency_page.title_tab', { defaultValue: 'OSS.OS | Transparência e Impacto Social' })}</title>
              <meta name="description" content={t('transparency_page.description_tab', { defaultValue: 'Relatório de transparência: entenda como suas compras ajudam a fortalecer a comunidade do Jiu-Jitsu.' })} />
            </Helmet>

            <div className="relative py-24 px-6 overflow-hidden bg-black text-white">
              {/* Premium Breadcrumb Back Navigation Overlay */}
              <div className="absolute top-6 left-6 z-30 flex items-center gap-2 text-[9px] font-mono font-black uppercase tracking-[0.2em] text-white/60 bg-black/50 backdrop-blur-sm px-4 py-2 border border-white/10">
                <button 
                  onClick={() => handleNavigate('LANDING')} 
                  className="hover:text-green-500 transition-colors cursor-pointer flex items-center gap-1 text-white"
                >
                  <ChevronLeft size={10} className="-mt-0.5 text-green-500" /> {t('transparency_page.back_navigation', { defaultValue: 'DIÁRIO DOS OSS.OS' })}
                </button>
                <span>/</span>
                <span className="text-white/40">{t('transparency_page.breadcrumb_title', { defaultValue: 'Transparência' })}</span>
              </div>
              <div className="absolute inset-0 opacity-25 contrast-150 grayscale">
                <img src={bjjActionGrappling} className="w-full h-full object-cover" alt="Transparency" />
              </div>
              <div className="relative z-10 max-w-4xl mx-auto text-center">
                <Badge className="bg-green-600 text-white mb-6 rounded-none px-4 py-1">{t('transparency_page.commitment_badge', { defaultValue: 'Compromisso Social' })}</Badge>
                <h1 className="text-5xl md:text-7xl font-black italic -skew-x-6 uppercase tracking-tighter mb-6">
                  {t('transparency_page.main_title_part1', { defaultValue: 'Relatório de' })} <span className="text-green-500">{t('transparency_page.main_title_part2', { defaultValue: 'Transparência' })}</span>
                </h1>
                <p className="text-xl text-zinc-400 font-light max-w-2xl mx-auto italic">
                  "{t('transparency_page.intro_quote', { defaultValue: 'Nascemos com a missão de circular recursos. 10% de toda nossa arrecadação retorna para quem mantém a chama acesa na base.' })}"
                </p>
              </div>
            </div>

            <div className="max-w-6xl mx-auto py-24 px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="md:col-span-2 space-y-16">
                <section>
                  <h2 className="text-3xl font-black uppercase tracking-tighter italic border-l-4 border-green-600 pl-6 mb-8">
                    {t('transparency_page.what_we_sold_title', { defaultValue: 'O que vendemos este ano' })}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { key: 'gi', label: 'Kimonos', count: 124, icon: <ShoppingBag size={18} /> },
                      { key: 'belts', label: 'Faixas', count: 86, icon: <Award size={18} /> },
                      { key: 'rashguards', label: 'Rash Guards', count: 215, icon: <Zap size={18} /> },
                      { key: 'accessories', label: 'Acessórios', count: 342, icon: <Plus size={18} /> },
                      { key: 'lifestyle', label: 'LifeStyle', count: 158, icon: <Palette size={18} /> },
                      { key: 'gear', label: 'Equipamentos', count: 94, icon: <Target size={18} /> },
                    ].map((item, i) => (
                      <div key={i} className="bg-white dark:bg-zinc-900 p-6 border border-zinc-100 dark:border-zinc-800 flex flex-col items-center text-center group hover:border-green-600 transition-all">
                        <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-black flex items-center justify-center mb-4 text-zinc-400 group-hover:text-green-600 transition-colors">
                          {item.icon}
                        </div>
                        <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                          {t(`transparency_page.${item.key}`, { defaultValue: item.label })}
                        </span>
                        <span className="text-2xl font-black italic text-black dark:text-white mt-1">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-black text-white p-12 border-t-8 border-green-600 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <OssLogo size="lg" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[0.4em] text-green-500 mb-6">
                    {t('transparency_page.destination_title', { defaultValue: 'A Destinação dos 10%' })}
                  </h3>
                  <div className="space-y-6 max-w-xl">
                    <p className="text-3xl md:text-4xl font-black italic leading-tight uppercase">
                      {t('transparency_page.destination_subtitle', { defaultValue: 'Fortalecimento de Projetos Sociais de Jiu-Jitsu em Comunidades.' })}
                    </p>
                    <p className="text-zinc-400 font-light text-lg">
                      {t('transparency_page.destination_desc', { defaultValue: 'Não somos apenas um portal de compras. Somos um motor de incentivo. Os 10% da nossa margem são destinados integralmente para a compra de kimonos e custeio de inscrições para atletas de baixa renda vinculados a projetos sociais parceiros.' })}
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-3xl font-black uppercase tracking-tighter italic border-l-4 border-zinc-200 dark:border-zinc-800 pl-6 mb-8">
                    {t('transparency_page.next_steps_title', { defaultValue: 'Próximos Passos' })}
                  </h2>
                  <div className="space-y-4">
                    <div className="flex gap-4 p-6 border border-zinc-100 dark:border-zinc-900 group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all">
                      <div className="w-12 h-12 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-mono font-black border border-zinc-200 dark:border-zinc-700">01</div>
                      <div>
                        <h4 className="font-black uppercase text-sm mb-1 tracking-tight">
                          {t('transparency_page.step1_title', { defaultValue: 'Expandir Rede de Parceiros' })}
                        </h4>
                        <p className="text-xs text-zinc-500 font-light">
                          {t('transparency_page.step1_desc', { defaultValue: 'Estamos cadastrando 5 novos projetos sociais no segundo semestre de 2026.' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-6 border border-zinc-100 dark:border-zinc-900 group hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all">
                      <div className="w-12 h-12 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-mono font-black border border-zinc-200 dark:border-zinc-700">02</div>
                      <div>
                        <h4 className="font-black uppercase text-sm mb-1 tracking-tight">
                          {t('transparency_page.step2_title', { defaultValue: 'Evento Beneficente' })}
                        </h4>
                        <p className="text-xs text-zinc-500 font-light">
                          {t('transparency_page.step2_desc', { defaultValue: 'Realização do primeiro "Open OSS" com inscrições 100% revertidas em cestas básicas.' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="space-y-8">
                <div className="bg-white dark:bg-zinc-900 p-8 border border-zinc-100 dark:border-zinc-800 sticky top-32">
                  <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-green-600 mb-6">
                    {t('transparency_page.metrics_title', { defaultValue: 'Métricas de Impacto' })}
                  </h4>
                  <div className="space-y-8">
                    <div>
                      <span className="block text-[8px] font-bold text-zinc-500 uppercase mb-1">
                        {t('transparency_page.funds_raised_label', { defaultValue: 'Fundos Arrecadados' })}
                      </span>
                      <div className="flex items-end gap-2">
                         <span className="text-3xl font-black italic -skew-x-3 text-black dark:text-white">R$ 12.450</span>
                         <span className="text-[10px] text-green-600 font-bold mb-1">+15% vs LY</span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-zinc-500 uppercase mb-1">
                        {t('transparency_page.gis_donated_label', { defaultValue: 'Kimonos Doados' })}
                      </span>
                      <span className="text-3xl font-black italic -skew-x-3 text-black dark:text-white">
                        42 {t('transparency_page.gis_units', { defaultValue: 'UNIDADES' })}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-zinc-500 uppercase mb-1">
                        {t('transparency_page.direct_impact_label', { defaultValue: 'Impacto Direto' })}
                      </span>
                      <span className="text-lg font-black uppercase text-zinc-400">
                        {t('transparency_page.youth_served', { defaultValue: '120+ Jovens Atendidos' })}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-8 bg-zinc-100 dark:bg-zinc-800" />
                  
                  <p className="text-[10px] text-zinc-400 font-medium italic leading-relaxed">
                    {t('transparency_page.consolidated_data', { defaultValue: '* Dados consolidados até Maio de 2026. Próxima atualização em Dezembro/2026.' })}
                  </p>

                  <Button 
                    onClick={() => handleNavigate('CONTACT')}
                    className="w-full mt-8 bg-black dark:bg-white text-white dark:text-black rounded-none font-black uppercase text-[10px] tracking-widest py-6"
                  >
                    {t('transparency_page.suggest_project', { defaultValue: 'Sugerir um Projeto' })}
                  </Button>
                </div>
              </aside>
            </div>

            <div className="bg-zinc-100 dark:bg-zinc-950 py-24 px-6 text-center">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-3xl font-black uppercase italic -skew-x-6 mb-6">
                  {t('transparency_page.history_title', { defaultValue: 'Faça parte desta história' })}
                </h3>
                <p className="text-zinc-500 text-sm mb-10 leading-relaxed font-light italic">
                  {t('transparency_page.history_desc', { defaultValue: 'Cada centavo investido em seu equipamento conosco contribui diretamente para democratizar o acesso ao nosso esporte e estilo de vida.' })}
                </p>
                <button 
                  onClick={() => handleNavigate('SHOP')}
                  className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-black dark:text-white border-b-2 border-green-600 pb-2 hover:border-black dark:hover:border-white transition-all"
                >
                  {t('transparency_page.go_to_shop_btn', { defaultValue: 'Ir para a Loja' })} <ArrowRight size={14} />
                </button>
              </div>
            </div>
            
            <div className="max-w-4xl mx-auto py-12 px-6 text-center">
               <button 
                onClick={() => handleNavigate('LANDING')}
                className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors"
                id="back_to_portal_btn_transparency"
              >
                {t('transparency_page.back_to_portal_btn', { defaultValue: 'Voltar ao Portal Público' })}
              </button>
            </div>
          </motion.div>
        ) : view === 'ABOUT' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            <Helmet>
              <title>OSS.OS | Nossa Essência e Missão</title>
            </Helmet>

            {/* About Hero */}
            <div className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-black">
              {/* Premium Breadcrumb Back Navigation Overlay */}
              <div className="absolute top-6 left-6 z-30 flex items-center gap-2 text-[9px] font-mono font-black uppercase tracking-[0.2em] text-white/60 bg-black/50 backdrop-blur-sm px-4 py-2 border border-white/10">
                <button 
                  onClick={() => handleNavigate('LANDING')} 
                  className="hover:text-green-500 transition-colors cursor-pointer flex items-center gap-1 text-white"
                >
                  <ChevronLeft size={10} className="-mt-0.5 text-green-500" /> DIÁRIO DOS OSS.OS
                </button>
                <span>/</span>
                <span className="text-white/40">Quem Somos</span>
              </div>
              <img 
                src={bjjHeroBanner} 
                className="absolute inset-0 w-full h-full object-cover opacity-35 grayscale contrast-125"
                alt="BJJ Mission"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black"></div>
              <div className="relative z-10 text-center px-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <OssLogo size="lg" className="mx-auto mb-10 text-white" />
                  <h2 className="text-5xl md:text-8xl font-black italic -skew-x-6 uppercase tracking-tighter text-white">{t('about.title')}</h2>
                  <div className="w-24 h-1 bg-green-600 mx-auto mt-8 mb-10"></div>
                  <motion.a 
                    href="https://www.instagram.com/reel/DX80AoLIa4g/?igsh=OWNqYXh4cjJpcGkw"
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-white/60 hover:text-green-500 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-green-500 transition-colors">
                      <Play size={12} className="fill-current" />
                    </div>
                    VER O CONCEITO OSS
                  </motion.a>
                </motion.div>
              </div>
            </div>

            {/* About Content */}
            <div className="bg-white dark:bg-black py-32 px-6">
              <div className="max-w-4xl mx-auto space-y-24">
                <section className="space-y-12">
                  <h3 className="text-3xl md:text-5xl font-black uppercase italic -skew-x-6 tracking-tighter border-l-8 border-green-600 pl-8">
                    {t('about.section_essence', { defaultValue: 'Nossa Essência' }).split(' ')[0]} <br /><span className="text-green-600">{t('about.section_essence', { defaultValue: 'Nossa Essência' }).split(' ')[1]}</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-zinc-500 dark:text-zinc-400 font-light text-lg leading-relaxed italic">
                    <p>
                      {t('about.essence_p1')}
                    </p>
                    <p>
                      {t('about.essence_p2')}
                    </p>
                  </div>
                </section>

                <div className="h-px w-full bg-zinc-100 dark:bg-zinc-900"></div>

                {/* Olimpo do Mundial BJJ - Hall of Fame Interactive Section */}
                <section className="space-y-12">
                  <div className="text-center md:text-left space-y-4">
                    <span className="text-[10px] font-mono font-black uppercase text-green-500 bg-green-500/10 px-4 py-1.5 inline-block tracking-[0.2em] rounded-none">
                      {t('legends.beyond_mats', { defaultValue: 'Beyond The Mats // O Ápice do Jiu-Jitsu Olímpico' })}
                    </span>
                    <h3 className="text-4xl md:text-6xl font-black uppercase italic -skew-x-6 tracking-tighter text-black dark:text-white leading-[0.9]">
                      {t('legends.title', { defaultValue: 'O OLÍMPO DO MUNDIAL DE BJJ' })}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 font-light text-base md:text-lg max-w-2xl leading-relaxed">
                      {t('legends.description', { defaultValue: 'A elite absoluta do Jiu-Jitsu esportivo. Conheça as lendas da Faixa Preta que conquistaram a glória eterna nos tatames com o maior número de medalhas de ouro no Campeonato Mundial da IBJJF.' })}
                    </p>
                  </div>

                  {/* Generated Cinematic Banner Image */}
                  <div className="relative h-64 md:h-80 w-full overflow-hidden border border-zinc-100 dark:border-zinc-900 group">
                    <img 
                      src={bjjLegendsHall} 
                      alt="BJJ Legends Hall of Gold" 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-green-500 uppercase tracking-widest block mb-1">
                          {t('legends.tactical_curation', { defaultValue: 'Cura tática OSS.OS' })}
                        </span>
                        <h4 className="text-xl font-black uppercase tracking-tight text-white italic">
                          {t('legends.integrated_hall', { defaultValue: 'GALERIA DE HONRA INTEGRADA' })}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider backdrop-blur-md bg-black/40 border border-white/10 px-3 py-1.5">
                        {t('legends.metric_updated', { defaultValue: 'MÉTRICA ATUALIZADA: MUNDIAL 2026' })}
                      </span>
                    </div>
                  </div>

                  {/* Interatividade Split Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    {/* Lista Radial / Grid de Seleção (Col-span 5) */}
                    <div className="relative lg:col-span-12 xl:col-span-5 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl p-6 md:p-8 border border-black/10 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden rounded-none">
                      {/* Ambient glowing vector lights behind glass */}
                      <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-[#cc0000]/5 dark:bg-red-500/10 blur-[40px] pointer-events-none animate-pulse" />
                      <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-yellow-500/5 dark:bg-yellow-500/10 blur-[40px] pointer-events-none" />

                      <div className="relative z-10 flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-900">
                        <span className="text-xs font-mono font-black text-zinc-400 uppercase tracking-widest">
                          {t('legends.elite_legends', { defaultValue: 'Os Lendários da Elite' })}
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-[#cc0000] dark:text-[#ff3b30] uppercase">
                          {t('legends.select_to_detail', { defaultValue: 'Selecione para detalhar' })}
                        </span>
                      </div>

                      {/* Top Row Champions (Buchecha, Roger, Malfacine, Gabi, Bia) */}
                      <div className="relative z-10 my-4">
                        <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-3 font-black">
                          {t('legends.top_tier', { defaultValue: 'MÁXIMO ESCALÃO // 9x A 13x CAMPEÕES' })}
                        </p>
                        <div className="grid grid-cols-5 gap-2.5">
                          {bjjLegends.slice(0, 5).map((legend, index) => {
                            const isSelected = selectedLegendIndex === index;
                            return (
                              <button
                                key={legend.name}
                                onClick={() => {
                                  setSelectedLegendIndex(index);
                                  // automatically move opponent off current fighter in sparring
                                  if (combatOpponentIndex === index) {
                                    setCombatOpponentIndex((index + 1) % bjjLegends.length);
                                  }
                                  if (typeof playClickSound === 'function') {
                                    playClickSound();
                                  }
                                }}
                                className="group flex flex-col items-center text-center focus:outline-none transition-transform active:scale-95 cursor-pointer"
                              >
                                {/* Circle Avatar */}
                                <div className={`relative w-12 h-12 md:w-14 md:h-14 rounded-full p-[2px] transition-all duration-300 ${isSelected ? 'bg-gradient-to-tr from-yellow-500 via-yellow-400 to-[#cc0000] scale-105 shadow-[0_0_15px_rgba(204,0,0,0.25)]' : 'bg-zinc-200/80 dark:bg-zinc-805 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700'}`}>
                                  <div className="w-full h-full rounded-full overflow-hidden border border-white dark:border-zinc-950 bg-zinc-100 dark:bg-zinc-900">
                                    <img 
                                      src={legend.avatar} 
                                      alt={legend.name} 
                                      className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-550"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  {/* Badge de Título multiplicador flutuante */}
                                  <span className={`absolute -top-1 -right-1 text-[8px] md:text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border border-white dark:border-zinc-950 shadow-md ${isSelected ? 'bg-[#cc0000] text-white animate-pulse' : 'bg-black text-white dark:bg-white dark:text-black font-mono'}`}>
                                    {legend.titles}
                                  </span>
                                </div>
                                <span className={`text-[8px] md:text-[9px] font-mono mt-1.5 tracking-tighter uppercase font-black truncate max-w-full ${isSelected ? 'text-[#cc0000] dark:text-red-500 font-extrabold' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white'}`}>
                                  {legend.name.split(' ')[1] || legend.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Bottom Row Champions (Nicolini, Letícia, Leandro, Hannette, Xande) */}
                      <div className="relative z-10">
                        <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-3 font-black">
                          {t('legends.heavyweight_legends', { defaultValue: 'LENDAS DE PESO // 7x A 8x CAMPEÕES' })}
                        </p>
                        <div className="grid grid-cols-5 gap-2.5">
                          {bjjLegends.slice(5, 10).map((legend, index) => {
                            const realIndex = index + 5;
                            const isSelected = selectedLegendIndex === realIndex;
                            return (
                              <button
                                key={legend.name}
                                onClick={() => {
                                  setSelectedLegendIndex(realIndex);
                                  // automatically move opponent off current fighter
                                  if (combatOpponentIndex === realIndex) {
                                    setCombatOpponentIndex((realIndex + 1) % bjjLegends.length);
                                  }
                                  if (typeof playClickSound === 'function') {
                                    playClickSound();
                                  }
                                }}
                                className="group flex flex-col items-center text-center focus:outline-none transition-transform active:scale-95 cursor-pointer"
                              >
                                <div className={`relative w-12 h-12 md:w-14 md:h-14 rounded-full p-[2px] transition-all duration-300 ${isSelected ? 'bg-gradient-to-tr from-yellow-500 via-yellow-400 to-[#cc0000] scale-105 shadow-[0_0_15px_rgba(204,0,0,0.25)]' : 'bg-zinc-200/80 dark:bg-zinc-850 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700'}`}>
                                  <div className="w-full h-full rounded-full overflow-hidden border border-white dark:border-zinc-950 bg-zinc-100 dark:bg-zinc-900">
                                    <img 
                                      src={legend.avatar} 
                                      alt={legend.name} 
                                      className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-550"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <span className={`absolute -top-1 -right-1 text-[8px] md:text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border border-white dark:border-zinc-950 shadow-md ${isSelected ? 'bg-[#cc0000] text-white animate-pulse' : 'bg-black text-white dark:bg-white dark:text-black font-mono'}`}>
                                    {legend.titles}
                                  </span>
                                </div>
                                <span className={`text-[8px] md:text-[9px] font-mono mt-1.5 tracking-tighter uppercase font-black truncate max-w-full ${isSelected ? 'text-[#cc0000] dark:text-red-500 font-extrabold' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white'}`}>
                                  {legend.name.split(' ').slice(1).join(' ') || legend.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                      {/* Ficha Lendária Glassmorphism Console & Arena (Col-span 7) */}
                    <div className="lg:col-span-12 xl:col-span-7 bg-zinc-950/90 text-white p-6 md:p-8 border border-zinc-900 relative shadow-2xl flex flex-col justify-between min-h-[460px] rounded-none">
                      {/* Geometric grid mesh pattern underneath the glass console */}
                      <div className="absolute inset-0 bg-[radial-gradient(#cc0000_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

                      {/* Header with Title and Tab Toggles */}
                      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900 w-full">
                        <div className="flex gap-3 items-center">
                          <span className="w-2.5 h-2.5 bg-[#cc0000] rounded-none animate-ping shrink-0" />
                          <div>
                            <span className="text-[8px] font-mono text-yellow-500 bg-yellow-500/10 px-2.5 py-1 uppercase tracking-widest border border-yellow-500/20 inline-block font-black">
                              {t('legends.immortal_black_belt', { defaultValue: 'FAIXA PRETA IMORTAL' })}
                            </span>
                            <h4 className="text-xl md:text-2xl font-black uppercase italic -skew-x-3 tracking-tighter text-white mt-1 leading-tight font-sans">
                              {bjjLegends[selectedLegendIndex].name}
                            </h4>
                          </div>
                        </div>

                        {/* Glassmorphic Tab buttons with tactical feedback */}
                        <div className="flex gap-1.5 bg-zinc-900/4.5 p-1 border border-zinc-800 self-start sm:self-center">
                          <button
                            onClick={() => {
                              setBjjActiveTab('profile');
                              if (typeof playClickSound === 'function') playClickSound();
                            }}
                            className={`px-3 py-1.5 text-[9px] font-black tracking-widest font-mono uppercase transition-all duration-200 ${bjjActiveTab === 'profile' ? 'bg-[#cc0000] text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-850/40'}`}
                          >
                            {t('legends.technical_details_tab', { defaultValue: 'FICHA TÉCNICA' })}
                          </button>
                          <button
                            onClick={() => {
                              setBjjActiveTab('sparring');
                              // set default opponent if same
                              if (combatOpponentIndex === selectedLegendIndex) {
                                setCombatOpponentIndex((selectedLegendIndex + 1) % bjjLegends.length);
                              }
                              if (typeof playClickSound === 'function') playClickSound();
                            }}
                            className={`px-3 py-1.5 text-[9px] font-black tracking-widest font-mono uppercase transition-all duration-200 ${bjjActiveTab === 'sparring' ? 'bg-[#cc0000] text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-850/40'}`}
                          >
                            {t('legends.spar_simulator_tab', { defaultValue: 'SIMULADOR SPAR_SIM' })}
                          </button>
                        </div>
                      </div>

                      {/* TAB CONTENT: PROFILE DETAILS AND STATIC STAT GRAPHICS */}
                      {bjjActiveTab === 'profile' && (
                        <div className="relative z-10 space-y-6 pt-4 flex-1 flex flex-col justify-between">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            {/* Left: Metadata & Specialty */}
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 font-mono text-[9px] uppercase tracking-wider text-zinc-400">
                                <div className="bg-zinc-900/30 p-2.5 border border-zinc-900">
                                  <span className="block text-[8px] font-bold text-zinc-500 mb-0.5">
                                    {t('legends.gold_titles_all', { defaultValue: 'TÍTULOS MUNDIAIS' })}
                                  </span>
                                  <span className="text-yellow-500 font-black text-xs italic">
                                    {bjjLegends[selectedLegendIndex].titles} {t('legends.champion', { defaultValue: 'Preta Campeão' })}
                                  </span>
                                </div>
                                <div className="bg-zinc-900/30 p-2.5 border border-zinc-900">
                                  <span className="block text-[8px] font-bold text-zinc-500 mb-0.5">
                                    {t('legends.style_category', { defaultValue: 'ESTILO / CATEGORIA' })}
                                  </span>
                                  <span className="text-white font-black text-[10px] block truncate text-glow">
                                    {t(`legends.items.${selectedLegendIndex}.category`, { defaultValue: bjjLegends[selectedLegendIndex].category })}
                                  </span>
                                </div>
                              </div>

                              <div className="bg-zinc-900/50 p-4 border border-zinc-900/80 relative">
                                <div className="absolute right-3 top-3 w-4 h-4 rounded-full border border-green-500/30 flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                </div>
                                <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5 font-bold">
                                  {t('legends.technical_signature_secret', { defaultValue: 'ASSINATURA TÉCNICA // ARMA SECRETA' })}
                                </span>
                                <p className="text-xs font-black text-green-400 uppercase tracking-tight font-sans italic">
                                  {t(`legends.items.${selectedLegendIndex}.specialty`, { defaultValue: bjjLegends[selectedLegendIndex].specialty })}
                                </p>
                              </div>

                              {/* Highlights */}
                              <div className="space-y-2">
                                <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                                  {t('legends.impact_details_label', { defaultValue: 'DETALHES DO IMPACTO NO ESPORTE' })}
                                </span>
                                <ul className="space-y-2 text-[11px] text-zinc-400 leading-relaxed font-light">
                                  {bjjLegends[selectedLegendIndex].highlights.map((highlight, hidx) => (
                                    <li key={hidx} className="flex gap-2.5 items-start">
                                      <span className="text-green-500 font-bold font-mono mt-0.5">✓</span>
                                      <span>
                                        {t(`legends.items.${selectedLegendIndex}.highlights.${hidx}`, { defaultValue: highlight })}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Right: BJJ STAT GAUGES */}
                            <div className="space-y-4 bg-zinc-900/20 p-4 border border-zinc-900">
                              <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                                {t('legends.tactical_diagram', { defaultValue: 'DIAGRAMA TÁTICO DO ATLETA (BJJ STATS)' })}
                              </span>
                              
                              {/* Tactical stats mapping */}
                              {[
                                { name: t('legends.stat_attack', { defaultValue: 'Ataque // Finalização' }), val: [98, 97, 95, 98, 96, 93, 91, 98, 92, 90][selectedLegendIndex] },
                                { name: t('legends.stat_defense', { defaultValue: 'Defesa // Escapes' }), val: [94, 100, 92, 96, 94, 91, 93, 89, 95, 99][selectedLegendIndex] },
                                { name: t('legends.stat_pressure', { defaultValue: 'Pressão // Meia-Guarda' }), val: [99, 100, 88, 99, 91, 89, 90, 95, 93, 94][selectedLegendIndex] },
                                { name: t('legends.stat_speed', { defaultValue: 'Velocidade // Agilidade' }), val: [96, 85, 100, 90, 95, 97, 92, 99, 88, 86][selectedLegendIndex] },
                                { name: t('legends.stat_guard', { defaultValue: 'Guarda // Raspagens' }), val: [91, 99, 96, 97, 98, 95, 96, 94, 91, 100][selectedLegendIndex] }
                              ].map((st, sidx) => (
                                <div key={sidx} className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-mono">
                                    <span className="text-zinc-400 uppercase tracking-tighter">{st.name}</span>
                                    <span className="text-yellow-500 font-bold font-black">{st.val}%</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-zinc-950 border border-zinc-900 flex">
                                    <div 
                                      className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.3)] transition-all duration-500" 
                                      style={{ width: `${st.val}%` }} 
                                    />
                                  </div>
                                </div>
                              ))}

                              {/* Overall power meter can be added */}
                              <div className="pt-2 border-t border-zinc-900 w-full flex items-center justify-between">
                                <span className="text-[9px] font-mono text-zinc-500 font-bold">{t('legends.total_fighter_eval', { defaultValue: 'EVAL TOTAL DO LUTADOR:' })}</span>
                                <div className="text-lg font-mono font-black italic text-glow text-yellow-400">
                                  {Math.round(([98, 97, 95, 98, 96, 93, 91, 98, 92, 90][selectedLegendIndex] + [94, 100, 92, 96, 94, 91, 93, 89, 95, 99][selectedLegendIndex] + [99, 100, 88, 99, 91, 89, 90, 95, 93, 94][selectedLegendIndex] + [96, 85, 100, 90, 95, 97, 92, 99, 88, 86][selectedLegendIndex] + [91, 99, 96, 97, 98, 95, 96, 94, 91, 100][selectedLegendIndex]) / 5)} OVR
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Weight Comparator Component */}
                          <WeightComparator legends={bjjLegends} selectedLegendIndex={selectedLegendIndex} />

                          {/* Philosophy messages */}
                          <div className="relative z-10 pt-4 border-t border-zinc-900 italic font-light text-xs text-zinc-500 leading-relaxed">
                            <span className="text-zinc-650 block text-[8px] font-mono font-bold uppercase tracking-widest non-italic mb-1 font-black">
                              {t('legends.warrior_message', { defaultValue: 'MENSAGEM AO GUERREIRO' })}
                            </span>
                            "{t(`legends.items.${selectedLegendIndex}.quote`, { defaultValue: bjjLegends[selectedLegendIndex].quote })}"
                          </div>
                        </div>
                      )}

                      {/* TAB CONTENT: BJJ DREAM MATCHUP COMBAT STATION */}
                      {bjjActiveTab === 'sparring' && (
                        <div className="relative z-10 pt-4 flex-1 flex flex-col justify-between space-y-4">
                          
                          {/* Matchup Competitor Selection Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            
                            {/* Competitor A */}
                            <div className="md:col-span-5 bg-zinc-900/40 p-3 border border-zinc-800 flex items-center gap-3 relative">
                              <span className="absolute left-0 top-0 text-[7px] font-mono font-bold bg-[#cc0000] text-white px-1.5 py-0.5 tracking-wider">{t('legends.competitor_a', { defaultValue: 'COMPETIDOR A' })}</span>
                              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-500 shrink-0">
                                <img src={bjjLegends[selectedLegendIndex].avatar} alt="" className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-extrabold uppercase text-[11px] text-yellow-500 tracking-tighter truncate">{bjjLegends[selectedLegendIndex].name}</h5>
                                <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold">OVR: {Math.round(([98, 97, 95, 98, 96, 93, 91, 98, 92, 90][selectedLegendIndex] + [94, 100, 92, 96, 94, 91, 93, 89, 95, 99][selectedLegendIndex] + [99, 100, 88, 99, 91, 89, 90, 95, 93, 94][selectedLegendIndex] + [96, 85, 100, 90, 95, 97, 92, 99, 88, 86][selectedLegendIndex] + [91, 99, 96, 97, 98, 95, 96, 94, 91, 100][selectedLegendIndex]) / 5)}</span>
                              </div>
                            </div>

                            {/* Versus logo indicator */}
                            <div className="md:col-span-2 flex justify-center text-center">
                              <span className="bg-yellow-500 text-black text-xs font-black font-mono italic px-3 py-1 -skew-x-12 border border-black dark:border-white shadow">VS</span>
                            </div>

                            {/* Competitor B Selector */}
                            <div className="md:col-span-5 bg-zinc-900/45 p-3 border border-zinc-850 relative flex items-center justify-between gap-3 font-mono">
                              <span className="absolute left-0 top-0 text-[7px] font-mono font-bold bg-zinc-800 text-zinc-300 px-1.5 py-0.5 tracking-wider">{t('legends.competitor_b', { defaultValue: 'COMPETIDOR B (OPONENTE)' })}</span>
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-red-500 shrink-0">
                                  <img src={bjjLegends[combatOpponentIndex].avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                                <div className="min-w-0">
                                  <h5 className="font-extrabold uppercase text-[11px] text-white tracking-tighter truncate font-sans">{bjjLegends[combatOpponentIndex].name}</h5>
                                  <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold">OVR: {Math.round(([98, 97, 95, 98, 96, 93, 91, 98, 92, 90][combatOpponentIndex] + [94, 100, 92, 96, 94, 91, 93, 89, 95, 99][combatOpponentIndex] + [99, 100, 88, 99, 91, 89, 90, 95, 93, 94][combatOpponentIndex] + [96, 85, 100, 90, 95, 97, 92, 99, 88, 86][combatOpponentIndex] + [91, 99, 96, 97, 98, 95, 96, 94, 91, 100][combatOpponentIndex]) / 5)}</span>
                                </div>
                              </div>

                              {/* Competitor B Arrow Swapper Cycle */}
                              <div className="flex items-center gap-1">
                                <button
                                  disabled={isCombatRunning}
                                  onClick={() => {
                                    let nextIdx = (combatOpponentIndex - 1 + bjjLegends.length) % bjjLegends.length;
                                    if (nextIdx === selectedLegendIndex) {
                                      nextIdx = (nextIdx - 1 + bjjLegends.length) % bjjLegends.length;
                                    }
                                    setCombatOpponentIndex(nextIdx);
                                    if (typeof playClickSound === 'function') playClickSound();
                                  }}
                                  className="w-7 h-7 bg-zinc-800 hover:bg-[#cc0000] disabled:opacity-50 text-white shrink-0 flex items-center justify-center font-bold font-mono text-xs transition-colors cursor-pointer"
                                >
                                  &lt;
                                </button>
                                <button
                                  disabled={isCombatRunning}
                                  onClick={() => {
                                    let nextIdx = (combatOpponentIndex + 1) % bjjLegends.length;
                                    if (nextIdx === selectedLegendIndex) {
                                      nextIdx = (nextIdx + 1) % bjjLegends.length;
                                    }
                                    setCombatOpponentIndex(nextIdx);
                                    if (typeof playClickSound === 'function') playClickSound();
                                  }}
                                  className="w-7 h-7 bg-zinc-800 hover:bg-[#cc0000] disabled:opacity-50 text-white shrink-0 flex items-center justify-center font-bold font-mono text-xs transition-colors cursor-pointer"
                                >
                                  &gt;
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Live sparring timeline tracker */}
                          {isCombatRunning && (
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[8px] font-mono uppercase tracking-widest text-[#cc0000] font-black">
                                <span>{t('legends.sim_sync', { defaultValue: 'SINCRONIZAÇÃO SPAR_SIM // TATAME TEMPO REAL' })}</span>
                                <span className="animate-pulse">{t('legends.processing_log', { defaultValue: 'PROCESSANDO SEQUÊNCIA TÁTICA' })}</span>
                              </div>
                              <div className="h-1.5 w-full bg-zinc-900 border border-zinc-850 overflow-hidden relative">
                                <div 
                                  className={`h-full bg-gradient-to-r from-red-600 via-yellow-500 to-green-500 transition-all duration-300`} 
                                  style={{ 
                                    width: combatPhase === 'STARTED' ? '25%' : 
                                           combatPhase === 'MID_FIGHT' ? '55%' : 
                                           combatPhase === 'SUBMISSION' ? '85%' : 
                                           combatPhase === 'ENDED' ? '100%' : '5%' 
                                  }} 
                                />
                              </div>
                            </div>
                          )}

                          {/* TATAME TÁTICO: REPRESENTAÇÃO VISUAL DA LUTA */}
                          <div className="bg-zinc-950/90 border border-zinc-900 p-4 relative overflow-hidden flex flex-col justify-start h-36">
                            
                            {/* Graphic Arena lines */}
                            <div className="absolute inset-0 bg-[#09090b] [background-size:12px_12px] opacity-10" />
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-dashed border-[#cc0000]/35 flex items-center justify-center pointer-events-none">
                              <div className="w-10 h-10 rounded-full border border-yellow-500/20" />
                            </div>

                            {/* Combat nodes */}
                            {!isCombatRunning && combatPhase === 'IDLE' ? (
                              <div className="relative text-center m-auto space-y-2">
                                <p className="text-[10px] font-mono text-zinc-400 font-extrabold uppercase tracking-wide">
                                  {t('legends.arena_idle_msg', { defaultValue: 'ARENA DE SIMULAÇÃO TÁTICA EM ESPERA' })}
                                </p>
                                <button
                                  onClick={() => handleStartCombatSimulation(selectedLegendIndex, combatOpponentIndex)}
                                  className="mx-auto block text-[9px] font-black tracking-widest font-mono uppercase bg-[#cc0000] hover:bg-[#b30000] text-white px-5 py-2.5 shadow-[4px_4px_0_#000000] dark:shadow-[4px_4px_0_#ffffff] cursor-pointer active:translate-y-0.5"
                                >
                                  {t('legends.simulate_clash_btn', { defaultValue: 'SIMULAR CONFRONTO LENDÁRIO' })}
                                </button>
                              </div>
                            ) : (
                              <div className="relative flex-1 flex flex-col justify-between w-full h-full text-left">
                                <div className="flex justify-between items-center bg-zinc-900/60 p-1.5 px-3 border border-zinc-800">
                                  <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase">
                                      {t('legends.position_label', { defaultValue: 'POSIÇÃO:' })} {
                                        combatPhase === 'STARTED' ? t('legends.phase_started', { defaultValue: 'LUTA EM PÉ // COLLAR TIES' }) :
                                        combatPhase === 'MID_FIGHT' ? t('legends.phase_mid', { defaultValue: 'MEIA-GUARDA PROFUNDA // TOREANO ENTRANCES' }) :
                                        combatPhase === 'SUBMISSION' ? t('legends.phase_submission', { defaultValue: 'QUASE FINALIZADO // ATAQUE DE COSTAS' }) :
                                        combatPhase === 'ENDED' ? t('legends.phase_ended', { defaultValue: 'FIM DO COMBATE // CUMPRIMENTOS' }) : t('legends.phase_transition', { defaultValue: 'TRANSICIONANDO...' })
                                      }
                                    </span>
                                  </div>
                                  <span className="text-[8px] font-mono text-yellow-500">{t('legends.arena_details_live', { defaultValue: 'MUNDIAL IBJJF LIVE // ESTÁDIO DO COMBATE' })}</span>
                                </div>

                                {/* Simulated Moving Dots representing fighters */}
                                <div className="relative h-12 w-full flex items-center justify-center">
                                  {/* Fighter A Dot */}
                                  <div 
                                    className={`absolute w-3.5 h-3.5 rounded-full bg-yellow-500 flex items-center justify-center font-bold text-[8px] text-black shadow-[0_0_12px_rgba(234,179,8,0.6)] transition-all duration-700`}
                                    style={{
                                      left: combatPhase === 'STARTED' ? '25%' :
                                            combatPhase === 'MID_FIGHT' ? '42%' :
                                            combatPhase === 'SUBMISSION' ? '48%' :
                                            combatPhase === 'ENDED' ? (combatWinnerName === bjjLegends[selectedLegendIndex].name ? '46%' : '35%') : '10%'
                                    }}
                                  >
                                    A
                                  </div>

                                  {/* Fighter B Dot */}
                                  <div 
                                    className={`absolute w-3.5 h-3.5 rounded-full bg-red-600 flex items-center justify-center font-bold text-[8px] text-white shadow-[0_0_12px_rgba(204,0,0,0.6)] transition-all duration-700`}
                                    style={{
                                      right: combatPhase === 'STARTED' ? '25%' :
                                             combatPhase === 'MID_FIGHT' ? '42%' :
                                             combatPhase === 'SUBMISSION' ? '48%' :
                                             combatPhase === 'ENDED' ? (combatWinnerName === bjjLegends[combatOpponentIndex].name ? '46%' : '35%') : '10%'
                                    }}
                                  >
                                    B
                                  </div>

                                  {/* Impact effect when overlapping */}
                                  {(combatPhase === 'MID_FIGHT' || combatPhase === 'SUBMISSION') && (
                                    <div className="absolute w-8 h-8 rounded-full border border-orange-500/40 animate-ping pointer-events-none" />
                                  )}
                                </div>

                                {/* Live Terminal log stream */}
                                <div className="h-10 overflow-y-auto font-mono text-[9px] text-green-400 px-2 leading-relaxed bg-black/60 border-t border-zinc-900 scrollbar-none flex flex-col justify-end">
                                  {combatLogs.slice(-2).map((log, lidx) => (
                                    <p key={lidx} className="truncate select-none">{log}</p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Full fight log list on end */}
                          {combatPhase === 'ENDED' && (
                            <div className="bg-zinc-900/40 border border-zinc-900 p-3 overflow-y-auto max-h-28 text-[10px] font-mono text-zinc-300 leading-normal space-y-1 select-none">
                              <div className="text-yellow-500 font-extrabold pb-1 border-b border-zinc-900 uppercase">{t('legends.fight_reconstitution', { defaultValue: 'RECONSTITUIÇÃO DA LUTA:' })}</div>
                              {combatLogs.map((log, lidx) => (
                                <p key={lidx} className={`${lidx === combatLogs.length - 1 ? 'text-green-400 font-black' : ''}`}>
                                  {log}
                                </p>
                              ))}
                              <button
                                onClick={() => {
                                  setCombatPhase('IDLE');
                                  setCombatLogs([]);
                                  setCombatWinnerName(null);
                                  if (typeof playClickSound === 'function') playClickSound();
                                }}
                                className="w-full mt-2 text-[8px] font-black text-center text-zinc-400 hover:text-white uppercase transition-colors"
                              >
                                {t('legends.clear_arena_btn', { defaultValue: '[ LIMPAR ARENA & PARCEIRO ]' })}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <div className="h-px w-full bg-zinc-100 dark:bg-zinc-900"></div>

                {/* Pillars of OSS.OS */}
                <section className="space-y-8">
                  <h3 className="text-2xl md:text-4xl font-black uppercase italic -skew-x-6 tracking-tight text-black dark:text-white">
                    {t('about.philosophy_title', { defaultValue: 'Os Três Pilares dos Oss.os' })}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-3">
                      <div className="w-8 h-8 bg-green-600/10 text-green-600 flex items-center justify-center font-mono font-black text-xs">01</div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-black dark:text-white">{t('about.pillar_1_title', { defaultValue: 'Resiliência' })}</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{t('about.pillar_1_desc', { defaultValue: 'A capacidade de suportar a pressão e evoluir através do desconforto contínuo no tatame.' })}</p>
                    </div>
                    <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-3">
                      <div className="w-8 h-8 bg-green-600/10 text-green-600 flex items-center justify-center font-mono font-black text-xs">02</div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-black dark:text-white">{t('about.pillar_2_title', { defaultValue: 'Técnica Pura' })}</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{t('about.pillar_2_desc', { defaultValue: 'Alavanca, precisão e biomecânica superando a força bruta e o peso físico.' })}</p>
                    </div>
                    <div className="p-6 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-3">
                      <div className="w-8 h-8 bg-green-600/10 text-green-600 flex items-center justify-center font-mono font-black text-xs">03</div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-black dark:text-white">{t('about.pillar_3_title', { defaultValue: 'Respeito e Honra' })}</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{t('about.pillar_3_desc', { defaultValue: 'Reconhecer o valor de cada parceiro de treino na construção mútua da maestria.' })}</p>
                    </div>
                  </div>
                </section>

                <div className="text-center pt-8">
                  <button
                    onClick={() => handleNavigate('LANDING')}
                    className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-green-600 dark:hover:bg-green-500 transition-colors shadow-lg cursor-pointer"
                  >
                    <ChevronLeft size={14} /> {t('about.back_to_portal', { defaultValue: 'VOLTAR AO PORTAL PRINCIPAL' })}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : view === 'WISHLIST' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto px-6 py-12 space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
              <div>
                <span className="text-[10px] font-mono font-bold text-green-600 uppercase tracking-widest">Sua Armadura Favorita</span>
                <h2 className="text-3xl md:text-5xl font-black uppercase italic -skew-x-6 tracking-tight text-black dark:text-white">
                  {t('wishlist.title', { defaultValue: 'SEUS FAVORITOS & ALERTAS' })}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  {wishlist.size} {wishlist.size === 1 ? "item monitorado" : "itens monitorados"} com rastreamento ativo de preço.
                </p>
              </div>

              {wishlist.size > 0 && (
                <button
                  onClick={() => {
                    setWishlist(new Set());
                    setWishlistAlerts(new Set());
                  }}
                  className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-600 border border-red-600/30 text-xs font-mono font-bold uppercase transition-colors"
                >
                  Limpar Todos os Favoritos
                </button>
              )}
            </div>

            {wishlist.size === 0 ? (
              <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400">
                  <Heart size={32} />
                </div>
                <h3 className="text-xl font-black uppercase text-black dark:text-white">Sua Lista de Desejos está Vazia</h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Adicione kimonos, rashguards, faixas ou suplementos clicando no ícone de coração nos produtos para receber alertas de queda de preço.
                </p>
                <button
                  onClick={() => handleNavigate("SHOP")}
                  className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black text-xs font-mono font-black uppercase tracking-wider hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-colors"
                >
                  Explorar Catálogo BJJ
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {productList
                  .filter((p) => wishlist.has(p.id))
                  .map((product) => (
                    <PremiumProductCard
                      key={product.id}
                      product={product}
                      isWishlisted={true}
                      onToggleWishlist={toggleWishlist}
                      onSelectProduct={(p) => setSelectedGalleryProduct(p)}
                      onAddToCart={(p) => handleAddToCart(p)}
                      onToggleCompare={(p) => toggleCompareProduct(p)}
                      isComparing={comparedProductIds.has(product.id)}
                      onOpenReviews={(p) => setSelectedReviewProduct(p)}
                      onOpenSeoOptimizer={(p) => {
                        setSelectedSeoProductId(p.id);
                        setIsSeoModalOpen(true);
                      }}
                    />
                  ))}
              </div>
            )}
          </motion.div>
        ) : (
          /* DEFAULT: SHOP CATALOG VIEW */
          <ShopCatalogView
            productList={productList}
            filteredProducts={filteredProducts}
            paginatedProducts={paginatedProducts}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            maxProductPrice={maxProductPrice}
            selectedBrands={selectedBrands}
            setSelectedBrands={setSelectedBrands}
            availableBrands={brands}
            selectedRating={selectedRating}
            setSelectedRating={setSelectedRating}
            selectedPopularity={selectedPopularity}
            setSelectedPopularity={setSelectedPopularity}
            selectedPractitionerLevels={selectedPractitionerLevels}
            setSelectedPractitionerLevels={setSelectedPractitionerLevels}
            selectedSubCategories={selectedSubCategories}
            setSelectedSubCategories={setSelectedSubCategories}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
            onQuickView={(p) => setSelectedGalleryProduct(p)}
            onCheckout={(p) => { openCheckoutModal(p); }}
            onAddToCart={(p) => handleAddToCart(p)}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            comparedProductIds={comparedProductIds}
            onToggleCompare={toggleCompareProduct}
            wishlistAlerts={wishlistAlerts}
            onNavigate={handleNavigate}
            onOpenReviews={(p) => setSelectedReviewProduct(p)}
            onOpenSeoOptimizer={(id) => {
              setSelectedSeoProductId(id || null);
              setIsSeoModalOpen(true);
            }}
          />
        )}
          </motion.div>
        </AnimatePresence>

        {/* Rodapé Corporativo e Profissional */}
        <ProfessionalFooter
          onNavigate={handleNavigate}
          onOpenExchangeModal={() => setIsExchangeModalOpen(true)}
          onOpenSizeChart={() => setIsExchangeModalOpen(true)}
          onOpenLgpdModal={() => setIsLgpdModalOpen(true)}
          onOpenExternalShowcase={() => handleNavigate('EXTERNAL_SHOWCASE')}
          playClickSound={playClickSound}
          addToast={(msg, type) => addToast(msg, type === 'error' ? 'error' : 'success')}
        />
      </main>

    {/* Filter Drawer */}
    <FilterDrawer
      isOpen={isFilterDrawerOpen}
      onClose={() => setIsFilterDrawerOpen(false)}
      priceRange={priceRange}
      setPriceRange={setPriceRange}
      maxProductPrice={maxProductPrice}
      selectedBrands={selectedBrands}
      setSelectedBrands={setSelectedBrands}
      brands={brands}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      selectedSubCategories={selectedSubCategories}
      setSelectedSubCategories={setSelectedSubCategories}
      selectedRating={selectedRating}
      setSelectedRating={setSelectedRating}
      selectedPopularity={selectedPopularity}
      setSelectedPopularity={setSelectedPopularity}
      selectedPractitionerLevels={selectedPractitionerLevels}
      setSelectedPractitionerLevels={setSelectedPractitionerLevels}
      clearFilters={clearFilters}
      activeFiltersCount={activeFiltersCount}
      resultsCount={filteredProducts.length}
    />

    {/* Product Comparison Modal (Lazy Loaded with Suspense) */}
    <AnimatePresence>
      {isCompareModalOpen && (
        <Suspense fallback={
          <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl flex items-center gap-3 font-mono text-xs text-black dark:text-white">
              <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              <span>Carregando comparador de kimonos...</span>
            </div>
          </div>
        }>
          <ProductComparisonModal
            key="product-comparison-modal"
            isOpen={isCompareModalOpen}
            onClose={() => setIsCompareModalOpen(false)}
            products={comparedProductsList}
            onRemoveProduct={(id) => handleRemoveCompareProduct(id)}
            onClearAll={handleClearCompareAll}
            onCheckout={(p) => { setSelectedGalleryProduct(p); }}
            onQuickView={(p) => setSelectedPriceHistoryProduct(p)}
          />
        </Suspense>
      )}
    </AnimatePresence>

    {/* Price History Chart Modal (Lazy Loaded with Suspense) */}
    <AnimatePresence>
      {selectedPriceHistoryProduct && (
        <motion.div
          key="price-history-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          onClick={() => setSelectedPriceHistoryProduct(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl relative font-sans"
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="px-2.5 py-1 bg-red-600 text-white font-mono font-black text-xs uppercase tracking-wider">
                  BJJ // CHARTS
                </div>
                <div>
                  <h3 className="text-sm font-mono font-black uppercase text-black dark:text-white">
                    HISTÓRICO DE PREÇOS // {selectedPriceHistoryProduct.title}
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Análise comparativa histórica em tempo real nos maiores marketplaces
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPriceHistoryProduct(null)}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 cursor-pointer"
                title="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            <Suspense fallback={
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400 font-mono text-xs">
                <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                <span>Carregando inteligência gráfica de histórico de preços...</span>
              </div>
            }>
              <PriceHistoryChart 
                product={selectedPriceHistoryProduct} 
                targetPrice={Math.round(selectedPriceHistoryProduct.price * 0.9)} 
              />
            </Suspense>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Product Review & Rating Modal */}
    <AnimatePresence>
      {activeReviewProduct && (
        <ProductReviewModal
          key={`product-review-modal-${activeReviewProduct.id}`}
          isOpen={Boolean(activeReviewProduct)}
          onClose={() => setSelectedReviewProduct(null)}
          product={activeReviewProduct}
          onAddReview={handleAddProductReview}
          currentUserId={user?.uid}
          currentUserName={user?.displayName || user?.email?.split('@')[0]}
        />
      )}
    </AnimatePresence>

    {/* Floating Compare Bar */}
    {comparedProductIds.size > 0 && !isCompareModalOpen && (
      <FloatingCompareBar
        comparedProducts={comparedProductsList}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onRemoveProduct={(id) => handleRemoveCompareProduct(id)}
        onClearAll={handleClearCompareAll}
      />
    )}

    {/* Auth Modal */}
    {isAuthModalOpen && (
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSignIn={handleSignIn}
      />
    )}

    {/* Notification Permission Modal */}
    {isNotificationModalOpen && (
      <NotificationPermissionModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onRequestPermission={handleRequestNotificationPermission}
        initialTab={notificationModalInitialTab}
      />
    )}

    {/* Notification Onboarding Flow Modal */}
    {isNotificationOnboardingOpen && (
      <NotificationOnboardingModal
        isOpen={isNotificationOnboardingOpen}
        onClose={() => setIsNotificationOnboardingOpen(false)}
        onPermissionGranted={() => {
          if (typeof window !== 'undefined' && 'Notification' in window) {
            setNotificationPermission(Notification.permission);
            setIsPushSubscribed(Notification.permission === 'granted');
          }
          addToast("Notificações Push autorizadas! Você receberá alertas de promoções e novidades.", "success", <Bell size={14} className="text-green-500 animate-bounce" />);
        }}
        wishlistProducts={productList.filter(p => wishlist.has(p.id))}
        sampleProduct={productList[0] || initialProducts[0]}
      />
    )}

    {/* LGPD Modal */}
    {isLgpdModalOpen && (
      <LGPDModal
        isOpen={isLgpdModalOpen}
        onClose={() => setIsLgpdModalOpen(false)}
        initialTab={lgpdModalInitialTab}
      />
    )}

    {/* BJJ Catalog SEO Keyword & Ranking Optimizer Modal */}
    {isSeoModalOpen && (
      <Suspense fallback={
        <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl flex items-center gap-3 font-mono text-xs text-black dark:text-white">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Carregando Otimizador de SEO do Catálogo...</span>
          </div>
        </div>
      }>
        <CatalogSeoAnalyzerModal
          isOpen={isSeoModalOpen}
          onClose={() => setIsSeoModalOpen(false)}
          products={productList}
          initialSelectedProductId={selectedSeoProductId}
          onUpdateProduct={handleUpdateProductSeo}
          onBatchUpdateProducts={handleBatchUpdateProductsSeo}
          addToast={(toast) => addToast(toast.title ? `${toast.title}: ${toast.description || ''}` : (toast.description || ''), toast.variant === 'destructive' ? 'error' : 'success')}
        />
      </Suspense>
    )}

    {/* Dedicated Product Checkout Modal with Politica de Troca Facilitada */}
    <AnimatePresence>
      {isCheckoutModalOpen && selectedCheckoutProduct && (
        <div 
          className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          id="checkout-modal-overlay"
          onClick={() => setIsCheckoutModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 w-full max-w-lg shadow-2xl relative font-sans overflow-hidden"
            id="checkout-modal-content"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-green-600 text-white flex items-center justify-center shadow-md">
                  <ShoppingBag size={16} />
                </div>
                <div>
                  <span className="text-[8px] font-mono font-black text-green-600 uppercase tracking-widest block leading-tight">
                    OSS.OS // CHECKOUT SEGURO DO TATAME
                  </span>
                  <h3 className="text-base font-black uppercase italic -skew-x-3 text-black dark:text-white leading-tight">
                    {t('checkout.title', { defaultValue: 'Checkout do Tatame' })}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  playClickSound();
                  setIsCheckoutModalOpen(false);
                }}
                className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer border border-zinc-300 dark:border-zinc-700"
                title="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            {/* Product Details */}
            <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex gap-4 items-start">
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0 overflow-hidden flex items-center justify-center p-1.5">
                  <img
                    src={selectedCheckoutProduct.imageUrl}
                    alt={selectedCheckoutProduct.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 font-mono text-[9px] font-black uppercase text-zinc-700 dark:text-zinc-300">
                      {selectedCheckoutProduct.brand}
                    </span>
                    <span className="text-[10px] text-green-600 font-mono font-bold">
                      {selectedCheckoutProduct.platform}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-black dark:text-white line-clamp-2 leading-snug">
                    {selectedCheckoutProduct.title}
                  </h4>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-lg font-black font-mono text-black dark:text-white">
                      R$ {(selectedCheckoutProduct.price * checkoutQuantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    {checkoutQuantity > 1 && (
                      <span className="text-[10px] text-zinc-400 font-mono">
                        (R$ {selectedCheckoutProduct.price.toFixed(2)} cada)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Size Selection */}
              {selectedCheckoutProduct.sizes && selectedCheckoutProduct.sizes.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">
                      Tamanho Selecionado:
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsExchangeModalOpen(true)}
                      className="text-[11px] text-green-600 hover:text-green-500 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <Ruler size={12} />
                      Guia de tamanhos & troca
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCheckoutProduct.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setCheckoutSelectedSize(s);
                        }}
                        className={`px-3 py-1.5 text-xs font-mono font-black uppercase border transition-all cursor-pointer ${
                          checkoutSelectedSize === s
                            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity selector */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-900">
                <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  Quantidade:
                </span>
                <div className="flex items-center border border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setCheckoutQuantity(q => Math.max(1, q - 1));
                    }}
                    disabled={checkoutQuantity <= 1}
                    className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-10 text-center font-mono font-black text-xs text-black dark:text-white">
                    {checkoutQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setCheckoutQuantity(q => q + 1);
                    }}
                    className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Partner Guarantee Notice */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center gap-2.5">
                <ShieldCheck size={18} className="text-green-600 shrink-0" />
                <div className="leading-snug">
                  <span className="font-bold text-black dark:text-white">Compra Segura & Protegida:</span> Redirecionamento oficial direto para o estoque homologado com proteção integral ao comprador.
                </div>
              </div>

              {/* Terms checkbox */}
              <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer pt-1 select-none">
                <input
                  type="checkbox"
                  checked={acceptedCheckoutTerms}
                  onChange={(e) => setAcceptedCheckoutTerms(e.target.checked)}
                  className="accent-green-600 w-4 h-4 rounded cursor-pointer"
                />
                <span>{t('checkout.terms', { defaultValue: 'Eu li e aceito os Termos e Condições.' })}</span>
              </label>

              {/* Checkout Actions and Required "Política de Troca Facilitada" Link below Finalizar */}
              <div className="pt-2 space-y-2.5">
                <button
                  id="btn-finish-checkout"
                  type="button"
                  disabled={!acceptedCheckoutTerms}
                  onClick={() => {
                    playClickSound();
                    handleFinishPurchase();
                  }}
                  className="w-full py-3.5 px-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:hover:bg-green-600 text-black font-mono font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer border border-green-500"
                >
                  <span>{t('checkout.finish', { defaultValue: 'Finalizar e Ir para Loja' })}</span>
                  <ExternalLink size={14} className="stroke-[2.5]" />
                </button>

                {/* LINK DE POLÍTICA DE TROCA FACILITADA LOGO ABAIXO DO BOTÃO FINALIZAR */}
                <div className="text-center pt-1 pb-1">
                  <button
                    type="button"
                    id="link-politica-troca-facilitada"
                    onClick={() => {
                      playClickSound();
                      setIsExchangeModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 font-semibold underline underline-offset-4 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={13} className="text-green-600 shrink-0" />
                    <span>Política de Troca Facilitada</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Shopping Bag / Cart Drawer */}
    <AnimatePresence>
      {isCartDrawerOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex justify-end"
          onClick={() => setIsCartDrawerOpen(false)}
          id="cart-drawer-overlay"
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 h-full flex flex-col shadow-2xl font-sans"
            id="cart-drawer-content"
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-green-600" />
                <h3 className="font-mono font-black text-sm uppercase tracking-wider text-black dark:text-white">
                  Sacola de Treino ({cartCount})
                </h3>
              </div>
              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-zinc-400">
                    <ShoppingCart size={24} />
                  </div>
                  <p className="font-mono font-bold text-xs uppercase text-zinc-500">Sua sacola está vazia</p>
                  <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
                    Navegue pelo catálogo e adicione kimonos, faixas ou proteções para o seu treino.
                  </p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex gap-3 items-center"
                  >
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.title} 
                      className="w-16 h-16 object-contain bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-black dark:text-white truncate">
                        {item.product.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        {item.product.brand} {item.selectedSize ? `• Tam: ${item.selectedSize}` : ''}
                      </p>
                      <p className="font-mono font-bold text-xs text-green-600 mt-1">
                        R$ {(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={() => handleRemoveCartItem(item.id, item.product.title)}
                        className="text-zinc-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                        title="Remover"
                      >
                        <Trash2 size={13} />
                      </button>
                      <div className="flex items-center border border-zinc-200 dark:border-zinc-800">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="px-1.5 py-0.5 text-xs text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 font-mono font-bold text-xs text-black dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="px-1.5 py-0.5 text-xs text-zinc-500 hover:text-black dark:hover:text-white cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cartItems.length > 0 && (
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-3 shrink-0">
                {/* Coupon input */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <Input
                    value={cartDiscountCoupon}
                    onChange={(e) => setCartDiscountCoupon(e.target.value)}
                    placeholder="Cupom (ex: OSS10)"
                    className="h-8 text-xs font-mono rounded-none"
                  />
                  <Button type="submit" variant="outline" className="h-8 text-xs font-mono font-bold rounded-none shrink-0 cursor-pointer">
                    Aplicar
                  </Button>
                </form>
                {couponFeedbackMsg && (
                  <p className="text-[10px] font-mono text-green-600">{couponFeedbackMsg}</p>
                )}

                {/* Subtotal & Total */}
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-zinc-500">
                    <span>Subtotal:</span>
                    <span>R$ {cartSubtotal.toFixed(2)}</span>
                  </div>
                  {cartDiscountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto ({appliedDiscountPercent}%):</span>
                      <span>- R$ {cartDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-500">
                    <span>Frete:</span>
                    <span>{freightAmount === 0 ? 'GRÁTIS' : `R$ ${freightAmount.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-black dark:text-white pt-1 border-t border-zinc-200 dark:border-zinc-800">
                    <span>Total Estimado:</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Primary Button */}
                <Button
                  id="btn-cart-finalize"
                  onClick={handleStartCheckout}
                  className="w-full bg-green-600 hover:bg-green-500 text-black font-mono font-black uppercase text-xs tracking-wider py-3.5 rounded-none flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <span>Finalizar Compra</span>
                  <ArrowRight size={14} />
                </Button>

                {/* LINK DE POLÍTICA DE TROCA FACILITADA LOGO ABAIXO DO BOTÃO FINALIZAR NA SACOLA */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setIsExchangeModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-green-600 dark:hover:text-green-400 font-semibold underline underline-offset-4 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={12} className="text-green-600 shrink-0" />
                    <span>Política de Troca Facilitada</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Multi-step Checkout Progress Modal */}
    <AnimatePresence>
      {isCheckoutDrawerProgressOpen && (
        <div 
          className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setIsCheckoutDrawerProgressOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 w-full max-w-lg shadow-2xl relative font-sans overflow-hidden"
          >
            {/* Steps Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
              <div>
                <span className="text-[8px] font-mono font-black text-green-600 uppercase tracking-widest block">
                  ETAPA {checkoutStep} DE 3
                </span>
                <h3 className="text-sm font-black uppercase text-black dark:text-white">
                  {checkoutStep === 1 ? 'Endereço de Entrega' : checkoutStep === 2 ? 'Pagamento & Finalização' : 'Pedido Confirmado!'}
                </h3>
              </div>
              <button
                onClick={() => setIsCheckoutDrawerProgressOpen(false)}
                className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Step 1: Shipping */}
            {checkoutStep === 1 && (
              <form onSubmit={handleShippingSubmit} className="p-4 sm:p-5 space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-1">Nome Completo</label>
                  <Input value={shippingName} onChange={(e) => setShippingName(e.target.value)} required className="rounded-none text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-1">Telefone / WhatsApp</label>
                    <Input value={shippingPhone} onChange={(e) => setShippingPhone(e.target.value)} required className="rounded-none text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-1">CEP</label>
                    <Input value={shippingZip} onChange={(e) => handleZipChange(e.target.value)} placeholder="00000-000" required className="rounded-none text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-1">Endereço</label>
                  <Input value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} required className="rounded-none text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-1">Bairro</label>
                    <Input value={shippingBairro} onChange={(e) => setShippingBairro(e.target.value)} required className="rounded-none text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-1">Cidade / UF</label>
                    <Input value={shippingCityState} onChange={(e) => setShippingCityState(e.target.value)} required className="rounded-none text-xs" />
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full bg-black text-white dark:bg-white dark:text-black font-mono font-black uppercase text-xs py-3 rounded-none cursor-pointer">
                    Avançar para Pagamento
                  </Button>
                </div>
              </form>
            )}

            {/* Step 2: Payment & Finalizar */}
            {checkoutStep === 2 && (
              <div className="p-4 sm:p-5 space-y-4 text-xs">
                <div className="flex border border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`flex-1 py-2.5 font-mono font-bold text-xs uppercase cursor-pointer ${paymentMethod === 'pix' ? 'bg-green-600 text-black' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500'}`}
                  >
                    Pix (Aprovação Instantânea)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`flex-1 py-2.5 font-mono font-bold text-xs uppercase cursor-pointer ${paymentMethod === 'credit_card' ? 'bg-green-600 text-black' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500'}`}
                  >
                    Cartão de Crédito
                  </button>
                </div>

                {paymentMethod === 'pix' ? (
                  <div className="space-y-3 text-center">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <p className="font-mono font-bold text-sm text-green-600">Total: R$ {cartTotal.toFixed(2)}</p>
                      <p className="text-[11px] text-zinc-500">Copie o código Pix abaixo para pagar no seu app bancário:</p>
                      <Button type="button" variant="outline" onClick={handleCopyPix} className="w-full font-mono text-xs flex items-center justify-center gap-2 rounded-none">
                        <Copy size={13} />
                        {pixCopied ? "Código Copiado!" : "Copiar Código Pix Copia-e-Cola"}
                      </Button>
                    </div>

                    <Button
                      id="btn-multi-pix-finalize"
                      type="button"
                      onClick={handlePixCompleteSimulate}
                      className="w-full bg-green-600 hover:bg-green-500 text-black font-mono font-black uppercase text-xs py-3.5 rounded-none cursor-pointer"
                    >
                      Finalizar e Confirmar Pagamento Pix
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleCcSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-1">Número do Cartão</label>
                      <Input value={ccNumber} onChange={(e) => setCcNumber(e.target.value)} placeholder="0000 0000 0000 0000" required className="rounded-none text-xs font-mono" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-1">Nome no Cartão</label>
                      <Input value={ccName} onChange={(e) => setCcName(e.target.value)} placeholder="COMO NO CARTÃO" required className="rounded-none text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-1">Validade</label>
                        <Input value={ccExpiry} onChange={(e) => setCcExpiry(e.target.value)} placeholder="MM/AA" required className="rounded-none text-xs font-mono" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-1">CVV</label>
                        <Input value={ccCvv} onChange={(e) => setCcCvv(e.target.value)} placeholder="123" required className="rounded-none text-xs font-mono" />
                      </div>
                    </div>

                    <Button
                      id="btn-multi-cc-finalize"
                      type="submit"
                      disabled={isCcProcessing}
                      className="w-full bg-green-600 hover:bg-green-500 text-black font-mono font-black uppercase text-xs py-3.5 rounded-none cursor-pointer"
                    >
                      {isCcProcessing ? "Processando..." : `Finalizar Compra • R$ ${cartTotal.toFixed(2)}`}
                    </Button>
                  </form>
                )}

                {/* LINK DE POLÍTICA DE TROCA FACILITADA LOGO ABAIXO DO BOTÃO FINALIZAR NO CHECKOUT PROGRESS */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setIsExchangeModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-green-600 dark:hover:text-green-400 font-semibold underline underline-offset-4 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={12} className="text-green-600 shrink-0" />
                    <span>Política de Troca Facilitada</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {checkoutStep === 3 && (
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-lg font-black uppercase text-black dark:text-white">
                  Pedido {orderNumber} Confirmado!
                </h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                  Obrigado pelo seu pedido! O comprovante e o código de rastreio foram enviados para o seu e-mail cadastrado.
                </p>
                <div className="pt-2">
                  <Button
                    onClick={() => {
                      setIsCheckoutDrawerProgressOpen(false);
                      setCheckoutStep(1);
                    }}
                    className="bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs uppercase px-6 py-2.5 rounded-none"
                  >
                    Concluir e Voltar ao Catálogo
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Explanatory Easy Exchange Policy Modal for Beginner Athletes */}
    <EasyExchangePolicyModal
      isOpen={isExchangeModalOpen}
      onClose={() => setIsExchangeModalOpen(false)}
      onOpenSizeChart={() => {
        setIsExchangeModalOpen(false);
        // Can open size chart or scroll
      }}
      playClickSound={playClickSound}
    />

    {/* Toast Notifications */}
    <ToastContainer
      toasts={toasts}
      onDismissToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
    />
      </div>
    </TooltipProvider>
  );
};


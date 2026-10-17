import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  Eye,
  ShoppingBag,
  Award,
  Compass
} from 'lucide-react';
import { Product, Category } from '../types';

// Real BJJ photography assets from the repository
const bjjWhiteGiHero = (typeof import.meta !== 'undefined' && import.meta && import.meta.url) 
  ? new URL('../assets/images/jiujiteiro_white_gi_1783274643314.jpg', import.meta.url).href : '';
const bjjHalfSumoHero = (typeof import.meta !== 'undefined' && import.meta && import.meta.url) 
  ? new URL('../assets/images/bjj_halfsumo_hero_1781701341964.jpg', import.meta.url).href : '';
const bjjBeltsHero = (typeof import.meta !== 'undefined' && import.meta && import.meta.url) 
  ? new URL('../assets/images/jiujiteiro_belts_1783274698357.jpg', import.meta.url).href : '';
const bjjBlackGiHero = (typeof import.meta !== 'undefined' && import.meta && import.meta.url) 
  ? new URL('../assets/images/jiujiteiro_black_gi_1783274656005.jpg', import.meta.url).href : '';

export interface CinematicHeroProps {
  productList?: Product[];
  onQuickView?: (product: Product) => void;
  onNavigate?: (view: any) => void;
  onSelectCategory?: (category: Category | 'All') => void;
  onOpenFilterDrawer?: () => void;
}

interface CinematicScene {
  id: string;
  number: string;
  tag: string;
  kanji: string;
  headline: string;
  highlightWord: string;
  subtitle: string;
  specPill: string;
  imageUrl: string;
  category: Category;
  ctaText: string;
  accentColor: string; // Tailwind color string
}

export const CinematicHero: React.FC<CinematicHeroProps> = ({
  productList = [],
  onQuickView,
  onNavigate,
  onSelectCategory,
  onOpenFilterDrawer
}) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [progress, setProgress] = useState(0);

  // Web Audio Context for Zen Tatame Atmosphere Drone
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const oscHarmonicRef = useRef<OscillatorNode | null>(null);

  const scenes: CinematicScene[] = useMemo(() => [
    {
      id: 'scene-gi-white',
      number: '01',
      tag: t('hero.scene1_tag', { defaultValue: 'CENA 01 // A ARMADURA SUPREMA' }),
      kanji: '柔術 • 押忍',
      headline: t('hero.scene1_headline', { defaultValue: 'A CIÊNCIA DA PRESSÃO.' }),
      highlightWord: t('hero.scene1_highlight', { defaultValue: 'A ARTE DA SUPERAÇÃO.' }),
      subtitle: t('hero.scene1_subtitle', { defaultValue: 'Kimonos trançados de 450g/m² a 550g/m² com costuras triplas reforçadas e gola antibacteriana vulcanizada em EVA para resistir a qualquer pegada.' }),
      specPill: 'Tecido Pérola • 100% Algodão Pré-Encolhido • Homologado IBJJF',
      imageUrl: bjjWhiteGiHero || 'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=1920&auto=format&fit=crop',
      category: 'Kimonos',
      ctaText: t('hero.scene1_cta', { defaultValue: 'Explorar Kimonos de Elite' }),
      accentColor: '#22c55e'
    },
    {
      id: 'scene-nogi-rashguard',
      number: '02',
      tag: t('hero.scene2_tag', { defaultValue: 'CENA 02 // SEGUNDA PELE TÉRMICA' }),
      kanji: '無着 • 闘志',
      headline: t('hero.scene2_headline', { defaultValue: 'ZERO ATRITO NO TATAME.' }),
      highlightWord: t('hero.scene2_highlight', { defaultValue: 'MÁXIMA VELOCIDADE NO-GI.' }),
      subtitle: t('hero.scene2_subtitle', { defaultValue: 'Compressão anatômica 4-Way Stretch de alta densidade que regula a temperatura muscular e blinda sua pele contra queimaduras de lona e bactérias.' }),
      specPill: 'Costuras Planas Flatlock • Proteção UV50+ • Respirabilidade Extrema',
      imageUrl: bjjHalfSumoHero || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1920&auto=format&fit=crop',
      category: 'Rashguards',
      ctaText: t('hero.scene2_cta', { defaultValue: 'Ver Linha No-Gi & Rashguards' }),
      accentColor: '#eab308'
    },
    {
      id: 'scene-belts-legacy',
      number: '03',
      tag: t('hero.scene3_tag', { defaultValue: 'CENA 03 // O PESO DA GRADUAÇÃO' }),
      kanji: '道 • 継続',
      headline: t('hero.scene3_headline', { defaultValue: 'CADA NÓ UMA LIÇÃO.' }),
      highlightWord: t('hero.scene3_highlight', { defaultValue: 'CADA LISTRA UMA VITÓRIA.' }),
      subtitle: t('hero.scene3_subtitle', { defaultValue: 'Faixas artesanais estruturadas com miolo de lona pesada, 12 costuras perfeitamente alinhadas e ponteira tradicional em sarja de alta gramatura.' }),
      specPill: '100% Algodão Pesado • Espessura 4.5mm • Rigidez & Caimento Clássico',
      imageUrl: bjjBeltsHero || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1920&auto=format&fit=crop',
      category: 'Faixas',
      ctaText: t('hero.scene3_cta', { defaultValue: 'Conhecer Faixas de Graduação' }),
      accentColor: '#3b82f6'
    },
    {
      id: 'scene-black-mat',
      number: '04',
      tag: 'CENA 04 // SILÊNCIO & EFICIÊNCIA',
      kanji: '黒帯 • 覚悟',
      headline: 'A DISCIPLINA SILENCIOSA.',
      highlightWord: 'A PRESSÃO ESMAGADORA.',
      subtitle: 'Edições Stealth e Black Mat com bordados pretos em alta densidade para guerreiros que deixam apenas a técnica e o controle falarem.',
      specPill: 'Gramatura 550g/m² • Calça RipStop Militar • Tratamento Pré-Lavado',
      imageUrl: bjjBlackGiHero || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1920&auto=format&fit=crop',
      category: 'Kimonos',
      ctaText: 'Acessar Edição Black Mat',
      accentColor: '#ef4444'
    }
  ], [t]);

  const currentScene = scenes[currentSceneIndex];

  // Match a featured product from this category
  const featuredProduct = productList.find(p => p.category === currentScene.category) || productList[0];

  // Auto-advance scenes timer
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 50; // update progress every 50ms
    const totalDuration = 7000; // 7 seconds per slide
    const increment = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentSceneIndex((idx) => (idx + 1) % scenes.length);
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, scenes.length, currentSceneIndex]);

  // Handle manual scene switch
  const handleSelectScene = (index: number) => {
    setCurrentSceneIndex(index);
    setProgress(0);
    playSceneSwitchChime();
  };

  const handlePrevScene = () => {
    setCurrentSceneIndex((prev) => (prev - 1 + scenes.length) % scenes.length);
    setProgress(0);
    playSceneSwitchChime();
  };

  const handleNextScene = () => {
    setCurrentSceneIndex((prev) => (prev + 1) % scenes.length);
    setProgress(0);
    playSceneSwitchChime();
  };

  // Fullscreen Cinema mode
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn("Fullscreen toggle not allowed:", err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Soft Ambient Tatame Audio Oscillator (Web Audio API)
  const toggleAudioAmbience = () => {
    try {
      if (!isAudioActive) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 2.5); // very soft gentle drone
        masterGain.connect(ctx.destination);
        gainNodeRef.current = masterGain;

        // Warm 108Hz drone (deep meditative harmonic)
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(108, ctx.currentTime);
        osc.connect(masterGain);
        osc.start();
        oscRef.current = osc;

        // Subtle 216Hz overtone
        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(216, ctx.currentTime);
        const overtoneGain = ctx.createGain();
        overtoneGain.gain.setValueAtTime(0.03, ctx.currentTime);
        osc2.connect(overtoneGain);
        overtoneGain.connect(masterGain);
        osc2.start();
        oscHarmonicRef.current = osc2;

        setIsAudioActive(true);
      } else {
        if (gainNodeRef.current && audioCtxRef.current) {
          gainNodeRef.current.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.8);
          setTimeout(() => {
            try {
              oscRef.current?.stop();
              oscHarmonicRef.current?.stop();
              audioCtxRef.current?.close();
            } catch (e) {}
            audioCtxRef.current = null;
          }, 800);
        }
        setIsAudioActive(false);
      }
    } catch (e) {
      console.warn("Audio Context init error:", e);
      setIsAudioActive(false);
    }
  };

  // Gentle chime on scene transition if audio active
  const playSceneSwitchChime = () => {
    if (!isAudioActive || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(432, ctx.currentTime);
      chimeGain.gain.setValueAtTime(0.05, ctx.currentTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chimeOsc.start();
      chimeOsc.stop(ctx.currentTime + 1.2);
    } catch (e) {}
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      try {
        oscRef.current?.stop();
        oscHarmonicRef.current?.stop();
        audioCtxRef.current?.close();
      } catch (e) {}
    };
  }, []);

  const handleCtaClick = () => {
    if (onSelectCategory) {
      onSelectCategory(currentScene.category);
    }
    const el = document.getElementById('catalog-products-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-black text-white select-none transition-all duration-500 ${
        isFullscreen ? 'h-screen w-screen fixed inset-0 z-[9999]' : 'min-h-[580px] md:min-h-[640px] lg:min-h-[680px]'
      }`}
    >
      {/* 1. CINEMATIC BACKGROUND REEL WITH KEN BURNS MOTION */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene.id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1.0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{
            opacity: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
            scale: { duration: 7.5, ease: 'easeOut' }
          }}
          className="absolute inset-0 z-0 bg-black"
        >
          {/* Main Background Photo */}
          <img
            src={currentScene.imageUrl}
            alt={currentScene.headline}
            className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.12]"
            loading="eager"
            referrerPolicy="no-referrer"
          />

          {/* Cinematic Vignette & Dramatic Tatame Shading Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent lg:w-3/4" />
          <div className="absolute inset-0 [background:radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

          {/* Cinematic Film Grain & Anamorphic Scanlines Texture */}
          <div 
            className="absolute inset-0 opacity-[0.07] pointer-events-none mix-blend-overlay bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:4px_4px]"
            aria-hidden="true" 
          />

          {/* Anamorphic Subtle Blue/Cyan Lens Flare Streak */}
          <div 
            className="absolute top-1/4 -left-20 w-[600px] h-[2px] bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent blur-[1px] rotate-[-8deg] pointer-events-none"
            aria-hidden="true" 
          />
        </motion.div>
      </AnimatePresence>

      {/* 2. JAPANESE CALLIGRAPHY / BUSHIDO WATERMARK */}
      <div 
        className="absolute top-8 right-8 md:top-12 md:right-16 text-right z-10 pointer-events-none select-none opacity-20"
        aria-hidden="true"
      >
        <div className="text-6xl md:text-8xl font-black font-serif text-white tracking-widest uppercase">
          {currentScene.kanji}
        </div>
        <div className="text-[10px] md:text-xs font-mono tracking-[0.4em] uppercase text-zinc-400 mt-1">
          BUSHIDO // THE GENTLE ART
        </div>
      </div>

      {/* 3. CINEMATIC TOP STATUS STRIP (Telemetry & Mode Controls) */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex items-center justify-between gap-4">
        {/* Live Radar Telemetry Pill */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/60 border border-zinc-800 backdrop-blur-md font-mono text-[10px] uppercase tracking-wider text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-white font-bold">RADAR AO VIVO</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">HOMOLOGADO IBJJF</span>
          </div>
        </div>

        {/* Cinematic Controls: Audio, Play/Pause, Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Scene Prev/Next Navigation */}
          <div className="flex items-center border border-zinc-800 bg-black/40 backdrop-blur-md">
            <button
              onClick={handlePrevScene}
              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border-r border-zinc-800 cursor-pointer"
              title="Cena Anterior"
              aria-label="Cena Anterior"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={handleNextScene}
              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Próxima Cena"
              aria-label="Próxima Cena"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Zen Ambient Sound Button */}
          <button
            onClick={toggleAudioAmbience}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider border backdrop-blur-md transition-all cursor-pointer ${
              isAudioActive
                ? 'bg-green-500/20 text-green-300 border-green-500/40 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                : 'bg-black/40 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
            title={isAudioActive ? 'Silenciar Frequência Zen do Dojô' : 'Ativar Frequência Sonora Zen do Dojô'}
          >
            {isAudioActive ? <Volume2 size={13} className="text-green-400 animate-pulse" /> : <VolumeX size={13} />}
            <span className="hidden sm:inline">{isAudioActive ? 'Áudio Zen ON' : 'Áudio Zen'}</span>
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 bg-black/40 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white backdrop-blur-md transition-all cursor-pointer"
            title={isPlaying ? 'Pausar Transição Automática' : 'Retomar Transição Automática'}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 bg-black/40 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white backdrop-blur-md transition-all cursor-pointer"
            title={isFullscreen ? 'Sair do Modo Cinema' : 'Expandir para Modo Cinema Tela Cheia'}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* 4. MAIN CINEMATIC CONTENT (Storytelling & Action CTAs) */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 md:pl-24 md:pr-10 lg:pl-28 lg:pr-12 py-10 md:py-16 lg:py-20 flex flex-col justify-end min-h-[440px] md:min-h-[480px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          {/* Left Column: Narrative Headline & CTAs */}
          <div className="lg:col-span-8 space-y-5 max-w-3xl">
            {/* Scene Badge */}
            <motion.div
              key={`badge-${currentScene.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-black/70 border border-zinc-800 backdrop-blur-md"
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentScene.accentColor }} />
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-300">
                {currentScene.tag}
              </span>
            </motion.div>

            {/* Cinematic Headline with Blur entrance */}
            <div className="space-y-1">
              <motion.h1
                key={`headline-${currentScene.id}`}
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-sans uppercase tracking-tight text-white leading-[1.05]"
              >
                {currentScene.headline}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-white to-zinc-400 block sm:inline">
                  {currentScene.highlightWord}
                </span>
              </motion.h1>
            </div>

            {/* Narrative Subtitle */}
            <motion.p
              key={`desc-${currentScene.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-xs sm:text-sm md:text-base text-zinc-300 font-sans leading-relaxed max-w-2xl font-light"
            >
              {currentScene.subtitle}
            </motion.p>

            {/* Action CTA */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="pt-2"
            >
              <button
                onClick={handleCtaClick}
                className="px-7 py-3.5 bg-white text-black hover:bg-zinc-200 active:scale-[0.98] font-mono text-xs font-black uppercase tracking-widest transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <span>{currentScene.ctaText}</span>
                <ArrowRight size={15} />
              </button>
            </motion.div>
          </div>

          {/* Right Column: Featured Armor Glass Card */}
          {featuredProduct && (
            <div className="lg:col-span-4 hidden lg:block">
              <motion.div
                key={`featured-${currentScene.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-black/75 border-2 border-zinc-800 hover:border-zinc-700 backdrop-blur-xl p-4 transition-all shadow-2xl relative group"
              >
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-green-500/20 border border-green-500/40 text-green-400 font-mono text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                  <Flame size={10} className="animate-pulse" />
                  {t('hero.featured_badge', { defaultValue: 'DESTAQUE DA CENA' })}
                </div>

                <div className="flex gap-3.5 items-center">
                  <div className="w-20 h-24 bg-zinc-900 border border-zinc-800 shrink-0 overflow-hidden relative">
                    <img
                      src={featuredProduct.imageUrl}
                      alt={featuredProduct.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    {featuredProduct.originalPrice && featuredProduct.originalPrice > featuredProduct.price && (
                      <span className="absolute bottom-0 left-0 right-0 bg-red-600 text-white font-mono text-[8px] font-bold text-center py-0.5 uppercase">
                        -{Math.round(((featuredProduct.originalPrice - featuredProduct.price) / featuredProduct.originalPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block truncate">
                      {featuredProduct.brand} • {featuredProduct.platform}
                    </span>
                    <h4 className="text-xs font-bold text-white font-mono line-clamp-2 leading-tight">
                      {featuredProduct.title}
                    </h4>
                    <div className="pt-1 flex items-baseline gap-2">
                      <span className="text-sm font-black font-mono text-green-400">
                        R$ {featuredProduct.price.toFixed(2)}
                      </span>
                      {featuredProduct.originalPrice && (
                        <span className="text-[10px] font-mono text-zinc-500 line-through">
                          R$ {featuredProduct.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {onQuickView && (
                      <button
                        onClick={() => onQuickView(featuredProduct)}
                        className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-300 hover:text-white flex items-center gap-1 pt-1 cursor-pointer"
                      >
                        <Eye size={11} className="text-green-400" />
                        <span>Inspecionar Armadura</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* 5. CINEMATIC SCENE SELECTOR & TIME PROGRESS BARS */}
      <div className="relative z-20 border-t border-zinc-900/80 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            {scenes.map((scene, idx) => {
              const isActive = idx === currentSceneIndex;
              return (
                <button
                  key={scene.id}
                  onClick={() => handleSelectScene(idx)}
                  className={`relative p-2.5 sm:p-3 text-left transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-zinc-900/80 border-zinc-700'
                      : 'bg-transparent border-transparent hover:border-zinc-800 hover:bg-zinc-950/60'
                  }`}
                >
                  {/* Linear Progress Bar for active slide */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-zinc-800 overflow-hidden">
                    {isActive ? (
                      <div
                        className="h-full transition-all ease-linear"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: scene.accentColor
                        }}
                      />
                    ) : (
                      <div className="h-full w-0" />
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-[9px] font-mono font-black tracking-widest ${
                        isActive ? 'text-white' : 'text-zinc-500'
                      }`}
                    >
                      {scene.number} // {scene.category.toUpperCase()}
                    </span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: scene.accentColor }} />
                    )}
                  </div>

                  <p
                    className={`text-[10px] sm:text-xs font-mono font-bold uppercase truncate ${
                      isActive ? 'text-zinc-200' : 'text-zinc-400'
                    }`}
                  >
                    {scene.headline}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. PREV / NEXT ARROWS ON SIDES (Desktop Hover - positioned with safe clearance away from text) */}
      <button
        onClick={handlePrevScene}
        className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/60 hover:bg-black border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md hidden md:flex shadow-2xl group"
        title="Cena Anterior"
        aria-label="Cena Anterior"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        onClick={handleNextScene}
        className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/60 hover:bg-black border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md hidden md:flex shadow-2xl group"
        title="Próxima Cena"
        aria-label="Próxima Cena"
      >
        <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};

export default CinematicHero;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Moon, 
  Sparkles, 
  Instagram, 
  X, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  BookOpen, 
  ArrowRight,
  Flame,
  Shield
} from 'lucide-react';

interface Quote {
  pt: string;
  en: string;
  es: string;
}

const WOLF_QUOTES: Quote[] = [
  {
    pt: "Trabalhe em silêncio. Deixe que o seu sucesso faça barulho. No tatame da vida, os que mais gritam costumam cansar primeiro.",
    en: "Work in silence. Let your success make the noise. On the mat of life, those who scream the loudest usually tire first.",
    es: "Trabaja en silencio. Deja que tu éxito haga ruido. En el tatami de la vida, los que más gritan suelen cansarse primero."
  },
  {
    pt: "O lobo não se importa com a opinião das ovelhas. Treine quando eles dormirem, estude quando eles se divertirem, viva o que eles sonham.",
    en: "The wolf doesn't care about the sheep's opinion. Train while they sleep, study while they have fun, live what they dream.",
    es: "El lobo no se preocupa por la opinión de las ovejas. Entrena cuando duerman, estudia cuando se diviertan, vive lo que sueñan."
  },
  {
    pt: "O verdadeiro guerreiro não busca o combate fácil, ele busca a mente inabalável. A pressão molda o diamante, o tatame molda o caráter.",
    en: "The true warrior doesn't seek easy combat, he seeks an unshakable mind. Pressure molds diamonds, the mat molds character.",
    es: "El verdadero guerrero no busca el combate fácil, busca la mente inquebrantable. La presión moldea el diamante, el tatami moldea el carácter."
  },
  {
    pt: "Um lobo ferido continua sendo um lobo. Ele apenas recua temporariamente para curar suas feridas no silêncio da noite, e volta mais forte.",
    en: "A wounded wolf is still a wolf. He only retreats temporarily to heal his wounds in the silence of the night, returning stronger.",
    es: "Un lobo herido sigue siendo un lobo. Solo se retira temporalmente para curar sus heridas en el silencio de la noche, y regresa más fuerte."
  },
  {
    pt: "Não espere que o caminho seja fácil, espere ser forte o suficiente para percorrê-lo. A técnica vence a força, a consistência vence o talento.",
    en: "Do not expect the path to be easy, expect to be strong enough to walk it. Technique beats strength, consistency beats talent.",
    es: "No esperes que el camino sea fácil, espera ser lo suficientemente fuerte como para recorrerlo. La técnica vence a la fuerza, la consistencia al talento."
  },
  {
    pt: "O silêncio é a virtude dos fortes. Quem muito fala, pouco faz. Deixe que suas pegadas e seu Jiu-Jitsu falem por você.",
    en: "Silence is the virtue of the strong. He who speaks much, does little. Let your footsteps and your Jiu-Jitsu speak for you.",
    es: "El silencio es la virtud de los fuertes. Quien mucho habla, poco hace. Deja que tus huellas y tu Jiu-Jitsu hablen por ti."
  },
  {
    pt: "A alcateia avança unida. A lealdade aos seus irmãos de tatame é sua maior armadura. Se quer ir rápido, vá sozinho. Se quer ir longe, vá em alcateia.",
    en: "The pack moves together. Loyalty to your mat brothers is your greatest armor. If you want to go fast, go alone. If you want to go far, go as a pack.",
    es: "La manada avanza unida. La lealtad a tus hermanos de tatami es tu mayor armadura. Si quieres ir rápido, ve solo. Si quieres ir lejos, ve en manada."
  },
  {
    pt: "Cale os ruídos externos. O único oponente que você realmente precisa vencer é aquele que te olha de volta no espelho todas as manhãs.",
    en: "Silence the external noise. The only opponent you really need to defeat is the one looking back at you in the mirror every morning.",
    es: "Silencia el ruido externo. El único oponente que realmente necesitas vencer es el que te mira en el espejo cada mañana."
  },
  {
    pt: "O cansaço faz covardes de todos nós. Domine seu corpo, mas acima de tudo, governe sua mente quando o ar começar a faltar.",
    en: "Fatigue makes cowards of us all. Master your body, but above all, govern your mind when the air begins to fade.",
    es: "El cansancio nos hace cobardes a todos. Domina tu cuerpo, pero sobre todo, gobierna tu mente cuando empiece a faltar el aire."
  },
  {
    pt: "Não há glória no que é fácil. O valor da vitória está diretamente ligado à profundidade do abismo que você teve que atravessar.",
    en: "There is no glory in what is easy. The value of victory is directly linked to the depth of the abyss you had to cross.",
    es: "No hay gloria en lo fácil. El valor de la victoria está directamente ligado a la profundidad del abismo que tuviste que cruzar."
  }
];

export function WolfWisdom() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [binauralNode, setBinauralNode] = useState<OscillatorNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);

  const currentLang = (i18n.language || 'pt').split('-')[0] as 'pt' | 'en' | 'es';
  const displayLang = ['pt', 'en', 'es'].includes(currentLang) ? currentLang : 'pt';

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % WOLF_QUOTES.length);
  };

  const toggleAudio = () => {
    if (isAudioPlaying) {
      stopBinauralDrone();
    } else {
      startBinauralDrone();
    }
  };

  const startBinauralDrone = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Low frequency meditative brownian-like hum (96Hz is beautiful and very deep, wolf-like meditation vibe)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(96, ctx.currentTime);

      // Low volume to be extremely non-intrusive and relaxing
      gain.gain.setValueAtTime(0.06, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      setAudioContext(ctx);
      setBinauralNode(osc);
      setGainNode(gain);
      setIsAudioPlaying(true);
    } catch (e) {
      console.warn("Failed to initialize Web Audio API for Wolf Drone:", e);
    }
  };

  const stopBinauralDrone = () => {
    if (binauralNode) {
      try {
        binauralNode.stop();
      } catch (e) {}
    }
    if (audioContext) {
      try {
        audioContext.close();
      } catch (e) {}
    }
    setBinauralNode(null);
    setGainNode(null);
    setAudioContext(null);
    setIsAudioPlaying(false);
  };

  useEffect(() => {
    // Automatically pick a random quote index on component load
    setQuoteIndex(Math.floor(Math.random() * WOLF_QUOTES.length));

    return () => {
      // Clean up sound drone if playing when unmounted
      if (binauralNode) {
        try {
          binauralNode.stop();
        } catch (e) {}
      }
    };
  }, []);

  const currentQuote = WOLF_QUOTES[quoteIndex][displayLang];

  return (
    <>
      {/* Subtle Floating Wolf-Theme Activation Button */}
      <motion.button
        id="btn-lobo-mensageiro-trigger"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.08, boxShadow: "0px 0px 20px rgba(204, 0, 0, 0.3)" }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-6 z-[45] flex items-center gap-2 px-3.5 py-2.5 bg-black dark:bg-zinc-950 text-white border-2 border-zinc-800 dark:border-zinc-800 hover:border-[#cc0000] dark:hover:border-[#cc0000] transition-colors shadow-lg cursor-pointer"
        title="O Lobo Mensageiro"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#cc0000] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#cc0000]"></span>
        </span>
        <Moon size={13} className="text-zinc-300 animate-pulse" />
        <span className="font-mono text-[9px] font-black uppercase tracking-widest">Lobo Mensageiro</span>
      </motion.button>

      {/* Aesthetic Modal Container */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            {/* Modal Backdrop Click */}
            <div className="absolute inset-0" onClick={() => { setIsOpen(false); stopBinauralDrone(); }} />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-lg bg-zinc-950 border-4 border-black text-white p-6 md:p-8 shadow-[10px_10px_0px_#000000] dark:shadow-[10px_10px_0px_rgba(204,0,0,0.2)] overflow-hidden"
            >
              {/* Subtle visual details matching the site's Japanese-ink print theme */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,rgba(204,0,0,0.15),transparent_70%)] pointer-events-none" />

              {/* Header Red Accent Stamp */}
              <div className="absolute top-4 left-4 bg-[#cc0000] text-white px-2 py-1 border border-black text-[7px] font-mono font-black tracking-widest select-none uppercase">
                ALCATEIA
              </div>

              {/* Close Button */}
              <button
                onClick={() => { setIsOpen(false); stopBinauralDrone(); }}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 hover:bg-zinc-900 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X size={16} className="stroke-[3px]" />
              </button>

              <div className="mt-4 flex flex-col items-center text-center space-y-6">
                {/* Visual Avatar / Icon Group */}
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800">
                  <Moon size={28} className="text-zinc-100 animate-pulse" />
                  <Sparkles size={12} className="absolute top-1.5 right-1.5 text-zinc-400" />
                </div>

                {/* Brand Identity */}
                <div className="space-y-1">
                  <h3 className="font-sans font-black uppercase text-xl md:text-2xl italic tracking-tighter leading-none text-[#cc0000] skew-x-[-4deg]">
                    O Lobo Mensageiro
                  </h3>
                  <p className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest">
                    — Sapiência do Tatame & Consistência Silenciosa —
                  </p>
                </div>

                <div className="w-full h-[1px] bg-zinc-900" />

                {/* Quote Block with Typewriter Style */}
                <div className="relative py-4 min-h-[110px] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={quoteIndex}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3 }}
                      className="font-serif italic text-sm md:text-base text-zinc-200 leading-relaxed max-w-md pl-4 border-l-2 border-[#cc0000]"
                    >
                      "{currentQuote}"
                    </motion.p>
                  </AnimatePresence>
                </div>

                <div className="w-full h-[1px] bg-zinc-900" />

                {/* Controls & External Links */}
                <div className="w-full flex flex-col sm:flex-row gap-3 justify-between items-center text-xs">
                  {/* Web Audio Meditative Drone Trigger */}
                  <button
                    onClick={toggleAudio}
                    className={`flex items-center gap-2 px-3 py-1.5 border transition-all text-[10px] font-mono uppercase tracking-wider ${
                      isAudioPlaying
                        ? 'bg-zinc-900 text-[#cc0000] border-[#cc0000]'
                        : 'bg-transparent text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-500'
                    }`}
                    title={isAudioPlaying ? "Desativar Foco" : "Ativar Som Meditativo"}
                  >
                    {isAudioPlaying ? (
                      <>
                        <Volume2 size={11} className="animate-bounce" />
                        <span>Foco Ativo (96Hz)</span>
                      </>
                    ) : (
                      <>
                        <VolumeX size={11} />
                        <span>Frequência de Foco</span>
                      </>
                    )}
                  </button>

                  {/* Primary Interactive buttons */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleNextQuote}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-[9px] uppercase tracking-widest border border-zinc-800 transition-colors cursor-pointer"
                    >
                      <span>Inspirar</span>
                      <ChevronRight size={10} />
                    </button>

                    <a
                      href="https://www.instagram.com/lobomensageiro_"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-[#cc0000] hover:bg-black text-white font-mono text-[9px] uppercase tracking-widest border border-black transition-colors cursor-pointer"
                    >
                      <Instagram size={10} />
                      <span>Alcateia</span>
                    </a>
                  </div>
                </div>

                {/* Little stoic footnote */}
                <div className="text-[7px] text-zinc-500 font-mono uppercase tracking-widest flex items-center gap-1.5">
                  <Shield size={8} />
                  <span>Silêncio • Trabalho • Lealdade</span>
                  <Flame size={8} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

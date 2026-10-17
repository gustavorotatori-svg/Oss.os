import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Radio } from 'lucide-react';
import { getAudio, saveAudio } from '../src/lib/audioDb';

interface CustomAudioPlayerProps {
  id: string;
  audioUrl?: string;
  title?: string;
  content?: string;
}

export const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ id, audioUrl, title, content }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);

  // Fallback SpeecSynthesis & Synth Drone States
  const [isSynthMode, setIsSynthMode] = useState(false);
  const [synthTextSentences, setSynthTextSentences] = useState<string[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  // Synchronize playbackRate changes to the underlying HTMLAudioElement
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, audioSrc]);

  // Web Audio Synth Drone References
  const droneContextRef = useRef<AudioContext | null>(null);
  const droneOsc1Ref = useRef<OscillatorNode | null>(null);
  const droneOsc2Ref = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);

  const getCleanSentences = (html: string): string[] => {
    if (!html) return [];
    const cleanText = html
      .replace(/<[^>]*>/g, ' ') // strip HTML tags
      .replace(/\s+/g, ' ')      // clean whitespace
      .trim();
    if (!cleanText) return [];
    
    // Split sentences using standard punctuation, ignoring small technical abbreviations
    return cleanText
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.trim().length > 4);
  };

  useEffect(() => {
    const loadAudio = async () => {
      setIsLoading(true);
      setIsSynthMode(false);
      try {
        // 1. Try to get from local IndexedDB cache first
        const cachedData = await getAudio(id);
        if (cachedData) {
          console.log(`[AudioPlayer] Loaded from cache: ${id}`);
          if (cachedData instanceof Blob) {
            setAudioSrc(URL.createObjectURL(cachedData));
          } else if (typeof cachedData === 'string' && cachedData.startsWith('data:')) {
            setAudioSrc(cachedData);
          }
        } else if (audioUrl && !audioUrl.startsWith("data:") && !audioUrl.includes("SoundHelix") && !audioUrl.includes("soundhelix")) {
          // 2. Fetch from normal URL and cache it
          console.log(`[AudioPlayer] Fetching from URL: ${audioUrl}`);
          const res = await fetch(audioUrl);
          if (!res.ok) throw new Error("Throttled/Unavailable");
          const newBlob = await res.blob();
          await saveAudio(id, newBlob);
          setAudioSrc(URL.createObjectURL(newBlob));
        } else if (audioUrl) {
          // Play the soundhelix directly
          setAudioSrc(audioUrl);
        } else {
          // No audio available, trigger synthesis
          setIsSynthMode(true);
        }
      } catch (error) {
        console.warn('[AudioPlayer] Audio fetch failed. Activating SpeechSynthesis fallback.', error);
        setIsSynthMode(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadAudio();

    return () => {
      if (audioSrc && audioSrc.startsWith('blob:')) {
        URL.revokeObjectURL(audioSrc);
      }
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
      stopSynthDrone();
    };
  }, [id, audioUrl]);

  const startSynthDrone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      droneContextRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1.5); // gradual fade in
      droneGainRef.current = gain;

      // Low A1 sub frequency (55Hz)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, ctx.currentTime);
      droneOsc1Ref.current = osc1;

      // Harmonious detuned triangle wave (110.3Hz) to sound atmospheric
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(110.3, ctx.currentTime);
      droneOsc2Ref.current = osc2;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, ctx.currentTime); // keep it extremely warm and sub-heavy

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
    } catch (e) {
      console.warn("Could not start ambient drone synth:", e);
    }
  };

  const stopSynthDrone = () => {
    try {
      if (droneGainRef.current && droneContextRef.current) {
        const ctx = droneContextRef.current;
        droneGainRef.current.gain.setValueAtTime(droneGainRef.current.gain.value, ctx.currentTime);
        droneGainRef.current.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 0.8);
      }
      setTimeout(() => {
        if (droneOsc1Ref.current) droneOsc1Ref.current.stop();
        if (droneOsc2Ref.current) droneOsc2Ref.current.stop();
        if (droneContextRef.current) droneContextRef.current.close();
        droneOsc1Ref.current = null;
        droneOsc2Ref.current = null;
        droneContextRef.current = null;
      }, 900);
    } catch (e) {}
  };

  const speakSentence = (index: number, sentences: string[]) => {
    if (!isPlaying) return;
    if (index >= sentences.length) {
      setIsPlaying(false);
      setCurrentSentenceIndex(0);
      setCurrentTime(0);
      stopSynthDrone();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const text = sentences[index];
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find(v => v.lang.startsWith('pt-BR') || v.lang.startsWith('pt'));
      if (ptVoice) utterance.voice = ptVoice;
      
      utterance.rate = 0.92 * playbackRate; // reflective pace scaled by speed controls
      utterance.pitch = 0.82; // deeper, authoritative frequency (Lobo Mensageiro)
      
      utterance.onend = () => {
        const nextIdx = index + 1;
        setCurrentSentenceIndex(nextIdx);
        setCurrentTime(nextIdx);
        speakSentence(nextIdx, sentences);
      };

      utterance.onerror = () => {
        const nextIdx = index + 1;
        setCurrentSentenceIndex(nextIdx);
        setCurrentTime(nextIdx);
        speakSentence(nextIdx, sentences);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsPlaying(false);
      stopSynthDrone();
    }
  };

  const togglePlay = () => {
    if (isSynthMode) {
      const sentences = getCleanSentences(content || title || "Diário dos OSS.OS");
      if (sentences.length === 0) return;

      if (isPlaying) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
        stopSynthDrone();
        setIsPlaying(false);
      } else {
        setSynthTextSentences(sentences);
        setDuration(sentences.length);
        setIsPlaying(true);
        startSynthDrone();
        
        // Use timeout to ensure state settles
        setTimeout(() => {
          speakSentence(currentSentenceIndex, sentences);
        }, 100);
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Pause all other standard players
        document.querySelectorAll('audio').forEach(el => {
          if (el !== audioRef.current) el.pause();
        });
        audioRef.current.play().catch(e => console.warn(e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      audioRef.current.playbackRate = playbackRate;
    }
  };

  const onProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      
      if (isSynthMode) {
        const sentences = getCleanSentences(content || title || "Diário dos OSS.OS");
        const idx = Math.min(Math.floor(percentage * sentences.length), sentences.length - 1);
        setCurrentSentenceIndex(idx);
        setCurrentTime(idx);
        if (isPlaying) {
          speakSentence(idx, sentences);
        }
      } else if (audioRef.current && duration > 0) {
        audioRef.current.currentTime = percentage * duration;
      }
    }
  };

  const formatTime = (time: number) => {
    if (isSynthMode) {
      return `${Math.floor(time)}/${Math.floor(duration)} seg`;
    }
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    if (isSynthMode) {
      setIsMuted(!isMuted);
      if (!isMuted) {
        // Mute synthesis
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      } else if (isPlaying) {
        speakSentence(currentSentenceIndex, synthTextSentences);
      }
    } else if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const resetAudio = () => {
    if (isSynthMode) {
      setCurrentSentenceIndex(0);
      setCurrentTime(0);
      if (isPlaying) {
        speakSentence(0, synthTextSentences);
      }
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (!isPlaying) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const activeSubtitle = isSynthMode && isPlaying && synthTextSentences[currentSentenceIndex];

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-900 p-5 w-full">
      <style>{`
        @keyframes bjj-wave-0 {
          0% { transform: scaleY(0.3); }
          50% { transform: scaleY(1.1); }
          100% { transform: scaleY(0.5); }
        }
        @keyframes bjj-wave-1 {
          0% { transform: scaleY(0.5); }
          50% { transform: scaleY(0.2); }
          100% { transform: scaleY(1.2); }
        }
        @keyframes bjj-wave-2 {
          0% { transform: scaleY(0.2); }
          50% { transform: scaleY(1.0); }
          100% { transform: scaleY(0.4); }
        }
        @keyframes bjj-wave-3 {
          0% { transform: scaleY(0.4); }
          50% { transform: scaleY(0.3); }
          100% { transform: scaleY(1.3); }
        }
      `}</style>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={togglePlay}
              className="bg-black dark:bg-white text-white dark:text-black w-10 h-10 flex items-center justify-center hover:bg-red-600 dark:hover:bg-red-600 dark:hover:text-white transition-all transform active:scale-95"
              disabled={isLoading}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <div>
              <p className="text-[9px] font-mono leading-none font-black uppercase tracking-widest text-[#222] dark:text-zinc-500 flex items-center gap-1.5 mb-1">
                <Radio size={10} className={isPlaying ? "animate-pulse text-red-600" : "text-zinc-400"} />
                {isSynthMode ? 'SINAL ANALÓGICO RECONFIGURADO' : 'SINAL DIGITAL RÁDIO TATAME'}
              </p>
              <h4 className="text-xs font-black uppercase tracking-tight truncate max-w-[280px]">
                {title || 'Relatório de Inteligência'}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Speed Control Buttons */}
            <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-none overflow-hidden select-none bg-zinc-150/50 dark:bg-zinc-900/50 mr-1">
              {([1.0, 1.25, 1.5] as const).map(rate => (
                <button
                  key={rate}
                  onClick={() => setPlaybackRate(rate)}
                  title={`Velocidade ${rate}x`}
                  className={`text-[9px] font-mono font-black px-1.5 py-0.5 border-r last:border-r-0 border-zinc-200 dark:border-zinc-800 transition-all ${
                    playbackRate === rate 
                      ? 'bg-red-600 text-white dark:bg-red-600 dark:text-white' 
                      : 'text-zinc-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {rate === 1.0 ? '1x' : `${rate}x`}
                </button>
              ))}
            </div>
            <button onClick={resetAudio} className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
              <RotateCcw size={14} />
            </button>
            <button onClick={toggleMute} className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        </div>

        {/* Animated Waveform Visualizer */}
        <div className="flex items-end justify-between h-9 w-full px-2 py-1 bg-zinc-100/40 dark:bg-zinc-900/20 border border-zinc-200/50 dark:border-zinc-800/50 rounded-none overflow-hidden select-none">
          {Array.from({ length: 48 }).map((_, i) => {
            const factor = i < 24 ? i / 24 : (48 - i) / 24;
            const staticHeight = 6 + factor * 22 + Math.sin(i * 0.45) * 4;
            const boundedHeight = Math.max(3, Math.min(28, staticHeight));
            return (
              <div
                key={i}
                className="w-[1.5px] bg-red-600 dark:bg-red-500 rounded-full transition-all duration-300"
                style={{
                  height: `${boundedHeight}px`,
                  transformOrigin: 'bottom',
                  animation: isPlaying 
                    ? `bjj-wave-${i % 4} ${0.6 + (i % 3) * 0.15}s ease-in-out infinite alternate` 
                    : 'none',
                  animationDelay: `${i * 15}ms`,
                  opacity: isPlaying ? 0.95 : 0.35,
                }}
              />
            );
          })}
        </div>

        <div className="flex flex-col gap-1.5">
          <div 
            ref={progressRef}
            onClick={onProgressClick}
            className="h-1 bg-zinc-200 dark:bg-zinc-800/60 w-full cursor-pointer relative overflow-hidden"
          >
            <div 
              className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-300"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between">
            <span className="text-[9px] font-mono text-zinc-400">{formatTime(currentTime)}</span>
            <span className="text-[9px] font-mono text-zinc-400">{formatTime(duration)}</span>
          </div>
        </div>

        {activeSubtitle && (
          <div className="mt-1 border-l-2 border-red-600 pl-3 py-1.5 bg-red-600/[0.02] dark:bg-red-600/[0.01]">
            <p className="text-[10px] font-mono leading-relaxed text-zinc-600 dark:text-zinc-400 italic">
              "{activeSubtitle}"
            </p>
          </div>
        )}

        {audioSrc && !isSynthMode && (
          <audio 
            ref={audioRef}
            src={audioSrc}
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )}
      </div>
    </div>
  );
};

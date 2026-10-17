import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseVoiceSearchOptions {
  lang?: string;
  onTranscriptChange?: (text: string, isFinal: boolean) => void;
  onTranscriptFinal?: (text: string) => void;
}

export interface UseVoiceSearchResult {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  amplitude: number; // 0 to 1 normalized voice amplitude
  frequencyBands: number[]; // 7 normalized frequency bands for compact header bar
  detailedBands: number[]; // 16 normalized frequency bands for expanded modal
  isSupported: boolean;
  error: string | null;
  startListening: () => Promise<boolean>;
  stopListening: () => void;
  cancelListening: () => void;
  resetTranscript: () => void;
}

export function useVoiceSearch(options: UseVoiceSearchOptions = {}): UseVoiceSearchResult {
  const { lang = 'pt-BR', onTranscriptChange, onTranscriptFinal } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [amplitude, setAmplitude] = useState(0);
  const [frequencyBands, setFrequencyBands] = useState<number[]>([0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]);
  const [detailedBands, setDetailedBands] = useState<number[]>(new Array(16).fill(0.1));
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const smoothedAmplitudeRef = useRef<number>(0);
  const isListeningRef = useRef<boolean>(false);

  // Check Web Speech API support
  const isSupported = typeof window !== 'undefined' && 
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const cleanUpAudio = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      } catch (e) {
        // Ignore track cleanup error
      }
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // Ignore audioContext cleanup error
      }
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    smoothedAmplitudeRef.current = 0;
    setAmplitude(0);
    setFrequencyBands([0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08]);
    setDetailedBands(new Array(16).fill(0.08));
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore stop error
      }
      recognitionRef.current = null;
    }

    cleanUpAudio();

    if (transcript.trim() && onTranscriptFinal) {
      onTranscriptFinal(transcript.trim());
    }
  }, [cleanUpAudio, transcript, onTranscriptFinal]);

  const cancelListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore abort error
      }
      recognitionRef.current = null;
    }

    cleanUpAudio();
    setTranscript('');
    setInterimTranscript('');
  }, [cleanUpAudio]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  const startAudioAnalyser = useCallback(async () => {
    try {
      if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia not supported');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128; // 64 frequency bins
      analyser.smoothingTimeConstant = 0.7;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const analyze = () => {
        if (!isListeningRef.current) return;

        analyser.getByteFrequencyData(dataArray);

        // Calculate average volume across voice-relevant spectrum (bins 1 to 32)
        let sum = 0;
        let count = 0;
        for (let i = 1; i < Math.min(32, bufferLength); i++) {
          sum += dataArray[i];
          count++;
        }

        const rawAverage = count > 0 ? sum / count / 255 : 0;
        // Non-linear amplification for human vocal range sensitivity
        const instantAmp = Math.min(1, Math.pow(rawAverage * 2.2, 0.85));

        // Smooth transition (ease in/out)
        const smoothed = smoothedAmplitudeRef.current * 0.4 + instantAmp * 0.6;
        smoothedAmplitudeRef.current = smoothed;
        setAmplitude(smoothed);

        // Group into 7 discrete frequency bands for compact header bar
        const bands7: number[] = [];
        const bandSize = Math.floor(28 / 7);
        for (let b = 0; b < 7; b++) {
          let bSum = 0;
          for (let k = 0; k < bandSize; k++) {
            bSum += dataArray[1 + b * bandSize + k] || 0;
          }
          const bAvg = bSum / bandSize / 255;
          const boosted = Math.min(1, Math.max(0.1, Math.pow(bAvg * 2.0, 0.9)));
          bands7.push(boosted);
        }
        setFrequencyBands(bands7);

        // Group into 16 discrete frequency bands for wide modal
        const bands16: number[] = [];
        const bandSize16 = Math.floor(32 / 16);
        for (let b = 0; b < 16; b++) {
          let bSum = 0;
          for (let k = 0; k < bandSize16; k++) {
            bSum += dataArray[1 + b * bandSize16 + k] || 0;
          }
          const bAvg = bSum / bandSize16 / 255;
          const boosted = Math.min(1, Math.max(0.08, Math.pow(bAvg * 2.1, 0.88)));
          bands16.push(boosted);
        }
        setDetailedBands(bands16);

        animationFrameRef.current = requestAnimationFrame(analyze);
      };

      animationFrameRef.current = requestAnimationFrame(analyze);
    } catch (err: any) {
      console.warn('Microphone getUserMedia not available or denied, using synthetic audio pulse fallback:', err);
      // Fallback: Organic synthetic wave animation synchronized with listening state
      let step = 0;
      const simulateWave = () => {
        if (!isListeningRef.current) return;
        step += 0.12;
        const wave = 0.25 + 0.35 * Math.abs(Math.sin(step)) + 0.15 * Math.cos(step * 1.7);
        const amp = Math.min(1, Math.max(0.15, wave));
        setAmplitude(amp);

        const bands7 = [0, 1, 2, 3, 4, 5, 6].map(i => {
          return Math.min(1, Math.max(0.12, 0.2 + 0.6 * Math.abs(Math.sin(step + i * 0.8))));
        });
        setFrequencyBands(bands7);

        const bands16 = Array.from({ length: 16 }, (_, i) => {
          return Math.min(1, Math.max(0.1, 0.2 + 0.7 * Math.abs(Math.sin(step + i * 0.4))));
        });
        setDetailedBands(bands16);

        animationFrameRef.current = requestAnimationFrame(simulateWave);
      };
      animationFrameRef.current = requestAnimationFrame(simulateWave);
    }
  }, []);

  const startListening = useCallback(async (): Promise<boolean> => {
    setError(null);

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setError('Navegador não suporta reconhecimento de voz.');
      return false;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }

      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;
      recognition.lang = lang;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalTrans = '';
        let interimTrans = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTrans += res[0].transcript;
          } else {
            interimTrans += res[0].transcript;
          }
        }

        const fullText = (finalTrans || interimTrans).trim();
        setTranscript(fullText);
        setInterimTranscript(interimTrans);

        if (onTranscriptChange) {
          onTranscriptChange(fullText, Boolean(finalTrans));
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'aborted') {
          console.warn('Speech recognition event error:', event.error);
          setError(`Erro no microfone: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // If we still intend to listen and wasn't stopped manually, keep listening
        if (isListeningRef.current) {
          try {
            recognition.start();
            return;
          } catch (e) {
            // Already started or terminated
          }
        }
        setIsListening(false);
        isListeningRef.current = false;
        cleanUpAudio();
      };

      recognition.start();
      isListeningRef.current = true;
      setIsListening(true);

      // Start Web Audio analyser in parallel
      await startAudioAnalyser();
      return true;
    } catch (e: any) {
      console.error('Error starting speech recognition:', e);
      setError('Falha ao iniciar microfone.');
      setIsListening(false);
      isListeningRef.current = false;
      cleanUpAudio();
      return false;
    }
  }, [lang, onTranscriptChange, startAudioAnalyser, cleanUpAudio]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
      cleanUpAudio();
    };
  }, [cleanUpAudio]);

  return {
    isListening,
    transcript,
    interimTranscript,
    amplitude,
    frequencyBands,
    detailedBands,
    isSupported,
    error,
    startListening,
    stopListening,
    cancelListening,
    resetTranscript,
  };
}

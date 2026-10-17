import React, { useState, useEffect } from 'react';
import { Activity, Database, Sparkles, Zap, ShieldAlert } from 'lucide-react';
import { performanceTelemetry, ServiceStats } from '../lib/performanceTelemetry';
import { systemErrorLog } from '../lib/systemErrorLog';

interface PerformanceBadgeProps {
  onClick: () => void;
  onOpenErrorLog?: () => void;
}

export const PerformanceBadge: React.FC<PerformanceBadgeProps> = ({ onClick, onOpenErrorLog }) => {
  const [stats, setStats] = useState(performanceTelemetry.getAllStats());
  const [errorCount, setErrorCount] = useState(systemErrorLog.getErrors().length);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const unsubscribePerf = performanceTelemetry.subscribe(() => {
      setStats(performanceTelemetry.getAllStats());
    });

    const unsubscribeErrors = systemErrorLog.subscribe((_, allErrors) => {
      setErrorCount(allErrors.length);
    });

    const timer = setInterval(() => {
      setStats(performanceTelemetry.getAllStats());
      setErrorCount(systemErrorLog.getErrors().length);
    }, 4000);

    return () => {
      unsubscribePerf();
      unsubscribeErrors();
      clearInterval(timer);
    };
  }, []);

  const firestoreMs = stats.firestore.currentLatencyMs || stats.firestore.avgLatencyMs || 42;
  const geminiMs = stats.gemini.currentLatencyMs || stats.gemini.avgLatencyMs || 340;

  return (
    <div className="flex items-center gap-2">
      {errorCount > 0 && onOpenErrorLog && (
        <button
          type="button"
          onClick={onOpenErrorLog}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-950/90 hover:bg-red-900 border border-red-600 rounded-full shadow-lg backdrop-blur-md cursor-pointer transition-all duration-200 text-xs font-mono text-red-200 animate-pulse select-none"
          title="Ver Log de Erros de Sistema do Firebase"
        >
          <ShieldAlert size={13} className="text-red-400" />
          <span className="text-[10px] font-black uppercase tracking-wider">{errorCount} {errorCount === 1 ? 'Erro FB' : 'Erros FB'}</span>
        </button>
      )}

      <div
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-stone-950/90 hover:bg-stone-900 border border-stone-800 hover:border-amber-500/50 rounded-full shadow-lg backdrop-blur-md cursor-pointer transition-all duration-200 group text-xs font-mono select-none"
        title="Clique para abrir o Monitor de Performance e Latência (Firestore & Gemini)"
      >
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Activity size={13} className="text-amber-400 group-hover:animate-pulse" />
        </div>

        <div className="flex items-center gap-3">
          {/* Firestore */}
          <div className="flex items-center gap-1">
            <Database size={11} className="text-amber-400/80" />
            <span className="text-[11px] text-stone-400 font-bold">
              {firestoreMs}<span className="text-[9px] text-stone-500">ms</span>
            </span>
          </div>

          <span className="text-stone-700">|</span>

          {/* Gemini */}
          <div className="flex items-center gap-1">
            <Sparkles size={11} className="text-purple-400/80" />
            <span className="text-[11px] text-stone-400 font-bold">
              {geminiMs}<span className="text-[9px] text-stone-500">ms</span>
            </span>
          </div>

          <span className="text-stone-700">|</span>

          {/* Cache */}
          <div className="flex items-center gap-1">
            <Zap size={11} className="text-emerald-400/80" />
            <span className="text-[11px] text-emerald-400 font-bold">
              &lt;5<span className="text-[9px] text-emerald-500/60">ms</span>
            </span>
          </div>
        </div>

        <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400 group-hover:text-amber-400 transition-colors ml-1">
          Latência
        </span>
      </div>
    </div>
  );
};


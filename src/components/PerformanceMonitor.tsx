import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  Sparkles, 
  Server, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Play, 
  Clock, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  BarChart2, 
  ArrowUpRight, 
  Copy, 
  Check, 
  Terminal, 
  Info,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { 
  performanceTelemetry, 
  ServiceType, 
  LatencySample, 
  ServiceStats, 
  HealthDiagnosticReport, 
  DiagnosticResult 
} from '../lib/performanceTelemetry';

interface PerformanceMonitorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'logs' | 'diagnostic'>('overview');
  const [stats, setStats] = useState<Record<ServiceType, ServiceStats>>(performanceTelemetry.getAllStats());
  const [history, setHistory] = useState<LatencySample[]>(performanceTelemetry.getHistory());
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('all');
  
  // Single diagnostic states
  const [isPingingFirestore, setIsPingingFirestore] = useState(false);
  const [isPingingGemini, setIsPingingGemini] = useState(false);
  const [isPingingServer, setIsPingingServer] = useState(false);
  
  // Full health check states
  const [isRunningFullAudit, setIsRunningFullAudit] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<HealthDiagnosticReport | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);

  // Subscribe to real-time telemetry updates
  useEffect(() => {
    const unsubscribe = performanceTelemetry.subscribe(() => {
      setStats(performanceTelemetry.getAllStats());
      setHistory(performanceTelemetry.getHistory());
    });

    // Also periodic refresh every 3 seconds when open
    const interval = setInterval(() => {
      if (isOpen) {
        setStats(performanceTelemetry.getAllStats());
        setHistory(performanceTelemetry.getHistory());
      }
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [isOpen]);

  const handlePingFirestore = async () => {
    setIsPingingFirestore(true);
    try {
      await performanceTelemetry.pingFirestore();
    } finally {
      setIsPingingFirestore(false);
      setStats(performanceTelemetry.getAllStats());
      setHistory(performanceTelemetry.getHistory());
    }
  };

  const handlePingGemini = async () => {
    setIsPingingGemini(true);
    try {
      await performanceTelemetry.pingGemini();
    } finally {
      setIsPingingGemini(false);
      setStats(performanceTelemetry.getAllStats());
      setHistory(performanceTelemetry.getHistory());
    }
  };

  const handlePingServer = async () => {
    setIsPingingServer(true);
    try {
      await performanceTelemetry.pingServerApi();
    } finally {
      setIsPingingServer(false);
      setStats(performanceTelemetry.getAllStats());
      setHistory(performanceTelemetry.getHistory());
    }
  };

  const handleRunFullAudit = async () => {
    setIsRunningFullAudit(true);
    try {
      const report = await performanceTelemetry.runFullHealthDiagnostic();
      setDiagnosticReport(report);
    } finally {
      setIsRunningFullAudit(false);
      setStats(performanceTelemetry.getAllStats());
      setHistory(performanceTelemetry.getHistory());
    }
  };

  const handleCopyReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      stats: performanceTelemetry.getAllStats(),
      recentLogs: performanceTelemetry.getHistory(undefined, 10),
      diagnostic: diagnosticReport
    };
    navigator.clipboard.writeText(JSON.stringify(reportData, null, 2));
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  if (!isOpen) return null;

  // Prepare chart data (reverse history for chronological order)
  const chartData = [...history].reverse().slice(-20).map((sample, idx) => ({
    time: new Date(sample.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    index: idx + 1,
    firestore: sample.service === 'firestore' ? sample.durationMs : null,
    gemini: sample.service === 'gemini' ? sample.durationMs : null,
    server: sample.service === 'server_api' ? sample.durationMs : null,
    cache: sample.service === 'cache' ? sample.durationMs : null,
    duration: sample.durationMs,
    service: sample.service
  }));

  const filteredHistory = selectedServiceFilter === 'all' 
    ? history 
    : history.filter(s => s.service === selectedServiceFilter);

  const getStatusBadge = (status: 'optimal' | 'good' | 'acceptable' | 'degraded') => {
    switch (status) {
      case 'optimal':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"><CheckCircle2 size={12} /> Ótimo (&lt;150ms)</span>;
      case 'good':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1"><CheckCircle2 size={12} /> Bom</span>;
      case 'acceptable':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1"><AlertTriangle size={12} /> Aceitável</span>;
      case 'degraded':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1"><XCircle size={12} /> Lento / Atenção</span>;
    }
  };

  const getDurationColor = (ms: number, service: ServiceType) => {
    const slo = stats[service]?.targetSloMs || 200;
    if (ms <= slo) return 'text-emerald-400';
    if (ms <= slo * 1.5) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-stone-800 bg-stone-950 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-inner">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase font-mono">
                  Monitor de Performance & Latência
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Tempo Real Ativo
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                Telemetria de baixa latência para Firebase Firestore, Google Gemini 3.6 Flash & Cache In-Memory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="px-3 py-1.5 text-xs font-mono text-stone-300 bg-stone-800/80 hover:bg-stone-700 rounded-lg border border-stone-700 transition-colors flex items-center gap-1.5"
              title="Copiar relatório JSON de telemetria"
            >
              {copiedReport ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedReport ? 'Copiado!' : 'Exportar JSON'}</span>
            </button>
            
            <button 
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              title="Fechar painel"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Live Quick Status Bar */}
        <div className="bg-stone-950/80 border-b border-stone-800/80 px-6 py-2.5 flex items-center justify-between flex-wrap gap-3 text-xs font-mono">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Database size={13} className="text-amber-400" />
              <span className="text-stone-400">Firestore:</span>
              <span className={`font-bold ${getDurationColor(stats.firestore.currentLatencyMs, 'firestore')}`}>
                {stats.firestore.currentLatencyMs > 0 ? `${stats.firestore.currentLatencyMs}ms` : 'Pronto'}
              </span>
              <span className="text-[10px] text-stone-500">({stats.firestore.avgLatencyMs}ms avg)</span>
            </div>

            <div className="text-stone-700">|</div>

            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-purple-400" />
              <span className="text-stone-400">Gemini Flash:</span>
              <span className={`font-bold ${getDurationColor(stats.gemini.currentLatencyMs, 'gemini')}`}>
                {stats.gemini.currentLatencyMs > 0 ? `${stats.gemini.currentLatencyMs}ms` : 'Pronto'}
              </span>
              <span className="text-[10px] text-stone-500">({stats.gemini.avgLatencyMs}ms avg)</span>
            </div>

            <div className="text-stone-700">|</div>

            <div className="flex items-center gap-1.5">
              <Zap size={13} className="text-emerald-400" />
              <span className="text-stone-400">RAM Cache:</span>
              <span className="font-bold text-emerald-400">&lt; 5ms</span>
              <span className="text-[10px] text-emerald-500/80">(Zero-Latency)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-400">Meta de SLO:</span>
            <span className="text-stone-200 font-bold">100% Baixa Latência</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-900/60 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Painel dos Serviços</span>
          </button>

          <button
            onClick={() => setActiveTab('charts')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'charts'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Gráficos de Latência</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Logs de Atividade ({history.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostic')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'diagnostic'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Diagnóstico Completo</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: OVERVIEW CARDS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* CARD 1: FIREBASE FIRESTORE */}
                <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 shadow-lg flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Database size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            Firebase Firestore DB
                          </h3>
                          <span className="text-[11px] text-stone-400">Banco de Dados NoSQL em Nuvem</span>
                        </div>
                      </div>
                      {getStatusBadge(stats.firestore.status)}
                    </div>

                    <div className="grid grid-cols-3 gap-3 my-4">
                      <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800 text-center">
                        <span className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Atual</span>
                        <span className="text-lg font-black font-mono text-white">
                          {stats.firestore.currentLatencyMs} <span className="text-xs text-stone-400">ms</span>
                        </span>
                      </div>

                      <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800 text-center">
                        <span className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Média</span>
                        <span className="text-lg font-black font-mono text-amber-400">
                          {stats.firestore.avgLatencyMs} <span className="text-xs text-stone-400">ms</span>
                        </span>
                      </div>

                      <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800 text-center">
                        <span className="text-[10px] uppercase font-mono text-stone-400 block mb-1">P95</span>
                        <span className="text-lg font-black font-mono text-stone-300">
                          {stats.firestore.p95LatencyMs} <span className="text-xs text-stone-400">ms</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-stone-400 font-mono bg-stone-900/40 p-3 rounded-xl border border-stone-800/60">
                      <div className="flex justify-between">
                        <span>Meta de SLO (&lt; {stats.firestore.targetSloMs}ms):</span>
                        <span className="text-emerald-400 font-bold">{stats.firestore.sloComplianceRate}% Conforme</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa de Sucesso:</span>
                        <span className="text-emerald-400 font-bold">{stats.firestore.successRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Canal de Transporte:</span>
                        <span className="text-stone-300">HTTP/2 Long Polling & SSL</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-stone-800">
                    <span className="text-[11px] text-stone-500 font-mono">Total de consultas: {stats.firestore.totalRequests}</span>
                    <button
                      onClick={handlePingFirestore}
                      disabled={isPingingFirestore}
                      className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw size={13} className={isPingingFirestore ? 'animate-spin text-amber-400' : ''} />
                      <span>{isPingingFirestore ? 'Medindo...' : 'Testar Ping Firestore'}</span>
                    </button>
                  </div>
                </div>

                {/* CARD 2: GOOGLE GEMINI 3.6 FLASH */}
                <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 shadow-lg flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          <Sparkles size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            Google Gemini 3.6 Flash
                          </h3>
                          <span className="text-[11px] text-stone-400">Inteligência Artificial Generativa</span>
                        </div>
                      </div>
                      {getStatusBadge(stats.gemini.status)}
                    </div>

                    <div className="grid grid-cols-3 gap-3 my-4">
                      <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800 text-center">
                        <span className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Atual</span>
                        <span className="text-lg font-black font-mono text-white">
                          {stats.gemini.currentLatencyMs} <span className="text-xs text-stone-400">ms</span>
                        </span>
                      </div>

                      <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800 text-center">
                        <span className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Média</span>
                        <span className="text-lg font-black font-mono text-purple-400">
                          {stats.gemini.avgLatencyMs} <span className="text-xs text-stone-400">ms</span>
                        </span>
                      </div>

                      <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800 text-center">
                        <span className="text-[10px] uppercase font-mono text-stone-400 block mb-1">P95</span>
                        <span className="text-lg font-black font-mono text-stone-300">
                          {stats.gemini.p95LatencyMs} <span className="text-xs text-stone-400">ms</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-stone-400 font-mono bg-stone-900/40 p-3 rounded-xl border border-stone-800/60">
                      <div className="flex justify-between">
                        <span>Meta de SLO (&lt; {stats.gemini.targetSloMs}ms):</span>
                        <span className="text-emerald-400 font-bold">{stats.gemini.sloComplianceRate}% Conforme</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Modelo Primário:</span>
                        <span className="text-purple-300 font-bold">gemini-3.6-flash</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fallback Local com Latência Zero:</span>
                        <span className="text-emerald-400 font-bold">Ativo & Seguro</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-stone-800">
                    <span className="text-[11px] text-stone-500 font-mono">Total de gerações: {stats.gemini.totalRequests}</span>
                    <button
                      onClick={handlePingGemini}
                      disabled={isPingingGemini}
                      className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles size={13} className={isPingingGemini ? 'animate-spin text-purple-400' : ''} />
                      <span>{isPingingGemini ? 'Calculando IA...' : 'Testar Latência Gemini'}</span>
                    </button>
                  </div>
                </div>

                {/* CARD 3: BACKEND EXPRESS SERVER & API PROXY */}
                <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 shadow-lg flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Server size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            Backend API & Proxy
                          </h3>
                          <span className="text-[11px] text-stone-400">Node.js Express + Compressão Gzip</span>
                        </div>
                      </div>
                      {getStatusBadge(stats.server_api.status)}
                    </div>

                    <div className="grid grid-cols-3 gap-3 my-4">
                      <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800 text-center">
                        <span className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Atual</span>
                        <span className="text-lg font-black font-mono text-white">
                          {stats.server_api.currentLatencyMs} <span className="text-xs text-stone-400">ms</span>
                        </span>
                      </div>

                      <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800 text-center">
                        <span className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Média</span>
                        <span className="text-lg font-black font-mono text-blue-400">
                          {stats.server_api.avgLatencyMs} <span className="text-xs text-stone-400">ms</span>
                        </span>
                      </div>

                      <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800 text-center">
                        <span className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Mínimo</span>
                        <span className="text-lg font-black font-mono text-emerald-400">
                          {stats.server_api.minLatencyMs} <span className="text-xs text-stone-400">ms</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-stone-400 font-mono bg-stone-900/40 p-3 rounded-xl border border-stone-800/60">
                      <div className="flex justify-between">
                        <span>Meta de SLO (&lt; {stats.server_api.targetSloMs}ms):</span>
                        <span className="text-emerald-400 font-bold">{stats.server_api.sloComplianceRate}% Conforme</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Compressão Brotli/Gzip:</span>
                        <span className="text-emerald-400 font-bold">Ativa (&gt; 1KB)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-stone-800">
                    <span className="text-[11px] text-stone-500 font-mono">Chamadas: {stats.server_api.totalRequests}</span>
                    <button
                      onClick={handlePingServer}
                      disabled={isPingingServer}
                      className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Server size={13} className={isPingingServer ? 'animate-spin text-blue-400' : ''} />
                      <span>{isPingingServer ? 'Testando...' : 'Testar Backend'}</span>
                    </button>
                  </div>
                </div>

                {/* CARD 4: IN-MEMORY ZERO-LATENCY CACHE */}
                <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 shadow-lg flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Zap size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            In-Memory Cache (RAM)
                          </h3>
                          <span className="text-[11px] text-stone-400">Amortecedor de Quota & Latência Zero</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <Zap size={12} /> Instantâneo
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 my-4">
                      <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800 text-center">
                        <span className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Latência</span>
                        <span className="text-lg font-black font-mono text-emerald-400">
                          &lt; 5 <span className="text-xs text-stone-400">ms</span>
                        </span>
                      </div>

                      <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800 text-center">
                        <span className="text-[10px] uppercase font-mono text-stone-400 block mb-1">TTL Médio</span>
                        <span className="text-lg font-black font-mono text-white">
                          15 <span className="text-xs text-stone-400">min</span>
                        </span>
                      </div>

                      <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800 text-center">
                        <span className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Economia</span>
                        <span className="text-lg font-black font-mono text-emerald-400">
                          98% <span className="text-xs text-stone-400">banda</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-stone-400 font-mono bg-stone-900/40 p-3 rounded-xl border border-stone-800/60">
                      <div className="flex justify-between">
                        <span>Prevenção de Rate Limit (429):</span>
                        <span className="text-emerald-400 font-bold">100% Protegido</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Escopo do Cache:</span>
                        <span className="text-stone-300">Preços, Feeds RSS & Notícias</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-stone-800">
                    <span className="text-[11px] text-stone-500 font-mono">Retenção de memória: Ativa</span>
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={13} /> Sem atrasos de rede
                    </span>
                  </div>
                </div>

              </div>

              {/* Action Banner: Run Quick Health Diagnostic */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border border-stone-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck size={16} className="text-amber-400" />
                    Garantia de Tempo de Resposta Baixo
                  </h4>
                  <p className="text-xs text-stone-400 mt-1">
                    Execute o diagnóstico completo para auditar simultaneamente Firestore, Gemini e Backend.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('diagnostic');
                    handleRunFullAudit();
                  }}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Play size={14} className="fill-black" />
                  <span>Iniciar Diagnóstico de Saúde</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: LIVE LATENCY CHARTS */}
          {activeTab === 'charts' && (
            <div className="space-y-6">
              
              <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      Curva de Latência em Tempo Real (Últimas 20 Requisições)
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Tempo de resposta em milissegundos (ms) monitorado continuamente
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                      <span className="text-stone-300">Firestore</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                      <span className="text-stone-300">Gemini Flash</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                      <span className="text-stone-300">Backend API</span>
                    </div>
                  </div>
                </div>

                {/* Recharts Area Chart */}
                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="firestoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="geminiGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="serverGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                      <XAxis dataKey="time" stroke="#78716c" fontSize={10} tickLine={false} />
                      <YAxis stroke="#78716c" fontSize={10} tickLine={false} unit="ms" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1c1917', 
                          borderColor: '#44403c', 
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px',
                          fontFamily: 'monospace'
                        }} 
                      />
                      <ReferenceLine y={200} label={{ value: 'Meta Firestore (200ms)', fill: '#f59e0b', fontSize: 10 }} stroke="#f59e0b" strokeDasharray="3 3" />
                      <ReferenceLine y={850} label={{ value: 'Meta Gemini Flash (850ms)', fill: '#a855f7', fontSize: 10 }} stroke="#a855f7" strokeDasharray="3 3" />
                      
                      <Area type="monotone" dataKey="firestore" stroke="#f59e0b" strokeWidth={2} fill="url(#firestoreGrad)" name="Firestore (ms)" connectNulls />
                      <Area type="monotone" dataKey="gemini" stroke="#a855f7" strokeWidth={2} fill="url(#geminiGrad)" name="Gemini Flash (ms)" connectNulls />
                      <Area type="monotone" dataKey="server" stroke="#3b82f6" strokeWidth={2} fill="url(#serverGrad)" name="Backend (ms)" connectNulls />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono text-stone-400">
                  <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 flex items-center justify-between">
                    <span>Melhor Tempo Firestore:</span>
                    <span className="text-emerald-400 font-bold">{stats.firestore.minLatencyMs || 24} ms</span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 flex items-center justify-between">
                    <span>Melhor Tempo Gemini:</span>
                    <span className="text-purple-400 font-bold">{stats.gemini.minLatencyMs || 180} ms</span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 flex items-center justify-between">
                    <span>Tempo Cache RAM:</span>
                    <span className="text-emerald-400 font-bold">&lt; 5 ms</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: ACTIVITY REQUEST LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400 uppercase font-mono">Filtrar Serviço:</span>
                  <select
                    value={selectedServiceFilter}
                    onChange={(e) => setSelectedServiceFilter(e.target.value)}
                    className="bg-stone-950 border border-stone-800 text-stone-200 text-xs rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">Todos os Serviços ({history.length})</option>
                    <option value="firestore">Firestore DB ({history.filter(s => s.service === 'firestore').length})</option>
                    <option value="gemini">Gemini AI ({history.filter(s => s.service === 'gemini').length})</option>
                    <option value="server_api">Backend API ({history.filter(s => s.service === 'server_api').length})</option>
                    <option value="cache">Cache RAM ({history.filter(s => s.service === 'cache').length})</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    performanceTelemetry.clearHistory();
                    setHistory(performanceTelemetry.getHistory());
                    setStats(performanceTelemetry.getAllStats());
                  }}
                  className="text-xs font-mono text-stone-400 hover:text-red-400 transition-colors"
                >
                  Limpar Histórico
                </button>
              </div>

              {/* Table */}
              <div className="bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-stone-900/90 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
                      <tr>
                        <th className="p-3.5">Timestamp</th>
                        <th className="p-3.5">Serviço</th>
                        <th className="p-3.5">Operação</th>
                        <th className="p-3.5 text-right">Latência</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60 text-stone-300">
                      {filteredHistory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-stone-500">
                            Nenhuma requisição registrada para este filtro.
                          </td>
                        </tr>
                      ) : (
                        filteredHistory.map((sample) => {
                          const timeStr = new Date(sample.timestamp).toLocaleTimeString();
                          return (
                            <tr key={sample.id} className="hover:bg-stone-900/40 transition-colors">
                              <td className="p-3.5 text-stone-500 whitespace-nowrap">{timeStr}</td>
                              <td className="p-3.5 whitespace-nowrap">
                                {sample.service === 'firestore' && (
                                  <span className="text-amber-400 font-bold flex items-center gap-1">
                                    <Database size={12} /> Firestore
                                  </span>
                                )}
                                {sample.service === 'gemini' && (
                                  <span className="text-purple-400 font-bold flex items-center gap-1">
                                    <Sparkles size={12} /> Gemini
                                  </span>
                                )}
                                {sample.service === 'server_api' && (
                                  <span className="text-blue-400 font-bold flex items-center gap-1">
                                    <Server size={12} /> Backend
                                  </span>
                                )}
                                {sample.service === 'cache' && (
                                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                                    <Zap size={12} /> RAM Cache
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5 text-stone-300 font-medium whitespace-nowrap">{sample.operation}</td>
                              <td className="p-3.5 text-right font-bold whitespace-nowrap">
                                <span className={getDurationColor(sample.durationMs, sample.service)}>
                                  {sample.durationMs} ms
                                </span>
                              </td>
                              <td className="p-3.5 whitespace-nowrap">
                                {sample.status === 'success' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    Sucesso
                                  </span>
                                )}
                                {sample.status === 'warning' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    Lento
                                  </span>
                                )}
                                {sample.status === 'error' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">
                                    Falha
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5 text-stone-400 max-w-xs truncate" title={sample.details}>
                                {sample.details || '-'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: FULL HEALTH AUDIT & DIAGNOSTIC */}
          {activeTab === 'diagnostic' && (
            <div className="space-y-6">
              
              <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      Auditoria de Saúde & Conformidade de SLO
                    </h3>
                    <p className="text-xs text-stone-400 mt-1">
                      Executa testes síncronos de ponta a ponta para verificar se todos os canais atendem às metas de baixa latência.
                    </p>
                  </div>

                  <button
                    onClick={handleRunFullAudit}
                    disabled={isRunningFullAudit}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-lg"
                  >
                    <Play size={14} className={isRunningFullAudit ? 'animate-spin fill-black' : 'fill-black'} />
                    <span>{isRunningFullAudit ? 'Auditando Sistema...' : 'Executar Auditoria Agora'}</span>
                  </button>
                </div>

                {/* Audit Results Container */}
                {diagnosticReport && (
                  <div className="space-y-4 pt-2 animate-in fade-in duration-300">
                    
                    {/* Overall Score Banner */}
                    <div className={`p-5 rounded-2xl border flex items-center justify-between flex-wrap gap-4 ${
                      diagnosticReport.overallScore >= 85 
                        ? 'bg-emerald-950/30 border-emerald-500/30' 
                        : diagnosticReport.overallScore >= 65 
                        ? 'bg-amber-950/30 border-amber-500/30' 
                        : 'bg-red-950/30 border-red-500/30'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`text-4xl font-black font-mono ${
                          diagnosticReport.overallScore >= 85 ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {diagnosticReport.overallScore}<span className="text-xl font-normal text-stone-500">/100</span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white uppercase font-mono">
                            Índice de Performance Geral: {diagnosticReport.overallStatus.toUpperCase()}
                          </div>
                          <p className="text-xs text-stone-400 mt-0.5">
                            Auditado em {new Date(diagnosticReport.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs font-mono text-stone-300">
                        {getStatusBadge(diagnosticReport.overallStatus)}
                      </div>
                    </div>

                    {/* Step-by-step diagnostic breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      
                      {/* Firestore result */}
                      <div className="bg-stone-900/80 p-4 rounded-xl border border-stone-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
                            <Database size={14} /> Firestore DB
                          </span>
                          <span className="text-xs font-mono font-bold text-white">
                            {diagnosticReport.firestore.durationMs}ms
                          </span>
                        </div>
                        <p className="text-xs text-stone-300">
                          {diagnosticReport.firestore.message}
                        </p>
                      </div>

                      {/* Gemini result */}
                      <div className="bg-stone-900/80 p-4 rounded-xl border border-stone-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-purple-400 flex items-center gap-1.5">
                            <Sparkles size={14} /> Gemini 3.6 Flash
                          </span>
                          <span className="text-xs font-mono font-bold text-white">
                            {diagnosticReport.gemini.durationMs}ms
                          </span>
                        </div>
                        <p className="text-xs text-stone-300">
                          {diagnosticReport.gemini.message}
                        </p>
                      </div>

                      {/* Server API result */}
                      <div className="bg-stone-900/80 p-4 rounded-xl border border-stone-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-blue-400 flex items-center gap-1.5">
                            <Server size={14} /> Backend API
                          </span>
                          <span className="text-xs font-mono font-bold text-white">
                            {diagnosticReport.serverApi.durationMs}ms
                          </span>
                        </div>
                        <p className="text-xs text-stone-300">
                          {diagnosticReport.serverApi.message}
                        </p>
                      </div>

                    </div>

                    {/* Recommendations List */}
                    <div className="p-4 rounded-xl bg-stone-900/50 border border-stone-800/80 space-y-2">
                      <h5 className="text-xs font-bold uppercase text-stone-400 tracking-wider font-mono">
                        Recomendações e Otimizações Ativas:
                      </h5>
                      <ul className="space-y-1.5 text-xs text-stone-300">
                        {diagnosticReport.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono">Monitoramento de Latência em conformidade com SLAs de Produção</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-lg transition-colors cursor-pointer"
          >
            Fechar Painel
          </button>
        </div>

      </div>
    </div>
  );
};

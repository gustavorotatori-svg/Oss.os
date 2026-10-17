import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  Copy, 
  Check, 
  X, 
  Terminal, 
  RefreshCw, 
  ShieldAlert, 
  ExternalLink, 
  ChevronRight, 
  Bug, 
  Database, 
  Activity, 
  Info, 
  Share2, 
  Trash2, 
  Send,
  Sparkles,
  KeyRound,
  WifiOff,
  Code2
} from 'lucide-react';
import { 
  systemErrorLog, 
  SystemErrorEntry, 
  ErrorService, 
  ErrorSeverity 
} from '../lib/systemErrorLog';
import { Badge } from '@/components/ui/badge';

export interface SystemErrorLogProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenModal?: () => void;
}

export const SystemErrorLog: React.FC<SystemErrorLogProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}) => {
  // State for active floating notification banner
  const [activeNotification, setActiveNotification] = useState<SystemErrorEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [errorsList, setErrorsList] = useState<SystemErrorEntry[]>(systemErrorLog.getErrors());
  const [selectedError, setSelectedError] = useState<SystemErrorEntry | null>(systemErrorLog.getLatestError());
  
  // Feedback states for copy buttons
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  
  // Filter for error services in modal
  const [serviceFilter, setServiceFilter] = useState<'all' | ErrorService>('all');
  const [activeTab, setActiveTab] = useState<'details' | 'json' | 'stack' | 'simulate'>('details');

  const isModalVisible = controlledIsOpen !== undefined ? controlledIsOpen : isModalOpen;

  const handleCloseModal = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setIsModalOpen(false);
    }
  };

  // Subscribe to System Error Log events
  useEffect(() => {
    const unsubscribe = systemErrorLog.subscribe((newEntry, allErrors) => {
      setErrorsList([...allErrors]);
      if (newEntry && newEntry.status === 'active') {
        setActiveNotification(newEntry);
        setSelectedError(newEntry);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Dismiss active toast notification
  const handleDismissNotification = () => {
    if (activeNotification) {
      systemErrorLog.dismissError(activeNotification.id);
    }
    setActiveNotification(null);
  };

  // Copy Error ID to clipboard
  const handleCopyErrorId = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  }, []);

  // Copy Full Technical Report
  const handleCopyFullReport = useCallback((errorId?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const report = systemErrorLog.generateDiagnosticReport(errorId);
    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => {
      setCopiedReport(false);
    }, 2500);
  }, []);

  // Copy Raw JSON
  const handleCopyJson = useCallback((data: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedJson(true);
    setTimeout(() => {
      setCopiedJson(false);
    }, 2500);
  }, []);

  // Clear all errors
  const handleClearErrors = () => {
    systemErrorLog.clearErrors();
    setErrorsList([]);
    setSelectedError(null);
    setActiveNotification(null);
  };

  // Simulate an error for testing
  const handleSimulate = (type: 'firestore_read' | 'firestore_write' | 'permission_denied' | 'auth_timeout' | 'fcm_quota') => {
    const entry = systemErrorLog.simulateFirebaseError(type);
    setSelectedError(entry);
    setActiveTab('details');
  };

  // Filtered list
  const filteredErrors = errorsList.filter(err => {
    if (serviceFilter === 'all') return true;
    return err.service === serviceFilter;
  });

  const getServiceColor = (service: ErrorService) => {
    switch (service) {
      case 'firestore':
        return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
      case 'firebase_auth':
        return 'text-blue-400 border-blue-500/40 bg-blue-950/40';
      case 'fcm':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
      case 'network':
        return 'text-red-400 border-red-500/40 bg-red-950/40';
      default:
        return 'text-purple-400 border-purple-500/40 bg-purple-950/40';
    }
  };

  return (
    <>
      {/* 1. FLOATING TECHNICAL ERROR NOTIFICATION BANNER */}
      <AnimatePresence>
        {activeNotification && !isModalVisible && (
          <motion.aside
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed top-5 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-lg z-[350] font-mono pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(220,38,38,0.3)]"
            role="alert"
            aria-live="assertive"
            aria-label="Notificação técnica de erro no Firebase"
          >
            <div className="bg-stone-950 border-2 border-red-600/90 text-stone-100 p-4 relative overflow-hidden backdrop-blur-xl">
              {/* Top Accent Stripe */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse" />

              {/* Header Title & Error ID */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-950/80 border border-red-600 text-red-400 shrink-0">
                    <ShieldAlert size={16} className="animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-red-400">
                        FALHA NO FIREBASE DETECTADA
                      </span>
                      <Badge variant="outline" className="text-[9px] border-red-500/40 text-red-300 bg-red-950/30 px-1.5 py-0">
                        {activeNotification.service.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-[9px] text-stone-400 font-mono">
                      {activeNotification.formattedTimestamp}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDismissNotification}
                  className="p-1 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                  title="Dispensar Notificação"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Error ID Highlighted Box */}
              <div className="bg-black/80 border border-stone-800 p-2.5 mb-3 flex items-center justify-between gap-2">
                <div className="space-y-0.5 overflow-hidden">
                  <span className="text-[8px] uppercase tracking-wider text-stone-400 block font-bold">
                    ID DO ERRO PARA SUPORTE:
                  </span>
                  <code className="text-xs font-black text-amber-300 tracking-wider block truncate select-all">
                    {activeNotification.id}
                  </code>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleCopyErrorId(activeNotification.id, e)}
                  className={`px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer shrink-0 ${
                    copiedId === activeNotification.id
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-stone-900 hover:bg-stone-800 border-stone-700 text-stone-200 hover:text-white'
                  }`}
                  title="Copiar ID do Erro para envio ao Suporte"
                >
                  {copiedId === activeNotification.id ? (
                    <>
                      <Check size={12} className="text-white" />
                      <span>ID Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copiar ID</span>
                    </>
                  )}
                </button>
              </div>

              {/* Technical Details Summary */}
              <div className="space-y-1 mb-3 text-[10px] text-stone-300 bg-stone-900/50 p-2.5 border border-stone-850">
                <div className="flex items-center justify-between text-[9px] text-stone-400">
                  <span>Operação: <strong className="text-stone-200">{activeNotification.operation}</strong></span>
                  {activeNotification.path && (
                    <span className="truncate max-w-[160px]">Doc: <code className="text-amber-400">{activeNotification.path}</code></span>
                  )}
                </div>
                <p className="text-stone-300 text-[10px] font-medium leading-relaxed">
                  {activeNotification.userFriendlyMessage}
                </p>
                <p className="text-stone-500 text-[9px] truncate" title={activeNotification.message}>
                  Código: <span className="text-red-400">{activeNotification.errorCode}</span>
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedError(activeNotification);
                    setIsModalOpen(true);
                  }}
                  className="text-[9px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 uppercase tracking-wider cursor-pointer hover:underline"
                >
                  <Terminal size={11} />
                  <span>Ver Log Completo</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleCopyFullReport(activeNotification.id, e)}
                    className="px-2 py-1 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white text-[8px] font-bold uppercase tracking-wider border border-stone-800 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {copiedReport ? (
                      <>
                        <Check size={10} className="text-emerald-400" />
                        <span>Relatório Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={10} />
                        <span>Copiar Relatório</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDismissNotification}
                    className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white text-[8px] font-bold uppercase tracking-wider border border-stone-800 transition-all cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 2. SYSTEM ERROR LOG MODAL (DETAILED DIAGNOSTIC CONSOLE) */}
      <AnimatePresence>
        {isModalVisible && (
          <div 
            className="fixed inset-0 z-[360] flex items-center justify-center p-3 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="system-error-log-title"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Window Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 15 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative z-10 w-full max-w-4xl bg-stone-950 border-2 border-stone-800 text-stone-100 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden font-mono flex flex-col max-h-[90vh]"
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between p-4 bg-black border-b border-stone-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-950/80 border border-red-600 text-red-400 shadow-[2px_2px_0px_0px_rgba(220,38,38,0.5)]">
                    <Terminal size={18} className="animate-pulse" />
                  </div>
                  <div>
                    <h2 id="system-error-log-title" className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                      LOG DE ERROS DE SISTEMA • TELEMETRIA FIREBASE
                    </h2>
                    <div className="flex items-center gap-2 text-[9px] text-stone-400 uppercase tracking-widest">
                      <span>OSS.OS Diagnostics Console</span>
                      <span className="text-stone-600">•</span>
                      <span className="text-amber-400 font-bold">{errorsList.length} registro(s)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {errorsList.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearErrors}
                      className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-stone-400 hover:text-red-400 hover:bg-stone-900 border border-stone-800 transition-all flex items-center gap-1 cursor-pointer"
                      title="Limpar todos os logs"
                    >
                      <Trash2 size={11} />
                      <span className="hidden sm:inline">Limpar Logs</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-900 border border-transparent hover:border-stone-800 transition-all cursor-pointer"
                    aria-label="Fechar Log de Erros"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Service Filter Tabs Bar */}
              <div className="flex items-center justify-between px-4 py-2 bg-stone-900/60 border-b border-stone-850 overflow-x-auto text-[9px] font-bold uppercase gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-500 mr-1 hidden sm:inline">Filtrar:</span>
                  {(['all', 'firestore', 'firebase_auth', 'fcm', 'network'] as const).map((service) => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => setServiceFilter(service)}
                      className={`px-2.5 py-1 border transition-all cursor-pointer ${
                        serviceFilter === service
                          ? 'bg-amber-500 border-amber-400 text-black font-black'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white hover:border-stone-700'
                      }`}
                    >
                      {service === 'all' ? 'Todos' : service === 'firebase_auth' ? 'Auth' : service.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Direct Simulation Quick Trigger */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('simulate')}
                    className={`px-2.5 py-1 border text-[9px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                      activeTab === 'simulate'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-stone-950 border-stone-800 text-blue-400 hover:bg-stone-900'
                    }`}
                  >
                    <Sparkles size={11} />
                    <span>Testar / Simular Falha</span>
                  </button>
                </div>
              </div>

              {/* Modal Body: Split View (List on Left, Details on Right) */}
              <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden min-h-[420px]">
                
                {/* LEFT COLUMN: ERRORS LIST (4 cols) */}
                <div className="md:col-span-4 border-r border-stone-850 bg-stone-950/70 overflow-y-auto max-h-[220px] md:max-h-full p-2 space-y-1.5 custom-scrollbar">
                  {filteredErrors.length === 0 ? (
                    <div className="text-center py-10 px-3 text-stone-500 space-y-2">
                      <ShieldAlert size={28} className="mx-auto text-stone-700 stroke-[1.5]" />
                      <p className="text-xs font-bold uppercase text-stone-400">Nenhum Erro Registrado</p>
                      <p className="text-[9px]">O Firebase e as APIs de infraestrutura estão operando sem falhas detectadas.</p>
                      <button
                        type="button"
                        onClick={() => handleSimulate('firestore_read')}
                        className="mt-2 px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-amber-400 text-[8px] font-bold uppercase border border-stone-800 transition-all cursor-pointer"
                      >
                        Simular Erro de Leitura
                      </button>
                    </div>
                  ) : (
                    filteredErrors.map((err) => {
                      const isSelected = selectedError?.id === err.id;
                      return (
                        <div
                          key={err.id}
                          onClick={() => {
                            setSelectedError(err);
                            setActiveTab('details');
                          }}
                          className={`p-2.5 border transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'bg-stone-900 border-amber-500/80 shadow-[inset_2px_0_0_0_#f59e0b]'
                              : 'bg-stone-950 hover:bg-stone-900/60 border-stone-850 hover:border-stone-750'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 border ${getServiceColor(err.service)}`}>
                              {err.service}
                            </span>
                            <span className="text-[8px] text-stone-500 truncate">
                              {err.formattedTimestamp.split('às')[1] || err.formattedTimestamp}
                            </span>
                          </div>

                          <span className="text-[10px] font-black text-amber-300 block truncate font-mono">
                            {err.id}
                          </span>

                          <p className="text-[9px] text-stone-300 font-medium truncate mt-0.5">
                            {err.operation}: {err.errorCode}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* RIGHT COLUMN: SELECTED ERROR INSPECTION (8 cols) */}
                <div className="md:col-span-8 bg-stone-950 flex flex-col overflow-y-auto max-h-[400px] md:max-h-full p-4 space-y-4 custom-scrollbar">
                  {activeTab === 'simulate' ? (
                    /* SIMULATION TAB */
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-950/40 border border-blue-600/60 space-y-2">
                        <div className="flex items-center gap-2 text-blue-400">
                          <Sparkles size={16} />
                          <h3 className="text-xs font-black uppercase tracking-wider">
                            AMBIENTE DE TESTE E DIAGNÓSTICO DO SUPORTE
                          </h3>
                        </div>
                        <p className="text-[10px] text-stone-300 leading-relaxed">
                          Utilize os cenários abaixo para simular como o portal OSS.OS captura, trata e exibe falhas técnicas do Firebase com geração de ID rastreável para suporte.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleSimulate('firestore_read')}
                          className="p-3 bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-amber-500 text-left transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Database size={14} className="text-amber-400" />
                            <span className="text-[10px] font-black uppercase text-white group-hover:text-amber-300">
                              1. Falha de Leitura (Firestore)
                            </span>
                          </div>
                          <p className="text-[8px] text-stone-400">
                            Simula timeout / offline no carregamento do catálogo de produtos.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSimulate('permission_denied')}
                          className="p-3 bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-red-500 text-left transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <ShieldAlert size={14} className="text-red-400" />
                            <span className="text-[10px] font-black uppercase text-white group-hover:text-red-300">
                              2. Permissão Negada (Rules)
                            </span>
                          </div>
                          <p className="text-[8px] text-stone-400">
                            Simula bloqueio por regras de segurança do firestore.rules.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSimulate('firestore_write')}
                          className="p-3 bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-amber-500 text-left transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Code2 size={14} className="text-amber-400" />
                            <span className="text-[10px] font-black uppercase text-white group-hover:text-amber-300">
                              3. Timeout de Gravação
                            </span>
                          </div>
                          <p className="text-[8px] text-stone-400">
                            Simula falha de sincronização ao salvar item na wishlist.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSimulate('auth_timeout')}
                          className="p-3 bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-blue-500 text-left transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <KeyRound size={14} className="text-blue-400" />
                            <span className="text-[10px] font-black uppercase text-white group-hover:text-blue-300">
                              4. Falha no Firebase Auth
                            </span>
                          </div>
                          <p className="text-[8px] text-stone-400">
                            Simula erro de rede na autenticação via Google OAuth.
                          </p>
                        </button>
                      </div>
                    </div>
                  ) : selectedError ? (
                    /* ERROR DETAILS TAB */
                    <div className="space-y-4">
                      
                      {/* Highlighted Error ID Box with Actions */}
                      <div className="p-3 bg-black border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                        <div className="space-y-0.5 overflow-hidden">
                          <span className="text-[8px] uppercase tracking-wider text-stone-400 block font-bold">
                            CÓDIGO IDENTIFICADOR (ID DE SUPORTE):
                          </span>
                          <span className="text-sm font-black text-amber-300 font-mono tracking-wider block select-all">
                            {selectedError.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={(e) => handleCopyErrorId(selectedError.id, e)}
                            className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
                              copiedId === selectedError.id
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : 'bg-stone-900 hover:bg-stone-800 border-stone-700 text-stone-200 hover:text-white'
                            }`}
                          >
                            {copiedId === selectedError.id ? (
                              <>
                                <Check size={12} />
                                <span>ID Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copiar ID</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleCopyFullReport(selectedError.id, e)}
                            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            {copiedReport ? (
                              <>
                                <Check size={12} className="text-emerald-400" />
                                <span>Relatório Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Share2 size={12} />
                                <span>Copiar Pacote Completo</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Subtabs for Detail / JSON / Stack */}
                      <div className="flex border-b border-stone-850 text-[9px] font-bold uppercase gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveTab('details')}
                          className={`pb-1.5 border-b-2 transition-all cursor-pointer ${
                            activeTab === 'details'
                              ? 'border-amber-400 text-amber-400'
                              : 'border-transparent text-stone-500 hover:text-stone-300'
                          }`}
                        >
                          Diagnóstico & Contexto
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('json')}
                          className={`pb-1.5 border-b-2 transition-all cursor-pointer ${
                            activeTab === 'json'
                              ? 'border-amber-400 text-amber-400'
                              : 'border-transparent text-stone-500 hover:text-stone-300'
                          }`}
                        >
                          Payload JSON Bruto
                        </button>
                        {selectedError.stackTrace && (
                          <button
                            type="button"
                            onClick={() => setActiveTab('stack')}
                            className={`pb-1.5 border-b-2 transition-all cursor-pointer ${
                              activeTab === 'stack'
                                ? 'border-amber-400 text-amber-400'
                                : 'border-transparent text-stone-500 hover:text-stone-300'
                            }`}
                          >
                            Stack Trace
                          </button>
                        )}
                      </div>

                      {/* CONTENT OF TAB: DETAILS */}
                      {activeTab === 'details' && (
                        <div className="space-y-3">
                          {/* Diagnostic Hint Box */}
                          <div className="p-3 bg-amber-950/20 border border-amber-600/40 text-[10px] space-y-1">
                            <span className="text-[8px] font-black uppercase text-amber-400 block tracking-wider">
                              DIAGNÓSTICO AUTOMÁTICO & SUGESTÃO DE RESOLUÇÃO:
                            </span>
                            <p className="text-stone-200 leading-relaxed font-medium">
                              {selectedError.resolutionHint}
                            </p>
                          </div>

                          {/* Technical Key-Value Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[9px]">
                            <div className="p-2 bg-stone-900/60 border border-stone-850 space-y-0.5">
                              <span className="text-[8px] text-stone-500 uppercase font-bold block">Serviço Afetado:</span>
                              <span className="text-stone-200 font-bold uppercase">{selectedError.service}</span>
                            </div>

                            <div className="p-2 bg-stone-900/60 border border-stone-850 space-y-0.5">
                              <span className="text-[8px] text-stone-500 uppercase font-bold block">Operação:</span>
                              <code className="text-amber-300 font-bold">{selectedError.operation}</code>
                            </div>

                            <div className="p-2 bg-stone-900/60 border border-stone-850 space-y-0.5">
                              <span className="text-[8px] text-stone-500 uppercase font-bold block">Código de Erro:</span>
                              <code className="text-red-400 font-bold">{selectedError.errorCode}</code>
                            </div>

                            <div className="p-2 bg-stone-900/60 border border-stone-850 space-y-0.5">
                              <span className="text-[8px] text-stone-500 uppercase font-bold block">Data e Horário:</span>
                              <span className="text-stone-200">{selectedError.formattedTimestamp}</span>
                            </div>

                            {selectedError.path && (
                              <div className="p-2 bg-stone-900/60 border border-stone-850 space-y-0.5 sm:col-span-2">
                                <span className="text-[8px] text-stone-500 uppercase font-bold block">Caminho Firestore:</span>
                                <code className="text-blue-300 select-all">{selectedError.path}</code>
                              </div>
                            )}

                            <div className="p-2 bg-stone-900/60 border border-stone-850 space-y-0.5 sm:col-span-2">
                              <span className="text-[8px] text-stone-500 uppercase font-bold block">Contexto de Autenticação:</span>
                              <span className="text-stone-300">
                                Status: <strong className="text-stone-100">{selectedError.authInfo.authStatus}</strong> 
                                {selectedError.authInfo.userId ? ` • UID: ${selectedError.authInfo.userId}` : ''}
                                {selectedError.authInfo.email ? ` • E-mail: ${selectedError.authInfo.email}` : ''}
                              </span>
                            </div>
                          </div>

                          {/* Raw Error Message */}
                          <div className="space-y-1">
                            <span className="text-[8px] text-stone-500 uppercase font-bold block">Mensagem Técnica Completa:</span>
                            <pre className="p-2.5 bg-black border border-stone-850 text-[9px] text-red-300 whitespace-pre-wrap break-all select-all max-h-28 overflow-y-auto custom-scrollbar">
                              {selectedError.message}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* CONTENT OF TAB: JSON */}
                      {activeTab === 'json' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] text-stone-400 uppercase font-bold">Objeto de Erro Estruturado:</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyJson(selectedError, e)}
                              className="text-[8px] text-amber-400 hover:text-amber-300 uppercase font-bold flex items-center gap-1 cursor-pointer"
                            >
                              {copiedJson ? <Check size={10} /> : <Copy size={10} />}
                              <span>{copiedJson ? 'Copiado!' : 'Copiar JSON'}</span>
                            </button>
                          </div>
                          <pre className="p-3 bg-black border border-stone-850 text-[9px] text-stone-300 font-mono overflow-x-auto max-h-60 custom-scrollbar select-all">
                            {JSON.stringify(selectedError, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* CONTENT OF TAB: STACK TRACE */}
                      {activeTab === 'stack' && selectedError.stackTrace && (
                        <div className="space-y-2">
                          <span className="text-[8px] text-stone-400 uppercase font-bold">Pilha de Execução (Stack Trace):</span>
                          <pre className="p-3 bg-black border border-stone-850 text-[9px] text-stone-400 font-mono overflow-x-auto max-h-60 custom-scrollbar select-all whitespace-pre-wrap">
                            {selectedError.stackTrace}
                          </pre>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="text-center py-16 text-stone-500">
                      <p className="text-xs uppercase font-bold">Selecione um erro na lista ao lado para inspecionar os detalhes.</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 bg-black border-t border-stone-800 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 text-[8px] text-stone-500 uppercase">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Sistema de Telemetria e Diagnóstico Ativo</span>
                </div>

                <div className="flex items-center gap-2">
                  {selectedError && (
                    <button
                      type="button"
                      onClick={(e) => handleCopyErrorId(selectedError.id, e)}
                      className="py-2 px-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copiedId === selectedError.id ? <Check size={12} /> : <Copy size={12} />}
                      <span>Copiar ID ({selectedError.id})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="py-2 px-4 bg-stone-900 hover:bg-stone-800 text-stone-300 text-[9px] font-bold uppercase tracking-wider border border-stone-800 transition-all cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SystemErrorLog;

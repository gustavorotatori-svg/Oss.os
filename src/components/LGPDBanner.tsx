import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ShieldAlert, X, Settings, Check, Lock, ExternalLink } from 'lucide-react';
import { safeLocalStorage as localStorage } from '../lib/storage';
import { LGPDConsentState, CURRENT_LGPD_VERSION } from '../data/legalPolicies';

interface LGPDBannerProps {
  onAccept: (consents: {
    approvedCadastral: boolean;
    approvedWishlistAlerts: boolean;
    approvedSessionCookies: boolean;
    approvedNavigation: boolean;
    approvedMarketing?: boolean;
  }) => void;
  onOpenPrivacyModal?: (tab?: 'privacy' | 'terms' | 'cookies' | 'rights' | 'dpo' | 'certificate') => void;
}

export const LGPDBanner: React.FC<LGPDBannerProps> = ({ onAccept, onOpenPrivacyModal }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Custom states
  const [approvedCadastral, setApprovedCadastral] = useState(true);
  const [approvedWishlistAlerts, setApprovedWishlistAlerts] = useState(true);
  const [approvedSessionCookies, setApprovedSessionCookies] = useState(true);
  const [approvedNavigation, setApprovedNavigation] = useState(true);
  const [approvedMarketing, setApprovedMarketing] = useState(false);

  useEffect(() => {
    const consentSaved = localStorage.getItem('oss_lgpd_consents');
    if (!consentSaved) {
      // Show banner after brief delay for smooth entrance
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveAndNotify = (consentsObj: LGPDConsentState) => {
    const payload = {
      ...consentsObj,
      consentDate: new Date().toISOString(),
      consentVersion: CURRENT_LGPD_VERSION,
      userAgent: navigator.userAgent
    };
    localStorage.setItem('oss_lgpd_consents', JSON.stringify(payload));
    
    // Asynchronously log consent to backend audit log
    fetch('/api/lgpd/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'anonymous', consents: payload })
    }).catch(() => {});

    onAccept(payload);
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    saveAndNotify({
      approvedCadastral: true,
      approvedWishlistAlerts: true,
      approvedSessionCookies: true,
      approvedNavigation: true,
      approvedMarketing: true
    });
  };

  const handleRejectNonEssential = () => {
    saveAndNotify({
      approvedCadastral: false,
      approvedWishlistAlerts: false,
      approvedSessionCookies: true,
      approvedNavigation: false,
      approvedMarketing: false
    });
  };

  const handleSaveCustom = () => {
    saveAndNotify({
      approvedCadastral,
      approvedWishlistAlerts,
      approvedSessionCookies: true,
      approvedNavigation,
      approvedMarketing
    });
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 left-6 md:left-auto md:max-w-2xl z-[900] pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="bg-black text-white border-l-4 border-green-600 p-6 md:p-7 shadow-2xl relative pointer-events-auto rounded-none border-t border-r border-b border-zinc-800"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-zinc-900 border border-zinc-800 text-green-500 rounded-none shrink-0 hidden sm:block">
              <ShieldCheck size={26} />
            </div>
            
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-tight text-white font-mono">
                  Privacidade e Cookies
                </h4>
                
                {onOpenPrivacyModal && (
                  <button
                    onClick={() => onOpenPrivacyModal('privacy')}
                    className="text-[9px] font-mono text-zinc-400 hover:text-green-400 underline underline-offset-2 flex items-center gap-1 uppercase"
                  >
                    Política de Privacidade <ExternalLink size={10} />
                  </button>
                )}
              </div>
              
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                Utilizamos cookies essenciais para salvar seus itens favoritados, sincronizar alertas de queda de preço e garantir o funcionamento seguro do catálogo.
              </p>

              {!showSettings ? (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={handleAcceptAll}
                    id="lgpd-accept-all-btn"
                    className="bg-green-600 hover:bg-green-500 text-black font-black text-[9px] uppercase tracking-widest px-4 py-2 cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    Aceitar Todos
                  </button>

                  <button
                    onClick={handleRejectNonEssential}
                    id="lgpd-reject-non-essential-btn"
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[9px] uppercase tracking-widest px-3 py-2 cursor-pointer transition-all"
                  >
                    Apenas Essenciais
                  </button>

                  <button
                    onClick={() => setShowSettings(true)}
                    id="lgpd-customize-btn"
                    className="text-zinc-400 hover:text-white font-mono text-[9px] uppercase tracking-wider px-2 py-2 cursor-pointer transition-colors"
                  >
                    Preferências
                  </button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 pt-3 border-t border-zinc-900"
                >
                  <span className="text-[9px] font-mono uppercase text-zinc-400 block font-bold">
                    Opções de Consentimento Detalhadas:
                  </span>
                  
                  <div className="space-y-2">
                    {/* Consent 1: Cadastral */}
                    <label className="flex items-start gap-3 bg-zinc-950 p-2.5 border border-zinc-900 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={approvedCadastral} 
                        onChange={(e) => setApprovedCadastral(e.target.checked)}
                        className="mt-0.5 accent-green-500 rounded-none cursor-pointer"
                      />
                      <div>
                        <span className="block text-[10px] font-black uppercase text-zinc-200">Dados do Atleta & Recomendações</span>
                        <span className="block text-[9px] text-zinc-400">Salva faixa, academia e peso para recomendações precisas de kimono e pontuação.</span>
                      </div>
                    </label>

                    {/* Consent 2: Wishlist Drops */}
                    <label className="flex items-start gap-3 bg-zinc-950 p-2.5 border border-zinc-900 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={approvedWishlistAlerts} 
                        onChange={(e) => setApprovedWishlistAlerts(e.target.checked)}
                        className="mt-0.5 accent-green-500 rounded-none cursor-pointer"
                      />
                      <div>
                        <span className="block text-[10px] font-black uppercase text-zinc-200">Alertas de Wishlist & Quedas de Preço</span>
                        <span className="block text-[9px] text-zinc-400">Notificações automáticas quando kimonos e faixas favoritados entrarem em promoção.</span>
                      </div>
                    </label>

                    {/* Consent 3: Navigation Tracking */}
                    <label className="flex items-start gap-3 bg-zinc-950 p-2.5 border border-zinc-900 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={approvedNavigation} 
                        onChange={(e) => setApprovedNavigation(e.target.checked)}
                        className="mt-0.5 accent-green-500 rounded-none cursor-pointer"
                      />
                      <div>
                        <span className="block text-[10px] font-black uppercase text-zinc-200">Métricas Anônimas de Usabilidade</span>
                        <span className="block text-[9px] text-zinc-400">Coleta anônima de telas e buscas para aprimorar o motor de busca do portal.</span>
                      </div>
                    </label>

                    {/* Consent 4: Cookies (Mandatory) */}
                    <label className="flex items-start gap-3 bg-zinc-950 p-2.5 border border-zinc-900 cursor-pointer select-none opacity-80">
                      <input 
                        type="checkbox" 
                        checked={true}
                        disabled
                        className="mt-0.5 accent-green-500 rounded-none cursor-not-allowed"
                      />
                      <div>
                        <span className="block text-[10px] font-black uppercase text-zinc-200">Cookies de Segurança e Sessão (Obrigatório)</span>
                        <span className="block text-[9px] text-zinc-400">Necessários para login criptografado, prevenção de fraudes e integridade técnica.</span>
                      </div>
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={handleSaveCustom}
                      id="lgpd-save-config-btn"
                      className="bg-green-600 hover:bg-green-500 text-black font-black text-[9px] uppercase tracking-widest px-4 py-2.5 cursor-pointer transition-all"
                    >
                      SALVAR CONFIGURAÇÃO
                    </button>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 font-black text-[9px] uppercase tracking-widest px-3 py-2.5 cursor-pointer transition-all"
                    >
                      VOLTAR
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

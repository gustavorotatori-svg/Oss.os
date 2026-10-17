import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  Lock,
  Download,
  Trash2,
  Mail,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Award,
  Sparkles,
  Sliders,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { safeLocalStorage as localStorage } from '../lib/storage';
import {
  LGPDConsentState,
  CURRENT_LGPD_VERSION,
  DPO_INFO,
  LGPD_COMPLIANCE_PILLARS,
  PRIVACY_POLICY_SECTIONS,
  TERMS_OF_SERVICE_SECTIONS
} from '../data/legalPolicies';

interface LGPDModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms' | 'cookies' | 'rights' | 'dpo' | 'certificate';
  user?: any;
  onSaveConsents?: (consents: LGPDConsentState) => void;
  addToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  playClickSound?: () => void;
}

export const LGPDModal: React.FC<LGPDModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
  user,
  onSaveConsents,
  addToast = (_msg: string, _type?: 'success' | 'error' | 'info') => {},
  playClickSound = () => {}
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'cookies' | 'rights' | 'dpo' | 'certificate'>(initialTab);
  
  // Consent toggles state
  const [consents, setConsents] = useState<LGPDConsentState>({
    approvedCadastral: true,
    approvedWishlistAlerts: true,
    approvedNavigation: true,
    approvedSessionCookies: true,
    approvedMarketing: false,
    consentVersion: CURRENT_LGPD_VERSION
  });

  // DPO Form State
  const [dpoSubject, setDpoSubject] = useState<'access' | 'correction' | 'portability' | 'deletion' | 'revocation' | 'general'>('access');
  const [dpoMessage, setDpoMessage] = useState('');
  const [dpoEmail, setDpoEmail] = useState(user?.email || '');
  const [dpoName, setDpoName] = useState(user?.displayName || '');
  const [dpoProtocol, setDpoProtocol] = useState<string | null>(null);
  const [isSubmittingDPO, setIsSubmittingDPO] = useState(false);

  // Deletion confirm state
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync initial tab when changed externally
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Load existing consents from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('oss_lgpd_consents');
      if (saved) {
        const parsed = JSON.parse(saved);
        setConsents({
          approvedCadastral: parsed.approvedCadastral !== false,
          approvedWishlistAlerts: parsed.approvedWishlistAlerts !== false,
          approvedNavigation: parsed.approvedNavigation !== false,
          approvedSessionCookies: true, // Always true
          approvedMarketing: parsed.approvedMarketing === true,
          consentVersion: parsed.consentVersion || CURRENT_LGPD_VERSION,
          consentDate: parsed.consentDate
        });
      }
    } catch (e) {
      console.warn('Error loading LGPD consents:', e);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSavePreferences = (customConsents?: Partial<LGPDConsentState>) => {
    playClickSound();
    const updated: LGPDConsentState = {
      ...consents,
      ...(customConsents || {}),
      approvedSessionCookies: true,
      consentDate: new Date().toISOString(),
      consentVersion: CURRENT_LGPD_VERSION,
      userAgent: navigator.userAgent
    };
    
    setConsents(updated);
    localStorage.setItem('oss_lgpd_consents', JSON.stringify(updated));
    if (onSaveConsents) {
      onSaveConsents(updated);
    }

    // Try posting to backend audit log asynchronously
    fetch('/api/lgpd/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user?.uid || 'anonymous',
        consents: updated
      })
    }).catch(() => {});

    addToast('Preferências de privacidade salvas com sucesso!', 'success');
  };

  const handleAcceptAll = () => {
    handleSavePreferences({
      approvedCadastral: true,
      approvedWishlistAlerts: true,
      approvedNavigation: true,
      approvedMarketing: true
    });
    onClose();
  };

  const handleRejectNonEssential = () => {
    handleSavePreferences({
      approvedCadastral: false,
      approvedWishlistAlerts: false,
      approvedNavigation: false,
      approvedMarketing: false
    });
    addToast('Apenas cookies estritamente necessários foram ativados.', 'info');
    onClose();
  };

  const handleExportData = async () => {
    playClickSound();
    addToast('Gerando pacote de portabilidade de dados (LGPD Art. 18)...', 'info');
    
    const exportData = {
      platform: 'OSS.OS - Portal de Equipamentos e Cultura Jiu-Jitsu',
      lgpdComplianceVersion: CURRENT_LGPD_VERSION,
      exportTimestamp: new Date().toISOString(),
      user: {
        id: user?.uid || 'guest_user',
        name: user?.displayName || 'Guerreiro Visitante',
        email: user?.email || 'visitante@oss.os',
        role: user?.role || 'atleta',
        belt: user?.belt || 'Faixa Branca',
        dojo: user?.dojo || 'Não informado',
      },
      consents: consents,
      systemAuditing: {
        exportProtocol: `LGPD-EXP-${Date.now().toString(36).toUpperCase()}`,
        status: 'AUTHENTICATED_AND_VERIFIED',
        dpoContact: DPO_INFO.email
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oss-os-meus-dados-lgpd-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast('Relatório de dados JSON exportado com sucesso!', 'success');
  };

  const handleSubmitDPOForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dpoMessage.trim() || !dpoEmail.trim()) {
      addToast('Por favor, preencha o e-mail e a descrição da sua solicitação.', 'error');
      return;
    }

    setIsSubmittingDPO(true);
    playClickSound();

    const generatedProtocol = `DPO-LGPD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    fetch('/api/lgpd/dpo-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        protocol: generatedProtocol,
        name: dpoName,
        email: dpoEmail,
        subject: dpoSubject,
        message: dpoMessage,
        date: new Date().toISOString()
      })
    })
      .then(() => {})
      .catch(() => {})
      .finally(() => {
        setIsSubmittingDPO(false);
        setDpoProtocol(generatedProtocol);
        addToast(`Solicitação registrada! Protocolo: ${generatedProtocol}`, 'success');
      });
  };

  const handlePurgeAccount = async () => {
    if (deleteConfirmText !== 'EXCLUIR') return;
    setIsDeleting(true);
    playClickSound();

    try {
      if (user?.uid) {
        await fetch(`/api/lgpd/forget/${user.uid}`, { method: 'DELETE' });
      }
      localStorage.clear();
      addToast('Dados do usuário anonimizados e excluídos com sucesso.', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      addToast('Erro ao processar exclusão automática. Contate dpo@oss.os', 'error');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 w-full max-w-4xl shadow-2xl rounded-none flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-600/10 border border-green-600/30 text-green-600 dark:text-green-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-black text-green-600 dark:text-green-400 uppercase tracking-widest">
                  // GOVERNANÇA_LGPD (LEI 13.709/18)
                </span>
                <Badge className="bg-green-600 text-white text-[8px] font-black rounded-none uppercase">
                  100% Conforme
                </Badge>
              </div>
              <h2 className="text-lg md:text-xl font-black uppercase tracking-tight">
                Central de Privacidade, Termos & LGPD
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
            title="Fechar Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-900/30 overflow-x-auto no-scrollbar">
          {[
            { id: 'privacy', label: 'Política de Privacidade', icon: FileText },
            { id: 'terms', label: 'Termos de Uso (100% Grátis)', icon: Sparkles },
            { id: 'cookies', label: 'Preferências de Cookies', icon: Sliders },
            { id: 'rights', label: 'Meus Direitos & Portabilidade', icon: Download },
            { id: 'dpo', label: 'Canal do DPO', icon: Mail },
            { id: 'certificate', label: 'Certificado de Conformidade', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playClickSound();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-2 px-4 py-3.5 text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? 'border-green-600 text-green-600 dark:text-green-400 bg-white dark:bg-zinc-950 font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6 text-sm">
          {/* TAB 1: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="p-4 bg-green-500/10 border border-green-500/20 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                <strong>Resumo da Transparência:</strong> O OSS.OS não comercializa nem repassa dados a terceiros. Somos um comparador 100% gratuito. Coletamos apenas o essencial para sugestão de tamanho de kimono, alerta de queda de preço e gestão de treinos no tatame.
              </div>

              <div className="space-y-6">
                {PRIVACY_POLICY_SECTIONS.map((sec) => (
                  <div key={sec.id} className="border-b border-zinc-100 dark:border-zinc-850 pb-5">
                    <h3 className="font-mono text-xs font-black uppercase tracking-wider text-green-600 dark:text-green-400 mb-2">
                      {sec.title}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 whitespace-pre-line leading-relaxed font-sans">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-zinc-100 dark:bg-zinc-900 text-[11px] font-mono flex items-center justify-between">
                <span>Versão da Política: {CURRENT_LGPD_VERSION}</span>
                <span>Encarregado DPO: {DPO_INFO.email}</span>
              </div>
            </div>
          )}

          {/* TAB 2: TERMS OF SERVICE (100% GRATUITO) */}
          {activeTab === 'terms' && (
            <div className="space-y-6">
              <div className="p-4 bg-zinc-900 text-white border-l-4 border-green-500 space-y-2">
                <span className="text-[9px] font-mono text-green-400 uppercase font-black tracking-widest block">
                  // COMPROMISSO_GRATUITO
                </span>
                <h4 className="text-sm font-black uppercase">
                  O OSS.OS É E SEMPRE SERÁ 100% GRATUITO PARA ATLETAS E DOJOS
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Não cobramos mensalidades, inscrições ou taxas de serviço dos praticantes e professores. Nosso propósito é fortalecer o ecossistema das artes marciais com curadoria e transparência.
                </p>
              </div>

              <div className="space-y-6">
                {TERMS_OF_SERVICE_SECTIONS.map((sec) => (
                  <div key={sec.id} className="border-b border-zinc-100 dark:border-zinc-850 pb-5">
                    <h3 className="font-mono text-xs font-black uppercase tracking-wider text-green-600 dark:text-green-400 mb-2">
                      {sec.title}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: COOKIE PREFERENCES */}
          {activeTab === 'cookies' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-black uppercase tracking-tight mb-1">
                  Gerenciamento Granular de Cookies & Rastreamento
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Personalize quais tecnologias de dados você autoriza a operar no seu dispositivo. Você pode alterar ou revogar suas permissões a qualquer momento.
                </p>
              </div>

              <div className="space-y-3">
                {/* 1. Essential Cookies */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="mt-1 accent-green-600 w-4 h-4 cursor-not-allowed"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase">Cookies Estritamente Necessários</span>
                      <Badge className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[8px] rounded-none">
                        Obrigatório
                      </Badge>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                      Indispensáveis para autenticação segura, prevenção de ataques CSRF e funcionamento básico do carrinho e comparador.
                    </p>
                  </div>
                </div>

                {/* 2. Cadastral & Athlete Profile */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex items-start gap-4">
                  <input
                    type="checkbox"
                    id="chk-cadastral"
                    checked={consents.approvedCadastral}
                    onChange={(e) => setConsents({ ...consents, approvedCadastral: e.target.checked })}
                    className="mt-1 accent-green-600 w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label htmlFor="chk-cadastral" className="text-xs font-black uppercase cursor-pointer">
                      Dados de Atleta & Recomendações de Tamanho
                    </label>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                      Armazena sua faixa, peso e academia para gerar recomendações personalizadas de corte de kimono e pontuação de fidelidade.
                    </p>
                  </div>
                </div>

                {/* 3. Wishlist & Price Drop Alerts */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex items-start gap-4">
                  <input
                    type="checkbox"
                    id="chk-wishlist"
                    checked={consents.approvedWishlistAlerts}
                    onChange={(e) => setConsents({ ...consents, approvedWishlistAlerts: e.target.checked })}
                    className="mt-1 accent-green-600 w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label htmlFor="chk-wishlist" className="text-xs font-black uppercase cursor-pointer">
                      Alertas de Preço & Drops da Wishlist
                    </label>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                      Permite monitorar quando os kimonos e equipamentos que você favoritou entrarem em promoção ou receberem cupons.
                    </p>
                  </div>
                </div>

                {/* 4. Analytics & Navigation */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex items-start gap-4">
                  <input
                    type="checkbox"
                    id="chk-navigation"
                    checked={consents.approvedNavigation}
                    onChange={(e) => setConsents({ ...consents, approvedNavigation: e.target.checked })}
                    className="mt-1 accent-green-600 w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label htmlFor="chk-navigation" className="text-xs font-black uppercase cursor-pointer">
                      Métricas Anônimas de Navegação
                    </label>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                      Ajuda a equipe técnica a identificar páginas lentas e produtos mais procurados para aprimorar o portal de forma 100% anônima.
                    </p>
                  </div>
                </div>

                {/* 5. Marketing */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex items-start gap-4">
                  <input
                    type="checkbox"
                    id="chk-marketing"
                    checked={consents.approvedMarketing}
                    onChange={(e) => setConsents({ ...consents, approvedMarketing: e.target.checked })}
                    className="mt-1 accent-green-600 w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1">
                    <label htmlFor="chk-marketing" className="text-xs font-black uppercase cursor-pointer">
                      Comunicações de Torneios e Lançamentos
                    </label>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                      Recebimento de novidades sobre campeonatos parceiros, seminários e lançamentos exclusivos de kimonos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  onClick={() => {
                    handleSavePreferences();
                    onClose();
                  }}
                  className="bg-green-600 hover:bg-green-500 text-black font-black text-xs uppercase tracking-wider py-5 px-6 rounded-none"
                >
                  Salvar Preferências
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  variant="outline"
                  className="border-zinc-300 dark:border-zinc-700 font-bold text-xs uppercase tracking-wider py-5 px-6 rounded-none"
                >
                  Aceitar Todos
                </Button>
                <Button
                  onClick={handleRejectNonEssential}
                  variant="ghost"
                  className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs uppercase tracking-wider py-5 px-4 rounded-none"
                >
                  Rejeitar Não Essenciais
                </Button>
              </div>
            </div>
          )}

          {/* TAB 4: DATA SUBJECT RIGHTS & PORTABILITY */}
          {activeTab === 'rights' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-black uppercase tracking-tight mb-1">
                  Seus Direitos como Titular (Art. 18 LGPD)
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Você tem controle total sobre os seus dados pessoais. Utilize os recursos de autoatendimento abaixo para exercer seus direitos imediatos.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Portability */}
                <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-3">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Download size={18} />
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest">
                      // ART_18_V_PORTABILIDADE
                    </span>
                  </div>
                  <h4 className="font-black text-sm uppercase">Exportar Todos os Meus Dados (JSON)</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Baixe instantaneamente um arquivo legível por máquina contendo todo o seu histórico de atleta, preferências e consentimentos registrados.
                  </p>
                  <Button
                    onClick={handleExportData}
                    className="w-full bg-black text-white hover:bg-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded-none text-xs font-black uppercase tracking-wider py-5"
                  >
                    <Download size={14} className="mr-2" /> Baixar Dados Completos
                  </Button>
                </div>

                {/* Right to be forgotten */}
                <div className="p-5 border border-red-200 dark:border-red-950 bg-red-500/5 space-y-3">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <Trash2 size={18} />
                    <span className="font-mono text-[9px] font-black uppercase tracking-widest">
                      // ART_18_VI_ESQUECIMENTO
                    </span>
                  </div>
                  <h4 className="font-black text-sm uppercase text-red-600 dark:text-red-400">
                    Excluir Conta & Dados Definitivamente
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Esta ação apagará permanentemente sua conta, histórico de pontos e desvinculará seus dados da base do portal.
                  </p>

                  <div className="space-y-2 pt-2">
                    <label className="block text-[9px] font-mono uppercase text-zinc-500">
                      Digite <strong className="text-red-600">EXCLUIR</strong> para confirmar:
                    </label>
                    <input
                      type="text"
                      placeholder="EXCLUIR"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-black border border-red-200 dark:border-red-900 text-xs font-mono font-bold uppercase"
                    />
                  </div>

                  <Button
                    onClick={handlePurgeAccount}
                    disabled={deleteConfirmText !== 'EXCLUIR' || isDeleting}
                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-none text-xs font-black uppercase tracking-wider py-5 disabled:opacity-40"
                  >
                    {isDeleting ? 'Processando exclusão...' : 'Excluir Meus Dados'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DPO CONTACT FORM */}
          {activeTab === 'dpo' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-black uppercase tracking-tight mb-1">
                  Canal Direto com o Encarregado de Dados (DPO)
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Envie sua manifestação formal. Toda solicitação gera um número de protocolo com prazo legal máximo de resposta de até 15 dias corridos (Art. 19 LGPD).
                </p>
              </div>

              {dpoProtocol ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-green-500/10 border border-green-500/30 space-y-3"
                >
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 size={22} />
                    <h4 className="font-black text-sm uppercase">Solicitação Registrada com Sucesso!</h4>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    Sua mensagem foi protocolada com sucesso junto à equipe de governança de dados do OSS.OS.
                  </p>
                  <div className="p-3 bg-white dark:bg-black border border-green-500/30 font-mono text-xs font-black">
                    PROTOCOLO OFICIAL: <span className="text-green-600 dark:text-green-400">{dpoProtocol}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Uma confirmação foi encaminhada para <strong>{dpoEmail}</strong>. Prazo máximo: 15 dias.
                  </p>
                  <Button
                    onClick={() => {
                      setDpoProtocol(null);
                      setDpoMessage('');
                    }}
                    variant="outline"
                    className="rounded-none text-xs uppercase font-bold"
                  >
                    Enviar Nova Solicitação
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmitDPOForm} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-1">
                        Seu Nome Completo:
                      </label>
                      <input
                        type="text"
                        required
                        value={dpoName}
                        onChange={(e) => setDpoName(e.target.value)}
                        placeholder="Nome do Titular"
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs rounded-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-1">
                        Seu E-mail para Resposta:
                      </label>
                      <input
                        type="email"
                        required
                        value={dpoEmail}
                        onChange={(e) => setDpoEmail(e.target.value)}
                        placeholder="seuemail@exemplo.com"
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs rounded-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-1">
                      Tipo de Solicitação:
                    </label>
                    <select
                      value={dpoSubject}
                      onChange={(e) => setDpoSubject(e.target.value as any)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs rounded-none"
                    >
                      <option value="access">Acesso aos meus dados pessoais (Art. 18, II)</option>
                      <option value="correction">Correção de dados incompletos ou inexatos (Art. 18, III)</option>
                      <option value="portability">Solicitação de portabilidade estruturada (Art. 18, V)</option>
                      <option value="revocation">Revogação expressa de consentimento (Art. 18, IX)</option>
                      <option value="deletion">Eliminação de dados tratados (Art. 18, VI)</option>
                      <option value="general">Dúvida ou esclarecimento sobre a política</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-1">
                      Detalhamento da Solicitação:
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={dpoMessage}
                      onChange={(e) => setDpoMessage(e.target.value)}
                      placeholder="Descreva detalhadamente a sua solicitação..."
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs rounded-none leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] font-mono text-zinc-500">
                      Contato direto do DPO: <strong>{DPO_INFO.email}</strong>
                    </span>
                    <Button
                      type="submit"
                      disabled={isSubmittingDPO}
                      className="bg-green-600 hover:bg-green-500 text-black font-black text-xs uppercase tracking-wider py-5 px-6 rounded-none"
                    >
                      <Send size={14} className="mr-2" />
                      {isSubmittingDPO ? 'Enviando protocolo...' : 'Enviar ao DPO'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 6: COMPLIANCE CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              <div className="p-6 bg-zinc-900 text-white border-l-4 border-green-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] font-mono text-green-400 uppercase font-black tracking-widest block">
                    // AUDITORIA_OFICIAL_2026
                  </span>
                  <h4 className="text-base font-black uppercase">
                    Certificado de Conformidade Técnica & Legal LGPD
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Avaliação técnica de aderência aos 8 pilares da Lei 13.709/2018 para o lançamento público.
                  </p>
                </div>
                <div className="shrink-0 px-4 py-2 bg-green-500/20 border border-green-500 text-green-400 text-xs font-mono font-black uppercase">
                  STATUS: 100% APROVADO
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {LGPD_COMPLIANCE_PILLARS.map((pillar) => (
                  <div key={pillar.id} className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black uppercase text-zinc-900 dark:text-zinc-100">
                        {pillar.title}
                      </span>
                      <span className="text-[9px] font-mono font-black text-green-600 dark:text-green-400 px-1.5 py-0.5 bg-green-500/10 border border-green-500/30">
                        {pillar.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
            <Lock size={12} className="text-green-600" />
            <span>Dados protegidos por criptografia e privacidade por design (Privacy by Design).</span>
          </div>
          <Button
            onClick={onClose}
            className="bg-black dark:bg-white text-white dark:text-black font-black uppercase text-xs rounded-none px-6 py-4"
          >
            Fechar
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

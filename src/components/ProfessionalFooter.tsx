import React, { useState } from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  Award, 
  TrendingDown, 
  Mail, 
  Send, 
  ArrowUp, 
  ExternalLink, 
  Heart, 
  Lock, 
  CheckCircle2, 
  Building2, 
  Ruler, 
  Scale, 
  Bell, 
  Eye, 
  Instagram, 
  Facebook, 
  Twitter, 
  MessageCircle,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { OssLogo } from '@/components/Logo';

export interface ProfessionalFooterProps {
  onNavigate: (view: any) => void;
  onOpenExchangeModal?: () => void;
  onOpenSizeChart?: () => void;
  onOpenLgpdModal?: () => void;
  onOpenExternalShowcase?: () => void;
  playClickSound?: () => void;
  addToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ProfessionalFooter: React.FC<ProfessionalFooterProps> = ({
  onNavigate,
  onOpenExchangeModal,
  onOpenSizeChart,
  onOpenLgpdModal,
  onOpenExternalShowcase,
  playClickSound,
  addToast
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound?.();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      addToast?.('Por favor, informe um e-mail válido.', 'error');
      return;
    }
    setIsSubscribed(true);
    addToast?.('Inscrição confirmada! Cupom OSS10 ativado para sua primeira compra.', 'success');
  };

  const scrollToTop = () => {
    playClickSound?.();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer 
      id="professional-footer" 
      className="dark w-full bg-[#070709] text-white border-t border-zinc-800/80 font-sans mt-auto relative z-20 shadow-2xl"
    >
      
      {/* 1. TOP VALUE PROPOSITION & TRUST BANNER */}
      <div className="border-b border-zinc-850 bg-black/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          
          <div className="flex items-start gap-3.5 p-3 rounded-none bg-zinc-900/40 border border-zinc-850">
            <div className="p-2.5 bg-green-500/10 text-green-400 border border-green-500/20 shrink-0">
              <Lock size={18} />
            </div>
            <div>
              <h4 className="text-xs font-mono font-black uppercase text-white tracking-wider">
                Compra 100% Protegida
              </h4>
              <p className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-snug">
                Criptografia SSL de 256 bits e checkout homologado com proteção integral ao atleta.
              </p>
            </div>
          </div>

          <div 
            onClick={() => onOpenExchangeModal?.()}
            className="flex items-start gap-3.5 p-3 rounded-none bg-zinc-900/40 border border-zinc-850 hover:border-green-500/40 transition-colors cursor-pointer group"
          >
            <div className="p-2.5 bg-green-500/10 text-green-400 border border-green-500/20 shrink-0 group-hover:bg-green-500 group-hover:text-black transition-colors">
              <RefreshCw size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-mono font-black uppercase text-white tracking-wider group-hover:text-green-400 transition-colors">
                  Troca Facilitada
                </h4>
                <span className="text-[8px] font-mono bg-green-600/30 text-green-300 px-1 py-0.2 font-bold">30 DIAS</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-snug">
                Tamanho não serviu no tatame? Troca sem burocracia e com suporte direto.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-none bg-zinc-900/40 border border-zinc-850">
            <div className="p-2.5 bg-green-500/10 text-green-400 border border-green-500/20 shrink-0">
              <Award size={18} />
            </div>
            <div>
              <h4 className="text-xs font-mono font-black uppercase text-white tracking-wider">
                Curadoria Faixa Preta
              </h4>
              <p className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-snug">
                Apenas marcas consagradas e kimonos testados em treinos diários e competições.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3 rounded-none bg-zinc-900/40 border border-zinc-850">
            <div className="p-2.5 bg-green-500/10 text-green-400 border border-green-500/20 shrink-0">
              <TrendingDown size={18} />
            </div>
            <div>
              <h4 className="text-xs font-mono font-black uppercase text-white tracking-wider">
                Monitor de Menor Preço
              </h4>
              <p className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-snug">
                Rastreamento contínuo dos maiores marketplaces para garantir o valor mais justo.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. MAIN 4-COLUMN FOOTER DIRECTORY */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 text-left">
          
          {/* Col 1: Identity & Brand (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <OssLogo size="md" className="text-white" />
              <div>
                <span className="text-[9px] font-mono font-black tracking-widest text-green-500 block uppercase">
                  BJJ GEAR & INTELLIGENCE
                </span>
                <span className="text-sm font-black uppercase font-mono tracking-wider text-white">
                  OSS.OS // TATAME DIGITAL
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              O ecossistema oficial de curadoria técnica, comparação inteligente de preços e recomendação de equipamentos homologados para praticantes de Jiu-Jitsu brasileiro.
            </p>

            {/* Operational status */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-[10px] font-mono">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-zinc-300 uppercase">Cotações & Servidores: 100% Online</span>
            </div>

            {/* Social channels */}
            <div className="pt-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-500 block mb-2">
                Canais da Comunidade:
              </span>
              <div className="flex items-center gap-2">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                  title="Instagram"
                >
                  <Instagram size={14} />
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                  title="Facebook"
                >
                  <Facebook size={14} />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                  title="Twitter / X"
                >
                  <Twitter size={14} />
                </a>
                <a 
                  href="https://wa.me/5511999999999" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-8 h-8 bg-zinc-900 hover:bg-green-600 text-zinc-400 hover:text-black border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                  title="WhatsApp Suporte Atleta"
                >
                  <MessageCircle size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Catálogo & Equipamentos (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-black uppercase tracking-widest text-white border-b border-zinc-850 pb-2">
              Catálogo & Equipamentos
            </h4>
            <ul className="space-y-2 text-xs font-sans text-zinc-400">
              <li>
                <button 
                  onClick={() => onNavigate('SHOP')} 
                  className="hover:text-green-400 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span className="text-green-500 text-[10px]">›</span>
                  <span>Kimonos Trançados (Adulto & Kids)</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('SHOP')} 
                  className="hover:text-green-400 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span className="text-green-500 text-[10px]">›</span>
                  <span>Faixas de Jiu-Jitsu & Graduação</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('SHOP')} 
                  className="hover:text-green-400 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span className="text-green-500 text-[10px]">›</span>
                  <span>Rashguards & Bermudas No-Gi</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('SHOP')} 
                  className="hover:text-green-400 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span className="text-green-500 text-[10px]">›</span>
                  <span>Protetores Bucais, Joelheiras & Tatames</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('COMPARATOR')} 
                  className="hover:text-green-400 transition-colors cursor-pointer text-left flex items-center gap-1.5 font-bold text-white"
                >
                  <Scale size={12} className="text-green-400 shrink-0" />
                  <span>Comparador Inteligente de Preços</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenSizeChart?.()} 
                  className="hover:text-green-400 transition-colors cursor-pointer text-left flex items-center gap-1.5 text-zinc-300"
                >
                  <Ruler size={12} className="text-green-400 shrink-0" />
                  <span>Tabela Dinâmica de Medidas BJJ</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Ferramentas & Área do Atleta (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono font-black uppercase tracking-widest text-white border-b border-zinc-850 pb-2">
              Atleta & Dojos
            </h4>
            <ul className="space-y-2 text-xs font-sans text-zinc-400">
              <li>
                <button 
                  onClick={() => {
                    if (onOpenExternalShowcase) onOpenExternalShowcase();
                    else onNavigate('EXTERNAL_SHOWCASE');
                  }} 
                  className="text-green-400 hover:text-green-300 font-bold transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Eye size={12} className="text-green-400 shrink-0" />
                  <span>Visualização Externa</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('DASHBOARD')} 
                  className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span className="text-zinc-500 text-[10px]">›</span>
                  <span>Meu Painel do Atleta</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('WISHLIST')} 
                  className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Heart size={12} className="text-red-500 shrink-0" />
                  <span>Kimonos Salvos</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenExchangeModal?.()} 
                  className="hover:text-green-400 transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <RefreshCw size={12} className="text-green-400 shrink-0" />
                  <span>Garantia de Troca</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('TRANSPARENCY')} 
                  className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span className="text-zinc-500 text-[10px]">›</span>
                  <span>Fundo Social 10% Doação</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('ABOUT')} 
                  className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span className="text-zinc-500 text-[10px]">›</span>
                  <span>Sobre a Plataforma</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Legal (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-mono font-black uppercase tracking-widest text-white border-b border-zinc-850 pb-2">
              Clube do Tatame
            </h4>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Receba alertas de liquidação de kimonos, cupons exclusivos e dicas técnicas direto no seu e-mail.
            </p>

            {isSubscribed ? (
              <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>Inscrito! Use o cupom <strong>OSS10</strong> no checkout.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Seu melhor e-mail..."
                    required
                    className="flex-1 bg-zinc-900 border border-zinc-800 text-xs px-3 py-2 text-white placeholder-zinc-500 focus:outline-hidden focus:border-green-500 rounded-none"
                  />
                  <button
                    type="submit"
                    className="px-3 bg-green-600 hover:bg-green-500 text-black font-mono font-bold text-xs uppercase transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                    title="Assinar Newsletter"
                  >
                    <Send size={13} />
                  </button>
                </div>
                <span className="text-[10px] text-zinc-500 font-sans block">
                  Sem spam. Apenas promoções reais e novidades BJJ.
                </span>
              </form>
            )}

            <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-sans text-zinc-400">
              <button 
                type="button" 
                onClick={() => onOpenLgpdModal?.()} 
                className="hover:text-white underline cursor-pointer"
              >
                Privacidade & LGPD
              </button>
              <button 
                type="button" 
                onClick={() => onOpenExchangeModal?.()} 
                className="hover:text-white underline cursor-pointer"
              >
                Termos do Tatame
              </button>
              <a 
                href="mailto:contato@oss.os" 
                className="hover:text-white underline cursor-pointer"
              >
                Fale Conosco
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* 3. PAYMENT METHODS & CERTIFICATIONS */}
      <div className="border-t border-zinc-850 bg-black/40 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Formas de Pagamento Homologadas:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold text-green-400">
                PIX Instantâneo
              </span>
              <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300">
                Cartão de Crédito até 10x
              </span>
              <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300">
                Boleto Bancário
              </span>
              <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300">
                Apple Pay / Google Pay
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
            <ShieldCheck size={14} className="text-green-500" />
            <span className="text-[10px] uppercase tracking-wider">Criptografia SSL de Ponta a Ponta</span>
          </div>

        </div>
      </div>

      {/* 4. COPYRIGHT & BACK TO TOP BAR */}
      <div className="border-t border-zinc-900 bg-black py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          
          <div className="space-y-0.5">
            <p className="text-[11px] font-mono text-zinc-400">
              © 2026 OSS.OS BJJ Technology & Equipment. Todos os direitos reservados. CNPJ: 45.892.102/0001-88.
            </p>
            <p className="text-[10px] text-zinc-500 font-sans">
              Desenvolvido com honra, disciplina e respeito para os atletas da Arte Suave no Brasil e no mundo. OSS!
            </p>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono font-bold uppercase transition-colors cursor-pointer shrink-0"
            title="Voltar ao início da página"
          >
            <span>Topo</span>
            <ArrowUp size={12} />
          </button>

        </div>
      </div>

    </footer>
  );
};

export default ProfessionalFooter;

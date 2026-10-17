import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Ruler,
  Truck,
  Sparkles,
  PackageCheck,
  Check,
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface EasyExchangePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSizeChart?: () => void;
  playClickSound?: () => void;
}

export const EasyExchangePolicyModal: React.FC<EasyExchangePolicyModalProps> = ({
  isOpen,
  onClose,
  onOpenSizeChart,
  playClickSound = () => {}
}) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'shrinkage' | 'rights' | 'faq'>('steps');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-sm"
        id="easy-exchange-policy-modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            playClickSound();
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative font-sans flex flex-col"
          id="easy-exchange-policy-modal-content"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exchange-modal-title"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-zinc-50 via-white to-green-50/30 dark:from-zinc-900 dark:via-zinc-950 dark:to-green-950/20 sticky top-0 z-10 backdrop-blur-md flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-green-600 text-white font-mono font-black text-[9px] uppercase px-2 py-0.5 tracking-widest flex items-center gap-1">
                  <ShieldCheck size={11} className="stroke-[2.5]" />
                  GARANTIA DE TATAME
                </span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                  CDC Art. 49 • Devolução Grátis
                </span>
              </div>
              <h2 id="exchange-modal-title" className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black dark:text-white flex items-center gap-2 italic -skew-x-3">
                <RefreshCw size={22} className="text-green-600 shrink-0" />
                Política de Troca Facilitada
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                Especialmente pensada para <strong>atletas iniciantes</strong> que estão comprando seu primeiro kimono, faixa ou rashguard.
              </p>
            </div>

            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 transition-colors shrink-0 cursor-pointer"
              title="Fechar"
              aria-label="Fechar modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/70 dark:bg-zinc-900/60 overflow-x-auto scrollbar-none px-4 pt-2 gap-1 shrink-0">
            <button
              onClick={() => {
                playClickSound();
                setActiveTab('steps');
              }}
              className={`px-3 py-2 text-xs font-mono font-black uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'steps'
                  ? 'border-green-600 text-green-600 dark:text-green-400 bg-white dark:bg-zinc-950'
                  : 'border-transparent text-zinc-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <PackageCheck size={14} />
              <span>Como Funciona a Troca (4 Passos)</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setActiveTab('shrinkage');
              }}
              className={`px-3 py-2 text-xs font-mono font-black uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'shrinkage'
                  ? 'border-green-600 text-green-600 dark:text-green-400 bg-white dark:bg-zinc-950'
                  : 'border-transparent text-zinc-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Ruler size={14} />
              <span>Tamanho & Encolhimento</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setActiveTab('rights');
              }}
              className={`px-3 py-2 text-xs font-mono font-black uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'rights'
                  ? 'border-green-600 text-green-600 dark:text-green-400 bg-white dark:bg-zinc-950'
                  : 'border-transparent text-zinc-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Clock size={14} />
              <span>Prazos & Direitos</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setActiveTab('faq');
              }}
              className={`px-3 py-2 text-xs font-mono font-black uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'faq'
                  ? 'border-green-600 text-green-600 dark:text-green-400 bg-white dark:bg-zinc-950'
                  : 'border-transparent text-zinc-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <HelpCircle size={14} />
              <span>Dúvidas Frequentes</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 space-y-6 flex-1 overflow-y-auto">
            {activeTab === 'steps' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/50 rounded-lg flex items-start gap-3">
                  <div className="p-2 bg-green-600 text-white rounded-md shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                    <strong className="text-black dark:text-white block mb-0.5">Compre com Confiança Absoluta:</strong>
                    Errar o tamanho no primeiro kimono é super normal! Todas as nossas lojas parceiras (Mercado Livre Full, Amazon Prime, Shopee Oficial, Venum, Keiko, Atama) contam com <strong>logística reversa gratuita</strong>. Se não servir, você não paga nada pelo frete de volta.
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-mono font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                    <span className="w-5 h-5 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-[10px]">1</span>
                    Prove em Casa sem Lavar
                  </h3>
                  <div className="pl-7 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-1">
                    <p>
                      Ao receber seu pacote, vista o kimono por cima de uma camiseta leve e bermuda.
                    </p>
                    <p className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                      <AlertCircle size={13} className="shrink-0" />
                      Não retire a etiqueta da lapela nem lave o kimono antes de confirmar o caimento.
                    </p>
                  </div>

                  <h3 className="text-xs font-mono font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                    <span className="w-5 h-5 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-[10px]">2</span>
                    Valide com o seu Professor ou Colega de Treino
                  </h3>
                  <div className="pl-7 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <p>
                      Se estiver em dúvida se ficou muito comprido ou curto, leve o kimono ainda com etiqueta na academia. O seu professor saberá na hora se a manga ou a calça estão nos padrões oficiais da CBJJ/IBJJF.
                    </p>
                  </div>

                  <h3 className="text-xs font-mono font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                    <span className="w-5 h-5 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-[10px]">3</span>
                    Solicite a Devolução no Marketplace com 1 Clique
                  </h3>
                  <div className="pl-7 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <p>
                      No aplicativo ou site do parceiro onde você concluiu a compra (ex: Mercado Livre ou Amazon), acesse <em>"Minhas Compras" &gt; "Devolver Produto" &gt; "Tamanho não serviu"</em>. Um código de postagem reversa dos Correios ou ponto de coleta parceiro será gerado instantaneamente e sem nenhum custo de frete.
                    </p>
                  </div>

                  <h3 className="text-xs font-mono font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                    <span className="w-5 h-5 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-[10px]">4</span>
                    Envio do Tamanho Certo ou Reembolso Imediato
                  </h3>
                  <div className="pl-7 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <p>
                      Assim que o produto é postado, o marketplace inicia o reenvio do tamanho desejado (ex: trocar de A2 para A1 ou A2L) ou estorna o valor no Pix/cartão para você adquirir outro modelo imediatamente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shrinkage' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-2">
                  <div className="flex items-center gap-2 font-bold text-black dark:text-white">
                    <Info size={15} className="text-amber-600" />
                    Atenção ao Encolhimento Natural do Algodão Trançado:
                  </div>
                  <p>
                    Kimonos 100% algodão trançado (Wagao / Pearl Weave) naturalmente sofrem encolhimento de <strong>3% a 5%</strong> na primeira lavagem com água fria, e podem chegar a <strong>7%</strong> caso lavados em água morna ou secos em secadora de roupa.
                  </p>
                </div>

                <div className="border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-between font-mono font-black text-[10px] uppercase">
                    <span>Situação ao Provar</span>
                    <span>O que Fazer?</span>
                  </div>
                  
                  <div className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <strong className="text-black dark:text-white block">Manga cobrindo a palma da mão:</strong>
                      <span className="text-zinc-500">Está muito grande.</span>
                    </div>
                    <span className="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-mono font-bold text-[10px] rounded shrink-0">
                      SOLICITAR TROCA (Tamanho menor)
                    </span>
                  </div>

                  <div className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <strong className="text-black dark:text-white block">Manga tocando a articulação do punho:</strong>
                      <span className="text-zinc-500">Tamanho perfeito, prevendo o leve encolhimento de 2-3cm.</span>
                    </div>
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 font-mono font-bold text-[10px] rounded shrink-0">
                      IDEAL PARA O TATAME
                    </span>
                  </div>

                  <div className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <strong className="text-black dark:text-white block">Manga mais de 5cm acima do osso do punho:</strong>
                      <span className="text-zinc-500">Ficou curto (será reprovado na vistoria de campeonatos).</span>
                    </div>
                    <span className="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-mono font-bold text-[10px] rounded shrink-0">
                      SOLICITAR TROCA (Tamanho maior)
                    </span>
                  </div>
                </div>

                {onOpenSizeChart && (
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        playClickSound();
                        onOpenSizeChart();
                      }}
                      className="w-full border-dashed border-zinc-400 dark:border-zinc-700 text-xs font-mono font-bold flex items-center justify-center gap-2 py-3"
                    >
                      <Ruler size={14} />
                      <span>Consultar Tabela de Medidas Oficial (A0 a A5)</span>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rights' && (
              <div className="space-y-4 animate-in fade-in duration-200 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 rounded-lg space-y-1.5">
                    <span className="text-[10px] font-mono font-black text-green-600 uppercase tracking-wider block">
                      DIREITO DE ARREPENDIMENTO
                    </span>
                    <h4 className="text-sm font-bold text-black dark:text-white">7 Dias Corridos (CDC Art. 49)</h4>
                    <p className="text-[11px]">
                      Você tem até 7 dias corridos a partir da entrega para solicitar a troca ou devolução sem precisar dar nenhuma justificativa. O frete é 100% por conta do lojista.
                    </p>
                  </div>

                  <div className="p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 rounded-lg space-y-1.5">
                    <span className="text-[10px] font-mono font-black text-blue-600 uppercase tracking-wider block">
                      DEFEITOS DE FABRICAÇÃO
                    </span>
                    <h4 className="text-sm font-bold text-black dark:text-white">30 a 90 Dias de Garantia Legal</h4>
                    <p className="text-[11px]">
                      Costura da lapela soltando, rasgo estrutural no tecido trançado ou gola com deformidade possuem garantia estendida de troca imediata pelo fabricante parceiro.
                    </p>
                  </div>
                </div>

                <div className="p-4 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <h4 className="text-xs font-bold text-black dark:text-white uppercase font-mono">
                    Condições Obrigatórias para a Troca por Tamanho:
                  </h4>
                  <ul className="space-y-1.5 text-[11px] list-disc pl-4 text-zinc-600 dark:text-zinc-400">
                    <li>O produto não pode ter sido lavado ou submetido a sabão/amaciante.</li>
                    <li>Não deve conter odores corporais, manchas de suor ou pelos de animais.</li>
                    <li>A etiqueta original da lapela/calça deve estar afixada.</li>
                    <li>Acompanhar embalagem original (sacola do kimono ou saco plástico protetor).</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-3 animate-in fade-in duration-200 text-xs">
                <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-1">
                  <strong className="text-black dark:text-white block">Posso treinar um dia para testar o kimono e trocar depois?</strong>
                  <p className="text-zinc-500 leading-relaxed">
                    Não. Por normas de higiene e segurança, produtos usados em treinos físicos reais não podem ser aceitos para troca de tamanho, pois não poderão ser reembalados para outro atleta. Apenas prove sobre uma roupa limpa.
                  </p>
                </div>

                <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-1">
                  <strong className="text-black dark:text-white block">Comprei um Kit Iniciante (Kimono + Faixa) e só a faixa ficou pequena. O que faço?</strong>
                  <p className="text-zinc-500 leading-relaxed">
                    Você pode solicitar a troca do kit completo pelo marketplace ou entrar em contato com o suporte do vendedor parceiro pelo chat da compra para o envio avulso da numeração correta de faixa.
                  </p>
                </div>

                <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-1">
                  <strong className="text-black dark:text-white block">Quanto tempo demora para eu receber o novo tamanho?</strong>
                  <p className="text-zinc-500 leading-relaxed">
                    Em compras pelo Mercado Livre Full ou Amazon Prime, a aprovação da troca costuma ocorrer no mesmo dia da postagem reversa nos Correios, com o novo kimono chegando entre 2 a 4 dias úteis.
                  </p>
                </div>

                <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-1">
                  <strong className="text-black dark:text-white block">Preciso pagar alguma taxa para gerar a etiqueta de devolução?</strong>
                  <p className="text-zinc-500 leading-relaxed">
                    <strong>Zero custo.</strong> A logística reversa é integralmente coberta pela plataforma e pelos marketplaces parceiros oficiais do portal OSS.OS.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
              <ShieldCheck size={16} className="text-green-600 shrink-0" />
              <span>Suporte técnico do tatame disponível em caso de dúvidas.</span>
            </div>

            <Button
              type="button"
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="w-full sm:w-auto bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-mono font-black uppercase text-xs tracking-wider px-6 py-2.5 rounded-none cursor-pointer"
            >
              Entendido, Voltar ao Checkout
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

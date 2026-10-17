import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  Award,
  Zap,
  Building2,
  ShoppingBag,
  Shield,
  Heart,
  Calendar,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  pointsReward: number;
  completed: boolean;
}

export interface OnboardingChecklistProps {
  user: any;
  role: 'atleta' | 'gestor' | 'lojista' | 'admin' | 'convidado';
  onNavigate?: (view: any) => void;
  onAction?: (actionId: string) => void;
  onAddPoints?: (pts: number) => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info', icon?: React.ReactNode) => void;
  playClickSound?: () => void;
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  user,
  role,
  onNavigate,
  onAction,
  onAddPoints,
  addToast,
  playClickSound
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  // Define steps per user role
  const roleStepsMap: Record<string, OnboardingStep[]> = {
    atleta: [
      {
        id: 'atleta_profile',
        title: 'Definir Faixa e Dojo de Treino',
        description: 'Seu perfil foi configurado com sua graduação e academia principal.',
        actionLabel: 'Ver Perfil',
        pointsReward: 50,
        completed: true
      },
      {
        id: 'atleta_checkin',
        title: 'Fazer o 1º Check-in de Treino no Tatame',
        description: 'Registre seu treino do dia para iniciar sua sequência de dias consecutivos.',
        actionLabel: 'Check-in Agora',
        pointsReward: 50,
        completed: false
      },
      {
        id: 'atleta_wishlist',
        title: 'Salvar 1º Kimono na Wishlist com Alerta',
        description: 'Adicione um equipamento aos seus favoritos para monitorar quedas de preço.',
        actionLabel: 'Abrir Wishlist',
        pointsReward: 50,
        completed: false
      },
      {
        id: 'atleta_compare',
        title: 'Explorar o Comparador de Preços',
        description: 'Descubra as melhores ofertas de kimonos entre Amazon, Mercado Livre e lojas oficiais.',
        actionLabel: 'Comparar Preços',
        pointsReward: 50,
        completed: false
      }
    ],
    gestor: [
      {
        id: 'gestor_dojo_info',
        title: 'Cadastrar Dados e Endereço do Dojo',
        description: 'Preencha o nome do CT, mestre responsável e endereço para novos alunos.',
        actionLabel: 'Configurar Dojo',
        pointsReward: 60,
        completed: true
      },
      {
        id: 'gestor_schedules',
        title: 'Montar a Grade de Horários (Gi & No-Gi)',
        description: 'Defina os horários das turmas de Jiu-Jitsu Kids, Adulto, Feminino e Master.',
        actionLabel: 'Grade de Treinos',
        pointsReward: 60,
        completed: false
      },
      {
        id: 'gestor_students',
        title: 'Cadastrar o 1º Aluno ou Turma',
        description: 'Adicione alunos para acompanhar presenças e graduações de faixas.',
        actionLabel: 'Painel de Alunos',
        pointsReward: 60,
        completed: false
      },
      {
        id: 'gestor_social',
        title: 'Ativar Parceria Social OSS',
        description: 'Conecte sua academia ao projeto de doação de kimonos para projetos sociais.',
        actionLabel: 'Ativar OSS Social',
        pointsReward: 70,
        completed: false
      }
    ],
    lojista: [
      {
        id: 'lojista_brand',
        title: 'Cadastrar Marca Oficial e E-commerce',
        description: 'Vincule seu canal de vendas e razão social oficial.',
        actionLabel: 'Validar Marca',
        pointsReward: 75,
        completed: true
      },
      {
        id: 'lojista_coupon',
        title: 'Publicar 1º Cupom de Desconto Comunitário',
        description: 'Disponibilize um cupom exclusivo para os atletas cadastrados no portal.',
        actionLabel: 'Criar Cupom',
        pointsReward: 75,
        completed: false
      },
      {
        id: 'lojista_size_chart',
        title: 'Revisar Tabela de Medidas (A1 a A4)',
        description: 'Garanta que seus clientes encontrem o tamanho exato de kimono sem devoluções.',
        actionLabel: 'Tabela de Medidas',
        pointsReward: 50,
        completed: false
      },
      {
        id: 'lojista_metrics',
        title: 'Acompanhar Painel de Cliques Afiliados',
        description: 'Monitore o tráfego gerado e taxa de conversão em tempo real.',
        actionLabel: 'Ver Métricas',
        pointsReward: 50,
        completed: false
      }
    ],
    admin: [
      {
        id: 'admin_metrics',
        title: 'Revisar Métricas Globais de Tráfego e Usuários',
        description: 'Audite a contagem de atletas, gestores e lojistas ativos no sistema.',
        actionLabel: 'Métricas Globais',
        pointsReward: 50,
        completed: true
      },
      {
        id: 'admin_moderation',
        title: 'Moderar Avaliações Pendentes de Kimonos',
        description: 'Aprove opiniões e relatos técnicos da comunidade.',
        actionLabel: 'Fila de Moderação',
        pointsReward: 50,
        completed: false
      },
      {
        id: 'admin_push_test',
        title: 'Disparar Teste de Notificação Push Web/PWA',
        description: 'Valide a entrega de alertas em tempo real para dispositivos móveis.',
        actionLabel: 'Disparar Push',
        pointsReward: 50,
        completed: false
      },
      {
        id: 'admin_lgpd_logs',
        title: 'Auditar Logs de Consentimento LGPD (Art. 18)',
        description: 'Verifique os registros de consentimento e termos aceitos na base.',
        actionLabel: 'Logs de Auditoria',
        pointsReward: 50,
        completed: false
      }
    ],
    convidado: [
      {
        id: 'guest_explore',
        title: 'Explorar o Catálogo de Kimonos',
        description: 'Navegue pelos melhores modelos de kimonos do mercado.',
        actionLabel: 'Ver Produtos',
        pointsReward: 25,
        completed: true
      },
      {
        id: 'guest_compare',
        title: 'Testar o Comparador de Preços',
        description: 'Compare preços e especificações técnicas de tecidos trançados.',
        actionLabel: 'Comparar Preços',
        pointsReward: 25,
        completed: false
      },
      {
        id: 'guest_register',
        title: 'Criar Conta Definitiva no Tatame',
        description: 'Salve seus treinos, crie sua Wishlist e ganhe seus primeiros 150 pontos.',
        actionLabel: 'Criar Conta Agora',
        pointsReward: 100,
        completed: false
      }
    ]
  };

  const steps = roleStepsMap[role] || roleStepsMap.atleta;
  const storageKey = `oss_onboarding_${role}_${user?.uid || 'guest'}`;

  // Load completed steps from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setCompletedSteps(JSON.parse(saved));
      } catch (e) {
        setCompletedSteps(['atleta_profile', 'gestor_dojo_info', 'lojista_brand', 'admin_metrics', 'guest_explore']);
      }
    } else {
      // Default: the first step is automatically complete upon registration
      const defaultDone = steps.filter(s => s.completed).map(s => s.id);
      setCompletedSteps(defaultDone);
      localStorage.setItem(storageKey, JSON.stringify(defaultDone));
    }
  }, [role, user?.uid]);

  const toggleStep = (stepId: string) => {
    playClickSound?.();
    const isCurrentlyDone = completedSteps.includes(stepId);
    let updated: string[];

    if (isCurrentlyDone) {
      updated = completedSteps.filter(id => id !== stepId);
    } else {
      updated = [...completedSteps, stepId];
      const stepObj = steps.find(s => s.id === stepId);
      if (stepObj && onAddPoints) {
        onAddPoints(stepObj.pointsReward);
      }
      addToast(`Passo concluído: "${stepObj?.title}" (+${stepObj?.pointsReward} pts)!`, 'success', <CheckCircle2 size={14} className="text-green-600" />);
    }

    setCompletedSteps(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Check if all steps are completed
    if (updated.length === steps.length && !hasCelebrated) {
      setHasCelebrated(true);
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 }
      });
      if (onAddPoints) {
        onAddPoints(150); // Completion bonus
      }
      addToast('🎉 Parabéns! Onboarding 100% concluído! Bônus de +150 OSS Points creditado!', 'success', <Award size={14} className="text-green-600" />);
    }
  };

  const handleStepAction = (step: OnboardingStep) => {
    playClickSound?.();

    if (!completedSteps.includes(step.id)) {
      toggleStep(step.id);
    }

    // Role-specific action routing
    if (step.id === 'atleta_wishlist') {
      if (onNavigate) onNavigate('WISHLIST');
    } else if (step.id === 'atleta_compare' || step.id === 'guest_compare') {
      if (onNavigate) onNavigate('COMPARATOR');
    } else if (step.id === 'guest_explore') {
      if (onNavigate) onNavigate('SHOP');
    } else if (step.id === 'atleta_checkin') {
      if (onAction) onAction('OPEN_CHECKIN');
      else addToast('Check-in no tatame registrado com sucesso (+50 pts)!', 'success');
    } else if (onAction) {
      onAction(step.id);
    }
  };

  const progressPercentage = Math.round((completedSteps.length / steps.length) * 100);
  const isAllDone = completedSteps.length === steps.length;

  return (
    <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 sm:p-7 shadow-sm transition-all text-left mb-8 relative overflow-hidden">
      {/* Background Accent Pill */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/5 dark:bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-850 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/10 border border-green-500/30 text-green-600 flex items-center justify-center shrink-0">
            {isAllDone ? <Award size={20} className="text-green-600 animate-bounce" /> : <Sparkles size={18} className="text-green-600" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[8.5px] font-mono font-black text-green-600 uppercase tracking-widest">
                // GUIA DE PRIMEIROS PASSOS ({role.toUpperCase()})
              </span>
              {isAllDone && (
                <span className="text-[7.5px] font-mono font-black px-2 py-0.5 bg-green-600 text-white uppercase tracking-wider">
                  CONCLUÍDO 🥋
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-black dark:text-white">
              {isAllDone ? 'Onboarding Concluído com Honra!' : 'Checklist de Primeiros Passos no Tatame'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress summary pill */}
          <div className="text-right hidden sm:block">
            <span className="text-xs font-black font-mono text-black dark:text-white">{progressPercentage}%</span>
            <p className="text-[8px] text-zinc-400 font-mono uppercase tracking-wider">{completedSteps.length} de {steps.length} passos</p>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            title={isCollapsed ? 'Expandir Checklist' : 'Recolher Checklist'}
          >
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 mb-5 relative overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-green-600 to-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Checklist Items */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {steps.map((step, idx) => {
                const isCompleted = completedSteps.includes(step.id);
                return (
                  <div
                    key={step.id}
                    className={`p-3.5 border transition-all flex items-start justify-between gap-3 ${
                      isCompleted
                        ? 'bg-green-500/5 dark:bg-green-500/5 border-green-500/20 text-zinc-600 dark:text-zinc-400'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-white shadow-sm hover:border-zinc-400'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleStep(step.id)}
                      className="mt-0.5 text-zinc-400 hover:text-green-600 cursor-pointer shrink-0 transition-colors"
                      title={isCompleted ? 'Marcar como pendente' : 'Marcar como concluído'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={18} className="text-green-600 fill-green-500/20" />
                      ) : (
                        <Circle size={18} />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-black uppercase tracking-tight line-clamp-1 ${
                          isCompleted ? 'line-through text-zinc-400' : 'text-black dark:text-white'
                        }`}>
                          {step.title}
                        </span>
                        <span className="text-[7.5px] font-mono font-black text-green-600 dark:text-green-400 shrink-0">
                          +{step.pointsReward} pts
                        </span>
                      </div>
                      <p className="text-[9px] text-zinc-400 leading-relaxed font-light mt-0.5 line-clamp-2">
                        {step.description}
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant={isCompleted ? 'ghost' : 'outline'}
                      onClick={() => handleStepAction(step)}
                      className={`text-[8px] font-mono font-black uppercase tracking-wider px-2.5 py-1.5 h-auto rounded-none shrink-0 cursor-pointer ${
                        isCompleted
                          ? 'text-zinc-400 hover:text-black dark:hover:text-white'
                          : 'border-zinc-300 dark:border-zinc-700 bg-black text-white dark:bg-white dark:text-black hover:bg-green-600 hover:text-white'
                      }`}
                    >
                      {isCompleted ? 'Rever' : step.actionLabel}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Completion Banner */}
            {isAllDone && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 flex items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                  <Sparkles size={14} className="text-green-600" />
                  <span>Você concluiu todos os passos iniciais do seu perfil!</span>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    confetti({ particleCount: 150, spread: 80 });
                    addToast('Parabéns pela dedicação ao tatame! OSS!', 'success');
                  }}
                  className="rounded-none bg-green-600 hover:bg-green-700 text-white text-[8.5px] font-mono font-black uppercase py-1.5 px-3 h-auto"
                >
                  Comemorar 🎉
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

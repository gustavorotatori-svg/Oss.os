import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Building2,
  Calendar,
  Clock,
  Users,
  Plus,
  Trash2,
  ShoppingBag,
  Tag,
  Copy,
  Check,
  Shield,
  Send,
  AlertCircle,
  Award,
  Sparkles,
  Info,
  CheckCircle2,
  Heart,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/* =========================================================================
   1. DOJO MANAGEMENT PANEL (GESTOR DE ACADEMIA / DOJO / MESTRE)
   ========================================================================= */
export interface DojoSchedule {
  id: string;
  category: string;
  type: 'Gi (Com Kimono)' | 'No-Gi (Sem Kimono)' | 'Kids' | 'Competição';
  days: string;
  time: string;
  instructor: string;
}

export interface Student {
  id: string;
  name: string;
  belt: string;
  degrees: number;
  lastCheckin: string;
  status: 'Ativo' | 'Pendente';
}

export const DojoManagementPanel: React.FC<{
  user: any;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  playClickSound?: () => void;
}> = ({ user, addToast, playClickSound }) => {
  const [schedules, setSchedules] = useState<DojoSchedule[]>([
    { id: '1', category: 'Adulto Geral', type: 'Gi (Com Kimono)', days: 'Seg / Qua / Sex', time: '19:30 - 21:00', instructor: user.masterName || 'Mestre Fábio' },
    { id: '2', category: 'No-Gi Submission', type: 'No-Gi (Sem Kimono)', days: 'Ter / Qui', time: '20:00 - 21:15', instructor: 'Prof. Lucas' },
    { id: '3', category: 'Kids (6 a 12 anos)', type: 'Kids', days: 'Seg / Qua', time: '18:00 - 19:00', instructor: 'Instrutora Camila' },
    { id: '4', category: 'Treino de Competição', type: 'Competição', days: 'Sábado', time: '10:00 - 12:00', instructor: 'Mestre Principal' }
  ]);

  const [students, setStudents] = useState<Student[]>([
    { id: 's1', name: 'Rodrigo Medeiros', belt: 'Azul', degrees: 2, lastCheckin: 'Hoje às 19:40', status: 'Ativo' },
    { id: 's2', name: 'Juliana Paes', belt: 'Roxa', degrees: 1, lastCheckin: 'Ontem às 20:10', status: 'Ativo' },
    { id: 's3', name: 'Carlos Eduardo', belt: 'Branca', degrees: 3, lastCheckin: 'Há 2 dias', status: 'Ativo' }
  ]);

  const [newCat, setNewCat] = useState('');
  const [newDays, setNewDays] = useState('Seg / Qua / Sex');
  const [newTime, setNewTime] = useState('19:00 - 20:30');
  const [newInstructor, setNewInstructor] = useState(user.displayName || 'Mestre');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentBelt, setNewStudentBelt] = useState('Branca');
  const [socialDonationKimonos, setSocialDonationKimonos] = useState(5);

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound?.();
    if (!newCat.trim()) {
      addToast('Informe o nome da turma!', 'error');
      return;
    }

    const item: DojoSchedule = {
      id: 'sch-' + Date.now(),
      category: newCat.trim(),
      type: 'Gi (Com Kimono)',
      days: newDays,
      time: newTime,
      instructor: newInstructor
    };

    setSchedules([...schedules, item]);
    setNewCat('');
    addToast('Novo horário de treino adicionado à grade!', 'success');
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound?.();
    if (!newStudentName.trim()) {
      addToast('Nome do aluno é obrigatório!', 'error');
      return;
    }

    const item: Student = {
      id: 'std-' + Date.now(),
      name: newStudentName.trim(),
      belt: newStudentBelt,
      degrees: 0,
      lastCheckin: 'Recém Matriculado',
      status: 'Ativo'
    };

    setStudents([...students, item]);
    setNewStudentName('');
    addToast(`Aluno ${item.name} cadastrado com sucesso!`, 'success');
  };

  const handleRequestSocialSupport = () => {
    playClickSound?.();
    confetti({ particleCount: 120, spread: 70 });
    addToast(`Solicitação de ${socialDonationKimonos} kimonos sociais enviada para marcas parceiras!`, 'success');
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header Info */}
      <div className="p-6 bg-gradient-to-r from-blue-900/20 to-zinc-900 border border-blue-500/30">
        <div className="flex items-center gap-3 mb-2">
          <Building2 size={24} className="text-blue-500" />
          <div>
            <h3 className="text-xl font-black uppercase text-black dark:text-white">
              {user.dojo || 'Alliance Jiu-Jitsu Matriz'}
            </h3>
            <p className="text-[10px] font-mono text-zinc-400">
              Responsável: {user.masterName || user.displayName} | {user.cityState || 'São Paulo / SP'} | Academia Homologada OSS 🥋
            </p>
          </div>
        </div>
      </div>

      {/* 1. Schedules Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Calendar size={14} className="text-blue-500" /> Grade Oficial de Horários de Treino
          </h4>
          <span className="text-[9px] font-mono text-zinc-400 uppercase">{schedules.length} Horários Cadastrados</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {schedules.map((sch) => (
            <div key={sch.id} className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[8px] font-mono font-black text-blue-500 uppercase tracking-widest">{sch.type}</span>
                  <h5 className="text-sm font-black uppercase text-black dark:text-white">{sch.category}</h5>
                </div>
                <button
                  type="button"
                  onClick={() => setSchedules(schedules.filter(s => s.id !== sch.id))}
                  className="text-zinc-400 hover:text-red-500 p-1 cursor-pointer"
                  title="Remover horário"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                <span className="flex items-center gap-1"><Clock size={12} /> {sch.time}</span>
                <span>{sch.days}</span>
                <span className="text-zinc-400">{sch.instructor}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Add Schedule Form */}
        <form onSubmit={handleAddSchedule} className="p-4 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-4 gap-2">
          <Input
            placeholder="Nome da Turma (Ex: Feminino Gi)"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            className="text-xs bg-white dark:bg-black rounded-none"
            required
          />
          <Input
            placeholder="Dias (Ex: Seg / Qua)"
            value={newDays}
            onChange={(e) => setNewDays(e.target.value)}
            className="text-xs bg-white dark:bg-black rounded-none"
            required
          />
          <Input
            placeholder="Horário (Ex: 19:30 - 21:00)"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="text-xs bg-white dark:bg-black rounded-none"
            required
          />
          <Button type="submit" className="rounded-none bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black uppercase tracking-wider">
            <Plus size={12} className="mr-1" /> Adicionar Horário
          </Button>
        </form>
      </div>

      {/* 2. Students Roster */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Users size={14} className="text-blue-500" /> Alunos & Presença no Tatame
          </h4>
          <span className="text-[9px] font-mono text-zinc-400 uppercase">{students.length} Alunos</span>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          <table className="w-full text-[10px] text-left">
            <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 uppercase font-mono">
              <tr>
                <th className="p-3">Nome do Aluno</th>
                <th className="p-3">Graduação</th>
                <th className="p-3">Último Check-in</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <td className="p-3 font-bold text-black dark:text-white">{st.name}</td>
                  <td className="p-3">Faixa {st.belt} ({st.degrees}º Grau)</td>
                  <td className="p-3 font-mono text-zinc-500">{st.lastCheckin}</td>
                  <td className="p-3"><span className="px-2 py-0.5 bg-green-500/10 text-green-600 font-bold uppercase text-[8px]">{st.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Student Form */}
        <form onSubmit={handleAddStudent} className="p-3 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Nome do Novo Aluno"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            className="text-xs bg-white dark:bg-black rounded-none flex-1"
            required
          />
          <select
            value={newStudentBelt}
            onChange={(e) => setNewStudentBelt(e.target.value)}
            className="p-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black text-xs font-bold rounded-none"
          >
            <option value="Branca">Faixa Branca</option>
            <option value="Azul">Faixa Azul</option>
            <option value="Roxa">Faixa Roxa</option>
            <option value="Marrom">Faixa Marrom</option>
            <option value="Preta">Faixa Preta</option>
          </select>
          <Button type="submit" className="rounded-none bg-black dark:bg-white text-white dark:text-black text-[9px] font-black uppercase">
            Matricular Aluno
          </Button>
        </form>
      </div>

      {/* 3. OSS Social Support Program */}
      <div className="p-6 bg-green-500/10 border border-green-500/30 space-y-3">
        <div className="flex items-center gap-2 text-green-600">
          <Heart size={18} className="fill-green-600/20" />
          <h4 className="text-xs font-black uppercase tracking-widest">Projeto OSS Social (Doação de Kimonos)</h4>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-light">
          Sua academia atende jovens em situação de vulnerabilidade? Solicite kimonos e faixas doados diretamente pelas marcas de fabricação parceiras.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            onClick={handleRequestSocialSupport}
            className="rounded-none bg-green-600 hover:bg-green-700 text-white text-[9px] font-black uppercase tracking-wider py-4 cursor-pointer"
          >
            Solicitar Apoio de Kimonos Sociais
          </Button>
          <span className="text-[9px] font-mono text-zinc-400">100% Gratuito para projetos certificados</span>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   2. STORE & BRAND PARTNER PANEL (LOJISTA / MARCA DE KIMONOS / ANUNCIANTE)
   ========================================================================= */
export interface StoreCoupon {
  id: string;
  code: string;
  discount: string;
  channel: string;
  usageCount: number;
  active: boolean;
}

export const StorePartnerPanel: React.FC<{
  user: any;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  playClickSound?: () => void;
}> = ({ user, addToast, playClickSound }) => {
  const [coupons, setCoupons] = useState<StoreCoupon[]>([
    { id: 'cp1', code: user.storeCoupon || 'OSS15', discount: '15% OFF', channel: 'Loja Oficial & Mercado Livre', usageCount: 48, active: true },
    { id: 'cp2', code: 'TATAMEBLACK', discount: '20% OFF', channel: 'Kimonos Trançados Pesados', usageCount: 112, active: true },
    { id: 'cp3', code: 'FAIXAPRETA10', discount: '10% OFF', channel: 'Faixas Especiais', usageCount: 29, active: true }
  ]);

  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('10% OFF');

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound?.();
    if (!newCouponCode.trim()) {
      addToast('Digite o código do cupom!', 'error');
      return;
    }

    const item: StoreCoupon = {
      id: 'cp-' + Date.now(),
      code: newCouponCode.trim().toUpperCase(),
      discount: newCouponDiscount,
      channel: user.storeBrandName || 'Loja Parceira Oficial',
      usageCount: 0,
      active: true
    };

    setCoupons([...coupons, item]);
    setNewCouponCode('');
    confetti({ particleCount: 80, spread: 60 });
    addToast(`Cupom ${item.code} publicado para a comunidade de atletas!`, 'success');
  };

  const copyCouponCode = (code: string) => {
    playClickSound?.();
    navigator.clipboard.writeText(code);
    addToast(`Código ${code} copiado para a área de transferência!`, 'success', <Copy size={14} />);
  };

  return (
    <div className="space-y-8 text-left">
      {/* Brand Header */}
      <div className="p-6 bg-gradient-to-r from-amber-900/20 to-zinc-900 border border-amber-500/30">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingBag size={24} className="text-amber-500" />
          <div>
            <h3 className="text-xl font-black uppercase text-black dark:text-white">
              {user.storeBrandName || 'Venum & KVRA Brasil'}
            </h3>
            <p className="text-[10px] font-mono text-zinc-400">
              Canal Principal: {user.storeChannel || 'Mercado Livre / Loja Oficial'} | Selo Oficial de Fabricante Certificado 🛍️
            </p>
          </div>
        </div>
      </div>

      {/* 1. Coupon Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Tag size={14} className="text-amber-500" /> Cupons de Desconto para Atletas do Portal
          </h4>
          <span className="text-[9px] font-mono text-zinc-400 uppercase">{coupons.length} Cupons Ativos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {coupons.map((cp) => (
            <div key={cp.id} className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-black text-amber-500 font-mono tracking-widest">{cp.code}</span>
                <span className="text-[9px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5">{cp.discount}</span>
              </div>
              <p className="text-[9px] text-zinc-400 font-mono line-clamp-1">{cp.channel}</p>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-900">
                <span className="text-[8px] font-mono text-zinc-500">{cp.usageCount} resgates</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => copyCouponCode(cp.code)}
                  className="text-[8px] font-mono font-black uppercase py-1 px-2 h-auto rounded-none"
                >
                  <Copy size={10} className="mr-1" /> Copiar
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Coupon Form */}
        <form onSubmit={handleAddCoupon} className="p-4 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Novo Código de Cupom (Ex: OSS20)"
            value={newCouponCode}
            onChange={(e) => setNewCouponCode(e.target.value)}
            className="text-xs bg-white dark:bg-black rounded-none uppercase font-mono font-bold flex-1"
            required
          />
          <Input
            placeholder="Desconto (Ex: 20% OFF)"
            value={newCouponDiscount}
            onChange={(e) => setNewCouponDiscount(e.target.value)}
            className="text-xs bg-white dark:bg-black rounded-none sm:w-36"
            required
          />
          <Button type="submit" className="rounded-none bg-amber-600 hover:bg-amber-700 text-white text-[9px] font-black uppercase tracking-wider">
            Publicar Cupom
          </Button>
        </form>
      </div>

      {/* 2. Official Kimono Size Chart */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={14} className="text-amber-500" /> Tabela de Medidas Oficial de Kimonos (A1 a A4)
          </h4>
          <span className="text-[9px] font-mono text-zinc-400 uppercase">Referência IBJJF / CBJJ</span>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          <table className="w-full text-[10px] text-left">
            <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 uppercase font-mono">
              <tr>
                <th className="p-3">Tamanho</th>
                <th className="p-3">Altura Recomendada</th>
                <th className="p-3">Peso Recomendado</th>
                <th className="p-3">Tipo de Corte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
              <tr>
                <td className="p-3 font-bold text-black dark:text-white">A1</td>
                <td className="p-3">1,60m a 1,72m</td>
                <td className="p-3">Até 75 kg</td>
                <td className="p-3">Slim Fit & Competição</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-black dark:text-white">A2</td>
                <td className="p-3">1,73m a 1,82m</td>
                <td className="p-3">76 kg a 88 kg</td>
                <td className="p-3">Padrão Tradicional</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-black dark:text-white">A3</td>
                <td className="p-3">1,83m a 1,91m</td>
                <td className="p-3">89 kg a 100 kg</td>
                <td className="p-3">Trançado Reforçado</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-black dark:text-white">A4</td>
                <td className="p-3">1,92m a 2,05m</td>
                <td className="p-3">101 kg a 120 kg</td>
                <td className="p-3">Pesadíssimo / Master</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   3. ADMIN GLOBAL PANEL (ADMINISTRADOR DO PORTAL / AUDITORIA / PUSH)
   ========================================================================= */
export const AdminGlobalPanel: React.FC<{
  user: any;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  playClickSound?: () => void;
}> = ({ user, addToast, playClickSound }) => {
  const [pushTitle, setPushTitle] = useState('🥋 Kimono KVRA com 30% OFF na Loja Parceira!');
  const [pushBody, setPushBody] = useState('Aproveite a oferta relâmpago antes que termine o estoque!');
  const [pendingReviews, setPendingReviews] = useState([
    { id: 'rev-1', user: 'Gabriel Santos (Faixa Roxa)', product: 'Kimono Atama Mundial', rating: 5, comment: 'Tecido super resistente e leve para bater o peso no campeonato.' },
    { id: 'rev-2', user: 'Mariana Lima (Faixa Azul)', product: 'Kimono Venum Elite Light', rating: 4, comment: 'Excelente para o verão, secagem muito rápida após o treino.' }
  ]);

  const handleSendTestPush = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound?.();

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(pushTitle, {
        body: pushBody,
        icon: '/icon-192.png'
      });
    }

    confetti({ particleCount: 100, spread: 70 });
    addToast('Notificação push de teste enviada aos dispositivos conectados!', 'success');
  };

  const handleApproveReview = (id: string) => {
    playClickSound?.();
    setPendingReviews(pendingReviews.filter(r => r.id !== id));
    addToast('Avaliação de kimono aprovada e publicada no portal!', 'success');
  };

  return (
    <div className="space-y-8 text-left">
      {/* Admin Header */}
      <div className="p-6 bg-gradient-to-r from-purple-900/20 to-zinc-900 border border-purple-500/30">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={24} className="text-purple-500" />
          <div>
            <h3 className="text-xl font-black uppercase text-black dark:text-white">
              Painel de Controle Global OSS.OS
            </h3>
            <p className="text-[10px] font-mono text-zinc-400">
              Administrador: {user.displayName} | Auditoria em Tempo Real & Moderação 🛡️
            </p>
          </div>
        </div>
      </div>

      {/* Global Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
          <span className="text-[8px] font-mono font-black text-green-600 uppercase">Atletas Cadastrados</span>
          <h4 className="text-2xl font-black text-black dark:text-white">1.842</h4>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
          <span className="text-[8px] font-mono font-black text-blue-500 uppercase">Dojos & Academias</span>
          <h4 className="text-2xl font-black text-black dark:text-white">128</h4>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
          <span className="text-[8px] font-mono font-black text-amber-500 uppercase">Lojistas Parceiros</span>
          <h4 className="text-2xl font-black text-black dark:text-white">42</h4>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
          <span className="text-[8px] font-mono font-black text-purple-500 uppercase">Logs LGPD Auditados</span>
          <h4 className="text-2xl font-black text-black dark:text-white">100% OK</h4>
        </div>
      </div>

      {/* 1. Push Notification Broadcaster */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <Send size={14} className="text-purple-500" /> Disparador de Notificação Push Web/PWA
          </h4>
          <span className="text-[9px] font-mono text-zinc-400 uppercase">Teste em Tempo Real</span>
        </div>

        <form onSubmit={handleSendTestPush} className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div>
            <label className="block text-[8px] font-mono font-black text-zinc-400 uppercase mb-1">Título do Alerta</label>
            <Input
              value={pushTitle}
              onChange={(e) => setPushTitle(e.target.value)}
              className="text-xs rounded-none bg-zinc-50 dark:bg-zinc-900"
              required
            />
          </div>
          <div>
            <label className="block text-[8px] font-mono font-black text-zinc-400 uppercase mb-1">Corpo da Mensagem</label>
            <Input
              value={pushBody}
              onChange={(e) => setPushBody(e.target.value)}
              className="text-xs rounded-none bg-zinc-50 dark:bg-zinc-900"
              required
            />
          </div>
          <Button type="submit" className="w-full rounded-none bg-purple-600 hover:bg-purple-700 text-white text-[9px] font-black uppercase tracking-wider py-4">
            <Send size={12} className="mr-1.5" /> Disparar Teste Push Agora
          </Button>
        </form>
      </div>

      {/* 2. Review Moderation Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <FileText size={14} className="text-purple-500" /> Fila de Moderação de Avaliações
          </h4>
          <span className="text-[9px] font-mono text-zinc-400 uppercase">{pendingReviews.length} Pendentes</span>
        </div>

        {pendingReviews.length === 0 ? (
          <p className="text-xs text-zinc-400 font-mono italic p-4 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            ✓ Nenhuma avaliação pendente de moderação no momento.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingReviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-black dark:text-white uppercase">{rev.user}</span>
                    <span className="text-[8px] font-mono text-zinc-400">sobre {rev.product}</span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-serif italic mt-1 leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleApproveReview(rev.id)}
                  className="rounded-none bg-green-600 hover:bg-green-700 text-white text-[8px] font-black uppercase py-2 px-3 h-auto"
                >
                  <Check size={12} className="mr-1" /> Aprovar
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

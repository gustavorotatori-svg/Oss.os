import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Award, 
  ShoppingBag, 
  Bell, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Product } from '../types';

export interface KidAthlete {
  id: string;
  name: string;
  age: number;
  belt: string;
  degrees: number;
  giSize: string;
  dojo: string;
  instructor: string;
  attendanceThisMonth: number;
  totalClassesRequiredForGraduation: number;
  classesCompleted: number;
}

export interface ParentDashboardProps {
  user?: any;
  productList?: Product[];
  onNavigate?: (view: string) => void;
  onSelectProduct?: (product: Product) => void;
  addToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  user,
  productList = [],
  onNavigate,
  onSelectProduct,
  addToast
}) => {
  const [kids, setKids] = useState<KidAthlete[]>([
    {
      id: 'k1',
      name: 'Lucas Rotatori',
      age: 8,
      belt: 'Cinza e Branca',
      degrees: 2,
      giSize: 'M1 (120-130cm)',
      dojo: 'Alliance Kids Matriz',
      instructor: 'Instrutora Camila',
      attendanceThisMonth: 10,
      totalClassesRequiredForGraduation: 36,
      classesCompleted: 28
    }
  ]);

  const [selectedKidId, setSelectedKidId] = useState<string>('k1');
  const activeKid = kids.find(k => k.id === selectedKidId) || kids[0];

  const kidsKimonos = productList.filter(
    p => p.category === 'Kimonos' || p.category === 'Equipamentos para Iniciantes'
  ).slice(0, 3);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase text-black dark:text-white font-mono">
            Painel dos Pais & Responsáveis
          </h1>
          <p className="text-xs text-zinc-500 font-sans mt-0.5">
            Acompanhe a frequência no tatame, graduação infantil e tamanho de equipamentos.
          </p>
        </div>

        {kids.length > 1 && (
          <div className="flex items-center gap-2">
            {kids.map(kid => (
              <button
                key={kid.id}
                onClick={() => setSelectedKidId(kid.id)}
                className={`px-3 py-1.5 font-mono text-xs font-bold uppercase border transition-colors ${
                  kid.id === activeKid.id
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                    : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {kid.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeKid && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Athlete Card */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-mono font-black text-lg flex items-center justify-center">
                {activeKid.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-mono font-black text-sm text-black dark:text-white uppercase">
                  {activeKid.name}
                </h3>
                <span className="text-[10px] font-mono text-zinc-400">
                  {activeKid.age} anos • {activeKid.dojo}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-900 text-xs font-mono">
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Graduação Atual:</span>
                <span className="font-bold text-black dark:text-white">
                  Faixa {activeKid.belt} ({activeKid.degrees}º Grau)
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Tamanho de Kimono:</span>
                <span className="font-bold text-black dark:text-white">{activeKid.giSize}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Instrutor Responsável:</span>
                <span className="font-bold text-black dark:text-white">{activeKid.instructor}</span>
              </div>
            </div>
          </div>

          {/* Attendance and Graduation Progress */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-black uppercase text-zinc-900 dark:text-zinc-100">
                Progresso para o Próximo Grau
              </h4>
              <span className="text-xs font-mono font-bold text-green-600">
                {activeKid.classesCompleted} / {activeKid.totalClassesRequiredForGraduation} aulas
              </span>
            </div>

            <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-3 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div 
                className="bg-green-600 h-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((activeKid.classesCompleted / activeKid.totalClassesRequiredForGraduation) * 100))}%`
                }}
              />
            </div>

            <div className="pt-2 text-xs font-mono text-zinc-500 space-y-1">
              <p>Frequência este mês: <strong className="text-black dark:text-white">{activeKid.attendanceThisMonth} presenças</strong></p>
              <p className="text-[11px] text-zinc-400">
                Faltam {Math.max(0, activeKid.totalClassesRequiredForGraduation - activeKid.classesCompleted)} aulas para a próxima graduação.
              </p>
            </div>
          </div>

          {/* Quick Actions & Guidance */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-black uppercase text-zinc-900 dark:text-zinc-100">
                Ações Rápidas
              </h4>
              <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                Consulte o tamanho ideal para reposição de kimonos infantis ou solicite declaração de frequência ao dojo.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => onNavigate?.('SHOP')}
                className="w-full py-2.5 bg-black dark:bg-white text-white dark:text-black font-mono text-xs font-bold uppercase transition-colors"
              >
                Kimonos Infantis
              </button>
              <button
                onClick={() => addToast?.('Solicitação enviada ao professor do dojo!', 'success')}
                className="w-full py-2.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 text-black dark:text-white font-mono text-xs font-bold uppercase transition-colors"
              >
                Falar com Professor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Kids Gear */}
      {kidsKimonos.length > 0 && (
        <div className="pt-4 space-y-3">
          <h3 className="text-xs font-mono font-black uppercase tracking-wider text-black dark:text-white">
            Kimonos e Equipamentos Infantis Recomendados
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {kidsKimonos.map((prod) => (
              <div
                key={prod.id}
                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 space-y-2 flex flex-col justify-between"
              >
                <div className="aspect-square bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                  <img src={prod.imageUrl} alt={prod.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-[9px] font-mono text-zinc-400 uppercase">{prod.brand}</span>
                  <h4 className="text-xs font-mono font-bold text-black dark:text-white line-clamp-1">{prod.title}</h4>
                  <span className="text-xs font-mono font-black text-green-600 block mt-1">R$ {prod.price.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => onSelectProduct?.(prod)}
                  className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-black dark:text-white font-mono text-[10px] font-bold uppercase"
                >
                  Ver Detalhes
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;

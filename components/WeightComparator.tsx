import React, { useState, useEffect, useMemo } from 'react';
import { 
  Scale, 
  Sparkles, 
  Award, 
  TrendingDown, 
  X, 
  Check, 
  ChevronDown, 
  ArrowRightLeft,
  ShieldAlert,
  Dumbbell,
  Lightbulb,
  Gauge,
  Zap,
  Swords
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';

interface Legend {
  name: string;
  titles: string;
  category: string;
  specialty: string;
  quote: string;
  highlights: string[];
  avatar: string;
}

interface WeightComparatorProps {
  legends: Legend[];
  selectedLegendIndex: number;
}

// Default realistic weight mappings for each legend index
const LEGEND_DEFAULT_WEIGHTS = [
  115, // Marcus Buchecha (Pesadíssimo)
  102, // Roger Gracie (Super Pesado)
  57,  // Bruno Malfacine (Peso Galo)
  95,  // Gabi Pessanha (Super Pesado FEM)
  64,  // Bia Mesquita (Peso Leve FEM)
  58.5,// Michelle Nicolini (Peso Pena FEM)
  53.5,// Letícia Ribeiro (Peso Pluma FEM)
  88,  // Leandro Lo (Meio-Pesado)
  74,  // Hannette Staack (Médio-Pesado FEM)
  92   // Xande Ribeiro (Peso Pesado)
];

export const WeightComparator: React.FC<WeightComparatorProps> = ({ legends, selectedLegendIndex }) => {
  const { t } = useTranslation();
  
  // States
  const [opponentIndex, setOpponentIndex] = useState<number>(() => {
    // Default opponent is Roger Gracie (index 1) or Buchecha (index 0) depending on selection
    return selectedLegendIndex === 1 ? 0 : 1;
  });
  const [showOpponentDropdown, setShowOpponentDropdown] = useState(false);
  
  const [weightA, setWeightA] = useState<number>(LEGEND_DEFAULT_WEIGHTS[selectedLegendIndex]);
  const [weightB, setWeightB] = useState<number>(LEGEND_DEFAULT_WEIGHTS[opponentIndex]);

  // Sync weights when selectedLegendIndex changes
  useEffect(() => {
    setWeightA(LEGEND_DEFAULT_WEIGHTS[selectedLegendIndex]);
  }, [selectedLegendIndex]);

  // Sync opponent weight when opponent selection changes
  useEffect(() => {
    setWeightB(LEGEND_DEFAULT_WEIGHTS[opponentIndex]);
  }, [opponentIndex]);

  const fighterA = legends[selectedLegendIndex];
  const fighterB = legends[opponentIndex];

  const weightDiff = weightA - weightB;
  const absWeightDiff = Math.abs(weightDiff);

  // Dynamic calculations for stat modifications based on weight difference
  const statsModifications = useMemo(() => {
    // Basic weight factor scaling
    const factor = weightDiff; // positive means A is heavier, negative means B is heavier
    
    // Attacking power / pressure modifications
    const pressureModA = factor * 0.4; // +0.4% per kg advantage
    const pressureModB = -factor * 0.4;

    // Speed / agility modifications
    const speedModA = -factor * 0.35; // -0.35% per kg penalty
    const speedModB = factor * 0.35;

    // Isometric stamina/cardio drain modifications
    const cardioModA = -factor * 0.3; // heavier fighter burns more energy holding weight
    const cardioModB = factor * 0.3;

    return {
      a: {
        pressure: Math.min(15, Math.max(-15, pressureModA)),
        speed: Math.min(12, Math.max(-12, speedModA)),
        cardio: Math.min(10, Math.max(-10, cardioModA)),
      },
      b: {
        pressure: Math.min(15, Math.max(-15, pressureModB)),
        speed: Math.min(12, Math.max(-12, speedModB)),
        cardio: Math.min(10, Math.max(-10, cardioModB)),
      }
    };
  }, [weightDiff]);

  // Custom detailed tactical blueprints depending on fighters and weight disparity
  const tacticalAnalysis = useMemo(() => {
    const nameA = fighterA.name.split(' ')[0];
    const nameB = fighterB.name.split(' ')[0];
    
    if (absWeightDiff < 5) {
      return {
        title: "EQUILÍBRIO DE FORÇAS // JOGO TÉCNICO PURO",
        advantage: "A diferença de peso é insignificante (< 5kg). A luta será decidida pela pura excelência técnica, controle de pegadas (Kumikata) e quem impõe a especialidade primeiro.",
        strategyA: `Como o peso está parelho, ${nameA} deve apostar tudo em sua especialidade máxima de "${fighterA.specialty}". Manter postura firme e focar na precisão mecânica.`,
        strategyB: `Para ${nameB}, a chave do sucesso é anular as pegadas iniciais de ${nameA} e aplicar transições rápidas de contra-ataque. Sua assinatura de "${fighterB.specialty}" será crucial.`
      };
    } else if (weightDiff >= 5) {
      // Fighter A is significantly heavier
      return {
        title: `VANTAGEM FÍSICA PARA ${fighterA.name.toUpperCase()}`,
        advantage: `${fighterA.name} possui uma vantagem gravitacional de ${absWeightDiff.toFixed(1)} kg. Isso sobrecarrega a guarda e as defesas de ${fighterB.name} através de pressão isométrica contínua por cima.`,
        strategyA: `${nameA} deve encurtar a distância cedo, preferir quedas pesadas de quadril e consolidar posições de controle lateral ou meia-guarda. Use a técnica de "ombro de justiça" para fadigar o peito de ${nameB} antes de tentar passar ou finalizar. Evite dar espaço para emboladas rápidas.`,
        strategyB: `${nameB} deve evitar aceitar o peso por baixo a todo custo. Jogar com guarda aberta ativa (Guarda De la Riva, Lasso ou Aranha) para manter a distância e cansar os braços de ${nameA}. Foque em ataques de braço ou perna que anulem o peso, ou transições diretas para as costas nas brechas de postura.`
      };
    } else {
      // Fighter B is significantly heavier
      return {
        title: `SOBRECARGA DE PESO PARA ${fighterB.name.toUpperCase()}`,
        advantage: `${fighterB.name} está ${absWeightDiff.toFixed(1)} kg mais pesado. ${fighterA.name} terá desvantagem na força bruta, mas terá vantagem nítida de velocidade, aceleração de quadris e flexibilidade de transição.`,
        strategyA: `${nameA} precisa jogar com velocidade cirúrgica. Não tente fazer força contra força. Use raspagens rápidas de alavanca (como Guarda X ou Single Leg X) ou fustigue as pernas de ${nameB} para abrir caminhos de passagem ágeis. Mantenha os cotovelos colados para não ceder pressão na montada.`,
        strategyB: `${nameB} deve impor seu jogo de pressão lenta ("slow passing"), travando o quadril de ${nameA} com pegadas duplas nas calças ou esgrimando a meia-guarda. Uma vez por cima, use a gravidade para esmagar a flexibilidade de recuperação de guarda de ${nameA}.`
      };
    }
  }, [fighterA, fighterB, weightDiff, absWeightDiff]);

  // Rotation of the balance scale based on weight difference
  // Max tilt at 30kg difference
  const scaleRotation = Math.min(15, Math.max(-15, (weightDiff / 30) * 15));

  return (
    <div className="bg-zinc-950 border border-zinc-900 p-4 md:p-5 mt-4 w-full relative overflow-hidden text-white rounded-none">
      <div className="absolute inset-0 bg-gradient-to-b from-[#cc0000]/5 to-transparent pointer-events-none" />
      
      {/* Component Title & Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Scale className="text-[#cc0000] w-4 h-4 animate-pulse" />
          <h5 className="text-[11px] font-mono font-black uppercase tracking-[0.2em]">
            SIMULADOR TÁTICO DE PESO // COMBATE COMPARATIVO
          </h5>
        </div>
        <Badge variant="outline" className="text-[8px] font-mono border-zinc-800 text-yellow-500 bg-yellow-500/5 px-2">
          FÍSICA REAL DO TATAME
        </Badge>
      </div>

      {/* Main Grid: Fighter Selection & Balance Scale */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center relative z-10">
        
        {/* Left Side: Selected Legend (Lutador A) Controls */}
        <div className="lg:col-span-4 bg-zinc-900/30 p-3.5 border border-zinc-900 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-yellow-500 bg-zinc-950 shrink-0">
              <img 
                src={fighterA.avatar} 
                alt={fighterA.name} 
                className="w-full h-full object-cover grayscale" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[7px] font-mono text-zinc-500 block tracking-wider uppercase">LUTADOR A (ESTE ATLETA)</span>
              <h6 className="font-black uppercase text-[12px] text-yellow-500 truncate leading-tight">{fighterA.name}</h6>
              <span className="text-[8px] font-mono text-zinc-400 block truncate">{fighterA.category}</span>
            </div>
          </div>

          {/* Weight Control A */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-900/60">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-zinc-500 uppercase">Massa Corporal:</span>
              <span className="text-yellow-400 font-black">{weightA.toFixed(1)} kg</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="135" 
              step="0.5"
              value={weightA}
              onChange={(e) => setWeightA(parseFloat(e.target.value))}
              className="w-full accent-[#cc0000] cursor-pointer h-1.5 bg-zinc-950 border border-zinc-900 rounded-none"
            />
            <div className="flex justify-between text-[7px] font-mono text-zinc-600">
              <span>50.0 KG</span>
              <span>135.0 KG</span>
            </div>
          </div>
        </div>

        {/* Center: Interactive Mechanical Balance Scale */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center py-2 relative">
          
          {/* Balance Beam visualization */}
          <div className="w-full max-w-[200px] flex flex-col items-center">
            
            {/* Weight difference indicator badge */}
            <div className="mb-4 text-center">
              <span className="text-[8px] font-mono text-zinc-500 uppercase block tracking-widest">DIFERENÇA DE MASSA</span>
              <div className="text-sm font-mono font-black tracking-tight flex items-center justify-center gap-1">
                <span className={weightDiff > 0 ? "text-yellow-500" : weightDiff < 0 ? "text-red-500" : "text-zinc-400"}>
                  {weightDiff > 0 ? `+${absWeightDiff.toFixed(1)}` : weightDiff < 0 ? `-${absWeightDiff.toFixed(1)}` : '0.0'} kg
                </span>
                <span className="text-xs text-zinc-500 font-normal">
                  {weightDiff > 0 ? `(A mais pesado)` : weightDiff < 0 ? `(B mais pesado)` : '(Parelho)'}
                </span>
              </div>
            </div>

            {/* Simulated scale balance beam */}
            <motion.div 
              className="w-40 h-2 bg-zinc-800 relative flex items-center justify-between border border-zinc-700"
              animate={{ rotate: scaleRotation }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
            >
              {/* Left Pan Attachment */}
              <div className="absolute left-1 -bottom-4 w-4 h-4 border-t-2 border-x-2 border-zinc-600 rounded-b-md flex items-end justify-center bg-zinc-950/80">
                <Dumbbell className="w-2.5 h-2.5 text-yellow-500" />
              </div>
              
              {/* Pivot Point */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#cc0000] border-2 border-zinc-950 z-20 flex items-center justify-center shadow-lg shadow-[#cc0000]/30" />

              {/* Right Pan Attachment */}
              <div className="absolute right-1 -bottom-4 w-4 h-4 border-t-2 border-x-2 border-zinc-600 rounded-b-md flex items-end justify-center bg-zinc-950/80">
                <Dumbbell className="w-2.5 h-2.5 text-zinc-400" />
              </div>
            </motion.div>

            {/* Stand of the Scale */}
            <div className="w-6 h-10 border-x-2 border-b-2 border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 relative mt-1.5">
              <div className="absolute bottom-0 -left-4 -right-4 h-1.5 bg-zinc-800 border border-zinc-700" />
            </div>
          </div>
        </div>

        {/* Right Side: Competitor Selection (Lutador B) Controls */}
        <div className="lg:col-span-4 bg-zinc-900/30 p-3.5 border border-zinc-900 flex flex-col gap-3 relative">
          
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-[7px] font-mono text-zinc-500 tracking-wider uppercase">LUTADOR B (OPONENTE)</span>
              <button 
                onClick={() => setShowOpponentDropdown(!showOpponentDropdown)}
                className="text-[8px] font-mono text-yellow-500 hover:text-white flex items-center gap-0.5 uppercase bg-zinc-950 border border-zinc-900 px-1.5 py-0.5 cursor-pointer"
              >
                Alterar <ChevronDown size={10} />
              </button>
            </div>
            
            <div className="flex items-center gap-3 mt-1">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-700 bg-zinc-950 shrink-0">
                <img 
                  src={fighterB.avatar} 
                  alt={fighterB.name} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h6 className="font-black uppercase text-[12px] text-white truncate leading-tight">{fighterB.name}</h6>
                <span className="text-[8px] font-mono text-zinc-400 block truncate">{fighterB.category}</span>
              </div>
            </div>

            {/* Dynamic Dropdown for Opponent B Selection */}
            <AnimatePresence>
              {showOpponentDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute right-0 top-12 left-0 bg-zinc-950 border border-zinc-800 shadow-2xl z-[80] max-h-48 overflow-y-auto"
                >
                  {legends.map((leg, idx) => {
                    if (idx === selectedLegendIndex) return null;
                    return (
                      <button
                        key={leg.name}
                        onClick={() => {
                          setOpponentIndex(idx);
                          setShowOpponentDropdown(false);
                        }}
                        className="w-full text-left p-2 hover:bg-zinc-900 flex items-center gap-2 border-b border-zinc-900 font-mono transition-colors"
                      >
                        <img 
                          src={leg.avatar} 
                          alt="" 
                          className="w-5 h-5 rounded-full object-cover shrink-0 grayscale"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="text-[9px] font-black uppercase text-white truncate">{leg.name}</p>
                          <p className="text-[7px] text-zinc-500 truncate">{leg.category}</p>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Weight Control B */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-900/60">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-zinc-500 uppercase">Massa Corporal:</span>
              <span className="text-zinc-300 font-black">{weightB.toFixed(1)} kg</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="135" 
              step="0.5"
              value={weightB}
              onChange={(e) => setWeightB(parseFloat(e.target.value))}
              className="w-full accent-zinc-500 cursor-pointer h-1.5 bg-zinc-950 border border-zinc-900 rounded-none"
            />
            <div className="flex justify-between text-[7px] font-mono text-zinc-600">
              <span>50.0 KG</span>
              <span>135.0 KG</span>
            </div>
          </div>
        </div>

      </div>

      {/* Attribute Simulation Breakdown */}
      <div className="mt-5 pt-4 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        
        {/* Dynamic Attributes: Lutador A */}
        <div className="bg-zinc-950 border border-zinc-900 p-3 space-y-2.5">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
            <span className="text-[8px] font-mono font-black uppercase tracking-wider text-yellow-500">// IMPACTOS NO STATUS: LUTADOR A</span>
            <span className="text-[8px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5">{weightA.toFixed(1)}kg</span>
          </div>
          
          <div className="space-y-2 font-mono text-[9px]">
            {/* Pressure */}
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 flex items-center gap-1">
                <Gauge size={12} className="text-zinc-500" /> Pressão de Passagem
              </span>
              <span className={`font-bold ${statsModifications.a.pressure > 0 ? "text-green-500" : statsModifications.a.pressure < 0 ? "text-red-500" : "text-zinc-400"}`}>
                {statsModifications.a.pressure >= 0 ? `+${statsModifications.a.pressure.toFixed(1)}%` : `${statsModifications.a.pressure.toFixed(1)}%`}
              </span>
            </div>
            
            {/* Speed */}
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 flex items-center gap-1">
                <Zap size={12} className="text-zinc-500" /> Velocidade de Transição
              </span>
              <span className={`font-bold ${statsModifications.a.speed > 0 ? "text-green-500" : statsModifications.a.speed < 0 ? "text-red-500" : "text-zinc-400"}`}>
                {statsModifications.a.speed >= 0 ? `+${statsModifications.a.speed.toFixed(1)}%` : `${statsModifications.a.speed.toFixed(1)}%`}
              </span>
            </div>

            {/* Cardio */}
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 flex items-center gap-1">
                <TrendingDown size={12} className="text-zinc-500" /> Vigor / Resistência Aeróbica
              </span>
              <span className={`font-bold ${statsModifications.a.cardio > 0 ? "text-green-500" : statsModifications.a.cardio < 0 ? "text-red-500" : "text-zinc-400"}`}>
                {statsModifications.a.cardio >= 0 ? `+${statsModifications.a.cardio.toFixed(1)}%` : `${statsModifications.a.cardio.toFixed(1)}%`}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Attributes: Lutador B */}
        <div className="bg-zinc-950 border border-zinc-900 p-3 space-y-2.5">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
            <span className="text-[8px] font-mono font-black uppercase tracking-wider text-zinc-400">// IMPACTOS NO STATUS: LUTADOR B</span>
            <span className="text-[8px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5">{weightB.toFixed(1)}kg</span>
          </div>
          
          <div className="space-y-2 font-mono text-[9px]">
            {/* Pressure */}
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 flex items-center gap-1">
                <Gauge size={12} className="text-zinc-500" /> Pressão de Passagem
              </span>
              <span className={`font-bold ${statsModifications.b.pressure > 0 ? "text-green-500" : statsModifications.b.pressure < 0 ? "text-red-500" : "text-zinc-400"}`}>
                {statsModifications.b.pressure >= 0 ? `+${statsModifications.b.pressure.toFixed(1)}%` : `${statsModifications.b.pressure.toFixed(1)}%`}
              </span>
            </div>
            
            {/* Speed */}
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 flex items-center gap-1">
                <Zap size={12} className="text-zinc-500" /> Velocidade de Transição
              </span>
              <span className={`font-bold ${statsModifications.b.speed > 0 ? "text-green-500" : statsModifications.b.speed < 0 ? "text-red-500" : "text-zinc-400"}`}>
                {statsModifications.b.speed >= 0 ? `+${statsModifications.b.speed.toFixed(1)}%` : `${statsModifications.b.speed.toFixed(1)}%`}
              </span>
            </div>

            {/* Cardio */}
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 flex items-center gap-1">
                <TrendingDown size={12} className="text-zinc-500" /> Vigor / Resistência Aeróbica
              </span>
              <span className={`font-bold ${statsModifications.b.cardio > 0 ? "text-green-500" : statsModifications.b.cardio < 0 ? "text-red-500" : "text-zinc-400"}`}>
                {statsModifications.b.cardio >= 0 ? `+${statsModifications.b.cardio.toFixed(1)}%` : `${statsModifications.b.cardio.toFixed(1)}%`}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Strategic / Tactical Intelligence Advisor Box */}
      <div className="mt-4 bg-zinc-900/50 border border-zinc-900 p-4 relative z-10 space-y-3">
        <div className="flex items-start gap-2 border-b border-zinc-950 pb-2">
          <Lightbulb className="w-4.5 h-4.5 text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <h6 className="text-[10px] font-mono font-extrabold uppercase text-yellow-500 tracking-widest leading-none">
              ANÁLISE DE IMPACTO TÁTICO DE COMBATE
            </h6>
            <p className="text-[8px] font-mono text-zinc-500 uppercase mt-1">
              RECOMENDAÇÕES EXCLUSIVAS DE ACORDO COM A DISPARIDADE FÍSICA
            </p>
          </div>
        </div>

        <div className="space-y-3.5">
          {/* General Advantage */}
          <div className="space-y-1">
            <span className="text-[8px] font-mono font-black uppercase text-zinc-400 block tracking-wider">
              [ {tacticalAnalysis.title} ]
            </span>
            <p className="text-[11px] text-zinc-300 leading-relaxed font-light">
              {tacticalAnalysis.advantage}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-zinc-950">
            {/* Strategy for A */}
            <div className="space-y-1">
              <span className="text-[8px] font-mono font-bold text-yellow-500 block uppercase">
                🎯 ESTRATÉGIA RECOMENDADA PARA {fighterA.name.toUpperCase()}
              </span>
              <p className="text-[10px] text-zinc-400 leading-relaxed font-light">
                {tacticalAnalysis.strategyA}
              </p>
            </div>

            {/* Strategy for B */}
            <div className="space-y-1">
              <span className="text-[8px] font-mono font-bold text-zinc-400 block uppercase">
                🛡️ COMPORTAMENTO ESPERADO DE {fighterB.name.toUpperCase()}
              </span>
              <p className="text-[10px] text-zinc-400 leading-relaxed font-light">
                {tacticalAnalysis.strategyB}
              </p>
            </div>
          </div>
        </div>

        {/* Action warning */}
        {absWeightDiff >= 15 && (
          <div className="bg-red-500/5 border border-red-500/20 p-2.5 flex items-center gap-2.5 text-[10px] text-red-400 font-mono">
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
            <span className="uppercase tracking-tighter leading-normal">
              ALERTA TÁTICO: Disparidade corporal crítica (&gt;15kg). Risco severo de fadiga precoce por esmagamento muscular ou contra-ataques cinéticos. Ajuste as pegadas!
            </span>
          </div>
        )}
      </div>

    </div>
  );
};

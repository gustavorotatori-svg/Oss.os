import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  Sparkles, 
  Award, 
  Info, 
  TrendingDown, 
  Search, 
  X, 
  Check, 
  ChevronDown, 
  ArrowRightLeft,
  ThumbsUp,
  ShieldAlert,
  Dumbbell
} from 'lucide-react';
import { Product } from '@/src/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';

interface TacticalComparisonProps {
  productList: Product[];
  onBack?: () => void;
}

interface KimonoSpecs {
  gsm: number;
  weaveType: string;
  material: string;
  weight: string;
  pros: string[];
  description: string;
}

// Map known kimonos to specific technical specifications
const KIMONO_TECHNICAL_SPECS: Record<string, KimonoSpecs> = {
  '1': {
    gsm: 550,
    weaveType: 'Pearl Weave Premium',
    material: '100% Algodão Premium',
    weight: '1.6 kg',
    pros: ['Lapela rígida de napa militar', 'Bordados de altíssima densidade', 'Anti-bacteriana natural'],
    description: 'Um tributo de corte impecável à alfaiataria tradicional japonesa.'
  },
  '5': {
    gsm: 500,
    weaveType: 'Pearl Weave',
    material: '100% Algodão Trançado',
    weight: '1.5 kg',
    pros: ['Costuras reforçadas em fio de alta tração', 'Reforços extras nas axilas e joelhos', 'Ideal para treinos diários intensivos'],
    description: 'Equipamento robusto com arte tradicional japonesa forrada internamente nos ombros.'
  },
  '9': {
    gsm: 550,
    weaveType: 'Pearl Weave Extra',
    material: 'Algodão Pré-encolhido',
    weight: '1.7 kg',
    pros: ['Costuras douradas contrastantes', 'Interior em cetim sublimado com samurai', 'Corte slim de competição'],
    description: 'Corte agressivo ultra premium para competidores de elite.'
  },
  '13': {
    gsm: 420,
    weaveType: 'Trançado Médio',
    material: '100% Algodão Anatômico',
    weight: '1.3 kg',
    pros: ['Modelagem ajustada ao corpo feminino', 'Lapela de EVA anti-bacteriana', 'Leveza com alta durabilidade'],
    description: 'Kimono premium de alta performance focado na anatomia e agilidade feminina.'
  },
  '16': {
    gsm: 350,
    weaveType: 'Trançado Leve',
    material: 'Algodão e Poliéster',
    weight: '0.9 kg',
    pros: ['Ultra leve e confortável', 'Secagem extremamente rápida', 'Facilidade de movimentação para crianças'],
    description: 'Kimono leve e resistente com corte perfeito para os primeiros passos no tatame.'
  },
  '21': {
    gsm: 380,
    weaveType: 'Trançado Standard',
    material: '100% Algodão',
    weight: '1.2 kg',
    pros: ['Melhor custo de entrada', 'Secagem rápida', 'Excelente maleabilidade'],
    description: 'Aprovado por milhares de alunos iniciantes como a melhor escolha de entrada.'
  },
  '22': {
    gsm: 450,
    weaveType: 'Challenger Pearl Weave',
    material: 'Algodão Premium com calça de sarja',
    weight: '1.4 kg',
    pros: ['Calça de algodão premium resistente', 'Excelente equilíbrio peso/resistência', 'Corte clássico confortável'],
    description: 'Equipamento durável para praticantes intermediários que exigem performance constante.'
  },
  '23': {
    gsm: 590,
    weaveType: 'Trançado Pesado Carioca',
    material: '100% Algodão Pré-encolhido',
    weight: '1.9 kg',
    pros: ['Resistência lendária', 'Lapela rígida de 10oz dificulta a pegada', 'Aprovado para campeonatos internacionais'],
    description: 'O clássico mundial do Jiu-Jitsu. Praticamente indestrutível, ideal para atletas pesados.'
  },
  '25': {
    gsm: 350,
    weaveType: 'Trançado Standard Decathlon',
    material: 'Poliéster e Algodão',
    weight: '1.1 kg',
    pros: ['Preço extremamente acessível', 'Super leve e fácil de lavar', 'Ideal como kimono reserva'],
    description: 'Confortável e acessível, supre perfeitamente as necessidades do primeiro dia de treino.'
  },
  '28': {
    gsm: 350,
    weaveType: 'Trançado Light',
    material: '100% Algodão Ultra Leve',
    weight: '1.1 kg',
    pros: ['Ideal para treinar no verão', 'Secagem ultra rápida', 'Excelente para viagens (pouco espaço)'],
    description: 'Kimono ultra leve desenvolvido para treinos em dias quentes e para atletas que viajam muito.'
  },
  '34': {
    gsm: 450,
    weaveType: 'Pearl Weave',
    material: 'Algodão Trançado de alta resistência',
    weight: '1.5 kg',
    pros: ['Edição temática exclusiva de graduação', 'Calça de ripstop ultra-resistente', 'Bordados de alta definição'],
    description: 'Visual clássico e imponente com detalhes internos na cor roxa.'
  },
  '35': {
    gsm: 550,
    weaveType: 'Trançado Pesado Imperial',
    material: 'Algodão Premium com interior de cetim',
    weight: '1.8 kg',
    pros: ['Forro interno de cetim de luxo sublimado', 'Costuras douradas de alta tração', 'Lapela extra rígida de alta durabilidade'],
    description: 'O kimono definitivo para faixas pretas. Um tributo ao ápice da jornada esportiva.'
  }
};

// Fallback generator for products without predefined specs
const generateFallbackSpecs = (prod: Product): KimonoSpecs => {
  const gsmValue = prod.price > 600 ? 550 : prod.price > 400 ? 450 : 350;
  return {
    gsm: gsmValue,
    weaveType: prod.description.includes('Pearl') || prod.description.includes('pearl') ? 'Pearl Weave' : 'Trançado Standard',
    material: '100% Algodão Premium',
    weight: gsmValue > 500 ? '1.7 kg' : gsmValue > 400 ? '1.4 kg' : '1.1 kg',
    pros: ['Corte clássico e confortável', 'Alta resistência e costuras duplas', 'Ideal para treinos diários'],
    description: prod.description || 'Equipamento de alta qualidade para praticantes de Jiu-Jitsu.'
  };
};

export const TacticalComparison: React.FC<TacticalComparisonProps> = ({ productList, onBack }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'pt';

  // Multilingual dictionary
  const dict: Record<string, Record<string, string>> = {
    en: {
      title: "Tactical Gi Comparison",
      subtitle: "Analyze and compare two combat kimonos side-by-side to choose your next armor.",
      select_placeholder: "Select a Kimono...",
      change_gi: "Change Gi",
      gsm_label: "GSM (Density)",
      weave_label: "Weave Type",
      material_label: "Material",
      weight_label: "Average Weight",
      price_label: "Investment",
      pros_label: "Tactical Highlights",
      cost_benefit_label: "Cost-Benefit Ratio",
      score_rating: "Tactical Rating",
      best_badge: "TACTICAL GOLD CHOICE",
      cost_benefit_badge: "BEST VALUE FOR MONEY",
      analysis_title: "Tactical Analysis of the Duel",
      winner_text: "The {winner} represents a superior tactical match because of its combination of {feature} and lower financial investment relative to density.",
      reason_density: "higher fabric density ({gsm} GSM)",
      reason_price: "accessible investment (R$ {price})",
      vs: "VS",
      select_two: "Please select two Kimonos to begin the tactical analysis.",
      not_enough_data: "Select the second opponent to start side-by-side specs comparison.",
      compare_now: "Compare Specs",
      back: "Back",
      compare_another: "Compare Another",
      features: "Features",
      gi_details: "Technical Details",
      pros_list: "Key Advantages",
      cost_benefit_description: "Calculated based on density per dollar (GSM/Price) modified by practitioner level."
    },
    es: {
      title: "Comparación Táctica de Kimonos",
      subtitle: "Analiza y compara dos kimonos de combate lado a lado para elegir tu próxima armadura.",
      select_placeholder: "Selecciona un Kimono...",
      change_gi: "Cambiar Kimono",
      gsm_label: "GSM (Densidad)",
      weave_label: "Tipo de Trama",
      material_label: "Material",
      weight_label: "Peso Promedio",
      price_label: "Inversión",
      pros_label: "Puntos Destacados",
      cost_benefit_label: "Costo-Beneficio",
      score_rating: "Calificación Táctica",
      best_badge: "ELECCIÓN DE ORO TÁCTICA",
      cost_benefit_badge: "MEJOR RELACIÓN COSTO-BENEFICIO",
      analysis_title: "Análisis Táctico del Duelo",
      winner_text: "El {winner} representa una combinación táctica superior debido a su mezcla de {feature} y menor costo relativo a la densidad de tela.",
      reason_density: "mayor densidad de tela ({gsm} GSM)",
      reason_price: "inversión accesible (R$ {price})",
      vs: "VS",
      select_two: "Por favor, selecciona dos Kimonos para iniciar el análisis táctico.",
      not_enough_data: "Selecciona el segundo oponente para iniciar la comparación de especificaciones.",
      compare_now: "Comparar Especificaciones",
      back: "Volver",
      compare_another: "Comparar Otro",
      features: "Características",
      gi_details: "Detalles Técnicos",
      pros_list: "Ventajas Clave",
      cost_benefit_description: "Calculado en base a la densidad por precio (GSM/Precio) modificado por el nivel del practicante."
    },
    pt: {
      title: "Comparação Tática de Kimonos",
      subtitle: "Analise e compare dois kimonos de combate lado a lado para escolher sua próxima armadura.",
      select_placeholder: "Selecione um Kimono...",
      change_gi: "Mudar Kimono",
      gsm_label: "GSM (Gramatura)",
      weave_label: "Tipo de Trama",
      material_label: "Material",
      weight_label: "Peso Médio",
      price_label: "Investimento",
      pros_label: "Destaques Táticos",
      cost_benefit_label: "Custo-Benefício",
      score_rating: "Avaliação Tática",
      best_badge: "ESCOLHA DE OURO TÁTICA",
      cost_benefit_badge: "MELHOR CUSTO-BENEFÍCIO",
      analysis_title: "Análise Tática do Duelo",
      winner_text: "O {winner} representa uma combinação tática superior devido ao seu equilíbrio de {feature} e menor investimento financeiro em relação à densidade.",
      reason_density: "maior gramatura de tecido ({gsm} GSM)",
      reason_price: "investimento acessível (R$ {price})",
      vs: "VS",
      select_two: "Selecione dois Kimonos para iniciar o cruzamento tático de dados.",
      not_enough_data: "Selecione o segundo oponente para iniciar o comparativo técnico lado a lado.",
      compare_now: "Comparar Dados",
      back: "Voltar",
      compare_another: "Comparar Outro",
      features: "Características",
      gi_details: "Ficha Técnica",
      pros_list: "Vantagens Principais",
      cost_benefit_description: "Calculado cientificamente com base na densidade de tecido por real (GSM/Preço) ajustado pela avaliação geral."
    }
  };

  const t = dict[lang] || dict['pt'];

  // Filter kimonos only
  const kimonos = useMemo(() => {
    return productList.filter(p => p.category === 'Kimonos');
  }, [productList]);

  // Selected Kimonos State
  const [selectedIdA, setSelectedIdA] = useState<string>('');
  const [selectedIdB, setSelectedIdB] = useState<string>('');

  // Dropdown states
  const [showSelectorA, setShowSelectorA] = useState(false);
  const [showSelectorB, setShowSelectorB] = useState(false);

  // Retrieve products
  const productA = useMemo(() => kimonos.find(k => k.id === selectedIdA) || null, [selectedIdA, kimonos]);
  const productB = useMemo(() => kimonos.find(k => k.id === selectedIdB) || null, [selectedIdB, kimonos]);

  // Specs
  const specsA = useMemo(() => {
    if (!productA) return null;
    return KIMONO_TECHNICAL_SPECS[productA.id] || generateFallbackSpecs(productA);
  }, [productA]);

  const specsB = useMemo(() => {
    if (!productB) return null;
    return KIMONO_TECHNICAL_SPECS[productB.id] || generateFallbackSpecs(productB);
  }, [productB]);

  // Automatically select the first two kimonos if none are selected to give user instant feedback
  useState(() => {
    if (kimonos.length >= 2) {
      setSelectedIdA(kimonos[0].id);
      setSelectedIdB(kimonos[1].id);
    }
  });

  // Calculate Cost-benefit Index (higher score = better value)
  // Formula: (GSM / Price) * (Rating * 15)
  const costBenefitA = useMemo(() => {
    if (!productA || !specsA) return 0;
    const rating = productA.rating || 4.5;
    return Number(((specsA.gsm / productA.price) * (rating * 15)).toFixed(1));
  }, [productA, specsA]);

  const costBenefitB = useMemo(() => {
    if (!productB || !specsB) return 0;
    const rating = productB.rating || 4.5;
    return Number(((specsB.gsm / productB.price) * (rating * 15)).toFixed(1));
  }, [productB, specsB]);

  // Determine winner for cost-benefit
  const betterValue = useMemo(() => {
    if (!productA || !productB) return null;
    return costBenefitA >= costBenefitB ? 'A' : 'B';
  }, [costBenefitA, costBenefitB, productA, productB]);

  // Human description of why it won
  const tacticalVerdict = useMemo(() => {
    if (!productA || !productB || !specsA || !specsB) return '';
    const isAWinner = betterValue === 'A';
    const winnerProduct = isAWinner ? productA : productB;
    const loserProduct = isAWinner ? productB : productA;
    const winnerSpecs = isAWinner ? specsA : specsB;
    const loserSpecs = isAWinner ? specsB : specsA;

    const gsmDiff = winnerSpecs.gsm - loserSpecs.gsm;
    const priceDiff = loserProduct.price - winnerProduct.price;

    let reason = '';
    if (gsmDiff > 0 && priceDiff > 0) {
      reason = t.reason_density.replace('{gsm}', String(winnerSpecs.gsm)) + ' e ' + t.reason_price.replace('{price}', winnerProduct.price.toFixed(2));
    } else if (gsmDiff > 0) {
      reason = t.reason_density.replace('{gsm}', String(winnerSpecs.gsm));
    } else {
      reason = t.reason_price.replace('{price}', winnerProduct.price.toFixed(2));
    }

    return t.winner_text
      .replace('{winner}', winnerProduct.title)
      .replace('{feature}', reason);
  }, [betterValue, productA, productB, specsA, specsB, t]);

  const handleSelectProduct = (side: 'A' | 'B', id: string) => {
    if (side === 'A') {
      // Prevent selecting the same on both sides
      if (id === selectedIdB) {
        setSelectedIdB(selectedIdA);
      }
      setSelectedIdA(id);
      setShowSelectorA(false);
    } else {
      if (id === selectedIdA) {
        setSelectedIdA(selectedIdB);
      }
      setSelectedIdB(id);
      setShowSelectorB(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header section with back button if provided */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-widest text-zinc-400">
            <Scale size={12} className="text-zinc-400" />
            <span>Ferramentas de Análise</span>
            <span>/</span>
            <span className="text-red-600 dark:text-red-400">Comparação Tática</span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-black dark:text-white font-headline flex items-center gap-2">
            <ArrowRightLeft className="text-red-600 dark:text-red-400" size={28} />
            {t.title}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
            {t.subtitle}
          </p>
        </div>
        {onBack && (
          <Button 
            onClick={onBack}
            variant="outline"
            className="rounded-none border-zinc-200 dark:border-zinc-800 font-black uppercase tracking-widest text-xs py-5 px-6 shrink-0"
          >
            {t.back}
          </Button>
        )}
      </div>

      {/* Selectors and Main Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Opponent Selector Cards */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Kimono A Selector Card */}
          <div className="border border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 p-6 relative">
            <div className="absolute top-4 left-4 z-10">
              <Badge className="bg-red-600 text-white rounded-none border-none text-[9px] uppercase font-mono tracking-wider font-black py-1 px-2.5">
                LUTADOR A
              </Badge>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 items-center pt-4">
              {productA ? (
                <>
                  <div className="w-28 h-28 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shrink-0 overflow-hidden relative">
                    <img src={productA.imageUrl} alt={productA.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-3">
                    <div>
                      <p className="text-[9px] font-mono font-black text-zinc-400 uppercase tracking-widest">{productA.brand || 'BJJ'}</p>
                      <h4 className="font-black text-lg text-black dark:text-white uppercase tracking-tight leading-tight line-clamp-1">{productA.title}</h4>
                      <p className="font-black text-lg text-red-600 dark:text-red-400 mt-1">R$ {productA.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <Button 
                      onClick={() => setShowSelectorA(!showSelectorA)}
                      size="sm"
                      variant="outline"
                      className="rounded-none border-zinc-300 dark:border-zinc-800 font-black uppercase text-[9px] tracking-widest py-3 px-4 bg-white dark:bg-zinc-900"
                    >
                      {t.change_gi} <ChevronDown size={10} className="ml-1" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="w-full py-6 text-center space-y-4">
                  <Dumbbell className="mx-auto text-zinc-300 animate-bounce" size={32} />
                  <Button 
                    onClick={() => setShowSelectorA(true)}
                    className="rounded-none bg-black text-white hover:bg-zinc-800 font-black uppercase text-xs"
                  >
                    {t.select_placeholder}
                  </Button>
                </div>
              )}
            </div>

            {/* Selector Dropdown A */}
            <AnimatePresence>
              {showSelectorA && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 z-40 max-h-72 overflow-y-auto shadow-xl"
                >
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                    <span className="text-[9px] font-mono font-black uppercase text-zinc-400">SELECIONAR KIMONO</span>
                    <button onClick={() => setShowSelectorA(false)} className="text-zinc-400 hover:text-black dark:hover:text-white">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {kimonos.map(k => (
                      <button
                        key={k.id}
                        onClick={() => handleSelectProduct('A', k.id)}
                        className={`w-full text-left p-3 flex items-center gap-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${selectedIdA === k.id ? 'bg-red-50/20 dark:bg-red-950/10' : ''}`}
                      >
                        <img src={k.imageUrl} alt={k.title} className="w-8 h-8 object-cover border border-zinc-100 dark:border-zinc-800 shrink-0" referrerPolicy="no-referrer" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black uppercase text-black dark:text-white truncate">{k.title}</p>
                          <p className="text-[9px] font-bold text-zinc-400 uppercase">{k.brand || 'BJJ CORE'}</p>
                        </div>
                        <p className="text-xs font-black text-red-600 dark:text-red-400 shrink-0">R$ {k.price.toFixed(2)}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Kimono B Selector Card */}
          <div className="border border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 p-6 relative">
            <div className="absolute top-4 left-4 z-10">
              <Badge className="bg-zinc-800 dark:bg-zinc-100 text-white dark:text-black rounded-none border-none text-[9px] uppercase font-mono tracking-wider font-black py-1 px-2.5">
                LUTADOR B
              </Badge>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 items-center pt-4">
              {productB ? (
                <>
                  <div className="w-28 h-28 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shrink-0 overflow-hidden relative">
                    <img src={productB.imageUrl} alt={productB.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-3">
                    <div>
                      <p className="text-[9px] font-mono font-black text-zinc-400 uppercase tracking-widest">{productB.brand || 'BJJ'}</p>
                      <h4 className="font-black text-lg text-black dark:text-white uppercase tracking-tight leading-tight line-clamp-1">{productB.title}</h4>
                      <p className="font-black text-lg text-zinc-800 dark:text-zinc-200 mt-1">R$ {productB.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <Button 
                      onClick={() => setShowSelectorB(!showSelectorB)}
                      size="sm"
                      variant="outline"
                      className="rounded-none border-zinc-300 dark:border-zinc-800 font-black uppercase text-[9px] tracking-widest py-3 px-4 bg-white dark:bg-zinc-900"
                    >
                      {t.change_gi} <ChevronDown size={10} className="ml-1" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="w-full py-6 text-center space-y-4">
                  <Dumbbell className="mx-auto text-zinc-300 animate-bounce" size={32} />
                  <Button 
                    onClick={() => setShowSelectorB(true)}
                    className="rounded-none bg-black text-white hover:bg-zinc-800 font-black uppercase text-xs"
                  >
                    {t.select_placeholder}
                  </Button>
                </div>
              )}
            </div>

            {/* Selector Dropdown B */}
            <AnimatePresence>
              {showSelectorB && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 z-40 max-h-72 overflow-y-auto shadow-xl"
                >
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                    <span className="text-[9px] font-mono font-black uppercase text-zinc-400">SELECIONAR KIMONO</span>
                    <button onClick={() => setShowSelectorB(false)} className="text-zinc-400 hover:text-black dark:hover:text-white">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {kimonos.map(k => (
                      <button
                        key={k.id}
                        onClick={() => handleSelectProduct('B', k.id)}
                        className={`w-full text-left p-3 flex items-center gap-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${selectedIdB === k.id ? 'bg-zinc-100 dark:bg-zinc-800/50' : ''}`}
                      >
                        <img src={k.imageUrl} alt={k.title} className="w-8 h-8 object-cover border border-zinc-100 dark:border-zinc-800 shrink-0" referrerPolicy="no-referrer" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black uppercase text-black dark:text-white truncate">{k.title}</p>
                          <p className="text-[9px] font-bold text-zinc-400 uppercase">{k.brand || 'BJJ CORE'}</p>
                        </div>
                        <p className="text-xs font-black text-red-600 dark:text-red-400 shrink-0">R$ {k.price.toFixed(2)}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Comparison Details Side-by-Side Table */}
        {productA && productB && specsA && specsB ? (
          <div className="lg:col-span-12 space-y-8">
            
            {/* Tactical Verdict Spotlight Banner */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border-2 border-green-600 bg-green-50/30 dark:bg-green-950/10 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden"
            >
              <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
                <Award size={180} className="text-green-600" />
              </div>

              <div className="bg-green-600 text-white p-3 md:p-4 rounded-none shrink-0 shadow-lg">
                <Award size={28} />
              </div>

              <div className="space-y-3 text-center md:text-left flex-1">
                <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                  <Badge className="bg-green-600 text-white rounded-none border-none py-1 px-3 text-[9px] uppercase font-black tracking-widest">
                    {t.cost_benefit_badge}
                  </Badge>
                  <span className="text-[10px] font-mono text-green-700 dark:text-green-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={11} className="animate-pulse" /> RECOMENDAÇÃO TÁTICA OSS.OS
                  </span>
                </div>
                <h3 className="font-black text-xl text-black dark:text-white uppercase tracking-tight">
                  {betterValue === 'A' ? productA.title : productB.title}
                </h3>
                <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-4xl">
                  {tacticalVerdict}
                </p>
              </div>
            </motion.div>

            {/* Comparison Specification Matrix */}
            <div className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="w-1/3 px-4 md:px-6 py-4 text-xs font-black uppercase tracking-wider text-zinc-400 font-mono">
                      {t.gi_details}
                    </th>
                    <th className={`w-1/3 px-4 md:px-6 py-4 text-center transition-all ${betterValue === 'A' ? 'bg-green-50/20 dark:bg-green-950/5' : ''}`}>
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-black text-red-600 dark:text-red-400 uppercase tracking-widest">LUTADOR A</span>
                        <h5 className="font-black text-xs md:text-sm text-black dark:text-white uppercase truncate">{productA.title}</h5>
                      </div>
                    </th>
                    <th className={`w-1/3 px-4 md:px-6 py-4 text-center transition-all ${betterValue === 'B' ? 'bg-green-50/20 dark:bg-green-950/5' : ''}`}>
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-black text-zinc-500 uppercase tracking-widest">LUTADOR B</span>
                        <h5 className="font-black text-xs md:text-sm text-black dark:text-white uppercase truncate">{productB.title}</h5>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-xs md:text-sm">
                  
                  {/* Brand Row */}
                  <tr className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-bold text-zinc-400 uppercase tracking-tight font-mono text-[10px] md:text-xs">Marca</td>
                    <td className={`px-4 md:px-6 py-4 text-center font-black text-black dark:text-white uppercase ${betterValue === 'A' ? 'bg-green-50/10 dark:bg-green-950/2' : ''}`}>
                      {productA.brand || 'BJJ'}
                    </td>
                    <td className={`px-4 md:px-6 py-4 text-center font-black text-black dark:text-white uppercase ${betterValue === 'B' ? 'bg-green-50/10 dark:bg-green-950/2' : ''}`}>
                      {productB.brand || 'BJJ'}
                    </td>
                  </tr>

                  {/* GSM Row */}
                  <tr className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-bold text-zinc-400 uppercase tracking-tight font-mono text-[10px] md:text-xs">
                      {t.gsm_label}
                    </td>
                    <td className={`px-4 md:px-6 py-4 text-center ${betterValue === 'A' ? 'bg-green-50/10 dark:bg-green-950/2' : ''}`}>
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-black text-black dark:text-white text-base">{specsA.gsm} <span className="text-xs font-light text-zinc-400 font-sans">g/m²</span></span>
                        {specsA.gsm >= specsB.gsm && (
                          <Badge className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-none border-none text-[8px] font-black uppercase tracking-wider py-0.5 px-1.5">
                            MAIS DENSO
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className={`px-4 md:px-6 py-4 text-center ${betterValue === 'B' ? 'bg-green-50/10 dark:bg-green-950/2' : ''}`}>
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-black text-black dark:text-white text-base">{specsB.gsm} <span className="text-xs font-light text-zinc-400 font-sans">g/m²</span></span>
                        {specsB.gsm >= specsA.gsm && (
                          <Badge className="bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-none border-none text-[8px] font-black uppercase tracking-wider py-0.5 px-1.5">
                            MAIS DENSO
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Weave Row */}
                  <tr className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-bold text-zinc-400 uppercase tracking-tight font-mono text-[10px] md:text-xs">
                      {t.weave_label}
                    </td>
                    <td className={`px-4 md:px-6 py-4 text-center text-zinc-700 dark:text-zinc-300 font-semibold ${betterValue === 'A' ? 'bg-green-50/10 dark:bg-green-950/2' : ''}`}>
                      {specsA.weaveType}
                    </td>
                    <td className={`px-4 md:px-6 py-4 text-center text-zinc-700 dark:text-zinc-300 font-semibold ${betterValue === 'B' ? 'bg-green-50/10 dark:bg-green-950/2' : ''}`}>
                      {specsB.weaveType}
                    </td>
                  </tr>

                  {/* Material Row */}
                  <tr className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-bold text-zinc-400 uppercase tracking-tight font-mono text-[10px] md:text-xs">
                      {t.material_label}
                    </td>
                    <td className={`px-4 md:px-6 py-4 text-center text-zinc-700 dark:text-zinc-300 text-xs ${betterValue === 'A' ? 'bg-green-50/10 dark:bg-green-950/2' : ''}`}>
                      {specsA.material}
                    </td>
                    <td className={`px-4 md:px-6 py-4 text-center text-zinc-700 dark:text-zinc-300 text-xs ${betterValue === 'B' ? 'bg-green-50/10 dark:bg-green-950/2' : ''}`}>
                      {specsB.material}
                    </td>
                  </tr>

                  {/* Weight Row */}
                  <tr className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-bold text-zinc-400 uppercase tracking-tight font-mono text-[10px] md:text-xs">
                      {t.weight_label}
                    </td>
                    <td className={`px-4 md:px-6 py-4 text-center text-zinc-700 dark:text-zinc-300 font-semibold ${betterValue === 'A' ? 'bg-green-50/10 dark:bg-green-950/2' : ''}`}>
                      {specsA.weight}
                    </td>
                    <td className={`px-4 md:px-6 py-4 text-center text-zinc-700 dark:text-zinc-300 font-semibold ${betterValue === 'B' ? 'bg-green-50/10 dark:bg-green-950/2' : ''}`}>
                      {specsB.weight}
                    </td>
                  </tr>

                  {/* Price Row */}
                  <tr className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-bold text-zinc-400 uppercase tracking-tight font-mono text-[10px] md:text-xs">
                      {t.price_label}
                    </td>
                    <td className={`px-4 md:px-6 py-4 text-center ${betterValue === 'A' ? 'bg-green-50/10 dark:bg-green-950/2' : ''}`}>
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-black text-red-600 dark:text-red-400 text-lg">R$ {productA.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        {productA.price <= productB.price && (
                          <Badge className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-none border-none text-[8px] font-black uppercase tracking-wider py-0.5 px-1.5 flex items-center gap-0.5">
                            <TrendingDown size={8} /> MAIS ECONÔMICO
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className={`px-4 md:px-6 py-4 text-center ${betterValue === 'B' ? 'bg-green-50/10 dark:bg-green-950/2' : ''}`}>
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-black text-zinc-900 dark:text-zinc-100 text-lg">R$ {productB.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        {productB.price <= productA.price && (
                          <Badge className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-none border-none text-[8px] font-black uppercase tracking-wider py-0.5 px-1.5 flex items-center gap-0.5">
                            <TrendingDown size={8} /> MAIS ECONÔMICO
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Highlights / Pros Row */}
                  <tr className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-bold text-zinc-400 uppercase tracking-tight font-mono text-[10px] md:text-xs">
                      {t.pros_label}
                    </td>
                    <td className={`px-4 md:px-6 py-4 ${betterValue === 'A' ? 'bg-green-50/10 dark:bg-green-950/2' : ''}`}>
                      <ul className="space-y-2 max-w-xs mx-auto">
                        {specsA.pros.map((pro, index) => (
                          <li key={index} className="flex items-start gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 leading-tight">
                            <Check size={12} className="text-green-600 shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className={`px-4 md:px-6 py-4 ${betterValue === 'B' ? 'bg-green-50/10 dark:bg-green-950/2' : ''}`}>
                      <ul className="space-y-2 max-w-xs mx-auto">
                        {specsB.pros.map((pro, index) => (
                          <li key={index} className="flex items-start gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 leading-tight">
                            <Check size={12} className="text-green-600 shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>

                  {/* Rating Row */}
                  <tr className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-bold text-zinc-400 uppercase tracking-tight font-mono text-[10px] md:text-xs">
                      {t.score_rating}
                    </td>
                    <td className={`px-4 md:px-6 py-4 text-center ${betterValue === 'A' ? 'bg-green-50/10 dark:bg-green-950/2' : ''}`}>
                      <span className="font-black text-black dark:text-white text-base">★ {productA.rating || '4.8'}</span>
                    </td>
                    <td className={`px-4 md:px-6 py-4 text-center ${betterValue === 'B' ? 'bg-green-50/10 dark:bg-green-950/2' : ''}`}>
                      <span className="font-black text-black dark:text-white text-base">★ {productB.rating || '4.8'}</span>
                    </td>
                  </tr>

                  {/* Cost Benefit Row */}
                  <tr className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-bold text-zinc-400 uppercase tracking-tight font-mono text-[10px] md:text-xs flex items-center gap-1.5">
                      {t.cost_benefit_label}
                    </td>
                    <td className={`px-4 md:px-6 py-4 text-center transition-all ${betterValue === 'A' ? 'bg-green-50/20 dark:bg-green-950/5 border-2 border-green-600' : ''}`}>
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-xl font-black ${betterValue === 'A' ? 'text-green-600' : 'text-zinc-500'}`}>{costBenefitA}</span>
                        {betterValue === 'A' ? (
                          <Badge className="bg-green-600 text-white rounded-none border-none text-[8px] font-black uppercase tracking-wider py-1 px-2.5">
                            {t.cost_benefit_badge}
                          </Badge>
                        ) : (
                          <span className="text-[9px] uppercase font-bold text-zinc-400">Eficiência Normal</span>
                        )}
                      </div>
                    </td>
                    <td className={`px-4 md:px-6 py-4 text-center transition-all ${betterValue === 'B' ? 'bg-green-50/20 dark:bg-green-950/5 border-2 border-green-600' : ''}`}>
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-xl font-black ${betterValue === 'B' ? 'text-green-600' : 'text-zinc-500'}`}>{costBenefitB}</span>
                        {betterValue === 'B' ? (
                          <Badge className="bg-green-600 text-white rounded-none border-none text-[8px] font-black uppercase tracking-wider py-1 px-2.5">
                            {t.cost_benefit_badge}
                          </Badge>
                        ) : (
                          <span className="text-[9px] uppercase font-bold text-zinc-400">Eficiência Normal</span>
                        )}
                      </div>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>

            {/* Explanation on Cost-Benefit Index */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 flex items-start gap-3">
              <Info size={16} className="text-zinc-400 shrink-0 mt-0.5" />
              <p className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">
                {t.cost_benefit_description}
              </p>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-12 text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800">
            <ShieldAlert className="mx-auto mb-3 text-zinc-300" size={32} />
            <p className="text-sm text-zinc-500 italic font-medium">{t.select_two}</p>
          </div>
        )}

      </div>
    </div>
  );
};

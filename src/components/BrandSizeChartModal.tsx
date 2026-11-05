import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Ruler, 
  Scale, 
  Sparkles, 
  Check, 
  X, 
  AlertTriangle, 
  Info, 
  ChevronRight, 
  ShieldCheck, 
  RotateCcw, 
  Printer, 
  Copy, 
  CheckCheck,
  HelpCircle,
  Flame,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  BrandSizeChart, 
  SizeRowData, 
  getBrandSizeChart, 
  AVAILABLE_BRAND_CHARTS 
} from '../data/brandSizeCharts';

interface BrandSizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand?: string;
  productTitle?: string;
  category?: string;
  gender?: string;
  availableSizes?: string[];
  onSelectSize?: (size: string) => void;
}

export function BrandSizeChartModal({
  isOpen,
  onClose,
  brand,
  productTitle,
  category = 'Kimonos',
  gender = 'Masculino',
  availableSizes,
  onSelectSize
}: BrandSizeChartModalProps) {
  // Brand selection state (initializes with product's brand)
  const initialChart = useMemo(() => getBrandSizeChart(brand), [brand]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>(initialChart.id);

  // Sync when brand prop changes
  useEffect(() => {
    const chart = getBrandSizeChart(brand);
    setSelectedBrandId(chart.id);
  }, [brand]);

  // Current active brand chart
  const currentBrandChart: BrandSizeChart = useMemo(() => {
    return AVAILABLE_BRAND_CHARTS.find(b => b.id === selectedBrandId) || initialChart;
  }, [selectedBrandId, initialChart]);

  // Gender tab state ('masculino' | 'feminino' | 'infantil')
  const [activeGenderTab, setActiveGenderTab] = useState<'masculino' | 'feminino' | 'infantil'>('masculino');

  // Initialize gender tab from product gender prop
  useEffect(() => {
    if (gender) {
      const gLower = gender.toLowerCase();
      if (gLower.includes('fem') || gLower.includes('mulher')) {
        setActiveGenderTab('feminino');
      } else if (gLower.includes('infant') || gLower.includes('kids') || gLower.includes('criança')) {
        setActiveGenderTab('infantil');
      } else {
        setActiveGenderTab('masculino');
      }
    }
  }, [gender, isOpen]);

  // Unit system: metric (cm/kg) vs imperial (in/lbs)
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  // Interactive Size Finder state
  const [heightInput, setHeightInput] = useState<string>('');
  const [weightInput, setWeightInput] = useState<string>('');
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);
  const [selectedSizeRow, setSelectedSizeRow] = useState<string | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Get active rows based on gender tab
  const activeTableRows: SizeRowData[] = useMemo(() => {
    if (activeGenderTab === 'feminino' && currentBrandChart.tables.feminino?.length) {
      return currentBrandChart.tables.feminino;
    }
    if (activeGenderTab === 'infantil' && currentBrandChart.tables.infantil?.length) {
      return currentBrandChart.tables.infantil;
    }
    return currentBrandChart.tables.masculino || [];
  }, [currentBrandChart, activeGenderTab]);

  // Calculate recommendation based on user input
  useEffect(() => {
    const h = parseFloat(heightInput);
    const w = parseFloat(weightInput);

    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0 || activeTableRows.length === 0) {
      setRecommendedSize(null);
      return;
    }

    const normH = unitSystem === 'imperial' ? h * 2.54 : h;
    const normW = unitSystem === 'imperial' ? w * 0.453592 : w;

    let bestMatch: SizeRowData | null = null;
    let minDiffScore = Infinity;

    for (const row of activeTableRows) {
      const isHeightIn = normH >= row.minHeight && normH <= row.maxHeight;
      const isWeightIn = normW >= row.minWeight && normW <= row.maxWeight;

      if (isHeightIn && isWeightIn) {
        bestMatch = row;
        break;
      }

      const midH = (row.minHeight + row.maxHeight) / 2;
      const midW = (row.minWeight + row.maxWeight) / 2;
      const score = Math.abs(normH - midH) / 10 + Math.abs(normW - midW) / 5;

      if (score < minDiffScore) {
        minDiffScore = score;
        bestMatch = row;
      }
    }

    if (bestMatch) {
      setRecommendedSize(bestMatch.size);
    } else {
      setRecommendedSize(null);
    }
  }, [heightInput, weightInput, unitSystem, activeTableRows]);

  // Formatting helpers
  const formatHeight = (minCm: number, maxCm: number) => {
    if (unitSystem === 'imperial') {
      const minIn = Math.round(minCm / 2.54);
      const maxIn = Math.round(maxCm / 2.54);
      const toFtIn = (totIn: number) => `${Math.floor(totIn / 12)}'${totIn % 12}"`;
      return `${toFtIn(minIn)} - ${toFtIn(maxIn)}`;
    }
    return `${(minCm / 100).toFixed(2)}m a ${(maxCm / 100).toFixed(2)}m`;
  };

  const formatWeight = (minKg: number, maxKg: number) => {
    if (unitSystem === 'imperial') {
      const minLb = Math.round(minKg * 2.20462);
      const maxLb = Math.round(maxKg * 2.20462);
      return `${minLb} - ${maxLb} lbs`;
    }
    return `${minKg} a ${maxKg} kg`;
  };

  const formatCm = (cmVal?: number) => {
    if (!cmVal) return '-';
    if (unitSystem === 'imperial') {
      const inches = (cmVal / 2.54).toFixed(1);
      return `${inches}"`;
    }
    return `${cmVal} cm`;
  };

  const handleCopyChartSummary = () => {
    const summary = `🥋 Tabela de Medidas Oficial: ${currentBrandChart.name}\n` +
      `Corte: ${currentBrandChart.cutStyle}\n` +
      `Taxa de Encolhimento: ${currentBrandChart.shrinkageRate}\n` +
      `Grade (${activeGenderTab.toUpperCase()}):\n` +
      activeTableRows.map(r => `• ${r.size}: Altura ${r.minHeight}-${r.maxHeight}cm | Peso ${r.minWeight}-${r.maxWeight}kg | Envergadura ${r.wingspan}cm`).join('\n') +
      `\nConsulte no Diário dos Oss.os: ${window.location.href}`;

    navigator.clipboard?.writeText(summary);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
        id="brand-size-chart-modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 w-full max-w-4xl shadow-2xl relative font-sans overflow-hidden my-4 flex flex-col max-h-[92vh]"
          id="brand-size-chart-modal-content"
          role="dialog"
          aria-modal="true"
          aria-labelledby="size-chart-title"
        >
          {/* Top Brand Banner Header */}
          <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 relative shrink-0">
            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-colors cursor-pointer bg-white dark:bg-zinc-900 rounded-none z-10"
              title="Fechar tabela de medidas (Esc)"
              id="close-brand-size-chart-modal-btn"
            >
              <X size={16} />
            </button>

            <div className="pr-12 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-600 text-white font-mono font-black text-[9px] uppercase tracking-widest shadow-xs">
                  <Ruler size={11} className="stroke-[3]" />
                  Tabela Oficial de Medidas
                </span>
                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase px-2 py-0.5 border border-zinc-200 dark:border-zinc-800">
                  {currentBrandChart.originCountry}
                </span>
                {currentBrandChart.ibjjfApproved && (
                  <span className="inline-flex items-center gap-1 text-[8.5px] font-mono font-bold text-green-700 dark:text-green-400 bg-green-500/10 px-2 py-0.5 border border-green-500/20">
                    <ShieldCheck size={11} /> Homologado IBJJF / CBJJ
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pt-1">
                <div>
                  <h2 
                    id="size-chart-title"
                    className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black dark:text-white font-headline leading-tight flex items-center gap-2"
                  >
                    <span>{currentBrandChart.name}</span>
                    <span className="text-zinc-400 font-light text-base font-sans">// Kimonos</span>
                  </h2>
                  {productTitle && (
                    <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 truncate max-w-xl mt-0.5">
                      Referência: <strong className="text-black dark:text-white">{productTitle}</strong>
                    </p>
                  )}
                </div>

                {/* Units Switcher */}
                <div className="flex items-center gap-1 bg-zinc-200/80 dark:bg-zinc-800 p-0.5 border border-zinc-300 dark:border-zinc-700 rounded-none self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setUnitSystem('metric')}
                    className={`px-3 py-1 text-[9px] font-mono font-black uppercase transition-all cursor-pointer ${
                      unitSystem === 'metric'
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    Métrico (cm/kg)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnitSystem('imperial')}
                    className={`px-3 py-1 text-[9px] font-mono font-black uppercase transition-all cursor-pointer ${
                      unitSystem === 'imperial'
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    Imperial (in/lb)
                  </button>
                </div>
              </div>
            </div>

            {/* Brand Quick Switcher Bar */}
            <div className="pt-3 mt-3 border-t border-zinc-200/70 dark:border-zinc-800/70 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <span className="text-[8.5px] font-mono font-black uppercase text-zinc-400 shrink-0">
                Outras Marcas:
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {AVAILABLE_BRAND_CHARTS.map((b) => {
                  const isCur = b.id === selectedBrandId;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBrandId(b.id)}
                      className={`px-2.5 py-1 text-[9px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                        isCur
                          ? 'bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white shadow-xs'
                          : 'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600'
                      }`}
                    >
                      {b.name.replace(' Kimonos', '').replace(' Fightwear', '').replace(' Fight Co.', '')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
            
            {/* 1. Brand Profile & Fitting Specifics Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-850 p-4">
              <div className="space-y-1">
                <span className="text-[8px] font-mono font-black uppercase text-zinc-400 tracking-wider block">
                  Perfil de Corte do Kimono
                </span>
                <p className="text-xs font-black text-black dark:text-white uppercase">
                  {currentBrandChart.cutStyle}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
                  {currentBrandChart.cutDescription}
                </p>
              </div>

              <div className="space-y-1 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 pt-3 md:pt-0 md:pl-4">
                <span className="text-[8px] font-mono font-black uppercase text-zinc-400 tracking-wider block">
                  Taxa & Dica de Encolhimento
                </span>
                <div className="flex items-center gap-1.5">
                  <Flame size={12} className="text-amber-500" />
                  <span className="text-xs font-mono font-black text-black dark:text-white">
                    {currentBrandChart.shrinkageRate}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Tecido: <strong className="text-black dark:text-white">{currentBrandChart.defaultWeave}</strong>. {currentBrandChart.pantsWeave}.
                </p>
              </div>

              <div className="space-y-1 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 pt-3 md:pt-0 md:pl-4">
                <span className="text-[8px] font-mono font-black uppercase text-green-600 dark:text-green-400 tracking-wider block flex items-center gap-1">
                  <Info size={11} /> Dica de Caimento {currentBrandChart.name}
                </span>
                <p className="text-[10px] text-zinc-600 dark:text-zinc-300 leading-relaxed italic bg-white dark:bg-zinc-950 p-2 border border-zinc-200 dark:border-zinc-800">
                  "{currentBrandChart.brandFittingAdvice}"
                </p>
              </div>
            </div>

            {/* 2. Interactive Smart Size Finder (Height & Weight) */}
            <div className="bg-gradient-to-r from-zinc-50 via-white to-zinc-50 dark:from-zinc-900/40 dark:via-zinc-950 dark:to-zinc-900/40 border-2 border-green-600/40 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-600 text-white flex items-center justify-center">
                    <Sparkles size={12} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-black dark:text-white">
                      Smart Size Finder // Calibrador de Caimento Exato
                    </h3>
                    <p className="text-[9.5px] text-zinc-500">
                      Insira seus dados para cruzar com a modelagem específica da {currentBrandChart.name}.
                    </p>
                  </div>
                </div>

                {recommendedSize && (
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white font-mono font-black text-xs uppercase self-start sm:self-auto shadow-md"
                  >
                    <Check size={13} className="stroke-[3]" />
                    <span>Seu Tamanho Ideal: {recommendedSize}</span>
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-black text-zinc-500 uppercase flex items-center gap-1.5">
                    <Ruler size={11} className="text-green-600" />
                    <span>Sua Altura ({unitSystem === 'metric' ? 'cm, ex: 178' : 'polegadas, ex: 70'})</span>
                  </label>
                  <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus-within:border-green-600 p-2 transition-colors">
                    <input
                      type="number"
                      value={heightInput}
                      onChange={(e) => setHeightInput(e.target.value)}
                      placeholder={unitSystem === 'metric' ? '178' : '70'}
                      className="w-full bg-transparent border-none outline-none text-xs font-mono font-black text-black dark:text-white p-0 focus:ring-0"
                    />
                    <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase shrink-0">
                      {unitSystem === 'metric' ? 'cm' : 'in'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-black text-zinc-500 uppercase flex items-center gap-1.5">
                    <Scale size={11} className="text-green-600" />
                    <span>Seu Peso ({unitSystem === 'metric' ? 'kg, ex: 82' : 'libras, ex: 180'})</span>
                  </label>
                  <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 focus-within:border-green-600 p-2 transition-colors">
                    <input
                      type="number"
                      value={weightInput}
                      onChange={(e) => setWeightInput(e.target.value)}
                      placeholder={unitSystem === 'metric' ? '82' : '180'}
                      className="w-full bg-transparent border-none outline-none text-xs font-mono font-black text-black dark:text-white p-0 focus:ring-0"
                    />
                    <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase shrink-0">
                      {unitSystem === 'metric' ? 'kg' : 'lbs'}
                    </span>
                  </div>
                </div>
              </div>

              {recommendedSize && (
                <div className="p-2.5 bg-green-500/10 border-l-4 border-green-600 text-[10px] font-mono text-green-800 dark:text-green-300 flex items-start gap-2">
                  <Check size={13} className="shrink-0 text-green-600 mt-0.5" />
                  <div>
                    <span className="font-black uppercase">Recomendação de Armadura: </span>
                    O tamanho <strong className="font-black text-black dark:text-white bg-green-500/20 px-1 py-0.2">{recommendedSize}</strong> é o corte perfeito para sua constituição física na {currentBrandChart.name}.
                    {activeTableRows.find(r => r.size === recommendedSize)?.notes && (
                      <span className="block mt-0.5 opacity-90 italic">
                        * Nota do fabricante: {activeTableRows.find(r => r.size === recommendedSize)?.notes}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Gender / Category Selection Tabs */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveGenderTab('masculino')}
                  className={`px-4 py-2 text-xs font-mono font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeGenderTab === 'masculino'
                      ? 'border-green-600 text-black dark:text-white font-extrabold bg-zinc-100/60 dark:bg-zinc-900/60'
                      : 'border-transparent text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  Adulto Masculino / Unissex ({currentBrandChart.tables.masculino.length})
                </button>

                {currentBrandChart.tables.feminino && currentBrandChart.tables.feminino.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveGenderTab('feminino')}
                    className={`px-4 py-2 text-xs font-mono font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                      activeGenderTab === 'feminino'
                        ? 'border-green-600 text-black dark:text-white font-extrabold bg-zinc-100/60 dark:bg-zinc-900/60'
                        : 'border-transparent text-zinc-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    Feminino F1 a F4 ({currentBrandChart.tables.feminino.length})
                  </button>
                )}

                {currentBrandChart.tables.infantil && currentBrandChart.tables.infantil.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveGenderTab('infantil')}
                    className={`px-4 py-2 text-xs font-mono font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                      activeGenderTab === 'infantil'
                        ? 'border-green-600 text-black dark:text-white font-extrabold bg-zinc-100/60 dark:bg-zinc-900/60'
                        : 'border-transparent text-zinc-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    Infantil M0 a M4 ({currentBrandChart.tables.infantil.length})
                  </button>
                )}
              </div>

              <div className="text-[9px] font-mono text-zinc-400">
                Clique em uma linha para selecionar
              </div>
            </div>

            {/* 4. Detailed Sizing Grid Table */}
            <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <table className="w-full text-left border-collapse text-[10.5px] font-mono">
                <thead>
                  <tr className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                    <th className="p-2.5 border-r border-zinc-200 dark:border-zinc-800">Tamanho</th>
                    <th className="p-2.5 border-r border-zinc-200 dark:border-zinc-800">Altura Indicada</th>
                    <th className="p-2.5 border-r border-zinc-200 dark:border-zinc-800">Peso Indicado</th>
                    <th className="p-2.5 border-r border-zinc-200 dark:border-zinc-800">Envergadura (Manga a Manga)</th>
                    <th className="p-2.5 border-r border-zinc-200 dark:border-zinc-800">Blusão (Nuca à Barra)</th>
                    <th className="p-2.5 border-r border-zinc-200 dark:border-zinc-800">Calça (Comprimento)</th>
                    <th className="p-2.5 border-r border-zinc-200 dark:border-zinc-800">Tórax / Peito</th>
                    <th className="p-2.5">Perfil de Ajuste</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTableRows.map((row) => {
                    const isRecommended = recommendedSize === row.size;
                    const isSelected = selectedSizeRow === row.size;

                    return (
                      <tr
                        key={row.size}
                        onClick={() => {
                          setSelectedSizeRow(row.size);
                          onSelectSize?.(row.size);
                        }}
                        className={`border-b border-zinc-100 dark:border-zinc-900 transition-colors cursor-pointer ${
                          isRecommended
                            ? 'bg-green-500/15 font-bold text-green-900 dark:text-green-300'
                            : isSelected
                              ? 'bg-zinc-900/10 dark:bg-zinc-100/10 font-bold'
                              : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {/* Size badge column */}
                        <td className="p-2.5 border-r border-zinc-200 dark:border-zinc-800 font-black">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black">
                              {row.size}
                            </span>
                            {isRecommended && (
                              <span className="text-[7px] font-black uppercase bg-green-600 text-white px-1.5 py-0.5 animate-pulse">
                                RECOMENDADO
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Height */}
                        <td className="p-2.5 border-r border-zinc-200 dark:border-zinc-800">
                          {formatHeight(row.minHeight, row.maxHeight)}
                        </td>

                        {/* Weight */}
                        <td className="p-2.5 border-r border-zinc-200 dark:border-zinc-800">
                          {formatWeight(row.minWeight, row.maxWeight)}
                        </td>

                        {/* Wingspan */}
                        <td className="p-2.5 border-r border-zinc-200 dark:border-zinc-800">
                          {formatCm(row.wingspan)}
                        </td>

                        {/* Jacket Length */}
                        <td className="p-2.5 border-r border-zinc-200 dark:border-zinc-800">
                          {formatCm(row.jacketLength)}
                        </td>

                        {/* Pants Length */}
                        <td className="p-2.5 border-r border-zinc-200 dark:border-zinc-800">
                          {formatCm(row.pantsLength)}
                        </td>

                        {/* Chest Width */}
                        <td className="p-2.5 border-r border-zinc-200 dark:border-zinc-800">
                          {formatCm(row.chestWidth)}
                        </td>

                        {/* Notes */}
                        <td className="p-2.5 text-[9.5px] text-zinc-500 italic">
                          {row.notes || (row.size.includes('L') ? 'Biotipo Longilíneo' : row.size.includes('H') ? 'Biotipo Robusto' : 'Corte Regular')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 5. Visual Diagram & Anatomical BJJ Measurements Guide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50/70 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 p-4">
              <div className="space-y-2">
                <span className="text-[9px] font-mono font-black uppercase text-green-600 tracking-wider flex items-center gap-1.5">
                  <Layers size={12} /> Como Medir Seu Corpo Corretamente
                </span>
                <ul className="space-y-1.5 text-[10.5px] text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-black text-black dark:text-white bg-zinc-200 dark:bg-zinc-800 px-1 text-[8px] mt-0.5">1</span>
                    <span><strong>Envergadura:</strong> Abra os braços na horizontal e meça da ponta do punho esquerdo ao direito cruzando as costas.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-black text-black dark:text-white bg-zinc-200 dark:bg-zinc-800 px-1 text-[8px] mt-0.5">2</span>
                    <span><strong>Comprimento do Blusão:</strong> Meça da base da nuca até a metade das coxas (onde termina a saia do kimono).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-black text-black dark:text-white bg-zinc-200 dark:bg-zinc-800 px-1 text-[8px] mt-0.5">3</span>
                    <span><strong>Comprimento da Calça:</strong> Meça do osso ilíaco (cintura) até 5cm acima do osso do tornozelo (padrão IBJJF).</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 pt-3 md:pt-0 md:pl-4">
                <span className="text-[9px] font-mono font-black uppercase text-amber-600 tracking-wider flex items-center gap-1.5">
                  <AlertTriangle size={12} /> Regra de Inspeção IBJJF / CBJJ
                </span>
                <p className="text-[10.5px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
                  Nos campeonatos oficiais da IBJJF/CBJJ, a manga do kimono não pode ficar mais de 5cm recuada em relação ao punho com os braços esticados à frente. Além disso, a folga ao redor de todo o braço deve ter pelo menos 7cm para inserção do medidor regulamentar.
                </p>
                <p className="text-[9.5px] font-mono text-zinc-500 pt-1 italic">
                  * Todos os kimonos da marca {currentBrandChart.name} são cortados de acordo com esses parâmetros regulamentares.
                </p>
              </div>
            </div>

            {/* 6. Washing & Care Instructions for this brand */}
            <div className="p-3.5 bg-zinc-100 dark:bg-zinc-900 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 flex items-start gap-3 border border-zinc-200 dark:border-zinc-800">
              <RotateCcw size={14} className="text-green-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-black uppercase text-black dark:text-white">Instruções de Lavagem e Conservação:</span>
                <p className="leading-relaxed">
                  Lave sempre com água fria e sabão neutro. Nunca utilize máquina de secar ou água quente, pois isso causará encolhimento acelerado de até 8%. Seque à sombra em local ventilado (o sol direto resseca as fibras de algodão Pearl Weave).
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopyChartSummary}
                className="flex-1 sm:flex-initial px-3.5 py-2 border border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white text-zinc-700 dark:text-zinc-300 text-xs font-mono font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer bg-white dark:bg-zinc-900"
                title="Copiar dados desta tabela"
              >
                {copiedSuccess ? <CheckCheck size={13} className="text-green-600" /> : <Copy size={13} />}
                <span>{copiedSuccess ? 'Copiado!' : 'Copiar Tabela'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 border border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white text-zinc-700 dark:text-zinc-300 text-xs font-mono font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer bg-white dark:bg-zinc-900"
                title="Imprimir tabela de medidas"
              >
                <Printer size={13} />
                <span className="hidden sm:inline">Imprimir</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {selectedSizeRow && onSelectSize && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectSize(selectedSizeRow);
                    onClose();
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-mono font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Check size={13} strokeWidth={3} />
                  <span>Confirmar Tamanho {selectedSizeRow}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-mono font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Ruler, 
  Scale, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle, 
  Check, 
  ShieldCheck, 
  Flame, 
  Layers, 
  Info, 
  Loader2, 
  Filter, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  getBrandSizeChart, 
  AVAILABLE_BRAND_CHARTS, 
  BrandSizeChart, 
  SizeRowData 
} from '../data/brandSizeCharts';

interface DynamicSizeChartProps {
  category: string;
  gender?: string;
  brand?: string;
  availableSizes?: string[];
  onSizeChange?: (size: string) => void;
  onSizingWarning?: (warning: { type: 'match' | 'warning' | 'unusual' | null; message: string; recommended: string } | null) => void;
  onBrandChange?: (brandId: string) => void;
  showBrandFilter?: boolean;
}

export interface SizingRow {
  size: string;
  minHeight: number; // in cm
  maxHeight: number; // in cm
  minWeight: number; // in kg
  maxWeight: number; // in kg
  wingspan?: number; // in cm
  jacketLength?: number; // in cm
  pantsLength?: number; // in cm
  chestWidth?: number; // in cm
  notes?: string;
  extraSpecs?: Record<string, string>;
}

export function DynamicSizeChart({ 
  category = 'Kimonos', 
  gender = 'Unissex', 
  brand, 
  availableSizes,
  onSizeChange,
  onSizingWarning,
  onBrandChange,
  showBrandFilter = true
}: DynamicSizeChartProps) {
  const { t } = useTranslation();
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [heightInput, setHeightInput] = useState<string>('');
  const [weightInput, setWeightInput] = useState<string>('');
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');

  // 1. Dynamic Brand Loading & Filtering Logic
  const initialBrandChart = useMemo(() => getBrandSizeChart(brand), [brand]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>(initialBrandChart.id);
  const [isLoadingBrandData, setIsLoadingBrandData] = useState<boolean>(false);

  // Sync selectedBrandId whenever external `brand` prop updates
  useEffect(() => {
    if (brand) {
      const resolved = getBrandSizeChart(brand);
      if (resolved.id !== selectedBrandId) {
        setIsLoadingBrandData(true);
        setSelectedBrandId(resolved.id);
        const timer = setTimeout(() => setIsLoadingBrandData(false), 160);
        return () => clearTimeout(timer);
      }
    }
  }, [brand]);

  // Handler for brand filtering / switching
  const handleSelectBrand = (brandId: string) => {
    if (brandId === selectedBrandId) return;
    setIsLoadingBrandData(true);
    setSelectedBrandId(brandId);
    onBrandChange?.(brandId);
    const timer = setTimeout(() => setIsLoadingBrandData(false), 180);
    return () => clearTimeout(timer);
  };

  // Active brand chart loaded from brand data
  const currentBrandChart: BrandSizeChart = useMemo(() => {
    return AVAILABLE_BRAND_CHARTS.find(b => b.id === selectedBrandId) || initialBrandChart;
  }, [selectedBrandId, initialBrandChart]);

  // 2. Division / Gender Tabs ('masculino' | 'feminino' | 'infantil')
  const [activeDivision, setActiveDivision] = useState<'masculino' | 'feminino' | 'infantil'>('masculino');

  // Sync division from gender prop
  useEffect(() => {
    if (gender) {
      const g = gender.toLowerCase();
      if (g.includes('fem') || g.includes('mulher')) {
        setActiveDivision('feminino');
      } else if (g.includes('infant') || g.includes('kids') || g.includes('criança')) {
        setActiveDivision('infantil');
      } else {
        setActiveDivision('masculino');
      }
    }
  }, [gender]);

  const isKimonoCategory = useMemo(() => {
    const c = category.toLowerCase();
    return c.includes('kimono') || c.includes('gis') || c === 'kimonos';
  }, [category]);

  const isBeltCategory = useMemo(() => {
    const c = category.toLowerCase();
    return c.includes('faixa') || c === 'faixas';
  }, [category]);

  // 3. Extract sizing rows with brand-specific data
  const rows: SizingRow[] = useMemo(() => {
    if (isKimonoCategory) {
      // Load specific brand tables
      let source: SizeRowData[] = currentBrandChart.tables.masculino;
      if (activeDivision === 'feminino' && currentBrandChart.tables.feminino?.length) {
        source = currentBrandChart.tables.feminino;
      } else if (activeDivision === 'infantil' && currentBrandChart.tables.infantil?.length) {
        source = currentBrandChart.tables.infantil;
      }

      if (source && source.length > 0) {
        return source.map(r => ({
          size: r.size,
          minHeight: r.minHeight,
          maxHeight: r.maxHeight,
          minWeight: r.minWeight,
          maxWeight: r.maxWeight,
          wingspan: r.wingspan,
          jacketLength: r.jacketLength,
          pantsLength: r.pantsLength,
          chestWidth: r.chestWidth,
          notes: r.notes,
          extraSpecs: {
            'Envergadura': `${r.wingspan}cm`,
            'Blusão': `${r.jacketLength}cm`,
            'Calça': `${r.pantsLength}cm`
          }
        }));
      }

      // Fallback if brand table empty
      if (activeDivision === 'feminino') {
        return [
          { size: 'F1', minHeight: 145, maxHeight: 155, minWeight: 40, maxWeight: 50, wingspan: 144, jacketLength: 68, pantsLength: 87, chestWidth: 94 },
          { size: 'F2', minHeight: 152, maxHeight: 165, minWeight: 48, maxWeight: 60, wingspan: 152, jacketLength: 71, pantsLength: 91, chestWidth: 99 },
          { size: 'F3', minHeight: 160, maxHeight: 172, minWeight: 58, maxWeight: 72, wingspan: 159, jacketLength: 75, pantsLength: 95, chestWidth: 105 },
          { size: 'F4', minHeight: 168, maxHeight: 180, minWeight: 70, maxWeight: 85, wingspan: 166, jacketLength: 78, pantsLength: 99, chestWidth: 112 },
        ];
      }
      return [
        { size: 'A0', minHeight: 155, maxHeight: 165, minWeight: 50, maxWeight: 65, wingspan: 155, jacketLength: 72, pantsLength: 90, chestWidth: 104 },
        { size: 'A1', minHeight: 162, maxHeight: 172, minWeight: 60, maxWeight: 75, wingspan: 161, jacketLength: 75, pantsLength: 94, chestWidth: 110 },
        { size: 'A2', minHeight: 170, maxHeight: 182, minWeight: 72, maxWeight: 88, wingspan: 168, jacketLength: 79, pantsLength: 98, chestWidth: 118 },
        { size: 'A3', minHeight: 180, maxHeight: 191, minWeight: 85, maxWeight: 100, wingspan: 177, jacketLength: 84, pantsLength: 103, chestWidth: 124 },
        { size: 'A4', minHeight: 189, maxHeight: 202, minWeight: 98, maxWeight: 115, wingspan: 186, jacketLength: 88, pantsLength: 107, chestWidth: 132 },
        { size: 'A5', minHeight: 198, maxHeight: 210, minWeight: 112, maxWeight: 130, wingspan: 194, jacketLength: 92, pantsLength: 111, chestWidth: 140 },
      ];
    } else if (isBeltCategory) {
      return [
        { size: 'A0', minHeight: 150, maxHeight: 165, minWeight: 45, maxWeight: 65, extraSpecs: { 'Comprimento': '240cm', 'Costuras': '8 a 10' } },
        { size: 'A1', minHeight: 160, maxHeight: 172, minWeight: 58, maxWeight: 75, extraSpecs: { 'Comprimento': '260cm', 'Costuras': '10 a 12' } },
        { size: 'A2', minHeight: 170, maxHeight: 183, minWeight: 70, maxWeight: 88, extraSpecs: { 'Comprimento': '280cm', 'Costuras': '10 a 12' } },
        { size: 'A3', minHeight: 180, maxHeight: 192, minWeight: 82, maxWeight: 102, extraSpecs: { 'Comprimento': '300cm', 'Costuras': '12' } },
        { size: 'A4', minHeight: 190, maxHeight: 205, minWeight: 95, maxWeight: 118, extraSpecs: { 'Comprimento': '320cm', 'Costuras': '12' } },
        { size: 'A5', minHeight: 200, maxHeight: 215, minWeight: 110, maxWeight: 135, extraSpecs: { 'Comprimento': '340cm', 'Costuras': '12' } },
      ];
    } else {
      // Rashguards / compressão / shorts
      return [
        { size: 'PP / XS', minHeight: 150, maxHeight: 160, minWeight: 45, maxWeight: 55, chestWidth: 85, extraSpecs: { 'Peito/Tórax': '82-88cm', 'Cintura': '70-76cm' } },
        { size: 'P / S', minHeight: 158, maxHeight: 168, minWeight: 52, maxWeight: 65, chestWidth: 91, extraSpecs: { 'Peito/Tórax': '88-94cm', 'Cintura': '76-82cm' } },
        { size: 'M / M', minHeight: 166, maxHeight: 176, minWeight: 62, maxWeight: 78, chestWidth: 98, extraSpecs: { 'Peito/Tórax': '94-102cm', 'Cintura': '82-90cm' } },
        { size: 'G / L', minHeight: 174, maxHeight: 185, minWeight: 75, maxWeight: 92, chestWidth: 106, extraSpecs: { 'Peito/Tórax': '102-110cm', 'Cintura': '90-98cm' } },
        { size: 'GG / XL', minHeight: 182, maxHeight: 194, minWeight: 88, maxWeight: 108, chestWidth: 114, extraSpecs: { 'Peito/Tórax': '110-118cm', 'Cintura': '98-106cm' } },
        { size: 'XG / XXL', minHeight: 190, maxHeight: 205, minWeight: 102, maxWeight: 125, chestWidth: 122, extraSpecs: { 'Peito/Tórax': '118-126cm', 'Cintura': '106-114cm' } },
      ];
    }
  }, [isKimonoCategory, isBeltCategory, activeDivision, currentBrandChart]);

  // Available size buttons
  const sizeOptions = useMemo(() => {
    return availableSizes && availableSizes.length > 0
      ? availableSizes
      : rows.map(r => r.size);
  }, [availableSizes, rows]);

  // Default selected size
  useEffect(() => {
    if (sizeOptions.length > 0 && (!selectedSize || !sizeOptions.includes(selectedSize))) {
      setSelectedSize(sizeOptions[0]);
    }
  }, [sizeOptions, selectedSize]);

  // 4. Interactive Smart Size Finder calculation
  useEffect(() => {
    const h = parseFloat(heightInput);
    const w = parseFloat(weightInput);

    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0 || rows.length === 0) {
      setRecommendedSize(null);
      return;
    }

    const normalizedHeight = unitSystem === 'imperial' ? h * 2.54 : h;
    const normalizedWeight = unitSystem === 'imperial' ? w * 0.453592 : w;

    let bestMatch: SizingRow | null = null;
    let minDiffScore = Infinity;

    for (const row of rows) {
      const isHeightIn = normalizedHeight >= row.minHeight && normalizedHeight <= row.maxHeight;
      const isWeightIn = normalizedWeight >= row.minWeight && normalizedWeight <= row.maxWeight;

      if (isHeightIn && isWeightIn) {
        bestMatch = row;
        break;
      }

      const midHeight = (row.minHeight + row.maxHeight) / 2;
      const midWeight = (row.minWeight + row.maxWeight) / 2;
      const hDiff = Math.abs(normalizedHeight - midHeight) / (row.maxHeight - row.minHeight);
      const wDiff = Math.abs(normalizedWeight - midWeight) / (row.maxWeight - row.minWeight);
      const score = hDiff + wDiff;

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
  }, [heightInput, weightInput, unitSystem, rows]);

  // 5. Fit status & dynamic warnings with brand-specific notes
  const getSizingStatus = () => {
    if (!selectedSize || !recommendedSize) return null;

    const clean = (s: string) => s.trim().toUpperCase().replace(/\s+/g, '');
    const cleanSelected = clean(selectedSize);
    const cleanRecommended = clean(recommendedSize);

    if (cleanSelected === cleanRecommended) {
      return {
        type: 'match' as const,
        title: `Tamanho Ideal para ${currentBrandChart.name}!`,
        message: `O tamanho ${selectedSize} corresponde perfeitamente à recomendação corporal de combate para a modelagem da ${currentBrandChart.name}.`,
        color: 'border-green-600 bg-green-500/10 text-green-700 dark:text-green-400'
      };
    }

    const list = rows.map(r => clean(r.size));
    let idxSelected = list.indexOf(cleanSelected);
    let idxRecommended = list.indexOf(cleanRecommended);

    if (idxSelected === -1) {
      idxSelected = list.findIndex(item => item.includes(cleanSelected) || cleanSelected.includes(item));
    }
    if (idxRecommended === -1) {
      idxRecommended = list.findIndex(item => item.includes(cleanRecommended) || cleanRecommended.includes(item));
    }

    if (idxSelected === -1 || idxRecommended === -1) {
      return {
        type: 'warning' as const,
        title: 'Aviso de Diferença de Medida',
        message: `O tamanho selecionado (${selectedSize}) é diferente do recomendado (${recommendedSize}) na ${currentBrandChart.name}. Sugerimos revisar a tabela detalhada de envergadura e comprimento.`,
        color: 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400'
      };
    }

    const distance = Math.abs(idxSelected - idxRecommended);

    if (distance === 1) {
      const isLarger = idxSelected > idxRecommended;
      return {
        type: 'warning' as const,
        title: 'Ajuste Fino de Caimento',
        message: `O tamanho selecionado (${selectedSize}) é uma posição adjacente ao recomendado (${recommendedSize}). Como a ${currentBrandChart.name} possui taxa de encolhimento de ${currentBrandChart.shrinkageRate}, essa escolha é válida se preferir caimento mais ${isLarger ? 'folgado e com sobra' : 'justo e atlético'}.`,
        color: 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400'
      };
    } else {
      const isLarger = idxSelected > idxRecommended;
      return {
        type: 'unusual' as const,
        title: '🚨 ALERTA: Tamanho Muito Incomum!',
        message: `Atenção! Você escolheu o tamanho ${selectedSize}, mas o ideal na tabela da ${currentBrandChart.name} é o ${recommendedSize}. Há um risco altíssimo de que o kimono fique excessivamente ${isLarger ? 'largo e sobrando tecido' : 'apertado e com mangas curtas'}.`,
        color: 'border-red-600 bg-red-500/10 text-red-700 dark:text-red-400'
      };
    }
  };

  const status = getSizingStatus();

  // Notify parent on size changes
  useEffect(() => {
    if (selectedSize) {
      onSizeChange?.(selectedSize);
    }
  }, [selectedSize, onSizeChange]);

  // Notify parent on sizing warning changes
  const statusType = status?.type || null;
  const statusMessage = status?.message || '';
  const recommendedStr = recommendedSize || '';

  useEffect(() => {
    if (statusType) {
      onSizingWarning?.({
        type: statusType,
        message: statusMessage,
        recommended: recommendedStr
      });
    } else {
      onSizingWarning?.(null);
    }
  }, [statusType, statusMessage, recommendedStr, onSizingWarning]);

  // Conversions for UI display
  const formatHeight = (minCm: number, maxCm: number) => {
    if (unitSystem === 'imperial') {
      const minIn = Math.round(minCm / 2.54);
      const maxIn = Math.round(maxCm / 2.54);
      const toFeet = (inches: number) => `${Math.floor(inches / 12)}'${inches % 12}"`;
      return `${toFeet(minIn)} - ${toFeet(maxIn)}`;
    }
    return `${(minCm / 100).toFixed(2)}m a ${(maxCm / 100).toFixed(2)}m`;
  };

  const formatWeight = (minKg: number, maxKg: number) => {
    if (unitSystem === 'imperial') {
      const minLbs = Math.round(minKg * 2.20462);
      const maxLbs = Math.round(maxKg * 2.20462);
      return `${minLbs} lbs - ${maxLbs} lbs`;
    }
    return `${minKg}kg a ${maxKg}kg`;
  };

  const formatDimension = (cmVal?: number) => {
    if (!cmVal) return '-';
    if (unitSystem === 'imperial') {
      return `${(cmVal / 2.54).toFixed(1)}"`;
    }
    return `${cmVal}cm`;
  };

  // Skip showing sizing chart for products that aren't wearable
  const isSizable = category.toLowerCase().includes('kimono') || 
                    category.toLowerCase().includes('gis') ||
                    category.toLowerCase().includes('faixa') || 
                    category.toLowerCase().includes('rashguard') || 
                    category.toLowerCase().includes('manga') || 
                    category.toLowerCase().includes('bermuda') || 
                    category.toLowerCase().includes('calça') || 
                    category.toLowerCase().includes('roupa') || 
                    category.toLowerCase().includes('moletom') || 
                    category.toLowerCase().includes('casaco');

  if (!isSizable) {
    return (
      <div className="border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10 p-4 text-center font-mono">
        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Tamanho Único ou Não se Aplica</span>
        <p className="text-[10px] text-zinc-500 mt-1">Este item possui ajuste universal ou dosagem padrão pré-calibrada.</p>
      </div>
    );
  }

  return (
    <div className="border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 p-4 sm:p-5 font-sans text-left space-y-5 shadow-xs">
      
      {/* Title Header with Units Switcher & Brand Origin */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-100 dark:border-zinc-900 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono font-black uppercase text-green-600 tracking-wider flex items-center gap-1">
              <Ruler size={11} className="stroke-[2.5]" />
              Tabela de Medidas // {currentBrandChart.name}
            </span>
            <span className="text-[8px] font-mono font-bold text-zinc-400 uppercase px-1.5 py-0.2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              {currentBrandChart.originCountry}
            </span>
            {currentBrandChart.ibjjfApproved && (
              <span className="text-[7.5px] font-mono font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-1.5 py-0.2 border border-green-500/20 uppercase hidden sm:inline-block">
                ✓ IBJJF
              </span>
            )}
          </div>
          <h4 className="text-base sm:text-lg font-black uppercase text-black dark:text-white leading-tight mt-1 font-headline">
            Guia de Tamanhos ({category} • {currentBrandChart.name})
          </h4>
        </div>

        {/* Toggle units */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-0.5 border border-zinc-200 dark:border-zinc-800 rounded-none shrink-0">
          <button
            type="button"
            onClick={() => { setUnitSystem('metric'); }}
            className={`px-3 py-1 text-[8.5px] font-mono font-black uppercase transition-all rounded-none cursor-pointer ${
              unitSystem === 'metric' 
                ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs' 
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Métrico (cm/kg)
          </button>
          <button
            type="button"
            onClick={() => { setUnitSystem('imperial'); }}
            className={`px-3 py-1 text-[8.5px] font-mono font-black uppercase transition-all rounded-none cursor-pointer ${
              unitSystem === 'imperial' 
                ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-xs' 
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Imperial (in/lb)
          </button>
        </div>
      </div>

      {/* 1. Dynamic Brand Filter Bar (Filter by Kimono Brand) */}
      {showBrandFilter && isKimonoCategory && (
        <div className="space-y-1.5 p-3 bg-zinc-50/80 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center justify-between text-[8.5px] font-mono uppercase">
            <span className="font-black text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Filter size={10} className="text-green-600" />
              Filtrar Tabela por Marca de Kimono:
            </span>
            <span className="text-green-600 font-bold">
              Selecionada: <strong>{currentBrandChart.name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {AVAILABLE_BRAND_CHARTS.map((b) => {
              const isActive = b.id === selectedBrandId;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleSelectBrand(b.id)}
                  className={`px-2.5 py-1 text-[8.5px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 rounded-none border ${
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs scale-102'
                      : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600'
                  }`}
                  title={`Carregar tabela de medidas da marca ${b.name}`}
                >
                  {b.name.replace(' Kimonos', '').replace(' Fightwear', '').replace(' Fight Co.', '')}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Brand Technical Profile Badge & Shrinkage Factors */}
      {isKimonoCategory && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-150 dark:border-zinc-850 p-3 text-[10px] font-mono">
          <div className="space-y-0.5">
            <span className="text-[7.5px] font-bold text-zinc-400 uppercase block">Corte & Modelagem</span>
            <p className="font-black text-black dark:text-white uppercase truncate">{currentBrandChart.cutStyle}</p>
            <p className="text-[9px] text-zinc-500 font-sans line-clamp-2">{currentBrandChart.cutDescription}</p>
          </div>

          <div className="space-y-0.5 border-t sm:border-t-0 sm:border-l border-zinc-200 dark:border-zinc-800 pt-2 sm:pt-0 sm:pl-3">
            <span className="text-[7.5px] font-bold text-zinc-400 uppercase block flex items-center gap-1">
              <Flame size={10} className="text-amber-500" />
              Retração / Encolhimento
            </span>
            <p className="font-black text-black dark:text-white">{currentBrandChart.shrinkageRate}</p>
            <p className="text-[9px] text-zinc-500">Padrão: {currentBrandChart.defaultWeave}</p>
          </div>

          <div className="space-y-0.5 border-t sm:border-t-0 sm:border-l border-zinc-200 dark:border-zinc-800 pt-2 sm:pt-0 sm:pl-3">
            <span className="text-[7.5px] font-bold text-green-600 dark:text-green-400 uppercase block flex items-center gap-1">
              <Info size={10} /> Conselho do Tatame
            </span>
            <p className="text-[9px] text-zinc-600 dark:text-zinc-300 italic font-sans line-clamp-2">
              "{currentBrandChart.brandFittingAdvice}"
            </p>
          </div>
        </div>
      )}

      {/* Division Tabs (Masculino, Feminino, Infantil) for Kimonos */}
      {isKimonoCategory && (
        <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-1">
          <button
            type="button"
            onClick={() => setActiveDivision('masculino')}
            className={`px-3 py-1.5 text-[9px] font-mono font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeDivision === 'masculino'
                ? 'border-green-600 text-black dark:text-white bg-zinc-100/60 dark:bg-zinc-900/60'
                : 'border-transparent text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Adulto Masculino / Unissex ({currentBrandChart.tables.masculino.length})
          </button>

          {currentBrandChart.tables.feminino && currentBrandChart.tables.feminino.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveDivision('feminino')}
              className={`px-3 py-1.5 text-[9px] font-mono font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeDivision === 'feminino'
                  ? 'border-green-600 text-black dark:text-white bg-zinc-100/60 dark:bg-zinc-900/60'
                  : 'border-transparent text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Feminino F1 - F4 ({currentBrandChart.tables.feminino.length})
            </button>
          )}

          {currentBrandChart.tables.infantil && currentBrandChart.tables.infantil.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveDivision('infantil')}
              className={`px-3 py-1.5 text-[9px] font-mono font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeDivision === 'infantil'
                  ? 'border-green-600 text-black dark:text-white bg-zinc-100/60 dark:bg-zinc-900/60'
                  : 'border-transparent text-zinc-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Infantil M0 - M4 ({currentBrandChart.tables.infantil.length})
            </button>
          )}
        </div>
      )}

      {/* 2. Size Selection Buttons */}
      <div className="space-y-1.5">
        <label className="text-[9px] font-mono font-black text-zinc-400 dark:text-zinc-500 uppercase block">
          Selecione o tamanho pretendido:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {sizeOptions.map((sz) => {
            const isSelected = selectedSize === sz;
            return (
              <button
                key={sz}
                onClick={() => setSelectedSize(sz)}
                className={`px-3.5 py-2 border font-mono text-xs font-black uppercase transition-all duration-150 cursor-pointer rounded-none flex items-center gap-1 ${
                  isSelected
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-md scale-102'
                    : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700 dark:bg-zinc-900/40 dark:border-zinc-800 dark:text-zinc-350 dark:hover:bg-zinc-850'
                }`}
              >
                {isSelected && <Check size={11} className="stroke-[3]" />}
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Sizing Interactive Calculator Finder */}
      <div className="bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200/60 dark:border-zinc-800 p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-green-600 dark:text-green-400 animate-pulse" />
            <span className="text-[9.5px] font-mono font-black text-green-600 dark:text-green-400 uppercase tracking-wider">
              Smart Finder // Encontrar Tamanho na {currentBrandChart.name}
            </span>
          </div>
          
          <span className="text-[8px] font-mono text-zinc-400 dark:text-zinc-500 uppercase">Validador de Medida</span>
        </div>
        
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight font-light">
          Insira sua altura e peso reais para que o sistema técnico verifique a compatibilidade física do tamanho com a modelagem da <strong>{currentBrandChart.name}</strong>.
        </p>

        <div className="grid grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="text-[8px] font-mono font-black text-zinc-450 dark:text-zinc-500 uppercase block">
              {unitSystem === 'metric' ? 'Altura (ex: 175 para 1.75m)' : 'Altura (Inches, ex: 69)'}
            </label>
            <div className="flex items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-1.5 focus-within:border-green-600 transition-colors">
              <Ruler size={11} className="text-zinc-400 mr-1.5" />
              <input
                type="number"
                value={heightInput}
                onChange={(e) => setHeightInput(e.target.value)}
                placeholder={unitSystem === 'metric' ? '175' : '69'}
                className="w-full bg-transparent border-none outline-none text-[11px] font-mono p-0 focus:ring-0 text-black dark:text-white"
              />
              <span className="text-[8px] font-mono text-zinc-400 uppercase shrink-0 font-bold">
                {unitSystem === 'metric' ? 'cm' : 'in'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[8px] font-mono font-black text-zinc-450 dark:text-zinc-500 uppercase block">
              {unitSystem === 'metric' ? 'Peso (ex: 78)' : 'Peso (Pounds, ex: 172)'}
            </label>
            <div className="flex items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-1.5 focus-within:border-green-600 transition-colors">
              <Scale size={11} className="text-zinc-400 mr-1.5" />
              <input
                type="number"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder={unitSystem === 'metric' ? '78' : '172'}
                className="w-full bg-transparent border-none outline-none text-[11px] font-mono p-0 focus:ring-0 text-black dark:text-white"
              />
              <span className="text-[8px] font-mono text-zinc-400 uppercase shrink-0 font-bold">
                {unitSystem === 'metric' ? 'kg' : 'lb'}
              </span>
            </div>
          </div>
        </div>

        {/* Alerts and Dynamic Warnings Area */}
        <AnimatePresence mode="wait">
          {!recommendedSize && selectedSize ? (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-start gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 text-[10px] text-zinc-500 dark:text-zinc-450 font-mono"
            >
              <HelpCircle size={13} className="shrink-0 mt-0.5 text-zinc-400" />
              <p>
                Insira sua altura e peso acima para validar se o tamanho <strong className="text-black dark:text-white font-black">{selectedSize}</strong> é o mais adequado para o corte da {currentBrandChart.name}.
              </p>
            </motion.div>
          ) : status ? (
            <motion.div
              key={status.type}
              initial={{ opacity: 0, scale: 0.99, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.99, y: -4 }}
              className={`border-l-4 p-3 font-mono ${status.color} space-y-1`}
            >
              <div className="flex items-center gap-1.5 font-black uppercase text-[9.5px]">
                {status.type === 'match' ? (
                  <CheckCircle size={13} className="text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle size={13} className={status.type === 'unusual' ? 'text-red-600 animate-bounce' : 'text-amber-500'} />
                )}
                <span>{status.title}</span>
              </div>
              <p className="text-[10px] leading-relaxed font-medium">
                {status.message}
              </p>
              {status.type !== 'match' && (
                <p className="text-[9px] opacity-80 pt-0.5 leading-tight italic">
                  * Dica: Verifique a tabela de correspondência detalhada da {currentBrandChart.name} abaixo antes de prosseguir com a compra.
                </p>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* 4. Grid Sizing Table with Loading State */}
      <div className="relative">
        {isLoadingBrandData && (
          <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xs flex items-center justify-center z-10 font-mono text-[10px] gap-2">
            <Loader2 size={14} className="animate-spin text-green-600" />
            <span className="font-bold uppercase tracking-wider">Carregando especificações da marca {currentBrandChart.name}...</span>
          </div>
        )}

        <div id="product-detail-modal-size-chart" className="overflow-x-auto border border-zinc-150 dark:border-zinc-850">
          <table className="w-full text-left border-collapse text-[10px] font-mono">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-150 dark:border-zinc-850 text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                <th className="p-2 border-r border-zinc-150 dark:border-zinc-850">Tam</th>
                <th className="p-2 border-r border-zinc-150 dark:border-zinc-850">Altura</th>
                <th className="p-2 border-r border-zinc-150 dark:border-zinc-850">Peso</th>
                {isKimonoCategory ? (
                  <>
                    <th className="p-2 border-r border-zinc-150 dark:border-zinc-850">Envergadura</th>
                    <th className="p-2 border-r border-zinc-150 dark:border-zinc-850">Blusão</th>
                    <th className="p-2 border-r border-zinc-150 dark:border-zinc-850">Calça</th>
                    <th className="p-2 border-r border-zinc-150 dark:border-zinc-850">Tórax</th>
                    <th className="p-2">Perfil de Biotipo</th>
                  </>
                ) : (
                  rows[0]?.extraSpecs && Object.keys(rows[0].extraSpecs).map(key => (
                    <th key={key} className="p-2">{key}</th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isMatch = recommendedSize === row.size;
                const isSelected = selectedSize === row.size;
                return (
                  <tr 
                    key={row.size} 
                    onClick={() => setSelectedSize(row.size)}
                    className={`border-b border-zinc-100 dark:border-zinc-900 transition-all cursor-pointer even:bg-zinc-50/40 dark:even:bg-zinc-900/30 ${
                      isSelected 
                        ? 'bg-zinc-900/10 dark:bg-white/5 font-bold border-l-2 border-l-black dark:border-l-white' 
                        : isMatch 
                          ? 'bg-green-600/5 font-semibold text-green-700 dark:text-green-450' 
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20'
                    }`}
                  >
                    <td className={`p-2 border-r border-zinc-150 dark:border-zinc-850 font-black flex items-center gap-1.5 ${isSelected ? 'text-black dark:text-white' : isMatch ? 'text-green-600 dark:text-green-400' : 'text-black dark:text-white'}`}>
                      <span>{row.size}</span>
                      {isSelected && <span className="text-[7px] px-1 py-0.2 bg-black text-white dark:bg-white dark:text-black font-extrabold leading-none uppercase shrink-0">SEU</span>}
                      {isMatch && !isSelected && <span className="text-[7px] px-1 py-0.2 bg-green-600 text-white font-extrabold leading-none uppercase shrink-0">IDEAL</span>}
                    </td>
                    <td className="p-2 border-r border-zinc-150 dark:border-zinc-850">
                      {formatHeight(row.minHeight, row.maxHeight)}
                    </td>
                    <td className="p-2 border-r border-zinc-150 dark:border-zinc-850">
                      {formatWeight(row.minWeight, row.maxWeight)}
                    </td>
                    {isKimonoCategory ? (
                      <>
                        <td className="p-2 border-r border-zinc-150 dark:border-zinc-850">
                          {formatDimension(row.wingspan)}
                        </td>
                        <td className="p-2 border-r border-zinc-150 dark:border-zinc-850">
                          {formatDimension(row.jacketLength)}
                        </td>
                        <td className="p-2 border-r border-zinc-150 dark:border-zinc-850">
                          {formatDimension(row.pantsLength)}
                        </td>
                        <td className="p-2 border-r border-zinc-150 dark:border-zinc-850">
                          {formatDimension(row.chestWidth)}
                        </td>
                        <td className="p-2 text-[9px] text-zinc-500 italic">
                          {row.notes || (row.size.includes('L') ? 'Biotipo Longilíneo' : row.size.includes('H') ? 'Biotipo Robusto' : 'Corte Padrão')}
                        </td>
                      </>
                    ) : (
                      row.extraSpecs && Object.entries(row.extraSpecs).map(([key, val]) => (
                        <td key={key} className="p-2 font-light">{val}</td>
                      ))
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sizing Footnote Advice */}
      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-150 dark:border-zinc-850 text-[9px] leading-relaxed text-zinc-500 dark:text-zinc-400 font-mono space-y-1">
        <p>
          * <strong>Nota de Encolhimento para {currentBrandChart.name}:</strong> Taxa de retração estimada em {currentBrandChart.shrinkageRate}. Lavagens a frio e secagem à sombra preservam o caimento original.
        </p>
        <p className="text-[8.5px] opacity-80">
          * Em caso de dúvidas entre dois tamanhos para competição, prefira o tamanho maior para não ser barrado no medidor oficial da IBJJF / CBJJ.
        </p>
      </div>
    </div>
  );
}

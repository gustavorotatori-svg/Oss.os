import React, { useState, useEffect } from 'react';
import { Ruler, Scale, Sparkles, CheckCircle, AlertTriangle, HelpCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface DynamicSizeChartProps {
  category: string;
  gender?: string;
  brand?: string;
  availableSizes?: string[];
  onSizeChange?: (size: string) => void;
  onSizingWarning?: (warning: { type: 'match' | 'warning' | 'unusual' | null; message: string; recommended: string } | null) => void;
}

interface SizingRow {
  size: string;
  minHeight: number; // in cm
  maxHeight: number; // in cm
  minWeight: number; // in kg
  maxWeight: number; // in kg
  extraSpecs?: Record<string, string>;
}

export function DynamicSizeChart({ 
  category, 
  gender = 'Unissex', 
  brand, 
  availableSizes,
  onSizeChange,
  onSizingWarning
}: DynamicSizeChartProps) {
  const { t } = useTranslation();
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [heightInput, setHeightInput] = useState<string>('');
  const [weightInput, setWeightInput] = useState<string>('');
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');

  // Define sizing data based on product categories
  const getSizingData = (): SizingRow[] => {
    const isFemale = gender.toLowerCase() === 'feminino';

    if (category.toLowerCase().includes('kimono') || category.toLowerCase() === 'kimonos') {
      if (isFemale) {
        return [
          { size: 'F1', minHeight: 145, maxHeight: 155, minWeight: 40, maxWeight: 50, extraSpecs: { 'Lapela': '145cm', 'Calça': '88cm' } },
          { size: 'F2', minHeight: 152, maxHeight: 165, minWeight: 48, maxWeight: 60, extraSpecs: { 'Lapela': '152cm', 'Calça': '92cm' } },
          { size: 'F3', minHeight: 160, maxHeight: 172, minWeight: 58, maxWeight: 72, extraSpecs: { 'Lapela': '160cm', 'Calça': '96cm' } },
          { size: 'F4', minHeight: 168, maxHeight: 180, minWeight: 70, maxWeight: 85, extraSpecs: { 'Lapela': '168cm', 'Calça': '100cm' } },
        ];
      }
      return [
        { size: 'A0', minHeight: 155, maxHeight: 165, minWeight: 50, maxWeight: 65, extraSpecs: { 'Lapela': '155cm', 'Calça': '90cm' } },
        { size: 'A1', minHeight: 162, maxHeight: 172, minWeight: 60, maxWeight: 75, extraSpecs: { 'Lapela': '162cm', 'Calça': '94cm' } },
        { size: 'A2', minHeight: 170, maxHeight: 182, minWeight: 72, maxWeight: 88, extraSpecs: { 'Lapela': '170cm', 'Calça': '98cm' } },
        { size: 'A3', minHeight: 180, maxHeight: 191, minWeight: 85, maxWeight: 100, extraSpecs: { 'Lapela': '180cm', 'Calça': '102cm' } },
        { size: 'A4', minHeight: 189, maxHeight: 202, minWeight: 98, maxWeight: 115, extraSpecs: { 'Lapela': '189cm', 'Calça': '106cm' } },
        { size: 'A5', minHeight: 198, maxHeight: 210, minWeight: 112, maxWeight: 130, extraSpecs: { 'Lapela': '198cm', 'Calça': '110cm' } },
      ];
    } else if (category.toLowerCase().includes('faixa') || category.toLowerCase() === 'faixas') {
      return [
        { size: 'A0', minHeight: 150, maxHeight: 165, minWeight: 45, maxWeight: 65, extraSpecs: { 'Comprimento': '240cm', 'Costuras': '8 a 10' } },
        { size: 'A1', minHeight: 160, maxHeight: 172, minWeight: 58, maxWeight: 75, extraSpecs: { 'Comprimento': '260cm', 'Costuras': '10 a 12' } },
        { size: 'A2', minHeight: 170, maxHeight: 183, minWeight: 70, maxWeight: 88, extraSpecs: { 'Comprimento': '280cm', 'Costuras': '10 a 12' } },
        { size: 'A3', minHeight: 180, maxHeight: 192, minWeight: 82, maxWeight: 102, extraSpecs: { 'Comprimento': '300cm', 'Costuras': '12' } },
        { size: 'A4', minHeight: 190, maxHeight: 205, minWeight: 95, maxWeight: 118, extraSpecs: { 'Comprimento': '320cm', 'Costuras': '12' } },
        { size: 'A5', minHeight: 200, maxHeight: 215, minWeight: 110, maxWeight: 135, extraSpecs: { 'Comprimento': '340cm', 'Costuras': '12' } },
      ];
    } else {
      // Rashguards / compression shirts / fight shorts / general clothing
      return [
        { size: 'PP / XS', minHeight: 150, maxHeight: 160, minWeight: 45, maxWeight: 55, extraSpecs: { 'Peito/Tórax': '82-88cm', 'Cintura': '70-76cm' } },
        { size: 'P / S', minHeight: 158, maxHeight: 168, minWeight: 52, maxWeight: 65, extraSpecs: { 'Peito/Tórax': '88-94cm', 'Cintura': '76-82cm' } },
        { size: 'M / M', minHeight: 166, maxHeight: 176, minWeight: 62, maxWeight: 78, extraSpecs: { 'Peito/Tórax': '94-102cm', 'Cintura': '82-90cm' } },
        { size: 'G / L', minHeight: 174, maxHeight: 185, minWeight: 75, maxWeight: 92, extraSpecs: { 'Peito/Tórax': '102-110cm', 'Cintura': '90-98cm' } },
        { size: 'GG / XL', minHeight: 182, maxHeight: 194, minWeight: 88, maxWeight: 108, extraSpecs: { 'Peito/Tórax': '110-118cm', 'Cintura': '98-106cm' } },
        { size: 'XG / XXL', minHeight: 190, maxHeight: 205, minWeight: 102, maxWeight: 125, extraSpecs: { 'Peito/Tórax': '118-126cm', 'Cintura': '106-114cm' } },
      ];
    }
  };

  const rows = getSizingData();

  // Populate size options
  const sizeOptions = availableSizes && availableSizes.length > 0 
    ? availableSizes 
    : rows.map(r => r.size);

  // Set default selected size
  useEffect(() => {
    if (sizeOptions.length > 0 && !selectedSize) {
      setSelectedSize(sizeOptions[0]);
    }
  }, [sizeOptions, selectedSize]);

  // Handle calculator / size finder logic
  useEffect(() => {
    const h = parseFloat(heightInput);
    const w = parseFloat(weightInput);

    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      setRecommendedSize(null);
      return;
    }

    // Convert inputs if in imperial system
    const normalizedHeight = unitSystem === 'imperial' ? h * 2.54 : h; // inches to cm
    const normalizedWeight = unitSystem === 'imperial' ? w * 0.453592 : w; // lbs to kg

    // Find the best sizing matches
    let bestMatch: SizingRow | null = null;
    let minDiffScore = Infinity;

    for (const row of rows) {
      // Check if candidate matches height and weight ranges
      const isHeightIn = normalizedHeight >= row.minHeight && normalizedHeight <= row.maxHeight;
      const isWeightIn = normalizedWeight >= row.minWeight && normalizedWeight <= row.maxWeight;

      if (isHeightIn && isWeightIn) {
        // Ideal candidate
        bestMatch = row;
        break;
      }

      // Calculate score based on distance from middle of ranges
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

  // Check if chosen size matches or is unusual compared to recommended size
  const getSizingStatus = () => {
    if (!selectedSize || !recommendedSize) return null;

    const clean = (s: string) => s.trim().toUpperCase().replace(/\s+/g, '');
    const cleanSelected = clean(selectedSize);
    const cleanRecommended = clean(recommendedSize);

    if (cleanSelected === cleanRecommended) {
      return {
        type: 'match' as const,
        title: 'Tamanho Ideal Selecionado!',
        message: `O tamanho ${selectedSize} corresponde perfeitamente à recomendação para a sua estatura corporal de combate.`,
        color: 'border-green-600 bg-green-500/10 text-green-700 dark:text-green-400'
      };
    }

    // Calculate distance in indices in the size list
    const list = rows.map(r => clean(r.size));
    let idxSelected = list.indexOf(cleanSelected);
    let idxRecommended = list.indexOf(cleanRecommended);

    // Partial search fallback
    if (idxSelected === -1) {
      idxSelected = list.findIndex(item => item.includes(cleanSelected) || cleanSelected.includes(item));
    }
    if (idxRecommended === -1) {
      idxRecommended = list.findIndex(item => item.includes(cleanRecommended) || cleanRecommended.includes(item));
    }

    if (idxSelected === -1 || idxRecommended === -1) {
      // Different formats, fallback to a general warning
      return {
        type: 'warning' as const,
        title: 'Aviso de Diferença de Medida',
        message: `O tamanho selecionado (${selectedSize}) é diferente do recomendado (${recommendedSize}). Sugerimos revisar a tabela de medidas.`,
        color: 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400'
      };
    }

    const distance = Math.abs(idxSelected - idxRecommended);

    if (distance === 1) {
      const isLarger = idxSelected > idxRecommended;
      return {
        type: 'warning' as const,
        title: 'Ajuste Fino de Caimento',
        message: `O tamanho selecionado (${selectedSize}) é uma posição adjacente ao recomendado (${recommendedSize}). É uma escolha válida caso prefira um caimento ligeiramente mais ${isLarger ? 'folgado/comprido' : 'justo/atlético'}.`,
        color: 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400'
      };
    } else {
      const isLarger = idxSelected > idxRecommended;
      return {
        type: 'unusual' as const,
        title: '🚨 ALERTA: Tamanho Muito Incomum!',
        message: `Atenção extrema! Você escolheu o tamanho ${selectedSize}, mas o ideal para sua estrutura é o ${recommendedSize}. Há um risco altíssimo de que o item fique extremamente ${isLarger ? 'largo e sobrando tecido' : 'apertado e curto'}. Por favor, confirme as dimensões.`,
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
      const formatToFeet = (inches: number) => {
        const ft = Math.floor(inches / 12);
        const remIn = inches % 12;
        return `${ft}'${remIn}"`;
      };
      return `${formatToFeet(minIn)} - ${formatToFeet(maxIn)}`;
    }
    return `${(minCm / 100).toFixed(2)}m - ${(maxCm / 100).toFixed(2)}m`;
  };

  const formatWeight = (minKg: number, maxKg: number) => {
    if (unitSystem === 'imperial') {
      const minLbs = Math.round(minKg * 2.20462);
      const maxLbs = Math.round(maxKg * 2.20462);
      return `${minLbs} lbs - ${maxLbs} lbs`;
    }
    return `${minKg}kg - ${maxKg}kg`;
  };

  // Skip showing sizing chart for products like supplements, backpacks, or miscellaneous items that aren't wearable sizes.
  const isSizable = category.toLowerCase().includes('kimono') || 
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
    <div className="border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 p-4 font-sans text-left space-y-4">
      {/* Title Header with Switch */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
        <div>
          <span className="text-[9px] font-mono font-black uppercase text-green-600 tracking-wider">Guia de Dimensões Técnico // {brand || 'OSS.OS'}</span>
          <h4 className="text-sm font-black uppercase text-black dark:text-white leading-none mt-1">
            Tabela de Tamanhos ({category})
          </h4>
        </div>

        {/* Toggle units */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-0.5 border border-zinc-200 dark:border-zinc-800 rounded-none shrink-0">
          <button
            onClick={() => { setUnitSystem('metric'); }}
            className={`px-2.5 py-1 text-[8px] font-mono font-black uppercase transition-all rounded-none cursor-pointer ${unitSystem === 'metric' ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            Métrico (cm/kg)
          </button>
          <button
            onClick={() => { setUnitSystem('imperial'); }}
            className={`px-2.5 py-1 text-[8px] font-mono font-black uppercase transition-all rounded-none cursor-pointer ${unitSystem === 'imperial' ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            Imperial (in/lb)
          </button>
        </div>
      </div>

      {/* 1. Size Selection Field */}
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

      {/* 2. Sizing Interactive Calculator Finder */}
      <div className="bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200/60 dark:border-zinc-800 p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-green-600 dark:text-green-400 animate-pulse" />
            <span className="text-[9.5px] font-mono font-black text-green-600 dark:text-green-400 uppercase tracking-wider">
              Smart Finder (Encontrar meu Tamanho)
            </span>
          </div>
          
          <span className="text-[8px] font-mono text-zinc-400 dark:text-zinc-500 uppercase">Validador de Medida</span>
        </div>
        
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight font-light">
          Insira sua altura e peso reais para que o sistema técnico verifique a compatibilidade física do tamanho selecionado.
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

        {/* 3. Alerts and Dynamic Warnings Area */}
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
                Insira sua altura e peso acima para validar se o tamanho <strong className="text-black dark:text-white font-black">{selectedSize}</strong> é o mais adequado.
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
                  * Dica: Verifique a tabela de correspondência detalhada abaixo antes de prosseguir com a compra.
                </p>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Grid Sizing Table */}
      <div id="product-detail-modal-size-chart" className="overflow-x-auto border border-zinc-150 dark:border-zinc-850">
        <table className="w-full text-left border-collapse text-[10px] font-mono">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-150 dark:border-zinc-850 text-[8px] font-black text-zinc-400 uppercase tracking-widest">
              <th className="p-2 border-r border-zinc-150 dark:border-zinc-850">Tam</th>
              <th className="p-2 border-r border-zinc-150 dark:border-zinc-850">Altura</th>
              <th className="p-2 border-r border-zinc-150 dark:border-zinc-850">Peso</th>
              {rows[0]?.extraSpecs && Object.keys(rows[0].extraSpecs).map(key => (
                <th key={key} className="p-2">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isMatch = recommendedSize === row.size;
              const isSelected = selectedSize === row.size;
              return (
                <tr 
                  key={row.size} 
                  className={`border-b border-zinc-100 dark:border-zinc-900 transition-all even:bg-zinc-50/40 dark:even:bg-zinc-900/30 ${
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
                  {row.extraSpecs && Object.entries(row.extraSpecs).map(([key, val]) => (
                    <td key={key} className="p-2 font-light">{val}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Sizing Footnote Advice */}
      <p className="text-[9px] leading-relaxed text-zinc-400 font-mono italic">
        * Nota de Encolhimento: Kimonos 100% algodão sofrem encolhimento térmico natural de 3% a 5% se lavados com água quente ou secados à máquina. Se você estiver no limite superior da faixa de peso/altura de um tamanho, recomendamos selecionar o tamanho imediatamente acima.
      </p>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Calendar,
  DollarSign,
  Tag,
  Flame,
  Clock,
  Filter,
  Eye,
  Percent,
} from 'lucide-react';
import { PricePoint, Product } from '../types';

interface PriceHistoryChartProps {
  data?: PricePoint[];
  product?: Product;
  targetPrice?: number;
  height?: number | string;
  compact?: boolean;
}

const STORE_COLORS: Record<string, string> = {
  'Amazon': '#f97316',          // Orange
  'Amazon Brasil': '#f97316',   // Orange
  'Mercado Livre': '#eab308',   // Yellow/Amber
  'Mercado Livre Importados': '#eab308',
  'Shopee': '#ef4444',          // Red
  'Centauro': '#e11d48',        // Rose
  'Netshoes': '#8b5cf6',        // Purple
  'Shein': '#ec4899',           // Pink
  'TikTok Shop': '#06b6d4',     // Cyan
  'Decathlon': '#0284c7',       // Blue
  'Growth': '#22c55e',          // Green
  'Venum': '#dc2626',           // Deep Red
  'KVRA': '#a855f7',           // Purple
  'Jiujiteiro Official Store': '#10b981', // Emerald
};

const FALLBACK_COLORS = ['#22c55e', '#eab308', '#3b82f6', '#ec4899', '#8b5cf6', '#f97316'];

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  data,
  product,
  targetPrice,
  height = 280,
  compact = false,
}) => {
  const [timeframe, setTimeframe] = useState<'30' | '60' | '90'>('90');
  const [chartType, setChartType] = useState<'area' | 'line'>('area');
  const [hiddenStores, setHiddenStores] = useState<Set<string>>(new Set());

  // Merge priceHistory from data prop or product prop, or fallback to default dataset
  const rawHistory: PricePoint[] = useMemo(() => {
    if (data && data.length > 0) return data;
    if (product && product.priceHistory && product.priceHistory.length > 0) return product.priceHistory;

    // Default 90-day generated data if product has no history
    const basePrice = product?.price || 499.90;
    const storeName = product?.platform || 'Mercado Livre';
    
    return [
      { date: '90d atrás', [storeName]: Math.round(basePrice * 1.18), Amazon: Math.round(basePrice * 1.22) },
      { date: '75d atrás', [storeName]: Math.round(basePrice * 1.15), Amazon: Math.round(basePrice * 1.19) },
      { date: '60d atrás', [storeName]: Math.round(basePrice * 1.10), Amazon: Math.round(basePrice * 1.14) },
      { date: '45d atrás', [storeName]: Math.round(basePrice * 1.08), Amazon: Math.round(basePrice * 1.12), isPromo: true },
      { date: '30d atrás', [storeName]: Math.round(basePrice * 1.05), Amazon: Math.round(basePrice * 1.08) },
      { date: '15d atrás', [storeName]: Math.round(basePrice * 1.02), Amazon: Math.round(basePrice * 1.05) },
      { date: 'Hoje', [storeName]: basePrice, Amazon: Math.round(basePrice * 1.03), isPromo: true },
    ];
  }, [data, product]);

  // Extract all store keys (excluding 'date' and 'isPromo')
  const storeKeys = useMemo(() => {
    const keysSet = new Set<string>();
    rawHistory.forEach(point => {
      Object.keys(point).forEach(k => {
        if (k !== 'date' && k !== 'isPromo') {
          keysSet.add(k);
        }
      });
    });
    // If no store key exists, default to 'Preço'
    if (keysSet.size === 0) {
      keysSet.add('Preço');
    }
    return Array.from(keysSet);
  }, [rawHistory]);

  // Filter history based on timeframe (30d, 60d, 90d)
  const filteredHistory = useMemo(() => {
    const total = rawHistory.length;
    if (total <= 3) return rawHistory;

    if (timeframe === '30') {
      return rawHistory.slice(Math.max(0, total - 4));
    } else if (timeframe === '60') {
      return rawHistory.slice(Math.max(0, total - 6));
    }
    return rawHistory; // 90 days
  }, [rawHistory, timeframe]);

  // Metrics computation across active stores
  const metrics = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    let count = 0;

    filteredHistory.forEach(point => {
      storeKeys.forEach(store => {
        if (hiddenStores.has(store)) return;
        const val = point[store];
        if (typeof val === 'number') {
          if (val < min) min = val;
          if (val > max) max = val;
          sum += val;
          count++;
        }
      });
    });

    if (min === Infinity) min = product?.price || 0;
    if (max === -Infinity) max = product?.price || 0;
    const avg = count > 0 ? sum / count : min;

    // Recent trend calculation
    const firstPoint = filteredHistory[0];
    const lastPoint = filteredHistory[filteredHistory.length - 1];
    
    let firstVal = 0;
    let lastVal = 0;
    const activeStores = storeKeys.filter(s => !hiddenStores.has(s));
    const mainStore = activeStores[0] || storeKeys[0];

    if (firstPoint && typeof firstPoint[mainStore] === 'number') firstVal = Number(firstPoint[mainStore]);
    if (lastPoint && typeof lastPoint[mainStore] === 'number') lastVal = Number(lastPoint[mainStore]);

    const diff = lastVal - firstVal;
    const pctChange = firstVal > 0 ? (diff / firstVal) * 100 : 0;

    let trendType: 'down' | 'up' | 'stable' = 'stable';
    if (pctChange < -1) trendType = 'down';
    else if (pctChange > 1) trendType = 'up';

    const maxDiscountPct = max > min ? Math.round(((max - min) / max) * 100) : 0;

    return {
      min,
      max,
      avg,
      lastVal: lastVal || product?.price || min,
      diff,
      pctChange,
      trendType,
      maxDiscountPct,
    };
  }, [filteredHistory, storeKeys, hiddenStores, product]);

  const toggleStore = (store: string) => {
    setHiddenStores(prev => {
      const next = new Set(prev);
      if (next.has(store)) {
        if (next.size < storeKeys.length - 1) {
          next.delete(store);
        }
      } else {
        if (next.size < storeKeys.length - 1) {
          next.add(store);
        }
      }
      return next;
    });
  };

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pointData = payload[0]?.payload;
      return (
        <div className="bg-black/95 border-2 border-zinc-800 p-3 shadow-2xl rounded-none font-mono text-white text-xs space-y-2 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
            <span className="text-zinc-400 font-bold text-[10px] uppercase flex items-center gap-1">
              <Calendar size={11} className="text-green-500" />
              Data: {label}
            </span>
            {pointData?.isPromo && (
              <span className="bg-red-600 text-white font-black text-[9px] uppercase px-1.5 py-0.5 animate-pulse">
                PROMOÇÃO
              </span>
            )}
          </div>

          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={`tooltip-store-${index}`} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-zinc-300 text-[11px]">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}:
                </span>
                <span className="font-bold text-green-400">
                  R$ {Number(entry.value).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {metrics.max > Number(payload[0]?.value) && (
            <div className="border-t border-zinc-800/80 pt-1 text-[9px] text-zinc-400 text-right">
              Economia de R$ {(metrics.max - Number(payload[0]?.value)).toFixed(2)} vs pico
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`w-full bg-zinc-950 text-white border border-zinc-900 ${compact ? 'p-3' : 'p-4 sm:p-5'} space-y-4`}>
      {/* Top Bar: Title & 90-Day Trend Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-green-500/10 border border-green-500/30 text-green-400">
            <Clock size={16} />
          </div>
          <div>
            <h4 className="text-xs font-mono font-black uppercase tracking-wider text-white flex items-center gap-2">
              Histórico de Preços (90 Dias)
              <span className="text-[9px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-none font-normal">
                Interativo
              </span>
            </h4>
            <p className="text-[10px] font-mono text-zinc-400">
              Acompanhamento em tempo real das variações no mercado BJJ
            </p>
          </div>
        </div>

        {/* Timeframe Controls (30D, 60D, 90D) */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 border border-zinc-800">
          {(['30', '60', '90'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                timeframe === t
                  ? 'bg-green-600 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t} Dias
            </button>
          ))}
        </div>
      </div>

      {/* Key Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
        {/* Menor Preço */}
        <div className="bg-zinc-900/60 p-2.5 border border-zinc-800/80">
          <span className="text-[9px] text-zinc-400 uppercase font-semibold block">Menor Preço 90D</span>
          <span className="text-base font-black text-green-400 block">
            R$ {metrics.min.toFixed(2)}
          </span>
          {metrics.maxDiscountPct > 0 && (
            <span className="text-[8px] text-green-500 font-bold flex items-center gap-0.5 mt-0.5">
              <Percent size={10} /> -{metrics.maxDiscountPct}% vs Pico
            </span>
          )}
        </div>

        {/* Maior Preço */}
        <div className="bg-zinc-900/60 p-2.5 border border-zinc-800/80">
          <span className="text-[9px] text-zinc-400 uppercase font-semibold block">Maior Preço 90D</span>
          <span className="text-base font-black text-zinc-300 block">
            R$ {metrics.max.toFixed(2)}
          </span>
          <span className="text-[8px] text-zinc-500 font-medium block mt-0.5">Pico Registrado</span>
        </div>

        {/* Preço Médio */}
        <div className="bg-zinc-900/60 p-2.5 border border-zinc-800/80">
          <span className="text-[9px] text-zinc-400 uppercase font-semibold block">Preço Médio</span>
          <span className="text-base font-black text-amber-400 block">
            R$ {metrics.avg.toFixed(2)}
          </span>
          <span className="text-[8px] text-zinc-500 font-medium block mt-0.5">Média do Período</span>
        </div>

        {/* Tendência Recente */}
        <div className="bg-zinc-900/60 p-2.5 border border-zinc-800/80">
          <span className="text-[9px] text-zinc-400 uppercase font-semibold block">Tendência Recente</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {metrics.trendType === 'down' ? (
              <span className="text-green-400 font-black text-xs flex items-center gap-1">
                <TrendingDown size={14} strokeWidth={3} />
                EM QUEDA ({metrics.pctChange.toFixed(1)}%)
              </span>
            ) : metrics.trendType === 'up' ? (
              <span className="text-red-400 font-black text-xs flex items-center gap-1">
                <TrendingUp size={14} strokeWidth={3} />
                EM ALTA (+{metrics.pctChange.toFixed(1)}%)
              </span>
            ) : (
              <span className="text-zinc-400 font-black text-xs flex items-center gap-1">
                <Minus size={14} strokeWidth={3} />
                ESTÁVEL
              </span>
            )}
          </div>
          <span className="text-[8px] text-zinc-500 font-medium block mt-0.5">Variação do período</span>
        </div>
      </div>

      {/* Store Filter Pills */}
      {storeKeys.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase mr-1 flex items-center gap-1">
            <Filter size={11} /> Lojas:
          </span>
          {storeKeys.map((store, i) => {
            const isHidden = hiddenStores.has(store);
            const storeColor = STORE_COLORS[store] || FALLBACK_COLORS[i % FALLBACK_COLORS.length];
            return (
              <button
                key={store}
                onClick={() => toggleStore(store)}
                className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase border transition-all cursor-pointer flex items-center gap-1 ${
                  !isHidden
                    ? 'bg-zinc-900 text-white border-zinc-700'
                    : 'bg-zinc-950 text-zinc-600 border-zinc-900 opacity-50 line-through'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: !isHidden ? storeColor : '#52525b' }}
                />
                {store}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Dynamic Recharts Canvas */}
      <div className="w-full relative pt-2" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={filteredHistory} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
              <defs>
                {storeKeys.map((store, i) => {
                  const color = STORE_COLORS[store] || FALLBACK_COLORS[i % FALLBACK_COLORS.length];
                  return (
                    <linearGradient key={`grad-${store}`} id={`color-${store}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.5} />
              <XAxis
                dataKey="date"
                stroke="#71717a"
                fontSize={9}
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
                tick={{ fontWeight: 700, fill: '#a1a1aa' }}
              />
              <YAxis
                orientation="left"
                stroke="#71717a"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `R$${Math.round(val)}`}
                domain={['auto', 'auto']}
                tick={{ fontWeight: 700, fill: '#a1a1aa' }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {targetPrice && (
                <ReferenceLine
                  y={targetPrice}
                  stroke="#eab308"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `ALERTA: R$ ${targetPrice}`,
                    fill: '#eab308',
                    fontSize: 9,
                    fontWeight: 800,
                    position: 'insideTopLeft',
                  }}
                />
              )}

              {storeKeys
                .filter(s => !hiddenStores.has(s))
                .map((store, i) => {
                  const color = STORE_COLORS[store] || FALLBACK_COLORS[i % FALLBACK_COLORS.length];
                  return (
                    <Area
                      key={store}
                      type="monotone"
                      dataKey={store}
                      name={store}
                      stroke={color}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill={`url(#color-${store})`}
                      isAnimationActive={true}
                    />
                  );
                })}
            </AreaChart>
          ) : (
            <LineChart data={filteredHistory} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.5} />
              <XAxis
                dataKey="date"
                stroke="#71717a"
                fontSize={9}
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
                tick={{ fontWeight: 700, fill: '#a1a1aa' }}
              />
              <YAxis
                orientation="left"
                stroke="#71717a"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `R$${Math.round(val)}`}
                domain={['auto', 'auto']}
                tick={{ fontWeight: 700, fill: '#a1a1aa' }}
              />
              <Tooltip content={<CustomTooltip />} />
              {storeKeys
                .filter(s => !hiddenStores.has(s))
                .map((store, i) => {
                  const color = STORE_COLORS[store] || FALLBACK_COLORS[i % FALLBACK_COLORS.length];
                  return (
                    <Line
                      key={store}
                      type="monotone"
                      dataKey={store}
                      name={store}
                      stroke={color}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: color }}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                      isAnimationActive={true}
                    />
                  );
                })}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer info banner */}
      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 border-t border-zinc-900 pt-2">
        <span className="flex items-center gap-1">
          <Flame size={12} className="text-amber-400 animate-pulse" />
          Preços checados diariamente em Mercado Livre, Amazon, Shopee e parceiros
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartType(prev => prev === 'area' ? 'line' : 'area')}
            className="hover:text-white underline cursor-pointer"
          >
            Modo: {chartType === 'area' ? 'Área Sombreada' : 'Linhas'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceHistoryChart;

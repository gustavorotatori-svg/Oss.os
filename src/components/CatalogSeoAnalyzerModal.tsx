import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, TrendingUp, Search, Check, CheckCircle2, 
  ArrowRight, Tag, Flame, RefreshCw, Copy, FileText, 
  AlertCircle, X, ChevronDown, ChevronUp, Download, 
  Edit3, Save, Zap, HelpCircle, BarChart3, Filter
} from 'lucide-react';
import { Product, ProductSeoAnalysis, Category } from '../types';

export interface CatalogSeoAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  initialSelectedProductId?: string | null;
  onUpdateProduct: (updatedProduct: Product) => void | Promise<void>;
  onBatchUpdateProducts?: (updatedProducts: Product[]) => void | Promise<void>;
  addToast?: (toast: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => void;
}

export const CatalogSeoAnalyzerModal: React.FC<CatalogSeoAnalyzerModalProps> = ({
  isOpen,
  onClose,
  products = [],
  initialSelectedProductId = null,
  onUpdateProduct,
  onBatchUpdateProducts,
  addToast
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [filterQuery, setFilterQuery] = useState('');
  const [onlyLowScore, setOnlyLowScore] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysesMap, setAnalysesMap] = useState<Record<string, ProductSeoAnalysis>>({});
  const [appliedProductIds, setAppliedProductIds] = useState<Set<string>>(new Set());
  const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(new Set());
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [customTitles, setCustomTitles] = useState<Record<string, string>>({});
  const [customDescriptions, setCustomDescriptions] = useState<Record<string, string>>({});
  const [analysisProgress, setAnalysisProgress] = useState<{ current: number; total: number } | null>(null);

  // Initialize existing analyses stored on products or auto-run on open
  useEffect(() => {
    if (!isOpen) return;

    const initialMap: Record<string, ProductSeoAnalysis> = {};
    products.forEach(p => {
      if (p.seoAnalysis) {
        initialMap[p.id] = p.seoAnalysis;
      }
    });

    setAnalysesMap(prev => ({ ...initialMap, ...prev }));

    if (initialSelectedProductId) {
      setExpandedProductIds(new Set([initialSelectedProductId]));
    }
  }, [isOpen, initialSelectedProductId, products]);

  // Filter products based on search, category and score
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (filterQuery) {
        const q = filterQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchBrand = (p.brand || '').toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        if (!matchTitle && !matchBrand && !matchDesc) return false;
      }
      if (onlyLowScore) {
        const score = analysesMap[p.id]?.seoScore || p.seoScore || 60;
        if (score >= 75) return false;
      }
      return true;
    });
  }, [products, selectedCategory, filterQuery, onlyLowScore, analysesMap]);

  // Overall catalog SEO stats
  const catalogStats = useMemo(() => {
    const total = products.length;
    if (total === 0) return { avgScore: 0, potentialAvg: 0, pendingCount: 0, totalKeywords: 0 };

    let totalScore = 0;
    let totalPotential = 0;
    let analyzedCount = 0;
    const allKeywords = new Set<string>();

    products.forEach(p => {
      const a = analysesMap[p.id] || p.seoAnalysis;
      if (a) {
        totalScore += a.seoScore;
        totalPotential += a.potentialSeoScore;
        analyzedCount++;
        a.primaryKeywords.forEach(k => allKeywords.add(k.toLowerCase()));
        a.longTailKeywords.forEach(k => allKeywords.add(k.toLowerCase()));
      } else {
        totalScore += 55; // default estimation
        totalPotential += 92;
      }
    });

    const avgScore = Math.round(totalScore / total);
    const potentialAvg = Math.round(totalPotential / total);
    const pendingCount = total - appliedProductIds.size;

    return {
      avgScore,
      potentialAvg,
      pendingCount,
      totalKeywords: allKeywords.size || total * 4
    };
  }, [products, analysesMap, appliedProductIds]);

  // API caller to analyze a list of products in batches of 6
  const handleAnalyzeProducts = async (productsToProcess: Product[]) => {
    if (productsToProcess.length === 0) return;
    setIsAnalyzing(true);
    const totalToProcess = productsToProcess.length;
    setAnalysisProgress({ current: 0, total: totalToProcess });

    try {
      const batchSize = 6;
      const updatedAnalyses: Record<string, ProductSeoAnalysis> = {};

      for (let i = 0; i < productsToProcess.length; i += batchSize) {
        const batch = productsToProcess.slice(i, i + batchSize);
        setAnalysisProgress({ current: i, total: totalToProcess });

        const payload = {
          products: batch.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            category: p.category,
            brand: p.brand,
            tags: p.tags,
            price: p.price
          }))
        };

        const res = await fetch('/api/ai/seo-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          throw new Error(`Erro na análise de SEO: status ${res.status}`);
        }

        const data = await res.json();
        if (Array.isArray(data.analyses)) {
          data.analyses.forEach((analysis: ProductSeoAnalysis) => {
            updatedAnalyses[analysis.productId] = analysis;
          });
        }
      }

      setAnalysesMap(prev => ({ ...prev, ...updatedAnalyses }));
      setAnalysisProgress({ current: totalToProcess, total: totalToProcess });

      // Automatically expand the first 2 products for review
      const firstIds = productsToProcess.slice(0, 2).map(p => p.id);
      setExpandedProductIds(prev => new Set([...prev, ...firstIds]));

      addToast?.({
        title: 'Auditoria de SEO Concluída!',
        description: `${totalToProcess} produtos foram analisados com sugestões de palavras-chave prontas para ranqueamento.`
      });
    } catch (err: any) {
      console.error('Falha ao analisar SEO:', err);
      addToast?.({
        title: 'Falha na Auditoria',
        description: err.message || 'Não foi possível completar a análise de SEO com a IA.',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setAnalysisProgress(null), 1200);
    }
  };

  // Apply SEO suggestions to a single product
  const handleApplySingleSeo = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    const analysis = analysesMap[productId];
    if (!product || !analysis) return;

    const finalTitle = customTitles[productId] || analysis.suggestedTitle || product.title;
    const finalDescription = customDescriptions[productId] || analysis.suggestedDescription || product.description;

    const combinedKeywords = Array.from(new Set([
      ...(analysis.primaryKeywords || []),
      ...(analysis.secondaryKeywords || []),
      ...(product.tags || [])
    ]));

    const updatedProduct: Product = {
      ...product,
      title: finalTitle,
      description: finalDescription,
      tags: combinedKeywords,
      seoKeywords: combinedKeywords,
      seoOptimizedTitle: finalTitle,
      seoOptimizedDescription: finalDescription,
      seoScore: analysis.potentialSeoScore || 95,
      seoSearchIntent: analysis.searchIntent,
      seoAnalysis: analysis
    };

    try {
      await onUpdateProduct(updatedProduct);
      setAppliedProductIds(prev => new Set([...prev, productId]));
      setEditingProductId(null);

      addToast?.({
        title: 'SEO Aplicado!',
        description: `Título e descrição de "${product.title.slice(0, 30)}..." foram otimizados com sucesso.`
      });
    } catch (error) {
      console.error('Erro ao atualizar produto com SEO:', error);
      addToast?.({
        title: 'Erro ao Aplicar',
        description: 'Falha ao salvar as modificações de SEO no produto.',
        variant: 'destructive'
      });
    }
  };

  // Batch apply suggestions to all currently filtered and analyzed products
  const handleBatchApply = async () => {
    const productsToApply: Product[] = [];

    filteredProducts.forEach(product => {
      const analysis = analysesMap[product.id];
      if (!analysis) return;

      const finalTitle = customTitles[product.id] || analysis.suggestedTitle || product.title;
      const finalDescription = customDescriptions[product.id] || analysis.suggestedDescription || product.description;
      const combinedKeywords = Array.from(new Set([
        ...(analysis.primaryKeywords || []),
        ...(analysis.secondaryKeywords || []),
        ...(product.tags || [])
      ]));

      productsToApply.push({
        ...product,
        title: finalTitle,
        description: finalDescription,
        tags: combinedKeywords,
        seoKeywords: combinedKeywords,
        seoOptimizedTitle: finalTitle,
        seoOptimizedDescription: finalDescription,
        seoScore: analysis.potentialSeoScore || 95,
        seoSearchIntent: analysis.searchIntent,
        seoAnalysis: analysis
      });
    });

    if (productsToApply.length === 0) {
      addToast?.({
        title: 'Nenhum produto pronto',
        description: 'Execute primeiro a auditoria de SEO nos produtos antes de aplicar em lote.'
      });
      return;
    }

    try {
      if (onBatchUpdateProducts) {
        await onBatchUpdateProducts(productsToApply);
      } else {
        for (const p of productsToApply) {
          await onUpdateProduct(p);
        }
      }

      const appliedIds = productsToApply.map(p => p.id);
      setAppliedProductIds(prev => new Set([...prev, ...appliedIds]));

      addToast?.({
        title: 'Otimização em Massa Concluída!',
        description: `${productsToApply.length} produtos foram atualizados com títulos, descrições e palavras-chave de alto ranqueamento.`
      });
    } catch (err) {
      console.error('Falha na aplicação em lote:', err);
      addToast?.({
        title: 'Erro no Batch Update',
        description: 'Ocorreu um erro ao atualizar os produtos em lote.',
        variant: 'destructive'
      });
    }
  };

  // Export full SEO audit as JSON
  const handleExportJson = () => {
    const exportData = products.map(p => {
      const a = analysesMap[p.id];
      return {
        id: p.id,
        currentTitle: p.title,
        suggestedTitle: a?.suggestedTitle || 'N/A',
        currentDescription: p.description,
        suggestedDescription: a?.suggestedDescription || 'N/A',
        category: p.category,
        brand: p.brand,
        currentSeoScore: a?.seoScore || p.seoScore || 60,
        potentialSeoScore: a?.potentialSeoScore || 95,
        primaryKeywords: a?.primaryKeywords || [],
        longTailKeywords: a?.longTailKeywords || [],
        missingKeywords: a?.missingKeywords || [],
        searchIntent: a?.searchIntent || 'Transacional',
        analyzedAt: a?.analyzedAt || new Date().toISOString()
      };
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bjj-catalogo-seo-audit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    addToast?.({
      title: 'Relatório Exportado',
      description: 'Auditoria de palavras-chave e SEO baixada em formato JSON.'
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast?.({
      title: 'Copiado!',
      description: `${label} copiado para a área de transferência.`
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        className="bg-white dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl relative font-sans overflow-hidden"
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center font-mono font-black shadow-md shrink-0">
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-black dark:text-white font-mono">
                  Otimizador de Palavras-Chave & SEO do Catálogo
                </h2>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-black border border-blue-300 dark:border-blue-800 flex items-center gap-1">
                  <Sparkles size={10} className="text-blue-500 animate-spin" />
                  GEMINI 3.8 FLASH
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Audite títulos e descrições do acervo com IA para dominar buscas orgânicas no Google e Marketplaces.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Exportar auditoria completa em JSON"
            >
              <Download size={14} />
              <span className="hidden md:inline">Exportar JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              title="Fechar Janela"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* METRICS OVERVIEW BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs shrink-0">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold">SEO Score Médio</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-xl font-mono font-black ${
                catalogStats.avgScore >= 80 ? 'text-green-600' : catalogStats.avgScore >= 65 ? 'text-amber-500' : 'text-red-500'
              }`}>
                {catalogStats.avgScore}/100
              </span>
              <span className="text-green-600 font-mono font-bold text-[11px] flex items-center">
                ➔ {catalogStats.potentialAvg} max
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5">Potencial de +{catalogStats.potentialAvg - catalogStats.avgScore} pts</span>
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold">Keywords Estratégicas</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-mono font-black text-blue-600 dark:text-blue-400">
                {catalogStats.totalKeywords}
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">termos de busca</span>
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5">Mapeadas no nicho BJJ</span>
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold">Auditorias Prontas</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-mono font-black text-black dark:text-white">
                {Object.keys(analysesMap).length}
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">de {products.length} itens</span>
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5">{appliedProductIds.size} atualizados</span>
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold">Ação Global</span>
            <button
              onClick={handleBatchApply}
              disabled={Object.keys(analysesMap).length === 0}
              className="mt-1 w-full py-1.5 px-2 bg-green-600 hover:bg-green-500 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 text-black font-mono text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            >
              <CheckCircle2 size={12} />
              Aplicar Todas ({Object.keys(analysesMap).length})
            </button>
            <span className="text-[10px] text-zinc-400 text-center mt-0.5">Sincroniza com Firestore</span>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="p-3 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-900/40 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between shrink-0">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text"
                placeholder="Filtrar por produto, marca ou kimono..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-black dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category | 'All')}
              className="py-1.5 px-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-black dark:text-white cursor-pointer"
            >
              <option value="All">Todas Categorias</option>
              <option value="Kimonos">Kimonos</option>
              <option value="Rashguards">Rashguards</option>
              <option value="Faixas">Faixas</option>
              <option value="Bermudas">Bermudas</option>
              <option value="Nutrição Esportiva">Nutrição</option>
              <option value="Acessórios">Acessórios</option>
            </select>

            {/* Low Score Toggle */}
            <button
              onClick={() => setOnlyLowScore(!onlyLowScore)}
              className={`px-3 py-1.5 border text-xs font-mono font-bold transition-all cursor-pointer ${
                onlyLowScore 
                  ? 'bg-amber-600 text-white border-amber-600' 
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700'
              }`}
            >
              Apenas SEO &lt; 75
            </button>
          </div>

          {/* Trigger Full Audit Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleAnalyzeProducts(filteredProducts)}
              disabled={isAnalyzing || filteredProducts.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <RefreshCw size={14} className={isAnalyzing ? 'animate-spin' : ''} />
              <span>{isAnalyzing ? 'Auditoria em Andamento...' : `Analisar Filtro (${filteredProducts.length}) com IA`}</span>
            </button>
          </div>
        </div>

        {/* PROGRESS BAR IF ANALYZING */}
        {analysisProgress && (
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 relative overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${Math.round((analysisProgress.current / Math.max(1, analysisProgress.total)) * 100)}%` }}
            />
          </div>
        )}

        {/* MAIN AUDIT PRODUCT LIST */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-8 space-y-3">
              <Search size={32} className="mx-auto text-zinc-400" />
              <h3 className="font-mono text-sm font-black uppercase text-black dark:text-white">
                Nenhum produto encontrado com os filtros atuais
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Tente redefinir a busca ou limpar a seleção de categoria para visualizar outros itens do acervo.
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const analysis = analysesMap[product.id];
              const isExpanded = expandedProductIds.has(product.id);
              const isApplied = appliedProductIds.has(product.id);
              const isEditing = editingProductId === product.id;
              const currentScore = analysis?.seoScore || product.seoScore || 54;
              const potentialScore = analysis?.potentialSeoScore || 95;

              return (
                <div 
                  key={product.id}
                  className={`border-2 transition-all ${
                    isApplied 
                      ? 'border-green-600 bg-green-50/20 dark:bg-green-950/10' 
                      : analysis 
                        ? 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/60' 
                        : 'border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950'
                  }`}
                >
                  {/* CARD SUMMARY HEADER ROW */}
                  <div className="p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Product Thumbnail */}
                      <img 
                        src={product.imageUrl} 
                        alt={product.title} 
                        className="w-12 h-12 sm:w-14 sm:h-14 object-cover border border-zinc-200 dark:border-zinc-700 shrink-0 bg-white"
                        referrerPolicy="no-referrer"
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-700">
                            {product.category}
                          </span>
                          {product.brand && (
                            <span className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">
                              {product.brand}
                            </span>
                          )}
                          {isApplied && (
                            <span className="text-[10px] font-mono font-black text-green-600 dark:text-green-400 flex items-center gap-1">
                              <Check size={12} className="stroke-[3px]" />
                              OTIMIZADO
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-black dark:text-white truncate max-w-lg mt-0.5">
                          {product.title}
                        </h4>
                      </div>
                    </div>

                    {/* Score Badges & Quick Action Controls */}
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                      {/* SEO Score Visual */}
                      <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 border border-zinc-200 dark:border-zinc-700">
                        <div className="text-right font-mono">
                          <span className="text-[9px] uppercase text-zinc-500 block leading-none">Score</span>
                          <span className={`text-xs font-black ${
                            currentScore >= 80 ? 'text-green-600' : currentScore >= 65 ? 'text-amber-500' : 'text-red-500'
                          }`}>
                            {currentScore}
                          </span>
                          <span className="text-[10px] text-zinc-400"> ➔ </span>
                          <span className="text-xs font-black text-green-600">
                            {potentialScore}
                          </span>
                        </div>
                      </div>

                      {/* Analyze Single Button */}
                      {!analysis && (
                        <button
                          onClick={() => handleAnalyzeProducts([product])}
                          disabled={isAnalyzing}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles size={12} />
                          <span>Analisar</span>
                        </button>
                      )}

                      {/* Apply Button */}
                      {analysis && !isApplied && (
                        <button
                          onClick={() => handleApplySingleSeo(product.id)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-black font-mono text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                        >
                          <Check size={14} className="stroke-[3px]" />
                          <span>Aplicar</span>
                        </button>
                      )}

                      {/* Expand/Collapse Toggle */}
                      <button
                        onClick={() => toggleExpand(product.id)}
                        className="p-1.5 text-zinc-400 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                        title={isExpanded ? 'Recolher detalhes' : 'Ver detalhes da auditoria'}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDED CONTENT VIEW */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 sm:p-6 bg-zinc-50/70 dark:bg-zinc-950/60 border-t border-zinc-200 dark:border-zinc-800 space-y-5 text-xs font-sans"
                      >
                        {!analysis ? (
                          <div className="py-8 text-center space-y-3">
                            <Sparkles size={24} className="mx-auto text-blue-500 animate-pulse" />
                            <p className="text-xs text-zinc-500 font-mono">
                              Este produto ainda não foi auditado pelo motor de palavras-chave.
                            </p>
                            <button
                              onClick={() => handleAnalyzeProducts([product])}
                              disabled={isAnalyzing}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
                            >
                              <Sparkles size={14} />
                              Executar Auditoria de Palavras-chave com IA
                            </button>
                          </div>
                        ) : (
                          <>
                            {/* COMPARATIVE SECTION: TITLES */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                                  <Tag size={13} className="text-blue-500" />
                                  1. Comparativo de Título (SEO Title Tag)
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setEditingProductId(isEditing ? null : product.id)}
                                    className="text-[10px] font-mono text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 underline cursor-pointer"
                                  >
                                    <Edit3 size={11} />
                                    {isEditing ? 'Cancelar Edição' : 'Personalizar Texto'}
                                  </button>
                                  <button
                                    onClick={() => copyToClipboard(customTitles[product.id] || analysis.suggestedTitle, 'Título Otimizado')}
                                    className="text-[10px] font-mono text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
                                    title="Copiar título sugerido"
                                  >
                                    <Copy size={11} />
                                    Copiar
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Current Title */}
                                <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 block">
                                    Título Atual ({product.title.length} caracteres)
                                  </span>
                                  <p className="text-zinc-600 dark:text-zinc-400 font-sans line-through decoration-red-500/50">
                                    {product.title}
                                  </p>
                                </div>

                                {/* Suggested Title */}
                                <div className="p-3 bg-green-50/50 dark:bg-green-950/20 border-2 border-green-500/40 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono font-bold uppercase text-green-700 dark:text-green-400 block">
                                      ✨ Título Otimizado para Busca ({analysis.suggestedTitle.length} caracteres)
                                    </span>
                                    <span className="text-[9px] font-mono text-green-600 font-black">CTR Otimizado</span>
                                  </div>

                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={customTitles[product.id] ?? analysis.suggestedTitle}
                                      onChange={(e) => setCustomTitles(prev => ({ ...prev, [product.id]: e.target.value }))}
                                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-green-500 font-sans text-xs text-black dark:text-white focus:outline-none"
                                    />
                                  ) : (
                                    <p className="text-black dark:text-white font-medium font-sans">
                                      {customTitles[product.id] || analysis.suggestedTitle}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* COMPARATIVE SECTION: DESCRIPTIONS */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                                  <FileText size={13} className="text-blue-500" />
                                  2. Descrição Enriquecida & Copywriting
                                </span>
                                <button
                                  onClick={() => copyToClipboard(customDescriptions[product.id] || analysis.suggestedDescription, 'Descrição Otimizada')}
                                  className="text-[10px] font-mono text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
                                  title="Copiar descrição sugerida"
                                >
                                  <Copy size={11} />
                                  Copiar
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1 max-h-48 overflow-y-auto">
                                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 block">
                                    Descrição Original ({product.description.length} caracteres)
                                  </span>
                                  <p className="text-zinc-600 dark:text-zinc-400 text-xs whitespace-pre-line">
                                    {product.description}
                                  </p>
                                </div>

                                <div className="p-3 bg-green-50/50 dark:bg-green-950/20 border-2 border-green-500/40 space-y-1 max-h-48 overflow-y-auto">
                                  <span className="text-[10px] font-mono font-bold uppercase text-green-700 dark:text-green-400 block">
                                    ✨ Descrição Otimizada (Com Especificações e Chamada para Ação)
                                  </span>
                                  {isEditing ? (
                                    <textarea
                                      rows={4}
                                      value={customDescriptions[product.id] ?? analysis.suggestedDescription}
                                      onChange={(e) => setCustomDescriptions(prev => ({ ...prev, [product.id]: e.target.value }))}
                                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-green-500 font-sans text-xs text-black dark:text-white focus:outline-none"
                                    />
                                  ) : (
                                    <p className="text-black dark:text-white text-xs whitespace-pre-line leading-relaxed">
                                      {customDescriptions[product.id] || analysis.suggestedDescription}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* KEYWORDS RADAR */}
                            <div className="space-y-3 pt-2">
                              <span className="font-mono text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
                                <Flame size={13} className="text-amber-500" />
                                3. Palavras-Chave de Alto Volume & Intenção de Busca
                              </span>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Primary Keywords */}
                                <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                                  <span className="text-[10px] font-mono font-black uppercase text-blue-600 dark:text-blue-400 block">
                                    Primárias (Maior Volume)
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {analysis.primaryKeywords.map((kw, i) => (
                                      <span 
                                        key={i} 
                                        className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold border border-blue-200 dark:border-blue-800"
                                      >
                                        #{kw}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Long-tail Keywords */}
                                <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                                  <span className="text-[10px] font-mono font-black uppercase text-purple-600 dark:text-purple-400 block">
                                    Cauda Longa (Alta Conversão)
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {analysis.longTailKeywords.map((kw, i) => (
                                      <span 
                                        key={i} 
                                        className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-medium border border-purple-200 dark:border-purple-800"
                                      >
                                        &quot;{kw}&quot;
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Missing Keywords */}
                                <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                                  <span className="text-[10px] font-mono font-black uppercase text-amber-600 dark:text-amber-400 block">
                                    Termos Faltantes (Oportunidades)
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {analysis.missingKeywords.length === 0 ? (
                                      <span className="text-[10px] text-zinc-400 font-mono">Nenhum termo crítico ausente.</span>
                                    ) : (
                                      analysis.missingKeywords.map((kw, i) => (
                                        <span 
                                          key={i} 
                                          className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold border border-amber-200 dark:border-amber-800 flex items-center gap-1"
                                        >
                                          <AlertCircle size={9} />
                                          +{kw}
                                        </span>
                                      ))
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* AUDIT CHECKLIST: STRENGTHS & IMPROVEMENTS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              {/* Strengths */}
                              <div className="p-3 bg-zinc-100/60 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                                <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 block">
                                  Pontos Fortes Identificados
                                </span>
                                <ul className="space-y-1">
                                  {analysis.strengths.map((str, i) => (
                                    <li key={i} className="text-zinc-600 dark:text-zinc-300 flex items-start gap-1.5 text-[11px]">
                                      <Check size={12} className="text-green-600 shrink-0 mt-0.5" />
                                      <span>{str}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Actionable Improvements */}
                              <div className="p-3 bg-zinc-100/60 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                                <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 block">
                                  Recomendações Práticas Acionáveis
                                </span>
                                <ul className="space-y-1">
                                  {analysis.improvements.map((imp, i) => (
                                    <li key={i} className="text-zinc-600 dark:text-zinc-300 flex items-start gap-1.5 text-[11px]">
                                      <ArrowRight size={12} className="text-blue-500 shrink-0 mt-0.5" />
                                      <span>{imp}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* FOOTER ACTION ROW */}
                            <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-zinc-200 dark:border-zinc-800">
                              <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
                                <Zap size={13} className="text-amber-500" />
                                <span>Intenção de Busca: <strong>{analysis.searchIntent}</strong></span>
                                <span>•</span>
                                <span>Ganho Estimado: <strong>+{analysis.potentialSeoScore - analysis.seoScore} pontos</strong></span>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <button
                                  onClick={() => handleApplySingleSeo(product.id)}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-black font-mono text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
                                >
                                  <Save size={13} />
                                  <span>{isApplied ? 'Re-aplicar Otimizações' : 'Aplicar Melhorias ao Catálogo'}</span>
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL BOTTOM BAR */}
        <div className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <BarChart3 size={14} className="text-blue-500" />
            <span>Exibindo {filteredProducts.length} de {products.length} produtos catalogados</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
            >
              Fechar
            </button>
            <button
              onClick={handleBatchApply}
              disabled={Object.keys(analysesMap).length === 0}
              className="px-5 py-2 bg-green-600 hover:bg-green-500 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 text-black font-mono text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-md"
            >
              <CheckCircle2 size={14} />
              <span>Aplicar Otimizações em Massa</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

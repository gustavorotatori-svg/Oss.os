import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { 
  X, Filter, RotateCcw, Check, Zap, Tag, Layers, SlidersHorizontal, 
  Star, Award, ChevronDown, ChevronUp, ShieldAlert, Dumbbell, 
  GraduationCap, PackageCheck, UserCheck, Store, BookOpen, Shirt, ShieldCheck
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { MAIN_CATEGORIES_CONFIG } from '../data/categories';

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  priceRange?: [number, number];
  setPriceRange?: (range: [number, number]) => void;
  maxProductPrice?: number;
  selectedBrands?: string[];
  setSelectedBrands?: (brands: string[]) => void;
  brands?: string[];
  selectedSizes?: string[];
  setSelectedSizes?: (sizes: string[]) => void;
  sizesArr?: string[];
  selectedBelts?: string[];
  setSelectedBelts?: (belts: string[]) => void;
  selectedGenders?: string[];
  setSelectedGenders?: (genders: string[]) => void;
  selectedCategory?: string;
  setSelectedCategory?: (category: string) => void;
  selectedSubCategories?: string[];
  setSelectedSubCategories?: (sub: string[]) => void;
  subCategoriesArr?: string[];
  selectedProductTypes?: string[];
  setSelectedProductTypes?: (types: string[]) => void;
  selectedPractitionerLevels?: string[];
  setSelectedPractitionerLevels?: (levels: string[]) => void;
  selectedRating?: number;
  setSelectedRating?: (rating: number) => void;
  selectedPopularity?: string;
  setSelectedPopularity?: (popularity: string) => void;
  selectedPlatforms?: string[];
  setSelectedPlatforms?: (platforms: string[]) => void;
  platformsArr?: string[];
  clearFilters?: () => void;
  activeFiltersCount?: number;
  resultsCount?: number;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  priceRange = [0, 1000],
  setPriceRange,
  maxProductPrice = 1000,
  selectedBrands = [],
  setSelectedBrands,
  brands = ['Atama', 'Koral', 'KVRA', 'Venum', 'Kingz', 'StormStrong', 'Vulkan', 'Tatami', 'Hayabusa', 'Scramble', 'BJJ Fanatics', 'Growth', 'Decathlon', 'Jiujiteiro'],
  selectedSizes = [],
  setSelectedSizes,
  sizesArr = ['A0', 'A1', 'A2', 'A3', 'A4', 'P', 'M', 'G', 'GG'],
  selectedBelts = [],
  setSelectedBelts,
  selectedGenders = [],
  setSelectedGenders,
  selectedCategory = 'All',
  setSelectedCategory,
  selectedSubCategories = [],
  setSelectedSubCategories,
  subCategoriesArr = [],
  selectedProductTypes = [],
  setSelectedProductTypes,
  selectedPractitionerLevels = [],
  setSelectedPractitionerLevels,
  selectedRating = 0,
  setSelectedRating,
  selectedPopularity = 'all',
  setSelectedPopularity,
  selectedPlatforms = [],
  setSelectedPlatforms,
  platformsArr = ['Mercado Livre', 'Amazon', 'Shopee', 'Hotmart', 'BJJ Fanatics', 'Growth', 'Decathlon', 'Netshoes', 'Centauro', 'Sympla', 'Jiujiteiro Official'],
  clearFilters,
  activeFiltersCount = 0,
  resultsCount
}) => {
  // Accessibility check for reduced motion
  const prefersReducedMotion = useReducedMotion();

  // Accordion section collapse state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    rating: true,
    popularity: true,
    platform: true,
    brand: true,
    level: false,
    productType: false,
    belts: false,
    sizes: false,
    subCategory: false,
    gender: false,
  });

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleArrayItem = (arr: string[], setArr?: (val: string[]) => void, item?: string) => {
    if (!setArr || !item) return;
    if (arr.includes(item)) {
      setArr(arr.filter(i => i !== item));
    } else {
      setArr([...arr, item]);
    }
  };

  // Motion variants supporting accessibility preferences
  const drawerVariants = {
    hidden: {
      x: prefersReducedMotion ? '0%' : '100%',
      opacity: prefersReducedMotion ? 0 : 1,
    },
    visible: {
      x: '0%',
      opacity: 1,
      transition: {
        type: prefersReducedMotion ? 'tween' : 'spring',
        damping: 32,
        stiffness: 320,
        duration: prefersReducedMotion ? 0.15 : 0.35,
        ease: prefersReducedMotion ? 'easeOut' : [0.16, 1, 0.3, 1],
      },
    },
    exit: {
      x: prefersReducedMotion ? '0%' : '100%',
      opacity: 0,
      transition: {
        duration: prefersReducedMotion ? 0.1 : 0.25,
        ease: 'easeIn',
      },
    },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: prefersReducedMotion ? 0.1 : 0.2 } },
    exit: { opacity: 0, transition: { duration: prefersReducedMotion ? 0.1 : 0.2 } },
  };

  // Detailed categories mapped logically for BJJ Portal with Groups
  const categoryGroups = [
    {
      groupTitle: '4 Categorias Principais (Pilares BJJ)',
      items: [
        { id: 'Vestuário', label: 'Vestuário (Kimonos, No-Gi & Faixas)', icon: '🥋' },
        { id: 'Equipamentos', label: 'Equipamentos (Tatames, Pisos & Treino)', icon: '🛡️' },
        { id: 'Suplementos', label: 'Suplementos (Creatina, Whey & Recovery)', icon: '⚡' },
        { id: 'Acessórios', label: 'Acessórios (Proteção, Fitas & Mochilas)', icon: '🎒' },
      ]
    },
    {
      groupTitle: 'Destaques Especializados BJJ',
      items: [
        { id: 'Equipamentos para Iniciantes', label: 'Equipamentos para Iniciantes', icon: '🔰' },
        { id: 'Roupas de Competição', label: 'Roupas de Competição (IBJJF)', icon: '🏆' },
        { id: 'Acessórios de Treino', label: 'Acessórios de Treino & Tatame', icon: '🛡️' },
        { id: 'Nutrição Esportiva', label: 'Nutrição Esportiva & Suplementos', icon: '⚡' },
        { id: 'Livros/DVDs de Técnicas', label: 'Livros/DVDs & Cursos de Técnicas', icon: '📚' },
      ]
    },
    {
      groupTitle: 'Vestuário & Fightwear',
      items: [
        { id: 'Kimonos', label: 'Kimonos (Gi)', icon: '🥋' },
        { id: 'Rashguards', label: 'Rashguards (No-Gi)', icon: '👕' },
        { id: 'Bermudas', label: 'Shorts & Bermudas Grappling', icon: '🩳' },
        { id: 'Faixas', label: 'Faixas & Graduações', icon: '🎗️' },
      ]
    },
    {
      groupTitle: 'Equipamentos & Dojô',
      items: [
        { id: 'Tatames', label: 'Tatames & Pisos (Mats)', icon: '🟩' },
        { id: 'Equipamentos de Proteção', label: 'Protective Gear (Orelheiras / Joelheiras)', icon: '🛡️' },
        { id: 'Protetores', label: 'Protetores Bucais & Coquilhas', icon: '🦷' },
      ]
    },
    {
      groupTitle: 'Conteúdo & Cursos',
      items: [
        { id: 'Cursos Online', label: 'Cursos Online & Instrucionais', icon: '🎥' },
        { id: 'E-books', label: 'Livros & E-books Técnicos', icon: '📚' },
        { id: 'Serviços', label: 'Workshops & Aulas', icon: '🎓' },
      ]
    }
  ];

  // Practitioner levels specification
  const practitionerLevelsList = [
    {
      id: 'Iniciante',
      title: 'Iniciante (Faixa Branca)',
      desc: 'Custo-benefício, durabilidade e conforto para os primeiros rolas.',
      color: 'border-zinc-300 text-zinc-100 bg-zinc-900/60'
    },
    {
      id: 'Intermediário',
      title: 'Intermediário (Azul & Roxa)',
      desc: 'Kimonos de gramatura média, vestuário NoGi diário e secagem rápida.',
      color: 'border-blue-600/80 text-blue-400 bg-blue-950/40'
    },
    {
      id: 'Avançado',
      title: 'Avançado / Competidor (Marrom & Preta)',
      desc: 'Alta performance, tecidos aprovados pela IBJJF/CBJJ e gramatura reforçada.',
      color: 'border-red-600/80 text-red-400 bg-red-950/40'
    }
  ];

  // Product types specification
  const productTypesList = [
    { id: 'Uniforme', label: 'Uniforme (Kimonos, Rashguards, Bermudas)', icon: Tag },
    { id: 'Equipamento', label: 'Equipamento & Tatames', icon: ShieldAlert },
    { id: 'Suplemento', label: 'Suplementos & Nutrição', icon: Dumbbell },
    { id: 'Acessório', label: 'Acessórios do Tatame', icon: PackageCheck },
    { id: 'Serviço', label: 'Conteúdo Digital & Cursos', icon: GraduationCap }
  ];

  const beltOptions = ['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'];
  const genderOptions = ['Masculino', 'Feminino', 'Unissex', 'Infantil'];

  // Quick price presets
  const applyPricePreset = (min: number, max: number) => {
    setPriceRange?.([min, Math.min(max, maxProductPrice)]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex justify-end" 
          role="dialog" 
          aria-modal="true" 
          aria-label="Filtros Táticos e Categorias do Acervo BJJ"
        >
          {/* Backdrop Overlay */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Slide-in Filter Drawer Panel */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 w-full max-w-md h-full bg-zinc-950 border-l border-zinc-800 text-white shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-black sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-950/80 border border-red-700/80 text-red-500 shadow-[2px_2px_0px_0px_rgba(220,38,38,0.5)]">
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider font-mono text-white flex items-center gap-2">
                    FILTROS & CATEGORIAS BJJ
                    {activeFiltersCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-600 text-white font-mono text-[9px] font-black">
                        {activeFiltersCount}
                      </span>
                    )}
                  </h2>
                  <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                    Portal de Afiliados e Equipamentos Jiu-Jitsu
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Fechar gaveta de filtros"
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all rounded-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Filter Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              
              {/* 1. SEÇÃO DE CATEGORIAS DETALHADAS */}
              <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleSection('category')}
                    className="flex-1 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Layers size={14} className="text-red-500" />
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-200 font-mono">
                        CATEGORIAS DETALHADAS
                      </h3>
                    </div>
                    {expandedSections.category ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
                  </button>
                </div>

                {expandedSections.category && (
                  <div className="space-y-4 pt-2">
                    {/* Botão Ver Todos */}
                    <button
                      onClick={() => setSelectedCategory?.('All')}
                      className={`w-full px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-left border flex items-center justify-between transition-all ${
                        selectedCategory === 'All'
                          ? 'bg-red-600 text-white border-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>🥋</span>
                        <span>Todas as Categorias (Ver Tudo)</span>
                      </span>
                      {selectedCategory === 'All' && <Check size={12} className="text-white shrink-0" />}
                    </button>

                    {/* Grupos detalhados: Apparel, Equipment, Nutrition, Digital Content */}
                    {categoryGroups.map((group) => (
                      <div key={group.groupTitle} className="space-y-1.5 pt-1">
                        <p className="text-[9px] font-mono font-black uppercase tracking-wider text-zinc-400 pl-1 border-l-2 border-red-600/70">
                          {group.groupTitle}
                        </p>
                        <div className="grid grid-cols-1 gap-1">
                          {group.items.map((cat) => {
                            const isSelected = selectedCategory === cat.id;
                            return (
                              <button
                                key={cat.id}
                                onClick={() => setSelectedCategory?.(cat.id)}
                                className={`px-3 py-2 text-[9px] font-mono font-bold uppercase tracking-wider text-left border flex items-center justify-between transition-all ${
                                  isSelected
                                    ? 'bg-red-600 text-white border-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                    : 'bg-zinc-950/70 border-zinc-850 text-zinc-400 hover:border-zinc-700 hover:text-white'
                                }`}
                              >
                                <span className="flex items-center gap-2 truncate">
                                  <span className="text-xs">{cat.icon}</span>
                                  <span className="truncate">{cat.label}</span>
                                </span>
                                {isSelected && <Check size={12} className="text-white shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SEÇÃO DE SUBCATEGORIAS DETALHADAS */}
              <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 space-y-3">
                <button
                  onClick={() => toggleSection('subCategory')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-amber-500" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-200 font-mono">
                      SUBCATEGORIAS DETALHADAS
                    </h3>
                  </div>
                  {expandedSections.subCategory ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
                </button>

                {expandedSections.subCategory && (
                  <div className="space-y-4 pt-2">
                    {selectedSubCategories.length > 0 && (
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-[9px] font-mono text-zinc-400">
                          {selectedSubCategories.length} selecionada(s)
                        </span>
                        <button
                          onClick={() => setSelectedSubCategories?.([])}
                          className="text-[9px] font-mono text-red-500 hover:underline uppercase"
                        >
                          Limpar Subcategorias
                        </button>
                      </div>
                    )}

                    {MAIN_CATEGORIES_CONFIG.map((mainCat) => (
                      <div key={mainCat.id} className="space-y-2 pt-1 border-t border-zinc-800/60 first:border-0 first:pt-0">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <span>{mainCat.icon}</span>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                            {mainCat.name}
                          </span>
                        </div>

                        {mainCat.groups.map((group) => (
                          <div key={group.id} className="pl-2 space-y-1">
                            <p className="text-[8px] font-mono uppercase text-zinc-500 font-bold">
                              {group.name}
                            </p>
                            <div className="grid grid-cols-1 gap-1">
                              {group.subcategories.map((sub) => {
                                const isChecked = selectedSubCategories.includes(sub.name);
                                return (
                                  <button
                                    key={sub.id}
                                    onClick={() => {
                                      if (selectedSubCategories.includes(sub.name)) {
                                        setSelectedSubCategories?.(selectedSubCategories.filter(s => s !== sub.name));
                                      } else {
                                        setSelectedSubCategories?.([...selectedSubCategories, sub.name]);
                                      }
                                    }}
                                    className={`px-2.5 py-1.5 text-[9px] font-mono uppercase tracking-wider text-left border flex items-center justify-between transition-all ${
                                      isChecked
                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                                        : 'bg-zinc-950/70 border-zinc-850 text-zinc-400 hover:border-zinc-700 hover:text-white'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <div className={`w-2.5 h-2.5 border flex items-center justify-center shrink-0 ${
                                        isChecked ? 'bg-amber-500 border-amber-500' : 'border-zinc-700'
                                      }`}>
                                        {isChecked && <Check size={8} className="text-black" />}
                                      </div>
                                      <span className="truncate">{sub.name}</span>
                                    </div>
                                    {sub.badge && (
                                      <span className="text-[7px] px-1 py-0.2 bg-zinc-800 text-zinc-400 border border-zinc-700 shrink-0">
                                        {sub.badge}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. SEÇÃO DE FAIXA DE PREÇO (PRICE RANGE) */}
              <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 space-y-3">
                <button
                  onClick={() => toggleSection('price')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-green-500" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-200 font-mono">
                      FAIXA DE PREÇO (R$)
                    </h3>
                  </div>
                  {expandedSections.price ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
                </button>

                {expandedSections.price && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between bg-black p-2.5 border border-zinc-800">
                      <span className="text-[9px] font-mono text-zinc-400 uppercase">Faixa Ativa:</span>
                      <span className="text-[11px] font-mono font-black text-green-500">
                        R$ {priceRange[0]} — R$ {priceRange[1]}
                      </span>
                    </div>

                    <div className="px-1 py-1">
                      <Slider
                        defaultValue={[0, maxProductPrice]}
                        max={maxProductPrice}
                        step={10}
                        value={priceRange}
                        onValueChange={(val) => setPriceRange?.(val as [number, number])}
                        className="py-2"
                      />
                      <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500 uppercase tracking-widest pt-1">
                        <span>R$ 0</span>
                        <span>R$ {maxProductPrice}</span>
                      </div>
                    </div>

                    {/* Quick Price Presets */}
                    <div>
                      <p className="text-[8px] font-mono text-zinc-400 uppercase mb-1.5 tracking-wider">
                        Atalhos Rápidos de Preço:
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => applyPricePreset(0, 150)}
                          className="px-2 py-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-[8px] font-mono font-bold text-zinc-300 uppercase transition-all"
                        >
                          Até R$ 150
                        </button>
                        <button
                          onClick={() => applyPricePreset(150, 350)}
                          className="px-2 py-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-[8px] font-mono font-bold text-zinc-300 uppercase transition-all"
                        >
                          R$ 150 – R$ 350
                        </button>
                        <button
                          onClick={() => applyPricePreset(350, 700)}
                          className="px-2 py-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-[8px] font-mono font-bold text-zinc-300 uppercase transition-all"
                        >
                          R$ 350 – R$ 700
                        </button>
                        <button
                          onClick={() => applyPricePreset(700, maxProductPrice)}
                          className="px-2 py-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-[8px] font-mono font-bold text-zinc-300 uppercase transition-all"
                        >
                          Acima de R$ 700
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. SEÇÃO DE AVALIAÇÃO DO USUÁRIO (USER RATING) */}
              <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 space-y-3">
                <button
                  onClick={() => toggleSection('rating')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-200 font-mono">
                      AVALIAÇÃO DOS ATLETAS (USER RATING)
                    </h3>
                  </div>
                  {expandedSections.rating ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
                </button>

                {expandedSections.rating && (
                  <div className="grid grid-cols-1 gap-1.5 pt-2">
                    {[5, 4, 3, 2, 1].map(stars => {
                      const isSelected = selectedRating === stars;
                      return (
                        <button
                          key={stars}
                          onClick={() => setSelectedRating?.(selectedRating === stars ? 0 : stars)}
                          className={`w-full px-3 py-2 text-[9px] font-mono font-bold uppercase border flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500 shadow-sm'
                              : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  size={11}
                                  className={i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-700'}
                                />
                              ))}
                            </div>
                            <span className="text-[9px] font-mono">
                              {stars === 5 ? '5 Estrelas (Top)' : `${stars} Estrelas ou mais`}
                            </span>
                          </div>
                          {isSelected && <Check size={12} className="text-yellow-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SEÇÃO DE POPULARIDADE & DESTAQUES */}
              <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 space-y-3">
                <button
                  onClick={() => toggleSection('popularity')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-orange-500" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-200 font-mono">
                      POPULARIDADE & DESTAQUES
                    </h3>
                  </div>
                  {expandedSections.popularity ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
                </button>

                {expandedSections.popularity && (
                  <div className="grid grid-cols-1 gap-1.5 pt-2">
                    {[
                      { id: 'all', label: 'Todos os Níveis de Popularidade', icon: '🌐' },
                      { id: 'popular', label: '🔥 Em Alta (Mais Populares no Tatame)', icon: '🔥' },
                      { id: 'best_sellers', label: '⭐ Best-Sellers (Mais Vendidos)', icon: '⭐' },
                      { id: 'trending', label: '⚡ Alta Relevância & Destaques OSS.OS', icon: '⚡' },
                      { id: 'champions', label: '🏆 Homologados Pro & Escolha dos Campeões', icon: '🏆' },
                    ].map(item => {
                      const isSelected = selectedPopularity === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedPopularity?.(item.id)}
                          className={`w-full px-3 py-2 text-[9px] font-mono font-bold uppercase border flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-orange-950/80 border-orange-500 text-white'
                              : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700 hover:text-white'
                          }`}
                        >
                          <span className="truncate flex items-center gap-2">
                            <span>{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                          </span>
                          {isSelected && <Check size={12} className="text-orange-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. SEÇÃO DE PROGRAMA DE AFILIADOS / PLATAFORMA */}
              <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 space-y-3">
                <button
                  onClick={() => toggleSection('platform')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <Store size={14} className="text-blue-400" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-200 font-mono">
                      PROGRAMA AFILIADO & PLATAFORMA
                    </h3>
                  </div>
                  {expandedSections.platform ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
                </button>

                {expandedSections.platform && (
                  <div className="grid grid-cols-2 gap-1.5 pt-2">
                    {platformsArr.map(platform => {
                      const isSelected = selectedPlatforms.includes(platform);
                      return (
                        <button
                          key={platform}
                          onClick={() => toggleArrayItem(selectedPlatforms, setSelectedPlatforms, platform)}
                          className={`p-2.5 text-[9px] font-mono font-bold uppercase tracking-wider text-left border flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-blue-950/80 border-blue-500 text-white'
                              : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          <span className="truncate">{platform}</span>
                          {isSelected && <Check size={11} className="text-blue-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 5. SEÇÃO DE MARCAS (BRAND) */}
              <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 space-y-3">
                <button
                  onClick={() => toggleSection('brand')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-red-500" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-200 font-mono">
                      MARCAS RECONHECIDAS
                    </h3>
                  </div>
                  {expandedSections.brand ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
                </button>

                {expandedSections.brand && (
                  <div className="grid grid-cols-2 gap-1.5 pt-2">
                    {brands.map(brand => {
                      const isSelected = selectedBrands.includes(brand);
                      return (
                        <button
                          key={brand}
                          onClick={() => toggleArrayItem(selectedBrands, setSelectedBrands, brand)}
                          className={`p-2.5 text-[9px] font-mono font-bold uppercase tracking-wider text-left border flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-red-950/80 border-red-600 text-white'
                              : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          <span className="truncate flex items-center gap-1">
                            {brand}
                            {['Atama', 'Koral', 'KVRA', 'Venum', 'BJJ Fanatics'].includes(brand) && (
                              <Star size={8} className="fill-yellow-500 text-yellow-500 shrink-0" />
                            )}
                          </span>
                          {isSelected && <Check size={11} className="text-red-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 6. SEÇÃO DE NÍVEL DE EXPERIÊNCIA DO PRATICANTE */}
              <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 space-y-3">
                <button
                  onClick={() => toggleSection('level')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap size={14} className="text-amber-500" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-200 font-mono">
                      NÍVEL TÉCNICO RECOMENDADO
                    </h3>
                  </div>
                  {expandedSections.level ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
                </button>

                {expandedSections.level && (
                  <div className="space-y-2 pt-2">
                    <div className="grid grid-cols-1 gap-2">
                      {practitionerLevelsList.map(lvl => {
                        const isSelected = selectedPractitionerLevels.includes(lvl.id);
                        return (
                          <button
                            key={lvl.id}
                            onClick={() => toggleArrayItem(selectedPractitionerLevels, setSelectedPractitionerLevels, lvl.id)}
                            className={`p-3 text-left border transition-all relative overflow-hidden ${
                              isSelected
                                ? 'bg-red-950/70 border-red-600 text-white'
                                : `${lvl.color} hover:border-zinc-700`
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
                                {lvl.title}
                              </span>
                              {isSelected ? (
                                <span className="bg-red-600 text-white text-[8px] font-mono font-black px-1.5 py-0.5">ATIVO</span>
                              ) : (
                                <span className="text-[9px] text-zinc-500 font-mono">+ SELECIONAR</span>
                              )}
                            </div>
                            <p className="text-[9px] text-zinc-400 leading-tight">
                              {lvl.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 7. SEÇÃO DE TIPO DE PRODUTO */}
              <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 space-y-3">
                <button
                  onClick={() => toggleSection('productType')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <PackageCheck size={14} className="text-emerald-500" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-200 font-mono">
                      TIPO DE PRODUTO
                    </h3>
                  </div>
                  {expandedSections.productType ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
                </button>

                {expandedSections.productType && (
                  <div className="grid grid-cols-1 gap-1.5 pt-2">
                    {productTypesList.map(pType => {
                      const isSelected = selectedProductTypes.includes(pType.id);
                      const IconComp = pType.icon;
                      return (
                        <button
                          key={pType.id}
                          onClick={() => toggleArrayItem(selectedProductTypes, setSelectedProductTypes, pType.id)}
                          className={`p-2.5 text-[9px] font-mono font-bold uppercase tracking-wider text-left border flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-emerald-950/80 border-emerald-600 text-white'
                              : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <IconComp size={12} className={isSelected ? 'text-emerald-400' : 'text-zinc-500'} />
                            <span>{pType.label}</span>
                          </span>
                          {isSelected && <Check size={12} className="text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 8. SEÇÃO DE GRADUAÇÃO / FAIXAS */}
              <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 space-y-3">
                <button
                  onClick={() => toggleSection('belts')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-amber-500" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-200 font-mono">
                      GRADUAÇÃO (FAIXAS BJJ)
                    </h3>
                  </div>
                  {expandedSections.belts ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
                </button>

                {expandedSections.belts && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {beltOptions.map(belt => {
                      const isSelected = selectedBelts.includes(belt);
                      return (
                        <button
                          key={belt}
                          onClick={() => toggleArrayItem(selectedBelts, setSelectedBelts, belt)}
                          className={`px-3 py-2 text-[9px] font-mono font-bold uppercase border transition-all ${
                            isSelected
                              ? 'bg-amber-600 text-black border-amber-500 font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                              : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          Faixa {belt}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 9. TAMANHOS DISPONÍVEIS */}
              <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 space-y-3">
                <button
                  onClick={() => toggleSection('sizes')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <Filter size={14} className="text-zinc-400" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-200 font-mono">
                      TAMANHO DISPONÍVEL
                    </h3>
                  </div>
                  {expandedSections.sizes ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
                </button>

                {expandedSections.sizes && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {sizesArr.map(sz => {
                      const isSelected = selectedSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          onClick={() => toggleArrayItem(selectedSizes, setSelectedSizes, sz)}
                          className={`w-9 h-8 text-[10px] font-mono font-bold uppercase border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-white text-black border-white font-black'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 10. GÊNERO */}
              <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 space-y-3">
                <button
                  onClick={() => toggleSection('gender')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck size={14} className="text-zinc-400" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-200 font-mono">
                      GÊNERO / PÚBLICO
                    </h3>
                  </div>
                  {expandedSections.gender ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
                </button>

                {expandedSections.gender && (
                  <div className="grid grid-cols-2 gap-1.5 pt-2">
                    {genderOptions.map(g => {
                      const isSelected = selectedGenders.includes(g);
                      return (
                        <button
                          key={g}
                          onClick={() => toggleArrayItem(selectedGenders, setSelectedGenders, g)}
                          className={`py-2 px-2 text-[9px] font-mono font-bold uppercase border text-center transition-all ${
                            isSelected
                              ? 'bg-red-600 text-white border-red-600 font-black'
                              : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Sticky Action Footer */}
            <div className="p-4 border-t border-zinc-800 bg-black space-y-2 sticky bottom-0 z-20">
              <div className="flex items-center gap-2">
                {clearFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex-1 py-3 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-[10px] font-bold uppercase tracking-widest border border-zinc-800 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <RotateCcw size={12} />
                    <span>LIMPAR TODOS</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="flex-[1.6] py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all"
                >
                  <Check size={14} />
                  <span>
                    VER RESULTADOS {resultsCount !== undefined ? `(${resultsCount})` : ''}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FilterDrawer;


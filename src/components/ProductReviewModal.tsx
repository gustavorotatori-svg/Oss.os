import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  X, 
  ShieldCheck, 
  ThumbsUp, 
  MessageSquare, 
  Award, 
  Send, 
  Loader2, 
  CheckCircle2, 
  SlidersHorizontal,
  Sparkles,
  User,
  Search,
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { Product, Review } from '../types';
import BJJImage from './BJJImage';
import { getProductReviewsFromFirestore } from '../lib/firebase';

interface ProductReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddReview: (productId: string, review: Omit<Review, 'id'>) => Promise<void> | void;
  currentUserId?: string;
  currentUserName?: string;
  initialShowForm?: boolean;
}

const BELT_OPTIONS = [
  { id: 'Faixa Branca', label: 'Faixa Branca', color: 'bg-white text-zinc-900 border-zinc-300' },
  { id: 'Faixa Azul', label: 'Faixa Azul', color: 'bg-blue-600 text-white border-blue-700' },
  { id: 'Faixa Roxa', label: 'Faixa Roxa', color: 'bg-purple-700 text-white border-purple-800' },
  { id: 'Faixa Marrom', label: 'Faixa Marrom', color: 'bg-amber-900 text-white border-amber-950' },
  { id: 'Faixa Preta', label: 'Faixa Preta', color: 'bg-zinc-950 text-white border-red-600' },
  { id: 'Geral', label: 'Praticante Geral', color: 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700' }
];

const QUICK_TAGS = [
  'Tecido Super Resistente',
  'Ótimo Caimento',
  'Não Encolheu na Lavagem',
  'Lapela Grossa e Firme',
  'Confortável para Rolar',
  'Excelente Custo-Benefício',
  'Aprovado em Competição CBJJ'
];

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: '1.0 - Ruim (Não recomendo para treinos intensos)',
  2: '2.0 - Regular (Abaixo do esperado no tatame)',
  3: '3.0 - Bom (Cumpre os requisitos essenciais)',
  4: '4.0 - Muito Bom (Ótimo caimento e acabamento)',
  5: '5.0 - Excelente (Padrão Faixa-Preta / Altamente Recomendado!)'
};

export const ProductReviewModal: React.FC<ProductReviewModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddReview,
  currentUserId,
  currentUserName,
  initialShowForm = false
}) => {
  // Form State
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [authorName, setAuthorName] = useState<string>(currentUserName || '');
  const [selectedBelt, setSelectedBelt] = useState<string>('Faixa Azul');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(initialShowForm);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [reviewSearch, setReviewSearch] = useState<string>('');
  const [reviewSort, setReviewSort] = useState<'recent' | 'highest' | 'lowest' | 'helpful'>('recent');
  const [remoteReviews, setRemoteReviews] = useState<Review[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  // Helpful votes saved in localStorage
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oss_helpful_votes');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {};
  });

  const isServiceItem = useMemo(() => {
    if (!product) return false;
    return product.productType === 'Serviço' || 
      product.category === 'Serviços' || 
      product.category === 'Cursos Online' || 
      product.category === 'Conteúdo Digital';
  }, [product]);

  // Sync initialShowForm
  useEffect(() => {
    if (isOpen && initialShowForm) {
      setShowForm(true);
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, [isOpen, initialShowForm]);

  // Load reviews from Firestore & localStorage
  useEffect(() => {
    let isMounted = true;
    if (isOpen && product?.id) {
      getProductReviewsFromFirestore(product.id)
        .then((fetched) => {
          if (isMounted && fetched && fetched.length > 0) {
            setRemoteReviews(fetched);
          }
        })
        .catch((err) => {
          console.warn("Could not load remote reviews:", err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, product?.id]);

  // Dynamic reviews list and stats - merge product.reviews and remoteReviews
  const allReviews = useMemo(() => {
    const map = new Map<string, Review>();
    // First, base product reviews
    (product?.reviews || []).forEach(r => {
      if (r && r.id) map.set(r.id, r);
    });
    // Then remote / locally cached reviews
    remoteReviews.forEach(r => {
      if (r && r.id) map.set(r.id, r);
    });
    return Array.from(map.values());
  }, [product?.reviews, remoteReviews]);

  const averageRating = useMemo(() => {
    if (allReviews.length === 0) return product?.rating || 5.0;
    const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / allReviews.length) * 10) / 10;
  }, [allReviews, product?.rating]);

  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach(r => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      counts[rounded] = (counts[rounded] || 0) + 1;
    });
    return counts;
  }, [allReviews]);

  // Filtered & Sorted Reviews
  const filteredReviews = useMemo(() => {
    let result = [...allReviews];

    // Filter by stars
    if (filterRating !== 'all') {
      result = result.filter(r => Math.round(r.rating) === filterRating);
    }

    // Filter by search query
    if (reviewSearch.trim()) {
      const q = reviewSearch.toLowerCase().trim();
      result = result.filter(r => 
        r.comment.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        (r.belt && r.belt.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (reviewSort === 'recent') {
        const dateA = new Date(a.date).getTime() || 0;
        const dateB = new Date(b.date).getTime() || 0;
        return dateB - dateA;
      }
      if (reviewSort === 'highest') {
        return b.rating - a.rating;
      }
      if (reviewSort === 'lowest') {
        return a.rating - b.rating;
      }
      if (reviewSort === 'helpful') {
        const votesA = (helpfulVotes[a.id] || 0) + (a.helpfulCount || 0);
        const votesB = (helpfulVotes[b.id] || 0) + (b.helpfulCount || 0);
        return votesB - votesA;
      }
      return 0;
    });

    return result;
  }, [allReviews, filterRating, reviewSearch, reviewSort, helpfulVotes]);

  // Quick tag insert helper
  const handleInsertTag = (tag: string) => {
    setReviewComment(prev => {
      if (!prev.trim()) return tag;
      if (prev.includes(tag)) return prev;
      return `${prev.trim()}. ${tag}`;
    });
  };

  // Submission handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = authorName.trim();
    const trimmedComment = reviewComment.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setFormError('Por favor, informe seu nome de praticante (mínimo de 2 caracteres).');
      return;
    }

    if (!trimmedComment || trimmedComment.length < 5) {
      setFormError('Por favor, escreva um relato de pelo menos 5 caracteres sobre sua experiência.');
      return;
    }

    if (selectedRating < 1 || selectedRating > 5) {
      setFormError('Selecione uma nota de 1 a 5 estrelas.');
      return;
    }

    setIsSubmitting(true);
    try {
      const displayNameWithBelt = selectedBelt && selectedBelt !== 'Geral' 
        ? `${trimmedName} (${selectedBelt})` 
        : trimmedName;

      const newReviewData = {
        userName: displayNameWithBelt,
        rating: selectedRating,
        comment: trimmedComment,
        date: new Date().toISOString().split('T')[0],
        userId: currentUserId || 'guest_' + Date.now(),
        belt: selectedBelt,
        isVerifiedBuyer: true,
        helpfulCount: 0
      };

      await onAddReview(product.id, newReviewData);

      // Optimistically add to local remote reviews
      const tempId = `rev_temp_${Date.now()}`;
      setRemoteReviews(prev => [{ id: tempId, ...newReviewData }, ...prev]);

      setShowSuccessToast(true);
      setReviewComment('');
      setShowForm(false);
      setTimeout(() => setShowSuccessToast(false), 4500);
    } catch (err: any) {
      setFormError('Ocorreu um erro ao registrar sua avaliação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleHelpful = (reviewId: string) => {
    setHelpfulVotes(prev => {
      const updated = {
        ...prev,
        [reviewId]: (prev[reviewId] || 0) + 1
      };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('oss_helpful_votes', JSON.stringify(updated));
        } catch (e) {
          // ignore
        }
      }
      return updated;
    });
  };

  if (!product) return null;

  const currentDisplayRating = hoveredRating || selectedRating;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="product-review-modal-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto"
        >
          {/* Backdrop */}
          <motion.div
            key="product-review-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            key="product-review-container"
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="relative w-full max-w-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-10 my-auto flex flex-col max-h-[90vh]"
            id={`reviews-modal-${product.id}`}
          >
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 shrink-0 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <BJJImage 
                  src={product.imageUrl} 
                  alt={product.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 text-[8px] font-mono font-black uppercase border ${
                    isServiceItem 
                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800' 
                      : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                  }`}>
                    {isServiceItem ? 'SERVIÇO' : 'PRODUTO'}
                  </span>
                  <span className="font-mono text-[9px] font-black uppercase tracking-wider text-green-600">
                    {product.brand || (isServiceItem ? 'BJJ SERVICE' : 'BJJ GEAR')}
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <span className="font-mono text-[9px] text-zinc-500 uppercase">
                    {product.category}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black uppercase text-black dark:text-white line-clamp-1">
                  {product.title}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="Fechar"
              id="close-reviews-modal-btn"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
            {/* Success Toast */}
            {showSuccessToast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3.5 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 font-mono text-xs flex items-center gap-2 shadow-sm"
              >
                <CheckCircle2 size={16} className="text-green-600 dark:text-green-400 shrink-0" />
                <span>
                  <strong>Oss! Avaliação publicada com sucesso!</strong> Seu relato já está visível para toda a comunidade de Jiu-Jitsu.
                </span>
              </motion.div>
            )}

            {/* PROMINENT RATING SCOREBOARD & BREAKDOWN */}
            <div className="p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-6">
              {/* Left Score Block */}
              <div className="flex flex-col items-center justify-center text-center sm:border-r sm:border-zinc-200 dark:sm:border-zinc-800 sm:pr-6 shrink-0 w-full sm:w-auto">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-400 mb-1">
                  NOTA MÉDIA GERAL
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-black dark:text-white">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">/ 5.0</span>
                </div>
                
                {/* 5 Stars Visual */}
                <div className="flex items-center gap-1 my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={
                        star <= Math.round(averageRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-zinc-200 text-zinc-300 dark:fill-zinc-800 dark:text-zinc-700'
                      }
                    />
                  ))}
                </div>

                <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400">
                  {allReviews.length} {allReviews.length === 1 ? 'avaliação registrada' : 'avaliações registradas'}
                </span>

                <div className="mt-2 inline-flex items-center gap-1 bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 border border-green-500/20 text-[8px] font-mono font-black uppercase">
                  <ShieldCheck size={10} />
                  <span>98% Aprovado no Tatame</span>
                </div>
              </div>

              {/* Center Distribution Bars */}
              <div className="flex-1 w-full space-y-1.5">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingCounts[stars as 1 | 2 | 3 | 4 | 5] || 0;
                  const pct = allReviews.length > 0 ? (count / allReviews.length) * 100 : 0;
                  return (
                    <div 
                      key={stars} 
                      onClick={() => setFilterRating(filterRating === stars ? 'all' : stars)}
                      className={`flex items-center gap-2 text-xs font-mono cursor-pointer p-1 rounded-sm transition-colors ${
                        filterRating === stars ? 'bg-amber-500/10 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                      }`}
                      title={`Filtrar por ${stars} estrelas`}
                    >
                      <div className="flex items-center gap-1 w-12 shrink-0">
                        <span className="text-xs font-bold">{stars}</span>
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                      </div>
                      <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="h-full bg-amber-400"
                        />
                      </div>
                      <span className="text-[10px] text-zinc-400 w-8 text-right shrink-0">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Right CTA Button */}
              <div className="sm:border-l sm:border-zinc-200 dark:sm:border-zinc-800 sm:pl-6 w-full sm:w-auto flex flex-col items-center justify-center shrink-0">
                <button
                  type="button"
                  onClick={() => setShowForm(!showForm)}
                  className={`w-full sm:w-auto px-5 py-3 font-mono font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                    showForm 
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700'
                      : 'bg-green-600 hover:bg-green-500 text-black border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.25)]'
                  }`}
                  id="toggle-review-form-btn"
                >
                  <Star size={13} className={showForm ? '' : 'fill-current text-black'} />
                  <span>{showForm ? 'Fechar Formulário' : 'Avaliar Produto'}</span>
                </button>
                <span className="text-[8px] font-mono text-zinc-400 text-center mt-1.5">
                  1-5 Estrelas • Sem necessidade de cadastro prévio
                </span>
              </div>
            </div>

            {/* REVIEW SUBMISSION FORM ACCORDION */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <form
                    onSubmit={handleSubmitReview}
                    className="p-5 bg-white dark:bg-zinc-900 border-2 border-green-600/30 dark:border-green-600/30 space-y-4 shadow-lg"
                    id={`review-submission-form-${product.id}`}
                  >
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Award size={14} className="text-green-600" />
                        <h4 className="font-mono text-xs font-black uppercase tracking-wider text-black dark:text-white">
                          SUA AVALIAÇÃO DE PRATICANTE (OSS!)
                        </h4>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-400">
                        Campos Obrigatórios *
                      </span>
                    </div>

                    {formError && (
                      <div className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 font-mono text-xs">
                        ⚠️ {formError}
                      </div>
                    )}

                    {/* 1-5 Star Interactive Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-black uppercase text-zinc-500">
                        SELECIONE SUA NOTA (1 A 5 ESTRELAS) *
                      </label>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1.5 p-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                              key={star}
                              type="button"
                              whileHover={{ scale: 1.25 }}
                              whileTap={{ scale: 0.9 }}
                              onMouseEnter={() => setHoveredRating(star)}
                              onMouseLeave={() => setHoveredRating(null)}
                              onClick={() => setSelectedRating(star)}
                              className="p-1 focus:outline-none cursor-pointer"
                              title={`Avaliar com ${star} estrelas`}
                              id={`star-btn-${star}`}
                            >
                              <Star
                                size={22}
                                className={`transition-colors duration-150 ${
                                  star <= currentDisplayRating
                                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                                    : 'fill-zinc-300 text-zinc-300 dark:fill-zinc-800 dark:text-zinc-700'
                                }`}
                              />
                            </motion.button>
                          ))}
                        </div>

                        <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1.5 border border-amber-500/20">
                          {RATING_DESCRIPTIONS[currentDisplayRating]}
                        </span>
                      </div>
                    </div>

                    {/* Author Name and Belt Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-mono font-black uppercase text-zinc-500">
                          SEU NOME OU APELIDO NO TATAME *
                        </label>
                        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-950 px-3 py-2 border border-zinc-200 dark:border-zinc-800">
                          <User size={14} className="text-zinc-400" />
                          <input
                            type="text"
                            required
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder="Ex: Marcus Buchecha, Rodrigo Tatame..."
                            className="w-full bg-transparent border-none outline-none font-mono text-xs text-black dark:text-white p-0 focus:ring-0"
                            id="review-author-name-input"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-mono font-black uppercase text-zinc-500">
                          SUA GRADUAÇÃO / FAIXA
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {BELT_OPTIONS.map((belt) => (
                            <button
                              key={belt.id}
                              type="button"
                              onClick={() => setSelectedBelt(belt.id)}
                              className={`px-2 py-1 text-[9px] font-mono font-black uppercase border transition-all cursor-pointer ${
                                selectedBelt === belt.id
                                  ? `${belt.color} ring-2 ring-green-500 ring-offset-1 dark:ring-offset-zinc-950 font-black`
                                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white'
                              }`}
                            >
                              {belt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Review Comment Textarea */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-mono font-black uppercase text-zinc-500">
                          {isServiceItem ? 'RELATO DO SERVIÇO / EXPERIÊNCIA NO TATAME *' : 'RELATO DO EQUIPAMENTO NO TATAME *'}
                        </label>
                        <span className={`text-[9px] font-mono ${reviewComment.length < 5 ? 'text-zinc-400' : 'text-green-500'}`}>
                          {reviewComment.length}/500 caracteres
                        </span>
                      </div>
                      <textarea
                        required
                        minLength={5}
                        maxLength={500}
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder={
                          isServiceItem
                            ? 'Ex: Didática impecável do professor, metodologia prática com detalhes cirúrgicos de passagem de guarda e tatame muito limpo e higienizado...'
                            : 'Ex: Caimento perfeito no corpo (A2), costura super reforçada nas axilas e calça de Ripstop muito resistente às raspagens. Não encolheu na primeira lavagem...'
                        }
                        className="w-full bg-zinc-100 dark:bg-zinc-950 p-3 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-black dark:text-white outline-none focus:border-green-600 transition-colors resize-none"
                        id="review-comment-textarea"
                      />
                    </div>

                    {/* Submit Button Row */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-4 py-2 text-xs font-mono text-zinc-500 hover:text-black dark:hover:text-white uppercase cursor-pointer"
                      >
                        Cancelar
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting || reviewComment.trim().length < 5}
                        className="px-6 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-black font-mono font-black uppercase text-xs tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all"
                        id="submit-review-btn"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={13} className="animate-spin text-black" />
                            <span>Publicando...</span>
                          </>
                        ) : (
                          <>
                            <Send size={12} />
                            <span>Enviar Avaliação</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* REVIEWS LIST SECTION */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare size={14} className="text-zinc-400" />
                  <h4 className="font-mono text-xs font-black uppercase tracking-wider text-black dark:text-white">
                    RELATOS DE QUEM JÁ TREINOU ({filteredReviews.length})
                  </h4>
                </div>

                {/* Star Filter Pills */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[9px] font-mono text-zinc-400 uppercase mr-1">Filtrar:</span>
                  <button
                    type="button"
                    onClick={() => setFilterRating('all')}
                    className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase transition-colors cursor-pointer border ${
                      filterRating === 'all'
                        ? 'bg-black text-white dark:bg-white dark:text-black border-transparent font-black'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                    }`}
                  >
                    Todas ({allReviews.length})
                  </button>
                  {[5, 4, 3, 2, 1].map((st) => {
                    const count = ratingCounts[st as 1 | 2 | 3 | 4 | 5] || 0;
                    if (count === 0) return null;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setFilterRating(st)}
                        className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase transition-colors cursor-pointer border flex items-center gap-1 ${
                          filterRating === st
                            ? 'bg-amber-500 text-black border-amber-500 font-black'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                        }`}
                      >
                        <span>{st}★</span>
                        <span className="text-[8px] opacity-75">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Empty State */}
              {filteredReviews.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 p-6 space-y-3">
                  <Star size={32} className="mx-auto text-zinc-300 dark:text-zinc-700" />
                  <p className="font-mono text-xs text-zinc-500 uppercase font-bold">
                    Nenhuma avaliação encontrada com os filtros selecionados.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterRating('all');
                      setShowForm(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white font-mono text-xs uppercase font-black hover:border-green-500 cursor-pointer transition-colors"
                  >
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    Seja o primeiro a avaliar este produto
                  </button>
                </div>
              ) : (
                /* Reviews Cards Grid */
                <div className="space-y-3">
                  {filteredReviews.map((rev) => {
                    const votes = (helpfulVotes[rev.id] || 0) + (rev.helpfulCount || 0);
                    return (
                      <motion.div
                        key={rev.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-zinc-50/60 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                        id={`review-item-${rev.id}`}
                      >
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-mono font-black text-xs uppercase text-black dark:text-white border border-zinc-300 dark:border-zinc-700">
                              {rev.userName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-black text-xs text-black dark:text-white">
                                  {rev.userName}
                                </span>
                                {rev.belt && (
                                  <span className="text-[7.5px] font-mono font-bold px-1.5 py-0.2 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase">
                                    {rev.belt}
                                  </span>
                                )}
                              </div>
                              <span className="text-[8px] font-mono text-zinc-400 block">
                                {rev.date}
                              </span>
                            </div>
                          </div>

                          {/* Star Rating Badge */}
                          <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 border border-amber-500/20">
                            <div className="flex items-center text-amber-400">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={11}
                                  className={
                                    s <= Math.round(rev.rating)
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'fill-zinc-300 text-zinc-300 dark:fill-zinc-800 dark:text-zinc-700'
                                  }
                                />
                              ))}
                            </div>
                            <span className="text-[10px] font-mono font-black text-amber-600 dark:text-amber-400 ml-1">
                              {Number(rev.rating).toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {/* Review Content */}
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 font-sans leading-relaxed pt-1">
                          "{rev.comment}"
                        </p>

                        {/* Footer Action Bar */}
                        <div className="flex items-center justify-between pt-2 border-t border-dashed border-zinc-200/80 dark:border-zinc-800/80 text-[8px] font-mono">
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <ShieldCheck size={11} />
                            <span>Equipamento Verificado & Avaliado</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleHelpful(rev.id)}
                            className="flex items-center gap-1 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                            title="Marcar como útil"
                          >
                            <ThumbsUp size={10} />
                            <span>Útil ({votes})</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between shrink-0">
            <span className="text-[9px] font-mono text-zinc-400">
              {allReviews.length} avaliações da comunidade BJJ
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black font-mono font-black uppercase text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Concluir
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
    </AnimatePresence>
  );
};

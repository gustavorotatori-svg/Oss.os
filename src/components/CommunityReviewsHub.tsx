import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Award,
  Sparkles,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  X,
  Building2,
  Package,
  Calendar,
  User,
  SlidersHorizontal,
  Flame,
  ArrowUpDown,
  Pin,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Review, Product } from '../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { saveProductReviewToFirestore } from '../lib/firebase';

export interface CommunityReview {
  id: string;
  itemType: 'product' | 'service';
  targetId: string;
  targetTitle: string;
  targetCategory: string;
  targetBrandOrProvider: string;
  targetImage?: string;
  userName: string;
  userAvatar?: string;
  belt: string; // 'Faixa Branca' | 'Faixa Azul' | 'Faixa Roxa' | 'Faixa Marrom' | 'Faixa Preta'
  rating: number; // 1 to 5
  criteriaRatings?: {
    durabilityOrMethodology?: number;
    comfortOrStructure?: number;
    costBenefit?: number;
  };
  comment: string;
  date: string;
  aspectTags: string[];
  helpfulCount: number;
  isFeatured?: boolean;
  isVerifiedBuyer?: boolean;
  recommend: boolean;
}

export interface CommunityReviewsHubProps {
  productList?: Product[];
  currentUserId?: string;
  currentUserName?: string;
  onNavigateProduct?: (product: Product) => void;
  onNavigate?: (view: string) => void;
  addToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  playClickSound?: () => void;
}

const BELT_CONFIGS: Record<string, { label: string; bg: string; text: string; border: string; bar: string }> = {
  'Faixa Branca': { label: 'Faixa Branca', bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-800 dark:text-zinc-200', border: 'border-zinc-300 dark:border-zinc-700', bar: 'bg-black' },
  'Faixa Azul': { label: 'Faixa Azul', bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700', bar: 'bg-black' },
  'Faixa Roxa': { label: 'Faixa Roxa', bg: 'bg-purple-700', text: 'text-white', border: 'border-purple-800', bar: 'bg-black' },
  'Faixa Marrom': { label: 'Faixa Marrom', bg: 'bg-amber-900', text: 'text-white', border: 'border-amber-950', bar: 'bg-black' },
  'Faixa Preta': { label: 'Faixa Preta', bg: 'bg-black', text: 'text-white', border: 'border-red-600', bar: 'bg-red-600' }
};

const POPULAR_SERVICES = [
  { id: 'srv-01', title: 'Workshop Presencial: Passagem de Guarda & Pressão com Buchecha', provider: 'Sympla / BJJ Pro Events', category: 'Seminários & Workshops', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80' },
  { id: 'srv-02', title: 'Academia Alliance BJJ HQ - Turma Competição & No-Gi', provider: 'Alliance Jiu-Jitsu', category: 'Academias & Dojos', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80' },
  { id: 'srv-03', title: 'Fisioterapia Esportiva Especializada em Lesões de Tatame', provider: 'Tatame Recovery Lab', category: 'Saúde & Fisioterapia', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80' },
  { id: 'srv-04', title: 'Curso Online Masterclass: Sistema de Guarda Fechada Inquebrável', provider: 'Hotmart / BJJ Fanatics', category: 'Cursos & Aulas Online', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&auto=format&fit=crop&q=80' },
  { id: 'srv-05', title: 'Preparação Física Específica para Atletas de Jiu-Jitsu', provider: 'Iron Grappler Training', category: 'Preparação Física', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80' }
];

const INITIAL_COMMUNITY_REVIEWS: CommunityReview[] = [
  {
    id: 'rev-c01',
    itemType: 'product',
    targetId: 'jiujiteiro-h1x-gi',
    targetTitle: 'Kimono Jiujiteiro H1X Gi – Flagship Edition (Pearl Weave 450 GSM)',
    targetCategory: 'Kimonos & Vestuário',
    targetBrandOrProvider: 'Jiujiteiro Official',
    targetImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    userName: 'Prof. Marcus "Tubarão" Silveira',
    belt: 'Faixa Preta',
    rating: 5,
    criteriaRatings: {
      durabilityOrMethodology: 5,
      comfortOrStructure: 5,
      costBenefit: 4
    },
    comment: 'Kimono absurdo de resistente! Já lavei mais de 40 vezes em água fria e o encolhimento foi milimétrico. A lapela vulcanizada com EVA denso torna quase impossível para os guardeiros estabilizarem a pegada de gola. Calça em Ripstop reforçada que resiste ao atrito constante do tatame sem desfiar.',
    date: '28/10/2026',
    aspectTags: ['Lapela Ultrarresistente', 'Caimento Atlético', 'Aprovado IBJJF', 'Não Encolhe'],
    helpfulCount: 38,
    isFeatured: true,
    isVerifiedBuyer: true,
    recommend: true
  },
  {
    id: 'rev-c02',
    itemType: 'service',
    targetId: 'srv-01',
    targetTitle: 'Workshop Presencial: Passagem de Guarda & Pressão com Buchecha',
    targetCategory: 'Seminários & Workshops',
    targetBrandOrProvider: 'Sympla / BJJ Pro Events',
    targetImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    userName: 'Rodrigo "Caveira" Barbosa',
    belt: 'Faixa Roxa',
    rating: 5,
    criteriaRatings: {
      durabilityOrMethodology: 5,
      comfortOrStructure: 5,
      costBenefit: 5
    },
    comment: 'Seminário transformador. A didática do Buchecha para explicar como colocar pressão no quadril sem cansar os ombros mudou completamente a eficiência das minhas passagens de meia-guarda. 4 horas intensas de detalhes invisíveis com direito a sparring no final. Valeu cada centavo investido na minha evolução.',
    date: '25/10/2026',
    aspectTags: ['Didática Impecável', 'Técnica Invisível', 'Ambiente Respeitoso', 'Rola Supervisionado'],
    helpfulCount: 29,
    isFeatured: true,
    isVerifiedBuyer: true,
    recommend: true
  },
  {
    id: 'rev-c03',
    itemType: 'product',
    targetId: 'venum-tiger-rash',
    targetTitle: 'Rashguard Venum Tiger Compression No-Gi (IBJJF Legal)',
    targetCategory: 'No-Gi & Rashguards',
    targetBrandOrProvider: 'Venum Brasil',
    targetImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    userName: 'Beatriz "Leoa" Albuquerque',
    belt: 'Faixa Marrom',
    rating: 5,
    criteriaRatings: {
      durabilityOrMethodology: 5,
      comfortOrStructure: 4,
      costBenefit: 5
    },
    comment: 'Compressão excelente que mantém a musculatura aquecida e não sobe na cintura durante o rola por conta da fita de silicone emborrachada na barra inferior. Tecido respirável de secagem ultrarrápida. Uso em todos os treinos de No-Gi da semana.',
    date: '21/10/2026',
    aspectTags: ['Borracha Antideslizante', 'Compressão Muscular', 'Secagem Rápida'],
    helpfulCount: 22,
    isFeatured: false,
    isVerifiedBuyer: true,
    recommend: true
  },
  {
    id: 'rev-c04',
    itemType: 'service',
    targetId: 'srv-03',
    targetTitle: 'Fisioterapia Esportiva Especializada em Lesões de Tatame',
    targetCategory: 'Saúde & Fisioterapia',
    targetBrandOrProvider: 'Tatame Recovery Lab',
    targetImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
    userName: 'Diego Fontes',
    belt: 'Faixa Azul',
    rating: 5,
    criteriaRatings: {
      durabilityOrMethodology: 5,
      comfortOrStructure: 5,
      costBenefit: 4
    },
    comment: 'Tratei uma hiperextensão de cotovelo causada por armlock mal encaixado e em 3 semanas com o protocolo deles já estava de volta aos treinos leves. Eles entendem a biomecânica exata das alavancas do Jiu-Jitsu e não pedem repouso desnecessário.',
    date: '18/10/2026',
    aspectTags: ['Entende de BJJ', 'Protocolo Ágil', 'Prevenção de Lesões'],
    helpfulCount: 19,
    isFeatured: true,
    isVerifiedBuyer: true,
    recommend: true
  },
  {
    id: 'rev-c05',
    itemType: 'product',
    targetId: 'atama-belt-black',
    targetTitle: 'Faixa Atama Premium Especial 100% Algodão Grueso',
    targetCategory: 'Faixas & Acessórios',
    targetBrandOrProvider: 'Atama Fightwear',
    targetImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    userName: 'Carlos Eduardo "Cadu"',
    belt: 'Faixa Preta',
    rating: 5,
    criteriaRatings: {
      durabilityOrMethodology: 5,
      comfortOrStructure: 5,
      costBenefit: 5
    },
    comment: 'Faixa pesada, encorpada e com o nó que não solta no meio do rola. A ponteira vermelha é muito bem costurada com linha grossa. Dá pra sentir a qualidade clássica da Atama que dura décadas.',
    date: '15/10/2026',
    aspectTags: ['Nó Firme', 'Algodão Pesado', 'Durabilidade Histórica'],
    helpfulCount: 16,
    isFeatured: false,
    isVerifiedBuyer: true,
    recommend: true
  },
  {
    id: 'rev-c06',
    itemType: 'service',
    targetId: 'srv-02',
    targetTitle: 'Academia Alliance BJJ HQ - Turma Competição & No-Gi',
    targetCategory: 'Academias & Dojos',
    targetBrandOrProvider: 'Alliance Jiu-Jitsu',
    targetImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
    userName: 'Matheus Nogueira',
    belt: 'Faixa Branca',
    rating: 4,
    criteriaRatings: {
      durabilityOrMethodology: 5,
      comfortOrStructure: 5,
      costBenefit: 4
    },
    comment: 'Tatame gigantesco e muito limpo. O ritmo da turma de competição é bem puxado, mas os faixas-pretas corrigem os iniciantes com muita paciência. A estrutura de vestiários e higiene é impecável.',
    date: '10/10/2026',
    aspectTags: ['Tatame Higienizado', 'Treino Pesado', 'Acolhedor com Iniciantes'],
    helpfulCount: 12,
    isFeatured: false,
    isVerifiedBuyer: true,
    recommend: true
  }
];

export const CommunityReviewsHub: React.FC<CommunityReviewsHubProps> = ({
  productList = [],
  currentUserId,
  currentUserName,
  onNavigateProduct,
  onNavigate,
  addToast = (msg: string, type?: 'success' | 'error' | 'info') => console.log(msg, type),
  playClickSound = () => {}
}) => {
  // Reviews state with localStorage persistence
  const [reviews, setReviews] = useState<CommunityReview[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oss_community_all_reviews');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Erro ao carregar reviews:', e);
      }
    }
    return INITIAL_COMMUNITY_REVIEWS;
  });

  // Track user voted review IDs
  const [votedReviewIds, setVotedReviewIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('oss_user_voted_review_ids');
        if (saved) return new Set(JSON.parse(saved));
      } catch (e) {}
    }
    return new Set<string>();
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'service'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [beltFilter, setBeltFilter] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'helpful' | 'highest' | 'newest' | 'belt'>('helpful');

  // Modal State for New Review
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReviewType, setNewReviewType] = useState<'product' | 'service'>('product');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [customTargetTitle, setCustomTargetTitle] = useState<string>('');
  const [customBrandOrProvider, setCustomBrandOrProvider] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>(currentUserName || '');
  const [authorBelt, setAuthorBelt] = useState<string>('Faixa Azul');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [durabilityOrMethodology, setDurabilityOrMethodology] = useState<number>(5);
  const [comfortOrStructure, setComfortOrStructure] = useState<number>(5);
  const [costBenefit, setCostBenefit] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState<string>('');
  const [recommend, setRecommend] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync reviews to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('oss_community_all_reviews', JSON.stringify(reviews));
    } catch (e) {}
  }, [reviews]);

  // Sync helpful votes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('oss_user_voted_review_ids', JSON.stringify(Array.from(votedReviewIds)));
    } catch (e) {}
  }, [votedReviewIds]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) return { total: 0, average: 0, recommendPct: 0, verifiedPct: 0 };
    const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / total;
    const recCount = reviews.filter(r => r.recommend).length;
    const verCount = reviews.filter(r => r.isVerifiedBuyer).length;
    return {
      total,
      average: Math.round(avg * 10) / 10,
      recommendPct: Math.round((recCount / total) * 100),
      verifiedPct: Math.round((verCount / total) * 100)
    };
  }, [reviews]);

  // Top Most Useful Reviews (Spotlight)
  const topHelpfulReviews = useMemo(() => {
    return [...reviews]
      .sort((a, b) => b.helpfulCount - a.helpfulCount)
      .slice(0, 3);
  }, [reviews]);

  // Filtered & Sorted Reviews
  const filteredReviews = useMemo(() => {
    return reviews
      .filter(rev => {
        // Type filter
        if (typeFilter !== 'all' && rev.itemType !== typeFilter) return false;
        // Category filter
        if (categoryFilter !== 'all' && rev.targetCategory !== categoryFilter) return false;
        // Belt filter
        if (beltFilter !== 'all' && rev.belt !== beltFilter) return false;
        // Min Rating
        if (minRating > 0 && rev.rating < minRating) return false;
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchComment = rev.comment.toLowerCase().includes(q);
          const matchTitle = rev.targetTitle.toLowerCase().includes(q);
          const matchBrand = rev.targetBrandOrProvider.toLowerCase().includes(q);
          const matchUser = rev.userName.toLowerCase().includes(q);
          const matchTags = rev.aspectTags.some(t => t.toLowerCase().includes(q));
          if (!matchComment && !matchTitle && !matchBrand && !matchUser && !matchTags) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // If sorting by helpful (Destacar mais úteis)
        if (sortBy === 'helpful') {
          // Featured / highly voted first
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return b.helpfulCount - a.helpfulCount;
        }
        if (sortBy === 'highest') {
          return b.rating - a.rating;
        }
        if (sortBy === 'newest') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === 'belt') {
          const beltWeights: Record<string, number> = {
            'Faixa Preta': 5,
            'Faixa Marrom': 4,
            'Faixa Roxa': 3,
            'Faixa Azul': 2,
            'Faixa Branca': 1
          };
          return (beltWeights[b.belt] || 0) - (beltWeights[a.belt] || 0);
        }
        return 0;
      });
  }, [reviews, typeFilter, categoryFilter, beltFilter, minRating, searchQuery, sortBy]);

  // Handle helpful vote toggle
  const handleToggleHelpful = (reviewId: string) => {
    playClickSound();
    const hasVoted = votedReviewIds.has(reviewId);

    setVotedReviewIds(prev => {
      const next = new Set(prev);
      if (hasVoted) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });

    setReviews(prev =>
      prev.map(r => {
        if (r.id === reviewId) {
          const newCount = hasVoted ? Math.max(0, r.helpfulCount - 1) : r.helpfulCount + 1;
          // Automatically mark as featured if helpfulCount reaches 10
          const autoFeatured = newCount >= 10 ? true : r.isFeatured;
          return {
            ...r,
            helpfulCount: newCount,
            isFeatured: autoFeatured
          };
        }
        return r;
      })
    );

    if (!hasVoted) {
      addToast('Obrigado! Seu voto de utilidade ajuda toda a comunidade BJJ.', 'success');
    } else {
      addToast('Voto removido.', 'info');
    }
  };

  // Toggle Featured status (Pin/Highlight)
  const handleTogglePin = (reviewId: string) => {
    playClickSound();
    setReviews(prev =>
      prev.map(r => {
        if (r.id === reviewId) {
          const nextState = !r.isFeatured;
          addToast(nextState ? 'Review destacada como Mais Útil da Comunidade!' : 'Destaque removido.', 'info');
          return { ...r, isFeatured: nextState };
        }
        return r;
      })
    );
  };

  // Handle new review submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedAuthor = authorName.trim();
    const trimmedComment = comment.trim();

    if (!trimmedAuthor) {
      setFormError('Por favor, informe seu nome ou apelido de tatame.');
      return;
    }

    if (!trimmedComment || trimmedComment.length < 10) {
      setFormError('Seu comentário precisa ter pelo menos 10 caracteres detalhando a experiência.');
      return;
    }

    let targetTitle = customTargetTitle.trim();
    let targetBrand = customBrandOrProvider.trim();
    let targetCat = newReviewType === 'product' ? 'Kimonos & Vestuário' : 'Serviços do Tatame';
    let targetImg = '';

    if (newReviewType === 'product') {
      if (selectedTargetId) {
        const found = productList.find(p => p.id === selectedTargetId);
        if (found) {
          targetTitle = found.title;
          targetBrand = found.brand || 'Marca BJJ';
          targetCat = found.category || 'Kimonos';
          targetImg = found.imageUrl;
        }
      }
      if (!targetTitle) {
        setFormError('Selecione ou digite o nome do produto avaliado.');
        return;
      }
    } else {
      if (selectedTargetId) {
        const found = POPULAR_SERVICES.find(s => s.id === selectedTargetId);
        if (found) {
          targetTitle = found.title;
          targetBrand = found.provider;
          targetCat = found.category;
          targetImg = found.image;
        }
      }
      if (!targetTitle) {
        setFormError('Selecione ou digite o nome do serviço ou seminário avaliado.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const newReview: CommunityReview = {
        id: `com_rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        itemType: newReviewType,
        targetId: selectedTargetId || `custom_${Date.now()}`,
        targetTitle,
        targetCategory: targetCat,
        targetBrandOrProvider: targetBrand || (newReviewType === 'product' ? 'Equipamento BJJ' : 'Instrutor / Dojo'),
        targetImage: targetImg || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
        userName: trimmedAuthor,
        belt: authorBelt,
        rating,
        criteriaRatings: {
          durabilityOrMethodology,
          comfortOrStructure,
          costBenefit
        },
        comment: trimmedComment,
        date: new Date().toLocaleDateString('pt-BR'),
        aspectTags: selectedTags.length > 0 ? selectedTags : ['Recomendado no Tatame', 'Avaliação Técnica'],
        helpfulCount: 1, // Author automatically gets 1
        isFeatured: rating === 5 && trimmedComment.length > 80,
        isVerifiedBuyer: true,
        recommend
      };

      // Also persist to Firestore if it's a product
      if (newReviewType === 'product' && selectedTargetId) {
        try {
          await saveProductReviewToFirestore(selectedTargetId, {
            userName: newReview.userName,
            rating: newReview.rating,
            comment: newReview.comment,
            belt: newReview.belt,
            userId: currentUserId
          });
        } catch (dbErr) {
          console.warn('[CommunityReviewsHub] Firestore sync fallback:', dbErr);
        }
      }

      setReviews(prev => [newReview, ...prev]);
      setIsModalOpen(false);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      addToast('🥋 Sua avaliação técnica foi publicada com sucesso no tatame!', 'success');

      // Reset form
      setComment('');
      setSelectedTags([]);
      setCustomTargetTitle('');
      setCustomBrandOrProvider('');
      setSelectedTargetId('');
    } catch (err: any) {
      console.error('[CommunityReviewsHub] Error saving review:', err);
      setFormError('Erro ao publicar avaliação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCustomTag = () => {
    if (!customTagInput.trim()) return;
    const tag = customTagInput.trim();
    if (!selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
    }
    setCustomTagInput('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 font-sans space-y-10">
      
      {/* 1. HERO HEADER WITH STATS */}
      <div className="bg-black text-white p-6 md:p-10 border-2 border-black dark:border-zinc-800 shadow-2xl relative overflow-hidden">
        {/* Subtle tatame lines background */}
        <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="bg-green-600 text-white font-mono text-[9px] font-black uppercase px-2.5 py-1 tracking-widest flex items-center gap-1.5 shadow-sm">
                <Sparkles size={11} className="animate-spin" />
                VOZ DO TATAME // COMUNIDADE
              </span>
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                Curadoria Real de Atletas & Faixas-Pretas
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-headline font-black uppercase tracking-tight text-white">
              AVALIAÇÕES & REVIEWS DO JIU-JITSU
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
              Experiências sinceras, notas técnicas e relatos de durabilidade sobre <strong>kimonos, faixas, rashguards e suplementos</strong>, além de <strong>seminários, dojos e fisioterapia</strong>. Vote nos mais úteis para guiar a comunidade.
            </p>
          </div>

          {/* Quick Action Button */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="shrink-0">
            <button
              onClick={() => {
                playClickSound();
                setIsModalOpen(true);
              }}
              className="px-6 py-4 bg-green-600 hover:bg-green-500 text-white font-mono font-black text-xs uppercase tracking-widest flex items-center gap-2.5 shadow-[0_0_20px_rgba(34,197,94,0.4)] cursor-pointer transition-all border border-green-400/40"
              id="btn-open-review-form"
            >
              <Plus size={16} />
              <span>Avaliar Produto ou Serviço</span>
            </button>
          </motion.div>
        </div>

        {/* Live Metrics Bar */}
        <div className="mt-8 pt-6 border-t border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-white">
          <div className="space-y-0.5">
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Total de Reviews</span>
            <div className="flex items-center gap-1.5">
              <MessageSquare size={16} className="text-green-500" />
              <span className="text-xl sm:text-2xl font-mono font-black">{stats.total}</span>
              <span className="text-[10px] text-zinc-400 font-mono">relatos</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Nota Média Geral</span>
            <div className="flex items-center gap-1.5">
              <Star size={16} className="text-amber-400 fill-amber-400" />
              <span className="text-xl sm:text-2xl font-mono font-black">{stats.average.toFixed(1)}</span>
              <span className="text-[10px] text-zinc-400 font-mono">/ 5.0</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Aprovado no Rola</span>
            <div className="flex items-center gap-1.5">
              <TrendingUp size={16} className="text-emerald-400" />
              <span className="text-xl sm:text-2xl font-mono font-black">{stats.recommendPct}%</span>
              <span className="text-[10px] text-zinc-400 font-mono">recomendam</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Compradores Reais</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-blue-400" />
              <span className="text-xl sm:text-2xl font-mono font-black">{stats.verifiedPct}%</span>
              <span className="text-[10px] text-zinc-400 font-mono">verificados</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SPOTLIGHT: REVIEWS MAIS ÚTEIS DA COMUNIDADE (DESTACADOS) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-amber-500 fill-amber-500" />
            <h2 className="text-sm font-mono font-black uppercase tracking-wider text-black dark:text-white">
              DESTAQUES: REVIEWS MAIS ÚTEIS DA COMUNIDADE
            </h2>
            <span className="text-[8px] font-mono bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 uppercase font-black">
              Top Votados
            </span>
          </div>
          <span className="text-xs font-mono text-zinc-400 hidden sm:block">
            Eleitos pelos praticantes por nível de detalhamento técnico
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topHelpfulReviews.map((rev) => {
            const beltConfig = BELT_CONFIGS[rev.belt] || BELT_CONFIGS['Faixa Branca'];
            const hasVoted = votedReviewIds.has(rev.id);

            return (
              <motion.div
                key={`spotlight-${rev.id}`}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-zinc-950 border-2 border-amber-500/50 dark:border-amber-500/40 p-5 shadow-lg relative flex flex-col justify-between gap-4 group"
              >
                {/* Gold Highlight Ribbon */}
                <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                  <span className="text-[8px] font-mono font-black bg-amber-500 text-black px-2 py-0.5 uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <Award size={11} />
                    REVIEW MAIS ÚTIL
                  </span>
                  <div className="flex items-center gap-1 text-[9px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                    <ThumbsUp size={11} className="fill-amber-500 text-amber-500" />
                    <span>{rev.helpfulCount} votos</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {/* Target item header */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0 overflow-hidden">
                      <img src={rev.targetImage} alt={rev.targetTitle} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest block truncate">
                        {rev.itemType === 'product' ? '🥋 PRODUTO' : '🏢 SERVIÇO'} • {rev.targetBrandOrProvider}
                      </span>
                      <h4 className="text-xs font-mono font-bold text-black dark:text-white truncate" title={rev.targetTitle}>
                        {rev.targetTitle}
                      </h4>
                    </div>
                  </div>

                  {/* Rating & Author */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={13}
                          className={star <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-300 dark:text-zinc-700'}
                        />
                      ))}
                    </div>
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 uppercase ${beltConfig.bg} ${beltConfig.text}`}>
                      {rev.belt}
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 font-sans line-clamp-4 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                {/* Footer of card */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono font-black uppercase text-black dark:text-white">
                      {rev.userName}
                    </span>
                    <span className="text-[8px] font-mono text-zinc-400">{rev.date}</span>
                  </div>

                  <button
                    onClick={() => handleToggleHelpful(rev.id)}
                    className={`px-3 py-1.5 font-mono text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
                      hasVoted
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white'
                    }`}
                    title="Votar que esta review foi útil"
                  >
                    <ThumbsUp size={11} className={hasVoted ? 'fill-white' : ''} />
                    <span>Útil ({rev.helpfulCount})</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. CONTROLS, SEARCH, AND FILTERING BAR */}
      <section className="bg-white dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Main Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por kimono, marca, dojo, autor ou palavra-chave..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono pl-9 pr-8 py-2.5 text-black dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Type Switcher: Todos | Produtos | Serviços */}
          <div className="flex border-2 border-black dark:border-zinc-800 p-0.5 bg-zinc-100 dark:bg-zinc-900 shrink-0">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'product', label: '🥋 Produtos' },
              { id: 'service', label: '🏢 Serviços' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  playClickSound();
                  setTypeFilter(t.id as any);
                }}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  typeFilter === t.id
                    ? 'bg-black text-white dark:bg-white dark:text-black font-black shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown size={13} className="text-zinc-400" />
            <span className="text-[10px] font-mono font-bold uppercase text-zinc-500">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                playClickSound();
                setSortBy(e.target.value as any);
              }}
              className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono font-bold uppercase px-2.5 py-1.5 text-black dark:text-white focus:outline-none"
            >
              <option value="helpful">🔥 Mais Úteis Primeiro</option>
              <option value="highest">⭐ Melhor Avaliados</option>
              <option value="newest">🕒 Mais Recentes</option>
              <option value="belt">🥋 Por Faixa Mais Graduada</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">// FILTRO DE FAIXA:</span>
            {['all', 'Faixa Preta', 'Faixa Marrom', 'Faixa Roxa', 'Faixa Azul', 'Faixa Branca'].map(b => (
              <button
                key={b}
                onClick={() => {
                  playClickSound();
                  setBeltFilter(b);
                }}
                className={`px-2 py-0.5 text-[9px] font-mono uppercase transition-colors cursor-pointer border ${
                  beltFilter === b
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-black'
                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                }`}
              >
                {b === 'all' ? 'Todas as Faixas' : b}
              </button>
            ))}
          </div>

          {/* Active Results Counter */}
          <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">
            Exibindo <strong>{filteredReviews.length}</strong> de {reviews.length} avaliações
          </span>
        </div>
      </section>

      {/* 4. MAIN REVIEWS LISTING */}
      <section className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center bg-zinc-50 dark:bg-zinc-900/40 border-2 border-dashed border-zinc-300 dark:border-zinc-800 space-y-3">
            <MessageSquare size={32} className="mx-auto text-zinc-400" />
            <h3 className="text-sm font-mono font-bold uppercase text-black dark:text-white">
              Nenhuma avaliação encontrada com estes filtros
            </h3>
            <p className="text-xs text-zinc-500 font-sans max-w-md mx-auto">
              Tente alterar os termos de busca ou seja o primeiro guerreiro a compartilhar sua experiência técnica!
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setBeltFilter('all');
              }}
              className="mt-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-black uppercase"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReviews.map((rev) => {
              const beltConfig = BELT_CONFIGS[rev.belt] || BELT_CONFIGS['Faixa Branca'];
              const hasVoted = votedReviewIds.has(rev.id);
              const isHighlight = rev.isFeatured || rev.helpfulCount >= 10;

              return (
                <motion.div
                  key={rev.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white dark:bg-zinc-950 p-5 border-2 transition-all flex flex-col justify-between gap-4 relative ${
                    isHighlight
                      ? 'border-amber-500/60 dark:border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-600'
                  }`}
                >
                  {/* Highlight Ribbon if Top Helpful */}
                  {isHighlight && (
                    <div className="flex items-center justify-between pb-2 border-b border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-[8.5px] font-black uppercase">
                      <span className="flex items-center gap-1.5">
                        <Award size={12} className="text-amber-500" />
                        DESTACADO: REVIEW MAIS ÚTIL DO TATAME
                      </span>
                      <span className="bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2">
                        {rev.helpfulCount} ATLETAS APROVARAM
                      </span>
                    </div>
                  )}

                  {/* Header: Target Item & Stars */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0 overflow-hidden">
                          <img src={rev.targetImage} alt={rev.targetTitle} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[7.5px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-1.5 py-0.2 uppercase">
                              {rev.itemType === 'product' ? '🥋 Equipamento' : '🏢 Serviço / Dojo'}
                            </span>
                            <span className="text-[8px] font-mono text-zinc-400 uppercase truncate">
                              {rev.targetBrandOrProvider}
                            </span>
                          </div>
                          <h3 className="text-xs sm:text-sm font-mono font-black text-black dark:text-white truncate" title={rev.targetTitle}>
                            {rev.targetTitle}
                          </h3>
                        </div>
                      </div>

                      {/* Pin/Highlight toggle button for admin/community */}
                      <button
                        onClick={() => handleTogglePin(rev.id)}
                        className={`p-1 text-zinc-400 hover:text-amber-500 transition-colors ${rev.isFeatured ? 'text-amber-500' : ''}`}
                        title={rev.isFeatured ? 'Remover dos Destaques' : 'Destacar como Review Útil'}
                      >
                        <Pin size={14} className={rev.isFeatured ? 'fill-amber-500' : ''} />
                      </button>
                    </div>

                    {/* Rating Bar & Reviewer Info */}
                    <div className="flex items-center justify-between gap-2 bg-zinc-50 dark:bg-zinc-900/50 p-2 border border-zinc-100 dark:border-zinc-850">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={13}
                              className={star <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-300 dark:text-zinc-700'}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-mono font-black text-black dark:text-white">
                          {rev.rating}.0
                        </span>
                      </div>

                      {/* Author & Belt Badge */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-black uppercase text-black dark:text-white">
                          {rev.userName}
                        </span>
                        <span className={`text-[7.5px] font-mono font-bold px-1.5 py-0.2 uppercase ${beltConfig.bg} ${beltConfig.text} border ${beltConfig.border}`}>
                          {rev.belt}
                        </span>
                      </div>
                    </div>

                    {/* Criteria Breakdowns if available */}
                    {rev.criteriaRatings && (
                      <div className="grid grid-cols-3 gap-2 text-[8px] font-mono uppercase bg-zinc-50/70 dark:bg-zinc-900/30 p-2 border border-zinc-100 dark:border-zinc-900">
                        <div>
                          <span className="text-zinc-400 block truncate">
                            {rev.itemType === 'product' ? 'Durabilidade' : 'Didática'}
                          </span>
                          <span className="font-black text-black dark:text-white">
                            ⭐ {rev.criteriaRatings.durabilityOrMethodology || 5}/5
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block truncate">
                            {rev.itemType === 'product' ? 'Conforto' : 'Estrutura'}
                          </span>
                          <span className="font-black text-black dark:text-white">
                            ⭐ {rev.criteriaRatings.comfortOrStructure || 5}/5
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block truncate">Custo-Benefício</span>
                          <span className="font-black text-black dark:text-white">
                            ⭐ {rev.criteriaRatings.costBenefit || 5}/5
                          </span>
                        </div>
                      </div>
                    )}

                    {/* The Technical Comment */}
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed">
                      {rev.comment}
                    </p>

                    {/* Aspect Tags */}
                    {rev.aspectTags && rev.aspectTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {rev.aspectTags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[8px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-700 uppercase"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Helpful button & Verification */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-400">
                      <Calendar size={11} />
                      <span>{rev.date}</span>
                      {rev.isVerifiedBuyer && (
                        <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-bold ml-1">
                          <ShieldCheck size={11} />
                          <span>Verificado</span>
                        </span>
                      )}
                    </div>

                    {/* Helpful Button */}
                    <button
                      onClick={() => handleToggleHelpful(rev.id)}
                      className={`px-3 py-1.5 font-mono text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
                        hasVoted
                          ? 'bg-green-600 text-white border-green-600 shadow-xs'
                          : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                      }`}
                      title="Clique se esta avaliação técnica te ajudou a decidir"
                    >
                      <ThumbsUp size={11} className={hasVoted ? 'fill-white' : ''} />
                      <span>Esta avaliação foi útil? ({rev.helpfulCount})</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. MODAL TO WRITE A NEW REVIEW FOR PRODUCTS OR SERVICES */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 border-2 border-black dark:border-white shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto z-10 font-sans"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 text-zinc-400 hover:text-black dark:hover:text-white p-1"
                title="Fechar"
              >
                <X size={18} />
              </button>

              <div className="space-y-6">
                <div className="border-b border-zinc-100 dark:border-zinc-900 pb-4">
                  <span className="text-[8px] font-mono font-black text-green-600 uppercase tracking-widest block">
                    RELATÓRIO TÉCNICO // COMUNIDADE
                  </span>
                  <h3 className="text-lg sm:text-xl font-headline font-black uppercase tracking-tight text-black dark:text-white">
                    Compartilhar Avaliação no Tatame
                  </h3>
                  <p className="text-xs text-zinc-500 font-sans mt-0.5">
                    Sua experiência sincera ajuda praticantes de todas as faixas a escolherem os melhores equipamentos e serviços.
                  </p>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-5">
                  {formError && (
                    <div className="p-3 bg-red-500/10 border border-red-500 text-red-600 text-xs font-mono">
                      ⚠️ {formError}
                    </div>
                  )}

                  {/* 1. Item Type Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-black uppercase text-black dark:text-white">
                      1. O que você deseja avaliar?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setNewReviewType('product');
                          setSelectedTargetId('');
                        }}
                        className={`p-3 text-left border-2 transition-all cursor-pointer ${
                          newReviewType === 'product'
                            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-black'
                            : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Package size={16} />
                          <span className="text-xs font-mono font-bold uppercase">Produto / Equipamento</span>
                        </div>
                        <span className="text-[9px] opacity-70 block mt-1">Kimono, faixa, rashguard, bucal, etc.</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setNewReviewType('service');
                          setSelectedTargetId('');
                        }}
                        className={`p-3 text-left border-2 transition-all cursor-pointer ${
                          newReviewType === 'service'
                            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-black'
                            : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 size={16} />
                          <span className="text-xs font-mono font-bold uppercase">Serviço / Tatame</span>
                        </div>
                        <span className="text-[9px] opacity-70 block mt-1">Seminário, academia, dojo, curso, fisio</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Choose or Enter Item Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono font-black uppercase text-black dark:text-white">
                      2. Selecione o {newReviewType === 'product' ? 'Produto' : 'Serviço'}
                    </label>

                    {newReviewType === 'product' ? (
                      <select
                        value={selectedTargetId}
                        onChange={(e) => {
                          setSelectedTargetId(e.target.value);
                          if (e.target.value) setCustomTargetTitle('');
                        }}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono p-2.5 text-black dark:text-white focus:outline-none"
                      >
                        <option value="">-- Escolha um produto do catálogo OSS.OS ou digite abaixo --</option>
                        {productList.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.title} ({p.brand || 'BJJ'})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={selectedTargetId}
                        onChange={(e) => {
                          setSelectedTargetId(e.target.value);
                          if (e.target.value) setCustomTargetTitle('');
                        }}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono p-2.5 text-black dark:text-white focus:outline-none"
                      >
                        <option value="">-- Escolha um serviço recomendado ou digite abaixo --</option>
                        {POPULAR_SERVICES.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.title} ({s.provider})
                          </option>
                        ))}
                      </select>
                    )}

                    {!selectedTargetId && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <input
                          type="text"
                          value={customTargetTitle}
                          onChange={(e) => setCustomTargetTitle(e.target.value)}
                          placeholder={newReviewType === 'product' ? 'Nome do produto personalizado...' : 'Nome do seminário, academia ou curso...'}
                          className="w-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 text-xs font-mono p-2.5 text-black dark:text-white focus:outline-none"
                        />
                        <input
                          type="text"
                          value={customBrandOrProvider}
                          onChange={(e) => setCustomBrandOrProvider(e.target.value)}
                          placeholder={newReviewType === 'product' ? 'Marca / Fabricante...' : 'Mestre / Instrutor / Empresa...'}
                          className="w-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 text-xs font-mono p-2.5 text-black dark:text-white focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* 3. Author Info & Belt */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-mono font-black uppercase text-black dark:text-white">
                        Nome ou Apelido de Tatame
                      </label>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Ex: Lucas 'Tatu', Prof. André..."
                        className="w-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 text-xs font-mono p-2.5 text-black dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono font-black uppercase text-black dark:text-white">
                        Sua Graduação (Faixa)
                      </label>
                      <select
                        value={authorBelt}
                        onChange={(e) => setAuthorBelt(e.target.value)}
                        className="w-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 text-xs font-mono p-2.5 text-black dark:text-white focus:outline-none font-bold"
                      >
                        <option value="Faixa Branca">🥋 Faixa Branca (Iniciante)</option>
                        <option value="Faixa Azul">🥋 Faixa Azul (Graduado)</option>
                        <option value="Faixa Roxa">🥋 Faixa Roxa (Avançado)</option>
                        <option value="Faixa Marrom">🥋 Faixa Marrom (Instrutor)</option>
                        <option value="Faixa Preta">🥋 Faixa Preta (Professor / Mestre)</option>
                      </select>
                    </div>
                  </div>

                  {/* 4. Overall Star Rating */}
                  <div className="space-y-1.5 p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-black uppercase text-black dark:text-white">
                        Nota Geral
                      </label>
                      <span className="text-xs font-mono font-black text-amber-500">
                        {hoverRating || rating} de 5 Estrelas
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            size={24}
                            className={star <= (hoverRating || rating) ? 'text-amber-400 fill-amber-400' : 'text-zinc-300 dark:text-zinc-700'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 5. Specific Criteria Ratings */}
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase block truncate">
                        {newReviewType === 'product' ? 'Durabilidade' : 'Didática'}
                      </span>
                      <select
                        value={durabilityOrMethodology}
                        onChange={(e) => setDurabilityOrMethodology(Number(e.target.value))}
                        className="w-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 p-1.5 text-xs font-bold"
                      >
                        {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Estrelas</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase block truncate">
                        {newReviewType === 'product' ? 'Conforto' : 'Estrutura'}
                      </span>
                      <select
                        value={comfortOrStructure}
                        onChange={(e) => setComfortOrStructure(Number(e.target.value))}
                        className="w-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 p-1.5 text-xs font-bold"
                      >
                        {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Estrelas</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase block truncate">
                        Custo-Benefício
                      </span>
                      <select
                        value={costBenefit}
                        onChange={(e) => setCostBenefit(Number(e.target.value))}
                        className="w-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 p-1.5 text-xs font-bold"
                      >
                        {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Estrelas</option>)}
                      </select>
                    </div>
                  </div>

                  {/* 6. Technical Experience Text */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-black uppercase text-black dark:text-white flex items-center justify-between">
                      <span>Relatório da Experiência Técnica</span>
                      <span className="text-[10px] font-normal text-zinc-400">{comment.length} caracteres</span>
                    </label>
                    <textarea
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Descreva como o item se comportou no dia a dia: resistência da lapela, pegadas, lavagem, didática das técnicas, intensidade do rola..."
                      className="w-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 text-xs font-mono p-3 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white leading-relaxed"
                    />
                  </div>

                  {/* 7. Quick Aspect Tags */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase text-zinc-500">
                      Tags Rápidas de Destaque
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Lapela Forte',
                        'Não Encolhe',
                        'Caimento Impecável',
                        'Didática Nota 10',
                        'Treino Duro',
                        'Aprovado IBJJF',
                        'Secagem Rápida',
                        'Ótimo Custo-Benefício'
                      ].map(tag => {
                        const isSel = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              setSelectedTags(prev =>
                                isSel ? prev.filter(t => t !== tag) : [...prev, tag]
                              );
                            }}
                            className={`px-2 py-1 text-[9px] font-mono uppercase border transition-colors cursor-pointer ${
                              isSel
                                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-black'
                                : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                            }`}
                          >
                            {isSel ? '✓ ' : '+ '}#{tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recommend Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={recommend}
                      onChange={(e) => setRecommend(e.target.checked)}
                      className="w-4 h-4 accent-green-600 cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold text-black dark:text-white">
                      Recomendo este produto/serviço para outros praticantes de Jiu-Jitsu
                    </span>
                  </label>

                  {/* Actions */}
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 text-xs font-mono font-bold text-zinc-500 hover:text-black dark:hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'Publicando...' : 'Publicar Avaliação no Tatame'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CommunityReviewsHub;

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  ShieldCheck, 
  ThumbsUp, 
  ThumbsDown, 
  Package, 
  GraduationCap, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Award, 
  Sparkles, 
  ExternalLink, 
  ArrowLeft, 
  X, 
  AlertCircle,
  Clock,
  Calendar,
  Tag
} from 'lucide-react';
import { Review } from '@/src/types';

export interface AcquiredItem {
  id: string;
  title: string;
  type: 'product' | 'service';
  category: string;
  brandOrProvider: string;
  acquisitionDate: string;
  orderCode: string;
  imageUrl?: string;
  serviceDetails?: string;
  price: number;
  rating?: number; // 1 to 5 stars
  comment?: string;
  reviewedAt?: string;
  aspectTags?: string[];
  recommend?: boolean;
  belt?: string;
  productId?: string;
}

interface UserReviewsManagerProps {
  user: any;
  productList?: any[];
  onAddReview?: (productId: string, review: Omit<Review, 'id'>) => Promise<void> | void;
  onNavigate?: (view: string) => void;
  addToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  playClickSound?: () => void;
  onBackToOverview?: () => void;
}

const DEFAULT_ACQUIRED_ITEMS: AcquiredItem[] = [
  {
    id: 'acq-gi-01',
    title: 'Kimono Jiujiteiro H1X Gi – Flagship Edition (Pearl Weave 450 GSM)',
    type: 'product',
    category: 'Kimonos & Vestuário',
    brandOrProvider: 'Jiujiteiro Official',
    acquisitionDate: '15/07/2026',
    orderCode: '#BJJ-88412',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    price: 989.00,
    rating: 5,
    comment: 'Kimono impecável! A lapela com EVA vulcanizado é extremamente difícil de fazer pegada e a calça em Ripstop não rasga mesmo nas raspagens mais duras. Vale cada centavo.',
    reviewedAt: '20/07/2026',
    aspectTags: ['Caimento Perfeito', 'Tecido Ultrarresistente', 'Lapela Firme'],
    recommend: true,
    belt: 'Faixa Azul',
    productId: 'jiujiteiro-h1x-gi'
  },
  {
    id: 'acq-srv-01',
    title: 'Workshop Presencial: Passagem de Guarda & Pressão com Buchecha',
    type: 'service',
    category: 'Workshops & Seminários BJJ',
    brandOrProvider: 'Sympla / BJJ Pro Events',
    acquisitionDate: '02/08/2026',
    orderCode: '#SRV-90412',
    serviceDetails: 'Instrutor: Marcus Buchecha | Carga: 4h de tatame prático + sparring supervisionado',
    price: 250.00,
    rating: 5,
    comment: 'Seminário transformador. A didática do Buchecha para distribuir o peso e matar o quadril do guardeiro mudou meu jogo imediatamente no mesmo dia de treino.',
    reviewedAt: '03/08/2026',
    aspectTags: ['Didática Excelente', 'Metodologia Prática', 'Atenção Individual'],
    recommend: true,
    belt: 'Faixa Roxa'
  },
  {
    id: 'acq-gi-02',
    title: 'Rashguard Venum Tiger Compression No-Gi (IBJJF Legal)',
    type: 'product',
    category: 'Rashguards & No-Gi',
    brandOrProvider: 'Venum Brasil',
    acquisitionDate: '22/07/2026',
    orderCode: '#BJJ-77319',
    imageUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&auto=format&fit=crop&q=80',
    price: 249.90,
    productId: 'venum-elite-bjj-gi'
  },
  {
    id: 'acq-srv-02',
    title: 'Plano Semestral CT Gracie Barra Centro & Acesso Livre ao Tatame',
    type: 'service',
    category: 'Matrícula de CT & Dojos',
    brandOrProvider: 'Gracie Barra Centro Oficial',
    acquisitionDate: '01/06/2026',
    orderCode: '#CT-78210',
    serviceDetails: 'Unidade: CT Centro | Horários: Manhã, Noite e Open Mat aos Sábados',
    price: 1150.00,
    rating: 5,
    comment: 'Estrutura de ponta, tatames higienizados diariamente e professores muito atenciosos com correções detalhadas de postura e defesa pessoal.',
    reviewedAt: '15/06/2026',
    aspectTags: ['Estrutura Nota 10', 'Tatame Higienizado', 'Professores Qualificados'],
    recommend: true,
    belt: 'Faixa Azul'
  },
  {
    id: 'acq-srv-03',
    title: 'Consultoria Nutricional Individualizada de Corte de Peso Seguro para Competição BJJ',
    type: 'service',
    category: 'Nutrição & Performance Esportiva',
    brandOrProvider: 'NutriFight BJJ Performance',
    acquisitionDate: '10/08/2026',
    orderCode: '#SRV-66219',
    serviceDetails: 'Protocolo de hidratação, teste de composição corporal e estratégia pré-pesagem',
    price: 350.00
  },
  {
    id: 'acq-prod-03',
    title: 'Faixa Preta Especial Heavy Weave Algodão Japonês 12 Costuras',
    type: 'product',
    category: 'Faixas & Graduações',
    brandOrProvider: 'Atama BJJ',
    acquisitionDate: '05/05/2026',
    orderCode: '#BJJ-65120',
    imageUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=600&auto=format&fit=crop&q=80',
    price: 189.00
  }
];

const RATING_DESCRIPTIONS: Record<number, { title: string; desc: string }> = {
  1: { title: '1.0 - Insatisfatório', desc: 'Não atendeu às exigências do tatame ou apresentou defeitos.' },
  2: { title: '2.0 - Regular', desc: 'Abaixo do esperado para treinos intensos.' },
  3: { title: '3.0 - Bom', desc: 'Cumpre os requisitos essenciais com qualidade aceitável.' },
  4: { title: '4.0 - Muito Bom', desc: 'Ótima qualidade, acabamento elogiável e bom desempenho.' },
  5: { title: '5.0 - Excelente (Padrão Faixa-Preta)', desc: 'Nível mestre! Recomendado com entusiasmo para a comunidade.' }
};

const PRODUCT_TAGS = [
  'Caimento Perfeito',
  'Tecido Ultrarresistente',
  'Lapela Firme',
  'Secagem Rápida',
  'Não Encolheu',
  'Leve p/ Bater Peso',
  'Costuras Reforçadas',
  'Custo-Benefício Imbatível'
];

const SERVICE_TAGS = [
  'Didática Excelente',
  'Metodologia Prática',
  'Atenção Individual',
  'Estrutura Nota 10',
  'Tatame Higienizado',
  'Pontualidade Impecável',
  'Professores Qualificados',
  'Ambiente Motivador'
];

const BELT_OPTIONS = [
  'Faixa Branca',
  'Faixa Azul',
  'Faixa Roxa',
  'Faixa Marrom',
  'Faixa Preta',
  'Praticante Geral'
];

export const UserReviewsManager: React.FC<UserReviewsManagerProps> = ({
  user,
  productList = [],
  onAddReview,
  onNavigate,
  addToast = (_msg: string, _type?: 'success' | 'error' | 'info') => {},
  playClickSound = () => {},
  onBackToOverview
}) => {
  // Persistence state
  const [items, setItems] = useState<AcquiredItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oss_user_acquired_items');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return DEFAULT_ACQUIRED_ITEMS;
  });

  // Filter & Search state
  const [activeFilter, setActiveFilter] = useState<'all' | 'products' | 'services' | 'pending' | 'reviewed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'acquired' | 'history'>('acquired');

  // Review Modal Form state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedItemForReview, setSelectedItemForReview] = useState<AcquiredItem | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [wouldRecommend, setWouldRecommend] = useState<boolean>(true);
  const [authorBelt, setAuthorBelt] = useState<string>(user?.belt || 'Faixa Azul');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // New Item Registration Modal state
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState<'product' | 'service'>('product');
  const [newItemCategory, setNewItemCategory] = useState('Kimonos & Vestuário');
  const [newItemProvider, setNewItemProvider] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('299.90');
  const [newItemDetails, setNewItemDetails] = useState('');

  // Save to localStorage when items update
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('oss_user_acquired_items', JSON.stringify(items));
    }
  }, [items]);

  // Derived metrics
  const reviewedItems = useMemo(() => items.filter(i => typeof i.rating === 'number'), [items]);
  const pendingItems = useMemo(() => items.filter(i => typeof i.rating !== 'number'), [items]);
  
  const averageRatingGiven = useMemo(() => {
    if (reviewedItems.length === 0) return 0;
    const sum = reviewedItems.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    return (sum / reviewedItems.length).toFixed(1);
  }, [reviewedItems]);

  const totalPointsEarnedFromReviews = reviewedItems.length * 50;

  // Filtered item list
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Type/Status filter
      if (activeFilter === 'products' && item.type !== 'product') return false;
      if (activeFilter === 'services' && item.type !== 'service') return false;
      if (activeFilter === 'pending' && typeof item.rating === 'number') return false;
      if (activeFilter === 'reviewed' && typeof item.rating !== 'number') return false;

      // Search query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCategory = item.category.toLowerCase().includes(q);
        const matchProvider = item.brandOrProvider.toLowerCase().includes(q);
        const matchCode = item.orderCode.toLowerCase().includes(q);
        if (!matchTitle && !matchCategory && !matchProvider && !matchCode) return false;
      }

      return true;
    });
  }, [items, activeFilter, searchTerm]);

  // Open review modal
  const handleOpenReviewModal = (item: AcquiredItem) => {
    playClickSound();
    setSelectedItemForReview(item);
    setSelectedRating(item.rating || 5);
    setHoveredRating(null);
    setCommentText(item.comment || '');
    setSelectedTags(item.aspectTags || []);
    setWouldRecommend(item.recommend !== undefined ? item.recommend : true);
    setAuthorBelt(item.belt || user?.belt || 'Faixa Azul');
    setFormError(null);
    setIsReviewModalOpen(true);
  };

  // Toggle tag
  const handleToggleTag = (tag: string) => {
    playClickSound();
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Submit review handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForReview) return;
    setFormError(null);

    const trimmedComment = commentText.trim();
    if (trimmedComment.length < 5) {
      setFormError('Por favor, escreva um relato de pelo menos 5 caracteres sobre sua experiência.');
      return;
    }

    if (selectedRating < 1 || selectedRating > 5) {
      setFormError('Selecione uma nota de 1 a 5 estrelas.');
      return;
    }

    setIsSubmitting(true);
    playClickSound();

    try {
      const currentDate = new Date().toLocaleDateString('pt-BR');

      // 1. Update acquired item in local state
      const updatedItems = items.map(item => {
        if (item.id === selectedItemForReview.id) {
          return {
            ...item,
            rating: selectedRating,
            comment: trimmedComment,
            reviewedAt: currentDate,
            aspectTags: selectedTags,
            recommend: wouldRecommend,
            belt: authorBelt
          };
        }
        return item;
      });

      setItems(updatedItems);

      // 2. If it is linked to a productId, also sync with onAddReview (Firestore & Catalog)
      if (selectedItemForReview.productId && onAddReview) {
        const userName = user?.name || user?.displayName || 'Guerreiro do Tatame';
        const formattedName = authorBelt && authorBelt !== 'Praticante Geral'
          ? `${userName} (${authorBelt})`
          : userName;

        await onAddReview(selectedItemForReview.productId, {
          userName: formattedName,
          rating: selectedRating,
          comment: trimmedComment,
          date: currentDate,
          userId: user?.uid || 'user_' + Date.now(),
          belt: authorBelt,
          isVerifiedBuyer: true,
          helpfulCount: 0
        });
      }

      // 3. Store published review in user's review registry
      if (typeof window !== 'undefined') {
        const publishedReviewsKey = 'oss_user_published_reviews';
        const existing = JSON.parse(localStorage.getItem(publishedReviewsKey) || '[]');
        const newEntry = {
          id: `rev_${Date.now()}`,
          itemId: selectedItemForReview.id,
          itemTitle: selectedItemForReview.title,
          itemType: selectedItemForReview.type,
          rating: selectedRating,
          comment: trimmedComment,
          date: currentDate,
          belt: authorBelt,
          tags: selectedTags,
          recommend: wouldRecommend
        };
        const updatedList = [newEntry, ...existing.filter((r: any) => r.itemId !== selectedItemForReview.id)];
        localStorage.setItem(publishedReviewsKey, JSON.stringify(updatedList));
      }

      addToast("Avaliação registrada com sucesso! +50 pontos de fidelidade adicionados.", "success");
      setIsReviewModalOpen(false);
    } catch (err: any) {
      console.error("Erro ao registrar avaliação:", err);
      setFormError("Ocorreu um erro ao salvar a avaliação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete review handler
  const handleDeleteReview = (itemId: string) => {
    if (!confirm("Deseja realmente remover esta avaliação?")) return;
    playClickSound();

    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const { rating, comment, reviewedAt, aspectTags, recommend, ...rest } = item;
        return rest;
      }
      return item;
    }));

    addToast("Avaliação removida.", "info");
  };

  // Add custom acquired item
  const handleAddNewAcquiredItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    playClickSound();
    const newItem: AcquiredItem = {
      id: `acq_custom_${Date.now()}`,
      title: newItemTitle.trim(),
      type: newItemType,
      category: newItemCategory,
      brandOrProvider: newItemProvider.trim() || (newItemType === 'product' ? 'Loja Parceira' : 'Centro de Treinamento'),
      acquisitionDate: new Date().toLocaleDateString('pt-BR'),
      orderCode: `#${newItemType === 'product' ? 'BJJ' : 'SRV'}-${Math.floor(10000 + Math.random() * 90000)}`,
      price: parseFloat(newItemPrice) || 199.90,
      serviceDetails: newItemDetails.trim() || undefined
    };

    setItems(prev => [newItem, ...prev]);
    setIsAddItemModalOpen(false);
    setNewItemTitle('');
    setNewItemDetails('');
    setNewItemProvider('');
    addToast(`${newItemType === 'product' ? 'Produto' : 'Serviço'} registrado com sucesso na sua lista!`, "success");
  };

  const currentDisplayRating = hoveredRating || selectedRating;

  return (
    <div className="space-y-8">
      {/* Return Bar / Navigation Breadcrumb */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          {onBackToOverview && (
            <button
              onClick={() => {
                playClickSound();
                onBackToOverview();
              }}
              className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white text-[10px] font-mono font-black uppercase tracking-wider border border-zinc-300 dark:border-zinc-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#ffffff]"
              title="Retornar à Visão Geral do Painel"
            >
              <ArrowLeft size={12} />
              <span>← Voltar à Visão Geral</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-black px-2 py-0.5 text-[9px] font-mono font-black uppercase tracking-widest border border-black shadow-sm">
              SISTEMA DE AVALIAÇÕES
            </span>
            <span className="text-[10px] font-mono text-zinc-400 uppercase hidden sm:inline">
              PRODUTOS & SERVIÇOS DO TATAME
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            playClickSound();
            setIsAddItemModalOpen(true);
          }}
          className="px-3.5 py-2 bg-black text-white dark:bg-white dark:text-black hover:bg-green-600 dark:hover:bg-green-600 hover:text-white dark:hover:text-white text-[10px] font-mono font-black uppercase tracking-wider border border-black dark:border-white transition-all cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#ffffff]"
        >
          <Plus size={12} />
          <span>+ Registrar Compra / Serviço</span>
        </button>
      </div>

      {/* Hero Header */}
      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-black dark:text-white italic -skew-x-3 flex items-center gap-3">
          <Star className="fill-amber-400 text-amber-400" size={26} />
          <span>AVALIAÇÕES & COMENTÁRIOS DE PRATICANTES</span>
        </h3>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-sans max-w-3xl leading-relaxed">
          Atribua notas de <strong>1 a 5 estrelas</strong> e relate com detalhes sua experiência real no tatame com os <strong>produtos adquiridos</strong> (kimonos, faixas, rashguards) e <strong>serviços contratados</strong> (workshops, seminários, matrículas em CTs e consultorias). Cada avaliação publicada concede <strong>+50 pontos de fidelidade</strong>.
        </p>
      </div>

      {/* METRIC SCOREBOARD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_#ffffff]">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[9px] font-mono font-black uppercase tracking-widest">ITENS ADQUIRIDOS</span>
            <Package size={14} className="text-black dark:text-white" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-black dark:text-white">
            {items.length}
          </div>
          <div className="text-[9px] font-mono text-zinc-500 mt-1 flex items-center gap-1">
            <span>{items.filter(i => i.type === 'product').length} produtos</span>
            <span>•</span>
            <span>{items.filter(i => i.type === 'service').length} serviços</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_#ffffff]">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[9px] font-mono font-black uppercase tracking-widest">AVALIAÇÕES FEITAS</span>
            <MessageSquare size={14} className="text-green-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-green-600">
            {reviewedItems.length}
          </div>
          <div className="text-[9px] font-mono text-zinc-500 mt-1">
            {pendingItems.length > 0 ? `${pendingItems.length} aguardando seu relato` : 'Todas em dia! Oss!'}
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_#ffffff]">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[9px] font-mono font-black uppercase tracking-widest">MÉDIA DE NOTAS DADAS</span>
            <Star size={14} className="text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-black dark:text-white flex items-baseline gap-1">
            <span>{averageRatingGiven || '—'}</span>
            {averageRatingGiven ? <span className="text-xs text-zinc-400 font-mono">/ 5.0 ★</span> : null}
          </div>
          <div className="text-[9px] font-mono text-zinc-500 mt-1">
            Critério rigoroso do tatame
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_#ffffff]">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[9px] font-mono font-black uppercase tracking-widest">PONTOS GANHOS</span>
            <Award size={14} className="text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-amber-500">
            +{totalPointsEarnedFromReviews}
          </div>
          <div className="text-[9px] font-mono text-zinc-500 mt-1">
            +50 pts por avaliação publicada
          </div>
        </div>
      </div>

      {/* TAB SELECTOR & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        {/* Sub-tabs */}
        <div className="flex items-center gap-1 border-b-2 border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => {
              playClickSound();
              setActiveSubTab('acquired');
            }}
            className={`px-4 py-2.5 text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer border-b-2 -mb-[2px] flex items-center gap-2 ${
              activeSubTab === 'acquired'
                ? 'border-green-600 text-black dark:text-white bg-zinc-100 dark:bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Package size={13} />
            <span>Itens Adquiridos ({items.length})</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveSubTab('history');
            }}
            className={`px-4 py-2.5 text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer border-b-2 -mb-[2px] flex items-center gap-2 ${
              activeSubTab === 'history'
                ? 'border-green-600 text-black dark:text-white bg-zinc-100 dark:bg-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <MessageSquare size={13} />
            <span>Minhas Avaliações Publicadas ({reviewedItems.length})</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 w-full md:w-72">
          <Search size={14} className="text-zinc-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar produto, serviço ou pedido..."
            className="w-full bg-transparent border-none outline-none font-mono text-xs text-black dark:text-white placeholder-zinc-400"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-zinc-400 hover:text-black dark:hover:text-white">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* FILTER PILLS (Only on acquired tab) */}
      {activeSubTab === 'acquired' && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[9px] font-mono font-black uppercase text-zinc-400 mr-1 flex items-center gap-1">
            <Filter size={10} />
            <span>Filtrar:</span>
          </span>
          {[
            { id: 'all', label: `Todos (${items.length})` },
            { id: 'products', label: `Produtos (${items.filter(i => i.type === 'product').length})` },
            { id: 'services', label: `Serviços (${items.filter(i => i.type === 'service').length})` },
            { id: 'pending', label: `Pendentes de Avaliação (${pendingItems.length})` },
            { id: 'reviewed', label: `Já Avaliados (${reviewedItems.length})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                playClickSound();
                setActiveFilter(f.id as any);
              }}
              className={`px-3 py-1 text-[9px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer border ${
                activeFilter === f.id
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-[2px_2px_0px_#16a34a]'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-800 hover:text-black dark:hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 1: ITENS ADQUIRIDOS (PRODUTOS E SERVIÇOS PRONTOS PARA AVALIAR) */}
      {/* ========================================================================= */}
      {activeSubTab === 'acquired' && (
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 px-4 bg-zinc-50 dark:bg-zinc-950 border-2 border-dashed border-zinc-200 dark:border-zinc-800 space-y-4">
              <Package size={36} className="mx-auto text-zinc-400" />
              <h4 className="font-mono text-sm font-black uppercase text-black dark:text-white">
                Nenhum item encontrado para este filtro
              </h4>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Cadastre um produto adquirido ou serviço de tatame recém-contratado para começar a avaliar.
              </p>
              <button
                onClick={() => setIsAddItemModalOpen(true)}
                className="px-4 py-2 bg-green-600 text-black font-mono font-black uppercase text-xs tracking-wider cursor-pointer shadow-[2px_2px_0px_#000000]"
              >
                + Registrar Compra / Serviço
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const isReviewed = typeof item.rating === 'number';
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-white dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_#ffffff] flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between flex-wrap gap-2 text-[9px] font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 font-black uppercase border ${
                            item.type === 'service'
                              ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                              : 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                          }`}>
                            {item.type === 'service' ? '🏢 SERVIÇO DE TATAME' : '🥋 PRODUTO / EQUIPAMENTO'}
                          </span>
                          <span className="text-zinc-400 font-mono">
                            {item.orderCode}
                          </span>
                        </div>

                        <span className="text-zinc-500 font-mono">
                          Adquirido em {item.acquisitionDate}
                        </span>
                      </div>

                      {/* Main Title & Provider */}
                      <div>
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider text-green-600 dark:text-green-400 block mb-0.5">
                          {item.brandOrProvider} • {item.category}
                        </span>
                        <h4 className="text-sm font-black uppercase text-black dark:text-white leading-snug">
                          {item.title}
                        </h4>
                        {item.serviceDetails && (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-mono bg-zinc-50 dark:bg-zinc-900/60 p-2 border-l-2 border-purple-500">
                            {item.serviceDetails}
                          </p>
                        )}
                      </div>

                      {/* Review Status Display */}
                      {isReviewed ? (
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-amber-500">{item.rating?.toFixed(1)}</span>
                              <div className="flex items-center text-amber-400">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    size={12}
                                    className={s <= (item.rating || 0) ? 'fill-amber-400 text-amber-400' : 'fill-zinc-200 text-zinc-300 dark:fill-zinc-800 dark:text-zinc-700'}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-[9px] text-zinc-400">
                              Avaliado em {item.reviewedAt}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-700 dark:text-zinc-300 italic font-sans line-clamp-2">
                            "{item.comment}"
                          </p>

                          {item.aspectTags && item.aspectTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {item.aspectTags.map(tag => (
                                <span key={tag} className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[8px] font-mono uppercase font-bold">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-[11px] font-mono">
                            <AlertCircle size={14} className="text-amber-600 shrink-0" />
                            <span>Aguardando seu relato sobre este {item.type === 'service' ? 'serviço' : 'equipamento'}.</span>
                          </div>
                          <span className="text-[9px] font-mono font-black text-green-600 uppercase shrink-0">
                            +50 PTS
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        R$ {item.price.toFixed(2)}
                      </span>

                      <div className="flex items-center gap-2">
                        {isReviewed ? (
                          <>
                            <button
                              onClick={() => handleOpenReviewModal(item)}
                              className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-mono font-black text-[9px] uppercase tracking-wider border border-zinc-300 dark:border-zinc-700 transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Edit3 size={11} />
                              <span>Editar Relato</span>
                            </button>
                            <button
                              onClick={() => handleDeleteReview(item.id)}
                              className="p-1.5 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Remover Avaliação"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleOpenReviewModal(item)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-black font-mono font-black text-[10px] uppercase tracking-wider border border-black dark:border-white shadow-[2px_2px_0px_#000000] dark:shadow-[2px_2px_0px_#ffffff] transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Star size={12} className="fill-black" />
                            <span>Avaliar {item.type === 'service' ? 'Serviço' : 'Produto'} (+50 pts)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: HISTÓRICO DE AVALIAÇÕES PUBLICADAS */}
      {/* ========================================================================= */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          {reviewedItems.length === 0 ? (
            <div className="text-center py-16 px-4 bg-zinc-50 dark:bg-zinc-950 border-2 border-dashed border-zinc-200 dark:border-zinc-800 space-y-4">
              <MessageSquare size={36} className="mx-auto text-zinc-400" />
              <h4 className="font-mono text-sm font-black uppercase text-black dark:text-white">
                Nenhuma avaliação publicada ainda
              </h4>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Você ainda não registrou notas ou comentários sobre seus produtos e serviços. Escolha um item adquirido e conte sua experiência.
              </p>
              <button
                onClick={() => {
                  playClickSound();
                  setActiveSubTab('acquired');
                }}
                className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-mono font-black uppercase text-xs tracking-wider cursor-pointer shadow-[2px_2px_0px_#16a34a]"
              >
                Ver Itens Adquiridos Disponíveis
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-5 sm:p-6 bg-white dark:bg-zinc-950 border-2 border-black dark:border-zinc-800 shadow-[3px_3px_0px_#000000] dark:shadow-[3px_3px_0px_#ffffff] space-y-3"
                >
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[8.5px] font-mono font-black uppercase border ${
                          item.type === 'service'
                            ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                            : 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                        }`}>
                          {item.type === 'service' ? 'SERVIÇO' : 'PRODUTO'}
                        </span>
                        <span className="text-[10px] font-mono font-black text-zinc-400 uppercase">
                          {item.brandOrProvider}
                        </span>
                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {item.category}
                        </span>
                      </div>
                      <h4 className="text-base font-black uppercase text-black dark:text-white">
                        {item.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenReviewModal(item)}
                        className="px-2.5 py-1 text-[9px] font-mono font-black uppercase bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Edit3 size={10} />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDeleteReview(item.id)}
                        className="p-1 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Remover avaliação"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Rating Stars Bar */}
                  <div className="flex items-center gap-3 py-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={15}
                          className={star <= (item.rating || 0) ? 'fill-amber-400 text-amber-400' : 'fill-zinc-200 text-zinc-300 dark:fill-zinc-800 dark:text-zinc-700'}
                        />
                      ))}
                    </div>
                    <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                      {item.rating?.toFixed(1)} / 5.0
                    </span>
                    <span className="text-zinc-400 text-xs font-mono">•</span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      Publicado em {item.reviewedAt}
                    </span>
                    {item.recommend && (
                      <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 text-[8.5px] font-mono font-black uppercase">
                        <ThumbsUp size={10} />
                        <span>Recomenda este {item.type === 'service' ? 'serviço' : 'produto'}</span>
                      </span>
                    )}
                  </div>

                  {/* Comment Body */}
                  <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                    "{item.comment}"
                  </div>

                  {/* Tags and Belt Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[9px] font-mono">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.aspectTags?.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 uppercase font-black">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.belt && (
                        <span className="px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black font-black uppercase">
                          Graduação: {item.belt}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-green-600 font-black uppercase">
                        <ShieldCheck size={11} />
                        <span>Comprador Verificado</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: FORMULÁRIO DE AVALIAÇÃO DE 1 A 5 ESTRELAS & COMENTÁRIO */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isReviewModalOpen && selectedItemForReview && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReviewModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 border-2 border-black dark:border-zinc-700 shadow-2xl overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b-2 border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[8.5px] font-mono font-black uppercase border ${
                      selectedItemForReview.type === 'service'
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-400'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-400'
                    }`}>
                      {selectedItemForReview.type === 'service' ? 'AVALIAÇÃO DE SERVIÇO' : 'AVALIAÇÃO DE PRODUTO'}
                    </span>
                    <span className="text-zinc-400 text-[9px] font-mono">{selectedItemForReview.orderCode}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black uppercase text-black dark:text-white line-clamp-1 mt-1">
                    {selectedItemForReview.title}
                  </h3>
                </div>

                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmitReview} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
                {formError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 font-mono text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* 1 to 5 Stars Interactive Rating Selector */}
                <div className="space-y-2 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-black dark:text-white">
                    1. SUA NOTA NO TATAME (DE 1 A 5 ESTRELAS) *
                  </label>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1 bg-white dark:bg-zinc-950 p-2 border border-zinc-300 dark:border-zinc-700 shadow-sm">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          type="button"
                          whileHover={{ scale: 1.25 }}
                          whileTap={{ scale: 0.9 }}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(null)}
                          onClick={() => {
                            playClickSound();
                            setSelectedRating(star);
                          }}
                          className="p-1 focus:outline-none cursor-pointer"
                          title={`Dar nota ${star} estrelas`}
                        >
                          <Star
                            size={24}
                            className={`transition-colors duration-150 ${
                              star <= currentDisplayRating
                                ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                                : 'fill-zinc-200 text-zinc-300 dark:fill-zinc-800 dark:text-zinc-700'
                            }`}
                          />
                        </motion.button>
                      ))}
                    </div>

                    <div className="flex-1 min-w-[200px]">
                      <div className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                        {RATING_DESCRIPTIONS[currentDisplayRating]?.title}
                      </div>
                      <div className="font-sans text-[11px] text-zinc-500">
                        {RATING_DESCRIPTIONS[currentDisplayRating]?.desc}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments Textarea */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      2. SEU RELATO / COMENTÁRIO TÉCNICO *
                    </label>
                    <span className={`text-[9px] font-mono ${commentText.length < 5 ? 'text-zinc-400' : 'text-green-600'}`}>
                      {commentText.length}/600 caracteres (mín. 5)
                    </span>
                  </div>

                  <textarea
                    required
                    minLength={5}
                    maxLength={600}
                    rows={4}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={
                      selectedItemForReview.type === 'service'
                        ? 'Ex: Relate como foi a didática do professor, pontualidade, estrutura física do dojo, clareza das técnicas explicadas e se o conteúdo foi fácil de aplicar nos treinos de luta...'
                        : 'Ex: Relate como foi o caimento no corpo (A1, A2, etc.), se a lapela segura bem as pegadas, se a calça em ripstop é resistente e se o tecido encolheu após a lavagem...'
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-900 p-3.5 border-2 border-zinc-300 dark:border-zinc-700 font-sans text-xs text-black dark:text-white outline-none focus:border-green-600 transition-colors resize-none leading-relaxed"
                  />
                  <span className="text-[9px] font-mono text-zinc-400 block">
                    Dica OSS: Comentários objetivos e honestos ajudam outros praticantes a investir nos melhores equipamentos e treinos.
                  </span>
                </div>

                {/* Aspect Highlights Tags */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    3. PONTOS FORTES / DESTAQUES (OPCIONAL)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedItemForReview.type === 'service' ? SERVICE_TAGS : PRODUCT_TAGS).map(tag => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className={`px-2.5 py-1 text-[9px] font-mono font-black uppercase border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-green-600 text-black border-green-700 font-black shadow-sm'
                              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-800 hover:border-black dark:hover:border-white'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}#{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Recommendation & Belt Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  {/* Would Recommend? */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-black uppercase text-zinc-500">
                      RECOMENDA ESTE {selectedItemForReview.type === 'service' ? 'SERVIÇO' : 'PRODUTO'}?
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setWouldRecommend(true);
                        }}
                        className={`flex-1 py-2 text-xs font-mono font-black uppercase border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          wouldRecommend
                            ? 'bg-green-600 text-black border-black font-black shadow-sm'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border-zinc-300 dark:border-zinc-800'
                        }`}
                      >
                        <ThumbsUp size={13} />
                        <span>Sim, Recomendo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setWouldRecommend(false);
                        }}
                        className={`flex-1 py-2 text-xs font-mono font-black uppercase border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          !wouldRecommend
                            ? 'bg-red-600 text-white border-black font-black shadow-sm'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border-zinc-300 dark:border-zinc-800'
                        }`}
                      >
                        <ThumbsDown size={13} />
                        <span>Não Recomendo</span>
                      </button>
                    </div>
                  </div>

                  {/* Belt Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-black uppercase text-zinc-500">
                      SUA FAIXA NO TATAME
                    </label>
                    <select
                      value={authorBelt}
                      onChange={(e) => setAuthorBelt(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-mono text-black dark:text-white p-2.5 outline-none"
                    >
                      {BELT_OPTIONS.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2.5 font-mono text-xs text-zinc-500 hover:text-black dark:hover:text-white uppercase cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || commentText.trim().length < 5}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-black font-mono font-black uppercase text-xs tracking-wider flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000000] transition-all"
                  >
                    <Star size={13} className="fill-black" />
                    <span>{isSubmitting ? 'Publicando...' : 'Publicar Avaliação (+50 pts)'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: REGISTRAR NOVO PRODUTO OU SERVIÇO ADQUIRIDO */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAddItemModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddItemModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border-2 border-black dark:border-zinc-700 shadow-2xl overflow-hidden z-10 my-auto"
            >
              <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plus size={16} className="text-green-600" />
                  <h3 className="text-sm font-black uppercase text-black dark:text-white font-mono">
                    REGISTRAR ITEM OU SERVIÇO ADQUIRIDO
                  </h3>
                </div>
                <button onClick={() => setIsAddItemModalOpen(false)} className="text-zinc-400 hover:text-black dark:hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddNewAcquiredItem} className="p-5 sm:p-6 space-y-4">
                {/* Type Selection */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono font-black uppercase text-zinc-500">
                    TIPO DE AQUISIÇÃO *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setNewItemType('product');
                        setNewItemCategory('Kimonos & Vestuário');
                      }}
                      className={`p-2.5 font-mono text-xs font-black uppercase border flex items-center justify-center gap-2 transition-all ${
                        newItemType === 'product'
                          ? 'bg-blue-600 text-white border-black shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-800'
                      }`}
                    >
                      <Package size={14} />
                      <span>Produto / Armadura</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setNewItemType('service');
                        setNewItemCategory('Workshops & Seminários BJJ');
                      }}
                      className={`p-2.5 font-mono text-xs font-black uppercase border flex items-center justify-center gap-2 transition-all ${
                        newItemType === 'service'
                          ? 'bg-purple-600 text-white border-black shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-800'
                      }`}
                    >
                      <GraduationCap size={14} />
                      <span>Serviço de Tatame</span>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-black uppercase text-zinc-500">
                    NOME DO {newItemType === 'product' ? 'PRODUTO' : 'SERVIÇO / WORKSHOP / CT'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    placeholder={newItemType === 'product' ? 'Ex: Kimono KVRA Black Armor A2' : 'Ex: Workshop de Guarda Lapela com Mestre X'}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 p-2.5 font-mono text-xs text-black dark:text-white outline-none focus:border-green-600"
                  />
                </div>

                {/* Provider and Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-black uppercase text-zinc-500">
                      MARCA OU PRESTADOR DO SERVIÇO
                    </label>
                    <input
                      type="text"
                      value={newItemProvider}
                      onChange={(e) => setNewItemProvider(e.target.value)}
                      placeholder="Ex: Venum, Atama, Gracie Barra..."
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 p-2.5 font-mono text-xs text-black dark:text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-black uppercase text-zinc-500">
                      VALOR ESTIMADO (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 p-2.5 font-mono text-xs text-black dark:text-white outline-none"
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-black uppercase text-zinc-500">
                    DETALHES ADICIONAIS / HORÁRIOS / MODELO
                  </label>
                  <input
                    type="text"
                    value={newItemDetails}
                    onChange={(e) => setNewItemDetails(e.target.value)}
                    placeholder="Ex: Carga horária 4h, professor titular, tamanho A2..."
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 p-2.5 font-mono text-xs text-black dark:text-white outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsAddItemModalOpen(false)}
                    className="px-4 py-2 font-mono text-xs text-zinc-500 uppercase cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-green-600 hover:bg-green-500 text-black font-mono font-black uppercase text-xs tracking-wider cursor-pointer shadow-[2px_2px_0px_#000000]"
                  >
                    Salvar na Lista
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

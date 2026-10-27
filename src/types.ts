export type MainCategory = 'Vestuário' | 'Equipamentos' | 'Suplementos' | 'Acessórios';

export interface DetailedSubcategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  badge?: string;
  keywords?: string[];
}

export interface SubcategoryGroup {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  subcategories: DetailedSubcategory[];
}

export interface MainCategoryConfig {
  id: MainCategory;
  name: string;
  slug: string;
  icon: string;
  kanji: string;
  tagline: string;
  description: string;
  gradientBg: string;
  accentColor: string;
  borderAccent: string;
  groups: SubcategoryGroup[];
}

export type Category = 
  | 'Vestuário'
  | 'Equipamentos'
  | 'Suplementos'
  | 'Acessórios'
  | 'Equipamentos para Iniciantes'
  | 'Roupas de Competição'
  | 'Acessórios de Treino'
  | 'Nutrição Esportiva'
  | 'Livros/DVDs de Técnicas'
  | 'Kimonos' 
  | 'Rashguards' 
  | 'Bermudas' 
  | 'Shorts'
  | 'Faixas' 
  | 'Protetores' 
  | 'Equipamentos de Proteção' 
  | 'Serviços' 
  | 'Tatames'
  | 'Mats'
  | 'Cursos Online'
  | 'E-books'
  | 'Nutrição'
  | 'Conteúdo Digital';
export type PopularityFilter = 'all' | 'popular' | 'best_sellers' | 'trending' | 'champions';
export type Gender = 'Masculino' | 'Feminino' | 'Unissex' | 'Infantil';

export interface ProductOffer {
  id?: string;
  storeName: string;
  price: number;
  url: string;
  isAvailable: boolean;
  shippingPrice?: number;
  shippingInfo?: string;
  previousPrice?: number;
  updatedAt?: string;
  isFirestoreSync?: boolean;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
  alertEnabled: boolean;
  targetPrice?: number;
  lastNotifiedPrice?: number;
  notificationType?: 'email' | 'push' | 'both';
  notificationEmail?: string;
  channels?: {
    push: boolean;
    email: boolean;
    app: boolean;
  };
  lastNotifiedAt?: string;
}

export interface InAppPriceAlertNotification {
  id: string;
  productId: string;
  productTitle: string;
  productBrand?: string;
  productImage: string;
  targetPrice: number;
  currentPrice: number;
  originalPrice?: number;
  discountPct?: number;
  savings: number;
  platform: string;
  type: 'target_met' | 'promo_drop' | 'flash_deal';
  createdAt: string;
  isRead: boolean;
  channelsNotified?: ('push' | 'email' | 'app')[];
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  userAvatar?: string;
  userId?: string;
  isFeatured?: boolean;
  isApproved?: boolean;
  belt?: string;
  helpfulCount?: number;
  isVerifiedBuyer?: boolean;
}

export interface PricePoint {
  date: string;
  isPromo?: boolean;
  [key: string]: number | boolean | string | undefined;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  affiliateUrl: string;
  platform: 'Amazon' | 'Mercado Livre' | 'Shopee' | 'Shein' | 'TikTok' | 'Netshoes' | 'Centauro' | 'Decathlon' | 'Growth' | 'Venum' | 'KVRA' | 'Hotmart' | 'Sympla' | 'Jiujiteiro' | 'Jiujiteiro Official' | 'BJJ Fanatics' | 'Dux Nutrition';
  category: Category;
  brand?: string;
  size?: string[];
  gender?: Gender;
  colors?: string[];
  beltColor?: string;
  belts?: string[];
  isBestPrice?: boolean;
  rating?: number;
  subCategory?: string;
  mainCategory?: MainCategory;
  subCategoryGroup?: string;
  subCategoryDetailed?: string;
  borderClass?: string;
  galleryImages?: string[];
  isCurated?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  offers?: ProductOffer[];
  reviews?: Review[];
  priceHistory?: PricePoint[];
  popularity?: number;
  trendScore?: number;
  salesCount?: number;
  practitionerLevel?: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Todos';
  productType?: 'Uniforme' | 'Equipamento' | 'Acessório' | 'Serviço' | 'Suplemento' | 'Outros';
  seoKeywords?: string[];
  seoOptimizedTitle?: string;
  seoOptimizedDescription?: string;
  seoScore?: number;
  seoSearchIntent?: 'Transacional' | 'Informacional' | 'Comparativo';
  seoAnalysis?: ProductSeoAnalysis;
}

export interface ProductSeoAnalysis {
  productId: string;
  originalTitle: string;
  suggestedTitle: string;
  originalDescription: string;
  suggestedDescription: string;
  primaryKeywords: string[];
  secondaryKeywords: string[];
  longTailKeywords: string[];
  missingKeywords: string[];
  searchIntent: 'Transacional' | 'Informacional' | 'Comparativo';
  seoScore: number;
  potentialSeoScore: number;
  strengths: string[];
  improvements: string[];
  keywordDensity: { keyword: string; count: number; status: 'Ideal' | 'Baixo' | 'Excesso' }[];
  analyzedAt?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  role?: string;
  date: string;
  imageUrl: string;
  sponsoredUrl?: string;
  imageCredit?: string;
  imageSourceUrl?: string;
  audioUrl?: string;
  hasAudio?: boolean;
  useSpeechSynthesis?: boolean;
  hasVideo?: boolean;
  videoUrl?: string;
  sourceUrl?: string;
  category: 'News' | 'Results' | 'Tutorial' | 'Lifestyle' | 'Podcast' | 'Interview' | 'Academy' | 'Philosophy' | 'Mindset' | 'Gear Review' | 'History' | 'Culture' | 'Guia de Kimonos' | 'Reviews de Marcas' | 'Dicas de Treino' | 'Entrevistas';
  readTime?: string;
  price?: number;
  tags?: string[];
  isPremium?: boolean;
}

export interface CartItem {
  id: string; // unique ID for product-size combinations in the cart
  product: Product;
  size: string;
  quantity: number;
}

export interface CategoryNotificationTopic {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  isSubscribed: boolean;
  productCount?: number;
  isAutoRecommended?: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  beltColor?: string;
  points: number;
  streak?: number;
  academyId?: string;
  createdAt?: string;
  updatedAt?: string;
  lgpdConsent?: {
    approvedCadastral: boolean;
    approvedWishlistAlerts: boolean;
    approvedSessionCookies: boolean;
    approvedNavigation: boolean;
    consentDate: string; // ISO String
    userAgent: string;
    ipMock?: string; // Optional legal audit trail marker
  };
}



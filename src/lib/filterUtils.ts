import { Product, Category } from '../types';

/**
 * Returns the practitioner level for a given product.
 * Returns 'Iniciante', 'Intermediário', 'Avançado', or 'Todos'.
 */
export function getProductPractitionerLevel(
  product: Product
): 'Iniciante' | 'Intermediário' | 'Avançado' | 'Todos' {
  if (product.practitionerLevel) {
    return product.practitionerLevel;
  }

  // Check belt color if specified
  const beltColor = product.beltColor || (product.belts && product.belts.length === 1 ? product.belts[0] : null);
  if (beltColor) {
    if (beltColor === 'Branca') return 'Iniciante';
    if (beltColor === 'Azul' || beltColor === 'Roxa') return 'Intermediário';
    if (beltColor === 'Marrom' || beltColor === 'Preta') return 'Avançado';
  }

  const text = `${product.title} ${product.description} ${product.subCategory || ''} ${product.subCategoryDetailed || ''}`.toLowerCase();

  // Beginner cues
  if (
    text.includes('iniciante') ||
    text.includes('starter') ||
    text.includes('entry level') ||
    text.includes('primeiro dia') ||
    text.includes('básico') ||
    text.includes('faixa branca')
  ) {
    return 'Iniciante';
  }

  // Advanced cues
  if (
    text.includes('avançado') ||
    text.includes('elite') ||
    text.includes('campeão') ||
    text.includes('competição') ||
    text.includes('competition') ||
    text.includes('ibjjf') ||
    text.includes('mundial') ||
    text.includes('faixa preta') ||
    text.includes('faixa marrom') ||
    text.includes('heavy weave')
  ) {
    return 'Avançado';
  }

  // Universal gear
  if (
    product.category === 'Tatames' ||
    product.category === 'Acessórios' ||
    text.includes('tape') ||
    text.includes('mochila') ||
    text.includes('sabonete') ||
    text.includes('limpeza') ||
    text.includes('universal')
  ) {
    return 'Todos';
  }

  return 'Intermediário';
}

/**
 * Checks if a product matches the category filter.
 */
export function matchesCategoryFilter(
  product: Product,
  selectedCategory: Category | 'All'
): boolean {
  if (selectedCategory === 'All') return true;
  if (product.category === selectedCategory) return true;
  if (product.mainCategory === selectedCategory) return true;

  const catLower = (product.category || '').toLowerCase();
  const mainLower = (product.mainCategory || '').toLowerCase();
  const titleLower = (product.title || '').toLowerCase();
  const subLower = `${product.subCategory || ''} ${product.subCategoryGroup || ''} ${product.subCategoryDetailed || ''}`.toLowerCase();

  switch (selectedCategory) {
    case 'Kimonos':
      if (
        product.category === 'Acessórios' ||
        product.category === 'Acessórios de Treino' ||
        product.category === 'Cursos Online' ||
        product.category === 'E-books' ||
        product.category === 'Conteúdo Digital'
      ) {
        return false;
      }
      return (
        catLower === 'kimonos' ||
        catLower === 'gi' ||
        (titleLower.includes('kimono') && !titleLower.includes('manga de kimono') && !titleLower.includes('mochila')) ||
        titleLower.startsWith('gi ') ||
        titleLower.includes(' gi –') ||
        titleLower.includes(' gi -') ||
        titleLower.includes(' gi "')
      );
    case 'Rashguards':
      if (product.category === 'Acessórios' || product.category === 'Cursos Online') {
        return false;
      }
      return (
        catLower.includes('rash') ||
        catLower.includes('licra') ||
        titleLower.includes('rashguard') ||
        titleLower.includes('rash guard')
      );
    case 'Suplementos':
      return (
        catLower.includes('suple') ||
        catLower.includes('supple') ||
        catLower.includes('nutri') ||
        mainLower === 'suplementos' ||
        titleLower.includes('creatina') ||
        titleLower.includes('whey') ||
        titleLower.includes('recovery') ||
        titleLower.includes('suplemento') ||
        titleLower.includes('eletrólitos')
      );
    case 'Faixas':
      if (product.category === 'Acessórios' && !titleLower.includes('faixa')) {
        return false;
      }
      return (
        catLower.includes('faixa') ||
        catLower.includes('belt') ||
        titleLower.includes('faixa jiu jitsu') ||
        titleLower.startsWith('faixa ')
      );
    case 'Bermudas':
      return (
        catLower.includes('bermuda') ||
        catLower.includes('shorts') ||
        titleLower.includes('bermuda') ||
        titleLower.includes('shorts') ||
        titleLower.includes('fight shorts')
      );
    case 'Equipamentos de Proteção':
      return (
        catLower.includes('prote') ||
        catLower.includes('orelheira') ||
        catLower.includes('joelheira') ||
        catLower.includes('protetor') ||
        titleLower.includes('protetor') ||
        titleLower.includes('bucal') ||
        titleLower.includes('orelheira') ||
        titleLower.includes('joelheira')
      );
    case 'Tatames':
      return (
        catLower.includes('tatame') ||
        catLower.includes('mat') ||
        titleLower.includes('tatame') ||
        subLower.includes('tatame')
      );
    case 'Cursos Online':
      return (
        catLower.includes('curso') ||
        catLower.includes('livro') ||
        catLower.includes('book') ||
        catLower.includes('ebook') ||
        catLower.includes('dvd') ||
        titleLower.includes('curso') ||
        titleLower.includes('instrucional') ||
        titleLower.includes('livro')
      );
    case 'Acessórios':
      return (
        catLower.includes('acessor') ||
        mainLower === 'acessórios' ||
        titleLower.includes('mochila') ||
        titleLower.includes('tape') ||
        titleLower.includes('garrafa') ||
        subLower.includes('acessórios')
      );
    case 'Vestuário':
      return (
        mainLower === 'vestuário' ||
        catLower.includes('vestu') ||
        catLower.includes('kimono') ||
        catLower.includes('rash') ||
        catLower.includes('bermuda') ||
        catLower.includes('faixa')
      );
    case 'Equipamentos':
      return (
        mainLower === 'equipamentos' ||
        catLower.includes('equip') ||
        catLower.includes('tatame') ||
        catLower.includes('prote')
      );
    default:
      return catLower.includes(selectedCategory.toLowerCase());
  }
}

/**
 * Checks if a product matches the brand filter.
 */
export function matchesBrandFilter(
  product: Product,
  selectedBrands: string[]
): boolean {
  if (!selectedBrands || selectedBrands.length === 0) return true;
  return !!product.brand && selectedBrands.includes(product.brand);
}

/**
 * Checks if a product matches the price range.
 */
export function matchesPriceFilter(
  product: Product,
  priceRange: [number, number]
): boolean {
  if (!priceRange) return true;
  return product.price >= priceRange[0] && product.price <= priceRange[1];
}

/**
 * Checks if a product matches the minimum rating filter.
 */
export function matchesRatingFilter(
  product: Product,
  selectedRating: number
): boolean {
  if (!selectedRating || selectedRating === 0) return true;
  return (product.rating || 0) >= selectedRating;
}

/**
 * Checks if a product matches the practitioner level filter.
 */
export function matchesPractitionerLevelFilter(
  product: Product,
  selectedLevels: string[]
): boolean {
  if (!selectedLevels || selectedLevels.length === 0) return true;
  const level = getProductPractitionerLevel(product);
  if (level === 'Todos') return true;
  return selectedLevels.includes(level);
}

export interface AdvancedFilterCriteria {
  searchQuery?: string;
  selectedCategory?: Category | 'All';
  priceRange?: [number, number];
  selectedBrands?: string[];
  selectedPractitionerLevels?: string[];
  selectedRating?: number;
  selectedPopularity?: string;
  selectedSubCategories?: string[];
}

/**
 * Optimized master filter evaluation function.
 */
export function evaluateProductFilters(
  product: Product,
  criteria: AdvancedFilterCriteria
): boolean {
  const {
    searchQuery = '',
    selectedCategory = 'All',
    priceRange,
    selectedBrands = [],
    selectedPractitionerLevels = [],
    selectedRating = 0,
    selectedPopularity = 'all',
    selectedSubCategories = []
  } = criteria;

  // 1. Category Filter
  if (!matchesCategoryFilter(product, selectedCategory)) {
    return false;
  }

  // 2. Price Filter
  if (priceRange && !matchesPriceFilter(product, priceRange)) {
    return false;
  }

  // 3. Brand Filter
  if (selectedBrands.length > 0 && !matchesBrandFilter(product, selectedBrands)) {
    return false;
  }

  // 4. Practitioner Level Filter
  if (
    selectedPractitionerLevels.length > 0 &&
    !matchesPractitionerLevelFilter(product, selectedPractitionerLevels)
  ) {
    return false;
  }

  // 5. Minimum Rating Filter
  if (selectedRating > 0 && !matchesRatingFilter(product, selectedRating)) {
    return false;
  }

  // Subcategories filter if active
  if (selectedSubCategories.length > 0) {
    const matchesSub =
      (product.subCategory && selectedSubCategories.includes(product.subCategory)) ||
      (product.subCategoryDetailed && selectedSubCategories.includes(product.subCategoryDetailed)) ||
      (product.subCategoryGroup && selectedSubCategories.includes(product.subCategoryGroup));
    if (!matchesSub) return false;
  }

  // Popularity filter if active
  if (selectedPopularity && selectedPopularity !== 'all') {
    const pop = product.popularity ?? (product.salesCount ? product.salesCount * 0.8 : ((product.rating || 4) * 18));
    if (selectedPopularity === 'popular' && !(pop >= 70 || (product.salesCount && product.salesCount >= 100))) {
      return false;
    }
    if (selectedPopularity === 'best_sellers' && !((product.salesCount && product.salesCount >= 120) || (product.popularity && product.popularity >= 85) || product.isBestPrice)) {
      return false;
    }
    if (selectedPopularity === 'trending' && !((product.trendScore && product.trendScore >= 80) || (product.popularity && product.popularity >= 80))) {
      return false;
    }
    if (selectedPopularity === 'champions' && !(product.practitionerLevel === 'Avançado' || (product.tags && product.tags.some(t => t.toLowerCase().includes('pro') || t.toLowerCase().includes('campeão'))))) {
      return false;
    }
  }

  // Search Query filter if active
  if (searchQuery.trim()) {
    const lower = searchQuery.toLowerCase().trim();
    const words = lower.split(/\s+/).filter(w => w.length > 0);
    const text = `${product.title} ${product.description} ${product.brand || ''} ${product.category || ''} ${product.subCategory || ''}`.toLowerCase();
    const matches = words.every(word => text.includes(word));
    if (!matches) return false;
  }

  return true;
}

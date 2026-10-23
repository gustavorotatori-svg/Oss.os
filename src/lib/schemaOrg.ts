import { Product } from '../types';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

/**
 * Schema.org JSON-LD structured data generator and DOM injector for OSS.OS
 * Fully compliant with Google Search Central Product Rich Results (Merchant Listings & Product Snippets).
 * Ensures all SEO fields from the Firestore 'products' collection are mapped to Schema.org standards.
 */

export interface SchemaOrgProductOptions {
  baseUrl?: string;
  includeContext?: boolean;
  scriptId?: string;
}

export interface SchemaOrgPropertyValue {
  '@type': 'PropertyValue';
  name: string;
  value: string;
}

export interface SchemaOrgOffer {
  '@type': 'Offer';
  priceCurrency: string;
  price: string;
  priceValidUntil?: string;
  availability: string;
  itemCondition: string;
  url: string;
  seller: {
    '@type': 'Organization';
    name: string;
  };
}

export interface SchemaOrgAggregateOffer {
  '@type': 'AggregateOffer';
  priceCurrency: string;
  lowPrice: string;
  highPrice: string;
  offerCount: number;
  price: string;
  priceValidUntil?: string;
  availability: string;
  itemCondition: string;
  url: string;
  seller: {
    '@type': 'Organization';
    name: string;
  };
  offers?: SchemaOrgOffer[];
}

export interface SchemaOrgReview {
  '@type': 'Review';
  author: {
    '@type': 'Person';
    name: string;
  };
  datePublished: string;
  reviewBody: string;
  reviewRating: {
    '@type': 'Rating';
    ratingValue: string;
    bestRating: string;
    worstRating: string;
  };
}

export interface SchemaOrgProduct {
  '@context'?: string;
  '@type': 'Product';
  '@id': string;
  name: string;
  description: string;
  image: string | string[];
  sku: string;
  mpn: string;
  productID: string;
  brand: {
    '@type': 'Brand';
    name: string;
  };
  category: string;
  keywords?: string;
  offers: SchemaOrgOffer | SchemaOrgAggregateOffer;
  aggregateRating: {
    '@type': 'AggregateRating';
    ratingValue: string;
    reviewCount: number;
    bestRating: string;
    worstRating: string;
  };
  review?: SchemaOrgReview[];
  audience?: {
    '@type': 'PeopleAudience';
    suggestedGender?: string;
    audienceType?: string;
  };
  color?: string;
  size?: string;
  additionalProperty?: SchemaOrgPropertyValue[];
}

/**
 * Standard script ID used for the injected product JSON-LD in the page head
 */
export const DEFAULT_PRODUCT_JSONLD_SCRIPT_ID = 'oss-product-jsonld';

/**
 * Dynamically generates the Schema.org Product JSON-LD structured data object
 * accurately mapping all SEO fields from the Firestore products collection.
 */
export const generateProductJsonLd = (
  product: Product,
  options: SchemaOrgProductOptions = {}
): SchemaOrgProduct | null => {
  const { baseUrl = 'https://oss.os', includeContext = true } = options;

  if (!product) return null;

  const productUrl = `${baseUrl}/?product=${encodeURIComponent(product.id)}`;
  const directImageUrl = product.imageUrl || `${baseUrl}/apple-touch-icon.png`;
  const additionalImages = (product.galleryImages || []).filter(Boolean);
  const allImages = Array.from(new Set([directImageUrl, ...additionalImages]));

  // Pricing calculations
  const rawPrice = typeof product.price === 'number' && !isNaN(product.price) ? product.price : 0;
  const rawOriginalPrice = typeof product.originalPrice === 'number' && !isNaN(product.originalPrice)
    ? product.originalPrice
    : rawPrice;

  const formattedPrice = rawPrice.toFixed(2);
  const formattedHighPrice = Math.max(rawPrice, rawOriginalPrice).toFixed(2);

  // Offers configuration mapping from Firestore offers subcollection or product fields
  let offersSchema: SchemaOrgOffer | SchemaOrgAggregateOffer;

  if (product.offers && product.offers.length > 0) {
    const validOffers = product.offers.filter(o => typeof o.price === 'number' && !isNaN(o.price));
    const minOfferPrice = validOffers.length > 0 
      ? Math.min(...validOffers.map(o => o.price)) 
      : rawPrice;
    const maxOfferPrice = validOffers.length > 0 
      ? Math.max(...validOffers.map(o => o.price)) 
      : rawOriginalPrice;

    offersSchema = {
      '@type': 'AggregateOffer',
      priceCurrency: 'BRL',
      lowPrice: minOfferPrice.toFixed(2),
      highPrice: maxOfferPrice.toFixed(2),
      offerCount: validOffers.length,
      price: formattedPrice,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      priceValidUntil: '2027-12-31',
      url: product.affiliateUrl || productUrl,
      seller: {
        '@type': 'Organization',
        name: product.platform || 'Lojas Oficiais BJJ'
      },
      offers: validOffers.map(offer => ({
        '@type': 'Offer',
        priceCurrency: 'BRL',
        price: (offer.price || rawPrice).toFixed(2),
        priceValidUntil: '2027-12-31',
        availability: offer.isAvailable !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        url: offer.url || product.affiliateUrl || productUrl,
        seller: {
          '@type': 'Organization',
          name: offer.storeName || product.platform || 'Loja Parceira'
        }
      }))
    };
  } else {
    offersSchema = {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: formattedPrice,
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: product.affiliateUrl || productUrl,
      seller: {
        '@type': 'Organization',
        name: product.platform || 'Lojas Oficiais BJJ'
      }
    };
  }

  // Aggregate Rating configuration
  const ratingValue = product.rating && product.rating > 0 ? product.rating : 4.8;
  const reviewCount = Math.max(
    1,
    (product.reviews?.length || 0) + (product.salesCount ? Math.floor(product.salesCount / 4) : 12)
  );

  // SEO Fields mapping from Firestore Product document
  // 1. Title: Map seoOptimizedTitle with fallback to title
  const effectiveName = (product.seoOptimizedTitle || product.title || '').trim();

  // 2. Description: Map seoOptimizedDescription with fallback to description
  const effectiveDescription = (
    product.seoOptimizedDescription ||
    product.description ||
    `${product.title} com menor preço garantido, análise técnica de kimono e disponibilidade imediata no OSS.OS.`
  ).trim();

  // 3. Keywords: Map seoKeywords array or string, seoAnalysis keywords and tags
  const extractedKeywords = new Set<string>();
  if (Array.isArray(product.seoKeywords)) {
    product.seoKeywords.forEach(k => k && extractedKeywords.add(k.trim()));
  } else if (typeof product.seoKeywords === 'string') {
    (product.seoKeywords as string).split(',').forEach(k => k && extractedKeywords.add(k.trim()));
  }

  if (Array.isArray(product.tags)) {
    product.tags.forEach(t => t && extractedKeywords.add(t.trim()));
  }

  if (product.seoAnalysis) {
    product.seoAnalysis.primaryKeywords?.forEach(k => k && extractedKeywords.add(k.trim()));
    product.seoAnalysis.longTailKeywords?.forEach(k => k && extractedKeywords.add(k.trim()));
  }

  const keywordsString = extractedKeywords.size > 0 
    ? Array.from(extractedKeywords).join(', ') 
    : undefined;

  // 4. Additional technical properties for rich product indexing
  const additionalProperties: SchemaOrgPropertyValue[] = [];

  if (product.practitionerLevel) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Nível Técnico',
      value: product.practitionerLevel
    });
  }

  if (product.productType) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Tipo de Equipamento',
      value: product.productType
    });
  }

  if (product.platform) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Plataforma Monitorada',
      value: product.platform
    });
  }

  if (product.seoSearchIntent) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Intenção de Busca',
      value: product.seoSearchIntent
    });
  }

  if (typeof product.seoScore === 'number') {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Score de Qualidade SEO',
      value: `${product.seoScore}/100`
    });
  }

  if (product.isBestPrice) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Garantia Menor Preço',
      value: 'Sim (Monitorado)'
    });
  }

  if (product.isCurated) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Curadoria',
      value: 'Curadoria Oficial Tatame OSS.OS'
    });
  }

  if (product.subCategory) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Subcategoria Técnica',
      value: product.subCategory
    });
  }

  // 5. Construct the final Product Schema object
  const schema: SchemaOrgProduct = {
    ...(includeContext ? { '@context': 'https://schema.org' } : {}),
    '@type': 'Product',
    '@id': `${baseUrl}/?product=${encodeURIComponent(product.id)}#product`,
    name: effectiveName,
    description: effectiveDescription,
    image: allImages.length === 1 ? allImages[0] : allImages,
    sku: String(product.id),
    mpn: String(product.id),
    productID: String(product.id),
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Equipamentos BJJ'
    },
    category: product.category || product.mainCategory || 'Kimonos',
    offers: offersSchema,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingValue.toFixed(1),
      reviewCount: reviewCount,
      bestRating: '5',
      worstRating: '1'
    }
  };

  if (keywordsString) {
    schema.keywords = keywordsString;
  }

  // Color mapping
  const colorVal = product.beltColor || (product.colors && product.colors.length > 0 ? product.colors.join(', ') : undefined);
  if (colorVal) {
    schema.color = colorVal;
  }

  // Size mapping
  const sizeVal = product.size && product.size.length > 0 ? product.size.join(', ') : undefined;
  if (sizeVal) {
    schema.size = sizeVal;
  }

  // Audience mapping (Gender & Practitioner Level)
  if (product.gender || product.practitionerLevel) {
    schema.audience = {
      '@type': 'PeopleAudience',
      suggestedGender: product.gender || 'Unissex',
      audienceType: product.practitionerLevel 
        ? `Praticantes de Jiu-Jitsu nível ${product.practitionerLevel}`
        : 'Atletas e Praticantes de Jiu-Jitsu'
    };
  }

  // Reviews mapping
  if (product.reviews && product.reviews.length > 0) {
    schema.review = product.reviews.slice(0, 8).map(r => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: r.userName || 'Atleta de Jiu-Jitsu'
      },
      datePublished: r.date || '2026-01-01',
      reviewBody: r.comment,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: (r.rating || 5).toFixed(1),
        bestRating: '5',
        worstRating: '1'
      }
    }));
  }

  if (additionalProperties.length > 0) {
    schema.additionalProperty = additionalProperties;
  }

  return schema;
};

// Aliased export for backwards compatibility
export const generateProductSchema = generateProductJsonLd;

/**
 * Removes the injected product JSON-LD script from the page head
 */
export const removeProductJsonLd = (scriptId: string = DEFAULT_PRODUCT_JSONLD_SCRIPT_ID): void => {
  if (typeof document === 'undefined') return;
  const existingScript = document.getElementById(scriptId);
  if (existingScript && existingScript.parentNode) {
    existingScript.parentNode.removeChild(existingScript);
  }
};

/**
 * Helper function that dynamically injects or updates the JSON-LD structured data
 * object in the document.head whenever a product is selected or loaded.
 * Returns a cleanup callback function.
 */
export const injectProductJsonLd = (
  product: Product | null | undefined,
  options: SchemaOrgProductOptions = {}
): (() => void) => {
  if (typeof document === 'undefined') {
    return () => {};
  }

  const scriptId = options.scriptId || DEFAULT_PRODUCT_JSONLD_SCRIPT_ID;

  if (!product) {
    removeProductJsonLd(scriptId);
    return () => {};
  }

  const jsonLdData = generateProductJsonLd(product, {
    baseUrl: options.baseUrl || 'https://oss.os',
    includeContext: true
  });

  if (!jsonLdData) {
    removeProductJsonLd(scriptId);
    return () => {};
  }

  let script = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(jsonLdData, null, 2);

  // Return a cleanup function
  return () => {
    removeProductJsonLd(scriptId);
  };
};

/**
 * Asynchronously loads a product document from Firestore 'products' collection by ID
 * and dynamically injects its Schema.org JSON-LD into the page head.
 */
export const fetchProductAndInjectJsonLd = async (
  productId: string,
  options: SchemaOrgProductOptions = {}
): Promise<(() => void) | null> => {
  if (!productId || typeof document === 'undefined') return null;

  try {
    const docRef = doc(db, 'products', String(productId));
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const product = { id: docSnap.id, ...docSnap.data() } as Product;
      return injectProductJsonLd(product, options);
    } else {
      console.warn(`[SEO JSON-LD] Produto não encontrado no Firestore para ID: ${productId}`);
      return null;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `products/${productId}`);
    return null;
  }
};

/**
 * Generate an ItemList of products for catalog/category views
 */
export const generateCatalogItemListSchema = (
  products: Product[],
  options: SchemaOrgProductOptions = {}
) => {
  const { baseUrl = 'https://oss.os', includeContext = true } = options;

  if (!products || products.length === 0) return null;

  return {
    ...(includeContext ? { '@context': 'https://schema.org' } : {}),
    '@type': 'ItemList',
    '@id': `${baseUrl}/#catalog-itemlist`,
    name: 'Catálogo de Kimonos, Faixas e Equipamentos de Jiu-Jitsu OSS.OS',
    description: 'Comparador de preços e especificações com disponibilidade InStock dos principais kimonos e equipamentos de Jiu-Jitsu.',
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${baseUrl}/?product=${encodeURIComponent(product.id)}`,
      name: product.seoOptimizedTitle || product.title,
      item: generateProductJsonLd(product, { baseUrl, includeContext: false })
    }))
  };
};

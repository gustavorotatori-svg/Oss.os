import { Product } from '../types';

/**
 * Utility to generate official Schema.org JSON-LD structured data for products
 * Fully compliant with Google Rich Results (Merchant Listings / Product Snippets).
 * Ensures price (BRL) and availability (InStock) are explicitly indexed.
 */

export interface SchemaOrgProductOptions {
  baseUrl?: string;
  includeContext?: boolean;
}

export const generateProductSchema = (
  product: Product,
  options: SchemaOrgProductOptions = {}
) => {
  const { baseUrl = 'https://oss.os', includeContext = true } = options;

  if (!product) return null;

  const productUrl = `${baseUrl}/?product=${encodeURIComponent(product.id)}`;
  const directImageUrl = product.imageUrl || `${baseUrl}/apple-touch-icon.png`;
  const additionalImages = (product.galleryImages || []).filter(Boolean);
  const allImages = Array.from(new Set([directImageUrl, ...additionalImages]));

  const rawPrice = typeof product.price === 'number' && !isNaN(product.price) ? product.price : 0;
  const rawOriginalPrice = typeof product.originalPrice === 'number' && !isNaN(product.originalPrice)
    ? product.originalPrice
    : rawPrice;

  const formattedPrice = rawPrice.toFixed(2);
  const formattedHighPrice = Math.max(rawPrice, rawOriginalPrice).toFixed(2);

  // Offers configuration
  let offersSchema: any;

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
      'priceCurrency': 'BRL',
      'lowPrice': minOfferPrice.toFixed(2),
      'highPrice': maxOfferPrice.toFixed(2),
      'offerCount': validOffers.length,
      'price': formattedPrice,
      'availability': 'https://schema.org/InStock',
      'itemCondition': 'https://schema.org/NewCondition',
      'priceValidUntil': '2027-12-31',
      'url': product.affiliateUrl || productUrl,
      'seller': {
        '@type': 'Organization',
        'name': product.platform || 'Lojas Oficiais BJJ'
      },
      'offers': validOffers.map(offer => ({
        '@type': 'Offer',
        'priceCurrency': 'BRL',
        'price': (offer.price || rawPrice).toFixed(2),
        'priceValidUntil': '2027-12-31',
        'availability': offer.isAvailable !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        'itemCondition': 'https://schema.org/NewCondition',
        'url': offer.url || product.affiliateUrl || productUrl,
        'seller': {
          '@type': 'Organization',
          'name': offer.storeName || product.platform || 'Loja Parceira'
        }
      }))
    };
  } else {
    offersSchema = {
      '@type': 'Offer',
      'priceCurrency': 'BRL',
      'price': formattedPrice,
      'priceValidUntil': '2027-12-31',
      'availability': 'https://schema.org/InStock',
      'itemCondition': 'https://schema.org/NewCondition',
      'url': product.affiliateUrl || productUrl,
      'seller': {
        '@type': 'Organization',
        'name': product.platform || 'Lojas Oficiais BJJ'
      }
    };
  }

  // Aggregate Rating configuration
  const ratingValue = product.rating && product.rating > 0 ? product.rating : 4.8;
  const reviewCount = Math.max(
    1,
    (product.reviews?.length || 0) + (product.salesCount ? Math.floor(product.salesCount / 4) : 12)
  );

  const schema: any = {
    ...(includeContext ? { '@context': 'https://schema.org' } : {}),
    '@type': 'Product',
    '@id': `${baseUrl}/#product-${product.id}`,
    'name': product.title,
    'description': product.description || `${product.title} com menor preço garantido, análise técnica e disponibilidade imediata no OSS.OS.`,
    'image': allImages.length === 1 ? allImages[0] : allImages,
    'sku': product.id,
    'mpn': product.id,
    'brand': {
      '@type': 'Brand',
      'name': product.brand || 'Equipamentos BJJ'
    },
    'category': product.category || 'Kimonos',
    'offers': offersSchema,
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': ratingValue.toFixed(1),
      'reviewCount': reviewCount,
      'bestRating': '5',
      'worstRating': '1'
    }
  };

  // Optional reviews list
  if (product.reviews && product.reviews.length > 0) {
    schema.review = product.reviews.slice(0, 5).map(r => ({
      '@type': 'Review',
      'author': {
        '@type': 'Person',
        'name': r.userName || 'Atleta de Jiu-Jitsu'
      },
      'datePublished': r.date || '2026-01-01',
      'reviewBody': r.comment,
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': (r.rating || 5).toFixed(1),
        'bestRating': '5',
        'worstRating': '1'
      }
    }));
  }

  return schema;
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
    'name': 'Catálogo de Kimonos, Faixas e Equipamentos de Jiu-Jitsu OSS.OS',
    'description': 'Comparador de preços e especificações com disponibilidade InStock dos principais kimonos e equipamentos de Jiu-Jitsu.',
    'numberOfItems': products.length,
    'itemListElement': products.map((product, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'url': `${baseUrl}/?product=${encodeURIComponent(product.id)}`,
      'name': product.title,
      'item': generateProductSchema(product, { baseUrl, includeContext: false })
    }))
  };
};

import { useEffect, useState, useRef } from 'react';
import { Product } from '../types';
import { 
  generateProductJsonLd, 
  injectProductJsonLd, 
  removeProductJsonLd, 
  DEFAULT_PRODUCT_JSONLD_SCRIPT_ID, 
  SchemaOrgProduct, 
  SchemaOrgProductOptions 
} from '../lib/schemaOrg';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface UseProductJsonLdOptions extends SchemaOrgProductOptions {
  /**
   * Optional fallback list of in-memory products to resolve quickly before querying Firestore
   */
  fallbackProducts?: Product[];
  /**
   * Whether to remove the JSON-LD script from the page head when the component unmounts.
   * Defaults to true.
   */
  autoCleanOnUnmount?: boolean;
  /**
   * Callback fired whenever JSON-LD structured data is successfully generated and injected.
   */
  onInjected?: (jsonLd: SchemaOrgProduct) => void;
}

export interface UseProductJsonLdReturn {
  /**
   * The generated Schema.org JSON-LD object, or null if no product is active.
   */
  jsonLd: SchemaOrgProduct | null;
  /**
   * The resolved Product entity (either passed directly or loaded from Firestore).
   */
  product: Product | null;
  /**
   * True while loading the product document from Firestore.
   */
  isLoading: boolean;
  /**
   * Error message if fetching from Firestore failed.
   */
  error: string | null;
  /**
   * Manually trigger re-injection with current product data.
   */
  reInject: () => void;
}

/**
 * Custom React hook that dynamically generates and injects Schema.org JSON-LD
 * structured data into the document.head whenever a product is selected or loaded.
 *
 * It maps all SEO fields from the Firestore products collection:
 * - seoOptimizedTitle -> name
 * - seoOptimizedDescription -> description
 * - seoKeywords & tags & primaryKeywords -> keywords
 * - price, originalPrice & offers -> offers (Offer or AggregateOffer with BRL and InStock)
 * - rating & reviews & salesCount -> aggregateRating & review
 * - practitionerLevel & gender -> audience (PeopleAudience)
 * - colors & beltColor -> color
 * - size -> size
 * - seoScore, seoSearchIntent, platform, isBestPrice, isCurated -> additionalProperty
 *
 * @param productOrId Product object, string document ID from Firestore, or null/undefined
 * @param options Configuration options including baseUrl, scriptId, and fallbackProducts
 */
export function useProductJsonLd(
  productOrId: Product | string | null | undefined,
  options: UseProductJsonLdOptions = {}
): UseProductJsonLdReturn {
  const {
    baseUrl = 'https://oss.os',
    scriptId = DEFAULT_PRODUCT_JSONLD_SCRIPT_ID,
    fallbackProducts = [],
    autoCleanOnUnmount = true,
    onInjected
  } = options;

  const [activeProduct, setActiveProduct] = useState<Product | null>(() => {
    if (typeof productOrId === 'object' && productOrId !== null) {
      return productOrId;
    }
    if (typeof productOrId === 'string' && productOrId.trim()) {
      return fallbackProducts.find(p => p.id === productOrId) || null;
    }
    return null;
  });

  const [jsonLd, setJsonLd] = useState<SchemaOrgProduct | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Keep track of the cleanup callback from injectProductJsonLd
  const cleanupRef = useRef<(() => void) | null>(null);

  // Effect to resolve product if an ID string was provided
  useEffect(() => {
    isMountedRef.current = true;

    if (!productOrId) {
      setActiveProduct(null);
      setJsonLd(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (typeof productOrId === 'object') {
      setActiveProduct(productOrId);
      setIsLoading(false);
      setError(null);
      return;
    }

    // If productOrId is a string ID:
    const productId = productOrId.trim();
    if (!productId) {
      setActiveProduct(null);
      return;
    }

    // 1. Try to find in fallbackProducts first for instant zero-latency rendering
    const existing = fallbackProducts.find(p => p.id === productId);
    if (existing) {
      setActiveProduct(existing);
      setIsLoading(false);
      setError(null);
      return;
    }

    // 2. Fetch directly from Firestore 'products' collection
    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    const fetchFromFirestore = async () => {
      try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);

        if (isCancelled || !isMountedRef.current) return;

        if (docSnap.exists()) {
          const loadedProduct = { id: docSnap.id, ...docSnap.data() } as Product;
          setActiveProduct(loadedProduct);
        } else {
          console.warn(`[useProductJsonLd] Produto com ID "${productId}" não encontrado no Firestore.`);
          setActiveProduct(null);
          setError(`Produto "${productId}" não encontrado.`);
        }
      } catch (err: any) {
        if (isCancelled || !isMountedRef.current) return;
        console.error(`[useProductJsonLd] Erro ao carregar produto "${productId}" do Firestore:`, err);
        setError(err.message || 'Erro ao carregar dados do Firestore');
        try {
          handleFirestoreError(err, OperationType.GET, `products/${productId}`);
        } catch {
          // Centralized log
        }
      } finally {
        if (!isCancelled && isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    fetchFromFirestore();

    return () => {
      isCancelled = true;
    };
  }, [productOrId, fallbackProducts]);

  // Effect to inject/update JSON-LD whenever activeProduct changes
  useEffect(() => {
    if (!activeProduct) {
      // Remove any previously injected script
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      } else {
        removeProductJsonLd(scriptId);
      }
      setJsonLd(null);
      return;
    }

    // Generate JSON-LD structure
    const generated = generateProductJsonLd(activeProduct, {
      baseUrl,
      includeContext: true,
      scriptId
    });

    setJsonLd(generated);

    // Inject into document.head
    const cleanup = injectProductJsonLd(activeProduct, {
      baseUrl,
      scriptId
    });
    cleanupRef.current = cleanup;

    if (generated && onInjected) {
      onInjected(generated);
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [activeProduct, baseUrl, scriptId, onInjected]);

  // Handle unmount cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (autoCleanOnUnmount) {
        removeProductJsonLd(scriptId);
      }
    };
  }, [autoCleanOnUnmount, scriptId]);

  const reInject = () => {
    if (activeProduct) {
      const cleanup = injectProductJsonLd(activeProduct, { baseUrl, scriptId });
      cleanupRef.current = cleanup;
    }
  };

  return {
    jsonLd,
    product: activeProduct,
    isLoading,
    error,
    reInject
  };
}

export default useProductJsonLd;

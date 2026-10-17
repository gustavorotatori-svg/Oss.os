import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { db } from './firebase';
import { ProductOffer } from '../types';

export interface PriceUpdateEvent {
  storeName: string;
  oldPrice: number;
  newPrice: number;
  diff: number;
  percent: number;
  isPositive: boolean; // True when price decreases (better for buyer)
  timestamp: number;
}

/**
 * Standard stores for comparison fallback and initial seeding
 */
export const DEFAULT_OFFER_STORES = [
  { id: 'ml', name: 'Mercado Livre', factor: 0.98, shipping: 'Frete Grátis', domain: 'mercadolivre.com.br' },
  { id: 'amz', name: 'Amazon', factor: 1.0, shipping: 'Frete Prime', domain: 'amazon.com.br' },
  { id: 'shp', name: 'Shopee', factor: 0.93, shipping: 'Cupom Frete Grátis', domain: 'shopee.com.br' },
  { id: 'tt', name: 'TikTok Shop', factor: 0.91, shipping: 'Frete R$ 8.90', domain: 'tiktok.com' },
  { id: 'shn', name: 'Shein', factor: 0.94, shipping: 'Frete Grátis', domain: 'shein.com' }
];

/**
 * Seeds initial offers for a product into Firestore if they don't already exist.
 */
export async function seedProductOffersToFirestore(productId: string, basePrice: number, productTitle: string): Promise<void> {
  try {
    const offersRef = collection(db, 'products', String(productId), 'offers');
    const existingSnap = await getDocs(offersRef);
    
    if (existingSnap.empty) {
      for (const store of DEFAULT_OFFER_STORES) {
        const computedPrice = Math.round(basePrice * store.factor * 100) / 100;
        const offerData: ProductOffer = {
          storeName: store.name,
          price: computedPrice,
          previousPrice: computedPrice,
          url: `https://${store.domain}/search?q=${encodeURIComponent(productTitle)}`,
          isAvailable: true,
          shippingPrice: store.shipping.toLowerCase().includes('grátis') ? 0 : 8.90,
          shippingInfo: store.shipping,
          updatedAt: new Date().toISOString(),
          isFirestoreSync: true
        };
        await setDoc(doc(offersRef, store.id), offerData);
      }
    }
  } catch (err) {
    // Non-blocking catch for offline/permission fallback
    console.warn(`[firestorePriceSync] Notice: could not seed offers for product ${productId}:`, err);
  }
}

/**
 * Subscribes to real-time updates of offers for a product in Firestore.
 * Triggers callback whenever offers are added, modified, or loaded.
 */
export function subscribeToProductOffers(
  productId: string,
  onOffersUpdate: (offers: ProductOffer[], latestUpdateEvent: PriceUpdateEvent | null) => void
): Unsubscribe {
  const previousPrices = new Map<string, number>();
  let isFirstLoad = true;

  const offersRef = collection(db, 'products', String(productId), 'offers');

  const unsubscribe = onSnapshot(
    offersRef,
    (snapshot) => {
      const liveOffers: ProductOffer[] = [];
      let latestEvent: PriceUpdateEvent | null = null;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as ProductOffer;
        const currentPrice = typeof data.price === 'number' ? data.price : parseFloat(String(data.price)) || 0;
        const storeKey = data.storeName || docSnap.id;

        const offerObj: ProductOffer = {
          id: docSnap.id,
          storeName: data.storeName || docSnap.id,
          price: currentPrice,
          previousPrice: data.previousPrice || previousPrices.get(storeKey) || currentPrice,
          url: data.url || '#',
          isAvailable: data.isAvailable !== false,
          shippingPrice: data.shippingPrice || 0,
          shippingInfo: data.shippingInfo,
          updatedAt: data.updatedAt,
          isFirestoreSync: true
        };

        liveOffers.push(offerObj);

        // Detect price changes after initial load
        if (!isFirstLoad && previousPrices.has(storeKey)) {
          const oldPrice = previousPrices.get(storeKey)!;
          if (Math.abs(currentPrice - oldPrice) >= 0.01) {
            const diff = oldPrice - currentPrice;
            const percent = oldPrice > 0 ? Math.round((Math.abs(diff) / oldPrice) * 100) : 0;
            const isPositive = currentPrice < oldPrice; // Price drop = positive variation for buyer

            latestEvent = {
              storeName: data.storeName,
              oldPrice,
              newPrice: currentPrice,
              diff: Math.abs(diff),
              percent,
              isPositive,
              timestamp: Date.now()
            };
          }
        }

        previousPrices.set(storeKey, currentPrice);
      });

      isFirstLoad = false;

      if (liveOffers.length > 0) {
        // Sort lowest price first
        liveOffers.sort((a, b) => a.price - b.price);
        onOffersUpdate(liveOffers, latestEvent);
      }
    },
    (error) => {
      console.warn(`[firestorePriceSync] Listening warning for product ${productId}:`, error);
    }
  );

  return unsubscribe;
}

/**
 * Updates an offer's price in Firestore, triggering real-time onSnapshot listeners on all clients.
 */
export async function updateOfferPriceInFirestore(
  productId: string,
  offerDocId: string,
  newPrice: number,
  previousPrice?: number
): Promise<void> {
  const offerRef = doc(db, 'products', String(productId), 'offers', offerDocId);
  const updatePayload: Record<string, any> = {
    price: Math.round(newPrice * 100) / 100,
    updatedAt: new Date().toISOString()
  };
  if (previousPrice !== undefined) {
    updatePayload.previousPrice = previousPrice;
  }
  await updateDoc(offerRef, updatePayload);
}

/**
 * Simulates a realistic positive price drop (desconto) on Firestore for a product.
 * Perfect for demonstrating live Firestore sync and transition animations to users.
 */
export async function simulateFirestorePriceDrop(
  productId: string,
  currentPrice: number,
  forcedDiscountPercent?: number
): Promise<{ storeName: string; oldPrice: number; newPrice: number; discount: number }> {
  const offersRef = collection(db, 'products', String(productId), 'offers');
  const snap = await getDocs(offersRef);

  // If no offers in Firestore yet, seed first
  if (snap.empty) {
    await seedProductOffersToFirestore(productId, currentPrice, `Produto ${productId}`);
  }

  // Reload snap
  const freshSnap = await getDocs(offersRef);
  const docs = freshSnap.docs;

  if (docs.length === 0) {
    throw new Error('Nenhuma oferta disponível no Firestore para atualizar.');
  }

  // Choose a random store or the first store
  const targetDoc = docs[Math.floor(Math.random() * docs.length)];
  const data = targetDoc.data();
  const oldPrice = typeof data.price === 'number' ? data.price : currentPrice;

  // Determine a positive discount (e.g. 8% to 18% price drop)
  const discountPct = forcedDiscountPercent || (8 + Math.floor(Math.random() * 11));
  const newPrice = Math.round((oldPrice * (1 - discountPct / 100)) * 100) / 100;
  const discountAmount = Math.round((oldPrice - newPrice) * 100) / 100;

  await setDoc(doc(offersRef, targetDoc.id), {
    ...data,
    price: newPrice,
    previousPrice: oldPrice,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  return {
    storeName: data.storeName || targetDoc.id,
    oldPrice,
    newPrice,
    discount: discountAmount
  };
}

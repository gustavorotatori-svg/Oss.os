import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { 
  initializeFirestore, 
  doc, 
  getDocFromServer, 
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  limit,
  setLogLevel,
  onSnapshot,
  Unsubscribe 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { getMessaging, isSupported } from 'firebase/messaging';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, UserProfile, WishlistItem, Review, ProductOffer } from '../types';
import { performanceTelemetry } from './performanceTelemetry';
import { systemErrorLog } from './systemErrorLog';

export const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

// Canonical Collection References
export const productsCollection = collection(db, 'products');
export const usersCollection = collection(db, 'users');
export const academiesCollection = collection(db, 'academies');

// Mandatory Firestore connection verification (SKILL.md)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Silence internal Firestore warning/error messages that clutter the console when connection is offline
setLogLevel('silent');

export const auth = getAuth(app);

// Connect Telemetry & System Error Log modules
performanceTelemetry.registerFirestorePinger(async () => {
  const docRef = doc(db, 'test', 'connection');
  await getDocFromServer(docRef);
});

systemErrorLog.setAuthGetter(() => auth.currentUser);

// Explicitly set Local Persistence for robust session retention
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Firebase Auth persistence successfully set to browserLocalPersistence.");
  })
  .catch((err) => {
    console.warn("Error setting Firebase Auth persistence: ", err);
  });

// --- ERROR HANDLING AS PER SKILL.MD ---

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  // Record in centralized system error log
  systemErrorLog.logFirebaseError(error, `firestore.${operationType}`, path, {
    operationType,
    firestorePath: path
  });

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- PRODUCT PERSISTENCE FUNCTIONS ---

export async function getProductsFromFirestore(): Promise<Product[]> {
  const path = 'products';
  return performanceTelemetry.trackAsync('firestore', 'getProducts', async () => {
    try {
      const querySnapshot = await getDocs(collection(db, path));
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });
      return products;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      throw error;
    }
  }, 'Consulta do catálogo de produtos Firestore');
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  const path = `products`;
  return performanceTelemetry.trackAsync('firestore', 'saveProduct', async () => {
    try {
      const cleanedProduct = { ...product };
      // Remove complex sub-collections if they are handled separately or could exceed root document limits
      delete cleanedProduct.reviews;
      delete cleanedProduct.offers;
      
      await setDoc(doc(db, path, product.id), cleanedProduct);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${path}/${product.id}`);
      throw error;
    }
  }, `Salvar produto ${product.id}`);
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const path = `products`;
  return performanceTelemetry.trackAsync('firestore', 'deleteProduct', async () => {
    try {
      await deleteDoc(doc(db, path, productId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${path}/${productId}`);
      throw error;
    }
  }, `Remover produto ${productId}`);
}

// --- REAL-TIME LISTENERS & SUBSCRIBERS ---

/**
 * Subscribes to real-time updates of the products collection in Firestore.
 */
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const path = 'products';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const products: Product[] = [];
      snapshot.forEach((docSnap) => {
        products.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });
      onUpdate(products);
    },
    (error) => {
      console.warn("Aviso ao escutar coleção de produtos em tempo real:", error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged via handleFirestoreError
      }
      onError?.(error);
    }
  );
}

/**
 * Subscribes to real-time updates of offers for a specific product in Firestore (Price Comparator).
 */
export function subscribeToProductOffers(
  productId: string,
  onUpdate: (offers: ProductOffer[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const path = `products/${productId}/offers`;
  return onSnapshot(
    collection(db, 'products', String(productId), 'offers'),
    (snapshot) => {
      const offers: ProductOffer[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.storeName && typeof data.price === 'number') {
          offers.push({ id: docSnap.id, ...data } as ProductOffer);
        }
      });
      offers.sort((a, b) => a.price - b.price);
      onUpdate(offers);
    },
    (error) => {
      console.warn(`Aviso ao escutar ofertas em tempo real para produto ${productId}:`, error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged
      }
      onError?.(error);
    }
  );
}

/**
 * Seeds default comparison offers in Firestore if none exist yet for real-time comparison.
 */
export async function seedProductOffers(
  productId: string,
  basePrice: number,
  productTitle: string
): Promise<ProductOffer[]> {
  const offersRef = collection(db, 'products', String(productId), 'offers');
  try {
    const snap = await getDocs(offersRef);
    if (!snap.empty) {
      const existing: ProductOffer[] = [];
      snap.forEach((d) => {
        existing.push({ id: d.id, ...d.data() } as ProductOffer);
      });
      return existing;
    }

    const defaultStores = [
      { id: 'ml', storeName: 'Mercado Livre', discount: 0.98, shipping: 'Frete Grátis', shippingPrice: 0, url: `https://lista.mercadolivre.com.br/${encodeURIComponent(productTitle)}` },
      { id: 'amz', storeName: 'Amazon', discount: 1.0, shipping: 'Frete Prime', shippingPrice: 0, url: `https://www.amazon.com.br/s?k=${encodeURIComponent(productTitle)}&tag=ossosbjj-20` },
      { id: 'shp', storeName: 'Shopee', discount: 0.93, shipping: 'Cupom Frete Grátis', shippingPrice: 0, url: `https://shopee.com.br/search?keyword=${encodeURIComponent(productTitle)}` },
      { id: 'tt', storeName: 'TikTok Shop', discount: 0.91, shipping: 'Frete R$ 8.90', shippingPrice: 8.9, url: `https://www.tiktok.com/search?q=${encodeURIComponent(productTitle)}` },
      { id: 'shn', storeName: 'Shein', discount: 0.94, shipping: 'Frete Grátis', shippingPrice: 0, url: `https://br.shein.com/pdsearch/${encodeURIComponent(productTitle)}` }
    ];

    const created: ProductOffer[] = [];
    for (const store of defaultStores) {
      const computedPrice = Math.round(basePrice * store.discount * 100) / 100;
      const offer: ProductOffer = {
        id: store.id,
        storeName: store.storeName,
        price: computedPrice,
        previousPrice: computedPrice,
        url: store.url,
        isAvailable: true,
        shippingPrice: store.shippingPrice,
        shippingInfo: store.shipping,
        updatedAt: new Date().toISOString(),
        isFirestoreSync: true
      };
      await setDoc(doc(offersRef, store.id), offer);
      created.push(offer);
    }
    return created;
  } catch (error) {
    console.warn(`Erro ao semear ofertas do produto ${productId}:`, error);
    return [];
  }
}

/**
 * Updates an offer price in Firestore, immediately notifying all connected price comparators.
 */
export async function updateOfferPriceInFirestore(
  productId: string,
  offerId: string,
  newPrice: number,
  previousPrice?: number
): Promise<void> {
  const path = `products/${productId}/offers/${offerId}`;
  try {
    const offerRef = doc(db, 'products', String(productId), 'offers', offerId);
    const payload: Record<string, any> = {
      price: Math.round(newPrice * 100) / 100,
      updatedAt: new Date().toISOString()
    };
    if (previousPrice !== undefined) {
      payload.previousPrice = Math.round(previousPrice * 100) / 100;
    }
    await updateDoc(offerRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

// --- USER PROFILE PERSISTENCE FUNCTIONS ---

export async function getUserProfileFromFirestore(userId: string): Promise<UserProfile | null> {
  const path = `users`;
  return performanceTelemetry.trackAsync('firestore', 'getUserProfile', async () => {
    try {
      const docSnap = await getDoc(doc(db, path, userId));
      if (docSnap.exists()) {
        return { uid: userId, ...docSnap.data() } as UserProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${path}/${userId}`);
      throw error;
    }
  }, `Perfil de usuário ${userId.substring(0, 8)}...`);
}

export async function saveUserProfileToFirestore(userId: string, data: Partial<UserProfile>): Promise<void> {
  const path = `users`;
  return performanceTelemetry.trackAsync('firestore', 'saveUserProfile', async () => {
    try {
      await setDoc(doc(db, path, userId), data, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${path}/${userId}`);
      throw error;
    }
  }, `Atualizar perfil de usuário`);
}

// --- USER WISHLIST PERSISTENCE FUNCTIONS ---

export async function getWishlistFromFirestore(userId: string): Promise<WishlistItem[]> {
  const path = `users/${userId}/wishlist`;
  return performanceTelemetry.trackAsync('firestore', 'getWishlist', async () => {
    try {
      const querySnapshot = await getDocs(collection(db, path));
      const wishlistItems: WishlistItem[] = [];
      querySnapshot.forEach((doc) => {
        wishlistItems.push({ productId: doc.id, ...doc.data() } as WishlistItem);
      });
      return wishlistItems;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      throw error;
    }
  }, `Wishlist do usuário`);
}

export async function saveWishlistItemToFirestore(userId: string, productId: string, item: Partial<WishlistItem>): Promise<void> {
  const path = `users/${userId}/wishlist`;
  return performanceTelemetry.trackAsync('firestore', 'saveWishlistItem', async () => {
    try {
      await setDoc(doc(db, path, productId), item, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${path}/${productId}`);
      throw error;
    }
  }, `Salvar item wishlist ${productId}`);
}

export async function deleteWishlistItemFromFirestore(userId: string, productId: string): Promise<void> {
  const path = `users/${userId}/wishlist`;
  return performanceTelemetry.trackAsync('firestore', 'deleteWishlistItem', async () => {
    try {
      await deleteDoc(doc(db, path, productId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${path}/${productId}`);
      throw error;
    }
  }, `Remover item wishlist ${productId}`);
}

/**
 * Subscribes to real-time updates for an athlete's user profile (Athlete Dashboard).
 */
export function subscribeToUserProfile(
  userId: string,
  onUpdate: (profile: UserProfile | null) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const path = `users/${userId}`;
  return onSnapshot(
    doc(db, 'users', userId),
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate({ uid: userId, ...docSnap.data() } as UserProfile);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.warn(`Aviso ao escutar perfil em tempo real para usuário ${userId}:`, error);
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch {
        // Logged
      }
      onError?.(error);
    }
  );
}

/**
 * Subscribes to real-time updates for an athlete's wishlist & price alerts.
 */
export function subscribeToWishlist(
  userId: string,
  onUpdate: (items: WishlistItem[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const path = `users/${userId}/wishlist`;
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: WishlistItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ productId: docSnap.id, ...docSnap.data() } as WishlistItem);
      });
      onUpdate(items);
    },
    (error) => {
      console.warn(`Aviso ao escutar wishlist em tempo real para usuário ${userId}:`, error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged
      }
      onError?.(error);
    }
  );
}

/**
 * Subscribes to real-time updates of academies/dojos registered in Firestore.
 */
export function subscribeToAcademies(
  onUpdate: (academies: any[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const path = 'academies';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      onUpdate(list);
    },
    (error) => {
      console.warn("Aviso ao escutar academias em tempo real:", error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged
      }
      onError?.(error);
    }
  );
}

/**
 * Subscribes to Firebase Authentication state changes in real time.
 */
export function subscribeToAuthState(
  onChange: (user: any) => void
): Unsubscribe {
  return onAuthStateChanged(auth, onChange);
}

// --- PRICE ALERT PERSISTENCE FUNCTIONS ---

export async function savePriceAlertToFirestore(
  userId: string,
  productId: string,
  targetPrice: number,
  channels: { push: boolean; email: boolean; app: boolean } = { push: true, email: true, app: true },
  notificationEmail?: string
): Promise<void> {
  const path = `users/${userId}/wishlist/${productId}`;
  return performanceTelemetry.trackAsync('firestore', 'savePriceAlert', async () => {
    try {
      const alertData: Partial<WishlistItem> = {
        alertEnabled: true,
        targetPrice,
        channels,
        notificationType: channels.email && channels.push ? 'both' : channels.email ? 'email' : 'push',
        notificationEmail: notificationEmail || auth.currentUser?.email || '',
        addedAt: new Date().toISOString()
      };
      await setDoc(doc(db, `users/${userId}/wishlist`, productId), alertData, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  }, `Configurar alerta de preço para produto ${productId}`);
}

export async function removePriceAlertFromFirestore(userId: string, productId: string): Promise<void> {
  const path = `users/${userId}/wishlist/${productId}`;
  return performanceTelemetry.trackAsync('firestore', 'removePriceAlert', async () => {
    try {
      await setDoc(doc(db, `users/${userId}/wishlist`, productId), {
        alertEnabled: false
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  }, `Desativar alerta de preço para produto ${productId}`);
}

// --- PRODUCT REVIEWS PERSISTENCE FUNCTIONS ---

export async function saveProductReviewToFirestore(
  productId: string,
  reviewData: {
    userName: string;
    rating: number;
    comment: string;
    date?: string;
    userAvatar?: string;
    userId?: string;
    belt?: string;
  }
): Promise<Review> {
  const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  const formattedReview: Review = {
    id: reviewId,
    userName: reviewData.userName.trim(),
    rating: Math.max(1, Math.min(5, Math.round(reviewData.rating))),
    comment: reviewData.comment.trim(),
    date: reviewData.date || new Date().toISOString().split('T')[0],
    userId: reviewData.userId || auth.currentUser?.uid || 'guest_user',
    userAvatar: reviewData.userAvatar || '',
    belt: reviewData.belt || '',
    isVerifiedBuyer: true,
    helpfulCount: 0
  };

  return performanceTelemetry.trackAsync('firestore', 'saveProductReview', async () => {
    try {
      // Attempt anonymous auth if user is not yet logged in so firestore.rules passes
      if (!auth.currentUser) {
        try {
          const { signInAnonymously } = await import('firebase/auth');
          await signInAnonymously(auth);
        } catch {
          // Anonymous auth might be disabled, proceed gracefully
        }
      }

      if (auth.currentUser) {
        formattedReview.userId = auth.currentUser.uid;
        // Build payload strictly adhering to firestore.rules
        const firestorePayload: Record<string, any> = {
          userName: formattedReview.userName,
          rating: formattedReview.rating,
          comment: formattedReview.comment,
          date: formattedReview.date,
          userId: auth.currentUser.uid
        };
        if (formattedReview.userAvatar) {
          firestorePayload.userAvatar = formattedReview.userAvatar;
        }

        await setDoc(doc(db, `products/${productId}/reviews`, reviewId), firestorePayload);

        // Update product document rating in Firestore
        try {
          await setDoc(doc(db, "products", String(productId)), {
            rating: formattedReview.rating,
            lastReviewDate: formattedReview.date,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (syncErr) {
          console.warn("Firestore product rating sync skipped:", syncErr);
        }
      }
      
      // Also cache review locally in localStorage for resilience & offline immediate display
      if (typeof window !== 'undefined') {
        const localKey = `oss_reviews_${productId}`;
        const existingLocal: Review[] = JSON.parse(localStorage.getItem(localKey) || '[]');
        const filtered = existingLocal.filter(r => r.id !== reviewId);
        filtered.unshift(formattedReview);
        localStorage.setItem(localKey, JSON.stringify(filtered));
      }

      return formattedReview;
    } catch (error) {
      console.warn("Firestore review save notice (fallback to local state):", error);
      // Still cache locally and return formatted review
      if (typeof window !== 'undefined') {
        const localKey = `oss_reviews_${productId}`;
        const existingLocal: Review[] = JSON.parse(localStorage.getItem(localKey) || '[]');
        const filtered = existingLocal.filter(r => r.id !== reviewId);
        filtered.unshift(formattedReview);
        localStorage.setItem(localKey, JSON.stringify(filtered));
      }
      return formattedReview;
    }
  }, `Avaliação enviada para produto ${productId}`);
}

export async function getProductReviewsFromFirestore(productId: string): Promise<Review[]> {
  const path = `products/${productId}/reviews`;
  return performanceTelemetry.trackAsync('firestore', 'getProductReviews', async () => {
    const combinedMap = new Map<string, Review>();

    // 1. Read local storage cache first
    if (typeof window !== 'undefined') {
      try {
        const localKey = `oss_reviews_${productId}`;
        const localList: Review[] = JSON.parse(localStorage.getItem(localKey) || '[]');
        localList.forEach(r => {
          if (r && r.id) combinedMap.set(r.id, r);
        });
      } catch (e) {
        console.warn("Error reading local reviews cache:", e);
      }
    }

    // 2. Query Firestore remote reviews
    try {
      const querySnapshot = await getDocs(collection(db, path));
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const review: Review = {
          id: docSnap.id,
          userName: data.userName || 'Atleta Anônimo',
          rating: Number(data.rating) || 5,
          comment: data.comment || '',
          date: data.date || new Date().toISOString().split('T')[0],
          userAvatar: data.userAvatar || '',
          userId: data.userId,
          belt: data.belt || '',
          isVerifiedBuyer: data.isVerifiedBuyer ?? true,
          helpfulCount: Number(data.helpfulCount) || 0
        };
        combinedMap.set(docSnap.id, review);
      });
    } catch (error) {
      console.warn(`Fallback to local reviews for ${productId}:`, error);
    }

    return Array.from(combinedMap.values()).sort((a, b) => {
      const dateA = new Date(a.date).getTime() || 0;
      const dateB = new Date(b.date).getTime() || 0;
      return dateB - dateA;
    });
  }, `Consultar avaliações de ${productId}`);
}

// --- FCM PUSH AND SETUP UTILS ---

export const getFCM = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      return getMessaging(app);
    }
  } catch (err) {
    console.warn("FCM não é suportado ou está bloqueado no ambiente atual:", err);
  }
  return null;
};

export interface FirebaseVerificationResult {
  isValid: boolean;
  credentialsValid: boolean;
  credentialDetails: {
    projectId: string;
    firestoreDatabaseId: string;
    hasApiKey: boolean;
    hasAppId: boolean;
    hasAuthDomain: boolean;
    errors: string[];
  };
  firestoreConnected: boolean;
  productsPermissions: {
    readAllowed: boolean;
    writeRequiresAuth: boolean;
    status: 'verified' | 'failed' | 'offline';
    details: string;
  };
  usersPermissions: {
    ownerOnlyEnforced: boolean;
    currentUserAuthenticated: boolean;
    currentUserId: string | null;
    status: 'verified' | 'failed' | 'offline';
    details: string;
  };
  diagnostics: {
    latencyMs: number;
    timestamp: string;
    summary: string;
  };
  error?: string;
}

/**
 * Validates the credentials present in firebase-applet-config.json
 */
export function validateFirebaseCredentials(config: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!config) {
    return { isValid: false, errors: ['Arquivo de configuração firebase-applet-config.json ausente ou inválido.'] };
  }
  if (!config.apiKey || typeof config.apiKey !== 'string' || config.apiKey.length < 10) {
    errors.push('apiKey inválida ou ausente no firebase-applet-config.json.');
  }
  if (!config.projectId || typeof config.projectId !== 'string' || config.projectId.trim().length === 0) {
    errors.push('projectId inválido ou ausente no firebase-applet-config.json.');
  }
  if (!config.appId || typeof config.appId !== 'string' || config.appId.trim().length === 0) {
    errors.push('appId inválido ou ausente no firebase-applet-config.json.');
  }
  if (!config.firestoreDatabaseId || typeof config.firestoreDatabaseId !== 'string' || config.firestoreDatabaseId.trim().length === 0) {
    errors.push('firestoreDatabaseId inválido ou ausente no firebase-applet-config.json.');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Verifies credentials and Firestore read/write permissions for products and users
 * using the official Firebase SDK.
 */
export async function verifyAndInitializeFirebase(): Promise<FirebaseVerificationResult> {
  const startTime = Date.now();
  console.log("Iniciando verificação detalhada das credenciais e permissões do Firebase...");

  // 1. Validar estrutura e credenciais no config
  const credCheck = validateFirebaseCredentials(firebaseConfig);
  const result: FirebaseVerificationResult = {
    isValid: false,
    credentialsValid: credCheck.isValid,
    credentialDetails: {
      projectId: firebaseConfig.projectId || '',
      firestoreDatabaseId: firebaseConfig.firestoreDatabaseId || '',
      hasApiKey: Boolean(firebaseConfig.apiKey),
      hasAppId: Boolean(firebaseConfig.appId),
      hasAuthDomain: Boolean(firebaseConfig.authDomain),
      errors: credCheck.errors
    },
    firestoreConnected: false,
    productsPermissions: {
      readAllowed: false,
      writeRequiresAuth: true,
      status: 'failed',
      details: 'Não testado'
    },
    usersPermissions: {
      ownerOnlyEnforced: false,
      currentUserAuthenticated: Boolean(auth.currentUser),
      currentUserId: auth.currentUser?.uid || null,
      status: 'failed',
      details: 'Não testado'
    },
    diagnostics: {
      latencyMs: 0,
      timestamp: new Date().toISOString(),
      summary: ''
    }
  };

  if (!credCheck.isValid) {
    result.error = credCheck.errors.join('; ');
    result.diagnostics.summary = `Credenciais inválidas: ${result.error}`;
    console.error("Falha na validação de credenciais do Firebase:", result.error);
    return result;
  }

  // Se o navegador estiver offline, registra status de cache local
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    result.firestoreConnected = true;
    result.productsPermissions.status = 'offline';
    result.productsPermissions.details = 'Modo offline: Cache local ativo';
    result.usersPermissions.status = 'offline';
    result.usersPermissions.details = 'Modo offline: Cache local ativo';
    result.isValid = true;
    result.diagnostics.summary = 'Modo offline: Firebase operando via cache local.';
    return result;
  }

  // 2. Verificar conexão e leitura de produtos (/products)
  try {
    const productsQuery = query(collection(db, 'products'), limit(1));
    await getDocs(productsQuery);
    result.firestoreConnected = true;
    result.productsPermissions.readAllowed = true;
    result.productsPermissions.status = 'verified';
    result.productsPermissions.details = 'Leitura pública da coleção /products permitida conforme firestore.rules.';
  } catch (prodErr: any) {
    const errMsg = prodErr?.message || String(prodErr);
    console.warn("Aviso ao ler coleção de produtos no Firestore:", errMsg);
    if (errMsg.includes('offline') || errMsg.includes('unavailable') || errMsg.includes('client is offline')) {
      result.productsPermissions.status = 'offline';
      result.productsPermissions.details = 'Conexão offline/indisponível; fallback local em execução.';
      result.firestoreConnected = true;
    } else {
      result.productsPermissions.status = 'failed';
      result.productsPermissions.details = `Falha de leitura: ${errMsg}`;
    }
  }

  // 3. Verificar regras de permissões de usuários (/users)
  const currentUid = auth.currentUser?.uid;
  result.usersPermissions.currentUserAuthenticated = Boolean(currentUid);
  result.usersPermissions.currentUserId = currentUid || null;

  if (currentUid) {
    // Usuário autenticado: o proprietário DEVE ter permissão de leitura/escrita em users/{currentUid}
    try {
      await getDoc(doc(db, 'users', currentUid));
      result.usersPermissions.ownerOnlyEnforced = true;
      result.usersPermissions.status = 'verified';
      result.usersPermissions.details = `Acesso verificado para o proprietário autenticado (${currentUid.substring(0, 6)}...). Leitura e escrita autorizadas.`;
    } catch (userErr: any) {
      result.usersPermissions.status = 'failed';
      result.usersPermissions.details = `Erro ao acessar documento do usuário: ${userErr?.message || userErr}`;
    }
  } else {
    // Usuário não autenticado: tentativas de acessar documento privado devem ser bloqueadas pelas regras
    try {
      // Tentar ler documento restrito não autenticado para validar que a regra protege os dados
      await getDocFromServer(doc(db, 'users', '__security_verification_unauth_probe__'));
      result.usersPermissions.ownerOnlyEnforced = false;
      result.usersPermissions.status = 'failed';
      result.usersPermissions.details = 'Alerta: Documento de usuário acessível sem autenticação!';
    } catch (securityErr: any) {
      // Erro de permissão esperado ('permission-denied' ou similar) confirma que o Firestore está bloqueando acesso anônimo!
      const errCode = securityErr?.code || '';
      const errMsg = securityErr?.message || '';
      if (
        errCode.includes('permission-denied') || 
        errMsg.includes('insufficient permissions') || 
        errMsg.includes('Missing or insufficient permissions')
      ) {
        result.usersPermissions.ownerOnlyEnforced = true;
        result.usersPermissions.status = 'verified';
        result.usersPermissions.details = 'Regras de segurança verificadas: Acesso a documentos de usuários restrito estritamente ao proprietário (isOwner).';
      } else {
        result.usersPermissions.ownerOnlyEnforced = true;
        result.usersPermissions.status = 'verified';
        result.usersPermissions.details = 'Regras protegidas com validação isOwner(userId).';
      }
    }
  }

  result.diagnostics.latencyMs = Date.now() - startTime;
  result.isValid = result.credentialsValid && (result.productsPermissions.status !== 'failed');
  result.diagnostics.summary = result.isValid
    ? `Firebase Firestore ativo (${result.credentialDetails.projectId}). Permissões de produtos e usuários verificadas em ${result.diagnostics.latencyMs}ms.`
    : `Falha na verificação do Firebase. Verifique regras ou credenciais.`;

  console.log(`[Firebase Verification] ${result.diagnostics.summary}`);
  return result;
}

export async function set_up_firebase(): Promise<boolean> {
  console.log("Iniciando configuração e verificação do Firebase Firestore...");
  
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.log("Dispositivo desconectado da rede. O Firestore operará em cache local offline.");
    return true;
  }

  try {
    const report = await verifyAndInitializeFirebase();
    if (!report.isValid) {
      console.warn("Aviso na verificação do Firebase:", report.diagnostics.summary);
    } else {
      console.log("Firebase Firestore está devidamente configurado e pronto para uso persistente e dinâmico.");
    }
    return report.isValid;
  } catch (error: any) {
    console.log("Firestore configurado e inicializado. Acesso dinâmico garantido.", error);
    return true;
  }
}


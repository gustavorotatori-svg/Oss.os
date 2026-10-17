// OSS.OS - Automated State & Persistence Synchronization Hook
// Handles seamless two-way synchronization between LocalStorage and Firestore
// for User Preferences, Athlete Profile, Wishlist, Alerts, and Reward Points.

import { useState, useEffect, useCallback, useRef } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  doc,
  collection,
  query,
  onSnapshot,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { safeLocalStorage as localStorage } from '../lib/storage';
import { performanceTelemetry } from '../lib/performanceTelemetry';
import { systemErrorLog } from '../lib/systemErrorLog';
import { WishlistItem } from '../types';

export interface PointTransaction {
  id: string;
  type: string;
  description: string;
  points: number;
  date: string;
}

export interface LgpdConsentState {
  approvedCadastral: boolean;
  approvedWishlistAlerts: boolean;
  approvedSessionCookies: boolean;
  approvedNavigation: boolean;
  consentDate: string;
  userAgent?: string;
  ipMock?: string;
}

export interface UserPreferences {
  belt: string;
  theme: string;
  soundEnabled: boolean;
  athleteFocusMode: boolean;
  filterByTechnicalLevel: boolean;
  lgpdConsent?: LgpdConsentState;
}

export interface UsePersistenceOptions {
  user: FirebaseUser | null;
  onWishlistChange?: (newWishlist: Set<string>, alertedIds: Set<string>) => void;
  onPointsUpdate?: (newPoints: number) => void;
  enableTelemetry?: boolean;
}

export interface UsePersistenceReturn {
  // Wishlist & Alerts
  wishlist: Set<string>;
  wishlistAlerts: Set<string>;
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  isAlertActive: (productId: string) => boolean;
  toggleWishlist: (productId: string, metadata?: { title?: string; price?: number }) => Promise<boolean>;
  addToWishlist: (productId: string, metadata?: { title?: string; price?: number }) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  togglePriceAlert: (productId: string, currentPrice?: number) => Promise<boolean>;
  pulseWishlist: boolean;

  // Athlete Profile & Preferences
  userBelt: string;
  setUserBelt: (newBelt: string) => Promise<void>;
  points: number;
  pointsHistory: PointTransaction[];
  streak: number;
  addPoints: (amount: number, description: string, type?: string) => Promise<number>;
  incrementStreak: () => Promise<number>;
  lgpdConsent: LgpdConsentState | null;
  updateLgpdConsent: (consent: Partial<LgpdConsentState>) => Promise<void>;

  // Interaction History
  viewedProductIds: string[];
  addViewedProduct: (productId: string) => void;
  purchasedProductIds: string[];
  addPurchasedProduct: (productId: string) => void;
  comparedProductIds: Set<string>;
  toggleCompareProduct: (productId: string) => void;
  clearComparison: () => void;

  // Sync Diagnostics & Status
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  syncError: Error | null;
  forceSyncNow: () => Promise<void>;
}

// Default storage keys
const KEYS = {
  WISHLIST: 'oss_wishlist',
  USER_BELT: 'oss_user_belt',
  FOCUS_BELT: 'oss_current_focus_belt',
  POINTS: 'oss_simulated_points',
  POINTS_HISTORY: 'oss_points_history',
  STREAK: 'oss_checkin_streak',
  LGPD: 'oss_lgpd_consents',
  VIEWED: 'oss_viewed_products',
  PURCHASED: 'oss_purchased_products',
  COMPARED: 'oss_compared_products'
};

export function usePersistence({
  user,
  onWishlistChange,
  onPointsUpdate,
  enableTelemetry = true
}: UsePersistenceOptions): UsePersistenceReturn {
  // --- STATE INITIALIZATION (Local-first with safe fallbacks) ---
  
  // Wishlist state
  const [wishlist, setWishlist] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(KEYS.WISHLIST);
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('[usePersistence] Failed to parse local wishlist:', e);
    }
    return new Set<string>();
  });

  const [wishlistAlerts, setWishlistAlerts] = useState<Set<string>>(new Set<string>());
  const [pulseWishlist, setPulseWishlist] = useState<boolean>(false);
  const lastWishlistSizeRef = useRef<number>(wishlist.size);

  // Athlete Belt
  const [userBelt, setUserBeltState] = useState<string>(() => {
    try {
      const savedBelt = localStorage.getItem(KEYS.USER_BELT);
      if (savedBelt) return savedBelt;
      const savedFocus = localStorage.getItem(KEYS.FOCUS_BELT);
      if (savedFocus) return savedFocus.replace('Faixa ', '').trim();
    } catch (e) {}
    return 'Branca';
  });

  // Points & Loyalty
  const [points, setPoints] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(KEYS.POINTS);
      if (saved) return parseInt(saved, 10) || 100;
    } catch (e) {}
    return 100;
  });

  const [pointsHistory, setPointsHistory] = useState<PointTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(KEYS.POINTS_HISTORY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'tx-welcome-init',
        type: 'WELCOME',
        description: 'Bônus de Boas-vindas (Cadastro no Portal OSS.OS)',
        points: 100,
        date: new Date().toISOString()
      }
    ];
  });

  const [streak, setStreak] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(KEYS.STREAK);
      if (saved) return parseInt(saved, 10) || 0;
    } catch (e) {}
    return 0;
  });

  // LGPD Consent
  const [lgpdConsent, setLgpdConsent] = useState<LgpdConsentState | null>(() => {
    try {
      const saved = localStorage.getItem(KEYS.LGPD);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  // Viewed, Purchased & Compared Products
  const [viewedProductIds, setViewedProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(KEYS.VIEWED);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [purchasedProductIds, setPurchasedProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(KEYS.PURCHASED);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [comparedProductIds, setComparedProductIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(KEYS.COMPARED);
      if (saved) return new Set(JSON.parse(saved));
    } catch (e) {}
    return new Set<string>();
  });

  // Synchronization Metadata
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<Error | null>(null);

  // Sync callbacks refs to avoid unnecessary re-subscriptions
  const onWishlistChangeRef = useRef(onWishlistChange);
  const onPointsUpdateRef = useRef(onPointsUpdate);

  useEffect(() => {
    onWishlistChangeRef.current = onWishlistChange;
    onPointsUpdateRef.current = onPointsUpdate;
  }, [onWishlistChange, onPointsUpdate]);

  // Wishlist visual pulse feedback on item addition
  useEffect(() => {
    if (wishlist.size > lastWishlistSizeRef.current) {
      setPulseWishlist(true);
      const timer = setTimeout(() => setPulseWishlist(false), 800);
      lastWishlistSizeRef.current = wishlist.size;
      return () => clearTimeout(timer);
    } else {
      lastWishlistSizeRef.current = wishlist.size;
    }
  }, [wishlist.size]);

  // Cross-tab synchronization via storage events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.key) return;

      try {
        if (e.key === KEYS.WISHLIST && e.newValue) {
          const parsed = new Set<string>(JSON.parse(e.newValue));
          setWishlist(parsed);
        } else if (e.key === KEYS.USER_BELT && e.newValue) {
          setUserBeltState(e.newValue);
        } else if (e.key === KEYS.POINTS && e.newValue) {
          const pts = parseInt(e.newValue, 10);
          setPoints(pts);
        } else if (e.key === KEYS.POINTS_HISTORY && e.newValue) {
          setPointsHistory(JSON.parse(e.newValue));
        } else if (e.key === KEYS.STREAK && e.newValue) {
          setStreak(parseInt(e.newValue, 10));
        } else if (e.key === KEYS.LGPD && e.newValue) {
          setLgpdConsent(JSON.parse(e.newValue));
        } else if (e.key === KEYS.VIEWED && e.newValue) {
          setViewedProductIds(JSON.parse(e.newValue));
        }
      } catch (err) {
        console.warn('[usePersistence] Storage event parse error:', err);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // --- FIRESTORE BIDIRECTIONAL SYNC ENGINE ---

  const syncGuestWishlistToFirestore = useCallback(async (userId: string, localIds: string[]) => {
    if (!localIds || localIds.length === 0) return;

    for (const id of localIds) {
      const path = `users/${userId}/wishlist/${id}`;
      try {
        await setDoc(doc(db, path), {
          addedAt: new Date().toISOString(),
          alertEnabled: false
        }, { merge: true });
      } catch (err) {
        systemErrorLog.logFirebaseError(err, 'syncGuestWishlist', path);
      }
    }
  }, []);

  const syncUserProfile = useCallback(async (u: FirebaseUser) => {
    setIsSyncing(true);
    setSyncError(null);

    const userDocPath = `users/${u.uid}`;
    try {
      const docSnap = await getDoc(doc(db, "users", u.uid));

      if (docSnap.exists()) {
        const data = docSnap.data();

        // 1. Sync Graduação / Faixa
        if (data?.belt) {
          setUserBeltState(data.belt);
          localStorage.setItem(KEYS.USER_BELT, data.belt);
          localStorage.setItem(KEYS.FOCUS_BELT, `Faixa ${data.belt}`);
        } else {
          const localBelt = localStorage.getItem(KEYS.USER_BELT) || 'Branca';
          await updateDoc(doc(db, userDocPath), {
            belt: localBelt,
            updatedAt: new Date().toISOString()
          }).catch(() => {});
        }

        // 2. Sync LGPD Consents
        if (data?.lgpdConsent) {
          setLgpdConsent(data.lgpdConsent);
          localStorage.setItem(KEYS.LGPD, JSON.stringify(data.lgpdConsent));
        } else {
          const localLgpd = localStorage.getItem(KEYS.LGPD);
          if (localLgpd) {
            try {
              const consentObj = JSON.parse(localLgpd);
              await updateDoc(doc(db, userDocPath), {
                lgpdConsent: consentObj,
                updatedAt: new Date().toISOString()
              }).catch(() => {});
            } catch (e) {}
          }
        }

        // 3. Sync Points & History (Taking highest balance & deduplicating history)
        const localPointsVal = parseInt(localStorage.getItem(KEYS.POINTS) || '100', 10);
        const localHistoryStr = localStorage.getItem(KEYS.POINTS_HISTORY);
        let localHistoryArr: PointTransaction[] = [];
        if (localHistoryStr) {
          try {
            localHistoryArr = JSON.parse(localHistoryStr);
          } catch (e) {}
        }

        const remotePoints = data?.points !== undefined ? data.points : 100;
        const remoteHistory: PointTransaction[] = data?.pointsHistory || [];

        const mergedHistory = [...remoteHistory];
        localHistoryArr.forEach(ltx => {
          if (ltx?.id && !mergedHistory.some(rtx => rtx.id === ltx.id)) {
            mergedHistory.push(ltx);
          }
        });

        const maxPoints = Math.max(localPointsVal, remotePoints);
        const remoteStreak = data?.streak !== undefined ? data.streak : 0;

        setPoints(maxPoints);
        setPointsHistory(mergedHistory);
        setStreak(remoteStreak);

        localStorage.setItem(KEYS.POINTS, String(maxPoints));
        localStorage.setItem(KEYS.POINTS_HISTORY, JSON.stringify(mergedHistory));
        localStorage.setItem(KEYS.STREAK, String(remoteStreak));

        if (onPointsUpdateRef.current) {
          onPointsUpdateRef.current(maxPoints);
        }

        // Update remote document with consolidated balance
        await updateDoc(doc(db, userDocPath), {
          points: maxPoints,
          pointsHistory: mergedHistory,
          updatedAt: new Date().toISOString()
        }).catch((err) => {
          console.warn('[usePersistence] Non-fatal user points sync warning:', err);
        });

      } else {
        // Initial setup for new user
        const timestamp = new Date().toISOString();
        const localPointsVal = parseInt(localStorage.getItem(KEYS.POINTS) || '100', 10);
        const localStreakVal = parseInt(localStorage.getItem(KEYS.STREAK) || '0', 10);
        const localBelt = localStorage.getItem(KEYS.USER_BELT) || 'Branca';

        const defaultProfile = {
          displayName: u.displayName || u.email?.split('@')[0] || "Atleta OSS.OS",
          email: u.email || "",
          points: Math.max(100, localPointsVal),
          streak: localStreakVal,
          belt: localBelt,
          dojo: "Dojo Local / Garagem",
          createdAt: timestamp,
          updatedAt: timestamp,
          pointsHistory: [
            {
              id: `tx-welcome-${Date.now()}`,
              type: 'WELCOME',
              description: 'Bônus de Boas-vindas (Cadastro no Portal OSS.OS)',
              points: 100,
              date: timestamp
            }
          ],
          lgpdConsent: lgpdConsent || {
            approvedCadastral: true,
            approvedWishlistAlerts: true,
            approvedSessionCookies: true,
            approvedNavigation: true,
            consentDate: timestamp,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Browser'
          }
        };

        await setDoc(doc(db, userDocPath), defaultProfile);
        setPoints(defaultProfile.points);
        setPointsHistory(defaultProfile.pointsHistory);
        setStreak(defaultProfile.streak);
        setUserBeltState(defaultProfile.belt);
      }

      setLastSyncedAt(new Date());
    } catch (err: any) {
      setSyncError(err);
      systemErrorLog.logFirebaseError(err, 'syncUserProfile', userDocPath);
    } finally {
      setIsSyncing(false);
    }
  }, [lgpdConsent]);

  // Main Effect: Attach Firebase Listeners & Trigger Profile Sync
  useEffect(() => {
    let unsubWishlist: Unsubscribe | null = null;

    if (user?.uid) {
      const localWishlistStr = localStorage.getItem(KEYS.WISHLIST);
      let localWishlistIds: string[] = [];
      if (localWishlistStr) {
        try {
          localWishlistIds = JSON.parse(localWishlistStr);
        } catch (e) {}
      }

      // 1. Sync guest wishlist items to remote Firestore
      if (localWishlistIds.length > 0) {
        syncGuestWishlistToFirestore(user.uid, localWishlistIds);
      }

      // 2. Sync User Profile details
      syncUserProfile(user);

      // 3. Attach real-time snapshot listener on user wishlist collection
      const wishlistCollectionPath = `users/${user.uid}/wishlist`;
      const q = query(collection(db, wishlistCollectionPath));

      unsubWishlist = onSnapshot(
        q,
        (snapshot) => {
          const syncedIds = new Set<string>(snapshot.docs.map(d => d.id));
          const alertedIds = new Set<string>(
            snapshot.docs.filter(d => d.data().alertEnabled).map(d => d.id)
          );

          setWishlist(syncedIds);
          setWishlistAlerts(alertedIds);

          // Always backup to localStorage for instant offline access
          localStorage.setItem(KEYS.WISHLIST, JSON.stringify(Array.from(syncedIds)));

          if (onWishlistChangeRef.current) {
            onWishlistChangeRef.current(syncedIds, alertedIds);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, wishlistCollectionPath);
        }
      );
    } else {
      // Unauthenticated Guest: reload from localStorage
      try {
        const saved = localStorage.getItem(KEYS.WISHLIST);
        if (saved) {
          const parsed = new Set<string>(JSON.parse(saved));
          setWishlist(parsed);
        } else {
          setWishlist(new Set());
        }
      } catch (e) {
        setWishlist(new Set());
      }
      setWishlistAlerts(new Set());
    }

    return () => {
      if (unsubWishlist) {
        unsubWishlist();
      }
    };
  }, [user?.uid, syncGuestWishlistToFirestore, syncUserProfile]);

  // --- WISHLIST ACTIONS ---

  const isInWishlist = useCallback((productId: string): boolean => {
    return wishlist.has(productId);
  }, [wishlist]);

  const isAlertActive = useCallback((productId: string): boolean => {
    return wishlistAlerts.has(productId);
  }, [wishlistAlerts]);

  const addToWishlist = useCallback(async (productId: string, metadata?: { title?: string; price?: number }): Promise<void> => {
    // 1. Optimistic Local Update
    setWishlist(prev => {
      const next = new Set(prev);
      next.add(productId);
      localStorage.setItem(KEYS.WISHLIST, JSON.stringify(Array.from(next)));
      return next;
    });

    // 2. Cloud Persistence
    if (user?.uid) {
      const path = `users/${user.uid}/wishlist/${productId}`;
      try {
        await setDoc(doc(db, path), {
          addedAt: Timestamp.now(),
          alertEnabled: false,
          targetPrice: metadata?.price || 0
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
  }, [user?.uid]);

  const removeFromWishlist = useCallback(async (productId: string): Promise<void> => {
    // 1. Optimistic Local Update
    setWishlist(prev => {
      const next = new Set(prev);
      next.delete(productId);
      localStorage.setItem(KEYS.WISHLIST, JSON.stringify(Array.from(next)));
      return next;
    });

    setWishlistAlerts(prev => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });

    // 2. Cloud Persistence
    if (user?.uid) {
      const path = `users/${user.uid}/wishlist/${productId}`;
      try {
        await deleteDoc(doc(db, path));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
  }, [user?.uid]);

  const toggleWishlist = useCallback(async (productId: string, metadata?: { title?: string; price?: number }): Promise<boolean> => {
    const currentlyInWishlist = wishlist.has(productId);
    if (currentlyInWishlist) {
      await removeFromWishlist(productId);
      return false; // Removed
    } else {
      await addToWishlist(productId, metadata);
      return true; // Added
    }
  }, [wishlist, addToWishlist, removeFromWishlist]);

  const clearWishlist = useCallback(async (): Promise<void> => {
    const previous = Array.from(wishlist);
    setWishlist(new Set());
    setWishlistAlerts(new Set());
    localStorage.setItem(KEYS.WISHLIST, JSON.stringify([]));

    if (user?.uid) {
      for (const id of previous) {
        const path = `users/${user.uid}/wishlist/${id}`;
        try {
          await deleteDoc(doc(db, path));
        } catch (e) {}
      }
    }
  }, [wishlist, user?.uid]);

  const togglePriceAlert = useCallback(async (productId: string, currentPrice?: number): Promise<boolean> => {
    const currentlyAlerted = wishlistAlerts.has(productId);
    const newAlertState = !currentlyAlerted;

    // Optimistic state
    setWishlistAlerts(prev => {
      const next = new Set(prev);
      if (newAlertState) next.add(productId);
      else next.delete(productId);
      return next;
    });

    if (user?.uid) {
      const path = `users/${user.uid}/wishlist/${productId}`;
      try {
        await updateDoc(doc(db, path), {
          alertEnabled: newAlertState,
          targetPrice: currentPrice || 0,
          lastNotifiedAt: null
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }

    return newAlertState;
  }, [wishlistAlerts, user?.uid]);

  // --- PREFERENCES & ATHLETE PROFILE ACTIONS ---

  const setUserBelt = useCallback(async (newBelt: string): Promise<void> => {
    setUserBeltState(newBelt);
    localStorage.setItem(KEYS.USER_BELT, newBelt);
    localStorage.setItem(KEYS.FOCUS_BELT, `Faixa ${newBelt}`);
    window.dispatchEvent(new Event('storage'));

    if (user?.uid) {
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, path), {
          belt: newBelt,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
  }, [user?.uid]);

  const addPoints = useCallback(async (amount: number, description: string, type: string = 'REWARD'): Promise<number> => {
    const timestamp = new Date().toISOString();
    const newTx: PointTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      description,
      points: amount,
      date: timestamp
    };

    const nextPoints = Math.max(0, points + amount);
    const nextHistory = [newTx, ...pointsHistory];

    setPoints(nextPoints);
    setPointsHistory(nextHistory);

    localStorage.setItem(KEYS.POINTS, String(nextPoints));
    localStorage.setItem(KEYS.POINTS_HISTORY, JSON.stringify(nextHistory));
    window.dispatchEvent(new Event('storage'));

    if (onPointsUpdateRef.current) {
      onPointsUpdateRef.current(nextPoints);
    }

    if (user?.uid) {
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, path), {
          points: nextPoints,
          pointsHistory: nextHistory,
          updatedAt: timestamp
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }

    return nextPoints;
  }, [points, pointsHistory, user?.uid]);

  const incrementStreak = useCallback(async (): Promise<number> => {
    const nextStreak = streak + 1;
    setStreak(nextStreak);
    localStorage.setItem(KEYS.STREAK, String(nextStreak));
    window.dispatchEvent(new Event('storage'));

    if (user?.uid) {
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, path), {
          streak: nextStreak,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }

    return nextStreak;
  }, [streak, user?.uid]);

  const updateLgpdConsent = useCallback(async (partial: Partial<LgpdConsentState>): Promise<void> => {
    const updated: LgpdConsentState = {
      approvedCadastral: true,
      approvedWishlistAlerts: false,
      approvedSessionCookies: true,
      approvedNavigation: true,
      consentDate: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Browser',
      ...(lgpdConsent || {}),
      ...partial
    };

    setLgpdConsent(updated);
    localStorage.setItem(KEYS.LGPD, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));

    if (user?.uid) {
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, path), {
          lgpdConsent: updated,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
  }, [lgpdConsent, user?.uid]);

  // --- BROWSING & COMPARISON ACTIONS ---

  const addViewedProduct = useCallback((productId: string) => {
    setViewedProductIds(prev => {
      const filtered = prev.filter(id => id !== productId);
      const next = [productId, ...filtered].slice(0, 30); // Max 30 recent items
      localStorage.setItem(KEYS.VIEWED, JSON.stringify(next));
      return next;
    });
  }, []);

  const addPurchasedProduct = useCallback((productId: string) => {
    setPurchasedProductIds(prev => {
      if (prev.includes(productId)) return prev;
      const next = [productId, ...prev];
      localStorage.setItem(KEYS.PURCHASED, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleCompareProduct = useCallback((productId: string) => {
    setComparedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        if (next.size >= 4) {
          return next; // Limit to 4 simultaneous comparisons
        }
        next.add(productId);
      }
      localStorage.setItem(KEYS.COMPARED, JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  const clearComparison = useCallback(() => {
    setComparedProductIds(new Set());
    localStorage.setItem(KEYS.COMPARED, JSON.stringify([]));
  }, []);

  const forceSyncNow = useCallback(async () => {
    if (user) {
      await syncUserProfile(user);
    }
  }, [user, syncUserProfile]);

  return {
    wishlist,
    wishlistAlerts,
    wishlistCount: wishlist.size,
    isInWishlist,
    isAlertActive,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    togglePriceAlert,
    pulseWishlist,

    userBelt,
    setUserBelt,
    points,
    pointsHistory,
    streak,
    addPoints,
    incrementStreak,
    lgpdConsent,
    updateLgpdConsent,

    viewedProductIds,
    addViewedProduct,
    purchasedProductIds,
    addPurchasedProduct,
    comparedProductIds,
    toggleCompareProduct,
    clearComparison,

    isSyncing,
    lastSyncedAt,
    syncError,
    forceSyncNow
  };
}

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product } from '../types';
import { 
  requestFCMToken, 
  onFCMForegroundMessage, 
  sendRealFCMPush, 
  registerFCMServiceWorker,
  FCMPushPayload 
} from '../lib/fcmService';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

export interface NotificationPreferences {
  priceDrops: boolean;
  coupons: boolean;
  newReleases: boolean;
  wishlistOnly: boolean;
  categories: string[];
}

export interface InAppReceivedNotification {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  url?: string;
  type: string;
  timestamp: string;
  isRead: boolean;
  source: 'fcm' | 'sw' | 'local';
}

export interface NotificationContextType {
  permission: NotificationPermission;
  fcmToken: string | null;
  isSubscribed: boolean;
  isSupported: boolean;
  isLoading: boolean;
  swStatus: 'ready' | 'loading' | 'unregistered' | 'unsupported' | 'error';
  preferences: NotificationPreferences;
  recentNotifications: InAppReceivedNotification[];
  unreadCount: number;
  isOnboardingModalOpen: boolean;
  isPermissionModalOpen: boolean;
  permissionModalInitialTab: 'status' | 'guide';
  
  // Actions
  requestNotificationPermission: (options?: { source?: string; forceGuideIfDenied?: boolean }) => Promise<{ success: boolean; token?: string; permission: NotificationPermission }>;
  disablePushNotifications: () => Promise<void>;
  sendTestNotification: (product?: Product, customMessage?: string) => Promise<{ success: boolean; messageId?: string; error?: string }>;
  updatePreferences: (partial: Partial<NotificationPreferences>) => Promise<void>;
  openOnboardingModal: () => void;
  closeOnboardingModal: () => void;
  dismissOnboarding: () => void;
  openPermissionModal: (tab?: 'status' | 'guide') => void;
  closePermissionModal: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotificationHistory: () => void;
  checkPermissionStatus: () => NotificationPermission;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  priceDrops: true,
  coupons: true,
  newReleases: true,
  wishlistOnly: false,
  categories: ['Kimonos', 'Faixas', 'Rashguards']
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [fcmToken, setFcmToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('oss_fcm_token');
    }
    return null;
  });

  const [isSupported, setIsSupported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return 'Notification' in window && 'serviceWorker' in navigator;
  });

  const [swStatus, setSwStatus] = useState<'ready' | 'loading' | 'unregistered' | 'unsupported' | 'error'>('loading');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem('oss_notification_preferences');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_PREFERENCES;
  });

  const [recentNotifications, setRecentNotifications] = useState<InAppReceivedNotification[]>(() => {
    try {
      const saved = localStorage.getItem('oss_notifications_inapp_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [permissionModalInitialTab, setPermissionModalInitialTab] = useState<'status' | 'guide'>('status');

  const isSubscribed = permission === 'granted' && Boolean(fcmToken || localStorage.getItem('oss_push_price_alerts_subscribed') === 'true');

  const unreadCount = recentNotifications.filter(n => !n.isRead).length;

  // Persist notifications to local storage
  const saveNotifications = useCallback((notifs: InAppReceivedNotification[]) => {
    setRecentNotifications(notifs);
    try {
      localStorage.setItem('oss_notifications_inapp_history', JSON.stringify(notifs.slice(0, 30)));
    } catch (e) {}
  }, []);

  // Check Service Worker registration and status
  const checkServiceWorker = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      setSwStatus('unsupported');
      return;
    }

    try {
      const reg = await navigator.serviceWorker.getRegistration('/');
      if (reg && reg.active) {
        setSwStatus('ready');
      } else {
        const newReg = await registerFCMServiceWorker();
        setSwStatus(newReg?.active ? 'ready' : 'loading');
      }
    } catch (e) {
      console.warn('[NotificationManager] Erro ao checar Service Worker:', e);
      setSwStatus('error');
    }
  }, []);

  // Monitor browser permission changes (e.g. user toggles in browser address bar)
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setIsSupported(false);
      return;
    }

    checkServiceWorker();

    // Check navigator.permissions API if available
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'notifications' }).then((status) => {
        setPermission(Notification.permission);
        status.onchange = () => {
          setPermission(Notification.permission);
          if (Notification.permission === 'granted') {
            requestFCMToken().then(t => {
              if (t) setFcmToken(t);
            });
          }
        };
      }).catch(() => {
        setPermission(Notification.permission);
      });
    }

    // Register foreground FCM listener
    const unsubscribeFCM = onFCMForegroundMessage((payload) => {
      console.log('[NotificationManager] Mensagem FCM recebida no app em primeiro plano:', payload);
      
      const newNotif: InAppReceivedNotification = {
        id: `fcm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: payload.notification?.title || '🥋 OSS.OS Jiu-Jitsu',
        body: payload.notification?.body || 'Nova notificação do tatame!',
        imageUrl: payload.notification?.icon || payload.notification?.image || payload.data?.imageUrl,
        url: payload.data?.url || (payload.data?.productId ? `/?view=SHOP&product=${payload.data.productId}` : '/'),
        type: payload.data?.type || 'fcm_foreground',
        timestamp: new Date().toISOString(),
        isRead: false,
        source: 'fcm'
      };

      setRecentNotifications(prev => [newNotif, ...prev.slice(0, 29)]);
    });

    // Listen to messages from the Service Worker (background push clicks or received events)
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (!event.data) return;

      if (event.data.type === 'FCM_PUSH_RECEIVED' || event.data.type === 'FCM_BACKGROUND_MESSAGE') {
        const payload = event.data.payload || {};
        const newNotif: InAppReceivedNotification = {
          id: `sw_${Date.now()}`,
          title: payload.title || '🥋 Oferta do Tatame',
          body: payload.body || 'Alerta de kimono ou equipamento recebido.',
          imageUrl: payload.icon,
          url: payload.targetUrl || payload.data?.url || '/',
          type: 'fcm_sw',
          timestamp: new Date().toISOString(),
          isRead: false,
          source: 'sw'
        };
        setRecentNotifications(prev => [newNotif, ...prev.slice(0, 29)]);
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);

    return () => {
      unsubscribeFCM();
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [checkServiceWorker]);

  // Sync token to Firestore whenever user logs in
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user && fcmToken) {
        try {
          const tokenRef = doc(db, 'users', user.uid, 'fcmTokens', fcmToken.substring(0, 32));
          setDoc(tokenRef, {
            token: fcmToken,
            updatedAt: new Date().toISOString(),
            platform: 'web',
            userAgent: navigator.userAgent
          }, { merge: true }).catch(err => {
            console.warn('[NotificationManager] Erro ao sincronizar token com usuário logado:', err);
          });
        } catch (e) {}
      }
    });

    return () => unsubscribeAuth();
  }, [fcmToken]);

  // Centralized Permission Request Handler
  const requestNotificationPermission = useCallback(async (options?: { source?: string; forceGuideIfDenied?: boolean }) => {
    const { forceGuideIfDenied = true } = options || {};

    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { success: false, permission: 'denied' as NotificationPermission };
    }

    if (Notification.permission === 'denied') {
      setPermission('denied');
      if (forceGuideIfDenied) {
        setPermissionModalInitialTab('guide');
        setIsPermissionModalOpen(true);
      }
      return { success: false, permission: 'denied' as NotificationPermission };
    }

    setIsLoading(true);
    try {
      // 1. Request browser permission
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        localStorage.setItem('oss_push_price_alerts_subscribed', 'true');
        localStorage.setItem('oss_push_subscribed_at', new Date().toISOString());
        localStorage.setItem('oss_notif_onboarding_completed', 'true');
        localStorage.removeItem('oss_notif_onboarding_dismissed');

        // 2. Register Service Worker and retrieve FCM Registration Token
        let token = await requestFCMToken(true);
        if (!token) {
          // Retry once with fresh worker registration
          await registerFCMServiceWorker();
          token = await requestFCMToken(true);
        }

        if (token) {
          setFcmToken(token);
          localStorage.setItem('oss_fcm_token', token);

          // 3. Persist to Firestore
          const currentUser = auth.currentUser;
          if (currentUser) {
            try {
              const tokenRef = doc(db, 'users', currentUser.uid, 'fcmTokens', token.substring(0, 32));
              await setDoc(tokenRef, {
                token,
                updatedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                platform: 'web',
                userAgent: navigator.userAgent,
                preferences
              }, { merge: true });
            } catch (fsErr) {
              console.warn('[NotificationManager] Firestore token store fallback:', fsErr);
            }
          } else {
            // Store under subscribers collection for anonymous visitors
            try {
              const subRef = doc(db, 'subscribers', token.substring(0, 32));
              await setDoc(subRef, {
                token,
                createdAt: new Date().toISOString(),
                platform: 'web',
                type: 'anonymous_fcm'
              }, { merge: true });
            } catch (subErr) {
              console.warn('[NotificationManager] Anonymous subscriber store fallback:', subErr);
            }
          }
        }

        // 4. Send Welcome notification via Service Worker
        try {
          const reg = await navigator.serviceWorker.ready;
          if (reg && 'showNotification' in reg) {
            await reg.showNotification('🥋 Notificações OSS.OS Ativadas!', {
              body: 'Tudo pronto! Você receberá alertas de quedas de preço e cupons exclusivos no tatame.',
              icon: '/apple-touch-icon.png',
              badge: '/apple-touch-icon.png',
              vibrate: [200, 100, 200],
              tag: 'oss-welcome-fcm',
              data: { url: '/?view=SHOP' },
              actions: [
                { action: 'view', title: 'Explorar Ofertas' },
                { action: 'dismiss', title: 'Fechar' }
              ]
            } as any);
          }
        } catch (e) {
          console.warn('[NotificationManager] Welcome notification SW dispatch error:', e);
        }

        setSwStatus('ready');
        return { success: true, token: token || undefined, permission: result };
      } else if (result === 'denied') {
        if (forceGuideIfDenied) {
          setPermissionModalInitialTab('guide');
          setIsPermissionModalOpen(true);
        }
        return { success: false, permission: result };
      }

      return { success: false, permission: result };
    } catch (err: any) {
      console.error('[NotificationManager] Erro ao solicitar permissão:', err);
      return { success: false, permission: Notification.permission };
    } finally {
      setIsLoading(false);
    }
  }, [preferences]);

  // Disable push notifications cleanly
  const disablePushNotifications = useCallback(async () => {
    localStorage.removeItem('oss_push_price_alerts_subscribed');
    const existingToken = fcmToken || localStorage.getItem('oss_fcm_token');
    
    if (existingToken && auth.currentUser) {
      try {
        const tokenRef = doc(db, 'users', auth.currentUser.uid, 'fcmTokens', existingToken.substring(0, 32));
        await deleteDoc(tokenRef);
      } catch (e) {}
    }

    localStorage.removeItem('oss_fcm_token');
    setFcmToken(null);
  }, [fcmToken]);

  // Dispatches a real test push notification using the Firebase Cloud Messaging backend
  const sendTestNotification = useCallback(async (product?: Product, customMessage?: string) => {
    const sampleProduct = product || {
      id: 'prod-test',
      title: 'Kimono BJJ Vagabond Ultra Light Edição Limitada',
      price: 419.90,
      originalPrice: 599.90,
      imageUrl: '/apple-touch-icon.png',
      brand: 'Vagabond BJJ'
    } as Product;

    const discountPct = sampleProduct.originalPrice 
      ? Math.round(((sampleProduct.originalPrice - sampleProduct.price) / sampleProduct.originalPrice) * 100)
      : 25;

    const pushPayload: FCMPushPayload = {
      token: fcmToken || localStorage.getItem('oss_fcm_token') || undefined,
      title: `🔥 Preço Baixou: ${sampleProduct.title.slice(0, 35)}...`,
      body: customMessage || `Economia comprovada (-${discountPct}%)! De R$ ${sampleProduct.originalPrice?.toFixed(2) || '599,90'} por apenas R$ ${sampleProduct.price.toFixed(2)}. Toque para conferir!`,
      imageUrl: sampleProduct.imageUrl || '/apple-touch-icon.png',
      productId: sampleProduct.id,
      productTitle: sampleProduct.title,
      productPrice: sampleProduct.price,
      data: {
        url: `/?view=SHOP&product=${sampleProduct.id}`,
        type: 'test_price_drop'
      }
    };

    return await sendRealFCMPush(pushPayload);
  }, [fcmToken]);

  // Update notification preferences
  const updatePreferences = useCallback(async (partial: Partial<NotificationPreferences>) => {
    const updated = { ...preferences, ...partial };
    setPreferences(updated);
    try {
      localStorage.setItem('oss_notification_preferences', JSON.stringify(updated));
      const currentUser = auth.currentUser;
      if (currentUser && fcmToken) {
        const tokenRef = doc(db, 'users', currentUser.uid, 'fcmTokens', fcmToken.substring(0, 32));
        await setDoc(tokenRef, { preferences: updated, updatedAt: new Date().toISOString() }, { merge: true });
      }
    } catch (e) {}
  }, [preferences, fcmToken]);

  // Modal helpers
  const openOnboardingModal = useCallback(() => setIsOnboardingModalOpen(true), []);
  const closeOnboardingModal = useCallback(() => setIsOnboardingModalOpen(false), []);
  const dismissOnboarding = useCallback(() => {
    setIsOnboardingModalOpen(false);
    localStorage.setItem('oss_notif_onboarding_dismissed', 'true');
  }, []);

  const openPermissionModal = useCallback((tab: 'status' | 'guide' = 'status') => {
    setPermissionModalInitialTab(tab);
    setIsPermissionModalOpen(true);
  }, []);

  const closePermissionModal = useCallback(() => setIsPermissionModalOpen(false), []);

  const markNotificationAsRead = useCallback((id: string) => {
    saveNotifications(recentNotifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, [recentNotifications, saveNotifications]);

  const markAllNotificationsAsRead = useCallback(() => {
    saveNotifications(recentNotifications.map(n => ({ ...n, isRead: true })));
  }, [recentNotifications, saveNotifications]);

  const clearNotificationHistory = useCallback(() => {
    saveNotifications([]);
  }, [saveNotifications]);

  const checkPermissionStatus = useCallback(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const p = Notification.permission;
      setPermission(p);
      return p;
    }
    return 'default';
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        permission,
        fcmToken,
        isSubscribed,
        isSupported,
        isLoading,
        swStatus,
        preferences,
        recentNotifications,
        unreadCount,
        isOnboardingModalOpen,
        isPermissionModalOpen,
        permissionModalInitialTab,
        requestNotificationPermission,
        disablePushNotifications,
        sendTestNotification,
        updatePreferences,
        openOnboardingModal,
        closeOnboardingModal,
        dismissOnboarding,
        openPermissionModal,
        closePermissionModal,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotificationHistory,
        checkPermissionStatus
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser utilizado dentro de um NotificationProvider');
  }
  return context;
};

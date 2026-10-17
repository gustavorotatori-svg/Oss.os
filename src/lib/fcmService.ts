import { getMessaging, getToken, onMessage, isSupported, MessagePayload } from 'firebase/messaging';
import { app, auth, db, handleFirestoreError, OperationType } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

export interface FCMPushPayload {
  token?: string;
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
  productId?: string;
  productTitle?: string;
  productPrice?: number;
  scheduledDate?: string;
  scheduledTime?: string;
  customNote?: string;
}

export interface FCMStatus {
  isSupported: boolean;
  permission: NotificationPermission;
  token: string | null;
  error: string | null;
}

let messagingInstance: ReturnType<typeof getMessaging> | null = null;
let activeToken: string | null = null;
let foregroundListenerRegistered = false;
const foregroundCallbacks: Array<(payload: MessagePayload) => void> = [];

/**
 * Initializes and retrieves the Firebase Cloud Messaging client instance.
 */
export async function getMessagingClient() {
  if (typeof window === 'undefined') return null;
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn('[FCM] Firebase Cloud Messaging não é suportado neste navegador/ambiente.');
      return null;
    }
    if (!messagingInstance) {
      messagingInstance = getMessaging(app);
    }
    return messagingInstance;
  } catch (err) {
    console.warn('[FCM] Erro ao instanciar getMessaging:', err);
    return null;
  }
}

/**
 * Registers the Firebase Cloud Messaging Service Worker explicitly.
 */
export async function registerFCMServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    console.log('[FCM] Service Worker registrado com sucesso:', registration.scope);
    return registration;
  } catch (err) {
    console.warn('[FCM] Falha ao registrar Service Worker do FCM:', err);
    return null;
  }
}

/**
 * Requests notification permission from user and retrieves the Firebase Cloud Messaging registration token.
 */
export async function requestFCMToken(forceRefresh = false): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  if (activeToken && !forceRefresh) {
    return activeToken;
  }

  try {
    const stored = localStorage.getItem('oss_fcm_token');
    if (stored && !forceRefresh) {
      activeToken = stored;
    }

    if (!('Notification' in window)) {
      console.warn('[FCM] Notificações não são suportadas neste navegador.');
      return activeToken;
    }

    let permission = Notification.permission;
    if (permission !== 'granted') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      console.warn('[FCM] Permissão de notificação negada ou não concedida:', permission);
      return activeToken;
    }

    const messaging = await getMessagingClient();
    if (!messaging) {
      console.warn('[FCM] Messaging instance indisponível.');
      return activeToken;
    }

    const swRegistration = await registerFCMServiceWorker();

    // Retrieve FCM Device Registration Token from Firebase servers
    const token = await getToken(messaging, {
      serviceWorkerRegistration: swRegistration || undefined
    });

    if (token) {
      console.log('[FCM] Token de registro obtido com sucesso dos servidores do Firebase:', token.substring(0, 15) + '...');
      activeToken = token;
      localStorage.setItem('oss_fcm_token', token);

      // Save token in Firestore user document if logged in
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const tokenDocRef = doc(db, 'users', currentUser.uid, 'fcmTokens', token.substring(0, 32));
          await setDoc(tokenDocRef, {
            token,
            updatedAt: new Date().toISOString(),
            platform: 'web',
            userAgent: navigator.userAgent
          }, { merge: true });
        } catch (dbErr) {
          console.warn('[FCM] Não foi possível persistir o token no Firestore:', dbErr);
        }
      }

      return token;
    }
  } catch (err: any) {
    console.warn('[FCM] Erro ao obter Token FCM do Firebase:', err?.message || err);
  }

  return activeToken;
}

/**
 * Sets up a listener for real-time foreground messages sent from Firebase Cloud Messaging servers.
 */
export function onFCMForegroundMessage(callback: (payload: MessagePayload) => void): () => void {
  foregroundCallbacks.push(callback);

  if (!foregroundListenerRegistered && typeof window !== 'undefined') {
    getMessagingClient().then((messaging) => {
      if (!messaging) return;
      try {
        onMessage(messaging, (payload) => {
          console.log('[FCM Client] Mensagem recebida em primeiro plano do Firebase Server:', payload);
          foregroundCallbacks.forEach(cb => {
            try {
              cb(payload);
            } catch (cbErr) {
              console.error('[FCM] Erro no callback de mensagem em primeiro plano:', cbErr);
            }
          });
        });
        foregroundListenerRegistered = true;
      } catch (e) {
        console.warn('[FCM] Erro ao vincular onMessage:', e);
      }
    });
  }

  return () => {
    const idx = foregroundCallbacks.indexOf(callback);
    if (idx !== -1) {
      foregroundCallbacks.splice(idx, 1);
    }
  };
}

/**
 * Triggers a real Push Notification dispatch through the Firebase Cloud Messaging backend server.
 */
export async function sendRealFCMPush(payload: FCMPushPayload): Promise<{ success: boolean; messageId?: string; serverMessage?: string; error?: string }> {
  try {
    let token = payload.token || activeToken;
    if (!token && typeof window !== 'undefined') {
      token = localStorage.getItem('oss_fcm_token') || undefined;
    }

    if (!token) {
      // Try to obtain token
      token = (await requestFCMToken()) || undefined;
    }

    const response = await fetch('/api/fcm/send-reminder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
        productId: payload.productId,
        productTitle: payload.productTitle,
        productPrice: payload.productPrice,
        scheduledDate: payload.scheduledDate,
        scheduledTime: payload.scheduledTime,
        customNote: payload.customNote,
        data: {
          url: payload.productId ? `/?view=SHOP&product=${payload.productId}` : '/',
          type: 'purchase_reminder',
          ...(payload.data || {})
        }
      })
    });

    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.error || `Erro HTTP ${response.status}`);
    }

    // Also trigger local notification fallback if token push returned simulated success or was received
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(payload.title, {
              body: payload.body,
              icon: payload.imageUrl || '/apple-touch-icon.png',
              badge: '/apple-touch-icon.png',
              vibrate: [200, 100, 200],
              data: { url: payload.productId ? `/?view=SHOP&product=${payload.productId}` : '/' }
            } as any);
          });
        }
      } catch (notifErr) {
        console.warn('[FCM Local Dispatch]', notifErr);
      }
    }

    return {
      success: true,
      messageId: resData.messageId || `fcm_${Date.now()}`,
      serverMessage: resData.message || 'Notificação Push enviada com sucesso pelos servidores do Firebase.'
    };
  } catch (error: any) {
    console.error('[FCM] Erro ao enviar Push via servidor Firebase:', error);
    return {
      success: false,
      error: error?.message || 'Falha ao despachar notificação push pelo servidor Firebase.'
    };
  }
}

/**
 * Registers a scheduled purchase reminder with the backend server queue.
 */
export async function scheduleRealFCMReminder(schedule: {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  productBrand: string;
  scheduledDate: string;
  scheduledTime: string;
  customNote?: string;
  token?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const token = schedule.token || activeToken || (typeof window !== 'undefined' ? localStorage.getItem('oss_fcm_token') || '' : '');

    const response = await fetch('/api/fcm/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...schedule,
        token
      })
    });

    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.error || 'Erro ao registrar agendamento no servidor');
    }

    return { success: true };
  } catch (error: any) {
    console.warn('[FCM] Erro ao agendar no servidor:', error);
    return { success: false, error: error?.message || String(error) };
  }
}

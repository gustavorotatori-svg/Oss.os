// OSS.OS - Main Service Worker (Offline Cache + Product Images + FCM Push Integration)

try {
  importScripts('/firebase-messaging-sw.js');
  console.log('[sw.js] Firebase Cloud Messaging integrado via importScripts.');
} catch (fcmErr) {
  console.warn('[sw.js] Aviso ao carregar firebase-messaging-sw.js:', fcmErr);
}

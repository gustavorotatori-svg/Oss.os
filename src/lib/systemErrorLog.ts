// OSS.OS - System Error Logging Engine for Firebase & Infrastructure
// Captures, catalogs, and diagnoses Firebase Firestore, Auth, FCM, and Cloud Errors.

export type ErrorSeverity = 'critical' | 'warning' | 'info';
export type ErrorService = 'firestore' | 'firebase_auth' | 'fcm' | 'network' | 'gemini' | 'system';

export interface SystemErrorEntry {
  id: string; // e.g. ERR-FB-8942A
  service: ErrorService;
  operation: string; // e.g. 'getDocs', 'setDoc', 'signInWithPopup', 'getToken'
  errorCode: string; // e.g. 'unavailable', 'permission-denied', 'unauthenticated', 'quota-exceeded'
  message: string;
  userFriendlyMessage: string;
  severity: ErrorSeverity;
  timestamp: number;
  formattedTimestamp: string;
  path?: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    isAnonymous?: boolean | null;
    authStatus: 'authenticated' | 'anonymous' | 'unauthenticated';
  };
  stackTrace?: string;
  rawError?: any;
  resolutionHint: string;
  status: 'active' | 'investigating' | 'resolved' | 'dismissed';
  metadata?: Record<string, any>;
}

type ErrorListener = (entry: SystemErrorEntry, allErrors: SystemErrorEntry[]) => void;

class SystemErrorLogManager {
  private errors: SystemErrorEntry[] = [];
  private listeners: Set<ErrorListener> = new Set();
  private maxStoredErrors: number = 50;
  private authGetter: (() => { uid?: string; email?: string | null; isAnonymous?: boolean } | null) | null = null;

  constructor() {
    this.loadPersistedErrors();
    this.setupGlobalHandlers();
  }

  public setAuthGetter(getter: () => { uid?: string; email?: string | null; isAnonymous?: boolean } | null): void {
    this.authGetter = getter;
  }

  private loadPersistedErrors() {
    if (typeof window === 'undefined') return;
    try {
      const stored = sessionStorage.getItem('oss_system_errors');
      if (stored) {
        this.errors = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[SystemErrorLog] Erro ao carregar erros da sessão:', e);
    }
  }

  private persistErrors() {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem('oss_system_errors', JSON.stringify(this.errors.slice(0, 20)));
    } catch (e) {
      console.warn('[SystemErrorLog] Erro ao salvar erros na sessão:', e);
    }
  }

  private setupGlobalHandlers() {
    if (typeof window === 'undefined') return;

    // Listen for unhandled promise rejections originating from Firebase
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      const reasonStr = String(reason?.message || reason || '');
      
      if (
        reasonStr.includes('firestore') ||
        reasonStr.includes('firebase') ||
        reasonStr.includes('permission-denied') ||
        reasonStr.includes('FirebaseError') ||
        reason?.name === 'FirebaseError'
      ) {
        this.logFirebaseError(
          reason,
          'unhandled_rejection',
          null,
          { source: 'window.unhandledrejection' }
        );
      }
    });
  }

  /**
   * Generates a unique, standardized support error code like ERR-FB-7A8B9C
   */
  public generateErrorId(servicePrefix: string = 'FB'): string {
    const timestampHex = Date.now().toString(16).slice(-4).toUpperCase();
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ERR-${servicePrefix}-${timestampHex}-${randomHex}`;
  }

  /**
   * Translates technical Firebase errors into actionable diagnostic hints for BJJ users & developers.
   */
  private getResolutionHint(errorCode: string, service: ErrorService, message: string): { hint: string; friendlyMsg: string } {
    const lower = (errorCode + ' ' + message).toLowerCase();

    if (lower.includes('unavailable') || lower.includes('offline') || lower.includes('client is offline')) {
      return {
        hint: 'O cliente Firestore operou em modo cache offline. Verifique a conexão com a internet ou o status dos serviços do Google Cloud.',
        friendlyMsg: 'Conexão com o banco de dados Firebase offline ou instável. Modo de contingência em cache ativado.'
      };
    }
    if (lower.includes('permission-denied') || lower.includes('insufficient permissions')) {
      return {
        hint: 'As regras de segurança do Firestore (firestore.rules) bloquearam a operação. Verifique se o usuário possui a role necessária ou está autenticado.',
        friendlyMsg: 'Permissão negada pelas regras de segurança do Firebase.'
      };
    }
    if (lower.includes('resource-exhausted') || lower.includes('quota')) {
      return {
        hint: 'A cota diária de leitura/gravação do Firebase foi excedida. Aguarde a renovação da cota no painel do GCP.',
        friendlyMsg: 'Limite de requisições do Firebase atingido momentaneamente.'
      };
    }
    if (lower.includes('unauthenticated') || lower.includes('auth/')) {
      return {
        hint: 'Sessão de autenticação expirada ou inválida. Recomenda-se realizar novo login via Google ou E-mail.',
        friendlyMsg: 'Sessão do usuário não autenticada no Firebase Auth.'
      };
    }
    if (lower.includes('deadline-exceeded') || lower.includes('timeout')) {
      return {
        hint: 'A requisição ao Firestore excedeu o tempo limite (timeout). Pode indicar latência elevada da rede.',
        friendlyMsg: 'Tempo limite da operação com o Firebase excedido.'
      };
    }
    if (lower.includes('messaging') || lower.includes('fcm') || lower.includes('push')) {
      return {
        hint: 'Erro no Firebase Cloud Messaging ou permissão de notificações negada pelo navegador.',
        friendlyMsg: 'Falha no serviço de notificações push do Firebase.'
      };
    }

    return {
      hint: 'Ocorreu uma exceção no SDK do Firebase. Forneça o ID do erro ao suporte para análise dos logs de telemetria.',
      friendlyMsg: 'Falha técnica detectada na integração com o Firebase.'
    };
  }

  /**
   * Logs a Firebase or Infrastructure error and notifies all subscribed UI listeners.
   */
  public logFirebaseError(
    error: unknown,
    operation: string,
    path: string | null = null,
    extraMetadata: Record<string, any> = {}
  ): SystemErrorEntry {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const rawMessage = errorObj.message || String(error);

    // Extract Firebase error code if available (e.g. FirebaseError.code)
    const fbCode = (error as any)?.code || (rawMessage.includes(':') ? rawMessage.split(':')[0] : 'firebase/unknown-error');

    let service: ErrorService = 'firestore';
    if (operation.includes('auth') || fbCode.includes('auth/')) {
      service = 'firebase_auth';
    } else if (operation.includes('fcm') || operation.includes('messaging') || operation.includes('push')) {
      service = 'fcm';
    } else if (rawMessage.includes('network') || rawMessage.includes('fetch')) {
      service = 'network';
    }

    const { hint, friendlyMsg } = this.getResolutionHint(fbCode, service, rawMessage);
    const now = Date.now();
    const date = new Date(now);

    const currentUser = this.authGetter ? this.authGetter() : null;
    const authStatus = currentUser ? (currentUser.isAnonymous ? 'anonymous' : 'authenticated') : 'unauthenticated';

    const entry: SystemErrorEntry = {
      id: this.generateErrorId(service === 'firestore' ? 'FB' : service === 'firebase_auth' ? 'AUTH' : 'FCM'),
      service,
      operation,
      errorCode: fbCode,
      message: rawMessage,
      userFriendlyMessage: friendlyMsg,
      severity: fbCode.includes('permission-denied') || fbCode.includes('resource-exhausted') ? 'critical' : 'warning',
      timestamp: now,
      formattedTimestamp: `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR')}`,
      path,
      authInfo: {
        userId: currentUser?.uid ? `${currentUser.uid.substring(0, 8)}...` : null,
        email: currentUser?.email || null,
        isAnonymous: currentUser?.isAnonymous || false,
        authStatus
      },
      stackTrace: errorObj.stack,
      rawError: typeof error === 'object' ? { ...error, message: rawMessage, name: errorObj.name } : { raw: String(error) },
      resolutionHint: hint,
      status: 'active',
      metadata: extraMetadata
    };

    // Prepend to list
    this.errors = [entry, ...this.errors.slice(0, this.maxStoredErrors - 1)];
    this.persistErrors();

    // Log to console with structured styling
    console.error(
      `%c[OSS.OS SYSTEM ERROR LOG] %c${entry.id}%c - ${entry.service.toUpperCase()} / ${entry.operation}: ${entry.message}`,
      'background: #7f1d1d; color: #fecaca; font-weight: bold; padding: 2px 4px;',
      'background: #dc2626; color: #ffffff; font-weight: bold; padding: 2px 4px;',
      'color: #f87171;'
    );

    // Notify listeners
    this.notifyListeners(entry);

    return entry;
  }

  /**
   * Simulates a real Firebase error for diagnostic and support verification purposes.
   */
  public simulateFirebaseError(type: 'firestore_read' | 'firestore_write' | 'permission_denied' | 'auth_timeout' | 'fcm_quota' = 'firestore_read'): SystemErrorEntry {
    const scenarios: Record<string, { service: ErrorService; op: string; code: string; msg: string; path?: string }> = {
      firestore_read: {
        service: 'firestore',
        op: 'getDocs',
        code: 'unavailable',
        msg: 'Failed to get document because the client is offline or Firebase connection timeout exceeded.',
        path: 'products'
      },
      firestore_write: {
        service: 'firestore',
        op: 'setDoc',
        code: 'deadline-exceeded',
        msg: 'The operation timed out while attempting to synchronize document with remote Firestore server.',
        path: 'users/gustavo_bjj/wishlist/kimono_kvra'
      },
      permission_denied: {
        service: 'firestore',
        op: 'deleteDoc',
        code: 'permission-denied',
        msg: 'Missing or insufficient permissions: Missing authorization token or invalid security rules in firestore.rules.',
        path: 'products/restricted_admin_item'
      },
      auth_timeout: {
        service: 'firebase_auth',
        op: 'signInWithPopup',
        code: 'auth/network-request-failed',
        msg: 'A network error (such as timeout, interrupted connection or unreachable host) has occurred during OAuth validation.'
      },
      fcm_quota: {
        service: 'fcm',
        op: 'getToken',
        code: 'messaging/quota-exceeded',
        msg: 'Firebase Cloud Messaging payload token generation limit reached for the current device instance.'
      }
    };

    const s = scenarios[type] || scenarios.firestore_read;
    const fakeError = new Error(s.msg);
    (fakeError as any).code = s.code;

    return this.logFirebaseError(fakeError, s.op, s.path, { isSimulated: true, simulatedType: type });
  }

  /**
   * Generates a comprehensive plain-text and markdown report ready to paste into support tickets or WhatsApp.
   */
  public generateDiagnosticReport(errorId?: string): string {
    const error = errorId ? this.errors.find(e => e.id === errorId) || this.errors[0] : this.errors[0];
    
    if (!error) {
      return `=== OSS.OS RELATÓRIO DE SISTEMA ===\nNenhum erro registrado no momento.\nData: ${new Date().toLocaleString('pt-BR')}`;
    }

    return `====================================================
OSS.OS JIU-JITSU • RELATÓRIO TÉCNICO DE ERRO DE SISTEMA
====================================================
ID DO ERRO: ${error.id}
SERVIÇO AFETADO: ${error.service.toUpperCase()}
OPERAÇÃO: ${error.operation}
CÓDIGO DE ERRO: ${error.errorCode}
SEVERIDADE: ${error.severity.toUpperCase()}
DATA E HORA: ${error.formattedTimestamp}
CAMINHO DO FIRESTORE: ${error.path || 'N/A'}
STATUS DO USUÁRIO: ${error.authInfo.authStatus} (UID: ${error.authInfo.userId || 'Anônimo'})
----------------------------------------------------
MENSAGEM TÉCNICA:
${error.message}

DIAGNÓSTICO & SUGESTÃO:
${error.resolutionHint}
----------------------------------------------------
INFORMAÇÕES DE AMBIENTE:
Navegador: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}
URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}
Online: ${typeof navigator !== 'undefined' ? (navigator.onLine ? 'SIM' : 'NÃO') : 'N/A'}
====================================================`;
  }

  public getErrors(): SystemErrorEntry[] {
    return [...this.errors];
  }

  public getLatestError(): SystemErrorEntry | null {
    return this.errors.length > 0 ? this.errors[0] : null;
  }

  public clearErrors(): void {
    this.errors = [];
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('oss_system_errors');
    }
    this.notifyListeners(null as any);
  }

  public dismissError(id: string): void {
    const item = this.errors.find(e => e.id === id);
    if (item) {
      item.status = 'dismissed';
      this.persistErrors();
      this.notifyListeners(item);
    }
  }

  public subscribe(listener: ErrorListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(latestEntry: SystemErrorEntry) {
    this.listeners.forEach((listener) => {
      try {
        listener(latestEntry, this.errors);
      } catch (err) {
        console.error('[SystemErrorLog] Erro ao notificar subscriber:', err);
      }
    });
  }
}

export const systemErrorLog = new SystemErrorLogManager();

import { auth } from './firebase';
import { User as FirebaseUser } from 'firebase/auth';

export interface JWTClaims {
  iss: string;
  aud: string;
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  iat: number;
  exp: number;
  auth_time?: number;
  firebase?: {
    identities?: Record<string, string[]>;
    sign_in_provider?: string;
    tenant?: string;
  };
  [key: string]: any;
}

export interface JWTTokenInfo {
  rawToken: string;
  header: {
    alg: string;
    kid?: string;
    typ?: string;
  };
  claims: JWTClaims;
  issuedAt: Date;
  expiresAt: Date;
  timeRemainingSeconds: number;
  isExpired: boolean;
  isShortLived: boolean;
  lifetimeMinutes: number;
  algorithm: string;
  keyId: string;
  issuer: string;
  audience: string;
  provider: string;
}

export interface ScalabilityMetrics {
  server: {
    status: string;
    uptimeSeconds: number;
    memoryMb: {
      rss: string;
      heapTotal: string;
      heapUsed: string;
    };
    compressionEnabled: boolean;
    concurrencyCapacity: string;
  };
  jwtSecurity: {
    algorithm: string;
    keyRotationStatus: string;
    jwksKeyCount: number;
    jwksKeyIds: string[];
    cacheTtlMinutesRemaining: number;
    httpsEnforced: boolean;
    hstsHeader: boolean;
  };
  inMemoryCache: {
    priceComparison: any;
    rssFeeds: any;
    aiScout: any;
    metadataScrape: any;
  };
  rateLimiter: {
    globalLimit: string;
    aiLimiter: string;
    trustProxy: boolean;
  };
}

/**
 * Decodes a client-side JWT token without external dependencies
 */
export function decodeClientJWT(token: string): { header: any; claims: JWTClaims } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64UrlDecode = (str: string) => {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      return decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    };

    const header = JSON.parse(base64UrlDecode(parts[0]));
    const claims = JSON.parse(base64UrlDecode(parts[1]));

    return { header, claims };
  } catch (e) {
    console.warn('Failed to parse client JWT token:', e);
    return null;
  }
}

/**
 * Inspects the current Firebase user's active ID Token and returns structured diagnostic info
 */
export async function getCurrentTokenInfo(forceRefresh = false): Promise<JWTTokenInfo | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return null;
  }

  try {
    const rawToken = await currentUser.getIdToken(forceRefresh);
    const decoded = decodeClientJWT(rawToken);
    if (!decoded) return null;

    const { header, claims } = decoded;
    const now = Math.floor(Date.now() / 1000);
    const issuedAt = new Date(claims.iat * 1000);
    const expiresAt = new Date(claims.exp * 1000);
    const timeRemainingSeconds = Math.max(0, claims.exp - now);
    const lifetimeMinutes = Math.round((claims.exp - claims.iat) / 60);

    return {
      rawToken,
      header,
      claims,
      issuedAt,
      expiresAt,
      timeRemainingSeconds,
      isExpired: now >= claims.exp,
      isShortLived: lifetimeMinutes <= 65, // Standard 60 min (1 hour)
      lifetimeMinutes,
      algorithm: header.alg || 'RS256',
      keyId: header.kid || 'auto-rotated',
      issuer: claims.iss || '',
      audience: claims.aud || '',
      provider: claims.firebase?.sign_in_provider || 'password'
    };
  } catch (err) {
    console.error('Error retrieving ID token info:', err);
    return null;
  }
}

/**
 * Triggers a silent token refresh using Firebase's underlying refresh token mechanism
 */
export async function forceSilentTokenRefresh(): Promise<JWTTokenInfo | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Nenhum usuário autenticado para renovar o token.');
  }

  console.log('[JWT-CLIENT] Executing silent token refresh via Refresh Token (forceRefresh: true)...');
  const tokenInfo = await getCurrentTokenInfo(true);
  console.log('[JWT-CLIENT] Silent token refresh completed. New expiration:', tokenInfo?.expiresAt);
  return tokenInfo;
}

/**
 * Sends the token to the backend server to test full cryptographic RS256 verification and key rotation
 */
export async function verifyTokenWithBackend(token?: string) {
  let targetToken = token;
  if (!targetToken && auth.currentUser) {
    targetToken = await auth.currentUser.getIdToken();
  }

  if (!targetToken) {
    throw new Error('Nenhum token fornecido ou disponível para verificação.');
  }

  const response = await fetch('/api/auth/verify-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${targetToken}`
    },
    body: JSON.stringify({ token: targetToken })
  });

  const data = await response.json();
  return data;
}

/**
 * Fetches real-time server scalability and key rotation metrics
 */
export async function fetchScalabilityMetrics(): Promise<ScalabilityMetrics> {
  const res = await fetch('/api/scalability/metrics');
  if (!res.ok) {
    throw new Error(`Failed to fetch scalability metrics: HTTP ${res.status}`);
  }
  return await res.json();
}

/**
 * Simulates concurrent load to test server response latency, caching, and compression
 */
export async function simulateConcurrencyBenchmark(requestCount: number = 20) {
  const startTime = performance.now();
  const queries = ['kimono venum', 'faixa preta', 'rash guard', 'protetor bucal', 'kimono atama'];

  const promises = Array.from({ length: requestCount }).map(async (_, idx) => {
    const query = queries[idx % queries.length];
    const reqStart = performance.now();
    try {
      const res = await fetch('/api/compare-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      const reqDuration = performance.now() - reqStart;
      return { success: res.ok, durationMs: reqDuration, offersCount: data.offers?.length || 0 };
    } catch (e: any) {
      return { success: false, durationMs: performance.now() - reqStart, error: e.message };
    }
  });

  const results = await Promise.all(promises);
  const totalDuration = performance.now() - startTime;
  const successful = results.filter(r => r.success);
  const avgLatency = successful.length > 0
    ? successful.reduce((acc, r) => acc + r.durationMs, 0) / successful.length
    : 0;

  return {
    totalRequests: requestCount,
    successfulRequests: successful.length,
    totalWallClockTimeMs: totalDuration.toFixed(1),
    avgLatencyPerRequestMs: avgLatency.toFixed(1),
    requestsPerSecond: ((requestCount / (totalDuration / 1000))).toFixed(1),
    results
  };
}

import { Context, Next } from 'hono';

export interface AuthContextVariables {
  clientId: string;
  role: 'conductor' | 'broker' | 'artist' | 'system';
  isServiceToken: boolean;
}

export async function verifyJwtSignature(
  token: string,
  publicKeyPem?: string
): Promise<{ valid: boolean; payload?: any; reason?: string }> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, reason: 'INVALID_JWT_SEGMENTS' };
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));

    // Assert RS256 algorithm
    if (header.alg !== 'RS256') {
      return { valid: false, reason: 'UNSUPPORTED_ALGORITHM_MUST_BE_RS256' };
    }

    // Assert expiration timestamp
    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowSec) {
      return { valid: false, reason: 'TOKEN_EXPIRED' };
    }

    // In local development or when public key PEM is not configured, accept validly formed tokens
    if (!publicKeyPem) {
      return { valid: true, payload };
    }

    // Clean PEM format
    const pemContents = publicKeyPem
      .replace(/-----BEGIN PUBLIC KEY-----/g, '')
      .replace(/-----END PUBLIC KEY-----/g, '')
      .replace(/\s+/g, '');

    const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      'spki',
      binaryDer.buffer,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const encoder = new TextEncoder();
    const dataToVerify = encoder.encode(`${headerB64}.${payloadB64}`);

    const signatureBin = Uint8Array.from(
      atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')),
      (c) => c.charCodeAt(0)
    );

    const isValid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      signatureBin,
      dataToVerify
    );

    return isValid ? { valid: true, payload } : { valid: false, reason: 'INVALID_SIGNATURE' };
  } catch (err: any) {
    return { valid: false, reason: `PARSE_ERROR: ${err.message}` };
  }
}

export async function authGate(c: Context, next: Next) {
  const startTime = Date.now();

  // Allow bypass for public health and favicon
  if (c.req.path === '/health' || c.req.path === '/favicon.ico') {
    return next();
  }

  // 1. Cloudflare Access Service Token Verification
  const cfClientId = c.req.header('CF-Access-Client-Id');
  const cfClientSecret = c.req.header('CF-Access-Client-Secret');

  const expectedClientId = (c.env as any)?.CF_ACCESS_CLIENT_ID;
  const expectedClientSecret = (c.env as any)?.CF_ACCESS_CLIENT_SECRET;

  if (
    cfClientId &&
    cfClientSecret &&
    expectedClientId &&
    expectedClientSecret &&
    cfClientId === expectedClientId &&
    cfClientSecret === expectedClientSecret
  ) {
    c.set('clientId', cfClientId);
    c.set('role', 'system');
    c.set('isServiceToken', true);
    c.header('X-Edge-Auth-Latency-Ms', (Date.now() - startTime).toString());
    return next();
  }

  // 2. Bearer JWT Evaluation
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      {
        ok: false,
        error: {
          code: 'UNAUTHORIZED_ACCESS',
          message: 'Missing or malformed Authorization header.',
        },
      },
      401
    );
  }

  const token = authHeader.substring(7).trim();
  const publicKeyPem = (c.env as any)?.AUTH_PUBLIC_KEY_PEM;

  const verification = await verifyJwtSignature(token, publicKeyPem);

  if (!verification.valid) {
    return c.json(
      {
        ok: false,
        error: {
          code: 'UNAUTHORIZED_ACCESS',
          message: `Authentication failed: ${verification.reason}`,
        },
      },
      401
    );
  }

  const payload = verification.payload || {};
  c.set('clientId', payload.sub || 'anonymous_conductor');
  c.set('role', payload.role || 'conductor');
  c.set('isServiceToken', false);
  c.header('X-Edge-Auth-Latency-Ms', (Date.now() - startTime).toString());

  return next();
}

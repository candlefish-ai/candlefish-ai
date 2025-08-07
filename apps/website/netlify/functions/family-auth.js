// Netlify Function: family-auth
// Validates access to family documents using a server-side secret
// and issues a signed HttpOnly cookie for Edge validation.

const crypto = require('crypto');

exports.handler = async (event, context) => {
  const allowedOriginsEnv = process.env.CORS_ORIGINS || '';
  const nodeEnv = process.env.NODE_ENV || process.env.CONTEXT || 'development';
  const defaultProd = [
    'https://candlefish.ai',
    'https://www.candlefish.ai',
    'https://dashboard.candlefish.ai',
  ];
  const allowedOrigins = (allowedOriginsEnv
    ? allowedOriginsEnv.split(',').map((o) => o.trim()).filter(Boolean)
    : (nodeEnv === 'production' ? defaultProd : ['*'])
  );
  const origin = event.headers.origin || event.headers.Origin;
  const corsOrigin = allowedOrigins.includes('*')
    ? '*'
    : (allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || 'https://candlefish.ai');

  const headers = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'X-Robots-Tag': 'noindex, noarchive, nosnippet, noimageindex',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { code } = JSON.parse(event.body || '{}');
    const expected = process.env.FAMILY_AUTH_CODE;

    if (!expected) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Auth not configured' }) };
    }

    const ok = typeof code === 'string' && code.length > 0 && timingSafeEqual(code, expected);
    if (!ok) {
      return { statusCode: 401, headers, body: JSON.stringify({ ok: false }) };
    }

    // Create signed token for HttpOnly cookie validation at the Edge
    const signingKey = process.env.FAMILY_AUTH_SIGNING_KEY || expected;
    const maxAgeSeconds = Number(process.env.FAMILY_AUTH_MAX_AGE_SECONDS || 6 * 60 * 60); // default 6h
    const exp = Math.floor(Date.now() / 1000) + maxAgeSeconds;
    const payload = base64urlEncode(JSON.stringify({ exp }));
    const sig = hmacSha256Base64Url(signingKey, payload);
    const cookieValue = `${payload}.${sig}`;

    const cookie = [
      `cf_family_auth=${cookieValue}`,
      `Path=/docs/privileged/family`,
      `HttpOnly`,
      `Secure`,
      `SameSite=Strict`,
      `Max-Age=${maxAgeSeconds}`,
    ].join('; ');

    const respHeaders = { ...headers, 'Set-Cookie': cookie };

    return { statusCode: 200, headers: respHeaders, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request' }) };
  }
};

function timingSafeEqual(a, b) {
  const aBuf = Buffer.from(String(a));
  const bBuf = Buffer.from(String(b));
  if (aBuf.length !== bBuf.length) {
    // Ensure equal-time compare regardless of early length mismatch
    return cryptoConstantTimeCompare(aBuf, bBuf);
  }
  return cryptoConstantTimeCompare(aBuf, bBuf);
}

function cryptoConstantTimeCompare(a, b) {
  let mismatch = a.length ^ b.length;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    mismatch |= a[i] ^ b[i];
  }
  return mismatch === 0;
}

function generateOpaqueToken() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < 32; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

function base64urlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function hmacSha256Base64Url(secret, message) {
  const sig = crypto.createHmac('sha256', String(secret)).update(String(message)).digest('base64');
  return sig.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}



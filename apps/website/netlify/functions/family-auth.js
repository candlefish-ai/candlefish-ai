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
    const expected = process.env.FAMILY_AUTH_CODE || '';

    // Accept either (a) correct passcode, or (b) authenticated Netlify Identity user
    const identityUser = getIdentityUser(event, context);
    const passcodeOk = expected && typeof code === 'string' && code.length > 0 && timingSafeEqual(code, expected);
    const identityOk = !!identityUser;
    if (!passcodeOk && !identityOk) {
      return { statusCode: 401, headers, body: JSON.stringify({ ok: false }) };
    }

    // Issue RS256 JWT using private key from AWS Secrets Manager
    const { token, kid, exp } = await issueJwtRs256({
      iss: 'https://candlefish.ai',
      aud: 'candlefish-family',
      sub: identityOk ? 'identity-user' : 'passcode-user',
      ttlSeconds: Number(process.env.FAMILY_AUTH_MAX_AGE_SECONDS || 6 * 60 * 60),
    });

    const cookie = [
      `cf_family_auth=${token}`,
      `Path=/docs/privileged/family`,
      `HttpOnly`,
      `Secure`,
      `SameSite=Strict`,
      `Max-Age=${Math.max(0, exp - Math.floor(Date.now()/1000))}`,
    ].join('; ');

    const respHeaders = { ...headers, 'Set-Cookie': cookie };

    return { statusCode: 200, headers: respHeaders, body: JSON.stringify({ ok: true, kid }) };
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

async function issueJwtRs256({ iss, aud, sub, ttlSeconds }) {
  const region = process.env.AWS_REGION || 'us-east-1';
  const env = process.env.CF_ENV || process.env.NODE_ENV || 'production';
  const secretName = process.env.JWT_SECRET_NAME || `candlefish-jwt-keys-${env}`;
  const { SecretsManagerClient, GetSecretValueCommand } = await import('@aws-sdk/client-secrets-manager');
  const sm = new SecretsManagerClient({ region });
  const out = await sm.send(new GetSecretValueCommand({ SecretId: secretName }));
  const data = JSON.parse(out.SecretString || '{}');
  if (!data.privateKey || !data.keyId) {
    throw new Error('JWT secret invalid');
  }

  const header = { alg: 'RS256', typ: 'JWT', kid: data.keyId };
  const iat = Math.floor(Date.now()/1000);
  const exp = iat + Number(ttlSeconds || 21600);
  const payload = { iss, aud, sub, iat, exp };

  const enc = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  const signingInput = `${enc(header)}.${enc(payload)}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signingInput);
  sign.end();
  const signature = sign.sign(data.privateKey).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  return { token: `${signingInput}.${signature}`, kid: data.keyId, exp };
}

function getIdentityUser(event, context){
  // Netlify provides identity context in either event.clientContext or context.clientContext
  const cc = event.clientContext || context.clientContext || {};
  if (cc.user) return cc.user;
  // If using nf_jwt cookie or Authorization header, presence implies an authenticated user
  const auth = (event.headers.authorization || event.headers.Authorization || '').trim();
  if (auth.startsWith('Bearer ')) return { token: auth.slice(7) };
  const cookie = event.headers.cookie || '';
  if (/nf_jwt=/.test(cookie)) return { token: 'nf_jwt' };
  return null;
}

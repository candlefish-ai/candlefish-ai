export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname || '';

  if (!path.startsWith('/docs/privileged/family/')) {
    return context.next();
  }

  context.set('X-Robots-Tag', 'noindex, noarchive, nosnippet, noimageindex');

  const cookieHeader = request.headers.get('cookie') || '';
  const cookie = parseCookie(cookieHeader)['cf_family_auth'];
  if (!cookie) {
    return redirectToLogin(url);
  }

  try {
    const [headerB64u, payloadB64u, sigB64u] = String(cookie).split('.');
    if (!headerB64u || !payloadB64u || !sigB64u) return redirectToLogin(url);

    const headerJson = new TextDecoder().decode(base64UrlDecode(headerB64u));
    const header = JSON.parse(headerJson);
    if (header.alg !== 'RS256' || !header.kid) return redirectToLogin(url);

    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64u));
    const payload = JSON.parse(payloadJson);
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || typeof payload.exp !== 'number' || payload.exp < now) {
      return redirectToLogin(url);
    }

    const keyService = Deno.env.get('PUBLIC_KEY_URL') || Deno.env.get('PUBLIC_JWKS_URL') || '';
    if (!keyService) return redirectToLogin(url);
    const resp = await fetch(keyService, { headers: { Accept: 'application/json' } });
    if (!resp.ok) return redirectToLogin(url);
    const data = await resp.json();
    if (!data.publicKeyPem || !data.kid || data.kid !== header.kid) return redirectToLogin(url);

    const verified = await verifyRs256(`${headerB64u}.${payloadB64u}`, sigB64u, data.publicKeyPem);
    if (!verified) return redirectToLogin(url);

    return context.next();
  } catch (_e) {
    return redirectToLogin(url);
  }
};

function parseCookie(header) {
  return header.split(';').reduce((acc, part) => {
    const [k, v] = part.trim().split('=');
    if (k && v !== undefined) acc[k] = decodeURIComponent(v);
    return acc;
  }, {});
}

function redirectToLogin(url) {
  const loginUrl = new URL('/docs/privileged/family/login.html', url.origin);
  return new Response(null, {
    status: 302,
    headers: {
      Location: loginUrl.toString(),
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, noarchive, nosnippet, noimageindex',
    },
  });
}

async function verifyRs256(signingInput, sigB64u, pem) {
  try {
    const key = await importRsaPublicKey(pem);
    const ok = await crypto.subtle.verify(
      { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-256' } },
      key,
      base64UrlDecode(sigB64u),
      new TextEncoder().encode(signingInput)
    );
    return !!ok;
  } catch {
    return false;
  }
}

async function importRsaPublicKey(pem) {
  const b64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\s+/g, '');
  const der = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'spki',
    der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
}

function base64UrlDecode(b64u) {
  const pad = b64u.length % 4 === 2 ? '==' : b64u.length % 4 === 3 ? '=' : '';
  const b64 = b64u.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}



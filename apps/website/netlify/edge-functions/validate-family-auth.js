export default async (request, context) => {
  const url = new URL(request.url);
  const path = url.pathname || '';

  // Only guard the family docs path
  if (!path.startsWith('/docs/privileged/family/')) {
    return context.next();
  }

  // Disallow indexing universally on this path
  context.set('X-Robots-Tag', 'noindex, noarchive, nosnippet, noimageindex');

  const cookieHeader = request.headers.get('cookie') || '';
  const cookie = parseCookie(cookieHeader)['cf_family_auth'];
  if (!cookie) {
    return redirectToLogin(url);
  }

  try {
    const [payloadB64, sig] = String(cookie).split('.');
    if (!payloadB64 || !sig) {
      return redirectToLogin(url);
    }

    const expectedSig = await hmacSha256Base64Url(payloadB64);
    if (expectedSig !== sig) {
      return redirectToLogin(url);
    }

    const payload = JSON.parse(base64urlDecode(payloadB64));
    if (!payload || typeof payload.exp !== 'number') {
      return redirectToLogin(url);
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return redirectToLogin(url);
    }

    // Allow request to proceed
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

async function hmacSha256Base64Url(message) {
  const signingKey = Deno.env.get('FAMILY_AUTH_SIGNING_KEY') || '';
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(signingKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  const base64 = btoa(String.fromCharCode(...new Uint8Array(sigBuf)));
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urlDecode(str) {
  const pad = str.length % 4 === 2 ? '==' : str.length % 4 === 3 ? '=' : '';
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}



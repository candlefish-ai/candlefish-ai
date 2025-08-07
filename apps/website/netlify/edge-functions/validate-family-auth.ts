// Netlify Edge Function: validate-family-auth
// Validates the signed HttpOnly cookie set by the family-auth function.
// Redirects to login on failure, without exposing secret material.

const COOKIE_NAME = "cf_family_auth";

export default async (request: Request, context: any) => {
  const url = new URL(request.url);
  const isFamilyPath = url.pathname.startsWith("/docs/privileged/family/");
  if (!isFamilyPath) {
    return context.next();
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const cookieValue = getCookie(cookieHeader, COOKIE_NAME);
  if (!cookieValue) {
    return redirectToLogin(url);
  }

  const parts = cookieValue.split(".");
  if (parts.length !== 2) {
    return redirectToLogin(url);
  }

  const [payloadB64u, sigB64u] = parts;
  try {
    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64u));
    const payload = JSON.parse(payloadJson);
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || typeof payload.exp !== "number" || payload.exp < now) {
      return redirectToLogin(url);
    }

    const signingKey = Deno.env.get("FAMILY_AUTH_SIGNING_KEY") || "";
    if (!signingKey) {
      // Fail closed in production if no key configured
      const nodeEnv = Deno.env.get("NODE_ENV") || Deno.env.get("CONTEXT") || "development";
      if (nodeEnv === "production") {
        return redirectToLogin(url);
      }
      return context.next();
    }

    const computedSig = await hmacSha256Base64Url(signingKey, payloadB64u);
    if (timingSafeEqual(computedSig, sigB64u)) {
      return context.next();
    }
  } catch (_e) {
    // fallthrough to redirect
  }

  return redirectToLogin(url);
};

function getCookie(cookieHeader: string, name: string): string | null {
  const cookies = cookieHeader.split(/;\s*/);
  for (const c of cookies) {
    const [k, v] = c.split("=");
    if (k === name) return v || null;
  }
  return null;
}

function redirectToLogin(url: URL): Response {
  const loginUrl = new URL("/docs/privileged/family/login.html", url.origin);
  const headers = new Headers();
  headers.set("Location", loginUrl.toString());
  headers.set("Cache-Control", "no-store");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  return new Response(null, { status: 302, headers });
}

function base64UrlDecode(b64u: string): Uint8Array {
  const pad = b64u.length % 4 === 2 ? "==" : b64u.length % 4 === 3 ? "=" : "";
  const b64 = b64u.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacSha256Base64Url(secret: string, messageB64u: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(messageB64u));
  const b64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return b64.replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}



import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware, apiRateLimiter, authRateLimiter } from '@/lib/middleware/rate-limit';
import { authMiddleware } from '@/lib/middleware/auth';
import { logger, getRequestContext } from '@/lib/logging/simple-logger';

export async function middleware(request: NextRequest) {
  const requestContext = getRequestContext(request);
  const { pathname } = request.nextUrl;

  try {
    // Create response object
    let response = NextResponse.next();

    // Apply security headers to all responses
    response = applySecurityHeaders(response);

    // Skip middleware for static assets and Next.js internals
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/static') ||
      pathname.includes('.') // Has file extension
    ) {
      return response;
    }

    logger.middleware('main', 'Processing request', requestContext);

    // Apply rate limiting
    if (pathname.startsWith('/api/')) {
      // Different rate limits for different endpoints
      if (pathname.startsWith('/api/auth/')) {
        const rateLimitResponse = await authRateLimiter(request);
        if (rateLimitResponse) return rateLimitResponse;
      } else {
        const rateLimitResponse = await apiRateLimiter(request);
        if (rateLimitResponse) return rateLimitResponse;
      }
    }

    // Apply authentication for protected routes
    if (pathname.startsWith('/api/') && !isPublicApiRoute(pathname)) {
      const authResult = await authMiddleware(request);
      if ('status' in authResult) {
        return authResult; // Return error response
      }
      
      // Add user context to request headers for downstream use
      if ('user' in authResult) {
        response.headers.set('X-User-Id', authResult.user.sub);
        response.headers.set('X-User-Role', authResult.user.role);
      }
    }

    // Apply route-specific security measures
    if (pathname.startsWith('/admin')) {
      // Admin routes require admin role
      const authResult = await authMiddleware(request, { allowedRoles: ['admin'] });
      if ('status' in authResult) {
        return authResult;
      }
    }

    return response;
  } catch (error) {
    logger.error('Middleware error', {
      ...requestContext,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.vercel-insights.com https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.companycam.com https://*.salesforce.com https://paintbox-api.railway.app wss://paintbox-api.railway.app https://vitals.vercel-insights.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspDirectives);

  // Other security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Permissions Policy
  const permissionsPolicy = [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()',
  ].join(', ');
  
  response.headers.set('Permissions-Policy', permissionsPolicy);

  // Strict Transport Security (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Remove potentially dangerous headers
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');

  return response;
}

function isPublicApiRoute(pathname: string): boolean {
  const publicRoutes = [
    '/api/health',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/webhooks/', // Webhook endpoints (validated differently)
  ];

  return publicRoutes.some(route => pathname.startsWith(route));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
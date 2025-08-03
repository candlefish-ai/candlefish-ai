import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { NextResponse } from 'next/server';

// Rate limiting: Simple in-memory store (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

// Create Anthropic instance with explicit API key
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Simple rate limiter
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);
  
  if (!userLimit || userLimit.resetTime < now) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { industry } = body;

    if (!industry || typeof industry !== 'string') {
      return NextResponse.json(
        { error: 'Industry field is required' },
        { status: 400 }
      );
    }

    if (industry.length > 50) {
      return NextResponse.json(
        { error: 'Industry field must be 50 characters or less' },
        { status: 400 }
      );
    }

    // Retry logic with exponential backoff
    let retries = 3;
    let lastError: Error | null = null;
    
    while (retries > 0) {
      try {
        const { text } = await generateText({
          model: anthropic('claude-opus-4-20250514'),
          system:
            "You are an SEO expert for Candlefish AI. Generate compelling, SEO-optimized meta tags. Always return valid JSON with exactly two keys: 'title' (max 60 chars) and 'description' (max 160 chars).",
          prompt: `Generate meta tags for Candlefish AI targeting the ${industry} industry.`,
          temperature: 0.7,
          maxTokens: 256,
        });
        
        const result = JSON.parse(text);
        if (!result.title || !result.description) {
          throw new Error('Invalid response format');
        }
        
        return NextResponse.json(result, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'X-RateLimit-Remaining': String(RATE_LIMIT_MAX - (rateLimitMap.get(ip)?.count || 0)),
          },
        });
      } catch (error) {
        lastError = error as Error;
        retries--;
        
        if (retries > 0) {
          // Exponential backoff: 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, 3 - retries) * 1000));
        }
      }
    }

    // If all retries failed
    throw lastError || new Error('Failed to generate meta tags');
  } catch (err: any) {
    console.error('Generate meta error:', err);
    
    // Provide user-friendly error messages
    let errorMessage = 'An error occurred while generating meta tags';
    let statusCode = 500;
    
    if (err.message?.includes('rate limit')) {
      errorMessage = 'AI service rate limit reached. Please try again later.';
      statusCode = 429;
    } else if (err.message?.includes('Invalid response format')) {
      errorMessage = 'Failed to generate proper meta tags. Please try again.';
    } else if (err.message?.includes('API key')) {
      errorMessage = 'Service configuration error. Please contact support.';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { 
        status: statusCode,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
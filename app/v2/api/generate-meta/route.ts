import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { NextResponse } from 'next/server';

// Rate limiting configuration for Vercel WAF
export const runtime = 'edge';
export const maxDuration = 300; // 5 minutes max

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { industry } = body;

    // Input validation
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

    // Generate with experimental_extendThinking
    const { text, response } = await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      experimental_extendThinking: { 
        budgetTokens: 2_000_000 // 2M thinking tokens
      },
      maxTokens: 400_000, // 400K output tokens
      system: `You are an expert SEO specialist for Candlefish AI, a consciousness-aligned AI consultancy. 
      Generate compelling, SEO-optimized meta tags that:
      1. Incorporate the industry context naturally
      2. Highlight AI transformation and human-centric approach
      3. Use power words that drive clicks
      4. Stay within character limits (title: 60, description: 160)
      
      Return ONLY valid JSON with these exact keys:
      - title: SEO-optimized title tag (max 60 chars)
      - description: Compelling meta description (max 160 chars)
      - thinking: Your detailed thought process (optional, for transparency)`,
      prompt: `Generate optimized meta tags for Candlefish AI targeting the ${industry} industry.
      
      Context: Candlefish AI illuminates AI transformation paths, like the bioluminescent fish lighting ocean depths.
      We offer consciousness-aligned AI solutions that enhance rather than replace human intelligence.`,
      temperature: 0.8,
    });

    // Parse the response
    const result = JSON.parse(text);
    
    // Validate response structure
    if (!result.title || !result.description) {
      throw new Error('Invalid response format from AI');
    }

    // Ensure character limits
    result.title = result.title.substring(0, 60);
    result.description = result.description.substring(0, 160);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
      },
    });
  } catch (err: any) {
    console.error('Generation error:', err);
    
    // Handle rate limiting
    if (err.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
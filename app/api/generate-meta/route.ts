import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { NextResponse } from 'next/server';

// Create Anthropic instance with explicit API key
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: Request) {
  try {
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

    const { text } = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
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
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
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
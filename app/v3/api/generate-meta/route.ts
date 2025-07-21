import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const maxDuration = 300; // 5 min max

export async function POST(req: Request) {
  try {
    const { industry } = await req.json();
    
    if (!industry || typeof industry !== 'string') {
      return NextResponse.json(
        { error: 'Industry field is required' },
        { status: 400 }
      );
    }
    
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      experimental_extendThinking: { budgetTokens: 2_000_000 },
      maxTokens: 400_000,
      system: 'Return JSON {title, description, thinking}',
      prompt: `Generate SEO tags for Candlefish AI in ${industry}`,
      temperature: 0.8,
    });
    
    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    if (error instanceof Error && 'status' in error && error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: { 'Retry-After': '60' }
        }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
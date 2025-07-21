import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const maxDuration = 300;

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
      maxTokens: 400_000,
      system: 'Generate SEO-optimized meta tags for Candlefish AI. Return JSON with title (max 60 chars), description (max 160 chars), and keywords array.',
      prompt: `Industry: ${industry}. Create compelling meta tags that highlight AI transformation, consciousness-aligned approach, and 2M thinking tokens capability.`,
      temperature: 0.7,
    });
    
    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate meta tags' },
      { status: 500 }
    );
  }
}
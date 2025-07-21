import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }
    
    const result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      experimental_extendThinking: { budgetTokens: 2_000_000 },
      maxTokens: 400_000,
      messages,
      system: 'You are Candlefish AI assistant, illuminating AI transformation paths.',
      temperature: 0.7,
    });
    
    return result.toDataStreamResponse();
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
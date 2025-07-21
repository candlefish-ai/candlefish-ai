# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
AI-powered meta tag generator using Next.js 14 (App Router) and Claude Sonnet 4 with extended thinking capabilities.

## Key Commands
```bash
# Development
npm run dev        # Start development server on localhost:3000

# Production  
npm run build      # Build for production
npm run start      # Start production server

# Setup
npm install        # Install dependencies
cp .env.local.example .env.local  # Configure environment (add ANTHROPIC_API_KEY)
```

## Architecture

### Directory Structure
- `/app` - Next.js App Router pages and API routes
- `/app/v2` - Version 2 with advanced Claude Sonnet 4 integration (extended thinking)
- `/app/api` - API routes for AI generation
- `/components` - React components (primarily in v2 subdirectory)
- `/styles` - CSS files with modern gradient animations

### API Endpoints
- `POST /api/generate-meta` - Original meta generation endpoint
- `POST /app/v2/api/generate-meta` - V2 endpoint with extended thinking (2M token budget)

Both endpoints expect:
```json
{
  "business_name": "string",
  "business_description": "string",
  "industry": "string"
}
```

### Key Technologies
- **Next.js 14**: App Router with Edge Runtime optimization
- **TypeScript**: Strict mode enabled
- **Vercel AI SDK v4.2.0**: With experimental extended thinking
- **@ai-sdk/anthropic**: Claude Sonnet 4 integration
- **React 18**: Modern UI components

### Important Implementation Details

1. **Rate Limiting**: Configured in `/middleware.ts`
   - Global: 4,000 requests per minute
   - Per IP: 100 requests per minute
   - In-memory storage (development only)

2. **AI Configuration**: 
   - Model: `claude-opus-4-20250514` (Claude Sonnet 4)
   - Extended thinking with 2M token budget (v2)
   - 300-second max duration for generation functions

3. **Deployment**:
   - Optimized for Vercel deployment
   - Security headers in `vercel.json`
   - Edge runtime for performance

### Development Patterns
- Clear separation between v1 and v2 implementations
- Modular component architecture in v2
- Industry-based content generation with structured JSON responses
- Clean API route handlers with proper error handling

### Environment Requirements
- `ANTHROPIC_API_KEY` must be set in `.env.local`
- Node.js 18+ recommended for development
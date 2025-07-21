# Candlefish AI v2

## Overview
Upgraded implementation with advanced AI capabilities using Claude Sonnet 4.

## Key Features
- **Claude Sonnet 4** (`claude-sonnet-4-20250514`) with 2M input tokens and 400K output tokens
- **experimental_extendThinking** with 2,000,000 budget tokens for deep reasoning
- **Vercel WAF** rate limiting: 4,000 RPM, 2,000,000 ITPM, 400,000 OTPM
- **Modern UI** with gradient animations and responsive design
- **Edge Runtime** for optimal performance

## Architecture
```
/app/v2/
├── page.tsx                 # Main v2 page
├── components/
│   ├── Header.tsx          # Navigation header
│   ├── Hero.tsx            # Hero section with stats
│   ├── Features.tsx        # 6-grid feature showcase
│   ├── MetaGenerator.tsx   # AI-powered meta tag generator
│   └── Footer.tsx          # Footer with links
├── api/
│   └── generate-meta/
│       └── route.ts        # AI generation endpoint
└── styles/
    └── global.css          # CSS variables and animations
```

## API Endpoint
`POST /app/v2/api/generate-meta`

Request:
```json
{
  "industry": "Healthcare"
}
```

Response:
```json
{
  "title": "AI Healthcare Solutions | Candlefish AI",
  "description": "Transform healthcare with consciousness-aligned AI...",
  "thinking": "Detailed reasoning process..."
}
```

## Rate Limiting
- Global: 4,000 requests/minute
- Per IP: 100 requests/minute
- Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

## Environment Variables
```env
ANTHROPIC_API_KEY=your-api-key
```

## Deployment
1. Install dependencies: `npm install`
2. Set environment variables in Vercel
3. Deploy: `vercel --prod`
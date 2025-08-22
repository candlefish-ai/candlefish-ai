# Paintbox - Paint Estimation Platform

## 🎨 Overview

Paintbox is a professional paint estimation and project management platform for contractors.

## 🚀 Quick Start

### GitHub Codespaces

1. Open in Codespaces - everything auto-configures
2. Load environment variables:
   ```bash
   bash ../../scripts/secrets-bootstrap.sh paintbox dev
   ```
3. Start development:
   ```bash
   pnpm dev
   ```

### Local Development

```bash
# From monorepo root
pnpm install
pnpm --filter paintbox dev

# Open http://localhost:3000
```

## 🔐 Environment Variables

Environment variables are automatically loaded from AWS Secrets Manager:

```bash
# Development
bash ../../scripts/secrets-bootstrap.sh paintbox dev

# Production (requires permissions)
bash ../../scripts/secrets-bootstrap.sh paintbox prod
```

## 📦 Deployment

### Preview Deployments

- **Automatic**: Every PR gets a preview URL
- **Platform**: Netlify
- **URL Format**: `https://deploy-preview-{PR-NUMBER}--paintbox.netlify.app`

### Production Deployment

- **Trigger**: Merge to `main` branch
- **URL**: `https://paintbox.candlefish.ai`
- **Platform**: Netlify with CDN

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Type checking
pnpm typecheck
```

## 📁 Project Structure

```
paintbox/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utilities and helpers
├── public/          # Static assets
├── styles/          # CSS/SCSS files
├── netlify.toml     # Netlify configuration
└── package.json     # Dependencies
```

## 🔗 Related Services

- **API**: `https://api.paintbox.candlefish.ai`
- **GraphQL**: `https://graphql.candlefish.ai`
- **Docs**: `https://docs.candlefish.ai/paintbox`

## 👥 Team

- **Owner**: Tyler Robinson (@tyler-robinson)
- **Review**: Patrick Smith (@aspenas)

## 📝 Notes

- Uses Next.js 14 with App Router
- Styled with Tailwind CSS
- State management with Zustand
- API client uses tRPC

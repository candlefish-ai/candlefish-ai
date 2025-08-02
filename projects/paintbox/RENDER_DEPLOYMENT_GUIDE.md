# 🎨 Paintbox Render.com Deployment Guide

This guide provides comprehensive instructions for deploying the Paintbox application to Render.com with full AWS Secrets Manager integration, automated health checks, and monitoring capabilities.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Deployment Scripts](#deployment-scripts)
- [Configuration](#configuration)
- [Monitoring & Health Checks](#monitoring--health-checks)
- [Troubleshooting](#troubleshooting)
- [Advanced Features](#advanced-features)

## 🚀 Prerequisites

Before deploying, ensure you have:

1. **AWS Account** with Secrets Manager access
2. **Render.com Account** (free tier works for testing)
3. **GitHub Repository** connected to Render
4. **Node.js 18+** installed locally
5. **AWS CLI** configured
6. **Render CLI** installed

### Required Environment Variables in AWS Secrets Manager

Store these secrets in AWS Secrets Manager under the key `paintbox/secrets`:

```json
{
  "anthropic": {
    "apiKey": "sk-ant-xxxxx"
  },
  "companyCam": {
    "apiToken": "cc_xxxxx",
    "companyId": "12345"
  },
  "salesforce": {
    "clientId": "3MVG9xxxxx",
    "clientSecret": "xxxxx",
    "username": "user@company.com",
    "password": "password123",
    "securityToken": "token123"
  },
  "sentry": {
    "dsn": "https://xxxxx@sentry.io/xxxxx"
  }
}
```

## ⚡ Quick Start

### 1. Install Dependencies

```bash
# Install project dependencies
npm install

# Install global tools
npm install -g @render-com/render-cli
brew install awscli  # or your preferred installation method
```

### 2. Authenticate

```bash
# Authenticate with AWS (choose one method)
aws configure
# OR use Infisical
infisical login

# Authenticate with Render
render auth login
```

### 3. Deploy

```bash
# Run the comprehensive deployment script
./scripts/deploy-render-comprehensive.sh

# OR run individual steps
node scripts/fetch-render-secrets.js
node scripts/validate-render-config.js
./scripts/deploy-render-comprehensive.sh
```

## 📜 Deployment Scripts

### Main Deployment Script

**`scripts/deploy-render-comprehensive.sh`** - Complete deployment pipeline

```bash
# Standard deployment
./scripts/deploy-render-comprehensive.sh

# With custom service name
./scripts/deploy-render-comprehensive.sh --service my-paintbox

# Dry run (preview only)
./scripts/deploy-render-comprehensive.sh --dry-run

# Skip build step
./scripts/deploy-render-comprehensive.sh --skip-build
```

**Features:**

- ✅ Installs all required dependencies
- ✅ Fetches secrets from AWS Secrets Manager
- ✅ Validates configuration and environment
- ✅ Builds application and tests
- ✅ Deploys to Render with zero downtime
- ✅ Performs post-deployment health checks
- ✅ Provides detailed error reporting

### Secrets Management

**`scripts/fetch-render-secrets.js`** - AWS Secrets Manager integration

```bash
# Fetch secrets and generate .env.render
node scripts/fetch-render-secrets.js

# Output format options
node scripts/fetch-render-secrets.js --output-format env
node scripts/fetch-render-secrets.js --output-format render
node scripts/fetch-render-secrets.js --output-format both

# Custom secret name
node scripts/fetch-render-secrets.js --secret-name paintbox/prod-secrets

# Validation only
node scripts/fetch-render-secrets.js --validate-only
```

### Configuration Validation

**`scripts/validate-render-config.js`** - Pre-deployment validation

```bash
# Basic validation
node scripts/validate-render-config.js

# With connectivity tests
node scripts/validate-render-config.js --check-connectivity

# With build validation
node scripts/validate-render-config.js --validate-build

# Verbose output
node scripts/validate-render-config.js --verbose
```

**Validation Checks:**

- ✅ Required files and dependencies
- ✅ Environment variables
- ✅ Render.yaml configuration
- ✅ External service connectivity
- ✅ Build process validation

### Health Monitoring

**`scripts/health-check-render.js`** - Post-deployment health validation

```bash
# Basic health check
node scripts/health-check-render.js

# Comprehensive tests
node scripts/health-check-render.js --comprehensive

# Custom service URL
node scripts/health-check-render.js --url https://my-app.onrender.com

# Continuous monitoring
node scripts/monitor-render-deployment.js --monitor
```

**Health Check Categories:**

- 🔗 **Endpoints** - API and page availability
- ⚡ **Performance** - Response times and load performance
- 🔌 **Integrations** - External service connectivity
- 🔒 **Security** - HTTPS and security headers

## ⚙️ Configuration

### Render.yaml Configuration

The `render.yaml` file defines your Render services:

```yaml
services:
  # Main web application
  - type: web
    name: paintbox-app
    runtime: node
    plan: standard
    buildCommand: |
      npm ci --production=false
      npm run build
    startCommand: npm run start
    healthCheckPath: /api/health

  # Redis for caching
  - type: redis
    name: paintbox-redis
    plan: starter

databases:
  # PostgreSQL for persistent data
  - name: paintbox-db
    plan: starter
```

### Environment Variables

Environment variables are automatically configured from AWS Secrets Manager:

| Variable               | Source          | Description                  |
| ---------------------- | --------------- | ---------------------------- |
| `NODE_ENV`             | Fixed           | Production environment       |
| `ANTHROPIC_API_KEY`    | AWS Secrets     | Anthropic API key            |
| `COMPANYCAM_API_KEY`   | AWS Secrets     | CompanyCam API token         |
| `SALESFORCE_CLIENT_ID` | AWS Secrets     | Salesforce OAuth client ID   |
| `REDIS_URL`            | Render Service  | Redis connection string      |
| `DATABASE_URL`         | Render Database | PostgreSQL connection string |

### Service Plans

| Service    | Plan     | Resources      | Cost          |
| ---------- | -------- | -------------- | ------------- |
| Web App    | Standard | 1GB RAM, 1 CPU | $25/month     |
| Redis      | Starter  | 256MB          | $7/month      |
| PostgreSQL | Starter  | 1GB            | $7/month      |
| **Total**  |          |                | **$39/month** |

## 📊 Monitoring & Health Checks

### Deployment Monitoring

**`scripts/monitor-render-deployment.js`** - Real-time deployment monitoring

```bash
# Start continuous monitoring
node scripts/monitor-render-deployment.js --monitor

# One-time status check
node scripts/monitor-render-deployment.js

# Rollback to previous version
node scripts/monitor-render-deployment.js --rollback
```

**Monitoring Features:**

- 🔍 Real-time deployment tracking
- ❤️ Automated health checks every 30 seconds
- 📊 Performance metrics collection
- 🚨 Automatic alerting on failures
- ↩️ Automated rollback capabilities
- 📝 Comprehensive logging

### Health Check Endpoints

The application exposes several health check endpoints:

| Endpoint                    | Purpose                 | Expected Response                      |
| --------------------------- | ----------------------- | -------------------------------------- |
| `/api/health`               | Basic health check      | `{"status": "ok", "timestamp": "..."}` |
| `/api/v1/calculate`         | Calculation engine test | 200 or 400 (for missing body)          |
| `/api/v1/companycam/test`   | CompanyCam integration  | 200, 401, or 403                       |
| `/api/v1/salesforce/search` | Salesforce integration  | 200, 400, or 401                       |

### Performance Thresholds

| Metric               | Threshold | Action                 |
| -------------------- | --------- | ---------------------- |
| Response Time        | 2 seconds | Warning alert          |
| First Byte Time      | 1 second  | Performance alert      |
| Error Rate           | 10%       | Critical alert         |
| Consecutive Failures | 3         | Rollback consideration |

## 🔧 Troubleshooting

### Common Issues

#### 1. Build Failures

```bash
# Check build logs
render deploys get <deployment-id> --logs

# Local build test
npm run build

# Validate configuration
node scripts/validate-render-config.js --validate-build
```

#### 2. Environment Variable Issues

```bash
# Validate secrets
node scripts/fetch-render-secrets.js --validate-only

# Check AWS credentials
aws sts get-caller-identity

# Manual secrets fetch
node scripts/fetch-render-secrets.js --verbose
```

#### 3. Service Connectivity Issues

```bash
# Test external services
node scripts/validate-render-config.js --check-connectivity

# Health check with details
node scripts/health-check-render.js --comprehensive --verbose
```

#### 4. Deployment Timeout

```bash
# Monitor deployment progress
node scripts/monitor-render-deployment.js --watch

# Check service status
render services get paintbox-app
```

### Debug Commands

```bash
# View service logs
render logs --service paintbox-app --tail

# Check service metrics
render metrics --service paintbox-app

# List all deployments
render deploys list --service paintbox-app

# Get deployment details
render deploys get <deployment-id>
```

### Emergency Rollback

```bash
# Immediate rollback
node scripts/monitor-render-deployment.js --rollback

# Manual rollback to specific commit
render deploy --service paintbox-app --commit <commit-hash>
```

## 🚀 Advanced Features

### Automated CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
name: Deploy to Render
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Deploy to Render
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
        run: |
          cd projects/paintbox
          ./scripts/deploy-render-comprehensive.sh
```

### Blue-Green Deployments

```bash
# Deploy to staging service first
./scripts/deploy-render-comprehensive.sh --service paintbox-staging

# Validate staging deployment
node scripts/health-check-render.js --service paintbox-staging --comprehensive

# Promote to production
./scripts/deploy-render-comprehensive.sh --service paintbox-app
```

### Multi-Environment Setup

```bash
# Development environment
node scripts/fetch-render-secrets.js --secret-name paintbox/dev-secrets
./scripts/deploy-render-comprehensive.sh --service paintbox-dev

# Staging environment
node scripts/fetch-render-secrets.js --secret-name paintbox/staging-secrets
./scripts/deploy-render-comprehensive.sh --service paintbox-staging

# Production environment
node scripts/fetch-render-secrets.js --secret-name paintbox/prod-secrets
./scripts/deploy-render-comprehensive.sh --service paintbox-app
```

### Custom Alerting Integration

Add webhook notifications to the monitoring script:

```javascript
// In monitor-render-deployment.js
async sendSlackAlert(message) {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (webhook) {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message })
    });
  }
}
```

## 📚 Additional Resources

### Documentation Files

- `render.yaml` - Service configuration
- `COMPREHENSIVE_IMPLEMENTATION_PLAN.md` - Technical architecture
- `IMPLEMENTATION_STATUS.md` - Current project status
- `PRODUCTION_DEPLOYMENT_CHECKLIST.md` - Pre-deployment checklist

### Render.com Resources

- [Render Documentation](https://render.com/docs)
- [Render CLI Reference](https://render.com/docs/cli)
- [Service Configuration Guide](https://render.com/docs/yaml-spec)

### AWS Resources

- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
- [AWS CLI Configuration](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review deployment logs: `render logs --service paintbox-app`
3. Run validation scripts with `--verbose` flag
4. Check AWS Secrets Manager permissions
5. Verify Render service configuration

For additional support, check the project's issue tracker or contact the development team.

---

**✨ Happy Deploying!** 🎨

This deployment system provides enterprise-grade reliability with automated monitoring, health checks, and rollback capabilities. The Paintbox application will be running smoothly on Render.com with minimal manual intervention required.

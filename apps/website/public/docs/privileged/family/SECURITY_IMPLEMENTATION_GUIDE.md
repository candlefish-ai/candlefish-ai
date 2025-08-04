# Candlefish AI Family Letter - Secure Implementation Guide

## Overview
This guide provides step-by-step instructions for implementing a secure version of the family letter system that addresses all identified vulnerabilities.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│  Web Browser    │────▶│  Express Server  │────▶│ Protected Docs  │
│  (Frontend)     │◀────│  (Backend API)   │◀────│ (Outside Public)│
│                 │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │                         
        │                        │                         
        ▼                        ▼                         
   Local Storage            JWT Tokens                     
   (Auth Token)          Rate Limiting                     
                         HTTPS/TLS                         
```

## Implementation Steps

### Step 1: Project Setup

```bash
# Create secure project structure
mkdir -p candlefish-secure/server
mkdir -p candlefish-secure/protected-documents
mkdir -p candlefish-secure/public

# Initialize Node.js project
cd candlefish-secure/server
npm init -y

# Install required dependencies
npm install express bcrypt jsonwebtoken express-rate-limit helmet dotenv
npm install --save-dev nodemon

# Create environment file
touch .env
```

### Step 2: Environment Configuration

Create `.env` file:
```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Security Keys (generate strong random values)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
SESSION_SECRET=your-session-secret-minimum-32-characters

# Password Hash (generate using bcrypt)
FAMILY_LETTER_PASSWORD_HASH=$2b$12$your-bcrypt-hash-here

# CORS Configuration
ALLOWED_ORIGINS=https://candlefish.ai,https://www.candlefish.ai

# Rate Limiting
MAX_LOGIN_ATTEMPTS=5
LOGIN_WINDOW_MINUTES=15
```

### Step 3: Generate Password Hash

```bash
# Generate bcrypt hash for your chosen password
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('your-secure-password', 12).then(hash => console.log(hash));"
```

### Step 4: Secure Server Implementation

Create `server/app.js`:
```javascript
// See secure-implementation-example.js for full implementation
```

### Step 5: Move Protected Documents

```bash
# Move documents outside public directory
mv public/docs/privileged/family/*.html protected-documents/
```

Update protected documents to remove client-side auth checks:
```html
<!-- Remove all sessionStorage checks from protected documents -->
<!-- Documents are now served only through authenticated API -->
```

### Step 6: Deploy with Proper Infrastructure

#### Option A: Netlify Functions (Serverless)

Create `netlify/functions/auth.js`:
```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  // Parse body
  const { password } = JSON.parse(event.body);
  
  // Verify password
  const valid = await bcrypt.compare(password, process.env.PASSWORD_HASH);
  
  if (!valid) {
    return { 
      statusCode: 401, 
      body: JSON.stringify({ error: 'Invalid credentials' })
    };
  }
  
  // Generate token
  const token = jwt.sign(
    { authorized: true },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
  
  return {
    statusCode: 200,
    body: JSON.stringify({ token })
  };
};
```

#### Option B: Traditional Server (Recommended)

Deploy the Express server on:
- AWS EC2 with Application Load Balancer
- Google Cloud Run
- Heroku
- DigitalOcean App Platform

### Step 7: Security Headers Configuration

Update `netlify.toml` for comprehensive security:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    # Security Headers
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "0"
    Content-Security-Policy = """
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://api.candlefish.ai;
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
      upgrade-insecure-requests;
    """
    Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    
    # Caching
    Cache-Control = "no-cache, no-store, must-revalidate"
    Pragma = "no-cache"
    Expires = "0"

# API specific headers
[[headers]]
  for = "/api/*"
  [headers.values]
    Cache-Control = "no-store"
    Content-Type = "application/json"

# Static assets can be cached
[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Block access to sensitive files
[[redirects]]
  from = "/.env"
  to = "/404"
  status = 404

[[redirects]]
  from = "/.git/*"
  to = "/404"
  status = 404
```

### Step 8: Monitoring and Logging

Implement comprehensive logging:
```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.File({ filename: 'security.log', level: 'warn' })
  ]
});

// Log all authentication attempts
logger.info('Login attempt', { ip: req.ip, timestamp: new Date() });
logger.warn('Failed login', { ip: req.ip, timestamp: new Date() });
logger.error('Security breach attempt', { ip: req.ip, details: error });
```

### Step 9: Security Testing

Create automated security tests:
```javascript
// security.test.js
describe('Security Tests', () => {
  test('Rejects direct document access', async () => {
    const res = await request(app).get('/protected-documents/family-letter.html');
    expect(res.status).toBe(404);
  });
  
  test('Enforces rate limiting', async () => {
    for (let i = 0; i < 6; i++) {
      await request(app).post('/api/auth/login').send({ password: 'wrong' });
    }
    const res = await request(app).post('/api/auth/login').send({ password: 'correct' });
    expect(res.status).toBe(429);
  });
  
  test('Validates JWT tokens', async () => {
    const res = await request(app)
      .get('/api/documents/family-letter')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(403);
  });
});
```

### Step 10: Deployment Checklist

- [ ] All sensitive files moved outside public directory
- [ ] Environment variables configured (never commit .env)
- [ ] HTTPS enforced on all endpoints
- [ ] Security headers properly configured
- [ ] Rate limiting implemented
- [ ] Logging and monitoring active
- [ ] Backup authentication method configured
- [ ] Security testing completed
- [ ] Incident response plan documented

## Security Best Practices

1. **Regular Updates**: Keep all dependencies updated
   ```bash
   npm audit
   npm update
   ```

2. **Secret Rotation**: Rotate JWT secret and passwords quarterly

3. **Access Logs**: Review access logs weekly for suspicious activity

4. **Backup Access**: Implement 2FA or backup authentication method

5. **Encryption**: Use TLS 1.3 minimum for all connections

6. **Input Validation**: Sanitize all user inputs

7. **Error Handling**: Never expose stack traces or internal errors

## Emergency Response

If a security breach is suspected:

1. Immediately revoke all active tokens
2. Change all passwords and secrets
3. Review access logs for unauthorized access
4. Notify affected family members
5. Document the incident for compliance

## Compliance Notes

Given the references to SEC and FINRA regulations in the documents:
- Maintain audit logs for 3 years minimum
- Implement data retention policies
- Consider SOC 2 compliance requirements
- Regular third-party security assessments

## Conclusion

This implementation provides defense in depth with:
- Server-side authentication
- Encrypted token-based sessions
- Rate limiting and brute force protection
- Comprehensive security headers
- Audit logging
- Secure document delivery

The system now meets enterprise security standards and protects sensitive family and business information appropriately.
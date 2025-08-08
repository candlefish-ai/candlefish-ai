// Secure Server-Side Implementation Example for Candlefish AI Protected Documents
// This demonstrates proper authentication and access control

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(express.json());

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for API calls
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Login endpoint with proper security
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { password } = req.body;

    // Validate input
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Compare with hashed password from environment
    const validPassword = await bcrypt.compare(
      password,
      process.env.FAMILY_LETTER_PASSWORD_HASH
    );

    if (!validPassword) {
      // Log failed attempt for security monitoring
      console.log(`Failed login attempt from IP: ${req.ip}`);
      return res.status(401).json({ error: 'Invalid authorization code' });
    }

    // Generate JWT with expiration
    const token = jwt.sign(
      {
        authorized: true,
        ip: req.ip,
        timestamp: Date.now()
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '2h',
        issuer: 'candlefish-ai',
        audience: 'family-letters'
      }
    );

    // Log successful login
    console.log(`Successful login from IP: ${req.ip}`);

    res.json({
      token,
      expiresIn: 7200 // seconds
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication service error' });
  }
});

// Verify token endpoint
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Protected document endpoints
app.get('/api/documents/family-letter', authenticateToken, apiLimiter, (req, res) => {
  // Additional authorization check could go here
  const documentPath = path.join(__dirname, 'protected-documents', 'family-letter.html');

  // Check if file exists
  if (!fs.existsSync(documentPath)) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Set security headers for document
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'Content-Type': 'text/html; charset=utf-8'
  });

  // Log document access
  console.log(`Document accessed by ${req.user.ip} at ${new Date().toISOString()}`);

  res.sendFile(documentPath);
});

app.get('/api/documents/legal-review', authenticateToken, apiLimiter, (req, res) => {
  const documentPath = path.join(__dirname, 'protected-documents', 'legal-review.html');

  if (!fs.existsSync(documentPath)) {
    return res.status(404).json({ error: 'Document not found' });
  }

  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'Content-Type': 'text/html; charset=utf-8'
  });

  console.log(`Legal document accessed by ${req.user.ip} at ${new Date().toISOString()}`);

  res.sendFile(documentPath);
});

// Logout endpoint (optional - for token blacklisting)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  // In production, you might want to blacklist the token
  console.log(`Logout from IP: ${req.user.ip}`);
  res.json({ message: 'Logged out successfully' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Secure document server running on port ${PORT}`);
});

// Helper script to generate password hash
// Run this separately to generate the hash for .env file
if (require.main === module && process.argv[2] === 'hash-password') {
  const password = process.argv[3];
  if (!password) {
    console.error('Usage: node secure-implementation-example.js hash-password <password>');
    process.exit(1);
  }

  bcrypt.hash(password, 12, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      process.exit(1);
    }
    console.log('Password hash for .env file:');
    console.log(`FAMILY_LETTER_PASSWORD_HASH=${hash}`);
  });
}

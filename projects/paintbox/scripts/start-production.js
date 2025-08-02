#!/usr/bin/env node

/**
 * Production start script for Paintbox
 * Starts the Next.js server on the PORT environment variable
 */

const { spawn } = require('child_process');

const port = process.env.PORT || 3000;

console.log(`🎨 Starting Paintbox on port ${port}...`);

// Set PORT for Next.js
process.env.PORT = port;

// Start Next.js in production mode
const nextProcess = spawn('npm', ['run', 'start:next'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: port }
});

nextProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

nextProcess.on('exit', (code) => {
  process.exit(code);
});
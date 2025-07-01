#!/usr/bin/env node

// Simple script runner for creating admin user
// Run with: node run-create-admin.js

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting admin user creation...\n');

// Run the create-admin script
const scriptPath = path.join(__dirname, 'scripts', 'create-admin.js');
const child = spawn('node', [scriptPath], {
  stdio: 'inherit',
  env: { ...process.env }
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Admin user creation completed successfully!');
  } else {
    console.log(`\n❌ Admin user creation failed with exit code ${code}`);
  }
});

child.on('error', (error) => {
  console.error('❌ Failed to start admin creation script:', error);
});
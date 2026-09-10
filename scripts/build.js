const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('--- [SamadhanSetu Cloud Build] Starting frontend build ---');

// 1. Install & build frontend
execSync('npm --prefix frontend install', { stdio: 'inherit' });
execSync('npm --prefix frontend run build', { stdio: 'inherit' });

// 2. Mirror frontend/dist to root dist/ and root public/
const src = path.join(__dirname, '..', 'frontend', 'dist');
const destDist = path.join(__dirname, '..', 'dist');
const destPublic = path.join(__dirname, '..', 'public');

// Mirror to dist/
if (fs.existsSync(destDist)) {
  fs.rmSync(destDist, { recursive: true, force: true });
}
fs.cpSync(src, destDist, { recursive: true });

// Mirror to public/
if (fs.existsSync(destPublic)) {
  fs.rmSync(destPublic, { recursive: true, force: true });
}
fs.cpSync(src, destPublic, { recursive: true });

console.log('--- [SamadhanSetu Cloud Build] Successfully prepared dist/ and public/ ---');

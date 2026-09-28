import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="nutriGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="50%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#0d9488" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Background rounded squircle -->
  <rect width="512" height="512" rx="115" fill="url(#nutriGrad)" />

  <!-- Inner glowing border -->
  <rect x="16" y="16" width="480" height="480" rx="99" fill="none" stroke="#ffffff" stroke-width="4" stroke-opacity="0.2" />

  <!-- Center Nutri Emblem -->
  <g filter="url(#shadow)" transform="translate(106, 106)">
    <!-- Heart / Leaf shape -->
    <path d="M150 260 C150 260 20 180 20 95 C20 40 60 10 110 10 C135 10 145 25 150 35 C155 25 165 10 190 10 C240 10 280 40 280 95 C280 180 150 260 150 260 Z" fill="#ffffff" />
    
    <!-- Organic Leaf / Sprout inside -->
    <path d="M150 45 C150 45 190 85 190 135 C190 170 165 195 150 205 C135 195 110 170 110 135 C110 85 150 45 150 45 Z" fill="#059669" opacity="0.9" />
    <path d="M150 80 L150 185" stroke="#ffffff" stroke-width="5" stroke-linecap="round" />
    <path d="M150 115 C162 105 175 110 175 110" stroke="#ffffff" stroke-width="4" stroke-linecap="round" fill="none" />
    <path d="M150 145 C138 135 125 140 125 140" stroke="#ffffff" stroke-width="4" stroke-linecap="round" fill="none" />
  </g>
</svg>`;

const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="100%" stop-color="#0d9488" />
    </linearGradient>
  </defs>

  <!-- Full bleed background for maskable icon -->
  <rect width="512" height="512" fill="url(#bgGrad)" />

  <!-- Center emblem scaled to 65% safe zone -->
  <g transform="translate(141, 141) scale(0.76)">
    <path d="M150 260 C150 260 20 180 20 95 C20 40 60 10 110 10 C135 10 145 25 150 35 C155 25 165 10 190 10 C240 10 280 40 280 95 C280 180 150 260 150 260 Z" fill="#ffffff" />
    <path d="M150 45 C150 45 190 85 190 135 C190 170 165 195 150 205 C135 195 110 170 110 135 C110 85 150 45 150 45 Z" fill="#059669" opacity="0.9" />
    <path d="M150 80 L150 185" stroke="#ffffff" stroke-width="5" stroke-linecap="round" />
  </g>
</svg>`;

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function run() {
  console.log('Generating PNG PWA icons...');
  
  const standardBuffer = Buffer.from(svgIcon);
  const maskableBuffer = Buffer.from(maskableSvg);

  // 192x192 PNG
  await sharp(standardBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✓ pwa-192x192.png generated');

  // 512x512 PNG
  await sharp(standardBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('✓ pwa-512x512.png generated');

  // 512x512 Maskable PNG
  await sharp(maskableBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable.png'));
  console.log('✓ pwa-maskable.png generated');

  // 180x180 Apple Touch Icon PNG
  await sharp(standardBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png generated');

  // 32x32 Favicon PNG
  await sharp(standardBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('✓ favicon-32x32.png generated');

  // 16x16 Favicon PNG
  await sharp(standardBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));
  console.log('✓ favicon-16x16.png generated');

  console.log('All PWA PNG icons generated successfully!');
}

run().catch(console.error);

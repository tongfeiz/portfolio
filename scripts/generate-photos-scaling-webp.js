/**
 * WebP versions of projects/photos_scaling/*.png (same dimensions, quality 92).
 * Run from repo root: node scripts/generate-photos-scaling-webp.js
 */
const path = require('path');
const fs = require('fs');

const sharp = require('sharp');

const DIR = path.join(__dirname, '..', 'projects', 'photos_scaling');
const QUALITY = 92;

async function main() {
  if (!fs.existsSync(DIR)) {
    console.error('Missing directory:', DIR);
    process.exit(1);
  }
  const files = fs.readdirSync(DIR).filter((f) => f.toLowerCase().endsWith('.png'));
  for (const name of files) {
    const pngPath = path.join(DIR, name);
    const base = name.replace(/\.png$/i, '');
    const webpPath = path.join(DIR, `${base}.webp`);
    await sharp(pngPath)
      .webp({ quality: QUALITY })
      .toFile(webpPath);
    console.log('Created:', webpPath);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

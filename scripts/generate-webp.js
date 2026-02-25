/**
 * Generate WebP versions of work-grid PNGs (same dimensions, quality 92).
 * Run from repo root: node scripts/generate-webp.js
 */
const path = require('path');
const fs = require('fs');

const sharp = require('sharp');

const PHOTOS_DIR = path.join(__dirname, '..', '1_photos');
const GRID_IMAGES = [
  'p1', 'p2', 'p3', 'p4', 'p7', 'p8', 'p9',
  'p12', 'p13', 'p14', 'p15', 'p16', 'p17', 'p18', 'p19', 'p20',
  'p22', 'p23', 'p24', 'p25', 'p26',
  'p30', 'p31', 'p32'
];

async function main() {
  for (const base of GRID_IMAGES) {
    const pngPath = path.join(PHOTOS_DIR, `${base}.png`);
    const webpPath = path.join(PHOTOS_DIR, `${base}.webp`);
    if (!fs.existsSync(pngPath)) {
      console.warn('Skip (missing):', pngPath);
      continue;
    }
    await sharp(pngPath)
      .webp({ quality: 92 })
      .toFile(webpPath);
    console.log('Created:', webpPath);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

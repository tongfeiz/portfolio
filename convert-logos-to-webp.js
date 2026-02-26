#!/usr/bin/env node
/**
 * Converts PNG logos used on the about page to WebP.
 * Includes main logos and xxxa/xxxb/xxxc hover-state variants.
 * Run: node convert-logos-to-webp.js
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const root = __dirname;

const aboutPageLogos = [
  '1_photos/logos/tongfeiphoto.png',
  '1_photos/logos/ss1.png',
  '1_photos/logos/ss2.png',
  '1_photos/logos/lm1.png',
  '1_photos/logos/bookstore1.png',
  '1_photos/logos/bookstore2.png',
  '1_photos/logos/freelance1.png',
  '1_photos/logos/freelance2.png',
  '1_photos/logos/freelance3.png',
  '1_photos/logos/rhkyc1.png',
  '1_photos/logos/lavasticker.png',
  '1_photos/logos/lily.png',
  '1_photos/logos/innod1.png',
  '1_photos/logos/innod2.png',
  '1_photos/logos/innod3.png',
  '1_photos/logos/isa1.png',
  '1_photos/logos/icontools/ps1.png',
  '1_photos/logos/icontools/ae1.png',
  '1_photos/logos/icontools/ai1.png',
  '1_photos/logos/icontools/cursor1.png',
  '1_photos/logos/icontools/figma1.png',
  '1_photos/logos/icontools/id1.png',
  '1_photos/logos/icontools/logic1.png',
  '1_photos/logos/icontools/pr1.png',
  '1_photos/logos/icontools/rhino1.png',
  // Hover/load state variants (a, b, c)
  '1_photos/logos/ss1a.png', '1_photos/logos/ss1b.png', '1_photos/logos/ss1c.png',
  '1_photos/logos/ss2a.png', '1_photos/logos/ss2b.png', '1_photos/logos/ss2c.png',
  '1_photos/logos/lm1a.png', '1_photos/logos/lm1b.png', '1_photos/logos/lm1c.png',
  '1_photos/logos/bookstore1a.png', '1_photos/logos/bookstore1b.png', '1_photos/logos/bookstore1c.png',
  '1_photos/logos/bookstore2a.png', '1_photos/logos/bookstore2b.png', '1_photos/logos/bookstore2c.png',
  '1_photos/logos/freelance1a.png', '1_photos/logos/freelance1b.png', '1_photos/logos/freelance1c.png',
  '1_photos/logos/freelance2a.png', '1_photos/logos/freelance2b.png', '1_photos/logos/freelance2c.png',
  '1_photos/logos/freelance3a.png', '1_photos/logos/freelance3b.png', '1_photos/logos/freelance3c.png',
  '1_photos/logos/rhkyc1a.png', '1_photos/logos/rhkyc1b.png', '1_photos/logos/rhkyc1c.png',
  '1_photos/logos/lavastickera.png', '1_photos/logos/lavastickerb.png', '1_photos/logos/lavastickerc.png',
  '1_photos/logos/lilya.png', '1_photos/logos/lilyb.png', '1_photos/logos/lilyc.png',
  '1_photos/logos/innod1a.png', '1_photos/logos/innod1b.png', '1_photos/logos/innod1c.png',
  '1_photos/logos/innod2a.png', '1_photos/logos/innod2b.png', '1_photos/logos/innod2c.png',
  '1_photos/logos/innod3a.png', '1_photos/logos/innod3b.png', '1_photos/logos/innod3c.png',
  '1_photos/logos/innod0a.png', '1_photos/logos/innod0b.png', '1_photos/logos/innod0c.png',
  '1_photos/logos/isa1a.png', '1_photos/logos/isa1b.png', '1_photos/logos/isa1c.png',
  '1_photos/logos/cho1a.png', '1_photos/logos/cho1b.png', '1_photos/logos/cho1c.png',
];

async function convertAll() {
  for (const rel of aboutPageLogos) {
    const inputPath = path.join(root, rel);
    const outPath = inputPath.replace(/\.png$/i, '.webp');
    if (!fs.existsSync(inputPath)) {
      console.warn('Skip (not found):', rel);
      continue;
    }
    try {
      await sharp(inputPath)
        .webp({ quality: 90 })
        .toFile(outPath);
      console.log('OK:', rel, '->', path.relative(root, outPath));
    } catch (err) {
      console.error('Error converting', rel, err.message);
    }
  }
}

convertAll();

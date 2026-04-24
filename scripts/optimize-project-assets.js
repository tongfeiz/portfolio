/**
 * Optimize all project assets:
 *   - Convert .png/.jpg/.jpeg in projects/photos_* to .webp at quality 90
 *     (skips files already converted unless --force)
 *   - Convert .mov in projects/photos_* to .m4v via macOS avconvert preset
 *     PresetAppleM4V1080pHD, but only keeps the .m4v if it is meaningfully
 *     smaller than the source (>= 10% saving). Otherwise the .m4v is removed.
 *
 * Usage:
 *   node scripts/optimize-project-assets.js            # incremental
 *   node scripts/optimize-project-assets.js --only=photos_eyes,photos_tree
 *   node scripts/optimize-project-assets.js --force    # rewrite outputs
 */
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const PROJECTS = path.join(ROOT, 'projects');
const IMAGE_QUALITY = 90;
const VIDEO_PRESET = 'PresetAppleM4V1080pHD';
const VIDEO_MIN_SAVING = 0.1;
const force = process.argv.includes('--force');
const onlyArg = process.argv.find((arg) => arg.startsWith('--only='));
const onlyFolders = onlyArg ? new Set(onlyArg.split('=')[1].split(',').map((name) => name.trim()).filter(Boolean)) : null;

function statSizeOrZero(file) {
  try {
    return fs.statSync(file).size;
  } catch (_) {
    return 0;
  }
}

async function convertImage(input) {
  const ext = path.extname(input);
  const out = input.replace(new RegExp(`${ext.replace('.', '\\.')}$`, 'i'), '.webp');
  if (!force && fs.existsSync(out) && fs.statSync(out).mtimeMs > fs.statSync(input).mtimeMs) {
    return { skipped: true, out };
  }
  await sharp(input).webp({ quality: IMAGE_QUALITY }).toFile(out);
  return { skipped: false, out };
}

function convertVideo(input) {
  const out = input.replace(/\.mov$/i, '.m4v');
  if (!force && fs.existsSync(out) && fs.statSync(out).mtimeMs > fs.statSync(input).mtimeMs) {
    return { skipped: true, out };
  }
  try {
    execFileSync('avconvert', ['--source', input, '--preset', VIDEO_PRESET, '--output', out, '--replace'], { stdio: 'pipe' });
  } catch (err) {
    return { error: err.message, out };
  }
  const srcSize = statSizeOrZero(input);
  const outSize = statSizeOrZero(out);
  if (srcSize > 0 && outSize > 0 && outSize > srcSize * (1 - VIDEO_MIN_SAVING)) {
    fs.unlinkSync(out);
    return { discarded: true, srcSize, outSize, out };
  }
  return { skipped: false, srcSize, outSize, out };
}

function listFolders() {
  return fs
    .readdirSync(PROJECTS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith('photos_'))
    .filter((d) => !onlyFolders || onlyFolders.has(d.name))
    .map((d) => path.join(PROJECTS, d.name));
}

async function main() {
  const folders = listFolders();
  let imageDone = 0;
  let imageSkipped = 0;
  let videoDone = 0;
  let videoSkipped = 0;
  let videoDiscarded = 0;

  for (const folder of folders) {
    const entries = fs.readdirSync(folder).filter((n) => !n.startsWith('.'));
    const images = entries.filter((n) => /\.(png|jpe?g)$/i.test(n));
    const videos = entries.filter((n) => /\.mov$/i.test(n));

    for (const name of images) {
      const input = path.join(folder, name);
      try {
        const r = await convertImage(input);
        if (r.skipped) {
          imageSkipped++;
        } else {
          imageDone++;
          console.log('webp:', path.relative(ROOT, r.out));
        }
      } catch (err) {
        console.error('image failed:', input, err.message);
      }
    }

    for (const name of videos) {
      const input = path.join(folder, name);
      const r = convertVideo(input);
      if (r.error) {
        console.error('video failed:', input, r.error);
        continue;
      }
      if (r.skipped) {
        videoSkipped++;
      } else if (r.discarded) {
        videoDiscarded++;
        console.log('video kept original (no saving):', path.relative(ROOT, input));
      } else {
        videoDone++;
        console.log(
          'm4v:',
          path.relative(ROOT, r.out),
          `${(r.srcSize / 1e6).toFixed(1)}M -> ${(r.outSize / 1e6).toFixed(1)}M`
        );
      }
    }
  }

  console.log(
    `\nImages: created ${imageDone}, skipped ${imageSkipped}. Videos: created ${videoDone}, kept original ${videoDiscarded}, skipped ${videoSkipped}.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

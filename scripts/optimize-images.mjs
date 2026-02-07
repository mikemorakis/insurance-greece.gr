import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';

const PUBLIC = decodeURIComponent(new URL('../public/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const IMAGE_DIRS = ['images', 'uploads'];
const MAX_WIDTH = 1920;
const QUALITY = { jpg: 80, webp: 78, avif: 60 };

async function getAllImages(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getAllImages(full));
    } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function optimizeImage(filePath) {
  const ext = extname(filePath).toLowerCase();
  const name = basename(filePath, ext);
  const dir = dirname(filePath);

  try {
    const image = sharp(filePath);
    const meta = await image.metadata();

    // Resize if wider than MAX_WIDTH
    const resizeOpts = meta.width > MAX_WIDTH ? { width: MAX_WIDTH, withoutEnlargement: true } : {};

    // Optimized JPG (overwrite original)
    await sharp(filePath)
      .resize(resizeOpts)
      .jpeg({ quality: QUALITY.jpg, progressive: true, mozjpeg: true })
      .toFile(join(dir, `${name}.opt${ext}`));

    // WebP
    await sharp(filePath)
      .resize(resizeOpts)
      .webp({ quality: QUALITY.webp })
      .toFile(join(dir, `${name}.webp`));

    // AVIF
    await sharp(filePath)
      .resize(resizeOpts)
      .avif({ quality: QUALITY.avif })
      .toFile(join(dir, `${name}.avif`));

    // Replace original with optimized
    const { rename, unlink } = await import('fs/promises');
    await unlink(filePath);
    await rename(join(dir, `${name}.opt${ext}`), filePath);

    const origSize = meta.size || (await stat(filePath)).size;
    const newStat = await stat(filePath);
    const webpStat = await stat(join(dir, `${name}.webp`));
    const avifStat = await stat(join(dir, `${name}.avif`));

    console.log(
      `✓ ${basename(filePath)} | JPG: ${(newStat.size / 1024).toFixed(0)}KB | WebP: ${(webpStat.size / 1024).toFixed(0)}KB | AVIF: ${(avifStat.size / 1024).toFixed(0)}KB`
    );
  } catch (err) {
    console.error(`✗ ${basename(filePath)}: ${err.message}`);
  }
}

// Handle PNG files separately (convert to JPG, keep PNG for transparency)
async function optimizePng(filePath) {
  const name = basename(filePath, extname(filePath));
  const dir = dirname(filePath);

  try {
    const image = sharp(filePath);
    const meta = await image.metadata();
    const resizeOpts = meta.width > MAX_WIDTH ? { width: MAX_WIDTH, withoutEnlargement: true } : {};

    // WebP
    await sharp(filePath)
      .resize(resizeOpts)
      .webp({ quality: QUALITY.webp })
      .toFile(join(dir, `${name}.webp`));

    // AVIF
    await sharp(filePath)
      .resize(resizeOpts)
      .avif({ quality: QUALITY.avif })
      .toFile(join(dir, `${name}.avif`));

    // Optimize PNG in place
    await sharp(filePath)
      .resize(resizeOpts)
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(join(dir, `${name}.opt.png`));

    const { rename, unlink } = await import('fs/promises');
    await unlink(filePath);
    await rename(join(dir, `${name}.opt.png`), filePath);

    const newStat = await stat(filePath);
    const webpStat = await stat(join(dir, `${name}.webp`));
    const avifStat = await stat(join(dir, `${name}.avif`));

    console.log(
      `✓ ${basename(filePath)} | PNG: ${(newStat.size / 1024).toFixed(0)}KB | WebP: ${(webpStat.size / 1024).toFixed(0)}KB | AVIF: ${(avifStat.size / 1024).toFixed(0)}KB`
    );
  } catch (err) {
    console.error(`✗ ${basename(filePath)}: ${err.message}`);
  }
}

async function main() {
  console.log('Optimizing images...\n');

  for (const imageDir of IMAGE_DIRS) {
    const dir = join(PUBLIC, imageDir);
    try {
      const images = await getAllImages(dir);
      console.log(`Found ${images.length} images in ${imageDir}/\n`);

      for (const img of images) {
        if (/\.png$/i.test(img)) {
          await optimizePng(img);
        } else {
          await optimizeImage(img);
        }
      }
      console.log('');
    } catch (err) {
      console.log(`Skipping ${imageDir}/: ${err.message}`);
    }
  }

  console.log('Done!');
}

main();

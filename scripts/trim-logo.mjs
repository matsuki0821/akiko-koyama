import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

async function trimLogo() {
  const projectRoot = path.resolve(process.cwd());
  const inputPath = path.join(projectRoot, 'public', 'images', 'logo.jpg');
  const tmpPath = path.join(projectRoot, 'public', 'images', 'logo.tmp.jpg');

  const src = sharp(inputPath);
  const metadata = await src.metadata();

  // 1) 背景色推定のため縮小 → 端ピクセルの平均で閾値を決める
  const small = await src
    .resize({ width: 50, height: 50, fit: 'inside', withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 端のピクセルで背景色を推定
  const { data, info } = small; // RGBA
  const edgePixels = [];
  const w = info.width;
  const h = info.height;
  const pushPixel = (idx) => edgePixels.push([
    data[idx], data[idx + 1], data[idx + 2], data[idx + 3]
  ]);
  for (let x = 0; x < w; x++) {
    pushPixel((0 * w + x) * 4);
    pushPixel(((h - 1) * w + x) * 4);
  }
  for (let y = 0; y < h; y++) {
    pushPixel((y * w + 0) * 4);
    pushPixel((y * w + (w - 1)) * 4);
  }
  const avg = edgePixels.reduce((acc, p) => {
    acc[0] += p[0]; acc[1] += p[1]; acc[2] += p[2]; acc[3] += p[3];
    return acc;
  }, [0, 0, 0, 0]).map((v) => Math.round(v / edgePixels.length));

  // 2) 近似背景色を透明化してtrim
  const tolerant = 18; // 許容差
  const keyed = await sharp(inputPath)
    .ensureAlpha()
    .recomb([[1,0,0],[0,1,0],[0,0,1]]) // no-op, keeps pipeline explicit
    .toColorspace('srgb')
    .png()
    .toBuffer();

  // chroma key 的に背景近似色を抜く（近似実装）
  const keyedImg = sharp(keyed).ensureAlpha();
  const { data: rgba, info: i2 } = await keyedImg.raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < rgba.length; i += 4) {
    const dr = Math.abs(rgba[i] - avg[0]);
    const dg = Math.abs(rgba[i + 1] - avg[1]);
    const db = Math.abs(rgba[i + 2] - avg[2]);
    if (dr <= tolerant && dg <= tolerant && db <= tolerant) {
      rgba[i + 3] = 0; // make transparent
    }
  }
  const transparentBuf = await sharp(rgba, { raw: { width: i2.width, height: i2.height, channels: 4 } })
    .png()
    .toBuffer();

  // 透明周りを自動トリム
  const trimmed = await sharp(transparentBuf)
    .trim()
    .png()
    .toBuffer();

  // 仕上げ: 正方形にパディングを少しだけ追加（8%）しつつJPGで保存
  const padPercent = 0.08;
  const sizeMeta = await sharp(trimmed).metadata();
  const maxSide = Math.max(sizeMeta.width || 0, sizeMeta.height || 0);
  const pad = Math.round(maxSide * padPercent);
  const target = maxSide + pad * 2;
  const composed = await sharp({ create: { width: target, height: target, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } })
    .composite([{ input: trimmed, gravity: 'center' }])
    .jpeg({ quality: 90, chromaSubsampling: '4:4:4' })
    .toBuffer();

  await fs.writeFile(tmpPath, composed);
  await fs.rename(tmpPath, inputPath);

  const before = metadata.size ?? 0;
  const after = (await fs.stat(inputPath)).size;
  console.log(`Trimmed logo.jpg: ${before} bytes -> ${after} bytes`);
}

trimLogo().catch((e) => {
  console.error(e);
  process.exit(1);
});



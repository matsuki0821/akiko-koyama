// scripts/compress-images.mjs
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const srcRoot = "images-src";
const outRoot = "public/voice";

if (!fs.existsSync(srcRoot)) {
  console.log(`[compress-img] ${srcRoot} が無いのでスキップ`);
  process.exit(0);
}

for (const slug of fs.readdirSync(srcRoot)) {
  const srcDir = path.join(srcRoot, slug);
  if (!fs.statSync(srcDir).isDirectory()) continue;

  const outDir = path.join(outRoot, slug);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`\n[IMG] ${slug}: JPG/PNG → WebP`);
  const files = fs
    .readdirSync(srcDir)
    .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (files.length === 0) {
    console.log("  画像なし（スキップ）");
    continue;
  }

  try {
    execSync(
      `npx -y @squoosh/cli --webp '{"quality":70}' --resize '{"width":1280}' -d "${outDir}" ${files
        .map((f) => `"${path.join(srcDir, f)}"`)
        .join(" ")}`,
      { stdio: "inherit", shell: true }
    );
  } catch (e) {
    console.warn("[compress-img] squoosh が利用できないため cwebp-bin へフォールバックします");
    execSync(`npx -y cwebp-bin -version`, { stdio: "inherit", shell: true });
    for (const [idx, f] of files.entries()) {
      const inPath = path.join(srcDir, f);
      const outPath = path.join(outDir, `p${idx + 1}.webp`);
      execSync(`npx -y cwebp-bin "${inPath}" -q 70 -resize 1280 0 -o "${outPath}"`, {
        stdio: "inherit",
        shell: true,
      });
    }
  }

  const webps = fs.readdirSync(outDir).filter((f) => f.endsWith(".webp")).sort();
  webps.forEach((name, idx) => {
    const src = path.join(outDir, name);
    const dst = path.join(outDir, `p${idx + 1}.webp`);
    fs.renameSync(src, dst);
  });
}
console.log("\n[compress-img] 完了");



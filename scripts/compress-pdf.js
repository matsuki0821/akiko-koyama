// scripts/compress-pdf.js
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const inDir = "pdfs";
const outRoot = "public/voice";
const tmpRoot = ".tmp-pdf-pages";

function detectGs() {
  try {
    execSync("gs -v", { stdio: "ignore", shell: true });
    return "gs";
  } catch {}
  try {
    execSync("gswin64c -v", { stdio: "ignore", shell: true });
    return "gswin64c";
  } catch {}
  console.error("[compress-pdf] Ghostscript が見つかりません。winget install -e --id ArtifexSoftware.Ghostscript でインストールしてください。");
  process.exit(1);
}
const GS = detectGs();

if (!fs.existsSync(inDir)) {
  console.log(`[compress-pdf] ${inDir} が無いのでスキップ`);
  process.exit(0);
}

fs.mkdirSync(outRoot, { recursive: true });
fs.rmSync(tmpRoot, { recursive: true, force: true });
fs.mkdirSync(tmpRoot, { recursive: true });

for (const file of fs.readdirSync(inDir)) {
  if (!file.toLowerCase().endsWith(".pdf")) continue;

  const slug = file.replace(/\.pdf$/i, "");
  const input = path.join(inDir, file);
  const litePdf = path.join(outRoot, `${slug}-lite.pdf`);
  const tmpDir = path.join(tmpRoot, slug);
  const imgOutDir = path.join(outRoot, slug);

  fs.rmSync(imgOutDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });
  fs.mkdirSync(imgOutDir, { recursive: true });

  console.log(`\n[PDF] ${file} → ${slug}-lite.pdf / ${slug}/*.webp`);

  // 1) 軽量版PDFを生成
  execSync(
    `${GS} -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dDetectDuplicateImages=true -dDownsampleColorImages=true -dColorImageResolution=150 -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${litePdf}" "${input}"`,
    { stdio: "inherit", shell: true }
  );

  // 2) 各ページをPNGへレンダリング（150dpi）
  execSync(
    `${GS} -dSAFER -dNOPAUSE -dBATCH -sDEVICE=png16m -r150 -sOutputFile="${tmpDir}/page-%03d.png" "${input}"`,
    { stdio: "inherit", shell: true }
  );

  // 3) PNG→WebP（1280px幅・品質70）
  try {
    execSync(
      `npx -y @squoosh/cli --webp '{"quality":70}' --resize '{"width":1280}' -d "${imgOutDir}" "${tmpDir}/*.png"`,
      { stdio: "inherit", shell: true }
    );
  } catch (e) {
    // フォールバック: cwebp を使って WebP 化（品質70、幅1280px）
    console.warn("[compress-pdf] squoosh が利用できないため cwebp-bin へフォールバックします");
    execSync(`npx -y cwebp-bin -version`, { stdio: "inherit", shell: true });
    const files = fs
      .readdirSync(tmpDir)
      .filter((f) => f.endsWith(".png"))
      .sort();
    for (const [idx, name] of files.entries()) {
      const inputPng = path.join(tmpDir, name);
      const outWebp = path.join(imgOutDir, `p${idx + 1}.webp`);
      execSync(
        `npx -y cwebp-bin "${inputPng}" -q 70 -resize 1280 0 -o "${outWebp}"`,
        { stdio: "inherit", shell: true }
      );
    }
  }

  // 4) 連番へリネーム
  const webps = fs.readdirSync(imgOutDir).filter((f) => f.endsWith(".webp")).sort();
  webps.forEach((name, idx) => {
    const src = path.join(imgOutDir, name);
    const dst = path.join(imgOutDir, `p${idx + 1}.webp`);
    fs.renameSync(src, dst);
  });
}

fs.rmSync(tmpRoot, { recursive: true, force: true });
console.log("\n[compress-pdf] 完了");



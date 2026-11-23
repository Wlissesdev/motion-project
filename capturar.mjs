import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Argument parsing
const args = process.argv.slice(2);
function getArg(key, defaultVal) {
  const index = args.indexOf(key);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }
  return defaultVal;
}
const isPreview = args.includes('--preview');
const fromSec = parseFloat(getArg('--from', '0.0'));
const toSec = parseFloat(getArg('--to', '9.0'));
const fps = parseInt(getArg('--fps', isPreview ? '15' : '30'), 10);
const outDirName = getArg('--dir', isPreview ? 'preview_frames' : 'frames');
const outDir = path.join(__dirname, outDirName);

const fullWidth = 1080;
const fullHeight = 1920;
const width = isPreview ? fullWidth / 2 : fullWidth;
const height = isPreview ? fullHeight / 2 : fullHeight;
const deviceScaleFactor = isPreview ? 0.5 : 1.0;

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log(`[Capture] Starting capture:`);
console.log(`- Mode: ${isPreview ? 'PREVIEW (15fps, 540x960)' : 'FINAL (30fps, 1080x1920)'}`);
console.log(`- Time range: ${fromSec}s -> ${toSec}s`);
console.log(`- FPS: ${fps}`);
console.log(`- Output Directory: ${outDir}`);

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--allow-file-access-from-files',
      '--enable-webgl',
      '--ignore-gpu-blocklist'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: fullWidth, height: fullHeight },
    deviceScaleFactor: deviceScaleFactor
  });

  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  const htmlPath = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/');
  await page.goto(htmlPath, { waitUntil: 'load' });

  // Safe area violations collector
  const safeAreaViolations = [];

  const totalFrames = Math.round((toSec - fromSec) * fps);
  const startFrameIndex = Math.round(fromSec * fps) + 1;

  console.log(`[Capture] Rendering ${totalFrames} frames...`);

  for (let i = 0; i < totalFrames; i++) {
    const frameIndex = startFrameIndex + i;
    const t = fromSec + i / fps;

    // Execute deterministic render
    await page.evaluate((time) => {
      window.renderFrame(time);
    }, t);

    // Periodic safe area check (a cada ~0.5s)
    if (i % Math.round(fps * 0.5) === 0) {
      const violations = await page.evaluate(() => {
        return window.checkSafeAreaViolations();
      });
      if (violations && violations.length > 0) {
        safeAreaViolations.push({ t: t.toFixed(2), violations });
      }
    }

    const paddedIndex = String(frameIndex).padStart(6, '0');
    const framePath = path.join(outDir, `f_${paddedIndex}.png`);

    await page.screenshot({
      path: framePath,
      clip: { x: 0, y: 0, width: fullWidth, height: fullHeight }
    });

    if (i % (fps * 2) === 0 || i === totalFrames - 1) {
      console.log(`[Progress] Frame ${frameIndex}/${startFrameIndex + totalFrames - 1} (t=${t.toFixed(2)}s)`);
    }
  }

  await browser.close();

  console.log(`[Capture] Done rendering ${totalFrames} frames.`);

  // QA Report
  console.log(`--- RELATÓRIO AUTOMÁTICO DE QA ---`);
  console.log(`Erros de console do navegador: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Console errors:', consoleErrors);
  }

  console.log(`Violações de Área Segura detectadas: ${safeAreaViolations.length}`);
  if (safeAreaViolations.length > 0) {
    console.warn('Amostras com violação de Safe Area:');
    safeAreaViolations.slice(0, 5).forEach(v => {
      console.warn(`  Em t=${v.t}s: ${JSON.stringify(v.violations)}`);
    });
  } else {
    console.log('✅ Nenhuma violação de safe area detectada!');
  }
}

run().catch(err => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});

// Verifica el flujo de compartir: encode → URL hash → decode → processQR
// 1) Abrir la app
// 2) Encodear una URL QR
// 3) Navegar a la URL con #r=... y comprobar que se autoejecuta el flow
// 4) Generar el enlace de compartir desde la pantalla de resultados

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'screenshots');
const PORT = 8790;

const QR_URL = 'https://comparador.cnmc.gob.es/comparador/QRE?cp=31820&pP1=4.6&pP2=4.6&caP1=412&caP2=1974&caP3=7423&iniA=2025-04-30&tc=E0&finPen=0000-00-00&finContrato=2026-06-22&tf=N&imp=99.17&cfP1=40&cfP2=174&cfP3=652&iniF=2026-03-31&finF=2026-04-30&impSA=1.04&impOtrosConIE=0&impOtrosSinIE=0.8&exc=19.74&com=R2-515&cups=ES0021000015752954HK&pmaxP1=4.73&pmaxP2=8.9&fFact=2026-05-12&dtoBS=0&finBS=0.57&ajuste=0&impPot=14.43&impEner=92.08&dto=0&prP1=33.24201&prP2=4.921295&prE1=0.187225&prE2=0.128939&prE3=0.095209&cfP1Flex=&cfP2Flex=&cambio=&promo=&verde=1&rev=0';

function resolvePuppeteer() {
  const candidates = [
    path.join(ROOT, 'node_modules', 'puppeteer'),
    '/tmp/node_modules/puppeteer',
    path.join(process.env.HOME || '', 'node_modules', 'puppeteer'),
  ];
  for (const c of candidates) { try { return require(c); } catch (_) {} }
  return require('puppeteer');
}
function findChromeHeadless() {
  const cacheDir = path.join(process.env.HOME || '', '.cache', 'puppeteer', 'chrome-headless-shell');
  if (!fs.existsSync(cacheDir)) return null;
  const versions = fs.readdirSync(cacheDir);
  for (const v of versions) {
    if (v.includes('mac_arm') || v.includes('mac-arm') || v.includes('mac-')) {
      const platDir = fs.readdirSync(path.join(cacheDir, v))[0];
      const bin = path.join(cacheDir, v, platDir, 'chrome-headless-shell');
      if (fs.existsSync(bin)) return bin;
    }
  }
  return null;
}
function startServer() {
  return new Promise((resolve, reject) => {
    const srv = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: ROOT, stdio: 'ignore' });
    srv.on('error', reject);
    let tries = 0;
    const t = setInterval(() => {
      tries++;
      http.get(`http://localhost:${PORT}/index.html`, r => {
        if (r.statusCode === 200) { clearInterval(t); resolve(srv); }
      }).on('error', () => { if (tries > 20) { clearInterval(t); reject(new Error('Server no arrancó')); } });
    }, 200);
  });
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);
  console.log('→ Servidor :' + PORT);
  const server = await startServer();
  try {
    const puppeteer = resolvePuppeteer();
    const exec = findChromeHeadless();
    const browser = await puppeteer.launch({ headless: true, ...(exec ? { executablePath: exec } : {}) });

    // === Paso 1: cargar app y encodear la URL ===
    console.log('→ Encode round-trip test');
    const page = await browser.newPage();
    page.on('console', m => { if (m.type() === 'error') console.log('  [page-err] ' + m.text()); });
    await page.setViewport({ width: 480, height: 1200 });
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle0' });
    const roundtrip = await page.evaluate(qrUrl => {
      const dbg = window.__ahorraluzDebug;
      if (!dbg || !dbg.encodeShareHash) return { ok: false, error: 'no debug encode' };
      const hash = dbg.encodeShareHash(qrUrl);
      const decoded = dbg.decodeShareHash(hash);
      return {
        ok: decoded === qrUrl,
        hashLen: hash.length,
        originalLen: qrUrl.length,
        decoded: decoded,
        sample: hash.slice(0, 40) + '…',
      };
    }, QR_URL);
    console.log('  roundtrip ok: ' + roundtrip.ok);
    console.log('  original: ' + roundtrip.originalLen + ' chars → hash: ' + roundtrip.hashLen + ' chars');
    console.log('  sample: ' + roundtrip.sample);
    await page.close();

    // === Paso 2: visitar la URL con #r=... y verificar autoejecución ===
    console.log('→ Visit shared URL with hash');
    const page2 = await browser.newPage();
    await page2.setViewport({ width: 480, height: 1200 });
    // Precalculamos el hash en una página temporal
    const tmp = await browser.newPage();
    await tmp.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle0' });
    const hash = await tmp.evaluate(qrUrl => window.__ahorraluzDebug.encodeShareHash(qrUrl), QR_URL);
    await tmp.close();
    const sharedUrl = `http://localhost:${PORT}/index.html${hash}`;
    console.log('  URL: ' + sharedUrl.slice(0, 80) + '…');

    page2.on('console', m => console.log('  [p2-' + m.type() + '] ' + m.text().slice(0, 200)));
    page2.on('pageerror', e => console.log('  [p2-err] ' + e.message));
    await page2.goto(sharedUrl, { waitUntil: 'networkidle0' });
    // Diagnostico inmediato del hash + decode
    const diag = await page2.evaluate(() => {
      return {
        hash: location.hash.slice(0, 60),
        hasLZ: typeof LZString !== 'undefined',
        decoded: window.__ahorraluzDebug?.decodeShareHash(location.hash)?.slice(0, 80),
      };
    });
    console.log('  diag hash: ' + diag.hash + ' …');
    console.log('  hasLZ: ' + diag.hasLZ);
    console.log('  decoded: ' + diag.decoded);
    // Esperar a que cargue + procese
    await new Promise(r => setTimeout(r, 14000));
    const data = await page2.evaluate(() => {
      const active = document.querySelector('.screen.active')?.id;
      const hero = document.getElementById('savings-hero-amount')?.textContent;
      const heroSub = document.getElementById('savings-hero-sub')?.textContent;
      return { active, hero, heroSub };
    });
    console.log('  pantalla activa: ' + data.active);
    console.log('  hero: ' + data.hero + ' · ' + data.heroSub);

    // === Paso 3: pulsar Copiar y verificar que la URL coincide con la esperada ===
    console.log('→ Copy share link');
    await page2.evaluate(() => {
      // Mock del clipboard para evitar pedir permiso
      navigator.clipboard.writeText = (txt) => { window.__copied = txt; return Promise.resolve(); };
    });
    const btnExists = await page2.evaluate(() => !!document.getElementById('btn-share'));
    console.log('  btn-share existe: ' + btnExists);
    if (btnExists) {
      await page2.click('#btn-share');
      await new Promise(r => setTimeout(r, 400));
      const copied = await page2.evaluate(() => window.__copied);
      console.log('  copied al portapapeles: ' + (copied ? copied.slice(0, 80) + '…' : 'null'));
      console.log('  longitud: ' + (copied ? copied.length : '-'));
      const btnText = await page2.evaluate(() => document.querySelector('#btn-share .btn-share-text')?.textContent);
      console.log('  texto botón tras click: "' + btnText + '"');
    }

    await page2.screenshot({ path: path.join(OUT_DIR, 'share-result.png'), fullPage: false });
    await page2.close();
    await browser.close();
  } catch (e) {
    console.error('✗ Error:', e.message);
  } finally {
    server.kill();
  }
}
main();

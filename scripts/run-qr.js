// Ejecuta el flow real con una URL QR específica y captura el resultado.
// Uso: node scripts/run-qr.js "<url-del-qr>"

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'screenshots');
const PORT = 8789;

const QR_URL = process.argv[2] || '';
if (!QR_URL) { console.error('Uso: node scripts/run-qr.js "<url>"'); process.exit(1); }

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

async function captureFlow(browser, vp) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.w, height: vp.h, isMobile: vp.isMobile });
  const log = [];
  page.on('console', m => log.push(`[${m.type()}] ${m.text().slice(0, 240)}`));
  page.on('pageerror', e => log.push(`[pageerror] ${e.message}`));
  page.on('response', r => {
    const u = r.url();
    if (u.includes('cnmc') || u.includes('workers.dev')) log.push(`[net] ${r.status()} ${r.request().method()} ${u.slice(0, 120)}`);
  });
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle0' });
  const start = Date.now();
  const flow = await page.evaluate(async qr => {
    if (!window.__ahorraluzDebug || !window.__ahorraluzDebug.processQR) return { ok: false, error: 'sin debug hook' };
    try { await window.__ahorraluzDebug.processQR(qr); return { ok: true }; }
    catch (e) { return { ok: false, error: e.message }; }
  }, QR_URL);
  flow.ms = Date.now() - start;
  await new Promise(r => setTimeout(r, 1500));
  // Abrir todas las secciones para captura
  await page.evaluate(() => {
    document.querySelectorAll('details').forEach(d => { d.open = true; });
  });
  await new Promise(r => setTimeout(r, 400));
  const file = `qr-etxarri-${vp.name}.png`;
  await page.screenshot({ path: path.join(OUT_DIR, file), fullPage: true });
  // DEBUG: extraer contenido del details para no perder visibilidad
  await page.evaluate(() => {
    const sec = document.getElementById('section-ofertas');
    if (sec) {
      const content = sec.querySelector('.collapsible-content');
      if (content) {
        sec.parentNode.insertBefore(content, sec);
        sec.remove();
      }
    }
  });
  // Datos para debugging
  const data = await page.evaluate(() => {
    const $ = id => document.getElementById(id);
    const txt = id => { const e = $(id); return e ? e.innerText.trim() : null; };
    return {
      activeScreen: document.querySelector('.screen.active')?.id || 'none',
      caseAttr: document.getElementById('screen-result')?.dataset.case,
      heroLabel: txt('savings-hero-label'),
      heroAmount: txt('savings-hero-amount'),
      heroSub: txt('savings-hero-sub'),
      heroContext: txt('savings-hero-context'),
      currentCompany: txt('comp-current-company'),
      currentTariff: txt('comp-current-tariff'),
      currentAmount: txt('result-current-amount'),
      bestCompany: txt('result-best-company'),
      bestTariff: txt('result-best-tariff'),
      bestAmount: txt('result-best-amount'),
      contextNote: txt('offers-context-note'),
      userRank: txt('offers-user-rank'),
      totalOffers: txt('offers-total-count'),
      // Primeros 3 slides
      slides: Array.from(document.querySelectorAll('.offers-proposed-slide')).slice(0, 3).map(s => ({
        company: s.querySelector('.offers-col-company')?.innerText,
        offer: s.querySelector('.offers-col-subtitle')?.innerText,
        pago: s.querySelector('.offers-col-row-total .offers-col-value')?.innerText,
        savings: s.querySelector('.slide-savings-amount')?.innerText,
        tags: Array.from(s.querySelectorAll('.slide-tag')).map(t => t.innerText),
      })),
      puntosClave: Array.from(document.querySelectorAll('#puntos-clave-list .punto')).map(p => p.innerText),
      // Debug raw
      rawCurrentAnnualCost: window.__lastResults?.current?.amount,
      rawTotalOffers: window.__lastResults?.totalOffers,
      rawUserRank: window.__lastResults?.userRankPosition,
      rawCurrentRank: window.__lastResults?.currentCompanyRank,
      rawBest: window.__lastResults?.best ? `${window.__lastResults.best.company} - ${window.__lastResults.best.offerName} - ${window.__lastResults.best.amount}€` : null,
      rawTop10: (window.__lastResults?.topOffers || []).map(o => `${o.company} · ${o.offerName} · ${o.amount}€${o.hasDiscount ? ' (1er año, luego '+o.secondYearAmount+'€)' : ''}${o.isGreen ? ' verde' : ''}${o.hasPenalty ? ' perm' : ''}`),
      // Top 5 ofertas crudas (todas las propiedades, para entender desglose)
      rawTopRaw: (window.__lastOffersRaw?.resultadoComparador || []).slice(0, 5).map(o => Object.keys(o).reduce((acc, k) => { if (o[k] != null && o[k] !== '') acc[k] = o[k]; return acc; }, {})),
      qrData: window.__lastQrData,
    };
  });
  await page.close();
  return { file, flow, data, log: log.slice(-30) };
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);
  console.log('→ Servidor :' + PORT);
  const server = await startServer();
  try {
    const puppeteer = resolvePuppeteer();
    const exec = findChromeHeadless();
    const browser = await puppeteer.launch({ headless: true, ...(exec ? { executablePath: exec } : {}) });
    console.log('→ Mobile 375x812');
    const r1 = await captureFlow(browser, { name: 'mobile', w: 375, h: 812, isMobile: true });
    console.log('  flow ' + (r1.flow.ok ? '✓' : '✗') + ' ' + (r1.flow.ms||'') + 'ms ' + (r1.flow.error || ''));
    console.log('  → ' + r1.file);
    console.log('  DATOS:');
    console.log('    case:        ' + r1.data.caseAttr);
    console.log('    hero:        ' + r1.data.heroLabel + ' / ' + r1.data.heroAmount + ' / ' + r1.data.heroSub);
    console.log('    actual:      ' + r1.data.currentCompany + ' · ' + r1.data.currentTariff + ' · ' + r1.data.currentAmount);
    console.log('    mejor:       ' + r1.data.bestCompany + ' · ' + r1.data.bestTariff + ' · ' + r1.data.bestAmount);
    console.log('    contextNote: ' + r1.data.contextNote);
    console.log('    ranking:     ' + r1.data.userRank + ' de ' + r1.data.totalOffers);
    console.log('    puntos:');
    (r1.data.puntosClave || []).forEach(p => console.log('      - ' + p.replace(/\n/g, ' ')));
    console.log('    top3 ofertas:');
    (r1.data.slides || []).forEach((s, i) => console.log('      #' + (i+1) + ' ' + s.company + ' · ' + s.offer + ' · ' + s.pago + ' · ' + (s.savings||'-')));
    console.log('  --- raw top 5 (todas las props de la API CNMC) ---');
    (r1.data.rawTopRaw || []).forEach((o, i) => {
      console.log('    #' + (i+1) + ' ' + (o.comercializadora||'?') + ' / ' + (o.oferta||'?'));
      console.log('      ' + JSON.stringify(o, null, 2).replace(/\n/g, '\n      '));
    });
    console.log('  --- network ---');
    r1.log.filter(l => l.startsWith('[net]')).forEach(l => console.log('    ' + l));
    console.log('→ Desktop 1440x900');
    const r2 = await captureFlow(browser, { name: 'desktop', w: 1440, h: 900, isMobile: false });
    console.log('  → ' + r2.file);
    await browser.close();
  } finally { server.kill(); }
}
main();

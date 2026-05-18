// Validación pre-push: arranca un servidor local, toma screenshots
// de mobile y desktop (landing + resultado) y reproduce el flow con
// el QR real de prueba.
//
// Uso: node scripts/verify-prepush.js
// Requisitos: puppeteer instalado globalmente o en node_modules.
//
// Output: PNGs en ./screenshots/ + reporte por consola (PASS/FAIL).

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const SCREENSHOTS_DIR = path.join(ROOT, 'screenshots');
const PORT = 8787;

const QR_URL = 'https://comparador.cnmc.gob.es/comparador/QRE?cp=31006&pP1=3.00&pP2=3.00&tc=F0&finContrato=2027-01-22&com=R2-760&cups=ES0021000038601118RP&tf=N&iniF=2026-03-18&finF=2026-04-17&impOtrosSinIE=0.80&exc=0&fFact=2026-04-23&caP1=751&caP2=787&caP3=1180&iniA=2025-05-15&pmaxP1=3.727&pmaxP2=2.974&rev=0&verde=1&imp=60.20&cfP1=62&cfP2=122&cfP3=158&ajuste=0&finBS=0.57&impPot=10.88&impEner=42.45&prP1=34.867355&prP2=9.249465&prE1=0.124140&prE2=0.124140&prE3=0.124140';

// Localiza puppeteer en node_modules de varios sitios típicos
function resolvePuppeteer() {
  const candidates = [
    path.join(ROOT, 'node_modules', 'puppeteer'),
    '/tmp/node_modules/puppeteer',
    path.join(process.env.HOME || '', 'node_modules', 'puppeteer'),
  ];
  for (const c of candidates) {
    try { return require(c); } catch (_) {}
  }
  // Último intento: require normal (si puppeteer está global en NODE_PATH)
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
    // Wait until it responds
    let tries = 0;
    const t = setInterval(() => {
      tries++;
      http.get(`http://localhost:${PORT}/index.html`, r => {
        if (r.statusCode === 200) { clearInterval(t); resolve(srv); }
      }).on('error', () => {
        if (tries > 20) { clearInterval(t); reject(new Error('Server no arrancó')); }
      });
    }, 200);
  });
}

const VIEWPORTS = [
  { name: 'mobile-375',  w: 375,  h: 812, isMobile: true },
  { name: 'desktop-1440', w: 1440, h: 900, isMobile: false },
];

async function populateResultMock(page) {
  // Datos de mock para verificar el render del resultado sin depender de la API
  await page.evaluate(() => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-result').classList.add('active');

    // Hero + comparativa
    document.getElementById('savings-hero-label').textContent = 'Ahorro disponible';
    document.getElementById('savings-hero-amount').textContent = '99,00 €/año';
    document.getElementById('savings-hero-sub').innerHTML = 'cambiando a <strong>Imagina Energía</strong>';
    document.getElementById('savings-hero-context').textContent = '8,25 €/mes · estás pagando un 17% de más';
    document.getElementById('comp-current-company').textContent = 'Octopus Energy España';
    document.getElementById('comp-current-tariff').textContent = 'Plan Anual';
    document.getElementById('result-current-amount').textContent = '590 €/año';
    document.getElementById('result-current-monthly').textContent = '49,15 €/mes';
    document.getElementById('result-best-company').textContent = 'Imagina Energía';
    document.getElementById('result-best-tariff').textContent = 'Plan Base Noche y FINDES';
    document.getElementById('result-best-amount').textContent = '491 €/año';
    document.getElementById('result-best-monthly').textContent = '40,90 €/mes';

    // Puntos clave (mock)
    const puntos = [
      { type: 'warn', text: 'Tu pico (3,73 kW) supera la potencia contratada (3 kW)' },
      { type: 'good', text: 'Pasa a 100% energía renovable' },
      { type: 'good', text: 'Sin permanencia' },
      { type: 'tip',  text: 'Podrías tener derecho al bono social (25-40% descuento)' },
      { type: 'good', text: 'Misma potencia, sin cambios técnicos' },
    ];
    const ICONS = { good: '✓', warn: '⚠', tip: '💡', info: 'ℹ' };
    document.getElementById('puntos-clave-list').innerHTML = puntos.map(p =>
      `<li class="punto punto-${p.type}"><span class="punto-icon">${ICONS[p.type]}</span><span class="punto-text">${p.text}</span></li>`
    ).join('');

    // Mock del nuevo comparador: actual fijo + propuesta carrusel
    const cur = { company: 'Octopus Energy España', tipo: 'PVPC / Fijo', pot: '3,00 kW', perm: 'Sin permanencia', origen: 'Mix nacional', pago: 590 };
    const offers = [
      { rank: 1, company: 'Energya VM', name: 'Fórmula Fija 24h', amount: 460, second: 542, green: false, perm: false, discount: true },
      { rank: 2, company: 'Imagina Energía', name: 'Plan Base Noche y FINDES', amount: 498, second: 498, green: true, perm: false, discount: false },
      { rank: 3, company: 'Energyasset', name: 'Tarifa Precio por Periodo', amount: 498, second: 498, green: false, perm: false, discount: false },
    ];
    const fmt = v => v.toLocaleString('es-ES') + ' €';
    document.getElementById('offers-user-rank').textContent = 'puesto ~27';
    document.getElementById('offers-total-count').textContent = '105';
    // Columna actual (fija)
    document.getElementById('offers-cur-company').textContent = cur.company;
    document.getElementById('offers-cur-rows').innerHTML = `
      <li class="offers-col-row"><span class="offers-col-key">Tipo</span><span class="offers-col-value">${cur.tipo}</span></li>
      <li class="offers-col-row"><span class="offers-col-key">Potencia</span><span class="offers-col-value">${cur.pot}</span></li>
      <li class="offers-col-row"><span class="offers-col-key">Permanencia</span><span class="offers-col-value">${cur.perm}</span></li>
      <li class="offers-col-row"><span class="offers-col-key">Origen</span><span class="offers-col-value">${cur.origen}</span></li>
      <li class="offers-col-row offers-col-row-total"><span class="offers-col-key">Pago/año</span><span class="offers-col-value">${fmt(cur.pago)}/año</span></li>
    `;
    // Slides propuesta
    document.getElementById('offers-track').innerHTML = offers.map(o => {
      const diff = cur.pago - o.amount;
      const tags = [
        o.green ? '<span class="slide-tag tag-green">🌿 100% verde</span>' : '',
        o.perm ? '<span class="slide-tag tag-warn">12 meses</span>' : '<span class="slide-tag">🔒 Sin permanencia</span>',
        diff > 0 ? `<span class="slide-diff good">−${fmt(diff)} ahorro</span>` : ''
      ].filter(Boolean).join('');
      const pagoNew = o.discount
        ? `${fmt(o.amount)}/año <span class="contract-discount-tag">1er año</span><span class="contract-discount-after">luego ${fmt(o.second)}/año</span>`
        : `${fmt(o.amount)}/año`;
      return `<article class="offers-proposed-slide">
        <div class="offers-col-tag offers-col-tag-new">Propuesta <span class="slide-rank-badge ${o.rank===1?'star':''}">${o.rank===1?'★ #1':'#'+o.rank}</span></div>
        <div class="offers-col-company">${o.company}</div>
        <div class="offers-col-subtitle">${o.name}</div>
        <div class="slide-tags">${tags}</div>
        <ul class="offers-col-rows">
          <li class="offers-col-row"><span class="offers-col-key">Tipo</span><span class="offers-col-value">Precio fijo</span></li>
          <li class="offers-col-row"><span class="offers-col-key">Potencia</span><span class="offers-col-value">${cur.pot}</span></li>
          <li class="offers-col-row"><span class="offers-col-key">Permanencia</span><span class="offers-col-value">${o.perm?'12 meses':'Sin permanencia'}</span></li>
          <li class="offers-col-row ${o.green?'row-good':''}"><span class="offers-col-key">Origen</span><span class="offers-col-value">${o.green?'100% renovable':'Mix nacional'}</span></li>
          <li class="offers-col-row offers-col-row-total ${diff>0?'row-good':''}"><span class="offers-col-key">Pago/año</span><span class="offers-col-value">${pagoNew}</span></li>
        </ul>
        <a href="#" class="slide-cta">Cambiar a ${o.company} →</a>
      </article>`;
    }).join('');
    document.getElementById('offers-dots').innerHTML = offers.map((_,i)=>`<button class="carousel-dot ${i===0?'active':''}"></button>`).join('');
    document.getElementById('offers-counter').textContent = '1 de ' + offers.length;

    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    document.querySelectorAll('.collapsible-section').forEach(d => { d.open = isDesktop; });
  });
}

async function snapshot(browser, viewport, scenario, fn) {
  const page = await browser.newPage();
  await page.setViewport({ width: viewport.w, height: viewport.h, isMobile: viewport.isMobile });
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle0' });
  await fn(page);
  await new Promise(r => setTimeout(r, 800));
  const filename = `${scenario}-${viewport.name}.png`;
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, filename), fullPage: false });
  // Comprobar si hay scroll vertical
  const metrics = await page.evaluate(() => ({
    doc: document.documentElement.scrollHeight,
    view: window.innerHeight,
    body: document.body.scrollHeight,
  }));
  await page.close();
  return { filename, ...metrics };
}

async function main() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR);
  console.log('→ Arrancando servidor local en :' + PORT + '...');
  const server = await startServer();
  let exitCode = 0;
  try {
    const puppeteer = resolvePuppeteer();
    const exec = findChromeHeadless();
    const browser = await puppeteer.launch({ headless: true, ...(exec ? { executablePath: exec } : {}) });
    console.log('→ Capturando landing (mobile + desktop)...');
    for (const v of VIEWPORTS) {
      const r = await snapshot(browser, v, 'landing', async () => {});
      const fits = r.doc <= r.view + 4;
      console.log(`  ${fits ? '✓' : '✗'} landing-${v.name}: doc=${r.doc} view=${v.h}` + (fits ? '' : '  ⚠ overflow'));
      if (v.isMobile && !fits) exitCode = 1;
    }

    console.log('→ Capturando resultado con datos mock (mobile + desktop)...');
    for (const v of VIEWPORTS) {
      const r = await snapshot(browser, v, 'resultado-mock', populateResultMock);
      console.log(`  ✓ resultado-mock-${v.name}.png`);
    }

    console.log('→ Reproduciendo flow real con QR de prueba (timeout 25s)...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    const consoleLog = [];
    page.on('console', msg => consoleLog.push(`[${msg.type()}] ${msg.text().slice(0, 200)}`));
    page.on('pageerror', e => consoleLog.push(`[pageerror] ${e.message}`));
    page.on('response', async r => {
      const url = r.url();
      if (url.includes('cnmc') || url.includes('workers.dev')) {
        consoleLog.push(`[net] ${r.status()} ${r.request().method()} ${url.slice(0, 100)}`);
      }
    });
    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle0' });
    // Disparar processQR via debug hook (solo expuesto en localhost)
    const flowResult = await page.evaluate(async (qrUrl) => {
      if (!window.__ahorraluzDebug || !window.__ahorraluzDebug.processQR) {
        return { ok: false, error: 'debug hook no disponible (¿app.js cargado?)' };
      }
      const start = Date.now();
      try {
        await window.__ahorraluzDebug.processQR(qrUrl);
        return { ok: true, ms: Date.now() - start };
      } catch (e) {
        return { ok: false, error: e.message, ms: Date.now() - start };
      }
    }, QR_URL);
    console.log(`  flow: ${flowResult.ok ? '✓' : '✗'} ${flowResult.ms}ms ${flowResult.error || ''}`);

    // Esperar a que termine de renderizar (o falle)
    await new Promise(r => setTimeout(r, 1500));
    const activeScreen = await page.evaluate(() => {
      const active = document.querySelector('.screen.active');
      return active ? active.id : 'none';
    });
    console.log(`  pantalla final: ${activeScreen}`);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'flow-real-1440.png'), fullPage: true });
    await page.close();

    console.log('\n--- Console del flow real (últimas 25 líneas) ---');
    consoleLog.slice(-25).forEach(l => console.log('  ' + l));

    await browser.close();
  } catch (e) {
    console.error('✗ Error:', e.message);
    exitCode = 2;
  } finally {
    server.kill();
  }
  console.log(`\nScreenshots: ${SCREENSHOTS_DIR}`);
  process.exit(exitCode);
}

main();

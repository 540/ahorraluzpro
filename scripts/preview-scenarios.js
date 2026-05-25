// Captura screenshots de la sección "Mejores ofertas" para cada casuística
// del clasificador (primaryCase): rank-1, rank-top3, already-cheap,
// big-savings, normal-savings, small-savings, no-offers.
//
// Uso: node scripts/preview-scenarios.js
// Output: ./screenshots/scenario-<case>.png

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'screenshots');
const PORT = 8788;

function resolvePuppeteer() {
  const candidates = [
    path.join(ROOT, 'node_modules', 'puppeteer'),
    '/tmp/node_modules/puppeteer',
    path.join(process.env.HOME || '', 'node_modules', 'puppeteer'),
  ];
  for (const c of candidates) {
    try { return require(c); } catch (_) {}
  }
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
      }).on('error', () => {
        if (tries > 20) { clearInterval(t); reject(new Error('Server no arrancó')); }
      });
    }, 200);
  });
}

// Cada caso define: primaryCase + datos mock derivados (savings, best, etc.)
const SCENARIOS = [
  {
    case: 'rank-1',
    label: 'Ya tienes la mejor oferta del mercado',
    results: { savings: 0, best: { company: 'Octopus Energy' }, totalOffers: 105, userRankPosition: 1 },
  },
  {
    case: 'rank-top3',
    label: 'Tu oferta ya está en el top 3',
    results: { savings: 8, best: { company: 'Imagina Energía' }, totalOffers: 105, userRankPosition: 3 },
  },
  {
    case: 'already-cheap',
    label: 'No hay oferta que mejore la tuya',
    results: { savings: 0, best: { company: 'Imagina Energía' }, totalOffers: 105, userRankPosition: 12 },
  },
  {
    case: 'big-savings',
    label: 'Ahorros grandes (>15%)',
    results: { savings: 280, best: { company: 'Energya VM' }, totalOffers: 105, userRankPosition: 78 },
  },
  {
    case: 'normal-savings',
    label: 'Ahorros normales (5–15%)',
    results: { savings: 99, best: { company: 'Imagina Energía' }, totalOffers: 105, userRankPosition: 27 },
  },
  {
    case: 'small-savings',
    label: 'Ahorros pequeños (<5%)',
    results: { savings: 22, best: { company: 'Energyasset' }, totalOffers: 105, userRankPosition: 14 },
  },
];

async function captureScenario(browser, scenario) {
  const page = await browser.newPage();
  page.on('console', msg => console.log(`    [${scenario.case}] ${msg.text().slice(0, 200)}`));
  await page.setViewport({ width: 480, height: 1200, isMobile: true });
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle0' });

  // 1) Cambiar a pantalla resultado. Convertir el <details> de ofertas en
  //    contenedor estático (sacando el contenido) para evitar problemas de
  //    expansion. Ocultar lo demás.
  await page.evaluate(() => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-result').classList.add('active');
    const sec = document.getElementById('section-ofertas');
    if (sec) {
      const content = sec.querySelector('.collapsible-content');
      if (content) {
        sec.parentNode.insertBefore(content, sec);
        sec.remove();
        content.style.display = 'block';
      }
    }
    document.querySelectorAll('details').forEach(d => { d.open = true; });
    ['section-analisis', 'section-perfil', 'section-howto', 'savings-hero', 'comparison-block', 'result-best-note', 'btn-restart-wrap']
      .forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
    // Ocultar también el comparison-grid y el footer y CTA por clase
    document.querySelectorAll('.comparison-grid, .result-cta-wrap, .result-footer, .result-disclaimer').forEach(el => { el.style.display = 'none'; });
  });

  // 2) Llamar al renderer real con un scenario mockeado
  const debugInfo = await page.evaluate(({ primaryCase, results }) => {
    window.__ahorraluzDebug.renderCarouselContextNote(
      { primaryCase, modifiers: {} },
      results
    );
    document.getElementById('offers-user-rank').textContent =
      results.userRankPosition ? `puesto ~${results.userRankPosition}` : 'puesto desconocido';
    document.getElementById('offers-total-count').textContent = results.totalOffers;
    const note = document.getElementById('offers-context-note');
    return {
      hidden: note ? note.hidden : 'no-elem',
      html: note ? note.innerHTML.slice(0, 80) : '',
      cls: note ? note.className : '',
    };
  }, { primaryCase: scenario.case, results: scenario.results });

  // 3) Forzar details abiertos, esperar repaint, medir
  await page.evaluate(() => {
    document.querySelectorAll('details').forEach(d => { d.open = true; });
  });
  await new Promise(r => setTimeout(r, 400));

  const diag = await page.evaluate(() => {
    const sec = document.getElementById('section-ofertas');
    const note = document.getElementById('offers-context-note');
    const pos  = document.getElementById('offers-position-info');
    if (!note) return { error: 'no-note' };
    window.scrollTo(0, 0);
    const sy = window.scrollY;
    const r1 = note.getBoundingClientRect();
    const r2 = pos ? pos.getBoundingClientRect() : null;
    return {
      secOpen: sec ? sec.open : 'no-sec',
      noteHidden: note.hidden,
      noteDisplay: getComputedStyle(note).display,
      noteVisibility: getComputedStyle(note).visibility,
      r1: { x: r1.x, y: r1.y, w: r1.width, h: r1.height },
      r2: r2 ? { x: r2.x, y: r2.y, w: r2.width, h: r2.height } : null,
      scrollY: sy,
      bodyH: document.body.scrollHeight,
    };
  });
  const r1 = diag.r1;
  const r2 = diag.r2 || r1;
  const clip = (r1 && r1.w > 0)
    ? {
        x: Math.max(0, Math.min(r1.x, r2.x) - 8),
        y: Math.max(0, r1.y + diag.scrollY - 8),
        width: Math.max(r1.x + r1.w, r2.x + r2.w) - Math.min(r1.x, r2.x) + 16,
        height: (r2.y + r2.h) - r1.y + 16,
      }
    : null;

  const filename = `scenario-${scenario.case}.png`;
  const outPath = path.join(OUT_DIR, filename);
  if (clip && clip.height > 10) {
    await page.screenshot({ path: outPath, clip });
  } else {
    await page.screenshot({ path: outPath, fullPage: true });
  }
  await page.close();
  return { filename, label: scenario.label, case: scenario.case, debug: debugInfo, clip, diag };
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);
  console.log('→ Arrancando servidor :' + PORT);
  const server = await startServer();
  try {
    const puppeteer = resolvePuppeteer();
    const exec = findChromeHeadless();
    const browser = await puppeteer.launch({ headless: true, ...(exec ? { executablePath: exec } : {}) });
    console.log('→ Capturando ' + SCENARIOS.length + ' casuísticas...');
    for (const s of SCENARIOS) {
      const r = await captureScenario(browser, s);
      const clipInfo = r.clip ? `clip ${Math.round(r.clip.width)}x${Math.round(r.clip.height)}@${Math.round(r.clip.x)},${Math.round(r.clip.y)}` : 'FULL';
      console.log(`  ✓ ${r.case.padEnd(16)} ${clipInfo}  secOpen=${r.diag.secOpen} disp=${r.diag.noteDisplay} r1=${JSON.stringify(r.diag.r1)}`);
    }
    await browser.close();
  } catch (e) {
    console.error('✗ Error:', e.message);
  } finally {
    server.kill();
  }
  console.log('\nScreenshots en: ' + OUT_DIR);
}

main();

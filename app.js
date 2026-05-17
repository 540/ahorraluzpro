// AhorraLuz — app.js
// Comparador de tarifas de luz via QR de factura

(function () {
  'use strict';

  // --- Screens ---
  const screens = {
    landing: document.getElementById('screen-landing'),
    scanner: document.getElementById('screen-scanner'),
    loading: document.getElementById('screen-loading'),
    result: document.getElementById('screen-result'),
    error: document.getElementById('screen-error'),
  };

  let videoStream = null;
  let scannerActive = false;

  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  // --- Navigation ---
  document.getElementById('btn-scan').addEventListener('click', startScanner);
  document.getElementById('btn-back').addEventListener('click', stopAndGoHome);
  document.getElementById('btn-restart').addEventListener('click', stopAndGoHome);
  document.getElementById('btn-retry').addEventListener('click', startScanner);

  // Debug hook: en localhost exponemos processQR para que el script
  // scripts/verify-prepush.js pueda reproducir el flow sin pasar por la cámara.
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:') {
    window.__ahorraluzDebug = { processQR };
  }

  // --- Landing mockup carousel (vistosidad de portada) ---
  // Casos reales/representativos que rotan en la card de la landing.
  const MOCKUP_CASES = [
    {
      currentCompany: 'Iberdrola', bestCompany: 'Repsol Estable',
      currentAmount: 892, bestAmount: 658, savings: 234, pctDown: 26,
      profile: 'Familia 4 personas · Madrid',
      tags: [
        { text: '100% verde', icon: '🌿', green: true },
        { text: 'Sin permanencia', icon: '🔓', green: false }
      ]
    },
    {
      currentCompany: 'Endesa', bestCompany: 'Holaluz',
      currentAmount: 1340, bestAmount: 928, savings: 412, pctDown: 31,
      profile: 'Vivienda grande · Sevilla',
      tags: [
        { text: '100% verde', icon: '🌿', green: true },
        { text: 'Sin permanencia', icon: '🔓', green: false }
      ]
    },
    {
      currentCompany: 'Naturgy', bestCompany: 'Total Energies',
      currentAmount: 645, bestAmount: 458, savings: 187, pctDown: 29,
      profile: 'Piso 70m² · Valencia',
      tags: [
        { text: 'Precio fijo 12m', icon: '🔒', green: false }
      ]
    },
    {
      currentCompany: 'Iberdrola', bestCompany: 'Octopus Energy',
      currentAmount: 1158, bestAmount: 838, savings: 320, pctDown: 28,
      profile: 'Casa + autoconsumo · Barcelona',
      tags: [
        { text: 'Compensa excedentes', icon: '☀️', green: true },
        { text: 'Sin permanencia', icon: '🔓', green: false }
      ]
    },
  ];

  let mockupIdx = 0;
  let mockupTimer = null;
  const MOCKUP_ROTATE_MS = 5000;
  const MOCKUP_FADE_MS = 280;

  function formatEur(n) {
    return n.toLocaleString('es-ES') + ' €';
  }

  function animateCounter(el, from, to, duration) {
    if (!el) return;
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(from + (to - from) * eased);
      el.textContent = formatEur(value);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function renderMockupCase(c, animate) {
    const amountEl = document.getElementById('mockup-amount');
    if (!amountEl) return;
    document.getElementById('mockup-current-company').textContent = c.currentCompany;
    document.getElementById('mockup-current-amount').textContent = formatEur(c.currentAmount);
    document.getElementById('mockup-best-company').textContent = c.bestCompany;
    document.getElementById('mockup-best-amount').textContent = formatEur(c.bestAmount);
    document.getElementById('mockup-bar-label').textContent = `−${c.pctDown}% en tu factura anual`;
    document.getElementById('mockup-profile').textContent = c.profile;
    // tags
    const tagsEl = document.getElementById('mockup-tags');
    tagsEl.innerHTML = c.tags.map(t =>
      `<span class="mockup-tag ${t.green ? 'mockup-tag-green' : ''}">${t.icon} ${t.text}</span>`
    ).join('');
    // bar fill (use CSS transition)
    requestAnimationFrame(() => {
      document.getElementById('mockup-bar-fill').style.width = c.pctDown + '%';
    });
    // amount counter
    if (animate) {
      animateCounter(amountEl, 0, c.savings, 700);
    } else {
      amountEl.textContent = formatEur(c.savings);
    }
  }

  function renderMockupDots() {
    const dotsEl = document.getElementById('mockup-dots');
    if (!dotsEl) return;
    dotsEl.innerHTML = MOCKUP_CASES.map((_, i) =>
      `<span class="mockup-dot ${i === mockupIdx ? 'active' : ''}"></span>`
    ).join('');
  }

  function rotateMockup() {
    const card = document.querySelector('.landing-mockup');
    if (!card) return;
    card.classList.add('mockup-fading');
    setTimeout(() => {
      mockupIdx = (mockupIdx + 1) % MOCKUP_CASES.length;
      renderMockupCase(MOCKUP_CASES[mockupIdx], true);
      renderMockupDots();
      card.classList.remove('mockup-fading');
    }, MOCKUP_FADE_MS);
  }

  function initMockupCarousel() {
    if (!document.querySelector('.landing-mockup')) return;
    renderMockupCase(MOCKUP_CASES[0], true);
    renderMockupDots();
    if (mockupTimer) clearInterval(mockupTimer);
    mockupTimer = setInterval(rotateMockup, MOCKUP_ROTATE_MS);
  }

  // Arrancar el carrusel al cargar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMockupCarousel);
  } else {
    initMockupCarousel();
  }

  function stopAndGoHome() {
    stopScanner();
    showScreen('landing');
  }

  // --- QR Scanner (BarcodeDetector native API + jsQR fallback) ---
  async function startScanner() {
    // Mientras el usuario apunta al QR, vamos calentando el proxy en
    // background para que la primera llamada real ya no pague cold start.
    warmupProxy();
    showScreen('scanner');
    const video = document.getElementById('qr-video');
    const canvas = document.getElementById('qr-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    try {
      videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      video.srcObject = videoStream;
      await video.play();
      scannerActive = true;

      // Use native BarcodeDetector if available (Chrome 83+, Safari 17.2+)
      const hasNativeDetector = 'BarcodeDetector' in window;
      let detector = null;
      if (hasNativeDetector) {
        detector = new BarcodeDetector({ formats: ['qr_code'] });
        console.log('Using native BarcodeDetector');
      } else {
        console.log('Using jsQR fallback');
      }

      function scanFrame() {
        if (!scannerActive) return;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          if (detector) {
            // Native BarcodeDetector — better with screens, hardware-accelerated
            detector.detect(video).then(barcodes => {
              if (barcodes.length > 0) {
                onQrSuccess(barcodes[0].rawValue);
                return;
              }
              requestAnimationFrame(scanFrame);
            }).catch(() => requestAnimationFrame(scanFrame));
          } else {
            // jsQR fallback
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth',
            });
            if (code && code.data) {
              onQrSuccess(code.data);
              return;
            }
            requestAnimationFrame(scanFrame);
          }
        } else {
          requestAnimationFrame(scanFrame);
        }
      }

      requestAnimationFrame(scanFrame);

    } catch (err) {
      console.error('Error starting scanner:', err);
      showError(
        'No se pudo acceder a la c\u00e1mara',
        'Aseg\u00farate de dar permiso de c\u00e1mara a esta web. Si el problema persiste, prueba desde otro navegador.',
        { error: err.message }
      );
    }
  }

  function stopScanner() {
    scannerActive = false;
    if (videoStream) {
      videoStream.getTracks().forEach(t => t.stop());
      videoStream = null;
    }
    const video = document.getElementById('qr-video');
    if (video) video.srcObject = null;
  }

  // --- QR Success ---
  function onQrSuccess(decodedText) {
    stopScanner();
    console.log('QR decoded:', decodedText);

    // Validate it's a CNMC comparador URL
    if (!decodedText.includes('comparador.cnmc.gob.es') && !decodedText.includes('cnmc.es')) {
      showError(
        'Este QR no es de una factura de luz',
        'El c\u00f3digo QR debe ser el que aparece en tu factura de electricidad. Es una URL al comparador de la CNMC.',
        { qrContent: decodedText }
      );
      return;
    }

    processQR(decodedText);
  }

  // --- Parse QR URL ---
  function parseQrUrl(url) {
    const params = new URLSearchParams(new URL(url).search);
    const get = (key, fallback) => {
      const val = params.get(key);
      if (val == null) return fallback;
      // Remove units like [kW] or [kWh]
      return val.replace(/\[.*?\]/g, '');
    };
    const getFloat = (key, fallback) => {
      const val = parseFloat(get(key, String(fallback)));
      return isNaN(val) ? fallback : val;
    };
    const getInt = (key, fallback) => {
      const val = parseInt(get(key, String(fallback)));
      return isNaN(val) ? fallback : val;
    };

    // Parse tc (tipo contrato): can be numeric (0,1,2) or string like "F0"
    const tcRaw = get('tc', '0');
    let tipoContrato = parseInt(tcRaw);
    if (isNaN(tipoContrato)) {
      // F0/F1 = fijo, I0 = indexado, etc.
      tipoContrato = tcRaw.startsWith('I') ? 2 : 0;
    }

    return {
      cups: get('cups', ''),
      codigoPostal: get('cp', ''),
      bonoSocial: getInt('bs', 0),
      peaje: getInt('peaje', 18),
      comercializadora: get('com', ''),

      // Potencia contratada
      potenciaP1: getFloat('pP1', 0),
      potenciaP2: getFloat('pP2', 0),
      potenciaP3: getFloat('pP3', 0),
      potenciaP4: getFloat('pP4', 0),
      potenciaP5: getFloat('pP5', 0),
      potenciaP6: getFloat('pP6', 0),

      // Consumo anual por periodo
      consumoAnualP1: getFloat('caP1', 0),
      consumoAnualP2: getFloat('caP2', 0),
      consumoAnualP3: getFloat('caP3', 0),
      consumoAnualP4: getFloat('caP4', 0),
      consumoAnualP5: getFloat('caP5', 0),
      consumoAnualP6: getFloat('caP6', 0),

      // Fechas consumo anual (finA puede no estar presente)
      inicioAnual: get('iniA', ''),
      finAnual: get('finA', ''),

      // Consumo periodo facturado
      consumoFactP1: getFloat('cfP1', 0),
      consumoFactP2: getFloat('cfP2', 0),
      consumoFactP3: getFloat('cfP3', 0),
      consumoFactP4: getFloat('cfP4', 0),
      consumoFactP5: getFloat('cfP5', 0),
      consumoFactP6: getFloat('cfP6', 0),

      // Fechas periodo facturado
      inicioFact: get('iniF', ''),
      finFact: get('finF', ''),

      // Fecha facturacion
      fechaFacturacion: get('fFact', ''),

      // Importes
      importeTotal: getFloat('imp', 0),
      importeServicios: getFloat('impSA', 0),
      importeOtros: getFloat('impOtros', 0),
      importeOtrosSinIE: getFloat('impOtrosSinIE', 0),
      excedentes: getFloat('exc', 0),
      importePotencia: getFloat('impPot', 0),
      importeEnergia: getFloat('impEner', 0),

      // Potencia maxima demandada
      pmaxP1: getFloat('pmaxP1', 0),
      pmaxP2: getFloat('pmaxP2', 0),
      pmaxP3: getFloat('pmaxP3', 0),
      pmaxP4: getFloat('pmaxP4', 0),
      pmaxP5: getFloat('pmaxP5', 0),
      pmaxP6: getFloat('pmaxP6', 0),

      // Contrato
      tipoContrato: tipoContrato,
      tipoContratoRaw: tcRaw,
      finPenalizacion: get('finPen', ''),
      finContrato: get('finContrato', ''),
      tipoFactura: getInt('reg', 0),

      // Precios actuales (del contrato vigente)
      precioPotP1: getFloat('prP1', 0),
      precioPotP2: getFloat('prP2', 0),
      precioEnerP1: getFloat('prE1', 0),
      precioEnerP2: getFloat('prE2', 0),
      precioEnerP3: getFloat('prE3', 0),

      // Otros
      verde: getInt('verde', 0),
      ajuste: getFloat('ajuste', 0),
      finBS: getFloat('finBS', 0),
    };
  }

  // --- Build CNMC API params from QR data ---
  function buildCnmcParams(qrData) {
    const consumoAnualE = qrData.consumoAnualP1 + qrData.consumoAnualP2 + qrData.consumoAnualP3
      + qrData.consumoAnualP4 + qrData.consumoAnualP5 + qrData.consumoAnualP6;

    // Timestamps for date range (ms since epoch)
    // Handle missing dates robustly — some QRs don't include finA
    const now = Date.now();
    const yearAgo = now - (365 * 24 * 60 * 60 * 1000);

    function safeTimestamp(dateStr, fallback) {
      if (!dateStr) return fallback;
      const t = new Date(dateStr).getTime();
      return isNaN(t) ? fallback : t;
    }

    const dateInicio = safeTimestamp(qrData.inicioAnual, yearAgo);
    // If finA missing, estimate as iniA + 1 year
    const dateFin = safeTimestamp(qrData.finAnual, dateInicio + (365 * 24 * 60 * 60 * 1000));
    const fFact = safeTimestamp(qrData.fechaFacturacion, safeTimestamp(qrData.finFact, now));

    return {
      tipoSuministro: 'E',
      codigoPostal: qrData.codigoPostal,
      potencia: qrData.potenciaP1,
      potenciaPrimeraFranja: qrData.potenciaP1,
      potenciaSegundaFranja: qrData.potenciaP2 || qrData.potenciaP1,
      potenciaTerceraFranja: qrData.potenciaP3 || qrData.potenciaP1,
      potenciaCuartaFranja: qrData.potenciaP4 || qrData.potenciaP1,
      potenciaQuintaFranja: qrData.potenciaP5 || qrData.potenciaP1,
      potenciaSextaFranja: qrData.potenciaP6 || qrData.potenciaP1,
      consumoAnualE: consumoAnualE,
      consumoAnualEOrig: consumoAnualE,
      consumoPrimeraFranja: qrData.consumoAnualP1,
      consumoSegundaFranja: qrData.consumoAnualP2,
      consumoTerceraFranja: qrData.consumoAnualP3,
      consumoCuartaFranja: qrData.consumoAnualP4,
      consumoQuintaFranja: qrData.consumoAnualP5,
      consumoSextaFranja: qrData.consumoAnualP6,
      consumoAnualEQr: 0,
      consumoPrimeraFranjaQr: 0,
      consumoSegundaFranjaQr: 0,
      consumoTerceraFranjaQr: 0,
      consumoCuartaFranjaQr: 0,
      consumoQuintaFranjaQr: 0,
      consumoSextaFranjaQr: 0,
      consumoAnualEPQr: 0,
      consumoPrimeraFranjaPQr: 0,
      consumoSegundaFranjaPQr: 0,
      consumoTerceraFranjaPQr: 0,
      consumoCuartaFranjaPQr: 0,
      consumoQuintaFranjaPQr: 0,
      consumoSextaFranjaPQr: 0,
      tarifa: qrData.peaje === 19 ? 5 : 4,  // 4=2.0TD, 5=3.0TD
      consumoAnualG: 0,
      consumoAnualGOrig: 0,
      serviciosAdicionales: 2,
      permanencia: 2,
      vivienda: true,
      factura: true,
      energiaAutoconsumo: 0,
      idAuditoriaQR: 0,
      potenciaAutoconsumo: 0,
      revisionPrecios: 2,
      autoconsumo: false,
      importe: qrData.importeTotal || 0,
      mecanismoAjuste: 0,
      mecanismoAjusteIVA: 0,
      importeMecanismoAjustePunta: 0,
      importeMecanismoAjusteLlano: 0,
      importeMecanismoAjusteValle: 0,
      precioConsumoMecanismoAjusteTotal: 0,
      precioConsumoMecanismoAjustePunta: 0,
      precioConsumoMecanismoAjusteLlano: 0,
      precioConsumoMecanismoAjusteValle: 0,
      perfilConsumo: 10,
      dateInicio: dateInicio,
      dateFin: dateFin,
      tc: qrData.tipoContrato,
      bs: qrData.bonoSocial,
      impSA: qrData.importeServicios,
      impOtros: qrData.importeOtros || 0,
      exc: qrData.excedentes || 0,
      reg: qrData.tipoFactura || 0,
      impOtrosConIE: 0,
      impOtrosSinIE: qrData.importeOtrosSinIE || 0,
      pmaxP1: qrData.pmaxP1 || 0,
      pmaxP2: qrData.pmaxP2 || 0,
      fFact: fFact,
      dtoBS: 0,
      finBS: qrData.finBS || 0,
      ajuste: qrData.ajuste || 0,
      impPot: qrData.importePotencia || 0,
      impEner: qrData.importeEnergia || 0,
      dto: 0,
      prP1: qrData.precioPotP1 || 0,
      prP2: qrData.precioPotP2 || 0,
      prE1: qrData.precioEnerP1 || 0,
      prE2: qrData.precioEnerP2 || 0,
      prE3: qrData.precioEnerP3 || 0,
      cfP1flex: 0,
      cfP2flex: 0,
      cambio: 0,
      promo: 0,
      verde: qrData.verde || 0,
      rev: 0,
      trampeo: 0,
      cups: qrData.cups ? qrData.cups.slice(-4) : '0000',
    };
  }

  // --- CNMC API ---
  // Proxy needed: CNMC nginx blocks requests with Origin header (403)
  // Deploy proxy-worker.js to Cloudflare Workers and set URL here
  // For local dev: use direct URL (works without Origin from file://)
  // Lista ordenada de proxies. La app prueba en orden hasta que uno responda.
  // Cuando despliegues Vercel, pon su URL como primer elemento.
  // Para testing local, puedes inyectar uno con localStorage.setItem('ahorraluz.proxy', 'https://...').
  const PROXY_BASES = [
    // Vercel proxy: el path se pasa como query param ?path=<endpoint>
    // Descomentar y poner la URL real cuando despliegues api/cnmc.js a Vercel:
    // 'https://AHORRALUZ.vercel.app/api/cnmc?path=',
    'https://rough-sun-c2a5.iker-267.workers.dev/api/publico/',
  ];
  // Override puntual desde localStorage (sin redeploy).
  const lsProxy = (typeof localStorage !== 'undefined' && localStorage.getItem('ahorraluz.proxy')) || '';
  if (lsProxy) PROXY_BASES.unshift(lsProxy);

  const CNMC_DIRECT = 'https://comparador.cnmc.gob.es/api/publico/';
  // Timeouts muy generosos: el endpoint /ofertas/electricidad de CNMC
  // puede tardar 15-25s desde algunos edges de Cloudflare *.workers.dev
  // (Bot Fight Mode + challenges JS). Antes de introducir AbortController
  // no había timeout y la app funcionaba aunque lenta — preferimos que
  // tarde a que aborte. El timeout es solo protección extrema.
  // Si tarda más de 90s, algo va mal de verdad.
  const PROXY_TIMEOUT_MS = 90000;
  const DIRECT_TIMEOUT_MS = 30000;

  // Diagnóstico del último intento — lo expone showError para que en
  // caso de fallo sepamos qué pasó realmente con el proxy.
  let lastApiDiag = null;

  // Warm-up: ping a /health (Vercel) o /health del worker para que el
  // proxy esté caliente cuando el usuario termine de escanear.
  function warmupProxy() {
    PROXY_BASES.forEach(base => {
      let healthUrl;
      if (base.includes('?path=')) {
        healthUrl = base + 'health';
      } else {
        healthUrl = base.replace(/\/api\/publico\/?$/, '/health');
      }
      fetch(healthUrl, { cache: 'no-store' }).catch(() => {});
    });
  }

  // Fetch con timeout via AbortController. Si el endpoint no responde en
  // `ms` cancelamos para no quedar colgados en el paso intermedio.
  async function fetchWithTimeout(url, ms, init = {}) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
      return await fetch(url, { ...init, signal: ctrl.signal });
    } finally {
      clearTimeout(t);
    }
  }

  function buildProxyUrl(base, pathWithQuery) {
    // Vercel style: base = "https://x.vercel.app/api/cnmc?path="
    //   pathWithQuery = "ofertas/electricidad?cp=31006&pot=3"
    //   resultado = "https://x.vercel.app/api/cnmc?path=ofertas/electricidad&cp=31006&pot=3"
    if (base.endsWith('?path=')) {
      const qIdx = pathWithQuery.indexOf('?');
      if (qIdx === -1) return base + pathWithQuery;
      const endpoint = pathWithQuery.slice(0, qIdx);
      const query = pathWithQuery.slice(qIdx + 1);
      return base + endpoint + '&' + query;
    }
    // Cloudflare style: base ya termina en /api/publico/
    return base + pathWithQuery;
  }

  async function fetchFromApi(path) {
    const diag = { proxies: [], direct: null, startedAt: Date.now() };

    // 1) Probar cada proxy en orden hasta que uno responda 2xx
    for (const base of PROXY_BASES) {
      const t = Date.now();
      const url = buildProxyUrl(base, path);
      try {
        const response = await fetchWithTimeout(
          url,
          PROXY_TIMEOUT_MS,
          { headers: { 'Accept': 'application/json' } }
        );
        const entry = { base: base.slice(0, 50), status: response.status, ms: Date.now() - t };
        diag.proxies.push(entry);
        if (response.ok) {
          lastApiDiag = diag;
          return response;
        }
        console.warn(`Proxy ${entry.base}... ${response.status} en ${entry.ms}ms — siguiente fallback`);
      } catch (e) {
        diag.proxies.push({ base: base.slice(0, 50), error: e.name + ': ' + e.message, ms: Date.now() - t });
        console.warn(`Proxy ${base.slice(0, 50)} ${e.name} en ${Date.now() - t}ms — siguiente fallback`);
      }
    }

    // 2) Directo: funciona desde localhost/file:// y curl. En producción
    //    cross-origin probablemente devuelva 403 por el Origin header.
    const tDirect = Date.now();
    try {
      const response = await fetchWithTimeout(
        `${CNMC_DIRECT}${path}`,
        DIRECT_TIMEOUT_MS,
        { headers: { 'Accept': 'application/json' } }
      );
      diag.direct = { status: response.status, ms: Date.now() - tDirect };
      lastApiDiag = diag;
      return response;
    } catch (e) {
      diag.direct = { error: e.name + ': ' + e.message, ms: Date.now() - tDirect };
      lastApiDiag = diag;
      throw e;
    }
  }

  async function fetchOffers(params) {
    const qs = Object.entries(params)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

    const path = `ofertas/electricidad?${qs}`;
    console.log('Fetching offers, params count:', Object.keys(params).length);

    const response = await fetchFromApi(path);

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`API error ${response.status}: ${body.slice(0, 200)}`);
    }

    return response.json();
  }

  // Clean company names: Title Case, remove legal suffixes
  function cleanCompanyName(raw) {
    if (!raw) return '';
    let name = raw.trim().replace(/"/g, '');
    // Remove legal suffixes (with or without dots, commas)
    name = name.replace(/,?\s*(S\.?L\.?U\.?|S\.?L\.?|S\.?A\.?U\.?|S\.?A\.?|SLU|S\.?COOP\.?|SOCIEDAD LIMITADA|SOCIEDAD AN[OÓ]NIMA)\s*\.?\s*$/i, '');
    name = name.trim().replace(/[,.\s]+$/, '');
    // Title Case if all caps
    if (name === name.toUpperCase() && name.length > 3) {
      name = name.toLowerCase()
        .replace(/(?:^|\s|[-/])\S/g, c => c.toUpperCase())
        // Keep common lowercase words
        .replace(/\s(De|Del|Y|La|El|Los|Las|En)\s/g, (m) => m.toLowerCase());
    }
    return name;
  }

  async function fetchCompanyName(code) {
    if (!code) return 'Tu comercializadora';
    try {
      const response = await fetchFromApi(`nombrecodigo/${code}`);
      if (response.ok) {
        const raw = await response.text();
        const clean = cleanCompanyName(raw);
        if (clean) return clean;
      }
    } catch (e) {
      // ignore
    }
    return code;
  }

  // --- Process QR ---
  async function processQR(url) {
    showScreen('loading');
    resetLoadingSteps();

    try {
      // Step 1: QR read
      await completeStep('step-qr', 500);

      // Step 2: Parse data
      let qrData;
      try {
        qrData = parseQrUrl(url);
        console.log('Parsed QR data:', JSON.stringify(qrData, null, 2));
      } catch (e) {
        showError(
          'QR no v\u00e1lido',
          'El c\u00f3digo QR no contiene datos v\u00e1lidos de una factura de luz. Aseg\u00farate de escanear el QR correcto.',
          { error: e.message, qrUrl: url, stack: e.stack }
        );
        return;
      }
      await completeStep('step-data', 600);

      // Validate minimum data
      const consumoTotal = qrData.consumoAnualP1 + qrData.consumoAnualP2 + qrData.consumoAnualP3;
      if (consumoTotal === 0 && qrData.importeTotal === 0) {
        showError(
          'Datos insuficientes en el QR',
          'El QR de tu factura no contiene datos de consumo. Esto puede ocurrir si la comercializadora no ha informado correctamente el QR. Contacta con tu comercializadora.'

        );
        return;
      }

      // Step 3: Fetch offers
      activateStep('step-offers');
      const cnmcParams = buildCnmcParams(qrData);
      // El endpoint /ofertas/electricidad de CNMC tarda 8-25s.
      // Cambiamos el texto progresivamente para que el usuario sepa
      // que sigue trabajando y no piense que se atascó.
      const tip6 = setTimeout(() => {
        const el = document.querySelector('#step-offers .step-text');
        if (el) el.textContent = 'Consultando la CNMC (puede tardar)...';
      }, 6000);
      const tip15 = setTimeout(() => {
        const el = document.querySelector('#step-offers .step-text');
        if (el) el.textContent = 'La CNMC está respondiendo lento, sigue trabajando...';
      }, 15000);
      const tip30 = setTimeout(() => {
        const el = document.querySelector('#step-offers .step-text');
        if (el) el.textContent = 'Casi listo, no cierres la pestaña...';
      }, 30000);
      let offers;
      let apiError = null;
      try {
        offers = await fetchOffers(cnmcParams);
      } catch (e) {
        console.error('CNMC API failed:', e);
        apiError = e;
      } finally {
        clearTimeout(tip6);
        clearTimeout(tip15);
        clearTimeout(tip30);
      }

      if (apiError || !offers || !offers.resultadoComparador || offers.resultadoComparador.length === 0) {
        const reason = apiError
          ? `Error de conexi\u00f3n: ${apiError.message}`
          : 'El comparador no ha devuelto ofertas para tu perfil de consumo';
        showError(
          'No hemos podido obtener ofertas reales',
          `${reason}. Puedes consultar directamente el comparador oficial de la CNMC escaneando el QR con la c\u00e1mara de tu m\u00f3vil (sin usar esta app) o visitando comparador.cnmc.gob.es.`,
          {
            error: apiError ? apiError.message : 'Sin ofertas en la respuesta',
            apiDiag: lastApiDiag,
            codigoPostal: cnmcParams.codigoPostal,
            consumoAnualE: cnmcParams.consumoAnualE,
            potencia: cnmcParams.potencia,
            tarifa: cnmcParams.tarifa,
            ofertasRecibidas: offers ? (offers.resultadoComparador || []).length : 0,
          }
        );
        return;
      }
      await completeStep('step-offers', 300);

      // Step 4: Calculate
      activateStep('step-calc');

      const companyName = await fetchCompanyName(qrData.comercializadora);
      const currentAnnualCost = estimateAnnualCost(qrData);
      const results = processOffers(offers, qrData, currentAnnualCost, companyName);
      await completeStep('step-calc', 400);

      // Show results
      displayConsumption(qrData, companyName);
      displayResults(results, qrData);
      displayRecomendaciones(qrData);

    } catch (e) {
      console.error('Error processing QR:', e);
      showError(
        'Error al procesar tu factura',
        'Ha ocurrido un error inesperado. Por favor, int\u00e9ntalo de nuevo.',
        { error: e.message, stack: e.stack }
      );
    }
  }

  // --- Cost estimation from QR data ---
  function estimateAnnualCost(qrData) {
    // Method 1 (BEST): Use contract prices from QR × annual consumption
    // This is the most accurate because it uses real annual consumption
    // and the actual prices from the user's contract
    if (qrData.precioEnerP1 > 0 && qrData.precioPotP1 > 0) {
      const consumoTotal = qrData.consumoAnualP1 + qrData.consumoAnualP2 + qrData.consumoAnualP3;
      if (consumoTotal > 0) {
        const costePotencia = (qrData.potenciaP1 * qrData.precioPotP1)
                            + ((qrData.potenciaP2 || qrData.potenciaP1) * qrData.precioPotP2);
        const costeEnergia = (qrData.consumoAnualP1 * qrData.precioEnerP1)
                           + (qrData.consumoAnualP2 * qrData.precioEnerP2)
                           + (qrData.consumoAnualP3 * qrData.precioEnerP3);
        const subtotal = costePotencia + costeEnergia;
        const impElectrico = subtotal * 0.0511;
        const base = subtotal + impElectrico;
        const iva = base * 0.21;
        return base + iva;
      }
    }

    // Method 2: Estimate from consumption with average market prices
    const consumoTotal = qrData.consumoAnualP1 + qrData.consumoAnualP2 + qrData.consumoAnualP3;
    const potencia = qrData.potenciaP1 || 3.45;

    if (consumoTotal > 0) {
      // Average 2.0TD prices (2025-2026 Spain)
      const precioEnergiaMedia = 0.14;
      const precioPotP1Media = 30.67;
      const precioPotP2Media = 7.30;

      const costeEnergia = consumoTotal * precioEnergiaMedia;
      const costePotencia = (potencia * precioPotP1Media) + (potencia * precioPotP2Media);
      const subtotal = costeEnergia + costePotencia;
      const impElectrico = subtotal * 0.0511;
      const base = subtotal + impElectrico;
      const iva = base * 0.21;
      return base + iva;
    }

    // Method 3 (FALLBACK): Extrapolate from last bill
    if (qrData.importeTotal > 0) {
      const factStart = qrData.inicioFact ? new Date(qrData.inicioFact) : null;
      const factEnd = qrData.finFact ? new Date(qrData.finFact) : null;

      if (factStart && factEnd && !isNaN(factStart) && !isNaN(factEnd)) {
        const days = (factEnd - factStart) / (1000 * 60 * 60 * 24);
        if (days > 0 && days < 365) {
          return (qrData.importeTotal / days) * 365;
        }
      }
      return qrData.importeTotal * 6;
    }

    return 0;
  }

  // --- Process CNMC offers ---
  function processOffers(apiResponse, qrData, currentAnnualCost, companyName) {
    const offers = apiResponse.resultadoComparador || [];

    // Sort by second year cost (more representative than promo first year)
    const sorted = offers
      // Ordenamos por importe del PRIMER año (con descuento de bienvenida si lo hay).
      // Filosofía: la app empuja al usuario al precio más barato hoy; si caduca el
      // descuento al año, se puede volver a comparar y cambiar otra vez.
      .filter(o => o.importePrimerAnio != null && o.importePrimerAnio > 0)
      .sort((a, b) => a.importePrimerAnio - b.importePrimerAnio);

    if (sorted.length === 0) {
      return { current: { company: companyName, amount: currentAnnualCost }, best: null, alternatives: [], savings: 0, totalOffers: 0, alreadyBest: false, currentCompanyOffers: [] };
    }

    // Find the user's current company offers in the ranking
    const companyNameUpper = companyName.toUpperCase();
    const currentCompanyOffers = sorted
      .map((o, idx) => ({ ...o, rank: idx + 1 }))
      .filter(o => companyNameUpper.includes(o.comercializadora.toUpperCase().split(' ')[0]) ||
                    o.comercializadora.toUpperCase().includes(companyNameUpper.split(' ')[0]));

    // Check if current company has the best (or near-best) offer
    const bestCurrentOffer = currentCompanyOffers.length > 0 ? currentCompanyOffers[0] : null;
    const alreadyBest = bestCurrentOffer && bestCurrentOffer.rank <= 3;

    const best = sorted[0];

    // Build alternatives: top offers excluding the best
    // If user already has a top offer, show the competition instead
    const altCandidates = sorted.slice(1);
    const alt1 = altCandidates[0] || null;
    const alt2 = altCandidates[1] || null;

    function mapOffer(o) {
      return {
        company: cleanCompanyName(o.comercializadora || ''),
        offerName: o.oferta || '',
        // amount = importe del primer año (con descuento si lo hay).
        // secondYearAmount = importe estable a partir del 2º año.
        // Si difieren, hay descuento de bienvenida.
        amount: o.importePrimerAnio,
        secondYearAmount: o.importeSegundoAnio,
        hasDiscount: o.importePrimerAnio < o.importeSegundoAnio,
        discountAmount: Math.max(0, o.importeSegundoAnio - o.importePrimerAnio),
        hasPenalty: o.penalizacion,
        isGreen: o.verde,
      };
    }

    return {
      current: {
        company: companyName,
        amount: currentAnnualCost,
      },
      best: mapOffer(best),
      alternatives: [alt1, alt2].filter(Boolean).map(mapOffer),
      savings: currentAnnualCost - best.importePrimerAnio,
      totalOffers: sorted.length,
      alreadyBest: alreadyBest,
      currentCompanyBest: bestCurrentOffer ? mapOffer(bestCurrentOffer) : null,
      currentCompanyRank: bestCurrentOffer ? bestCurrentOffer.rank : null,
    };
  }

  // --- Classify scenario: primary case + modifiers ---
  // Centraliza la lógica de qué tipo de usuario es, para que cada render
  // pueda decidir tono, jerarquía visual y qué banners contextuales mostrar.
  function classifyScenario(results, qrData) {
    const out = { primaryCase: 'normal-savings', modifiers: {} };
    const m = out.modifiers;

    // === primaryCase ===
    if (!results || !results.best) {
      out.primaryCase = 'no-offers';
      return out;
    }
    if (results.alreadyBest && results.currentCompanyRank === 1) {
      out.primaryCase = 'rank-1';
    } else if (results.alreadyBest) {
      out.primaryCase = 'rank-top3';
    } else if (results.savings <= 0) {
      out.primaryCase = 'already-cheap';
    } else {
      const pct = results.savings / Math.max(results.current.amount, 1);
      if (pct >= 0.15) out.primaryCase = 'big-savings';
      else if (pct >= 0.05) out.primaryCase = 'normal-savings';
      else out.primaryCase = 'small-savings';
    }

    // === modifiers ===
    // sameCompanyBest — la mejor oferta es de su comercializadora actual
    if (results.best && results.current) {
      const a = (results.current.company || '').toUpperCase().split(' ')[0];
      const b = (results.best.company || '').toUpperCase().split(' ')[0];
      m.sameCompanyBest = a && b && (a.includes(b) || b.includes(a));
    }

    // userHasPermanencia — usuario tiene permanencia activa
    if (qrData && qrData.finPenalizacion) {
      const finPen = new Date(qrData.finPenalizacion);
      const now = new Date();
      if (!isNaN(finPen) && finPen > now) {
        const dias = Math.ceil((finPen - now) / 86400000);
        // Penalización estándar: 5% del importe del consumo pendiente
        const mesesRestantes = dias / 30;
        const consumoAnual = qrData.importeTotal && qrData.consumoFactP1
          ? (results.current.amount || 0)
          : (results.current.amount || 0);
        const penalizacionEstim = (consumoAnual / 12) * mesesRestantes * 0.05;
        m.userHasPermanencia = {
          dias: dias,
          fecha: finPen,
          penalizacionEstim: penalizacionEstim,
          compensaCambiar: results.savings > 0
            ? (results.savings / 12) * mesesRestantes > penalizacionEstim
            : false
        };
      }
    }

    // bestHasPermanencia — la oferta nueva pide permanencia
    if (results.best && results.best.hasPenalty) {
      m.bestHasPermanencia = true;
    }

    // bonoSocialEligible — proxy: consumo bajo + potencia reducida + no tiene ya bono
    if (qrData) {
      const totalConsumo = (qrData.consumoAnualP1 || 0) + (qrData.consumoAnualP2 || 0)
        + (qrData.consumoAnualP3 || 0);
      const tienePotenciaBaja = qrData.potenciaP1 > 0 && qrData.potenciaP1 <= 10;
      const tieneConsumoBajo = totalConsumo > 0 && totalConsumo < 3000;
      if (tienePotenciaBaja && tieneConsumoBajo && !qrData.bonoSocial) {
        m.bonoSocialEligible = true;
      }
      if (qrData.bonoSocial && qrData.bonoSocial > 0) {
        m.bonoSocialActivo = true;
      }
    }

    // hasAutoconsumo — tiene excedentes solares
    if (qrData && qrData.excedentes && qrData.excedentes > 0) {
      m.hasAutoconsumo = qrData.excedentes;
    }

    // Potencia dimensionamiento
    if (qrData) {
      const pmax = Math.max(
        qrData.pmaxP1 || 0, qrData.pmaxP2 || 0, qrData.pmaxP3 || 0,
        qrData.pmaxP4 || 0, qrData.pmaxP5 || 0, qrData.pmaxP6 || 0
      );
      const pContratada = qrData.potenciaP1 || 0;
      if (pmax > 0 && pContratada > 0) {
        const ratio = pmax / pContratada;
        if (ratio < 0.6) {
          const sugerida = Math.max(2.0, Math.ceil(pmax * 1.15 * 10) / 10);
          m.potOverdimensioned = {
            pmax: pmax,
            actual: pContratada,
            sugerida: sugerida,
            ahorroEstim: Math.round((pContratada - sugerida) * 38)
          };
        } else if (ratio > 0.9) {
          m.potUnderdimensioned = { pmax: pmax, actual: pContratada };
        }
      }
    }

    // is30TD — pequeño comercio (peaje 19)
    if (qrData && qrData.peaje === 19) {
      m.is30TD = true;
    }

    // contratoIndexado — el actual es indexado
    if (qrData && qrData.tipoContrato === 2) {
      m.contratoIndexado = true;
    }

    // similarTop3 — top 3 ofertas con <2% de diferencia entre ellas
    if (results.best && results.alternatives && results.alternatives.length >= 2) {
      const top1 = results.best.amount;
      const top3 = results.alternatives[1].amount;
      if (top1 > 0 && (top3 - top1) / top1 < 0.02) {
        m.similarTop3 = true;
      }
    }

    // oldInvoice — factura de hace >6 meses
    if (qrData && qrData.fechaFacturacion) {
      const fFact = new Date(qrData.fechaFacturacion);
      if (!isNaN(fFact)) {
        const mesesAtras = (Date.now() - fFact.getTime()) / (1000 * 60 * 60 * 24 * 30);
        if (mesesAtras > 6) {
          m.oldInvoice = Math.round(mesesAtras);
        }
      }
    }

    // isRegularizacion — reg=1
    if (qrData && qrData.tipoFactura === 1) {
      m.isRegularizacion = true;
    }

    // veryHighValle — >55% del consumo en P3
    if (qrData) {
      const total = (qrData.consumoAnualP1 || 0) + (qrData.consumoAnualP2 || 0)
        + (qrData.consumoAnualP3 || 0);
      if (total > 0 && (qrData.consumoAnualP3 / total) > 0.55) {
        m.veryHighValle = Math.round((qrData.consumoAnualP3 / total) * 100);
      }
    }

    return out;
  }

  // --- Display consumption data from QR ---
  function displayConsumption(qrData, companyName) {
    const p1 = qrData.consumoAnualP1;
    const p2 = qrData.consumoAnualP2;
    const p3 = qrData.consumoAnualP3;
    const consumoTotal = p1 + p2 + p3 + qrData.consumoAnualP4 + qrData.consumoAnualP5 + qrData.consumoAnualP6;
    const maxPeriod = Math.max(p1, p2, p3, 1);

    // Profile card
    document.getElementById('user-comercializadora').textContent = companyName;
    const tipos = { 0: 'Precio fijo', 1: 'Fijo no est\u00e1ndar', 2: 'Indexado' };
    document.getElementById('user-tipo-contrato').textContent = tipos[qrData.tipoContrato] || '—';

    document.getElementById('user-consumo-total').textContent = `${Math.round(consumoTotal).toLocaleString('es-ES')} kWh`;

    // Consumption bars with percentages
    const pctP1 = consumoTotal > 0 ? Math.round(p1 / consumoTotal * 100) : 0;
    const pctP2 = consumoTotal > 0 ? Math.round(p2 / consumoTotal * 100) : 0;
    const pctP3 = consumoTotal > 0 ? Math.round(p3 / consumoTotal * 100) : 0;

    document.getElementById('user-consumo-p1').textContent = `${Math.round(p1).toLocaleString('es-ES')} kWh (${pctP1}%)`;
    document.getElementById('user-consumo-p2').textContent = `${Math.round(p2).toLocaleString('es-ES')} kWh (${pctP2}%)`;
    document.getElementById('user-consumo-p3').textContent = `${Math.round(p3).toLocaleString('es-ES')} kWh (${pctP3}%)`;

    // Animate bars
    setTimeout(() => {
      document.getElementById('bar-p1').style.width = `${(p1 / maxPeriod) * 100}%`;
      document.getElementById('bar-p2').style.width = `${(p2 / maxPeriod) * 100}%`;
      document.getElementById('bar-p3').style.width = `${(p3 / maxPeriod) * 100}%`;
    }, 100);

    document.getElementById('user-potencia').textContent = `${qrData.potenciaP1} kW`;

    // Periodo
    const formatDate = (d) => {
      const date = new Date(d);
      return isNaN(date) ? '' : date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    };
    if (qrData.inicioAnual) {
      const inicio = formatDate(qrData.inicioAnual);
      const fin = qrData.finAnual ? formatDate(qrData.finAnual) : 'actualidad';
      document.getElementById('user-periodo').textContent = `${inicio} — ${fin}`;
    } else {
      document.getElementById('user-periodo').textContent = '\u00DAltimo a\u00f1o';
    }

    // Bill breakdown
    const hasBillDetail = qrData.importePotencia > 0 || qrData.importeEnergia > 0;
    if (hasBillDetail) {
      document.getElementById('bill-potencia').textContent = `${qrData.importePotencia.toFixed(2)} \u20AC`;
      document.getElementById('bill-energia').textContent = `${qrData.importeEnergia.toFixed(2)} \u20AC`;
      const otros = Math.max(0, (qrData.importeTotal || 0) - (qrData.importePotencia || 0) - (qrData.importeEnergia || 0));
      document.getElementById('bill-otros').textContent = `${otros.toFixed(2)} \u20AC`;
    } else if (qrData.importeTotal > 0) {
      // No detail breakdown available, hide rows and just show total
      document.getElementById('bill-breakdown').querySelectorAll('.bill-row:not(.bill-row-total)').forEach(r => r.style.display = 'none');
    } else {
      document.getElementById('bill-breakdown').style.display = 'none';
    }

    if (qrData.importeTotal > 0) {
      document.getElementById('bill-total').textContent = `${qrData.importeTotal.toFixed(2)} \u20AC`;
    }
  }

  // --- Recomendaciones técnicas (solo lo que NO se ve en "Tu nuevo contrato") ---
  // Se quedaron: tarifa óptima (recomendación, no se ve en chips) y €/kWh real (diagnóstico).
  // Potencia y permanencia se gestionan en chips + banners del contrato.
  function displayRecomendaciones(qrData) {
    // Tipo de tarifa óptima según distribución horaria del consumo
    const cP1 = qrData.consumoAnualP1 || 0;
    const cP2 = qrData.consumoAnualP2 || 0;
    const cP3 = qrData.consumoAnualP3 || 0;
    const totalConsumo = cP1 + cP2 + cP3;
    const tarValEl = document.getElementById('reco-tarifa-value');
    const tarDetEl = document.getElementById('reco-tarifa-detail');
    if (totalConsumo > 0) {
      const pctValle = cP3 / totalConsumo;
      const pctPunta = cP1 / totalConsumo;
      const pctLlano = cP2 / totalConsumo;
      if (pctValle >= 0.45) {
        tarValEl.innerHTML = glossaryTerm('discriminacion-horaria', 'Discriminación horaria');
        tarDetEl.innerHTML = `Consumes <strong>${Math.round(pctValle * 100)}%</strong> en valle. Tarifas con descuento nocturno te beneficiarán más.`;
      } else if (pctPunta >= 0.45) {
        tarValEl.textContent = 'Tarifa plana';
        tarDetEl.innerHTML = `Tu consumo en punta es alto (<strong>${Math.round(pctPunta * 100)}%</strong>). Una tarifa fija sin discriminación suele convenirte.`;
      } else {
        tarValEl.innerHTML = glossaryTerm('2.0td', '2.0TD estándar');
        tarDetEl.innerHTML = `Consumo equilibrado (P:${Math.round(pctPunta*100)}% L:${Math.round(pctLlano*100)}% V:${Math.round(pctValle*100)}%). La 2.0TD genérica te funciona bien.`;
      }
    } else {
      document.getElementById('reco-tarifa-card').style.display = 'none';
    }

    // Coste real €/kWh vs media nacional (~0.20 €/kWh PVPC promedio reciente)
    const imp = qrData.importeTotal || 0;
    const consumoFact = (qrData.consumoFactP1 || 0) + (qrData.consumoFactP2 || 0) + (qrData.consumoFactP3 || 0);
    const costValEl = document.getElementById('reco-coste-value');
    const costDetEl = document.getElementById('reco-coste-detail');
    if (imp > 0 && consumoFact > 0) {
      const costeKwh = imp / consumoFact;
      const media = 0.20;
      const dif = (costeKwh / media - 1) * 100;
      costValEl.textContent = `${costeKwh.toFixed(3)} €/kWh`;
      if (dif > 10) {
        costDetEl.innerHTML = `<strong>${Math.round(dif)}% por encima</strong> de la media nacional. Hay margen claro de ahorro.`;
        document.getElementById('reco-coste-card').classList.add('reco-card-alert');
      } else if (dif < -10) {
        costDetEl.innerHTML = `<strong>${Math.abs(Math.round(dif))}% por debajo</strong> de la media. Tarifa muy competitiva.`;
        document.getElementById('reco-coste-card').classList.add('reco-card-good');
      } else {
        costDetEl.innerHTML = `Cerca de la media nacional (${media.toFixed(2)} €/kWh).`;
      }
    } else {
      document.getElementById('reco-coste-card').style.display = 'none';
    }
  }

  // --- Render "Tu nuevo contrato": chips comparativa + tabla avanzada ---
  // === Tabla "Tu nuevo contrato": 3 columnas (atributo / actual / propuesto) ===
  function renderContractComparison(results, qrData, scenario) {
    if (!results || !results.best) {
      document.getElementById('section-contract').style.display = 'none';
      return;
    }
    document.getElementById('section-contract').style.display = '';

    const titleEl = document.getElementById('contract-section-title');
    if (scenario.primaryCase === 'rank-1' || scenario.primaryCase === 'rank-top3') {
      titleEl.textContent = 'Tu contrato vs la competencia';
    } else {
      titleEl.textContent = 'Tu nuevo contrato';
    }

    // === Headers ===
    document.getElementById('contract-actual-company').textContent = results.current.company;
    document.getElementById('contract-nuevo-company').textContent = results.best.company;

    // === Datos del contrato actual ===
    const tipoActualKey = qrData.tipoContrato === 2 ? 'indexado'
      : qrData.tipoContrato === 1 ? 'precio-fijo'
      : 'pvpc';
    const tipoActualLabel = qrData.tipoContrato === 2 ? 'Indexado'
      : qrData.tipoContrato === 1 ? 'Fijo no estándar'
      : 'PVPC / Fijo';
    const potActualStr = qrData.potenciaP1 ? `${qrData.potenciaP1.toFixed(2)} kW` : '—';
    let permActualStr = 'Sin permanencia';
    if (qrData.finPenalizacion) {
      const finPen = new Date(qrData.finPenalizacion);
      if (!isNaN(finPen) && finPen > new Date()) {
        permActualStr = `Hasta ${finPen.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}`;
      }
    }
    // Insertamos tooltips solo en la fila ACTUAL (no duplicar en propuesto, ya está claro)
    document.getElementById('chip-actual-tipo').innerHTML = glossaryTerm(tipoActualKey, tipoActualLabel);
    document.getElementById('chip-actual-potencia').innerHTML = glossaryTerm('potencia', potActualStr);
    document.getElementById('chip-actual-permanencia').innerHTML = glossaryTerm('permanencia', permActualStr);
    document.getElementById('chip-actual-origen').innerHTML = glossaryTerm('mix-nacional', 'Mix nacional');
    document.getElementById('chip-actual-pago').textContent = `${formatCurrency(results.current.amount)}/año`;

    // === Datos del contrato propuesto ===
    const best = results.best;
    const pot = scenario.modifiers.potOverdimensioned;
    const potNuevoStr = pot
      ? `${pot.sugerida.toFixed(1)} kW`
      : potActualStr;
    const permNuevoStr = best.hasPenalty ? '12 meses' : 'Sin permanencia';
    const origenNuevoStr = best.isGreen ? '100% renovable' : 'Mix nacional';
    document.getElementById('chip-nuevo-tipo').innerHTML = glossaryTerm('precio-fijo', 'Precio fijo');
    document.getElementById('chip-nuevo-potencia').textContent = potNuevoStr;
    document.getElementById('chip-nuevo-permanencia').textContent = permNuevoStr;
    document.getElementById('chip-nuevo-origen').innerHTML = best.isGreen
      ? glossaryTerm('100-renovable', '100% renovable')
      : 'Mix nacional';
    // Pago propuesto: si hay descuento de bienvenida, mostrar ambos años
    document.getElementById('chip-actual-pago').textContent = `${formatCurrency(results.current.amount)}/año`;
    const pagoEl = document.getElementById('chip-nuevo-pago');
    if (best.hasDiscount) {
      pagoEl.innerHTML = `${formatCurrency(best.amount)}/año <span class="contract-discount-tag">1er año</span>` +
        `<span class="contract-discount-after">luego ${formatCurrency(best.secondYearAmount)}/año</span>`;
    } else {
      pagoEl.textContent = `${formatCurrency(best.amount)}/año`;
    }
    const tipoNuevoLabel = 'Precio fijo';

    // === Marcar filas según cambian (verde/amarillo/neutral) ===
    function classify(rowId, kind) {
      const row = document.getElementById(rowId);
      if (!row) return;
      row.classList.remove('contract-row-good', 'contract-row-warn', 'contract-row-same');
      if (kind) row.classList.add('contract-row-' + kind);
    }
    // Tipo: si cambia a precio fijo y antes era indexado → bueno; sin cambio → same
    classify('contract-row-tipo', tipoActualLabel === tipoNuevoLabel ? 'same'
      : qrData.tipoContrato === 2 ? 'good' : null);
    // Potencia: cambia a sugerida → good; sin cambio → same
    classify('contract-row-potencia', pot ? 'good' : 'same');
    // Permanencia: gana libertad → good; pierde libertad → warn; igual → same
    if (best.hasPenalty && permActualStr === 'Sin permanencia') classify('contract-row-permanencia', 'warn');
    else if (!best.hasPenalty && permActualStr !== 'Sin permanencia') classify('contract-row-permanencia', 'good');
    else classify('contract-row-permanencia', 'same');
    // Origen: verde nueva → good
    classify('contract-row-origen', best.isGreen ? 'good' : 'same');
    // Pago: ahorro → good; igual → same; más caro → warn
    const diff = results.current.amount - best.amount;
    classify('contract-row-pago', diff > 0 ? 'good' : (diff < 0 ? 'warn' : 'same'));

    // === Tabla técnica avanzada (dentro de "Nuestro análisis") ===
    const tarifaAccesoKey = qrData.peaje === 19 ? '3.0td' : '2.0td';
    const tarifaAccesoLabel = qrData.peaje === 19 ? '3.0TD (>15 kW)' : '2.0TD (≤15 kW)';
    const tiposContrato = { 0: 'Precio fijo', 1: 'Fijo no estándar', 2: 'Indexado al mercado' };
    document.getElementById('adv-actual-tarifa').innerHTML = glossaryTerm(tarifaAccesoKey, tarifaAccesoLabel);
    document.getElementById('adv-nuevo-tarifa').textContent = tarifaAccesoLabel;
    document.getElementById('adv-actual-pot-p1').textContent = qrData.potenciaP1 ? `${qrData.potenciaP1.toFixed(2)} kW` : '—';
    document.getElementById('adv-actual-pot-p2').textContent = qrData.potenciaP2 ? `${qrData.potenciaP2.toFixed(2)} kW` : '—';
    const potP1Nueva = pot ? pot.sugerida : qrData.potenciaP1;
    const potP2Nueva = pot ? pot.sugerida : qrData.potenciaP2;
    document.getElementById('adv-nuevo-pot-p1').textContent = potP1Nueva ? `${potP1Nueva.toFixed(2)} kW` : '—';
    document.getElementById('adv-nuevo-pot-p2').textContent = potP2Nueva ? `${potP2Nueva.toFixed(2)} kW` : '—';
    document.getElementById('adv-actual-tc').textContent = tiposContrato[qrData.tipoContrato] || '—';
    document.getElementById('adv-nuevo-tc').textContent = 'Precio fijo (mercado libre)';
    document.getElementById('adv-actual-perm').textContent = permActualStr;
    document.getElementById('adv-nuevo-perm').textContent = best.hasPenalty ? '12 meses (estándar)' : 'Sin permanencia';
    document.getElementById('adv-actual-origen').textContent = 'Mix nacional';
    document.getElementById('adv-nuevo-origen').textContent = best.isGreen ? '100% renovable certificado' : 'Mix nacional';
    document.getElementById('adv-actual-coste').textContent = `${formatCurrency(results.current.amount)}/año`;
    document.getElementById('adv-nuevo-coste').textContent = `${formatCurrency(best.amount)}/año`;
    const consumoTotal = (qrData.consumoAnualP1 || 0) + (qrData.consumoAnualP2 || 0) + (qrData.consumoAnualP3 || 0);
    if (consumoTotal > 0) {
      document.getElementById('adv-actual-kwh').textContent = `${(results.current.amount / consumoTotal).toFixed(3)} €/kWh`;
      document.getElementById('adv-nuevo-kwh').textContent = `${(best.amount / consumoTotal).toFixed(3)} €/kWh`;
    }
  }

  // === "Puntos clave": bullets compactos derivados de los modifiers ===
  // Cada modifier aplicable se traduce en una línea con tipo (good/warn/tip/info)
  // y prioridad para ordenarlos. Los 5 primeros se muestran; el resto va a un
  // "Ver más" desplegable.
  function buildPuntosClave(scenario, results, qrData) {
    const m = scenario.modifiers || {};
    const best = results && results.best;
    const puntos = [];

    if (m.sameCompanyBest && results && results.savings > 0) {
      puntos.push({ type: 'good', priority: 1,
        text: `No cambias de compañía, solo de tarifa (${best.company})` });
    }

    // Descuento de bienvenida significativo (≥10% el primer año)
    if (best && best.hasDiscount && best.discountAmount > 0) {
      const pct = Math.round((best.discountAmount / best.secondYearAmount) * 100);
      if (pct >= 10) {
        puntos.push({ type: 'tip', priority: 2,
          text: `Descuento de bienvenida: ahorras ${formatCurrency(best.discountAmount)} extra el primer año (${pct}% sobre la tarifa estable)` });
      }
    }

    if (m.userHasPermanencia) {
      const p = m.userHasPermanencia;
      const recomendacion = p.compensaCambiar
        ? 'aun así te compensa cambiar ya'
        : 'te conviene esperar';
      puntos.push({ type: 'warn', priority: 1,
        text: `Tu permanencia acaba en ${p.dias} días (penalización ~${formatCurrency(p.penalizacionEstim)} — ${recomendacion})` });
    }

    if (m.potUnderdimensioned) {
      const pu = m.potUnderdimensioned;
      puntos.push({ type: 'warn', priority: 2,
        text: `Tu pico (${pu.pmax.toFixed(2)} kW) supera la potencia contratada (${pu.actual} kW)` });
    } else if (m.potOverdimensioned) {
      const po = m.potOverdimensioned;
      puntos.push({ type: 'tip', priority: 2,
        text: `Bajar la potencia a ${po.sugerida.toFixed(1)} kW ahorra ~${formatCurrency(po.ahorroEstim)} más al año` });
    } else if (qrData.potenciaP1) {
      puntos.push({ type: 'good', priority: 6,
        text: 'Misma potencia, sin cambios técnicos' });
    }

    if (best && best.hasPenalty) {
      puntos.push({ type: 'warn', priority: 3,
        text: 'Aceptas 12 meses de permanencia con la nueva tarifa' });
    } else if (best) {
      puntos.push({ type: 'good', priority: 4,
        text: 'Sin permanencia' });
    }

    if (best && best.isGreen) {
      puntos.push({ type: 'good', priority: 5,
        text: 'Pasa a 100% energía renovable' });
    }

    if (m.bonoSocialEligible) {
      puntos.push({ type: 'tip', priority: 3,
        text: 'Podrías tener derecho al bono social (25-40% descuento)' });
    }

    if (m.hasAutoconsumo) {
      puntos.push({ type: 'info', priority: 4,
        text: `Tienes autoconsumo: asegúrate de elegir una comercializadora que compense excedentes` });
    }

    if (m.oldInvoice) {
      puntos.push({ type: 'warn', priority: 3,
        text: `Factura de hace ${m.oldInvoice} meses — los precios pueden haber cambiado` });
    }

    if (m.isRegularizacion) {
      puntos.push({ type: 'warn', priority: 3,
        text: 'Factura de regularización — datos pueden no reflejar tu consumo normal' });
    }

    if (m.contratoIndexado) {
      puntos.push({ type: 'info', priority: 5,
        text: 'Tu contrato actual es indexado: tu factura varía con el mercado mayorista' });
    }

    if (m.veryHighValle) {
      puntos.push({ type: 'tip', priority: 4,
        text: `Consumes ${m.veryHighValle}% en valle: tarifas para vehículo eléctrico te interesan` });
    }

    if (m.similarTop3) {
      puntos.push({ type: 'info', priority: 5,
        text: 'Top 3 ofertas casi iguales: elige por features (verde, sin permanencia)' });
    }

    if (m.is30TD) {
      puntos.push({ type: 'info', priority: 6,
        text: 'Tarifa 3.0TD (pequeño comercio): las comparativas son orientativas' });
    }

    puntos.sort((a, b) => a.priority - b.priority);
    return puntos;
  }

  function renderPuntosClave(scenario, qrData, results) {
    const section = document.getElementById('section-puntos-clave');
    if (!section) return;
    const puntos = buildPuntosClave(scenario, results, qrData);
    if (puntos.length === 0) {
      section.style.display = 'none';
      return;
    }
    section.style.display = '';
    const ICONS = { good: '✓', warn: '⚠', tip: '💡', info: 'ℹ' };
    const renderItem = p => `<li class="punto punto-${p.type}"><span class="punto-icon" aria-hidden="true">${ICONS[p.type] || '·'}</span><span class="punto-text">${p.text}</span></li>`;

    const VISIBLE_LIMIT = 5;
    const visible = puntos.slice(0, VISIBLE_LIMIT);
    const extra = puntos.slice(VISIBLE_LIMIT);
    document.getElementById('puntos-clave-list').innerHTML = visible.map(renderItem).join('');
    const moreWrap = document.getElementById('puntos-clave-more-wrap');
    if (extra.length > 0) {
      moreWrap.hidden = false;
      document.getElementById('puntos-clave-hidden').innerHTML = extra.map(renderItem).join('');
      const btn = document.getElementById('puntos-clave-show-more');
      const txt = btn.querySelector('.show-more-text');
      txt.textContent = `Ver ${extra.length} más`;
      btn.setAttribute('aria-expanded', 'false');
      document.getElementById('puntos-clave-hidden').hidden = true;
      // Single click handler (no acumular)
      btn.onclick = () => {
        const hidden = document.getElementById('puntos-clave-hidden');
        const open = hidden.hidden === false;
        hidden.hidden = open;
        btn.setAttribute('aria-expanded', String(!open));
        txt.textContent = open ? `Ver ${extra.length} más` : 'Ocultar';
        btn.classList.toggle('open', !open);
      };
    } else {
      moreWrap.hidden = true;
    }
  }

  // --- Build feature tags HTML ---
  function buildFeatureTags(offer) {
    let html = '';
    if (offer.isGreen) {
      html += '<span class="feature-tag tag-green">\u{1F33F} Verde</span>';
    }
    if (offer.hasPenalty === false || offer.hasPenalty === 0) {
      html += '<span class="feature-tag tag-no-penalty">\u{1F513} Sin permanencia</span>';
    }
    return html;
  }

  // --- Renderers por caso primario ---
  // Cada uno ajusta: hero, badge mejor oferta, header de alternativas, insight, visibilidad de howto.

  function renderCaseAlreadyBest(results, qrData, scenario) {
    const isRank1 = scenario.primaryCase === 'rank-1';
    const savingsHero = document.getElementById('savings-hero');
    savingsHero.classList.add('no-savings');
    setHero(
      isRank1 ? 'Enhorabuena' : 'Tu tarifa actual',
      isRank1 ? '✓ Tienes la mejor oferta' : 'Entre las mejores tarifas',
      `Puesto #${results.currentCompanyRank} de ${results.totalOffers} ofertas analizadas`,
      null
    );

    document.getElementById('best-header').textContent = isRank1
      ? 'Tu oferta actual es la #1'
      : `Tu oferta actual: puesto #${results.currentCompanyRank}`;
    const bestBadge = document.getElementById('result-badge');
    bestBadge.textContent = `#${results.currentCompanyRank} de ${results.totalOffers}`;
    bestBadge.classList.add('badge-good');

    document.getElementById('alt-header').textContent = 'La competencia (por transparencia)';

    document.getElementById('insight-text').innerHTML = isRank1
      ? `<strong>${results.current.company} tiene la mejor tarifa del mercado</strong> para tu perfil entre las ${results.totalOffers} ofertas disponibles. No necesitas cambiar nada. Te mostramos la competencia abajo solo por transparencia &mdash; comprueba que estamos siendo honestos contigo.`
      : `${results.current.company} está en el <strong>puesto #${results.currentCompanyRank} de ${results.totalOffers}</strong>. La diferencia con la #1 es marginal (probablemente <2%), así que el esfuerzo de cambiar no compensa. Repasa la competencia abajo si tienes curiosidad.`;

    document.getElementById('result-savings').style.display = 'none';
    document.getElementById('section-howto').style.display = 'none';
  }

  // Helper: aplica los textos del hero con el nuevo orden (sub = cambiando a X,
  // context = mensaje secundario opcional como "X% de más").
  function setHero(label, amount, sub, context) {
    document.getElementById('savings-hero-label').textContent = label;
    document.getElementById('savings-hero-amount').textContent = amount;
    document.getElementById('savings-hero-sub').innerHTML = sub || '';
    const ctxEl = document.getElementById('savings-hero-context');
    if (ctxEl) {
      ctxEl.innerHTML = context || '';
      ctxEl.style.display = context ? '' : 'none';
    }
  }

  function renderCaseBigSavings(results, qrData, scenario) {
    const savingsHero = document.getElementById('savings-hero');
    savingsHero.classList.remove('no-savings');
    savingsHero.classList.add('savings-big');
    const pct = Math.round(results.savings / Math.max(results.current.amount, 1) * 100);
    setHero(
      'Ahorro disponible',
      `${formatCurrency(results.savings)}/año`,
      `cambiando a <strong>${results.best.company}</strong>`,
      `Estás pagando un <strong>${pct}% de más</strong> que la mejor oferta`
    );

    document.getElementById('best-header').textContent = 'Mejor oferta del mercado';
    const bestBadge = document.getElementById('result-badge');
    bestBadge.textContent = `#1 de ${results.totalOffers}`;
    bestBadge.classList.remove('badge-good');
    document.getElementById('alt-header').textContent = 'También podrías considerar';
    document.getElementById('insight-text').innerHTML = buildInsight(results, qrData);
    document.getElementById('result-savings').style.display = 'none';
    document.getElementById('section-howto').style.display = '';
  }

  function renderCaseNormalSavings(results, qrData, scenario) {
    const savingsHero = document.getElementById('savings-hero');
    savingsHero.classList.remove('no-savings', 'savings-big');
    const pct = Math.round(results.savings / Math.max(results.current.amount, 1) * 100);
    setHero(
      'Ahorro disponible',
      `${formatCurrency(results.savings)}/año`,
      `cambiando a <strong>${results.best.company}</strong>`,
      `${formatCurrency(results.savings / 12)}/mes · estás pagando un ${pct}% de más`
    );

    document.getElementById('best-header').textContent = 'Mejor oferta del mercado';
    const bestBadge = document.getElementById('result-badge');
    bestBadge.textContent = `#1 de ${results.totalOffers}`;
    bestBadge.classList.remove('badge-good');
    document.getElementById('alt-header').textContent = 'También podrías considerar';
    document.getElementById('insight-text').innerHTML = buildInsight(results, qrData);
    document.getElementById('result-savings').style.display = 'none';
    document.getElementById('section-howto').style.display = '';
  }

  function renderCaseSmallSavings(results, qrData, scenario) {
    const savingsHero = document.getElementById('savings-hero');
    savingsHero.classList.remove('no-savings', 'savings-big');
    setHero(
      'Ahorro marginal',
      `${formatCurrency(results.savings)}/año`,
      `cambiando a <strong>${results.best.company}</strong>`,
      `Tu tarifa actual es razonable. Valora si el cambio compensa.`
    );

    document.getElementById('best-header').textContent = 'Mejor oferta del mercado';
    const bestBadge = document.getElementById('result-badge');
    bestBadge.textContent = `#1 de ${results.totalOffers}`;
    bestBadge.classList.remove('badge-good');
    document.getElementById('alt-header').textContent = 'También podrías considerar';
    document.getElementById('insight-text').innerHTML = buildInsight(results, qrData);
    document.getElementById('result-savings').style.display = 'none';
    document.getElementById('section-howto').style.display = '';
  }

  function renderCaseAlreadyCheap(results, qrData, scenario) {
    const savingsHero = document.getElementById('savings-hero');
    savingsHero.classList.add('no-savings');
    setHero(
      'Tu tarifa actual',
      'Ya es muy competitiva',
      `No hemos encontrado nada mejor entre ${results.totalOffers} ofertas`,
      null
    );

    document.getElementById('best-header').textContent = 'La oferta más barata del mercado';
    const bestBadge = document.getElementById('result-badge');
    bestBadge.textContent = `#1 de ${results.totalOffers}`;
    document.getElementById('alt-header').textContent = 'Otras ofertas del mercado';

    document.getElementById('insight-text').innerHTML = `Tu tarifa actual cuesta <strong>${formatCurrency(results.current.amount)}/año</strong>, igual o más barata que cualquier oferta de mercado libre. No hay nada que rascar cambiando de comercializadora &mdash; revisa el bloque de análisis adicional por si puedes optimizar otros aspectos.`;
    document.getElementById('result-savings').style.display = 'none';
    document.getElementById('section-howto').style.display = 'none';
  }

  // --- Display ---
  function displayResults(results, qrData) {
    // Comparison cards
    document.getElementById('comp-current-company').textContent = results.current.company;
    document.getElementById('result-current-amount').textContent = formatCurrency(results.current.amount);
    document.getElementById('result-current-monthly').textContent = `${formatCurrency(results.current.amount / 12)}/mes`;

    // Clasificar escenario para decidir tono, jerarqu\u00eda y banners
    const scenario = classifyScenario(results, qrData);
    const screenEl = document.getElementById('screen-result');
    screenEl.dataset.case = scenario.primaryCase;

    if (!results.best) {
      document.getElementById('savings-hero').style.display = 'none';
      document.querySelector('.comparison-grid').style.display = 'none';
      showScreen('result');
      return;
    }

    // Comparison: best offer side — empresa destacada arriba, tarifa pequeña debajo
    document.getElementById('result-best-company').textContent = results.best.company;
    const bestTariffEl = document.getElementById('result-best-tariff');
    if (bestTariffEl) bestTariffEl.textContent = results.best.offerName || '';
    document.getElementById('result-best-amount').textContent = formatCurrency(results.best.amount);
    if (results.best.hasDiscount) {
      // Hay descuento de bienvenida: amount es del 1er año, mostrar "luego" debajo
      document.getElementById('result-best-monthly').innerHTML =
        `${formatCurrency(results.best.amount / 12)}/mes <span class="comparison-badge-discount" title="Descuento de bienvenida el primer año">1er año</span>` +
        `<br><span class="comparison-aftermath">luego ${formatCurrency(results.best.secondYearAmount)}/año</span>`;
    } else {
      document.getElementById('result-best-monthly').textContent = `${formatCurrency(results.best.amount / 12)}/mes`;
    }

    const bestHeader = document.getElementById('best-header');
    const bestBadge = document.getElementById('result-badge');
    const savingsEl = document.getElementById('result-savings');
    const altHeader = document.getElementById('alt-header');
    const savingsHero = document.getElementById('savings-hero');
    const insightEl = document.getElementById('insight-text');

    // Detail card
    document.getElementById('result-best-company-detail').textContent = results.best.company;
    const bestOfferNameEl = document.getElementById('result-best-offer-name');
    if (results.best.offerName) {
      bestOfferNameEl.textContent = results.best.offerName;
      bestOfferNameEl.style.display = '';
    } else {
      bestOfferNameEl.style.display = 'none';
    }

    // Feature tags for best offer
    document.getElementById('result-best-features').innerHTML = buildFeatureTags(results.best);

    // Link a la web oficial de la comercializadora (BBDD interna). Si no la
    // tenemos catalogada, fallback a Google search con el nombre exacto.
    const bestUrl = getCompanyUrl(results.best.company, results.best.offerName);
    const linkEl = document.getElementById('result-best-link');
    if (linkEl) {
      linkEl.href = bestUrl;
      linkEl.textContent = `Ver tarifa en ${results.best.company} →`;
    }
    // CTA paralelo en "Cómo cambiar de comercializadora"
    const howtoLinkEl = document.getElementById('howto-cta-link');
    if (howtoLinkEl) {
      howtoLinkEl.href = bestUrl;
      const txt = howtoLinkEl.querySelector('.howto-cta-text');
      if (txt) txt.textContent = `Cambiar a ${results.best.company}`;
    }

    // === Renderizar por caso primario ===
    switch (scenario.primaryCase) {
      case 'rank-1':
      case 'rank-top3':
        renderCaseAlreadyBest(results, qrData, scenario);
        break;
      case 'big-savings':
        renderCaseBigSavings(results, qrData, scenario);
        break;
      case 'small-savings':
        renderCaseSmallSavings(results, qrData, scenario);
        break;
      case 'already-cheap':
        renderCaseAlreadyCheap(results, qrData, scenario);
        break;
      case 'normal-savings':
      default:
        renderCaseNormalSavings(results, qrData, scenario);
        break;
    }

    // Alternatives — improved card layout with stacked info
    results.alternatives.forEach((alt, i) => {
      const el = document.getElementById(`alt-${i + 1}`);
      if (el && alt) {
        el.querySelector('.alt-name').textContent = alt.company;
        const altOfferName = el.querySelector('.alt-offer-name');
        if (altOfferName) {
          altOfferName.textContent = alt.offerName || '';
        }
        el.querySelector('.alt-amount').textContent = `${formatCurrency(alt.amount)}/a\u00f1o`;
        const saving = results.current.amount - alt.amount;
        el.querySelector('.alt-saving').textContent = saving > 0
          ? `Ahorras ${formatCurrency(saving)}/a\u00f1o`
          : '';
        // Feature tags
        const altFeaturesEl = el.querySelector('.alt-features');
        if (altFeaturesEl) {
          altFeaturesEl.innerHTML = buildFeatureTags(alt);
        }
        el.style.display = '';
      } else if (el) {
        el.style.display = 'none';
      }
    });

    // Show data source badge
    const disclaimer = document.querySelector('.result-disclaimer p');
    disclaimer.textContent = `Datos reales del comparador oficial de la CNMC. ${results.totalOffers} ofertas analizadas. AhorraLuz no est\u00e1 afiliado con ninguna comercializadora.`;

    // Renderizar "Tu nuevo contrato" + Puntos clave
    renderContractComparison(results, qrData, scenario);
    renderPuntosClave(scenario, qrData, results);

    // En desktop, abrir las secciones desplegables automáticamente
    applyCollapsibleDefaults();

    showScreen('result');
  }

  // En desktop (>=1024px) abrimos los <details> de las 3 secciones para que
  // se vea todo a la vez. En mobile quedan cerrados — el usuario los expande.
  function applyCollapsibleDefaults() {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    document.querySelectorAll('.collapsible-section').forEach(d => {
      d.open = isDesktop;
    });
  }
  // Reajustar al redimensionar (desktop->mobile o viceversa)
  window.addEventListener('resize', () => {
    if (document.getElementById('screen-result').classList.contains('active')) {
      applyCollapsibleDefaults();
    }
  });

  // --- Loading steps ---
  function resetLoadingSteps() {
    document.querySelectorAll('.step').forEach(step => {
      step.classList.remove('done', 'active');
    });
    document.getElementById('progress-fill').style.width = '0%';
  }

  function activateStep(stepId) {
    document.getElementById(stepId).classList.add('active');
  }

  function completeStep(stepId, delay) {
    return new Promise(resolve => {
      setTimeout(() => {
        const el = document.getElementById(stepId);
        el.classList.remove('active');
        el.classList.add('done');
        updateProgress();
        resolve();
      }, delay);
    });
  }

  function updateProgress() {
    const total = document.querySelectorAll('.step').length;
    const done = document.querySelectorAll('.step.done').length;
    document.getElementById('progress-fill').style.width = `${(done / total) * 100}%`;
  }

  // --- Error ---
  function showError(title, message, details) {
    document.getElementById('error-title').textContent = title;
    document.getElementById('error-message').textContent = message;
    const detailsEl = document.getElementById('error-details');
    const detailsText = document.getElementById('error-details-text');
    if (details) {
      detailsText.textContent = typeof details === 'string' ? details : JSON.stringify(details, null, 2);
      detailsEl.style.display = '';
    } else {
      detailsEl.style.display = 'none';
    }
    showScreen('error');
  }

  // --- Personalized insight ---
  function buildInsight(results, qrData) {
    const parts = [];
    const savings = results.savings;
    const current = results.current;
    const best = results.best;

    if (savings > 0) {
      const bestName = best.offerName ? `<strong>${best.offerName}</strong> de ${best.company}` : best.company;
      parts.push(`Est\u00e1s pagando <strong>${formatCurrency(current.amount)}/a\u00f1o</strong> (${formatCurrency(current.amount / 12)}/mes) con ${current.company}.`);
      parts.push(`Podr\u00edas pagar <strong>${formatCurrency(best.amount)}/a\u00f1o</strong> con ${bestName}. Eso son <strong>${formatCurrency(savings)} menos al a\u00f1o</strong>.`);

      if (results.currentCompanyRank) {
        parts.push(`La mejor oferta de ${current.company} est\u00e1 en el puesto #${results.currentCompanyRank} de ${results.totalOffers}.`);
      }

      // Explain WHY this offer is good for their profile
      if (qrData) {
        const total = qrData.consumoAnualP1 + qrData.consumoAnualP2 + qrData.consumoAnualP3;
        if (total > 0) {
          const pctValle = Math.round(qrData.consumoAnualP3 / total * 100);
          const pctPunta = Math.round(qrData.consumoAnualP1 / total * 100);
          if (pctValle >= 40) {
            parts.push(`El <strong>${pctValle}%</strong> de tu consumo es en horario valle (noches y fines de semana), por lo que te conviene una tarifa que premie ese horario.`);
          } else if (pctPunta >= 40) {
            parts.push(`El <strong>${pctPunta}%</strong> de tu consumo es en horario punta. Una tarifa con precio \u00fanico te protege de los precios altos en esas horas.`);
          } else {
            parts.push(`Tu consumo est\u00e1 bastante repartido entre horarios. Una tarifa con precio fijo \u00fanico puede darte estabilidad.`);
          }
        }
      }
    }

    return parts.join(' ');
  }

  // --- BBDD de URLs oficiales por comercializadora ---
  // Mapping comercializadora → página oficial de tarifas. Las claves son
  // substring que se buscan en el nombre (case-insensitive). Si no hay match,
  // se cae a búsqueda de Google con el nombre + tarifa.
  // Revisar URLs cada 6 meses por si cambian.
  const COMPANY_WEBSITES = {
    'IBERDROLA':         'https://www.iberdrola.es/luz/planes-luz',
    'ENDESA':            'https://www.endesa.com/es/luz/tarifas-luz',
    'NATURGY':           'https://www.naturgy.es/hogar/luz/tarifa_luz',
    'REPSOL':            'https://www.repsol.es/particulares/luz-y-gas/tarifas-luz-gas/',
    'HOLALUZ':           'https://www.holaluz.com/luz',
    'TOTAL':             'https://www.totalenergies.es/clientes-particulares/luz',
    'OCTOPUS':           'https://octopusenergy.es/tarifas-luz',
    'IMAGINA':           'https://www.imaginaenergia.com/luz/tarifas',
    'LUCERA':            'https://lucera.es',
    'PLENITUDE':         'https://www.eniplenitude.com/es-es/luz',
    'EDP':               'https://www.edpenergia.es/es/hogares/tu-tarifa-luz/',
    'ACCIONA':           'https://www.acciona-energia.com/clientes-particulares/tarifas-luz/',
    'ENERGYA VM':        'https://www.energyavm.es/particulares/tarifas-electricidad/',
    'ENERGYA':           'https://www.energyavm.es/particulares/tarifas-electricidad/',
    'GANA ENERGÍA':      'https://ganaenergia.com/tarifas-luz/',
    'GANA ENERGIA':      'https://ganaenergia.com/tarifas-luz/',
    'AURA ENERGIA':      'https://www.aura-energia.com/tarifas-luz/',
    'AURA ENERGÍA':      'https://www.aura-energia.com/tarifas-luz/',
    'PEPENERGY':         'https://www.pepenergy.com/luz',
    'GANA':              'https://ganaenergia.com/tarifas-luz/',
    'CEPSA':             'https://www.cepsa.es/es/particulares/casa/luz',
    'AXPO':              'https://www.axpo.com/es/es/empresa/luz',
    'PLÉNITUDE':         'https://www.eniplenitude.com/es-es/luz',
    'AUDAX':             'https://www.audaxrenovables.com/particulares/',
    'GAOLANIA':          'https://www.gaolania.com/',
    'ENERGYASSET':       'https://www.energyasset.es/',
    'VISALIA':           'https://www.visaliaenergia.com/',
    'DOMÉSTICA':         'https://www.visaliaenergia.com/',
    'DOMESTICA':         'https://www.visaliaenergia.com/',
  };

  function getCompanyUrl(companyName, offerName) {
    if (!companyName) {
      return `https://www.google.com/search?q=${encodeURIComponent('tarifa luz España')}`;
    }
    const upper = companyName.toUpperCase();
    // Buscar coincidencia (longest match first para evitar matches parciales erróneos)
    const keys = Object.keys(COMPANY_WEBSITES).sort((a, b) => b.length - a.length);
    for (const key of keys) {
      if (upper.includes(key)) return COMPANY_WEBSITES[key];
    }
    // Fallback Google
    const q = encodeURIComponent(`${companyName} ${offerName || ''} tarifa luz`);
    return `https://www.google.com/search?q=${q}`;
  }

  // --- Glosario de términos técnicos + sistema de tooltips ---
  // Cada término aparece en pantalla con un icono "?" al lado. Al clicarlo,
  // muestra un popover con la explicación. Click fuera o ESC lo cierra.
  const GLOSSARY = {
    'pvpc': {
      label: 'PVPC',
      text: 'Precio Voluntario al Pequeño Consumidor. Tarifa regulada del Estado: el precio del kWh varía cada hora según el mercado mayorista. Sin permanencia ni compromiso, pero la factura cambia mes a mes.'
    },
    'precio-fijo': {
      label: 'Precio fijo',
      text: 'Tarifa del mercado libre con el precio del kWh cerrado durante meses (normalmente 12). Más estable que PVPC, pero suele ser un poco más caro de media.'
    },
    'indexado': {
      label: 'Indexado',
      text: 'Tarifa cuyo precio varía con el mercado mayorista (similar a PVPC pero con un margen extra de la comercializadora). Más riesgo si los precios suben.'
    },
    '2.0td': {
      label: '2.0TD',
      text: 'Tarifa de acceso (peaje) para suministros residenciales y pequeño comercio con potencia ≤15 kW. Es la parte regulada del precio, igual para todas las comercializadoras.'
    },
    '3.0td': {
      label: '3.0TD',
      text: 'Tarifa de acceso para potencias >15 kW (pequeño comercio, oficinas). Tiene 6 periodos horarios distintos en lugar de 3.'
    },
    'potencia': {
      label: 'Potencia contratada',
      text: 'Los kW máximos que puedes consumir simultáneamente. Pagas un coste fijo mensual por tenerla disponible (~38€/kW al año), la uses o no. Si pasas del límite, salta el ICP.'
    },
    'permanencia': {
      label: 'Permanencia',
      text: 'Compromiso de mantener el contrato un tiempo (normalmente 12 meses). Salir antes implica penalización, típicamente el 5% del consumo pendiente hasta el fin del contrato.'
    },
    'punta-llano-valle': {
      label: 'Punta, Llano y Valle',
      text: 'Franjas horarias con distinto precio en la tarifa 2.0TD: Punta (10-14h y 18-22h en días laborables, las más caras), Llano (8-10h, 14-18h y 22-24h L-V), Valle (0-8h L-V y todo el fin de semana y festivos, las más baratas).'
    },
    'bono-social': {
      label: 'Bono social',
      text: 'Descuento del 25-40% sobre la factura que aplica el Estado a hogares vulnerables (rentas bajas, familias numerosas, pensionistas mínimos, etc.). Lo gestionan las comercializadoras de referencia.'
    },
    'mix-nacional': {
      label: 'Mix nacional',
      text: 'Origen no certificado de la energía. Significa que la electricidad proviene de la mezcla del sistema eléctrico español: gas natural, nuclear, eólica, hidráulica, solar, etc.'
    },
    '100-renovable': {
      label: '100% renovable',
      text: 'Energía con Garantía de Origen renovable certificada por la CNMC. No emite CO₂ y procede de fuentes como eólica, solar, hidráulica o biomasa.'
    },
    'termino-potencia': {
      label: 'Término de potencia',
      text: 'Lo que pagas por tener la luz disponible, aunque no la uses. Se calcula multiplicando los kW contratados por un precio regulado (~38€/kW/año).'
    },
    'termino-energia': {
      label: 'Término de energía',
      text: 'Lo que pagas por cada kWh consumido. Es la parte de la factura que varía según cuánto uses, y donde más se diferencian las comercializadoras.'
    },
    'cups': {
      label: 'CUPS',
      text: 'Código Universal del Punto de Suministro. Identifica de forma única tu enchufe (22 caracteres, empieza por ES). Lo encuentras en cualquier factura. Es lo único que necesitas para cambiar de comercializadora.'
    },
    'autoconsumo': {
      label: 'Autoconsumo / Excedentes',
      text: 'Si tienes paneles solares y produces más energía de la que gastas, el sobrante se vierte a la red. La comercializadora te lo compensa descontando una cantidad de tu factura.'
    },
    'discriminacion-horaria': {
      label: 'Discriminación horaria',
      text: 'Tarifa cuyo precio del kWh cambia entre franjas Punta/Llano/Valle. Te premia consumir en horas baratas (noches, fines de semana).'
    },
    'descuento-bienvenida': {
      label: 'Descuento de bienvenida',
      text: 'Reducción del precio durante los primeros 12 meses de contrato. Al cumplir el año, el precio vuelve al tarifario base. Cambiar de tarifa o de comercializadora cada año puede mantenerte siempre con descuento.'
    },
  };

  // Inserta el HTML de un término con icono ? clickable.
  // Uso: glossaryTerm('pvpc') → "<span class='glossary-term'>PVPC <button>?</button></span>"
  // O: glossaryTerm('pvpc', 'PVPC / Fijo') → mismo pero con texto custom
  function glossaryTerm(key, displayText) {
    const g = GLOSSARY[key];
    if (!g) return displayText || key;
    const label = displayText || g.label;
    return `<span class="glossary-term"><span class="glossary-text">${label}</span>` +
           `<button type="button" class="glossary-icon" data-term="${key}" aria-label="Qué es ${g.label}">?</button></span>`;
  }

  // Popover único reutilizable
  let glossaryPopover = null;
  function ensureGlossaryPopover() {
    if (glossaryPopover) return glossaryPopover;
    glossaryPopover = document.createElement('div');
    glossaryPopover.className = 'glossary-popover';
    glossaryPopover.setAttribute('role', 'tooltip');
    glossaryPopover.hidden = true;
    glossaryPopover.innerHTML = `
      <button type="button" class="glossary-popover-close" aria-label="Cerrar">×</button>
      <h4 class="glossary-popover-title"></h4>
      <p class="glossary-popover-text"></p>
    `;
    document.body.appendChild(glossaryPopover);
    glossaryPopover.querySelector('.glossary-popover-close').addEventListener('click', closeGlossary);
    return glossaryPopover;
  }

  function showGlossary(termKey, anchorEl) {
    const g = GLOSSARY[termKey];
    if (!g) return;
    const pop = ensureGlossaryPopover();
    pop.querySelector('.glossary-popover-title').textContent = g.label;
    pop.querySelector('.glossary-popover-text').textContent = g.text;
    pop.hidden = false;

    // Posicionar bajo el anchor, ajustado a viewport
    const rect = anchorEl.getBoundingClientRect();
    const popRect = pop.getBoundingClientRect();
    const margin = 8;
    let top = rect.bottom + window.scrollY + margin;
    let left = rect.left + window.scrollX + (rect.width / 2) - (popRect.width / 2);
    const maxLeft = window.scrollX + window.innerWidth - popRect.width - margin;
    if (left < window.scrollX + margin) left = window.scrollX + margin;
    if (left > maxLeft) left = maxLeft;
    pop.style.top = top + 'px';
    pop.style.left = left + 'px';
    pop.dataset.openFor = termKey;
  }

  function closeGlossary() {
    if (glossaryPopover) glossaryPopover.hidden = true;
  }

  // Listener delegado para todos los iconos del glosario
  document.addEventListener('click', e => {
    const icon = e.target.closest('.glossary-icon');
    if (icon) {
      e.stopPropagation();
      const key = icon.getAttribute('data-term');
      const currentKey = glossaryPopover && !glossaryPopover.hidden ? glossaryPopover.dataset.openFor : null;
      if (currentKey === key) { closeGlossary(); return; }
      showGlossary(key, icon);
      return;
    }
    // Click fuera del popover lo cierra
    if (glossaryPopover && !glossaryPopover.hidden && !e.target.closest('.glossary-popover')) {
      closeGlossary();
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeGlossary();
  });

  // --- Help toggles ---
  document.addEventListener('click', function (e) {
    const toggle = e.target.closest('.help-toggle');
    if (!toggle) return;
    const helpId = toggle.getAttribute('data-help');
    const helpEl = document.getElementById(helpId);
    if (helpEl) {
      helpEl.classList.toggle('visible');
      toggle.classList.toggle('active');
    }
  });

  // --- Utils ---
  function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  }

})();

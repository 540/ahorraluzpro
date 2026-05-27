// AhorraLuz — app.js
// Comparador de tarifas de luz via QR de factura

(function () {
  'use strict';

  // --- Analytics (Umami + PostHog) ---
  // Helper único que dispara cada evento custom a Umami y PostHog a la vez,
  // para comparar dashboards 1:1. Cada destino va en su propio try/catch: si
  // una no está cargada o falla, la otra sigue y nunca rompe el flujo del
  // usuario. Ambas solo existen en producción y solo si hay IDs (ver
  // index.html); en localhost no se envía nada.
  // No mandamos eventos a Vercel: en plan Hobby los custom events no se
  // capturan (son de pago) — Vercel se queda solo con pageviews gratis.
  function track(name, props) {
    var data = props || {};
    // Umami Cloud
    try {
      if (window.umami && typeof window.umami.track === 'function') {
        window.umami.track(name, data);
      }
    } catch (_) {}
    // PostHog Cloud EU
    try {
      if (window.posthog && typeof window.posthog.capture === 'function') {
        window.posthog.capture(name, data);
      }
    } catch (_) {}
  }

  // --- DOM helpers defensivos ---
  // Estos wrappers permiten que el JS siga funcionando aunque el HTML
  // cacheado en el navegador del usuario esté desfasado y falte algún
  // elemento. En lugar de petar con "Cannot set properties of null",
  // se hace log silencioso y se sigue ejecutando.
  function $(id) { return document.getElementById(id); }
  function setText(id, text) {
    const el = $(id);
    if (el) el.textContent = text;
    else if (typeof console !== 'undefined') console.warn('Missing element #' + id);
  }
  function setHTML(id, html) {
    const el = $(id);
    if (el) el.innerHTML = html;
    else if (typeof console !== 'undefined') console.warn('Missing element #' + id);
  }
  function addClass(id, cls) { const el = $(id); if (el) el.classList.add(cls); }
  function removeClass(id, cls) { const el = $(id); if (el) el.classList.remove(cls); }
  function setDisplay(id, value) { const el = $(id); if (el) el.style.display = value; }

  // Defensa: ocultar la card de oferta sospechosa nada más cargar. Si un
  // HTML cacheado llegara sin el atributo `hidden`, esto garantiza que no
  // se vea vacía con placeholders hasta que processQR decida mostrarla.
  (function () { const sc = $('suspect-offer-card'); if (sc) sc.hidden = true; })();

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

  // --- Theme toggle (dark/light) ---
  // Default: respeta prefers-color-scheme del sistema.
  // Si el usuario clicka el toggle, override en localStorage y sobreescribe.
  function getCurrentTheme() {
    const override = (function () {
      try { return localStorage.getItem('ahorraluz.theme'); } catch (e) { return null; }
    })();
    if (override === 'light' || override === 'dark') return override;
    // Auto: leer del sistema
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  function applyTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      document.documentElement.setAttribute('data-theme', theme);
      try { localStorage.setItem('ahorraluz.theme', theme); } catch (e) {}
    }
  }
  const themeBtn = $('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      applyTheme(getCurrentTheme() === 'light' ? 'dark' : 'light');
    });
  }

  // --- Navigation ---
  document.getElementById('btn-scan').addEventListener('click', () => {
    track('scan_click');
    startScanner();
  });

  // Analytics: trackear click en cualquier CTA de oferta (slide del carrusel
  // o el botón principal "Cambiar a X" del footer). Delegación en document
  // porque los slides se renderizan dinámicamente.
  document.addEventListener('click', e => {
    const slideCta = e.target.closest('.slide-cta');
    if (slideCta) {
      const slide = slideCta.closest('.offers-proposed-slide');
      const company = slide ? slide.querySelector('.offers-col-company')?.textContent : null;
      track('open_offer', {
        company: company || 'desconocida',
        source: 'carousel',
        rank: slide ? slide.dataset.rank : null,
        suspect: slideCta.classList.contains('slide-cta-suspect'),
      });
      return;
    }
    const howtoCta = e.target.closest('#howto-cta-link');
    if (howtoCta) {
      const txt = howtoCta.querySelector('.howto-cta-text')?.textContent || '';
      track('open_offer', {
        company: txt.replace(/^Cambiar a /, ''),
        source: 'howto-cta',
      });
    }
  });
  document.getElementById('btn-back').addEventListener('click', stopAndGoHome);
  document.getElementById('btn-restart').addEventListener('click', stopAndGoHome);
  document.getElementById('btn-retry').addEventListener('click', startScanner);
  const btnShare = document.getElementById('btn-share');
  if (btnShare) btnShare.addEventListener('click', copyShareLink);

  // === Compartir enlace: si la URL trae #r=<lz-comprimido> autoejecutamos el
  //     análisis con los mismos datos del QR original. Esto permite que un
  //     usuario comparta sus resultados con otro sin necesidad de escanear.
  //     OJO: se invoca al final del IIFE (línea ~final) porque depende de
  //     CNMC_QR_BASE (const) que está más abajo en TDZ. ===
  window.addEventListener('hashchange', tryAutoProcessFromHash);

  // Debug hook: en localhost exponemos processQR para que el script
  // scripts/verify-prepush.js pueda reproducir el flow sin pasar por la cámara.
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:') {
    window.__ahorraluzDebug = { processQR, renderCarouselContextNote, encodeShareHash, decodeShareHash };
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
    // Si veníamos de un enlace compartido, limpiamos el hash para no caer
    // otra vez en el flujo automático al pulsar "Escanear otra factura".
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  }

  // === Compartir enlace: encode / decode con LZString ===
  // El hash es el formato más privado (no viaja al servidor) y LZString
  // comprime los datos a base64 URL-safe. Para ahorrar bytes guardamos sólo
  // el querystring del QR — la base URL del CNMC se reconstruye al decode.
  const CNMC_QR_BASE = 'https://comparador.cnmc.gob.es/comparador/QRE?';

  function encodeShareHash(qrUrl) {
    if (!qrUrl || typeof LZString === 'undefined') return null;
    // Si la URL viene con la base estándar, guardamos solo el querystring.
    const idx = qrUrl.indexOf('?');
    const payload = qrUrl.startsWith(CNMC_QR_BASE) && idx >= 0 ? qrUrl.slice(idx + 1) : qrUrl;
    return '#r=' + LZString.compressToEncodedURIComponent(payload);
  }
  function decodeShareHash(hash) {
    if (!hash || hash.indexOf('#r=') !== 0 || typeof LZString === 'undefined') return null;
    try {
      const compressed = hash.slice(3);
      const decoded = LZString.decompressFromEncodedURIComponent(compressed);
      if (!decoded) return null;
      // Si parece un querystring suelto, reconstruimos la URL del CNMC.
      if (decoded.startsWith('http')) return decoded;
      if (decoded.includes('cp=') || decoded.includes('cups=')) return CNMC_QR_BASE + decoded;
      return null;
    } catch (_) { return null; }
  }
  function tryAutoProcessFromHash() {
    if (!location.hash || location.hash.indexOf('#r=') !== 0) return;
    // Esperamos a que LZString esté disponible (el CDN puede tardar) hasta
    // 3s con poll de 50ms. Después decodificamos y procesamos el QR.
    const start = Date.now();
    const tryDecode = () => {
      if (typeof LZString === 'undefined') {
        if (Date.now() - start < 3000) return setTimeout(tryDecode, 50);
        console.warn('Enlace compartido: LZString no se cargó (CDN bloqueado?)');
        return;
      }
      const url = decodeShareHash(location.hash);
      if (!url) { console.warn('Enlace compartido: hash inválido'); return; }
      processQR(url).catch(e => console.error('Enlace compartido falló:', e));
    };
    tryDecode();
  }
  async function copyShareLink() {
    const btn = $('btn-share');
    if (!lastProcessedQrUrl) {
      if (btn) {
        const txt = btn.querySelector('.btn-share-text');
        if (txt) txt.textContent = 'No hay datos para compartir todavía';
      }
      return;
    }
    const hash = encodeShareHash(lastProcessedQrUrl);
    if (!hash) {
      if (btn) {
        const txt = btn.querySelector('.btn-share-text');
        if (txt) txt.textContent = 'No se pudo generar el enlace';
      }
      return;
    }
    const fullUrl = location.origin + location.pathname + hash;
    try {
      await navigator.clipboard.writeText(fullUrl);
      track('share_copied', { method: 'clipboard' });
      if (btn) {
        btn.classList.add('copied');
        const txt = btn.querySelector('.btn-share-text');
        const original = txt ? txt.textContent : '';
        if (txt) txt.textContent = '¡Enlace copiado!';
        setTimeout(() => {
          btn.classList.remove('copied');
          if (txt) txt.textContent = original;
        }, 2200);
      }
    } catch (e) {
      // Fallback: prompt manual
      window.prompt('Copia este enlace:', fullUrl);
      track('share_copied', { method: 'prompt-fallback' });
    }
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
  // Guardamos la última URL procesada para poder generar el enlace de
  // compartir desde la pantalla de resultados.
  let lastProcessedQrUrl = null;

  async function processQR(url) {
    lastProcessedQrUrl = url;
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
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        window.__lastResults = results;
        window.__lastQrData = qrData;
        window.__lastOffersRaw = offers;
      }
      await completeStep('step-calc', 400);

      // Show results
      displayConsumption(qrData, companyName);
      displayResults(results, qrData);
      displayRecomendaciones(qrData);

      // Analytics: el flow llegó hasta el resultado. Mandamos contexto
      // anonimizado (sin CUPS ni CP exactos) para entender qué casuísticas
      // ven más los usuarios.
      track('qr_processed', {
        currentCompany: results.current.company,
        savings: Math.round(results.legitimateSavings != null ? results.legitimateSavings : results.savings),
        totalOffers: results.totalOffers,
        userRank: results.userRankPosition,
        heroMode: results.heroMode,
        hasSuspect: results.heroMode === 'dual',
      });

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

    // Top 10 ofertas para el carrusel comparativo
    const topOffers = sorted.slice(0, 10);

    // Posición de la oferta actual del usuario en el ranking completo.
    // No conocemos el nombre exacto de su tarifa, pero sí su coste anual;
    // contamos cuántas ofertas son más baratas que él. +1 = su posición.
    const userRankPosition = currentAnnualCost > 0
      ? sorted.filter(o => o.importePrimerAnio < currentAnnualCost).length + 1
      : null;

    // === Detección de ofertas sospechosas ===
    // Una oferta es "sospechosa" si su precio es un outlier extremo respecto
    // a la mediana del top 10, o si su nombre contiene patterns típicos de
    // promociones condicionales ("Solar Free", "Gratis", etc.). La CNMC las
    // lista sin avisar de los requisitos (placas solares con esa misma
    // comercializadora, cliente nuevo, etc.) y enganchan al usuario con un
    // precio irreal. Caso real: Plenitude "Solar Free" 237€/año vs la
    // siguiente oferta a 1108€/año (ratio 0.21x).
    const PRICE_OUTLIER_RATIO = 0.6; // si precio < 60% de la mediana del top → outlier
    const SUSPECT_NAME_PATTERN = /\b(free|gratis|gratuit|0%|0\s*€|gratuita)\b/i;
    const topMedian = (function() {
      const top = sorted.slice(0, Math.min(10, sorted.length));
      if (top.length < 3) return null;
      const sortedPrices = top.map(o => o.importePrimerAnio).sort((a, b) => a - b);
      return sortedPrices[Math.floor(sortedPrices.length / 2)];
    })();

    function detectSuspect(offer) {
      const reasons = [];
      if (topMedian && offer.importePrimerAnio < topMedian * PRICE_OUTLIER_RATIO) {
        const ratio = (offer.importePrimerAnio / topMedian).toFixed(2);
        reasons.push({ type: 'price-outlier', detail: `Precio anormalmente bajo (${ratio}× la mediana del top 10)` });
      }
      if (SUSPECT_NAME_PATTERN.test(offer.oferta || '')) {
        reasons.push({ type: 'suspect-name', detail: 'Nombre típico de promoción condicional ("Free", "Gratis", etc.)' });
      }
      return reasons.length > 0 ? reasons : null;
    }

    function mapOffer(o) {
      const suspectReasons = detectSuspect(o);
      return {
        company: cleanCompanyName(o.comercializadora || ''),
        offerName: o.oferta || '',
        amount: o.importePrimerAnio,
        secondYearAmount: o.importeSegundoAnio,
        hasDiscount: o.importePrimerAnio < o.importeSegundoAnio,
        discountAmount: Math.max(0, o.importeSegundoAnio - o.importePrimerAnio),
        hasPenalty: o.penalizacion,
        isGreen: o.verde,
        // Metadatos para identificar promos condicionales / outliers
        suspect: !!suspectReasons,
        suspectReasons: suspectReasons,
        validez: o.validez || '',
        autoconsumo: !!o.autoconsumo,
      };
    }

    // === Best "real" (no sospechosa) para el hero ===
    // Si la oferta más barata es sospechosa, buscamos la primera no-sospechosa
    // como referencia "creíble". El hero mostrará ambas (dual): la sospechosa
    // marcada con warning + la legítima al lado.
    const mappedTop = topOffers.map(mapOffer);
    const firstLegitimate = mappedTop.find(o => !o.suspect) || mappedTop[0];
    const bestMapped = mapOffer(best);
    const heroMode = bestMapped.suspect && firstLegitimate && firstLegitimate !== bestMapped
      ? 'dual' : 'single';

    return {
      current: {
        company: companyName,
        amount: currentAnnualCost,
      },
      best: bestMapped,
      // Si la mejor es sospechosa, esta es la mejor "creíble" alternativa
      legitimateBest: heroMode === 'dual' ? firstLegitimate : null,
      heroMode: heroMode,
      topOffers: mappedTop,
      alternatives: [],
      savings: currentAnnualCost - best.importePrimerAnio,
      // Ahorro "creíble" — el que esperamos que el usuario realmente consiga
      legitimateSavings: heroMode === 'dual' && firstLegitimate
        ? currentAnnualCost - firstLegitimate.amount
        : currentAnnualCost - best.importePrimerAnio,
      totalOffers: sorted.length,
      userRankPosition: userRankPosition,
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
      // Si finA viene vacío, lo inferimos como iniA + 1 año (el periodo
      // anual del QR cubre 12 meses por definición). Antes mostraba
      // "actualidad" que era incorrecto cuando la factura era reciente.
      let finRaw = qrData.finAnual;
      if (!finRaw) {
        const d = new Date(qrData.inicioAnual);
        if (!isNaN(d)) { d.setFullYear(d.getFullYear() + 1); finRaw = d.toISOString().slice(0, 10); }
      }
      const fin = finRaw ? formatDate(finRaw) : 'actualidad';
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
      const totalStr = `${qrData.importeTotal.toFixed(2)} \u20AC`;
      setText('bill-total', totalStr);
      setText('user-bill-total-kpi', totalStr);
    } else {
      setText('user-bill-total-kpi', '\u2014');
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
      // Si el usuario tiene excedentes de autoconsumo, su €/kWh efectivo se
      // ve distorsionado a la baja (el dinero compensado reduce el "imp"
      // total). Contextualizamos para evitar la contradicción "tarifa muy
      // competitiva" vs "puedes ahorrar X €/año" en la oferta principal.
      const hasAutoconsumo = (qrData.excedentes || 0) > 0;
      costValEl.textContent = `${costeKwh.toFixed(3)} €/kWh`;
      if (dif > 10) {
        costDetEl.innerHTML = `<strong>${Math.round(dif)}% por encima</strong> de la media nacional. Hay margen claro de ahorro.`;
        document.getElementById('reco-coste-card').classList.add('reco-card-alert');
      } else if (dif < -10) {
        if (hasAutoconsumo) {
          costDetEl.innerHTML = `<strong>${Math.abs(Math.round(dif))}% por debajo</strong> de la media, gracias a tu <strong>autoconsumo solar</strong>. El ranking de ofertas compara tarifa pura sin contar excedentes.`;
        } else {
          costDetEl.innerHTML = `<strong>${Math.abs(Math.round(dif))}% por debajo</strong> de la media. Tu tarifa es competitiva en €/kWh.`;
        }
        document.getElementById('reco-coste-card').classList.add('reco-card-good');
      } else {
        costDetEl.innerHTML = `Cerca de la media nacional (${media.toFixed(2)} €/kWh).`;
      }
    } else {
      document.getElementById('reco-coste-card').style.display = 'none';
    }
  }

  // === Estado del usuario actual (para reusar en cada slide del carrusel) ===
  // tipoContrato del QR (`tc`): 0=fijo normal, 1=fijo no estándar, 2=indexado.
  // El BOE no permite distinguir PVPC del libre con este campo, así que NO
  // mostramos "PVPC / Fijo" mezclados — confundía al usuario. Cuando es fijo,
  // mostramos "Precio fijo" sin más matices.
  function buildCurrentContractView(qrData, results) {
    const tipoKey = qrData.tipoContrato === 2 ? 'indexado' : 'precio-fijo';
    const tipoLabel = qrData.tipoContrato === 2 ? 'Indexado al mercado'
      : qrData.tipoContrato === 1 ? 'Fijo no estándar'
      : 'Precio fijo';
    const potencia = qrData.potenciaP1 ? `${qrData.potenciaP1.toFixed(2)} kW` : '—';
    let permanencia = 'Sin permanencia';
    if (qrData.finPenalizacion) {
      const finPen = new Date(qrData.finPenalizacion);
      if (!isNaN(finPen) && finPen > new Date()) {
        permanencia = `Hasta ${finPen.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}`;
      }
    }
    return {
      company: results.current.company,
      tipoKey, tipoLabel,
      potencia,
      permanencia,
      origen: 'Mix nacional',
      pago: results.current.amount,
    };
  }

  // === Ficha técnica de TU contrato (vive en "Tu perfil de gasto") ===
  // Solo datos del contrato actual del usuario. Para la propuesta usar el
  // carrusel.
  function renderAdvancedTable(results, qrData) {
    if (!results) return;
    const cur = buildCurrentContractView(qrData, results);
    const tarifaAccesoKey = qrData.peaje === 19 ? '3.0td' : '2.0td';
    const tarifaAccesoLabel = qrData.peaje === 19 ? '3.0TD (>15 kW)' : '2.0TD (≤15 kW)';
    const tiposContrato = { 0: 'Precio fijo', 1: 'Fijo no estándar', 2: 'Indexado al mercado' };
    setHTML('adv-actual-tarifa', glossaryTerm(tarifaAccesoKey, tarifaAccesoLabel));
    setText('adv-actual-pot-p1', qrData.potenciaP1 ? `${qrData.potenciaP1.toFixed(2)} kW` : '—');
    setText('adv-actual-pot-p2', qrData.potenciaP2 ? `${qrData.potenciaP2.toFixed(2)} kW` : '—');
    setText('adv-actual-tc', tiposContrato[qrData.tipoContrato] || '—');
    setText('adv-actual-perm', cur.permanencia);
    setText('adv-actual-origen', 'Mix nacional');
    setText('adv-actual-coste', `${formatCurrency(results.current.amount)}/año`);
    const consumoTotal = (qrData.consumoAnualP1 || 0) + (qrData.consumoAnualP2 || 0) + (qrData.consumoAnualP3 || 0);
    if (consumoTotal > 0) {
      setText('adv-actual-kwh', `${(results.current.amount / consumoTotal).toFixed(3)} €/kWh`);
    }
    renderPowerSimulator(qrData);
  }

  // === Simulador de potencia interactivo ===
  // Permite al usuario mover un slider entre potencias estándar 2.0TD y ver
  // cómo cambia el coste fijo. Si el pico real (pmaxP*) supera la potencia
  // simulada → warning. Si el pico está muy por debajo → "estás
  // sobrecontratado". Recomendación calculada al cargar.
  const POWER_STEPS = [3.45, 4.6, 5.75, 6.9, 8.05, 9.2, 10.35, 11.5, 12.65, 13.85, 14.49, 15.0];

  function renderPowerSimulator(qrData) {
    const section = $('power-sim-section');
    if (!section || !qrData) return;

    const actualKw = qrData.potenciaP1 || 0;
    const pmaxKw = Math.max(qrData.pmaxP1 || 0, qrData.pmaxP2 || 0);
    if (actualKw <= 0) { section.hidden = true; return; }

    // Precio €/kW/año combinado (P1 + P2) usando datos reales del QR si los hay
    const pricePerKwYear = (qrData.precioPotP1 || 30.67) + (qrData.precioPotP2 || 7.30);

    // Recomendación inicial
    const reco = calculatePowerReco(actualKw, pmaxKw, pricePerKwYear);
    renderPowerReco(reco, actualKw, pricePerKwYear);

    // Marcas (potencia actual, pico)
    const recoIdx = POWER_STEPS.indexOf(reco.suggestedKw);
    const initialIdx = recoIdx >= 0 ? recoIdx : nearestStepIndex(actualKw);

    const slider = $('power-sim-slider');
    slider.max = String(POWER_STEPS.length - 1);
    slider.value = String(initialIdx);

    const renderState = () => {
      const idx = parseInt(slider.value, 10);
      const kw = POWER_STEPS[idx];
      const cost = kw * pricePerKwYear * 1.272; // base + IE + IVA, anual
      const actualCost = actualKw * pricePerKwYear * 1.272;
      const delta = cost - actualCost;
      setText('power-sim-value', kw.toFixed(2));
      // Mostramos €/mes (comparable con el ahorro mensual del cambio de
      // tarifa) y dejamos el €/año debajo como referencia.
      setText('power-sim-cost', `${formatCurrency(cost / 12)}/mes`);
      const sub = $('power-sim-cost-sub');
      if (sub) sub.textContent = `${formatCurrency(cost)}/año en potencia`;
      const deltaEl = $('power-sim-delta');
      if (deltaEl) {
        if (Math.abs(delta) < 1) {
          deltaEl.textContent = 'igual que tu potencia actual';
          deltaEl.className = 'power-sim-delta';
        } else if (delta > 0) {
          deltaEl.textContent = `+${formatCurrency(delta / 12)}/mes vs ahora`;
          deltaEl.className = 'power-sim-delta delta-up';
        } else {
          deltaEl.textContent = `−${formatCurrency(-delta / 12)}/mes vs ahora`;
          deltaEl.className = 'power-sim-delta delta-down';
        }
      }
      renderPowerFeedback(kw, pmaxKw, actualKw);
      updatePowerMarks(actualKw, pmaxKw);
    };
    slider.oninput = renderState;
    renderState();
    section.hidden = false;
  }

  function nearestStepIndex(kw) {
    let bestIdx = 0;
    let bestDiff = Infinity;
    POWER_STEPS.forEach((s, i) => {
      const d = Math.abs(s - kw);
      if (d < bestDiff) { bestDiff = d; bestIdx = i; }
    });
    return bestIdx;
  }

  // Recomendación: sube si pico > 1.05× actual, baja si pico < 0.7× actual.
  function calculatePowerReco(actualKw, pmaxKw, pricePerKwYear) {
    const SAFETY_MARGIN = 1.05;
    if (pmaxKw > actualKw * SAFETY_MARGIN) {
      const targetKw = POWER_STEPS.find(s => s >= pmaxKw * 1.02) || POWER_STEPS[POWER_STEPS.length - 1];
      const extraCost = (targetKw - actualKw) * pricePerKwYear * 1.272;
      return { type: 'up', suggestedKw: targetKw, deltaCost: extraCost, pmaxKw, actualKw };
    }
    if (pmaxKw > 0 && pmaxKw < actualKw * 0.6) {
      const targetKw = POWER_STEPS.find(s => s >= pmaxKw * 1.20) || POWER_STEPS[0];
      const saving = (actualKw - targetKw) * pricePerKwYear * 1.272;
      if (saving > 30) {
        return { type: 'down', suggestedKw: targetKw, deltaCost: -saving, pmaxKw, actualKw };
      }
    }
    return { type: 'ok', suggestedKw: actualKw, deltaCost: 0, pmaxKw, actualKw };
  }

  function renderPowerReco(reco, actualKw, pricePerKwYear) {
    const el = $('power-sim-reco');
    if (!el) return;
    if (reco.type === 'up') {
      const mes = reco.deltaCost / 12;
      el.className = 'power-sim-reco reco-warn';
      el.innerHTML = `<span class="reco-headline">⚡ Te conviene subir la potencia a ${reco.suggestedKw.toFixed(2)} kW</span>
        Tu pico de consumo fue <strong>${reco.pmaxKw.toFixed(2)} kW</strong>, supera la potencia contratada (${actualKw.toFixed(2)} kW).
        <span class="reco-warn-detail"><strong>Si NO la subes:</strong> el ICP te corta la luz cuando enciendas varios aparatos potentes a la vez (horno, vitrocerámica, lavavajillas…). No te cuesta dinero, pero te quedas a oscuras puntualmente.</span>
        <span class="reco-impact">Coste extra al subirla: <strong>+${formatCurrency(mes)}/mes</strong> (${formatCurrency(reco.deltaCost)}/año).</span>`;
    } else if (reco.type === 'down') {
      const mes = -reco.deltaCost / 12;
      el.className = 'power-sim-reco reco-save';
      el.innerHTML = `<span class="reco-headline">💰 Te conviene bajar la potencia a ${reco.suggestedKw.toFixed(2)} kW</span>
        Tu pico fue <strong>${reco.pmaxKw.toFixed(2)} kW</strong>, muy por debajo de tu potencia contratada (${actualKw.toFixed(2)} kW). Estás pagando capacidad que no usas.
        <span class="reco-impact">Ahorro al bajarla: <strong>${formatCurrency(mes)}/mes</strong> (${formatCurrency(-reco.deltaCost)}/año).</span>`;
    } else {
      el.className = 'power-sim-reco reco-ok';
      el.innerHTML = `<span class="reco-headline">✓ Tu potencia contratada es la correcta</span>
        Tu pico fue ${reco.pmaxKw.toFixed(2)} kW y tienes ${actualKw.toFixed(2)} kW contratados — margen adecuado, ni te quedas corto ni pagas de más.`;
    }
  }

  function renderPowerFeedback(simKw, pmaxKw, actualKw) {
    const el = $('power-sim-feedback');
    if (!el) return;
    if (pmaxKw > 0 && simKw < pmaxKw) {
      el.className = 'power-sim-feedback fb-warn';
      el.innerHTML = `⚠ Con <strong>${simKw.toFixed(2)} kW</strong> tu ICP saltaría cuando llegues al pico (${pmaxKw.toFixed(2)} kW). Debes contratar al menos ${POWER_STEPS.find(s => s >= pmaxKw)?.toFixed(2) || 'más'} kW.`;
      return;
    }
    if (pmaxKw > 0 && simKw > pmaxKw * 1.8) {
      el.className = 'power-sim-feedback fb-tip';
      el.innerHTML = `Con <strong>${simKw.toFixed(2)} kW</strong> tienes mucho margen sobre tu pico real (${pmaxKw.toFixed(2)} kW). Salvo que tengas previsto un consumo mucho mayor, podrías bajarla.`;
      return;
    }
    if (Math.abs(simKw - actualKw) < 0.05) {
      el.className = 'power-sim-feedback';
      el.innerHTML = `Es tu <strong>potencia actual</strong>.`;
      return;
    }
    el.className = 'power-sim-feedback fb-good';
    el.innerHTML = `✓ <strong>${simKw.toFixed(2)} kW</strong> cubre tu pico (${pmaxKw > 0 ? pmaxKw.toFixed(2) + ' kW' : 'sin dato'}) con margen.`;
  }

  function updatePowerMarks(actualKw, pmaxKw) {
    const slider = $('power-sim-slider');
    const cur = $('power-sim-mark-current');
    const pic = $('power-sim-mark-pico');
    if (!slider || !cur || !pic) return;
    const max = POWER_STEPS.length - 1;
    const placeAt = (kw, el, label) => {
      if (!kw || kw <= 0) { el.classList.add('hidden'); return; }
      // Mapear kw al rango 0..max usando POWER_STEPS
      let pos = 0;
      for (let i = 0; i < POWER_STEPS.length; i++) {
        if (POWER_STEPS[i] >= kw) {
          if (i === 0) { pos = 0; break; }
          const prev = POWER_STEPS[i - 1];
          const frac = (kw - prev) / (POWER_STEPS[i] - prev);
          pos = i - 1 + frac;
          break;
        }
        if (i === POWER_STEPS.length - 1) pos = i;
      }
      const pct = (pos / max) * 100;
      el.style.left = `${pct}%`;
      el.textContent = label;
      el.classList.remove('hidden');
    };
    placeAt(actualKw, cur, `tu actual ${actualKw.toFixed(2)} kW`);
    placeAt(pmaxKw, pic, `pico ${pmaxKw.toFixed(2)} kW`);
  }

  // === Carrusel de Mejores Ofertas: top 10 con comparación dinámica ===
  // Estado interno del carrusel para que los handlers de filtro/navegación
  // sigan vinculados al mismo dataset entre renders.
  const carouselState = {
    offers: [],          // ofertas filtradas actualmente visibles
    allOffers: [],       // top 10 sin filtrar
    currentIndex: 0,
    filter: 'all',       // 'all' | 'green' | 'noperm'
    cur: null,           // datos del contrato actual del usuario
  };

  // Filas de la columna IZQUIERDA fija con datos del contrato actual del usuario.
  // Las filas se alinean en altura con las de la propuesta para una comparación
  // visual fila a fila.
  function renderCurrentColumn(cur, qrData) {
    setText('offers-cur-company', cur.company);
    const sub = $('offers-cur-subtitle');
    if (sub) sub.textContent = 'Tu situación actual';

    // Tags: datos del contrato actual relevantes para comparar
    const tags = [];
    if (qrData && qrData.tipoContrato === 2) {
      tags.push('<span class="slide-tag tag-warn">Indexado al mercado</span>');
    } else {
      tags.push('<span class="slide-tag">Precio actual</span>');
    }
    const finPen = qrData && qrData.finPenalizacion ? new Date(qrData.finPenalizacion) : null;
    if (finPen && !isNaN(finPen) && finPen > new Date()) {
      tags.push('<span class="slide-tag tag-warn">⚠ Permanencia activa</span>');
    }
    setHTML('offers-cur-tags', tags.join(''));

    const rows = $('offers-cur-rows');
    if (rows) {
      rows.innerHTML = `
        <li class="offers-col-row" data-row="tipo"><span class="offers-col-key">Tipo</span><span class="offers-col-value">${glossaryTerm(cur.tipoKey, cur.tipoLabel)}</span></li>
        <li class="offers-col-row" data-row="potencia"><span class="offers-col-key">Potencia</span><span class="offers-col-value">${cur.potencia}</span></li>
        <li class="offers-col-row" data-row="permanencia"><span class="offers-col-key">Permanencia</span><span class="offers-col-value">${cur.permanencia}</span></li>
        <li class="offers-col-row" data-row="origen"><span class="offers-col-key">Origen</span><span class="offers-col-value">${glossaryTerm('mix-nacional', 'Mix nacional')}</span></li>
        <li class="offers-col-row offers-col-row-total" data-row="pago"><span class="offers-col-key">Pago/año</span><span class="offers-col-value">${formatCurrency(cur.pago)}/año</span></li>
      `;
    }
  }

  // Slide = solo la COLUMNA derecha (propuesta de la oferta). Misma estructura
  // de filas que el actual, mismas alturas, para que la comparación sea visual
  // fila a fila aunque el actual sea estático.
  function buildSlideHTML(offer, rank, cur, qrData) {
    // Tags (features de la oferta). Sin chip de ahorro aquí — va aparte como banner.
    const features = [];
    if (offer.suspect) features.push('<span class="slide-tag tag-warn">⚠ Promoción condicional</span>');
    if (offer.isGreen) features.push('<span class="slide-tag tag-green">🌿 100% verde</span>');
    if (!offer.hasPenalty) features.push('<span class="slide-tag">🔒 Sin permanencia</span>');
    else features.push('<span class="slide-tag tag-warn">12 meses permanencia</span>');
    if (offer.hasDiscount && offer.discountAmount >= 20) {
      features.push('<span class="slide-tag tag-discount">🎁 Descuento de bienvenida</span>');
    }
    // Si el usuario tiene autoconsumo, indicamos si la oferta lo compensa
    // según el flag oficial de la CNMC.
    const userHasAutoconsumo = qrData && qrData.excedentes > 0;
    if (userHasAutoconsumo) {
      if (offer.autoconsumo) {
        features.push('<span class="slide-tag tag-green">☀ Compensa excedentes</span>');
      } else {
        features.push('<span class="slide-tag tag-warn">☀ No compensa excedentes</span>');
      }
    }

    const diff = cur.pago - offer.amount;
    const pct = cur.pago > 0 ? Math.round((diff / cur.pago) * 100) : 0;

    // Banner de ahorro/sobrecoste destacado encima del CTA
    let savingsBanner = '';
    if (diff > 0) {
      savingsBanner = `<div class="slide-savings-banner good">
        <span class="slide-savings-icon">💰</span>
        <div class="slide-savings-text">
          <span class="slide-savings-amount">Te ahorras ${formatCurrency(diff)}/año</span>
          <span class="slide-savings-detail">${pct}% menos que tu tarifa actual${offer.hasDiscount ? ' (con descuento de bienvenida el 1er año)' : ''}</span>
        </div>
      </div>`;
    } else if (diff < 0) {
      savingsBanner = `<div class="slide-savings-banner warn">
        <span class="slide-savings-icon">⚠</span>
        <div class="slide-savings-text">
          <span class="slide-savings-amount">+${formatCurrency(-diff)}/año más caro</span>
          <span class="slide-savings-detail">${Math.abs(pct)}% más que tu tarifa actual</span>
        </div>
      </div>`;
    } else {
      savingsBanner = `<div class="slide-savings-banner neutral">
        <span class="slide-savings-icon">≈</span>
        <div class="slide-savings-text">
          <span class="slide-savings-amount">Mismo precio</span>
          <span class="slide-savings-detail">igual que tu tarifa actual</span>
        </div>
      </div>`;
    }

    const pagoNuevoHTML = offer.hasDiscount
      ? `${formatCurrency(offer.amount)}/año <span class="contract-discount-tag">1er año</span>` +
        `<span class="contract-discount-after">luego ${formatCurrency(offer.secondYearAmount)}/año</span>`
      : `${formatCurrency(offer.amount)}/año`;

    const url = getCompanyUrl(offer.company, offer.offerName);
    const rankBadge = rank === 1
      ? `<span class="slide-rank-badge star">★ #1</span>`
      : `<span class="slide-rank-badge">#${rank}</span>`;

    // Banner especial encima del slide si la oferta es sospechosa (Solar Free,
    // outlier brutal). Sustituye el savings-banner verde por uno amarillo.
    const suspectBanner = offer.suspect ? buildSuspectBanner(offer) : '';

    // Acordeón con desglose detallado (tabla "¿por qué te ahorras X?")
    const breakdown = buildBreakdownTable(offer, cur, qrData);

    // Atenuamos las filas IDÉNTICAS al contrato actual para que las
    // diferencias destaquen. Potencia siempre la asumimos igual; tipo y
    // permanencia se comparan dinámicamente.
    const tipoNuevoLabel = 'Precio fijo';
    const permNuevoLabel = offer.hasPenalty ? '12 meses' : 'Sin permanencia';
    const tipoSame = tipoNuevoLabel === cur.tipoLabel;
    const permSame = permNuevoLabel === cur.permanencia;
    const SAME = '<span class="row-same-tag">igual</span>';

    return `
      <article class="offers-proposed-slide${offer.suspect ? ' suspect' : ''}" data-rank="${rank}">
        <div class="offers-col-tag offers-col-tag-new">Propuesta ${rankBadge}</div>
        <div class="offers-col-company">${offer.company}</div>
        <div class="offers-col-subtitle">${offer.offerName || ''}</div>
        <div class="slide-tags">${features.join('')}</div>
        <ul class="offers-col-rows">
          <li class="offers-col-row ${tipoSame ? 'row-same' : ''}" data-row="tipo"><span class="offers-col-key">Tipo</span><span class="offers-col-value">${glossaryTerm('precio-fijo', tipoNuevoLabel)}${tipoSame ? ' ' + SAME : ''}</span></li>
          <li class="offers-col-row row-same" data-row="potencia"><span class="offers-col-key">Potencia</span><span class="offers-col-value">${cur.potencia} ${SAME}</span></li>
          <li class="offers-col-row ${offer.hasPenalty && cur.permanencia === 'Sin permanencia' ? 'row-warn' : ''} ${permSame ? 'row-same' : ''}" data-row="permanencia">
            <span class="offers-col-key">Permanencia</span>
            <span class="offers-col-value">${permNuevoLabel}${permSame ? ' ' + SAME : ''}</span>
          </li>
          <li class="offers-col-row ${offer.isGreen ? 'row-good' : ''}" data-row="origen">
            <span class="offers-col-key">Origen</span>
            <span class="offers-col-value">${offer.isGreen ? glossaryTerm('100-renovable', '100% renovable') : 'Mix nacional'}</span>
          </li>
          <li class="offers-col-row offers-col-row-total ${diff > 0 ? 'row-good' : (diff < 0 ? 'row-warn' : '')}" data-row="pago">
            <span class="offers-col-key">Pago/año</span>
            <span class="offers-col-value">${pagoNuevoHTML}</span>
          </li>
        </ul>
        ${suspectBanner || savingsBanner}
        ${breakdown}
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="slide-cta${offer.suspect ? ' slide-cta-suspect' : ''}">
          ${offer.suspect ? 'Ver condiciones en' : 'Cambiar a'} ${offer.company} →
        </a>
      </article>
    `;
  }

  // Banner que sustituye el savings-banner verde cuando la oferta es
  // sospechosa: tono amarillo + razón explícita en vez de "te ahorras X".
  function buildSuspectBanner(offer) {
    const reasons = offer.suspectReasons || [];
    const isSolar = /\bsolar\b/i.test(offer.offerName || '');
    const headline = isSolar
      ? 'Requiere placas solares con esta comercializadora'
      : (reasons.some(r => r.type === 'suspect-name')
          ? 'Promoción con condiciones especiales'
          : 'Precio sospechosamente bajo');
    const detail = isSolar
      ? `Es una promoción tipo "Solar Free": el descuento sólo se activa si instalas placas contratándolas con ${offer.company}.`
      : (offer.validez
          ? `Letra pequeña CNMC: ${offer.validez}`
          : 'Verifica los requisitos en la web de la comercializadora antes de contratar.');
    return `<div class="slide-savings-banner suspect">
      <span class="slide-savings-icon">⚠</span>
      <div class="slide-savings-text">
        <span class="slide-savings-amount">${headline}</span>
        <span class="slide-savings-detail">${detail}</span>
      </div>
    </div>`;
  }

  // Tabla expandible con desglose actual vs estimación nueva oferta.
  // Datos reales del usuario (del QR) en la columna izquierda; estimación
  // proporcional al total en la derecha. Sin desglose oficial por oferta de
  // la CNMC, los componentes nuevos son ESTIMADOS asumiendo que los precios
  // de potencia y los impuestos son ~estables y la mayor variación está en
  // el coste de la energía.
  function buildBreakdownTable(offer, cur, qrData) {
    if (!qrData || cur.pago <= 0) return '';
    const rows = computeBreakdownRows(offer, cur, qrData);
    if (!rows) return '';
    const totalSaving = cur.pago - offer.amount;
    const energySaving = rows.find(r => r.key === 'energia')?.delta || 0;
    const powerSaving = rows.find(r => r.key === 'potencia')?.delta || 0;
    const taxSaving = rows.find(r => r.key === 'impuestos')?.delta || 0;
    const dominant =
      Math.abs(energySaving) >= Math.abs(powerSaving) && Math.abs(energySaving) >= Math.abs(taxSaving) ? 'energia' :
      Math.abs(powerSaving) >= Math.abs(taxSaving) ? 'potencia' : 'impuestos';
    const headline = totalSaving > 0
      ? (dominant === 'energia'
          ? `Te ahorras ${formatCurrency(totalSaving)}/año principalmente en el <strong>precio de la energía</strong>.`
          : dominant === 'potencia'
            ? `Te ahorras ${formatCurrency(totalSaving)}/año sobre todo en <strong>potencia contratada</strong>.`
            : `Te ahorras ${formatCurrency(totalSaving)}/año por menor coste de <strong>peajes e impuestos</strong>.`)
      : `Esta oferta cuesta ${formatCurrency(-totalSaving)}/año más que tu tarifa actual.`;

    // data-label en cada celda → en mobile la tabla se reformatea como lista
    // vertical (label + valores apilados) sin perder semántica.
    const colTu = 'Tu factura';
    const colNueva = `Con ${offer.company}`;
    const rowHTML = rows.map(r => `
      <tr class="${r.delta > 0 ? 'row-saves' : r.delta < 0 ? 'row-costs' : ''}">
        <th scope="row">${r.label}</th>
        <td data-label="${colTu}">${formatCurrency(r.current)}</td>
        <td data-label="${colNueva}">${r.newEstimated != null ? '~' + formatCurrency(r.newEstimated) : '—'}</td>
        <td class="td-delta" data-label="Diferencia">${r.delta !== 0 ? (r.delta > 0 ? '−' : '+') + formatCurrency(Math.abs(r.delta)) : '—'}</td>
      </tr>
    `).join('');

    return `
      <details class="slide-breakdown">
        <summary class="slide-breakdown-summary">
          <span class="slide-breakdown-icon" aria-hidden="true">📊</span>
          <span>¿Por qué te ahorras esto?</span>
          <span class="slide-breakdown-chevron" aria-hidden="true">▾</span>
        </summary>
        <div class="slide-breakdown-content">
          <p class="slide-breakdown-headline">${headline}</p>
          <table class="slide-breakdown-table">
            <thead>
              <tr>
                <th></th>
                <th>${colTu}</th>
                <th>${colNueva}</th>
                <th>Δ</th>
              </tr>
            </thead>
            <tbody>${rowHTML}</tbody>
            <tfoot>
              <tr>
                <th>Total anual</th>
                <td data-label="${colTu}">${formatCurrency(cur.pago)}</td>
                <td data-label="${colNueva}"><strong>${formatCurrency(offer.amount)}</strong></td>
                <td class="td-delta" data-label="Diferencia">${totalSaving > 0 ? '−' + formatCurrency(totalSaving) : '+' + formatCurrency(-totalSaving)}</td>
              </tr>
            </tfoot>
          </table>
          <p class="slide-breakdown-disclaimer">
            La columna "Con ${offer.company}" es una <strong>estimación</strong>: la CNMC no publica el desglose por componente de cada oferta. Asumimos peajes e impuestos similares (dependen de tu consumo, no de la comercializadora).
          </p>
        </div>
      </details>
    `;
  }

  // Calcula filas del desglose: potencia, energía e impuestos+peajes.
  // - Columna izquierda: precios REALES del QR del usuario.
  // - Columna derecha: ESTIMACIÓN. Asumimos que la potencia es similar
  //   (varía poco entre comercializadoras), y los peajes/impuestos también.
  //   La diferencia restante se imputa al coste de la energía.
  function computeBreakdownRows(offer, cur, qrData) {
    const consumoTotal = (qrData.consumoAnualP1 || 0) + (qrData.consumoAnualP2 || 0) + (qrData.consumoAnualP3 || 0);
    if (consumoTotal <= 0) return null;
    const pP1 = qrData.potenciaP1 || 0;
    const pP2 = qrData.potenciaP2 || pP1;
    const prP1 = qrData.precioPotP1 || 0;
    const prP2 = qrData.precioPotP2 || 0;
    const prE1 = qrData.precioEnerP1 || 0;
    const prE2 = qrData.precioEnerP2 || 0;
    const prE3 = qrData.precioEnerP3 || 0;

    // Coste base (sin impuestos)
    const costePotActual = pP1 * prP1 + pP2 * prP2;
    const costeEneActual = (qrData.consumoAnualP1 || 0) * prE1
                         + (qrData.consumoAnualP2 || 0) * prE2
                         + (qrData.consumoAnualP3 || 0) * prE3;
    if (costePotActual + costeEneActual <= 0) return null;

    // Reconstruir impuestos a partir del total: total = (base) * 1.0511 * 1.21
    // → base = total / 1.272 (aprox). Impuestos = total - base.
    const TAX_FACTOR = 1.0511 * 1.21; // ≈ 1.272
    const baseActual = cur.pago / TAX_FACTOR;
    const impuestosActual = cur.pago - baseActual;

    // Para la oferta nueva, estimamos:
    // - Potencia: misma que la actual (asumiendo cambio sin tocar potencia)
    // - Impuestos: proporcionales al total (cur.amount)
    const baseNueva = offer.amount / TAX_FACTOR;
    const impuestosNueva = offer.amount - baseNueva;
    let costePotNueva = costePotActual; // asunción: misma potencia
    let costeEneNueva = baseNueva - costePotNueva;

    // Outlier extremo (caso "Solar Free" a 237€ con consumo de 9809 kWh):
    // base estimada queda por debajo del coste de potencia → energía sale
    // negativa. Significa que la oferta cobra ~0€/kWh de energía. En ese
    // caso ajustamos la potencia a la baja también (probablemente la
    // promoción ofrece todo a precio reducido, no sólo energía).
    if (costeEneNueva < 0) {
      const ratio = baseNueva / Math.max(costePotActual + costeEneActual, 1);
      costePotNueva = costePotActual * Math.max(0, ratio);
      costeEneNueva = baseNueva - costePotNueva;
    }

    return [
      {
        key: 'potencia',
        label: `Potencia (${pP1} kW)`,
        current: costePotActual,
        newEstimated: costePotNueva,
        delta: costePotActual - costePotNueva,
      },
      {
        key: 'energia',
        label: `Energía (${Math.round(consumoTotal)} kWh)`,
        current: costeEneActual,
        newEstimated: Math.max(0, costeEneNueva),
        delta: costeEneActual - Math.max(0, costeEneNueva),
      },
      {
        key: 'impuestos',
        label: 'Peajes + IE + IVA',
        current: impuestosActual,
        newEstimated: impuestosNueva,
        delta: impuestosActual - impuestosNueva,
      },
    ];
  }

  function renderCarouselFrame() {
    const trackEl = $('offers-track');
    if (!trackEl) return;
    trackEl.innerHTML = carouselState.offers
      .map((offer, i) => buildSlideHTML(offer, i + 1, carouselState.cur, carouselState.qrData))
      .join('');
    // Dots
    const dotsEl = $('offers-dots');
    if (dotsEl) {
      dotsEl.innerHTML = carouselState.offers
        .map((_, i) => `<button type="button" class="carousel-dot ${i === carouselState.currentIndex ? 'active' : ''}" data-idx="${i}" aria-label="Ir a oferta ${i + 1}"></button>`)
        .join('');
    }
    updateCarouselPosition();
  }

  function updateCarouselPosition() {
    const trackEl = $('offers-track');
    if (!trackEl) return;
    trackEl.style.transform = `translateX(-${carouselState.currentIndex * 100}%)`;
    document.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === carouselState.currentIndex);
    });
    setText('offers-counter', `${carouselState.currentIndex + 1} de ${carouselState.offers.length}`);
    const prev = $('carousel-prev'); const next = $('carousel-next');
    if (prev) prev.disabled = carouselState.currentIndex === 0;
    if (next) next.disabled = carouselState.currentIndex >= carouselState.offers.length - 1;
    // Reactivo: refrescar el análisis para reflejar el slide visible.
    refreshAnalysisForCurrentSlide();
    // Analytics: emitir solo cuando cambia la oferta visible (no en cada re-render
    // que dispara updateCarouselPosition con el mismo índice).
    const off = carouselState.offers[carouselState.currentIndex];
    if (off && carouselState._lastTrackedIdx !== carouselState.currentIndex) {
      carouselState._lastTrackedIdx = carouselState.currentIndex;
      track('carousel_slide', {
        index: carouselState.currentIndex,
        company: off.company,
        suspect: !!off.suspect,
      });
    }
  }

  // Refresca insight + puntos clave para la oferta actualmente visible en el
  // carrusel. Llamado desde updateCarouselPosition() y desde applyFilter().
  function refreshAnalysisForCurrentSlide() {
    const offer = carouselState.offers[carouselState.currentIndex];
    if (!offer || !carouselState.results || !carouselState.qrData) return;
    const results = carouselState.results;
    const qrData = carouselState.qrData;
    const scenario = carouselState.scenario;
    setHTML('insight-text', buildInsight(results, qrData, offer));
    renderPuntosClave(scenario, qrData, results, offer);
    // Pill contextual: deja claro al usuario que el análisis es para esa oferta.
    const pill = $('analisis-context-pill');
    const pillVal = $('analisis-context-offer');
    if (pill && pillVal) {
      // Solo nombre de comercializadora — el nombre de la tarifa lo alargaba
      // demasiado en mobile y rompía la línea con feo wrapping.
      pillVal.textContent = offer.company;
      pill.hidden = false;
    }
  }

  function navigateCarousel(direction) {
    const len = carouselState.offers.length;
    if (len === 0) return;
    carouselState.currentIndex = Math.max(0, Math.min(len - 1, carouselState.currentIndex + direction));
    updateCarouselPosition();
  }

  function applyFilter(filterKey) {
    carouselState.filter = filterKey;
    let filtered = carouselState.allOffers.slice();
    if (filterKey === 'green') filtered = filtered.filter(o => o.isGreen);
    if (filterKey === 'noperm') filtered = filtered.filter(o => !o.hasPenalty);
    carouselState.offers = filtered;
    carouselState.currentIndex = 0;
    // El re-render por cambio de filtro no es un "slide" del usuario: evitamos
    // que updateCarouselPosition lo cuente como carousel_slide.
    carouselState._lastTrackedIdx = 0;
    // Analytics: el usuario filtró el carrusel (solo se llama desde el click
    // en los chips de filtro, así que siempre es acción real).
    track('filter_applied', { filter: filterKey, count: filtered.length });
    // Toggle chip active state
    document.querySelectorAll('.filter-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.filter === filterKey);
    });
    // Microcopy: cuánto cuesta el filtro vs sin filtrar
    const note = $('offers-filter-note');
    if (note) {
      if (filterKey !== 'all' && filtered.length > 0 && carouselState.allOffers.length > 0) {
        const cheapestFiltered = filtered[0].amount;
        const cheapestAll = carouselState.allOffers[0].amount;
        const extra = cheapestFiltered - cheapestAll;
        if (extra > 0) {
          note.textContent = `Con este filtro la mejor opción cuesta ${formatCurrency(extra)} más al año que sin filtrar.`;
          note.hidden = false;
        } else {
          note.hidden = true;
        }
      } else {
        note.hidden = true;
      }
    }
    renderCarouselFrame();
  }

  // Mensaje contextual encima del carrusel — distinto por casuística.
  // Cubre: rank-1 (ya tienes la mejor), rank-top3 (ya estás en el top),
  // already-cheap (no hay nada mejor), big/normal/small-savings (cuánto ahorras).
  function renderCarouselContextNote(scenario, results) {
    const el = $('offers-context-note');
    if (!el) return;
    // En hero dual usamos savings legítimos (no el outlier sospechoso).
    const best = results && results.best;
    const savings = (results && (results.legitimateSavings != null ? results.legitimateSavings : results.savings)) || 0;
    const cur = scenario && scenario.modifiers ? scenario.modifiers : {};
    let tone = 'info', icon = 'ℹ', text = '';

    switch (scenario.primaryCase) {
      case 'rank-1':
        tone = 'good'; icon = '🏆';
        text = `<strong>Ya tienes la mejor oferta del mercado.</strong> Estas son las alternativas top si quisieras cambiar.`;
        break;
      case 'rank-top3':
        tone = 'good'; icon = '✓';
        text = `<strong>Tu oferta ya está entre las más competitivas.</strong> Te mostramos las top 10 por si encuentras algo mejor.`;
        break;
      case 'already-cheap':
        tone = 'info'; icon = '👌';
        text = `<strong>Ninguna oferta de la CNMC mejora tu tarifa actual.</strong> Mantén la que tienes — estas son las más competitivas para comparar.`;
        break;
      case 'big-savings':
        tone = 'good'; icon = '💰';
        text = best
          ? `Hay ahorros significativos: hasta <strong>${formatCurrency(savings)}/año</strong> cambiándote. Estas son las mejores ofertas.`
          : `Hay ahorros significativos disponibles. Estas son las mejores ofertas.`;
        break;
      case 'normal-savings':
        tone = 'good'; icon = '💸';
        text = `Hay ofertas más baratas que la tuya — hasta <strong>${formatCurrency(savings)}/año</strong>. Estas son las top 10.`;
        break;
      case 'small-savings':
        tone = 'info'; icon = 'ℹ';
        text = `El margen de mejora es pequeño (<strong>~${formatCurrency(savings)}/año</strong>). Aun así, estas son las mejores alternativas.`;
        break;
      case 'no-offers':
        el.hidden = true; return;
      default:
        el.hidden = true; return;
    }

    el.className = `offers-context-note ${tone}`;
    el.innerHTML = `<span class="ctx-icon" aria-hidden="true">${icon}</span><span class="ctx-text">${text}</span>`;
    el.hidden = false;
  }

  function renderOffersCarousel(results, qrData, scenario) {
    if (!results || !results.topOffers || results.topOffers.length === 0) {
      const sec = $('section-ofertas'); if (sec) sec.style.display = 'none';
      return;
    }
    // Init state
    carouselState.allOffers = results.topOffers;
    carouselState.cur = buildCurrentContractView(qrData, results);
    carouselState.qrData = qrData;
    carouselState.results = results;
    carouselState.scenario = scenario;
    carouselState.filter = 'all';
    carouselState.offers = results.topOffers.slice();
    // Arrancar en la primera oferta LEGÍTIMA (no en la sospechosa). Así el
    // análisis reactivo encaja con lo que el hero ya está afirmando.
    const firstLegitIdx = carouselState.offers.findIndex(o => !o.suspect);
    carouselState.currentIndex = firstLegitIdx >= 0 ? firstLegitIdx : 0;
    // No contar el render inicial como "scroll del usuario": marcamos el índice
    // de arranque como ya trackeado, para que carousel_slide solo dispare cuando
    // el usuario navega de verdad (flechas, dots, swipe).
    carouselState._lastTrackedIdx = carouselState.currentIndex;

    // Meta: posición usuario
    setText('offers-total-count', results.totalOffers);
    setText('offers-user-rank', results.userRankPosition
      ? `puesto ${results.userRankPosition}`
      : 'puesto desconocido');

    // Nota contextual según casuística (rank-1, already-cheap, big-savings, etc.)
    renderCarouselContextNote(scenario, results);

    // Columna izquierda (actual) — fija, se pinta una vez
    renderCurrentColumn(carouselState.cur, qrData);
    renderCarouselFrame();

    // Wire up event handlers (idempotente: re-bind seguro)
    const prev = $('carousel-prev');
    const next = $('carousel-next');
    const dots = $('offers-dots');
    const filters = $('offers-filters');
    if (prev) prev.onclick = () => navigateCarousel(-1);
    if (next) next.onclick = () => navigateCarousel(1);
    if (dots) dots.onclick = e => {
      const dot = e.target.closest('.carousel-dot');
      if (!dot) return;
      const idx = parseInt(dot.dataset.idx, 10);
      if (!isNaN(idx)) { carouselState.currentIndex = idx; updateCarouselPosition(); }
    };
    if (filters) filters.onclick = e => {
      const chip = e.target.closest('.filter-chip');
      if (chip) applyFilter(chip.dataset.filter);
    };
    // Swipe en mobile (sobre toda la sección de comparación)
    const swipeArea = document.querySelector('.offers-compare');
    if (swipeArea) {
      let startX = 0, startY = 0;
      swipeArea.ontouchstart = e => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      };
      swipeArea.ontouchend = e => {
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        // Solo cuenta como swipe horizontal si predomina X sobre Y (evita
        // confundirse con scroll vertical de la página).
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          navigateCarousel(dx < 0 ? 1 : -1);
        }
      };
    }
    // Keyboard
    document.addEventListener('keydown', e => {
      if (!$('screen-result').classList.contains('active')) return;
      if (e.target.matches('input, textarea, button')) return;
      if (e.key === 'ArrowLeft') navigateCarousel(-1);
      else if (e.key === 'ArrowRight') navigateCarousel(1);
    });

    // Ficha técnica del contrato actual (en "Tu perfil de gasto")
    renderAdvancedTable(results, qrData);
  }

  // === "Puntos clave": bullets compactos derivados de los modifiers ===
  // Cada modifier aplicable se traduce en una línea con tipo (good/warn/tip/info)
  // y prioridad para ordenarlos. Los 5 primeros se muestran; el resto va a un
  // "Ver más" desplegable.
  // displayOffer (opcional) → si se pasa, los puntos clave se generan para
  // esa oferta concreta. Útil para que el bloque de hallazgos reaccione al
  // slide actual del carrusel. Sin él, usamos la mejor legítima como antes.
  function buildPuntosClave(scenario, results, qrData, displayOffer) {
    const m = scenario.modifiers || {};
    const best = displayOffer || (results && (results.legitimateBest || results.best));
    const puntos = [];

    // Si la oferta seleccionada es sospechosa (Solar Free, outlier), avisamos
    // explícitamente en el primer hallazgo.
    if (best && best.suspect) {
      puntos.push({ type: 'warn', priority: 0,
        text: `${best.offerName || best.company} es una promoción condicional — verifica requisitos antes de contar con este ahorro` });
    }

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

  function renderPuntosClave(scenario, qrData, results, displayOffer) {
    // El bloque ahora vive dentro de "Nuestro análisis" (.puntos-clave-wrap)
    const wrap = document.querySelector('.puntos-clave-wrap');
    if (!wrap) return;
    const puntos = buildPuntosClave(scenario, results, qrData, displayOffer);
    if (puntos.length === 0) {
      wrap.style.display = 'none';
      return;
    }
    wrap.style.display = '';
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
    addClass('savings-hero', 'no-savings');
    setHero(
      isRank1 ? 'Enhorabuena' : 'Tu tarifa actual',
      isRank1 ? '✓ Tienes la mejor oferta' : 'Entre las mejores tarifas',
      `Puesto #${results.currentCompanyRank} de ${results.totalOffers} ofertas analizadas`,
      null
    );
    setText('best-header', isRank1
      ? 'Tu oferta actual es la #1'
      : `Tu oferta actual: puesto #${results.currentCompanyRank}`);
    const bestBadge = $('result-badge');
    if (bestBadge) {
      bestBadge.textContent = `#${results.currentCompanyRank} de ${results.totalOffers}`;
      bestBadge.classList.add('badge-good');
    }
    setText('alt-header', 'La competencia (por transparencia)');
    setHTML('insight-text', isRank1
      ? `<strong>${results.current.company} tiene la mejor tarifa del mercado</strong> para tu perfil entre las ${results.totalOffers} ofertas disponibles. No necesitas cambiar nada. Te mostramos la competencia abajo solo por transparencia &mdash; comprueba que estamos siendo honestos contigo.`
      : `${results.current.company} está en el <strong>puesto #${results.currentCompanyRank} de ${results.totalOffers}</strong>. La diferencia con la #1 es marginal (probablemente <2%), así que el esfuerzo de cambiar no compensa. Repasa la competencia abajo si tienes curiosidad.`);
    setDisplay('result-savings', 'none');
    setDisplay('section-howto', 'none');
  }

  // Helper: aplica los textos del hero con el nuevo orden (sub = cambiando a X,
  // context = mensaje secundario opcional como "X% de más").
  function setHero(label, amount, sub, context) {
    setText('savings-hero-label', label);
    setText('savings-hero-amount', amount);
    setHTML('savings-hero-sub', sub || '');
    const ctxEl = $('savings-hero-context');
    if (ctxEl) {
      ctxEl.innerHTML = context || '';
      ctxEl.style.display = context ? '' : 'none';
    }
  }

  // Helper común que aplica el chrome común del resultado (badge, alt-header,
  // insight, howto). Usa los wrappers defensivos para no petar si algún
  // elemento no está en el DOM (HTML viejo cacheado).
  function applyResultChrome(opts) {
    const { heroClassAdd, heroClassRemove, badgeText, badgeGood, bestHeader, altHeader, insightHTML, showHowto } = opts;
    const hero = $('savings-hero');
    if (hero) {
      (heroClassRemove || []).forEach(c => hero.classList.remove(c));
      (heroClassAdd || []).forEach(c => hero.classList.add(c));
    }
    setText('best-header', bestHeader);
    const badge = $('result-badge');
    if (badge) {
      badge.textContent = badgeText;
      badge.classList.toggle('badge-good', !!badgeGood);
    }
    setText('alt-header', altHeader);
    setHTML('insight-text', insightHTML);
    setDisplay('result-savings', 'none');
    setDisplay('section-howto', showHowto ? '' : 'none');
  }

  // En hero dual usamos la oferta legítima (no la sospechosa). El "ahorro"
  // que se anuncia es el realista — la promo condicional va en card aparte.
  function heroDisplay(results) {
    if (results.heroMode === 'dual' && results.legitimateBest) {
      return { offer: results.legitimateBest, savings: results.legitimateSavings };
    }
    return { offer: results.best, savings: results.savings };
  }

  function renderCaseBigSavings(results, qrData, scenario) {
    const d = heroDisplay(results);
    setHero(
      'Tu ahorro anual',
      `${formatCurrency(d.savings)}/año`,
      `cambiando a <strong>${d.offer.company}</strong>`,
      `Pagas <strong>${formatCurrency(d.savings / 12)} más cada mes</strong> de lo que deberías`
    );
    applyResultChrome({
      heroClassRemove: ['no-savings'],
      heroClassAdd: ['savings-big'],
      bestHeader: 'Mejor oferta del mercado',
      badgeText: `#1 de ${results.totalOffers}`,
      altHeader: 'También podrías considerar',
      insightHTML: buildInsight(results, qrData),
      showHowto: true,
    });
  }

  function renderCaseNormalSavings(results, qrData, scenario) {
    const d = heroDisplay(results);
    setHero(
      'Tu ahorro anual',
      `${formatCurrency(d.savings)}/año`,
      `cambiando a <strong>${d.offer.company}</strong>`,
      `Pagas <strong>${formatCurrency(d.savings / 12)} más cada mes</strong> de lo que deberías`
    );
    applyResultChrome({
      heroClassRemove: ['no-savings', 'savings-big'],
      bestHeader: 'Mejor oferta del mercado',
      badgeText: `#1 de ${results.totalOffers}`,
      altHeader: 'También podrías considerar',
      insightHTML: buildInsight(results, qrData),
      showHowto: true,
    });
  }

  // Renderiza la card de oferta sospechosa que va justo bajo el hero cuando
  // la #1 del CNMC tiene condiciones especiales (promo de placas solares,
  // "Free", outlier de precio). Si no aplica, oculta la card.
  function renderSuspectCard(suspect, results) {
    const card = $('suspect-offer-card');
    if (!card) return;
    // Blindaje: sólo mostramos la card si hay una oferta sospechosa REAL con
    // datos completos. Sin esto, un estado intermedio o un HTML cacheado
    // desincronizado dejaba la card visible con placeholders "—".
    if (!suspect || !suspect.company || !(suspect.amount > 0)) {
      card.hidden = true;
      return;
    }
    setText('suspect-card-company', suspect.company);
    setText('suspect-card-tariff', suspect.offerName);
    const totalSaving = results.current.amount - suspect.amount;
    const lowerName = (suspect.offerName || '').toLowerCase();
    const conditionShort = lowerName.includes('solar')
      ? 'sólo si instalas placas con ellos'
      : 'sólo si cumples sus requisitos';
    // Copy directo: el precio absoluto + ahorro entre paréntesis, y el "pero…"
    // pegado para que se entienda en un vistazo.
    setText('suspect-card-saving', `${formatCurrency(suspect.amount)}/año (${formatCurrency(totalSaving)} menos)`);
    setText('suspect-card-aftermath', `…pero ${conditionShort}`);
    const reasons = suspect.suspectReasons || [];
    const explainParts = [];
    if (lowerName.includes('solar')) {
      explainParts.push(`Esta tarifa es una <strong>promoción para autoconsumo</strong>: el descuento sólo aplica si instalas las placas solares contratándolas con ${suspect.company}. Si ya tienes placas con otra empresa o no las quieres instalar, <strong>esta oferta no te sirve</strong>.`);
    } else if (reasons.some(r => r.type === 'suspect-name')) {
      explainParts.push('El nombre sugiere una <strong>promoción condicional</strong> (cliente nuevo, requisitos especiales). Verifica los requisitos en la web de la comercializadora antes de contar con este ahorro.');
    }
    if (reasons.some(r => r.type === 'price-outlier') && !lowerName.includes('solar')) {
      explainParts.push('El precio es <strong>anormalmente bajo</strong> comparado con el resto del mercado. Suele indicar condiciones que la CNMC no muestra.');
    }
    if (suspect.validez) {
      explainParts.push(`<em>Letra pequeña CNMC:</em> ${suspect.validez}`);
    }
    setHTML('suspect-card-reason', explainParts.join(' '));
    card.hidden = false;
  }

  function renderCaseSmallSavings(results, qrData, scenario) {
    setHero(
      'Ahorro marginal',
      `${formatCurrency(results.savings)}/año`,
      `cambiando a <strong>${results.best.company}</strong>`,
      `Tu tarifa actual es razonable. Valora si el cambio compensa.`
    );
    applyResultChrome({
      heroClassRemove: ['no-savings', 'savings-big'],
      bestHeader: 'Mejor oferta del mercado',
      badgeText: `#1 de ${results.totalOffers}`,
      altHeader: 'También podrías considerar',
      insightHTML: buildInsight(results, qrData),
      showHowto: true,
    });
  }

  function renderCaseAlreadyCheap(results, qrData, scenario) {
    setHero(
      'Tu tarifa actual',
      'Ya es muy competitiva',
      `No hemos encontrado nada mejor entre ${results.totalOffers} ofertas`,
      null
    );
    applyResultChrome({
      heroClassAdd: ['no-savings'],
      bestHeader: 'La oferta más barata del mercado',
      badgeText: `#1 de ${results.totalOffers}`,
      altHeader: 'Otras ofertas del mercado',
      insightHTML: `Tu tarifa actual cuesta <strong>${formatCurrency(results.current.amount)}/año</strong>, igual o más barata que cualquier oferta de mercado libre. No hay nada que rascar cambiando de comercializadora &mdash; revisa el bloque de análisis adicional por si puedes optimizar otros aspectos.`,
      showHowto: false,
    });
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
      track('results_shown', { case: scenario.primaryCase, totalOffers: results.totalOffers || 0 });
      showScreen('result');
      return;
    }

    // === Hero dual: si la mejor oferta es sospechosa, usamos la "legítima"
    //     como referencia principal y mostramos la sospechosa en una card
    //     aparte con la advertencia. El usuario ve dos números a la vez. ===
    const displayBest = results.heroMode === 'dual' && results.legitimateBest
      ? results.legitimateBest
      : results.best;
    const suspectBest = results.heroMode === 'dual' ? results.best : null;

    // Comparison: best offer side — empresa destacada arriba, tarifa pequeña debajo
    document.getElementById('result-best-company').textContent = displayBest.company;
    const bestTariffEl = document.getElementById('result-best-tariff');
    if (bestTariffEl) bestTariffEl.textContent = displayBest.offerName || '';
    document.getElementById('result-best-amount').textContent = formatCurrency(displayBest.amount);
    if (displayBest.hasDiscount) {
      document.getElementById('result-best-monthly').innerHTML =
        `${formatCurrency(displayBest.amount / 12)}/mes <span class="comparison-badge-discount" title="Descuento de bienvenida el primer año">1er año</span>` +
        `<br><span class="comparison-aftermath">luego ${formatCurrency(displayBest.secondYearAmount)}/año</span>`;
    } else {
      document.getElementById('result-best-monthly').textContent = `${formatCurrency(displayBest.amount / 12)}/mes`;
    }

    // CTA en "Cómo cambiar de comercializadora" → web oficial de la legítima
    const bestUrl = getCompanyUrl(displayBest.company, displayBest.offerName);
    const howtoLinkEl = $('howto-cta-link');
    if (howtoLinkEl) {
      howtoLinkEl.href = bestUrl;
      const txt = howtoLinkEl.querySelector('.howto-cta-text');
      if (txt) txt.textContent = `Cambiar a ${displayBest.company}`;
    }

    // Card de oferta sospechosa (solo si aplica)
    renderSuspectCard(suspectBest, results);

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

    // Disclaimer del pie de página
    const disclaimer = document.querySelector('.result-disclaimer p');
    if (disclaimer) {
      disclaimer.textContent = `Datos reales del comparador oficial de la CNMC. ${results.totalOffers} ofertas analizadas. AhorraLuz no está afiliado con ninguna comercializadora.`;
    }

    // Renderizar carrusel de ofertas (sustituye Tu nuevo contrato + Mejores ofertas)
    renderOffersCarousel(results, qrData, scenario);
    renderPuntosClave(scenario, qrData, results);

    // En desktop, abrir las secciones desplegables automáticamente
    applyCollapsibleDefaults();

    // Analytics: veredicto final del embudo — qué escenario ve el usuario y
    // cuánto puede ahorrar. Datos agregados, sin PII.
    track('results_shown', {
      case: scenario.primaryCase,
      savings: Math.round(results.legitimateSavings != null ? results.legitimateSavings : results.savings),
      totalOffers: results.totalOffers,
      rank: results.userRankPosition || null,
      dual: results.heroMode === 'dual',
    });
    showScreen('result');
  }

  // En desktop (>=1024px) abrimos los <details> de las 3 secciones para que
  // se vea todo a la vez. En mobile quedan cerrados — el usuario los expande.
  //
  // Una vez que el usuario haya interactuado manualmente con un <details>
  // (lo abre o cierra), NO volvemos a sobrescribir su estado en resize.
  // Esto evita un bug en mobile donde el resize disparado por la barra de
  // URL del navegador (al hacer scroll) cerraba los desplegables que el
  // usuario había abierto.
  function applyCollapsibleDefaults() {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    document.querySelectorAll('.collapsible-section').forEach(d => {
      if (d.dataset.userToggled === 'true') return;
      d.open = isDesktop;
    });
  }
  // Marcar como "tocado por el usuario" cualquier <details> .collapsible-section
  // tras un toggle real. Delegado en el contenedor para captar futuros details
  // que se inserten dinámicamente.
  document.addEventListener('toggle', e => {
    const d = e.target;
    if (d && d.classList && d.classList.contains('collapsible-section')) {
      d.dataset.userToggled = 'true';
    }
  }, true);
  // En resize sólo reajustamos si cruzamos el breakpoint desktop/mobile,
  // y solo para los <details> que el usuario aún no ha tocado.
  let wasDesktop = window.matchMedia('(min-width: 1024px)').matches;
  window.addEventListener('resize', () => {
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if (isDesktop === wasDesktop) return;
    wasDesktop = isDesktop;
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
    // Analytics: drop-off por error (escáner/QR/API). Solo el título — NUNCA
    // los details, que pueden llevar la URL del QR (CUPS, importes = PII).
    track('error_shown', { title: title });
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
  // Insight = an\u00e1lisis de POR QU\u00c9 esta oferta encaja con TU perfil. Evita
  // repetir el "est\u00e1s pagando X / podr\u00edas pagar Y" del hero \u2014 esos datos
  // ya est\u00e1n arriba en grande. Aqu\u00ed explicamos contexto y rasgos del perfil.
  function buildInsight(results, qrData, displayOffer) {
    const parts = [];
    const current = results.current;
    const best = displayOffer || results.legitimateBest || results.best;

    if (best.suspect) {
      parts.push(`<strong>${best.company} \u00b7 ${best.offerName || ''}</strong> aparece como la m\u00e1s barata (${formatCurrency(best.amount)}/a\u00f1o), pero es una <strong>promoci\u00f3n condicional</strong>. Verifica los requisitos antes de contar con ese ahorro.`);
      if (qrData) addConsumoProfile(parts, qrData);
      return parts.join(' ');
    }

    // Si la comercializadora actual est\u00e1 en el ranking, contextualizar.
    if (results.currentCompanyRank && results.currentCompanyRank > 1) {
      parts.push(`<strong>${current.company}</strong> tiene su mejor oferta en el puesto #${results.currentCompanyRank} de ${results.totalOffers} \u2014 hay tarifas m\u00e1s baratas, incluso de la misma comercializadora si no quieres cambiarte.`);
    }

    if (qrData) addConsumoProfile(parts, qrData);
    return parts.join(' ');
  }

  function addConsumoProfile(parts, qrData) {
    const total = qrData.consumoAnualP1 + qrData.consumoAnualP2 + qrData.consumoAnualP3;
    if (total <= 0) return;
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

  // --- BBDD de webs oficiales por comercializadora ---
  // Mapping comercializadora → su sección de tarifas/ofertas de luz cuando
  // existe y responde; si no, la home. NO enlazamos a una tarifa CONCRETA:
  // esas URLs profundas se pudren rápido (en una verificación previa ~50%
  // daban 404). Todas las de abajo verificadas por HTTP el 2026-05-27 (200,
  // o 403 por anti-bot —Iberdrola, Holaluz, Gana— que en navegador real
  // carga). Las claves son substrings que se buscan en el nombre normalizado
  // (sin tildes ni mayúsculas). Si no hay match → búsqueda de Google.
  const COMPANY_WEBSITES = {
    'IBERDROLA':         'https://www.iberdrola.es/luz/planes-luz',
    'ENDESA':            'https://www.endesa.com/es/luz/tarifas-luz',
    'NATURGY':           'https://www.naturgy.es/hogar/luz',
    'REPSOL':            'https://www.repsol.es/particulares/',
    'HOLALUZ':           'https://www.holaluz.com/luz',
    'TOTAL':             'https://www.totalenergies.es/clientes-particulares/luz',
    'OCTOPUS':           'https://octopusenergy.es/precios',
    'IMAGINA':           'https://www.imaginaenergia.com/',
    'LUCERA':            'https://lucera.es/tarifas-luz',
    'PLENITUDE':         'https://www.eniplenitude.com/',
    'EDP':               'https://www.edpenergia.es/es/hogares/tu-tarifa-luz/',
    'ACCIONA':           'https://www.acciona-energia.com/es/',
    'ENERGYA VM':        'https://www.energyavm.es/luz/',
    'ENERGYA':           'https://www.energyavm.es/luz/',
    'GANA ENERGÍA':      'https://ganaenergia.com/tarifas-luz/',
    'GANA ENERGIA':      'https://ganaenergia.com/tarifas-luz/',
    'AURA ENERGIA':      'https://www.aura-energia.com/tarifas-luz/',
    'AURA ENERGÍA':      'https://www.aura-energia.com/tarifas-luz/',
    'PEPENERGY':         'https://www.pepenergy.com/',
    'GANA':              'https://ganaenergia.com/tarifas-luz/',
    'CEPSA':             'https://www.moeve.es/',
    'MOEVE':             'https://www.moeve.es/',
    'AXPO':              'https://www.axpo.com/es/es.html',
    'PLÉNITUDE':         'https://www.eniplenitude.com/',
    'AUDAX':             'https://www.audaxrenovables.com/particulares/',
    'ENERGYASSET':       'https://www.energyasset.es/',
    'VISALIA':           'https://www.visaliaenergia.com/',
    'DOMÉSTICA':         'https://www.visaliaenergia.com/',
    'DOMESTICA':         'https://www.visaliaenergia.com/',
  };

  // Normaliza un nombre para comparar: mayúsculas + sin tildes. Así el match
  // contra COMPANY_WEBSITES no depende de acentos ni de mayúsculas.
  function normalizeForMatch(s) {
    return (s || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // Claves del mapa precalculadas y ordenadas por longitud descendente, para
  // que gane la coincidencia más específica y evitar colisiones por substring
  // (ENERGYASSET debe ganar a ENERGYA; ENERGYA VM debe ganar a ENERGYA).
  const COMPANY_WEBSITE_KEYS = Object.keys(COMPANY_WEBSITES)
    .map(k => ({ norm: normalizeForMatch(k), url: COMPANY_WEBSITES[k] }))
    .sort((a, b) => b.norm.length - a.norm.length);

  // Devuelve la web oficial (home) de la comercializadora si la reconocemos
  // por nombre (match por substring normalizado). Si no, null.
  function lookupCompanyWebsite(companyName) {
    const norm = normalizeForMatch(companyName);
    if (!norm) return null;
    for (const entry of COMPANY_WEBSITE_KEYS) {
      if (entry.norm && norm.includes(entry.norm)) return entry.url;
    }
    return null;
  }

  // Enlace del CTA "Cambiar a X". Preferimos la web oficial de la
  // comercializadora (mejor UX: el usuario aterriza donde puede contratar).
  // Si no la tenemos mapeada, caemos a una búsqueda de Google con el nombre
  // exacto — que nunca rompe y suele poner el resultado oficial el primero.
  function getCompanyUrl(companyName, offerName) {
    const official = lookupCompanyWebsite(companyName);
    if (official) return official;

    const parts = [];
    if (companyName) parts.push(companyName);
    if (offerName && offerName.toLowerCase() !== (companyName || '').toLowerCase()) {
      parts.push(offerName);
    }
    parts.push('tarifa luz');
    const q = encodeURIComponent(parts.join(' '));
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

  // Al final del IIFE: ya están inicializadas todas las const/let de TDZ
  // (CNMC_QR_BASE, etc.). Es seguro intentar el auto-process del hash.
  tryAutoProcessFromHash();

})();

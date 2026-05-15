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

  function stopAndGoHome() {
    stopScanner();
    showScreen('landing');
  }

  // --- QR Scanner (BarcodeDetector native API + jsQR fallback) ---
  async function startScanner() {
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
  const PROXY_BASE = 'https://rough-sun-c2a5.iker-267.workers.dev/api/publico/';
  const CNMC_DIRECT = 'https://comparador.cnmc.gob.es/api/publico/';

  async function fetchFromApi(path) {
    // Try proxy first, fall back to direct
    try {
      const response = await fetch(`${PROXY_BASE}${path}`, {
        headers: { 'Accept': 'application/json' },
      });
      if (response.ok) return response;
    } catch (e) {
      console.warn('Proxy failed, trying direct:', e.message);
    }

    // Direct fallback (works from same-origin or curl, not from cross-origin browser)
    const response = await fetch(`${CNMC_DIRECT}${path}`, {
      headers: { 'Accept': 'application/json' },
    });
    return response;
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

  async function fetchCompanyName(code) {
    if (!code) return 'Tu comercializadora actual';
    // API needs the full code (R2-760), not stripped
    try {
      const response = await fetchFromApi(`nombrecodigo/${code}`);
      if (response.ok) {
        const name = await response.text();
        const clean = name.replace(/"/g, '').trim();
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
      let offers;
      let apiError = null;
      try {
        offers = await fetchOffers(cnmcParams);
      } catch (e) {
        console.error('CNMC API failed:', e);
        apiError = e;
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
            codigoPostal: cnmcParams.codigoPostal,
            consumoAnualE: cnmcParams.consumoAnualE,
            potencia: cnmcParams.potencia,
            tarifa: cnmcParams.tarifa,
            ofertasRecibidas: offers ? (offers.resultadoComparador || []).length : 0,
            url: `${CNMC_API_BASE}ofertas/electricidad`,
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
    // If we have the annual import directly from the QR
    if (qrData.importeTotal > 0) {
      // Extrapolate from billing period to annual
      const factStart = qrData.inicioFact ? new Date(qrData.inicioFact) : null;
      const factEnd = qrData.finFact ? new Date(qrData.finFact) : null;

      if (factStart && factEnd && !isNaN(factStart) && !isNaN(factEnd)) {
        const days = (factEnd - factStart) / (1000 * 60 * 60 * 24);
        if (days > 0 && days < 365) {
          return (qrData.importeTotal / days) * 365;
        }
      }
      // Assume bimonthly billing
      return qrData.importeTotal * 6;
    }

    // Estimate from consumption using average prices (2024-2025 Spain averages)
    const consumoTotal = qrData.consumoAnualP1 + qrData.consumoAnualP2 + qrData.consumoAnualP3;
    const potencia = qrData.potenciaP1;

    // Average costs per kWh and kW/year for 2.0TD
    const precioEnergiaMedia = 0.15; // EUR/kWh average
    const precioPotenciaMedia = 30;  // EUR/kW/year average

    const costeEnergia = consumoTotal * precioEnergiaMedia;
    const costePotencia = potencia * precioPotenciaMedia * 2; // 2 periods
    const impuestoElectrico = (costeEnergia + costePotencia) * 0.05;
    const subtotal = costeEnergia + costePotencia + impuestoElectrico;
    const iva = subtotal * 0.21;

    return subtotal + iva;
  }

  // --- Process CNMC offers ---
  function processOffers(apiResponse, qrData, currentAnnualCost, companyName) {
    const offers = apiResponse.resultadoComparador || [];

    // Sort by second year cost (more representative than promo first year)
    const sorted = offers
      .filter(o => o.importeSegundoAnio != null && o.importeSegundoAnio > 0)
      .sort((a, b) => a.importeSegundoAnio - b.importeSegundoAnio);

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
        company: o.comercializadora || '',
        offerName: o.oferta || '',
        amount: o.importeSegundoAnio,
        firstYearAmount: o.importePrimerAnio,
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
      savings: currentAnnualCost - best.importeSegundoAnio,
      totalOffers: sorted.length,
      alreadyBest: alreadyBest,
      currentCompanyBest: bestCurrentOffer ? mapOffer(bestCurrentOffer) : null,
      currentCompanyRank: bestCurrentOffer ? bestCurrentOffer.rank : null,
    };
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

  // --- Display ---
  function displayResults(results, qrData) {
    // Current annual cost
    document.getElementById('result-current-amount').textContent = formatCurrency(results.current.amount);
    document.getElementById('result-current-monthly').textContent = `${formatCurrency(results.current.amount / 12)}/mes`;

    if (!results.best) {
      showScreen('result');
      return;
    }

    const bestHeader = document.getElementById('best-header');
    const bestBadge = document.getElementById('result-badge');
    const savingsEl = document.getElementById('result-savings');
    const altHeader = document.getElementById('alt-header');

    // Best offer
    const bestLabel = results.best.offerName
      ? `${results.best.company} — ${results.best.offerName}`
      : results.best.company;
    document.getElementById('result-best-company').textContent = bestLabel;
    document.getElementById('result-best-amount').textContent = formatCurrency(results.best.amount);
    document.getElementById('result-best-monthly').textContent = `(${formatCurrency(results.best.amount / 12)}/mes)`;

    // Personalized insight + adapt sections based on whether user has top tariff
    const insightEl = document.getElementById('insight-text');

    if (results.alreadyBest) {
      bestHeader.textContent = 'La mejor del mercado';
      bestBadge.textContent = '#' + results.currentCompanyRank + ' de ' + results.totalOffers + ' ofertas';
      bestBadge.classList.add('badge-good');
      altHeader.textContent = 'La competencia';

      insightEl.innerHTML = 'Buenas noticias: <strong>ya tienes una de las mejores tarifas del mercado</strong> para tu perfil de consumo. ' +
        results.current.company + ' est\u00e1 en el puesto <strong>#' + results.currentCompanyRank + ' de ' + results.totalOffers + '</strong> ofertas disponibles. ' +
        'Te mostramos la competencia por si quieres comparar.';

      savingsEl.textContent = 'Ya est\u00e1s entre las mejores tarifas';
      savingsEl.classList.add('negative');
      savingsEl.classList.remove('positive');

      document.getElementById('section-howto').style.display = 'none';
    } else {
      bestHeader.textContent = 'Mejor oferta del mercado';
      bestBadge.textContent = 'Mejor oferta';
      bestBadge.classList.remove('badge-good');
      altHeader.textContent = 'Tambi\u00e9n podr\u00edas considerar';

      // Build personalized explanation
      const insight = buildInsight(results, qrData);
      insightEl.innerHTML = insight;

      if (results.savings > 0) {
        const savingsMonthly = results.savings / 12;
        savingsEl.textContent = `Ahorras ${formatCurrency(results.savings)}/a\u00f1o (${formatCurrency(savingsMonthly)}/mes)`;
        savingsEl.classList.add('positive');
        savingsEl.classList.remove('negative');
      } else {
        savingsEl.textContent = 'Tu tarifa actual ya es muy competitiva';
        savingsEl.classList.add('negative');
        savingsEl.classList.remove('positive');
      }

      document.getElementById('section-howto').style.display = '';
    }

    // Alternatives
    results.alternatives.forEach((alt, i) => {
      const el = document.getElementById(`alt-${i + 1}`);
      if (el && alt) {
        el.querySelector('.alt-name').textContent = alt.offerName
          ? `${alt.company} — ${alt.offerName}`
          : alt.company;
        el.querySelector('.alt-amount').textContent = formatCurrency(alt.amount);
        const saving = results.current.amount - alt.amount;
        el.querySelector('.alt-saving').textContent = saving > 0
          ? `-${formatCurrency(saving)}`
          : '';
        el.style.display = '';
      } else if (el) {
        el.style.display = 'none';
      }
    });

    // Show data source badge
    const disclaimer = document.querySelector('.result-disclaimer p');
    disclaimer.textContent = `Datos reales del comparador oficial de la CNMC. ${results.totalOffers} ofertas analizadas. AhorraLuz no est\u00e1 afiliado con ninguna comercializadora.`;

    showScreen('result');
  }

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
      parts.push(`Est\u00e1s pagando <strong>${formatCurrency(current.amount)}/a\u00f1o</strong> (${formatCurrency(current.amount / 12)}/mes) con ${current.company}.`);
      parts.push(`Podr\u00edas pagar <strong>${formatCurrency(best.amount)}/a\u00f1o</strong> con ${best.company}. Eso son <strong>${formatCurrency(savings)} menos al a\u00f1o</strong>.`);

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

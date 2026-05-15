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

  let html5QrCode = null;

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

  // --- QR Scanner ---
  function startScanner() {
    showScreen('scanner');
    const readerEl = document.getElementById('qr-reader');
    readerEl.innerHTML = '';

    html5QrCode = new Html5Qrcode('qr-reader');
    html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      onQrSuccess,
      () => {} // ignore scan failures (continuous scanning)
    ).catch(err => {
      console.error('Error starting scanner:', err);
      showError(
        'No se pudo acceder a la camara',
        'Asegurate de dar permiso de camara a esta web. Si el problema persiste, prueba desde otro navegador.'
      );
    });
  }

  function stopScanner() {
    if (html5QrCode) {
      html5QrCode.stop().catch(() => {});
      html5QrCode = null;
    }
  }

  // --- QR Success ---
  function onQrSuccess(decodedText) {
    stopScanner();

    // Validate it's a CNMC comparador URL
    if (!decodedText.includes('comparador.cnmc.gob.es') && !decodedText.includes('cnmc.es')) {
      showError(
        'Este QR no es de una factura de luz',
        'El codigo QR debe ser el que aparece en tu factura de electricidad. Es una URL al comparador de la CNMC.'
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
    const getFloat = (key, fallback) => parseFloat(get(key, fallback)) || fallback;

    return {
      cups: get('cups', ''),
      codigoPostal: get('cp', ''),
      bonoSocial: parseInt(get('bs', '0')),
      peaje: parseInt(get('peaje', '18')),
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

      // Fechas consumo anual
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

      // Importes
      importeTotal: getFloat('imp', 0),
      importeServicios: getFloat('impSA', 0),
      importeOtros: getFloat('impOtros', 0),
      excedentes: getFloat('exc', 0),

      // Potencia maxima demandada
      pmaxP1: getFloat('pmaxP1', 0),
      pmaxP2: getFloat('pmaxP2', 0),
      pmaxP3: getFloat('pmaxP3', 0),
      pmaxP4: getFloat('pmaxP4', 0),
      pmaxP5: getFloat('pmaxP5', 0),
      pmaxP6: getFloat('pmaxP6', 0),

      // Contrato
      tipoContrato: parseInt(get('tc', '0')),
      finPenalizacion: get('finPen', ''),
      tipoFactura: parseInt(get('reg', '0')),
    };
  }

  // --- Build CNMC API params from QR data ---
  function buildCnmcParams(qrData) {
    const consumoAnualE = qrData.consumoAnualP1 + qrData.consumoAnualP2 + qrData.consumoAnualP3
      + qrData.consumoAnualP4 + qrData.consumoAnualP5 + qrData.consumoAnualP6;

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
      consumoAnualEQr: consumoAnualE,
      consumoPrimeraFranjaQr: qrData.consumoAnualP1,
      consumoSegundaFranjaQr: qrData.consumoAnualP2,
      consumoTerceraFranjaQr: qrData.consumoAnualP3,
      consumoCuartaFranjaQr: qrData.consumoAnualP4,
      consumoQuintaFranjaQr: qrData.consumoAnualP5,
      consumoSextaFranjaQr: qrData.consumoAnualP6,
      consumoAnualEPQr: consumoAnualE,
      consumoPrimeraFranjaPQr: qrData.consumoAnualP1,
      consumoSegundaFranjaPQr: qrData.consumoAnualP2,
      consumoTerceraFranjaPQr: qrData.consumoAnualP3,
      consumoCuartaFranjaPQr: qrData.consumoAnualP4,
      consumoQuintaFranjaPQr: qrData.consumoAnualP5,
      consumoSextaFranjaPQr: qrData.consumoAnualP6,
      tarifa: qrData.peaje === 19 ? 5 : 4,  // 4=2.0TD, 5=3.0TD
      consumoAnualG: 0,
      consumoAnualGOrig: 0,
      serviciosAdicionales: 1,
      permanencia: 1,
      vivienda: true,
      factura: true,
      energiaAutoconsumo: 0,
      idAuditoriaQR: 0,
      potenciaAutoconsumo: 0,
      revisionPrecios: 2,
      perfilConsumo: 10,
    };
  }

  // --- CNMC API ---
  const CNMC_API_BASE = 'https://comparador.cnmc.gob.es/api/publico/';

  async function fetchOffers(params) {
    const qs = Object.entries(params)
      .filter(([, v]) => v != null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

    const response = await fetch(`${CNMC_API_BASE}ofertas/electricidad?${qs}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CNMC API error: ${response.status}`);
    }

    return response.json();
  }

  async function fetchCompanyName(code) {
    if (!code) return 'Tu comercializadora actual';
    try {
      const cleanCode = code.replace('R2-', '');
      const response = await fetch(`${CNMC_API_BASE}nombrecodigo/${cleanCode}`, {
        headers: { 'Accept': 'application/json' },
      });
      if (response.ok) {
        const name = await response.text();
        return name.replace(/"/g, '') || code;
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
      } catch (e) {
        showError(
          'QR no valido',
          'El codigo QR no contiene datos validos de una factura de luz. Asegurate de escanear el QR correcto.'
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
      try {
        offers = await fetchOffers(cnmcParams);
      } catch (e) {
        console.warn('CNMC API failed, using estimation mode:', e);
        // Fallback: estimate based on QR data alone
        offers = null;
      }
      await completeStep('step-offers', 300);

      // Step 4: Calculate
      activateStep('step-calc');

      const companyName = await fetchCompanyName(qrData.comercializadora);
      const currentAnnualCost = estimateAnnualCost(qrData);

      let results;
      if (offers && Array.isArray(offers) && offers.length > 0) {
        results = processOffers(offers, qrData, currentAnnualCost, companyName);
      } else {
        results = buildEstimatedResults(qrData, currentAnnualCost, companyName);
      }
      await completeStep('step-calc', 400);

      // Show results
      displayResults(results);

    } catch (e) {
      console.error('Error processing QR:', e);
      showError(
        'Error al procesar tu factura',
        'Ha ocurrido un error inesperado. Por favor, intentalo de nuevo.'
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
  function processOffers(offers, qrData, currentAnnualCost, companyName) {
    // Sort by annual cost (ascending)
    const sorted = offers
      .filter(o => o.importeAnual != null)
      .sort((a, b) => a.importeAnual - b.importeAnual);

    if (sorted.length === 0) {
      return buildEstimatedResults(qrData, currentAnnualCost, companyName);
    }

    const best = sorted[0];
    const alt1 = sorted[1] || null;
    const alt2 = sorted[2] || null;

    return {
      current: {
        company: companyName,
        amount: currentAnnualCost,
      },
      best: {
        company: best.nombreComercializadora || best.comercializadora || 'Mejor oferta',
        offerName: best.nombreOferta || '',
        amount: best.importeAnual,
      },
      alternatives: [alt1, alt2].filter(Boolean).map(o => ({
        company: o.nombreComercializadora || o.comercializadora || '',
        offerName: o.nombreOferta || '',
        amount: o.importeAnual,
      })),
      savings: currentAnnualCost - (best.importeAnual || currentAnnualCost),
    };
  }

  // --- Fallback when CNMC API fails ---
  function buildEstimatedResults(qrData, currentAnnualCost, companyName) {
    // Calculate what PVPC would cost (rough estimate)
    const consumoTotal = qrData.consumoAnualP1 + qrData.consumoAnualP2 + qrData.consumoAnualP3;
    const potencia = qrData.potenciaP1 || 3.45;

    // PVPC 2.0TD average 2025-2026 estimates
    const pvpcP1 = 0.187;  // punta
    const pvpcP2 = 0.145;  // llano
    const pvpcP3 = 0.098;  // valle
    const potP1 = 0.0846;  // EUR/kW/dia punta
    const potP2 = 0.0210;  // EUR/kW/dia valle

    let consumoP1 = qrData.consumoAnualP1 || consumoTotal * 0.35;
    let consumoP2 = qrData.consumoAnualP2 || consumoTotal * 0.30;
    let consumoP3 = qrData.consumoAnualP3 || consumoTotal * 0.35;

    const costeEnergiaPVPC = consumoP1 * pvpcP1 + consumoP2 * pvpcP2 + consumoP3 * pvpcP3;
    const costePotenciaPVPC = (potencia * potP1 + potencia * potP2) * 365;
    const impElec = (costeEnergiaPVPC + costePotenciaPVPC) * 0.05;
    const subtotalPVPC = costeEnergiaPVPC + costePotenciaPVPC + impElec;
    const pvpcAnual = subtotalPVPC * 1.21; // +IVA

    // Simulate a few free market offers with typical margins
    const fijaBarata = pvpcAnual * 0.92;
    const fijaMedia = pvpcAnual * 0.95;
    const indexada = pvpcAnual * 0.97;

    const results = {
      current: {
        company: companyName,
        amount: currentAnnualCost,
      },
      best: {
        company: 'Tarifa mas competitiva del mercado',
        offerName: '(estimacion basada en tu consumo)',
        amount: Math.min(fijaBarata, pvpcAnual),
      },
      alternatives: [
        { company: 'PVPC (tarifa regulada)', offerName: '', amount: pvpcAnual },
        { company: 'Tarifa fija competitiva', offerName: '', amount: fijaMedia },
      ],
      savings: currentAnnualCost - Math.min(fijaBarata, pvpcAnual),
      isEstimation: true,
    };

    // Sort alternatives by amount
    results.alternatives.sort((a, b) => a.amount - b.amount);

    return results;
  }

  // --- Display ---
  function displayResults(results) {
    // Current
    document.getElementById('result-current-company').textContent = results.current.company;
    document.getElementById('result-current-amount').textContent = formatCurrency(results.current.amount);

    // Best
    const bestLabel = results.best.offerName
      ? `${results.best.company} — ${results.best.offerName}`
      : results.best.company;
    document.getElementById('result-best-company').textContent = bestLabel;
    document.getElementById('result-best-amount').textContent = formatCurrency(results.best.amount);

    // Savings
    const savingsEl = document.getElementById('result-savings');
    if (results.savings > 0) {
      savingsEl.textContent = `Ahorras ${formatCurrency(results.savings)} al ano`;
      savingsEl.classList.add('positive');
      savingsEl.classList.remove('negative');
    } else {
      savingsEl.textContent = 'Ya tienes una de las mejores tarifas';
      savingsEl.classList.add('negative');
      savingsEl.classList.remove('positive');
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

    // Add estimation disclaimer if needed
    if (results.isEstimation) {
      const disclaimer = document.querySelector('.result-disclaimer p');
      disclaimer.textContent = 'Estimacion basada en tu consumo y precios medios del mercado. Para un resultado exacto, consulta el comparador oficial de la CNMC. AhorraLuz no esta afiliado con ninguna comercializadora.';
    }

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
  function showError(title, message) {
    document.getElementById('error-title').textContent = title;
    document.getElementById('error-message').textContent = message;
    showScreen('error');
  }

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

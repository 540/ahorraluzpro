// Cloudflare Worker — Proxy para API CNMC
// Deploy: wrangler deploy (o panel → Edit code → Save and deploy)
// Ruta: https://tu-worker.tu-cuenta.workers.dev/api/publico/...

const CNMC_BASE = 'https://comparador.cnmc.gob.es';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Accept, Content-Type',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request) {
    // Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // Only GET allowed
    if (request.method !== 'GET') {
      return new Response('Method not allowed', {
        status: 405,
        headers: CORS_HEADERS,
      });
    }

    const url = new URL(request.url);

    // Salud rápida (sin tocar CNMC) para verificar que el worker vive.
    // Útil para que la app pueda hacer un warm-up en background.
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Forward a CNMC sin enviar Origin (que provoca 403 en su nginx).
    const targetUrl = `${CNMC_BASE}${url.pathname}${url.search}`;
    let upstream;
    try {
      upstream = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
        cf: { cacheTtl: 60, cacheEverything: false },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'upstream_fetch_failed', message: e.message }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Streaming directo del body en lugar de bufferizar con text() —
    // bajamos latencia y memoria del worker. Reconstruimos los headers
    // para añadir CORS y normalizar Content-Type.
    const headers = new Headers({
      ...CORS_HEADERS,
      'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
      'Cache-Control': 'public, max-age=60',
    });
    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  },
};

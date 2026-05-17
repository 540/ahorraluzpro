// Vercel Serverless Function — Proxy alternativo a la API CNMC.
//
// Necesario porque CNMC bloquea cross-origin desde browser por su nginx
// que responde 403 cuando ve Origin header. Este proxy elimina el Origin
// y propaga la respuesta con CORS abierto.
//
// Endpoint: https://<tu-proyecto>.vercel.app/api/cnmc?path=ofertas/electricidad&otros=params
// El query param `path` indica el endpoint relativo dentro de
// /api/publico/ de la CNMC. El resto de query params se forwardean.
//
// Deploy: conectar este repo a Vercel desde https://vercel.com/new
// Vercel detecta automáticamente la carpeta /api/ y despliega cada
// archivo como una función. Sin configuración adicional.

const CNMC_BASE = 'https://comparador.cnmc.gob.es/api/publico';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Accept, Content-Type',
  'Access-Control-Max-Age': '86400',
};

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(204).end();
  }
  if (req.method !== 'GET') {
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  // Health check: responde sin tocar CNMC. Sirve para warmup.
  if (req.query.path === 'health' || !req.query.path) {
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(200).json({ ok: true, ts: Date.now() });
  }

  // Construir URL destino: /api/publico/<path>?<resto-params>
  const path = String(req.query.path).replace(/^\/+/, '');
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(req.query)) {
    if (k !== 'path') params.set(k, Array.isArray(v) ? v[0] : v);
  }
  const targetUrl = `${CNMC_BASE}/${path}${params.toString() ? '?' + params.toString() : ''}`;

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
    });
    const body = await upstream.text();
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
    res.setHeader('Content-Type', upstream.headers.get('Content-Type') || 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(upstream.status).send(body);
  } catch (e) {
    Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(502).json({ error: 'upstream_failed', message: e.message });
  }
}

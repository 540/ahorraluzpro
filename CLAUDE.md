# AhorraLuz - Contexto del Proyecto

## Qué es

Comparador de tarifas de electricidad en España que usa el QR de la factura de la luz para mostrar al usuario si puede ahorrar y con qué comercializadora. 100% gratuito, sin afiliación con eléctricas, del lado del consumidor.

## Filosofía

- **Gratis y neutral**: No cobramos de las eléctricas ni vendemos leads. El objetivo es ayudar al usuario a tener siempre la tarifa óptima.
- **Simple**: Escanear QR → ver resultado. Sin registro, sin fricción.
- **Pro-consumidor**: "Las eléctricas son malas" — el producto existe para empoderar al usuario.

## Stack técnico

- **100% frontend** — sin backend, sin base de datos, sin servidor
- **Vanilla JS** — no frameworks, es una sola pantalla
- **html5-qrcode** — librería para escaneo QR desde cámara del navegador
- **API CNMC** — llamadas directas al comparador de la CNMC (CORS habilitado: `access-control-allow-origin: *`)
- **Hosting**: GitHub Pages (coste 0€)

## Arquitectura

```
Usuario escanea QR
    │
    ▼
QR = URL con ~40 parámetros del comparador CNMC
(https://comparador.cnmc.gob.es/comparador/QRE?cp=28001&pP1=3.45&caP1=1200&...)
    │
    ▼
App parsea URL → extrae consumo, potencia, tarifa actual, CUPS, etc.
    │
    ▼
App llama a API CNMC → GET /api/publico/ofertas/electricidad?params...
    │
    ▼
App muestra: tarifa actual vs mejor oferta + 2 alternativas + ahorro anual
```

## API CNMC - Endpoints descubiertos

Base: `https://comparador.cnmc.gob.es/api/`

### Endpoints confirmados (funcionan):
- `GET publico/provincias` → lista provincias con código postal
- `GET publico/curvas` → perfiles de consumo (id: 10 = "Estandar" 2.0TD)
- `GET publico/preciosPVPC/ultimaFechaConTodo` → última fecha con datos
- `GET publico/preciosPVPC/get/{fecha}` → precios PVPC por fecha
- `GET publico/listadoPerfiles` → perfiles disponibles

### Endpoints de ofertas (necesitan parámetros exactos):
- `GET publico/ofertas/electricidad` → ofertas mercado libre
- `GET publico/ofertas/pvpc` → ofertas PVPC
- `GET publico/ofertas/simularpvpc` → simulación PVPC
- `GET publico/ofertas/gas` → ofertas gas
- `GET publico/ofertas/conjuntas` → ofertas combinadas
- `GET publico/ofertas/csvflexibles` → exportar CSV
- `GET publico/comparador/calculoQR` → cálculo desde QR
- `GET publico/oferta` → detalle de oferta individual

### Endpoints auxiliares:
- `POST publico/comparador/qre` → auditoría QR (logging)
- `GET publico/logo/{id}` → logo comercializadora
- `GET publico/logocodigo/{codigo}` → logo por código
- `GET publico/nombrecodigo/{codigo}` → nombre por código
- `GET publico/ofertas/crearInforme` → generar PDF informe
- `GET publico/entiendeTuFactura/calculo` → cálculo factura
- `GET publico/facturapeaje/calcular` → cálculo peaje
- `GET publico/mecanismoAjuste` → mecanismo de ajuste

### Estructura de parámetros del formulario de ofertas:
```javascript
{
  tipoSuministro: "E",        // E=electricidad, G=gas, C=combinada
  codigoPostal: "28001",       // 5 dígitos
  potencia: 3.5,               // kW
  potenciaPrimeraFranja: 3.5,  // P1 kW
  potenciaSegundaFranja: 3.5,  // P2 kW
  potenciaTerceraFranja: 3.5,  // P3 kW (solo 3.0TD)
  potenciaCuartaFranja: 3.5,   // P4 kW (solo 3.0TD)
  potenciaQuintaFranja: 3.5,   // P5 kW (solo 3.0TD)
  potenciaSextaFranja: 3.5,    // P6 kW (solo 3.0TD)
  consumoAnualE: 2600,         // kWh total anual
  consumoPrimeraFranja: 0,     // kWh P1
  consumoSegundaFranja: 0,     // kWh P2
  consumoTerceraFranja: 0,     // kWh P3
  consumoCuartaFranja: 0,      // kWh P4 (solo 3.0TD)
  consumoQuintaFranja: 0,      // kWh P5 (solo 3.0TD)
  consumoSextaFranja: 0,       // kWh P6 (solo 3.0TD)
  tarifa: 4,                   // 4 = 2.0TD (residencial estándar)
  serviciosAdicionales: 1,     // 1 = con SA, 2 = sin SA
  permanencia: 1,              // 1 = con permanencia, 2 = sin permanencia
  vivienda: true,              // es vivienda habitual
  factura: true,               // incluir datos factura
  perfilConsumo: 10,           // 10 = Estandar 2.0TD
  revisionPrecios: 2,          // tipo revisión precios
  energiaAutoconsumo: 0,       // kWh autoconsumo
  potenciaAutoconsumo: 3.5,    // kW autoconsumo
  consumoAnualG: 0,            // gas kWh (si combinada)
}
```

### Headers requeridos:
- `User-Agent`: Debe ser de navegador (curl sin UA devuelve 403)
- `Accept: application/json`
- No necesita token ni cookies para endpoints públicos

### Nota sobre el endpoint de ofertas:
Los endpoints de ofertas devuelven 500 si los parámetros no son exactos. Se necesita capturar una petición real desde DevTools del comparador para obtener la combinación exacta de parámetros. La app Nuxt.js del comparador codifica los parámetros en un string hexadecimal en la URL de la ruta (`/comparador/listado/{hex}`), los decodifica, y luego hace la llamada GET a la API.

## Parámetros del QR de la factura (BOE-A-2021-11035)

El QR es una URL: `https://comparador.cnmc.gob.es/comparador/QRE?param1=value1&...`

| Parámetro | Campo | Descripción |
|-----------|-------|-------------|
| `cups` | CUPS | Código único punto suministro (22 chars) |
| `cp` | Código postal | 5 dígitos |
| `com` | Comercializadora | Código R2-XXX |
| `peaje` | Peaje | 18 (2.0TD) o 19 (3.0TD) |
| `pP1`–`pP6` | Potencia contratada | Por periodo, en kW |
| `caP1`–`caP6` | Consumo anual por periodo | Último año, en kWh |
| `iniA` / `finA` | Fechas consumo anual | YYYY-MM-DD |
| `cfP1`–`cfP6` | Consumo periodo facturado | En kWh |
| `iniF` / `finF` | Fechas periodo facturado | YYYY-MM-DD |
| `imp` | Importe total factura | En euros |
| `impSA` | Servicios adicionales | En euros |
| `exc` | Excedentes autoconsumo | En euros |
| `pmaxP1`–`pmaxP6` | Potencia máxima demandada | Por periodo, en kW |
| `tc` | Tipo contrato | 0=fijo, 1=fijo no estándar, 2=indexado |
| `finPen` | Penalización permanencia | Fecha fin |
| `bs` | Bono social | 0/1/2 |
| `reg` | Tipo factura | 0=normal, 1=regularización |

### Mapeo QR → Formulario CNMC:
```
cp         → codigoPostal
peaje 18   → tarifa 4 (2.0TD)
peaje 19   → tarifa depende de 3.0TD
pP1        → potenciaPrimeraFranja
pP2        → potenciaSegundaFranja
caP1       → consumoPrimeraFranja
caP2       → consumoSegundaFranja
caP3       → consumoTerceraFranja
caP1+caP2+caP3 → consumoAnualE
```

## Decisiones de producto tomadas

1. **Usuario objetivo**: Persona con factura de luz en mano (perfil A), pero también válido para buscadores activos (B) y pasivos (C)
2. **Formato**: Web app mobile-first (PWA futura)
3. **Modelo de negocio**: Gratis. Sin monetización por ahora. Sin afiliación.
4. **Resultado**: Veredicto simple (tarifa actual vs mejor oferta + 2 alternativas)
5. **Acción post-resultado**: Solo informar. Sin enlaces a comercializadoras.
6. **Fuente de datos**: API interna CNMC (reverse engineering), en tiempo real
7. **Escaneo QR**: Cámara directa del navegador
8. **Registro**: Ninguno. Sin auth, sin cookies, sin datos del usuario.
9. **Stack**: Vanilla JS + html5-qrcode, GitHub Pages
10. **Backend**: Ninguno. Todo client-side. CORS habilitado en la CNMC.

## Flujo de pantallas

1. **Landing**: "Escanea el QR de tu factura" + botón
2. **Escáner**: Visor de cámara, detección automática
3. **Carga**: Pasos progresivos:
   - ✓ QR leído correctamente
   - ✓ Datos de consumo extraídos
   - ◌ Buscando las mejores ofertas del mercado...
   - ○ Calculando tu ahorro
4. **Resultado**: Tarifa actual + mejor oferta + 2 alternativas + ahorro + texto educativo sobre cambio

## Fuentes de datos complementarias

- **E·SIOS / REE API**: Precios PVPC horarios en tiempo real. Token gratuito solicitando a consultasios@ree.es. Endpoint: `https://api.esios.ree.es/indicators/1001`
- **api.preciodelaluz.org**: API pública PVPC sin token
- **OMIE**: Precios mercado mayorista

## Riesgos conocidos

- La API de la CNMC es interna y no documentada. Puede cambiar sin aviso.
- Mitigación: contactar info.comparador@cnmc.es para formalizar acceso.
- Solo aplica a suministros ≤15 kW (residencial y pequeño comercio).
- Depende de que la comercializadora genere bien el QR.

## Roadmap

- **V1 (actual)**: Escanear QR → ver ahorro → informar
- **V2**: Bot de alertas — guardar perfil (email) y avisar cuando aparezca mejor oferta
- **V3**: Análisis de potencia contratada, recomendación de autoconsumo, histórico

## Convenciones

- Idioma del código: inglés
- Idioma de la UI: español
- Archivos: nombres en minúscula con guiones
- Commits: en español

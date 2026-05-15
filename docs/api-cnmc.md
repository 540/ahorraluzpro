# API CNMC — Documentacion tecnica

## Contexto

El comparador de ofertas de la CNMC (https://comparador.cnmc.gob.es) es una app Nuxt.js que consume una API REST interna. Esta API no esta documentada publicamente pero es accesible con CORS habilitado (`access-control-allow-origin: *`).

## Base URL

```
https://comparador.cnmc.gob.es/api/
```

## Headers requeridos

```
User-Agent: Mozilla/5.0 (navegador real, curl sin UA devuelve 403)
Accept: application/json
Content-Type: application/json
```

No requiere token, cookies ni autenticacion.

## Endpoints confirmados

### GET publico/provincias
Lista de provincias con codigo postal base.
```json
[
  {"cp": "01000", "provincia": "Álava"},
  {"cp": "02000", "provincia": "Albacete"},
  ...
]
```

### GET publico/curvas
Perfiles de consumo disponibles.
```json
[
  {"id": 10, "nombrePerfil": "Estandar", "descripcion": "Perfil de consumo de consumidor estándar 2.0td", "consumoAnual": 1.0}
]
```

### GET publico/preciosPVPC/ultimaFechaConTodo
Ultima fecha con datos PVPC completos.
```
2026-05-15
```

### GET publico/preciosPVPC/get/{fecha}
Precios PVPC por fecha. Formato fecha sin confirmar.

### GET publico/listadoPerfiles
Identico a curvas.

### GET publico/nombrecodigo/{codigo}
Nombre de comercializadora por codigo.

### GET publico/logo/{id}
Logo de comercializadora.

## Endpoints de ofertas (VALIDADOS - funcionan)

### GET publico/ofertas/electricidad
Listado principal de ofertas de electricidad. **Validado: devuelve 110+ ofertas.**

**Parametros** (query string, todos obligatorios):

**Estructura del formulario** (extraida del JS):
```javascript
{
  tipoSuministro: "E",
  codigoPostal: "28001",
  potencia: 3.5,
  potenciaPrimeraFranja: 3.5,
  potenciaSegundaFranja: 3.5,
  potenciaTerceraFranja: 3.5,
  potenciaCuartaFranja: 3.5,
  potenciaQuintaFranja: 3.5,
  potenciaSextaFranja: 3.5,
  consumoAnualE: 2600,
  consumoAnualEOrig: 2600,
  consumoPrimeraFranja: 900,
  consumoSegundaFranja: 800,
  consumoTerceraFranja: 900,
  consumoCuartaFranja: 0,
  consumoQuintaFranja: 0,
  consumoSextaFranja: 0,
  // campos Qr (consumo del QR original)
  consumoAnualEQr: 0,
  consumoPrimeraFranjaQr: 0,
  consumoSegundaFranjaQr: 0,
  consumoTerceraFranjaQr: 0,
  consumoCuartaFranjaQr: 0,
  consumoQuintaFranjaQr: 0,
  consumoSextaFranjaQr: 0,
  // campos PQr (consumo procesado QR)
  consumoAnualEPQr: 0,
  consumoPrimeraFranjaPQr: 0,
  consumoSegundaFranjaPQr: 0,
  consumoTerceraFranjaPQr: 0,
  consumoCuartaFranjaPQr: 0,
  consumoQuintaFranjaPQr: 0,
  consumoSextaFranjaPQr: 0,
  tarifa: 4,                    // 4 = 2.0TD
  curvaConsumo: null,
  consumoAnualG: 0,
  consumoAnualGOrig: 0,
  serviciosAdicionales: 1,
  permanencia: 1,
  idOferta: null,
  vivienda: true,
  factura: true,
  energiaAutoconsumo: 0,
  idAuditoriaQR: 0,
  potenciaAutoconsumo: 3.5,
  revisionPrecios: 2
}
```

**Parametros adicionales obligatorios** (descubiertos via HAR capture):
```javascript
{
  // ... los anteriores ...
  autoconsumo: false,
  importe: 0,
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
  dateInicio: 1747344140063,   // timestamp ms (inicio periodo)
  dateFin: 1778880140063,      // timestamp ms (fin periodo)
  tc: 0,                       // tipo contrato
  bs: 0,                       // bono social
  impSA: 0,                    // importe servicios adicionales
  impOtros: 0,
  exc: 0,                      // excedentes autoconsumo
  reg: 0,                      // tipo factura
  impOtrosConIE: 0,
  impOtrosSinIE: 0,
  pmaxP1: 0,                   // potencia maxima demandada P1
  pmaxP2: 0,                   // potencia maxima demandada P2
  fFact: 1778880140063,        // timestamp ms fecha facturacion
  dtoBS: 0, finBS: 0, ajuste: 0,
  impPot: 0, impEner: 0, dto: 0,
  prP1: 0, prP2: 0,
  prE1: 0, prE2: 0, prE3: 0,
  cfP1flex: 0, cfP2flex: 0,
  cambio: 0, promo: 0, verde: 0, rev: 0, trampeo: 0,
  cups: "0000"                 // ultimos 4 chars del CUPS
}
```

**CLAVE**: `dateInicio`, `dateFin` y `fFact` deben ser timestamps en milisegundos. Sin ellos, la API devuelve 0 ofertas.
`serviciosAdicionales=2` y `permanencia=2` para ver todas las ofertas sin filtrar.

### Estructura de respuesta (VALIDADA)

```json
{
  "resultadoComparador": [
    {
      "id": 7044,
      "idComercializadora": 196,
      "comercializadora": "DOMESTICA GAS Y ELECTRICIDAD SLU",
      "oferta": "Visalia Luz Fijo Empieza sin Pagar",
      "importePrimerAnio": 21.36,
      "importeSegundoAnio": 49.38,
      "importeEstimadoPenalizacion": 15.62,
      "penalizacion": true,
      "verde": true,
      "serviciosAdicionales": false,
      "tipoElectricidad": "TE",
      "tipoRevision": 5,
      "unicaFranja": "N",
      "peaje": "4",
      "mecanismoAjuste": "N",
      "tarifa": 4,
      "tienePrecioUnico": "S",
      "autoconsumo": false,
      "validez": "Válida sólo para consumidores domésticos"
    }
  ],
  "resultadoComparadorConAjustePrecio": [...],
  "resultadoComparadorSinAjustePrecio": [...],
  "resultadoComparadorConjuntas": [...],
  "resultadoFacturaQR": null,
  "consumo1": 900.0,
  "consumo2": 800.0,
  "consumo3": 900.0,
  "consumo4": 0.0,
  "consumo5": 0.0,
  "consumo6": 0.0
}
```

**Notas sobre la respuesta:**
- `importePrimerAnio`: coste anual con promociones (puede ser artificialmente bajo)
- `importeSegundoAnio`: coste anual real sin promocion (usar este para comparar)
- `importeEstimadoPenalizacion`: coste si cancelas antes de que acabe el contrato
- `penalizacion`: si la oferta tiene clausula de permanencia
- `verde`: si la energia es de origen renovable
- Total de ofertas: ~110 para una busqueda tipica

## Proximos pasos

1. **Contactar CNMC**: Escribir a info.comparador@cnmc.es para solicitar acceso formal
2. **Monitorizar**: Alertas si la API cambia o deja de responder

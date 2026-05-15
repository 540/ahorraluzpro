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

## Endpoints de ofertas (pendiente de validar parametros)

### GET publico/ofertas/electricidad
Listado principal de ofertas de electricidad.

**Parametros** (query string, dos objetos combinados):
- Objeto 1: formulario del usuario (consumo, potencia, tarifa, etc.)
- Objeto 2: segundo parametro (posiblemente paginacion/orden)

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

**Estado actual**: Devuelve 500 con los parametros probados. Necesita captura de peticion real desde DevTools para obtener la combinacion exacta.

### GET publico/ofertas/pvpc
Ofertas de tarifa regulada PVPC.

### GET publico/ofertas/simularpvpc
Simulacion de coste con PVPC.

### GET publico/ofertas/gas
Ofertas de gas.

### GET publico/ofertas/conjuntas
Ofertas combinadas luz+gas.

### GET publico/comparador/calculoQR
Calculo directo desde parametros del QR.

### POST publico/comparador/qre
Auditoria/logging del QR. Requiere campos `estado` y `qrCode`.

## Flujo interno del comparador

1. Usuario accede a `/comparador/QRE?cp=28001&pP1=3.5&...`
2. Middleware Nuxt ejecuta `gestionParametrosRouteQR()`:
   - Parsea query params del QR
   - Los mapea al formulario interno
   - Obtiene perfil de consumo si no existe (llama a `/api/publico/curvas`)
   - Codifica formulario como hex string
   - Navega a `/comparador/listado/{hexstring}`
3. Componente listado decodifica hex → formulario
4. Llama a `GET /api/publico/ofertas/electricidad?{formulario}&{paginacion}`
5. Renderiza lista de ofertas ordenadas por coste anual

## Codificacion hex de parametros

Los parametros del formulario se codifican en un string binario y luego a hexadecimal:
```javascript
// Posiciones en el string binario:
// 0: tipoSuministro (1=E, 2=G)
// 1: tarifa
// 2: serviciosAdicionales+permanencia
// 3-7: codigoPostal
// 8-42: potencias (6 franjas x formato XX.XXX)
// 43-84: consumos (6 franjas + anuales)
// ... etc (500+ caracteres)
```

La funcion `Ke.objToParams()` codifica y `Ke.gestionParametrosRoute()` decodifica.

## Proximos pasos

1. **Capturar peticion real**: Abrir comparador.cnmc.gob.es en Chrome DevTools > Network, hacer una busqueda real, y copiar la URL completa de la llamada a `/api/publico/ofertas/electricidad`
2. **Validar respuesta**: Confirmar estructura JSON de la respuesta de ofertas
3. **Documentar campos de respuesta**: Nombre oferta, comercializadora, precio anual, etc.
4. **Contactar CNMC**: Escribir a info.comparador@cnmc.es para solicitar acceso formal

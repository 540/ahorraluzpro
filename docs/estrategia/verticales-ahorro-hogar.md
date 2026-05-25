# Verticales de expansión: AhorraLuz → plataforma de ahorro del hogar

**Fecha:** 2026-05-17
**Estado:** Análisis preliminar para decisión de roadmap
**Autor:** Iker Mariñelarena (con investigación asistida)

---

## Contexto

AhorraLuz V1 resuelve un caso muy concreto: el usuario escanea el QR de su factura de la luz, la app llama a la API de la CNMC y le dice si puede ahorrar. Funciona porque hay (a) un identificador único portable (CUPS), (b) un formato de QR estandarizado por BOE, (c) una API pública neutral del regulador, (d) un mercado liberalizado donde el usuario puede cambiar.

La pregunta de producto: **¿qué otros consumos del hogar cumplen esas 4 condiciones?**

Este documento responde con un análisis vertical-por-vertical y propone un orden de expansión compatible con la filosofía actual (gratis, neutral, sin backend, sin afiliación).

---

## 1. Tabla resumen — priorización

| # | Vertical | Fuente oficial | Identificador único | Dificultad técnica (1-5) | Ahorro típico €/año | Frecuencia | Veredicto |
|---|---|---|---|---|---|---|---|
| 1 | **Gas natural** | CNMC (mismo comparador) | CUPS gas + QR factura | **1** | 100-250 € | Anual | ✅ **Fase 1** |
| 2 | **Combustible** | MITECO / Geoportal | Tipo combustible + geo | **1** | 100-300 € | Semanal | ✅ **Fase 2** |
| 3 | **Cuentas bancarias** | Banco de España | IBAN / comisiones | **3** | 50-200 € | Recurrente | 🤔 Fase 3 |
| 4 | **Hipotecas** | Banco de España | Datos del préstamo | **3** | 1.000-5.000 € (vida) | Puntual | 🤔 Fase 3 |
| 5 | **Telecomunicaciones** | CNMC (sin tarifas) | — | **4** | 200-480 € | Anual | ❌ Incompatible |
| 6 | **Seguro coche** | DGSFP (sin tarifas) | Matrícula | **4** | 200-300 € | Anual | ❌ Barrera regulatoria |
| 7 | **Seguro hogar** | DGSFP (sin tarifas) | — | **5** | 100-200 € | Anual | ❌ Barrera regulatoria |
| 8 | **Seguros vida/salud** | DGSFP (sin tarifas) | — | **5** | Variable | Anual | ❌ Barrera regulatoria |
| 9 | **Agua** | Sin regulador nacional | Contador | **5** | No portable | — | ❌ Monopolio municipal |
| 10 | Streaming/SaaS | — | — | 5 | <100 € | Recurrente | ❌ Fuera de scope |

---

## 2. Deep dives — los 3 candidatos viables

### 2.1 Gas natural — la siguiente apuesta obvia

**Por qué encaja perfecto:**
- Mismo dominio CNMC que ya integras: `https://comparador.cnmc.gob.es/`
- El QR de la factura de gas comparte arquitectura con el de luz, regulado por las mismas resoluciones [[BOE-A-2022-16989](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2022-16989)]
- **CUPS de gas existe** y es independiente del de electricidad — formato `ES + 20-22 caracteres` [[Naturgy](https://www.naturgy.es/hogar/blog/identificar_cups_factura)]
- Endpoint `publico/ofertas/gas` ya documentado en [CLAUDE.md](../../CLAUDE.md)
- Endpoint extra `publico/ofertas/conjuntas` para ofertas combinadas luz+gas
- Las comercializadoras están **obligadas por ley** a comunicar ofertas a la CNMC [[CNMC](https://www.cnmc.es/novedades/comparador-de-ofertas-de-electricidad-y-gas-natural-361703)]

**Parámetros del formulario CNMC para gas** (más simples que luz, sin franjas horarias):
- Código postal
- Consumo anual estimado en kWh
- Servicios adicionales (sí/no/indiferente)
- Permanencia (sí/no/indiferente)

**Ahorro típico:** 100-250 €/año en hogares con gas natural [[Rankia](https://www.rankia.com/blog/luz-y-gas/5871016-como-conseguir-mayor-ahorro-factura-luz-gas)].

**Comparadores existentes:** Selectra, Acierto, Rastreator, Kelisto, Roams — todos cobran comisión por lead [[Vizologi](https://vizologi.com/business-strategy-canvas/selectra-business-model-canvas/)]. La CNMC es la única opción neutral pero UX pésima.

**Coste estimado:** 1-2 semanas. Aprovecha 100% del stack actual.

**Decisión sugerida:** Renombrar a **AhorraEnergia** o mantener AhorraLuz como brand con módulo gas. Pivote técnico mínimo.

---

### 2.2 Combustible (gasolineras) — la mejor API pública de España

**Por qué encaja:**
- API REST pública del MITECO sin token: `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/` [[Datos.gob.es](https://datos.gob.es/en/catalogo/e05068001-precio-de-carburantes-en-las-gasolineras-espanolas)]
- **+11.000 estaciones** cubiertas, sistema RISP obliga a reportar precios antes de cambiarlos [[MITECO](https://www.miteco.gob.es/en/energia/servicios/consultas-de-carburantes.html)]
- Geoportal oficial: [geoportalgasolineras.es](https://geoportalgasolineras.es/)
- Sin autenticación, sin token, datos abiertos del Estado

**Identificador único:** No hay "CUPS del coche", pero la fricción es mínima — el usuario selecciona tipo de combustible una vez (95/diésel/GLP) y geolocaliza.

**Ahorro típico:** Para conductor medio (15.000 km/año, 7 L/100 km, diferencia 8 cts/L radio 5 km) → **~85-120 €/año**. Conductores intensivos: 300+ €.

**Bonus crítico:** **Convierte la app de uso anual a uso semanal.** Mejora retención dramáticamente.

**Comparadores existentes:** App oficial del Ministerio (mala UX), Waze, Google Maps integran precios. **No hay líder "neutral pro-consumidor"** — espacio libre.

**Coste estimado:** 2-3 semanas. Sin backend si se hace cliente-side con geolocalización del navegador.

---

### 2.3 Banca (cuentas y hipotecas) — Fase 3, requiere repensar UX

**Estado:**
- Banco de España opera dos comparadores oficiales en [Cliente Bancario](https://clientebancario.bde.es/pcb/es/menu-horizontal/actualidadeducac/educacion-financiera/comparadores-y-simuladores/):
  1. Comparador de comisiones de cuentas de pago
  2. Comparador de tipos de interés y comisiones (hipotecas, préstamos, depósitos)
- Las entidades están **obligadas a remitir datos al BdE**
- **Limitación crítica:** El BdE **NO expone API pública** — solo interfaz web

**Camino técnico:** Reverse engineering del comparador del BdE (similar al approach con CNMC). Viable pero más fricción.

**Identificador único:** No existe equivalente al CUPS. El usuario tendría que introducir: capital pendiente, plazo, TIN actual, tipo de hipoteca, etc.

**Por qué vale la pena pese a todo:**
- **Cuentas bancarias**: ahorro recurrente 50-200 €/año en comisiones, alcance universal, baja fricción
- **Hipotecas**: ahorro absoluto enorme (0,5 puntos en TIN sobre 150k€ a 25 años = ~12.000 €) pero uso puntual

**Veredicto:** Fase 3. Empezar por cuentas (más universal, menos fricción) antes que hipotecas.

---

## 3. Por qué descartamos otros verticales

### Telecomunicaciones — atractivo pero incompatible

La CNMC **regula** el sector pero **no opera un comparador de precios** [[CNMC Blog](https://blog.cnmc.es/2025/01/03/quien-me-ofrece-el-mejor-servicio-de-telecomunicaciones-la-cnmc-te-lo-pone-facil/)]. Solo hay test de velocidad y comparador de **calidad**, no de tarifas. [CNMC Data](https://data.cnmc.es/) publica datos agregados de mercado pero no precios comerciales.

Gasto medio paquete cuádruple: **40,3 €/mes** en 2024 [[Panel CNMC](https://www.cnmc.es/prensa/panel-indicadores-telecomunicaciones-20250627)]. Ahorro potencial: 200-480 €/año.

**Construir un comparador requeriría:**
- Scraping continuo de >10 operadores (Movistar, Vodafone, Orange, Digi, MásMóvil, O2, Yoigo, Pepephone, Lowi…)
- Gestión activa de >100 SKUs que cambian con frecuencia
- Tracking de promociones temporales

**Rompe la filosofía actual** (sin backend, sin scraping). Reconsiderar solo si se decide incorporar backend en una V3.

### Seguros — barrera regulatoria DGSFP

La DGSFP **no opera comparador oficial** ni publica APIs de tarifas — solo registro de aseguradoras [[DGSFP](https://rrpp.dgsfp.mineco.es/)]. Los precios son dinámicos por perfil de riesgo, no existe "precio público" comparable.

Obtener cotizaciones reales exige **integrarse como mediador autorizado** (con licencia, capital social, contratos con cada aseguradora). Rompe la promesa "100% neutral, sin afiliación".

Mercado enorme (autos 13.180 M€, hogar 9.968 M€, salud 12.059 M€ [[UNESPA](https://www.unespa.es/notasdeprensa/negocio-asegurador-diciembre-2024/)]) pero **inalcanzable sin renunciar a la neutralidad.**

### Agua — no es comparable

Gestión municipal, sin regulador nacional con poder tarifario [[iAgua](https://www.iagua.es/noticias/redaccion-iagua/laberinto-tarifario-quien-tiene-ultima-palabra-precio-agua-espana)]. Las diferencias entre ciudades son enormes (148 € Ourense vs. 516 € Barcelona para 150 m³/año [[OCU](https://www.ocu.org/alimentacion/agua/noticias/precios-agua-grifo-2025)]) pero **el usuario no puede cambiar de proveedor** — monopolio local.

---

## 4. Verticales adyacentes a considerar como features (no productos)

- **Autoconsumo solar / placas fotovoltaicas**: Los campos `energiaAutoconsumo` y `potenciaAutoconsumo` ya están en el QR. Función natural dentro del comparador de luz: *"¿te compensaría poner placas?"*
- **Bono social eléctrico/térmico**: Calculadora oficial vía datos.gob.es. Alineado con filosofía pro-consumidor. Coste bajo.
- **Movilidad eléctrica (puntos de recarga)**: Mapa oficial del Ministerio. Extensión natural del módulo combustible.

---

## 5. Recomendación final

### Roadmap propuesto

**Fase 1 (Q3 2026, 4-6 semanas):** Gas natural.
Lanzar como módulo dentro de AhorraLuz o pivotar marca a **AhorraEnergia**. Pivote técnico mínimo, narrativa coherente.

**Fase 2 (Q4 2026, 6-8 semanas):** Combustible.
Primera ruptura del paradigma "QR de factura" pero usando la mejor API pública de España. Aumenta drásticamente la frecuencia de uso de la app.

**Fase 3 (2027, decisión estratégica):** Cuentas bancarias (antes que hipotecas).
Datos del BdE, alcance universal, ahorro recurrente, sin necesidad de licencia de mediador.

### Tres principios para validar cualquier vertical futuro

1. **Datos públicos** de un regulador (sin scraping de comparadores comerciales).
2. **Sin partnerships ni comisiones** con proveedores.
3. **Compatible con stack 100% frontend** (CORS habilitado o proxy ligero).

Gas y Combustible cumplen los tres. El resto exige relajar al menos uno.

---

## Apéndice: fuentes verificadas

- Comparador CNMC: https://comparador.cnmc.gob.es/
- BOE QR factura electricidad: https://www.boe.es/diario_boe/txt.php?id=BOE-A-2021-11035
- BOE QR factura modificación: https://www.boe.es/diario_boe/txt.php?id=BOE-A-2022-16989
- Geoportal Gasolineras: https://geoportalgasolineras.es/
- API REST carburantes (doc): https://www.miteco.gob.es/en/energia/hidrocarburos-nuevos-combustibles/risp/envio-informacion/api---rest.html
- Endpoint REST gasolineras: https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/
- BdE Cliente Bancario: https://clientebancario.bde.es/pcb/es/menu-horizontal/actualidadeducac/educacion-financiera/comparadores-y-simuladores/
- CNMC Data (estadísticas): https://data.cnmc.es/
- CNMC test velocidad telecos: https://calidadtelecos.cnmc.gob.es/
- DGSFP registro aseguradoras: https://rrpp.dgsfp.mineco.es/
- UNESPA negocio asegurador 2024: https://www.unespa.es/notasdeprensa/negocio-asegurador-diciembre-2024/
- Panel telecos CNMC 2025: https://www.cnmc.es/prensa/panel-indicadores-telecomunicaciones-20250627

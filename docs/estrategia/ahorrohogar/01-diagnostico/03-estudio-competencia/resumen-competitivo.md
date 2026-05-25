# Resumen competitivo — visión cruzada

> Síntesis del análisis competitivo: matriz cruzada, mapa de posicionamiento, y **validación final de las hipótesis H1-H4** que dejamos apuntadas al cerrar la visión.
>
> **Trazabilidad:** todos los datos cuantitativos y afirmaciones de hecho llevan fuente inline con `[[Fuente: nombre](URL)]`. Los deep dives individuales en [deep-dives/](deep-dives/) contienen las fuentes desagregadas por competidor.

---

## Matriz comparativa cruzada

| Dimensión | Selectra | Kelisto | Roams | Rastreator | Acierto | Comparadorluz | IACompara | OCU | CNMC | **AhorraCasa (target)** |
|---|---|---|---|---|---|---|---|---|---|---|
| **Modelo** | Comisión | Comisión | Comisión | Comisión | Comisión | Comisión | Comisión | Suscripción | Público | **Donaciones** |
| **Cobra a comercializadora** | ✅ [^1] | ✅ [^2] | ✅ [^3] | ✅ [^4] | ✅ [^4] | ✅ [^5] | ✅ [^6] | ❌ [^7] | ❌ | **❌** |
| **Modelo declarado abiertamente** | ❌ (opaco) [^1] | ✅ [^2] | ✅ [^3] | — | — | — | ✅ ("pequeña comisión") [^6] | ✅ [^7] | N/A | **✅** |
| **QR oficial BOE como entrada** | ❌ [^8] | ❌ [^2] | ❌ [^3] | ❌ | ❌ | ❌ | ❌ (lee imagen completa) [^6] | ❌ | ✅ [^9] | **✅** |
| **Subida factura (OCR)** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ [^6] | ❌ | ❌ | (vía QR puro) |
| **Asesor humano** | ✅ (tel+WA) [^8] | ❌ | ✅ [^3] | ❌ | ❌ | ❌ | ❌ (chat IA) [^6] | Parcial | ❌ | **❌** |
| **Multi-vertical** | ✅ 8+ verticales [^8] | ✅ Energía+telecos+banca [^2] | ✅ Energía+telecos+seguros+banca [^3] | ✅ Seguros+energía [^4] | ✅ Seguros+energía [^4] | ❌ Solo energía [^5] | ❌ Solo luz [^6] | ✅ Multi-consumo [^7] | ✅ Energía | **✅ (visión)** |
| **App móvil dedicada** | ✅ (TarifaLuzHora) [^10] | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | (posible V2+) |
| **Monitoreo continuo / alarmas** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Parcial (Compras Colectivas) [^7] | ❌ | **✅ (V2)** |
| **Tarifas comparadas** | 300+ [^8] | "Decenas" [^2] | "Decenas" [^3] | n/d | n/d | **350+ (mayor)** [^5] | 200+ [^6] | 160+ [^7] | **Mercado completo** | Mercado completo (vía CNMC) |
| **Compañías cubiertas** | 100+ (estimado) | n/d | n/d | n/d | n/d | **100+** [^5] | "Todas" [^6] | 46 [^7] | **Todas** | Todas (vía CNMC) |
| **Sin datos personales del usuario** | ❌ (teléfono+email) [^8] | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ (sube factura) [^6] | ❌ (email+tel) [^7] | ❌ (en flujo manual) | **✅ (V1 sin auth)** |
| **Propósito declarado neutralidad** | ❌ | "Independiente" (sin auditar) [^2] | "Defensor consumidor" [^3] | ❌ | ❌ | ❌ | "No afecta" [^6] | ✅ (creíble) [^7] | ✅ (institucional) | **✅ (estructural)** |
| **Propiedad transparente** | Grupo Selectra | Admiral plc (no comunicado) [^11] | Independiente, busca inversión [^3] | Zoopla Group desde 2021 [^12] | Zoopla Group desde 2021 [^12] | n/d | Sin info pública [^6] | Asociación pública [^7] | Institución pública | **Fundador con nombre** |

### Lo que se ve de un vistazo

- **Modelo de negocio:** **7 de los 9 competidores analizados cobran a las comercializadoras** (síntesis del análisis propio, basada en las fuentes [^1] a [^6]). Las 2 excepciones (OCU y CNMC) tienen modelos imitables solo a costes muy altos (asociación de socios [^7] o financiación pública). **AhorraCasa con donaciones es modelo nuevo en el espacio.**
- **QR oficial BOE:** **AhorraCasa es la única alternativa pública además del CNMC que decodifica el QR estándar** (síntesis derivada de [^8] a [^9]). IACompara mete OCR de imagen completa [^6], lo cual cubre el mismo hueco funcional con peor privacidad.
- **Monitoreo continuo / alarmas:** **nadie lo ofrece** en el mercado actual (verificado en cada deep dive — sección "Funcionalidades clave" de cada uno).
- **App móvil dedicada:** **solo Selectra (TarifaLuzHora) la tiene** [^10] — pero es de monitorización PVPC, no comparador.
- **Sin datos personales del usuario:** **AhorraCasa V1 es único** — el resto pide email/teléfono mínimo (verificado en cada deep dive — sección "UX/onboarding").

---

## Mapa de posicionamiento (dos ejes principales)

### Eje 1: Modelo económico (alineación con el usuario)

```
ALTA NEUTRALIDAD (paga el usuario o nadie)
              ▲
              |
        CNMC  ●        ● OCU
              |
              |
              |             ● AhorraCasa (V1 → V2)
              |
              |---------------------------►  ALTA AUTONOMÍA (sin asesor humano)
              |    ●Comparadorluz
              |    ●MenosdeLuz
              |    ●AhorreLuz
              |    ●IACompara
              |    ●Kelisto
              |
              |        ●Acierto
              |        ●Rastreator
              |               ●Roams
              |               ●Selectra
              ▼
BAJA NEUTRALIDAD (cobra a comercializadoras)
```

**Lectura:** El cuadrante superior-derecho (alta neutralidad + alta autonomía) **está prácticamente vacío** — CNMC y OCU están ahí pero con desventajas documentadas: CNMC tiene UX desigual [^13], OCU exige suscripción de ~287 €/año tras promoción [^14]. AhorraCasa puede ocupar ese cuadrante con UX cuidada y modelo de donaciones — **es el hueco estratégico de la visión**.

### Eje 2: Foco vertical vs amplitud multi-vertical

```
SOLO ENERGÍA (LUZ + GAS)            MULTI-VERTICAL
              ◄────────────────────────────►
   Comparadorluz                    Selectra ●
   MenosdeLuz   ●                   Kelisto  ●
   AhorreLuz    ●                   Roams    ●
   AhorraLuzOnline ●                Rastreator+Acierto ●
   IACompara    ●
   CNMC         ●                              OCU ●

                                       AhorraCasa (target) ●
```

**Lectura:** El target multi-vertical (luz + gas + combustible + banca) coloca a AhorraCasa **junto a Selectra/Kelisto/Roams en amplitud, pero en distinto cuadrante de neutralidad** (eje 1). La combinación "multi-vertical + neutral + sin asesor humano + con monitoreo continuo" es **única en el mercado actual** (síntesis de los 6 deep dives + análisis ligero).

---

## Validación final de hipótesis H1-H4

> Hipótesis dejadas apuntadas en `README.md` al cerrar la visión. Validación basada en los deep dives.

### H1 — Comparadores comerciales cobran comisión a las comercializadoras

**✅ Validada — Universal en el segmento comercial.**

| Player | Estado | Cómo lo declara | Fuente |
|---|---|---|---|
| Selectra | ✅ Cobra | Implícito (no en web, sí en análisis externo) | [^1] |
| Kelisto | ✅ Cobra | **Declarado abiertamente** en FAQ general | [^2] |
| Roams | ✅ Cobra | Declarado abiertamente como "modelo de afiliación" | [^3] |
| Rastreator | ✅ Cobra | Estándar del modelo Zoopla Group | [^4] |
| Acierto | ✅ Cobra | Estándar del modelo Zoopla Group | [^4] |
| IACompara | ✅ Cobra | Declarado ("pequeña comisión si contratas") | [^6] |
| Comparadorluz / MenosdeLuz / AhorreLuz / AhorraLuzOnline | ✅ Cobra (presumido) | Modelo estándar del segmento | [^5] |
| OCU | ❌ NO cobra | Financiado por socios (cuota mensual) | [^7] |
| CNMC | ❌ NO cobra | Servicio público financiado por PGE | [^9] |

**Implicación:** la diferenciación de AhorraCasa por "no cobramos a las comercializadoras" es **verdadera y verificable** contra 8 competidores comerciales. Las únicas alternativas neutrales (OCU + CNMC) tienen sus propias limitaciones (cuota alta vs UX pésima). **AhorraCasa ocupa hueco real.**

### H2 — Los comparadores muestran publicidad de eléctricas o sesgan resultados

**✅ Validada parcialmente — Sesgo estructural confirmado, no necesariamente publicidad visible.**

- **Selectra:** "+83 partners" declarado en la propia web [^8] + casos documentados de "confusión deliberada" con operadoras donde el usuario cree que habla con su comercializadora y firma con otra [[Trustpilot — Selectra.info](https://www.trustpilot.com/review/selectra.info)].
- **Kelisto:** usa **tradedoubler.com** como red de afiliación (visible en los enlaces de oferta) [^2]; aplica **cláusulas "Nación Más Favorecida"** que reducen competencia entre proveedores [[Seguratis](https://seguratis.com/kelisto/)].
- **Roams:** **crítica explícita de usuarios**: *"solo ofrecen lo que les interesa vender, no al cliente"* [[Shopping-satisfaction](https://shopping-satisfaction.es/reviews-y-opiniones-de-clientes-de-roams/)].
- **IACompara:** declara la comisión pero claim "no afecta a nuestras recomendaciones" [[Ganaenergia](https://ganaenergia.com/blog/iacompara-opiniones/)] sin auditoría externa.

**Implicación:** el sesgo es **estructural por modelo de negocio**, no por mala fe individual. AhorraCasa puede comunicarlo como hecho objetivo del mercado, no como acusación.

### H3 — El comparador CNMC tiene mala UX comparado con los comerciales

**✅ Validada parcialmente — UX desigual: bien con QR, mal sin QR + problemas técnicos puntuales.**

- **Cuando se usa con QR:** "muy fácil de utilizar" [[Preahorro](https://preahorro.com/como-ahorrar/comparador-de-ofertas-de-energia-de-la-cnmc-funciona-bien/)].
- **Sin QR:** "toca seguir unos pasos algo complejos" (perfil consumo, potencias por franja, etc.) [[Preahorro](https://preahorro.com/como-ahorrar/comparador-de-ofertas-de-energia-de-la-cnmc-funciona-bien/)].
- **Problemas técnicos** documentados: páginas en blanco, comparador no carga ni desde QR ni desde enlace directo [[Bandaancha foro](https://bandaancha.eu/foros/comparador-cnmc-1759943)].
- **Errores conceptuales** en cómo presenta la comparativa [[Carlos Codina — YouTube](https://www.youtube.com/watch?v=rHUTAM3Xg-E)].

**Implicación:** **AhorraCasa no necesita batir al CNMC en datos** (le copia los datos vía API). Necesita **batirle en UX, fiabilidad técnica y presentación clara** — todo lo cual es muy factible con un equipo dedicado y un stack moderno.

### H4 — Selectra (y similares) NO usan escaneo QR para extraer datos del contrato del usuario

**✅ Validada — Confirmado para todos los comparadores comerciales analizados.**

| Player | Mecánica de entrada | Fuente |
|---|---|---|
| Selectra | Typeform + teléfono + WhatsApp (sin QR) | [^8] |
| Kelisto | Filtros web + CUPS al contratar (sin QR) | [^2] |
| Roams | Formulario web + asesor (sin QR) | [^3] |
| Rastreator / Acierto | Formulario web (sin QR) | [^4] |
| Comparadorluz | Formulario web (sin QR) | [^5] |
| MenosdeLuz | **Subida de factura o consumo** (no QR puro) | [^5] |
| AhorreLuz | **Subida de factura + CUPS + consumo** (no QR puro) | [^5] |
| IACompara | **Subida de factura completa con OCR** (no QR puro) | [^6] |
| OCU | Formulario con perfil de consumo (sin QR) | [^7] |
| CNMC | **Sí usa QR** + opción manual | [^9] |

**Implicación clave matizada:** la ventaja de AhorraCasa no es solo "QR vs Typeform", sino **"QR estándar BOE sin datos personales vs OCR de factura completa que mete datos al servidor del proveedor"**. La diferencia técnica importa para RGPD y privacidad. Es comunicable como ventaja del usuario: *"AhorraCasa no necesita ver tu factura, solo el QR oficial que la propia CNMC ha estandarizado."*

---

## Hipótesis adicionales emergentes (para validar en user research)

### H5 (nueva) — El usuario español no sabe que el QR de su factura sirve para comparar tarifas

**Evidencia preliminar:** medios generalistas publican artículos explicativos en 2024-2025 *justamente porque* el conocimiento del activo regulatorio es bajo:
- [[Hipertextual — Este simple código QR de la factura de la luz te ayudará a ahorrar](https://hipertextual.com/guias/codigo-qr-factura-luz-electricidad/)]
- [[Xataka — QR en tu factura de la luz: para qué sirve y cómo usarla](https://www.xataka.com/basics/qr-tu-factura-luz-sirve-como-usarla-para-encontrar-companias-baratas)]
- [[XatakaHome — Pocos saben que en la factura de la luz hay dos códigos QR](https://www.xatakahome.com/iluminacion-y-energia/tu-factura-luz-hay-dos-qr-uno-esta-muy-escondido-que-sirve)]

**Implicación si se valida:** la **educación del usuario sobre el QR es palanca de adquisición** clave para AhorraCasa. La marca puede capturar la asociación mental "QR factura = AhorraCasa".

### H6 (nueva) — El target 28-55 digital prefiere "lo hago yo en mi móvil" antes que "que me llame un asesor"

**Evidencia preliminar:** los comparadores con asesor (Selectra [^8], Roams [^3]) son los líderes en volumen — sugiere que muchos usuarios prefieren la asistencia. Pero **ambos también ofrecen flujo web autoservicio** y no se publican datos públicos sobre la división de adopción. La penetración móvil del target es muy alta: **97,4% de los hogares con banda ancha, 92,5% usa Internet diariamente, 74,7% banca online, 50,3% solo móvil** [[INE — Encuesta TIC Hogares 2025](https://www.ine.es/dyngs/Prensa/TICH2025.htm)].

**Implicación si se valida:** AhorraCasa con flujo autoservicio + QR cubre al target. Si **NO se valida** (el usuario prefiere asesor), AhorraCasa pierde mercado por su decisión de "no ejecutar". **Validar en personas + customer journeys.**

### H7 (nueva) — El usuario que ya ha cambiado una vez es más receptivo a herramientas neutrales

**Evidencia preliminar (con fuentes):**
- **El 13,7% de los hogares españoles cambió de comercializadora eléctrica en 2024** según el CNMC Household Panel publicado en mayo 2025 [[CNMC — Informe de Supervisión de los Cambios de Comercializador](https://www.cnmc.es/sites/default/files/5881290.pdf)].
- 2024 marcó **récord histórico con 7,25 millones de cambios totales** de comercializador eléctrico (todos los segmentos) [[CNMC Blog — Récord cambios comercializador 2024](https://blog.cnmc.es/2025/07/30/record-cambios-comercializador-2024/)].
- **2,7 M de hogares con experiencia reciente de cambio** = cálculo derivado del 13,7% de los 19,5 M de hogares en España [[INE — Encuesta Continua de Hogares Q1 2025](https://ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736176952)].
- Es **probable** (hipótesis, no validada) que tras el primer cambio, el usuario sea más crítico con los comparadores "vendedores".

**Implicación si se valida:** segmentar comunicación entre "usuarios novatos del cambio" y "usuarios con experiencia" — narrativas distintas.

---

## Implicaciones globales del análisis competitivo

1. **AhorraCasa ocupa un hueco verificable y defendible**: cuadrante "neutralidad estructural + autonomía + monitoreo continuo + QR" donde solo coexisten parcialmente CNMC (UX desigual [^13]) y OCU (cuota ~287 €/año tras promoción [^14]).

2. **El mercado de comparadores está concentrado en 4 grupos reales** (síntesis del análisis competitivo):
   - **Selectra** (grupo propio, 106 M€ globales 2024 [[Vizologi](https://vizologi.com/business-strategy-canvas/selectra-business-model-canvas/)])
   - **Zoopla Group** (Rastreator + Acierto, comprados a Admiral/Mapfre por 560 M€ en 2021 [^12])
   - **Admiral plc** (Kelisto, mismo grupo británico que la era anterior de Rastreator [^11])
   - **Roams** (independiente, busca inversión activa [^3])

3. **La ventana competitiva es ahora**: **switching récord histórico (7,25 M cambios en 2024)** [[CNMC Blog](https://blog.cnmc.es/2025/07/30/record-cambios-comercializador-2024/)], todos los competidores tradicionales atados a su modelo de comisiones, ningún player nuevo con neutralidad estructural ha consolidado posición. Si AhorraCasa no entra ahora, en 18-24 meses el mercado puede normalizarse.

4. **Aliados potenciales identificados**: OCU, FACUA, CNMC, Rankia/blogs especializados (detallados en [analisis-ligero/apps-y-sustitutos.md](analisis-ligero/apps-y-sustitutos.md)). Son **canales de adquisición naturales** que comparten filosofía y no canibalizan.

5. **La narrativa AhorraCasa puede construirse sobre datos públicos**: las hipótesis H1-H4 están validadas con fuentes citables. Comunicación basada en evidencia, no en acusación gratuita.

---

## Lo que sigue

- Sub-fase 3.4 — **User research** (personas, customer journeys, JTBD). Validar H5, H6, H7 emergentes.
- Sub-fase 3.5 — **Síntesis** de problemas core + oportunidades agregadas + priorización tentativa.

---

## Fuentes

[^1]: [Vizologi — Selectra Business Model Canvas](https://vizologi.com/business-strategy-canvas/selectra-business-model-canvas/) — confirma modelo de comisión por lead pagada por comercializadoras. Ver deep dive en [deep-dives/selectra.md](deep-dives/selectra.md).

[^2]: [Kelisto — FAQ "¿Cómo ganamos dinero?"](https://www.kelisto.es/) — declara abiertamente comisión al proveedor (fijo por redirección o success-fee). Ver deep dive en [deep-dives/kelisto.md](deep-dives/kelisto.md).

[^3]: [Puntua.net — Opiniones sobre Roams.es](https://puntua.net/empresa/opiniones-sobre-roams-es/) y [Roams — Quiénes somos](https://roams.es/detras-de-roams/) — modelo afiliación declarado; búsqueda activa de inversión en [Club CEO España](https://www.clubceo.es/actividades/descubrimos-roams-una-oportunidad-de-inversion/). Ver deep dive en [deep-dives/roams.md](deep-dives/roams.md).

[^4]: [SegurosNews — Admiral, Mapfre y Oakley Capital unirán Rastreator y Acierto](https://segurosnews.com/news/admiral-mapfre-y-oakley-capital-uniran-las-operaciones-de-rastreator-y-acierto) y [El Español — Admiral y Mapfre venden Rastreator por 560M€](https://www.elespanol.com/invertia/mis-finanzas/consumo/20201229/admiral-mapfre-venden-portal-rastreator-millones-euros/547195647_0.html) — ambos del modelo de comparador con comisión. Ver [analisis-ligero/comparadores-secundarios.md](analisis-ligero/comparadores-secundarios.md).

[^5]: Análisis ligero en [analisis-ligero/comparadores-secundarios.md](analisis-ligero/comparadores-secundarios.md). Comparadorluz declara "350+ tarifas, 100+ compañías" en [comparadorluz.com](https://comparadorluz.com/); MenosdeLuz acepta subida de factura según [menosdeluz.com](https://www.menosdeluz.com/); AhorreLuz idem según [ahorreluz.es](https://www.ahorreluz.es/). Modelo de comisión presumido por ser estándar del segmento.

[^6]: [Ganaenergia — IACompara: ¿Qué es y cómo funciona?](https://ganaenergia.com/blog/iacompara-opiniones/) — declara comisión: *"Reciben una pequeña comisión de algunas compañías solo si decides contratar, pero esto no afecta a nuestras recomendaciones."* Ver deep dive en [deep-dives/iacompara.md](deep-dives/iacompara.md).

[^7]: [OCU — Cuánto cuesta ser socio](https://www.ocu.org/info/precios-suscripcion) — financiación por cuotas de socios, sin comisiones de proveedores; [OCU — Entidades incluidas en el comparador](https://www.ocu.org/vivienda-y-energia/gas-luz/companias-tarifas) — 160+ tarifas de 46 compañías. Ver deep dive en [deep-dives/ocu-simulador.md](deep-dives/ocu-simulador.md).

[^8]: [Selectra — Home](https://selectra.es) — verticales operadas (energía, internet, móvil, alarmas, seguros, finanzas, agua = 8+); flujo de entrada vía Typeform + teléfono + WhatsApp; "+83 partners" declarado en home. Ver deep dive en [deep-dives/selectra.md](deep-dives/selectra.md).

[^9]: [CNMC — Comparador de Ofertas de Energía](https://comparador.cnmc.gob.es/) y [CNMC — Código QR factura luz](https://www.cnmc.es/prensa/codigo-QR-factura-luz-20210702) — servicio público con QR como flujo de entrada principal. Ver deep dive en [deep-dives/cnmc-comparador.md](deep-dives/cnmc-comparador.md).

[^10]: [Google Play — TarifaLuzHora (paquete `es.selectra.tarifaluzhora`)](https://play.google.com/store/apps/details?id=es.selectra.tarifaluzhora) — propiedad de Selectra confirmada por el namespace del paquete. Ver deep dive en [deep-dives/selectra.md](deep-dives/selectra.md).

[^11]: [Seguratis — Kelisto pertenece a Admiral Group plc](https://seguratis.com/kelisto/) — no se reconoce abiertamente en la web de Kelisto. Ver deep dive en [deep-dives/kelisto.md](deep-dives/kelisto.md).

[^12]: [Webcapitalriesgo — Oakley Capital + Admiral Group acuerdan compra de Rastreator y Acierto](https://www.webcapitalriesgo.com/oakley-capital-acuerdo-junto-con-admiral-group-la-compra-de-rastreator-y-acierto-com/) y [El Español — Admiral y Mapfre venden Rastreator por 560M€ en 2021](https://www.elespanol.com/invertia/mis-finanzas/consumo/20201229/admiral-mapfre-venden-portal-rastreator-millones-euros/547195647_0.html). El cambio de propiedad a Zoopla Group ocurrió en 2021.

[^13]: [Preahorro — ¿Funciona bien el comparador CNMC?](https://preahorro.com/como-ahorrar/comparador-de-ofertas-de-energia-de-la-cnmc-funciona-bien/); [Bandaancha — foro CNMC](https://bandaancha.eu/foros/comparador-cnmc-1759943) (problemas técnicos); [Carlos Codina — YouTube crítica](https://www.youtube.com/watch?v=rHUTAM3Xg-E) (errores conceptuales).

[^14]: [OCU — Cuánto cuesta ser socio](https://www.ocu.org/info/precios-suscripcion) — cuota estándar 23,90 €/mes desde el mes 7, sin permanencia (2 €/2 meses promoción inicial → 11,95 €/mes meses 3-6 → 23,90 €/mes desde mes 7).

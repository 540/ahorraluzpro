# Síntesis: problemas y oportunidades

> **Cierre del diagnóstico de AhorraCasa (2026-05-22).** Esta es la pieza que destila todo el material del diagnóstico (mercado + contexto + competencia + personas + journey + JTBD + informe técnico) en una lista priorizada de problemas y oportunidades que servirá de input al modelo económico y a la política guía.

## ¿Para qué sirve este documento?

**Destilar** todo el diagnóstico en una lista clara y priorizada de:

1. Los **problemas core** del usuario que vemos.
2. Las **oportunidades** detectadas a lo largo del research.
3. Una **priorización** que servirá como input para la política guía y el Opportunity Solution Tree.

Este es el puente entre el diagnóstico (entender qué pasa) y las acciones (decidir qué hacer).

## Origen

Síntesis consolidada de:

- [Estudio de mercado](01-estudio-mercado.md) — tamaño, tendencias, regulación.
- [Contexto del producto](02-contexto-producto.md) — situación del fundador, restricciones organizativas.
- [Estudio de competencia](03-estudio-competencia/) — 10 archivos: 6 deep dives + análisis ligero + apps/sustitutos + resumen cruzado.
- [Personas](04-user-research/personas.md) — 2 perfiles con 10 oportunidades.
- [Customer journey](04-user-research/customer-journeys.md) — 8 fases del usuario con 13 oportunidades por fase.
- [JTBD](04-user-research/jtbd.md) — 9 jobs priorizados por rol estratégico.
- [Informe técnico Datadis](../investigaciones-tecnicas/seguimiento-continuo-datos-2026-05-21.md) — viabilidad del gestor continuo.

> **Todas las cifras y afirmaciones llevan trazabilidad inline** según la regla dura del proyecto.

---

## Problemas core del usuario (top 5)

> Cada problema es **del usuario**, **observable** y **soportado por evidencia**. No son problemas de negocio.

### Problema 1 — El usuario paga de más sin saberlo y sin sentir la urgencia de actuar

**Descripción:** El usuario español medio no tiene baseline para saber si su tarifa es competitiva. Convive con la duda crónica de "igual estoy pagando de más" pero la sensación no se traduce en acción porque no hay un cuantificador visible ni un próximo paso claro.

**Evidencia:**
- Solo el **13,7% de los hogares españoles cambió de comercializadora eléctrica en 2024** [[CNMC Household Panel 2025-05](https://www.cnmc.es/sites/default/files/5881290.pdf)] — el 86,3% permanece en estado base todo el año.
- **7 de cada 10 viviendas pagan de más** solo por sobrecontratación de potencia → **~1.000 M€/año de sobrecoste agregado evitable** [[FACUA / Infobae 2026-01-08](https://www.infobae.com/espana/2026/01/08/la-factura-de-la-luz-sube-un-155-en-2025-y-alcanza-los-976-euros-anuales-de-media-segun-facua/)].
- Citas literales de usuarios potenciales (entrevistas informales del fundador, mayo 2026): *"Llevo años con la misma compañía y nunca lo he mirado."* / *"Sé que pago de más pero no tengo tiempo para investigarlo cada año."*

**A quién afecta:** Ambas personas (P1 y P2), todas las fases del journey, especialmente fase 1 (estado base) y fase 2 (trigger).

**Impacto si se resuelve:** Es el problema raíz del producto — si se resuelve, se resuelve el outcome principal de la visión. Impacto agregado potencial muy alto (1M€/año de ahorro a usuarios = hito 12 meses de la visión).

---

### Problema 2 — Las alternativas neutrales del mercado tienen barreras propias inaceptables

**Descripción:** El usuario que sí decide buscar fuente fiable se encuentra con que las opciones realmente neutrales (CNMC y OCU) tienen barreras estructurales que las hacen poco accesibles para el target. Como resultado, **se ve empujado a comparadores comerciales sesgados** o abandona la búsqueda.

**Evidencia:**
- **CNMC** — UX desigual: bien con QR pero "toca seguir unos pasos algo complejos" sin QR; problemas técnicos reportados como "páginas en blanco" [[Bandaancha foro](https://bandaancha.eu/foros/comparador-cnmc-1759943)]; errores conceptuales documentados en cómo presenta la comparativa [[Carlos Codina YouTube](https://www.youtube.com/watch?v=rHUTAM3Xg-E)].
- **OCU** — neutral y bien hecha, pero exige suscripción de hasta **23,90 €/mes (~287 €/año tras promoción inicial)** [[OCU — Cuánto cuesta ser socio](https://www.ocu.org/info/precios-suscripcion)]. Barrera económica para un usuario que busca *ahorrar* en sus servicios básicos.
- **8 de los 9 comparadores comerciales analizados cobran comisión por lead a las comercializadoras** — H1 validada en [resumen-competitivo](03-estudio-competencia/resumen-competitivo.md). Selectra es opaco al respecto [[Vizologi](https://vizologi.com/business-strategy-canvas/selectra-business-model-canvas/)]; Kelisto/Roams lo declaran abiertamente [[Kelisto FAQ](https://www.kelisto.es/)] [[Roams modelo](https://puntua.net/empresa/opiniones-sobre-roams-es/)].

**A quién afecta:** Ambas personas. P2 (que ya cambió y desconfía) lo identifica explícitamente como filtro de confianza inicial.

**Impacto si se resuelve:** Liberar el cuadrante "rápido + neutral + gratuito + UX cuidada" — espacio en blanco competitivo verificado.

---

### Problema 3 — El usuario activado es capturado por canales no neutrales

**Descripción (matizada tras informe de demanda digital 2026-05-22):** El usuario español **sí actúa** cuando hay trigger de precio o factura — pero **el canal dominante es telemarketing/SEO de comercializadoras**, no comparadores neutrales en frío. AhorraCasa no compite contra "el usuario que no busca" en términos absolutos; compite por **interceptar la fracción del usuario activado que busca neutralidad y desconfía del telemarketing**. Sin canal de exposición eficaz para ese nicho, el journey no empieza.

**Evidencia:**
- **7,25 M cambios de comercializador en 2024 — tasa 23,9%** [[CNMC Blog 2025-07-30](https://blog.cnmc.es/2025/07/30/record-cambios-comercializador-2024/)]. El usuario español **sí cambia**, pero a través de canales push.
- **Selectra recibe >1M visitas/mes** (selectra.info: 907,97K visitas en diciembre 2025) [[Semrush](https://www.semrush.com/website/selectra.info/overview/)], con 14 años de SEO industrial [[Linking and Growing](https://linkingandgrowing.substack.com/p/analisis-del-crecimiento-de-selectra)] — frente SEO genérico perdido para un proyecto sin presupuesto.
- **Las búsquedas de "ahorrar luz" se multiplicaron x27 entre febrero/marzo y junio en 2021** [[El Confidencial Digital](https://www.elconfidencialdigital.com/articulo/tendencias/busquedas-google-ahorrar-luz-han-disparado-verano-como-coste/20210810131709267868.html)] — la atención existe pero es estacional y reactiva.
- **El QR oficial BOE existe desde 2021** pero *"muchos consumidores aún desconocen esta funcionalidad"* [[Consumer.es](https://www.consumer.es/economia-domestica/servicios-y-hogar/factura-luz-codigo-qr-ayuda-ahorro.html)]. **No hay encuestas públicas de adopción** — gap relevante.
- Hallazgo de entrevistas informales del fundador: *"Igual no de primeras, pero cuando hagas se lo cuentas entonces se interesan."* — válido como descripción del usuario en frío, matizado por los datos de switching.

**A quién afecta:** Ambas personas. Es problema estructural de toda la categoría neutral.

**Impacto si se resuelve:** Habilitar adquisición sostenible interceptando al usuario activado que busca neutralidad, sin competir frontalmente con Selectra en SEO masivo.

> **Hipótesis H5 — refutada parcialmente** (ver informe completo en [investigaciones-tecnicas/demanda-digital-2026-05-22.md](../investigaciones-tecnicas/demanda-digital-2026-05-22.md)): el usuario sí busca, pero por canales no neutrales. El matiz reformula la estrategia de adquisición — NO-SEO masivo sigue válido, **pero SEO de nicho (QR factura, sobrecontratación potencia, comparador CNMC) es defendible y conviene incorporar al roadmap**.

---

### Problema 4 — El usuario "guarda para luego" en la decisión y nunca vuelve

**Descripción:** Incluso cuando el usuario ha completado la comparativa y ha visto evidencia clara de ahorro, **la salida más común es "lo dejo para luego"**. La inercia gana contra la evidencia. Y "luego" rara vez llega.

**Evidencia:**
- Fase 5 del [customer journey](04-user-research/customer-journeys.md) identifica "guardar para luego" como **agujero negro del recorrido**.
- Coherente con sesgo del statu quo documentado en psicología del consumidor (no citado aquí, pendiente de fuente formal en la siguiente fase).
- Datos de mercado: aunque el switching está en **récord histórico (7,25 M cambios en 2024)** [[CNMC Blog 2025-07-30](https://blog.cnmc.es/2025/07/30/record-cambios-comercializador-2024/)], la inmensa mayoría de los hogares que descubren oportunidad de ahorro **no actúan** ese mismo año.

**A quién afecta:** P1 principalmente (más inseguridad), pero también P2 si la fricción de re-evaluación se percibe alta.

**Impacto si se resuelve:** Diferencia entre "el usuario que ha pasado por el flujo" y "el usuario que ha actuado" — multiplica el outcome real.

---

### Problema 5 — Sin vigilancia continua, los usuarios desaparecen tras el primer ciclo

**Descripción:** Aunque el usuario haya cambiado de tarifa con éxito, **el mercado se mueve** y al cabo de 12-24 meses su tarifa puede no seguir siendo competitiva. **Sin un mecanismo de vigilancia externa, vuelve a la inercia** y pierde el progreso conseguido.

**Evidencia:**
- Tasa de cambio anual del 13,7% [[CNMC Household Panel 2025-05](https://www.cnmc.es/sites/default/files/5881290.pdf)] → la mayoría de hogares solo cambia una vez cada varios años.
- **La comercializadora actual tiene incentivo opuesto** — nunca avisará si pierde competitividad respecto al mercado.
- Cita literal P2: *"sé que pago de más pero no tengo tiempo para investigarlo cada año"* — el usuario es consciente del problema pero no tiene mecanismo para resolverlo solo.
- **Investigación técnica Datadis** muestra que sí hay vía técnica para vigilancia continua sin reescaneo, pero **a coste alto** (entidad jurídica + backend + DPO) [[informe técnico](../investigaciones-tecnicas/seguimiento-continuo-datos-2026-05-21.md)].

**A quién afecta:** P2 principalmente — pero también P1 una vez ha completado su primer ciclo.

**Impacto si se resuelve:** Cierra el outcome principal de la visión (set-and-forget). Sin esto, AhorraCasa pierde retención a largo plazo.

---

## Oportunidades consolidadas

> Las 32 oportunidades brutas (10 de personas + 13 de journey + 9 del JTBD) consolidadas en **10 oportunidades agregadas** eliminando duplicados.

> **Criterios de priorización aplicados:**
> - **Impacto** en el usuario: cuánto mejora su situación.
> - **Evidencia**: cuánto sabemos que es real (alta = datos + entrevistas; media = inferencia; baja = solo hipótesis).
> - **Esfuerzo**: tiempo y recursos para resolverlo dado el stack actual.
> - **Alineamiento con la visión**: cuánto acerca al outcome desired.
> - **Defensibilidad / ventaja competitiva**: ¿esto nos diferencia estructuralmente?
>
> **Leyenda Score:**
> - 🟢 Alta prioridad — alto impacto, evidencia sólida, esfuerzo razonable
> - 🟡 Considerar — impacto medio o esfuerzo alto o evidencia parcial
> - 🔴 Baja prioridad — bajo impacto o esfuerzo muy alto o muy especulativa

| # | Oportunidad | Problema(s) que ataca | Jobs servidos | Evidencia | Impacto | Esfuerzo | Score |
|---|---|---|---|---|---|---|---|
| **O1** | **Diagnóstico claro en <2 min vía QR oficial** con veredicto en lenguaje plano y trazabilidad visible del dato CNMC. Combina **rápido + fiable + gratuito** que ninguna alternativa actual ofrece junto. | P1, P2 | F1 (raíz), F3, E1 | Alta — H1 a H4 validadas + hueco verificado en [resumen-competitivo](03-estudio-competencia/resumen-competitivo.md) | **Crítico** | Bajo (V1 ya existe) | 🟢 |
| **O2** | **Mensaje de neutralidad visible y verificable en home**: "no cobramos a comercializadoras + código auditable + fundador con cara + dato desde CNMC". Convierte el moat estructural en activo de marca. | P2 | E1, E4 (moat estructural) | Alta — cita literal P2 ("¿es de fiar?") + H1/H2 validadas | Alto | Bajo | 🟢 |
| **O3** | **Forzar elección activa post-veredicto**: en lugar de "cambiar / luego", botones "Cambiar ahora (te guío)" / "Activar alarma (te aviso cuando aparezca mejor)". Cierra el agujero negro de fase 5. | P4 | F1, F2 | Alta — sesgo statu quo conocido; pattern UX validado | **Alto** | Bajo | 🟢 |
| **O4** | **V2 — Alarmas inteligentes con disciplina anti-spam**: monitoreo del perfil del usuario + notificación solo cuando aparece oferta >50 €/año, latencia <7 días, máximo 1-2 emails/año si no hay movimiento. Email opcional. | P5 | F2, E2, E3 | Alta — cita literal P2 + outcome principal de visión | **Crítico** | Alto (arquitectónico, V2) | 🟡 |
| **O5** | **Canal de adquisición mixto refinado**: (a) **Boca a boca activado** + alianzas OCU/FACUA/Rankia + prensa estacional + (b) **Cluster SEO temático** alrededor de "QR + potencia + diagnóstico personal" (top 10 keywords con tráfico potencial agregado de **170-470K visitas/año top-3** según [informe detallado de keywords](../investigaciones-tecnicas/keywords-detalle-2026-05-22.md)). Concentrar esfuerzos en picos estacionales. | P3 | S1, S2 (palanca) | **Refinada tras informe keywords detallado 2026-05-22**: cluster SEO defensible identificado con volúmenes estimados | **Crítico** | Medio (V1 editorial) + Alto (V2 escala) | 🟢 |
| **O6** | **Reframe positivo "ya tienes la óptima" + nudge anti-abandono**: convertir falta de oportunidad de ahorro en validación ("Has acertado, te seguimos vigilando"). Refuerza E4 y elimina decepción que llevaría a no recomendar AhorraCasa. | P4 | E2, E4 | Media — coherente con entrevistas, falta validar con métricas | Medio | Bajo | 🟢 |
| **O7** | **Tutorial visual contextual del QR + información tranquilizadora del cambio**: cuál de los dos QRs de la factura, qué pasa al cambiar (no corta luz, 7-21 días, gestiona la nueva), derecho de desistimiento 14 días. Reduce ansiedad y abandonos. | P4 | F3, E1, E2 | Alta — XatakaHome documenta confusión QR + pain points compartidos en journey | Medio-alto | Bajo | 🟢 |
| **O8** | **V3 — Gestor continuo vía Datadis** (decisión estratégica a tomar en política guía): seguimiento sin reescaneo, análisis de consumos, alertas predictivas, ajuste de potencia. **Habilita el set-and-forget completo** pero exige entidad jurídica + backend + DPO. | P5 | F2, F3, E2, E3 | Alta para el problema, mixta para la solución — [informe técnico Datadis](../investigaciones-tecnicas/seguimiento-continuo-datos-2026-05-21.md) | **Alto pero condicionado** | **Muy alto** | 🟡 |
| **O9** | **Detección y aviso de sobrecontratación de potencia**: usar `pmaxP1`-`pmaxP6` del QR para identificar si el usuario paga por más kW de los que consume. Ahorro fácil sin cambiar de compañía. **Reforzada tras informe demanda digital**: long tail SEO defendible (queries "bajar potencia contratada" / "sobrecontratación potencia" tienen tráfico real y están menos saturadas que "comparador luz"). Doble palanca: producto + adquisición. | P1, P3 | F1, F3, E4 | **Muy alta — refuerzo doble**: 63% de hogares paga por potencia que no necesita [[Factura Ahorro](https://facturahorro.com/como-bajar-potencia-contratada-espana-2026/)] + ~1.000 M€/año agregado [[Infobae 2026](https://www.infobae.com/espana/2026/01/08/la-factura-de-la-luz-sube-un-155-en-2025-y-alcanza-los-976-euros-anuales-de-media-segun-facua/)] + nicho SEO viable | **Crítico** | Medio (lógica adicional V1) | 🟢 |
| **O10** | **Tarjeta compartible post-veredicto sin datos personales** ("He ahorrado X €/año con AhorraCasa"). Habilita los jobs sociales y conecta con la reflexión del fundador sobre Strava. Activa boca a boca y O5. | P3 | S1, S2 | Media — hipótesis fuerte a validar (dominio íntimo) | Medio | Bajo | 🟡 |

### Resumen de prioridades

| Score | Cantidad | Oportunidades |
|---|---|---|
| 🟢 Alta prioridad — al OST inicial | **7** | O1, O2, O3, O5, O6, O7, O9 |
| 🟡 Considerar — política guía decide | **3** | O4 (V2), O8 (V3 Datadis), O10 (social) |
| 🔴 Baja prioridad | 0 | — |

> **Cambio 2026-05-22:** O5 subió de 🟡 a 🟢 tras el informe detallado de keywords. La identificación del cluster SEO temático con tráfico potencial agregado de 170-470K visitas/año hace que la inversión editorial en V1 sea **realizable con tiempo de fundador + IA** (no requiere presupuesto significativo). Es palanca de adquisición concreta y accionable, no solo "estrategia general".

---

## Top oportunidades para el OST (recomendación de entrada)

> Las que probablemente serán raíces del Opportunity Solution Tree en la siguiente fase. La decisión final la toma la política guía.

1. **O1 — Diagnóstico claro en <2 min vía QR + neutralidad** → núcleo de la propuesta de valor. Sin esto, nada funciona.
2. **O3 — Forzar elección activa post-veredicto** → ataca el agujero negro más severo del journey con esfuerzo bajo.
3. **O9 — Detección de sobrecontratación de potencia** → impacto muy alto, evidencia abrumadora (~1.000 M€/año), esfuerzo razonable. Es funcionalidad adicional dentro del módulo luz, no nueva vertical.
4. **O5 — Canal NO-SEO de adquisición** → sin esto, el producto no llega a usuarios. Debe arrancar en paralelo a las funcionalidades.
5. **O4 — V2 con alarmas** → cierra el outcome principal a 12 meses (hito de la visión).

**Las opciones O2, O6, O7 son "table stakes" complementarias** que acompañan a las raíces — más que oportunidades aisladas, son cómo se ejecutan O1 y O3 con calidad.

**O8 (V3 Datadis) y O10 (social tipo Strava) son apuestas de fase posterior** que la política guía decidirá si entran al horizonte 12 meses o se aplazan.

---

## Oportunidades descartadas (y por qué)

> Documentar lo que se descartó evita reabrir debates. Útil para futuras revisiones.

| Oportunidad considerada | Razón del descarte | ¿Cuándo se aborda? |
|---|---|---|
| **Servir al perfil +55 no digital en V1** | Decisión consciente de la visión (tradeoff #1). El flujo "QR + decisión autónoma + cambio online" no sirve a este perfil — exigiría asistencia humana / flujo simplificado que rompe el stack 100% frontend. | Fase posterior con producto adaptado tras V1 |
| **Ejecutar el cambio de comercializadora por el usuario** | Decisión consciente de la visión (tradeoff #2). **Y validación adicional emergente del JTBD** (E4): ejecutar destruye el job emocional "sentirme responsable y optimizador" — Selectra/Roams lo demuestran. | Nunca en este formato — sería otro producto |
| **Aceptar comisión por lead de comercializadoras** | Decisión consciente de la visión (tradeoff #6). Es el moat estructural — sin neutralidad económica, no hay diferenciación creíble. | Nunca |
| **Cubrir suministros >15 kW** (comercio mediano + grandes consumidores) | Limitación de la API CNMC pública. Acota el mercado direccionable pero es inherente a la fuente de datos institucional neutral. | Solo si aparece fuente de datos alternativa |
| **Competir frontalmente en SEO con Selectra** | Selectra factura ~53 M€/año en España con SEO dominante [[Vizologi](https://vizologi.com/business-strategy-canvas/selectra-business-model-canvas/)]. Sin presupuesto comparable, frente perdido. Se sustituye por canal NO-SEO (O5). | Solo si AhorraCasa traciona masivamente y consigue financiación |
| **Custodiar contraseñas Datadis del usuario** (modelo Hello Watt) | Anti-patrón de seguridad + problemático bajo RGPD según informe técnico. Si vamos a Datadis, será vía autorización de terceros con NIF empresarial. | Si y solo si la política aprueba V3 |
| **Acceso vía SIPS de CNMC** | AhorraCasa **no califica** (acceso restringido a comercializadoras autorizadas) [[informe técnico](../investigaciones-tecnicas/seguimiento-continuo-datos-2026-05-21.md)]. | Solo si la regulación cambia (RD 88/2026 orden ministerial pendiente) |

---

## Hipótesis consolidadas pendientes de validar

> Consolidación de todas las hipótesis emergentes del diagnóstico. Cada una marca una asunción que debe pasar prueba experimental antes de comprometer recursos significativos.

### Hipótesis sobre el mercado y la competencia (validadas en diagnóstico — referenciar como hechos)

- **H1 ✅ Comparadores comerciales cobran comisión a las comercializadoras** — confirmada en 8/8 analizados.
- **H2 ✅ Sesgo en recomendaciones por incentivo económico** — confirmada parcialmente.
- **H3 ✅ CNMC tiene UX desigual** — confirmada con fuentes.
- **H4 ✅ Ningún comparador comercial usa el QR oficial BOE como entrada** — confirmada.

### Hipótesis emergentes a validar con experimentos reales en V1+

| ID | Hipótesis | Cómo validarla | Coste experimento |
|---|---|---|---|
| **H5 (refutada parcialmente 2026-05-22)** | El usuario español **sí busca activamente** cuando hay trigger de precio, pero el motor dominante es telemarketing/SEO de Selectra. AhorraCasa compite por la fracción del usuario activado que busca neutralidad. | Validar con telemetría: % usuarios que llegan por canal "compartido" vs canal "búsqueda directa" vs canal "trigger mediático". Refinado en [informe demanda digital](../investigaciones-tecnicas/demanda-digital-2026-05-22.md) | Bajo |
| **H6** | El target 28-55 digital prefiere autoservicio en móvil antes que asesor humano | Telemetría: % sesiones móvil vs escritorio, abandono si pide email | Bajo |
| **H7** | El usuario que ya cambió una vez (P2) es más receptivo a herramientas neutrales | Segmentación por comportamiento previo en encuesta opcional al escanear | Bajo |
| **HJ-A** | La fase 2 (trigger) es donde más se pierden usuarios potenciales | Telemetría: medir cuántos llegan con trigger explícito (referido, prensa) vs estado pasivo | Bajo |
| **HJ-B** | La salida "guardar para luego" en fase 5 supera el 50% si no se fuerza decisión activa | A/B test con botón "luego" presente vs ausente | Bajo |
| **HJ-C** | La tasa de escaneo QR exitoso a la primera supera el 80% | Telemetría directa | Bajo |
| **HJ-D** | Los usuarios que vienen por canal "compartido por un amigo" convierten mejor | Cohortes por canal de entrada | Bajo |
| **HJ-E** | V2 con alarmas reduce el churn anual al <30% | Validar al lanzar V2 | Medio (depende de V2) |
| **H-jtbd-A** | El job dominante de usuarios primer-uso es F1; el dominante de recurrentes es F2 | Segmentación analítica al activar V2 | Bajo |
| **H-jtbd-B** | La resolución de E1 (no estafado) es factor de conversión clave en fase 4 | A/B test del mensaje de neutralidad en home | Bajo |
| **H-jtbd-C** | Existe apetito social real para compartir ahorros del hogar (job S1) | Experimento: tarjeta compartible post-veredicto + medir tasa de share | Bajo |
| **H-jtbd-D** | El usuario autorizaría Datadis a cambio del job F2 resuelto de verdad | Encuesta validatoria + landing de "early access V3" | Bajo-medio |
| **H-personas-A** | El interés latente se activa en 1ª exposición — >40% completan flujo si reciben enlace por boca a boca | Cohortes según canal de entrada | Bajo |
| **H-personas-B** | P2 convierte mejor que P1 en V1 | Segmentación por comportamiento previo + telemetría | Bajo |
| **H-personas-C** | La composición del hogar realmente no diferencia comportamiento | Segmentación analítica cuando haya volumen | Bajo |

---

## Implicaciones para las fases siguientes

### Para el modelo económico (`/init-producto modelo`)

- **Decisión a tomar:** ¿se incorpora la opción V3 (Datadis) en el horizonte 12-24 meses? Esto multiplica el coste anual de ~500 €/año a 2.000-5.000 €/año mínimos según [informe técnico](../investigaciones-tecnicas/seguimiento-continuo-datos-2026-05-21.md).
- **Coherencia:** el modelo de donaciones (5.000 €/año a 12 meses según visión) cubre el escenario V1+V2 lean. Para V3 hace falta o más donantes, o subvenciones públicas, o cambio estructural del modelo (constituir asociación, etc.).
- **Validación:** Selectra factura ~53 M€/año en España con SEO dominante — hay valor en el segmento. AhorraCasa puede capturar el 0,1% (~50 K€/año) en donaciones si la propuesta neutral resuena. Ambicioso pero direccionalmente coherente con los hitos de visión.

### Para la política guía (`/init-producto politica`)

Tres decisiones críticas que la política debe resolver:

1. **¿Lean V1+V2 o salto a V3 con Datadis?** Determina el alcance del outcome a 12 meses y el modelo económico necesario.
2. **¿Qué oportunidades del top 10 priorizar?** Recomendación de diagnóstico: O1 + O3 + O9 + O5 + O4 (5 oportunidades core para V1+V2).
3. **¿Cómo abordar la sobrecontratación de potencia (O9)?** Es la oportunidad con mejor ratio impacto/evidencia/esfuerzo identificada. Puede ser el "wow factor" del producto V1 más allá del comparador clásico.

### Para el OST (`/init-producto oportunidades`)

- **Outcome raíz** ya definido en la visión: "el usuario paga menos por sus servicios básicos del hogar sin tener que volver a preocuparse activamente."
- **Oportunidades raíz candidatas:** las del top 10 que la política guía elija.
- **Soluciones candidatas:** parte ya están en el [parking de ideas](../parking-de-ideas.md) — se reevalúan en este momento.
- **Assumption tests:** se construyen sobre las hipótesis H5-H7, HJ-A...E, H-jtbd-A...D y H-personas-A...C arriba.

---

## Estado del diagnóstico

✅ **Diagnóstico completo** (2026-05-22). Todas las sub-fases cerradas:

| Sub-fase | Documento | Estado |
|---|---|---|
| 3.1 — Mercado | [01-estudio-mercado.md](01-estudio-mercado.md) | ✅ |
| 3.2 — Contexto producto | [02-contexto-producto.md](02-contexto-producto.md) | ✅ |
| 3.3 — Competencia | [03-estudio-competencia/](03-estudio-competencia/) | ✅ (6 deep dives + análisis ligero + resumen) |
| 3.4a — Personas | [04-user-research/personas.md](04-user-research/personas.md) | ✅ (2 perfiles) |
| 3.4b — Customer journey | [04-user-research/customer-journeys.md](04-user-research/customer-journeys.md) | ✅ (8 fases del usuario) |
| 3.4c — JTBD | [04-user-research/jtbd.md](04-user-research/jtbd.md) | ✅ (9 jobs priorizados) |
| 3.5 — Síntesis | [05-problemas-oportunidades.md](05-problemas-oportunidades.md) | ✅ (este documento) |

**Investigaciones técnicas complementarias:**

- [seguimiento-continuo-datos-2026-05-21.md](../investigaciones-tecnicas/seguimiento-continuo-datos-2026-05-21.md) ✅

**Siguiente paso recomendado:** `/init-producto modelo` para definir el modelo económico, que condiciona la política guía.

# Customer Journey

## ¿Para qué sirve este documento?

Mapear el **recorrido real del usuario** intentando lograr el objetivo *"encontrar la mejor tarifa para mi hogar y cambiarme a ella si conviene"*, **independientemente de si usa AhorraCasa o no**.

El journey describe lo que el usuario hace HOY con las alternativas disponibles (Selectra, CNMC, OCU, llamar a su compañía, preguntar a un conocido, no hacer nada), dónde están los pain points reales, y al final indica **dónde puede entrar AhorraCasa para aliviar dolor en cada fase**.

> **Nota metodológica**: este journey es **del usuario**, no **del producto**. Las pantallas, microcopy y orden de UX de AhorraCasa son un artefacto distinto que se aborda en diseño (no aquí). Aquí mapeamos comportamiento real para identificar oportunidades.

## Origen de la investigación

- **Conversaciones informales** del fundador con usuarios potenciales (mayo 2026) — ver origen y limitaciones en [personas.md](personas.md).
- **Datos del estudio de mercado y competencia** — ver [01-estudio-mercado.md](../01-estudio-mercado.md) y [resumen-competitivo](../03-estudio-competencia/resumen-competitivo.md).
- **Limitación**: hipótesis a validar con experimentos reales en V1 (telemetría + encuestas in-app).

## Estructura del journey

Mapeo un journey unificado de 8 fases. Las dos personas comparten el ~80% del comportamiento; las divergencias específicas se marcan con:

- 🟦 = aplica a ambas personas
- 👤 P1 = específico de "la que nunca ha cambiado"
- 👥 P2 = específico de "el que ya cambió alguna vez"

---

# Journey: "Quiero pagar lo justo por mi factura del hogar"

## Resumen del journey

> El usuario español medio pasa **el 86% del tiempo en estado base** (no cuestiona su factura), un evento externo le hace dudar puntualmente, intenta investigar de forma fragmentada con fuentes poco fiables o complicadas, abandona en >50% de los casos por fricción percibida, y vuelve al estado base hasta el siguiente trigger. Solo el 13,7% [[CNMC Household Panel 2025-05](https://www.cnmc.es/sites/default/files/5881290.pdf)] llega a cambiar de comercializadora en un año dado.

---

## Fase 1 — Estado base (inercia con la tarifa actual)

> El comportamiento dominante. Donde está la mayoría del tiempo el usuario español.

### ¿Qué hace?

| | Acciones reales |
|---|---|
| 🟦 | Recibe la factura mensual por email o papel. La paga (domiciliada). La archiva o borra. **No la lee en detalle**. |
| 👤 P1 | Nunca ha cambiado de comercializadora. Asume implícitamente que su tarifa "es la que toca". |
| 👥 P2 | Hizo un cambio hace 1-5 años. Recuerda que "le salió bien" pero no ha vuelto a revisar. Asume que su decisión sigue siendo vigente. |

### Pain points

- **No tiene baseline.** No sabe si paga mucho o poco. Sin punto de comparación externo, su factura le parece "normal".
- **Subestima el coste de la inacción.** La diferencia entre su tarifa actual y la óptima del mercado **podría ser ~100 €/año o más** según el dato medio de ahorros reportado por comparadores (Kelisto declara 140 €/año [[Kelisto](https://www.kelisto.es/energia)], Selectra 530 €/año [[Selectra](https://selectra.es)] — cifras infladas hacia adquisición, pero el ahorro real existe). Sin ver el número, no actúa.
- **No tiene recordatorios externos** que le hagan revisar — el banco no le avisa, la compañía actual no tiene incentivo a recordárselo.

### Emociones

😴 Tranquilidad pasiva. 😐 Indiferencia. Ocasionalmente 😟 leve ansiedad cuando la cifra mensual sube y no sabe por qué.

### Datos de mercado relevantes

- **Solo el 13,7% de los hogares españoles cambió de comercializadora eléctrica en 2024** [[CNMC Household Panel 2025-05](https://www.cnmc.es/sites/default/files/5881290.pdf)] — el 86,3% restante está en esta fase 1 todo el año.
- 7 de cada 10 viviendas pagan de más solo por tener más potencia de la que necesitan = sobrecoste de ~1.000 M€/año agregado [[FACUA / Infobae 2026-01-08](https://www.infobae.com/espana/2026/01/08/la-factura-de-la-luz-sube-un-155-en-2025-y-alcanza-los-976-euros-anuales-de-media-segun-facua/)] — la inacción tiene un precio masivo.

### Dónde puede entrar AhorraCasa

**Aquí AhorraCasa no entra directamente** — el usuario no está buscando nada. Pero AhorraCasa **necesita generar el trigger** que mueve al usuario a la fase 2. Estrategias posibles:

- Notificación periódica vía partner (OCU/FACUA: "Tu factura este mes media: 81,32 € — ¿la tuya cómo va?").
- Aparición en prensa con datos agregados ("AhorraCasa: el 70% de hogares optimizables ahorraría >100 €/año").
- Boca a boca activado (un amigo ya usuario comparte el enlace).

> Esta es **fase de oportunidad de demanda, no de captura de intent** — la diferencia estratégica más importante del análisis.

---

## Fase 2 — Trigger (algo le hace dudar)

> El evento puntual que rompe la inercia. Suele ser externo, raramente interno.

### ¿Qué hace?

| | Acciones reales |
|---|---|
| 🟦 | Recibe un estímulo: titular de subida del precio de la luz, comentario de un familiar, factura que parece más alta que el mes anterior, ve a alguien comentar su ahorro. **Reacciona unos segundos con interés**. |
| 👤 P1 | "Pues sí, llevo años con la misma compañía, igual debería mirar". Pero la sensación se diluye en horas si no hay acción inmediata. |
| 👥 P2 | "Hace años hice el cambio, ¿seguirá siendo bueno?". Más propenso a pasar a la fase 3 porque ya tiene la experiencia. |

### Pain points

- **La ventana de atención es muy corta.** Si el trigger no convierte en acción en minutos, se pierde. La inercia gana de nuevo.
- **El trigger no viene con un próximo paso claro.** Un titular dice "la luz sube" pero no dice "haz X para revisar". El usuario se queda con la ansiedad sin solución.
- **Muchos triggers son emocionales (miedo) sin información actionable**, lo que produce parálisis en lugar de movimiento.

### Emociones

😨 Sorpresa o preocupación (si el trigger es negativo: factura sube, noticia mala). 😯 Curiosidad ligera (si es positivo: amigo cuenta su ahorro). Decae a 😐 si no hay próximo paso fácil.

### Triggers más frecuentes según contexto del proyecto

| Tipo de trigger | Frecuencia | Eficacia para mover a fase 3 |
|---|---|---|
| Factura del mes más alta de lo habitual | Muy alta (mensual potencial para muchos hogares) | Media — el usuario suele atribuir a "ha sido un mes raro" |
| Titular en prensa sobre subidas (FACUA, OCU) | Alta — varias veces al año | Baja-media — sensación pero sin acción |
| Comentario de familia/amigos | Media-alta | **Alta** — la confianza interpersonal supera otros canales |
| Ver oferta de comercializadora competidora en publicidad | Media | Media — desconfianza del anuncio |
| Cambio vital (mudanza, nuevo hogar) | Baja-puntual | **Muy alta** — momento natural de revisar contratos |

### Dónde puede entrar AhorraCasa

**Esta es la fase clave de captación.** AhorraCasa tiene que estar presente en el momento del trigger, idealmente como **respuesta inmediata** ("¿no sabes si pagas de más? mira aquí en 2 minutos"). Estrategias:

- Estar en los artículos de prensa donde aparece el trigger (alianzas con medios como FACUA, OCU, Rankia).
- Boca a boca diseñado: la persona que comparte el enlace **es** el trigger.
- Aparecer en momento factura: integración o vínculo en QR de la factura misma (a futuro, vía CNMC).
- Captación oportunista en momentos vitales (mudanzas — alianzas con plataformas inmobiliarias / portales de mudanza).

---

## Fase 3 — Exploración (busca información)

> El usuario decide investigar. Se enfrenta al ecosistema fragmentado de fuentes.

### ¿Qué hace?

| | Acciones reales |
|---|---|
| 🟦 | Busca en Google ("comparador luz", "tarifa más barata", "cómo cambiar luz"). Llega a Selectra, Kelisto, Roams, Rastreator en las primeras posiciones [[análisis SEO sector](https://selectra.es/energia/companias/comparativa/tarifa-luz)]. Pregunta a un familiar/amigo. |
| 👤 P1 | Más perdido. Acaba en blogs (Rankia, Kowiik) leyendo "guías" largas. Confusión por jerga técnica (PVPC, mercado libre, potencias por franja). |
| 👥 P2 | Va más directo. Filtra Google por "comparador independiente" o "ocu" — busca activamente neutralidad. Más propenso a llegar al CNMC pero su UX le frustra [[Bandaancha foro](https://bandaancha.eu/foros/comparador-cnmc-1759943)]. |

### Pain points

- **Sobrecarga de información contradictoria.** Cada comparador da rankings distintos (Selectra dice X, Kelisto dice Y, OCU dice Z).
- **Los comparadores comerciales tienen incentivo a sesgar resultados** — confirmado en H1/H2 del [resumen competitivo](../03-estudio-competencia/resumen-competitivo.md) (Kelisto declara abiertamente comisión por lead [[Kelisto FAQ](https://www.kelisto.es/)]).
- **Las fuentes neutrales son las menos accesibles**: CNMC tiene UX desigual y problemas técnicos [[Bandaancha foro](https://bandaancha.eu/foros/comparador-cnmc-1759943)] [[Carlos Codina](https://www.youtube.com/watch?v=rHUTAM3Xg-E)], OCU cobra suscripción de hasta 23,90 €/mes [[OCU](https://www.ocu.org/info/precios-suscripcion)].
- **Lenguaje técnico desincentiva**: facturas con peajes 2.0TD, potencia por periodo, mercado regulado vs libre — la persona media no maneja estos términos [[FACUA](https://facua.org/noticias/el-recibo-electrico-del-usuario-medio-sufrio-una-subida-del-16-por-ciento-en-2025-segun-el-analisis-de-facua/)].
- **Falta una fuente "rápida y fiable a la vez"** — actualmente el usuario elige entre rápido y sesgado (Selectra) o lento y fiable (CNMC/OCU).

### Emociones

😕 Confusión. 😩 Saturación. 🤨 Suspicacia hacia los comparadores comerciales (más fuerte en P2). 😤 Frustración si abandona aquí sin haber avanzado.

### Datos de mercado relevantes

- **Selectra factura ~53 M€/año en España con su modelo de comisión** [[Vizologi](https://vizologi.com/business-strategy-canvas/selectra-business-model-canvas/)] — domina el SEO de la categoría.
- **El comparador CNMC es funcionalmente equivalente** pero con UX peor [[Preahorro](https://preahorro.com/como-ahorrar/comparador-de-ofertas-de-energia-de-la-cnmc-funciona-bien/)].
- **OCU tiene 160+ tarifas de 46 compañías** comparadas [[OCU — Entidades incluidas](https://www.ocu.org/vivienda-y-energia/gas-luz/companias-tarifas)] pero acceso completo exige suscripción.

### Dónde puede entrar AhorraCasa

**La fase de exploración es donde más valor diferencial puede aportar AhorraCasa** — porque combina lo que hoy está fragmentado:

- **Rápido** (como Selectra) → vía QR estándar BOE, 2 min.
- **Fiable y neutral** (como CNMC) → dato directo de la API CNMC, sin sesgo comercial.
- **Gratuito** (como CNMC, a diferencia de OCU).
- **Lenguaje plano** → veredicto en una frase, datos técnicos en "ver detalle".

**Riesgo:** si el usuario no llega a AhorraCasa en esta fase, **el SEO lo va a llevar a Selectra/Kelisto**. La adquisición no puede depender del SEO orgánico — necesita canales propios (boca a boca, alianzas, prensa).

---

## Fase 4 — Evaluación (compara opciones reales)

> El usuario tiene datos enfrente y tiene que decidir si vale la pena.

### ¿Qué hace?

| | Acciones reales |
|---|---|
| 🟦 | Mira el ahorro estimado: "Pasarías de pagar X €/año a Y €/año = ahorras Z €". Calcula mentalmente si ese ahorro compensa el esfuerzo percibido del cambio. Lee opiniones de la comercializadora recomendada (Trustpilot, foros). |
| 👤 P1 | Más propenso a parálisis: hay muchas opciones, no sabe en cuál confiar. Si el comparador le da una sola recomendación clara, avanza; si le da 5 opciones para elegir, se atasca. |
| 👥 P2 | Compara entre comparadores. Verifica la recomendación con CNMC oficial. Si encuentra coherencia, se mueve más rápido; si encuentra incoherencias, retrocede a fase 3. |

### Pain points

- **El ahorro estimado puede ser inexacto o sobreoptimista** — los comparadores comerciales inflan el ahorro potencial. Cuando el usuario contrata y la factura real no baja tanto, **erosiona la confianza de toda la categoría**.
- **Opiniones contradictorias en reviews** sobre la comercializadora recomendada — Trustpilot muestra de todo, los foros también.
- **Sospecha de letra pequeña** — el usuario teme que la oferta "barata" venga con permanencia, servicios adicionales obligatorios, cláusulas ocultas.
- **No hay forma fácil de validar la fuente del dato**: ¿el comparador X cómo sabe que esta es la mejor tarifa? ¿quién le da los datos?

### Emociones

🤔 Cálculo mental. 🧐 Verificación. 😨 Miedo a equivocarse y "salir peor".

### Datos relevantes

- **El ahorro real promedio reportado por hogares que cambiaron** está en el rango 50-200 €/año según Rankia [[Rankia](https://www.rankia.com/blog/luz-y-gas/3036348-comparativa-tarifas-luz-gas-espana)]. Los comparadores comerciales prometen más (Selectra 530 €/año claimed [[Selectra](https://selectra.es)]) — discrepancia que el usuario percibe.
- **Los servicios adicionales obligatorios y permanencias** son fuente de quejas frecuentes en Trustpilot [[Trustpilot Selectra.es](https://es.trustpilot.com/review/selectra.es)].

### Dónde puede entrar AhorraCasa

- **Trazabilidad del dato visible**: "Dato extraído de CNMC.es a las HH:MM de hoy" + enlace al endpoint oficial. Si el usuario quiere validar, puede.
- **Honestidad en la estimación**: mostrar rango ("ahorrarías entre X y Y €/año según tu consumo real") en lugar de cifra única.
- **Marcado claro de tarifas con permanencia o servicios adicionales obligatorios** — incluso si su precio base es mejor.
- **Filtro de neutralidad creíble** porque no cobramos a la comercializadora recomendada — la recomendación no tiene incentivo a inflar.

---

## Fase 5 — Decisión (actúa, aplaza, o se queda)

> El momento crítico. El usuario decide qué hace con lo que ha visto.

### ¿Qué hace?

| | Acciones reales |
|---|---|
| 🟦 | Tres salidas posibles: (a) "voy a cambiar ahora", (b) "lo dejo para luego" (= probablemente nunca), (c) "me quedo donde estoy" (porque ya pagaba poco o porque la fricción percibida supera el ahorro). |
| 👤 P1 | Más propenso a salida (b) o (c) por inseguridad. La opción "luego" es la zona gris donde se pierden la mayoría de usuarios potenciales. |
| 👥 P2 | Más propenso a (a) si decide, o más decidido en (c) si concluye que su tarifa actual es buena. Más rápido en cualquier dirección. |

### Pain points

- **El sesgo del statu quo es brutal aquí**. Aunque el ahorro esté demostrado, el coste percibido del cambio (papeleo, riesgo, tiempo) gana en muchos casos.
- **"Lo dejo para luego" es psicológicamente fácil** — no requiere decir no al cambio, solo posponerlo. Y "luego" raramente llega.
- **Falta un nudge efectivo** para forzar la elección en el momento de máxima información (justo después de la evaluación).
- **Si el usuario decide "me quedo"**, no tiene mecanismo para volver a evaluar dentro de unos meses cuando el mercado se mueva.

### Emociones

🤔 Deliberación. 😬 Aprensión por equivocarse. 😴 Tentación a posponer.

### Dónde puede entrar AhorraCasa

- **Forzar elección activa post-evaluación**: en lugar de "cambiar ahora / luego", presentar "cambiar ahora / **activar alarma** (que la plataforma vigile y te avise cuando aparezca mejor oferta)". Esto convierte el "luego" en compromiso activo.
- **Refuerzo psicológico del statu quo cuando es válido**: si el usuario ya tiene la tarifa óptima, AhorraCasa puede convertir "me quedo" en validación positiva ("Has acertado. Te seguimos vigilando.") en lugar de decepción.
- **Mensajes anti-ansiedad sobre el proceso de cambio**: "El cambio no corta la luz, lo gestiona la nueva compañía, tarda 7-21 días" — disuelve miedos comunes con datos.

---

## Fase 6 — Ejecución del cambio (si aplica)

> Solo para los que decidieron actuar. La fase operativa.

### ¿Qué hace?

| | Acciones reales |
|---|---|
| 🟦 | Va a la web de la comercializadora nueva. Rellena formulario de alta con sus datos + CUPS. Acepta condiciones. Recibe confirmación. Espera 7-21 días al cambio efectivo. La nueva compañía gestiona la baja con la antigua. |
| 👤 P1 | Necesita guía paso a paso, idealmente con pantallazos. Cualquier término que no entienda puede hacerle abandonar. |
| 👥 P2 | Conoce el proceso, va más rápido. Si encuentra fricción inesperada (formulario largo, llamada de verificación obligatoria), abandona y se queda con la antigua. |

### Pain points

- **La fricción del proceso de alta varía mucho entre comercializadoras** — algunas son 100% online en 3 minutos, otras exigen llamada telefónica de verificación, otras documentación adicional.
- **Sensación de "ya no puedo volver atrás"** — el cambio se siente irreversible aunque por ley el usuario tiene derecho a desistir.
- **Posible doble facturación temporal** durante el periodo de transición — confusión y ansiedad.
- **La comercializadora antigua puede intentar retener** con contraofertas de última hora, generando dudas ("¿debería quedarme si me bajan?").
- **Si el QR de la nueva factura no funciona o llega tarde**, el usuario no puede validar que el cambio salió bien.

### Emociones

😰 Aprensión al ejecutar. 🤞 Esperanza durante la espera. 😤 Frustración si hay fricción inesperada. 😌 Alivio cuando la primera factura nueva llega correcta.

### Dónde puede entrar AhorraCasa

- **Guía paso a paso interactiva**: checklist persistente que el usuario marca conforme avanza ("✓ Has rellenado el formulario", "⏳ Esperando confirmación de la nueva", "⏳ Espera 7-21 días al cambio efectivo").
- **Información clara sobre el derecho de desistimiento** (14 días para echarse atrás sin penalización) — reduce sensación de irreversibilidad.
- **Avisos sobre la posible doble facturación temporal** — anticiparse al pain point antes de que ocurra.
- **Política sobre contraofertas de retención**: explicar cómo evaluarlas con la misma neutralidad ("si tu compañía actual te ofrece bajar, podemos compararla con la nueva en 2 minutos").

> **Recordatorio importante:** AhorraCasa **NO ejecuta** el cambio por el usuario (decisión consciente de la visión — tradeoff #2). La asistencia es informativa, no transaccional.

---

## Fase 7 — Adaptación post-cambio (primera factura, validación)

> El momento de verdad: ¿la nueva tarifa era lo que prometía?

### ¿Qué hace?

| | Acciones reales |
|---|---|
| 🟦 | Recibe la primera factura con la nueva comercializadora. La revisa con atención (cosa que no hacía antes del cambio). Calcula si el ahorro real coincide con el estimado. |
| 👤 P1 | Especialmente nervioso/a con la primera factura. Si el ahorro es menor de lo esperado, sensación de "me han engañado, los comparadores son todos iguales". |
| 👥 P2 | Más sereno/a — sabe que la primera factura puede ser irregular (días prorrateados, cargos de regularización). Espera a la segunda para juzgar. |

### Pain points

- **La primera factura suele ser confusa**: incluye prorrateo, cargos de regularización, eventuales saldos pendientes — el ahorro estimado puede no verse claro hasta la 2ª o 3ª factura.
- **Si el ahorro real es menor que el estimado**, el usuario pierde confianza en quien le recomendó el cambio (incluso si fue neutral — la asociación es inevitable).
- **El usuario no tiene mecanismo para comparar fácilmente "antes / después"** — tiene que sacar las facturas antiguas y hacer cuentas manualmente.

### Emociones

🤞 Esperanza inicial. 🥳 Satisfacción si el ahorro se materializa. 😡 Decepción si no, con efecto secundario de mayor desconfianza ante futuros comparadores.

### Dónde puede entrar AhorraCasa

- **Recordatorio en el día estimado de la primera factura**: "Hoy debería llegarte la primera factura con tu nueva compañía. Escanéala y te decimos si el ahorro está siendo el esperado." Crea ciclo de validación.
- **Detección de la primera factura "irregular"** (prorrateo, regularización) y explicación clara — evita que el usuario abandone por confusión.
- **Comparativa visual "antes / después"** con datos del QR antiguo y del nuevo — refuerza la sensación de logro.

---

## Fase 8 — Vuelta a inercia o vigilancia continua

> El usuario "vuelve a su vida". Aquí se decide la retención a largo plazo.

### ¿Qué hace?

| | Acciones reales |
|---|---|
| 🟦 | Vuelve a su rutina. Recibe facturas mensuales. Las paga sin revisar (modo Fase 1). **Sin mecanismo externo, no vuelve a evaluar hasta el siguiente trigger** (potencialmente años después). |
| 👤 P1 | Posiblemente más alerta tras la primera buena experiencia — pero la inercia vuelve si pasan 12+ meses sin recordatorios. |
| 👥 P2 | Si tuvo buena experiencia, **más receptivo a alarmas o avisos de la plataforma** — ha bajado su umbral de fricción para cambios futuros. |

### Pain points

- **El mercado se mueve constantemente** — la tarifa óptima de hoy puede no serlo en 6-12 meses. Sin vigilancia, el usuario vuelve a la situación inicial: pagando de más sin saberlo.
- **La nueva comercializadora no avisará si pierde competitividad** — tiene el incentivo opuesto.
- **El usuario olvida cuál era exactamente su tarifa contratada** — al cabo de unos meses, la información se difumina.

### Emociones

😌 Tranquilidad inicial. 😴 Olvido progresivo. 😨 Posible alarma si llega una factura sorpresa más alta meses después.

### Datos relevantes

- **La tasa de cambio anual es 13,7%** [[CNMC Household Panel 2025-05](https://www.cnmc.es/sites/default/files/5881290.pdf)] → la mayoría de usuarios solo cambia una vez cada varios años, dejando ahorros sobre la mesa entre cambios.

### Dónde puede entrar AhorraCasa

**Esta es la fase donde V2 (alarmas con email opcional) aporta el máximo valor diferencial.** Es donde se cierra el outcome principal de la visión (set-and-forget):

- **Alarmas inteligentes**: la plataforma vigila el perfil del usuario y notifica solo cuando aparece una oferta con ahorro >50 €/año (umbral que justifica la fricción de un nuevo cambio).
- **Latencia controlada**: <7 días desde que aparece la oferta hasta el aviso.
- **Disciplina**: máximo 1-2 emails al año si no hay movimiento real — para no caer en spam que erosione la marca neutral.
- **Reescaneo periódico opcional**: invitación cada 6 meses a actualizar la factura (porque consumos varían y la recomendación puede ser mejor con datos más frescos).

**Sin V2, AhorraCasa pierde a sus usuarios después del primer ciclo.** Es por esto que la visión define V2 (alarmas) como hito a 12 meses.

---

## Momentos críticos del journey (donde más sufre el usuario)

> Identificación de las fases con dolor más severo. Cada momento crítico es una oportunidad raíz para el OST.

1. **Fase 2 — Trigger sin próximo paso.** La ventana de atención es muy corta y el ecosistema actual rara vez ofrece un próximo paso fácil tras el trigger. **El usuario se queda con la ansiedad pero sin solución**, vuelve a inercia. *Es la fase donde más usuarios se pierden silenciosamente.*

2. **Fase 3 — Exploración fragmentada con fuentes sesgadas.** El usuario tiene que elegir entre "rápido y sesgado" (comparadores comerciales) o "lento y fiable" (CNMC/OCU). Falta el "rápido y fiable a la vez". *Es la fase de mayor confusión cognitiva.*

3. **Fase 5 — "Lo dejo para luego" como agujero negro.** Sin nudge efectivo, una mayoría se pierde aquí incluso cuando ha visto evidencia clara del ahorro. *Es la fase donde la inercia gana contra la evidencia.*

4. **Fase 8 — Vuelta a inercia sin mecanismo de vigilancia.** Sin alarmas externas, el usuario pierde el progreso conseguido al cabo de 12-24 meses cuando el mercado se mueve. *Es la fase donde se pierde el outcome a largo plazo.*

---

## Insights cruzados (patrones que se repiten)

1. **La inercia es el competidor más fuerte en todas las fases.** No solo en estado base — también en exploración (abandona si es complicado), en decisión (pospone), y en post-cambio (olvida vigilar). **AhorraCasa compite contra la inercia más que contra Selectra.**

2. **El usuario percibe peor lo que tiene que hacer él que lo que pueden hacer por él.** Implicación: cuanto menos esfuerzo perciba (no necesariamente menos esfuerzo real), más probable que actúe. El QR es palanca clave aquí.

3. **La trazabilidad y la neutralidad son atributos críticos en las fases 3, 4 y 5.** El usuario duda más cuanto más se acerca a actuar. Mostrar fuente del dato y modelo de negocio reduce la fricción justo cuando más importa.

4. **El ciclo del journey es largo (años entre cambios) pero la decisión es corta (minutos en una sesión).** AhorraCasa tiene que estar disponible exactamente en el momento de la sesión — sin recordatorios entre tanto, se pierde la retención. V2 con alarmas es la respuesta a este patrón.

5. **Las dos personas (P1 nunca cambió / P2 ya cambió) se diferencian más en velocidad que en proceso.** Las mismas 8 fases aplican a ambas — solo cambian las emociones, el tiempo de cada fase, y los puntos exactos de fricción. **Esto justifica el journey unificado** y simplifica el diseño del producto.

---

## Oportunidades por fase (consolidación accionable)

| Fase | Pain point principal | Oportunidad | Evidencia | Impacto | Esfuerzo | Score |
|---|---|---|---|---|---|---|
| 1 — Estado base | Sin baseline, no percibe sobrecoste | OJ-1: Cuantificar el sobrecoste de inercia visible en canales externos ("hogar medio paga X € de más al año") con datos agregados | FACUA + sobrecoste 1.000 M€/año [[Infobae 2026](https://www.infobae.com/espana/2026/01/08/la-factura-de-la-luz-sube-un-155-en-2025-y-alcanza-los-976-euros-anuales-de-media-segun-facua/)] | Alto | Alto (largo plazo) | 🟡 |
| 2 — Trigger | Trigger sin próximo paso accionable | OJ-2: **Presencia en momento de trigger** vía alianzas (FACUA, OCU, prensa, plataformas de mudanza). Boca a boca activado post-veredicto. | Hallazgo central de personas — interés latente, no manifiesto | **Alto** | Alto (canales) | 🟡 |
| 3 — Exploración | Fragmentación + sesgo de fuentes existentes | OJ-3: Combinar rápido + fiable + gratuito en un solo flujo, con QR como entrada y CNMC como fuente neutral | H1-H4 validadas + hueco confirmado en [resumen competitivo](../03-estudio-competencia/resumen-competitivo.md) | **Alto** | Medio (ya existe V1) | 🟢 |
| 4 — Evaluación | Falta verificabilidad de la recomendación | OJ-4: **Trazabilidad visible del dato** ("desde CNMC.es a las HH:MM" + enlace) + rango realista de ahorro | H1 validada — sospecha estructural justificada | Alto | Bajo | 🟢 |
| 5 — Decisión | "Lo dejo para luego" como agujero negro | OJ-5: **Forzar elección activa** post-evaluación (cambiar ahora vs activar alarma) + reframe positivo para "ya estás óptimo" | Sesgo del statu quo conocido; patrón de UX | **Alto** | Bajo | 🟢 |
| 6 — Ejecución | Fricción operativa variable y miedos comunes | OJ-6: **Guía paso a paso interactiva** con checklist persistente + información tranquilizadora (no corta luz, 7-21 días, derecho desistimiento) | Pain point compartido P1+P2 | Medio-alto | Medio | 🟡 |
| 7 — Adaptación | Primera factura confusa, ahorro no verificable | OJ-7: **Recordatorio + revalidación** al recibir primera factura nueva (escanear → comparar antes/después) | Conocimiento del sector (prorrateo, regularización) | Medio | Medio | 🟡 |
| 8 — Vigilancia | Sin mecanismo de re-evaluación, se vuelve a inercia | OJ-8: **V2 con alarmas inteligentes** (>50 €/año, latencia <7 días, disciplina anti-spam) | Outcome principal de la visión + cita literal P2 | **Crítico** | Alto (arquitectónico) | 🟡 |

---

## Mapeo AhorraCasa sobre el journey

> Resumen final: en qué fases AhorraCasa aporta valor diferencial y en cuáles no entra.

| Fase | AhorraCasa entra? | Cómo |
|---|---|---|
| **1 — Estado base** | Indirectamente | Generando contenido / presencia que active triggers en partners y prensa |
| **2 — Trigger** | **Sí — canal crítico** | Boca a boca activado, alianzas (OCU/FACUA/prensa), presencia en momentos vitales |
| **3 — Exploración** | **Sí — propuesta de valor central** | QR rápido + dato CNMC fiable + gratuito + lenguaje plano |
| **4 — Evaluación** | **Sí — diferenciador fuerte** | Trazabilidad del dato + rango realista + ausencia de sesgo estructural |
| **5 — Decisión** | **Sí — momento decisivo** | Forzar elección activa + reframe positivo + información tranquilizadora |
| **6 — Ejecución** | Sí, pero limitado | Asistencia informativa (no ejecuta) — guía + checklist + tranquilizar |
| **7 — Adaptación** | Sí, vía recordatorio | Revalidación al recibir primera factura nueva |
| **8 — Vigilancia** | **Sí — V2 cierra el outcome** | Alarmas inteligentes con disciplina anti-spam |

**Fases donde AhorraCasa NO entra (y por qué):**

- **Ejecución del alta y la baja** — no actuamos como gestor, no firmamos por el usuario, no representamos legalmente. Decisión consciente de la visión (tradeoff #2: notificar + asistir, no ejecutar).
- **Comparativa de comercializadoras fuera del mercado libre** — solo cubrimos PVPC parcialmente y mercado libre. Suministros >15 kW quedan fuera por límite de la API CNMC.

---

## Hipótesis a validar con experimentos reales (V1)

- **HJ-A**: La fase 2 (trigger) es realmente donde más se pierden usuarios potenciales. **Validar** midiendo cuántos visitantes llegan con trigger explícito (vía referidos, vía búsqueda de noticia, etc.) vs cuántos llegan en estado pasivo.
- **HJ-B**: La salida "guardar para luego" en fase 5 supera el 50% si no se fuerza decisión activa. **Validar** con A/B test cuando V1 tenga telemetría (con botón "luego" presente vs ausente).
- **HJ-C**: El boca a boca (usuarios compartiendo el enlace tras veredicto) es el canal con mejor conversión a fase 3. **Validar** con cohortes según canal de entrada.
- **HJ-D**: V2 con alarmas reduce el churn anual al < 30%. Crítico para la viabilidad de la propuesta set-and-forget. **Validar** al lanzar V2.
- **HJ-E**: La diferencia de comportamiento entre P1 y P2 se reduce a velocidad y emociones, no a procesos — el journey unificado es válido. **Validar** con segmentación de usuarios por comportamiento previo (encuesta opcional al escanear).

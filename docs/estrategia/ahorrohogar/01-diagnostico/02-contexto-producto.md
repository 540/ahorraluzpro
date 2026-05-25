# Contexto del producto y la empresa

**Fecha del análisis:** 2026-05-19
**Naturaleza del proyecto:** side-project personal del fundador, no iniciativa empresarial de 540.

---

## La empresa

**Nombre y descripción corta:**

AhorraCasa es un proyecto personal de **Iker Mariñelarena** ([Iker@540deg.com](mailto:Iker@540deg.com)), PM independiente vinculado profesionalmente a **540 (540deg)**, consultora de producto. AhorraCasa se desarrolla **como iniciativa personal externa** al trabajo principal de 540 — no es un proyecto de la consultora ni se desarrolla con cliente.

**Modelo de negocio:**

Producto **B2C gratuito, neutral, sin afiliación comercial**. La sostenibilidad económica se proyecta vía **donaciones de usuarios** (objetivo 12m: 5.000 € en 1.000 micro-donaciones), explícitamente **NO** vía comisiones de comercializadoras. Decisión documentada como tradeoff #6 en la visión.

**Tamaño:**

Una persona (Iker) trabajando en **tiempo parcial discrecional**. Sin empleados dedicados, sin presupuesto operativo más allá de los costes técnicos (dominios ~25 €/año, OEPM ~207 € puntual, hosting GitHub Pages gratuito). Sin oficina dedicada al proyecto.

**Posicionamiento actual en el mercado:**

**New entrant** sin tracción pública visible. La marca AhorraLuz V1 está en producción técnica pero no tiene presencia comercial ni reconocimiento. **Posicionamiento aspiracional**: "la alternativa neutral a los comparadores comerciales" — pendiente de construir y demostrar.

---

## Producto actual

**Qué hace hoy (AhorraLuz V1, módulo técnico de electricidad):**

- Escanea el QR oficial de factura de luz (BOE-A-2021-11035) desde la cámara del navegador.
- Parsea los ~40 parámetros que el QR codifica (consumos por franja, potencias, tarifa, CUPS, importe).
- Llama a la **API pública de la CNMC** (reverse engineering del comparador oficial) para obtener ofertas del mercado libre.
- Presenta al usuario su tarifa actual, la mejor oferta detectada y 2 alternativas, con ahorro anual estimado.
- 100% frontend (vanilla JS + html5-qrcode), hosting en GitHub Pages, **sin backend, sin base de datos, sin registro de usuarios**.

Detalle técnico completo en [CLAUDE.md raíz del repo](../../../CLAUDE.md).

**Volumen y tracción:**

**Tracción real desconocida — pendiente de medir.** No hay telemetría instalada y el producto no ha tenido lanzamiento público. Apuntado como acción al cierre de la visión: *"medir baseline actual de AhorraLuz V1 (consultas, usuarios) esta semana"*.

**Fortalezas reconocidas:**

- **Habilitador legal único:** la mecánica completa del producto se apoya en datos públicos del regulador (CNMC + BOE 2021).
- **Stack ligero y barato:** GitHub Pages + vanilla JS = coste operativo cercano a cero.
- **Flujo de usuario excepcionalmente corto:** escaneo de QR → resultado en segundos. Sin formularios.
- **Codificación de toda la lógica del QR ya hecha** — parseo de los 40 parámetros del BOE-A-2021-11035 funcional.

**Debilidades reconocidas:**

- **Sin telemetría → ceguera operativa.** No sabemos qué % de usuarios completa el flujo, cuántos QRs fallan al parsear, cuánto ahorro reportamos vs. cuánto se materializa.
- **Sin sistema de persistencia → V2 (alarmas con email) exige cambio arquitectónico no trivial.** El salto V1→V2 contemplado en la visión rompe la pureza del stack 100% frontend (requiere al menos almacenamiento de emails + cron de monitoreo).
- **Scraping complementario sin política de uso ético escrita** — riesgo de bloqueo o conflicto legal si una comercializadora reacciona.
- **Marca AhorraLuz inviable a futuro** (decisión tomada en la visión → migración a AhorraCasa pendiente de ejecutar).
- **Cero marketing, cero notoriedad, cero feedback de usuarios reales** hasta la fecha.

**Deuda técnica/producto:**

- **Marca interna del repo todavía es `ahorraluz-pro`** — la migración a AhorraCasa requerirá renombrado de repo, dominios, despliegues, comunicación.
- **Acoplamiento a la API CNMC sin contrato formalizado** — punto único de fallo crítico (ya en restricciones de la visión y planificado como acción de roadmap).
- **Lógica de QR específica de factura de luz** — el patrón funciona para gas (que tiene QR estandarizado equivalente) pero hay que verificar que el parseo es directo o requiere adaptación.

---

## Momento de la empresa

### Triggers internos

El proyecto arranca como iniciativa personal de Iker en mayo 2026 por tres razones combinadas:

1. **Disponibilidad de tiempo.** Iker ha sacado capacidad de su agenda profesional (sin presión de cliente concreto) para dedicarle ratos al producto propio.
2. **Curiosidad metodológica.** Iker quería **probar en primera persona la metodología 540 de definición de producto** sobre un caso real, no teórico. AhorraCasa es tanto un producto como un experimento de aplicación del método.
3. **Asistencia con IA.** El uso intensivo de IA (Claude Code) para acelerar el desarrollo hace viable que **una sola persona en tiempo parcial** construya algo no trivial. Esta palanca **no existía con la misma fuerza hace 2 años**.

### Triggers externos

- Ventana regulatoria abierta desde 2021 (QR obligatorio) **infrautilizada por el mercado** — ningún competidor neutral consolidado.
- Switching récord en 2024 (7,25 M cambios) → el usuario está más receptivo que nunca al cambio.
- Crisis energética 2022-2023 dejó cicatriz: factura energética ya forma parte de las preocupaciones recurrentes del hogar.
- Apertura de datos institucionales (CNMC, MITECO, BdE) a nivel sin precedentes — habilita la visión multi-vertical.

### Urgencia

**Discrecional, no impuesta.** Iker dice literalmente: *"no tengo que hacerlo ya, me apetece hacerlo y creo que se puede traccionar"*. No hay deadline externo, no hay inversores, no hay clientes esperando. El ritmo lo marca la disponibilidad real del fundador.

> **Observación crítica:** esta condición es **simultáneamente la mayor ventaja y la mayor vulnerabilidad** del proyecto. Ventaja: libertad total de decisión, cero presión política. Vulnerabilidad: si surge un proyecto profesional urgente o cambia el interés personal, **AhorraCasa puede quedarse parado indefinidamente** sin que nadie lo reclame. Esta condición refuerza la restricción de tiempo del fundador ya identificada como dominante en la visión.

---

## Stakeholders

| Stakeholder | Rol | Interés | Influencia | Postura |
|---|---|---|---|---|
| **Iker Mariñelarena** | Fundador, PM, único responsable | Muy alto — proyecto personal | Total — decide todo | Comprometido condicionalmente (mientras siga interesado y tenga tiempo) |
| 540 (consultora) | Potencial stakeholder futuro | Bajo a fecha de hoy | Nula a fecha de hoy | Neutral — no involucrada |
| OCU / FACUA / asociaciones de consumidores | Potenciales aliados / amplificadores | Alineación natural con el discurso neutral | Indirecta (validación, distribución) | Sin contacto — posible canal futuro |
| CNMC | Proveedor de la API base + regulador | Indirecto — beneficiados por mayor uso del comparador | Crítica si decide restringir API | Sin relación formalizada — acción pendiente: contactar `info.comparador@cnmc.es` |

**Implicación:** la lista de stakeholders es **extremadamente corta**, lo cual es coherente con la naturaleza side-project. **A medida que el proyecto traccione (criterio a definir), se ampliará deliberadamente** — primero a más gente de 540 si encaja, después a aliados externos (OCU/FACUA, CNMC).

---

## Restricciones organizativas

> Las restricciones materiales (tiempo del fundador, RGPD con V2, donaciones, dependencias CNMC, marca) están detalladas en `00-vision.md`. Aquí solo lo organizativo específico.

**Equipo disponible:**

Una persona (Iker), tiempo parcial discrecional. Sin empleados, sin freelancers contratados. **Multiplicador con IA**: Claude Code y herramientas similares para acelerar desarrollo, pero el cuello de botella sigue siendo Iker en decisiones, marketing, comunicación con usuarios y operación.

**Presupuesto:**

**Sin presupuesto operativo asignado.** Los costes proyectados a 12 meses son bajos:

| Concepto | Coste |
|---|---|
| Dominios `.es` + `.com` AhorraCasa | ~25 €/año |
| Registro marca OEPM (clases 35 + 42) | 207 € puntual |
| Hosting (GitHub Pages) | 0 € |
| Email transaccional para alarmas (V2) | ~10-50 €/año estimado |
| Asesoría legal puntual RGPD + donaciones | 200-500 € puntual |
| **Total año 1 estimado** | **~500 € - 1.000 €** |

Cubierto por el propio Iker como inversión personal. Objetivo donaciones 12m (5.000 €) **supera con margen el coste operativo** — la pregunta de modelo económico no es supervivencia, es **cómo compensar el tiempo del fundador** si el proyecto crece.

**Tiempo:**

**Sin deadlines comprometidos.** Hitos cualitativos y cuantitativos definidos en `00-vision.md` (éxito a 12 meses) son aspiracionales, no compromisos. Esto es saludable para la fase actual pero exige **disciplina personal para no abandonar** en momentos de baja motivación.

**Dependencias internas:**

Ninguna a fecha de hoy. **Posible dependencia futura:** si en algún momento se decide vincular AhorraCasa con 540 (como producto cartera de la consultora, como caso de estudio público, etc.), aparecerán dependencias de marca y comunicación que ahora no existen. Por ahora, fuera del alcance.

**Política interna:**

Cero. **No hay nadie a quien convencer** ni resistencia organizativa que sortear. Iker decide y ejecuta. La única política es la **autodisciplina del fundador** para mantener foco, ritmo y coherencia metodológica.

---

## Posición competitiva actual

AhorraCasa hoy es un **new entrant invisible**: el producto técnico (AhorraLuz V1) existe pero no tiene marca pública, ni tracción medida, ni notoriedad. **No compite todavía** — está en fase pre-mercado.

Los competidores establecidos (Selectra ~53 M€/año en España, Acierto, Rastreator, Kelisto, Roams) **no son conscientes de la existencia de AhorraCasa** y, por ahora, no tienen razón para preocuparse. Ventana favorable para construir marca antes de ser detectado como amenaza — pero la ventana se cierra en el momento en que el proyecto traccione.

Detalle competitivo completo en `03-estudio-competencia/`.

---

## Implicaciones

1. **El proyecto es estructuralmente vulnerable al abandono.** Side-project + "me apetece" + sin presión externa + un solo fundador → el riesgo más alto del kernel no es competencia ni regulación, **es que Iker pierda interés o entre un cliente urgente**. La política guía y el roadmap deben tener esto presente: pequeñas victorias frecuentes > grandes apuestas largas.

2. **El multiplicador IA es real pero acotado.** Acelera desarrollo y permite que una persona haga el trabajo de tres en código. Pero **no acelera la construcción de marca, ni la confianza del usuario, ni la operativa de soporte**. El cuello operativo seguirá siendo Iker incluso con IA.

3. **La libertad política es activo, no debilidad.** Cero deuda con stakeholders permite tomar decisiones impopulares (renunciar a comisiones de comercializadoras, p.ej.) sin coste organizativo. Hay que aprovecharlo: las decisiones que requieren coraje se toman ahora, antes de que aparezcan terceros con voto.

4. **Necesidad inminente: medir baseline.** Sin telemetría no hay forma de saber si el flujo actual funciona. Es la acción más urgente del diagnóstico — sin esto, las decisiones del modelo y la política van a ciegas.

5. **Definir criterios de tracción para ampliar el equipo.** Iker mencionó *"si vemos que tiene sentido y va teniendo resultados ya veremos si hay que ampliarlo a más gente de 540"*. **El criterio "ver resultados" es interpretable** — conviene fijarlo explícito en la política guía: ¿qué umbral de usuarios / donaciones / decisiones servidas justifica ampliar?

---

## Tradeoffs y decisiones tomadas en este contexto

- **Side-project sin involucrar a 540 todavía.** Razón: libertad de decisión + no contaminar la marca consultora con un proyecto sin tracción. Coste: capacidad limitada al tiempo personal del fundador.
- **Sin presupuesto operativo más allá del autofinanciado.** Razón: coherente con stack ligero y filosofía sin afiliación. Coste: imposible acelerar con dinero (publicidad, contratación) — la velocidad la marca el fundador.
- **Sin telemetría hasta ahora.** Razón histórica: V1 era prototipo técnico, no producto comercial. **Decisión:** instalar telemetría mínima como primera acción del roadmap, antes de cualquier iniciativa de adquisición.

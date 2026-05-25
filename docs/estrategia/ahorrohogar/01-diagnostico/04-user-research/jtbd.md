# Jobs to be Done

## ¿Para qué sirve este documento?

Identificar los **"trabajos"** que el usuario contrata al producto para hacer en su vida. JTBD (Christensen / Ulwick) cambia la perspectiva: en vez de pensar en features, pensamos en el **progreso** que el usuario quiere conseguir y cómo el producto le ayuda a lograrlo.

> **La pregunta central**: ¿qué está intentando hacer el usuario cuando "contrata" AhorraCasa, y qué alternativas (productos, hábitos, no hacer nada) hacen el mismo trabajo hoy?

## Origen del análisis

- Síntesis de [personas.md](personas.md) (P1 "la que nunca ha cambiado" + P2 "el que ya cambió alguna vez").
- Síntesis del [customer journey unificado](customer-journeys.md) de 8 fases.
- Reflexiones del fundador del 2026-05-21 (componente social tipo Strava + gestor continuo).
- Informe técnico de viabilidad de Datadis ([investigaciones-tecnicas/seguimiento-continuo-datos-2026-05-21.md](../../investigaciones-tecnicas/seguimiento-continuo-datos-2026-05-21.md)).
- Datos de mercado y competencia con fuente inline (regla dura de trazabilidad del proyecto).

## Niveles de job que se identifican

Para AhorraCasa hay **3 jobs funcionales**, **4 emocionales** y **2 sociales** que merecen análisis separado. Se priorizan al final.

> **Histórico de revisión:** primera versión 2026-05-21 con 8 jobs (3F + 3E + 2S). Tras revisión del fundador el mismo día, se enriqueció la dimensión social del F1 (auto-satisfacción virtuosa) y se añadió E4 (sentirme responsable y optimizador) como dimensión emocional positiva — pieza que faltaba para articular por qué "no ejecutar el cambio" es palanca de marca, no solo restricción técnica.

---

## 🧭 Mapa rápido de los 9 jobs por rol estratégico

> **Cómo leer este documento sin abrumarse:** los 9 jobs NO son 9 ramas paralelas a servir simultáneamente. Tienen roles estratégicos distintos. **Al OST inicial entra principalmente 1 (F1).** El resto sirven para mensajería, descarte argumentado y experimentos futuros.

| Rol estratégico | Jobs | Para qué se usan |
|---|---|---|
| 🎯 **Raíz del OST** (outcome de la visión) | **F1** Encontrar mejor tarifa con poco esfuerzo | Única rama principal del árbol inicial. El producto se diseña para servirlo bien. |
| 🛡️ **Amplificadores / moat estructural** | **E1** No sentirme estafado + **E4** Sentirme responsable y optimizador | **Mensajería + marca**, no ramas del árbol. Refuerzan POR QUÉ AhorraCasa gana en F1. Selectra no puede atacar el primero (modelo) ni el segundo (asesor humano). |
| 🔭 **Profundización futura** (V2 → V3) | **F2** Delegar vigilancia continua · **E2** Dejar de preocuparme · **E3** Sentirme inteligente · **F3** Entender sin jerga | Se activan progresivamente. F2 + E2 dependen de la decisión de política sobre Datadis. F3 es UX cross-cutting. |
| 🧪 **Hipótesis a validar** (sociales) | **S1** Compartir sin parecer obsesivo · **S2** Ser referencia útil | Experimentos a probar tras V1. Si funcionan, palanca de adquisición tipo Strava (moat oculto a largo plazo). Si no, descartar. |

**Lectura corta:** F1 es el producto. E1+E4 son la marca. F2/E2/E3/F3 son el roadmap. S1/S2 son hipótesis.

---

---

# Job funcional 1 (DOMINANTE): Encontrar la mejor tarifa con poco esfuerzo

**Statement:**
> **Cuando** recibo mi factura del hogar y sospecho que pago de más, **quiero** saber con un esfuerzo mínimo si puedo ahorrar y cuánto, **para** no estar pagando de más sin saberlo.

### Dimensión funcional
Identificar si la tarifa actual es competitiva, cuánto se podría ahorrar y con qué comercializadora — en una sesión corta y sin meter datos manualmente.

### Dimensión emocional
**No sentirse estafado**, sentir que se actúa con la información correcta, no perder tiempo investigando algo que "debería ser sencillo".

### Dimensión social

Tiene **dos capas** que conviene separar:

- **Capa externa (leve):** poder decir a familiares/amigos *"acabo de mirar y la tarifa es OK / he detectado que pagaba de más"* sin convertirse en cuñado obsesivo.
- **Capa interna (potente) — auto-satisfacción virtuosa:** sentirse bien con uno mismo porque ha hecho de forma sencilla algo que **todo el mundo debería hacer pero pocos hacen**. Es identidad consumidora, no validación externa. Conecta con el dato de mercado: solo el **13,7% de los hogares cambia en un año dado** [[CNMC Household Panel 2025-05](https://www.cnmc.es/sites/default/files/5881290.pdf)] — el usuario que actúa entra en una minoría virtuosa de la que se siente parte. *Insight añadido por el fundador 2026-05-21.*

### Dimensión contextual

- **¿Cuándo se dispara?** Tras un trigger externo (factura más alta del mes, titular en prensa, comentario de un conocido). Coherente con la fase 2 del journey.
- **¿Dónde?** Móvil-primero, mientras tiene la factura a mano o accesible en email.
- **¿Con qué frecuencia?** Para P1 (nunca ha cambiado): rara — años entre disparadores reales. Para P2 (ya cambió): puntual cuando algo le recuerda revisar.
- **¿Con qué herramientas / personas / hábitos lo hace hoy?** Selectra (vía Google), Comparadorluz, el cuñado, llamada a la compañía actual, **o no hacer nada** (86,3% de los hogares al año [[CNMC Household Panel](https://www.cnmc.es/sites/default/files/5881290.pdf)]).

### Cómo lo resuelve hoy

| Alternativa | Cómo cubre el job | Hueco que deja |
|---|---|---|
| **Selectra / Kelisto / Roams / Rastreator / Acierto** | Comparativa rápida web | **Sesgo estructural por comisión** (H1 validada en [resumen-competitivo](../03-estudio-competencia/resumen-competitivo.md)) → el usuario no se fía de la recomendación |
| **CNMC Comparador** | Neutral, fuente oficial | UX desigual, problemas técnicos [[Bandaancha foro](https://bandaancha.eu/foros/comparador-cnmc-1759943)], errores conceptuales [[Carlos Codina](https://www.youtube.com/watch?v=rHUTAM3Xg-E)] |
| **OCU Simulador** | Neutral con buena cobertura (160+ tarifas) | Requiere suscripción de ~287 €/año tras promoción [[OCU](https://www.ocu.org/info/precios-suscripcion)] |
| **Llamar a compañía actual** | Sin esfuerzo de comparación externa | Sin perspectiva del mercado, solo opciones internas del proveedor |
| **Cuñado / foro** | Confianza interpersonal alta | Anecdótico, sin datos contrastables |
| **No hacer nada** | Cero esfuerzo | Pagar de más por sistema |

### ¿Está bien resuelto?

**NO bien — y este es el hueco principal de AhorraCasa.** Ninguna alternativa actual combina las cuatro cualidades simultáneas: *rápido + fiable (sin sesgo) + gratis + sin jerga técnica*. Hoy el usuario elige entre "rápido y sesgado" (Selectra) o "lento y fiable" (CNMC / OCU). **Oportunidad central del producto.**

### A quién aplica
🟦 Ambas personas P1 + P2. Es el job que la propia visión declara como outcome principal.

---

# Job funcional 2 (AMPLIADO — emergente 2026-05-21): Delegar la vigilancia continua de mis consumos

**Statement:**
> **Cuando** llevo meses sin revisar mis tarifas, **quiero** que alguien vigile por mí si aparece una oportunidad de ahorro relevante, **para** no tener que dedicarle tiempo y estar siempre cerca de la óptima sin pensar en ello.

### Dimensión funcional
Mantener al usuario siempre cerca de la tarifa óptima del mercado a lo largo del tiempo, sin que tenga que iniciar la acción cada vez. *Set-and-forget*.

### Dimensión emocional
**Dejar de preocuparse**. Eliminar la sensación crónica de "igual estoy pagando de más" que aparece ante cada factura.

### Dimensión social
Casi inexistente — es un job íntimo, de paz mental.

### Dimensión contextual

- **¿Cuándo se dispara?** Permanentemente — es un job de mantenimiento, no de evento.
- **¿Dónde?** Notificaciones móviles / email opcionales.
- **¿Con qué frecuencia?** Vigilancia continua, notificación solo cuando hay valor real (>50 €/año, latencia <7 días — umbrales definidos en la visión).
- **¿Con qué herramientas / personas / hábitos lo hace hoy?** Casi nadie. Es un job nuevo en el mercado.

### Cómo lo resuelve hoy

| Alternativa | Cómo cubre el job | Hueco que deja |
|---|---|---|
| **Selectra Score** | Ranking actualizado | No avisa proactivamente al usuario; este tiene que volver a entrar |
| **OCU — Compras Colectivas de Energía** | Programa periódico con tarifas exclusivas para socios | Solo socios (suscripción), no es alarma personalizada por perfil |
| **Hello Watt / Clevergy (vía Datadis)** | Monitorización de consumo continuo con datos del distribuidor | Foco en consumo, no en comparar tarifas. Y ambos cobran comisión a comercializadoras en la fase de cambio |
| **Comercializadora actual** | Cero — incentivo opuesto | El proveedor nunca te avisa si pierde competitividad |
| **No hacer nada** | Cero esfuerzo | El mercado se mueve y el usuario queda atrás sin saberlo |

### ¿Está bien resuelto?

**NO está resuelto por nadie de forma neutral**. Es **espacio en blanco competitivo** identificado en el [resumen-competitivo](../03-estudio-competencia/resumen-competitivo.md). Pero **su viabilidad técnica exige decisiones estructurales** que rompen el stack actual — ver [investigaciones-tecnicas/seguimiento-continuo-datos-2026-05-21.md](../../investigaciones-tecnicas/seguimiento-continuo-datos-2026-05-21.md).

### A quién aplica
👥 P2 principalmente (su cita literal: *"no tengo tiempo para investigarlo cada año"*). 👤 P1 derivadamente, una vez ha cambiado por primera vez.

### Niveles de profundidad de este job

Este job tiene **dos niveles** que conviene separar — son decisión estratégica:

- **Nivel ligero (V2 de la visión actual)**: el usuario reescanea cada 6 meses o cuando le avisamos por email para hacerlo. Mantiene el stack 100% frontend + email opcional. **No es set-and-forget completo, pero es delegación parcial.**
- **Nivel profundo (V3 — gestor continuo)**: la plataforma accede a Datadis con autorización del usuario y monitoriza sin reescaneo. **Es set-and-forget real**, pero rompe el stack (necesita backend + entidad jurídica + DPO). Decisión estratégica que va a política guía.

---

# Job funcional 3 (sub-job de F1): Entender mi situación energética sin jerga técnica

**Statement:**
> **Cuando** miro mi factura o me hablan de tarifas, **quiero** entender mi situación en lenguaje simple, **para** poder tomar decisiones informadas sin tener que aprender ingeniería energética.

### Dimensión funcional
Traducir conceptos técnicos (potencia por franja, peajes 2.0TD, mercado regulado/libre, discriminación horaria) a información accionable.

### Dimensión emocional
**Sentirse capaz**, no abrumado. Recuperar el control mental sobre algo que aparece todos los meses.

### Dimensión social
Poder hablar de la factura en una conversación social sin sentirse fuera de juego.

### Cómo lo resuelve hoy

| Alternativa | Cómo cubre el job |
|---|---|
| **Blogs (Rankia, Kowiik)** | Guías largas, técnicas, requieren tiempo |
| **Comparadores comerciales** | Algunos tienen artículos pero con sesgo comercial |
| **YouTube (Carlos Codina y similares)** | Vídeos técnicos buenos pero requieren búsqueda activa |
| **OCU informes** | Lenguaje accesible pero detrás de paywall |
| **No hacer nada** | Convivir con la ignorancia, contribuye a inercia |

### ¿Está bien resuelto?

**Parcialmente** — hay mucha información, pero **mal segmentada por necesidad del usuario**. Existe gap claro: explicación contextual al hilo del veredicto ("tu tarifa es 2.0TD porque tu potencia es 4,4 kW; eso significa…") en lugar de obligar al usuario a buscar conceptos sueltos.

### A quién aplica
👤 P1 principalmente. P2 lo necesita menos.

---

# Job emocional 1: No sentirme estafado

**Statement:**
> **Cuando** alguien me recomienda una tarifa o comercializadora, **quiero** estar seguro de que la recomendación es honesta y verificable, **para** no sentirme engañado o manipulado por incentivos ocultos.

### Dimensión funcional
Verificar la fuente del dato y la motivación de quien recomienda.

### Dimensión emocional
**Confianza**. Reducir la ansiedad inherente a una decisión que se percibe técnica y opaca.

### Dimensión social
Conexión con el job de "poder recomendar" — si me siento estafado, no recomiendo; si no me siento estafado, recomiendo encantado.

### Cómo lo resuelve hoy

- **El usuario verifica entre varios comparadores** — busca coherencia entre Selectra, CNMC, OCU. Si los tres apuntan a lo mismo, se fía. Si no, se atasca.
- **Lee opiniones en Trustpilot** de la comercializadora recomendada antes de actuar.
- **Pregunta a su red de confianza** para validar la decisión.
- **No actúa** si la sensación de estafa es muy fuerte.

### ¿Está bien resuelto?

**NO** — la sospecha es estructural y validada por las quejas reales en Trustpilot [[Trustpilot Selectra.es](https://es.trustpilot.com/review/selectra.es)] y por la propia opacidad del modelo de los comparadores comerciales. Comerciales (Selectra, Roams, Kelisto) **no pueden** resolver bien este job sin canibalizar su modelo de negocio. Únicas alternativas honestas: CNMC y OCU.

### A quién aplica
🟦 Ambas, pero **P2 lo prioriza más** (su cita inicial: *"¿es de fiar?"* antes que "¿cómo funciona?").

### Implicación estratégica

**Este es el job donde AhorraCasa tiene ventaja estructural máxima** — la neutralidad económica (no cobrar a comercializadoras) **resuelve este job mejor que ningún competidor comercial**, por construcción.

---

# Job emocional 2: Dejar de preocuparme por la factura

**Statement:**
> **Cuando** recibo mi factura mensualmente, **quiero** dejar de tener la sensación incómoda de "igual estoy pagando de más", **para** tener tranquilidad financiera respecto a mis servicios básicos del hogar.

### Dimensión funcional
Generar un estado mental estable: "estoy bien con mi tarifa, no necesito mirar". Eliminar la rumiación recurrente.

### Dimensión emocional
**Paz mental**. Es el job que el outcome principal de la visión (*"sin tener que volver a preocuparse activamente"*) declara explícitamente.

### Cómo lo resuelve hoy

- **Algunos usuarios cambian una vez y se olvidan** — paz mental temporal, pero el mercado se mueve y vuelve la inquietud al cabo de 1-2 años.
- **Muchos otros simplemente reprimen la duda** — no actúan, conviven con la sensación de fondo.
- **Una minoría revisa cada año o dos** por iniciativa propia.

### ¿Está bien resuelto?

**NO** — no existe hoy en el mercado un servicio que **genere confianza activa y continua** de que el usuario está bien con su tarifa. La paz mental se consigue por "olvido voluntario" más que por validación externa.

### A quién aplica
🟦 Ambas, pero **P2 lo prioriza explícitamente** (cita literal: *"sé que pago de más pero no tengo tiempo"* — la duda persiste sin que el job esté satisfecho).

### Conexión con job funcional 2

Este job emocional **se satisface principalmente vía el job funcional 2** (delegar vigilancia continua). Sin vigilancia activa por parte de la plataforma, la paz mental dura poco.

---

# Job emocional 3: Sentirme inteligente y capaz como consumidor

**Statement:**
> **Cuando** consigo ahorrar dinero gestionando mis facturas, **quiero** sentir que lo he hecho yo y que soy capaz de hacerlo por mi cuenta, **para** reforzar mi autonomía como consumidor en un mercado opaco.

### Dimensión funcional
Atribuirse el mérito del ahorro conseguido.

### Dimensión emocional
**Empoderamiento**. Coherente con el outcome secundario de la visión.

### Dimensión social
Conecta con jobs sociales — poder contar el ahorro como logro propio, no como "me lo hicieron".

### Cómo lo resuelve hoy

- **Selectra / Roams ROMPEN este job** porque el asesor humano hace todo por el usuario → el usuario se siente gestionado, no empoderado.
- **OCU lo resuelve parcialmente** porque el usuario activamente decide y actúa.
- **CNMC lo resuelve parcialmente** por la misma razón, aunque la UX no facilita el éxito.

### ¿Está bien resuelto?

**Parcialmente** — los servicios que más conversión consiguen son los que peor resuelven este job (Selectra et al.). AhorraCasa, al **NO ejecutar el cambio**, deja al usuario protagonista — alineado con este job aunque pueda costar conversión a corto plazo.

### A quién aplica
🟦 Ambas, pero diferente intensidad. 👤 P1 lo descubre tras el primer cambio; 👥 P2 ya lo había experimentado.

---

# Job emocional 4: Sentirme responsable y optimizador con mi hogar

> Job emergente añadido por el fundador 2026-05-21. Se distingue de E1 (defensivo, "no me estafan") y de E3 (capacidad, "soy capaz") porque es una **emoción positiva de identidad**: "ejerzo mi rol como adulto que gestiona bien su hogar".

**Statement:**
> **Cuando** tomo decisiones sobre los servicios básicos de mi hogar, **quiero** sentir que estoy optimizando y ejerciendo mi responsabilidad como adulto, **para** vivir con la satisfacción de hacer las cosas como creo que deben hacerse.

### Dimensión funcional
Hacerse cargo activamente de las decisiones del hogar (no delegarlas en la inercia ni en la comercializadora actual).

### Dimensión emocional
**Satisfacción positiva** (no alivio defensivo). Es la sensación de "estoy haciendo bien mi parte", coherente con el rol adulto de gestionar el hogar.

### Dimensión social
Conecta directamente con la capa interna del Job F1 (auto-satisfacción virtuosa) y con el Job S2 (ser referencia útil). **No requiere mostrar externamente** — es estado mental persistente.

### Dimensión contextual

- **¿Cuándo se dispara?** Permanente — es identidad, no evento puntual. Se refuerza con cada decisión consciente sobre los servicios del hogar.
- **¿Dónde?** En la conciencia del usuario, no en una pantalla concreta.
- **¿Con qué frecuencia?** Continuo cuando está activado; se erosiona con tiempo sin reforzarlo.

### Cómo lo resuelve hoy

| Alternativa | Cómo cubre el job |
|---|---|
| **Cambiar puntualmente por iniciativa propia** (sin comparador) | Cubre el job pero con altísimo coste de esfuerzo personal |
| **OCU** | Lo cubre relativamente bien — pagar la suscripción **ya es** un acto de responsabilidad consciente |
| **CNMC** | Cubre cuando el usuario lo usa por su cuenta — pero la mala UX rompe la sensación de "lo he hecho bien" |
| **Selectra / Roams** | **ROMPEN este job** — el asesor humano hace todo por el usuario → "no he hecho yo nada, me han gestionado" |
| **No hacer nada** | No cubre el job; al revés, genera la sensación contraria ("debería estar pendiente de estas cosas y no lo estoy") |

### ¿Está bien resuelto?

**NO** — y este es un job especialmente desatendido en el mercado actual. La industria está organizada para **quitar trabajo al usuario** (asesor humano, llamada, gestión completa), lo que **destruye este job emocional** sin darse cuenta. Los productos que mejor lo cubrirían (CNMC + OCU) tienen barreras propias (UX, paywall).

### A quién aplica

🟦 Ambas, pero **más fuerte en perfiles con identidad adulta consolidada** (probablemente cohorte 35-55 más que 28-34). Validar.

### Implicación estratégica

**Este job es coherente con la decisión de la visión de "notificar + asistir, no ejecutar".** No ejecutar el cambio por el usuario **NO es solo decisión de stack técnico** — es la única forma de **preservar este job emocional**. Si AhorraCasa lo entiende y lo comunica bien, convierte un aparente coste de conversión (no cierras tú el cambio) en una **palanca de marca**: *"Aquí no te gestionamos, te empoderamos para que tú decidas y actúes — porque al final del día es tu hogar."*

**Conexión con el outcome secundario de la visión** (empoderamiento) — ahora hay una articulación clara de **por qué** ese outcome importa: no es un nice-to-have, es un **job emocional propio** que el mercado actual sirve mal.

---

# Job social 1: Compartir mi ahorro sin parecer obsesivo

**Statement:**
> **Cuando** detecto un ahorro real, **quiero** poder mostrarlo a mi entorno de forma sutil y proporcionada, **para** que se me vea como alguien que cuida su economía sin obsesionarse con el precio de la luz.

### Dimensión funcional
Tener un mecanismo de compartir socialmente aceptable (no agresivo, no comercial).

### Dimensión emocional
**Orgullo proporcionado**. Compartir sin sentirse "el cuñado del precio de la luz".

### Dimensión social
**Pertenencia a un grupo "que sí mira"**. Esto es lo que Strava hizo masivamente con el deporte — *"yo entreno y comparto, eso me posiciona"*. Aquí: *"yo miro mis facturas y comparto el resultado, eso me posiciona"*.

### Cómo lo resuelve hoy

- **Casi nadie comparte ahorros de factura** porque el formato actual (titulares, gráficos técnicos) chirría socialmente.
- **Conversaciones informales** sí ocurren ("oye, ¿con qué compañía estás tú?") pero son uno-a-uno, no escalables.
- **No existe formato social compartible** equivalente al de Strava (tarjeta con métrica + identidad + comunidad).

### ¿Está bien resuelto?

**NO** — y conexión directa con la reflexión del fundador del 2026-05-21 sobre el toque social tipo Strava. **Hipótesis fuerte a validar:** ¿hay apetito real para compartir ahorros del hogar, o el dominio es demasiado íntimo?

### A quién aplica
Probablemente más fuerte en cohortes más jóvenes del target (28-40). Validar.

### Implicación estratégica

Este job **podría ser el moat oculto a largo plazo** si AhorraCasa lo resuelve mejor que nadie. El paralelismo con Strava es: el job funcional (registrar / comparar) es commodity; el job social (mostrar mi progreso a mi tribu) construye comunidad y red. **Riesgo:** forzar gamificación en dominio íntimo puede salir mal. Probar con experimentos pequeños.

---

# Job social 2: Ser referencia útil para mi entorno

**Statement:**
> **Cuando** un familiar o amigo me pide consejo sobre tarifas o cambio de compañía, **quiero** poder remitirle a una fuente fiable y neutral, **para** ayudarle de verdad sin convertirme en su asesor energético personal.

### Dimensión funcional
Tener una respuesta fácil y compartible a "¿qué compañía es la buena?".

### Dimensión emocional
**Ser útil sin coste personal**. Ayudar sin asumir la responsabilidad de la decisión ajena.

### Dimensión social
**Construir capital social** sutilmente: "mi amigo me recomendó AhorraCasa y me ahorré X €" → al amigo se le ve como alguien con buen criterio.

### Cómo lo resuelve hoy

- **Muchos usuarios envían enlaces a Selectra o Rastreator** sin sospechar el modelo de comisión.
- **OCU es recomendable** pero solo a quienes ya son socios.
- **CNMC es la respuesta "correcta"** pero la mala UX hace que el amigo se atasque y vuelva a pedir ayuda.
- **El cuñado / experto del grupo** asume el rol — incómodo para él, no escalable.

### ¿Está bien resuelto?

**NO** — falta una fuente "que puedas recomendar sin reservas". AhorraCasa puede ocupar este lugar por la combinación neutralidad + UX + gratis.

### A quién aplica
🟦 Ambas, especialmente quienes ya son referentes "naturales" en su grupo (tendencia a aconsejar).

### Conexión con job social 1

Los dos jobs sociales están relacionados — quien comparte su ahorro (S1) probablemente también recomienda la herramienta (S2). El mecanismo de share post-veredicto del journey (oportunidad OJ-3A) cubre ambos jobs simultáneamente.

---

## Priorización de jobs

> ¿Cuál es el job dominante al que el OST debe responder primero?

### Job dominante: Funcional 1 (encontrar mejor tarifa con poco esfuerzo)

Es el job que **todos los usuarios contratan** (P1 + P2, todas las fases del journey). Sin resolverlo bien, los demás jobs no son relevantes — nadie viene a AhorraCasa para "sentirse empoderado" sin antes querer "ver si pago de más".

**Implicación para OST:** la rama raíz del árbol cuelga del Job F1. El resto son ramas de profundización.

### Job amplificador: Emocional 1 (no sentirme estafado)

**El job donde AhorraCasa tiene la ventaja estructural más fuerte** (neutralidad económica). Si resolvemos F1 + E1 simultáneamente con neutralidad creíble, **competimos en un cuadrante donde Selectra no puede entrar sin canibalizar**.

### Job amplificador secundario: Emocional 4 (sentirme responsable y optimizador)

**Job emergente añadido en revisión 2026-05-21.** Es la pieza positiva que faltaba para entender por qué la decisión de visión de **"no ejecutar el cambio"** no es solo restricción técnica — **es la única forma de preservar este job emocional**. Selectra y Roams **destruyen** este job con su modelo de asesor humano. AhorraCasa lo respeta por construcción.

Hace al outcome secundario de la visión (empoderamiento) accionable: el usuario que decide y actúa por su cuenta refuerza su identidad adulta de "gestiono bien mi hogar". **Comunicable como palanca de marca explícita.**

### Jobs de profundización futura: F2, E2, E3

**Funcional 2 + Emocional 2 + Emocional 3** se satisfacen juntos vía V2 (alarmas) y eventual V3 (gestor continuo con Datadis si la política guía lo aprueba). Son el outcome principal de la visión.

**Tensión a vigilar:** F2 (delegar vigilancia) y E4 (sentirme responsable) parecen tirar en direcciones opuestas — ¿se puede delegar la vigilancia y a la vez sentirse responsable? Sí, si el modelo es **"yo decido cuándo me preocupo, la plataforma me avisa cuando merece la pena"** — la delegación es de la atención, no de la decisión. Distinción clave para el OST y para la comunicación.

### Jobs sociales: S1 y S2 — palanca de adquisición, no propósito

Los jobs sociales **son el motor del boca a boca** (fase 0/2 del journey) más que el corazón del producto. Su rol es **acelerar la captación** sin la cual el journey ni siquiera empieza. Si se resuelven bien, **podrían convertirse en moat a largo plazo** (paralelismo Strava).

---

## Jobs no resueltos (síntesis para el OST)

| # | Job | Por qué no está bien resuelto hoy | Quién lo intenta hoy | Impacto |
|---|---|---|---|---|
| F1 | **Encontrar mejor tarifa con poco esfuerzo y neutralidad** | Comparadores comerciales tienen sesgo estructural; CNMC mala UX; OCU paywall | Selectra/Kelisto/Roams (sesgados), CNMC (mal UX), OCU (paywall) | **Crítico** — job dominante |
| F2 | **Delegar la vigilancia continua de mis consumos** | Nadie lo hace de forma neutral; Hello Watt/Clevergy lo hacen pero cobran comisión en el cambio | Hello Watt / Clevergy (vía Datadis); nadie con neutralidad | **Alto** — pero exige decisión estratégica de política |
| F3 | **Entender mi situación sin jerga técnica** | Información existe pero mal segmentada y dispersa | Blogs, OCU, YouTube — fragmentado | Medio-alto |
| E1 | **No sentirme estafado por la recomendación** | Modelo dominante (comisión) **es** la estafa estructural | CNMC y OCU lo resuelven, pero ninguno con buena UX gratuita | **Crítico** — moat estructural de AhorraCasa |
| E2 | **Dejar de preocuparme por la factura** | Sin vigilancia activa, la duda recurrente nunca se elimina | Nadie lo resuelve a largo plazo de forma neutral | Alto |
| E3 | **Sentirme inteligente como consumidor** | Servicios que más convierten (Selectra/Roams) **rompen este job** | Parcialmente OCU y CNMC | Medio |
| **E4** | **Sentirme responsable y optimizador con mi hogar** | El mercado actual está organizado para quitar trabajo al usuario → destruye este job. CNMC y OCU lo cubrirían pero tienen barreras propias | Parcialmente CNMC y OCU; Selectra/Roams lo destruyen | **Alto** — palanca de marca explicable como diferencial |
| S1 | **Compartir mi ahorro sin parecer obsesivo** | No existe formato social compartible | Nadie | Medio — pero potencial moat tipo Strava |
| S2 | **Ser referencia útil para mi entorno** | Falta una fuente neutral recomendable sin reservas | Cuñado / OCU (a socios) / CNMC (con esfuerzo) | Medio-alto |

---

## Anti-jobs (cosas que el usuario NO quiere hacer)

> Cosas que el usuario explícitamente **no quiere** hacer. Útil para saber qué evitar exigirle.

- **NO quiere** dar su teléfono ni que le llamen comerciales. Coherente con la decisión de visión (no ejecutar) y con el modo móvil-primero autoservicio.
- **NO quiere** rellenar formularios largos con datos de su factura. El QR resuelve esto.
- **NO quiere** convertirse en experto energético — solo quiere resultados claros.
- **NO quiere** comprometerse a una suscripción mensual solo para comparar tarifas (modelo OCU sirve solo a quienes ya pagan por otras razones).
- **NO quiere** recibir notificaciones constantes — solo cuando hay valor real (umbral >50 €/año, max 1-2 emails al año si no hay movimiento).
- **NO quiere** que la plataforma decida por él (ejecutar el cambio sin su consentimiento). Quiere asistencia, no representación.
- **NO quiere** que le hagan responsable si la recomendación sale mal. Necesita ver fuente del dato + cláusula clara de "esta es la mejor según los datos públicos a HH:MM de hoy".

---

## Hipótesis a validar con experimentos reales (V1+)

- **HJ-A**: El job dominante de los usuarios primer-uso es F1 (encontrar tarifa); el job dominante de los usuarios recurrentes es F2 (delegar vigilancia). Validar con segmentación analítica al activar V2.
- **HJ-B**: La resolución de E1 (no sentirme estafado) es el factor de conversión clave en fase 4 del journey. Validar con A/B test del mensaje de neutralidad en home.
- **HJ-C**: Existe apetito social real para compartir ahorros del hogar (job S1). Validar con experimento pequeño: tarjeta compartible post-veredicto + medir tasa de share.
- **HJ-D**: El usuario sí está dispuesto a autorizar acceso a Datadis a cambio del job F2 resuelto de verdad — pero solo si la propuesta es **muy** explícita en confianza y reversibilidad. Validar antes de invertir en backend V3.
- **HJ-E**: Los jobs sociales (S1 + S2) generan mejor conversión a fase 3 que los canales no-sociales. Validar con cohortes por canal de entrada.

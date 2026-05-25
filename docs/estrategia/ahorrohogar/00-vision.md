# Visión del producto

## ¿Para qué sirve este documento?

La visión es el **norte** del proyecto. Define qué problema resolvemos, para quién y qué cambio queremos ver en el mundo. Es lo primero que se decide y lo que informa todo lo demás (diagnóstico, política, roadmap).

## Preguntas clave que debe responder

1. ¿Cuál es el **problema fundamental** que resolvemos?
2. ¿Quién es el **usuario objetivo** principal?
3. ¿Qué nos hace **diferentes** de las alternativas?
4. ¿Qué **outcome** (cambio medible en el cliente) queremos provocar?
5. ¿Cómo se ve el **éxito en 12 meses**?
6. ¿Qué **restricciones** conocidas existen?
7. ¿Hay una **North Star metric**?

---

## Elevator pitch

> **Para adultos españoles que intuyen que pagan de más por sus servicios básicos del hogar pero no saben cuánto ni cómo cambiarlo, AhorraCasa es la plataforma neutral que escanea el QR de tu factura, te dice si puedes ahorrar y vigila tu perfil para avisarte cuando aparezca una mejor oferta — sin cobrar nunca a las comercializadoras.**

---

## Problema fundamental

El usuario español **paga de más** por los servicios básicos de su hogar (luz, gas, combustible, banca) porque:

- **Información dispersa y opaca:** hay decenas de compañías y los mercados son poco transparentes. Saber si hay una oferta mejor cuesta tiempo y atención.
- **Facturas técnicamente complicadas:** no son imposibles de entender, pero exigen un nivel técnico (potencias por franja, peajes, consumos por periodo) que la persona media no maneja.
- **Comparadores existentes poco fiables:** los disponibles son poco usables y, en muchos casos, **se sospecha que cobran comisión a las comercializadoras o muestran publicidad de eléctricas** — esto compromete la neutralidad de su recomendación. *[Hipótesis a validar en el análisis de competencia.]*
- **Fricción cultural al cambio:** cambiar de proveedor da respeto y se percibe como costoso, aunque en realidad sea relativamente sencillo y se pueda hacer una vez al año con coste mínimo.
- **Inercia como comportamiento por defecto:** no existe en España la cultura del cambio activo en servicios básicos del hogar. La opción por defecto es quedarse, y eso significa pagar de más por sistema.
- **Subestimación del coste de la inacción:** muchos usuarios sospechan que podrían pagar menos, pero **no saben cuánto están perdiendo** (€/año concretos) ni que **cambiar es relativamente fácil**. Sin esos dos datos, la inercia siempre gana.

El resultado neto: los hogares pagan de más mes a mes sin saberlo, no porque no haya alternativas mejores, sino porque (a) no son conscientes de cuánto pierden por no actuar y (b) creen que actuar es más costoso de lo que realmente es.

**Por qué importa este problema ahora:**

El problema en sí es **estructural y permanente** — la inercia y la opacidad llevan ahí décadas. **Lo que ha cambiado en los últimos años es que por primera vez es resoluble** a coste cero para el usuario:

- **Apertura institucional de datos:** la CNMC tiene un comparador público con API neutral; el MITECO publica precios de carburante en tiempo real. Esto no existía con esta calidad hace 5 años.
- **Regulación favorable:** el QR estandarizado en factura de luz es obligatorio desde 2022 [[BOE-A-2021-11035](https://www.boe.es/diario_boe/txt.php?id=BOE-A-2021-11035)], lo que permite extraer todos los datos del contrato del usuario sin que él los teclee.
- **Digitalización de la factura:** la inmensa mayoría de hogares recibe factura electrónica accesible desde el móvil.
- **Ventana de atención del usuario:** tras la crisis energética 2022-2023, el hogar español ha incorporado la factura energética a sus preocupaciones recurrentes — la cicatriz se mantiene aunque los precios se normalicen.

Las palancas coyunturales (precio de la energía, geopolítica) **amplifican** la urgencia pero no son la base de la visión: el producto debe sostenerse incluso cuando esas palancas desaparezcan.

---

## Usuario objetivo

**Perfil principal V1 — "el adulto consciente pero atascado"**

Adulto entre **28 y 55 años**, viviendo **solo, en pareja o con hijos**, en vivienda **en propiedad o alquiler estable**. Paga las facturas del hogar él/ella y las mira al menos una vez al año.

Lo que lo define no es su comportamiento previo (haber cambiado de compañía o no), sino su **estado mental actual**:

- **Intuye** que podría estar pagando de más por sus servicios básicos, pero **no sabe cuánto**.
- **No sabe que cambiar de compañía es relativamente fácil** — lo percibe como más costoso de lo que realmente es.
- **No sabe por dónde empezar** y los comparadores existentes no le inspiran confianza.

Características operativas:
- **Móvil primero.** Va a usar la app desde el teléfono, no desde el ordenador.
- **Sensible al ahorro pero sin tiempo para investigar.** Si le pones el ahorro masticado delante, actúa. Si tiene que dedicarle horas, abandona.
- **Tolerante al QR.** El gesto de escanear un QR ya forma parte de su comportamiento habitual (pagos, restaurantes, parking, etc.).

**Perfil secundario — fuera del foco V1**

Adulto **+55 años con baja confianza digital**. Mismo dolor de fondo (paga de más por servicios básicos), pero el flujo "QR + decisión autónoma + cambio online" no le sirve. Requiere **un producto distinto** (asistencia humana, flujo simplificado, posiblemente offline) — se aborda en una fase posterior con los aprendizajes de V1, no se intenta servir con el mismo flujo.

**Tradeoff aceptado:** Renunciamos en V1 a un segmento amplio (+55 no digital) a cambio de foco y consistencia con el stack 100% frontend. Si V1 valida la propuesta, el +55 se aborda después con producto adaptado.

---

## Diferenciación

**Alternativas que el usuario usa hoy:**

- **Comparadores comerciales** — Selectra, Acierto, Rastreator, Kelisto, Roams. Gratuitos para el usuario, pero **cobran a las comercializadoras por lead** [[Vizologi — Selectra Business Model](https://vizologi.com/business-strategy-canvas/selectra-business-model-canvas/)]. Flujo pesado (formularios Typeform, subir factura, teclear potencias) — *pendiente de verificar en análisis competitivo si alguno ya usa QR*. Recomendación con incentivo económico potencialmente desalineado con el usuario.
- **Comparador oficial CNMC** — neutral, datos buenos, sin afiliación. Pero **UX poco amigable**, sin asistencia, sin monitoreo posterior, requiere meter datos a mano si no se usa el QR.
- **Llamar a la compañía actual o leer su web** — sin perspectiva del mercado, solo conoces las opciones internas de ese proveedor.
- **Preguntar al cuñado / a un amigo / al foro** — anecdótico, sesgo de superviviente, sin datos contrastables.
- **No hacer nada (inercia)** — la opción dominante en la práctica y **el competidor más fuerte**. Si el coste percibido del cambio supera al ahorro esperado (aunque el coste real sea bajo), el usuario se queda.

**Nuestra diferencia clave — combinación de tres elementos que ningún competidor puede replicar sin destruir su modelo:**

1. **Neutralidad económica absoluta.** No cobramos ni cobraremos a las comercializadoras. No hay comisión por lead, no hay afiliación, no hay publicidad de eléctricas dentro del producto. El usuario es el único cliente, su interés es el único optimizado.
2. **Fricción mínima vía QR + datos institucionales.** El usuario escanea el QR de su factura, la app extrae todos los datos (consumos, potencias, tarifa, CUPS, importe) y consulta la API pública de la CNMC. Sin formularios, sin subir documentos, sin teclear potencias por franja.
3. **Monitoreo continuo (set-and-forget).** La plataforma sigue vigilando el perfil del usuario después del primer escaneo y le avisa cuando aparece una oferta mejor que justifica el cambio. La inercia deja de ser enemiga: el usuario delega la atención a la plataforma. *Modo: notificar + asistir, nunca ejecutar el cambio por el usuario.*

**Filtro DHM aplicado:**

| Dimensión | Cumple | Argumento |
|---|---|---|
| **Delight** | ✅ | "No tengo que volver a pensar en mi factura" es delight honesto. La plataforma trabaja por ti y solo te interrumpe cuando merece la pena. |
| **Hard to copy** | ✅ | La neutralidad es **estructural**, no de diseño. Selectra y similares facturan a las comercializadoras — no pueden dejar de hacerlo sin morir. Su única vía para copiarnos sería lanzar una marca paralela neutral que canibaliza su propio negocio. Históricamente, las empresas no se canibalizan bien. |
| **Margin enhancing** | ✅ | El monitoreo es automatizable: el coste marginal por usuario tiende a cero con escala. A más volumen, más datos de mercado agregados, mejor calidad del aviso (efecto red débil pero real). |

**Propósito ideológico (refuerza la defensa):**

> "Creemos que los servicios básicos del hogar deberían estar siempre al mejor precio para todos los clientes. Te avisamos porque te conviene a ti, no porque nos paguen a nosotros. Apostamos por un mundo económicamente optimizado para el usuario final, no para el intermediario."

Este discurso es coherente con la neutralidad económica y **antagónico** con el modelo de comparadores comerciales: no pueden adoptarlo sin contradicción. Es parte del moat.

---

## Outcome desired

### Outcome principal — económico

**Que el usuario pague menos por sus servicios básicos del hogar, sin tener que volver a preocuparse activamente por ello.**

Este es el **nodo raíz del Opportunity Solution Tree**. Todas las oportunidades, soluciones y assumption tests que construyamos cuelgan de aquí.

**Cómo lo medimos (dos métricas complementarias):**

1. **€ ahorrados acumulados por usuario / año** — diferencia entre lo que paga ahora y lo que pagaba con su tarifa original (baseline real, no estimado). Mide *cuánto le hemos ayudado*.
2. **Gap €/año entre la tarifa actual del usuario y la mejor disponible en el mercado** — queremos que tienda a cero y se mantenga cerca de cero. Mide *cuánto le falta por ayudarle*. Es métrica look-forward y es la que captura el set-and-forget: si el gap se mantiene bajo, la plataforma está cumpliendo.

**Horizontes (por usuario, desde su entrada a la plataforma):**

| Horizonte | Objetivo | Lógica |
|---|---|---|
| **Primer cambio** | El **80% de los usuarios** decide actuar (cambiar de tarifa o confirmar que la suya ya es óptima) **dentro de su primera sesión, en <15 minutos** desde el escaneo del QR | El producto está diseñado para que un único QR + comparativa simple produzca decisión inmediata. Si el usuario sale sin decidir, hemos fallado el primer contacto. |
| **Mantenimiento** | La plataforma reevalúa el perfil del usuario **cada 6 meses** (o cuando el usuario reescanea) y le notifica en **<7 días** si aparece una oferta con ahorro **>50 €/año** sobre su tarifa actual | 50€/año es umbral mínimo que justifica fricción del cambio. <7 días es latencia aceptable para que el aviso siga siendo accionable. |

### Outcome secundario — empoderamiento

**Que el usuario interiorice que cambiar de tarifa es fácil y que puede hacerlo por su cuenta, sin depender de terceros.**

Esto es consecuencia del outcome principal: cuando el usuario consigue su primer ahorro real con poco esfuerzo, su percepción del cambio cambia. Pero merece medirse aparte porque captura el cambio cultural más profundo que persigue el proyecto.

**Cómo lo medimos:**

- **Tasa de intent-to-switch** — % de usuarios que, tras ver su comparativa, deciden **intentar mejorar su tarifa** (vs. salir sin hacer nada). Aspiración: >60%.
- **Repetición sin notificación previa** — % de usuarios que vuelven a la plataforma proactivamente (sin que les hayamos avisado) para revisar si pueden mejorar su tarifa. Mide que la inercia ha cambiado: ahora el usuario sabe que mirar tiene sentido.

### Lo que NO es el outcome (apuntado para no confundir niveles)

Las siguientes son **métricas de negocio**, NO outcomes. Van a la pregunta 5 (Éxito en 12 meses) y al Roadmap, no aquí:

- Número total de usuarios / volumen.
- Tasa de recurrencia agregada de la base.
- CAC, retención, conversión de landing.
- NPS o satisfacción percibida.

Estas correlacionan con el outcome cuando el producto funciona, pero **no son** el cambio en el cliente. Si las optimizamos directamente terminamos diseñando para el negocio en lugar de para el usuario.

---

## Éxito en 12 meses (referencia inicial)

> Esta es la **foto rápida** del éxito a mayo 2027. La versión detallada (cliente / negocio / equipo, por horizontes 6m / 12m / 24-36m, con verificación de coherencia) se concreta al final del proceso en [`05-foto-estado-futuro.md`](05-foto-estado-futuro.md).

**Hitos cualitativos:**

1. **AhorraCasa es reconocida como la alternativa neutral a los comparadores comerciales tradicionales** (Selectra, Acierto, Rastreator, Kelisto, Roams). El posicionamiento "neutral, gratis, sin afiliación" está activo en al menos un canal externo (medios económicos, foros de consumo, redes). *Nota: AhorraLuz V1 sigue siendo el módulo técnico de electricidad dentro de la plataforma AhorraCasa.*
2. **La plataforma es multi-vertical: al menos gas natural está operativo además de electricidad.** Combustible y banca quedan para fases posteriores (decisión a refinar en política guía).
3. **Sostenibilidad económica del modelo neutral validada vía donaciones**: el modelo no requiere cobrar a comercializadoras para mantenerse en pie.
4. **La plataforma ha evolucionado de V1 a V2**: V1 (sin auth, escaneo puntual) sigue siendo el flujo por defecto; V2 añade **registro opcional con email** solo para activar alarmas de monitoreo continuo y configuraciones avanzadas. Filosofía "sin fricción para empezar, persistencia opcional para profundizar".

**Hitos cuantitativos (totales acumulados a 12 meses):**

| Métrica | Umbral | Conexión con el outcome |
|---|---|---|
| **€ totales de ahorro generado para usuarios** | **1.000.000 €** | Outcome principal a nivel agregado. Asume ~100€ medios de ahorro × 10K usuarios. Es **la cifra que demuestra que la plataforma cumple su misión**. |
| QR escaneados / consultas hechas | 20.000 | Funnel — adopción del flujo gratuito sin registro. |
| Usuarios únicos | 10.000 | Funnel — base de la que pueden salir alarmas. |
| Usuarios con alarmas activadas (registro con email) | 2.000 | Funnel — captura "delegación / set-and-forget" en acción (~20% de los usuarios únicos). |
| Donaciones de usuarios | 1.000 donaciones de ~5 € de media / 5.000 € recibidos | Validación de sostenibilidad del modelo neutral. Estructura "muchos donantes pequeños" alineada con la filosofía pro-consumidor (no dependes de pocos grandes donantes). |
| Verticales activas | ≥ 2 (luz + gas) | Validación del salto plataforma. |

> Reto a mantener vivo: si los hitos de funnel suben pero el de "€ ahorrados" no, **estamos creciendo en uso sin cumplir la misión** y hay que parar a investigar. Las métricas de uso son medios, no fines.

---

## Restricciones conocidas

### 1. Recursos humanos — el tiempo del fundador es la restricción más dura

El proyecto se desarrolla como **side-project del fundador (Iker)** sin equipo full-time dedicado. **El tiempo disponible del fundador es la restricción dominante** y condiciona el ritmo del roadmap. No hay financiación externa, no hay presión de inversores, pero tampoco hay capacidad de paralelizar trabajo. La prioridad por foco (una sola decisión a la vez) es necesidad, no preferencia.

### 2. Regulación — RGPD se activa con V2

Mientras la plataforma es V1 (sin registro, sin auth, sin datos del usuario), las obligaciones de RGPD son mínimas. **En el momento que se añada registro con email (V2, dentro de los 12 meses)**, el proyecto queda sujeto a RGPD plenamente y necesita:

- Política de privacidad publicada y vinculante.
- Base legal explícita para el tratamiento (consentimiento del usuario, granular).
- Procesos operativos para derechos ARSULIPO (acceso, rectificación, supresión, limitación, portabilidad, oposición).
- Procedimiento de notificación de brechas a AEPD en menos de 72h.
- Encargados de tratamiento (si se usa proveedor de email) con contrato DPA firmado.

Restricción real de tiempo y posiblemente coste (asesoría legal puntual). **No es opcional.**

### 3. Donaciones — figura legal pendiente de definir

Aceptar donaciones (objetivo a 12m: 5.000 €) **exige decidir bajo qué figura legal se reciben antes del primer euro:**

- **Persona física** — declaración en IRPF (rendimientos del trabajo o donaciones), topes prácticos.
- **Asociación sin ánimo de lucro** — constituirla (estatutos, NIF, alta en registro), órganos de gobierno, contabilidad. Es la opción más alineada con la filosofía pro-consumidor del proyecto, pero el coste de constitución y mantenimiento no es cero (~300-600€ inicial + tiempo).
- **Empresa (SL)** — obligaciones contables y fiscales más exigentes, no encaja con un modelo de donaciones.

**Decisión a tomar antes de habilitar la primera vía de donación.**

### 4. Dependencias técnicas críticas — punto único de fallo en CNMC

Las restricciones técnicas heredadas del [CLAUDE.md del producto](../../../CLAUDE.md) condicionan el riesgo operativo:

- **API CNMC interna y no documentada.** Puede cambiar formato o restringirse sin previo aviso. **Mitigación**: formalizar contacto con `info.comparador@cnmc.es`. Hasta entonces, dependencia con riesgo de cierre unilateral.
- **Cobertura limitada a suministros ≤15 kW.** Excluye comercio mediano y grandes consumidores — define el mercado direccionable.
- **Dependencia de la calidad del QR generado por la comercializadora.** Si una eléctrica deja de emitirlo o lo emite mal, esos usuarios pierden el flujo principal.
- **Scraping complementario de comercializadoras**: riesgo de bloqueo si una compañía detecta y restringe (legítimamente desde su lado). Política de scraping ético obligatoria.

> *Mitigaciones planificadas como acciones del roadmap — ver [04-acciones-coherentes/roadmap-impacto.md](04-acciones-coherentes/roadmap-impacto.md).*

### 5. Marca y propiedad intelectual — pivote AhorraLuz → AhorraCasa

**Hallazgo del análisis OEPM/web (2026-05-19):** la marca verbal "AhorraLuz" presenta un ecosistema saturado de nombres muy similares operativos en España — [ahorroluz.net](https://ahorroluz.net/), [ahorraluz.org](https://ahorraluz.org/), [ahorreluz.es](https://www.ahorreluz.es/), [ahorraluzonline.es](https://www.ahorraluzonline.es/), [app Google Play](https://play.google.com/store/apps/details?id=com.simple4droid.ahorraluz). El dominio `.com` está en venta por **9.440 €** [[TopDomainer](http://ahorraluz.com/es/)] — inaccesible. Riesgo medio-alto de oposición OEPM por similitud fonética con marcas existentes.

**Decisión tomada:** la marca verbal pública de la plataforma será **AhorraCasa**, alineada con el alcance multi-vertical declarado (luz + gas + combustible + banca = toda la casa) y con un espacio competitivo en España mucho más limpio (solo [AhorraCasa Colombia / Compensar](https://corporativo.compensar.com/vivienda/compra-de-vivienda/ahorra-casa), no operativa en España por territorialidad). **AhorraLuz V1 sigue siendo el nombre del módulo técnico de electricidad dentro de la plataforma AhorraCasa.**

**Plan de marca:**

| Acción | Cuándo | Coste | Responsable |
|---|---|---|---|
| Comprobar disponibilidad y comprar dominios `ahorracasa.es` y `ahorracasa.com` | **Esta semana** | ~25 €/año combinado | Iker |
| Búsqueda manual en [Localizador OEPM](https://consultas2.oepm.es/LocalizadorWeb/jsp/busquedaDenominacion.jsp): `AhorraCasa`, `Ahorra Casa`, `AhorroCasa` en clases 35 y 42 | **Esta semana** | 0 € | Iker |
| Si limpio en OEPM: registrar marca verbal **AhorraCasa** en clases 35 (publicidad/comparadores) + 42 (servicios tecnológicos) | Próximo mes | **~207 €** vía telemática (125,36 € + 81,21 €) [[Tasas OEPM 2026](https://www.oepm.es/export/sites/portal/comun/documentos_relacionados/PDF/TASAS_y_PRECIOS_PUBLICOS.pdf)] | Iker |
| Si entra vertical banca/hipotecas en 12-24m: añadir clase 36 | Cuando aplique | +81,21 € | Iker |
| Migración pública de marca (web, redes, comunicación) AhorraLuz → AhorraCasa | Antes de tracción real (Q1-Q2) | Tiempo, no €€ | Iker |

**Plazo de registro OEPM:** 4-6 meses sin oposiciones, 6-8 meses general [[Cohen y Aguirre](https://cohenyaguirre.es/cuanto-cuesta-registrar-una-marca-comercial-tasas)].

**Tradeoff aceptado:** Renunciamos a la continuidad con la identidad de AhorraLuz V1 a cambio de defensa legal limpia y coherencia con la visión multi-vertical. El coste del pivote es bajo ahora; sería alto a 12-24m con usuarios registrados.

---

## North Star metric

**Decisiones informadas servidas / mes**

### Definición

Número de eventos mensuales en los que la plataforma entrega al usuario una **decisión tarifaria útil**:

- **QRs escaneados con veredicto entregado** — el usuario completó el escaneo y recibió un resultado claro:
  - "Puedes ahorrar X € cambiando a la tarifa Y"
  - "Tu tarifa actual ya es la óptima del mercado"
- **Alarmas accionables enviadas** — usuarios con email registrado que reciben una notificación porque ha aparecido una oferta con ahorro **> 50 €/año** sobre su tarifa actual.

### Cómo se calcula

```
decisiones_informadas_servidas(mes) =
    Σ (QRs escaneados con veredicto entregado al usuario)
  + Σ (alarmas accionables enviadas a usuarios con email registrado)
```

**Excluye:** QRs fallidos, errores de parseo, abandonos antes de ver veredicto, notificaciones por debajo del umbral de ahorro, duplicados del mismo usuario en una ventana de 24h.

### Por qué esta y no otra

Captura **valor informativo entregado**, que es lo que la plataforma promete. Cuenta tanto al usuario que descubre que puede ahorrar como al que confirma que su tarifa ya es óptima — ambos son valor real. No premia ruido (QRs fallidos, comparativas que el usuario nunca termina de ver).

Es **leading** del outcome principal (más decisiones servidas → más usuarios pagando lo justo agregado), **accionable** (la plataforma puede optimizar tasa de éxito de escaneo, calidad de veredicto, oportunidad de alarmas) y **observable** sin coste de instrumentación adicional (telemetría directa).

### Umbrales — qué define "estamos sanos"

- **Mes 1-6 (V1 luz pura, sin alarmas):** ≥ 500 decisiones servidas/mes al cierre del semestre.
- **Mes 6-12 (V2 con email + alarmas + gas activo):** ≥ 2.500 decisiones servidas/mes al cierre del año, con **al menos un 30% provenientes de alarmas** (señal de que el set-and-forget funciona).
- **Composición saludable a 12m:** ratio cercano a 40% QRs nuevos / 30% QRs recurrentes / 30% alarmas. Si las alarmas no escalan, la plataforma no ha completado su salto V1→V2.

---

## Tradeoffs y decisiones

> Decisiones explícitas tomadas en esta visión, con la alternativa descartada y la razón. Si en el futuro queremos revertir alguna, este es el lugar donde mirar primero.

1. **Foco V1 en usuario digital adulto 28-55, no en +55 no-digital.**
   *Alternativa descartada:* servir a ambos perfiles a la vez con el mismo producto.
   *Razón:* el +55 no-digital exige asistencia humana / flujo simplificado, lo que rompe el stack 100% frontend. Se aborda después con producto adaptado, con aprendizajes de V1.

2. **Modo "notificar + asistir", no "ejecutar el cambio por el usuario".**
   *Alternativa descartada:* la plataforma actúa por el usuario con poder notarial digital / integraciones con comercializadoras.
   *Razón:* ejecutar exige representación legal, datos personales, integración con comercializadoras y un nivel de confianza que un comparador joven no tiene. Mantiene stack frontend, barrera de confianza baja, sin RGPD pesado en V1.

3. **Outcome principal económico, no empoderamiento.**
   *Alternativa descartada:* poner el empoderamiento del usuario ("aprende que cambiar es fácil") como nodo raíz del OST.
   *Razón:* el outcome económico es medible, objetivo y defensible. El empoderamiento queda como outcome secundario que aparece naturalmente cuando el principal se cumple.

4. **Marca pública pasa a AhorraCasa, AhorraLuz V1 queda como módulo técnico.**
   *Alternativa descartada:* defender la marca AhorraLuz a 12 meses.
   *Razón:* el ecosistema de nombres similares en España hace que AhorraLuz tenga riesgo medio-alto de oposición OEPM y el `.com` está en venta por 9.440 €. AhorraCasa además se alinea con la visión multi-vertical (luz + gas + combustible + banca). El pivote es barato ahora y caro después.

5. **North star = decisiones informadas servidas/mes, no € ahorrados/mes.**
   *Alternativa descartada:* "€ totales ahorrados a usuarios" como north star.
   *Razón:* € ahorrados es difícil de medir sin verificar el cambio real del usuario (mecanismo de captura costoso, sesgo de auto-reporte). "Decisiones informadas servidas" captura valor entregado (incluyendo la confirmación al usuario que ya tiene la mejor tarifa) y es medible directamente con telemetría. Se puede evolucionar a € ahorrados cuando madure la instrumentación.

6. **Sostenibilidad económica vía donaciones, no vía comisiones de comercializadoras.**
   *Alternativa descartada:* aceptar comisión por lead de comercializadoras (modelo de Selectra et al.).
   *Razón:* es el moat estructural. Sin neutralidad económica no hay diferenciación creíble y la plataforma se vuelve indistinguible del resto. Renunciamos a ingresos potencialmente grandes a cambio de defensa estructural única.

7. **Solo suministros ≤ 15 kW (residencial y pequeño comercio).**
   *Alternativa descartada:* incluir comercio mediano y grandes consumidores.
   *Razón:* lo impone la cobertura de la API CNMC pública. Acota el mercado direccionable pero es inherente a la fuente de datos institucional neutral.

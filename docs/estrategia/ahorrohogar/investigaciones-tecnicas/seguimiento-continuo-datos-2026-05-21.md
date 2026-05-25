# Informe técnico: Seguimiento continuo de datos energéticos sin reescaneo de QR

**Fecha:** 2026-05-21
**Origen:** investigación lanzada en paralelo durante la sub-fase 3.4 (user research) del diagnóstico, motivada por la reflexión del fundador sobre "convertirnos en gestor continuo de los consumos del hogar" (parking-de-ideas.md sección G).
**Estado:** informe completo. Pendiente de validación experimental en algunos puntos (ver sección final).

> Todas las afirmaciones llevan fuente inline `[[Nombre](URL)]` siguiendo la regla dura de trazabilidad del proyecto.

---

## Resumen ejecutivo

**SÍ es viable** obtener seguimiento continuo del hogar sin reescaneo mensual de QR. El mecanismo dominante en España es **Datadis**, la plataforma de las distribuidoras (29 M consumidores) que ofrece curva horaria, contrato y potencia máxima vía API privada con autenticación NIF/password o NIF + autorización de terceros [[Datadis FAQs](https://dev.datadis.es/faqs)] [[Iberdrola España — Datadis](https://www.iberdrolaespana.com/about-us/business-lines/smart-grids-spain/datadis)]. Es lo que ya usan **Hello Watt** y **Clevergy** para ofrecer monitorización continua a sus usuarios [[Hello Watt — Control consumo](https://www.hellowatt.es/control-consumo/)] [[Clevergy — Integración Datadis](https://clever.gy/integracion-con-datadis-conociendo-tu-consumo-electrico/)].

El reciente **Real Decreto 88/2026** consolida al Operador del Sistema (REE) como *"punto único de acceso a datos del cliente final"*, transponiendo parcialmente la Directiva (UE) 2019/944 — el marco regulatorio jugará a favor a medio plazo [[BOE-A-2026-3212](https://www.boe.es/buscar/act.php?id=BOE-A-2026-3212)] [[SmartGridsInfo — RD 88/2026](https://www.smartgridsinfo.es/2026/02/19/modernizacion-sistema-electrico-proteccion-consumidor-despliegue-agregador-independiente-ejes-real-decreto-88-2026)].

**Bloqueador para AhorraCasa**: el stack 100% frontend NO es viable para Datadis. Requiere registro empresarial con certificado digital, autenticación con credenciales del usuario y previsiblemente sin CORS habilitado — obliga a backend mínimo. **Esto rompe la filosofía actual** de "sin servidor, sin datos del usuario" del producto V1 y exige constituir entidad jurídica antes de operar.

---

## Top 3 opciones por viabilidad

### 1. Datadis API privada con autorización de terceros (la opción "industria")

**Mecanismo:** AhorraCasa se registra como empresa en `datadis.es/registry` (requiere certificado digital). El usuario entra en Datadis con su DNI, va a *"Usuarios autorizados"* y autoriza el NIF de AhorraCasa para sus CUPS, con fecha de validez [[Wiki Datadis — wattabit](https://wattabit.com/wiki/wiki-datadis/)]. Luego AhorraCasa pide token vía `/nikola-auth/tokens/login` y consulta `/api-private/api/get-supplies`, `get-consumption-data`, `get-max-power` con el parámetro `authorizedNif` [[MrMarble/datadis GitHub](https://github.com/MrMarble/datadis)].

**Pros:**
- Histórico oficial completo (curva horaria + potencia + contrato).
- Cubre todos los distribuidores.
- Gratis.
- Refrescable en cualquier momento — sin reescaneo manual.

**Contras:**
- Rompe stack frontend-only (necesita backend para custodiar credenciales/tokens y para sortear CORS).
- Fricción de onboarding: usuario sale de la app y autoriza en Datadis.
- Existe alerta de ACIE de que el modelo de gobernanza de Datadis **no tiene base regulatoria sólida** [[ACIE — alerta Datadis](https://acie.org.es/acie-alerta-que-la-plataforma-de-datos-datadis-no-cumple-la-regulacion-vigente/)].

### 2. Datadis con credenciales del usuario (modelo Hello Watt)

**Mecanismo:** El usuario introduce su DNI+contraseña de Datadis directamente en AhorraCasa; la app obtiene token Bearer y consulta su propio CUPS [[Hello Watt — Seguimiento consumo](https://www.hellowatt.es/seguimiento-consumo-energetico/)].

**Pros:**
- Onboarding más rápido (no necesita ir a Datadis a autorizar).
- Acceso al mismo dataset que opción 1.

**Contras:**
- Pedirle al usuario su contraseña de Datadis es **anti-patrón de seguridad** y problemático bajo RGPD (custodia de credenciales de un servicio público regulado).
- Igualmente requiere backend.

### 3. SIPS de la CNMC (acceso individualizado)

**Mecanismo:** API `https://api.cnmc.gob.es/verticales/v1/SIPS/consulta/v1/SIPS2_CONSUMOS_ELECTRICIDAD.csv?cups=...` devuelve histórico mensual por periodos P1–P6 [[CNMC Sede — API SIPS](https://sede.cnmc.gob.es/documentacion/sistemas-verticales/sips-sistema-de-informacion-de-puntos-de-suministro-de-gas-y-electricidad/api-de-consulta-individualizada)].

**Pros:**
- Acceso desde el regulador, no de las distribuidoras.
- Granularidad mensual suficiente para comparar tarifas.

**Contras:**
- Acceso **restringido a comercializadores autorizados** con ámbito geográfico. AhorraCasa, al no ser comercializadora, **no califica**.
- Los datos del SIPS están considerados expresamente personales [[CNMC SIPS info](https://www.cnmc.es/ambitos-de-actuacion/energia/sips)].

---

## Lo que NO funciona

- **Las comercializadoras (Iberdrola, Endesa, Naturgy) no ofrecen API OAuth pública** para terceros — solo apps propietarias y libs no oficiales por scraping ([`hectorespert/python-oligo`](https://github.com/hectorespert/python-oligo), [`zoilomora/iberdrola`](https://github.com/zoilomora/iberdrola)).
- **No existe "PSD2 para energía" en España**; la Directiva 2019/944 lleva 5+ años sin transposición completa y la Comisión Europea ya ha apercibido a España [[Newtral — directiva mercado eléctrico](https://www.newtral.es/directiva-mercado-electrico-comun/20241210/)].

---

## Riesgo regulatorio principal (RGPD)

El **Tribunal Supremo ha confirmado** que los datos de consumo energético son **datos personales** porque pueden revelar patrones de presencia/ausencia en el hogar [[Noticias Jurídicas — TS datos energéticos](https://noticias.juridicas.com/actualidad/noticias/14294-ts:-los-datos-de-consumo-energetico-domesticos-pueden-ser-considerados-datos-de-caracter-personal-/)]. Para una plataforma de asesoramiento como AhorraCasa:

- Se requiere **consentimiento explícito e informado** detallando todos los usos [[Ayudaley — datos energéticos](https://ayudaleyprotecciondatos.es/2019/08/29/datos-consumo-energetico-datos-personales/)].
- Obligación de **designar DPO** al tratar datos a escala [[Prodat — consumo energético](https://www.prodat.es/blog/podemos-considerar-los-datos-de-consumo-energetico-como-datos-de-caracter-personal/)].
- Contrato de **encargado de tratamiento** si hay terceros (hosting, analytics).
- **Registro de actividades de tratamiento** + política de privacidad explícita + base legal sólida (consentimiento del art. 6.1.a RGPD).

**Incompatible con el espíritu "sin backend, sin datos del usuario" del producto V1 actual.**

---

## Lo que NO sabemos todavía y requiere más investigación

1. **CORS de Datadis**: si la API privada permite llamadas desde origen `*`. Hay que probar `OPTIONS` directo contra `datadis.es/nikola-auth/tokens/login`. Si no hay CORS, backend es obligatorio.
2. **Rate limits y SLA de Datadis**: las búsquedas no devuelven límites publicados de peticiones/día por NIF autorizado ni garantías de disponibilidad.
3. **Frecuencia de actualización real**: ¿con qué retraso llegan los datos del distribuidor a Datadis? Anecdóticamente se cita 24–72h pero no hay SLA oficial encontrado.
4. **Coste/proceso del registro empresarial**: aparentemente gratis, pero requiere certificado digital de empresa (FNMT) — implica constituir entidad jurídica, lo que **excluye operar como side-project con persona física**.
5. **Orden ministerial pendiente del RD 88/2026**: definirá el "punto único de acceso a datos" gestionado por REE. Podría hacer obsoleto o redundante el actual Datadis. Sin fecha publicada.
6. **Política exacta de Hello Watt/Clevergy**: ¿custodian contraseñas de Datadis o usan flujo de autorización de terceros? Determina el patrón "menos malo".

---

## Implicaciones para AhorraCasa (síntesis para decisión estratégica)

Esta investigación **no toma decisión** — la decisión va a la **política guía**. Pero deja sobre la mesa:

| Camino | Implicación |
|---|---|
| **A — Lean V1+V2** (mantener filosofía actual) | Sin gestor continuo. Re-escaneo manual cada N meses. Donaciones cubren el coste (~500-1.000 €/año). Outcome más limitado pero coherente con stack actual. |
| **B — Salto a V3 con Datadis** | Constituir entidad jurídica (asociación o SL) + backend + DPO + cumplimiento RGPD. Habilita el gestor continuo de verdad. Coste anual estimado mínimo **2.000-5.000 €** (cálculo propio: backend hosting + asesoría legal puntual + alta empresarial + DPO externo si la base de usuarios supera el umbral). Outcome mucho más fuerte (set-and-forget real) pero rompe el lean del proyecto. |

**Esta decisión condiciona:**
- El modelo económico (si A, donaciones es suficiente; si B, hace falta más).
- La política guía (oportunidades elegidas vs descartadas).
- El roadmap (V2 → V3 con Datadis a 12-24 meses si elegimos B).
- La constitución legal del proyecto (si B, asociación o SL antes de finales de 2026).

---

## Fuentes consultadas

- [Datadis — FAQs](https://dev.datadis.es/faqs)
- [Iberdrola España — Datadis](https://www.iberdrolaespana.com/about-us/business-lines/smart-grids-spain/datadis)
- [aelec — Datadis](https://aelec.es/datadis/)
- [Datadis — portal principal](https://datadis.es/)
- [Wiki Datadis — wattabit](https://wattabit.com/wiki/wiki-datadis/)
- [MrMarble/datadis — cliente Python no oficial](https://github.com/MrMarble/datadis)
- [Manual API Privada y Agregada Datadis — ICAEN](https://icaen.gencat.cat/web/.content/20_Energia/210_auditoriesenergetiques/enllacos/MANUAL-API-PRIVADA-Y-AGREGADA.pdf)
- [Clevergy — Integración Datadis](https://clever.gy/integracion-con-datadis-conociendo-tu-consumo-electrico/)
- [Hello Watt — Control consumo](https://www.hellowatt.es/control-consumo/)
- [Hello Watt — Seguimiento consumo energético](https://www.hellowatt.es/seguimiento-consumo-energetico/)
- [Enerlence — Datadis curva consumo](https://enerlence.com/2022/01/28/datadis-visualiza-curva/)
- [ACIE — alerta sobre Datadis no cumple regulación](https://acie.org.es/acie-alerta-que-la-plataforma-de-datos-datadis-no-cumple-la-regulacion-vigente/)
- [CNMC Sede — API SIPS consulta individualizada](https://sede.cnmc.gob.es/documentacion/sistemas-verticales/sips-sistema-de-informacion-de-puntos-de-suministro-de-gas-y-electricidad/api-de-consulta-individualizada)
- [CNMC — Sistema Información Puntos Suministro (SIPS)](https://www.cnmc.es/ambitos-de-actuacion/energia/sips)
- [BOE — Directiva 2019/944](https://www.boe.es/buscar/doc.php?id=DOUE-L-2019-81031)
- [BOE-A-2026-3212 — Real Decreto 88/2026](https://www.boe.es/buscar/act.php?id=BOE-A-2026-3212)
- [Periscopio Fiscal y Legal — RD 88/2026](https://periscopiofiscalylegal.pwc.es/real-decreto-88-2026-de-11-de-febrero-por-el-que-se-aprueba-el-reglamento-general-de-suministro-comercializacion-y-agregacion-de-energia-electrica/)
- [SmartGridsInfo — RD 88/2026](https://www.smartgridsinfo.es/2026/02/19/modernizacion-sistema-electrico-proteccion-consumidor-despliegue-agregador-independiente-ejes-real-decreto-88-2026)
- [Newtral — España sin transponer directiva mercado eléctrico](https://www.newtral.es/directiva-mercado-electrico-comun/20241210/)
- [hectorespert/python-oligo — cliente i-DE no oficial](https://github.com/hectorespert/python-oligo)
- [zoilomora/iberdrola — integración Iberdrola](https://github.com/zoilomora/iberdrola)
- [Noticias Jurídicas — TS: datos energéticos son personales](https://noticias.juridicas.com/actualidad/noticias/14294-ts:-los-datos-de-consumo-energetico-domesticos-pueden-ser-considerados-datos-de-caracter-personal-/)
- [Ayudaley — datos consumo energético personales](https://ayudaleyprotecciondatos.es/2019/08/29/datos-consumo-energetico-datos-personales/)
- [Prodat — consumo energético como datos personales](https://www.prodat.es/blog/podemos-considerar-los-datos-de-consumo-energetico-como-datos-de-caracter-personal/)
- [Ecoserveis — privacidad y energía](https://ecoserveis.net/es/privacidad-y-energia-tu-consumo-electrico-tambien-es-un-dato-personal/)

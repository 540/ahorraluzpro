# Parking de ideas

> Ideas de funcionalidad / producto / negocio que han surgido fuera del momento adecuado del método. **No se descartan, se posponen.**
>
> Estas ideas se reevalúan cuando estemos en `/init-producto oportunidades` (construcción del OST), una vez tengamos diagnóstico + política guía. En ese momento, cada idea se contrasta con:
>
> - ¿Ataca una oportunidad real del diagnóstico?
> - ¿Es coherente con la política guía (oportunidades elegidas vs descartadas)?
> - ¿Tiene assumption tests claros?
>
> Las que no pasen esos filtros se documentan como descartadas con razón en `03-politica-guia.md`.

## Reglas para añadir ideas aquí

- Una idea por línea o por bloque corto.
- Si la idea ya tiene contexto (origen, motivación), apuntarlo.
- **No se entra en debate aquí.** Solo apuntar. El debate llega en el OST.

## Ideas pendientes de evaluar en el OST

> Marcadas `[IA]` cuando el origen es Claude (no Iker). Permite filtrar en el OST: las propias suelen llevar más contexto, las propuestas requieren más justificación para promover.

### A. Más profundidad dentro del módulo de electricidad (no nuevas verticales)

- `[IA]` **Análisis de potencia contratada óptima.** ¿El usuario tiene contratada más potencia (kW) de la que demanda realmente? Con el `pmaxP1`-`pmaxP6` del QR ya tienes la potencia máxima demandada — podemos detectar sobrecontratación. Ahorro fácil sin cambiar de compañía. Ya mencionado como V3 en CLAUDE.md raíz.
- `[IA]` **Recomendación de autoconsumo solar.** Con el consumo anual + código postal + zona climática, se puede estimar payback de instalación solar. Es un "siguiente paso" natural para usuarios que ya optimizaron tarifa y siguen queriendo ahorrar.
- `[IA]` **Aviso de precio spot (PVPC horario).** Para usuarios en PVPC, notificar horas valle del día siguiente ("mañana 14h-16h precio luz mínimo, programa tu lavadora"). Fuente: E·SIOS / api.preciodelaluz.org. Convierte la app de uso anual a uso recurrente sin esperar a alarma de tarifa.

### B. Modelo de negocio / sostenibilidad económica

- `[IA]` **Partnerships con OCU / FACUA / asociaciones de consumidores.** No comerciales — refuerza posicionamiento neutral y abre canal de adquisición sin comisiones. Podría incluir co-marketing y validación pública de la neutralidad.
- `[IA]` **Subvenciones de transición energética.** Programas autonómicos / IDAE para herramientas pro-consumidor energético. Sostenibilidad económica sin perder neutralidad.
- `[IA]` **Modelo "dato agregado, no individual" para impacto.** Publicar informes trimestrales con datos agregados (€ ahorrados a la sociedad, comercializadoras más caras por CP, distribución de tarifas) — refuerza marca como "el neutral" y puede generar prensa propia. **Cuidado RGPD:** solo agregados, nunca a nivel de usuario individual.

### C. Acceso al perfil secundario (+55 no-digital) sin romper el stack

- `[IA]` **Modo "factura subida" (foto) como fallback al QR.** Para usuarios cuyo PDF/foto de factura no escanea bien el QR. OCR client-side de los datos del QR impreso. Mantiene 100% frontend.
- `[IA]` **Versión "simple mode" del flujo.** Mismo motor, UI con tipografía grande, vocabulario sin tecnicismos, una sola decisión por pantalla. Probaría servir al +55 sin asistencia humana.
- `[IA]` **Kioscos físicos en bibliotecas / centros cívicos / Cruz Roja.** El usuario no digital lleva su factura impresa; el kiosco escanea, imprime el resultado. Llave en mano con organizaciones que ya sirven a ese perfil. Externaliza la operación, mantiene el stack frontend.

### D. Funcionalidad transversal de plataforma (multi-vertical)

- `[IA]` **Dashboard único "salud económica del hogar".** Una vez haya luz + gas + combustible activos, vista consolidada de € ahorrados totales y € pendientes por optimizar. La promesa multi-vertical hecha producto.
- `[IA]` **Optimización combinada luz + gas.** Detectar si conviene contratar conjuntamente con misma comercializadora (descuentos por bundle) o separadas. Aprovecha el endpoint `publico/ofertas/conjuntas` ya documentado en CLAUDE.md.

### E. Social / viral

- `[IA]` **"Comparte tu ahorro" — social proof anónimo.** El usuario puede compartir una tarjeta tipo "He ahorrado 187 €/año con AhorraCasa" en redes, con CTA al producto. Sin datos personales, solo el € y la categoría. Canal de adquisición orgánico.
- `[IA]` **Comparativa con vecinos/zona.** "Tu hogar paga un 18% más que la media de tu código postal con perfil similar." Activa la motivación al cambio. Requiere base de datos agregada de tarifas escaneadas por CP.

### F. Posicionamiento institucional

- `[IA]` **Reporte automático de QRs mal generados a CNMC.** Si detectamos que una comercializadora emite QRs defectuosos, generar incidencia automática. Refuerza posicionamiento pro-consumidor y crea presión regulatoria. Coste técnico bajo, valor reputacional alto.

### H. Cluster SEO temático — refinado tras informe detallado de keywords (2026-05-22)

> **Versión refinada** tras el [informe de keywords detallado](investigaciones-tecnicas/keywords-detalle-2026-05-22.md). La versión inicial de esta sección era una intuición; ahora hay top 10 priorizado con bandas de volumen y tráfico anual potencial estimado en 170-470K visitas/año si se rankea top-3.

- `[IA]` **Cluster temático defensivo: "QR + potencia contratada + diagnóstico personal de consumo"** — construido alrededor del core funcional del producto.

  **Top 10 keywords priorizadas** (volumen × intención × dificultad):

  | # | Keyword | Tráfico anual potencial (top-3) | Por qué defendible |
  |---|---|---|---|
  | 1 | bajar potencia contratada | 50-120K | Comercializadoras tienen conflicto de interés |
  | 2 | calculadora potencia contratada | 30-70K | Herramienta tangible con datos del QR real |
  | 3 | QR factura luz | 6-30K | Diferencial absoluto del producto |
  | 4 | qué potencia contratar | 30-90K | El producto recomienda con consumo real |
  | 5 | código QR factura electricidad | 3-12K | Intención exacta = producto |
  | 6 | reducir potencia contratada | 18-48K | Menos competencia que "bajar" |
  | 7 | sobrecontratación potencia | 1-3K | Nicho real — crea categoría |
  | 8 | comparador CNMC | 30-90K | Capa amigable sobre el oficial |
  | 9 | cómo sé si pago mucha luz | 3-12K | Intención diagnóstico |
  | 10 | potencia óptima hogar | 1-3K | Refuerza cluster |

  **Tráfico agregado potencial top-10 rango medio: ~170-470K visitas/año.** Top-5 razonable: ~80-220K.

  **Datos que sostienen la apuesta**: el **63% de hogares tiene 1,11 kW de sobrecontratación** (Panel Hogares CNMC 2023 [[FacturaAhorro](https://facturahorro.com/como-bajar-potencia-contratada-espana-2026/)]), ~45 €/año por tramo bajado. **El cluster de potencia tiene volumen, tendencia al alza y competidores con conflicto de interés** — combinación rara en SEO.

- `[IA]` **Términos a NO atacar** (saturados, pelea perdida): comparador luz, comparador luz gas, ahorrar luz, precio luz hoy, PVPC vs mercado libre, qué compañía de luz es más barata. Dejarlos a Selectra/Roams/Kelisto/marcas.

- `[IA]` **Calendario estacional de adquisición** alineado con los dos picos de búsqueda documentados (enero-febrero por factura post-Navidad+frío, junio-agosto por aire acondicionado) + triggers regulatorios ad hoc. Si AhorraCasa hace prensa, alianzas o esfuerzo editorial, concentrarlo en estos momentos.

- `[IA]` **Inversión sugerida en SEO masticada**:
  - **Fase 1 (V1, bajo coste):** 5-10 artículos editoriales de calidad cubriendo el cluster + landing dedicada a "calculadora potencia contratada" con datos del QR. Realizable con tiempo de fundador + IA.
  - **Fase 2 (post-tracción mínima):** validar Semrush 1-2 meses (~120-240 €) para confirmar volúmenes exactos y refinar la inversión.
  - **Fase 3 (si V1 traciona):** ampliar cluster a "PVPC cuartohorario", "TAM (Término de Ajuste de Mercado)" — emergentes desde sep 2025 con hueco editorial.

### G. Reflexiones del fundador del 2026-05-21 (Iker)

- `[Iker]` **Capa social tipo Strava — el éxito no son los datos, es lo social.** Aunque el problema es individual/del hogar, explorar si hay forma de añadir un componente social que viralice. Posibles ángulos: ranking anónimo "tu hogar está en el percentil X de tu código postal" + "comparte tu ahorro" con tarjeta visual + comunidad pequeña pública de usuarios que reportan ahorros conseguidos. **Riesgo:** forzar gamificación en un dominio íntimo (factura del hogar) puede chirriar — validar con usuarios. **Origen:** reflexión Iker, conexión con observación de Strava como referencia.

- `[Iker]` **"Compartir la web debe ser MUY fácil"** — fricción de share casi cero como palanca crítica del boca a boca. Coincide con la oportunidad OJ-2 del [customer journey](01-diagnostico/04-user-research/customer-journeys.md) (canal de exposición NO-SEO). Concretizar en: (a) Web Share API nativa al final del veredicto, (b) tarjeta visual generada automáticamente con el ahorro detectado (sin datos personales), (c) URL corta tipo "ahorracasa.es/share/XXX" sin tracking invasivo, (d) ningún paywall o gate de email para compartir.

- `[Iker]` **Convertirnos en "gestor continuo de los consumos del hogar"** — más allá del cambio puntual de tarifa, vigilar continuamente y proponer:
  - Ajuste de potencia contratada (idea ya en sección A, ahora con motivación ampliada).
  - Detección de consumos anómalos respecto al histórico.
  - Alertas predictivas ("si sigues consumiendo así, este mes pagarás X €").
  - Histórico visual de consumos y de cambios de tarifa.
  - Recomendaciones por cambio de estación / hábitos.

  **Resultado de la investigación de viabilidad (2026-05-21):** SÍ es técnicamente viable vía **Datadis** (lo que ya usan Hello Watt y Clevergy). Pero **bloquea 3 cosas del proyecto actual**: (a) rompe el stack 100% frontend (necesita backend), (b) exige constituir entidad jurídica con certificado FNMT (no operable como persona física), (c) los datos de consumo son **datos personales según Tribunal Supremo** → cumplimiento RGPD completo (DPO, encargado de tratamiento). Coste anual estimado mínimo: **2.000-5.000 €** (vs ~500 €/año del modelo lean actual). **Informe técnico completo**: [investigaciones-tecnicas/seguimiento-continuo-datos-2026-05-21.md](investigaciones-tecnicas/seguimiento-continuo-datos-2026-05-21.md).

  **Decisión que esto fuerza** en la política guía: ¿AhorraCasa se queda en **Lean V1+V2** (sin gestor continuo, donaciones cubren) o salta a **V3 con Datadis** (gestor continuo real pero entidad jurídica + backend + DPO)? No se decide aquí — se trabaja en `/init-producto politica` tras cuadrar el modelo económico.

## Ideas movidas al OST

> Cuando una idea de arriba se promueve a una oportunidad/solución del OST, se mueve aquí con referencia al archivo destino.

- *(vacío)*

## Ideas descartadas

> Cuando una idea se descarta porque no encaja con la política guía, se mueve aquí con la razón.

- *(vacío)*

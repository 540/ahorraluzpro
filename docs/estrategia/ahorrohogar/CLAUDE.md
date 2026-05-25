# CLAUDE.md — ahorrohogar

> Contexto del proyecto para futuras conversaciones con IA. Este archivo se actualiza según avanza el proyecto.

## Qué es este proyecto

> TODO: Una frase que captura el proyecto. (Se rellena automáticamente tras la entrevista de visión.)

## Estado actual

Creado el 2026-05-18. Visión cerrada el 2026-05-19. **Diagnóstico cerrado el 2026-05-22**. Fase actual: **Modelo económico (pendiente de arrancar con `/init-producto modelo`)**.

**Alcance:** plataforma multi-vertical de ahorro del hogar (luz → gas → combustible → banca). AhorraLuz V1 (comparador de luz vía QR + API CNMC) es el módulo técnico de electricidad dentro de la plataforma. **Marca pública de la plataforma: AhorraCasa** (decidida en visión tras análisis OEPM — ver `00-vision.md` sección Restricciones). El contexto técnico/producto de V1 está en [/CLAUDE.md](../../../CLAUDE.md) y el análisis de verticales en [docs/estrategia/verticales-ahorro-hogar.md](../verticales-ahorro-hogar.md).

> Actualizar según avance: Visión → Diagnóstico → Oportunidades → Política → Roadmap.

## Metodología

Este proyecto sigue la **metodología 540**:

1. **Visión abstracta** (norte del proyecto: problema, usuario, diferenciación, outcome)
2. **Diagnóstico** de fuera hacia dentro: mercado → contexto → competencia → usuarios → síntesis con oportunidades brutas
3. **Modelo económico** — cómo monetiza el producto (quién paga, pricing, unit economics)
4. **Política guía** (Rumelt) — decide qué oportunidades atacar y cuáles descartar
5. **Opportunity Solution Tree** (Teresa Torres) — solo sobre las oportunidades elegidas en la política: soluciones candidatas + assumption tests
6. **Roadmap de impacto** — calendariza assumption tests, centrado en oportunidades no en features
7. **Foto del estado futuro** — al final, concreta a 6m/12m/24-36m, verifica coherencia del kernel completo

## Frameworks aplicados

- **Kernel de Rumelt**: Diagnóstico → Política Guía → Acciones Coherentes
- **Opportunity Solution Tree (Teresa Torres)**: Outcome → Opportunities → Solutions → Assumption Tests
- **DHM Gibson Biddle** (referencia para ventaja competitiva): Delight, Hard to Copy, Margin Enhancing

## Estructura del proyecto

```
docs/estrategia/ahorrohogar/
├── 00-vision.md                       # Visión abstracta
├── 01-diagnostico/                    # Mercado → producto → competencia → usuarios → oportunidades
├── 02-modelo-economico.md             # Cómo monetiza el producto
├── 03-politica-guia.md                # Qué oportunidades atacamos y cuáles descartamos
├── 04-acciones-coherentes/            # OST + Proximate Objectives + Roadmap
├── 05-foto-estado-futuro.md           # Foto concreta del futuro + verificación de coherencia
└── Frameworks/                        # Referencias metodológicas
```

## Convenciones para la IA

- **Idioma**: responder siempre en español
- **Archivos**: nombres kebab-case sin acentos
- **Trazabilidad inline obligatoria (regla dura)**: TODO dato cuantitativo, porcentaje, cifra de mercado, dato de competidor, afirmación sobre comportamiento del usuario o claim sobre el sector lleva fuente inline `[[Nombre fuente](URL)]` en el mismo momento de escribirlo. Aplica también a matrices cruzadas y resúmenes — si un dato aparece dos veces, lleva fuente las dos veces (o usar footnotes Markdown `[^N]` para evitar repetición visual). Cálculos derivados se marcan como tales con cita de los inputs. Datos sin fuente se marcan como *"pendiente de fuente"* o *"estimación propia"* — nunca se inventan. *Política reforzada en sesión 2026-05-19.*
- **Entrevistador estricto**: una pregunta a la vez. Retar respuestas vagas, exigir evidencia, señalar puntos débiles explícitamente
- **No proponer ideas de primeras**: primero escuchar al usuario. Solo proponer si lo pide explícitamente o al cerrar cada sección ofrecer "modo brainstorm" opcional
- **Investigación**: usar WebSearch/WebFetch proactivamente en fases que lo requieren (mercado, competencia)
- **Trazabilidad de decisiones**: documentar tradeoffs y qué se descartó

## Comandos relevantes

- `/init-producto diagnostico` — Mercado, competencia, usuarios → oportunidades brutas
- `/init-producto modelo` — Modelo económico del producto
- `/init-producto politica` — Política guía (Rumelt): qué oportunidades atacamos
- `/init-producto oportunidades` — OST sobre las oportunidades elegidas (Teresa Torres)
- `/init-producto roadmap` — Proximate objectives + roadmap de impacto
- `/init-producto futuro` — Foto del estado futuro + verificación de coherencia
- `/init-producto sintesis` — Resumen ejecutivo

**Orden recomendado:** `diagnostico` → `modelo` → `politica` → `oportunidades` → `roadmap` → `futuro` → `sintesis`.

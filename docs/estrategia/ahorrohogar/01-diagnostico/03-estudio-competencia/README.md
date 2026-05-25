# Estudio de competencia

## ¿Para qué sirve esta carpeta?

Hacer **deep dives** por competidor para entender cómo compiten, qué hacen bien, qué hacen mal y qué podemos aprender.

## Estructura del árbol de información

```
03-estudio-competencia/
├── README.md                              ← este archivo (índice + hipótesis + resumen)
├── _template-competidor.md                ← plantilla a copiar para cada deep dive
├── resumen-competitivo.md                 ← análisis cruzado de todos los competidores
├── deep-dives/                            ← profundidad 1: análisis individual completo
│   └── {nombre-competidor}.md
└── analisis-ligero/                       ← profundidad 2 y 3: análisis abreviados / agregados
    ├── comparadores-secundarios.md        ← varios competidores menores en un archivo
    └── apps-y-sustitutos.md               ← apps móviles + sustitutos no comparadores
```

**Cuándo va cada cosa donde:**

- `deep-dives/` → un archivo por competidor cuando aporta algo estratégico distinto. Análisis completo con template íntegro.
- `analisis-ligero/` → varios competidores agrupados en un solo archivo cuando son "más de lo mismo" y duplicarían conclusiones. También para sustitutos no-comparadores (asociaciones de consumidores, blogs, comercializadoras directas, inercia).
- `resumen-competitivo.md` → al final, matriz cruzada y mapa de posicionamiento sobre el conjunto.

## Cómo hacer un deep dive completo (profundidad 1)

Para cada competidor estratégicamente distinto:

1. **Copia** `_template-competidor.md` a `deep-dives/{nombre-competidor}.md` (kebab-case, sin acentos).
2. **WebFetch** de la web principal del competidor.
3. **WebSearch** de:
   - Reviews recientes
   - Noticias de los últimos 12 meses
   - Comparativas con otros competidores
   - Quejas en redes/foros (Reddit, Trustpilot, etc.)
4. **Rellena** las secciones del template con datos y fuentes inline.
5. Al final, escribe **3-5 lecciones** que podemos aprender de ese competidor.

## Cómo hacer análisis ligero (profundidad 2 y 3)

Para competidores que replican el mismo modelo que un deep dive ya hecho, o para apps/sustitutos:

1. **Una entrada por competidor** dentro de un archivo agrupado en `analisis-ligero/`.
2. Ficha rápida + ángulo único + propiedad + modelo.
3. Sin matriz completa — solo lo que aporta valor diferencial respecto a los deep dives ya hechos.

## Cómo identificar competidores

No solo los competidores directos. Considera:

- **Competidores directos**: hacen lo mismo en el mismo mercado.
- **Competidores indirectos**: resuelven el mismo problema de otra forma (incluso con hábitos manuales).
- **Sustitutos**: cubren la misma necesidad de forma totalmente distinta.
- **New entrants**: jugadores recientes con financiación o tracción notable.

Recomendación de escalonamiento: **5-7 deep dives + análisis ligero del resto**. Hacer deep dive completo a 20+ competidores produce conclusiones redundantes.

---

## Estado actual del estudio competitivo (AhorraCasa, 2026-05-19)

### Deep dives completados ([deep-dives/](deep-dives/))

| Archivo | Competidor | Estado |
|---|---|---|
| [selectra.md](deep-dives/selectra.md) | Selectra — líder comercial (53M€/año España) | ✅ |
| [cnmc-comparador.md](deep-dives/cnmc-comparador.md) | CNMC — único neutral institucional | ✅ |
| [ocu-simulador.md](deep-dives/ocu-simulador.md) | OCU — único neutral con UX cuidada (modelo suscripción) | ✅ |
| [kelisto.md](deep-dives/kelisto.md) | Kelisto — multi-vertical (Admiral Group) | ✅ |
| [roams.md](deep-dives/roams.md) | Roams — comparador con asesor humano | ✅ |
| [iacompara.md](deep-dives/iacompara.md) | IACompara — nuevo entrante con IA | ✅ |

### Análisis ligero ([analisis-ligero/](analisis-ligero/))

| Archivo | Cubre | Estado |
|---|---|---|
| [comparadores-secundarios.md](analisis-ligero/comparadores-secundarios.md) | Rastreator, Acierto, Comparadorluz, MenosdeLuz, AhorreLuz, AhorraLuzOnline | ✅ |
| [apps-y-sustitutos.md](analisis-ligero/apps-y-sustitutos.md) | TarifaLuzHora, RedOS, Hellowatt, Mipodo, Precio Luz, FACUA, Rankia, comercializadoras directas, inercia | ✅ |

### Resumen cruzado

| Archivo | Contenido |
|---|---|
| [resumen-competitivo.md](resumen-competitivo.md) | Matriz comparativa cruzada + mapa de posicionamiento + validación H1-H4 + hipótesis emergentes H5-H7 |

---

## Hipótesis validadas en los deep dives

> Validación completa en [resumen-competitivo.md](resumen-competitivo.md).

- **H1 ✅ — Comparadores comerciales cobran comisión a las comercializadoras.** Confirmado en 8 de 8 competidores comerciales analizados. Únicas excepciones: OCU (suscripción) y CNMC (público).
- **H2 ✅ parcialmente — Sesgo en recomendaciones por incentivo económico.** Confirmado por reviews de usuarios (Roams: "solo lo que les interesa vender"), cláusulas Nación Más Favorecida (Kelisto), confusión de operadoras (Selectra). Sesgo estructural por modelo, no necesariamente mala fe.
- **H3 ✅ parcialmente — CNMC tiene UX desigual.** Bien con QR, mal sin QR. Problemas técnicos puntuales (página en blanco). Errores conceptuales documentados.
- **H4 ✅ — Ningún comparador comercial usa el QR oficial BOE como flujo de entrada.** IACompara, MenosdeLuz y AhorreLuz aceptan subida de factura (OCR) — más cerca, pero AhorraCasa es la única alternativa pública que decodifica el QR estándar sin meter la factura entera al servidor.

## Hipótesis emergentes a validar en user research (sub-fase 3.4)

- **H5 — El usuario español no sabe que el QR de su factura sirve para comparar.** Evidencia preliminar: artículos explicativos recientes en Hipertextual/Xataka. Validar en personas y journey.
- **H6 — El target 28-55 digital prefiere autoservicio en móvil antes que asesor humano.** Validar — si no se cumple, la decisión de "no ejecutar" de AhorraCasa pierde mercado.
- **H7 — El usuario que ya ha cambiado una vez es más receptivo a herramientas neutrales.** 2,7M de hogares con experiencia reciente (cambio en 2024) podrían ser el target primario inicial.

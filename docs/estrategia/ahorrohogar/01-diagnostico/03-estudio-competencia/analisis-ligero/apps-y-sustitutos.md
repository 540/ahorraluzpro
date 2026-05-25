# Análisis de apps móviles + sustitutos

> Catalogación funcional de **apps móviles del segmento energía** y **sustitutos no-comparadores** (asociaciones, blogs, comercializadoras directas, "no hacer nada"). No son competidores frontales pero ocupan espacio mental y de comportamiento del usuario.

---

## Apps móviles del segmento

| # | App | Propietario | Plataforma | Función principal | Compara tarifas | Notas |
|---|---|---|---|---|---|---|
| 1 | **TarifaLuzHora** | **Selectra** | iOS + Android | Precio PVPC en tiempo real | ✅ Vía web Selectra | Canal móvil de Selectra |
| 2 | **RedOS** | Red Eléctrica de España (REE) | iOS + Android | **Información oficial** del sistema (precio, demanda, generación) | ❌ — informativa | Oficial, neutral, sin comparador |
| 3 | **Precio Luz España** / **Precio de la Luz Ahora** | Independiente | iOS + Android | Precio PVPC por horas, alertas | ❌ — solo monitorización | "Muy visual" |
| 4 | **Hellowatt** | Hellowatt (Francia) | Android | **Análisis de consumo + contador inteligente** | Parcial | Necesita contador inteligente / acceso al perfil |
| 5 | **Mipodo "Ahorraluz"** | Mipodo | iOS + Android | Precio luz + consejos de ahorro | ❌ — informativa + consejos | **Usa el nombre "Ahorraluz"** — refuerza saturación nominal |
| 6 | **App Selectra** | Selectra | iOS + Android | Acceso a servicios del Grupo Selectra | ✅ Vía Selectra | App de marca paraguas |

### Observaciones clave

- **Las apps móviles del segmento están dominadas por monitorización de precio horario (PVPC)**, no por comparación de tarifas.
- **Ningún app móvil del segmento ofrece comparador con QR de factura** — espacio en blanco para AhorraCasa.
- TarifaLuzHora y app Selectra son **del mismo dueño** — Selectra ya tiene presencia móvil consolidada.
- RedOS (REE oficial) es **palanca de credibilidad** sin ser competencia comercial — usuarios que descargan RedOS son público objetivo de AhorraCasa (interesados en precios, dispuestos a actuar).
- Hellowatt requiere contador inteligente — mercado nicho, no compite por el usuario medio.

### Implicación para AhorraCasa

**El espacio "comparador con escaneo QR en móvil" está vacío.** Las apps móviles existentes monitorizan el precio PVPC en tiempo real (uso recurrente) pero **no comparan tarifas para tomar decisión de cambio**. AhorraCasa puede ocupar ese hueco — y lo hace de hecho con la web actual, aunque sin app móvil dedicada. **Una PWA o app ligera podría ser palanca diferencial vs Selectra/Kelisto** (que solo tienen apps de monitorización).

---

## Sustitutos no-comparadores

### 1. OCU (asociación de consumidores)

> Deep dive completo en [ocu-simulador.md](ocu-simulador.md). Mencionado aquí como referencia cruzada.

**Rol como sustituto:** prescriptor de marca (OCU recomienda → el usuario contrata directamente con la comercializadora). El usuario puede usar OCU sin necesitar un comparador comercial.

### 2. FACUA-Consumidores en Acción

| Campo | Valor |
|---|---|
| Web | [facua.org](https://facua.org) |
| Función | **Defensa del consumidor + denuncia pública** de prácticas abusivas |
| ¿Compara tarifas? | **No** — informa, denuncia, asesora |
| Modelo | Asociación, financiación por socios + ayudas públicas |

**Rol como sustituto:** voz pública de denuncia contra eléctricas y prácticas abusivas. **Reportan datos clave anualmente** (subida de la factura del usuario medio, sobrecoste por sobrecontratación, etc.) que son **citados por toda la prensa** — la fuente de datos que aparece en titulares.

**Alianza potencial con AhorraCasa**: el discurso "pro-consumidor neutral" es 100% compatible. FACUA podría **recomendar AhorraCasa** como herramienta práctica que pone en acción lo que ellos denuncian. Sin canibalización (FACUA denuncia, AhorraCasa actúa).

### 3. Rankia y blogs especializados

| Campo | Valor |
|---|---|
| Ejemplo | [rankia.com/blog/luz-y-gas](https://www.rankia.com/blog/luz-y-gas/3036348-comparativa-tarifas-luz-gas-espana) |
| Función | Foro + artículos de comparativa + recomendaciones de productos financieros |
| ¿Compara tarifas? | Editorial — publica rankings y comparativas |
| Modelo | Publicidad + afiliación + suscripción premium |

**Rol como sustituto:** **comunidad de usuarios financieramente activos** que leen comparativas y comparten experiencias. **Canal de adquisición potencial** para AhorraCasa si genera contenido auditable y útil para esa audiencia.

### 4. Comercializadoras directas (Endesa, Iberdrola, Naturgy, TotalEnergies, etc.)

| Campo | Valor |
|---|---|
| Ejemplo | endesa.com, iberdrola.es, naturgy.es, totalenergies.es, etc. |
| Función | Su propio catálogo de tarifas + cliente directo |
| ¿Compara tarifas? | Solo entre sus propias tarifas |
| Modelo | Venta directa |

**Rol como sustituto:** el usuario va a la web de su compañía actual (o de la que oye anunciada) y contrata sin comparar fuera. **Es el sustituto más usado en la práctica** después de "no hacer nada". Las comercializadoras invierten masivamente en marketing y SEO de marca propia.

### 5. Redes sociales / Reddit / Twitter / Foros / "Cuñado"

**Rol como sustituto:** consejo informal de gente cercana. **Es muy difícil de derrotar emocionalmente** (la confianza interpersonal supera a la confianza institucional para muchos usuarios). AhorraCasa solo puede compensarlo siendo **referida por personas reales** — boca a boca activo.

### 6. "No hacer nada" (inercia)

**El competidor más fuerte de todos.** Ya identificado en la visión. El **71% de los hogares en mercado libre** no cambian de comercializadora en el año, **86% no cambia en 2024** (según CNMC Household Panel, 13,7% sí cambiaron) — el otro 86% es competencia activa. La inercia es masiva.

**Cómo se compite contra la inercia:** reduciendo coste percibido de cambio + aumentando claridad del beneficio + recordatorio en momento oportuno (alarma). **AhorraCasa está diseñada exactamente para esto.**

---

## Implicaciones globales para el producto

1. **El espacio "app móvil con comparador via QR" está vacío.** Es el hueco más obvio del mapa competitivo. AhorraCasa lo ocupa ya en web; una PWA o app ligera lo consolidaría.

2. **OCU y FACUA son aliados naturales potenciales**, no enemigos. Mismo discurso, sin canibalización funcional. Acción a evaluar en política/roadmap.

3. **Rankia y blogs especializados son canal de adquisición potencial** (audiencia financieramente activa, hábito de lectura comparativa).

4. **El sustituto dominante es la inercia + comercializadora actual**. La adquisición de AhorraCasa **no compite contra Selectra**, compite contra **"no he mirado mi factura"**. Implicación: la comunicación debería empezar por **alertar al usuario de que probablemente está pagando de más**, no por presentar "otro comparador".

5. **El cuñado / red social** son canal de adquisición orgánico — palanca de "comparte tu ahorro" del parking de ideas tiene aquí su justificación competitiva.

---

## Fuentes consultadas

- [Mipodo — Mejor app precio luz](https://www.mipodo.com/blog/ahorro/precio-luz-apps-ahorrar-luz/)
- [Domesticatueconomia — Apps ahorrar factura luz](https://www.domesticatueconomia.es/apps-para-ahorrar-en-la-factura-de-la-luz-desde-el-movil/)
- [Adslzone — Precio luz tiempo real](https://www.adslzone.net/noticias/tecnologia/cuanto-vale-luz-tiempo-real/)
- [Precios Luz Hoy — 7 apps ahorrar luz](https://preciosluzhoy.com/las-mejores-7-apps-para-ahorrar-energia-y-dinero-en-tus-facturas/)
- [App Store — Precio Luz España](https://apps.apple.com/es/app/precio-luz-espa%C3%B1a/id1487330692)
- [TotalEnergies — Apps consultar precio luz](https://www.totalenergies-ofertas.es/blog/luz/las-mejores-aplicaciones-para-consultar-el-precio-de-la-luz-en-tiempo-real)
- [Blog Oney — 5 apps + bot precio luz](https://blog.oney.es/consumo-inteligente/apps-precio-luz-tiempo-real/)
- [TarifaLuzHora — App](https://tarifaluzhora.es/info/app-precio-luz)
- [Endesa — Apps consumo energía](https://www.endesa.com/en/blogs/endesa-s-blog/light/apps-energy-consumption)
- [Yoigo Luz y Gas — Apps control energético 2026](https://www.yoigoluzygas.com/blog/apps-control-energetico-comparativa-las-mejores-del-2026/)
- [Rankia — Comparativa tarifas luz y gas](https://www.rankia.com/blog/luz-y-gas/3036348-comparativa-tarifas-luz-gas-espana)
- [FACUA — Recibo eléctrico subió 15,5% en 2025](https://facua.org/noticias/el-recibo-electrico-del-usuario-medio-sufrio-una-subida-del-16-por-ciento-en-2025-segun-el-analisis-de-facua/)

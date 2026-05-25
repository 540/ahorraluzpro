# CNMC — Comparador oficial de ofertas de energía

> Deep dive del único comparador neutral institucional del mercado.

## Ficha rápida

| Campo | Valor |
|-------|-------|
| Web | [comparador.cnmc.gob.es](https://comparador.cnmc.gob.es/) |
| Naturaleza | Organismo regulador público (Comisión Nacional de los Mercados y la Competencia) |
| Sede | Madrid + Barcelona |
| Empleados | Plantilla pública (cientos en toda la institución, equipo del comparador desconocido) |
| Financiación | Pública vía Presupuestos Generales del Estado |
| Tipo de competidor | **Indirecto — única alternativa neutral, paradójicamente nuestra principal "fuente de datos"** |

---

## Posicionamiento

Herramienta oficial del **regulador público español** para comparar ofertas de luz y gas del mercado libre y PVPC. Neutral por construcción institucional (no es empresa, no monetiza, no recibe comisiones). Misión declarada: dar transparencia al mercado y empoderar al consumidor.

**Eslogan / frase de marca:**

> "Comparador de Ofertas de Energía" (sin elevator pitch comercial — es página institucional).

---

## Propuesta de valor

Acceso público y gratuito a la información más completa del mercado eléctrico y de gas español, **directamente desde el regulador**, sin intermediarios comerciales. Es la única herramienta **garantizada neutral por ley**.

---

## Modelo de negocio

**Cómo gana dinero:**

No gana dinero. **Es servicio público financiado vía presupuesto general**. Esto es precisamente lo que lo hace estructuralmente neutral.

**Precios públicos:**

0 € siempre.

**Modelo:**

Servicio público sin contraprestación al usuario ni a comercializadoras.

---

## Producto — deep dive

**Funcionalidades clave:**

- Comparador de ofertas de electricidad (mercado libre + PVPC).
- Comparador de ofertas de gas natural.
- Simulador de factura ([comparador.cnmc.gob.es/facturaluz/inicio/](https://comparador.cnmc.gob.es/facturaluz/inicio/)) — herramienta separada que permite calcular el coste con tu perfil.
- **Acceso vía QR de la factura** que autorrellena los datos del usuario sin tecleo manual (cumpliendo el BOE-A-2021-11035) [[CNMC](https://www.cnmc.es/prensa/codigo-QR-factura-luz-20210702)].
- Acceso manual rellenando código postal, potencia, consumo, tarifa, etc.

**UX/onboarding:**

- Cuando se accede **vía QR**: experiencia descrita como "muy fácil de utilizar" — los datos se autorrellenan [[Preahorro](https://preahorro.com/como-ahorrar/comparador-de-ofertas-de-energia-de-la-cnmc-funciona-bien/)].
- Cuando se accede **sin QR (manual)**: usuarios reportan que "toca seguir unos pasos algo complejos" — friction alta.
- Problemas técnicos reportados: **páginas en blanco**, comparador no carga ni desde el QR ni desde el enlace directo, en móvil y portátil indistintamente [[Bandaancha foro](https://bandaancha.eu/foros/comparador-cnmc-1759943)].
- **Errores conceptuales en presentación**: video viral de Carlos Codina demuestra que "el comparador de la CNMC nos engaña y nos lleva a una conclusión errónea" [[Carlos Codina](https://carloscodina.com/articulos-blog/tarifas-electricas/descubre%F0%9F%98%B2-porque-el-comparador-de-ofertas-de-la-cnmc-nos-engana-y-nos-lleva-a-una-conclusion-erronea/)] — la presentación de la comparativa puede inducir a error al usuario medio.
- **No es mobile-first**: diseñada como herramienta web, sin app móvil dedicada.

**Tecnología visible:**

- App web Nuxt.js (parametrización hexadecimal en URLs — documentado en CLAUDE.md raíz).
- API REST pública accesible (no oficial, no documentada — base técnica de AhorraCasa).
- Sin SDK, sin documentación de developers, sin programa de partners.

**Canales de distribución:**

- Acceso directo vía web institucional.
- **QR obligatorio en facturas** apunta a esta web — canal de adquisición regulado por ley. ~19,5 M de hogares tienen su factura con este QR.
- Sin SEO comercial, sin publicidad, sin presencia en app stores.

---

## Estrategia visible

**Foco de crecimiento:**

Mandato institucional, no crecimiento comercial. La estrategia es **mantenimiento de la herramienta y cumplimiento del rol regulador**. Sin presión competitiva ni de ingresos.

**Cambios recientes (últimos 12 meses):**

- Mantenimiento operativo, sin renovación visible de UX o branding.
- Datos abiertos cada vez más detallados (boletines trimestrales, Household Panel).
- **Real Decreto 88/2026** (nuevo reglamento de suministro) podría implicar cambios en el comparador — pendiente de analizar [[BOE](https://www.boe.es/buscar/act.php?id=BOE-A-2026-3212)].

**Comunicación y marca:**

- Tono **institucional / regulador**, sin storytelling de usuario.
- Cero marketing — la gente llega por el QR de la factura o por SEO institucional.
- **No comunica activamente su existencia** al usuario medio — muchos hogares con QR ni saben que sirve para comparar [[Hipertextual](https://hipertextual.com/guias/codigo-qr-factura-luz-electricidad/)].

---

## Fortalezas

- **Neutralidad absoluta garantizada por construcción legal** — el moat más fuerte del mercado.
- **Datos crudos del regulador**: cobertura del 100% del mercado libre + PVPC.
- **Canal de adquisición masivo y gratuito** vía QR obligatorio en factura — está en todos los hogares.
- **API pública (aunque no documentada)** que permite a terceros como AhorraCasa construir sobre ella.
- **Sin presión comercial** — no necesita captar usuarios para sobrevivir.

---

## Debilidades

- **UX manual es complicada** — sin QR el flujo se vuelve técnico (perfil de consumo, potencias por franja, etc.).
- **Problemas técnicos reportados** (páginas en blanco, no carga en momentos puntuales) — riesgo de pérdida de confianza del usuario que accede esperando solución.
- **Errores conceptuales documentados** en cómo presenta la comparativa [[Carlos Codina](https://carloscodina.com/articulos-blog/tarifas-electricas/descubre%F0%9F%98%B2-porque-el-comparador-de-ofertas-de-la-cnmc-nos-engana-y-nos-lleva-a-una-conclusion-erronea/)].
- **No es mobile-first** — peso visual de la página optimizado a escritorio.
- **Sin asistencia ni monitoreo continuo** — comparación puntual, sin alarmas, sin set-and-forget.
- **Conciencia del usuario muy baja**: muchos no saben que el QR de su factura sirve para comparar [[Xataka](https://www.xataka.com/basics/qr-tu-factura-luz-sirve-como-usarla-para-encontrar-companias-baratas)].
- **Sin marca, sin comunicación, sin notoriedad** — la mayoría del público general no lo conoce.

---

## Qué aprendemos de este competidor

1. **El CNMC ES la fuente de datos, no el rival.** AhorraCasa **no compite contra el CNMC**, lo **usa**. La competencia es por la mejor presentación, no por los datos. Esto es un activo enorme: la materia prima es gratis, neutral y oficial.

2. **La oportunidad de UX es enorme y poco explotada.** El comparador oficial es **funcionalmente equivalente** a AhorraCasa (mismo dato base, mismo QR de entrada) **pero la experiencia es peor**. Si AhorraCasa **solo mejora la presentación y elimina los bugs**, ya está aportando valor con cero coste de cobertura de datos.

3. **La marca CNMC tiene autoridad pero cero comunicación masiva.** Los usuarios no saben que el comparador existe. AhorraCasa puede **educar al usuario sobre el QR y posicionarse como "el wrapper amigable del comparador oficial"** — apropiarse de la asociación mental "QR factura = AhorraCasa" sin que la CNMC reaccione (no es competencia para ellos).

4. **Riesgo de dependencia técnica:** si la CNMC cambia la API o cierra el acceso sin previo aviso, AhorraCasa pierde el motor. Reforzar la acción ya planificada: **formalizar contacto con `info.comparador@cnmc.es`** y plan B con E·SIOS / OMIE.

5. **Aliado natural, no enemigo.** La CNMC podría **legitimar públicamente a AhorraCasa** si demuestra que aumenta el uso del comparador oficial (que es objetivo del propio regulador). **Es relación a cultivar** — posibles vías: mencionar AhorraCasa en su web, hackathon con datos abiertos, partnership institucional.

---

## Fuentes consultadas

- [CNMC — Comparador de Ofertas de Energía](https://comparador.cnmc.gob.es/)
- [CNMC — Simulador de factura](https://comparador.cnmc.gob.es/facturaluz/inicio/)
- [CNMC — Código QR factura luz](https://www.cnmc.es/prensa/codigo-QR-factura-luz-20210702)
- [Preahorro — ¿Funciona bien el comparador CNMC?](https://preahorro.com/como-ahorrar/comparador-de-ofertas-de-energia-de-la-cnmc-funciona-bien/)
- [Bandaancha — foro sobre comparador CNMC](https://bandaancha.eu/foros/comparador-cnmc-1759943)
- [Carlos Codina — crítica al comparador CNMC](https://carloscodina.com/articulos-blog/tarifas-electricas/descubre%F0%9F%98%B2-porque-el-comparador-de-ofertas-de-la-cnmc-nos-engana-y-nos-lleva-a-una-conclusion-erronea/)
- [El Debate — guía para usar el comparador CNMC](https://www.eldebate.com/economia/20220314/guia-usar-comparador-precios-cnmc-ahorrar-factura-luz.html)
- [Hipertextual — Qué es el QR de la factura](https://hipertextual.com/guias/codigo-qr-factura-luz-electricidad/)
- [Xataka — Cómo usar el QR para encontrar compañías baratas](https://www.xataka.com/basics/qr-tu-factura-luz-sirve-como-usarla-para-encontrar-companias-baratas)
- [BOE — Real Decreto 88/2026](https://www.boe.es/buscar/act.php?id=BOE-A-2026-3212)

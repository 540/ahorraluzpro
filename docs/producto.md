# AhorraLuz — Documento de Producto

## Problema

El español medio paga de más en su factura de la luz porque:
1. No sabe que puede cambiar de comercializadora gratis y sin cortes
2. Los comparadores existentes son complejos, piden muchos datos, o cobran de las eléctricas (sesgo)
3. La información de consumo está dispersa y es difícil de obtener

## Solución

Un comparador que usa el **QR obligatorio de la factura** (regulado por CNMC desde agosto 2021) para extraer automáticamente todos los datos de consumo del usuario y mostrarle en segundos si puede ahorrar.

## Propuesta de valor

> "Escanea el QR de tu factura. En 5 segundos te decimos si puedes ahorrar."

- **Sin registro**: No pedimos nada al usuario
- **Sin sesgo**: No cobramos de las eléctricas
- **Sin fricción**: Un escaneo, un resultado
- **Datos reales**: Usamos el consumo real del último año, no estimaciones

## Usuario objetivo

Persona con factura de la luz en la mano que quiere saber si paga de más. También válido para quien busca activamente cambiar o recibe la recomendación de un conocido.

## Flujo del usuario

```
1. Abre ahorraluz en el móvil
2. Pulsa "Escanear QR"
3. Apunta la cámara al QR de su factura
4. Ve pasos de progreso animados:
   ✓ QR leído correctamente
   ✓ Datos de consumo extraídos
   ◌ Buscando ofertas en el mercado...
   ○ Calculando tu ahorro
5. Ve el resultado:
   - Su tarifa actual y cuánto paga al año
   - La mejor oferta del mercado y cuánto pagaría
   - El ahorro anual en euros
   - 2 alternativas más
   - Texto educativo: "Cambiar es gratis, tarda 5 días, sin cortes"
```

## Qué NO es AhorraLuz (V1)

- No es un intermediario: no gestionamos el cambio
- No es un asesor energético: no analizamos potencia contratada ni hábitos
- No tiene cuenta de usuario ni histórico
- No monetiza (aún)

## Datos técnicos del QR

Desde agosto 2021, todas las comercializadoras están obligadas por la CNMC a incluir un QR en las facturas de suministros ≤15 kW (resolución BOE-A-2021-11035). Este QR contiene:

- **Consumo anual real** desglosado por periodos tarifarios (P1-P6)
- **Potencia contratada** por periodo
- **Potencia máxima demandada**
- **Código postal**
- **CUPS** (identificador único del punto de suministro)
- **Comercializadora actual** (código R2-XXX)
- **Tipo de contrato** (fijo, indexado)
- **Importe de la última factura**
- **Penalizaciones de permanencia**
- **Datos de autoconsumo** (si aplica)
- **Bono social** (si aplica)

Son ~40 parámetros codificados como query string en una URL al comparador de la CNMC.

## Competencia

| Competidor | Modelo | Debilidad |
|-----------|--------|-----------|
| Comparador CNMC | Oficial, gratuito | UX gubernamental, complejo, poco intuitivo |
| Selectra | Afiliación | Cobran de las eléctricas, sesgo en recomendaciones |
| Rastreator | Afiliación | Genérico, no especializado en energía |
| Tarifaluzhora | Hobby | Requiere CSV + datos manuales, técnico |
| Camby | Freemium | Necesita registro, app nativa |

**Nuestro diferencial**: la simplicidad radical del QR + la neutralidad total.

## Métricas de éxito (V1)

- Número de escaneos completados
- Porcentaje de usuarios que ven el resultado (vs abandono)
- Ahorro medio identificado por usuario
- Compartibilidad (¿cuántos llegan por enlace compartido?)

## Evolución prevista

### V2 — Bot de alertas
- Después de ver el resultado: "¿Quieres que te avisemos si aparece algo mejor?"
- Pide solo email
- Recalcula periódicamente con el perfil de consumo del QR
- Envía email solo cuando hay un ahorro significativo nuevo

### V3 — Análisis avanzado
- Diagnóstico de potencia contratada (¿tienes más de la que necesitas?)
- Recomendación PVPC vs mercado libre según perfil
- Simulación de autoconsumo fotovoltaico
- Conexión con Datadis para consumo horario (con autorización)

# BioFood API — Endpoints de Analítica y Estudiantes

Base URL: `http://localhost:8080/api`

Todos los endpoints son `GET`. Los datos provienen de la tabla `hackaton_ventas` (últimos 30 días por defecto, salvo indicación).

---

## Autenticación

Todos los endpoints de esta documentación requieren el header `X-API-Key`. Sin él la API responde `401 Unauthorized`.

```
X-API-Key: <valor de DASHBOARD_API_KEY en .env.local>
```

El endpoint del webhook de WhatsApp (`POST /api/whatsapp/webhook`) **no usa este header** — tiene su propio mecanismo de autenticación por query param.

### Variables para recargas Nequi con Wompi

Cuando el padre escribe `recargar` por WhatsApp, el bot usa el número registrado, crea una transacción Wompi con método `NEQUI`, espera hasta 60 segundos el estado final y responde al cliente.

Configura estas variables en el runtime:

```bash
WOMPI_BASE_URL=https://sandbox.wompi.co # o https://production.wompi.co
WOMPI_PUBLIC_KEY=pub_test_xxx
WOMPI_PRIVATE_KEY=prv_test_xxx
WOMPI_INTEGRITY_KEY=test_integrity_xxx
```

En sandbox, Wompi documenta estos números Nequi de prueba:

```text
3991111111 -> APPROVED
3992222222 -> DECLINED
```

### Ejemplo con fetch (JavaScript)

```js
const API_KEY = process.env.NEXT_PUBLIC_DASHBOARD_API_KEY // o la variable que uses

const res = await fetch('http://localhost:8080/api/students/directory?page=1&limit=10', {
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
})
```

### Ejemplo con axios

```js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'X-API-Key': process.env.NEXT_PUBLIC_DASHBOARD_API_KEY },
})

// Uso normal
const { data } = await api.get('/students/directory?page=1&limit=10')
```

### Recomendación: interceptor global

Si el frontend usa axios, configura el header una sola vez en la instancia base y todos los requests lo heredan automáticamente (ver ejemplo de axios arriba).

---

---

## Vista 1: Inteligencia de Ingresos (Dashboard)

### 1. Top 4 Productos Más Vendidos

```
GET /api/products/top-sold
```

**Respuesta:**

```json
{
  "productos_mas_vendidos": [
    {
      "nombre_producto": "DEDO QUESO",
      "volumen_cantidad": 28450,
      "total_transacciones": 2840,
      "ingresos": 3414000,
      "posicion": "TOP1"
    },
    {
      "nombre_producto": "LUNCH",
      "volumen_cantidad": 15200,
      "total_transacciones": 1520,
      "ingresos": 2280000,
      "posicion": "TOP2"
    }
  ]
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `nombre_producto` | string | Nombre del producto |
| `volumen_cantidad` | float | Unidades totales vendidas |
| `total_transacciones` | int | Número de registros |
| `ingresos` | float | Ingresos totales (cantidad × precio) |
| `posicion` | string | Ranking: `TOP1` … `TOP4` |

---

### 2. Desempeño por Colegio

```
GET /api/schools/performance
```

**Respuesta:**

```json
{
  "desempenio_colegio": [
    {
      "colegio": "COLEGIO DEMO 671",
      "total_ingresos": 4520000,
      "transacciones": 2840,
      "ticket_promedio": 1591.0,
      "crecimiento_porcentaje": 12.4,
      "total_unidades": 28450
    },
    {
      "colegio": "COLEGIO DEMO 679",
      "total_ingresos": 3150000,
      "transacciones": 1950,
      "ticket_promedio": 1615.0,
      "crecimiento_porcentaje": 0,
      "total_unidades": 19500
    }
  ]
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `colegio` | string | Nombre del colegio |
| `total_ingresos` | float | Suma de cantidad × precio |
| `transacciones` | int | Total de registros del período |
| `ticket_promedio` | float | Promedio por transacción |
| `crecimiento_porcentaje` | float | % vs colegio anterior (orden alfabético). El primero es `0` |
| `total_unidades` | float | Unidades totales vendidas |

---

### 3. Métricas Globales

```
GET /api/metrics/global
```

**Respuesta:**

```json
{
  "metricas_globales": {
    "ingresos_totales": 7600000,
    "total_transacciones": 4790,
    "ticket_promedio": 1602.0,
    "monto_recarga_promedio": 25400.0,
    "total_recarga": 3200000
  }
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `ingresos_totales` | float | Suma total de ingresos del período |
| `total_transacciones` | int | Número total de registros |
| `ticket_promedio` | float | Promedio general por registro |
| `monto_recarga_promedio` | float | Promedio de registros con cantidad > 0 |
| `total_recarga` | float | Suma de registros con cantidad > 0 |

---

### 4. Patrones de Recarga (Distribución por Día)

```
GET /api/recharge/patterns
```

**Respuesta:**

```json
{
  "patrones_recarga": [
    {
      "patron": "Lunes a Martes",
      "porcentaje": 42,
      "cantidad": 2010
    },
    {
      "patron": "Miércoles a Jueves",
      "porcentaje": 35,
      "cantidad": 1676
    },
    {
      "patron": "Viernes a Domingo",
      "porcentaje": 23,
      "cantidad": 1100
    }
  ]
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `patron` | string | Rango de días: `Lunes a Martes`, `Miércoles a Jueves`, `Viernes a Domingo` |
| `porcentaje` | float | % de transacciones en ese rango |
| `cantidad` | int | Total de transacciones en el rango |

---

## Vista 2: Directorio Maestro de Estudiantes

### 5. Resumen Global de Estudiantes

```
GET /api/students/summary
```

**Respuesta:**

```json
{
  "resumen_estudiantes": {
    "total_estudiantes": 1284,
    "gasto_promedio": 1450.5,
    "saldos_bajos_count": 345
  }
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `total_estudiantes` | int | Estudiantes únicos con actividad en 30 días |
| `gasto_promedio` | float | Promedio de (cantidad × precio) por registro |
| `saldos_bajos_count` | int | Registros con monto negativo |

---

### 6. Consumo por Colegio (Top 3)

```
GET /api/schools/consumption
```

**Respuesta:**

```json
{
  "consumo_colegio": [
    {
      "colegio": "COLEGIO DEMO 671",
      "estudiantes_activos": 450,
      "porcentaje": 45
    },
    {
      "colegio": "COLEGIO DEMO 679",
      "estudiantes_activos": 350,
      "porcentaje": 35
    },
    {
      "colegio": "COLEGIO DEMO 697",
      "estudiantes_activos": 200,
      "porcentaje": 20
    }
  ]
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `colegio` | string | Nombre del colegio |
| `estudiantes_activos` | int | Estudiantes únicos con actividad |
| `porcentaje` | float | % del total de estudiantes activos |

---

### 7. Tendencia de Ingresos (Últimos 6 Meses)

```
GET /api/recharge/trend
```

**Respuesta:**

```json
{
  "tendencia_recargas": [
    {
      "mes": "2024-01-01 00:00:00+00",
      "monto_total": 2000000,
      "num_transacciones": 1200
    },
    {
      "mes": "2024-02-01 00:00:00+00",
      "monto_total": 2500000,
      "num_transacciones": 1400
    }
  ]
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `mes` | string | Primer día del mes (formato timestamp PostgreSQL) |
| `monto_total` | float | Suma de ingresos del mes |
| `num_transacciones` | int | Transacciones en el mes |

---

### 8. Directorio de Estudiantes (Paginado)

```
GET /api/students/directory?page=1&limit=10
```

**Query params:**

| Param | Tipo | Default | Descripción |
|---|---|---|---|
| `page` | int | `1` | Página actual (base 1) |
| `limit` | int | `10` | Registros por página (máximo 100) |

**Respuesta:**

```json
{
  "directorio": [
    {
      "id": "48291",
      "nombre_estudiante": "Sofia Villanueva",
      "nombre_padre": "Carlos Villanueva",
      "saldo_actual": 1420.0,
      "total_compras": 45,
      "nivel_actividad": "Alto",
      "colegio": "COLEGIO DEMO 671"
    },
    {
      "id": "48302",
      "nombre_estudiante": "Mateo López",
      "nombre_padre": "",
      "saldo_actual": 12.50,
      "total_compras": 12,
      "nivel_actividad": "Bajo",
      "colegio": "COLEGIO DEMO 679"
    }
  ],
  "paginacion": {
    "total_registros": 1284,
    "pagina_actual": 1,
    "registros_por_pagina": 10
  }
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | `usuario_identificacion` |
| `nombre_estudiante` | string | Nombre del estudiante |
| `nombre_padre` | string | Nombre del padre/tutor (vacío si no existe en la tabla) |
| `saldo_actual` | float | Suma de montos positivos en el período |
| `total_compras` | int | Total de registros del estudiante |
| `nivel_actividad` | string | `Alto` (>1000), `Medio` (>500), `Bajo` (resto) |
| `colegio` | string | Colegio del estudiante |

---

## Vista 3: Perfil de Estudiante

Todos los endpoints de esta sección reciben el `id` del estudiante como parámetro de ruta. El `id` corresponde al campo `usuario_identificacion` de la base de datos.

### 9. Perfil del Estudiante

```
GET /api/students/:id/profile
```

**Ejemplo:** `GET /api/students/48291/profile`

**Respuesta exitosa (`200`):**

```json
{
  "estudiante": {
    "id": "48291",
    "nombre": "Sofia Villanueva",
    "colegio": "COLEGIO DEMO 671",
    "billetera_digital": 1420.0,
    "ticket_promedio": 2.66,
    "dias_actividad": 18
  }
}
```

**Respuesta no encontrado (`404`):**

```json
{
  "error": "not found"
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | Identificación del estudiante |
| `nombre` | string | Nombre del estudiante |
| `colegio` | string | Colegio al que pertenece |
| `billetera_digital` | float | Suma de montos con cantidad > 0 (últimos 30 días) |
| `ticket_promedio` | float | Promedio de compras positivas |
| `dias_actividad` | int | Días únicos con actividad en 30 días |

---

### 10. Historial de Transacciones

```
GET /api/students/:id/transactions
```

**Ejemplo:** `GET /api/students/48291/transactions`

Retorna las últimas 20 transacciones ordenadas por fecha descendente.

**Respuesta:**

```json
{
  "historial": [
    {
      "fecha": "2024-03-10 12:00:00",
      "producto": "LUNCH",
      "cantidad": 1,
      "monto": 4500,
      "tipo": "Compra"
    },
    {
      "fecha": "2024-03-08 09:00:00",
      "producto": "RECARGA",
      "cantidad": -1,
      "monto": -20000,
      "tipo": "Recarga"
    }
  ]
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `fecha` | string | Timestamp del registro |
| `producto` | string | Nombre del producto o concepto |
| `cantidad` | float | Cantidad (negativa = recarga) |
| `monto` | float | `cantidad × precio` |
| `tipo` | string | `Compra` si cantidad > 0, `Recarga` si cantidad ≤ 0 |

---

### 11. Top 3 Productos Más Comprados

```
GET /api/students/:id/top-products
```

**Ejemplo:** `GET /api/students/48291/top-products`

Solo considera registros con `cantidad > 0`.

**Respuesta:**

```json
{
  "top_productos": [
    {
      "nombre": "LUNCH",
      "veces_comprado": 12,
      "porcentaje": 56
    },
    {
      "nombre": "DEDO QUESO",
      "veces_comprado": 6,
      "porcentaje": 25
    },
    {
      "nombre": "NATUCHIPS VERDE",
      "veces_comprado": 4,
      "porcentaje": 19
    }
  ]
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `nombre` | string | Nombre del producto |
| `veces_comprado` | int | Número de veces comprado |
| `porcentaje` | float | % sobre el total de compras del estudiante |

---

### 12. Consumo Semanal por Producto (Base para Nutrición)

```
GET /api/students/:id/nutrition
```

**Ejemplo:** `GET /api/students/48291/nutrition`

Retorna las unidades consumidas por producto en los **últimos 7 días**. El frontend aplica la tabla nutricional localmente sobre estos datos.

**Respuesta:**

```json
{
  "resumen_nutricional": {
    "periodo": "Semanal",
    "consumo": [
      {
        "nombre_producto": "LUNCH",
        "total_unidades": 5
      },
      {
        "nombre_producto": "MILO",
        "total_unidades": 3
      },
      {
        "nombre_producto": "NATUCHIPS VERDE",
        "total_unidades": 2
      }
    ]
  }
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `periodo` | string | Siempre `"Semanal"` |
| `consumo[].nombre_producto` | string | Nombre del producto consumido |
| `consumo[].total_unidades` | float | Unidades totales en 7 días |

---

### 13. Análisis Transaccional Diario

```
GET /api/students/:id/analysis
```

**Ejemplo:** `GET /api/students/48291/analysis`

Gasto diario del estudiante en los **últimos 30 días**, ordenado cronológicamente. Solo incluye días con actividad.

**Respuesta:**

```json
{
  "analisis_transaccional": [
    {
      "dia": "2024-02-10 00:00:00+00",
      "gasto": 8500
    },
    {
      "dia": "2024-02-11 00:00:00+00",
      "gasto": 7250
    },
    {
      "dia": "2024-02-12 00:00:00+00",
      "gasto": 6750
    }
  ]
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `dia` | string | Fecha del día (formato timestamp PostgreSQL) |
| `gasto` | float | Suma de montos con cantidad > 0 ese día |

---

## Resumen de Endpoints

| # | Método | URL | Vista |
|---|---|---|---|
| 1 | `GET` | `/api/products/top-sold` | Dashboard |
| 2 | `GET` | `/api/schools/performance` | Dashboard |
| 3 | `GET` | `/api/metrics/global` | Dashboard |
| 4 | `GET` | `/api/recharge/patterns` | Dashboard |
| 5 | `GET` | `/api/students/summary` | Directorio |
| 6 | `GET` | `/api/schools/consumption` | Directorio |
| 7 | `GET` | `/api/recharge/trend` | Directorio |
| 8 | `GET` | `/api/students/directory?page=1&limit=10` | Directorio |
| 9 | `GET` | `/api/students/:id/profile` | Perfil |
| 10 | `GET` | `/api/students/:id/transactions` | Perfil |
| 11 | `GET` | `/api/students/:id/top-products` | Perfil |
| 12 | `GET` | `/api/students/:id/nutrition` | Perfil |
| 13 | `GET` | `/api/students/:id/analysis` | Perfil |

## Códigos de Error

| Código | Descripción |
|---|---|
| `400` | Parámetro inválido o faltante |
| `401` | Falta el header `X-API-Key` o el valor es incorrecto |
| `404` | Estudiante no encontrado |
| `500` | Error interno del servidor |

```json
{
  "error": "descripción del error"
}
```

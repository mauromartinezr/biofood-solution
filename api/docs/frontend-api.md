# BioFood API — Guía para Frontend

Documentación práctica para conectar el dashboard (3 vistas) con el backend.

**Referencia completa:** [`endpoints.md`](./endpoints.md) · **Postman:** [`BioFood-API.postman_collection.json`](./BioFood-API.postman_collection.json)

---

## URLs base

| Entorno | `baseURL` (sin `/api` al final) |
|---------|--------------------------------|
| Dev Go (`make dev-api`) | `http://localhost:8080` |
| Docker local (`make deploy-api`) | `http://localhost:3001` |
| Producción (VPS) | `https://tu-dominio.com` o `http://IP:3001` |

Todos los endpoints de analítica van bajo **`{baseURL}/api/...`**.

Health check (sin auth): **`GET {baseURL}/health`**

---

## Autenticación

| Header | Valor |
|--------|--------|
| `X-API-Key` | Misma clave que `DASHBOARD_API_KEY` del backend |

- **No** uses `Authorization: Bearer`.
- En local, si el backend no tiene `DASHBOARD_API_KEY` configurada, los endpoints pasan sin clave.
- En producción, define la clave en el `.env` del servidor y en el front (ej. `VITE_API_KEY` / `NEXT_PUBLIC_DASHBOARD_API_KEY`).

CORS ya permite el header `X-API-Key` desde cualquier origen (`*`).

---

## Setup rápido (axios)

```ts
// src/lib/api.ts
import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export const api = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': import.meta.env.VITE_DASHBOARD_API_KEY ?? '',
  },
})

// Helper: lanza si no es 2xx
export async function get<T>(path: string, params?: Record<string, string | number>) {
  const { data } = await api.get<T>(path, { params })
  return data
}
```

```env
# .env.local (Vite ejemplo)
VITE_API_BASE_URL=http://localhost:8080
VITE_DASHBOARD_API_KEY=
```

---

## Setup rápido (fetch)

```ts
const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const apiKey = import.meta.env.VITE_DASHBOARD_API_KEY ?? ''

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${baseURL}/api${path}`, {
    headers: { 'X-API-Key': apiKey },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? res.statusText)
  }
  return res.json()
}
```

---

## Mapa de pantallas → endpoints

```
┌─────────────────────────────────────────────────────────────┐
│  VISTA 1 — Dashboard (ingresos)                             │
│  Cargar en paralelo al montar:                              │
│    GET /products/top-sold                                   │
│    GET /schools/performance                                 │
│    GET /metrics/global                                      │
│    GET /recharge/patterns                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  VISTA 2 — Directorio de estudiantes                        │
│  Cargar en paralelo:                                        │
│    GET /students/summary                                    │
│    GET /schools/consumption                                 │
│    GET /recharge/trend                                      │
│    GET /students/directory?page=1&limit=10  (paginado)    │
│  Al hacer clic en fila → navegar con entry.id a Vista 3     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  VISTA 3 — Perfil estudiante  (:id = usuario_identificacion)│
│  Cargar en paralelo:                                        │
│    GET /students/:id/profile                                │
│    GET /students/:id/transactions                           │
│    GET /students/:id/top-products                           │
│    GET /students/:id/nutrition                              │
│    GET /students/:id/analysis                               │
└─────────────────────────────────────────────────────────────┘
```

### Ejemplo: cargar Vista 1

```ts
const [topSold, schools, metrics, patterns] = await Promise.all([
  get<{ productos_mas_vendidos: TopProduct[] }>('/products/top-sold'),
  get<{ desempenio_colegio: SchoolPerformance[] }>('/schools/performance'),
  get<{ metricas_globales: GlobalMetrics }>('/metrics/global'),
  get<{ patrones_recarga: RechargePattern[] }>('/recharge/patterns'),
])
```

### Ejemplo: cargar Vista 3

```ts
const studentId = '0010089277' // viene de directorio[].id

const [profile, transactions, topProducts, nutrition, analysis] = await Promise.all([
  get<{ estudiante: StudentProfile }>(`/students/${studentId}/profile`),
  get<{ historial: Transaction[] }>(`/students/${studentId}/transactions`),
  get<{ top_productos: TopStudentProduct[] }>(`/students/${studentId}/top-products`),
  get<{ resumen_nutricional: NutritionSummary }>(`/students/${studentId}/nutrition`),
  get<{ analisis_transaccional: DailyAnalysis[] }>(`/students/${studentId}/analysis`),
])
```

---

## Tipos TypeScript (copiar al front)

```ts
// —— Vista 1 ——
export interface TopProduct {
  nombre_producto: string
  volumen_cantidad: number
  total_transacciones: number
  ingresos: number
  posicion: 'TOP1' | 'TOP2' | 'TOP3' | 'TOP4' | string
}

export interface SchoolPerformance {
  colegio: string
  total_ingresos: number
  transacciones: number
  ticket_promedio: number
  crecimiento_porcentaje: number
  total_unidades: number
}

export interface GlobalMetrics {
  ingresos_totales: number
  total_transacciones: number
  ticket_promedio: number
  monto_recarga_promedio: number
  total_recarga: number
}

export interface RechargePattern {
  patron: string       // "Lunes a Martes" | "Miércoles a Jueves" | "Viernes a Domingo"
  porcentaje: number
  cantidad: number
}

// —— Vista 2 ——
export interface StudentsSummary {
  total_estudiantes: number
  gasto_promedio: number
  saldos_bajos_count: number
}

export interface SchoolConsumption {
  colegio: string
  estudiantes_activos: number
  porcentaje: number
}

export interface RechargeTrend {
  mes: string
  monto_total: number
  num_transacciones: number
}

export interface DirectoryEntry {
  id: string                    // usuario_identificacion → usar en Vista 3
  nombre_estudiante: string
  nombre_padre: string          // puede ser ""
  saldo_actual: number
  total_compras: number
  nivel_actividad: 'Alto' | 'Medio' | 'Bajo'
  colegio: string
}

export interface DirectoryResponse {
  directorio: DirectoryEntry[]
  paginacion: {
    total_registros: number
    pagina_actual: number
    registros_por_pagina: number
  }
}

// —— Vista 3 ——
export interface StudentProfile {
  id: string
  nombre: string
  colegio: string
  billetera_digital: number
  ticket_promedio: number
  dias_actividad: number
}

export interface Transaction {
  fecha: string
  producto: string
  cantidad: number
  monto: number
  tipo: 'Compra' | 'Recarga'
}

export interface TopStudentProduct {
  nombre: string
  veces_comprado: number
  porcentaje: number
}

export interface NutritionItem {
  nombre_producto: string
  total_unidades: number
}

export interface NutritionSummary {
  periodo: 'Semanal'
  consumo: NutritionItem[]
}

export interface DailyAnalysis {
  dia: string
  gasto: number
}
```

---

## Endpoints (resumen)

| Vista | Método | Ruta | Respuesta (clave raíz) |
|-------|--------|------|------------------------|
| — | `GET` | `/health` | `{ "status": "healthy" }` |
| 1 | `GET` | `/products/top-sold` | `productos_mas_vendidos[]` |
| 1 | `GET` | `/schools/performance` | `desempenio_colegio[]` |
| 1 | `GET` | `/metrics/global` | `metricas_globales{}` |
| 1 | `GET` | `/recharge/patterns` | `patrones_recarga[]` |
| 2 | `GET` | `/students/summary` | `resumen_estudiantes{}` |
| 2 | `GET` | `/schools/consumption` | `consumo_colegio[]` (máx. 3) |
| 2 | `GET` | `/recharge/trend` | `tendencia_recargas[]` (6 meses) |
| 2 | `GET` | `/students/directory` | `directorio[]` + `paginacion{}` |
| 3 | `GET` | `/students/:id/profile` | `estudiante{}` |
| 3 | `GET` | `/students/:id/transactions` | `historial[]` (20 últimas) |
| 3 | `GET` | `/students/:id/top-products` | `top_productos[]` (máx. 3) |
| 3 | `GET` | `/students/:id/nutrition` | `resumen_nutricional{}` |
| 3 | `GET` | `/students/:id/analysis` | `analisis_transaccional[]` |

### Query params — directorio

| Param | Default | Máximo | Descripción |
|-------|---------|--------|-------------|
| `page` | `1` | — | Página (base 1) |
| `limit` | `10` | `100` | Filas por página |

```ts
const data = await get<DirectoryResponse>('/students/directory', {
  page: 2,
  limit: 20,
})
```

### Parámetro `:id` en Vista 3

- Es el campo **`directorio[].id`** (= `usuario_identificacion` en la DB).
- No uses el nombre del estudiante en la URL.
- Si no existe → **404** `{ "error": "not found" }`.

---

## Errores HTTP

| Código | Cuándo | Body |
|--------|--------|------|
| `200` | OK | JSON con datos |
| `400` | Parámetro inválido | `{ "error": "invalid input" }` |
| `401` | Falta o clave incorrecta en `X-API-Key` | `{ "error": "unauthorized" }` |
| `404` | Estudiante no encontrado (perfil) | `{ "error": "not found" }` |
| `500` | Error servidor / DB | `{ "error": "internal server error" }` |

```ts
try {
  const { estudiante } = await get<{ estudiante: StudentProfile }>(`/students/${id}/profile`)
} catch (e) {
  // Mostrar toast / pantalla de error según status
}
```

---

## Notas para UI

| Tema | Detalle |
|------|---------|
| **Montos** | Números en COP (sin formato en API). Formatear en front (`Intl.NumberFormat`). |
| **Fechas** | Strings (`"2025-12-01"` o timestamp PG). Parsear con `new Date()` o `date-fns`. |
| **Nutrición** | La API solo devuelve unidades por producto (7 días). La tabla nutricional (calorías, etc.) va en el front. |
| **Nivel actividad** | `Alto` (>1000), `Medio` (>500), `Bajo` (resto) — según suma de compras en 30 días. |
| **Transacciones** | `tipo`: `"Compra"` si `cantidad > 0`, `"Recarga"` si no. `cantidad` negativa = recarga. |
| **Patrones recarga** | 3 filas fijas por rango de días de la semana. Ideal para gráfico de dona/barras. |
| **Período datos** | Casi todo filtra **últimos 30 días**; tendencia = **6 meses**; nutrición = **7 días**. |

---

## Checklist de integración

1. [ ] Definir `VITE_API_BASE_URL` (o equivalente) por entorno.
2. [ ] Definir `VITE_DASHBOARD_API_KEY` (misma que backend en prod).
3. [ ] Crear cliente HTTP con header `X-API-Key` global.
4. [ ] Probar `GET /health` sin auth.
5. [ ] Probar `GET /api/metrics/global` con auth.
6. [ ] Vista 2: paginar directorio con `page` / `limit`.
7. [ ] Vista 3: usar `entry.id` de la fila seleccionada.
8. [ ] Manejar 401 (redirigir o mensaje) y 404 (estudiante inexistente).

---

## Probar sin escribir código

1. Importar colección Postman en `api/docs/`.
2. Environment **Local** → `baseUrl` + `dashboard_api_key`.
3. Ejecutar requests en orden: Health → metrics/global → directory → profile.

---

## Endpoints fuera del dashboard (opcional)

Estos existen en el backend pero **no** están en las 3 vistas del dashboard documentadas:

| Método | Ruta | Uso |
|--------|------|-----|
| `GET/POST/PUT/DELETE` | `/api/products` | CRUD catálogo local |
| `POST` | `/api/whatsapp/send` | Enviar WhatsApp |
| `POST` | `/api/whatsapp/webhook` | Webhook Evolution (backend) |

El dashboard de analítica solo necesita los **13 GET** de la tabla anterior.

# BioFood Connect — Web (Dashboard)

Documento de entrega — Hackathon 2026

---

## ¿Qué es?

Aplicación web **React + TypeScript** para que operadores de cafetería y administradores escolares visualicen **analítica de ingresos**, **directorio de estudiantes** y **perfil nutricional/financiero** de cada alumno. Consume la API BioFood en tiempo real.

Es el producto operativo del equipo: el “panel de control” que complementa el pitch y el bot de WhatsApp.

---

## Stack tecnológico

| Componente | Tecnología |
|------------|------------|
| Framework | React 19 |
| Lenguaje | TypeScript |
| Build | Vite 8 |
| Estilos | Tailwind CSS 4 |
| Iconos | Material Symbols |
| HTTP | Fetch API (cliente propio) |
| Arquitectura UI | Vistas + features (api / service / use_case / dto) |

---

## Estructura del proyecto

```
web/
├── src/
│   ├── views/                 # Pantallas principales
│   │   ├── RevenueDashboard.tsx    # Vista 1 — Ingresos
│   │   ├── StudentDirectory.tsx    # Vista 2 — Directorio
│   │   └── StudentDetail.tsx       # Vista 3 — Perfil
│   ├── features/
│   │   ├── dashboard/         # API + lógica vista ingresos
│   │   ├── students/          # API + lógica directorio
│   │   └── profile/           # API + lógica perfil
│   ├── components/            # Header, Sidebar, Footer
│   └── utils/service.ts       # Cliente HTTP base
├── public/
└── package.json
```

---

## Vistas implementadas

### Vista 1 — Panel de ingresos (`RevenueDashboard`)

Métricas y gráficos de la operación global:

- Top productos más vendidos
- Desempeño por colegio
- Métricas globales (ingresos, transacciones, ticket)
- Patrones de recarga por día de la semana

**Endpoints:** `/api/products/top-sold`, `/api/schools/performance`, `/api/metrics/global`, `/api/recharge/patterns`

### Vista 2 — Directorio de estudiantes (`StudentDirectory`)

- Resumen global (total estudiantes, gasto promedio, saldos bajos)
- Consumo por colegio (top 3)
- Tendencia de ingresos (6 meses)
- Tabla paginada con búsqueda (`page`, `limit`)

**Endpoints:** `/api/students/summary`, `/api/schools/consumption`, `/api/recharge/trend`, `/api/students/directory`

### Vista 3 — Perfil del estudiante (`StudentDetail`)

Al seleccionar un estudiante en el directorio:

- Perfil (billetera, ticket, días de actividad)
- Historial de transacciones
- Top productos comprados
- Consumo semanal (base nutricional)
- Análisis de gasto diario (30 días)

**Endpoints:** `/api/students/:id/profile`, `.../transactions`, `.../top-products`, `.../nutrition`, `.../analysis`

El `:id` es el `usuario_identificacion` que devuelve el directorio.

### Módulos en desarrollo (placeholder)

El sidebar incluye secciones futuras con pantalla “Módulo en desarrollo”:

- Inventario
- Alérgenos
- Retos
- Marketplace

---

## Conexión con la API

Cliente base en `src/utils/service.ts`:

```ts
const API_BASE_URL = 'http://localhost:8080';
```

Cada feature define sus rutas en `api_*.ts` y consume datos vía `service_*.ts` / `use_case_*.ts`.

**Autenticación:** la API espera `X-API-Key` si está configurada `DASHBOARD_API_KEY`. El cliente actual puede ampliarse con:

```ts
headers: { 'X-API-Key': import.meta.env.VITE_DASHBOARD_API_KEY }
```

Guía completa de integración: [`api/docs/frontend-api.md`](../../api/docs/frontend-api.md)

---

## Cómo ejecutar

### Desarrollo (recomendado)

```bash
# Terminal 1 — API
make db-up && make dev-api    # http://localhost:8080

# Terminal 2 — Web
cd web && npm install && npm run dev
```

Abrir la URL que indique Vite (normalmente `http://localhost:5173`).

### Build de producción

```bash
cd web && npm run build
```

Salida en `web/dist/`. Opcionalmente se embebe en el binario Go con `make build` (monorepo).

### Variables de entorno sugeridas (`.env.local`)

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_DASHBOARD_API_KEY=tu-clave-dashboard
```

En producción, apuntar `VITE_API_BASE_URL` al dominio del backend (ej. `https://hack.apptrialhub.com`).

---

## Diseño y UX

- Layout con **sidebar** fijo y **header** con búsqueda (en directorio).
- Paleta **BioFood** (azul marca, fondos claros, tipografía Material).
- Componentes reutilizables: `Header`, `Sidebar`, `Footer`.
- Navegación por pestañas sin router externo (estado en `App.tsx`).

---

## Flujo de usuario

```
Panel de ingresos  →  Directorio  →  Clic en estudiante  →  Perfil detallado
     (Vista 1)          (Vista 2)                              (Vista 3)
```

La búsqueda global en el header filtra el directorio por nombre o ID.

---

## Valor para el hackathon

- Demuestra **producto real** sobre datos del reto (no mock estático).
- Tres vistas alineadas con el storytelling del pitch (ingresos → familias → detalle).
- Código organizado por features, listo para conectar inventario y alérgenos.
- Complementa WhatsApp (padres) y presentación (jurados/inversores).

---

## Enlaces útiles

- [Guía API para frontend](../../api/docs/frontend-api.md)
- [Endpoints del backend](../../api/docs/endpoints.md)
- [Colección Postman](../../api/docs/BioFood-API.postman_collection.json)

# BioFood Connect — API (Backend)

Documento de entrega — Hackathon 2026

---

## ¿Qué es?

Backend en **Go** que centraliza la lógica de **BioFood Connect**: analítica para cafeterías escolares, perfil de estudiantes, bot de WhatsApp con IA y pagos. Consume datos reales del hackathon (`hackaton_ventas`) y mantiene datos operativos locales (mapeos de teléfono, inventario demo, alérgenos).

**URL producción (ejemplo):** `https://hack.apptrialhub.com`  
**Health:** `GET /health`

---

## Stack tecnológico

| Componente | Tecnología |
|------------|------------|
| Lenguaje | Go 1.25+ |
| HTTP | Echo v4 |
| ORM | GORM |
| Base local | PostgreSQL 15 (Docker) |
| Base hackathon | PostgreSQL remota (`hackaton_ventas`, `hackaton_recargas`) |
| WhatsApp | Evolution API |
| IA conversacional | Claude (Anthropic API) |
| Pagos | Wompi (recargas Nequi) |
| Arquitectura | Hexagonal (domain / application / adapter) |

---

## Arquitectura

```
api/
├── cmd/server/          # Punto de entrada
├── internal/
│   ├── features/        # Módulos de negocio
│   │   ├── analytics/   # Dashboard (métricas, colegios, recargas)
│   │   ├── students/    # Directorio y perfil estudiante
│   │   ├── products/    # CRUD catálogo local
│   │   └── whatsapp/    # Bot, alertas proactivas, pagos
│   └── infrastructure/  # DB, HTTP, Evolution, Claude, Wompi
├── docs/                # endpoints.md, Postman, guías
└── postgres/            # seed.sql, demo_setup.py (datos demo)
```

**Flujo de datos:**

- **Analítica y estudiantes** → lectura directa de `HACKATHON_DSN`.
- **WhatsApp** → `phone_biofood_map` (local) + ventas/recargas (hackathon) + Evolution para enviar/recibir.
- **Inventario / alérgenos** → tablas locales pobladas con `seed.sql`.

---

## Módulos principales

### 1. Dashboard analítico (13 endpoints GET)

Alimentan el frontend web. Todos bajo `/api` con header `X-API-Key` si `DASHBOARD_API_KEY` está configurada.

| Vista | Endpoints |
|-------|-----------|
| Ingresos | `/products/top-sold`, `/schools/performance`, `/metrics/global`, `/recharge/patterns` |
| Directorio | `/students/summary`, `/schools/consumption`, `/recharge/trend`, `/students/directory` |
| Perfil | `/students/:id/profile`, `.../transactions`, `.../top-products`, `.../nutrition`, `.../analysis` |

Documentación detallada: [`api/docs/endpoints.md`](../../api/docs/endpoints.md)  
Guía frontend: [`api/docs/frontend-api.md`](../../api/docs/frontend-api.md)  
Postman: [`api/docs/BioFood-API.postman_collection.json`](../../api/docs/BioFood-API.postman_collection.json)

### 2. WhatsApp (BioAlert)

- **Webhook:** `POST /api/whatsapp/webhook?token=WEBHOOK_SECRET` (Evolution API).
- **Envío manual:** `POST /api/whatsapp/send`.
- **IA:** responde saldo, consumo, alérgenos y ofertas según contexto del estudiante.
- **Worker proactivo:** alertas de ausencia, alérgenos y smart offers (inventario).

Guía de configuración: [`api/docs/whatsapp-setup.md`](../../api/docs/whatsapp-setup.md)

**Teléfonos registrados (demo):**

| Teléfono | Estudiante (hackathon) |
|----------|-------------------------|
| +573008263922 | 0010089277 |
| +573059319289 | 0010130953 |
| +573024158002 | 0010086378 |

### 3. Productos (CRUD local)

`GET/POST/PUT/DELETE /api/products` — catálogo e inventario para demos de alérgenos y smart offers.

### 4. Wompi (pagos)

`POST /api/wompi/webhook` — eventos de pago para flujo de recarga (sandbox/producción).

---

## Variables de entorno

Archivo de referencia: [`api/.env.example`](../../api/.env.example)  
En Docker/VPS se usa **`api/.env.dev`** (nombre histórico; es la config de producción en servidor).

| Variable | Uso |
|----------|-----|
| `PORT` | Puerto HTTP (3001 en Docker, 8080 en Go local) |
| `DATABASE_DSN` | PostgreSQL local (`biofood-postgres`) |
| `HACKATHON_DSN` | PostgreSQL con `hackaton_ventas` |
| `DASHBOARD_API_KEY` | Header `X-API-Key` del dashboard |
| `EVOLUTION_BASE_URL` | URL Evolution (sin `/` final) |
| `EVOLUTION_INSTANCE` | Instancia WhatsApp (`biofood`) |
| `EVOLUTION_API_KEY` | API key Evolution |
| `WEBHOOK_SECRET` | Token en query del webhook WhatsApp |
| `ANTHROPIC_API_KEY` | Claude para respuestas del bot |
| `WOMPI_*` | Claves Wompi (recargas) |

---

## Cómo ejecutar

### Desarrollo local

```bash
# Desde la raíz del monorepo
make db-up          # PostgreSQL en :5436
docker exec -i biofood-postgres psql -U hackuser -d hackathondb < postgres/seed.sql
python3 postgres/demo_setup.py   # mapeos WhatsApp

make dev-api        # API en http://localhost:8080
```

### Producción (solo API en VPS)

```bash
make db-up
# Crear/editar api/.env.dev en el servidor
make deploy-api     # Docker :3001
```

### Postman

Importar colección + environment desde `api/docs/`.

---

## Autenticación

- **Dashboard:** `X-API-Key: <DASHBOARD_API_KEY>` (no Bearer).
- **Webhook WhatsApp:** `?token=<WEBHOOK_SECRET>` en la URL.
- **Webhook Wompi:** checksum en header `X-Event-Checksum`.

---

## Bases de datos

| Base | Contenido |
|------|-----------|
| **Local** (`hackathondb`) | Estudiantes demo, productos, inventario, `phone_biofood_map`, conversaciones |
| **Hackathon** (`biofooddb`) | `hackaton_ventas`, `hackaton_recargas` (datos reales del reto) |

**Nota técnica:** el campo `fecha` en `hackaton_ventas` es `text`; las consultas usan `fecha::date` para filtros por rango.

---

## Endpoints de depuración

| Método | Ruta | Uso |
|--------|------|-----|
| POST | `/debug/test-absence` | Disparar alerta de ausencia |
| POST | `/debug/test-allergen` | Revisar alérgenos (última hora) |
| POST | `/debug/simulate-allergen` | Simular compra con alérgeno |

---

## Valor para el hackathon

- Convierte datos de ventas del reto en **dashboard accionable** para cafeterías.
- Conecta **padres por WhatsApp** con saldo, consumo y recomendaciones (IA).
- Demuestra **alertas proactivas** (alérgenos, inventario, ausencias).
- Arquitectura lista para escalar (hexagonal, Docker, variables por entorno).

---

## Enlaces útiles

- [Arquitectura detallada](../../api/.context-course/ARCHITECTURE.md)
- [Endpoints completos](../../api/docs/endpoints.md)
- [Integración frontend](../../api/docs/frontend-api.md)
- [WhatsApp + Evolution](../../api/docs/whatsapp-setup.md)

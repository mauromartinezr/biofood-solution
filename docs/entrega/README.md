# BioFood Connect — Documentación de entrega

Hackathon 2026

---

## Documentos

| Módulo | Archivo | Descripción |
|--------|---------|-------------|
| **API** | [API.md](./API.md) | Backend Go: analítica, WhatsApp, pagos, despliegue |
| **Web** | [WEB.md](./WEB.md) | Dashboard React: 3 vistas operativas |
| **Presentación** | [PRESENTATION.md](./PRESENTATION.md) | Pitch deck interactivo para jurados |

---

## Visión general del monorepo

```
biofood-solution/
├── api/              → Backend (Go + PostgreSQL + Evolution + Claude)
├── web/              → Dashboard cafetería (React)
├── presentation/     → Pitch deck (React + Framer Motion)
├── postgres/         → Seed y setup demo (SQL + Python)
└── docs/entrega/     → Este paquete de entrega
```

---

## Demo rápida (orden sugerido)

1. **Presentación** — `cd presentation && npm run dev` → pitch 5 min.
2. **Web** — `make dev-api` + `cd web && npm run dev` → dashboard con datos reales.
3. **WhatsApp** — enviar mensaje al número de la instancia Evolution → respuesta del bot BioAlert.

---

## URLs de referencia

| Entorno | API | Web (dev) |
|---------|-----|-----------|
| Local | http://localhost:8080 | http://localhost:5173 |
| Producción | https://hack.apptrialhub.com | (configurar `VITE_API_BASE_URL`) |

---

## Equipo y contacto

Completar con nombres del equipo y repositorio Git antes de entregar al hackathon.

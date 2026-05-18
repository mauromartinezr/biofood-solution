# Postman — BioFood API

Generado desde [`endpoints.md`](./endpoints.md).

## Archivos

| Archivo | Uso |
|---------|-----|
| `BioFood-API.postman_collection.json` | 13 endpoints + health |
| `BioFood-API.local.postman_environment.json` | Local / Docker (`:3001`) |
| `BioFood-API.prod.postman_environment.json` | VPS / producción |

## Importar

1. Postman → **Import** → los 3 JSON.
2. Activa **BioFood API — Local** o **Producción (VPS)**.
3. En producción, edita `baseUrl` y `dashboard_api_key`.

## Auth

Header **`X-API-Key: {{dashboard_api_key}}`** (= `DASHBOARD_API_KEY` en `api/.env.dev`).

- Vacío en local si el servidor no tiene clave configurada.
- En VPS, mismo valor que en `.env.dev`.

## Variables

| Variable | Descripción |
|----------|-------------|
| `baseUrl` | `http://localhost:3001` (Docker) o `http://localhost:8080` (Go sin `PORT`) |
| `dashboard_api_key` | Clave del dashboard |
| `studentId` | `usuario_identificacion` (ej. `48291`) |
| `page` / `limit` | Paginación del directorio |

## Probar rápido

1. `GET {{baseUrl}}/health`
2. `GET {{baseUrl}}/api/metrics/global`
3. `GET {{baseUrl}}/api/students/{{studentId}}/profile`

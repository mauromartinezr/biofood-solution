# Biofood API - Arquitectura hexagonal

## Estructura del proyecto

```
api/
├── cmd/
│   ├── server/              # Punto de entrada HTTP
│   └── migrate/             # Migraciones GORM
├── commands/                # Scripts de ejecución
│   ├── dev.sh
│   ├── start.sh
│   └── migrate.sh
├── internal/
│   ├── features/            # Módulos por dominio de negocio
│   │   └── products/
│   │       ├── domain/      # Entidades + puertos (interfaces)
│   │       ├── application/ # Casos de uso (servicio)
│   │       └── adapter/     # Adaptadores de entrada (HTTP)
│   ├── infrastructure/      # Adaptadores de salida + wiring
│   │   ├── config/
│   │   ├── database/        # GORM → implementa puertos
│   │   └── http/            # Echo, rutas, estáticos
│   └── shared/              # Errores, respuestas, validación
└── .context-course/
```

## Capas (hexagonal)

| Capa | Ubicación | Rol |
|------|-----------|-----|
| **Dominio** | `features/*/domain` | Entidades y puertos (`Repository`) sin dependencias externas |
| **Aplicación** | `features/*/application` | Casos de uso; depende solo del dominio |
| **Adaptador entrada** | `features/*/adapter/http` | HTTP (Echo) → llama a la aplicación |
| **Adaptador salida** | `infrastructure/database` | GORM implementa los puertos del dominio |
| **Infra HTTP** | `infrastructure/http` | Montaje del servidor y rutas |

Flujo: `HTTP Handler` → `Application Service` → `Repository (port)` → `GORM Repository (adapter)`.

## Comandos

```bash
# Desarrollo (desde api/)
./commands/dev.sh

# Producción (tras make build desde raíz)
./commands/start.sh

# Solo migraciones
./commands/migrate.sh
```

## Docker y VPS

El módulo Go vive en `api/` (`go.mod` dentro de esta carpeta).

| Escenario | Comando |
|-----------|---------|
| Monorepo local (API + web) | `docker compose -f api/docker-compose.yml up --build` |
| Solo carpeta `api/` en VPS | `cd api && docker compose -f docker-compose.api-only.yml up --build` |
| Subir al VPS | `./api/deploy-vps.sh user@vps:/opt/biofood [--full]` |

`--full` incluye `web/` para compilar el frontend embebido. Sin `--full` solo subes `api/` y usas `Dockerfile.api-only`.

## Stack

- **Go** + **GORM** + **SQLite** (configurable vía `DATABASE_DSN`)
- **Echo** (router)
- Variables: `PORT`, `DATABASE_DSN`

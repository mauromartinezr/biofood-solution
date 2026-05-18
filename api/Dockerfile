# Build completo (API + frontend embebido).
# Contexto de build: raíz del repo (carpeta padre de api/).
#
#   docker compose -f api/docker-compose.yml up --build
#   # o desde api/:
#   docker compose up --build

# --- Stage 1: React ---
FROM node:22-alpine AS web

WORKDIR /web

COPY web/package.json ./
RUN npm install

COPY web/ ./
RUN npm run build

# --- Stage 2: Go (módulo en api/) ---
FROM golang:1.25-alpine AS builder

RUN apk add --no-cache git ca-certificates

WORKDIR /src

COPY api/go.mod api/go.sum ./
RUN go mod download

COPY api/ ./
COPY --from=web /web/dist ./cmd/server/dist

ENV CGO_ENABLED=0
RUN go build -tags prod -ldflags="-w -s" -o /out/main ./cmd/server

# --- Stage 3: runtime ---
FROM alpine:latest

RUN apk --no-cache add ca-certificates wget

RUN adduser -D -s /bin/sh appuser

WORKDIR /app

COPY --from=builder /out/main .
COPY api/.env.dev .env.dev

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 3001

ENV PORT=3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["./main"]

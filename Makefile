APP     := biofood-server
BIN_DIR := bin
WEB_DIR := web
API_DIR := api
API_MAIN := ./cmd/server

# VPS: make deploy-vps VPS=user@host:/opt/biofood
VPS ?=

COMPOSE_FULL     := docker compose -f api/docker-compose.yml
COMPOSE_API_DIR  := docker compose -f docker-compose.api-only.yml
COMPOSE_DB       := docker compose -f postgres/docker-compose.yml

.PHONY: all build build-web build-api dev-web dev-api dev-api-postgres clean tidy help
.PHONY: deploy deploy-api deploy-down deploy-logs deploy-restart
.PHONY: deploy-vps deploy-vps-full
.PHONY: db-up db-down db-logs db-psql

## Full production build: web assets → embedded into binary → bin/
all: build

build: build-web build-api

build-web:
	@echo "==> Building React assets..."
	cd $(WEB_DIR) && npm install && npm run build
	@echo "==> Copying dist into API embed target..."
	rm -rf $(API_DIR)/$(API_MAIN)/dist
	cp -r $(WEB_DIR)/dist $(API_DIR)/$(API_MAIN)/dist

build-api: build-web
	@echo "==> Building Go binary (prod, with embedded assets)..."
	mkdir -p $(BIN_DIR)
	cd $(API_DIR) && go build -tags prod -o ../$(BIN_DIR)/$(APP) $(API_MAIN)
	@echo "==> Binary ready: $(BIN_DIR)/$(APP)"

## Development: run API and web independently
dev-api:
	@echo "==> Starting API (dev mode, no embedded assets)..."
	cd $(API_DIR) && go run $(API_MAIN)

dev-web:
	@echo "==> Starting Vite dev server..."
	cd $(WEB_DIR) && npm install && npm run dev

dev-api-postgres: db-up ## API en dev contra PostgreSQL (puerto 5436)
	@echo "==> Esperando PostgreSQL..."
	@until docker exec postgres3 pg_isready -U hackuser -d hackathondb >/dev/null 2>&1; do sleep 1; done
	@echo "==> Starting API con .env.postgres..."
	cd $(API_DIR) && set -a && . ./.env.postgres && set +a && go run $(API_MAIN)

db-up: ## Levanta PostgreSQL local (localhost:5436)
	$(COMPOSE_DB) up -d
	@echo "==> PostgreSQL: localhost:5436  db=hackathondb  user=hackuser"

db-down: ## Para y elimina el contenedor PostgreSQL
	$(COMPOSE_DB) down

db-logs: ## Logs de PostgreSQL
	$(COMPOSE_DB) logs -f

db-psql: ## Shell psql en el contenedor
	docker exec -it postgres3 psql -U hackuser -d hackathondb

## Docker deploy (local)
deploy: ## Build y levanta API+web en Docker (puerto 3001)
	$(COMPOSE_FULL) up --build -d
	@echo "==> http://localhost:3001  |  health: http://localhost:3001/health"

deploy-api: ## Build y levanta solo API en Docker (sin web embebido)
	cd $(API_DIR) && $(COMPOSE_API_DIR) up --build -d
	@echo "==> http://localhost:3001  |  health: http://localhost:3001/health"

deploy-down: ## Para y elimina contenedores Docker
	-$(COMPOSE_FULL) down
	-cd $(API_DIR) && $(COMPOSE_API_DIR) down

deploy-logs: ## Sigue los logs del contenedor
	$(COMPOSE_FULL) logs -f

deploy-restart: deploy-down deploy ## Rebuild + reinicio

## Docker deploy (VPS vía rsync + instrucciones)
deploy-vps: ## Sube api/ al VPS. Uso: make deploy-vps VPS=user@host:/opt/biofood
ifndef VPS
	$(error Define VPS: make deploy-vps VPS=user@host:/opt/biofood)
endif
	./$(API_DIR)/deploy-vps.sh $(VPS)
	@echo ""
	@echo "En el VPS ejecuta:"
	@echo "  cd $$(echo $(VPS) | cut -d: -f2)/api && docker compose -f docker-compose.api-only.yml up --build -d"

deploy-vps-full: ## Sube api/ + web/ al VPS. Uso: make deploy-vps-full VPS=user@host:/opt/biofood
ifndef VPS
	$(error Define VPS: make deploy-vps-full VPS=user@host:/opt/biofood)
endif
	./$(API_DIR)/deploy-vps.sh $(VPS) --full
	@echo ""
	@echo "En el VPS ejecuta:"
	@echo "  cd $$(echo $(VPS) | cut -d: -f2) && docker compose -f api/docker-compose.yml up --build -d"

## Utilities
tidy:
	cd $(API_DIR) && go mod tidy
	cd $(WEB_DIR) && npm install

clean:
	rm -rf $(BIN_DIR) $(API_DIR)/$(API_MAIN)/dist $(WEB_DIR)/dist

help: ## Muestra esta ayuda
	@grep -E '^[a-zA-Z0-9_-]+:.*##' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

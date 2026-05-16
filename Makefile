APP     := biofood-server
BIN_DIR := bin
WEB_DIR := web
API_DIR := api
API_MAIN := ./cmd/server

.PHONY: all build build-web build-api dev-web dev-api clean tidy docker-up docker-up-api

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

## Docker
docker-up:
	docker compose -f api/docker-compose.yml up --build -d

docker-up-api:
	cd api && docker compose -f docker-compose.api-only.yml up --build -d

## Utilities
tidy:
	cd $(API_DIR) && go mod tidy
	cd $(WEB_DIR) && npm install

clean:
	rm -rf $(BIN_DIR) $(API_DIR)/$(API_MAIN)/dist $(WEB_DIR)/dist

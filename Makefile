.PHONY: up down
# Targets for running the client
up:
	docker-compose up -d --build

down:
	docker-compose down

.PHONY: re-build
re-build:
	docker-compose up --no-deps --build -d chat_frontend

# Restart the app service without rebuilding
.PHONY: restart
restart:
	docker-compose -f docker-compose.yaml restart chat_frontend


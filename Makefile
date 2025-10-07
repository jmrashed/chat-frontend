.PHONY: help install dev build test lint clean up down re-build restart

# Default target
help:
	@echo "Available commands:"
	@echo "  install     - Install dependencies"
	@echo "  dev         - Start development server"
	@echo "  build       - Build for production"
	@echo "  test        - Run tests"
	@echo "  test-watch  - Run tests in watch mode"
	@echo "  test-coverage - Run tests with coverage"
	@echo "  lint        - Run linter"
	@echo "  lint-fix    - Fix linting issues"
	@echo "  clean       - Clean build artifacts"
	@echo "  up          - Start with Docker"
	@echo "  down        - Stop Docker containers"
	@echo "  re-build    - Rebuild Docker container"
	@echo "  restart     - Restart Docker container"

# Development commands
install:
	npm install

dev:
	npm run dev

build:
	npm run build

test:
	npm test

test-watch:
	npm run test:watch

test-coverage:
	npm run test:coverage

lint:
	npm run lint

lint-fix:
	npm run lint -- --fix

clean:
	rm -rf .next out dist coverage node_modules/.cache

# Docker commands
up:
	docker-compose up -d --build

down:
	docker-compose down

re-build:
	docker-compose up --no-deps --build -d chat_frontend

restart:
	docker-compose -f docker-compose.yaml restart chat_frontend


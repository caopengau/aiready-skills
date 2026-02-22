# AIReady Distribution Makefile
# Commands for building and publishing distribution packages

PNPM := $(shell command -v pnpm)

# Colors
CYAN := $(shell tput setaf 6)
GREEN := $(shell tput setaf 2)
YELLOW := $(shell tput setaf 3)
RED := $(shell tput setaf 1)
RESET := $(shell tput sgr0)

.PHONY: docker-build docker-push docker-test \
	vscode-package vscode-publish \
	action-build action-publish \
	homebrew-test homebrew-publish \
	distribution-status distribution-all

# ============================================================================
# Docker
# ============================================================================

docker-build: ## Build Docker image locally
	@echo "$(CYAN)🐳 Building Docker image...$(RESET)"
	docker build -f docker/Dockerfile.slim -t aiready/cli:latest .
	docker build -f docker/Dockerfile.slim -t aiready/cli:$$(node -p "require('./packages/cli/package.json').version") .
	@echo "$(GREEN)✅ Docker image built successfully$(RESET)"

docker-push: docker-build ## Build and push Docker image to registries
	@echo "$(CYAN)🚀 Pushing Docker images...$(RESET)"
	docker push aiready/cli:latest
	docker push aiready/cli:$$(node -p "require('./packages/cli/package.json').version")
	docker tag aiready/cli:latest ghcr.io/caopengau/aiready:latest
	docker push ghcr.io/caopengau/aiready:latest
	@echo "$(GREEN)✅ Docker images pushed successfully$(RESET)"

docker-test: ## Test Docker image
	@echo "$(CYAN)🧪 Testing Docker image...$(RESET)"
	docker run --rm -v $$(pwd):/workspace aiready/cli:latest --version
	@echo "$(GREEN)✅ Docker image tested successfully$(RESET)"

# ============================================================================
# VS Code Extension
# ============================================================================

vscode-package: ## Package VS Code extension as VSIX
	@echo "$(CYAN)📦 Packaging VS Code extension...$(RESET)"
	cd packages/vscode-extension && pnpm install && pnpm run package
	@echo "$(GREEN)✅ VS Code extension packaged$(RESET)"

vscode-publish: ## Publish VS Code extension to Marketplace
	@echo "$(CYAN)🚀 Publishing VS Code extension...$(RESET)"
	cd packages/vscode-extension && vsce publish
	@echo "$(GREEN)✅ VS Code extension published$(RESET)"

# ============================================================================
# GitHub Action (Marketplace)
# ============================================================================

action-build: ## Build GitHub Action for Marketplace
	@echo "$(CYAN)🔨 Building GitHub Action...$(RESET)"
	cd action-marketplace && npm install && npm run build
	@echo "$(GREEN)✅ GitHub Action built$(RESET)"

action-publish: ## Instructions for publishing GitHub Action
	@echo "$(CYAN)📋 GitHub Action Publishing Steps:$(RESET)"
	@echo ""
	@echo "1. Create standalone repository:"
	@echo "   gh repo create aiready-action --public"
	@echo ""
	@echo "2. Copy action files to the new repo:"
	@echo "   cp -r action-marketplace/* /path/to/aiready-action/"
	@echo ""
	@echo "3. Create release and publish:"
	@echo "   gh release create v1 --title 'v1.0.0'"
	@echo ""
	@echo "4. Publish to Marketplace via GitHub UI"

# ============================================================================
# Homebrew
# ============================================================================

homebrew-test: ## Test Homebrew formula locally
	@echo "$(CYAN)🧪 Testing Homebrew formula...$(RESET)"
	brew audit --formula homebrew/aiready.rb || true
	@echo "$(GREEN)✅ Homebrew formula tested$(RESET)"

homebrew-publish: ## Instructions for publishing to Homebrew tap
	@echo "$(CYAN)📋 Homebrew Publishing Steps:$(RESET)"
	@echo ""
	@echo "1. Create homebrew-tap repository"
	@echo "2. Copy formula to Formula/ directory"
	@echo "3. Update SHA256 hash"
	@echo "4. Users can: brew tap caopengau/tap && brew install aiready"

# ============================================================================
# Status & Overview
# ============================================================================

distribution-status: ## Show distribution channels status
	@echo ""
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(RESET)"
	@echo "$(CYAN)              AIReady Distribution Channels Status         $(RESET)"
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(RESET)"
	@echo ""
	@echo "$(GREEN)✅ npm (@aiready/cli)$(RESET)"
	@echo "   Version: $$(node -p "require('./packages/cli/package.json').version")"
	@echo ""
	@echo "$(YELLOW)📦 Docker$(RESET)"
	@echo "   Run: make docker-build docker-push"
	@echo ""
	@echo "$(YELLOW)📦 GitHub Actions Marketplace$(RESET)"
	@echo "   Run: make action-build action-publish"
	@echo ""
	@echo "$(YELLOW)📦 VS Code Extension$(RESET)"
	@echo "   Run: make vscode-package vscode-publish"
	@echo ""
	@echo "$(YELLOW)📦 Homebrew$(RESET)"
	@echo "   Run: make homebrew-publish"
	@echo ""
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(RESET)"
	@echo ""

# ============================================================================
# All-in-one
# ============================================================================

distribution-all: docker-build vscode-package action-build ## Build all distribution packages
	@echo "$(GREEN)✅ All distribution packages built$(RESET)"

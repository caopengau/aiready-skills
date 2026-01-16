###############################################################################
# Makefile.build: Build-related targets
###############################################################################
include makefiles/Makefile.shared.mk

.PHONY: build build-core build-pattern-detect dev dev-core dev-pattern-detect dev-landing

build: ## Build all packages
	@$(call log_step,Building all packages...)
	@if command -v turbo >/dev/null 2>&1; then \
		turbo run build; \
	else \
		$(PNPM) run build; \
	fi
	@$(call log_success,All packages built successfully)

build-core: ## Build core package only
	@$(call log_info,Building @aiready/core...)
	@$(PNPM) $(SILENT_PNPM) --filter @aiready/core build
	@$(call log_success,Core package built)

build-pattern-detect: ## Build pattern-detect package only
	@$(call log_info,Building @aiready/pattern-detect...)
	@$(PNPM) $(SILENT_PNPM) --filter @aiready/pattern-detect build
	@$(call log_success,Pattern-detect package built)

dev: ## Start development mode (watch) for all packages
	@$(call log_step,Starting development mode with watch...)
	@if command -v turbo >/dev/null 2>&1; then \
		turbo run dev; \
	else \
		$(PNPM) run dev; \
	fi

dev-core: ## Start development mode (watch) for core package
	@$(call log_info,Starting development mode for @aiready/core...)
	@$(PNPM) --filter @aiready/core dev

dev-pattern-detect: ## Start development mode (watch) for pattern-detect package
	@$(call log_info,Starting development mode for @aiready/pattern-detect...)
	@$(PNPM) --filter @aiready/pattern-detect dev

dev-landing: ## Start landing page dev server at http://localhost:3000
	@$(call log_step,Starting landing page dev server...)
	@echo "$(CYAN)Landing page will be available at: $(GREEN)http://localhost:3000$(NC)"
	@$(PNPM) --filter @aiready/landing dev

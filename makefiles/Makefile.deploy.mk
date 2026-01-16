# Deployment Automation
# Deploy landing page and services to AWS

include makefiles/Makefile.shared.mk

.PHONY: deploy-landing deploy-landing-prod deploy-landing-remove landing-logs

##@ Deployment

deploy-landing: ## Deploy landing page to AWS (dev environment)
	@$(call log_step,Deploying landing page to AWS (dev))
	@echo "$(CYAN)Using AWS Profile: $(AWS_PROFILE)$(NC)"
	@echo "$(CYAN)Using AWS Region: $(AWS_REGION)$(NC)"
	@cd landing && \
		AWS_PROFILE=$(AWS_PROFILE) AWS_REGION=$(AWS_REGION) sst deploy
	@$(call log_success,Landing page deployed to dev)

deploy-landing-prod: ## Deploy landing page to AWS (production)
	@$(call log_step,Deploying landing page to AWS (production))
	@echo "$(YELLOW)⚠️  Deploying to PRODUCTION$(NC)"
	@echo "$(CYAN)Using AWS Profile: $(AWS_PROFILE)$(NC)"
	@echo "$(CYAN)Using AWS Region: $(AWS_REGION)$(NC)"
	@cd landing && \
		AWS_PROFILE=$(AWS_PROFILE) AWS_REGION=$(AWS_REGION) sst deploy --stage production
	@$(call log_success,Landing page deployed to production)

deploy-landing-remove: ## Remove landing page deployment (dev)
	@$(call log_warning,Removing landing page deployment from AWS (dev))
	@cd landing && \
		AWS_PROFILE=$(AWS_PROFILE) AWS_REGION=$(AWS_REGION) sst remove
	@$(call log_success,Landing page deployment removed)

landing-logs: ## Show landing page logs (requires SST dashboard)
	@$(call log_step,Opening SST dashboard for logs)
	@cd landing && \
		AWS_PROFILE=$(AWS_PROFILE) AWS_REGION=$(AWS_REGION) sst dev

deploy-check: ## Check AWS credentials and SST installation
	@echo "$(CYAN)🔍 Checking deployment prerequisites...$(NC)\n"
	@echo "$(GREEN)AWS Profile:$(NC) $(AWS_PROFILE)"
	@echo "$(GREEN)AWS Region:$(NC) $(AWS_REGION)"
	@echo ""
	@if command -v sst >/dev/null 2>&1; then \
		echo "$(GREEN)✓ SST CLI installed:$(NC) $$(sst --version)"; \
	else \
		echo "$(RED)✗ SST CLI not found$(NC)"; \
		echo "  Install: npm install -g sst@ion"; \
		exit 1; \
	fi
	@echo ""
	@if aws sts get-caller-identity --profile $(AWS_PROFILE) >/dev/null 2>&1; then \
		echo "$(GREEN)✓ AWS credentials valid$(NC)"; \
		aws sts get-caller-identity --profile $(AWS_PROFILE) | \
			jq -r '"  Account: \(.Account)\n  User: \(.Arn)"'; \
	else \
		echo "$(RED)✗ AWS credentials invalid or not found$(NC)"; \
		echo "  Configure: aws configure --profile $(AWS_PROFILE)"; \
		exit 1; \
	fi
	@echo ""
	@$(call log_success,All prerequisites met)

deploy-landing-status: ## Show current deployment status
	@echo "$(CYAN)📊 Landing Page Deployment Status$(NC)\n"
	@cd landing && \
		AWS_PROFILE=$(AWS_PROFILE) AWS_REGION=$(AWS_REGION) sst list || \
		echo "$(YELLOW)No deployments found$(NC)"

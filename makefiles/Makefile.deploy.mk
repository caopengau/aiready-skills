# Deployment Automation
# Deploy landing page and services to AWS

include makefiles/Makefile.shared.mk

.PHONY: deploy-landing deploy-landing-prod deploy-landing-remove landing-logs landing-verify landing-cleanup

##@ Deployment

deploy-landing: ## Deploy landing page to AWS (dev environment)
	@$(call log_step,Deploying landing page to AWS (dev))
	@echo "$(CYAN)Using AWS Profile: $(AWS_PROFILE)$(NC)"
	@echo "$(CYAN)Using AWS Region: $(AWS_REGION)$(NC)"
	@cd landing && \
		set -a && [ -f .env ] && . ./.env || true && set +a && \
		export AWS_PROFILE=$${AWS_PROFILE:-$(AWS_PROFILE)} && \
		export AWS_REGION=$${AWS_REGION:-$(AWS_REGION)} && \
		export CLOUDFLARE_API_TOKEN="$${CLOUDFLARE_API_TOKEN}" && \
		export CLOUDFLARE_ACCOUNT_ID="$${CLOUDFLARE_ACCOUNT_ID}" && \
		sst deploy
	@$(call log_success,Landing page deployed to dev)

deploy-landing-prod: ## Deploy landing page to AWS (production)
	@$(call log_step,Deploying landing page to AWS (production))
	@echo "$(YELLOW)⚠️  Deploying to PRODUCTION$(NC)"
	@echo "$(CYAN)Using AWS Profile: $(AWS_PROFILE)$(NC)"
	@echo "$(CYAN)Using AWS Region: $(AWS_REGION)$(NC)"
	@cd landing && \
		set -a && [ -f .env ] && . ./.env || true && set +a && \
		export AWS_PROFILE=$${AWS_PROFILE:-$(AWS_PROFILE)} && \
		export AWS_REGION=$${AWS_REGION:-$(AWS_REGION)} && \
		export CLOUDFLARE_API_TOKEN="$${CLOUDFLARE_API_TOKEN}" && \
		export CLOUDFLARE_ACCOUNT_ID="$${CLOUDFLARE_ACCOUNT_ID}" && \
		sst deploy --stage production
	@$(call log_success,Landing page deployed to production)
	@echo "$(CYAN)💡 Blog files synced during build, CloudFront invalidated automatically$(NC)"
	@echo ""
	@$(MAKE) landing-verify VERIFY_RETRIES=3 VERIFY_WAIT=10

landing-verify: ## Check CloudFront distribution propagation status
	@$(call log_step,Checking CloudFront distribution status)
	@RETRIES=$${VERIFY_RETRIES:-1}; \
	WAIT=$${VERIFY_WAIT:-0}; \
	cd landing && \
	for i in $$(seq 1 $$RETRIES); do \
		DIST_ID=$$(AWS_PROFILE=$(AWS_PROFILE) AWS_REGION=$(AWS_REGION) sst list --stage production 2>/dev/null | awk '/distributionId:/ {print $$2}'); \
		if [ -z "$$DIST_ID" ]; then \
			if [ $$RETRIES -gt 1 ]; then \
				echo "$(YELLOW)⚠️  Attempt $$i/$$RETRIES: Could not find CloudFront distribution from SST outputs$(NC)"; \
			else \
				echo "$(YELLOW)⚠️  Could not find CloudFront distribution from SST outputs$(NC)"; \
			fi; \
			if [ $$i -eq $$RETRIES ]; then \
				echo "$(RED)✗ Distribution not found$(NC)"; \
				echo "$(YELLOW)💡 First deploy? Run 'make deploy-landing-prod' again to apply aliases$(NC)"; \
				exit 1; \
			fi; \
			[ $$WAIT -gt 0 ] && sleep $$WAIT; \
		else \
			STATUS=$$(aws cloudfront get-distribution --id $$DIST_ID --profile $(AWS_PROFILE) 2>/dev/null | jq -r '.Distribution.Status'); \
			echo "$(CYAN)Distribution ID: $$DIST_ID$(NC)"; \
			if [ "$$STATUS" = "Deployed" ]; then \
				echo "$(GREEN)✓ Status: Deployed - Site is live!$(NC)"; \
				echo "$(CYAN)🌐 URL: https://getaiready.dev$(NC)"; \
				break; \
			elif [ "$$STATUS" = "InProgress" ]; then \
				if [ $$RETRIES -gt 1 ]; then \
					echo "$(YELLOW)⏳ Attempt $$i/$$RETRIES: Status is InProgress$(NC)"; \
				else \
					echo "$(YELLOW)⏳ Status: InProgress - CloudFront is deploying changes$(NC)"; \
				fi; \
				if [ $$i -eq $$RETRIES ]; then \
					echo "$(YELLOW)CloudFront is still deploying (takes 5-15 minutes)$(NC)"; \
					echo "$(CYAN)💡 Monitor: make landing-verify$(NC)"; \
					echo "$(CYAN)💡 Or redeploy: make deploy-landing-prod$(NC)"; \
				else \
					[ $$WAIT -gt 0 ] && sleep $$WAIT; \
				fi; \
			else \
				echo "$(YELLOW)Status: $$STATUS$(NC)"; \
				break; \
			fi; \
		fi; \
	done
	@echo ""

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

domain-status: ## Check Cloudflare zone status and nameservers
	@$(call log_step,Checking Cloudflare zone status)
	@cd landing && \
		set -a && [ -f .env ] && . ./.env || true && set +a && \
		if [ -z "$$CLOUDFLARE_API_TOKEN" ] || [ -z "$$CLOUDFLARE_ACCOUNT_ID" ]; then \
			echo "$(YELLOW)Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID$(NC)"; exit 1; \
		fi; \
		curl -s -H "Authorization: Bearer $$CLOUDFLARE_API_TOKEN" "https://api.cloudflare.com/client/v4/zones?name=$${DOMAIN_NAME:-getaiready.dev}&account.id=$$CLOUDFLARE_ACCOUNT_ID" | jq '{success, result: ( .result[] | {id, name, status, name_servers, account: .account.id} )}' || true

leads-export: ## Export submissions from S3 to local CSV
	@$(call log_step,Exporting leads from S3)
	@mkdir -p .aiready/leads/submissions
	@bucket=$$(cd landing && AWS_PROFILE=$(AWS_PROFILE) AWS_REGION=$(AWS_REGION) sst list | awk '/submissionsBucket:/ {print $$2}'); \
	if [ -z "$$bucket" ]; then \
		echo "$(RED)✗ Could not detect submissions bucket$(NC)"; exit 1; \
	fi; \
	aws s3 sync s3://$$bucket/submissions .aiready/leads/submissions --delete --profile $(AWS_PROFILE) || exit 1; \
	jq -r '["email","repoUrl","receivedAt"], (.aiready/leads/submissions/*.json | map( [ .email, .repoUrl, .receivedAt ] ))[] | @csv' \
		<(jq -s '.' .aiready/leads/submissions/*.json 2>/dev/null) > .aiready/leads/leads.csv 2>/dev/null || \
		echo "$(YELLOW)No submissions found yet$(NC)"; \
	echo "$(GREEN)✓ Exported to .aiready/leads/leads.csv$(NC)"

leads-open: ## Open leads folder
	@open .aiready/leads 2>/dev/null || xdg-open .aiready/leads 2>/dev/null || echo "Path: .aiready/leads"

landing-cleanup: ## Clean up stale AWS resources from old deployments
	@$(call log_warning,Scanning for stale AWS resources)
	@echo "$(CYAN)Checking CloudFront distributions...$(NC)"
	@OLD_DISTS=$$(aws cloudfront list-distributions --profile $(AWS_PROFILE) 2>/dev/null | \
		jq -r '.DistributionList.Items[] | select(.Aliases.Quantity == 0 and (.Comment | contains("aiready") or contains("landing"))) | .Id'); \
	if [ -n "$$OLD_DISTS" ]; then \
		echo "$(YELLOW)Found CloudFront distributions without aliases:$(NC)"; \
		for dist in $$OLD_DISTS; do \
			DOMAIN=$$(aws cloudfront get-distribution --id $$dist --profile $(AWS_PROFILE) 2>/dev/null | jq -r '.Distribution.DomainName'); \
			echo "  - $$dist ($$DOMAIN)"; \
		done; \
		echo "$(YELLOW)💡 To disable: aws cloudfront get-distribution-config --id <ID> > /tmp/dist.json$(NC)"; \
		echo "$(YELLOW)   Then: aws cloudfront update-distribution --id <ID> --if-match <ETag> --distribution-config <config-with-Enabled=false>$(NC)"; \
		echo "$(YELLOW)   Finally: aws cloudfront delete-distribution --id <ID> --if-match <ETag>$(NC)"; \
	else \
		echo "$(GREEN)✓ No stale CloudFront distributions$(NC)"; \
	fi
	@echo ""
	@echo "$(CYAN)Checking Lambda functions...$(NC)"
	@OLD_LAMBDAS=$$(aws lambda list-functions --region $(AWS_REGION) --profile $(AWS_PROFILE) 2>/dev/null | \
		jq -r '.Functions[] | select(.FunctionName | contains("pengcao") or contains("dev")) | .FunctionName'); \
	if [ -n "$$OLD_LAMBDAS" ]; then \
		echo "$(YELLOW)Found dev/test Lambda functions:$(NC)"; \
		for func in $$OLD_LAMBDAS; do \
			echo "  - $$func"; \
		done; \
		echo "$(YELLOW)💡 To delete: aws lambda delete-function --function-name <NAME> --region $(AWS_REGION)$(NC)"; \
	else \
		echo "$(GREEN)✓ No stale Lambda functions$(NC)"; \
	fi
	@echo ""
	@echo "$(CYAN)Checking ACM certificates...$(NC)"
	@aws acm list-certificates --region us-east-1 --profile $(AWS_PROFILE) 2>/dev/null | \
		jq -r '.CertificateSummaryList[] | select(.DomainName == "getaiready.dev") | "\(.CertificateArn) - InUse: \(.InUse)"' | \
		while read -r cert; do echo "  $$cert"; done
	@echo "$(CYAN)💡 Certificates are auto-deleted when CloudFront distributions are removed$(NC)"
	@echo ""
	@$(call log_success,Cleanup scan complete)

###############################################################################
# Makefile.publish: Publishing spokes to GitHub and npm
#
# IMPORTANT: Always use 'pnpm publish' (not 'npm publish')
# - workspace:* protocol in package.json is pnpm-specific
# - pnpm publish auto-converts workspace:* to actual versions
# - npm publish fails with EUNSUPPORTEDPROTOCOL error
# See .github/copilot-instructions.md for details
###############################################################################
# Resolve this makefile's directory to allow absolute invocation
MAKEFILE_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(MAKEFILE_DIR)/Makefile.shared.mk
REPO_ROOT := $(abspath $(MAKEFILE_DIR)/..)

.PHONY: publish npm-publish npm-login npm-check npm-publish-all \
	version-patch version-minor version-major \
        publish-core publish-pattern-detect publish-skills \
        npm-publish-core npm-publish-pattern-detect npm-publish-skills \
        pull sync-from-spoke sync deploy push

# Default owner for GitHub repos
OWNER ?= caopengau
# Default branch name to push to
TARGET_BRANCH ?= main

# Validate SPOKE parameter is provided
define require_spoke
	@if [ -z "$(SPOKE)" ]; then \
		$(call log_error,SPOKE parameter required. Usage: make $@ SPOKE=pattern-detect); \
		exit 1; \
	fi; \
	if [ ! -d "$(REPO_ROOT)/packages/$(SPOKE)" ]; then \
		$(call log_error,Package packages/$(SPOKE) not found); \
		exit 1; \
	fi
endef

npm-check: ## Check npm login status
	@$(call log_step,Checking npm authentication...)
	@if ! npm whoami >/dev/null 2>&1; then \
		$(call log_error,Not logged into npm. Prompting for login...); \
		echo ""; \
		printf "Would you like to login now? (Y/n): "; \
		read response; \
		response=$${response:-Y}; \
		case $$response in \
			[Yy]|[Yy][Ee][Ss]) \
				$(MAKE) npm-login; \
				if npm whoami >/dev/null 2>&1; then \
					$(call log_success,Logged into npm as $$(npm whoami)); \
				else \
					$(call log_error,NPM login failed. Aborting release.); \
					exit 1; \
				fi \
				;; \
			*) \
				$(call log_error,NPM login required for publishing. Aborting release.); \
				exit 1 ;; \
		esac; \
	else \
		$(call log_success,Logged into npm as $$(npm whoami)); \
	fi

npm-login: ## Login to npm registry
	@$(call log_step,Logging into npm...)
	@npm login

# Generic version bumping (requires SPOKE parameter)
version-patch: ## Bump spoke patch version (0.1.0 -> 0.1.1). Usage: make version-patch SPOKE=pattern-detect
	$(call require_spoke)
	@$(call log_step,Bumping @aiready/$(SPOKE) patch version...)
# dangerous suppress errors because version does gets bumped
	@cd packages/$(SPOKE) && pnpm version patch --no-git-tag-version 2>/dev/null || true
	@$(call log_success,Version bumped to $$(cd packages/$(SPOKE) && node -p "require('./package.json').version"))

version-minor: ## Bump spoke minor version (0.1.0 -> 0.2.0). Usage: make version-minor SPOKE=pattern-detect
	$(call require_spoke)
	@$(call log_step,Bumping @aiready/$(SPOKE) minor version...)
# dangerous suppress errors because version does gets bumped
	@cd packages/$(SPOKE) && pnpm version minor --no-git-tag-version 2>/dev/null || true
	@$(call log_success,Version bumped to $$(cd packages/$(SPOKE) && node -p "require('./package.json').version"))

version-major: ## Bump spoke major version (0.1.0 -> 1.0.0). Usage: make version-major SPOKE=pattern-detect
	$(call require_spoke)
	@$(call log_step,Bumping @aiready/$(SPOKE) major version...)
# dangerous suppress errors because version does gets bumped
	@cd packages/$(SPOKE) && pnpm version major --no-git-tag-version 2>/dev/null || true
	@$(call log_success,Version bumped to $$(cd packages/$(SPOKE) && node -p "require('./package.json').version"))

# Generic npm publish (requires SPOKE parameter)
npm-publish: npm-check ## Publish spoke to npm. Usage: make npm-publish SPOKE=pattern-detect
	$(call require_spoke)
	@$(call log_step,Publishing @aiready/$(SPOKE) to npm...)
	@# CRITICAL: Use pnpm publish (not npm) to resolve workspace:* dependencies
	@cd packages/$(SPOKE) && pnpm publish --access public --no-git-checks || { \
		$(call log_error,Publish failed); \
		exit 1; \
	}
	@$(call log_success,Published @aiready/$(SPOKE) to npm)

# Generic GitHub publish (requires SPOKE parameter)
publish: ## Publish spoke to GitHub. Usage: make publish SPOKE=pattern-detect [OWNER=username]
	$(call require_spoke)
	@$(call log_step,Publishing @aiready/$(SPOKE) to GitHub...)
	@url="https://github.com/$(OWNER)/aiready-$(SPOKE).git"; \
	remote="aiready-$(SPOKE)"; \
	branch="publish-$(SPOKE)"; \
	git remote add "$$remote" "$$url" 2>/dev/null || git remote set-url "$$remote" "$$url"; \
	$(call log_info,Remote set: $$remote -> $$url); \
	git branch -D "$$branch" >/dev/null 2>&1 || true; \
	git subtree split --prefix=packages/$(SPOKE) -b "$$branch" >/dev/null; \
	$(call log_info,Subtree split complete: $$branch); \
	split_commit=$$(git rev-parse "$$branch"); \
	git push -f "$$remote" "$$branch":$(TARGET_BRANCH); \
	$(call log_success,Synced @aiready/$(SPOKE) to GitHub spoke repo ($(TARGET_BRANCH))); \
	version=$$(node -p "require('./packages/$(SPOKE)/package.json').version"); \
	spoke_tag="v$$version"; \
	$(call log_step,Tagging spoke repo commit $$split_commit as $$spoke_tag...); \
	if git ls-remote --tags "$$remote" "$$spoke_tag" | grep -q "$$spoke_tag"; then \
		$(call log_info,Spoke tag $$spoke_tag already exists on $$remote; skipping); \
	else \
		git tag -a "$$spoke_tag" "$$split_commit" -m "Release @aiready/$(SPOKE) $$version"; \
		git push "$$remote" "$$spoke_tag"; \
		$(call log_success,Spoke tag pushed: $$spoke_tag); \
	fi

# Convenience aliases for specific spokes
publish-core: ## Publish @aiready/core to GitHub (shortcut for: make publish SPOKE=core)
	@$(MAKE) publish SPOKE=core OWNER=$(OWNER)

publish-pattern-detect: ## Publish @aiready/pattern-detect to GitHub (shortcut for: make publish SPOKE=pattern-detect)
	@$(MAKE) publish SPOKE=pattern-detect OWNER=$(OWNER)

publish-context-analyzer: ## Publish @aiready/context-analyzer to GitHub (shortcut for: make publish SPOKE=context-analyzer)
	@$(MAKE) publish SPOKE=context-analyzer OWNER=$(OWNER)

publish-cli: ## Publish @aiready/cli to GitHub (shortcut for: make publish SPOKE=cli)
	@$(MAKE) publish SPOKE=cli OWNER=$(OWNER)

publish-skills: ## Publish @aiready/skills to GitHub (shortcut for: make publish SPOKE=skills)
	@$(MAKE) publish SPOKE=skills OWNER=$(OWNER)

npm-publish-core: ## Publish @aiready/core to npm (shortcut for: make npm-publish SPOKE=core)
	@$(MAKE) npm-publish SPOKE=core OTP=$(OTP)

npm-publish-pattern-detect: ## Publish @aiready/pattern-detect to npm (shortcut for: make npm-publish SPOKE=pattern-detect)
	@$(MAKE) npm-publish SPOKE=pattern-detect OTP=$(OTP)

npm-publish-context-analyzer: ## Publish @aiready/context-analyzer to npm (shortcut for: make npm-publish SPOKE=context-analyzer)
	@$(MAKE) npm-publish SPOKE=context-analyzer OTP=$(OTP)

npm-publish-cli: ## Publish @aiready/cli to npm (shortcut for: make npm-publish SPOKE=cli)
	@$(MAKE) npm-publish SPOKE=cli OTP=$(OTP)

# Note: skills is NOT published to npm, only via skills.sh (GitHub)

npm-publish-all: build npm-publish-core npm-publish-pattern-detect npm-publish-context-analyzer npm-publish-cli

# Sync changes from spoke repos back to monorepo (for external contributions)
sync-from-spoke: ## Sync changes from spoke repo back to monorepo. Usage: make sync-from-spoke SPOKE=pattern-detect
	$(call require_spoke)
	@$(call log_step,Syncing changes from aiready-$(SPOKE) back to monorepo...)
	@url="https://github.com/$(OWNER)/aiready-$(SPOKE).git"; \
	remote="aiready-$(SPOKE)"; \
	git remote add "$$remote" "$$url" 2>/dev/null || git remote set-url "$$remote" "$$url"; \
	$(call log_info,Fetching latest from $$remote...); \
	git fetch "$$remote" $(TARGET_BRANCH); \
	$(call log_info,Pulling changes into packages/$(SPOKE)...); \
	git subtree pull --prefix=packages/$(SPOKE) "$$remote" $(TARGET_BRANCH) --squash -m "chore: sync $(SPOKE) from public repo"; \
	$(call log_success,Synced changes from aiready-$(SPOKE))

pull: ## Alias for sync-from-spoke. Usage: make pull SPOKE=pattern-detect
	@$(MAKE) sync-from-spoke SPOKE=$(SPOKE)

push: sync ## Alias for sync
push-all: sync ## Alias for sync (push monorepo + publish all spokes)

# Sync changes from platform repo back to monorepo
sync-platform: ## Sync changes from aiready-platform repo back to monorepo
	@$(call log_step,Syncing changes from aiready-platform back to monorepo...)
	@url="https://github.com/$(OWNER)/aiready-platform.git"; \
	remote="aiready-platform"; \
	branch="main"; \
	git remote add "$$remote" "$$url" 2>/dev/null || git remote set-url "$$remote" "$$url"; \
	$(call log_info,Fetching latest from $$remote...); \
	git fetch "$$remote" "$$branch"; \
	$(call log_info,Pulling changes into platform/ directory...); \
	git subtree pull --prefix=platform "$$remote" "$$branch" --squash -m "chore: sync platform from private repo"; \
	$(call log_success,Synced changes from aiready-platform)

publish-platform: ## Publish platform to GitHub. Usage: make publish-platform [OWNER=username]
	@$(call log_step,Publishing platform to GitHub...)
	@url="https://github.com/$(OWNER)/aiready-platform.git"; \
	remote="aiready-platform"; \
	branch="publish-platform"; \
	target_branch="main"; \
	platform_version=$$(node -p "require('$(REPO_ROOT)/platform/package.json').version" 2>/dev/null || echo "0.1.0"); \
	git remote add "$$remote" "$$url" 2>/dev/null || git remote set-url "$$remote" "$$url"; \
	$(call log_info,Remote set: $$remote -> $$url); \
	git branch -D "$$branch" >/dev/null 2>&1 || true; \
	$(call log_info,Creating subtree split for platform...); \
	git subtree split --prefix=platform -b "$$branch" >/dev/null; \
	$(call log_info,Removing sensitive files from split branch...); \
	git checkout "$$branch" 2>/dev/null; \
	if [ -f .env ]; then git rm -f .env >/dev/null 2>&1; fi; \
	if [ -f .env.local ]; then git rm -f .env.local >/dev/null 2>&1; fi; \
	if ! git diff --cached --quiet 2>/dev/null; then \
		git commit -m "chore: remove sensitive files for private repo" >/dev/null 2>&1; \
	fi; \
	git checkout $(TARGET_BRANCH) 2>/dev/null; \
	$(call log_info,Subtree split complete: $$branch); \
	split_commit=$$(git rev-parse "$$branch"); \
	git push -f "$$remote" "$$branch:$$target_branch"; \
	$(call log_success,Synced platform to GitHub repo ($$target_branch)); \
	platform_tag="v$$platform_version"; \
	git tag -f "$$platform_tag" "$$split_commit" 2>/dev/null || true; \
	git push -f "$$remote" "$$platform_tag"; \
	$(call log_success,Platform tag pushed: $$platform_tag)

# Sync changes from landing repo back to monorepo
sync-landing: ## Sync changes from aiready-landing repo back to monorepo
	@$(call log_step,Syncing changes from aiready-landing back to monorepo...)
	@url="https://github.com/$(OWNER)/aiready-landing.git"; \
	remote="aiready-landing"; \
	branch="main"; \
	git remote add "$$remote" "$$url" 2>/dev/null || git remote set-url "$$remote" "$$url"; \
	$(call log_info,Fetching latest from $$remote...); \
	git fetch "$$remote" "$$branch"; \
	$(call log_info,Pulling changes into landing/ directory...); \
	git subtree pull --prefix=landing "$$remote" "$$branch" --squash -m "chore: sync landing page from public repo"; \
	$(call log_success,Synced changes from aiready-landing)

publish-landing: ## Publish landing page to GitHub. Usage: make publish-landing [OWNER=username]
	@$(call log_step,Publishing landing page to GitHub...)
	@url="https://github.com/$(OWNER)/aiready-landing.git"; \
	remote="aiready-landing"; \
	branch="publish-landing"; \
	target_branch="main"; \
	landing_version=$$(node -p "require('$(REPO_ROOT)/landing/package.json').version" 2>/dev/null || echo "0.0.0"); \
	git remote add "$$remote" "$$url" 2>/dev/null || git remote set-url "$$remote" "$$url"; \
	$(call log_info,Remote set: $$remote -> $$url); \
	git branch -D "$$branch" >/dev/null 2>&1 || true; \
	$(call log_info,Creating subtree split excluding sst.config.ts and .env...); \
	git subtree split --prefix=landing -b "$$branch" >/dev/null; \
	$(call log_info,Removing sensitive files from split branch...); \
	git checkout "$$branch" 2>/dev/null; \
	if [ -f sst.config.ts ]; then git rm -f sst.config.ts >/dev/null 2>&1; fi; \
	if [ -f .env ]; then git rm -f .env >/dev/null 2>&1; fi; \
	if ! git diff --cached --quiet 2>/dev/null; then \
		git commit -m "chore: remove sensitive files for public repo" >/dev/null 2>&1; \
	fi; \
	git checkout $(TARGET_BRANCH) 2>/dev/null; \
	$(call log_info,Subtree split complete: $$branch); \
	split_commit=$$(git rev-parse "$$branch"); \
	git push -f "$$remote" "$$branch:$$target_branch"; \
	$(call log_success,Synced landing page to GitHub repo ($$target_branch)); \
	$(call log_step,Tagging landing repo commit with v$$landing_version...); \
	landing_tag="v$$landing_version"; \
	git tag -f "$$landing_tag" "$$split_commit" 2>/dev/null || true; \
	git push -f "$$remote" "$$landing_tag"; \
	$(call log_success,Landing tag pushed: $$landing_tag)

# Push to monorepo and all spoke repos
sync: ## Push monorepo to origin and sync all spokes to their public repos
	@$(call log_step,Pushing to monorepo...)
	@git push origin $(TARGET_BRANCH)
	@$(call log_success,Pushed to monorepo)
	@$(call log_step,Syncing all spoke repositories...)
	@for spoke in $(ALL_SPOKES); do \
		if [ -f "$(REPO_ROOT)/packages/$$spoke/package.json" ]; then \
			$(call log_info,Syncing $$spoke...); \
			$(MAKE) publish SPOKE=$$spoke OWNER=$(OWNER) 2>&1 | grep -E '(SUCCESS|ERROR)' || true; \
		fi; \
	done
	@$(call log_step,Syncing landing page repository...)
	@$(MAKE) publish-landing OWNER=$(OWNER) 2>&1 | grep -E '(SUCCESS|ERROR)' || true; \
	$(call log_success,All spokes and landing page synced to GitHub)

deploy: sync ## Alias for sync (push monorepo + publish all spokes)
	@:-pattern-detect ## Build and publish all packages to npm
	@$(call log_success,All packages published to npm)

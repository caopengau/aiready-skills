# Stats and Analytics Tracking
# Track NPM downloads, GitHub metrics, and package health

include makefiles/Makefile.shared.mk

.PHONY: stats stats-npm stats-github stats-all stats-weekly stats-export

# Package names
PACKAGES := @aiready/cli @aiready/pattern-detect @aiready/context-analyzer @aiready/consistency @aiready/core

# Date helpers
WEEK_AGO := $(shell date -v-7d +%Y-%m-%d 2>/dev/null || date -d '7 days ago' +%Y-%m-%d)
MONTH_AGO := $(shell date -v-30d +%Y-%m-%d 2>/dev/null || date -d '30 days ago' +%Y-%m-%d)
TODAY := $(shell date +%Y-%m-%d)

##@ Stats & Analytics

stats: ## Show quick stats summary
	@echo "$(CYAN)📊 AIReady Package Stats$(NC)\n"
	@$(MAKE) -s stats-npm
	@echo ""
	@$(MAKE) -s stats-github
	@echo ""
	@echo "$(YELLOW)💡 Note: Early-stage packages see 50-100x inflation from development.$(NC)"
	@echo "$(YELLOW)   See docs/UNDERSTANDING-REAL-USAGE.md for honest metrics.$(NC)"

stats-npm: ## Show NPM download statistics
	@echo "$(GREEN)📦 NPM Downloads (Last 7 Days)$(NC)\n"
	@for pkg in $(PACKAGES); do \
		echo "$(YELLOW)$$pkg$(NC)"; \
		curl -s "https://api.npmjs.org/downloads/point/last-week/$$pkg" | \
			jq -r '"  Downloads: \(.downloads // 0)"' 2>/dev/null || echo "  (API error)"; \
		curl -s "https://registry.npmjs.org/$$pkg/latest" | \
			jq -r '"  Version: \(.version // "unknown")"' 2>/dev/null || echo ""; \
		echo ""; \
	done

stats-npm-detailed: ## Show detailed NPM statistics with trends
	@echo "$(GREEN)📦 Detailed NPM Statistics$(NC)\n"
	@for pkg in $(PACKAGES); do \
		echo "$(YELLOW)$$pkg$(NC)"; \
		echo "  Last Week:"; \
		curl -s "https://api.npmjs.org/downloads/point/last-week/$$pkg" | \
			jq -r '"    \(.downloads // 0) downloads"' 2>/dev/null || echo "    (error)"; \
		echo "  Last Month:"; \
		curl -s "https://api.npmjs.org/downloads/point/last-month/$$pkg" | \
			jq -r '"    \(.downloads // 0) downloads"' 2>/dev/null || echo "    (error)"; \
		echo "  Package Info:"; \
		curl -s "https://registry.npmjs.org/$$pkg/latest" | \
			jq -r '"    Version: \(.version)\n    Published: \(.publishedAt // .time.modified)"' 2>/dev/null || echo "    (error)"; \
		echo ""; \
	done

stats-github: ## Show GitHub repository statistics
	@echo "$(GREEN)⭐ GitHub Stats$(NC)\n"
	@if [ -z "$$GITHUB_TOKEN" ]; then \
		echo "$(YELLOW)⚠️  Set GITHUB_TOKEN for accurate stats$(NC)"; \
		echo "   export GITHUB_TOKEN=ghp_your_token\n"; \
	fi
	@gh repo view caopengau/aiready --json stargazerCount,forkCount,issues,pullRequests,watchers 2>/dev/null | \
		jq -r '"  ⭐ Stars: \(.stargazerCount)\n  🍴 Forks: \(.forkCount)\n  👀 Watchers: \(.watchers.totalCount)\n  📝 Open Issues: \(.issues.totalCount)\n  🔀 Open PRs: \(.pullRequests.totalCount)"' || \
		echo "  Install GitHub CLI: brew install gh"

stats-github-detailed: ## Show detailed GitHub analytics
	@echo "$(GREEN)⭐ Detailed GitHub Analytics$(NC)\n"
	@echo "Repository: caopengau/aiready"
	@gh repo view caopengau/aiready --json stargazerCount,forkCount,issues,pullRequests,watchers,createdAt,updatedAt,description 2>/dev/null | \
		jq -r '"Stars: \(.stargazerCount)\nForks: \(.forkCount)\nWatchers: \(.watchers.totalCount)\nOpen Issues: \(.issues.totalCount)\nOpen PRs: \(.pullRequests.totalCount)\nCreated: \(.createdAt)\nLast Updated: \(.updatedAt)"' || \
		echo "Install GitHub CLI: brew install gh"
	@echo "\n$(CYAN)Recent Activity:$(NC)"
	@gh repo view caopengau/aiready --json latestRelease 2>/dev/null | \
		jq -r '"Latest Release: \(.latestRelease.tagName // "none") - \(.latestRelease.publishedAt // "n/a")"' || echo "No releases"

stats-all: stats-npm-detailed stats-github-detailed ## Show all detailed statistics

stats-weekly: ## Generate weekly stats report
	@echo "$(CYAN)📊 Weekly Stats Report - $(TODAY)$(NC)\n"
	@echo "=================================\n"
	@$(MAKE) -s stats-all
	@echo "\n$(GREEN)💡 Growth Tips:$(NC)"
	@echo "  • Post interesting findings from analyzed repos"
	@echo "  • Engage on Twitter/Reddit with real examples"
	@echo "  • Write blog posts with data-driven insights"
	@echo "  • Respond to all GitHub issues promptly"

stats-export: ## Export stats to JSON file
	@mkdir -p .aiready/stats
	@echo "$(CYAN)📊 Exporting stats to .aiready/stats/$(TODAY).json$(NC)"
	@{ \
		echo "{"; \
		echo '  "date": "$(TODAY)",'; \
		echo '  "npm": {'; \
		first=true; \
		for pkg in $(PACKAGES); do \
			if [ "$$first" = false ]; then echo "    ,"; fi; \
			first=false; \
			pkg_clean=$$(echo $$pkg | sed 's/@aiready\///'); \
			downloads=$$(curl -s "https://api.npmjs.org/downloads/point/last-week/$$pkg" | jq -r '.downloads // 0'); \
			version=$$(curl -s "https://registry.npmjs.org/$$pkg/latest" | jq -r '.version // "unknown"'); \
			echo '    "'$$pkg_clean'": { "downloads": '$$downloads', "version": "'$$version'" }'; \
		done; \
		echo "  },"; \
		printf '  "github": '; \
		gh repo view caopengau/aiready --json stargazerCount,forkCount,issues,pullRequests,watchers 2>/dev/null || echo "null"; \
		echo ""; \
		echo "}"; \
	} > .aiready/stats/$(TODAY).json
	@echo "$(GREEN)✓ Stats exported$(NC)"
	@cat .aiready/stats/$(TODAY).json | jq . 2>/dev/null || cat .aiready/stats/$(TODAY).json

stats-compare: ## Compare current stats with last week
	@if [ ! -f .aiready/stats/$(WEEK_AGO).json ]; then \
		echo "$(YELLOW)⚠️  No stats from $(WEEK_AGO) found. Run 'make stats-export' regularly.$(NC)"; \
		exit 1; \
	fi
	@echo "$(CYAN)📈 Growth Comparison$(NC)\n"
	@echo "Comparing $(WEEK_AGO) → $(TODAY)\n"
	@echo "$(GREEN)NPM Downloads:$(NC)"
	@for pkg in cli pattern-detect context-analyzer consistency core; do \
		old=$$(cat .aiready/stats/$(WEEK_AGO).json 2>/dev/null | jq -r ".npm.\"$$pkg\".downloads // 0"); \
		new=$$(cat .aiready/stats/$(TODAY).json 2>/dev/null | jq -r ".npm.\"$$pkg\".downloads // 0"); \
		if [ -n "$$old" ] && [ -n "$$new" ]; then \
			diff=$$(($$new - $$old)); \
			if [ $$diff -gt 0 ]; then \
				echo "  $$pkg: ↗ +$$diff ($$old → $$new)"; \
			elif [ $$diff -lt 0 ]; then \
				echo "  $$pkg: ↘ $$diff ($$old → $$new)"; \
			else \
				echo "  $$pkg: → $$new (no change)"; \
			fi; \
		fi; \
	done
	@echo "\n$(GREEN)GitHub Stars:$(NC)"
	@old_stars=$$(cat .aiready/stats/$(WEEK_AGO).json 2>/dev/null | jq -r ".github.stargazerCount // 0"); \
	new_stars=$$(cat .aiready/stats/$(TODAY).json 2>/dev/null | jq -r ".github.stargazerCount // 0"); \
	if [ -n "$$old_stars" ] && [ -n "$$new_stars" ]; then \
		diff=$$(($$new_stars - $$old_stars)); \
		if [ $$diff -gt 0 ]; then \
			echo "  ↗ +$$diff stars ($$old_stars → $$new_stars)"; \
		else \
			echo "  → $$new_stars (no change)"; \
		fi; \
	fi

stats-setup: ## Install required tools for stats tracking
	@echo "$(CYAN)🔧 Setting up stats tracking tools$(NC)\n"
	@command -v jq >/dev/null 2>&1 || echo "$(YELLOW)⚠️  Install jq: brew install jq$(NC)"
	@command -v gh >/dev/null 2>&1 || echo "$(YELLOW)⚠️  Install GitHub CLI: brew install gh$(NC)"
	@command -v curl >/dev/null 2>&1 || echo "$(YELLOW)⚠️  curl not found (usually pre-installed)$(NC)"
	@mkdir -p .aiready/stats
	@echo "$(GREEN)✓ Stats directory created: .aiready/stats$(NC)"
	@echo "\n$(CYAN)💡 Next steps:$(NC)"
	@echo "  1. Run: make stats-export  (export baseline)"
	@echo "  2. Add to cron: 0 9 * * 1 cd $(PWD) && make stats-export"
	@echo "  3. Weekly: make stats-compare"

stats-dashboard: ## Open NPM/GitHub stats in browser
	@echo "$(CYAN)🌐 Opening stats dashboards...$(NC)\n"
	@for pkg in $(PACKAGES); do \
		echo "Opening npmjs.com for $$pkg"; \
		open "https://www.npmjs.com/package/$$pkg" 2>/dev/null || xdg-open "https://www.npmjs.com/package/$$pkg" 2>/dev/null || true; \
	done
	@sleep 1
	@echo "Opening npm-stat.com"
	@open "https://npm-stat.com/charts.html?package=@aiready/cli&from=2024-01-01" 2>/dev/null || xdg-open "https://npm-stat.com/charts.html?package=@aiready/cli&from=2024-01-01" 2>/dev/null || true
	@sleep 1
	@echo "Opening GitHub insights"
	@open "https://github.com/caopengau/aiready/pulse" 2>/dev/null || xdg-open "https://github.com/caopengau/aiready/pulse" 2>/dev/null || true

stats-trends: ## Show download trends (requires historical data)
	@echo "$(CYAN)📈 Download Trends$(NC)\n"
	@if [ ! -d .aiready/stats ] || [ -z "$$(ls -A .aiready/stats 2>/dev/null)" ]; then \
		echo "$(YELLOW)⚠️  No historical data found$(NC)"; \
		echo "   Run 'make stats-export' daily/weekly to build trends"; \
		exit 1; \
	fi
	@echo "$(GREEN)Historical Stats:$(NC)\n"
	@for file in .aiready/stats/*.json; do \
		date=$$(basename $$file .json); \
		total=0; \
		for pkg in cli pattern-detect context-analyzer consistency core; do \
			downloads=$$(cat $$file | jq -r ".npm.\"$$pkg\".downloads // 0" 2>/dev/null); \
			total=$$((total + downloads)); \
		done; \
		stars=$$(cat $$file | jq -r ".github.stargazerCount // 0" 2>/dev/null); \
		printf "  %s: %5d downloads, %3d stars\n" "$$date" "$$total" "$$stars"; \
	done

# Add to .gitignore
stats-gitignore: ## Add stats directory to .gitignore
	@if ! grep -q "^.aiready/stats/" .gitignore 2>/dev/null; then \
		echo "" >> .gitignore; \
		echo "# Stats tracking (optional - commit for team visibility)" >> .gitignore; \
		echo ".aiready/stats/" >> .gitignore; \
		echo "$(GREEN)✓ Added .aiready/stats/ to .gitignore$(NC)"; \
	else \
		echo "$(YELLOW)Already in .gitignore$(NC)"; \
	fi

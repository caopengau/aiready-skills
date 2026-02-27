# Copilot Instructions for AIReady

**Load doc-mapping.json for relevant context and practices.**

## Project Overview

AIReady is a monorepo with tools for assessing AI-readiness and improving AI leverage. It helps teams prepare repositories for better AI adoption by detecting issues that confuse AI models and identifying context fragmentation.

### Packages (all in `packages/` directory)

**Hubs:**

- **[@aiready/core](packages/core)** - Shared utilities and types (HUB) - v0.9.22
- **[@aiready/cli](packages/cli)** - Unified CLI interface (HUB) - v0.9.26

**Spokes:**

- **[@aiready/pattern-detect](packages/pattern-detect)** - Semantic duplicate detection - v0.11.22
- **[@aiready/context-analyzer](packages/context-analyzer)** - Context window cost & dependency fragmentation - v0.9.26
- **[@aiready/consistency](packages/consistency)** - Naming conventions and pattern consistency - v0.8.22
- **[@aiready/visualizer](packages/visualizer)** - Interactive force-directed graph visualization - v0.1.28
- **[@aiready/components](packages/components)** - Shared UI component library - v0.1.22
- **[@aiready/skills](packages/skills)** - Agent skills for AI assistants - v0.1.0

**Extension:**

- **[aiready](packages/vscode-extension)** - VS Code extension - v0.3.5

### Distribution Channels

- **[action-marketplace/](action-marketplace)** - GitHub Action for CI/CD integration - v1.0.0
- **[docker/](docker)** - Docker images (Dockerfile, Dockerfile.slim)
- **[homebrew/](homebrew)** - Homebrew formula (aiready.rb)

### Other Directories

- **[landing/](landing)** - Marketing website (getaiready.dev)
- **[platform/](platform)** - Platform backend services

## Architecture: Hub-and-Spoke Pattern

- **Hubs:** @aiready/core (utilities/types), @aiready/cli (interface)
- **Spokes:** Individual analysis tools importing only from core, integrated via CLI

**Key Rules:**

- Hubs: No spoke dependencies
- Spokes: Import only from core, focus on one problem, comply with CLI specs
- All spokes must integrate with CLI (--output, --include, --exclude, unified format)
- ✅ **Agent Branch Rule:** Agents MUST start work on and target the `main` branch by default. Always confirm with the repository owner before creating or committing to any other branch.

## 🚨 CRITICAL: AWS Credentials & Deployment

**MANDATORY CHECK BEFORE ANY AWS OPERATIONS:**

**AWS Profile:** `AWS_PROFILE=aiready` (defined in makefiles/Makefile.shared.mk)

**⚠️ BEFORE deploying, SST operations, or any AWS commands:**

1. ✅ **ALWAYS verify AWS account first:**
   ```bash
   aws sts get-caller-identity
   # Must show the CORRECT account ID for aiready project
   ```
2. ✅ **ALWAYS check active AWS profile:**
   ```bash
   echo $AWS_PROFILE  # Should be: aiready
   aws configure list
   ```
3. ❌ **NEVER deploy without explicit user confirmation of AWS account**
4. ❌ **NEVER assume AWS credentials are correct**

**If wrong account detected:**

```bash
# Immediately remove deployment:
cd landing && pnpm sst remove --stage production

# Set correct profile:
export AWS_PROFILE=aiready
# OR configure:
aws configure --profile aiready
```

## ⚠️ COMPULSORY: Git Workflow Practices

**CRITICAL:** Before any git operations, **always load and follow** the git workflow sub-instructions:

**Load:** `git-workflow` from doc-mapping.json

**Key Rules (Never Forget):**

- ❌ **NEVER** commit directly to spoke repos
- ✅ **ALWAYS** use `make sync` after monorepo commits
- ✅ **ALWAYS** develop in the monorepo hub
- ✅ **ALWAYS** check `make release-status` before releases

**Workflow:**

```bash
# After changes in monorepo:
git add .
git commit -m "feat: your changes"
make sync  # ← This syncs ALL repos automatically
```

## Publishing & Distribution

### Make Commands for Publishing

```bash
make help                    # Show all available commands
make publish-vscode          # Publish VS Code extension (requires VSCE_PAT)
make vscode-publish          # Alias for vscode-publish
make npm-publish SPOKE=core  # Publish individual npm package
make sync                    # Sync all spokes to GitHub repos
```

### VS Code Extension

- Location: `packages/vscode-extension/`
- Publisher: `pengcao`
- Requires `VSCE_PAT` in `packages/vscode-extension/.env`
- Market: https://marketplace.visualstudio.com/items?itemName=pengcao.aiready

### GitHub Action

- Location: `action-marketplace/`
- Published automatically via GitHub release workflow
- Market: https://github.com/marketplace/actions/aiready-action

### Docker

- Images: `aiready/cli` (Docker Hub), `ghcr.io/caopengau/aiready/cli`
- Build: `docker build -f docker/Dockerfile -t aiready/cli .`

### Homebrew

- Formula: `homebrew/aiready.rb`
- Install: `brew install caopengau/aiready/aiready`

## Agent Workflow

1. **Load Context:** Use doc-mapping.json to load relevant sub-instructions based on task (e.g., development-workflow.md for coding, adding-new-tool.md for new spokes, devops-best-practices.md for DevOps). Run `make help` to understand available curated commands.
2. **Work:** Follow architecture rules, check existing implementations for patterns, use Makefiles for all DevOps practices (build, test, push, release)
3. **Update Docs:** After each change, update relevant docs in .github/sub-instructions/ and doc-mapping.json if needed

## Questions for Agent

- Does this belong in core or a spoke?
- Am I creating spoke-to-spoke dependencies?
- Is this tool independently useful?
- Does it overlap existing tools?
- Can I test on a real repo?
- Does it comply with CLI specs?
- Am I updating CLI for new spokes?
- Am I using Makefiles for DevOps tasks instead of direct commands?
- **AWS:** Have I verified AWS account identity with `aws sts get-caller-identity`?
- **AWS:** Is AWS_PROFILE=aiready set correctly?
- **AWS:** Did I get explicit user confirmation before deploying?
- **GIT:** Am I following hub-and-spoke git practices? (Always load git-workflow first!)
- **GIT:** Should I use `make sync` or direct git commands?
- **GIT:** Is this change in the monorepo or a spoke repo?
- **RELEASE:** After publishing ANY spoke separately, did I republish CLI? (Required!)
- **RELEASE:** Am I excluding landing from release-all? (It has separate workflow)
- **PUBLISH:** For VS Code extension, is VSCE_PAT set in packages/vscode-extension/.env?

## Getting Help

- Reference existing spokes (@aiready/pattern-detect)
- Review core types and CLI interface
- Keep spokes focused on one job
- Use Makefiles for all DevOps practices (see devops-best-practices.md)
- **Web Deployment:** Load `landing-deployment` from doc-mapping.json for Vercel/AWS deployment guides
- **GIT:** Always load `git-workflow` sub-instructions before git operations
- **GIT:** Use `make sync` instead of direct git commands
- **Publishing:** Use `make publish-*` commands instead of manual publishing

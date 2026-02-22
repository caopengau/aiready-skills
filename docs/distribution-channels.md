# AIReady Distribution Channels

This document outlines the distribution strategy for AIReady tools and the status of each channel.

## Current Channels

| Channel | Package | Status | Version | Notes |
|---------|---------|--------|---------|-------|
| **npm** | `@aiready/cli` | ✅ Published | v0.9.26 | Primary CLI distribution |
| **npm** | `@aiready/core` | ✅ Published | - | Shared utilities |
| **npm** | `@aiready/pattern-detect` | ✅ Published | - | Semantic duplicate detection |
| **npm** | `@aiready/context-analyzer` | ✅ Published | - | Context window analysis |
| **npm** | `@aiready/consistency` | ✅ Published | - | Naming consistency |
| **npm** | `@aiready/visualizer` | ✅ Published | - | Graph visualization |
| **GitHub Action (Local)** | `.github/actions/aiready-check` | ✅ Active | v1.0.0 | Composite action in monorepo |

## Planned Channels

### 1. GitHub Actions Marketplace 🔴 HIGH PRIORITY

**Status:** Not published (action exists locally)

**Requirements:**
- [ ] Create standalone public repository `github.com/caopengau/aiready-action`
- [ ] Add `action.yml` at repository root
- [ ] Include bundled `dist/index.js`
- [ ] Create release with `v1` tag
- [ ] Publish via GitHub UI during release

**Publishing Steps:**
```bash
# 1. Create standalone repository
gh repo create aiready-action --public

# 2. Copy action files
cp -r .github/actions/aiready-check/* /path/to/aiready-action/

# 3. Create release
gh release create v1 --title "v1.0.0" --notes "Initial release"

# 4. Publish to Marketplace
# Go to https://github.com/caopengau/aiready-action
# Click "Release" → "Publish this Action to the GitHub Marketplace"
```

**Usage (after publishing):**
```yaml
# .github/workflows/aiready.yml
name: AIReady Check
on: [pull_request]

jobs:
  aiready:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: caopengau/aiready-action@v1
        with:
          threshold: '70'
          fail-on: 'critical'
```

### 2. Docker Hub 🟡 MEDIUM PRIORITY

**Status:** Not created

**Benefits:**
- Easy integration in CI/CD pipelines
- No Node.js installation required
- Consistent environment

**Implementation:**
```dockerfile
# Dockerfile
FROM node:24-alpine
RUN npm install -g @aiready/cli
ENTRYPOINT ["aiready"]
```

**Publishing Steps:**
```bash
# Build and push
docker build -t aiready/cli:latest .
docker push aiready/cli:latest
```

**Usage:**
```yaml
# GitHub Actions with Docker
- name: Run AIReady
  run: |
    docker run --rm -v ${{ github.workspace }}:/workspace \
      aiready/cli:latest --directory /workspace
```

### 3. GitHub Container Registry (ghcr.io) 🟡 MEDIUM PRIORITY

**Status:** Not created

**Benefits:**
- Integrated with GitHub
- Better for GitHub Actions workflows
- Free for public repos

**Implementation:**
```yaml
# .github/workflows/docker.yml
name: Docker Build & Push

on:
  release:
    types: [published]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Log in to ghcr.io
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/caopengau/aiready:latest
```

### 4. VS Code Extension 🟡 MEDIUM PRIORITY

**Status:** Not created

**Benefits:**
- Real-time AI readiness feedback
- Visual indicators in editor
- Integrated analysis results

**Implementation:**
- Create `@aiready/vscode-extension` package
- Use VS Code Extension API
- Integrate with CLI for analysis

**Features:**
- Status bar with AI readiness score
- Problem panel with issues
- Quick fix suggestions

### 5. Homebrew 🟢 LOW PRIORITY

**Status:** Not created

**Benefits:**
- Easy installation for macOS/Linux users
- Auto-update support

**Implementation:**
Create a Homebrew formula:
```ruby
# Formula/aiready.rb
class Aiready < Formula
  desc "AI readiness analysis tools"
  homepage "https://getaiready.dev"
  url "https://registry.npmjs.org/@aiready/cli/-/cli-0.9.26.tgz"
  sha256 "..."
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end
end
```

### 6. Other Potential Channels

| Channel | Priority | Effort | Notes |
|---------|----------|--------|-------|
| **Snap** | Low | Medium | Linux desktop users |
| **Chocolatey** | Low | Low | Windows users |
| **AUR** | Low | Low | Arch Linux users |
| **Scoop** | Low | Low | Windows users |

## Release Process

### npm Packages (Automated via Makefile)
```bash
# Release all packages
make release-all

# Release specific package
make release-cli VERSION=patch
```

### GitHub Action
```bash
# After changes to action
cd .github/actions/aiready-check
npm run build
git add dist/
git commit -m "feat: update action"
git tag -f v1
git push origin v1 --force
```

### Docker
```bash
# Build and push
make docker-build
make docker-push
```

## Versioning Strategy

| Component | Versioning | Notes |
|-----------|------------|-------|
| npm packages | Semantic | Independent versioning per package |
| GitHub Action | Major.Minor | Tag-based (`v1`, `v1.1`) |
| Docker | Latest + Semantic | `latest`, `0.9.26` |

## Monitoring & Analytics

- **npm downloads:** `npm info @aiready/cli`
- **GitHub Action usage:** GitHub Insights tab
- **Docker pulls:** Docker Hub statistics
- **VS Code extension:** Marketplace metrics

---

*Last updated: February 2026*
# Publishing Guide

This document explains how to publish AIReady packages to npm and GitHub using our Makefile-based workflow.

## 🎯 Overview

AIReady uses a **hub-and-spoke monorepo** architecture where:
- **Hub** (`@aiready/core`) provides shared utilities
- **Spokes** are independent tools published as separate packages
- Each spoke has both an npm package AND a dedicated GitHub repository

## 📋 Prerequisites

### 1. npm Authentication

```bash
# Check login status
make npm-check

# Login if needed
make npm-login
```

### 2. Git Configuration

```bash
# Ensure you have push access to:
# - Main monorepo: github.com/caopengau/aiready
# - Spoke repos: github.com/caopengau/aiready-{spoke-name}
```

### 3. Clean Working Directory

```bash
# Ensure no uncommitted changes
git status

# Commit changes before releasing
git add .
git commit -m "chore: prepare for release"

# Sync everything to GitHub (recommended before release)
make push  # or: make sync
```

**💡 Best Practice**: Run `make push` regularly to keep all spoke repositories in sync with the monorepo. This ensures that any changes in `packages/*/` are automatically propagated to their respective GitHub repos.

## 🚀 Release Workflows

### Quick Release (Recommended)

Use the automated release workflow for version bump + build + publish in one command:

```bash
# Release a single spoke (patch: 0.1.0 → 0.1.1)
make -f makefiles/Makefile.release.mk release-one SPOKE=context-analyzer TYPE=patch

# Release with minor bump (0.1.0 → 0.2.0)
make -f makefiles/Makefile.release.mk release-one SPOKE=context-analyzer TYPE=minor

# Release with major bump (0.1.0 → 1.0.0)
make -f makefiles/Makefile.release.mk release-one SPOKE=context-analyzer TYPE=major

# With 2FA (provide OTP)
make -f makefiles/Makefile.release.mk release-one SPOKE=context-analyzer TYPE=minor OTP=123456
```

This single command does:
1. ✅ Checks for changes since last release
2. ✅ Bumps version in package.json
3. ✅ Commits the version bump
4. ✅ Creates git tag (e.g., `context-analyzer-v0.2.0`)
5. ✅ Builds the package
6. ✅ Publishes to npm
7. ✅ Syncs to GitHub spoke repository
8. ✅ Pushes monorepo + tags

### Manual Release (Advanced)

For more control, use individual steps:

#### Step 1: Version Bump

```bash
# Patch version (0.1.0 → 0.1.1)
make version-patch SPOKE=context-analyzer

# Minor version (0.1.0 → 0.2.0)
make version-minor SPOKE=context-analyzer

# Major version (0.1.0 → 1.0.0)
make version-major SPOKE=context-analyzer
```

#### Step 2: Commit and Tag

```bash
# Get the new version
VERSION=$(node -p "require('./packages/context-analyzer/package.json').version")

# Commit
git add packages/context-analyzer/package.json
git commit -m "chore(release): @aiready/context-analyzer v$VERSION"

# Tag (spoke-specific)
git tag -a "context-analyzer-v$VERSION" -m "Release @aiready/context-analyzer v$VERSION"
```

#### Step 3: Build

```bash
make build
```

#### Step 4: Publish to npm

```bash
# Without 2FA
make npm-publish SPOKE=context-analyzer

# With 2FA
make npm-publish SPOKE=context-analyzer OTP=123456
```

#### Step 5: Publish to GitHub

```bash
# Sync to spoke repository
make publish SPOKE=context-analyzer

# Or specify custom owner
make publish SPOKE=context-analyzer OWNER=your-username
```

#### Step 6: Push Changes

```bash
# Push branch and tags
git push origin main --follow-tags
```

## 📊 Check Status

### View All Package Versions

```bash
make -f makefiles/Makefile.release.mk release-status
```

Output example:
```
Package                        Local           npm             Status    
-------                        -----           ---             ------    
@aiready/core                  0.2.1           0.2.0           ahead     
@aiready/pattern-detect        0.5.1           0.5.0           ahead     
@aiready/context-analyzer      0.1.0           0.1.0           ✓         
```

Legend:
- `✓` - Local and npm versions match (published)
- `ahead` - Local version is newer (needs publishing)
- `new` - Package not yet published to npm

## 🔧 Common Tasks

### Syncing All Repositories

**Recommended workflow**: Use this regularly to keep everything in sync

```bash
# After committing changes, sync monorepo + all spokes
git add .
git commit -m "feat: some changes"
make push  # or: make sync

# This does:
# 1. Pushes monorepo to GitHub
# 2. Syncs ALL spoke repos via git subtree split
# 3. Skips spokes with no changes automatically
```

**Why use this?** 
- Ensures spoke repos stay current with monorepo
- External contributors see latest code
- GitHub repos reflect actual state
- No manual sync needed per spoke

### Publishing Core (Hub)

```bash
# Core is a dependency, so publish it FIRST before spokes
make release-one SPOKE=core TYPE=patch
```

### Publishing All Spokes

```bash
# Bump and publish all spokes at once (use with caution)
make release-all TYPE=patch
```

### Syncing External Contributions

If someone contributes to a spoke's public GitHub repo:

```bash
# Pull changes from spoke repo back to monorepo
make sync-from-spoke SPOKE=context-analyzer

# Or use alias
make pull SPOKE=context-analyzer
```

### Force Release (Skip Change Detection)

```bash
# Release even if no changes detected
make -f makefiles/Makefile.release.mk release-one SPOKE=context-analyzer TYPE=patch FORCE=1
```

## 🏗️ Available Spokes

Current spokes in the monorepo:

| Spoke | npm Package | GitHub Repo | Status |
|-------|-------------|-------------|--------|
| `core` | [@aiready/core](https://npmjs.com/package/@aiready/core) | [aiready-core](https://github.com/caopengau/aiready-core) | Published |
| `pattern-detect` | [@aiready/pattern-detect](https://npmjs.com/package/@aiready/pattern-detect) | [aiready-pattern-detect](https://github.com/caopengau/aiready-pattern-detect) | Published |
| `context-analyzer` | [@aiready/context-analyzer](https://npmjs.com/package/@aiready/context-analyzer) | [aiready-context-analyzer](https://github.com/caopengau/aiready-context-analyzer) | Published |

## ⚙️ Technical Details

### Why pnpm?

**CRITICAL**: Always use `pnpm publish` (not `npm publish`)

- Our `package.json` files use `workspace:*` protocol for monorepo dependencies
- `pnpm publish` automatically converts `workspace:*` to actual version numbers
- `npm publish` fails with `EUNSUPPORTEDPROTOCOL` error

Our Makefiles handle this automatically, but if publishing manually:

```bash
# ✅ CORRECT
cd packages/context-analyzer
pnpm publish --access public

# ❌ WRONG - will fail
cd packages/context-analyzer
npm publish
```

### Git Subtree Split

Publishing to GitHub spoke repos uses `git subtree split`:

1. Creates temporary branch from `packages/{spoke}/` contents
2. Pushes to spoke repository (e.g., `aiready-context-analyzer`)
3. Tags the spoke repo commit with version tag
4. Cleans up temporary branch

This allows:
- External contributions to individual spokes
- Independent issue tracking per tool
- Separate documentation and examples
- Standalone installation without monorepo

### Tagging Convention

Tags use the format: `{spoke}-v{version}`

Examples:
- `core-v0.2.1`
- `pattern-detect-v0.5.1`
- `context-analyzer-v0.1.0`

This allows multiple spoke releases without tag conflicts.

## 🐛 Troubleshooting

### "Not logged into npm"

```bash
make npm-login
```

### "Repository not found" on GitHub publish

Create the spoke repository first:

```bash
gh repo create caopengau/aiready-{spoke-name} --public
```

### "workspace:* protocol" error

You're using `npm publish` instead of `pnpm publish`. Use our Makefiles:

```bash
make npm-publish SPOKE=context-analyzer
```

### Changes not detected for release

Force the release:

```bash
make -f makefiles/Makefile.release.mk release-one SPOKE=context-analyzer TYPE=patch FORCE=1
```

### Build fails before publish

Ensure all packages build successfully:

```bash
make build
make test
```

## 📚 Related Documentation

- [MAKEFILE.md](./MAKEFILE.md) - Complete Makefile command reference
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Development guidelines
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - Architecture overview
- [Spoke Publishing Makefiles](./makefiles/)
  - `Makefile.publish.mk` - Publishing targets
  - `Makefile.release.mk` - Automated release workflow
  - `Makefile.shared.mk` - Common variables and functions

## 🎓 Best Practices

1. **Sync regularly** - Run `make push` after commits to keep all spoke repos in sync
2. **Use the release workflow** - `make release-one SPOKE=xxx TYPE=patch` (no -f flag needed)
3. **Publish core first** - If core changes, publish it before dependent spokes
4. **Test before release** - Run `make test` to ensure quality
5. **Check status regularly** - Use `make release-status` to see what needs publishing
6. **Semantic versioning** - Use appropriate bump type (patch/minor/major)
7. **Clean git state** - Commit changes before releasing
8. **Document changes** - Update CHANGELOG or spoke README as needed

## 🚦 Release Checklist

- [ ] Run tests: `make test`
- [ ] Check status: `make release-status`
- [ ] Ensure npm login: `make npm-check`
- [ ] Commit all changes: `git add . && git commit -m "..."`
- [ ] Sync repositories: `make push` (syncs monorepo + all spokes)
- [ ] Determine version bump type (patch/minor/major)
- [ ] Run release: `make release-one SPOKE=xxx TYPE=yyy`
- [ ] Verify npm package: `npm view @aiready/xxx`
- [ ] Verify GitHub repo: `https://github.com/caopengau/aiready-xxx`
- [ ] Update main README if needed
- [ ] Announce release (optional)

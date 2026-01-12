# Release Checklist

Quick reference for releasing AIReady spokes. See [PUBLISHING.md](../PUBLISHING.md) for detailed documentation.

## 🚀 Quick Release (One Command)

```bash
# Check what needs releasing
make -f makefiles/Makefile.release.mk release-status

# Release a spoke (patch/minor/major)
make -f makefiles/Makefile.release.mk release-one SPOKE={spoke-name} TYPE={patch|minor|major}

# Examples:
make -f makefiles/Makefile.release.mk release-one SPOKE=context-analyzer TYPE=patch
make -f makefiles/Makefile.release.mk release-one SPOKE=pattern-detect TYPE=minor
make -f makefiles/Makefile.release.mk release-one SPOKE=core TYPE=major

# With 2FA
make -f makefiles/Makefile.release.mk release-one SPOKE=context-analyzer TYPE=patch OTP=123456
```

## ✅ Pre-Release Checklist

- [ ] `make test` - All tests passing
- [ ] `make lint` - No lint errors
- [ ] `git status` - Clean working directory
- [ ] `make npm-check` - Logged into npm
- [ ] Review changes since last release
- [ ] Update README/CHANGELOG if needed

## 📊 Status Check

```bash
# See all package versions (local vs npm)
make -f makefiles/Makefile.release.mk release-status
```

Output legend:
- `✓` = Published (local matches npm)
- `ahead` = Local is newer (needs publishing)
- `new` = Not yet on npm

## 🔄 Release Order

1. **Core first** - Always release `@aiready/core` before spokes if it changed
2. **Spokes next** - Release individual spokes in any order
3. **CLI last** - Release `@aiready/cli` after all spokes it depends on

## 🏷️ Version Bump Guidelines

### Patch (0.1.0 → 0.1.1)
- Bug fixes
- Documentation updates
- Performance improvements
- Internal refactoring

### Minor (0.1.0 → 0.2.0)
- New features (backward compatible)
- New CLI options
- New analysis algorithms
- Deprecations (with warnings)

### Major (0.1.0 → 1.0.0)
- Breaking changes
- Removed features/options
- Changed output formats
- Changed API signatures

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| Not logged into npm | `make npm-login` |
| Repository not found | `gh repo create caopengau/aiready-{spoke} --public` |
| Build fails | `make build` and fix errors |
| No changes detected | Add `FORCE=1` to release command |

## 📦 Available Spokes

| Spoke | Description | Status |
|-------|-------------|--------|
| `core` | Shared utilities | ✅ Published |
| `pattern-detect` | Semantic duplicates | ✅ Published |
| `context-analyzer` | Context costs | ✅ Published |
| `doc-drift` | Documentation staleness | 🚧 Coming Soon |
| `consistency` | Naming patterns | 🚧 Coming Soon |
| `cli` | Unified interface | 🚧 Coming Soon |

## 🔗 Quick Links

- [Full Publishing Guide](../PUBLISHING.md)
- [Makefile Documentation](../MAKEFILE.md)
- [Architecture Guide](./copilot-instructions.md)
- [Contributing Guide](../CONTRIBUTING.md)

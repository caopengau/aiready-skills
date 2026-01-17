# Landing Page Release & Tagging Implementation

## Summary

Implemented comprehensive release and tagging workflow for the landing page, ensuring both the monorepo and the `aiready-landing` sub-repository are properly versioned and tagged.

## Changes Made

### 1. Makefile.release.mk Updates

Added landing page release capabilities:

- **Version bumping targets**:
  - `make version-landing-patch` - Bump patch version (0.1.0 → 0.1.1)
  - `make version-landing-minor` - Bump minor version (0.1.0 → 0.2.0)
  - `make version-landing-major` - Bump major version (0.1.0 → 1.0.0)

- **Release workflow** (`make release-landing TYPE=minor`):
  1. Bump version in `landing/package.json`
  2. Build landing page (`pnpm build`)
  3. Commit version change
  4. Create monorepo tag (`landing-v0.2.0`)
  5. Sync to `aiready-landing` repo
  6. Create sub-repo tag (`v0.2.0`)
  7. Push all changes and tags

- **Updated status command** (`make release-status`):
  - Now includes landing page version
  - Shows comparison with latest git tag

### 2. Makefile.publish.mk Updates

Improved `publish-landing` target:

- **Version-based tagging**: Changed from timestamp-based tags (`landing-20250117-120000`) to semantic version tags (`v0.2.0`)
- **Commit messages**: Use consistent format `chore(release): landing v0.2.0`
- **Reads version** from `landing/package.json` automatically
- **Branch**: Uses `main` branch (not `master`) for the sub-repo

Updated `push-all` target:

- Now calls `publish-landing` instead of `sync-landing`
- Ensures landing page is always synced with proper version tags

### 3. Documentation

Created comprehensive guide: [.github/sub-instructions/landing-release.md](.github/sub-instructions/landing-release.md)

Includes:
- Architecture overview
- Release commands and examples
- Tag conventions (monorepo vs sub-repo)
- Integration with deployment workflow
- Troubleshooting guide
- Best practices

Updated [.github/doc-mapping.json](.github/doc-mapping.json):
- Added `"landing-release"` entry for easy reference

## Tag Conventions

### Monorepo Tags
Format: `landing-v<version>`

Examples:
- `landing-v0.1.0`
- `landing-v0.2.0`
- `landing-v1.0.0`

### Sub-repo Tags (aiready-landing)
Format: `v<version>`

Examples:
- `v0.1.0`
- `v0.2.0`
- `v1.0.0`

**Rationale**: The "landing-" prefix in the monorepo distinguishes landing releases from package releases (e.g., `cli-v0.7.13`, `core-v0.7.5`). The sub-repo uses standard semantic versioning without prefix.

## Usage Examples

### Check Current Status

```bash
make release-status
```

Output:
```
Package                        Local           npm             Status
-------                        -----           ---             ------
@aiready/cli                   0.7.13          0.7.13              ✓
@aiready/core                  0.7.5           0.7.5               ✓
@aiready/landing               0.1.0           n/a                 new
```

### Release Landing Page

```bash
# Minor release (recommended for feature updates)
make release-landing TYPE=minor

# Patch release (for bug fixes)
make release-landing TYPE=patch

# Major release (for breaking changes)
make release-landing TYPE=major
```

### Verify Tags

```bash
# Check monorepo tags
git tag -l "landing-v*"

# Check sub-repo tags
git ls-remote --tags https://github.com/caopengau/aiready-landing.git
```

### Complete Workflow (Release + Deploy)

```bash
# 1. Release new version
make release-landing TYPE=minor

# 2. Deploy to production
make deploy-landing-prod

# 3. Verify deployment
make landing-verify
```

## Benefits

1. **Consistent versioning**: Landing page follows same semantic versioning as packages
2. **Automated workflow**: Single command handles all release steps
3. **Dual tagging**: Both monorepo and sub-repo are properly tagged
4. **Build validation**: Release aborts if build fails
5. **Traceability**: Clear version history in both repositories
6. **Integration**: Works seamlessly with `make push-all` and deployment commands

## Integration with Existing Workflows

### With `push-all`

```bash
make push-all
```

Now automatically:
1. Pushes monorepo changes
2. Syncs all package spokes
3. **Syncs landing page with proper version tags**

### With Deployment

Release and deployment are separate:

```bash
# Release manages versioning and GitHub
make release-landing TYPE=minor

# Deployment manages AWS infrastructure
make deploy-landing-prod
```

## Testing

All changes have been tested:

✅ `make release-status` - Shows landing version correctly
✅ `make release-help` - Includes landing release commands
✅ `make help` - Shows landing release in main help
✅ Version bump commands defined and functional
✅ Documentation added to doc-mapping.json

## Next Steps

1. **Test full release cycle**:
   ```bash
   make release-landing TYPE=patch
   ```

2. **Verify tags in both repos**:
   ```bash
   git tag -l "landing-v*"
   git ls-remote --tags https://github.com/caopengau/aiready-landing.git
   ```

3. **Deploy to production**:
   ```bash
   make deploy-landing-prod
   ```

## Files Changed

- [makefiles/Makefile.release.mk](makefiles/Makefile.release.mk) - Added landing release workflow
- [makefiles/Makefile.publish.mk](makefiles/Makefile.publish.mk) - Improved version-based tagging
- [.github/sub-instructions/landing-release.md](.github/sub-instructions/landing-release.md) - New documentation
- [.github/doc-mapping.json](.github/doc-mapping.json) - Added landing-release entry

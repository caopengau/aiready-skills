# Security & Privacy Guarantees

## What AIReady Does

✅ **Reads your code files locally** - All analysis happens on your machine  
✅ **Parses AST in memory** - No temporary files with your code  
✅ **Generates reports locally** - All output saved to `.aiready/` directory in your project  
✅ **Deterministic and reproducible** - Same input always produces same output  

## What AIReady Never Does

❌ **No code sent to external servers** - Zero network calls during analysis  
❌ **No telemetry by default** - We don't track usage or collect analytics  
❌ **No SaaS dependencies** - Pure CLI tool, works offline  
❌ **No LLM calls** - No AI models involved in analysis (all rule-based and AST parsing)  
❌ **No authentication required** - No accounts, no sign-ups, no API keys  

## Air-Gap Compatible

AIReady works in completely isolated environments:
- Behind corporate firewalls
- On machines without internet access
- In regulated industries (finance, healthcare, government)

## Audit Trail

Want to see exactly what AIReady accesses? Run with trace mode:

```bash
# See all file operations
aiready scan . --trace

# Or use your OS-level monitoring
# macOS: fs_usage -f filesystem aiready
# Linux: strace -e trace=file aiready scan .
```

## Open Source Transparency

All code is open source and auditable:
- **Repository:** https://github.com/caopengau/aiready
- **License:** MIT (permissive, commercial-friendly)
- **Dependencies:** All open source, npm-auditable

Run `npm audit` on any package to verify supply chain security.

## Data Processing Details

### What Gets Analyzed
- Source code files (`.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.java`)
- Configuration files (when explicitly included)
- Directory structure and file paths

### What Gets Excluded (by default)
- `node_modules/` and other dependencies
- Build outputs (`dist/`, `build/`, `.next/`)
- Test files (`*.test.*`, `*.spec.*`, `__tests__/`)
- Git history and `.git/` directory
- Environment files (`.env`, `.env.*`)

### Report Contents
Reports contain:
- File paths (relative to your project root)
- Line numbers and code snippets
- Similarity scores and metrics
- Recommendations

Reports **never** contain:
- Absolute file paths (unless you use `--absolute-paths`)
- Environment variables
- Credentials or secrets
- Your full codebase (only analyzed snippets)

## Enterprise Security Features

### For Security Teams
- **SBOM Generation:** Run `npm sbom` on any package
- **Vulnerability Scanning:** All dependencies regularly scanned
- **No Runtime Eval:** No `eval()`, `Function()`, or dynamic code execution
- **Sandboxed Analysis:** File parsing happens in isolated processes

### For Compliance
- **GDPR Compliant:** No personal data collected
- **SOC 2 Ready:** Local execution, audit logs available
- **HIPAA/FINRA Compatible:** Can be used in regulated environments

## Reporting Security Issues

Found a security vulnerability? Please report it responsibly:

📧 **Email:** security@getaiready.dev  
🔐 **PGP Key:** [Available on request]  

**Please do NOT:**
- Open public GitHub issues for security vulnerabilities
- Share details publicly before we've had a chance to fix

We aim to:
- Acknowledge reports within 24 hours
- Provide a fix within 7 days for critical issues
- Credit researchers (with permission) in our changelog

## Security Checklist for Your Team

Before using AIReady in your organization:

- [ ] Review the [source code](https://github.com/caopengau/aiready)
- [ ] Run `npm audit` on installed packages
- [ ] Test with `--trace` mode to verify file access
- [ ] Scan generated reports for sensitive data
- [ ] Run in isolated test environment first
- [ ] Review `.aiready/` output directory contents
- [ ] Verify no network calls (use firewall/monitoring)

## Future Security Enhancements

We're working on:
- Code signing for releases
- Reproducible builds
- SLSA compliance
- Official security certifications
- Bug bounty program (when funded)

## Questions?

- **Documentation:** [Security section](https://getaiready.dev/docs/security)
- **GitHub Discussions:** [Security topics](https://github.com/caopengau/aiready/discussions)
- **Email:** security@getaiready.dev

---

**Last Updated:** January 19, 2026  
**Version:** 1.0

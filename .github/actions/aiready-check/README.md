# AIReady GitHub Action

> Block PRs that break your AI context budget

This GitHub Action runs AI readiness analysis on your codebase and blocks PRs that don't meet your quality threshold.

## Features

- 🚫 **PR Gatekeeper** - Block merges that break your AI context budget
- 📊 **AI Readiness Score** - Get a 0-100 score for your codebase
- ⚡ **Configurable Thresholds** - Set minimum score requirements
- 🔍 **Issue Detection** - Find semantic duplicates, context fragmentation, naming inconsistencies

## Usage

### Basic Usage

Add this workflow to `.github/workflows/aiready.yml`:

```yaml
name: AI Readiness Check

on:
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: AI Readiness Check
        uses: aiready/aiready/.github/actions/aiready-check@main
        with:
          threshold: 70
          fail-on: critical
```

### With Historical Tracking (Team Plan)

```yaml
name: AI Readiness Check

on:
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: AI Readiness Check
        uses: aiready/aiready/.github/actions/aiready-check@main
        with:
          threshold: 70
          fail-on: major
          upload-to-saas: true
          api-key: ${{ secrets.AIREADY_API_KEY }}
          repo-id: ${{ secrets.AIREADY_REPO_ID }}
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `directory` | Directory to analyze | No | `.` |
| `threshold` | Minimum AI readiness score (0-100) | No | `70` |
| `fail-on` | Fail on issues: `critical`, `major`, `any` | No | `critical` |
| `tools` | Tools to run: `patterns,context,consistency` | No | `patterns,context,consistency` |
| `upload-to-saas` | Upload to AIReady SaaS | No | `false` |
| `api-key` | AIReady API key | No | - |
| `repo-id` | Repository ID in SaaS | No | - |

## Outputs

| Output | Description |
|--------|-------------|
| `score` | Overall AI readiness score (0-100) |
| `passed` | Whether the check passed (`true`/`false`) |
| `issues` | Total number of issues found |
| `critical` | Number of critical issues |
| `major` | Number of major issues |

## Example Output

```
🚀 AIReady Check starting...
   Directory: .
   Threshold: 70
   Fail on: critical

📦 Running: npx @aiready/cli scan "." --tools patterns,context,consistency --output json --output-file ".aiready-action/aiready-results.json" --score

✅ AI Readiness Check passed with score 82/100
```

## Pricing

- **Free**: Run locally with CLI
- **Team ($99/mo)**: CI/CD integration with historical tracking
- **Enterprise ($299+/mo)**: Custom rules, SSO, dedicated support

Visit [getaiready.dev](https://getaiready.dev/pricing) for more details.

## License

MIT
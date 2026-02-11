# AIReady Landing Page

A modern, responsive landing page for AIReady - tools to optimize your codebase for AI collaboration.

## Features

- **AI-Ready Codebase Tools**: Detect semantic duplicates, analyze context windows, and maintain consistency that AI models understand
- **Free & Open Source**: All tools are completely free with no hidden costs
- **Instant Results**: Get analysis results in under 1 second
- **High Accuracy**: 95% detection accuracy for code issues
- **Lead Capture**: Contact form for requesting detailed reports

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Deployment**: AWS (S3 + CloudFront) with SST
- **Domain**: getaiready.dev

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Visualize

Generate an interactive visualization from an AIReady report (or run a scan to produce one).

- Run (from the repo root):
```bash
# produce a visualization for the current repo and open it
npm run visualize -- . --open
# or with pnpm
pnpm run visualize -- . --open
```

- Options: `--report <report.json>` `--output <out.html>` `--open` (opens in browser).
- If the report is missing the script runs `npx @aiready/cli scan` to create it. Default output: `packages/visualizer/visualization.html`.

You can also invoke visualization via the `aiready` CLI directly if you have it installed globally. The script will automatically prefer a global `aiready` binary when available, and otherwise use `npx @aiready/cli`.

Examples:

```bash
# If you have the CLI installed globally
aiready visualize . --open

# If you don't have it globally (uses npx)
npx @aiready/cli visualize . --open
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values:

```env
# Contact form submission endpoint (provided by SST deployment)
NEXT_PUBLIC_REQUEST_URL=your-api-endpoint-url
```

## Deployment

This project is configured for deployment with SST (Serverless Stack) to AWS. The deployment configuration is in `sst.config.ts` (not included in this public repo).

For local development, you can run:

```bash
npx sst dev
```

## Contributing

This is the landing page for AIReady. For contributions to the core tools, visit:
- [@aiready/cli](https://github.com/caopengau/aiready-cli) - Unified CLI for all tools
- [@aiready/pattern-detect](https://github.com/caopengau/aiready-pattern-detect) - Semantic duplicate detection
- [@aiready/context-analyzer](https://github.com/caopengau/aiready-context-analyzer) - Context window analysis
- [@aiready/consistency](https://github.com/caopengau/aiready-consistency) - Code consistency checker

## License

MIT License - see LICENSE file for details.

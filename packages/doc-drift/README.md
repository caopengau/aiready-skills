# @aiready/doc-drift

> AIReady Spoke: Tracks documentation freshness versus code churn.

[![npm version](https://img.shields.io/npm/v/@aiready/doc-drift.svg)](https://npmjs.com/package/@aiready/doc-drift)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

The **Documentation Drift** analyzer combines AST parsing with git log traversal to identify instances where comments are likely lagging behind actual implementation logic. 

## 🏛️ Architecture

```
                    🎯 USER
                      │
                      ▼
            🎛️  CLI (orchestrator)
                      │
    ┌─────────────────┴─────────────────┐
    │                                   │
    ▼                                   ▼
┌────────┐                        ┌────────┐
│🎨 VIS- │                        │ ANALY- │
│UALIZER │                        │  SIS   │
│✅ Ready│                        │ SPOKES │
└────────┘                        └───┬────┘
    │                                 │
    │           ┌─────────────────────┼─────────────────────┐
    │           ▼                     ▼                     ▼
    │     ┌────────┐           ┌────────┐           ┌────────┐
    │     │📝 DOC- │           │📦 CON- │           │🔧 CON- │
    │     │ DRIFT  │           │TEXT    │           │SISTENCY│
    │     │        │           │ANALYZER│           │        │
    │     │        │           │        │           │        │
    │     │✅ Ready│           │✅ Ready│           │✅ Ready│
    │     └────────┘           └────────┘           └────────┘
    │           │                                           │
    │           └──────── YOU ARE HERE ─────────────────────┘
    │                                                       │
    └───────────────────────────────────────────────────────┘
                            │
                            ▼
                  🏢 HUB (@aiready/core)
```

## Features

- **Drift Detection**: Detects documentation older than the code it describes based on git history timestamps.
- **Signature Mismatches**: Finds missing documented `@param` tags when new arguments are added.

## Installation

```bash
pnpm add @aiready/doc-drift
```

## Usage

```bash
aiready scan . --tools doc-drift
```

## License

MIT

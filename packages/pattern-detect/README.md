# @aiready/pattern-detect

> AIReady Spoke: Semantic duplicate pattern detection for AI-generated code.

[![npm version](https://img.shields.io/npm/v/@aiready/pattern-detect.svg)](https://npmjs.com/package/@aiready/pattern-detect)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

AI models often suffer from "semantic confusion" when multiple variants of the same logic exist in the codebase. The **Pattern Detect** analyzer helps you identify these duplicates and consolidate them into reusable components.

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
    │     │📊 PAT- │           │📦 CON- │           │🔧 CON- │
    │     │TERN    │           │TEXT    │           │SISTENCY│
    │     │DETECT  │           │ANALYZER│           │        │
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

- **Semantic Duplication**: Detects code blocks that perform the same task with different syntax.
- **Context Waste**: Identifies how much duplicate code is bloat for AI context windows.
- **Refactoring Suggestions**: Recommends extraction points for shared utilities.

## Installation

```bash
pnpm add @aiready/pattern-detect
```

## Usage

```bash
aiready scan . --tools pattern-detect
```

## License

MIT
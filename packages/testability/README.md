# @aiready/testability

> AIReady Spoke: Measures the "Verify" score of the codebase—how easily an AI agent can write tests and verify its own changes autonomously.

[![npm version](https://img.shields.io/npm/v/@aiready/testability.svg)](https://npmjs.com/package/@aiready/testability)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

The "Verify" loop is the most expensive part of the AI agent workflow. Codebases with high global state, missing dependency injection, or poor test coverage force agents into long, expensive retry loops. The **Testability Index** quantifies these frictions.

## 🏛️ Architecture

```
                    🎯 USER
                      │
                      ▼
         🎛️  @aiready/cli (orchestrator)
           │   │   │   │   │   │   │   │   │   │   │   │
           ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼
         ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐
         │A│ │B│ │C│ │D│ │E│ │F│ │G│ │H│ │I│ │J│ │K│ │L│
         └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘
         ALL SPOKES — flat peers, no hierarchy:
         A=pattern-detect    B=context-analyzer  C=consistency
         D=change-amp        E=deps-health        F=doc-drift
         G=ai-signal-clarity H=agent-grounding    I=testability ★
         J=visualizer        K=skills             L=components
           │   │   │   │   │   │   │   │   │   │   │   │
           └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
                               │
                               ▼
                      🏢 @aiready/core
```

## Features

- **Purity analysis**: Detects usage of global state and side effects that make unit testing difficult for agents.
- **Dependency Map**: Evaluates the usage of DI (Dependency Injection) patterns that allow agents to mock boundaries easily.
- **Verification Ratio**: Measures the presence and quality of existing tests relative to source files.
- **Retry Risk**: Specifically flags patterns that cause AI agents to enter infinite "fix-test-fail" loops.

## Installation

```bash
pnpm add @aiready/testability
```

## Usage

This tool is designed to be run through the unified AIReady CLI.

```bash
# Scan for testability and verification risk
aiready scan . --tools testability
```

## License

MIT

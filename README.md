# @aiready/skills

> AI-friendly coding practices packaged as agent skills for the [skills.sh](https://skills.sh/) ecosystem.

[![npm version](https://img.shields.io/npm/v/@aiready/skills.svg)](https://npmjs.com/package/@aiready/skills)

## Overview

This package provides procedural knowledge for AI coding agents to help them write and maintain code optimally.

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
         G=ai-signal-clarity H=agent-grounding    I=testability
         J=visualizer        K=skills ★           L=components
         (K also exposes AI assistant skill files — see below)
           │   │   │   │   │   │   │   │   │   │   │   │
           └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
                               │
                               ▼
                      🏢 @aiready/core
```

## Available Skills

### aiready-best-practices

Guidelines for writing AI-friendly code. Use when:
- Writing new features or refactoring
- Reviewing pull requests
- Preparing codebases for AI adoption

## Installation

```bash
npx skills add caopengau/aiready-skills
```

## License

MIT

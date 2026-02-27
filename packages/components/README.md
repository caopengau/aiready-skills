# @aiready/components

[![npm](https://img.shields.io/npm/v/@aiready/components)](https://www.npmjs.com/package/@aiready/components) 

Unified shared components library (UI, charts, hooks, utilities) for AIReady.

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
         J=visualizer        K=skills             L=components ★
         (L provides shared UI & hooks consumed by J=visualizer)
           │   │   │   │   │   │   │   │   │   │   │   │
           └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
                               │
                               ▼
                      🏢 @aiready/core
```

## Features

- 🎨 **UI Components**: Button, Card, Input, Label, Badge, Container, Grid, Stack, Separator.
- 📊 **D3 Charts**: ForceDirectedGraph with physics-based layout.
- 🪝 **React Hooks**: `useDebounce`, `useD3`, `useForceSimulation`.

## Installation

```bash
pnpm add @aiready/components
```

## License

MIT
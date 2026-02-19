# Component Audit & Curation Plan

> Analysis of components across Landing, Visualizer, and @aiready/components for consistent design system

## Current State

### @aiready/components (Shared Package)

**Location:** `packages/components/src/`

**Components:**
| Component | Status | Description |
|-----------|--------|-------------|
| `Button` | ✅ Ready | Variants, sizes, CVA-based |
| `Card` | ✅ Ready | Header, Content, Footer, Title, Description |
| `Badge` | ✅ Ready | Variants, CVA-based |
| `Input` | ✅ Ready | Forward ref, variants |
| `Label` | ✅ Ready | Form label |
| `Textarea` | ✅ Ready | Forward ref |
| `Checkbox` | ✅ Ready | Radix-based |
| `RadioGroup` | ✅ Ready | Radix-based |
| `Switch` | ✅ Ready | Radix-based |
| `Select` | ✅ Ready | Custom select |
| `Container` | ✅ Ready | Layout wrapper |
| `Grid` | ✅ Ready | CSS Grid wrapper |
| `Stack` | ✅ Ready | Flex stack |
| `Separator` | ✅ Ready | Divider |

**Hooks:**
| Hook | Status | Description |
|------|--------|-------------|
| `useDebounce` | ✅ Ready | Value debouncing |
| `useD3` | ✅ Ready | D3 integration with resize |
| `useForceSimulation` | ✅ Ready | D3 force simulation hook |

**Charts:**
| Component | Status | Description |
|-----------|--------|-------------|
| `ForceDirectedGraph` | ✅ Ready | D3 force graph component |
| `GraphControls` | ✅ Ready | Zoom, reset controls |

**Utils:**
| Util | Status | Description |
|------|--------|-------------|
| `cn` | ✅ Ready | Class name merger (clsx + twMerge) |
| `colors` | ✅ Ready | Severity colors palette |
| `formatters` | ✅ Ready | Number, date formatting |

---

### Landing Components

**Location:** `landing/components/`

| Component | Quality | Reusability | Recommendation |
|-----------|---------|-------------|----------------|
| `Header.tsx` | ⚠️ Landing-specific | Low | Keep in landing, create platform-specific header |
| `Footer.tsx` | ⚠️ Landing-specific | Low | Keep in landing |
| `CodeBlock.tsx` | ✅ High | **High** | **Cherry-pick to components** |
| `CodeBlockCopyButton.tsx` | ✅ High | **High** | **Cherry-pick to components** |
| `AIReadinessScore.tsx` | ⚠️ Landing-specific | Medium | Extract ScoreBar component |
| `Features.tsx` | ⚠️ Landing-specific | Low | Keep in landing |
| `AnimatedHero.tsx` | ⚠️ Landing-specific | Low | Keep in landing |
| `Benefits.tsx` | ⚠️ Landing-specific | Low | Keep in landing |
| `CTA.tsx` | ⚠️ Landing-specific | Low | Keep in landing |
| `FAQ.tsx` | ⚠️ Landing-specific | Medium | Extract Accordion component |
| `Testimonials.tsx` | ⚠️ Landing-specific | Low | Keep in landing |
| `LiveScanDemo.tsx` | ⚠️ Demo-specific | Low | Keep in landing |
| `InteractiveChart.tsx` | ✅ Good | Medium | Consider consolidating with charts |
| `ChartsClient.tsx` | ⚠️ Demo-specific | Low | Keep in landing |
| `ComparisonChart.tsx` | ✅ Good | Medium | Evaluate for components |
| `Breadcrumb.tsx` | ✅ High | **High** | **Cherry-pick to components** |
| `ParallaxSection.tsx` | ⚠️ Landing-specific | Low | Keep in landing |
| `FloatingElements.tsx` | ⚠️ Landing-specific | Low | Keep in landing |
| `MotionProgress.tsx` | ✅ Good | Medium | Consider for components |
| `RequestForm.tsx` | ⚠️ Landing-specific | Low | Platform will have different forms |
| `BlogContent.tsx` | ⚠️ Blog-specific | Low | Keep in landing |
| `Comments.tsx` | ⚠️ Blog-specific | Low | Keep in landing |

**Patterns to Extract:**
1. **CodeBlock** - Syntax highlighting with copy button
2. **Breadcrumb** - Navigation breadcrumb
3. **ScoreBar** - Progress bar for scores (from AIReadinessScore)

---

### Visualizer Components

**Location:** `packages/visualizer/web/src/components/`

| Component | Quality | Reusability | Recommendation |
|-----------|---------|-------------|----------------|
| `GraphCanvas.tsx` | ✅ High | Medium | Keep in visualizer, uses ForceDirectedGraph |
| `Navbar.tsx` | ✅ High | **High** | **Extract ThemeToggle pattern** |
| `NodeDetails.tsx` | ✅ Good | Medium | Platform-specific adaptation needed |
| `LegendPanel.tsx` | ✅ Good | Medium | Keep in visualizer |
| `LoadingSpinner.tsx` | ✅ High | **High** | **Cherry-pick to components** |
| `ErrorDisplay.tsx` | ✅ High | **High** | **Cherry-pick to components** |

**Hooks to Extract:**
| Hook | Quality | Reusability | Recommendation |
|------|---------|-------------|----------------|
| `useTheme.ts` | ✅ High | **High** | **Cherry-pick to components** |
| `useDimensions.ts` | ✅ High | **High** | **Cherry-pick to components** |

---

## Cherry-Pick Plan

### Phase 1: High-Priority Additions to @aiready/components

#### 1. CodeBlock (from Landing)
```
packages/components/src/code-block/
├── CodeBlock.tsx      # Main component
├── CopyButton.tsx     # Copy to clipboard
├── index.ts           # Exports
└── languages.ts       # Supported languages config
```

**Features:**
- Syntax highlighting (highlight.js)
- Copy to clipboard
- Language badge
- Dedent support for template literals
- macOS-style window chrome

#### 2. Theme System (from Visualizer)
```
packages/components/src/theme/
├── ThemeProvider.tsx  # Context provider
├── ThemeToggle.tsx    # Dark/Light/System toggle
├── useTheme.ts        # Theme hook
├── index.ts           # Exports
└── themes.ts          # Theme definitions
```

**Features:**
- Dark/Light/System modes
- localStorage persistence
- System preference detection
- Theme-aware colors object

#### 3. Loading & Error States (from Visualizer)
```
packages/components/src/feedback/
├── LoadingSpinner.tsx # Animated spinner
├── ErrorDisplay.tsx   # Error message with retry
├── EmptyState.tsx     # Empty data state
└── index.ts           # Exports
```

#### 4. Navigation (new, patterns from both)
```
packages/components/src/navigation/
├── Breadcrumb.tsx     # From landing
├── Sidebar.tsx        # For platform dashboard
├── Tabs.tsx           # Tab navigation
└── index.ts           # Exports
```

#### 5. Data Display (new)
```
packages/components/src/data-display/
├── ScoreBar.tsx       # Progress bar for scores
├── StatCard.tsx       # Metric card with trend
├── Table.tsx          # Data table
└── index.ts           # Exports
```

---

### Phase 2: Utility Hooks

```typescript
// packages/components/src/hooks/index.ts
export { useDebounce } from './useDebounce';
export { useD3, useD3WithResize } from './useD3';
export { useForceSimulation } from './useForceSimulation';
export { useTheme } from './useTheme';           // NEW
export { useDimensions } from './useDimensions'; // NEW
```

---

## Design System Consistency

### Colors (Already Defined)
```typescript
// packages/components/src/utils/colors.ts
export const severityColors = {
  critical: '#ef4444',  // red-500
  major: '#f59e0b',     // amber-500
  minor: '#3b82f6',     // blue-500
  info: '#6b7280',      // gray-500
};
```

### Typography
- Headings: Inter font, black weight (900)
- Body: Inter font, normal weight (400)
- Code: JetBrains Mono or Fira Code

### Spacing
- Section padding: `py-20`
- Container: `container mx-auto px-4`
- Card padding: `p-6` or `p-8`

### Border Radius
- Cards: `rounded-2xl`
- Buttons: `rounded-lg`
- Inputs: `rounded-md`

### Shadows
- Cards: `shadow-lg`
- Elevated: `shadow-xl`
- None for flat surfaces

---

## Implementation Checklist

### Immediate (Before Platform Development)
- [ ] Add CodeBlock component to @aiready/components
- [ ] Add ThemeProvider and useTheme hook
- [ ] Add LoadingSpinner and ErrorDisplay
- [ ] Add Breadcrumb component
- [ ] Add ScoreBar component

### Platform Development Phase
- [ ] Create Sidebar component
- [ ] Create StatCard component
- [ ] Create Table component
- [ ] Create EmptyState component

### Documentation
- [ ] Update packages/components/README.md
- [ ] Add Storybook stories for new components
- [ ] Document theme system usage

---

## File Structure After Consolidation

```
packages/components/src/
├── index.ts                    # Main exports
├── components/
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── container.tsx
│   ├── grid.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── radio-group.tsx
│   ├── select.tsx
│   ├── separator.tsx
│   ├── stack.tsx
│   ├── switch.tsx
│   ├── textarea.tsx
│   └── code-block/             # NEW
│       ├── CodeBlock.tsx
│       ├── CopyButton.tsx
│       └── index.ts
├── feedback/                   # NEW
│   ├── LoadingSpinner.tsx
│   ├── ErrorDisplay.tsx
│   ├── EmptyState.tsx
│   └── index.ts
├── navigation/                 # NEW
│   ├── Breadcrumb.tsx
│   ├── Sidebar.tsx
│   ├── Tabs.tsx
│   └── index.ts
├── data-display/               # NEW
│   ├── ScoreBar.tsx
│   ├── StatCard.tsx
│   └── index.ts
├── theme/                      # NEW
│   ├── ThemeProvider.tsx
│   ├── ThemeToggle.tsx
│   ├── useTheme.ts
│   └── index.ts
├── charts/
│   ├── ForceDirectedGraph.tsx
│   ├── GraphControls.tsx
│   ├── LinkItem.tsx
│   ├── NodeItem.tsx
│   └── index.ts
├── hooks/
│   ├── useDebounce.ts
│   ├── useD3.ts
│   ├── useDimensions.ts        # NEW
│   ├── useForceSimulation.ts
│   └── index.ts
└── utils/
    ├── cn.ts
    ├── colors.ts
    ├── formatters.ts
    └── index.ts
```

---

## Dependencies to Add

```json
{
  "dependencies": {
    "highlight.js": "^11.9.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "class-variance-authority": "^0.7.0"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "framer-motion": "^11.0.0"
  }
}
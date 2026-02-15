# Shared Frontend Packages Implementation Plan

> **Reference this document for tracking shared UI, charts, and utilities packages across the AIReady ecosystem**

## 🎯 Overview

**DECISION:** Create ONE unified shared package (`@aiready/components`) containing UI components, D3 charts, and utilities for maximum simplicity and maintainability.

**Why One Package:**
- ✅ Simpler to manage (1 repo vs 3)
- ✅ Single version tracking
- ✅ Still tree-shakeable at module level
- ✅ Better for small team
- ✅ Can split later if needed (rare)

**Consumer Applications:**
- 🎨 Landing (existing - Next.js 16, public)
- 🚀 SaaS Dashboard (future - Next.js 16, **private repo**)
- 📊 Visualizer Web (Phase 2 - React 19 + Vite, public)

## 📦 Package Structure

```
PUBLIC REPO (github.com/caopengau/aiready-cli)
├── packages/
│   ├── core/              # Existing - analysis utilities
│   ├── cli/               # Existing - CLI tool
│   ├── pattern-detect/    # Existing - analysis tool
│   ├── context-analyzer/  # Existing - analysis tool
│   ├── consistency/       # Existing - analysis tool
│   ├── visualizer/        # NEW (Phase 1 complete) - visualization engine
│   └── components/        # NEW - unified UI/charts/utils ⭐
│       ├── components/    # UI components (Button, Card, etc.)
│       ├── charts/        # D3 visualizations (LineChart, ForceGraph)
│       ├── hooks/         # React hooks (useDebounce, useTheme)
│       └── utils/         # Utilities (formatters, colors)
└── landing/              # Existing - public marketing site

PRIVATE REPO (github.com/caopengau/aiready-dashboard)
└── SaaS Dashboard (Next.js 16, uses @aiready/components from npm)
```

## 🏗️ Architecture Compliance

### Hub-and-Spoke Pattern

```
@aiready/core (HUB)
    ↓
@aiready/components (NEW SPOKE - unified package)
    ├── components/  (UI)
    ├── charts/      (D3 visualizations)
    ├── hooks/       (React hooks)
    └── utils/       (Utilities)
    ↓
Consumer Apps:
├── Landing (public - in monorepo)
├── Visualizer Web (public - in monorepo)
└── SaaS Dashboard (private - separate repo)
```

**Key Principles:**
- ✅ Single package depends only on @aiready/core (if needed)
- ✅ Independently useful and tree-shakeable
- ✅ Published to npm as public package
- ✅ Synced to GitHub spoke repo (public)
- ✅ SaaS dashboard is private repo consuming public package

### Repository Visibility Strategy

**Public Repositories (Open Source):**
- All analysis tools (core, cli, pattern-detect, context-analyzer, consistency)
- Visualizer package
- **Components package** (NEW - public)
- Landing site

**Private Repository:**
- **SaaS Dashboard** - separate from monorepo, business logic protected

## 📋 Implementation Phases

### Phase 1: @aiready/components - Foundation (Week 1) 🚀 PRIORITY

**Status:** 🔜 Not Started

**Package:** `packages/components/` (unified package)

#### Week 1: Package Setup + Core UI Components

- [ ] **Package Setup**
  - [ ] Create `packages/components/` directory structure
  - [ ] Set up `package.json` with granular exports (tree-shakeable)
  - [ ] Configure TypeScript (`tsconfig.json`)
  - [ ] Set up build system (tsup with multiple entry points)
  - [ ] Create `README.md` with usage examples
  - [ ] Set up internal structure: `/components`, `/charts`, `/hooks`, `/utils`

- [ ] **Tailwind Configuration**
  - [ ] Create shared `tailwind.config.js`
  - [ ] Define design tokens (colors, spacing, typography)
  - [ ] Set up dark mode support
  - [ ] Create base CSS file (`globals.css`)

- [ ] **Core Components (shadcn/ui based)**
  - [ ] Button (variants: default, destructive, outline, ghost, link)
  - [ ] Card (with Header, Content, Footer)
  - [ ] Input (text, number, email, password)
  - [ ] Label
  - [ ] Badge (variants: default, secondary, destructive, outline)

- [ ] **Testing & Documentation**
  - [ ] Set up Storybook (optional but recommended)
  - [ ] Write component tests (Vitest + Testing Library)
  - [ ] Document usage in README

### Phase 2: @aiready/components - Extended UI + Charts (Week 2)

**Status:** 🔜 Not Started

- [ ] **Layout Components**
  - [ ] Container (responsive widths)
  - [ ] Grid (responsive grid system)
  - [ ] Stack (vertical/horizontal spacing)
  - [ ] Separator

- [ ] **Interactive Components**
  - [ ] Modal/Dialog
  - [ ] Dropdown Menu
  - [ ] Tabs
  - [ ] Tooltip
  - [ ] Toast/Notification system

- [ ] **Form Components**
  - [ ] Select
  - [ ] Checkbox
  - [ ] Radio Group
  - [ ] Switch/Toggle
  - [ ] Textarea

- [ ] **Theme Provider**
  - [ ] ThemeProvider component
  - [ ] useTheme hook
  - [ ] Dark/light mode toggle

- [ ] **D3 Charts (in /charts directory)**
  - [ ] Add D3 dependencies to package
  - [ ] LineChart (time series trends)
  - [ ] BarChart (comparisons)
  - [ ] ScatterPlot (correlation)

### Phase 3: @aiready/components - Advanced Charts + Utilities (Week 3)

**Status:** 🔜 Not Started

- [ ] **Advanced Charts**
  - [ ] ForceDirectedGraph (d3-force integration) - priority for visualizer
  - [ ] HeatMap (file/module hotspots)
  - [ ] TreeMap (hierarchical data)
  - [ ] D3 utilities (scales, axes, tooltips)

- [ ] **Chart Interactivity**
  - [ ] Zoom & pan support
  - [ ] Legend system
  - [ ] Export to PNG/SVG

- [ ] **React Hooks (in /hooks directory)**
  - [ ] useD3 (D3 lifecycle management)
  - [ ] useForceSimulation (d3-force wrapper)
  - [ ] useDebounce
  - [ ] useLocalStorage
  - [ ] useMediaQuery
  - [ ] useTheme

- [ ] **Utilities (in /utils directory)**
  - [ ] Formatters (date, number, string)
  - [ ] Color schemes (severity, domain colors)
  - [ ] Constants (breakpoints, z-index)

- [ ] **Testing & Documentation**
  - [ ] Component tests (Vitest)
  - [ ] Storybook setup (optional)
  - [ ] Complete README with all examples

- [ ] **Release Preparation**
  - [ ] Build package (`pnpm build`)
  - [ ] Test all exports are tree-shakeable
  - [ ] Create GitHub repo: `aiready-components` (public)
  - [ ] Publish to npm: `@aiready/components@0.1.0`

**Deliverable:** `@aiready/components@0.1.0` - unified package with UI, charts, hooks, and utilities

---

### Phase 4: Integration & Visualizer Phase 2 (Week 4)

**Status:** 🔜 Not Started

#### Landing Page Migration

- [ ] **Update Dependencies**
  - [ ] Add `@aiready/components` to package.json
  - [ ] Remove duplicate component code
  - [ ] Update Tailwind config to use shared config

- [ ] **Component Migration**
  - [ ] Replace custom buttons with `@aiready/components/button`
  - [ ] Replace custom cards with `@aiready/components/card`
  - [ ] Update chart components to use `@aiready/components/line-chart`
  - [ ] Use shared formatters from `@aiready/components/utils`

- [ ] **Testing & Validation**
  - [ ] Test all pages work correctly
  - [ ] Verify dark mode still works
  - [ ] Check responsive design
  - [ ] Deploy to staging
  - [ ] Deploy to production

#### Visualizer Web Frontend (Phase 2)

- [ ] **Setup Vite + React Project**
  - [ ] Create `packages/visualizer/web/` directory
  - [ ] Set up Vite configuration
  - [ ] Configure TypeScript
  - [ ] Add dependency: `@aiready/components`

- [ ] **Build Interactive UI**
  - [ ] App shell with `@aiready/components` UI components
  - [ ] ForceDirectedGraph from `@aiready/components/force-graph`
  - [ ] Controls panel (filters, layout options) using shared components
  - [ ] Details panel (node/edge info) using shared components
  - [ ] Legend component using shared utilities

- [ ] **CLI Integration**
  - [ ] Build Vite bundle
  - [ ] Embed bundle in CLI-generated HTML
  - [ ] Pass graph data via inline JSON
  - [ ] Test end-to-end flow

**Deliverable:** Landing migrated to shared packages, Visualizer Phase 2 complete

---

## 🚀 Release & Publish Workflow

### Initial Setup (One-time)

```bash
# Create GitHub repo for components package
gh repo create aiready-components --public --description "Unified shared components library (UI, charts, hooks, utilities) for AIReady"
```

### Publishing Workflow

#### 1. Development in Monorepo

```bash
# Work in monorepo (packages/components/)
cd packages/components
pnpm install
pnpm build
pnpm test
```

#### 2. Commit to Monorepo

```bash
git add packages/components
git commit -m "feat(components): add Button and Card components"
git push origin main
```

#### 3. Sync to Spoke Repo (Automatic via Makefile)

```bash
# This syncs ALL packages including new ones
make push-all

# Or sync individual package
make publish SPOKE=components OWNER=caopengau
```

#### 4. Publish to npm

```bash
# Bump version
make version-patch SPOKE=components  # 0.1.0 → 0.1.1

# Publish to npm
make npm-publish SPOKE=components

# Or use shortcuts
make npm-publish-components
```

### Makefile Shortcuts (To Be Added)

Add to `makefiles/Makefile.publish.mk`:

```makefile
# Convenience shortcuts for components package
publish-components: ## Publish @aiready/components to GitHub
	@$(MAKE) publish SPOKE=components OWNER=$(OWNER)

npm-publish-components: ## Publish @aiready/components to npm
	@$(MAKE) npm-publish SPOKE=components
```

### Release Checklist Template

For each package release:

- [ ] **Pre-release**
  - [ ] All tests pass
  - [ ] Version bumped (patch/minor/major)
  - [ ] CHANGELOG.md updated
  - [ ] README.md accurate

- [ ] **Release**
  - [ ] Commit to monorepo
  - [ ] Run `make push-all` (syncs to spoke repo)
  - [ ] Run `make npm-publish SPOKE=<package>`
  - [ ] Verify on npmjs.com

- [ ] **Post-release**
  - [ ] Test in consumer application
  - [ ] Update dependent packages if needed
  - [ ] Announce in team chat/documentation

---

## 📊 Package Dependencies

```
@aiready/core (optional)
    ↓
@aiready/components (unified package)
    ├── /components (UI)
    ├── /charts (D3 visualizations)
    ├── /hooks (React hooks)
    └── /utils (Utilities)
    ↓
[Landing, SaaS, Visualizer Web]
```

**Dependency Rules:**
- ✅ Internal subdirectories can import from `/utils`
- ✅ `/charts` can use `/hooks` (e.g., useD3)
- ✅ `/components` can use `/hooks` and `/utils`
- ❌ Consumer apps should not be dependencies
- ✅ Tree-shakeable via granular exports

---

## 🎨 Design System Specifications

### Color Palette

```typescript
// packages/utils/src/constants/colors.ts
export const colors = {
  // Severity colors
  severity: {
    critical: '#ef4444',  // red-500
    major: '#f59e0b',     // amber-500
    minor: '#eab308',     // yellow-500
    info: '#60a5fa',      // blue-400
  },
  
  // Domain colors (for clustering)
  domain: [
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#10b981', // green-500
    '#f59e0b', // amber-500
    '#06b6d4', // cyan-500
  ],
  
  // UI colors (from Tailwind)
  background: {
    light: '#ffffff',
    dark: '#0f172a',
  },
  foreground: {
    light: '#020617',
    dark: '#e2e8f0',
  },
};
```

### Typography Scale

```typescript
// Tailwind CSS 4 typography configuration
export const typography = {
  fontFamily: {
    sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['Monaco', 'Courier New', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
};
```

### Spacing Scale

```typescript
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
};
```

---

## 📦 Package.json Template

### @aiready/components (Unified Package)

```json
{
  "name": "@aiready/components",
  "version": "0.1.0",
  "description": "Unified shared components library (UI, charts, hooks, utilities) for AIReady",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./button": "./dist/components/button.js",
    "./card": "./dist/components/card.js",
    "./input": "./dist/components/input.js",
    "./badge": "./dist/components/badge.js",
    "./line-chart": "./dist/charts/LineChart.js",
    "./bar-chart": "./dist/charts/BarChart.js",
    "./force-graph": "./dist/charts/ForceGraph.js",
    "./use-debounce": "./dist/hooks/useDebounce.js",
    "./use-theme": "./dist/hooks/useTheme.js",
    "./use-d3": "./dist/hooks/useD3.js",
    "./use-force-simulation": "./dist/hooks/useForceSimulation.js",
    "./utils": "./dist/utils/index.js",
    "./utils/colors": "./dist/utils/colors.js",
    "./utils/formatters": "./dist/utils/formatters.js",
    "./tailwind-config": "./tailwind.config.js"
  },
  "files": ["dist", "tailwind.config.js"],
  "scripts": {
    "dev": "tsup --watch",
    "build": "tsup",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "dependencies": {
    "@aiready/core": "workspace:*",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "d3": "^7.9.0",
    "d3-force": "^3.0.0"
  },
  "devDependencies": {
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "tailwindcss": "^4",
    "tsup": "^8.3.5",
    "typescript": "^5.7.2",
    "vitest": "^2.0.0"
  }
}
```

**Key Features:**
- ✅ Granular exports for tree-shaking
- ✅ All UI, charts, hooks, and utils in one package
- ✅ Import only what you need: `import { Button } from '@aiready/components/button'`
- ✅ Single version, simple management
- ✅ Can split later if truly needed (rare for small teams)

---

## ✅ Success Criteria

### Technical Metrics

- [ ] All packages build without errors
- [ ] All packages have >80% test coverage
- [ ] Bundle sizes optimized (<50KB gzipped for @aiready/ui)
- [ ] Tree-shaking works correctly
- [ ] TypeScript types exported correctly

### Integration Metrics

- [ ] Landing page successfully migrated
- [ ] Visualizer Phase 2 built with shared packages
- [ ] No duplicate code between applications
- [ ] Consistent UI/UX across all applications

### Developer Experience

- [ ] Clear documentation with examples
- [ ] Storybook available for component browsing
- [ ] Published to npm and accessible
- [ ] GitHub repos created and synced

---

## 📝 Progress Tracking

| Package | Status | Version | npm | GitHub | Notes |
|---------|--------|---------|-----|--------|-------|
| @aiready/components | 🔜 Not Started | - | - | [aiready-components](https://github.com/caopengau/aiready-components) (to be created) | Unified package: UI + Charts + Hooks + Utils |

**Legend:**
- 🔜 Not Started
- 🚧 In Progress
- ✅ Complete
- 🚀 Published

---

## 🔗 Related Documents

- [AIReady Visualization Architecture](./visualization-architecture.md)
- [SaaS Architecture & Monetization Plan](./saas-architecture.md)
- [Monorepo Makefile Documentation](../../makefiles/README.md)

---

**Status:** Ready to begin implementation
**Priority:** Phase 1 (@aiready/components foundation) for Visualizer Phase 2
**Timeline:** 4 weeks total (Week 1: Foundation, Week 2: Extended UI + Charts, Week 3: Advanced + Utilities, Week 4: Integration)
**Maintainer:** @caopengau

# Shared Frontend Packages Implementation Plan

> **Reference this document for tracking shared UI, charts, and utilities packages across the AIReady ecosystem**

## 🎯 Overview

Create three shared packages (`@aiready/ui`, `@aiready/charts`, `@aiready/utils`) to provide consistent UI components, data visualization, and utilities across all AIReady frontend applications.

**Consumer Applications:**
- 🎨 Landing (existing - Next.js 16)
- 🚀 SaaS Dashboard (future - Next.js 16)
- 📊 Visualizer Web (Phase 2 - React 19 + Vite)

## 📦 Package Structure

```
packages/
├── core/              # Existing - analysis utilities
├── cli/               # Existing - CLI tool
├── pattern-detect/    # Existing - analysis tool
├── context-analyzer/  # Existing - analysis tool
├── consistency/       # Existing - analysis tool
├── visualizer/        # NEW (Phase 1 complete) - visualization engine
├── ui/                # NEW - shared component library ⭐
├── charts/            # NEW - shared D3 charts ⭐
└── utils/             # NEW - shared utilities ⭐
```

## 🏗️ Architecture Compliance

### Hub-and-Spoke Pattern

```
@aiready/core (HUB)
    ↓
[@aiready/ui, @aiready/charts, @aiready/utils] (NEW SPOKES)
    ↓
Consumer Apps (Landing, SaaS Dashboard, Visualizer Web)
```

**Key Principles:**
- ✅ Each package depends only on @aiready/core (if needed)
- ✅ Independently useful
- ✅ No cross-dependencies between ui/charts/utils
- ✅ Published to npm as public packages
- ✅ Synced to GitHub spoke repos

## 📋 Implementation Phases

### Phase 1: @aiready/ui (Weeks 1-2) 🚀 PRIORITY

**Status:** 🔜 Not Started

#### Week 1: Foundation

- [ ] **Package Setup**
  - [ ] Create `packages/ui/` directory structure
  - [ ] Set up `package.json` with proper exports
  - [ ] Configure TypeScript (`tsconfig.json`)
  - [ ] Set up build system (tsup for library, Vite for dev)
  - [ ] Create `README.md` with usage examples

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

#### Week 2: Extended Components

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

- [ ] **Release Preparation**
  - [ ] Build package (`pnpm build`)
  - [ ] Test in landing page
  - [ ] Create GitHub repo: `aiready-ui`
  - [ ] Publish to npm: `@aiready/ui@0.1.0`

**Deliverable:** `@aiready/ui@0.1.0` published and ready for consumption

---

### Phase 2: @aiready/charts (Weeks 3-4)

**Status:** 🔜 Not Started

#### Week 3: Core Charts

- [ ] **Package Setup**
  - [ ] Create `packages/charts/` directory structure
  - [ ] Set up `package.json` with D3 dependencies
  - [ ] Configure TypeScript
  - [ ] Set up build system (tsup)
  - [ ] Create `README.md`

- [ ] **D3 Foundation**
  - [ ] Create shared D3 utilities (scales, axes)
  - [ ] Set up responsive SVG/Canvas wrappers
  - [ ] Create tooltip system
  - [ ] Set up color schemes (from @aiready/utils)

- [ ] **Basic Charts**
  - [ ] LineChart (time series trends)
  - [ ] BarChart (comparisons)
  - [ ] ScatterPlot (correlation)
  - [ ] PieChart (distribution)

#### Week 4: Advanced Visualizations

- [ ] **Specialized Charts**
  - [ ] ForceDirectedGraph (d3-force integration)
  - [ ] HeatMap (file/module hotspots)
  - [ ] TreeMap (hierarchical data)
  - [ ] Sankey Diagram (flow visualization)

- [ ] **Interactive Features**
  - [ ] Zoom & pan support
  - [ ] Brush selection
  - [ ] Crosshairs
  - [ ] Legend system
  - [ ] Export to PNG/SVG

- [ ] **Hooks**
  - [ ] useD3 (D3 lifecycle management)
  - [ ] useForceSimulation (d3-force wrapper)
  - [ ] useTooltip (tooltip positioning)
  - [ ] useResponsive (responsive sizing)

- [ ] **Release Preparation**
  - [ ] Build package (`pnpm build`)
  - [ ] Test with sample data
  - [ ] Create GitHub repo: `aiready-charts`
  - [ ] Publish to npm: `@aiready/charts@0.1.0`

**Deliverable:** `@aiready/charts@0.1.0` published with D3-based chart components

---

### Phase 3: @aiready/utils (Week 5)

**Status:** 🔜 Not Started

- [ ] **Package Setup**
  - [ ] Create `packages/utils/` directory structure
  - [ ] Set up `package.json`
  - [ ] Configure TypeScript
  - [ ] Set up build system (tsup)
  - [ ] Create `README.md`

- [ ] **Formatters**
  - [ ] Date/time formatters (relative time, ISO format)
  - [ ] Number formatters (token costs, percentages, file sizes)
  - [ ] String utilities (truncate, slugify, capitalize)

- [ ] **Color Schemes**
  - [ ] Severity colors (critical → major → minor → info)
  - [ ] Domain/category colors (consistent palette)
  - [ ] Color manipulation (lighten, darken, alpha)

- [ ] **React Hooks**
  - [ ] useDebounce
  - [ ] useLocalStorage
  - [ ] useMediaQuery
  - [ ] useIntersectionObserver
  - [ ] usePrevious
  - [ ] useClickOutside

- [ ] **Constants**
  - [ ] Breakpoints (mobile, tablet, desktop)
  - [ ] Z-index scale
  - [ ] Animation timings
  - [ ] API endpoints (if shared)

- [ ] **Release Preparation**
  - [ ] Build package (`pnpm build`)
  - [ ] Write unit tests
  - [ ] Create GitHub repo: `aiready-utils`
  - [ ] Publish to npm: `@aiready/utils@0.1.0`

**Deliverable:** `@aiready/utils@0.1.0` published

---

### Phase 4: Integration (Week 6)

**Status:** 🔜 Not Started

#### Landing Page Migration

- [ ] **Update Dependencies**
  - [ ] Add `@aiready/ui`, `@aiready/charts`, `@aiready/utils` to package.json
  - [ ] Remove duplicate component code
  - [ ] Update Tailwind config to use shared config

- [ ] **Component Migration**
  - [ ] Replace custom buttons with `@aiready/ui/button`
  - [ ] Replace custom cards with `@aiready/ui/card`
  - [ ] Update chart components to use `@aiready/charts`
  - [ ] Use shared formatters from `@aiready/utils`

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
  - [ ] Add dependencies: `@aiready/ui`, `@aiready/charts`, `@aiready/utils`

- [ ] **Build Interactive UI**
  - [ ] App shell with `@aiready/ui` components
  - [ ] ForceDirectedGraph from `@aiready/charts`
  - [ ] Controls panel (filters, layout options)
  - [ ] Details panel (node/edge info)
  - [ ] Legend component

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
# Create GitHub repos for new packages
gh repo create aiready-ui --public --description "Shared UI component library for AIReady"
gh repo create aiready-charts --public --description "Shared D3-based chart components for AIReady"
gh repo create aiready-utils --public --description "Shared utilities for AIReady frontend packages"
```

### Publishing Workflow (For Each Package)

#### 1. Development in Monorepo

```bash
# Work in monorepo (packages/ui/, packages/charts/, packages/utils/)
cd packages/ui
pnpm install
pnpm build
pnpm test
```

#### 2. Commit to Monorepo

```bash
git add packages/ui
git commit -m "feat(ui): add Button and Card components"
git push origin main
```

#### 3. Sync to Spoke Repo (Automatic via Makefile)

```bash
# This syncs ALL packages including new ones
make push-all

# Or sync individual package
make publish SPOKE=ui OWNER=caopengau
```

#### 4. Publish to npm

```bash
# Bump version
make version-patch SPOKE=ui  # 0.1.0 → 0.1.1

# Publish to npm
make npm-publish SPOKE=ui

# Or use shortcuts
make npm-publish-ui
```

### Makefile Shortcuts (To Be Added)

Add to `makefiles/Makefile.publish.mk`:

```makefile
# Convenience shortcuts for new packages
publish-ui: ## Publish @aiready/ui to GitHub
	@$(MAKE) publish SPOKE=ui OWNER=$(OWNER)

publish-charts: ## Publish @aiready/charts to GitHub
	@$(MAKE) publish SPOKE=charts OWNER=$(OWNER)

publish-utils: ## Publish @aiready/utils to GitHub
	@$(MAKE) publish SPOKE=utils OWNER=$(OWNER)

npm-publish-ui: ## Publish @aiready/ui to npm
	@$(MAKE) npm-publish SPOKE=ui

npm-publish-charts: ## Publish @aiready/charts to npm
	@$(MAKE) npm-publish SPOKE=charts

npm-publish-utils: ## Publish @aiready/utils to npm
	@$(MAKE) npm-publish SPOKE=utils
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
@aiready/core
    ↓
[@aiready/ui]  [@aiready/charts]  [@aiready/utils]
    ↓               ↓                    ↓
    └───────────────┴────────────────────┘
                    ↓
        [Landing, SaaS, Visualizer Web]
```

**Dependency Rules:**
- ✅ `@aiready/ui` → can import `@aiready/utils`
- ✅ `@aiready/charts` → can import `@aiready/utils`
- ❌ `@aiready/ui` ↔️ `@aiready/charts` (no cross-dependencies)
- ❌ Consumer apps should not be dependencies

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

## 📦 Package.json Templates

### @aiready/ui

```json
{
  "name": "@aiready/ui",
  "version": "0.1.0",
  "description": "Shared UI component library for AIReady",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./button": "./dist/components/button.js",
    "./card": "./dist/components/card.js",
    "./tailwind-config": "./tailwind.config.js"
  },
  "files": ["dist", "tailwind.config.js"],
  "scripts": {
    "dev": "tsup --watch",
    "build": "tsup",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "dependencies": {
    "@aiready/utils": "workspace:*",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^19",
    "tailwindcss": "^4",
    "tsup": "^8.3.5",
    "typescript": "^5.7.2"
  }
}
```

### @aiready/charts

```json
{
  "name": "@aiready/charts",
  "version": "0.1.0",
  "description": "Shared D3-based chart components for AIReady",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": "./dist/index.js",
    "./line-chart": "./dist/components/LineChart.js",
    "./force-graph": "./dist/components/ForceGraph.js"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "dependencies": {
    "@aiready/utils": "workspace:*",
    "d3": "^7.9.0",
    "d3-force": "^3.0.0"
  }
}
```

### @aiready/utils

```json
{
  "name": "@aiready/utils",
  "version": "0.1.0",
  "description": "Shared utilities for AIReady frontend packages",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "sideEffects": false,
  "dependencies": {}
}
```

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
| @aiready/ui | 🔜 Not Started | - | - | - | Priority Phase 1 |
| @aiready/charts | 🔜 Not Started | - | - | - | Phase 2 |
| @aiready/utils | 🔜 Not Started | - | - | - | Phase 3 |

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
**Priority:** Phase 1 (@aiready/ui) for Visualizer Phase 2
**Timeline:** 6 weeks total (2 weeks per major phase)
**Maintainer:** @caopengau
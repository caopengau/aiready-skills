# AIReady Visualization Architecture Proposal

## Executive Summary

This document proposes the architecture and technology stack for adding interactive visualization capabilities to the AIReady suite. The visualization layer will represent codebase structure, file dependencies, hotspots, issues, and provide interactive operations on diagrams.

## 1. Overview

### 1.1 Goals

- **Visual Representation**: Display codebase structure, file dependencies, and relationships
- **Hotspot Detection**: Highlight problematic areas (high duplication, deep dependencies, fragmentation)
- **Issue Mapping**: Overlay analysis results (patterns, context, consistency) on the graph
- **Interactive Operations**: Allow users to explore, filter, zoom, and potentially trigger optimizations
- **Multi-tool Integration**: Combine insights from all AIReady spokes (pattern-detect, context-analyzer, consistency)

### 1.2 Use Cases

1. **Dependency Visualization**: Show import/export relationships as a directed graph
2. **Hotspot Heatmap**: Color-code files by severity, token cost, or duplicate patterns
3. **Circular Dependency Detection**: Visually identify and highlight cycles
4. **Cluster Analysis**: Show module clusters and domain groupings
5. **Impact Analysis**: Show what files would be affected by changes
6. **Optimization Planning**: Visualize potential consolidation opportunities

## 2. Proposed Architecture

### 2.1 Hub-and-Spoke Pattern Compliance

Following AIReady's architecture principles:

```
@aiready/core (HUB)
    ↓
@aiready/visualizer (NEW SPOKE)
    ├── Graph Builder (transforms analysis data → graph data structures)
    ├── Layout Engine (computes node positions)
    ├── Renderer (generates visualization output)
    └── Interactive Layer (handles user interactions)
    ↓
@aiready/cli (HUB - integration point)
```

**Key Principles**:
- ✅ Spoke depends only on @aiready/core
- ✅ Independently useful (can visualize any codebase graph)
- ✅ CLI integration for unified interface
- ✅ No dependencies on other spokes (pattern-detect, context-analyzer)

### 2.2 Package Structure

```
packages/visualizer/
├── src/
│   ├── index.ts              # Main API for data preparation
│   ├── types.ts              # Visualization types
│   ├── graph/
│   │   ├── builder.ts        # Build graph from analysis results
│   │   ├── transformer.ts    # Transform to visualization format
│   │   └── metrics.ts        # Graph metrics (centrality, clustering)
│   └── cli.ts                # CLI for generating HTML output
├── web/                       # Frontend application (Vite + React)
│   ├── src/
│   │   ├── App.tsx           # Main application component
│   │   ├── components/       # React components
│   │   │   ├── Graph.tsx     # d3-force graph visualization
│   │   │   ├── Controls.tsx  # Filters, layout options
│   │   │   ├── Details.tsx   # Node/edge details panel
│   │   │   └── Legend.tsx    # Color/size legend
│   │   ├── hooks/
│   │   │   ├── useForceGraph.ts  # d3-force integration
│   │   │   └── useGraphData.ts   # Data management
│   │   ├── utils/
│   │   │   ├── layout.ts     # d3-force layout configurations
│   │   │   └── colors.ts     # Color schemes
│   │   └── styles/
│   │       └── main.css      # TailwindCSS + custom styles
│   ├── index.html            # HTML template
│   ├── vite.config.ts        # Vite configuration
│   └── public/               # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

### 2.3 Data Flow

```
Analysis Results (pattern-detect, context-analyzer, consistency)
    ↓
Graph Builder (CLI/Node.js)
    ↓
Graph Data Structure {
  nodes: FileNode[],           // Files with metrics
  edges: DependencyEdge[],     // Import relationships
  clusters: Cluster[],          // Domain/module groupings
  issues: IssueOverlay[]       // Problems mapped to nodes/edges
}
    ↓
Embedded in HTML as JSON
    ↓
Frontend Application (Browser)
    ↓
d3-force Layout Engine
    ↓
Positioned Graph {
  nodes: { id, x, y, size, color, metrics },
  edges: { source, target, weight, color }
}
    ↓
Interactive Canvas/SVG Rendering
    ↓
User Interactions (zoom, pan, filter, select)
```

## 3. Technology Stack

### 3.1 Core Libraries

#### Graph Data Structure & Algorithms
- **[@dagrejs/graphlib](https://github.com/dagrejs/graphlib)** (3KB gzipped)
  - Directed graph data structure
  - Cycle detection, topological sort, shortest paths
  - Well-maintained, widely used
  - **Why**: Lightweight, battle-tested, perfect for dependency graphs

#### Layout Engines
- **[d3-force](https://d3js.org/d3-force)** (8KB gzipped, standalone)
  - Physics-based force-directed layout with multiple simulation types
  - Supports hierarchical layouts via custom forces
  - Good for showing clusters, relationships, and dependencies
  - **Why**: Industry standard, highly customizable, lightweight, single dependency for all layout needs

#### Rendering

**Frontend (Browser)**:
- **[React](https://react.dev/)** (45KB gzipped) - UI framework
- **[react-force-graph](https://github.com/vasturiano/react-force-graph)** (40KB gzipped)
  - WebGL-accelerated graph rendering
  - Handles 1000+ nodes smoothly
  - Built-in zoom, pan, drag
  - **Why**: Best performance for large graphs

- **Alternative**: **[Cytoscape.js](https://js.cytoscape.org/)** (80KB gzipped)
  - More layout options
  - Better for complex interactions
  - **Trade-off**: Larger bundle, steeper learning curve


### 3.2 Interactive Features


#### State Management (Frontend)
- **[zustand](https://github.com/pmndrs/zustand)** (3KB gzipped)
  - Simple state management
  - Better than Redux for this use case
  - **Why**: Minimal boilerplate, TypeScript-first

### 3.3 Styling & UI

- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** - Component library (copy-paste, no runtime)
- **[lucide-react](https://lucide.dev/)** - Icon library (tree-shakeable)

### 3.4 Build & Bundle

- **[tsup](https://tsup.egoist.dev/)** - TypeScript bundler for CLI package
- **[Vite](https://vitejs.dev/)** - Frontend build tool (fast, modern, outputs standalone HTML)

## 4. API Design

### 4.1 Core API

```typescript
import { visualizeCodebase } from '@aiready/visualizer';

// Simple usage
await visualizeCodebase({
  rootDir: './src',
  output: 'codebase-graph.html', // or .svg, .png
  layout: 'hierarchical', // or 'force', 'circular'
  showIssues: true,
  openInBrowser: true,
});

// Advanced usage with analysis data
import { analyzeUnified } from '@aiready/cli';

const analysis = await analyzeUnified({
  rootDir: './src',
  tools: ['patterns', 'context', 'consistency'],
});

await visualizeCodebase({
  rootDir: './src',
  analysis, // Pre-computed analysis results
  layout: 'force',
  filters: {
    minTokenCost: 1000, // Only show expensive files
    severity: ['critical', 'major'], // Only critical/major issues
    excludeExternal: true, // Hide node_modules
  },
  colorBy: 'tokenCost', // or 'duplicates', 'severity', 'domain'
  sizeBy: 'linesOfCode', // or 'dependencies', 'exports'
  output: 'graph.html',
});
```

### 4.2 CLI Integration

```bash
# Basic visualization
aiready visualize ./src --output graph.html --open

# With analysis
aiready scan ./src --visualize --output report.html

# Custom options (embedded in HTML)
aiready visualize ./src --layout force --color-by duplicates --size-by token-cost --output graph.html

# All options are set in the generated HTML file
# No server needed - just open the HTML file in a browser
```

### 4.3 Graph Data Types

```typescript
export interface VisualizationGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: GraphCluster[];
  metadata: GraphMetadata;
}

export interface GraphNode {
  id: string; // File path
  label: string; // Display name
  type: 'file' | 'directory' | 'external';
  
  // Metrics (from analysis)
  metrics: {
    tokenCost: number;
    linesOfCode: number;
    dependencies: number;
    imports: number;
    exports: number;
    duplicatePatterns: number;
    cohesionScore: number;
    fragmentationScore: number;
  };
  
  // Issues (from analysis)
  issues: {
    severity: 'critical' | 'major' | 'minor' | 'info';
    count: number;
    types: string[]; // ['duplicate-pattern', 'circular-dep', etc.]
  };
  
  // Visual properties (computed by layout)
  position?: { x: number; y: number };
  size?: number;
  color?: string;
  
  // Domain/cluster assignment
  domain?: string;
  clusterId?: string;
}

export interface GraphEdge {
  source: string; // Node ID
  target: string; // Node ID
  type: 'import' | 'export' | 'type-dependency';
  weight: number; // Strength of dependency
  
  // Visual properties
  color?: string;
  width?: number;
  
  // Flags
  isCircular?: boolean;
  isCriticalPath?: boolean;
}

export interface GraphCluster {
  id: string;
  domain: string;
  nodes: string[]; // Node IDs
  metrics: {
    totalTokens: number;
    avgCohesion: number;
    fragmentationScore: number;
  };
  
  // Visual properties
  color?: string;
  bounds?: { x: number; y: number; width: number; height: number };
}

export interface GraphMetadata {
  totalNodes: number;
  totalEdges: number;
  avgDegree: number;
  density: number;
  connectedComponents: number;
  circularDependencies: string[][];
}
```

## 5. Visualization Modes

### 5.1 Dependency Graph (Default)
- **Layout**: Force-directed with hierarchical forces
- **Nodes**: Files
- **Edges**: Imports
- **Color**: By severity or domain
- **Size**: By token cost or LOC
- **Use Case**: Understand overall structure

### 5.2 Hotspot Heatmap
- **Layout**: Force-directed
- **Nodes**: Files (larger = more issues)
- **Edges**: Dependencies
- **Color**: Red (critical) → Yellow (major) → Green (minor)
- **Size**: By issue count or token cost
- **Use Case**: Identify problem areas quickly

### 5.3 Circular Dependencies
- **Layout**: Force-directed with radial constraints
- **Nodes**: Only files in circular deps
- **Edges**: Highlighted cycles
- **Color**: Red for cycle edges
- **Use Case**: Debug circular dependency chains

### 5.4 Domain Clusters
- **Layout**: Force-directed with clustering
- **Nodes**: Files grouped by domain
- **Edges**: Cross-domain dependencies highlighted
- **Color**: By domain/cluster
- **Size**: By cohesion score
- **Use Case**: Understand modular boundaries

### 5.5 Impact Analysis
- **Layout**: Force-directed with center gravity on selected node
- **Nodes**: Selected file + all dependents/dependencies
- **Edges**: Direct and transitive dependencies
- **Color**: Depth from selected node
- **Use Case**: Understand change impact

## 6. Interactive Features

### 6.1 Basic Interactions
- **Zoom/Pan**: Navigate large graphs
- **Hover**: Show metrics tooltip
- **Click**: Select node, show details panel
- **Drag**: Reposition nodes (force layout)
- **Search**: Find files by name/path

### 6.2 Filters
- **By Severity**: Show only critical/major issues
- **By Type**: Filter by file type (.ts, .py, etc.)
- **By Metrics**: Min/max thresholds (token cost, duplicates, etc.)
- **By Domain**: Show specific domains/clusters
- **Exclude External**: Hide node_modules, test files

### 6.3 Optimization Operations (Future)
- **View Refactoring Suggestion**: For duplicate patterns
- **Simulate Consolidation**: Preview cluster consolidation
- **Export Subset**: Export filtered graph as new report
- **Generate Migration Plan**: Create step-by-step refactoring plan

## 7. Implementation Phases

### Phase 1: Foundation & Core Visualization (Week 1-2)
- [ ] Create @aiready/visualizer package structure
- [ ] Implement graph builder (transform analysis → graph)
- [ ] Set up Vite + React frontend with TailwindCSS
- [ ] Implement d3-force layout with basic forces (charge, link, center)
- [ ] Create Graph component with Canvas rendering
- [ ] Implement basic CLI to generate HTML output with embedded data
- [ ] Add basic interactions (zoom, pan, hover)

### Phase 2: Interactive Features (Week 2-3)
- [ ] Add node click for details panel
- [ ] Implement filters panel (severity, type, metrics)
- [ ] Add search and highlight functionality
- [ ] Implement multiple d3-force configurations (hierarchical forces, radial forces)
- [ ] Add legend component (color/size mappings)
- [ ] Optimize rendering performance for large graphs

### Phase 3: Visualization Modes (Week 3-4)
- [ ] Implement hotspot heatmap mode
- [ ] Add circular dependency detection and highlighting
- [ ] Implement domain cluster visualization
- [ ] Add impact analysis mode (expand from selected node)
- [ ] Create layout presets switcher

### Phase 4: Polish & Advanced Features (Week 4-5)
- [ ] Add export capabilities (PNG, SVG from canvas)
- [ ] Implement state persistence (URL parameters)
- [ ] Add keyboard shortcuts
- [ ] Optimize for large graphs (10K+ nodes)
- [ ] Add accessibility features (keyboard navigation)
- [ ] Integration with @aiready/cli

## 8. Technical Considerations

### 8.1 Performance
- **Large Graphs**: Use WebGL rendering (react-force-graph)
- **Lazy Loading**: Load nodes on-demand for huge codebases (10K+ files)
- **Virtualization**: Only render visible nodes
- **Caching**: Cache layout calculations
- **Worker Threads**: Compute layouts in background

### 8.2 Scalability
- **Target**: Handle up to 10,000 files smoothly
- **Strategy**:
  - Default filters to reduce initial load
  - Progressive disclosure (start with high-level, drill down)
  - Aggregation (show directories instead of files for overview)

### 8.3 Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (evergreen)
- **No IE11**: Use ES2020+ features
- **Mobile**: Basic support (not optimized for touch)

### 8.4 Accessibility
- **Keyboard Navigation**: Tab through nodes
- **Screen Readers**: Provide text alternatives
- **Color Blindness**: Use patterns + colors (not just colors)
- **High Contrast**: Support high contrast mode

## 9. Bundle Size Estimate

### CLI Package (Node.js)
- @aiready/core: Shared dependency
- Graph builder utilities: ~10KB
- **Total: ~10-20KB** (minimal, just data transformation)

### Frontend Bundle (Browser)
- React: 45KB
- react-force-graph: 40KB (or custom d3-force implementation: 15KB)
- zustand: 3KB
- TailwindCSS: ~10KB (purged)
- lucide-react: ~5KB (tree-shaken)
- **Total: ~100KB gzipped** (or ~80KB with custom d3-force)

### Generated HTML File
- Frontend bundle: ~100KB (embedded inline or as data URI)
- Graph data (JSON): Variable (10-500KB for typical projects)
- **Total: ~110-600KB** (single HTML file, opens directly in browser, no server needed)

## 10. Alternatives Considered

### 10.1 Why Not Graphviz/DOT?
- ❌ Requires external binary (not portable)
- ❌ Limited interactivity
- ❌ Less control over layout
- ✅ But: Could add as export format

### 10.2 Why Not Mermaid?
- ❌ Not designed for large graphs (slow beyond 100 nodes)
- ❌ Limited layout control
- ❌ Text-based (harder to generate programmatically)
- ✅ But: Could add as export format for documentation

### 10.3 Why Not dagre for hierarchical layouts?
- ✅ d3-force can achieve hierarchical layouts using custom forces
- ✅ Single library for all layout needs (simpler dependency management)
- ✅ More flexible and customizable
- ✅ Better integration with interactive features

### 10.4 Why Not Three.js?
- ❌ Overkill for 2D graphs
- ❌ Larger bundle (600KB+)
- ❌ More complex
- ✅ But: Could add 3D mode as opt-in

## 11. Success Metrics

### 11.1 Technical Metrics
- Load time < 2s for 1000 nodes
- Smooth 60 FPS interactions
- Bundle size < 150KB gzipped
- Works with 10,000 nodes (with virtualization)

### 11.2 User Metrics
- Identify circular dependencies in < 10 seconds
- Find high-cost files in < 5 seconds
- Understand codebase structure without documentation

## 12. Future Enhancements

### 12.1 Short-term (3-6 months)
- Export to PNG/PDF
- VS Code extension integration
- GitHub Action for CI/CD visualization
- Diff mode (compare before/after refactoring)

### 12.2 Long-term (6-12 months)
- AI-powered suggestions (GPT integration)
- 3D graph mode (for very large codebases)
- Collaborative features (share annotations)
- Time-series visualization (track metrics over time)
- Integration with other tools (SonarQube, CodeScene)

## 13. Recommended Decision

### Primary Stack
✅ **d3-force** for all graph layouts (hierarchical, force-directed, radial)  
✅ **React + Canvas** for high-performance rendering  
✅ **Vite** for building standalone HTML output  
✅ **No backend required** - pure frontend solution  
✅ **Single HTML file** output with embedded data and bundle  

### Why This Stack?
1. **Simple**: Single dependency for layouts (d3-force)
2. **Lightweight**: Total bundle ~80-100KB
3. **Portable**: No server needed, works offline
4. **Performant**: Canvas rendering handles 1000+ nodes smoothly
5. **Flexible**: d3-force supports all layout types via custom forces
6. **Maintainable**: Fewer dependencies, simpler architecture

### Next Steps
1. Set up @aiready/visualizer package structure
2. Create Vite + React frontend with d3-force integration
3. Implement graph builder in CLI package
4. Build basic HTML generation with embedded data
5. Validate with real AIReady analysis data
6. Iterate on layout configurations and interactions

## 14. Open Questions

1. **Should we support 3D visualization?** (Probably not initially - adds complexity)
2. **Should we integrate with external tools?** (e.g., Graphviz export, Mermaid export)
3. **Should we build a hosted service?** (Upload report → visualize online)
4. **Should we support real-time collaboration?** (Probably not - scope creep)
5. **Should we support custom plugins?** (Maybe in future - extensibility)

## 15. Conclusion

The proposed architecture provides a solid foundation for adding visualization capabilities to AIReady while maintaining the hub-and-spoke pattern and architectural principles. The chosen stack balances performance, bundle size, and developer experience.

**Recommendation**: Proceed with Phase 1 implementation and gather feedback before committing to advanced features.
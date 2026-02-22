import meta from './visualizing-invisible.meta';
import React from 'react';
import CodeBlock from '../../components/CodeBlock';

const Post = () => (
  <>
    <blockquote>Part 6 of "The AI Code Debt Tsunami" series</blockquote>

    <div className="my-8 max-w-4xl mx-auto">
      <img src="/series-6-visualise-invisible-debt.png" alt="Visualizing the Invisible - cover" className="w-full rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800" />
    </div>

    <p>
      When we talk about technical debt, we usually talk about lists. A linter report with 450 warnings. A backlog with 32 "refactoring" tickets. A SonarQube dashboard showing 15% duplication.
    </p>

    <p>
      But for AI-generated code, lists are deceiving. "15 duplicates" sounds manageable—until you realize they are all slight variations of your core authentication logic spread across five different micro-frontends.
    </p>

    <p>
      Text-based metrics fail to convey <strong>structural complexity</strong>. They tell you <em>what</em> is wrong, but not <em>where</em> it fits in the bigger picture. In the age of "vibe coding," where code is generated faster than it can be read, we need a new way to understand our systems. We need to see the shape of our debt.
    </p>

    <h2>The Solution: Introducing the AIReady Visualizer</h2>

    <p>
      To tackle this, we've built the <strong>AIReady Visualizer</strong>. It's not just another static dependency chart; it’s an interactive, force-directed graph that maps file dependencies and semantic relationships in real-time.
    </p>

    <p>
      By analyzing <code>import</code> statements and semantic similarity (using vector embeddings), we render your codebase as a living organism. When you see your code as a graph, the "invisible" structural problems of AI code debt suddenly become obvious visual patterns.
    </p>

    <h2>The Shape of Debt: 3 Visual Patterns</h2>

    <p>
      When we run the visualizer on "vibe-coded" projects, three distinct patterns emerge—each signaling a different kind of risk.
    </p>

    <h3>1. The Hairball (Tightly Coupled Modules)</h3>

    <img src="/images/hairball.png" alt="The Hairball Pattern - A dense cluster of interconnected nodes" className="w-full rounded-lg shadow-md my-4" />

    <p>
      <strong>What it looks like:</strong> A dense, tangled mess of nodes where everything imports everything else. There are no clear layers or boundaries.
    </p>

    <p>
      <strong>The Problem:</strong> This pattern kills AI context windows. When an AI agent tries to modify one file in a "Hairball," it often needs to understand the entire tangle to avoid breaking things. Pulling one file into context pulls the whole graph, leading to token limit exhaustion or hallucinated dependencies.
    </p>

    <p>
      <strong>The Fix:</strong> You need to refactor by breaking cycles and enforcing strict module boundaries. The visualizer helps identify the "knot" that holds the hairball together.
    </p>

    <h3>2. The Orphans (Islands of Dead Code)</h3>

    <img src="/images/orphans.png" alt="The Orphans Pattern - Disconnected clusters of nodes" className="w-full rounded-lg shadow-md my-4" />

    <p>
      <strong>What it looks like:</strong> Small clusters or individual nodes floating completely separate from the main application graph.
    </p>

    <p>
      <strong>The Problem:</strong> These are often fossils of abandoned AI experiments—features that were generated, tested, and forgotten, but never deleted. They bloat the repo size and confuse developers ("What is this <code>legacy-auth-v2</code> folder doing?"). More dangerously, they can be "hallucinated" back to life if an AI agent mistakenly imports them.
    </p>

    <p>
      <strong>The Fix:</strong> If it's not connected to the entry point, delete it. The visualizer makes finding these islands trivial.
    </p>

    <h3>3. The Butterflies (High Fan-In/Fan-Out)</h3>

    <img src="/images/butterflies.png" alt="The Butterflies Pattern - A central node with many connections" className="w-full rounded-lg shadow-md my-4" />

    <p>
      <strong>What it looks like:</strong> A single node with massive connections radiating out (high fan-out) or pointing in (high fan-in). Often seen in files named <code>utils/index.ts</code> or <code>types/common.ts</code>.
    </p>

    <p>
      <strong>The Problem:</strong> These files are bottlenecks and context bloat.
    </p>

    <ul className="list-disc pl-6 mb-4 space-y-2">
      <li>
        <strong>High Fan-In:</strong> Changing this file breaks <em>everything</em>. AI agents struggle to predict the blast radius of changes here.
      </li>
      <li>
        <strong>High Fan-Out:</strong> Importing this file brings in a massive tree of unnecessary dependencies, polluting the AI's context window with irrelevant code.
      </li>
    </ul>

    <p>
      <strong>The Fix:</strong> Split these "god objects" into smaller, deeper modules.
    </p>

    <h2>How It Works</h2>

    <p>
      Under the hood, the AIReady Visualizer combines two powerful tools:
    </p>

    <ol className="list-decimal pl-6 mb-4 space-y-2">
      <li>
        <strong>@aiready/graph:</strong> Our analysis engine that parses TypeScript/JavaScript ASTs to build a precise dependency graph. It creates a weighted network of files based on import strength and semantic similarity.
      </li>
      <li>
        <strong>D3.js:</strong> We use D3's force simulation to render this network. Files that are tightly coupled naturally pull together, while unrelated modules drift apart, physically revealing the architecture (or lack thereof).
      </li>
    </ol>

    <h2>Use Case: Bridging the "Vibe" Gap</h2>

    <p>
      We're seeing a growing divide in engineering teams:
    </p>

    <ul className="list-disc pl-6 mb-4 space-y-2">
      <li>
        <strong>The "Vibe Coders":</strong> Junior devs or founders using AI to ship features at breakneck speed. Their focus is <em>output</em>.
      </li>
      <li>
        <strong>The Engineering Managers:</strong> Seniors trying to maintain stability and scalability. Their focus is <em>structure</em>.
      </li>
    </ul>

    <p>
      The visualizer bridges this gap. It's hard to explain abstract architectural principles to a junior dev who just wants to "ship it." It's much easier to show them a giant, tangled "Hairball" and say, <em>"See this knot? This is why your build takes 15 minutes and why the AI keeps getting confused."</em>
    </p>

    <p>
      Visuals turn abstract "best practices" into concrete, observable reality.
    </p>

    <h2>See Your Own Codebase</h2>

    <p>
      Don't let your codebase become a black box. You can visualize your own project's shape today.
    </p>

    <p>The visualizer ships as part of the unified <code>@aiready/cli</code>. Three commands gets you a full interactive graph:</p>

    <div className="my-6">
      <CodeBlock lang="bash">{`# 1. Scan your codebase
npx aiready analyze

# 2. Start the interactive visualizer
npx aiready visualise

# 3. Export a shareable static report
npx aiready visualise --output report.html`}</CodeBlock>
    </div>

    <div className="my-8 max-w-3xl mx-auto">
      <img src="/example-visualisation.png" alt="Example AIReady visualisation" className="w-full rounded-lg shadow-md" />
      <p className="text-center text-sm text-slate-500 mt-3 italic">Example visualiser output highlighting clusters and token-cost overlays.</p>
    </div>

    <p>The output gives you:</p>

    <ul className="list-disc pl-6 mb-4 space-y-2">
      <li><strong>Colour-coded nodes</strong> by AI readiness score (green → red)</li>
      <li><strong>Edge thickness</strong> proportional to import coupling strength</li>
      <li><strong>Cluster labels</strong> automatically identifying Hairballs, Orphans, and Butterflies</li>
      <li><strong>Hover tooltips</strong> showing token cost, import depth, and cohesion score per file</li>
      <li>A <strong>shareable HTML report</strong> you can open anywhere — no tooling required</li>
    </ul>

    <h2>What&apos;s Next</h2>

    <p>This wraps up the six-part &ldquo;AI Code Debt Tsunami&rdquo; series. If you&apos;ve followed along, you now have:</p>

    <ol className="list-decimal pl-6 mb-4 space-y-2">
      <li><strong>Why</strong> AI code debt forms faster than traditional debt</li>
      <li><strong>Why</strong> your codebase is invisible to AI — semantic duplicates, fragmentation, low cohesion</li>
      <li><strong>What</strong> metrics actually capture AI-readiness</li>
      <li><strong>How</strong> to detect semantic duplicates automatically</li>
      <li><strong>How</strong> to measure and reduce import-chain context costs</li>
      <li><strong>How</strong> to <em>see</em> the shape of your debt visually ← You are here</li>
    </ol>

    <p>
      The natural next step is moving from <em>detection</em> to <em>remediation</em> — which is exactly what the AIReady Platform (currently in beta) is designed to do: auto-generated refactoring plans, trend tracking over time, and team-level benchmarks.
    </p>

    <hr className="my-12 border-slate-200 dark:border-zinc-800" />

    <p><strong>Resources:</strong></p>
    <ul className="list-disc pl-6 mb-4 space-y-2">
      <li>GitHub: <a href="https://github.com/caopengau/aiready-cli">github.com/caopengau/aiready-cli</a></li>
      <li>Docs: <a href="https://aiready.dev">aiready.dev</a></li>
      <li>Report issues: <a href="https://github.com/caopengau/aiready-cli/issues">github.com/caopengau/aiready-cli/issues</a></li>
    </ul>

    <hr className="my-12 border-slate-200 dark:border-zinc-800" />

    <p>
      <strong>Found a Hairball, Orphan, or Butterfly in your graph?</strong> Share a screenshot in the comments — I&apos;d love to see what patterns show up in the wild.
    </p>

    <hr className="my-12 border-slate-200 dark:border-zinc-800" />

    <p className="text-sm italic text-slate-500">
      *Peng Cao is the founder of{" "}
      <a href="https://receiptclaimer.com">receiptclaimer</a> and creator of{" "}
      <a href="https://github.com/caopengau/aiready-cli">aiready</a>, an
      open-source suite for measuring and optimising codebases for AI adoption.*
    </p>

    <hr className="my-12 border-slate-200 dark:border-zinc-800" />

    <p><strong>Read the full series:</strong></p>
    <ul className="list-disc pl-6 mb-4 space-y-2">
      <li><a href="/blog/ai-code-debt-tsunami">Part 1: The AI Code Debt Tsunami is Here (And We&apos;re Not Ready)</a></li>
      <li><a href="/blog/invisible-codebase">Part 2: Why Your Codebase is Invisible to AI</a></li>
      <li><a href="/blog/metrics-that-actually-matter">Part 3: AI Code Quality Metrics That Actually Matter</a></li>
      <li><a href="/blog/semantic-duplicate-detection">Part 4: Deep Dive: Semantic Duplicate Detection</a></li>
      <li><a href="/blog/hidden-cost-import-chains">Part 5: The Hidden Cost of Import Chains</a></li>
      <li><strong>Part 6: Visualizing the Invisible ← You are here</strong></li>
    </ul>
  </>
);

export default Post;

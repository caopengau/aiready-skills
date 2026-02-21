import meta from './visualizing-invisible.meta';
import React from 'react';
import CodeBlock from '../../components/CodeBlock';

const Post = () => (
  <>
    <blockquote>Part 6 of "The AI Code Debt Tsunami" series</blockquote>

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

    <p>Run the analysis on your repository:</p>

    <div className="my-6">
      <CodeBlock language="bash" code="npx aiready visualise" />
    </div>

    <p>
      Stop guessing where the debt is. Start seeing it.
    </p>
  </>
);

export default Post;

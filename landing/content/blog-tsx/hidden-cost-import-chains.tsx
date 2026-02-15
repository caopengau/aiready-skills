import meta from './hidden-cost-import-chains.meta';
import React from 'react';
import CodeBlock from '../../components/CodeBlock';

const Post = () => (
  <>
    <p>
      You open a seemingly simple file in your codebase:
    </p>

    <CodeBlock lang="typescript">{`// src/api/user-profile.ts (52 lines)
import { validateUser } from './validators';
import { formatResponse } from './formatters';
import { logRequest } from './logger';

export async function getUserProfile(userId: string) {
  validateUser(userId);
  const user = await fetchUser(userId);
  logRequest('getUserProfile', userId);
  return formatResponse(user);
}`}</CodeBlock>

    <p>
      Looks clean, right? Just 52 lines, three imports, straightforward logic. But when your AI assistant tries to understand this file, here&apos;s what actually gets loaded into its context window:
    </p>

    <CodeBlock lang="text">{`src/api/user-profile.ts           52 lines    1,245 tokens
  └─ validators.ts                 89 lines    2,134 tokens
       └─ validation-rules.ts      156 lines   3,721 tokens
       └─ error-types.ts            41 lines     982 tokens
  └─ formatters.ts                 103 lines   2,456 tokens
       └─ format-utils.ts           78 lines    1,867 tokens
  └─ logger.ts                      67 lines    1,603 tokens
       └─ log-transport.ts          124 lines   2,967 tokens
       └─ log-formatter.ts          91 lines    2,178 tokens

Total: 801 lines, 19,153 tokens`}</CodeBlock>

    <p>
      Your 52-line file just became a <strong>19,153-token context load</strong>. That&apos;s 366x more expensive than it appears. And your AI assistant has to load all of this to understand your simple function.
    </p>

    <p>
      This is especially painful for vibe coders - you&apos;re burning tokens twice: once when AI generates the code, and again every time future AI needs to understand what it created.
    </p>

    <p>
      This is the <strong>hidden cost of import chains</strong>—and it&apos;s one of the biggest reasons AI struggles with your codebase.
    </p>

    <h2>The Context Window Crisis</h2>

    <p>
      Every import creates a <strong>cascading context cost</strong>:
    </p>

    <ol>
      <li><strong>Direct dependencies</strong>: Files you import</li>
      <li><strong>Transitive dependencies</strong>: Files your imports import</li>
      <li><strong>Type dependencies</strong>: Interfaces and types needed for understanding</li>
      <li><strong>Implementation depth</strong>: How deep the chain goes</li>
    </ol>

    <p>
      Modern AI models have context windows of 32K-128K tokens. Sounds like a lot, right? But in a real codebase:
    </p>

    <ul>
      <li><strong>Average file</strong>: 200-300 lines = 4,800-7,200 tokens</li>
      <li><strong>With direct imports</strong>: 800-1,200 lines = 19,200-28,800 tokens</li>
      <li><strong>With deep chains</strong>: 2,000+ lines = 48,000+ tokens</li>
      <li><strong>Multiple related files</strong>: Context exhaustion</li>
    </ul>

    <p>
      Suddenly that 128K context window doesn&apos;t feel so spacious. Add a few related files to analyze a feature, and your AI is already hitting limits—or worse, truncating critical context.
    </p>

    <p>
      For vibe coders, this is especially sneaky - you ask AI &apos;add user authentication&apos; and it writes 8 files with deep import chains. You&apos;re not just paying for the generation - you&apos;re paying every time future AI needs to understand that code.
    </p>

    <h2>Real-World Impact: The receiptclaimer Analysis</h2>

    <p>
      When I ran <code>@aiready/context-analyzer</code> on <a href="https://receiptclaimer.com">receiptclaimer</a>&apos;s codebase, I discovered patterns that shocked me:
    </p>

    <h3>Before Refactoring:</h3>

    <CodeBlock lang="text">{`Average context budget per file: 12,450 tokens
Maximum depth: 7 levels
Fragmented domains: 4 (User, Receipt, Auth, Payment)
Low cohesion files: 23 (43% of analyzed files)

Top offenders:
- src/api/receipt-processor.ts: 47,821 tokens (cascade depth: 7)
- src/services/user-service.ts: 38,945 tokens (cascade depth: 6)
- src/api/payment-handler.ts: 35,102 tokens (cascade depth: 6)`}</CodeBlock>

    <h3>After Refactoring:</h3>

    <CodeBlock lang="text">{`Average context budget per file: 4,780 tokens (-62%)
Maximum depth: 4 levels
Fragmented domains: 2 (consolidated User+Auth, Receipt+Payment)
Low cohesion files: 5 (9% of analyzed files)

Top files (now optimized):
- src/api/receipt-processor.ts: 8,234 tokens (depth: 3)
- src/services/user-service.ts: 6,891 tokens (depth: 3)
- src/api/payment-handler.ts: 7,445 tokens (depth: 4)`}</CodeBlock>

    <h3>Impact on AI Performance:</h3>

    <ul>
      <li>Response time: Avg 8.2s → 3.1s (62% faster)</li>
      <li>Context truncation errors: 34 → 2 (94% reduction)</li>
      <li>Suggestions quality: Subjectively much better, AI now references correct patterns</li>
      <li>Developer satisfaction: &quot;AI finally gets what I&apos;m trying to do&quot;</li>
    </ul>

    <h2>The Four Dimensions of Context Cost</h2>

    <p>
      <code>@aiready/context-analyzer</code> measures four key metrics:
    </p>

    <h3>1. Import Depth (Cascade Levels)</h3>

    <p>
      How many layers deep your dependencies go:
    </p>

    <CodeBlock lang="typescript">{`// Depth 0: No imports
export function add(a: number, b: number) {
  return a + b;
}

// Depth 1: Direct imports only
import { add } from './math';
export function calculate(x: number) {
  return add(x, 10);
}

// Depth 3+: Deep chain (EXPENSIVE)
import { processUser } from './user-processor';  // imports 5 files
  // └─ which imports './validators'             // imports 3 files
  //     └─ which imports './validation-rules'   // imports 2 files`}</CodeBlock>

    <p>
      <strong>Rule of thumb:</strong>
    </p>

    <ul>
      <li>Depth 0-2: ✅ Excellent (&lt; 5,000 tokens)</li>
      <li>Depth 3-4: ⚠️ Acceptable (5,000-15,000 tokens)</li>
      <li>Depth 5+: ❌ Expensive (15,000+ tokens)</li>
    </ul>

    <h3>2. Context Budget (Total Tokens)</h3>

    <p>
      The total number of tokens AI needs to understand your file:
    </p>

    <CodeBlock lang="typescript">{`// Small budget (< 3,000 tokens)
// File: 120 lines, 1 import, shallow dependency
import { API_URL } from './config';
export function fetchUser(id: string) {
  return fetch(\`\${API_URL}/users/\${id}\`);
}

// Large budget (> 20,000 tokens) 
// File: 200 lines, 8 imports, deep dependencies
import { validateInput } from './validators';     // +4,500 tokens
import { transformData } from './transformers';   // +6,200 tokens
import { enrichUser } from './enrichment';        // +8,100 tokens
import { formatResponse } from './formatters';    // +3,800 tokens
// ... more imports ...`}</CodeBlock>

    <p>
      <strong>Target zones:</strong>
    </p>

    <ul>
      <li>&lt; 5,000 tokens: ✅ AI-friendly</li>
      <li>5,000-15,000 tokens: ⚠️ Monitor</li>
      <li>15,000+ tokens: ❌ Refactor needed</li>
    </ul>

    <h3>3. Domain Fragmentation</h3>

    <p>
      How scattered your related logic is across files:
    </p>

    <CodeBlock lang="text">{`// FRAGMENTED (user logic in 8 files)
src/api/user-login.ts           // Authentication
src/api/user-profile.ts         // Profile management
src/services/user-validator.ts  // Validation
src/utils/user-formatter.ts     // Formatting
src/models/user-types.ts        // Types
src/db/user-repository.ts       // Data access
src/middleware/user-auth.ts     // Auth middleware
src/helpers/user-utils.ts       // Utilities

// CONSOLIDATED (user logic in 3 files)
src/domain/user/
  ├─ user.service.ts            // Core business logic
  ├─ user.repository.ts         // Data access
  └─ user.types.ts              // Types and interfaces`}</CodeBlock>

    <p>
      <strong>Why fragmentation matters:</strong>
    </p>

    <p>
      When AI tries to understand user-related features, it must:
    </p>

    <ul>
      <li>Load 8 separate files (fragmented) vs 3 files (consolidated)</li>
      <li>Parse 3,200+ lines vs 800 lines</li>
      <li>Navigate 24+ imports vs 6 imports</li>
      <li>Build mental model across scattered context vs cohesive modules</li>
    </ul>

    <h3>4. Cohesion Score</h3>

    <p>
      How well a file focuses on one responsibility:
    </p>

    <CodeBlock lang="typescript">{`// LOW COHESION (mixed concerns)
// user-service.ts
export class UserService {
  validateEmail() { /* validation logic */ }
  sendEmail() { /* email sending logic */ }
  formatUserName() { /* formatting logic */ }
  logUserAction() { /* logging logic */ }
  encryptPassword() { /* crypto logic */ }
  renderUserProfile() { /* rendering logic */ }
}

// HIGH COHESION (single responsibility)
// user-service.ts
export class UserService {
  createUser() { /* user creation */ }
  updateUser() { /* user updates */ }
  deleteUser() { /* user deletion */ }
  getUserById() { /* user retrieval */ }
}`}</CodeBlock>

    <p>
      <strong>Cohesion calculation:</strong>
    </p>

    <p>
      The tool analyzes:
    </p>

    <ul>
      <li>Method names and their similarity</li>
      <li>Import types (business logic vs utilities vs external)</li>
      <li>File path and naming conventions</li>
      <li>Return types and parameter types</li>
    </ul>

    <p>
      Scores:
    </p>

    <ul>
      <li>80-100%: ✅ Highly cohesive (focused responsibility)</li>
      <li>60-79%: ⚠️ Moderate cohesion (some mixing)</li>
      <li>&lt; 60%: ❌ Low cohesion (refactor into separate modules)</li>
    </ul>

    <h2>Migration Strategy: How to Refactor Without Breaking Everything</h2>

    <p>
      Refactoring deep import chains is scary. Here&apos;s how to do it safely:
    </p>

    <h3>Step 1: Measure Current State</h3>

    <CodeBlock lang="bash">{`# Generate baseline report
npx @aiready/context-analyzer ./src --output baseline.json

# Identify top offenders
npx @aiready/context-analyzer ./src --sort-by budget --limit 10`}</CodeBlock>

    <h3>Step 2: Prioritize Refactoring</h3>

    <p>
      Focus on:
    </p>

    <ul>
      <li><strong>High-traffic files</strong>: API handlers, services, core business logic</li>
      <li><strong>High-budget files</strong>: &gt; 15,000 tokens</li>
      <li><strong>Deep chains</strong>: Depth &gt; 5</li>
      <li><strong>Low cohesion</strong>: Score &lt; 60%</li>
    </ul>

    <h3>Step 3: Create Domain Boundaries</h3>

    <CodeBlock lang="text">{`Before (scattered):
src/
  ├─ api/
  ├─ services/
  ├─ utils/
  ├─ formatters/
  ├─ validators/
  └─ helpers/

After (domain-driven):
src/
  ├─ domain/
  │   ├─ user/
  │   │   ├─ user.service.ts
  │   │   ├─ user.repository.ts
  │   │   └─ user.types.ts
  │   ├─ receipt/
  │   └─ payment/
  └─ infrastructure/
      ├─ api/
      └─ database/`}</CodeBlock>

    <h3>Step 4: Refactor Incrementally</h3>

    <p>
      <strong>Week 1:</strong> Consolidate one domain (e.g., User)<br/>
      <strong>Week 2:</strong> Consolidate another domain (e.g., Receipt)<br/>
      <strong>Week 3:</strong> Update imports across codebase<br/>
      <strong>Week 4:</strong> Remove old files, update tests
    </p>

    <h3>Step 5: Verify Improvements</h3>

    <CodeBlock lang="bash">{`# Generate new report
npx @aiready/context-analyzer ./src --output after.json

# Compare
npx @aiready/cli compare baseline.json after.json`}</CodeBlock>

    <h2>Best Practices</h2>

    <h3>✅ Do:</h3>

    <ol>
      <li><strong>Co-locate related logic</strong>: Keep domain logic together</li>
      <li><strong>Inline simple utilities</strong>: &lt; 20 lines, used in one place</li>
      <li><strong>Use dependency injection</strong>: Makes testing easier, reduces coupling</li>
      <li><strong>Create thin adapters</strong>: For external services, databases</li>
      <li><strong>Measure regularly</strong>: Track context budget over time</li>
    </ol>

    <h3>❌ Don&apos;t:</h3>

    <ol>
      <li><strong>Over-abstract</strong>: Not everything needs a separate file</li>
      <li><strong>Create deep hierarchies</strong>: Flat is better than nested</li>
      <li><strong>Split prematurely</strong>: Extract only when reused 3+ times</li>
      <li><strong>Ignore cohesion</strong>: Low cohesion = mixed concerns = high context cost</li>
      <li><strong>Refactor blindly</strong>: Understand dependencies before moving code</li>
    </ol>

    <h2>The Bottom Line</h2>

    <p>
      Import chains are <strong>invisible expensive</strong>. Every import adds context cost that:
    </p>

    <ul>
      <li>Slows down AI responses</li>
      <li>Increases token usage (costs money on paid APIs)</li>
      <li>Causes context truncation errors</li>
      <li>Makes AI suggestions less accurate</li>
    </ul>

    <p>
      But unlike many optimization problems, this one has clear metrics and actionable fixes:
    </p>

    <ol>
      <li><strong>Measure</strong>: Run context-analyzer to see your current state</li>
      <li><strong>Prioritize</strong>: Focus on high-budget, deep-chain, low-cohesion files</li>
      <li><strong>Refactor</strong>: Consolidate domains, inline utilities, remove unnecessary abstractions</li>
      <li><strong>Verify</strong>: Measure again, track improvements over time</li>
    </ol>

    <h2>Try It Yourself</h2>

    <CodeBlock lang="bash">{`# Analyze your codebase
npx @aiready/context-analyzer ./src

# Check specific file
npx @aiready/context-analyzer ./src/api/handler.ts --detailed

# Find files over budget
npx @aiready/context-analyzer ./src --threshold 15000

# Export report
npx @aiready/context-analyzer ./src --output report.json

# Unified CLI with all metrics
npx @aiready/cli scan --score`}</CodeBlock>

    <p>
      <strong>Before you refactor:</strong>
    </p>

    <ul>
      <li>Measure your current context budget</li>
      <li>Identify top offenders (top 10 files by token cost)</li>
      <li>Pick one domain to consolidate</li>
    </ul>

    <p>
      <strong>After you refactor:</strong>
    </p>

    <ul>
      <li>Measure again</li>
      <li>Calculate percentage improvement</li>
      <li>Share your results!</li>
    </ul>

    <p>
      <strong>Resources:</strong>
    </p>

    <ul>
      <li>GitHub: <a href="https://github.com/caopengau/aiready">github.com/caopengau/aiready</a></li>
      <li>Docs: <a href="https://aiready.dev">aiready.dev</a></li>
      <li>Report issues: <a href="https://github.com/caopengau/aiready/issues">github.com/caopengau/aiready/issues</a></li>
    </ul>

    <hr/>

    <p>
      <strong>What&apos;s your biggest context budget file?</strong> Run the analyzer and share your findings—I&apos;d love to see what you discover.
    </p>

    <hr/>

    <p>
      If you&apos;re vibe coding and noticing your AI responses getting slower or more confused, your import chains might be the culprit. We can help diagnose and fix it.
    </p>

  </>
);

export default Post;

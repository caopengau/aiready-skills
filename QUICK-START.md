# Quick Start: First 5 Minutes with AIReady

**Goal:** See why AI tools struggle with your codebase in under 5 minutes.

---

## The 60-Second Version

```bash
# No installation required
npx @aiready/cli scan ./src

# That's it! 🎉
```

**What happens:**
1. ✅ Analyzes your source code locally
2. ✅ Finds duplicate patterns that confuse AI
3. ✅ Shows context window costs
4. ✅ Checks naming consistency
5. ✅ Displays results in your terminal

**No files created, no changes made, completely safe.**

---

## The 5-Minute Deep Dive

### Step 1: Run Your First Scan (1 minute)

```bash
cd /path/to/your/project
npx @aiready/cli scan ./src
```

### Step 2: Read the Output (2 minutes)

Look for these key sections:

```
📊 AIReady Scan Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Pattern Analysis
   📁 Files analyzed: 47
   ⚠️  Duplicate patterns: 12 patterns across 23 files
   💰 Wasted tokens: 8,450 per AI query

📦 Context Analysis  
   📁 Files analyzed: 47
   ⚠️  High context cost: 8 files exceed optimal size
   🔗 Deep import chains: 5 files with 7+ levels

🎯 Consistency Check
   📁 Files analyzed: 47
   ⚠️  Naming inconsistencies: 15 issues
   ⚡ Pattern variations: 8 similar functions with different styles
```

**What this means:**
- **Duplicate patterns** → AI suggests code that already exists elsewhere
- **High context cost** → AI hits token limits faster
- **Naming inconsistencies** → AI gets confused about your conventions

### Step 3: Save the Report (Optional, 1 minute)

Want to save results or share with your team?

```bash
npx @aiready/cli scan ./src --output json
```

Output saved to `.aiready/aiready-scan-YYYY-MM-DD.json`

### Step 4: Drill Down (1 minute)

Run individual tools for detailed analysis:

```bash
# Just duplicate patterns
npx @aiready/pattern-detect ./src

# Just context analysis
npx @aiready/context-analyzer ./src

# Just consistency check
npx @aiready/consistency ./src
```

---

## What You Just Learned

✅ **Your AI baseline** - How well AI can understand your codebase right now  
✅ **Top confusion points** - What's making Copilot struggle  
✅ **Quick wins** - Which files to fix first for maximum impact  

---

## Next Steps

### For Individual Developers

Want to fix specific issues?

1. Look at the top 3-5 duplicate patterns
2. Refactor the most duplicated code into shared utilities
3. Run the scan again to see improvement

```bash
# Before refactoring
npx @aiready/cli scan ./src --output json --output-file before.json

# [Do your refactoring]

# After refactoring  
npx @aiready/cli scan ./src --output json --output-file after.json

# Compare improvement! 🎉
```

### For Teams

Want to track this over time?

1. Run scan on your main branch
2. Save the JSON report
3. Run weekly/monthly to track trends
4. Share insights at retros

```bash
# Add to your project
npm install -g @aiready/cli

# Run regularly
aiready scan ./src --output json

# Commit reports (optional)
git add .aiready/
git commit -m "docs: add AIReady baseline report"
```

### For Engineering Leaders

Want to measure AI leverage across projects?

1. Run on multiple codebases
2. Compare scores
3. Identify projects that need attention
4. Track improvement after refactoring

See [Getting Executive Buy-In](./EXECUTIVE-BUY-IN.md) for ROI calculations.

---

## Common Questions

### "Is this another linter?"

**No.** Linters check code style and catch bugs. AIReady explains **why AI tools struggle** with your code.

**Example:**
- **ESLint says:** "Missing semicolon on line 42"
- **AIReady says:** "These 5 functions are semantically identical but written differently—AI can't tell they're the same, wasting 2,500 tokens per query"

### "Will this change my code?"

**No.** AIReady is **read-only by default**. It only analyzes and reports. No files are modified.

### "Where does my code go?"

**Nowhere.** Everything runs locally on your machine. Zero network calls. See [SECURITY.md](./SECURITY.md) for details.

### "How long does it take?"

- Small projects (< 50 files): 5-10 seconds
- Medium projects (50-500 files): 20-60 seconds  
- Large projects (500+ files): 1-3 minutes

### "What if I get too many results?"

Use filters:

```bash
# Only show critical issues
aiready scan ./src --min-severity critical

# Exclude certain directories
aiready scan ./src --exclude "src/legacy/**"

# Limit results
aiready scan ./src --max-results 5
```

### "Can I use this in CI?"

Yes! But we recommend **read-only mode** first:

```bash
# In your CI pipeline
npx @aiready/cli scan ./src --output json --output-file ci-report.json

# Optional: fail build if too many issues
# (Not recommended initially - use for awareness first)
```

See [CI/CD Integration Guide](./docs/ci-cd-integration.md) for best practices.

---

## Troubleshooting

### "No files were analyzed"

Check your directory path:

```bash
# Wrong
npx @aiready/cli scan .

# Right  
npx @aiready/cli scan ./src
```

### "Too many results"

Increase thresholds:

```bash
aiready scan ./src --similarity 0.6 --min-lines 8
```

### "Too few results"

Decrease thresholds:

```bash
aiready scan ./src --similarity 0.3 --min-lines 3
```

### "Analysis is slow"

Exclude unnecessary files:

```bash
aiready scan ./src --exclude "**/vendor/**,**/generated/**"
```

---

## Get Help

- 📖 **Full Docs:** [getaiready.dev/docs](https://getaiready.dev/docs)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/caopengau/aiready/discussions)
- 🐛 **Issues:** [GitHub Issues](https://github.com/caopengau/aiready/issues)
- 📧 **Email:** hello@getaiready.dev

---

## What's Next?

- Read [ENTERPRISE-READINESS-PLAN.md](./ENTERPRISE-READINESS-PLAN.md) for adoption strategies
- Check [SECURITY.md](./SECURITY.md) for security details
- Explore [Advanced Usage](./docs/advanced-usage.md) for power features

**Remember:** You're not looking for "bad code." You're finding **AI leverage opportunities**.

Small changes → Outsized impact on AI effectiveness. 🚀

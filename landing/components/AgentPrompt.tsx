"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface AgentPromptProps {
  variant?: "basic" | "detailed" | "fix";
  className?: string;
}

const prompts = {
  basic: `Scan this codebase for AI readiness issues. Run:

npx @aiready/cli scan .

Then review the report and summarize:
1. Overall AI Readiness Score
2. Top 3 critical issues found
3. Quick wins we can fix immediately`,
  
  detailed: `Perform a comprehensive AI readiness analysis on this codebase:

Step 1: Run the analysis
npx @aiready/cli scan . --score

Step 2: Review the report and identify:
- Semantic duplicates (wasted AI context tokens)
- High context budget files (too many dependencies)
- Naming inconsistencies (confuse AI models)
- Deep import chains (exceed context windows)

Step 3: Prioritize fixes by impact:
- Which issues cause the most AI confusion?
- What quick wins exist (low effort, high impact)?
- What systemic patterns need addressing?

Step 4: Provide actionable recommendations with file references.`,

  fix: `Fix AI readiness issues in this codebase:

Step 1: Run analysis
npx @aiready/cli scan . --score

Step 2: Fix the top 3 critical issues:
- For semantic duplicates: Extract to shared utilities
- For high context files: Break into smaller modules
- For naming issues: Use clear, consistent names

Step 3: Re-run to verify improvements
npx @aiready/cli scan . --score

Step 4: Report before/after AI Readiness Score and changes made.`,
};

const promptTitles = {
  basic: "Basic Scan",
  detailed: "Detailed Analysis",
  fix: "Fix Issues",
};

export default function AgentPrompt({ variant = "basic", className = "" }: AgentPromptProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompts[variant]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span className="text-sm font-semibold text-slate-700">
            AI Agent Prompt - {promptTitles[variant]}
          </span>
        </div>
        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            copied
              ? "bg-green-500 text-white"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
        >
          {copied ? "✓ Copied!" : "Copy Prompt"}
        </motion.button>
      </div>

      {/* Prompt Content */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200 shadow-md">
        <pre className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">
          {prompts[variant]}
        </pre>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-slate-500 mt-2 italic">
        Copy this prompt and paste it into Cline, Cursor, Copilot Chat, ChatGPT, or any AI agent
      </p>
    </motion.div>
  );
}
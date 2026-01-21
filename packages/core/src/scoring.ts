/**
 * AI Readiness Scoring System
 * 
 * Provides dynamic, composable scoring across multiple analysis tools.
 * Each tool contributes a 0-100 score with configurable weights.
 */

export interface ToolScoringOutput {
  /** Unique tool identifier (e.g., "pattern-detect") */
  toolName: string;
  
  /** Normalized 0-100 score for this tool */
  score: number;
  
  /** Raw metrics used to calculate the score */
  rawMetrics: Record<string, any>;
  
  /** Factors that influenced the score */
  factors: Array<{
    name: string;
    impact: number;           // +/- points contribution
    description: string;
  }>;
  
  /** Actionable recommendations with estimated impact */
  recommendations: Array<{
    action: string;
    estimatedImpact: number;  // +points if fixed
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface ScoringResult {
  /** Overall AI Readiness Score (0-100) */
  overall: number;
  
  /** Rating category */
  rating: 'Excellent' | 'Good' | 'Fair' | 'Needs Work' | 'Critical';
  
  /** Timestamp of score calculation */
  timestamp: string;
  
  /** Tools that contributed to this score */
  toolsUsed: string[];
  
  /** Breakdown by tool */
  breakdown: Record<string, {
    score: number;
    weight: number;
    weightedScore: number;
    contribution: string;  // Percentage as string (e.g., "27%")
  }>;
  
  /** Calculation details */
  calculation: {
    formula: string;
    weightedSum: number;
    totalWeight: number;
    roundedScore: number;
  };
}

export interface ScoringConfig {
  /** Minimum passing score (exit code 1 if below) */
  threshold?: number;
  
  /** Show detailed breakdown in output */
  showBreakdown?: boolean;
  
  /** Path to baseline JSON for comparison */
  compareBaseline?: string;
  
  /** Auto-save score to this path */
  saveTo?: string;
}

/**
 * Default weights for known tools.
 * New tools get weight of 10 if not specified.
 */
export const DEFAULT_TOOL_WEIGHTS: Record<string, number> = {
  'pattern-detect': 40,
  'context-analyzer': 35,
  'consistency': 25,
  'doc-drift': 20,
  'deps': 15,
};

/**
 * Tool name normalization map (shorthand -> full name)
 */
export const TOOL_NAME_MAP: Record<string, string> = {
  'patterns': 'pattern-detect',
  'context': 'context-analyzer',
  'consistency': 'consistency',
  'doc-drift': 'doc-drift',
  'deps': 'deps',
};

/**
 * Normalize tool name from shorthand to full name
 */
export function normalizeToolName(shortName: string): string {
  return TOOL_NAME_MAP[shortName] || shortName;
}

/**
 * Get tool weight with fallback priority:
 * 1. CLI override
 * 2. Tool config scoreWeight
 * 3. Default weight
 * 4. 10 (for unknown tools)
 */
export function getToolWeight(
  toolName: string,
  toolConfig?: { scoreWeight?: number },
  cliOverride?: number
): number {
  // CLI override has highest priority
  if (cliOverride !== undefined) {
    return cliOverride;
  }
  
  // Check tool's own config
  if (toolConfig?.scoreWeight !== undefined) {
    return toolConfig.scoreWeight;
  }
  
  // Fall back to defaults
  return DEFAULT_TOOL_WEIGHTS[toolName] || 10;
}

/**
 * Parse weight string from CLI (e.g., "patterns:50,context:30")
 */
export function parseWeightString(weightStr?: string): Map<string, number> {
  const weights = new Map<string, number>();
  
  if (!weightStr) {
    return weights;
  }
  
  const pairs = weightStr.split(',');
  for (const pair of pairs) {
    const [toolShortName, weightStr] = pair.split(':');
    if (toolShortName && weightStr) {
      const toolName = normalizeToolName(toolShortName.trim());
      const weight = parseInt(weightStr.trim(), 10);
      if (!isNaN(weight) && weight > 0) {
        weights.set(toolName, weight);
      }
    }
  }
  
  return weights;
}

/**
 * Calculate overall AI Readiness Score from multiple tool scores.
 * 
 * Formula: Σ(tool_score × tool_weight) / Σ(active_tool_weights)
 * 
 * This allows dynamic composition - score adjusts automatically
 * based on which tools actually ran.
 */
export function calculateOverallScore(
  toolOutputs: Map<string, ToolScoringOutput>,
  weights: Map<string, number>
): ScoringResult {
  if (toolOutputs.size === 0) {
    throw new Error('No tool outputs provided for scoring');
  }
  
  // Calculate weighted sum and total weight
  let weightedSum = 0;
  let totalWeight = 0;
  
  const breakdown: Record<string, any> = {};
  const toolsUsed: string[] = [];
  
  for (const [toolName, output] of toolOutputs.entries()) {
    const weight = weights.get(toolName) || 10;
    const weightedScore = output.score * weight;
    
    weightedSum += weightedScore;
    totalWeight += weight;
    toolsUsed.push(toolName);
    
    breakdown[toolName] = {
      score: output.score,
      weight,
      weightedScore,
      contribution: '', // Will calculate after we have total
    };
  }
  
  // Calculate final score
  const overall = Math.round(weightedSum / totalWeight);
  
  // Calculate contribution percentages
  for (const toolName of Object.keys(breakdown)) {
    const contribution = (breakdown[toolName].weightedScore / weightedSum) * 100;
    breakdown[toolName].contribution = `${Math.round(contribution)}%`;
  }
  
  // Determine rating
  const rating = getRating(overall);
  
  return {
    overall,
    rating,
    timestamp: new Date().toISOString(),
    toolsUsed,
    breakdown,
    calculation: {
      formula: 'Σ(tool_score × weight) / Σ(weights)',
      weightedSum: Math.round(weightedSum * 10) / 10,
      totalWeight,
      roundedScore: overall,
    },
  };
}

/**
 * Convert numeric score to rating category
 */
export function getRating(score: number): ScoringResult['rating'] {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Needs Work';
  return 'Critical';
}

/**
 * Get rating emoji and color for display
 */
export function getRatingDisplay(rating: ScoringResult['rating']): { emoji: string; color: string } {
  switch (rating) {
    case 'Excellent':
      return { emoji: '✅', color: 'green' };
    case 'Good':
      return { emoji: '👍', color: 'blue' };
    case 'Fair':
      return { emoji: '⚠️', color: 'yellow' };
    case 'Needs Work':
      return { emoji: '🔨', color: 'orange' };
    case 'Critical':
      return { emoji: '❌', color: 'red' };
  }
}

/**
 * Format score for display with rating
 */
export function formatScore(result: ScoringResult): string {
  const { emoji, color } = getRatingDisplay(result.rating);
  return `${result.overall}/100 (${result.rating}) ${emoji}`;
}

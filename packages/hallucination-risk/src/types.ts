import type { ScanOptions, Issue } from '@aiready/core';

export interface HallucinationRiskOptions extends ScanOptions {
  /** Minimum severity to report */
  minSeverity?: 'info' | 'minor' | 'major' | 'critical';
  /** Check for magic literal numbers and strings */
  checkMagicLiterals?: boolean;
  /** Check for boolean trap parameters */
  checkBooleanTraps?: boolean;
  /** Check for overloaded / ambiguous symbol names */
  checkAmbiguousNames?: boolean;
  /** Check for undocumented public exports */
  checkUndocumentedExports?: boolean;
  /** Check for implicit side effects in void functions */
  checkImplicitSideEffects?: boolean;
  /** Check for deep callback nesting */
  checkDeepCallbacks?: boolean;
}

export interface HallucinationRiskIssue extends Issue {
  type:
  | 'magic-literal'
  | 'boolean-trap'
  | 'ambiguous-api'
  | 'hallucination-risk'
  | 'dead-code';
  /** Category of risk signal */
  category: 'magic-literal' | 'boolean-trap' | 'ambiguous-name' | 'undocumented-export' | 'implicit-side-effect' | 'deep-callback' | 'overloaded-symbol';
  /** Code snippet where the issue was found */
  snippet?: string;
}

export interface FileHallucinationResult {
  filePath: string;
  issues: HallucinationRiskIssue[];
  signals: {
    magicLiterals: number;
    booleanTraps: number;
    ambiguousNames: number;
    undocumentedExports: number;
    implicitSideEffects: number;
    deepCallbacks: number;
    overloadedSymbols: number;
    totalSymbols: number;
    totalExports: number;
  };
}

export interface HallucinationRiskReport {
  summary: {
    filesAnalyzed: number;
    totalSignals: number;
    criticalSignals: number;
    majorSignals: number;
    minorSignals: number;
    /** Top risk across the entire codebase */
    topRisk: string;
    /** Overall rating */
    rating: 'minimal' | 'low' | 'moderate' | 'high' | 'severe';
  };
  results: FileHallucinationResult[];
  aggregateSignals: {
    magicLiterals: number;
    booleanTraps: number;
    ambiguousNames: number;
    undocumentedExports: number;
    implicitSideEffects: number;
    deepCallbacks: number;
    overloadedSymbols: number;
    totalSymbols: number;
    totalExports: number;
  };
  recommendations: string[];
}

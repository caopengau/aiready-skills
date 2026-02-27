/**
 * Main analyzer for AI signal clarity.
 * Scans all TS/JS files in a directory and aggregates signals.
 */

import { scanFiles, calculateAiSignalClarity } from '@aiready/core';
import { scanFile } from './scanner';
import type {
  AiSignalClarityOptions,
  AiSignalClarityReport,
  FileAiSignalClarityResult,
} from './types';

export async function analyzeAiSignalClarity(
  options: AiSignalClarityOptions
): Promise<AiSignalClarityReport> {
  // Use core scanFiles which respects .gitignore recursively
  const files = await scanFiles(options);
  const results: FileAiSignalClarityResult[] = [];

  // Aggregate signals
  const aggregate = {
    magicLiterals: 0,
    booleanTraps: 0,
    ambiguousNames: 0,
    undocumentedExports: 0,
    implicitSideEffects: 0,
    deepCallbacks: 0,
    overloadedSymbols: 0,
    totalSymbols: 0,
    totalExports: 0,
  };

  let processed = 0;
  for (const filePath of files) {
    processed++;
    options.onProgress?.(
      processed,
      files.length,
      `ai-signal-clarity: analyzing files`
    );

    const result = scanFile(filePath, options);
    results.push(result);
    for (const key of Object.keys(aggregate) as Array<keyof typeof aggregate>) {
      aggregate[key] += result.signals[key] ?? 0;
    }
  }

  // Calculate grounding score using core math (statically imported)
  const riskResult = calculateAiSignalClarity({
    overloadedSymbols: aggregate.overloadedSymbols,
    magicLiterals: aggregate.magicLiterals,
    booleanTraps: aggregate.booleanTraps,
    implicitSideEffects: aggregate.implicitSideEffects,
    deepCallbacks: aggregate.deepCallbacks,
    ambiguousNames: aggregate.ambiguousNames,
    undocumentedExports: aggregate.undocumentedExports,
    totalSymbols: Math.max(1, aggregate.totalSymbols),
    totalExports: Math.max(1, aggregate.totalExports),
  });

  // Count severities
  const allIssues = results.flatMap((r) => r.issues);
  const criticalSignals = allIssues.filter(
    (i) => i.severity === 'critical'
  ).length;
  const majorSignals = allIssues.filter((i) => i.severity === 'major').length;
  const minorSignals = allIssues.filter((i) => i.severity === 'minor').length;

  // Filter by minSeverity
  const severityOrder = { info: 0, minor: 1, major: 2, critical: 3 };
  const minSev = options.minSeverity ?? 'info';
  const filteredResults = results.map((r) => ({
    ...r,
    issues: r.issues.filter(
      (i) => severityOrder[i.severity] >= severityOrder[minSev]
    ),
  }));

  return {
    summary: {
      filesAnalyzed: files.length,
      totalSignals: allIssues.length,
      criticalSignals,
      majorSignals,
      minorSignals,
      topRisk: riskResult.topRisk,
      rating: riskResult.rating,
    },
    results: filteredResults,
    aggregateSignals: aggregate,
    recommendations: riskResult.recommendations,
  };
}

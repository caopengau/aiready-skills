#!/usr/bin/env node

import { Command } from 'commander';
import { analyzeTestability } from './analyzer';
import { calculateTestabilityScore } from './scoring';
import type { TestabilityOptions } from './types';
import chalk from 'chalk';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import {
  loadConfig,
  mergeConfigWithDefaults,
  resolveOutputPath,
} from '@aiready/core';

const program = new Command();

program
  .name('aiready-testability')
  .description(
    'Measure how safely AI-generated changes can be verified in your codebase'
  )
  .version('0.1.0')
  .addHelpText(
    'after',
    `
DIMENSIONS MEASURED:
  Test Coverage       Ratio of test files to source files
  Function Purity     Pure functions are trivially AI-testable
  Dependency Inject.  DI makes classes mockable and verifiable
  Interface Focus     Small interfaces are easier to mock
  Observability       Functions returning values > mutating state

AI CHANGE SAFETY RATINGS:
  safe           ✅ AI changes can be safely verified (≥50% coverage + score ≥70)
  moderate-risk  ⚠️  Some risk — partial test coverage
  high-risk      🔴 Tests exist but insufficient — AI changes may slip through
  blind-risk     💀 NO TESTS — AI changes cannot be verified at all

EXAMPLES:
  aiready-testability .                        # Full analysis
  aiready-testability src/ --output json       # JSON report
  aiready-testability . --min-coverage 0.5     # Stricter 50% threshold
`
  )
  .argument('<directory>', 'Directory to analyze')
  .option(
    '--min-coverage <ratio>',
    'Minimum acceptable test/source ratio (default: 0.3)',
    '0.3'
  )
  .option(
    '--test-patterns <patterns>',
    'Additional test file patterns (comma-separated)'
  )
  .option('--include <patterns>', 'File patterns to include (comma-separated)')
  .option('--exclude <patterns>', 'File patterns to exclude (comma-separated)')
  .option('-o, --output <format>', 'Output format: console|json', 'console')
  .option('--output-file <path>', 'Output file path (for json)')
  .action(async (directory, options) => {
    console.log(chalk.blue('🧪 Analyzing testability...\n'));
    const startTime = Date.now();

    const config = await loadConfig(directory);
    const mergedConfig = mergeConfigWithDefaults(config, {
      minCoverageRatio: 0.3,
    });

    const finalOptions: TestabilityOptions = {
      rootDir: directory,
      minCoverageRatio:
        parseFloat(options.minCoverage ?? '0.3') ||
        mergedConfig.minCoverageRatio,
      testPatterns: options.testPatterns?.split(','),
      include: options.include?.split(','),
      exclude: options.exclude?.split(','),
    };

    const report = await analyzeTestability(finalOptions);
    const scoring = calculateTestabilityScore(report);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    if (options.output === 'json') {
      const payload = { report, score: scoring };
      const outputPath = resolveOutputPath(
        options.outputFile,
        `testability-report-${new Date().toISOString().split('T')[0]}.json`,
        directory
      );
      const dir = dirname(outputPath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      writeFileSync(outputPath, JSON.stringify(payload, null, 2));
      console.log(chalk.green(`✓ Report saved to ${outputPath}`));
    } else {
      displayConsoleReport(report, scoring, elapsed);
    }
  });

program.parse();

function safetyColor(rating: string) {
  switch (rating) {
    case 'safe':
      return chalk.green;
    case 'moderate-risk':
      return chalk.yellow;
    case 'high-risk':
      return chalk.red;
    case 'blind-risk':
      return chalk.bgRed.white;
    default:
      return chalk.white;
  }
}

function safetyIcon(rating: string) {
  switch (rating) {
    case 'safe':
      return '✅';
    case 'moderate-risk':
      return '⚠️ ';
    case 'high-risk':
      return '🔴';
    case 'blind-risk':
      return '💀';
    default:
      return '❓';
  }
}

function scoreBar(val: number): string {
  return '█'.repeat(Math.round(val / 10)).padEnd(10, '░');
}

function displayConsoleReport(report: any, scoring: any, elapsed: string) {
  const { summary, rawData, issues, recommendations } = report;

  // The most important banner
  const safetyRating = summary.aiChangeSafetyRating;
  console.log(chalk.bold('\n🧪 Testability Analysis\n'));

  if (safetyRating === 'blind-risk') {
    console.log(
      chalk.bgRed.white.bold(
        '  💀 BLIND RISK — NO TESTS DETECTED. AI-GENERATED CHANGES CANNOT BE VERIFIED.  '
      )
    );
    console.log();
  } else if (safetyRating === 'high-risk') {
    console.log(
      chalk.red.bold(
        `  🔴 HIGH RISK — Insufficient test coverage. AI changes may introduce silent bugs.`
      )
    );
    console.log();
  }

  console.log(
    `AI Change Safety: ${safetyColor(safetyRating)(`${safetyIcon(safetyRating)} ${safetyRating.toUpperCase()}`)}`
  );
  console.log(
    `Score:            ${chalk.bold(summary.score + '/100')} (${summary.rating})`
  );
  console.log(
    `Source Files:     ${chalk.cyan(rawData.sourceFiles)}   Test Files: ${chalk.cyan(rawData.testFiles)}`
  );
  console.log(
    `Coverage Ratio:   ${chalk.bold(Math.round(summary.coverageRatio * 100) + '%')}`
  );
  console.log(`Analysis Time:    ${chalk.gray(elapsed + 's')}\n`);

  console.log(chalk.bold('📐 Dimension Scores\n'));
  const dims: [string, number][] = [
    ['Test Coverage', summary.dimensions.testCoverageRatio],
    ['Function Purity', summary.dimensions.purityScore],
    ['Dependency Injection', summary.dimensions.dependencyInjectionScore],
    ['Interface Focus', summary.dimensions.interfaceFocusScore],
    ['Observability', summary.dimensions.observabilityScore],
  ];
  for (const [name, val] of dims) {
    const color =
      val >= 70 ? chalk.green : val >= 50 ? chalk.yellow : chalk.red;
    console.log(`  ${name.padEnd(22)} ${color(scoreBar(val))} ${val}/100`);
  }

  if (issues.length > 0) {
    console.log(chalk.bold('\n⚠️  Issues\n'));
    for (const issue of issues) {
      const sev =
        issue.severity === 'critical'
          ? chalk.red
          : issue.severity === 'major'
            ? chalk.yellow
            : chalk.blue;
      console.log(`${sev(issue.severity.toUpperCase())}  ${issue.message}`);
      if (issue.suggestion)
        console.log(
          `       ${chalk.dim('→')} ${chalk.italic(issue.suggestion)}`
        );
      console.log();
    }
  }

  if (recommendations.length > 0) {
    console.log(chalk.bold('💡 Recommendations\n'));
    recommendations.forEach((rec: string, i: number) => {
      console.log(`${i + 1}. ${rec}`);
    });
  }
  console.log();
}

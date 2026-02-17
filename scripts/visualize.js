#!/usr/bin/env node
const { execSync } = require('child_process');
const { existsSync, readdirSync, statSync } = require('fs');
const { resolve } = require('path');

function usage() {
  console.log(`Usage: node scripts/visualize.js [directory] [--report <report.json>] [--output <out.html>] [--open]`);
  process.exit(1);
}

/**
 * Find the latest aiready report in the .aiready directory
 */
function findLatestReport(dir) {
  const aireadyDir = resolve(dir, '.aiready');
  if (!existsSync(aireadyDir)) return null;
  
  const files = readdirSync(aireadyDir)
    .filter(f => f.startsWith('aiready-report-') && f.endsWith('.json'));
  
  if (files.length === 0) return null;
  
  const sorted = files
    .map(f => ({
      path: resolve(aireadyDir, f),
      mtime: statSync(resolve(aireadyDir, f)).mtime
    }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  
  return sorted[0].path;
}

const args = process.argv.slice(2);
let dir = '.';
let report = null;
let out = 'packages/visualizer/visualization.html';
let openFlag = false;

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (!a) continue;
  if (!a.startsWith('--') && dir === '.') {
    dir = a;
    continue;
  }
  if (a === '--report' && args[i + 1]) { report = args[i + 1]; i++; continue; }
  if ((a === '--output' || a === '-o') && args[i + 1]) { out = args[i + 1]; i++; continue; }
  if (a === '--open') { openFlag = true; continue; }
  if (a === '--help' || a === '-h') usage();
}

// Auto-detect latest report if not provided
let reportPath = report ? resolve(dir, report) : findLatestReport(dir);
const outPath = resolve(process.cwd(), out);

try {
  if (!reportPath || !existsSync(reportPath)) {
    console.log(`Report not found. Running scan to produce report...`);
    // Run aiready scan to produce JSON report. Prefer local CLI if available via npx
    let cliCmd = 'npx @aiready/cli';
    try {
      execSync(process.platform === 'win32' ? 'where aiready' : 'command -v aiready', { stdio: 'ignore' });
      cliCmd = 'aiready';
      console.log('Using global `aiready` CLI for scan.');
    } catch (e) {
      console.log('Global `aiready` CLI not found; using `npx @aiready/cli`.');
    }
    const autoReportPath = resolve(dir, '.aiready/aiready-report-' + new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3) + '.json');
    const cmd = `${cliCmd} scan "${dir}" --output json --output-file "${autoReportPath}"`;
    console.log(`> ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
    reportPath = autoReportPath;
  } else {
    console.log(`Found existing report: ${reportPath}. Skipping scan.`);
  }

  // Generate visualization
  console.log(`Generating visualization to ${outPath}...`);
  const genCmd = `node packages/visualizer/tools/generate_from_report.cjs --report "${reportPath}" --output "${outPath}"`;
  console.log(`> ${genCmd}`);
  execSync(genCmd, { stdio: 'inherit' });

  if (openFlag) {
    console.log('Opening visualization in default browser...');
    const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    execSync(`${opener} "${outPath}"`);
  } else {
    console.log(`Visualization written to: ${outPath}`);
  }
} catch (err) {
  console.error('Error during visualize:', err && err.message ? err.message : err);
  process.exit(1);
}

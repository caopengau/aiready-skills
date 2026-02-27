#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const aireadyDir = path.join(root, '.aiready');
const ignoreFile = path.join(root, '.aireadyignore');

function loadIgnorePatterns() {
  if (!fs.existsSync(ignoreFile)) return [];
  const txt = fs.readFileSync(ignoreFile, 'utf8');
  return txt
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith('#'));
}

function matchesIgnore(filePath, patterns) {
  if (!filePath) return false;
  const absolutePath = String(filePath).replace(/\\\\/g, '/');
  const relativePath = path.relative(root, absolutePath).replace(/\\\\/g, '/');

  let matched = false;
  for (const pattern of patterns) {
    const isNeg = pattern.startsWith('!');
    const patternRaw = isNeg ? pattern.slice(1) : pattern;
    const patternClean = patternRaw
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/^\/+/, '');
    if (patternClean === '') continue;
    if (
      absolutePath.includes(patternClean) ||
      relativePath.includes(patternClean)
    ) {
      if (isNeg) return false; // negation overrides
      matched = true; // mark as ignored, but later negations can un-ignore
    }
  }

  // heuristics for cdk outputs and asset files
  if (absolutePath.includes('/cdk.out/') || relativePath.includes('cdk.out/'))
    matched = true;
  if (
    absolutePath.match(/asset\.[a-f0-9]{8,}\./) ||
    relativePath.match(/asset\.[a-f0-9]{8,}\./)
  )
    matched = true;
  if (
    absolutePath.includes('/node_modules/') ||
    relativePath.includes('node_modules/')
  )
    matched = true;
  if (absolutePath.includes('/.next/') || relativePath.includes('.next/'))
    matched = true;
  if (absolutePath.includes('/dist/') || relativePath.includes('dist/'))
    matched = true;

  return !!matched;
}

function processReportFile(filePath, patterns) {
  const raw = fs.readFileSync(filePath, 'utf8');
  let json;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse', filePath, e.message);
    return null;
  }

  // Walk object and remove any findings with file paths that match ignore
  let removed = 0;
  let totalFindings = 0;

  function walk(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map(walk);
    }
    const copy = {};
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (
        k === 'file' ||
        k === 'fileName' ||
        k === 'path' ||
        k === 'location' ||
        k === 'file_path'
      ) {
        totalFindings++;
        if (typeof v === 'string' && matchesIgnore(v, patterns)) {
          removed++;
          continue; // skip this property (higher-level entry will be filtered by caller)
        }
      }
      copy[k] = walk(v);
    }
    return copy;
  }

  // Many report formats store findings in top-level arrays or fields. Attempt common patterns.
  if (Array.isArray(json)) {
    totalFindings = json.length;
    const filtered = json.filter((item) => {
      // try to find file path
      const fp =
        item.file ||
        item.fileName ||
        item.path ||
        item.location ||
        item.file_path ||
        (item.location && item.location.path);
      if (!fp) return true;
      if (matchesIgnore(fp, patterns)) {
        removed++;
        return false;
      }
      return true;
    });
    return { filtered, totalFindings, removed };
  }

  // If object has 'findings' or 'issues' arrays
  const candidateArrays = [
    'findings',
    'issues',
    'results',
    'duplicates',
    'entries',
    'matches',
  ];
  let changed = false;
  for (const arrName of candidateArrays) {
    if (Array.isArray(json[arrName])) {
      totalFindings += json[arrName].length;
      const before = json[arrName].length;
      json[arrName] = json[arrName].filter((item) => {
        const fp =
          item.file ||
          item.fileName ||
          item.path ||
          item.location ||
          item.file_path ||
          (item.location && item.location.path) ||
          item.source;
        if (!fp) return true;
        if (typeof fp === 'object' && fp.path) {
          return !matchesIgnore(fp.path, patterns);
        }
        if (typeof fp === 'string' && matchesIgnore(fp, patterns)) {
          removed++;
          return false;
        }
        return true;
      });
      if (json[arrName].length !== before) changed = true;
    }
  }

  // Also handle top-level arrays like 'patterns' which contain objects with fileName and issues
  for (const key of Object.keys(json)) {
    if (!Array.isArray(json[key]) || json[key].length === 0) continue;
    const first = json[key][0];
    if (typeof first !== 'object') continue;
    // Heuristic: elements with 'fileName' or 'location' or 'issues'
    if (first.fileName || first.location || first.issues) {
      // process each element
      const beforeAll = json[key].length;
      const newArr = [];
      for (const el of json[key]) {
        const fileName =
          el.fileName ||
          (el.location && el.location.file) ||
          el.file ||
          el.path;
        if (fileName && matchesIgnore(fileName, patterns)) {
          // skip entire element
          removed++;
          continue;
        }
        // if element has issues array, filter its issues by location
        if (Array.isArray(el.issues)) {
          const beforeIssues = el.issues.length;
          el.issues = el.issues.filter((issue) => {
            const loc =
              (issue.location &&
                (issue.location.file || issue.location.path)) ||
              issue.file ||
              issue.fileName;
            if (loc && matchesIgnore(loc, patterns)) {
              removed++;
              return false;
            }
            return true;
          });
          if (el.issues.length !== beforeIssues) changed = true;
        }
        newArr.push(el);
      }
      totalFindings += beforeAll;
      json[key] = newArr;
      if (json[key].length !== beforeAll) changed = true;
    }
  }

  // Fallback: search for nested objects containing file keys and prune them
  if (!changed) {
    const result = walk(json);
    // cannot easily detect removed entries count here
    return { filtered: result, totalFindings, removed };
  }

  return { filtered: json, totalFindings, removed };
}

function main() {
  if (!fs.existsSync(aireadyDir)) {
    console.error('.aiready directory not found');
    process.exit(1);
  }
  const patterns = loadIgnorePatterns();
  console.log('Loaded ignore patterns:', patterns);

  const files = fs.readdirSync(aireadyDir).filter((f) => f.endsWith('.json'));
  // avoid re-processing already-filtered outputs
  const filteredFiles = files.filter((f) => f.startsWith('filtered-'));
  const toProcess = files.filter((f) => !f.startsWith('filtered-'));
  if (toProcess.length === 0) {
    console.log('No new JSON reports to process in .aiready');
    return;
  }
  const summary = [];
  for (const f of toProcess) {
    const full = path.join(aireadyDir, f);
    const res = processReportFile(full, patterns);
    if (!res) continue;
    const outFile = path.join(aireadyDir, `filtered-${f}`);
    fs.writeFileSync(outFile, JSON.stringify(res.filtered, null, 2));
    summary.push({
      file: f,
      total: res.totalFindings || 0,
      removed: res.removed || 0,
      out: outFile,
    });
  }

  console.log('\nReport consumption summary:');
  let total = 0,
    removed = 0;
  for (const s of summary) {
    console.log(
      `- ${s.file}: total=${s.total}, removed=${s.removed}, written=${s.out}`
    );
    total += s.total;
    removed += s.removed;
  }
  console.log(
    `\nTotals: findings=${total}, removed=${removed}, remaining=${total - removed}`
  );
}

main();

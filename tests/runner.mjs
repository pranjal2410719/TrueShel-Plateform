#!/usr/bin/env node

import { run } from 'node:test';
import * as reporters from 'node:test/reporters';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Parse CLI arguments
const args = process.argv.slice(2);
const options = {
  tier: null,
  testFilter: null,
  reporter: 'spec',
  verbose: false,
  help: false
};

for (const arg of args) {
  if (arg === '--help' || arg === '-h') {
    options.help = true;
  } else if (arg.startsWith('--tier=')) {
    options.tier = arg.split('=')[1];
  } else if (arg.startsWith('--test=')) {
    options.testFilter = arg.split('=')[1];
  } else if (arg.startsWith('--reporter=')) {
    options.reporter = arg.split('=')[1];
  } else if (arg === '--verbose' || arg === '-v') {
    options.verbose = true;
  }
}

if (options.help) {
  console.log(`
TRUESHEL V2 — Automated E2E Test Runner CLI

Usage:
  node tests/runner.mjs [options]

Options:
  --tier=<1|2|3|4|5|all>    Run tests for a specific tier (default: all)
  --test=<keyword>          Filter test files matching keyword
  --reporter=<name>         Reporter: spec, tap, dot, junit, lcov (default: spec)
  --verbose, -v             Enable verbose output
  --help, -h                Show this help message

Examples:
  node tests/runner.mjs --tier=1
  node tests/runner.mjs --test=design-tokens
  node tests/runner.mjs --reporter=tap
`);
  process.exit(0);
}

// Discover test files
function findTestFiles(dir, tierFilter, testFilter) {
  const testFiles = [];
  if (!fs.existsSync(dir)) return testFiles;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (tierFilter && tierFilter !== 'all') {
        const tierMatch = entry.name.toLowerCase().includes(`tier${tierFilter}`);
        if (tierMatch || entry.name === 'e2e') {
          testFiles.push(...findTestFiles(fullPath, null, testFilter));
        }
      } else {
        testFiles.push(...findTestFiles(fullPath, null, testFilter));
      }
    } else if (entry.isFile() && (entry.name.endsWith('.test.mjs') || entry.name.endsWith('.test.js') || entry.name.endsWith('.test.ts'))) {
      if (!testFilter || entry.name.toLowerCase().includes(testFilter.toLowerCase())) {
        testFiles.push(fullPath);
      }
    }
  }
  return testFiles.sort();
}

const e2eDir = path.join(__dirname, 'e2e');
const filesToRun = findTestFiles(e2eDir, options.tier, options.testFilter);

if (filesToRun.length === 0) {
  console.error(`\x1b[33m[TRUESHEL V2 TEST RUNNER]\x1b[0m No test files found matching criteria:`);
  console.error(`  Tier Filter: ${options.tier || 'all'}`);
  console.error(`  Test Filter: ${options.testFilter || 'none'}`);
  process.exit(1);
}

console.log(`\x1b[35m=======================================================================\x1b[0m`);
console.log(`\x1b[1m\x1b[35mTRUESHEL V2 — E2E TEST RUNNER (Dual-Track Automated Verification)\x1b[0m`);
console.log(`\x1b[35m=======================================================================\x1b[0m`);
console.log(`Target Suite:   ${options.tier ? `Tier ${options.tier}` : 'All Suites'}`);
console.log(`Filter:         ${options.testFilter || 'None'}`);
console.log(`Reporter:       ${options.reporter}`);
console.log(`Files Queued (${filesToRun.length}):`);
filesToRun.forEach(f => console.log(`  - ${path.relative(projectRoot, f)}`));
console.log(`-----------------------------------------------------------------------\n`);

// Select reporter
const selectedReporter = reporters[options.reporter] || reporters.spec;
const testStream = run({
  files: filesToRun,
  concurrency: 1
});

let failedCount = 0;
let passedCount = 0;

testStream.on('test:fail', () => {
  failedCount++;
});

testStream.on('test:pass', () => {
  passedCount++;
});

testStream.compose(selectedReporter).pipe(process.stdout);

testStream.on('end', () => {
  console.log(`\n-----------------------------------------------------------------------`);
  if (failedCount > 0) {
    console.log(`\x1b[31m\x1b[1m✖ E2E SUITE FAILED: ${failedCount} failure(s) detected.\x1b[0m`);
    process.exit(1);
  } else {
    console.log(`\x1b[32m\x1b[1m✔ E2E SUITE PASSED: All ${passedCount} tests passed successfully.\x1b[0m`);
    process.exit(0);
  }
});

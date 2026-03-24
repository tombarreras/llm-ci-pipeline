const fs = require('fs');
const path = require('path');

function fail(message) {
  console.error(`\nERROR: ${message}`);
  process.exit(1);
}

const inputPath = process.argv[2];
if (!inputPath) {
  fail('Usage: node scripts/check-threshold.js <promptfoo-results.json>');
}

const resolved = path.resolve(inputPath);
if (!fs.existsSync(resolved)) {
  fail(`Results file not found: ${resolved}`);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(resolved, 'utf8'));
} catch (err) {
  fail(`Unable to parse JSON results: ${err.message}`);
}

// Promptfoo result formats can vary by version; this handles common shapes.
const rows = Array.isArray(data.results?.results)
  ? data.results.results
  : Array.isArray(data.results)
    ? data.results
    : Array.isArray(data.testResults)
      ? data.testResults
      : null;

if (!rows || rows.length === 0) {
  fail('No test results were found in the output.');
}

function rowPassed(row) {
  if (typeof row.success === 'boolean') return row.success;
  if (row.gradingResult && typeof row.gradingResult.pass === 'boolean') return row.gradingResult.pass;
  if (Array.isArray(row.assertions) && row.assertions.length > 0) {
    return row.assertions.every(a => a.pass === true || a.success === true);
  }
  return false;
}

// Group rows by test description (repeated runs share the same description).
const groups = new Map();
for (const row of rows) {
  const key = (row.vars && row.vars.description) || `test-${row.testIdx}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(row);
}

const persistent = [];
const flaky = [];
const passing = [];

for (const [desc, runs] of groups) {
  const passCount = runs.filter(r => rowPassed(r)).length;
  if (passCount === runs.length) {
    passing.push(desc);
  } else if (passCount === 0) {
    persistent.push(desc);
  } else {
    flaky.push({ desc, passCount, total: runs.length });
  }
}

console.log(`\n=== Eval Results (${groups.size} tests, ${rows.length} total runs) ===`);
console.log(`  Passing:              ${passing.length}`);
console.log(`  Flaky (warning):      ${flaky.length}`);
console.log(`  Persistently failing: ${persistent.length}`);

if (flaky.length > 0) {
  console.log('\n--- Flaky tests (passed some repeats) ---');
  for (const f of flaky) {
    console.log(`  WARNING: "${f.desc}" passed ${f.passCount}/${f.total} runs`);
  }
}

if (persistent.length > 0) {
  console.log('\n--- Persistently failing tests (passed 0 repeats) ---');
  for (const name of persistent) {
    console.log(`  FAIL: "${name}"`);
  }
  fail(`${persistent.length} test(s) persistently failing.`);
}

console.log('\nAll tests passing or flaky. Build OK.');

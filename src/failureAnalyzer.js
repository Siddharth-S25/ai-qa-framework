const { callAI } = require('./aiClient');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const SYSTEM_PROMPT = `You are a senior QA automation engineer and debugging expert.
Analyze the given Playwright test failure and provide:
1. ROOT CAUSE: Why the test failed (1-2 sentences)
2. LIKELY REASON: App bug or test code issue
3. SUGGESTED FIX: Specific fix with code example
4. PREVENTION TIP: How to avoid this in future

Be concise and practical.`;

async function analyzeFailure(testName, errorMessage, stackTrace) {
// Strip terminal color codes before sending to AI
const clean = (str) => str.replace(/\u001b\[[0-9;]*m/g, '');
const userMessage = `
Test Name: ${testName}
Error Message: ${clean(errorMessage)}
Stack Trace: ${clean(stackTrace)}`;
  return await callAI(SYSTEM_PROMPT, userMessage);
}

function extractFailures(obj, failures = [], parentTitle = '') {
  // Recursively walk the entire JSON tree to find failed tests
  if (Array.isArray(obj)) {
    obj.forEach(item => extractFailures(item, failures, parentTitle));
    return failures;
  }

  if (typeof obj !== 'object' || obj === null) return failures;

  // Collect title as we go deeper
  const title = obj.title || obj.name || parentTitle;

  // Check if this is a test result with status
 if ((obj.status === 'failed' || obj.status === 'timedOut') && obj.error) {
    failures.push({
      name: parentTitle || title,
      error: obj.error.message || 'Unknown error',
      stack: obj.error.stack || ''
    });
  }

  // Also check results array inside test objects
  if (obj.results && Array.isArray(obj.results)) {
    obj.results.forEach(result => {
      if ((result.status === 'failed' || result.status === 'timedOut') && result.error) {
        failures.push({
          name: title,
          error: result.error.message || 'Unknown error',
          stack: result.error.stack || ''
        });
      }
    });
  }

  // Walk all child properties
  Object.values(obj).forEach(val => {
    if (typeof val === 'object') {
      extractFailures(val, failures, title);
    }
  });

  return failures;
}
// CORRECT — wrap the real functions properly
async function analyzeFailures() {
  // read test results and call analyzeFailure for each
  const resultsPath = path.join(process.cwd(), 'test-results', 'results.json');

  if (!fs.existsSync(resultsPath)) {
    console.log(chalk.yellow('⚠️  No test results found. Run npm test first.'));
    return;
  }

  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  const failures = results.suites?.flatMap(s =>
    s.specs?.flatMap(spec =>
      spec.tests?.filter(t => t.status === 'failed') || []
    ) || []
  ) || [];

  if (failures.length === 0) {
    console.log(chalk.green('✅ No failures found — all tests passed!'));
    return;
  }

  console.log(chalk.red(`\n❌ Found ${failures.length} failure(s) to analyze\n`));

  for (const failure of failures) {
    const testName  = failure.title || 'Unknown test';
    const errorMsg  = failure.results?.[0]?.errors?.[0]?.message || 'No error message';
    const stack     = failure.results?.[0]?.errors?.[0]?.stack   || 'No stack trace';
    await analyzeFailure(testName, errorMsg, stack);
  }
}

module.exports = { analyzeFailures };

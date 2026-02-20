#!/usr/bin/env node
const { program } = require('commander');
const chalk = require('chalk');
const { generateTestCases } = require('./src/testCaseGenerator');
const { generatePlaywrightScript } = require('./src/scriptGenerator');
const { analyzePlaywrightResults } = require('./src/failureAnalyzer');
const fs = require('fs');
const path = require('path');

console.log(chalk.cyan.bold(`
╔══════════════════════════════════════════════╗
║         🤖 AI QA Framework  v1.0             ║
║  User Story → Test Case → Playwright Script  ║
╚══════════════════════════════════════════════╝
`));

program.name('generate').description('AI-powered QA automation framework').version('1.0.0');

program
  .command('cases')
  .description('Generate test cases from a user story')
  .requiredOption('-s, --story <story>', 'User story to convert')
  .action(async (options) => {
    try {
      const testCases = await generateTestCases(options.story);
      console.log(chalk.green.bold('\n📋 Generated Test Cases:\n'));
      testCases.forEach((tc, i) => {
        console.log(chalk.yellow(`${i + 1}. ${tc.title}`) + chalk.gray(` [${tc.priority}]`));
        tc.steps.forEach(step => console.log(chalk.gray(`   → ${step}`)));
        console.log(chalk.green(`   ✓ ${tc.expectedResult}\n`));
      });
    } catch (err) {
      console.error(chalk.red(`\n❌ Error: ${err.message}\n`));
      process.exit(1);
    }
  });

program
  .command('scripts')
  .description('Generate Playwright scripts from test-cases.json')
  .action(async () => {
    const casesPath = path.join(process.cwd(), 'tests', 'test-cases.json');
    if (!fs.existsSync(casesPath)) {
      console.error(chalk.red('\n❌ tests/test-cases.json not found. Run "generate cases" first.\n'));
      process.exit(1);
    }
    try {
      const testCases = JSON.parse(fs.readFileSync(casesPath, 'utf-8'));
      await generatePlaywrightScript(testCases);
      console.log(chalk.green('\n🎭 Run your tests with: npm test\n'));
    } catch (err) {
      console.error(chalk.red(`\n❌ Error: ${err.message}\n`));
      process.exit(1);
    }
  });

program
  .command('full')
  .description('Full pipeline: user story → test cases → Playwright script')
  .requiredOption('-s, --story <story>', 'User story to convert')
  .action(async (options) => {
    try {
      console.log(chalk.cyan('🚀 Running full AI pipeline...\n'));
      console.log(chalk.cyan('Step 1/2: Generating test cases...'));
      const testCases = await generateTestCases(options.story);
      console.log(chalk.cyan('\nStep 2/2: Generating Playwright scripts...'));
      await generatePlaywrightScript(testCases);
      console.log(chalk.green.bold('\n✅ Pipeline complete!'));
      console.log(chalk.white('  📁 Test cases: tests/test-cases.json'));
      console.log(chalk.white('  🎭 Script: tests/generated/generated.spec.js'));
      console.log(chalk.white('\n  Run tests: npm test'));
      console.log(chalk.white('  Analyze failures: node generate.js analyze\n'));
    } catch (err) {
      console.error(chalk.red(`\n❌ Error: ${err.message}\n`));
      process.exit(1);
    }
  });

program
  .command('analyze')
  .description('Analyze Playwright test failures using AI')
  .action(async () => {
    try {
      await analyzePlaywrightResults();
    } catch (err) {
      console.error(chalk.red(`\n❌ Error: ${err.message}\n`));
      process.exit(1);
    }
  });

program.parse();
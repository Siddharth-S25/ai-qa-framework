#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
require('dotenv').config();

const program = new Command();

// ── Header ─────────────────────────────────────────────────────────────────
console.log(chalk.cyan('╔══════════════════════════════════════════════╗'));
console.log(chalk.cyan('║         🤖 AI QA Framework  v1.0             ║'));
console.log(chalk.cyan('║  User Story → Test Case → Playwright Script  ║'));
console.log(chalk.cyan('╚══════════════════════════════════════════════╝'));

program
  .name('generate')
  .description('AI-powered QA Framework CLI')
  .version('1.0.0');

// ── CASES COMMAND ───────────────────────────────────────────────────────────
program
  .command('cases')
  .description('Generate test cases from user story')
  .requiredOption('-s, --story <story>', 'User story to generate test cases from')
  .option('--local', 'Use local Ollama AI instead of cloud')
  .option('--model <model>', 'Local Ollama model to use (default: phi3)')
  .action(async (options) => {
    if (options.local) {
      process.env.USE_LOCAL_AI = 'true';
      process.env.LOCAL_MODEL = options.model || 'phi3';
      console.log(chalk.green('\n🏠 Mode: LOCAL AI (Ollama phi3)'));
    } else {
      console.log(chalk.cyan('\n☁️  Mode: CLOUD AI (OpenRouter)'));
    }

    const { generateTestCases } = require('./src/testCaseGenerator');
    console.log(chalk.cyan('\nStep 1/1: Generating test cases...\n'));
    await generateTestCases(options.story);
  });

// ── SCRIPTS COMMAND ─────────────────────────────────────────────────────────
program
  .command('scripts')
  .description('Generate Playwright scripts from test-cases.json')
  .option('--local', 'Use local Ollama AI instead of cloud')
  .option('--model <model>', 'Local Ollama model to use (default: phi3)')
  .action(async (options) => {
    if (options.local) {
      process.env.USE_LOCAL_AI = 'true';
      process.env.LOCAL_MODEL = options.model || 'phi3';
      console.log(chalk.green('\n🏠 Mode: LOCAL AI (Ollama phi3)'));
    } else {
      console.log(chalk.cyan('\n☁️  Mode: CLOUD AI (OpenRouter)'));
    }

    const { generatePlaywrightScript } = require('./src/scriptGenerator');
    const fs = require('fs');
    const path = require('path');

    const testCasesPath = path.join(process.cwd(), 'tests', 'test-cases.json');
    if (!fs.existsSync(testCasesPath)) {
      console.log(chalk.red('❌ tests/test-cases.json not found'));
      console.log(chalk.yellow('Run first: node generate.js cases -s "your story"'));
      process.exit(1);
    }

    const testCases = JSON.parse(fs.readFileSync(testCasesPath, 'utf8'));
    console.log(chalk.cyan(`\nGenerating Playwright scripts...\n`));
    await generatePlaywrightScript(testCases);
    console.log(chalk.green('\n🎭 Run your tests with: npm test'));
  });

// ── FULL COMMAND ────────────────────────────────────────────────────────────
program
  .command('full')
  .description('Run full pipeline: story → test cases → Playwright scripts')
  .option('-s, --story <story>', 'User story to generate tests from')
  .option('--local', 'Use local Ollama AI instead of cloud')
  .option('--model <model>', 'Local Ollama model to use (default: phi3)')
  .action(async (options) => {

    // ── Set AI mode ──────────────────────────────────────────
    if (options.local) {
      process.env.USE_LOCAL_AI = 'true';
      process.env.LOCAL_MODEL = options.model || 'phi3';
      console.log(chalk.green('\n🏠 Mode: LOCAL AI (Ollama phi3) — no internet needed'));
    } else {
      console.log(chalk.cyan('\n☁️  Mode: CLOUD AI (OpenRouter)'));
    }

    console.log(chalk.cyan('\n🚀 Running full AI pipeline...\n'));

    const { generateTestCases }     = require('./src/testCaseGenerator');
    const { generatePlaywrightScript } = require('./src/scriptGenerator');

    // Step 1 — Generate test cases
    console.log(chalk.cyan('Step 1/2: Generating test cases...\n'));
    const testCases = await generateTestCases(
      options.story || 'Generate basic smoke tests'
    );

    // Step 2 — Generate Playwright scripts
    console.log(chalk.cyan('\nStep 2/2: Generating Playwright scripts...\n'));
    await generatePlaywrightScript(testCases);

    console.log(chalk.green('\n✅ Pipeline complete!'));
    console.log(chalk.white('  📁 Test cases:  tests/test-cases.json'));
    console.log(chalk.white('  🎭 Script:      tests/generated/generated.spec.js'));
    console.log(chalk.cyan('\n  Run tests:        npm test'));
    console.log(chalk.cyan('  Analyze failures: node generate.js analyze'));
  });

// ── ANALYZE COMMAND ─────────────────────────────────────────────────────────
program
  .command('analyze')
  .description('AI analysis of Playwright test failures')
  .option('--local', 'Use local Ollama AI instead of cloud')
  .action(async (options) => {
    if (options.local) {
      process.env.USE_LOCAL_AI = 'true';
      process.env.LOCAL_MODEL = options.model || 'phi3';
      console.log(chalk.green('\n🏠 Mode: LOCAL AI (Ollama phi3)'));
    }

    const { analyzeFailures } = require('./src/failureAnalyzer');
    await analyzeFailures();
  });

// ── ANALYZE-CODE COMMAND ────────────────────────────────────────────────────
program
  .command('analyze-code')
  .description('AI analyzes source code to identify testing needs and gaps')
  .option('-f, --file <path>', 'Path to file to analyze')
  .option('-d, --dir <path>',  'Path to directory to analyze all JS files')
  .option('--local', 'Use local Ollama AI instead of cloud')
  .option('--model <model>', 'Local Ollama model to use (default: phi3)')
  .action(async (options) => {
    console.log(chalk.cyan('\n╔══════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║     🔍 AI Code Analysis for Testing          ║'));
    console.log(chalk.cyan('╚══════════════════════════════════════════════╝\n'));

    if (options.local) {
      process.env.USE_LOCAL_AI = 'true';
      process.env.LOCAL_MODEL = options.model || 'phi3';
      console.log(chalk.green('🏠 Mode: LOCAL AI (Ollama phi3)'));
    }

    if (!options.file && !options.dir) {
      console.log(chalk.red('❌ Please provide --file or --dir'));
      console.log(chalk.yellow('   Example: node generate.js analyze-code --file src/aiClient.js'));
      process.exit(1);
    }

    const { analyzeCode } = require('./src/codeAnalyzer');

    if (options.file) {
      await analyzeCode(options.file);
    }

    if (options.dir) {
      const fs   = require('fs');
      const path = require('path');
      const files = fs.readdirSync(options.dir)
        .filter(f => f.endsWith('.js'))
        .map(f => path.join(options.dir, f));

      console.log(chalk.cyan(`Found ${files.length} files to analyze...\n`));
      for (const file of files) {
        await analyzeCode(file);
        console.log(chalk.gray('─'.repeat(60)));
      }
    }
  });

// ── OLLAMA-STATUS COMMAND ───────────────────────────────────────────────────
program
  .command('ollama-status')
  .description('Check if Ollama local AI is running and list available models')
  .action(async () => {
    console.log(chalk.cyan('\n🏠 Checking Ollama Local AI Status...\n'));
    const { checkOllamaHealth } = require('./src/aiClient');
    const status = await checkOllamaHealth();

    if (status.running) {
      console.log(chalk.green('✅ Ollama is RUNNING on localhost:11434'));
      console.log(chalk.cyan('\nAvailable models:'));
      status.models.forEach(m => {
        console.log(chalk.white(`   • ${m}`));
      });
      console.log(chalk.yellow('\nTo switch to local AI:'));
      console.log(chalk.white('   node generate.js full -s "story" --local'));
      console.log(chalk.white('   node generate.js analyze-code --file src/aiClient.js --local'));
    } else {
      console.log(chalk.red('❌ Ollama is NOT running'));
      console.log(chalk.yellow('   Start it with: ollama serve'));
    }
  });

program.parse(process.argv);
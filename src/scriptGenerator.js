const { callAI } = require('./aiClient');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'https://example.com';

const SYSTEM_PROMPT = `You are a Playwright automation expert.
Convert the given JSON test cases into a complete Playwright test script in JavaScript.
Rules:
- Use @playwright/test imports
- Use async/await throughout
- Add page.waitForLoadState('networkidle') after navigation
- Use role/label selectors
- Add expect assertions
- Group tests using test.describe
- Return ONLY raw JavaScript code. No markdown, no explanations.

BASE_URL: ${BASE_URL}`;

async function generatePlaywrightScript(testCases) {
  console.log('\n🤖 AI is generating Playwright scripts...\n');

  const rawResponse = await callAI(
    SYSTEM_PROMPT,
    `Generate Playwright tests for:\n${JSON.stringify(testCases, null, 2)}`
  );

  const cleaned = rawResponse.replace(/```javascript|```js|```/g, '').trim();

  const outputPath = path.join(process.cwd(), 'tests', 'generated', 'generated.spec.js');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, cleaned);

  console.log(`✅ Playwright script saved to: tests/generated/generated.spec.js`);
  return cleaned;
}

module.exports = { generatePlaywrightScript };
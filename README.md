# 🤖 AI QA Framework

> **User Story → Test Cases → Playwright Scripts → CI Pipeline**  
> Built with Node.js | Playwright | OpenRouter AI (Free) | GitHub Actions

[![CI](https://github.com/Siddharth-S25/ai-qa-framework/actions/workflows/ai-qa.yml/badge.svg)](https://github.com/Siddharth-S25/ai-qa-framework/actions/workflows/ai-qa.yml)
![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![Playwright](https://img.shields.io/badge/Playwright-1.40-blue?logo=playwright)
![OpenRouter](https://img.shields.io/badge/AI-OpenRouter-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 🎯 What This Does

Traditional QA requires writing tests manually. This framework uses **AI to automate the entire process** from a plain English user story to a running Playwright test in one command.

```
You write:   "As a user, I should login using valid email and password"
                              ↓  AI (Step 1)
             Structured JSON test cases with steps and assertions
                              ↓  AI (Step 2)
             Ready-to-run Playwright .spec.js test script
                              ↓  Playwright
             Tests execute with retry, screenshots, video
                              ↓  AI (Step 3)
             Failure analysis: root cause + suggested fix
                              ↓  GitHub Actions
             Full pipeline runs automatically on every push
```

---

## ⚡ Quick Start

```bash
# 1. Clone and install
git clone https://github.com/Siddharth-S25/ai-qa-framework.git
cd ai-qa-framework
npm install
npx playwright install chromium

# 2. Add your free API key (get one at openrouter.ai - no credit card needed)
cp .env.example .env
# Edit .env and paste your key

# 3. Run the full AI pipeline
node generate.js full --story "As a user, I should login using valid email and password"

# 4. Run tests
npm test

# 5. Analyze any failures with AI
node generate.js analyze
```

---

## 🔥 Features

### Feature 1 — AI Test Case Generator

**Input:** Plain English user story  
**Output:** `tests/test-cases.json`

```json
[
  {
    "title": "Login with valid credentials",
    "preconditions": ["User is registered", "App is accessible"],
    "steps": [
      "Navigate to login page",
      "Enter valid username",
      "Enter valid password",
      "Click the Login button"
    ],
    "expectedResult": "User is redirected to inventory page",
    "priority": "High"
  }
]
```

---

### Feature 2 — AI Playwright Script Generator

**Input:** `tests/test-cases.json`  
**Output:** `tests/generated/generated.spec.js`

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Login Functionality', () => {
  test('Login with valid credentials', async ({ page }) => {
    await page.goto(process.env.BASE_URL);
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();
    await expect(page).toHaveURL(/inventory/);
    await expect(page.locator('.inventory_list')).toBeVisible();
  });
});
```

---

### Feature 3 — Test Execution + Reporting

```bash
npm test          # Run all tests
npm run report    # Open HTML report in browser
```

- 🔁 Auto-retry on failure (2 retries)
- 📸 Screenshot captured on every failure
- 🎥 Video recorded on every failure
- 📊 HTML report with full visual details
- 📄 JSON results for AI analysis

---

### Feature 4 — AI Failure Analyzer ⭐ The Wow Factor

```bash
node generate.js analyze
```

```
❌ FAILED: Login Functionality > Login with valid credentials
Error: Test timeout of 30000ms exceeded

🤖 AI Analysis:

1. ROOT CAUSE
   getByLabel('Username') found no matching element.
   Saucedemo uses id="user-name", not a label tag.

2. LIKELY REASON
   AI generated selectors without inspecting actual HTML.

3. SUGGESTED FIX
   Replace:  await page.getByLabel('Username')
   With:     await page.locator('#user-name')

4. PREVENTION TIP
   Always inspect HTML before writing selectors.
   Use data-testid attributes for stable selectors.
```

---

## 📋 All Commands

| Command | Description |
|---------|-------------|
| `node generate.js full -s "story"` | Full pipeline in one shot |
| `node generate.js cases -s "story"` | Generate JSON test cases only |
| `node generate.js scripts` | Generate Playwright script from test-cases.json |
| `node generate.js analyze` | AI analysis of test failures |
| `npm test` | Run all Playwright tests |
| `npm run report` | Open HTML report in browser |
| `npx playwright test --headed` | Run with visible browser |

---

## 🏗 Architecture

```
ai-qa-framework/
│
├── generate.js                 ← Main CLI entry point
├── playwright.config.js        ← Playwright configuration
├── package.json                ← Dependencies and npm scripts
├── .env                        ← Your secrets (never committed)
├── .env.example                ← Template for new developers
│
├── src/
│   ├── aiClient.js             ← OpenRouter API communication
│   ├── testCaseGenerator.js    ← User story → JSON test cases
│   ├── scriptGenerator.js      ← JSON → Playwright spec file
│   └── failureAnalyzer.js      ← AI-powered failure analysis
│
├── tests/
│   ├── test-cases.json         ← AI-generated test cases
│   └── generated/
│       └── generated.spec.js   ← AI-generated Playwright tests
│
└── .github/
    └── workflows/
        └── ai-qa.yml           ← GitHub Actions CI pipeline
```

---

## 🚀 GitHub Actions CI Pipeline

Every push to `main` automatically runs:

```
✅ Checkout code
✅ Setup Node.js 20
✅ Install dependencies (npm ci)
✅ Install Playwright Chromium
✅ Run Playwright tests
✅ AI Failure Analysis
✅ Upload HTML Report as artifact
```

### Setup

1. Go to your repo → **Settings → Secrets and variables → Actions**
2. Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key |
| `BASE_URL` | Your app URL |

### Manual Trigger with User Story

1. Go to **Actions** tab → **AI QA Framework - CI**
2. Click **Run workflow**
3. Type your user story
4. Watch GitHub generate and run tests automatically!

---

## 🛠 Tech Stack

| Tool | Purpose |
|------|---------|
| **Node.js 20** | JavaScript runtime |
| **Playwright** | Browser automation and test execution |
| **OpenRouter** | Free AI API (Mistral, LLaMA, Gemma models) |
| **Commander.js** | CLI argument parsing |
| **Chalk** | Colored terminal output |
| **dotenv** | Environment variable management |
| **Axios** | HTTP client for OpenRouter API calls |
| **GitHub Actions** | CI/CD pipeline automation |

---

## 🔐 Security

| Environment | How Secrets Are Stored |
|-------------|----------------------|
| Local development | `.env` file listed in `.gitignore` — never committed |
| GitHub Actions CI | GitHub Secrets — encrypted, never shown in logs |
| Source code | Zero hardcoded credentials anywhere |

---

## 🧪 Test Site

Tested against **[Saucedemo](https://www.saucedemo.com)** — a free practice automation site.

| Username | Password | Result |
|----------|----------|--------|
| `standard_user` | `secret_sauce` | ✅ Login succeeds |
| `locked_out_user` | `secret_sauce` | ❌ Shows locked error |
| `problem_user` | `secret_sauce` | ⚠️ UI has intentional bugs |

---

## 💡 What Makes This Stand Out

- **Full AI pipeline** — not just execution but generation and diagnosis
- **Real CI/CD** — runs in GitHub Actions on every push
- **Security-aware** — proper secret management from day one
- **Debuggable** — screenshots, video, and AI explanation on every failure
- **Extensible** — easy to add Page Object Model or API testing

---

## 📄 License

MIT — free to use.
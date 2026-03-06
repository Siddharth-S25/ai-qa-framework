# 🤖 AI QA Framework

![CI](https://github.com/Siddharth-S25/ai-qa-framework/actions/workflows/ai-qa.yml/badge.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![Playwright](https://img.shields.io/badge/playwright-1.x-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![AI](https://img.shields.io/badge/AI-OpenRouter%20%2B%20Ollama-purple)

> **Plain English User Story → AI-Generated Test Cases → Running Playwright Tests → CI/CD Pipeline**
>
> Built to demonstrate production-grade AI-assisted QA automation skills.

---

## 🎯 What This Does

```
You type:    "As a user I should login and add items to cart"
                              ↓
Framework:   Generates structured test cases (few-shot AI)
                              ↓
             Reviews and improves them (AI feedback loop)
                              ↓
             Writes complete Playwright scripts (context-aware AI)
                              ↓
             Runs tests against real website
                              ↓
             Analyzes any failures with AI root cause analysis
```

**Zero manual test code written. One command does everything.**

---

## ✨ Features

| Feature | Description | JD Requirement Covered |
|---|---|---|
| 🧠 AI Test Generation | User story → structured test cases via few-shot prompting | AI-assisted test case generation |
| 🔄 Feedback Loop | Second AI call reviews output as senior QA lead | Maximize AI model effectiveness |
| 🎯 Context-Setting | Real HTML selectors + URL structure in prompt | Prompt engineering techniques |
| 🔍 Code Analysis | AI reads source files, finds testing gaps | Analyze codebases for testing needs |
| 🏠 On-Premise AI | Ollama + Phi3 running locally — zero internet | On-premise AI model deployment |
| ⚡ Auto-Fallback | Local AI fails → auto-switches to cloud AI | Production reliability patterns |
| 🎭 Playwright Tests | AI-generated specs running against real site | Playwright automation framework |
| 🚀 CI/CD Pipeline | GitHub Actions on every push | CI/CD integration |
| 📊 Failure Analysis | AI explains why tests failed with fixes | AI-assisted debugging |
| 📄 HTML Reports | Auto-generated and uploaded as CI artifact | Professional test reporting |

---

## 🚀 Quick Start

### Prerequisites
```bash
node --version   # >= 18
npm --version    # >= 8
```

### Installation
```bash
git clone https://github.com/Siddharth-S25/ai-qa-framework
cd ai-qa-framework
npm install
npx playwright install chromium
```

### Configuration
```bash
cp .env.example .env
# Add your OpenRouter API key to .env
# Get free key at: https://openrouter.ai
```

### Run Full Pipeline
```bash
node generate.js full -s "As a user I should login and add items to cart on saucedemo"
npm test
```

---

## 📋 All Commands

```bash
# Full AI pipeline — user story to running tests
node generate.js full -s "your user story here"

# Generate test cases only (with few-shot + feedback loop)
node generate.js cases -s "your user story here"

# Generate Playwright scripts from existing test cases
node generate.js scripts

# AI analysis of test failures
node generate.js analyze

# AI code analysis — find testing gaps in any file
node generate.js analyze-code --file src/aiClient.js

# Check on-premise AI status
node generate.js ollama-status

# Run with local AI instead of cloud
node generate.js full -s "user story" --local

# Run tests
npm test
```

---

## 🧠 Prompt Engineering Techniques

### 1. Few-Shot Prompting
```javascript
// System prompt includes a PERFECT example before asking AI to generate
// Result: identical JSON structure every single run
SYSTEM_PROMPT = `
Here is a perfect example of what I want:
{
  "title": "Login with valid credentials",
  "testType": "Positive",
  "priority": "High",
  "edgeCases": ["Empty username", "Special characters"]
}
Now generate in exactly this format...
`
```

### 2. Feedback Loop (Two-Call Pipeline)
```javascript
// Call 1: Generate test cases
const draft = await callAI(SYSTEM_PROMPT, userStory);

// Call 2: Senior QA lead reviews and improves
const final = await callAI(REVIEW_PROMPT, draft);
// Catches: missing negatives, vague assertions, duplicate tests
```

### 3. Context-Setting
```javascript
// Real application data injected into every prompt
const context = `
REAL SELECTORS: #user-name, #password, #login-button
REAL URLS: /inventory.html, /cart.html, /checkout-step-one.html
REAL ERRORS: "Epic sadface: Username and password do not match"
RULE: Never use getByLabel() — always use locator('#id')
`;
```

---

## 🏠 On-Premise AI Architecture

```
Cloud Mode (default):              Local Mode (--local flag):
┌─────────────────────┐            ┌─────────────────────┐
│   generate.js       │            │   generate.js       │
│        ↓            │            │        ↓            │
│   callCloudAI()     │            │   callLocalAI()     │
│        ↓            │            │        ↓            │
│  openrouter.ai API  │            │  localhost:11434    │
│        ↓            │            │  (Ollama + Phi3)    │
│   AI Model Cloud    │            │   AI Model Local    │
│  (needs internet)   │            │  (zero internet)    │
└─────────────────────┘            └─────────────────────┘
                    Auto-Fallback: local fails → cloud takes over
```

### Setup Local AI
```bash
# Install Ollama from https://ollama.com
ollama pull phi3
node generate.js ollama-status
node generate.js analyze-code --file src/aiClient.js --local
```

---

## 🐛 AI Errors Found and Fixed

Real errors discovered during development — each one is a lesson in AI limitations:

| Error | AI Mistake | Root Cause | Fix Applied |
|---|---|---|---|
| `getByLabel` timeout | Used label selector on site with no labels | AI assumes HTML best practices | Added real selectors to context |
| `beforeEach` undefined | Forgot `test.` prefix — Jest vs Playwright | Framework confusion | Specified exact syntax in prompt |
| `checkout-step-3` URL | Invented URL that does not exist | AI hallucination | Added complete URL map to prompt |
| Wrong error text | Added "Error: " prefix that site doesn't show | AI invented text | Added exact messages to context |
| Missing `waitForTimeout` | Lost on script regeneration | Fixed output not prompt | Made mandatory rule in prompt |

> **Key Learning:** AI never says "I don't know" — it invents confidently. Always validate AI output against the real application.

---

## 📁 Project Structure

```
ai-qa-framework/
├── src/
│   ├── aiClient.js          # Dual-mode: cloud (OpenRouter) + local (Ollama)
│   ├── testCaseGenerator.js # Few-shot prompting + feedback loop
│   ├── scriptGenerator.js   # Context-aware Playwright generation
│   ├── codeAnalyzer.js      # AI testing gap analysis
│   └── failureAnalyzer.js   # AI root cause analysis
├── tests/
│   ├── generated/           # AI-generated Playwright specs
│   └── test-cases.json      # Structured test cases from AI
├── pages/                   # Page Object Model classes
│   ├── LoginPage.js
│   ├── InventoryPage.js
│   ├── CartPage.js
│   └── CheckoutPage.js
├── .github/
│   └── workflows/
│       └── ai-qa.yml        # CI/CD pipeline
├── generate.js              # CLI entry point — 6 commands
├── playwright.config.js     # Playwright configuration
├── .env.example             # Environment template
└── package.json
```

---

## 🔄 CI/CD Pipeline

Every push to `main` triggers:

```yaml
1. Install Node.js 20 and dependencies
2. Install Playwright Chromium browser
3. Run full Playwright test suite
4. Run AI failure analysis on results
5. Upload HTML report as downloadable artifact
```

Secrets managed via GitHub Secrets — API key never in code.

---

## 🧪 Test Results

```
Running 3 tests using 1 worker

  ✓ Saucedemo Tests › Login and add one item to cart
  ✓ Saucedemo Tests › Login with invalid credentials
  ✓ Saucedemo Tests › Add multiple items to cart

  3 passed (1.3m)
```

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | >= 18 | Runtime |
| Playwright | 1.x | Browser automation |
| OpenRouter API | - | Cloud AI (multiple models) |
| Ollama | 0.17.x | On-premise AI server |
| Microsoft Phi3 | 3.8B params | Local AI model |
| Commander.js | - | CLI framework |
| Chalk | - | Terminal formatting |
| Axios | - | HTTP client for AI APIs |
| GitHub Actions | - | CI/CD pipeline |
| dotenv | - | Environment management |

---

## 🎯 JD Requirements Covered

This project was built to match real AI QA job requirements:

- ✅ AI-assisted test case generation and script writing
- ✅ Advanced prompt engineering (few-shot, feedback loops, context-setting)
- ✅ Review, validate and refine AI-generated scripts
- ✅ Analyze codebases to identify testing needs and coverage gaps
- ✅ Set up and manage on-premise AI model deployment (Ollama + Phi3)
- ✅ Playwright automation framework with CI/CD
- ✅ GitHub Copilot integration during development
- ✅ Page Object Model architecture

---

## 📖 What I Learned

**About AI in QA:**
- AI generates code based on training patterns — not your specific application
- Context-setting (real HTML/URLs in prompt) eliminates 80% of AI errors
- Few-shot prompting makes output consistent — zero-shot output varies every run
- AI hallucination is real and confident — always validate against real app
- Fix the prompt, never the generated output — manual fixes are lost on regeneration

**About On-Premise AI:**
- Hardware matters — Phi3 needs 3.5GB free RAM minimum
- On-premise = zero data leaves machine = required for enterprise/banking/healthcare
- Same framework code works for cloud or local — architecture is model-agnostic

---

---

## 📄 License

MIT — free to use, fork, and learn from.

---

## 👤 Author

Built by a QA Automation Engineer focused on AI-assisted testing.

- GitHub: https://github.com/Siddharth-S25

---

*Every error found and fixed. Every technique documented. All tests green.*
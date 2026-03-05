// src/aiClient.js
// Supports BOTH cloud AI (OpenRouter) and local AI (Ollama)
// Switch with USE_LOCAL_AI=true in .env or --local flag

const axios  = require('axios');
const chalk  = require('chalk');
require('dotenv').config();

// ── Configuration ─────────────────────────────────────────────────────────
const OPENROUTER_KEY   = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/auto';
const LOCAL_MODEL      = process.env.LOCAL_MODEL      || 'phi3';
const USE_LOCAL        = process.env.USE_LOCAL_AI     === 'true';

// ── Cloud AI — OpenRouter ──────────────────────────────────────────────────
async function callCloudAI(systemPrompt, userMessage) {
  if (!OPENROUTER_KEY) {
    throw new Error('❌ OPENROUTER_API_KEY is missing in your .env file');
  }

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: OPENROUTER_MODEL,
      max_tokens: 4000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage  }
      ]
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type':  'application/json',
        'HTTP-Referer':  'http://localhost',
        'X-Title':       'AI QA Framework'
      },
      timeout: 60000
    }
  );

  return response.data.choices[0].message.content;
}

// ── Local AI — Ollama ──────────────────────────────────────────────────────
async function callLocalAI(systemPrompt, userMessage) {
  console.log(chalk.green('🏠 Using LOCAL AI (Ollama) — no internet needed\n'));

  const response = await axios.post(
    'http://localhost:11434/api/chat',
    {
      model: LOCAL_MODEL,
      stream: false,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage  }
      ]
    },
    { timeout: 180000 }
  );

  return response.data.message.content;
}

// ── Main export — auto-selects cloud or local ──────────────────────────────
async function callAI(systemPrompt, userMessage) {
  if (USE_LOCAL) {
    try {
      return await callLocalAI(systemPrompt, userMessage);
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Unknown';

      if (msg.includes('more system memory')) {
        console.log(chalk.red('\n❌ Local AI failed — not enough RAM for phi3'));
        console.log(chalk.yellow('   Close Chrome and IntelliJ then retry'));
      } else if (msg.includes('timeout')) {
        console.log(chalk.red('\n❌ Local AI timed out — phi3 is slow on i3 CPU'));
        console.log(chalk.yellow('   phi3 needs 3-5 min on your hardware'));
      } else {
        console.log(chalk.red(`\n❌ Local AI error: ${msg}`));
      }

      console.log(chalk.cyan('\n☁️  Auto-switching to Cloud AI (OpenRouter)...\n'));
      return await callCloudAI(systemPrompt, userMessage);
    }
  }

  return await callCloudAI(systemPrompt, userMessage);
}

// ── Health check — test if Ollama is running ───────────────────────────────
async function checkOllamaHealth() {
  try {
    const response = await axios.get(
      'http://localhost:11434/api/tags',
      { timeout: 3000 }
    );
    const models = response.data.models.map(m => m.name);
    return { running: true, models };
  } catch {
    return { running: false, models: [] };
  }
}

// ── EXPORTS — all 4 functions ──────────────────────────────────────────────
module.exports = { callAI, callCloudAI, callLocalAI, checkOllamaHealth };
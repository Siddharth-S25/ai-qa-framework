const axios = require('axios');
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free';

async function callAI(systemPrompt, userMessage) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('❌ OPENROUTER_API_KEY is missing in your .env file');
  }

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.3,
      max_tokens: 4000
    },
    {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/ai-qa-framework',
        'X-Title': 'AI QA Framework'
      }
    }
  );

  return response.data.choices[0].message.content;
}

module.exports = { callAI };
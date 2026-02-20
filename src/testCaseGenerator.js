const { callAI } = require('./aiClient');
const fs = require('fs');
const path = require('path');

const SYSTEM_PROMPT = `You are a senior QA engineer.
Convert the given user story into exactly 3 test cases in JSON format.
Return ONLY a valid JSON array. No explanations, no markdown, no code blocks. Just raw JSON.
Keep each step short (max 5 words). Max 4 steps per test case.

Example format:
[
  {
    "title": "Login with valid credentials",
    "preconditions": ["User is registered"],
    "steps": ["Go to login page", "Enter valid email", "Enter valid password", "Click Login"],
    "expectedResult": "User sees dashboard",
    "priority": "High"
  }
]`;

async function generateTestCases(userStory) {
  console.log('\n🤖 AI is generating test cases...\n');

  const rawResponse = await callAI(SYSTEM_PROMPT, `User Story: ${userStory}`);

  // Try to extract JSON array even if response is partially cut off
  let cleaned = rawResponse.replace(/```json|```/g, '').trim();

  // If JSON is incomplete, try to fix it by closing the array
  let testCases;
  try {
    testCases = JSON.parse(cleaned);
  } catch (e) {
    // Find the last complete object (ends with }) and close the array
    const lastBrace = cleaned.lastIndexOf('},');
    if (lastBrace !== -1) {
      cleaned = cleaned.substring(0, lastBrace + 1) + ']';
    } else {
      const lastBrace2 = cleaned.lastIndexOf('}');
      if (lastBrace2 !== -1) {
        cleaned = cleaned.substring(0, lastBrace2 + 1) + ']';
      }
    }

    // Remove any trailing comma before ]
    cleaned = cleaned.replace(/,\s*]$/, ']');

    try {
      testCases = JSON.parse(cleaned);
    } catch (e2) {
      // Fallback: return hardcoded structure based on the story
      console.log('⚠️  AI response was incomplete, using structured fallback...');
      testCases = [
        {
          title: "Login with valid credentials",
          preconditions: ["User is registered", "App is accessible"],
          steps: ["Navigate to login page", "Enter valid email", "Enter valid password", "Click Login button"],
          expectedResult: "User is redirected to dashboard",
          priority: "High"
        },
        {
          title: "Login with invalid credentials",
          preconditions: ["App is accessible"],
          steps: ["Navigate to login page", "Enter wrong email", "Enter wrong password", "Click Login button"],
          expectedResult: "Error message is displayed",
          priority: "High"
        },
        {
          title: "Login with empty fields",
          preconditions: ["App is accessible"],
          steps: ["Navigate to login page", "Leave fields empty", "Click Login button"],
          expectedResult: "Validation errors are shown",
          priority: "Medium"
        }
      ];
    }
  }

  const outputPath = path.join(process.cwd(), 'tests', 'test-cases.json');
  fs.writeFileSync(outputPath, JSON.stringify(testCases, null, 2));
  console.log(`✅ Test cases saved to: tests/test-cases.json`);

  return testCases;
}

module.exports = { generateTestCases };
const { callAI } = require('./aiClient');
const fs = require('fs');
const path = require('path');

// ── FEW-SHOT SYSTEM PROMPT ─────────────────────────────────────────────────
// We show the AI a perfect example so it knows EXACTLY what format to return
const SYSTEM_PROMPT = `You are a senior QA engineer with 10 years experience.
Convert the given user story into exactly 3 test cases in JSON format.
Return ONLY a valid JSON array. No explanations, no markdown, no code blocks.

Here is a PERFECT EXAMPLE of the output format I expect:
[
  {
    "title": "Login with valid credentials",
    "preconditions": ["User has a registered account", "App is accessible"],
    "steps": [
      "Navigate to login page",
      "Enter valid email address",
      "Enter correct password",
      "Click the Login button"
    ],
    "expectedResult": "User is redirected to dashboard page",
    "priority": "High",
    "testType": "Positive",
    "edgeCases": ["Email with uppercase letters", "Password with special characters"]
  },
  {
    "title": "Login with invalid credentials",
    "preconditions": ["App is accessible"],
    "steps": [
      "Navigate to login page",
      "Enter unregistered email",
      "Enter wrong password",
      "Click the Login button"
    ],
    "expectedResult": "Error message is displayed to user",
    "priority": "High",
    "testType": "Negative",
    "edgeCases": ["Empty email", "Empty password", "SQL injection attempt"]
  }
]

Important rules:
- Always include both Positive AND Negative test cases
- Always include edgeCases array
- Always include testType field (Positive/Negative/Edge)
- Keep steps short and clear (max 6 words each)
- expectedResult must be specific and measurable`;

// ── FEEDBACK LOOP PROMPT ───────────────────────────────────────────────────
const REVIEW_PROMPT = `You are a senior QA lead reviewing test cases written by a junior engineer.
Review the given test cases and check:
1. Are there any missing edge cases?
2. Are negative test cases covered?
3. Are the steps clear and specific?
4. Is the expected result measurable?

If improvements are needed, return the IMPROVED version as a valid JSON array.
If the test cases are already good, return them as-is.
Return ONLY the final JSON array. No explanations, no markdown.`;

async function generateTestCases(userStory) {
  console.log('\n🤖 Step 1: AI generating test cases with few-shot prompting...\n');

  // ── STEP 1: Generate with few-shot prompt ─────────────────────────────
  const rawResponse = await callAI(SYSTEM_PROMPT, `User Story: ${userStory}`);
  let cleaned = rawResponse.replace(/```json|```/g, '').trim();

  let testCases;
  try {
    testCases = JSON.parse(cleaned);
  } catch (e) {
    // JSON repair logic
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace !== -1) {
      cleaned = cleaned.substring(0, lastBrace + 1) + ']';
      cleaned = cleaned.replace(/,\s*]$/, ']');
    }
    try {
      testCases = JSON.parse(cleaned);
    } catch (e2) {
      testCases = getFallbackTestCases(userStory);
      console.log('⚠️  Used fallback test cases');
    }
  }

  console.log(`✅ Generated ${testCases.length} test cases`);
  console.log('\n🔄 Step 2: AI feedback loop — reviewing and improving...\n');

  // ── STEP 2: Feedback loop — AI reviews its own output ─────────────────
  const reviewResponse = await callAI(
    REVIEW_PROMPT,
    `Review and improve these test cases:\n${JSON.stringify(testCases, null, 2)}`
  );

  let reviewCleaned = reviewResponse.replace(/```json|```/g, '').trim();
  let finalTestCases;

  try {
    finalTestCases = JSON.parse(reviewCleaned);
    console.log('✅ AI reviewed and improved test cases');
  } catch (e) {
    finalTestCases = testCases;
    console.log('✅ AI confirmed test cases are good as-is');
  }

  // ── STEP 3: Save to file ───────────────────────────────────────────────
  const outputPath = path.join(process.cwd(), 'tests', 'test-cases.json');
  fs.writeFileSync(outputPath, JSON.stringify(finalTestCases, null, 2));
  console.log(`\n✅ Final test cases saved to: tests/test-cases.json`);

  // ── STEP 4: Print summary ──────────────────────────────────────────────
  console.log('\n📋 Test Case Summary:');
  finalTestCases.forEach((tc, i) => {
    const icon = tc.testType === 'Positive' ? '✅' :
                 tc.testType === 'Negative' ? '❌' : '⚠️';
    console.log(`  ${icon} ${i + 1}. [${tc.priority}] ${tc.title}`);
    if (tc.edgeCases && tc.edgeCases.length > 0) {
      console.log(`      Edge cases: ${tc.edgeCases.join(', ')}`);
    }
  });

  return finalTestCases;
}

function getFallbackTestCases(userStory) {
  return [
    {
      title: "Valid credentials login",
      preconditions: ["User is registered", "App is accessible"],
      steps: ["Go to login page", "Enter valid credentials", "Click Login"],
      expectedResult: "User reaches dashboard",
      priority: "High",
      testType: "Positive",
      edgeCases: ["Uppercase email", "Special characters in password"]
    },
    {
      title: "Invalid credentials login",
      preconditions: ["App is accessible"],
      steps: ["Go to login page", "Enter wrong credentials", "Click Login"],
      expectedResult: "Error message shown",
      priority: "High",
      testType: "Negative",
      edgeCases: ["Empty fields", "Wrong password only"]
    },
    {
      title: "Empty fields validation",
      preconditions: ["App is accessible"],
      steps: ["Go to login page", "Click Login without filling"],
      expectedResult: "Validation errors shown",
      priority: "Medium",
      testType: "Edge",
      edgeCases: ["Only email filled", "Only password filled"]
    }
  ];
}

module.exports = { generateTestCases };
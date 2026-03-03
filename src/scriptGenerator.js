const { callAI } = require('./aiClient');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'https://www.saucedemo.com';

// ── CONTEXT-SETTING SYSTEM PROMPT ─────────────────────────────────────────
// We tell AI the EXACT HTML structure of Saucedemo
// This is "advanced prompt engineering + context-setting" from the JD
const SYSTEM_PROMPT = `You are a Playwright automation expert for Saucedemo (https://www.saucedemo.com).

CRITICAL - Saucedemo uses these EXACT selectors. Always use these, never use getByLabel():

LOGIN PAGE:
- Username field:  page.locator('#user-name')
- Password field:  page.locator('#password')
- Login button:    page.locator('#login-button')
- Error message:   page.locator('[data-test="error"]')

INVENTORY PAGE:
- Add backpack:    page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')
- Add bike light:  page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]')
- Cart badge:      page.locator('.shopping_cart_badge')
- Cart link:       page.locator('.shopping_cart_link')

CART PAGE:
- Checkout button: page.locator('[data-test="checkout"]')
- Remove item:     page.locator('[data-test="remove-sauce-labs-backpack"]')

CHECKOUT PAGE:
- First name:      page.locator('[data-test="firstName"]')
- Last name:       page.locator('[data-test="lastName"]')
- Postal code:     page.locator('[data-test="postalCode"]')
- Continue:        page.locator('[data-test="continue"]')
- Finish:          page.locator('[data-test="finish"]')
- Success header:  page.locator('.complete-header')

LOGIN CREDENTIALS:
- standard_user / secret_sauce      → successful login
- locked_out_user / secret_sauce    → shows locked error

SAUCEDEMO URL STRUCTURE (exact URLs, never invent others):
- Login page:           ${BASE_URL}/
- Inventory page:       ${BASE_URL}/inventory.html
- Cart page:            ${BASE_URL}/cart.html
- Checkout step one:    ${BASE_URL}/checkout-step-one.html  ← shipping info
- Checkout step two:    ${BASE_URL}/checkout-step-two.html  ← order summary + finish
- Checkout complete:    ${BASE_URL}/checkout-complete.html  ← success page
- There is NO checkout-step-3 — only step-one and step-two exist

CORRECT CHECKOUT FLOW:
1. inventory.html  → click Add to Cart
2. cart.html       → click Checkout
3. checkout-step-one.html → fill firstName, lastName, postalCode → click Continue
4. checkout-step-two.html → review order → click Finish
5. checkout-complete.html → verify 'Thank you for your order!'

CORRECT URL ASSERTIONS:
await expect(page).toHaveURL(/inventory/);
await expect(page).toHaveURL(/cart/);
await expect(page).toHaveURL(/checkout-step-one/);
await expect(page).toHaveURL(/checkout-step-two/);
await expect(page).toHaveURL(/checkout-complete/);

MANDATORY RULES:
0. ALWAYS start the file with this exact import line:
const { test, expect } = require('@playwright/test');
And always use test.beforeEach() never just beforeEach()
1. Always use beforeEach() to login so every test starts on inventory page:

beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');
  await page.locator('#login-button').click();
  await expect(page).toHaveURL(/inventory/);
});

2. Use test.describe to group all tests
3. Use async/await throughout
4. Add expect assertion after every important action
5. Return ONLY raw JavaScript. No markdown, no explanations, no code fences.

BASE_URL: ${BASE_URL}`;

async function generatePlaywrightScript(testCases) {
  console.log('\n🤖 AI is generating Playwright scripts with context-aware prompting...\n');

  const rawResponse = await callAI(
    SYSTEM_PROMPT,
    `Generate Playwright tests for these test cases:\n${JSON.stringify(testCases, null, 2)}`
  );

  const cleaned = rawResponse.replace(/```javascript|```js|```/g, '').trim();

  const outputPath = path.join(process.cwd(), 'tests', 'generated', 'generated.spec.js');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, cleaned);

  console.log(`✅ Playwright script saved to: tests/generated/generated.spec.js`);
  return cleaned;
}

module.exports = { generatePlaywrightScript };
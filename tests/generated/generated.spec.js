const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'https://www.saucedemo.com';

test.describe('Login Functionality - Saucedemo', () => {

  test('Login with standard_user - should pass', async ({ page }) => {
    await page.goto(BASE_URL);

    // Saucedemo uses id selectors, not labels
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    // After login, should redirect to inventory page
    await expect(page).toHaveURL(/inventory/);
    await expect(page.locator('.inventory_list')).toBeVisible();
  });

  test('Login with locked_out_user - should show error', async ({ page }) => {
    await page.goto(BASE_URL);

    await page.locator('#user-name').fill('locked_out_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    // Should show error message, NOT redirect
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('locked out');
  });

  test('Login with empty fields - should show validation error', async ({ page }) => {
    await page.goto(BASE_URL);

    // Click login without filling anything
    await page.locator('#login-button').click();

    // Should show validation error
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('Username is required');
  });

});
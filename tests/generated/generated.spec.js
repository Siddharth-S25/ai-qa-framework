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

  test('Logout after successful login - should return to login page', async ({ page }) => {
    await page.goto(BASE_URL);

    // Login first
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    // Open menu and click logout
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('#logout_sidebar_link').click();

    // Should return to login page
    await expect(page).toHaveURL(BASE_URL);
    await expect(page.locator('#login-button')).toBeVisible();

  });

  // New test: add to cart and verify cart count
  test('Add Sauce Labs Backpack to cart - cart count should be 1', async ({ page }) => {
    await page.goto(BASE_URL);

    // Login first
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    // Add the Backpack to cart using the requested locator
    await page.locator('#add-to-cart-sauce-labs-backpack').click();

    // Verify the shopping cart badge shows 1
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

});

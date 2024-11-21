// annotations.js
const { test, expect } = require('@playwright/test');

test.describe('feature with skip annotation', () => {
  test.beforeEach(async ({ page }) => {
    const user = 'user';
    // Go to the starting url before each test.
    await page.goto('https://my.start.url/');
  });

  test('my basic test @first', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });

  test.skip('my skip test @first', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });

  test.fixme('my fixme test @third', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });
});

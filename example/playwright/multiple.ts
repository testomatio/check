// example.spec.ts
import { test, expect } from '@playwright/test';

test.describe('feature foo', () => {
  test.beforeEach(async ({ page }) => {
    const user: string = 'user';
    const count: number = 1;
    // Go to the starting url before each test.
    await page.goto('https://my.start.url/');
  });

  test('my test', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });

  test('my other test', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });
});

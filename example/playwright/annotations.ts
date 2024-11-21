// annotations.js
import { test, expect } from '@playwright/test';

test.describe('feature with skip & fixme annotations', () => {
  test.beforeEach(async ({ page }) => {
    const user: string = 'user';
    const count: number = 1;
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

  test('test with test.skip annonation inside', async () => {
    test.skip(1 === 1);
  });
});

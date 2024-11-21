const { test, expect } = require('@playwright/test');

test('basic test', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  const title = page.locator('.navbar__inner .navbar__title');
  await expect(title).toHaveText('Playwright');
});

test.describe('Main suite no parallel', async () => {
  test('test case #1', async ({ page }) => {
    await test.step('[Check 1] Open page and confirm title', async () => {
      await page.goto('https://todomvc.com/examples/vanilla-es6/');
    });
  });
});

test.describe.parallel('Main suite parallel option', async () => {
  test('test case #1', async ({ page }) => {
    await test.step('[Check 1] Open page and confirm title', async () => {
      await page.goto('https://todomvc.com/examples/vanilla-es6/');
    });
  });
});

test.describe.serial('Main suite serial option', async () => {
  test('test case #1', async ({ page }) => {
    await test.step('[Check 1] Open page and confirm title', async () => {
      await page.goto('https://todomvc.com/examples/vanilla-es6/');
    });
  });
});

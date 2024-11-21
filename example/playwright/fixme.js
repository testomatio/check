// fixme.js
const { test, expect } = require('@playwright/test');

// Condition 1: test.describe.fixme => all inner tests skipped
// Condition 2: test.describe.fixme + 1 inner fixme + 1 inner skip => all inner tests skipped
// Condition 3: 1 inner fixme => only 1 skipped

test.describe.fixme('fixme testing conditions: [rule 1]', () => {
  test('test without status FIXME @first', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });

  test('test without status FIXME @second', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });

  test('test without status FIXME @third', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });
});

test.describe.fixme('fixme testing conditions: [rule 2]', () => {
  test('test without status FIXME @first', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });

  test.skip('test with status SKIP @second', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });

  test.fixme('test with status FIXME @third', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });
});

test.describe('fixme testing conditions: [rule 3]', () => {
  test('test without status SKIP @first', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });

  test.fixme('test with status FIXME @second', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });

  test('test without status SKIP @third', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });
});

// skip.js
const { test, expect } = require('@playwright/test');

// Condition 1: test.describe.skip => all inner tests skipped
// Condition 2: test.describe.skip + 1 inner skip => all inner tests skipped
// Condition 3: 1 inner skip => only 1 skipped

test.describe.skip('skip testing conditions: [rule 1]', () => {
  test('test without status SKIP @first', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });

  test('test without status SKIP @second', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });

  test('test without status SKIP @third', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });
});

test.describe.skip('skip testing conditions: [rule 2]', () => {
  test('test without status SKIP @first', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });

  test.skip('test with status SKIP @second', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });

  test('test without status SKIP @third', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });
});

test.describe('skip testing conditions: [rule 3]', () => {
  test('test without status SKIP @first', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });

  test.skip('test with status SKIP @second', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });

  test('test without status SKIP @third', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('https://my.start.url/');
  });
});

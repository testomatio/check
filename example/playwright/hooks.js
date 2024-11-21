const { test, expect } = require('@playwright/test');
test.describe('feature test hooks', () => {
    test.beforeAll('run before', async () => {
        console.log('Ran before');
        await page.locator('#btnBeforeAll').click();
    });
    
    test.beforeEach(async ({ page }) => {
        console.log('Ran beforeEach');
        await page.locator('#btnBeforeEach').click();
    });
  
    test('my test #1', async ({ page }) => {
        expect(page.url()).toBe('https://www.programsbuzz.com/');
    });

    test('my test #2', async ({ page }) => {
        expect(page.url()).toBe('https://www.programsbuzz.com/');
    });

    test.afterAll(async () => {
        console.log('Ran afterAll');
        await page.locator('#btnafterAll').click();
    });
});
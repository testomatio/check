import { test as base } from '@playwright/test';
import { test } from '@playwright/test';

const customTestName = base.extend<{ someFixture: any }>({
  someFixture: async ({}, use) => {
    console.log('custom fixture called');
    await use({ name: 'custom fixture name', value: 'custom fixture value' });
  },
});

customTestName('custom test name is parsed', async ({ someFixture }) => {
  console.warn(someFixture.name);
  console.warn(someFixture.value);
});

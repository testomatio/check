import { test } from '@playwright/test';

test('test with single tag on the same line', { tag: '@smoke' }, async () => {
  // test code
});

test(
  'test with single tag and opening brace on the same line',
  {
    tag: '@smoke',
  },
  async () => {
    // test code
  },
);

test(
  'test with single tag and opening tag brace on next line',
  {
    tag: '@smoke',
  },
  async () => {
    // test code
  },
);

test(
  'test with multiple tags',
  {
    tag: ['@smoke', '@regression'],
  },
  async () => {
    // test code
  },
);

test(
  'test with multiple tags on multiple lines',
  {
    tag: ['@smoke', '@regression', '@windows'],
  },
  async () => {
    // test code
  },
);

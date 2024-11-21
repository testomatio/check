import { test, expect } from '@playwright/test';

const testCases = [1, 2, 3];
const pages = ['one', 'two'];

let i = 0;
test.describe('pages', () => {
  testCases.forEach(() => {
    i++;
    pages.forEach((pageUrl: any) => {
      i++;
      test(`check ${i} on "${pageUrl}" page`, async ({}) => {});
    });
  });
});

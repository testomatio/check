import test from '@playwright/test';

test.describe('first test suite @first', () => {
  test('test case 1', () => {
    const a = 1;
  });
  test('test case 2', () => {
    const a = 1;
  });
});

test.describe('second test suite @second', () => {
  test('test case 3', () => {
    const a = 1;
  });
  test('test case 4', () => {
    const a = 1;
  });
});

test('test case 5 @sanity', () => {
  const a = 1;
});

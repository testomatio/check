import test from '@playwright/test';

test(
  'test with a single annotation',
  {
    annotation: {
      type: 'annotation type',
      description: 'annotation description',
    },
  },
  async ({ page }) => {},
);

test(
  'test with multiple annotations',
  {
    annotation: [
      {
        type: 'annotationType1',
        description: 'annotationDescription1',
      },
      {
        type: 'annotationType2',
        description: 'annotationDescription2',
      },
    ],
  },
  async ({ page }) => {},
);

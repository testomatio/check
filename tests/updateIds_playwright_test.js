/* eslint-disable no-template-curly-in-string */
const { expect } = require('chai');
const fs = require('fs');
const { updateIds, cleanIds } = require('../src/updateIds');
const Analyzer = require('../src/analyzer');

describe('update ids tests(playwright adapter)', () => {
  before(() => {
    if (!fs.existsSync('virtual_dir')) fs.mkdirSync('virtual_dir');
  });

  describe('[Playwright examples] includes/no includes main suite', () => {
    it('[ts file]: test file includes suite with tests', () => {
      const analyzer = new Analyzer('playwright', 'virtual_dir');
      analyzer.withTypeScript();
      require('@babel/core');

      const idMap = {
        tests: {
          'basic test case #1.1': '@T1d52b111',
          'basic test case #1.2': '@T1d52b112',
        },
        suites: {
          'Suite main': '@Sf3d245a7',
        },
      };

      fs.writeFileSync(
        'virtual_dir/test.ts',
        `
          let basic = 'test';

          test.describe('Suite main', () => {          
            test('basic test case #1.1', async ({ page }) => {
              let myVar = "msg";

              await test.step('[Check 1] Open page and confirm title', async () => {
                await page.goto("https://todomvc.com/examples/vanilla-es6/");
              });
            });
            test('basic test case #1.2', async ({ page }) => {
              await test.step('[Check 1] Open page and confirm title', async () => {
                await page.goto("https://todomvc.com/examples/vanilla-es6/");
              });
            });
          });`,
      );
      analyzer.analyze('test.ts');
      updateIds(analyzer.rawTests, idMap, 'virtual_dir', { typescript: true });

      const updatedFile = fs.readFileSync('virtual_dir/test.ts', 'utf-8').toString();

      expect(updatedFile).to.include("test.describe('Suite main @Sf3d245a7', ()");
      expect(updatedFile).to.include("test('basic test case #1.1 @T1d52b111'");
      expect(updatedFile).to.include("test('basic test case #1.2 @T1d52b112'");
    });

    it('[ts file]: test file does not include suite name, only tests', () => {
      const analyzer = new Analyzer('playwright', 'virtual_dir');
      analyzer.withTypeScript();
      require('@babel/core');

      const idMap = {
        tests: {
          'basic test case #1.1': '@T1d52b111',
          'basic test case #1.2': '@T1d52b112',
        },
      };

      fs.writeFileSync(
        'virtual_dir/test.ts',
        `         
            test('basic test case #1.1', async ({ page }) => {
              let myVar = "msg";

              await test.step('[Check 1] Open page and confirm title', async () => {
                await page.goto("https://todomvc.com/examples/vanilla-es6/");
              });
            });
            test('basic test case #1.2', async ({ page }) => {
              await test.step('[Check 1] Open page and confirm title', async () => {
                await page.goto("https://todomvc.com/examples/vanilla-es6/");
              });
            });`,
      );

      analyzer.analyze('test.ts');
      updateIds(analyzer.rawTests, idMap, 'virtual_dir', { typescript: true });

      const updatedFile = fs.readFileSync('virtual_dir/test.ts', 'utf-8').toString();

      expect(updatedFile).to.include("test('basic test case #1.1 @T1d52b111'");
      expect(updatedFile).to.include("test('basic test case #1.2 @T1d52b112'");
    });

    it('[ts file]: test file test.describe.parallel mode should returns updated title.', () => {
      const analyzer = new Analyzer('playwright', 'virtual_dir');
      analyzer.withTypeScript();
      require('@babel/core');

      const idMap = {
        tests: {
          'basic test case #1': '@T1d52b111',
        },
        suites: {
          'Main suite parallel option': '@Sf3d245a7',
        },
      };

      fs.writeFileSync(
        'virtual_dir/test.ts',
        `
          test.describe.parallel('Main suite parallel option', () => {          
            test('basic test case #1', async ({ page }) => {
              await test.step('[Check 1] Open page and confirm title', async () => {
                await page.goto("https://todomvc.com/examples/vanilla-es6/");
              });
            });
          });`,
      );

      analyzer.analyze('test.ts');
      updateIds(analyzer.rawTests, idMap, 'virtual_dir', { typescript: true });

      const updatedFile = fs.readFileSync('virtual_dir/test.ts', 'utf-8').toString();

      expect(updatedFile).to.include("test.describe.parallel('Main suite parallel option @Sf3d245a7', ()");
    });
  });

  describe('[Playwright examples] lines processing', () => {
    it('[ts file]: the same import name as suite name', () => {
      const analyzer = new Analyzer('playwright', 'virtual_dir');
      analyzer.withTypeScript();
      require('@babel/core');

      const idMap = {
        tests: {
          'Example test case #1': '@T1d6a52b9',
        },
        suites: {
          Example: '@Sf3d245a7',
        },
      };

      fs.writeFileSync(
        'virtual_dir/test.ts',
        `
          import { test, page } from '@playwright/test';
          import Example from '@src/Example';

          const userId = 1;

          test.describe('Example', () => {          
            test('Example test case #1', async ({ page }) => {
              const opts = {"a": 1, "b": 2};

              await test.step('[Check 1] Open Example page and confirm title', async () => {
                await page.goto("https://todomvc.com/examples/vanilla-es6/");
              });
            });
          });`,
      );

      analyzer.analyze('test.ts');
      updateIds(analyzer.rawTests, idMap, 'virtual_dir', { typescript: true });

      const updatedFile = fs.readFileSync('virtual_dir/test.ts', 'utf-8').toString();

      expect(updatedFile).to.include("import { test, page } from '@playwright/test';");
      expect(updatedFile).to.include("import Example from '@src/Example';");
      expect(updatedFile).to.include("test.describe('Example @Sf3d245a7'");
      expect(updatedFile).to.include("test('Example test case #1 @T1d6a52b9'");
      expect(updatedFile).to.include("test.step('[Check 1] Open Example page and confirm title'");
    });

    it('[ts file]: test file without imports should update only suite & test name', () => {
      const analyzer = new Analyzer('playwright', 'virtual_dir');
      analyzer.withTypeScript();
      require('@babel/core');

      const idMap = {
        tests: {
          'Example test case #1.1': '@T1d6a52b911',
        },
        suites: {
          Example: '@Sf3d245a7',
        },
      };

      fs.writeFileSync(
        'virtual_dir/test.ts',
        `
          let Example = 'test';

          test.describe('Example', () => {          
            test('Example test case #1.1', async ({ page }) => {
              let myVar = "msg";

              await test.step('[Check 1] Open page and confirm title', async () => {
                await page.goto("https://todomvc.com/examples/vanilla-es6/");
              });
            });
          });`,
      );

      analyzer.analyze('test.ts');
      updateIds(analyzer.rawTests, idMap, 'virtual_dir', { typescript: true });

      const updatedFile = fs.readFileSync('virtual_dir/test.ts', 'utf-8').toString();

      expect(updatedFile).to.include("let Example = 'test';");
      expect(updatedFile).to.include("test.describe('Example @Sf3d245a7'");
      expect(updatedFile).to.include("test('Example test case #1.1 @T1d6a52b911'");
    });

    it('[js file]: the same require name as suite name', () => {
      const analyzer = new Analyzer('playwright', 'virtual_dir');

      const idMap = {
        tests: {
          'test case #2': '@T1d6a52b11',
        },
        suites: {
          Example1: '@Sf3d245a71',
        },
      };

      fs.writeFileSync(
        'virtual_dir/test.js',
        `
          const { test, expect } = require('@playwright/test');
          const Example2 = require('@src/Example1');
          var Example1 = require('@src/lib/Example2');

          test.describe('Example1', () => {          
            test('test case #2', async ({ page }) => {

              await test.step('[Check 1] Open page and confirm title', async () => {
                await page.goto("https://todomvc.com/examples/vanilla-es6/");
              });
            });
          });
          let str = "some test case message";
          `,
      );

      analyzer.analyze('test.js');

      updateIds(analyzer.rawTests, idMap, 'virtual_dir');

      const updatedFile = fs.readFileSync('virtual_dir/test.js').toString();

      expect(updatedFile).to.include("const Example2 = require('@src/Example1')");
      expect(updatedFile).to.include("var Example1 = require('@src/lib/Example2');");
      expect(updatedFile).to.include("test.describe('Example1 @Sf3d245a71'");
      expect(updatedFile).to.include("test('test case #2 @T1d6a52b11'");
      expect(updatedFile).to.include('let str = "some test case message";');
    });

    it('[js file]: suite name as a new line', () => {
      const analyzer = new Analyzer('playwright', 'virtual_dir');

      const idMap = {
        tests: {
          'test case #3': '@T1d6a52b119',
        },
        suites: {
          'suite name': '@Sf3d245a719',
        },
      };

      fs.writeFileSync(
        'virtual_dir/test.js',
        `
          const { test, expect } = require('@playwright/test');

          test.describe(
            'suite name',
            () => {          
            test('test case #3', async ({ page }) => {

              await test.step('[Check 1] Open page and confirm title', async () => {
                await page.goto("https://todomvc.com/examples/vanilla-es6/");
              });
            });
          });
          `,
      );

      analyzer.analyze('test.js');

      updateIds(analyzer.rawTests, idMap, 'virtual_dir');

      const updatedFile = fs.readFileSync('virtual_dir/test.js').toString();

      expect(updatedFile).to.include("const { test, expect } = require('@playwright/test');");
      expect(updatedFile).to.include('test.describe(');
      expect(updatedFile).to.include("'suite name @Sf3d245a719',");
      expect(updatedFile).to.include("test('test case #3 @T1d6a52b119', async ({ page }) => {");
    });

    it('test.skip() annotation inside a test is propersly processed', () => {
      const analyzer = new Analyzer('playwright', 'virtual_dir');

      const idMap = {
        tests: {
          'test case #4': '@T1d6a52b119',
        },
        suites: {
          'suite name': '@Sf3d245a719',
        },
      };

      fs.writeFileSync(
        'virtual_dir/test.js',
        `
          const { test, expect } = require('@playwright/test');
            test('test case #4', async ({ page }) => {
              test.skip(1 === 1);
            });
          `,
      );

      analyzer.analyze('test.js');

      updateIds(analyzer.rawTests, idMap, 'virtual_dir');

      const updatedFile = fs.readFileSync('virtual_dir/test.js').toString();

      expect(updatedFile).to.include("test('test case #4 @T1d6a52b119', async ({ page }) => {");
    });
  });

  describe('[Playwright examples] clean-ids for the --typescript mode', () => {
    it('can remove ids from the file with suite', () => {
      let analyzer = new Analyzer('playwright', 'virtual_dir');
      analyzer.withTypeScript();
      require('@babel/core');

      fs.writeFileSync(
        'virtual_dir/test.ts',
        `
          import { test, expect } from '@playwright/test';
          
          test.describe("basic suite @Sf3d245a7", function () {
            test("basic test @T1d6a52b9", async ({ page }) => {
              await page.goto('https://todomvc.com/examples/vanilla-es6/');

              const inputBox = page.locator('input.new-todo');
            });
          })`,
      );
      analyzer.analyze('test.ts');

      cleanIds(analyzer.rawTests, {}, 'virtual_dir', {
        dangerous: true,
        typescript: true,
      });

      const updatedFile = fs.readFileSync('virtual_dir/test.ts', 'utf-8').toString();
      // suite section
      expect(updatedFile).to.include('test.describe("basic suite", function () {');
      expect(updatedFile).not.to.include('@Sf3d245a7');
      // test setion
      expect(updatedFile).to.include('test("basic test", async ({ page }) => {');
      expect(updatedFile).not.to.include('@T1d6a52b9');
    });

    it('can remove ids if no suites in the file', () => {
      let analyzer = new Analyzer('playwright', 'virtual_dir');
      analyzer.withTypeScript();
      require('@babel/core');

      fs.writeFileSync(
        'virtual_dir/test.ts',
        `
          import { test, expect } from '@playwright/test';

          test("basic test @T1d6a52b9", async ({ page }) => {
            await page.goto('https://todomvc.com/examples/vanilla-es6/');

            const inputBox = page.locator('input.new-todo');
          });`,
      );

      analyzer.analyze('test.ts');

      cleanIds(analyzer.rawTests, {}, 'virtual_dir', {
        dangerous: true,
        typescript: true,
      });

      const updatedFile = fs.readFileSync('virtual_dir/test.ts', 'utf-8').toString();
      // test setion
      expect(updatedFile).to.include('test("basic test", async ({ page })');
      expect(updatedFile).not.to.include('@T1d6a52b9');
    });
  });
});

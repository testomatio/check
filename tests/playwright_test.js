const jsParser = require('@babel/parser');
const tsParser = require('@typescript-eslint/typescript-estree');
const fs = require('fs');
const { expect } = require('chai');
const playwrightParser = require('../src/lib/frameworks/playwright');
const { assert } = require('console');

let source;
let ast;

describe('playwright parser', () => {
  it('should parse basic playwright-js tests', () => {
    source = fs.readFileSync('./example/playwright/basic.js').toString();
    ast = jsParser.parse(source, { sourceType: 'unambiguous' });
    const tests = playwrightParser(ast, '', source);
    expect(tests[0]).to.include.key('code');
    expect(tests.length).to.equal(4);
    expect(tests[0].code).to.include("test('basic");
    expect(tests[0].name).to.equal('basic test');
  });

  it('should forbid describe.only tests', () => {
    source = `
test.describe.only('my test', () => {
  test('my test', async ({ page }) => {
    await page.goto('https://playwright.dev/');
  });
}); 
    `;

    const program = tsParser.parse(source, {
      sourceType: 'unambiguous',
      loc: true,
      range: true,
      tokens: true,
    });
    ast = {
      program,
      type: 'File',
    };
    try {
      playwrightParser(ast, '', source);
      assert.fail('Expected an error');
    } catch (err) {
      expect(err.message).to.include('Exclusive tests detected');
    }
  });

  it('should parse basic playwright-ts tests', () => {
    source = fs.readFileSync('./example/playwright/basic.ts').toString();
    const program = tsParser.parse(source, {
      sourceType: 'unambiguous',
      loc: true,
      range: true,
      tokens: true,
    });
    ast = {
      program,
      type: 'File',
    };
    const tests = playwrightParser(ast, '', source);
    expect(tests[0]).to.include.key('code');
    expect(tests.length).to.equal(1);
    expect(tests[0].code).to.include("test('basic");
    expect(tests[0].name).to.equal('basic test');
  });

  it('should parse multiple playwright-js tests', () => {
    source = fs.readFileSync('./example/playwright/multiple.js').toString();
    ast = jsParser.parse(source, { sourceType: 'unambiguous' });
    const tests = playwrightParser(ast, '', source);
    expect(tests[0]).to.include.key('code');
    expect(tests.length).to.equal(2);
    expect(tests[0].code).to.include("test('my test");
    expect(tests[0].name).to.equal('my test');
    expect(tests[0].suites.length).to.eql(1);
    expect(tests[0].suites[0]).to.eql('feature foo');
    expect(tests[1].suites[0]).to.eql('feature foo');
  });

  it('should parse multiple playwright-ts tests', () => {
    source = fs.readFileSync('./example/playwright/multiple.ts').toString();
    const program = tsParser.parse(source, {
      sourceType: 'unambiguous',
      loc: true,
      range: true,
      tokens: true,
    });
    ast = {
      program,
      type: 'File',
    };
    const tests = playwrightParser(ast, '', source);
    expect(tests[0]).to.include.key('code');
    expect(tests.length).to.equal(2);
    expect(tests[0].code).to.include("test('my test");
    expect(tests[0].name).to.equal('my test');
    expect(tests[0].suites.length).to.eql(1);
    expect(tests[0].suites[0]).to.eql('feature foo');
  });

  it('should update playwright suite if no suite set', () => {
    source = fs.readFileSync('./example/playwright/tags-in-title.js').toString();
    ast = jsParser.parse(source, { sourceType: 'unambiguous' });
    const tests = playwrightParser(ast, '', source);
    expect(tests[0]).to.include.key('code');
    expect(tests.length).to.equal(5);
    const lastTest = tests[tests.length - 1];
    expect(lastTest.suites.length).to.eql(0);
  });

  describe('tags', () => {
    it('should parse playwright-ts test with signle tag on the same line', () => {
      source = fs.readFileSync('./example/playwright/tags.ts').toString();
      const program = tsParser.parse(source, {
        sourceType: 'unambiguous',
        loc: true,
        range: true,
        tokens: true,
      });
      ast = {
        program,
        type: 'File',
      };
      const tests = playwrightParser(ast, '', source);

      expect(tests[0].tags).to.have.all.members(['smoke']);
    });

    it('should parse playwright-ts test with opening brace on the same line and signle tag on the next line', () => {
      source = fs.readFileSync('./example/playwright/tags.ts').toString();
      const program = tsParser.parse(source, {
        sourceType: 'unambiguous',
        loc: true,
        range: true,
        tokens: true,
      });
      ast = {
        program,
        type: 'File',
      };
      const tests = playwrightParser(ast, '', source);

      expect(tests[1].tags).to.have.all.members(['smoke']);
    });

    it('should parse playwright-ts test with signle tag on the next line', () => {
      source = fs.readFileSync('./example/playwright/tags.ts').toString();
      const program = tsParser.parse(source, {
        sourceType: 'unambiguous',
        loc: true,
        range: true,
        tokens: true,
      });
      ast = {
        program,
        type: 'File',
      };
      const tests = playwrightParser(ast, '', source);

      expect(tests[2].tags).to.have.all.members(['smoke']);
    });

    it('should parse playwright-js test with multiple tags', () => {
      source = fs.readFileSync('./example/playwright/tags.ts').toString();
      const program = tsParser.parse(source, {
        sourceType: 'unambiguous',
        loc: true,
        range: true,
        tokens: true,
      });
      ast = {
        program,
        type: 'File',
      };
      const tests = playwrightParser(ast, '', source);

      expect(tests[3].tags).to.have.all.members(['smoke', 'regression']);
    });

    it('should parse playwright-js test with multiple tags on multiple lines', () => {
      source = fs.readFileSync('./example/playwright/tags.ts').toString();
      const program = tsParser.parse(source, {
        sourceType: 'unambiguous',
        loc: true,
        range: true,
        tokens: true,
      });
      ast = {
        program,
        type: 'File',
      };
      const tests = playwrightParser(ast, '', source);

      expect(tests[4].tags).to.have.all.members(['smoke', 'regression', 'windows']);
    });
  });
  it('should parse playwright-ts tests with params', () => {
    source = fs.readFileSync('./example/playwright/params.ts').toString();
    const program = tsParser.parse(source, {
      sourceType: 'unambiguous',
      loc: true,
      range: true,
      tokens: true,
    });
    ast = {
      program,
      type: 'File',
    };
    const tests = playwrightParser(ast, '', source);

    expect(tests[0].name).to.equal('check ${i} on "${pageUrl}" page');
  });

  it('should parse playwright-js tests with annotation', () => {
    source = fs.readFileSync('./example/playwright/annotations.js').toString();
    ast = jsParser.parse(source, { sourceType: 'unambiguous' });
    const tests = playwrightParser(ast, '', source);

    expect(tests[1].code.trim()).to.equal("test.skip('my skip test @first', async ({ page }) => {".trim());
    expect(tests[1].name).to.equal('my skip test @first');
    expect(tests[1].suites.length).to.eql(1);
  });

  it('should parse playwright-js tests with annotation including fixme', () => {
    source = fs.readFileSync('./example/playwright/annotations.js').toString();
    ast = jsParser.parse(source, { sourceType: 'unambiguous' });
    const tests = playwrightParser(ast, '', source);

    expect(tests[2].code.trim()).to.equal("test.fixme('my fixme test @third', async ({ page }) => {".trim());
    expect(tests[2].name).to.equal('my fixme test @third');
    expect(tests[2].suites.length).to.eql(1);
  });

  it('should parse playwright-ts tests with annotations', () => {
    source = fs.readFileSync('./example/playwright/annotations.ts').toString();
    const program = tsParser.parse(source, {
      sourceType: 'unambiguous',
      loc: true,
      range: true,
      tokens: true,
    });
    ast = {
      program,
      type: 'File',
    };
    const tests = playwrightParser(ast, '', source);

    expect(tests[1].code).to.include("test.skip('my skip test @first");
    expect(tests[1].name).to.equal('my skip test @first');

    expect(tests[2].code).to.include("test.fixme('my fixme test @third");
    expect(tests[2].name).to.equal('my fixme test @third');
  });

  it('should parse playwright test with test.skip annotation inside a test', () => {
    source = fs.readFileSync('./example/playwright/annotations.ts').toString();
    const program = tsParser.parse(source, {
      sourceType: 'unambiguous',
      loc: true,
      range: true,
      tokens: true,
    });
    ast = {
      program,
      type: 'File',
    };
    const tests = playwrightParser(ast, '', source);

    expect(tests[3].code).to.include("test('test with test.skip annonation inside', async () => {");
    expect(tests[3].name).to.equal('test with test.skip annonation inside');
  });

  it('should parse playwright-js tests with skip() annotation for the description and test sections', () => {
    source = fs.readFileSync('./example/playwright/skip.js').toString();
    ast = jsParser.parse(source, { sourceType: 'unambiguous' });
    const tests = playwrightParser(ast, '', source);
    // Condition 1: test.describe.skip => all inner tests skipped
    expect(tests[0].skipped).to.be.true;
    expect(tests[1].skipped).to.be.true;
    expect(tests[2].skipped).to.be.true;
    // Condition 2: test.describe.skip + 1 inner skip => all inner tests skipped
    expect(tests[3].skipped).to.be.true;
    expect(tests[4].skipped).to.be.false;
    expect(tests[5].skipped).to.be.true;
    // Condition 3: 1 inner skip => only 1 skipped
    expect(tests[6].skipped).to.be.false;
    expect(tests[7].skipped).to.be.false;
    expect(tests[8].skipped).to.be.false;
  });

  it('should parse playwright-js tests with fixme() annotation for the description and test sections', () => {
    source = fs.readFileSync('./example/playwright/fixme.js').toString();
    ast = jsParser.parse(source, { sourceType: 'unambiguous' });
    const tests = playwrightParser(ast, '', source);
    // Condition 1: test.describe.fixme => all inner tests skipped
    expect(tests[0].skipped).to.be.true;
    expect(tests[1].skipped).to.be.true;
    expect(tests[2].skipped).to.be.true;
    // Condition 2: test.describe.fixme + 1 inner fixme + 1 inner skip => all inner tests skipped
    expect(tests[3].skipped).to.be.true;
    expect(tests[4].skipped).to.be.false;
    expect(tests[5].skipped).to.be.false;
    // Condition 3: 1 inner fixme => only 1 skipped
    expect(tests[6].skipped).to.be.false;
    expect(tests[7].skipped).to.be.false;
    expect(tests[8].skipped).to.be.false;
  });

  context('Parse Playwright hooks code - default opts', () => {
    let fileSource, fileAst;
    before(() => {
      fileSource = fs.readFileSync('./example/playwright/hooks.js').toString();
      fileAst = jsParser.parse(fileSource, { sourceType: 'unambiguous' });
    });

    it('should include beforeAll hook code', () => {
      const tests = playwrightParser(fileAst, '', fileSource);
      // first test
      expect(tests[0].code).to.include("test.beforeAll('run before', async () => {\n");
      expect(tests[0].code).to.include("console.log('Ran before');\n");
      expect(tests[0].code).to.include("await page.locator('#btnBeforeAll').click();\n");
      // second test
      expect(tests[1].code).to.include("test.beforeAll('run before', async () => {\n");
      expect(tests[1].code).to.include("console.log('Ran before');\n");
      expect(tests[1].code).to.include("await page.locator('#btnBeforeAll').click();\n");
    });

    it('should include beforeEach hook code', () => {
      const tests = playwrightParser(fileAst, '', fileSource);
      // first test
      expect(tests[0].code).to.include('test.beforeEach(async ({ page }) => {\n');
      expect(tests[0].code).to.include("console.log('Ran beforeEach');\n");
      expect(tests[0].code).to.include("await page.locator('#btnBeforeEach').click();\n");
      // second test
      expect(tests[1].code).to.include('test.beforeEach(async ({ page }) => {\n');
      expect(tests[1].code).to.include("console.log('Ran beforeEach');\n");
      expect(tests[1].code).to.include("await page.locator('#btnBeforeEach').click();\n");
    });

    it('should include afterAll hook code', () => {
      const tests = playwrightParser(fileAst, '', fileSource);
      // first test
      expect(tests[0].code).to.include('test.afterAll(async () => {\n');
      expect(tests[0].code).to.include("console.log('Ran afterAll');\n");
      expect(tests[0].code).to.include("await page.locator('#btnafterAll').click();\n");
      // second test
      expect(tests[1].code).to.include('test.afterAll(async () => {\n');
      expect(tests[1].code).to.include("console.log('Ran afterAll');\n");
      expect(tests[1].code).to.include("await page.locator('#btnafterAll').click();\n");
    });
  });

  context('[opts.noHooks = true] Parse Playwright hooks code', () => {
    let fileSource, fileAst;
    before(() => {
      fileSource = fs.readFileSync('./example/playwright/hooks.js').toString();
      fileAst = jsParser.parse(fileSource, { sourceType: 'unambiguous' });
    });

    it('should exclude beforeAll hook code', () => {
      const tests = playwrightParser(fileAst, '', fileSource, { noHooks: true });
      // first test
      expect(tests[0].code).to.not.include("test.beforeAll('run before', async () => {\n");
      // second test
      expect(tests[1].code).to.not.include("test.beforeAll('run before', async () => {\n");
    });

    it('should exclude beforeEach hook code', () => {
      const tests = playwrightParser(fileAst, '', fileSource, { noHooks: true });
      // first test
      expect(tests[0].code).to.not.include('test.beforeEach(async ({ page }) => {\n');
      // second test
      expect(tests[1].code).to.not.include('test.beforeEach(async ({ page }) => {\n');
    });

    it('should exclude afterAll hook code', () => {
      const tests = playwrightParser(fileAst, '', fileSource, { noHooks: true });
      // first test
      expect(tests[0].code).to.not.include('test.afterAll(async () => {\n');
      // second test
      expect(tests[1].code).to.not.include('test.afterAll(async () => {\n');
    });
  });

  context('Default playwright file parsing ', () => {
    it('should parse basic playwright-ts DEMO tests ("todo" name as part of inner function args)', () => {
      const fileSource = fs.readFileSync('./example/playwright/demo-todo.ts').toString();
      const program = tsParser.parse(fileSource, {
        sourceType: 'unambiguous',
        loc: true,
        range: true,
        tokens: true,
      });
      const fileAst = {
        program,
        type: 'File',
      };

      const tests = playwrightParser(fileAst, '', fileSource);

      expect(tests[0]).to.include.key('code');
      expect(tests[0].suites[0]).to.equal('Mark all as completed');
      expect(tests[0].name).to.equal('should allow me to mark all items as completed');
    });

    it('should return suite name if used test.describe without parallel mode', () => {
      source = fs.readFileSync('./example/playwright/basic.js').toString();
      ast = jsParser.parse(source, { sourceType: 'unambiguous' });
      const tests = playwrightParser(ast, '', source);

      expect(tests[1].suites[0]).to.equal('Main suite no parallel');
    });

    it('should return suite name if used test.describe.parallel mode', () => {
      source = fs.readFileSync('./example/playwright/basic.js').toString();
      ast = jsParser.parse(source, { sourceType: 'unambiguous' });
      const tests = playwrightParser(ast, '', source);

      expect(tests[2].suites[0]).to.equal('Main suite parallel option');
    });
    it('should return suite name if used test.describe.serial mode', () => {
      source = fs.readFileSync('./example/playwright/basic.js').toString();
      ast = jsParser.parse(source, { sourceType: 'unambiguous' });
      const tests = playwrightParser(ast, '', source);

      expect(tests[3].suites[0]).to.equal('Main suite serial option');
    });
  });

  context('test with --line-numbers option', () => {
    let fileSource, fileAst;

    before(() => {
      fileSource = fs.readFileSync('./example/playwright/hooks.js').toString();
      fileAst = jsParser.parse(fileSource, { sourceType: 'unambiguous' });
    });

    it('[lineNumbers=true opts] each section should include line-number as part of code section', () => {
      const tests = playwrightParser(fileAst, '', fileSource, { lineNumbers: true });
      // first test only
      expect(tests[0].code).to.include("13:     test('my test #1', async ({ page }) => {\n");
      expect(tests[0].code).to.include("14:         expect(page.url()).toBe('https://www.programsbuzz.com/');\n");
      // by default hooks include line number too
      expect(tests[0].code).to.include('8:     test.beforeEach(async ({ page }) => {\n');
      expect(tests[0].code).to.include("3:     test.beforeAll('run before', async () => {\n");
      expect(tests[0].code).to.include('21:     test.afterAll(async () => {\n');
      // second test
      expect(tests[1].code).to.include("17:     test('my test #2', async ({ page }) => {\n");
    });

    it('[no SET the lineNumbers opts] should exclude line-number', () => {
      const tests = playwrightParser(fileAst, '', fileSource);
      // first test only
      expect(tests[0].code).to.not.include("13:     test('my test #1', async ({ page }) => {\n");
      // no lines
      expect(tests[0].code).to.include("test('my test #1', async ({ page }) => {\n");
    });
    // multiple options
    it('[noHooks=true + lineNumbers=true opts] line-number as part of code section', () => {
      const tests = playwrightParser(fileAst, '', fileSource, { lineNumbers: true, noHooks: true });
      // first test only
      expect(tests[0].code).to.include("13:     test('my test #1', async ({ page }) => {\n");
      // no includes hook code
      expect(tests[0].code).to.not.include('8:     test.beforeEach(async ({ page }) => {\n');
    });
  });
});

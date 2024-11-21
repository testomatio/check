const parser = require('@babel/parser');
const fs = require('fs');
const { expect } = require('chai');
const jestParser = require('../src/lib/frameworks/jest');

let source;
let ast;

describe('jest parser', () => {
  context('jest tests', () => {
    before(() => {
      source = fs.readFileSync('./example/jest/vue.spec.js').toString();
      ast = parser.parse(source);
    });

    it('should parse jest file', () => {
      const tests = jestParser(ast);

      const actualTests = tests.filter(t => !t.skipped).map(t => t.name);
      const skippedTests = tests.filter(t => t.skipped).map(t => t.name);

      expect(actualTests).to.include('base');
      expect(actualTests).to.include('history mode');
      expect(actualTests).to.include('file should exist');
      expect(actualTests).to.include('%i file should exist (it.each)');

      expect(skippedTests).to.include('skip: use with Babel (test)');
      expect(skippedTests).to.include('skip: use with Babel (it)');
      expect(skippedTests).to.include('skip: %i file should exist (it.each)');
      expect(skippedTests).to.include('skip: %i file should exist (test.each)');

      expect(actualTests).to.have.lengthOf(4);
      expect(skippedTests).to.have.lengthOf(4);
    });

    it('should include code', () => {
      const tests = jestParser(ast, '', source);
      expect(tests[0]).to.include.key('code');
      expect(tests[0].code).to.include("test('base'");
    });
  });

  context('exclusive tests', () => {
    before(() => {
      source = fs.readFileSync('./example/jest/vue.spec.only.js').toString();
      ast = parser.parse(source);
    });

    it('should throw an error if a file contains .only', () => {
      const parse = () => jestParser(ast);

      expect(parse).to.throw(
        'Exclusive tests detected. `.only` call found in ' + ':1\n' + 'Remove `.only` to restore test checks',
      );
    });
  });

  context('hooks tests - default opts', () => {
    before(() => {
      source = fs.readFileSync('./example/jest/hooks.spec.js').toString();
      ast = parser.parse(source);
    });

    it('should include beforeAll hook code', () => {
      const tests = jestParser(ast, '', source);
      // first test
      expect(tests[0].code).to.include('beforeAll(() => {\n');
      expect(tests[0].code).to.include("console.log('Ran beforeAll');\n");
      expect(tests[0].code).to.include('expect(foods[1]).toBeTruthy();\n');
      // second test
      expect(tests[1].code).to.include('beforeAll(() => {\n');
      expect(tests[1].code).to.include("console.log('Ran beforeAll');\n");
      expect(tests[1].code).to.include('expect(foods[1]).toBeTruthy();\n');
    });

    it('should include beforeEach hook code', () => {
      const tests = jestParser(ast, '', source);
      // first test
      expect(tests[0].code).to.include('beforeEach(() => {\n');
      expect(tests[0].code).to.include("console.log('Ran beforeEach');\n");
      expect(tests[0].code).to.include('expect(foods[2]).toBeTruthy();\n');
      // second test
      expect(tests[1].code).to.include('beforeEach(() => {\n');
      expect(tests[1].code).to.include("console.log('Ran beforeEach');\n");
      expect(tests[1].code).to.include('expect(foods[2]).toBeTruthy();\n');
    });

    it('should include afterAll hook code', () => {
      const tests = jestParser(ast, '', source);
      // first test
      expect(tests[0].code).to.include('afterAll(() => {\n');
      expect(tests[0].code).to.include("console.log('Ran afterAll');\n");
      expect(tests[0].code).to.include('expect(foods[0]).toBeTruthy();\n');
      // second test
      expect(tests[1].code).to.include('afterAll(() => {\n');
      expect(tests[1].code).to.include("console.log('Ran afterAll');\n");
      expect(tests[1].code).to.include('expect(foods[0]).toBeTruthy();\n');
    });
  });

  context('[opts.noHooks = true] hooks tests', () => {
    let fileSource, fileAst;

    before(() => {
      fileSource = fs.readFileSync('./example/jest/hooks.spec.js').toString();
      fileAst = parser.parse(source);
    });

    it('should exclude beforeAll hook code', () => {
      const tests = jestParser(fileAst, '', fileSource, { noHooks: true });
      // first test
      expect(tests[0].code).to.not.include('beforeAll(() => {\n');
      expect(tests[0].code).to.include("test('Vienna <3 veal', async () => {\n");
      // second test
      expect(tests[1].code).to.not.include('before(() => {\n');
      expect(tests[1].code).to.include("test('San Juan <3 plantains', async () => {\n");
    });

    it('should exclude beforeEach hook code', () => {
      const tests = jestParser(fileAst, '', fileSource, { noHooks: true });
      // first test
      expect(tests[0].code).to.not.include('beforeEach(() => {\n');
      // second test
      expect(tests[1].code).to.not.include('beforeEach(() => {\n');
    });

    it('should exclude after hook code', () => {
      const tests = jestParser(fileAst, '', fileSource, { noHooks: true });
      // first test
      expect(tests[0].code).to.not.include('afterAll(() => {\n');
      // second test
      expect(tests[1].code).to.not.include('afterAll(() => {\n');
    });
  });

  context('test with --line-numbers option', () => {
    let fileSource, fileAst;

    before(() => {
      fileSource = fs.readFileSync('./example/jest/hooks.spec.js').toString();
      fileAst = parser.parse(source);
    });

    it('[lineNumbers=true opts] each section should include line-number as part of code section', () => {
      const tests = jestParser(fileAst, '', fileSource, { lineNumbers: true });
      // first test only
      expect(tests[0].code).to.include("14:     test('Vienna <3 veal', async () => {\n");
      expect(tests[0].code).to.include('15:         const { foods, pkg } = await generateWithPlugin({\n');
      // by default hooks include line number too
      expect(tests[0].code).to.include('9:     beforeEach(() => {\n');
      expect(tests[0].code).to.include('4:     beforeAll(() => {\n');
      expect(tests[0].code).to.include('30:     afterAll(() => {\n');
      // second test
      expect(tests[1].code).to.include("24:     test('San Juan <3 plantains', async () => {\n");
    });

    it('[no SET the lineNumbers opts] should exclude line-number', () => {
      const tests = jestParser(fileAst, '', fileSource);
      // first test only
      expect(tests[0].code).to.not.include("14:     test('Vienna <3 veal', async () => {\n");
      // no lines
      expect(tests[0].code).to.include("test('Vienna <3 veal', async () => {\n");
    });

    // multiple options
    it('[noHooks=true + lineNumbers=true opts] line-number as part of code section', () => {
      const tests = jestParser(fileAst, '', fileSource, { lineNumbers: true, noHooks: true });
      // first test only
      expect(tests[0].code).to.include("14:     test('Vienna <3 veal', async () => {\n");
      // no includes hook code
      expect(tests[0].code).to.not.include('4:     beforeAll(() => {\n');
    });
  });

  context('jest concurrent', () => {
    let fileSource, fileAst;

    before(() => {
      fileSource = fs.readFileSync('./example/jest/jest-concurrent.js').toString();
      fileAst = parser.parse(fileSource);
    });

    it('shuld parse it.concurrent', () => {
      const tests = jestParser(fileAst, '', fileSource, { lineNumbers: true });
      expect(tests[0].name).to.equal('it concurrent');
      expect(tests[0].code).to.include("it.concurrent('it concurrent', () => {});");
    });

    it('should parse test.concurrent', () => {
      const tests = jestParser(fileAst, '', fileSource, { lineNumbers: true });
      expect(tests[1].name).to.equal('test concurrent');
      expect(tests[1].code).to.include("test.concurrent('test concurrent', () => {});");
    });
  });
});

const parser = require('@babel/parser');
const fs = require('fs');
const { expect } = require('chai');
const testcafeParser = require('../src/lib/frameworks/testcafe');

let source;
let ast;

describe('testcafe parser', () => {
  context('Testcafe tests', () => {
    before(() => {
      source = fs.readFileSync('./example/testcafe/index_test.js').toString();
      ast = parser.parse(source);
    });

    it('should parse testcafe file', () => {
      const tests = testcafeParser(ast, '', source);

      const actualTests = tests.filter(t => !t.skipped).map(t => t.name);
      const skippedTests = tests.filter(t => t.skipped).map(t => t.name);

      expect(actualTests).to.include('Add dev name success');
      expect(skippedTests, 'skip').to.include('Skipped test');
      expect(actualTests).to.include('Title with template literal');
      expect(actualTests).to.include('Test with before hook');
    });

    it('should include testcafe code', () => {
      const tests = testcafeParser(ast, '', source);
      expect(tests[0]).to.include.key('code');
      expect(tests[0].code).to.include('test(');
      expect(tests[0].code).to.include('await t');
    });
  });
});

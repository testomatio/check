const parser = require('@babel/parser');
const fs = require('fs');
const { expect } = require('chai');
const jasmineParser = require('../src/lib/frameworks/jasmine');

let source;
let ast;

describe('jasmine parser', () => {
  context('jasmine tests', () => {
    before(() => {
      source = fs.readFileSync('./example/jasmine/protractor.spec.js').toString();
      ast = parser.parse(source, { sourceType: 'unambiguous' });
    });

    it('should parse jasmine file', () => {
      const tests = jasmineParser(ast);

      const actualTests = tests.filter(t => !t.skipped).map(t => t.name);
      const skippedTests = tests.filter(t => t.skipped).map(t => t.name);

      expect(actualTests).to.include('should not display non-found search terms');
      expect(actualTests).to.include('should display actual count before saving new friend');
      expect(actualTests).to.include('should display found search terms');
      expect(skippedTests).to.include('should display no rows when all friends deleted');
      // assert.equal(tests.length, 3);
    });

    it('should include code', () => {
      const tests = jasmineParser(ast, '', source);
      expect(tests[0]).to.include.key('code');
      expect(tests[0].code).to.include("it('should add a new friend");
    });
  });
});

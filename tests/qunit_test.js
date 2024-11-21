const parser = require('@babel/parser');
const fs = require('fs');
const { expect } = require('chai');
const qunitParser = require('../src/lib/frameworks/qunit');

let source;
let ast;

describe('qunit parser', () => {
  context('qunit tests', () => {
    before(() => {
      source = fs.readFileSync('./example/qunit/ember_test.js').toString();
      ast = parser.parse(source);
    });

    it('should parse qunit file', () => {
      const tests = qunitParser(ast, '', source);

      const actualTests = tests.filter(t => !t.skipped).map(t => t.name);

      expect(actualTests.length).to.be.greaterThan(3);
      expect(actualTests).to.include('Simple component');
      expect(tests[0].code).to.include('QUnit.test');
    });
  });
});

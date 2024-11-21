const parser = require('@babel/parser');
const fs = require('fs');
const { expect } = require('chai');
const mochaParser = require('../src/lib/frameworks/mocha');

let source;
let ast;

describe('mocha parser', () => {
  context('mocha tests', () => {
    before(() => {
      source = fs.readFileSync('./example/mocha/index_test.js').toString();
      ast = parser.parse(source);
    });

    it('should parse mocha file', () => {
      const tests = mochaParser(ast);

      const actualTests = tests.filter(t => !t.skipped).map(t => t.name);
      const skippedTests = tests.filter(t => t.skipped).map(t => t.name);

      expect(actualTests).to.include('should test if 3*3 = 9');
      expect(actualTests, 'commented').to.not.include('should test (3-4)*8 SHOULD EQUAL -8');
      expect(skippedTests, 'commented').to.not.include('should test (3-4)*8 SHOULD EQUAL -8');
      expect(skippedTests, 'xit').to.include('should be clone');
      expect(skippedTests, 'it.skip').to.include('should be second clone');
      expect(skippedTests, 'describe.skip').to.include('should be disabled');
      // assert.equal(tests.length, 3);
    });
  });

  context('cypress tests', () => {
    before(() => {
      source = fs.readFileSync('./example/mocha/cypress_spec.js').toString();
      ast = parser.parse(source);
    });

    it('should parse cypress file', () => {
      const tests = mochaParser(ast);

      const actualTests = tests.filter(t => !t.skipped).map(t => t.name);

      expect(actualTests).to.include('.check() - check a checkbox or radio element');
      // assert.equal(tests.length, 3);
    });

    it('should include code', () => {
      const tests = mochaParser(ast, '', source);
      expect(tests[0]).to.include.key('code');
      expect(tests[0].code).to.include("it('.type() - type into a DOM element', () => {");
    });
  });

  context('graphql tests', () => {
    before(() => {
      source = fs.readFileSync('./example/mocha/graphql_test.js').toString();
      ast = parser.parse(source);
    });

    it('should parse codeceptjs internal test', () => {
      const tests = mochaParser(ast);

      expect(tests[0].name).to.eql('should send a query: read');
      expect(tests[0].suites).to.eql(['GraphQL', 'basic queries']);
      expect(tests[1].suites).to.eql(['GraphQL', 'basic mutations']);
      // assert.equal(tests.length, 3);
    });
  });

  context('Cypress: hooks tests', () => {
    before(() => {
      source = fs.readFileSync('./example/mocha/cypress_hooks.spec.js').toString();
      ast = parser.parse(source, { sourceType: 'unambiguous' });
    });

    it('should include before hook code by default', () => {
      const tests = mochaParser(ast, '', source);
      // first test
      expect(tests[0].code).to.include('before(() => {\n');
      expect(tests[0].code).to.include("console.log('Ran before');\n");
      expect(tests[0].code).to.include("cy.visit('http://localhost:8080/commands/actions');\n");
      // second test
      expect(tests[1].code).to.include('before(() => {\n');
      expect(tests[1].code).to.include("console.log('Ran before');\n");
      expect(tests[1].code).to.include("cy.visit('http://localhost:8080/commands/actions');\n");
    });

    it('should include beforeEach hook code by default', () => {
      const tests = mochaParser(ast, '', source);
      // first test
      expect(tests[0].code).to.include('beforeEach(() => {\n');
      expect(tests[0].code).to.include("console.log('Ran beforeEach');\n");
      expect(tests[0].code).to.include("cy.visit('http://localhost:8080/commands/actions');\n");
      // second test
      expect(tests[1].code).to.include('beforeEach(() => {\n');
      expect(tests[1].code).to.include("console.log('Ran beforeEach');\n");
      expect(tests[1].code).to.include("cy.visit('http://localhost:8080/commands/actions');\n");
    });

    it('should include after hook code by default', () => {
      const tests = mochaParser(ast, '', source);
      // first test
      expect(tests[0].code).to.include('after(async () => {\n');
      expect(tests[0].code).to.include("console.log('Ran after');\n");
      expect(tests[0].code).to.include("cy.get('.action-disabled');\n");
      // second test
      expect(tests[1].code).to.include('after(async () => {\n');
      expect(tests[1].code).to.include("console.log('Ran after');\n");
      expect(tests[1].code).to.include("cy.get('.action-disabled');\n");
    });
  });

  context('[opts.noHooks = true] Cypress: hooks code', () => {
    let fileSource, fileAst;

    before(() => {
      fileSource = fs.readFileSync('./example/mocha/cypress_hooks.spec.js').toString();
      fileAst = parser.parse(source, { sourceType: 'unambiguous' });
    });

    it('should exclude before hook code', () => {
      const tests = mochaParser(fileAst, '', fileSource, { noHooks: true });
      // first test
      expect(tests[0].code).to.not.include('before(() => {\n');
      // second test
      expect(tests[1].code).to.not.include('before(() => {\n');
    });

    it('should exclude beforeEach hook code', () => {
      const tests = mochaParser(fileAst, '', fileSource, { noHooks: true });
      // first test
      expect(tests[0].code).to.not.include('beforeEach(() => {\n');
      // second test
      expect(tests[1].code).to.not.include('beforeEach(() => {\n');
    });

    it('should exclude after hook code', () => {
      const tests = mochaParser(fileAst, '', fileSource, { noHooks: true });
      // first test
      expect(tests[0].code).to.not.include('after(async () => {\n');
      // second test
      expect(tests[1].code).to.not.include('after(async () => {\n');
    });
  });

  context('Cypress: test with --line-numbers option', () => {
    let fileSource, fileAst;

    before(() => {
      fileSource = fs.readFileSync('./example/mocha/cypress_hooks.spec.js').toString();
      fileAst = parser.parse(source, { sourceType: 'unambiguous' });
    });

    it('[lineNumbers=true opts] each section should include line-number as part of code section', () => {
      const tests = mochaParser(fileAst, '', fileSource, { lineNumbers: true });
      // first test only
      expect(tests[0].code).to.include("13:     it('.type() - type into a DOM element', () => {\n");
      // by default hooks include line number too
      expect(tests[0].code).to.include('4:     beforeEach(() => {\n');
      expect(tests[0].code).to.include('8:     before(() => {\n');
      expect(tests[0].code).to.include('24:     after(async () => {\n');
      // second test
      expect(tests[1].code).to.include("20:     it('.click() - click on a DOM element', () => {\n");
    });

    it('[no SET the lineNumbers opts] should exclude line-number', () => {
      const tests = mochaParser(fileAst, '', fileSource);
      // first test only
      expect(tests[0].code).to.not.include("13:     it('.type() - type into a DOM element', () => {\n");
      // no lines
      expect(tests[0].code).to.include("it('.type() - type into a DOM element', () => {\n");
    });

    // multiple options
    it('[noHooks=true + lineNumbers=true opts] line-number as part of code section', () => {
      const tests = mochaParser(fileAst, '', fileSource, { lineNumbers: true, noHooks: true });
      // first test only
      expect(tests[0].code).to.include("13:     it('.type() - type into a DOM element', () => {\n");
      // no includes hook code
      expect(tests[0].code).to.not.include('8:     before(() => {\n');
    });
  });
});

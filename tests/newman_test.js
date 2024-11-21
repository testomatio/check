const fs = require('fs');
const { expect } = require('chai');
const newmanParser = require('../src/lib/frameworks/newman');

const filename = 'collection.json';
const source = fs.readFileSync(`./example/newman/${filename}`).toString();

describe('newman parser', () => {
  it('should parse newman collection', () => {
    const tests = newmanParser(null, filename, source);
    expect(tests[0]).to.include.key('code');
    expect(tests[0]).to.include.key('file');
    expect(tests[0]).to.include.key('name');
    expect(tests[0]).to.include.key('suites');
    expect(tests.length).to.equal(4);
  });

  it('should properly get test name', () => {
    const tests = newmanParser(null, '', source);
    expect(tests[0].name).to.equal('Request with url params');
  });

  it('should properly get suites for test inside nested folder', () => {
    const tests = newmanParser(null, '', source);
    expect(tests[2].suites).to.have.ordered.members(['Echo collection with folders', 'Folder 2', 'Nested folder']);
  });

  it('should properly get suite for test within collection (not in any folder)', () => {
    const tests = newmanParser(null, '', source);
    expect(tests[3].suites).to.have.length(1);
    expect(tests[3].suites[0]).to.equal('Echo collection with folders');
  });
});

const path = require('path');
const { expect } = require('chai');
const Analyzer = require('../src/analyzer');
const Comment = require('../src/comment');

describe('Comment', () => {
  it('should refer to proper skipped line in comment', () => {
    analyzer = new Analyzer('mocha', path.join(__dirname, '..'));
    analyzer.analyze('./example/mocha/index_test.js');

    const allTests = analyzer.getDecorator();
    const comment = new Comment();
    comment.writeSkipped(allTests.getMarkdownList());
    expect(comment.body).to.include('index_test.js#L14) ⚠️ *skipped*');
    expect(comment.body).to.include('index_test.js#L19) ⚠️ *skipped*');
    expect(comment.body).to.include('index_test.js#L25) ⚠️ *skipped*');
  });
});

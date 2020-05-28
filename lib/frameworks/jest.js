const traverse = require('babel-traverse');
const Comment = require('../../comment');
const { hasStringArgument, getLineNumber, getEndLineNumber, getCode } = require('../utils');

module.exports = (ast, file = '', source = '') => {

  const tests = [];
  let currentSuite = [];

  function addSuite(path) {
    currentSuite = currentSuite.filter(s => s.end > path.start);
    currentSuite.push(path);
  }

  traverse.default(ast, {
    enter(path) {
      if (path.isIdentifier({ name: "describe" })) {
        if (!hasStringArgument(path.parent)) return;
        addSuite(path.parent);        
      }

      // forbid only
      if (path.isIdentifier({ name: "only" })) {
        const name = path.parent.object.name;
        if (['describe','it','context'].includes(name))  {
          const line = getLineNumber(path);
          throw new Comment.Error("Exclusive tests detected. `.only` call found in " + `${file}:${line}\n` + "Remove `.only` to restore test checks");
        }
      }

      if (path.isIdentifier({ name: "skip" })) {

        if (!path.parent || !path.parent.object) {
          return;
        }

        if (path.parent.object.name === 'test') { // test
          if (!hasStringArgument(path.parentPath.container)) return;

          const testName = path.parentPath.container.arguments[0].value;
          tests.push({
            name: testName,
            suites: currentSuite.map(s => s.arguments[0].value),
            line: getLineNumber(path),
            code: getCode(source, getLineNumber(path), getEndLineNumber(path)),
            file,
            skipped: true,
          });            
        }

        if (path.parent.object.name === 'describe') { // suite
          if (!hasStringArgument(path.parentPath.container)) return;
          const suite = path.parentPath.container;
          suite.skipped = true;
          addSuite(suite);
        }
      }

      if (path.isIdentifier({ name: "todo" })) { // todo tests => skipped tests
        if (path.parent.object.name === 'test') { // test
          if (!hasStringArgument(path.parentPath.container)) return;

          const testName = path.parentPath.container.arguments[0].value;
          tests.push({
            name: testName,
            suites: currentSuite.map(s => s.arguments[0].value),
            line: getLineNumber(path),
            code: getCode(source, getLineNumber(path), getEndLineNumber(path)),
            file,
            skipped: true,
          });            
        }
      }      


      if (path.isIdentifier({ name: "test" }) || path.isIdentifier({ name: "it" })) {
        if (!hasStringArgument(path.parent)) return;

        const testName = path.parent.arguments[0].value;
        tests.push({
          name: testName,
          suites: currentSuite.map(s => s.arguments[0].value),
          line: getLineNumber(path),
          code: getCode(source, getLineNumber(path), getEndLineNumber(path)),
          file,
          skipped: !!currentSuite.filter(s => s.skipped).length
        });
      }
    },

  });

  return tests;
}


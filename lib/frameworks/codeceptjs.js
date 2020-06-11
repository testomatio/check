const traverse = require('babel-traverse');
const Comment = require('../../comment');
const { hasStringArgument, getLineNumber, getEndLineNumber, getCode } = require('../utils');

module.exports = (ast, file = '', source = '') => {

  const tests = [];
  let currentSuite = '';

  const getScenario = path => {
    if (hasStringArgument(path.container)) {
      const testName = path.container.arguments[0].value;      
      tests.push({
        name: testName,
        suites: [currentSuite],
        line: getLineNumber(path),
        code: getCode(source, getLineNumber(path), getEndLineNumber(path)),
        file,

      });
      return;
    };
    if (hasStringArgument(path.parent)) {
      const testName = path.parent.arguments[0].value;      
      tests.push({
        name: testName,
        suites: [currentSuite],
        line: getLineNumber(path),
        code: getCode(source, getLineNumber(path), getEndLineNumber(path)),
        file,
      });
    }
  }

  traverse.default(ast, {
    enter(path) {
      if (path.isIdentifier({ name: "Feature" })) {
        if (!hasStringArgument(path.parent)) return;
        currentSuite = path.parent.arguments[0].value;
      };

      if (path.isIdentifier({ name: "only" })) {
        const name = path.parent.object.name;
        if (['Scenario'].includes(name))  {
          const line = getLineNumber(path);
          throw new Comment.Error("Exclusive tests detected. `.only` call found in " + `${file}:${line}\n` + "Remove `.only` to restore test checks");
        }
      }      

      if (path.isIdentifier({ name: "xScenario" })) {
        if (hasStringArgument(path.container)) {
          const testName = path.container.arguments[0].value;      
          tests.push({
            name: testName,
            suites: [currentSuite],
            line: getLineNumber(path),
            code: getCode(source, getLineNumber(path), getEndLineNumber(path)),
            skipped: true,
            file,
          });
          return;
        };
      }

      if (path.isIdentifier({ name: "Scenario" })) {
        getScenario(path);
      }

      if (path.isIdentifier({ name: "Data" })) {
        getScenario(path.parentPath.parentPath)
      }
    },
  });

  return tests
}


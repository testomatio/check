const fs = require('fs');
const { replaceAtPoint, cleanAtPoint } = require('./lib/utils');

function updateIds(testData, testomatioMap, workDir, opts = {}) {
  const files = [];
  for (const testArr of testData) {
    if (!testArr.length) continue;

    const file = `${workDir}/${testArr[0].file}`;
    let fileContent = fs.readFileSync(file, { encoding: 'utf8' });

    const suite = testArr[0].suites[0];
    const suiteIndex = suite;
    if (testomatioMap.suites[suiteIndex] && !suite.includes(testomatioMap.suites[suiteIndex])) {
      fileContent = fileContent.replace(suite, `${suite} ${testomatioMap.suites[suiteIndex]}`);
      fs.writeFileSync(file, fileContent);
    }

    for (const test of testArr) {
      let testIndex = `${test.suites[0]}#${test.name}`;
      if (!testomatioMap.tests[testIndex]) {
        testIndex = test.name; // if no suite title provided
      }
      if (testomatioMap.tests[testIndex] && !test.name.includes(testomatioMap.tests[testIndex])) {
        fileContent = replaceAtPoint(fileContent, test.updatePoint, ` ${testomatioMap.tests[testIndex]}`);
        fs.writeFileSync(file, fileContent);
        delete testomatioMap.tests[testIndex];
      }
    }
    files.push(file);
  }
  return files;
}

function cleanIds(testData, testomatioMap = {}, workDir, opts = { dangerous: false }) {
  const dangerous = opts.dangerous;

  const testIds = testomatioMap.tests ? Object.values(testomatioMap.tests) : [];
  const suiteIds = testomatioMap.suites ? Object.values(testomatioMap.suites) : [];
  const files = [];
  for (const testArr of testData) {
    if (!testArr.length) continue;

    const file = `${workDir}/${testArr[0].file}`;
    let fileContent = fs.readFileSync(file, { encoding: 'utf8' });

    const suite = testArr[0].suites[0];
    const suiteId = `@S${parseSuite(suite)}`;
    if (suiteIds.includes(suiteId) || (dangerous && suiteId)) {
      const newTitle = suite.slice().replace(suiteId, '').trim();
      fileContent = fileContent.replace(suite, newTitle);
    }
    for (const test of testArr) {
      const testId = `@T${parseTest(test.name)}`;
      if (testIds.includes(testId) || (dangerous && testId)) {
        fileContent = cleanAtPoint(fileContent, test.updatePoint, testId);
      }
    }
    files.push(file);
    fs.writeFileSync(file, fileContent, err => {
      if (err) throw err;
    });
  }
  return files;
}

const parseTest = testTitle => {
  const captures = testTitle.match(/@T([\w\d]{8})/);
  if (captures) {
    return captures[1];
  }

  return null;
};

const parseSuite = suiteTitle => {
  const captures = suiteTitle.match(/@S([\w\d]{8})/);
  if (captures) {
    return captures[1];
  }

  return null;
};

const getLineNumberOfText = (text, content) => {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes(text)) return i;
  }

  return 0;
};

function fileIndex(file, index) {
  if (file) return `${file}:${index}`;
  return index;
}

module.exports = {
  updateIds,
  cleanIds,
};

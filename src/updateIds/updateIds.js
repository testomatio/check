const fs = require('fs');
const debug = require('debug')('testomatio:update-ids');
const { replaceAtPoint, cleanAtPoint } = require('../lib/utils');
const { TAG_REGEX } = require('./constants');
const { parseTest, parseSuite, replaceSuiteTitle } = require('./helpers');

/**
 * Insert test ids (@T12345678) into test files
 * @param {*} testData array of arrays of test data;
 * the main array represents test files, nested arrays includes test data for each test
 * @param {*} testomatioMap mapping of test ids received from testomatio server
 * @param {*} workDir
 * @param {*} opts
 * @returns
 */
function updateIdsCommon(testData, testomatioMap, workDir = {}) {
  const files = [];
  let duplicateTests = 0;
  let duplicateSuites = 0;

  debug('Test data:', testData);

  for (const testArr of testData) {
    if (!testArr || !testArr.length) continue;

    const file = `${workDir}/${testArr[0].file}`;
    debug('Updating file: ', file);
    let fileContent = fs.readFileSync(file, { encoding: 'utf8' });
    const processedSuites = new Set();

    for (const data of testArr) {
      if (!data || !data.suites || !Array.isArray(data.suites)) {
        debug('Invalid data or suites:', data);
        continue;
      }
      for (const suite of data.suites) {
        if (!suite) continue;
        const suiteIndex = suite || '';
        const suiteWithoutTags = suite.replace(TAG_REGEX, '').trim();

        const currentSuiteId = parseSuite(suiteIndex);
        if (
          currentSuiteId &&
          (testomatioMap.suites[suiteIndex] !== `@S${currentSuiteId}` ||
            testomatioMap.suites[suiteWithoutTags] !== `@S${currentSuiteId}`)
        ) {
          debug(`   Previous ID detected in suite '${suiteIndex}'`);
          duplicateSuites++;
          continue;
        }

        if (!processedSuites.has(suiteIndex)) {
          if (testomatioMap.suites[suiteIndex] && !suite.includes(testomatioMap.suites[suiteIndex])) {
            fileContent = replaceSuiteTitle(suite, `${suite} ${testomatioMap.suites[suiteIndex]}`, fileContent);
            fs.writeFileSync(file, fileContent);
            processedSuites.add(suiteIndex);
          } else if (
            testomatioMap.suites[suiteWithoutTags] &&
            !suite.includes(testomatioMap.suites[suiteWithoutTags])
          ) {
            fileContent = replaceSuiteTitle(suite, `${suite} ${testomatioMap.suites[suiteWithoutTags]}`, fileContent);
            fs.writeFileSync(file, fileContent);
            processedSuites.add(suiteIndex);
          }
        }
      }
    }

    for (const test of testArr) {
      if (!test) {
        debug('Invalid test:', test);
        continue;
      }
      const testName = test.name || '';

      if (testName) {
        let testIndex = `${test.suites.join(' > ')}#${test.name}`;
        debug('testIndex', testIndex);

        let testWithoutTags = `${test.suites
          .map(suite => suite.replace(TAG_REGEX, '').trim())
          .join(' > ')}#${test.name.replace(TAG_REGEX, '')}`.trim();

        if (!testomatioMap.tests[testIndex] && !testomatioMap.tests[testWithoutTags]) {
          testIndex = test.name;
          testWithoutTags = test.name.replace(TAG_REGEX, '').trim();
        }

        const currentTestId = parseTest(testIndex);
        if (
          currentTestId &&
          (testomatioMap.tests[testIndex] !== `@T${currentTestId}` ||
            testomatioMap.tests[testWithoutTags] !== `@T${currentTestId}`)
        ) {
          debug(`Previous ID detected in test '${testIndex}'`);
          duplicateTests++;
          continue;
        }

        if (testomatioMap.tests[testIndex] && !test.name.includes(testomatioMap.tests[testIndex])) {
          fileContent = replaceAtPoint(fileContent, test.updatePoint, ` ${testomatioMap.tests[testIndex]}`);
          fs.writeFileSync(file, fileContent);
          delete testomatioMap.tests[testIndex];
        } else if (testomatioMap.tests[testWithoutTags] && !test.name.includes(testomatioMap.tests[testWithoutTags])) {
          fileContent = replaceAtPoint(fileContent, test.updatePoint, ` ${testomatioMap.tests[testWithoutTags]}`);
          fs.writeFileSync(file, fileContent);
          delete testomatioMap.tests[testWithoutTags];
        }
      }
    }
    files.push(file);
  }
  if (duplicateSuites || duplicateTests) {
    console.log('! Previously set Test IDs detected, new IDs ignored');
    console.log('! Clean previously set Test IDs to override them');
    console.log('! Run script with DEBUG="testomatio:*" flag to get more info of affected tests ');
  }

  return files;
}

/**
 * Removes test ids (@T12345678) from test files
 * @param {*} testData
 * @param {*} testomatioMap
 * @param {*} workDir
 * @param {*} opts
 * @returns
 */
function cleanIdsCommon(testData, testomatioMap = {}, workDir, opts = { dangerous: false }) {
  const dangerous = opts.dangerous;

  const testIds = testomatioMap.tests ? Object.values(testomatioMap.tests) : [];
  const suiteIds = testomatioMap.suites ? Object.values(testomatioMap.suites) : [];
  const files = [];
  for (const testArr of testData) {
    if (!testArr.length) continue;

    const file = `${workDir}/${testArr[0].file}`;
    debug('Updating file: ', file);
    let fileContent = fs.readFileSync(file, { encoding: 'utf8' });

    for (const data of testArr) {
      for (const suite of data.suites) {
        const suiteId = `@S${parseSuite(suite)}`;
        debug('  cleaning suite: ', suite);

        if (suiteIds.includes(suiteId) || (dangerous && suiteId)) {
          const newTitle = suite.slice().replace(suiteId, '').trim();
          fileContent = fileContent.replace(suite, newTitle);
        }
      }
    }

    for (const test of testArr) {
      const testId = `@T${parseTest(test.name)}`;
      debug('  cleaning test: ', test.name);

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

module.exports = {
  updateIdsCommon,
  cleanIdsCommon,
};

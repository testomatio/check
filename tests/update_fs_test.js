const Analyzer = require('../src/analyzer');
const { updateIds, cleanIds } = require('../src/updateIds');
const { expect } = require('chai');
const path = require('path');
const fs = require('fs');

let analyzer;

const copyDir = function (src, dest) {
  try {
    fs.mkdirSync(dest, 0755);
  } catch (e) {
    if (e.code != 'EEXIST') {
      throw e;
    }
  }
  var files = fs.readdirSync(src);
  for (var i = 0; i < files.length; i++) {
    var current = fs.lstatSync(path.join(src, files[i]));
    if (current.isDirectory()) {
      copyDir(path.join(src, files[i]), path.join(dest, files[i]));
    } else if (current.isSymbolicLink()) {
      var symlink = fs.readlinkSync(path.join(src, files[i]));
      fs.symlinkSync(symlink, path.join(dest, files[i]));
    } else {
      fs.copyFileSync(path.join(src, files[i]), path.join(dest, files[i]));
    }
  }
};

const idMap = {
  tests: {
    'Create a new todo item': '@T1111111',
    'Todos containing weird characters': '@T22222111111',
  },
  suites: {
    '@first Create Todos @step:06 @smoke @story:12345': '@S12345678',
  },
};

const createTestFiles = folderName => {
  const targetPath = path.join(__dirname, '..', folderName);
  copyDir(path.join(__dirname, '..', 'example', 'codeceptjs'), targetPath);
};

const cleanFiles = folderName => {
  const targetPath = path.join(__dirname, '..', folderName);
  fs.rmSync(targetPath, { recursive: true, force: true });
};

beforeEach(() => {
  process.env.TESTOMATIO_PREPEND_DIR = '';
});

describe('UpdateIds FS', () => {
  it('should add suite and test ids', () => {
    createTestFiles('update_examples');
    analyzer = new Analyzer('codeceptjs', path.join(__dirname, '..'));
    analyzer.analyze('./update_examples/**_test.js');
    const files = updateIds(analyzer.rawTests, idMap, process.cwd());
    const file1 = fs.readFileSync(path.join(process.cwd(), 'update_examples', 'create_todos_test.js'), {
      encoding: 'utf8',
    });
    const file2 = fs.readFileSync(path.join(process.cwd(), 'update_examples', 'datatable_test.js'), {
      encoding: 'utf8',
    });

    expect(files.length).to.equal(5);
    expect(file1).to.include('@S12345678');
    expect(file1).to.include('@T1111111');
    expect(file1).to.include('@T22222111');
    expect(file2).not.to.include('@T22222111');
    cleanFiles('update_examples');
  });

  it('should clean suite and test ids safely', () => {
    createTestFiles('clear_examples');
    const dirPath = path.join(__dirname, '..');
    analyzer = new Analyzer('codeceptjs', dirPath);
    analyzer.analyze('./clear_examples/**_test.js');
    updateIds(analyzer.rawTests, idMap, dirPath);

    analyzer = new Analyzer('codeceptjs', dirPath);
    analyzer.analyze('./clear_examples/**_test.js');
    const files = cleanIds(analyzer.rawTests, idMap, dirPath);

    const file1 = fs.readFileSync(path.join(dirPath, 'clear_examples', 'create_todos_test.js'), { encoding: 'utf8' });
    const file2 = fs.readFileSync(path.join(dirPath, 'clear_examples', 'datatable_test.js'), { encoding: 'utf8' });

    expect(files.length).to.equal(5);
    expect(file1).not.to.include('@S12345678');
    expect(file1).not.to.include('@T1111111');
    expect(file1).to.include('@Txxxxxxxx');

    expect(file2).not.to.include('@T22222111');
    cleanFiles('clear_examples');
  });

  it('should clean suite and test ids unsafely', () => {
    createTestFiles('unsafe_examples');
    const dirPath = path.join(__dirname, '..');
    analyzer = new Analyzer('codeceptjs', dirPath);
    analyzer.analyze('./unsafe_examples/**_test.js');
    updateIds(analyzer.rawTests, idMap, dirPath);

    analyzer = new Analyzer('codeceptjs', dirPath);
    analyzer.analyze('./unsafe_examples/**_test.js');
    const files = cleanIds(analyzer.rawTests, {}, dirPath, { dangerous: true });

    const file1 = fs.readFileSync(path.join(dirPath, 'unsafe_examples', 'create_todos_test.js'), { encoding: 'utf8' });
    const file2 = fs.readFileSync(path.join(dirPath, 'unsafe_examples', 'datatable_test.js'), { encoding: 'utf8' });

    expect(files.length).to.equal(5);
    expect(file1).not.to.include('@S12345678');
    expect(file1).not.to.include('@T1111111');
    expect(file1).not.to.include('@Txxxxxxxx');

    expect(file2).not.to.include('@T22222111');
    cleanFiles('unsafe_examples');
  });
});

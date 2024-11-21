const { expect, assert } = require('chai');
const Decorator = require('../src/decorator');

describe('Decorator', () => {
  it('should print markdown', () => {
    const decorator = new Decorator([
      { name: 'test1', suites: ['Appium', 'first', 'second'] },
      { name: 'test2', suites: ['Appium', 'first', 'second'] },
      { name: 'test3', suites: ['Appium'] },
      { name: 'test4', suites: ['Appium', 'third', 'fourth'] },
      { name: 'test5', suites: ['WebDriverIO'] },
      { name: 'test6', suites: ['Puppeteer', 'first', 'second', 'third'] },
    ]);
    expect(decorator.getMarkdownList()).to.include.members([
      '* 📎 **Appium**',
      '  * 📎 **first**',
      '    * 📎 **second**',
      '      * ✔️ `test1`',
      '      * ✔️ `test2`',
      '  * ✔️ `test3`',
      '  * 📎 **third**',
      '    * 📎 **fourth**',
      '      * ✔️ `test4`',
      '* 📎 **WebDriverIO**',
      '  * ✔️ `test5`',
      '* 📎 **Puppeteer**',
      '  * 📎 **first**',
      '    * 📎 **second**',
      '      * 📎 **third**',
      '        * ✔️ `test6`',
    ]);
  });

  it('should validate tests with empty titles', () => {
    const decorator = new Decorator([
      { name: 'test1', suites: ['Appium', 'second'] },
      { name: '@first-Tag', suites: ['Appium'] },
      { name: '@tag1 @tag2', suites: ['Appium'] },
      { name: 'word @tag1 @tag2', suites: ['Appium'] },
      { name: '@tag1 word @tag2', suites: ['Appium'] },
      { name: 'okword', suites: ['Appium'] },
    ]);

    try {
      decorator.validate();
      assert.fail('should throw error');
    } catch (err) {
      // console.log(err.message)
      expect(err.message).to.include('@first-Tag');
      expect(err.message).to.include('@tag1 @tag2');
      expect(err.message).not.to.include('@tag1 word @tag2');
      expect(err.message).not.to.include('word @tag1 @tag2');
      expect(err.message).not.to.include('okword');
    }
  });

  it('should print markdown2', () => {
    const decorator = new Decorator([
      { name: 'should send basic', suites: ['GraphQL', 'basic queries'] },
      { name: 'should send mut 1', suites: ['GraphQL', 'basic mutations'] },
      { name: 'should send mut 2', suites: ['GraphQL', 'basic mutations'] },
    ]);

    expect(decorator.getMarkdownList()).to.include.members([
      '* 📎 **GraphQL**',
      '  * 📎 **basic queries**',
      '    * ✔️ `should send basic`',
      '  * 📎 **basic mutations**',
      '    * ✔️ `should send mut 1`',
      '    * ✔️ `should send mut 2`',
    ]);
  });
});

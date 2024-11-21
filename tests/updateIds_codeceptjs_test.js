/* eslint-disable no-template-curly-in-string */
const { expect } = require('chai');
const fs = require('fs');
const { updateIds, cleanIds } = require('../src/updateIds');
const Analyzer = require('../src/analyzer');

describe('update ids tests(codeseptJS adapter)', () => {
  before(() => {
    if (!fs.existsSync('virtual_dir')) fs.mkdirSync('virtual_dir');
  });

  describe('[codeseptJS examples] includes Feature + Scenario', () => {
    it('[js file]: file includes Feature + one Scenario', () => {
      const analyzer = new Analyzer('codeceptjs', 'virtual_dir');

      const idMap = {
        tests: {
          'Search for users by organization': '@T1d6a52b9',
        },
        suites: {
          'User search with organizations @users @iam-user-management @platform-core @atlassian-skip @layer0-skip':
            '@Sf3d245a7',
        },
      };

      fs.writeFileSync(
        './virtual_dir/test.js',
        `
          Feature(
            "User search with organizations @users @iam-user-management @platform-core @atlassian-skip @layer0-skip"
          );
          
          AfterSuite(async ({ I }) => {
            await I.resetTenant(tenant);
          });
            
          Scenario("Search for users by organization", async ({ I }) => {
          
            await addMembers(
              { id: testOrganization.id },
              { members: usersIds }
            );
          
            // organization_id search
            await utilities.waitFor(
              async (retry) => {
                const orgUsers = await manage.getUsers({
                  search_engine: "v3",
                  per_page: 10,
                  page: 0,
                  q: "organization_id:111 AND email:test@mail.com",
                });
                if (orgUsers.length !== 1) {
                  retry();
                }
          
                I.assertEqual(orgUsers.length, 1, "Organization user not found");
              },
              60,
              "Failed waiting user belonging to an organization"
            );
          });`,
      );

      analyzer.analyze('test.js');

      updateIds(analyzer.rawTests, idMap, 'virtual_dir');

      const updatedFile = fs.readFileSync('virtual_dir/test.js', 'utf-8').toString();

      expect(updatedFile).to.include('Feature(\n');
      expect(updatedFile).to.include(
        '"User search with organizations @users @iam-user-management @platform-core @atlassian-skip @layer0-skip @Sf3d245a7"\n',
      );
      expect(updatedFile).to.include('Scenario("Search for users by organization @T1d6a52b9"');
    });

    it('[js file]: test file does not include Feature, only Scenario', () => {
      const analyzer = new Analyzer('codeceptjs', 'virtual_dir');

      const idMap = {
        tests: {
          '[Positive case] Verify Successful Login to the system @case-1': '@T1d6a52b1',
          '[Positive case] Verify Successful Login to the system @case-2': '@T1d6a52b2',
        },
      };
      // Test Data
      const userName = 'sampleUser';

      fs.writeFileSync(
        'virtual_dir/test.js',
        ` 
          const userName = "sampleUser", password = "pwd";

          Scenario(
            "[Positive case] Verify Successful Login to the system @case-1",
            async ({ I }) => {

            I.amOnPage('http://uitestingplayground.com/sampleapp');
            //ASSERT
            I.see(\`Welcome, ${userName}!\`, '#test');
          });
          Scenario(
            "[Positive case] Verify Successful Login to the system @case-2",
            async ({ I }) => {

            I.amOnPage('http://uitestingplayground.com/sampleapp');
            //ASSERT
            I.see(\`Welcome, ${userName}!\`, '#test');
          });
          `,
      );

      analyzer.analyze('test.js');

      updateIds(analyzer.rawTests, idMap, 'virtual_dir');

      const updatedFile = fs.readFileSync('virtual_dir/test.js', 'utf-8').toString();

      expect(updatedFile).to.include('Scenario(\n');
      expect(updatedFile).to.include('"[Positive case] Verify Successful Login to the system @case-1 @T1d6a52b1",\n');
      expect(updatedFile).to.include('Scenario(\n');
      expect(updatedFile).to.include('"[Positive case] Verify Successful Login to the system @case-2 @T1d6a52b2",\n');
    });

    it('[js file]: test file does not include Scenario, only Feature', () => {
      const analyzer = new Analyzer('codeceptjs', 'virtual_dir');

      const idMap = {
        suites: {
          Create: '@Sf3d245a7',
        },
        tests: {
          'Create#Create a new todo item': '@T1d6a52b1',
        },
      };

      fs.writeFileSync(
        'virtual_dir/test.js',
        ` 
          const Create = "test";

          Feature('Create')

          Before(async ({ I, TodosPage }) => {
            TodosPage.goto()
          });

          /**
          * Happy Path tests
          */
          Scenario('Create a new todo item', async ({ I, TodosPage }) => {
             I.say('Given I have an empty todo list')
             I.saveScreenshot('create-todo-item.png')
          });
          `,
      );

      analyzer.analyze('test.js');

      updateIds(analyzer.rawTests, idMap, 'virtual_dir');

      const updatedFile = fs.readFileSync('virtual_dir/test.js', 'utf-8').toString();

      expect(updatedFile).to.include('const Create = "test";\n');
      expect(updatedFile).to.include("Feature('Create @Sf3d245a7')\n");
      expect(updatedFile).to.include("Scenario('Create a new todo item @T1d6a52b1', async ({ I, TodosPage }) => {\n");
    });
  });

  describe('[codeseptJS examples] clean-ids', () => {
    it('can remove ids from the file with Scenario only', () => {
      let analyzer = new Analyzer('codeceptjs', 'virtual_dir');

      fs.writeFileSync(
        'virtual_dir/test.js',
        `
          const Create = "test";

          /**
          * Happy Path tests
          */
          Scenario('Create @T1d6a52b1', async ({ I, TodosPage }) => {
             I.say('Given I have an empty todo list')
             I.saveScreenshot('create-todo-item.png')
          });`,
      );

      analyzer.analyze('test.js');

      cleanIds(analyzer.rawTests, {}, 'virtual_dir', { dangerous: true });

      const updatedFile = fs.readFileSync('virtual_dir/test.js', 'utf-8').toString();
      // test section
      expect(updatedFile).to.include('const Create = "test";');
      expect(updatedFile).to.include("Scenario('Create'");
      expect(updatedFile).not.to.include('@T1d6a52b1');
    });

    it('can remove ids form the Feature & Scenario', () => {
      let analyzer = new Analyzer('codeceptjs', 'virtual_dir');

      fs.writeFileSync(
        'virtual_dir/test.js',
        `
          const Create = "test";

          Feature('@first Create @Sf3d245a7')

          Before(async ({ I, TodosPage }) => {
            TodosPage.goto()
          });

          /**
          * Happy Path tests
          */
          Scenario('Create @T1d6a52b1', async ({ I, TodosPage }) => {
             I.say('Given I have an empty todo list')
             I.saveScreenshot('create-todo-item.png')
          });`,
      );

      analyzer.analyze('test.js');

      cleanIds(analyzer.rawTests, {}, 'virtual_dir', { dangerous: true });

      const updatedFile = fs.readFileSync('virtual_dir/test.js', 'utf-8').toString();
      // suite section
      expect(updatedFile).to.include('const Create = "test";\n');
      expect(updatedFile).to.include("Feature('@first Create')\n");
      expect(updatedFile).not.to.include('@Sf3d245a7');
      // test section
      expect(updatedFile).to.include("Scenario('Create'");
      expect(updatedFile).not.to.include('@T1d6a52b1');
    });
  });
});

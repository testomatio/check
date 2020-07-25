# 🌀 AutoCheck Tests by Testomatio

> GitHub Action with Static Analysis for your JavaScript tests.

This action shows changed tests on each pull request with a complete list of all tests in this project. You can create test document in wiki of the project.

Use this checker as 

* [GitHub Action](#github-action)
* [CLI tool](#cli)

### Features

* Analyzes JavaScript test files in Pull Request 
* Uses AST parser to analyze tests
* Detects added, removed, skipped tests
* Fails when finds `.only` exclusive tests
* Adds labels for PR with or witout tests
* Shows expressive report for each PR
* TypeScript supported

## GitHub Action

### Sample Report

---

🌀 Tests overview by [Testomatio](https://testomat.io)


Found **7** codeceptjs tests in 1 files 
#### ✔️ Added 1 test


```diff
+ @first Create Todos @step:06 @smoke @story:12345: Another test
```



#### ⚠️ Skipped 1 test
```diff
- @first Create Todos @step:06 @smoke @story:12345: Create multiple todo items
```



<details>
  <summary>📑 List all tests</summary>

---


📎 **`@first` Create Todos `@step:06` `@smoke` `@story:12345`**

📝 [todomvc-tests/create-todos_test.js](#)

* [Create a new todo item](#)
* [Another test](#)
* [~~Create multiple todo items~~](#) ⚠️ *skipped*
* [Text input field should be cleared after each item](#)
* [Text input should be trimmed](#)
* [New todos should be added to the bottom of the list](#)
* [Footer should be visible when adding TODOs](#)


</details>


tests
</details>

---

## Usage

Once this action is enabled, bot will create a comment for each Pull Request with a list of all changed tests. 

This information is useful to:

* track addition and removal of tests
* protect from skipping tests
* protect from using `.only` exclusive tests
* automatically mark PR with `has tests` or `no tests` labels
* review tests on GitHub

## Installation

Check that your project uses one of the following testing frameworks (this list will be extended).

**Supported testing frameworks**

* mocha
* codeceptjs
* cypress.io
* jest
* protractor
* jasmine
* testcafe

Add this action to your workflow file `.github/workflow/main.yml` and configure.

```yml
on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    name: Check Tests
    steps:
    - uses: actions/checkout@v2
      with:
        fetch-depth: 0
    - uses: testomatio/check-tests@stable
      with:
        framework: # REQUIRED - testing framework
        tests: # REQUIRED - glob pattern to match test files
        token: ${{ secrets.GITHUB_TOKEN }}
```

> It is important to enable `actions/checkout@v2` step with `fetch-depth: 0` to allow testomatio to compare tests in pull requests with tests in base.

#### Inputs (Configuration) 

* `framework` - *(required)* Test framework to be used. Supported: mocha, codeceptjs'
* `tests` - *(required)* Glob pattern to match tests in a project, example: `tests/**_test.js'`
* `token` - *(should be: `${{ secrets.GITHUB_TOKEN }}`)* GitHub token to post comment with summary to current pull request
* `typescript` - enable TypeScript support
* `has-tests-label` - add a label when PR contains new tests. Set `true` or a label name to enable.
* `no-tests-label` - add a label when PR contains no new tests. Set `true` or a label name to enable.
* `comment-on-empty` - post a comment to PR when no tests added. Can be either boolean (for neutral message) or a custom message within a comment (markdown supported)
* `close-on-empty` - close PR when no tests added. Use with `comment-on-empty` to clarify this action
* `comment-on-skipped` - add custom message when new tests are skipped (markdown supported).
* `close-on-skipped` - close PR when introduced skipped tests. Use with `comment-on-skipped` to clarify this action
* `enable-documentation` - If set to `true`, test document will be created in wiki.
* `wiki-doc-name` - Name of the wiki document. By default it will use `Test Document`
* `documentation-branch` - Branch to create document on push. Uses default branch if this field is empty
* `github-pat` - Github Private access token to create document in wiki.


### Examples

#### For creating test document

This example uses jest as example. Tests are located in `tests/` directory. You can generate GH_PAT [here](https://github.com/settings/tokens/new) and add the generated token in secrets of your repo.

If documentation branch is not provided, it will consider default branch of the repo.

```yml
steps:
  - uses: actions/checkout@v2
    with:
      fetch-depth: 0
  - uses: actions/setup-node@v1
    with:
      node-version: '12'
  - run: npm install
  - uses: testomatio/check-tests@stable
    with:
      framework: jest
      tests: "tests/*.spec.js"
      token: ${{ secrets.GITHUB_TOKEN }}
      github-pat: ${{ secrets.GH_PAT }}
      enable-documentation: true
      wiki-doc-name: "Test-Document"
      documentation-branch: "doc-branch"
```

#### Jest 

Jest tests located in `tests/` directory:

```yml
steps:
  - uses: actions/checkout@v2
    with:
      fetch-depth: 0
  - uses: testomatio/check-tests@stable
    with:
      framework: jest
      tests: tests/**.spec.js
      token: ${{ secrets.GITHUB_TOKEN }}
      comment-on-empty: true       
      has-tests-label: true
```

* list all tests even no tests were added
* add label if tests were added

#### Cypress.io

Cypress.io tests located in `cypress/integration` directory:

```yml
steps:
  - uses: actions/checkout@v2
    with:
      fetch-depth: 0
  - uses: testomatio/check-tests@stable
    with:
      framework: cypress.io
      tests: cypress/integration/**.js
      token: ${{ secrets.GITHUB_TOKEN }}
      comment-on-empty: true 
      has-tests-label: true
```

* list all tests even no tests were added
* add label if tests were added

#### CodeceptJS

CodeceptJS tests located in `tests` directory:

```yml
steps:
  - uses: actions/checkout@v2
    with:
      fetch-depth: 0
  - uses: testomatio/check-tests@stable
    with:
      framework: codeceptjs
      tests: tests/**_test.js
      token: ${{ secrets.GITHUB_TOKEN }}
      comment-on-empty: true          
      has-tests-label: true      
```

* list all tests even no tests were added
* add label if tests were added

#### Protractor

Protractor tests located in `spec` directory:

```yml
steps:
  - uses: actions/checkout@v2
    with:
      fetch-depth: 0
  - uses: testomatio/check-tests@stable
    with:
      framework: protractor
      tests: spec/**.spec.js
      token: ${{ secrets.GITHUB_TOKEN }}
      comment-on-empty: true       
      has-tests-label: true      
```

* list all tests even no tests were added
* add label if tests were added

#### Protractor with TypeScript

Protractor tests located in `spec` directory:

```yml
steps:
  - uses: actions/checkout@v2
    with:
      fetch-depth: 0
  - uses: testomatio/check-tests@stable
    with:
      framework: protractor
      tests: spec/**.spec.ts
      token: ${{ secrets.GITHUB_TOKEN }}
      typescript: true
```


#### Mocha 

Mocha tests located in `tests/` directory:

```yml
steps:
  - uses: actions/checkout@v2
    with:
      fetch-depth: 0
  - uses: testomatio/check-tests@stable
    with:
      framework: mocha
      tests: tests/**_test.js
      token: ${{ secrets.GITHUB_TOKEN }}
      no-tests-label: Tests Needed
```

#### Testcafe 

Testcafe tests located in `tests/` directory:

```yml
steps:
  - uses: actions/checkout@v2
    with:
      fetch-depth: 0
  - uses: testomatio/check-tests@stable
    with:
      framework: testcafe
      tests: tests/**/*.js
      token: ${{ secrets.GITHUB_TOKEN }}
      no-tests-label: Tests Needed

#### Close PRs without tests

When PR doesn't contain tests - close it and write a message

```yml
steps:
  - uses: actions/checkout@v2
    with:
      fetch-depth: 0
  - uses: testomatio/check-tests@stable
    with:
      framework: protractor
      tests: spec/**_spec.js
      token: ${{ secrets.GITHUB_TOKEN }}
      comment-on-empty: "## PRs without tests not allowed"
      close-on-empty: true
```

#### Notify on skipped tests

When PR contains skipped tests - close it and write a message

```yml
steps:
  - uses: actions/checkout@v2
    with:
      fetch-depth: 0
  - uses: testomatio/check-tests@stable
    with:
      framework: protractor
      tests: spec/**_spec.js
      token: ${{ secrets.GITHUB_TOKEN }}
      comment-on-skipped: "## Don't mark tests as skipped!"
      close-on-skipped: true
```

## CLI

Use this checker as CLI tool with any Continuous Integration service.

Run `check-tests` via npx:

```sh
npx check-tests <framework> "<tests>" --no-skipped
```

### Development

To change host of endpoint for receiving data, and set it to other than app.testomat.io use TESTOMATIO_URL environment variable:

TESTOMATIO_URL=http://beta.testomat.io


> This checker will fail a build if exclusive tests (with `.only` or `fit` or `fdescribe` found)

### Arguments:

* test framework
* glob pattern to match tests in a project, example: `tests/**_test.js'`. **It is important to include glob pattern in double quotes `"` so wildcard could be used correctly.**   

### CLI Options:

* `--no-skipped` - fail when skipped tests found
* `--typescript` - enable typescript support
* `-g, --generate-file <fileName>` - Export test details to document
* `-u, --url <url>`, Github URL to get file link (URL/tree/master)

### Example

To generate test document
```
check-tests mocha "tests/*_test.js" -g Test-doc.md -u https://github.com/testomatio/check-tests/tree/master
```

Check tests for CodeceptJS

```
npx check-tests codeceptjs "tests/**_test.js"
```

Check tests for Protractor

```
npx check-tests protractor "spec/**.spec.js"
```

Check tests for Protractor with TypeScript

```
npx check-tests protractor "spec/**.spec.ts" --typescript
```

Check tests for Cypress.io

```
npx check-tests cypress "cypress/integration/**.js"
```

Check tests for Testcafe

```
npx check-tests testcafe "tests/**.js"
```

### Sample Output

List CodeceptJS tests

![](https://user-images.githubusercontent.com/24666922/78563263-505d1280-7838-11ea-8fbc-18e942d48485.png)

When found `.only` test:

```
✗ npx check-tests mocha "test/**/**_test.js"

[[ Tests checker by testomat.io ]]
Error: Exclusive tests detected. `.only` call found in test/checkout/important_test.js:290
Remove `.only` to restore test checks

```

## Limitations

* Can't analyze included tests from external files
* Can't analyze dynamically created tests

## License MIT

Part of [Testomat.io](https://testomat.io)

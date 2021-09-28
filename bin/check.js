#!/usr/bin/env node
const fs = require('fs');
const Analyzer = require('../src/analyzer');
const Reporter = require('../src/reporter');
const chalk = require('chalk');
const document = require('../src/document');
const { cleanIds, updateIds } = require('../src/updateIds');
const { spawn } = require('child_process');
const apiKey = process.env['INPUT_TESTOMATIO-KEY'] || process.env['TESTOMATIO'];
const branch = process.env.TESTOMATIO_BRANCH;

const { version } = require('../package.json');
console.log(chalk.cyan.bold(` 🤩 Tests checker by Testomat.io v${version}`));

function checkPattern(pattern) {
  pattern = pattern.trim();
  if (!pattern) return true;
  if (pattern == '.') return true;
  return pattern.includes('*');
}

const program = require('commander');

program
  .arguments('<framework> <files>')
  .option('-d, --dir <dir>', 'test directory')
  .option('--no-skipped', 'throw error if skipped tests found')
  .option('--typescript', 'enable typescript support')
  .option('--sync', 'import tests to testomatio and wait for completion')
  .option('-g, --generate-file <fileName>', 'Export test details to a document')
  .option('-u, --url <url>', 'Github URL to get files (URL/tree/master)')
  .option('-p, --plugins [plugins...]', 'additional babel plugins')
  .option('--no-detached', 'Don\t mark all unmatched tests as detached')
  .option('--update-ids', 'Update test and suite with testomatio ids')
  .option('--keep-structure', 'Prefer structure of source code over structure in Testomat.io')
  .option('--purge, --unsafe-clean-ids', 'Remove testomatio ids from test and suite without server verification')
  .option('--clean-ids', 'Remove testomatio ids from test and suite')
  .action(async (framework, files, opts) => {
    const isPattern = checkPattern(files);
    const analyzer = new Analyzer(framework, opts.dir || process.cwd());
    try {
      if (opts.typescript) {
        try {
          require.resolve('@babel/plugin-transform-typescript');
          require.resolve('@babel/core');
        } catch {
          console.log('Installing TypeScript modules...');
          await install(['@babel/core', '@babel/plugin-transform-typescript']);
        }
        analyzer.withTypeScript();
      }
      if (opts.plugins) {
        if (!Array.isArray(opts.plugins)) {
          opts.plugins = [opts.plugins];
        }
        opts.plugins.forEach(p => analyzer.addPlugin(p));
      }
      analyzer.analyze(files);
      if (opts.cleanIds || opts.unsafeCleanIds) {
        let idMap = {};
        if (apiKey) {
          const reporter = new Reporter(apiKey.trim(), framework);
          idMap = await reporter.getIds();
        } else if (opts.cleanIds) {
          console.log(' ✖️  API key not provided');
          return;
        }
        const files = cleanIds(analyzer.rawTests, idMap, opts.dir || process.cwd(), {
          ...opts,
          dangerous: opts.unsafeCleanIds,
        });
        console.log(`    ${files.length} files updated.`);
        return;
      }

      const decorator = analyzer.getDecorator();
      if (opts.url) {
        decorator.fileLink = opts.url;
      }
      const skipped = decorator.getSkippedTests();
      let list = analyzer.getDecorator().getTextList();
      list = list.map(l => (l === '-----' ? chalk.bold('_______________________\n') : l)).join('\n');
      console.log(chalk.bold.white(`\nSHOWING ${framework.toUpperCase()} TESTS FROM ${files}:`));
      console.log(list);
      if (skipped.length) {
        console.log(chalk.bold.yellow(`\nSKIPPED ${skipped.length} TESTS:\n`));
        skipped.forEach(t => console.log(`- ${chalk.bold(t.name)} ${chalk.grey(`${t.file}:${t.line}`)}`));
      }
      if (decorator.count()) {
        console.log(chalk.bold.green(`\n\nTOTAL ${decorator.count()} TESTS FOUND\n`));

        if (opts.generateFile) {
          console.log(opts.generateFile);
          document
            .createTestDoc(opts.generateFile, decorator)
            .then(() => console.log(`📝 Document saved to ${opts.generateFile}`))
            .catch(err => console.log('Error in creating test document', err));
        }
        if (apiKey) {
          const reporter = new Reporter(apiKey.trim(), framework);
          reporter.addTests(decorator.getTests());
          const resp = reporter.send({
            sync: opts.sync || opts.updateIds,
            branch,
            'no-detach': !isPattern || !opts.detached,
            structure: opts.keepStructure,
          }); // async call
          if (opts.sync) {
            console.log('    Wait for Testomatio to synchronize tests...');
            await resp;
          }
          if (opts.updateIds) {
            if (branch) {
              console.log('To avoid conflicts, --update-ids is disabled in a branch. Skipping...');
              return;
            }
            await resp;
            console.log('    Updating test ids in the source code...');
            analyzer.rawTests = [];
            analyzer.analyze(files);
            if (apiKey) {
              const reporter = new Reporter(apiKey.trim(), framework);
              await reporter.getIds().then(idMap => {
                const files = updateIds(analyzer.rawTests, idMap, opts.dir || process.cwd(), opts);
                console.log(`    ${files.length} files updated.`);
              });
            } else {
              console.log(' ✖️  API key not provided');
            }
            return;
          }
        } else {
          console.log(' ✖️  API key not provided');
        }
      } else {
        console.log(" ✖️  Can't find any tests in this folder\n");
        console.log(
          'Change file pattern or directory to scan to find test files:\n\nUsage: npx check-tests < pattern > -d[directory]',
        );
      }

      if (!opts.skipped && skipped.length) {
        throw new Error('Skipped tests found, failing...');
      }
    } catch (err) {
      console.error(chalk.red(err));
      console.error(err.stack);
      process.exit(1);
    }
  });

if (process.argv.length <= 2) {
  program.outputHelp();
}

program.parse(process.argv);

async function install(dependencies, verbose) {
  return new Promise((resolve, reject) => {
    let command;
    let args;

    console.log('Installing extra packages: ', chalk.green(dependencies.join(', ')));

    if (fs.existsSync('yarn.lock')) {
      // use yarn
      command = 'yarnpkg';
      args = ['add', '-D', '--exact'];
      [].push.apply(args, dependencies);
    } else {
      command = 'npm';
      args = ['install', '--save-dev', '--loglevel', 'error'].concat(dependencies);
    }

    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', code => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(' ')}`,
        });
        return;
      }
      resolve();
    });
  });
}

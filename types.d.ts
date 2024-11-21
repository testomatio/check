export type Test = {
  // name of a test
  name: string;
  // name of a test if it contains special chars
  rawName?: string;
  // list of suites to which test belongs to
  // usually it is one suite which is in descirbe() block
  // but it can be nested suites e.g. ['suite1', 'suite2']
  //
  suites: string[];
  // a point where the test title is located in source code and we can insert Test ID string
  updatePoint: {
    line: number;
    column: number;
  };
  // line where test is located
  line: number;
  // source code of a test
  code: string;
  // if a test is skipped
  skipped?: boolean;
  // file name of a test, relative to root
  file: string;
};

export type ImportTests = {
  // should we create a tests if they are not matched
  create?: boolean;
  // option to clean up empty suite
  noempty?: boolean;
  // do not mark not found tests as detached
  'no-detach'?: boolean;
  // list of test data
  tests: Test[];
};

export type Analyzer = {
  // name of a framework
  framework: string;
  // path to test dir
  workDir?: string;
  // options (as {noHooks: true})
  opts?: object;
};

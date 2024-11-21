it.each(['src/router/index.js']).only('only: %i file should exist (it.each)', (n) => {
  expect(files[n]).toBeTruthy();
});

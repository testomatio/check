fixture`Getting Started`
  .page`http://devexpress.github.io/testcafe/example`;

test('Add dev name success', async t => {
  await t
    .typeText('#developer-name', 'John Smith')
    .click('#submit-button');
});


test('Add dev name failed', async t => {
  await t
    .typeText('#developer-name', 'John Smith')
    .click('#submit-button1');
});

test.skip('Skipped test', () => { });

test(`Title with template literal`, async t => {
  await t.typeText('#developer-name', 'John Smith');
})

test.before(() => {
  console.log('Before test')
})('Test with before hook', async t => {
  await t.typeText('#developer-name', 'John Smith');
});
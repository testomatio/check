var assert = require('assert');

// Create a test suite (group) called Math
describe(`Feature`, function() {
  it(`should test`, function(){
    // Our actual test: 3*3 SHOULD EQUAL 9
    assert.equal(9, 3*3);
  });

  xit(`should skip`, function() {
    assert.equal(9, 3*3);
  })

  skip.it(`should also skip`, function() {
    assert.equal(9, 3*3);
  })
});

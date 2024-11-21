var assert = require('assert');

// Create a test suite (group) called Math
describe('Math', function() {
  it('should test', function(){
    // Our actual test: 3*3 SHOULD EQUAL 9
    assert.equal(9, 3*3);
  });
});

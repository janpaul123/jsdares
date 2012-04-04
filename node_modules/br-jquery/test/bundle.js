var browserify = require('browserify'),
    jq = require('../');

describe('bundle', function() {
  it('should properly bundle *full* and *mini*', function() {
    var full = browserify().use(jq).bundle(),
        mini = browserify().use(jq.min).bundle();
    mini.length.should.be.above(10000);
    full.length.should.be.above(10000);
    (full.length - mini.length).should.be.above(10000);
  });
});

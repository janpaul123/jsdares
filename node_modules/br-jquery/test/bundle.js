var browserify = require('browserify'),
    br_jquery = require('../');

describe('bundle', function() {
  it('should properly bundle *full*', function() {
    var full = browserify().use(br_jquery).bundle();
    full.length.should.be.above(10000);
    full.should.not.include('1.6.4');
  });
  it('should properly bundle *mini*', function() {
    var mini = browserify().use(br_jquery.min).bundle();
    mini.length.should.be.above(10000);
  });
  it('*full* should be larger than *mini*', function() {
    var full = browserify().use(br_jquery).bundle(),
        mini = browserify().use(br_jquery.min).bundle();
    (full.length - mini.length).should.be.above(10000);
  });
  it('should properly bundle 1.6.4', function() {
    var old = browserify().use(br_jquery({version: '1.6.4'})).bundle();
    old.length.should.be.above(10000);
    old.should.include('1.6.4');
  });
});

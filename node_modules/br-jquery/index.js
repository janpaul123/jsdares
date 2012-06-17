// is a middleware, and makes a middleware if it's passed options.
function jquery(b) {
  if (typeof b === 'function' && typeof b.require === 'function') {
    b.require('jquery', {file: __dirname + '/browser.js'});
  } else {
    return custom(b || {});
  }
}

function custom(opts) {
  var version = opts.version || ''
    , min     = opts.min === true ? '.min' : '';
  if (typeof opts.version === 'string' && opts.version !== '1.7.2') {
    version = '-' + version;
  } else {
    version = '';
  }
  return function(b) {
    b.require('jquery', {file: __dirname + '/browser' + version + min + '.js'});
  }
}

jquery.min = jquery({min: true});

jquery.jquery = function() {
  return require(__dirname + '/jquery');
}

module.exports = jquery;

var request = require('request'),
    fs      = require('fs');

function saveWrapped(url, file, wrapper) {
  request('http://code.jquery.com/' + url, function(err, resp, body) {
    var wrapped = wrapper
      .toString()
      .split(/\s+\/\/--cut--\s+/)[1]
      .replace('//--jquery--', body);
    fs.writeFileSync(file, wrapped + "\n");
  });
}

saveWrapped('jquery-1.6.4.js',     'browser-1.6.4.js',     browserWrapper);
saveWrapped('jquery-1.6.4.min.js', 'browser-1.6.4.min.js', browserWrapper);
saveWrapped('jquery-1.7.2.js',     'browser.js',           browserWrapper);
saveWrapped('jquery-1.7.2.min.js', 'browser.min.js',       browserWrapper);
saveWrapped('jquery-1.7.2.js',     'jquery.js',            nodeWrapper);

// these are the headers and footers, taken from the *jquery* npm package

function browserWrapper() {
//--cut--

(function () {
function create(window) {
  var location, navigator, XMLHttpRequest;

//--jquery--

  window.jQuery.noConflict();
  return window.jQuery;
}
module.exports = create('undefined' === typeof window ? undefined : window);
module.exports.create = create;
}());

//--cut--
}

function nodeWrapper() {
//--cut--

(function () {
function create(window) {
  var location, navigator, XMLHttpRequest;

  window = window || require('jsdom').jsdom().createWindow();
  location = window.location || require('location');
  navigator = window.navigator || require('navigator');

  if (!window.XMLHttpRequest && 'function' !== typeof window.ActiveXObject) {
    window.XMLHttpRequest = require('xmlhttprequest'); // require('XMLHttpRequest');
    // TODO repackage XMLHttpRequest
  }

  // end npm / ender header

//--jquery--

  // begin npm / ender footer
  window.jQuery.noConflict();
  return window.jQuery;
}
module.exports = create('undefined' === typeof window ? undefined : window);
module.exports.create = create;
}());

//--cut--
}


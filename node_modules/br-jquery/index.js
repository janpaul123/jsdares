function jquery(b) {
  b.require({jquery: __dirname + '/browser'})
}

jquery.min = function(b) {
  b.require({jquery: __dirname + '/browser.min'})
}

jquery.jquery = function() {
  return require(__dirname + '/jquery');
}

module.exports = jquery;

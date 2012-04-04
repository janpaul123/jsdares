var app = require('express').createServer(),
    fs  = require('fs'),
    browserify = require('browserify');

var html = fs.readFileSync(__dirname + '/index.html', 'utf8'),
    js = browserify({
      require: {jquery: 'br-jquery'},
      entry: 'hello.js'
    }).bundle();

app.get('/', function(req, res) {
  res.send(html);
});

app.get('/bundle.js', function(req, res) {
  res.header('Content-Type', 'text/javascript');
  res.send(js);
});

app.listen(5000, function() {
  console.log('listening on port 5000...');
});

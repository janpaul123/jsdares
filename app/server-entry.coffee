# Use PORT for Heroku
process.env.PORT = process.env.PORT or 3000

require('./server-connect-grunt').listen process.env.PORT

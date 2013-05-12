server = {}

require('./server.middleware')(server)
require('./server.common')(server)
require('./server.mailer')(server)
require('./server.api')(server)
require('./server.dares')(server)

module.exports = server

mongo = require('mongoskin')
uuid = require('node-uuid')
fs = require('fs')

mainUrls = ['intro', 'dare', 'edit', 'full', 'learn', 'create', 'superheroes', 'about', 'blindfold']

module.exports = (server) ->
  
  server.middleware = (connect, options) ->
    objects =
      database: mongo.db(options.mongodb)
      mailer: new server.Mailer(options.mailer)

    objects.common = new server.Common(options.api, objects)
    objects.api = new server.API(options.api, objects)
    
    objects.database.bind 'users'
    objects.database.bind 'collections'
    objects.database.bind 'dares'
    objects.database.bind 'instances'
    
    noCache = (req, res, next) ->
      res.on 'header', (header) ->
        res.setHeader 'Cache-Control', 'private, max-age=0'
        res.setHeader 'Expires', 'Thu, 01 Jan 1970 00:00:00 GMT'
        res.setHeader 'Pragma', 'no-cache'
      next()

    indexFile = fs.readFileSync(options.assets + '/index.html').toString()
    
    objects.database.open (err, db) ->
      if err
        console.log 'MongoDB error:', err
        process.exit 1

    server.dares objects.database
    
    app = connect()
    if options.logs.requests
      app.use connect.logger('tiny')
    
    app
      .use(noCache)
      .use(objects.common.getMiddleware())
      .use('/api', objects.api.getMiddleware())
      .use '', (req, res, next) ->
        if mainUrls.indexOf(req.url.split('/')[1] || 'intro') >= 0 || req.url == '/'
          req.url = '/index.html'
        next()
      .use '/index.html', (req, res, next) ->
        loginData = req.session?.loginData? || {}
        res.write indexFile.replace('{/*AUTOFILL in server.init.js*/}', JSON.stringify(loginData))
        res.end()
      .use connect['static'](options.assets)

    app

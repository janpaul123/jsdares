connect = require("connect")
uuid = require("node-uuid")
crypto = require("crypto")
_ = require("underscore")

localAuth =
  iterations: 30000
  keyLen: 128

module.exports = (server) ->
  class server.Common

    constructor: (options, objects) ->
      @options = options
      @db = objects.database

    getMiddleware: ->
      connect()
        .use(connect.cookieParser(@options.cookieSecret))
        .use(connect.cookieSession())
        .use @setUserId.bind(this)

    setUserId: (req, res, next) ->
      try
        pause = connect.utils.pause(req)
        newUserId = =>
          req.session.userId = uuid.v4()
          this.db.users.insert {_id: req.session.userId, createdTime: new Date(), ips: {initial: this.getIP(req)}}, {safe: true}, (error, users) =>
            if error
              this.error req, res, 500, "setUserId error: " + error
              pause.resume()
            else
              console.log "New session: " + req.session.userId

              req.session.loginData =
                userId: req.session.userId
                admin: false

              next()
              pause.resume()

        if req.session.userId
          this.db.users.findById req.session.userId, (error, user) =>
            if error
              this.error req, res, 500, "setUserId error: " + error
              pause.resume()
            else unless user
              newUserId()
            else
              if user.auth && user.auth.local
                req.session.loginData =
                  userId: req.session.userId
                  loggedIn: true
                  screenname: user.screenname
                  points: 0
                  link: user.link
              else
                req.session.loginData = userId: req.session.userId

              req.session.loginData.admin = user.admin || false
              next()
              pause.resume()
        else
          newUserId()
      catch error
        this.error req, res, 500, "setUserId error: " + error
        pause.resume()

    getIP: (req) ->
      req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.connection.remoteAddress

    error: (req, res, code, error) ->
      error = JSON.stringify(error)
      body = JSON.stringify(req.body)

      if @options.errors[code]
        console.error code + " @ " + req.method + ": " + req.originalUrl + " @ BODY: " + body + " USER: " + req.session.userId + ((if error then (" @ ERROR: " + error) else ""))
      res.statusCode = code

      if code == 400
        res.end "Input error: " + error
      else if code == 401
        res.end "Not authorized"
      else if code == 404
        res.end "Not found"
      else if code == 500
        res.end "Server error: " + error  
